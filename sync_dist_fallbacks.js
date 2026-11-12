const fs = require('fs');
const path = require('path');

console.log('--- sync_dist_fallbacks.js: Protecting and syncing modern unified production bundle ---');

const primaryIndexHtml = path.resolve(__dirname, 'dist/index.html');
const primaryBundle = path.resolve(__dirname, 'dist/assets/index-DLxf9dwO.js');
const primaryProfilePage = path.resolve(__dirname, 'dist/assets/ProfilePage-f6cQzKX5.js');

if (!fs.existsSync(primaryIndexHtml) || !fs.existsSync(primaryBundle)) {
  console.error('Critical: Primary modern assets missing!');
  process.exit(1);
}

const htmlContent = fs.readFileSync(primaryIndexHtml, 'utf8');
const bundleBuffer = fs.readFileSync(primaryBundle);
const profilePageBuffer = fs.existsSync(primaryProfilePage) ? fs.readFileSync(primaryProfilePage) : null;

console.log(`Modern index.html size: ${htmlContent.length} bytes`);
console.log(`Modern index-DLxf9dwO.js bundle size: ${bundleBuffer.length} bytes`);
if (profilePageBuffer) console.log(`Modern ProfilePage-f6cQzKX5.js size: ${profilePageBuffer.length} bytes`);

const targetDirs = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, 'dist/apps/web'),
  path.resolve(__dirname, 'apps/api/dist'),
  path.resolve(__dirname, 'apps/web/dist')
];

for (const t of targetDirs) {
  if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  fs.writeFileSync(path.join(t, 'index.html'), htmlContent, 'utf8');

  const assetsDir = path.join(t, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'index-DLxf9dwO.js'), bundleBuffer);
  if (profilePageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'ProfilePage-f6cQzKX5.js'), profilePageBuffer);
  }
  console.log(`✓ Synced modern index.html, index-DLxf9dwO.js and ProfilePage to: ${t}`);
}

console.log('✅ Modern website assets successfully protected and synced across all targets.');
