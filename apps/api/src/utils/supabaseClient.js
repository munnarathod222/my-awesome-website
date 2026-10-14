import https from 'node:https';
import http from 'node:http';
import crypto from 'node:crypto';

/**
 * JAI BHAVANI CARGO - RUNTIME SUPABASE POSTGREST & STORAGE ADAPTER
 *
 * Implements the PocketBase collection API over Supabase PostgREST with:
 * - Explicit safe query filter translation (fails closed on unsupported syntax)
 * - Compound sorting (e.g. -date,-id -> date.desc,id.desc)
 * - True multi-page pagination in getFullList
 * - Conditional atomic updates (optimistic concurrency control)
 * - Supabase Storage file management
 * - Strict requirement of DATA_STORE=supabase for activation (no accidental auto-switch)
 */

export function isSupabaseCutoverActive() {
  return process.env.DATA_STORE === 'supabase';
}

function translateSingleCondition(cleanTerm) {
  if (cleanTerm.includes(';') || cleanTerm.includes('--')) {
    throw new Error(`UNSUPPORTED_FILTER: Semicolons and SQL comments are not permitted in filter: "${cleanTerm}"`);
  }

  // Pattern: field operator value
  // Operator: =, !=, >=, <=, >, <, ~, !~
  const match = cleanTerm.match(/^([a-zA-Z0-9_]+)\s*(=|!=|>=|<=|>|<|~|!~)\s*(.*)$/);
  if (!match) {
    throw new Error(`UNSUPPORTED_FILTER: Cannot safely translate filter expression: "${cleanTerm}"`);
  }

  const field = match[1];
  const op = match[2];
  let rawVal = match[3].trim();

  let isQuoted = false;
  if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
    rawVal = rawVal.slice(1, -1);
    isQuoted = true;
  }

  if (!isQuoted) {
    if (!/^-?[0-9]+(\.[0-9]+)?$/.test(rawVal) &&
        !/^(true|false|null)$/.test(rawVal) &&
        !/^[a-zA-Z0-9_.:-]+$/.test(rawVal)) {
      throw new Error(`UNSUPPORTED_FILTER: Invalid unquoted literal in filter: "${cleanTerm}"`);
    }
  }

  // Null handling
  if (!isQuoted && (rawVal === 'null' || rawVal === '')) {
    if (rawVal === 'null') {
      if (op === '=') return { field, postgrestCond: 'is.null' };
      if (op === '!=') return { field, postgrestCond: 'not.is.null' };
      throw new Error(`UNSUPPORTED_FILTER: Unsupported null operator "${op}" in "${cleanTerm}"`);
    }
  }

  // Empty string handling
  if (isQuoted && rawVal === '') {
    if (op === '=') return { field, postgrestCond: 'eq.' };
    if (op === '!=') return { field, postgrestCond: 'neq.' };
  }

  // Boolean literals
  if (!isQuoted && (rawVal === 'true' || rawVal === 'false')) {
    if (op === '=') return { field, postgrestCond: `is.${rawVal}` };
    if (op === '!=') return { field, postgrestCond: `not.is.${rawVal}` };
  }

  let pgOp;
  let pgVal = rawVal;

  switch (op) {
    case '=':
      pgOp = 'eq';
      break;
    case '!=':
      pgOp = 'neq';
      break;
    case '>=':
      pgOp = 'gte';
      break;
    case '<=':
      pgOp = 'lte';
      break;
    case '>':
      pgOp = 'gt';
      break;
    case '<':
      pgOp = 'lt';
      break;
    case '~':
      pgOp = 'ilike';
      pgVal = `*${rawVal}*`;
      break;
    case '!~':
      pgOp = 'not.ilike';
      pgVal = `*${rawVal}*`;
      break;
    default:
      throw new Error(`UNSUPPORTED_FILTER: Unsupported operator "${op}" in "${cleanTerm}"`);
  }

  return { field, postgrestCond: `${pgOp}.${pgVal}` };
}

/**
 * Translate PocketBase filter strings into PostgREST query parameters.
 * FAILS CLOSED: If any portion of the filter cannot be safely and accurately translated,
 * throws an Error to prevent unauthorized unfiltered data access.
 * Preserves repeated fields (e.g. date >= ... && date <= ...) without overwriting.
 * Handles null checks (is.null, not.is.null), empty strings, and supported AND/OR expressions.
 */
export function translatePbFilterToPostgrest(filterStr) {
  if (!filterStr || typeof filterStr !== 'string') return {};
  const trimmed = filterStr.trim();
  if (!trimmed) return {};

  const queryParams = {};

  function addParam(k, v) {
    if (Object.prototype.hasOwnProperty.call(queryParams, k)) {
      if (Array.isArray(queryParams[k])) {
        queryParams[k].push(v);
      } else {
        queryParams[k] = [queryParams[k], v];
      }
    } else {
      queryParams[k] = v;
    }
  }

  const andTerms = trimmed.split(/\s+&&\s+/);
  for (const andTerm of andTerms) {
    let cleanTerm = andTerm.trim();
    if (!cleanTerm) continue;

    if (cleanTerm.startsWith('(') && cleanTerm.endsWith(')')) {
      cleanTerm = cleanTerm.slice(1, -1).trim();
    }

    if (cleanTerm.includes('||')) {
      const orParts = cleanTerm.split(/\s+\|\|\s+/);
      const orConds = [];
      for (const part of orParts) {
        const sub = part.trim();
        if (!sub) continue;
        const { field, postgrestCond } = translateSingleCondition(sub);
        orConds.push(`${field}.${postgrestCond}`);
      }
      if (orConds.length > 0) {
        addParam('or', `(${orConds.join(',')})`);
      }
    } else {
      const { field, postgrestCond } = translateSingleCondition(cleanTerm);
      addParam(field, postgrestCond);
    }
  }

  return queryParams;
}

/**
 * Translate PocketBase sort expression into PostgREST order parameter.
 * Handles single or compound sorts like: "-date,-id" -> "date.desc,id.desc"
 */
export function translateSortToPostgrest(sortStr) {
  if (!sortStr || typeof sortStr !== 'string') return null;
  const parts = sortStr.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const clauses = parts.map(part => {
    if (part.startsWith('-')) {
      const field = part.slice(1);
      if (!/^[a-zA-Z0-9_]+$/.test(field)) throw new Error(`Invalid sort field: ${field}`);
      return `${field}.desc`;
    } else {
      const field = part.startsWith('+') ? part.slice(1) : part;
      if (!/^[a-zA-Z0-9_]+$/.test(field)) throw new Error(`Invalid sort field: ${field}`);
      return `${field}.asc`;
    }
  });

  return clauses.join(',');
}

export function createSupabaseClient({ url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY } = {}) {
  if (!url || !key) return null;

  const baseUrl = new URL(url);

  async function request(endpoint, method = 'GET', body = null, extraHeaders = {}) {
    const fullUrl = new URL(endpoint, baseUrl);
    const isHttps = fullUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    const isBuffer = Buffer.isBuffer(body);
    const postData = isBuffer ? body : (body !== null && body !== undefined ? JSON.stringify(body) : null);

    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      ...(isBuffer ? { 'Content-Type': 'application/octet-stream' } : { 'Content-Type': 'application/json' }),
      ...extraHeaders
    };
    if (postData) {
      headers['Content-Length'] = isBuffer ? body.length : Buffer.byteLength(postData);
    }

    return new Promise((resolve, reject) => {
      const req = client.request({
        hostname: fullUrl.hostname,
        port: fullUrl.port || (isHttps ? 443 : 80),
        path: `${fullUrl.pathname}${fullUrl.search}`,
        method,
        headers,
        timeout: 20000
      }, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const rawBuffer = Buffer.concat(chunks);
          const rawText = rawBuffer.toString('utf8');

          if (res.statusCode >= 400) {
            const err = new Error(`Supabase Error (${res.statusCode}) on ${endpoint}: ${rawText}`);
            err.status = res.statusCode;
            return reject(err);
          }

          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            try {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: JSON.parse(rawText),
                buffer: rawBuffer
              });
            } catch (_) {
              resolve({ status: res.statusCode, headers: res.headers, data: rawText, buffer: rawBuffer });
            }
          } else {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: rawText,
              buffer: rawBuffer
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Supabase request timed out on ${endpoint}`));
      });
      if (postData) req.write(postData);
      req.end();
    });
  }

  function collection(tableName) {
    return {
      async getOne(id) {
        if (!id) {
          const err = new Error('Missing record ID');
          err.status = 400;
          throw err;
        }
        const res = await request(`/rest/v1/${encodeURIComponent(tableName)}?id=eq.${encodeURIComponent(id)}&select=*`, 'GET', null, {
          'Range': '0-0'
        });
        const rows = res.data;
        if (!Array.isArray(rows) || rows.length === 0) {
          const err = new Error(`Record not found in ${tableName} with ID ${id}`);
          err.status = 404;
          throw err;
        }
        return rows[0];
      },

      async getList(page = 1, perPage = 30, options = {}) {
        page = Math.max(1, Number(page) || 1);
        perPage = Math.max(1, Number(perPage) || 30);
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        const queryObj = new URLSearchParams();
        queryObj.set('select', options.fields || '*');

        // Explicit, safe filter handling (FAILS CLOSED)
        if (options.filter) {
          const filterParams = translatePbFilterToPostgrest(options.filter);
          for (const [k, v] of Object.entries(filterParams)) {
            if (Array.isArray(v)) {
              for (const item of v) {
                queryObj.append(k, item);
              }
            } else {
              queryObj.append(k, v);
            }
          }
        }

        // Compound sorting
        if (options.sort) {
          const orderParam = translateSortToPostgrest(options.sort);
          if (orderParam) queryObj.set('order', orderParam);
        }

        const res = await request(`/rest/v1/${encodeURIComponent(tableName)}?${queryObj.toString()}`, 'GET', null, {
          'Range': `${from}-${to}`,
          'Prefer': 'count=exact'
        });

        const items = Array.isArray(res.data) ? res.data : [];
        let totalItems = items.length;
        const cr = res.headers['content-range'];
        if (cr && cr.includes('/')) {
          totalItems = Number(cr.split('/')[1]) || items.length;
        }
        const totalPages = Math.ceil(totalItems / perPage);

        return {
          items,
          page,
          perPage,
          totalItems,
          totalPages
        };
      },

      async getFullList(options = {}) {
        const batchSize = 1000;
        let page = 1;
        let allItems = [];
        while (true) {
          const res = await this.getList(page, batchSize, options);
          allItems = allItems.concat(res.items);
          if (page >= res.totalPages || res.items.length === 0 || allItems.length >= res.totalItems) {
            break;
          }
          page++;
        }
        return allItems;
      },

      async create(data) {
        const payload = {
          id: data.id || `rec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          ...data,
          created: data.created || new Date().toISOString(),
          updated: new Date().toISOString()
        };
        const res = await request(`/rest/v1/${encodeURIComponent(tableName)}`, 'POST', payload, {
          'Prefer': 'return=representation'
        });
        return Array.isArray(res.data) ? res.data[0] : res.data;
      },

      async update(id, data) {
        const payload = {
          ...data,
          updated: new Date().toISOString()
        };
        const res = await request(`/rest/v1/${encodeURIComponent(tableName)}?id=eq.${encodeURIComponent(id)}`, 'PATCH', payload, {
          'Prefer': 'return=representation'
        });
        if (!Array.isArray(res.data) || res.data.length === 0) {
          const err = new Error(`Record not found in ${tableName} with ID ${id}`);
          err.status = 404;
          throw err;
        }
        return res.data[0];
      },

      /**
       * Atomic Conditional Update (Optimistic Concurrency Control)
       * Updates the record ONLY if all provided conditions match simultaneously.
       * If conditions do not match (e.g. concurrent reassignment or state conflict), fails with 409.
       */
      async conditionalUpdate(id, conditions = {}, data = {}) {
        const queryObj = new URLSearchParams();
        queryObj.set('id', `eq.${id}`);

        for (const [key, val] of Object.entries(conditions)) {
          if (val === null || val === undefined) {
            queryObj.set(key, 'is.null');
          } else if (typeof val === 'object' && val.or) {
            // Support OR condition in PostgREST
            queryObj.set('or', val.or);
          } else {
            queryObj.set(key, `eq.${val}`);
          }
        }

        const payload = {
          ...data,
          updated: new Date().toISOString()
        };

        const res = await request(`/rest/v1/${encodeURIComponent(tableName)}?${queryObj.toString()}`, 'PATCH', payload, {
          'Prefer': 'return=representation'
        });

        if (!Array.isArray(res.data) || res.data.length === 0) {
          const err = new Error(`Conditional update failed on ${tableName}: Record has been modified, reassigned, or is in an incompatible state.`);
          err.status = 409;
          err.code = 'CONCURRENT_CONFLICT';
          throw err;
        }
        return res.data[0];
      },

      async getFirstListItem(filter, options = {}) {
        const res = await this.getList(1, 1, { ...options, filter });
        if (!res.items || res.items.length === 0) {
          const err = new Error(`Record not found in ${tableName} matching filter: ${filter}`);
          err.status = 404;
          throw err;
        }
        return res.items[0];
      },

      async delete(id) {
        await request(`/rest/v1/${encodeURIComponent(tableName)}?id=eq.${encodeURIComponent(id)}`, 'DELETE');
        return true;
      }
    };
  }

  // Schema descriptor discovery for PocketBase collections API compatibility
  const collections = {
    async getOne(name) {
      if (name === 'trip_logs') {
        return {
          id: 'trip_logs',
          name: 'trip_logs',
          fields: [
            { name: 'driver_employee_id', type: 'relation', collectionId: 'employees', maxSelect: 1 },
            { name: 'driver_employee_code', type: 'text' }
          ]
        };
      }
      if (name === 'employees') {
        return {
          id: 'employees',
          name: 'employees',
          fields: [
            { name: 'id', type: 'text' },
            { name: 'driver_code', type: 'text' }
          ]
        };
      }
      if (name === 'expenses') {
        return {
          id: 'expenses',
          name: 'expenses',
          fields: [
            { name: 'submitted_by_employee_id', type: 'relation', collectionId: 'employees', maxSelect: 1 },
            { name: 'date', type: 'text' }
          ]
        };
      }
      return { id: name, name, fields: [] };
    }
  };

  /**
   * Safe filter interpolation compatible with pb.filter(template, params)
   */
  function filter(template, params = {}) {
    if (!template || typeof template !== 'string') return '';
    return template.replace(/\{:([a-zA-Z0-9_]+)\}/g, (match, key) => {
      if (!Object.prototype.hasOwnProperty.call(params, key)) return match;
      const val = params[key];
      if (val === null || val === undefined) return 'null';
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      return JSON.stringify(String(val));
    });
  }

  // Storage Methods
  const storage = {
    async upload(bucket, filePath, buffer, contentType = 'application/octet-stream') {
      const endpoint = `/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}`;
      const res = await request(endpoint, 'POST', buffer, {
        'Content-Type': contentType,
        'x-upsert': 'true'
      });
      return res;
    },

    async download(bucket, filePath) {
      const endpoint = `/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(filePath)}`;
      const res = await request(endpoint, 'GET');
      return {
        buffer: res.buffer,
        contentType: res.headers['content-type']
      };
    },

    async verifyHash(bucket, filePath, expectedSha256) {
      const downloaded = await this.download(bucket, filePath);
      const actualHash = crypto.createHash('sha256').update(downloaded.buffer).digest('hex');
      if (actualHash !== expectedSha256) {
        throw new Error(`Storage hash mismatch on ${bucket}/${filePath}: expected ${expectedSha256}, got ${actualHash}`);
      }
      return true;
    }
  };

  return {
    collection,
    collections,
    filter,
    storage,
    request,
    isSupabase: true
  };
}

/**
 * Returns the active runtime database client.
 * STRICT CUTOVER GUARD: Requires explicit reviewed setting process.env.DATA_STORE === 'supabase'.
 * Never automatically switches databases merely because credentials are present in env.
 */
export function getRuntimeDatabaseClient(pocketbaseFallbackClient) {
  if (isSupabaseCutoverActive()) {
    const sb = createSupabaseClient();
    if (sb) return sb;
  }
  return pocketbaseFallbackClient;
}
