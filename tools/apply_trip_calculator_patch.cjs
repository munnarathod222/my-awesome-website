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

const boundaryBefore = 'destination:ORR_IC[di]};\n}';
const boundaryAfter = 'function vs(){';

targetBundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Skipping missing ${bundlePath}`);
    return;
  }
  let bundleCode = fs.readFileSync(bundlePath, 'utf8');

  const idxBefore = bundleCode.indexOf(boundaryBefore);
  const idxAfter = bundleCode.indexOf(boundaryAfter);

  if (idxBefore === -1 || idxAfter === -1 || idxBefore >= idxAfter) {
    console.error(`Error: boundaries not found in ${bundlePath}`);
    process.exit(1);
  }

  // Replace whatever was between boundaryBefore and boundaryAfter with \n\n${calcCode}\n\n
  bundleCode = bundleCode.slice(0, idxBefore + boundaryBefore.length) + '\n\n' + calcCode + '\n\n' + bundleCode.slice(idxAfter);

  // Set default tab to "calculator" instead of "reports"
  bundleCode = bundleCode.replace('const[oe,W]=a.useState("reports")', 'const[oe,W]=a.useState("calculator")');

  // Ensure ge tabs content is wired to LogisticsTripCostCalculator
  const geStart = bundleCode.indexOf('e.jsx(ge,{value:"calculator"');
  const reportsGe = bundleCode.indexOf('e.jsx(ge,{value:"reports"');

  if (geStart !== -1 && reportsGe !== -1 && geStart < reportsGe) {
    const newCalculatorGe = `e.jsx(ge,{value:"calculator",className:"space-y-4 m-0",children:e.jsx(LogisticsTripCostCalculator,{initialDistance:b[0]||650,initialMileage:f[0]||4.5,initialFuelPrice:g[0]||92.5,initialTolls:j[0]||1400,savedReportsCount:le.length,onOpenReports:()=>W("reports"),onSaveToDatabase:(data)=>{A([data.distance]);O([data.fuel_price]);$([data.mileage]);B([data.tolls]);Z(data.total_fixed_allocated);te(data.recommended_quote);T(!0)}})}),`;
    bundleCode = bundleCode.slice(0, geStart) + newCalculatorGe + bundleCode.slice(reportsGe);
  }

  // Validate syntax with esbuild
  try {
    esbuild.transformSync(bundleCode, { loader: 'js' });
    fs.writeFileSync(bundlePath, bundleCode, 'utf8');
    console.log(`✓ [${bundlePath}] Successfully patched with automatic JSX and syntax validated!`);
  } catch (err) {
    console.error(`✗ [${bundlePath}] Syntax validation failed:`, err);
    process.exit(1);
  }
});

console.log('\n🎉 ALL 4 TRIP OVERVIEW CALCULATOR BUNDLES UPDATED WITH AUTOMATIC JSX RUNTIME!');
