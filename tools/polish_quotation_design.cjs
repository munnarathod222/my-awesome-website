const fs = require('fs');
const esbuild = require('esbuild');

const files = [
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // 1. Locate the block between custom vehicle requirement and Cargo Specifications
  const startPattern = 'b_customVehicle,onChange:b=>setCustomVehicle(b.target.value),className:"bg-background"})}),';
  const sIdx = content.indexOf(startPattern);
  const cargoIdx = content.indexOf('Cargo Specifications');
  let eIdx = -1;
  if (cargoIdx !== -1) {
    const spaceIdx = content.lastIndexOf('space-y-4",children:[', cargoIdx);
    if (spaceIdx !== -1) {
      eIdx = content.lastIndexOf('e.jsxs("div"', spaceIdx);
    }
  }

  if (sIdx === -1 || eIdx === -1) {
    console.error('Could not locate markers in', file, { sIdx, eIdx, cargoIdx });
    return;
  }

  // Design our luxury, world-class replacement JSX:
  const polishedCustomizationAndRoutingJsx = `
  /* ── 1. LUXURY TRIP & ENGAGEMENT PREFERENCES CARD ── */
  e.jsxs("div",{className:"p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 shadow-xl space-y-4 mt-3",children:[
    e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-800/80 pb-3",children:[
      e.jsxs("div",{className:"flex items-center gap-2",children:[
        e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"}),
        e.jsx("span",{className:"text-xs font-bold text-slate-100 tracking-wider uppercase",children:"Trip Direction & Engagement Terms"})
      ]}),
      e.jsx("span",{className:"text-[11px] text-slate-400 font-medium",children:"Dynamic Multipliers & Volume Slabs"})
    ]}),

    /* Trip Directionality */
    e.jsxs("div",{className:"space-y-1.5",children:[
      e.jsx("label",{className:"text-[11px] font-bold uppercase tracking-wider text-slate-400",children:"Trip Directionality:"}),
      e.jsxs("div",{className:"bg-slate-950 p-1.5 rounded-xl border border-slate-800/90 grid grid-cols-2 gap-2",children:[
        e.jsxs("button",{type:"button",onClick:()=>setTripType("one_way"),className:\`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all \${b_tripType==="one_way"?"bg-slate-800 text-white shadow-md border border-slate-700 font-black":"text-slate-400 hover:text-white hover:bg-slate-900/50"}\`,children:[
          e.jsx("span",{children:"➡️"}),
          " One-Way Trip (1.0x)"
        ]}),
        e.jsxs("button",{type:"button",onClick:()=>setTripType("round_trip"),className:\`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all \${b_tripType==="round_trip"?"bg-amber-500/15 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-black":"text-slate-400 hover:text-white hover:bg-slate-900/50"}\`,children:[
          e.jsx("span",{children:"🔄"}),
          " Round Trip ",
          e.jsx("span",{className:"ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black",children:"Save 15% Return"})
        ]})
      ]})
    ]}),

    /* Contract Tenures */
    e.jsxs("div",{className:"space-y-1.5",children:[
      e.jsx("label",{className:"text-[11px] font-bold uppercase tracking-wider text-slate-400",children:"Engagement Model / Contract Tenure:"}),
      e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-5 gap-2",children:[
        {id:"spot",name:"Spot / Adhoc",sub:"Standard Rate",icon:"⚡"},
        {id:"contract_1m",name:"1 Month",sub:"-5% Volume",icon:"📄"},
        {id:"contract_3m",name:"3 Months",sub:"-8% Quarterly",icon:"📊"},
        {id:"contract_6m",name:"6 Months",sub:"-12% Semi-Yr",icon:"💼"},
        {id:"contract_1y",name:"1 Year",sub:"-15% Annual",icon:"🏆"}
      ].map(item=>e.jsxs("button",{key:item.id,type:"button",onClick:()=>setContractTenure(item.id),className:\`p-2 rounded-xl text-left transition-all \${b_contractTenure===item.id?"bg-slate-800 text-white border border-amber-500/60 shadow-md shadow-amber-500/10":"bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"}\`,children:[
        e.jsxs("div",{className:"flex items-center justify-between text-xs font-bold text-white",children:[
          e.jsx("span",{children:item.name}),
          e.jsx("span",{className:"text-xs",children:item.icon})
        ]}),
        e.jsx("div",{className:\`text-[10px] font-semibold mt-0.5 \${b_contractTenure===item.id?"text-amber-300":"text-slate-500"}\`,children:item.sub})
      ]}))})
    ]}),

    /* Weight & Payload Utilization */
    e.jsxs("div",{className:"space-y-1.5",children:[
      e.jsx("label",{className:"text-[11px] font-bold uppercase tracking-wider text-slate-400",children:"Cargo Weight & Payload Utilization:"}),
      e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5",children:[
        e.jsxs("button",{type:"button",onClick:()=>setPayloadType("standard"),className:\`p-3 rounded-xl flex items-center justify-between text-left transition-all \${!k.isFullPayload?"bg-slate-800/90 border border-emerald-500/50 shadow-md shadow-emerald-500/10 text-white":"bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200"}\`,children:[
          e.jsxs("div",{className:"flex items-center gap-2.5",children:[
            e.jsx("span",{className:"text-lg",children:"⚖️"}),
            e.jsxs("div",{children:[
              e.jsx("div",{className:"text-xs font-bold text-white",children:"Standard Rated Payload (1.0x)"}),
              e.jsx("div",{className:"text-[10px] text-slate-400",children:"Standard loading within certified truck MT"})
            ]})
          ]}),
          !k.isFullPayload?e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"}):null
        ]}),
        e.jsxs("button",{type:"button",onClick:()=>setPayloadType("full_payload"),className:\`p-3 rounded-xl flex items-center justify-between text-left transition-all \${k.isFullPayload?"bg-slate-800/90 border border-amber-500/50 shadow-md shadow-amber-500/10 text-white":"bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200"}\`,children:[
          e.jsxs("div",{className:"flex items-center gap-2.5",children:[
            e.jsx("span",{className:"text-lg",children:"🏋️"}),
            e.jsxs("div",{children:[
              e.jsx("div",{className:"text-xs font-bold text-white",children:"Full Payload / Max Capacity (+10%)"}),
              e.jsx("div",{className:"text-[10px] text-amber-400/90",children:"Heavy gross weight & axle surcharge"})
            ]})
          ]}),
          k.isFullPayload?e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"}):null
        ]})
      ]})
    ]})
  ]})
        ]}),
        e.jsxs("div",{className:"space-y-4",children:[

  /* ── 2. ELEGANT ROUTING & WAYPOINT INFORMATION CARD ── */
    e.jsxs("div",{className:"flex items-center justify-between border-b border-border pb-2.5",children:[
      e.jsxs("div",{className:"flex items-center gap-2 text-base sm:text-lg font-bold text-foreground",children:[
        e.jsx(ht,{className:"w-5 h-5 text-secondary"}),
        " Routing & Waypoint Information"
      ]}),
      b_stops.length>0&&e.jsxs("span",{className:"px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30",children:[b_stops.length," Intermediate ",b_stops.length===1?"Drop":"Drops"]})
    ]}),

    e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[
      /* Origin Card */
      e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 shadow-sm",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsxs(z,{className:"text-xs font-bold text-slate-200 flex items-center gap-1.5",children:[
            e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"}),
            " Origin City / Pincode *"
          ]}),
          e.jsx("span",{className:"text-[10px] text-emerald-400 font-mono font-semibold uppercase",children:"Pickup Hub"})
        ]}),
        e.jsx(H,{placeholder:"e.g. Mumbai, Maharashtra (400001)",value:r,onChange:b=>{n(b.target.value);setSubmitErr("");},className:"bg-slate-900 border-slate-700 h-10 text-xs font-medium"}),
        e.jsx(H,{placeholder:"📍 Pickup Google Maps Pin Link (Optional)",value:b_pickupMaps,onChange:b=>setPickupMaps(b.target.value),className:"bg-slate-900/60 border-slate-800 text-[11px] h-8 text-slate-300 border-dashed"})
      ]}),

      /* Destination Card */
      e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 shadow-sm",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsxs(z,{className:"text-xs font-bold text-slate-200 flex items-center gap-1.5",children:[
            e.jsx("span",{className:"w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"}),
            " Destination City / Pincode *"
          ]}),
          e.jsx("span",{className:"text-[10px] text-rose-400 font-mono font-semibold uppercase",children:"Final Drop"})
        ]}),
        e.jsx(H,{placeholder:"e.g. Delhi NCR (110001)",value:i,onChange:b=>{o(b.target.value);setSubmitErr("");},className:"bg-slate-900 border-slate-700 h-10 text-xs font-medium"}),
        e.jsx(H,{placeholder:"📍 Drop Google Maps Pin Link (Optional)",value:b_dropMaps,onChange:b=>setDropMaps(b.target.value),className:"bg-slate-900/60 border-slate-800 text-[11px] h-8 text-slate-300 border-dashed"})
      ]}),

      /* Multi-Drop Container */
      e.jsxs("div",{className:"md:col-span-2 p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800 shadow-xl space-y-4",children:[
        e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3",children:[
          e.jsxs("div",{children:[
            e.jsxs("div",{className:"flex items-center gap-2",children:[
              e.jsx("span",{className:"text-base",children:"🗺️"}),
              e.jsx("span",{className:"text-xs font-bold text-slate-100 uppercase tracking-wider",children:"Multi-Point Route & Intermediate Drops"})
            ]}),
            e.jsx("p",{className:"text-[11px] text-slate-400 mt-0.5",children:"Direct Point-to-Point delivery or multi-point transit drops"})
          ]}),
          e.jsxs("div",{className:"flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto",children:[
            e.jsx("span",{className:"text-[11px] text-slate-400 font-semibold px-2",children:"Waypoints:"}),
            [0,1,2,3,4].map(num=>e.jsx("button",{key:num,type:"button",onClick:()=>{if(num===0)setStops([]);else setStops(prev=>{const next=[...prev];while(next.length<num)next.push({address:"",maps_url:""});return next.slice(0,num);});},className:\`px-3 py-1 rounded-lg text-xs font-bold transition-all \${b_stops.length===num?"bg-amber-500 text-slate-950 shadow-sm font-black":"text-slate-400 hover:text-white"}\`,children:num===0?"Direct (0)":\`\${num}\`}))
          ]})
        ]}),

        b_stops.length===0?e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400",children:[
          e.jsxs("div",{className:"flex items-center gap-2",children:[
            e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400"}),
            e.jsx("span",{children:"Direct point-to-point transit route. Need intermediate warehouse drops or pickup halts?"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>setStops([{address:"",maps_url:""}]),className:"px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto",children:[
            e.jsx("span",{children:"➕"}),
            " Add Intermediate Stop"
          ]})
        ]}):e.jsxs("div",{className:"space-y-3 pt-1",children:[
          b_stops.map((stop,idx)=>e.jsxs("div",{key:idx,className:"p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-md space-y-3 relative hover:border-slate-700 transition-all",children:[
            e.jsxs("div",{className:"flex items-center justify-between",children:[
              e.jsxs("div",{className:"flex items-center gap-2",children:[
                e.jsxs("span",{className:"px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30",children:["Waypoint #",idx+1]}),
                e.jsx("span",{className:"text-xs font-bold text-slate-200",children:\`Intermediate Unloading / Transit Point \${idx+1}\`})
              ]}),
              e.jsxs("button",{type:"button",onClick:()=>setStops(prev=>prev.filter((_,i)=>i!==idx)),className:"text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-rose-500/10",children:[
                e.jsx("span",{children:"✕"}),
                " Remove"
              ]})
            ]}),
            e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[
              e.jsxs("div",{className:"space-y-1",children:[
                e.jsxs("label",{className:"text-[11px] font-semibold text-slate-400 flex items-center gap-1",children:[
                  e.jsx("span",{children:"🏢"}),
                  \`Stop #\${idx+1} Address / Hub / Pincode *\`
                ]}),
                e.jsx(H,{placeholder:"e.g. Pune Logistics Hub, Pincode 411001",value:stop.address||"",onChange:e=>{const val=e.target.value;setStops(prev=>prev.map((s,i)=>i===idx?{...s,address:val}:s));},className:"bg-slate-900 border-slate-700 h-9 text-xs"})
              ]}),
              e.jsxs("div",{className:"space-y-1",children:[
                e.jsxs("label",{className:"text-[11px] font-semibold text-slate-400 flex items-center gap-1",children:[
                  e.jsx("span",{children:"📍"}),
                  \`Stop #\${idx+1} Google Maps Pin Link (Optional)\`
                ]}),
                e.jsx(H,{placeholder:"https://maps.google.com/?q=...",value:stop.maps_url||"",onChange:e=>{const val=e.target.value;setStops(prev=>prev.map((s,i)=>i===idx?{...s,maps_url:val}:s));},className:"bg-slate-900/60 border-slate-800 text-[11px] h-9 border-dashed"})
              ]})
            ]})
          ]})),
          b_stops.length<5&&e.jsxs("button",{type:"button",onClick:()=>setStops(prev=>[...prev,{address:"",maps_url:""}]),className:"w-full py-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-amber-300 border border-dashed border-slate-800 hover:border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all",children:[
            e.jsx("span",{children:"➕"}),
            e.jsx("span",{children:\`Add Another Waypoint (Stop \${b_stops.length+1})\`})
          ]})
        ]})
      ]}),

      /* Total Route Distance in KM */
      e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 md:col-span-2 shadow-sm",children:[
        e.jsxs("div",{className:"flex items-center justify-between",children:[
          e.jsxs(z,{className:"text-xs font-bold text-slate-200 flex items-center gap-1.5",children:[
            e.jsx("span",{className:"text-base",children:"📏"}),
            " Total Route Distance in KM"
          ]}),
          e.jsx("span",{className:"text-[11px] text-slate-500",children:"Auto-calculated or enter exact"})
        ]}),
        e.jsxs("div",{className:"relative flex items-center",children:[
          e.jsx(H,{type:"number",min:"1",placeholder:"e.g. 500",value:l,onChange:b=>{c(b.target.value);setSubmitErr("");},className:"bg-slate-900 border-slate-700 h-11 text-sm font-bold font-mono pr-12"}),
          e.jsx("span",{className:"absolute right-3.5 text-xs font-black text-slate-400 font-mono",children:"KM"})
        ]})
      ]})
    ]})
  ]}),
        `;

  // Splice replacement in place
  content = content.slice(0, sIdx + startPattern.length) + polishedCustomizationAndRoutingJsx + content.slice(eIdx);

  // 2. Also enhance the Right-Hand Cost Breakdown Card & Estimate Notice
  const oldNoticeTarget = 'starting with ₹10,000 base for 32 FT (<100km) and tiered distance slabs.';
  const newNoticeTarget = 'starting with base slab rate for <100km and tiered distance slabs.';
  if (content.includes(oldNoticeTarget)) {
    content = content.replace(oldNoticeTarget, newNoticeTarget);
  }

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 100% SUCCESS: Polished UI design injected and validated for ${file}`);
  } catch (err) {
    console.error(`Syntax error when transforming ${file}:`, err.message);
  }
});

console.log('\nQuotation UI overhaul completed!');
