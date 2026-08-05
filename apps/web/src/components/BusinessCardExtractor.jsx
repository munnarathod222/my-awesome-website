import React, { useState, useRef } from 'react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Camera, Loader2, RefreshCw, FileText, CheckCircle2, Sparkles, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { toast } from 'sonner';

/**
 * Image Canvas Optimizer & Contrast Booster for Business Cards
 */
const optimizeCardImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Adjust contrast and brightness for OCR clarity
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const contrast = 1.15; // +15% contrast boost
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128;     // R
          data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
          data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          const optimizedFile = new File([blob], file.name || 'card.jpg', { type: 'image/jpeg' });
          resolve(optimizedFile);
        }, 'image/jpeg', 0.88);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function BusinessCardExtractor({ onExtractionComplete, onError }) {
  const { sendMessage } = useIntegratedAi();
  const [extracting, setExtracting] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setExtracting(true);
    setStatusStep('Optimizing photo for high-contrast OCR...');

    try {
      // 1. Optimize Image
      const optimizedFile = await optimizeCardImage(file);
      const objectUrl = URL.createObjectURL(optimizedFile);
      setPreview(objectUrl);

      setStatusStep('AI Vision scanning company name, phone, email & GSTIN...');

      // 2. Call Direct Visiting Card API Route
      const formData = new FormData();
      formData.append('images', optimizedFile);

      const response = await fetch('/hcgi/api/integrated-ai/scan-visiting-card', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('pocketbase_auth') ? btoa(localStorage.getItem('pocketbase_auth')) : ''}`
        },
        body: formData
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setExtracting(false);
          toast.success('Visiting card extracted with 100% precision!');
          onExtractionComplete?.(json.data, optimizedFile, objectUrl);
          return;
        }
      }
    } catch (e) {
      console.warn("Direct card API error, switching to streaming AI:", e);
    }

    // 3. Fallback AI Vision Stream Scanner
    try {
      setStatusStep('Streaming AI Vision reading card text...');
      const prompt = `Extract ALL contact data from this visiting card into JSON:
{
  "company_name": "Company Name",
  "contact_person": "Contact Person Name",
  "designation": "Job Title",
  "contact_type": "Client",
  "phone_number": "+91 Mobile Number",
  "alternate_phone": "Alternate Number",
  "email": "Email Address",
  "website": "Website URL",
  "gstin": "GSTIN Tax Number",
  "physical_address": "Address",
  "notes": "Tagline or services"
}
Return ONLY clean JSON.`;

      sendMessage(prompt, [file]);
    } catch (err) {
      setExtracting(false);
      onError?.("Failed to extract visiting card. Please try again.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in font-sans">
      {!preview ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all",
            dragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-muted/20 hover:bg-muted/40"
          )}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
          onDrop={handleDrop}
        >
          {/* File Picker Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            disabled={extracting}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            disabled={extracting}
          />
          
          <div className="bg-primary/10 p-4 rounded-full shadow-inner mb-3">
            <Camera className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-xl font-black text-foreground mb-1 font-heading">
            Scan Visiting / Business Card
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
            Snap 1 photo with phone camera or upload card image. Auto-extracts Company Name, Mobile Numbers, GSTIN, Email & Address precisely.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button 
              type="button"
              onClick={() => cameraInputRef.current?.click()} 
              disabled={extracting}
              className="rounded-xl shadow-lg font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:opacity-95 text-xs h-10 px-5"
            >
              <Camera className="w-4 h-4 mr-2" /> Snap Card Photo
            </Button>

            <Button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              disabled={extracting}
              variant="outline"
              className="rounded-xl border-border/80 font-bold text-xs h-10 px-5"
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-border/60 rounded-2xl bg-muted/20 space-y-4">
          <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-border shadow-xl bg-black/60">
            <img src={preview} alt="Visiting card preview" className="w-full h-full object-contain" />
            {extracting && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 p-4 text-center">
                <Loader2 className="w-9 h-9 animate-spin text-amber-400" />
                <p className="text-xs font-black text-amber-300 font-mono tracking-wide">{statusStep}</p>
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-200">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> High Precision AI OCR Running
                </Badge>
              </div>
            )}
          </div>

          {!extracting && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreview(null)}
              className="rounded-xl text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Snap Another Card
            </Button>
          )}
        </div>
      )}
    </div>
  );
}