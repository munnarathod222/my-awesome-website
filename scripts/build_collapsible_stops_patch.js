const fs = require('fs');
const vm = require('vm');

console.log('--- Building Collapsible Dynamic Stops Patch ---');

// Backup original index-B9k2Lm7P.js if not yet backed up
if (!fs.existsSync('scratch/orig_index-B9k2Lm7P.js')) {
  fs.copyFileSync('dist/assets/index-B9k2Lm7P.js', 'scratch/orig_index-B9k2Lm7P.js');
  console.log('✓ Backed up dist/assets/index-B9k2Lm7P.js to scratch/orig_index-B9k2Lm7P.js');
}

let chunk = fs.readFileSync('scratch/orig_index-B9k2Lm7P.js', 'utf8');
console.log('Original chunk length:', chunk.length);

const startIdx = chunk.indexOf('function eg({stops:s=[]');
const nextFnIdx = chunk.indexOf('function Jt(s,t="00:00"');

if (startIdx === -1 || nextFnIdx === -1) {
  console.error('eg function boundaries not found in index-B9k2Lm7P.js!');
  process.exit(1);
}

const origEg = chunk.slice(startIdx, nextFnIdx);
console.log('Found original eg, length:', origEg.length);

// Extract parts from origEg:
const returnStr = 'return e.jsxs("div",{className:ge("space-y-4 p-4 rounded-2xl bg-muted/30 border border-border",i),children:[';
const returnIdx = origEg.indexOf(returnStr);
if (returnIdx === -1) {
  console.error('returnStr not found in origEg!');
  process.exit(1);
}

let funcsPart = origEg.slice(0, returnIdx);

// Add isCollapsed state to funcsPart
const stateTarget = 'const[o,l]=h.useState(1),[c,d]=h.useState(1);';
if (!funcsPart.includes(stateTarget)) {
  console.error('stateTarget not found in funcsPart!');
  process.exit(1);
}
funcsPart = funcsPart.replace(stateTarget, 'const[o,l]=h.useState(1),[c,d]=h.useState(1),[isCollapsed,setIsCollapsed]=h.useState(!0);');

// Extract child 2 (selectors bar)
const child2Marker = 'e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-card border border-border"';
const child3Marker = 'e.jsx("div",{className:"space-y-2.5",children:s.map(';
const child4Marker = 'e.jsxs("div",{className:"flex items-center justify-between pt-1"';

const child2Idx = origEg.indexOf(child2Marker);
const child3Idx = origEg.indexOf(child3Marker);
const child4Idx = origEg.indexOf(child4Marker);

if (child2Idx === -1 || child3Idx === -1 || child4Idx === -1) {
  console.error('Child markers not found in origEg!');
  process.exit(1);
}

// Child 2 snippet
const child2Snippet = origEg.slice(child2Idx, child3Idx - 1); // remove trailing comma

// Child 3 snippet
const child3Snippet = origEg.slice(child3Idx, child4Idx - 1); // remove trailing comma

// Child 4 snippet (ends 4 chars before origEg ends, removing the root `]})}`)
const child4Snippet = origEg.slice(child4Idx, origEg.length - 4);

// Extract presets from child 1 (ends 4 chars before child2Marker):
const presetsMarker = 'e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[e.jsx("span",{className:"text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1",children:"Presets:"})';
const presetsIdx = origEg.indexOf(presetsMarker);
const origPresetsDiv = origEg.slice(presetsIdx, child2Idx - 4);

const newPresetsBar = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-border/70",children:[e.jsx("span",{className:"text-[10px] font-bold text-muted-foreground uppercase tracking-wider",children:"Quick Timing Presets:"}),${origPresetsDiv}]})`;

// Construct the new collapsible eg function!
// Using unicode escapes: \uD83D\uDCCD for 📍, \u25BC for ▼, \u25B2 for ▲
const newEg = `${funcsPart}return e.jsxs("div",{className:ge("p-3.5 rounded-2xl bg-muted/30 border border-border transition-all duration-300",i),children:[e.jsxs("div",{onClick:()=>setIsCollapsed(k=>!k),className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none group",children:[e.jsxs("div",{className:"flex items-center gap-2.5 min-w-0",children:[e.jsx(Le,{className:"bg-primary/20 text-primary border-primary/30 text-xs font-extrabold shrink-0",children:n}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h4",{className:"text-sm font-extrabold text-foreground group-hover:text-primary transition-colors flex items-center gap-2",children:"Dynamic Stop & Schedule Timing Configurator"}),e.jsx("p",{className:"text-[11px] text-muted-foreground truncate",children:"Configure scheduled target times for each dock and drop to track SLA delays accurately"})]})]}),e.jsxs("div",{className:"flex items-center gap-2 self-start sm:self-auto shrink-0",children:[e.jsxs("span",{className:"text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap",children:["\\uD83D\\uDCCD ",o," Dock",o>1?"s":"",", ",c," Drop",c>1?"s":""]}),e.jsxs(q,{type:"button",size:"sm",variant:"outline",className:"h-7 text-xs font-bold px-2.5 rounded-lg border-border/80 group-hover:border-primary/40 flex items-center gap-1.5 transition-all",onClick:ev=>{ev.stopPropagation();setIsCollapsed(k=>!k);},children:[e.jsx("span",{children:isCollapsed?"Configure Stops":"Collapse"}),e.jsx("span",{className:"text-[10px] font-bold",children:isCollapsed?"\\u25BC":"\\u25B2"})]})]})]}),!isCollapsed&&e.jsxs("div",{className:"space-y-4 pt-3 mt-3 border-t border-border/50 animate-in fade-in duration-200",children:[${newPresetsBar},${child2Snippet},${child3Snippet},${child4Snippet}]})]});}`;

console.log('Verifying newEg syntax...');
try {
  new vm.Script('(' + newEg + ')');
  console.log('✓ Syntax verification passed: newEg is 100% syntactically valid JavaScript!');
} catch (e) {
  console.error('Syntax verification failed for newEg:', e);
  process.exit(1);
}

chunk = chunk.slice(0, startIdx) + newEg + chunk.slice(nextFnIdx);
console.log('New full chunk length:', chunk.length);

// Write to all 4 distribution roots
const distTargets = [
  'dist/assets/index-B9k2Lm7P.js',
  'dist/apps/web/assets/index-B9k2Lm7P.js',
  'apps/api/dist/assets/index-B9k2Lm7P.js',
  'apps/web/dist/assets/index-B9k2Lm7P.js'
];

distTargets.forEach(p => {
  fs.writeFileSync(p, chunk, 'utf8');
  console.log(`✓ Updated ${p} (${chunk.length} bytes)`);
});

console.log('🎉 Collapsible Dynamic Stop & Schedule Timing Configurator successfully built & verified across all bundles!');
