const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchDir(full, pattern);
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) {
        console.log(`Found in: ${full}`);
      }
    }
  }
}

searchDir('apps/web/src', 'PocketBase');
