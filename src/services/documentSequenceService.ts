import { dbtabeses } from '../db/store';
import { DocumentSequence, LorryReceipt, PodRecord } from '../types';

/**
 * Calculates Indian Financial Year string (e.g. '26-27')
 * In India, FY starts on April 1 and ends on March 31.
 */
export function getIndianFinancialYear(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth(); // 0-indexed: 0 = Jan, 3 = April

  let startYear: number;
  let endYear: number;

  if (month >= 3) {
    // April to December: Current year to Next year
    startYear = year;
    endYear = year + 1;
  } else {
    // January to March: Previous year to Current year
    startYear = year - 1;
    endYear = year;
  }

  const startStr = String(startYear).slice(-2);
  const endStr = String(endYear).slice(-2);
  return `${startStr}-${endStr}`;
}

/**
 * Generates an unguessable, URL-safe random token for public QR code tracking
 */
export function generateSecureToken(prefix = 'jbc'): string {
  const rand1 = Math.random().toString(36).substring(2, 10);
  const rand2 = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${rand1}${rand2}`;
}

export const documentSequenceService = {
  getFinancialYear: getIndianFinancialYear,
  generateSecureToken,

  /**
   * Generates next unique LR number in format: JBC/26-27/000001
   */
  getNextLRNumber(date: string = new Date().toISOString()): string {
    const fy = getIndianFinancialYear(date);
    const settings = dbtabeses.getCompanySettings();
    const prefix = settings.lr_prefix || 'JBC';

    // Get current sequences from store
    const sequences: DocumentSequence[] = dbtabeses.getDocumentSequences();
    let seq = sequences.find(s => s.document_type === 'LR' && s.financial_year === fy);

    // Also inspect existing LRs in store to guarantee never generating a duplicate
    const existingLrs: LorryReceipt[] = dbtabeses.getLorryReceipts();
    const existingNumbers = new Set(existingLrs.map(l => l.lr_number));

    let nextNum = seq ? seq.current_number + 1 : 1;

    // Scan forward if this number is already used in existing records
    let candidate = `${prefix}/${fy}/${String(nextNum).padStart(6, '0')}`;
    while (existingNumbers.has(candidate)) {
      nextNum++;
      candidate = `${prefix}/${fy}/${String(nextNum).padStart(6, '0')}`;
    }

    // Persist updated sequence tracker
    const updatedSequences = sequences.filter(s => !(s.document_type === 'LR' && s.financial_year === fy));
    updatedSequences.push({
      id: `seq-lr-${fy}`,
      document_type: 'LR',
      prefix,
      financial_year: fy,
      current_number: nextNum
    });
    dbtabeses.setDocumentSequences(updatedSequences);

    return candidate;
  },

  /**
   * Generates next unique POD number in format: JBC/POD/26-27/000001
   */
  getNextPODNumber(date: string = new Date().toISOString()): string {
    const fy = getIndianFinancialYear(date);
    const settings = dbtabeses.getCompanySettings();
    const prefix = settings.pod_prefix || 'JBC/POD';

    const sequences: DocumentSequence[] = dbtabeses.getDocumentSequences();
    let seq = sequences.find(s => s.document_type === 'POD' && s.financial_year === fy);

    const existingPods: PodRecord[] = dbtabeses.getPodRecords();
    const existingNumbers = new Set(existingPods.map(p => p.pod_number));

    let nextNum = seq ? seq.current_number + 1 : 1;

    let candidate = `${prefix}/${fy}/${String(nextNum).padStart(6, '0')}`;
    while (existingNumbers.has(candidate)) {
      nextNum++;
      candidate = `${prefix}/${fy}/${String(nextNum).padStart(6, '0')}`;
    }

    const updatedSequences = sequences.filter(s => !(s.document_type === 'POD' && s.financial_year === fy));
    updatedSequences.push({
      id: `seq-pod-${fy}`,
      document_type: 'POD',
      prefix,
      financial_year: fy,
      current_number: nextNum
    });
    dbtabeses.setDocumentSequences(updatedSequences);

    return candidate;
  },

  /**
   * Checks whether an LR number is a duplicate
   */
  isLRNumberDuplicate(lrNumber: string, excludeId?: string): boolean {
    const existing = dbtabeses.getLorryReceipts();
    return existing.some(l => l.lr_number.trim().toUpperCase() === lrNumber.trim().toUpperCase() && l.id !== excludeId);
  },

  /**
   * Checks whether a POD number is a duplicate
   */
  isPODNumberDuplicate(podNumber: string, excludeId?: string): boolean {
    const existing = dbtabeses.getPodRecords();
    return existing.some(p => p.pod_number.trim().toUpperCase() === podNumber.trim().toUpperCase() && p.id !== excludeId);
  }
};
