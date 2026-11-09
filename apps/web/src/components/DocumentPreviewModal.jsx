import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileQuestion, ExternalLink, Phone, Zap } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

export default function DocumentPreviewModal({ isOpen, onClose, document, collectionName = 'truck_documents', hideDownload = false }) {
  const [activeFile, setActiveFile] = useState(null);
  const [isHighRes, setIsHighRes] = useState(false);

  const helplineNum = document?.helpline_number || document?.insurance_helpline || document?.helpline || '';

  // Extract all document files
  const filesList = React.useMemo(() => {
    if (!document) return [];

    // Prioritize clean Front and Back pair if both exist
    const front = (typeof document.file === 'string' && document.file) || (Array.isArray(document.file) && document.file[0]);
    const back = (typeof document.back_file === 'string' && document.back_file) || (typeof document.back_page === 'string' && document.back_page);
    if (front && back && front !== back) {
      return [front, back];
    }

    // If multiple attached files or files array
    if (Array.isArray(document.files) && document.files.length > 0) {
      return Array.from(new Set(document.files.filter(Boolean)));
    }

    if (Array.isArray(document.attached_files) && document.attached_files.length > 0) {
      const att = document.attached_files.map(f => typeof f === 'string' ? f : (f?.file_url || f?.url)).filter(Boolean);
      if (att.length > 0) return Array.from(new Set(att));
    }

    const list = [];
    if (front) list.push(front);
    if (back && back !== front) list.push(back);
    if (typeof document.file_url === 'string' && document.file_url) list.push(document.file_url);
    if (typeof document.url === 'string' && document.url) list.push(document.url);
    if (typeof document.files === 'string' && document.files) list.push(document.files);

    return Array.from(new Set(list.filter(Boolean)));
  }, [document]);

  useEffect(() => {
    if (filesList.length > 0) {
      setActiveFile(filesList[0]);
    } else if (document?.file_url || document?.url) {
      setActiveFile(document.file_url || document.url);
    } else {
      setActiveFile(null);
    }
  }, [document, filesList]);

  // Full-resolution original URL (used for downloading and high-res view)
  const downloadUrl = React.useMemo(() => {
    if (!activeFile) return document?.file_url || document?.url || '';
    if (typeof activeFile === 'string' && (activeFile.startsWith('http://') || activeFile.startsWith('https://') || activeFile.startsWith('data:') || activeFile.startsWith('blob:'))) {
      return activeFile;
    }
    if (document && (document.collectionId || document.collectionName) && document.id) {
      return pb.files.getUrl(document, activeFile);
    }
    return document?.file_url || activeFile;
  }, [document, activeFile]);

  // Compressed 800x800 preview URL for fast low-data viewing
  const previewUrl = React.useMemo(() => {
    if (!activeFile) return downloadUrl;
    if (typeof activeFile === 'string' && (activeFile.startsWith('data:') || activeFile.startsWith('blob:'))) {
      return activeFile;
    }
    if (document && (document.collectionId || document.collectionName) && document.id) {
      return pb.files.getUrl(document, activeFile, { thumb: '800x800' });
    }
    if (typeof downloadUrl === 'string' && downloadUrl.includes('/api/files/') && !downloadUrl.includes('thumb=')) {
      const sep = downloadUrl.includes('?') ? '&' : '?';
      return `${downloadUrl}${sep}thumb=800x800`;
    }
    return downloadUrl;
  }, [document, activeFile, downloadUrl]);

  const fileExt = React.useMemo(() => {
    const fileTarget = activeFile || downloadUrl || '';
    if (!fileTarget) return '';
    const cleanPath = fileTarget.split('?')[0].split('#')[0];
    return cleanPath.split('.').pop().toLowerCase();
  }, [activeFile, downloadUrl]);

  const isPdf = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExt) || (!isPdf && !!downloadUrl && !downloadUrl.endsWith('.pdf'));

  // Reset high-res state on file change or modal re-open
  useEffect(() => {
    setIsHighRes(false);
  }, [activeFile, isOpen]);

  if (!document || !activeFile) return null;

  // Explicit download of original uncompressed high-res file
  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = downloadUrl;
    const cleanFileName = (typeof activeFile === 'string' ? activeFile.split('/').pop().split('?')[0] : '') || 
      `${document.document_type || 'document'}.${fileExt || 'dat'}`;
    a.download = cleanFileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[920px] w-[95vw] h-[88vh] flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <DialogHeader className="flex-shrink-0 pb-3 border-b border-slate-800 flex flex-row items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base font-bold text-white truncate">
              {isPdf ? <FileText className="w-5 h-5 text-blue-400 shrink-0" /> : isImage ? <FileImage className="w-5 h-5 text-emerald-400 shrink-0" /> : <FileQuestion className="w-5 h-5 text-amber-400 shrink-0" />}
              <span className="truncate">{document.document_type || 'Document'} - {document.document_number || 'No Number'}</span>
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono flex-wrap">
              {(() => {
                const dateVal = document.upload_date || document.created;
                if (!dateVal) return <span>No upload date available</span>;
                try {
                  const d = new Date(dateVal);
                  if (isNaN(d.getTime())) return <span>No upload date available</span>;
                  return <span>Uploaded {format(d, 'MMM dd, yyyy')}</span>;
                } catch (e) {
                  return <span>No upload date available</span>;
                }
              })()}

              {/* Data Saver Status Badge */}
              {isImage && (
                <button
                  type="button"
                  onClick={() => setIsHighRes(!isHighRes)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight transition-all ${
                    isHighRes
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                  title={isHighRes ? 'Full HD image loaded. Tap to switch to Data Saver.' : 'Data Saver active (800px preview). Tap to load High Res original.'}
                >
                  <Zap className="w-3 h-3" />
                  {isHighRes ? 'HD Mode' : '⚡ Data Saver Active'}
                </button>
              )}
            </div>
          </div>

          {!hideDownload && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button size="sm" variant="outline" onClick={handleOpenNewTab} className="h-8 rounded-xl text-xs flex items-center gap-1 border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
                <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Full Tab</span> View
              </Button>
            </div>
          )}
        </DialogHeader>

        {helplineNum && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5 flex items-center justify-between text-xs my-1 shrink-0">
            <span className="text-emerald-300 font-extrabold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Helpline:
            </span>
            <a 
              href={`tel:${helplineNum.replace(/[^0-9+]/g, '')}`}
              className="font-mono font-black text-emerald-400 hover:underline bg-emerald-500/20 px-2 sm:px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 text-[11px] sm:text-xs"
            >
              <Phone className="w-3 h-3 text-emerald-400" /> {helplineNum}
            </a>
          </div>
        )}

        {filesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-1.5 flex-shrink-0">
            {filesList.map((file, index) => {
              const ext = file.split('.').pop().toLowerCase();
              const isActive = file === activeFile;
              const pageLabel = filesList.length === 2 
                ? (index === 0 ? '📄 Front Page' : '📄 Back Page')
                : `Page ${index + 1} (${ext.toUpperCase()})`;
              return (
                <Button 
                  key={index}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFile(file)}
                  className={`rounded-xl text-xs flex items-center gap-1.5 font-bold h-7 shrink-0 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                >
                  {ext === 'pdf' ? <FileText className="w-3.5 h-3.5" /> : <FileImage className="w-3.5 h-3.5" />}
                  {pageLabel}
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-h-0 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative flex flex-col items-center justify-between my-2">
          {isPdf ? (
            <div className="w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden">
              <iframe 
                src={downloadUrl} 
                className="w-full h-full border-0 rounded-xl bg-white"
                title={`${document.document_type || 'Document'} PDF Preview`}
              />
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 relative select-none">
              <img 
                src={isHighRes ? downloadUrl : previewUrl} 
                alt={`${document.document_type} preview`}
                className="max-w-full max-h-full object-contain p-2 select-none"
                loading="lazy"
              />
              {!isHighRes && (
                <button
                  type="button"
                  onClick={() => setIsHighRes(true)}
                  className="absolute bottom-3 bg-black/75 hover:bg-black/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" /> ⚡ Low Data Preview (Tap for HD)
                </button>
              )}
            </div>
          ) : (
            <div className="text-center p-8 flex flex-col items-center justify-center text-white">
              <FileQuestion className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-sm text-slate-300">Preview not available for this file type.</p>
              {!hideDownload && (
                <Button onClick={handleOpenNewTab} className="mt-4 rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open File
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-2 flex justify-between items-center text-xs gap-2">
          <p className="text-slate-400 max-w-[45%] truncate font-mono text-[11px]" title={document.notes}>
            {document.notes || 'No additional notes.'}
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl border-slate-700 bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs">
              Close
            </Button>
            {!hideDownload && (
              <Button size="sm" onClick={handleDownload} className="rounded-xl font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs">
                <Download className="w-3.5 h-3.5" /> Download Original File
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
