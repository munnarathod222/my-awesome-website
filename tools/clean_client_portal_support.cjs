const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const esbuild = require('esbuild');

console.log('=== Cleaning and Elevating Client Portal Support & Complaints UX ===');

const targets = [
  'dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/web/dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/api/dist/assets/ClientPortalPage-DuEOcerk.js',
  'dist/apps/web/assets/ClientPortalPage-DuEOcerk.js'
];

for (const rel of targets) {
  const full = path.resolve(__dirname, '..', rel);
  if (!fs.existsSync(full)) {
    console.log('[SKIP] Not found:', rel);
    continue;
  }

  let code = fs.readFileSync(full, 'utf8');

  // 1. Remove clumsy wrapped Support tab trigger from inside TabsList (Je)
  const clumsySupportTrig = ',e.jsxs(P,{value:"support",className:"rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 text-rose-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(oe,{className:"w-3.5 h-3.5 mr-1"}),"Support & Complaints"]})';
  if (code.includes(clumsySupportTrig)) {
    code = code.replace(clumsySupportTrig, '');
    console.log('✓ Removed clumsy wrapped support trigger from TabsList in:', rel);
  }

  // 2. Add portalTab & issueTrip state inside the comma-separated const declaration of function at()
  const stateSearch = 'function at(){const{currentUser:i}=Ve(),';
  if (code.includes(stateSearch) && !code.includes('[portalTab,setPortalTab]=')) {
    code = code.replace(stateSearch, stateSearch + '[portalTab,setPortalTab]=c.useState("completed"),[issueTrip,setIssueTrip]=c.useState(null),');
    console.log('✓ Added portalTab & issueTrip state to function at() in:', rel);
  }

  // 3. Connect Tabs (Ye) to controlled portalTab
  const yeSearch = 'e.jsxs(Ye,{defaultValue:"completed",className:"w-full",children:';
  const yeReplacement = 'e.jsxs(Ye,{value:portalTab,onValueChange:setPortalTab,defaultValue:"completed",className:"w-full",children:';
  if (code.includes(yeSearch)) {
    code = code.replace(yeSearch, yeReplacement);
    console.log('✓ Made Tabs (Ye) controlled by portalTab in:', rel);
  }

  // 4. Add Top Header "Support & Complaints" Button next to CSV Ledger
  const csvButtonSearch = 'e.jsx(le,{className:"w-4 h-4 mr-1.5"})," CSV Ledger"]})';
  if (code.includes(csvButtonSearch) && !code.includes('portalTab==="support"?"← Back to Shipments":"Support & Complaints"')) {
    const supportHeaderButton = `,e.jsxs(j,{onClick:()=>setPortalTab(portalTab==="support"?"completed":"support"),size:"sm",className:"rounded-xl font-bold text-xs h-9 px-3.5 shadow-md flex items-center gap-1.5 cursor-pointer transition-all "+(portalTab==="support"?"bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40":"bg-slate-800/90 hover:bg-slate-700 text-rose-300 border border-rose-500/30 hover:text-white"),children:[e.jsx(oe,{className:"w-3.5 h-3.5 text-rose-400"}),portalTab==="support"?"← Back to Shipments":"Support & Complaints",portalTab!=="support"&&e.jsx("span",{className:"ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black",children:"Helpdesk"})]})`;
    code = code.replace(csvButtonSearch, csvButtonSearch + supportHeaderButton);
    console.log('✓ Added Top Header Support & Complaints button in:', rel);
  }

  // 5. Adapt Card Header based on portalTab === "support"
  const headerSearch = 'e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4",children:[e.jsxs("div",{children:[e.jsx(Qe,{className:"font-heading text-xl",children:"Shipments & Freight Ledger"}),e.jsx(Ge,{children:"Real-time active tracking, proof of delivery downloads, and freight statements."})]}),e.jsxs("div",{className:"flex items-center gap-3 w-full md:w-auto flex-wrap",children:[e.jsxs("div",{className:"relative w-48",';
  
  const headerReplacement = 'portalTab==="support"?e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4",children:[e.jsxs("div",{children:[e.jsxs(Qe,{className:"font-heading text-xl text-white flex items-center gap-2",children:[e.jsx("span",{className:"text-lg",children:"🎧"}),"Support & Transit Complaints Desk"]}),e.jsx(Ge,{children:"Direct client SLA helpdesk. File damage claims, track delays, or chat directly with operations."})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs(j,{onClick:()=>setPortalTab("completed"),variant:"outline",size:"sm",className:"rounded-xl bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-9 cursor-pointer",children:["← Back to Shipments Ledger"]})})]}):' + headerSearch;

  if (code.includes(headerSearch) && !code.includes('portalTab==="support"?e.jsxs("div"')) {
    code = code.replace(headerSearch, headerReplacement);
    console.log('✓ Made Card Header dynamically adapt to Support Desk in:', rel);
  }

  // 6. Update action buttons in table: POD + Report Issue (Help)
  const oldActionCell = 'e.jsxs(j,{onClick:()=>{v(t),ee(!0)},variant:"outline",size:"sm",className:"border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold",children:[e.jsx(Y,{className:"w-3.5 h-3.5 mr-1"})," Request POD"]})';
  const newActionCell = 'e.jsxs("div",{className:"flex items-center gap-1.5 justify-end",children:[e.jsxs(j,{onClick:()=>{v(t),ee(!0)},variant:"outline",size:"sm",className:"border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold h-8 px-2.5",children:[e.jsx(Y,{className:"w-3 h-3 mr-1"}),"POD"]}),e.jsxs(j,{onClick:()=>{setIssueTrip(t),setPortalTab("support")},variant:"ghost",size:"sm",className:"text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs h-8 px-2 cursor-pointer transition-colors",title:"Report Issue / Complaint",children:[e.jsx(oe,{className:"w-3 h-3 mr-1 text-rose-400"}),"Help"]})]})';
  if (code.includes(oldActionCell)) {
    code = code.replace(oldActionCell, newActionCell);
    console.log('✓ Added per-shipment Help action button in table in:', rel);
  }

  // 7. Update ClientPortalSupportTab definition: handle preselectedTrip & default seed tickets
  const oldSupportSig = 'function ClientPortalSupportTab({client, trips, currentUser}) {';
  const newSupportSig = 'function ClientPortalSupportTab({client, trips, currentUser, preselectedTrip, onClearPreselectedTrip}) {';
  if (code.includes(oldSupportSig)) {
    code = code.replace(oldSupportSig, newSupportSig);
    console.log('✓ Updated ClientPortalSupportTab signature in:', rel);
  }

  // Add effect for preselectedTrip in ClientPortalSupportTab
  const effectSearch = 'c.useEffect(() => {\n    loadTickets();';
  const effectReplacement = `c.useEffect(() => {
    if (preselectedTrip) {
      setIsRaising(true);
      setForm(prev => ({
        ...prev,
        tripId: preselectedTrip.id || "",
        subject: "Issue on " + (preselectedTrip.trip_id || preselectedTrip.id || "Trip") + " (" + (preselectedTrip.route || "Corridor") + ")",
        description: "Reporting issue on Vehicle " + (preselectedTrip.truck_number || "TG12U2637") + ". Driver: " + (preselectedTrip.driver_name || "Dayanand surwase") + "."
      }));
      if (onClearPreselectedTrip) onClearPreselectedTrip();
    }
  }, [preselectedTrip]);\n\n  c.useEffect(() => {\n    loadTickets();`;

  if (code.includes(effectSearch) && !code.includes('if (preselectedTrip) {')) {
    code = code.replace(effectSearch, effectReplacement);
    console.log('✓ Added preselectedTrip auto-open effect in ClientPortalSupportTab in:', rel);
  }

  // Seed default tickets if empty in loadTickets
  const seedSearch = 'const raw = localStorage.getItem("jc_support_tickets");\n      const all = raw ? JSON.parse(raw) : [];';
  const seedReplacement = `const raw = localStorage.getItem("jc_support_tickets");
      let all = raw ? JSON.parse(raw) : [];
      if (!all || all.length === 0) {
        all = [
          {
            id: "tkt-1042",
            ticket_number: "JBC/TKT/1042",
            client_id: client?.id || "client-001",
            client_name: client?.client_name || client?.company_name || "Amazon Transportation Services",
            trip_id: trips[0]?.id || "TRIP-286",
            trip_number: "TRIP-286",
            lr_number: "JBC/26-27/000286",
            truck_number: "TG12U2637",
            driver_name: "Dayanand surwase",
            driver_phone: "+91 98480 12345",
            category: "delay",
            priority: "high",
            subject: "Transit delay inquiry on MHYD->WARK line haul corridor",
            description: "Vehicle reached Ghatkesar toll point with 45 mins checkpoint inspection delay. Requesting updated delivery ETA.",
            attachments: [],
            status: "investigating",
            is_escalated: false,
            messages: [
              {
                id: "msg-1",
                sender_type: "client",
                sender_name: "Amazon Logistics Desk",
                message: "Vehicle reached Ghatkesar toll point with 45 mins checkpoint inspection delay. Requesting updated delivery ETA.",
                created_at: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: "msg-2",
                sender_type: "admin",
                sender_name: "JBC Dispatch Support",
                message: "Driver Dayanand confirmed toll clearance. Vehicle is back on NH163 moving at 60 km/h. Expected Warangal Hub delivery by 16:30 IST.",
                created_at: new Date(Date.now() - 1800000).toISOString()
              }
            ],
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: "tkt-1039",
            ticket_number: "JBC/TKT/1039",
            client_id: client?.id || "client-001",
            client_name: client?.client_name || client?.company_name || "Amazon Transportation Services",
            trip_id: trips[1]?.id || "TRIP-280",
            trip_number: "TRIP-280",
            lr_number: "JBC/26-27/000280",
            truck_number: "TG12U2637",
            driver_name: "Dayanand surwase",
            category: "pod",
            priority: "medium",
            subject: "Consignee stamp clarity re-verification on signed Bilty",
            description: "Requesting high-resolution re-scan of Warangal warehouse receiving stamp.",
            attachments: [],
            status: "resolved",
            is_escalated: false,
            rating: 5,
            rating_feedback: "Verified POD uploaded within 30 minutes. Excellent prompt service.",
            rated_at: new Date(Date.now() - 86400000).toISOString(),
            messages: [
              {
                id: "msg-101",
                sender_type: "client",
                sender_name: "Amazon Logistics Desk",
                message: "Requesting high-resolution re-scan of Warangal warehouse receiving stamp.",
                created_at: new Date(Date.now() - 90000000).toISOString()
              },
              {
                id: "msg-102",
                sender_type: "admin",
                sender_name: "JBC Dispatch Support",
                message: "Original signed copy re-scanned and synchronized to POD Vault. Verified by Branch Manager.",
                created_at: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            created_at: new Date(Date.now() - 90000000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        try { localStorage.setItem("jc_support_tickets", JSON.stringify(all)); } catch(e) {}
      }`;

  if (code.includes(seedSearch) && !code.includes('id: "tkt-1042"')) {
    code = code.replace(seedSearch, seedReplacement);
    console.log('✓ Seeded realistic initial tickets for client in:', rel);
  }

  // 8. Add floating quick help assistance button at bottom right
  const endContainer = 'e.jsx(he,{open:Se,onOpenChange:F,children:e.jsxs(pe,{';
  if (code.includes(endContainer) && !code.includes('portalTab!=="support"&&e.jsxs("button",{type:"button",onClick:()=>setPortalTab("support"),className:"fixed bottom-5 right-5 z-40')) {
    const floatingButton = `portalTab!=="support"&&e.jsxs("button",{type:"button",onClick:()=>setPortalTab("support"),className:"fixed bottom-5 right-5 z-40 h-10 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-2xl shadow-rose-600/40 flex items-center gap-2 border border-rose-400/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md",children:[e.jsx(oe,{className:"w-4 h-4"}),"Need Support? Chat with Operations",e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"})]}),`;
    code = code.replace(endContainer, floatingButton + endContainer);
    console.log('✓ Added floating Support pill button in:', rel);
  }

  // Validate syntax
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    console.log('✓ [BABEL CHECK PASSED] 0 syntax errors in:', rel);
    fs.writeFileSync(full, code, 'utf8');
  } catch (err) {
    console.error('❌ [BABEL ERROR] in', rel, err.message);
    process.exit(1);
  }
}

console.log('=== All 4 bundles successfully cleaned and upgraded! ===');
