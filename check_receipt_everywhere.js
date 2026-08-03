const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Receipt')) {
        const importMatches = content.split('\n').filter(l => l.includes('import') && l.includes('Receipt'));
        const usageMatches = content.split('\n').filter(l => !l.includes('import') && l.includes('Receipt'));
        console.log(`FILE: ${fullPath}`);
        console.log(`   Imports: ${importMatches.join(' | ') || 'NONE'}`);
        console.log(`   Usages count: ${usageMatches.length}\n`);
      }
    }
  }
}

searchDir(path.join(__dirname, 'apps', 'web', 'src'));
