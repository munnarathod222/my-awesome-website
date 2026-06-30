import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const ImagePreview = ({ record, fileField = 'image', altText = 'Transaction attachment' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!record || !record[fileField]) {
    return (
      <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md border border-border" aria-label="No image">
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  const fileUrl = pb.files.getUrl(record, record[fileField]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="w-10 h-10 overflow-hidden rounded-md border border-border hover:ring-2 hover:ring-primary transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${altText}`}
        >
          {imgError ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <img 
              src={fileUrl} 
              alt={`${altText} thumbnail`} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{altText}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg min-h-[300px]">
          {imgError ? (
            <p className="text-muted-foreground">Failed to load image</p>
          ) : (
            <img 
              src={fileUrl} 
              alt={altText} 
              className="max-w-full max-h-[70vh] object-contain rounded-md shadow-md"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;