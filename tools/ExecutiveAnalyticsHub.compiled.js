

function ExecutiveAnalyticsHub() {
  const jsx = e.jsx;
  const jsxs = e.jsxs;
  const Fragment = c.Fragment;
  const [selectedRange, setSelectedRange] = c.useState("30D");
  const [startDate, setStartDate] = c.useState("2024-03-01");
  const [endDate, setEndDate] = c.useState("2024-03-31");
  const [viewType, setViewType] = c.useState("Monthly View");
  const [selectedClient, setSelectedClient] = c.useState("all");
  const [searchQuery, setSearchQuery] = c.useState("");
  const [activeTooltipDay, setActiveTooltipDay] = c.useState(18);
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
  const clientsList = [
    { id: "all", name: "All Clients (Fleet Wide)", revenue: 2229400, expenses: 206252956e-2, trips: 314, margin: "7.5%", dso: "14 Days", outstanding: 345e3, contractType: "Annual Dedicated" },
    { id: "cli_ultratech", name: "UltraTech Cement Ltd", revenue: 742e3, expenses: 654200, trips: 88, margin: "11.8%", dso: "12 Days", outstanding: 11e4, contractType: "Per Ton-KM Index" },
    { id: "cli_amazon", name: "Amazon India Fulfillment", revenue: 514500, expenses: 472e3, trips: 72, margin: "8.3%", dso: "15 Days", outstanding: 85e3, contractType: "Dedicated SXL 32FT" },
    { id: "cli_reliance", name: "Reliance Retail & Logistics", revenue: 368e3, expenses: 338400, trips: 48, margin: "8.0%", dso: "21 Days", outstanding: 64e3, contractType: "Scheduled Linehaul" },
    { id: "cli_tata", name: "Tata Steel Tubes Division", revenue: 245900, expenses: 226800, trips: 36, margin: "7.8%", dso: "14 Days", outstanding: 42e3, contractType: "Heavy Flatbed FTL" },
    { id: "cli_jindal", name: "JSW Steel Coated Products", revenue: 168e3, expenses: 154e3, trips: 24, margin: "8.3%", dso: "18 Days", outstanding: 28e3, contractType: "Dedicated Coil Carriers" },
    { id: "cli_asianpaints", name: "Asian Paints Distribution", revenue: 142e3, expenses: 131500, trips: 22, margin: "7.4%", dso: "10 Days", outstanding: 16e3, contractType: "High Cube Regional" },
    { id: "cli_adani", name: "Adani Wilmar Edible Oils", revenue: 112e3, expenses: 104200, trips: 18, margin: "7.0%", dso: "15 Days", outstanding: 14e3, contractType: "Tanker / Box Truck" },
    { id: "cli_itc", name: "ITC Foods & Personal Care", revenue: 98e3, expenses: 91200, trips: 16, margin: "6.9%", dso: "14 Days", outstanding: 11e3, contractType: "Fast-Moving Palletized" },
    { id: "cli_spot", name: "Ad-hoc Spot Market Brokers", revenue: 89e3, expenses: 98129.56, trips: 14, margin: "-10.3%", dso: "Advance Cash", outstanding: 0, contractType: "Spot Daily Auction" }
  ];
  const allRoutesData = [
    { id: 1, route: "Delhi \u2794 Mumbai", highway: "NH48 / Western Corridor", trips: 48, distance: 7112, revenue: 612400, fuelCost: 248e3, tollCost: 98e3, margin: "12.4%", color: "emerald", topClient: "Amazon India" },
    { id: 2, route: "Bengaluru \u2794 Chennai", highway: "NH44 & NH48", trips: 36, distance: 4062, revenue: 398600, fuelCost: 154e3, tollCost: 64e3, margin: "10.8%", color: "emerald", topClient: "UltraTech Cement" },
    { id: 3, route: "Mumbai \u2794 Ahmedabad", highway: "NH48 Vadodara Expy", trips: 28, distance: 3927, revenue: 331200, fuelCost: 132e3, tollCost: 52e3, margin: "8.6%", color: "emerald", topClient: "Reliance Retail" },
    { id: 4, route: "Chennai \u2794 Hyderabad", highway: "NH16 & NH65", trips: 24, distance: 2816, revenue: 274800, fuelCost: 112e3, tollCost: 44e3, margin: "6.9%", color: "amber", topClient: "Asian Paints" },
    { id: 5, route: "Kolkata \u2794 Delhi", highway: "NH19 Grand Trunk", trips: 18, distance: 2403, revenue: 218400, fuelCost: 92e3, tollCost: 38e3, margin: "5.4%", color: "amber", topClient: "Tata Steel" },
    { id: 6, route: "Hyderabad \u2794 Bengaluru", highway: "NH44 4-Lane Expy", trips: 32, distance: 4560, revenue: 384e3, fuelCost: 148e3, tollCost: 61e3, margin: "11.2%", color: "emerald", topClient: "JSW Steel" },
    { id: 7, route: "Pune \u2794 Goa", highway: "NH48 & Chorla Ghat", trips: 20, distance: 1840, revenue: 195e3, fuelCost: 78e3, tollCost: 31e3, margin: "9.4%", color: "emerald", topClient: "ITC Foods" },
    { id: 8, route: "Ahmedabad \u2794 Jaipur", highway: "NH48 / Kishangarh", trips: 22, distance: 2680, revenue: 232e3, fuelCost: 94e3, tollCost: 37e3, margin: "7.8%", color: "amber", topClient: "Adani Wilmar" },
    { id: 9, route: "Nagpur \u2794 Raipur", highway: "NH53 / East Corridor", trips: 16, distance: 1420, revenue: 145e3, fuelCost: 59e3, tollCost: 22e3, margin: "8.1%", color: "amber", topClient: "Tata Steel" },
    { id: 10, route: "Surat \u2794 Mumbai", highway: "NH48 Coastal Link", trips: 30, distance: 2850, revenue: 26e4, fuelCost: 105e3, tollCost: 41e3, margin: "9.8%", color: "emerald", topClient: "Reliance Retail" },
    { id: 11, route: "Indore \u2794 Bhopal", highway: "Bhopal Expy SH18", trips: 25, distance: 1950, revenue: 175e3, fuelCost: 71e3, tollCost: 28e3, margin: "8.7%", color: "amber", topClient: "UltraTech Cement" },
    { id: 12, route: "Vijayawada \u2794 Visakhapatnam", highway: "NH16 Golden Quad", trips: 15, distance: 1740, revenue: 162e3, fuelCost: 65e3, tollCost: 26e3, margin: "6.2%", color: "amber", topClient: "JSW Steel" }
  ];
  const fleetTrucks = [
    { number: "TG 12 U 2637", brand: "Ashok Leyland 3118", type: "Multi-Axle (8x2)", odometer: 142500, driver: "Ramesh Rathod", status: "Running on NH44", location: "Near Shamshabad", health: "Post-Turbo Overhaul" },
    { number: "TS 07 UE 1234", brand: "Tata Signa 2823.K", type: "SXL 32 FT Box", odometer: 98400, driver: "Suresh Yadav (Master)", status: "In Transit", location: "Krishnagiri Plaza", health: "Benchmark Optimal" },
    { number: "MH 12 AB 1234", brand: "Tata Prima 3528.T", type: "Heavy Flatbed", odometer: 178900, driver: "Vikram Singh", status: "Dock Loading", location: "Navi Mumbai Hub", health: "Service Due 2 Days" },
    { number: "TS 08 UB 9012", brand: "Eicher Pro 2049", type: "Light Cargo Regional", odometer: 54200, driver: "Mahesh Sharma", status: "Running", location: "Warangal Highway", health: "Optimal (5.35 km/l)" },
    { number: "AP 29 TA 5678", brand: "BharatBenz 2823R", type: "Heavy Goods", odometer: 112e3, driver: "Rajesh Patil", status: "Running", location: "Vijayawada Bypass", health: "Healthy" },
    { number: "KA 01 AL 3344", brand: "Ashok Leyland 2820", type: "Multi-Axle Flatbed", odometer: 124500, driver: "Ravi Kumar", status: "Running", location: "Devanahalli Toll", health: "Healthy (4.08 km/l)" },
    { number: "NL 01 AA 5522", brand: "Tata Signa 4825.T", type: "5-Axle 48T Heavy", odometer: 86400, driver: "Anand Verma", status: "Highway Transit", location: "Kishangarh Ajmer", health: "Healthy" },
    { number: "HR 55 AN 9811", brand: "Ashok Leyland 4220", type: "Container Carrier", odometer: 165200, driver: "Dinesh Shinde", status: "Running", location: "Kotputli NH48", health: "Healthy" },
    { number: "GJ 06 AX 4120", brand: "BharatBenz 3528C", type: "Tipper/Bulk Box", odometer: 73e3, driver: "Santosh Naik", status: "Dock Loading", location: "Dahej Port Yard", health: "Healthy" },
    { number: "DL 1M 8832", brand: "Eicher Pro 6035", type: "High Cube 32FT", odometer: 138e3, driver: "Manoj Goud", status: "Running", location: "Agra Expressway", health: "Healthy" },
    { number: "RJ 14 GC 7712", brand: "Tata LPT 2518", type: "Open Body Truck", odometer: 194e3, driver: "Karan Singh", status: "Workshop Base", location: "Hyderabad Central", health: "Scheduled Inspection" },
    { number: "TN 22 CZ 6655", brand: "Ashok Leyland 3518", type: "Multi-Axle Truck", odometer: 104e3, driver: "M. Pandian", status: "Running", location: "Madurai Bypass", health: "Healthy" }
  ];
  const fleetDrivers = [
    { name: "Ravi Kumar", exp: "10 Yrs", mileage: "4.38 km/l", score: "99.2/100", trips: 68, truck: "KA 01 AL 3344", status: "Top Master Driver \u2B50", harshBraking: 0, idleHours: "1.2h/wk" },
    { name: "Suresh Yadav", exp: "12 Yrs", mileage: "4.45 km/l", score: "99.4/100", trips: 74, truck: "TS 07 UE 1234", status: "Master Benchmark \u2B50", harshBraking: 0, idleHours: "0.8h/wk" },
    { name: "Mahesh Sharma", exp: "7 Yrs", mileage: "4.35 km/l", score: "96.8/100", trips: 58, truck: "TS 08 UB 9012", status: "Eicher Specialist", harshBraking: 1, idleHours: "1.5h/wk" },
    { name: "Ramesh Rathod", exp: "8 Yrs", mileage: "4.18 km/l", score: "94.5/100", trips: 52, truck: "TG 12 U 2637", status: "Tata/Eicher Preferred", harshBraking: 2, idleHours: "2.1h/wk" },
    { name: "Rajesh Patil", exp: "9 Yrs", mileage: "3.88 km/l", score: "91.2/100", trips: 46, truck: "AP 29 TA 5678", status: "Calm Long-Haul", harshBraking: 3, idleHours: "2.8h/wk" },
    { name: "Anand Verma", exp: "6 Yrs", mileage: "3.92 km/l", score: "89.5/100", trips: 40, truck: "NL 01 AA 5522", status: "Heavy Cargo Lead", harshBraking: 4, idleHours: "3.1h/wk" },
    { name: "Dinesh Shinde", exp: "8 Yrs", mileage: "3.82 km/l", score: "88.0/100", trips: 38, truck: "HR 55 AN 9811", status: "Container Lead", harshBraking: 5, idleHours: "3.4h/wk" },
    { name: "Santosh Naik", exp: "5 Yrs", mileage: "3.75 km/l", score: "86.4/100", trips: 32, truck: "GJ 06 AX 4120", status: "Port Corridor Operator", harshBraking: 4, idleHours: "3.8h/wk" },
    { name: "Manoj Goud", exp: "7 Yrs", mileage: "3.90 km/l", score: "90.1/100", trips: 36, truck: "DL 1M 8832", status: "Expressways Driver", harshBraking: 3, idleHours: "2.4h/wk" },
    { name: "Vikram Singh", exp: "4 Yrs", mileage: "3.32 km/l", score: "78.5/100", trips: 30, truck: "MH 12 AB 1234", status: "Eco-Training Slated \u26A0\uFE0F", harshBraking: 18, idleHours: "6.5h/wk" }
  ];
  const fleetAlerts = [
    { id: "alt_1", severity: "high", icon: "\u26A0\uFE0F", title: "Truck MH12AB1234 maintenance due in 2 days", time: "2h ago", category: "Fleet Maintenance", actionTitle: "Schedule Workshop Service", description: "Chassis odometer at 178,900 km. Scheduled differential oil replacement, brake shoe renewal, and leaf spring bushing check." },
    { id: "alt_2", severity: "medium", icon: "\u26A0\uFE0F", title: "Driver license renewal for Suresh Kumar", time: "5h ago", category: "Driver Compliance", actionTitle: "Initiate RTO DL Renewal", description: "Commercial Heavy Goods Vehicle (HMV) badge expiring in 14 days. Document uploaded for Sarathi Parivahan processing." },
    { id: "alt_3", severity: "info", icon: "\u2139\uFE0F", title: "Unusual fuel consumption detected (TRK-007)", time: "1d ago", category: "Telematics Audit", actionTitle: "Open Attribution Diagnostic Swap", description: "Fuel consumption spiked to 3.10 km/l on Hyderabad-Bengaluru run vs 4.10 benchmark. Fuel sensor suggests injector clogging or high idle." },
    { id: "alt_4", severity: "medium", icon: "\u26A0\uFE0F", title: "3 trips delayed due to weather conditions", time: "1d ago", category: "Transit Operations", actionTitle: "Send WhatsApp Customer Notice", description: "Heavy rain and ghat section landslide near Lonavala delayed MH-bound convoys by 4.5 hours. Consignees alerted." },
    { id: "alt_5", severity: "high", icon: "\u{1F6A8}", title: "National Permit expiry in 6 days: NL 01 AA 5522", time: "1d ago", category: "Compliance & Permits", actionTitle: "Pay Vahan Permit Fee (\u20B916,500)", description: "All India Motor Vehicle National Goods Permit tax window active. Instant payment via Vahan Parivahan portal." },
    { id: "alt_6", severity: "medium", icon: "\u26A0\uFE0F", title: "FASTag Low Balance Alert: TS 07 UE 1234", time: "2d ago", category: "Toll Wallets", actionTitle: "Recharge FASTag Wallet (\u20B95,000)", description: "Wallet balance at \u20B91,120. Threshold warning triggered prior to entering Krishnagiri plaza." },
    { id: "alt_7", severity: "info", icon: "\u2139\uFE0F", title: "Tyre PSI Anomaly on TG 12 U 2637 (Rear Right Axle)", time: "2d ago", category: "Tyre Pressure Sensor", actionTitle: "Inspect at Next Fuel Stop", description: "Tyre pressure dropped from 120 PSI to 94 PSI over 180 km. Slow puncture check advised." },
    { id: "alt_8", severity: "medium", icon: "\u26A0\uFE0F", title: "Pollution Under Control (PUCC) Due: HR 55 AN 9811", time: "3d ago", category: "Green Compliance", actionTitle: "Book Testing Center", description: "Annual smoke meter test and Bharat Stage VI emission certificate renewal scheduled." }
  ];
  const tripVolumeData = [
    12,
    18,
    14,
    22,
    28,
    19,
    15,
    24,
    31,
    26,
    18,
    29,
    35,
    27,
    21,
    33,
    38,
    42,
    34,
    28,
    22,
    19,
    27,
    31,
    25,
    18,
    23,
    29,
    32,
    20,
    16
  ];
  const sampleTripsManifest = [
    { lrNo: "LR-2024-8841", truck: "TG 12 U 2637", driver: "Ramesh Rathod", client: "UltraTech Cement", route: "Delhi \u2794 Mumbai", weight: "24.5 Tons", freight: 42e3, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8842", truck: "TS 07 UE 1234", driver: "Suresh Yadav", client: "Amazon India", route: "Bengaluru \u2794 Chennai", weight: "18.2 Tons", freight: 28500, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8843", truck: "MH 12 AB 1234", driver: "Vikram Singh", client: "Reliance Logistics", route: "Mumbai \u2794 Ahmedabad", weight: "22.0 Tons", freight: 34e3, status: "In Transit", onTime: true },
    { lrNo: "LR-2024-8844", truck: "TS 08 UB 9012", driver: "Mahesh Sharma", client: "Asian Paints", route: "Hyderabad \u2794 Bengaluru", weight: "12.5 Tons", freight: 19500, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8845", truck: "AP 29 TA 5678", driver: "Rajesh Patil", client: "Tata Steel", route: "Chennai \u2794 Hyderabad", weight: "26.0 Tons", freight: 38e3, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8846", truck: "KA 01 AL 3344", driver: "Ravi Kumar", client: "Amazon India", route: "Delhi \u2794 Mumbai", weight: "19.8 Tons", freight: 44e3, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8847", truck: "NL 01 AA 5522", driver: "Anand Verma", client: "JSW Steel", route: "Kolkata \u2794 Delhi", weight: "32.4 Tons", freight: 58e3, status: "In Transit", onTime: true },
    { lrNo: "LR-2024-8848", truck: "HR 55 AN 9811", driver: "Dinesh Shinde", client: "ITC Foods", route: "Pune \u2794 Goa", weight: "16.0 Tons", freight: 26e3, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8849", truck: "GJ 06 AX 4120", driver: "Santosh Naik", client: "Adani Wilmar", route: "Ahmedabad \u2794 Jaipur", weight: "24.0 Tons", freight: 32e3, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8850", truck: "DL 1M 8832", driver: "Manoj Goud", client: "UltraTech Cement", route: "Nagpur \u2794 Raipur", weight: "21.5 Tons", freight: 27500, status: "Delivered", onTime: true },
    { lrNo: "LR-2024-8851", truck: "RJ 14 GC 7712", driver: "Karan Singh", client: "Reliance Logistics", route: "Surat \u2794 Mumbai", weight: "23.0 Tons", freight: 31e3, status: "Dock Loading", onTime: true },
    { lrNo: "LR-2024-8852", truck: "TN 22 CZ 6655", driver: "M. Pandian", client: "Asian Paints", route: "Indore \u2794 Bhopal", weight: "15.5 Tons", freight: 22e3, status: "Delivered", onTime: true }
  ];
  const currentMetrics = c.useMemo(() => {
    const client = clientsList.find((c) => c.id === selectedClient) || clientsList[0];
    let multiplier = 1;
    if (selectedRange === "7D") multiplier = 0.24;
    else if (selectedRange === "3M") multiplier = 2.85;
    else if (selectedRange === "6M") multiplier = 5.6;
    else if (selectedRange === "1Y") multiplier = 11.2;
    const rev = Math.round(client.revenue * multiplier);
    const exp = Math.round(client.expenses * multiplier);
    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev * 100).toFixed(1) + "%" : "0%";
    const trips = Math.round(client.trips * multiplier);
    const kms = (trips * 206.29).toFixed(3);
    return {
      revenue: rev,
      expenses: exp,
      netProfit: profit,
      margin,
      trips,
      kms,
      utilization: selectedClient === "all" ? "78%" : "84%",
      drivers: selectedClient === "all" ? 10 : 4
    };
  }, [selectedClient, selectedRange]);
  const filteredRoutes = c.useMemo(() => {
    if (!searchQuery) return allRoutesData.slice(0, 5);
    return allRoutesData.filter(
      (r) => r.route.toLowerCase().includes(searchQuery.toLowerCase()) || r.topClient.toLowerCase().includes(searchQuery.toLowerCase()) || r.highway.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  const handleRangeClick = (range) => {
    setSelectedRange(range);
    if (range === "7D") {
      setStartDate("2024-03-24");
      setEndDate("2024-03-31");
    } else if (range === "30D") {
      setStartDate("2024-03-01");
      setEndDate("2024-03-31");
    } else if (range === "3M") {
      setStartDate("2024-01-01");
      setEndDate("2024-03-31");
    } else if (range === "6M") {
      setStartDate("2023-10-01");
      setEndDate("2024-03-31");
    } else if (range === "1Y") {
      setStartDate("2023-04-01");
      setEndDate("2024-03-31");
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
                /* @__PURE__ */ e.jsx("div", { className: "text-xs font-bold text-white leading-tight", children: "John B." }),
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
                /* @__PURE__ */ e.jsx("span", { className: "text-xs font-black text-white font-mono", children: "\u20B92.06M" }),
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
                subtitle: "\u20B9872,410 incurred across 9,431 Litres diesel (Avg: \u20B992.5/L)",
                data: { category: "Fuel", amount: 872410, pct: "42.3%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
                  " Fuel (42.3%)"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9872,410" })
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
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-purple-500" }),
                  " Tolls (18.6%)"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9383,120" })
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
                subtitle: "\u20B9249,350 incurred on preventative service, tyre replacements & oil changes",
                data: { category: "Maintenance", amount: 249350, pct: "12.1%" }
              }),
              className: "flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition",
              children: [
                /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500" }),
                  " Maintenance (12.1%)"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9249,350" })
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
                  " Driver Salary (11.5%)"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9236,620" })
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
                  " Insurance (8.4%)"
                ] }),
                /* @__PURE__ */ e.jsx("span", { className: "font-mono text-slate-400", children: "\u20B9173,860" })
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
                title: "On-Time Delivery SLA Audit: 92% Compliance",
                subtitle: "289 trips delivered on schedule; 25 trips experienced transit delays",
                data: null
              }),
              className: "cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition",
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "On-Time Delivery" }),
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-emerald-400 font-mono", children: "92%" })
                ] }),
                /* @__PURE__ */ e.jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ e.jsx("div", { className: "bg-emerald-500 h-full rounded-full", style: { width: "92%" } }) })
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
                  /* @__PURE__ */ e.jsx("span", { className: "font-bold text-blue-400 font-mono", children: "12" })
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
                title: "Driver Profile & Performance: Ravi Kumar \u2B50",
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
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-cyan-400 font-mono text-xs", children: "206 km" })
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
                  title: "Corridor Analysis: Delhi \u2794 Mumbai \u{1F3C6}",
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
                  /* @__PURE__ */ e.jsx("span", { className: "px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold", children: "7 Trips" })
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
                  /* @__PURE__ */ e.jsx("span", { className: "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold", children: "4 / 12" })
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
                    subtitle: "Fuel: \u20B9872,410 (42.3%) | Tolls: \u20B9383,120 (18.6%) of total operating costs",
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
          " 12 Heavy Commercial Trucks"
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
