const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const targetFiles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js'
];

for (const pth of targetFiles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');
  let changed = false;

  // Make top header and controls responsive on mobile
  const targetHeader = `e.jsxs(We,{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 px-6 border-b border-border/50 bg-muted/20",children:[e.jsxs("div",{children:[e.jsxs(Ve,{className:"text-base font-extrabold flex items-center gap-2",children:[e.jsx(Je,{className:"w-5 h-5 text-amber-400"})," Digital Workshop Job Cards"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Create, track, and bill truck maintenance job cards with itemized spare parts & labour charges."})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-3 w-full md:w-auto",children:[e.jsxs("div",{className:"relative flex-1 min-w-[200px] md:max-w-xs",children:[e.jsx(Ze,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx($,{placeholder:"Search Job Card #, Truck, Driver...",className:"pl-9 h-9 text-xs bg-background border-border/60 rounded-xl",value:l,onChange:t=>m(t.target.value)})]}),e.jsxs(_e,{value:Z,onValueChange:jt,children:[e.jsx(we,{className:"w-[140px] h-9 text-xs bg-background border-border/60 rounded-xl font-bold",children:e.jsx(ke,{placeholder:"All Statuses"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Statuses"}),e.jsx(E,{value:"Created",children:"Created"}),e.jsx(E,{value:"Work In Progress",children:"Work In Progress"}),e.jsx(E,{value:"Parts Pending",children:"Parts Pending"}),e.jsx(E,{value:"Quality Inspected",children:"Quality Inspected"}),e.jsx(E,{value:"Closed",children:"Closed"})]})]}),e.jsxs(N,{type:"button",onClick:()=>{setLogProblemTruck("");setLogProblemOpen(!0)},size:"sm",variant:"outline",className:"rounded-xl h-9 text-xs font-bold border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 shadow-sm gap-1.5",children:[e.jsx(Ge,{className:"w-4 h-4 text-amber-400"})," Log Truck Problem"]}),e.jsxs(N,{onClick:()=>{Ne(null),v(!0)},size:"sm",className:"rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground shadow-md",children:[e.jsx(gt,{className:"w-4 h-4 mr-1.5"})," New Job Card"]})]})]})`;

  const replaceHeader = `e.jsxs(We,{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 py-3.5 px-3.5 sm:px-6 border-b border-border/50 bg-muted/20",children:[e.jsxs("div",{children:[e.jsxs(Ve,{className:"text-sm sm:text-base font-extrabold flex items-center gap-2",children:[e.jsx(Je,{className:"w-5 h-5 text-amber-400"})," Digital Workshop Job Cards"]}),e.jsx("p",{className:"text-[11px] sm:text-xs text-muted-foreground mt-0.5",children:"Create, track, and bill truck maintenance job cards with itemized spare parts & labour charges."})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto",children:[e.jsxs("div",{className:"relative w-full sm:w-64 md:w-72",children:[e.jsx(Ze,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx($,{placeholder:"Search Job Card #, Truck, Driver...",className:"pl-9 h-9 text-xs bg-background border-border/60 rounded-xl w-full",value:l,onChange:t=>m(t.target.value)})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto",children:[e.jsxs(_e,{value:Z,onValueChange:jt,children:[e.jsx(we,{className:"w-full sm:w-[130px] h-9 text-xs bg-background border-border/60 rounded-xl font-bold",children:e.jsx(ke,{placeholder:"All Statuses"})}),e.jsxs(Ce,{children:[e.jsx(E,{value:"all",children:"All Statuses"}),e.jsx(E,{value:"Created",children:"Created"}),e.jsx(E,{value:"Work In Progress",children:"Work In Progress"}),e.jsx(E,{value:"Parts Pending",children:"Parts Pending"}),e.jsx(E,{value:"Quality Inspected",children:"Quality Inspected"}),e.jsx(E,{value:"Closed",children:"Closed"})]})]}),e.jsxs(N,{type:"button",onClick:()=>{setLogProblemTruck("");setLogProblemOpen(!0)},size:"sm",variant:"outline",className:"rounded-xl h-9 text-xs font-bold border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 shadow-sm gap-1 flex items-center justify-center",children:[e.jsx(Ge,{className:"w-3.5 h-3.5 text-amber-400"})," Log Problem"]}),e.jsxs(N,{onClick:()=>{Ne(null),v(!0)},size:"sm",className:"col-span-2 sm:col-span-1 rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground shadow-md flex items-center justify-center",children:[e.jsx(gt,{className:"w-4 h-4 mr-1.5"})," New Job Card"]})]})]})]})`;

  if (code.includes(targetHeader)) {
    code = code.replace(targetHeader, replaceHeader);
    changed = true;
    console.log(`[${pth}] Made top action bar responsive on mobile.`);
  } else {
    console.log(`[${pth}] targetHeader not found!`);
  }

  if (changed) {
    try {
      parser.parse(code, { sourceType: 'module' });
      fs.writeFileSync(pth, code, 'utf8');
      console.log(`✅ [${pth}] Successfully validated and updated!`);
    } catch (err) {
      console.error(`❌ [${pth}] Syntax validation failed:`, err.message);
      process.exit(1);
    }
  }
}
