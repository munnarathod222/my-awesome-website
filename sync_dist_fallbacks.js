const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[sync_dist] Warning: source directory does not exist: ${src}`);
    return;
  }
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

// The freshly built frontend assets from Vite are in apps/web/dist
const sourceDist = path.resolve(__dirname, 'apps/web/dist');
const apiDist = path.resolve(__dirname, 'apps/api/dist');
const rootDist = path.resolve(__dirname, 'dist/apps/web');

console.log('Copying freshly built apps/web/dist to api and root fallback directories...');
copyDirSync(sourceDist, apiDist);
copyDirSync(sourceDist, rootDist);
console.log('✅ Dist fallbacks synced successfully!');
