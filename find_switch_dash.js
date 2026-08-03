const fs = require('fs');

const file = 'apps/web/src/pages/DashboardPage.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Switch') || line.includes('switch')) {
    console.log(`L${idx+1}: ${line.trim()}`);
  }
});
