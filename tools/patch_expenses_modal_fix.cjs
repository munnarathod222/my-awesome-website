const fs = require('fs');
const esbuild = require('esbuild');
const ts = require('typescript');

console.log('=== Step 1: Compiling ExpenseBillsViewerModal and Helpers with Automatic JSX ===');

const modalSource = `
function ExpenseBillsViewerModal({ isOpen, onClose, bills = [], initialIndex = 0, expense = null, onReupload = null }) {
  if (!isOpen) return null;

  if (!bills || bills.length === 0) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center text-white space-y-4 shadow-2xl"
          onClick={(ev) => ev.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-xl font-bold">
            🧾
          </div>
          <h3 className="text-base font-bold text-white">No Bill Attached</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This expense entry ({expense?.description || 'Expense'}) does not currently have a physical bill photo or invoice document attached.
          </p>
          <div className="flex gap-2 pt-2">
            {onReupload && (
              <button 
                type="button" 
                onClick={() => { onClose(); onReupload(); }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer"
              >
                📁 Upload Bill Receipt
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          className="relative flex-1 min-h-[350px] bg-zinc-950/90 flex items-center justify-center overflow-hidden p-4 select-none cursor-default"
          style={{ height: '70vh', maxHeight: '70vh' }}
          onWheel={(e) => {
            if (e.deltaY < 0) {
              setZoom(z => Math.min(3, +(z + 0.15).toFixed(2)));
            } else {
              setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)));
            }
          }}
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
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden" style={{ width: '100%', height: '100%' }}>
              <img
                src={getActiveUrl()}
                alt={cur.name || 'Bill Preview'}
                style={{
                  maxHeight: '66vh',
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: 'auto',
                  transform: \`translate(\${pan.x}px, \${pan.y}px) scale(\${zoom}) rotate(\${rot}deg)\`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                className="rounded-lg shadow-2xl border border-zinc-800/80 bg-white"
                onError={() => {
                  if (!fallbackTried && cur?.url && cur.url.includes('/hcgi/platform/api/files/')) {
                    setFallbackTried(true);
                  } else {
                    setImgError(true);
                  }
                }}
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Footer / Thumbnail Strip */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-zinc-800/80 bg-zinc-900/80 shrink-0 text-xs text-zinc-400">
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[70%]">
            {count > 1 && bills.map((b, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer \${
                  idx === currentIndex 
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }\`}
              >
                <span>🧾</span>
                <span className="truncate max-w-[100px]">{b.name || \`Bill #\${idx + 1}\`}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const badgesSource = `
function _renderExpBillBadges(t, g, e, he, et) {
  const bills = _getExpImgs(t, g);
  if (!bills || bills.length === 0) return null;
  const count = bills.length;
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={(E) => {
          E.stopPropagation();
          he({ bills, initialIndex: 0, expense: t });
        }}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 px-2 py-0.5 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
        title={count === 1 ? "View attached bill / receipt" : count + " attached bills"}
      >
        <span className="text-xs shrink-0">🧾</span>
        {count === 1 ? " Bill" : " " + count + " Bills"}
      </button>
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {bills.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            onClick={(E) => {
              E.stopPropagation();
              he({ bills, initialIndex: idx, expense: t });
            }}
            className="w-6 h-6 rounded border border-zinc-700 bg-zinc-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-md shrink-0 ring-1 ring-black/40"
            title={item.name || ("Bill #" + (idx + 1))}
          >
            <img
              src={item.url}
              alt={item.name || "receipt"}
              className="w-full h-full object-cover"
              onError={(E) => {
                if (item.url && item.url.includes("/hcgi/platform/api/files/")) {
                  const alt = item.url.replace("/hcgi/platform/api/files/", "/api/files/");
                  if (E.currentTarget.src !== alt) {
                    E.currentTarget.src = alt;
                    return;
                  }
                }
                E.currentTarget.style.display = "none";
                const p = E.currentTarget.parentElement;
                if (p) {
                  p.title = "Bill needs re-upload";
                  p.innerHTML = '<span style=\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:9px;font-weight:bold\">⚠️</span>';
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const helpersSource = `
function _getExpImgs(t, g) {
  const I = [];
  const S = new Set();
  const add = (n, u) => {
    if (u && !S.has(u)) {
      S.add(u);
      I.push({ name: n || "Receipt", url: u });
    }
  };

  (t.image_urls || []).forEach(f => {
    if (!f) return;
    const u = typeof f === "string" && (f.startsWith("http") || f.startsWith("/")) ? f : g.files.getUrl(t, f);
    add(typeof f === "string" ? f : "Receipt", u);
  });

  (t.documents || []).forEach(f => {
    if (!f) return;
    const u = typeof f === "string" && (f.startsWith("http") || f.startsWith("/")) ? f : g.files.getUrl(t, f);
    add(typeof f === "string" ? f : "Document", u);
  });

  if (t.bill && typeof t.bill === "string") {
    const u = t.bill.startsWith("http") || t.bill.startsWith("/") ? t.bill : g.files.getUrl(t, t.bill);
    add("Bill", u);
  }
  if (t.receipt && typeof t.receipt === "string") {
    const u = t.receipt.startsWith("http") || t.receipt.startsWith("/") ? t.receipt : g.files.getUrl(t, t.receipt);
    add("Receipt", u);
  }

  if (t.notes && t.notes.includes("<!-- BILLS_JSON:")) {
    try {
      const raw = t.notes.split("<!-- BILLS_JSON:")[1].split("-->")[0];
      const P = JSON.parse(raw);
      if (Array.isArray(P)) {
        P.forEach(b => {
          const u = typeof b === "string" ? b : (b.url || "");
          const n = typeof b === "string" ? b : (b.name || "Job Card Bill");
          add(n, u);
        });
      }
    } catch (e) {}
  }

  return I;
}
`;

function transformJSX(src) {
  const res = esbuild.transformSync(src, {
    loader: 'jsx',
    jsx: 'automatic'
  });
  let c = res.code;
  c = c.replace(/import\s*\{[^}]*\}\s*from\s*['"]react\/jsx-runtime['"];?\n?/g, '');
  c = c.replace(/\bjsx\(/g, 'e.jsx(');
  c = c.replace(/\bjsxs\(/g, 'e.jsxs(');
  c = c.replace(/\bFragment\b/g, 'e.Fragment');
  return c;
}

const compiledModal = transformJSX(modalSource);
const compiledBadges = transformJSX(badgesSource);
const combinedPrepend = compiledModal + '\n' + compiledBadges + '\n' + helpersSource + '\n';

console.log('Combined code generated. Length:', combinedPrepend.length);

const targetBundles = [
  'dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/web/dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/api/dist/assets/ExpensesPage-DPFHVAFy.js',
  'dist/apps/web/assets/ExpensesPage-DPFHVAFy.js'
];

// Read one bundle
let rawBundle = fs.readFileSync('dist/assets/ExpensesPage-DPFHVAFy.js', 'utf8');

// Find where imports start: import{j as e
const importIdx = rawBundle.indexOf('import{j as e');
if (importIdx === -1) {
  console.error('ERROR: Could not find import{j as e in ExpensesPage bundle!');
  process.exit(1);
}

// Keep everything from import{j as e onward
const mainBundleCode = rawBundle.slice(importIdx);

// Now new bundle is combinedPrepend + mainBundleCode
const newFullBundle = combinedPrepend + mainBundleCode;

console.log('Verifying final bundle with TypeScript AST parser...');
const sf = ts.createSourceFile('test.js', newFullBundle, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
console.log('Parse diagnostics count:', sf.parseDiagnostics ? sf.parseDiagnostics.length : 0);

if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
  console.error('Syntax errors found:', sf.parseDiagnostics.slice(0, 5));
  process.exit(1);
}

targetBundles.forEach(f => {
  fs.writeFileSync(f, newFullBundle, 'utf8');
  console.log(`Updated: ${f} (${fs.statSync(f).size} bytes)`);
});

console.log('ALL 4 EXPENSES BUNDLES SUCCESSFULLY PATCHED WITH WORKING BILL VIEWER!');
