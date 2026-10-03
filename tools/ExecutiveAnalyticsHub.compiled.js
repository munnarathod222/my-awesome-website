

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
    const handleUpdate = () => {
      try {
        const tr = localStorage.getItem("jc_trips");
        if (tr) setTrips(JSON.parse(tr));
        const ex = localStorage.getItem("jc_expenses");
        if (ex) setExpenses(JSON.parse(ex));
        const tk = localStorage.getItem("jc_trucks");
        if (tk) setTrucks(JSON.parse(tk));
        const em = localStorage.getItem("jc_employees");
        if (em) setEmployees(JSON.parse(em));
        const cl = localStorage.getItem("jc_clients");
        if (cl) setClients(JSON.parse(cl));
      } catch (err) {
        console.warn("Sync error:", err);
      }
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("jc-store-update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("jc-store-update", handleUpdate);
    };
  }, []);
  const [selectedRange, setSelectedRange] = c.useState("All");
  const [startDate, setStartDate] = c.useState("2026-08-01");
  const [endDate, setEndDate] = c.useState("2026-09-30");
  const [viewType, setViewType] = c.useState("Monthly View");
  const [selectedClient, setSelectedClient] = c.useState("all");
  const [searchQuery, setSearchQuery] = c.useState("");
  const [activeTooltipDay, setActiveTooltipDay] = c.useState(10);
  const [revExpView, setRevExpView] = c.useState("Monthly");
  const [tripVolView, setTripVolView] = c.useState("Daily");
  const [fuelTollView, setFuelTollView] = c.useState("Monthly");
  const [isExportMenuOpen, setIsExportMenuOpen] = c.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = c.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = c.useState(false);
  const [drilldownModal, setDrilldownModal] = c.useState({
    isOpen: false,
    type: "",
    title: "",
    subtitle: "",
    data: null
  });
  const clientsList = c.useMemo(() => {
    const map = {};
    trips.forEach((t) => {
      const cName = t.client_name || clients.find((c) => c.id === t.client_id)?.name || "Direct Commercial Client";
      const cId = t.client_id || cName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (!map[cId]) {
        map[cId] = {
          id: cId,
          name: cName,
          revenue: 0,
          expenses: 0,
          trips: 0,
          contractType: cName.includes("Amazon") ? "Dedicated SXL 32FT" : cName.includes("Flipkart") ? "Scheduled Linehaul" : "Annual Dedicated",
          outstanding: 0,
          dso: "15 Days"
        };
      }
      const rev = Number(t.revenue || 0);
      map[cId].revenue += rev;
      map[cId].expenses += Number(t.total_expenses || (t.fuel_cost || 0) + (t.toll_cost || 0) + (t.driver_allowance || 0));
      map[cId].trips += 1;
      if (t.clientPaymentStatus === "Pending" || t.status === "Delivered") {
        map[cId].outstanding += rev;
      }
    });
    const list = Object.values(map).map((c) => {
      const profit = c.revenue - c.expenses;
      const margin = c.revenue > 0 ? (profit / c.revenue * 100).toFixed(1) + "%" : "0.0%";
      return { ...c, margin };
    });
    const totalRev = list.reduce((a, b) => a + b.revenue, 0);
    const totalExp = expenses.reduce((a, b) => a + Number(b.amount || 0), 0) || list.reduce((a, b) => a + b.expenses, 0);
    const totalProfit = totalRev - totalExp;
    const totalMargin = totalRev > 0 ? (totalProfit / totalRev * 100).toFixed(1) + "%" : "0.0%";
    const totalTrips = trips.length;
    const totalOutstanding = list.reduce((a, b) => a + b.outstanding, 0);
    return [
      { id: "all", name: "All Clients (Fleet Wide)", revenue: totalRev, expenses: totalExp, trips: totalTrips, margin: totalMargin, dso: "14 Days", outstanding: totalOutstanding, contractType: "Annual Dedicated" },
      ...list
    ];
  }, [trips, expenses, clients]);
  const allRoutesData = c.useMemo(() => {
    const map = {};
    trips.forEach((t, idx) => {
      const origin = t.origin || "Hyderabad";
      const dest = t.destination || (t.route_name ? t.route_name.split(" to ")[1] : "Warangal");
      const routeStr = origin + " \u2794 " + dest;
      const rKey = routeStr.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (!map[rKey]) {
        map[rKey] = {
          id: idx + 1,
          route: routeStr,
          highway: routeStr.includes("Warangal") ? "NH163 Regional Corridor" : routeStr.includes("Vijayawada") ? "NH65 Vijayawada Expy" : "NH44 South Corridor",
          trips: 0,
          distance: 0,
          revenue: 0,
          fuelCost: 0,
          tollCost: 0,
          topClient: t.client_name || "Amazon Logistics India",
          color: "emerald"
        };
      }
      map[rKey].trips += 1;
      map[rKey].distance += Number(t.distance_kms || 150);
      map[rKey].revenue += Number(t.revenue || 0);
      map[rKey].fuelCost += Number(t.fuel_cost || 0);
      map[rKey].tollCost += Number(t.toll_cost || 0);
    });
    return Object.values(map).map((r) => {
      const exp = r.fuelCost + r.tollCost;
      const margin = r.revenue > 0 ? ((r.revenue - exp) / r.revenue * 100).toFixed(1) + "%" : "0.0%";
      return { ...r, margin };
    });
  }, [trips]);
  const fleetTrucks = c.useMemo(() => {
    return trucks.map((trk, i) => {
      const num = trk.truck_number || trk.registration_number || "TRK-00" + (i + 1);
      const lastTrip = trips.filter((t) => (t.truck_number || "").replace(/\s+/g, "") === num.replace(/\s+/g, "")).pop();
      return {
        number: num,
        brand: trk.make_model || trk.brand || (num.includes("TG12") ? "Ashok Leyland 3118" : "Tata Signa 2823.K"),
        type: trk.type || (num.includes("TG12") ? "Multi-Axle (8x2)" : "SXL 32 FT Box"),
        odometer: trk.current_odometer || trk.odometer || (num.includes("TG12") ? 142500 : 98400),
        driver: lastTrip?.driver_name || trk.driver_name || (i === 0 ? "Vinod Kumar Rathod" : "Suresh Rao"),
        status: lastTrip?.status === "In Transit" ? "In Transit" : lastTrip?.status === "Scheduled" ? "Ready for Dispatch" : "Available",
        location: lastTrip?.destination || trk.location || (i === 0 ? "Hyderabad Central" : "Warangal Hub"),
        health: "Optimal & Inspected"
      };
    });
  }, [trucks, trips]);
  const fleetDrivers = c.useMemo(() => {
    return employees.map((drv, i) => {
      const drvTrips = trips.filter((t) => t.driver_name === drv.name);
      return {
        name: drv.name,
        exp: drv.experience || (i === 0 ? "10 Yrs" : i === 1 ? "12 Yrs" : "8 Yrs"),
        mileage: i === 0 ? "4.25 km/l" : i === 1 ? "4.18 km/l" : "3.95 km/l",
        score: i === 0 ? "99.2/100" : i === 1 ? "98.5/100" : "96.0/100",
        trips: drvTrips.length || (i === 0 ? 4 : i === 1 ? 3 : 1),
        truck: drvTrips[0]?.truck_number || (i === 0 ? "TG12U2637" : "TS29AB1999"),
        status: i === 0 ? "Lead Master Driver \u2B50" : i === 1 ? "Senior Benchmark Driver \u2B50" : "Fleet Operations Relief",
        harshBraking: i === 0 ? 0 : 1,
        idleHours: "1.2h/wk"
      };
    });
  }, [employees, trips]);
  const fleetAlerts = c.useMemo(() => {
    const alerts = [];
    const scheduled = trips.filter((t) => t.status === "Scheduled");
    if (scheduled.length > 0) {
      alerts.push({
        id: "alt_sched",
        severity: "info",
        icon: "\u{1F69B}",
        title: `${scheduled.length} trips scheduled for upcoming dispatch`,
        time: "Today",
        category: "Trip Operations",
        actionTitle: "Review Dispatch Orders",
        description: `Trips ${scheduled.map((s) => s.trip_number).join(", ")} scheduled with confirmed freights.`
      });
    }
    const inTransit = trips.filter((t) => t.status === "In Transit");
    if (inTransit.length > 0) {
      alerts.push({
        id: "alt_transit",
        severity: "medium",
        icon: "\u26A0\uFE0F",
        title: `${inTransit[0].trip_number} in transit on ${inTransit[0].origin} \u2794 ${inTransit[0].destination}`,
        time: "Live",
        category: "Highway Transit",
        actionTitle: "Open Telematics Tracking",
        description: `Driver ${inTransit[0].driver_name} driving ${inTransit[0].truck_number}. Real-time tracking active.`
      });
    }
    const tyreExp = expenses.find((e) => (e.subcategory || "").toLowerCase().includes("tyre"));
    if (tyreExp) {
      alerts.push({
        id: "alt_tyre",
        severity: "info",
        icon: "\u{1F527}",
        title: `Tyre replacement logged for ${tyreExp.vehicle_number} (Voucher ${tyreExp.expense_number})`,
        time: tyreExp.bill_date || "Recent",
        category: "Fleet Maintenance",
        actionTitle: "View Maintenance Invoice",
        description: `${tyreExp.description} - Amount: \u20B9${Number(tyreExp.amount).toLocaleString("en-IN")}, Vendor: ${tyreExp.vendor_name}.`
      });
    }
    const tollExp = expenses.find((e) => (e.category || "").toLowerCase().includes("toll") || (e.subcategory || "").toLowerCase().includes("fastag"));
    if (tollExp) {
      alerts.push({
        id: "alt_toll",
        severity: "medium",
        icon: "\u{1F4B3}",
        title: `FASTag Toll Clearance Verified (${tollExp.vehicle_number})`,
        time: tollExp.bill_date || "Recent",
        category: "FASTag Wallets",
        actionTitle: "Check NETC Fastag Portal",
        description: `Cleared toll voucher ${tollExp.expense_number} at ${tollExp.location} (\u20B9${tollExp.amount}).`
      });
    }
    const itcExp = expenses.filter((e) => e.gst_input_credit_eligible === "Yes");
    const totalITC = itcExp.reduce((a, b) => a + (Number(b.total_gst) || 0), 0);
    if (totalITC > 0) {
      alerts.push({
        id: "alt_itc",
        severity: "info",
        icon: "\u{1F4CB}",
        title: `GST Input Tax Credit (ITC) Available: \u20B9${totalITC.toLocaleString("en-IN")}`,
        time: "This Month",
        category: "Tax & Compliance",
        actionTitle: "File GSTR-2B Claim",
        description: `Total \u20B9${totalITC.toLocaleString("en-IN")} eligible GST input credits on tyre replacements and vehicle parts.`
      });
    }
    return alerts;
  }, [trips, expenses]);
  const tripVolumeData = c.useMemo(() => {
    const days = new Array(31).fill(0);
    trips.forEach((t) => {
      const d = t.start_date ? new Date(t.start_date).getDate() : 1;
      if (d >= 1 && d <= 31) days[d - 1] += 1;
    });
    return days.map((val, idx) => val > 0 ? val : idx % 3 === 0 ? 1 : 0);
  }, [trips]);
  const sampleTripsManifest = c.useMemo(() => {
    return trips.map((t) => ({
      lrNo: t.invoice_number || "LR-2026-" + (t.trip_number || t.id),
      truck: t.truck_number,
      driver: t.driver_name,
      client: t.client_name,
      route: (t.origin || "Hyderabad") + " \u2794 " + (t.destination || "Warangal"),
      weight: "24.5 Tons",
      freight: Number(t.revenue || 0),
      status: t.status,
      onTime: true
    }));
  }, [trips]);
  const currentMetrics = c.useMemo(() => {
    let filteredTrips = trips;
    if (selectedClient !== "all") {
      filteredTrips = trips.filter((t) => t.client_id === selectedClient || t.client_name && t.client_name.toLowerCase().includes(selectedClient.replace("cli_", "")));
    }
    const deliveredTrips = filteredTrips.filter((t) => t.status === "Completed" || t.status === "Delivered");
    const rev = deliveredTrips.reduce((a, b) => a + Number(b.revenue || 0), 0);
    const exp = selectedClient === "all" ? expenses.reduce((a, b) => a + Number(b.amount || 0), 0) : filteredTrips.reduce((a, b) => a + Number(b.total_expenses || 0), 0);
    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev * 100).toFixed(1) + "%" : "0.0%";
    const totalDistance = filteredTrips.reduce((a, b) => a + Number(b.distance_kms || 0), 0);
    const activeDrivers = new Set(filteredTrips.map((t) => t.driver_name).filter(Boolean)).size;
    return {
      revenue: rev,
      expenses: exp,
      netProfit: profit,
      margin,
      trips: filteredTrips.length,
      kms: totalDistance.toFixed(3),
      utilization: "100%",
      drivers: activeDrivers || employees.length
    };
  }, [trips, expenses, employees, selectedClient, selectedRange]);
  const expenseBreakdown = c.useMemo(() => {
    let fuel = 0, maint = 0, driver = 0, toll = 0, ops = 0, admin = 0;
    expenses.forEach((e) => {
      const cat = (e.category || "").toLowerCase();
      const sub = (e.subcategory || "").toLowerCase();
      const amt = Number(e.amount || 0);
      if (cat.includes("fuel") || sub.includes("diesel")) fuel += amt;
      else if (cat.includes("maint") || sub.includes("tyre") || sub.includes("repair") || sub.includes("oil")) maint += amt;
      else if (cat.includes("driver") || sub.includes("allowance") || sub.includes("stay") || sub.includes("accommodation")) driver += amt;
      else if (cat.includes("toll") || sub.includes("fastag")) toll += amt;
      else if (cat.includes("operat") || sub.includes("weighbridge")) ops += amt;
      else admin += amt;
    });
    const total = fuel + maint + driver + toll + ops + admin || 1;
    return {
      fuel,
      maint,
      driver,
      toll,
      ops,
      admin,
      total,
      fuelPct: (fuel / total * 100).toFixed(1),
      maintPct: (maint / total * 100).toFixed(1),
      driverPct: (driver / total * 100).toFixed(1),
      tollPct: (toll / total * 100).toFixed(1),
      opsPct: (ops / total * 100).toFixed(1),
      adminPct: (admin / total * 100).toFixed(1)
    };
  }, [expenses]);
  const filteredRoutes = c.useMemo(() => {
    if (!searchQuery) return allRoutesData.slice(0, 5);
    return allRoutesData.filter(
      (r) => r.route.toLowerCase().includes(searchQuery.toLowerCase()) || r.topClient.toLowerCase().includes(searchQuery.toLowerCase()) || r.highway.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allRoutesData, searchQuery]);
  const handleRangeClick = (range) => {
    setSelectedRange(range);
    if (range === "7D") {
      setStartDate("2026-09-24");
      setEndDate("2026-09-30");
    } else if (range === "30D") {
      setStartDate("2026-09-01");
      setEndDate("2026-09-30");
    } else if (range === "3M") {
      setStartDate("2026-07-01");
      setEndDate("2026-09-30");
    } else if (range === "6M") {
      setStartDate("2026-04-01");
      setEndDate("2026-09-30");
    } else if (range === "1Y") {
      setStartDate("2025-10-01");
      setEndDate("2026-09-30");
    } else if (range === "All") {
      setStartDate("2026-01-01");
      setEndDate("2026-12-31");
    }
  };
  const closeDrilldown = () => {
    setDrilldownModal({ isOpen: false, type: "", title: "", subtitle: "", data: null });
  };
  return /* @__PURE__ */ e.jsxs("div", { className: "space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100 relative", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4", children: [
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsxs("h1", { className: "text-3xl font-black tracking-tight text-white flex items-center gap-3", children: [
          /* @__PURE__ */ e.jsx("span", { children: "Analytics Hub" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: "Live Fleet Command" })
        ] }),
        /* @__PURE__ */ e.jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Financial and operational performance overview for your logistics business." })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3 relative", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "relative min-w-[260px] sm:min-w-[300px]", children: [
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm", children: "\u{1F50D}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search trips, drivers, vehicles, routes...",
              className: "w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            }
          ),
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none", children: /* @__PURE__ */ e.jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded", children: "\u2318K" }) })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsNotificationsOpen(!isNotificationsOpen),
            className: "relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer",
            title: "View Active Fleet Notifications",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u{1F514}" }),
              /* @__PURE__ */ e.jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs", children: fleetAlerts.length })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            onClick: () => setIsProfileModalOpen(true),
            className: "flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition",
            children: [
              /* @__PURE__ */ e.jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs", children: "JB" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-left hidden sm:block", children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-xs font-bold text-white leading-tight", children: "Vinod Kumar Rathod" }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400 leading-tight", children: "Fleet Manager" })
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
              className: "px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F4E5}" }),
                /* @__PURE__ */ e.jsx("span", { children: "Export Report" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] opacity-70", children: "\u25BC" })
              ]
            }
          ),
          isExportMenuOpen && /* @__PURE__ */ e.jsxs("div", { className: "absolute right-0 top-12 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in zoom-in-95 duration-150", children: [
            /* @__PURE__ */ e.jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider", children: "Export Options" }),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  alert("Generating Excel Spreadsheet (.xlsx): 314 March Trips with Full Revenue, Fuel, Tolls & Margin Ledger...");
                },
                className: "w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-emerald-400", children: "\u{1F4CA}" }),
                  " Download Excel (.xlsx)"
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  alert("Generating Audit Executive PDF (.pdf) with P&L Charts and Corridor Matrix...");
                },
                className: "w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-rose-400", children: "\u{1F4C4}" }),
                  " Download PDF Report (.pdf)"
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  const summary = `*JAI BHAVANI CARGO - EXECUTIVE FLEET ANALYTICS*
\u2022 Period: ${startDate} to ${endDate}
\u2022 Client Scope: ${clientsList.find((c) => c.id === selectedClient)?.name}
\u2022 Total Revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")}
\u2022 Total Expenses: \u20B9${currentMetrics.expenses.toLocaleString("en-IN")}
\u2022 Net Profit: \u20B9${currentMetrics.netProfit.toLocaleString("en-IN")} (${currentMetrics.margin} Margin)
\u2022 Total Trips: ${currentMetrics.trips} trips (${currentMetrics.kms} km)
\u2022 Fleet Utilization: ${currentMetrics.utilization}
\u2022 Active Drivers: ${currentMetrics.drivers}`;
                  navigator.clipboard.writeText(summary);
                  alert("Executive P&L summary copied to clipboard for WhatsApp/Email sharing!");
                },
                className: "w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-blue-400", children: "\u{1F4CB}" }),
                  " Copy Summary to Clipboard"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    isNotificationsOpen && /* @__PURE__ */ e.jsxs("div", { className: "absolute right-0 top-16 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-2 mb-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-sm", children: "\u{1F514}" }),
          /* @__PURE__ */ e.jsxs("span", { className: "text-xs font-bold text-white", children: [
            "Active Fleet Notifications (",
            fleetAlerts.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsNotificationsOpen(false),
            className: "text-xs text-slate-400 hover:text-white cursor-pointer",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "space-y-2 max-h-80 overflow-y-auto pr-1", children: fleetAlerts.map((alt) => /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => {
            setIsNotificationsOpen(false);
            setDrilldownModal({
              isOpen: true,
              type: "alert_action",
              title: alt.title,
              subtitle: alt.category,
              data: alt
            });
          },
          className: "p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold text-slate-200", children: [
              /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ e.jsx("span", { children: alt.icon }),
                " ",
                alt.title
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: alt.time })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-blue-400 mt-1 font-semibold flex items-center gap-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u26A1 Action:" }),
              " ",
              alt.actionTitle
            ] })
          ]
        },
        alt.id
      )) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "START" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: startDate,
              onChange: (e) => setStartDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 font-bold", children: "\u2794" }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "END" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "VIEW" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: viewType,
              onChange: (e) => setViewType(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "Daily View", className: "bg-slate-900", children: "Daily View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Weekly View", className: "bg-slate-900", children: "Weekly View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Monthly View", className: "bg-slate-900", children: "Monthly View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Quarterly View", className: "bg-slate-900", children: "Quarterly View" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-emerald-400", children: "CLIENT" }),
          /* @__PURE__ */ e.jsx(
            "select",
            {
              value: selectedClient,
              onChange: (e) => setSelectedClient(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[190px] truncate",
              children: clientsList.map((c) => /* @__PURE__ */ e.jsx("option", { value: c.id, className: "bg-slate-900", children: c.name }, c.id))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ e.jsx("div", { className: "bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1", children: ["7D", "30D", "3M", "6M", "1Y", "Custom"].map((pill) => /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => handleRangeClick(pill),
            className: `px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${selectedRange === pill ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`,
            children: pill
          },
          pill
        )) }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setSelectedRange("30D");
              setStartDate("2024-03-01");
              setEndDate("2024-03-31");
              setSelectedClient("all");
            },
            className: "px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u{1F504}" }),
              " Reset"
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              alert(`Filters applied! Period: ${selectedRange} (${startDate} to ${endDate}) for Client: ${clientsList.find((c) => c.id === selectedClient)?.name}. Total revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")}`);
            },
            className: "px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u26A1" }),
              " Apply Filters"
            ]
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
            title: "Revenue Analytics & Corporate Invoicing Ledger",
            subtitle: `Total Revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")} across ${currentMetrics.trips} completed trips`,
            data: { clients: clientsList, totalRev: currentMetrics.revenue }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Revenue Analytics",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u20B9" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Revenue" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-emerald-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +18.4%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,28 Q15,35 30,22 T60,18 T85,8 T100,5", fill: "none", stroke: "#10b981", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "5", r: "3", fill: "#10b981" })
              ] }) })
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
            title: "Expense Audit & Cost Center Breakdown",
            subtitle: `Total Operating Spend: \u20B9${currentMetrics.expenses.toLocaleString("en-IN")} (Fuel, Tolls, Workshop & Crew)`,
            data: { expenses: currentMetrics.expenses }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-rose-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Expenses Audit",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F4B3}" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Expenses" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-rose-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.expenses.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2198 -6.2%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,15 Q20,10 40,25 T70,18 T90,30 T100,28", fill: "none", stroke: "#f43f5e", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "28", r: "3", fill: "#f43f5e" })
              ] }) })
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
            title: "Net Margin & Bottom-Line Profitability",
            subtitle: `EBITDA & Retained Profit: \u20B9${currentMetrics.netProfit.toLocaleString("en-IN")} (${currentMetrics.margin} Margin)`,
            data: { profit: currentMetrics.netProfit, margin: currentMetrics.margin }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Profitability Matrix",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F4CA}" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Net Profit" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-cyan-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.netProfit.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-cyan-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +42.7%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,32 Q25,30 45,22 T75,15 T90,8 T100,4", fill: "none", stroke: "#06b6d4", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "4", r: "3", fill: "#06b6d4" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "margin",
            title: "Profit Margin Trajectory & Inflation Hedge",
            subtitle: `Overall Fleet Margin: ${currentMetrics.margin} (Profitable corridors: 10/12)`,
            data: { margin: currentMetrics.margin }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-purple-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Margin Trajectory",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "%" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Profit Margin" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-purple-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.margin }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-purple-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +2.1%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,28 Q30,22 55,20 T80,12 T100,8", fill: "none", stroke: "#a855f7", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "8", r: "3", fill: "#a855f7" })
              ] }) })
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
            title: "Fleet Trip Logs & Dispatch Manifest (314 Trips)",
            subtitle: `${currentMetrics.trips} Trips recorded: 295 Completed, 12 In-Transit, 7 Delayed`,
            data: { trips: currentMetrics.trips }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-blue-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Trip Manifest",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F69B}" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Trips" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-blue-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.trips }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +12.5%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,30 Q20,32 40,20 T70,16 T90,10 T100,6", fill: "none", stroke: "#3b82f6", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "6", r: "3", fill: "#3b82f6" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "kms",
            title: "GPS & Odometer Distance Telematics (64,775 KM)",
            subtitle: `${currentMetrics.kms} km logged: 58,400 km Loaded vs 6,375 km Deadhead Return`,
            data: { kms: currentMetrics.kms }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-amber-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Distance Analytics",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F6E3}\uFE0F" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total KMs Driven" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-amber-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.kms }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +9.8%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,25 Q25,28 50,18 T80,14 T100,9", fill: "none", stroke: "#f59e0b", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "9", r: "3", fill: "#f59e0b" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "div",
        {
          onClick: () => setDrilldownModal({
            isOpen: true,
            type: "utilization",
            title: "Fleet Asset Utilization & Live Vehicle Fleet (12 Trucks)",
            subtitle: `Overall Fleet Utilization: ${currentMetrics.utilization} (Active highway transit: 9, Loading: 2, Workshop: 1)`,
            data: { util: currentMetrics.utilization, trucks: fleetTrucks }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-teal-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Utilization Breakdown",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u23F1\uFE0F" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Fleet Utilization" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-teal-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.utilization }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-teal-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2197 +6.3%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,28 Q30,30 55,20 T80,15 T100,10", fill: "none", stroke: "#14b8a6", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "10", r: "3", fill: "#14b8a6" })
              ] }) })
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
            title: "Driver Rostering & Performance Matrix (10 Crew)",
            subtitle: `${currentMetrics.drivers} Active Drivers rostered across long-haul national corridors`,
            data: { drivers: fleetDrivers }
          }),
          className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-indigo-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group",
          title: "Click to Deep-Drill Driver Matrix",
          children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F465}" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Active Drivers" })
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 group-hover:text-indigo-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.drivers }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { children: "\u2192 0%" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ e.jsx("path", { d: "M0,20 Q30,18 60,20 T100,20", fill: "none", stroke: "#6366f1", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "20", r: "3", fill: "#6366f1" })
              ] }) })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-cyan-400 text-sm", children: "\u{1F4C8}" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Revenue vs Expenses" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: revExpView,
                  onChange: (e) => setRevExpView(e.target.value),
                  className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "Daily", children: "Daily \u2304" }),
                    /* @__PURE__ */ e.jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                    /* @__PURE__ */ e.jsx("option", { value: "Monthly", children: "Monthly \u2304" })
                  ]
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDrilldownModal({
                    isOpen: true,
                    type: "revenue",
                    title: "Monthly Variance Audit: Revenue vs Operational Expenses",
                    subtitle: `Revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")} vs Expenses: \u20B9${currentMetrics.expenses.toLocaleString("en-IN")}`,
                    data: null
                  }),
                  className: "text-slate-500 hover:text-white cursor-pointer px-1 text-xs",
                  children: "\xB7\xB7\xB7"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "revenue",
                  title: "Revenue Ledger & Client Breakdown",
                  subtitle: `Total Revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")}`,
                  data: null
                }),
                className: "flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Revenue" }),
                  /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-white font-mono", children: [
                    "\u20B9",
                    currentMetrics.revenue.toLocaleString("en-IN")
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
                  title: "Expense Vouchers & Fastag Deductions",
                  subtitle: `Total Expenses: \u20B9${currentMetrics.expenses.toLocaleString("en-IN")}`,
                  data: null
                }),
                className: "flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-purple-500 shadow-xs shadow-purple-500" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Expenses" }),
                  /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-white font-mono", children: [
                    "\u20B9",
                    currentMetrics.expenses.toLocaleString("en-IN")
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            onClick: () => setDrilldownModal({
              isOpen: true,
              type: "revenue",
              title: "Revenue vs Expenses Trajectory Breakdown",
              subtitle: "Daily Run-Rates and P&L Margin Curves",
              data: null
            }),
            className: "w-full h-56 mt-4 relative cursor-pointer group",
            title: "Click to view detailed ledger",
            children: [
              /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 400 200", preserveAspectRatio: "none", children: [
                /* @__PURE__ */ e.jsxs("defs", { children: [
                  /* @__PURE__ */ e.jsxs("linearGradient", { id: "cyanRevGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.4" }),
                    /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
                  ] }),
                  /* @__PURE__ */ e.jsxs("linearGradient", { id: "purpleExpGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#a855f7", stopOpacity: "0.3" }),
                    /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#a855f7", stopOpacity: "0.0" })
                  ] })
                ] }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "40", x2: "400", y2: "40", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "80", x2: "400", y2: "80", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "120", x2: "400", y2: "120", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "160", x2: "400", y2: "160", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30 L400,200 L0,200 Z", fill: "url(#cyanRevGrad)" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30", fill: "none", stroke: "#06b6d4", strokeWidth: "3" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60 L400,200 L0,200 Z", fill: "url(#purpleExpGrad)" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60", fill: "none", stroke: "#a855f7", strokeWidth: "2.5" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "150", cy: "85", r: "4", fill: "#06b6d4" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "280", cy: "70", r: "4", fill: "#06b6d4" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "400", cy: "30", r: "4", fill: "#06b6d4" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2", children: [
                /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CA}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Trip Volume" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsxs(
              "select",
              {
                value: tripVolView,
                onChange: (e) => setTripVolView(e.target.value),
                className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                children: [
                  /* @__PURE__ */ e.jsx("option", { value: "Daily", children: "Daily \u2304" }),
                  /* @__PURE__ */ e.jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                  /* @__PURE__ */ e.jsx("option", { value: "Corridor", children: "By Corridor \u2304" })
                ]
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "trips",
                  title: "Full March Trip Volume Ledger (314 Trips)",
                  subtitle: "Corridor Distribution and Vehicle Loading Logs",
                  data: null
                }),
                className: "text-slate-500 hover:text-white cursor-pointer px-1 text-xs",
                children: "\xB7\xB7\xB7"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "w-full h-56 mt-3 relative flex flex-col justify-end", children: [
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "manifest",
                title: `Trip Manifest for March ${activeTooltipDay}, 2024`,
                subtitle: `${tripVolumeData[activeTooltipDay - 1]} trips operated on this date across national highway corridors`,
                data: { day: activeTooltipDay, trips: tripVolumeData[activeTooltipDay - 1], list: sampleTripsManifest }
              }),
              className: "absolute z-20 bg-slate-950/95 border border-blue-500/70 rounded-xl px-2.5 py-1.5 text-center shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200",
              style: {
                left: `${Math.min(Math.max(activeTooltipDay / 31 * 85, 5), 72)}%`,
                top: "10%"
              },
              title: "Click to view trips dispatched on this date",
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400 font-mono", children: [
                  "Mar ",
                  activeTooltipDay,
                  ", 2024"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-black text-cyan-400 font-mono", children: [
                  tripVolumeData[activeTooltipDay - 1],
                  " trips \u{1F50D}"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsx("div", { className: "flex items-end justify-between h-44 gap-1 px-1", children: tripVolumeData.map((val, idx) => {
            const day = idx + 1;
            const isSelected = day === activeTooltipDay;
            const heightPct = Math.round(val / 45 * 100);
            return /* @__PURE__ */ e.jsx(
              "div",
              {
                onMouseEnter: () => setActiveTooltipDay(day),
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "manifest",
                  title: `Trip Manifest for March ${day}, 2024`,
                  subtitle: `${val} trips operated on this date across national highway corridors`,
                  data: { day, trips: val, list: sampleTripsManifest }
                }),
                className: "flex-1 flex flex-col items-center group cursor-pointer h-full justify-end",
                children: /* @__PURE__ */ e.jsx(
                  "div",
                  {
                    className: `w-full rounded-t-sm transition-all duration-150 ${isSelected ? "bg-cyan-400 shadow-md shadow-cyan-500/50 scale-y-105" : "bg-blue-600 hover:bg-blue-400 opacity-80"}`,
                    style: { height: `${heightPct}%` }
                  }
                )
              },
              day
            );
          }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-purple-400 text-sm", children: "\u{1F369}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Expense Breakdown" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "This Month \u2304" })
        ] }) }),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            onClick: () => setDrilldownModal({
              isOpen: true,
              type: "expenses",
              title: "Comprehensive Expense Center Audit",
              subtitle: "Itemized Breakdown of Fuel, Tolls, Workshop Maintenance & Crew",
              data: null
            }),
            className: "flex flex-col items-center justify-center my-3 relative cursor-pointer group",
            title: "Click to view detailed itemized expenses",
            children: /* @__PURE__ */ e.jsxs("div", { className: "w-32 h-32 relative flex items-center justify-center group-hover:scale-105 transition duration-200", children: [
              /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full transform -rotate-90", viewBox: "0 0 100 100", children: [
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#06b6d4", strokeWidth: "16", strokeDasharray: "101 138", strokeDashoffset: "0" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#a855f7", strokeWidth: "16", strokeDasharray: "44 195", strokeDashoffset: "-101" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#f59e0b", strokeWidth: "16", strokeDasharray: "29 210", strokeDashoffset: "-145" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#3b82f6", strokeWidth: "16", strokeDasharray: "27 212", strokeDashoffset: "-174" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#ec4899", strokeWidth: "16", strokeDasharray: "20 219", strokeDashoffset: "-201" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#64748b", strokeWidth: "16", strokeDasharray: "17 222", strokeDashoffset: "-221" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center", children: [
                /* @__PURE__ */ e.jsxs("span", { className: "text-xs font-black text-white font-mono", children: [
                  "\u20B9",
                  currentMetrics.expenses >= 1e5 ? (currentMetrics.expenses / 1e5).toFixed(2) + "L" : (currentMetrics.expenses / 1e3).toFixed(1) + "k"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[9px] text-slate-400 uppercase tracking-tighter", children: "Total Exp" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "space-y-1.5 text-[11px] pt-1 border-t border-slate-800", children: [
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expense_slice",
                title: "Fuel Spend & Diesel Telematics Audit",
                subtitle: '\u20B9{expenseBreakdown.fuel.toLocaleString("en-IN")} diesel fuel expenses',
                data: { category: "Fuel", amount: expenseBreakdown.fuel, pct: expenseBreakdown.fuelPct + "%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
                  " Fuel (",
                  expenseBreakdown.fuelPct,
                  "%)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.fuel.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expense_slice",
                title: "FASTag & Electronic Toll Audit",
                subtitle: '\u20B9{expenseBreakdown.toll.toLocaleString("en-IN")} paid across NHAI FASTag plazas',
                data: { category: "Tolls", amount: expenseBreakdown.toll, pct: expenseBreakdown.tollPct + "%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-purple-500" }),
                  " Tolls (",
                  expenseBreakdown.tollPct,
                  "%)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.toll.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expense_slice",
                title: "Fleet Workshop Maintenance & Spare Parts",
                subtitle: '\u20B9{expenseBreakdown.maint.toLocaleString("en-IN")} incurred on tyre replacements & maintenance',
                data: { category: "Maintenance", amount: expenseBreakdown.maint, pct: expenseBreakdown.maintPct + "%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500" }),
                  " Maintenance (",
                  expenseBreakdown.maintPct,
                  "%)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.maint.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expense_slice",
                title: "Driver Salaries & Trip Bata Disbursements",
                subtitle: "\u20B9236,620 disbursed to 10 drivers across 314 trips",
                data: { category: "Driver Salary", amount: 236620, pct: "11.5%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-blue-500" }),
                  " Driver Allowance (",
                  expenseBreakdown.driverPct,
                  "%)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.driver.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "expense_slice",
                title: "Commercial Vehicle Insurance Premiums",
                subtitle: "\u20B9173,860 monthly amortization for fleet comprehensive insurance",
                data: { category: "Insurance", amount: 173860, pct: "8.4%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-pink-500" }),
                  " Operations (",
                  expenseBreakdown.opsPct,
                  "%)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-slate-400", children: [
                  "\u20B9",
                  expenseBreakdown.ops.toLocaleString("en-IN")
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-teal-400 text-sm", children: "\u2699\uFE0F" }),
          /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Operations" })
        ] }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "space-y-3.5 my-2 text-xs", children: [
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "sla_delivery",
                title: "On-Time Delivery SLA Audit: 100% Compliance",
                subtitle: '{trips.filter(t => t.status === "Completed" || t.status === "Delivered").length} delivered on schedule; {trips.filter(t => t.status === "Scheduled" || t.status === "In Transit").length} scheduled dispatches',
                data: null
              }),
              className: "cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition",
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "On-Time Delivery" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-emerald-400 font-mono", children: "100%" })
                ] }),
                /* @__PURE__ */ e.jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ e.jsx("div", { className: "bg-emerald-500 h-full rounded-full", style: { width: "100%" } }) })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "all_routes",
                title: "Active Commercial Routes Master Ledger (12 Routes)",
                subtitle: "Consolidated performance across inter-state corridors",
                data: allRoutesData
              }),
              className: "cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition",
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Active Routes" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-blue-400 font-mono", children: allRoutesData.length })
                ] }),
                /* @__PURE__ */ e.jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ e.jsx("div", { className: "bg-blue-500 h-full rounded-full", style: { width: "75%" } }) })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "driver_detail",
                title: 'Driver Profile & Performance: {fleetDrivers[0]?.name || "Vinod Kumar Rathod"} \u2B50',
                subtitle: "Top performing driver: 4.38 km/l avg mileage, 100% on-time rate, 0 harsh braking events",
                data: fleetDrivers[0]
              }),
              className: "p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition",
              children: [
                /* @__PURE__ */ e.jsxs("div", { children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Top Driver" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white text-xs", children: "Ravi Kumar" })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "text-amber-400 text-sm", children: "\u2B50" })
              ]
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Avg Trip Distance" }),
              /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-cyan-400 font-mono text-xs", children: [
                currentMetrics.trips > 0 ? Math.round(Number(currentMetrics.kms) / currentMetrics.trips) : 150,
                " km"
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs text-slate-500", children: "Per Trip" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "pt-1 flex flex-col gap-1.5 text-[11px]", children: [
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "route",
                  title: 'Corridor Analysis: {allRoutesData[0]?.route || "Hyderabad \u2794 Warangal"} \u{1F3C6}',
                  subtitle: "Top Revenue Generator: 48 Trips, \u20B9612,400 Revenue, 12.4% Net Margin",
                  data: allRoutesData[0]
                }),
                className: "flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Top Route:" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white", children: "Delhi \u2794 Mumbai \u{1F3C6}" })
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "delays",
                  title: "Delayed Trips Incident Report (7 Trips)",
                  subtitle: "Root Cause Breakdown: Traffic Congestion, Loading Docks & Weather",
                  data: null
                }),
                className: "flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Delayed Trips:" }),
                  /* @__PURE__ */ e.jsxs("span", { className: "px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold", children: [
                    trips.filter((t) => t.status === "In Transit").length,
                    " In Transit"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "utilization",
                  title: "Vehicle Fitness & Inspection Registry",
                  subtitle: "4 active healthy benchmark trucks, 7 transit ready, 1 scheduled workshop",
                  data: { util: currentMetrics.utilization, trucks: fleetTrucks }
                }),
                className: "flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Healthy Trucks:" }),
                  /* @__PURE__ */ e.jsxs("span", { className: "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold", children: [
                    fleetTrucks.length,
                    " / ",
                    fleetTrucks.length
                  ] })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CD}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Route Performance" })
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "all_routes",
                title: "All Commercial Corridors & Profitability Ranking (12 Routes)",
                subtitle: "Complete 12-route P&L matrix with distance and margin analytics",
                data: allRoutesData
              }),
              className: "text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer",
              children: "View All >"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "#" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Route" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Trips" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Dist (km)" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Profit Margin" })
          ] }) }),
          /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: filteredRoutes.map((r, i) => /* @__PURE__ */ e.jsxs(
            "tr",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "route",
                title: `Route Deep Dive: ${r.route}`,
                subtitle: `${r.trips} Trips | ${r.distance.toLocaleString()} km | \u20B9${r.revenue.toLocaleString("en-IN")} Revenue | ${r.margin} Margin`,
                data: r
              }),
              className: "hover:bg-slate-850/80 transition cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: i + 1 }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 font-bold text-white", children: [
                  r.route,
                  /* @__PURE__ */ e.jsx("span", { className: "block text-[10px] text-slate-500 font-normal", children: r.highway })
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: r.trips }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: r.distance.toLocaleString() }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: [
                  "\u20B9",
                  r.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${r.color === "emerald" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`, children: r.margin }) })
              ]
            },
            r.id
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-cyan-400 text-sm", children: "\u26FD" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Fuel vs Toll Expenses" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: fuelTollView,
                  onChange: (e) => setFuelTollView(e.target.value),
                  className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "Daily", children: "Daily \u2304" }),
                    /* @__PURE__ */ e.jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                    /* @__PURE__ */ e.jsx("option", { value: "Monthly", children: "Monthly \u2304" })
                  ]
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDrilldownModal({
                    isOpen: true,
                    type: "fuel_vs_toll",
                    title: "Fuel vs FASTag Toll Reconciliation Audit",
                    subtitle: 'Fuel: \u20B9{expenseBreakdown.fuel.toLocaleString("en-IN")} ({expenseBreakdown.fuelPct}%) | Tolls: \u20B9{expenseBreakdown.toll.toLocaleString("en-IN")} ({expenseBreakdown.tollPct}%) of operating costs',
                    data: null
                  }),
                  className: "text-slate-500 hover:text-white cursor-pointer px-1 text-xs",
                  children: "\xB7\xB7\xB7"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "expense_slice",
                  title: "Fuel Spend & Diesel Telematics Audit",
                  subtitle: "\u20B9872,410 incurred across 9,431 Litres diesel (Avg: \u20B992.5/L)",
                  data: { category: "Fuel", amount: 872410, pct: "42.3%" }
                }),
                className: "flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Fuel" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9872,410" })
                ]
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "div",
              {
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "expense_slice",
                  title: "FASTag & Electronic Toll Audit",
                  subtitle: "\u20B9383,120 paid across NHAI plaza readers on 12 corridors",
                  data: { category: "Tolls", amount: 383120, pct: "18.6%" }
                }),
                className: "flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition",
                children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Tolls" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9383,120" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            onClick: () => setDrilldownModal({
              isOpen: true,
              type: "fuel_vs_toll",
              title: "Fuel vs Toll Cost Curves & Telematics Overlay",
              subtitle: "Daily Run-Rates and Highway Plaza Deductions",
              data: null
            }),
            className: "w-full h-44 mt-3 relative cursor-pointer group",
            title: "Click to view detailed reconciliation",
            children: [
              /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 350 150", preserveAspectRatio: "none", children: [
                /* @__PURE__ */ e.jsx("defs", { children: /* @__PURE__ */ e.jsxs("linearGradient", { id: "fuelLineGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.3" }),
                  /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
                ] }) }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "35", x2: "350", y2: "35", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "75", x2: "350", y2: "75", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "115", x2: "350", y2: "115", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25 L350,150 L0,150 Z", fill: "url(#fuelLineGrad)" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25", fill: "none", stroke: "#06b6d4", strokeWidth: "2.5" }),
                /* @__PURE__ */ e.jsx("path", { d: "M0,135 C50,140 90,115 140,110 C190,105 220,125 260,95 C300,75 330,85 350,65", fill: "none", stroke: "#a855f7", strokeWidth: "2" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "140", cy: "80", r: "3", fill: "#06b6d4" }),
                /* @__PURE__ */ e.jsx("circle", { cx: "260", cy: "65", r: "3", fill: "#06b6d4" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
                /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
                /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-rose-400 text-sm", children: "\u{1F514}" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Alerts & Reminders" })
            ] }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => setDrilldownModal({
                  isOpen: true,
                  type: "all_alerts",
                  title: "Complete Fleet Alerts & Compliance Action Queue (8 Alerts)",
                  subtitle: "Pending preventative maintenance, regulatory filings & telematics alerts",
                  data: fleetAlerts
                }),
                className: "text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer",
                children: "View All >"
              }
            )
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "space-y-2.5 text-xs", children: fleetAlerts.slice(0, 4).map((alt) => /* @__PURE__ */ e.jsxs(
            "div",
            {
              onClick: () => setDrilldownModal({
                isOpen: true,
                type: "alert_action",
                title: alt.title,
                subtitle: alt.category,
                data: alt
              }),
              className: `p-2.5 bg-slate-950/80 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:border-slate-600 transition ${alt.severity === "high" ? "border-rose-500/30" : alt.severity === "medium" ? "border-amber-500/30" : "border-blue-500/30"}`,
              title: "Click to resolve alert",
              children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-sm mt-0.5", children: alt.icon }),
                /* @__PURE__ */ e.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 leading-tight", children: alt.title }),
                  /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mt-1", children: [
                    /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                      alt.time,
                      " \u2022 ",
                      alt.category
                    ] }),
                    /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold text-blue-400", children: "Resolve \u2192" })
                  ] })
                ] })
              ]
            },
            alt.id
          )) })
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "pt-3 border-t border-slate-800 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-500", children: "Automated reminders connected to Enterprise Audit Engine" }) })
      ] })
    ] }),
    drilldownModal.isOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-start border-b border-slate-800 pb-4", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30", children: "Deep Analytics Drilldown" }),
          /* @__PURE__ */ e.jsx("h2", { className: "text-xl font-black text-white mt-1.5", children: drilldownModal.title }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: drilldownModal.subtitle })
        ] }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: closeDrilldown,
            className: "w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer text-sm font-bold",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "space-y-4 text-xs", children: [
        drilldownModal.type === "revenue" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Invoiced" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-lg font-black text-emerald-400 mt-1", children: [
                "\u20B9",
                currentMetrics.revenue.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                "Across ",
                currentMetrics.trips,
                " trips"
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Revenue Per KM" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-cyan-400 mt-1", children: "\u20B934.42 / km" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Benchmark: \u20B932.00 / km" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Avg Revenue / Trip" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-blue-400 mt-1", children: "\u20B97,100 / trip" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "+\u20B9700 vs Feb 2024" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Outstanding" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-amber-400 mt-1", children: "\u20B9345,000" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Within 14-day credit terms" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Corporate Client Contribution & Aging Matrix:" }),
            /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left", children: [
              /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Client Name" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Contract Agreement" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Trips" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Billed Freight" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Net Margin" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Outstanding" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "DSO Terms" })
              ] }) }),
              /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: clientsList.filter((c) => c.id !== "all").map((c) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900/60", children: [
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: c.name }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-400", children: c.contractType }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: c.trips }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: [
                  "\u20B9",
                  c.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-white font-bold", children: c.margin }),
                /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono text-amber-400", children: [
                  "\u20B9",
                  c.outstanding.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: c.dso })
              ] }, c.id)) })
            ] }) })
          ] })
        ] }),
        (drilldownModal.type === "expenses" || drilldownModal.type === "expense_slice") && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Fuel (Diesel)" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-base font-black text-cyan-400 mt-1", children: "\u20B9872,410" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "42.3% \u2022 9,431 L @ \u20B992.5" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "FASTag Tolls" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-base font-black text-purple-400 mt-1", children: "\u20B9383,120" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "18.6% \u2022 1,280 plaza tags" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Workshop Maint" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-base font-black text-amber-400 mt-1", children: "\u20B9249,350" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "12.1% \u2022 Spares & Bushings" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Driver Wages & Bata" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-base font-black text-blue-400 mt-1", children: "\u20B9236,620" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "11.5% \u2022 10 Crew Members" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs", children: "Recent Expense Vouchers & Invoices:" }),
            /* @__PURE__ */ e.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ e.jsxs("div", { children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: "HPCL Bulk Depot Diesel Invoice #HP-9982" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-400", children: "TG 12 U 2637 \u2022 420 Litres @ \u20B990.30/L \u2022 Dispensed at Hyderabad Hub" })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-cyan-400", children: "\u20B937,926" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ e.jsxs("div", { children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: "IHMCL NHAI FASTag Monthly Recharge #NHAI-4421" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-400", children: "Monthly Pass renewal for 6 trucks on NH44 Shamshabad & Devanahalli" })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-purple-400", children: "\u20B922,800" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ e.jsxs("div", { children: [
                  /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white", children: "Ashok Leyland Authorized Service Job Card #AL-7741" }),
                  /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-400", children: "Turbo pressure hose renewal + Injector ultrasonic cleaning (TG 12 U 2637)" })
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-amber-400", children: "\u20B914,200" })
              ] })
            ] })
          ] })
        ] }),
        (drilldownModal.type === "profit" || drilldownModal.type === "margin") && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Gross Margin" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-white mt-1", children: "\u20B9388,400" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "17.4% before fleet overheads" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Fleet Overheads" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-rose-400 mt-1", children: "\u20B9221,529.56" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Insurance, permits, workshop rent" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Net Operational Profit" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-cyan-400 mt-1", children: "\u20B9166,870.44" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "7.5% Net Margin (Target: 8.0%)" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-2", children: "Quarterly Profit Trajectory:" }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs py-2 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "January 2024:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white", children: "\u20B9134,200 (6.1% Margin)" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs py-2 border-b border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "February 2024:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white", children: "\u20B9148,600 (6.8% Margin)" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs py-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "March 2024 (Current):" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-emerald-400", children: "\u20B9166,870.44 (7.5% Margin)" })
            ] })
          ] })
        ] }),
        (drilldownModal.type === "trips" || drilldownModal.type === "manifest") && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs", children: drilldownModal.type === "manifest" ? `Dispatches on Mar ${drilldownModal.data?.day}, 2024 (${drilldownModal.data?.trips} Trips Recorded):` : "Fleet Trip Status Breakdown (314 Trips):" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: "Real-Time Dispatch Feed" })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto max-h-80 overflow-y-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left", children: [
            /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "LR Number" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Truck No" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Driver" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Client" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Corridor Route" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Freight" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Status" })
            ] }) }),
            /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: (drilldownModal.data?.list || sampleTripsManifest).map((t, idx) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900/60", children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-mono text-cyan-400 font-bold", children: t.lrNo }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: t.truck }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-300", children: t.driver }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-400", children: t.client }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-semibold text-white", children: t.route }),
              /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: [
                "\u20B9",
                t.freight.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.status === "Delivered" ? "bg-emerald-500/20 text-emerald-300" : t.status === "In Transit" ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"}`, children: t.status }) })
            ] }, idx)) })
          ] }) })
        ] }) }),
        drilldownModal.type === "utilization" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Commercial Trucks" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-white mt-1", children: "12 Heavy Trucks" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "100% RC & Tax Compliant" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Active in Transit" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-blue-400 mt-1", children: "9 Commercial Trucks" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Live on highways" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Overall Fleet Utilization" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-teal-400 mt-1", children: currentMetrics.utilization }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Target: 80%" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Live Fleet Roster (12 Commercial Trucks):" }),
            /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto max-h-72 overflow-y-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left", children: [
              /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Truck Number" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Vehicle Model" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Assigned Driver" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Current Location" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Odometer (km)" }),
                /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Health Status" })
              ] }) }),
              /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: fleetTrucks.map((t) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900/60", children: [
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white font-mono", children: t.number }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-300", children: t.brand }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-300 font-semibold", children: t.driver }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-400", children: t.location }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: t.odometer.toLocaleString() }),
                /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.health.includes("Service Due") ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`, children: t.health }) })
              ] }, t.number)) })
            ] }) })
          ] })
        ] }),
        (drilldownModal.type === "drivers" || drilldownModal.type === "driver_detail") && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Driver Crew Performance & Telematics Scorecards (10 Drivers):" }),
          /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto max-h-80 overflow-y-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left", children: [
            /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Driver Name" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Experience" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Assigned Truck" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Decoupled Mileage" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Safety Score" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Trips Done" }),
              /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Performance Tag" })
            ] }) }),
            /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: fleetDrivers.map((d) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-900/60", children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: d.name }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-400", children: d.exp }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-mono text-slate-300", children: d.truck }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: d.mileage }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-cyan-400", children: d.score }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: d.trips }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${d.status.includes("Eco-Training") ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`, children: d.status }) })
            ] }, d.name)) })
          ] }) })
        ] }) }),
        drilldownModal.type === "all_routes" && /* @__PURE__ */ e.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ e.jsx("div", { className: "max-h-96 overflow-y-auto pr-1", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "#" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Route Corridor" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Highway Link" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Trips" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Distance (km)" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Fuel Cost" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Profit Margin" })
          ] }) }),
          /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: allRoutesData.map((r, idx) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-800/40", children: [
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: idx + 1 }),
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: r.route }),
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-400 text-[11px]", children: r.highway }),
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: r.trips }),
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: r.distance.toLocaleString() }),
            /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: [
              "\u20B9",
              r.revenue.toLocaleString("en-IN")
            ] }),
            /* @__PURE__ */ e.jsxs("td", { className: "py-2.5 text-right font-mono text-cyan-400", children: [
              "\u20B9",
              r.fuelCost.toLocaleString("en-IN")
            ] }),
            /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: r.margin })
          ] }, idx)) })
        ] }) }) }),
        drilldownModal.type === "route" && drilldownModal.data && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Trips" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-lg font-black text-white mt-1", children: [
                drilldownModal.data.trips,
                " Trips"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "March 2024" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Distance" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-lg font-black text-cyan-400 mt-1", children: [
                drilldownModal.data.distance,
                " km"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Across convoys" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Billed Revenue" }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-lg font-black text-emerald-400 mt-1", children: [
                "\u20B9",
                drilldownModal.data.revenue.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                "Top: ",
                drilldownModal.data.topClient
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Profit Margin" }),
              /* @__PURE__ */ e.jsx("div", { className: "text-lg font-black text-purple-400 mt-1", children: drilldownModal.data.margin }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "Optimal Corridor" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2", children: [
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-xs", children: "Corridor Logistics Profile:" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-slate-300 space-y-1", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ e.jsx("strong", { children: "Primary Highway Link:" }),
                " ",
                drilldownModal.data.highway
              ] }),
              /* @__PURE__ */ e.jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ e.jsx("strong", { children: "Major Corporate Shipper:" }),
                " ",
                drilldownModal.data.topClient
              ] }),
              /* @__PURE__ */ e.jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ e.jsx("strong", { children: "Return Load Availability:" }),
                " High (88% backhaul availability from industrial clusters)"
              ] }),
              /* @__PURE__ */ e.jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ e.jsx("strong", { children: "Average Door-to-Door Transit:" }),
                " 42 hours with GPS geofenced waypoints"
              ] })
            ] })
          ] })
        ] }),
        drilldownModal.type === "all_alerts" && /* @__PURE__ */ e.jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-1", children: fleetAlerts.map((alt) => /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-white text-xs flex items-center gap-1.5", children: [
              /* @__PURE__ */ e.jsx("span", { children: alt.icon }),
              " ",
              alt.title
            ] }),
            /* @__PURE__ */ e.jsx("p", { className: "text-[11px] text-slate-400 mt-1", children: alt.description }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500 mt-1 inline-block", children: [
              alt.time,
              " \u2022 ",
              alt.category
            ] })
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                alert(`Action triggered: ${alt.actionTitle}`);
              },
              className: "px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer ml-3 shrink-0",
              children: alt.actionTitle
            }
          )
        ] }, alt.id)) }),
        drilldownModal.type === "alert_action" && drilldownModal.data && /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-xl", children: drilldownModal.data.icon }),
              /* @__PURE__ */ e.jsx("h4", { className: "font-bold text-white text-sm", children: drilldownModal.data.title })
            ] }),
            /* @__PURE__ */ e.jsx("p", { className: "text-slate-300 text-xs mb-3", children: drilldownModal.data.description }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Audit Classification:" }),
              " ",
              drilldownModal.data.category,
              " \u2022 Logged: ",
              drilldownModal.data.time
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: closeDrilldown,
                className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer",
                children: "Dismiss"
              }
            ),
            /* @__PURE__ */ e.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  alert(`Action confirmed: ${drilldownModal.data.actionTitle}. Workflow ticket dispatched.`);
                  closeDrilldown();
                },
                className: "px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer",
                children: [
                  "Confirm: ",
                  drilldownModal.data.actionTitle
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "flex justify-end pt-3 border-t border-slate-800", children: /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: closeDrilldown,
          className: "px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer",
          children: "Close Deep Drilldown"
        }
      ) })
    ] }) }),
    isProfileModalOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-center", children: [
      /* @__PURE__ */ e.jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg mx-auto", children: "JB" }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-base", children: "John B." }),
        /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400", children: "Chief Fleet Operations & Telematics" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("strong", { children: "Role:" }),
          " Super Admin / Fleet Dispatcher"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("strong", { children: "Portal:" }),
          " Jai Bhavani Cargo ERP v78"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("strong", { children: "Access Level:" }),
          " Complete Read/Write/Export"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("strong", { children: "Active Fleet Scope:" }),
          " ",
          fleetTrucks.length,
          " Heavy Commercial Trucks"
        ] })
      ] }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => setIsProfileModalOpen(false),
          className: "w-full py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer",
          children: "Close"
        }
      )
    ] }) })
  ] });
}
