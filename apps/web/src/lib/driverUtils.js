/**
 * Utility to filter out terminated, inactive, resigned, or left drivers from trip selection dropdowns.
 */
export const isDriverActive = (emp) => {
  if (!emp) return false;
  if (typeof emp === 'string') return true;

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
  return (employees || []).filter(emp => {
    const empName = typeof emp === 'string' ? emp : (emp?.name || emp?.full_name);
    // If this is the driver currently assigned to a historical record being EDITED, keep them visible for context
    if (currentDriverName && empName && empName === currentDriverName) {
      return true;
    }
    return isDriverActive(emp);
  });
};

