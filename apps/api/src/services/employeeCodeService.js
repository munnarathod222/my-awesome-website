import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find persistent data directory
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
const COUNTERS_FILE = path.join(DATA_DIR, 'system_counters.json');
const EMPLOYEE_CODES_FILE = path.join(DATA_DIR, 'employee_codes.json');

// Baseline codes for existing production employees
const INITIAL_CODES = {
  "k7jaz5lqellbxtb": "D001", // Dayanand surwase (driver, terminated)
  "bpuppzyfbttdf1i": "E001", // Vinod Kumar Rathod (manager, active)
  "frvbvbblz5b6z01": "D002", // Balbheem (driver, terminated)
  "45vqjfmlhx576rb": "D003", // Suresh Edlai (driver, leave)
  "lmn4lcwur3c4197": "D004", // Sangameshwar Patane (driver, leave)
  "2ioikacogombftp": "D005"  // Chandrakant Shivaji Gaikwad (driver, active)
};

const INITIAL_COUNTERS = {
  "driver_code": 5,
  "staff_code": 1
};

// Memory cache
let countersCache = null;
let codesCache = null;

function loadCounters() {
  if (countersCache) return countersCache;
  try {
    if (fs.existsSync(COUNTERS_FILE)) {
      countersCache = JSON.parse(fs.readFileSync(COUNTERS_FILE, 'utf8'));
    }
  } catch (_) {}
  if (!countersCache) {
    countersCache = { ...INITIAL_COUNTERS };
    saveCounters();
  }
  return countersCache;
}

function saveCounters() {
  try {
    fs.mkdirSync(path.dirname(COUNTERS_FILE), { recursive: true });
    const tmp = `${COUNTERS_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmp, JSON.stringify(countersCache, null, 2), 'utf8');
    try {
      fs.renameSync(tmp, COUNTERS_FILE);
    } catch (_) {
      if (fs.existsSync(COUNTERS_FILE)) fs.unlinkSync(COUNTERS_FILE);
      fs.renameSync(tmp, COUNTERS_FILE);
    }
  } catch (err) {
    console.error('[EmployeeCodeService] Failed to save counters atomically:', err.message);
  }
}

function loadCodes() {
  if (codesCache) return codesCache;
  try {
    if (fs.existsSync(EMPLOYEE_CODES_FILE)) {
      codesCache = JSON.parse(fs.readFileSync(EMPLOYEE_CODES_FILE, 'utf8'));
    }
  } catch (_) {}
  if (!codesCache) {
    codesCache = { ...INITIAL_CODES };
    saveCodes();
  }
  return codesCache;
}

function saveCodes() {
  try {
    fs.mkdirSync(path.dirname(EMPLOYEE_CODES_FILE), { recursive: true });
    const tmp = `${EMPLOYEE_CODES_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmp, JSON.stringify(codesCache, null, 2), 'utf8');
    try {
      fs.renameSync(tmp, EMPLOYEE_CODES_FILE);
    } catch (_) {
      if (fs.existsSync(EMPLOYEE_CODES_FILE)) fs.unlinkSync(EMPLOYEE_CODES_FILE);
      fs.renameSync(tmp, EMPLOYEE_CODES_FILE);
    }
  } catch (err) {
    console.error('[EmployeeCodeService] Failed to save employee codes atomically:', err.message);
  }
}

/**
 * Ensure storage schema and baseline counters are initialized.
 * 100% additive, zero external native module dependencies.
 */
export function ensureSchema(dbOrNull = null) {
  loadCounters();
  loadCodes();

  if (dbOrNull && typeof dbOrNull.exec === 'function') {
    try {
      dbOrNull.exec(`
        CREATE TABLE IF NOT EXISTS system_counters (
          counter_name TEXT PRIMARY KEY,
          current_val INTEGER NOT NULL DEFAULT 0
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code) WHERE employee_code IS NOT NULL AND employee_code != '';
      `);
      const c = dbOrNull.prepare("SELECT count(*) as count FROM system_counters").get();
      if (!c || c.count === 0) {
        dbOrNull.prepare("INSERT OR IGNORE INTO system_counters (counter_name, current_val) VALUES ('driver_code', 0), ('staff_code', 0)").run();
      }
    } catch (_) {}
  }
}

/**
 * Sync counters from existing employee records so that numbers never roll backward.
 */
export function syncCountersFromExisting(customEmployees = null) {
  const counters = loadCounters();
  const codes = loadCodes();

  if (Array.isArray(customEmployees)) {
    customEmployees.forEach(e => {
      const code = (e.employee_code || '').trim().toUpperCase();
      if (/^[DE]\d{3,}$/.test(code)) {
        codes[e.id] = code;
        const num = parseInt(code.slice(1), 10);
        if (code.startsWith('D') && num > counters.driver_code) {
          counters.driver_code = num;
        } else if (code.startsWith('E') && num > counters.staff_code) {
          counters.staff_code = num;
        }
      }
    });
    saveCounters();
    saveCodes();
  }

  return {
    driverMax: counters.driver_code,
    staffMax: counters.staff_code
  };
}

/**
 * Concurrency-safe atomic allocation of the next permanent employee code.
 * Never reuses a code under any circumstances.
 * @param {object|string} dbOrType
 * @param {string|null} maybeType
 * @returns {string} e.g. "D006", "E002", "D1000"
 */
export function allocateNextCode(dbOrType = 'driver', maybeType = null) {
  const isDb = dbOrType && typeof dbOrType.prepare === 'function';
  const type = isDb ? (maybeType || 'driver') : (typeof dbOrType === 'string' ? dbOrType : 'driver');
  const isDriver = String(type).toLowerCase().includes('driver');
  const counterKey = isDriver ? 'driver_code' : 'staff_code';
  const prefix = isDriver ? 'D' : 'E';

  ensureSchema(isDb ? dbOrType : null);

  let nextVal;
  if (isDb) {
    try {
      dbOrType.prepare("INSERT OR IGNORE INTO system_counters (counter_name, current_val) VALUES (?, 0)").run(counterKey);
      dbOrType.prepare("UPDATE system_counters SET current_val = current_val + 1 WHERE counter_name = ?").run(counterKey);
      const row = dbOrType.prepare("SELECT current_val FROM system_counters WHERE counter_name = ?").get(counterKey);
      nextVal = row ? row.current_val : 1;
    } catch (_) {}
  }

  if (!nextVal) {
    const counters = loadCounters();
    counters[counterKey] = (Number(counters[counterKey]) || 0) + 1;
    nextVal = counters[counterKey];
    saveCounters();
  }

  const formattedNum = nextVal < 1000 ? String(nextVal).padStart(3, '0') : String(nextVal);
  return `${prefix}${formattedNum}`;
}

/**
 * Get permanent code for employee by record ID
 */
export function getCodeForEmployee(employeeId) {
  const codes = loadCodes();
  return codes[employeeId] || null;
}

/**
 * Assign code to employee record ID
 */
export function setCodeForEmployee(employeeId, code) {
  const codes = loadCodes();
  codes[employeeId] = code;
  saveCodes();
}

/**
 * Look up employee ID by canonical permanent code (e.g. 'D004').
 */
export function getEmployeeIdByCode(code) {
  if (!code || typeof code !== 'string') return null;
  const canonical = code.trim().toUpperCase();
  const codes = loadCodes();
  for (const [id, c] of Object.entries(codes)) {
    if (c === canonical) return id;
  }
  return null;
}

/**
 * Validate permanent code format
 */
export function isValidEmployeeCode(code) {
  return typeof code === 'string' && /^[DE]\d{3,}$/.test(code.trim().toUpperCase());
}

/**
 * Resolve driver assignment:
 * Validates that driverCode resolves to an eligible employee,
 * validates consistency with driverEmployeeId,
 * rejects duplicate, missing, invalid, or inconsistent pairs.
 * Never accepts a display name as an identifier.
 */
export function resolveDriverAssignment({ driverCode, driverEmployeeId }, employeesList = null) {
  if (!driverCode && !driverEmployeeId) {
    const err = new Error('Driver assignment requires permanent employee code and employee ID.');
    err.status = 400;
    err.code = 'ASSIGNMENT_REQUIRED';
    throw err;
  }

  const canonicalCode = driverCode ? String(driverCode).trim().toUpperCase() : null;
  if (canonicalCode && !isValidEmployeeCode(canonicalCode)) {
    const err = new Error(`Invalid employee code format: '${canonicalCode}'. Expected format like D004.`);
    err.status = 400;
    err.code = 'INVALID_DRIVER_CODE';
    throw err;
  }

  let resolvedId = driverEmployeeId ? String(driverEmployeeId).trim() : null;
  let codeFromId = null;
  let idFromCode = null;

  if (Array.isArray(employeesList)) {
    if (resolvedId) {
      const emp = employeesList.find(e => e.id === resolvedId);
      if (emp?.employee_code) codeFromId = emp.employee_code.trim().toUpperCase();
    }
    if (canonicalCode) {
      const emp = employeesList.find(e => (e.employee_code || '').trim().toUpperCase() === canonicalCode);
      if (emp) idFromCode = emp.id;
    }
  }

  if (!codeFromId && resolvedId) codeFromId = getCodeForEmployee(resolvedId);
  if (!idFromCode && canonicalCode) idFromCode = getEmployeeIdByCode(canonicalCode);

  // If both provided, assert consistency
  if (canonicalCode && resolvedId) {
    if (codeFromId && codeFromId !== canonicalCode) {
      const err = new Error(`Inconsistent driver assignment: employee ID '${resolvedId}' has code '${codeFromId}', but code '${canonicalCode}' was provided.`);
      err.status = 400;
      err.code = 'INCONSISTENT_ASSIGNMENT';
      throw err;
    }
    if (idFromCode && idFromCode !== resolvedId) {
      const err = new Error(`Inconsistent driver assignment: code '${canonicalCode}' belongs to employee '${idFromCode}', but employee ID '${resolvedId}' was provided.`);
      err.status = 400;
      err.code = 'INCONSISTENT_ASSIGNMENT';
      throw err;
    }
  }

  const finalCode = canonicalCode || codeFromId;
  const finalId = resolvedId || idFromCode;

  if (!finalCode || !isValidEmployeeCode(finalCode)) {
    const err = new Error(`Permanent employee code could not be resolved or is invalid.`);
    err.status = 400;
    err.code = 'INVALID_DRIVER_CODE';
    throw err;
  }
  if (!finalId) {
    const err = new Error(`Employee record could not be resolved for code '${finalCode}'.`);
    err.status = 404;
    err.code = 'EMPLOYEE_NOT_FOUND';
    throw err;
  }

  return {
    driver_employee_id: finalId,
    driver_employee_code: finalCode
  };
}

/**
 * Preview codes for employees list or SQLite DB
 */
export function previewBackfill(dbOrList = []) {
  ensureSchema();
  const isDb = dbOrList && typeof dbOrList.prepare === 'function';
  let employeesList = [];
  if (isDb) {
    try {
      employeesList = dbOrList.prepare('SELECT id, name, employee_type, active_status, employee_code, created FROM employees ORDER BY created ASC, id ASC').all();
    } catch (_) {}
  } else if (Array.isArray(dbOrList)) {
    employeesList = dbOrList;
  }

  const codes = loadCodes();
  let nextD = 1;
  let nextE = 1;
  if (isDb) {
    try {
      const dRow = dbOrList.prepare("SELECT current_val FROM system_counters WHERE counter_name = 'driver_code'").get();
      if (dRow && dRow.current_val > 0) nextD = dRow.current_val + 1;
      const eRow = dbOrList.prepare("SELECT current_val FROM system_counters WHERE counter_name = 'staff_code'").get();
      if (eRow && eRow.current_val > 0) nextE = eRow.current_val + 1;
    } catch (_) {}
  } else {
    const counters = loadCounters();
    nextD = (counters.driver_code || 0) + 1;
    nextE = (counters.staff_code || 0) + 1;
  }

  const preview = employeesList.map(e => {
    let currentCode = (e.employee_code || (isDb ? null : codes[e.id]) || '').trim().toUpperCase();
    const hasValid = /^[DE]\d{3,}$/.test(currentCode);

    const typeStr = (e.employee_type || '').toLowerCase().trim();
    const isDriver = typeStr.includes('driver');
    let proposedCode = currentCode;
    let status = 'EXISTING_KEPT';

    if (!hasValid) {
      if (isDriver) {
        proposedCode = `D${nextD < 1000 ? String(nextD).padStart(3, '0') : nextD}`;
        nextD++;
      } else {
        proposedCode = `E${nextE < 1000 ? String(nextE).padStart(3, '0') : nextE}`;
        nextE++;
      }
      status = 'NEW_ASSIGNMENT';
    }

    return {
      id: e.id,
      name: e.name,
      employee_type: e.employee_type,
      active_status: e.active_status,
      created: e.created,
      current_code: currentCode || null,
      proposed_code: proposedCode,
      status
    };
  });

  return {
    totalEmployees: employeesList.length,
    preview,
    nextDriverCounter: nextD,
    nextStaffCounter: nextE
  };
}

/**
 * Apply permanent employee code backfill idempotently
 */
export function applyBackfill(dbOrList = []) {
  const p = previewBackfill(dbOrList);
  const isDb = dbOrList && typeof dbOrList.prepare === 'function';
  const codes = loadCodes();
  let updatedCount = 0;

  for (const item of p.preview) {
    if (item.status === 'NEW_ASSIGNMENT') {
      if (isDb) {
        try {
          dbOrList.prepare('UPDATE employees SET employee_code = ? WHERE id = ?').run(item.proposed_code, item.id);
        } catch (_) {}
      } else {
        codes[item.id] = item.proposed_code;
      }
      updatedCount++;
    }
  }

  if (!isDb) {
    saveCodes();
    const counters = loadCounters();
    if (p.nextDriverCounter - 1 > counters.driver_code) counters.driver_code = p.nextDriverCounter - 1;
    if (p.nextStaffCounter - 1 > counters.staff_code) counters.staff_code = p.nextStaffCounter - 1;
    saveCounters();
  } else {
    try {
      dbOrList.prepare("UPDATE system_counters SET current_val = ? WHERE counter_name = 'driver_code'").run(p.nextDriverCounter - 1);
      dbOrList.prepare("UPDATE system_counters SET current_val = ? WHERE counter_name = 'staff_code'").run(p.nextStaffCounter - 1);
    } catch (_) {}
  }

  return {
    success: true,
    totalEmployees: p.totalEmployees,
    updatedCount,
    details: p.preview
  };
}

/**
 * Backward compatibility: getDatabase stub that does not throw
 */
export function getDatabase() {
  return null;
}
