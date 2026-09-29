const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const bundleFiles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js'
];

const viewerModalDef = `
function JobCardBillsViewerModal({ isOpen, onClose, bills = [], initialIndex = 0, jobCard = null }) {
  if (!isOpen || !bills || bills.length === 0) return null;
  const [currentIndex, setCurrentIndex] = p.useState(initialIndex || 0);
  const [touchStart, setTouchStart] = p.useState(null);

  p.useEffect(() => {
    setCurrentIndex(initialIndex >= 0 && initialIndex < bills.length ? initialIndex : 0);
  }, [initialIndex, bills]);

  const hasMultiple = bills.length > 1;
  const currentBill = bills[currentIndex] || bills[0];
  const isPdf = Boolean(currentBill?.url && (currentBill.url.toLowerCase().includes(".pdf") || (currentBill.name && currentBill.name.toLowerCase().endsWith(".pdf"))));

  const handlePrev = (ev) => {
    ev && ev.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : bills.length - 1));
  };

  const handleNext = (ev) => {
    ev && ev.stopPropagation();
    setCurrentIndex((prev) => (prev < bills.length - 1 ? prev + 1 : 0));
  };

  p.useEffect(() => {
    const handleKeyDown = (ev) => {
      if (!isOpen) return;
      if (ev.key === "ArrowLeft") handlePrev();
      else if (ev.key === "ArrowRight") handleNext();
      else if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, bills.length]);

  const handleTouchStart = (ev) => {
    setTouchStart(ev.touches[0].clientX);
  };
  const handleTouchEnd = (ev) => {
    if (touchStart === null) return;
    const diff = touchStart - ev.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStart(null);
  };

  return e.jsx(vt, {
    open: true,
    onOpenChange: onClose,
    children: e.jsxs(Nt, {
      className: "max-w-4xl w-[95vw] md:w-full max-h-[95vh] bg-slate-950/95 backdrop-blur-xl border border-slate-800 text-white rounded-2xl p-0 overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 select-none",
      children: [
        e.jsxs("div", {
          className: "flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2.5 min-w-0 pr-2",
              children: [
                e.jsx("span", {
                  className: "text-amber-400 font-bold text-xs uppercase px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0",
                  children: "Bill " + (currentIndex + 1) + " of " + bills.length
                }),
                e.jsxs("div", {
                  className: "min-w-0 truncate",
                  children: [
                    e.jsxs("span", {
                      className: "font-mono font-bold text-xs text-white",
                      children: [(jobCard?.job_card_number ? jobCard.job_card_number + " • " : ""), (jobCard?.truck_number ? jobCard.truck_number + " • " : "")]
                    }),
                    e.jsx("span", {
                      className: "text-xs text-slate-400 truncate ml-1",
                      children: currentBill?.name || ("Bill #" + (currentIndex + 1))
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "flex items-center gap-1.5 shrink-0",
              children: [
                currentBill?.url && e.jsxs("a", {
                  href: currentBill.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  download: currentBill.name || true,
                  className: "h-8 px-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 text-xs font-semibold transition-all",
                  title: "Open full-size in new tab",
                  children: [e.jsx(Re, { className: "w-3 h-3" }), " Open"]
                }),
                e.jsx("button", {
                  onClick: onClose,
                  className: "h-8 w-8 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center font-bold text-base transition-all",
                  title: "Close (Esc)",
                  children: "✕"
                })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "relative flex-1 min-h-[60vh] max-h-[75vh] flex items-center justify-center bg-black/60 p-2 md:p-4 overflow-hidden",
          onTouchStart: handleTouchStart,
          onTouchEnd: handleTouchEnd,
          children: [
            hasMultiple && e.jsx("button", {
              type: "button",
              onClick: handlePrev,
              className: "absolute left-2 md:left-4 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg font-black",
              title: "Previous Bill (Left Arrow)",
              children: "◀"
            }),
            e.jsx("div", {
              className: "w-full h-full flex items-center justify-center p-1",
              children: isPdf
                ? e.jsx("iframe", {
                    src: currentBill.url,
                    title: currentBill.name || "PDF Document",
                    className: "w-full h-[65vh] rounded-xl border border-slate-800 bg-white shadow-xl"
                  })
                : e.jsx("img", {
                    src: currentBill.url,
                    alt: currentBill.name || ("Bill " + (currentIndex + 1)),
                    className: "max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl mx-auto transition-all duration-150"
                  })
            }),
            hasMultiple && e.jsx("button", {
              type: "button",
              onClick: handleNext,
              className: "absolute right-2 md:right-4 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg font-black",
              title: "Next Bill (Right Arrow)",
              children: "▶"
            })
          ]
        }),
        hasMultiple && e.jsx("div", {
          className: "px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center gap-2 overflow-x-auto shrink-0",
          children: bills.map((b, idx) => e.jsxs("button", {
            key: b.url || idx,
            type: "button",
            onClick: () => setCurrentIndex(idx),
            className: "h-11 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 " + (idx === currentIndex ? "bg-amber-500/20 text-amber-400 border-amber-500 ring-2 ring-amber-400/40" : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"),
            children: [
              e.jsx(Re, { className: "w-3 h-3 text-amber-400" }),
              "#" + (idx + 1)
            ]
          }))
        })
      ]
    })
  });
}
`;

for (const relPath of bundleFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  let code = fs.readFileSync(fullPath, 'utf8');

  // 1. Insert JobCardBillsViewerModal definition before LogTruckProblemModal
  if (!code.includes('function JobCardBillsViewerModal')) {
    code = code.replace('function LogTruckProblemModal', viewerModalDef + '\nfunction LogTruckProblemModal');
  }

  // 2. State in gr: viewerOpen, viewerBills, viewerIndex, viewerJobCard and openBillsViewer function
  const stateTarget = `[logProblemOpen, setLogProblemOpen]=p.useState(!1),[logProblemTruck, setLogProblemTruck]=p.useState(""),`;
  const stateReplace = `[viewerOpen, setViewerOpen]=p.useState(!1),[viewerBills, setViewerBills]=p.useState([]),[viewerIndex, setViewerIndex]=p.useState(0),[viewerJobCard, setViewerJobCard]=p.useState(null);const openBillsViewer=(B,idx=0,jc=null)=>{if(!B||B.length===0)return;setViewerBills(B);setViewerIndex(idx);setViewerJobCard(jc);setViewerOpen(!0)};const [logProblemOpen, setLogProblemOpen]=p.useState(!1),[logProblemTruck, setLogProblemTruck]=p.useState(""),`;
  if (code.includes(stateTarget)) {
    code = code.replace(stateTarget, stateReplace);
  }

  // 3. Desktop Table: replace <a href=...> with button that calls openBillsViewer(r, s, t)
  const deskTableBillsTarget = `r.length===0?e.jsx("span",{className:"text-muted-foreground text-xs",children:"—"}):r.length===1?e.jsxs("a",{href:r[0].url,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md",title:"Open attached bill / receipt",children:[e.jsx(Re,{className:"w-3 h-3"})," Bill"]}):e.jsx("div",{className:"flex flex-wrap items-center justify-center gap-1",children:r.map((a,s)=>e.jsxs("a",{href:a.url,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded",title:\`Open \${a.name||\`Bill #\${s+1}\`}\`,children:[e.jsx(Re,{className:"w-2.5 h-2.5"}),\` #\${s+1}\`]}))})`;
  const deskTableBillsReplace = `r.length===0?e.jsx("span",{className:"text-muted-foreground text-xs",children:"—"}):r.length===1?e.jsxs("button",{type:"button",onClick:()=>openBillsViewer(r,0,t),className:"inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md cursor-pointer transition-all",title:"View attached bill photo",children:[e.jsx(Re,{className:"w-3 h-3"})," Bill"]}):e.jsx("div",{className:"flex flex-wrap items-center justify-center gap-1",children:r.map((a,s)=>e.jsxs("button",{key:s,type:"button",onClick:()=>openBillsViewer(r,s,t),className:"inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded cursor-pointer transition-all hover:scale-105 active:scale-95",title:\`View \${a.name||\`Bill #\${s+1}\`}\`,children:[e.jsx(Re,{className:"w-2.5 h-2.5"}),\` #\${s+1}\`]}))})`;
  if (code.includes(deskTableBillsTarget)) {
    code = code.replace(deskTableBillsTarget, deskTableBillsReplace);
  }

  // 4. Mobile Cards: replace <a href=...> with button that calls openBillsViewer(r, 0, t)
  const mobileCardBillsTarget = `r.length>0&&e.jsxs("a",{href:r[0].url,target:"_blank",rel:"noopener noreferrer",className:"h-8 px-2.5 text-[11px] font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1",title:"Open Bill",children:[e.jsx(Re,{className:"w-3.5 h-3.5"})," Bill"]})`;
  const mobileCardBillsReplace = `r.length>0&&e.jsxs("button",{type:"button",onClick:()=>openBillsViewer(r,0,t),className:"h-8 px-2.5 text-[11px] font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer transition-all",title:"View Bill Photos",children:[e.jsx(Re,{className:"w-3.5 h-3.5"}),r.length>1?\`Bills (\${r.length})\`:"Bill"]})`;
  if (code.includes(mobileCardBillsTarget)) {
    code = code.replace(mobileCardBillsTarget, mobileCardBillsReplace);
  }

  // 5. In tr signature: add onOpenBillsViewer:_obv
  const trSigTarget = `function tr({isOpen:C,onClose:h,jobCard:i,trucks:I=[],onSaved:G,problemsList:_pl=[],onOpenLogProblem:_olp}){`;
  const trSigReplace = `function tr({isOpen:C,onClose:h,jobCard:i,trucks:I=[],onSaved:G,problemsList:_pl=[],onOpenLogProblem:_olp,onOpenBillsViewer:_obv}){`;
  if (code.includes(trSigTarget)) {
    code = code.replace(trSigTarget, trSigReplace);
  }

  // 6. In tr modal bill view button: call _obv(T, m) instead of window.open
  const trViewBtnTarget = `onClick:()=>window.open(l.url,"_blank"),className:"h-7 text-[11px] font-bold rounded-lg border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2",children:[e.jsx(Ss,{className:"w-3 h-3 mr-1"})," View"]`;
  const trViewBtnReplace = `onClick:()=>_obv?_obv(T,m):window.open(l.url,"_blank"),className:"h-7 text-[11px] font-bold rounded-lg border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 cursor-pointer",children:[e.jsx(Ss,{className:"w-3 h-3 mr-1"})," View"]`;
  if (code.includes(trViewBtnTarget)) {
    code = code.replace(trViewBtnTarget, trViewBtnReplace);
  }

  // 7. Pass onOpenBillsViewer to tr call and mount JobCardBillsViewerModal
  const trCallTarget = `problemsList:D,onOpenLogProblem:(tk)=>{setLogProblemTruck(tk||"");setLogProblemOpen(!0)}}),`;
  const trCallReplace = `problemsList:D,onOpenLogProblem:(tk)=>{setLogProblemTruck(tk||"");setLogProblemOpen(!0)},onOpenBillsViewer:(B,idx)=>openBillsViewer(B,idx,B)}),e.jsx(JobCardBillsViewerModal,{isOpen:viewerOpen,onClose:()=>setViewerOpen(!1),bills:viewerBills,initialIndex:viewerIndex,jobCard:viewerJobCard}),`;
  if (code.includes(trCallTarget)) {
    code = code.replace(trCallTarget, trCallReplace);
  }

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log('✅ Patched', relPath);
}

const testCode = fs.readFileSync('dist/assets/MaintenancePage-FpBhnDc2.js', 'utf8');
try {
  esbuild.transformSync(testCode, { loader: 'js' });
  console.log('🎉 Syntax is 100% VALID!');
} catch (err) {
  console.error('Syntax error:', err);
  process.exit(1);
}
