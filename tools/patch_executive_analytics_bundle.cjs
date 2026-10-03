const fs = require('fs');
const esbuild = require('esbuild');

const compCode = fs.readFileSync('tools/ExecutiveAnalyticsHub.compiled.js', 'utf8');

// Ensure function has `const c = C;` at top
const patchedCompCode = compCode.replace(
  'function ExecutiveAnalyticsHub() {',
  'function ExecutiveAnalyticsHub() {\n  const c = C;'
);

const targetFiles = [
  'dist/assets/AnalyticsHub-CYZIBHI0.js',
  'apps/web/dist/assets/AnalyticsHub-CYZIBHI0.js',
  'dist/apps/web/assets/AnalyticsHub-CYZIBHI0.js',
  'apps/api/dist/assets/AnalyticsHub-CYZIBHI0.js'
];

targetFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  let original = fs.readFileSync(filePath, 'utf8');

  // If already patched with ExecutiveAnalyticsHub, clean it up
  if (original.includes('function ExecutiveAnalyticsHub()')) {
    console.log(`Re-patching ${filePath}...`);
    const startIdx = original.indexOf('function ExecutiveAnalyticsHub()');
    const endIdx = original.indexOf('import{j as e');
    if (startIdx < endIdx) {
      original = original.substring(endIdx);
    }
  }

  // Prepend ExecutiveAnalyticsHub
  let patched = patchedCompCode + '\n' + original;

  // In `us=()=>{`, replace with rendering ExecutiveAnalyticsHub
  const targetUs = 'us=()=>{';
  const replaceUs = 'us=()=>{return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});';

  if (patched.includes(targetUs)) {
    patched = patched.replace(targetUs, replaceUs);
  }

  // Verify syntax with esbuild
  try {
    esbuild.transformSync(patched, { loader: 'js' });
    console.log(`Verified JS syntax for ${filePath}: OK!`);
  } catch (err) {
    console.error(`Syntax error in patched ${filePath}:`, err.message);
    throw err;
  }

  fs.writeFileSync(filePath, patched, 'utf8');
  console.log(`Successfully patched ${filePath} (Size: ${patched.length} bytes)`);
});

console.log('All AnalyticsHub bundles patched successfully!');
