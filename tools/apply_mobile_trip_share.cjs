const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const targetChunkName = 'TripLogsPage-B1zVaUO1.js';
const targetDirs = [
  'dist/assets',
  'apps/web/dist/assets',
  'apps/api/dist/assets',
  'dist/apps/web/assets'
];

const targetPattern = `e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsx(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"h-8 px-2.5 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground",children:"Edit"}),e.jsx(S,{variant:"outline",size:"sm",onClick:()=>w(t),className:"h-8 px-2.5 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20",children:"Timeline"}),e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsx(S,{variant:"outline",size:"sm",className:"h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground border-border bg-muted/30",children:e.jsx(Ca,{className:"w-3.5 h-3.5"})})}),e.jsxs(us,{align:"end",className:"bg-card border-border shadow-2xl text-foreground z-50",children:[e.jsx(Be,{onClick:()=>window.open(\`/invoice-matching?tripId=\${t.trip_id||t.id}\`,"_blank"),className:"text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 cursor-pointer",children:"Invoice Matching"}),e.jsx(Be,{onClick:()=>Xe([t]),className:"text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10",children:"Delete Trip"})]})]})]})`;

const shareDropdown = `e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsxs(S,{variant:"outline",size:"sm",className:"h-8 rounded-xl text-xs font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center gap-1 px-2.5 shadow-sm active:scale-95 transition-all",title:"Share on WhatsApp",children:[e.jsx(ka,{className:"w-3.5 h-3.5 text-emerald-400"})," Share ▾"]})}),e.jsxs(us,{align:"end",className:"w-64 bg-card border-border shadow-2xl z-50 rounded-xl",children:[e.jsx(Be,{className:"font-bold text-xs py-2 text-sky-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"driver_dispatch"}),children:"📍 Send Location to Driver (GPS Navigation)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"booking_confirmation"}),children:"🚛 Booking Confirmation (Driver & Vehicle)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-blue-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"trip_status"}),children:"🚚 Live Trip Status & ETA Tracking"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-purple-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"pod_proof"}),children:"📑 POD (Proof of Delivery) Copy"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"payment_confirmation"}),children:"✅ Payment Received Confirmation"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-amber-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"quote"}),children:"🏷️ Share Freight Rate Quote"})]})]})`;

const replacement = `e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[${shareDropdown},e.jsx(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"h-8 px-2.5 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground",children:"Edit"}),e.jsx(S,{variant:"outline",size:"sm",onClick:()=>w(t),className:"h-8 px-2.5 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20",children:"Timeline"}),e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsx(S,{variant:"outline",size:"sm",className:"h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground border-border bg-muted/30",children:e.jsx(Ca,{className:"w-3.5 h-3.5"})})}),e.jsxs(us,{align:"end",className:"bg-card border-border shadow-2xl text-foreground z-50",children:[e.jsx(Be,{onClick:()=>window.open(\`/invoice-matching?tripId=\${t.trip_id||t.id}\`,"_blank"),className:"text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 cursor-pointer",children:"Invoice Matching"}),e.jsx(Be,{onClick:()=>Xe([t]),className:"text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10",children:"Delete Trip"})]})]})]})`;

targetDirs.forEach(dir => {
  const filePath = path.join(dir, targetChunkName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping (not found): ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Share on WhatsApp') && content.match(/Share on WhatsApp/g).length >= 2) {
    console.log(`Already updated: ${filePath}`);
    return;
  }
  if (!content.includes(targetPattern)) {
    console.error(`ERROR: Target pattern not found in ${filePath}`);
    return;
  }
  const updated = content.replace(targetPattern, replacement);
  try {
    esbuild.transformSync(updated, { loader: 'js' });
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Successfully updated & validated: ${filePath} (${updated.length} bytes)`);
  } catch (err) {
    console.error(`❌ Validation failed for ${filePath}:`, err);
  }
});

console.log('Mobile share update complete!');
