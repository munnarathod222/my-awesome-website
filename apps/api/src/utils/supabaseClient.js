import https from 'node:https';
import http from 'node:http';

/**
 * JAI BHAVANI CARGO - RUNTIME SUPABASE POSTGREST ADAPTER
 *
 * Provides a drop-in runtime database client implementing the PocketBase collection API
 * (.getOne, .getList, .getFullList, .create, .update, .delete) over Supabase PostgREST.
 * Never exposes service-role keys to frontend or mobile clients.
 */

export function createSupabaseClient({ url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY } = {}) {
  if (!url || !key) return null;

  const baseUrl = new URL(url);

  async function request(endpoint, method = 'GET', body = null, extraHeaders = {}) {
    const fullUrl = new URL(endpoint, baseUrl);
    const isHttps = fullUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    const postData = body ? JSON.stringify(body) : null;

    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

    return new Promise((resolve, reject) => {
      const req = client.request({
        hostname: fullUrl.hostname,
        port: fullUrl.port || (isHttps ? 443 : 80),
        path: `${fullUrl.pathname}${fullUrl.search}`,
        method,
        headers,
        timeout: 15000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 400) {
            const err = new Error(`Supabase Error (${res.statusCode}) on ${endpoint}: ${data}`);
            err.status = res.statusCode;
            return reject(err);
          }
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data ? JSON.parse(data) : null
            });
          } catch (_) {
            resolve({ status: res.statusCode, headers: res.headers, data });
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
        const res = await request(`/rest/v1/${tableName}?id=eq.${encodeURIComponent(id)}&select=*`, 'GET', null, {
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

        let queryPath = `/rest/v1/${tableName}?select=*`;
        if (options.sort) {
          const order = options.sort.startsWith('-') ? `${options.sort.slice(1)}.desc` : `${options.sort}.asc`;
          queryPath += `&order=${encodeURIComponent(order)}`;
        }

        const res = await request(queryPath, 'GET', null, {
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
        const res = await this.getList(1, 1000, options);
        return res.items;
      },

      async create(data) {
        const payload = {
          id: data.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...data,
          created: data.created || new Date().toISOString(),
          updated: new Date().toISOString()
        };
        const res = await request(`/rest/v1/${tableName}`, 'POST', payload, {
          'Prefer': 'return=representation'
        });
        return Array.isArray(res.data) ? res.data[0] : res.data;
      },

      async update(id, data) {
        const payload = {
          ...data,
          updated: new Date().toISOString()
        };
        const res = await request(`/rest/v1/${tableName}?id=eq.${encodeURIComponent(id)}`, 'PATCH', payload, {
          'Prefer': 'return=representation'
        });
        if (!Array.isArray(res.data) || res.data.length === 0) {
          const err = new Error(`Record not found in ${tableName} with ID ${id}`);
          err.status = 404;
          throw err;
        }
        return res.data[0];
      },

      async delete(id) {
        await request(`/rest/v1/${tableName}?id=eq.${encodeURIComponent(id)}`, 'DELETE');
        return true;
      }
    };
  }

  return {
    collection,
    request,
    isSupabase: true
  };
}

export function getRuntimeDatabaseClient(pocketbaseFallbackClient) {
  const mode = process.env.DATA_STORE;
  if (mode === 'supabase' || (!mode && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    const sb = createSupabaseClient();
    if (sb) return sb;
  }
  return pocketbaseFallbackClient;
}
