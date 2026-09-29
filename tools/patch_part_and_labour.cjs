const fs = require('fs');
const path = require('path');

const bundleFiles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js'
];

// Target 1: Calculation of H, Le, Z in component tr
const targetCalc = `H=D.filter(l=>l.type==="part").reduce((l,m)=>l+(Number(m.amount)||0),0),Le=D.filter(l=>l.type==="labour").reduce((l,m)=>l+(Number(m.amount)||0),0),Z=H+Le`;

const replaceCalc = `_isPL=l=>l?.type==="part_and_labour"||l?.type==="both"||l?.type==="part & labour"||l?.type==="Part & Labour",_bothAmt=D.filter(_isPL).reduce((l,m)=>l+(Number(m.amount)||0),0),_partsOnly=D.filter(l=>l.type==="part").reduce((l,m)=>l+(Number(m.amount)||0),0),_labourOnly=D.filter(l=>l.type==="labour").reduce((l,m)=>l+(Number(m.amount)||0),0),H=_partsOnly+Math.round(_bothAmt/2),Le=_labourOnly+(_bothAmt-Math.round(_bothAmt/2)),Z=_partsOnly+_labourOnly+_bothAmt`;

// Target 2: Dropdown Select in Itemized row
const targetSelect = `e.jsxs(_e,{value:l.type,onValueChange:_=>W(m,"type",_),children:[e.jsx(we,{className:"w-[100px] h-8 text-xs bg-background rounded-lg",children:e.jsx(ke,{})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"part",children:"Part 📦"}),e.jsx(E,{value:"labour",children:"Labour 🛠"})]})]})`;

const replaceSelect = `e.jsxs(_e,{value:_isPL(l)?"part_and_labour":(l.type||"part"),onValueChange:_=>W(m,"type",_),children:[e.jsx(we,{className:"w-[130px] h-8 text-xs bg-background rounded-lg",children:e.jsx(ke,{})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"part",children:"Part 📦"}),e.jsx(E,{value:"labour",children:"Labour 🛠️"}),e.jsx(E,{value:"part_and_labour",children:"Part & Labour 📦🛠️"})]})]})`;

// Target 3: Bottom summary bar
const targetSummary = `e.jsxs("span",{className:"text-muted-foreground",children:["Parts: ",e.jsxs("strong",{className:"text-foreground font-mono",children:["₹",H.toLocaleString("en-IN")]})]}),e.jsxs("span",{className:"text-muted-foreground",children:["Labour: ",e.jsxs("strong",{className:"text-foreground font-mono",children:["₹",Le.toLocaleString("en-IN")]})]})`;

const replaceSummary = `e.jsxs("span",{className:"text-muted-foreground",children:["Parts: ",e.jsxs("strong",{className:"text-foreground font-mono",children:["₹",_partsOnly.toLocaleString("en-IN")]})]}),e.jsxs("span",{className:"text-muted-foreground",children:["Labour: ",e.jsxs("strong",{className:"text-foreground font-mono",children:["₹",_labourOnly.toLocaleString("en-IN")]})]}),_bothAmt>0&&e.jsxs("span",{className:"text-muted-foreground",children:["Part & Labour: ",e.jsxs("strong",{className:"text-amber-400 font-mono",children:["₹",_bothAmt.toLocaleString("en-IN")]})]})`;

// Target 4: Printable invoice type cell
const targetPrint = `e.jsx("td",{className:"p-2 text-center text-slate-600 font-semibold capitalize",children:A.type||"part"})`;

const replacePrint = `e.jsx("td",{className:"p-2 text-center text-slate-600 font-semibold",children:(A.type==="part_and_labour"||A.type==="both"||A.type==="part & labour"||A.type==="Part & Labour")?"Part & Labour":((A.type||"part").charAt(0).toUpperCase()+(A.type||"part").slice(1))})`;

for (const relPath of bundleFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');

  // Check 1
  if (!content.includes(targetCalc)) {
    console.error(`targetCalc not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(targetCalc, replaceCalc);

  // Check 2: Note the emoji character in targetSelect
  let foundSelect = false;
  if (content.includes(targetSelect)) {
    content = content.replace(targetSelect, replaceSelect);
    foundSelect = true;
  } else {
    // Try matching with regex for emoji variations
    const selectRegex = /e\.jsxs\(_e,\{value:l\.type,onValueChange:_=>W\(m,"type",_\),children:\[e\.jsx\(we,\{className:"w-\[100px\] h-8 text-xs bg-background rounded-lg",children:e\.jsx\(ke,\{\}\)\}\),e\.jsxs\(Ce,\{children:\[e\.jsx\(E,\{value:"part",children:"Part [^"]+"\}\),e\.jsx\(E,\{value:"labour",children:"Labour [^"]+"\}\)\]\}\)\]\}\)/;
    if (selectRegex.test(content)) {
      content = content.replace(selectRegex, replaceSelect);
      foundSelect = true;
    }
  }
  if (!foundSelect) {
    console.error(`targetSelect not found in ${relPath}`);
    process.exit(1);
  }

  // Check 3
  if (!content.includes(targetSummary)) {
    console.error(`targetSummary not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(targetSummary, replaceSummary);

  // Check 4
  if (!content.includes(targetPrint)) {
    console.error(`targetPrint not found in ${relPath}`);
    process.exit(1);
  }
  content = content.replace(targetPrint, replacePrint);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Successfully patched ${relPath}`);
}

console.log('All 4 bundles patched for Part & Labour successfully!');
