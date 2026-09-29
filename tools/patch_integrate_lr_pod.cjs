const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('=== Patching Sidebar & Bundles for Unified Lorry Receipts & POD ===');

// 1. Patch tools/Sidebar.jsx and tools/Sidebar.patched.jsx
const sidebarFiles = ['tools/Sidebar.jsx', 'tools/Sidebar.patched.jsx'];
for (const sf of sidebarFiles) {
  if (fs.existsSync(sf)) {
    let content = fs.readFileSync(sf, 'utf8');
    
    // Replace duplicate LR and POD with single unified entry
    const oldEntriesRegex = /fleetOperationsItems\.push\(\{\s*icon:\s*FileBox,\s*label:\s*'Lorry Receipts \(LR\)',\s*path:\s*'\/trip-logs'[^}]+\}\);\s*fleetOperationsItems\.push\(\{\s*icon:\s*FileBox,\s*label:\s*'POD Management',\s*path:\s*'\/pod-management'[^}]+\}\);/;
    
    if (oldEntriesRegex.test(content)) {
      content = content.replace(oldEntriesRegex, `fleetOperationsItems.push({ icon: FileCheck, label: 'Lorry Receipts & POD', path: '/lorry-receipts', roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] });`);
      console.log('✓ Replaced LR and POD with unified entry in', sf);
    } else {
      // Direct replace
      content = content.replace("fleetOperationsItems.push({ icon: FileBox, label: 'Lorry Receipts (LR)', path: '/trip-logs', roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] });\n  fleetOperationsItems.push({ icon: FileBox, label: 'POD Management', path: '/pod-management', roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] });", "fleetOperationsItems.push({ icon: FileCheck, label: 'Lorry Receipts & POD', path: '/lorry-receipts', roles: ['super_admin','admin','manager','dispatcher','supervisor','user'] });");
      console.log('✓ Direct replaced in', sf);
    }

    // Active path check
    if (!content.includes("item.path === '/lorry-receipts' && location.pathname === '/pod-management'")) {
      content = content.replace(
        "location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path) )",
        "location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path) ) || (item.path === '/lorry-receipts' && location.pathname === '/pod-management')"
      );
      console.log('✓ Added active path matching in', sf);
    }

    fs.writeFileSync(sf, content, 'utf8');
  }
}

// 2. Patch tools/App.jsx
if (fs.existsSync('tools/App.jsx')) {
  let appContent = fs.readFileSync('tools/App.jsx', 'utf8');
  if (!appContent.includes('<Route path="/lorry-receipts"')) {
    appContent = appContent.replace(
      '<Route path="/pod-management" element={<ProtectedRoute allowedRoles={[\'super_admin\', \'admin\', \'manager\', \'dispatcher\']}><PODManagementPage /></ProtectedRoute>} />',
      '<Route path="/pod-management" element={<ProtectedRoute allowedRoles={[\'super_admin\', \'admin\', \'manager\', \'dispatcher\']}><PODManagementPage /></ProtectedRoute>} />\n                  <Route path="/lorry-receipts" element={<ProtectedRoute allowedRoles={[\'super_admin\', \'admin\', \'manager\', \'dispatcher\']}><PODManagementPage /></ProtectedRoute>} />\n                  <Route path="/lr" element={<Navigate to="/lorry-receipts" replace />} />'
    );
    fs.writeFileSync('tools/App.jsx', appContent, 'utf8');
    console.log('✓ Added /lorry-receipts and /lr routes to tools/App.jsx');
  }
}

// 3. Patch bundle files (index-C7kP9xL2.js and index-DLxf9dwO.js) across all 4 directories
const bundleDirs = [
  'dist/assets',
  'apps/web/dist/assets',
  'apps/api/dist/assets',
  'dist/apps/web/assets'
];

for (const dir of bundleDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
  
  for (const f of files) {
    const fullPath = path.join(dir, f);
    let bundle = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Desktop sidebar replacement
    const oldDesktopStr = 'u.push({icon:aa,label:"Lorry Receipts (LR)",path:"/trip-logs",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]}),u.push({icon:aa,label:"POD Management",path:"/pod-management",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]})';
    const newDesktopStr = 'u.push({icon:aa,label:"Lorry Receipts & POD",path:"/lorry-receipts",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]})';
    if (bundle.includes(oldDesktopStr)) {
      bundle = bundle.replace(oldDesktopStr, newDesktopStr);
      modified = true;
      console.log('✓ Patched desktop sidebar in', fullPath);
    }

    // Mobile drawer replacement
    const oldMobileStr = 'T.push({label:"Lorry Receipts (LR)",path:"/trip-logs",icon:aa,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]}),T.push({label:"POD Management",path:"/pod-management",icon:aa,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]})';
    const newMobileStr = 'T.push({label:"Lorry Receipts & POD",path:"/lorry-receipts",icon:aa,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]})';
    if (bundle.includes(oldMobileStr)) {
      bundle = bundle.replace(oldMobileStr, newMobileStr);
      modified = true;
      console.log('✓ Patched mobile drawer in', fullPath);
    }

    // Route replacement: make /lorry-receipts point to Cw (PODManagementPage-RbmOVLGd.js) instead of $j (TripLogsPage)
    const oldRouteStr = 'path:"/lorry-receipts",element:e.jsx(me,{allowedRoles:["super_admin","admin","manager","dispatcher","supervisor","user"],children:e.jsx($j,{})})';
    const newRouteStr = 'path:"/lorry-receipts",element:e.jsx(me,{allowedRoles:["super_admin","admin","manager","dispatcher","supervisor","user"],children:e.jsx(Cw,{})})';
    if (bundle.includes(oldRouteStr)) {
      bundle = bundle.replace(oldRouteStr, newRouteStr);
      modified = true;
      console.log('✓ Patched /lorry-receipts route to Cw in', fullPath);
    }

    // Active path matching in desktop sidebar
    if (bundle.includes('P.path!=="/dashboard"&&n.pathname.startsWith(P.path)') && !bundle.includes('P.path==="/lorry-receipts"&&n.pathname==="/pod-management"')) {
      bundle = bundle.replace(
        'P.path!=="/dashboard"&&n.pathname.startsWith(P.path)',
        'P.path!=="/dashboard"&&n.pathname.startsWith(P.path)||(P.path==="/lorry-receipts"&&n.pathname==="/pod-management")'
      );
      modified = true;
      console.log('✓ Added active tab check in desktop sidebar in', fullPath);
    }

    // Active path matching in mobile drawer
    if (bundle.includes('l.pathname===_.path') && !bundle.includes('_.path==="/lorry-receipts"&&l.pathname==="/pod-management"')) {
      bundle = bundle.replace(
        'l.pathname===_.path',
        '(l.pathname===_.path||_.path==="/lorry-receipts"&&l.pathname==="/pod-management")'
      );
      modified = true;
      console.log('✓ Added active tab check in mobile drawer in', fullPath);
    }

    if (modified) {
      // Validate with esbuild
      try {
        esbuild.transformSync(bundle, { loader: 'js' });
        fs.writeFileSync(fullPath, bundle, 'utf8');
        console.log('✓ Successfully validated and saved:', fullPath);
      } catch (err) {
        console.error('❌ Syntax validation failed for:', fullPath, err.message);
        process.exit(1);
      }
    } else {
      console.log('No modifications needed for:', fullPath);
    }
  }
}

console.log('=== All Sidebar & Bundle patches completed successfully! ===');
