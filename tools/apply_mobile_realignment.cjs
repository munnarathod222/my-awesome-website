const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('=== Applying Mobile View Realignment to TripLogsPage Bundle ===\n');

const bundlePath = 'dist/assets/TripLogsPage-B1zVaUO1.js';
let code = fs.readFileSync(bundlePath, 'utf8');

const oldFooterFull = fs.readFileSync('tools/exact_old_footer.js', 'utf8');
const exactOldTarget = oldFooterFull.substring(0, oldFooterFull.indexOf(',t.id))') + ',t.id))'.length);

if (!code.includes(exactOldTarget)) {
  console.error('ERROR: exactOldTarget not found in bundle!');
  process.exit(1);
}

const cleanNewFooter = [
  '(Number(t.loading_charges)>0||Number(t.unloading_charges)>0||Number(t.broker_commission)>0||Number(t.munsiyana)>0)&&e.jsxs("div",{className:"flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono",children:[Number(t.loading_charges)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded border text-[10px] "+(t.loading_paid_by==="company"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"),children:["Load: ₹",Number(t.loading_charges).toLocaleString("en-IN"),t.loading_paid_by==="company"?" (Co)":" (Cl)"]}),Number(t.unloading_charges)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded border text-[10px] "+(t.unloading_paid_by==="company"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"),children:["Unload: ₹",Number(t.unloading_charges).toLocaleString("en-IN"),t.unloading_paid_by==="company"?" (Co)":" (Cl)"]}),Number(t.broker_commission)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20",children:["Broker: ₹",Number(t.broker_commission).toLocaleString("en-IN")]}),Number(t.munsiyana)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20",children:["Mun: -₹",Number(t.munsiyana).toLocaleString("en-IN")]})]}),',
  'e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-xl bg-slate-900/70 border border-indigo-500/25 text-xs shadow-sm",children:[(()=>{const dc=(t.lr_file_url||t.lr_file||t.lr_number?1:0)+(t.invoice_file_url||t.invoice_file||t.invoice_number?1:0)+(t.eway_bill_file_url||t.eway_bill_file||t.eway_bill_number?1:0);return e.jsxs("button",{type:"button",onClick:()=>_setDocsTrip(t),className:"inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 active:scale-95 transition-transform",children:[e.jsx("span",{children:"📎"}),e.jsxs("span",{children:[dc,"/3 Docs Attached"]}),e.jsx("span",{className:"text-[10px] text-slate-400",children:"→"})]})})(),t.delivery_deadline?(()=>{const dl=new Date(t.delivery_deadline),isPast=dl<new Date()&&t.trip_status!=="Delivered"&&t.trip_status!=="Completed";return e.jsxs("span",{onClick:()=>_setDocsTrip(t),className:"cursor-pointer px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 shadow-sm "+(isPast?"bg-rose-500/20 text-rose-400 border-rose-500/30":"bg-slate-800 text-slate-300 border-slate-700"),children:[e.jsx("span",{children:"⏱️"}),e.jsx("span",{children:isPast?"Overdue SLA":dl.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})})]})})():null]}),',
  'e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border/60",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground",children:"Revenue:"}),e.jsx("span",{className:"text-sm font-black text-emerald-400 tabular-nums font-mono",children:ae(t.revenue)})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground",children:"Payment:"}),e.jsxs(pe,{value:t.client_payment_status||"pending",onValueChange:async i=>{const l=i==="blank"?"":i;if(l!==t.client_payment_status)try{await D.collection("trip_logs").update(t.id,{client_payment_status:l},{$autoCancel:!1}),await yt(D,t.id,l,t),$.success("Payment updated: "+(l||"Unset")),ie()}catch{$.error("Failed to update payment status")}},children:[e.jsx(xe,{className:V("select-trigger-badge h-6 border px-2 py-0 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition-all focus:ring-0 focus:ring-offset-0 [&>svg]:ml-1 [&>svg]:h-2.5 [&>svg]:w-2.5 shrink-0 w-auto whitespace-nowrap",t.client_payment_status==="received"?"bg-emerald-500/15 text-emerald-400 border-emerald-500/30":t.client_payment_status==="delayed"?"bg-rose-500/15 text-rose-400 border-rose-500/30":t.client_payment_status==="pending"?"bg-amber-500/15 text-amber-400 border-amber-500/30":"bg-muted text-muted-foreground border-border/50"),children:e.jsx(he,{children:t.client_payment_status==="received"?"Paid":t.client_payment_status||"Pending"})}),e.jsxs(fe,{align:"end",className:"bg-card border-border shadow-2xl z-50 text-foreground",children:[e.jsx(F,{value:"pending",className:"font-semibold text-xs py-1.5",children:"Pending"}),e.jsx(F,{value:"received",className:"font-semibold text-xs py-1.5",children:"Paid"}),e.jsx(F,{value:"delayed",className:"font-semibold text-xs py-1.5",children:"Delayed"})]})]})]})]}),',
  'e.jsxs("div",{className:"pt-1.5 border-t border-border/40 flex flex-col gap-2",children:[',
  'e.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[',
  'e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsxs(S,{variant:"outline",size:"sm",className:"h-8.5 rounded-xl text-xs font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"Share on WhatsApp",children:[e.jsx(ka,{className:"w-3.5 h-3.5 text-emerald-400 shrink-0"})," Share ▾"]})}),e.jsxs(us,{align:"start",className:"w-64 bg-card border-border shadow-2xl z-50 rounded-xl",children:[e.jsx(Be,{className:"font-bold text-xs py-2 text-sky-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"driver_dispatch"}),children:"📍 Send Location to Driver (GPS Navigation)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"booking_confirmation"}),children:"🚛 Booking Confirmation (Driver & Vehicle)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-blue-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"trip_status"}),children:"🚚 Live Trip Status & ETA Tracking"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-purple-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"pod_proof"}),children:"📑 POD (Proof of Delivery) Copy"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"payment_confirmation"}),children:"✅ Payment Received Confirmation"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-amber-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"quote"}),children:"🏷️ Share Freight Rate Quote"})]})]}),',
  'e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>_setReassignTrip(t),className:"h-8.5 rounded-xl text-xs font-bold text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"Emergency Driver / Vehicle Reassignment",children:[e.jsx("span",{className:"text-xs",children:"🔄"})," Swap"]}),',
  'e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>_setValidationTrip(t),className:"h-8.5 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"3-Gate Completion & Settlement Audit",children:[e.jsx("span",{className:"text-xs",children:"📋"})," Settle"]})',
  ']}),',
  'e.jsxs("div",{className:"flex items-center gap-1.5 w-full",children:[',
  'e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"flex-1 h-8 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center gap-1",children:[e.jsx(Rt,{className:"w-3 h-3 text-muted-foreground"})," Edit"]}),',
  'e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>w(t),className:"flex-1 h-8 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center gap-1",children:[e.jsx(vt,{className:"w-3 h-3 text-sky-400"})," Timeline"]}),',
  'e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsx(S,{variant:"outline",size:"sm",className:"h-8 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground border-border bg-muted/30 flex items-center justify-center shrink-0",title:"More Options",children:e.jsx(Ca,{className:"w-3.5 h-3.5"})})}),e.jsxs(us,{align:"end",className:"bg-card border-border shadow-2xl text-foreground z-50",children:[e.jsx(Be,{onClick:()=>window.open("/invoice-matching?tripId="+(t.trip_id||t.id),"_blank"),className:"text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 cursor-pointer",children:"Invoice Matching"}),e.jsx(Be,{onClick:()=>Xe([t]),className:"text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10",children:"Delete Trip"})]})]})',
  ']})',
  ']})',
  ']},t.id))'
].join('');

const patched = code.replace(exactOldTarget, cleanNewFooter);

try {
  esbuild.transformSync(patched, { loader: 'js' });
  console.log('🎉 ESBUILD SYNTAX VALIDATION PASSED!');
  console.log('Old bundle length:', code.length, '-> New bundle length:', patched.length);
} catch (e) {
  console.error('❌ SYNTAX ERROR:', e.message);
  process.exit(1);
}

const targetDirs = [
  'dist/assets',
  'apps/web/dist/assets',
  'apps/api/dist/assets',
  'dist/apps/web/assets'
];

targetDirs.forEach(dir => {
  const p = path.resolve(dir, 'TripLogsPage-B1zVaUO1.js');
  fs.writeFileSync(p, patched, 'utf8');
  console.log(`✓ Synced to: ${p}`);
});

console.log('\n🚀 ALL CHUNKS RE-ALIGNED AND SYNCED WITH 0 ERRORS!');
