const fs = require('fs');
const esbuild = require('esbuild');
const parser = require('@babel/parser');

console.log('=== Step 1: Compiling ExpenseBillsViewerModal and Helper ===');

const viewerComponentJSX = `
function ExpenseBillsViewerModal({ isOpen, onClose, bills = [], initialIndex = 0, expense = null, onReupload = null }) {
  if (!isOpen || !bills || bills.length === 0) return null;
  const [currentIndex, setCurrentIndex] = i.useState(initialIndex || 0);
  const [rotations, setRotations] = i.useState({});
  const [zoom, setZoom] = i.useState(1);
  const [pan, setPan] = i.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = i.useState(false);
  const [dragStart, setDragStart] = i.useState({ x: 0, y: 0 });
  const [imgError, setImgError] = i.useState(false);
  const [fallbackTried, setFallbackTried] = i.useState(false);

  i.useEffect(() => {
    setCurrentIndex(initialIndex >= 0 && initialIndex < bills.length ? initialIndex : 0);
    setImgError(false);
    setFallbackTried(false);
  }, [initialIndex, bills]);

  i.useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgError(false);
    setFallbackTried(false);
  }, [currentIndex]);

  const count = bills.length;
  const cur = bills[currentIndex] || bills[0];
  const isPdf = Boolean(cur?.url && (cur.url.toLowerCase().includes('.pdf') || (cur.name && cur.name.toLowerCase().endsWith('.pdf'))));
  const rot = (rotations[currentIndex] || 0) % 360;

  i.useEffect(() => {
    const handleKey = (ev) => {
      if (!isOpen) return;
      if (ev.key === 'Escape') onClose();
      else if (ev.key === 'ArrowRight' && count > 1) setCurrentIndex(idx => (idx + 1) % count);
      else if (ev.key === 'ArrowLeft' && count > 1) setCurrentIndex(idx => (idx - 1 + count) % count);
      else if (ev.key === 'r' || ev.key === 'R') setRotations(r => ({ ...r, [currentIndex]: ((r[currentIndex] || 0) + 90) % 360 }));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, count, currentIndex]);

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = (e) => {
    e && e.stopPropagation();
    if (!cur?.url) return;
    const a = document.createElement('a');
    a.href = cur.url;
    a.download = cur.name || 'expense_bill';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getActiveUrl = () => {
    if (!cur?.url) return '';
    if (fallbackTried && cur.url.includes('/hcgi/platform/api/files/')) {
      return cur.url.replace('/hcgi/platform/api/files/', '/api/files/');
    }
    return cur.url;
  };

  const formattedAmount = expense?.amount ? '₹' + Number(expense.amount).toLocaleString('en-IN') : '';
  const expenseDate = expense?.date ? new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full shrink-0">
              🧾 Bill Viewer
            </span>
            <div className="min-w-0 truncate">
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                {expense?.description || cur.name || 'Expense Receipt'}
              </h3>
              <p className="text-xs text-zinc-400 truncate flex items-center gap-2">
                {formattedAmount && <span className="font-semibold text-emerald-400">{formattedAmount}</span>}
                {expense?.category && <span>• {expense.category}</span>}
                {expenseDate && <span>• {expenseDate}</span>}
                {count > 1 && <span className="text-amber-400 font-bold">• Bill {currentIndex + 1} of {count}</span>}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setRotations(r => ({ ...r, [currentIndex]: ((r[currentIndex] || 0) + 270) % 360 })); }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Rotate Left 90° (Key: R)"
            >
              <span className="text-sm">↺</span>
              <span className="hidden sm:inline">Rotate</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setRotations(r => ({ ...r, [currentIndex]: ((r[currentIndex] || 0) + 90) % 360 })); }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Rotate Right 90°"
            >
              <span className="text-sm">↻</span>
            </button>

            {!isPdf && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.25)); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="px-2 h-7 sm:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold transition-colors hidden sm:flex items-center justify-center cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.25)); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Download Original File"
            >
              <span>⬇</span>
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={getActiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
              title="Open in New Tab"
            >
              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 text-base font-bold transition-colors flex items-center justify-center ml-1 cursor-pointer"
              title="Close Viewer (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Viewer Canvas */}
        <div 
          className="relative flex-1 min-h-[50vh] max-h-[72vh] bg-zinc-950/90 flex items-center justify-center overflow-hidden p-4 select-none cursor-default"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {isPdf ? (
            <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
              <iframe 
                src={getActiveUrl()} 
                className="w-full h-[65vh] rounded-lg border border-zinc-800 bg-white" 
                title={cur.name || 'PDF Document'} 
              />
            </div>
          ) : imgError ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/90 rounded-2xl border border-dashed border-amber-500/40 max-w-md w-full my-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-bold">
                ⚠️
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Bill Photo Needs Refresh</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  The original image file could not be rendered from the primary server URL. You can re-upload or replace this bill with 1 click.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
                {onReupload && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onReupload(); }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    📁 Upload / Replace Bill
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
              <img
                src={getActiveUrl()}
                alt={cur.name || 'Bill Preview'}
                style={{
                  transform: \`rotate(\${rot}deg) scale(\${zoom}) translate(\${pan.x / zoom}px, \${pan.y / zoom}px)\`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                className="max-w-full max-h-[66vh] object-contain rounded-lg shadow-2xl border border-zinc-800/80 bg-white"
                onError={() => {
                  if (!fallbackTried && cur?.url && cur.url.includes('/hcgi/platform/api/files/')) {
                    setFallbackTried(true);
                  } else {
                    setImgError(true);
                  }
                }}
              />
            </div>
          )}

          {/* Navigation Arrows for Multiple Bills */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx => (idx - 1 + count) % count); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center text-lg font-bold shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Previous Bill (Left Arrow)"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx => (idx + 1) % count); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center text-lg font-bold shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Next Bill (Right Arrow)"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Bottom Filmstrip for Multiple Bills */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {count > 1 ? (
              bills.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={\`relative w-12 h-12 rounded-lg border overflow-hidden transition-all shrink-0 cursor-pointer \${currentIndex === idx ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'}\`}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 px-1 text-[9px] font-bold bg-black/75 text-white rounded-tl">
                    #{idx + 1}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-xs text-zinc-500 italic">
                {cur.name || 'Single attached bill'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReupload && (
              <button
                type="button"
                onClick={() => { onClose(); onReupload(); }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Upload another or replacement bill"
              >
                <span>📁</span>
                <span>Replace / Add Bill</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function _renderExpBillBadges(t, g, e, he, et) {
  const bills = _getExpImgs(t, g);
  if (!bills || bills.length === 0) return null;
  const count = bills.length;
  return e.jsxs("div", {
    className: "flex items-center gap-1.5 shrink-0",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: (E) => { E.stopPropagation(); he({ bills, initialIndex: 0, expense: t }); },
        className: "inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 px-2 py-0.5 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm",
        title: \`View \${count === 1 ? "attached bill / receipt" : \`\${count} attached bills\`}\`,
        children: [
          e.jsx("span", { className: "text-xs shrink-0", children: "🧾" }),
          count === 1 ? " Bill" : \` \${count} Bills\`
        ]
      }),
      e.jsx("div", {
        className: "flex items-center -space-x-1.5 overflow-hidden",
        children: bills.slice(0, 3).map((item, idx) => e.jsx("div", {
          key: idx,
          onClick: (E) => { E.stopPropagation(); he({ bills, initialIndex: idx, expense: t }); },
          className: "w-6 h-6 rounded border border-zinc-700 bg-zinc-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-md shrink-0 ring-1 ring-black/40",
          title: \`View \${item.name || \`Bill #\${idx+1}\`}\`,
          children: e.jsx("img", {
            src: item.url,
            alt: item.name || "receipt",
            className: "w-full h-full object-cover",
            onError: function(E) {
              if (item.url && item.url.includes('/hcgi/platform/api/files/')) {
                const alt = item.url.replace('/hcgi/platform/api/files/', '/api/files/');
                if (E.currentTarget.src !== alt) {
                  E.currentTarget.src = alt;
                  return;
                }
              }
              E.currentTarget.style.display = "none";
              var p = E.currentTarget.parentElement;
              if (p) {
                p.title = "Bill needs re-upload";
                p.innerHTML = "<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:9px;font-weight:bold\\">⚠️</span>";
              }
            }
          })
        }))
      })
    ]
  });
}
`;

const transformed = esbuild.transformSync(viewerComponentJSX, {
  loader: 'jsx',
  jsxFactory: 'e.jsx',
  jsxFragment: 'e.Fragment',
  minify: false
});

const compiledHelpers = transformed.code;

console.log('=== Step 2: Applying patch to ExpensesPage bundles ===');

const expBundles = [
  'ExpensesPage-DPFHVAFy.js',
  'dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/web/dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/api/dist/assets/ExpensesPage-DPFHVAFy.js',
  'dist/apps/web/assets/ExpensesPage-DPFHVAFy.js',
  'tools/ExpensesPage.patched.js'
];

const targetDesk = `_getExpImgs(t,g).map((item,a)=>{const r=item.url;return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm",title:\`View \${item.name||"Receipt"}\`,children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

const targetMob = `_getExpImgs(t,g).map((item,a)=>{const r=item.url;return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-6 h-6 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm",title:\`View \${item.name||"Receipt"}\`,children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

const replBadges = `_renderExpBillBadges(t,g,e,he,et)`;

const targetOldModal = `ve&&e.jsx(Pt,{open:!!ve,onOpenChange:()=>he(null),children:e.jsx(Ot,{className:"max-w-2xl border border-white/20 bg-zinc-950 p-6 overflow-hidden rounded-2xl text-white shadow-2xl",children:e.jsxs("div",{className:"relative w-full min-h-[50vh] max-h-[80vh] flex flex-col items-center justify-center p-2",children:[e.jsx("img",{src:(ve&&ve.url?ve.url:ve),alt:"high-res",className:"max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl",onError:function(E){E.currentTarget.style.display="none";var fb=E.currentTarget.nextElementSibling;if(fb)fb.style.display="flex";}}),e.jsxs("div",{style:{display:"none"},className:"flex flex-col items-center justify-center text-center p-6 bg-zinc-900/90 rounded-2xl border border-dashed border-amber-500/40 max-w-md w-full my-auto space-y-4",children:[e.jsx("div",{className:"w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-bold",children:"⚠️"}),e.jsx("h4",{className:"text-base font-bold text-white mb-1",children:"Bill File Missing from Server"}),e.jsx("p",{className:"text-xs text-zinc-300 leading-relaxed mb-4",children:"This bill attachment was cleared during a previous cloud redeploy. You can attach or re-upload the bill now."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 w-full pt-1",children:[e.jsx("button",{onClick:function(){var exp=(ve&&ve.expense)||null;he(null);if(exp){et(exp);}else{var inp=document.querySelector('input[type="file"][multiple]');if(inp)inp.click();}},className:"flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer",children:"📁 Upload / Replace Bill"}),e.jsx("button",{onClick:function(){he(null);},className:"py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-all cursor-pointer",children:"Close"})]})]})]})})})`;

const replNewModal = `ve&&e.jsx(ExpenseBillsViewerModal,{isOpen:!!ve,onClose:()=>he(null),bills:ve.bills||(ve.url?[{name:"Bill",url:ve.url}]:[]),initialIndex:ve.initialIndex||0,expense:ve.expense,onReupload:()=>{const exp=ve.expense;he(null);if(exp)et(exp);}})`;

for (const pth of expBundles) {
  if (!fs.existsSync(pth)) {
    console.log('Skipping non-existent:', pth);
    continue;
  }
  let code = fs.readFileSync(pth, 'utf8');

  // Inject compiled helpers if not present
  if (!code.includes('function ExpenseBillsViewerModal')) {
    code = compiledHelpers + '\n' + code;
    console.log('✅ Injected ExpenseBillsViewerModal & _renderExpBillBadges in:', pth);
  }

  // Replace desktop table badges
  if (code.includes(targetDesk)) {
    code = code.replace(targetDesk, replBadges);
    console.log('✅ Replaced desktop table images with _renderExpBillBadges in:', pth);
  } else {
    console.log('TargetDesk not found in:', pth);
  }

  // Replace mobile badges
  if (code.includes(targetMob)) {
    code = code.replace(targetMob, replBadges);
    console.log('✅ Replaced mobile card images with _renderExpBillBadges in:', pth);
  } else {
    console.log('TargetMob not found in:', pth);
  }

  // Replace modal
  if (code.includes(targetOldModal)) {
    code = code.replace(targetOldModal, replNewModal);
    console.log('✅ Replaced old modal with ExpenseBillsViewerModal in:', pth);
  } else {
    console.log('TargetOldModal not found in:', pth);
  }

  parser.parse(code, { sourceType: 'module' });
  fs.writeFileSync(pth, code, 'utf8');
  console.log('🎉 Successfully saved and verified AST for:', pth);
}
