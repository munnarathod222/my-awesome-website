import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldCheck, Copy, Share2, KeyRound, Mail, User, Phone, CheckCircle2, RefreshCw, Eye, EyeOff, Shield, UserPlus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const ROLE_OPTIONS = [
  { value: 'dispatcher', label: 'Dispatcher', description: 'Manages trip logs, routes, and vehicle dispatching', badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'manager', label: 'Fleet Manager', description: 'Oversight of fleet, maintenance, fuel, and daily operations', badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { value: 'admin', label: 'System Admin', description: 'Full administrative access, user permissions, and reports', badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { value: 'client', label: 'Client User', description: 'Client Portal access to view shipments, invoices, and PODs', badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { value: 'superuser', label: 'Superuser', description: 'Unrestricted master system access & security controls', badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
];

export default function CreateUserCredentialsModal({ isOpen, onClose, editUser = null, onSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('dispatcher');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCreatedCredentials(null);
      setShowPassword(false);

      if (editUser) {
        setFullName(editUser.name || editUser.full_name || '');
        setEmail(editUser.email || '');
        setPhone(editUser.phone_number || editUser.phone || '');
        setRole(editUser.role ? editUser.role.toLowerCase() : 'dispatcher');
        setPassword('');
        setConfirmPassword('');
      } else {
        setFullName('');
        setEmail('');
        setPhone('');
        setRole('dispatcher');
        setPassword('');
        setConfirmPassword('');
      }
    }
  }, [isOpen, editUser]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!email || !fullName) {
      toast.error('Please fill in Full Name and Email ID');
      return;
    }
    if (!editUser && !password) {
      toast.error('Please enter or generate a password');
      return;
    }
    if (password) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();

      let userRecord = null;

      if (editUser?.id) {
        // Update existing user credentials & role
        const updatePayload = {
          name: cleanName,
          full_name: cleanName,
          email: cleanEmail,
          phone_number: cleanPhone,
          role: role,
          status: 'active'
        };
        if (password) {
          updatePayload.password = password;
          updatePayload.passwordConfirm = password;
        }

        userRecord = await pb.collection('users').update(editUser.id, updatePayload, { $autoCancel: false });
        toast.success(`Updated login credentials for ${cleanName}`);
      } else {
        // Create new user account in PocketBase
        const createPayload = {
          email: cleanEmail,
          emailVisibility: true,
          password: password,
          passwordConfirm: password,
          name: cleanName,
          full_name: cleanName,
          role: role,
          status: 'active',
          phone_number: cleanPhone || '0000000000'
        };

        try {
          userRecord = await pb.collection('users').create(createPayload, { $autoCancel: false });
        } catch (createErr) {
          // If email already exists, update existing account's role & password
          if (createErr.status === 400 && (createErr.data?.data?.email || createErr.message?.includes('email'))) {
            const existing = await pb.collection('users').getFirstListItem(`email="${cleanEmail}"`, { $autoCancel: false });
            const updatePayload = {
              name: cleanName,
              full_name: cleanName,
              role: role,
              status: 'active',
              phone_number: cleanPhone || existing.phone_number
            };
            if (password) {
              updatePayload.password = password;
              updatePayload.passwordConfirm = password;
            }
            userRecord = await pb.collection('users').update(existing.id, updatePayload, { $autoCancel: false });
          } else {
            throw createErr;
          }
        }
        toast.success(`Created ${role.toUpperCase()} account for ${cleanName}`);
      }

      setCreatedCredentials({
        name: cleanName,
        email: cleanEmail,
        password: password || '(Unchanged)',
        role: role.toUpperCase()
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to save user credentials:', err);
      toast.error(`Failed to save credentials: ${err.message || 'Error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `🔑 *JAI BHAVANI CARGO LOGIN CREDENTIALS*\n\n👤 *Name:* ${createdCredentials.name}\n🛡️ *Role:* ${createdCredentials.role}\n📧 *Email:* ${createdCredentials.email}\n🔐 *Password:* ${createdCredentials.password}\n🌐 *Portal URL:* ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    toast.success('Login credentials copied to clipboard!');
  };

  const shareWhatsApp = () => {
    if (!createdCredentials) return;
    const text = `🔑 *JAI BHAVANI CARGO LOGIN CREDENTIALS*\n\n👤 *Name:* ${createdCredentials.name}\n🛡️ *Role:* ${createdCredentials.role}\n📧 *Email:* ${createdCredentials.email}\n🔐 *Password:* ${createdCredentials.password}\n🌐 *Portal URL:* ${window.location.origin}/login\n\nPlease login and change your password.`;
    
    const cleanPhoneStr = phone ? phone.replace(/\D/g, '') : '';
    let waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (cleanPhoneStr && (cleanPhoneStr.length === 10 || cleanPhoneStr.length === 12)) {
      const formatted = cleanPhoneStr.length === 10 ? `91${cleanPhoneStr}` : cleanPhoneStr;
      waUrl = `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
    }
    window.open(waUrl, '_blank');
  };

  const currentRoleObj = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-card text-card-foreground border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold font-heading flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <UserPlus className="w-5 h-5" />
            </div>
            {editUser ? 'Edit User Credentials' : 'Create Staff & User Login Credentials'}
          </DialogTitle>
          <DialogDescription>
            Assign roles (Dispatcher, Manager, Admin, Client) and setup login credentials.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                User Account Successfully Created!
              </div>

              <div className="bg-background/80 p-3.5 rounded-xl border border-border/50 space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-sans">Full Name:</span>
                  <span className="font-bold text-foreground">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-sans">Assigned Role:</span>
                  <Badge variant="outline" className="font-bold text-[10px] uppercase">
                    {createdCredentials.role}
                  </Badge>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground font-sans">Email ID:</span>
                  <span className="font-bold text-foreground">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">Password:</span>
                  <span className="font-bold text-blue-500">{createdCredentials.password}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button onClick={copyCredentials} variant="outline" className="w-full rounded-xl font-bold">
                <Copy className="w-4 h-4 mr-2" /> Copy Credentials
              </Button>
              <Button onClick={shareWhatsApp} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
              </Button>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={onClose} className="w-full rounded-xl font-bold bg-primary text-primary-foreground">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSaveCredentials} className="space-y-4 py-2">
            {/* Select Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assign System Role *
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-background border-border rounded-xl font-bold text-sm">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground flex items-center gap-2">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-[11px] text-muted-foreground mt-1 bg-muted/40 p-2 rounded-xl border border-border/30">
                📌 Role: <strong className="text-foreground">{currentRoleObj.label}</strong> — {currentRoleObj.description}
              </div>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </Label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-background border-border rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-background border-border rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address (Login Username) *
              </Label>
              <Input
                type="email"
                required
                placeholder="dispatcher@jaibhavanicargo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-background border-border rounded-xl text-sm"
              />
            </div>

            {/* Password Section */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {editUser ? 'New Password (Leave blank to keep unchanged)' : 'Login Password *'}
                </Label>
                <Button
                  type="button"
                  onClick={generateRandomPassword}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 font-bold px-2 rounded-lg"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Auto-Generate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-background border-border rounded-xl text-sm font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="bg-background border-border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                {loading ? 'Saving...' : editUser ? 'Update Credentials' : 'Create User Credentials'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
