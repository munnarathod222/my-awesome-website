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
      if (content.includes('Terminated') || content.includes('terminated') || content.includes('SAMPLE_') || content.includes('DEFAULT_DRIVERS') || content.includes('DEFAULT_EMPLOYEES')) {
        console.log('FOUND MATCH IN:', fullPath);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('Terminated') || line.includes('terminated') || line.includes('SAMPLE_') || line.includes('DEFAULT_DRIVERS')) {
            console.log(`  L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(path.join(__dirname, 'apps/web/src'));
