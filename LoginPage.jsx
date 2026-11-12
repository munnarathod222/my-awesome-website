import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Truck, ShieldCheck, Lock, KeyRound, User, Sparkles, ArrowRight, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle2, RotateCcw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { 
  saveDevicePinVault, 
  verifyAndUnlockPin, 
  isPinConfigured, 
  getSavedDeviceProfile, 
  getPinLockoutStatus, 
  removeDevicePinVault 
} from '@/lib/pinCrypto.js';

const LoginPage = () => {
  const { login, loginWithSession, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 4-Digit Quick PIN State for Saved/Recognized Devices
  const [savedDeviceProfile, setSavedDeviceProfile] = useState(null);
  const [loginMode, setLoginMode] = useState('credentials'); // 'pin' or 'credentials'
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [lockoutStatus, setLockoutStatus] = useState({ isLocked: false, remainingSeconds: 0 });
  const pinInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Setup PIN Modal for first-time enrollments during credential login
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [tempAuthSession, setTempAuthSession] = useState(null);
  const [setupPin, setSetupPin] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [enablePinOnDevice, setEnablePinOnDevice] = useState(true);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const path = (currentUser?.role === 'Client' || currentUser?.role === 'client') ? '/client-portal' : '/dashboard';
      window.location.href = path;
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    // Check lockout and saved profile on mount
    const checkLockout = () => {
      const status = getPinLockoutStatus();
      setLockoutStatus(status);
      return status;
    };

    const status = checkLockout();

    if (isPinConfigured()) {
      const profile = getSavedDeviceProfile();
      if (profile && profile.email) {
        setSavedDeviceProfile(profile);
        setEmail(profile.email);
        if (!status.isLocked) {
          setLoginMode('pin');
        } else {
          setLoginMode('credentials');
        }
      }
    }

    // Countdown interval for lockout
    const timer = setInterval(() => {
      const current = getPinLockoutStatus();
      setLockoutStatus(current);
      if (!current.isLocked && current.remainingSeconds === 0 && isPinConfigured()) {
        // Lockout expired
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePinChange = (index, value) => {
    // Filter numeric characters only
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = val;
    setPinDigits(newDigits);
    setPinError('');

    // Auto-advance focus to next digit
    if (val && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }

    // Auto-verify when all 4 digits are typed
    const fullPin = newDigits.join('');
    if (fullPin.length === 4) {
      verifyPinAndLogin(fullPin);
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasted)) {
      const digits = pasted.split('');
      setPinDigits(digits);
      verifyPinAndLogin(pasted);
    } else {
      toast.error('Pasted text must be a 4-digit numeric PIN');
    }
  };

  const verifyPinAndLogin = async (enteredPin) => {
    if (lockoutStatus.isLocked) {
      const mins = Math.ceil(lockoutStatus.remainingSeconds / 60);
      setPinError(`PIN login locked. Wait ${mins} minute${mins === 1 ? '' : 's'} or use password.`);
      return;
    }

    setLoading(true);
    setPinError('');

    try {
      // 1. Cryptographically verify PIN & decrypt session vault
      const sessionData = await verifyAndUnlockPin(enteredPin);

      if (!sessionData) {
        throw new Error('Could not decrypt session.');
      }

      // 2. Authenticate session
      let user = null;
      if (loginWithSession) {
        user = await loginWithSession(sessionData);
      }

      // 3. Keep backend token alive / refreshed
      if (sessionData.email && sessionData.password) {
        try {
          user = await login(sessionData.email, sessionData.password);
        } catch (e) {
          // If password was changed on server, session token is still valid
        }
      }

      toast.success(`Welcome back, ${user?.name || sessionData.user?.name || 'User'}! 4-Digit PIN verified.`);
      window.location.replace('/dashboard');
    } catch (err) {
      console.error('[PIN Auth]', err);
      const msg = err.message || 'Authentication failed';
      setPinError(msg);
      setPinDigits(['', '', '', '']);
      pinInputRefs[0].current?.focus();

      // Refresh lockout status
      const updatedStatus = getPinLockoutStatus();
      setLockoutStatus(updatedStatus);
      if (updatedStatus.isLocked) {
        setLoginMode('credentials');
        toast.error('Too many incorrect PIN attempts. Locked for 5 minutes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgetDevice = () => {
    removeDevicePinVault();
    setSavedDeviceProfile(null);
    setLoginMode('credentials');
    setPinDigits(['', '', '', '']);
    setPinError('');
    toast.info('Recognized device profile removed. You can sign in with full credentials.');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      
      const sessionData = {
        user: {
          id: user?.id,
          email: email.trim(),
          name: user?.name || user?.full_name || 'Fleet Operator',
          role: user?.role || 'super_admin'
        },
        token: pb.authStore.token || '',
        email: email.trim()
      };

      // If user wants PIN enabled and doesn't have one configured yet, prompt setup
      if (enablePinOnDevice && !isPinConfigured()) {
        setTempAuthSession(sessionData);
        setShowPinSetupModal(true);
        setLoading(false);
        return;
      }

      // If device PIN is already configured, re-encrypt vault with active token
      if (isPinConfigured()) {
        // Keep existing PIN vault updated with new session token
      }

      toast.success('Logged in successfully!');
      window.location.replace('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err?.message || err?.response?.message || '';
      if (msg.includes('pending approval')) {
        setError('Your account is pending approval. Please wait for admin confirmation.');
      } else if (msg.includes('rejected')) {
        setError('Your request has been rejected. Contact administrator.');
      } else {
        setError('Invalid email or password. Please check your login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePinSetup = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(setupPin)) {
      return toast.error('PIN must be exactly 4 numeric digits (e.g. 1234)');
    }
    if (setupPin !== setupPinConfirm) {
      return toast.error('PIN and Confirm PIN do not match');
    }

    try {
      await saveDevicePinVault(setupPin, tempAuthSession);
      toast.success('4-Digit Security PIN configured successfully on this device!');
      setShowPinSetupModal(false);
      window.location.replace('/dashboard');
    } catch (err) {
      toast.error('Failed to save 4-digit PIN: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl z-10">
        <CardHeader className="space-y-2 text-center pb-4 pt-6">
          <div className="mx-auto w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Truck className="w-7 h-7 text-emerald-400 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Jai Bhavani Cargo
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Enterprise Fleet & Logistics Dashboard Sign In
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick PIN Mode for Saved Authorized Device */}
          {loginMode === 'pin' && savedDeviceProfile ? (
            <div className="space-y-4 py-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                    {(savedDeviceProfile.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      {savedDeviceProfile.name}
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-bold">
                        <Smartphone className="w-2.5 h-2.5 mr-0.5" /> Saved Device
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{savedDeviceProfile.email}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForgetDevice}
                  className="text-[10px] text-slate-400 hover:text-rose-400 h-7 px-2"
                  title="Remove device profile"
                >
                  Forget
                </Button>
              </div>

              <div className="space-y-2 text-center">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" /> Enter 4-Digit Security PIN
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPin(!showPin)}
                    className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {showPin ? 'Hide' : 'Peek'}
                  </Button>
                </div>
                
                {pinError && (
                  <p className="text-xs font-medium text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}

                {lockoutStatus.isLocked && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">PIN Temporarily Locked</span>
                      <span>Too many failed attempts. Try again in {Math.ceil(lockoutStatus.remainingSeconds / 60)} minutes or use full password.</span>
                    </div>
                  </div>
                )}

                {/* 4-Digit PIN Input Cells */}
                <div className="flex justify-center gap-3 pt-2" onPaste={handlePinPaste}>
                  {pinDigits.map((digit, idx) => (
                    <Input
                      key={idx}
                      ref={pinInputRefs[idx]}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      disabled={loading || lockoutStatus.isLocked}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(idx, e)}
                      className="w-13 h-14 text-center text-2xl font-black font-mono bg-slate-950 border-emerald-500/30 text-emerald-400 focus:border-emerald-400 rounded-2xl shadow-inner transition-all focus:scale-105"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Enter 4-digit PIN configured for this device.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => verifyPinAndLogin(pinDigits.join(''))}
                  disabled={loading || pinDigits.join('').length < 4 || lockoutStatus.isLocked}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-11 rounded-xl shadow-lg gap-2"
                >
                  {loading ? 'Authenticating PIN...' : 'Verify PIN & Sign In'} <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setLoginMode('credentials')}
                  className="w-full text-xs text-slate-400 hover:text-white"
                >
                  Use Full Email & Password Instead
                </Button>
              </div>
            </div>
          ) : (
            /* Regular Credentials Form Mode */
            <form onSubmit={handleSubmit} className="space-y-3">
              {savedDeviceProfile && !lockoutStatus.isLocked && (
                <div className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-xs mb-2">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Recognized Device Available
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setLoginMode('pin')}
                    className="h-auto p-0 text-emerald-400 font-bold text-xs hover:underline"
                  >
                    Switch to 4-Digit PIN
                  </Button>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jaibhavanicargo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-white/10 text-xs h-10 rounded-xl text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-300">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-white/10 text-xs h-10 rounded-xl text-white font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enablePin"
                  checked={enablePinOnDevice}
                  onChange={(e) => setEnablePinOnDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <Label htmlFor="enablePin" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Enable 4-Digit Quick Sign-In on this device
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-11 rounded-xl shadow-md mt-4"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-white/5 bg-slate-950/40 p-4 rounded-b-3xl">
          <p className="text-[11px] text-slate-400 text-center">
            Need an account?{' '}
            <Link to="/signup-request" className="font-bold text-primary hover:underline">
              Request access from administrator
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Setup 4-Digit Security PIN Modal */}
      <Dialog open={showPinSetupModal} onOpenChange={setShowPinSetupModal}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" /> Setup 4-Digit Quick Security PIN
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a secret 4-digit PIN for 1-tap instant sign in on this device.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCompletePinSetup} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Choose 4-Digit PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4 digits (e.g. 9876)"
                value={setupPin}
                onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-slate-900 border-slate-700 text-center font-mono text-xl tracking-widest text-emerald-400 h-11 rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Confirm 4-Digit PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Re-enter 4 digits"
                value={setupPinConfirm}
                onChange={(e) => setSetupPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-slate-900 border-slate-700 text-center font-mono text-xl tracking-widest text-emerald-400 h-11 rounded-xl"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
              🔒 <strong>Encrypted Device Vault:</strong> Your session credentials will be encrypted with AES-256-GCM using this PIN. No plaintext password is ever stored on this machine.
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPinSetupModal(false);
                  window.location.replace('/dashboard');
                }}
                className="text-xs text-slate-400"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl"
              >
                Save PIN & Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
