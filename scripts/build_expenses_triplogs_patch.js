const fs = require('fs');

console.log('--- Building ExpensesPage Trip Operational Patch ---');

let chunk = fs.existsSync('scratch/orig_ExpensesPage-DPFHVAFy.js')
  ? fs.readFileSync('scratch/orig_ExpensesPage-DPFHVAFy.js', 'utf8')
  : fs.readFileSync('dist/assets/ExpensesPage-DPFHVAFy.js', 'utf8');

console.log('Original chunk length:', chunk.length);

// 1. Target 1: trip_logs query in Promise.all
const target1 = 'g.collection("trip_logs").getFullList({filter:"advance_paid_to_driver > 0",sort:"-date",fields:"id,trip_id,driver_name,advance_paid_to_driver,date,route,truck_number,created",$autoCancel:!1}).catch(()=>[])';
const replacement1 = 'g.collection("trip_logs").getFullList({sort:"-date",fields:"id,trip_id,driver_name,advance_paid_to_driver,loading_charges,loading_paid_by,unloading_charges,unloading_paid_by,broker_commission,date,route,truck_number,truck_id,created",$autoCancel:!1}).catch(()=>[])';

if (!chunk.includes(target1)) {
  console.error('Target 1 not found in ExpensesPage chunk!');
  process.exit(1);
}
chunk = chunk.replace(target1, replacement1);
console.log('✓ Replaced Target 1 (trip_logs query fields)');

// 2. Target 2: A.forEach loop (Add Fail-Safe 4: Trip Operational Expenses Sync)
const target2 = 'A.forEach(n=>{const H=`trip_adv_${n.id}`;!Y.has(H)&&!Y.has(n.id)&&(Y.add(H),le.push({id:H,employee_id:"",employee_name:n.driver_name||"Trip Driver",amount:Number(n.advance_paid_to_driver)||0,date:n.date||n.created,status:"given",remaining_balance:0,reason:`Trip Advance (${n.trip_id||n.route||"Trip"})`,notes:`Truck: ${n.truck_number||""}`,created:n.created}))});';

const replacement2 = `A.forEach(n=>{
  if(Number(n.advance_paid_to_driver)>0){
    const H=\`trip_adv_\${n.id}\`;
    !Y.has(H)&&!Y.has(n.id)&&(Y.add(H),le.push({id:H,employee_id:"",employee_name:n.driver_name||"Trip Driver",amount:Number(n.advance_paid_to_driver)||0,date:n.date||n.created,status:"given",remaining_balance:0,reason:\`Trip Advance (\${n.trip_id||n.route||"Trip"})\`,notes:\`Truck: \${n.truck_number||""}\`,created:n.created}));
  }
  const _tDate=n.date||n.created||new Date().toISOString();
  const _trk=n.truck_number||"";
  const _tid=n.trip_id||n.id;
  if(n.loading_paid_by==="company"&&Number(n.loading_charges)>0){
    const _lId=\`trip_load_\${n.id}\`;
    if(!ke.some(e=>e.id===_lId||e.reference_id===_lId||(e.reference_id===n.id&&(e.category==="Loading / Hamali"||e.subcategory==="Loading / Hamali")))){
      ke.push({id:_lId,reference_id:_lId,trip_id:n.id,date:_tDate,category:"Trip Operational",subcategory:"Loading / Hamali",description:\`Loading / Hamali (Company) - Trip \${_tid}\${_trk?\` [\${_trk}]\`:""}\`,payment_method:"Cash",amount:Number(n.loading_charges),status:"Approved",truck_number:_trk,notes:\`Trip \${_tid}: Loading charges paid by company\`});
    }
  }
  if(n.unloading_paid_by==="company"&&Number(n.unloading_charges)>0){
    const _uId=\`trip_unload_\${n.id}\`;
    if(!ke.some(e=>e.id===_uId||e.reference_id===_uId||(e.reference_id===n.id&&(e.category==="Unloading / Hamali"||e.subcategory==="Unloading / Hamali")))){
      ke.push({id:_uId,reference_id:_uId,trip_id:n.id,date:_tDate,category:"Trip Operational",subcategory:"Unloading / Hamali",description:\`Unloading / Hamali (Company) - Trip \${_tid}\${_trk?\` [\${_trk}]\`:""}\`,payment_method:"Cash",amount:Number(n.unloading_charges),status:"Approved",truck_number:_trk,notes:\`Trip \${_tid}: Unloading charges paid by company\`});
    }
  }
  if(Number(n.broker_commission)>0){
    const _bId=\`trip_broker_\${n.id}\`;
    if(!ke.some(e=>e.id===_bId||e.reference_id===_bId||(e.reference_id===n.id&&(e.category==="Broker Commission"||e.subcategory==="Broker Commission")))){
      ke.push({id:_bId,reference_id:_bId,trip_id:n.id,date:_tDate,category:"Trip Operational",subcategory:"Broker Commission",description:\`Broker Commission - Trip \${_tid}\${_trk?\` [\${_trk}]\`:""}\`,payment_method:"Bank Transfer",amount:Number(n.broker_commission),status:"Approved",truck_number:_trk,notes:\`Trip \${_tid}: Brokerage commission\`});
    }
  }
});`;

if (!chunk.includes(target2)) {
  console.error('Target 2 not found in ExpensesPage chunk!');
  process.exit(1);
}
chunk = chunk.replace(target2, replacement2);
console.log('✓ Injected Fail-Safe 4 into ExpensesPage chunk');

// 3. Target 3: Calculation of _tripOp and summaryTotals
const target3 = 'summaryTotals:{fuelTotal:Number(C),fastagTotal:Number(A),driverAdvanceTotal:Number(ke),salaryTotal:Number(le),maintenanceTotal:Number(Y),miscTotal:Number(Se),parkingTotal:Number(typeof _park!=="undefined"?_park:0),fixedEmiTotal:Number(Nt),isManualEmi:H,allOtherTotal:Number(wt)}';

const replacement3 = `const _tripOp=b.filter(d=>d.category==="Trip Operational"||d.subcategory==="Loading / Hamali"||d.subcategory==="Unloading / Hamali"||d.subcategory==="Broker Commission").reduce((l,d)=>Number(l)+Number(d.amount||0),0);return{activeSummaryLabel:f,summaryTotals:{fuelTotal:Number(C),fastagTotal:Number(A),driverAdvanceTotal:Number(ke),salaryTotal:Number(le),maintenanceTotal:Number(Y),miscTotal:Number(Se),parkingTotal:Number(typeof _park!=="undefined"?_park:0),tripOpTotal:Number(_tripOp),fixedEmiTotal:Number(Nt),isManualEmi:H,allOtherTotal:Number(wt)}}`;

// In chunk, find `return{activeSummaryLabel:f,summaryTotals:{fuelTotal:Number(C)...`
const targetReturn = `return{activeSummaryLabel:f,${target3}}`;
if (!chunk.includes(targetReturn)) {
  console.error('targetReturn not found in ExpensesPage chunk!');
  process.exit(1);
}
chunk = chunk.replace(targetReturn, replacement3);
console.log('✓ Updated summaryTotals with tripOpTotal');

// 4. Target 4: Add Trip Operational card to Category Summary Grid
const target4 = '{title:"All Other Expenses",amount:$.allOtherTotal,color:"text-indigo-500"}';
const replacement4 = '{title:"Trip Operational",amount:$.tripOpTotal||0,color:"text-violet-400"},{title:"All Other Expenses",amount:$.allOtherTotal,color:"text-indigo-500"}';

if (!chunk.includes(target4)) {
  console.error('Target 4 not found in ExpensesPage chunk!');
  process.exit(1);
}
chunk = chunk.replace(target4, replacement4);
console.log('✓ Added Trip Operational KPI card to Category Summary Grid');

// 5. Write to distribution targets
const distPaths = [
  'dist/assets/ExpensesPage-DPFHVAFy.js',
  'dist/apps/web/assets/ExpensesPage-DPFHVAFy.js',
  'apps/api/dist/assets/ExpensesPage-DPFHVAFy.js'
];

distPaths.forEach(p => {
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, chunk, 'utf8');
    console.log(`✓ Updated ${p} (${chunk.length} bytes)`);
  } else {
    console.warn(`File not found: ${p}`);
  }
});

console.log('🎉 ExpensesPage-DPFHVAFy.js successfully patched with Fail-Safe 4 & Trip Operational Card!');
