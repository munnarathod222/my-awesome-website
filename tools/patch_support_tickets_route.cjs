const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const targets = [
  'dist/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'dist/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js'
];

console.log('=== Patching Main Bundles for Support & Complaints Route & Sidebar ===');

for (const rel of targets) {
  const full = path.resolve(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;

  let code = fs.readFileSync(full, 'utf8');

  // 1. Add lazy import for SupportTicketsPage if not already present
  if (!code.includes('SupportTicketsPage_Lazy')) {
    const duTarget = 'ClientPortalPage-DuEOcerk.js"),__vite__mapDeps([73,1,2,4])))';
    if (code.includes(duTarget)) {
      code = code.replace(
        duTarget,
        duTarget + ',SupportTicketsPage_Lazy=h.lazy(()=>import("./SupportTicketsPage-C7kP9xL2.js"))'
      );
      console.log('✓ Added lazy import SupportTicketsPage_Lazy to:', rel);
    } else {
      console.warn('⚠️ Could not find duTarget in:', rel);
    }
  }

  // 2. Add route for /support-tickets and redirect for /complaints
  if (!code.includes('path:"/support-tickets"')) {
    const routeTarget = 'path:"/client-portal",element:e.jsx(me,{allowedRoles:["super_admin","admin","manager","client"],children:e.jsx(iw,{})})})';
    if (code.includes(routeTarget)) {
      code = code.replace(
        routeTarget,
        routeTarget + ',e.jsx(Y,{path:"/support-tickets",element:e.jsx(me,{allowedRoles:["super_admin","admin","manager","dispatcher","supervisor"],children:e.jsx(SupportTicketsPage_Lazy,{})})}),e.jsx(Y,{path:"/complaints",element:e.jsx(Xe,{to:"/support-tickets",replace:!0})})'
      );
      console.log('✓ Added /support-tickets and /complaints routes to:', rel);
    } else {
      console.warn('⚠️ Could not find routeTarget in:', rel);
    }
  }

  // 3. Add to Mobile drawer under CRM & Partners
  // Target: {label:"Vendor Registration Tracker",path:"/vendor-tracker",icon:mt,roles:["super_admin","admin","manager","dispatcher","supervisor"]}
  const mobTarget = '{label:"Vendor Registration Tracker",path:"/vendor-tracker",icon:mt,roles:["super_admin","admin","manager","dispatcher","supervisor"]}';
  if (code.includes(mobTarget) && !code.includes('path:"/support-tickets",icon:vr')) {
    code = code.replace(
      mobTarget,
      mobTarget + ',{label:"Support & Complaints",path:"/support-tickets",icon:vr,roles:["super_admin","admin","manager","dispatcher","supervisor"]}'
    );
    console.log('✓ Added Support & Complaints to Mobile Drawer in:', rel);
  }

  // 4. Add to Desktop sidebar under CRM & Partners
  // Target: {icon:mt,label:"Vendor Registration Tracker",path:"/vendor-tracker",roles:["super_admin","admin","manager","dispatcher","supervisor"]}
  const deskTarget = '{icon:mt,label:"Vendor Registration Tracker",path:"/vendor-tracker",roles:["super_admin","admin","manager","dispatcher","supervisor"]}';
  if (code.includes(deskTarget) && !code.includes('path:"/support-tickets",roles:')) {
    code = code.replace(
      deskTarget,
      deskTarget + ',{icon:vr,label:"Support & Complaints",path:"/support-tickets",roles:["super_admin","admin","manager","dispatcher","supervisor"]}'
    );
    console.log('✓ Added Support & Complaints to Desktop Sidebar in:', rel);
  }

  // Validate syntax
  try {
    esbuild.transformSync(code, { loader: 'js' });
    fs.writeFileSync(full, code, 'utf8');
    console.log('✓ Validated and saved:', rel);
  } catch (err) {
    console.error('❌ Validation failed for', rel, err.message);
    process.exit(1);
  }
}

console.log('=== All bundles patched and validated successfully! ===');
