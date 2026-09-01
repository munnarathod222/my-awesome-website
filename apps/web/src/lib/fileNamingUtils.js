/**
 * Standardized File Naming Utility
 * Automatically renames uploaded document and expense bill files to structured, traceable filenames.
 */

export const sanitizeFileName = (name = '') => {
  return (name || '').replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
};

/**
 * Auto-renames a vehicle or employee document file
 * Example: TG12U2637_FITNESS_CERTIFICATE_2026-09-01.pdf
 */
export const generateDocumentFileName = (originalFile, docType = 'DOCUMENT', entityId = '') => {
  if (!originalFile) return originalFile;
  const dateStr = new Date().toISOString().split('T')[0];
  const originalName = originalFile.name || 'file';
  const ext = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : 'pdf';
  
  const cleanEntity = entityId ? sanitizeFileName(entityId).toUpperCase() + '_' : '';
  const cleanDocType = docType ? sanitizeFileName(docType).toUpperCase() : 'DOC';

  const newName = `${cleanEntity}${cleanDocType}_${dateStr}.${ext}`;
  return new File([originalFile], newName, { type: originalFile.type });
};

/**
 * Auto-renames an expense bill or transaction receipt file
 * Example: EXP_BILL9821_TG12U2637_FUEL_2026-09-01.jpg
 */
export const generateExpenseFileName = (originalFile, expenseCategory = 'EXPENSE', expenseId = '', truckNumber = '') => {
  if (!originalFile) return originalFile;
  const dateStr = new Date().toISOString().split('T')[0];
  const originalName = originalFile.name || 'receipt';
  const ext = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : 'jpg';

  const cleanCategory = expenseCategory ? sanitizeFileName(expenseCategory).toUpperCase() : 'GENERAL';
  const cleanExpId = expenseId ? sanitizeFileName(expenseId).toUpperCase() : `EX_${Date.now().toString(36).toUpperCase()}`;
  const cleanTruck = truckNumber ? sanitizeFileName(truckNumber).toUpperCase() + '_' : '';

  const newName = `EXP_${cleanExpId}_${cleanTruck}${cleanCategory}_${dateStr}.${ext}`;
  return new File([originalFile], newName, { type: originalFile.type });
};
