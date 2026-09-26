const fs = require('fs');
const esbuild = require('esbuild');

// 1. Prepare swapper module code
let swapperCode = fs.readFileSync('tools/FleetHardwareSwapper.compiled.js', 'utf8');

// Strip import statements
swapperCode = swapperCode.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?\s*/g, '');
// Strip export keywords
swapperCode = swapperCode.replace(/export\s+function\s+/g, 'function ');
// Prepend alias for WrenchIcon using bundle's imported 'as'
swapperCode = `const WrenchIcon = as;\n${swapperCode}\n`;

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

  // If already partially patched, clean out old swapper code before Ts()
  const modalIndex = content.indexOf('function CrossTruckTyreSwapModal');
  const tsIndex = content.indexOf('function Ts(){');
  if (modalIndex !== -1 && tsIndex !== -1 && modalIndex < tsIndex) {
    // Strip everything from modalIndex up to tsIndex
    content = content.slice(0, modalIndex) + content.slice(tsIndex);
    console.log(`[${bundlePath}] Cleaned previous swapper injection.`);
  }

  // Also clean any previous state hook injection in Ts()
  content = content.replace(
    /function Ts\(\)\{[^}]*const\{truckId:N\}=is\(\)/,
    'function Ts(){const{truckId:N}=is()'
  );

  // 1. Insert swapperCode right before function Ts(){
  const tsAnchor = 'function Ts(){';
  if (!content.includes(tsAnchor)) {
    console.error(`Error: ${tsAnchor} not found in ${bundlePath}`);
    process.exit(1);
  }
  content = content.replace(tsAnchor, `${swapperCode}\n${tsAnchor}`);

  // 2. Add state hooks inside Ts
  const stateAnchor = 'function Ts(){const{truckId:N}=is()';
  const stateInsert = `function Ts(){const [crossTyreModal, setCrossTyreModal] = c.useState({ isOpen: !1, preselectedTyre: null });const [batterySwapModal, setBatterySwapModal] = c.useState({ isOpen: !1 });const [equipSwapModal, setEquipSwapModal] = c.useState({ isOpen: !1, itemKey: "jack" });const{truckId:N}=is()`;
  content = content.replace(stateAnchor, stateInsert);

  // 3. Header Action Buttons
  // Look for the battery button in the header
  const batteryHeaderBtn = 'e.jsxs(_,{size:"sm",onClick:()=>v(!0),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1 h-8 px-2.5",children:[e.jsx(Re,{className:"w-3.5 h-3.5"})," Battery"]})';
  
  // Clean out any previously injected buttons around batteryHeaderBtn
  const previousHeaderRegex = /e\.jsxs\(_,\{size:"sm",onClick:\(\)=>setCrossTyreModal[^\)]+\}\),e\.jsxs\(_,\{size:"sm",onClick:\(\)=>setBatterySwapModal[^\)]+\}\),/;
  content = content.replace(previousHeaderRegex, '');

  const newHeaderButtons = `e.jsxs(_,{size:"sm",onClick:()=>setCrossTyreModal({isOpen:!0,preselectedTyre:null}),className:"rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Q,{className:"w-3.5 h-3.5 text-indigo-500"})," Swap Tyre Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap Battery Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setEquipSwapModal({isOpen:!0,itemKey:"jack"}),className:"rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(as,{className:"w-3.5 h-3.5 text-cyan-500"})," Swap Tools / Kit Across Trucks"]}),${batteryHeaderBtn}`;

  if (content.includes(batteryHeaderBtn)) {
    content = content.replace(batteryHeaderBtn, newHeaderButtons);
    console.log(`[${bundlePath}] Injected 3 header action buttons`);
  } else {
    console.warn(`[${bundlePath}] Warning: batteryHeaderBtn not found`);
  }

  // 4. Tab List Trigger: Add 'Tool Kit & Jack' tab right after 'Battery' tab trigger
  const batteryTabTrigger = 'e.jsxs(be,{value:"battery",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-amber-500 data-[state=active]:text-white",children:[e.jsx(Re,{className:"w-3.5 h-3.5"})," Battery ",l?.battery_serial_number?`(${l.battery_serial_number})`:""]})';
  const equipmentTabTrigger = `${batteryTabTrigger},e.jsxs(be,{value:"equipment",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-cyan-500 data-[state=active]:text-white",children:[e.jsx(as,{className:"w-3.5 h-3.5"})," Tool Kit & Jack"]})`;

  if (content.includes(batteryTabTrigger)) {
    content = content.replace(batteryTabTrigger, equipmentTabTrigger);
    console.log(`[${bundlePath}] Injected 'Tool Kit & Jack' tab trigger`);
  } else {
    console.warn(`[${bundlePath}] Warning: batteryTabTrigger not found`);
  }

  // 5. Tab Content: Add FleetEquipmentTab right after battery tab content
  const batteryRotationsAnchor = 'No bill uploaded yet."})]})]})]})]})]})}),e.jsx(ge,{value:"rotations"';
  const equipmentContentInsert = `No bill uploaded yet."})]})]})]})]})]})}),e.jsx(ge,{value:"equipment",className:"animate-in fade-in duration-300",children:e.jsx(FleetEquipmentTab,{truck:l,allTrucks:s,onOpenSwapModal:(k)=>setEquipSwapModal({isOpen:!0,itemKey:k}),onSuccess:se})}),e.jsx(ge,{value:"rotations"`;

  // Clean any old equipment tab content injection first if present
  content = content.replace(/,e\.jsx\(ge,\{value:"equipment",className:"animate-in fade-in duration-300",children:e\.jsx\(FleetEquipmentTab,[^)]*\)\}\}\)/g, '');

  if (content.includes(batteryRotationsAnchor)) {
    content = content.replace(batteryRotationsAnchor, equipmentContentInsert);
    console.log(`[${bundlePath}] Injected FleetEquipmentTab content`);
  } else {
    console.warn(`[${bundlePath}] Warning: batteryRotationsAnchor not found`);
  }

  // 6. Modals render at bottom of Ts
  const bottomAnchor = 'e.jsx(bs,{isOpen:!!B,onClose:()=>O(null),document:B,collectionName:"trucks"})';
  
  // Clean any old modal injections
  content = content.replace(/,e\.jsx\(CrossTruckTyreSwapModal[^)]*\),e\.jsx\(CrossTruckBatterySwapModal[^)]*\)/g, '');
  content = content.replace(/,e\.jsx\(CrossTruckEquipmentSwapModal[^)]*\)/g, '');

  const newModals = `${bottomAnchor},e.jsx(CrossTruckTyreSwapModal,{isOpen:crossTyreModal.isOpen,onClose:()=>setCrossTyreModal({isOpen:!1,preselectedTyre:null}),allTrucks:s,currentTruck:l,currentTyres:u,preselectedTyre:crossTyreModal.preselectedTyre,onSuccess:se}),e.jsx(CrossTruckBatterySwapModal,{isOpen:batterySwapModal.isOpen,onClose:()=>setBatterySwapModal({isOpen:!1}),allTrucks:s,currentTruck:l,onSuccess:se}),e.jsx(CrossTruckEquipmentSwapModal,{isOpen:equipSwapModal.isOpen,onClose:()=>setEquipSwapModal({isOpen:!1,itemKey:"jack"}),allTrucks:s,currentTruck:l,initialItemKey:equipSwapModal.itemKey,onSuccess:se})`;

  if (content.includes(bottomAnchor)) {
    content = content.replace(bottomAnchor, newModals);
    console.log(`[${bundlePath}] Injected all 3 modals`);
  } else {
    console.warn(`[${bundlePath}] Warning: bottomAnchor not found`);
  }

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`✓ [${bundlePath}] Syntax validation PASSED and saved!`);
  } catch (err) {
    console.error(`✗ [${bundlePath}] Syntax validation failed:`, err);
    process.exit(1);
  }
});
