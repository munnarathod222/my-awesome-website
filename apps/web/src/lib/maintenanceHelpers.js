export const getWarrantyStatus = (expirationDate) => {
  if (!expirationDate) return 'Unknown';
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
};

export const getStatusColorClass = (status) => {
  const s = status?.toLowerCase() || '';
  switch (s) {
    case 'pending':
    case 'open':
      return 'status-pending';
    case 'completed':
    case 'resolved':
      return 'status-completed';
    case 'overdue':
      return 'status-overdue';
    case 'in progress':
    case 'in-progress':
      return 'status-in-progress';
    case 'closed':
      return 'status-closed';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const getSeverityColorClass = (severity) => {
  const s = severity?.toLowerCase() || '';
  switch (s) {
    case 'low':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'critical':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};