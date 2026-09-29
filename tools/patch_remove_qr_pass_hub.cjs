const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// 1. Update tools/Sidebar.jsx
const sidebarFiles = ['tools/Sidebar.jsx', 'tools/Sidebar.patched.jsx'];
sidebarFiles.forEach(sf => {
  if (fs.existsSync(sf)) {
    let code = fs.readFileSync(sf, 'utf8');
    // Remove Vehicle QR Pass Hub line
    code = code.replace(/\s*\{\s*icon:\s*QrCode,\s*label:\s*['"]Vehicle QR Pass Hub['"].*?\},?/g, '');
    // Update active matching
    code = code.replace(/&&\s*!location\.search\.includes\(['"]view=qr_pass['"]\)/g, '');
    fs.writeFileSync(sf, code, 'utf8');
    console.log(`[PASS] Updated ${sf}`);
  }
});

// 2. Update bundle files
const bundleFiles = [
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js'
];

bundleFiles.forEach(bf => {
  if (fs.existsSync(bf)) {
    let content = fs.readFileSync(bf, 'utf8');

    // 1) Remove from desktop sidebar list:
    // {icon:Pa,label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",roles:["super_admin","admin","dispatcher","manager","supervisor"]},
    const qrDesktop = '{icon:Pa,label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",roles:["super_admin","admin","dispatcher","manager","supervisor"]},';
    if (content.includes(qrDesktop)) {
      content = content.replace(qrDesktop, '');
      console.log(`[PASS] Removed desktop QR Pass Hub from ${bf}`);
    } else {
      // try without trailing comma if it was last
      const qrDesktopNoComma = '{icon:Pa,label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",roles:["super_admin","admin","dispatcher","manager","supervisor"]}';
      if (content.includes(qrDesktopNoComma)) {
        content = content.replace(qrDesktopNoComma, '');
        console.log(`[PASS] Removed desktop QR Pass Hub (no comma) from ${bf}`);
      }
    }

    // 2) Remove from mobile drawer list:
    // {label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",icon:Pa,roles:["super_admin","admin","dispatcher","manager","supervisor"]},
    const qrMobile = '{label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",icon:Pa,roles:["super_admin","admin","dispatcher","manager","supervisor"]},';
    if (content.includes(qrMobile)) {
      content = content.replace(qrMobile, '');
      console.log(`[PASS] Removed mobile QR Pass Hub from ${bf}`);
    } else {
      const qrMobileNoComma = '{label:"Vehicle QR Pass Hub",path:"/truck-docs?view=qr_pass",icon:Pa,roles:["super_admin","admin","dispatcher","manager","supervisor"]}';
      if (content.includes(qrMobileNoComma)) {
        content = content.replace(qrMobileNoComma, '');
        console.log(`[PASS] Removed mobile QR Pass Hub (no comma) from ${bf}`);
      }
    }

    // 3) Remove active override condition so Vehicle Docs stays highlighted on ?view=qr_pass
    // &&!n.search.includes("view=qr_pass")
    content = content.replaceAll('&&!n.search.includes("view=qr_pass")', '');

    // Validate JS syntax
    try {
      esbuild.transformSync(content, { loader: 'js' });
      fs.writeFileSync(bf, content, 'utf8');
      console.log(`[SYNTAX PASS] ${bf}`);
    } catch (err) {
      console.error(`[SYNTAX FAIL] ${bf}:`, err.message);
      process.exit(1);
    }
  }
});

console.log('Vehicle QR Pass Hub successfully removed and integrated into Vehicle Docs.');
