const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const targetBundles = [
  'dist/assets/AttendanceManagerPage-BMjvcwkS.js',
  'apps/web/dist/assets/AttendanceManagerPage-BMjvcwkS.js',
  'apps/api/dist/assets/AttendanceManagerPage-BMjvcwkS.js',
  'dist/apps/web/assets/AttendanceManagerPage-BMjvcwkS.js'
];

let source = fs.readFileSync(targetBundles[0], 'utf8');

// 1. Status Colors Map
const oldStyleMap = 'Present:"bg-success/20 text-success border-success/30",Absent:"bg-destructive/20 text-destructive border-destructive/30",Leave:"bg-warning/20 text-warning border-warning/30","Half Day":"bg-orange-500/20 text-orange-500 border-orange-500/30","Work From Home":"bg-blue-500/20 text-blue-500 border-blue-500/30"';

const newStyleMap = 'Present:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold",Absent:"bg-rose-500/20 text-rose-400 border-rose-500/30 font-semibold","Weekly off":"bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-semibold",Leave:"bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold","On trip":"bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-bold","Available":"bg-teal-500/20 text-teal-400 border-teal-500/30 font-bold","Driver replacement required":"bg-red-500/25 text-red-400 border-red-500/60 font-black tracking-wide animate-pulse","Half Day":"bg-orange-500/20 text-orange-400 border-orange-500/30","Work From Home":"bg-blue-500/20 text-blue-400 border-blue-500/30"';

if (!source.includes(oldStyleMap)) {
  console.error('ERROR: oldStyleMap not found in bundle!');
  process.exit(1);
}
source = source.replaceAll(oldStyleMap, newStyleMap);
console.log('Step 1 (Style Maps replaced): SUCCESS');

// 2. Hours worked calculation on attendance creation
const oldHours = 'hours_worked:v==="Half Day"?4:v==="Present"?8:0';
const newHours = 'hours_worked:(v==="Present"||v==="On trip"||v==="Available")?8:v==="Half Day"?4:0';
if (source.includes(oldHours)) {
  source = source.replace(oldHours, newHours);
  console.log('Step 2 (Hours worked logic updated): SUCCESS');
} else {
  console.warn('WARNING: oldHours not found!');
}

// 3. Status Dropdowns in Modals (Bulk Mark & Edit)
const oldModalOptions = '[e.jsx(f,{value:"Present",children:"Present"}),e.jsx(f,{value:"Absent",children:"Absent"}),e.jsx(f,{value:"Leave",children:"Leave"}),e.jsx(f,{value:"Half Day",children:"Half Day"}),e.jsx(f,{value:"Work From Home",children:"Work From Home"})]';

const newModalOptions = '[e.jsx(f,{value:"Present",children:"🟢 Present"}),e.jsx(f,{value:"On trip",children:"🚛 On trip"}),e.jsx(f,{value:"Available",children:"⚡ Available (Standby)"}),e.jsx(f,{value:"Absent",children:"🔴 Absent"}),e.jsx(f,{value:"Weekly off",children:"🔵 Weekly off"}),e.jsx(f,{value:"Leave",children:"🟡 Leave"}),e.jsx(f,{value:"Driver replacement required",children:"🚨 Driver replacement required"})]';

if (!source.includes(oldModalOptions)) {
  console.error('ERROR: oldModalOptions not found!');
  process.exit(1);
}
source = source.replaceAll(oldModalOptions, newModalOptions);
console.log('Step 3 (Modal Status Options replaced): SUCCESS');

// 4. Status Filter Dropdown on Page
const oldFilterOptions = '[e.jsx(f,{value:"all",children:"All Status"}),e.jsx(f,{value:"Present",children:"Present"}),e.jsx(f,{value:"Absent",children:"Absent"}),e.jsx(f,{value:"Leave",children:"Leave"}),e.jsx(f,{value:"Half Day",children:"Half Day"})]';

const newFilterOptions = '[e.jsx(f,{value:"all",children:"All Statuses"}),e.jsx(f,{value:"Present",children:"🟢 Present"}),e.jsx(f,{value:"On trip",children:"🚛 On trip"}),e.jsx(f,{value:"Available",children:"⚡ Available"}),e.jsx(f,{value:"Absent",children:"🔴 Absent"}),e.jsx(f,{value:"Weekly off",children:"🔵 Weekly off"}),e.jsx(f,{value:"Leave",children:"🟡 Leave"}),e.jsx(f,{value:"Driver replacement required",children:"🚨 Replacement Required"})]';

if (!source.includes(oldFilterOptions)) {
  console.error('ERROR: oldFilterOptions not found!');
  process.exit(1);
}
source = source.replace(oldFilterOptions, newFilterOptions);
console.log('Step 4 (Filter Status Options replaced): SUCCESS');

// 5. Header Title & Description
const oldTitle = 'e.jsx("title",{children:"Staff Attendance | Dashboard"})';
const newTitle = 'e.jsx("title",{children:"Driver Attendance & Fleet HR Hub | Dashboard"})';
source = source.replace(oldTitle, newTitle);

const oldHeader = 'e.jsx("h1",{className:"text-3xl font-bold tracking-tight text-foreground",style:{letterSpacing:"-0.02em"},children:"Attendance Hub"}),e.jsx("p",{className:"text-muted-foreground mt-1",children:"Manage staff attendance, daily register, and view historical presence."})';
const newHeader = 'e.jsx("h1",{className:"text-3xl font-bold tracking-tight text-foreground",style:{letterSpacing:"-0.02em"},children:"Driver Attendance & Fleet HR Hub"}),e.jsx("p",{className:"text-muted-foreground mt-1",children:"MNC-grade driver attendance, active route tracking, standby pilots, and urgent replacement dispatcher."})';

if (!source.includes(oldHeader)) {
  console.error('ERROR: oldHeader not found!');
  process.exit(1);
}
source = source.replace(oldHeader, newHeader);
console.log('Step 5 (Header updated): SUCCESS');

// 6. Stats calculation update
const oldStats = '$=d.useMemo(()=>{const s=k(new Date,"yyyy-MM-dd"),l=y.filter(w=>w.date.startsWith(s));return{totalStaff:n.length,present:l.filter(w=>w.status==="Present"||w.status==="Work From Home").length,absent:l.filter(w=>w.status==="Absent").length,leave:l.filter(w=>w.status==="Leave").length}},[y,n])';

const newStats = '$=d.useMemo(()=>{const s=k(new Date,"yyyy-MM-dd"),l=y.filter(w=>(w?.date||"").startsWith(s)),rp=l.filter(w=>w.status==="Driver replacement required"),rpn=rp.map(w=>w.expand?.staff_member?.name||"Driver").filter(Boolean).slice(0,3).join(", ");return{totalStaff:n.length,present:l.filter(w=>w.status==="Present"||w.status==="Work From Home").length,onTrip:l.filter(w=>w.status==="On trip").length,available:l.filter(w=>w.status==="Available").length,absent:l.filter(w=>w.status==="Absent").length,leave:l.filter(w=>w.status==="Leave"||w.status==="Weekly off").length,replacementRequired:rp.length,replacementNames:rpn+(rp.length>3?` +${rp.length-3} more`:"")}},[y,n])';

if (!source.includes(oldStats)) {
  console.error('ERROR: oldStats not found!');
  process.exit(1);
}
source = source.replace(oldStats, newStats);
console.log('Step 6 (Stats calculation updated): SUCCESS');

// 7. KPI Cards Grid & Driver Replacement Alert Banner
const oldGrid = 'e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-4 sm:p-6 flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0",children:e.jsx(fe,{className:"w-5 h-5 sm:w-6 sm:h-6 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs sm:text-sm font-medium text-muted-foreground",children:"Total Staff"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight",children:$.totalStaff})]})]})}),e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-4 sm:p-6 flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-success/10 flex items-center justify-center shrink-0",children:e.jsx(ge,{className:"w-5 h-5 sm:w-6 sm:h-6 text-success"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs sm:text-sm font-medium text-muted-foreground",children:"Present Today"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-success",children:$.present})]})]})}),e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-4 sm:p-6 flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0",children:e.jsx(pe,{className:"w-5 h-5 sm:w-6 sm:h-6 text-destructive"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs sm:text-sm font-medium text-muted-foreground",children:"Absent Today"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-destructive",children:$.absent})]})]})}),e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-4 sm:p-6 flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0",children:e.jsx(je,{className:"w-5 h-5 sm:w-6 sm:h-6 text-warning"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs sm:text-sm font-medium text-muted-foreground",children:"On Leave"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-warning",children:$.leave})]})]})})]})';

const newGrid = 'e.jsxs("div",{className:"space-y-4",children:[' +
  '$.replacementRequired>0&&e.jsxs("div",{className:"bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-rose-950/20 animate-in slide-in-from-top-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-11 h-11 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold shrink-0 text-xl",children:"🚨"}),e.jsxs("div",{children:[e.jsxs("h3",{className:"font-bold text-base text-rose-400 flex items-center gap-2",children:["URGENT: Driver Replacement Required (",$.replacementRequired," Unassigned)"]}),e.jsxs("p",{className:"text-xs sm:text-sm text-muted-foreground mt-0.5",children:["Drivers needing immediate replacement: ",e.jsx("span",{className:"font-semibold text-rose-300",children:$.replacementNames||"Assigned drivers"}),". Ready standby pilots available: ",e.jsx("span",{className:"font-bold text-teal-400",children:$.available})]})]})]}),e.jsxs(j,{size:"sm",variant:"destructive",onClick:()=>D(s=>({...s,status:"Driver replacement required"})),className:"rounded-xl shadow font-semibold shrink-0",children:["View Affected Drivers (",$.replacementRequired,")"]})]}),' +
  'e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4",children:[' +
    // Card 1: Total Fleet / Drivers
    'e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0",children:e.jsx(fe,{className:"w-5 h-5 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Total Fleet"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight",children:$.totalStaff})]})]})}),' +
    // Card 2: Present Today
    'e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0",children:e.jsx(ge,{className:"w-5 h-5 text-emerald-400"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Present"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-emerald-400",children:$.present})]})]})}),' +
    // Card 3: On Trip
    'e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0",children:e.jsx("svg",{className:"w-5 h-5 text-cyan-400",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"}),e.jsx("path",{d:"M15 18H9"}),e.jsx("path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"}),e.jsx("circle",{cx:"17",cy:"18",r:"2"}),e.jsx("circle",{cx:"7",cy:"18",r:"2"})]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"On Trip"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-cyan-400",children:$.onTrip})]})]})}),' +
    // Card 4: Available (Standby)
    'e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0",children:e.jsx("svg",{className:"w-5 h-5 text-teal-400",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Available"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-teal-400",children:$.available})]})]})}),' +
    // Card 5: Absent / Leave / Off
    'e.jsx(I,{className:"border-border shadow-sm bg-card hover:shadow-md transition-shadow",children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0",children:e.jsx(je,{className:"w-5 h-5 text-amber-400"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Off / Leave"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-amber-400",children:$.absent+$.leave})]})]})}),' +
    // Card 6: Replacement Required
    'e.jsx(I,{className:`border shadow-sm bg-card hover:shadow-md transition-shadow ${$.replacementRequired>0?"border-red-500/50 bg-red-500/5":"border-border"}`,children:e.jsxs(z,{className:"p-3 sm:p-5 flex items-center gap-3",children:[e.jsx("div",{className:`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${$.replacementRequired>0?"bg-red-500/20 text-red-400":"bg-muted text-muted-foreground"}`,children:e.jsx(me,{className:`w-5 h-5 ${$.replacementRequired>0?"text-red-500 animate-pulse":""}`})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Replacement Req"}),e.jsx("p",{className:`text-xl sm:text-2xl font-bold tracking-tight ${$.replacementRequired>0?"text-red-500 font-black":""}`,children:$.replacementRequired})]})]})})' +
  ']})' +
']})';

if (!source.includes(oldGrid)) {
  console.error('ERROR: oldGrid not found in bundle!');
  process.exit(1);
}
source = source.replace(oldGrid, newGrid);
console.log('Step 7 (KPI Cards Grid & Alert Banner updated): SUCCESS');

// Verify syntax with TypeScript compiler
console.log('Verifying modified bundle with TypeScript AST parser...');
const sf = ts.createSourceFile('test.js', source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
console.log('TypeScript AST parse completed. Syntax errors count:', sf.parseDiagnostics ? sf.parseDiagnostics.length : 0);

if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
  console.error('Syntax errors found:', sf.parseDiagnostics.slice(0, 5));
  process.exit(1);
}

// Write to all 4 target bundles
targetBundles.forEach(filePath => {
  fs.writeFileSync(filePath, source, 'utf8');
  console.log(`Updated: ${filePath} (${fs.statSync(filePath).size} bytes)`);
});

console.log('ALL 4 ATTENDANCE BUNDLES SUCCESSFULLY UPDATED!');
