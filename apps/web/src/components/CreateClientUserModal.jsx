import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShieldCheck, Copy, Share2, KeyRound, Mail, User, Building2, CheckCircle2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function CreateClientUserModal({ isOpen, onClose, client, onSuccess }) {
  const [email, setEmail] = useState(client?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  if (!client) return null;

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in email and password');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // 1. Create or update user in users collection
      const username = `client_${client.client_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
      
      const userData = {
        username: username,
        email: email.trim(),
        emailVisibility: true,
        password: password,
        passwordConfirm: password,
        name: client.client_name || client.company_name,
        role: 'client',
        client_id: client.id,
        verified: true
      };

      let userRecord;
      try {
        userRecord = await pb.collection('users').create(userData, { $autoCancel: false });
      } catch (createErr) {
        // If user already exists with this email, update password
        if (createErr.status === 400 && createErr.data?.data?.email) {
          const existing = await pb.collection('users').getFirstListItem(`email="${email.trim()}"`, { $autoCancel: false });
          userRecord = await pb.collection('users').update(existing.id, {
            password: password,
            passwordConfirm: password,
            role: 'client',
            client_id: client.id
          }, { $autoCancel: false });
        } else {
          throw createErr;
        }
      }

      // 2. Link user_id in client record
      await pb.collection('clients').update(client.id, {
        portal_user_id: userRecord.id,
        portal_enabled: true
      }, { $autoCancel: false }).catch(() => {});

      const creds = {
        clientName: client.client_name,
        email: email.trim(),
        password: password,
        portalUrl: `${window.location.origin}/login`
      };

      setCreatedCredentials(creds);
      toast.success(`Client portal account created for ${client.client_name}`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[CreateClientUserModal] Failed to create client account:', err);
      toast.error(err.message || 'Failed to create client account');
    } finally {
      setLoading(false);
    }
  };

  const getShareText = () => {
    if (!createdCredentials) return '';
    return `🔐 *Jai Bhavani Cargo - Client Portal Credentials*\n\nDear *${createdCredentials.clientName}*,\nYour secure client portal account has been created.\n\n🌐 *Portal Link:* ${createdCredentials.portalUrl}\n📧 *Email/Login:* ${createdCredentials.email}\n🔑 *Password:* ${createdCredentials.password}\n\nYou can log in to track active shipments, view freight logs, and download Proof of Delivery (POD) documents anytime.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText());
    toast.success('Login credentials copied to clipboard');
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Client Portal Account Setup
          </DialogTitle>
          <DialogDescription>
            Create secure portal credentials for <span className="font-bold text-foreground">{client.client_name}</span>.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-5 py-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base text-foreground">Credentials Created Successfully!</h4>
              <p className="text-xs text-muted-foreground">Share these login details securely with the client.</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Portal Link:</span>
                <span className="text-primary font-bold">{createdCredentials.portalUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-bold">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Password:</span>
                <span className="text-emerald-400 font-bold">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" /> Copy Details
              </Button>
              <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleShareWhatsApp}>
                <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="font-bold block text-foreground">{client.client_name}</span>
                <span className="text-muted-foreground">{client.contact_person || 'Client Partner'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Client Login Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="client@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Set Password *</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Min 8 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Confirm Password *</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl shadow-md bg-primary">
                {loading ? 'Creating Account...' : 'Generate Client Account'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
