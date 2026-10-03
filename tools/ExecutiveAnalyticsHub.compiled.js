

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
