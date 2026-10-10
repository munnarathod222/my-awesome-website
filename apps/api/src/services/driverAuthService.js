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

const DATA_DIR = getDataDir();
const ACCOUNTS_FILE = path.join(DATA_DIR, 'driver_app_accounts.json');

const TOKEN_EXPIRY_NORMAL = 7 * 24 * 3600; // 7 days in seconds
const TOKEN_EXPIRY_MUST_CHANGE = 1800; // 30 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 3600; // 30 days in seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

let accountsCache = null;

function loadAccounts() {
  accountsCache = null; // Re-read local development storage; never reuse an old password snapshot.
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      accountsCache = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      if (!accountsCache || typeof accountsCache !== 'object' || Array.isArray(accountsCache)) throw Error('Invalid account storage');
    }
  } catch (_) { throw storageError(); }
  if (!accountsCache) {
    accountsCache = {};
    saveAccounts();
  }
  return accountsCache;
}

function saveAccounts() {
  try {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    const tmpFile = `${ACCOUNTS_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmpFile, JSON.stringify(accountsCache, null, 2), 'utf8');
    try {
      fs.renameSync(tmpFile, ACCOUNTS_FILE);
    } catch (_) {
      // Preserve the previous file if atomic replacement fails.
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      throw storageError();
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
 * Require a securely configured server secret and fail closed if missing or insecure.
 * Never exposes secret or falls back to an insecure hardcoded constant.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.DRIVER_AUTH_SECRET || process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || typeof secret !== 'string' || secret.trim().length < 16) {
    const err = new Error('Server configuration error: Secure driver JWT secret is missing or insufficiently configured. Refusing to sign or verify tokens.');
    err.status = 500;
    err.code = 'CONFIG_ERROR';
    throw err;
  }
  return secret.trim();
}

/**
 * Backward compatibility: getDb stub
 */
export function getDb() {
  return null;
}

/**
 * Ensure driver auth storage is ready
 */
export function ensureDriverAuthSchema(dbOrNull) {
  employeeCodeService.ensureSchema(dbOrNull);
  if (!usesPersistentDriverAccounts()) loadAccounts();
  if (dbOrNull && typeof dbOrNull.exec === 'function') {
    try {
      dbOrNull.exec(`
        CREATE TABLE IF NOT EXISTS driver_app_accounts (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL UNIQUE,
          employee_code TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          account_status TEXT NOT NULL DEFAULT 'active',
          must_change_password INTEGER NOT NULL DEFAULT 1,
          password_version INTEGER NOT NULL DEFAULT 1,
          failed_login_attempts INTEGER NOT NULL DEFAULT 0,
          locked_until TEXT,
          last_login_at TEXT,
          last_login_ip TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    } catch (_) {}
  }
}

/**
 * Hash password using Node crypto.scryptSync with 16-byte random salt
 */
export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify plaintext password against stored scrypt hash using timingSafeEqual
 */
export function verifyPassword(plainPassword, storedHash) {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }
    const salt = parts[1];
    const keyHex = parts[2];
    const derivedKey = crypto.scryptSync(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 });
    const originalKey = Buffer.from(keyHex, 'hex');
    return crypto.timingSafeEqual(derivedKey, originalKey);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a strong, human-readable temporary password for office sharing
 */
export function generateTemporaryPassword() {
  const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const charsLower = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%';

  const pick = (set) => set[crypto.randomInt(0, set.length)];
  const core = [
    pick(charsUpper),
    pick(charsLower),
    pick(numbers),
    pick(symbols),
    pick(charsUpper),
    pick(charsLower),
    pick(numbers)
  ].sort(() => 0.5 - Math.random()).join('');

  return `JBC-${core}`;
}

/**
 * Custom JWT signer using HMAC-SHA256
 */
export function signJwt(payload, secret = null) {
  const signingSecret = secret || getJwtSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Custom JWT verifier
 */
export function verifyJwt(token, secret = null) {
  try {
    const signingSecret = secret || getJwtSecret();
    const [encodedHeader, encodedPayload, signature] = (token || '').split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      return { valid: false, error: 'Malformed token' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', signingSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    if (err.code === 'CONFIG_ERROR' || err.status === 500) {
      throw err;
    }
    return { valid: false, error: err.message };
  }
}

/**
 * Helper to fetch employee record from DB, registry or fallback
 */
export function fetchEmployeeRecord(employeeId, dbOrNull = null) {
  if (!employeeId) return null;

  // 1. Direct SQLite database instance if passed
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM employees WHERE id = ? LIMIT 1').get(employeeId);
      if (row) return row;
    } catch (_) {}
  }

  // 2. Local SQLite DB files if present on disk
  try {
    const dbPaths = [
      path.resolve(process.cwd(), 'pb_data/data.db'),
      path.resolve(process.cwd(), 'data/pocketbase.db'),
      path.resolve(process.cwd(), 'scratch/live_backup_before_migration.db')
    ];
    const sqlite = typeof process.getBuiltinModule === 'function' ? process.getBuiltinModule('node:sqlite') : null;
    if (sqlite && sqlite.DatabaseSync) {
      for (const p of dbPaths) {
        if (fs.existsSync(p)) {
          try {
            const db = new sqlite.DatabaseSync(p, { readOnly: true });
            const row = db.prepare('SELECT * FROM employees WHERE id = ? LIMIT 1').get(employeeId);
            db.close();
            if (row) return row;
          } catch (_) {}
        }
      }
    }
  } catch (_) {}

  // 3. Fallback to data/employees_registry.json
  try {
    const regPath = path.join(DATA_DIR, 'employees_registry.json');
    if (fs.existsSync(regPath)) {
      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      if (reg[employeeId]) return reg[employeeId];
    }
  } catch (_) {}

  // 4. Fallback to employeeCodeService
  const code = employeeCodeService.getCodeForEmployee(employeeId);
  if (code) {
    return {
      id: employeeId,
      name: `Driver (${code})`,
      employee_code: code,
      employee_type: code.startsWith('D') ? 'driver' : 'staff',
      active_status: 'active',
      assigned_truck: '',
      supervisor_id: ''
    };
  }

  return null;
}

/**
 * Helper to fetch truck record from DB or registry
 */
export function fetchTruckRecord(truckId, dbOrNull = null) {
  if (!truckId) return null;

  // 1. Direct SQLite database instance if passed
  if (dbOrNull && typeof dbOrNull.prepare === 'function') {
    try {
      const row = dbOrNull.prepare('SELECT * FROM trucks WHERE id = ? OR truck_number = ? LIMIT 1').get(truckId, truckId);
      if (row) return row;
    } catch (_) {}
  }

  // 2. Local SQLite DB files if present on disk
  try {
    const dbPaths = [
      path.resolve(process.cwd(), 'pb_data/data.db'),
      path.resolve(process.cwd(), 'data/pocketbase.db'),
      path.resolve(process.cwd(), 'scratch/live_backup_before_migration.db')
    ];
    const sqlite = typeof process.getBuiltinModule === 'function' ? process.getBuiltinModule('node:sqlite') : null;
    if (sqlite && sqlite.DatabaseSync) {
      for (const p of dbPaths) {
        if (fs.existsSync(p)) {
          try {
            const db = new sqlite.DatabaseSync(p, { readOnly: true });
            const row = db.prepare('SELECT * FROM trucks WHERE id = ? OR truck_number = ? LIMIT 1').get(truckId, truckId);
            db.close();
            if (row) return row;
          } catch (_) {}
        }
      }
    }
  } catch (_) {}

  // 3. Fallback to data/trucks_registry.json
  try {
    const trucksPath = path.join(DATA_DIR, 'trucks_registry.json');
    if (fs.existsSync(trucksPath)) {
      const reg = JSON.parse(fs.readFileSync(trucksPath, 'utf8'));
      if (reg[truckId]) return reg[truckId];
      const match = Object.values(reg).find(t => t.truck_number === truckId || t.id === truckId);
      if (match) return match;
    }
  } catch (_) {}

  return null;
}

/**
 * Office operation: Create Driver App Account for an existing employee
 */
export async function createDriverAccount(dbOrNull, { employeeId, temporaryPassword, createdBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  // Validate employee eligibility (Reject non-drivers)
  const emp = fetchEmployeeRecord(employeeId, dbOrNull);
  if (emp && emp.employee_type && emp.employee_type !== 'driver') {
    throw new Error(`Ineligible employee: Only drivers can have driver app access (Current role: ${emp.employee_type})`);
  }

  // Enforce one driver account per employee
  const existingAcc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (existingAcc) {
    throw new Error(`Driver already has an active login account (Code: ${existingAcc.employee_code})`);
  }

  // Ensure employee has a permanent code
  let code = (emp && emp.employee_code && emp.employee_code.trim()) || employeeCodeService.getCodeForEmployee(employeeId);
  if (!code) {
    code = employeeCodeService.allocateNextCode(dbOrNull, 'driver');
    employeeCodeService.setCodeForEmployee(employeeId, code);
  }

  // Ensure code is not already bound to another account
  const codeOwner = await getAccountByEmployeeCode(dbOrNull, code);
  if (codeOwner) {
    throw new Error(`Account with code ${code} already exists`);
  }

  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);
  const accountId = `drv_acc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const newAcc = {
    id: accountId,
    employee_id: employeeId,
    employee_code: code,
    password_hash: hash,
    account_status: 'active',
    must_change_password: true,
    password_version: 1,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    last_login_ip: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await saveAccountRecord(dbOrNull, newAcc);

  try {
    auditService.ingestEvent({
      action: 'DRIVER_ACCOUNT_CREATED',
      actor_id: createdBy,
      target_type: 'employee',
      target_id: employeeId,
      notes: `Driver app account created (${code})`
    });
  } catch (_) {}

  return {
    success: true,
    accountId,
    employeeId,
    employeeCode: code,
    temporaryPassword: tempPass,
    mustChangePassword: true,
    message: 'Account created successfully. Provide the temporary password securely to the driver. It cannot be viewed again.'
  };
}

/**
 * Office operation: Reset Driver Password
 */
export async function resetDriverPassword(dbOrNull, { employeeId, temporaryPassword, resetBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) {
    throw new Error('No driver app account exists for this employee');
  }

  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);

  acc.password_hash = hash;
  acc.must_change_password = true;
  acc.password_version = (acc.password_version || 1) + 1; // Immediately revokes all active sessions
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.updated_at = new Date().toISOString();

  await saveAccountRecord(dbOrNull, acc);

  try {
    auditService.ingestEvent({
      action: 'DRIVER_PASSWORD_RESET',
      actor_id: resetBy,
      target_type: 'driver_account',
      target_id: acc.id,
      notes: `Password reset triggered for driver code ${acc.employee_code}. All prior sessions revoked.`
    });
  } catch (_) {}

  return {
    success: true,
    employeeCode: acc.employee_code,
    temporaryPassword: tempPass,
    mustChangePassword: true,
    message: 'Password reset successful. All active driver sessions have been revoked.'
  };
}

/**
 * Office operation: Enable or Disable Driver App Access
 */
export async function setAccountStatus(dbOrNull, { employeeId, status, updatedBy = 'Office' }) {
  ensureDriverAuthSchema(dbOrNull);

  const validStatuses = ['active', 'disabled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Allowed values: active, disabled');
  }

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) {
    throw new Error('No driver app account found for this employee');
  }

  const oldStatus = acc.account_status;
  acc.account_status = status;
  if (status === 'disabled') {
    acc.password_version = (acc.password_version || 1) + 1; // Invalidate current tokens
  }
  acc.updated_at = new Date().toISOString();

  await saveAccountRecord(dbOrNull, acc);

  try {
    auditService.ingestEvent({
      action: 'DRIVER_ACCOUNT_STATUS_CHANGE',
      actor_id: updatedBy,
      target_type: 'driver_account',
      target_id: acc.id,
      notes: `Driver ${acc.employee_code} status changed from ${oldStatus} to ${status}`
    });
  } catch (_) {}

  return {
    success: true,
    employeeCode: acc.employee_code,
    accountStatus: status
  };
}

/**
 * Office operation: Get Account Status for an employee
 */
export async function getAccountStatus(dbOrNull, employeeId) {
  ensureDriverAuthSchema(dbOrNull);

  const acc = await getAccountByEmployeeId(dbOrNull, employeeId);
  if (!acc) {
    return { hasAccount: false };
  }

  return {
    hasAccount: true,
    accountId: acc.id,
    employeeId: acc.employee_id,
    employeeCode: acc.employee_code,
    accountStatus: acc.account_status,
    mustChangePassword: Boolean(acc.must_change_password),
    lastLoginAt: acc.last_login_at,
    isLocked: Boolean(acc.locked_until && new Date(acc.locked_until).getTime() > Date.now()),
    createdAt: acc.created_at,
    updatedAt: acc.updated_at
  };
}

/**
 * Mobile Authentication: Driver Login with employeeCode and password
 */
export async function authenticateLogin(dbOrNull, { employeeCode, password, ip = '127.0.0.1' }) {
  ensureDriverAuthSchema(dbOrNull);

  const code = String(employeeCode || '').trim().toUpperCase();
  const plainPass = typeof password === 'string' ? password : ''; // Password bytes must match password creation.

  if (!code || !plainPass) {
    throw new Error('Employee code and password are required');
  }

  const acc = await getAccountByEmployeeCode(dbOrNull, code);

  // Generic credential error response for security (prevents user enumeration)
  const genericError = new Error('Invalid employee code or password');
  genericError.status = 401;

  if (!acc) {
    throw genericError;
  }

  // Check lockout
  const now = Date.now();
  if (acc.locked_until && new Date(acc.locked_until).getTime() > now) {
    const waitMins = Math.ceil((new Date(acc.locked_until).getTime() - now) / 60000);
    const lockErr = new Error(`Account temporarily locked due to consecutive failed attempts. Try again in ${waitMins} minute(s).`);
    lockErr.status = 429;
    throw lockErr;
  }

  // Check account status
  if (acc.account_status !== 'active') {
    const disabledErr = new Error('Your driver account has been disabled. Please contact the fleet office.');
    disabledErr.status = 403;
    throw disabledErr;
  }

  // Verify password hash
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

  // Successful login
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.last_login_at = new Date().toISOString();
  acc.last_login_ip = ip;
  acc.updated_at = new Date().toISOString();
  await saveAccountRecord(dbOrNull, acc);

  const mustChange = Boolean(acc.must_change_password);
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'access',
    pver: acc.password_version || 1,
    mustChange,
    iat: nowSec,
    exp: nowSec + (mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL)
  };
  const accessToken = signJwt(tokenPayload);

  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'refresh',
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
    expiresIn: mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL,
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
 * Mobile Authentication: Change Password
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
 * Strictly requires token type: refresh, and rejects refresh if first-login password change is still pending.
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

  if (acc.password_version !== payload.pver) {
    const err = new Error('Session has been revoked due to password change or administrative action');
    err.status = 401;
    err.code = 'SESSION_REVOKED';
    throw err;
  }

  // Reject refresh until temporary password is changed
  if (acc.must_change_password || payload.mustChange) {
    const err = new Error('Temporary password detected. You must change your password before tokens can be refreshed.');
    err.status = 403;
    err.code = 'PASSWORD_CHANGE_REQUIRED';
    throw err;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    type: 'access',
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
 * Returns null for genuinely missing assignments.
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
