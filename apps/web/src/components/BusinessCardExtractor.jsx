import React, { useState, useEffect, useRef } from 'react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai.jsx';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function BusinessCardExtractor({ onExtractionComplete, onError }) {
  const { messages, isStreaming, isLoadingHistory, sendMessage } = useIntegratedAi();
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
            onExtractionComplete(parsed);
          } else {
            onError("Could not parse extracted data from the image.");
          }
        } catch (e) {
          onError("Error parsing AI response: " + e.message);
        }
      }
    }
  }, [isStreaming, messages, extracting, onExtractionComplete, onError]);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setExtracting(true);
    
    const prompt = `You are a business card analysis expert. Carefully analyze the provided business card image and extract ONLY the information that is clearly visible on the card. Do NOT guess, hallucinate, or infer information that is not explicitly shown. Extract the following fields if visible: name (person's full name), phone (contact phone number), email (email address), company (company/organization name), job_title (designation/position), address (office/business address), website (company website). For any field not visible on the card, return an empty string. Return the response as a valid JSON object with these exact field names. Be precise and accurate. Example format: {"name": "John Doe", "phone": "+1-555-0123", "email": "john@company.com", "company": "ABC Corp", "job_title": "Sales Manager", "address": "123 Business St, City", "website": "www.abccorp.com"}`;
    
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
    <div className="w-full space-y-4 animate-in fade-in">
      {!preview ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40",
            isLoadingHistory && "opacity-50 pointer-events-none"
          )}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            disabled={isLoadingHistory || extracting}
          />
          
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            {isLoadingHistory ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isLoadingHistory ? "Connecting to AI..." : "Upload Business Card"}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-[250px] mb-6">
            Drag and drop your image here, or click to browse files
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoadingHistory || extracting}
            variant="secondary"
          >
            Select Image
          </Button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/10">
          <div className="aspect-[16/9] w-full relative">
            <img 
              src={preview} 
              alt="Business card preview" 
              className="w-full h-full object-contain bg-black/5"
            />
            {extracting && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground">AI is extracting details...</p>
                <p className="text-xs text-muted-foreground mt-1">This takes just a moment</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}