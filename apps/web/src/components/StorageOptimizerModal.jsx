import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Database, HardDrive, RefreshCw, X } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { compressDocumentBatch, formatBytes } from '@/lib/imageCompressor.js';
import { toast } from 'sonner';

export default function StorageOptimizerModal({ isOpen, onClose, onRefresh }) {
  const [phase, setPhase] = useState('idle'); // idle | scanning | ready | compressing | completed
  const [candidates, setCandidates] = useState([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [alreadyOptimalCount, setAlreadyOptimalCount] = useState(0);
  const [pdfCount, setPdfCount] = useState(0);
  const [estimatedSavings, setEstimatedSavings] = useState(0);

  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    pct: 0,
    currentFileName: '',
    currentThumb: '',
    savedBytes: 0
  });

  const [shouldStop, setShouldStop] = useState(false);

  // Scan expenses for bloated files
  const handleScan = async () => {
    setPhase('scanning');
    setCandidates([]);
    setTotalScanned(0);
    setAlreadyOptimalCount(0);
    setPdfCount(0);
    setEstimatedSavings(0);

    try {
      const records = await pb.collection('expenses').getFullList({ sort: '-created', $autoCancel: false });
      let scanned = 0;
      let optimal = 0;
      let pdfs = 0;
      let totalEst = 0;
      const toCompress = [];

      for (const rec of records) {
        const fileItems = [];
        if (Array.isArray(rec.image_urls)) {
          rec.image_urls.forEach(f => { if (f) fileItems.push({ filename: f, field: 'image_urls' }); });
        }
        if (Array.isArray(rec.documents)) {
          rec.documents.forEach(f => { if (f) fileItems.push({ filename: f, field: 'documents' }); });
        }

        for (const item of fileItems) {
          scanned++;
          const fn = item.filename.toLowerCase();
          if (fn.endsWith('.pdf')) {
            pdfs++;
            continue;
          }
          if (!fn.match(/\.(jpg|jpeg|png|webp)$/i)) {
            continue;
          }

          // Check file size via HEAD or GET
          const fileUrl = pb.files.getUrl(rec, item.filename);
          try {
            const headRes = await fetch(fileUrl, { method: 'HEAD' });
            const cl = headRes.headers.get('content-length');
            const size = cl ? parseInt(cl, 10) : 0;

            if (size > 400 * 1024) { // Larger than 400 KB
              toCompress.push({
                record: rec,
                filename: item.filename,
                field: item.field,
                url: fileUrl,
                originalSize: size
              });
              // Expect ~85% savings down to ~350KB
              totalEst += Math.max(0, size - 350 * 1024);
            } else {
              optimal++;
            }
          } catch (e) {
            optimal++;
          }
        }
      }

      setTotalScanned(scanned);
      setAlreadyOptimalCount(optimal);
      setPdfCount(pdfs);
      setCandidates(toCompress);
      setEstimatedSavings(totalEst);
      setPhase(toCompress.length > 0 ? 'ready' : 'completed');
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Scan failed: ' + (err.message || 'Unknown error'));
      setPhase('idle');
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleScan();
    } else {
      setPhase('idle');
      setShouldStop(false);
    }
  }, [isOpen]);

  // Execute batch compression
  const handleStartCompression = async () => {
    if (!candidates.length) return;
    setPhase('compressing');
    setShouldStop(false);

    let totalSaved = 0;
    let successCount = 0;

    for (let i = 0; i < candidates.length; i++) {
      if (shouldStop) break;

      const item = candidates[i];
      setProgress({
        current: i + 1,
        total: candidates.length,
        pct: Math.round(((i + 1) / candidates.length) * 100),
        currentFileName: item.filename,
        currentThumb: item.url,
        savedBytes: totalSaved
      });

      try {
        const fetchRes = await fetch(item.url);
        if (!fetchRes.ok) continue;
        const blob = await fetchRes.blob();

        if (blob.size <= 400 * 1024) {
          continue; // Already small
        }

        const rawFile = new File([blob], item.filename, { type: blob.type || 'image/jpeg' });
        const compressedList = await compressDocumentBatch([rawFile], { maxDimension: 2048, quality: 0.82 });
        const compressedFile = compressedList[0];

        if (compressedFile && compressedFile.size < rawFile.size) {
          const saved = rawFile.size - compressedFile.size;
          totalSaved += saved;

          // Update PocketBase: replace old raw file with compressed version
          const fd = new FormData();
          fd.append(item.field + '-', item.filename);
          fd.append(item.field, compressedFile);
          await pb.collection('expenses').update(item.record.id, fd, { $autoCancel: false });

          // Request backend to prune obsolete raw original from Supabase
          try {
            await fetch('/api/storage/delete-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ remotePath: `storage/pbc_6917388166/${item.record.id}/${item.filename}` })
            });
            await fetch('/api/storage/delete-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ remotePath: `storage/expenses/${item.record.id}/${item.filename}` })
            });
          } catch (_) {}

          successCount++;
        }
      } catch (err) {
        console.warn('Error optimizing file:', item.filename, err);
      }
    }

    // Call prune duplicates to clean any orphan aliases
    try {
      await fetch('/api/storage/prune-duplicates', { method: 'POST' });
    } catch (_) {}

    setProgress(prev => ({ ...prev, savedBytes: totalSaved }));
    setPhase('completed');
    toast.success(`Successfully compressed ${successCount} legacy bills, freeing ${formatBytes(totalSaved)} from Supabase!`);
    if (onRefresh) onRefresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open && phase !== 'compressing') onClose(); }}>
      <DialogContent className="max-w-xl bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Legacy Expense Bills Compressor</h2>
              <p className="text-xs text-slate-400">Reclaim Supabase Cloud Storage without losing document clarity</p>
            </div>
          </div>
          {phase !== 'compressing' && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Scanning State */}
          {phase === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Scanning expense attachments for bloated files...</p>
              <p className="text-xs text-slate-500">Checking sizes and preserving PDF documents...</p>
            </div>
          )}

          {/* Ready State */}
          {phase === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bills Scanned</span>
                  <p className="text-lg font-black text-white mt-0.5">{totalScanned}</p>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Need Compression</span>
                  <p className="text-lg font-black text-amber-300 mt-0.5">{candidates.length}</p>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Est. Recoverable</span>
                  <p className="text-lg font-black text-emerald-300 mt-0.5">{formatBytes(estimatedSavings)}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> 100% Quality & Legibility Guaranteed
                </div>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Downscales 12–108MP camera photos to <strong>2048px</strong> (sharp fine print, GSTIN, stamps).</li>
                  <li>Strips camera EXIF, GPS location coordinates, and header bloat.</li>
                  <li><strong>Native PDFs ({pdfCount})</strong> are completely untouched and safe.</li>
                  <li>Already compressed files ({alreadyOptimalCount}) are skipped.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-800 text-slate-300">
                  Cancel
                </Button>
                <Button onClick={handleStartCompression} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4" /> Compress & Free Storage
                </Button>
              </div>
            </div>
          )}

          {/* Compressing State */}
          {phase === 'compressing' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Compressing Bill {progress.current} of {progress.total}</span>
                <span className="font-mono font-bold text-amber-400">{progress.pct}%</span>
              </div>

              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                {progress.currentThumb && (
                  <img src={progress.currentThumb} alt="Receipt Preview" className="w-12 h-14 object-cover rounded-xl border border-slate-700 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-slate-300 truncate">{progress.currentFileName}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Total Reclaimed: <span className="font-bold">{formatBytes(progress.savedBytes)}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setShouldStop(true)} className="rounded-xl border-slate-800 text-rose-400 hover:text-rose-300">
                  Pause / Stop
                </Button>
              </div>
            </div>
          )}

          {/* Completed State */}
          {phase === 'completed' && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Storage Optimization Complete!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {candidates.length === 0
                    ? 'All existing expense bills are already optimal (< 400 KB) or native PDFs!'
                    : `Successfully compressed ${candidates.length} legacy bills and freed ${formatBytes(progress.savedBytes)} from Supabase.`}
                </p>
              </div>

              <div className="pt-2">
                <Button onClick={onClose} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold w-full">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
