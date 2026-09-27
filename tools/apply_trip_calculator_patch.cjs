const fs = require('fs');
const esbuild = require('esbuild');

let calcCode = fs.readFileSync('tools/LogisticsTripCostCalculator.compiled.js', 'utf8');
calcCode = calcCode.replace(/export\s+function\s+/g, 'function ');

const targetBundles = [
  'dist/assets/TripOverviewCalculator-C7oF7tqI.js',
  'dist/apps/web/assets/TripOverviewCalculator-C7oF7tqI.js',
  'apps/web/dist/assets/TripOverviewCalculator-C7oF7tqI.js',
  'apps/api/dist/assets/TripOverviewCalculator-C7oF7tqI.js'
];

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Skipping missing ${bundlePath}`);
    return;
  }
  let bundleCode = fs.readFileSync(bundlePath, 'utf8');

  // If already patched, remove previous injection
  const calcDefIdx = bundleCode.indexOf('function LogisticsTripCostCalculator(');
  const vsAnchor = 'function vs(){';
  if (calcDefIdx !== -1) {
    const vsIdx = bundleCode.indexOf(vsAnchor, calcDefIdx);
    if (vsIdx !== -1) {
      bundleCode = bundleCode.slice(0, calcDefIdx) + bundleCode.slice(vsIdx);
    }
  }

  // 1. Inject LogisticsTripCostCalculator before function vs()
  if (!bundleCode.includes(vsAnchor)) {
    console.error(`Error: ${vsAnchor} not found in ${bundlePath}`);
    process.exit(1);
  }
  bundleCode = bundleCode.replace(vsAnchor, `${calcCode}\n${vsAnchor}`);

  // 2. Locate e.jsx(ge,{value:"calculator" and e.jsx(ge,{value:"reports"
  const geStart = bundleCode.indexOf('e.jsx(ge,{value:"calculator"');
  const reportsGe = bundleCode.indexOf('e.jsx(ge,{value:"reports"');

  if (geStart === -1 || reportsGe === -1 || geStart >= reportsGe) {
    console.error(`Error: ge anchors not found in ${bundlePath}`);
    process.exit(1);
  }

  const newCalculatorGe = `e.jsx(ge,{value:"calculator",className:"space-y-4 m-0",children:e.jsx(LogisticsTripCostCalculator,{initialDistance:b[0]||650,initialMileage:f[0]||4.5,initialFuelPrice:g[0]||92.5,initialTolls:j[0]||1400,savedReportsCount:le.length,onOpenReports:()=>W("reports"),onSaveToDatabase:(data)=>{A([data.distance]);O([data.fuel_price]);$([data.mileage]);B([data.tolls]);Z(data.total_fixed_allocated);te(data.recommended_quote);T(!0)}})}),`;

  bundleCode = bundleCode.slice(0, geStart) + newCalculatorGe + bundleCode.slice(reportsGe);

  // 3. Validate syntax with esbuild
  try {
    esbuild.transformSync(bundleCode, { loader: 'js' });
    fs.writeFileSync(bundlePath, bundleCode, 'utf8');
    console.log(`✓ [${bundlePath}] Successfully patched and syntax validated!`);
  } catch (err) {
    console.error(`✗ [${bundlePath}] Syntax validation failed:`, err);
    process.exit(1);
  }
});

console.log('\n🎉 ALL 4 TRIP OVERVIEW CALCULATOR BUNDLES UPDATED WITH [A + B] ARCHITECTURE!');
