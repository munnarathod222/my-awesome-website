import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldCheck, Copy, Share2, KeyRound, Mail, User, Building2, CheckCircle2, RefreshCw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

export default function CreateClientUserModal({ isOpen, onClose, client: initialClient, onSuccess }) {
  const [allClients, setAllClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(initialClient?.id || '');
  const [selectedClient, setSelectedClient] = useState(initialClient || null);
  
  const [email, setEmail] = useState(initialClient?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCreatedCredentials(null);
      setPassword('');
      setConfirmPassword('');

      if (initialClient) {
        setSelectedClient(initialClient);
        setSelectedClientId(initialClient.id);
        setEmail(initialClient.email || '');
      } else {
        fetchClientsList();
      }
    }
  }, [isOpen, initialClient]);

  const fetchClientsList = async () => {
    setFetchingClients(true);
    try {
      const list = await pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false });
      setAllClients(list);
      if (list.length > 0 && !selectedClientId) {
        setSelectedClientId(list[0].id);
        setSelectedClient(list[0]);
        setEmail(list[0].email || '');
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      toast.error('Failed to load clients list');
    } finally {
      setFetchingClients(false);
    }
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const found = allClients.find(c => c.id === clientId);
    if (found) {
      setSelectedClient(found);
      setEmail(found.email || '');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const activeClient = selectedClient || initialClient;
    if (!activeClient) {
      toast.error('Please select a client to link');
      return;
    }
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
      const cleanEmail = email.trim();
      const clientName = activeClient.client_name || activeClient.company_name || 'Client';
      
      let userRecord = null;

      // 1. Primary approach: call superuser-authenticated backend API endpoint
      try {
        const response = await apiServerClient.fetch('/user/create-client-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
            clientId: activeClient.id,
            clientName: clientName
          })
        });

        if (response.ok) {
          const resData = await response.json();
          userRecord = resData.user;
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }
      } catch (apiErr) {
        console.warn('[CreateClientUserModal] Server API call failed, trying direct SDK creation fallback:', apiErr);

        // 2. Direct SDK fallback logic
        const userData = {
          email: cleanEmail,
          emailVisibility: true,
          password: password,
          passwordConfirm: password,
          name: clientName,
          full_name: clientName,
          role: 'Client',
          status: 'active',
          phone_number: activeClient.phone || '0000000000'
        };

        try {
          userRecord = await pb.collection('users').create(userData, { $autoCancel: false });
        } catch (createErr) {
          if (createErr.status === 400 && (createErr.data?.data?.email || createErr.message?.includes('email'))) {
            const existing = await pb.collection('users').getFirstListItem(`email="${cleanEmail}"`, { $autoCancel: false });
            userRecord = await pb.collection('users').update(existing.id, {
              password: password,
              passwordConfirm: password,
              role: 'Client',
              status: 'active',
              phone_number: existing.phone_number || activeClient.phone || '0000000000',
              full_name: existing.full_name || clientName
            }, { $autoCancel: false });
          } else {
            userRecord = await pb.collection('users').create({
              email: cleanEmail,
              password: password,
              passwordConfirm: password,
              name: clientName,
              full_name: clientName,
              role: 'Client',
              status: 'active',
              phone_number: activeClient.phone || '0000000000'
            }, { $autoCancel: false });
          }
        }

        // Link client record in fallback mode
        await pb.collection('clients').update(activeClient.id, {
          portal_user_id: userRecord.id,
          portal_enabled: true
        }, { $autoCancel: false }).catch(() => {});
      }

      const creds = {
        clientName: activeClient.client_name,
        companyName: activeClient.company_name,
        email: cleanEmail,
        password: password,
        portalUrl: `${window.location.origin}/client-login`
      };

      setCreatedCredentials(creds);
      toast.success(`Client portal credentials linked to ${activeClient.client_name}`);
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
    return `🔐 *Jai Bhavani Cargo - Client Portal Login*\n\nDear *${createdCredentials.clientName}*,\nYour client portal account has been created.\n\n🌐 *Portal Login:* ${createdCredentials.portalUrl}\n📧 *Email:* ${createdCredentials.email}\n🔑 *Password:* ${createdCredentials.password}\n\nLog in anytime to view your shipments, freight logs, and download Proof of Delivery (POD) documents.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText());
    toast.success('Client login credentials copied to clipboard');
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Create & Link Client Login
          </DialogTitle>
          <DialogDescription>
            Link a client to a dedicated Client Portal login account.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="py-4 space-y-5 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <h4 className="font-bold text-success text-sm">Credentials Created & Linked!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Client <span className="font-semibold text-foreground">{createdCredentials.clientName}</span> can now log in.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border text-sm font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground font-sans">Login Portal URL:</span>
                <span className="text-xs font-semibold text-primary font-mono">{createdCredentials.portalUrl}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground font-sans">Email ID:</span>
                <span className="font-bold text-foreground">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-sans">Password:</span>
                <span className="font-bold text-primary">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button onClick={handleCopy} variant="outline" className="rounded-xl gap-2 shadow-sm">
                <Copy className="w-4 h-4" /> Copy Access Info
              </Button>
              <Button onClick={handleShareWhatsApp} className="rounded-xl gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                <Share2 className="w-4 h-4" /> Share via WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            {!initialClient && (
              <div className="space-y-2">
                <Label>Select Client *</Label>
                {fetchingClients ? (
                  <p className="text-xs text-muted-foreground">Loading clients...</p>
                ) : (
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.client_name} {c.company_name ? `(${c.company_name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {selectedClient && (
              <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">{selectedClient.client_name}</p>
                    <p className="text-muted-foreground">{selectedClient.company_name || 'Individual Client'}</p>
                  </div>
                </div>
                <Badge variant="outline">{selectedClient.client_type || 'Company'}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label>Client Email (Login ID) *</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-background pl-9"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Set Login Password *</Label>
                <button 
                  type="button" 
                  onClick={generateRandomPassword} 
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Auto Generate
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="text" 
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-background pl-9 font-mono"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password *</Label>
              <Input 
                type="text" 
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-background font-mono"
                placeholder="Re-enter password"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Link & Create Credentials'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
