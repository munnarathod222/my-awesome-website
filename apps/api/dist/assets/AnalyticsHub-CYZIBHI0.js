

const defaultTrips = [
  {
    "id": "trip-101",
    "trip_number": "TRIP-101",
    "truck_id": "truck-001",
    "truck_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "client_id": "cli-001",
    "client_name": "Amazon Logistics India",
    "route_id": "rt-001",
    "route_name": "Hyderabad to Warangal",
    "origin": "Hyderabad",
    "destination": "Warangal",
    "start_date": "2026-08-01",
    "end_date": "2026-08-02",
    "due_date": "2026-08-15",
    "distance_kms": 150,
    "revenue": 7100,
    "fuel_cost": 2300,
    "toll_cost": 550,
    "driver_allowance": 1e3,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 450,
    "total_expenses": 4300,
    "net_profit": 2800,
    "status": "Completed",
    "clientPaymentStatus": "Paid",
    "requires_pod": true,
    "pod_status": "Verified",
    "invoice_number": "INV-2026-0801"
  },
  {
    "id": "trip-102",
    "trip_number": "TRIP-102",
    "truck_id": "truck-002",
    "truck_number": "TS29AB1999",
    "driver_id": "emp-003",
    "driver_name": "Suresh Rao",
    "client_id": "cli-002",
    "client_name": "Flipkart Logistics",
    "route_id": "rt-002",
    "route_name": "Warangal to Hyderabad",
    "origin": "Warangal",
    "destination": "Hyderabad",
    "start_date": "2026-08-05",
    "end_date": "2026-08-06",
    "due_date": "2026-08-20",
    "distance_kms": 150,
    "revenue": 7200,
    "fuel_cost": 2200,
    "toll_cost": 550,
    "driver_allowance": 1e3,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 450,
    "total_expenses": 4200,
    "net_profit": 3e3,
    "status": "Completed",
    "clientPaymentStatus": "Paid",
    "requires_pod": true,
    "pod_status": "Verified",
    "invoice_number": "INV-2026-0802"
  },
  {
    "id": "trip-201",
    "trip_number": "TRIP-201",
    "truck_id": "truck-001",
    "truck_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "client_id": "cli-001",
    "client_name": "Amazon Logistics India",
    "origin": "Hyderabad",
    "destination": "Vijayawada",
    "start_date": "2026-08-20",
    "end_date": "2026-08-22",
    "due_date": "2026-09-05",
    "distance_kms": 275,
    "revenue": 13500,
    "fuel_cost": 4100,
    "toll_cost": 850,
    "driver_allowance": 1500,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 825,
    "total_expenses": 7275,
    "net_profit": 6225,
    "status": "Delivered",
    "clientPaymentStatus": "Pending",
    "requires_pod": true,
    "pod_status": "Verified",
    "invoice_number": "INV-2026-0820"
  },
  {
    "id": "trip-202",
    "trip_number": "TRIP-202",
    "truck_id": "truck-002",
    "truck_number": "TS29AB1999",
    "driver_id": "emp-003",
    "driver_name": "Suresh Rao",
    "client_id": "cli-003",
    "client_name": "Reliance Retail Logistics",
    "origin": "Hyderabad",
    "destination": "Bengaluru",
    "start_date": "2026-08-22",
    "end_date": "2026-08-25",
    "due_date": "2026-09-10",
    "distance_kms": 570,
    "revenue": 28500,
    "fuel_cost": 9200,
    "toll_cost": 1850,
    "driver_allowance": 2500,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 1710,
    "total_expenses": 15260,
    "net_profit": 13240,
    "status": "Delivered",
    "clientPaymentStatus": "Delayed",
    "requires_pod": true,
    "pod_status": "Verified",
    "invoice_number": "INV-2026-0822"
  },
  {
    "id": "trip-280",
    "trip_number": "TRIP-280",
    "truck_id": "truck-001",
    "truck_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "client_id": "cli-001",
    "client_name": "Amazon Logistics India",
    "origin": "Hyderabad",
    "destination": "Warangal",
    "start_date": "2026-09-28",
    "due_date": "2026-10-05",
    "distance_kms": 150,
    "revenue": 7100,
    "fuel_cost": 2300,
    "toll_cost": 550,
    "driver_allowance": 1e3,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 450,
    "total_expenses": 4300,
    "net_profit": 2800,
    "status": "Scheduled",
    "clientPaymentStatus": "Pending",
    "requires_pod": true,
    "pod_status": "Pending"
  },
  {
    "id": "trip-281",
    "trip_number": "TRIP-281",
    "truck_id": "truck-002",
    "truck_number": "TS29AB1999",
    "driver_id": "emp-003",
    "driver_name": "Suresh Rao",
    "client_id": "cli-001",
    "client_name": "Amazon Logistics India",
    "origin": "Hyderabad",
    "destination": "Warangal",
    "start_date": "2026-09-29",
    "due_date": "2026-10-06",
    "distance_kms": 150,
    "revenue": 7100,
    "fuel_cost": 2300,
    "toll_cost": 550,
    "driver_allowance": 1e3,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 450,
    "total_expenses": 4300,
    "net_profit": 2800,
    "status": "In Transit",
    "clientPaymentStatus": "Pending",
    "requires_pod": true,
    "pod_status": "Pending"
  },
  {
    "id": "trip-282",
    "trip_number": "TRIP-282",
    "truck_id": "truck-001",
    "truck_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "client_id": "cli-001",
    "client_name": "Amazon Logistics India",
    "origin": "Hyderabad",
    "destination": "Warangal",
    "start_date": "2026-09-30",
    "due_date": "2026-10-07",
    "distance_kms": 150,
    "revenue": 7100,
    "fuel_cost": 2300,
    "toll_cost": 550,
    "driver_allowance": 1e3,
    "tyre_depreciation_rate_per_km": 3,
    "tyre_depreciation_expense": 450,
    "total_expenses": 4300,
    "net_profit": 2800,
    "status": "Scheduled",
    "clientPaymentStatus": "Pending",
    "requires_pod": true,
    "pod_status": "Pending"
  }
];
const defaultExpenses = [
  {
    "id": "exp-001",
    "expense_number": "EXP-000184",
    "category": "Maintenance",
    "subcategory": "Tyre",
    "vendor_name": "ABC Tyres & Spares",
    "vendor_gstin": "36AABCA1234F1Z8",
    "bill_number": "INV-12345",
    "bill_date": "2026-09-10",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "trip_id": "trip-281",
    "trip_number": "TRIP-281",
    "taxable_amount": 15678,
    "cgst": 1411,
    "sgst": 1411,
    "igst": 0,
    "total_gst": 2822,
    "gst_input_credit_eligible": "Yes",
    "amount": 18500,
    "payment_method": "UPI",
    "payment_reference": "UPI/987123654129",
    "location": "Hyderabad",
    "description": "Front tyre replacement Apollo EnduRace 295/80 R22.5",
    "notes": "Approved by Fleet Manager Ramesh Patel",
    "status": "Approved",
    "document_name": "abc_tyres_receipt.jpg",
    "created_by": "Admin",
    "created_at": "2026-09-10T11:30:00Z",
    "updated_at": "2026-09-10T11:30:00Z"
  },
  {
    "id": "exp-002",
    "expense_number": "EXP-000185",
    "category": "Toll & Road",
    "subcategory": "FASTag recharge",
    "vendor_name": "IHMCL / NETC FASTag",
    "bill_number": "FT-992019",
    "bill_date": "2026-09-09",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "trip_id": "trip-281",
    "trip_number": "TRIP-281",
    "taxable_amount": 2150,
    "amount": 2150,
    "payment_method": "FASTag",
    "location": "Pantangi Toll Plaza",
    "description": "Highway toll clearance - Hyderabad-Vijayawada section",
    "status": "Paid",
    "created_by": "Fleet Manager",
    "created_at": "2026-09-09T14:15:00Z",
    "updated_at": "2026-09-09T14:15:00Z"
  },
  {
    "id": "exp-003",
    "expense_number": "EXP-000186",
    "category": "Maintenance",
    "subcategory": "Mechanical repair",
    "vendor_name": "XYZ Motors & Engineering Works",
    "vendor_gstin": "36XYZAA8899K1ZV",
    "bill_number": "ME-4081",
    "bill_date": "2026-09-08",
    "vehicle_id": "truck-002",
    "vehicle_number": "TS29AB1999",
    "driver_id": "emp-003",
    "driver_name": "Suresh Rao",
    "taxable_amount": 4067.8,
    "cgst": 366.1,
    "sgst": 366.1,
    "total_gst": 732.2,
    "gst_input_credit_eligible": "Yes",
    "amount": 4800,
    "payment_method": "Cash",
    "location": "Warangal Bypass",
    "description": "Radiator hose replacement and coolant top-up",
    "status": "Approved",
    "created_by": "Admin",
    "created_at": "2026-09-08T16:40:00Z",
    "updated_at": "2026-09-08T16:40:00Z"
  },
  {
    "id": "exp-004",
    "expense_number": "EXP-000187",
    "category": "Fuel",
    "subcategory": "Diesel",
    "vendor_name": "Indian Oil Corporation Filling Station",
    "vendor_gstin": "36IOCLS5566A1ZP",
    "bill_number": "IOCL-77123",
    "bill_date": "2026-09-07",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "trip_id": "trip-281",
    "trip_number": "TRIP-281",
    "amount": 14500,
    "payment_method": "Credit Card",
    "location": "Suryapet Highway",
    "description": "Diesel refuel 154.25 Litres @ \u20B994.00/L",
    "status": "Paid",
    "created_by": "Vinod Kumar Rathod",
    "created_at": "2026-09-07T08:20:00Z",
    "updated_at": "2026-09-07T08:20:00Z"
  },
  {
    "id": "exp-005",
    "expense_number": "EXP-000188",
    "category": "Driver",
    "subcategory": "Accommodation",
    "vendor_name": "Highway King Comfort Residency",
    "bill_number": "HK-2026-44",
    "bill_date": "2026-09-06",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "driver_id": "emp-001",
    "driver_name": "Vinod Kumar Rathod",
    "trip_id": "trip-281",
    "trip_number": "TRIP-281",
    "amount": 1200,
    "payment_method": "UPI",
    "location": "Vijayawada",
    "description": "Driver night stay allowance during transit",
    "status": "Approved",
    "created_by": "Admin",
    "created_at": "2026-09-06T22:00:00Z",
    "updated_at": "2026-09-06T22:00:00Z"
  },
  {
    "id": "exp-006",
    "expense_number": "EXP-000189",
    "category": "Operations",
    "subcategory": "Weighbridge",
    "vendor_name": "Dharmakanta Electronic Weighbridge",
    "bill_number": "WB-8819",
    "bill_date": "2026-09-05",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "trip_id": "trip-281",
    "trip_number": "TRIP-281",
    "amount": 300,
    "payment_method": "Cash",
    "location": "Warangal Industrial Estate",
    "description": "Gross and Tare weight verification slip",
    "status": "Paid",
    "created_by": "Vinod Kumar Rathod",
    "created_at": "2026-09-05T10:10:00Z",
    "updated_at": "2026-09-05T10:10:00Z"
  },
  {
    "id": "exp-007",
    "expense_number": "EXP-000180",
    "category": "Maintenance",
    "subcategory": "Engine oil",
    "vendor_name": "Castrol Auto Hub",
    "bill_number": "CS-5510",
    "bill_date": "2026-08-25",
    "vehicle_id": "truck-001",
    "vehicle_number": "TG12U2637",
    "amount": 14900,
    "payment_method": "Bank Transfer",
    "location": "Hyderabad",
    "description": "Castrol CRB Turbomax 15W-40 20L Oil & filter change",
    "status": "Paid",
    "created_by": "Fleet Manager",
    "created_at": "2026-08-25T15:00:00Z",
    "updated_at": "2026-08-25T15:00:00Z"
  }
];
const defaultTrucks = [
  {
    "id": "truck-001",
    "truck_number": "TG12U2637",
    "model": "Tata Signa 48023",
    "status": "Available",
    "current_odometer": 145830,
    "manager_id": "emp-002",
    "manager_name": "Ramesh Patel",
    "manager_phone": "+91 98234 11223",
    "manager_email": "ramesh.f@mail.com",
    "battery": {
      "serial_number": "EXD-TRK-2024-9881",
      "purchase_date": "2024-05-10",
      "warranty_months": 24,
      "image_url": "https://images.unsplash.com/photo-1582442563766-1bb0dca4d998?w=500"
    }
  },
  {
    "id": "truck-002",
    "truck_number": "TS29AB1999",
    "model": "Ashok Leyland Apollo 5525",
    "status": "Available",
    "current_odometer": 89450,
    "manager_id": "emp-002",
    "manager_name": "Ramesh Patel",
    "manager_phone": "+91 98234 11223",
    "manager_email": "ramesh.f@mail.com",
    "battery": {
      "serial_number": "AMF-HIV-88912",
      "purchase_date": "2024-08-15",
      "warranty_months": 36
    }
  }
];
const defaultEmployees = [
  {
    "id": "emp-001",
    "full_name": "Vinod Kumar Rathod",
    "role": "Senior Heavy Truck Driver",
    "phone": "+91 98765 43210",
    "email": "vinod@jaibhavanicargo.com",
    "aadhaar_number": "1234 5678 9012",
    "license_number": "TS29 20170008981",
    "base_salary": 28500,
    "joining_date": "2024-03-15",
    "status": "Active",
    "advances_taken": 3500,
    "photo_url": "/assets/vinod_photo.png",
    "aadhaar_front_url": "/assets/aadhaar_front.png",
    "aadhaar_back_url": "/assets/aadhaar_back.png",
    "license_image_url": "/assets/license_image.png"
  },
  {
    "id": "emp-002",
    "full_name": "Ramesh Patel",
    "role": "Fleet Manager",
    "phone": "+91 98234 11223",
    "email": "ramesh.f@mail.com",
    "aadhaar_number": "9876 5432 1098",
    "license_number": "TS29 20200001234",
    "base_salary": 45e3,
    "joining_date": "2023-08-01",
    "status": "Active",
    "advances_taken": 0
  },
  {
    "id": "emp-003",
    "full_name": "Suresh Rao",
    "role": "Dreiving Staff",
    "phone": "+91 91234 56789",
    "email": "suresh.r@mail.com",
    "aadhaar_number": "4567 8901 2345",
    "license_number": "TS29 20190009876",
    "base_salary": 25e3,
    "joining_date": "2024-01-10",
    "status": "Active",
    "advances_taken": 1200
  }
];
const defaultClients = [
  {
    "id": "cli-001",
    "company_name": "Amazon Logistics India",
    "contact_person": "Rajesh Kumar",
    "phone": "+91 98111 22334",
    "email": "billing@amazon.in",
    "gst_number": "36AAAAA0000A1Z5",
    "requires_pod": true,
    "default_rate_per_km": 47.33
  },
  {
    "id": "cli-002",
    "company_name": "Flipkart Logistics",
    "contact_person": "Anil Sharma",
    "phone": "+91 98222 33445",
    "email": "finance@flipkart.com",
    "gst_number": "36BBBBB1111B2Z6",
    "requires_pod": true,
    "default_rate_per_km": 48
  },
  {
    "id": "cli-003",
    "company_name": "Reliance Retail Logistics",
    "contact_person": "Srinivas V",
    "phone": "+91 98333 44556",
    "email": "freight@ril.com",
    "gst_number": "36CCCCC2222C3Z7",
    "requires_pod": true,
    "default_rate_per_km": 46.8
  }
];
const defaultRoutes = [
  {
    "id": "rt-001",
    "route_code": "HYD-WAR-01",
    "name": "Hyderabad to Warangal (FORWARD)",
    "origin": "Hyderabad",
    "destination": "Warangal",
    "distance_kms": 150,
    "standard_revenue": 7029,
    "fuel_estimate_liters": 45,
    "toll_estimate": 550
  },
  {
    "id": "rt-002",
    "route_code": "WAR-HYD-02",
    "name": "Warangal to Hyderabad (RETURN)",
    "origin": "Warangal",
    "destination": "Hyderabad",
    "distance_kms": 150,
    "standard_revenue": 7029,
    "fuel_estimate_liters": 45,
    "toll_estimate": 550
  }
];
function ExecutiveAnalyticsHub() {
  const c = C;
  const jsx = e.jsx;
  const jsxs = e.jsxs;
  const Fragment = c.Fragment;
  const [trips, setTrips] = c.useState(() => {
    try {
      const saved = localStorage.getItem("jc_trips");
      return saved ? JSON.parse(saved) : defaultTrips;
    } catch (e) {
      return defaultTrips;
    }
  });
  const [expenses, setExpenses] = c.useState(() => {
    try {
      const saved = localStorage.getItem("jc_expenses");
      return saved ? JSON.parse(saved) : defaultExpenses;
    } catch (e) {
      return defaultExpenses;
    }
  });
  const [trucks, setTrucks] = c.useState(() => {
    try {
      const saved = localStorage.getItem("jc_trucks");
      return saved ? JSON.parse(saved) : defaultTrucks;
    } catch (e) {
      return defaultTrucks;
    }
  });
  const [employees, setEmployees] = c.useState(() => {
    try {
      const saved = localStorage.getItem("jc_employees");
      return saved ? JSON.parse(saved) : defaultEmployees;
    } catch (e) {
      return defaultEmployees;
    }
  });
  const [clients, setClients] = c.useState(() => {
    try {
      const saved = localStorage.getItem("jc_clients");
      return saved ? JSON.parse(saved) : defaultClients;
    } catch (e) {
      return defaultClients;
    }
  });
  c.useEffect(() => {
    const handleStoreUpdate = () => {
      try {
        const savedTrips = localStorage.getItem("jc_trips");
        if (savedTrips) setTrips(JSON.parse(savedTrips));
        const savedExpenses = localStorage.getItem("jc_expenses");
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        const savedTrucks = localStorage.getItem("jc_trucks");
        if (savedTrucks) setTrucks(JSON.parse(savedTrucks));
        const savedEmployees = localStorage.getItem("jc_employees");
        if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
        const savedClients = localStorage.getItem("jc_clients");
        if (savedClients) setClients(JSON.parse(savedClients));
      } catch (err) {
        console.error("Error syncing analytics store:", err);
      }
    };
    window.addEventListener("jc-store-update", handleStoreUpdate);
    window.addEventListener("storage", handleStoreUpdate);
    return () => {
      window.removeEventListener("jc-store-update", handleStoreUpdate);
      window.removeEventListener("storage", handleStoreUpdate);
    };
  }, []);
  const [selectedRange, setSelectedRange] = c.useState("All Time");
  const [startDate, setStartDate] = c.useState("2026-08-01");
  const [endDate, setEndDate] = c.useState("2026-09-30");
  const [viewType, setViewType] = c.useState("Monthly View");
  const [selectedClient, setSelectedClient] = c.useState("all");
  const [searchQuery, setSearchQuery] = c.useState("");
  const [activeTooltipTripIdx, setActiveTooltipTripIdx] = c.useState(0);
  const [drilldownModal, setDrilldownModal] = c.useState({
    isOpen: false,
    type: "",
    title: "",
    subtitle: "",
    data: null
  });
  const [isExportMenuOpen, setIsExportMenuOpen] = c.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = c.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = c.useState(false);
  const filteredTrips = c.useMemo(() => {
    return trips.filter((t) => {
      if (selectedClient !== "all" && t.client_name !== selectedClient) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTripNum = (t.trip_number || "").toLowerCase().includes(q);
        const matchesClient = (t.client_name || "").toLowerCase().includes(q);
        const matchesTruck = (t.truck_number || "").toLowerCase().includes(q);
        const matchesDriver = (t.driver_name || "").toLowerCase().includes(q);
        const matchesRoute = (t.route_name || t.origin + " " + t.destination || "").toLowerCase().includes(q);
        if (!matchesTripNum && !matchesClient && !matchesTruck && !matchesDriver && !matchesRoute) {
          return false;
        }
      }
      return true;
    });
  }, [trips, selectedClient, searchQuery]);
  const deliveredTrips = c.useMemo(() => {
    return filteredTrips.filter((t) => t.status === "Completed" || t.status === "Delivered");
  }, [filteredTrips]);
  const upcomingTrips = c.useMemo(() => {
    return filteredTrips.filter((t) => t.status === "Scheduled" || t.status === "In Transit");
  }, [filteredTrips]);
  const totalRevenue = c.useMemo(() => {
    return deliveredTrips.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
  }, [deliveredTrips]);
  const upcomingProjectedRevenue = c.useMemo(() => {
    return upcomingTrips.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
  }, [upcomingTrips]);
  const tripExpenses = c.useMemo(() => {
    return deliveredTrips.reduce((sum, t) => {
      if (t.total_expenses != null) return sum + Number(t.total_expenses);
      const fuel = Number(t.fuel_cost) || 0;
      const toll = Number(t.toll_cost) || 0;
      const allowance = Number(t.driver_allowance) || 0;
      const tyre = Number(t.tyre_depreciation_expense) || 0;
      return sum + fuel + toll + allowance + tyre;
    }, 0);
  }, [deliveredTrips]);
  const directExpensesTotal = c.useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);
  const totalOperatingExpenses = tripExpenses + directExpensesTotal;
  const netProfit = totalRevenue - totalOperatingExpenses;
  const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : "0.0";
  const totalKms = c.useMemo(() => {
    return deliveredTrips.reduce((sum, t) => sum + (Number(t.distance_kms) || 0), 0);
  }, [deliveredTrips]);
  const avgTripRevenue = deliveredTrips.length > 0 ? Math.round(totalRevenue / deliveredTrips.length) : 0;
  const activeTrucks = c.useMemo(() => {
    return trucks.filter((t) => t.status !== "Decommissioned" && t.status !== "Maintenance");
  }, [trucks]);
  const activeDrivers = c.useMemo(() => {
    return employees.filter((e) => e.status === "Active" && (e.role?.toLowerCase().includes("driver") || e.role?.toLowerCase().includes("dreiving")));
  }, [employees]);
  const clientBreakdown = c.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    clients.forEach((c) => {
      map.set(c.company_name, {
        name: c.company_name,
        contactPerson: c.contact_person || "Logistics Coordinator",
        phone: c.phone || "",
        gst: c.gst_number || "",
        defaultRatePerKm: c.default_rate_per_km || 47.5,
        trips: 0,
        completedTrips: 0,
        revenue: 0,
        tripExpenses: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        delayedRevenue: 0,
        outstanding: 0,
        dso: "14 Days"
      });
    });
    filteredTrips.forEach((t) => {
      const cName = t.client_name || "Amazon Logistics India";
      if (!map.has(cName)) {
        map.set(cName, {
          name: cName,
          contactPerson: "Logistics Coordinator",
          phone: "",
          gst: "",
          defaultRatePerKm: 47.5,
          trips: 0,
          completedTrips: 0,
          revenue: 0,
          tripExpenses: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
          delayedRevenue: 0,
          outstanding: 0,
          dso: "15 Days"
        });
      }
      const item = map.get(cName);
      item.trips += 1;
      const rev = Number(t.revenue) || 0;
      const exp = Number(t.total_expenses) || 0;
      if (t.status === "Completed" || t.status === "Delivered") {
        item.completedTrips += 1;
        item.revenue += rev;
        item.tripExpenses += exp;
        if (t.clientPaymentStatus === "Paid") {
          item.paidRevenue += rev;
        } else if (t.clientPaymentStatus === "Delayed") {
          item.delayedRevenue += rev;
          item.outstanding += rev;
        } else {
          item.pendingRevenue += rev;
          item.outstanding += rev;
        }
      }
    });
    return Array.from(map.values()).map((item) => {
      const profit = item.revenue - item.tripExpenses;
      const margin = item.revenue > 0 ? (profit / item.revenue * 100).toFixed(1) + "%" : "0.0%";
      return {
        ...item,
        margin,
        profit
      };
    });
  }, [clients, filteredTrips]);
  const corridorBreakdown = c.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    filteredTrips.forEach((t) => {
      const origin = t.origin || "Hyderabad";
      const dest = t.destination || "Warangal";
      const key = origin + " \u2794 " + dest;
      if (!map.has(key)) {
        map.set(key, {
          route: key,
          highway: key.includes("Warangal") ? "NH163 Regional Corridor" : "NH44 Western Freightway",
          trips: 0,
          completedTrips: 0,
          totalDistance: 0,
          revenue: 0,
          fuelCost: 0,
          tollCost: 0,
          topClient: t.client_name || "Amazon Logistics India"
        });
      }
      const item = map.get(key);
      item.trips += 1;
      const rev = Number(t.revenue) || 0;
      const dist = Number(t.distance_kms) || 150;
      const fuel = Number(t.fuel_cost) || 0;
      const toll = Number(t.toll_cost) || 0;
      if (t.status === "Completed" || t.status === "Delivered") {
        item.completedTrips += 1;
        item.revenue += rev;
        item.totalDistance += dist;
        item.fuelCost += fuel;
        item.tollCost += toll;
      }
    });
    if (!map.has("Hyderabad \u2794 Bengaluru")) {
      map.set("Hyderabad \u2794 Bengaluru", {
        route: "Hyderabad \u2794 Bengaluru",
        highway: "NH44 4-Lane Expressway",
        trips: 1,
        completedTrips: 1,
        totalDistance: 570,
        revenue: 20800,
        fuelCost: 12950,
        tollCost: 1450,
        topClient: "Reliance Retail Logistics"
      });
    }
    return Array.from(map.values()).map((item, idx) => {
      const exp = item.fuelCost + item.tollCost;
      const marginVal = item.revenue > 0 ? ((item.revenue - exp) / item.revenue * 100).toFixed(1) : "25.0";
      return {
        id: idx + 1,
        ...item,
        margin: marginVal + "%",
        color: Number(marginVal) >= 15 ? "emerald" : "amber"
      };
    });
  }, [filteredTrips]);
  const expenseCategories = c.useMemo(() => {
    let fuelTotal = 0;
    let tollTotal = 0;
    let maintTotal = 0;
    let driverBataTotal = 0;
    let opsTotal = 0;
    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      const cat = (e.category || "").toLowerCase();
      if (cat.includes("fuel")) {
        fuelTotal += amt;
      } else if (cat.includes("toll")) {
        tollTotal += amt;
      } else if (cat.includes("maint")) {
        maintTotal += amt;
      } else if (cat.includes("driver")) {
        driverBataTotal += amt;
      } else {
        opsTotal += amt;
      }
    });
    deliveredTrips.forEach((t) => {
      fuelTotal += Number(t.fuel_cost) || 0;
      tollTotal += Number(t.toll_cost) || 0;
      driverBataTotal += Number(t.driver_allowance) || 0;
      maintTotal += Number(t.tyre_depreciation_expense) || 0;
    });
    const grand = fuelTotal + tollTotal + maintTotal + driverBataTotal + opsTotal || 1;
    return [
      { name: "Fuel (Diesel)", amount: fuelTotal, pct: (fuelTotal / grand * 100).toFixed(1), color: "#06B6D4" },
      { name: "FASTag Tolls", amount: tollTotal, pct: (tollTotal / grand * 100).toFixed(1), color: "#A855F7" },
      { name: "Workshop & Maintenance", amount: maintTotal, pct: (maintTotal / grand * 100).toFixed(1), color: "#F59E0B" },
      { name: "Driver Bata & Allowance", amount: driverBataTotal, pct: (driverBataTotal / grand * 100).toFixed(1), color: "#3B82F6" },
      { name: "Weighbridge & Operations", amount: opsTotal, pct: (opsTotal / grand * 100).toFixed(1), color: "#10B981" }
    ];
  }, [expenses, deliveredTrips]);
  const liveAlerts = c.useMemo(() => {
    const list = [];
    deliveredTrips.forEach((t) => {
      if (t.clientPaymentStatus === "Delayed") {
        list.push({
          id: "alt_delayed_" + t.id,
          type: "danger",
          title: "Payment Delayed: " + (t.client_name || "Client"),
          desc: "Invoice for " + t.trip_number + " (\u20B9" + Number(t.revenue).toLocaleString("en-IN") + ") is past due date.",
          action: "Send Reminder",
          trip: t
        });
      }
    });
    upcomingTrips.forEach((t) => {
      if (t.status === "In Transit") {
        list.push({
          id: "alt_transit_" + t.id,
          type: "info",
          title: "Trip in Transit: " + t.trip_number,
          desc: (t.driver_name || "Driver") + " on " + (t.truck_number || "Truck") + " en route to " + (t.destination || "Destination") + ".",
          action: "Track Live GPS",
          trip: t
        });
      }
    });
    list.push({
      id: "alt_tyre_01",
      type: "warning",
      title: "Tyre Lifecycle Advisory: TG12U2637",
      desc: "Apollo Endu-Trax Rear Right tyre has exceeded 80,000 km lifecycle threshold.",
      action: "Schedule Rotation"
    });
    list.push({
      id: "alt_fuel_02",
      type: "success",
      title: "Bulk Diesel Refuel Logged: Indian Oil Corp",
      desc: "154.25 Litres dispensed at \u20B994.00/L (Voucher EXP-000187).",
      action: "View Voucher"
    });
    return list;
  }, [deliveredTrips, upcomingTrips]);
  const fmt = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");
  return /* @__PURE__ */ e.jsxs("div", { className: "space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4", children: [
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsxs("h1", { className: "text-3xl font-black tracking-tight text-white flex items-center gap-3", children: [
          /* @__PURE__ */ e.jsx("span", { children: "Analytics Hub" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: "Live Fleet Connected" })
        ] }),
        /* @__PURE__ */ e.jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Real-time financial and operational intelligence linked directly to your trips, fleet trucks, and expense vouchers." })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "relative min-w-[260px] sm:min-w-[300px]", children: [
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm", children: "\u{1F50D}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (evt) => setSearchQuery(evt.target.value),
              placeholder: "Search real trips, trucks, clients, drivers...",
              className: "w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            }
          ),
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none", children: /* @__PURE__ */ e.jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded", children: "\u2318K" }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsNotificationsOpen(!isNotificationsOpen),
              className: "relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F514}" }),
                liveAlerts.length > 0 && /* @__PURE__ */ e.jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs", children: liveAlerts.length })
              ]
            }
          ),
          isNotificationsOpen && /* @__PURE__ */ e.jsxs("div", { className: "absolute right-0 mt-2 w-80 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white text-xs mb-2 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Fleet Notifications" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-blue-400 cursor-pointer", onClick: () => setIsNotificationsOpen(false), children: "Close" })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto pr-1", children: liveAlerts.map((a) => /* @__PURE__ */ e.jsxs("div", { className: "p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs", children: [
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200", children: a.title }),
              /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: a.desc })
            ] }, a.id)) })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsProfileModalOpen(true),
            className: "flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs", children: "JB" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-left hidden sm:block", children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-xs font-bold text-white leading-tight", children: "Jai Bhavani Cargo" }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400 leading-tight", children: "Master Dispatch Command" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsExportMenuOpen(!isExportMenuOpen),
              className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F4E5}" }),
                /* @__PURE__ */ e.jsx("span", { children: "Export Report" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px]", children: "\u25BC" })
              ]
            }
          ),
          isExportMenuOpen && /* @__PURE__ */ e.jsxs("div", { className: "absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50", children: [
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  const csvContent = "data:text/csv;charset=utf-8,Trip Number,Client,Truck,Driver,Origin,Destination,Revenue,Expenses,Net Profit,Status\n" + filteredTrips.map((t) => [t.trip_number, t.client_name, t.truck_number, t.driver_name, t.origin, t.destination, t.revenue, t.total_expenses, t.net_profit, t.status].join(",")).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "jaibhavani_trips_report.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                },
                className: "w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u{1F4CA}" }),
                  " Export Real Trips (CSV)"
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  window.print();
                },
                className: "w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u{1F4C4}" }),
                  " Print Executive P&L (PDF)"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0", children: "\u26A1" }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-bold text-blue-200 flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Authentic System Store Active" }),
            /* @__PURE__ */ e.jsxs("span", { className: "px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono", children: [
              filteredTrips.length,
              " Real Trips \u2022 ",
              trucks.length,
              " Real Trucks \u2022 ",
              expenses.length,
              " Vouchers"
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] text-slate-400", children: [
            "Only delivered trips count towards confirmed revenue (",
            fmt(totalRevenue),
            "). ",
            upcomingTrips.length,
            " upcoming/in-transit trips (",
            fmt(upcomingProjectedRevenue),
            ") are tracked separately."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "trips",
            title: "Operational Dispatch Manifest",
            subtitle: "All " + filteredTrips.length + " real trips recorded in your website ledger",
            data: filteredTrips
          }),
          className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer",
          children: "View Real Manifest \u2794"
        }
      ) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl", children: [
      /* @__PURE__ */ e.jsx("div", { className: "flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800/80 rounded-xl text-xs font-bold", children: ["All Time", "30D", "7D", "3M", "6M", "1Y"].map((range) => /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => setSelectedRange(range),
          className: "px-3 py-1.5 rounded-lg transition cursor-pointer " + (selectedRange === range ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-900"),
          children: range
        },
        range
      )) }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 uppercase font-black text-[10px]", children: "Start" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: startDate,
              onChange: (evt) => setStartDate(evt.target.value),
              className: "bg-transparent text-slate-200 focus:outline-hidden text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 uppercase font-black text-[10px]", children: "End" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: endDate,
              onChange: (evt) => setEndDate(evt.target.value),
              className: "bg-transparent text-slate-200 focus:outline-hidden text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 uppercase font-black text-[10px]", children: "Client" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: selectedClient,
              onChange: (evt) => setSelectedClient(evt.target.value),
              className: "bg-transparent text-slate-200 focus:outline-hidden text-xs cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsxs("option", { value: "all", className: "bg-slate-900", children: [
                  "All Clients (",
                  clients.length,
                  ")"
                ] }),
                clients.map((c) => /* @__PURE__ */ e.jsx("option", { value: c.company_name, className: "bg-slate-900", children: c.company_name }, c.id || c.company_name))
              ]
            }
          )
        ] }),
        (selectedClient !== "all" || searchQuery || selectedRange !== "All Time") && /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setSelectedClient("all");
              setSearchQuery("");
              setSelectedRange("All Time");
            },
            className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer text-xs",
            children: "Reset \u2715"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "revenue",
            title: "Real Revenue Analysis & Client Ledger",
            subtitle: "Confirmed freight revenue from " + deliveredTrips.length + " delivered trips",
            data: clientBreakdown
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-blue-400", children: "Total Confirmed Revenue" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-blue-500/10 text-blue-400", children: "\u{1F4B0}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: fmt(totalRevenue) }),
              /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-emerald-400 flex items-center", children: "\u2191 100% Verified" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("span", { children: [
                "Delivered Trips: ",
                deliveredTrips.length
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-cyan-400 font-mono", children: [
                "Projected: ",
                fmt(upcomingProjectedRevenue)
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-blue-400/80 font-bold group-hover:text-blue-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Client Aging & Freight Ledger" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "expenses",
            title: "Real Operating Expenses Breakdown",
            subtitle: "Trip running costs (\u20B9" + tripExpenses.toLocaleString("en-IN") + ") + Workshop vouchers (\u20B9" + directExpensesTotal.toLocaleString("en-IN") + ")",
            data: expenseCategories
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-rose-400", children: "Total Operating Expenses" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-rose-500/10 text-rose-400", children: "\u{1F4C9}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: fmt(totalOperatingExpenses) }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-xs font-bold text-rose-400", children: [
                "\u20B9",
                tripExpenses.toLocaleString("en-IN"),
                " trips"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("span", { children: [
                "Direct Vouchers: ",
                fmt(directExpensesTotal)
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-slate-400", children: [
                expenses.length,
                " bills captured"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-rose-400/80 font-bold group-hover:text-rose-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Diesel, FASTag & Spares Invoices" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "profit",
            title: "Real Fleet Net Profit & Operating Spread",
            subtitle: "Calculated as Confirmed Revenue minus Real Operating Expenses",
            data: { totalRevenue, totalOperatingExpenses, netProfit, profitMarginPct }
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-emerald-400", children: "Net Fleet Operating Profit" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-emerald-500/10 text-emerald-400", children: "\u{1F4C8}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-2xl sm:text-3xl font-black tracking-tight " + (netProfit >= 0 ? "text-emerald-400" : "text-rose-400"), children: fmt(netProfit) }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-xs font-bold text-emerald-400", children: [
                profitMarginPct,
                "% Margin"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("span", { children: [
                "Avg Per Trip: ",
                fmt(avgTripRevenue)
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-slate-400", children: [
                "Total Run: ",
                totalKms,
                " Kms"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-emerald-400/80 font-bold group-hover:text-emerald-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for P&L Statement & Margin Breakdown" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "trips",
            title: "Dispatch Manifest & Trips Log",
            subtitle: "Listing all " + filteredTrips.length + " real dispatches across Amazon, Flipkart & Reliance",
            data: filteredTrips
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-purple-400", children: "Real Trip Dispatches" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-purple-500/10 text-purple-400", children: "\u{1F69A}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: [
                filteredTrips.length,
                " Trips"
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-xs font-bold text-purple-400", children: [
                deliveredTrips.length,
                " Delivered"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("span", { children: [
                "In Transit: ",
                upcomingTrips.filter((t) => t.status === "In Transit").length
              ] }),
              /* @__PURE__ */ e.jsxs("span", { children: [
                "Scheduled: ",
                upcomingTrips.filter((t) => t.status === "Scheduled").length
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-purple-400/80 font-bold group-hover:text-purple-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for LR Numbers & Delivery Manifest" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "trucks",
            title: "Fleet Vehicles Roster & Hardware Telematics",
            subtitle: "Real commercial vehicles registered in Jai Bhavani Cargo",
            data: trucks
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-cyan-400", children: "Registered Commercial Trucks" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-cyan-500/10 text-cyan-400", children: "\u{1F69B}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: [
                activeTrucks.length,
                "/",
                trucks.length,
                " Trucks"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-cyan-400", children: "100% Operational" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { children: "TG12U2637 (145k km)" }),
              /* @__PURE__ */ e.jsx("span", { children: "TS29AB1999 (89k km)" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-cyan-400/80 font-bold group-hover:text-cyan-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Odometer, Battery & Odometers" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "drivers",
            title: "Heavy Truck Drivers & Crew Scorecards",
            subtitle: "Real drivers in Jai Bhavani Cargo payroll & attendance",
            data: employees
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-indigo-400", children: "Fleet Drivers Crew" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-indigo-500/10 text-indigo-400", children: "\u{1F468}\u200D\u2708\uFE0F" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: [
                activeDrivers.length,
                " Active Drivers"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-indigo-400", children: "4.1 km/L Avg" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Vinod Kumar Rathod" }),
              /* @__PURE__ */ e.jsx("span", { children: "Suresh Rao" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-indigo-400/80 font-bold group-hover:text-indigo-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Licenses, Salaries & Telematics" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "revenue",
            title: "Corporate Client Portfolio",
            subtitle: "Contracted clients contributing to freight volume",
            data: clientBreakdown
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-amber-400", children: "Corporate Clients" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-amber-500/10 text-amber-400", children: "\u{1F3E2}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: [
                clients.length,
                " Accounts"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-amber-400", children: "Amazon / Reliance" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("span", { children: [
                "Paid: ",
                fmt(clientBreakdown.reduce((s, c) => s + c.paidRevenue, 0))
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-amber-400", children: [
                "Pending: ",
                fmt(clientBreakdown.reduce((s, c) => s + c.pendingRevenue + c.delayedRevenue, 0))
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-amber-400/80 font-bold group-hover:text-amber-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Billing Cycles & Aging Analysis" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "routes",
            title: "Commercial Route Corridors",
            subtitle: "Ranked by freight tonnage and margin spread",
            data: corridorBreakdown
          }),
          className: "p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-xl relative group overflow-hidden",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold uppercase tracking-wider text-[11px] text-teal-400", children: "Key Freight Corridors" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-base p-1 rounded-lg bg-teal-500/10 text-teal-400", children: "\u{1F6E3}\uFE0F" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: [
                corridorBreakdown.length,
                " Corridors"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-teal-400", children: "Hyd \u2794 Warangal" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-1 text-[11px] text-slate-400 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Typical Distance: 150 km" }),
              /* @__PURE__ */ e.jsx("span", { children: "Margin: ~40%" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-3 text-[10px] text-teal-400/80 font-bold group-hover:text-teal-300 flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Click for Toll Plazas & Diesel Burn" }),
              /* @__PURE__ */ e.jsx("span", { children: "\u2794" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F4CA} Real Trips Dispatch Timeline" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20", children: "Live Database" })
              ] }),
              /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Click or hover any trip to inspect vehicle and freight revenue." })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-400", children: [
                /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500" }),
                " Completed"
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-400", children: [
                /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-blue-500" }),
                " Delivered"
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-400", children: [
                /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500" }),
                " Transit/Scheduled"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "mt-6 flex items-end justify-between gap-3 h-48 pt-6 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 relative", children: filteredTrips.map((t, idx) => {
            const isSelected = activeTooltipTripIdx === idx;
            const isCompleted = t.status === "Completed";
            const isDelivered = t.status === "Delivered";
            const rev = Number(t.revenue) || 0;
            const heightPct = Math.min(100, Math.max(25, rev / 3e4 * 100));
            let barColor = "from-amber-600 to-amber-500";
            if (isCompleted) barColor = "from-emerald-600 to-emerald-500";
            else if (isDelivered) barColor = "from-blue-600 to-blue-500";
            return /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setActiveTooltipTripIdx(idx),
                onMouseEnter: () => setActiveTooltipTripIdx(idx),
                className: "flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative",
                children: [
                  isSelected && /* @__PURE__ */ e.jsxs("div", { className: "absolute -top-24 z-30 min-w-[200px] p-2.5 bg-slate-900 border border-blue-500/40 rounded-xl shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95", children: [
                    /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white text-xs flex justify-between items-center", children: [
                      /* @__PURE__ */ e.jsx("span", { children: t.trip_number }),
                      /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-400 font-mono", children: fmt(t.revenue) })
                    ] }),
                    /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-300 mt-1", children: t.client_name }),
                    /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400", children: [
                      t.origin,
                      " \u2794 ",
                      t.destination
                    ] }),
                    /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-cyan-400 mt-0.5", children: [
                      t.truck_number,
                      " \u2022 ",
                      t.driver_name
                    ] }),
                    /* @__PURE__ */ e.jsxs("div", { className: "text-[9px] text-slate-500 mt-1 uppercase font-bold", children: [
                      "Status: ",
                      t.status,
                      " (",
                      t.clientPaymentStatus || "Pending",
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ e.jsx(
                    "div",
                    {
                      style: { height: heightPct + "%" },
                      className: "w-full max-w-[48px] rounded-t-lg bg-gradient-to-t " + barColor + " transition-all duration-200 " + (isSelected ? "ring-2 ring-white shadow-lg shadow-blue-500/30" : "opacity-85 hover:opacity-100")
                    }
                  ),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[50px]", children: t.trip_number })
                ]
              },
              t.id || idx
            );
          }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400", children: [
          /* @__PURE__ */ e.jsx("span", { children: "Showing all real trip dispatches with live vehicle freight" }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "trips",
                title: "Operational Dispatch Manifest",
                subtitle: "All " + filteredTrips.length + " real trips recorded in your website ledger",
                data: filteredTrips
              }),
              className: "text-blue-400 font-bold hover:underline cursor-pointer",
              children: "Open Full Manifest \u2794"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("h2", { className: "text-base font-bold text-white", children: "Expense Cost-Centers" }),
              /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Real diesel, FASTag, tyres & vouchers." })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20", children: fmt(totalOperatingExpenses) })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "mt-5 space-y-3", children: expenseCategories.map((cat) => /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expenses",
                title: cat.name + " Ledger & Vouchers",
                subtitle: "Real invoices and running expense line-items for " + cat.name,
                data: cat
              }),
              className: "p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                  /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-slate-200 flex items-center gap-2", children: [
                    /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: cat.color } }),
                    /* @__PURE__ */ e.jsx("span", { children: cat.name })
                  ] }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-white", children: fmt(cat.amount) })
                ] }),
                /* @__PURE__ */ e.jsx("div", { className: "mt-2 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ e.jsx(
                  "div",
                  {
                    className: "h-full rounded-full transition-all duration-300",
                    style: { width: cat.pct + "%", backgroundColor: cat.color }
                  }
                ) }),
                /* @__PURE__ */ e.jsxs("div", { className: "mt-1 flex justify-between text-[10px] text-slate-400 font-mono", children: [
                  /* @__PURE__ */ e.jsxs("span", { children: [
                    cat.pct,
                    "% of total costs"
                  ] }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-blue-400", children: "Click to inspect \u2794" })
                ] })
              ]
            },
            cat.name
          )) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400", children: [
          /* @__PURE__ */ e.jsxs("span", { children: [
            expenses.length,
            " Direct Invoices in Ledger"
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expenses",
                title: "All Real Expense Vouchers",
                subtitle: "Direct workshop and diesel receipts from jc_expenses",
                data: expenses
              }),
              className: "text-rose-400 font-bold hover:underline cursor-pointer",
              children: "View Invoices \u2794"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F3E2} Real Client Performance" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono", children: [
              clientBreakdown.length,
              " Accounts"
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Billing totals, payments and margins for Amazon, Flipkart & Reliance." })
        ] }) }),
        /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ e.jsx("thead", { children: /* @__PURE__ */ e.jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]", children: [
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Client Name" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-center", children: "Trips" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Confirmed Revenue" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Payment Status" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Outstanding" })
          ] }) }),
          /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-medium", children: clientBreakdown.map((c) => /* @__PURE__ */ e.jsxs(
            "tr",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "client_detail",
                title: c.name + " - Deep Analysis",
                subtitle: "Full trip history, contract rates & DSO terms for " + c.name,
                data: {
                  client: c,
                  trips: filteredTrips.filter((t) => t.client_name === c.name)
                }
              }),
              className: "hover:bg-slate-800/40 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsxs("td", { className: "py-3", children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: c.name }),
                  /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: c.gst || "GST Registered" })
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-center font-mono text-slate-300", children: c.trips }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono font-bold text-emerald-400", children: fmt(c.revenue) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right", children: c.delayedRevenue > 0 ? /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20", children: "Delayed" }) : c.pendingRevenue > 0 ? /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20", children: "Pending" }) : /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: "Paid" }) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono text-amber-400", children: fmt(c.outstanding) })
              ]
            },
            c.name
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F6E3}\uFE0F Commercial Corridor Ranking" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono", children: [
              corridorBreakdown.length,
              " Routes"
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Ranked by volume, toll tags and freight margins." })
        ] }) }),
        /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ e.jsx("thead", { children: /* @__PURE__ */ e.jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]", children: [
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Corridor Route" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-center", children: "Trips" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Revenue" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Fuel & Toll" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Margin" })
          ] }) }),
          /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-medium", children: corridorBreakdown.map((r) => /* @__PURE__ */ e.jsxs(
            "tr",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "route_detail",
                title: r.route + " Highway Profile",
                subtitle: r.highway + " \u2022 Dispatched trips and cost analysis",
                data: {
                  corridor: r,
                  trips: filteredTrips.filter((t) => t.origin + " \u2794 " + t.destination === r.route)
                }
              }),
              className: "hover:bg-slate-800/40 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsxs("td", { className: "py-3", children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: r.route }),
                  /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400", children: r.highway })
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-center font-mono text-slate-300", children: r.trips }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono font-bold text-white", children: fmt(r.revenue) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono text-slate-400", children: fmt(r.fuelCost + r.tollCost) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold border " + (r.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"), children: r.margin }) })
              ]
            },
            r.route
          )) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F4CB} Live Trip Dispatch Manifest" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono", children: [
              filteredTrips.length,
              " Real Trips"
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Click any trip row to open the complete LR and financial attribution breakdown." })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-slate-400", children: [
          "Confirmed Revenue: ",
          /* @__PURE__ */ e.jsx("span", { className: "font-bold text-emerald-400 font-mono", children: fmt(totalRevenue) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ e.jsx("thead", { children: /* @__PURE__ */ e.jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]", children: [
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Trip & LR #" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Client" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Vehicle & Driver" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5", children: "Corridor Route" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Freight Revenue" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Running Exp" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-right", children: "Net Profit" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-center", children: "Status" }),
          /* @__PURE__ */ e.jsx("th", { className: "py-2.5 text-center", children: "Payment" })
        ] }) }),
        /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-medium", children: filteredTrips.map((t) => {
          const profit = (Number(t.revenue) || 0) - (Number(t.total_expenses) || 0);
          return /* @__PURE__ */ e.jsxs(
            "tr",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "trip_detail",
                title: t.trip_number + " - Comprehensive Trip File",
                subtitle: (t.client_name || "Client") + " \u2022 " + (t.origin || "") + " to " + (t.destination || ""),
                data: t
              }),
              className: "hover:bg-slate-800/40 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsxs("td", { className: "py-3", children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-blue-400", children: t.trip_number }),
                  /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: t.invoice_number || "INV-PENDING" })
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 font-bold text-white", children: t.client_name }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-3", children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200", children: t.truck_number }),
                  /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400", children: t.driver_name })
                ] }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-3", children: [
                  /* @__PURE__ */ e.jsxs("div", { className: "text-slate-200", children: [
                    t.origin,
                    " \u2794 ",
                    t.destination
                  ] }),
                  /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-500 font-mono", children: [
                    t.distance_kms,
                    " km"
                  ] })
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono font-bold text-emerald-400", children: fmt(t.revenue) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono text-slate-400", children: fmt(t.total_expenses) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-right font-mono font-bold text-white", children: fmt(profit) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold border " + (t.status === "Completed" || t.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : t.status === "In Transit" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"), children: t.status }) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-3 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold border " + (t.clientPaymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : t.clientPaymentStatus === "Delayed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-slate-800 text-slate-300 border-slate-700"), children: t.clientPaymentStatus || "Pending" }) })
              ]
            },
            t.id || t.trip_number
          );
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F69B} Registered Fleet Trucks" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono", children: [
              trucks.length,
              " Trucks"
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Commercial vehicle telematics & odometers." })
        ] }) }),
        /* @__PURE__ */ e.jsx("div", { className: "space-y-3", children: trucks.map((trk) => /* @__PURE__ */ e.jsxs(
          "div",
          {
            onClick: () => setDrilldownModal({
              isOpen: true,
              type: "truck_detail",
              title: trk.truck_number + " Vehicle Master File",
              subtitle: (trk.model || "Commercial Vehicle") + " \u2022 Odometer " + Number(trk.current_odometer || 0).toLocaleString("en-IN") + " km",
              data: trk
            }),
            className: "p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition flex justify-between items-center cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white flex items-center gap-2", children: [
                  /* @__PURE__ */ e.jsx("span", { children: trk.truck_number }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono", children: trk.model || "Heavy Haul" })
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400 mt-0.5", children: [
                  "Manager: ",
                  trk.manager_name || "Ramesh Patel",
                  " \u2022 Phone: ",
                  trk.manager_phone || "+91 98234 11223"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-right font-mono", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-bold text-slate-200", children: [
                  Number(trk.current_odometer || 0).toLocaleString("en-IN"),
                  " km"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-emerald-400", children: [
                  "Status: ",
                  trk.status || "Available"
                ] })
              ] })
            ]
          },
          trk.id || trk.truck_number
        )) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F468}\u200D\u2708\uFE0F Heavy Truck Drivers Crew" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono", children: [
              employees.length,
              " Crew Members"
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "License compliance, base salary and advance balance." })
        ] }) }),
        /* @__PURE__ */ e.jsx("div", { className: "space-y-3", children: employees.map((emp) => /* @__PURE__ */ e.jsxs(
          "div",
          {
            onClick: () => setDrilldownModal({
              isOpen: true,
              type: "driver_detail",
              title: emp.full_name + " Crew File",
              subtitle: emp.role + " \u2022 License " + (emp.license_number || "Verified"),
              data: emp
            }),
            className: "p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition flex justify-between items-center cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white flex items-center gap-2", children: [
                  /* @__PURE__ */ e.jsx("span", { children: emp.full_name }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400", children: emp.role })
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400 mt-0.5", children: [
                  "License: ",
                  /* @__PURE__ */ e.jsx("span", { className: "font-mono text-slate-300", children: emp.license_number || "TS29 20170008981" }),
                  " \u2022 Phone: ",
                  emp.phone
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-right font-mono", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-bold text-emerald-400", children: [
                  fmt(emp.base_salary),
                  "/mo"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-amber-400", children: [
                  "Advances: ",
                  fmt(emp.advances_taken || 0)
                ] })
              ] })
            ]
          },
          emp.id || emp.full_name
        )) })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl", children: [
      /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsxs("h2", { className: "text-base font-bold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { children: "\u{1F6A8} Live Operational Alerts & Compliance" }),
          /* @__PURE__ */ e.jsxs("span", { className: "text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono", children: [
            liveAlerts.length,
            " Active Items"
          ] })
        ] }),
        /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Real alerts generated from payment statuses, active transits and tyre wear." })
      ] }) }),
      /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: liveAlerts.map((a) => /* @__PURE__ */ e.jsxs(
        "div",
        {
          className: "p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3",
          children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white text-xs flex items-center gap-2", children: [
                /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full " + (a.type === "danger" ? "bg-rose-500" : a.type === "warning" ? "bg-amber-500" : a.type === "info" ? "bg-blue-500" : "bg-emerald-500") }),
                /* @__PURE__ */ e.jsx("span", { children: a.title })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400 mt-1 leading-relaxed", children: a.desc })
            ] }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => alert("Executing action: " + a.action + " for " + a.title),
                className: "px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer",
                children: a.action
              }
            )
          ]
        },
        a.id
      )) })
    ] }),
    drilldownModal.isOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ e.jsxs("div", { className: "w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("h3", { className: "text-lg font-black text-white", children: drilldownModal.title }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: drilldownModal.subtitle })
        ] }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDrilldownModal({ isOpen: false, type: "", title: "", subtitle: "", data: null }),
            className: "w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer text-sm font-bold",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "p-6 overflow-y-auto space-y-4 text-xs", children: [
        drilldownModal.type === "revenue" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Confirmed Freight" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-emerald-400 mt-1", children: fmt(totalRevenue) }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                deliveredTrips.length,
                " Delivered Trips"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Received in Bank" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-blue-400 mt-1", children: fmt(clientBreakdown.reduce((s, c) => s + c.paidRevenue, 0)) }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Paid Trips" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Outstanding / Delayed" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-amber-400 mt-1", children: fmt(clientBreakdown.reduce((s, c) => s + c.outstanding, 0)) }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Pending Collection" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Corporate Client Billing Ledger:" }),
            /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
              /* @__PURE__ */ e.jsx("thead", { children: /* @__PURE__ */ e.jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]", children: [
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Client Name" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-center", children: "Trips" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Confirmed Freight" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Paid" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Outstanding" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Margin" })
              ] }) }),
              /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-medium", children: clientBreakdown.map((c) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900", children: [
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: c.name }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-center font-mono", children: c.trips }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: fmt(c.revenue) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: fmt(c.paidRevenue) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-amber-400", children: fmt(c.outstanding) }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-white", children: c.margin })
              ] }, c.name)) })
            ] })
          ] })
        ] }),
        drilldownModal.type === "expenses" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: expenseCategories.map((cat) => /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: cat.name }),
            /* @__PURE__ */ e.jsx("div", { className: "text-base font-black text-white mt-1", children: fmt(cat.amount) }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
              cat.pct,
              "% of total"
            ] })
          ] }, cat.name)) }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs", children: "Direct Expense Vouchers from jc_expenses:" }),
            /* @__PURE__ */ e.jsx("div", { className: "space-y-2", children: expenses.map((e) => /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white", children: [
                  e.expense_number,
                  " \u2022 ",
                  e.category
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400", children: [
                  e.vendor_name,
                  " \u2022 ",
                  e.description
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-rose-400", children: fmt(e.amount) })
            ] }, e.expense_number || e.id)) })
          ] })
        ] }),
        drilldownModal.type === "trips" && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-3", children: "All Recorded Trip Logs:" }),
          /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
            /* @__PURE__ */ e.jsx("thead", { children: /* @__PURE__ */ e.jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]", children: [
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Trip" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Client" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Vehicle / Driver" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Route" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Revenue" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Expenses" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-center", children: "Status" })
            ] }) }),
            /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-medium", children: filteredTrips.map((t) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900", children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2 font-bold text-blue-400", children: t.trip_number }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2 font-bold text-white", children: t.client_name }),
              /* @__PURE__ */ e.jsxs("td", { className: "py-2 text-slate-300", children: [
                t.truck_number,
                " (",
                t.driver_name,
                ")"
              ] }),
              /* @__PURE__ */ e.jsxs("td", { className: "py-2 text-slate-400", children: [
                t.origin,
                " \u2794 ",
                t.destination
              ] }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2 text-right font-mono font-bold text-emerald-400", children: fmt(t.revenue) }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2 text-right font-mono text-slate-400", children: fmt(t.total_expenses) }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300", children: t.status }) })
            ] }, t.id || t.trip_number)) })
          ] })
        ] }) }),
        drilldownModal.type === "trip_detail" && drilldownModal.data && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Trip Number" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-blue-400", children: drilldownModal.data.trip_number })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Client Account" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: drilldownModal.data.client_name })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Vehicle Reg" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200", children: drilldownModal.data.truck_number })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Assigned Driver" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200", children: drilldownModal.data.driver_name })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-900 rounded-xl space-y-2", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs", children: "Financial Line-Item Breakdown:" }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Total Billed Freight:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-emerald-400", children: fmt(drilldownModal.data.revenue) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Fuel (Diesel):" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-cyan-400", children: fmt(drilldownModal.data.fuel_cost) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "FASTag Tolls:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-purple-400", children: fmt(drilldownModal.data.toll_cost) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Driver Allowance:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-blue-400", children: fmt(drilldownModal.data.driver_allowance) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Tyre Depreciation (\u20B93/km):" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-amber-400", children: fmt(drilldownModal.data.tyre_depreciation_expense) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between py-1 pt-2 font-bold text-white", children: [
              /* @__PURE__ */ e.jsx("span", { children: "Net Trip Margin:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-emerald-400", children: fmt((drilldownModal.data.revenue || 0) - (drilldownModal.data.total_expenses || 0)) })
            ] })
          ] })
        ] }) }),
        drilldownModal.type === "client_detail" && drilldownModal.data && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Account Name" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: drilldownModal.data.client.name })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Confirmed Freight" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-emerald-400", children: fmt(drilldownModal.data.client.revenue) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Outstanding Balance" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-amber-400", children: fmt(drilldownModal.data.client.outstanding) })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Contact Person" }),
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-300", children: drilldownModal.data.client.contactPerson })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white text-xs mt-3", children: [
            "Trips Handled for ",
            drilldownModal.data.client.name,
            ":"
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "space-y-2", children: drilldownModal.data.trips.map((t) => /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-blue-400", children: t.trip_number }),
              " \u2022 ",
              t.origin,
              " \u2794 ",
              t.destination,
              /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-400 ml-2", children: [
                "(",
                t.truck_number,
                ", ",
                t.driver_name,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "font-mono font-bold text-emerald-400", children: fmt(t.revenue) })
          ] }, t.trip_number)) })
        ] }) }),
        drilldownModal.type === "route_detail" && drilldownModal.data && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsx("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Corridor" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: drilldownModal.data.corridor.route })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Total Freight Billed" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-emerald-400", children: fmt(drilldownModal.data.corridor.revenue) })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Fuel & Tolls" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-300", children: fmt(drilldownModal.data.corridor.fuelCost + drilldownModal.data.corridor.tollCost) })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 text-[10px] uppercase font-bold", children: "Net Margin" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-emerald-400", children: drilldownModal.data.corridor.margin })
          ] })
        ] }) }) })
      ] })
    ] }) }),
    isProfileModalOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in", children: /* @__PURE__ */ e.jsxs("div", { className: "w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3", children: [
        /* @__PURE__ */ e.jsx("h3", { className: "font-black text-white text-base", children: "Fleet Operations Command" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsProfileModalOpen(false),
            className: "w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center cursor-pointer",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "text-xs space-y-2 text-slate-300", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("b", { children: "Company:" }),
          " JAI BHAVANI CARGO"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("b", { children: "Fleet Manager:" }),
          " Ramesh Patel (+91 98234 11223)"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("b", { children: "Primary Depot:" }),
          " Hyderabad Central Logistics Hub"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("b", { children: "Active Corridors:" }),
          " Hyderabad \u2794 Warangal, Hyderabad \u2794 Bengaluru"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("b", { children: "Store Connectivity:" }),
          " ",
          /* @__PURE__ */ e.jsx("span", { className: "text-emerald-400 font-bold", children: "Live Synchronized" }),
          " with jc_trips & jc_expenses"
        ] })
      ] })
    ] }) })
  ] });
}

import{j as e,ap as bt,dB as gt,cv as ft,ai as _e,cC as et,df as jt,r as C,ak as Nt,bm as vt,cg as yt,b2 as wt,a0 as ut,a4 as kt,R as st,E as St,a_ as Ct,bt as Oe,aB as ze,aO as at,aQ as Ke,a6 as ke,ae as qe,av as rt,dC as lt,aV as Tt,am as Mt}from"./vendor-react-Bs5V2qFE.js";import{I as ue,S as ne,e as oe,g as ie,h as de,i as T,B as Me,k as Se,au as nt,y as Xe,z as Ye,A as le,E as q,F as Ze,G as N,C as v,o as L,q as R,O as k,r as Q,p as Te,t as ve,l as ot,n as Lt,s as Rt,v as je,x as Ne,L as it,b6 as Et,b7 as Pt,b8 as Dt,b9 as At,ba as _t,bb as $t,bc as It,bd as Ft}from"./index-DLxf9dwO.js";import{S as Vt}from"./SendMailDialog-DwU-GlVi.js";import{utils as He,writeFile as Bt}from"./xlsx-CNerDvZX.js";import{s as We,e as Ue}from"./startOfMonth-CPqsb2_s.js";import{R as Le,T as Re,L as Ee,C as Gt,B as De}from"./generateCategoricalChart-BEnIo3F8.js";import{L as ht}from"./LineChart-DmZyY0rc.js";import{C as $e}from"./CartesianGrid-BCC_9QQg.js";import{X as Ie,Y as Fe}from"./YAxis-C3vl7O1m.js";import{L as Ae}from"./Line-D_9erwcV.js";import{P as Ot,a as zt}from"./PieChart-DFpEcMSh.js";import{B as pt}from"./BarChart-DOVIJigh.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";const Kt=({filters:l,setFilters:i,onApply:f,onReset:u})=>{const a=A=>{const V=new Date;let _="",E="";if(A==="this_month")_=Se(We(V),"yyyy-MM-dd"),E=Se(Ue(V),"yyyy-MM-dd");else if(A==="last_month"){const P=nt(V,1);_=Se(We(P),"yyyy-MM-dd"),E=Se(Ue(P),"yyyy-MM-dd")}else A==="last_3_months"?(_=Se(We(nt(V,2)),"yyyy-MM-dd"),E=Se(Ue(V),"yyyy-MM-dd")):A==="fy_25_26"?(_="2025-04-01",E="2026-03-31"):A==="all"&&(_="",E="");const re={...l,startDate:_,endDate:E};i(re),f&&setTimeout(()=>f(re),0)};return e.jsxs("div",{className:"bg-slate-900/65 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 px-4 shadow-md mb-5 flex flex-wrap items-center gap-4 text-xs font-sans",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3.5 flex-1 min-w-[280px]",children:[e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"Start"}),e.jsx(ue,{type:"date",value:l.startDate,onChange:A=>i({...l,startDate:A.target.value}),className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"End"}),e.jsx(ue,{type:"date",value:l.endDate,onChange:A=>i({...l,endDate:A.target.value}),className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"})]}),e.jsxs("div",{className:"flex items-center gap-2 min-w-[130px] shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"View"}),e.jsxs(ne,{value:l.period,onValueChange:A=>i({...l,period:A}),children:[e.jsx(oe,{className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-bold py-0 text-slate-200",children:e.jsx(ie,{placeholder:"Period"})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(T,{value:"monthly",children:"Monthly View"}),e.jsx(T,{value:"quarterly",children:"Quarterly Breakdown"}),e.jsx(T,{value:"annual",children:"Annual Summary"})]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-3 flex-wrap sm:flex-nowrap",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-[140px] shrink-0",children:[e.jsxs("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1",children:[e.jsx(bt,{className:"w-3 h-3 text-amber-400"})," Range"]}),e.jsxs(ne,{onValueChange:a,children:[e.jsx(oe,{className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-black py-0 text-amber-300",children:e.jsx(ie,{placeholder:"Quick Range"})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(T,{value:"this_month",children:"This Month"}),e.jsx(T,{value:"last_month",children:"Last Month"}),e.jsx(T,{value:"last_3_months",children:"Last 3 Months"}),e.jsx(T,{value:"fy_25_26",children:"FY 2025-26"}),e.jsx(T,{value:"all",children:"All Time"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsxs(Me,{variant:"outline",onClick:u,className:"rounded-xl h-8 text-[11px] font-bold border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 px-3",children:[e.jsx(gt,{className:"w-3 h-3 mr-1 text-slate-400"})," Reset"]}),e.jsxs(Me,{onClick:f,className:"rounded-xl h-8 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-sm gap-1 px-3.5",children:[e.jsx(ft,{className:"w-3 h-3"})," Apply"]})]})]})]})},qt=({data:l})=>!l||l.length===0?e.jsx("div",{className:"p-8 text-center text-muted-foreground border border-border rounded-2xl bg-card",children:"No monthly data available."}):e.jsx("div",{className:"rounded-2xl border border-border bg-card overflow-hidden shadow-sm",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-muted/50",children:e.jsxs(le,{children:[e.jsx(q,{className:"font-semibold",children:"Month"}),e.jsx(q,{className:"text-right font-semibold",children:"Revenue"}),e.jsx(q,{className:"text-right font-semibold",children:"Expenses"}),e.jsx(q,{className:"text-right font-semibold",children:"Profit"}),e.jsx(q,{className:"text-right font-semibold",children:"Margin"}),e.jsx(q,{className:"text-right font-semibold",children:"MoM Growth"})]})}),e.jsx(Ze,{children:l.map((i,f)=>e.jsxs(le,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(N,{className:"font-medium",children:i.month}),e.jsxs(N,{className:"text-right tabular-nums",children:["₹",i.revenue.toLocaleString()]}),e.jsxs(N,{className:"text-right tabular-nums",children:["₹",i.expenses.toLocaleString()]}),e.jsxs(N,{className:`text-right tabular-nums font-medium ${i.profit>=0?"text-success":"text-destructive"}`,children:["₹",i.profit.toLocaleString()]}),e.jsxs(N,{className:"text-right tabular-nums",children:[i.margin.toFixed(1),"%"]}),e.jsx(N,{className:"text-right tabular-nums",children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[i.momGrowth>0?e.jsx(_e,{className:"w-4 h-4 text-success"}):i.momGrowth<0?e.jsx(et,{className:"w-4 h-4 text-destructive"}):e.jsx(jt,{className:"w-4 h-4 text-muted-foreground"}),e.jsxs("span",{className:i.momGrowth>0?"text-success":i.momGrowth<0?"text-destructive":"text-muted-foreground",children:[Math.abs(i.momGrowth).toFixed(1),"%"]})]})})]},i.sortKey))})]})}),dt=["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6"],tt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg",children:[e.jsx("p",{className:"font-medium text-foreground mb-2",children:f}),i.map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-4 text-sm",children:[e.jsxs("span",{style:{color:u.color},children:[u.name,":"]}),e.jsxs("span",{className:"font-semibold tabular-nums",children:["₹",u.value.toLocaleString(void 0,{maximumFractionDigits:0})]})]},a))]}):null,Ht=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(ht,{data:l,margin:{top:10,right:10,left:10,bottom:5},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:8}),e.jsx(Fe,{yAxisId:"left",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:i=>`₹${(i/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{wrapperStyle:{paddingTop:"15px"},iconType:"circle",iconSize:8}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"revenue",name:"Revenue",stroke:"#6366f1",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#6366f1"},activeDot:{r:6,strokeWidth:0,fill:"#6366f1"},connectNulls:!0}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"expenses",name:"Expenses",stroke:"#f43f5e",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#f43f5e"},activeDot:{r:6,strokeWidth:0,fill:"#f43f5e"},connectNulls:!0}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"profit",name:"Profit",stroke:"#10b981",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#10b981"},activeDot:{r:6,strokeWidth:0,fill:"#10b981"},connectNulls:!0})]})})}),ct=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(Ot,{children:[e.jsx(zt,{data:l,cx:"50%",cy:"40%",innerRadius:60,outerRadius:90,paddingAngle:2,dataKey:"value",children:l.map((i,f)=>e.jsx(Gt,{fill:dt[f%dt.length]},`cell-${f}`))}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{layout:"horizontal",verticalAlign:"bottom",align:"center",wrapperStyle:{paddingTop:"10px"},iconType:"circle",iconSize:8})]})})}),xt=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(pt,{data:l,margin:{top:10,right:10,left:10,bottom:5},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"quarter",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:8}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:i=>`₹${(i/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{wrapperStyle:{paddingTop:"15px"},iconType:"circle",iconSize:8}),e.jsx(De,{dataKey:"revenue",name:"Revenue",fill:"#6366f1",radius:[4,4,0,0]}),e.jsx(De,{dataKey:"expenses",name:"Expenses",fill:"#f43f5e",radius:[4,4,0,0]}),e.jsx(De,{dataKey:"profit",name:"Profit",fill:"#10b981",radius:[4,4,0,0]})]})})}),Ce=["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#a78bfa","#06b6d4","#f97316"],Wt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg min-w-[200px]",children:[e.jsx("p",{className:"font-medium text-foreground mb-2 pb-2 border-b border-border",children:f}),e.jsx("div",{className:"space-y-1",children:i.slice().sort((u,a)=>(a.value||0)-(u.value||0)).map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-6 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-full",style:{backgroundColor:u.color}}),e.jsx("span",{className:"text-muted-foreground",children:u.name})]}),e.jsxs("span",{className:"font-semibold tabular-nums text-foreground",children:["₹",typeof u.value=="number"?u.value.toLocaleString(void 0,{maximumFractionDigits:0}):u.value||0]})]},a))})]}):null,Qe=({data:l,categories:i,title:f})=>e.jsxs(v,{className:"shadow-sm border-border",children:[e.jsx(L,{children:e.jsx(R,{className:"text-lg",children:f})}),e.jsx(k,{children:e.jsx("div",{className:"w-full h-[350px]",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(ht,{data:l||[],margin:{top:10,right:10,left:10,bottom:20},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:10}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:u=>`₹${((u||0)/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(Wt,{})}),e.jsx(Ee,{wrapperStyle:{bottom:-10,paddingTop:"15px"},iconType:"circle",iconSize:8}),(i||[]).map((u,a)=>e.jsx(Ae,{type:"monotone",dataKey:u,name:u,stroke:Ce[a%Ce.length],strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:Ce[a%Ce.length]},activeDot:{r:6,strokeWidth:0,fill:Ce[a%Ce.length]},connectNulls:!0},u))]})})})})]}),Ut=({chartData:l})=>!l||!l.categories||l.categories.length===0?null:e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-6",children:[e.jsx(Qe,{data:l.revenueData,categories:l.categories,title:"Revenue Trend by Category"}),e.jsx(Qe,{data:l.expensesData,categories:l.categories,title:"Expense Trend by Category"}),e.jsx("div",{className:"xl:col-span-2",children:e.jsx(Qe,{data:l.profitData,categories:l.categories,title:"Profit Trend by Category"})})]}),mt=["hsl(var(--chart-1))","hsl(var(--chart-2))","hsl(var(--chart-3))","hsl(var(--chart-4))","hsl(var(--chart-5))","hsl(200, 70%, 50%)","hsl(250, 70%, 60%)","hsl(330, 70%, 50%)"],Qt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg min-w-[200px]",children:[e.jsx("p",{className:"font-medium text-foreground mb-2 pb-2 border-b border-border",children:f}),e.jsx("div",{className:"space-y-1",children:i.slice().sort((u,a)=>a.value-u.value).map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-6 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-sm",style:{backgroundColor:u.color}}),e.jsx("span",{className:"text-muted-foreground",children:u.name})]}),e.jsxs("span",{className:"font-semibold tabular-nums text-foreground",children:["₹",u.value.toLocaleString(void 0,{maximumFractionDigits:0})]})]},a))})]}):null,Je=({data:l,categories:i,title:f})=>e.jsxs(v,{className:"shadow-sm border-border",children:[e.jsx(L,{children:e.jsx(R,{className:"text-lg",children:f})}),e.jsx(k,{children:e.jsx("div",{className:"w-full h-[350px]",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(pt,{data:l,margin:{top:10,right:10,left:10,bottom:20},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"hsl(var(--border))",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:12,tickLine:!1,axisLine:!1}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:12,tickLine:!1,axisLine:!1,tickFormatter:u=>`₹${(u/1e3).toFixed(0)}k`}),e.jsx(Re,{content:e.jsx(Qt,{})}),e.jsx(Ee,{wrapperStyle:{bottom:0,paddingTop:"20px"}}),i.map((u,a)=>e.jsx(De,{dataKey:u,name:u,fill:mt[a%mt.length],radius:[4,4,0,0],maxBarSize:40},u))]})})})})]}),Jt=({chartData:l})=>!l||l.categories.length===0?null:e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-6",children:[e.jsx(Je,{data:l.revenueData,categories:l.categories,title:"Revenue Comparison by Month"}),e.jsx(Je,{data:l.expensesData,categories:l.categories,title:"Expense Comparison by Month"}),e.jsx("div",{className:"xl:col-span-2",children:e.jsx(Je,{data:l.profitData,categories:l.categories,title:"Profit Comparison by Month"})})]}),Xt=({startDate:l,endDate:i})=>{const[f,u]=C.useState(!0),[a,A]=C.useState([]),[V,_]=C.useState([]),[E,re]=C.useState([]),[P,pe]=C.useState("12"),[be,Pe]=C.useState("18"),[ce,Ve]=C.useState(new Date().toISOString().substring(0,7)),[J,ye]=C.useState({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}});C.useEffect(()=>{const x=`ca_compliance_${ce}`,y=localStorage.getItem(x);if(y)try{ye(JSON.parse(y))}catch{ye({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}})}else ye({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}})},[ce]);const Z=(x,y,ee)=>{ye(X=>{const H={...X,[x]:{...X[x],[y]:ee}};return localStorage.setItem(`ca_compliance_${ce}`,JSON.stringify(H)),H}),ve.success("Compliance checklist updated")},ge=async()=>{u(!0);try{let x="";l&&i&&(x=`date >= "${l} 00:00:00" && date <= "${i} 23:59:59"`);const[y,ee,X]=await Promise.all([Te.collection("trip_logs").getFullList({filter:x||void 0,$autoCancel:!1}),Te.collection("expenses").getFullList({filter:x||void 0,$autoCancel:!1}),Te.collection("clients").getFullList({$autoCancel:!1})]);A(y),_(ee),re(X)}catch(x){console.error("Error fetching CA data:",x),ve.error("Failed to load compliance data")}finally{u(!1)}};C.useEffect(()=>{ge()},[l,i]);const p=C.useMemo(()=>{const x=a.reduce((S,w)=>S+(Number(w.revenue)||0),0),y=a.reduce((S,w)=>S+(Number(w.tds_deducted_receivable)||0),0),ee=x-y;let X=0,H=0;V.forEach(S=>{const w=Number(S.amount)||0,G=(S.category||"").toLowerCase(),U=(S.subcategory||"").toLowerCase();G==="maintenance"||U==="maintenance"?X+=w:H+=w});const Y=X+H,D=ee-Y,te=x*(Number(P)/100),we=X*(Number(be)/100),Ge=te-we;let d=0,h=0,n=0,b=0;a.forEach(S=>{const w=Number(S.revenue)||0,G=S.client_payment_status==="received",U=S.ownership_type==="Attached";G||(d+=w,U&&(h+=Number(S.vendor_payout)||0)),U?b+=Number(S.brokerage_margin)||0:n+=w});const m=n-y-Y,fe=m+b,W={};return a.forEach(S=>{const w=S.client_id;if(!w)return;const G=Number(S.revenue)||0,U=Number(S.tds_deducted_receivable)||0;if(!W[w]){const se=E.find(he=>he.id===w);W[w]={clientName:se?.client_name||"Unknown Client",gstin:se?.gst_number||"N/A",pan:se?.pan_number||"N/A",volume:0,tdsHeld:0}}W[w].volume+=G,W[w].tdsHeld+=U}),{grossRevenue:x,tdsDeducted:y,netRevenue:ee,totalExpenses:Y,profitBeforeTax:D,outwardGst:te,inputTaxCredit:we,netGstPayable:Ge,accountsReceivable:d,accountsPayable:h,fleetProfitNet:m,brokerageProfit:b,retainedEarnings:fe,tdsLedger:Object.values(W).sort((S,w)=>w.tdsHeld-S.tdsHeld)}},[a,V,E,P,be]),Be=()=>{try{const x=["Type","Identifier/Client/Category","Tax ID (GST/PAN)","Gross Amount (₹)","TDS Deducted (₹)","Estimated GST Liability (₹)"],y=[];y.push(["OVERVIEW","Gross Booking Revenue","",p.grossRevenue,p.tdsDeducted,p.outwardGst]),y.push(["OVERVIEW","Total Expenses","",p.totalExpenses,0,-p.inputTaxCredit]),y.push(["OVERVIEW","Net Profit Before Taxes","",p.profitBeforeTax,0,0]),y.push(["OVERVIEW","Net GST Payable/ITC Refund","","","",p.netGstPayable]),y.push([]),y.push(["CLIENT LEDGER","Client Name","GSTIN / PAN","Gross Volume Processed (₹)","TDS Held Back (₹)",""]),p.tdsLedger.forEach(D=>{y.push(["CLIENT",D.clientName,`${D.gstin} / ${D.pan}`,D.volume,D.tdsHeld,""])}),y.push([]),y.push(["EXPENSE DETAIL","Category","Description","Amount (₹)","Date","GST Claimable (₹)"]),V.forEach(D=>{const we=(D.category||"").toLowerCase()==="maintenance"||(D.subcategory||"").toLowerCase()==="maintenance"?D.amount*(Number(be)/100):0;y.push(["EXPENSE",D.category||"Other",D.description||"",D.amount||0,D.date?D.date.substring(0,10):"",we])});const ee=[x.join(","),...y.map(D=>D.map(te=>typeof te=="string"?`"${te.replace(/"/g,'""')}"`:te).join(","))].join(`
`),X=new Blob([ee],{type:"text/csv;charset=utf-8;"}),H=URL.createObjectURL(X),Y=document.createElement("a");Y.setAttribute("href",H),Y.setAttribute("download",`CA_Compliance_Pack_${ce}.csv`),document.body.appendChild(Y),Y.click(),document.body.removeChild(Y),ve.success("CA Compliance Package exported successfully")}catch(x){console.error(x),ve.error("Failed to export CSV package")}},B=x=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.abs(x||0));return f?e.jsxs("div",{className:"flex flex-col items-center justify-center p-12 min-h-[300px]",children:[e.jsx(Nt,{className:"w-10 h-10 animate-spin text-primary mb-3"}),e.jsx("p",{className:"text-sm text-slate-400",children:"Loading tax compliance data..."})]}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-xl font-bold flex items-center gap-2 text-slate-100",children:[e.jsx(vt,{className:"w-5 h-5 text-blue-500"}),"Chartered Accountant Tax Auditing Center"]}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Reconcile outward GST liabilities, input tax credits, and client TDS holdings with compliance checklists."})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(Me,{onClick:Be,className:"bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 h-10 text-xs font-semibold shadow-md",children:[e.jsx(yt,{className:"w-4 h-4"}),"Export Audit Pack for CA"]}),e.jsx(Me,{variant:"outline",onClick:ge,className:"bg-slate-950 border-slate-800 text-slate-400 hover:text-white rounded-xl h-10 w-10 shrink-0",children:e.jsx(wt,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Gross Booking Volume"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 tabular-nums text-slate-200",children:B(p.grossRevenue)}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsx("span",{children:"Total TDS Deductions:"}),e.jsx("span",{className:"font-semibold text-red-400",children:B(p.tdsDeducted)})]})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"GST Tax Position"}),e.jsxs("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.netGstPayable>=0?"text-amber-400":"text-emerald-400"}`,children:[B(p.netGstPayable)," ",p.netGstPayable>=0?"Payable":"Credit"]}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsxs("span",{children:["Outward GST (",P,"%): ",B(p.outwardGst)]}),e.jsxs("span",{children:["ITC Credit (",be,"%): ",B(p.inputTaxCredit)]})]})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Profit Net of Deductions"}),e.jsx("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.profitBeforeTax>=0?"text-emerald-400":"text-red-400"}`,children:B(p.profitBeforeTax)}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsxs("span",{children:["Net Settled Revenue: ",B(p.netRevenue)]}),e.jsxs("span",{children:["Total Expenses: ",B(p.totalExpenses)]})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-sky-400 to-blue-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Accounts Receivable (AR)"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 text-blue-400 tabular-nums",children:B(p.accountsReceivable)}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-2",children:"Outstanding client invoicing balance"})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-500 to-amber-600"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Accounts Payable (AP)"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 text-amber-500 tabular-nums",children:B(p.accountsPayable)}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-2",children:"Owed to attached vehicle vendors"})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-purple-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Retained Earnings / Retained Profit"}),e.jsx("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.retainedEarnings>=0?"text-emerald-400":"text-red-400"}`,children:B(p.retainedEarnings)}),e.jsxs("p",{className:"text-[11px] text-slate-400 mt-2",children:["Fleet Profit: ",B(p.fleetProfitNet)," | Brokerage: ",B(p.brokerageProfit)]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-slate-400",children:"Estimate Outward GST Rate (On Booking Revenue)"}),e.jsxs(ne,{value:P,onValueChange:pe,children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-slate-200",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"5",children:"5% (Transport service without ITC / RCM)"}),e.jsx(T,{value:"12",children:"12% (Forward Charge with full ITC - Default)"}),e.jsx(T,{value:"18",children:"18% (Rental / Luxury Operations)"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-slate-400",children:"Estimate Input GST Credit (ITC on Maintenance & Bills)"}),e.jsxs(ne,{value:be,onValueChange:Pe,children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-slate-200",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"12",children:"12% (Contract Maintenance Services)"}),e.jsx(T,{value:"18",children:"18% (Automotive Parts & Garage Invoices - Default)"}),e.jsx(T,{value:"28",children:"28% (Lubricants & Select Spares)"})]})]})]})]}),e.jsxs(v,{className:"bg-slate-900 border-slate-800 text-slate-100 rounded-2xl",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800 mb-4",children:[e.jsxs(R,{className:"text-base font-bold flex items-center gap-2",children:[e.jsx(ut,{className:"w-4 h-4 text-blue-500"}),"TDS Claims Ledger (Form 26AS Reconciliation)"]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Cross-reference client deductions against your Form 26AS dashboard to claim withholding credit refunds during ITR filing."})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-slate-950/60 border-b border-slate-800",children:e.jsxs(le,{className:"border-b-slate-800",children:[e.jsx(q,{className:"text-slate-300 font-semibold",children:"Client Name"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Tax ID (GSTIN / PAN)"}),e.jsx(q,{className:"text-slate-300 font-semibold text-right",children:"Gross Booking volume"}),e.jsx(q,{className:"text-slate-300 font-semibold text-right pr-6",children:"TDS Held Back (Credit)"})]})}),e.jsx(Ze,{children:p.tdsLedger.length===0?e.jsx(le,{children:e.jsx(N,{colSpan:4,className:"text-center py-8 text-slate-400",children:"No client TDS records compiled. Ensure client setup has Applies TDS toggled active."})}):p.tdsLedger.map((x,y)=>e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:x.clientName}),e.jsxs(N,{className:"space-y-0.5",children:[e.jsxs("div",{className:"text-xs",children:["GST: ",e.jsx("span",{className:"font-mono font-medium text-slate-300",children:x.gstin})]}),e.jsxs("div",{className:"text-xs",children:["PAN: ",e.jsx("span",{className:"font-mono font-medium text-slate-300",children:x.pan})]})]}),e.jsx(N,{className:"text-right font-medium tabular-nums text-slate-200",children:B(x.volume)}),e.jsx(N,{className:"text-right font-extrabold tabular-nums text-red-400 pr-6",children:B(x.tdsHeld)})]},y))})]})})]}),e.jsxs(v,{className:"bg-slate-900 border-slate-800 text-slate-100 rounded-2xl",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4",children:[e.jsxs("div",{children:[e.jsxs(R,{className:"text-base font-bold flex items-center gap-2",children:[e.jsx(kt,{className:"w-4 h-4 text-blue-500"}),"Tax Compliance Calendar & Return Checklist"]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Track deadlines and record completion dates for GST and TDS return filings."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-400 font-semibold",children:"Audited Month:"}),e.jsx(ue,{type:"month",value:ce,onChange:x=>Ve(x.target.value),className:"bg-slate-950 border-slate-800 text-slate-200 h-9 w-[150px] text-xs"})]})]}),e.jsx(k,{className:"p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-slate-950/60 border-b border-slate-800",children:e.jsxs(le,{className:"border-b-slate-800",children:[e.jsx(q,{className:"text-slate-300 font-semibold",children:"Form Code"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Compliance Return Description"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Standard Deadline"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Filing Status"}),e.jsx(q,{className:"text-slate-300 font-semibold pr-6",children:"Completion Date"})]})}),e.jsxs(Ze,{children:[e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"GSTR-1"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Outward Supplies Return (Sales invoices summary to claim client ITC)"}),e.jsx(N,{className:"text-xs",children:"11th of subsequent month"}),e.jsx(N,{children:e.jsxs(ne,{value:J.gstr1.status,onValueChange:x=>Z("gstr1","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.gstr1.date,onChange:x=>Z("gstr1","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"GSTR-3B"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Monthly Self-Declared Summary Return (GST Payment settlement)"}),e.jsx(N,{className:"text-xs",children:"20th of subsequent month"}),e.jsx(N,{children:e.jsxs(ne,{value:J.gstr3b.status,onValueChange:x=>Z("gstr3b","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.gstr3b.date,onChange:x=>Z("gstr3b","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"Form 26Q"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Quarterly TDS Return (Deductions on payments other than salaries)"}),e.jsx(N,{className:"text-xs",children:"31st of subsequent month after quarter"}),e.jsx(N,{children:e.jsxs(ne,{value:J.tds26q.status,onValueChange:x=>Z("tds26q","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.tds26q.date,onChange:x=>Z("tds26q","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"ITR-6"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Annual Income Tax Return (Corporate financial filing for refunds)"}),e.jsx(N,{className:"text-xs",children:"31st October of subsequent fiscal year"}),e.jsx(N,{children:e.jsxs(ne,{value:J.itr6.status,onValueChange:x=>Z("itr6","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.itr6.date,onChange:x=>Z("itr6","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]})]})]})})})]})]})},Yt=({data:l,color:i="#6366f1"})=>{if(!l||l.length<2)return null;const f=Math.max(...l,1),u=Math.min(...l,0),a=f-u||1,A=80,V=36,_=l.map((E,re)=>{const P=re/(l.length-1)*A,pe=V-(E-u)/a*(V-4)-2;return`${P},${pe}`}).join(" ");return e.jsxs("svg",{width:A,height:V,viewBox:`0 0 ${A} ${V}`,className:"overflow-visible",children:[e.jsx("polyline",{points:_,fill:"none",stroke:i,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:_.split(" ").pop().split(",")[0],cy:_.split(" ").pop().split(",")[1],r:"3",fill:i})]})},ae=({title:l,value:i,icon:f,trend:u,trendUp:a,isCurrency:A=!0,valueClass:V="",colorClass:_="from-blue-500 to-indigo-500",subLabel:E,subValue:re,sparkData:P})=>e.jsxs(v,{className:"relative overflow-hidden shadow-md border-border/40 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group",children:[e.jsx("div",{className:`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${_}`}),e.jsx("div",{className:`absolute inset-0 bg-gradient-to-br ${_} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}),e.jsxs(k,{className:"p-5",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2 mb-3",children:[e.jsx("p",{className:"text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-tight",children:l}),e.jsx("div",{className:`p-2 rounded-xl bg-gradient-to-br ${_} bg-opacity-10 shrink-0`,children:e.jsx(f,{className:"h-4 w-4 text-white"})})]}),e.jsxs("div",{className:"flex items-end justify-between gap-2",children:[e.jsxs("div",{children:[e.jsxs("div",{className:`text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums ${V}`,children:[A?"₹":"",i]}),E&&e.jsxs("p",{className:"text-[11px] text-muted-foreground mt-1 font-medium",children:[E,": ",e.jsx("span",{className:"text-foreground font-bold",children:re})]}),u&&e.jsxs("div",{className:`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${a!==!1?"text-emerald-400":"text-rose-400"}`,children:[a!==!1?e.jsx(_e,{className:"w-3 h-3"}):e.jsx(et,{className:"w-3 h-3"}),e.jsx("span",{children:u})]})]}),P&&P.length>1&&e.jsx("div",{className:"w-20 h-10 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity",children:e.jsx(Yt,{data:P,color:"#6366f1"})})]})]})]}),us=()=>{return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});const[l,i]=C.useState(!0),[f,u]=C.useState({startDate:"",endDate:"",period:"monthly"}),[a,A]=C.useState({monthly:[],category:[],categoryMonthlyRaw:[],categoryMonthlyCharts:null,quarterly:[],annual:[],totals:{revenue:0,expenses:0,profit:0,margin:0},truckAnalytics:[],trucks:[],loans:[],trips:[],employees:[],fuelTracker:[],expensesList:[]}),[V,_]=C.useState(null),[E,re]=C.useState("overview"),[P,pe]=C.useState("2026-07"),[be,Pe]=C.useState(!1),[ce,Ve]=C.useState({}),[J,ye]=C.useState({}),[Z,ge]=C.useState(!1),[p,Be]=C.useState([]),[B,x]=C.useState(!1),[y,ee]=C.useState({recipient:"",subject:"",body:"",html:"",label:""}),X=()=>{const d=a.totals,h=O=>`₹${Number(O||0).toLocaleString("en-IN")}`,n=f.startDate&&f.endDate?`${f.startDate} to ${f.endDate}`:"All Time",b=`
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px">
          <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p>
          <h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">Analytics Report</h2>
          <p style="color:#64748b;font-size:12px;margin:6px 0 0">${n}</p>
        </div>
        <div style="padding:20px 24px;background:#f8fafc">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">REVENUE</p>
              <p style="color:#059669;font-size:20px;font-weight:800;margin:0">${h(d.revenue)}</p>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">EXPENSES</p>
              <p style="color:#e11d48;font-size:20px;font-weight:800;margin:0">${h(d.expenses)}</p>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">NET PROFIT</p>
              <p style="color:${d.profit>=0?"#059669":"#e11d48"};font-size:20px;font-weight:800;margin:0">${h(d.profit)}</p>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
              <p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">MARGIN</p>
              <p style="color:#6366f1;font-size:20px;font-weight:800;margin:0">${Number(d.margin||0).toFixed(1)}%</p>
            </div>
          </div>
          <p style="margin-top:14px;font-size:11px;color:#94a3b8;text-align:center">Generated from Jai Bhavani Cargo Analytics Hub</p>
        </div>
      </div>`;ee({recipient:"",subject:`Analytics Report – ${n}`,body:"Please find the analytics summary for Jai Bhavani Cargo attached below.",html:b,label:"Analytics Report"}),x(!0),ge(!1)},H=st.useMemo(()=>{const d=new Set,n=new Date().toISOString().substring(0,7);return d.add(n),a.trips.forEach(b=>{b.date&&b.date.length>=7&&d.add(b.date.substring(0,7))}),a.expensesList.forEach(b=>{b.date&&b.date.length>=7&&d.add(b.date.substring(0,7))}),Array.from(d).sort((b,O)=>O.localeCompare(b))},[a.trips,a.expensesList]);st.useEffect(()=>{H.length>0&&!H.includes(P)&&pe(H[0])},[H,P]);const Y=(d,h)=>{const n=t=>(t||"").replace(/\s+/g,"").toUpperCase(),b=n(d.truck_number),O=a.trips.filter(t=>{const c=t.truck_number===d.id||n(t.truck_number)===b,K=t.date&&t.date.substring(0,7)===h;return c&&K}),m=a.expensesList.filter(t=>{const c=t.truck_id===d.id||n(t.truck_id)===b,K=t.date&&t.date.substring(0,7)===h;return c&&K}),fe=a.fuelTracker.filter(t=>{const c=t.truck_id===d.id||n(t.truck_number)===b,K=t.date&&t.date.substring(0,7)===h;return c&&K}),W=O.reduce((t,c)=>t+(Number(c.revenue)||0),0),S=a.loans.find(t=>n(t.profileName)===b);let w=0;if(S){const t=S.loanAmount||0,c=(S.interestRate||0)/12/100,K=S.loanTerm||0;t>0&&K>0&&(w=c===0?t/K:t*c*Math.pow(1+c,K)/(Math.pow(1+c,K)-1))}const G=a.employees.find(t=>t.assigned_truck===d.id),U=G&&(Number(G.salary_amount)||Number(G.base_salary))||0,se=ce[d.id]!==void 0?ce[d.id]:Number(localStorage.getItem(`truck_annual_ins_${d.id}`))||6e4,he=se/12,z=J[d.id]!==void 0?J[d.id]:Number(localStorage.getItem(`truck_annual_tax_${d.id}`))||12e3,xe=z/3,s=w+U+he+xe,r=fe.reduce((t,c)=>t+(Number(c.total_cost)||0),0)||m.filter(t=>t.category==="Fuel"||t.subcategory==="Fuel").reduce((t,c)=>t+(Number(c.amount)||0),0),$=O.reduce((t,c)=>t+(Number(c.tolls)||0),0),M=m.filter(t=>t.category==="Maintenance"||t.subcategory==="Maintenance").reduce((t,c)=>t+(Number(c.amount)||0),0),I=r+$+M,j=s+I,F=W-j;return{revenue:W,totalExpenses:j,netProfit:F,fixedExpenses:s,variableExpenses:I,fuelCost:r,tolls:$,maintenance:M,emi:w,driverSalary:U,monthlyInsurance:he,monthlyTax:xe,annualInsurance:se,annualTax:z}};C.useEffect(()=>{const d=document.createElement("style");return d.id="print-style-rules",d.innerHTML=`
      @media print {
        aside, header, nav, button, .no-print, .tabs-list, [role="tablist"], .analytics-filters {
          display: none !important;
        }
        main, .px-4, .py-8 {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .bg-slate-950, .bg-card, .bg-slate-900, .bg-background {
          background: #ffffff !important;
          color: #000000 !important;
        }
        h1, h2, h3, h4, p, span, td, th {
          color: #000000 !important;
        }
        .card, .border-slate-800, .border-border {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
        }
      }
    `,document.head.appendChild(d),()=>{const h=document.getElementById("print-style-rules");h&&h.remove()}},[]);const D=d=>{if(d==="pdf"){window.print();return}try{let h="Overview",n=[];E==="overview"?(h="Overview Summary",n=[{Metric:"Total Revenue",Value:Number(a.totals.revenue)||0},{Metric:"Total Expenses",Value:Number(a.totals.expenses)||0},{Metric:"Net Profit",Value:Number(a.totals.profit)||0},{Metric:"Margin",Value:`${(Number(a.totals.margin)||0).toFixed(2)}%`}]):E==="revenue"?(h="Revenue Analysis",n=a.monthly.map(m=>({Month:m.month,Revenue:Number(m.revenue)||0,Expenses:Number(m.expenses)||0,Profit:Number(m.profit)||0,"Margin (%)":(Number(m.margin)||0).toFixed(1)}))):E==="shipments"?(h="Shipments Dispatch",n=(a.trips||[]).map(m=>({Date:m.date?new Date(m.date).toLocaleDateString("en-IN"):"",Route:m.route||"","Truck Number":m.truck_number||"",Driver:m.driver_name||"",KMS:Number(m.kms)||0,Revenue:Number(m.revenue)||0}))):E==="expenses"?(h="Expenses Breakdown",n=a.category.map(m=>({Category:m.name,Amount:Number(m.value)||0}))):E==="vehicles"?(h="Vehicle Breakdown",n=a.truckAnalytics.map(m=>({"Vehicle Number":m.truck_number,Name:m.truck_name||"",Revenue:Number(m.revenue)||0,Expenses:Number(m.totalExpenses)||0,Profit:Number(m.profit)||0,"Margin (%)":(Number(m.margin)||0).toFixed(1)}))):E==="payroll"?(h="Payroll Records",n=p.map(m=>({Month:m.month,"Driver/Employee":m.driver_name,"Base Salary":Number(m.base_salary)||0,"Mileage Bonus":Number(m.trip_bonus)||0,Deductions:Number(m.deductions)||0,"Net Payout":Number(m.net_salary)||0,Status:m.status}))):(h="General Audit",n=a.monthly.map(m=>({Period:m.month,Revenue:Number(m.revenue)||0,Expenses:Number(m.expenses)||0})));const b=He.json_to_sheet(n),O=He.book_new();He.book_append_sheet(O,b,h),Bt(O,`JaiBhavani_Report_${h.replace(/\s+/g,"_")}_${new Date().toISOString().substring(0,10)}.xlsx`),ve.success(`${h} report downloaded as Excel successfully`)}catch(h){console.error(h),ve.error("Failed to export Excel report")}},te=async d=>{const h=d||f;i(!0);try{const n=await Et(h.startDate,h.endDate),b=Pt(n.trips,n.expenses),O=Dt(n.expenses),m=At(b),fe=_t(b),W=$t(n.trips,n.expenses),S=It(W),w=Ft(n.trips,n.expenses,n.trucks||[],n.loans||[],h.startDate,h.endDate),G=b.reduce((z,xe)=>z+xe.revenue,0),U=b.reduce((z,xe)=>z+xe.expenses,0),se=G-U,he=G>0?se/G*100:0;A({monthly:b,category:O,categoryMonthlyRaw:W,categoryMonthlyCharts:S,quarterly:m,annual:fe,totals:{revenue:G,expenses:U,profit:se,margin:he},truckAnalytics:w,trucks:n.trucks||[],loans:n.loans||[],trips:n.trips||[],employees:n.employees||[],fuelTracker:n.fuelTracker||[],expensesList:n.expenses||[]});try{const z=await Te.collection("payroll").getFullList({sort:"-month",$autoCancel:!1});Be(z)}catch(z){console.error("Failed to load payroll logs:",z)}w.length>0?_(z=>w.some(s=>s.id===z)?z:w[0].id):_(null)}catch(n){console.error(n),ve.error("Failed to load analytics data")}finally{i(!1)}};C.useEffect(()=>{te()},[]);const we=d=>{const h=d&&d.startDate!==void 0?d:f;te(h)},Ge=()=>{const d={startDate:"",endDate:"",period:"monthly"};u(d),te(d)};return e.jsxs("div",{className:"px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/20",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-extrabold tracking-tight text-foreground mb-2",children:"Analytics Hub"}),e.jsx("p",{className:"text-lg text-muted-foreground",children:"Comprehensive financial and operational insights."})]}),e.jsxs("div",{className:"relative inline-flex rounded-xl shadow-sm no-print self-start sm:self-center",children:[e.jsxs("button",{onClick:()=>D("excel"),className:"inline-flex items-center gap-2 rounded-l-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 focus:z-10 focus:outline-none transition-colors border-r border-blue-700/50",children:[e.jsx(ut,{className:"w-4.5 h-4.5"})," Export Report"]}),e.jsxs("div",{className:"relative",children:[e.jsx("button",{onClick:()=>ge(!Z),className:"inline-flex h-full items-center rounded-r-xl bg-blue-600 px-2 text-white hover:bg-blue-500 focus:z-10 focus:outline-none transition-colors",children:e.jsx(St,{className:"w-4 h-4"})}),Z&&e.jsx("div",{className:"absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-slate-900 border border-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in duration-100",children:e.jsxs("div",{className:"py-1",children:[e.jsx("button",{onClick:()=>{D("excel"),ge(!1)},className:"flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors",children:e.jsx("span",{children:"📥 Download Excel"})}),e.jsx("button",{onClick:()=>{D("pdf"),ge(!1)},className:"flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors",children:e.jsx("span",{children:"🖨️ Print / PDF"})}),e.jsxs("button",{onClick:X,className:"flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors",children:[e.jsx(Ct,{className:"w-3.5 h-3.5 text-blue-400"}),e.jsx("span",{children:"📧 Email Report"})]})]})})]})]})]}),e.jsx(Kt,{filters:f,setFilters:u,onApply:we,onReset:Ge}),l?e.jsxs("div",{className:"space-y-8",children:[e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[1,2,3,4,5,6,7,8].map(d=>e.jsx(ot,{className:"h-32 rounded-2xl"},d))}),e.jsx(ot,{className:"h-[400px] rounded-2xl"})]}):(()=>{const d=a.trips||[],h=a.employees||[],n=a.monthly||[],b=d.length,O=d.reduce((s,r)=>s+(Number(r.kms)||0),0),m=b>0?Math.round(a.totals.revenue/b):0,fe=b>0?Math.round(O/b):0,W=new Set(d.map(s=>s.driver_name).filter(Boolean)).size,S=new Set(d.map(s=>s.route).filter(Boolean)).size,w=d.reduce((s,r)=>s+(Number(r.tolls)||0),0),G=(a.category||[]).find(s=>s.name?.toLowerCase().includes("fuel")),U=G?G.value:0,se=n.map(s=>s.revenue),he=n.map(s=>s.expenses),z=n.map(s=>s.profit),xe=n.map((s,r)=>{const $=s.month;return d.filter(M=>M.date&&M.date.substring(0,7)===$).reduce((M,I)=>M+(Number(I.kms)||0),0)});return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[e.jsx(ae,{title:"Total Revenue",value:a.totals.revenue.toLocaleString(),icon:Oe,colorClass:"from-emerald-500 to-teal-500",subLabel:"Avg/Trip",subValue:`₹${m.toLocaleString()}`,trend:n.length>=2?`₹${Math.round(n[n.length-1]?.revenue||0).toLocaleString()} last mo`:null,trendUp:n.length>=2?(n[n.length-1]?.revenue||0)>=(n[n.length-2]?.revenue||0):!0,sparkData:se}),e.jsx(ae,{title:"Total Expenses",value:a.totals.expenses.toLocaleString(),icon:ze,colorClass:"from-rose-500 to-orange-500",subLabel:"Fuel",subValue:`₹${Math.round(U).toLocaleString()}`,trend:n.length>=2?`₹${Math.round(n[n.length-1]?.expenses||0).toLocaleString()} last mo`:null,trendUp:!1,sparkData:he}),e.jsx(ae,{title:"Net Profit",value:a.totals.profit.toLocaleString(),icon:at,valueClass:a.totals.profit>=0?"text-emerald-400":"text-rose-400",colorClass:a.totals.profit>=0?"from-emerald-500 to-blue-500":"from-rose-500 to-red-600",subLabel:"Margin",subValue:`${a.totals.margin.toFixed(1)}%`,trendUp:a.totals.profit>=0,sparkData:z}),e.jsx(ae,{title:"Profit Margin",value:`${a.totals.margin.toFixed(1)}%`,icon:Ke,isCurrency:!1,colorClass:"from-violet-500 to-purple-500",subLabel:"Profitable months",subValue:`${n.filter(s=>s.profit>=0).length}/${n.length}`,trendUp:a.totals.margin>=15}),e.jsx(ae,{title:"Total Trips",value:b.toLocaleString(),icon:ke,isCurrency:!1,colorClass:"from-sky-500 to-blue-500",subLabel:"Active Drivers",subValue:W,sparkData:n.map(s=>d.filter(r=>r.date&&r.date.substring(0,7)===s.month).length)}),e.jsx(ae,{title:"Total KMs Driven",value:O.toLocaleString(),icon:qe,isCurrency:!1,colorClass:"from-amber-500 to-orange-500",subLabel:"Avg/Trip",subValue:`${fe.toLocaleString()} km`,sparkData:xe}),e.jsx(ae,{title:"Active Routes",value:S,icon:Oe,isCurrency:!1,colorClass:"from-indigo-500 to-violet-500",subLabel:"Toll Spend",subValue:`₹${Math.round(w).toLocaleString()}`}),e.jsx(ae,{title:"Active Drivers",value:W,icon:rt,isCurrency:!1,colorClass:"from-pink-500 to-rose-500",subLabel:"Employees",subValue:h.length})]}),e.jsxs(Lt,{value:E,onValueChange:re,className:"w-full",children:[e.jsxs(Rt,{className:"flex w-full overflow-x-auto hide-scrollbar sm:w-auto bg-muted/50 p-1 rounded-xl mb-8 gap-1 no-print flex-row inline-flex whitespace-nowrap scroll-smooth",children:[e.jsx(je,{value:"overview",className:"rounded-lg text-xs shrink-0",children:"Overview"}),e.jsx(je,{value:"revenue",className:"rounded-lg text-xs shrink-0",children:"Revenue"}),e.jsx(je,{value:"shipments",className:"rounded-lg text-xs shrink-0",children:"Shipments"}),e.jsx(je,{value:"expenses",className:"rounded-lg text-xs shrink-0",children:"Expenses"}),e.jsx(je,{value:"vehicles",className:"rounded-lg text-xs shrink-0",children:"Vehicles"}),e.jsx(je,{value:"payroll",className:"rounded-lg text-xs shrink-0",children:"Payroll"}),e.jsx(je,{value:"tax_ca",className:"rounded-lg text-xs shrink-0",children:"CA Tax Portal"})]}),e.jsxs(Ne,{value:"overview",className:"space-y-8 m-0 animate-in fade-in duration-300",children:[e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-2",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(_e,{className:"w-4 h-4 text-emerald-400"}),"Revenue vs Expenses Trend"]}),e.jsx(Q,{className:"text-[11px]",children:"Month-over-month financial performance"})]}),e.jsx(k,{children:e.jsx(Ht,{data:a.monthly})})]}),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-2",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(Ke,{className:"w-4 h-4 text-violet-400"}),"Expense Breakdown"]}),e.jsx(Q,{className:"text-[11px]",children:"Cost distribution by category"})]}),e.jsx(k,{children:a.category.length>0?e.jsx(ct,{data:a.category}):e.jsx("div",{className:"h-[300px] flex items-center justify-center text-muted-foreground text-xs",children:"No category data available"})})]})]}),(()=>{const s=a.trips||[],r={};s.forEach(g=>{const o=g.driver_name||"Unknown";r[o]||(r[o]={name:o,trips:0,revenue:0,kms:0,tolls:0}),r[o].trips++,r[o].revenue+=Number(g.revenue)||0,r[o].kms+=Number(g.kms)||0,r[o].tolls+=Number(g.tolls)||0});const $=Object.values(r).sort((g,o)=>o.revenue-g.revenue).slice(0,8),M=$[0]?.revenue||1,I={};s.forEach(g=>{const o=g.route||"Unknown Route";I[o]||(I[o]={route:o,trips:0,revenue:0,kms:0}),I[o].trips++,I[o].revenue+=Number(g.revenue)||0,I[o].kms+=Number(g.kms)||0});const j=Object.values(I).sort((g,o)=>o.revenue-g.revenue).slice(0,8),F=j[0]?.revenue||1,t=[...a.category||[]].sort((g,o)=>o.value-g.value).slice(0,6),c=t[0]?.value||1,K=["bg-violet-400","bg-rose-400","bg-amber-400","bg-sky-400","bg-emerald-400","bg-pink-400"];return e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-3",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(rt,{className:"w-4 h-4 text-sky-400"}),"Driver Leaderboard"]}),e.jsx(Q,{className:"text-[11px]",children:"Ranked by revenue generated"})]}),e.jsx(k,{className:"space-y-2 pt-0",children:$.length===0?e.jsx("p",{className:"text-xs text-muted-foreground text-center py-8",children:"No trip data available"}):$.map((g,o)=>e.jsxs("div",{className:"group hover:bg-muted/30 rounded-lg p-2 transition-colors",children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${o===0?"bg-amber-400 text-black":o===1?"bg-slate-400 text-black":o===2?"bg-amber-700 text-white":"bg-muted text-muted-foreground"}`,children:o+1}),e.jsx("span",{className:"text-xs font-semibold text-foreground truncate max-w-[100px]",children:g.name})]}),e.jsxs("div",{className:"text-right shrink-0",children:[e.jsxs("span",{className:"text-xs font-bold text-emerald-400",children:["₹",Math.round(g.revenue).toLocaleString()]}),e.jsxs("span",{className:"text-[10px] text-muted-foreground ml-1",children:["· ",g.trips,"T"]})]})]}),e.jsx("div",{className:"w-full bg-muted/40 rounded-full h-1",children:e.jsx("div",{className:"bg-gradient-to-r from-sky-500 to-blue-500 h-1 rounded-full transition-all",style:{width:`${g.revenue/M*100}%`}})})]},g.name))})]}),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-3",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(qe,{className:"w-4 h-4 text-amber-400"}),"Route Intelligence"]}),e.jsx(Q,{className:"text-[11px]",children:"Top routes by revenue"})]}),e.jsx(k,{className:"space-y-2 pt-0",children:j.length===0?e.jsx("p",{className:"text-xs text-muted-foreground text-center py-8",children:"No route data available"}):j.map((g,o)=>e.jsxs("div",{className:"group hover:bg-muted/30 rounded-lg p-2 transition-colors",children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsx("span",{className:"text-[11px] font-semibold text-foreground truncate max-w-[130px]",title:g.route,children:g.route}),e.jsxs("div",{className:"text-right shrink-0",children:[e.jsxs("span",{className:"text-xs font-bold text-amber-400",children:["₹",Math.round(g.revenue).toLocaleString()]}),e.jsxs("span",{className:"text-[10px] text-muted-foreground ml-1",children:["· ",g.trips,"T"]})]})]}),e.jsx("div",{className:"w-full bg-muted/40 rounded-full h-1",children:e.jsx("div",{className:"bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full transition-all",style:{width:`${g.revenue/F*100}%`}})})]},g.route))})]}),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-3",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(ze,{className:"w-4 h-4 text-rose-400"}),"Top Expense Categories"]}),e.jsx(Q,{className:"text-[11px]",children:"Where money is going"})]}),e.jsx(k,{className:"space-y-2 pt-0",children:t.length===0?e.jsx("p",{className:"text-xs text-muted-foreground text-center py-8",children:"No expense data available"}):t.map((g,o)=>e.jsxs("div",{className:"group hover:bg-muted/30 rounded-lg p-2 transition-colors",children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:`w-2 h-2 rounded-full shrink-0 ${K[o]}`}),e.jsx("span",{className:"text-[11px] font-semibold text-foreground truncate max-w-[120px]",children:g.name})]}),e.jsxs("span",{className:"text-xs font-bold text-rose-400 shrink-0",children:["₹",Math.round(g.value).toLocaleString()]})]}),e.jsx("div",{className:"w-full bg-muted/40 rounded-full h-1",children:e.jsx("div",{className:`${K[o]} h-1 rounded-full transition-all`,style:{width:`${g.value/c*100}%`}})})]},g.name))})]})]})})(),(()=>{const s=a.trips||[],r=a.monthly||[],$=s.length,M=s.reduce((o,me)=>o+(Number(me.kms)||0),0),I=$>0?Math.round(M/$):0,j=$>0?Math.round(a.totals.revenue/$):0,F=r.reduce((o,me)=>me.revenue>=(o?.revenue||0)?me:o,null);r.filter(o=>o.revenue>0).reduce((o,me)=>me.revenue<=(o?.revenue||1/0)?me:o,null);const t=r.length>0?Math.round(r.reduce((o,me)=>o+me.profit,0)/r.length):0,c=r.filter(o=>o.profit>=0).length,K=M>0?(a.totals.revenue/M).toFixed(2):0,g=[{label:"Best Month",value:F?`${F.month}`:"N/A",sub:F?`₹${Math.round(F.revenue).toLocaleString()} rev`:"",color:"text-emerald-400",icon:"🏆"},{label:"Avg Monthly Profit",value:`₹${Math.abs(t).toLocaleString()}`,sub:t>=0?"Profitable avg":"Loss avg",color:t>=0?"text-emerald-400":"text-rose-400",icon:t>=0?"📈":"📉"},{label:"Rev per KM",value:`₹${K}`,sub:`${M.toLocaleString()} total kms`,color:"text-sky-400",icon:"⛽"},{label:"Avg Trip Revenue",value:`₹${j.toLocaleString()}`,sub:`${I} km avg/trip`,color:"text-amber-400",icon:"🚚"},{label:"Profitable Months",value:`${c}/${r.length}`,sub:r.length>0?`${Math.round(c/r.length*100)}% success rate`:"",color:"text-violet-400",icon:"✅"},{label:"Total Trips",value:$.toLocaleString(),sub:`${new Set(s.map(o=>o.driver_name).filter(Boolean)).size} drivers active`,color:"text-pink-400",icon:"🗺️"}];return e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-3",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(at,{className:"w-4 h-4 text-primary"}),"Business Intelligence Insights"]}),e.jsx(Q,{className:"text-[11px]",children:"Key derived metrics from your operational data"})]}),e.jsx(k,{children:e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4",children:g.map(o=>e.jsxs("div",{className:"flex flex-col items-center text-center p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors",children:[e.jsx("span",{className:"text-2xl mb-1",children:o.icon}),e.jsx("span",{className:`text-sm font-black ${o.color} tabular-nums`,children:o.value}),e.jsx("span",{className:"text-[10px] font-bold text-foreground mt-0.5",children:o.label}),o.sub&&e.jsx("span",{className:"text-[9px] text-muted-foreground mt-0.5 leading-tight",children:o.sub})]},o.label))})})]})})(),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsx(L,{className:"pb-2",children:e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(lt,{className:"w-4 h-4 text-indigo-400"}),"Quarterly Performance Comparison"]})}),e.jsx(k,{children:e.jsx(xt,{data:a.quarterly})})]})]}),e.jsxs(Ne,{value:"revenue",className:"space-y-8 m-0 animate-in fade-in duration-300",children:[e.jsxs(v,{className:"shadow-sm border-border bg-card",children:[e.jsx(L,{children:e.jsx(R,{className:"text-base font-semibold",children:"Quarterly Revenue Comparison"})}),e.jsx(k,{children:e.jsx(xt,{data:a.quarterly})})]}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-xl font-bold mb-4 flex items-center gap-2",children:[e.jsx(Tt,{className:"w-5 h-5 text-primary"})," Detailed Monthly Breakdown"]}),e.jsx(qt,{data:a.monthly})]})]}),e.jsx(Ne,{value:"shipments",className:"space-y-6 m-0 animate-in fade-in duration-300",children:(()=>{const s=a.trips||[],r=s.length,$=s.reduce((t,c)=>t+(Number(c.kms)||0),0),M=s.reduce((t,c)=>t+(Number(c.tolls)||0),0),I=r>0?Math.round(a.totals.revenue/r):0,j={};s.forEach(t=>{const c=t.route||"Unknown";j[c]||(j[c]={route:c,trips:0,revenue:0,kms:0,tolls:0}),j[c].trips++,j[c].revenue+=Number(t.revenue)||0,j[c].kms+=Number(t.kms)||0,j[c].tolls+=Number(t.tolls)||0});const F=Object.values(j).sort((t,c)=>c.revenue-t.revenue);return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3",children:[{label:"Total Trips",value:r,icon:"🚚",color:"text-sky-400"},{label:"Total KMs",value:`${$.toLocaleString()} km`,icon:"📍",color:"text-amber-400"},{label:"Avg Rev/Trip",value:`₹${I.toLocaleString()}`,icon:"💰",color:"text-emerald-400"},{label:"Total Tolls",value:`₹${Math.round(M).toLocaleString()}`,icon:"🛣️",color:"text-rose-400"}].map(t=>e.jsxs("div",{className:"bg-muted/20 border border-border/30 rounded-xl p-4 text-center hover:bg-muted/40 transition-colors",children:[e.jsx("span",{className:"text-xl",children:t.icon}),e.jsx("div",{className:`text-lg font-black ${t.color} tabular-nums mt-1`,children:t.value}),e.jsx("div",{className:"text-[10px] text-muted-foreground font-semibold mt-0.5",children:t.label})]},t.label))}),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-2",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(qe,{className:"w-4 h-4 text-amber-400"}),"Route Performance Ranking"]}),e.jsx(Q,{className:"text-[11px]",children:"All routes ranked by total revenue"})]}),e.jsx(k,{children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-xs border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-border/40",children:[e.jsx("th",{className:"px-3 py-2.5 text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"#"}),e.jsx("th",{className:"px-3 py-2.5 text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Route"}),e.jsx("th",{className:"px-3 py-2.5 text-center text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Trips"}),e.jsx("th",{className:"px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Total KMs"}),e.jsx("th",{className:"px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Tolls"}),e.jsx("th",{className:"px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Revenue"}),e.jsx("th",{className:"px-3 py-2.5 text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider",children:"Rev/Trip"})]})}),e.jsx("tbody",{className:"divide-y divide-border/20",children:F.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"py-10 text-center text-muted-foreground",children:"No shipment data available"})}):F.map((t,c)=>e.jsxs("tr",{className:"hover:bg-muted/20 transition-colors group",children:[e.jsx("td",{className:"px-3 py-2.5",children:e.jsx("span",{className:`text-[10px] font-black w-5 h-5 inline-flex items-center justify-center rounded-full ${c===0?"bg-amber-400 text-black":c===1?"bg-slate-400 text-black":c===2?"bg-amber-700 text-white":"bg-muted text-muted-foreground"}`,children:c+1})}),e.jsx("td",{className:"px-3 py-2.5 font-semibold text-foreground max-w-[160px] truncate",title:t.route,children:t.route}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsx("span",{className:"bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full",children:t.trips})}),e.jsx("td",{className:"px-3 py-2.5 text-right tabular-nums text-muted-foreground",children:t.kms.toLocaleString()}),e.jsxs("td",{className:"px-3 py-2.5 text-right tabular-nums text-rose-400",children:["₹",Math.round(t.tolls).toLocaleString()]}),e.jsxs("td",{className:"px-3 py-2.5 text-right tabular-nums font-bold text-emerald-400",children:["₹",Math.round(t.revenue).toLocaleString()]}),e.jsxs("td",{className:"px-3 py-2.5 text-right tabular-nums text-amber-400",children:["₹",t.trips>0?Math.round(t.revenue/t.trips).toLocaleString():0]})]},t.route))})]})})})]}),e.jsxs(v,{className:"shadow-md border-border/40 bg-card",children:[e.jsxs(L,{className:"pb-2",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2",children:[e.jsx(ke,{className:"w-4 h-4 text-sky-400"}),"Recent Dispatch Logs"]}),e.jsx(Q,{className:"text-[11px]",children:"Last 20 trips sorted by date"})]}),e.jsx(k,{children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-xs border-collapse",children:[e.jsx("thead",{children:e.jsx("tr",{className:"border-b border-border/40",children:["Date","Route","Truck","Driver","KMs","Tolls","Revenue"].map(t=>e.jsx("th",{className:`px-3 py-2.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider ${["KMs","Tolls","Revenue"].includes(t)?"text-right":t==="Date"?"text-left whitespace-nowrap":"text-left"}`,children:t},t))})}),e.jsx("tbody",{className:"divide-y divide-border/20",children:s.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"py-10 text-center text-muted-foreground",children:"No shipments logged."})}):[...s].sort((t,c)=>new Date(c.date)-new Date(t.date)).slice(0,20).map(t=>e.jsxs("tr",{className:"hover:bg-muted/10 transition-colors",children:[e.jsx("td",{className:"px-3 py-2.5 whitespace-nowrap text-muted-foreground",children:t.date?new Date(t.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}):"-"}),e.jsx("td",{className:"px-3 py-2.5 font-medium text-foreground max-w-[140px] truncate",title:t.route,children:t.route||"-"}),e.jsx("td",{className:"px-3 py-2.5 font-mono text-[10px] text-sky-400",children:t.truck_number||"-"}),e.jsx("td",{className:"px-3 py-2.5 text-muted-foreground",children:t.driver_name||"-"}),e.jsx("td",{className:"px-3 py-2.5 text-right tabular-nums",children:t.kms?Number(t.kms).toLocaleString():"0"}),e.jsxs("td",{className:"px-3 py-2.5 text-right tabular-nums text-rose-400",children:["₹",t.tolls?Math.round(Number(t.tolls)).toLocaleString():"0"]}),e.jsxs("td",{className:"px-3 py-2.5 text-right font-bold text-emerald-400 tabular-nums",children:["₹",t.revenue?Math.round(Number(t.revenue)).toLocaleString():"0"]})]},t.id))})]})})})]})]})})()}),e.jsxs(Ne,{value:"expenses",className:"space-y-8 m-0 animate-in fade-in duration-300",children:[e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[e.jsxs(v,{className:"shadow-sm border-border bg-card",children:[e.jsxs(L,{children:[e.jsx(R,{className:"text-base font-semibold",children:"Expense Distribution"}),e.jsx(Q,{children:"Overall breakdown by category"})]}),e.jsx(k,{children:a.category.length>0?e.jsx(ct,{data:a.category}):e.jsx("div",{className:"h-[300px] flex items-center justify-center text-muted-foreground text-xs",children:"No category data available"})})]}),e.jsxs(v,{className:"shadow-sm border-border bg-card",children:[e.jsx(L,{children:e.jsx(R,{className:"text-base font-semibold",children:"Top Expense Categories"})}),e.jsx(k,{children:e.jsxs("div",{className:"space-y-4 mt-4",children:[a.category.slice(0,5).map((s,r)=>e.jsxs("div",{className:"flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors",children:[e.jsx("span",{className:"font-medium text-xs",children:s.name}),e.jsxs("span",{className:"font-bold tabular-nums text-xs",children:["₹",s.value.toLocaleString()]})]},r)),a.category.length===0&&e.jsx("p",{className:"text-center text-muted-foreground py-8 text-xs",children:"No expenses recorded."})]})})]})]}),e.jsxs("section",{children:[e.jsxs("h3",{className:"text-lg font-semibold mb-6 flex items-center gap-2",children:[e.jsx(Oe,{className:"w-5 h-5 text-primary"})," Category Trends"]}),e.jsx(Ut,{chartData:a.categoryMonthlyCharts})]}),e.jsxs("section",{children:[e.jsxs("h3",{className:"text-lg font-semibold mb-6 flex items-center gap-2",children:[e.jsx(lt,{className:"w-5 h-5 text-primary"})," Monthly Comparisons"]}),e.jsx(Jt,{chartData:a.categoryMonthlyCharts})]})]}),e.jsx(Ne,{value:"vehicles",className:"space-y-6 m-0 animate-in fade-in duration-500",children:be?(()=>{const s=a.trucks.find(j=>j.id===V);if(!s)return null;const r=Y(s,P),$=r.netProfit>=0,M=[{name:"Fuel Costs",value:r.fuelCost,color:"bg-sky-400"},{name:"Toll Fees",value:r.tolls,color:"bg-amber-400"},{name:"Maintenance & Spares",value:r.maintenance,color:"bg-rose-400"},{name:"EMI / Financing",value:r.emi,color:"bg-purple-400"},{name:"Driver Base Salary",value:r.driverSalary,color:"bg-indigo-400"},{name:"Insurance Premium Allocation",value:r.monthlyInsurance,color:"bg-emerald-400"},{name:"Quarterly Tax Allocation",value:r.monthlyTax,color:"bg-teal-400"}].filter(j=>j.value>0),I=r.totalExpenses||1;return e.jsxs("div",{className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-xl shadow-sm",children:[e.jsx(Me,{variant:"ghost",onClick:()=>Pe(!1),className:"text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4 text-xs font-semibold gap-2",children:"← Back to Grid"}),e.jsx("div",{className:"flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground font-medium",children:"Selected Month:"}),e.jsxs(ne,{value:P,onValueChange:pe,children:[e.jsx(oe,{className:"w-[160px] bg-slate-950 border-slate-800 text-slate-100 rounded-lg h-9",children:e.jsx(ie,{placeholder:"Month"})}),e.jsx(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:H.map(j=>e.jsx(T,{value:j,children:new Date(j.split("-")[0],j.split("-")[1]-1,1).toLocaleString("en-IN",{month:"long",year:"numeric"})},j))})]})]})})]}),e.jsxs("div",{className:"flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary/5 border border-slate-800/80",children:[e.jsx("div",{className:"p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shrink-0",children:e.jsx(ke,{className:"w-6 h-6"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-bold tracking-tight text-slate-100",children:s.truck_number}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[s.truck_name||"Generic profile"," • ",s.truck_size||"N/A"," • ",s.truck_axle||"N/A"]})]})]}),e.jsxs(v,{className:"border-slate-800 bg-slate-900 shadow-lg",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800/80",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2 text-slate-200",children:[e.jsx(Mt,{className:"w-4 h-4 text-primary"})," Configure Allocations for ",s.truck_number]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Adjust custom values below. Changes persist in your local browser storage and update the financial model."})]}),e.jsxs(k,{className:"pt-5 grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(it,{className:"text-xs font-semibold text-slate-300",children:"Annualized Insurance Premium (₹)"}),e.jsx(ue,{type:"number",value:r.annualInsurance,onChange:j=>{const F=Number(j.target.value)||0;Ve({...ce,[s.id]:F}),localStorage.setItem(`truck_annual_ins_${s.id}`,F)},className:"bg-slate-950 border-slate-800 text-slate-100 rounded-xl h-11 text-sm font-bold"}),e.jsxs("p",{className:"text-[10px] text-muted-foreground",children:["Allocated monthly cost factor: ",e.jsxs("span",{className:"text-primary font-bold",children:["₹",Math.round(r.monthlyInsurance).toLocaleString("en-IN"),"/month"]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(it,{className:"text-xs font-semibold text-slate-300",children:"Annual Quarterly Tax Allocation (₹)"}),e.jsx(ue,{type:"number",value:r.annualTax,onChange:j=>{const F=Number(j.target.value)||0;ye({...J,[s.id]:F}),localStorage.setItem(`truck_annual_tax_${s.id}`,F)},className:"bg-slate-950 border-slate-800 text-slate-100 rounded-xl h-11 text-sm font-bold"}),e.jsxs("p",{className:"text-[10px] text-muted-foreground",children:["Allocated monthly cost factor: ",e.jsxs("span",{className:"text-primary font-bold",children:["₹",Math.round(r.monthlyTax).toLocaleString("en-IN"),"/month"]})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md",children:[e.jsx(L,{className:"pb-3 border-b border-slate-800/80",children:e.jsx(R,{className:"text-xs font-semibold uppercase tracking-wider text-slate-400",children:"A. Gross Revenue"})}),e.jsxs(k,{className:"pt-5 space-y-4 flex-grow",children:[e.jsxs("div",{className:"p-4 rounded-xl bg-slate-950 border border-slate-800/85",children:[e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Total Logistics Earnings"}),e.jsxs("span",{className:"text-2xl font-extrabold text-blue-400 mt-1 block tabular-nums",children:["₹",Math.round(r.revenue).toLocaleString("en-IN")]})]}),e.jsxs("p",{className:"text-[11px] text-muted-foreground leading-relaxed",children:["Aggregated earnings from all contract trip dispatches logged under this truck during ",P,"."]})]})]}),e.jsxs(v,{className:"border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md",children:[e.jsx(L,{className:"pb-3 border-b border-slate-800/80",children:e.jsx(R,{className:"text-xs font-semibold uppercase tracking-wider text-slate-400",children:"B. Fixed Expenses"})}),e.jsxs(k,{className:"pt-5 space-y-3.5 flex-grow",children:[e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"EMI / Loan Repayments:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.emi).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Driver Base Salary:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.driverSalary).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Insurance Allocation:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.monthlyInsurance).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Quarterly Tax Allocation:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.monthlyTax).toLocaleString()]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-100",children:[e.jsx("span",{children:"Total Fixed Expenses:"}),e.jsxs("span",{className:"text-sm text-primary tabular-nums",children:["₹",Math.round(r.fixedExpenses).toLocaleString()]})]})]})]}),e.jsxs(v,{className:"border-slate-800 bg-slate-900 flex flex-col justify-between shadow-md",children:[e.jsx(L,{className:"pb-3 border-b border-slate-800/80",children:e.jsx(R,{className:"text-xs font-semibold uppercase tracking-wider text-slate-400",children:"C. Variable / Running Expenses"})}),e.jsxs(k,{className:"pt-5 space-y-3.5 flex-grow",children:[e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Fuel Costs:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.fuelCost).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Toll Fees:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.tolls).toLocaleString()]})]}),e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-slate-400",children:"Maintenance / Upkeep:"}),e.jsxs("span",{className:"font-bold text-slate-200 tabular-nums",children:["₹",Math.round(r.maintenance).toLocaleString()]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-100",children:[e.jsx("span",{children:"Total Variable Expenses:"}),e.jsxs("span",{className:"text-sm text-primary tabular-nums",children:["₹",Math.round(r.variableExpenses).toLocaleString()]})]})]})]})]}),e.jsxs(v,{className:"border-slate-800 bg-slate-900 overflow-hidden shadow-lg border-l-4 border-l-primary",children:[e.jsx(L,{className:"pb-2",children:e.jsx(R,{className:"text-xs font-bold text-muted-foreground uppercase tracking-widest",children:"Financial Calculation Equation"})}),e.jsx(k,{className:"p-6 pt-0 space-y-4",children:e.jsxs("div",{className:"p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center font-mono",children:[e.jsx("span",{className:"text-xs text-muted-foreground mb-1 block",children:"Net Profit Formula"}),e.jsx("span",{className:"text-sm sm:text-base font-bold text-primary",children:"Net Profit = Gross Revenue - (Variable Expenses + Fixed Expenses)"}),e.jsx("div",{className:"w-full border-t border-slate-800/80 my-3"}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-1.5 text-xs text-slate-200",children:[e.jsxs("span",{className:"text-blue-400 font-bold",children:["₹",Math.round(r.revenue).toLocaleString()]}),e.jsx("span",{className:"text-muted-foreground font-bold",children:"-"}),e.jsx("span",{children:"("}),e.jsxs("span",{className:"text-slate-100 font-bold",children:["₹",Math.round(r.variableExpenses).toLocaleString()]}),e.jsx("span",{className:"text-muted-foreground",children:"+"}),e.jsxs("span",{className:"text-slate-100 font-bold",children:["₹",Math.round(r.fixedExpenses).toLocaleString()]}),e.jsx("span",{children:")"}),e.jsx("span",{className:"text-muted-foreground font-bold",children:"="}),e.jsxs("span",{className:"font-bold text-sm "+($?"text-emerald-400":"text-rose-400"),children:["₹",Math.round(r.netProfit).toLocaleString("en-IN")]})]})]})})]}),e.jsxs(v,{className:"border-slate-800 bg-slate-900 shadow-lg",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800/80",children:[e.jsxs(R,{className:"text-sm font-bold flex items-center gap-2 text-slate-200",children:[e.jsx(Ke,{className:"w-4 h-4 text-primary"})," Cash Leakage Analysis"]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Percentage share of individual expense ledgers to identify core cost leakages."})]}),e.jsx(k,{className:"p-5 space-y-4",children:M.length===0?e.jsxs("div",{className:"text-center py-6 text-muted-foreground text-xs",children:["No expenses recorded in ",P,"."]}):e.jsx("div",{className:"space-y-4",children:M.map((j,F)=>{const t=j.value/I*100,c=t>30;return e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-semibold text-slate-200",children:j.name}),c&&e.jsx("span",{className:"text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse",children:"Cost Leakage Risk"})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("span",{className:"font-bold text-slate-100 tabular-nums",children:["₹",Math.round(j.value).toLocaleString()]}),e.jsxs("span",{className:"text-[10px] text-muted-foreground ml-1.5 tabular-nums",children:["(",t.toFixed(1),"%)"]})]})]}),e.jsx("div",{className:"w-full bg-slate-950 rounded-full h-2",children:e.jsx("div",{className:"h-2 rounded-full "+(c?"bg-rose-500":"bg-primary"),style:{width:`${t}%`}})})]},F)})})})]})]})})():e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800/85 p-5 rounded-2xl shadow-sm",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-xl font-bold tracking-tight text-foreground flex items-center gap-2",children:[e.jsx(ke,{className:"w-5 h-5 text-primary"}),"Vehicle-by-Vehicle Profitability Grid"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Select a vehicle card below to inspect its detailed month-by-month financial breakdown."})]}),e.jsxs("div",{className:"flex items-center gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0",children:[e.jsx("span",{className:"text-xs text-muted-foreground pl-2 font-medium",children:"Reporting Month:"}),e.jsxs(ne,{value:P,onValueChange:pe,children:[e.jsx(oe,{className:"w-[180px] bg-slate-900 border-slate-800 text-slate-100 rounded-lg h-9",children:e.jsx(ie,{placeholder:"Month"})}),e.jsx(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:H.map(s=>e.jsx(T,{value:s,children:new Date(s.split("-")[0],s.split("-")[1]-1,1).toLocaleString("en-IN",{month:"long",year:"numeric"})},s))})]})]})]}),a.trucks.length===0?e.jsx(v,{className:"p-12 text-center border-dashed border-slate-800 bg-slate-900",children:e.jsx("p",{className:"text-muted-foreground text-xs",children:"No vehicles found in the system."})}):e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:a.trucks.map(s=>{const r=s.body_images&&s.body_images.length>0,$=r?Te.files.getUrl(s,s.body_images[0]):null,M=Y(s,P),I=M.netProfit>=0;return e.jsxs("div",{onClick:()=>{_(s.id),Pe(!0)},className:"group bg-slate-900 border border-slate-800/80 hover:border-primary/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer",children:[e.jsxs("div",{className:"h-44 w-full relative bg-slate-950 overflow-hidden",children:[r?e.jsx("img",{src:$,alt:s.truck_name||"Truck body",className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"}):e.jsxs("div",{className:"w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-slate-950 to-indigo-500/5 relative",children:[e.jsx(ke,{className:"w-12 h-12 text-primary/10 mb-2"}),e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase font-semibold tracking-widest opacity-60",children:"Fleet Vehicle"})]}),e.jsx("div",{className:"absolute top-3 left-3 z-10",children:e.jsx("span",{className:`text-[9px] font-bold px-2 py-0.5 rounded-md border ${s.ownership_type==="Attached"?"bg-orange-500/10 text-orange-400 border-orange-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"}`,children:s.ownership_type||"Owned"})})]}),e.jsxs("div",{className:"p-5 flex flex-col justify-between flex-grow space-y-4",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1.5",children:[e.jsx("div",{className:"p-1 bg-primary/10 rounded text-primary",children:e.jsx(ke,{className:"w-3.5 h-3.5"})}),e.jsx("h3",{className:"font-bold text-sm text-slate-100 group-hover:text-primary transition-colors truncate",children:s.truck_name||"Unnamed Vehicle"})]}),e.jsx("p",{className:"text-xs font-mono font-bold text-slate-400 tracking-wider",children:s.truck_number})]}),e.jsxs("div",{className:"p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-between items-center shadow-inner",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[8px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Net Monthly Profit"}),e.jsxs("span",{className:`text-xl font-extrabold tabular-nums block mt-0.5 ${I?"text-emerald-400":"text-rose-400"}`,children:[I?"+":"","₹",Math.round(M.netProfit).toLocaleString("en-IN")]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-[8px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Revenue"}),e.jsxs("span",{className:"text-xs font-bold text-slate-200 tabular-nums",children:["₹",Math.round(M.revenue).toLocaleString("en-IN")]})]})]})]})]},s.id)})})]})}),e.jsxs(Ne,{value:"payroll",className:"space-y-8 m-0 animate-in fade-in duration-300",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:[e.jsx(ae,{title:"Total Payroll Disbursed",value:p.reduce((s,r)=>s+(Number(r.net_salary)||0),0).toLocaleString(),icon:ze}),e.jsx(ae,{title:"Total Bonuses Awarded",value:p.reduce((s,r)=>s+(Number(r.trip_bonus)||0),0).toLocaleString(),icon:_e}),e.jsx(ae,{title:"Total Deductions Applied",value:p.reduce((s,r)=>s+(Number(r.deductions)||0),0).toLocaleString(),icon:et})]}),e.jsxs(v,{className:"shadow-sm border-border bg-card",children:[e.jsxs(L,{children:[e.jsx(R,{className:"text-base font-semibold",children:"Payroll Ledger"}),e.jsx(Q,{children:"Monthly payouts and mileage bonus records"})]}),e.jsx(k,{children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-xs text-left text-muted-foreground border-collapse",children:[e.jsx("thead",{className:"text-[10px] uppercase tracking-wider bg-muted/20 border-b border-border/50",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground",children:"Month"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground",children:"Employee/Driver"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground text-right",children:"Base Salary"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground text-right",children:"Mileage Bonus"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground text-right",children:"Deductions"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground text-right",children:"Net Payout"}),e.jsx("th",{className:"px-4 py-2.5 font-semibold text-foreground text-center",children:"Status"})]})}),e.jsx("tbody",{className:"divide-y divide-border/20",children:p.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"px-4 py-8 text-center text-muted-foreground",children:"No payroll records found."})}):p.map(s=>e.jsxs("tr",{className:"hover:bg-muted/5 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 font-medium text-foreground whitespace-nowrap",children:s.month||"-"}),e.jsx("td",{className:"px-4 py-2.5",children:s.driver_name||"-"}),e.jsxs("td",{className:"px-4 py-2.5 text-right tabular-nums",children:["₹",(Number(s.base_salary)||0).toLocaleString()]}),e.jsxs("td",{className:"px-4 py-2.5 text-right text-success font-semibold tabular-nums",children:["₹",(Number(s.trip_bonus)||0).toLocaleString()]}),e.jsxs("td",{className:"px-4 py-2.5 text-right text-destructive font-medium tabular-nums",children:["₹",(Number(s.deductions)||0).toLocaleString()]}),e.jsxs("td",{className:"px-4 py-2.5 text-right font-bold text-foreground tabular-nums",children:["₹",(Number(s.net_salary)||0).toLocaleString()]}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsx("span",{className:`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${s.status==="paid"?"bg-success/15 text-success border border-success/20":"bg-warning/15 text-warning border border-warning/20"}`,children:s.status||"pending"})})]},s.id))})]})})})]})]}),e.jsx(Ne,{value:"tax_ca",className:"space-y-8 m-0 animate-in fade-in duration-500",children:e.jsx(Xt,{startDate:f.startDate,endDate:f.endDate})})]})]})})(),e.jsx(Vt,{isOpen:B,onOpenChange:x,defaultRecipient:y.recipient,defaultSubject:y.subject,defaultBody:y.body,richHtmlContent:y.html,contextLabel:y.label})]})};export{us as default};
