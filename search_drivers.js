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
      if (content.includes('drivers') || content.includes('driver')) {
        if (content.includes('drivers') && (content.includes('getFullList') || content.includes('getList'))) {
          console.log(`Driver fetch match: ${fullPath}`);
        }
      }
    }
  }
}

searchDir('C:\\Users\\Munna\'\\.gemini\\antigravity\\scratch\\www.jaibhavanicargo.com\\apps\\web\\src');
