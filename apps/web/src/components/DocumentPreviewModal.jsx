import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileQuestion, ExternalLink, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
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

  const canvasRef = useRef(null);

  const filesList = document?.files || (document?.file ? [document.file] : []);

  useEffect(() => {
    if (filesList.length > 0) {
      setActiveFile(filesList[0]);
    } else {
      setActiveFile(null);
    }
  }, [document]);

  const rawUrl = activeFile ? pb.files.getURL(document, activeFile) : '';
  const fileExt = activeFile ? activeFile.split('.').pop().toLowerCase() : '';
  const isPdf = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);

  // Load PDF.js script dynamically if needed
  useEffect(() => {
    let isMounted = true;

    if (isOpen && isPdf && rawUrl) {
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
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const response = await fetch(rawUrl);
          const arrayBuffer = await response.arrayBuffer();
          const loadedPdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          
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
        }
      });
    } else {
      setPdfDoc(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeFile, rawUrl, isPdf]);

  // Render current PDF page onto canvas
  useEffect(() => {
    let renderTask = null;

    if (pdfDoc && canvasRef.current && isPdf) {
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
      }).catch(console.error);
    }

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale, isPdf]);

  if (!document || !activeFile) return null;

  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = rawUrl;
    a.download = activeFile;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    window.open(rawUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[920px] w-[95vw] h-[88vh] flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <DialogHeader className="flex-shrink-0 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-white">
              {isPdf ? <FileText className="w-5 h-5 text-blue-400" /> : isImage ? <FileImage className="w-5 h-5 text-emerald-400" /> : <FileQuestion className="w-5 h-5 text-amber-400" />}
              {document.document_type || 'Document'} - {document.document_number || 'No Number'}
            </DialogTitle>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">
              {(() => {
                const dateVal = document.upload_date || document.created;
                if (!dateVal) return <span>No upload date available</span>;
                try {
                  const d = new Date(dateVal);
                  if (isNaN(d.getTime())) return <span>No upload date available</span>;
                  return <>Uploaded on {format(d, 'MMM dd, yyyy')}</>;
                } catch (e) {
                  return <span>No upload date available</span>;
                }
              })()}
            </div>
          </div>

          {!hideDownload && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleOpenNewTab} className="rounded-xl text-xs flex items-center gap-1 border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
                <ExternalLink className="w-3.5 h-3.5" /> Full Tab View
              </Button>
            </div>
          )}
        </DialogHeader>

        {filesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2 flex-shrink-0">
            {filesList.map((file, index) => {
              const ext = file.split('.').pop().toLowerCase();
              const isActive = file === activeFile;
              const pageLabel = filesList.length === 2 
                ? (index === 0 ? '📄 Front Page (Front Side)' : '📄 Back Page (Back Side)')
                : `Page ${index + 1} (${ext.toUpperCase()})`;
              return (
                <Button 
                  key={index}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFile(file)}
                  className={`rounded-xl text-xs flex items-center gap-1.5 font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
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
              <div className="bg-slate-900 px-3 py-2 text-xs text-slate-300 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pageNumber <= 1 || loading}
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-mono text-slate-300 font-semibold">
                    Page {pageNumber} of {numPages}
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

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
                    className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                  <span className="font-mono text-xs text-slate-400">{Math.round(scale * 100)}%</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
                    className="h-7 w-7 p-0 text-white hover:bg-slate-800 rounded-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* PDF Canvas Viewport */}
              <div className="flex-1 relative w-full h-full bg-slate-950 flex items-start justify-center overflow-auto p-4 select-none">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-300 text-xs">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <span>Rendering High-Resolution PDF Pages...</span>
                  </div>
                ) : renderError ? (
                  <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                    <p className="text-xs mb-3 text-slate-300">Native canvas preview unavailable.</p>
                    {!hideDownload && (
                      <Button onClick={handleOpenNewTab} size="sm" className="rounded-xl bg-primary text-primary-foreground font-bold">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open PDF in Fullscreen Tab
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="shadow-2xl rounded-lg overflow-hidden bg-white select-none pointer-events-none">
                    <canvas ref={canvasRef} className="max-w-full block select-none pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-2 relative select-none">
              <img 
                src={rawUrl} 
                alt={`${document.document_type} preview`}
                className="max-w-full max-h-full object-contain p-2 select-none pointer-events-none"
              />
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

        <div className="flex-shrink-0 pt-2 flex justify-between items-center text-xs">
          <p className="text-slate-400 max-w-[50%] truncate" title={document.notes}>
            {document.notes || 'No additional notes.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
              Close
            </Button>
            {!hideDownload && (
              <Button size="sm" onClick={handleDownload} className="rounded-xl font-bold flex items-center gap-1 bg-primary text-primary-foreground">
                <Download className="w-3.5 h-3.5" /> Download PDF / File
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}