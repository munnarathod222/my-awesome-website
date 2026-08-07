import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CreditCard, Upload, Share2, Printer, Download, Copy, Check, RefreshCw, 
  Sparkles, Building2, Phone, Mail, Globe, MapPin, User, Image as ImageIcon,
  Sliders, ShieldCheck, QrCode, Trash2, CheckCircle2, MessageSquare, ExternalLink,
  Users, Truck, Award, Palette, Layers, FileText, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCompanyProfile } from '@/lib/companyProfile.js';
import { getEmployeePhotoUrl } from '@/lib/photoUtils.js';
import SendMailDialog from '@/components/SendMailDialog.jsx';

const PRESET_THEMES = [
  {
    id: 'gold_luxury',
    name: 'Royal Dark Gold',
    tag: 'Executive & Director (Featured)',
    bgFront: 'from-slate-950 via-slate-900 to-amber-950/40',
    bgBack: 'from-amber-950/40 via-slate-900 to-slate-950',
    border: 'border-amber-500/50',
    textPrimary: 'text-amber-400',
    textSecondary: 'text-amber-200/80',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    accentColor: '#f59e0b',
  },
  {
    id: 'corporate_blue',
    name: 'Corporate Executive Blue',
    tag: 'Enterprise & Fleet Manager',
    bgFront: 'from-slate-950 via-blue-950/40 to-slate-900',
    bgBack: 'from-blue-950/40 via-slate-900 to-slate-950',
    border: 'border-blue-500/50',
    textPrimary: 'text-blue-400',
    textSecondary: 'text-blue-200/80',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    accentColor: '#3b82f6',
  },
  {
    id: 'heavy_red',
    name: 'Heavy Transport Red',
    tag: 'Long-Haul Fleet & Operations',
    bgFront: 'from-slate-950 via-rose-950/40 to-slate-900',
    bgBack: 'from-rose-950/40 via-slate-900 to-slate-950',
    border: 'border-rose-500/50',
    textPrimary: 'text-rose-400',
    textSecondary: 'text-rose-200/80',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    accentColor: '#f43f5e',
  },
  {
    id: 'cyber_emerald',
    name: 'Cyber Emerald Tech',
    tag: 'Modern Logistics & GPS',
    bgFront: 'from-slate-950 via-emerald-950/40 to-slate-900',
    bgBack: 'from-emerald-950/40 via-slate-900 to-slate-950',
    border: 'border-emerald-500/50',
    textPrimary: 'text-emerald-400',
    textSecondary: 'text-emerald-200/80',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    accentColor: '#10b981',
  },
  {
    id: 'custom_upload',
    name: 'Custom Template Image',
    tag: 'User Uploaded Background',
    bgFront: 'from-slate-950 to-slate-900',
    bgBack: 'from-slate-900 to-slate-950',
    border: 'border-slate-700',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-700',
    accentColor: '#e2e8f0',
  }
];

export default function BusinessCardStudioPage({ embedMode = false }) {
  const { currentUser } = useAuth();
  const companyProfile = useCompanyProfile();
  const [employees, setEmployees] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('gold_luxury');
  const [activeSide, setActiveSide] = useState('front');
  const [copied, setCopied] = useState(false);
  const [customFrontBg, setCustomFrontBg] = useState(null);
  const [customBackBg, setCustomBackBg] = useState(null);

  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const handleShareEmail = () => {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #d2b48c; border-radius: 16px; background-color: #0f172a; color: #f8fafc; padding: 24px;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #fbbf24; font-size: 18px; font-weight: 800;">${cardData.companyName}</h2>
          <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">${cardData.companyTagline}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 800;">${cardData.fullName}</h3>
          <p style="margin: 2px 0 0 0; color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase;">${cardData.designation}</p>
          <span style="color: #64748b; font-size: 9px; font-family: monospace;">Emp Code: ${cardData.empCode}</span>
        </div>

        <table style="width: 100%; font-size: 11px; margin-bottom: 15px; color: #cbd5e1;">
          <tr>
            <td style="width: 30%; color: #94a3b8; padding: 4px 0;">Phone:</td>
            <td style="color: #ffffff; font-family: monospace;">${cardData.phone1} ${cardData.phone2 ? `/ ${cardData.phone2}` : ''}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Email:</td>
            <td style="color: #fbbf24; font-family: monospace;">${cardData.email}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Website:</td>
            <td style="color: #3b82f6; font-family: monospace;">${cardData.website}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0; vertical-align: top;">Address:</td>
            <td style="color: #ffffff; line-height: 1.4;">${cardData.address}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0; vertical-align: top;">Services:</td>
            <td style="color: #94a3b8; font-style: italic; line-height: 1.4;">${cardData.services}</td>
          </tr>
        </table>
        
        <div style="border-top: 1px solid #334155; padding-top: 12px; font-size: 8.5px; color: #64748b; text-align: center;">
          <span>GSTIN: ${cardData.gstNo} | ${cardData.isoBadge}</span>
        </div>
      </div>
    `;

    setMailData({
      recipient: '',
      subject: `Business Visiting Card - ${cardData.fullName} | ${cardData.companyName}`,
      body: `Dear Recipient,\n\nPlease find my official digital business card credentials detailed below.\n\nRegards,\n${cardData.fullName}`,
      html: htmlContent,
      label: `Visiting Card – ${cardData.fullName}`
    });
    setMailOpen(true);
  };

  // Business Card Form State initialized dynamically from Company Profile
  const [cardData, setCardData] = useState({
    companyName: companyProfile?.company_name || 'JAI BHAVANI CARGO',
    companyTagline: 'Heavy Fleet & All India Freight Logistics',
    gstNo: companyProfile?.company_gstin || '36AAAAA0000A1Z5',
    isoBadge: 'ISO 9001:2015 Certified Logistics Operator',
    
    fullName: currentUser?.name || companyProfile?.signatory_name || 'Vinod kumar Rathod',
    designation: companyProfile?.signatory_title || 'Managing Director',
    empCode: 'JBC-MD-001',
    phone1: companyProfile?.company_phone || '+91 7794072244',
    phone2: '+91 9666973085',
    email: companyProfile?.company_email || 'munnarathod222@gmail.com',
    website: companyProfile?.company_website || 'www.jaibhavanicargo.com',
    address: companyProfile?.company_address || 'Plot No. 12, Transport Nagar, Secunderabad - 500009',
    services: '32 FT Container Transit • Heavy Flatbed Trailers • 24/7 GPS Tracking • Cold Chain Logistics',
    photoUrl: '',
    logoUrl: companyProfile?.company_logo || '/favicon.ico',
  });

  useEffect(() => {
    if (companyProfile) {
      setCardData(prev => ({
        ...prev,
        companyName: companyProfile.company_name || prev.companyName,
        gstNo: companyProfile.company_gstin || prev.gstNo,
        phone1: companyProfile.company_phone || prev.phone1,
        email: companyProfile.company_email || prev.email,
        website: companyProfile.company_website || prev.website,
        address: companyProfile.company_address || prev.address,
        logoUrl: companyProfile.company_logo || prev.logoUrl,
      }));
    }
  }, [companyProfile]);

  const frontFileInputRef = useRef(null);
  const backFileInputRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
    loadSavedTemplates();
  }, []);

  const fetchEmployees = async () => {
    try {
      const records = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false }).catch(() => []);
      setEmployees(records);
    } catch (e) {}
  };

  const loadSavedTemplates = () => {
    try {
      const savedFront = localStorage.getItem('jbc_card_template_front');
      const savedBack = localStorage.getItem('jbc_card_template_back');
      if (savedFront) setCustomFrontBg(savedFront);
      if (savedBack) setCustomBackBg(savedBack);
    } catch (e) {}
  };

  // Pre-fill fields when selecting an employee from directory
  const handleSelectEmployee = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setCardData(prev => ({
      ...prev,
      fullName: emp.name || prev.fullName,
      designation: emp.employee_type === 'driver' ? 'Senior Fleet Driver' : (emp.employee_type || 'Executive Staff'),
      empCode: emp.employee_number || emp.id || prev.empCode,
      phone1: emp.contact || prev.phone1,
      phone2: emp.emergency_contact || prev.phone2,
      email: emp.email || prev.email,
      photoUrl: emp.photo ? getEmployeePhotoUrl(emp) : prev.photoUrl,
    }));
    toast.success(`Visiting Card details updated for ${emp.name}!`);
  };

  // Handle Custom Template Uploads (Front / Back)
  const handleUploadTemplate = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Template image size must be under 10MB.');
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target.result;
      if (side === 'front') {
        setCustomFrontBg(result);
        localStorage.setItem('jbc_card_template_front', result);
        toast.success('Front template background uploaded!');
      } else {
        setCustomBackBg(result);
        localStorage.setItem('jbc_card_template_back', result);
        toast.success('Back template background uploaded!');
      }
      setSelectedTheme('custom_upload');
    };
    reader.readAsDataURL(file);
  };

  const handleClearTemplate = (side) => {
    if (side === 'front') {
      setCustomFrontBg(null);
      localStorage.removeItem('jbc_card_template_front');
    } else {
      setCustomBackBg(null);
      localStorage.removeItem('jbc_card_template_back');
    }
    toast.info(`Custom ${side} template cleared.`);
  };

  // 1-Click WhatsApp Share
  const handleWhatsAppShare = () => {
    const message = `🎴 *BUSINESS / VISITING CARD - ${cardData.companyName}*\n\n` +
      `👤 *${cardData.fullName}* (${cardData.designation})\n` +
      `🏢 *${cardData.companyName}*\n` +
      `📞 *Phone:* ${cardData.phone1}\n` +
      `💬 *WhatsApp:* ${cardData.phone2 || cardData.phone1}\n` +
      `✉️ *Email:* ${cardData.email}\n` +
      `🌐 *Website:* https://${cardData.website.replace(/^https?:\/\//, '')}\n` +
      `📍 *Address:* ${cardData.address}\n\n` +
      `🚛 *Services:* ${cardData.services}\n\n` +
      `✨ _ISO Certified Heavy Fleet & Freight Logistics_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    toast.success('Opening WhatsApp share window...');
  };

  // Copy Info
  const handleCopyDetails = () => {
    const fullText = `${cardData.companyName}\n${cardData.fullName} - ${cardData.designation}\nPhone: ${cardData.phone1} / ${cardData.phone2}\nEmail: ${cardData.email}\nWeb: ${cardData.website}\nAddress: ${cardData.address}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Visiting card details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  const themeObj = PRESET_THEMES.find(t => t.id === selectedTheme) || PRESET_THEMES[0];

  return (
    <div className={"min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans pb-24 " + (embedMode ? "min-h-0 bg-transparent p-0 pb-12" : "")}>
      <Helmet>
        <title>Visiting &amp; Business Card Studio | Jai Bhavani Cargo</title>
        <meta name="description" content="Design, upload custom templates, and share branded visiting cards on WhatsApp for Jai Bhavani Cargo." />
      </Helmet>

      {/* Print Specific CSS for standard Business Card size (3.5in x 2in) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          header, footer, nav, sidebar, aside, .no-print, [role="navigation"] {
            display: none !important;
          }
          .print-card-container {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .business-card-sheet {
            width: 3.5in !important;
            height: 2in !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className={"max-w-7xl mx-auto space-y-6 " + (embedMode ? "space-y-4" : "")}>
        
        {/* Banner Header */}
        <div className={"no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md " + (embedMode ? "p-3 px-5 rounded-2xl gap-3" : "")}>
          {!embedMode && (
            <div>
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" /> VISITING &amp; BUSINESS CARD STUDIO
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Digital &amp; Printable Business Card Designer
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Upload custom background templates, auto-fill employee profiles, and share branded cards instantly on WhatsApp.
              </p>
            </div>
          )}
          {embedMode && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
              <h1 className="text-base font-black tracking-tight text-white">
                Business Card Studio
              </h1>
            </div>
          )}

          <div className={"flex flex-wrap items-center gap-3 " + (embedMode ? "gap-2" : "")}>
            <Button
              onClick={handleWhatsAppShare}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 shadow-lg shadow-emerald-950/50"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Share on WhatsApp
            </Button>

            <Button
              onClick={handleShareEmail}
              className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-4 shadow-lg shadow-blue-950/50"
            >
              <Mail className="w-4 h-4 mr-2" /> Share via Email
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="rounded-2xl border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 font-bold text-xs h-10 px-4"
            >
              <Printer className="w-4 h-4 mr-2 text-amber-400" /> Print / Save PDF
            </Button>

            <Button
              onClick={handleCopyDetails}
              variant="outline"
              className="rounded-2xl border-slate-700 bg-slate-950 text-slate-300 font-bold text-xs h-10 px-4"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2 text-blue-400" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
          </div>
        </div>

        {/* Main Grid: Controls vs Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (6 cols): Controls & Customization */}
          <div className="no-print lg:col-span-6 space-y-6">
            
            {/* Template Selector & Upload Box */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" /> 1. Select Theme or Upload Custom Template
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Choose a designer enterprise preset or upload your custom background template image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Theme Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        selectedTheme === theme.id 
                          ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-950/40 ring-1 ring-amber-500' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-extrabold text-white">{theme.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{theme.tag}</div>
                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Template Upload Section */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-400" /> Upload Custom Background Template Image
                    </Label>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      PNG / JPEG (Max 10MB)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Front Template Upload */}
                    <div className="space-y-2">
                      <Label className="text-[11px] text-slate-400">Front Side Background</Label>
                      <input 
                        type="file" 
                        ref={frontFileInputRef}
                        onChange={(e) => handleUploadTemplate(e, 'front')}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          variant="outline"
                          className="w-full text-xs rounded-xl border-slate-700 bg-slate-900 text-slate-200 h-9"
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                          {customFrontBg ? 'Replace Front' : 'Upload Front'}
                        </Button>
                        {customFrontBg && (
                          <Button
                            type="button"
                            onClick={() => handleClearTemplate('front')}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-rose-400 hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Back Template Upload */}
                    <div className="space-y-2">
                      <Label className="text-[11px] text-slate-400">Back Side Background</Label>
                      <input 
                        type="file" 
                        ref={backFileInputRef}
                        onChange={(e) => handleUploadTemplate(e, 'back')}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          variant="outline"
                          className="w-full text-xs rounded-xl border-slate-700 bg-slate-900 text-slate-200 h-9"
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                          {customBackBg ? 'Replace Back' : 'Upload Back'}
                        </Button>
                        {customBackBg && (
                          <Button
                            type="button"
                            onClick={() => handleClearTemplate('back')}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-rose-400 hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields Section */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-400" /> 2. Fill Details or Select Employee
                  </CardTitle>

                  {/* Employee Directory Auto-Fill Dropdown */}
                  {employees.length > 0 && (
                    <div className="w-48">
                      <Select onValueChange={handleSelectEmployee}>
                        <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 rounded-xl text-amber-300">
                          <SelectValue placeholder="Auto-Fill Employee..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id} className="text-xs">
                              {emp.name} ({emp.employee_type || 'Staff'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Person Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Full Name *</Label>
                    <Input 
                      value={cardData.fullName}
                      onChange={(e) => setCardData({...cardData, fullName: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                      placeholder="e.g. Munna Rathod"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Designation / Title *</Label>
                    <Input 
                      value={cardData.designation}
                      onChange={(e) => setCardData({...cardData, designation: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                      placeholder="e.g. Managing Director"
                    />
                  </div>
                </div>

                {/* Company & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Company Name</Label>
                    <Input 
                      value={cardData.companyName}
                      onChange={(e) => setCardData({...cardData, companyName: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">GSTIN / Reg No</Label>
                    <Input 
                      value={cardData.gstNo}
                      onChange={(e) => setCardData({...cardData, gstNo: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Primary Phone</Label>
                    <Input 
                      value={cardData.phone1}
                      onChange={(e) => setCardData({...cardData, phone1: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">WhatsApp / Secondary Phone</Label>
                    <Input 
                      value={cardData.phone2}
                      onChange={(e) => setCardData({...cardData, phone2: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Email & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Email Address</Label>
                    <Input 
                      value={cardData.email}
                      onChange={(e) => setCardData({...cardData, email: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Website URL</Label>
                    <Input 
                      value={cardData.website}
                      onChange={(e) => setCardData({...cardData, website: e.target.value})}
                      className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Office / Hub Address</Label>
                  <Input 
                    value={cardData.address}
                    onChange={(e) => setCardData({...cardData, address: e.target.value})}
                    className="bg-slate-950 border-slate-800 h-9 text-xs text-white"
                  />
                </div>

                {/* Services List (Back Side) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Services Offered (Card Back Side)</Label>
                  <Textarea 
                    value={cardData.services}
                    onChange={(e) => setCardData({...cardData, services: e.target.value})}
                    rows={2}
                    className="bg-slate-950 border-slate-800 text-xs text-white resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (6 cols): Live Card Canvas Preview */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="no-print pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" /> Live Interactive Preview
                  </CardTitle>
                  
                  {/* Side Switch Tabs */}
                  <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => setActiveSide('front')}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                        activeSide === 'front' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Front View
                    </button>
                    <button
                      onClick={() => setActiveSide('back')}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                        activeSide === 'back' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Back View
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[380px]">
                
                {/* Print Container */}
                <div className="print-card-container w-full flex flex-col items-center justify-center gap-6">
                  
                  {/* CARD FRONT SIDE */}
                  {(activeSide === 'front' || typeof window !== 'undefined') && (
                    <div 
                      className={`business-card-sheet relative w-full max-w-[440px] aspect-[1.75/1] rounded-3xl border ${themeObj.border} bg-gradient-to-br ${themeObj.bgFront} p-6 shadow-2xl overflow-hidden flex flex-col justify-between transition-all ${
                        activeSide === 'back' ? 'hidden print:flex' : 'flex'
                      }`}
                      style={customFrontBg ? { backgroundImage: `url(${customFrontBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    >
                      {/* Decorative Background Elements */}
                      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

                      {/* Card Header: Company Logo & ISO Badge */}
                      <div className="flex items-start justify-between gap-2 z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-base shadow-md">
                            JB
                          </div>
                          <div>
                            <div className="text-base font-black tracking-tight text-white uppercase leading-none">
                              {cardData.companyName}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {cardData.companyTagline}
                            </div>
                          </div>
                        </div>

                        {/* ISO Badge */}
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${themeObj.badgeBg}`}>
                            {cardData.isoBadge ? 'ISO CERTIFIED' : 'FLEET OPERATOR'}
                          </span>
                        </div>
                      </div>

                      {/* Card Center: Full Name & Designation */}
                      <div className="my-auto py-2 z-10">
                        <h2 className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                          {cardData.fullName || 'Name Here'}
                        </h2>
                        <div className={`text-xs font-bold uppercase tracking-wider ${themeObj.textPrimary} mt-0.5`}>
                          {cardData.designation || 'Designation'}
                        </div>
                        {cardData.gstNo && (
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            GSTIN: {cardData.gstNo}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Phone, Email, Website & Address */}
                      <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-slate-300 z-10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="font-semibold text-white">{cardData.phone1}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">{cardData.email}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="font-bold text-white truncate">{cardData.website}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{cardData.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD BACK SIDE */}
                  {(activeSide === 'back' || typeof window !== 'undefined') && (
                    <div 
                      className={`business-card-sheet relative w-full max-w-[440px] aspect-[1.75/1] rounded-3xl border ${themeObj.border} bg-gradient-to-br ${themeObj.bgBack} p-6 shadow-2xl overflow-hidden flex flex-col justify-between transition-all ${
                        activeSide === 'front' ? 'hidden print:flex' : 'flex'
                      }`}
                      style={customBackBg ? { backgroundImage: `url(${customBackBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    >
                      {/* Decorative Background */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />

                      {/* Back Header */}
                      <div className="flex items-center justify-between z-10">
                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-400" /> OUR FREIGHT &amp; LOGISTICS SERVICES
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                          24/7 FLEET MONITORING
                        </div>
                      </div>

                      {/* Services List */}
                      <div className="my-auto py-2 z-10">
                        <div className="text-xs font-medium text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-white/10">
                          {cardData.services || 'Container Transit • Heavy Trailers • GPS Tracking'}
                        </div>
                      </div>

                      {/* Back Footer: QR Code & Company Address */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-[10px] text-slate-400 z-10">
                        <div className="space-y-0.5">
                          <div className="font-bold text-white">{cardData.companyName}</div>
                          <div className="text-[9px] text-slate-400 line-clamp-1">{cardData.address}</div>
                        </div>

                        {/* Digital QR Code Placeholder */}
                        <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-md">
                          <QrCode className="w-8 h-8 text-slate-950" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* WhatsApp Direct Share Button beneath Preview */}
                <div className="no-print mt-6 w-full max-w-[440px] flex items-center gap-3">
                  <Button
                    onClick={handleWhatsAppShare}
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 shadow-lg shadow-emerald-950/50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Share Business Card on WhatsApp Now
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
      <SendMailDialog
        isOpen={mailOpen}
        onOpenChange={setMailOpen}
        defaultRecipient={mailData.recipient}
        defaultSubject={mailData.subject}
        defaultBody={mailData.body}
        richHtmlContent={mailData.html}
        contextLabel={mailData.label}
        defaultAttachment={mailData.attachment}
      />
    </div>
  );
}
