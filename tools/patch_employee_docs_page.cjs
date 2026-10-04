const fs = require('fs');
const path = require('path');

const files = [
  'dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'apps/web/dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'apps/api/dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'dist/apps/web/assets/EmployeeDocsPage-Cvyt3mF1.js'
];

files.forEach(f => {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  const target = 'leading-tight",children:l.name}';
  const repl = 'leading-tight",children:[l.name,l.employee_code?e.jsx("span",{className:"ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md",children:l.employee_code}):null]}';
  if (s.includes(target)) {
    s = s.replace(target, repl);
    fs.writeFileSync(p, s, 'utf8');
    console.log('✓ Updated', f);
  } else {
    console.log('Target already patched or not found in', f);
  }
});
