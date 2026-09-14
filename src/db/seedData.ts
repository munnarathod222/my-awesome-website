import { Employee, Truck, TruckTyre, Route, ClientProfile, TripLog, BillingCycle, FuelLog, CashbookTransaction, InventoryItem, FleetPart, CreditCard, Reminder, DriverAccidentReport, ExitAudit, LoanDetail, MailboxMessage, AttendanceLog, PayrollRecord, MaintenanceProblem, Expense, ExpenseCategoryItem } from '../types';

export const initialEmployees: Employee[] = [
  {
    id: 'emp-001',
    full_name: 'Vinod Kumar Rathod',
    role: 'Senior Heavy Truck Driver',
    phone: '+91 98765 43210',
    email: 'vinod@jaibhavanicargo.com',
    aadhaar_number: '1234 5678 9012',
    license_number: 'TS29 20170008981',
    base_salary: 28500,
    joining_date: '2024-03-15',
    status: 'Active',
    advances_taken: 3500,
    photo_url: '/assets/vinod_photo.png',
    aadhaar_front_url: '/assets/aadhaar_front.png',
    aadhaar_back_url: '/assets/aadhaar_back.png',
    license_image_url: '/assets/license_image.png'
  },
  {
    id: 'emp-002',
    full_name: 'Ramesh Patel',
    role: 'Fleet Manager',
    phone: '+91 98234 11223',
    email: 'ramesh.f@mail.com',
    aadhaar_number: '9876 5432 1098',
    license_number: 'TS29 20200001234',
    base_salary: 45000,
    joining_date: '2023-08-01',
    status: 'Active',
    advances_taken: 0,
  },
  {
    id: 'emp-003',
    full_name: 'Suresh Rao',
    role: 'Dreiving Staff',
    phone: '+91 91234 56789',
    email: 'suresh.r@mail.com',
    aadhaar_number: '4567 8901 2345',
    license_number: 'TS29 20190009876',
    base_salary: 25000,
    joining_date: '2024-01-10',
    status: 'Active',
    advances_taken: 1200,
  }
];

export const initialTrucks: Truck[] = [
  {
    id: 'truck-001',
    truck_number: 'TG12U2637',
    model: 'Tata Signa 48023',
    status: 'Available',
    current_odometer: 145830,
    manager_id: 'emp-002',
    manager_name: 'Ramesh Patel',
    manager_phone: '+91 98234 11223',
    manager_email: 'ramesh.f@mail.com',
    battery: {
      serial_number: 'EXD-TRK-2024-9881',
      purchase_date: '2024-05-10',
      warranty_months: 24,
      image_url: 'https://images.unsplash.com/photo-1582442563766-1bb0dca4d998?w=500'
    }
  },
  {
    id: 'truck-002',
    truck_number: 'TS29AB1999',
    model: 'Ashok Leyland Apollo 5525',
    status: 'Available',
    current_odometer: 89450,
    manager_id: 'emp-002',
    manager_name: 'Ramesh Patel',
    manager_phone: '+91 98234 11223',
    manager_email: 'ramesh.f@mail.com',
    battery: {
      serial_number: 'AMF-HIV-88912',
      purchase_date: '2024-08-15',
      warranty_months: 36,
    }
  }
];

export const initialTruckTyres: TruckTyre[] = [
  {
    id: 'tyre-01',
    truck_id: 'truck-001',
    serial_number: 'TY-2024-MRF-0089',
    brand: 'MRF Muscle Mile',
    size: '295/90 R22.5',
    axle_position: 'Front Left Steer',
    assignment_start_kms: 130000,
    current_lifecycle_kms: 15830,
    lifecycle_threshold_kms: 80000,
    status: 'Normal',
    installed_date: '2024-06-15'
  },
  {
    id: 'tyre-02',
    truck_id: 'truck-001',
    serial_number: 'TY-2024-MRF-0090',
    brand: 'MRF Muscle Mile',
    size: '295/90 R22.5',
    axle_position: 'Front Right Steer',
    assignment_start_kms: 130000,
    current_lifecycle_kms: 15830,
    lifecycle_threshold_kms: 80000,
    status: 'Normal',
    installed_date: '2024-06-15'
  },
  {
    id: 'tyre-03',
    truck_id: 'truck-001',
    serial_number: 'TY-2023-JK-9811',
    brand: 'JK Tyre JEWA',
    size: '295/90 R22.5',
    axle_position: 'Rear Left Outer',
    assignment_start_kms: 95000,
    current_lifecycle_kms: 50830,
    lifecycle_threshold_kms: 75000,
    status: 'Normal',
    installed_date: '2023-11-01'
  },
  {
    id: 'tyre-04',
    truck_id: 'truck-001',
    serial_number: 'TY-2023-JK-9812',
    brand: 'JK Tyre JEWA',
    size: '295/90 R22.5',
    axle_position: 'Rear Left Inner',
    assignment_start_kms: 95000,
    current_lifecycle_kms: 50830,
    lifecycle_threshold_kms: 75000,
    status: 'Normal',
    installed_date: '2023-11-01'
  },
  {
    id: 'tyre-05',
    truck_id: 'truck-001',
    serial_number: 'TY-2022-APO-1200',
    brand: 'Apollo Endu-Trax',
    size: '295/90 R22.5',
    axle_position: 'Rear Right Inner',
    assignment_start_kms: 65000,
    current_lifecycle_kms: 80830,
    lifecycle_threshold_kms: 80000,
    status: 'Rotation Due',
    installed_date: '2023-03-10'
  },
  {
    id: 'tyre-06',
    truck_id: 'truck-001',
    serial_number: 'TY-2022-APO-1201',
    brand: 'Apollo Endu-Trax',
    size: '295/90 R22.5',
    axle_position: 'Rear Right Outer',
    assignment_start_kms: 65000,
    current_lifecycle_kms: 81830,
    lifecycle_threshold_kms: 80000,
    status: 'Replacement Recommended',
    installed_date: '2023-03-10'
  }
];

export const initialRoutes: Route[] = [
  {
    id: 'rt-001',
    route_code: 'HYD-WAR-01',
    name: 'Hyderabad to Warangal (FORWARD)',
    origin: 'Hyderabad',
    destination: 'Warangal',
    distance_kms: 150,
    standard_revenue: 7029,
    fuel_estimate_liters: 45,
    toll_estimate: 550
  },
  {
    id: 'rt-002',
    route_code: 'WAR-HYD-02',
    name: 'Warangal to Hyderabad (RETURN)',
    origin: 'Warangal',
    destination: 'Hyderabad',
    distance_kms: 150,
    standard_revenue: 7029,
    fuel_estimate_liters: 45,
    toll_estimate: 550
  }
];

export const initialClients: ClientProfile[] = [
  {
    id: 'cli-001',
    company_name: 'Amazon Logistics India',
    contact_person: 'Rajesh Kumar',
    phone: '+91 98111 22334',
    email: 'billing@amazon.in',
    gst_number: '36AAAAA0000A1Z5',
    requires_pod: true,
    default_rate_per_km: 47.33
  },
  {
    id: 'cli-002',
    company_name: 'Flipkart Logistics',
    contact_person: 'Anil Sharma',
    phone: '+91 98222 33445',
    email: 'finance@flipkart.com',
    gst_number: '36BBBBB1111B2Z6',
    requires_pod: true,
    default_rate_per_km: 48.00
  },
  {
    id: 'cli-003',
    company_name: 'Reliance Retail Logistics',
    contact_person: 'Srinivas V',
    phone: '+91 98333 44556',
    email: 'freight@ril.com',
    gst_number: '36CCCCC2222C3Z7',
    requires_pod: true,
    default_rate_per_km: 46.80
  }
];

export const initialTrips: TripLog[] = [
  // Delivered / Completed Trips - Paid
  {
    id: 'trip-101',
    trip_number: 'TRIP-101',
    truck_id: 'truck-001',
    truck_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    route_id: 'rt-001',
    route_name: 'Hyderabad to Warangal',
    origin: 'Hyderabad',
    destination: 'Warangal',
    start_date: '2026-08-01',
    end_date: '2026-08-02',
    due_date: '2026-08-15',
    distance_kms: 150,
    revenue: 7100,
    fuel_cost: 2300,
    toll_cost: 550,
    driver_allowance: 1000,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 450,
    total_expenses: 4300,
    net_profit: 2800,
    status: 'Completed',
    clientPaymentStatus: 'Paid',
    requires_pod: true,
    pod_status: 'Verified',
    invoice_number: 'INV-2026-0801'
  },
  {
    id: 'trip-102',
    trip_number: 'TRIP-102',
    truck_id: 'truck-002',
    truck_number: 'TS29AB1999',
    driver_id: 'emp-003',
    driver_name: 'Suresh Rao',
    client_id: 'cli-002',
    client_name: 'Flipkart Logistics',
    route_id: 'rt-002',
    route_name: 'Warangal to Hyderabad',
    origin: 'Warangal',
    destination: 'Hyderabad',
    start_date: '2026-08-05',
    end_date: '2026-08-06',
    due_date: '2026-08-20',
    distance_kms: 150,
    revenue: 7200,
    fuel_cost: 2200,
    toll_cost: 550,
    driver_allowance: 1000,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 450,
    total_expenses: 4200,
    net_profit: 3000,
    status: 'Completed',
    clientPaymentStatus: 'Paid',
    requires_pod: true,
    pod_status: 'Verified',
    invoice_number: 'INV-2026-0802'
  },

  // Delivered / Completed Trips - Pending Collection (Outstandings)
  {
    id: 'trip-201',
    trip_number: 'TRIP-201',
    truck_id: 'truck-001',
    truck_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    origin: 'Hyderabad',
    destination: 'Vijayawada',
    start_date: '2026-08-20',
    end_date: '2026-08-22',
    due_date: '2026-09-05',
    distance_kms: 275,
    revenue: 13500,
    fuel_cost: 4100,
    toll_cost: 850,
    driver_allowance: 1500,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 825,
    total_expenses: 7275,
    net_profit: 6225,
    status: 'Delivered',
    clientPaymentStatus: 'Pending',
    requires_pod: true,
    pod_status: 'Verified',
    invoice_number: 'INV-2026-0820'
  },
  {
    id: 'trip-202',
    trip_number: 'TRIP-202',
    truck_id: 'truck-002',
    truck_number: 'TS29AB1999',
    driver_id: 'emp-003',
    driver_name: 'Suresh Rao',
    client_id: 'cli-003',
    client_name: 'Reliance Retail Logistics',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    start_date: '2026-08-22',
    end_date: '2026-08-25',
    due_date: '2026-09-10',
    distance_kms: 570,
    revenue: 28500,
    fuel_cost: 9200,
    toll_cost: 1850,
    driver_allowance: 2500,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 1710,
    total_expenses: 15260,
    net_profit: 13240,
    status: 'Delivered',
    clientPaymentStatus: 'Delayed',
    requires_pod: true,
    pod_status: 'Verified',
    invoice_number: 'INV-2026-0822'
  },

  // Upcoming Trips - Scheduled / In Transit (MUST NOT count towards Total Revenue or Dues Outstanding!)
  {
    id: 'trip-280',
    trip_number: 'TRIP-280',
    truck_id: 'truck-001',
    truck_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    origin: 'Hyderabad',
    destination: 'Warangal',
    start_date: '2026-09-28',
    due_date: '2026-10-05',
    distance_kms: 150,
    revenue: 7100,
    fuel_cost: 2300,
    toll_cost: 550,
    driver_allowance: 1000,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 450,
    total_expenses: 4300,
    net_profit: 2800,
    status: 'Scheduled',
    clientPaymentStatus: 'Pending',
    requires_pod: true,
    pod_status: 'Pending'
  },
  {
    id: 'trip-281',
    trip_number: 'TRIP-281',
    truck_id: 'truck-002',
    truck_number: 'TS29AB1999',
    driver_id: 'emp-003',
    driver_name: 'Suresh Rao',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    origin: 'Hyderabad',
    destination: 'Warangal',
    start_date: '2026-09-29',
    due_date: '2026-10-06',
    distance_kms: 150,
    revenue: 7100,
    fuel_cost: 2300,
    toll_cost: 550,
    driver_allowance: 1000,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 450,
    total_expenses: 4300,
    net_profit: 2800,
    status: 'In Transit',
    clientPaymentStatus: 'Pending',
    requires_pod: true,
    pod_status: 'Pending'
  },
  {
    id: 'trip-282',
    trip_number: 'TRIP-282',
    truck_id: 'truck-001',
    truck_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    origin: 'Hyderabad',
    destination: 'Warangal',
    start_date: '2026-09-30',
    due_date: '2026-10-07',
    distance_kms: 150,
    revenue: 7100,
    fuel_cost: 2300,
    toll_cost: 550,
    driver_allowance: 1000,
    tyre_depreciation_rate_per_km: 3,
    tyre_depreciation_expense: 450,
    total_expenses: 4300,
    net_profit: 2800,
    status: 'Scheduled',
    clientPaymentStatus: 'Pending',
    requires_pod: true,
    pod_status: 'Pending'
  }
];

export const initialExpenseCategories: ExpenseCategoryItem[] = [
  {
    id: 'cat-fuel',
    name: 'Fuel',
    icon: 'Fuel',
    subcategories: ['Diesel', 'Petrol', 'DEF/AdBlue', 'Other fuel']
  },
  {
    id: 'cat-toll',
    name: 'Toll & Road',
    icon: 'Navigation',
    subcategories: ['Toll', 'FASTag recharge', 'Parking', 'Road tax']
  },
  {
    id: 'cat-maint',
    name: 'Maintenance',
    icon: 'Wrench',
    subcategories: [
      'Engine oil', 'Filter', 'Tyre', 'Puncture', 'Battery', 'Brake',
      'Suspension', 'Electrical', 'Mechanical repair', 'Washing',
      'Greasing', 'Spare parts', 'Labour'
    ]
  },
  {
    id: 'cat-docs',
    name: 'Vehicle Documents',
    icon: 'FileText',
    subcategories: ['Insurance', 'Fitness', 'Permit', 'PUC', 'Registration', 'Tax', 'Challan']
  },
  {
    id: 'cat-driver',
    name: 'Driver',
    icon: 'Users',
    subcategories: ['Salary', 'Advance', 'Bata/allowance', 'Food', 'Accommodation', 'Other driver expense']
  },
  {
    id: 'cat-ops',
    name: 'Operations',
    icon: 'Truck',
    subcategories: [
      'Loading/unloading', 'Warehouse charges', 'Loading labour',
      'Unloading labour', 'Weighbridge', 'Parking', 'Miscellaneous trip expense'
    ]
  },
  {
    id: 'cat-biz',
    name: 'Business',
    icon: 'Briefcase',
    subcategories: [
      'Office expense', 'Telephone', 'Internet', 'Software',
      'Bank charges', 'Professional fees', 'Advertising', 'Travel', 'Stationery', 'Other'
    ]
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-001',
    expense_number: 'EXP-000184',
    category: 'Maintenance',
    subcategory: 'Tyre',
    vendor_name: 'ABC Tyres & Spares',
    vendor_gstin: '36AABCA1234F1Z8',
    bill_number: 'INV-12345',
    bill_date: '2026-09-10',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    trip_id: 'trip-281',
    trip_number: 'TRIP-281',
    taxable_amount: 15678,
    cgst: 1411,
    sgst: 1411,
    igst: 0,
    total_gst: 2822,
    gst_input_credit_eligible: 'Yes',
    amount: 18500,
    payment_method: 'UPI',
    payment_reference: 'UPI/987123654129',
    location: 'Hyderabad',
    description: 'Front tyre replacement Apollo EnduRace 295/80 R22.5',
    notes: 'Approved by Fleet Manager Ramesh Patel',
    status: 'Approved',
    document_name: 'abc_tyres_receipt.jpg',
    created_by: 'Admin',
    created_at: '2026-09-10T11:30:00Z',
    updated_at: '2026-09-10T11:30:00Z'
  },
  {
    id: 'exp-002',
    expense_number: 'EXP-000185',
    category: 'Toll & Road',
    subcategory: 'FASTag recharge',
    vendor_name: 'IHMCL / NETC FASTag',
    bill_number: 'FT-992019',
    bill_date: '2026-09-09',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    trip_id: 'trip-281',
    trip_number: 'TRIP-281',
    taxable_amount: 2150,
    amount: 2150,
    payment_method: 'FASTag',
    location: 'Pantangi Toll Plaza',
    description: 'Highway toll clearance - Hyderabad-Vijayawada section',
    status: 'Paid',
    created_by: 'Fleet Manager',
    created_at: '2026-09-09T14:15:00Z',
    updated_at: '2026-09-09T14:15:00Z'
  },
  {
    id: 'exp-003',
    expense_number: 'EXP-000186',
    category: 'Maintenance',
    subcategory: 'Mechanical repair',
    vendor_name: 'XYZ Motors & Engineering Works',
    vendor_gstin: '36XYZAA8899K1ZV',
    bill_number: 'ME-4081',
    bill_date: '2026-09-08',
    vehicle_id: 'truck-002',
    vehicle_number: 'TS29AB1999',
    driver_id: 'emp-003',
    driver_name: 'Suresh Rao',
    taxable_amount: 4067.80,
    cgst: 366.10,
    sgst: 366.10,
    total_gst: 732.20,
    gst_input_credit_eligible: 'Yes',
    amount: 4800,
    payment_method: 'Cash',
    location: 'Warangal Bypass',
    description: 'Radiator hose replacement and coolant top-up',
    status: 'Approved',
    created_by: 'Admin',
    created_at: '2026-09-08T16:40:00Z',
    updated_at: '2026-09-08T16:40:00Z'
  },
  {
    id: 'exp-004',
    expense_number: 'EXP-000187',
    category: 'Fuel',
    subcategory: 'Diesel',
    vendor_name: 'Indian Oil Corporation Filling Station',
    vendor_gstin: '36IOCLS5566A1ZP',
    bill_number: 'IOCL-77123',
    bill_date: '2026-09-07',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    trip_id: 'trip-281',
    trip_number: 'TRIP-281',
    amount: 14500,
    payment_method: 'Credit Card',
    location: 'Suryapet Highway',
    description: 'Diesel refuel 154.25 Litres @ ₹94.00/L',
    status: 'Paid',
    created_by: 'Vinod Kumar Rathod',
    created_at: '2026-09-07T08:20:00Z',
    updated_at: '2026-09-07T08:20:00Z'
  },
  {
    id: 'exp-005',
    expense_number: 'EXP-000188',
    category: 'Driver',
    subcategory: 'Accommodation',
    vendor_name: 'Highway King Comfort Residency',
    bill_number: 'HK-2026-44',
    bill_date: '2026-09-06',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    driver_id: 'emp-001',
    driver_name: 'Vinod Kumar Rathod',
    trip_id: 'trip-281',
    trip_number: 'TRIP-281',
    amount: 1200,
    payment_method: 'UPI',
    location: 'Vijayawada',
    description: 'Driver night stay allowance during transit',
    status: 'Approved',
    created_by: 'Admin',
    created_at: '2026-09-06T22:00:00Z',
    updated_at: '2026-09-06T22:00:00Z'
  },
  {
    id: 'exp-006',
    expense_number: 'EXP-000189',
    category: 'Operations',
    subcategory: 'Weighbridge',
    vendor_name: 'Dharmakanta Electronic Weighbridge',
    bill_number: 'WB-8819',
    bill_date: '2026-09-05',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    trip_id: 'trip-281',
    trip_number: 'TRIP-281',
    amount: 300,
    payment_method: 'Cash',
    location: 'Warangal Industrial Estate',
    description: 'Gross and Tare weight verification slip',
    status: 'Paid',
    created_by: 'Vinod Kumar Rathod',
    created_at: '2026-09-05T10:10:00Z',
    updated_at: '2026-09-05T10:10:00Z'
  },
  {
    id: 'exp-007',
    expense_number: 'EXP-000180',
    category: 'Maintenance',
    subcategory: 'Engine oil',
    vendor_name: 'Castrol Auto Hub',
    bill_number: 'CS-5510',
    bill_date: '2026-08-25',
    vehicle_id: 'truck-001',
    vehicle_number: 'TG12U2637',
    amount: 14900,
    payment_method: 'Bank Transfer',
    location: 'Hyderabad',
    description: 'Castrol CRB Turbomax 15W-40 20L Oil & filter change',
    status: 'Paid',
    created_by: 'Fleet Manager',
    created_at: '2026-08-25T15:00:00Z',
    updated_at: '2026-08-25T15:00:00Z'
  }
];

export const initialCompanySettings = {
  company_name: 'JAI BHAVANI CARGO',
  tagline: 'Goods Transport Operators & Fleet Contractors',
  company_address: 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301',
  company_gstin: '36DPXPR9171A1Z8',
  company_pan: 'DPXPR9171A',
  company_phone: '+91 7794072244',
  company_email: 'vinod@jaibhavanicargo.com',
  company_website: 'www.jaibhavanicargo.com',
  logo_url: '/logo.png',
  opening_balance: 50000,
  current_balance: 50000,
  bank_name: 'HDFC BANK',
  account_name: 'JAI BHAVANI CARGO',
  account_number: '50200117182677',
  ifsc_code: 'HDFC0004480',
  branch_name: 'GHATKESAR BRANCH',
  lr_prefix: 'JBC',
  pod_prefix: 'JBC/POD',
  lr_default_terms: `1. The consignment is accepted for carriage subject to standard road transport conditions.
2. Goods are booked strictly at Owner's Risk (O.R.) unless separately insured.
3. The Transporter is not liable for leakage, pilferage, rain damage, or natural calamities beyond reasonable control.
4. Delivery shall be executed only upon surrender of the original consignee copy of this Lorry Receipt.
5. Free unloading time is 3 hours; demurrage/detention charges apply thereafter.
6. All disputes are subject to the exclusive jurisdiction of the competent courts in Ghatkesar / Hyderabad.`
};

export const initialLorryReceipts = [
  {
    id: 'lr-101',
    lr_number: 'JBC/26-27/000001',
    lr_date: '2026-08-01',
    booking_date: '2026-08-01',
    eway_bill_number: 'EWB-361099238120',
    invoice_number: 'INV-2026-0801',
    customer_ref_number: 'AMZ-HYD-WAR-9821',
    trip_id: 'trip-101',
    trip_number: 'TRIP-101',
    client_id: 'cli-001',
    client_name: 'Amazon Logistics India',
    consignor: {
      name: 'Amazon Fulfillment Center (HYD1)',
      address: 'Survey No. 99, Shamshabad Cargo Terminal, Hyderabad, Telangana - 501218',
      gstin: '36AAAAA0000A1Z5',
      phone: '+91 98111 22334'
    },
    consignee: {
      name: 'Amazon Delivery Station (WAR1)',
      address: 'Plot 45, Auto Nagar, Industrial Estate, Warangal, Telangana - 506002',
      gstin: '36AAAAA0000A1Z5',
      phone: '+91 98490 88776'
    },
    vehicle_details: {
      vehicle_number: 'TG12U2637',
      vehicle_type: 'Heavy Commercial Vehicle (32FT Container)',
      vehicle_capacity_tons: 14.5,
      vehicle_model: 'Tata Signa 48023',
      driver_name: 'Vinod Kumar Rathod',
      driver_phone: '+91 98765 43210'
    },
    route_details: {
      origin: 'Hyderabad',
      destination: 'Warangal',
      pickup_location: 'Shamshabad FC, Hyderabad',
      delivery_location: 'Auto Nagar Hub, Warangal',
      pickup_date_time: '2026-08-01T08:00',
      expected_delivery_date_time: '2026-08-01T18:00'
    },
    goods_items: [
      {
        id: 'item-01',
        package_count: 240,
        package_type: 'Carton Boxes',
        description: 'E-commerce FMCG & Consumer Electronics Goods',
        actual_weight_kg: 5200,
        charged_weight_kg: 5500,
        quantity: 240,
        remarks: 'Handle with care. All packages shrink wrapped.'
      },
      {
        id: 'item-02',
        package_count: 45,
        package_type: 'Tote Boxes',
        description: 'Sorted Apparel & Footwear Items',
        actual_weight_kg: 950,
        charged_weight_kg: 1000,
        quantity: 45,
        remarks: 'Security barcode seals checked.'
      }
    ],
    freight_details: {
      freight_amount: 6500,
      loading_charges: 300,
      unloading_charges: 300,
      detention_charges: 0,
      other_charges: 0,
      discount: 0,
      taxable_amount: 7100,
      cgst: 177.5,
      sgst: 177.5,
      igst: 0,
      total_freight: 7455,
      payment_basis: 'To Be Billed' as const,
      payment_terms: '14 Days Net Credit'
    },
    declaration_terms: initialCompanySettings.lr_default_terms,
    status: 'Generated' as const,
    secure_token: 'jbc_lr_sec_20260801_amz01',
    pod_id: 'pod-101',
    pod_number: 'JBC/POD/26-27/000001',
    pod_status: 'Delivered in Full' as const,
    created_by: 'Fleet Manager',
    created_at: '2026-08-01T08:30:00Z',
    updated_at: '2026-08-02T16:00:00Z'
  },
  {
    id: 'lr-102',
    lr_number: 'JBC/26-27/000002',
    lr_date: '2026-08-03',
    booking_date: '2026-08-03',
    eway_bill_number: 'EWB-361099238992',
    invoice_number: 'INV-2026-0803',
    customer_ref_number: 'FK-HYD-NIZ-4411',
    trip_id: 'trip-102',
    trip_number: 'TRIP-102',
    client_id: 'cli-002',
    client_name: 'Flipkart Logistics',
    consignor: {
      name: 'Instakart Services Hub',
      address: 'Plot 12, Medchal Logistics Park, Hyderabad, Telangana - 501401',
      gstin: '36BBBBB1111B2Z6',
      phone: '+91 98222 33445'
    },
    consignee: {
      name: 'Flipkart Hub Nizamabad',
      address: 'Main Highway Road, Nizamabad, Telangana - 503001',
      gstin: '36BBBBB1111B2Z6',
      phone: '+91 98492 11223'
    },
    vehicle_details: {
      vehicle_number: 'TS29AB1999',
      vehicle_type: 'Heavy Goods Truck',
      vehicle_capacity_tons: 16.0,
      vehicle_model: 'Ashok Leyland Apollo 5525',
      driver_name: 'Suresh Rao',
      driver_phone: '+91 91234 56789'
    },
    route_details: {
      origin: 'Hyderabad',
      destination: 'Nizamabad',
      pickup_location: 'Medchal Logistics Park',
      delivery_location: 'Nizamabad Main Hub',
      pickup_date_time: '2026-08-03T09:00',
      expected_delivery_date_time: '2026-08-03T19:30'
    },
    goods_items: [
      {
        id: 'item-03',
        package_count: 310,
        package_type: 'Corrugated Cartons',
        description: 'Retail & Household Consumer Packages',
        actual_weight_kg: 6800,
        charged_weight_kg: 7000,
        quantity: 310,
        remarks: 'Original vendor seals intact'
      }
    ],
    freight_details: {
      freight_amount: 8200,
      loading_charges: 400,
      unloading_charges: 400,
      detention_charges: 0,
      other_charges: 0,
      discount: 0,
      taxable_amount: 9000,
      cgst: 225,
      sgst: 225,
      igst: 0,
      total_freight: 9450,
      payment_basis: 'To Be Billed' as const,
      payment_terms: '14 Days Net Credit'
    },
    declaration_terms: initialCompanySettings.lr_default_terms,
    status: 'Generated' as const,
    secure_token: 'jbc_lr_sec_20260803_fk02',
    pod_status: 'Delivered in Full' as const,
    created_by: 'Fleet Manager',
    created_at: '2026-08-03T09:15:00Z',
    updated_at: '2026-08-04T12:00:00Z'
  }
];

export const initialPodRecords = [
  {
    id: 'pod-101',
    pod_number: 'JBC/POD/26-27/000001',
    lr_id: 'lr-101',
    lr_number: 'JBC/26-27/000001',
    lr_date: '2026-08-01',
    trip_id: 'trip-101',
    trip_number: 'TRIP-101',
    vehicle_number: 'TG12U2637',
    driver_name: 'Vinod Kumar Rathod',
    eway_bill_number: 'EWB-361099238120',
    client_name: 'Amazon Logistics India',
    consignor_name: 'Amazon Fulfillment Center (HYD1)',
    consignor_address: 'Survey No. 99, Shamshabad Cargo Terminal, Hyderabad',
    consignor_gstin: '36AAAAA0000A1Z5',
    consignee_name: 'Amazon Delivery Station (WAR1)',
    consignee_delivery_address: 'Plot 45, Auto Nagar, Industrial Estate, Warangal',
    consignee_gstin: '36AAAAA0000A1Z5',
    description_of_goods: 'E-commerce FMCG & Consumer Electronics Goods (285 total packages)',
    number_of_packages: 285,
    quantity: 285,
    weight_kg: 6150,
    origin: 'Hyderabad',
    destination: 'Warangal',
    delivery_status: 'Delivered in Full' as const,
    receiver_name: 'Sanjeeva Reddy',
    receiver_designation: 'Station Incharge / Receiving Officer',
    receiver_company_name: 'Amazon Delivery Station (WAR1)',
    receiver_phone: '+91 98490 88776',
    goods_received_confirmed: true,
    receiver_signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 20 45 Q 60 10 100 40 T 180 35" stroke="%231e293b" stroke-width="3" fill="none"/></svg>',
    delivery_date: '2026-08-02',
    delivery_time: '14:30',
    delivery_gps_coordinates: {
      latitude: 17.9689,
      longitude: 79.5941,
      accuracy: 12
    },
    attachments: [
      {
        id: 'att-01',
        name: 'signed_challan_copy_trip101.jpg',
        file_type: 'image/jpeg',
        file_size: 142800,
        data_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%23f8fafc"><text x="20" y="40" font-family="sans-serif" font-weight="bold" fill="%230f172a">SIGNED DELIVERY CHALLAN</text><text x="20" y="80" font-family="sans-serif" fill="%23475569">JBC/26-27/000001 - TRIP-101</text><text x="20" y="120" font-family="sans-serif" fill="%2316a34a">STAMPED &amp; RECEIVED IN FULL</text><text x="20" y="160" font-family="sans-serif" fill="%2364748b">Verified: Sanjeeva Reddy</text></svg>',
        uploaded_at: '2026-08-02T14:35:00Z'
      }
    ],
    status: 'Verified' as const,
    created_by: 'Vinod Kumar Rathod (Driver)',
    created_at: '2026-08-02T14:35:00Z',
    updated_at: '2026-08-02T16:00:00Z'
  }
];

export const initialDocumentSequences = [
  {
    id: 'seq-lr-26-27',
    document_type: 'LR' as const,
    prefix: 'JBC',
    financial_year: '26-27',
    current_number: 2
  },
  {
    id: 'seq-pod-26-27',
    document_type: 'POD' as const,
    prefix: 'JBC/POD',
    financial_year: '26-27',
    current_number: 1
  }
];

export const expenseCategoriesData: ExpenseCategoryItem[] = initialExpenseCategories;
export const expensesData: Expense[] = initialExpenses;
export const routesData: Route[] = initialRoutes;
export const clientsData: ClientProfile[] = initialClients;
export const tripsData: TripLog[] = initialTrips;
export const cashbookData: CashbookTransaction[] = [];
export const fuelLogsData: FuelLog[] = [];
export const billingCyclesData: BillingCycle[] = [];
export const creditCardsData: CreditCard[] = [];
export const inventoryData: InventoryItem[] = [];
export const remindersData: Reminder[] = [];
export const loansData: LoanDetail[] = [];
export const trucksData: Truck[] = initialTrucks;
export const tyresData: TruckTyre[] = initialTruckTyres;
export const employeesData: Employee[] = initialEmployees;
export const lorryReceiptsData = initialLorryReceipts;
export const podRecordsData = initialPodRecords;
export const documentSequencesData = initialDocumentSequences;