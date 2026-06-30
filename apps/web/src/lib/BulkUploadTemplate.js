export const triggerDownload = (filename, headers, rows) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${val || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadClientTemplate = () => {
  const headers = ['Client Name', 'Email', 'Phone', 'Company Name', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Client Type', 'Industry', 'Contact Person', 'GST Number', 'PAN Number', 'Bank Account', 'IFSC Code', 'Credit Limit', 'Payment Terms', 'Status'];
  const rows = [
    ['Acme Logistics', 'billing@acmelogistics.com', '9876543210', 'Acme Corp', '123 Business Rd', 'Mumbai', 'MH', '400001', 'India', 'Company', 'Logistics', 'John Doe', '27AAPFU0939F1Z5', 'AAPFU0939F', '000011112222', 'HDFC0000123', '500000', 'Net 30', 'Active'],
    ['Tech Retailers', 'accounts@techretail.in', '8765432109', 'Tech Retailers', '45 Park Ave', 'Delhi', 'DL', '110001', 'India', 'Retailer', 'Electronics', 'Jane Smith', '', '', '', '', '200000', 'Net 15', 'Active']
  ];
  triggerDownload('clients_template.csv', headers, rows);
};

export const downloadEmployeeTemplate = () => {
  const headers = ['Employee Name', 'Phone', 'Position', 'Department', 'Salary', 'Joining Date', 'Address', 'Status'];
  const rows = [
    ['John Doe', '9876543210', 'Driver', 'Operations', '25000', '2023-01-15', '123 Main St, Mumbai', 'active'],
    ['Jane Smith', '8765432109', 'Manager', 'Administration', '45000', '2022-11-01', '456 Oak Ave, Delhi', 'active']
  ];
  triggerDownload('employees_template.csv', headers, rows);
};

export const downloadTripLogsTemplate = () => {
  const headers = ['Date (YYYY-MM-DD)', 'Driver Name', 'Truck Number', 'Route', 'Kms', 'Revenue', 'Mileage'];
  const rows = [
    ['2023-10-01', 'John Doe', 'MH04AB1234', 'Mumbai - Pune', '150', '5000', '4.5'],
    ['2023-10-02', 'Mike Johnson', 'GJ12CD5678', 'Delhi - Jaipur', '250', '8500', '4.2']
  ];
  triggerDownload('trip_logs_template.csv', headers, rows);
};

export const downloadExpensesTemplate = () => {
  const headers = ['Date (YYYY-MM-DD)', 'Category', 'Description', 'Amount', 'Payment Method', 'Truck Number'];
  const rows = [
    ['2023-10-05', 'Fuel', 'Refill at HP Pump', '3000', 'Card', 'MH04AB1234'],
    ['2023-10-06', 'Driver Advance', 'Advance for trip', '2000', 'Cash', 'GJ12CD5678']
  ];
  triggerDownload('expenses_template.csv', headers, rows);
};

export const downloadVehiclesTemplate = () => {
  const headers = ['Vehicle Name', 'Registration Number', 'Vehicle Type', 'Make', 'Model', 'Year', 'Fuel Type', 'Capacity (Tons)', 'Purchase Date'];
  const rows = [
    ['Tata Prima 1', 'MH04AB1234', 'Truck', 'Tata', 'Prima 4028', '2020', 'Diesel', '20', '2020-05-10'],
    ['Ashok Leyland 1', 'GJ12CD5678', 'Truck', 'Ashok Leyland', 'U-3118', '2021', 'Diesel', '25', '2021-08-15']
  ];
  triggerDownload('vehicles_template.csv', headers, rows);
};

export const downloadRoutesTemplate = () => {
  const headers = ['Route Name', 'Start Location', 'End Location', 'Distance (Kms)', 'Estimated Time (Hrs)', 'Status'];
  const rows = [
    ['Mumbai to Pune', 'Mumbai, MH', 'Pune, MH', '150', '3.5', 'Active'],
    ['Delhi to Jaipur', 'Delhi, DL', 'Jaipur, RJ', '280', '5', 'Active']
  ];
  triggerDownload('routes_template.csv', headers, rows);
};