import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data || []
        });
      },
      error: (error) => reject(error)
    });
  });
};

// Generic Helpers
export const isValidPhoneFormat = (phone) => {
  if (!phone) return true; // Optional by default unless checked otherwise
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

export const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidDateFormat = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isPositiveNumber = (num) => {
  const parsed = Number(num);
  return !isNaN(parsed) && parsed > 0;
};

export const isValidYear = (year) => {
  const parsed = Number(year);
  return !isNaN(parsed) && parsed >= 1900 && parsed <= new Date().getFullYear();
};

export const validateCSVStructure = (headers, required) => {
  const missingHeaders = required.filter(h => !headers.includes(h));
  return { isValid: missingHeaders.length === 0, missingHeaders };
};

// Specific Validators
export const validateEmployeeRow = (row, index, { existingPhones }) => {
  const errors = [];
  if (!row['Employee Name']?.trim()) errors.push('Employee Name is required');
  if (!row['Phone']?.trim()) {
    errors.push('Phone is required');
  } else if (!isValidPhoneFormat(row['Phone'])) {
    errors.push('Phone must have at least 10 digits');
  } else if (existingPhones.has(row['Phone'].trim())) {
    errors.push('Phone number already exists in system');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateClientRow = (row, index, { existingEmails, existingPhones }) => {
  const errors = [];
  if (!row['Client Name']?.trim()) errors.push('Client Name is required');
  
  if (!row['Email']?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(row['Email'])) {
    errors.push('Invalid email format');
  } else if (existingEmails && existingEmails.has(row['Email'].trim().toLowerCase())) {
    errors.push('Email already exists in system');
  }

  if (!row['Phone']?.trim()) {
    errors.push('Phone is required');
  } else if (!isValidPhoneFormat(row['Phone'])) {
    errors.push('Phone must be 10-15 digits');
  } else if (existingPhones && existingPhones.has(row['Phone'].trim())) {
    errors.push('Phone already exists in system');
  }

  const validTypes = ['Individual', 'Company', 'Distributor', 'Retailer'];
  if (row['Client Type'] && !validTypes.includes(row['Client Type'].trim())) {
    errors.push(`Client Type must be one of: ${validTypes.join(', ')}`);
  }

  const validStatuses = ['Active', 'Inactive', 'Suspended'];
  if (row['Status'] && !validStatuses.includes(row['Status'].trim())) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (row['GST Number'] && row['GST Number'].trim().length !== 15) {
    errors.push('GST Number must be 15 characters');
  }

  if (row['PAN Number'] && row['PAN Number'].trim().length !== 10) {
    errors.push('PAN Number must be 10 characters');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateTripLogRow = (row, index, { employeesMap, trucksMap }) => {
  const errors = [];
  if (!row['Date (YYYY-MM-DD)']) errors.push('Date is required');
  else if (!isValidDateFormat(row['Date (YYYY-MM-DD)'])) errors.push('Invalid Date format');

  const driverName = row['Driver Name']?.trim();
  if (!driverName) errors.push('Driver Name is required');
  
  const truckNum = row['Truck Number']?.trim();
  if (!truckNum) errors.push('Truck Number is required');
  else if (!trucksMap.has(truckNum)) errors.push(`Truck Number '${truckNum}' not found in system`);

  if (!row['Route']?.trim()) errors.push('Route is required');

  if (row['Kms'] && !isPositiveNumber(row['Kms'])) errors.push('Kms must be a positive number');
  if (row['Revenue'] && !isPositiveNumber(row['Revenue'])) errors.push('Revenue must be a positive number');

  return { isValid: errors.length === 0, errors };
};

export const validateExpenseRow = (row, index, { trucksMap }) => {
  const errors = [];
  if (!row['Date (YYYY-MM-DD)']) errors.push('Date is required');
  else if (!isValidDateFormat(row['Date (YYYY-MM-DD)'])) errors.push('Invalid Date format');

  const category = row['Category']?.trim();
  const validCategories = ['Fuel', 'Maintenance', 'Toll', 'Insurance', 'Salary', 'Rent', 'Utilities', 'Driver Advance', 'Other'];
  if (!category) errors.push('Category is required');
  else if (!validCategories.includes(category)) errors.push(`Invalid Category. Must be one of: ${validCategories.join(', ')}`);

  if (!row['Amount']) errors.push('Amount is required');
  else if (!isPositiveNumber(row['Amount'])) errors.push('Amount must be a positive number');

  const truckNum = row['Truck Number']?.trim();
  if (truckNum && !trucksMap.has(truckNum)) errors.push(`Truck Number '${truckNum}' not found in system`);

  return { isValid: errors.length === 0, errors };
};

export const validateVehicleRow = (row, index, { existingRegNumbers }) => {
  const errors = [];
  if (!row['Vehicle Name']?.trim()) errors.push('Vehicle Name is required');
  
  const regNum = row['Registration Number']?.trim();
  if (!regNum) errors.push('Registration Number is required');
  else if (existingRegNumbers.has(regNum)) errors.push('Registration Number already exists in system');

  const validTypes = ['Truck', 'Van', 'Car', 'Bike', 'Auto'];
  if (!validTypes.includes(row['Vehicle Type']?.trim())) errors.push(`Vehicle Type must be one of: ${validTypes.join(', ')}`);

  const validFuel = ['Petrol', 'Diesel', 'CNG', 'Electric'];
  if (!validFuel.includes(row['Fuel Type']?.trim())) errors.push(`Fuel Type must be one of: ${validFuel.join(', ')}`);

  if (!isValidYear(row['Year'])) errors.push('Year must be valid (1900-Current)');
  if (!isValidDateFormat(row['Purchase Date'])) errors.push('Invalid Purchase Date format');
  
  if (row['Capacity (Tons)'] && !isPositiveNumber(row['Capacity (Tons)'])) errors.push('Capacity must be a positive number');

  return { isValid: errors.length === 0, errors };
};

export const validateRouteRow = (row, index) => {
  const errors = [];
  if (!row['Route Name']?.trim()) errors.push('Route Name is required');
  if (!row['Start Location']?.trim()) errors.push('Start Location is required');
  if (!row['End Location']?.trim()) errors.push('End Location is required');
  
  if (!row['Distance (Kms)']) errors.push('Distance is required');
  else if (!isPositiveNumber(row['Distance (Kms)'])) errors.push('Distance must be a positive number');

  if (row['Estimated Time (Hrs)'] && !isPositiveNumber(row['Estimated Time (Hrs)'])) {
    errors.push('Estimated Time must be a positive number');
  }

  return { isValid: errors.length === 0, errors };
};