// Server-only persistent credentials. Never fall back to a stale local file.
const revisionKey = Symbol('driverAccountRevision');
export const accountFields = ['id', 'employee_id', 'employee_code', 'password_hash', 'account_status',
  'must_change_password', 'password_version', 'failed_login_attempts', 'locked_until',
  'last_login_at', 'last_login_ip', 'created_at', 'updated_at'];
export function storageError(code = 'AUTH_STORAGE_UNAVAILABLE') {
  const error = new Error(code === 'AUTH_STORAGE_CONFLICT'
    ? 'Your account changed during this request. Please retry.'
    : 'Driver account storage is unavailable. Please retry; do not reset your password.');
  error.status = code === 'AUTH_STORAGE_CONFLICT' ? 409 : 503;
  error.code = code;
  return error;
}
export function createDriverAccountStore({ url, key, fetcher = fetch }) {
  if (!url || !key) throw storageError();
  const base = new URL(url);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw storageError();
  const endpoint = new URL('/rest/v1/jbc_driver_accounts', base).href;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  async function request(query, method = 'GET', body) {
    let response;
    try {
      response = await fetcher(`${endpoint}?${new URLSearchParams(query)}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'error', signal: AbortSignal.timeout(15000),
      });
    } catch (_) { throw storageError(); }
    if (!response.ok) {
      await response.body?.cancel();
      throw storageError(response.status === 409 ? 'AUTH_STORAGE_CONFLICT' : undefined);
    }
    try {
      const rows = await response.json();
      if (!Array.isArray(rows)) throw Error();
      return rows;
    } catch (_) { throw storageError(); }
  }
  function unpack(row) {
    if (!Number.isSafeInteger(row.revision) || row.revision < 1 || !row.account ||
      row.account.employee_id !== row.employee_id || row.account.employee_code !== row.employee_code) throw storageError();
    const account = { ...row.account };
    Object.defineProperty(account, revisionKey, { value: row.revision, writable: true });
    return account;
  }
  async function find(field, value) {
    if (!['employee_id', 'employee_code'].includes(field) || typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw storageError();
    const rows = await request({ [field]: `eq.${value}`, select: '*', limit: '2' });
    if (rows.length > 1) throw storageError();
    if (!rows.length) return null;
    if (rows[0][field] !== value) throw storageError();
    return unpack(rows[0]);
  }
  async function save(account) {
    if (!account || !/^[a-zA-Z0-9_-]{1,100}$/.test(account.employee_id || '') ||
        !/^[DE][0-9]{3,}$/.test(account.employee_code || '') ||
        !/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(account.password_hash || '')) throw storageError();
    const revision = account[revisionKey];
    const clean = Object.fromEntries(accountFields.map(field => [field, account[field] ?? null]));
    const payload = { employee_id: account.employee_id, employee_code: account.employee_code, account: clean, revision: (revision || 0) + 1 };
    const rows = revision === undefined
      ? await request({}, 'POST', payload)
      : await request({ employee_id: `eq.${account.employee_id}`, revision: `eq.${revision}` }, 'PATCH', payload);
    if (rows.length !== 1) throw storageError('AUTH_STORAGE_CONFLICT');
    const saved = unpack(rows[0]);
    if (saved[revisionKey] !== payload.revision || saved.employee_id !== account.employee_id) throw storageError();
    Object.defineProperty(account, revisionKey, { value: saved[revisionKey], writable: true });
  }
  return { findById: id => find('employee_id', id), findByCode: code => find('employee_code', code), save };
}
export function configuredDriverAccountStore() {
  return createDriverAccountStore({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY });
}
export function usesPersistentDriverAccounts() {
  const mode = process.env.DRIVER_AUTH_STORE;
  if (mode && !['local', 'supabase'].includes(mode)) throw storageError();
  return mode === 'supabase';
}
