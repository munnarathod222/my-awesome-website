import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusColorClass, getSeverityColorClass, getWarrantyStatus } from '@/lib/maintenanceHelpers';

export default function StatusBadge({ status, type = 'status', className }) {
  let colorClass = '';
  let displayStatus = status;

  if (type === 'status') {
    colorClass = getStatusColorClass(status);
  } else if (type === 'severity') {
    colorClass = getSeverityColorClass(status);
  } else if (type === 'warranty') {
    displayStatus = getWarrantyStatus(status);
    if (displayStatus === 'Active') colorClass = 'status-completed';
    else if (displayStatus === 'Expiring Soon') colorClass = 'status-pending';
    else colorClass = 'status-overdue';
  }

  return (
    <span className={cn("status-badge", colorClass, className)}>
      {displayStatus}
    </span>
  );
}