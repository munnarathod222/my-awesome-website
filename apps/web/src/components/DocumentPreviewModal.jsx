import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileQuestion, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

const DocumentPreviewModal = ({ isOpen, onClose, document, collectionName = 'truck_documents' }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [useGoogleViewer, setUseGoogleViewer] = useState(true);

  const filesList = document?.files || (document?.file ? [document.file] : []);

  useEffect(() => {
    if (filesList.length > 0) {
      setActiveFile(filesList[0]);
    } else {
      setActiveFile(null);
    }
  }, [document]);

  if (!document || !activeFile) return null;

  const rawUrl = pb.files.getURL(document, activeFile);
  // Append inline=1 so PocketBase serves with inline headers instead of attachment download
  const fileUrl = rawUrl.includes('?') ? `${rawUrl}&inline=1` : `${rawUrl}?inline=1`;
  const fileExt = activeFile.split('.').pop().toLowerCase();
  
  const isPdf = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);

  // Google Docs viewer URL for seamless mobile Safari / Android PDF rendering
  const googlePdfViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = rawUrl;
    a.download = activeFile;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] h-[88vh] flex flex-col bg-card text-card-foreground p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="flex-shrink-0 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              {isPdf ? <FileText className="w-5 h-5 text-blue-500" /> : isImage ? <FileImage className="w-5 h-5 text-emerald-500" /> : <FileQuestion className="w-5 h-5 text-amber-500" />}
              {document.document_type || 'Document'} - {document.document_number || 'No Number'}
            </DialogTitle>
            <div className="text-xs text-muted-foreground mt-0.5 font-mono">
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

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleOpenNewTab} className="rounded-xl text-xs flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Open Tab
            </Button>
          </div>
        </DialogHeader>

        {filesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2 flex-shrink-0">
            {filesList.map((file, index) => {
              const ext = file.split('.').pop().toLowerCase();
              const isActive = file === activeFile;
              return (
                <Button 
                  key={index}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFile(file)}
                  className="rounded-xl text-xs flex items-center gap-1.5"
                >
                  {ext === 'pdf' ? <FileText className="w-3.5 h-3.5" /> : <FileImage className="w-3.5 h-3.5" />}
                  File {index + 1} ({ext.toUpperCase()})
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-h-0 bg-slate-950/80 rounded-xl overflow-hidden border border-border relative flex items-center justify-center my-2">
          {isPdf ? (
            <div className="w-full h-full flex flex-col">
              <div className="bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex justify-between items-center">
                <span>PDF Preview Mode</span>
                <button
                  type="button"
                  onClick={() => setUseGoogleViewer(!useGoogleViewer)}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> {useGoogleViewer ? 'Switch to Native' : 'Switch to Cloud Viewer'}
                </button>
              </div>
              
              <div className="flex-1 relative w-full h-full">
                {useGoogleViewer ? (
                  <iframe 
                    src={googlePdfViewerUrl} 
                    className="w-full h-full border-0 bg-white"
                    title="PDF Google Viewer"
                  />
                ) : (
                  <object
                    data={fileUrl}
                    type="application/pdf"
                    className="w-full h-full border-0"
                  >
                    <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                      <p className="text-xs mb-3">Your browser does not support inline PDF embedding.</p>
                      <Button onClick={handleOpenNewTab} size="sm" className="rounded-xl">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open PDF in New Tab
                      </Button>
                    </div>
                  </object>
                )}
              </div>
            </div>
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt={`${document.document_type} preview`}
              className="max-w-full max-h-full object-contain p-2"
            />
          ) : (
            <div className="text-center p-8 flex flex-col items-center justify-center text-white">
              <FileQuestion className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
              <p className="text-sm text-slate-300">Preview not available for this file type.</p>
              <Button onClick={handleOpenNewTab} className="mt-4 rounded-xl">
                <ExternalLink className="w-4 h-4 mr-2" /> Open File
              </Button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-2 flex justify-between items-center text-xs">
          <p className="text-muted-foreground max-w-[50%] truncate" title={document.notes}>
            {document.notes || 'No additional notes.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
              Close
            </Button>
            <Button size="sm" onClick={handleDownload} className="rounded-xl font-bold flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download PDF / File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;