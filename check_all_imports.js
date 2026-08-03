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
      // Match jsx tag <Switch
      if (content.match(/<Switch[\s\/>]/)) {
        console.log(`FOUND JSX TAG <Switch in: ${fullPath}`);
        // Check if Switch is imported
        if (!content.includes("import") || (!content.includes("Switch") && !content.includes("switch"))) {
          console.log(`   -> WARNING: Switch might not be imported in ${fullPath}`);
        } else {
          // Check import lines
          const importLines = content.split('\n').filter(l => l.includes('import') && l.includes('Switch'));
          console.log(`   Imports: ${importLines.join(' | ') || 'NONE!'}`);
        }
      }
    }
  }
}

searchAllFiles(path.join(__dirname, 'apps', 'web', 'src'));
