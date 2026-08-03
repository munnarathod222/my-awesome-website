const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<Receipt') || content.includes('Receipt')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('<Receipt') || line.includes('Receipt')) {
            console.log(`${fullPath}:L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchFiles(path.join(__dirname, 'apps', 'web', 'src'));
