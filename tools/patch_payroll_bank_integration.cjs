const fs = require('fs');
const parser = require('@babel/parser');

const targets = [
  'dist/assets/PayrollPage-AISzjStb.js',
  'apps/web/dist/assets/PayrollPage-AISzjStb.js',
  'apps/api/dist/assets/PayrollPage-AISzjStb.js',
  'dist/apps/web/assets/PayrollPage-AISzjStb.js'
];

console.log('=== Patching PayrollPage with Bank Details & NEFT Export ===');

for (const pth of targets) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  // 1. Inject bankDetailsMap state
  const targetState = 'function Ls(){const[t,i]=d.useState([])';
  const injectedState = 'function Ls(){const[t,i]=d.useState([]),[bankDetailsMap,setBankDetailsMap]=d.useState({})';
  if (code.includes(targetState) && !code.includes('bankDetailsMap')) {
    code = code.replace(targetState, injectedState);
    console.log('✓ Injected bankDetailsMap state in:', pth);
  }

  // 2. Inject bank details fetch in ge (fetchData)
  const targetFetch = 'i(s||[]),h(v||[]),r(_||[]),u(O||[])}catch(s)';
  const injectedFetch = 'i(s||[]),h(v||[]),r(_||[]),u(O||[]);fetch("/api/employee/bank-details").then(r=>r.json()).then(d=>{if(d?.bankDetails)setBankDetailsMap(d.bankDetails)}).catch(()=>{})}catch(s)';
  if (code.includes(targetFetch) && !code.includes('fetch("/api/employee/bank-details")')) {
    code = code.replace(targetFetch, injectedFetch);
    console.log('✓ Injected bank details fetch into ge() in:', pth);
  }

  // 3. Inject bank columns into NEFT/RTGS CSV export
  const targetExport = 'ft=()=>{const s=["Employee Name","Role / Position","Base Salary (INR)","Attendance (Present/Working)","Pending Advances (INR)","Net Payout (INR)","Pay Date","Status"],v=Ae.map(M=>[`"${M.name}"`,`"${M.position||M.employee_type||"Staff"}"`,M.baseSalary,`"${M.presentDays}/${M.totalWorkingDays} Days"`,M.totalAdvances,M.netPayout,`"${M.cycleInfo?.formattedPayDate||"10th"}"`,`"${M.isSettled?"Settled":"Pending"}"`])';
  const injectedExport = 'ft=()=>{const s=["Employee Name","Role / Position","Bank Name","Account Number","IFSC Code","Base Salary (INR)","Attendance (Present/Working)","Pending Advances (INR)","Net Payout (INR)","Pay Date","Status"],v=Ae.map(M=>{const _b=bankDetailsMap[M.id]||{};return[`"${M.name}"`,`"${M.position||M.employee_type||"Staff"}"`,`"${_b.bank_name||"Not Linked"}"`,`"${_b.account_number?"\'"+_b.account_number:"N/A"}"`,`"${_b.ifsc_code||"N/A"}"`,M.baseSalary,`"${M.presentDays}/${M.totalWorkingDays} Days"`,M.totalAdvances,M.netPayout,`"${M.cycleInfo?.formattedPayDate||"10th"}"`,`"${M.isSettled?"Settled":"Pending"}"`]})';
  if (code.includes(targetExport) && !code.includes('Bank Name","Account Number","IFSC Code"')) {
    code = code.replace(targetExport, injectedExport);
    console.log('✓ Injected Bank columns in CSV export in:', pth);
  }

  // 4. Inject bank badge into employee row in Payroll directory
  const targetRow = 's.position||s.employee_type||"Staff"," • Joined ",s.joining_date?s.joining_date.split(" ")[0]:"N/A"]})';
  const injectedRow = targetRow + ',bankDetailsMap[s.id]?e.jsxs("div",{className:"text-[10px] text-emerald-400 font-mono font-bold mt-0.5",children:["🏦 ",bankDetailsMap[s.id].bank_name.split(" ")[0]," ••••",String(bankDetailsMap[s.id].account_number).slice(-4)]}):e.jsx("div",{className:"text-[10px] text-amber-400/80 font-mono mt-0.5",children:"⚠️ Bank Pending"})';
  if (code.includes(targetRow) && !code.includes('bankDetailsMap[s.id]?e.jsxs("div",{className:"text-[10px] text-emerald-400 font-mono font-bold mt-0.5"')) {
    code = code.replace(targetRow, injectedRow);
    console.log('✓ Injected bank badge in Payroll employee row in:', pth);
  }

  // 5. AST validation
  try {
    parser.parse(code, { sourceType: 'module' });
    fs.writeFileSync(pth, code, 'utf8');
    console.log('🎉 Successfully saved and verified AST for:', pth);
  } catch (err) {
    console.error('❌ AST parse error on', pth, err.message);
    process.exit(1);
  }
}

console.log('=== All PayrollPage bundles patched successfully! ===');
