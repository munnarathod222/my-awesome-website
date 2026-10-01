import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as auditService from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const BANK_DETAILS_FILE = path.join(DATA_DIR, 'employee_bank_details.json');

// Initialize with baseline bank records if not exists
const DEFAULT_BANK_DETAILS = {
  "bpuppzyfbttdf1i": {
    "employee_id": "bpuppzyfbttdf1i",
    "employee_name": "Vinod Kumar Rathod",
    "account_holder_name": "Vinod Kumar Rathod",
    "bank_name": "State Bank of India",
    "account_number": "38291048591",
    "ifsc_code": "SBIN0020188",
    "branch_name": "Ghatkesar Main Branch",
    "account_type": "Salary",
    "upi_id": "6281618046@sbi",
    "verification_status": "Verified",
    "notes": "Primary executive disbursement account",
    "updated_at": "2026-02-15T10:30:00.000Z"
  },
  "k7jaz5lqellbxtb": {
    "employee_id": "k7jaz5lqellbxtb",
    "employee_name": "Dayanand surwase",
    "account_holder_name": "Dayanand Surwase",
    "bank_name": "Bank of Baroda",
    "account_number": "49200100018472",
    "ifsc_code": "BARB0VAPIND",
    "branch_name": "Vapi Industrial Estate",
    "account_type": "Savings",
    "upi_id": "8341571334@barodampay",
    "verification_status": "Verified",
    "notes": "Verified via passbook copy",
    "updated_at": "2026-02-18T14:20:00.000Z"
  }
};

function readBankFile() {
  try {
    if (fs.existsSync(BANK_DETAILS_FILE)) {
      const raw = fs.readFileSync(BANK_DETAILS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[EmployeeBankService] Read error:', err.message);
  }
  // If file doesn't exist, write defaults
  try {
    fs.writeFileSync(BANK_DETAILS_FILE, JSON.stringify(DEFAULT_BANK_DETAILS, null, 2), 'utf8');
  } catch (e) {}
  return { ...DEFAULT_BANK_DETAILS };
}

function writeBankFile(data) {
  try {
    fs.writeFileSync(BANK_DETAILS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[EmployeeBankService] Write error:', err.message);
    return false;
  }
}

/**
 * Sync bank columns into local SQLite tables if accessible
 */
async function syncToSqlite(employeeId, details) {
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const possiblePaths = [
      global.dbFilePath,
      path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
      path.resolve(process.cwd(), 'pb_data/data.db'),
      path.resolve(process.cwd(), 'tools/live_server_backup.db'),
      '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
    ].filter(p => p && fs.existsSync(p));

    for (const dbPath of possiblePaths) {
      let db;
      try {
        db = new DatabaseSync(dbPath);
        // Ensure columns exist
        const bankCols = [
          'bank_name TEXT DEFAULT ""',
          'account_number TEXT DEFAULT ""',
          'ifsc_code TEXT DEFAULT ""',
          'account_holder_name TEXT DEFAULT ""',
          'branch_name TEXT DEFAULT ""',
          'account_type TEXT DEFAULT "Savings"',
          'upi_id TEXT DEFAULT ""'
        ];
        for (const colDef of bankCols) {
          try { db.exec(`ALTER TABLE employees ADD COLUMN ${colDef};`); } catch (_) {}
        }

        db.prepare(`
          UPDATE employees SET
            bank_name = ?,
            account_number = ?,
            ifsc_code = ?,
            account_holder_name = ?,
            branch_name = ?,
            account_type = ?,
            upi_id = ?
          WHERE id = ? OR name = ?
        `).run(
          details.bank_name || '',
          details.account_number || '',
          details.ifsc_code || '',
          details.account_holder_name || '',
          details.branch_name || '',
          details.account_type || 'Savings',
          details.upi_id || '',
          employeeId,
          details.employee_name || ''
        );
      } catch (sqErr) {
        // Ignored if table not ready
      } finally {
        if (db) {
          try { db.close(); } catch (_) {}
        }
      }
    }
  } catch (_) {}
}

/**
 * Get all employee bank account records mapped by employee ID
 */
export function getAllBankDetails() {
  return readBankFile();
}

/**
 * Get bank details for a specific employee
 */
export function getBankDetails(employeeId) {
  if (!employeeId) return null;
  const all = readBankFile();
  return all[employeeId] || null;
}

/**
 * Save or update bank details for an employee
 */
export function saveBankDetails(employeeId, data, actor = {}) {
  if (!employeeId) {
    throw new Error('Employee ID is required');
  }

  const cleanAccNum = String(data.account_number || '').replace(/[\s-]/g, '');
  const cleanIfsc = String(data.ifsc_code || '').trim().toUpperCase();

  if (!data.bank_name || !data.bank_name.trim()) {
    throw new Error('Bank Name is required');
  }
  if (!cleanAccNum) {
    throw new Error('Bank Account Number is required');
  }
  if (!cleanIfsc) {
    throw new Error('IFSC Code is required');
  }

  const all = readBankFile();
  const existing = all[employeeId] || {};

  const record = {
    employee_id: employeeId,
    employee_name: data.employee_name || existing.employee_name || 'Staff Member',
    account_holder_name: (data.account_holder_name || data.employee_name || existing.account_holder_name || '').trim(),
    bank_name: data.bank_name.trim(),
    account_number: cleanAccNum,
    ifsc_code: cleanIfsc,
    branch_name: (data.branch_name || existing.branch_name || '').trim(),
    account_type: data.account_type || existing.account_type || 'Savings',
    upi_id: (data.upi_id || existing.upi_id || '').trim().toLowerCase(),
    verification_status: data.verification_status || existing.verification_status || 'Verified',
    notes: (data.notes || existing.notes || '').trim(),
    updated_at: new Date().toISOString(),
    updated_by: actor.name || actor.email || 'Administrator'
  };

  all[employeeId] = record;
  writeBankFile(all);

  // Sync to SQLite if possible
  syncToSqlite(employeeId, record).catch(() => {});

  // Ingest security audit event
  try {
    auditService.ingestEvent({
      module: 'HR_PAYROLL',
      action: existing.account_number ? 'UPDATE_BANK_DETAILS' : 'ADD_BANK_DETAILS',
      severity: 'HIGH',
      description: `Bank account details ${existing.account_number ? 'updated' : 'added'} for employee ${record.employee_name} (${record.bank_name} - A/C Ending ${cleanAccNum.slice(-4)})`,
      actor: {
        id: actor.id || 'usr_admin',
        name: actor.name || 'System Administrator',
        role: actor.role || 'superuser'
      },
      entity: {
        type: 'EMPLOYEE_BANK_ACCOUNT',
        id: employeeId,
        label: `${record.employee_name} (${record.bank_name})`
      },
      changes: {
        bank_name: { old: existing.bank_name || null, new: record.bank_name },
        account_last4: { old: existing.account_number ? existing.account_number.slice(-4) : null, new: cleanAccNum.slice(-4) },
        ifsc_code: { old: existing.ifsc_code || null, new: cleanIfsc }
      }
    });
  } catch (auditErr) {
    console.error('[EmployeeBankService] Audit log error:', auditErr.message);
  }

  return record;
}

/**
 * Remove bank details for an employee
 */
export function deleteBankDetails(employeeId, actor = {}) {
  if (!employeeId) return false;
  const all = readBankFile();
  if (!all[employeeId]) return false;

  const old = all[employeeId];
  delete all[employeeId];
  writeBankFile(all);

  try {
    auditService.ingestEvent({
      module: 'HR_PAYROLL',
      action: 'REMOVE_BANK_DETAILS',
      severity: 'HIGH',
      description: `Bank account details removed for employee ${old.employee_name} (${old.bank_name} - A/C Ending ${String(old.account_number).slice(-4)})`,
      actor: {
        id: actor.id || 'usr_admin',
        name: actor.name || 'System Administrator',
        role: actor.role || 'superuser'
      },
      entity: {
        type: 'EMPLOYEE_BANK_ACCOUNT',
        id: employeeId,
        label: old.employee_name
      }
    });
  } catch (e) {}

  return true;
}
