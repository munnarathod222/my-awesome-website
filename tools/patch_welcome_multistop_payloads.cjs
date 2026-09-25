const fs = require('fs');
const path = require('path');

const indexFiles = [
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js'
];

indexFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`\nProcessing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add b_stops state variable if not present
  if (!content.includes('[b_stops,setStops]')) {
    const targetState = '[b_tripType,setTripType]=h.useState("one_way"),';
    const newState = '[b_stops,setStops]=h.useState([]),[b_tripType,setTripType]=h.useState("one_way"),';
    if (content.includes(targetState)) {
      content = content.replace(targetState, newState);
      console.log('✓ Added b_stops state');
    } else {
      console.warn('targetState for b_stops not found!');
    }
  } else {
    console.log('✓ b_stops state already present');
  }

  // 2. Remove "Super Admin Dynamic Pricing Active" badge
  const uglyBadge = 'e.jsx("span",{className:"text-[10px] text-amber-400 font-bold",children:"Super Admin Dynamic Pricing Active"})';
  if (content.includes(uglyBadge)) {
    content = content.replace(uglyBadge, 'null');
    console.log('✓ Removed "Super Admin Dynamic Pricing Active" badge');
  }

  // 3. Fix trailing 0 on Full Payload button
  const badTrailingZero = 'k.isFullPayload&&e.jsx("span",{className:"text-[9px] ml-1 bg-white/20 px-1.5 py-0.2 rounded-full",children:"Active"})';
  const fixedTrailingZero = 'k.isFullPayload?e.jsx("span",{className:"text-[9px] ml-1 bg-white/20 px-1.5 py-0.2 rounded-full",children:"Active"}):null';
  if (content.includes(badTrailingZero)) {
    content = content.replace(badTrailingZero, fixedTrailingZero);
    console.log('✓ Fixed trailing 0 on Full Payload button');
  }

  // 4. Implement dynamic activeVehicles with configurable capacity/payload
  if (!content.includes('const activeVehicles=')) {
    const targetP = 'const P=xn.find(b=>b.id===t||b.value===t)||xn[5],';
    const newActiveVehicles = 'const activeVehicles=h.useMemo(()=>xn.map(v=>{const cv=(b_rateSlabs?.vehicles||[]).find(x=>x.id===v.id||x.short===v.short||(x.name&&x.name.toLowerCase().includes(v.short.toLowerCase())));return cv?{...v,capacity:cv.capacity||v.capacity,maxMT:cv.maxMT||v.maxMT,name:cv.name||v.name}:v}),[b_rateSlabs]),P=activeVehicles.find(b=>b.id===t||b.value===t)||activeVehicles[5],';
    if (content.includes(targetP)) {
      content = content.replace(targetP, newActiveVehicles);
      console.log('✓ Injected dynamic activeVehicles calculation');
    }
  }

  // Update vehicle dropdown to map over activeVehicles instead of static xn
  const oldDropdownMap = 'xn.map(b=>e.jsx(re,{value:b.id,className:"py-2.5",children:e.jsxs("div",{className:"flex items-center justify-between gap-4 w-full",children:[e.jsx("span",{className:"font-bold text-foreground",children:b.name}),e.jsxs("span",{className:"text-xs text-emerald-400 font-mono font-semibold",children:["(",b.capacity,")"]})]})},b.id))';
  const newDropdownMap = 'activeVehicles.map(b=>e.jsx(re,{value:b.id,className:"py-2.5",children:e.jsxs("div",{className:"flex items-center justify-between gap-4 w-full",children:[e.jsx("span",{className:"font-bold text-foreground",children:b.name}),e.jsxs("span",{className:"text-xs text-emerald-400 font-mono font-semibold",children:["(",b.capacity,")"]})]})},b.id))';
  if (content.includes(oldDropdownMap)) {
    content = content.replace(oldDropdownMap, newDropdownMap);
    console.log('✓ Updated vehicle dropdown to use dynamic activeVehicles');
  }

  // 5. In Routing Information, inject Multi-Stop option & address boxes
  const dropMapsRegex = /(b_dropMaps,onChange:b=>setDropMaps\(b\.target\.value\),className:"bg-background\/80 text-xs h-9 border-dashed"\}\)[\s\r\n]*\]\}\),)/;
  
  if (!content.includes('Multi-Drop / Intermediate Stops Option') && dropMapsRegex.test(content)) {
    const multiStopJsx = `e.jsxs("div",{className:"md:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5",children:[
      e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5",children:[
        e.jsxs("div",{className:"flex items-center gap-2",children:[
          e.jsx("span",{className:"text-base",children:"🗺️"}),
          e.jsx("span",{className:"text-xs font-bold text-slate-200 uppercase tracking-wider",children:"Multi-Drop / Intermediate Stops Option"}),
          b_stops.length>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono",children:[b_stops.length," Intermediate ",b_stops.length===1?"Stop":"Stops"]})
        ]}),
        e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[
          e.jsx("span",{className:"text-[11px] text-slate-400 font-medium mr-1",children:"Select Stops:"}),
          [0,1,2,3,4].map(num=>e.jsx("button",{key:num,type:"button",onClick:()=>{if(num===0)setStops([]);else setStops(prev=>{const next=[...prev];while(next.length<num)next.push({address:"",maps_url:""});return next.slice(0,num);});},className:\`px-2.5 py-1 rounded-lg text-xs font-bold transition-all \${b_stops.length===num?"bg-amber-500 text-slate-950 font-black shadow-sm":"bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"}\`,children:num===0?"Direct (0)":\`\${num} \${num===1?"Stop":"Stops"}\`}))
        ]})
      ]}),
      b_stops.length===0?e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 py-1",children:[
        e.jsx("span",{children:"Direct point-to-point delivery. Need multi-point unloading or intermediate pickups?"}),
        e.jsxs("button",{type:"button",onClick:()=>setStops([{address:"",maps_url:""}]),className:"px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors self-start sm:self-auto",children:[e.jsx("span",{children:"➕"})," Add Intermediate Stop"]})
      ]}):e.jsxs("div",{className:"space-y-3 pt-1",children:[
        b_stops.map((stop,idx)=>e.jsxs("div",{key:idx,className:"p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2.5 transition-all hover:border-slate-700",children:[
          e.jsxs("div",{className:"flex items-center justify-between",children:[
            e.jsxs("div",{className:"flex items-center gap-2",children:[
              e.jsxs("span",{className:"px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30",children:["Stop #",idx+1]}),
              e.jsx("span",{className:"text-xs font-bold text-slate-200",children:\`Intermediate Drop / Pickup Point \${idx+1}\`})
            ]}),
            e.jsxs("button",{type:"button",onClick:()=>setStops(prev=>prev.filter((_,i)=>i!==idx)),className:"px-2 py-0.5 rounded text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1",title:"Remove this stop",children:[e.jsx("span",{children:"✕"})," Remove"]})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsxs("label",{className:"text-[11px] font-semibold text-slate-400 flex items-center gap-1",children:[e.jsx("span",{children:"🏢"}),\`Stop \${idx+1} Address / City / Pincode *\`]}),
              e.jsx(H,{placeholder:\`e.g. Pune Logistics Hub, Pincode 411001\`,value:stop.address||"",onChange:e=>{const val=e.target.value;setStops(prev=>prev.map((s,i)=>i===idx?{...s,address:val}:s));},className:"bg-background h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsxs("label",{className:"text-[11px] font-semibold text-slate-400 flex items-center gap-1",children:[e.jsx("span",{children:"📍"}),\`Stop \${idx+1} Google Maps Link (Optional)\`]}),
              e.jsx(H,{placeholder:\`https://maps.google.com/?q=...\`,value:stop.maps_url||"",onChange:e=>{const val=e.target.value;setStops(prev=>prev.map((s,i)=>i===idx?{...s,maps_url:val}:s));},className:"bg-background/80 text-xs h-9 border-dashed"})
            ]})
          ]})
        ]})),
        b_stops.length<5&&e.jsxs("button",{type:"button",onClick:()=>setStops(prev=>[...prev,{address:"",maps_url:""}]),className:"w-full py-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 text-amber-300 border border-dashed border-slate-700 hover:border-amber-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all",children:[e.jsx("span",{children:"➕"}),e.jsx("span",{children:\`Add Another Stop (Stop \${b_stops.length+1})\`})]})
      ]})
    ]}),`;

    content = content.replace(dropMapsRegex, match => match + '\n' + multiStopJsx);
    console.log('✓ Injected Multi-Stop option into Routing Information');
  }

  // 6. Cost Breakdown card: Add Multi-Stop line
  const targetCostCard = 'e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Payload Mode"}),';
  if (!content.includes('Intermediate Drops') && content.includes(targetCostCard)) {
    const multiStopCostLine = `b_stops.length>0&&e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Route Stops"}),e.jsxs("span",{className:"font-bold text-amber-300 font-mono",children:[b_stops.length," Intermediate Drops"]})]}),`;
    content = content.replace(targetCostCard, multiStopCostLine + targetCostCard);
    console.log('✓ Added Multi-Stop to Cost Breakdown card');
  }

  // 7. Submitted quote card: Add Stops summary
  const targetSubmittedSummary = 'e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Route:"}),e.jsxs("span",{className:"font-bold",children:[b_submitted.origin," ➡️ ",b_submitted.destination]})]}),';
  if (!content.includes('Multi-Drop Stops:') && content.includes(targetSubmittedSummary)) {
    const submittedStopsLine = `b_stops.length>0&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Multi-Drop Stops:"}),e.jsx("span",{className:"font-semibold text-amber-300",children:\`\${b_stops.length} Intermediate Drops\`})]}),`;
    content = content.replace(targetSubmittedSummary, targetSubmittedSummary + submittedStopsLine);
    console.log('✓ Added Multi-Drop line to submitted quote summary');
  }

  // 8. Quote submission payload ee: Include multi_stops and detailed notes
  const targetEeNotes = 'notes:`Online Inquiry from Welcome Page. Distance: ${w} KM. Applied Slab: ${k.appliedSlabLabel}.${b_cargoMaterial.trim()?` Material: ${b_cargoMaterial.trim()}.`:""}${b_pickupMaps.trim()?` Pickup Map: ${b_pickupMaps.trim()}`:""}${b_dropMaps.trim()?` Drop Map: ${b_dropMaps.trim()}`:""}`,';
  const newEeNotes = `multi_stops:b_stops,stops_count:b_stops.length,notes:\`Online Inquiry from Welcome Page. Distance: \${w} KM. Applied Slab: \${k.appliedSlabLabel}.\${b_stops.length>0?\` Stops (\${b_stops.length}): \${b_stops.map((s,idx)=>\`[Stop \${idx+1}: \${s.address||'N/A'}\${s.maps_url?\` (Map: \${s.maps_url})\`:''}]\`).join(', ')}.\`:''}\${b_cargoMaterial.trim()?\` Material: \${b_cargoMaterial.trim()}.\`:''}\${b_pickupMaps.trim()?\` Pickup Map: \${b_pickupMaps.trim()}\`:''}\${b_dropMaps.trim()?\` Drop Map: \${b_dropMaps.trim()}\`:''}\`,`;
  if (content.includes(targetEeNotes)) {
    content = content.replace(targetEeNotes, newEeNotes);
    console.log('✓ Updated ee payload with multi_stops data');
  }

  // 9. WhatsApp URL: Include stops in WhatsApp inquiry message
  const targetWaMsg = 'encodeURIComponent(`Hello Jai Bhavani Cargo, I have submitted Quote #${b_submitted.quote_number} for ${b_submitted.origin} to ${b_submitted.destination}.';
  const newWaMsg = 'encodeURIComponent(`Hello Jai Bhavani Cargo, I have submitted Quote #${b_submitted.quote_number} for ${b_submitted.origin}${b_stops&&b_stops.length>0?` (via ${b_stops.length} stops: ${b_stops.map((s,idx)=>s.address||`Stop ${idx+1}`).join(" ➡️ ")})`:""} to ${b_submitted.destination}.';
  if (content.includes(targetWaMsg)) {
    content = content.replace(targetWaMsg, newWaMsg);
    console.log('✓ Enhanced WhatsApp URL with intermediate stops');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Successfully updated ${file}`);
});

console.log('\nAll customer quotation bundles successfully patched!');
