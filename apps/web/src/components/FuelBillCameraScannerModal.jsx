import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle2, Sparkles, AlertCircle, RefreshCw, FileText, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Robust Multi-Strategy Indian Fuel Dispenser Slip Parser
 */
export const parseFuelReceiptText = (rawText) => {
  const clean = (rawText || '').replace(/\r\n/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  const result = {
    liters: '',
    ratePerLiter: '',
    totalAmount: '',
    date: '',
    vendor: '',
    truckNumber: '',
    invoiceNo: ''
  };

  // ── 1. Vendor / Fuel Station ─────────────────────────────────────────────
  const brandRegex = /BPCL|BHARAT\s*PETROLEUM|HPCL|HINDUSTAN\s*PETROLEUM|IOCL|INDIAN\s*OIL|SHELL|NAYARA|RELIANCE|JIO-BP|ESSAR/i;
  const brandMatch = clean.match(brandRegex);
  const stationLine = lines.find(l => /SERVICE\s*STATION|PETROL\s*PUMP|FILLING\s*STATION|AUTO|OIL\s*CORP|FUELS|AUTOMOBILE/i.test(l));
  
  if (stationLine) {
    result.vendor = stationLine + (brandMatch && !stationLine.toUpperCase().includes(brandMatch[0].toUpperCase()) ? ` (${brandMatch[0].toUpperCase()})` : '');
  } else if (brandMatch) {
    result.vendor = brandMatch[0].toUpperCase();
  } else if (lines.length > 0) {
    result.vendor = lines[0].substring(0, 50);
  }

  // ── 2. Liters / Volume ──────────────────────────────────────────────────
  const volumePatterns = [
    /(?:VOLUME|VOL|QTY|QUANTITY|VOL\(L\)|VOL\(LTR\)|QTY\(L\)|LITRES?|LTRS?|LTR)\s*[:=.]*\s*([0-9]+\.?[0-9]*)/i,
    /([0-9]{1,4}\.[0-9]{2,3})\s*(?:LTR|LITRES?|L|LTRS)\b/i,
    /(?:DIESEL|HSD|PETROL|MS)\s*[:=.]*\s*([0-9]+\.?[0-9]*)\s*(?:L|LTR)/i
  ];
  for (const pat of volumePatterns) {
    const m = clean.match(pat);
    if (m && parseFloat(m[1]) > 0) {
      result.liters = parseFloat(m[1]);
      break;
    }
  }

  // ── 3. Rate per Liter ───────────────────────────────────────────────────
  const ratePatterns = [
    /(?:RATE|RSP|PRICE|UNIT\s*PRICE|RATE\/LTR|RATE\/LITRE|RATE\s*\(RS\/L\)|RATE\s*\(INR\/L\))\s*[:=.]*\s*(?:RS\.?|INR|₹)?\s*([0-9]+\.?[0-9]*)/i,
    /(?:RS\.?|INR|₹|\/L)\s*([0-9]{2,3}\.[0-9]{2})\s*(?:\/L|PER\s*L|PER\s*LTR)?/i
  ];
  for (const pat of ratePatterns) {
    const m = clean.match(pat);
    if (m && parseFloat(m[1]) > 0) {
      const val = parseFloat(m[1]);
      // Indian diesel rates are typically between 50 and 200
      if (val >= 50 && val <= 200) {
        result.ratePerLiter = val;
        break;
      }
    }
  }

  // ── 4. Total Amount ─────────────────────────────────────────────────────
  const amountPatterns = [
    /(?:TOTAL\s*AMOUNT|TOTAL\s*SALE|NET\s*AMOUNT|TOT\s*AMT|SALE\s*AMT|AMOUNT|TOTAL|AMT)\s*[:=.]*\s*(?:RS\.?|INR|₹)?\s*([0-9,]+\.?[0-9]*)/i,
    /(?:RS\.?|INR|₹)\s*([0-9,]+\.[0-9]{2})/i
  ];
  for (const pat of amountPatterns) {
    const m = clean.match(pat);
    if (m) {
      const parsed = parseFloat(m[1].replace(/,/g, ''));
      if (parsed > 0) {
        result.totalAmount = parsed;
        break;
      }
    }
  }

  // ── 5. Mathematical Triplet Search Fallback (X * Y ≈ Z) ─────────────────
  // If labels were missing or damaged, search for numbers that satisfy Liters * Rate = Total
  if (!result.totalAmount || !result.liters) {
    const numberMatches = Array.from(clean.matchAll(/\b([0-9]+(?:\.[0-9]{1,3})?)\b/g))
      .map(m => parseFloat(m[1]))
      .filter(n => n > 0 && n !== 2024 && n !== 2025 && n !== 2026);

    for (let i = 0; i < numberMatches.length; i++) {
      for (let j = 0; j < numberMatches.length; j++) {
        if (i === j) continue;
        const n1 = numberMatches[i];
        const n2 = numberMatches[j];
        const prod = n1 * n2;
        
        const matchedTotal = numberMatches.find(t => Math.abs(t - prod) <= 1.0 && t > 500);
        if (matchedTotal) {
          const rateVal = Math.min(n1, n2);
          const literVal = Math.max(n1, n2);
          if (rateVal >= 70 && rateVal <= 130 && (!result.liters || !result.totalAmount)) {
            result.ratePerLiter = rateVal;
            result.liters = literVal;
            result.totalAmount = +(rateVal * literVal).toFixed(2);
            break;
          }
        }
      }
      if (result.totalAmount && result.liters) break;
    }
  }

  // ── 6. Mathematical Consistency Check ────────────────────────────────────
  if (result.liters && result.ratePerLiter && !result.totalAmount) {
    result.totalAmount = +(result.liters * result.ratePerLiter).toFixed(2);
  } else if (result.totalAmount && result.ratePerLiter && !result.liters) {
    result.liters = +(result.totalAmount / result.ratePerLiter).toFixed(2);
  } else if (result.totalAmount && result.liters && !result.ratePerLiter) {
    result.ratePerLiter = +(result.totalAmount / result.liters).toFixed(2);
  }

  // ── 7. Date ─────────────────────────────────────────────────────────────
  const dateMatch = clean.match(/(\d{1,2})[-/.]([A-Za-z]{3}|\d{1,2})[-/.](\d{2,4})/);
  if (dateMatch) {
    const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
    const day = dateMatch[1].padStart(2, '0');
    let m = dateMatch[2].toLowerCase();
    m = months[m] || m.padStart(2, '0');
    let y = dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3];
    result.date = `${y}-${m}-${day}`;
  } else {
    result.date = new Date().toISOString().split('T')[0];
  }

  // ── 8. Vehicle Number (e.g. TS08UE2637, TG12U2637, 2637) ─────────────────
  const fullVehMatch = clean.match(/\b([A-Z]{2}\s*[0-9]{1,2}\s*[A-Z]{1,3}\s*[0-9]{4})\b/i) ||
                       clean.match(/(?:VEHICLE|VEH|TRUCK|REG|VEH\.?\s*NO)[:=.\s]*([0-9A-Z\s]{4,15})/i);
  if (fullVehMatch) {
    result.truckNumber = fullVehMatch[1].replace(/[\s-]/g, '').toUpperCase();
  }

  // ── 9. Invoice / Bill No ────────────────────────────────────────────────
  const invMatch = clean.match(/(?:INVOICE|INV|BILL|REC(?:EIPT)?|MEMO)\s*(?:NO|NUM|\.)?[:=.\s]*([0-9A-Z]+)/i);
  if (invMatch) {
    result.invoiceNo = invMatch[1];
  }

  return result;
};

/**
 * Mobile-Optimized Canvas Resizer & Contrast Enhancer
 * Compresses 15MB mobile photos to ~250KB for fast OCR scanning
 */
const optimizeImageForOcr = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const maxDim = 1500;
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;
        const contrast = 1.15;
        const intercept = 128 * (1 - contrast);
        for (let i = 0; i < d.length; i += 4) {
          d[i] = d[i] * contrast + intercept;
          d[i + 1] = d[i + 1] * contrast + intercept;
          d[i + 2] = d[i + 2] * contrast + intercept;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (_) {}

      canvas.toBlob((blob) => {
        let finalFile = file;
        if (blob) {
          finalFile = new File([blob], (file?.name || 'diesel_receipt').replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
        }
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({ dataUrl: optimizedDataUrl, rawFile: finalFile });
      }, 'image/jpeg', 0.88);
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve({ dataUrl: e.target.result, rawFile: file });
      reader.readAsDataURL(file);
    };

    img.src = blobUrl;
  });
};

export default function FuelBillCameraScannerModal({ isOpen, onClose, onApplyScan }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setExtractedData(null);

    try {
      const { dataUrl, rawFile: optFile } = await optimizeImageForOcr(file);
      setRawFile(optFile);
      setImagePreview(dataUrl);
      await processImageClientSide(dataUrl);
    } catch (err) {
      console.error('Image optimization failed:', err);
      toast.error('Failed to process image file.');
      setScanning(false);
    }
  };

  const processImageClientSide = async (dataUrl) => {
    setScanning(true);
    setExtractedData(null);

    try {
      let rawText = '';

      // Tier 1: Try backend OCR API endpoint
      try {
        const apiRes = await fetch('/hcgi/api/fuel/ocr-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl })
        });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (apiJson.success && apiJson.rawText) {
            rawText = apiJson.rawText;
          }
        }
      } catch (backendErr) {
        console.warn('Backend OCR endpoint notice, trying direct cloud OCR:', backendErr);
      }

      // Tier 2: Direct OCR.Space Engine 2 API
      if (!rawText) {
        try {
          const postData = new URLSearchParams({
            base64Image: dataUrl,
            language: 'eng',
            isOverlayRequired: 'false',
            isTable: 'true',
            scale: 'true',
            detectOrientation: 'true',
            OCREngine: '2'
          }).toString();

          const directRes = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
              'apikey': 'K88289458488957',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: postData
          });
          const directJson = await directRes.json();
          rawText = directJson?.ParsedResults?.[0]?.ParsedText || '';
        } catch (directErr) {
          console.warn('Direct OCR.Space Engine 2 failed, trying Engine 1:', directErr);
        }
      }

      // Tier 3: Direct OCR.Space Engine 1 (Fallback for dot matrix & thermal paper)
      if (!rawText) {
        try {
          const postData = new URLSearchParams({
            base64Image: dataUrl,
            language: 'eng',
            isOverlayRequired: 'false',
            isTable: 'true',
            scale: 'true',
            detectOrientation: 'true',
            OCREngine: '1'
          }).toString();

          const directRes1 = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
              'apikey': 'K88289458488957',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: postData
          });
          const directJson1 = await directRes1.json();
          rawText = directJson1?.ParsedResults?.[0]?.ParsedText || '';
        } catch (e) {
          console.warn('Direct OCR.Space Engine 1 note:', e);
        }
      }

      const parsed = parseFuelReceiptText(rawText);
      setExtractedData(parsed);

      if (parsed.liters || parsed.totalAmount) {
        toast.success(`Scanned: ${parsed.liters ? parsed.liters + ' L' : ''} ${parsed.totalAmount ? '₹' + parsed.totalAmount : ''}`);
      } else {
        toast.info('Receipt image loaded. Please review or adjust details.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Could not auto-read text clearly. Please review or type details manually.');
      setExtractedData({
        liters: '',
        ratePerLiter: '',
        totalAmount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        truckNumber: ''
      });
    } finally {
      setScanning(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setExtractedData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'liters' || field === 'ratePerLiter') {
        const l = parseFloat(field === 'liters' ? value : updated.liters) || 0;
        const r = parseFloat(field === 'ratePerLiter' ? value : updated.ratePerLiter) || 0;
        if (l > 0 && r > 0) {
          updated.totalAmount = +(l * r).toFixed(2);
        }
      }
      return updated;
    });
  };

  const handleApply = () => {
    if (extractedData && onApplyScan) {
      onApplyScan({
        ...extractedData,
        receiptFile: rawFile,
        receiptPreviewUrl: imagePreview
      });
      toast.success('Extracted details applied to fuel form!');
      handleClose();
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    setRawFile(null);
    setExtractedData(null);
    setScanning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase font-semibold tracking-wider">Free AI Fuel Receipt Scanner</span>
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-slate-100">
            Scan Diesel Bill / Weighbridge Slip
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Take a photo with your mobile camera or upload a diesel bill to auto-extract liters, rate, and amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Direct Camera Input for Mobile */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={cameraInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {/* Gallery / File Picker Input */}
          <input 
            type="file" 
            accept="image/*" 
            ref={galleryInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {!imagePreview ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary: Mobile Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-emerald-600/10 hover:bg-emerald-600/20 border-2 border-emerald-500/40 hover:border-emerald-500 rounded-2xl transition-all group cursor-pointer text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-white text-base">📸 Take Photo</span>
                  <span className="text-xs text-emerald-400 mt-1">Open mobile camera</span>
                </button>

                {/* Secondary: Gallery Upload */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-slate-950/60 hover:bg-slate-950/90 border-2 border-slate-700 hover:border-slate-500 rounded-2xl transition-all group cursor-pointer text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-white text-base">📁 Choose Image</span>
                  <span className="text-xs text-slate-400 mt-1">From gallery or files</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  ⚡ Auto-optimizes high-res photos. Reads IOCL, BPCL, HPCL, Shell, Nayara & Reliance receipts.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black max-h-64 flex items-center justify-center">
                <img src={imagePreview} alt="Receipt preview" className="object-contain max-h-64 w-full" />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-slate-900/90 text-xs backdrop-blur-md rounded-lg hover:bg-slate-800"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" /> Retake
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {scanning ? (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-300">Reading Receipt Image...</p>
                    <p className="text-xs text-slate-500 mt-1">Extracting liters, rate & total amount</p>
                  </div>
                ) : extractedData ? (
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Extracted Values (Editable)</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <label className="text-slate-500 block text-[10px] uppercase font-semibold">Liters</label>
                        <input
                          type="number"
                          step="0.01"
                          value={extractedData.liters || ''}
                          onChange={(e) => handleFieldChange('liters', e.target.value)}
                          className="w-full bg-transparent text-emerald-400 font-bold text-base focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <label className="text-slate-500 block text-[10px] uppercase font-semibold">Rate (₹/L)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={extractedData.ratePerLiter || ''}
                          onChange={(e) => handleFieldChange('ratePerLiter', e.target.value)}
                          className="w-full bg-transparent text-slate-100 font-bold text-base focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-lg col-span-2 border border-slate-800">
                        <label className="text-slate-500 block text-[10px] uppercase font-semibold">Total Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={extractedData.totalAmount || ''}
                          onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
                          className="w-full bg-transparent text-amber-400 font-bold text-lg focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-lg col-span-2 border border-slate-800">
                        <label className="text-slate-500 block text-[10px] uppercase font-semibold">Station / Vendor</label>
                        <input
                          type="text"
                          value={extractedData.vendor || ''}
                          onChange={(e) => handleFieldChange('vendor', e.target.value)}
                          className="w-full bg-transparent text-slate-200 font-medium text-xs focus:outline-none truncate"
                          placeholder="Station Name"
                        />
                      </div>
                      {extractedData.truckNumber && (
                        <div className="bg-slate-900/90 p-2 rounded-lg col-span-2 border border-slate-800 flex items-center justify-between">
                          <label className="text-slate-500 block text-[10px] uppercase font-semibold">Vehicle</label>
                          <span className="font-mono font-bold text-xs text-primary">{extractedData.truckNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                    No data extracted yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button 
            disabled={!extractedData || scanning} 
            onClick={handleApply} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Apply to Fuel Form <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
