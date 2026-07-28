import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Download, ExternalLink, ShieldAlert } from 'lucide-react';

export default function ViewClaimImagesModal({ isOpen, onClose, claim }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!claim) return null;

  let images = [];
  try {
    images = typeof claim.images_json === 'string' ? JSON.parse(claim.images_json || '[]') : (claim.images_json || []);
  } catch (e) {
    images = [];
  }

  const currentImage = images[activeIdx] || '';

  const handlePrev = () => {
    setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Claim Evidence Photos — {claim.truck_number} ({claim.claim_number})
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {claim.claim_type} • {claim.insurance_company} • Incident: {claim.incident_date}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {images.length > 0 ? `${activeIdx + 1} of ${images.length}` : 'No photos'}
          </Badge>
        </DialogHeader>

        {images.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <ImageIcon className="w-12 h-12 opacity-30 mx-auto" />
            <p className="text-sm font-semibold">No accident photos or document attachments uploaded for this claim.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Main Lightbox Image */}
            <div className="relative aspect-video w-full bg-black/90 rounded-2xl overflow-hidden flex items-center justify-center border border-border/60">
              <img 
                src={currentImage} 
                alt={`Claim evidence photo ${activeIdx + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Action bar overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <a 
                  href={currentImage} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                </a>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black/40 ${
                      activeIdx === idx ? 'border-primary scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
