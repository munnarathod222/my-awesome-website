import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as employeeCodeService from './employeeCodeService.js';
import * as auditService from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDataDir() {
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../../../../data'),
    path.resolve(__dirname, '../../../data'),
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

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'jbc-enterprise-driver-mobile-auth-token-key-2026';
const TOKEN_EXPIRY_NORMAL = 7 * 24 * 3600; // 7 days in seconds
const TOKEN_EXPIRY_MUST_CHANGE = 1800; // 30 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 3600; // 30 days in seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

let accountsCache = null;

function loadAccounts() {
  if (accountsCache) return accountsCache;
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      accountsCache = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    }
  } catch (_) {}
  if (!accountsCache) {
    accountsCache = {};
    saveAccounts();
  }
  return accountsCache;
}

function saveAccounts() {
  try {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accountsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[DriverAuthService] Failed to save accounts:', err.message);
  }
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
export function ensureDriverAuthSchema() {
  employeeCodeService.ensureSchema();
  loadAccounts();
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
export function signJwt(payload, secret = JWT_SECRET) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Custom JWT verifier
 */
export function verifyJwt(token, secret = JWT_SECRET) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      return { valid: false, error: 'Malformed token' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
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
    return { valid: false, error: err.message };
  }
}

/**
 * Helper to lookup employee details from employee_codes or SQLite/PocketBase
 */
function findEmployee(employeeId) {
  // Check baseline code registry
  const code = employeeCodeService.getCodeForEmployee(employeeId);
  return {
    id: employeeId,
    name: 'Driver',
    employee_code: code || 'D001',
    employee_type: 'driver',
    active_status: 'active'
  };
}

/**
 * Office operation: Create Driver App Account for an existing employee
 */
export function createDriverAccount(dbOrNull, { employeeId, temporaryPassword, createdBy = 'Office' }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  // Enforce one driver account per employee
  const existingId = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (existingId) {
    throw new Error(`Driver already has an active login account (Code: ${accounts[existingId].employee_code})`);
  }

  // Ensure employee has a permanent code
  let code = employeeCodeService.getCodeForEmployee(employeeId);
  if (!code) {
    code = employeeCodeService.allocateNextCode('driver');
    employeeCodeService.setCodeForEmployee(employeeId, code);
  }

  // Ensure code is not already bound to another account
  const codeOwner = Object.keys(accounts).find(k => accounts[k].employee_code === code);
  if (codeOwner) {
    throw new Error(`Account with code ${code} already exists`);
  }

  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);
  const accountId = `drv_acc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  accounts[accountId] = {
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
  saveAccounts();

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
export function resetDriverPassword(dbOrNull, { employeeId, temporaryPassword, resetBy = 'Office' }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (!accKey) {
    throw new Error('No driver app account exists for this employee');
  }

  const acc = accounts[accKey];
  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);

  acc.password_hash = hash;
  acc.must_change_password = true;
  acc.password_version = (acc.password_version || 1) + 1; // Immediately revokes all active sessions
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.updated_at = new Date().toISOString();

  saveAccounts();

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
export function setAccountStatus(dbOrNull, { employeeId, status, updatedBy = 'Office' }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const validStatuses = ['active', 'disabled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Allowed values: active, disabled');
  }

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (!accKey) {
    throw new Error('No driver app account found for this employee');
  }

  const acc = accounts[accKey];
  const oldStatus = acc.account_status;
  acc.account_status = status;
  if (status === 'disabled') {
    acc.password_version = (acc.password_version || 1) + 1; // Invalidate current tokens
  }
  acc.updated_at = new Date().toISOString();

  saveAccounts();

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
export function getAccountStatus(dbOrNull, employeeId) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (!accKey) {
    return { hasAccount: false };
  }

  const acc = accounts[accKey];
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
export function authenticateLogin(dbOrNull, { employeeCode, password, ip = '127.0.0.1' }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const code = String(employeeCode || '').trim().toUpperCase();
  const plainPass = String(password || '').trim();

  if (!code || !plainPass) {
    throw new Error('Employee code and password are required');
  }

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_code === code);

  // Generic credential error response for security (prevents user enumeration)
  const genericError = new Error('Invalid employee code or password');
  genericError.status = 401;

  if (!accKey) {
    throw genericError;
  }

  const acc = accounts[accKey];

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
    saveAccounts();

    throw genericError;
  }

  // Successful login
  acc.failed_login_attempts = 0;
  acc.locked_until = null;
  acc.last_login_at = new Date().toISOString();
  acc.last_login_ip = ip;
  acc.updated_at = new Date().toISOString();
  saveAccounts();

  const mustChange = Boolean(acc.must_change_password);
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    pver: acc.password_version || 1,
    mustChange,
    iat: nowSec,
    exp: nowSec + (mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL)
  };
  const accessToken = signJwt(tokenPayload);

  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    pver: acc.password_version || 1,
    type: 'refresh',
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
export function changeDriverPassword(dbOrNull, { employeeId, currentPassword, newPassword }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (!accKey) {
    throw new Error('Driver account not found');
  }

  const acc = accounts[accKey];
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
  saveAccounts();

  const nextVer = acc.password_version;
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    pver: nextVer,
    mustChange: false,
    iat: nowSec,
    exp: nowSec + TOKEN_EXPIRY_NORMAL
  };
  const accessToken = signJwt(tokenPayload);

  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    pver: nextVer,
    type: 'refresh',
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
 */
export function refreshSessionToken(dbOrNull, { refreshToken }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const result = verifyJwt(refreshToken);
  if (!result.valid || result.payload.type !== 'refresh') {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    throw err;
  }

  const payload = result.payload;
  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === payload.sub);

  if (!accKey) {
    const err = new Error('Account no longer exists');
    err.status = 401;
    throw err;
  }

  const acc = accounts[accKey];
  if (acc.account_status !== 'active') {
    const err = new Error('Account has been disabled');
    err.status = 403;
    throw err;
  }

  if (acc.password_version !== payload.pver) {
    const err = new Error('Session has been revoked due to password change or administrative action');
    err.status = 401;
    throw err;
  }

  const mustChange = Boolean(acc.must_change_password);
  const nowSec = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    pver: acc.password_version,
    mustChange,
    iat: nowSec,
    exp: nowSec + (mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL)
  };
  const newAccessToken = signJwt(tokenPayload);

  return {
    success: true,
    tokenType: 'Bearer',
    accessToken: newAccessToken,
    expiresIn: mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL,
    mustChangePassword: mustChange
  };
}

/**
 * Mobile Authentication: Logout
 */
export function logoutDriver(dbOrNull, { employeeId }) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  if (accKey) {
    accounts[accKey].password_version = (accounts[accKey].password_version || 1) + 1;
    accounts[accKey].updated_at = new Date().toISOString();
    saveAccounts();
  }

  return {
    success: true,
    message: 'Logged out successfully'
  };
}

/**
 * Get driver profile for mobile app
 */
export function getDriverProfile(dbOrNull, employeeId) {
  ensureDriverAuthSchema();
  const accounts = loadAccounts();

  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  const acc = accKey ? accounts[accKey] : null;

  const code = acc ? acc.employee_code : employeeCodeService.getCodeForEmployee(employeeId);

  return {
    id: employeeId,
    employeeCode: code || 'D001',
    name: 'Commercial Fleet Driver',
    role: 'driver',
    status: 'active',
    accountStatus: acc ? acc.account_status : 'unregistered',
    mustChangePassword: acc ? Boolean(acc.must_change_password) : false,
    lastLoginAt: acc ? acc.last_login_at : null,
    assignedTruck: null,
    assignedSupervisor: {
      name: 'Vinod Kumar Rathod',
      code: 'E001'
    }
  };
}

/**
 * Lookup account by employeeId
 */
export function findAccountByEmployeeId(employeeId) {
  const accounts = loadAccounts();
  const accKey = Object.keys(accounts).find(k => accounts[k].employee_id === employeeId);
  return accKey ? accounts[accKey] : null;
}
