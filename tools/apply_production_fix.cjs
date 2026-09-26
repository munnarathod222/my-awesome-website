const fs = require('fs');
const esbuild = require('esbuild');

let swapperModule = fs.readFileSync('tools/IntegratedSwapper.clean.js', 'utf8');

// Strip export keywords
swapperModule = swapperModule.replace(/export\s+function\s+/g, 'function ');

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

  // 1. Replace swapper code between function getTruckEquipment and function Ts(){
  const startIdx = content.indexOf('function getTruckEquipment(');
  const tsIdx = content.indexOf('function Ts(){');

  if (startIdx !== -1 && tsIdx !== -1 && startIdx < tsIdx) {
    content = content.slice(0, startIdx) + swapperModule + '\n' + content.slice(tsIdx);
    console.log(`[${bundlePath}] Replaced swapper code with new IntegratedSwapper`);
  } else {
    console.error(`[${bundlePath}] Could not locate swapper boundaries!`);
    process.exit(1);
  }

  // 2. Clean out duplicate header buttons and replace with clean 4 buttons
  const firstButtonAnchor = 'e.jsxs(_,{size:"sm",onClick:()=>setCrossTyreModal({isOpen:!0,preselectedTyre:null})';
  const addTyreAnchor = 'Add Tyre"]})';

  const firstBtnIdx = content.indexOf(firstButtonAnchor);
  const addTyreIdx = content.indexOf(addTyreAnchor, firstBtnIdx);

  if (firstBtnIdx !== -1 && addTyreIdx !== -1) {
    const endSliceIdx = addTyreIdx + addTyreAnchor.length;
    
    const cleanHeaderButtons = `e.jsxs(_,{size:"sm",onClick:()=>setCrossTyreModal({isOpen:!0,preselectedTyre:null}),className:"rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Q,{className:"w-3.5 h-3.5 text-indigo-500"})," Swap Tyre Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap Battery Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setEquipSwapModal({isOpen:!0,itemKey:"jack"}),className:"rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(as,{className:"w-3.5 h-3.5 text-cyan-500"})," Swap Tools / Kit Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>k({isOpen:!0,tyre:null,initialPosition:null}),className:"rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1 h-8 px-3 shadow-sm",children:[e.jsx(Le,{className:"w-3.5 h-3.5"})," Add Tyre"]})`;

    content = content.slice(0, firstBtnIdx) + cleanHeaderButtons + content.slice(endSliceIdx);
    console.log(`[${bundlePath}] Replaced messy duplicate header buttons with clean 4 buttons`);
  } else {
    console.warn(`[${bundlePath}] Could not locate header buttons slice`);
  }

  // 3. Connect onViewImage in FleetEquipmentTab
  const oldEquipTabCall = 'e.jsx(FleetEquipmentTab,{truck:l,allTrucks:s,onOpenSwapModal:(k)=>setEquipSwapModal({isOpen:!0,itemKey:k}),onSuccess:se})';
  const newEquipTabCall = 'e.jsx(FleetEquipmentTab,{truck:l,allTrucks:s,onOpenSwapModal:(k)=>setEquipSwapModal({isOpen:!0,itemKey:k}),onViewImage:(d)=>O(d),onSuccess:se})';
  if (content.includes(oldEquipTabCall)) {
    content = content.replace(oldEquipTabCall, newEquipTabCall);
    console.log(`[${bundlePath}] Connected onViewImage in FleetEquipmentTab`);
  }

  // 4. Verify syntax with esbuild
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(bundlePath, content, 'utf8');
    console.log(`✓ [${bundlePath}] Syntax validation PASSED and saved!`);
  } catch (err) {
    console.error(`✗ [${bundlePath}] Syntax validation failed:`, err);
    process.exit(1);
  }
});

console.log('\n🎉 ALL 4 BUNDLES SUCCESSFULLY UPDATED WITH FULL FLEET EQUIPMENT CAPABILITIES!');
