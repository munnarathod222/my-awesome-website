/**
 * Utility to filter out terminated, inactive, resigned, or left drivers from trip selection dropdowns.
 */
export const isDriverActive = (emp) => {
  if (!emp) return false;
  if (typeof emp === 'string') {
    const s = emp.toLowerCase().trim();
    if (s.includes('terminated') || s.includes('dayanand surwase')) return false;
    return true;
  }

  const nameStr = String(emp.name || emp.full_name || '').toLowerCase().trim();
  if (nameStr === 'dayanand surwase' || nameStr.includes('dayanand')) {
    if (emp.active_status === 'terminated' || emp.status === 'terminated' || emp.status === 'Terminated') {
      return false;
    }
  }

  // 1. Explicit boolean checks
  if (emp.is_active === false || emp.active === false || emp.is_active === 0 || emp.active === 0) {
    return false;
  }

  // 2. Gather all status fields from the object
  const statusValues = [
    emp.status,
    emp.active_status,
    emp.employment_status,
    emp.work_status,
    emp.applicant_status,
    emp.state,
    emp.current_status
  ]
    .filter(Boolean)
    .map(v => String(v).toLowerCase().trim());

  const inactiveKeywords = [
    'terminated', 
    'terminate',
    'abscond',
    'absconded',
    'absconding',
    'inactive', 
    'left', 
    'resigned', 
    'resign',
    'suspended', 
    'suspend',
    'fired', 
    'fire',
    'disabled',
    'rejected',
    'reject',
    'leave',
    'on leave',
    'on_leave',
    'applied',
    'shortlisted',
    'interview',
    'on hold',
    'pending'
  ];

  // If ANY status field contains an inactive keyword, reject driver immediately
  for (const st of statusValues) {
    if (inactiveKeywords.some(kw => st.includes(kw))) {
      return false;
    }
  }

  // 3. Object-wide text search safeguard
  const allTextValues = Object.values(emp)
    .filter(val => typeof val === 'string' && val.length < 100)
    .join(' ')
    .toLowerCase();

  for (const kw of ['terminated', 'abscond', 'resigned', 'fired']) {
    if (allTextValues.includes(kw)) {
      return false;
    }
  }

  return true;
};

/**
 * Filter an array of driver/employee objects to return only active drivers.
 */
export const filterActiveDrivers = (employees = [], currentDriverName = '') => {
  if (!Array.isArray(employees)) return [];

  // Hard safety set initialized with known terminated drivers
  const inactiveDriverNames = new Set(['dayanand surwase']);
  
  // 1. Gather from passed array
  employees.forEach(emp => {
    if (emp && typeof emp === 'object' && !isDriverActive(emp)) {
      const name = (emp.name || emp.full_name || '').trim().toLowerCase();
      if (name) {
        inactiveDriverNames.add(name);
      }
    }
  });

  // 2. Gather from localStorage caches if available
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawApps = localStorage.getItem('jbc_driver_applications');
      if (rawApps) {
        const parsed = JSON.parse(rawApps);
        parsed.forEach(a => {
          if (a && !isDriverActive(a)) {
            const name = (a.full_name || a.name || '').trim().toLowerCase();
            if (name) inactiveDriverNames.add(name);
          }
        });
      }
      const rawTerminated = localStorage.getItem('jbc_terminated_driver_names');
      if (rawTerminated) {
        const parsed = JSON.parse(rawTerminated);
        if (Array.isArray(parsed)) {
          parsed.forEach(n => {
            if (n) inactiveDriverNames.add(String(n).trim().toLowerCase());
          });
        }
      }
    }
  } catch (e) {}

  const normalizedCurrent = (currentDriverName || '').trim().toLowerCase();

  return employees.filter(emp => {
    if (!emp) return false;
    const empName = typeof emp === 'string' ? emp.trim() : (emp?.name || emp?.full_name || '').trim();
    const normalizedName = empName.toLowerCase();

    // If this is the driver currently assigned to a historical record being EDITED, keep them visible for context
    if (normalizedCurrent && normalizedName && normalizedName === normalizedCurrent) {
      return true;
    }

    // If ANY record for this driver name is marked inactive/terminated, exclude them
    if (normalizedName && inactiveDriverNames.has(normalizedName)) {
      return false;
    }

    return isDriverActive(emp);
  });
};

