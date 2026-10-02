const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const targetBundles = [
  'dist/assets/RoutesPage-DE0lcTrU.js',
  'apps/web/dist/assets/RoutesPage-DE0lcTrU.js',
  'apps/api/dist/assets/RoutesPage-DE0lcTrU.js',
  'dist/apps/web/assets/RoutesPage-DE0lcTrU.js'
];

const badSnippet = 'boost net margin above 30%."]})]})]})})]})]}),e.jsx(Le,{value:"corridors",className:"space-y-6 m-0 p-0",children:e.jsx(RouteCorridorManagerTab,{})})]}),e.jsx(Nt,';

const cleanReplacement = 'boost net margin above 30%."]})]})]})})]})' +
  ',e.jsx(Le,{value:"corridors",className:"space-y-6 m-0 p-0",children:e.jsx(RouteCorridorManagerTab,{})})' +
  ']}),e.jsx(Nt,';

const correctTail = '"})' + ']})' + ']})' + '})' + ']})' + ']})' + '}';
const exportTarget = 'export{At as default};';

let compCode = fs.readFileSync('tools/RouteCorridorManagerTab.jsx', 'utf8');
compCode = compCode.replace('const RouteCorridorManagerTab = () => {', 'function RouteCorridorManagerTab() {');

for (const targetPath of targetBundles) {
  console.log(`\n========================================`);
  console.log(`Processing bundle: ${targetPath}`);
  let s = fs.readFileSync(targetPath, 'utf8');

  // 1. Remove any existing RouteCorridorManagerTab declaration at the end
  const componentIdx = s.indexOf('const RouteCorridorManagerTab');
  if (componentIdx !== -1) s = s.slice(0, componentIdx) + exportTarget;
  const funcIdx = s.indexOf('function RouteCorridorManagerTab');
  if (funcIdx !== -1) s = s.slice(0, funcIdx) + exportTarget;

  // 2. Ensure trigger button is present in TabsList
  const triggerTarget = 'e.jsxs(De,{value:"leaderboard",className:"rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-2 border border-amber-500/30 text-amber-400",children:[e.jsx(Fe,{className:"w-4 h-4 text-amber-400"})," Route Profitability Leaderboard & Ranking"]})';
  const corridorTrigger = ',e.jsxs(De,{value:"corridors",className:"rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-2 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors shadow-sm",children:[e.jsx("span",{className:"text-base"},"📍")," Route Corridor Database & Spot Quoting"]})';
  
  if (!s.includes('value:"corridors",className:"rounded-xl px-4 py-2 font-bold text-xs flex items-center gap-2 border border-emerald-500/30')) {
    s = s.replace(triggerTarget, triggerTarget + corridorTrigger);
    console.log('TabsTrigger for corridors added.');
  } else {
    console.log('TabsTrigger for corridors already present.');
  }

  // 3. Fix the TabsContent nesting inside ct (Tabs)
  if (s.includes(badSnippet)) {
    s = s.replace(badSnippet, cleanReplacement);
    console.log('Replaced badSnippet with cleanReplacement inside ct.');
  } else {
    console.log('badSnippet not directly found, verifying if already patched...');
  }

  // 4. Fix the tail after Delete Route dialog
  const delIdx = s.lastIndexOf('Delete Route');
  if (delIdx === -1) {
    console.error(`ERROR: Delete Route not found in ${targetPath}`);
    process.exit(1);
  }
  s = s.slice(0, delIdx + 'Delete Route'.length) + correctTail + exportTarget;
  console.log('Fixed dialog and Fragment tail structure.');

  // 5. Append hoisted RouteCorridorManagerTab component
  s = s.replace(exportTarget, '\n' + compCode + '\n' + exportTarget);
  console.log('Appended function RouteCorridorManagerTab before export.');

  // 6. Validate brackets
  const stack = [];
  let inString = false;
  let quoteChar = '';
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const prevChar = s[i - 1];
    if (inString) {
      if (char === quoteChar && prevChar !== '\\') inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quoteChar = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') stack.push({ char, i });
    else if (char === ')' || char === ']' || char === '}') {
      const top = stack.pop();
      const expected = (top?.char === '(' ? ')' : top?.char === '[' ? ']' : '}');
      if (!top || expected !== char) {
        console.error(`BRACKET MISMATCH at ${i} in ${targetPath}: got '${char}', expected '${expected}' from opening '${top?.char}' at ${top?.i}`);
        process.exit(1);
      }
    }
  }
  if (stack.length > 0) {
    console.error(`UNCLOSED BRACKETS in ${targetPath}: ${stack.length}`);
    process.exit(1);
  }
  console.log('Brackets check: 100% BALANCED.');

  // 7. Validate TypeScript AST
  const sf = ts.createSourceFile('bundle.js', s, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
  if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
    console.error(`TypeScript parse diagnostics in ${targetPath}:`, sf.parseDiagnostics);
    process.exit(1);
  }
  console.log('TypeScript AST check: 0 SYNTAX ERRORS.');

  // 8. Write file
  fs.writeFileSync(targetPath, s, 'utf8');
  console.log(`Successfully saved ${targetPath} (${fs.statSync(targetPath).size} bytes)`);
}

console.log('\nALL 4 BUNDLES ARE CLEANLY PATCHED, PROPERLY NESTED, AND VERIFIED!');
