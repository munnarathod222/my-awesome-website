const fs = require('fs');
const parser = require('@babel/parser');

const targetIdx = 'yt.forEach(ut=>{ut.file&&(De.append("documents",ut.file),De.append("image_urls",ut.file))})';
const replIdx = 'yt.forEach(ut=>{if(!ut.file)return;const fn=ut.file.name||"fuel_bill.jpg",ext=(fn.split(".").pop()||"jpg").toLowerCase(),clean=fn.replace(/\\.[^/.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"_").substring(0,40),safeName=`fuel_${Date.now()}_${clean}.${ext}`,safeFile=new File([ut.file],safeName,{type:ut.file.type||"image/jpeg"});["jpg","jpeg","png","webp","gif"].includes(ext)?De.append("image_urls",safeFile):De.append("documents",safeFile)})';

const targetExp = 's.forEach(f=>{const C=(f?.name||"").split(".").pop().toLowerCase();["jpg","jpeg","png","gif","webp"].includes(C)?r.append("image_urls",f):r.append("documents",f)})';
const replExp = 's.forEach(f=>{if(!f)return;const fn=f.name||"bill.jpg",C=(fn.split(".").pop()||"jpg").toLowerCase(),clean=fn.replace(/\\.[^/.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"_").substring(0,40),safeName=`bill_${Date.now()}_${clean}.${C}`,safeFile=new File([f],safeName,{type:f.type||"image/jpeg"});["jpg","jpeg","png","gif","webp"].includes(C)?r.append("image_urls",safeFile):r.append("documents",safeFile)})';

const indexFiles = [
  'dist/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js'
];

for (const f of indexFiles) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes(targetIdx)) {
      c = c.replace(targetIdx, replIdx);
      parser.parse(c, { sourceType: 'module' });
      fs.writeFileSync(f, c);
      console.log('✅ Patched & validated:', f);
    } else {
      console.log('Notice: target not in:', f);
    }
  }
}

const expFiles = [
  'ExpensesPage-DPFHVAFy.js',
  'dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/web/dist/assets/ExpensesPage-DPFHVAFy.js',
  'dist/apps/web/assets/ExpensesPage-DPFHVAFy.js',
  'tools/ExpensesPage.patched.js'
];

for (const f of expFiles) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes(targetExp)) {
      c = c.replace(targetExp, replExp);
      parser.parse(c, { sourceType: 'module' });
      fs.writeFileSync(f, c);
      console.log('✅ Patched & validated:', f);
    } else {
      console.log('Notice: target not in:', f);
    }
  }
}
