import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Printer, Download, FileText, Sparkles, Building2, Copy, Send, 
  Check, RefreshCw, Layers, ShieldCheck, Mail, Phone, Globe, User,
  FileCheck, Edit3, Upload, Image as ImageIcon, Sliders
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Preset Letter Templates
const PRESETS = [
  {
    id: 'general_business',
    title: 'General Business Correspondence',
    subject: 'Official Business Communication & Operations Notice',
    salutation: 'To Whomsoever It May Concern,',
    body: `We are writing to officially confirm that Jai Bhavani Cargo Ltd has been serving enterprise clients with dedicated heavy fleet logistics, container transit, and regional distribution services across India.\n\nThis letter serves as formal notification regarding our operations and corporate authorization. Should you require any further documentation or clarification, please do not hesitate to contact our administrative office.\n\nThanking you,`,
  },
  {
    id: 'gate_pass_auth',
    title: 'Vehicle & Driver Terminal Gate Pass Authorization',
    subject: 'Authorization Letter for Plant & Yard Entry Gate Access',
    salutation: 'To The Security & Logistics Officer,',
    body: `This is to certify that truck vehicle number TS09UB8822 (32 FT Container) driven by commercial fleet driver Ramesh Kumar Rathod (Emp ID: D001, DL: TS09-2018-0098231) is officially authorized by Jai Bhavani Cargo Ltd to enter your warehouse premises for cargo loading/unloading.\n\nAll driver identity credentials, vehicle fitness certificates, and insurance policies have been duly verified and certified by our compliance team.\n\nPlease grant necessary gate pass clearance and dock access.`,
  },
  {
    id: 'client_empanelment',
    title: 'Client Empanelment & Freight Rate Proposal',
    subject: 'Empanelment Application & Contract Freight Rate Proposal',
    salutation: 'Dear Procurement Team,',
    body: `We are pleased to submit our corporate empanelment proposal for handling your long-haul heavy container freight and regional distribution requirements.\n\nJai Bhavani Cargo Ltd operates a fleet of over 45 multi-axle trailers, 32 FT containers, and open-body trucks equipped with real-time GPS tracking, automated POD uploading, and 24/7 fleet dispatch monitoring.\n\nWe look forward to executing a long-term logistics service agreement with your esteemed organization. Attached herewith are our GST, solvency, and fleet registration certificates.`,
  },
  {
    id: 'employment_cert',
    title: 'Driver / Employee Experience Certificate',
    subject: 'Service & Employment Verification Certificate',
    salutation: 'To Whomsoever It May Concern,',
    body: `This is to certify that Mr. Ramesh Kumar Rathod was employed with Jai Bhavani Cargo Ltd as a Senior Heavy Fleet Driver from April 15, 2022 to July 31, 2026.\n\nDuring his tenure with our company, he demonstrated exemplary vehicle safety discipline, punctuality in long-haul container deliveries, and professional conduct.\n\nWe wish him all the success in his future endeavors.`,
  },
  {
    id: 'no_dues_clearance',
    title: 'Freight No Dues & Payment Clearance Certificate',
    subject: 'No Outstanding Dues & Account Settlement Certificate',
    salutation: 'To Whomsoever It May Concern,',
    body: `This is to confirm that all freight charges, detention dues, and transport invoices for Trip ID JBC-TRIP-9002 (Bengaluru to Delhi NCR) have been fully received and settled in full.\n\nThere are no pending financial claims or outstanding dues between Jai Bhavani Cargo Ltd and the client as of date.`,
  }
];

export default function OfficialLetterheadPage() {
  const { currentUser } = useAuth();
  
  const [selectedPreset, setSelectedPreset] = useState('general_business');
  
  const [refNo, setRefNo] = useState(`JBC/LTR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipientName, setRecipientName] = useState('Reliance Retail Supply Chain & Logistics');
  const [recipientAddress, setRecipientAddress] = useState('Plot 12, Logistics Park, Shamshabad, Hyderabad, TG - 501218');
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [salutation, setSalutation] = useState(PRESETS[0].salutation);
  const [bodyText, setBodyText] = useState(PRESETS[0].body);
  
  const [signatoryName, setSignatoryName] = useState(currentUser?.name || 'Vinod Kumar Rathod');
  const [signatoryTitle, setSignatoryTitle] = useState('Authorized Signatory / Managing Director');
  
  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);

  // Custom Letterhead Background States
  const [customLetterheadUrl, setCustomLetterheadUrl] = useState(null);
  const [useCustomLetterhead, setUseCustomLetterhead] = useState(false);
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' | 'cover' | 'fill'
  const [topPadding, setTopPadding] = useState(140);
  const [bottomPadding, setBottomPadding] = useState(80);
  const [sidePadding, setSidePadding] = useState(45);

  const fileInputRef = useRef(null);
  const letterRef = useRef(null);

  // Load stored letterhead background if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jbc_custom_letterhead_bg');
      if (saved) {
        setCustomLetterheadUrl(saved);
        setUseCustomLetterhead(true);
      }
    } catch (e) {}
  }, []);

  const convertPdfToDataUrl = async (file) => {
    try {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('PDF conversion error:', err);
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        setCustomLetterheadUrl(result);
        setUseCustomLetterhead(true);
        try { localStorage.setItem('jbc_custom_letterhead_bg', result); } catch (e) {}
        toast.success(`Uploaded ${file.name} as custom letterhead background!`);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      toast.info('Converting PDF page to high-res letterhead background image...');
      const dataUrl = await convertPdfToDataUrl(file);
      if (dataUrl) {
        setCustomLetterheadUrl(dataUrl);
        setUseCustomLetterhead(true);
        try { localStorage.setItem('jbc_custom_letterhead_bg', dataUrl); } catch (e) {}
        toast.success(`PDF letterhead converted & set as background!`);
      } else {
        toast.error('Failed to parse PDF. Please upload a PNG or JPG image of your letterhead.');
      }
    } else {
      toast.error('Please upload an image file (PNG, JPG) or PDF');
    }
  };

  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const p = PRESETS.find(x => x.id === presetId);
    if (p) {
      setSubject(p.subject);
      setSalutation(p.salutation);
      setBodyText(p.body);
      toast.success(`Loaded template: ${p.title}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const fullText = `JAI BHAVANI CARGO\nRef: ${refNo}\nDate: ${dateStr}\n\nTo:\n${recipientName}\n${recipientAddress}\n\nSubject: ${subject}\n\n${salutation}\n\n${bodyText}\n\nFor JAI BHAVANI CARGO\n${signatoryName}\n${signatoryTitle}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Letterhead text copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <Helmet>
        <title>Official Corporate Letterhead Studio | Jai Bhavani Cargo</title>
        <meta name="description" content="Generate, edit, and print official branded letterhead documents for Jai Bhavani Cargo." />
      </Helmet>

      {/* Print Specific CSS to ensure clean A4 sheet output */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide all UI controls, sidebars, headers, mobile bars, footers */
          header, footer, nav, sidebar, aside, .no-print, [role="navigation"], div[class*="fixed"] {
            display: none !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            overflow: hidden !important;
          }
          .letterhead-sheet {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header Banner */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
          <div>
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL CORPORATE STUDIO
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Official Letterhead Generator &amp; Print Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, customize, and print official branded documents on verified Jai Bhavani Cargo letterhead.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleCopyText}
              variant="outline"
              className="rounded-2xl border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs h-10 px-4"
            >
              <Copy className="w-4 h-4 mr-2 text-blue-400" /> Copy Text
            </Button>

            <Button
              onClick={handlePrint}
              className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg h-10 px-5"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Letterhead (A4 PDF)
            </Button>
          </div>
        </div>

        {/* 2-Column Editor + Live Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: CONTROL PANEL & FORM EDITING ──────────────────────── */}
          <div className="no-print lg:col-span-5 space-y-6">
            
            {/* ── CUSTOM LETTERHEAD FILE UPLOAD CARD ──────────────────────────── */}
            <Card className="bg-slate-900/90 border-amber-500/40 rounded-3xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" /> Custom Letterhead (PDF / Image)
                  </CardTitle>
                  <Badge className={useCustomLetterhead ? "bg-amber-500 text-slate-950 font-black text-[10px]" : "bg-slate-800 text-slate-400 text-[10px]"}>
                    {useCustomLetterhead ? 'Active Background' : 'Disabled'}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Upload your pre-designed letterhead image (PNG/JPG) or PDF to print text over your exact design.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md h-10"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Letterhead File (PDF/Image)
                  </Button>

                  {customLetterheadUrl && (
                    <Button
                      onClick={() => { setCustomLetterheadUrl(null); setUseCustomLetterhead(false); try { localStorage.removeItem('jbc_custom_letterhead_bg'); } catch(e){} }}
                      variant="outline"
                      className="rounded-xl border-slate-700 text-rose-400 hover:bg-rose-500/10 h-10 px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-300 font-bold">Use Uploaded Design Background</span>
                  <Switch
                    disabled={!customLetterheadUrl}
                    checked={useCustomLetterhead}
                    onCheckedChange={setUseCustomLetterhead}
                  />
                </div>

                {/* Margin & Fit Adjustments */}
                {useCustomLetterhead && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 bg-slate-950/60 p-3 rounded-2xl border">
                    <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" /> Background Image Fit &amp; Margins
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-slate-300 text-[11px] font-bold">Image Fit Mode</Label>
                      <Select value={imageFitMode} onValueChange={setImageFitMode}>
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-white rounded-xl text-xs h-8">
                          <SelectValue placeholder="Select Fit Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="contain" className="text-xs font-semibold">Aspect Ratio Safe (No Stretch)</SelectItem>
                          <SelectItem value="cover" className="text-xs font-semibold">Full Bleed Cover</SelectItem>
                          <SelectItem value="fill" className="text-xs font-semibold">Stretch Fill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-300">
                        <span>Top Header Clear Margin:</span>
                        <span className="text-amber-400 font-bold">{topPadding}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        value={topPadding}
                        onChange={e => setTopPadding(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-300">
                        <span>Side Margins:</span>
                        <span className="text-blue-400 font-bold">{sidePadding}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={sidePadding}
                        onChange={e => setSidePadding(Number(e.target.value))}
                        className="w-full accent-blue-400 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-300">
                        <span>Bottom Footer Margin:</span>
                        <span className="text-emerald-400 font-bold">{bottomPadding}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={bottomPadding}
                        onChange={e => setBottomPadding(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Selector */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Letter Template Presets
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select a pre-formatted corporate document template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedPreset} onValueChange={handleSelectPreset}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Choose Template Preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {PRESETS.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs font-medium">
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Document Content Fields */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" /> Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-300 font-bold">Reference Number</Label>
                    <Input
                      value={refNo}
                      onChange={e => setRefNo(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-amber-300 font-mono rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 font-bold">Document Date</Label>
                    <Input
                      type="date"
                      value={dateStr}
                      onChange={e => setDateStr(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">Recipient Name / Organization</Label>
                  <Input
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="e.g. Reliance Retail Supply Chain & Logistics"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">Recipient Address</Label>
                  <Input
                    value={recipientAddress}
                    onChange={e => setRecipientAddress(e.target.value)}
                    placeholder="e.g. Plot 12, Logistics Park, Shamshabad, Hyderabad"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">Subject Line</Label>
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject of the letter..."
                    className="bg-slate-950 border-slate-800 text-amber-200 font-semibold rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">Salutation</Label>
                  <Input
                    value={salutation}
                    onChange={e => setSalutation(e.target.value)}
                    placeholder="e.g. Dear Sir / Madam,"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">Letter Body Content</Label>
                  <Textarea
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    rows={8}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <Label className="text-slate-300 font-bold">Signatory Name</Label>
                    <Input
                      value={signatoryName}
                      onChange={e => setSignatoryName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white font-bold rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 font-bold">Signatory Title</Label>
                    <Input
                      value={signatoryTitle}
                      onChange={e => setSignatoryTitle(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Display Toggles */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">Include Official Digital Stamp & Signature</span>
                    <Switch checked={includeStamp} onCheckedChange={setIncludeStamp} />
                  </div>
                  {!useCustomLetterhead && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-semibold">Include Trident Background Watermark</span>
                      <Switch checked={includeWatermark} onCheckedChange={setIncludeWatermark} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT COLUMN: REAL-TIME A4 LETTERHEAD PREVIEW SHEET ───────────── */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            <div className="no-print mb-3 text-xs font-bold text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Live A4 Letterhead Print Preview
            </div>

            {/* A4 Sheet Container */}
            <div 
              ref={letterRef}
              className="print-area letterhead-sheet bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm relative flex flex-col justify-between font-sans border border-slate-200 overflow-hidden"
              style={{
                minHeight: '297mm',
                paddingTop: useCustomLetterhead ? `${topPadding}px` : '32px',
                paddingBottom: useCustomLetterhead ? `${bottomPadding}px` : '32px',
                paddingLeft: useCustomLetterhead ? `${sidePadding}px` : '32px',
                paddingRight: useCustomLetterhead ? `${sidePadding}px` : '32px',
              }}
            >
              
              {/* Custom Uploaded Letterhead Background Layer */}
              {useCustomLetterhead && customLetterheadUrl && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  <img
                    src={customLetterheadUrl}
                    alt="Custom Letterhead Background"
                    className={`w-full h-full pointer-events-none z-0 absolute inset-0 ${
                      imageFitMode === 'contain' ? 'object-contain object-top' :
                      imageFitMode === 'cover' ? 'object-cover object-top' : 'object-fill'
                    }`}
                  />
                </div>
              )}

              {/* Trident Watermark in Center (Built-in Mode) */}
              {!useCustomLetterhead && includeWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] overflow-hidden z-0">
                  <svg className="w-[450px] h-[450px] text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 L60 30 L80 15 L70 45 L95 45 L70 60 L85 85 L50 70 L15 85 L30 60 L5 45 L30 45 L20 15 L40 30 Z" />
                  </svg>
                </div>
              )}

              {/* ── LETTERHEAD CONTENT CONTAINER (OVERLAY Z-10) ───────────────── */}
              <div className="relative z-10 flex flex-col justify-between h-full min-h-full flex-1">
                
                <div>
                  {/* Built-in Header (Rendered ONLY if Custom Letterhead is NOT used) */}
                  {!useCustomLetterhead && (
                    <div className="flex justify-between items-start border-b-4 border-[#0b3c5d] pb-4 mb-6">
                      {/* Top Left: Logo & Company Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-md font-black shrink-0">
                          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <h1 className="text-2xl font-black text-[#0b3c5d] tracking-tight uppercase leading-none font-heading">
                            JAI BHAVANI
                          </h1>
                          <div className="text-sm font-black text-amber-600 tracking-[0.25em] uppercase mt-1">
                            CARGO
                          </div>
                        </div>
                      </div>

                      {/* Top Right: Registered Office Info */}
                      <div className="text-right text-[11px] leading-snug font-sans text-slate-700">
                        <p className="font-extrabold text-slate-900">Regd. Office:</p>
                        <p>Plot no 3, Patel Nagar</p>
                        <p>Ghatkesar, 501301</p>
                        <p className="text-blue-700 font-semibold">vinod.jbcargo@gmail.com</p>
                        <p className="font-bold">+91 7794072244</p>
                        <p className="text-blue-700">www.jaibhavanicargo.com</p>
                        <p className="font-mono font-black text-slate-900 mt-0.5">GSTIN: 36DPXPR9171A1Z8</p>
                      </div>
                    </div>
                  )}

                  {/* Ref No & Date Row */}
                  <div className="flex justify-between items-center text-xs font-mono text-slate-700 font-bold border-b border-slate-200/60 pb-2 mb-4">
                    <div>
                      Ref: <span className="text-slate-900 font-black">{refNo}</span>
                    </div>
                    <div>
                      Date: <span className="text-slate-900 font-black">{format(new Date(dateStr), 'dd MMMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Recipient Block */}
                  <div className="mt-4 text-xs text-slate-800 leading-relaxed font-sans">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">To,</p>
                    <p className="font-black text-sm text-slate-900">{recipientName}</p>
                    <p className="text-slate-700 max-w-md">{recipientAddress}</p>
                  </div>

                  {/* Subject Block */}
                  {subject && (
                    <div className="mt-4 text-xs font-bold text-slate-900 bg-slate-50/90 border-l-4 border-[#0b3c5d] p-2.5">
                      <span className="uppercase text-slate-500 text-[10px] block">Subject:</span>
                      {subject}
                    </div>
                  )}

                  {/* Salutation */}
                  <div className="mt-4 text-xs font-semibold text-slate-800">
                    {salutation}
                  </div>

                  {/* Letter Body Text */}
                  <div className="mt-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {bodyText}
                  </div>
                </div>

                {/* ── LETTERHEAD FOOTER & SIGNATORY STAMP ──────────────────────────── */}
                <div className="mt-10 pt-4 border-t border-slate-200/80">
                  <div className="flex justify-between items-end">
                    {/* Left: Security Authentication Hash */}
                    <div className="text-[9.5px] font-mono text-slate-500 space-y-0.5">
                      <p className="font-bold text-slate-700">OFFICIAL CORPORATE DOCUMENT</p>
                      <p>Verified Token: {refNo.replace(/\//g, '-')}</p>
                      <p>Jai Bhavani Cargo Ltd • Logistics Fleet</p>
                    </div>

                    {/* Right: Signature Block */}
                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-slate-900 uppercase">For JAI BHAVANI CARGO</p>

                      {includeStamp && (
                        <div className="py-2 flex justify-end">
                          <div className="w-32 h-16 border-2 border-blue-800 rounded-xl p-1 bg-blue-50/80 flex flex-col items-center justify-center text-center shadow-inner relative transform -rotate-2">
                            <div className="text-[9px] font-black text-blue-900 uppercase tracking-tighter">
                              JAI BHAVANI CARGO LTD
                            </div>
                            <div className="text-[7.5px] text-blue-700 font-extrabold">★ SECUNDERABAD ★</div>
                            <div className="text-[8px] font-mono font-bold text-blue-900 border-t border-blue-300 mt-0.5 pt-0.5">
                              AUTHORIZED SIGNATORY
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <p className="text-xs font-black text-slate-900">{signatoryName}</p>
                        <p className="text-[10.5px] text-slate-600 font-semibold">{signatoryTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
