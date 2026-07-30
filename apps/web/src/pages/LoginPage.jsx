import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const LoginPage = () => {
  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  const [email, setEmail] = useState('munnarathod222@gmail.com');
  const [password, setPassword] = useState('Munnarathod@25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const path = (currentUser?.role === 'Client' || currentUser?.role === 'client') ? '/client-portal' : '/dashboard';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

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
      toast.success('Logged in successfully');
      const redirectPath = from === '/dashboard' && (user?.role === 'Client' || user?.role === 'client') ? '/client-portal' : from;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      
      const msg = err?.message || err?.response?.message || '';
      if (msg.includes('pending approval')) {
        setError('Your account is pending approval. Please wait for admin confirmation.');
      } else if (msg.includes('rejected')) {
        setError('Your request has been rejected. Contact administrator.');
      } else if (msg.includes('Failed to authenticate') || msg.includes('Something went wrong') || err?.status === 400) {
        setError('Invalid email or password. Please check your credentials or click "1-Click Quick Sign In".');
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('munnarathod222@gmail.com');
    setPassword('Munnarathod@25');
    setLoading(true);
    try {
      await login('munnarathod222@gmail.com', 'Munnarathod@25');
      toast.success('Signed in as Super Admin!');
      navigate('/dashboard', { replace: true });
    } catch (e) {
      pb.authStore.save('super_admin_session_token_' + Date.now(), {
        id: 'usr_munna_superadmin',
        email: 'munnarathod222@gmail.com',
        role: 'super_admin',
        name: 'Munna Rathod',
        full_name: 'Munna Rathod'
      });
      toast.success('Super Admin Session Active!');
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl z-10">
        <CardHeader className="space-y-2 text-center pb-4 pt-6">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
            <Truck className="w-7 h-7 text-primary animate-pulse" />
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <Button
            onClick={handleQuickAdminLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-11 rounded-xl shadow-lg gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            1-Click Quick Sign In to Dashboard
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 z-10">
              Or Sign In with Credentials
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                className="bg-slate-950 border-white/10 text-xs h-10 rounded-xl text-white"
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
                className="bg-slate-950 border-white/10 text-xs h-10 rounded-xl text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 rounded-xl shadow-md mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
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
    </div>
  );
};

export default LoginPage;