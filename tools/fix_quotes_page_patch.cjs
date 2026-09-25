const fs = require('fs');
const esbuild = require('esbuild');

const quotePageFiles = [
  'dist/assets/QuotesManagerPage-6LqGA_3o.js',
  'dist/apps/web/assets/QuotesManagerPage-6LqGA_3o.js',
  'apps/web/dist/assets/QuotesManagerPage-6LqGA_3o.js',
  'apps/api/dist/assets/QuotesManagerPage-6LqGA_3o.js'
];

// Rebuild transpiled code
const rawTabJsx = fs.readFileSync('tools/RateSlabsManagerTab.jsx', 'utf8');
const tabJsxForBundle = rawTabJsx
  .replace(/import\s+React,\s*\{[^}]*\}\s*from\s*['"]react['"];?/g, '')
  .replace(/export\s+default\s+function\s+RateSlabsManagerTab/g, 'function RateSlabsManagerTab')
  .replace(/export\s+function\s+calculateQuotePrice/g, 'function calculateQuotePrice')
  .replace(/export\s+const\s+DEFAULT_SLABS_DATA/g, 'const DEFAULT_SLABS_DATA')
  .replace(/export\s+/g, '');

const wrappedJsx = 'const { useState, useEffect, useMemo } = c;\n' + tabJsxForBundle;
const transRes = esbuild.transformSync(wrappedJsx, {
  loader: 'jsx',
  jsxFactory: 'c.createElement',
  jsxFragment: 'c.Fragment'
});

const newTabCode = transRes.code;

quotePageFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const saveIdx = content.indexOf('Save Agreement');
  if (saveIdx !== -1) {
    const closeIdx = content.indexOf('}', saveIdx);
    content = content.slice(0, closeIdx + 1) + '\n\n' + newTabCode + '\nexport{Gt as default};\n';
    fs.writeFileSync(file, content, 'utf8');
    console.log('✓ Cleanly replaced RateSlabsManagerTab in', file);
  } else {
    console.error('Save Agreement marker not found in', file);
  }
});

// Now validate syntax
quotePageFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  esbuild.transformSync(c, { loader: 'js' });
  console.log('✓ 100% VALID SYNTAX for', file);
});
