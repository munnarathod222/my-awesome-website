const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const esbuild = require('esbuild');

console.log('=== Upgrading JobCardBillsViewerModal with Rotation & Zoom controls ===');

const maintBundles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js'
];

const newViewerModalCode = `function JobCardBillsViewerModal({ isOpen, onClose, bills = [], initialIndex = 0, jobCard = null }) {
  if (!isOpen || !bills || bills.length === 0) return null;
  const [currentIndex, setCurrentIndex] = p.useState(initialIndex || 0);
  const [touchStart, setTouchStart] = p.useState(null);
  const [rotations, setRotations] = p.useState({});
  const [zoom, setZoom] = p.useState(1);
  const [isDragging, setIsDragging] = p.useState(false);
  const [pan, setPan] = p.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = p.useState({ x: 0, y: 0 });

  p.useEffect(() => {
    setCurrentIndex(initialIndex >= 0 && initialIndex < bills.length ? initialIndex : 0);
  }, [initialIndex, bills]);

  p.useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  const hasMultiple = bills.length > 1;
  const currentBill = bills[currentIndex] || bills[0];
  const isPdf = Boolean(currentBill?.url && (currentBill.url.toLowerCase().includes(".pdf") || (currentBill.name && currentBill.name.toLowerCase().endsWith(".pdf"))));

  const rotation = (rotations[currentIndex] || 0) % 360;
  const isRotatedSideways = (rotation % 180 !== 0);

  const handlePrev = (ev) => {
    ev && ev.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : bills.length - 1));
  };

  const handleNext = (ev) => {
    ev && ev.stopPropagation();
    setCurrentIndex((prev) => (prev < bills.length - 1 ? prev + 1 : 0));
  };

  const handleRotateRight = (ev) => {
    ev && ev.stopPropagation();
    setRotations((prev) => ({
      ...prev,
      [currentIndex]: ((prev[currentIndex] || 0) + 90) % 360
    }));
  };

  const handleRotateLeft = (ev) => {
    ev && ev.stopPropagation();
    setRotations((prev) => ({
      ...prev,
      [currentIndex]: ((prev[currentIndex] || 0) + 270) % 360
    }));
  };

  const handleZoomIn = (ev) => {
    ev && ev.stopPropagation();
    setZoom((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = (ev) => {
    ev && ev.stopPropagation();
    setZoom((prev) => {
      const next = Math.max(0.6, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (ev) => {
    ev && ev.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotations((prev) => ({ ...prev, [currentIndex]: 0 }));
  };

  p.useEffect(() => {
    const handleKeyDown = (ev) => {
      if (!isOpen) return;
      if (ev.key === "ArrowLeft") handlePrev();
      else if (ev.key === "ArrowRight") handleNext();
      else if (ev.key === "Escape") onClose();
      else if (ev.key === "r" || ev.key === "R") {
        if (ev.shiftKey) handleRotateLeft();
        else handleRotateRight();
      }
      else if (ev.key === "+" || ev.key === "=") handleZoomIn();
      else if (ev.key === "-" || ev.key === "_") handleZoomOut();
      else if (ev.key === "0") handleReset();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, bills.length, currentIndex, rotation, zoom]);

  const handleTouchStart = (ev) => {
    if (ev.touches.length === 1) {
      setTouchStart(ev.touches[0].clientX);
    }
  };
  const handleTouchEnd = (ev) => {
    if (touchStart === null) return;
    const diff = touchStart - ev.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && zoom <= 1.1) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStart(null);
  };

  const handleMouseDown = (ev) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: ev.clientX - pan.x, y: ev.clientY - pan.y });
    }
  };

  const handleMouseMove = (ev) => {
    if (isDragging && zoom > 1) {
      setPan({ x: ev.clientX - dragStart.x, y: ev.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return e.jsx(vt, {
    open: true,
    onOpenChange: onClose,
    children: e.jsxs(Nt, {
      className: "max-w-5xl w-[96vw] md:w-full max-h-[96vh] bg-slate-950/95 backdrop-blur-xl border border-slate-800 text-white rounded-2xl p-0 overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 select-none",
      children: [
        e.jsxs("div", {
          className: "flex items-center justify-between px-3 md:px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0 gap-2",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2 min-w-0 pr-1",
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
                !isPdf && e.jsxs("div", {
                  className: "hidden sm:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60",
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: handleRotateRight,
                      className: "h-7 px-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-700/80 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors",
                      title: "Rotate 90° Clockwise (R)",
                      children: "🔄 Rotate 90°"
                    }),
                    (rotation !== 0 || zoom !== 1) && e.jsx("button", {
                      type: "button",
                      onClick: handleReset,
                      className: "h-7 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 text-xs font-semibold cursor-pointer transition-colors",
                      title: "Reset Rotation & Zoom (0)",
                      children: "Fit"
                    })
                  ]
                }),
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
                  className: "h-8 w-8 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center font-bold text-base transition-all cursor-pointer",
                  title: "Close (Esc)",
                  children: "✕"
                })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "relative flex-1 min-h-[60vh] max-h-[78vh] flex items-center justify-center bg-black/80 p-2 md:p-6 overflow-hidden select-none",
          onTouchStart: handleTouchStart,
          onTouchEnd: handleTouchEnd,
          onMouseDown: handleMouseDown,
          onMouseMove: handleMouseMove,
          onMouseUp: handleMouseUp,
          onMouseLeave: handleMouseUp,
          style: { cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" },
          children: [
            hasMultiple && e.jsx("button", {
              type: "button",
              onClick: handlePrev,
              className: "absolute left-2 md:left-4 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg font-black",
              title: "Previous Bill (Left Arrow)",
              children: "◀"
            }),
            e.jsx("div", {
              className: "w-full h-full flex items-center justify-center overflow-hidden",
              children: isPdf
                ? e.jsx("iframe", {
                    src: currentBill.url,
                    title: currentBill.name || "PDF Document",
                    className: "w-full h-[68vh] rounded-xl border border-slate-800 bg-white shadow-xl"
                  })
                : e.jsx("img", {
                    src: currentBill.url,
                    alt: currentBill.name || ("Bill " + (currentIndex + 1)),
                    draggable: false,
                    style: {
                      transform: "translate(" + pan.x + "px, " + pan.y + "px) rotate(" + rotation + "deg) scale(" + zoom + ")",
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      maxHeight: isRotatedSideways ? "85vw" : "72vh",
                      maxWidth: isRotatedSideways ? "68vh" : "92vw",
                      objectFit: "contain"
                    },
                    className: "rounded-xl shadow-2xl mx-auto block pointer-events-auto"
                  })
            }),
            hasMultiple && e.jsx("button", {
              type: "button",
              onClick: handleNext,
              className: "absolute right-2 md:right-4 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg font-black",
              title: "Next Bill (Right Arrow)",
              children: "▶"
            }),
            !isPdf && e.jsxs("div", {
              className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: handleRotateLeft,
                  className: "px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer",
                  title: "Rotate 90° Left (Shift+R)",
                  children: "↺ -90°"
                }),
                e.jsx("div", { className: "w-px h-3.5 bg-slate-700" }),
                e.jsx("button", {
                  type: "button",
                  onClick: handleRotateRight,
                  className: "px-2.5 py-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors font-bold flex items-center gap-1 cursor-pointer",
                  title: "Rotate 90° Right (R)",
                  children: "🔄 Rotate 90°"
                }),
                rotation !== 0 && e.jsx("span", {
                  className: "text-[11px] font-mono text-amber-300/80 px-1 font-bold",
                  children: rotation + "°"
                }),
                e.jsx("div", { className: "w-px h-3.5 bg-slate-700" }),
                e.jsx("button", {
                  type: "button",
                  onClick: handleZoomOut,
                  disabled: zoom <= 0.6,
                  className: "w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer font-bold",
                  title: "Zoom Out (-)",
                  children: "−"
                }),
                e.jsx("span", {
                  className: "text-[11px] font-mono text-slate-300 min-w-[34px] text-center font-semibold",
                  children: Math.round(zoom * 100) + "%"
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: handleZoomIn,
                  disabled: zoom >= 3.5,
                  className: "w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer font-bold",
                  title: "Zoom In (+)",
                  children: "+"
                }),
                (zoom !== 1 || rotation !== 0) && e.jsx("button", {
                  type: "button",
                  onClick: handleReset,
                  className: "ml-1 px-2 py-0.5 rounded text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer",
                  title: "Reset orientation & zoom (0)",
                  children: "Reset"
                })
              ]
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
}`;

for (const pth of maintBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  const startMarker = 'function JobCardBillsViewerModal';
  const endMarker = 'function LogTruckProblemModal';

  const startIdx = code.indexOf(startMarker);
  const endIdx = code.indexOf(endMarker, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not locate JobCardBillsViewerModal in:', pth);
    process.exit(1);
  }

  code = code.slice(0, startIdx) + newViewerModalCode + '\n\n' + code.slice(endIdx);

  // Validate syntax
  parser.parse(code, { sourceType: 'module' });
  esbuild.transformSync(code, { loader: 'js' });

  fs.writeFileSync(pth, code, 'utf8');
  console.log('✅ Successfully updated and validated JobCardBillsViewerModal in:', pth);
}

console.log('🎉 All MaintenancePage bundles updated cleanly!');
