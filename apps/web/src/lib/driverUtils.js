/**
 * Utility to filter out terminated, inactive, resigned, or left drivers from trip selection dropdowns.
 */
export const isDriverActive = (emp) => {
  if (!emp) return false;
  
  const status = (
    emp.status || 
    emp.active_status || 
    emp.employment_status || 
    emp.work_status || 
    ''
  ).toLowerCase().trim();

  const inactiveKeywords = [
    'terminated', 
    'inactive', 
    'left', 
    'resigned', 
    'suspended', 
    'fired', 
    'disabled',
    'terminated / left'
  ];

  if (inactiveKeywords.some(kw => status.includes(kw))) {
    return false;
  }

  if (emp.is_active === false || emp.active === false) {
    return false;
  }

  return true;
};

/**
 * Filter an array of driver/employee objects to return only active drivers.
 */
export const filterActiveDrivers = (employees = [], currentDriverName = '') => {
  return (employees || []).filter(emp => {
    // If this is the driver currently assigned to a historical record, keep them visible for context
    if (currentDriverName && emp.name === currentDriverName) {
      return true;
    }
    return isDriverActive(emp);
  });
};
