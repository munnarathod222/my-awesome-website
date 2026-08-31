import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruitmentDocumentLightboxModal({ isOpen, onClose, docUrl, docTitle, candidateName = 'Applicant' }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !docUrl) return null;

  const isPdf = docUrl.startsWith('data:application/pdf') || /\.pdf$/i.test(docUrl) || (docUrl.startsWith('data:') && !docUrl.startsWith('data:image/'));
  const isImage = (docUrl.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(docUrl)) && !isPdf;

  const cleanFileName = `${(docTitle || 'Document').replace(/\s+/g, '_')}_${(candidateName || 'Applicant').replace(/\s+/g, '_')}`;

  const handleDownload = () => {
    try {
      if (docUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = docUrl;
        const ext = isPdf ? 'pdf' : (docUrl.match(/data:image\/([a-zA-Z0-9]+);/) || [])[1] || 'png';
        link.download = `${cleanFileName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const link = document.createElement('a');
        link.href = docUrl;
        link.download = cleanFileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success(`Downloaded ${docTitle || 'document'}`);
    } catch (e) {
      toast.error('Failed to download file');
    }
  };

  const handleOpenNewTab = () => {
    try {
      if (docUrl.startsWith('data:')) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${docTitle || 'Document Preview'} - ${candidateName}</title>
                <style>
                  body { margin: 0; background: #0b0f19; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; color: white; }
                  .header { padding: 16px; background: #1e293b; width: 100%; text-align: center; font-weight: bold; border-bottom: 1px solid #334155; }
                  img { max-width: 95vw; max-height: 85vh; object-fit: contain; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); margin: 20px; }
                  embed, object, iframe { width: 100vw; height: 90vh; border: none; }
                </style>
              </head>
              <body>
                <div class="header">${docTitle || 'Document'} - ${candidateName}</div>
                ${isPdf 
                  ? `<object data="${docUrl}" type="application/pdf"><embed src="${docUrl}" type="application/pdf" /><iframe src="${docUrl}"></iframe></object>` 
                  : `<img src="${docUrl}" alt="${docTitle}" />`}
              </body>
            </html>
          `);
          win.document.close();
        }
      } else {
        window.open(docUrl, '_blank');
      }
    } catch (e) {
      toast.error('Browser blocked popup');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] flex flex-col bg-slate-950 border-slate-800 text-white shadow-2xl rounded-3xl p-4 sm:p-6 font-sans">
        <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" /> {docTitle || 'Document Viewer'}
            </DialogTitle>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Candidate: {candidateName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="w-8 h-8 rounded-xl bg-slate-900 border-slate-700 text-slate-300">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="w-8 h-8 rounded-xl bg-slate-900 border-slate-700 text-slate-300">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setRotation(r => (r + 90) % 360)} className="w-8 h-8 rounded-xl bg-slate-900 border-slate-700 text-slate-300">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Main Document Viewer Stage */}
        <div className="flex-1 min-h-[350px] max-h-[65vh] overflow-auto flex items-center justify-center p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 my-2 relative">
          {isImage ? (
            <div className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full">
              <img 
                src={docUrl} 
                alt={docTitle} 
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} 
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center relative bg-slate-950/40 rounded-xl">
              <object data={docUrl} type="application/pdf" className="w-full h-full rounded-xl border border-slate-800 bg-slate-900">
                <embed src={docUrl} type="application/pdf" className="w-full h-full rounded-xl" />
                <div className="text-center space-y-3 p-6 flex flex-col items-center justify-center h-full">
                  <FileText className="w-16 h-16 text-blue-400 animate-pulse" />
                  <p className="text-sm text-slate-200 font-bold">PDF Document: {docTitle}</p>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleOpenNewTab} variant="outline" className="rounded-xl font-bold bg-slate-900 border-slate-700 text-slate-200">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open PDF Preview
                    </Button>
                    <Button onClick={handleDownload} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white">
                      <Download className="w-4 h-4 mr-2" /> Download PDF File
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          ) : (
            <div className="text-center space-y-3 p-6">
              <FileText className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
              <p className="text-sm text-slate-300 font-bold">{docTitle}</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleOpenNewTab} variant="outline" className="rounded-xl font-bold bg-slate-900 border-slate-700 text-slate-300">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Document
                </Button>
                <Button onClick={handleDownload} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-500">
                  <Download className="w-4 h-4 mr-2" /> Download File
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-800 flex flex-row items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleOpenNewTab} className="text-xs font-bold text-slate-300 hover:text-white">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Full Screen Tab
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold bg-slate-900 border-slate-700 text-slate-300">
              Close
            </Button>
            <Button onClick={handleDownload} className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Document
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
