export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Operations Lead' | 'Staff' | 'Auditor';
  status?: 'Active' | 'Pending Invite' | 'Inactive';
  createdAt?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  name?: string;
  role: string;
  phone: string;
  email: string;
  aadhaar_number: string;
  license_number: string;
  base_salary: number;
  salary?: number;
  salary_amount?: number;
  salary_billing_cycle?: string;
  is_pf_opted_in?: boolean;
  pf_percentage?: number;
  joining_date: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Cleared' | 'Flagged with Damages';
  photo_url?: string;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  license_image_url?: string;
  advances_taken: number;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  base_salary: number;
  gross_salary?: number;
  present_days: number;
  total_working_days: number;
  advances_taken: number;
  attendance_deduction?: number;
  driver_advances?: number;
  pf_deduction?: number;
  is_pf_deducted?: boolean | number;
  incentive?: number;
  bonus?: number;
  other_deductions?: number;
  other_deductions_notes?: string;
  taxes?: number;
  net_payout: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paid_date?: string;
}

export interface Truck {
  id: string;
  truck_number: string;
  model: string;
  status: 'Available' | 'On Trip' | 'Under Maintenance';
  current_odometer: number;
  manager_id?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  battery_serial_number?: string;
  battery_install_date?: string;
  battery?: {
    serial_number: string;
    image_url?: string;
    purchase_date: string;
    warranty_months: number;
  };
}

export interface TruckTyre {
  id: string;
  truck_id: string;
  serial_number: string;
  brand: string;
  size: string;
  axle_position: 'Front Left Steer' | 'Front Right Steer' | 'Rear Left Outer' | 'Rear Left Inner' | 'Rear Right Inner' | 'Rear Right Outer' | string;
  assignment_start_kms: number;
  current_lifecycle_kms: number;
  tread_depth_mm?: number;
  mileage_kms?: number;
  lifecycle_threshold_kms: number;
  status: 'Normal' | 'Rotation Due' | 'Replacement Recommended' | string;
  wear_status?: string;
  tread_image_url?: string;
  sidewall_image_url?: string;
  invoice_url?: string;
  installed_date: string;
}

export interface TyreSwapLog {
  id: string;
  truck_id: string;
  tyre_serial_1: string;
  tyre_serial_2: string;
  from_position: string;
  to_position: string;
  odometer_reading: number;
  timestamp: string;
  performed_by: string;
  notes?: string;
}

export interface Route {
  id: string;
  route_code: string;
  name: string;
  origin: string;
  destination: string;
  distance_kms: number;
  standard_revenue: number;
  fuel_estimate_liters: number;
  toll_estimate: number;
}

export interface ClientProfile {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  gst_number: string;
  requires_pod: boolean;
  default_rate_per_km?: number;
}

export interface TripLog {
  id: string;
  trip_number: string;
  truck_id: string;
  truck_number: string;
  driver_id: string;
  driver_name: string;
  client_id: string;
  client_name: string;
  route_id?: string;
  route_name?: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date?: string;
  due_date?: string;
  invoice_number?: string;
  distance_kms: number;
  revenue: number;
  fuel_cost: number;
  toll_cost: number;
  driver_allowance: number;
  tyre_depreciation_rate_per_km: number;
  tyre_depreciation_expense: number;
  total_expenses: number;
  net_profit: number;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled';
  clientPaymentStatus: 'Paid' | 'Pending' | 'Delayed' | 'Partially Paid';
  requires_pod: boolean;
  pod_status?: 'Pending' | 'Uploaded' | 'Verified';
  pod_file_url?: string;
  billing_cycle_id?: string;
  is_short_haul?: boolean;
}

export interface BillingCycle {
  id: string;
  cycle_code: string;
  start_date: string;
  end_date: string;
  expected_payout_date: string;
  status: 'Open' | 'Pending Approval' | 'Invoiced' | 'Settled';
  trip_ids: string[];
  total_invoiced_amount: number;
  actual_collected_amount?: number;
  is_manually_overridden: boolean;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  vehicle_number: string;
  date: string;
  distance_kms: number;
  liters: number;
  cost: number;
  odometer: number;
  payment_method: 'Cash' | 'Credit Card' | 'UPI';
  upi_vpa?: string;
  credit_card_id?: string;
  receipt_images?: string[];
  notes?: string;
}

export interface ExpenseCategoryItem {
  id: string;
  name: string;
  icon?: string;
  subcategories: string[];
}

export interface Expense {
  id: string;
  expense_number: string;
  category: string;
  subcategory: string;
  vendor_name: string;
  vendor_gstin?: string;
  bill_number?: string;
  bill_date: string;
  vehicle_id?: string;
  vehicle_number?: string;
  driver_id?: string;
  driver_name?: string;
  trip_id?: string;
  trip_number?: string;
  taxable_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total_gst?: number;
  gst_input_credit_eligible?: 'Yes' | 'No' | 'Review';
  amount: number;
  payment_method: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'FASTag' | 'Company Account' | 'Other';
  payment_reference?: string;
  location?: string;
  description?: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  document_url?: string;
  document_name?: string;
  document_hash?: string;
  ocr_raw_data?: any;
  ocr_confidence?: Record<string, 'high' | 'medium' | 'low'>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CashbookTransaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'OPENING_BALANCE';
  category: 'Trip Payment' | 'Fuel' | 'Maintenance' | 'Payroll' | 'Toll' | 'Driver Allowance' | 'Driver Advance' | 'Loan EMI' | 'Credit Card Settlement' | 'Initial Opening Balance' | 'Other';
  amount: number;
  account?: 'Cash' | 'Bank' | 'UPI' | 'Credit Card';
  reference_id?: string;
  referenced_id?: string;
  description: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  part_number?: string;
  category: 'Engine' | 'Braking' | 'Electrical' | 'Suspension' | 'Tyres' | 'Fluids & Filters' | 'Body';
  quantity: number;
  unit_cost: number;
  min_stock_alert: number;
  bill_image_urls?: string[];
  last_restocked: string;
}

export interface FleetPart {
  id: string;
  truck_id: string;
  part_name: string;
  part_number: string;
  serial_number: string;
  installed_date: string;
  install_date?: string;
  cost: number;
  image_urls?: string[];
  notes?: string;
}

export interface MaintenanceProblem {
  id: string;
  truck_id: string;
  truck_number: string;
  issue_title?: string;
  reported_date: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  status: 'Reported' | 'In Progress' | 'Resolved' | 'Open' | string;
  image_urls?: string[];
  images?: string[];
  cost_estimate?: number;
  resolved_cost?: number;
}

export interface CreditCard {
  id: string;
  card_name: string;
  bank_name: string;
  card_number_last4: string;
  statement_date: string;
  due_date: string;
  statement_amount: number;
  minimum_due: number;
  status: 'Due' | 'Paid' | 'Overdue';
}

export interface Reminder {
  id: string;
  title: string;
  due_date: string;
  amount?: number;
  source_type: 'Credit Card' | 'Trip Payment' | 'Insurance' | 'Loan EMI' | 'Custom';
  source_id?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Dismissed';
}

export interface DriverAccidentReport {
  id: string;
  employee_id: string;
  employee_name: string;
  driver_name?: string;
  truck_id: string;
  truck_number: string;
  trip_id?: string;
  incident_date: string;
  accident_date?: string;
  description: string;
  damage_cost: number;
  estimated_cost?: number;
  image_urls: string[];
  insurance_claimed: boolean;
  claim_amount?: number;
  created_at: string;
}

export interface ExitAudit {
  id: string;
  employee_id: string;
  employee_name: string;
  truck_id: string;
  truck_number: string;
  audit_date: string;
  odometer_reading: number;
  body_damages_description: string;
  body_damage_images: string[];
  registered_battery_serial: string;
  inspected_battery_serial: string;
  battery_matched: boolean;
  battery_snapshot_url?: string;
  tyre_checks: {
    position: string;
    registered_serial: string;
    inspected_serial: string;
    matched: boolean;
    tread_image_url?: string;
  }[];
  verdict: 'Cleared' | 'Flagged with Damages';
  deduction_amount: number;
  auditor_name: string;
  created_at: string;
}

export interface LoanDetail {
  id: string;
  bank_name: string;
  loan_account_number: string;
  truck_number: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  disbursal_date: string;
  first_emi_date: string;
  outstanding_balance: number;
}

export interface MailboxMessage {
  id: string;
  folder: 'Inbox' | 'Sent' | 'Drafts' | 'Trash';
  sender_name: string;
  from_name?: string;
  sender_email: string;
  from_email?: string;
  recipient_email: string;
  to_email?: string;
  subject: string;
  body: string;
  received_at: string;
  date?: string;
  is_read: boolean;
  read?: boolean;
  is_starred: boolean;
  attachments?: string[];
}

export interface GoodsItem {
  id: string;
  package_count: number;
  package_type: string; // e.g. 'Boxes', 'Bags', 'Barrels', 'Pallets', 'Cartons', 'Rolls', 'Loose'
  description: string;
  actual_weight_kg: number;
  charged_weight_kg: number;
  quantity?: number;
  remarks?: string;
}

export interface FreightDetails {
  freight_amount: number;
  loading_charges: number;
  unloading_charges: number;
  detention_charges: number;
  other_charges: number;
  discount: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_freight: number;
  payment_basis: 'Paid' | 'To Pay' | 'To Be Billed';
  payment_terms: string;
}

export interface LorryReceipt {
  id: string;
  lr_number: string; // e.g. 'JBC/26-27/000001'
  lr_date: string;
  booking_date: string;
  eway_bill_number?: string;
  invoice_number?: string;
  customer_ref_number?: string;
  trip_id: string;
  trip_number: string;
  
  // Client & Parties
  client_id?: string;
  client_name: string;
  consignor: {
    name: string;
    address: string;
    gstin?: string;
    phone: string;
  };
  consignee: {
    name: string;
    delivery_address: string;
    gstin?: string;
    phone: string;
  };
  
  // Vehicle & Driver
  vehicle_details: {
    vehicle_number: string;
    vehicle_type: string;
    vehicle_capacity_tons?: number;
    vehicle_model?: string;
    driver_name: string;
    driver_phone: string;
  };
  
  // Route
  route_details: {
    origin: string;
    destination: string;
    pickup_location: string;
    delivery_location: string;
    pickup_date_time?: string;
    expected_delivery_date_time?: string;
  };
  
  // Goods & Freight
  goods_items: GoodsItem[];
  freight_details: FreightDetails;
  
  // Declaration & Legal Terms
  declaration_terms: string;
  
  // Operational Status
  status: 'Draft' | 'Generated' | 'Cancelled';
  secure_token: string; // Cryptographic public tracking token
  pod_id?: string;
  pod_number?: string;
  pod_status?: 'Pending' | 'Delivered in Full' | 'Partial Delivery' | 'Short Delivery' | 'Damaged' | 'Delivery Refused' | 'Other Exception';
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PodAttachment {
  id: string;
  name: string;
  file_type: string; // 'image/jpeg', 'image/png', 'application/pdf'
  file_size: number;
  data_url: string;
  uploaded_at: string;
}

export interface PodRecord {
  id: string;
  pod_number: string; // e.g. 'JBC/POD/26-27/000001'
  lr_id: string;
  lr_number: string;
  lr_date: string;
  trip_id: string;
  trip_number: string;
  vehicle_number: string;
  driver_name: string;
  eway_bill_number?: string;
  client_name: string;
  
  // Consignor & Consignee Snapshot
  consignor_name: string;
  consignor_address: string;
  consignor_gstin?: string;
  consignee_name: string;
  consignee_delivery_address: string;
  consignee_gstin?: string;
  
  // Shipment Snapshot
  description_of_goods: string;
  number_of_packages: number;
  quantity?: number;
  weight_kg: number;
  origin: string;
  destination: string;
  
  // Delivery Execution
  delivery_status: 'Delivered in Full' | 'Partial Delivery' | 'Short Delivery' | 'Damaged' | 'Delivery Refused' | 'Other Exception';
  exception_details?: {
    shortage_qty?: number;
    damaged_qty?: number;
    damage_description?: string;
    missing_package_details?: string;
    remarks: string;
  };
  
  // Receiver Acknowledgement
  receiver_name: string;
  receiver_designation: string;
  receiver_company_name: string;
  receiver_phone: string;
  goods_received_confirmed: boolean;
  receiver_signature_url?: string; // Digital touch signature PNG data-url
  
  delivery_date: string;
  delivery_time: string;
  delivery_gps_coordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  
  attachments: PodAttachment[];
  
  status: 'Captured' | 'Verified' | 'Modified';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentSequence {
  id: string;
  document_type: 'LR' | 'POD';
  prefix: string; // e.g. 'JBC' or 'JBC/POD'
  financial_year: string; // e.g. '26-27'
  current_number: number;
}

export interface DocumentAuditLog {
  id: string;
  document_type: 'LR' | 'POD';
  document_id: string;
  document_number: string;
  action: 'Created' | 'Edited' | 'Generated' | 'Cancelled' | 'Submitted' | 'Completed' | 'Modified' | 'Downloaded' | 'Shared';
  user_name: string;
  user_role: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}