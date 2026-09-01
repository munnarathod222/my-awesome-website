import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Building2, FileText, UploadCloud, Share2, Copy, Download, 
  ExternalLink, Trash2, CreditCard, Search, Filter, CheckCircle2, Calendar, 
  FileSpreadsheet, Plus, Eye, Sparkles, RefreshCw, FileCheck, Lock, X, 
  ArrowUpRight, Info, Check, HelpCircle, FilePlus, MapPin, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import SendMailDialog from '@/components/SendMailDialog.jsx';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';

const CATEGORIES = [
  'All',
  'Registration & Identity',
  'Tax Returns (ITR)',
  'Tax Returns (GST)',
  'Financials & Banking',
  'Loans & Legal',
  'Other'
];

const SUB_CATEGORIES = {
  'Registration & Identity': ['GST Registration Certificate', 'PAN Card', 'Certificate of Incorporation (COI)', 'MSME / Udyam Certificate', 'Shop & Establishment License', 'Trademark / ISO Certificate', 'Other License'],
  'Tax Returns (ITR)': ['ITR-V (Acknowledgement)', 'Computation Sheet', 'Tax Audit Report (Form 3CD)', 'Advance Tax Receipt', 'Self Assessment Tax Challan'],
  'Tax Returns (GST)': ['GSTR-1 Monthly Return', 'GSTR-3B Summary Return', 'GSTR-9 Annual Return', 'GST Payment Challan', 'GSTR-2B Recon Sheet'],
  'Financials & Banking': ['Audited Balance Sheet', 'Profit & Loss Statement', 'Bank Statement (6-12 Months)', 'Cancelled Cheque / Bank Letter', 'Net Worth Certificate', 'Form 26AS / AIS Statement'],
  'Loans & Legal': ['Sanction Letter', 'Loan Account Statement', 'Lease / Rental Agreement', 'Director / Partner Identity Proof', 'Board Resolution'],
  'Other': ['General Document', 'Client Contract', 'Insurance Policy']
};

const FINANCIAL_YEARS = [
  'N/A',
  'FY 2026-27',
  'FY 2025-26',
  'FY 2024-25',
  'FY 2023-24',
  'FY 2022-23',
  'FY 2021-22'
];

export default function CompanyVaultPage() {
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    id: 'companysettings',
    company_name: 'JAI BHAVANI CARGO',
    company_gstin: '36DPXPR9171A1Z8',
    pan_number: '',
    tan_number: '',
    cin_number: '',
    msme_number: '',
    udyam_number: '',
    company_address: 'Plot no 3, Patel nagar, Ghatkesar, pin: 501301',
    company_phone: '+91 7794072244',
    company_email: 'vinod@jaibhavanicargo.com',
    company_website: 'www.jaibhavanicargo.com',
    bank_name: 'HDFC BANK',
    account_name: 'JAI BHAVANI CARGO',
    account_number: '50200117182677',
    ifsc_code: 'HDFC0004480',
    branch_name: 'GHATKESAR BRANCH',
    company_docs_json: '[]'
  });

  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFY, setSelectedFY] = useState('All');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const triggerEmailVault = () => {
    const docRows = documents.slice(0, 15).map(d => `<tr><td style="padding:5px 0;font-size:12px;color:#64748b">${d.category || '—'}</td><td style="padding:5px 0;font-size:12px;color:#1e293b">${d.title || '—'}</td><td style="padding:5px 0;font-size:12px;color:#6366f1">${d.financial_year || '—'}</td></tr>`).join('');
    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px"><p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p><h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">Company Document Vault Index</h2><p style="color:#64748b;font-size:12px;margin:6px 0 0">${documents.length} documents stored</p></div><div style="padding:20px 24px;background:#f8fafc"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">CATEGORY</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">DOCUMENT</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">FY</th></tr></thead><tbody>${docRows}</tbody></table>${documents.length > 15 ? `<p style="font-size:11px;color:#94a3b8;margin-top:10px">+ ${documents.length - 15} more documents</p>` : ''}<p style="margin-top:14px;font-size:11px;color:#94a3b8">Company: ${companyInfo.company_name} | GSTIN: ${companyInfo.company_gstin}</p></div></div>`;
    setMailData({ recipient: '', subject: 'Company Vault Document Index – Jai Bhavani Cargo', body: 'Please find the company document vault index below.', html, label: 'Vault Document Index' });
    setMailOpen(true);
  };

  // Upload Form state
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    category: 'Tax Returns (ITR)',
    sub_category: 'ITR-V (Acknowledgement)',
    financial_year: 'FY 2024-25',
    notes: '',
    file_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Company Details Edit state
  const [editCompanyData, setEditCompanyData] = useState({ ...companyInfo });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      let record;
      try {
        record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
      } catch (e) {
        const list = await pb.collection('company_settings').getList(1, 1, { $autoCancel: false });
        if (list.items?.length > 0) record = list.items[0];
      }

      if (record) {
        setCompanyInfo({
          id: record.id,
          company_name: record.company_name || 'JAI BHAVANI CARGO',
          company_gstin: record.company_gstin || '36DPXPR9171A1Z8',
          pan_number: record.pan_number || '',
          tan_number: record.tan_number || '',
          cin_number: record.cin_number || '',
          msme_number: record.msme_number || '',
          udyam_number: record.udyam_number || '',
          company_address: record.company_address || '',
          company_phone: record.company_phone || '',
          company_email: record.company_email || '',
          company_website: record.company_website || '',
          bank_name: record.bank_name || '',
          account_name: record.account_name || '',
          account_number: record.account_number || '',
          ifsc_code: record.ifsc_code || '',
          branch_name: record.branch_name || '',
          company_docs_json: record.company_docs_json || '[]'
        });

        try {
          const docs = JSON.parse(record.company_docs_json || '[]');
          setDocuments(Array.isArray(docs) ? docs : []);
        } catch {
          setDocuments([]);
        }
      }
    } catch (err) {
      console.error('Error loading company data:', err);
      toast.error('Failed to load company vault details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyDetails = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const payload = { ...editCompanyData };
      await pb.collection('company_settings').update(companyInfo.id, payload, { $autoCancel: false });
      setCompanyInfo({ ...editCompanyData });
      toast.success('Company profile & tax details updated successfully!');
      setIsEditCompanyModalOpen(false);
    } catch (err) {
      console.error('Error saving company details:', err);
      toast.error('Failed to update company settings');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleOpenUploadModal = (presetCategory = 'Tax Returns (ITR)', presetSub = 'ITR-V (Acknowledgement)') => {
    setUploadFormData({
      title: '',
      category: presetCategory,
      sub_category: presetSub,
      financial_year: presetCategory.includes('ITR') ? 'FY 2024-25' : 'N/A',
      notes: '',
      file_url: ''
    });
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFormData.title.trim()) return toast.error('Document title is required');
    if (!selectedFile && !uploadFormData.file_url.trim()) {
      return toast.error('Please upload a file or provide a valid file URL');
    }

    setUploadingDoc(true);
    try {
      let finalFileUrl = uploadFormData.file_url.trim();
      let fileName = selectedFile ? selectedFile.name : (finalFileUrl ? 'External Link' : 'Document');
      let fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A';

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);
        fileData.append('truck_id', 'COMPANY_VAULT');
        fileData.append('document_type', 'Other');
        fileData.append('document_name', uploadFormData.title.trim());
        fileData.append('notes', `Company Vault: ${uploadFormData.title} (${uploadFormData.category})`);
        fileData.append('status', 'Active');
        fileData.append('expiry_date', '2099-12-31T00:00:00.000Z');

        // Upload to PocketBase truck_documents storage bucket for permanent file hosting
        const uploadedRec = await pb.collection('truck_documents').create(fileData, { $autoCancel: false });
        finalFileUrl = pb.files.getUrl(uploadedRec, uploadedRec.file);
      }

      const newDoc = {
        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: uploadFormData.title.trim(),
        category: uploadFormData.category,
        sub_category: uploadFormData.sub_category || 'General',
        financial_year: uploadFormData.financial_year || 'N/A',
        file_url: finalFileUrl,
        file_name: fileName,
        file_size: fileSize,
        notes: uploadFormData.notes.trim(),
        created_at: new Date().toISOString()
      };

      const updatedDocs = [newDoc, ...documents];
      const updatedDocsJson = JSON.stringify(updatedDocs);

      await pb.collection('company_settings').update(companyInfo.id, { company_docs_json: updatedDocsJson }, { $autoCancel: false });

      setDocuments(updatedDocs);
      setCompanyInfo(prev => ({ ...prev, company_docs_json: updatedDocsJson }));
      toast.success(`"${newDoc.title}" uploaded to Company Vault!`);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error('Error uploading vault document:', err);
      const detail = err?.data?.message || err?.message || 'Failed to upload document to vault';
      toast.error(`Upload error: ${detail}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${docTitle}" from Company Vault?`)) return;

    try {
      const updatedDocs = documents.filter(d => d.id !== docId);
      const updatedDocsJson = JSON.stringify(updatedDocs);

      await pb.collection('company_settings').update(companyInfo.id, { company_docs_json: updatedDocsJson }, { $autoCancel: false });
      setDocuments(updatedDocs);
      setCompanyInfo(prev => ({ ...prev, company_docs_json: updatedDocsJson }));
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return documents.filter(doc => {
      if (!doc) return false;
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesFY = selectedFY === 'All' || doc.financial_year === selectedFY;
      const docTitle = (doc.title || doc.file_name || 'Document').toLowerCase();
      const docSub = (doc.sub_category || '').toLowerCase();
      const docNotes = (doc.notes || '').toLowerCase();
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search || docTitle.includes(search) || docSub.includes(search) || docNotes.includes(search);
      return matchesCategory && matchesFY && matchesSearch;
    });
  }, [documents, selectedCategory, selectedFY, searchQuery]);

  // Document Counts
  const stats = useMemo(() => {
    if (!Array.isArray(documents)) return { total: 0, itr: 0, gst: 0, reg: 0, fin: 0 };
    const total = documents.length;
    const itr = documents.filter(d => d && d.category === 'Tax Returns (ITR)').length;
    const gst = documents.filter(d => d && d.category === 'Tax Returns (GST)').length;
    const reg = documents.filter(d => d && d.category === 'Registration & Identity').length;
    const fin = documents.filter(d => d && d.category === 'Financials & Banking').length;
    return { total, itr, gst, reg, fin };
  }, [documents]);

  // Formatted Dossier Text for One-Click Share
  const dossierShareText = useMemo(() => {
    let txt = `🏢 *${companyInfo.company_name || 'JAI BHAVANI CARGO'} - OFFICIAL COMPANY DOSSIER*\n`;
    txt += `--------------------------------------------------\n`;
    txt += `📍 *Registered Address*: ${companyInfo.company_address || 'N/A'}\n`;
    txt += `📧 *Email*: ${companyInfo.company_email || 'N/A'} | 📞 *Phone*: ${companyInfo.company_phone || 'N/A'}\n\n`;

    txt += `📌 *REGISTRATION & TAX IDENTIFIER NUMBERS*:\n`;
    txt += `• GSTIN: ${companyInfo.company_gstin || 'N/A'}\n`;
    txt += `• PAN Number: ${companyInfo.pan_number || 'N/A'}\n`;
    txt += `• TAN Number: ${companyInfo.tan_number || 'N/A'}\n`;
    txt += `• CIN / Reg No: ${companyInfo.cin_number || 'N/A'}\n`;
    txt += `• MSME / Udyam: ${companyInfo.udyam_number || companyInfo.msme_number || 'N/A'}\n\n`;

    txt += `🏦 *BANK ACCOUNT DETAILS (FOR PAYMENTS & LOANS)*:\n`;
    txt += `• Bank Name: ${companyInfo.bank_name || 'HDFC BANK'}\n`;
    txt += `• Account Name: ${companyInfo.account_name || companyInfo.company_name}\n`;
    txt += `• Account Number: ${companyInfo.account_number || 'N/A'}\n`;
    txt += `• IFSC Code: ${companyInfo.ifsc_code || 'N/A'}\n`;
    txt += `• Branch: ${companyInfo.branch_name || 'N/A'}\n\n`;

    txt += `📁 *COMPANY VAULT DOCUMENTS (${documents.length} ATTACHED)*:\n`;

    if (documents.length === 0) {
      txt += `(No files attached yet in Vault)\n`;
    } else {
      documents.forEach((doc, idx) => {
        txt += `${idx + 1}. [${doc.category}] ${doc.title} ${doc.financial_year !== 'N/A' ? `(${doc.financial_year})` : ''}\n`;
        if (doc.file_url) {
          txt += `   🔗 File Download: ${doc.file_url}\n`;
        }
      });
    }

    txt += `\n--------------------------------------------------\n`;
    txt += `Generated via Jai Bhavani Cargo Corporate Vault System.`;
    return txt;
  }, [companyInfo, documents]);

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(dossierShareText);
    toast.success('Company Dossier details & download links copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(dossierShareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleShareEmail = () => {
    const formattedHtml = `<div style="font-family: monospace; white-space: pre-wrap; font-size: 13px; color: #1e293b; line-height: 1.5; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">${dossierShareText}</div>`;
    setMailData({
      recipient: companyInfo.company_email || '',
      subject: `Company Dossier Credentials - Jai Bhavani Cargo`,
      body: `Dear Team,\n\nPlease find the Jai Bhavani Cargo official company dossier and active documents attached below.\n\nRegards,\nVinod kumar Rathod`,
      html: formattedHtml,
      label: `Company Vault Dossier`
    });
    setMailOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header & Action Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/60 backdrop-blur p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Company Document Vault
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono">
                  🔒 Secure Corporate Hub
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Centralized vault for loan applications, bank compliance, ITR returns & GST filings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            className="h-10 border-primary/30 text-primary hover:bg-primary/10 font-medium"
            onClick={() => {
              setEditCompanyData({ ...companyInfo });
              setIsEditCompanyModalOpen(true);
            }}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Edit Company Info & Tax IDs
          </Button>

          <Button 
            variant="secondary"
            size="sm"
            className="h-10 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 font-semibold"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            ⚡ 1-Click Share Company Dossier
          </Button>

          <Button 
            size="sm"
            variant="outline"
            className="h-10 font-semibold text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
            onClick={triggerEmailVault}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Vault Index
          </Button>

          <Button 
            size="sm"
            className="h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            onClick={() => handleOpenUploadModal()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            + Upload Vault Document
          </Button>
        </div>
      </div>

      {/* ── Quick Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Vault Files</p>
              <h3 className="text-2xl font-bold font-mono text-foreground">{stats.total}</h3>
            </div>
            <FileText className="w-7 h-7 text-primary/70" />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">ITR Returns</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400">{stats.itr}</h3>
            </div>
            <FileCheck className="w-7 h-7 text-emerald-400/70" />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">GST Returns</p>
              <h3 className="text-2xl font-bold font-mono text-cyan-400">{stats.gst}</h3>
            </div>
            <FileSpreadsheet className="w-7 h-7 text-cyan-400/70" />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Certificates & PAN</p>
              <h3 className="text-2xl font-bold font-mono text-purple-400">{stats.reg}</h3>
            </div>
            <Building2 className="w-7 h-7 text-purple-400/70" />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80 col-span-2 md:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Audited & Bank Docs</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400">{stats.fin}</h3>
            </div>
            <CreditCard className="w-7 h-7 text-amber-400/70" />
          </CardContent>
        </Card>
      </div>

      {/* ── Company Tax & Banking Info Overview Card ──────────── */}
      <Card className="bg-card/60 border-border/80">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                {companyInfo.company_name} - Tax & Banking Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Official business identifiers ready for instant loan & client compliance.
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEditCompanyData({ ...companyInfo });
                setIsEditCompanyModalOpen(true);
              }}
            >
              Edit Identifiers ✏️
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">GSTIN Number</span>
            <p className="font-mono font-bold text-foreground text-sm flex items-center gap-1">
              {companyInfo.company_gstin || 'Not Provided'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground">PAN Number</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {companyInfo.pan_number || 'ABCDE1234F (Sample)'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground">TAN / CIN Number</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {companyInfo.tan_number || companyInfo.cin_number || 'Not Provided'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground">MSME / Udyam Reg</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {companyInfo.udyam_number || companyInfo.msme_number || 'Not Provided'}
            </p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-muted-foreground">Registered Address</span>
            <p className="font-medium text-foreground truncate">
              {companyInfo.company_address || 'Plot no 3, Patel nagar, Ghatkesar'}
            </p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-muted-foreground">Primary Bank Account</span>
            <p className="font-mono font-semibold text-foreground truncate">
              {companyInfo.bank_name} - A/C: {companyInfo.account_number} (IFSC: {companyInfo.ifsc_code})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Fast Upload Shortcut Banner (ITR & GST Focus) ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => handleOpenUploadModal('Tax Returns (ITR)', 'ITR-V (Acknowledgement)')}
          className="p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                ⚡ Quick Action
              </span>
              <h4 className="font-bold text-foreground text-sm group-hover:text-emerald-400 transition-colors">
                Upload ITR Return
              </h4>
              <p className="text-xs text-muted-foreground">
                Upload ITR-V, Computation Sheet, or Form 3CD Audit Report.
              </p>
            </div>
            <FilePlus className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => handleOpenUploadModal('Tax Returns (GST)', 'GSTR-3B Summary Return')}
          className="p-4 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-full">
                ⚡ Quick Action
              </span>
              <h4 className="font-bold text-foreground text-sm group-hover:text-cyan-400 transition-colors">
                Upload GST Return
              </h4>
              <p className="text-xs text-muted-foreground">
                Upload Monthly GSTR-1, GSTR-3B, or Annual GSTR-9 filing.
              </p>
            </div>
            <FileSpreadsheet className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => handleOpenUploadModal('Registration & Identity', 'GST Registration Certificate')}
          className="p-4 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 rounded-2xl cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-full">
                ⚡ Quick Action
              </span>
              <h4 className="font-bold text-foreground text-sm group-hover:text-purple-400 transition-colors">
                Upload Registration Certificate
              </h4>
              <p className="text-xs text-muted-foreground">
                Upload GST Cert, PAN, COI, MSME / Udyam, or Trade License.
              </p>
            </div>
            <Building2 className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* ── Document Search & Filtering Controls ──────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/40 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search by document title, category, or period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-44">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background/80 h-10 text-xs">
                <SelectValue placeholder="Category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Select value={selectedFY} onValueChange={setSelectedFY}>
              <SelectTrigger className="bg-background/80 h-10 text-xs">
                <SelectValue placeholder="Financial Year..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All FYs</SelectItem>
                {FINANCIAL_YEARS.filter(y => y !== 'N/A').map(fy => (
                  <SelectItem key={fy} value={fy} className="text-xs">{fy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Vault Documents Main Grid ──────────────────────────── */}
      {filteredDocuments.length === 0 ? (
        <Card className="bg-card/40 border-dashed border-2 border-border p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No documents found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'No vault documents match your current filter query.' 
                  : 'Start uploading your company registration certificates, ITR returns, and GST filings.'}
              </p>
            </div>
            <Button size="sm" onClick={() => handleOpenUploadModal()}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isITR = doc.category === 'Tax Returns (ITR)';
            const isGST = doc.category === 'Tax Returns (GST)';
            const isReg = doc.category === 'Registration & Identity';

            return (
              <Card 
                key={doc.id}
                className="bg-card/60 border-border/80 hover:border-primary/40 transition-all duration-200 group relative flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${
                          isITR ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          isGST ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          isReg ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {doc.category}
                        </Badge>
                        {doc.financial_year && doc.financial_year !== 'N/A' && (
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {doc.financial_year}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Type: {doc.sub_category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg line-clamp-2 italic">
                      "{doc.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span>Uploaded: {doc.created_at ? format(new Date(doc.created_at), 'dd MMM yyyy') : 'Recently'}</span>
                    <span className="font-mono">{doc.file_size || 'File'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {doc.file_url ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View / Preview
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                        No Link
                      </Button>
                    )}

                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="h-8 text-xs font-medium"
                      onClick={() => {
                        if (doc.file_url) {
                          navigator.clipboard.writeText(doc.file_url);
                          toast.success(`Direct link for "${doc.title}" copied!`);
                        } else {
                          toast.error('No URL available to copy');
                        }
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: Upload Document Modal ────────────────────── */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              Upload Company Vault Document
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUploadDocument} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Document Title *</Label>
              <Input 
                type="text"
                placeholder="e.g. ITR-V Acknowledgement FY 2024-25, GST Certificate"
                value={uploadFormData.title}
                onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                className="bg-background h-10 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Category *</Label>
                <Select 
                  value={uploadFormData.category} 
                  onValueChange={(v) => {
                    const subs = SUB_CATEGORIES[v] || [];
                    setUploadFormData({ 
                      ...uploadFormData, 
                      category: v, 
                      sub_category: subs[0] || 'General' 
                    });
                  }}
                >
                  <SelectTrigger className="bg-background h-10 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Sub-Type / Filing Type</Label>
                <Select 
                  value={uploadFormData.sub_category} 
                  onValueChange={(v) => setUploadFormData({ ...uploadFormData, sub_category: v })}
                >
                  <SelectTrigger className="bg-background h-10 text-xs">
                    <SelectValue placeholder="Select Sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(SUB_CATEGORIES[uploadFormData.category] || ['General']).map(sub => (
                      <SelectItem key={sub} value={sub} className="text-xs">{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Financial Year / Filing Period</Label>
              <Select 
                value={uploadFormData.financial_year} 
                onValueChange={(v) => setUploadFormData({ ...uploadFormData, financial_year: v })}
              >
                <SelectTrigger className="bg-background h-10 text-xs">
                  <SelectValue placeholder="Select Financial Year" />
                </SelectTrigger>
                <SelectContent>
                  {FINANCIAL_YEARS.map(fy => (
                    <SelectItem key={fy} value={fy} className="text-xs">{fy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select File (PDF, Image, Excel, Zip) *</Label>
              <Input 
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="bg-background text-xs cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                Supports PDF, PNG, JPG, XLSX, ZIP documents up to 50MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Or Provide Direct File URL (Optional)</Label>
              <Input 
                type="url"
                placeholder="https://drive.google.com/... or https://..."
                value={uploadFormData.file_url}
                onChange={(e) => setUploadFormData({ ...uploadFormData, file_url: e.target.value })}
                className="bg-background h-10 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Notes / Filing Reference (Optional)</Label>
              <Textarea 
                placeholder="e.g. Filed on 28th July 2026, ACK No: 123456789"
                value={uploadFormData.notes}
                onChange={(e) => setUploadFormData({ ...uploadFormData, notes: e.target.value })}
                className="bg-background text-xs resize-none"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadingDoc} className="font-bold">
                {uploadingDoc ? 'Uploading to Vault...' : 'Save & Store in Vault'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: ⚡ One-Click Share Dossier Modal ────────────── */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-400" />
              One-Click Company Dossier Share
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Share complete company identity, tax registrations, bank accounts, and direct download links for all vault documents in a single click.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="visual" className="flex-1 overflow-hidden flex flex-col pt-3">
            <TabsList className="bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0 w-fit">
              <TabsTrigger value="visual" className="rounded-lg text-xs font-bold px-3 py-1.5">
                📋 Visual Preview
              </TabsTrigger>
              <TabsTrigger value="raw" className="rounded-lg text-xs font-bold px-3 py-1.5">
                💬 WhatsApp Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1 scrollbar-none">
              
              {/* Company Info Box */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white">{companyInfo.company_name}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    Verified Dossier
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {companyInfo.company_address}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 border-t border-slate-800/60">
                  <span>📧 {companyInfo.company_email}</span>
                  <span>📞 {companyInfo.company_phone}</span>
                </div>
              </div>

              {/* Tax & Registration Identifiers */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Tax & Registration Identifiers
                </h4>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">GSTIN</div>
                      <div className="font-mono font-bold text-white mt-0.5">{companyInfo.company_gstin || 'N/A'}</div>
                    </div>
                    {companyInfo.company_gstin && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(companyInfo.company_gstin); toast.success('GSTIN Copied'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">PAN NUMBER</div>
                      <div className="font-mono font-bold text-white mt-0.5">{companyInfo.pan_number || 'N/A'}</div>
                    </div>
                    {companyInfo.pan_number && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(companyInfo.pan_number); toast.success('PAN Copied'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-mono">TAN NUMBER</div>
                    <div className="font-mono font-bold text-slate-300 mt-0.5">{companyInfo.tan_number || 'N/A'}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-mono">MSME / UDYAM</div>
                    <div className="font-mono font-bold text-slate-300 mt-0.5">{companyInfo.udyam_number || companyInfo.msme_number || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Bank Account Details (For Payments & Loans)
                </h4>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">BANK NAME</div>
                    <div className="font-bold text-white mt-0.5">{companyInfo.bank_name || 'HDFC BANK'}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">ACCOUNT NAME</div>
                    <div className="font-bold text-white mt-0.5 truncate">{companyInfo.account_name || companyInfo.company_name}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500">ACCOUNT NUMBER</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{companyInfo.account_number || 'N/A'}</div>
                    </div>
                    {companyInfo.account_number && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(companyInfo.account_number); toast.success('Account Number Copied'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500">IFSC CODE</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{companyInfo.ifsc_code || 'N/A'}</div>
                    </div>
                    {companyInfo.ifsc_code && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(companyInfo.ifsc_code); toast.success('IFSC Code Copied'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Attached Vault Documents */}
              {documents.length > 0 && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Attached Vault Documents ({documents.length})
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    {documents.slice(0, 5).map(d => (
                      <div key={d.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="font-bold text-white">{d.title}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{d.category}</span>
                        </div>
                        {d.file_url && (
                          <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs shrink-0 font-bold flex items-center gap-1">
                            Download <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </TabsContent>

            <TabsContent value="raw" className="flex-1 overflow-hidden pt-3 flex flex-col">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-y-auto flex-1 select-all">
                {dossierShareText}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800 shrink-0">
            <Button 
              className="w-full sm:flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              onClick={handleShareWhatsApp}
            >
              <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
            </Button>

            <Button 
              className="w-full sm:flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 border-none"
              onClick={handleShareEmail}
            >
              <Mail className="w-4 h-4 mr-2" /> Share via Email
            </Button>

            <Button 
              variant="outline"
              className="w-full sm:flex-1 h-11 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border-slate-700"
              onClick={handleCopyDossier}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Full Dossier Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: Edit Company Tax & Identifiers Modal ──────── */}
      <Dialog open={isEditCompanyModalOpen} onOpenChange={setIsEditCompanyModalOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Edit Company Profile & Tax Identifiers
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCompanyDetails} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Company Legal Name</Label>
                <Input 
                  value={editCompanyData.company_name}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, company_name: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">GSTIN Number</Label>
                <Input 
                  value={editCompanyData.company_gstin}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, company_gstin: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">PAN Number</Label>
                <Input 
                  value={editCompanyData.pan_number}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, pan_number: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                  placeholder="e.g. ABCDE1234F"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">TAN Number</Label>
                <Input 
                  value={editCompanyData.tan_number}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, tan_number: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                  placeholder="e.g. HYDJ12345F"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">CIN / LLPIN / Reg No</Label>
                <Input 
                  value={editCompanyData.cin_number}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, cin_number: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                  placeholder="e.g. U60200TG2020PTC145000"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">MSME / Udyam Reg No</Label>
                <Input 
                  value={editCompanyData.udyam_number}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, udyam_number: e.target.value, msme_number: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                  placeholder="e.g. UDYAM-TS-02-0012345"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Registered Address</Label>
                <Input 
                  value={editCompanyData.company_address}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, company_address: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bank Name</Label>
                <Input 
                  value={editCompanyData.bank_name}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, bank_name: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Account Number</Label>
                <Input 
                  value={editCompanyData.account_number}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, account_number: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">IFSC Code</Label>
                <Input 
                  value={editCompanyData.ifsc_code}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, ifsc_code: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Branch Name</Label>
                <Input 
                  value={editCompanyData.branch_name}
                  onChange={(e) => setEditCompanyData({ ...editCompanyData, branch_name: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditCompanyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCompany} className="font-bold">
                {savingCompany ? 'Saving...' : 'Save Identifiers'}
              </Button>
            </DialogFooter>
          </form>
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
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
}
