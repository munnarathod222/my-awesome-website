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
        // Fetch all clients if no client was passed
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
      const username = `client_${activeClient.client_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
      
      const userData = {
        username: username,
        email: email.trim(),
        emailVisibility: true,
        password: password,
        passwordConfirm: password,
        name: activeClient.client_name || activeClient.company_name,
        role: 'client',
        client_id: activeClient.id,
        verified: true
      };

      let userRecord;
      try {
        userRecord = await pb.collection('users').create(userData, { $autoCancel: false });
      } catch (createErr) {
        // If user already exists with this email, update password & role
        if (createErr.status === 400 && createErr.data?.data?.email) {
          const existing = await pb.collection('users').getFirstListItem(`email="${email.trim()}"`, { $autoCancel: false });
          userRecord = await pb.collection('users').update(existing.id, {
            password: password,
            passwordConfirm: password,
            role: 'client',
            client_id: activeClient.id
          }, { $autoCancel: false });
        } else {
          throw createErr;
        }
      }

      // Link user_id in client record
      await pb.collection('clients').update(activeClient.id, {
        portal_user_id: userRecord.id,
        portal_enabled: true
      }, { $autoCancel: false }).catch(() => {});

      const creds = {
        clientName: activeClient.client_name,
        companyName: activeClient.company_name,
        email: email.trim(),
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

  const activeClient = selectedClient || initialClient;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {createdCredentials ? 'Client Login Credentials' : 'Create & Link Client Login'}
          </DialogTitle>
          <DialogDescription>
            {createdCredentials 
              ? 'Share these login credentials with the client so they can access their dashboard.'
              : 'Link a client to a dedicated Client Portal login account.'}
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Client Name</span>
                <span className="text-sm font-bold text-foreground">{createdCredentials.clientName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">Portal URL</span>
                <span className="text-xs font-mono text-primary font-bold">{createdCredentials.portalUrl}</span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Email / User</span>
                <span className="text-sm font-mono text-foreground">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Password</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{createdCredentials.password}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
                <Copy className="w-4 h-4" /> Copy Info
              </Button>
              <Button onClick={handleShareWhatsApp} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Share2 className="w-4 h-4" /> WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            {/* Client Dropdown Selector if not passed as prop */}
            {!initialClient && (
              <div className="space-y-2">
                <Label>Select Client to Link *</Label>
                {fetchingClients ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading clients list...
                  </div>
                ) : (
                  <Select value={selectedClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a client" />
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

            {activeClient && (
              <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Selected Client</p>
                  <p className="text-sm font-bold text-foreground">{activeClient.client_name}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {activeClient.client_type || 'Client'}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label>Client Email (Login ID) *</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="pl-9 bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Set Login Password *</Label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Auto Generate
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-9 bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="bg-background"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? 'Linking...' : 'Link & Create Credentials'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
