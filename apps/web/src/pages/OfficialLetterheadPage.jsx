import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Printer, Download, FileText, Sparkles, Building2, Copy, Send, 
  Check, RefreshCw, Layers, ShieldCheck, Mail, Phone, Globe, User,
  FileCheck, Edit3, Upload, Image as ImageIcon, Sliders, Save, Bookmark, Trash2, Plus, Database,
  Users, ClipboardList, ChevronRight
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SendMailDialog from '@/components/SendMailDialog.jsx';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCompanyProfile } from '@/lib/companyProfile.js';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

// Employee Agreement default template
const DEFAULT_AGREEMENT_TEMPLATE = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on {{CURRENT_DATE}}, between:

  EMPLOYER: {{COMPANY_NAME}}
  Address: {{COMPANY_ADDRESS}}

  EMPLOYEE: {{full_name}}
  Designation: {{ROLE}}
  Employment Type: {{EMPLOYMENT_TYPE}}
  Contact: {{CONTACT}}
  Address: {{ADDRESS}}
  Aadhaar No.: {{AADHAAR}}
  PAN No.: {{PAN}}

1. COMMENCEMENT OF EMPLOYMENT
   The Employee shall commence duties effective from {{JOINING_DATE}} as {{ROLE}}.

2. REMUNERATION
   The Employee shall be entitled to a gross salary of Rs. {{SALARY}}/- per month, subject to applicable deductions as per law.

3. DUTIES AND RESPONSIBILITIES
   The Employee shall diligently perform all duties assigned by the Management, comply with company policies, and maintain strict confidentiality of all proprietary and client information.

4. HOURS OF WORK
   The Employee shall work as per the company's operational requirements. For field roles, duty hours may extend beyond standard timings.

5. LEAVE POLICY
   The Employee is entitled to leaves as per the company's HR policy communicated separately.

6. TERMINATION
   Either party may terminate this agreement by providing 30 (thirty) days written notice. The company reserves the right to terminate immediately in case of gross misconduct, dishonesty, or breach of trust.

7. CONFIDENTIALITY
   The Employee shall not disclose any trade secrets, client data, freight rates, or operational information during or after employment.

8. GOVERNING LAW
   This agreement shall be governed by the laws of India and any disputes shall be subject to the jurisdiction of courts in Hyderabad, Telangana.

IN WITNESS WHEREOF, both parties have agreed and signed this agreement on the date mentioned above.


___________________________          ___________________________
{{full_name}}                        Authorized Signatory
Employee Signature                   {{COMPANY_NAME}}`;

export default function OfficialLetterheadPage({ embedMode = false }) {
  const { currentUser } = useAuth();
  const companyProfile = useCompanyProfile();
  
  const [selectedPreset, setSelectedPreset] = useState('general_business');
  
  const [refNo, setRefNo] = useState(`JBC/LTR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipientName, setRecipientName] = useState('Reliance Retail Supply Chain & Logistics');
  const [recipientAddress, setRecipientAddress] = useState('Plot 12, Logistics Park, Shamshabad, Hyderabad, TG - 501218');
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [salutation, setSalutation] = useState(PRESETS[0].salutation);
  const [bodyText, setBodyText] = useState(PRESETS[0].body);
  
  const [signatoryName, setSignatoryName] = useState(companyProfile?.signatory_name || currentUser?.name || 'Vinod Kumar Rathod');
  const [signatoryTitle, setSignatoryTitle] = useState(companyProfile?.signatory_title || 'Authorized Signatory / Managing Director');
  
  useEffect(() => {
    if (companyProfile?.signatory_name) setSignatoryName(companyProfile.signatory_name);
    if (companyProfile?.signatory_title) setSignatoryTitle(companyProfile.signatory_title);
  }, [companyProfile]);
  
  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);

  // Document mode: 'letter' | 'agreement'
  const [docMode, setDocMode] = useState('letter');

  // Employee Agreement States
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [agreementTemplate, setAgreementTemplate] = useState(DEFAULT_AGREEMENT_TEMPLATE);
  const [companySettings, setCompanySettings] = useState(null);

  // Custom Letterhead Background States
  const [customLetterheadUrl, setCustomLetterheadUrl] = useState(null);
  const [useCustomLetterhead, setUseCustomLetterhead] = useState(false);
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' | 'cover' | 'fill'
  const [topPadding, setTopPadding] = useState(140);
  const [bottomPadding, setBottomPadding] = useState(80);
  const [sidePadding, setSidePadding] = useState(45);

  // Saved Templates States
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateTitleInput, setTemplateTitleInput] = useState('');

  const fileInputRef = useRef(null);
  const letterRef = useRef(null);

  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const handleShareEmail = () => {
    let emailHtml = "";
    if (docMode === 'letter') {
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: right; font-size: 11px; color: #64748b; margin-bottom: 15px;">
            <strong>Ref No:</strong> ${refNo}<br/>
            <strong>Date:</strong> ${dateStr ? dateStr : ''}
          </div>
          
          <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.4;">
            <strong>To,</strong><br/>
            <strong>${recipientName}</strong><br/>
            <span style="color: #64748b; white-space: pre-line;">${recipientAddress}</span>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 13px;">
            <strong>Subject:</strong> <span style="text-decoration: underline; font-weight: bold;">${subject}</span>
          </div>
          
          <p style="font-size: 13px; margin-bottom: 15px;">${salutation}</p>
          <div style="font-size: 13px; line-height: 1.6; white-space: pre-line; margin-bottom: 30px;">
            ${bodyText}
          </div>
          
          <div style="margin-top: 40px; font-size: 13px;">
            <p>For <strong>JAI BHAVANI CARGO</strong></p>
            <div style="margin-top: 40px;">
              <strong>${signatoryName}</strong><br/>
              <span style="color: #64748b; font-size: 11px;">${signatoryTitle}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; background-color: #ffffff; color: #1e293b; line-height: 1.6; font-size: 13px; white-space: pre-line;">
          ${agreementTemplate}
        </div>
      `;
    }

    setMailData({
      recipient: '',
      subject: docMode === 'letter' ? `Official Letter: ${subject}` : `Employment Agreement / Contract`,
      body: `Dear recipient,\n\nPlease find our official corporate document correspondence detailed below.\n\nRegards,\nJai Bhavani Cargo Ltd`,
      html: emailHtml,
      label: docMode === 'letter' ? 'Official Letter' : 'Agreement / Contract'
    });
    setMailOpen(true);
  };

  // Load stored letterhead background & saved templates on mount
  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('jbc_custom_letterhead_bg');
      if (savedBg) {
        setCustomLetterheadUrl(savedBg);
        setUseCustomLetterhead(true);
      }
      const savedTpls = localStorage.getItem('jbc_saved_letterhead_templates');
      if (savedTpls) {
        setSavedTemplates(JSON.parse(savedTpls));
      }
    } catch (e) {}
  }, []);

  // Fetch employees and company settings for agreement mode
  useEffect(() => {
    pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false })
      .then(setEmployees).catch(() => {});
    pb.collection('company_settings').getFirstListItem('', { $autoCancel: false })
      .then(setCompanySettings).catch(() => {});
  }, []);

  // Compile agreement body by substituting employee variables
  const compileAgreement = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return agreementTemplate;
    const co = companySettings;
    let text = agreementTemplate;
    text = text.replace(/{{full_name}}/g, emp.name || 'N/A');
    text = text.replace(/{{AADHAAR}}/g, emp.aadhaar_number || 'N/A');
    text = text.replace(/{{PAN}}/g, emp.pan_card || 'N/A');
    text = text.replace(/{{CONTACT}}/g, emp.contact || 'N/A');
    text = text.replace(/{{ADDRESS}}/g, emp.address || 'N/A');
    text = text.replace(/{{ROLE}}/g, emp.employee_type || 'N/A');
    text = text.replace(/{{EMPLOYMENT_TYPE}}/g, emp.employment_type || 'N/A');
    try {
      text = text.replace(/{{JOINING_DATE}}/g, emp.joining_date ? format(new Date(emp.joining_date), 'dd MMMM yyyy') : 'N/A');
      text = text.replace(/{{CURRENT_DATE}}/g, format(new Date(), 'dd MMMM yyyy'));
    } catch { text = text.replace(/{{JOINING_DATE}}/g, emp.joining_date || 'N/A').replace(/{{CURRENT_DATE}}/g, new Date().toLocaleDateString()); }
    text = text.replace(/{{SALARY}}/g, emp.salary_amount ? Number(emp.salary_amount).toLocaleString('en-IN') : '0');
    text = text.replace(/{{COMPANY_NAME}}/g, co?.company_name || 'Jai Bhavani Cargo');
    text = text.replace(/{{COMPANY_ADDRESS}}/g, co?.company_address || '');
    return text;
  };


  const handleSaveTemplate = () => {
    if (!templateTitleInput.trim()) {
      toast.error('Please enter a template title!');
      return;
    }

    const newTpl = {
      id: `tpl_${Date.now()}`,
      title: templateTitleInput.trim(),
      dateCreated: new Date().toISOString(),
      recipientName,
      recipientAddress,
      subject,
      salutation,
      bodyText,
      signatoryName,
      signatoryTitle,
      includeStamp,
      includeWatermark,
      useCustomLetterhead,
      customLetterheadUrl,
      imageFitMode,
      topPadding,
      bottomPadding,
      sidePadding,
    };

    const updated = [newTpl, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('jbc_saved_letterhead_templates', JSON.stringify(updated));
    } catch (e) {}

    toast.success(`Template "${newTpl.title}" saved successfully!`);
    setIsSaveModalOpen(false);
    setTemplateTitleInput('');
  };

  const handleLoadSavedTemplate = (tpl) => {
    if (tpl.recipientName !== undefined) setRecipientName(tpl.recipientName);
    if (tpl.recipientAddress !== undefined) setRecipientAddress(tpl.recipientAddress);
    if (tpl.subject !== undefined) setSubject(tpl.subject);
    if (tpl.salutation !== undefined) setSalutation(tpl.salutation);
    if (tpl.bodyText !== undefined) setBodyText(tpl.bodyText);
    if (tpl.signatoryName !== undefined) setSignatoryName(tpl.signatoryName);
    if (tpl.signatoryTitle !== undefined) setSignatoryTitle(tpl.signatoryTitle);
    if (tpl.includeStamp !== undefined) setIncludeStamp(tpl.includeStamp);
    if (tpl.includeWatermark !== undefined) setIncludeWatermark(tpl.includeWatermark);
    if (tpl.useCustomLetterhead !== undefined) setUseCustomLetterhead(tpl.useCustomLetterhead);
    if (tpl.customLetterheadUrl !== undefined) setCustomLetterheadUrl(tpl.customLetterheadUrl);
    if (tpl.imageFitMode !== undefined) setImageFitMode(tpl.imageFitMode);
    if (tpl.topPadding !== undefined) setTopPadding(tpl.topPadding);
    if (tpl.bottomPadding !== undefined) setBottomPadding(tpl.bottomPadding);
    if (tpl.sidePadding !== undefined) setSidePadding(tpl.sidePadding);

    toast.success(`Loaded template: "${tpl.title}"`);
  };

  const handleDeleteSavedTemplate = (tplId, title) => {
    const updated = savedTemplates.filter(t => t.id !== tplId);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('jbc_saved_letterhead_templates', JSON.stringify(updated));
    } catch (e) {}
    toast.success(`Deleted template "${title}"`);
  };

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
    <div className={"min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans " + (embedMode ? "min-h-0 bg-transparent p-0 pb-12" : "")}>
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

      <div className={"max-w-7xl mx-auto space-y-4 " + (embedMode ? "space-y-3" : "")}>
        
        {/* Page Header Banner */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 px-5 rounded-2xl shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
            <h1 className="text-base font-black tracking-tight text-white">
              {embedMode ? "Letterhead Studio" : "Letterhead Studio"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 font-bold text-[11px] h-8 px-3"
            >
              <Link to="/data-backup">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Backup</span>
              </Link>
            </Button>

            <Button
              onClick={() => setIsSaveModalOpen(true)}
              variant="outline"
              className="rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-300 font-bold text-[11px] h-8 px-3 hover:bg-amber-500/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </Button>

            <Button
              onClick={handleCopyText}
              variant="outline"
              className="rounded-xl border-slate-800 bg-slate-950 text-slate-300 font-bold text-[11px] h-8 px-3 hover:bg-slate-900"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>Copy Text</span>
            </Button>

            <Button
              onClick={handleShareEmail}
              variant="outline"
              className="rounded-xl border-slate-800 bg-slate-950 text-slate-300 font-bold text-[11px] h-8 px-3 hover:bg-slate-900 gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Share via Email</span>
            </Button>

            <Button
              onClick={handlePrint}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm h-8 px-4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 PDF</span>
            </Button>
          </div>
        </div>

        {/* 2-Column Editor + Live Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: CONTROL PANEL & FORM EDITING ──────────────────────── */}
          <div className="no-print lg:col-span-5 space-y-6">

            {/* ── DOCUMENT MODE SWITCHER ──────────────────────────────────────── */}
            <Card className="bg-slate-900/90 border-slate-700 rounded-3xl shadow-xl overflow-hidden">
              <CardContent className="p-1.5">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setDocMode('letter')}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                      docMode === 'letter'
                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Official Letter / Certificate
                  </button>
                  <button
                    onClick={() => setDocMode('agreement')}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                      docMode === 'agreement'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Employee Agreement
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* ── UNIFIED CONTROL TABS CARD ──────────────────────────────────── */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="bg-slate-950 p-1.5 flex h-auto rounded-t-3xl border-b border-slate-800 gap-1.5">
                  <TabsTrigger value="content" className="flex-1 gap-1.5 py-2 rounded-xl text-xs font-black data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Content
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex-1 gap-1.5 py-2 rounded-xl text-xs font-black data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                    <Sliders className="w-3.5 h-3.5" /> Branding &amp; Design
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex-1 gap-1.5 py-2 rounded-xl text-xs font-black data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                    <Bookmark className="w-3.5 h-3.5" /> Templates
                  </TabsTrigger>
                </TabsList>

                {/* ── TAB CONTENT: DOCUMENT WRITING ─────────────────────────────── */}
                <TabsContent value="content" className="p-5 space-y-4 m-0">
                  {docMode === 'agreement' ? (
                    <div className="space-y-4">
                      {/* Employee Selector */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 font-bold text-xs">Select Employee</Label>
                        <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                          <SelectTrigger className="rounded-xl bg-slate-950 border-slate-800 text-slate-100 h-9.5 text-xs">
                            <SelectValue placeholder="Choose employee..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            {employees.length === 0 && (
                              <SelectItem value="__none" disabled>No employees found</SelectItem>
                            )}
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id} className="text-xs">
                                {emp.name} · {emp.employee_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selected Employee Info Preview */}
                      {selectedEmpId && (() => {
                        const emp = employees.find(e => e.id === selectedEmpId);
                        if (!emp) return null;
                        return (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 space-y-2 text-xs">
                            <p className="font-black text-blue-300 uppercase tracking-wider text-[10px]">Employee Data Filled</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
                              <span className="text-slate-500 font-semibold">Name</span><span className="font-bold">{emp.name || '—'}</span>
                              <span className="text-slate-500 font-semibold">Role</span><span>{emp.employee_type || '—'}</span>
                              <span className="text-slate-500 font-semibold">Type</span><span>{emp.employment_type || '—'}</span>
                              <span className="text-slate-500 font-semibold">Joining</span><span>{emp.joining_date ? format(new Date(emp.joining_date), 'dd MMM yyyy') : '—'}</span>
                              <span className="text-slate-500 font-semibold">Salary</span><span className="text-emerald-400 font-bold">₹{emp.salary_amount ? Number(emp.salary_amount).toLocaleString('en-IN') : '—'}</span>
                              <span className="text-slate-500 font-semibold">Contact</span><span>{emp.contact || '—'}</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Agreement Template Editor */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label className="text-slate-300 font-bold text-xs">Agreement Template Body</Label>
                          <button
                            onClick={() => setAgreementTemplate(DEFAULT_AGREEMENT_TEMPLATE)}
                            className="text-[10px] text-amber-400 font-bold hover:underline"
                          >
                            ↺ Reset to Default
                          </button>
                        </div>
                        <textarea
                          className="w-full h-[280px] p-3 text-[11px] bg-slate-950 border border-slate-800 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200 leading-relaxed resize-none"
                          value={agreementTemplate}
                          onChange={e => setAgreementTemplate(e.target.value)}
                          spellCheck={false}
                        />
                      </div>

                      {/* Variables Guide */}
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Template Variables</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-blue-400">
                          <span>{"{{full_name}}"}</span>
                          <span>{"{{AADHAAR}}"}</span>
                          <span>{"{{PAN}}"}</span>
                          <span>{"{{CONTACT}}"}</span>
                          <span>{"{{ROLE}}"}</span>
                          <span>{"{{SALARY}}"}</span>
                          <span>{"{{JOINING_DATE}}"}</span>
                          <span>{"{{COMPANY_NAME}}"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-slate-300 font-bold">Reference Number</Label>
                          <Input
                            value={refNo}
                            onChange={e => setRefNo(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-amber-300 font-mono rounded-xl h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-slate-300 font-bold">Document Date</Label>
                          <Input
                            type="date"
                            value={dateStr}
                            onChange={e => setDateStr(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-300 font-bold">Recipient Name / Organization</Label>
                        <Input
                          value={recipientName}
                          onChange={e => setRecipientName(e.target.value)}
                          placeholder="e.g. Reliance Retail Supply Chain"
                          className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-300 font-bold">Recipient Address</Label>
                        <Input
                          value={recipientAddress}
                          onChange={e => setRecipientAddress(e.target.value)}
                          placeholder="e.g. Plot 12, Logistics Park, Hyderabad"
                          className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-300 font-bold">Subject Line</Label>
                        <Input
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="Subject of the letter..."
                          className="bg-slate-950 border-slate-800 text-amber-200 font-semibold rounded-xl h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-300 font-bold">Salutation</Label>
                        <Input
                          value={salutation}
                          onChange={e => setSalutation(e.target.value)}
                          placeholder="e.g. Dear Sir / Madam,"
                          className="bg-slate-950 border-slate-800 text-white rounded-xl h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-300 font-bold">Letter Body Content</Label>
                        <Textarea
                          value={bodyText}
                          onChange={e => setBodyText(e.target.value)}
                          rows={6}
                          className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs leading-relaxed font-sans resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                        <div className="space-y-1">
                          <Label className="text-slate-300 font-bold">Signatory Name</Label>
                          <Input
                            value={signatoryName}
                            onChange={e => setSignatoryName(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white font-bold rounded-xl h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-slate-300 font-bold">Signatory Title</Label>
                          <Input
                            value={signatoryTitle}
                            onChange={e => setSignatoryTitle(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-300 rounded-xl h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── TAB CONTENT: BRANDING & DESIGN ────────────────────────────── */}
                <TabsContent value="design" className="p-5 space-y-4 m-0 text-xs">
                  {/* File Upload Box */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <p className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload Custom Design Background
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Upload your corporate pre-designed letterhead background image (PNG/JPG) or PDF to print text over it.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-[11px] h-8.5 shadow-sm"
                      >
                        Choose File
                      </Button>
                      {customLetterheadUrl && (
                        <Button
                          type="button"
                          onClick={() => { setCustomLetterheadUrl(null); setUseCustomLetterhead(false); try { localStorage.removeItem('jbc_custom_letterhead_bg'); } catch(e){} }}
                          variant="outline"
                          className="rounded-xl border-slate-800 text-rose-400 hover:bg-rose-500/10 h-8.5 px-3"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {customLetterheadUrl && (
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                        <span className="text-slate-300 font-bold text-[11px]">Use Uploaded Design Background</span>
                        <Switch
                          checked={useCustomLetterhead}
                          onCheckedChange={setUseCustomLetterhead}
                        />
                      </div>
                    )}
                  </div>

                  {/* Margins & fit sliders */}
                  {useCustomLetterhead && (
                    <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5" /> Layout Clear Margins
                      </p>
                      
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 text-[11px] font-bold">Image Fit Mode</Label>
                        <Select value={imageFitMode} onValueChange={setImageFitMode}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-8">
                            <SelectValue placeholder="Select Fit" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="contain" className="text-xs">Safe (No Stretch)</SelectItem>
                            <SelectItem value="cover" className="text-xs">Full Bleed Cover</SelectItem>
                            <SelectItem value="fill" className="text-xs">Stretch Fill</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Top Padding:</span>
                          <span className="text-amber-300 font-bold">{topPadding}px</span>
                        </div>
                        <input
                          type="range" min="20" max="300" value={topPadding}
                          onChange={e => setTopPadding(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer h-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Side Padding:</span>
                          <span className="text-blue-400 font-bold">{sidePadding}px</span>
                        </div>
                        <input
                          type="range" min="10" max="120" value={sidePadding}
                          onChange={e => setSidePadding(Number(e.target.value))}
                          className="w-full accent-blue-400 cursor-pointer h-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Bottom Padding:</span>
                          <span className="text-emerald-400 font-bold">{bottomPadding}px</span>
                        </div>
                        <input
                          type="range" min="20" max="200" value={bottomPadding}
                          onChange={e => setBottomPadding(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer h-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Built-in Brand Elements switches */}
                  <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Letterhead Elements</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 font-bold">Include Digital Signature</span>
                      <Switch checked={includeSignature} onCheckedChange={setIncludeSignature} />
                    </div>
                    {!useCustomLetterhead && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-bold">Include Central Watermark Logo</span>
                        <Switch checked={includeWatermark} onCheckedChange={setIncludeWatermark} />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── TAB CONTENT: PRESETS & SAVED TEMPLATES ────────────────────── */}
                <TabsContent value="templates" className="p-5 space-y-4 m-0 text-xs">
                  {/* Preset Templates Selector */}
                  {docMode === 'letter' && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-bold text-xs">Letter Presets</Label>
                      <Select value={selectedPreset} onValueChange={handleSelectPreset}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-9.5">
                          <SelectValue placeholder="Choose Preset Template" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {PRESETS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-semibold">
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Saved Templates List */}
                  {docMode === 'letter' && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-bold text-xs flex items-center justify-between">
                        <span>My Saved Templates ({savedTemplates.length})</span>
                      </Label>
                      {savedTemplates.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                          No saved templates. Click "Save Template" in the header to save current parameters.
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                          {savedTemplates.map((tpl) => (
                            <div
                              key={tpl.id}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all group"
                            >
                              <button
                                onClick={() => handleLoadSavedTemplate(tpl)}
                                className="flex-1 text-left"
                              >
                                <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                                  {tpl.title}
                                </div>
                                <div className="text-[9.5px] text-slate-500 truncate max-w-[200px]">
                                  {tpl.subject || 'No subject'}
                                </div>
                              </button>

                              <Button
                                onClick={(e) => { e.stopPropagation(); handleDeleteSavedTemplate(tpl.id, tpl.title); }}
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
                        {companyProfile?.company_logo ? (
                          <img src={companyProfile.company_logo} alt="Company Logo" className="w-14 h-14 object-contain rounded-xl shadow-md shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-md font-black shrink-0">
                            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h1 className="text-2xl font-black text-[#0b3c5d] tracking-tight uppercase leading-none font-heading">
                            {companyProfile?.company_name || 'JAI BHAVANI CARGO'}
                          </h1>
                        </div>
                      </div>

                      {/* Top Right: Registered Office Info */}
                      <div className="text-right text-[11px] leading-snug font-sans text-slate-700">
                        <p className="font-extrabold text-slate-900">Regd. Office:</p>
                        <p className="max-w-[200px]">{companyProfile?.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301'}</p>
                        <p className="text-blue-700 font-semibold">{companyProfile?.company_email || 'vinod@jaibhavanicargo.com'}</p>
                        <p className="font-bold">{companyProfile?.company_phone || '+91 7794072244'}</p>
                        <p className="text-blue-700">{companyProfile?.company_website || 'www.jaibhavanicargo.com'}</p>
                        <p className="font-mono font-black text-slate-900 mt-0.5">GSTIN: {companyProfile?.company_gstin || '36DPXPR9171A1Z8'}</p>
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

                  {docMode === 'agreement' ? (
                    /* ── EMPLOYEE AGREEMENT BODY ── */
                    <div className="mt-4 text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                      {compileAgreement()}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      {includeSignature && companyProfile?.e_signature ? (
                        <div className="h-20 flex items-center justify-end select-none">
                          <img src={companyProfile.e_signature} className="max-h-20 object-contain mix-blend-multiply filter brightness-95" alt="Signature" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <p className="text-xs font-black text-slate-900 uppercase font-sans">For JAI BHAVANI CARGO</p>
                          <div className="h-14" />
                          <div className="pt-1">
                            <p className="text-xs font-black text-slate-900">{signatoryName}</p>
                            <p className="text-[10.5px] text-slate-600 font-semibold">{signatoryTitle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

          </div>

        </div>

      </div>

      {/* Save Letterhead Template Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-amber-500/40 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" /> Save Letterhead Template
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Save your current document text, recipient details, margins, and custom background image settings for 1-click loading anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold">Template Title *</Label>
              <Input
                required
                value={templateTitleInput}
                onChange={e => setTemplateTitleInput(e.target.value)}
                placeholder="e.g. Reliance Contract Offer Letter"
                className="bg-slate-900 border-slate-800 text-white rounded-xl font-bold"
              />
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1 text-[11px] text-slate-400">
              <p className="font-bold text-slate-300">Template Snapshot Preview:</p>
              <p>• Subject: <span className="text-amber-300 font-semibold">{subject || 'None'}</span></p>
              <p>• Recipient: <span className="text-white font-semibold">{recipientName || 'None'}</span></p>
              <p>• Custom Letterhead: <span className="text-emerald-400 font-semibold">{useCustomLetterhead ? 'Active' : 'Built-in Template'}</span></p>
              <p>• Top Margin: <span className="text-blue-300 font-semibold">{topPadding}px</span></p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSaveModalOpen(false)}
              className="rounded-xl border-slate-700 text-slate-300 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTemplate}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  </div>
  );
}
