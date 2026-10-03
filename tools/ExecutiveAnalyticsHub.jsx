import React, { useState, useMemo } from 'react';

export default function ExecutiveAnalyticsHub() {
  const [selectedRange, setSelectedRange] = useState('30D'); // '7D' | '30D' | '3M' | '6M' | '1Y' | 'Custom'
  const [startDate, setStartDate] = useState('2024-03-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [viewType, setViewType] = useState('Monthly View');
  const [selectedClient, setSelectedClient] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTooltipDay, setActiveTooltipDay] = useState(18); // Default peak Mar 18 tooltip
  const [revExpView, setRevExpView] = useState('Monthly'); // 'Monthly' | 'Weekly' | 'Daily'
  const [tripVolView, setTripVolView] = useState('Daily'); // 'Daily' | 'Weekly' | 'Corridor'
  const [fuelTollView, setFuelTollView] = useState('Monthly'); // 'Monthly' | 'Weekly'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active Deep Drilldown Modal State
  const [drilldownModal, setDrilldownModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    subtitle: '',
    data: null
  });

  // ─────────────────────────────────────────────────────────────
  // ABUNDANT ENTERPRISE DATASET
  // ─────────────────────────────────────────────────────────────

  // 10 Corporate Clients
  const clientsList = [
    { id: 'all', name: 'All Clients (Fleet Wide)', revenue: 2229400, expenses: 2062529.56, trips: 314, margin: '7.5%', dso: '14 Days', outstanding: 345000, contractType: 'Annual Dedicated' },
    { id: 'cli_ultratech', name: 'UltraTech Cement Ltd', revenue: 742000, expenses: 654200, trips: 88, margin: '11.8%', dso: '12 Days', outstanding: 110000, contractType: 'Per Ton-KM Index' },
    { id: 'cli_amazon', name: 'Amazon India Fulfillment', revenue: 514500, expenses: 472000, trips: 72, margin: '8.3%', dso: '15 Days', outstanding: 85000, contractType: 'Dedicated SXL 32FT' },
    { id: 'cli_reliance', name: 'Reliance Retail & Logistics', revenue: 368000, expenses: 338400, trips: 48, margin: '8.0%', dso: '21 Days', outstanding: 64000, contractType: 'Scheduled Linehaul' },
    { id: 'cli_tata', name: 'Tata Steel Tubes Division', revenue: 245900, expenses: 226800, trips: 36, margin: '7.8%', dso: '14 Days', outstanding: 42000, contractType: 'Heavy Flatbed FTL' },
    { id: 'cli_jindal', name: 'JSW Steel Coated Products', revenue: 168000, expenses: 154000, trips: 24, margin: '8.3%', dso: '18 Days', outstanding: 28000, contractType: 'Dedicated Coil Carriers' },
    { id: 'cli_asianpaints', name: 'Asian Paints Distribution', revenue: 142000, expenses: 131500, trips: 22, margin: '7.4%', dso: '10 Days', outstanding: 16000, contractType: 'High Cube Regional' },
    { id: 'cli_adani', name: 'Adani Wilmar Edible Oils', revenue: 112000, expenses: 104200, trips: 18, margin: '7.0%', dso: '15 Days', outstanding: 14000, contractType: 'Tanker / Box Truck' },
    { id: 'cli_itc', name: 'ITC Foods & Personal Care', revenue: 98000, expenses: 91200, trips: 16, margin: '6.9%', dso: '14 Days', outstanding: 11000, contractType: 'Fast-Moving Palletized' },
    { id: 'cli_spot', name: 'Ad-hoc Spot Market Brokers', revenue: 89000, expenses: 98129.56, trips: 14, margin: '-10.3%', dso: 'Advance Cash', outstanding: 0, contractType: 'Spot Daily Auction' }
  ];

  // 12 Commercial Highway Corridors
  const allRoutesData = [
    { id: 1, route: 'Delhi ➔ Mumbai', highway: 'NH48 / Western Corridor', trips: 48, distance: 7112, revenue: 612400, fuelCost: 248000, tollCost: 98000, margin: '12.4%', color: 'emerald', topClient: 'Amazon India' },
    { id: 2, route: 'Bengaluru ➔ Chennai', highway: 'NH44 & NH48', trips: 36, distance: 4062, revenue: 398600, fuelCost: 154000, tollCost: 64000, margin: '10.8%', color: 'emerald', topClient: 'UltraTech Cement' },
    { id: 3, route: 'Mumbai ➔ Ahmedabad', highway: 'NH48 Vadodara Expy', trips: 28, distance: 3927, revenue: 331200, fuelCost: 132000, tollCost: 52000, margin: '8.6%', color: 'emerald', topClient: 'Reliance Retail' },
    { id: 4, route: 'Chennai ➔ Hyderabad', highway: 'NH16 & NH65', trips: 24, distance: 2816, revenue: 274800, fuelCost: 112000, tollCost: 44000, margin: '6.9%', color: 'amber', topClient: 'Asian Paints' },
    { id: 5, route: 'Kolkata ➔ Delhi', highway: 'NH19 Grand Trunk', trips: 18, distance: 2403, revenue: 218400, fuelCost: 92000, tollCost: 38000, margin: '5.4%', color: 'amber', topClient: 'Tata Steel' },
    { id: 6, route: 'Hyderabad ➔ Bengaluru', highway: 'NH44 4-Lane Expy', trips: 32, distance: 4560, revenue: 384000, fuelCost: 148000, tollCost: 61000, margin: '11.2%', color: 'emerald', topClient: 'JSW Steel' },
    { id: 7, route: 'Pune ➔ Goa', highway: 'NH48 & Chorla Ghat', trips: 20, distance: 1840, revenue: 195000, fuelCost: 78000, tollCost: 31000, margin: '9.4%', color: 'emerald', topClient: 'ITC Foods' },
    { id: 8, route: 'Ahmedabad ➔ Jaipur', highway: 'NH48 / Kishangarh', trips: 22, distance: 2680, revenue: 232000, fuelCost: 94000, tollCost: 37000, margin: '7.8%', color: 'amber', topClient: 'Adani Wilmar' },
    { id: 9, route: 'Nagpur ➔ Raipur', highway: 'NH53 / East Corridor', trips: 16, distance: 1420, revenue: 145000, fuelCost: 59000, tollCost: 22000, margin: '8.1%', color: 'amber', topClient: 'Tata Steel' },
    { id: 10, route: 'Surat ➔ Mumbai', highway: 'NH48 Coastal Link', trips: 30, distance: 2850, revenue: 260000, fuelCost: 105000, tollCost: 41000, margin: '9.8%', color: 'emerald', topClient: 'Reliance Retail' },
    { id: 11, route: 'Indore ➔ Bhopal', highway: 'Bhopal Expy SH18', trips: 25, distance: 1950, revenue: 175000, fuelCost: 71000, tollCost: 28000, margin: '8.7%', color: 'amber', topClient: 'UltraTech Cement' },
    { id: 12, route: 'Vijayawada ➔ Visakhapatnam', highway: 'NH16 Golden Quad', trips: 15, distance: 1740, revenue: 162000, fuelCost: 65000, tollCost: 26000, margin: '6.2%', color: 'amber', topClient: 'JSW Steel' }
  ];

  // 12 Commercial Fleet Trucks
  const fleetTrucks = [
    { number: 'TG 12 U 2637', brand: 'Ashok Leyland 3118', type: 'Multi-Axle (8x2)', odometer: 142500, driver: 'Ramesh Rathod', status: 'Running on NH44', location: 'Near Shamshabad', health: 'Post-Turbo Overhaul' },
    { number: 'TS 07 UE 1234', brand: 'Tata Signa 2823.K', type: 'SXL 32 FT Box', odometer: 98400, driver: 'Suresh Yadav (Master)', status: 'In Transit', location: 'Krishnagiri Plaza', health: 'Benchmark Optimal' },
    { number: 'MH 12 AB 1234', brand: 'Tata Prima 3528.T', type: 'Heavy Flatbed', odometer: 178900, driver: 'Vikram Singh', status: 'Dock Loading', location: 'Navi Mumbai Hub', health: 'Service Due 2 Days' },
    { number: 'TS 08 UB 9012', brand: 'Eicher Pro 2049', type: 'Light Cargo Regional', odometer: 54200, driver: 'Mahesh Sharma', status: 'Running', location: 'Warangal Highway', health: 'Optimal (5.35 km/l)' },
    { number: 'AP 29 TA 5678', brand: 'BharatBenz 2823R', type: 'Heavy Goods', odometer: 112000, driver: 'Rajesh Patil', status: 'Running', location: 'Vijayawada Bypass', health: 'Healthy' },
    { number: 'KA 01 AL 3344', brand: 'Ashok Leyland 2820', type: 'Multi-Axle Flatbed', odometer: 124500, driver: 'Ravi Kumar', status: 'Running', location: 'Devanahalli Toll', health: 'Healthy (4.08 km/l)' },
    { number: 'NL 01 AA 5522', brand: 'Tata Signa 4825.T', type: '5-Axle 48T Heavy', odometer: 86400, driver: 'Anand Verma', status: 'Highway Transit', location: 'Kishangarh Ajmer', health: 'Healthy' },
    { number: 'HR 55 AN 9811', brand: 'Ashok Leyland 4220', type: 'Container Carrier', odometer: 165200, driver: 'Dinesh Shinde', status: 'Running', location: 'Kotputli NH48', health: 'Healthy' },
    { number: 'GJ 06 AX 4120', brand: 'BharatBenz 3528C', type: 'Tipper/Bulk Box', odometer: 73000, driver: 'Santosh Naik', status: 'Dock Loading', location: 'Dahej Port Yard', health: 'Healthy' },
    { number: 'DL 1M 8832', brand: 'Eicher Pro 6035', type: 'High Cube 32FT', odometer: 138000, driver: 'Manoj Goud', status: 'Running', location: 'Agra Expressway', health: 'Healthy' },
    { number: 'RJ 14 GC 7712', brand: 'Tata LPT 2518', type: 'Open Body Truck', odometer: 194000, driver: 'Karan Singh', status: 'Workshop Base', location: 'Hyderabad Central', health: 'Scheduled Inspection' },
    { number: 'TN 22 CZ 6655', brand: 'Ashok Leyland 3518', type: 'Multi-Axle Truck', odometer: 104000, driver: 'M. Pandian', status: 'Running', location: 'Madurai Bypass', health: 'Healthy' }
  ];

  // 10 Driver Profiles with Detailed Telematics
  const fleetDrivers = [
    { name: 'Ravi Kumar', exp: '10 Yrs', mileage: '4.38 km/l', score: '99.2/100', trips: 68, truck: 'KA 01 AL 3344', status: 'Top Master Driver ⭐', harshBraking: 0, idleHours: '1.2h/wk' },
    { name: 'Suresh Yadav', exp: '12 Yrs', mileage: '4.45 km/l', score: '99.4/100', trips: 74, truck: 'TS 07 UE 1234', status: 'Master Benchmark ⭐', harshBraking: 0, idleHours: '0.8h/wk' },
    { name: 'Mahesh Sharma', exp: '7 Yrs', mileage: '4.35 km/l', score: '96.8/100', trips: 58, truck: 'TS 08 UB 9012', status: 'Eicher Specialist', harshBraking: 1, idleHours: '1.5h/wk' },
    { name: 'Ramesh Rathod', exp: '8 Yrs', mileage: '4.18 km/l', score: '94.5/100', trips: 52, truck: 'TG 12 U 2637', status: 'Tata/Eicher Preferred', harshBraking: 2, idleHours: '2.1h/wk' },
    { name: 'Rajesh Patil', exp: '9 Yrs', mileage: '3.88 km/l', score: '91.2/100', trips: 46, truck: 'AP 29 TA 5678', status: 'Calm Long-Haul', harshBraking: 3, idleHours: '2.8h/wk' },
    { name: 'Anand Verma', exp: '6 Yrs', mileage: '3.92 km/l', score: '89.5/100', trips: 40, truck: 'NL 01 AA 5522', status: 'Heavy Cargo Lead', harshBraking: 4, idleHours: '3.1h/wk' },
    { name: 'Dinesh Shinde', exp: '8 Yrs', mileage: '3.82 km/l', score: '88.0/100', trips: 38, truck: 'HR 55 AN 9811', status: 'Container Lead', harshBraking: 5, idleHours: '3.4h/wk' },
    { name: 'Santosh Naik', exp: '5 Yrs', mileage: '3.75 km/l', score: '86.4/100', trips: 32, truck: 'GJ 06 AX 4120', status: 'Port Corridor Operator', harshBraking: 4, idleHours: '3.8h/wk' },
    { name: 'Manoj Goud', exp: '7 Yrs', mileage: '3.90 km/l', score: '90.1/100', trips: 36, truck: 'DL 1M 8832', status: 'Expressways Driver', harshBraking: 3, idleHours: '2.4h/wk' },
    { name: 'Vikram Singh', exp: '4 Yrs', mileage: '3.32 km/l', score: '78.5/100', trips: 30, truck: 'MH 12 AB 1234', status: 'Eco-Training Slated ⚠️', harshBraking: 18, idleHours: '6.5h/wk' }
  ];

  // 8 Active Operational Alerts
  const fleetAlerts = [
    { id: 'alt_1', severity: 'high', icon: '⚠️', title: 'Truck MH12AB1234 maintenance due in 2 days', time: '2h ago', category: 'Fleet Maintenance', actionTitle: 'Schedule Workshop Service', description: 'Chassis odometer at 178,900 km. Scheduled differential oil replacement, brake shoe renewal, and leaf spring bushing check.' },
    { id: 'alt_2', severity: 'medium', icon: '⚠️', title: 'Driver license renewal for Suresh Kumar', time: '5h ago', category: 'Driver Compliance', actionTitle: 'Initiate RTO DL Renewal', description: 'Commercial Heavy Goods Vehicle (HMV) badge expiring in 14 days. Document uploaded for Sarathi Parivahan processing.' },
    { id: 'alt_3', severity: 'info', icon: 'ℹ️', title: 'Unusual fuel consumption detected (TRK-007)', time: '1d ago', category: 'Telematics Audit', actionTitle: 'Open Attribution Diagnostic Swap', description: 'Fuel consumption spiked to 3.10 km/l on Hyderabad-Bengaluru run vs 4.10 benchmark. Fuel sensor suggests injector clogging or high idle.' },
    { id: 'alt_4', severity: 'medium', icon: '⚠️', title: '3 trips delayed due to weather conditions', time: '1d ago', category: 'Transit Operations', actionTitle: 'Send WhatsApp Customer Notice', description: 'Heavy rain and ghat section landslide near Lonavala delayed MH-bound convoys by 4.5 hours. Consignees alerted.' },
    { id: 'alt_5', severity: 'high', icon: '🚨', title: 'National Permit expiry in 6 days: NL 01 AA 5522', time: '1d ago', category: 'Compliance & Permits', actionTitle: 'Pay Vahan Permit Fee (₹16,500)', description: 'All India Motor Vehicle National Goods Permit tax window active. Instant payment via Vahan Parivahan portal.' },
    { id: 'alt_6', severity: 'medium', icon: '⚠️', title: 'FASTag Low Balance Alert: TS 07 UE 1234', time: '2d ago', category: 'Toll Wallets', actionTitle: 'Recharge FASTag Wallet (₹5,000)', description: 'Wallet balance at ₹1,120. Threshold warning triggered prior to entering Krishnagiri plaza.' },
    { id: 'alt_7', severity: 'info', icon: 'ℹ️', title: 'Tyre PSI Anomaly on TG 12 U 2637 (Rear Right Axle)', time: '2d ago', category: 'Tyre Pressure Sensor', actionTitle: 'Inspect at Next Fuel Stop', description: 'Tyre pressure dropped from 120 PSI to 94 PSI over 180 km. Slow puncture check advised.' },
    { id: 'alt_8', severity: 'medium', icon: '⚠️', title: 'Pollution Under Control (PUCC) Due: HR 55 AN 9811', time: '3d ago', category: 'Green Compliance', actionTitle: 'Book Testing Center', description: 'Annual smoke meter test and Bharat Stage VI emission certificate renewal scheduled.' }
  ];

  // Daily trip volumes for March (31 days)
  const tripVolumeData = [
    12, 18, 14, 22, 28, 19, 15, 24, 31, 26,
    18, 29, 35, 27, 21, 33, 38, 42, 34, 28,
    22, 19, 27, 31, 25, 18, 23, 29, 32, 20, 16
  ];

  // Generate 25 sample trips for day manifest drilldown
  const sampleTripsManifest = [
    { lrNo: 'LR-2024-8841', truck: 'TG 12 U 2637', driver: 'Ramesh Rathod', client: 'UltraTech Cement', route: 'Delhi ➔ Mumbai', weight: '24.5 Tons', freight: 42000, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8842', truck: 'TS 07 UE 1234', driver: 'Suresh Yadav', client: 'Amazon India', route: 'Bengaluru ➔ Chennai', weight: '18.2 Tons', freight: 28500, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8843', truck: 'MH 12 AB 1234', driver: 'Vikram Singh', client: 'Reliance Logistics', route: 'Mumbai ➔ Ahmedabad', weight: '22.0 Tons', freight: 34000, status: 'In Transit', onTime: true },
    { lrNo: 'LR-2024-8844', truck: 'TS 08 UB 9012', driver: 'Mahesh Sharma', client: 'Asian Paints', route: 'Hyderabad ➔ Bengaluru', weight: '12.5 Tons', freight: 19500, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8845', truck: 'AP 29 TA 5678', driver: 'Rajesh Patil', client: 'Tata Steel', route: 'Chennai ➔ Hyderabad', weight: '26.0 Tons', freight: 38000, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8846', truck: 'KA 01 AL 3344', driver: 'Ravi Kumar', client: 'Amazon India', route: 'Delhi ➔ Mumbai', weight: '19.8 Tons', freight: 44000, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8847', truck: 'NL 01 AA 5522', driver: 'Anand Verma', client: 'JSW Steel', route: 'Kolkata ➔ Delhi', weight: '32.4 Tons', freight: 58000, status: 'In Transit', onTime: true },
    { lrNo: 'LR-2024-8848', truck: 'HR 55 AN 9811', driver: 'Dinesh Shinde', client: 'ITC Foods', route: 'Pune ➔ Goa', weight: '16.0 Tons', freight: 26000, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8849', truck: 'GJ 06 AX 4120', driver: 'Santosh Naik', client: 'Adani Wilmar', route: 'Ahmedabad ➔ Jaipur', weight: '24.0 Tons', freight: 32000, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8850', truck: 'DL 1M 8832', driver: 'Manoj Goud', client: 'UltraTech Cement', route: 'Nagpur ➔ Raipur', weight: '21.5 Tons', freight: 27500, status: 'Delivered', onTime: true },
    { lrNo: 'LR-2024-8851', truck: 'RJ 14 GC 7712', driver: 'Karan Singh', client: 'Reliance Logistics', route: 'Surat ➔ Mumbai', weight: '23.0 Tons', freight: 31000, status: 'Dock Loading', onTime: true },
    { lrNo: 'LR-2024-8852', truck: 'TN 22 CZ 6655', driver: 'M. Pandian', client: 'Asian Paints', route: 'Indore ➔ Bhopal', weight: '15.5 Tons', freight: 22000, status: 'Delivered', onTime: true }
  ];

  // Dynamic Metrics based on selected client & range
  const currentMetrics = useMemo(() => {
    const client = clientsList.find(c => c.id === selectedClient) || clientsList[0];
    let multiplier = 1.0;
    if (selectedRange === '7D') multiplier = 0.24;
    else if (selectedRange === '3M') multiplier = 2.85;
    else if (selectedRange === '6M') multiplier = 5.6;
    else if (selectedRange === '1Y') multiplier = 11.2;

    const rev = Math.round(client.revenue * multiplier);
    const exp = Math.round(client.expenses * multiplier);
    const profit = rev - exp;
    const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) + '%' : '0%';
    const trips = Math.round(client.trips * multiplier);
    const kms = (trips * 206.29).toFixed(3);

    return {
      revenue: rev,
      expenses: exp,
      netProfit: profit,
      margin: margin,
      trips: trips,
      kms: kms,
      utilization: selectedClient === 'all' ? '78%' : '84%',
      drivers: selectedClient === 'all' ? 10 : 4
    };
  }, [selectedClient, selectedRange]);

  // Filtered routes based on search
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return allRoutesData.slice(0, 5);
    return allRoutesData.filter(r => 
      r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.highway.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Helper for quick range clicks
  const handleRangeClick = (range) => {
    setSelectedRange(range);
    if (range === '7D') {
      setStartDate('2024-03-24');
      setEndDate('2024-03-31');
    } else if (range === '30D') {
      setStartDate('2024-03-01');
      setEndDate('2024-03-31');
    } else if (range === '3M') {
      setStartDate('2024-01-01');
      setEndDate('2024-03-31');
    } else if (range === '6M') {
      setStartDate('2023-10-01');
      setEndDate('2024-03-31');
    } else if (range === '1Y') {
      setStartDate('2023-04-01');
      setEndDate('2024-03-31');
    }
  };

  const closeDrilldown = () => {
    setDrilldownModal({ isOpen: false, type: '', title: '', subtitle: '', data: null });
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100 relative">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE HEADER
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Analytics Hub</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Fleet Command
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Financial and operational performance overview for your logistics business.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-3 relative">
          {/* Global Search Bar */}
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips, drivers, vehicles, routes..."
              className="w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            />
            <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </span>
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="View Active Fleet Notifications"
          >
            <span>🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs">
              {fleetAlerts.length}
            </span>
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              JB
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">John B.</div>
              <div className="text-[10px] text-slate-400 leading-tight">Fleet Manager</div>
            </div>
          </div>

          {/* Export Report Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              <span>📥</span>
              <span>Export Report</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>

            {/* Export Dropdown Popover */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-12 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Export Options
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    alert('Generating Excel Spreadsheet (.xlsx): 314 March Trips with Full Revenue, Fuel, Tolls & Margin Ledger...');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-emerald-400">📊</span> Download Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    alert('Generating Audit Executive PDF (.pdf) with P&L Charts and Corridor Matrix...');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-rose-400">📄</span> Download PDF Report (.pdf)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    const summary = `*JAI BHAVANI CARGO - EXECUTIVE FLEET ANALYTICS*\n• Period: ${startDate} to ${endDate}\n• Client Scope: ${clientsList.find(c => c.id === selectedClient)?.name}\n• Total Revenue: ₹${currentMetrics.revenue.toLocaleString('en-IN')}\n• Total Expenses: ₹${currentMetrics.expenses.toLocaleString('en-IN')}\n• Net Profit: ₹${currentMetrics.netProfit.toLocaleString('en-IN')} (${currentMetrics.margin} Margin)\n• Total Trips: ${currentMetrics.trips} trips (${currentMetrics.kms} km)\n• Fleet Utilization: ${currentMetrics.utilization}\n• Active Drivers: ${currentMetrics.drivers}`;
                    navigator.clipboard.writeText(summary);
                    alert('Executive P&L summary copied to clipboard for WhatsApp/Email sharing!');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-blue-400">📋</span> Copy Summary to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="absolute right-0 top-16 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <span className="text-xs font-bold text-white">Active Fleet Notifications ({fleetAlerts.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {fleetAlerts.map(alt => (
              <div
                key={alt.id}
                onClick={() => {
                  setIsNotificationsOpen(false);
                  setDrilldownModal({
                    isOpen: true,
                    type: 'alert_action',
                    title: alt.title,
                    subtitle: alt.category,
                    data: alt
                  });
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span>{alt.icon}</span> {alt.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">{alt.time}</span>
                </div>
                <div className="text-[10px] text-blue-400 mt-1 font-semibold flex items-center gap-1">
                  <span>⚡ Action:</span> {alt.actionTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & TIME-RANGE CONTROL BAR
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Start Date */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">START</span>
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            />
          </div>

          <span className="text-slate-600 font-bold">➔</span>

          {/* End Date */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">END</span>
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* View Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500">VIEW</span>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="Daily View" className="bg-slate-900">Daily View</option>
              <option value="Weekly View" className="bg-slate-900">Weekly View</option>
              <option value="Monthly View" className="bg-slate-900">Monthly View</option>
              <option value="Quarterly View" className="bg-slate-900">Quarterly View</option>
            </select>
          </div>

          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400">CLIENT</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[190px] truncate"
            >
              {clientsList.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Range Pills + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Range Buttons */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {['7D', '30D', '3M', '6M', '1Y', 'Custom'].map(pill => (
              <button
                key={pill}
                type="button"
                onClick={() => handleRangeClick(pill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedRange === pill
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedRange('30D');
              setStartDate('2024-03-01');
              setEndDate('2024-03-31');
              setSelectedClient('all');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>🔄</span> Reset
          </button>

          {/* Apply Filters */}
          <button
            type="button"
            onClick={() => {
              alert(`Filters applied! Period: ${selectedRange} (${startDate} to ${endDate}) for Client: ${clientsList.find(c => c.id === selectedClient)?.name}. Total revenue: ₹${currentMetrics.revenue.toLocaleString('en-IN')}`);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <span>⚡</span> Apply Filters
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TOP 8 METRIC / KPI CARDS (2 ROWS × 4 COLUMNS) - DEEP DRILLABLE
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL REVENUE */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'revenue',
            title: 'Revenue Analytics & Corporate Invoicing Ledger',
            subtitle: `Total Revenue: ₹${currentMetrics.revenue.toLocaleString('en-IN')} across ${currentMetrics.trips} completed trips`,
            data: { clients: clientsList, totalRev: currentMetrics.revenue }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Revenue Analytics"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                ₹
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Total Revenue</span>
            </div>
            <span className="text-slate-600 group-hover:text-emerald-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹{currentMetrics.revenue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +18.4%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,28 Q15,35 30,22 T60,18 T85,8 T100,5" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="5" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL EXPENSES */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'expenses',
            title: 'Expense Audit & Cost Center Breakdown',
            subtitle: `Total Operating Spend: ₹${currentMetrics.expenses.toLocaleString('en-IN')} (Fuel, Tolls, Workshop & Crew)`,
            data: { expenses: currentMetrics.expenses }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-rose-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Expenses Audit"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                💳
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Total Expenses</span>
            </div>
            <span className="text-slate-600 group-hover:text-rose-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹{currentMetrics.expenses.toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↘ -6.2%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,15 Q20,10 40,25 T70,18 T90,30 T100,28" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="28" r="3" fill="#f43f5e" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 3: NET PROFIT */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'profit',
            title: 'Net Margin & Bottom-Line Profitability',
            subtitle: `EBITDA & Retained Profit: ₹${currentMetrics.netProfit.toLocaleString('en-IN')} (${currentMetrics.margin} Margin)`,
            data: { profit: currentMetrics.netProfit, margin: currentMetrics.margin }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Profitability Matrix"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                📊
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Net Profit</span>
            </div>
            <span className="text-slate-600 group-hover:text-cyan-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">₹{currentMetrics.netProfit.toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 mt-1">
                <span>↗ +42.7%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,32 Q25,30 45,22 T75,15 T90,8 T100,4" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="4" r="3" fill="#06b6d4" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 4: PROFIT MARGIN */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'margin',
            title: 'Profit Margin Trajectory & Inflation Hedge',
            subtitle: `Overall Fleet Margin: ${currentMetrics.margin} (Profitable corridors: 10/12)`,
            data: { margin: currentMetrics.margin }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-purple-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Margin Trajectory"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                %
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Profit Margin</span>
            </div>
            <span className="text-slate-600 group-hover:text-purple-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{currentMetrics.margin}</div>
              <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1 mt-1">
                <span>↗ +2.1%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,28 Q30,22 55,20 T80,12 T100,8" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="8" r="3" fill="#a855f7" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL TRIPS */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'trips',
            title: 'Fleet Trip Logs & Dispatch Manifest (314 Trips)',
            subtitle: `${currentMetrics.trips} Trips recorded: 295 Completed, 12 In-Transit, 7 Delayed`,
            data: { trips: currentMetrics.trips }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-blue-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Trip Manifest"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                🚛
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Total Trips</span>
            </div>
            <span className="text-slate-600 group-hover:text-blue-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{currentMetrics.trips}</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +12.5%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,30 Q20,32 40,20 T70,16 T90,10 T100,6" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="6" r="3" fill="#3b82f6" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 6: TOTAL KMS DRIVEN */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'kms',
            title: 'GPS & Odometer Distance Telematics (64,775 KM)',
            subtitle: `${currentMetrics.kms} km logged: 58,400 km Loaded vs 6,375 km Deadhead Return`,
            data: { kms: currentMetrics.kms }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-amber-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Distance Analytics"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                🛣️
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Total KMs Driven</span>
            </div>
            <span className="text-slate-600 group-hover:text-amber-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{currentMetrics.kms}</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <span>↗ +9.8%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,25 Q25,28 50,18 T80,14 T100,9" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="9" r="3" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 7: FLEET UTILIZATION */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'utilization',
            title: 'Fleet Asset Utilization & Live Vehicle Fleet (12 Trucks)',
            subtitle: `Overall Fleet Utilization: ${currentMetrics.utilization} (Active highway transit: 9, Loading: 2, Workshop: 1)`,
            data: { util: currentMetrics.utilization, trucks: fleetTrucks }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-teal-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Utilization Breakdown"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                ⏱️
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Fleet Utilization</span>
            </div>
            <span className="text-slate-600 group-hover:text-teal-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{currentMetrics.utilization}</div>
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1 mt-1">
                <span>↗ +6.3%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,28 Q30,30 55,20 T80,15 T100,10" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="10" r="3" fill="#14b8a6" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 8: ACTIVE DRIVERS */}
        <div
          onClick={() => setDrilldownModal({
            isOpen: true,
            type: 'drivers',
            title: 'Driver Rostering & Performance Matrix (10 Crew)',
            subtitle: `${currentMetrics.drivers} Active Drivers rostered across long-haul national corridors`,
            data: { drivers: fleetDrivers }
          })}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-indigo-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group"
          title="Click to Deep-Drill Driver Matrix"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                👥
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition">Active Drivers</span>
            </div>
            <span className="text-slate-600 group-hover:text-indigo-400 transition text-xs font-bold">🔍 Drill</span>
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{currentMetrics.drivers}</div>
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                <span>→ 0%</span>
                <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M0,20 Q30,18 60,20 T100,20" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="20" r="3" fill="#6366f1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MIDDLE ROW: 4 ADVANCED VISUALIZATION PANELS
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PANEL 1: REVENUE VS EXPENSES */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">📈</span>
                <h3 className="font-bold text-white text-sm">Revenue vs Expenses</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={revExpView}
                  onChange={(e) => setRevExpView(e.target.value)}
                  className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="Daily">Daily ⌄</option>
                  <option value="Weekly">Weekly ⌄</option>
                  <option value="Monthly">Monthly ⌄</option>
                </select>
                <button
                  type="button"
                  onClick={() => setDrilldownModal({
                    isOpen: true,
                    type: 'revenue',
                    title: 'Monthly Variance Audit: Revenue vs Operational Expenses',
                    subtitle: `Revenue: ₹${currentMetrics.revenue.toLocaleString('en-IN')} vs Expenses: ₹${currentMetrics.expenses.toLocaleString('en-IN')}`,
                    data: null
                  })}
                  className="text-slate-500 hover:text-white cursor-pointer px-1 text-xs"
                >
                  ···
                </button>
              </div>
            </div>

            {/* Sub-Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'revenue',
                  title: 'Revenue Ledger & Client Breakdown',
                  subtitle: `Total Revenue: ₹${currentMetrics.revenue.toLocaleString('en-IN')}`,
                  data: null
                })}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                <span className="text-slate-400">Revenue</span>
                <span className="font-bold text-white font-mono">₹{currentMetrics.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'expenses',
                  title: 'Expense Vouchers & Fastag Deductions',
                  subtitle: `Total Expenses: ₹${currentMetrics.expenses.toLocaleString('en-IN')}`,
                  data: null
                })}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 shadow-xs shadow-purple-500" />
                <span className="text-slate-400">Expenses</span>
                <span className="font-bold text-white font-mono">₹{currentMetrics.expenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Dual Spline Curved SVG Area Chart */}
          <div
            onClick={() => setDrilldownModal({
              isOpen: true,
              type: 'revenue',
              title: 'Revenue vs Expenses Trajectory Breakdown',
              subtitle: 'Daily Run-Rates and P&L Margin Curves',
              data: null
            })}
            className="w-full h-56 mt-4 relative cursor-pointer group"
            title="Click to view detailed ledger"
          >
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purpleExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="40" x2="400" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="400" y2="160" stroke="#1e293b" strokeDasharray="3 3" />

              <path d="M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30 L400,200 L0,200 Z" fill="url(#cyanRevGrad)" />
              <path d="M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30" fill="none" stroke="#06b6d4" strokeWidth="3" />

              <path d="M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60 L400,200 L0,200 Z" fill="url(#purpleExpGrad)" />
              <path d="M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60" fill="none" stroke="#a855f7" strokeWidth="2.5" />

              <circle cx="150" cy="85" r="4" fill="#06b6d4" />
              <circle cx="280" cy="70" r="4" fill="#06b6d4" />
              <circle cx="400" cy="30" r="4" fill="#06b6d4" />
            </svg>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 2: TRIP VOLUME */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">📊</span>
                <h3 className="font-bold text-white text-sm">Trip Volume</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={tripVolView}
                  onChange={(e) => setTripVolView(e.target.value)}
                  className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="Daily">Daily ⌄</option>
                  <option value="Weekly">Weekly ⌄</option>
                  <option value="Corridor">By Corridor ⌄</option>
                </select>
                <button
                  type="button"
                  onClick={() => setDrilldownModal({
                    isOpen: true,
                    type: 'trips',
                    title: 'Full March Trip Volume Ledger (314 Trips)',
                    subtitle: 'Corridor Distribution and Vehicle Loading Logs',
                    data: null
                  })}
                  className="text-slate-500 hover:text-white cursor-pointer px-1 text-xs"
                >
                  ···
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="w-full h-56 mt-3 relative flex flex-col justify-end">
            {/* Tooltip Overlay */}
            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'manifest',
                title: `Trip Manifest for March ${activeTooltipDay}, 2024`,
                subtitle: `${tripVolumeData[activeTooltipDay - 1]} trips operated on this date across national highway corridors`,
                data: { day: activeTooltipDay, trips: tripVolumeData[activeTooltipDay - 1], list: sampleTripsManifest }
              })}
              className="absolute z-20 bg-slate-950/95 border border-blue-500/70 rounded-xl px-2.5 py-1.5 text-center shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                left: `${Math.min(Math.max((activeTooltipDay / 31) * 85, 5), 72)}%`,
                top: '10%'
              }}
              title="Click to view trips dispatched on this date"
            >
              <div className="text-[10px] text-slate-400 font-mono">Mar {activeTooltipDay}, 2024</div>
              <div className="text-xs font-black text-cyan-400 font-mono">
                {tripVolumeData[activeTooltipDay - 1]} trips 🔍
              </div>
            </div>

            {/* Bars Container */}
            <div className="flex items-end justify-between h-44 gap-1 px-1">
              {tripVolumeData.map((val, idx) => {
                const day = idx + 1;
                const isSelected = day === activeTooltipDay;
                const heightPct = Math.round((val / 45) * 100);
                return (
                  <div
                    key={day}
                    onMouseEnter={() => setActiveTooltipDay(day)}
                    onClick={() => setDrilldownModal({
                      isOpen: true,
                      type: 'manifest',
                      title: `Trip Manifest for March ${day}, 2024`,
                      subtitle: `${val} trips operated on this date across national highway corridors`,
                      data: { day, trips: val, list: sampleTripsManifest }
                    })}
                    className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-cyan-400 shadow-md shadow-cyan-500/50 scale-y-105'
                          : 'bg-blue-600 hover:bg-blue-400 opacity-80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 3: EXPENSE BREAKDOWN (DONUT) */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">🍩</span>
                <h3 className="font-bold text-white text-sm">Expense Breakdown</h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                This Month ⌄
              </span>
            </div>
          </div>

          {/* Donut Chart with Center Text */}
          <div
            onClick={() => setDrilldownModal({
              isOpen: true,
              type: 'expenses',
              title: 'Comprehensive Expense Center Audit',
              subtitle: 'Itemized Breakdown of Fuel, Tolls, Workshop Maintenance & Crew',
              data: null
            })}
            className="flex flex-col items-center justify-center my-3 relative cursor-pointer group"
            title="Click to view detailed itemized expenses"
          >
            <div className="w-32 h-32 relative flex items-center justify-center group-hover:scale-105 transition duration-200">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="101 138" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="44 195" strokeDashoffset="-101" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="29 210" strokeDashoffset="-145" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="27 212" strokeDashoffset="-174" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ec4899" strokeWidth="16" strokeDasharray="20 219" strokeDashoffset="-201" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#64748b" strokeWidth="16" strokeDasharray="17 222" strokeDashoffset="-221" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-white font-mono">₹2.06M</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Total Exp</span>
              </div>
            </div>
          </div>

          {/* Categorized Slices Legend - Clickable */}
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800">
            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'expense_slice',
                title: 'Fuel Spend & Diesel Telematics Audit',
                subtitle: '₹872,410 incurred across 9,431 Litres diesel (Avg: ₹92.5/L)',
                data: { category: 'Fuel', amount: 872410, pct: '42.3%' }
              })}
              className="flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Fuel (42.3%)
              </span>
              <span className="font-mono text-white font-bold">₹872,410</span>
            </div>

            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'expense_slice',
                title: 'FASTag & Electronic Toll Audit',
                subtitle: '₹383,120 paid across NHAI plaza readers on 12 corridors',
                data: { category: 'Tolls', amount: 383120, pct: '18.6%' }
              })}
              className="flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Tolls (18.6%)
              </span>
              <span className="font-mono text-white font-bold">₹383,120</span>
            </div>

            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'expense_slice',
                title: 'Fleet Workshop Maintenance & Spare Parts',
                subtitle: '₹249,350 incurred on preventative service, tyre replacements & oil changes',
                data: { category: 'Maintenance', amount: 249350, pct: '12.1%' }
              })}
              className="flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance (12.1%)
              </span>
              <span className="font-mono text-white font-bold">₹249,350</span>
            </div>

            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'expense_slice',
                title: 'Driver Salaries & Trip Bata Disbursements',
                subtitle: '₹236,620 disbursed to 10 drivers across 314 trips',
                data: { category: 'Driver Salary', amount: 236620, pct: '11.5%' }
              })}
              className="flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Driver Salary (11.5%)
              </span>
              <span className="font-mono text-white font-bold">₹236,620</span>
            </div>

            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'expense_slice',
                title: 'Commercial Vehicle Insurance Premiums',
                subtitle: '₹173,860 monthly amortization for fleet comprehensive insurance',
                data: { category: 'Insurance', amount: 173860, pct: '8.4%' }
              })}
              className="flex justify-between items-center cursor-pointer p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Insurance (8.4%)
              </span>
              <span className="font-mono text-slate-400">₹173,860</span>
            </div>
          </div>
        </div>

        {/* PANEL 4: OPERATIONS OVERVIEW */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 text-sm">⚙️</span>
              <h3 className="font-bold text-white text-sm">Operations</h3>
            </div>
          </div>

          <div className="space-y-3.5 my-2 text-xs">
            {/* On-Time Delivery */}
            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'sla_delivery',
                title: 'On-Time Delivery SLA Audit: 92% Compliance',
                subtitle: '289 trips delivered on schedule; 25 trips experienced transit delays',
                data: null
              })}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">On-Time Delivery</span>
                <span className="font-bold text-emerald-400 font-mono">92%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            {/* Active Routes */}
            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'all_routes',
                title: 'Active Commercial Routes Master Ledger (12 Routes)',
                subtitle: 'Consolidated performance across inter-state corridors',
                data: allRoutesData
              })}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Active Routes</span>
                <span className="font-bold text-blue-400 font-mono">12</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Top Driver */}
            <div
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'driver_detail',
                title: 'Driver Profile & Performance: Ravi Kumar ⭐',
                subtitle: 'Top performing driver: 4.38 km/l avg mileage, 100% on-time rate, 0 harsh braking events',
                data: fleetDrivers[0]
              })}
              className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
            >
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Top Driver</span>
                <span className="font-bold text-white text-xs">Ravi Kumar</span>
              </div>
              <span className="text-amber-400 text-sm">⭐</span>
            </div>

            {/* Avg Distance */}
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Avg Trip Distance</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">206 km</span>
              </div>
              <span className="text-xs text-slate-500">Per Trip</span>
            </div>

            {/* Badges: Top Route, Delays, Healthy */}
            <div className="pt-1 flex flex-col gap-1.5 text-[11px]">
              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'route',
                  title: 'Corridor Analysis: Delhi ➔ Mumbai 🏆',
                  subtitle: 'Top Revenue Generator: 48 Trips, ₹612,400 Revenue, 12.4% Net Margin',
                  data: allRoutesData[0]
                })}
                className="flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition"
              >
                <span className="text-slate-400">Top Route:</span>
                <span className="font-bold text-white">Delhi ➔ Mumbai 🏆</span>
              </div>

              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'delays',
                  title: 'Delayed Trips Incident Report (7 Trips)',
                  subtitle: 'Root Cause Breakdown: Traffic Congestion, Loading Docks & Weather',
                  data: null
                })}
                className="flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition"
              >
                <span className="text-slate-400">Delayed Trips:</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">7 Trips</span>
              </div>

              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'utilization',
                  title: 'Vehicle Fitness & Inspection Registry',
                  subtitle: '4 active healthy benchmark trucks, 7 transit ready, 1 scheduled workshop',
                  data: { util: currentMetrics.utilization, trucks: fleetTrucks }
                })}
                className="flex justify-between items-center cursor-pointer p-1 rounded hover:bg-slate-800/60 transition"
              >
                <span className="text-slate-400">Healthy Trucks:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">4 / 12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM ROW: 3 PANELS
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PANEL 5: ROUTE PERFORMANCE TABLE */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-sm">📍</span>
              <h3 className="font-bold text-white text-sm">Route Performance</h3>
            </div>
            <button
              type="button"
              onClick={() => setDrilldownModal({
                isOpen: true,
                type: 'all_routes',
                title: 'All Commercial Corridors & Profitability Ranking (12 Routes)',
                subtitle: 'Complete 12-route P&L matrix with distance and margin analytics',
                data: allRoutesData
              })}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              View All &gt;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
                <tr>
                  <th className="py-2">#</th>
                  <th className="py-2">Route</th>
                  <th className="py-2 text-right">Trips</th>
                  <th className="py-2 text-right">Dist (km)</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredRoutes.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setDrilldownModal({
                      isOpen: true,
                      type: 'route',
                      title: `Route Deep Dive: ${r.route}`,
                      subtitle: `${r.trips} Trips | ${r.distance.toLocaleString()} km | ₹${r.revenue.toLocaleString('en-IN')} Revenue | ${r.margin} Margin`,
                      data: r
                    })}
                    className="hover:bg-slate-850/80 transition cursor-pointer"
                  >
                    <td className="py-2.5 text-slate-500 font-mono">{i + 1}</td>
                    <td className="py-2.5 font-bold text-white">
                      {r.route}
                      <span className="block text-[10px] text-slate-500 font-normal">{r.highway}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-300">{r.trips}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{r.distance.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-white">₹{r.revenue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.color === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.margin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 6: FUEL VS TOLL EXPENSES SPLINE CHART */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">⛽</span>
                <h3 className="font-bold text-white text-sm">Fuel vs Toll Expenses</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={fuelTollView}
                  onChange={(e) => setFuelTollView(e.target.value)}
                  className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="Daily">Daily ⌄</option>
                  <option value="Weekly">Weekly ⌄</option>
                  <option value="Monthly">Monthly ⌄</option>
                </select>
                <button
                  type="button"
                  onClick={() => setDrilldownModal({
                    isOpen: true,
                    type: 'fuel_vs_toll',
                    title: 'Fuel vs FASTag Toll Reconciliation Audit',
                    subtitle: 'Fuel: ₹872,410 (42.3%) | Tolls: ₹383,120 (18.6%) of total operating costs',
                    data: null
                  })}
                  className="text-slate-500 hover:text-white cursor-pointer px-1 text-xs"
                >
                  ···
                </button>
              </div>
            </div>

            {/* Sub-Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'expense_slice',
                  title: 'Fuel Spend & Diesel Telematics Audit',
                  subtitle: '₹872,410 incurred across 9,431 Litres diesel (Avg: ₹92.5/L)',
                  data: { category: 'Fuel', amount: 872410, pct: '42.3%' }
                })}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400" />
                <span className="text-slate-400">Fuel</span>
                <span className="font-bold text-white font-mono">₹872,410</span>
              </div>
              <div
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'expense_slice',
                  title: 'FASTag & Electronic Toll Audit',
                  subtitle: '₹383,120 paid across NHAI plaza readers on 12 corridors',
                  data: { category: 'Tolls', amount: 383120, pct: '18.6%' }
                })}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" />
                <span className="text-slate-400">Tolls</span>
                <span className="font-bold text-white font-mono">₹383,120</span>
              </div>
            </div>
          </div>

          {/* SVG Spline Chart */}
          <div
            onClick={() => setDrilldownModal({
              isOpen: true,
              type: 'fuel_vs_toll',
              title: 'Fuel vs Toll Cost Curves & Telematics Overlay',
              subtitle: 'Daily Run-Rates and Highway Plaza Deductions',
              data: null
            })}
            className="w-full h-44 mt-3 relative cursor-pointer group"
            title="Click to view detailed reconciliation"
          >
            <svg className="w-full h-full overflow-visible" viewBox="0 0 350 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fuelLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="35" x2="350" y2="35" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="350" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="115" x2="350" y2="115" stroke="#1e293b" strokeDasharray="3 3" />

              <path d="M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25 L350,150 L0,150 Z" fill="url(#fuelLineGrad)" />
              <path d="M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25" fill="none" stroke="#06b6d4" strokeWidth="2.5" />

              <path d="M0,135 C50,140 90,115 140,110 C190,105 220,125 260,95 C300,75 330,85 350,65" fill="none" stroke="#a855f7" strokeWidth="2" />

              <circle cx="140" cy="80" r="3" fill="#06b6d4" />
              <circle cx="260" cy="65" r="3" fill="#06b6d4" />
            </svg>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800">
              <span>Mar 1</span>
              <span>Mar 5</span>
              <span>Mar 10</span>
              <span>Mar 15</span>
              <span>Mar 20</span>
              <span>Mar 25</span>
              <span>Mar 31</span>
            </div>
          </div>
        </div>

        {/* PANEL 7: ALERTS & REMINDERS */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-sm">🔔</span>
                <h3 className="font-bold text-white text-sm">Alerts & Reminders</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownModal({
                  isOpen: true,
                  type: 'all_alerts',
                  title: 'Complete Fleet Alerts & Compliance Action Queue (8 Alerts)',
                  subtitle: 'Pending preventative maintenance, regulatory filings & telematics alerts',
                  data: fleetAlerts
                })}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                View All &gt;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {fleetAlerts.slice(0, 4).map(alt => (
                <div
                  key={alt.id}
                  onClick={() => setDrilldownModal({
                    isOpen: true,
                    type: 'alert_action',
                    title: alt.title,
                    subtitle: alt.category,
                    data: alt
                  })}
                  className={`p-2.5 bg-slate-950/80 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:border-slate-600 transition ${
                    alt.severity === 'high' ? 'border-rose-500/30' :
                    alt.severity === 'medium' ? 'border-amber-500/30' : 'border-blue-500/30'
                  }`}
                  title="Click to resolve alert"
                >
                  <span className="text-sm mt-0.5">{alt.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-200 leading-tight">
                      {alt.title}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-slate-500">{alt.time} • {alt.category}</span>
                      <span className="text-[10px] font-bold text-blue-400">Resolve →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Automated reminders connected to Enterprise Audit Engine
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. MODALS: UNIVERSAL DEEP DRILLDOWN MODAL
      ────────────────────────────────────────────────────────────── */}
      {drilldownModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Deep Analytics Drilldown
                </span>
                <h2 className="text-xl font-black text-white mt-1.5">{drilldownModal.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{drilldownModal.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeDrilldown}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Dynamic Body Content */}
            <div className="space-y-4 text-xs">
              {/* REVENUE DRILLDOWN */}
              {drilldownModal.type === 'revenue' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Total Invoiced</span>
                      <div className="text-lg font-black text-emerald-400 mt-1">₹{currentMetrics.revenue.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-500">Across {currentMetrics.trips} trips</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Revenue Per KM</span>
                      <div className="text-lg font-black text-cyan-400 mt-1">₹34.42 / km</div>
                      <span className="text-[10px] text-slate-500">Benchmark: ₹32.00 / km</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Avg Revenue / Trip</span>
                      <div className="text-lg font-black text-blue-400 mt-1">₹7,100 / trip</div>
                      <span className="text-[10px] text-emerald-400 font-bold">+₹700 vs Feb 2024</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Total Outstanding</span>
                      <div className="text-lg font-black text-amber-400 mt-1">₹345,000</div>
                      <span className="text-[10px] text-slate-500">Within 14-day credit terms</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-3">Corporate Client Contribution & Aging Matrix:</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                          <tr>
                            <th className="py-2">Client Name</th>
                            <th className="py-2">Contract Agreement</th>
                            <th className="py-2 text-right">Trips</th>
                            <th className="py-2 text-right">Billed Freight</th>
                            <th className="py-2 text-right">Net Margin</th>
                            <th className="py-2 text-right">Outstanding</th>
                            <th className="py-2 text-right">DSO Terms</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {clientsList.filter(c => c.id !== 'all').map(c => (
                            <tr key={c.id} className="hover:bg-slate-900/60">
                              <td className="py-2.5 font-bold text-white">{c.name}</td>
                              <td className="py-2.5 text-slate-400">{c.contractType}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{c.trips}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-400">₹{c.revenue.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 text-right font-mono text-white font-bold">{c.margin}</td>
                              <td className="py-2.5 text-right font-mono text-amber-400">₹{c.outstanding.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 text-right font-mono text-slate-400">{c.dso}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPENSES DRILLDOWN */}
              {(drilldownModal.type === 'expenses' || drilldownModal.type === 'expense_slice') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Fuel (Diesel)</span>
                      <div className="text-base font-black text-cyan-400 mt-1">₹872,410</div>
                      <span className="text-[10px] text-slate-500">42.3% • 9,431 L @ ₹92.5</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">FASTag Tolls</span>
                      <div className="text-base font-black text-purple-400 mt-1">₹383,120</div>
                      <span className="text-[10px] text-slate-500">18.6% • 1,280 plaza tags</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Workshop Maint</span>
                      <div className="text-base font-black text-amber-400 mt-1">₹249,350</div>
                      <span className="text-[10px] text-slate-500">12.1% • Spares & Bushings</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Driver Wages & Bata</span>
                      <div className="text-base font-black text-blue-400 mt-1">₹236,620</div>
                      <span className="text-[10px] text-slate-500">11.5% • 10 Crew Members</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-white text-xs">Recent Expense Vouchers & Invoices:</div>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">HPCL Bulk Depot Diesel Invoice #HP-9982</div>
                          <span className="text-[10px] text-slate-400">TG 12 U 2637 • 420 Litres @ ₹90.30/L • Dispensed at Hyderabad Hub</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-400">₹37,926</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">IHMCL NHAI FASTag Monthly Recharge #NHAI-4421</div>
                          <span className="text-[10px] text-slate-400">Monthly Pass renewal for 6 trucks on NH44 Shamshabad & Devanahalli</span>
                        </div>
                        <span className="font-mono font-bold text-purple-400">₹22,800</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">Ashok Leyland Authorized Service Job Card #AL-7741</div>
                          <span className="text-[10px] text-slate-400">Turbo pressure hose renewal + Injector ultrasonic cleaning (TG 12 U 2637)</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">₹14,200</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFIT & MARGIN DRILLDOWN */}
              {(drilldownModal.type === 'profit' || drilldownModal.type === 'margin') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Gross Margin</span>
                      <div className="text-lg font-black text-white mt-1">₹388,400</div>
                      <span className="text-[10px] text-slate-500">17.4% before fleet overheads</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Fleet Overheads</span>
                      <div className="text-lg font-black text-rose-400 mt-1">₹221,529.56</div>
                      <span className="text-[10px] text-slate-500">Insurance, permits, workshop rent</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Net Operational Profit</span>
                      <div className="text-lg font-black text-cyan-400 mt-1">₹166,870.44</div>
                      <span className="text-[10px] text-emerald-400 font-bold">7.5% Net Margin (Target: 8.0%)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-2">Quarterly Profit Trajectory:</div>
                    <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
                      <span className="text-slate-400">January 2024:</span>
                      <span className="font-mono text-white">₹134,200 (6.1% Margin)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
                      <span className="text-slate-400">February 2024:</span>
                      <span className="font-mono text-white">₹148,600 (6.8% Margin)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2">
                      <span className="text-slate-400">March 2024 (Current):</span>
                      <span className="font-mono font-bold text-emerald-400">₹166,870.44 (7.5% Margin)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TRIPS & DISPATCH MANIFEST */}
              {(drilldownModal.type === 'trips' || drilldownModal.type === 'manifest') && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-white text-xs">
                        {drilldownModal.type === 'manifest' ? `Dispatches on Mar ${drilldownModal.data?.day}, 2024 (${drilldownModal.data?.trips} Trips Recorded):` : 'Fleet Trip Status Breakdown (314 Trips):'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Real-Time Dispatch Feed</span>
                    </div>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                          <tr>
                            <th className="py-2">LR Number</th>
                            <th className="py-2">Truck No</th>
                            <th className="py-2">Driver</th>
                            <th className="py-2">Client</th>
                            <th className="py-2">Corridor Route</th>
                            <th className="py-2 text-right">Freight</th>
                            <th className="py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {(drilldownModal.data?.list || sampleTripsManifest).map((t, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="py-2.5 font-mono text-cyan-400 font-bold">{t.lrNo}</td>
                              <td className="py-2.5 font-bold text-white">{t.truck}</td>
                              <td className="py-2.5 text-slate-300">{t.driver}</td>
                              <td className="py-2.5 text-slate-400">{t.client}</td>
                              <td className="py-2.5 font-semibold text-white">{t.route}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-400">₹{t.freight.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                                  t.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* FLEET TRUCKS & UTILIZATION */}
              {drilldownModal.type === 'utilization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Total Commercial Trucks</span>
                      <div className="text-lg font-black text-white mt-1">12 Heavy Trucks</div>
                      <span className="text-[10px] text-emerald-400 font-bold">100% RC & Tax Compliant</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Active in Transit</span>
                      <div className="text-lg font-black text-blue-400 mt-1">9 Commercial Trucks</div>
                      <span className="text-[10px] text-slate-500">Live on highways</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Overall Fleet Utilization</span>
                      <div className="text-lg font-black text-teal-400 mt-1">{currentMetrics.utilization}</div>
                      <span className="text-[10px] text-slate-500">Target: 80%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-3">Live Fleet Roster (12 Commercial Trucks):</div>
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                          <tr>
                            <th className="py-2">Truck Number</th>
                            <th className="py-2">Vehicle Model</th>
                            <th className="py-2">Assigned Driver</th>
                            <th className="py-2">Current Location</th>
                            <th className="py-2 text-right">Odometer (km)</th>
                            <th className="py-2 text-right">Health Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {fleetTrucks.map(t => (
                            <tr key={t.number} className="hover:bg-slate-900/60">
                              <td className="py-2.5 font-bold text-white font-mono">{t.number}</td>
                              <td className="py-2.5 text-slate-300">{t.brand}</td>
                              <td className="py-2.5 text-slate-300 font-semibold">{t.driver}</td>
                              <td className="py-2.5 text-slate-400">{t.location}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{t.odometer.toLocaleString()}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.health.includes('Service Due') ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {t.health}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ALL DRIVERS SCORECARDS */}
              {(drilldownModal.type === 'drivers' || drilldownModal.type === 'driver_detail') && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-3">Driver Crew Performance & Telematics Scorecards (10 Drivers):</div>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                          <tr>
                            <th className="py-2">Driver Name</th>
                            <th className="py-2">Experience</th>
                            <th className="py-2">Assigned Truck</th>
                            <th className="py-2 text-right">Decoupled Mileage</th>
                            <th className="py-2 text-right">Safety Score</th>
                            <th className="py-2 text-right">Trips Done</th>
                            <th className="py-2 text-right">Performance Tag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {fleetDrivers.map(d => (
                            <tr key={d.name} className="hover:bg-slate-900/60">
                              <td className="py-2.5 font-bold text-white">{d.name}</td>
                              <td className="py-2.5 text-slate-400">{d.exp}</td>
                              <td className="py-2.5 font-mono text-slate-300">{d.truck}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-emerald-400">{d.mileage}</td>
                              <td className="py-2.5 text-right font-mono text-cyan-400">{d.score}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{d.trips}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  d.status.includes('Eco-Training') ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {d.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ALL ROUTES MODAL */}
              {drilldownModal.type === 'all_routes' && (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto pr-1">
                    <table className="w-full text-left">
                      <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                        <tr>
                          <th className="py-2">#</th>
                          <th className="py-2">Route Corridor</th>
                          <th className="py-2">Highway Link</th>
                          <th className="py-2 text-right">Trips</th>
                          <th className="py-2 text-right">Distance (km)</th>
                          <th className="py-2 text-right">Revenue</th>
                          <th className="py-2 text-right">Fuel Cost</th>
                          <th className="py-2 text-right">Profit Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {allRoutesData.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2.5 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2.5 font-bold text-white">{r.route}</td>
                            <td className="py-2.5 text-slate-400 text-[11px]">{r.highway}</td>
                            <td className="py-2.5 text-right font-mono text-slate-300">{r.trips}</td>
                            <td className="py-2.5 text-right font-mono text-slate-400">{r.distance.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-white">₹{r.revenue.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 text-right font-mono text-cyan-400">₹{r.fuelCost.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-emerald-400">{r.margin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SINGLE ROUTE DETAIL */}
              {drilldownModal.type === 'route' && drilldownModal.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Total Trips</span>
                      <div className="text-lg font-black text-white mt-1">{drilldownModal.data.trips} Trips</div>
                      <span className="text-[10px] text-slate-500">March 2024</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Total Distance</span>
                      <div className="text-lg font-black text-cyan-400 mt-1">{drilldownModal.data.distance} km</div>
                      <span className="text-[10px] text-slate-500">Across convoys</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Billed Revenue</span>
                      <div className="text-lg font-black text-emerald-400 mt-1">₹{drilldownModal.data.revenue.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-500">Top: {drilldownModal.data.topClient}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Profit Margin</span>
                      <div className="text-lg font-black text-purple-400 mt-1">{drilldownModal.data.margin}</div>
                      <span className="text-[10px] text-emerald-400 font-bold">Optimal Corridor</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-xs">Corridor Logistics Profile:</div>
                    <div className="text-slate-300 space-y-1">
                      <div>• <strong>Primary Highway Link:</strong> {drilldownModal.data.highway}</div>
                      <div>• <strong>Major Corporate Shipper:</strong> {drilldownModal.data.topClient}</div>
                      <div>• <strong>Return Load Availability:</strong> High (88% backhaul availability from industrial clusters)</div>
                      <div>• <strong>Average Door-to-Door Transit:</strong> 42 hours with GPS geofenced waypoints</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ALL ALERTS MODAL */}
              {drilldownModal.type === 'all_alerts' && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {fleetAlerts.map(alt => (
                    <div key={alt.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{alt.icon}</span> {alt.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{alt.description}</p>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">{alt.time} • {alt.category}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Action triggered: ${alt.actionTitle}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer ml-3 shrink-0"
                      >
                        {alt.actionTitle}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ALERT ACTION MODAL */}
              {drilldownModal.type === 'alert_action' && drilldownModal.data && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{drilldownModal.data.icon}</span>
                      <h4 className="font-bold text-white text-sm">{drilldownModal.data.title}</h4>
                    </div>
                    <p className="text-slate-300 text-xs mb-3">{drilldownModal.data.description}</p>
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <strong>Audit Classification:</strong> {drilldownModal.data.category} • Logged: {drilldownModal.data.time}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeDrilldown}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Action confirmed: ${drilldownModal.data.actionTitle}. Workflow ticket dispatched.`);
                        closeDrilldown();
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      Confirm: {drilldownModal.data.actionTitle}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeDrilldown}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                Close Deep Drilldown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg mx-auto">
              JB
            </div>
            <div>
              <h3 className="font-bold text-white text-base">John B.</h3>
              <p className="text-xs text-slate-400">Chief Fleet Operations & Telematics</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
              <div><strong>Role:</strong> Super Admin / Fleet Dispatcher</div>
              <div><strong>Portal:</strong> Jai Bhavani Cargo ERP v78</div>
              <div><strong>Access Level:</strong> Complete Read/Write/Export</div>
              <div><strong>Active Fleet Scope:</strong> 12 Heavy Commercial Trucks</div>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
