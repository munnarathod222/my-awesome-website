import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, X, Plus, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SendMailDialog({ 
  isOpen, 
  onOpenChange, 
  defaultRecipient = '', 
  defaultSubject = '', 
  defaultBody = '', 
  richHtmlContent = '', 
  contextLabel = '' 
}) {
  const [to, setTo] = useState(defaultRecipient);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTo(defaultRecipient);
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [isOpen, defaultRecipient, defaultSubject, defaultBody]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to.trim()) {
      toast.error('Recipient email (To) is required.');
      return;
    }
    if (!subject.trim()) {
      toast.error('Subject line is required.');
      return;
    }

    setSending(true);
    try {
      // If richHtmlContent is provided, wrap body with it or merge it
      const finalBody = richHtmlContent 
        ? `<div style="font-family: sans-serif; color: #1e293b; line-height: 1.6;">
            <p style="white-space: pre-line;">${body}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            ${richHtmlContent}
           </div>`
        : `<div style="font-family: sans-serif; color: #1e293b; line-height: 1.6; white-space: pre-line;">${body}</div>`;

      const response = await fetch('/hcgi/api/zoho/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          cc,
          bcc,
          subject,
          body: finalBody
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Email sent successfully via Zoho Mail!');
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Failed to send email.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to deliver email. Network connection error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans scrollbar-none max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" /> 
            <span>Send Corporate Email</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {contextLabel ? `Sharing ${contextLabel} via official Zoho Mail gateway` : 'Send professional logistics correspondence via Zoho Mail.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 py-3 text-xs">
          <div className="space-y-3">
            {/* To Address */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-slate-300 font-bold">To Recipient *</Label>
                <button 
                  type="button" 
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-[10px] text-blue-400 font-bold hover:underline"
                >
                  {showCcBcc ? 'Hide CC/BCC' : 'Add CC/BCC'}
                </button>
              </div>
              <Input
                required
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="e.g. procurement.officer@client.com"
                className="bg-slate-900 border-slate-800 text-white rounded-xl h-9.5 text-xs font-bold"
              />
            </div>

            {/* CC / BCC fields */}
            {showCcBcc && (
              <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">CC</Label>
                  <Input
                    type="text"
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    placeholder="cc@company.com"
                    className="bg-slate-900 border-slate-800 text-white rounded-xl h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 font-bold">BCC</Label>
                  <Input
                    type="text"
                    value={bcc}
                    onChange={e => setBcc(e.target.value)}
                    placeholder="bcc@company.com"
                    className="bg-slate-900 border-slate-800 text-white rounded-xl h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1">
              <Label className="text-slate-300 font-bold">Subject Line *</Label>
              <Input
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject description"
                className="bg-slate-900 border-slate-800 text-amber-200 rounded-xl h-9.5 text-xs font-semibold"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <Label className="text-slate-300 font-bold">Cover Message Body</Label>
              <Textarea
                required
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={5}
                placeholder="Type your cover letter or note to the recipient..."
                className="bg-slate-900 border-slate-800 text-white rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Attachment Preview Card */}
            {richHtmlContent && (
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Embedded Document Contents
                </p>
                <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-xl max-h-32 overflow-y-auto font-sans leading-relaxed border border-slate-900">
                  <div dangerouslySetInnerHTML={{ __html: richHtmlContent }} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[9.5px] text-slate-500 font-mono">Secure API Gateway</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-5 shadow-lg shadow-blue-600/30 gap-1.5"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{sending ? 'Sending...' : 'Send Mail'}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Dialog>
    </Dialog>
  );
}
