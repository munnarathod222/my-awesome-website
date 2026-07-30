import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = import.meta.env?.VITE_POCKETBASE_URL ||
  (typeof window !== 'undefined'
    ? (window.location.port === '8090' ? 'http://127.0.0.1:8090' : '/hcgi/platform')
    : 'http://127.0.0.1:8090');

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
