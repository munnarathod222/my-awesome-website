import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PenTool, Eraser, Check, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function SignaturePadModal({ isOpen, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a'); // Slate 900
  const [penWidth, setPenWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Support high DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      if (e) e.preventDefault();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveSignature = () => {
    if (!hasDrawn) {
      toast.error('Please draw your signature first');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export as transparent PNG Data URL
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    toast.success('E-Signature captured');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" /> Draw Digital E-Signature
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sign inside the canvas box below using your mouse, stylus, or touchscreen finger.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Controls */}
          <div className="flex items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground mr-1">Ink Color:</Label>
              <button
                type="button"
                onClick={() => setPenColor('#0f172a')}
                className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition-transform ${penColor === '#0f172a' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                title="Black Slate"
              />
              <button
                type="button"
                onClick={() => setPenColor('#1e40af')}
                className={`w-6 h-6 rounded-full bg-blue-800 border-2 transition-transform ${penColor === '#1e40af' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                title="Royal Blue"
              />
              <button
                type="button"
                onClick={() => setPenColor('#047857')}
                className={`w-6 h-6 rounded-full bg-emerald-700 border-2 transition-transform ${penColor === '#047857' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                title="Emerald Dark"
              />
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="h-8 text-xs text-muted-foreground hover:text-destructive">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>

          {/* Canvas Box */}
          <div className="relative border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors rounded-2xl bg-background overflow-hidden h-44 shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground/30 space-y-1">
                <PenTool className="w-8 h-8 opacity-40 animate-bounce" />
                <span className="text-xs font-semibold">Sign Here</span>
              </div>
            )}
            <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-muted-foreground/40 font-mono">
              Transparent PNG Output
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveSignature} className="rounded-xl">
            <Check className="w-4 h-4 mr-1.5" /> Attach E-Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
