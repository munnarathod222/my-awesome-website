import { configuredDriverAccountStore, usesPersistentDriverAccounts, storageError } from './driverAccountStore.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as employeeCodeService from './employeeCodeService.js';
import * as auditService from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDataDir() {
  if (process.env.DATA_DIR && fs.existsSync(process.env.DATA_DIR)) {
    return process.env.DATA_DIR;
  }
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../../../../data'),
    path.resolve(__dirname, '../../../data'),
    '/var/data',
    '/data'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  const fallback = path.resolve(process.cwd(), 'data');
  try { fs.mkdirSync(fallback, { recursive: true }); } catch (_) {}
  return fallback;
}

function getAccountsFile() {
  return path.join(getDataDir(), 'driver_app_accounts.json');
}

const TOKEN_EXPIRY_NORMAL = 7 * 24 * 3600; // 7 days in seconds
const TOKEN_EXPIRY_MUST_CHANGE = 1800; // 30 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 3600; // 30 days in seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

let accountsCache = null;

function loadAccounts() {
  accountsCache = null; // Re-read local development storage; never reuse an old password snapshot.
  const accountsFile = getAccountsFile();
  try {
    if (fs.existsSync(accountsFile)) {
      accountsCache = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
      if (!accountsCache || typeof accountsCache !== 'object' || Array.isArray(accountsCache)) {
        throw new Error('Invalid account storage');
      }
    }
  } catch (_) {
    throw storageError();
  }
  if (!accountsCache) {
    accountsCache = {};
    saveAccounts();
  }
  return accountsCache;
}

function saveAccounts() {
  const accountsFile = getAccountsFile();
  try {
    fs.mkdirSync(path.dirname(accountsFile), { recursive: true });
    const tmpFile = `${accountsFile}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmpFile, JSON.stringify(accountsCache, null, 2), 'utf8');
    try {
      fs.renameSync(tmpFile, accountsFile);
    } catch (_) {
      if (fs.existsSync(accountsFile)) {
        fs.unlinkSync(accountsFile);
      }
      fs.renameSync(tmpFile, accountsFile);
    }
  } catch (err) {
    accountsCache = null;
    throw storageError();
  }
}

/**
 * Storage Abstraction: Get account by employee ID
 */
export async function getAccountByEmployeeId(dbOrNull, employeeId) {
  if (usesPersistentDriverAccounts()) return configuredDriverAccountStore().findById(employeeId);
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM driver_app_accounts WHERE employee_id = ? LIMIT 1').get(employeeId);
      if (row) {
        return {
          ...row,
          must_change_password: Boolean(row.must_change_password)
        };
      }
      return null;
    } catch (_) {}
  }
  const accounts = loadAccounts();
  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  return accKey ? structuredClone(accounts[accKey]) : null;
}

/**
 * Storage Abstraction: Get account by permanent employee code
 */
export async function getAccountByEmployeeCode(dbOrNull, code) {
  const normCode = String(code || '').trim().toUpperCase();
  if (usesPersistentDriverAccounts()) return configuredDriverAccountStore().findByCode(normCode);
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM driver_app_accounts WHERE employee_code = ? LIMIT 1').get(normCode);
      if (row) {
        return {
          ...row,
          must_change_password: Boolean(row.must_change_password)
        };
      }
      return null;
    } catch (_) {}
  }
  const accounts = loadAccounts();
  const accKey = Object.keys(accounts).find(k => accounts[k].employee_code === normCode);
  return accKey ? structuredClone(accounts[accKey]) : null;
}

/**
 * Storage Abstraction: Save or update account
 */
export async function saveAccountRecord(dbOrNull, acc) {
  if (usesPersistentDriverAccounts()) return configuredDriverAccountStore().save(acc);
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      dbOrNull.prepare(`
        INSERT INTO driver_app_accounts (
          id, employee_id, employee_code, password_hash, account_status,
          must_change_password, password_version, failed_login_attempts,
          locked_until, last_login_at, last_login_ip, created_at, updated_at
        ) VALUES (
          @id, @employee_id, @employee_code, @password_hash, @account_status,
          @must_change_password, @password_version, @failed_login_attempts,
          @locked_until, @last_login_at, @last_login_ip, @created_at, @updated_at
        ) ON CONFLICT(employee_id) DO UPDATE SET
          password_hash = excluded.password_hash,
          account_status = excluded.account_status,
          must_change_password = excluded.must_change_password,
          password_version = excluded.password_version,
          failed_login_attempts = excluded.failed_login_attempts,
          locked_until = excluded.locked_until,
          last_login_at = excluded.last_login_at,
          last_login_ip = excluded.last_login_ip,
          updated_at = excluded.updated_at
      `).run({
        ...acc,
        must_change_password: acc.must_change_password ? 1 : 0
      });
      return;
    } catch (_) {}
  }
  const accounts = loadAccounts();
  accounts[acc.id] = acc;
  saveAccounts();
}

/**
 * Ensure driver auth storage is ready
 */
export function ensureDriverAuthSchema(dbOrNull) {
  if (usesPersistentDriverAccounts()) return;
  if (dbOrNull && typeof dbOrNull.exec === 'function') {
    try {
      dbOrNull.exec(`
        CREATE TABLE IF NOT EXISTS driver_app_accounts (
          id TEXT PRIMARY KEY,
          employee_id TEXT UNIQUE NOT NULL,
          employee_code TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          account_status TEXT NOT NULL DEFAULT 'active',
          must_change_password INTEGER NOT NULL DEFAULT 0,
          password_version INTEGER NOT NULL DEFAULT 1,
          failed_login_attempts INTEGER NOT NULL DEFAULT 0,
          locked_until TEXT,
          last_login_at TEXT,
          last_login_ip TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_driver_app_acc_emp ON driver_app_accounts(employee_id);
        CREATE INDEX IF NOT EXISTS idx_driver_app_acc_code ON driver_app_accounts(employee_code);
      `);
    } catch (_) {}
  }
}

/**
 * Cryptographic Password Hashing using Node.js scrypt
 */
export function hashPassword(plainTextPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainTextPassword, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify plain text password against scrypt hash
 */
export function verifyPassword(plainTextPassword, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const expectedHash = parts[2];
  const derivedKey = crypto.scryptSync(plainTextPassword, salt, 64);
  const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'utf8');
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');
  if (keyBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, expectedBuffer);
}

/**
 * JWT Signing and Verification implementation
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function getJwtSecret() {
  const secret = process.env.DRIVER_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DRIVER_JWT_SECRET must be configured with at least 32 characters in production');
    }
    // Deterministic fallback for dev only
    return 'jbc_dev_jwt_secret_must_be_overridden_in_prod_32chars!';
  }
  return secret.trim();
}

export function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is missing or invalid' };
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed token structure' };
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, error: 'Invalid token signature' };
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch (_) {
    return { valid: false, error: 'Invalid token payload' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec) {
    return { valid: false, error: 'Token has expired', expired: true };
  }

  return { valid: true, payload };
}

/**
 * Account-instance session validation:
 * Legacy or recreated-account tokens must not regain access when password versions happen to match.
 */
export function sessionMatchesAccount(acc, payload) {
  return acc.password_version === payload.pver &&
    (!usesPersistentDriverAccounts() ||
      (typeof acc.id === 'string' && acc.id.length > 0 && payload.aid === acc.id));
}

/**
 * Helper: Find employee record
 */
function fetchEmployeeRecord(employeeId, dbOrNull) {
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM employees WHERE id = ? LIMIT 1').get(employeeId);
      if (row) return row;
    } catch (_) {}
  }
  try {
    const regPath = path.join(getDataDir(), 'employees_registry.json');
    if (fs.existsSync(regPath)) {
      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      if (reg[employeeId]) return { id: employeeId, ...reg[employeeId] };
    }
  } catch (_) {}
  return null;
}

/**
 * Helper: Find truck record
 */
function fetchTruckRecord(truckId, dbOrNull) {
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM trucks WHERE id = ? LIMIT 1').get(truckId);
      if (row) return row;
    } catch (_) {}
  }
  return null;
}

/**
 * Office Administration: Create Driver Mobile Account
 */
export async function createDriverAccount(dbOrNull, { employeeId, temporaryPassword, createdBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  if (!employeeId) throw new Error('employeeId is required');

  const empCode = employeeCodeService.getCodeForEmployee(employeeId);
  if (!empCode) {
    throw new Error(`Cannot create mobile account: Employee ${employeeId} has no assigned permanent code.`);
  }

  const existing = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (existing) {
    throw new Error(`Driver account already exists for employee ${empCode}. Use reset-password instead.`);
  }

  const tempPass = temporaryPassword || crypto.randomBytes(4).toString('hex').toUpperCase();
  const acc = {
    id: `drv_acc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    employee_id: employeeId,
    employee_code: empCode,
    password_hash: hashPassword(tempPass),
    account_status: 'active',
    must_change_password: false, // Office-issued passwords work directly without forced password change
    password_version: 1,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    last_login_ip: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await saveAccountRecord(dbOrNull, acc);

  try {
    auditService.recordAuditEvent({
      event_type: 'DRIVER_ACCOUNT_CREATED',
      category: 'ADMIN_SECURITY',
      actor: createdBy,
      action: 'CREATE_DRIVER_ACCOUNT',
      target_id: employeeId,
      details: {
        employee_code: empCode,
        must_change_password: false
      }
    });
  } catch (_) {}

  return {
    success: true,
    message: `Driver account created for ${empCode}`,
    account: {
      employeeId,
      employeeCode: empCode,
      temporaryPassword: tempPass,
      status: 'active',
      mustChangePassword: false
    }
  };
}

/**
 * Office Administration: Reset Driver Password
 */
export async function resetDriverPassword(dbOrNull, { employeeId, temporaryPassword, resetBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  if (!employeeId) throw new Error('employeeId is required');

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) {
    throw new Error(`No mobile account found for employee ${employeeId}`);
  }

  const tempPass = temporaryPassword || crypto.randomBytes(4).toString('hex').toUpperCase();
  acc.password_hash = hashPassword(tempPass);
  acc.must_change_password = false; // Office-issued passwords work directly
  acc.password_version = (acc.password_version || 1) + 1; // Revokes existing sessions
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.updated_at = new Date().toISOString();

  await saveAccountRecord(dbOrNull, acc);

  try {
    auditService.recordAuditEvent({
      event_type: 'DRIVER_PASSWORD_RESET',
      category: 'ADMIN_SECURITY',
      actor: resetBy,
      action: 'RESET_DRIVER_PASSWORD',
      target_id: employeeId,
      details: {
        employee_code: acc.employee_code,
        new_password_version: acc.password_version
      }
    });
  } catch (_) {}

  return {
    success: true,
    message: `Password reset successfully for ${acc.employee_code}`,
    mustChangePassword: false,
    temporaryPassword: tempPass,
    account: {
      employeeId,
      employeeCode: acc.employee_code,
      temporaryPassword: tempPass,
      status: acc.account_status,
      mustChangePassword: false
    }
  };
}

/**
 * Office Administration: Enable/Disable Account
 */
export async function setAccountStatus(dbOrNull, { employeeId, status, updatedBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  if (!['active', 'disabled'].includes(status)) {
    throw new Error('Status must be either active or disabled');
  }

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) throw new Error(`No mobile account found for employee ${employeeId}`);

  acc.account_status = status;
  if (status === 'disabled') {
    acc.password_version = (acc.password_version || 1) + 1; // Instantly revoke active sessions
  }
  acc.updated_at = new Date().toISOString();

  await saveAccountRecord(dbOrNull, acc);

  return {
    success: true,
    message: `Account status updated to ${status} for ${acc.employee_code}`,
    accountStatus: status
  };
}

/**
 * Office Administration: Query Account Status
 */
export async function getAccountStatus(dbOrNull, employeeId) {
  ensureDriverAuthSchema(dbOrNull);

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  const empCode = employeeCodeService.getCodeForEmployee(employeeId);

  if (!acc) {
    return {
      exists: false,
      employeeId,
      employeeCode: empCode,
      accountStatus: 'unregistered'
    };
  }

  return {
    exists: true,
    employeeId: acc.employee_id,
    employeeCode: acc.employee_code,
    accountStatus: acc.account_status,
    mustChangePassword: Boolean(acc.must_change_password),
    lastLoginAt: acc.last_login_at,
    failedAttempts: acc.failed_login_attempts,
    locked: Boolean(acc.locked_until && new Date(acc.locked_until) > new Date())
  };
}

/**
 * Mobile Authentication: Driver Login
 * Preserves exact password bytes without trimming.
 * Supports office-issued passwords reliably across restarts.
 */
export async function authenticateLogin(dbOrNull, { employeeCode, password, ip = '127.0.0.1' }) {
  ensureDriverAuthSchema(dbOrNull);

  const code = String(employeeCode || '').trim().toUpperCase();
  // Preserve exact password bytes without trimming
  const plainPass = typeof password === 'string' ? password : '';

  if (!code || !plainPass) {
    throw new Error('Employee code and password are required');
  }

  const acc = await getAccountByEmployeeCode(dbOrNull, code);

  // Generic credential error response for security (prevents user enumeration)
  const genericError = new Error('Invalid employee code or password');
  genericError.status = 401;
  genericError.code = 'INVALID_CREDENTIALS';

  if (!acc) {
    throw genericError;
  }

  // Account disabled check
  if (acc.account_status !== 'active') {
    const disabledErr = new Error('Your driver account has been disabled. Contact dispatch office.');
    disabledErr.status = 403;
    disabledErr.code = 'ACCOUNT_DISABLED';
    throw disabledErr;
  }

  // Account lockout check
  if (acc.locked_until) {
    const lockExpiry = new Date(acc.locked_until);
    if (lockExpiry > new Date()) {
      const waitMin = Math.ceil((lockExpiry - Date.now()) / 60000);
      const lockErr = new Error(`Account temporarily locked due to multiple failed attempts. Try again in ${waitMin} minute(s).`);
      lockErr.status = 429;
      lockErr.code = 'ACCOUNT_LOCKED';
      throw lockErr;
    } else {
      acc.locked_until = null;
      acc.failed_login_attempts = 0;
    }
  }

  // Verify password
  const isValid = verifyPassword(plainPass, acc.password_hash);
  if (!isValid) {
    acc.failed_login_attempts = (acc.failed_login_attempts || 0) + 1;
    if (acc.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      acc.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    }
    acc.updated_at = new Date().toISOString();
    await saveAccountRecord(dbOrNull, acc);

    throw genericError;
  }

  // Successful login: clears failed attempts and first-login flag upon verified login
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.last_login_at = new Date().toISOString();
  acc.last_login_ip = ip;
  acc.must_change_password = false;
  acc.updated_at = new Date().toISOString();
  await saveAccountRecord(dbOrNull, acc);

  const mustChange = false;
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'access',
    aid: acc.id,
    pver: acc.password_version || 1,
    mustChange,
    iat: nowSec,
    exp: nowSec + TOKEN_EXPIRY_NORMAL
  };
  const accessToken = signJwt(tokenPayload);

  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'refresh',
    aid: acc.id,
    pver: acc.password_version || 1,
    mustChange,
    iat: nowSec,
    exp: nowSec + REFRESH_TOKEN_EXPIRY
  };
  const refreshToken = signJwt(refreshPayload);

  return {
    success: true,
    tokenType: 'Bearer',
    accessToken,
    refreshToken,
    expiresIn: TOKEN_EXPIRY_NORMAL,
    mustChangePassword: mustChange,
    driver: {
      id: acc.employee_id,
      employeeCode: acc.employee_code,
      role: 'driver',
      status: 'active'
    }
  };
}

/**
 * Mobile Authentication: Change Password (Optional)
 */
export async function changeDriverPassword(dbOrNull, { employeeId, currentPassword, newPassword }) {
  ensureDriverAuthSchema(dbOrNull);

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) {
    throw new Error('Driver account not found');
  }

  if (acc.account_status !== 'active') {
    throw new Error('Account is disabled');
  }

  if (!verifyPassword(currentPassword, acc.password_hash)) {
    throw new Error('Current password is incorrect');
  }

  if (verifyPassword(newPassword, acc.password_hash)) {
    throw new Error('New password cannot be the same as current password');
  }

  const newHash = hashPassword(newPassword);
  acc.password_hash = newHash;
  acc.must_change_password = false;
  acc.password_version = (acc.password_version || 1) + 1; // Revoke old sessions
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.updated_at = new Date().toISOString();
  await saveAccountRecord(dbOrNull, acc);

  const nextVer = acc.password_version;
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'access',
    aid: acc.id,
    pver: nextVer,
    mustChange: false,
    iat: nowSec,
    exp: nowSec + TOKEN_EXPIRY_NORMAL
  };
  const accessToken = signJwt(tokenPayload);

  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'refresh',
    aid: acc.id,
    pver: nextVer,
    mustChange: false,
    iat: nowSec,
    exp: nowSec + REFRESH_TOKEN_EXPIRY
  };
  const refreshToken = signJwt(refreshPayload);

  return {
    success: true,
    message: 'Password changed successfully',
    accessToken,
    refreshToken,
    expiresIn: TOKEN_EXPIRY_NORMAL,
    mustChangePassword: false
  };
}

/**
 * Mobile Authentication: Refresh Access Token
 * Requires a valid refresh token and an active, unrevoked account matching session instance.
 */
export async function refreshSessionToken(dbOrNull, { refreshToken }) {
  ensureDriverAuthSchema(dbOrNull);

  if (!refreshToken) {
    const err = new Error('Refresh token is required');
    err.status = 400;
    err.code = 'REFRESH_TOKEN_REQUIRED';
    throw err;
  }

  const result = verifyJwt(refreshToken);
  if (!result.valid) {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  // Enforce distinct token types
  if (result.payload.type !== 'refresh') {
    const err = new Error('Invalid token type: Expected refresh token');
    err.status = 401;
    err.code = 'TOKEN_TYPE_INVALID';
    throw err;
  }

  const payload = result.payload;
  const acc = await getAccountByEmployeeId(dbOrNull, payload.sub);

  if (!acc) {
    const err = new Error('Account no longer exists');
    err.status = 401;
    err.code = 'ACCOUNT_NOT_FOUND';
    throw err;
  }

  if (acc.account_status !== 'active') {
    const err = new Error('Account has been disabled');
    err.status = 403;
    err.code = 'ACCOUNT_DISABLED';
    throw err;
  }

  if (!sessionMatchesAccount(acc, payload)) {
    const err = new Error('Session has been revoked due to password change or administrative action');
    err.status = 401;
    err.code = 'SESSION_REVOKED';
    throw err;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'access',
    aid: acc.id,
    pver: acc.password_version,
    mustChange: false,
    iat: nowSec,
    exp: nowSec + TOKEN_EXPIRY_NORMAL
  };
  const newAccessToken = signJwt(tokenPayload);

  return {
    success: true,
    tokenType: 'Bearer',
    accessToken: newAccessToken,
    expiresIn: TOKEN_EXPIRY_NORMAL,
    mustChangePassword: false
  };
}

/**
 * Mobile Authentication: Logout
 */
export async function logoutDriver(dbOrNull, { employeeId }) {
  ensureDriverAuthSchema(dbOrNull);

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (acc) {
    acc.password_version = (acc.password_version || 1) + 1;
    acc.updated_at = new Date().toISOString();
    await saveAccountRecord(dbOrNull, acc);
  }

  return {
    success: true,
    message: 'Logged out successfully'
  };
}

/**
 * Get driver profile for mobile app
 * Accurately maps employee record, assigned truck, and supervisor details.
 */
export async function getDriverProfile(dbOrNull, employeeId) {
  ensureDriverAuthSchema(dbOrNull);

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  const emp = fetchEmployeeRecord(employeeId, dbOrNull);

  const code = (acc && acc.employee_code) || (emp && emp.employee_code) || employeeCodeService.getCodeForEmployee(employeeId) || null;
  const name = (emp && emp.name) || (acc ? `Driver ${code}` : 'Driver');
  const role = (emp && emp.employee_type) || 'driver';
  const status = (emp && emp.active_status) || (acc ? acc.account_status : 'active');

  // Resolve assigned truck: return null if genuinely missing
  let assignedTruck = null;
  const truckId = emp && emp.assigned_truck ? emp.assigned_truck.trim() : null;
  if (truckId) {
    const truck = fetchTruckRecord(truckId, dbOrNull);
    if (truck) {
      const modelParts = [truck.truck_name, truck.truck_size, truck.truck_axle].filter(Boolean);
      assignedTruck = {
        id: truck.id,
        truckNumber: truck.truck_number,
        truckCode: truck.truck_code || null,
        model: modelParts.length > 0 ? modelParts.join(' ') : (truck.model || 'Commercial Vehicle'),
        status: truck.status || 'active'
      };
    }
  }

  // Resolve assigned supervisor: return null if genuinely missing
  let assignedSupervisor = null;
  let supId = (emp && emp.supervisor_id && emp.supervisor_id.trim()) || null;
  if (!supId && assignedTruck) {
    const truck = fetchTruckRecord(truckId, dbOrNull);
    if (truck && truck.manager_id && truck.manager_id.trim()) {
      supId = truck.manager_id.trim();
    }
  }

  if (!supId && employeeId) {
    try {
      const regPath = path.join(DATA_DIR, 'employees_registry.json');
      if (fs.existsSync(regPath)) {
        const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
        if (reg[employeeId] && reg[employeeId].supervisor_id && reg[employeeId].supervisor_id.trim()) {
          supId = reg[employeeId].supervisor_id.trim();
        }
      }
    } catch (_) {}
  }

  if (supId) {
    const sup = fetchEmployeeRecord(supId, dbOrNull);
    if (sup) {
      const supCode = sup.employee_code || employeeCodeService.getCodeForEmployee(sup.id) || null;
      assignedSupervisor = {
        id: sup.id,
        name: sup.name,
        code: supCode,
        phone: sup.contact || sup.phone || null,
        role: sup.position || sup.employee_type || 'Fleet Supervisor'
      };
    }
  }

  return {
    id: employeeId,
    employeeCode: code,
    name,
    role,
    status,
    accountStatus: acc ? acc.account_status : 'unregistered',
    mustChangePassword: acc ? Boolean(acc.must_change_password) : false,
    lastLoginAt: acc ? acc.last_login_at : null,
    assignedTruck,
    assignedSupervisor
  };
}

/**
 * Lookup account by employeeId
 */
export async function findAccountByEmployeeId(employeeId) {
  return await getAccountByEmployeeId(null, employeeId);
}
