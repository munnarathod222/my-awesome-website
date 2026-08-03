const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchAllFiles(fullPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.match(/<Switch[\s\/>]/)) {
        if (!content.includes('/switch') && !content.includes("from '@/components/ui/switch'")) {
          console.log(`❌ MISSING SWITCH IMPORT IN: ${fullPath}`);
        } else {
          console.log(`✅ PROPERLY IMPORTED IN: ${fullPath}`);
        }
      }
    }
  }
}

searchAllFiles(path.join(__dirname, 'apps', 'web', 'src'));
