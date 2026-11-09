import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileQuestion, ExternalLink, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Phone, Zap, Eye } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

export default function DocumentPreviewModal({ isOpen, onClose, document, collectionName = 'truck_documents', hideDownload = false }) {
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [renderError, setRenderError] = useState(false);
  const [isHighRes, setIsHighRes] = useState(false);
  const [useCloudViewer, setUseCloudViewer] = useState(false);

  const canvasRef = useRef(null);

  const helplineNum = document?.helpline_number || document?.insurance_helpline || document?.helpline || '';

  // Extract all document files
  const filesList = React.useMemo(() => {
    if (!document) return [];

    // Prioritize clean Front and Back pair if both exist (avoids duplicate 4-page glitch)
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

  // Full-resolution uncompressed URL (used for downloading or explicit HD mode)
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

  // Absolute URL needed for Google Docs Viewer
  const absoluteUrl = React.useMemo(() => {
    if (!downloadUrl) return '';
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
    }
    return downloadUrl;
  }, [downloadUrl]);

  // Compressed 800x800 preview URL for fast, low-data viewing
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

  // Reset states when switching active file or re-opening
  useEffect(() => {
    setIsHighRes(false);
    setRenderError(false);
    setUseCloudViewer(false);
  }, [activeFile, isOpen]);

  // Load PDF with PDF.js
  useEffect(() => {
    let isMounted = true;

    if (isOpen && isPdf && downloadUrl && !useCloudViewer) {
      setLoading(true);
      setRenderError(false);
      setPageNumber(1);

      const loadPdfLib = async () => {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = window.document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            window.document.head.appendChild(script);
          });
        }

        if (window.pdfjsLib) {
          try {
            // Blob worker to safely bypass cross-origin worker restrictions on mobile
            const workerBlob = new Blob(
              [`importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');`],
              { type: 'application/javascript' }
            );
            window.pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(workerBlob));
          } catch (e) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = '';
          }

          let loadedPdf;
          try {
            // Stream URL directly so PDF.js only downloads visible pages via range requests
            loadedPdf = await window.pdfjsLib.getDocument({
              url: downloadUrl,
              disableAutoFetch: true,
              disableStream: false
            }).promise;
          } catch (directErr) {
            // Fallback to fetch buffer if range request is blocked
            const response = await fetch(downloadUrl);
            const arrayBuffer = await response.arrayBuffer();
            loadedPdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          }

          if (isMounted) {
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setLoading(false);
          }
        }
      };

      loadPdfLib().catch(err => {
        console.error('Failed to load PDF with PDF.js:', err);
        if (isMounted) {
          setRenderError(true);
          setLoading(false);
          // Automatically switch to streamed cloud viewer if native canvas fails
          setUseCloudViewer(true);
        }
      });
    } else {
      setPdfDoc(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeFile, downloadUrl, isPdf, useCloudViewer]);

  // Render current PDF page onto canvas
  useEffect(() => {
    let renderTask = null;

    if (pdfDoc && canvasRef.current && isPdf && !useCloudViewer) {
      pdfDoc.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        renderTask.promise.catch(err => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('Canvas render error:', err);
          }
        });
      }).catch(err => {
        console.error('Page render error:', err);
        setUseCloudViewer(true);
      });
    }

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale, isPdf, useCloudViewer]);

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

  // Safe tab view without triggering mobile auto-download
  const handleOpenNewTab = () => {
    if (isPdf) {
      // In mobile Chrome, direct PDF URLs trigger download. Google viewer opens inline without downloading!
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}`;
      window.open(viewerUrl, '_blank');
    } else {
      window.open(downloadUrl, '_blank');
    }
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
            <div className="w-full h-full flex flex-col">
              {/* PDF Toolbar */}
              <div className="bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex justify-between items-center flex-shrink-0 gap-2">
                {!useCloudViewer ? (
                  <>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pageNumber <= 1 || loading}
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-mono text-slate-300 font-semibold text-[11px] sm:text-xs">
                        {pageNumber} / {numPages}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pageNumber >= numPages || loading}
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
                        className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-mono text-xs text-slate-400 hidden sm:inline">{Math.round(scale * 100)}%</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
                        className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUseCloudViewer(true)}
                        className="h-7 px-2 text-[10px] text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-bold border border-cyan-500/20"
                        title="Switch to Google Docs streamed PDF viewer (low data)"
                      >
                        Cloud Stream
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Streamed In-App Preview (No auto-download)
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUseCloudViewer(false)}
                      className="h-7 px-2 text-[10px] text-slate-300 hover:bg-slate-800 rounded-lg font-bold border border-slate-700"
                    >
                      Native Canvas
                    </Button>
                  </div>
                )}
              </div>
              
              {/* PDF Viewport */}
              <div className="flex-1 relative w-full h-full bg-slate-950 flex items-start justify-center overflow-auto p-2 sm:p-4 select-none">
                {useCloudViewer ? (
                  <iframe 
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`}
                    className="w-full h-full border-0 rounded-lg bg-white"
                    title="PDF Preview"
                  />
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-300 text-xs">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <span>Streaming PDF Pages...</span>
                  </div>
                ) : renderError ? (
                  <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                    <p className="text-xs mb-3 text-slate-300">Canvas render unavailable on this device.</p>
                    <Button onClick={() => setUseCloudViewer(true)} size="sm" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                      <Eye className="w-4 h-4 mr-1.5" /> View via Cloud Stream
                    </Button>
                  </div>
                ) : (
                  <div className="shadow-2xl rounded-lg overflow-hidden bg-white select-none pointer-events-none">
                    <canvas ref={canvasRef} className="max-w-full block select-none pointer-events-none" />
                  </div>
                )}
              </div>
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
