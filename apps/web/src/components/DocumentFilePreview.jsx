import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const DocumentFilePreview = ({ file, docRecord, onDelete, isNew = false }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isNew && file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (!isNew && typeof file === 'string' && docRecord) {
      setPreviewUrl(pb.files.getUrl(docRecord, file));
    }
  }, [file, isNew, docRecord]);

  const fileName = isNew ? file.name : file;
  const fileSize = isNew ? file.size : 0; // PB doesn't expose size directly in list without expanding
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card group hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        <div className="flex-shrink-0 w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={fileName} className="w-full h-full object-cover" />
          ) : isPdf ? (
            <FileText className="w-6 h-6 text-destructive" />
          ) : (
            <FileText className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isNew && <span>{formatSize(fileSize)}</span>}
            {isNew && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">New</span>}
            {!isNew && docRecord?.created && <span>Uploaded {format(new Date(docRecord.created), 'MMM d, yyyy')}</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {previewUrl && !isNew && (
          <Button variant="ghost" size="icon" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="w-4 h-4" />
              <span className="sr-only">Download</span>
            </a>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onDelete(file, isNew)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
};

export default DocumentFilePreview;