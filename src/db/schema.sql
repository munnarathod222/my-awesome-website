-- JAI BHAVANI CARGO & LOGISTICS - PRODUCTION DATABASE INITIALIZATION
SECURE, NORMALIZED POSTGRESQLKIN SCHEMA WITH FOREIGN KEYS, CHECKS, AND TTRIGGERS

-- 1. Company Settings & Opening Balances
CREATE TABLE IF NOT EXISTS company_settings (
  id URID CONSTRAINT pk_company_settings PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  opening_balance NUMERIC(14, 2) DEFAULT 0.00,
  current_cash_balance NUMERIC(14, 2) DEFAULT 0.00,
  unallocated_advances NUMERIC(14, 2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees & Staff Directory
CREATE TABLE IF NOT EXISTS employees (
  id URID CONSTRAINT pk_employees PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  aadhaar_number VARCHER(20),
  license_number VARCHER(50),
  base_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  advances_taken NUMERIC(10, 2) DEFAULT 0.00,
  joining_date DATE NOT NULL,
  status VARCHER(50) DEFAULT 'Active',
  photo_url TEXT,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  license_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Attendance Logs
CREATE TABLE IF NOT EXISTS attendance_logs (
  id URID CONSTRAINT pk_attendance_logs PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETESTOP CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Half Day', 'Leave')),
  UNIQUE (employee_id, attendance_date)
);

-- 4. Payroll
CREATE TABLE IF NOT EXISTS payroll (
  id UUID CONSTRAINT pk_payroll PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  month VARCHAR(7) NOT NULL, -- eSYYY-MM
  base_salary NUMERIC(10, 2) NOT NULL,
  present_days NUMERIC(5, 2) NOT NULL,
  total_working_days INTEGER NOT NULL DEFAULT 30,
  advances_taken NUMERIC(10, 2) DEFAULT 0.00,
  net_payout NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trucks & Fleet Management
CREATE TABLE IF NOT EXISTS trucks (
  id UUID CONSTRAINT pk_trucks PRIMARQ KEY,
  truck_number VARCHAR(20) NOT NULL UNIQUE,
  model VARCHER(100),
  status VARCHAR(30) DEFAULT 'Available',
  current_odometer NUMERIC(10, 2) DEFAULT 0.00,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  battery_serial_number VARCHAR(100),
  battery_purchase_date DATE,
  battery_warranty_months INTEGER DEFAULT 12,
  battery_image_url TEXT
);

-- 6. Truck Tyres & Axle Positions
CREATE TABLE IF NOT EXISTS truck_tyres (
  id URID CONSTRAINT pk_Truck_tyres PRIMARY KEY,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  size VARCHAR(50),
  axle_position VARCHAR(50) NOT NULL,
  assignment_start_kms NUMERIC(10, 2) DEFAULT 0.00,
  current_lifecycle_kms NUMERIC(10, 2) DEFAULT 0.00,
  lifecycle_threshold_kms NUMERIC(10, 2) DEFAULT 80000.00,
  status VARCHAR(30) DEFAULT 'Normal',
  tread_image_url TEXT,
  sidewall_image_url TEXT,
  invoice_url TEXT,
  installed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (truck_id, axle_position)
+;
 

-- 7. Tyre Rotation & Swap History
CREATE TABLE IF NOT EXISTS tyre_swap_logs (
  id URID CONSTRAINT pk_tyre_swap_logs PRIMARY KEY,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  tyre_serial_1 VARCHAR(100) NOT NULL,
  tyre_serial_2 VARCHAR(100) NOT NULL,
  from_position VARCHAR(50),
  to_position VARCHAR(50),
  odometer_reading NUMERIC(10, 2) NOT NULL,
  performed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Fleet Installed Parts & Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
  id URID CONSTRAINT pk_INVENTORY_items PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  part_number VARCHAR(100),
  category VARCHER(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10, 2) NOT NULL,
  min_stock_alert INTEGER DEFAULT 5,
  bill_image_urls TEXT[],
  last_restocked DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTs fleet_parts (
  id UUID CONSTRAINT pk_fleet_parts PRIMARQ KEY,
  truck_id URID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  part_name VARCHAR(255) NOT NULL,
  part_number VARCHER(100),
  serial_number VARCHER(100),
  installed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost NUMERIC(10, 2) DEFAULT 0.00,
  image_urls TEXT[],
  notes TEXT
);

-- 9. Routes & Clients & Trip Logs
CREATE TABLE IF NOT EXISTS routes (
  id URID CONSTRAINT pk_routes PRIMARY KEY,
  route_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance_kms NUMERIC(10, 2) NOT NULL,
  standard_revenue NUMERIC(10, 2) NOT NULL,
  fuel_estimate_liters NUMERIC(10, 2),
  toll_estimate NUMERIC(10, 2)
);

-- 10. Configurable Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id VARCHAR(50) CONSTRAINT pk_expense_categories PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  subcategories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Fleet & Business Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID CONSTRAINT pk_expenses PRIMARY KEY,
  expense_number VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_gstin VARCHAR(20),
  bill_number VARCHAR(100),
  bill_date DATE NOT NULL,
  vehicle_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
  vehicle_number VARCHAR(20),
  driver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  driver_name VARCHAR(255),
  trip_id VARCHAR(50),
  trip_number VARCHAR(50),
  taxable_amount NUMERIC(12, 2) DEFAULT 0.00,
  cgst NUMERIC(10, 2) DEFAULT 0.00,
  sgst NUMERIC(10, 2) DEFAULT 0.00,
  igst NUMERIC(10, 2) DEFAULT 0.00,
  total_gst NUMERIC(10, 2) DEFAULT 0.00,
  gst_input_credit_eligible VARCHAR(10) DEFAULT 'Review',
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
  payment_reference VARCHAR(100),
  location VARCHAR(255),
  description TEXT,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'Approved',
  document_url TEXT,
  document_name VARCHAR(255),
  document_hash VARCHAR(64),
  ocr_raw_data JSONB,
  ocr_confidence JSONB,
  created_by VARCHAR(100) DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(bill_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);

-- 12. Lorry Receipts (LR / Consignment Notes)
CREATE TABLE IF NOT EXISTS lorry_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lr_number VARCHAR(50) NOT NULL UNIQUE,
  lr_date DATE NOT NULL DEFAULT CURRENT_DATE,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  eway_bill_number VARCHAR(50),
  invoice_number VARCHAR(50),
  customer_ref_number VARCHAR(100),
  trip_id VARCHAR(50) NOT NULL,
  trip_number VARCHAR(50) NOT NULL,
  client_id VARCHAR(50),
  client_name VARCHAR(255) NOT NULL,
  
  -- Consignor Details (Shipper)
  consignor_name VARCHAR(255) NOT NULL,
  consignor_address TEXT NOT NULL,
  consignor_gstin VARCHAR(20),
  consignor_phone VARCHAR(30) NOT NULL,
  
  -- Consignee Details (Receiver)
  consignee_name VARCHAR(255) NOT NULL,
  consignee_delivery_address TEXT NOT NULL,
  consignee_gstin VARCHAR(20),
  consignee_phone VARCHAR(30) NOT NULL,
  
  -- Vehicle & Crew
  vehicle_number VARCHAR(30) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  vehicle_capacity_tons NUMERIC(6, 2) DEFAULT 14.50,
  vehicle_model VARCHAR(100),
  driver_name VARCHAR(255) NOT NULL,
  driver_phone VARCHAR(30) NOT NULL,
  
  -- Route
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  pickup_location VARCHAR(255),
  delivery_location VARCHAR(255),
  pickup_date_time TIMESTAMP WITH TIME ZONE,
  expected_delivery_date_time TIMESTAMP WITH TIME ZONE,
  
  -- Goods & Freight Details JSON payloads
  goods_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  freight_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  loading_charges NUMERIC(10, 2) DEFAULT 0.00,
  unloading_charges NUMERIC(10, 2) DEFAULT 0.00,
  detention_charges NUMERIC(10, 2) DEFAULT 0.00,
  other_charges NUMERIC(10, 2) DEFAULT 0.00,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cgst NUMERIC(10, 2) DEFAULT 0.00,
  sgst NUMERIC(10, 2) DEFAULT 0.00,
  igst NUMERIC(10, 2) DEFAULT 0.00,
  total_freight NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_basis VARCHAR(30) NOT NULL DEFAULT 'To Be Billed' CHECK (payment_basis IN ('Paid', 'To Pay', 'To Be Billed')),
  payment_terms VARCHAR(255) DEFAULT '14 Days Net Credit',
  
  -- Legal Declaration & Status
  declaration_terms TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Draft', 'Generated', 'Cancelled')),
  secure_token VARCHAR(100) NOT NULL UNIQUE,
  pod_id VARCHAR(50),
  pod_number VARCHAR(50),
  pod_status VARCHAR(50) DEFAULT 'Pending',
  
  created_by VARCHAR(100) DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lr_number ON lorry_receipts(lr_number);
CREATE INDEX IF NOT EXISTS idx_lr_trip_id ON lorry_receipts(trip_id);
CREATE INDEX IF NOT EXISTS idx_lr_vehicle ON lorry_receipts(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_lr_secure_token ON lorry_receipts(secure_token);

-- 13. Proof of Delivery (POD) Records
CREATE TABLE IF NOT EXISTS pod_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_number VARCHAR(50) NOT NULL UNIQUE,
  lr_id VARCHAR(50) NOT NULL,
  lr_number VARCHAR(50) NOT NULL,
  lr_date DATE NOT NULL,
  trip_id VARCHAR(50) NOT NULL,
  trip_number VARCHAR(50) NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  eway_bill_number VARCHAR(50),
  client_name VARCHAR(255) NOT NULL,
  
  -- Consignor & Consignee
  consignor_name VARCHAR(255) NOT NULL,
  consignor_address TEXT,
  consignor_gstin VARCHAR(20),
  consignee_name VARCHAR(255) NOT NULL,
  consignee_delivery_address TEXT NOT NULL,
  consignee_gstin VARCHAR(20),
  
  -- Cargo Summary
  description_of_goods TEXT NOT NULL,
  number_of_packages INTEGER NOT NULL DEFAULT 0,
  weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  
  -- Delivery Verification
  delivery_status VARCHAR(50) NOT NULL DEFAULT 'Delivered in Full' CHECK (delivery_status IN ('Delivered in Full', 'Partial Delivery', 'Short Delivery', 'Damaged', 'Delivery Refused', 'Other Exception')),
  exception_details JSONB,
  
  -- Receiver Acknowledgement
  receiver_name VARCHAR(255) NOT NULL,
  receiver_designation VARCHAR(150),
  receiver_company_name VARCHAR(255),
  receiver_phone VARCHAR(30) NOT NULL,
  goods_received_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  receiver_signature_url TEXT,
  
  -- Timings & GPS
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_time VARCHAR(20) NOT NULL,
  delivery_gps_latitude NUMERIC(10, 6),
  delivery_gps_longitude NUMERIC(10, 6),
  
  -- Attachments JSONB array
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  status VARCHAR(30) NOT NULL DEFAULT 'Captured' CHECK (status IN ('Captured', 'Verified', 'Modified')),
  created_by VARCHAR(100) DEFAULT 'Driver',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pod_number ON pod_records(pod_number);
CREATE INDEX IF NOT EXISTS idx_pod_lr_number ON pod_records(lr_number);
CREATE INDEX IF NOT EXISTS idx_pod_trip_id ON pod_records(trip_id);

-- 14. Document Sequential Numbering Tracker
CREATE TABLE IF NOT EXISTS document_sequences (
  id VARCHAR(50) PRIMARY KEY,
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('LR', 'POD')),
  prefix VARCHAR(30) NOT NULL,
  financial_year VARCHAR(10) NOT NULL,
  current_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_type, financial_year)
);

-- 15. Enterprise Document Audit Log
CREATE TABLE IF NOT EXISTS document_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('LR', 'POD')),
  document_id VARCHAR(50) NOT NULL,
  document_number VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  details TEXT NOT NULL,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_doc_audit_doc_id ON document_audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_number ON document_audit_logs(document_number);


