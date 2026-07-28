import React, { useState, useEffect, useRef } from 'react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai.jsx';
import { Button } from '@/components/ui/button';
import { UploadCloud, Camera, Loader2, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function BusinessCardExtractor({ onExtractionComplete, onError }) {
  const { messages, isStreaming, isLoadingHistory, sendMessage } = useIntegratedAi();
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  // Track when extraction finishes
  useEffect(() => {
    if (extracting && !isStreaming && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        setExtracting(false);
        try {
          // Look for JSON block in the response
          const jsonMatch = lastMsg.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            onExtractionComplete(parsed, selectedFileObj, preview);
          } else {
            // Regex fallback if JSON was not cleanly returned
            const text = lastMsg.content;
            const extractedPhone = text.match(/\b[6-9]\d{9}\b/g)?.[0] || text.match(/\+91[\s-]?\d{10}/g)?.[0] || '';
            const extractedEmail = text.match(/[\w.-]+@[\w.-]+\.\w+/g)?.[0] || '';
            const extractedGstin = text.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g)?.[0] || '';
            const extractedWebsite = text.match(/\b(?:www\.|https?:\/\/)\S+/g)?.[0] || '';

            const fallbackObj = {
              company_name: '',
              contact_person: '',
              designation: '',
              contact_type: 'Client',
              phone_number: extractedPhone,
              alternate_phone: '',
              email: extractedEmail,
              website: extractedWebsite,
              gstin: extractedGstin,
              physical_address: '',
              notes: text.substring(0, 300)
            };
            onExtractionComplete(fallbackObj, selectedFileObj, preview);
          }
        } catch (e) {
          console.error("Parse error fallback:", e);
          onError("Error parsing AI response: " + e.message);
        }
      }
    }
  }, [isStreaming, messages, extracting, onExtractionComplete, onError, selectedFileObj, preview]);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'].includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      onError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setSelectedFileObj(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setExtracting(true);
    
    const prompt = `You are a high-precision OCR and business card data extraction AI for Indian logistics, transportation, corporate, and vendor cards.
Carefully analyze the business card image provided and extract ALL visible contact details into a clean JSON object with these EXACT keys:

{
  "company_name": "Company, firm, or business name",
  "contact_person": "Full name of the contact person",
  "designation": "Job title / position / Owner / Proprietor / Director / Manager",
  "contact_type": "Auto-detect one of: Client, Corporate, Vendor, Driver, Mechanic, Showroom, Spare Parts, RTO Agent, Banking, Loan Agent, Warehouse, Other",
  "phone_number": "Primary mobile number with country code if available (e.g. +91 98765 43210)",
  "alternate_phone": "Secondary phone, landline, or WhatsApp number",
  "email": "Email address",
  "website": "Website URL",
  "gstin": "15-digit GSTIN tax number if visible (e.g. 36AAAAA0000A1Z5)",
  "physical_address": "Full physical office/warehouse/shop address including street, landmark, city, state, and pincode",
  "notes": "Any extra notes such as services offered, branch locations, or bank account details listed on the card"
}

If a field is not visible on the card, set its value to an empty string "". Return ONLY valid JSON.`;
    
    sendMessage(prompt, [file]);
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
            dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/20 hover:bg-muted/40",
            isLoadingHistory && "opacity-50 pointer-events-none"
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
            disabled={isLoadingHistory || extracting}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            disabled={isLoadingHistory || extracting}
          />
          
          <div className="bg-primary/10 p-4 rounded-full shadow-inner mb-4">
            {isLoadingHistory ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
              <Camera className="w-10 h-10 text-primary" />
            )}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1">
            {isLoadingHistory ? "Connecting AI Scanner..." : "Scan Visiting / Business Card"}
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] mb-6">
            Take 1 photo or drag & drop card image to extract company name, mobile numbers, GST, email & address instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button 
              type="button"
              onClick={() => cameraInputRef.current?.click()} 
              disabled={isLoadingHistory || extracting}
              className="rounded-xl shadow-md font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Camera className="w-4 h-4 mr-2" /> Snap Card Photo
            </Button>

            <Button 
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoadingHistory || extracting}
              variant="outline"
              className="rounded-xl border-border/80 font-semibold"
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Choose from Gallery
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-border/60 rounded-2xl bg-muted/20 space-y-4">
          <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-border shadow-md bg-black/40">
            <img src={preview} alt="Visiting card preview" className="w-full h-full object-contain" />
            {extracting && (
              <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold font-mono tracking-wide">AI Extracting Contact Data...</p>
              </div>
            )}
          </div>

          {!extracting && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreview(null);
                setSelectedFileObj(null);
              }}
              className="rounded-xl text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retake / Choose Another Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}