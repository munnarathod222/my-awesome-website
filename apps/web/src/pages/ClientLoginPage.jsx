import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Mail, ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Authenticate with global AuthContext login
      const user = await login(email.trim(), password);

      if (user) {
        toast.success(`Welcome to Client Portal, ${user.name || 'Client'}!`);
        navigate('/client-portal', { replace: true });
      }
    } catch (err) {
      console.error('[ClientLoginPage] Auth error:', err);
      toast.error(err.message || 'Invalid client credentials. Please check your login details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Client Portal Login | Jai Bhavani Cargo</title>
      </Helmet>

      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-500">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/5">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Client Portal Sign In</h1>
            <p className="text-sm text-muted-foreground">Access your freight shipments, POD documents, and invoice history</p>
          </div>

          <Card className="border-border bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl">
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg">Client Credentials</CardTitle>
                <CardDescription>Enter your registered client email and portal password</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="client-email"
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
                    <Label htmlFor="client-password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-emerald-400 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="client-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Only authorized client credentials linked by Jai Bhavani Cargo admin can access.</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl shadow-lg shadow-emerald-600/25 transition-all gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Client Portal <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2 border-t border-border/50 w-full">
                  <p className="text-xs text-muted-foreground">
                    Admin or Operational Staff?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                      Go to Admin Login
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
