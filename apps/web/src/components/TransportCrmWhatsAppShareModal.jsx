import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, Share2, Copy, Send, CheckCircle2, Phone, Building2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function TransportCrmWhatsAppShareModal({ isOpen, onClose, selectedCustomers = [] }) {
  const [templateType, setTemplateType] = useState('payment_reminder');
  const [customText, setCustomText] = useState('');

  const validCustomers = useMemo(() => {
    return selectedCustomers.filter(c => c && (c.phone || c.primary_contact));
  }, [selectedCustomers]);

  // Generate WhatsApp message per customer or batch summary
  const generateMessageForCustomer = (cust) => {
    const name = cust.primary_contact || cust.company_name || 'Valued Customer';
    const company = cust.company_name || 'Enterprise Account';
    const outstanding = (cust.outstanding_amount || 0).toLocaleString('en-IN');
    const creditLimit = (cust.credit_limit || 0).toLocaleString('en-IN');

    if (templateType === 'share_contacts') {
      return `📇 *JAI BHAVANI CARGO - DIRECTORY CONTACT SHARE*\n\n• *Name:* ${company}\n• *Role / Designation:* ${name}\n• *Phone:* ${cust.phone || 'N/A'}\n• *Email:* ${cust.email || 'N/A'}`;
    } else if (templateType === 'payment_reminder') {
      return `🚚 *JAI BHAVANI CARGO - OUTSTANDING FREIGHT REMINDER*\n\nDear *${name}* (${company}),\n\nThis is a friendly reminder regarding your outstanding freight invoice balance of *₹${outstanding}*.\n\n• Credit Limit: ₹${creditLimit}\n• Current Outstanding: ₹${outstanding}\n\nKindly arrange for invoice settlement at your earliest convenience.\n\nThank you,\n*Jai Bhavani Cargo Accounts Desk*`;
    } else if (templateType === 'rate_offer') {
      return `🚚 *JAI BHAVANI CARGO - EXCLUSIVE FREIGHT RATE QUOTE*\n\nDear *${name}* (${company}),\n\nWe are pleased to offer dedicated container & truck rates for your logistics routes with instant GPS tracking & zero-delay dispatch.\n\nContact us for contract bookings.\n\n*Jai Bhavani Cargo Operations*`;
    } else if (templateType === 'company_dossier') {
      return `🏢 *JAI BHAVANI CARGO - CORPORATE DOSSIER*\n\nGSTIN: 36DPXPR9171A1Z8\nPAN: DPXPR9171A\nBank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234\n\nFor bookings & dispatch: +91 9876543210`;
    } else {
      return customText || `Hello *${name}* (${company}), message from Jai Bhavani Cargo.`;
    }
  };

  // Combined text block for copying
  const combinedText = useMemo(() => {
    if (validCustomers.length === 0) return '';
    return validCustomers.map(c => {
      const phone = c.phone ? ` [Phone: ${c.phone}]` : '';
      return `${generateMessageForCustomer(c)}${phone}`;
    }).join('\n\n--------------------------------------------------\n\n');
  }, [validCustomers, templateType, customText]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(combinedText);
    toast.success(`Copied broadcast text for ${validCustomers.length} contacts to clipboard!`);
  };

  const handleCopyPhones = () => {
    const phones = validCustomers.map(c => c.phone).filter(Boolean).join(', ');
    navigator.clipboard.writeText(phones);
    toast.success(`Copied ${validCustomers.length} phone numbers for WhatsApp Broadcast!`);
  };

  const handleSendIndividualWhatsApp = (cust) => {
    if (!cust.phone) {
      toast.error(`No phone number available for ${cust.company_name}`);
      return;
    }
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(generateMessageForCustomer(cust));
    window.open(`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            WhatsApp Multi-Contact Broadcast ({validCustomers.length} Selected)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Send payment reminders, rate quotes, or company dossiers directly to selected customer contacts via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Select Message Template</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-xs rounded-xl font-bold text-emerald-400">
                <SelectValue placeholder="Choose Template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="share_contacts">📇 Share Selected Contact Cards / Directory Text</SelectItem>
                <SelectItem value="payment_reminder">💰 Outstanding Freight Payment Reminder</SelectItem>
                <SelectItem value="rate_offer">🚚 Dedicated Route Rate Offer / Quote</SelectItem>
                <SelectItem value="company_dossier">🏢 Corporate Profile & GST/Bank Details</SelectItem>
                <SelectItem value="custom">✏️ Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {templateType === 'custom' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Custom WhatsApp Message</Label>
              <Textarea 
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="bg-slate-950 border-slate-800 text-xs rounded-xl h-24 text-white"
              />
            </div>
          )}

          {/* Selected Contacts List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Selected Contacts List ({validCustomers.length})</span>
              <Button variant="ghost" size="sm" onClick={handleCopyPhones} className="h-6 text-[11px] text-amber-400 hover:text-amber-300 p-0">
                <Copy className="w-3 h-3 mr-1" /> Copy Phone List
              </Button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {validCustomers.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-500/20">
                      {c.company_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{c.company_name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {c.primary_contact || 'Contact'} ({c.phone || 'No phone'})
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendIndividualWhatsApp(c)}
                    className="h-7 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-lg shrink-0 flex items-center gap-1 font-bold"
                  >
                    Send <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Message Preview</Label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {validCustomers.length > 0 ? generateMessageForCustomer(validCustomers[0]) : 'Select contacts to preview.'}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs border-slate-800 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleCopyText} className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Message Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
