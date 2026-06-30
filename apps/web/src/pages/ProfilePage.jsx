import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Phone, Mail, Shield, Calendar, Upload, MapPin, Briefcase, Building2, X, Globe, Building, UploadCloud } from 'lucide-react';
import { validateEmail } from '@/lib/validators.js';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import ChangePasswordModal from '@/components/ChangePasswordModal.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchCompanySettings as refreshDownloadCache } from '@/lib/downloadUtils.js';

const ProfilePage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  
  // Modes
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form State
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    company_name: '',
    job_title: '',
    department: '',
    status: 'active',
    profile_picture: null,
    previewUrl: ''
  });
  
  const [touched, setTouched] = useState({});

  // Company Settings States
  const companyLogoInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [companyFormData, setCompanyFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_gstin: ''
  });

  const fetchCompanySettings = async () => {
    try {
      const record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
      setCompanySettings(record);
      setCompanyFormData({
        company_name: record.company_name || '',
        company_address: record.company_address || '',
        company_phone: record.company_phone || '',
        company_email: record.company_email || '',
        company_website: record.company_website || '',
        company_gstin: record.company_gstin || ''
      });
      if (record.company_logo) {
        setCompanyLogoPreview(pb.files.getUrl(record, record.company_logo));
      } else {
        setCompanyLogoPreview('');
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const handleCompanySave = async (e) => {
    e.preventDefault();
    if (!companyFormData.company_name) {
      return toast.error('Company Name is required');
    }
    setIsSavingCompany(true);
    try {
      const payload = new FormData();
      payload.append('company_name', companyFormData.company_name);
      payload.append('company_address', companyFormData.company_address);
      payload.append('company_phone', companyFormData.company_phone);
      payload.append('company_email', companyFormData.company_email);
      payload.append('company_website', companyFormData.company_website);
      payload.append('company_gstin', companyFormData.company_gstin);
      
      if (companyLogoFile instanceof File) {
        payload.append('company_logo', companyLogoFile);
      }

      await pb.collection('company_settings').update('companysettings', payload, { $autoCancel: false });
      
      // Refresh download cache for PDF branding
      await refreshDownloadCache();
      
      // Reload UI state
      await fetchCompanySettings();
      
      setCompanyLogoFile(null);
      toast.success('Company settings saved successfully');
    } catch (err) {
      console.error('Failed to save company settings:', err);
      toast.error('Failed to save company settings');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      return toast.error('Invalid image format. Use JPG, PNG, GIF, or WEBP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be less than 5MB');
    }
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
  };

  // Initialize form data
  useEffect(() => {
    if (currentUser && !isEditing) {
      // Handle both name and full_name for backward compatibility with schema
      const rawName = currentUser.full_name || currentUser.name || '';
      const nameParts = rawName.split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      
      // Load dummy fields from local storage to persist them across sessions
      const LSTORAGE_KEY = `user_dummy_profile_${currentUser.id}`;
      const savedExtraData = JSON.parse(localStorage.getItem(LSTORAGE_KEY) || '{}');
      
      // Look for either profile_picture or avatar based on schema
      const avatarFile = currentUser.profile_picture || currentUser.avatar;
      
      setFormData({
        first_name: first,
        last_name: last,
        email: currentUser.email || '',
        phone: currentUser.phone_number || '',
        address: savedExtraData.address || '',
        city: savedExtraData.city || '',
        state: savedExtraData.state || '',
        postal_code: savedExtraData.postal_code || '',
        company_name: savedExtraData.company_name || '',
        job_title: savedExtraData.job_title || '',
        department: savedExtraData.department || '',
        status: currentUser.status || 'active',
        profile_picture: null,
        previewUrl: avatarFile ? pb.files.getUrl(currentUser, avatarFile) : ''
      });
      setHasChanges(false);
      setTouched({});
    }
  }, [currentUser, isEditing]);

  const getInitials = (first, last) => {
    if (!first && !last) return 'U';
    return `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase();
  };

  // Validation
  const formErrors = useMemo(() => {
    const errs = {};
    if (!formData.first_name || formData.first_name.trim().length < 2) {
      errs.first_name = "First name must be at least 2 characters";
    }
    if (!formData.last_name || formData.last_name.trim().length < 2) {
      errs.last_name = "Last name must be at least 2 characters";
    }
    if (!formData.email || !validateEmail(formData.email)) {
      errs.email = "Valid email is required";
    }
    if (!formData.phone || formData.phone.trim().length === 0) {
      errs.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errs.phone = "Invalid phone format";
    }
    if (!formData.status || !['active', 'inactive'].includes(formData.status)) {
      errs.status = "Status must be active or inactive";
    }
    return errs;
  }, [formData]);

  const isFormValid = Object.keys(formErrors).length === 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Invalid image format. Use JPG, PNG, GIF, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    setFormData(prev => ({
      ...prev, 
      profile_picture: file, 
      previewUrl: URL.createObjectURL(file)
    }));
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Touch all fields to show any hidden errors
    const allTouched = Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {});
    setTouched(allTouched);

    if (!isFormValid) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    setIsSaving(true);
    const userIdBefore = currentUser?.id;
    console.log('[ProfilePage] Attempting update for user ID:', userIdBefore);
    
    try {
      const payload = new FormData();
      const newFullName = `${formData.first_name} ${formData.last_name}`.trim();
      
      // Update both name fields to prevent data loss or UI mismatch
      payload.append('full_name', newFullName);
      payload.append('name', newFullName);
      
      // Append other critical schema fields
      payload.append('email', formData.email);
      payload.append('phone_number', formData.phone || '');
      
      const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
      payload.append('status', isAdmin ? formData.status : (currentUser?.status || 'active'));
      
      if (formData.profile_picture instanceof File) {
        // Update both image fields to prevent data loss or UI mismatch
        payload.append('profile_picture', formData.profile_picture);
        payload.append('avatar', formData.profile_picture);
      }

      console.log('[ProfilePage] Payload being sent:');
      for (let [key, value] of payload.entries()) {
        console.log(`- ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }

      // CRITICAL: Ensure we use UPDATE on the specific user ID, not CREATE
      await pb.collection('users').update(currentUser.id, payload, { $autoCancel: false });
      
      // CRITICAL: Fetch a fresh copy of the record from the database to ensure we have ALL fields
      const freshUser = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
      
      console.log('[ProfilePage] Update successful. User ID after fetch:', freshUser.id);
      
      if (userIdBefore !== freshUser.id) {
        console.error('[ProfilePage] ALARM: User ID changed during update!', { before: userIdBefore, after: freshUser.id });
      }

      // CRITICAL: Update the global PocketBase AuthStore explicitly so the session isn't lost on reload
      pb.authStore.save(pb.authStore.token, freshUser);

      // Save extra dummy fields to localStorage to persist in UI (since they are not in the DB schema)
      const LSTORAGE_KEY = `user_dummy_profile_${currentUser.id}`;
      localStorage.setItem(LSTORAGE_KEY, JSON.stringify({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        company_name: formData.company_name,
        job_title: formData.job_title,
        department: formData.department
      }));

      // Update the AuthContext with the guaranteed fresh data
      setCurrentUser(freshUser);
      toast.success('Profile updated successfully', { duration: 3000 });
      setIsEditing(false);
      setHasChanges(false);
      
      console.log('[ProfilePage] AuthStore token still valid?', pb.authStore.isValid);
    } catch (err) {
      console.error('[ProfilePage] Failed to save profile details:');
      console.error('- Status Code:', err?.status || err?.response?.code);
      console.error('- Error Data:', err?.response?.data || err?.data);
      console.error('- Error Message:', err?.message);

      const status = err?.status || err?.response?.code;
      const responseData = err?.response?.data || err?.data || {};

      let errorMessage = 'Failed to save profile. Please try again.';

      if (status === 400) {
        // Extract specific validation errors from PocketBase response
        const fieldErrors = Object.entries(responseData)
          .map(([field, errorInfo]) => `${field}: ${errorInfo.message}`)
          .join(', ');
        errorMessage = fieldErrors ? `Validation error: ${fieldErrors}` : 'Validation failed. Please check your inputs.';
      } else if (status === 401) {
        errorMessage = 'Unauthorized. Your session may have expired.';
      } else if (status === 403) {
        errorMessage = 'Forbidden. You do not have permission to update this profile.';
      } else if (status === 404) {
        errorMessage = 'User record not found.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Discard changes?')) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Card className="shadow-lg border-none rounded-2xl bg-card">
          <CardHeader className="border-b border-border/50 pb-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Edit Profile</CardTitle>
                <CardDescription className="text-base mt-1">Update your personal and professional information.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form id="profile-form" onSubmit={handleSave} className="space-y-8">
              
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div 
                  className="relative w-28 h-28 rounded-xl overflow-hidden cursor-pointer group border-4 border-muted flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.previewUrl ? (
                    <img src={formData.previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-4xl text-primary font-semibold">
                      {getInitials(formData.first_name, formData.last_name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Upload</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-lg">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-3">JPG, PNG, GIF or WEBP. Max size 5MB.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border/50 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="first_name"
                      value={formData.first_name} 
                      onChange={e => handleChange('first_name', e.target.value)} 
                      onBlur={() => handleBlur('first_name')}
                      className={cn("bg-background", touched.first_name && formErrors.first_name && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {touched.first_name && formErrors.first_name && <p className="text-xs text-destructive mt-1">{formErrors.first_name}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="last_name"
                      value={formData.last_name} 
                      onChange={e => handleChange('last_name', e.target.value)} 
                      onBlur={() => handleBlur('last_name')}
                      className={cn("bg-background", touched.last_name && formErrors.last_name && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {touched.last_name && formErrors.last_name && <p className="text-xs text-destructive mt-1">{formErrors.last_name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email} 
                      onChange={e => handleChange('email', e.target.value)} 
                      onBlur={() => handleBlur('email')}
                      className={cn("bg-background", touched.email && formErrors.email && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {touched.email && formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={formData.phone} 
                      onChange={e => handleChange('phone', e.target.value)} 
                      onBlur={() => handleBlur('phone')}
                      className={cn("bg-background", touched.phone && formErrors.phone && 'border-destructive focus-visible:ring-destructive')}
                    />
                    {touched.phone && formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border/50 pb-2">Professional & Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input id="company_name" value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={formData.department} onChange={e => handleChange('department', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input id="job_title" value={formData.job_title} onChange={e => handleChange('job_title', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Account Status <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val) => handleChange('status', val)}
                      disabled={currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin'}
                    >
                      <SelectTrigger id="status" className={cn("bg-background", touched.status && formErrors.status && 'border-destructive focus-visible:ring-destructive')}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.status && formErrors.status && <p className="text-xs text-destructive mt-1">{formErrors.status}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border/50 pb-2">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" value={formData.state} onChange={e => handleChange('state', e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" value={formData.postal_code} onChange={e => handleChange('postal_code', e.target.value)} className="bg-background" />
                  </div>
                </div>
              </div>

            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border/50 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="profile-form"
              disabled={isSaving || !isFormValid}
              className="min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // VIEW MODE
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const renderProfileView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 shadow-sm border-none rounded-2xl bg-card">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-muted mb-5">
               {formData.previewUrl ? (
                  <img src={formData.previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-4xl text-primary font-semibold">
                    {getInitials(formData.first_name, formData.last_name)}
                  </div>
                )}
            </div>
            
            <h2 className="text-xl font-bold">{currentUser?.full_name || currentUser?.name || 'User'}</h2>
            <p className="text-muted-foreground mb-4">{currentUser?.email}</p>
            
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold bg-secondary/10 text-secondary border-secondary/20 capitalize mb-6">
              {currentUser?.role?.replace('_', ' ')}
            </div>
            
            <div className="w-full pt-6 border-t border-border/50 text-left space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><Building2 className="w-3 h-3 mr-1" /> Company</p>
                <p className="font-medium">{formData.company_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><Briefcase className="w-3 h-3 mr-1" /> Department</p>
                <p className="font-medium">{formData.department || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><Shield className="w-3 h-3 mr-1" /> Status</p>
                <p className="font-medium capitalize">{currentUser?.status || 'Active'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-none rounded-2xl bg-card">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{currentUser?.full_name || currentUser?.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate pr-2 w-full">
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="font-semibold truncate">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="font-semibold">{currentUser?.phone_number || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                    <p className="font-semibold">{formData.job_title || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none rounded-2xl bg-card">
            <CardHeader>
              <CardTitle>Location & System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50 sm:col-span-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-semibold">
                      {[formData.address, formData.city, formData.state, formData.postal_code].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Role</p>
                    <p className="font-semibold capitalize">{currentUser?.role?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                    <p className="font-semibold">
                      {currentUser?.created ? format(new Date(currentUser.created), 'PPP') : '-'}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    );
  };

  const renderCompanySettingsView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
        {/* Company Logo Preview Card */}
        <Card className="md:col-span-1 shadow-sm border-none rounded-2xl bg-card">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-xl overflow-hidden border-4 border-muted mb-5 bg-muted/20 flex items-center justify-center relative group shadow-inner">
              {companyLogoPreview ? (
                <img src={companyLogoPreview} alt="Company Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building className="w-16 h-16 text-muted-foreground/40" />
              )}
              <div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-lg"
                onClick={() => companyLogoInputRef.current?.click()}
              >
                <UploadCloud className="w-8 h-8 mb-1" />
                <span className="text-xs font-semibold">Upload Logo</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold">{companyFormData.company_name || 'Jai Bhavani Cargo'}</h2>
            <p className="text-xs text-muted-foreground mt-1">Corporate Identity Logo</p>
            
            <input 
              type="file" 
              ref={companyLogoInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              onChange={handleCompanyLogoChange} 
            />
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-4 rounded-xl"
              onClick={() => companyLogoInputRef.current?.click()}
            >
              Change Logo
            </Button>
          </CardContent>
        </Card>

        {/* Company Settings Form */}
        <Card className="md:col-span-2 shadow-sm border-none rounded-2xl bg-card">
          <CardHeader>
            <CardTitle>Company Profile Details</CardTitle>
            <CardDescription>Configure branding metadata for invoices, quotes, payslips, and agreements.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="company-settings-form" onSubmit={handleCompanySave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name_input">Company Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="company_name_input"
                    value={companyFormData.company_name} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="bg-background"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="company_gstin_input">GSTIN</Label>
                  <Input 
                    id="company_gstin_input"
                    value={companyFormData.company_gstin} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_gstin: e.target.value }))}
                    className="bg-background"
                    placeholder="e.g. 36AAAAA1111A1Z1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company_phone_input">Contact Phone</Label>
                  <Input 
                    id="company_phone_input"
                    value={companyFormData.company_phone} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                    className="bg-background"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company_email_input">Contact Email</Label>
                  <Input 
                    id="company_email_input"
                    value={companyFormData.company_email} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_email: e.target.value }))}
                    type="email"
                    className="bg-background"
                    placeholder="e.g. billing@jbcargo.com"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="company_website_input">Corporate Website</Label>
                  <Input 
                    id="company_website_input"
                    value={companyFormData.company_website} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_website: e.target.value }))}
                    className="bg-background"
                    placeholder="e.g. www.jaibhavanicargo.com"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="company_address_input">Registered Address</Label>
                  <Input 
                    id="company_address_input"
                    value={companyFormData.company_address} 
                    onChange={e => setCompanyFormData(prev => ({ ...prev, company_address: e.target.value }))}
                    className="bg-background"
                    placeholder="Full street address..."
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 pt-6">
            <Button 
              type="submit" 
              form="company-settings-form"
              disabled={isSavingCompany}
              className="min-w-[140px] rounded-xl"
            >
              {isSavingCompany ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and company branding details.</p>
        </div>
        <div className="flex items-center gap-3">
          <ChangePasswordModal />
          {activeTab === 'profile' && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto inline-flex h-12 rounded-xl border border-border/30">
            <TabsTrigger value="profile" className="flex-1 sm:px-8 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <User className="w-4 h-4" /> Personal Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex-1 sm:px-8 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <Building className="w-4 h-4" /> Company Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 m-0 outline-none">
            {renderProfileView()}
          </TabsContent>

          <TabsContent value="company" className="space-y-6 m-0 outline-none">
            {renderCompanySettingsView()}
          </TabsContent>
        </Tabs>
      ) : (
        renderProfileView()
      )}
    </div>
  );
};

// Extracted SaveIcon for cleaner button
const SaveIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export default ProfilePage;