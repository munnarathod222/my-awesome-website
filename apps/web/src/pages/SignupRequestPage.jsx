import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Building2, User, Phone, Mail, FileText, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function SignupRequestPage() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_name: '',
    phone: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific field error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await pb.collection('signup_requests').create({
        ...formData,
        status: 'Pending'
      }, { $autoCancel: false });

      setIsSubmitted(true);
      toast.success('Request submitted successfully');
      setFormData({
        email: '',
        full_name: '',
        company_name: '',
        phone: '',
        reason: ''
      });
    } catch (err) {
      console.error("Signup request failed", err);
      const errObj = err.response?.data;
      if (errObj?.email?.code === 'validation_not_unique') {
        toast.error('A request with this email already exists.');
        setErrors({ email: 'Email already exists' });
      } else {
        toast.error(err.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 pt-20">
        <Helmet><title>Request Submitted | Logistics Management</title></Helmet>
        <Card className="max-w-md w-full text-center shadow-lg border-border p-6 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl mb-2">Request Submitted</CardTitle>
          <CardDescription className="text-base mb-8">
            Your account request has been successfully submitted. An administrator will review your details and contact you shortly.
          </CardDescription>
          <Button asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-24 px-4 flex justify-center animate-in fade-in duration-500">
      <Helmet>
        <title>Request Account Access | Logistics Management</title>
      </Helmet>

      <div className="max-w-xl w-full">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/login"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Login</Link>
        </Button>

        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-2 border-b border-border/50 pb-6 bg-card rounded-t-xl">
            <CardTitle className="text-2xl font-bold tracking-tight">Request Account Access</CardTitle>
            <CardDescription className="text-base">
              Fill out this form to request access to the staff portal. Approvals are typically processed within 24-48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    placeholder="John Doe" 
                    className="pl-9 bg-background text-foreground"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      className="pl-9 bg-background text-foreground"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="pl-9 bg-background text-foreground"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company / Department</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="company_name" 
                    name="company_name" 
                    placeholder="Logistics Div." 
                    className="pl-9 bg-background text-foreground"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Access</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea 
                    id="reason" 
                    name="reason" 
                    placeholder="Briefly describe why you need access to the portal..." 
                    className="pl-9 min-h-[100px] bg-background text-foreground"
                    value={formData.reason}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                {loading ? 'Submitting Request...' : <><Send className="w-4 h-4 mr-2" /> Submit Request</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}