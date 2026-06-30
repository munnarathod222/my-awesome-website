export const getErrorDetails = (error) => {
  return {
    status: error?.status,
    message: error?.message,
    data: error?.response?.data,
    originalError: error
  };
};

export const getUserFriendlyMessage = (error) => {
  if (!error) return 'An unknown error occurred.';
  
  // Handle PocketBase specific status codes
  if (error.status === 401) return 'You are not authenticated. Please log in again.';
  if (error.status === 403) return 'You do not have permission to perform this action. Please contact your administrator.';
  if (error.status === 404) return 'The requested cashbook or transaction was not found.';
  if (error.status === 0) return 'Network error. Please check your internet connection and try again.';
  
  // Handle standard Error objects
  if (error.message) {
    if (error.message.includes('Failed to fetch')) return 'Unable to connect to the server. Please check your connection.';
    if (error.message.includes('User not authenticated')) return 'Please log in to access the cashbook.';
    return error.message;
  }
  
  return 'An unexpected error occurred. Please contact support if the problem persists.';
};

export const logCashbookError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const details = getErrorDetails(error);
  
  console.error(`[Cashbook Error ${timestamp}] ${context.action || 'Operation'} failed:`, {
    message: getUserFriendlyMessage(error),
    details,
    context
  });
};