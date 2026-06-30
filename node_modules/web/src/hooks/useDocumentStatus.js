import { useMemo } from 'react';
import { differenceInDays, startOfDay } from 'date-fns';

export const useDocumentStatus = (expiryDate) => {
  return useMemo(() => {
    if (!expiryDate) return 'Active';
    
    const today = startOfDay(new Date());
    const expiry = startOfDay(new Date(expiryDate));
    const daysDiff = differenceInDays(expiry, today);

    if (daysDiff < 0) return 'Expired';
    if (daysDiff <= 30) return 'Expiring Soon';
    return 'Active';
  }, [expiryDate]);
};