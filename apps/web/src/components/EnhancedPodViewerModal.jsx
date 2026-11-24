import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, 
  Download, ChevronLeft, ChevronRight, FileText, CheckCircle2,
  ExternalLink, Eye, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function EnhancedPodViewerModal({
  isOpen,
  onClose,
  trip = {},
  podFiles = []
}) {
  const [activePage, setActivePage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Normalize files array (can be strings or objects with url)
  const files = (Array.isArray(podFiles) ? podFiles : [podFiles])
    .filter(Boolean)
    .map(f => (typeof f === 'string' ? f : f.url || f.file || ''))
    .filter(Boolean);

  // Reset controls when active file changes or modal opens
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
  }, [activePage, isOpen]);

  if (!isOpen || files.length === 0) return null;

  const currentUrl = files[activePage] || files[0];
  const isPdf = currentUrl.toLowerCase().split('?')[0].endsWith('.pdf');
  const tripCode = trip.trip_id || (trip.id ? `TRIP-${trip.id.slice(-4)}` : 'POD Document');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.5, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrevPage = () => setActivePage(prev => Math.max(0, prev - 1));
  const handleNextPage = () => setActivePage(prev => Math.min(files.length - 1, prev + 1));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent 
        ref={containerRef}
        className={`p-0 overflow-hidden bg-slate-950 border border-slate-800 text-white shadow-2xl flex flex-col transition-all duration-200 z-[9999] ${
          isFullscreen 
            ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none' 
            : 'w-[96vw] max-w-5xl h-[92vh] max-h-[92vh] rounded-2xl'
        }`}
      >
        {/* ── Top Control Bar ────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  Proof of Delivery (POD) - {tripCode}
                </h3>
                {files.length > 1 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] px-1.5 py-0">
                    Page {activePage + 1} of {files.length}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {trip.truck_number && <span>Truck: <strong className="text-slate-200">{trip.truck_number}</strong></span>}
                {trip.client_name && <span> • Client: <strong className="text-slate-200">{trip.client_name}</strong></span>}
                {trip.route && <span> • Route: <strong className="text-slate-200">{trip.route}</strong></span>}
              </p>
            </div>
          </div>

          {/* Interactive Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            {!isPdf && (
              <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomOut} 
                  disabled={zoomLevel <= 0.5}
                  title="Zoom Out"
                  className="w-7 h-7 text-slate-300 hover:text-white hover:bg-slate-700/70"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <button
                  onClick={handleReset}
                  title="Reset to Fit Screen"
                  className="px-2 text-[11px] font-mono text-slate-300 hover:text-white"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleZoomIn} 
                  disabled={zoomLevel >= 2.5}
                  title="Zoom In"
                  className="w-7 h-7 text-slate-300 hover:text-white hover:bg-slate-700/70"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Rotate Button */}
            {!isPdf && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                title="Rotate 90°"
                className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/70"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            )}

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/70"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close (Esc)"
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Main Responsive Viewport ──────────────────────────────── */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-auto bg-black/70 p-3 select-none">
          {isPdf ? (
            <iframe
              src={currentUrl}
              title={`POD PDF Page ${activePage + 1}`}
              className="w-full h-full border-none rounded-xl"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={currentUrl}
                alt={`Proof of Delivery Page ${activePage + 1}`}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxHeight: zoomLevel === 1 ? 'calc(92vh - 145px)' : 'none'
                }}
                className="w-auto max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
              />
            </div>
          )}

          {/* Left Arrow Navigation */}
          {files.length > 1 && (
            <button
              onClick={handlePrevPage}
              disabled={activePage === 0}
              aria-label="Previous Page"
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur transition-all ${
                activePage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 hover:scale-110 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Navigation */}
          {files.length > 1 && (
            <button
              onClick={handleNextPage}
              disabled={activePage === files.length - 1}
              aria-label="Next Page"
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur transition-all ${
                activePage === files.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 hover:scale-110 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Page Thumbnails / Selector ─────────────────────────────── */}
        {files.length > 1 && (
          <div className="px-4 py-2 bg-slate-950/95 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
            {files.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActivePage(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  idx === activePage
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Page {idx + 1}
                {url.toLowerCase().split('?')[0].endsWith('.pdf') && (
                  <span className="text-[9px] text-rose-400 uppercase font-mono">PDF</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Bottom Action Footer ───────────────────────────────────── */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            {files.length > 1 
              ? `Showing page ${activePage + 1} of ${files.length}` 
              : '1 verified Proof of Delivery file'}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={currentUrl}
              download={`${tripCode}_POD_Page_${activePage + 1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {files.length > 1 ? `Download Page ${activePage + 1}` : 'Download POD'}
            </a>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
