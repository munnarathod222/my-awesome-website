import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    password: '',
    passwordConfirm: '',
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('No invitation token provided in the URL.');
        setLoading(false);
        return;
      }

      try {
        const record = await pb.collection('invitations').getFirstListItem(`invitation_token="${token}"`, {
          $autoCancel: false
        });

        // Validation checks
        if (record.status !== 'pending') {
          setError(`This invitation has already been ${record.status}.`);
          setLoading(false);
          return;
        }

        if (new Date() > new Date(record.expires_at)) {
          setError('This invitation has expired.');
          setLoading(false);
          return;
        }

        setInvitation(record);
      } catch (err) {
        console.error('Fetch invitation error:', err);
        setError('Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create the user
      await pb.collection('users').create({
        email: invitation.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        full_name: formData.full_name,
        role: invitation.role,
        status: 'active',
        emailVisibility: true,
      }, { $autoCancel: false });

      // 2. Update the invitation status
      await pb.collection('invitations').update(invitation.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      }, { $autoCancel: false });

      // 3. Log the user in
      await login(invitation.email, formData.password);

      toast.success('Account created successfully!', {
        description: 'Welcome to the platform.',
      });

      // 4. Redirect to dashboard
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('Account creation error:', err);
      if (err.message.includes('email')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
      toast.error('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a]">
        <Helmet><title>Loading Invitation...</title></Helmet>
        <div className="flex flex-col items-center text-primary">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
        <Helmet><title>Invalid Invitation</title></Helmet>
        
        {/* Background visual flair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/10 rounded-full blur-[100px] pointer-events-none"></div>

        <Card className="max-w-md w-full relative z-10 shadow-2xl border-border bg-card">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Invitation Error</CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              {error || 'Unable to process this invitation.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild className="w-full h-12 text-base">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      <Helmet><title>Accept Invitation</title></Helmet>
      
      {/* Background visual flair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Card className="max-w-lg w-full relative z-10 shadow-2xl border-border bg-card">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">Accept Invitation</CardTitle>
              <CardDescription className="text-sm mt-1 text-muted-foreground">
                Set up your account to get started.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="bg-muted/40 rounded-xl p-4 mb-6 border border-border/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{invitation.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium text-foreground capitalize">{invitation.role}</span>
            </div>
            {invitation.invited_by_name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invited By:</span>
                <span className="font-medium text-foreground">{invitation.invited_by_name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium text-foreground">{format(new Date(invitation.expires_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                className="bg-background text-foreground h-11"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="bg-background text-foreground h-11"
                required
                minLength={8}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="Must match password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="bg-background text-foreground h-11"
                required
                minLength={8}
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base mt-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}