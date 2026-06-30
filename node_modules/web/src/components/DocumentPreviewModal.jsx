import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileImage, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

const DocumentPreviewModal = ({ isOpen, onClose, document, collectionName = 'truck_documents' }) => {
  if (!document || !document.file) return null;

  const fileUrl = pb.files.getUrl(document, document.file);
  const fileExt = document.file.split('.').pop().toLowerCase();
  
  const isPdf = fileExt === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {isPdf ? <FileText className="w-5 h-5 text-blue-500" /> : isImage ? <FileImage className="w-5 h-5 text-green-500" /> : <FileQuestion className="w-5 h-5" />}
            {document.document_type || 'Document'} - {document.document_number || 'No Number'}
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Uploaded on {document.upload_date ? format(new Date(document.upload_date), 'MMM dd, yyyy') : format(new Date(document.created), 'MMM dd, yyyy')}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted/30 rounded-xl overflow-hidden border border-border relative flex items-center justify-center">
          {isPdf ? (
            <iframe 
              src={`${fileUrl}#toolbar=0`} 
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt={`${document.document_type} preview`}
              className="max-w-full max-h-full object-contain p-2"
            />
          ) : (
            <div className="text-center p-8 flex flex-col items-center justify-center">
              <FileQuestion className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">Preview not available for this file type.</p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="w-4 h-4 mr-2" /> Download File
              </Button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 flex justify-between items-center mt-auto">
          <p className="text-sm text-muted-foreground max-w-[60%] truncate" title={document.notes}>
            {document.notes || 'No additional notes.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;