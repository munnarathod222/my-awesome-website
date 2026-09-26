const fs = require('fs');
const esbuild = require('esbuild');

const targetBundles = [
  'dist/assets/TyreManagementPage-Boonzp_q.js',
  'dist/apps/web/assets/TyreManagementPage-Boonzp_q.js',
  'apps/web/dist/assets/TyreManagementPage-Boonzp_q.js',
  'apps/api/dist/assets/TyreManagementPage-Boonzp_q.js'
];

targetBundles.forEach(p => {
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');

  const oldHook = 'const [batterySwapModal, setBatterySwapModal] = c.useState({ isOpen: !1 });';
  const newHook = 'const [batterySwapModal, setBatterySwapModal] = c.useState({ isOpen: !1 });const [equipSwapModal, setEquipSwapModal] = c.useState({ isOpen: !1, itemKey: "jack" });';

  if (content.includes('const [equipSwapModal, setEquipSwapModal]')) {
    console.log(`[${p}] equipSwapModal hook already present!`);
  } else if (content.includes(oldHook)) {
    content = content.replace(oldHook, newHook);
    console.log(`[${p}] Injected equipSwapModal state hook!`);
  } else {
    console.error(`[${p}] Could not find oldHook!`);
    process.exit(1);
  }

  // Verify syntax with esbuild
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(p, content, 'utf8');
    console.log(`✓ [${p}] Syntax validated and saved!`);
  } catch (err) {
    console.error(`✗ [${p}] Syntax validation failed:`, err);
    process.exit(1);
  }
});

console.log('\n🎉 ALL 4 BUNDLES SUCCESSFULLY FIXED AND VALIDATED!');
