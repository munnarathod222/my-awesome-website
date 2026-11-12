const fs = require('fs');
const path = require('path');

console.log('--- Running sync_dist_fallbacks.js ---');

const srcDir = path.resolve(__dirname, 'dist/apps/web');
const targetDirs = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, 'apps/api/dist'),
  path.resolve(__dirname, 'apps/web/dist')
];

if (!fs.existsSync(srcDir)) {
  console.log(`Source dir ${srcDir} does not exist, skipping fallback sync.`);
  process.exit(0);
}

let indexHtml = '';
const indexHtmlPath = path.join(srcDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  for (const t of targetDirs) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
    fs.writeFileSync(path.join(t, 'index.html'), indexHtml, 'utf8');
    console.log(`Synced index.html to ${t}`);
  }
}

const assetsSrc = path.join(srcDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  const assets = fs.readdirSync(assetsSrc);
  for (const a of assets) {
    const srcFile = path.join(assetsSrc, a);
    if (fs.statSync(srcFile).isDirectory()) continue;
    for (const t of targetDirs) {
      const destDir = path.join(t, 'assets');
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcFile, path.join(destDir, a));
    }
  }
  console.log(`Synced ${assets.length} assets across target dist folders.`);

  // Also sync newly built index bundle as index-DLxf9dwO.js fallback for older caches
  const match = indexHtml.match(/src=["'](?:\/)?assets\/(index-[A-Za-z0-9_-]+\.js)["']/);
  const activeBundleName = match ? match[1] : null;
  if (activeBundleName && fs.existsSync(path.join(assetsSrc, activeBundleName))) {
    const activeBundlePath = path.join(assetsSrc, activeBundleName);
    for (const t of targetDirs) {
      const fallbackPath = path.join(t, 'assets', 'index-DLxf9dwO.js');
      fs.copyFileSync(activeBundlePath, fallbackPath);
    }
    console.log(`Synced active index bundle ${activeBundleName} as index-DLxf9dwO.js fallback.`);
  }
}

console.log('✅ Fallback sync completed successfully.');
