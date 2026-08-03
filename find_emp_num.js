const fs = require('fs');
const file = 'apps/web/src/pages/EmployeeDatabasePage.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('employee_number')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
