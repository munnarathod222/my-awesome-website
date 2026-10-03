const fs = require('fs');
const esbuild = require('esbuild');

const compCode = fs.readFileSync('tools/ExecutiveAnalyticsHub.compiled.js', 'utf8');

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

  // Strip any existing ExecutiveAnalyticsHub prepended previously
  if (original.includes('function ExecutiveAnalyticsHub()')) {
    console.log(`Cleaning previous patch in ${filePath}...`);
    const importIdx = original.indexOf('import{j as e');
    if (importIdx !== -1) {
      original = original.substring(importIdx);
    }
  }

  // Find all imports at top
  // In the original file, imports are at the very beginning
  // Let's find where the imports end (the last import statement)
  let lastImportEnd = 0;
  const importRegex = /import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g;
  let match;
  while ((match = importRegex.exec(original)) !== null) {
    lastImportEnd = match.index + match[0].length;
  }

  let patched;
  if (lastImportEnd > 0) {
    const imports = original.substring(0, lastImportEnd);
    let restOfCode = original.substring(lastImportEnd);

    // In `us=()=>{`, replace with rendering ExecutiveAnalyticsHub
    const targetUs = 'us=()=>{';
    const replaceUs = 'us=()=>{return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});';
    if (restOfCode.includes(targetUs)) {
      restOfCode = restOfCode.replace(targetUs, replaceUs);
    }

    // Place imports FIRST, then ExecutiveAnalyticsHub, then the rest
    patched = imports + '\n\n' + compCode + '\n\n' + restOfCode;
  } else {
    // Fallback if import regex didn't match
    const targetUs = 'us=()=>{';
    const replaceUs = 'us=()=>{return e.jsx("div",{className:"min-h-screen bg-[#0B111E] text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",children:e.jsx(ExecutiveAnalyticsHub,{})});';
    if (original.includes(targetUs)) {
      original = original.replace(targetUs, replaceUs);
    }
    patched = compCode + '\n' + original;
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
