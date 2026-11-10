const fs = require('fs');
const path = require('path');

console.log('Generating Client Portal 6-KPI Overhaul (Option 1: 6-Card Responsive Grid with Interactive Table Synchronisation)...');

const chunkPath = path.resolve(__dirname, '../dist/assets/ClientPortalPage-DuEOcerk.js');
let content = fs.readFileSync(chunkPath, 'utf8');

// 1. Update metrics calculation in chunk
// Locate metrics `m = c.useMemo(() => { ... return { ... } }, [h, x])`
const oldMetricsMarker = 'm=c.useMemo(()=>{';
const mStart = content.indexOf(oldMetricsMarker);
if (mStart === -1) {
  throw new Error('Could not find m=c.useMemo in ClientPortalPage-DuEOcerk.js');
}

const mEndMarker = '},[h,x])';
const mEnd = content.indexOf(mEndMarker, mStart);
if (mEnd === -1) {
  throw new Error('Could not find end of m=c.useMemo in ClientPortalPage-DuEOcerk.js');
}

const newMetricsCode = `m=c.useMemo(()=>{
  const t=h.filter(n=>n.trip_status==="Upcoming"||n.trip_status==="Scheduled"||n.trip_status==="Pending"),
        o=h.filter(n=>n.trip_status==="Dispatched"||n.trip_status==="In Transit"||n.trip_status==="Active"),
        s=h.filter(n=>n.trip_status==="Delivered"||n.trip_status==="Completed"),
        _=h.reduce((n,a)=>n+(Number(a.revenue)||Number(a.freight_amount)||0),0),
        f=h.reduce((n,a)=>n+(Number(a.advance_received_from_client)||0),0),
        hasPod=n=>Boolean(n.pod_url||n.pod_file||n.pod_link||n.pod_status==="Uploaded"||n.pod_status==="Verified"||n.pod_uploaded===true||n.pod_uploaded==="true"),
        pendingPodTrips=s.filter(n=>!hasPod(n)),
        unpaidDeliveredTrips=s.filter(n=>{
          const u=(n.client_payment_status||"").toLowerCase(),
                rev=Number(n.revenue)||Number(n.freight_amount)||0,
                adv=Number(n.advance_received_from_client)||0,
                toll=Number(n.toll_deduction)||0,
                bal=Math.max(0,rev-adv-toll);
          return u!=="received"&&u!=="paid"&&bal>0;
        }),
        L=unpaidDeliveredTrips.reduce((n,a)=>{
          const u=Number(a.revenue)||Number(a.freight_amount)||0,
                k=Number(a.advance_received_from_client)||0,
                R=Number(a.toll_deduction)||0;
          return n+Math.max(0,u-k-R);
        },0),
        now=new Date(),
        currentMonthName=now.toLocaleString("en-US",{month:"short",year:"numeric"}),
        monthlyTrips=h.filter(n=>{
          const dStr=n.date||n.start_date||n.created;
          if(!dStr)return false;
          const d=new Date(dStr);
          return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
        }),
        monthlyFreightSpend=monthlyTrips.reduce((n,a)=>n+(Number(a.revenue)||Number(a.freight_amount)||0),0);
  return {
    totalShipments:h.length,
    upcomingTrips:t,
    activeShipments:o,
    completedTrips:s,
    pendingPodTrips,
    unpaidDeliveredTrips,
    monthlyTrips,
    upcomingCount:t.length,
    activeCount:o.length,
    completedCount:s.length,
    pendingPodCount:pendingPodTrips.length,
    unpaidCount:unpaidDeliveredTrips.length,
    monthlyCount:monthlyTrips.length,
    currentMonthName,
    totalFreight:_,
    totalAdvance:f,
    payableAmount:L,
    monthlyFreightSpend,
    podsCount:s.length-pendingPodTrips.length
  };
},[h,x])`;

content = content.slice(0, mStart) + newMetricsCode + content.slice(mEnd + mEndMarker.length);

// 2. Replace the 5-card grid with the 6-card responsive grid
const oldGridMarker = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",children:[';
const gridStart = content.indexOf(oldGridMarker);
if (gridStart === -1) {
  throw new Error('Could not find old cards grid in ClientPortalPage-DuEOcerk.js');
}

const gridEndMarker = 'Verified Delivery Proofs"})]})})]}),';
const gridEnd = content.indexOf(gridEndMarker, gridStart);
if (gridEnd === -1) {
  throw new Error('Could not find old cards grid end in ClientPortalPage-DuEOcerk.js');
}

const newGridCode = `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5",children:[
  /* Card 1: Total Shipments */
  e.jsx(y,{onClick:()=>setPortalTab("all"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-cyan-950/40 via-card to-card border-cyan-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="all"?"ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-cyan-400",children:"Total Shipments"}),
      e.jsx("div",{className:"p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400",children:e.jsx(ne,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-cyan-400 font-heading",children:m.totalShipments}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"All Booked Loads"})
  ]})}),

  /* Card 2: Shipments In Transit */
  e.jsx(y,{onClick:()=>setPortalTab("active"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="active"?"ring-2 ring-blue-400 border-blue-400 shadow-blue-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsxs("span",{className:"text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1",children:[
        e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block"}),
        "In Transit"
      ]}),
      e.jsx("div",{className:"p-1.5 bg-blue-500/20 rounded-lg text-blue-400",children:e.jsx(ne,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-blue-400 font-heading",children:m.activeCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Moving on Highways"})
  ]})}),

  /* Card 3: Delivered Shipments */
  e.jsx(y,{onClick:()=>setPortalTab("completed"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-emerald-950/40 via-card to-card border-emerald-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="completed"?"ring-2 ring-emerald-400 border-emerald-400 shadow-emerald-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-emerald-400",children:"Delivered"}),
      e.jsx("div",{className:"p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400",children:e.jsx(oe,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-emerald-400 font-heading",children:m.completedCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Safely Received"})
  ]})}),

  /* Card 4: Pending POD */
  e.jsx(y,{onClick:()=>setPortalTab("pending_pod"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-amber-950/40 via-card to-card border-amber-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="pending_pod"?"ring-2 ring-amber-400 border-amber-400 shadow-amber-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-amber-400",children:"Pending POD"}),
      e.jsx("div",{className:"p-1.5 bg-amber-500/20 rounded-lg text-amber-400",children:e.jsx(Y,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-amber-400 font-heading",children:m.pendingPodCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Awaiting Signed Proof"})
  ]})}),

  /* Card 5: Outstanding Payments */
  e.jsx(y,{onClick:()=>setPortalTab("unpaid"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-rose-950/40 via-card to-card border-rose-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="unpaid"?"ring-2 ring-rose-400 border-rose-400 shadow-rose-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-rose-400",children:"Outstanding"}),
      e.jsx("div",{className:"p-1.5 bg-rose-500/20 rounded-lg text-rose-400",children:e.jsx(Oe,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-xl sm:text-2xl font-black text-rose-400 font-heading truncate",children:T(m.payableAmount)}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Delivered Net Balance Due"})
  ]})}),

  /* Card 6: Monthly Freight Spend */
  e.jsx(y,{onClick:()=>setPortalTab("monthly"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-violet-950/40 via-card to-card border-violet-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="monthly"?"ring-2 ring-violet-400 border-violet-400 shadow-violet-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-violet-400",children:"Monthly Spend"}),
      e.jsx("div",{className:"p-1.5 bg-violet-500/20 rounded-lg text-violet-400",children:e.jsx(ie,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-xl sm:text-2xl font-black text-violet-400 font-heading truncate",children:T(m.monthlyFreightSpend)}),
    e.jsxs("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:[m.monthlyCount," Trips in ",m.currentMonthName]})
  ]})})
]})}),`;

content = content.slice(0, gridStart) + newGridCode + content.slice(gridEnd + gridEndMarker.length);

// 3. Update TabsList triggers
const oldTabsTriggerMarker = 'children:[e.jsxs(P,{value:"upcoming",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["Upcoming (",m.upcomingCount,")"]}),e.jsxs(P,{value:"active",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["In-Transit (",m.activeCount,")"]}),e.jsxs(P,{value:"completed",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["Completed & PODs (",m.completedCount,")"]}),e.jsxs(P,{value:"all",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["All Freight (",h.length,")"]}),e.jsxs(P,{value:"bidding"';
const tabsTriggerStart = content.indexOf(oldTabsTriggerMarker);
if (tabsTriggerStart === -1) {
  throw new Error('Could not find old tabs triggers in ClientPortalPage-DuEOcerk.js');
}

const tabsTriggerEndMarker = 'Lane Bidding & Rates"]})]})';
const tabsTriggerEnd = content.indexOf(tabsTriggerEndMarker, tabsTriggerStart);
if (tabsTriggerEnd === -1) {
  throw new Error('Could not find old tabs triggers end in ClientPortalPage-DuEOcerk.js');
}

const newTabsTriggers = `children:[
  e.jsxs(P,{value:"all",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["All Freight (",m.totalShipments,")"]}),
  e.jsxs(P,{value:"active",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["In-Transit (",m.activeCount,")"]}),
  e.jsxs(P,{value:"completed",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["Delivered (",m.completedCount,")"]}),
  e.jsxs(P,{value:"pending_pod",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-amber-500/30 text-amber-400",children:["Pending POD (",m.pendingPodCount,")"]}),
  e.jsxs(P,{value:"unpaid",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-rose-500/30 text-rose-400",children:["Outstanding Dues (",m.unpaidCount,")"]}),
  e.jsxs(P,{value:"monthly",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-violet-500/30 text-violet-400",children:["This Month (",m.monthlyCount,")"]}),
  e.jsxs(P,{value:"upcoming",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["Upcoming (",m.upcomingCount,")"]}),
  e.jsxs(P,{value:"bidding",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-amber-500/30 text-amber-400",children:[e.jsx(O,{className:"w-3 h-3 mr-1"})," Lane Bidding"]})
]})`;

content = content.slice(0, tabsTriggerStart) + newTabsTriggers + content.slice(tabsTriggerEnd + tabsTriggerEndMarker.length);

// 4. Add the 3 new TabContents (pending_pod, unpaid, monthly) right before tab "bidding"
const biddingTabMarker = 'e.jsxs(A,{value:"bidding"';
const biddingStart = content.indexOf(biddingTabMarker);
if (biddingStart === -1) {
  throw new Error('Could not find bidding tab in ClientPortalPage-DuEOcerk.js');
}

const newTabContents = `/* Tab: Pending POD */
e.jsx(A,{value:"pending_pod",className:"p-0 m-0",children:e.jsxs("div",{className:"space-y-3",children:[
  e.jsxs("div",{className:"p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between",children:[
    e.jsxs("div",{className:"flex items-center gap-2 text-xs text-amber-300 font-bold",children:[
      e.jsx(Y,{className:"w-4 h-4 text-amber-400"}),
      "Showing ",m.pendingPodCount," delivered shipments awaiting signed physical POD document upload."
    ]}),
    e.jsx(p,{className:"bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold",children:"Action Required"})
  ]}),
  e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[
    e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[
      e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),
      e.jsx(l,{className:"font-semibold",children:"Delivery Date"}),
      e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),
      e.jsx(l,{className:"font-semibold",children:"Route"}),
      e.jsx(l,{className:"font-semibold",children:"Driver"}),
      e.jsx(l,{className:"font-semibold text-center",children:"POD Status"}),
      e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Freight (₹)"})
    ]})}),
    e.jsx(V,{children:m.pendingPodTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-emerald-400 font-bold",children:"🎉 Excellent! All delivered shipments have verified POD documents uploaded."})}):m.pendingPodTrips.map(t=>e.jsxs(b,{key:t.id,className:"hover:bg-muted/30 transition-colors",children:[
      e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),
      e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),
      e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),
      e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),
      e.jsx(r,{className:"text-xs text-muted-foreground",children:t.driver_name||"—"}),
      e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs",children:"Pending POD Upload"})}),
      e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})
    ]}))
  ]})})
]})}),

/* Tab: Outstanding Payments */
e.jsx(A,{value:"unpaid",className:"p-0 m-0",children:e.jsxs("div",{className:"space-y-3",children:[
  e.jsxs("div",{className:"p-3.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between",children:[
    e.jsxs("div",{className:"flex items-center gap-2 text-xs text-rose-300 font-bold",children:[
      e.jsx(Oe,{className:"w-4 h-4 text-rose-400"}),
      "Total Outstanding Payable Balance: ",e.jsx("strong",{className:"text-white font-mono text-sm ml-1",children:T(m.payableAmount)})
    ]}),
    e.jsx(p,{className:"bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold",children:m.unpaidCount+" Pending Trips"})
  ]}),
  e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[
    e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[
      e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),
      e.jsx(l,{className:"font-semibold",children:"Delivery Date"}),
      e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),
      e.jsx(l,{className:"font-semibold",children:"Route"}),
      e.jsx(l,{className:"font-semibold text-right",children:"Freight (₹)"}),
      e.jsx(l,{className:"font-semibold text-right",children:"Advance Paid (₹)"}),
      e.jsx(l,{className:"pr-6 text-right font-semibold text-rose-400",children:"Net Balance Due (₹)"})
    ]})}),
    e.jsx(V,{children:m.unpaidDeliveredTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-emerald-400 font-bold",children:"🎉 Clear Ledger! No outstanding freight dues pending for delivered shipments."})}):m.unpaidDeliveredTrips.map(t=>{
      const rev=Number(t.revenue)||Number(t.freight_amount)||0,
            adv=Number(t.advance_received_from_client)||0,
            toll=Number(t.toll_deduction)||0,
            bal=Math.max(0,rev-adv-toll);
      return e.jsxs(b,{key:t.id,className:"hover:bg-muted/30 transition-colors",children:[
        e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),
        e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),
        e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),
        e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),
        e.jsx(r,{className:"text-right font-mono text-sm",children:T(rev)}),
        e.jsx(r,{className:"text-right font-mono text-sm text-emerald-400",children:T(adv)}),
        e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono text-rose-400",children:T(bal)})
      ]});
    })
  ]})})
]})}),

/* Tab: Monthly Freight Spend */
e.jsx(A,{value:"monthly",className:"p-0 m-0",children:e.jsxs("div",{className:"space-y-3",children:[
  e.jsxs("div",{className:"p-3.5 bg-violet-500/10 border-b border-violet-500/20 flex items-center justify-between",children:[
    e.jsxs("div",{className:"flex items-center gap-2 text-xs text-violet-300 font-bold",children:[
      e.jsx(ie,{className:"w-4 h-4 text-violet-400"}),
      "Freight Spend for ",m.currentMonthName,": ",e.jsx("strong",{className:"text-white font-mono text-sm ml-1",children:T(m.monthlyFreightSpend)})
    ]}),
    e.jsx(p,{className:"bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-mono font-bold",children:m.monthlyCount+" Consignments"})
  ]}),
  e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[
    e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[
      e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),
      e.jsx(l,{className:"font-semibold",children:"Trip Date"}),
      e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),
      e.jsx(l,{className:"font-semibold",children:"Route"}),
      e.jsx(l,{className:"font-semibold text-center",children:"Status"}),
      e.jsx(l,{className:"pr-6 text-right font-semibold text-violet-400",children:"Freight Billing (₹)"})
    ]})}),
    e.jsx(V,{children:m.monthlyTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:6,className:"text-center py-12 text-muted-foreground",children:"No freight consignments recorded for this calendar month yet."})}):m.monthlyTrips.map(t=>e.jsxs(b,{key:t.id,className:"hover:bg-muted/30 transition-colors",children:[
      e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),
      e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),
      e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),
      e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),
      e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"font-bold text-xs bg-slate-800 text-slate-300 border-slate-700",children:t.trip_status||"Scheduled"})}),
      e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono text-violet-400",children:T(t.revenue||t.freight_amount||0)})
    ]}))
  ]})})
]})}),
`;

content = content.slice(0, biddingStart) + newTabContents + content.slice(biddingStart);

// Write to all bundle locations
const destinations = [
  'dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/web/dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/api/dist/assets/ClientPortalPage-DuEOcerk.js',
  'dist/apps/web/assets/ClientPortalPage-DuEOcerk.js'
];

destinations.forEach(dest => {
  const fullDest = path.resolve(__dirname, '..', dest);
  if (fs.existsSync(path.dirname(fullDest))) {
    fs.writeFileSync(fullDest, content, 'utf8');
    console.log('✓ Wrote updated chunk to:', dest);
  }
});

console.log('\n🎉 Successfully updated ClientPortalPage chunks with 6-KPI executive grid & tab synchronization!');
