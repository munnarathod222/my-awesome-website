const fs = require('fs');
const path = require('path');

const jsxPath = path.resolve(__dirname, '../apps/web/src/pages/ClientPortalPage.jsx');
let content = fs.readFileSync(jsxPath, 'utf8');

// 1. Add activeTab state
if (!content.includes('activeTab, setActiveTab')) {
  content = content.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const [searchQuery, setSearchQuery] = useState('');\n  const [activeTab, setActiveTab] = useState('completed');"
  );
}

// 2. Update metrics calculation
const oldMetricsStart = 'const metrics = useMemo(() => {';
const mStart = content.indexOf(oldMetricsStart);
const mEnd = content.indexOf('}, [tripLogs, clientData]);', mStart);

if (mStart !== -1 && mEnd !== -1) {
  const newMetrics = `const metrics = useMemo(() => {
    const upcomingTrips = tripLogs.filter(t => 
      t.trip_status === 'Upcoming' || t.trip_status === 'Scheduled' || t.trip_status === 'Pending'
    );
    const activeShipments = tripLogs.filter(t => 
      t.trip_status === 'Dispatched' || t.trip_status === 'In Transit' || t.trip_status === 'Active'
    );
    const completedTrips = tripLogs.filter(t => 
      t.trip_status === 'Delivered' || t.trip_status === 'Completed'
    );

    const hasPod = (t) => {
      const podFiles = getPodFiles(t);
      return Boolean(
        t.pod_url || 
        t.pod_file || 
        t.pod_link || 
        (podFiles && podFiles.length > 0) || 
        t.pod_uploaded === true || 
        t.pod_uploaded === 'true' || 
        t.pod_status === 'Uploaded' || 
        t.pod_status === 'Verified'
      );
    };

    const pendingPodTrips = completedTrips.filter(t => !hasPod(t));
    const pendingPodCount = pendingPodTrips.length;

    // Net Payable Dues to Admin (Delivered & Completed Trips Only)
    const unpaidDeliveredTrips = completedTrips.filter(t => {
      const st = (t.client_payment_status || '').toLowerCase();
      const rev = Number(t.revenue) || Number(t.freight_amount) || 0;
      const adv = Number(t.advance_received_from_client) || 0;
      const toll = Number(t.toll_deduction) || 0;
      const bal = Math.max(0, rev - adv - toll);
      return st !== 'received' && st !== 'paid' && bal > 0;
    });

    const payableAmount = unpaidDeliveredTrips.reduce((sum, t) => {
      const rev = Number(t.revenue) || Number(t.freight_amount) || 0;
      const adv = Number(t.advance_received_from_client) || 0;
      const toll = Number(t.toll_deduction) || 0;
      return sum + Math.max(0, rev - adv - toll);
    }, 0);

    const now = new Date();
    const currentMonthName = format(now, 'MMM yyyy');
    const monthlyTrips = tripLogs.filter(t => {
      const dStr = t.date || t.start_date || t.created;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyFreightSpend = monthlyTrips.reduce((sum, t) => sum + (Number(t.revenue) || Number(t.freight_amount) || 0), 0);

    const totalFreight = tripLogs.reduce((sum, t) => sum + (Number(t.revenue) || Number(t.freight_amount) || 0), 0);
    const totalAdvance = tripLogs.reduce((sum, t) => sum + (Number(t.advance_received_from_client) || 0), 0);
    const podsCount = completedTrips.length - pendingPodCount;

    return {
      totalShipments: tripLogs.length,
      upcomingTrips,
      activeShipments,
      completedTrips,
      pendingPodTrips,
      unpaidDeliveredTrips,
      monthlyTrips,
      upcomingCount: upcomingTrips.length,
      activeCount: activeShipments.length,
      completedCount: completedTrips.length,
      pendingPodCount,
      unpaidCount: unpaidDeliveredTrips.length,
      monthlyCount: monthlyTrips.length,
      currentMonthName,
      totalFreight,
      totalAdvance,
      payableAmount,
      monthlyFreightSpend,
      podsCount
    };
  }, [tripLogs, clientData]);`;

  content = content.slice(0, mStart) + newMetrics + content.slice(mEnd + '}, [tripLogs, clientData]);'.length);
}

// 3. Replace cards grid
const oldGridMarker = '{/* ── Client KPI Cards ─────────────────────────────────────────── */}';
const gridStart = content.indexOf(oldGridMarker);
const tabsMarker = '{/* ── Main Freight Statement Tabs ──────────────────────────────────────── */}';
const gridEnd = content.indexOf(tabsMarker, gridStart);

if (gridStart !== -1 && gridEnd !== -1) {
  const newGrid = `{/* ── Client KPI Cards: 6-Metric Executive Grid ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* Card 1: Total Shipments */}
        <Card onClick={() => setActiveTab('all')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-cyan-950/40 via-card to-card border-cyan-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'all' ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Total Shipments</span>
              <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-cyan-400 font-heading">
              {metrics.totalShipments}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              All Booked Loads
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Shipments In Transit */}
        <Card onClick={() => setActiveTab('active')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'active' ? 'ring-2 ring-blue-400 border-blue-400 shadow-blue-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />
                In Transit
              </span>
              <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-400 font-heading">
              {metrics.activeCount}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              Moving on Highways
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Delivered Shipments */}
        <Card onClick={() => setActiveTab('completed')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-emerald-950/40 via-card to-card border-emerald-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'completed' ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-emerald-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered</span>
              <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-heading">
              {metrics.completedCount}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              Safely Received
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pending POD */}
        <Card onClick={() => setActiveTab('pending_pod')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-amber-950/40 via-card to-card border-amber-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'pending_pod' ? 'ring-2 ring-amber-400 border-amber-400 shadow-amber-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending POD</span>
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-heading">
              {metrics.pendingPodCount}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              Awaiting Signed Proof
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Outstanding Payments */}
        <Card onClick={() => setActiveTab('unpaid')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-rose-950/40 via-card to-card border-rose-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'unpaid' ? 'ring-2 ring-rose-400 border-rose-400 shadow-rose-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Outstanding</span>
              <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-heading truncate">
              {formatCurrency(metrics.payableAmount)}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              Net Delivered Balance Due
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Monthly Freight Spend */}
        <Card onClick={() => setActiveTab('monthly')} className={\`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-violet-950/40 via-card to-card border-violet-500/30 shadow-soft rounded-2xl relative overflow-hidden \${activeTab === 'monthly' ? 'ring-2 ring-violet-400 border-violet-400 shadow-violet-500/20' : ''}\`}>
          <CardContent className="p-3.5 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Monthly Spend</span>
              <div className="p-1.5 bg-violet-500/20 rounded-lg text-violet-400">
                <FileBox className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-violet-400 font-heading truncate">
              {formatCurrency(metrics.monthlyFreightSpend)}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1">
              {metrics.monthlyCount} Trips in {metrics.currentMonthName}
            </div>
          </CardContent>
        </Card>
      </div>\n\n      `;

  content = content.slice(0, gridStart) + newGrid + content.slice(gridEnd);
}

// 4. Update Tabs component to use activeTab
content = content.replace('<Tabs defaultValue="completed" className="w-full">', '<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">');

// 5. Update TabsList triggers
const oldTriggers = `<TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    Upcoming ({metrics.upcomingCount})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    In-Transit ({metrics.activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    Completed & PODs ({metrics.completedCount})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-3 py-1.5">
                    All Freight ({tripLogs.length})
                  </TabsTrigger>`;

const newTriggers = `<TabsTrigger value="all" className="rounded-lg text-xs font-bold px-2.5 py-1.5">
                    All Freight ({metrics.totalShipments})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-lg text-xs font-bold px-2.5 py-1.5">
                    In-Transit ({metrics.activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg text-xs font-bold px-2.5 py-1.5">
                    Delivered ({metrics.completedCount})
                  </TabsTrigger>
                  <TabsTrigger value="pending_pod" className="rounded-lg text-xs font-bold px-2.5 py-1.5 border border-amber-500/30 text-amber-400">
                    Pending POD ({metrics.pendingPodCount})
                  </TabsTrigger>
                  <TabsTrigger value="unpaid" className="rounded-lg text-xs font-bold px-2.5 py-1.5 border border-rose-500/30 text-rose-400">
                    Outstanding Dues ({metrics.unpaidCount})
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="rounded-lg text-xs font-bold px-2.5 py-1.5 border border-violet-500/30 text-violet-400">
                    This Month ({metrics.monthlyCount})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold px-2.5 py-1.5">
                    Upcoming ({metrics.upcomingCount})
                  </TabsTrigger>`;

content = content.replace(oldTriggers, newTriggers);

fs.writeFileSync(jsxPath, content, 'utf8');
console.log('✓ Successfully synced apps/web/src/pages/ClientPortalPage.jsx');
