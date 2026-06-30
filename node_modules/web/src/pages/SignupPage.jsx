import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePassword } from '@/lib/validators.js';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pwdValidation, setPwdValidation] = useState({ isValid: false, strength: 0 });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (id === 'password') {
      setPwdValidation(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (!pwdValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12 relative overflow-hidden bg-background">
      {/* Backdrop Glows */}
      <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[90px] pointer-events-none" />

      <Card className="w-full max-w-lg shadow-2xl border border-white/10 glassmorphism relative overflow-hidden rounded-3xl z-10 animate-in fade-in duration-500">
        {/* Accent top-line border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>

        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-secondary/20 hover:rotate-6 transition-transform duration-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white font-heading">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Join Jai Bhavani Cargo staff portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="full_name" className="text-gray-300 font-medium text-xs">Full Name</Label>
                <Input 
                  id="full_name" 
                  required 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="phone_number" className="text-gray-300 font-medium text-xs">Phone Number</Label>
                <Input 
                  id="phone_number" 
                  required 
                  type="tel" 
                  value={formData.phone_number} 
                  onChange={handleChange} 
                  className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium text-xs">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium text-xs">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1 mt-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full ${
                          level <= pwdValidation.strength 
                            ? (pwdValidation.strength < 3 ? 'bg-destructive' : pwdValidation.strength < 5 ? 'bg-warning' : 'bg-success')
                            : 'bg-muted'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Must contain: 8+ chars, uppercase, lowercase, number, special char.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-gray-300 font-medium text-xs">Confirm Password</Label>
              <Input 
                id="passwordConfirm" 
                type="password" 
                required 
                value={formData.passwordConfirm} 
                onChange={handleChange} 
                className="bg-slate-900/50 border-white/15 text-white rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200" 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white font-bold" 
              disabled={loading || !pwdValidation.isValid}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center text-xs text-muted-foreground mt-5 pt-4 border-t border-white/5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;