import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env?.VITE_POCKETBASE_URL ||
  (typeof window !== 'undefined'
    ? (window.location.port === '8090' ? 'http://127.0.0.1:8090' : '/hcgi/platform')
    : 'http://127.0.0.1:8090');

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

// 🛡️ Prevent invalid non-JWT tokens from triggering 401 session wipes
pocketbaseClient.beforeSend = (url, options) => {
  if (options && options.headers && options.headers.Authorization) {
    const token = String(options.headers.Authorization).replace(/^Bearer\s+/i, '');
    if (token && !token.startsWith('ey')) {
      delete options.headers.Authorization;
    }
  }
  return options;
};

export default pocketbaseClient;

export { pocketbaseClient };
