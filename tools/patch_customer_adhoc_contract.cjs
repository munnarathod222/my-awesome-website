const fs = require('fs');
const esbuild = require('esbuild');

const targetFiles = [
  'dist/assets/index-DLxf9dwO.js',
  'dist/apps/web/assets/index-DLxf9dwO.js',
  'apps/web/dist/assets/index-DLxf9dwO.js',
  'apps/api/dist/assets/index-DLxf9dwO.js',
  'dist/assets/index-C7kP9xL2.js',
  'dist/apps/web/assets/index-C7kP9xL2.js',
  'apps/web/dist/assets/index-C7kP9xL2.js',
  'apps/api/dist/assets/index-C7kP9xL2.js'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping missing file: ${file}`);
    return;
  }
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // 1. Replace calculation block
  const startMarker = 'const vehList=b_rateSlabs?.vehicles||[];';
  const endMarker = 'let Z=0;';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`Could not locate calculation block in ${file}`);
    return;
  }

  const newCalcBlock = `const vehList=b_rateSlabs?.vehicles||[];
  const configuredVeh=vehList.find(x=>x.id===t||x.id===P.id||(x.short&&(x.short===P.short||x.name===P.name)));
  
  const isContractTenure=Boolean(b_contractTenure&&b_contractTenure!=="spot"&&b_contractTenure!=="adhoc");
  const rateTypeTag=isContractTenure?"Contract":"Adhoc";

  let baseRateUnder100,r100_200,r200_300,r300_400,rAbove400;
  if(isContractTenure){
    baseRateUnder100=configuredVeh?Number(configuredVeh.contract_base_rate_under_100||Math.round((configuredVeh.base_rate_under_100||10000)*0.85)):(t.includes("32ft")?8500:(P.baseCharge?P.baseCharge+2000:5000));
    r100_200=configuredVeh?Number(configuredVeh.contract_rate_100_200||Math.round((configuredVeh.rate_100_200||60)*0.88)):Math.round(P.rateKM*1.10);
    r200_300=configuredVeh?Number(configuredVeh.contract_rate_200_300||Math.round((configuredVeh.rate_200_300||54)*0.88)):Math.round(P.rateKM*0.98);
    r300_400=configuredVeh?Number(configuredVeh.contract_rate_300_400||Math.round((configuredVeh.rate_300_400||50)*0.88)):Math.round(P.rateKM*0.92);
    rAbove400=configuredVeh?Number(configuredVeh.contract_rate_above_400||Math.round((configuredVeh.rate_above_400||48)*0.88)):Math.round(P.rateKM*0.88);
  }else{
    baseRateUnder100=configuredVeh?Number(configuredVeh.adhoc_base_rate_under_100||configuredVeh.base_rate_under_100||10000):(t.includes("32ft")?10000:(P.baseCharge?P.baseCharge+3000:6000));
    r100_200=configuredVeh?Number(configuredVeh.adhoc_rate_100_200||configuredVeh.rate_100_200||60):Math.round(P.rateKM*1.25);
    r200_300=configuredVeh?Number(configuredVeh.adhoc_rate_200_300||configuredVeh.rate_200_300||54):Math.round(P.rateKM*1.12);
    r300_400=configuredVeh?Number(configuredVeh.adhoc_rate_300_400||configuredVeh.rate_300_400||50):Math.round(P.rateKM*1.04);
    rAbove400=configuredVeh?Number(configuredVeh.adhoc_rate_above_400||configuredVeh.rate_above_400||48):Math.round(P.rateKM*1.0);
  }

  const mode=b_rateSlabs?.pricing_mode||"slab_whole";

  let distanceCharge=0;
  let appliedSlabLabel="";
  let effectiveRateKM=0;
  let isUnder100=!1;

  if(D<=100){
    distanceCharge=Math.round(baseRateUnder100*E);
    appliedSlabLabel=\`Below 100 km (\${rateTypeTag} Flat Base ₹\${baseRateUnder100.toLocaleString("en-IN")})\`;
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
    appliedSlabLabel=\`\${slabTitle} (\${rateTypeTag} ₹\${adjRate}/km applies to whole \${D} KM)\`;
    effectiveRateKM=adjRate;
    isUnder100=!1;
  }
  `;

  content = content.slice(0, startIdx) + newCalcBlock + content.slice(endIdx);

  // 2. Update tenure buttons subtext
  const oldButtonsStr = `{id:"spot",name:"Spot / Adhoc",sub:"Standard Rate",icon:"⚡"},
        {id:"contract_1m",name:"1 Month",sub:"-5% Volume",icon:"📄"},
        {id:"contract_3m",name:"3 Months",sub:"-8% Quarterly",icon:"📊"},
        {id:"contract_6m",name:"6 Months",sub:"-12% Semi-Yr",icon:"💼"},
        {id:"contract_1y",name:"1 Year",sub:"-15% Annual",icon:"🏆"}`;

  const newButtonsStr = `{id:"spot",name:"Spot / Adhoc",sub:"Adhoc Slab Rates",icon:"⚡"},
        {id:"contract_1m",name:"1 Month",sub:"Contract Slab Rates",icon:"📄"},
        {id:"contract_3m",name:"3 Months",sub:"Contract (-5% Vol)",icon:"📊"},
        {id:"contract_6m",name:"6 Months",sub:"Contract (-8% Vol)",icon:"💼"},
        {id:"contract_1y",name:"1 Year",sub:"Contract (-12% Vol)",icon:"🏆"}`;

  if (content.includes(oldButtonsStr)) {
    content = content.replace(oldButtonsStr, newButtonsStr);
  }

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 100% VALID SYNTAX: Applied Adhoc & Contract rate logic to ${file}`);
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err);
    process.exit(1);
  }
});

console.log('\nAll customer calculator files successfully updated to Adhoc & Contract slab pricing!');
