import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, Mail, MessageSquare, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

import apiServerClient from '@/lib/apiServerClient.js';

export default function ShareFolderDialog({ isOpen, onClose, truckId, employeeId, entityName }) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && (truckId || employeeId)) {
      getOrCreateShareLink();
    } else {
      setShareUrl('');
      setCopied(false);
    }
  }, [isOpen, truckId, employeeId]);

  const getOrCreateShareLink = async () => {
    setLoading(true);
    try {
      // Step 1: Try backend API (superuser access)
      let linkSuccess = false;
      try {
        const res = await apiServerClient.fetch('/driver/share-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            truckId,
            employeeId,
            created_by: pb.authStore.model?.id || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.record?.id) {
            const url = `${window.location.origin}/shared/${data.record.id}`;
            setShareUrl(url);
            linkSuccess = true;
          }
        }
      } catch (apiErr) {
        console.warn('Backend share-folder API failed, trying PocketBase SDK directly:', apiErr);
      }

      if (linkSuccess) return;

      // Step 2: Fallback to direct PocketBase SDK
      let filter = '';
      if (truckId) {
        filter = `truck_id = "${truckId}"`;
      } else if (employeeId) {
        filter = `employee_id = "${employeeId}"`;
      }

      const existing = await pb.collection('shared_folders').getFullList({
        filter,
        $autoCancel: false
      });

      if (existing.length > 0) {
        const record = existing[0];
        const url = `${window.location.origin}/shared/${record.id}`;
        setShareUrl(url);
      } else {
        const payload = {};
        if (truckId) payload.truck_id = truckId;
        if (employeeId) payload.employee_id = employeeId;
        payload.created_by = pb.authStore.model?.id || '';

        const record = await pb.collection('shared_folders').create(payload, { $autoCancel: false });
        const url = `${window.location.origin}/shared/${record.id}`;
        setShareUrl(url);
        toast.success('Secure share link generated!');
      }
    } catch (err) {
      console.error('Failed to get/create share link:', err);
      toast.error('Failed to generate share link. Please try again.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    const text = `Hello, please find the secure read-only document folder for ${entityName || 'Vehicle/Driver'} here:\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailShare = () => {
    if (!shareUrl) return;
    const subject = `Secure Shared Document Folder - ${entityName || 'Vehicle/Driver'}`;
    const body = `Hello,\n\nYou have been shared a secure, read-only link to access the logistics document folder for ${entityName || 'Vehicle/Driver'}.\n\nAccess Folder: ${shareUrl}\n\nBest regards,\nLogistics Management`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] max-w-md rounded-[1.8rem] p-6 shadow-2xl bg-card border-border/50 overflow-hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            Share Folder Link
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Generate a secure, read-only landing page for sharing RC, license, permit, insurance, or other profile documents.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Generating secure token...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shared Entity</Label>
              <p className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {entityName || 'Logistics Folder'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Secure Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  placeholder="https://..."
                  className="bg-muted/40 border-muted-foreground/20 rounded-xl h-11 text-sm px-4 focus-visible:ring-primary/20 flex-1 truncate"
                />
                <Button
                  onClick={handleCopy}
                  className="rounded-xl h-11 px-4 border border-border shadow-sm flex items-center gap-1.5 shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="border-t border-border/40 my-2" />

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsAppShare}
                className="rounded-xl h-12 flex items-center justify-center gap-2 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-semibold"
              >
                <MessageSquare className="w-4 h-4 fill-emerald-400/25" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleEmailShare}
                className="rounded-xl h-12 flex items-center justify-center gap-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-semibold"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl h-11 font-medium bg-muted/20 border-muted-foreground/15 hover:bg-muted"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
