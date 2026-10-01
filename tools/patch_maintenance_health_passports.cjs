const fs = require('fs');
const parser = require('@babel/parser');

const targetBundles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js'
];

console.log('=== Step 2: Embedding Vehicle Health Passports into Fleet Maintenance ===');

const importStatement = 'import VehicleHealthPassportsView from "./VehicleHealthPassportsPage-DCM6I_uE.js";\n';

for (const pth of targetBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  // 1. Add import if not present
  if (!code.includes('VehicleHealthPassportsView')) {
    code = importStatement + code;
    console.log('✓ Added VehicleHealthPassportsView import in:', pth);
  }

  // 2. Enhance tab default state to detect ?tab=health_passports
  const targetInit = '[Ae,$e]=p.useState("job_cards")';
  const replaceInit = '[Ae,$e]=p.useState((typeof window!=="undefined"&&(new URLSearchParams(window.location.search).get("tab")==="health_passports"||window.location.pathname.includes("health-passports"))?"health_passports":"job_cards"))';
  if (code.includes(targetInit)) {
    code = code.replace(targetInit, replaceInit);
    console.log('✓ Enhanced tab state for health_passports in:', pth);
  }

  // 3. Add tab trigger button right after service_logs trigger
  const targetTrigger = 'children:[e.jsx(At,{className:"w-4 h-4"})," Service Logs",e.jsx(O,{variant:"secondary",className:"ml-1 opacity-80 bg-background/20 text-current",children:T.length})]})}';
  const passportTrigger = ',e.jsxs(pe,{value:"health_passports",className:"gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all shrink-0 text-emerald-400",children:[e.jsx(ut,{className:"w-4 h-4 text-emerald-400"})," Vehicle Health Passports"]})';

  if (code.includes(targetTrigger) && !code.includes('value:"health_passports"')) {
    code = code.replace(targetTrigger, targetTrigger + passportTrigger);
    console.log('✓ Added health_passports tab trigger in:', pth);
  }

  // 4. Add tab content right after service_logs tab content
  const targetContent = 'e.jsx(he,{value:"service_logs",className:"m-0 space-y-6 animate-in fade-in duration-300"';
  const passportContent = 'e.jsx(he,{value:"health_passports",className:"m-0 space-y-6 animate-in fade-in duration-300",children:e.jsx(VehicleHealthPassportsView,{})}),';

  if (code.includes(targetContent) && !code.includes('he,{value:"health_passports"')) {
    code = code.replace(targetContent, passportContent + targetContent);
    console.log('✓ Added health_passports tab content in:', pth);
  }

  // Validate AST
  try {
    parser.parse(code, { sourceType: 'module' });
    fs.writeFileSync(pth, code, 'utf8');
    console.log('🎉 Successfully saved and verified Maintenance bundle:', pth);
  } catch (err) {
    console.error('❌ AST parse error on', pth, err.message);
    process.exit(1);
  }
}

console.log('=== Fleet Maintenance integration complete! ===');
