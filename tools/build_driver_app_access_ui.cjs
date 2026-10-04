const fs = require('fs');
const path = require('path');

console.log('🚀 Building Driver App Access Office Section & Search Upgrades into EmployeeDatabasePage...');

const bundlePaths = [
  'dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/web/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/api/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'dist/apps/web/assets/EmployeeDatabasePage-CnJ6LyN5.js'
];

// Definition of DriverAppAccessModal component
const driverAppAccessModalCode = `
function DriverAppAccessModal({ isOpen, onClose, employee }) {
  const [loading, setLoading] = d.useState(true);
  const [accountStatus, setAccountStatus] = d.useState(null);
  const [customPassword, setCustomPassword] = d.useState('');
  const [generatedPassAlert, setGeneratedPassAlert] = d.useState(null);
  const [actionLoading, setActionLoading] = d.useState(false);
  const [copied, setCopied] = d.useState(false);
  const [errorMsg, setErrorMsg] = d.useState('');

  const fetchStatus = () => {
    if (!employee || !isOpen) return;
    setLoading(true);
    setErrorMsg('');
    fetch('/api/driver/office/driver-access/status/' + employee.id)
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          setAccountStatus(data);
        } else {
          setAccountStatus({ hasAccount: false });
        }
      })
      .catch(err => {
        setErrorMsg('Network error: ' + err.message);
        setAccountStatus({ hasAccount: false });
      })
      .finally(() => setLoading(false));
  };

  d.useEffect(() => {
    if (isOpen && employee) {
      setGeneratedPassAlert(null);
      setCopied(false);
      setCustomPassword('');
      fetchStatus();
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return null;

  const handleCreate = () => {
    setActionLoading(true);
    setErrorMsg('');
    fetch('/api/driver/office/driver-access/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: employee.id,
        temporaryPassword: customPassword.trim() || undefined
      })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setGeneratedPassAlert(res.temporaryPassword);
          fetchStatus();
        } else {
          setErrorMsg(res.error || 'Failed to create driver account');
        }
      })
      .catch(e => setErrorMsg(e.message))
      .finally(() => setActionLoading(false));
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset credentials for ' + employee.name + '? All existing mobile sessions will be revoked.')) return;
    setActionLoading(true);
    setErrorMsg('');
    fetch('/api/driver/office/driver-access/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employee.id })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setGeneratedPassAlert(res.temporaryPassword);
          fetchStatus();
        } else {
          setErrorMsg(res.error || 'Failed to reset password');
        }
      })
      .catch(e => setErrorMsg(e.message))
      .finally(() => setActionLoading(false));
  };

  const handleToggle = (nextStatus) => {
    setActionLoading(true);
    setErrorMsg('');
    fetch('/api/driver/office/driver-access/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employee.id, status: nextStatus })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          fetchStatus();
        } else {
          setErrorMsg(res.error || 'Failed to update account status');
        }
      })
      .catch(e => setErrorMsg(e.message))
      .finally(() => setActionLoading(false));
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const empCode = employee.employee_code || (accountStatus && accountStatus.employeeCode) || 'Driver';

  return e.jsx("div", {
    className: "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4",
    onClick: onClose,
    children: e.jsxs("div", {
      className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95",
      onClick: ev => ev.stopPropagation(),
      children: [
        // Modal Header
        e.jsxs("div", {
          className: "px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("div", {
                  className: "w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl shadow-inner",
                  children: "📱"
                }),
                e.jsxs("div", {
                  children: [
                    e.jsxs("h3", {
                      className: "font-bold text-base text-white flex items-center gap-2",
                      children: [
                        employee.name,
                        e.jsx("span", {
                          className: "px-2 py-0.5 text-xs font-mono font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md",
                          children: empCode
                        })
                      ]
                    }),
                    e.jsx("p", {
                      className: "text-xs text-slate-400",
                      children: "Office Driver App Access & Authentication Management"
                    })
                  ]
                })
              ]
            }),
            e.jsx("button", {
              onClick: onClose,
              className: "text-slate-400 hover:text-white rounded-lg p-1.5 transition-colors",
              children: "✕"
            })
          ]
        }),

        // Modal Body
        e.jsxs("div", {
          className: "p-6 space-y-4 max-h-[80vh] overflow-y-auto",
          children: [
            errorMsg && e.jsxs("div", {
              className: "p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2",
              children: [e.jsx("span", {}, "⚠️"), errorMsg]
            }),

            // Generated Password Alert (Shown ONCE only)
            generatedPassAlert && e.jsxs("div", {
              className: "p-4 bg-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl space-y-3 shadow-lg",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2 text-emerald-300 font-bold text-sm",
                  children: [e.jsx("span", { className: "text-base" }, "🔑"), "Temporary Password Generated"]
                }),
                e.jsx("p", {
                  className: "text-xs text-emerald-200/90 leading-relaxed",
                  children: "Share this temporary password securely with the driver. For security, it will NOT be displayed again. The driver will be required to change it on their first login in the Android app."
                }),
                e.jsxs("div", {
                  className: "p-3 bg-slate-950 border border-emerald-500/40 rounded-xl flex items-center justify-between font-mono",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("div", { className: "text-[10px] text-slate-400 uppercase tracking-wider", children: "Temporary Password" }),
                        e.jsx("div", { className: "text-lg font-black tracking-widest text-emerald-400 select-all", children: generatedPassAlert })
                      ]
                    }),
                    e.jsx("button", {
                      onClick: () => copyToClipboard(generatedPassAlert),
                      className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95",
                      children: copied ? "✓ Copied!" : "📋 Copy"
                    })
                  ]
                })
              ]
            }),

            loading ? e.jsxs("div", {
              className: "py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm",
              children: [
                e.jsx("div", { className: "w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" }),
                e.jsx("p", {}, "Checking driver app credentials...")
              ]
            }) : (
              accountStatus && accountStatus.hasAccount ? e.jsxs("div", {
                className: "space-y-4",
                children: [
                  // Status card
                  e.jsxs("div", {
                    className: "p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center justify-between pb-2 border-b border-slate-800/80",
                        children: [
                          e.jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Login Identifier" }),
                          e.jsx("span", { className: "text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20", children: accountStatus.employeeCode })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between pb-2 border-b border-slate-800/80",
                        children: [
                          e.jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Account Status" }),
                          e.jsx("span", {
                            className: "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider " + (accountStatus.accountStatus === 'active' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"),
                            children: accountStatus.accountStatus
                          })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between pb-2 border-b border-slate-800/80",
                        children: [
                          e.jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Password Status" }),
                          accountStatus.mustChangePassword ? e.jsx("span", { className: "text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30", children: "⚠️ First-login change pending" }) : e.jsx("span", { className: "text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30", children: "✓ Password established" })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          e.jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Last Mobile Login" }),
                          e.jsx("span", { className: "text-xs text-slate-300 font-mono", children: accountStatus.lastLoginAt ? new Date(accountStatus.lastLoginAt).toLocaleString('en-IN') : 'Never logged in' })
                        ]
                      })
                    ]
                  }),

                  accountStatus.isLocked && e.jsxs("div", {
                    className: "p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2",
                    children: [e.jsx("span", {}, "🔒"), "Account is temporarily locked due to consecutive incorrect password attempts. Resetting the password will unlock the account immediately."]
                  }),

                  // Actions
                  e.jsxs("div", {
                    className: "pt-2 flex flex-col gap-2.5",
                    children: [
                      e.jsxs("button", {
                        onClick: handleReset,
                        disabled: actionLoading,
                        className: "w-full py-2.5 px-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50",
                        children: [e.jsx("span", {}, "🔄"), actionLoading ? "Resetting..." : "Reset Temporary Password & Revoke Sessions"]
                      }),
                      accountStatus.accountStatus === 'active' ? e.jsxs("button", {
                        onClick: () => handleToggle('disabled'),
                        disabled: actionLoading,
                        className: "w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50",
                        children: [e.jsx("span", {}, "🚫"), actionLoading ? "Updating..." : "Disable Driver App Access"]
                      }) : e.jsxs("button", {
                        onClick: () => handleToggle('active'),
                        disabled: actionLoading,
                        className: "w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50",
                        children: [e.jsx("span", {}, "✅"), actionLoading ? "Updating..." : "Re-Enable Driver App Access"]
                      })
                    ]
                  })
                ]
              }) : e.jsxs("div", {
                className: "space-y-4 py-2",
                children: [
                  e.jsxs("div", {
                    className: "p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-2",
                    children: [
                      e.jsxs("div", { className: "flex items-center gap-2 text-blue-400 font-bold text-sm", children: [e.jsx("span", {}, "ℹ️"), "No Active Mobile Account"] }),
                      e.jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: "This driver does not have mobile app login credentials yet. Creating access will register their permanent employee code and generate temporary credentials for the Android app." })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      e.jsx("label", { className: "block text-xs font-semibold text-slate-300", children: "Custom Temporary Password (Optional)" }),
                      e.jsx("input", {
                        type: "text",
                        value: customPassword,
                        onChange: ev => setCustomPassword(ev.target.value),
                        placeholder: "Leave empty to auto-generate strong password (recommended)",
                        className: "w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      }),
                      e.jsx("p", { className: "text-[11px] text-slate-500", children: "If left blank, a secure password such as JBC-9xK2!4 will be generated automatically." })
                    ]
                  }),
                  e.jsxs("button", {
                    onClick: handleCreate,
                    disabled: actionLoading,
                    className: "w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50",
                    children: [e.jsx("span", {}, "🔑"), actionLoading ? "Creating Credentials..." : "Generate Driver App Login"]
                  })
                ]
              })
            )
          ]
        }),

        // Modal Footer
        e.jsx("div", {
          className: "px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end",
          children: e.jsx("button", {
            onClick: onClose,
            className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors",
            children: "Close"
          })
        })
      ]
    })
  });
}
`;

bundlePaths.forEach(fileRel => {
  const filePath = path.resolve(process.cwd(), fileRel);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Inject DriverAppAccessModal component before BankDetailsModal
  if (!code.includes('function DriverAppAccessModal')) {
    code = driverAppAccessModalCode + '\n' + code;
    console.log(`✓ Prepended DriverAppAccessModal to ${fileRel}`);
  }

  // 2. Add state [selectedAccessEmp, setSelectedAccessEmp] and [isAccessModalOpen, setIsAccessModalOpen]
  const oldStateHook = '[selectedBankEmp,setSelectedBankEmp]=d.useState(null),[isBankModalOpen,setIsBankModalOpen]=d.useState(!1),';
  const newStateHook = '[selectedBankEmp,setSelectedBankEmp]=d.useState(null),[isBankModalOpen,setIsBankModalOpen]=d.useState(!1),[selectedAccessEmp,setSelectedAccessEmp]=d.useState(null),[isAccessModalOpen,setIsAccessModalOpen]=d.useState(!1),';
  if (code.includes(oldStateHook) && !code.includes('selectedAccessEmp')) {
    code = code.replace(oldStateHook, newStateHook);
    console.log(`✓ Injected driver access modal state to ${fileRel}`);
  }

  // 3. Update search filter to check employee_code
  const oldSearchFilter = 'return s.name?.toLowerCase().includes(n)||s.contact?.toLowerCase().includes(n)||s.emergency_contact?.toLowerCase().includes(n)||s.address?.toLowerCase().includes(n)';
  const newSearchFilter = 'return(s.employee_code?.toLowerCase().includes(n)||(typeof Ue==="function"&&Ue(s,l)?.toLowerCase().includes(n))||s.name?.toLowerCase().includes(n)||s.contact?.toLowerCase().includes(n)||s.emergency_contact?.toLowerCase().includes(n)||s.address?.toLowerCase().includes(n))';
  if (code.includes(oldSearchFilter)) {
    code = code.replace(oldSearchFilter, newSearchFilter);
    console.log(`✓ Updated search filter with employee_code in ${fileRel}`);
  }

  // 4. Update desktop table rendering to map gs (filtered/searched) instead of l (unfiltered)
  const oldTableMap = 'children:l.length===0?e.jsx(B,{children:e.jsx(x,{colSpan:9,className:"h-48 text-center text-muted-foreground",children:"No employees found."})}):l.map(s=>{const t=Ue(s,l),r=ls(s,l);';
  const newTableMap = 'children:gs.length===0?e.jsx(B,{children:e.jsx(x,{colSpan:9,className:"h-48 text-center text-muted-foreground",children:"No employees found."})}):gs.map(s=>{const t=Ue(s,l),r=ls(s,l);';
  if (code.includes(oldTableMap)) {
    code = code.replace(oldTableMap, newTableMap);
    console.log(`✓ Updated desktop table mapping to filtered gs in ${fileRel}`);
  }

  // 5. Add "📱 App Access" button to Desktop Actions Column
  const oldDesktopActions = 'onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},title:bankDetailsMap[s.id]?`${bankDetailsMap[s.id].bank_name} - ${bankDetailsMap[s.id].account_number}`:"Add Bank Account",children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",';
  const newDesktopActions = 'onClick:()=>{setSelectedBankEmp(s),setIsBankModalOpen(!0)},title:bankDetailsMap[s.id]?`${bankDetailsMap[s.id].bank_name} - ${bankDetailsMap[s.id].account_number}`:"Add Bank Account",children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),(s.employee_type==="driver"||String(t).startsWith("D"))&&e.jsxs(b,{size:"sm",variant:"outline",className:"h-8 text-xs font-semibold rounded-lg px-2.5 border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",onClick:()=>{setSelectedAccessEmp(s),setIsAccessModalOpen(!0)},title:"Driver App Access & Credentials",children:[e.jsx("span",{className:"mr-1"},"📱"),"App Access"]}),e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",';
  if (code.includes(oldDesktopActions)) {
    code = code.replace(oldDesktopActions, newDesktopActions);
    console.log(`✓ Injected App Access button to desktop actions in ${fileRel}`);
  }

  // 6. Add "📱 App Access" button to Mobile Actions Row
  const oldMobileActions = 'children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg",onClick:()=>te(U?.id===s.id?null:s),';
  const newMobileActions = 'children:[e.jsx("span",{className:"mr-1"},"🏦"),bankDetailsMap[s.id]?"Bank":"+ Bank"]}),(s.employee_type==="driver"||String(t).startsWith("D"))&&e.jsxs(b,{size:"sm",variant:"outline",className:"h-8 text-xs font-semibold rounded-lg px-2 border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",onClick:()=>{setSelectedAccessEmp(s),setIsAccessModalOpen(!0)},children:[e.jsx("span",{className:"mr-1"},"📱"),"App"]}),e.jsxs(b,{size:"sm",variant:U?.id===s.id?"secondary":"outline",className:"h-8 text-xs font-semibold rounded-lg",onClick:()=>te(U?.id===s.id?null:s),';
  if (code.includes(oldMobileActions)) {
    code = code.replace(oldMobileActions, newMobileActions);
    console.log(`✓ Injected App button to mobile actions in ${fileRel}`);
  }

  // 7. Render DriverAppAccessModal component in DOM
  const oldBankModalRender = 'e.jsx(BankDetailsModal,{isOpen:isBankModalOpen,onClose:()=>setIsBankModalOpen(!1),employee:selectedBankEmp,initialBank:selectedBankEmp?bankDetailsMap[selectedBankEmp.id]:null,onSaved:(b)=>{if(selectedBankEmp){setBankDetailsMap(p=>({...p,[selectedBankEmp.id]:b}))}}})';
  const newBankModalRender = oldBankModalRender + ',e.jsx(DriverAppAccessModal,{isOpen:isAccessModalOpen,onClose:()=>{setIsAccessModalOpen(!1);setSelectedAccessEmp(null);},employee:selectedAccessEmp})';
  if (code.includes(oldBankModalRender) && !code.includes('isOpen:isAccessModalOpen')) {
    code = code.replace(oldBankModalRender, newBankModalRender);
    console.log(`✓ Injected DriverAppAccessModal render into JSX tree in ${fileRel}`);
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✅ Successfully updated ${fileRel}`);
});
