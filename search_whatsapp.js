const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, pattern);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (pattern.test(content)) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

console.log('--- Searching for whatsapp or wa.me ---');
searchDir('C:\\Users\\Munna\'\\.gemini\\antigravity\\scratch\\www.jaibhavanicargo.com\\apps\\web\\src', /whatsapp|wa\.me/i);
