import{j as e,ap as bt,dB as gt,cv as ft,ai as _e,cC as et,df as jt,r as C,ak as Nt,bm as vt,cg as yt,b2 as wt,a0 as ut,a4 as kt,R as st,E as St,a_ as Ct,bt as Oe,aB as ze,aO as at,aQ as Ke,a6 as ke,ae as qe,av as rt,dC as lt,aV as Tt,am as Mt}from"./vendor-react-Bs5V2qFE.js";import{I as ue,S as ne,e as oe,g as ie,h as de,i as T,B as Me,k as Se,au as nt,y as Xe,z as Ye,A as le,E as q,F as Ze,G as N,C as v,o as L,q as R,O as k,r as Q,p as Te,t as ve,l as ot,n as Lt,s as Rt,v as je,x as Ne,L as it,b6 as Et,b7 as Pt,b8 as Dt,b9 as At,ba as _t,bb as $t,bc as It,bd as Ft}from"./index-DLxf9dwO.js";import{S as Vt}from"./SendMailDialog-DwU-GlVi.js";import{utils as He,writeFile as Bt}from"./xlsx-CNerDvZX.js";import{s as We,e as Ue}from"./startOfMonth-CPqsb2_s.js";import{R as Le,T as Re,L as Ee,C as Gt,B as De}from"./generateCategoricalChart-BEnIo3F8.js";import{L as ht}from"./LineChart-DmZyY0rc.js";import{C as $e}from"./CartesianGrid-BCC_9QQg.js";import{X as Ie,Y as Fe}from"./YAxis-C3vl7O1m.js";import{L as Ae}from"./Line-D_9erwcV.js";import{P as Ot,a as zt}from"./PieChart-DFpEcMSh.js";import{B as pt}from"./BarChart-DOVIJigh.js";



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
  const _jsx = (e && e.jsx) ? e.jsx : (f, d, m) => (c.createElement ? c.createElement(f, d) : null);
  const _jsxs = (e && (e.jsxs || e.jsx)) ? (e.jsxs || e.jsx) : _jsx;
  const Fragment = (c && c.Fragment) ? c.Fragment : 'div';
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
  return /* @__PURE__ */ _jsxs("div", { className: "space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100 relative", children: [
    /* @__PURE__ */ _jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4", children: [
      /* @__PURE__ */ _jsxs("div", { children: [
        /* @__PURE__ */ _jsxs("h1", { className: "text-3xl font-black tracking-tight text-white flex items-center gap-3", children: [
          /* @__PURE__ */ _jsx("span", { children: "Analytics Hub" }),
          /* @__PURE__ */ _jsx("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: "Live Fleet Command" })
        ] }),
        /* @__PURE__ */ _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Financial and operational performance overview for your logistics business." })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "flex flex-wrap items-center gap-3 relative", children: [
        /* @__PURE__ */ _jsxs("div", { className: "relative min-w-[260px] sm:min-w-[300px]", children: [
          /* @__PURE__ */ _jsx("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm", children: "\u{1F50D}" }),
          /* @__PURE__ */ _jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search trips, drivers, vehicles, routes...",
              className: "w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            }
          ),
          /* @__PURE__ */ _jsx("span", { className: "absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none", children: /* @__PURE__ */ _jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded", children: "\u2318K" }) })
        ] }),
        /* @__PURE__ */ _jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsNotificationsOpen(!isNotificationsOpen),
            className: "relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer",
            title: "View Active Fleet Notifications",
            children: [
              /* @__PURE__ */ _jsx("span", { children: "\u{1F514}" }),
              /* @__PURE__ */ _jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs", children: fleetAlerts.length })
            ]
          }
        ),
        /* @__PURE__ */ _jsxs(
          "div",
          {
            onClick: () => setIsProfileModalOpen(true),
            className: "flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition",
            children: [
              /* @__PURE__ */ _jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs", children: "JB" }),
              /* @__PURE__ */ _jsxs("div", { className: "text-left hidden sm:block", children: [
                /* @__PURE__ */ _jsx("div", { className: "text-xs font-bold text-white leading-tight", children: "Vinod Kumar Rathod" }),
                /* @__PURE__ */ _jsx("div", { className: "text-[10px] text-slate-400 leading-tight", children: "Fleet Manager" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ _jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ _jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsExportMenuOpen(!isExportMenuOpen),
              className: "px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ _jsx("span", { children: "\u{1F4E5}" }),
                /* @__PURE__ */ _jsx("span", { children: "Export Report" }),
                /* @__PURE__ */ _jsx("span", { className: "text-[10px] opacity-70", children: "\u25BC" })
              ]
            }
          ),
          isExportMenuOpen && /* @__PURE__ */ _jsxs("div", { className: "absolute right-0 top-12 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in zoom-in-95 duration-150", children: [
            /* @__PURE__ */ _jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider", children: "Export Options" }),
            /* @__PURE__ */ _jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  alert("Generating Excel Spreadsheet (.xlsx): 314 March Trips with Full Revenue, Fuel, Tolls & Margin Ledger...");
                },
                className: "w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer",
                children: [
                  /* @__PURE__ */ _jsx("span", { className: "text-emerald-400", children: "\u{1F4CA}" }),
                  " Download Excel (.xlsx)"
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsExportMenuOpen(false);
                  alert("Generating Audit Executive PDF (.pdf) with P&L Charts and Corridor Matrix...");
                },
                className: "w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer",
                children: [
                  /* @__PURE__ */ _jsx("span", { className: "text-rose-400", children: "\u{1F4C4}" }),
                  " Download PDF Report (.pdf)"
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "text-blue-400", children: "\u{1F4CB}" }),
                  " Copy Summary to Clipboard"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    isNotificationsOpen && /* @__PURE__ */ _jsxs("div", { className: "absolute right-0 top-16 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-2 mb-3", children: [
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-sm", children: "\u{1F514}" }),
          /* @__PURE__ */ _jsxs("span", { className: "text-xs font-bold text-white", children: [
            "Active Fleet Notifications (",
            fleetAlerts.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ _jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsNotificationsOpen(false),
            className: "text-xs text-slate-400 hover:text-white cursor-pointer",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ _jsx("div", { className: "space-y-2 max-h-80 overflow-y-auto pr-1", children: fleetAlerts.map((alt) => /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold text-slate-200", children: [
              /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ _jsx("span", { children: alt.icon }),
                " ",
                alt.title
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: alt.time })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "text-[10px] text-blue-400 mt-1 font-semibold flex items-center gap-1", children: [
              /* @__PURE__ */ _jsx("span", { children: "\u26A1 Action:" }),
              " ",
              alt.actionTitle
            ] })
          ]
        },
        alt.id
      )) })
    ] }),
    /* @__PURE__ */ _jsxs("div", { className: "bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs", children: [
      /* @__PURE__ */ _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "START" }),
          /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ _jsx(
            "input",
            {
              type: "date",
              value: startDate,
              onChange: (e) => setStartDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ _jsx("span", { className: "text-slate-600 font-bold", children: "\u2794" }),
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "END" }),
          /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ _jsx(
            "input",
            {
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "VIEW" }),
          /* @__PURE__ */ _jsxs(
            "select",
            {
              value: viewType,
              onChange: (e) => setViewType(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer",
              children: [
                /* @__PURE__ */ _jsx("option", { value: "Daily View", className: "bg-slate-900", children: "Daily View" }),
                /* @__PURE__ */ _jsx("option", { value: "Weekly View", className: "bg-slate-900", children: "Weekly View" }),
                /* @__PURE__ */ _jsx("option", { value: "Monthly View", className: "bg-slate-900", children: "Monthly View" }),
                /* @__PURE__ */ _jsx("option", { value: "Quarterly View", className: "bg-slate-900", children: "Quarterly View" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold uppercase text-emerald-400", children: "CLIENT" }),
          /* @__PURE__ */ _jsx(
            "select",
            {
              value: selectedClient,
              onChange: (e) => setSelectedClient(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[190px] truncate",
              children: clientsList.map((c) => /* @__PURE__ */ _jsx("option", { value: c.id, className: "bg-slate-900", children: c.name }, c.id))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ _jsx("div", { className: "bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1", children: ["7D", "30D", "3M", "6M", "1Y", "Custom"].map((pill) => /* @__PURE__ */ _jsx(
          "button",
          {
            type: "button",
            onClick: () => handleRangeClick(pill),
            className: `px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${selectedRange === pill ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`,
            children: pill
          },
          pill
        )) }),
        /* @__PURE__ */ _jsxs(
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
              /* @__PURE__ */ _jsx("span", { children: "\u{1F504}" }),
              " Reset"
            ]
          }
        ),
        /* @__PURE__ */ _jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              alert(`Filters applied! Period: ${selectedRange} (${startDate} to ${endDate}) for Client: ${clientsList.find((c) => c.id === selectedClient)?.name}. Total revenue: \u20B9${currentMetrics.revenue.toLocaleString("en-IN")}`);
            },
            className: "px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer",
            children: [
              /* @__PURE__ */ _jsx("span", { children: "\u26A1" }),
              " Apply Filters"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u20B9" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Revenue" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-emerald-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +18.4%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,28 Q15,35 30,22 T60,18 T85,8 T100,5", fill: "none", stroke: "#10b981", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "5", r: "3", fill: "#10b981" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F4B3}" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Expenses" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-rose-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.expenses.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2198 -6.2%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,15 Q20,10 40,25 T70,18 T90,30 T100,28", fill: "none", stroke: "#f43f5e", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "28", r: "3", fill: "#f43f5e" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F4CA}" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Net Profit" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-cyan-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsxs("div", { className: "text-2xl font-black text-white tracking-tight", children: [
                  "\u20B9",
                  currentMetrics.netProfit.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-cyan-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +42.7%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,32 Q25,30 45,22 T75,15 T90,8 T100,4", fill: "none", stroke: "#06b6d4", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "4", r: "3", fill: "#06b6d4" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "%" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Profit Margin" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-purple-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.margin }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-purple-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +2.1%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,28 Q30,22 55,20 T80,12 T100,8", fill: "none", stroke: "#a855f7", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "8", r: "3", fill: "#a855f7" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F69B}" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total Trips" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-blue-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.trips }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +12.5%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,30 Q20,32 40,20 T70,16 T90,10 T100,6", fill: "none", stroke: "#3b82f6", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "6", r: "3", fill: "#3b82f6" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F6E3}\uFE0F" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Total KMs Driven" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-amber-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.kms }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +9.8%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,25 Q25,28 50,18 T80,14 T100,9", fill: "none", stroke: "#f59e0b", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "9", r: "3", fill: "#f59e0b" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u23F1\uFE0F" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Fleet Utilization" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-teal-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.utilization }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-teal-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2197 +6.3%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,28 Q30,30 55,20 T80,15 T100,10", fill: "none", stroke: "#14b8a6", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "10", r: "3", fill: "#14b8a6" })
              ] }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ _jsxs(
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
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ _jsx("div", { className: "w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition", children: "\u{1F465}" }),
                /* @__PURE__ */ _jsx("span", { className: "text-xs font-bold text-slate-400 group-hover:text-slate-200 transition", children: "Active Drivers" })
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-slate-600 group-hover:text-indigo-400 transition text-xs font-bold", children: "\u{1F50D} Drill" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                /* @__PURE__ */ _jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: currentMetrics.drivers }),
                /* @__PURE__ */ _jsxs("div", { className: "text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ _jsx("span", { children: "\u2192 0%" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
                ] })
              ] }),
              /* @__PURE__ */ _jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
                /* @__PURE__ */ _jsx("path", { d: "M0,20 Q30,18 60,20 T100,20", fill: "none", stroke: "#6366f1", strokeWidth: "2.5", strokeLinecap: "round" }),
                /* @__PURE__ */ _jsx("circle", { cx: "100", cy: "20", r: "3", fill: "#6366f1" })
              ] }) })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-cyan-400 text-sm", children: "\u{1F4C8}" }),
              /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Revenue vs Expenses" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ _jsxs(
                "select",
                {
                  value: revExpView,
                  onChange: (e) => setRevExpView(e.target.value),
                  className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                  children: [
                    /* @__PURE__ */ _jsx("option", { value: "Daily", children: "Daily \u2304" }),
                    /* @__PURE__ */ _jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                    /* @__PURE__ */ _jsx("option", { value: "Monthly", children: "Monthly \u2304" })
                  ]
                }
              ),
              /* @__PURE__ */ _jsx(
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
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Revenue" }),
                  /* @__PURE__ */ _jsxs("span", { className: "font-bold text-white font-mono", children: [
                    "\u20B9",
                    currentMetrics.revenue.toLocaleString("en-IN")
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-purple-500 shadow-xs shadow-purple-500" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Expenses" }),
                  /* @__PURE__ */ _jsxs("span", { className: "font-bold text-white font-mono", children: [
                    "\u20B9",
                    currentMetrics.expenses.toLocaleString("en-IN")
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ _jsxs(
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
              /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 400 200", preserveAspectRatio: "none", children: [
                /* @__PURE__ */ _jsxs("defs", { children: [
                  /* @__PURE__ */ _jsxs("linearGradient", { id: "cyanRevGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ _jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.4" }),
                    /* @__PURE__ */ _jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
                  ] }),
                  /* @__PURE__ */ _jsxs("linearGradient", { id: "purpleExpGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ _jsx("stop", { offset: "0%", stopColor: "#a855f7", stopOpacity: "0.3" }),
                    /* @__PURE__ */ _jsx("stop", { offset: "100%", stopColor: "#a855f7", stopOpacity: "0.0" })
                  ] })
                ] }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "40", x2: "400", y2: "40", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "80", x2: "400", y2: "80", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "120", x2: "400", y2: "120", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "160", x2: "400", y2: "160", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30 L400,200 L0,200 Z", fill: "url(#cyanRevGrad)" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30", fill: "none", stroke: "#06b6d4", strokeWidth: "3" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60 L400,200 L0,200 Z", fill: "url(#purpleExpGrad)" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60", fill: "none", stroke: "#a855f7", strokeWidth: "2.5" }),
                /* @__PURE__ */ _jsx("circle", { cx: "150", cy: "85", r: "4", fill: "#06b6d4" }),
                /* @__PURE__ */ _jsx("circle", { cx: "280", cy: "70", r: "4", fill: "#06b6d4" }),
                /* @__PURE__ */ _jsx("circle", { cx: "400", cy: "30", r: "4", fill: "#06b6d4" })
              ] }),
              /* @__PURE__ */ _jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2", children: [
                /* @__PURE__ */ _jsx("span", { children: "Mar 1" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 5" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 10" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 15" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 20" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 25" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 31" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsx("div", { children: /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ _jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CA}" }),
            /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Trip Volume" })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ _jsxs(
              "select",
              {
                value: tripVolView,
                onChange: (e) => setTripVolView(e.target.value),
                className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                children: [
                  /* @__PURE__ */ _jsx("option", { value: "Daily", children: "Daily \u2304" }),
                  /* @__PURE__ */ _jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                  /* @__PURE__ */ _jsx("option", { value: "Corridor", children: "By Corridor \u2304" })
                ]
              }
            ),
            /* @__PURE__ */ _jsx(
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
        /* @__PURE__ */ _jsxs("div", { className: "w-full h-56 mt-3 relative flex flex-col justify-end", children: [
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("div", { className: "text-[10px] text-slate-400 font-mono", children: [
                  "Mar ",
                  activeTooltipDay,
                  ", 2024"
                ] }),
                /* @__PURE__ */ _jsxs("div", { className: "text-xs font-black text-cyan-400 font-mono", children: [
                  tripVolumeData[activeTooltipDay - 1],
                  " trips \u{1F50D}"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ _jsx("div", { className: "flex items-end justify-between h-44 gap-1 px-1", children: tripVolumeData.map((val, idx) => {
            const day = idx + 1;
            const isSelected = day === activeTooltipDay;
            const heightPct = Math.round(val / 45 * 100);
            return /* @__PURE__ */ _jsx(
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
                children: /* @__PURE__ */ _jsx(
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
          /* @__PURE__ */ _jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
            /* @__PURE__ */ _jsx("span", { children: "Mar 1" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 5" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 10" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 15" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 20" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 25" }),
            /* @__PURE__ */ _jsx("span", { children: "Mar 31" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsx("div", { children: /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ _jsx("span", { className: "text-purple-400 text-sm", children: "\u{1F369}" }),
            /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Expense Breakdown" })
          ] }),
          /* @__PURE__ */ _jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "This Month \u2304" })
        ] }) }),
        /* @__PURE__ */ _jsx(
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
            children: /* @__PURE__ */ _jsxs("div", { className: "w-32 h-32 relative flex items-center justify-center group-hover:scale-105 transition duration-200", children: [
              /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full transform -rotate-90", viewBox: "0 0 100 100", children: [
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#06b6d4", strokeWidth: "16", strokeDasharray: "101 138", strokeDashoffset: "0" }),
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#a855f7", strokeWidth: "16", strokeDasharray: "44 195", strokeDashoffset: "-101" }),
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#f59e0b", strokeWidth: "16", strokeDasharray: "29 210", strokeDashoffset: "-145" }),
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#3b82f6", strokeWidth: "16", strokeDasharray: "27 212", strokeDashoffset: "-174" }),
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#ec4899", strokeWidth: "16", strokeDasharray: "20 219", strokeDashoffset: "-201" }),
                /* @__PURE__ */ _jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#64748b", strokeWidth: "16", strokeDasharray: "17 222", strokeDashoffset: "-221" })
              ] }),
              /* @__PURE__ */ _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center", children: [
                /* @__PURE__ */ _jsxs("span", { className: "text-xs font-black text-white font-mono", children: [
                  "\u20B9",
                  currentMetrics.expenses >= 1e5 ? (currentMetrics.expenses / 1e5).toFixed(2) + "L" : (currentMetrics.expenses / 1e3).toFixed(1) + "k"
                ] }),
                /* @__PURE__ */ _jsx("span", { className: "text-[9px] text-slate-400 uppercase tracking-tighter", children: "Total Exp" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ _jsxs("div", { className: "space-y-1.5 text-[11px] pt-1 border-t border-slate-800", children: [
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ _jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
                  " Fuel (",
                  expenseBreakdown.fuelPct,
                  "%)"
                ] }),
                /* @__PURE__ */ _jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.fuel.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ _jsx("span", { className: "w-2 h-2 rounded-full bg-purple-500" }),
                  " Tolls (",
                  expenseBreakdown.tollPct,
                  "%)"
                ] }),
                /* @__PURE__ */ _jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.toll.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ _jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500" }),
                  " Maintenance (",
                  expenseBreakdown.maintPct,
                  "%)"
                ] }),
                /* @__PURE__ */ _jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.maint.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ _jsx("span", { className: "w-2 h-2 rounded-full bg-blue-500" }),
                  " Driver Allowance (",
                  expenseBreakdown.driverPct,
                  "%)"
                ] }),
                /* @__PURE__ */ _jsxs("span", { className: "font-mono text-white font-bold", children: [
                  "\u20B9",
                  expenseBreakdown.driver.toLocaleString("en-IN")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ _jsx("span", { className: "w-2 h-2 rounded-full bg-pink-500" }),
                  " Operations (",
                  expenseBreakdown.opsPct,
                  "%)"
                ] }),
                /* @__PURE__ */ _jsxs("span", { className: "font-mono text-slate-400", children: [
                  "\u20B9",
                  expenseBreakdown.ops.toLocaleString("en-IN")
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsx("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ _jsx("span", { className: "text-teal-400 text-sm", children: "\u2699\uFE0F" }),
          /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Operations" })
        ] }) }),
        /* @__PURE__ */ _jsxs("div", { className: "space-y-3.5 my-2 text-xs", children: [
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "On-Time Delivery" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-emerald-400 font-mono", children: "100%" })
                ] }),
                /* @__PURE__ */ _jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ _jsx("div", { className: "bg-emerald-500 h-full rounded-full", style: { width: "100%" } }) })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Active Routes" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-blue-400 font-mono", children: allRoutesData.length })
                ] }),
                /* @__PURE__ */ _jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ _jsx("div", { className: "bg-blue-500 h-full rounded-full", style: { width: "75%" } }) })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsxs("div", { children: [
                  /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Top Driver" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-white text-xs", children: "Ravi Kumar" })
                ] }),
                /* @__PURE__ */ _jsx("span", { className: "text-amber-400 text-sm", children: "\u2B50" })
              ]
            }
          ),
          /* @__PURE__ */ _jsxs("div", { className: "p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between", children: [
            /* @__PURE__ */ _jsxs("div", { children: [
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Avg Trip Distance" }),
              /* @__PURE__ */ _jsxs("span", { className: "font-bold text-cyan-400 font-mono text-xs", children: [
                currentMetrics.trips > 0 ? Math.round(Number(currentMetrics.kms) / currentMetrics.trips) : 150,
                " km"
              ] })
            ] }),
            /* @__PURE__ */ _jsx("span", { className: "text-xs text-slate-500", children: "Per Trip" })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "pt-1 flex flex-col gap-1.5 text-[11px]", children: [
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Top Route:" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-white", children: "Delhi \u2794 Mumbai \u{1F3C6}" })
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Delayed Trips:" }),
                  /* @__PURE__ */ _jsxs("span", { className: "px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold", children: [
                    trips.filter((t) => t.status === "In Transit").length,
                    " In Transit"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Healthy Trucks:" }),
                  /* @__PURE__ */ _jsxs("span", { className: "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold", children: [
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
    /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ _jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CD}" }),
            /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Route Performance" })
          ] }),
          /* @__PURE__ */ _jsx(
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
        /* @__PURE__ */ _jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
            /* @__PURE__ */ _jsx("th", { className: "py-2", children: "#" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Route" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Trips" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Dist (km)" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Profit Margin" })
          ] }) }),
          /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: filteredRoutes.map((r, i) => /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: i + 1 }),
                /* @__PURE__ */ _jsxs("td", { className: "py-2.5 font-bold text-white", children: [
                  r.route,
                  /* @__PURE__ */ _jsx("span", { className: "block text-[10px] text-slate-500 font-normal", children: r.highway })
                ] }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: r.trips }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: r.distance.toLocaleString() }),
                /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: [
                  "\u20B9",
                  r.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ _jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${r.color === "emerald" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`, children: r.margin }) })
              ]
            },
            r.id
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-cyan-400 text-sm", children: "\u26FD" }),
              /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Fuel vs Toll Expenses" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ _jsxs(
                "select",
                {
                  value: fuelTollView,
                  onChange: (e) => setFuelTollView(e.target.value),
                  className: "text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer",
                  children: [
                    /* @__PURE__ */ _jsx("option", { value: "Daily", children: "Daily \u2304" }),
                    /* @__PURE__ */ _jsx("option", { value: "Weekly", children: "Weekly \u2304" }),
                    /* @__PURE__ */ _jsx("option", { value: "Monthly", children: "Monthly \u2304" })
                  ]
                }
              ),
              /* @__PURE__ */ _jsx(
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
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Fuel" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9872,410" })
                ]
              }
            ),
            /* @__PURE__ */ _jsxs(
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
                  /* @__PURE__ */ _jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "Tolls" }),
                  /* @__PURE__ */ _jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9383,120" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ _jsxs(
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
              /* @__PURE__ */ _jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 350 150", preserveAspectRatio: "none", children: [
                /* @__PURE__ */ _jsx("defs", { children: /* @__PURE__ */ _jsxs("linearGradient", { id: "fuelLineGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ _jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.3" }),
                  /* @__PURE__ */ _jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
                ] }) }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "35", x2: "350", y2: "35", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "75", x2: "350", y2: "75", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("line", { x1: "0", y1: "115", x2: "350", y2: "115", stroke: "#1e293b", strokeDasharray: "3 3" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25 L350,150 L0,150 Z", fill: "url(#fuelLineGrad)" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25", fill: "none", stroke: "#06b6d4", strokeWidth: "2.5" }),
                /* @__PURE__ */ _jsx("path", { d: "M0,135 C50,140 90,115 140,110 C190,105 220,125 260,95 C300,75 330,85 350,65", fill: "none", stroke: "#a855f7", strokeWidth: "2" }),
                /* @__PURE__ */ _jsx("circle", { cx: "140", cy: "80", r: "3", fill: "#06b6d4" }),
                /* @__PURE__ */ _jsx("circle", { cx: "260", cy: "65", r: "3", fill: "#06b6d4" })
              ] }),
              /* @__PURE__ */ _jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
                /* @__PURE__ */ _jsx("span", { children: "Mar 1" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 5" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 10" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 15" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 20" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 25" }),
                /* @__PURE__ */ _jsx("span", { children: "Mar 31" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-rose-400 text-sm", children: "\u{1F514}" }),
              /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-sm", children: "Alerts & Reminders" })
            ] }),
            /* @__PURE__ */ _jsx(
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
          /* @__PURE__ */ _jsx("div", { className: "space-y-2.5 text-xs", children: fleetAlerts.slice(0, 4).map((alt) => /* @__PURE__ */ _jsxs(
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
                /* @__PURE__ */ _jsx("span", { className: "text-sm mt-0.5", children: alt.icon }),
                /* @__PURE__ */ _jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ _jsx("div", { className: "font-bold text-slate-200 leading-tight", children: alt.title }),
                  /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center mt-1", children: [
                    /* @__PURE__ */ _jsxs("span", { className: "text-[10px] text-slate-500", children: [
                      alt.time,
                      " \u2022 ",
                      alt.category
                    ] }),
                    /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold text-blue-400", children: "Resolve \u2192" })
                  ] })
                ] })
              ]
            },
            alt.id
          )) })
        ] }),
        /* @__PURE__ */ _jsx("div", { className: "pt-3 border-t border-slate-800 text-center", children: /* @__PURE__ */ _jsx("span", { className: "text-[11px] text-slate-500", children: "Automated reminders connected to Enterprise Audit Engine" }) })
      ] })
    ] }),
    drilldownModal.isOpen && /* @__PURE__ */ _jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-start border-b border-slate-800 pb-4", children: [
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30", children: "Deep Analytics Drilldown" }),
          /* @__PURE__ */ _jsx("h2", { className: "text-xl font-black text-white mt-1.5", children: drilldownModal.title }),
          /* @__PURE__ */ _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: drilldownModal.subtitle })
        ] }),
        /* @__PURE__ */ _jsx(
          "button",
          {
            type: "button",
            onClick: closeDrilldown,
            className: "w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer text-sm font-bold",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "space-y-4 text-xs", children: [
        drilldownModal.type === "revenue" && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Invoiced" }),
              /* @__PURE__ */ _jsxs("div", { className: "text-lg font-black text-emerald-400 mt-1", children: [
                "\u20B9",
                currentMetrics.revenue.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ _jsxs("span", { className: "text-[10px] text-slate-500", children: [
                "Across ",
                currentMetrics.trips,
                " trips"
              ] })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Revenue Per KM" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-cyan-400 mt-1", children: "\u20B934.42 / km" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Benchmark: \u20B932.00 / km" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Avg Revenue / Trip" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-blue-400 mt-1", children: "\u20B97,100 / trip" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "+\u20B9700 vs Feb 2024" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Outstanding" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-amber-400 mt-1", children: "\u20B9345,000" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Within 14-day credit terms" })
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Corporate Client Contribution & Aging Matrix:" }),
            /* @__PURE__ */ _jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left", children: [
              /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Client Name" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Contract Agreement" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Trips" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Billed Freight" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Net Margin" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Outstanding" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "DSO Terms" })
              ] }) }),
              /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: clientsList.filter((c) => c.id !== "all").map((c) => /* @__PURE__ */ _jsxs("tr", { className: "hover:bg-slate-900/60", children: [
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-bold text-white", children: c.name }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-400", children: c.contractType }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: c.trips }),
                /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: [
                  "\u20B9",
                  c.revenue.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-white font-bold", children: c.margin }),
                /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono text-amber-400", children: [
                  "\u20B9",
                  c.outstanding.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: c.dso })
              ] }, c.id)) })
            ] }) })
          ] })
        ] }),
        (drilldownModal.type === "expenses" || drilldownModal.type === "expense_slice") && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Fuel (Diesel)" }),
              /* @__PURE__ */ _jsx("div", { className: "text-base font-black text-cyan-400 mt-1", children: "\u20B9872,410" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "42.3% \u2022 9,431 L @ \u20B992.5" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "FASTag Tolls" }),
              /* @__PURE__ */ _jsx("div", { className: "text-base font-black text-purple-400 mt-1", children: "\u20B9383,120" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "18.6% \u2022 1,280 plaza tags" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Workshop Maint" }),
              /* @__PURE__ */ _jsx("div", { className: "text-base font-black text-amber-400 mt-1", children: "\u20B9249,350" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "12.1% \u2022 Spares & Bushings" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Driver Wages & Bata" }),
              /* @__PURE__ */ _jsx("div", { className: "text-base font-black text-blue-400 mt-1", children: "\u20B9236,620" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "11.5% \u2022 10 Crew Members" })
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs", children: "Recent Expense Vouchers & Invoices:" }),
            /* @__PURE__ */ _jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ _jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ _jsxs("div", { children: [
                  /* @__PURE__ */ _jsx("div", { className: "font-bold text-white", children: "HPCL Bulk Depot Diesel Invoice #HP-9982" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-400", children: "TG 12 U 2637 \u2022 420 Litres @ \u20B990.30/L \u2022 Dispensed at Hyderabad Hub" })
                ] }),
                /* @__PURE__ */ _jsx("span", { className: "font-mono font-bold text-cyan-400", children: "\u20B937,926" })
              ] }),
              /* @__PURE__ */ _jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ _jsxs("div", { children: [
                  /* @__PURE__ */ _jsx("div", { className: "font-bold text-white", children: "IHMCL NHAI FASTag Monthly Recharge #NHAI-4421" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-400", children: "Monthly Pass renewal for 6 trucks on NH44 Shamshabad & Devanahalli" })
                ] }),
                /* @__PURE__ */ _jsx("span", { className: "font-mono font-bold text-purple-400", children: "\u20B922,800" })
              ] }),
              /* @__PURE__ */ _jsxs("div", { className: "p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center", children: [
                /* @__PURE__ */ _jsxs("div", { children: [
                  /* @__PURE__ */ _jsx("div", { className: "font-bold text-white", children: "Ashok Leyland Authorized Service Job Card #AL-7741" }),
                  /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-400", children: "Turbo pressure hose renewal + Injector ultrasonic cleaning (TG 12 U 2637)" })
                ] }),
                /* @__PURE__ */ _jsx("span", { className: "font-mono font-bold text-amber-400", children: "\u20B914,200" })
              ] })
            ] })
          ] })
        ] }),
        (drilldownModal.type === "profit" || drilldownModal.type === "margin") && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Gross Margin" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-white mt-1", children: "\u20B9388,400" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "17.4% before fleet overheads" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Fleet Overheads" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-rose-400 mt-1", children: "\u20B9221,529.56" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Insurance, permits, workshop rent" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Net Operational Profit" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-cyan-400 mt-1", children: "\u20B9166,870.44" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "7.5% Net Margin (Target: 8.0%)" })
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs mb-2", children: "Quarterly Profit Trajectory:" }),
            /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center text-xs py-2 border-b border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "January 2024:" }),
              /* @__PURE__ */ _jsx("span", { className: "font-mono text-white", children: "\u20B9134,200 (6.1% Margin)" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center text-xs py-2 border-b border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "February 2024:" }),
              /* @__PURE__ */ _jsx("span", { className: "font-mono text-white", children: "\u20B9148,600 (6.8% Margin)" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center text-xs py-2", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400", children: "March 2024 (Current):" }),
              /* @__PURE__ */ _jsx("span", { className: "font-mono font-bold text-emerald-400", children: "\u20B9166,870.44 (7.5% Margin)" })
            ] })
          ] })
        ] }),
        (drilldownModal.type === "trips" || drilldownModal.type === "manifest") && /* @__PURE__ */ _jsx("div", { className: "space-y-4", children: /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ _jsxs("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs", children: drilldownModal.type === "manifest" ? `Dispatches on Mar ${drilldownModal.data?.day}, 2024 (${drilldownModal.data?.trips} Trips Recorded):` : "Fleet Trip Status Breakdown (314 Trips):" }),
            /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: "Real-Time Dispatch Feed" })
          ] }),
          /* @__PURE__ */ _jsx("div", { className: "overflow-x-auto max-h-80 overflow-y-auto", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left", children: [
            /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "LR Number" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Truck No" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Driver" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Client" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Corridor Route" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Freight" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Status" })
            ] }) }),
            /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: (drilldownModal.data?.list || sampleTripsManifest).map((t, idx) => /* @__PURE__ */ _jsxs("tr", { className: "hover:bg-slate-900/60", children: [
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-mono text-cyan-400 font-bold", children: t.lrNo }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-bold text-white", children: t.truck }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-300", children: t.driver }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-400", children: t.client }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-semibold text-white", children: t.route }),
              /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: [
                "\u20B9",
                t.freight.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.status === "Delivered" ? "bg-emerald-500/20 text-emerald-300" : t.status === "In Transit" ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"}`, children: t.status }) })
            ] }, idx)) })
          ] }) })
        ] }) }),
        drilldownModal.type === "utilization" && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Commercial Trucks" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-white mt-1", children: "12 Heavy Trucks" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "100% RC & Tax Compliant" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Active in Transit" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-blue-400 mt-1", children: "9 Commercial Trucks" }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Live on highways" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Overall Fleet Utilization" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-teal-400 mt-1", children: currentMetrics.utilization }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Target: 80%" })
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Live Fleet Roster (12 Commercial Trucks):" }),
            /* @__PURE__ */ _jsx("div", { className: "overflow-x-auto max-h-72 overflow-y-auto", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left", children: [
              /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Truck Number" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Vehicle Model" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Assigned Driver" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Current Location" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Odometer (km)" }),
                /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Health Status" })
              ] }) }),
              /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: fleetTrucks.map((t) => /* @__PURE__ */ _jsxs("tr", { className: "hover:bg-slate-900/60", children: [
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-bold text-white font-mono", children: t.number }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-300", children: t.brand }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-300 font-semibold", children: t.driver }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-400", children: t.location }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: t.odometer.toLocaleString() }),
                /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.health.includes("Service Due") ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`, children: t.health }) })
              ] }, t.number)) })
            ] }) })
          ] })
        ] }),
        (drilldownModal.type === "drivers" || drilldownModal.type === "driver_detail") && /* @__PURE__ */ _jsx("div", { className: "space-y-4", children: /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs mb-3", children: "Driver Crew Performance & Telematics Scorecards (10 Drivers):" }),
          /* @__PURE__ */ _jsx("div", { className: "overflow-x-auto max-h-80 overflow-y-auto", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left", children: [
            /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Driver Name" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Experience" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Assigned Truck" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Decoupled Mileage" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Safety Score" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Trips Done" }),
              /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Performance Tag" })
            ] }) }),
            /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: fleetDrivers.map((d) => /* @__PURE__ */ _jsxs("tr", { className: "hover:bg-slate-900/60", children: [
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-bold text-white", children: d.name }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-400", children: d.exp }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-mono text-slate-300", children: d.truck }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: d.mileage }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-cyan-400", children: d.score }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: d.trips }),
              /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${d.status.includes("Eco-Training") ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`, children: d.status }) })
            ] }, d.name)) })
          ] }) })
        ] }) }),
        drilldownModal.type === "all_routes" && /* @__PURE__ */ _jsx("div", { className: "space-y-4", children: /* @__PURE__ */ _jsx("div", { className: "max-h-96 overflow-y-auto pr-1", children: /* @__PURE__ */ _jsxs("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ _jsx("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2", children: /* @__PURE__ */ _jsxs("tr", { children: [
            /* @__PURE__ */ _jsx("th", { className: "py-2", children: "#" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Route Corridor" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2", children: "Highway Link" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Trips" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Distance (km)" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Fuel Cost" }),
            /* @__PURE__ */ _jsx("th", { className: "py-2 text-right", children: "Profit Margin" })
          ] }) }),
          /* @__PURE__ */ _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: allRoutesData.map((r, idx) => /* @__PURE__ */ _jsxs("tr", { className: "hover:bg-slate-800/40", children: [
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: idx + 1 }),
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 font-bold text-white", children: r.route }),
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-slate-400 text-[11px]", children: r.highway }),
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: r.trips }),
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: r.distance.toLocaleString() }),
            /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: [
              "\u20B9",
              r.revenue.toLocaleString("en-IN")
            ] }),
            /* @__PURE__ */ _jsxs("td", { className: "py-2.5 text-right font-mono text-cyan-400", children: [
              "\u20B9",
              r.fuelCost.toLocaleString("en-IN")
            ] }),
            /* @__PURE__ */ _jsx("td", { className: "py-2.5 text-right font-mono font-bold text-emerald-400", children: r.margin })
          ] }, idx)) })
        ] }) }) }),
        drilldownModal.type === "route" && drilldownModal.data && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Trips" }),
              /* @__PURE__ */ _jsxs("div", { className: "text-lg font-black text-white mt-1", children: [
                drilldownModal.data.trips,
                " Trips"
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "March 2024" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Total Distance" }),
              /* @__PURE__ */ _jsxs("div", { className: "text-lg font-black text-cyan-400 mt-1", children: [
                drilldownModal.data.distance,
                " km"
              ] }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-slate-500", children: "Across convoys" })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Billed Revenue" }),
              /* @__PURE__ */ _jsxs("div", { className: "text-lg font-black text-emerald-400 mt-1", children: [
                "\u20B9",
                drilldownModal.data.revenue.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ _jsxs("span", { className: "text-[10px] text-slate-500", children: [
                "Top: ",
                drilldownModal.data.topClient
              ] })
            ] }),
            /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-slate-400 text-[10px] uppercase font-bold", children: "Profit Margin" }),
              /* @__PURE__ */ _jsx("div", { className: "text-lg font-black text-purple-400 mt-1", children: drilldownModal.data.margin }),
              /* @__PURE__ */ _jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "Optimal Corridor" })
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2", children: [
            /* @__PURE__ */ _jsx("div", { className: "font-bold text-white text-xs", children: "Corridor Logistics Profile:" }),
            /* @__PURE__ */ _jsxs("div", { className: "text-slate-300 space-y-1", children: [
              /* @__PURE__ */ _jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ _jsx("strong", { children: "Primary Highway Link:" }),
                " ",
                drilldownModal.data.highway
              ] }),
              /* @__PURE__ */ _jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ _jsx("strong", { children: "Major Corporate Shipper:" }),
                " ",
                drilldownModal.data.topClient
              ] }),
              /* @__PURE__ */ _jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ _jsx("strong", { children: "Return Load Availability:" }),
                " High (88% backhaul availability from industrial clusters)"
              ] }),
              /* @__PURE__ */ _jsxs("div", { children: [
                "\u2022 ",
                /* @__PURE__ */ _jsx("strong", { children: "Average Door-to-Door Transit:" }),
                " 42 hours with GPS geofenced waypoints"
              ] })
            ] })
          ] })
        ] }),
        drilldownModal.type === "all_alerts" && /* @__PURE__ */ _jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-1", children: fleetAlerts.map((alt) => /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center", children: [
          /* @__PURE__ */ _jsxs("div", { children: [
            /* @__PURE__ */ _jsxs("div", { className: "font-bold text-white text-xs flex items-center gap-1.5", children: [
              /* @__PURE__ */ _jsx("span", { children: alt.icon }),
              " ",
              alt.title
            ] }),
            /* @__PURE__ */ _jsx("p", { className: "text-[11px] text-slate-400 mt-1", children: alt.description }),
            /* @__PURE__ */ _jsxs("span", { className: "text-[10px] text-slate-500 mt-1 inline-block", children: [
              alt.time,
              " \u2022 ",
              alt.category
            ] })
          ] }),
          /* @__PURE__ */ _jsx(
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
        drilldownModal.type === "alert_action" && drilldownModal.data && /* @__PURE__ */ _jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ _jsxs("div", { className: "p-4 bg-slate-950 rounded-2xl border border-slate-800", children: [
            /* @__PURE__ */ _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ _jsx("span", { className: "text-xl", children: drilldownModal.data.icon }),
              /* @__PURE__ */ _jsx("h4", { className: "font-bold text-white text-sm", children: drilldownModal.data.title })
            ] }),
            /* @__PURE__ */ _jsx("p", { className: "text-slate-300 text-xs mb-3", children: drilldownModal.data.description }),
            /* @__PURE__ */ _jsxs("div", { className: "text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ _jsx("strong", { children: "Audit Classification:" }),
              " ",
              drilldownModal.data.category,
              " \u2022 Logged: ",
              drilldownModal.data.time
            ] })
          ] }),
          /* @__PURE__ */ _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
            /* @__PURE__ */ _jsx(
              "button",
              {
                type: "button",
                onClick: closeDrilldown,
                className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer",
                children: "Dismiss"
              }
            ),
            /* @__PURE__ */ _jsxs(
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
      /* @__PURE__ */ _jsx("div", { className: "flex justify-end pt-3 border-t border-slate-800", children: /* @__PURE__ */ _jsx(
        "button",
        {
          type: "button",
          onClick: closeDrilldown,
          className: "px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer",
          children: "Close Deep Drilldown"
        }
      ) })
    ] }) }),
    isProfileModalOpen && /* @__PURE__ */ _jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-center", children: [
      /* @__PURE__ */ _jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg mx-auto", children: "JB" }),
      /* @__PURE__ */ _jsxs("div", { children: [
        /* @__PURE__ */ _jsx("h3", { className: "font-bold text-white text-base", children: "John B." }),
        /* @__PURE__ */ _jsx("p", { className: "text-xs text-slate-400", children: "Chief Fleet Operations & Telematics" })
      ] }),
      /* @__PURE__ */ _jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300", children: [
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsx("strong", { children: "Role:" }),
          " Super Admin / Fleet Dispatcher"
        ] }),
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsx("strong", { children: "Portal:" }),
          " Jai Bhavani Cargo ERP v78"
        ] }),
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsx("strong", { children: "Access Level:" }),
          " Complete Read/Write/Export"
        ] }),
        /* @__PURE__ */ _jsxs("div", { children: [
          /* @__PURE__ */ _jsx("strong", { children: "Active Fleet Scope:" }),
          " ",
          fleetTrucks.length,
          " Heavy Commercial Trucks"
        ] })
      ] }),
      /* @__PURE__ */ _jsx(
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


import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";const Kt=({filters:l,setFilters:i,onApply:f,onReset:u})=>{const a=A=>{const V=new Date;let _="",E="";if(A==="this_month")_=Se(We(V),"yyyy-MM-dd"),E=Se(Ue(V),"yyyy-MM-dd");else if(A==="last_month"){const P=nt(V,1);_=Se(We(P),"yyyy-MM-dd"),E=Se(Ue(P),"yyyy-MM-dd")}else A==="last_3_months"?(_=Se(We(nt(V,2)),"yyyy-MM-dd"),E=Se(Ue(V),"yyyy-MM-dd")):A==="fy_25_26"?(_="2025-04-01",E="2026-03-31"):A==="all"&&(_="",E="");const re={...l,startDate:_,endDate:E};i(re),f&&setTimeout(()=>f(re),0)};return e.jsxs("div",{className:"bg-slate-900/65 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 px-4 shadow-md mb-5 flex flex-wrap items-center gap-4 text-xs font-sans",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3.5 flex-1 min-w-[280px]",children:[e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"Start"}),e.jsx(ue,{type:"date",value:l.startDate,onChange:A=>i({...l,startDate:A.target.value}),className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"End"}),e.jsx(ue,{type:"date",value:l.endDate,onChange:A=>i({...l,endDate:A.target.value}),className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-medium w-[125px] px-2.5 py-0 text-white"})]}),e.jsxs("div",{className:"flex items-center gap-2 min-w-[130px] shrink-0",children:[e.jsx("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0",children:"View"}),e.jsxs(ne,{value:l.period,onValueChange:A=>i({...l,period:A}),children:[e.jsx(oe,{className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-bold py-0 text-slate-200",children:e.jsx(ie,{placeholder:"Period"})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(T,{value:"monthly",children:"Monthly View"}),e.jsx(T,{value:"quarterly",children:"Quarterly Breakdown"}),e.jsx(T,{value:"annual",children:"Annual Summary"})]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-3 flex-wrap sm:flex-nowrap",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-[140px] shrink-0",children:[e.jsxs("span",{className:"text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1",children:[e.jsx(bt,{className:"w-3 h-3 text-amber-400"})," Range"]}),e.jsxs(ne,{onValueChange:a,children:[e.jsx(oe,{className:"bg-slate-950/60 border-slate-800 rounded-xl h-8 text-[11px] font-black py-0 text-amber-300",children:e.jsx(ie,{placeholder:"Quick Range"})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(T,{value:"this_month",children:"This Month"}),e.jsx(T,{value:"last_month",children:"Last Month"}),e.jsx(T,{value:"last_3_months",children:"Last 3 Months"}),e.jsx(T,{value:"fy_25_26",children:"FY 2025-26"}),e.jsx(T,{value:"all",children:"All Time"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsxs(Me,{variant:"outline",onClick:u,className:"rounded-xl h-8 text-[11px] font-bold border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 px-3",children:[e.jsx(gt,{className:"w-3 h-3 mr-1 text-slate-400"})," Reset"]}),e.jsxs(Me,{onClick:f,className:"rounded-xl h-8 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-sm gap-1 px-3.5",children:[e.jsx(ft,{className:"w-3 h-3"})," Apply"]})]})]})]})},qt=({data:l})=>!l||l.length===0?e.jsx("div",{className:"p-8 text-center text-muted-foreground border border-border rounded-2xl bg-card",children:"No monthly data available."}):e.jsx("div",{className:"rounded-2xl border border-border bg-card overflow-hidden shadow-sm",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-muted/50",children:e.jsxs(le,{children:[e.jsx(q,{className:"font-semibold",children:"Month"}),e.jsx(q,{className:"text-right font-semibold",children:"Revenue"}),e.jsx(q,{className:"text-right font-semibold",children:"Expenses"}),e.jsx(q,{className:"text-right font-semibold",children:"Profit"}),e.jsx(q,{className:"text-right font-semibold",children:"Margin"}),e.jsx(q,{className:"text-right font-semibold",children:"MoM Growth"})]})}),e.jsx(Ze,{children:l.map((i,f)=>e.jsxs(le,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(N,{className:"font-medium",children:i.month}),e.jsxs(N,{className:"text-right tabular-nums",children:["₹",i.revenue.toLocaleString()]}),e.jsxs(N,{className:"text-right tabular-nums",children:["₹",i.expenses.toLocaleString()]}),e.jsxs(N,{className:`text-right tabular-nums font-medium ${i.profit>=0?"text-success":"text-destructive"}`,children:["₹",i.profit.toLocaleString()]}),e.jsxs(N,{className:"text-right tabular-nums",children:[i.margin.toFixed(1),"%"]}),e.jsx(N,{className:"text-right tabular-nums",children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[i.momGrowth>0?e.jsx(_e,{className:"w-4 h-4 text-success"}):i.momGrowth<0?e.jsx(et,{className:"w-4 h-4 text-destructive"}):e.jsx(jt,{className:"w-4 h-4 text-muted-foreground"}),e.jsxs("span",{className:i.momGrowth>0?"text-success":i.momGrowth<0?"text-destructive":"text-muted-foreground",children:[Math.abs(i.momGrowth).toFixed(1),"%"]})]})})]},i.sortKey))})]})}),dt=["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6"],tt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg",children:[e.jsx("p",{className:"font-medium text-foreground mb-2",children:f}),i.map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-4 text-sm",children:[e.jsxs("span",{style:{color:u.color},children:[u.name,":"]}),e.jsxs("span",{className:"font-semibold tabular-nums",children:["₹",u.value.toLocaleString(void 0,{maximumFractionDigits:0})]})]},a))]}):null,Ht=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(ht,{data:l,margin:{top:10,right:10,left:10,bottom:5},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:8}),e.jsx(Fe,{yAxisId:"left",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:i=>`₹${(i/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{wrapperStyle:{paddingTop:"15px"},iconType:"circle",iconSize:8}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"revenue",name:"Revenue",stroke:"#6366f1",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#6366f1"},activeDot:{r:6,strokeWidth:0,fill:"#6366f1"},connectNulls:!0}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"expenses",name:"Expenses",stroke:"#f43f5e",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#f43f5e"},activeDot:{r:6,strokeWidth:0,fill:"#f43f5e"},connectNulls:!0}),e.jsx(Ae,{yAxisId:"left",type:"monotone",dataKey:"profit",name:"Profit",stroke:"#10b981",strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:"#10b981"},activeDot:{r:6,strokeWidth:0,fill:"#10b981"},connectNulls:!0})]})})}),ct=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(Ot,{children:[e.jsx(zt,{data:l,cx:"50%",cy:"40%",innerRadius:60,outerRadius:90,paddingAngle:2,dataKey:"value",children:l.map((i,f)=>e.jsx(Gt,{fill:dt[f%dt.length]},`cell-${f}`))}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{layout:"horizontal",verticalAlign:"bottom",align:"center",wrapperStyle:{paddingTop:"10px"},iconType:"circle",iconSize:8})]})})}),xt=({data:l})=>e.jsx("div",{className:"w-full h-[320px] sm:h-[360px] analytics-chart-container",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(pt,{data:l,margin:{top:10,right:10,left:10,bottom:5},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"quarter",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:8}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:i=>`₹${(i/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(tt,{})}),e.jsx(Ee,{wrapperStyle:{paddingTop:"15px"},iconType:"circle",iconSize:8}),e.jsx(De,{dataKey:"revenue",name:"Revenue",fill:"#6366f1",radius:[4,4,0,0]}),e.jsx(De,{dataKey:"expenses",name:"Expenses",fill:"#f43f5e",radius:[4,4,0,0]}),e.jsx(De,{dataKey:"profit",name:"Profit",fill:"#10b981",radius:[4,4,0,0]})]})})}),Ce=["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#a78bfa","#06b6d4","#f97316"],Wt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg min-w-[200px]",children:[e.jsx("p",{className:"font-medium text-foreground mb-2 pb-2 border-b border-border",children:f}),e.jsx("div",{className:"space-y-1",children:i.slice().sort((u,a)=>(a.value||0)-(u.value||0)).map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-6 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-full",style:{backgroundColor:u.color}}),e.jsx("span",{className:"text-muted-foreground",children:u.name})]}),e.jsxs("span",{className:"font-semibold tabular-nums text-foreground",children:["₹",typeof u.value=="number"?u.value.toLocaleString(void 0,{maximumFractionDigits:0}):u.value||0]})]},a))})]}):null,Qe=({data:l,categories:i,title:f})=>e.jsxs(v,{className:"shadow-sm border-border",children:[e.jsx(L,{children:e.jsx(R,{className:"text-lg",children:f})}),e.jsx(k,{children:e.jsx("div",{className:"w-full h-[350px]",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(ht,{data:l||[],margin:{top:10,right:10,left:10,bottom:20},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"rgba(255,255,255,0.05)",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,dy:10}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:11,tickLine:!1,axisLine:!1,tickFormatter:u=>`₹${((u||0)/1e3).toFixed(0)}k`,dx:-5}),e.jsx(Re,{content:e.jsx(Wt,{})}),e.jsx(Ee,{wrapperStyle:{bottom:-10,paddingTop:"15px"},iconType:"circle",iconSize:8}),(i||[]).map((u,a)=>e.jsx(Ae,{type:"monotone",dataKey:u,name:u,stroke:Ce[a%Ce.length],strokeWidth:3,dot:{r:4,strokeWidth:1.5,fill:"#0a0f1e",stroke:Ce[a%Ce.length]},activeDot:{r:6,strokeWidth:0,fill:Ce[a%Ce.length]},connectNulls:!0},u))]})})})})]}),Ut=({chartData:l})=>!l||!l.categories||l.categories.length===0?null:e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-6",children:[e.jsx(Qe,{data:l.revenueData,categories:l.categories,title:"Revenue Trend by Category"}),e.jsx(Qe,{data:l.expensesData,categories:l.categories,title:"Expense Trend by Category"}),e.jsx("div",{className:"xl:col-span-2",children:e.jsx(Qe,{data:l.profitData,categories:l.categories,title:"Profit Trend by Category"})})]}),mt=["hsl(var(--chart-1))","hsl(var(--chart-2))","hsl(var(--chart-3))","hsl(var(--chart-4))","hsl(var(--chart-5))","hsl(200, 70%, 50%)","hsl(250, 70%, 60%)","hsl(330, 70%, 50%)"],Qt=({active:l,payload:i,label:f})=>l&&i&&i.length?e.jsxs("div",{className:"bg-popover border border-border p-3 rounded-lg shadow-lg min-w-[200px]",children:[e.jsx("p",{className:"font-medium text-foreground mb-2 pb-2 border-b border-border",children:f}),e.jsx("div",{className:"space-y-1",children:i.slice().sort((u,a)=>a.value-u.value).map((u,a)=>e.jsxs("div",{className:"flex items-center justify-between gap-6 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded-sm",style:{backgroundColor:u.color}}),e.jsx("span",{className:"text-muted-foreground",children:u.name})]}),e.jsxs("span",{className:"font-semibold tabular-nums text-foreground",children:["₹",u.value.toLocaleString(void 0,{maximumFractionDigits:0})]})]},a))})]}):null,Je=({data:l,categories:i,title:f})=>e.jsxs(v,{className:"shadow-sm border-border",children:[e.jsx(L,{children:e.jsx(R,{className:"text-lg",children:f})}),e.jsx(k,{children:e.jsx("div",{className:"w-full h-[350px]",children:e.jsx(Le,{width:"100%",height:"100%",children:e.jsxs(pt,{data:l,margin:{top:10,right:10,left:10,bottom:20},children:[e.jsx($e,{strokeDasharray:"3 3",stroke:"hsl(var(--border))",vertical:!1}),e.jsx(Ie,{dataKey:"month",stroke:"hsl(var(--muted-foreground))",fontSize:12,tickLine:!1,axisLine:!1}),e.jsx(Fe,{stroke:"hsl(var(--muted-foreground))",fontSize:12,tickLine:!1,axisLine:!1,tickFormatter:u=>`₹${(u/1e3).toFixed(0)}k`}),e.jsx(Re,{content:e.jsx(Qt,{})}),e.jsx(Ee,{wrapperStyle:{bottom:0,paddingTop:"20px"}}),i.map((u,a)=>e.jsx(De,{dataKey:u,name:u,fill:mt[a%mt.length],radius:[4,4,0,0],maxBarSize:40},u))]})})})})]}),Jt=({chartData:l})=>!l||l.categories.length===0?null:e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-6",children:[e.jsx(Je,{data:l.revenueData,categories:l.categories,title:"Revenue Comparison by Month"}),e.jsx(Je,{data:l.expensesData,categories:l.categories,title:"Expense Comparison by Month"}),e.jsx("div",{className:"xl:col-span-2",children:e.jsx(Je,{data:l.profitData,categories:l.categories,title:"Profit Comparison by Month"})})]}),Xt=({startDate:l,endDate:i})=>{const[f,u]=C.useState(!0),[a,A]=C.useState([]),[V,_]=C.useState([]),[E,re]=C.useState([]),[P,pe]=C.useState("12"),[be,Pe]=C.useState("18"),[ce,Ve]=C.useState(new Date().toISOString().substring(0,7)),[J,ye]=C.useState({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}});C.useEffect(()=>{const x=`ca_compliance_${ce}`,y=localStorage.getItem(x);if(y)try{ye(JSON.parse(y))}catch{ye({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}})}else ye({gstr1:{status:"Pending",date:""},gstr3b:{status:"Pending",date:""},tds26q:{status:"Pending",date:""},itr6:{status:"Pending",date:""}})},[ce]);const Z=(x,y,ee)=>{ye(X=>{const H={...X,[x]:{...X[x],[y]:ee}};return localStorage.setItem(`ca_compliance_${ce}`,JSON.stringify(H)),H}),ve.success("Compliance checklist updated")},ge=async()=>{u(!0);try{let x="";l&&i&&(x=`date >= "${l} 00:00:00" && date <= "${i} 23:59:59"`);const[y,ee,X]=await Promise.all([Te.collection("trip_logs").getFullList({filter:x||void 0,$autoCancel:!1}),Te.collection("expenses").getFullList({filter:x||void 0,$autoCancel:!1}),Te.collection("clients").getFullList({$autoCancel:!1})]);A(y),_(ee),re(X)}catch(x){console.error("Error fetching CA data:",x),ve.error("Failed to load compliance data")}finally{u(!1)}};C.useEffect(()=>{ge()},[l,i]);const p=C.useMemo(()=>{const x=a.reduce((S,w)=>S+(Number(w.revenue)||0),0),y=a.reduce((S,w)=>S+(Number(w.tds_deducted_receivable)||0),0),ee=x-y;let X=0,H=0;V.forEach(S=>{const w=Number(S.amount)||0,G=(S.category||"").toLowerCase(),U=(S.subcategory||"").toLowerCase();G==="maintenance"||U==="maintenance"?X+=w:H+=w});const Y=X+H,D=ee-Y,te=x*(Number(P)/100),we=X*(Number(be)/100),Ge=te-we;let d=0,h=0,n=0,b=0;a.forEach(S=>{const w=Number(S.revenue)||0,G=S.client_payment_status==="received",U=S.ownership_type==="Attached";G||(d+=w,U&&(h+=Number(S.vendor_payout)||0)),U?b+=Number(S.brokerage_margin)||0:n+=w});const m=n-y-Y,fe=m+b,W={};return a.forEach(S=>{const w=S.client_id;if(!w)return;const G=Number(S.revenue)||0,U=Number(S.tds_deducted_receivable)||0;if(!W[w]){const se=E.find(he=>he.id===w);W[w]={clientName:se?.client_name||"Unknown Client",gstin:se?.gst_number||"N/A",pan:se?.pan_number||"N/A",volume:0,tdsHeld:0}}W[w].volume+=G,W[w].tdsHeld+=U}),{grossRevenue:x,tdsDeducted:y,netRevenue:ee,totalExpenses:Y,profitBeforeTax:D,outwardGst:te,inputTaxCredit:we,netGstPayable:Ge,accountsReceivable:d,accountsPayable:h,fleetProfitNet:m,brokerageProfit:b,retainedEarnings:fe,tdsLedger:Object.values(W).sort((S,w)=>w.tdsHeld-S.tdsHeld)}},[a,V,E,P,be]),Be=()=>{try{const x=["Type","Identifier/Client/Category","Tax ID (GST/PAN)","Gross Amount (₹)","TDS Deducted (₹)","Estimated GST Liability (₹)"],y=[];y.push(["OVERVIEW","Gross Booking Revenue","",p.grossRevenue,p.tdsDeducted,p.outwardGst]),y.push(["OVERVIEW","Total Expenses","",p.totalExpenses,0,-p.inputTaxCredit]),y.push(["OVERVIEW","Net Profit Before Taxes","",p.profitBeforeTax,0,0]),y.push(["OVERVIEW","Net GST Payable/ITC Refund","","","",p.netGstPayable]),y.push([]),y.push(["CLIENT LEDGER","Client Name","GSTIN / PAN","Gross Volume Processed (₹)","TDS Held Back (₹)",""]),p.tdsLedger.forEach(D=>{y.push(["CLIENT",D.clientName,`${D.gstin} / ${D.pan}`,D.volume,D.tdsHeld,""])}),y.push([]),y.push(["EXPENSE DETAIL","Category","Description","Amount (₹)","Date","GST Claimable (₹)"]),V.forEach(D=>{const we=(D.category||"").toLowerCase()==="maintenance"||(D.subcategory||"").toLowerCase()==="maintenance"?D.amount*(Number(be)/100):0;y.push(["EXPENSE",D.category||"Other",D.description||"",D.amount||0,D.date?D.date.substring(0,10):"",we])});const ee=[x.join(","),...y.map(D=>D.map(te=>typeof te=="string"?`"${te.replace(/"/g,'""')}"`:te).join(","))].join(`
`),X=new Blob([ee],{type:"text/csv;charset=utf-8;"}),H=URL.createObjectURL(X),Y=document.createElement("a");Y.setAttribute("href",H),Y.setAttribute("download",`CA_Compliance_Pack_${ce}.csv`),document.body.appendChild(Y),Y.click(),document.body.removeChild(Y),ve.success("CA Compliance Package exported successfully")}catch(x){console.error(x),ve.error("Failed to export CSV package")}},B=x=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.abs(x||0));return f?e.jsxs("div",{className:"flex flex-col items-center justify-center p-12 min-h-[300px]",children:[e.jsx(Nt,{className:"w-10 h-10 animate-spin text-primary mb-3"}),e.jsx("p",{className:"text-sm text-slate-400",children:"Loading tax compliance data..."})]}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-xl font-bold flex items-center gap-2 text-slate-100",children:[e.jsx(vt,{className:"w-5 h-5 text-blue-500"}),"Chartered Accountant Tax Auditing Center"]}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Reconcile outward GST liabilities, input tax credits, and client TDS holdings with compliance checklists."})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(Me,{onClick:Be,className:"bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 h-10 text-xs font-semibold shadow-md",children:[e.jsx(yt,{className:"w-4 h-4"}),"Export Audit Pack for CA"]}),e.jsx(Me,{variant:"outline",onClick:ge,className:"bg-slate-950 border-slate-800 text-slate-400 hover:text-white rounded-xl h-10 w-10 shrink-0",children:e.jsx(wt,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Gross Booking Volume"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 tabular-nums text-slate-200",children:B(p.grossRevenue)}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsx("span",{children:"Total TDS Deductions:"}),e.jsx("span",{className:"font-semibold text-red-400",children:B(p.tdsDeducted)})]})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"GST Tax Position"}),e.jsxs("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.netGstPayable>=0?"text-amber-400":"text-emerald-400"}`,children:[B(p.netGstPayable)," ",p.netGstPayable>=0?"Payable":"Credit"]}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsxs("span",{children:["Outward GST (",P,"%): ",B(p.outwardGst)]}),e.jsxs("span",{children:["ITC Credit (",be,"%): ",B(p.inputTaxCredit)]})]})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Profit Net of Deductions"}),e.jsx("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.profitBeforeTax>=0?"text-emerald-400":"text-red-400"}`,children:B(p.profitBeforeTax)}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400",children:[e.jsxs("span",{children:["Net Settled Revenue: ",B(p.netRevenue)]}),e.jsxs("span",{children:["Total Expenses: ",B(p.totalExpenses)]})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-sky-400 to-blue-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Accounts Receivable (AR)"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 text-blue-400 tabular-nums",children:B(p.accountsReceivable)}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-2",children:"Outstanding client invoicing balance"})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-500 to-amber-600"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Accounts Payable (AP)"}),e.jsx("h3",{className:"text-2xl font-extrabold mt-3 text-amber-500 tabular-nums",children:B(p.accountsPayable)}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-2",children:"Owed to attached vehicle vendors"})]})]}),e.jsxs(v,{className:"relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md hover:shadow-md transition-all duration-300",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-purple-500"}),e.jsxs(k,{className:"p-6",children:[e.jsx("p",{className:"text-xs font-semibold text-slate-400 uppercase tracking-wider",children:"Retained Earnings / Retained Profit"}),e.jsx("h3",{className:`text-2xl font-extrabold mt-3 tabular-nums ${p.retainedEarnings>=0?"text-emerald-400":"text-red-400"}`,children:B(p.retainedEarnings)}),e.jsxs("p",{className:"text-[11px] text-slate-400 mt-2",children:["Fleet Profit: ",B(p.fleetProfitNet)," | Brokerage: ",B(p.brokerageProfit)]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-slate-400",children:"Estimate Outward GST Rate (On Booking Revenue)"}),e.jsxs(ne,{value:P,onValueChange:pe,children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-slate-200",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"5",children:"5% (Transport service without ITC / RCM)"}),e.jsx(T,{value:"12",children:"12% (Forward Charge with full ITC - Default)"}),e.jsx(T,{value:"18",children:"18% (Rental / Luxury Operations)"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-bold uppercase tracking-wider text-slate-400",children:"Estimate Input GST Credit (ITC on Maintenance & Bills)"}),e.jsxs(ne,{value:be,onValueChange:Pe,children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-slate-200",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"12",children:"12% (Contract Maintenance Services)"}),e.jsx(T,{value:"18",children:"18% (Automotive Parts & Garage Invoices - Default)"}),e.jsx(T,{value:"28",children:"28% (Lubricants & Select Spares)"})]})]})]})]}),e.jsxs(v,{className:"bg-slate-900 border-slate-800 text-slate-100 rounded-2xl",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800 mb-4",children:[e.jsxs(R,{className:"text-base font-bold flex items-center gap-2",children:[e.jsx(ut,{className:"w-4 h-4 text-blue-500"}),"TDS Claims Ledger (Form 26AS Reconciliation)"]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Cross-reference client deductions against your Form 26AS dashboard to claim withholding credit refunds during ITR filing."})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-slate-950/60 border-b border-slate-800",children:e.jsxs(le,{className:"border-b-slate-800",children:[e.jsx(q,{className:"text-slate-300 font-semibold",children:"Client Name"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Tax ID (GSTIN / PAN)"}),e.jsx(q,{className:"text-slate-300 font-semibold text-right",children:"Gross Booking volume"}),e.jsx(q,{className:"text-slate-300 font-semibold text-right pr-6",children:"TDS Held Back (Credit)"})]})}),e.jsx(Ze,{children:p.tdsLedger.length===0?e.jsx(le,{children:e.jsx(N,{colSpan:4,className:"text-center py-8 text-slate-400",children:"No client TDS records compiled. Ensure client setup has Applies TDS toggled active."})}):p.tdsLedger.map((x,y)=>e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:x.clientName}),e.jsxs(N,{className:"space-y-0.5",children:[e.jsxs("div",{className:"text-xs",children:["GST: ",e.jsx("span",{className:"font-mono font-medium text-slate-300",children:x.gstin})]}),e.jsxs("div",{className:"text-xs",children:["PAN: ",e.jsx("span",{className:"font-mono font-medium text-slate-300",children:x.pan})]})]}),e.jsx(N,{className:"text-right font-medium tabular-nums text-slate-200",children:B(x.volume)}),e.jsx(N,{className:"text-right font-extrabold tabular-nums text-red-400 pr-6",children:B(x.tdsHeld)})]},y))})]})})]}),e.jsxs(v,{className:"bg-slate-900 border-slate-800 text-slate-100 rounded-2xl",children:[e.jsxs(L,{className:"pb-3 border-b border-slate-800 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4",children:[e.jsxs("div",{children:[e.jsxs(R,{className:"text-base font-bold flex items-center gap-2",children:[e.jsx(kt,{className:"w-4 h-4 text-blue-500"}),"Tax Compliance Calendar & Return Checklist"]}),e.jsx(Q,{className:"text-xs text-slate-400",children:"Track deadlines and record completion dates for GST and TDS return filings."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-400 font-semibold",children:"Audited Month:"}),e.jsx(ue,{type:"month",value:ce,onChange:x=>Ve(x.target.value),className:"bg-slate-950 border-slate-800 text-slate-200 h-9 w-[150px] text-xs"})]})]}),e.jsx(k,{className:"p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(Xe,{children:[e.jsx(Ye,{className:"bg-slate-950/60 border-b border-slate-800",children:e.jsxs(le,{className:"border-b-slate-800",children:[e.jsx(q,{className:"text-slate-300 font-semibold",children:"Form Code"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Compliance Return Description"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Standard Deadline"}),e.jsx(q,{className:"text-slate-300 font-semibold",children:"Filing Status"}),e.jsx(q,{className:"text-slate-300 font-semibold pr-6",children:"Completion Date"})]})}),e.jsxs(Ze,{children:[e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"GSTR-1"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Outward Supplies Return (Sales invoices summary to claim client ITC)"}),e.jsx(N,{className:"text-xs",children:"11th of subsequent month"}),e.jsx(N,{children:e.jsxs(ne,{value:J.gstr1.status,onValueChange:x=>Z("gstr1","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.gstr1.date,onChange:x=>Z("gstr1","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"GSTR-3B"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Monthly Self-Declared Summary Return (GST Payment settlement)"}),e.jsx(N,{className:"text-xs",children:"20th of subsequent month"}),e.jsx(N,{children:e.jsxs(ne,{value:J.gstr3b.status,onValueChange:x=>Z("gstr3b","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.gstr3b.date,onChange:x=>Z("gstr3b","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"Form 26Q"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Quarterly TDS Return (Deductions on payments other than salaries)"}),e.jsx(N,{className:"text-xs",children:"31st of subsequent month after quarter"}),e.jsx(N,{children:e.jsxs(ne,{value:J.tds26q.status,onValueChange:x=>Z("tds26q","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.tds26q.date,onChange:x=>Z("tds26q","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]}),e.jsxs(le,{className:"border-b-slate-800/40 hover:bg-slate-800/10",children:[e.jsx(N,{className:"font-bold text-slate-200",children:"ITR-6"}),e.jsx(N,{className:"text-xs text-slate-300",children:"Annual Income Tax Return (Corporate financial filing for refunds)"}),e.jsx(N,{className:"text-xs",children:"31st October of subsequent fiscal year"}),e.jsx(N,{children:e.jsxs(ne,{value:J.itr6.status,onValueChange:x=>Z("itr6","status",x),children:[e.jsx(oe,{className:"bg-slate-950 border-slate-800 text-xs w-[120px] h-8",children:e.jsx(ie,{})}),e.jsxs(de,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(T,{value:"Pending",children:"Pending"}),e.jsx(T,{value:"Filed",children:"Filed"})]})]})}),e.jsx(N,{className:"pr-6",children:e.jsx(ue,{type:"date",value:J.itr6.date,onChange:x=>Z("itr6","date",x.target.value),className:"bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"})})]})]})]})})})]})]})},Yt=({data:l,color:i="#6366f1"})=>{if(!l||l.length<2)return null;const f=Math.max(...l,1),u=Math.min(...l,0),a=f-u||1,A=80,V=36,_=l.map((E,re)=>{const P=re/(l.length-1)*A,pe=V-(E-u)/a*(V-4)-2;return`${P},${pe}`}).join(" ");return e.jsxs("svg",{width:A,height:V,viewBox:`0 0 ${A} ${V}`,className:"overflow-visible",children:[e.jsx("polyline",{points:_,fill:"none",stroke:i,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("circle",{cx:_.split(" ").pop().split(",")[0],cy:_.split(" ").pop().split(",")[1],r:"3",fill:i})]})},ae=({title:l,value:i,icon:f,trend:u,trendUp:a,isCurrency:A=!0,valueClass:V="",colorClass:_="from-blue-500 to-indigo-500",subLabel:E,subValue:re,sparkData:P})=>e.jsxs(v,{className:"relative overflow-hidden shadow-md border-border/40 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group",children:[e.jsx("div",{className:`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${_}`}),e.jsx("div",{className:`absolute inset-0 bg-gradient-to-br ${_} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}),e.jsxs(k,{className:"p-5",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2 mb-3",children:[e.jsx("p",{className:"text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest leading-tight",children:l}),e.jsx("div",{className:`p-2 rounded-xl bg-gradient-to-br ${_} bg-opacity-10 shrink-0`,children:e.jsx(f,{className:"h-4 w-4 text-white"})})]}),e.jsxs("div",{className:"flex items-end justify-between gap-2",children:[e.jsxs("div",{children:[e.jsxs("div",{className:`text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums ${V}`,children:[A?"₹":"",i]}),E&&e.jsxs("p",{className:"text-[11px] text-muted-foreground mt-1 font-medium",children:[E,": ",e.jsx("span",{className:"text-foreground font-bold",children:re})]}),u&&e.jsxs("div",{className:`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${a!==!1?"text-emerald-400":"text-rose-400"}`,children:[a!==!1?e.jsx(_e,{className:"w-3 h-3"}):e.jsx(et,{className:"w-3 h-3"}),e.jsx("span",{children:u})]})]}),P&&P.length>1&&e.jsx("div",{className:"w-20 h-10 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity",children:e.jsx(Yt,{data:P,color:"#6366f1"})})]})]})]}),us=()=>{return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});const[l,i]=C.useState(!0),[f,u]=C.useState({startDate:"",endDate:"",period:"monthly"}),[a,A]=C.useState({monthly:[],category:[],categoryMonthlyRaw:[],categoryMonthlyCharts:null,quarterly:[],annual:[],totals:{revenue:0,expenses:0,profit:0,margin:0},truckAnalytics:[],trucks:[],loans:[],trips:[],employees:[],fuelTracker:[],expensesList:[]}),[V,_]=C.useState(null),[E,re]=C.useState("overview"),[P,pe]=C.useState("2026-07"),[be,Pe]=C.useState(!1),[ce,Ve]=C.useState({}),[J,ye]=C.useState({}),[Z,ge]=C.useState(!1),[p,Be]=C.useState([]),[B,x]=C.useState(!1),[y,ee]=C.useState({recipient:"",subject:"",body:"",html:"",label:""}),X=()=>{const d=a.totals,h=O=>`₹${Number(O||0).toLocaleString("en-IN")}`,n=f.startDate&&f.endDate?`${f.startDate} to ${f.endDate}`:"All Time",b=`
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
