import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createDriverAccountStore } from '../src/services/driverAccountStore.js';

function server() {
  const rows = new Map(); let unavailable = false;
  const fetcher = async (address, options) => {
    if (unavailable) return new Response('not available', { status: 503 });
    const url = new URL(address), query = url.searchParams;
    if (options.method === 'GET') {
      const result = [...rows.values()].filter(row => ['employee_id', 'employee_code'].every(field => !query.has(field) || `eq.${row[field]}` === query.get(field)));
      return Response.json(result);
    }
    const body = JSON.parse(options.body), old = rows.get(body.employee_id);
    if (options.method === 'POST' && (old || [...rows.values()].some(row => row.employee_code === body.employee_code))) return new Response('', { status: 409 });
    if (options.method === 'PATCH' && (!old || `eq.${old.revision}` !== query.get('revision'))) return Response.json([]);
    rows.set(body.employee_id, body);
    return Response.json([body]);
  };
  return { fetcher, rows, fail: value => { unavailable = value; } };
}
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'jbc-auth-test-'));
  const previous = { ...process.env }, oldFetch = global.fetch;
  t.after(async () => {
    global.fetch = oldFetch;
    for (const key of ['DATA_DIR','DRIVER_AUTH_STORE','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','JWT_SECRET']) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
    await fs.rm(dir, { recursive: true, force: true });
  });
  await fs.writeFile(path.join(dir, 'package.json'), '{"type":"module"}');
  for (const name of ['driverAuthService.js','driverAccountStore.js']) await fs.copyFile(new URL(`../src/services/${name}`, import.meta.url), path.join(dir,name));
  await fs.writeFile(path.join(dir,'employeeCodeService.js'), "export function ensureSchema() {} export function getCodeForEmployee() { return 'D999'; }");
  await fs.writeFile(path.join(dir,'auditService.js'), 'export function ingestEvent() {}');
  Object.assign(process.env, { DATA_DIR: dir, DRIVER_AUTH_STORE: 'supabase', SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-key', JWT_SECRET: 'synthetic-test-secret-at-least-32-bytes' });
  const remote = server(); global.fetch = remote.fetcher;
  const load = suffix => import(pathToFileURL(path.join(dir,'driverAuthService.js')).href + `?instance=${suffix}`);
  const service = await load('initial');
  await service.createDriverAccount(null, { employeeId: 'syntheticdriver', temporaryPassword: 'Temp-Only-123' });
  return { service, remote, dir, load };
}
test('changed password survives repeated login, logout and a fresh server module', async t => {
  const { service: s, load } = await fixture(t);
  const first = await s.authenticateLogin(null, { employeeCode:'D999', password:'Temp-Only-123' });
  assert.equal(first.mustChangePassword, true);
  const changed = await s.changeDriverPassword(null, { employeeId:'syntheticdriver', currentPassword:'Temp-Only-123', newPassword:'Chosen-Pass-987' });
  await assert.rejects(s.refreshSessionToken(null, { refreshToken:first.refreshToken }), { code:'SESSION_REVOKED' });
  await s.refreshSessionToken(null, { refreshToken:changed.refreshToken });
  for (let i=0;i<3;i++) assert.equal((await s.authenticateLogin(null, { employeeCode:'D999', password:'Chosen-Pass-987' })).mustChangePassword, false);
  await s.logoutDriver(null, { employeeId:'syntheticdriver' });
  const restarted = await load('restarted');
  assert.equal((await restarted.authenticateLogin(null, { employeeCode:'D999', password:'Chosen-Pass-987' })).success, true);
  await assert.rejects(restarted.authenticateLogin(null, { employeeCode:'D999', password:'Temp-Only-123' }), { status:401 });
});
test('redeployed stale local JSON never replaces a durable password', async t => {
  const { service:s, dir, load } = await fixture(t);
  await s.changeDriverPassword(null, { employeeId:'syntheticdriver', currentPassword:'Temp-Only-123', newPassword:'Chosen-Pass-987' });
  await fs.writeFile(path.join(dir,'driver_app_accounts.json'), '{"old":"stale deployment snapshot"}');
  const restarted = await load('redeploy');
  assert.equal((await restarted.authenticateLogin(null, { employeeCode:'D999', password:'Chosen-Pass-987' })).success,true);
});
test('save outage cannot report success or change the persisted password', async t => {
  const { service:s, remote } = await fixture(t);
  const original = global.fetch;
  global.fetch = async (url, options) => options.method === 'PATCH' ? new Response('', {status:503}) : original(url,options);
  await assert.rejects(s.changeDriverPassword(null,{ employeeId:'syntheticdriver',currentPassword:'Temp-Only-123',newPassword:'Chosen-Pass-987' }),{ code:'AUTH_STORAGE_UNAVAILABLE' });
  assert.equal(s.verifyPassword('Temp-Only-123',remote.rows.get('syntheticdriver').account.password_hash),true);
});
test('storage outage fails closed instead of reading an old file', async t => {
  const { service:s, remote } = await fixture(t); remote.fail(true);
  await assert.rejects(s.authenticateLogin(null,{employeeCode:'D999',password:'Temp-Only-123'}),{status:503,code:'AUTH_STORAGE_UNAVAILABLE'});
});
test('stale concurrent save cannot undo a newer password reset', async t => {
  const { remote, service:s } = await fixture(t);
  const store = createDriverAccountStore({url:'https://fixture.invalid',key:'synthetic-key',fetcher:remote.fetcher});
  const stale = await store.findByCode('D999');
  await s.resetDriverPassword(null,{employeeId:'syntheticdriver',temporaryPassword:'Reset-Only-789'});
  stale.last_login_at = new Date().toISOString();
  await assert.rejects(store.save(stale),{code:'AUTH_STORAGE_CONFLICT'});
  assert.equal(s.verifyPassword('Reset-Only-789',remote.rows.get('syntheticdriver').account.password_hash),true);
});
test('password bytes remain consistent, including leading and trailing spaces', async t => {
  const {service:s}=await fixture(t);
  await s.changeDriverPassword(null,{employeeId:'syntheticdriver',currentPassword:'Temp-Only-123',newPassword:' Exact-Password-123 '});
  assert.equal((await s.authenticateLogin(null,{employeeCode:' d999 ',password:' Exact-Password-123 '})).success,true);
  await assert.rejects(s.authenticateLogin(null,{employeeCode:'D999',password:'Exact-Password-123'}),{status:401});
});
test('five incorrect attempts still lock the account', async t => {
  const {service:s}=await fixture(t);
  for(let i=0;i<5;i++) await assert.rejects(s.authenticateLogin(null,{employeeCode:'D999',password:'wrong'}),{status:401});
  await assert.rejects(s.authenticateLogin(null,{employeeCode:'D999',password:'Temp-Only-123'}),{status:429});
});
test('disabled accounts and revoked refresh tokens remain rejected', async t => {
  const {service:s}=await fixture(t);
  const session=await s.changeDriverPassword(null,{employeeId:'syntheticdriver',currentPassword:'Temp-Only-123',newPassword:'Chosen-Pass-987'});
  await s.setAccountStatus(null,{employeeId:'syntheticdriver',status:'disabled'});
  await assert.rejects(s.authenticateLogin(null,{employeeCode:'D999',password:'Chosen-Pass-987'}),{status:403});
  await assert.rejects(s.refreshSessionToken(null,{refreshToken:session.refreshToken}),{code:'ACCOUNT_DISABLED'});
});
