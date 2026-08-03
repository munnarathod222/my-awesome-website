const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const rootDist = path.resolve(__dirname, 'dist/apps/web');
const webDist = path.resolve(__dirname, 'apps/web/dist');
const apiDist = path.resolve(__dirname, 'apps/api/dist');

console.log('Copying pre-built dist to web and api fallback dirs...');
copyDirSync(rootDist, webDist);
copyDirSync(rootDist, apiDist);
console.log('✅ Dist fallbacks synced successfully!');
