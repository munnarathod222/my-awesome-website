import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Eye, Download, Trash2, Plus, Upload, CheckCircle2, 
  ExternalLink, ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { getPodFiles, getPodFileUrl, compressDocumentBatch, formatBytes } from '@/lib/imageCompressor.js';

export default function MultiPodViewerModal({ isOpen, onClose, trip, clientName = '', onUpdated }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!trip) return null;

  const podFiles = getPodFiles(trip);
  const hasFiles = podFiles.length > 0;
  const currentFileName = hasFiles ? podFiles[Math.min(selectedIndex, podFiles.length - 1)] : null;
  const currentUrl = currentFileName ? getPodFileUrl(trip, currentFileName) : null;
  const isCurrentPdf = currentFileName ? currentFileName.toLowerCase().endsWith('.pdf') : false;

  // Handle uploading additional or new POD files
  const handleUploadAdditional = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    setIsUploading(true);
    setCompressionStatus('Compressing & preserving document clarity...');

    try {
      // Step 1: Compress images while preserving 100% fine document text & stamps
      const compressionResult = await compressDocumentBatch(rawFiles, (p) => {
        setCompressionStatus(`Optimizing photo ${p.current}/${p.total} (${p.percent}%)...`);
      });

      const { files: optimizedFiles, originalTotalBytes, compressedTotalBytes, percentSaved } = compressionResult;

      // Step 2: Build FormData with PocketBase array append
      const formData = new FormData();
      optimizedFiles.forEach((file) => {
        formData.append('pod_file', file);
      });
      formData.append('pod_status', 'Uploaded');

      // Step 3: Update trip_logs in PocketBase
      const updated = await pb.collection('trip_logs').update(trip.id, formData, { $autoCancel: false });

      if (percentSaved > 0) {
        toast.success(`Attached ${optimizedFiles.length} POD file(s)! Saved ${percentSaved}% bandwidth (${formatBytes(originalTotalBytes)} ➔ ${formatBytes(compressedTotalBytes)}).`);
      } else {
        toast.success(`Attached ${optimizedFiles.length} POD file(s) successfully.`);
      }

      setCompressionStatus('');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error('Failed to attach POD files:', err);
      toast.error(err.message || 'Failed to upload POD files.');
    } finally {
      setIsUploading(false);
      setCompressionStatus('');
      e.target.value = '';
    }
  };

  // Handle removing a specific page
  const handleDeletePage = async (fileName) => {
    if (!window.confirm(`Are you sure you want to remove POD page "${fileName}"?`)) return;

    setIsDeleting(true);
    try {
      // PocketBase file removal uses fieldName.- = filename
      const formData = new FormData();
      formData.append('pod_file.-', fileName);

      // If this was the last file and there's no link, update status to Pending
      const remainingCount = podFiles.length - 1;
      if (remainingCount <= 0 && !trip.pod_link) {
        formData.append('pod_status', 'Pending');
      }

      const updated = await pb.collection('trip_logs').update(trip.id, formData, { $autoCancel: false });
      toast.success('POD page removed successfully.');

      if (selectedIndex >= remainingCount) {
        setSelectedIndex(Math.max(0, remainingCount - 1));
      }

      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error('Failed to delete POD page:', err);
      toast.error(err.message || 'Failed to remove POD file.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-[#090d16] border border-[#1e293b] text-slate-100 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-800 bg-[#0c1220] flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📑</span>
                <DialogTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Trip POD Dossier & Delivery Proofs
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
                    {podFiles.length} {podFiles.length === 1 ? 'Page' : 'Pages'}
                  </Badge>
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-300">Trip ID: {trip.trip_id || trip.id?.slice(0, 8)}</span>
                <span>•</span>
                <span>Client: {clientName || 'General Freight'}</span>
                <span>•</span>
                <span>Route: {trip.route || `${trip.origin || 'Origin'} ➔ ${trip.destination || 'Destination'}`}</span>
              </DialogDescription>
            </div>

            {/* Quick Upload Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition cursor-pointer shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleUploadAdditional}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach POD Images/PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {compressionStatus && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animate-pulse">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{compressionStatus}</span>
            </div>
          )}
        </DialogHeader>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {hasFiles ? (
            <div className="space-y-4">
              {/* Active Preview Viewport */}
              <div className="relative rounded-2xl border border-slate-800 bg-[#06080f] overflow-hidden flex flex-col items-center justify-center min-h-[300px] sm:min-h-[440px] max-h-[60vh] p-2">
                {isCurrentPdf ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <FileText className="w-16 h-16 text-rose-400" />
                    <p className="text-sm font-bold text-white">{currentFileName}</p>
                    <p className="text-xs text-slate-400">PDF Document (Vector Quality Preserved)</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button asChild size="sm" variant="default" className="rounded-xl">
                        <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1.5" /> Open PDF
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-xl">
                        <a href={currentUrl} download={currentFileName}>
                          <Download className="w-4 h-4 mr-1.5" /> Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentUrl}
                      alt={`POD Page ${selectedIndex + 1}`}
                      className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )}

                {/* Navigation Overlays */}
                {podFiles.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : podFiles.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 text-white flex items-center justify-center shadow-lg transition active:scale-95"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex((prev) => (prev < podFiles.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 text-white flex items-center justify-center shadow-lg transition active:scale-95"
                      title="Next Page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Active File Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/85 backdrop-blur border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-white px-2 py-0.5 rounded-md bg-primary/20 text-primary shrink-0">
                      Page {selectedIndex + 1} of {podFiles.length}
                    </span>
                    <span className="truncate" title={currentFileName}>{currentFileName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2 rounded-lg text-slate-300 hover:text-white">
                      <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Full
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2 rounded-lg text-slate-300 hover:text-white">
                      <a href={currentUrl} download={currentFileName}>
                        <Download className="w-3.5 h-3.5 mr-1" /> Save
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePage(currentFileName)}
                      disabled={isDeleting}
                      className="h-7 px-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      title="Delete This Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Thumbnails Strip */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  All Attached POD Pages ({podFiles.length})
                </p>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {podFiles.map((file, idx) => {
                    const url = getPodFileUrl(trip, file);
                    const isPdf = file.toLowerCase().endsWith('.pdf');
                    const isActive = idx === selectedIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`relative rounded-xl border-2 transition overflow-hidden shrink-0 w-20 h-20 bg-slate-900 flex flex-col items-center justify-center ${
                          isActive
                            ? 'border-primary ring-2 ring-primary/30 shadow-md'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isPdf ? (
                          <div className="flex flex-col items-center justify-center p-1">
                            <FileText className="w-6 h-6 text-rose-400" />
                            <span className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-[70px]">PDF</span>
                          </div>
                        ) : (
                          <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-extrabold px-1 rounded bg-slate-950/90 text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No POD Images Attached Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Attach multiple signed delivery proofs, weighbridge slips, and consignee stamped LR copies. Photos will automatically be compressed with high document sharpness.
              </p>
              <label className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleUploadAdditional}
                  disabled={isUploading}
                />
                <Plus className="w-4 h-4" />
                <span>Upload First POD Images</span>
              </label>
            </div>
          )}

          {/* External Cloud Link Section */}
          {trip.pod_link && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 font-semibold">Cloud Link:</span>
                <a href={trip.pod_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {trip.pod_link}
                </a>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-lg shrink-0">
                <a href={trip.pod_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0c1220] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>High-fidelity document compression active (2048px text-preserving quality)</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
