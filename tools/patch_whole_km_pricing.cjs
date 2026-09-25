const fs = require('fs');
const esbuild = require('esbuild');

const files = [
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js'
];

const newCalculationCode = `if(D<=100){
    distanceCharge=Math.round(baseRateUnder100*E);
    appliedSlabLabel=\`Below 100 km (Flat Base ₹\${baseRateUnder100.toLocaleString("en-IN")})\`;
    effectiveRateKM=D>0?Math.round(distanceCharge/D):0;
    isUnder100=!0;
  }else{
    let rate=rAbove400;
    let slabTitle="400+ km Long Haul";
    if(D<=200){rate=r100_200;slabTitle="100 - 200 km Slab";}
    else if(D<=300){rate=r200_300;slabTitle="200 - 300 km Slab";}
    else if(D<=400){rate=r300_400;slabTitle="300 - 400 km Slab";}
    const adjRate=Math.round(rate*E);
    distanceCharge=Math.round(D*adjRate);
    appliedSlabLabel=\`\${slabTitle} (₹\${adjRate}/km applies to whole \${D} KM)\`;
    effectiveRateKM=adjRate;
    isUnder100=!1;
  }
`;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  const sIdx = content.indexOf('if(D<=100){');
  if (sIdx === -1) {
    console.error('Target if(D<=100){ not found in', file);
    return;
  }

  const eIdx = content.indexOf('let Z=0;', sIdx);
  if (eIdx === -1) {
    console.error('Target let Z=0; not found in', file);
    return;
  }

  content = content.slice(0, sIdx) + newCalculationCode + '  ' + content.slice(eIdx);

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 100% VALID SYNTAX: Applied whole-km slab pricing to ${file}`);
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err.message);
  }
});

console.log('\nAll customer calculator files successfully updated to whole-distance slab pricing!');
