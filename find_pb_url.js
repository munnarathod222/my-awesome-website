const fs = require('fs');
const file = 'apps/web/src/lib/pocketbase.js';
if (fs.existsSync(file)) {
  console.log(fs.readFileSync(file, 'utf8'));
} else {
  console.log('File not found');
}
