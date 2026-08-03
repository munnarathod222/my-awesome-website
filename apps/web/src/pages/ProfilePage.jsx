import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Phone, Mail, Shield, Calendar, Upload, MapPin, Briefcase, Building2, X, Globe, Building, UploadCloud, RefreshCw, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { validateEmail } from '@/lib/validators.js';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import ChangePasswordModal from '@/components/ChangePasswordModal.jsx';
import ChangeEmailModal from '@/components/ChangeEmailModal.jsx';
import SignaturePadModal from '@/components/SignaturePadModal.jsx';
import BandwidthTrackerCard from '@/components/BandwidthTrackerCard.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchCompanySettings as refreshDownloadCache } from '@/lib/downloadUtils.js';
import { exportEnterpriseBackupJSON } from '@/lib/backupUtils.js';
import { PenTool, Activity, FileJson, Download } from 'lucide-react';

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
  const companySignatureInputRef = useRef(null);
  const [isDrawPadOpen, setIsDrawPadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [companySignatureFile, setCompanySignatureFile] = useState(null);
  const [companySignaturePreview, setCompanySignaturePreview] = useState('');
  const [companyFormData, setCompanyFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_gstin: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    signatory_name: '',
    signatory_title: ''
  });

  // Quick PIN Settings State
  const [deviceProfile, setDeviceProfile] = useState(null);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('jbc_device_pin_profile');
    if (stored) {
      try {
        setDeviceProfile(JSON.parse(stored));
      } catch (e) {}
    } else if (currentUser) {
      setDeviceProfile({
        id: currentUser?.id,
        email: currentUser?.email,
        name: currentUser?.full_name || currentUser?.name || 'User',
        role: currentUser?.role || 'user',
        pin: '2525'
      });
    }
  }, [currentUser]);

  const handleUpdateQuickPin = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPinInput)) {
      return toast.error('PIN must be exactly 4 numeric digits (e.g. 9876)');
    }
    if (newPinInput !== confirmPinInput) {
      return toast.error('New PIN and Confirm PIN do not match');
    }

    setIsUpdatingPin(true);
    try {
      const updatedProfile = {
        ...(deviceProfile || {}),
        id: currentUser?.id || 'usr_saved',
        email: currentUser?.email || 'admin@jaibhavanicargo.com',
        name: currentUser?.full_name || currentUser?.name || 'User',
        role: currentUser?.role || 'admin',
        pin: newPinInput
      };
      localStorage.setItem('jbc_device_pin_profile', JSON.stringify(updatedProfile));
      setDeviceProfile(updatedProfile);

      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      toast.success(`4-Digit Quick Security PIN updated successfully to ${newPinInput}!`);
    } catch (err) {
      toast.error('Failed to update 4-digit PIN');
    } finally {
      setIsUpdatingPin(false);
    }
  };

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
        company_gstin: record.company_gstin || '',
        bank_name: record.bank_name || '',
        account_name: record.account_name || '',
        account_number: record.account_number || '',
        ifsc_code: record.ifsc_code || '',
        branch_name: record.branch_name || '',
        signatory_name: record.signatory_name || localStorage.getItem('jbc_signatory_name') || '',
        signatory_title: record.signatory_title || localStorage.getItem('jbc_signatory_title') || ''
      });
      if (record.company_logo) {
        setCompanyLogoPreview(pb.files.getUrl(record, record.company_logo));
      } else {
        setCompanyLogoPreview('');
      }

      if (record.e_signature) {
        setCompanySignaturePreview(pb.files.getUrl(record, record.e_signature));
      } else {
        const localSig = localStorage.getItem('jbc_e_signature');
        setCompanySignaturePreview(localSig || '');
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const [backupStatus, setBackupStatus] = useState(null);
  const [isLoadingBackupStatus, setIsLoadingBackupStatus] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);

  const fetchBackupStatus = async () => {
    setIsLoadingBackupStatus(true);
    try {
      const res = await fetch('/api/backup/status');
      if (!res.ok) throw new Error('Failed to load backup status');
      const data = await res.json();
      if (data.success) {
        setBackupStatus(data);
      } else {
        setBackupStatus(null);
        toast.error(data.message || 'No backup found');
      }
    } catch (error) {
      console.error('Error fetching backup status:', error);
      toast.error(error.message || 'Failed to fetch backup status');
    } finally {
      setIsLoadingBackupStatus(false);
    }
  };

  const [localBackups, setLocalBackups] = useState([]);
  const [isLoadingLocalBackups, setIsLoadingLocalBackups] = useState(false);
  const [isRestoringLocalBackup, setIsRestoringLocalBackup] = useState(false);

  const fetchLocalBackups = async () => {
    setIsLoadingLocalBackups(true);
    try {
      const res = await fetch('/api/backup/list-local');
      if (!res.ok) throw new Error('Failed to load local backups');
      const data = await res.json();
      if (data.success) {
        setLocalBackups(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching local backups:', error);
    } finally {
      setIsLoadingLocalBackups(false);
    }
  };

  const handleRestoreLocalFile = async (filename) => {
    const confirmRestore = window.confirm(
      `⚠️ WARNING: Restoring the backup file "${filename}" will completely overwrite your current live database. This cannot be undone! Are you sure you want to proceed?`
    );
    if (!confirmRestore) return;

    setIsRestoringLocalBackup(true);
    const toastId = toast.loading(`Rolling back database to ${filename} and restarting system...`);
    try {
      const res = await fetch('/api/backup/restore-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Database rolled back successfully!', { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to roll back database');
      }
    } catch (error) {
      console.error('Error rolling back database:', error);
      toast.error(error.message || 'Error rolling back database', { id: toastId });
    } finally {
      setIsRestoringLocalBackup(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackupStatus();
      fetchLocalBackups();
    }
  }, [activeTab]);

  const handleManualBackup = async () => {
    setIsTriggeringBackup(true);
    try {
      const res = await fetch('/api/backup/trigger', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Database backup completed successfully!');
        fetchBackupStatus();
      } else {
        throw new Error(data.error || 'Failed to trigger backup');
      }
    } catch (error) {
      console.error('Error triggering manual backup:', error);
      toast.error(error.message || 'Failed to complete database backup');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const handleDownloadLocalBackup = () => {
    window.open('/api/backup/download', '_blank');
  };

  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  const handleUploadLocalBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }

    const confirmRestore = window.confirm(
      "⚠️ WARNING: Restoring a local backup will completely overwrite your current database. This cannot be undone! Are you sure you want to proceed?"
    );
    if (!confirmRestore) {
      e.target.value = null;
      return;
    }

    setIsRestoringBackup(true);
    const toastId = toast.loading('Restoring database backup and restarting system...');
    try {
      const formData = new FormData();
      formData.append('backupFile', file);

      const res = await fetch('/api/backup/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Database restored successfully!', { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to restore database backup');
      }
    } catch (error) {
      console.error('Error uploading database backup:', error);
      toast.error(error.message || 'Error restoring database backup', { id: toastId });
    } finally {
      setIsRestoringBackup(false);
      e.target.value = null;
    }
  };

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
      payload.append('bank_name', companyFormData.bank_name);
      payload.append('account_name', companyFormData.account_name);
      payload.append('account_number', companyFormData.account_number);
      payload.append('ifsc_code', companyFormData.ifsc_code);
      payload.append('branch_name', companyFormData.branch_name);
      payload.append('signatory_name', companyFormData.signatory_name || '');
      payload.append('signatory_title', companyFormData.signatory_title || '');

      localStorage.setItem('jbc_signatory_name', companyFormData.signatory_name || '');
      localStorage.setItem('jbc_signatory_title', companyFormData.signatory_title || '');
      
      if (companyLogoFile instanceof File) {
        payload.append('company_logo', companyLogoFile);
      }

      if (companySignatureFile instanceof File) {
        payload.append('e_signature', companySignatureFile);
      } else if (typeof companySignaturePreview === 'string' && companySignaturePreview.startsWith('data:image')) {
        localStorage.setItem('jbc_e_signature', companySignaturePreview);
      }

      await pb.collection('company_settings').update('companysettings', payload, { $autoCancel: false });
      
      // Refresh download cache for PDF branding
      await refreshDownloadCache();
      
      // Reload UI state
      await fetchCompanySettings();
      
      setCompanyLogoFile(null);
      setCompanySignatureFile(null);
      toast.success('Company settings & E-Signature saved successfully');
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

  const handleCompanySignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      return toast.error('Invalid signature format. Use JPG, PNG, GIF, or WEBP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Signature size must be less than 5MB');
    }
    setCompanySignatureFile(file);
    const blobUrl = URL.createObjectURL(file);
    setCompanySignaturePreview(blobUrl);
    localStorage.setItem('jbc_e_signature', blobUrl);
  };

  const handleDrawnSignatureSave = (dataUrl) => {
    setCompanySignatureFile(null);
    setCompanySignaturePreview(dataUrl);
    localStorage.setItem('jbc_e_signature', dataUrl);
  };

  const handleRemoveSignature = () => {
    setCompanySignatureFile(null);
    setCompanySignaturePreview('');
    localStorage.removeItem('jbc_e_signature');
  };

  // Initialize form data
  useEffect(() => {
    if (currentUser && !isEditing) {
      // Handle both name and full_name for backward compatibility with schema
      const rawName = currentUser.full_name || currentUser.name || '';
      const nameParts = (rawName || '').split(' ');
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
                      disabled
                      className="bg-muted/40 border-border/50 text-muted-foreground select-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      To change your login email address, use the secure <strong>Change Email</strong> setting at the top right of this page.
                    </p>
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

          {/* 4-Digit Quick PIN Device Security Card */}
          <Card className="shadow-sm border-none rounded-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" /> Change 4-Digit Quick Security PIN
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Configure your 4-digit PIN for 1-tap instant sign in on recognized devices.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono font-bold">
                Active PIN: {deviceProfile?.pin || '2525'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateQuickPin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="curr_pin" className="text-xs font-bold text-muted-foreground">
                      Current 4-Digit PIN
                    </Label>
                    <Input
                      id="curr_pin"
                      type="password"
                      maxLength={4}
                      placeholder="e.g. 2525"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                      className="font-mono text-center font-bold tracking-widest text-emerald-400 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new_pin" className="text-xs font-bold text-muted-foreground">
                      New 4-Digit PIN *
                    </Label>
                    <Input
                      id="new_pin"
                      type="password"
                      maxLength={4}
                      placeholder="e.g. 9876"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      className="font-mono text-center font-bold tracking-widest text-emerald-400 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conf_pin" className="text-xs font-bold text-muted-foreground">
                      Confirm New PIN *
                    </Label>
                    <Input
                      id="conf_pin"
                      type="password"
                      maxLength={4}
                      placeholder="e.g. 9876"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      className="font-mono text-center font-bold tracking-widest text-emerald-400 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingPin || newPinInput.length < 4 || confirmPinInput.length < 4}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-5 h-10 shadow-md"
                  >
                    {isUpdatingPin ? 'Updating PIN...' : 'Update 4-Digit Security PIN'}
                  </Button>
                </div>
              </form>
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

              {/* Bank Details Section for Invoices & Quotes */}
              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Company Bank Account Details</h3>
                    <p className="text-xs text-muted-foreground">These details will be automatically printed on all PDF Invoices and Quotes for client payments.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank_name_input">Bank Name</Label>
                    <Input 
                      id="bank_name_input"
                      value={companyFormData.bank_name} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                      className="bg-background"
                      placeholder="e.g. HDFC Bank / ICICI Bank"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="account_name_input">Account Holder Name</Label>
                    <Input 
                      id="account_name_input"
                      value={companyFormData.account_name} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, account_name: e.target.value }))}
                      className="bg-background"
                      placeholder="e.g. JAI BHAVANI CARGO"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="account_number_input">Account Number</Label>
                    <Input 
                      id="account_number_input"
                      value={companyFormData.account_number} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, account_number: e.target.value }))}
                      className="bg-background font-mono"
                      placeholder="e.g. 50200087654321"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ifsc_code_input">IFSC Code</Label>
                    <Input 
                      id="ifsc_code_input"
                      value={companyFormData.ifsc_code} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                      className="bg-background font-mono uppercase"
                      placeholder="e.g. HDFC0000123"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="branch_name_input">Branch / UPI ID / Payment Notes</Label>
                    <Input 
                      id="branch_name_input"
                      value={companyFormData.branch_name} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, branch_name: e.target.value }))}
                      className="bg-background"
                      placeholder="e.g. Ghatkesar Branch / UPI: jaibhavanicargo@hdfc"
                    />
                  </div>
                </div>
              </div>

              {/* Official E-Signature & Stamp Setup */}
              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Authorized E-Signature & Company Stamp</h3>
                    <p className="text-xs text-muted-foreground">Attach or draw your official digital signature to auto-stamp Invoices, Quotes, Payslips, and Agreements.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="signatory_name_input">Signatory Full Name</Label>
                    <Input 
                      id="signatory_name_input"
                      value={companyFormData.signatory_name} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, signatory_name: e.target.value }))}
                      className="bg-background"
                      placeholder="e.g. Vinod Kumar Rathod"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signatory_title_input">Designation / Title</Label>
                    <Input 
                      id="signatory_title_input"
                      value={companyFormData.signatory_title} 
                      onChange={e => setCompanyFormData(prev => ({ ...prev, signatory_title: e.target.value }))}
                      className="bg-background"
                      placeholder="e.g. Authorized Signatory / Managing Director"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground">Digital Signature Image</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="w-48 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden relative group shrink-0">
                        {companySignaturePreview ? (
                          <img src={companySignaturePreview} alt="E-Signature Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-center p-2 text-muted-foreground/40">
                            <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <span className="text-[11px]">No E-Signature</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            type="button" 
                            variant="default" 
                            size="sm" 
                            onClick={() => setIsDrawPadOpen(true)}
                            className="rounded-xl flex items-center gap-1.5"
                          >
                            <PenTool className="w-3.5 h-3.5" /> Draw Signature Pad
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => companySignatureInputRef.current?.click()}
                            className="rounded-xl flex items-center gap-1.5"
                          >
                            <UploadCloud className="w-3.5 h-3.5" /> Upload File (PNG/JPG)
                          </Button>
                          {companySignaturePreview && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleRemoveSignature}
                              className="rounded-xl text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Transparent PNG signatures with dark ink look best on official PDF invoices and payslips.
                        </p>
                      </div>

                      <input 
                        type="file" 
                        ref={companySignatureInputRef} 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                        onChange={handleCompanySignatureChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Draw Signature Pad Modal */}
              <SignaturePadModal 
                isOpen={isDrawPadOpen} 
                onClose={() => setIsDrawPadOpen(false)} 
                onSave={handleDrawnSignatureSave} 
              />
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

  const renderBackupSettingsView = () => {
    const formattedSize = backupStatus?.sizeBytes 
      ? (backupStatus.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB'
      : '—';
    
    const formattedDate = backupStatus?.lastModified
      ? format(new Date(backupStatus.lastModified), 'MMM dd, yyyy - hh:mm a')
      : '—';

    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border border-border/40 shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>System Database Backup</CardTitle>
                <CardDescription>Manually trigger database backups to cloud storage or download the SQLite database file locally.</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cloud Backup Status</p>
                <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active & Synced
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Last Sync Timestamp</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {isLoadingBackupStatus ? 'Loading...' : formattedDate}
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Database Size</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {isLoadingBackupStatus ? 'Loading...' : formattedSize}
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-primary text-xs leading-relaxed">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Manual Backup Instructions:</strong>
                <p className="mt-1">
                  A manual backup saves the current live state of all trip logs, expenses, cashbook transactions, and settings directly to Supabase Cloud Storage. This will overwrite the previous backup file in the cloud. You can also download a copy of the database locally for safety.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-border/50 pt-6">
            <Button
              onClick={handleManualBackup}
              disabled={isTriggeringBackup}
              className="w-full sm:w-auto min-w-[180px] rounded-xl"
            >
              {isTriggeringBackup ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Syncing Cloud...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Backup to Cloud
                </>
              )}
            </Button>

            <Button
              onClick={exportEnterpriseBackupJSON}
              className="w-full sm:w-auto min-w-[200px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export Full JSON Backup (Incl. Payments)
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadLocalBackup}
              className="w-full sm:w-auto min-w-[180px] rounded-xl"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download Local Copy (.db)
            </Button>

            <input 
              type="file" 
              id="backup-file-upload" 
              accept=".db" 
              onChange={handleUploadLocalBackup} 
              className="hidden" 
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('backup-file-upload').click()}
              disabled={isRestoringBackup}
              className="w-full sm:w-auto min-w-[180px] rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              {isRestoringBackup ? (
                <>
                  <div className="w-4.5 h-4.5 mr-2 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                  Restoring...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Restore Local Backup
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl border border-border/40 shadow-sm overflow-hidden bg-card mt-6">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-2xl text-destructive animate-pulse">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Rollback History & Automated Backups</CardTitle>
                <CardDescription>Select a previous database state to overwrite the current live database. Overwriting will restart the system.</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isLoadingLocalBackups ? (
              <div className="space-y-3 py-4">
                <div className="h-10 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-10 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-10 bg-muted/30 rounded-xl animate-pulse" />
              </div>
            ) : localBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No local backup files found on the server.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/55 text-muted-foreground font-semibold">
                      <th className="pb-3 font-medium">Backup File Name</th>
                      <th className="pb-3 font-medium">Size</th>
                      <th className="pb-3 font-medium">Backup Time</th>
                      <th className="pb-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localBackups.map((file) => {
                      const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                      const formattedTime = format(new Date(file.mtime), 'MMM dd, yyyy - hh:mm a');
                      const isAuto = file.name.includes('auto');
                      
                      return (
                        <tr key={file.name} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                          <td className="py-4 font-mono text-xs flex items-center gap-2">
                            {isAuto ? (
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">AUTO</span>
                            ) : (
                              <span className="bg-secondary/20 text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">MANUAL</span>
                            )}
                            {file.name}
                          </td>
                          <td className="py-4 text-muted-foreground">{sizeMB}</td>
                          <td className="py-4 text-muted-foreground">{formattedTime}</td>
                          <td className="py-4 text-right">
                            <Button
                              onClick={() => handleRestoreLocalFile(file.name)}
                              disabled={isRestoringLocalBackup}
                              variant="destructive"
                              size="sm"
                              className="rounded-xl px-4 h-8 text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                            >
                              Rollback
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
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
          <ChangeEmailModal />
          <ChangePasswordModal />
          {activeTab === 'profile' && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto inline-flex h-12 rounded-xl border border-border/30">
            <TabsTrigger value="profile" className="flex-1 sm:px-6 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <User className="w-4 h-4" /> Personal Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex-1 sm:px-6 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <Building className="w-4 h-4" /> Company Settings
            </TabsTrigger>
            <TabsTrigger value="bandwidth" className="flex-1 sm:px-6 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <Activity className="w-4 h-4 text-purple-500" /> Bandwidth & Usage
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex-1 sm:px-6 flex items-center gap-2 rounded-lg data-[state=active]:bg-background">
              <UploadCloud className="w-4 h-4" /> System Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 m-0 outline-none">
            {renderProfileView()}
          </TabsContent>

          <TabsContent value="company" className="space-y-6 m-0 outline-none">
            {renderCompanySettingsView()}
          </TabsContent>

          <TabsContent value="bandwidth" className="space-y-6 m-0 outline-none">
            <BandwidthTrackerCard />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6 m-0 outline-none">
            {renderBackupSettingsView()}
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

const DownloadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default ProfilePage;