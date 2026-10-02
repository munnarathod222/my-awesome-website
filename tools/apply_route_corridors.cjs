const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const targetBundles = [
  'dist/assets/RoutesPage-DE0lcTrU.js',
  'apps/web/dist/assets/RoutesPage-DE0lcTrU.js',
  'apps/api/dist/assets/RoutesPage-DE0lcTrU.js',
  'dist/apps/web/assets/RoutesPage-DE0lcTrU.js'
];

let source = fs.readFileSync('apps/web/dist/assets/RoutesPage-DE0lcTrU.js', 'utf8');

// 1. Add TabsTrigger for corridors
const triggerTarget = 'e.jsxs(De,{value:"leaderboard",className:"rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-2 border border-amber-500/30 text-amber-400",children:[e.jsx(Fe,{className:"w-4 h-4 text-amber-400"})," Route Profitability Leaderboard & Ranking"]})';

if (!source.includes(triggerTarget)) {
  console.error('ERROR: TabsTrigger for leaderboard not found!');
  process.exit(1);
}

const corridorTrigger = triggerTarget + ',' +
  'e.jsxs(De,{value:"corridors",className:"rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-2 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors shadow-sm",children:[e.jsx("span",{className:"text-base"},"📍")," Route Corridor Database & Spot Quoting"]})';

source = source.replace(triggerTarget, corridorTrigger);
console.log('Step 1 (TabsTrigger added): SUCCESS');

// 2. Add TabsContent for corridors
const targetSnippet = 'boost net margin above 30%."]})]})]})})]})]})]}),e.jsx(Nt,';
const replacementSnippet = 'boost net margin above 30%."]})]})]})})]})]}),' +
  'e.jsx(Le,{value:"corridors",className:"space-y-6 m-0 p-0",children:e.jsx(RouteCorridorManagerTab,{})})' +
  ']}),e.jsx(Nt,';

if (!source.includes(targetSnippet)) {
  console.error('ERROR: targetSnippet not found in bundle!');
  process.exit(1);
}

source = source.replace(targetSnippet, replacementSnippet);
console.log('Step 2 (TabsContent for corridors added): SUCCESS');

// 3. Read component from tools/RouteCorridorManagerTab.jsx
const componentCode = fs.readFileSync('tools/RouteCorridorManagerTab.jsx', 'utf8');

const exportTarget = 'export{At as default};';
if (!source.includes(exportTarget)) {
  console.error('ERROR: exportTarget not found in bundle!');
  process.exit(1);
}

source = source.replace(exportTarget, componentCode + '\n' + exportTarget);
console.log('Step 3 (RouteCorridorManagerTab component inserted): SUCCESS');

// 4. Verify AST with TypeScript compiler
console.log('Verifying modified bundle with TypeScript AST parser...');
const sf = ts.createSourceFile('test.js', source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
console.log('TypeScript AST parse completed. Syntax errors count:', sf.parseDiagnostics ? sf.parseDiagnostics.length : 0);

if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
  console.error('Syntax errors found:', sf.parseDiagnostics.slice(0, 5));
  process.exit(1);
}

// 5. Write to all 4 target bundles
targetBundles.forEach(filePath => {
  fs.writeFileSync(filePath, source, 'utf8');
  console.log(`Updated: ${filePath} (${fs.statSync(filePath).size} bytes)`);
});

console.log('ALL 4 ROUTES PAGE BUNDLES SUCCESSFULLY UPDATED WITH ROUTE CORRIDOR DATABASE & SPOT QUOTING!');
