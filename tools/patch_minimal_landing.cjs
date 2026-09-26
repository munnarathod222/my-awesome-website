const fs = require('fs');
const esbuild = require('esbuild');

const targetBundles = [
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js'
];

const minimalRj = `rj=()=>{const{isAuthenticated:s}=xt();return e.jsxs(e.Fragment,{children:[e.jsx(Lt,{children:e.jsx("title",{children:"Jai Bhavani Cargo"})}),e.jsx("main",{className:"min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans selection:bg-slate-800 relative overflow-hidden",children:[e.jsx("div",{className:"absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_70%)] pointer-events-none"}),e.jsxs("div",{className:"w-full max-w-sm mx-auto text-center space-y-7 p-8 rounded-3xl border border-slate-800/80 bg-slate-900/50 shadow-2xl backdrop-blur-md relative z-10",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 mx-auto flex items-center justify-center text-lg shadow-inner",children:"🚛"}),e.jsx("h1",{className:"text-2xl font-black tracking-tight text-white",children:"Jai Bhavani Cargo"}),e.jsx("p",{className:"text-xs text-slate-400 font-medium tracking-wide",children:"Transport & Logistics Services"})]}),e.jsx("div",{className:"w-16 h-px bg-slate-800 mx-auto"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-[11px] font-semibold text-slate-400 uppercase tracking-wider",children:"Contact / Inquiries"}),e.jsxs("a",{href:"tel:+917794072244",className:"inline-flex items-center justify-center gap-2 text-base font-mono font-bold text-white hover:text-cyan-400 transition-colors py-1.5 px-4 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/60",children:[e.jsx("span",{className:"text-slate-400",children:"📞"}),"+91 7794072244"]})]}),e.jsx("div",{className:"pt-2",children:s?e.jsx(ke,{to:"/dashboard",className:"inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/20",children:"Enter Dashboard ➔"}):e.jsx(ke,{to:"/login",className:"inline-flex items-center justify-center w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all",children:"Admin Login"})}),e.jsx("p",{className:"text-[10px] text-slate-500 font-mono pt-3",children:"© 2026 Jai Bhavani Cargo. All rights reserved."})]})]})]})}`;

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) return;
  console.log(`\n========================================`);
  console.log(`Processing ${bundlePath}...`);
  let content = fs.readFileSync(bundlePath, 'utf8');

  // 1. Replace the huge rj component with minimalRj
  const rjStart = content.indexOf('rj=()=>{const{isAuthenticated:s}=xt()');
  const njIdx = content.indexOf(',nj=', rjStart);

  if (rjStart !== -1 && njIdx !== -1) {
    content = content.substring(0, rjStart) + minimalRj + content.substring(njIdx);
    console.log(`✓ Replaced rj with clean, minimal domain placeholder component`);
  } else {
    console.log(`Note: rj start or nj not found in ${bundlePath}`);
  }

  // 2. Hide public Navbar vg and Footer wg when on landing page (n.pathname === "/")
  const oldLayoutVar = 'm=r&&!d;';
  const newLayoutVar = 'm=r&&!d,isHome=n.pathname==="/"||n.pathname==="";';
  if (content.includes(oldLayoutVar)) {
    content = content.replace(oldLayoutVar, newLayoutVar);
    console.log(`✓ Added isHome check to Layout`);
  }

  const oldNavbar = '!c&&e.jsx(vg,{})';
  const newNavbar = '!c&&!isHome&&e.jsx(vg,{})';
  if (content.includes(oldNavbar)) {
    content = content.replace(oldNavbar, newNavbar);
    console.log(`✓ Hid public Navbar vg when on landing page`);
  }

  const oldFooter = 'd&&!c&&e.jsx(wg,{})';
  const newFooter = 'd&&!c&&!isHome&&e.jsx(wg,{})';
  if (content.includes(oldFooter)) {
    content = content.replace(oldFooter, newFooter);
    console.log(`✓ Hid public Footer wg when on landing page`);
  }

  // 3. Validate with esbuild
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`🎉 100% VALID SYNTAX for ${bundlePath}`);
  } catch (err) {
    console.error(`❌ Syntax error in ${bundlePath}:`, err);
    process.exit(1);
  }
});

console.log('\nAll index bundles patched with minimal landing page & verified!');
