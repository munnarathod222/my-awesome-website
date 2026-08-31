import React, { useState, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  MessageSquare, Share2, Copy, Send, CheckCircle2, Phone, Building2, 
  ExternalLink, FileText, Download, ShieldCheck, Loader2, Sparkles, User
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function CompanyVaultWhatsAppShareModal({ 
  isOpen, 
  onClose, 
  companyInfo = {}, 
  document = null, 
  allDocuments = [],
  selectedDocIds = null
}) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState(document ? 'single' : 'dossier');

  // Sync mode if document changes
  React.useEffect(() => {
    if (document) {
      setMode('single');
    } else {
      setMode('dossier');
    }
  }, [document, isOpen]);

  // Documents to include in dossier share
  const activeDocs = useMemo(() => {
    if (!Array.isArray(allDocuments)) return [];
    if (!selectedDocIds) return allDocuments;
    return allDocuments.filter(d => selectedDocIds.has(d.id));
  }, [allDocuments, selectedDocIds]);

  // 1. Generate text for single document
  const singleDocText = useMemo(() => {
    if (!document) return '';
    const name = recipientName.trim() || 'Sir / Madam';
    const compName = companyInfo.company_name || 'JAI BHAVANI CARGO';
    const gstin = companyInfo.company_gstin || '36DPXPR9171A1Z8';
    
    let txt = `🏢 *${compName} - OFFICIAL DOCUMENT SHARE*\n\n`;
    txt += `Dear *${name}*,\n\n`;
    txt += `Please find the official company document from our corporate vault:\n\n`;
    txt += `📄 *Document:* ${document.title}\n`;
    txt += `📂 *Category:* ${document.category} ${document.sub_category ? `(${document.sub_category})` : ''}\n`;
    if (document.financial_year && document.financial_year !== 'N/A') {
      txt += `📅 *Filing Period:* ${document.financial_year}\n`;
    }
    txt += `🏛️ *Company:* ${compName}\n`;
    txt += `🆔 *GSTIN:* ${gstin}\n`;
    
    if (document.file_url) {
      txt += `\n🔗 *Direct Download / View Link:*\n${document.file_url}\n`;
    }
    
    if (customNote.trim()) {
      txt += `\n📝 *Note:* ${customNote.trim()}\n`;
    }
    
    txt += `\n📞 For verification or inquiries: ${companyInfo.company_phone || '+91 7794072244'}\n`;
    txt += `🌐 ${companyInfo.company_website || 'www.jaibhavanicargo.com'}`;
    return txt;
  }, [document, recipientName, companyInfo, customNote]);

  // 2. Generate text for full company dossier
  const dossierText = useMemo(() => {
    const name = recipientName.trim() || 'Sir / Madam';
    const compName = companyInfo.company_name || 'JAI BHAVANI CARGO';
    
    let txt = `🏢 *${compName} - CORPORATE DOSSIER & COMPLIANCE VAULT*\n\n`;
    txt += `Dear *${name}*,\n\n`;
    txt += `Please find the official corporate profile, tax registrations, banking coordinates, and compliance documents for *${compName}* below:\n\n`;
    
    txt += `📋 *COMPANY IDENTIFICATION & TAXES*\n`;
    txt += `• Company Name: ${compName}\n`;
    txt += `• GSTIN: ${companyInfo.company_gstin || '36DPXPR9171A1Z8'}\n`;
    if (companyInfo.pan_number) txt += `• PAN: ${companyInfo.pan_number}\n`;
    if (companyInfo.tan_number) txt += `• TAN: ${companyInfo.tan_number}\n`;
    if (companyInfo.msme_number || companyInfo.udyam_number) txt += `• MSME/Udyam: ${companyInfo.msme_number || companyInfo.udyam_number}\n`;
    txt += `• Registered Address: ${companyInfo.company_address || 'Plot no 3, Patel nagar, Ghatkesar, pin: 501301'}\n\n`;

    txt += `🏦 *OFFICIAL BANKING COORDINATES*\n`;
    txt += `• Bank Name: ${companyInfo.bank_name || 'HDFC BANK'}\n`;
    txt += `• Account Name: ${companyInfo.account_name || 'JAI BHAVANI CARGO'}\n`;
    txt += `• Account No: ${companyInfo.account_number || '50200117182677'}\n`;
    txt += `• IFSC Code: ${companyInfo.ifsc_code || 'HDFC0004480'}\n`;
    txt += `• Branch: ${companyInfo.branch_name || 'GHATKESAR BRANCH'}\n\n`;

    if (activeDocs.length > 0) {
      txt += `📂 *VERIFIED VAULT DOCUMENTS (${activeDocs.length} ATTACHMENTS)*\n`;
      activeDocs.forEach((d, idx) => {
        txt += `${idx + 1}. *${d.title}* (${d.category})\n`;
        if (d.file_url) {
          txt += `   🔗 Link: ${d.file_url}\n`;
        }
      });
      txt += `\n`;
    }

    if (customNote.trim()) {
      txt += `📝 *Note:* ${customNote.trim()}\n\n`;
    }

    txt += `📞 Official Contact: ${companyInfo.company_phone || '+91 7794072244'} | ✉️ ${companyInfo.company_email || 'vinod@jaibhavanicargo.com'}\n`;
    txt += `🌐 ${companyInfo.company_website || 'www.jaibhavanicargo.com'}`;
    return txt;
  }, [companyInfo, activeDocs, recipientName, customNote]);

  const activeMessage = mode === 'single' ? singleDocText : dossierText;

  // Clean phone helper
  const cleanPhone = useMemo(() => {
    const raw = String(recipientPhone || '').replace(/[^0-9]/g, '');
    if (raw.length === 10) return `91${raw}`;
    if (raw.length === 12 && raw.startsWith('91')) return raw;
    return raw;
  }, [recipientPhone]);

  // Dispatch via Aisensy WhatsApp API
  const handleSendAisensyApi = async () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSending(true);
    const uName = recipientName.trim() || 'Valued Client';

    try {
      const response = await fetch('/hcgi/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: 'general_update',
          destination: cleanPhone,
          userName: uName,
          templateParams: [uName, activeMessage],
          rawText: activeMessage,
          media: (mode === 'single' && document?.file_url) ? {
            url: document.file_url,
            filename: `${document.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
          } : null
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`WhatsApp message sent successfully via Aisensy API! Message ID: ${data.messageId || 'DELIVERED'}`);
        onClose();
      } else {
        toast.error(`Aisensy API Notice: ${data.error || 'Could not dispatch message'}`);
      }
    } catch (err) {
      console.error('WhatsApp dispatch error:', err);
      toast.error(`Network error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Dispatch via WhatsApp Web fallback
  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(activeMessage);
    const targetUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(activeMessage);
    toast.success('WhatsApp message & document links copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Share Company Documents via WhatsApp API
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Dispatch verified company certificates, tax filings, and corporate dossiers directly via Aisensy WhatsApp Business API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Mode Switcher if a single doc was passed */}
          {document && (
            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid grid-cols-2 bg-slate-950 p-1 border border-slate-800 rounded-xl h-10">
                <TabsTrigger value="single" className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg">
                  📄 Single Document ({document.title})
                </TabsTrigger>
                <TabsTrigger value="dossier" className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg">
                  🏢 Complete Corporate Dossier ({activeDocs.length} Docs)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Recipient Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Recipient Name / Designation
              </Label>
              <Input 
                placeholder="e.g. Bank Manager / Auditor / Client"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs h-9 text-white rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Mobile Number *
              </Label>
              <Input 
                type="tel"
                placeholder="e.g. 9876543210 or 919876543210"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs h-9 text-emerald-300 font-mono rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-slate-400">Custom Note (Optional)</Label>
              <Input 
                placeholder="e.g. Please find our audited financials for loan processing."
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs h-9 text-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Document Summary Badge */}
          {mode === 'single' && document && (
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">{document.title}</h5>
                  <p className="text-[10px] text-slate-400">{document.category} • {document.financial_year || 'Current'}</p>
                </div>
              </div>
              {document.file_url && (
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  Link Attached
                </Badge>
              )}
            </div>
          )}

          {/* WhatsApp Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Message Live Preview
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyMessage}
                className="h-7 text-[11px] text-slate-400 hover:text-white px-2 rounded-lg"
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <Textarea 
              value={activeMessage}
              readOnly
              rows={8}
              className="bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3 leading-relaxed resize-none selection:bg-emerald-500/30"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="w-full sm:w-auto text-xs text-slate-400 hover:text-white rounded-xl h-10"
          >
            Cancel
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenWhatsAppWeb}
            className="w-full sm:w-auto text-xs font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl h-10"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Web / App
          </Button>

          <Button 
            size="sm" 
            onClick={handleSendAisensyApi}
            disabled={isSending}
            className="w-full sm:w-auto text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 shadow-lg shadow-emerald-600/25 px-5"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Dispatching API...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" /> Send Direct WhatsApp (Aisensy API)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
