import logger from './logger.js';

let Pocketbase;
try {
  Pocketbase = (await import('pocketbase')).default;
} catch (_) {
  try {
    Pocketbase = (await import('../../../../apps/web/node_modules/pocketbase/dist/pocketbase.es.mjs')).default;
  } catch (e) {
    Pocketbase = class PocketbaseFallback {
      constructor(host) {
        this.host = host;
        this.authStore = { isValid: false, clear() {} };
      }
      autoCancellation() {}
      collection(name) {
        return {
          async getOne(id) { throw new Error(`PocketBase client not available`); },
          async getList() { throw new Error(`PocketBase client not available`); },
          async getFullList() { throw new Error(`PocketBase client not available`); }
        };
      }
      filter(tmpl, params = {}) {
        if (!tmpl) return '';
        return tmpl.replace(/\{:([a-zA-Z0-9_]+)\}/g, (match, key) => {
          if (!Object.prototype.hasOwnProperty.call(params, key)) return match;
          const val = params[key];
          if (val === null || val === undefined) return 'null';
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          return JSON.stringify(String(val));
        });
      }
    };
  }
}

const POCKETBASE_HOST = process.env.POCKETBASE_URL || process.env.POCKETBASE_HOST || `http://localhost:8090`;

async function waitForHealth({ retries = 30, delayMs = 1000 } = {}) {
  for (let i = 1; i <= retries; i++) {
    try {
      const response = await fetch(`${POCKETBASE_HOST}/api/health`, { method: 'HEAD' });
      if (response.ok) return;
    } catch {
      // PocketBase not reachable yet; retry below
    }
    logger.warn(`PocketBase not ready, retrying (${i}/${retries})...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`PocketBase health check failed after ${retries} retries`);
}

const pocketbaseClient = new Pocketbase(POCKETBASE_HOST);
if (typeof pocketbaseClient.autoCancellation === 'function') {
  pocketbaseClient.autoCancellation(false);
}

function getSuperuserCredentials() {
  const email = process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL;
  const password = process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD;
  if (!email || !password) {
    logger.warn('PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD must be configured in environment for automated superuser authentication');
    return null;
  }
  return { email, password };
}

let authPromise = null;

async function authenticateClient() {
  const creds = getSuperuserCredentials();
  if (!creds) return;
  pocketbaseClient.authStore.clear();
  try {
    await pocketbaseClient.collection('_superusers').authWithPassword(creds.email, creds.password, { $autoCancel: false });
    logger.info('PocketBase superuser client authentication successful');
  } catch (err) {
    logger.error(`PocketBase superuser authentication failed: ${err.message}`);
    throw err;
  }
}

const originalSend = pocketbaseClient.send.bind(pocketbaseClient);
pocketbaseClient.send = async function (path, sendOptions) {
  try {
    return await originalSend(path, sendOptions);
  } catch (err) {
    if ((err.status === 401 || err.status === 403) && !path.includes('/auth-with-password')) {
      const creds = getSuperuserCredentials();
      if (creds) {
        logger.warn(`PocketBase request to ${path} returned 401/403. Re-authenticating superuser client...`);
        try {
          await authenticateClient();
          return await originalSend(path, sendOptions);
        } catch (authErr) {
          throw err;
        }
      }
    }
    throw err;
  }
};

pocketbaseClient.beforeSend = async function (url, options) {
  if (url.includes('/api/collections/') && url.includes('/auth-with-password')) {
    return { url, options };
  }

  if (!pocketbaseClient.authStore.isValid && !authPromise) {
    const creds = getSuperuserCredentials();
    if (creds) {
      authPromise = authenticateClient().finally(() => {
        authPromise = null;
      });
    }
  }

  if (authPromise) {
    await authPromise.catch(() => {});
  }

  return { url, options };
};

import { isSupabaseCutoverActive, createSupabaseClient } from './supabaseClient.js';

(async () => {
  // Only attempt PocketBase health check and superuser auth when NOT cut over to Supabase
  if (isSupabaseCutoverActive()) {
    logger.info('DATA_STORE=supabase active: PocketBase background initialization bypassed');
    return;
  }
  try {
    await waitForHealth({ retries: 5, delayMs: 500 });
    const creds = getSuperuserCredentials();
    if (creds && !pocketbaseClient.authStore.isValid) {
      await authenticateClient();
    }
    logger.info('PocketBase client initialized successfully');
  } catch (err) {
    logger.warn(`PocketBase initialization deferred: ${err.message}`);
  }
})();

/**
 * Universal Database Router Client
 * Proxies calls dynamically:
 * - When DATA_STORE === 'supabase': routes collection(), filter(), collections, etc. to Supabase PostgREST
 * - When DATA_STORE !== 'supabase': routes to native PocketBase client
 */
const runtimeClient = new Proxy(pocketbaseClient, {
  get(target, prop, receiver) {
    if (isSupabaseCutoverActive()) {
      const sb = createSupabaseClient();
      if (sb && prop in sb) {
        const val = sb[prop];
        return typeof val === 'function' ? val.bind(sb) : val;
      }
    }
    const val = Reflect.get(target, prop, receiver);
    return typeof val === 'function' ? val.bind(target) : val;
  }
});

export default runtimeClient;
export { runtimeClient as pocketbaseClient };
