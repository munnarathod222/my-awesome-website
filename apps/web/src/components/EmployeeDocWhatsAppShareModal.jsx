import React, { useState, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Share2, Copy, Send, CheckCircle2, Phone, User, 
  ExternalLink, FileText, Download, ShieldCheck, Loader2, Calendar, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

export default function EmployeeDocWhatsAppShareModal({ 
  isOpen, 
  onClose, 
  document = null, 
  employee = null 
}) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const empName = employee?.name || document?.employee_name || 'Staff Member';
  const empRole = employee?.role || employee?.type || employee?.designation || 'Staff / Driver';
  const empCode = employee?.employee_code || employee?.id || 'N/A';

  // Get file URL
  const fileUrl = useMemo(() => {
    if (!document) return '';
    if (document.file_url) return document.file_url;
    const activeFile = document.file || (Array.isArray(document.files) ? document.files[0] : document.files);
    if (activeFile && typeof activeFile === 'string') {
      return pb.files.getUrl(document, activeFile);
    }
    return '';
  }, [document]);

  // Formatted dates
  const formattedExpiry = useMemo(() => {
    if (!document?.expiry_date) return 'No Expiry / Permanent';
    try { return format(new Date(document.expiry_date), 'dd MMM yyyy'); } catch(e) { return document.expiry_date; }
  }, [document]);

  const formattedIssue = useMemo(() => {
    if (!document?.issue_date) return 'N/A';
    try { return format(new Date(document.issue_date), 'dd MMM yyyy'); } catch(e) { return document.issue_date; }
  }, [document]);

  // Generate WhatsApp message
  const generatedMessage = useMemo(() => {
    if (!document) return '';
    const name = recipientName.trim() || 'Sir / Madam';
    const docType = document.document_type || document.title || 'KYC / Employee Document';
    const docNo = document.document_number || 'N/A';

    let txt = `👤 *JAI BHAVANI CARGO - EMPLOYEE CREDENTIALS & COMPLIANCE*\n\n`;
    txt += `Dear *${name}*,\n\n`;
    txt += `Please find the verified employee credentials and compliance document for *${empName}*:\n\n`;
    txt += `📄 *Document Type:* ${docType}\n`;
    txt += `👤 *Staff / Driver Name:* ${empName}\n`;
    txt += `💼 *Designation / Role:* ${empRole.toUpperCase()}\n`;
    if (empCode && empCode !== 'N/A') {
      txt += `🆔 *Employee Code:* ${empCode}\n`;
    }
    if (docNo && docNo !== 'N/A') {
      txt += `🔢 *Document / License No:* ${docNo}\n`;
    }
    if (formattedIssue !== 'N/A') {
      txt += `📅 *Issue Date:* ${formattedIssue}\n`;
    }
    txt += `⏳ *Valid Till:* ${formattedExpiry}\n`;

    if (fileUrl) {
      txt += `\n🔗 *Direct Document View / Download Link:*\n${fileUrl}\n`;
    }

    if (customNote.trim()) {
      txt += `\n📝 *Note:* ${customNote.trim()}\n`;
    }

    txt += `\n🏢 *Carrier:* Jai Bhavani Cargo & Logistics\n`;
    txt += `🆔 *GSTIN:* 36DPXPR9171A1Z8 | 📞 *Contact:* +91 7794072244\n`;
    txt += `🌐 www.jaibhavanicargo.com`;
    return txt;
  }, [document, empName, empRole, empCode, recipientName, formattedExpiry, formattedIssue, fileUrl, customNote]);

  // Clean phone number helper
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
    const uName = recipientName.trim() || 'Valued Partner';

    try {
      const response = await fetch('/hcgi/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: 'general_update',
          destination: cleanPhone,
          userName: uName,
          templateParams: [uName, generatedMessage],
          rawText: generatedMessage,
          media: fileUrl ? {
            url: fileUrl,
            filename: `${empName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${(document.document_type || 'Doc').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
          } : null
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Employee document sent successfully via Aisensy WhatsApp API! Message ID: ${data.messageId || 'OK'}`);
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

  // Dispatch via WhatsApp Web / App
  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(generatedMessage);
    const targetUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success('Employee document details & link copied to clipboard!');
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Share Employee Document via WhatsApp API
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Dispatch driver license, Aadhaar/ID, police verification, or certifications directly via Aisensy WhatsApp API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Summary Card */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{empName}</span>
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    {document.document_type || 'Document'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Role: <span className="text-blue-400 font-semibold">{empRole}</span> • Expires: <span className="text-amber-400 font-mono">{formattedExpiry}</span>
                </p>
              </div>
            </div>
            {fileUrl && (
              <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-300">
                File Attached
              </Badge>
            )}
          </div>

          {/* Recipient Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Recipient Name / Designation
              </Label>
              <Input 
                placeholder="e.g. Police Inspector / Client / Security"
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
                placeholder="e.g. 9876543210"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs h-9 text-emerald-300 font-mono rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-slate-400">Custom Note (Optional)</Label>
              <Input 
                placeholder="e.g. Driver driving license for plant entry gate pass."
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="bg-slate-900 border-slate-700 text-xs h-9 text-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Live Preview */}
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
              value={generatedMessage}
              readOnly
              rows={7}
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
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Web
          </Button>

          <Button 
            size="sm" 
            onClick={handleSendAisensyApi}
            disabled={isSending}
            className="w-full sm:w-auto text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 shadow-lg shadow-emerald-600/25 px-5"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending via API...
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
