import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Truck, Upload, User, Phone, Mail, MapPin, FileText, Star, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Camera, CreditCard, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { submitApplication, VEHICLE_TYPES } from '@/lib/recruitmentClient.js';

const STEPS = ['Personal Info', 'License & Identity', 'References', 'Review & Submit'];

export default function DriverApplicationPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', dob: '',
    address: '', city: '', state: '',
    pan_number: '',
    license_number: '', license_type: '', license_expiry: '',
    experience_years: '', previous_employer: '', previous_designation: '',
    reference1_name: '', reference1_phone: '', reference1_relation: '',
    reference2_name: '', reference2_phone: '', reference2_relation: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('License file must be under 10 MB'); return; }
    setLicenseFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setLicensePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setLicensePreview('pdf');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo must be under 10 MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePanChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('PAN card document must be under 10 MB'); return; }
    setPanFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPanPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPanPreview('pdf');
    }
  };

  const toggleVehicle = (v) => {
    setSelectedVehicles(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name || !form.phone || !form.city || !form.state) {
        toast.error('Please fill in all required personal information fields'); return false;
      }
      if (!photoFile) {
        toast.error('Please upload your Passport Size Photograph'); return false;
      }
    }
    if (step === 1) {
      if (!form.license_number || !form.license_type || !form.license_expiry) {
        toast.error('Please fill in driving license details'); return false;
      }
      if (!licenseFile) {
        toast.error('Please upload your driving license document'); return false;
      }
      if (form.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number.toUpperCase())) {
        toast.error('Invalid PAN number format (e.g. ABCDE1234F)'); return false;
      }
      if (selectedVehicles.length === 0) {
        toast.error('Please select at least one vehicle type'); return false;
      }
    }
    if (step === 2) {
      if (!form.reference1_name || !form.reference1_phone) {
        toast.error('Please provide at least one reference'); return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitApplication(
        { 
          ...form, 
          pan_number: form.pan_number ? form.pan_number.toUpperCase() : '',
          vehicle_types: selectedVehicles.join(', '), 
          experience_years: Number(form.experience_years || 0) 
        }, 
        { licenseFile, photoFile, panFile }
      );
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-400 text-sm mb-1">Thank you, <strong className="text-white">{form.full_name}</strong>!</p>
          <p className="text-slate-400 text-sm mb-6">Our HR team will review your application, photo, PAN card, &amp; license details and contact you within <strong className="text-amber-400">3–5 working days</strong>.</p>
          <div className="bg-slate-800/60 rounded-2xl p-4 text-xs text-slate-300 space-y-1 border border-slate-700">
            <p>📞 For queries, call: <strong className="text-white">+91 7794072244</strong></p>
            <p>📧 Email: <strong className="text-white">hr@jaibhavanicargo.com</strong></p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 font-sans">
      <Helmet>
        <title>Driver &amp; Employee Job Application | Jai Bhavani Cargo</title>
        <meta name="description" content="Apply for driver or staff positions at Jai Bhavani Cargo. Upload passport photo, driving license, and PAN card." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-white">Jai Bhavani Cargo</h1>
              <p className="text-xs text-blue-400 font-bold tracking-wider uppercase">Driver &amp; Employee Recruitment Portal</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Join our fleet &amp; logistics team across India</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${i < step ? 'bg-emerald-500 border-emerald-500 text-white' : i === step ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${i === step ? 'text-blue-400' : i < step ? 'text-emerald-400' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl">

          {/* STEP 0: Personal Info & Passport Photo */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Personal Information &amp; Photo</h2>

              {/* Passport Photo Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-600 flex items-center justify-center shrink-0 shadow-inner">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Passport Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-bold block">Photo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <Label className="text-xs font-bold text-slate-200">Upload Passport Size Photograph *</Label>
                  <p className="text-[11px] text-slate-400">Recent front-facing passport photo (JPG or PNG, max 10 MB)</p>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors mt-1">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    {photoFile ? photoFile.name : 'Choose Passport Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Full Name *</Label>
                  <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full legal name" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Mobile Number *</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9XXXXXXXXX" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white font-mono placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Email Address</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Date of Birth</Label>
                  <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Full Address</Label>
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="House No, Street, Village / Area" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">City / District *</Label>
                  <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Hyderabad" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">State *</Label>
                  <Select value={form.state} onValueChange={v => set('state', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {['Andhra Pradesh','Telangana','Maharashtra','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Madhya Pradesh','Uttar Pradesh','Bihar','West Bengal','Punjab','Haryana','Odisha','Jharkhand','Kerala','Goa','Other'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: License, PAN Card & Experience */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> License, PAN Card &amp; Experience</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">License Number *</Label>
                  <Input value={form.license_number} onChange={e => set('license_number', e.target.value.toUpperCase())} placeholder="TS05 20190012345" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">License Class *</Label>
                  <Select value={form.license_type} onValueChange={v => set('license_type', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LMV">LMV – Light Motor Vehicle</SelectItem>
                      <SelectItem value="HMV">HMV – Heavy Motor Vehicle</SelectItem>
                      <SelectItem value="HTV">HTV – Heavy Transport Vehicle</SelectItem>
                      <SelectItem value="HPMV">HPMV – Heavy Passenger Motor Vehicle</SelectItem>
                      <SelectItem value="Articulated">Articulated / Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">License Expiry Date *</Label>
                  <Input type="date" value={form.license_expiry} onChange={e => set('license_expiry', e.target.value)} className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Total Driving Experience (Years)</Label>
                  <Input type="number" min="0" max="50" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="e.g. 5" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>

                {/* PAN Card Details */}
                <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <Label className="text-xs font-extrabold text-slate-200">PAN Card Details</Label>
                  </div>
                  <Input value={form.pan_number} onChange={e => set('pan_number', e.target.value.toUpperCase())} maxLength={10} placeholder="PAN Card Number (e.g. ABCDE1234F)" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white font-mono uppercase placeholder:text-slate-500" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Previous Employer</Label>
                  <Input value={form.previous_employer} onChange={e => set('previous_employer', e.target.value)} placeholder="Company or Transport name" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Previous Designation</Label>
                  <Input value={form.previous_designation} onChange={e => set('previous_designation', e.target.value)} placeholder="e.g. Senior Driver" className="rounded-xl h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              </div>

              {/* Vehicle Types */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300">Vehicle Types You Can Drive *</Label>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v} type="button" onClick={() => toggleVehicle(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 ${selectedVehicles.includes(v) ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Uploads: License & PAN Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Upload */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-300">Upload Driving License * (JPG, PNG or PDF)</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all group">
                    {licensePreview ? (
                      licensePreview === 'pdf'
                        ? <div className="flex flex-col items-center gap-1 text-emerald-400"><FileText className="w-8 h-8" /><span className="text-xs font-bold truncate max-w-[150px]">{licenseFile?.name}</span></div>
                        : <img src={licensePreview} alt="License Preview" className="h-28 object-contain rounded-xl p-1" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-400">
                        <Upload className="w-7 h-7" />
                        <span className="text-xs font-bold">Click to upload license</span>
                      </div>
                    )}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleLicenseChange} />
                  </label>
                </div>

                {/* PAN Card Document Upload */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-300">Upload PAN Card Document (JPG, PNG or PDF)</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all group">
                    {panPreview ? (
                      panPreview === 'pdf'
                        ? <div className="flex flex-col items-center gap-1 text-emerald-400"><CreditCard className="w-8 h-8" /><span className="text-xs font-bold truncate max-w-[150px]">{panFile?.name}</span></div>
                        : <img src={panPreview} alt="PAN Preview" className="h-28 object-contain rounded-xl p-1" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-emerald-400">
                        <CreditCard className="w-7 h-7" />
                        <span className="text-xs font-bold">Click to upload PAN card</span>
                      </div>
                    )}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handlePanChange} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: References */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Professional References</h2>
              <p className="text-xs text-slate-400">Provide at least 1 reference. These may be contacted for verification.</p>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-white">Reference 1 *</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Full Name *</Label>
                    <Input value={form.reference1_name} onChange={e => set('reference1_name', e.target.value)} placeholder="Name" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Mobile Number *</Label>
                    <Input value={form.reference1_phone} onChange={e => set('reference1_phone', e.target.value)} placeholder="+91 XXXXXXXXXX" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white font-mono text-xs placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Relation / Designation</Label>
                    <Input value={form.reference1_relation} onChange={e => set('reference1_relation', e.target.value)} placeholder="e.g. Ex-Employer" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-white">Reference 2 <span className="text-slate-500 font-normal text-xs">(Optional)</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Full Name</Label>
                    <Input value={form.reference2_name} onChange={e => set('reference2_name', e.target.value)} placeholder="Name" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Mobile Number</Label>
                    <Input value={form.reference2_phone} onChange={e => set('reference2_phone', e.target.value)} placeholder="+91 XXXXXXXXXX" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white font-mono text-xs placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-400">Relation / Designation</Label>
                    <Input value={form.reference2_relation} onChange={e => set('reference2_relation', e.target.value)} placeholder="e.g. Supervisor" className="rounded-xl h-9 bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Review Your Application</h2>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-slate-800/60 rounded-2xl p-4 space-y-3 border border-slate-700">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-400" /> Personal Details &amp; Photo</h3>
                  <div className="flex items-center gap-4">
                    {photoPreview && (
                      <img src={photoPreview} alt="Passport Photo Preview" className="w-16 h-20 object-cover rounded-xl border border-slate-600 shrink-0" />
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
                      <span className="text-slate-500">Name:</span><span className="font-bold text-white">{form.full_name}</span>
                      <span className="text-slate-500">Mobile:</span><span className="font-mono font-bold text-white">{form.phone}</span>
                      <span className="text-slate-500">City:</span><span className="text-white">{form.city}, {form.state}</span>
                      <span className="text-slate-500">Email:</span><span className="text-white">{form.email || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-4 space-y-1.5 border border-slate-700">
                  <h3 className="font-extrabold text-white text-sm mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-400" /> Documents &amp; Identity</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-slate-500">License No:</span><span className="font-mono font-bold text-white">{form.license_number}</span>
                    <span className="text-slate-500">Class:</span><span className="text-white">{form.license_type}</span>
                    <span className="text-slate-500">PAN Number:</span><span className="font-mono font-bold text-emerald-400">{form.pan_number || '—'}</span>
                    <span className="text-slate-500">Experience:</span><span className="text-white">{form.experience_years || '0'} Years</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 block mb-1">Vehicles:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedVehicles.map(v => <Badge key={v} variant="outline" className="text-[10px] font-bold text-blue-400 border-blue-500/30">{v}</Badge>)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 flex flex-col gap-1.5">
                    {licenseFile && (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> License Uploaded ({licenseFile.name})
                      </div>
                    )}
                    {panFile && (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAN Card Uploaded ({panFile.name})
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-4 space-y-1.5 border border-slate-700">
                  <h3 className="font-extrabold text-white text-sm mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" /> References</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-slate-500">Ref 1:</span><span className="text-white">{form.reference1_name} ({form.reference1_phone})</span>
                    {form.reference2_name && <><span className="text-slate-500">Ref 2:</span><span className="text-white">{form.reference2_name} ({form.reference2_phone})</span></>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>By submitting, you confirm all information and uploaded documents are authentic. False details will result in disqualification.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-700/60">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-xl text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30">
                Next Step <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30">
                {submitting ? 'Submitting...' : '✓ Submit Application'}
              </Button>
            )}
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-6 pb-4">
          Jai Bhavani Cargo Transport Pvt. Ltd. • Hyderabad • <a href="tel:+917794072244" className="text-blue-500 hover:underline">+91 7794072244</a>
        </p>
      </div>
    </div>
  );
}
