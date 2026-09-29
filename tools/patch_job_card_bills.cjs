const fs = require('fs');
const path = require('path');

const bundleFiles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js'
];

// Target 1: Modal useEffect reading bills (pos ~16900)
const target1 = `const l=[];Array.isArray(i.bills)?i.bills.forEach(m=>{m&&l.push({name:m,url:d.files.getURL(i,m)})}):typeof i.bills=="string"&&i.bills.trim()&&l.push({name:i.bills,url:d.files.getURL(i,i.bills)}),Array.isArray(i.bill)?i.bill.forEach(m=>{m&&!l.some(_=>_.name===m)&&l.push({name:m,url:d.files.getURL(i,m)})}):typeof i.bill=="string"&&i.bill.trim()&&(l.some(m=>m.name===i.bill)||l.push({name:i.bill,url:d.files.getURL(i,i.bill)})),Array.isArray(i.bills_json)&&i.bills_json.forEach(m=>{m&&m.url&&!l.some(_=>_.url===m.url)&&l.push(m)}),Y(l)`;

const replace1 = `const l=[];const _sn=new Set;const _ab=(m,u)=>{if(m&&!_sn.has(m)&&!_sn.has(u)){_sn.add(m),u&&_sn.add(u),l.push({name:m,url:u})}};Array.isArray(i.bills)&&i.bills.length>0?i.bills.forEach(m=>m&&_ab(m,d.files.getURL(i,m))):typeof i.bills=="string"&&i.bills.trim()?_ab(i.bills,d.files.getURL(i,i.bills)):Array.isArray(i.bill)&&i.bill.length>0?i.bill.forEach(m=>m&&_ab(m,d.files.getURL(i,m))):typeof i.bill=="string"&&i.bill.trim()?_ab(i.bill,d.files.getURL(i,i.bill)):Array.isArray(i.bills_json)&&i.bills_json.length>0&&i.bills_json.forEach(m=>m&&_ab(m.name||"Bill",m.url));Y(l)`;

// Target 2: jt submission logic (pos ~24200)
const target2 = `Q.append("bills_json",JSON.stringify(T)),A.forEach(c=>{Q.append("bills",c),Q.append("bills+",c),Q.append("bill",c)});const De=A.length+T.length;`;

const replace2 = `Q.append("bills_json",JSON.stringify(T));const _kn=new Set;T.forEach(b=>{const n=typeof b=="string"?b:(b?.name||"");n&&(_kn.add(n),Q.append("bills",n))});const _ob=[];Array.isArray(i?.bills)?_ob.push(...i.bills):typeof i?.bills=="string"&&i.bills.trim()&&_ob.push(i.bills);_ob.forEach(n=>{n&&!_kn.has(n)&&Q.append("bills-",n)});T.length===0&&A.length===0&&Q.append("bills","");A.forEach(c=>{Q.append("bills",c)});Q.append("bill","");const De=A.length+T.length;`;

// Target 3: expense sync (pos ~55500)
const target3 = `    const existingBills = [];
    if (Array.isArray(expJC.bills)) existingBills.push(...expJC.bills);
    if (typeof expJC.bills === 'string' && expJC.bills) existingBills.push(expJC.bills);
    if (Array.isArray(expJC.bill)) existingBills.push(...expJC.bill);
    if (typeof expJC.bill === 'string' && expJC.bill) existingBills.push(expJC.bill);
    existingBills.forEach(bFile => {
      if (bFile) {
        formData.append("documents", bFile);
        formData.append("bill", bFile);
      }
    });`;

const replace3 = `    const existingBills = [];
    if (Array.isArray(expJC.bills) && expJC.bills.length > 0) existingBills.push(...expJC.bills);
    else if (typeof expJC.bills === 'string' && expJC.bills) existingBills.push(expJC.bills);
    else if (Array.isArray(expJC.bill) && expJC.bill.length > 0) existingBills.push(...expJC.bill);
    else if (typeof expJC.bill === 'string' && expJC.bill) existingBills.push(expJC.bill);
    const seenExp = new Set();
    existingBills.forEach(bFile => {
      if (bFile && !seenExp.has(bFile)) {
        seenExp.add(bFile);
        formData.append("documents", bFile);
      }
    });`;

// Target 4 & 5: Table cell & Mobile card display (pos ~91400 & ~95880)
const targetDisplay = `Array.isArray(t.bills)?t.bills.forEach(a=>{a&&r.push({name:a,url:d.files.getURL(t,a)})}):typeof t.bills=="string"&&t.bills.trim()&&r.push({name:t.bills,url:d.files.getURL(t,t.bills)}),Array.isArray(t.bill)?t.bill.forEach(a=>{a&&!r.some(s=>s.name===a)&&r.push({name:a,url:d.files.getURL(t,a)})}):typeof t.bill=="string"&&t.bill.trim()&&(r.some(a=>a.name===t.bill)||r.push({name:t.bill,url:d.files.getURL(t,t.bill)})),Array.isArray(t.bills_json)&&t.bills_json.forEach(a=>{a&&a.url&&!r.some(s=>s.url===a.url)&&r.push(a)}),r.length===0&&t.bill_url&&r.push({name:"Invoice",url:t.bill_url})`;

const replaceDisplay = `(()=>{const _sn=new Set;const _ab=(n,u)=>{if(n&&!_sn.has(n)&&!_sn.has(u)){_sn.add(n),u&&_sn.add(u),r.push({name:n,url:u})}};Array.isArray(t.bills)&&t.bills.length>0?t.bills.forEach(a=>a&&_ab(a,d.files.getURL(t,a))):typeof t.bills=="string"&&t.bills.trim()?_ab(t.bills,d.files.getURL(t,t.bills)):Array.isArray(t.bill)&&t.bill.length>0?t.bill.forEach(a=>a&&_ab(a,d.files.getURL(t,a))):typeof t.bill=="string"&&t.bill.trim()?_ab(t.bill,d.files.getURL(t,t.bill)):Array.isArray(t.bills_json)&&t.bills_json.length>0&&t.bills_json.forEach(a=>a&&_ab(a.name||"Bill",a.url));r.length===0&&t.bill_url&&_ab("Invoice",t.bill_url)})()`;

for (const relPath of bundleFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');

  // Check 1
  if (!content.includes(target1)) {
    console.error(`target1 not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(target1, replace1);

  // Check 2
  if (!content.includes(target2)) {
    console.error(`target2 not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(target2, replace2);

  // Check 3
  if (!content.includes(target3)) {
    console.error(`target3 not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(target3, replace3);

  // Check 4 & 5 (2 occurrences)
  const displayOccurrences = content.split(targetDisplay).length - 1;
  if (displayOccurrences !== 2) {
    console.error(`targetDisplay expected 2 occurrences, got ${displayOccurrences} in ${relPath}`);
    process.exit(1);
  }
  content = content.replaceAll(targetDisplay, replaceDisplay);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Successfully patched ${relPath}`);
}

console.log('All 4 bundles patched successfully!');
