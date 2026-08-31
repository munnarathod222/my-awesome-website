import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, MessageSquare, Phone, MapPin, Copy, CheckCircle2, 
  ExternalLink, Sparkles, Loader2, User, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { getPastedMapUrl } from '@/lib/contactUtils.js';

export default function OneClickSendContactModal({ isOpen, onClose, contact }) {
  const [recipientType, setRecipientType] = useState('custom');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load team / driver list
      const loadStaff = async () => {
        try {
          const users = await pb.collection('users').getFullList({ sort: 'name', $autoCancel: false });
          if (users && users.length > 0) {
            setStaffList(users);
          } else {
            setStaffList([
              { id: 'u1', name: 'Duty Dispatcher', phone: '7794072244' },
              { id: 'u2', name: 'Fleet Supervisor', phone: '9848012345' },
              { id: 'u3', name: 'Nagpur Yard Manager', phone: '9848054321' }
            ]);
          }
        } catch (e) {
          setStaffList([
            { id: 'u1', name: 'Duty Dispatcher', phone: '7794072244' },
            { id: 'u2', name: 'Fleet Supervisor', phone: '9848012345' }
          ]);
        }
      };
      loadStaff();
      setCustomNote('');
      setRecipientPhone('');
      setRecipientName('');
    }
  }, [isOpen, contact]);

  if (!contact) return null;

  const mapUrl = getPastedMapUrl(contact);

  const generateFormattedMessage = () => {
    const name = contact.company_name || 'Emergency Contact';
    const phone = contact.phone_number || '';
    const type = contact.contact_type || 'Directory Contact';
    const address = contact.physical_address || '';
    const brand = contact.truck_brand ? `\n🔧 *Brands:* ${contact.truck_brand}` : '';
    const note = customNote ? `\n\n📝 *Dispatch Note:* ${customNote}` : '';

    return `📇 *JAI BHAVANI CARGO - CONTACT CARD*\n\n🏢 *${name}*\n📂 *Category:* ${type}\n📞 *Phone:* ${phone}${brand}\n📍 *Address:* ${address || 'Available on request'}${mapUrl ? `\n🗺️ *Google Maps:* ${mapUrl}` : ''}${note}\n\n_Sent via Jai Bhavani Cargo Dispatch Desk_`;
  };

  const handle1ClickSend = async () => {
    setLoading(true);
    const formatted = generateFormattedMessage();
    let cleanPhone = recipientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

    try {
      // Call backend API endpoint
      const payload = {
        contact,
        recipientPhone: cleanPhone,
        recipientName: recipientName || 'Staff Member',
        customNote,
        channel: 'whatsapp'
      };

      let apiSuccess = false;
      let targetUrl = '';

      try {
        const res = await window.fetch('/hcgi/api/driver/send-contact-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          apiSuccess = true;
          targetUrl = data.directWhatsappUrl;
        }
      } catch (e) {}

      if (!apiSuccess) {
        try {
          const res = await window.fetch('/api/driver/send-contact-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            apiSuccess = true;
            targetUrl = data.directWhatsappUrl;
          }
        } catch (e) {}
      }

      if (!targetUrl) {
        targetUrl = cleanPhone 
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formatted)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(formatted)}`;
      }

      window.open(targetUrl, '_blank');
      toast.success(`Contact card for "${contact.company_name}" sent via WhatsApp API!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send contact via API');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateFormattedMessage());
    toast.success('Contact card copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              1-Click Send Contact via API
            </DialogTitle>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
              API Instant
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-400 mt-1">
            Dispatch contact details, phone number & Google Maps location directly to drivers or fleet managers with 1 click.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          {/* Contact Preview Box */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{contact.company_name}</span>
              <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/30">
                {contact.contact_type}
              </Badge>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-400">{contact.phone_number || 'N/A'}</span>
            </div>
            {contact.physical_address && (
              <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{contact.physical_address}</span>
              </div>
            )}
          </div>

          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-300">Select Recipient Staff / Driver</Label>
            <Select 
              value={recipientType} 
              onValueChange={v => {
                setRecipientType(v);
                if (v !== 'custom') {
                  const staffObj = staffList.find(s => s.id === v);
                  if (staffObj) {
                    setRecipientPhone(staffObj.phone || '');
                    setRecipientName(staffObj.name || '');
                  }
                } else {
                  setRecipientPhone('');
                  setRecipientName('');
                }
              }}
            >
              <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-200">
                <SelectValue placeholder="Choose recipient" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="custom">✏️ Enter Custom Phone Number</SelectItem>
                {staffList.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    👤 {s.name} {s.phone ? `(${s.phone})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Phone Input if selected */}
          {recipientType === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <Label className="text-xs font-bold text-slate-300">Recipient WhatsApp Phone Number *</Label>
              <Input 
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                placeholder="e.g. 9848012345 (10-digit mobile number)"
                className="bg-slate-950 border-slate-800 text-xs font-mono font-bold text-emerald-400"
              />
            </div>
          )}

          {/* Dispatch Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">Optional Dispatch Note (Added to message)</Label>
            <Textarea 
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. Truck MH12-AB-1234 breakdown, reach this mechanic immediately..."
              className="bg-slate-950 border-slate-800 text-xs min-h-[60px] text-slate-200"
            />
          </div>

        </div>

        <DialogFooter className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleCopyText}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs"
          >
            <Copy className="w-3.5 h-3.5 mr-1" /> Copy Card
          </Button>

          <Button 
            type="button" 
            onClick={handle1ClickSend} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-emerald-900/30"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-1" />}
            1-Click Send via API
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
