const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetFiles = [
  'dist/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'dist/apps/web/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'apps/web/dist/assets/BiddingIntelligencePage-DYnKd3nB.js',
  'apps/api/dist/assets/BiddingIntelligencePage-DYnKd3nB.js'
];

const newBiddingStorageCode = `rs=async()=>{
  let x=[];
  try{
    x=(await he.collection("bids").getFullList({sort:"-created",$autoCancel:!1})).map(a=>({...a,quoted_amount:Number(a.quoted_amount||a.quoted_rate||a.rate||0),actual_winning_rate:Number(a.actual_winning_rate||0),distance_km:Number(a.distance_km||a.distance||0),payload_tons:Number(a.payload_tons||a.payload||0),trips_count:Number(a.trips_count||a.trips||1)}));
  }catch(m){
    console.warn("PocketBase bids collection not ready or network offline, loading local store:",m);
  }
  try{
    const m=localStorage.getItem(ue.BIDS),a=m?JSON.parse(m):[],l={};
    x.forEach(p=>{l[p.id]=p});
    let hasLocalToSync=!1;
    for(const p of a){
      if(!l[p.id]){
        if(p.id&&String(p.id).startsWith("bid_")){
          try{
            const{id:_,created:cDate,updated:uDate,...dataToCreate}=p;
            const o=await he.collection("bids").create(dataToCreate,{$autoCancel:!1});
            p.id=o.id;
            hasLocalToSync=!0;
          }catch(err){
            console.warn("Auto-sync bid to PocketBase notice:",err);
          }
        }
        l[p.id]=p;
      }
    }
    if(hasLocalToSync){
      localStorage.setItem(ue.BIDS,JSON.stringify(Object.values(l)));
    }
    return Object.values(l).sort((p,d)=>{const r=new Date(p.bid_date||p.created||p.date||0);return new Date(d.bid_date||d.created||d.date||0)-r});
  }catch(m){
    return console.error("Failed to load bids:",m),x;
  }
},Ne=async x=>{
  const m=new Date().toISOString(),
        l={
          ...x,
          updated:m,
          created:x.created||m,
          quoted_amount:Number(x.quoted_amount||0),
          actual_winning_rate:Number(x.actual_winning_rate||0),
          distance_km:Number(x.distance_km||0),
          payload_tons:Number(x.payload_tons||6),
          status:x.status||"Opportunity",
          result:x.result||(x.status==="Won"?"Won":x.status==="Lost"?"Lost":"Pending")
        };
  const isExisting=x.id&&!String(x.id).startsWith("bid_")&&String(x.id).length===15;
  try{
    if(isExisting){
      const{id:_,created:cDate,updated:uDate,...updateData}=l;
      await he.collection("bids").update(x.id,updateData,{$autoCancel:!1});
    }else{
      const{id:_,created:cDate,updated:uDate,...createData}=l;
      const o=await he.collection("bids").create(createData,{$autoCancel:!1});
      l.id=o.id;
    }
  }catch(o){
    console.warn("PocketBase bids save notice:",o.message);
    if(!l.id)l.id=\`bid_\${Date.now()}_\${Math.random().toString(36).substr(2,6)}\`;
  }
  try{
    const o=localStorage.getItem(ue.BIDS),p=o?JSON.parse(o):[],d=p.findIndex(r=>r.id===l.id||(x.id&&r.id===x.id));
    d>=0?p[d]=l:p.unshift(l);
    localStorage.setItem(ue.BIDS,JSON.stringify(p));
  }catch(o){
    console.error("Local cache error:",o);
  }
  return l;
},Ye=async x=>{
  try{
    if(x&&!String(x).startsWith("bid_")){
      await he.collection("bids").delete(x,{$autoCancel:!1});
    }
  }catch(m){
    console.warn("PocketBase bid delete skipped:",m.message);
  }
  try{
    const m=localStorage.getItem(ue.BIDS);
    if(m){
      const a=JSON.parse(m).filter(l=>l.id!==x);
      localStorage.setItem(ue.BIDS,JSON.stringify(a));
    }
  }catch(m){
    console.error("Local delete error:",m);
  }
},ns=async()=>{
  let x=[];
  try{
    x=await he.collection("contracts").getFullList({sort:"-created",$autoCancel:!1});
  }catch(m){
    console.warn("PocketBase contracts collection not ready, checking local cache:",m);
  }
  try{
    const m=localStorage.getItem(ue.CONTRACTS),a=m?JSON.parse(m):[],l={};
    x.forEach(o=>{l[o.id]=o});
    let hasLocalToSync=!1;
    for(const o of a){
      if(!l[o.id]){
        if(o.id&&String(o.id).startsWith("contract_")){
          try{
            const{id:_,created:cDate,updated:uDate,...dataToCreate}=o;
            const created=await he.collection("contracts").create(dataToCreate,{$autoCancel:!1});
            o.id=created.id;
            hasLocalToSync=!0;
          }catch(err){
            console.warn("Auto-sync contract to PocketBase notice:",err);
          }
        }
        l[o.id]=o;
      }
    }
    if(hasLocalToSync){
      localStorage.setItem(ue.CONTRACTS,JSON.stringify(Object.values(l)));
    }
    return Object.values(l);
  }catch{
    return x;
  }
},ut=async x=>{
  const m=new Date().toISOString(),
        l={...x,updated:m,created:x.created||m,status:x.status||"Active"};
  const isExisting=x.id&&!String(x.id).startsWith("contract_")&&String(x.id).length===15;
  try{
    if(isExisting){
      const{id:_,created:cDate,updated:uDate,...updateData}=l;
      await he.collection("contracts").update(x.id,updateData,{$autoCancel:!1});
    }else{
      const{id:_,created:cDate,updated:uDate,...createData}=l;
      const o=await he.collection("contracts").create(createData,{$autoCancel:!1});
      l.id=o.id;
    }
  }catch(o){
    console.warn("PocketBase contract save skipped:",o.message);
    if(!l.id)l.id=\`contract_\${Date.now()}_\${Math.random().toString(36).substr(2,6)}\`;
  }
  try{
    const o=localStorage.getItem(ue.CONTRACTS),p=o?JSON.parse(o):[],d=p.findIndex(r=>r.id===l.id||(x.id&&r.id===x.id));
    d>=0?p[d]=l:p.unshift(l);
    localStorage.setItem(ue.CONTRACTS,JSON.stringify(p));
  }catch(o){
    console.error("Local cache error:",o);
  }
  return l;
}`;

for (const relPath of targetFiles) {
  const fullPath = path.join(__dirname, '..', relPath);
  let code = fs.readFileSync(fullPath, 'utf8');

  const startIdx = code.indexOf('rs=async()=>{');
  const endIdx = code.indexOf(',os=()=>{', startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find start/end bounds in', relPath);
    process.exit(1);
  }

  code = code.substring(0, startIdx) + newBiddingStorageCode + code.substring(endIdx);

  // Validate syntax
  try {
    new vm.SourceTextModule(code);
    console.log(relPath, ': Syntax PASSED!');
  } catch (e) {
    console.error(relPath, ': Syntax FAILED!', e.message);
    process.exit(1);
  }

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(relPath, ': saved updated bundle successfully!');
}
