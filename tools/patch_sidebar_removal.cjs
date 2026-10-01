const fs = require('fs');
const parser = require('@babel/parser');

const targetBundles = [
  'dist/assets/index-DLxf9dwO.js',
  'dist/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-C7kP9xL2.js'
];

console.log('=== Step 1: Removing Vehicle Health Passports and Credit Control from Sidebar ===');

const vhpPattern = /\{icon:[a-zA-Z0-9_$]+,label:"Vehicle Health Passports",path:"\/vehicle-health-passports",roles:\[[^\]]+\]\},?/g;
const ccPattern1 = /\{label:"Credit Control",path:"\/credit-control",icon:[a-zA-Z0-9_$]+,roles:\[[^\]]+\]\},?/g;
const ccPattern2 = /\{icon:[a-zA-Z0-9_$]+,label:"Credit Control",path:"\/credit-control",roles:\[[^\]]+\]\},?/g;

for (const pth of targetBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  let modified = false;

  if (vhpPattern.test(code)) {
    code = code.replace(vhpPattern, '');
    modified = true;
    console.log('✓ Removed Vehicle Health Passports from sidebar in:', pth);
  } else {
    console.log('Vehicle Health Passports not found in:', pth);
  }

  if (ccPattern1.test(code) || ccPattern2.test(code)) {
    code = code.replace(ccPattern1, '').replace(ccPattern2, '');
    modified = true;
    console.log('✓ Removed Credit Control from sidebar in:', pth);
  } else {
    console.log('Credit Control not found in:', pth);
  }

  // Rename "Reminders" to "Payment Reminders" on the sidebar
  if (code.includes('label:"Reminders",path:"/reminders"')) {
    code = code.replace('label:"Reminders",path:"/reminders"', 'label:"Payment Reminders",path:"/reminders"');
    modified = true;
    console.log('✓ Renamed Reminders to Payment Reminders in:', pth);
  }
  if (code.includes(',label:"Reminders",path:"/reminders"')) {
    code = code.replace(',label:"Reminders",path:"/reminders"', ',label:"Payment Reminders",path:"/reminders"');
    modified = true;
  }
  const remIconPattern = /icon:([a-zA-Z0-9_$]+),label:"Reminders",path:"\/reminders"/g;
  if (remIconPattern.test(code)) {
    code = code.replace(remIconPattern, 'icon:$1,label:"Payment Reminders",path:"/reminders"');
    modified = true;
    console.log('✓ Renamed icon-first Reminders to Payment Reminders in:', pth);
  }

  if (modified) {
    try {
      parser.parse(code, { sourceType: 'module' });
      fs.writeFileSync(pth, code, 'utf8');
      console.log('🎉 Successfully saved and verified:', pth);
    } catch (err) {
      console.error('❌ AST parse error on', pth, err.message);
      process.exit(1);
    }
  }
}

console.log('=== Sidebar patching complete! ===');
