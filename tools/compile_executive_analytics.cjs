const esbuild = require('esbuild');
const fs = require('fs');

const srcCode = fs.readFileSync('tools/ExecutiveAnalyticsHub.jsx', 'utf8');

// Transform with automatic jsx
const transformed = esbuild.transformSync(srcCode, {
  loader: 'jsx',
  jsx: 'automatic'
});

let code = transformed.code;

// Remove imports from "react/jsx-runtime" and "react"
code = code.replace(/import\s*\{[^}]+\}\s*from\s*["']react\/jsx-runtime["'];?/g, '');
code = code.replace(/import\s*React,\s*\{[^}]+\}\s*from\s*["']react["'];?/g, '');
code = code.replace(/import\s*\{[^}]+\}\s*from\s*["']react["'];?/g, '');

// Replace export default function ExecutiveAnalyticsHub() with function ExecutiveAnalyticsHub()
code = code.replace(
  /export\s+default\s+function\s+ExecutiveAnalyticsHub\s*\(\s*\)\s*\{/,
  `function ExecutiveAnalyticsHub() {
  const jsx = e.jsx;
  const jsxs = e.jsxs;
  const Fragment = c.Fragment;`
);

// Replace any remaining React hooks and JSX runtime identifiers
code = code.replace(/\b_jsx\b/g, 'e.jsx');
code = code.replace(/\b_jsxs\b/g, 'e.jsxs');
code = code.replace(/\b_Fragment\b/g, 'c.Fragment');
code = code.replace(/\buseState\b/g, 'c.useState');
code = code.replace(/\buseEffect\b/g, 'c.useEffect');
code = code.replace(/\buseMemo\b/g, 'c.useMemo');
code = code.replace(/\bReact\.Fragment\b/g, 'c.Fragment');

// Now also replace bare jsx( and jsxs(
code = code.replace(/\bjsx\(/g, 'e.jsx(');
code = code.replace(/\bjsxs\(/g, 'e.jsxs(');

console.log('Compiled code length:', code.length);

// Verify that no bare jsx( or jsxs( remain without e.
const remainingJsxs = code.match(/[^a-zA-Z0-9_\.]jsxs\(/g) || [];
const remainingJsx = code.match(/[^a-zA-Z0-9_\.]jsx\(/g) || [];
console.log('Remaining bare jsxs count:', remainingJsxs.length);
console.log('Remaining bare jsx count:', remainingJsx.length);

fs.writeFileSync('tools/ExecutiveAnalyticsHub.compiled.js', code, 'utf8');
console.log('Wrote tools/ExecutiveAnalyticsHub.compiled.js successfully!');
