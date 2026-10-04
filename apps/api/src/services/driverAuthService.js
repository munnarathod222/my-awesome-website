import fs from 'node:fs';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import * as employeeCodeService from './employeeCodeService.js';
import * as auditService from './auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'jbc-enterprise-driver-mobile-auth-token-key-2026';
const TOKEN_EXPIRY_NORMAL = 7 * 24 * 3600; // 7 days in seconds
const TOKEN_EXPIRY_MUST_CHANGE = 1800; // 30 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 3600; // 30 days in seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get active SQLite database connection
 */
export function getDb(customPath = null) {
  const p = customPath || global.dbFilePath || (fs.existsSync('./pb_data/data.db') ? './pb_data/data.db' : null);
  if (!p || !fs.existsSync(p)) {
    throw new Error(`Database file not accessible at: ${p}`);
  }
  return new DatabaseSync(p);
}

/**
 * Ensure driver_app_accounts table exists in SQLite
 */
export function ensureDriverAuthSchema(db) {
  employeeCodeService.ensureSchema(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS driver_app_accounts (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL UNIQUE,
      employee_code TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'active',
      must_change_password INTEGER NOT NULL DEFAULT 1,
      password_version INTEGER NOT NULL DEFAULT 1,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT DEFAULT NULL,
      last_login_at TEXT DEFAULT NULL,
      last_login_ip TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_accounts_emp_id ON driver_app_accounts(employee_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_accounts_emp_code ON driver_app_accounts(employee_code);
  `);
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
 * e.g., JBC-7wK9#m
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
 * Office operation: Create Driver App Account for an existing employee
 */
export function createDriverAccount(db, { employeeId, temporaryPassword, createdBy = 'Office' }) {
  ensureDriverAuthSchema(db);

  // 1. Verify employee exists in employees table
  const emp = db.prepare('SELECT id, name, employee_type, active_status, employee_code, assigned_truck FROM employees WHERE id = ?').get(employeeId);
  if (!emp) {
    throw new Error('Employee record not found in directory');
  }

  // 2. Reject ineligible employees (must be a driver)
  const isDriver = (emp.employee_type || '').toLowerCase().includes('driver');
  if (!isDriver) {
    throw new Error('Ineligible employee: App accounts can only be created for drivers');
  }

  // 3. Ensure employee has a permanent code assigned
  let code = (emp.employee_code || '').trim().toUpperCase();
  if (!code || !/^[DE]\d{3,}$/.test(code)) {
    code = employeeCodeService.allocateNextCode(db, 'driver');
    db.prepare('UPDATE employees SET employee_code = ? WHERE id = ?').run(code, emp.id);
  }

  // 4. Enforce one driver account per employee
  const existingAccount = db.prepare('SELECT id, employee_code FROM driver_app_accounts WHERE employee_id = ?').get(emp.id);
  if (existingAccount) {
    throw new Error(`Driver already has an active login account (Code: ${existingAccount.employee_code})`);
  }

  // 5. Generate or use provided password
  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);
  const accountId = `drv_acc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  db.prepare(`
    INSERT INTO driver_app_accounts (
      id, employee_id, employee_code, password_hash, account_status,
      must_change_password, password_version, failed_login_attempts,
      locked_until, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'active', 1, 1, 0, NULL, datetime('now'), datetime('now'))
  `).run(accountId, emp.id, code, hash);

  // Record audit event
  try {
    auditService.ingestEvent({
      action: 'DRIVER_ACCOUNT_CREATED',
      actor_id: createdBy,
      target_type: 'employee',
      target_id: emp.id,
      notes: `Driver app account created for ${emp.name} (${code})`
    });
  } catch (_) {}

  return {
    success: true,
    accountId,
    employeeId: emp.id,
    employeeCode: code,
    employeeName: emp.name,
    temporaryPassword: tempPass,
    mustChangePassword: true,
    message: 'Account created successfully. Provide the temporary password securely to the driver. It cannot be viewed again.'
  };
}

/**
 * Office operation: Reset Driver Password
 */
export function resetDriverPassword(db, { employeeId, temporaryPassword, resetBy = 'Office' }) {
  ensureDriverAuthSchema(db);

  const acc = db.prepare('SELECT id, employee_id, employee_code, password_version FROM driver_app_accounts WHERE employee_id = ?').get(employeeId);
  if (!acc) {
    throw new Error('No driver app account exists for this employee');
  }

  const tempPass = temporaryPassword || generateTemporaryPassword();
  const hash = hashPassword(tempPass);
  const nextVer = acc.password_version + 1; // Immediately revokes all active sessions

  db.prepare(`
    UPDATE driver_app_accounts 
    SET password_hash = ?, 
        must_change_password = 1, 
        password_version = ?, 
        failed_login_attempts = 0, 
        locked_until = NULL, 
        updated_at = datetime('now')
    WHERE id = ?
  `).run(hash, nextVer, acc.id);

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
export function setAccountStatus(db, { employeeId, status, updatedBy = 'Office' }) {
  ensureDriverAuthSchema(db);

  const validStatuses = ['active', 'disabled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Allowed values: active, disabled');
  }

  const acc = db.prepare('SELECT id, employee_id, employee_code, password_version, account_status FROM driver_app_accounts WHERE employee_id = ?').get(employeeId);
  if (!acc) {
    throw new Error('No driver app account found for this employee');
  }

  // If disabling, bump password_version to revoke any ongoing sessions
  const nextVer = status === 'disabled' ? acc.password_version + 1 : acc.password_version;

  db.prepare(`
    UPDATE driver_app_accounts 
    SET account_status = ?, 
        password_version = ?, 
        updated_at = datetime('now') 
    WHERE id = ?
  `).run(status, nextVer, acc.id);

  try {
    auditService.ingestEvent({
      action: 'DRIVER_ACCOUNT_STATUS_CHANGE',
      actor_id: updatedBy,
      target_type: 'driver_account',
      target_id: acc.id,
      notes: `Driver ${acc.employee_code} status changed from ${acc.account_status} to ${status}`
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
export function getAccountStatus(db, employeeId) {
  ensureDriverAuthSchema(db);

  const acc = db.prepare(`
    SELECT id, employee_id, employee_code, account_status, must_change_password, 
           last_login_at, locked_until, created_at, updated_at
    FROM driver_app_accounts
    WHERE employee_id = ?
  `).get(employeeId);

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
export function authenticateLogin(db, { employeeCode, password, ip = '127.0.0.1' }) {
  ensureDriverAuthSchema(db);

  const code = String(employeeCode || '').trim().toUpperCase();
  const plainPass = String(password || '').trim();

  if (!code || !plainPass) {
    throw new Error('Employee code and password are required');
  }

  const acc = db.prepare(`
    SELECT id, employee_id, employee_code, password_hash, account_status,
           must_change_password, password_version, failed_login_attempts, locked_until
    FROM driver_app_accounts
    WHERE employee_code = ?
  `).get(code);

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
    const failed = (acc.failed_login_attempts || 0) + 1;
    let lockTime = null;
    if (failed >= MAX_FAILED_ATTEMPTS) {
      lockTime = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    }

    db.prepare(`
      UPDATE driver_app_accounts 
      SET failed_login_attempts = ?, locked_until = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(failed, lockTime, acc.id);

    throw genericError;
  }

  // Successful login: reset failed attempts, update login metadata
  db.prepare(`
    UPDATE driver_app_accounts 
    SET failed_login_attempts = 0, 
        locked_until = NULL, 
        last_login_at = datetime('now'), 
        last_login_ip = ?, 
        updated_at = datetime('now')
    WHERE id = ?
  `).run(ip, acc.id);

  // Fetch employee record details
  const emp = db.prepare('SELECT id, name, employee_type, active_status, assigned_truck, contact FROM employees WHERE id = ?').get(acc.employee_id);

  const mustChange = Boolean(acc.must_change_password);
  const nowSec = Math.floor(Date.now() / 1000);

  // Access Token
  const tokenPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    role: 'driver',
    pver: acc.password_version,
    mustChange,
    iat: nowSec,
    exp: nowSec + (mustChange ? TOKEN_EXPIRY_MUST_CHANGE : TOKEN_EXPIRY_NORMAL)
  };
  const accessToken = signJwt(tokenPayload);

  // Refresh Token
  const refreshPayload = {
    sub: acc.employee_id,
    code: acc.employee_code,
    pver: acc.password_version,
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
      id: emp.id,
      employeeCode: acc.employee_code,
      name: emp.name,
      role: emp.employee_type || 'driver',
      status: emp.active_status || 'active',
      assignedTruck: emp.assigned_truck || null,
      contact: emp.contact || null
    }
  };
}

/**
 * Mobile Authentication: Change Password
 * Required on first login, and callable anytime by authenticated driver
 */
export function changeDriverPassword(db, { employeeId, currentPassword, newPassword }) {
  ensureDriverAuthSchema(db);

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const acc = db.prepare(`
    SELECT id, employee_id, employee_code, password_hash, password_version, account_status
    FROM driver_app_accounts
    WHERE employee_id = ?
  `).get(employeeId);

  if (!acc) {
    throw new Error('Driver account not found');
  }

  if (acc.account_status !== 'active') {
    throw new Error('Account is disabled');
  }

  // Verify current password
  if (!verifyPassword(currentPassword, acc.password_hash)) {
    throw new Error('Current password is incorrect');
  }

  // Prevent reusing same password
  if (verifyPassword(newPassword, acc.password_hash)) {
    throw new Error('New password cannot be the same as the current password');
  }

  const newHash = hashPassword(newPassword);
  const nextVer = acc.password_version + 1; // Revoke old sessions

  db.prepare(`
    UPDATE driver_app_accounts 
    SET password_hash = ?, 
        must_change_password = 0, 
        password_version = ?, 
        failed_login_attempts = 0, 
        locked_until = NULL, 
        updated_at = datetime('now')
    WHERE id = ?
  `).run(newHash, nextVer, acc.id);

  // Generate new standard session token
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
export function refreshSessionToken(db, { refreshToken }) {
  ensureDriverAuthSchema(db);

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
  const acc = db.prepare(`
    SELECT id, employee_id, employee_code, password_version, account_status, must_change_password
    FROM driver_app_accounts
    WHERE employee_id = ?
  `).get(payload.sub);

  if (!acc) {
    const err = new Error('Account no longer exists');
    err.status = 401;
    throw err;
  }

  if (acc.account_status !== 'active') {
    const err = new Error('Account has been disabled');
    err.status = 403;
    throw err;
  }

  // Session revocation check: verify password_version hasn't changed
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
 * Mobile Authentication: Invalidate Session (Logout)
 */
export function logoutDriver(db, { employeeId }) {
  ensureDriverAuthSchema(db);

  // Increment password_version to invalidate tokens across devices
  db.prepare(`
    UPDATE driver_app_accounts 
    SET password_version = password_version + 1, updated_at = datetime('now')
    WHERE employee_id = ?
  `).run(employeeId);

  return {
    success: true,
    message: 'Logged out successfully'
  };
}

/**
 * Retrieve verified driver profile with assigned truck and supervisor
 */
export function getDriverProfile(db, employeeId) {
  ensureDriverAuthSchema(db);

  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);

  if (!emp) {
    throw new Error('Employee record not found');
  }

  const acc = db.prepare(`
    SELECT id, employee_code, account_status, must_change_password, last_login_at
    FROM driver_app_accounts
    WHERE employee_id = ?
  `).get(employeeId);

  // If assigned_truck is specified, look up truck info
  let truckInfo = null;
  if (emp.assigned_truck) {
    try {
      const truck = db.prepare(`
        SELECT id, truck_number, truck_code, model, capacity, status 
        FROM trucks 
        WHERE truck_number = ? OR id = ?
      `).get(emp.assigned_truck, emp.assigned_truck);

      if (truck) {
        truckInfo = {
          id: truck.id,
          truckNumber: truck.truck_number,
          truckCode: truck.truck_code || null,
          model: truck.model || null,
          capacity: truck.capacity || null,
          status: truck.status || 'Active'
        };
      } else {
        truckInfo = { truckNumber: emp.assigned_truck };
      }
    } catch (_) {
      truckInfo = { truckNumber: emp.assigned_truck };
    }
  }

  // Supervisor info: lookup manager in employees or users
  let supervisorInfo = null;
  try {
    const mgr = db.prepare(`
      SELECT id, name, employee_code, contact 
      FROM employees 
      WHERE employee_type LIKE '%manager%' OR employee_type LIKE '%admin%' 
      LIMIT 1
    `).get();

    if (mgr) {
      supervisorInfo = {
        id: mgr.id,
        name: mgr.name,
        code: mgr.employee_code || null,
        contact: mgr.contact || null
      };
    }
  } catch (_) {}

  return {
    id: emp.id,
    employeeCode: emp.employee_code || (acc ? acc.employee_code : null),
    name: emp.name,
    role: emp.employee_type || 'driver',
    status: emp.active_status || 'active',
    accountStatus: acc ? acc.account_status : 'unregistered',
    mustChangePassword: acc ? Boolean(acc.must_change_password) : false,
    lastLoginAt: acc ? acc.last_login_at : null,
    contact: emp.contact,
    licenseNumber: emp.license_number,
    joiningDate: emp.joining_date,
    assignedTruck: truckInfo,
    assignedSupervisor: supervisorInfo
  };
}
