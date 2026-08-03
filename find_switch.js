const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<Switch') || content.includes('Switch')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('<Switch') || line.includes('Switch')) {
            console.log(`${fullPath}:L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(path.join(__dirname, 'apps', 'web', 'src'));
