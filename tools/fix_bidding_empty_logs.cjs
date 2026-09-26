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

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) return;
  console.log(`\nProcessing ${bundlePath}...`);
  let content = fs.readFileSync(bundlePath, 'utf8');

  // 1. Replace the rs, Ne, Ye block
  // Start from rs=async() until ns=async()
  const rsStart = content.indexOf('rs=async()=>');
  const nsStart = content.indexOf('ns=async()=>', rsStart);

  if (rsStart !== -1 && nsStart !== -1) {
    const newStorageCode = `rs=async()=>{
  const isDraftOrEmptyBid=b=>{
    if(!b)return!0;
    const start=String(b.starting_point||b.origin||'').trim();
    const end=String(b.ending_point||b.destination||'').trim();
    const client=String(b.underlying_client||b.end_client||b.shipper||'').trim();
    const amount=Number(b.bidding_amount||b.quoted_amount||0);
    const lostAt=Number(b.bidding_lost_at||0);
    if(!end&&!client&&amount===0&&lostAt===0&&(start==='HYD_Medchal GW'||!start)){
      return!0;
    }
    return!1;
  };

  let list=[];
  let delSet=new Set();
  try{
    const d=localStorage.getItem("jbc_deleted_bid_ids");
    if(d){const arr=JSON.parse(d);if(Array.isArray(arr))delSet=new Set(arr.map(String));}
  }catch(e){}

  try{
    const res=await fetch("/api/bidding/bids");
    if(res.ok){
      const data=await res.json();
      if(data&&Array.isArray(data.bids)){
        list=data.bids.filter(b=>b&&b.id&&!delSet.has(String(b.id))&&!isDraftOrEmptyBid(b));
      }
    }
  }catch(e){
    console.warn("Bids server API notice:",e);
  }

  if(list.length===0){
    try{
      const pbBids=(await he.collection("bids").getFullList({sort:"-created",$autoCancel:!1}))
        .map(a=>({
          ...a,
          bidding_amount:Number(a.bidding_amount||a.quoted_amount||a.quoted_rate||0),
          quoted_amount:Number(a.quoted_amount||a.bidding_amount||a.quoted_rate||0),
          quoted_rate:Number(a.quoted_rate||a.quoted_amount||a.bidding_amount||0),
          actual_winning_rate:Number(a.actual_winning_rate||0),
          bidding_lost_at:Number(a.bidding_lost_at||0),
          distance_km:Number(a.distance_km||a.distance||0),
          payload_tons:Number(a.payload_tons||a.payload||a.weight||7),
          payload:Number(a.payload_tons||a.payload||a.weight||7),
          weight:Number(a.payload_tons||a.payload||a.weight||7),
          underlying_client:a.underlying_client||a.end_client||a.shipper||"",
          end_client:a.underlying_client||a.end_client||a.shipper||"",
          shipper:a.underlying_client||a.end_client||a.shipper||"",
          trips_count:Number(a.trips_count||a.trips||1),
          client_name:a.client_name||a.counterparty||"Delhivery",
          counterparty:a.counterparty||a.client_name||"Delhivery",
          bidding_type:a.bidding_type||a.bid_type||"Contract",
          bid_type:a.bid_type||a.bidding_type||"Contract",
          vehicle_type:a.vehicle_type||a.truck_type||"32FTSXL",
          truck_type:a.truck_type||a.vehicle_type||"32FTSXL"
        })).filter(b=>b&&b.id&&!delSet.has(String(b.id))&&!isDraftOrEmptyBid(b));
      if(pbBids.length>0)list=pbBids;
    }catch(m){}
  }

  // Preserve all bids with unique IDs without collapsing identical lanes (supports multiple loads/bids for same trip)
  list=list.filter(b=>b&&b.id&&!delSet.has(String(b.id))&&!isDraftOrEmptyBid(b));

  try{
    localStorage.setItem(ue.BIDS,JSON.stringify(list));
  }catch(e){}

  return list.sort((a,b)=>new Date(b.bid_date||b.date||b.created||0)-new Date(a.bid_date||a.date||a.created||0));
},Ne=async x=>{
  if(!x)return null;
  const isDraftOrEmptyBid=b=>{
    if(!b)return!0;
    const start=String(b.starting_point||b.origin||'').trim();
    const end=String(b.ending_point||b.destination||'').trim();
    const client=String(b.underlying_client||b.end_client||b.shipper||'').trim();
    const amount=Number(b.bidding_amount||b.quoted_amount||0);
    const lostAt=Number(b.bidding_lost_at||0);
    if(!end&&!client&&amount===0&&lostAt===0&&(start==='HYD_Medchal GW'||!start)){
      return!0;
    }
    return!1;
  };

  if(isDraftOrEmptyBid(x))return x;

  const nowStr=new Date().toISOString();
  const permId=(x.id&&!String(x.id).startsWith("bid_")&&!String(x.id).startsWith("draft_")&&String(x.id).length===15)
    ?String(x.id)
    :(Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,9));

  const clean={
    ...x,
    id:permId,
    bidding_amount:(x.bidding_amount===""||x.bidding_amount===null||isNaN(Number(x.bidding_amount)))?0:Number(x.bidding_amount),
    bidding_lost_at:(x.bidding_lost_at===""||x.bidding_lost_at===null||isNaN(Number(x.bidding_lost_at)))?0:Number(x.bidding_lost_at),
    quoted_amount:Number(x.quoted_amount||x.bidding_amount)||0,
    quoted_rate:Number(x.quoted_rate||x.quoted_amount||x.bidding_amount)||0,
    actual_winning_rate:Number(x.actual_winning_rate||(x.status==="Won"?x.bidding_amount:0))||0,
    no_of_stops:Number(x.no_of_stops)||1,
    distance_km:Number(x.distance_km)||0,
    payload_tons:(x.payload_tons===""||x.payload_tons===null||isNaN(Number(x.payload_tons)))?Number(x.weight||7):Number(x.payload_tons),
    payload:(x.payload_tons===""||x.payload_tons===null||isNaN(Number(x.payload_tons)))?Number(x.weight||7):Number(x.payload_tons),
    weight:(x.payload_tons===""||x.payload_tons===null||isNaN(Number(x.payload_tons)))?Number(x.weight||7):Number(x.payload_tons),
    underlying_client:(x.underlying_client||x.end_client||x.shipper||"").trim(),
    end_client:(x.underlying_client||x.end_client||x.shipper||"").trim(),
    shipper:(x.underlying_client||x.end_client||x.shipper||"").trim(),
    trips_count:Number(x.trips_count)||1,
    monthly_trips:Number(x.monthly_trips||x.trips_count)||1,
    contract_months:Number(x.contract_months)||12,
    dedicated_trucks:Number(x.dedicated_trucks)||1,
    client_name:x.client_name||x.counterparty||"Delhivery",
    counterparty:x.counterparty||x.client_name||"Delhivery",
    bidding_type:x.bidding_type||x.bid_type||"Contract",
    bid_type:x.bid_type||x.bidding_type||"Contract",
    vehicle_type:x.vehicle_type||x.truck_type||"32FTSXL",
    truck_type:x.truck_type||x.vehicle_type||"32FTSXL",
    starting_point:x.starting_point||x.origin||"HYD_Medchal GW",
    origin:x.origin||x.starting_point||"HYD_Medchal GW",
    ending_point:(x.ending_point||x.destination||"").trim(),
    destination:(x.destination||x.ending_point||"").trim(),
    status:x.status||x.result||"Not bidded",
    result:x.result||x.status||"Not bidded",
    date:x.date||x.bid_date||new Date().toISOString().split("T")[0],
    bid_date:x.bid_date||x.date||new Date().toISOString().split("T")[0],
    updated:nowStr,
    created:x.created||nowStr
  };

  try{
    await fetch("/api/bidding/bids",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(clean)
    });
  }catch(e){
    console.warn("Bids server API save fallback:",e);
  }

  try{
    const{id:_,created:cD,updated:uD,...data}=clean;
    try{
      await he.collection("bids").update(clean.id,data,{$autoCancel:!1});
    }catch(err){
      await he.collection("bids").create({id:clean.id,...data},{$autoCancel:!1});
    }
  }catch(e){}

  try{
    const loc=localStorage.getItem(ue.BIDS);
    const arr=loc?JSON.parse(loc):[];
    const idx=arr.findIndex(b=>b.id===clean.id||(x.id&&b.id===x.id));
    if(idx>=0)arr[idx]=clean;
    else arr.unshift(clean);
    localStorage.setItem(ue.BIDS,JSON.stringify(arr.filter(b=>!isDraftOrEmptyBid(b))));
  }catch(e){}
  return clean;
},Ye=async x=>{
  if(!x)return;
  const xStr=String(x);
  try{
    const d=localStorage.getItem("jbc_deleted_bid_ids");
    const arr=d?JSON.parse(d):[];
    if(!arr.includes(xStr)){
      arr.push(xStr);
      localStorage.setItem("jbc_deleted_bid_ids",JSON.stringify(arr));
    }
  }catch(e){}
  try{
    const m=localStorage.getItem(ue.BIDS);
    if(m){
      const a=JSON.parse(m).filter(l=>String(l.id)!==xStr);
      localStorage.setItem(ue.BIDS,JSON.stringify(a));
    }
  }catch(m){}
  try{
    await fetch("/api/bidding/bids/"+encodeURIComponent(xStr),{method:"DELETE"});
  }catch(e){}
  try{
    await he.collection("bids").delete(xStr,{$autoCancel:!1});
  }catch(m){}
},`;

    content = content.substring(0, rsStart) + newStorageCode + content.substring(nsStart);
    console.log(`✓ Replaced rs, Ne, Ye storage engine (deduping removed, empty bids prevented)`);
  }

  // 2. Fix le ("Add Bid Row") in ms component so it creates an in-memory draft without sending to server
  const oldLe = 'const le=()=>{const c=tt(new Date,"yyyy-MM-dd"),T={id:`bid_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,date:c,bid_date:c,client_name:a==="all"?"Delhivery":a,counterparty:a==="all"?"Delhivery":a,underlying_client:"",end_client:"",shipper:"",bidding_type:l||"Contract",bid_type:l||"Contract",vehicle_type:"32FTSXL",truck_type:"32FTSXL",payload_tons:7,payload:7,weight:7,bidding_amount:0,quoted_amount:0,quoted_rate:0,bidding_lost_at:0,actual_winning_rate:0,trip_detail:"2 Way",starting_point:"HYD_Medchal GW",origin:"HYD_Medchal GW",ending_point:"",destination:"",no_of_stops:1,route_map:"",status:"Not bidded",result:"Not bidded",notes:""};r?.(T);F.success(`Added new bid row under ${T.client_name} (${T.bidding_type})`)};';
  const newLe = 'const le=()=>{const c=tt(new Date,"yyyy-MM-dd"),T={id:`draft_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,date:c,bid_date:c,client_name:a==="all"?"Delhivery":a,counterparty:a==="all"?"Delhivery":a,underlying_client:"",end_client:"",shipper:"",bidding_type:l||"Contract",bid_type:l||"Contract",vehicle_type:"32FTSXL",truck_type:"32FTSXL",payload_tons:7,payload:7,weight:7,bidding_amount:0,quoted_amount:0,quoted_rate:0,bidding_lost_at:0,actual_winning_rate:0,trip_detail:"2 Way",starting_point:"HYD_Medchal GW",origin:"HYD_Medchal GW",ending_point:"",destination:"",no_of_stops:1,route_map:"",status:"Not bidded",result:"Not bidded",notes:"",_isDraft:!0};setLocalBids(prev=>[T,...(prev||[])]);F.info(`New draft row added under ${T.client_name}. Enter destination or client to save.`)};';

  if (content.includes(oldLe)) {
    content = content.replace(oldLe, newLe);
    console.log(`✓ Replaced le() in ms component`);
  }

  // 3. Fix B() in ms component so it promotes draft when real data is entered
  const oldBEnd = 'if(isImmediate){if(jbcTimersRef.current[c])clearTimeout(jbcTimersRef.current[c]);delete jbcTimersRef.current[c];d?.(G)}else{if(jbcTimersRef.current[c])clearTimeout(jbcTimersRef.current[c]);jbcTimersRef.current[c]=setTimeout(()=>{d?.(G);delete jbcTimersRef.current[c]},400)}};';
  const newBEnd = 'const isDraft=G._isDraft||String(G.id).startsWith("draft_");const hasRealData=(G.ending_point&&G.ending_point.trim().length>0)||(G.underlying_client&&G.underlying_client.trim().length>0)||(Number(G.bidding_amount)>0)||(Number(G.bidding_lost_at)>0);if(isDraft&&hasRealData){delete G._isDraft;const oldDraftId=G.id;G.id=Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,9);setLocalBids(prev=>(prev||[]).map(item=>item.id===oldDraftId?G:item));r?.(G);return;}setLocalBids(prev=>(prev||[]).map(item=>item.id===c?G:item));if(!isDraft){if(isImmediate){if(jbcTimersRef.current[c])clearTimeout(jbcTimersRef.current[c]);delete jbcTimersRef.current[c];d?.(G)}else{if(jbcTimersRef.current[c])clearTimeout(jbcTimersRef.current[c]);jbcTimersRef.current[c]=setTimeout(()=>{d?.(G);delete jbcTimersRef.current[c]},400)}}};';

  if (content.includes(oldBEnd)) {
    content = content.replace(oldBEnd, newBEnd);
    console.log(`✓ Replaced B() ending in ms component`);
  }

  // 4. Inject laneBidInfo and cloneBid helper into ms component
  const statsDef = 'const stats=C.useMemo(()=>{const total=H.length,won=H.filter(b=>b.status==="Won").length,lost=H.filter(b=>b.status==="Lost").length,winRate=total>0?Math.round((won/total)*100):0,totalVal=H.reduce((sum,b)=>sum+(Number(b.bidding_amount)||0),0);return{total,won,lost,winRate,totalVal}},[H]);';
  const newStatsAndHelpers = `${statsDef}const laneBidInfo=C.useMemo(()=>{const countMap={},curMap={},indexMap={};const list=(localBids||x).filter(b=>b&&b.id&&!b._isDraft&&!String(b.id).startsWith("draft_"));list.forEach(b=>{const d=b.date||b.bid_date||"";const cl=String(b.client_name||b.counterparty||"").trim().toLowerCase();const o=String(b.starting_point||b.origin||"").trim().toLowerCase();const dest=String(b.ending_point||b.destination||"").trim().toLowerCase();if(!dest)return;const k=[d,cl,o,dest].join("|||");countMap[k]=(countMap[k]||0)+1});[...list].reverse().forEach(b=>{const d=b.date||b.bid_date||"";const cl=String(b.client_name||b.counterparty||"").trim().toLowerCase();const o=String(b.starting_point||b.origin||"").trim().toLowerCase();const dest=String(b.ending_point||b.destination||"").trim().toLowerCase();if(!dest)return;const k=[d,cl,o,dest].join("|||");curMap[k]=(curMap[k]||0)+1;indexMap[b.id]={total:countMap[k],index:curMap[k]}});return indexMap},[localBids,x]);const cloneBid=row=>{const cDate=row.date||row.bid_date||tt(new Date,"yyyy-MM-dd");const newId=Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,9);const newRow={...row,id:newId,date:cDate,bid_date:cDate,bidding_amount:row.bidding_amount||0,quoted_amount:row.quoted_amount||row.bidding_amount||0,quoted_rate:row.quoted_rate||row.bidding_amount||0,bidding_lost_at:0,actual_winning_rate:0,status:"Not bidded",result:"Not bidded",created:new Date().toISOString(),updated:new Date().toISOString()};delete newRow._isDraft;setLocalBids(prev=>[newRow,...(prev||[])]);r?.(newRow);F.success(\`Added duplicate load/bid for \${newRow.starting_point||"Origin"} ➔ \${newRow.ending_point||"Destination"} (\${newRow.client_name})\`)};`;

  if (content.includes(statsDef)) {
    // Only inject if not already present
    if (!content.includes('const laneBidInfo=')) {
      content = content.replace(statsDef, newStatsAndHelpers);
      console.log(`✓ Injected laneBidInfo and cloneBid into ms component`);
    } else {
      console.log(`Note: laneBidInfo already present in ${bundlePath}`);
    }
  }

  // 5. Enhance Date column in H.map to show "Load #1 of 3" badge for duplicate lane bids
  const oldDateCellWithBang = 'e.jsx(ae,{className:"p-1",children:e.jsx("input",{type:"date",value:c.date?c.date.split("T")[0]:"",onChange:N=>B(c.id,"date",N.target.value,!0),className:"w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"})})';
  const oldDateCellWithoutBang = 'e.jsx(ae,{className:"p-1",children:e.jsx("input",{type:"date",value:c.date?c.date.split("T")[0]:"",onChange:N=>B(c.id,"date",N.target.value),className:"w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"})})';
  
  const newDateCell = 'e.jsx(ae,{className:"p-1",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("input",{type:"date",value:c.date?c.date.split("T")[0]:"",onChange:N=>B(c.id,"date",N.target.value,!0),className:"w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"}),laneBidInfo[c.id]?.total>1&&e.jsxs("span",{className:"shrink-0 px-1 py-0.5 text-[9px] font-bold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-sm whitespace-nowrap",title:`Multiple bids/trucks for this corridor today: Load ${laneBidInfo[c.id].index} of ${laneBidInfo[c.id].total}`,children:[`#${laneBidInfo[c.id].index}/${laneBidInfo[c.id].total}`]})]})})';

  if (content.includes(oldDateCellWithBang)) {
    content = content.replace(oldDateCellWithBang, newDateCell);
    console.log(`✓ Enhanced Date cell with multi-load badge`);
  } else if (content.includes(oldDateCellWithoutBang)) {
    content = content.replace(oldDateCellWithoutBang, newDateCell);
    console.log(`✓ Enhanced Date cell (without bang) with multi-load badge`);
  }

  // 6. Enhance Action header and Action cell with 1-click Clone / Duplicate helper button
  const oldActionHeader = 'e.jsx(ne,{className:"w-[50px] text-right pr-4",children:"Action"})';
  const newActionHeader = 'e.jsx(ne,{className:"w-[70px] text-right pr-3",children:"Action"})';
  if (content.includes(oldActionHeader)) {
    content = content.replace(oldActionHeader, newActionHeader);
    console.log(`✓ Widened Action column header`);
  }

  const oldActionCell = 'e.jsx(ae,{className:"text-right pr-4",children:e.jsx(L,{variant:"ghost",size:"sm",className:"h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg",onClick:()=>y?.(c.id),title:"Delete Bid",children:e.jsx(Ze,{className:"w-3.5 h-3.5"})})})';
  const newActionCell = 'e.jsxs(ae,{className:"text-right pr-3 flex items-center justify-end gap-1",children:[e.jsx(L,{variant:"ghost",size:"sm",className:"h-7 w-7 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg",onClick:()=>cloneBid(c),title:"Duplicate / Rebid (Add another load or quote for this corridor)",children:e.jsx("span",{className:"text-xs",children:"📑"})}),e.jsx(L,{variant:"ghost",size:"sm",className:"h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg",onClick:()=>y?.(c.id),title:"Delete Bid",children:e.jsx(Ze,{className:"w-3.5 h-3.5"})})]})';

  if (content.includes(oldActionCell)) {
    content = content.replace(oldActionCell, newActionCell);
    console.log(`✓ Added Clone / Rebid button in Action cell`);
  }

  // 7. Fix flushRow so it ignores draft rows
  const oldFlush = 'const item=(localBids||x).find(N=>N.id===rowId);item&&d?.(item)';
  const newFlush = 'const item=(localBids||x).find(N=>N.id===rowId);if(item&&!item._isDraft&&!String(item.id).startsWith("draft_")){d?.(item)}';
  if (content.includes(oldFlush)) {
    content = content.replace(oldFlush, newFlush);
    console.log(`✓ Replaced flushRow in ms component`);
  }

  // 8. Fix T and D in parent component
  const oldTandD = 'T=async t=>{try{await Ne(t),j(s=>s.map(u=>u.id===t.id?t:u))}catch{F.error("Failed to update bid")}},D=async t=>{try{const s=await Ne(t);j(u=>[s,...u])}catch{F.error("Failed to save new bid")}}';
  const newTandD = 'T=async t=>{try{const saved=await Ne(t);const finalItem=saved||t;j(s=>s.map(u=>(u.id===t.id||u.id===finalItem.id)?finalItem:u))}catch{F.error("Failed to update bid")}},D=async t=>{try{const saved=await Ne(t);if(saved)j(u=>[saved,...u.filter(x=>x.id!==saved.id&&x.id!==t.id)])}catch{F.error("Failed to save new bid")}}';

  if (content.includes(oldTandD)) {
    content = content.replace(oldTandD, newTandD);
    console.log(`✓ Replaced T and D in parent component`);
  }

  // 9. Validate with esbuild
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`🎉 100% VALID SYNTAX for ${bundlePath}`);
  } catch (err) {
    console.error(`❌ Syntax error in ${bundlePath}:`, err);
    process.exit(1);
  }
});

console.log('\nAll bundles successfully patched and verified!');
