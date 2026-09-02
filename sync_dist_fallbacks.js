const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
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

if (fs.existsSync(rootDist) && fs.existsSync(path.join(rootDist, 'index.html'))) {
  console.log('Syncing dist/apps/web to apiDist...');
  copyDirSync(rootDist, apiDist);
} else if (fs.existsSync(webDist) && fs.existsSync(path.join(webDist, 'index.html'))) {
  console.log('Syncing apps/web/dist to apiDist and rootDist...');
  copyDirSync(webDist, apiDist);
  copyDirSync(webDist, rootDist);
} else if (fs.existsSync(apiDist) && fs.existsSync(path.join(apiDist, 'index.html'))) {
  console.log('Syncing apps/api/dist to rootDist...');
  copyDirSync(apiDist, rootDist);
}
console.log('✅ Dist fallbacks synced successfully!');
