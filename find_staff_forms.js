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
      if (content.toLowerCase().includes('employee') || content.toLowerCase().includes('staff') || content.toLowerCase().includes('recruitment')) {
        console.log(`Matching file: ${fullPath}`);
      }
    }
  }
}

searchDir(path.join(__dirname, 'apps', 'web', 'src'));
