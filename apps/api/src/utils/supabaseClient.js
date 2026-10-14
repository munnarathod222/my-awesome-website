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

function tokenizeFilter(input) {
  const tokens = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Two-character operators: &&, ||, !=, >=, <=, !~
    if (i + 1 < n) {
      const two = input.slice(i, i + 2);
      if (['&&', '||', '!=', '>=', '<=', '!~'].includes(two)) {
        tokens.push({ type: two, value: two, pos: i });
        i += 2;
        continue;
      }
    }

    // Single-character tokens: (, ), =, >, <, ~
    if (['(', ')', '=', '>', '<', '~'].includes(ch)) {
      tokens.push({ type: ch, value: ch, pos: i });
      i++;
      continue;
    }

    // String literals: "..." or '...'
    if (ch === '"' || ch === "'") {
      const quoteChar = ch;
      let strVal = '';
      let j = i + 1;
      let closed = false;

      while (j < n) {
        const c = input[j];
        if (c === '\\') {
          if (j + 1 < n) {
            const next = input[j + 1];
            if (next === quoteChar) {
              strVal += quoteChar;
              j += 2;
            } else if (next === '\\') {
              strVal += '\\';
              j += 2;
            } else if (next === 'n') {
              strVal += '\n';
              j += 2;
            } else if (next === 't') {
              strVal += '\t';
              j += 2;
            } else if (next === 'r') {
              strVal += '\r';
              j += 2;
            } else if (next === '"' || next === "'") {
              strVal += next;
              j += 2;
            } else {
              strVal += next;
              j += 2;
            }
          } else {
            throw new Error(`UNSUPPORTED_FILTER: Incomplete escape sequence in string at ${j}`);
          }
        } else if (c === quoteChar) {
          closed = true;
          j++;
          break;
        } else {
          strVal += c;
          j++;
        }
      }

      if (!closed) {
        throw new Error(`UNSUPPORTED_FILTER: Unterminated string literal starting at ${i}`);
      }

      tokens.push({ type: 'STRING', value: strVal, raw: input.slice(i, j), pos: i });
      i = j;
      continue;
    }

    // Semicolons or SQL comments: reject immediately (fail closed)
    if (ch === ';' || (ch === '-' && i + 1 < n && input[i + 1] === '-')) {
      throw new Error(`UNSUPPORTED_FILTER: Semicolons and SQL comments are not permitted in filter at position ${i}`);
    }

    // Word / literal / identifier / number
    let j = i;
    while (j < n && !/\s/.test(input[j]) && !['(', ')', '&', '|', '=', '!', '>', '<', '~', '"', "'", ';'].includes(input[j])) {
      j++;
    }
    const word = input.slice(i, j);
    if (!word) {
      throw new Error(`UNSUPPORTED_FILTER: Unexpected character "${input[i]}" at position ${i}`);
    }

    tokens.push({ type: 'WORD', value: word, pos: i });
    i = j;
  }

  return tokens;
}

function unwrapOuterParens(tokens) {
  let t = tokens;
  while (t.length >= 3 && t[0].type === '(' && t[t.length - 1].type === ')') {
    let depth = 0;
    let allWrapped = true;
    for (let i = 0; i < t.length - 1; i++) {
      if (t[i].type === '(') depth++;
      if (t[i].type === ')') depth--;
      if (depth === 0) {
        allWrapped = false;
        break;
      }
    }
    if (allWrapped) {
      t = t.slice(1, -1);
    } else {
      break;
    }
  }
  return t;
}

function formatPostgrestValue(val, isQuoted, inOrClause = false) {
  if (!isQuoted && (val === 'null' || val === '')) {
    return val;
  }

  if (inOrClause) {
    // Inside or=(...), reserved characters (commas, parentheses, quotes, backslashes)
    // must be safely enclosed in double-quotes and escaped according to PostgREST specification.
    if (/[,()"\\]/.test(val)) {
      const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
  }

  return val;
}

function translateCondition(fieldToken, opToken, valToken, inOrClause = false) {
  const field = fieldToken.value;
  if (!/^[a-zA-Z0-9_]+$/.test(field)) {
    throw new Error(`UNSUPPORTED_FILTER: Invalid field name "${field}"`);
  }

  const op = opToken.value;
  const isQuoted = valToken.type === 'STRING';
  const rawVal = valToken.value;

  if (!isQuoted) {
    if (!/^-?[0-9]+(\.[0-9]+)?$/.test(rawVal) &&
        !/^(true|false|null)$/.test(rawVal) &&
        !/^[a-zA-Z0-9_.:-]+$/.test(rawVal)) {
      throw new Error(`UNSUPPORTED_FILTER: Invalid unquoted literal in filter: "${rawVal}"`);
    }
  }

  // Null handling
  if (!isQuoted && (rawVal === 'null' || rawVal === '')) {
    if (rawVal === 'null') {
      if (op === '=') return { field, postgrestCond: 'is.null' };
      if (op === '!=') return { field, postgrestCond: 'not.is.null' };
      throw new Error(`UNSUPPORTED_FILTER: Unsupported null operator "${op}"`);
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
  let formattedVal = formatPostgrestValue(rawVal, isQuoted, inOrClause);

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
      formattedVal = `*${rawVal}*`;
      if (inOrClause && /[\s,()"\\]/.test(formattedVal)) {
        formattedVal = `"${formattedVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      break;
    case '!~':
      pgOp = 'not.ilike';
      formattedVal = `*${rawVal}*`;
      if (inOrClause && /[\s,()"\\]/.test(formattedVal)) {
        formattedVal = `"${formattedVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      break;
    default:
      throw new Error(`UNSUPPORTED_FILTER: Unsupported operator "${op}"`);
  }

  return { field, postgrestCond: `${pgOp}.${formattedVal}` };
}

// Split tokens by a binary operator (&& or ||) at current parenthesis level (depth 0)
function splitTokensByOp(tokens, targetOp) {
  const parts = [];
  let current = [];
  let parenDepth = 0;

  for (const t of tokens) {
    if (t.type === '(') {
      parenDepth++;
      current.push(t);
    } else if (t.type === ')') {
      parenDepth--;
      if (parenDepth < 0) throw new Error('UNSUPPORTED_FILTER: Unmatched closing parenthesis');
      current.push(t);
    } else if (parenDepth === 0 && t.type === targetOp) {
      if (current.length === 0) throw new Error(`UNSUPPORTED_FILTER: Dangling operator ${targetOp}`);
      parts.push(current);
      current = [];
    } else {
      current.push(t);
    }
  }

  if (parenDepth !== 0) throw new Error('UNSUPPORTED_FILTER: Unclosed parenthesis');
  if (current.length === 0 && parts.length > 0) throw new Error(`UNSUPPORTED_FILTER: Dangling operator ${targetOp}`);
  if (current.length > 0) parts.push(current);

  return parts;
}

// Check if a sequence of tokens at the current level mixes && and || without explicit parentheses
function checkMixedOperators(tokens) {
  let parenDepth = 0;
  let hasAnd = false;
  let hasOr = false;

  for (const t of tokens) {
    if (t.type === '(') parenDepth++;
    else if (t.type === ')') parenDepth--;
    else if (parenDepth === 0) {
      if (t.type === '&&') hasAnd = true;
      if (t.type === '||') hasOr = true;
    }
  }

  if (hasAnd && hasOr) {
    throw new Error('UNSUPPORTED_FILTER: Ambiguous operator precedence in mixed AND/OR expression without parentheses. Use explicit parentheses: e.g. (a = 1 || b = 2) && c = 3');
  }
}

function parseConditionTokens(tokens, inOrClause = false) {
  const t = unwrapOuterParens(tokens);

  if (t.length !== 3) {
    throw new Error(`UNSUPPORTED_FILTER: Invalid condition expression: ${t.map(x => x.raw || x.value).join(' ')}`);
  }

  return translateCondition(t[0], t[1], t[2], inOrClause);
}

function translateTokens(tokens) {
  if (tokens.length === 0) return {};

  const t = unwrapOuterParens(tokens);

  // 1. Enforce explicit grouping: reject unparenthesized mixed AND and OR
  checkMixedOperators(t);

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

  // 2. Check if top-level has &&
  const andParts = splitTokensByOp(t, '&&');
  if (andParts.length > 1) {
    for (const part of andParts) {
      const unwrapped = unwrapOuterParens(part);
      checkMixedOperators(unwrapped);
      const orParts = splitTokensByOp(unwrapped, '||');
      if (orParts.length > 1) {
        // Parenthesized OR inside AND: e.g. (a = 1 || b = 2)
        const orConds = [];
        for (const orPart of orParts) {
          const { field, postgrestCond } = parseConditionTokens(orPart, true);
          orConds.push(`${field}.${postgrestCond}`);
        }
        addParam('or', `(${orConds.join(',')})`);
      } else {
        const { field, postgrestCond } = parseConditionTokens(unwrapped, false);
        addParam(field, postgrestCond);
      }
    }
    return queryParams;
  }

  // 3. Check if top-level has ||
  const orParts = splitTokensByOp(t, '||');
  if (orParts.length > 1) {
    const orConds = [];
    for (const part of orParts) {
      const unwrapped = unwrapOuterParens(part);
      checkMixedOperators(unwrapped);
      const subAndParts = splitTokensByOp(unwrapped, '&&');
      if (subAndParts.length > 1) {
        // Parenthesized AND inside OR: e.g. (b = 2 && c = 3) inside OR
        const andConds = [];
        for (const subPart of subAndParts) {
          const { field, postgrestCond } = parseConditionTokens(subPart, true);
          andConds.push(`${field}.${postgrestCond}`);
        }
        orConds.push(`and(${andConds.join(',')})`);
      } else {
        const { field, postgrestCond } = parseConditionTokens(unwrapped, true);
        orConds.push(`${field}.${postgrestCond}`);
      }
    }
    addParam('or', `(${orConds.join(',')})`);
    return queryParams;
  }

  // 4. Single condition
  const { field, postgrestCond } = parseConditionTokens(t, false);
  addParam(field, postgrestCond);
  return queryParams;
}

/**
 * Translate PocketBase filter strings into PostgREST query parameters.
 * FAILS CLOSED: If any portion of the filter cannot be safely and accurately translated,
 * throws an Error to prevent unauthorized unfiltered data access.
 * Preserves repeated fields (e.g. date >= ... && date <= ...) without overwriting.
 * Handles null checks (is.null, not.is.null), empty strings, and supported AND/OR expressions.
 * Enforces quote-awareness: backslashes, commas, parentheses, quotes, and operator-like text
 * inside quoted literals are preserved and escaped accurately for PostgREST.
 * Rejects ambiguous unparenthesized mixed operator expressions (e.g. a = 1 || b = 2 && c = 3).
 */
export function translatePbFilterToPostgrest(filterStr) {
  if (!filterStr || typeof filterStr !== 'string') return {};
  const trimmed = filterStr.trim();
  if (!trimmed) return {};

  const tokens = tokenizeFilter(trimmed);
  return translateTokens(tokens);
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
    if (!sb) {
      throw new Error('DATA_STORE=supabase is set but Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing or invalid.');
    }
    return sb;
  }
  return pocketbaseFallbackClient;
}
