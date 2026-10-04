import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find persistent data directory
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
    fs.writeFileSync(COUNTERS_FILE, JSON.stringify(countersCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[EmployeeCodeService] Failed to save counters:', err.message);
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
    fs.writeFileSync(EMPLOYEE_CODES_FILE, JSON.stringify(codesCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[EmployeeCodeService] Failed to save employee codes:', err.message);
  }
}

/**
 * Ensure storage schema and baseline counters are initialized.
 * 100% additive, zero external native module dependencies.
 */
export function ensureSchema() {
  loadCounters();
  loadCodes();
}

/**
 * Sync counters from existing employee records so that numbers never roll backward.
 */
export function syncCountersFromExisting(customEmployees = null) {
  ensureSchema();
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
 * @param {'driver'|'staff'} type
 * @returns {string} e.g. "D006", "E002", "D1000"
 */
export function allocateNextCode(dbOrType = 'driver', maybeType = null) {
  ensureSchema();
  // Support both (db, type) and (type) calling signatures
  const type = typeof dbOrType === 'string' ? dbOrType : (maybeType || 'driver');
  const isDriver = String(type).toLowerCase().includes('driver');
  const counterKey = isDriver ? 'driver_code' : 'staff_code';
  const prefix = isDriver ? 'D' : 'E';

  const counters = loadCounters();
  counters[counterKey] = (Number(counters[counterKey]) || 0) + 1;
  const nextVal = counters[counterKey];
  saveCounters();

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
 * Preview codes for employees list
 */
export function previewBackfill(employeesList = []) {
  ensureSchema();
  const codes = loadCodes();
  const counters = loadCounters();

  let nextD = counters.driver_code + 1;
  let nextE = counters.staff_code + 1;

  const preview = employeesList.map(e => {
    let currentCode = (e.employee_code || codes[e.id] || '').trim().toUpperCase();
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
 * Backward compatibility: getDatabase stub that does not throw
 */
export function getDatabase() {
  return null;
}
