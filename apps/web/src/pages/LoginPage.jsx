import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      
      const msg = err.message || '';
      if (msg.includes('pending approval')) {
        setError('Your account is pending approval. Please wait for admin confirmation.');
      } else if (msg.includes('rejected')) {
        setError('Your request has been rejected. Contact administrator.');
      } else if (msg.includes('Failed to authenticate')) {
        setError('Invalid email or password.');
      } else {
        setError(msg || 'An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12 relative overflow-hidden bg-background">
      {/* Backdrop Glows */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[90px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border border-white/10 glassmorphism relative overflow-hidden rounded-3xl z-10">
        {/* Accent top-line border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>

        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-primary/20 hover:rotate-6 transition-transform duration-300">
            <Truck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white font-heading">Staff Portal Login</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Enter your credentials to access the logistics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium text-xs">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@jaibhavanicargo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 font-medium text-xs">Password</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>
 
            <div className="flex items-center space-x-2 py-1">
              <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label
                htmlFor="remember"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
              >
                Remember me for 30 days
              </label>
            </div>
 
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white font-bold" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 bg-slate-950/20 p-5 mt-2 rounded-b-3xl">
          <p className="text-xs text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link to="/signup-request" className="font-semibold text-primary hover:text-primary/80 transition-colors block mt-1">
              Contact administrator to request access
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;