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
  const c = C;
  const _jsx = (e && e.jsx) ? e.jsx : (f, d, m) => (c.createElement ? c.createElement(f, d) : null);
  const _jsxs = (e && (e.jsxs || e.jsx)) ? (e.jsxs || e.jsx) : _jsx;
  const Fragment = (c && c.Fragment) ? c.Fragment : 'div';`
);

// Replace any remaining React hooks and JSX runtime identifiers
code = code.replace(/\b_Fragment\b/g, 'c.Fragment');
code = code.replace(/\buseState\b/g, 'c.useState');
code = code.replace(/\buseEffect\b/g, 'c.useEffect');
code = code.replace(/\buseMemo\b/g, 'c.useMemo');
code = code.replace(/\bReact\.Fragment\b/g, 'c.Fragment');

// Replace all jsx and jsxs calls with _jsx and _jsxs to prevent any shadowing with `(e)` event parameters
code = code.replace(/\be\.jsx\(/g, '_jsx(');
code = code.replace(/\be\.jsxs\(/g, '_jsxs(');
code = code.replace(/\b_jsx\(/g, '_jsx(');
code = code.replace(/\b_jsxs\(/g, '_jsxs(');
code = code.replace(/\bjsx\(/g, '_jsx(');
code = code.replace(/\bjsxs\(/g, '_jsxs(');

console.log('Compiled code length:', code.length);

// Verify that no bare jsx( or jsxs( or e.jsxs( remain
const bareJsxs = code.match(/[^a-zA-Z0-9_\.]jsxs\(/g) || [];
const bareJsx = code.match(/[^a-zA-Z0-9_\.]jsx\(/g) || [];
console.log('Remaining bare jsxs count:', bareJsxs.length);
console.log('Remaining bare jsx count:', bareJsx.length);

fs.writeFileSync('tools/ExecutiveAnalyticsHub.compiled.js', code, 'utf8');
console.log('Wrote tools/ExecutiveAnalyticsHub.compiled.js successfully!');
