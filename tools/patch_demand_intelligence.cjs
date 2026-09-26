const fs = require('fs');
const esbuild = require('esbuild');

const targetBundles = [
  'dist/assets/BiddingIntelligencePage-C7kP9xL2.js',
  'dist/apps/web/assets/BiddingIntelligencePage-C7kP9xL2.js',
  'apps/web/dist/assets/BiddingIntelligencePage-C7kP9xL2.js',
  'apps/api/dist/assets/BiddingIntelligencePage-C7kP9xL2.js',
  'dist/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'dist/apps/web/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'apps/web/dist/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'apps/api/dist/assets/BiddingIntelligencePage-DYnKd3nB.js'
];

const topCorridorsChildren = `[e.jsxs("div",{className:"flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0 text-[11px] font-bold text-slate-400",children:[e.jsx(Re,{className:"w-3 h-3 text-emerald-400"})," Top Corridors:"]}),...(routeDemand.length===0?[e.jsx("span",{className:"text-xs text-slate-500 italic px-2",children:"Log bids in the spreadsheet below to compute high-demand routes in real time."})]:routeDemand.slice(0,6).map((r,idx)=>{const isSel=M&&(r.route.toLowerCase().includes(M.toLowerCase())||r.dest.toLowerCase().includes(M.toLowerCase()));return e.jsxs("button",{key:r.route,type:"button",onClick:()=>V(isSel?"":(r.dest||r.route)),className:fe("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all shrink-0 cursor-pointer text-left",isSel?"bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm":idx===0?"bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 font-bold":idx===1?"bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 font-bold":"bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"),title:\`Corridor: \${r.route}\\nTotal Indents: \${r.total}\\nWin Rate: \${r.winRate}%\\nAvg Quoted: ₹\${r.avgRate.toLocaleString("en-IN")}\\nMost Demanded Truck: \${r.topTruck}\\nClick to filter table\`,children:[e.jsx("span",{className:"font-black text-[10px]",children:idx===0?"🔥 #1":idx===1?"⚡ #2":\`#\${idx+1}\`}),e.jsx("span",{className:"font-semibold truncate max-w-[150px]",children:r.route}),e.jsxs("span",{className:"text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/60 font-bold text-slate-200",children:[r.total," bids"]}),r.winRate>0&&e.jsxs("span",{className:"text-[10px] text-emerald-400 font-bold",children:[r.winRate,"% won"]}),r.avgRate>0&&e.jsxs("span",{className:"text-[10px] text-cyan-400",children:["₹",(r.avgRate/1e3).toFixed(0),"k"]})]});}))]`;

const truckDemandChildren = `[e.jsxs("div",{className:"flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0 text-[11px] font-bold text-slate-400",children:[e.jsx(Be,{className:"w-3 h-3 text-purple-400"})," Truck Demand:"]}),...(truckDemand.length===0?[e.jsx("span",{className:"text-xs text-slate-500 italic px-2",children:"Log bids below to compute truck fleet demand."})]:truckDemand.map((t,idx)=>{const isSel=M&&t.type.toLowerCase()===M.toLowerCase();return e.jsxs("button",{key:t.type,type:"button",onClick:()=>V(isSel?"":t.type),className:fe("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all shrink-0 cursor-pointer",isSel?"bg-purple-500/20 text-purple-300 border-purple-400 shadow-sm":idx===0?"bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 font-bold":"bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"),title:\`Truck: \${t.type}\\nDemand Share: \${t.sharePct}% of all indents\\nTotal Indents: \${t.total}\\nWin Rate: \${t.winRate}%\\nAvg Rate: ₹\${t.avgRate.toLocaleString("en-IN")}\\nClick to filter table\`,children:[e.jsx("span",{className:"font-bold text-slate-200",children:t.type}),e.jsxs("span",{className:"text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-700/50 text-purple-300 font-black",children:[t.sharePct,"% demand",idx===0?" 🔥":""]}),e.jsxs("span",{className:"text-[10px] text-slate-400",children:["(",t.total," bids)"]}),t.winRate>0&&e.jsxs("span",{className:"text-[10px] text-emerald-400 font-bold",children:[t.winRate,"% won"]})]});}))]`;

const fullRibbon = `showDemandRibbon&&e.jsxs("div",{className:"px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur space-y-2.5 select-none shrink-0 shadow-inner",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-amber-400 text-sm",children:"🔥"}),e.jsx("span",{className:"font-black text-slate-200 uppercase tracking-wider text-[11px]",children:"Live Market Demand Radar"}),e.jsxs("span",{className:"text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono",children:[routeDemand.length," Corridors Tracked"]}),e.jsxs("span",{className:"text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono",children:[truckDemand.length," Truck Models"]})]}),M?e.jsxs("button",{type:"button",onClick:()=>V(""),className:"text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1",children:[\`Filtered: "\${M}"\`,e.jsx("span",{className:"text-slate-500",children:"(Clear)"})]}):e.jsx("span",{className:"text-[10px] text-slate-500 italic",children:"Click any route or truck badge to filter table"})]}),e.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none",children:${topCorridorsChildren}}),e.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none",children:${truckDemandChildren}})]}),`;

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) return;
  console.log(`\n========================================`);
  console.log(`Processing ${bundlePath}...`);
  let content = fs.readFileSync(bundlePath, 'utf8');

  // 1. Inject routeDemand, truckDemand, corridorBench, showDemandRibbon right after cloneBid definition
  const cloneBidAnchor = 'Added duplicate load/bid for';
  const cloneBidEndIdx = content.indexOf('};', content.indexOf(cloneBidAnchor));

  if (cloneBidEndIdx !== -1 && !content.includes('const routeDemand=')) {
    const demandMemos = `const[showDemandRibbon,setShowDemandRibbon]=C.useState(()=>{try{const s=localStorage.getItem("jbc_show_demand_ribbon");return s!=="false"}catch(e){return!0}});const toggleDemandRibbon=()=>{setShowDemandRibbon(p=>{const n=!p;try{localStorage.setItem("jbc_show_demand_ribbon",String(n))}catch(e){}return n})};const routeDemand=C.useMemo(()=>{const map=new Map;const allBids=localBids||x;allBids.forEach(b=>{if(!b||b._isDraft||String(b.id).startsWith("draft_"))return;const orig=String(b.starting_point||b.origin||"").trim();const dest=String(b.ending_point||b.destination||"").trim();if(!dest)return;const k=\`\${orig} ➔ \${dest}\`;if(!map.has(k)){map.set(k,{route:k,orig,dest,total:0,won:0,lost:0,totalAmount:0,truckTypes:new Map()})}const r=map.get(k);const trips=Number(b.trips_count||1);r.total+=trips;const st=(b.status||b.result||"").trim();const amt=Number(b.bidding_amount||b.quoted_amount||0);if(st==="Won"){r.won+=trips}else if(st==="Lost"){r.lost+=trips}if(amt>0)r.totalAmount+=amt;const trk=(b.vehicle_type||b.truck_type||"32FTSXL").trim();r.truckTypes.set(trk,(r.truckTypes.get(trk)||0)+1)});return Array.from(map.values()).map(r=>{const winRate=(r.won+r.lost)>0?Math.round((r.won/(r.won+r.lost))*100):0;const avgRate=r.total>0&&r.totalAmount>0?Math.round(r.totalAmount/r.total):0;let topTruck="32FTSXL",maxTrk=0;r.truckTypes.forEach((cnt,trk)=>{if(cnt>maxTrk){maxTrk=cnt;topTruck=trk}});return{...r,winRate,avgRate,topTruck}}).sort((a,b)=>b.total-a.total)},[localBids,x]);const truckDemand=C.useMemo(()=>{const map=new Map;const allBids=localBids||x;let grandTotal=0;allBids.forEach(b=>{if(!b||b._isDraft||String(b.id).startsWith("draft_"))return;const trk=(b.vehicle_type||b.truck_type||"32FTSXL").trim();if(!map.has(trk)){map.set(trk,{type:trk,total:0,won:0,lost:0,totalAmount:0})}const t=map.get(trk);const trips=Number(b.trips_count||1);t.total+=trips;grandTotal+=trips;const st=(b.status||b.result||"").trim();const amt=Number(b.bidding_amount||b.quoted_amount||0);if(st==="Won")t.won+=trips;else if(st==="Lost")t.lost+=trips;if(amt>0)t.totalAmount+=amt});return Array.from(map.values()).map(t=>{const sharePct=grandTotal>0?Math.round((t.total/grandTotal)*100):0;const winRate=(t.won+t.lost)>0?Math.round((t.won/(t.won+t.lost))*100):0;const avgRate=t.total>0&&t.totalAmount>0?Math.round(t.totalAmount/t.total):0;return{...t,sharePct,winRate,avgRate}}).sort((a,b)=>b.total-a.total)},[localBids,x]);const corridorBench=C.useMemo(()=>{const map={};(localBids||x).forEach(b=>{if(!b||b._isDraft||String(b.id).startsWith("draft_"))return;const orig=String(b.starting_point||b.origin||"").trim().toLowerCase();const dest=String(b.ending_point||b.destination||"").trim().toLowerCase();const trk=String(b.vehicle_type||b.truck_type||"").trim().toLowerCase();if(!dest)return;const k=\`\${orig}__\${dest}__\${trk}\`;if(!map[k])map[k]={wonRates:[],lostRates:[]};const amt=Number(b.bidding_amount||b.quoted_amount||0);const lostAt=Number(b.bidding_lost_at||0);const st=(b.status||b.result||"").trim();if(st==="Won"&&amt>0)map[k].wonRates.push(amt);if(lostAt>0)map[k].lostRates.push(lostAt)});return map},[localBids,x]);`;
    content = content.substring(0, cloneBidEndIdx + 2) + demandMemos + content.substring(cloneBidEndIdx + 2);
    console.log(`✓ Injected routeDemand, truckDemand, corridorBench, showDemandRibbon`);
  }

  // 2. Add Demand Intel toggle button in toolbar next to Export CSV
  const oldCsvButton = 'Export CSV"]})';
  const newCsvButtonWithToggle = 'Export CSV"]}),e.jsxs(L,{size:"sm",variant:"outline",onClick:toggleDemandRibbon,className:fe("h-8 text-xs font-semibold rounded-xl border transition-all",showDemandRibbon?"bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20":"bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white"),title:"Toggle High-Demand Route & Truck Analytics Ribbon",children:[e.jsx(Re,{className:"w-3.5 h-3.5 mr-1 text-cyan-400"}),showDemandRibbon?"Hide Demand Intel":"Show Demand Intel"]})';

  if (content.includes(oldCsvButton) && !content.includes('Toggle High-Demand Route')) {
    content = content.replace(oldCsvButton, newCsvButtonWithToggle);
    console.log(`✓ Added Demand Intel toggle button to toolbar`);
  }

  // 3. Inject Demand Ribbon above the table wrapper
  const oldTableWrapper = 'e.jsx("div",{className:"flex-1 overflow-auto"';

  if (content.includes(oldTableWrapper) && !content.includes('Live Market Demand Radar')) {
    content = content.replace(oldTableWrapper, fullRibbon + oldTableWrapper);
    console.log(`✓ Injected Demand Ribbon above table wrapper`);
  }

  // 4. Enhance bidding_amount input cell with Smart Rate Suggestion & Price Ceiling Warning
  const oldBiddingCellWithFlush = 'e.jsx(ae,{className:"p-1",children:e.jsx("input",{type:"number",placeholder:"-",value:c.bidding_amount!==void 0&&c.bidding_amount!==null&&c.bidding_amount!==0?c.bidding_amount:"",onChange:N=>B(c.id,"bidding_amount",N.target.value),onBlur:()=>flushRow(c.id),className:"w-full bg-transparent px-2 py-1.5 text-cyan-400 font-bold border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs text-right tabular-nums"})})';
  const oldBiddingCellWithoutFlush = 'e.jsx(ae,{className:"p-1",children:e.jsx("input",{type:"number",placeholder:"-",value:c.bidding_amount!==void 0&&c.bidding_amount!==null&&c.bidding_amount!==0?c.bidding_amount:"",onChange:N=>B(c.id,"bidding_amount",N.target.value),className:"w-full bg-transparent px-2 py-1.5 text-cyan-400 font-bold border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs text-right tabular-nums"})})';

  const newBiddingCell = 'e.jsx(ae,{className:"p-1",children:(()=>{const laneKey=\`\${String(c.starting_point||c.origin||"").trim().toLowerCase()}__\${String(c.ending_point||c.destination||"").trim().toLowerCase()}__\${String(c.vehicle_type||c.truck_type||"").trim().toLowerCase()}\`;const bench=corridorBench?.[laneKey];const avgWonRate=bench?.wonRates.length>0?Math.round(bench.wonRates.reduce((a,b)=>a+b,0)/bench.wonRates.length):0;const minLostCeiling=bench?.lostRates.length>0?Math.min(...bench.lostRates):0;const isAboveCeiling=minLostCeiling>0&&Number(c.bidding_amount)>minLostCeiling;return e.jsxs("div",{className:"flex flex-col items-end",children:[e.jsx("input",{type:"number",placeholder:"-",value:c.bidding_amount!==void 0&&c.bidding_amount!==null&&c.bidding_amount!==0?c.bidding_amount:"",onChange:N=>B(c.id,"bidding_amount",N.target.value),onBlur:()=>flushRow(c.id),className:fe("w-full bg-transparent px-2 py-1.5 font-bold border border-transparent hover:border-slate-700 focus:bg-slate-900 rounded outline-none text-xs text-right tabular-nums",isAboveCeiling?"text-amber-400 focus:border-amber-500":"text-cyan-400 focus:border-cyan-500"),title:isAboveCeiling?\`Price Ceiling Warning: Quoted ₹\${Number(c.bidding_amount).toLocaleString("en-IN")} is higher than previous lost rate ₹\${minLostCeiling.toLocaleString("en-IN")}\`:undefined}),avgWonRate>0&&Number(c.bidding_amount)===0&&e.jsxs("button",{type:"button",onClick:()=>B(c.id,"bidding_amount",avgWonRate,!0),className:"text-[9px] text-emerald-400 hover:text-emerald-300 font-mono pr-1 truncate hover:underline cursor-pointer",title:\`Click to apply historical winning rate (₹\${avgWonRate.toLocaleString("en-IN")})\`,children:["✨ ₹",avgWonRate.toLocaleString("en-IN")]}),isAboveCeiling&&e.jsxs("span",{className:"text-[9px] text-amber-400 font-mono pr-1 block",title:\`Previous lost ceiling: ₹\${minLostCeiling.toLocaleString("en-IN")}\`,children:["⚠️ >₹",(minLostCeiling/1e3).toFixed(0),"k"]})]})})()})';

  if (content.includes(oldBiddingCellWithFlush)) {
    content = content.replace(oldBiddingCellWithFlush, newBiddingCell);
    console.log(`✓ Enhanced bidding_amount cell (with flush) with rate suggestion & ceiling warning`);
  } else if (content.includes(oldBiddingCellWithoutFlush)) {
    content = content.replace(oldBiddingCellWithoutFlush, newBiddingCell);
    console.log(`✓ Enhanced bidding_amount cell (without flush) with rate suggestion & ceiling warning`);
  }

  // 5. Validate with esbuild
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`🎉 100% VALID SYNTAX for ${bundlePath}`);
  } catch (err) {
    console.error(`❌ Syntax error in ${bundlePath}:`, err);
    process.exit(1);
  }
});

console.log('\nAll bundles patched with Live Demand Analytics & verified!');
