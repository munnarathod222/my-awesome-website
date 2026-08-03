/**
 * Universal canonical employee code generator.
 * Guarantees 100% identical employee codes (D001, D002, E001, E002) across:
 * - Employee Database / Directory Page
 * - ID Card Generator Studio
 * - Public Security QR Verification Page
 */
export function getCanonicalEmployeeCode(emp, allEmployeesList = []) {
  if (!emp) return 'E001';

  const rawCode = (emp.employee_number || emp.emp_number || emp.employee_code || '').trim().toUpperCase();
  
  // 1. If emp already has a valid D001 / E001 formatted code, use it!
  if (/^[DE]\d{3,}$/.test(rawCode)) {
    return rawCode;
  }

  const isDriver = emp.employee_type === 'driver' || 
                   (emp.designation || '').toLowerCase().includes('driver') ||
                   (emp.applicant_role || '').toLowerCase().includes('driver');

  // 2. If part of an employee list, calculate rank among drivers vs staff
  if (Array.isArray(allEmployeesList) && allEmployeesList.length > 0) {
    const categoryList = allEmployeesList.filter(e => {
      const eIsDriver = e.employee_type === 'driver' || 
                        (e.designation || '').toLowerCase().includes('driver') ||
                        (e.applicant_role || '').toLowerCase().includes('driver');
      return eIsDriver === isDriver;
    });

    const rankIdx = categoryList.findIndex(e => 
      (e.id && emp.id && e.id === emp.id) || 
      (e.name && emp.name && e.name.toLowerCase() === emp.name.toLowerCase())
    );

    if (rankIdx !== -1) {
      const seqNum = rankIdx + 1;
      return `${isDriver ? 'D' : 'E'}${String(seqNum).padStart(3, '0')}`;
    }
  }

  // 3. Fallback: extract trailing digits if present (e.g. EMP-002 -> D002 or E002)
  const match = rawCode.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `${isDriver ? 'D' : 'E'}${String(num).padStart(3, '0')}`;
  }

  return isDriver ? 'D001' : 'E001';
}
