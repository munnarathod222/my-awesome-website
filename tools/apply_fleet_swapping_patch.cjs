const fs = require('fs');
const esbuild = require('esbuild');

const swapperCode = fs.readFileSync('tools/FleetHardwareSwapper.compiled.js', 'utf8');

const targetBundles = [
  'dist/assets/TyreManagementPage-Boonzp_q.js',
  'dist/apps/web/assets/TyreManagementPage-Boonzp_q.js',
  'apps/web/dist/assets/TyreManagementPage-Boonzp_q.js',
  'apps/api/dist/assets/TyreManagementPage-Boonzp_q.js'
];

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Skipping missing ${bundlePath}`);
    return;
  }
  let content = fs.readFileSync(bundlePath, 'utf8');

  // 1. Insert swapperCode right before function Ts()
  const tsAnchor = 'function Ts(){';
  if (!content.includes(tsAnchor)) {
    console.error(`Error: ${tsAnchor} not found in ${bundlePath}`);
    process.exit(1);
  }
  content = content.replace(tsAnchor, `${swapperCode}\n${tsAnchor}`);

  // 2. Add state hooks inside Ts
  const stateAnchor = 'function Ts(){';
  const stateInsert = `function Ts(){const [crossTyreModal, setCrossTyreModal] = c.useState({ isOpen: !1, preselectedTyre: null });const [batterySwapModal, setBatterySwapModal] = c.useState({ isOpen: !1 });`;
  content = content.replace(stateAnchor, stateInsert);

  // 3. Add header action buttons
  const headerBtnAnchor = 'e.jsxs(_,{size:"sm",onClick:()=>v(!0),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1 h-8 px-2.5",children:[e.jsx(Re,{className:"w-3.5 h-3.5"})," Battery"]})';
  const headerButtonsInsert = `e.jsxs(_,{size:"sm",onClick:()=>setCrossTyreModal({isOpen:!0,preselectedTyre:null}),className:"rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Q,{className:"w-3.5 h-3.5 text-indigo-500"})," Swap Tyre Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap Battery Across Trucks"]}),${headerBtnAnchor}`;

  if (content.includes(headerBtnAnchor)) {
    content = content.replace(headerBtnAnchor, headerButtonsInsert);
    console.log(`[${bundlePath}] Injected header action buttons`);
  } else {
    console.warn(`[${bundlePath}] Warning: headerBtnAnchor not found`);
  }

  // 4. Add battery tab card action button
  const batteryCardAnchor = 'e.jsx(_,{size:"sm",onClick:()=>v(!0),className:"rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold",children:"Edit Details"})';
  const batteryCardInsert = `${batteryCardAnchor},e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 ml-2",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap / Transfer Battery to Another Truck"]})`;

  if (content.includes(batteryCardAnchor)) {
    content = content.replace(batteryCardAnchor, batteryCardInsert);
    console.log(`[${bundlePath}] Injected battery tab card swap button`);
  } else {
    console.warn(`[${bundlePath}] Warning: batteryCardAnchor not found`);
  }

  // 5. Add modals render at bottom of Ts
  const bottomAnchor = 'e.jsx(bs,{isOpen:!!B,onClose:()=>O(null),document:B,collectionName:"trucks"})';
  const bottomInsert = `${bottomAnchor},e.jsx(CrossTruckTyreSwapModal,{isOpen:crossTyreModal.isOpen,onClose:()=>setCrossTyreModal({isOpen:!1,preselectedTyre:null}),allTrucks:s,currentTruck:l,currentTyres:u,preselectedTyre:crossTyreModal.preselectedTyre,onSuccess:se}),e.jsx(CrossTruckBatterySwapModal,{isOpen:batterySwapModal.isOpen,onClose:()=>setBatterySwapModal({isOpen:!1}),allTrucks:s,currentTruck:l,onSuccess:se})`;

  if (content.includes(bottomAnchor)) {
    content = content.replace(bottomAnchor, bottomInsert);
    console.log(`[${bundlePath}] Injected modal renderings`);
  } else {
    console.warn(`[${bundlePath}] Warning: bottomAnchor not found`);
  }

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`✓ [${bundlePath}] Successfully patched and syntax validated!`);
  } catch (err) {
    console.error(`✗ [${bundlePath}] Syntax validation failed:`, err);
    process.exit(1);
  }
});
