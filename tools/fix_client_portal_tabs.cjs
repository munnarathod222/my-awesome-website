const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const targets = [
  'dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/web/dist/assets/ClientPortalPage-DuEOcerk.js',
  'apps/api/dist/assets/ClientPortalPage-DuEOcerk.js',
  'dist/apps/web/assets/ClientPortalPage-DuEOcerk.js'
];

console.log('=== Fixing Tabs nesting in ClientPortalPage ===');

for (const rel of targets) {
  const full = path.resolve(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;

  let code = fs.readFileSync(full, 'utf8');

  // 1. Fix Tab Trigger nesting
  // Remove incorrectly nested trigger from inside bidding trigger
  const badTrig = 'e.jsxs(P,{value:"bidding",className:"rounded-lg text-xs font-bold px-3 py-1.5 border border-amber-500/30 text-amber-400",children:[e.jsx(O,{className:"w-3 h-3 mr-1"}),e.jsxs(P,{value:"support",className:"rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 text-rose-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(oe,{className:"w-3.5 h-3.5 mr-1"}),"Support & Complaints"]})," Lane Bidding & Rates"]})';
  
  const goodTrig = 'e.jsxs(P,{value:"bidding",className:"rounded-lg text-xs font-bold px-3 py-1.5 border border-amber-500/30 text-amber-400",children:[e.jsx(O,{className:"w-3 h-3 mr-1"})," Lane Bidding & Rates"]}),e.jsxs(P,{value:"support",className:"rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 text-rose-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(oe,{className:"w-3.5 h-3.5 mr-1"}),"Support & Complaints"]})';

  if (code.includes(badTrig)) {
    code = code.replace(badTrig, goodTrig);
    console.log('✓ Fixed Tab Trigger nesting in:', rel);
  }

  // 2. Fix Tab Content: move A (TabsContent) inside Tabs (Ye)
  const badContentPattern = ',e.jsx(A,{value:"support",className:"p-4 sm:p-6 space-y-6",children:e.jsx(ClientPortalSupportTab,{client:x,trips:h,currentUser:i})})';
  
  // Find where it was wrongly placed:
  const wronglyPlaced = ']})})' + badContentPattern;
  
  // The correct placement is right BEFORE ']})})' (so it is the last child of Tabs (Ye)):
  const correctPlacement = badContentPattern + ']})})';

  if (code.includes(wronglyPlaced)) {
    code = code.replace(wronglyPlaced, correctPlacement);
    console.log('✓ Fixed TabsContent position (now inside Tabs container) in:', rel);
  } else {
    console.warn('⚠️ Could not find wronglyPlaced pattern in:', rel);
  }

  // Validate syntax with esbuild
  try {
    esbuild.transformSync(code, { loader: 'js' });
    fs.writeFileSync(full, code, 'utf8');
    console.log('✓ Successfully validated and saved:', rel);
  } catch (err) {
    console.error('❌ Validation failed for', rel, err.message);
    process.exit(1);
  }
}

console.log('=== Tabs nesting fix complete! ===');
