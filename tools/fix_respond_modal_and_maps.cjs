const fs = require('fs');
const esbuild = require('esbuild');

const quoteFiles = [
  'dist/assets/QuotesManagerPage-6LqGA_3o.js',
  'dist/apps/web/assets/QuotesManagerPage-6LqGA_3o.js',
  'apps/web/dist/assets/QuotesManagerPage-6LqGA_3o.js',
  'apps/api/dist/assets/QuotesManagerPage-6LqGA_3o.js'
];

quoteFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Patching ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  // 1. Fix modal scrolling in Respond dialog (Pt)
  // DialogContent wrapper
  content = content.replace(
    /className:"sm:max-w-3xl max-h-\[90vh\] flex flex-col p-0 bg-card border-border"/g,
    'className:"sm:max-w-3xl max-h-[92vh] flex flex-col p-0 bg-card border-border overflow-hidden my-auto"'
  );

  // Body container: replace $e with scrollable div
  content = content.replace(
    /children:e\.jsx\(\$e,\{className:"flex-1 px-6 py-4",children:e\.jsxs\("div",\{className:"space-y-6"/g,
    'children:e.jsx("div",{className:"flex-1 overflow-y-auto max-h-[calc(92vh-75px)] px-6 py-4 overscroll-contain",children:e.jsxs("div",{className:"space-y-6"'
  );

  // Also fix Create/Edit quote dialog (At)
  content = content.replace(
    /className:"sm:max-w-4xl max-h-\[90vh\] flex flex-col p-0"/g,
    'className:"sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden my-auto"'
  );

  // 2. Fix Pickup Map link in Respond dialog
  const oldPickupMap = 'href:t.pickup_maps_url||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.origin||"")}`';
  const newPickupMap = 'href:((t.pickup_maps_url&&t.pickup_maps_url.startsWith("http"))?t.pickup_maps_url.trim():((t.notes&&t.notes.match(/(?:Pickup Google Maps|Pickup Map|Pickup Link|Origin Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i))?t.notes.match(/(?:Pickup Google Maps|Pickup Map|Pickup Link|Origin Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i)[1].trim():(t.origin&&t.origin.startsWith("http")?t.origin.trim():`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.origin||"")}`)))';

  if (content.includes(oldPickupMap)) {
    content = content.replace(oldPickupMap, newPickupMap);
    console.log(`✓ Replaced pickup map link in ${file}`);
  } else {
    console.log(`Note: oldPickupMap not found in ${file}`);
  }

  // 3. Fix Drop Map link in Respond dialog
  const oldDropMap = 'href:t.drop_maps_url||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.destination||"")}`';
  const newDropMap = 'href:((t.drop_maps_url&&t.drop_maps_url.startsWith("http"))?t.drop_maps_url.trim():((t.notes&&t.notes.match(/(?:Drop Google Maps|Drop Map|Drop Link|Destination Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i))?t.notes.match(/(?:Drop Google Maps|Drop Map|Drop Link|Destination Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i)[1].trim():(t.destination&&t.destination.startsWith("http")?t.destination.trim():`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.destination||"")}`)))';

  if (content.includes(oldDropMap)) {
    content = content.replace(oldDropMap, newDropMap);
    console.log(`✓ Replaced drop map link in ${file}`);
  } else {
    console.log(`Note: oldDropMap not found in ${file}`);
  }

  // Double check zero c2.createElement
  content = content.replace(/c2\.createElement/g, 'c.createElement');

  // Validate syntax
  try {
    esbuild.transformSync(content, { loader: 'js' });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 100% VALID SYNTAX for ${file}`);
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err);
    process.exit(1);
  }
});

// Now update apps/api/src/routes/driver.js to enrich quotes in /get-quotes
const driverFile = 'apps/api/src/routes/driver.js';
if (fs.existsSync(driverFile)) {
  let driverCode = fs.readFileSync(driverFile, 'utf8');
  const targetSort = `    allQuotes.sort((a, b) => {
      const timeA = new Date(a.created || a.updated || 0).getTime();
      const timeB = new Date(b.created || b.updated || 0).getTime();
      return timeB - timeA;
    });`;

  const enrichedSort = `    allQuotes.forEach(q => {
      if ((!q.pickup_maps_url || !q.pickup_maps_url.startsWith('http')) && q.notes) {
        const m = q.notes.match(/(?:Pickup Google Maps|Pickup Map|Pickup Link|Origin Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i);
        if (m && m[1]) q.pickup_maps_url = m[1].trim();
      }
      if ((!q.drop_maps_url || !q.drop_maps_url.startsWith('http')) && q.notes) {
        const m = q.notes.match(/(?:Drop Google Maps|Drop Map|Drop Link|Destination Map)[\\s:]+(https?:\\/\\/[^\\s\\n\\r]+)/i);
        if (m && m[1]) q.drop_maps_url = m[1].trim();
      }
    });

    allQuotes.sort((a, b) => {
      const timeA = new Date(a.created || a.updated || 0).getTime();
      const timeB = new Date(b.created || b.updated || 0).getTime();
      return timeB - timeA;
    });`;

  if (driverCode.includes(targetSort) && !driverCode.includes('allQuotes.forEach(q => {')) {
    driverCode = driverCode.replace(targetSort, enrichedSort);
    fs.writeFileSync(driverFile, driverCode, 'utf8');
    console.log(`✓ Enriched /get-quotes in ${driverFile}`);
  }
}

console.log('\nAll files successfully patched for scrollable modal & real Google Maps URLs!');
