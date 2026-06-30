import React, { useState, useMemo, useEffect } from 'react';
import { format, addMonths, isBefore, isSameDay, parseISO, isValid } from 'date-fns';
import { Helmet } from 'react-helmet';
import { 
  Calculator, 
  CalendarRange, 
  IndianRupee, 
  Landmark, 
  PieChart,
  TrendingDown,
  ArrowDownToLine,
  Activity,
  Settings2,
  Save,
  Loader2,
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoanProfiles } from '@/hooks/useLoanProfiles.js';
import ProfileSelector from '@/components/ProfileSelector.jsx';
import ProfileManager from '@/components/ProfileManager.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function EMICalculatorPage() {
  const { 
    profiles = [], 
    loading: profilesLoading, 
    getAllProfiles, 
    getDefaultProfile, 
    saveProfile, 
    updateProfile, 
    deleteProfile, 
    setDefaultProfile, 
    loadProfile 
  } = useLoanProfiles();

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are allowed');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds the 20MB limit');
      return;
    }

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('loan_document', file);
      
      const updated = await updateProfile(activeProfileId, formDataObj);
      if (updated) {
        toast.success('Loan document uploaded successfully');
        await getAllProfiles();
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = async () => {
    if (!window.confirm('Are you sure you want to remove the uploaded loan document?')) return;
    
    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('loan_document', '');
      
      const updated = await updateProfile(activeProfileId, formDataObj);
      if (updated) {
        toast.success('Loan document removed');
        await getAllProfiles();
      }
    } catch (err) {
      console.error('Failed to remove document:', err);
      toast.error('Failed to remove document');
    } finally {
      setUploading(false);
    }
  };

  const [bankName, setBankName] = useState('HDFC Bank');
  const [amount, setAmount] = useState('500000');
  const [rate, setRate] = useState('9.5');
  const [tenure, setTenure] = useState('5');
  const [tenureType, setTenureType] = useState('years');
  const [loanDate, setLoanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [firstEmiDate, setFirstEmiDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));

  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId);
  }, [profiles, activeProfileId]);

  const isModified = useMemo(() => {
    if (!activeProfile) return false;
    const tMonths = tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);
    return (
      amount !== (activeProfile.loanAmount?.toString() || '0') ||
      rate !== (activeProfile.interestRate?.toString() || '0') ||
      tMonths !== (activeProfile.loanTerm || 0) ||
      bankName !== (activeProfile.bank_name || 'HDFC Bank') ||
      loanDate !== (activeProfile.disbursal_date ? activeProfile.disbursal_date.substring(0, 10) : '') ||
      firstEmiDate !== (activeProfile.first_emi_date ? activeProfile.first_emi_date.substring(0, 10) : '')
    );
  }, [activeProfile, amount, rate, tenure, tenureType, bankName, loanDate, firstEmiDate]);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const records = await getAllProfiles();
      const draft = localStorage.getItem('emi_draft');
      let loadedFromProfile = false;

      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.activeProfileId) {
            const matchedProfile = records.find(p => p.id === parsed.activeProfileId);
            if (matchedProfile) {
              applyProfileToState(matchedProfile);
              loadedFromProfile = true;
            }
          }
          
          if (!loadedFromProfile) {
            setBankName(parsed.bankName || 'HDFC Bank');
            setAmount(parsed.amount || '500000');
            setRate(parsed.rate || '9.5');
            setTenure(parsed.tenure || '5');
            setTenureType(parsed.tenureType || 'years');
            setLoanDate(parsed.loanDate || format(new Date(), 'yyyy-MM-dd'));
            setFirstEmiDate(parsed.firstEmiDate || format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
            setActiveProfileId(parsed.activeProfileId || null);
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      } else {
        const defProfile = await getDefaultProfile();
        if (defProfile) {
          applyProfileToState(defProfile);
        }
      }
    };
    init();
  }, [getAllProfiles, getDefaultProfile]);

  // Auto-save draft
  useEffect(() => {
    const draft = { bankName, amount, rate, tenure, tenureType, loanDate, firstEmiDate, activeProfileId };
    localStorage.setItem('emi_draft', JSON.stringify(draft));
  }, [bankName, amount, rate, tenure, tenureType, loanDate, firstEmiDate, activeProfileId]);

  const applyProfileToState = (profile) => {
    setAmount(profile.loanAmount?.toString() || '0');
    setRate(profile.interestRate?.toString() || '0');
    setTenure(profile.loanTerm?.toString() || '0');
    setTenureType('months'); // Profiles store term in months
    setBankName(profile.bank_name || 'HDFC Bank');
    setLoanDate(profile.disbursal_date ? profile.disbursal_date.substring(0, 10) : format(new Date(), 'yyyy-MM-dd'));
    setFirstEmiDate(profile.first_emi_date ? profile.first_emi_date.substring(0, 10) : format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
    setActiveProfileId(profile.id);
  };

  const handleProfileChange = async (profileId) => {
    if (!profileId) {
      setActiveProfileId(null);
      return;
    }
    const profile = await loadProfile(profileId);
    if (profile) {
      applyProfileToState(profile);
    }
  };

  const handleSaveNewProfile = async (name) => {
    const tMonths = tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);
    const payload = {
      profileName: name,
      loanAmount: parseFloat(amount) || 0,
      interestRate: parseFloat(rate) || 0,
      loanTerm: tMonths || 0,
      isDefault: profiles.length === 0,
      bank_name: bankName,
      disbursal_date: loanDate,
      first_emi_date: firstEmiDate
    };
    const saved = await saveProfile(payload);
    if (saved) setActiveProfileId(saved.id);
  };

  const handleUpdateActiveProfile = async () => {
    if (!activeProfileId) return;
    const tMonths = tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);
    const payload = {
      loanAmount: parseFloat(amount) || 0,
      interestRate: parseFloat(rate) || 0,
      loanTerm: tMonths || 0,
      bank_name: bankName,
      disbursal_date: loanDate,
      first_emi_date: firstEmiDate
    };
    try {
      await updateProfile(activeProfileId, payload);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleDuplicateProfile = async (profile) => {
    const payload = {
      profileName: `${profile.profileName} (Copy)`,
      loanAmount: profile.loanAmount,
      interestRate: profile.interestRate,
      loanTerm: profile.loanTerm,
      isDefault: false,
      bank_name: profile.bank_name,
      disbursal_date: profile.disbursal_date,
      first_emi_date: profile.first_emi_date
    };
    await saveProfile(payload);
  };

  // Derived calculations
  const { schedule, summary } = useMemo(() => {
    const p = parseFloat(amount) || 0;
    const rAnnual = parseFloat(rate) || 0;
    const t = parseFloat(tenure) || 0;
    const n = tenureType === 'years' ? t * 12 : t;
    
    // Safety check for empty or invalid dates preventing crashes
    if (p <= 0 || n <= 0 || !firstEmiDate) {
      return { schedule: [], summary: null };
    }

    const startDate = parseISO(firstEmiDate);
    if (!isValid(startDate)) {
      return { schedule: [], summary: null };
    }

    const rMonthly = (rAnnual / 12) / 100;
    let emi = 0;
    
    if (rMonthly === 0) {
      emi = p / n;
    } else {
      emi = (p * rMonthly * Math.pow(1 + rMonthly, n)) / (Math.pow(1 + rMonthly, n) - 1);
    }

    const scheduleData = [];
    let currentBalance = p;
    let totalInterest = 0;
    
    const today = new Date();

    let paidPrincipal = 0;
    let paidInterest = 0;

    for (let i = 1; i <= n; i++) {
      const interestForMonth = currentBalance * rMonthly;
      let principalForMonth = emi - interestForMonth;

      if (i === n) {
        principalForMonth = currentBalance;
        emi = principalForMonth + interestForMonth;
      }

      currentBalance -= principalForMonth;
      totalInterest += interestForMonth;

      const emiDateObj = addMonths(startDate, i - 1);
      const isPaid = isBefore(emiDateObj, today) || isSameDay(emiDateObj, today);

      if (isPaid) {
        paidPrincipal += principalForMonth;
        paidInterest += interestForMonth;
      }

      scheduleData.push({
        number: i,
        date: emiDateObj,
        emiAmount: emi,
        principal: principalForMonth,
        interest: interestForMonth,
        balance: Math.max(0, currentBalance),
        isPaid
      });
    }

    const totalAmount = p + totalInterest;
    
    return {
      schedule: scheduleData,
      summary: {
        emi,
        totalPrincipal: p,
        totalInterest,
        totalAmount,
        paidPrincipal,
        paidInterest,
        paidTotal: paidPrincipal + paidInterest,
        outstandingPrincipal: p - paidPrincipal,
        outstandingInterest: totalInterest - paidInterest,
        outstandingTotal: totalAmount - (paidPrincipal + paidInterest),
        lastEmiDate: scheduleData.length > 0 ? scheduleData[scheduleData.length - 1].date : null
      }
    };
  }, [amount, rate, tenure, tenureType, firstEmiDate]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Safely find the active profile using optional chaining
  const activeProfileName = profiles?.find(p => p.id === activeProfileId)?.profileName;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>EMI Calculator | Financial Hub</title>
        <meta name="description" content="Calculate and manage your loan EMIs" />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Calculator className="w-7 h-7 text-primary" />
            EMI Calculator
            {profilesLoading && !profiles?.length ? (
              <div className="h-5 w-24 bg-muted animate-pulse rounded-md ml-2"></div>
            ) : activeProfileName ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="ml-2 font-medium">
                  {activeProfileName}
                </Badge>
                {isModified && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 font-medium text-[10px] px-1.5 py-0 h-5">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            ) : null}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Calculate your monthly installments and track outstanding loan balances.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ProfileSelector 
            profiles={profiles || []} 
            activeProfileId={activeProfileId} 
            onProfileChange={handleProfileChange}
            loading={profilesLoading}
          />
          <Button variant="outline" onClick={() => setIsManagerOpen(true)} disabled={profilesLoading && !profiles?.length} className="rounded-xl shadow-sm">
            {profilesLoading && !profiles?.length ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings2 className="w-4 h-4 mr-2" />}
            Manage Profiles
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  Loan Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  {activeProfileId && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleUpdateActiveProfile} 
                      disabled={profilesLoading || !isModified} 
                      className={`h-8 text-xs font-semibold ${isModified ? 'text-success hover:text-success/80 hover:bg-success/10' : 'text-muted-foreground opacity-50 cursor-not-allowed'}`}
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsManagerOpen(true)} 
                    disabled={profilesLoading && !profiles?.length} 
                    className="h-8 text-xs text-primary hover:text-primary/80"
                  >
                    {activeProfileId ? 'Profiles' : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save</>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank / Financial Institution</Label>
                <Input 
                  id="bankName"
                  value={bankName}
                  onChange={(e) => { setBankName(e.target.value); }}
                  placeholder="e.g. HDFC Bank"
                  className="bg-background rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); }}
                    className="pl-9 bg-background font-medium rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                <div className="relative">
                  <PieChart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="rate"
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => { setRate(e.target.value); }}
                    className="pl-9 bg-background rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure</Label>
                  <Input 
                    id="tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => { setTenure(e.target.value); }}
                    className="bg-background rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenureType">Period</Label>
                  <Select value={tenureType} onValueChange={(v) => { setTenureType(v); }}>
                    <SelectTrigger id="tenureType" className="bg-background rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="loanDate">Disbursal Date</Label>
                  <Input 
                    id="loanDate"
                    type="date"
                    value={loanDate}
                    onChange={(e) => { setLoanDate(e.target.value); }}
                    className="bg-background rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstEmiDate">First EMI Date</Label>
                  <Input 
                    id="firstEmiDate"
                    type="date"
                    value={firstEmiDate}
                    onChange={(e) => { setFirstEmiDate(e.target.value); }}
                    className="bg-background rounded-xl"
                  />
              </div>
            </div>

              {activeProfileId && (
                <div className="space-y-2 pt-4 border-t border-border mt-4">
                  <Label className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Loan Document</span>
                    {activeProfile?.loan_document && (
                      <span className="text-[10px] text-success-foreground lowercase font-normal normal-case bg-success/15 px-2 py-0.5 rounded-full border border-success/30 flex items-center gap-1">
                        <Badge variant="outline" className="border-transparent p-0 bg-transparent text-success text-[10px]">active</Badge>
                      </span>
                    )}
                  </Label>
                  
                  {activeProfile?.loan_document ? (
                    <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate text-foreground" title={activeProfile.loan_document}>
                          {activeProfile.loan_document}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const url = pb.files.getURL(activeProfile, activeProfile.loan_document);
                            window.open(url, '_blank');
                          }}
                          className="h-8 text-xs text-primary hover:bg-primary/10 hover:text-primary rounded-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleRemoveDocument}
                          disabled={uploading}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="loan-doc-upload"
                      />
                      <label 
                        htmlFor="loan-doc-upload"
                        className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary mb-1" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-muted-foreground mb-1" />
                        )}
                        <span className="text-xs font-semibold text-foreground">
                          {uploading ? 'Uploading PDF...' : 'Upload Loan PDF Document'}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">PDF format up to 20MB</span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status & Summary Section */}
        <div className="lg:col-span-8 space-y-6">
          {summary ? (
            <>
              {/* Primary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-primary text-primary-foreground border-transparent shadow-md rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-primary-foreground/80 text-sm font-medium mb-1">Monthly EMI</p>
                    <p className="text-3xl font-bold tracking-tight tabular-nums">{formatCurrency(summary.emi)}</p>
                    <p className="text-primary-foreground/70 text-xs mt-2 truncate">{bankName} Loan</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm font-medium mb-1">Total Interest</p>
                    <p className="text-2xl font-bold tracking-tight text-destructive tabular-nums">{formatCurrency(summary.totalInterest)}</p>
                    <p className="text-muted-foreground text-xs mt-2">Over {tenureType === 'years' ? tenure * 12 : tenure} months</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm font-medium mb-1">Total Amount Payable</p>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">{formatCurrency(summary.totalAmount)}</p>
                    <p className="text-muted-foreground text-xs mt-2">Principal + Interest</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Status As of Today */}
              <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/20 border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Current Status 
                    </CardTitle>
                    <Badge variant="outline" className="bg-background text-muted-foreground">
                      As of Today
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <ArrowDownToLine className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Paid Principal</span>
                      </div>
                      <p className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(summary.paidPrincipal)}</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Paid Interest</span>
                      </div>
                      <p className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(summary.paidInterest)}</p>
                    </div>
                    <div className="p-5 bg-muted/5">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Landmark className="w-4 h-4 text-warning" />
                        <span className="text-xs font-medium uppercase tracking-wider text-warning">Out. Principal</span>
                      </div>
                      <p className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(summary.outstandingPrincipal)}</p>
                    </div>
                    <div className="p-5 bg-muted/5">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <PieChart className="w-4 h-4 text-destructive" />
                        <span className="text-xs font-medium uppercase tracking-wider text-destructive">Out. Interest</span>
                      </div>
                      <p className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(summary.outstandingInterest)}</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-5 py-3 border-t border-border flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last EMI Date: <span className="font-medium text-foreground">{summary.lastEmiDate ? format(summary.lastEmiDate, 'MMM dd, yyyy') : '-'}</span></span>
                    <span className="text-muted-foreground">Total Outstanding: <span className="font-bold text-foreground tabular-nums">{formatCurrency(summary.outstandingTotal)}</span></span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/10 p-12 text-center">
              <div>
                <Calculator className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Enter Loan Details</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">Provide the loan amount, interest rate, and tenure to generate your amortization schedule.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              Amortization Schedule
            </CardTitle>
            <CardDescription>Month-by-month breakdown of your repayment</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto relative custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-[0_1px_0_hsl(var(--border))]">
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">EMI Amount</TableHead>
                    <TableHead className="text-right">Principal Paid</TableHead>
                    <TableHead className="text-right">Interest Paid</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                    <TableHead className="text-center w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((row) => (
                    <TableRow key={row.number} className={row.isPaid ? 'bg-muted/20' : ''}>
                      <TableCell className="text-center text-muted-foreground font-medium">{row.number}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{format(row.date, 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(row.emiAmount)}</TableCell>
                      <TableCell className="text-right tabular-nums text-success/90">{formatCurrency(row.principal)}</TableCell>
                      <TableCell className="text-right tabular-nums text-destructive/90">{formatCurrency(row.interest)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.balance)}</TableCell>
                      <TableCell className="text-center">
                        {row.isPaid ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">Paid</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-border">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}

      <ProfileManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        profiles={profiles || []}
        activeProfileId={activeProfileId}
        onProfileSelect={(id) => { handleProfileChange(id); setIsManagerOpen(false); }}
        onSave={handleSaveNewProfile}
        onUpdate={updateProfile}
        onDelete={deleteProfile}
        onDuplicate={handleDuplicateProfile}
        onSetDefault={setDefaultProfile}
        loading={profilesLoading}
      />
    </div>
  );
}