const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const bundleFiles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js'
];

// 1. Definition of LogTruckProblemModal to be placed right before SaveJobCardToExpenseModal
const modalDef = `
function LogTruckProblemModal({ isOpen, onClose, trucks = [], initialTruckNumber = "", onProblemLogged }) {
  if (!isOpen) return null;
  const [truckNumber, setTruckNumber] = p.useState(initialTruckNumber || trucks[0]?.truck_number || "");
  const [dateReported, setDateReported] = p.useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = p.useState("Engine");
  const [severity, setSeverity] = p.useState("Medium");
  const [description, setDescription] = p.useState("");
  const [saving, setSaving] = p.useState(false);

  p.useEffect(() => {
    if (initialTruckNumber) setTruckNumber(initialTruckNumber);
    else if (!truckNumber && trucks.length > 0) setTruckNumber(trucks[0]?.truck_number || "");
  }, [initialTruckNumber, trucks]);

  const handleSubmit = async (ev) => {
    ev && ev.preventDefault();
    if (!truckNumber) {
      w.error("Please select a truck number");
      return;
    }
    if (!description.trim()) {
      w.error("Please enter a problem description");
      return;
    }
    setSaving(true);
    try {
      await d.collection("maintenance_problems").create({
        truck_id: truckNumber,
        date_reported: dateReported,
        category: category,
        severity: severity,
        status: "Open",
        description: description.trim()
      }, { $autoCancel: false });
      w.success("Problem logged for " + truckNumber + "! Available in Workshop Job Cards.");
      setDescription("");
      if (onProblemLogged) onProblemLogged();
      onClose();
    } catch (err) {
      console.error("Failed to log truck problem:", err);
      w.error("Failed to save problem: " + (err.message || "Database error"));
    } finally {
      setSaving(false);
    }
  };

  return e.jsx(vt, {
    open: true,
    onOpenChange: onClose,
    children: e.jsxs(Nt, {
      className: "max-w-md w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 space-y-4 shadow-2xl",
      children: [
        e.jsxs(Kt, {
          children: [
            e.jsxs(zt, {
              className: "text-base font-bold flex items-center gap-2 text-amber-400",
              children: [e.jsx(Ge, { className: "w-5 h-5 text-amber-400" }), " Log Truck Problem / Defect"]
            }),
            e.jsx("p", {
              className: "text-xs text-slate-400 mt-1",
              children: "Log an issue reported by driver or staff. When this truck enters the workshop, this will guide the mechanic on the job card."
            })
          ]
        }),
        e.jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-3 pt-1 text-xs",
          children: [
            e.jsxs("div", {
              className: "space-y-1",
              children: [
                e.jsx("label", { className: "text-slate-300 font-bold block", children: "Truck Registration Number *" }),
                e.jsxs("select", {
                  value: truckNumber,
                  onChange: ev => setTruckNumber(ev.target.value),
                  className: "w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500",
                  children: [
                    e.jsx("option", { value: "", children: "-- Select Truck --" }),
                    trucks.map(tk => e.jsx("option", { key: tk.id, value: tk.truck_number || tk.id, children: (tk.truck_number || "") + " (" + (tk.truck_type || tk.model || "Truck") + ")" }))
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  className: "space-y-1",
                  children: [
                    e.jsx("label", { className: "text-slate-300 font-bold block", children: "Date Reported" }),
                    e.jsx($, {
                      type: "date",
                      value: dateReported,
                      onChange: ev => setDateReported(ev.target.value),
                      className: "h-9 bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1",
                  children: [
                    e.jsx("label", { className: "text-slate-300 font-bold block", children: "System / Category" }),
                    e.jsxs("select", {
                      value: category,
                      onChange: ev => setCategory(ev.target.value),
                      className: "w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-amber-500",
                      children: [
                        e.jsx("option", { value: "Engine", children: "⚙️ Engine / Power" }),
                        e.jsx("option", { value: "Brakes", children: "🛑 Brakes & Air Leak" }),
                        e.jsx("option", { value: "Suspension", children: "🔩 Kamani / Suspension" }),
                        e.jsx("option", { value: "Transmission", children: "🕹️ Clutch / Gearbox" }),
                        e.jsx("option", { value: "Electrical", children: "⚡ Electrical / Lights" }),
                        e.jsx("option", { value: "Tires", children: "🔘 Tyres & Wheel Rim" }),
                        e.jsx("option", { value: "Fuel", children: "⛽ Fuel System / Tank" }),
                        e.jsx("option", { value: "Cooling", children: "❄️ Radiator / Coolant" }),
                        e.jsx("option", { value: "Other", children: "📦 Body, Cabin & Other" })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "space-y-1.5",
              children: [
                e.jsx("label", { className: "text-slate-300 font-bold block", children: "Severity / Urgency" }),
                e.jsxs("div", {
                  className: "grid grid-cols-4 gap-2",
                  children: [
                    { value: "Low", label: "Low 🟢", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
                    { value: "Medium", label: "Medium 🟡", color: "border-sky-500/40 text-sky-400 bg-sky-500/10" },
                    { value: "High", label: "High 🟠", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
                    { value: "Critical", label: "Critical 🔴", color: "border-rose-500/40 text-rose-400 bg-rose-500/10" }
                  ].map(sev => e.jsx("button", {
                    key: sev.value,
                    type: "button",
                    onClick: () => setSeverity(sev.value),
                    className: "py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center " + (severity === sev.value ? (sev.color + " ring-2 ring-amber-400 shadow-md") : "border-slate-800 text-slate-400 hover:border-slate-700 bg-slate-950"),
                    children: sev.label
                  }))
                })
              ]
            }),
            e.jsxs("div", {
              className: "space-y-1",
              children: [
                e.jsx("label", { className: "text-slate-300 font-bold block", children: "Problem Description & Symptoms *" }),
                e.jsx(Os, {
                  rows: 3,
                  value: description,
                  onChange: ev => setDescription(ev.target.value),
                  placeholder: "e.g. Driver reports steering vibration above 50kmph, brake pressure dropping rapidly, engine oil leaking near oil filter...",
                  className: "w-full bg-slate-950 border-slate-700 rounded-xl text-white text-xs p-2.5 focus:outline-none focus:border-amber-500"
                })
              ]
            }),
            e.jsxs(Ut, {
              className: "flex justify-end gap-2 pt-3",
              children: [
                e.jsx(N, {
                  type: "button",
                  variant: "outline",
                  onClick: onClose,
                  className: "rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800",
                  children: "Cancel"
                }),
                e.jsx(N, {
                  type: "submit",
                  disabled: saving,
                  className: "rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50 gap-1.5",
                  children: saving ? "Logging Problem..." : "Save Problem Log"
                })
              ]
            })
          ]
        })
      ]
    })
  });
}
`;

for (const relPath of bundleFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  let code = fs.readFileSync(fullPath, 'utf8');

  // Insert LogTruckProblemModal definition before SaveJobCardToExpenseModal
  if (!code.includes('function LogTruckProblemModal')) {
    code = code.replace('function SaveJobCardToExpenseModal', modalDef + '\nfunction SaveJobCardToExpenseModal');
  }

  // State in gr: [logProblemOpen, setLogProblemOpen], [logProblemTruck, setLogProblemTruck]
  const grStateTarget = `[ue,yt]=p.useState({truck_id:"all",category:"all",dateFrom:"",dateTo:"",problemStatus:"all"}),`;
  const grStateReplace = `[logProblemOpen, setLogProblemOpen]=p.useState(!1),[logProblemTruck, setLogProblemTruck]=p.useState(""),[ue,yt]=p.useState({truck_id:"all",category:"all",dateFrom:"",dateTo:"",problemStatus:"all"}),`;
  if (code.includes(grStateTarget)) {
    code = code.replace(grStateTarget, grStateReplace);
  }

  // Add Log Truck Problem button in Job Cards tab header next to New Job Card
  const njcBtnTarget = `e.jsxs(N,{onClick:()=>{Ne(null),v(!0)},size:"sm",className:"rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground shadow-md",children:[e.jsx(gt,{className:"w-4 h-4 mr-1.5"})," New Job Card"]})]})]}),`;
  const njcBtnReplace = `e.jsxs(N,{type:"button",onClick:()=>{setLogProblemTruck("");setLogProblemOpen(!0)},size:"sm",variant:"outline",className:"rounded-xl h-9 text-xs font-bold border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 shadow-sm gap-1.5",children:[e.jsx(Ge,{className:"w-4 h-4 text-amber-400"})," Log Truck Problem"]}),e.jsxs(N,{onClick:()=>{Ne(null),v(!0)},size:"sm",className:"rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground shadow-md",children:[e.jsx(gt,{className:"w-4 h-4 mr-1.5"})," New Job Card"]})]})]}),`;
  if (code.includes(njcBtnTarget)) {
    code = code.replace(njcBtnTarget, njcBtnReplace);
  }

  // In TabsList: move problems right after job_cards with live open problems badge
  const jobCardTabTarget = `e.jsxs(pe,{value:"job_cards",className:"gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all shrink-0",children:[e.jsx(Je,{className:"w-4 h-4 text-amber-400"})," Workshop Job Cards",e.jsx(O,{variant:"secondary",className:"ml-1 opacity-80 bg-background/20 text-current",children:re.length})]}),`;
  const jobCardTabReplace = `e.jsxs(pe,{value:"job_cards",className:"gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all shrink-0",children:[e.jsx(Je,{className:"w-4 h-4 text-amber-400"})," Workshop Job Cards",e.jsx(O,{variant:"secondary",className:"ml-1 opacity-80 bg-background/20 text-current",children:re.length})]}),e.jsxs(pe,{value:"problems",className:"gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all shrink-0",children:[e.jsx(Ge,{className:"w-4 h-4 text-amber-400"})," Truck Problems Log",D.filter(t=>t.status==="Open").length>0&&e.jsx("span",{className:"ml-1 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black",children:D.filter(t=>t.status==="Open").length})]}),`;
  if (code.includes(jobCardTabTarget)) {
    code = code.replace(jobCardTabTarget, jobCardTabReplace);
  }

  // Remove the old problems tab trigger from pos 86028 so there are no duplicate triggers
  const oldProbTrigger = `e.jsxs(pe,{value:"problems",className:"gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all shrink-0",children:[e.jsx(Ge,{className:"w-4 h-4"})," Reported Problems"]}),`;
  if (code.includes(oldProbTrigger)) {
    code = code.replace(oldProbTrigger, '');
  }

  // In tr signature: pass problemsList and onOpenLogProblem
  const trSigTarget = `function tr({isOpen:C,onClose:h,jobCard:i,trucks:I=[],onSaved:G}){`;
  const trSigReplace = `function tr({isOpen:C,onClose:h,jobCard:i,trucks:I=[],onSaved:G,problemsList:_pl=[],onOpenLogProblem:_olp}){`;
  if (code.includes(trSigTarget)) {
    code = code.replace(trSigTarget, trSigReplace);
  }

  // Inside tr: banner of active problems right above complaints_list
  const complaintsTarget = `e.jsxs("div",{className:"space-y-1",children:[e.jsx(ie,{className:"text-xs font-bold text-muted-foreground",children:"Reported Complaints & Work Description"}),e.jsx(Os,{value:u.complaints_list,onChange:l=>S("complaints_list",l.target.value),placeholder:"e.g. Engine oil leakage check, brake pad squeaking, clutch plate adjustment...",className:"bg-background text-xs rounded-xl min-h-[60px]"})]}),`;
  const complaintsReplace = `(()=>{const _curTk=I.find(tk=>tk.truck_number===u.truck_number||tk.id===u.truck_number),_curTkNo=_curTk?.truck_number||u.truck_number,_curTkId=_curTk?.id,_openPr=_pl.filter(p=>(p.truck_id===_curTkNo||(_curTkId&&p.truck_id===_curTkId))&&p.status==="Open");return e.jsxs("div",{className:"space-y-1.5",children:[_openPr.length>0&&e.jsxs("div",{className:"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 mb-2",children:[e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2",children:[e.jsxs("span",{className:"text-xs font-bold text-amber-400 flex items-center gap-1.5",children:[e.jsx(Ge,{className:"w-4 h-4 text-amber-400"}),\`⚠️ \${_openPr.length} Active Problem(s) Logged for \${_curTkNo}:\`]}),e.jsxs("div",{className:"flex items-center gap-2",children:[_olp&&e.jsxs(N,{type:"button",variant:"outline",size:"sm",onClick:()=>_olp(_curTkNo),className:"h-7 text-[11px] px-2 rounded-lg border-amber-500/40 text-amber-300 hover:bg-amber-500/20",children:["+ Log Issue"]}),e.jsxs(N,{type:"button",size:"sm",onClick:()=>{const lines=_openPr.map((p,idx)=>\`• [\${p.severity} - \${p.category}] \${p.description}\`).join("\\n");const current=u.complaints_list?u.complaints_list.trim()+"\\n":"";S("complaints_list",current+lines);w.success(\`Copied \${_openPr.length} problem(s) to Mechanic Complaints!\`)},className:"h-7 text-[11px] px-2.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950",children:["📋 Copy to Guide Mechanic"]})]})]}),e.jsx("div",{className:"space-y-1.5 max-h-36 overflow-y-auto pr-1",children:_openPr.map(p=>e.jsxs("div",{key:p.id,className:"p-2 rounded-lg bg-background/80 border border-border/40 flex items-start gap-2 text-xs",children:[e.jsx(O,{variant:"outline",className:z("text-[9px] font-black uppercase px-1.5 py-0.2 shrink-0",p.severity==="Critical"?"bg-rose-500/20 text-rose-400 border-rose-500/30":p.severity==="High"?"bg-amber-500/20 text-amber-400 border-amber-500/30":"bg-sky-500/20 text-sky-400 border-sky-500/30"),children:p.severity}),e.jsxs("span",{className:"text-[10px] text-muted-foreground font-semibold shrink-0",children:["(",p.category,")"]}),e.jsx("span",{className:"flex-1 text-foreground font-medium",children:p.description})]}))})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(ie,{className:"text-xs font-bold text-muted-foreground",children:"Reported Complaints & Work Description"}),_olp&&e.jsx("button",{type:"button",onClick:()=>_olp(_curTkNo),className:"text-[11px] text-amber-400 hover:underline font-semibold",children:"+ Log New Problem for this Truck"})]}),e.jsx(Os,{value:u.complaints_list,onChange:l=>S("complaints_list",l.target.value),placeholder:"e.g. Engine oil leakage check, brake pad squeaking, clutch plate adjustment...",className:"bg-background text-xs rounded-xl min-h-[60px]"})]})})(),`;
  if (code.includes(complaintsTarget)) {
    code = code.replace(complaintsTarget, complaintsReplace);
  }

  // Inside problems tab content (pos 137364): add "+ Log New Problem" in filter bar and action column in table
  const probFilterTarget = `e.jsxs("div",{className:"p-4 border-b border-border bg-muted/20 flex flex-wrap gap-4 items-center",children:[e.jsxs(_e,{value:ue.truck_id,onValueChange:t=>yt(r=>({...r,truck_id:t})),children:[e.jsx(we,{className:"w-[180px] h-10 rounded-xl bg-background shadow-sm border-border",children:e.jsx(ke,{placeholder:"All Trucks"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Trucks"}),_s.map(t=>e.jsx(E,{value:t,children:t},t))]})]}),e.jsxs(_e,{value:ue.problemStatus,onValueChange:t=>yt(r=>({...r,problemStatus:t})),children:[e.jsx(we,{className:"w-[180px] h-10 rounded-xl bg-background shadow-sm border-border",children:e.jsx(ke,{placeholder:"Status"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Statuses"}),e.jsx(E,{value:"Open",children:"Open"}),e.jsx(E,{value:"Resolved",children:"Resolved"})]})]})]}),`;
  const probFilterReplace = `e.jsxs("div",{className:"p-4 border-b border-border bg-muted/20 flex flex-wrap gap-4 items-center justify-between",children:[e.jsxs("div",{className:"flex flex-wrap gap-4 items-center",children:[e.jsxs(_e,{value:ue.truck_id,onValueChange:t=>yt(r=>({...r,truck_id:t})),children:[e.jsx(we,{className:"w-[180px] h-10 rounded-xl bg-background shadow-sm border-border",children:e.jsx(ke,{placeholder:"All Trucks"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Trucks"}),_s.map(t=>e.jsx(E,{value:t,children:t},t))]})]}),e.jsxs(_e,{value:ue.problemStatus,onValueChange:t=>yt(r=>({...r,problemStatus:t})),children:[e.jsx(we,{className:"w-[180px] h-10 rounded-xl bg-background shadow-sm border-border",children:e.jsx(ke,{placeholder:"Status"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Statuses"}),e.jsx(E,{value:"Open",children:"Open"}),e.jsx(E,{value:"Resolved",children:"Resolved"})]})]})]}),e.jsxs(N,{onClick:()=>{setLogProblemTruck(ue.truck_id!=="all"?ue.truck_id:"");setLogProblemOpen(!0)},className:"h-10 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md ml-auto gap-1.5",children:[e.jsx(gt,{className:"w-4 h-4"})," Log New Problem"]})]}),`;
  if (code.includes(probFilterTarget)) {
    code = code.replace(probFilterTarget, probFilterReplace);
  }

  // In problems table: add Actions header column
  const probThTarget = `e.jsxs(U,{children:[e.jsx(j,{children:"Date Reported"}),e.jsx(j,{children:"Truck"}),e.jsx(j,{children:"Category"}),e.jsx(j,{children:"Severity"}),e.jsx(j,{children:"Status"}),e.jsx(j,{children:"Description"})]})`;
  const probThReplace = `e.jsxs(U,{children:[e.jsx(j,{children:"Date Reported"}),e.jsx(j,{children:"Truck"}),e.jsx(j,{children:"Category"}),e.jsx(j,{children:"Severity"}),e.jsx(j,{children:"Status"}),e.jsx(j,{children:"Description"}),e.jsx(j,{className:"text-right pr-4",children:"Actions"})]})`;
  if (code.includes(probThTarget)) {
    code = code.replace(probThTarget, probThReplace);
  }

  // In problems table row: add Action buttons
  const probRowTarget = `e.jsx(b,{className:"max-w-xs truncate text-muted-foreground",children:t.description})]},t.id)`;
  const probRowReplace = `e.jsx(b,{className:"max-w-xs truncate text-muted-foreground",children:t.description}),e.jsxs(b,{className:"text-right pr-4 space-x-1 whitespace-nowrap",children:[t.status==="Open"&&e.jsxs(N,{size:"sm",variant:"outline",onClick:()=>{Ne({job_card_number:\`JC-\${Date.now().toString().slice(-6)}\`,truck_number:t.truck_id,complaints_list:\`• [\${t.severity} - \${t.category}] \${t.description}\`,status:"Created",service_type:"Defect Repair",entry_date:new Date().toISOString().slice(0,10)});v(!0)},className:"h-7 px-2 text-[10px] font-bold border-amber-500/40 text-amber-400 hover:bg-amber-500/20 rounded-lg",title:"Create Workshop Job Card for this problem",children:["🛠️ Job Card"]}),e.jsx(N,{size:"sm",variant:"ghost",onClick:async()=>{try{await d.collection("maintenance_problems").update(t.id,{status:t.status==="Open"?"Resolved":"Open"},{$autoCancel:!1}),w.success(\`Problem marked as \${t.status==="Open"?"Resolved":"Open"}\`),le()}catch{w.error("Failed to update status")}},className:\`h-7 px-2 text-[10px] font-bold rounded-lg \${t.status==="Open"?"text-emerald-400 hover:bg-emerald-500/20":"text-amber-400 hover:bg-amber-500/20"}\`,children:t.status==="Open"?"✓ Resolve":"↺ Reopen"}),e.jsx(N,{size:"sm",variant:"ghost",onClick:async()=>{if(!confirm("Are you sure you want to delete this problem record?"))return;try{await d.collection("maintenance_problems").delete(t.id,{$autoCancel:!1}),w.success("Problem deleted"),le()}catch{w.error("Failed to delete problem")}},className:"h-7 w-7 p-0 text-rose-400 hover:bg-rose-500/20 rounded-lg",title:"Delete problem",children:e.jsx(Oe,{className:"w-3.5 h-3.5"})})]})]})]},t.id)`;
  if (code.includes(probRowTarget)) {
    code = code.replace(probRowTarget, probRowReplace);
  }

  // Pass problemsList and onOpenLogProblem to tr invocation, and mount LogTruckProblemModal
  const trCallTarget = `e.jsx(tr,{isOpen:W,onClose:()=>v(!1),jobCard:B,trucks:h,onSaved:le}),`;
  const trCallReplace = `e.jsx(tr,{isOpen:W,onClose:()=>v(!1),jobCard:B,trucks:h,onSaved:le,problemsList:D,onOpenLogProblem:(tk)=>{setLogProblemTruck(tk||"");setLogProblemOpen(!0)}}),e.jsx(LogTruckProblemModal,{isOpen:logProblemOpen,onClose:()=>setLogProblemOpen(!1),trucks:h,initialTruckNumber:logProblemTruck,onProblemLogged:le}),`;
  if (code.includes(trCallTarget)) {
    code = code.replace(trCallTarget, trCallReplace);
  }

  // Inside TruckDetailsModal under Issues tab: add "+ Log Problem" button next to "Manage Tickets"
  const truckModalIssuesTarget = `e.jsx(N,{size:"sm",variant:"outline",onClick:()=>{me(null),$e("problems"),yt(s=>({...s,truck_id:f.truck_number,problemStatus:"Open"}))},className:"rounded-lg text-xs h-8",children:"Manage Tickets"})`;
  const truckModalIssuesReplace = `e.jsx(N,{size:"sm",variant:"outline",onClick:()=>{me(null),$e("problems"),yt(s=>({...s,truck_id:f.truck_number,problemStatus:"Open"}))},className:"rounded-lg text-xs h-8",children:"Manage Tickets"}),e.jsx(N,{size:"sm",onClick:()=>{setLogProblemTruck(f.truck_number);setLogProblemOpen(!0)},className:"rounded-lg text-xs h-8 font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 ml-2",children:"+ Log Problem"})`;
  if (code.includes(truckModalIssuesTarget)) {
    code = code.replace(truckModalIssuesTarget, truckModalIssuesReplace);
  }

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log('✅ Patched', relPath);
}

console.log('All bundles patched for Problems Management!');
