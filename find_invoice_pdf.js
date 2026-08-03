const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('REMITTANCE') || content.includes('REMITTANCE BANK DETAILS') || content.includes('Payment Requests') || content.includes('payment_due_date') || content.includes('due_date')) {
        if (content.includes('REMITTANCE') || content.includes('TOTAL AMOUNT DUE')) {
          console.log('FOUND PDF FILE:', fullPath);
        }
      }
    }
  }
}

searchDir(path.join(__dirname, 'apps/web/src'));
