const fs = require('fs');
const parser = require('@babel/parser');

const targetBundles = [
  'dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/web/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/api/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'dist/apps/web/assets/EmployeeDatabasePage-CnJ6LyN5.js'
];

console.log('=== Patching EmployeeDatabasePage with Bank Account Details System ===');

// The standalone, self-contained BankDetailsModal component
const bankModalComponentCode = `
function BankDetailsModal({ isOpen, onClose, employee, initialBank, onSaved }) {
  const [bankName, setBankName] = d.useState('');
  const [accountNumber, setAccountNumber] = d.useState('');
  const [confirmAccNumber, setConfirmAccNumber] = d.useState('');
  const [ifscCode, setIfscCode] = d.useState('');
  const [holderName, setHolderName] = d.useState('');
  const [branchName, setBranchName] = d.useState('');
  const [accountType, setAccountType] = d.useState('Savings');
  const [upiId, setUpiId] = d.useState('');
  const [saving, setSaving] = d.useState(false);
  const [showMasked, setShowMasked] = d.useState(false);

  d.useEffect(() => {
    if (employee && isOpen) {
      setBankName(initialBank?.bank_name || '');
      setAccountNumber(initialBank?.account_number || '');
      setConfirmAccNumber(initialBank?.account_number || '');
      setIfscCode(initialBank?.ifsc_code || '');
      setHolderName(initialBank?.account_holder_name || employee?.name || '');
      setBranchName(initialBank?.branch_name || '');
      setAccountType(initialBank?.account_type || 'Savings');
      setUpiId(initialBank?.upi_id || '');
      setShowMasked(false);
    }
  }, [employee, initialBank, isOpen]);

  if (!employee) return null;

  const popularBanks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Bank of Baroda',
    'Punjab National Bank', 'Axis Bank', 'Canara Bank', 'Kotak Mahindra Bank'
  ];

  const handleSave = async (ev) => {
    ev?.preventDefault();
    const cleanAcc = String(accountNumber || '').replace(/[\\s-]/g, '');
    const cleanConfirm = String(confirmAccNumber || '').replace(/[\\s-]/g, '');
    const cleanIfsc = String(ifscCode || '').trim().toUpperCase();

    if (!bankName.trim()) return k.error('Please enter Bank Name');
    if (!cleanAcc || cleanAcc.length < 8) return k.error('Please enter valid Account Number (min 8 digits)');
    if (cleanAcc !== cleanConfirm) return k.error('Account numbers do not match. Please verify.');
    if (!cleanIfsc || cleanIfsc.length < 9) return k.error('Please enter a valid IFSC code (e.g. SBIN0020188)');

    setSaving(true);
    try {
      const payload = {
        employee_id: employee.id,
        employee_name: employee.name,
        account_holder_name: (holderName || employee.name).trim(),
        bank_name: bankName.trim(),
        account_number: cleanAcc,
        ifsc_code: cleanIfsc,
        branch_name: branchName.trim(),
        account_type: accountType || 'Savings',
        upi_id: upiId.trim()
      };

      const res = await fetch('/api/employee/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save bank details');
      }

      k.success('Bank details saved for ' + employee.name);
      if (onSaved) onSaved(data.record || payload);
      onClose();
    } catch (err) {
      console.error(err);
      k.error(err.message || 'Could not save bank details');
    } finally {
      setSaving(false);
    }
  };

  return e.jsx(ms, {
    open: isOpen,
    onOpenChange: (open) => !open && !saving && onClose(),
    children: e.jsxs(us, {
      className: "sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl space-y-5",
      children: [
        e.jsxs(xs, {
          className: "space-y-1 pb-3 border-b border-border/50",
          children: [
            e.jsxs(hs, {
              className: "text-lg font-black text-foreground flex items-center gap-2",
              children: [
                e.jsx("span", { className: "text-xl", children: "🏦" }),
                " Bank Account & Payout Details"
              ]
            }),
            e.jsxs("p", {
              className: "text-xs text-muted-foreground",
              children: [
                "Employee: ",
                e.jsx("strong", { className: "text-foreground", children: employee.name }),
                " • Role: ",
                employee.employee_type || 'Staff'
              ]
            })
          ]
        }),

        // Banking Card Preview Widget if already linked
        initialBank?.account_number && e.jsxs("div", {
          className: "p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white shadow-xl space-y-3",
          children: [
            e.jsxs("div", {
              className: "flex justify-between items-start gap-2",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("span", { className: "text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase", children: "Direct Disbursement Account" }),
                    e.jsx("h4", { className: "text-base font-extrabold text-white mt-0.5", children: initialBank.bank_name })
                  ]
                }),
                e.jsx("span", {
                  className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
                  children: "✓ Linked"
                })
              ]
            }),
            e.jsxs("div", {
              className: "py-1",
              children: [
                e.jsx("span", { className: "text-[9px] text-slate-400 block font-mono uppercase", children: "Account Number" }),
                e.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    e.jsx("span", {
                      className: "font-mono text-lg font-black tracking-widest text-slate-100",
                      children: showMasked ? initialBank.account_number : "•••• •••• •••• " + String(initialBank.account_number).slice(-4)
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => setShowMasked(!showMasked),
                      className: "text-[11px] font-bold text-indigo-300 hover:text-white underline cursor-pointer",
                      children: showMasked ? "Hide" : "Reveal"
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs font-mono",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("span", { className: "text-[9px] text-slate-400 uppercase block", children: "IFSC Code" }),
                    e.jsx("span", { className: "font-bold text-amber-300", children: initialBank.ifsc_code })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("span", { className: "text-[9px] text-slate-400 uppercase block", children: "Type" }),
                    e.jsx("span", { className: "font-bold text-slate-200", children: initialBank.account_type || "Savings" })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("span", { className: "text-[9px] text-slate-400 uppercase block", children: "Branch" }),
                    e.jsx("span", { className: "font-bold text-slate-200 truncate block", children: initialBank.branch_name || "Main Branch" })
                  ]
                })
              ]
            }),
            initialBank.upi_id && e.jsxs("div", {
              className: "text-xs text-slate-300 flex items-center justify-between bg-black/30 px-3 py-1.5 rounded-xl font-mono",
              children: [
                e.jsxs("span", {
                  children: [
                    "UPI VPA: ",
                    e.jsx("strong", { className: "text-emerald-400", children: initialBank.upi_id })
                  ]
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => { navigator.clipboard?.writeText(initialBank.upi_id); k.success("UPI ID copied!"); },
                  className: "text-[10px] text-indigo-300 hover:underline cursor-pointer",
                  children: "Copy UPI"
                })
              ]
            }),
            e.jsxs("div", {
              className: "flex gap-2 pt-1",
              children: [
                e.jsxs(b, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-7 text-[11px] rounded-lg border-white/20 text-white hover:bg-white/10",
                  onClick: () => { navigator.clipboard?.writeText(initialBank.account_number); k.success("Account Number copied!"); },
                  children: ["📋 Copy A/C #"]
                }),
                e.jsxs(b, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-7 text-[11px] rounded-lg border-white/20 text-white hover:bg-white/10",
                  onClick: () => { navigator.clipboard?.writeText(initialBank.ifsc_code); k.success("IFSC Code copied!"); },
                  children: ["📋 Copy IFSC"]
                })
              ]
            })
          ]
        }),

        // Form fields
        e.jsxs("form", {
          onSubmit: handleSave,
          className: "space-y-4",
          children: [
            e.jsxs("div", {
              className: "space-y-1.5",
              children: [
                e.jsx(f, { className: "text-xs font-bold", children: "Account Holder / Beneficiary Name *" }),
                e.jsx(C, {
                  required: true,
                  value: holderName,
                  onChange: (ev) => setHolderName(ev.target.value),
                  placeholder: "Name as registered in bank account",
                  className: "h-9 rounded-xl text-xs bg-background"
                })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-1.5",
              children: [
                e.jsx(f, { className: "text-xs font-bold", children: "Bank Name *" }),
                e.jsx(C, {
                  required: true,
                  value: bankName,
                  onChange: (ev) => setBankName(ev.target.value),
                  placeholder: "e.g. State Bank of India, HDFC Bank, ICICI Bank",
                  className: "h-9 rounded-xl text-xs bg-background"
                }),
                e.jsx("div", {
                  className: "flex flex-wrap gap-1 pt-1",
                  children: popularBanks.map(pb => e.jsx("button", {
                    key: pb,
                    type: "button",
                    onClick: () => setBankName(pb),
                    className: "px-2 py-0.5 rounded-lg text-[10px] bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors border border-border/40 text-muted-foreground",
                    children: pb
                  }))
                })
              ]
            }),

            e.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "Bank Account Number *" }),
                    e.jsx(C, {
                      required: true,
                      type: "text",
                      value: accountNumber,
                      onChange: (ev) => setAccountNumber(ev.target.value.replace(/[^0-9]/g, '')),
                      placeholder: "Enter full account number",
                      className: "h-9 rounded-xl text-xs font-mono bg-background"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "Confirm Account Number *" }),
                    e.jsx(C, {
                      required: true,
                      type: "text",
                      value: confirmAccNumber,
                      onChange: (ev) => setConfirmAccNumber(ev.target.value.replace(/[^0-9]/g, '')),
                      placeholder: "Re-type account number",
                      className: "h-9 rounded-xl text-xs font-mono bg-background"
                    }),
                    confirmAccNumber && (confirmAccNumber === accountNumber ? e.jsx("span", { className: "text-[10px] text-emerald-400 font-bold block", children: "✓ Numbers match" }) : e.jsx("span", { className: "text-[10px] text-destructive font-bold block", children: "⚠️ Numbers do not match" }))
                  ]
                })
              ]
            }),

            e.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "IFSC Code *" }),
                    e.jsx(C, {
                      required: true,
                      value: ifscCode,
                      onChange: (ev) => setIfscCode(ev.target.value.toUpperCase()),
                      placeholder: "e.g. SBIN0020188",
                      maxLength: 11,
                      className: "h-9 rounded-xl text-xs font-mono uppercase bg-background"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "Branch Name / City" }),
                    e.jsx(C, {
                      value: branchName,
                      onChange: (ev) => setBranchName(ev.target.value),
                      placeholder: "e.g. Ghatkesar / Vapi Branch",
                      className: "h-9 rounded-xl text-xs bg-background"
                    })
                  ]
                })
              ]
            }),

            e.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "Account Type" }),
                    e.jsxs("select", {
                      value: accountType,
                      onChange: (ev) => setAccountType(ev.target.value),
                      className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground",
                      children: [
                        e.jsx("option", { value: "Savings", children: "Savings Account" }),
                        e.jsx("option", { value: "Salary", children: "Salary Account" }),
                        e.jsx("option", { value: "Current", children: "Current Account" })
                      ]
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx(f, { className: "text-xs font-bold", children: "UPI ID / VPA (Optional)" }),
                    e.jsx(C, {
                      value: upiId,
                      onChange: (ev) => setUpiId(ev.target.value),
                      placeholder: "e.g. 9876543210@upi",
                      className: "h-9 rounded-xl text-xs font-mono bg-background"
                    })
                  ]
                })
              ]
            }),

            e.jsxs($s, {
              className: "pt-4 border-t border-border/50 flex justify-end gap-2",
              children: [
                e.jsx(b, {
                  type: "button",
                  variant: "outline",
                  onClick: onClose,
                  disabled: saving,
                  className: "rounded-xl text-xs",
                  children: "Cancel"
                }),
                e.jsxs(b, {
                  type: "submit",
                  disabled: saving || (confirmAccNumber && confirmAccNumber !== accountNumber),
                  className: "rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm",
                  children: [
                    saving ? "Saving..." : (initialBank?.account_number ? "Update Bank Details" : "Save Bank Details")
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  });
}
`;

for (const pth of targetBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  // 1. Insert BankDetailsModal before xa definition if not present
  if (!code.includes('function BankDetailsModal')) {
    code = bankModalComponentCode + '\n' + code;
    console.log('✓ Added BankDetailsModal to:', pth);
  }

  // 2. Add bank state and effect inside xa component
  // Find where [l,O]=d.useState([]) is defined
  const targetStateHook = '[l,O]=d.useState([])';
  const injectedStateHooks = '[l,O]=d.useState([]),[bankDetailsMap,setBankDetailsMap]=d.useState({}),[selectedBankEmp,setSelectedBankEmp]=d.useState(null),[isBankModalOpen,setIsBankModalOpen]=d.useState(!1)';
  if (code.includes(targetStateHook) && !code.includes('bankDetailsMap')) {
    code = code.replace(targetStateHook, injectedStateHooks);
    console.log('✓ Injected bankDetailsMap state hooks into:', pth);
  }

  // 3. Add bank details loader in useEffect inside xa
  // We can attach it to company_settings useEffect or add a new useEffect
  const targetEffect = 'd.useEffect(()=>{Ns()},[L,c,S])';
  const injectedEffect = 'd.useEffect(()=>{fetch("/api/employee/bank-details").then(r=>r.json()).then(d=>{if(d?.bankDetails)setBankDetailsMap(d.bankDetails)}).catch(()=>{})},[]),d.useEffect(()=>{Ns()},[L,c,S])';
  if (code.includes(targetEffect) && !code.includes('fetch("/api/employee/bank-details")')) {
    code = code.replace(targetEffect, injectedEffect);
    console.log('✓ Injected bank details fetch effect into:', pth);
  }

  // 4. In Desktop Table Action column:
  // Target:
  // e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg px-2.5",onClick:()=>te(U?.id===s.id?null:s),children:[e.jsx(ds,{className:"w-3.5 h-3.5 mr-1"})," Docs"]})
  const targetDesktopDocsBtn = 'e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg px-2.5",onClick:()=>te(U?.id===s.id?null:s),children:[e.jsx(ds,{className:"w-3.5 h-3.5 mr-1"})," Docs"]})';
  const injectedDesktopBankBtn = 'e.jsxs(b,{size:"sm",variant:bankDetailsMap[s.id]?"outline":"secondary",className:`h-8 text-xs font-semibold rounded-lg px-2.5 ${bankDetailsMap[s.id]?"border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20":"border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"}`,onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},title:bankDetailsMap[s.id]?`${bankDetailsMap[s.id].bank_name} - ${bankDetailsMap[s.id].account_number}`:"Add Bank Account",children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),' + targetDesktopDocsBtn;
  if (code.includes(targetDesktopDocsBtn) && !code.includes('setSelectedBankEmp(s)')) {
    code = code.replace(targetDesktopDocsBtn, injectedDesktopBankBtn);
    console.log('✓ Injected Desktop Bank button into:', pth);
  }

  // 5. In Mobile Card Action row:
  // Target:
  // e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg",onClick:()=>te(U?.id===s.id?null:s),children:[e.jsx(ds,{className:"w-3.5 h-3.5 mr-1"})," Docs"]})
  const targetMobileDocsBtn = 'e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg",onClick:()=>te(U?.id===s.id?null:s),children:[e.jsx(ds,{className:"w-3.5 h-3.5 mr-1"})," Docs"]})';
  const injectedMobileBankBtn = 'e.jsxs(b,{size:"sm",variant:bankDetailsMap[s.id]?"outline":"secondary",className:`h-8 text-xs font-semibold rounded-lg ${bankDetailsMap[s.id]?"border-emerald-500/40 text-emerald-400 bg-emerald-500/10":"border-amber-500/40 text-amber-400 bg-amber-500/10"}`,onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),' + targetMobileDocsBtn;
  if (code.includes(targetMobileDocsBtn)) {
    code = code.replace(targetMobileDocsBtn, injectedMobileBankBtn);
    console.log('✓ Injected Mobile Bank button into:', pth);
  }

  // 6. In Salary & Cycle column:
  // Show bank badge underneath cycle:
  // Target:
  // e.jsxs("span",{className:"text-[10px] text-muted-foreground font-medium flex items-center gap-1",children:[e.jsx("span",{children:"🗓️ Cycle:"})," Day ",s.payroll_cycle_start_day||1,"-",s.payroll_cycle_end_day||30," (Pay on ",s.salary_disbursement_day||10,"th)"]})
  const targetCycleSpan = 'e.jsxs("span",{className:"text-[10px] text-muted-foreground font-medium flex items-center gap-1",children:[e.jsx("span",{children:"🗓️ Cycle:"})," Day ",s.payroll_cycle_start_day||1,"-",s.payroll_cycle_end_day||30," (Pay on ",s.salary_disbursement_day||10,"th)"]})';
  const injectedCycleSpan = targetCycleSpan + ',bankDetailsMap[s.id]?e.jsxs("div",{className:"flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold cursor-pointer hover:underline pt-0.5",onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},title:`${bankDetailsMap[s.id].bank_name} - ${bankDetailsMap[s.id].account_number} (${bankDetailsMap[s.id].ifsc_code})`,children:[e.jsx("span",{},"🏦"),bankDetailsMap[s.id].bank_name.split(" ")[0]," ••••",String(bankDetailsMap[s.id].account_number).slice(-4)]}):e.jsxs("div",{className:"flex items-center gap-1 text-[10px] text-amber-400/90 font-medium cursor-pointer hover:underline pt-0.5",onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},children:[e.jsx("span",{},"⚠️"),"+ Add Bank"]})';
  if (code.includes(targetCycleSpan) && !code.includes('bankDetailsMap[s.id].bank_name.split(" ")[0]')) {
    code = code.replace(targetCycleSpan, injectedCycleSpan);
    console.log('✓ Injected bank badge in Salary & Cycle column in:', pth);
  }

  // 7. Render BankDetailsModal at the end of xa return:
  // Target:
  // e.jsx(Ut,{isOpen:Bs,onClose:()=>Te(!1),employee:Us})
  const targetPhotoModal = 'e.jsx(Ut,{isOpen:Bs,onClose:()=>Te(!1),employee:Us})';
  const injectedBankModalRender = targetPhotoModal + ',e.jsx(BankDetailsModal,{isOpen:isBankModalOpen,onClose:()=>setIsBankModalOpen(!1),employee:selectedBankEmp,initialBank:selectedBankEmp?bankDetailsMap[selectedBankEmp.id]:null,onSaved:rec=>setBankDetailsMap(prev=>({...prev,[rec.employee_id]:rec}))})';
  if (code.includes(targetPhotoModal) && !code.includes('isOpen:isBankModalOpen')) {
    code = code.replace(targetPhotoModal, injectedBankModalRender);
    console.log('✓ Injected BankDetailsModal render into:', pth);
  }

  // 8. In Add/Edit Employee Form: add Bank Account & Settlement Details section
  const targetAttachDocs = 'e.jsxs("div",{className:"pt-6 border-t border-border space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-base font-bold text-foreground",children:"Attach Employee Documents"})';
  const injectedBankFormSection = 'e.jsxs("div",{className:"pt-6 border-t border-border space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs("h4",{className:"text-base font-bold text-foreground flex items-center gap-2",children:[e.jsx("span",{children:"🏦"})," Bank Account & Payout Details"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Employee bank details for monthly salary disbursements, trip advances, and NEFT exports."})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"Account Holder Name"}),e.jsx(C,{placeholder:"e.g. Vinod Kumar Rathod",value:a.account_holder_name||"",onChange:s=>v({...a,account_holder_name:s.target.value}),className:"bg-background h-10 rounded-xl text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"Bank Name"}),e.jsx(C,{placeholder:"e.g. State Bank of India, HDFC",value:a.bank_name||"",onChange:s=>v({...a,bank_name:s.target.value}),className:"bg-background h-10 rounded-xl text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"Account Number"}),e.jsx(C,{placeholder:"e.g. 38291048591",value:a.account_number||"",onChange:s=>v({...a,account_number:s.target.value.replace(/[^0-9]/g,"")}),className:"bg-background h-10 rounded-xl text-xs font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"IFSC Code"}),e.jsx(C,{placeholder:"e.g. SBIN0020188",maxLength:11,value:a.ifsc_code||"",onChange:s=>v({...a,ifsc_code:s.target.value.toUpperCase()}),className:"bg-background h-10 rounded-xl text-xs font-mono uppercase"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"Branch Name / City"}),e.jsx(C,{placeholder:"e.g. Ghatkesar Main Branch",value:a.branch_name||"",onChange:s=>v({...a,branch_name:s.target.value}),className:"bg-background h-10 rounded-xl text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(f,{className:"text-xs font-semibold",children:"Account Type"}),e.jsxs("select",{value:a.account_type||"Savings",onChange:s=>v({...a,account_type:s.target.value}),className:"bg-background h-10 rounded-xl text-xs border border-border px-3 text-foreground w-full",children:[e.jsx("option",{value:"Savings",children:"Savings Account"}),e.jsx("option",{value:"Salary",children:"Salary Account"}),e.jsx("option",{value:"Current",children:"Current Account"})]})]}),e.jsxs("div",{className:"space-y-1.5 md:col-span-3",children:[e.jsx(f,{className:"text-xs font-semibold",children:"UPI ID / VPA (Optional)"}),e.jsx(C,{placeholder:"e.g. 6281618046@sbi",value:a.upi_id||"",onChange:s=>v({...a,upi_id:s.target.value}),className:"bg-background h-10 rounded-xl text-xs font-mono"})]})]})]}),' + targetAttachDocs;
  if (code.includes(targetAttachDocs) && !code.includes('Bank Account & Payout Details')) {
    code = code.replace(targetAttachDocs, injectedBankFormSection);
    console.log('✓ Injected Bank Account section in Add/Edit Employee Form in:', pth);
  }

  // 9. In es(s): pre-fill bank fields when editing employee
  const targetEs = 'es=(s,t=0)=>{se(s.id);';
  const injectedEs = 'es=(s,t=0)=>{se(s.id);const _bk=bankDetailsMap[s.id]||{};';
  if (code.includes(targetEs) && !code.includes('const _bk=bankDetailsMap[s.id]')) {
    code = code.replace(targetEs, injectedEs);
  }
  const targetEsState = 'education:s.education||"",payroll_cycle_start_day:';
  const injectedEsState = 'education:s.education||"",bank_name:_bk.bank_name||"",account_number:_bk.account_number||"",ifsc_code:_bk.ifsc_code||"",account_holder_name:_bk.account_holder_name||s.name||"",branch_name:_bk.branch_name||"",account_type:_bk.account_type||"Savings",upi_id:_bk.upi_id||"",payroll_cycle_start_day:';
  if (code.includes(targetEsState) && !code.includes('bank_name:_bk.bank_name')) {
    code = code.replace(targetEsState, injectedEsState);
    console.log('✓ Injected bank fields pre-fill in es(s) in:', pth);
  }

  // 10. In Qs: persist bank details when submitting Add/Update employee
  const targetSaveSuccess = 've=P.record,k.success("Employee added successfully")}';
  const injectedSaveSuccess = 've=P.record,k.success("Employee added successfully")};if(a.bank_name||a.account_number||a.ifsc_code){const _bPayload={employee_id:ve?.id||N,employee_name:a.name,account_holder_name:a.account_holder_name||a.name,bank_name:(a.bank_name||"").trim(),account_number:String(a.account_number||"").replace(/[\\s-]/g,""),ifsc_code:String(a.ifsc_code||"").trim().toUpperCase(),branch_name:(a.branch_name||"").trim(),account_type:a.account_type||"Savings",upi_id:(a.upi_id||"").trim()};fetch("/api/employee/bank-details",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(_bPayload)}).catch(()=>{});setBankDetailsMap(p=>({...p,[ve?.id||N]:_bPayload}))}';
  if (code.includes(targetSaveSuccess) && !code.includes('fetch("/api/employee/bank-details",{method:"POST"')) {
    code = code.replace(targetSaveSuccess, injectedSaveSuccess);
    console.log('✓ Injected bank details persistence in Qs in:', pth);
  }

  // 11. AST Validation
  try {
    parser.parse(code, { sourceType: 'module' });
    fs.writeFileSync(pth, code, 'utf8');
    console.log('🎉 Successfully saved and verified AST for:', pth);
  } catch (err) {
    console.error('❌ AST parse error on', pth, err.message);
    process.exit(1);
  }
}

console.log('=== All EmployeeDatabasePage bundles patched successfully! ===');
