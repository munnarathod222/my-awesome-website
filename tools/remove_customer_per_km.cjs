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

  // 1. Remove per-km price from customer appliedSlabLabel
  // Old <=100km label
  content = content.replace(
    /appliedSlabLabel=\`Below 100 km \(\$\{rateTypeTag\} Flat Base [^`]*\)\`/g,
    'appliedSlabLabel=`Short Haul / Local Route (<100 KM)`'
  );
  content = content.replace(
    /appliedSlabLabel=\`Below 100 km \(Flat Base [^`]*\)\`/g,
    'appliedSlabLabel=`Short Haul / Local Route (<100 KM)`'
  );

  // Old >100km label
  content = content.replace(
    /appliedSlabLabel=\`\$\{slabTitle\} \(\$\{rateTypeTag\} ₹\$\{adjRate\}\/km applies to whole \$\{D\} KM\)\`/g,
    'appliedSlabLabel=`${slabTitle} (${rateTypeTag} Direct Transit)`'
  );
  content = content.replace(
    /appliedSlabLabel=\`\$\{slabTitle\} \(₹\$\{adjRate\}\/km applies to whole \$\{D\} KM\)\`/g,
    'appliedSlabLabel=`${slabTitle} (${rateTypeTag} Direct Transit)`'
  );

  // 2. Remove per-km from website landing page & marketing sections
  // Hero badge
  content = content.replace(
    /Verified 32FT SXL Freight Rates Starting @ ₹48\/KM/g,
    'Verified 32FT SXL Dedicated Fleet & Freight Solutions'
  );

  // Hero stat box
  content = content.replace(
    /font-mono",children:"₹48 \/ KM"\}\)\]\}\)/g,
    'font-mono",children:"Route-Optimized Pricing"})]})'
  );

  // Quote section description
  content = content.replace(
    /Calculate shipping costs based on verified 32ft SXL market rates starting @ ₹48\/KM\./g,
    'Calculate shipping costs based on verified fleet availability and route optimization.'
  );

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 100% VALID SYNTAX: Removed per-km pricing from customer view in ${file}`);
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err);
    process.exit(1);
  }
});

console.log('\nPer-km prices successfully removed from customer quotation and website!');
