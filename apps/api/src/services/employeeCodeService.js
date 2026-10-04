import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Concurrency-Safe Permanent Employee Code Service
 * Allocates non-reusable codes with D / E prefix and continuous sequence (D001, D002... D1000).
 */

export function getDatabase(customPath = null) {
  const p = customPath || global.dbFilePath || (fs.existsSync('./pb_data/data.db') ? './pb_data/data.db' : null);
  if (!p || !fs.existsSync(p)) {
    throw new Error(`Database file not accessible at: ${p}`);
  }
  return new DatabaseSync(p);
}

/**
 * Ensure system_counters table and uniqueness indexes exist.
 * Additive schema changes only.
 */
export function ensureSchema(db) {
  // 1. Counters table for concurrency-safe atomic sequence generation
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_counters (
      counter_name TEXT PRIMARY KEY,
      current_val INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Ensure employee_code and employee_number columns exist in employees table
  try { db.exec("ALTER TABLE employees ADD COLUMN employee_number INTEGER DEFAULT 0;"); } catch (_) {}
  try { db.exec("ALTER TABLE employees ADD COLUMN employee_code TEXT DEFAULT '';"); } catch (_) {}

  // 3. Unique index for database-level uniqueness enforcement (partial index ignoring empty strings)
  try {
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_code_unique 
      ON employees(employee_code) 
      WHERE employee_code != '' AND employee_code IS NOT NULL;
    `);
  } catch (_) {}

  // 4. Index on employee_number
  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(employee_number);");
  } catch (_) {}
}

/**
 * Seed or align the counters based on the highest existing code in database.
 * Never rolls backward.
 */
export function syncCountersFromExisting(db) {
  ensureSchema(db);

  // Find max driver number
  const driverRows = db.prepare(`
    SELECT employee_code FROM employees WHERE employee_code LIKE 'D%'
  `).all();
  let maxD = 0;
  for (const r of driverRows) {
    const num = parseInt(String(r.employee_code).replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > maxD) maxD = num;
  }

  // Find max staff number
  const staffRows = db.prepare(`
    SELECT employee_code FROM employees WHERE employee_code LIKE 'E%'
  `).all();
  let maxE = 0;
  for (const r of staffRows) {
    const num = parseInt(String(r.employee_code).replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > maxE) maxE = num;
  }

  // Update counters if higher than existing
  const currentD = db.prepare("SELECT current_val FROM system_counters WHERE counter_name = 'driver_code'").get();
  if (!currentD) {
    db.prepare("INSERT INTO system_counters (counter_name, current_val, updated_at) VALUES ('driver_code', ?, datetime('now'))").run(maxD);
  } else if (maxD > currentD.current_val) {
    db.prepare("UPDATE system_counters SET current_val = ?, updated_at = datetime('now') WHERE counter_name = 'driver_code'").run(maxD);
  }

  const currentE = db.prepare("SELECT current_val FROM system_counters WHERE counter_name = 'staff_code'").get();
  if (!currentE) {
    db.prepare("INSERT INTO system_counters (counter_name, current_val, updated_at) VALUES ('staff_code', ?, datetime('now'))").run(maxE);
  } else if (maxE > currentE.current_val) {
    db.prepare("UPDATE system_counters SET current_val = ?, updated_at = datetime('now') WHERE counter_name = 'staff_code'").run(maxE);
  }

  return { driverMax: maxD, staffMax: maxE };
}

/**
 * Concurrency-safe atomic allocation of the next permanent employee code.
 * @param {DatabaseSync} db SQLite database instance
 * @param {'driver'|'staff'} type Category of the employee
 * @returns {string} e.g. "D006", "E002", "D1000"
 */
export function allocateNextCode(db, type = 'driver') {
  ensureSchema(db);

  const isDriver = String(type).toLowerCase().includes('driver');
  const counterName = isDriver ? 'driver_code' : 'staff_code';
  const prefix = isDriver ? 'D' : 'E';

  db.exec('BEGIN IMMEDIATE;');
  try {
    // Check if counter row exists
    const row = db.prepare('SELECT current_val FROM system_counters WHERE counter_name = ?').get(counterName);
    let nextVal = 1;
    if (!row) {
      // Find current max in table to be safe
      const maxRows = db.prepare(`SELECT employee_code FROM employees WHERE employee_code LIKE '${prefix}%'`).all();
      let maxNum = 0;
      for (const r of maxRows) {
        const n = parseInt(String(r.employee_code).replace(/\D/g, ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
      nextVal = maxNum + 1;
      db.prepare('INSERT INTO system_counters (counter_name, current_val, updated_at) VALUES (?, ?, datetime(\'now\'))').run(counterName, nextVal);
    } else {
      nextVal = row.current_val + 1;
      db.prepare('UPDATE system_counters SET current_val = ?, updated_at = datetime(\'now\') WHERE counter_name = ?').run(nextVal, counterName);
    }

    db.exec('COMMIT;');

    // Format code: 3 digits padded with 0 (e.g., 001..999), or full number if >= 1000
    const formattedNum = nextVal < 1000 ? String(nextVal).padStart(3, '0') : String(nextVal);
    return `${prefix}${formattedNum}`;
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    throw err;
  }
}

/**
 * Preview codes for all existing employees without modifying the database.
 * Stably ordered by created timestamp, then id.
 */
export function previewBackfill(db) {
  ensureSchema(db);

  const employees = db.prepare(`
    SELECT id, name, employee_type, active_status, employee_code, employee_number, created
    FROM employees
    ORDER BY created ASC, id ASC
  `).all();

  let nextD = 1;
  let nextE = 1;

  // First pass: identify existing assigned codes
  const existingCodes = new Set();
  employees.forEach(e => {
    const code = (e.employee_code || '').trim().toUpperCase();
    if (/^[DE]\d{3,}$/.test(code)) {
      existingCodes.add(code);
      const num = parseInt(code.slice(1), 10);
      if (code.startsWith('D') && num >= nextD) nextD = num + 1;
      if (code.startsWith('E') && num >= nextE) nextE = num + 1;
    }
  });

  const preview = employees.map(e => {
    const existingCode = (e.employee_code || '').trim().toUpperCase();
    const hasValidExisting = /^[DE]\d{3,}$/.test(existingCode);

    const typeStr = (e.employee_type || '').toLowerCase().trim();
    let isDriver = false;
    let isStaff = false;
    let isAmbiguous = false;

    if (typeStr.includes('driver')) {
      isDriver = true;
    } else if (typeStr.includes('manager') || typeStr.includes('staff') || typeStr.includes('admin') || typeStr.includes('accountant') || typeStr.includes('office')) {
      isStaff = true;
    } else if (!typeStr) {
      isAmbiguous = true;
    } else {
      isStaff = true; // Default fallback with warning
    }

    let proposedCode = existingCode;
    let status = 'EXISTING_KEPT';

    if (!hasValidExisting) {
      if (isAmbiguous) {
        status = 'FLAGGED_AMBIGUOUS_ROLE';
        proposedCode = 'PENDING_OFFICE_REVIEW';
      } else if (isDriver) {
        while (existingCodes.has(`D${nextD < 1000 ? String(nextD).padStart(3, '0') : nextD}`)) {
          nextD++;
        }
        proposedCode = `D${nextD < 1000 ? String(nextD).padStart(3, '0') : nextD}`;
        existingCodes.add(proposedCode);
        nextD++;
        status = 'NEW_ASSIGNMENT';
      } else {
        while (existingCodes.has(`E${nextE < 1000 ? String(nextE).padStart(3, '0') : nextE}`)) {
          nextE++;
        }
        proposedCode = `E${nextE < 1000 ? String(nextE).padStart(3, '0') : nextE}`;
        existingCodes.add(proposedCode);
        nextE++;
        status = 'NEW_ASSIGNMENT';
      }
    }

    return {
      id: e.id,
      name: e.name,
      employee_type: e.employee_type,
      active_status: e.active_status,
      created: e.created,
      current_code: existingCode || null,
      proposed_code: proposedCode,
      status
    };
  });

  return {
    totalEmployees: employees.length,
    preview,
    nextDriverCounter: nextD,
    nextStaffCounter: nextE
  };
}

/**
 * Execute additive backfill on SQLite database.
 * Retries are 100% idempotent.
 */
export function applyBackfill(db) {
  ensureSchema(db);
  const { preview, nextDriverCounter, nextStaffCounter } = previewBackfill(db);

  db.exec('BEGIN IMMEDIATE;');
  try {
    const updateStmt = db.prepare('UPDATE employees SET employee_code = ? WHERE id = ?');
    for (const item of preview) {
      if (item.status === 'NEW_ASSIGNMENT' && item.proposed_code.startsWith('D') || item.proposed_code.startsWith('E')) {
        updateStmt.run(item.proposed_code, item.id);
      }
    }

    // Align counters
    db.prepare(`
      INSERT INTO system_counters (counter_name, current_val, updated_at) 
      VALUES ('driver_code', ?, datetime('now'))
      ON CONFLICT(counter_name) DO UPDATE 
      SET current_val = MAX(current_val, excluded.current_val), updated_at = datetime('now');
    `).run(nextDriverCounter - 1);

    db.prepare(`
      INSERT INTO system_counters (counter_name, current_val, updated_at) 
      VALUES ('staff_code', ?, datetime('now'))
      ON CONFLICT(counter_name) DO UPDATE 
      SET current_val = MAX(current_val, excluded.current_val), updated_at = datetime('now');
    `).run(nextStaffCounter - 1);

    db.exec('COMMIT;');
    return { success: true, processed: preview };
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    throw err;
  }
}
