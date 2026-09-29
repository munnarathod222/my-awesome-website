const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

function patchBundleFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Patch Ng (GROUP_ICON)
  if (!content.includes('"Future Upgrades":$t')) {
    content = content.replace(
      'Administration:Fa}',
      'Administration:Fa,"Future Upgrades":$t}'
    );
  }

  // Patch _g (GROUP_COLOR)
  if (!content.includes('"Future Upgrades":"text-purple-400"')) {
    content = content.replace(
      'Administration:"text-slate-400"}',
      'Administration:"text-slate-400","Future Upgrades":"text-purple-400"}'
    );
  }

  // Patch NAV 2 (Desktop Sidebar):
  let startX = content.indexOf('const x=[{title:"Client Portal"');
  if (startX === -1) {
    startX = content.indexOf('const x=[{title:"Main & Analytics"');
  }
  if (startX !== -1) {
    const endX = content.indexOf('];return e.jsx(sd,{delayDuration:0', startX);
    if (endX !== -1) {
      const newX = `const x=[{title:"Main & Analytics",items:[{icon:Bs,label:"Dashboard",path:"/dashboard",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:jr,label:"Bidding Intelligence",path:"/bidding-intelligence",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:gc,label:"Analytics",path:"/analytics",roles:["super_admin","admin","manager"]},{icon:qn,label:"Trip Overview",path:"/dashboard/trip-overview",roles:["super_admin","admin","manager"]},{icon:bc,label:"Client Analysis",path:"/client-analysis",roles:["super_admin","admin","manager"]}]},{title:"Fleet & Operations",items:u},{title:"Finance & Accounts",items:[{icon:Qt,label:"Cashbook",path:"/cashbook",roles:["super_admin","admin","manager"]},{icon:Qe,label:"Expenses",path:"/expenses",roles:["super_admin","admin","manager"]},{icon:Cs,label:"Payment Requests",path:"/payment-requests",roles:["super_admin","admin","manager"]},{icon:At,label:"FASTag Management",path:"/fastag",roles:["super_admin","admin","manager"]},{icon:At,label:"Credit Cards",path:"/credit-cards",roles:["super_admin","admin"]},{icon:bt,label:"Company Vault",path:"/company-vault",roles:["super_admin","admin","manager"]},{icon:Us,label:"EMI Calculator",path:"/emi-calculator",roles:["super_admin","admin","manager"]},{icon:Qe,label:"Payroll",path:"/payroll",roles:["super_admin","admin"]},{icon:Qe,label:"Quotes & B2B Contracts",path:"/quotes-manager",roles:["super_admin","admin","manager","dispatcher","user"]}]},{title:"Staff & HR",items:[{icon:It,label:"Employees",path:"/employees",roles:["super_admin","admin","manager","supervisor"]},{icon:aa,label:"Employee Docs",path:"/employee-docs",roles:["super_admin","admin","supervisor"]},{icon:Da,label:"Attendance Hub",path:"/dashboard/attendance",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:$s,label:"Recruitment Portal",path:"/recruitment",roles:["super_admin","admin","manager"]}]},{title:"CRM & Partners",items:[{icon:It,label:"Clients List",path:"/clients",roles:["super_admin","admin","manager"]},{icon:vr,label:"Credit Control",path:"/credit-control",roles:["super_admin","admin","manager"]},{icon:mt,label:"Vendor Registration Tracker",path:"/vendor-tracker",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:vc,label:"Contacts Directory",path:"/contacts",roles:["super_admin","admin","manager","dispatcher"]}]},{title:"Studio & Tools",items:[{icon:ks,label:"Business Mail",path:"/business-mail",roles:["super_admin","admin","manager","dispatcher"]},{icon:Da,label:"Calendar",path:"/calendar",roles:["super_admin","admin","manager","dispatcher","supervisor"]}]},{title:"Administration",items:[{icon:It,label:"User Management",path:"/dashboard/users",roles:["superuser","super_admin","admin"]}]},{title:"Future Upgrades",items:[{icon:mt,label:"Client Portal",path:"/client-portal",roles:["client","super_admin","admin","manager"]},{icon:$t,label:"AI Freight Marketplace",path:"/marketplace",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]},{icon:Us,label:"Vehicle TCO & ROI",path:"/vehicle-tco",roles:["super_admin","admin","manager"]},{icon:yc,label:"Leaderboard",path:"/leaderboard",roles:["super_admin","admin","manager"]},{icon:Wn,label:"Driver Scorecard",path:"/driver-scorecard",roles:["super_admin","admin","manager"]},{icon:Qt,label:"Invoice Matching",path:"/invoice-matching",roles:["super_admin","admin","manager","dispatcher"]},{icon:Qt,label:"GST ITC Tax",path:"/gst-itc",roles:["super_admin","admin","manager"]},{icon:vr,label:"Insurance Manager",path:"/insurance-manager",roles:["super_admin","admin","manager","dispatcher"]},{icon:mt,label:"Transport CRM",path:"/transport-crm",roles:["super_admin","admin","manager","dispatcher"]},{icon:jr,label:"Sales & Vendor Leads",path:"/sales-leads",roles:["super_admin","admin","manager","dispatcher"]},{icon:jc,label:"Branding Hub",path:"/branding-hub",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]},{icon:wr,label:"Reminders",path:"/reminders",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:Aa,label:"To-Do List",path:"/todo",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:bt,label:"Audit & Security Logs",path:"/dashboard/audit-logs",roles:["superuser","super_admin"]},{icon:Qe,label:"Reports Center",path:"/reports",roles:["super_admin","admin"]},{icon:Fa,label:"Settings",path:"/dashboard/profile",roles:["super_admin","admin","manager","dispatcher","supervisor"]},{icon:wc,label:"Data Backup & Export",path:"/data-backup",roles:["super_admin","admin","manager","dispatcher","supervisor","user"]}]}]`;

      content = content.slice(0, startX) + newX + content.slice(endX + 1);
      console.log(`[NAV 2 OK] ${filePath}`);
    }
  }

  // Patch NAV 1 (Mobile Drawer):
  let start1 = content.indexOf('[{title:"Client Portal"', 380000);
  if (start1 === -1) {
    start1 = content.indexOf('[{title:"Main & Analytics"', 380000);
  }
  if (start1 !== -1 && start1 < 410000) {
    const endMarker = 'icon:wc,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]}]}]';
    const end1 = content.indexOf(endMarker, start1);
    if (end1 !== -1) {
      const fullEnd1 = end1 + endMarker.length;
      const new1 = `[{title:"Main & Analytics",items:[{label:"Dashboard",path:"/dashboard",icon:Bs,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Bidding Intelligence",path:"/bidding-intelligence",icon:jr,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Analytics",path:"/analytics",icon:gc,roles:["super_admin","admin","manager"]},{label:"Trip Overview",path:"/dashboard/trip-overview",icon:qn,roles:["super_admin","admin","manager"]},{label:"Client Analysis",path:"/client-analysis",icon:bc,roles:["super_admin","admin","manager"]}]},{title:"Fleet & Operations",items:T},{title:"Finance & Accounts",items:[{label:"Cashbook",path:"/cashbook",icon:Qt,roles:["super_admin","admin","manager"]},{label:"Expenses",path:"/expenses",icon:Qe,roles:["super_admin","admin","manager"]},{label:"Payment Requests",path:"/payment-requests",icon:Cs,roles:["super_admin","admin","manager"]},{label:"FASTag Management",path:"/fastag",icon:At,roles:["super_admin","admin","manager"]},{label:"Credit Cards",path:"/credit-cards",icon:At,roles:["super_admin","admin"]},{label:"Company Vault",path:"/company-vault",icon:bt,roles:["super_admin","admin","manager"]},{label:"EMI Calculator",path:"/emi-calculator",icon:Us,roles:["super_admin","admin","manager"]},{label:"Payroll",path:"/payroll",icon:Qe,roles:["super_admin","admin"]},{label:"Quotes Manager",path:"/quotes-manager",icon:Qe,roles:["super_admin","admin","manager"]}]},{title:"Staff & HR",items:[{label:"Employees",path:"/employees",icon:It,roles:["super_admin","admin","manager","supervisor"]},{label:"Employee Docs",path:"/employee-docs",icon:aa,roles:["super_admin","admin","supervisor"]},{label:"Attendance Hub",path:"/dashboard/attendance",icon:Da,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Recruitment Portal",path:"/recruitment",icon:$s,roles:["super_admin","admin","manager"]}]},{title:"CRM & Partners",items:[{label:"Clients List",path:"/clients",icon:It,roles:["super_admin","admin","manager"]},{label:"Credit Control",path:"/credit-control",icon:vr,roles:["super_admin","admin","manager"]},{label:"Vendor Registration Tracker",path:"/vendor-tracker",icon:mt,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Contacts Directory",path:"/contacts",icon:vc,roles:["super_admin","admin","manager","dispatcher"]}]},{title:"Studio & Tools",items:[{label:"Business Mail",path:"/business-mail",icon:ks,roles:["super_admin","admin","manager","dispatcher"]},{label:"Calendar",path:"/calendar",icon:Da,roles:["super_admin","admin","manager","dispatcher","supervisor"]}]},{title:"Administration",items:[{label:"User Management",path:"/dashboard/users",icon:It,roles:["superuser","super_admin","admin"]}]},{title:"Future Upgrades",items:[{label:"Client Portal",path:"/client-portal",icon:mt,roles:["client","super_admin","admin","manager"]},{label:"AI Freight Marketplace",path:"/marketplace",icon:$t,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]},{label:"Vehicle TCO & ROI",path:"/vehicle-tco",icon:Us,roles:["super_admin","admin","manager"]},{label:"Leaderboard",path:"/leaderboard",icon:yc,roles:["super_admin","admin","manager"]},{label:"Driver Scorecard",path:"/driver-scorecard",icon:Wn,roles:["super_admin","admin","manager"]},{label:"Invoice Matching",path:"/invoice-matching",icon:Qt,roles:["super_admin","admin","manager","dispatcher"]},{label:"GST ITC Tax",path:"/gst-itc",icon:Qt,roles:["super_admin","admin","manager"]},{label:"Insurance Manager",path:"/insurance-manager",icon:vr,roles:["super_admin","admin","manager","dispatcher"]},{label:"Transport CRM",path:"/transport-crm",icon:mt,roles:["super_admin","admin","manager","dispatcher"]},{label:"Sales & Vendor Leads",path:"/sales-leads",icon:jr,roles:["super_admin","admin","manager","dispatcher"]},{label:"Branding Hub",path:"/branding-hub",icon:jc,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]},{label:"Reminders",path:"/reminders",icon:wr,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"To-Do List",path:"/todo",icon:Aa,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Audit & Security Logs",path:"/dashboard/audit-logs",icon:bt,roles:["superuser","super_admin"]},{label:"Reports Center",path:"/reports",icon:Qe,roles:["super_admin","admin"]},{label:"Settings",path:"/dashboard/profile",icon:Fa,roles:["super_admin","admin","manager","dispatcher","supervisor"]},{label:"Data Backup & Export",path:"/data-backup",icon:wc,roles:["super_admin","admin","manager","dispatcher","supervisor","user"]}]}]`;

      content = content.slice(0, start1) + new1 + content.slice(fullEnd1);
      console.log(`[NAV 1 OK] ${filePath}`);
    }
  }

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    console.log(`[PASS] Syntax valid for ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.error(`[ERROR] Syntax failed for ${filePath}:`, err.message);
    process.exit(1);
  }
}

// Target bundles
const bundles = [
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js'
];

bundles.forEach(b => patchBundleFile(path.resolve(b)));

console.log('Bundle patching completed successfully.');
