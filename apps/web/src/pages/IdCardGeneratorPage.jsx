import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getEmployeePhotoUrl } from '@/lib/photoUtils.js';
import { 
  IdCard, Printer, Download, Search, RefreshCw, Sparkles, Truck, Users, 
  ShieldCheck, Phone, MapPin, Calendar, Upload, Eye, CheckCircle2, User, 
  Building2, QrCode, CreditCard, ChevronRight, Copy, Check, FileText,
  Sliders, LayoutGrid, CheckSquare, ShieldAlert, Award, Star, Zap, Cpu
} from 'lucide-react';

const SAMPLE_EMPLOYEES = [
  {
    id: 'emp-101',
    employee_number: 'D001',
    name: 'Ramesh Kumar Rathod',
    employee_type: 'driver',
    contact: '+91 98765 43210',
    emergency_contact: '+91 98765 43299',
    blood_group: 'O+',
    license_number: 'TS09-2018-0098231',
    joining_date: '2022-04-15',
    expiry_date: '2028-04-14',
    address: 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003',
    active_status: 'active',
    designation: 'Senior Heavy Fleet Driver',
  },
  {
    id: 'emp-102',
    employee_number: 'E001',
    name: 'Sunita Sharma',
    employee_type: 'manager',
    contact: '+91 94401 12233',
    emergency_contact: '+91 94401 12200',
    blood_group: 'B+',
    license_number: 'TS08-2020-0012345',
    joining_date: '2021-08-01',
    expiry_date: '2027-07-31',
    address: 'H.No 12-5-88, Banjara Hills, Hyderabad, Telangana - 500034',
    active_status: 'active',
    designation: 'Logistics Operations Manager',
  },
  {
    id: 'emp-103',
    employee_number: 'D002',
    name: 'Vikram Singh Chauhan',
    employee_type: 'driver',
    contact: '+91 97000 88776',
    emergency_contact: '+91 97000 88700',
    blood_group: 'A+',
    license_number: 'MH12-2019-0054321',
    joining_date: '2023-01-10',
    expiry_date: '2029-01-09',
    address: 'Flat 302, Auto Nagar, Pune, Maharashtra - 411028',
    active_status: 'active',
    designation: 'Multi-Axle Container Driver',
  }
];

const TEMPLATES = [
  {
    id: 'curved_wave_v',
    name: 'Curved Wave Executive',
    orientation: 'vertical',
    tag: 'Corporate & Executive (Featured)',
    color: 'from-blue-400 via-indigo-300 to-blue-200',
    border: 'border-blue-300',
    accent: 'blue',
  },
  {
    id: 'royal_gold_v',
    name: 'Royal Dark Gold',
    orientation: 'vertical',
    tag: 'Executive Driver Pass',
    color: 'from-amber-500/20 via-amber-500/10 to-transparent',
    border: 'border-amber-500/60',
    accent: 'amber',
  },
  {
    id: 'cyber_neon_v',
    name: 'Cyber Neon Tech',
    orientation: 'vertical',
    tag: 'Digital Fleet Pass',
    color: 'from-cyan-500/20 via-blue-600/10 to-transparent',
    border: 'border-cyan-400/60',
    accent: 'cyan',
  },
  {
    id: 'fleet_red_v',
    name: 'Heavy Logistics Red',
    orientation: 'vertical',
    tag: 'Official Driver License',
    color: 'from-rose-600/25 via-red-950/20 to-transparent',
    border: 'border-rose-500/60',
    accent: 'rose',
  },
  {
    id: 'corporate_pearl_v',
    name: 'Corporate Pearl White',
    orientation: 'vertical',
    tag: 'Executive Staff Pass',
    color: 'from-blue-600/10 to-transparent',
    border: 'border-blue-400/40',
    accent: 'blue',
  },
  {
    id: 'security_badge_v',
    name: 'High-Security Badge',
    orientation: 'vertical',
    tag: 'Government Clearance',
    color: 'from-emerald-500/20 via-teal-950/20 to-transparent',
    border: 'border-emerald-500/60',
    accent: 'emerald',
  },
  {
    id: 'classic_horizontal',
    name: 'Classic Wallet Pass',
    orientation: 'horizontal',
    tag: 'Standard PVC Card',
    color: 'from-slate-800 to-slate-950',
    border: 'border-slate-700',
    accent: 'slate',
  }
];

export default function IdCardGeneratorPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('curved_wave_v');
  const [cardSide, setCardSide] = useState('both'); // 'both' | 'front' | 'back'
  const [isEditing, setIsEditing] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchSelected, setBatchSelected] = useState([]);

  // Live Card Form Fields
  const [cardForm, setCardForm] = useState({
    company_name: 'JAI BHAVANI CARGO',
    company_tagline: 'Logistics & Heavy Transport Fleet',
    company_phone: '+91 7794072244',
    company_email: 'support@jaibhavanicargo.com',
    company_address: 'Plot 42, Transport Nagar, Secunderabad, TG - 500003',
    company_logo_url: '',
    name: '',
    employee_number: '',
    designation: '',
    department: 'Operations',
    contact: '',
    emergency_contact: '',
    blood_group: 'O+',
    license_number: '',
    issue_date: '2024-01-01',
    expiry_date: '2029-12-31',
    photo_url: '',
    auth_sign_title: 'Authorized Signatory',
  });

  const photoInputRef = useRef(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch company logo from company_settings
      try {
        const companyRecs = await pb.collection('company_settings').getFullList({ $autoCancel: false }).catch(() => []);
        if (companyRecs && companyRecs.length > 0) {
          const setting = companyRecs[0];
          if (setting.company_logo) {
            const logoUrl = pb.files.getUrl(setting, setting.company_logo);
            setCardForm(prev => ({
              ...prev,
              company_logo_url: logoUrl,
              company_name: setting.company_name || prev.company_name
            }));
          }
        }
      } catch (e) {}

      let pbRecords = await pb.collection('employees').getFullList({
        sort: '-created',
        $autoCancel: false,
      }).catch(() => []);

      let localData = [];
      try {
        const raw = localStorage.getItem('jbc_driver_applications');
        if (raw) {
          localData = JSON.parse(raw).map(a => ({
            id: a.id,
            employee_number: a.id.replace('app-', 'JBC-REC-'),
            name: a.full_name,
            employee_type: a.applicant_role?.toLowerCase().includes('driver') ? 'driver' : 'staff',
            contact: a.phone,
            emergency_contact: a.emergency_contact || a.phone,
            blood_group: 'O+',
            license_number: a.license_number || 'N/A',
            joining_date: a.applied_date?.split('T')[0] || '2024-01-01',
            expiry_date: '2029-12-31',
            address: `${a.city || ''}, ${a.state || ''}`,
            active_status: 'active',
            designation: a.applicant_role || 'Staff',
            photo: a.photo_file
          }));
        }
      } catch (e) {}

      const mergedMap = new Map();
      SAMPLE_EMPLOYEES.forEach(e => mergedMap.set(e.id, e));
      localData.forEach(e => mergedMap.set(e.id, e));
      pbRecords.forEach(e => {
        mergedMap.set(e.id, {
          id: e.id,
          employee_number: e.employee_number || `JBC-EMP-${e.id.slice(0,4)}`,
          name: e.name,
          employee_type: e.employee_type || 'staff',
          contact: e.contact || '',
          emergency_contact: e.emergency_contact || e.contact,
          blood_group: e.blood_group || 'O+',
          license_number: e.license_number || 'N/A',
          joining_date: e.joining_date || '2024-01-01',
          expiry_date: e.expiry_date || '2029-12-31',
          address: e.address || '',
          active_status: e.active_status || 'active',
          designation: e.designation || (e.employee_type === 'driver' ? 'Heavy Fleet Driver' : 'Company Staff'),
          photoUrl: getEmployeePhotoUrl(e)
        });
      });

      const rawList = Array.from(mergedMap.values());
      let driverIdx = 1;
      let staffIdx = 1;

      const formattedList = rawList.map(emp => {
        const isDriver = emp.employee_type === 'driver' || 
                         (emp.designation || '').toLowerCase().includes('driver');
        let code = emp.employee_number || '';
        
        if (!/^[DE]\d{3}$/i.test(code.trim())) {
          if (isDriver) {
            code = `D${String(driverIdx++).padStart(3, '0')}`;
          } else {
            code = `E${String(staffIdx++).padStart(3, '0')}`;
          }
        } else if (isDriver && code.startsWith('D')) {
          driverIdx++;
        } else if (!isDriver && code.startsWith('E')) {
          staffIdx++;
        }
        return { ...emp, employee_number: code };
      });

      setEmployees(formattedList);

      if (formattedList.length > 0) {
        selectEmployeeForCard(formattedList[0]);
      }
    } catch (err) {
      toast.error('Failed to load employee directory');
      selectEmployeeForCard(SAMPLE_EMPLOYEES[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const selectEmployeeForCard = (emp) => {
    setSelectedEmp(emp);
    setCardForm({
      company_name: 'JAI BHAVANI CARGO',
      company_tagline: 'Logistics & Heavy Transport Fleet',
      company_phone: '+91 7794072244',
      company_email: 'support@jaibhavanicargo.com',
      company_address: emp.address || 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003',
      name: emp.name || '',
      employee_number: emp.employee_number || 'JBC-001',
      designation: emp.designation || (emp.employee_type === 'driver' ? 'Senior Heavy Fleet Driver' : 'Logistics Operations Staff'),
      contact: emp.contact || '',
      emergency_contact: emp.emergency_contact || emp.contact || '',
      blood_group: emp.blood_group || 'O+',
      license_number: emp.license_number || 'N/A',
      issue_date: emp.joining_date || '2024-01-01',
      expiry_date: emp.expiry_date || '2029-12-31',
      photo_url: emp.photoUrl || getEmployeePhotoUrl(emp),
      auth_sign_title: 'Authorized Signatory',
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCardForm(prev => ({ ...prev, photo_url: uploadEvent.target.result }));
        toast.success('Custom photo loaded onto ID card!');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (roleFilter !== 'all') {
      if (roleFilter === 'driver' && emp.employee_type !== 'driver') return false;
      if (roleFilter === 'staff' && emp.employee_type === 'driver') return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(q) ||
        emp.employee_number?.toLowerCase().includes(q) ||
        emp.contact?.includes(q) ||
        emp.license_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const generateQrUrl = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(text)}&color=000000&bgcolor=ffffff&margin=2`;
  };

  const buildVerificationUrl = (form) => {
    const baseUrl = `${window.location.origin}/verify-employee/${form.employee_number || 'D001'}`;
    const params = new URLSearchParams();
    if (form.name) params.set('n', form.name);
    if (form.designation) params.set('r', form.designation);
    if (form.contact) params.set('p', form.contact);
    if (form.license_number && form.license_number !== 'N/A') params.set('l', form.license_number);
    if (form.blood_group) params.set('bg', form.blood_group);
    return `${baseUrl}?${params.toString()}`;
  };

  const verificationUrl = buildVerificationUrl(cardForm);
  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <Helmet>
        <title>Vertical &amp; Printable ID Card Generator Studio | Jai Bhavani Cargo</title>
        <meta name="description" content="Generate high-resolution printable vertical ID cards for drivers and employees with scannable QR verification code." />
      </Helmet>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card-area, #printable-card-area * {
            visibility: visible;
          }
          #printable-card-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 shadow-lg shadow-blue-500/10">
            <IdCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Employee &amp; Driver ID Card Generator Studio
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                Vertical Badges &amp; QR
              </Badge>
            </h1>
            <p className="text-xs text-slate-400">Design, customize, &amp; print high-security vertical lanyard ID cards for drivers &amp; staff</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="rounded-xl text-xs font-bold border-slate-700 bg-slate-900 hover:bg-slate-800">
            <Sliders className="w-4 h-4 mr-1.5 text-amber-400" />
            {isEditing ? 'Hide Card Fields' : 'Edit Card Content'}
          </Button>

          <Button onClick={() => setIsBatchOpen(true)} variant="outline" className="rounded-xl text-xs font-bold border-slate-700 bg-slate-900 hover:bg-slate-800">
            <LayoutGrid className="w-4 h-4 mr-1.5 text-blue-400" /> Batch Print Grid
          </Button>

          <Button onClick={handlePrint} className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
            <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* TEMPLATE PICKER GALLERY STUDIO (HIGHLY VISIBLE AT TOP) */}
      <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 mb-6 shadow-2xl no-print">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">Select ID Card Template Format</h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {TEMPLATES.filter(t => t.orientation === 'vertical').length} Vertical Lanyard Badges Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {TEMPLATES.map(tmpl => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white shadow-xl scale-[1.02]'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className={`text-[9px] font-bold py-0 px-1.5 ${isSelected ? 'bg-blue-500/20 text-blue-300 border-blue-400/50' : 'bg-slate-800 text-slate-400'}`}>
                      {tmpl.orientation === 'vertical' ? 'Vertical 📇' : 'Horizontal 💳'}
                    </Badge>
                  </div>
                  <div className="font-black text-xs text-white leading-tight mt-1">{tmpl.name}</div>
                  <div className="text-[9.5px] text-slate-400 font-medium mt-0.5">{tmpl.tag}</div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[9px]">
                  <span className="text-amber-400 font-bold uppercase">{tmpl.accent}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Employee Directory Selector */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Employee Directory
                </h3>
                <Button size="sm" variant="ghost" onClick={fetchEmployees} className="h-8 px-2 text-xs text-slate-400 hover:text-white">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Search & Role Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, emp ID..."
                    className="pl-8 bg-slate-950 border-slate-800 text-xs h-8 rounded-xl"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-28 h-8 text-xs bg-slate-950 border-slate-800 rounded-xl">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="driver">Drivers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employee List */}
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="text-center py-8 text-xs text-slate-500">Loading directory...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No employees found</div>
                ) : (
                  filteredEmployees.map(emp => {
                    const isSelected = selectedEmp?.id === emp.id;
                    const isDriver = emp.employee_type === 'driver';
                    return (
                      <div
                        key={emp.id}
                        onClick={() => selectEmployeeForCard(emp)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/5'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isDriver ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {isDriver ? <Truck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-white truncate">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                              <span>{emp.employee_number}</span>
                              <span>•</span>
                              <span className="text-slate-300">{emp.designation}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Quick Photo Uploader */}
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" /> Upload Custom Photo
            </h3>
            <p className="text-[11px] text-slate-400">Upload a headshot photo for the active ID card</p>

            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <Button onClick={() => photoInputRef.current?.click()} variant="outline" className="w-full h-9 rounded-xl text-xs font-bold border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Choose Headshot Image
            </Button>
          </Card>

          {/* Side View Format Toggle */}
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl space-y-2">
            <Label className="text-[11px] font-bold text-slate-400 block">Card Preview Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both', label: 'Dual Sides' },
                { id: 'front', label: 'Front Only' },
                { id: 'back', label: 'Back Only' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setCardSide(s.id)}
                  className={`py-1.5 text-[11px] font-extrabold rounded-xl border ${
                    cardSide === s.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Card Preview Studio & Customizer */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card Field Editor */}
          {isEditing && (
            <Card className="bg-slate-900 border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 no-print">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" /> Edit Card Content Fields
                </h3>
                <span className="text-[11px] text-slate-400">Updates live in preview below</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label className="text-[11px] text-slate-400">Full Name</Label>
                  <Input value={cardForm.name} onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Employee / Driver Code</Label>
                  <Input value={cardForm.employee_number} onChange={e => setCardForm(p => ({ ...p, employee_number: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Designation / Role</Label>
                  <Input value={cardForm.designation} onChange={e => setCardForm(p => ({ ...p, designation: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Mobile Contact</Label>
                  <Input value={cardForm.contact} onChange={e => setCardForm(p => ({ ...p, contact: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Emergency Helpline</Label>
                  <Input value={cardForm.emergency_contact} onChange={e => setCardForm(p => ({ ...p, emergency_contact: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Blood Group</Label>
                  <Input value={cardForm.blood_group} onChange={e => setCardForm(p => ({ ...p, blood_group: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">License Number</Label>
                  <Input value={cardForm.license_number} onChange={e => setCardForm(p => ({ ...p, license_number: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Issue Date</Label>
                  <Input value={cardForm.issue_date} onChange={e => setCardForm(p => ({ ...p, issue_date: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Valid Till / Expiry</Label>
                  <Input value={cardForm.expiry_date} onChange={e => setCardForm(p => ({ ...p, expiry_date: e.target.value }))} className="bg-slate-950 border-slate-800 h-8 mt-1" />
                </div>
              </div>
            </Card>
          )}

          {/* MAIN PRINTABLE CARD STAGE */}
          <div id="printable-card-area" className="flex flex-col items-center justify-center gap-8 py-4">
            
            {/* 0. CURVED WAVE EXECUTIVE TEMPLATE (FEATURED USER REQUESTED TEMPLATE) */}
            {selectedTemplateId === 'curved_wave_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT SIDE */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[285px] h-[435px] rounded-3xl bg-gradient-to-b from-[#94b9ee] via-[#d4e4fa] to-[#f4f8fe] border-2 border-blue-200/80 shadow-[0_20px_50px_rgba(37,99,235,0.25)] relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans p-3.5">
                    
                    {/* Metallic Gloss Reflection */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-600/30 via-indigo-400/15 to-transparent rounded-full blur-md -mr-12 -mt-12 pointer-events-none" />
                    <div className="w-10 h-1.5 bg-slate-300/80 border border-white/60 rounded-full mx-auto mb-1 shrink-0 relative z-10" />

                    {/* Header: Company Logo & Name */}
                    <div className="flex items-center justify-between z-10 pt-0.5 px-0.5">
                      <div className="flex items-center gap-2">
                        {cardForm.company_logo_url ? (
                          <img src={cardForm.company_logo_url} alt="Logo" className="h-8 max-w-[130px] object-contain filter drop-shadow-md" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-900/30">JB</div>
                            <div>
                              <span className="text-[11px] font-black tracking-tight text-blue-950 uppercase block leading-none">{cardForm.company_name}</span>
                              <span className="text-[7.5px] text-blue-800 font-bold uppercase tracking-wider block mt-0.5">{cardForm.company_tagline}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge className="bg-blue-900 text-white font-black text-[8.5px] px-2 py-0.5 rounded-lg shadow-sm">
                        {cardForm.employee_number?.startsWith('D') ? 'DRIVER' : 'STAFF'}
                      </Badge>
                    </div>

                    {/* Middle Section: Circular Photo Frame on Left & Name Pill on Right */}
                    <div className="relative z-10 flex items-center gap-2.5 my-2">
                      {/* Large Arch Photo Frame with Glow Ring */}
                      <div className="w-28 h-32 rounded-[32px] border-4 border-white overflow-hidden bg-slate-950 shadow-xl shrink-0 relative ring-2 ring-blue-400/40">
                        {cardForm.photo_url ? (
                          <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500"><User className="w-10 h-10" /></div>
                        )}
                      </div>

                      {/* Name & Designation Badges on Right (NO TRUNCATION, FULL NAME VISIBLE) */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="bg-white/95 backdrop-blur-md border border-blue-100 p-2 rounded-2xl shadow-md">
                          <div className="text-[11px] font-black text-slate-950 uppercase leading-snug break-words text-wrap">{cardForm.name || 'EMPLOYEE NAME'}</div>
                        </div>
                        <div className="bg-blue-950/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-blue-900/10">
                          <div className="text-[9.5px] font-extrabold italic text-blue-950 leading-tight break-words text-wrap">{cardForm.designation}</div>
                        </div>
                      </div>
                    </div>

                    {/* Details Block Grid */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/90 space-y-1 text-[9.5px] font-sans text-slate-800 z-10 font-semibold shadow-sm">
                      <div className="flex justify-between border-b border-blue-100/80 pb-0.5">
                        <span className="text-slate-500 font-bold">ID Code:</span>
                        <span className="font-mono font-extrabold text-blue-950 text-xs">{cardForm.employee_number}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/80 pb-0.5">
                        <span className="text-slate-500 font-bold">Department:</span>
                        <span className="font-extrabold text-slate-900">{cardForm.department || (cardForm.employee_number?.startsWith('D') ? 'Fleet Transit' : 'Operations')}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/80 pb-0.5">
                        <span className="text-slate-500 font-bold">Phone:</span>
                        <span className="font-mono font-bold text-blue-900">{cardForm.contact}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/80 pb-0.5">
                        <span className="text-slate-500 font-bold">Blood Group:</span>
                        <span className="font-mono font-extrabold text-rose-600">{cardForm.blood_group}</span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span className="text-slate-500 font-bold">Access Pass:</span>
                        <span className="font-extrabold text-emerald-700">Official Personnel</span>
                      </div>
                    </div>

                    {/* Bottom Barcode & Enlarged Scannable QR Code Footer */}
                    <div className="bg-white rounded-2xl p-2 flex items-center justify-between border border-blue-100 shadow-md z-10 gap-2">
                      {/* Vector Barcode */}
                      <div className="flex flex-col items-center flex-1 pr-1">
                        <div className="flex gap-0.5 h-6 items-center w-full justify-center opacity-90">
                          {[2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2].map((w, i) => (
                            <div key={i} className="h-full bg-slate-950 rounded-sm" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                        <div className="text-[8px] font-mono text-slate-600 tracking-widest mt-0.5 font-extrabold">{cardForm.employee_number}</div>
                      </div>

                      {/* Scannable High-Definition QR Code */}
                      <div className="w-14 h-14 shrink-0 bg-white p-1 rounded-xl border-2 border-slate-300 shadow-md">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK SIDE */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[285px] h-[435px] rounded-3xl bg-gradient-to-b from-[#94b9ee] via-[#d4e4fa] to-[#f4f8fe] border-2 border-blue-200/80 shadow-[0_20px_50px_rgba(37,99,235,0.25)] relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans p-4 text-center">
                    <div className="w-10 h-1.5 bg-slate-300/80 border border-white/60 rounded-full mx-auto mb-1 shrink-0" />
                    
                    <div className="text-[10.5px] font-black text-blue-950 uppercase tracking-widest border-b border-blue-300/80 pb-1">
                      SECURITY ACCESS &amp; RETURN
                    </div>

                    <div className="text-[8.5px] text-slate-700 text-left space-y-2 my-auto leading-relaxed bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white shadow-sm">
                      <p>• Official Identity Badge of <strong>{cardForm.company_name}</strong>.</p>
                      <p>• Must be worn at all times on duty. Strictly non-transferable.</p>
                      <p>• If lost or found, please return to: <span className="font-bold text-slate-950">{cardForm.company_address}</span></p>
                      <p>• Portal: <span className="font-bold text-blue-900">www.jaibhavanicargo.com</span></p>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-2xl text-left border border-white shadow-sm">
                      <div className="text-[8px] font-bold text-slate-500 uppercase">24x7 Emergency Claim Helpline</div>
                      <div className="text-xs font-mono font-black text-blue-950">{cardForm.emergency_contact || cardForm.company_phone}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-300/80">
                      <div className="w-16 h-16 bg-white p-1 rounded-xl border-2 border-slate-300 shadow-md">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8.5px] text-slate-700">
                        <div className="font-bold text-slate-950 uppercase">{cardForm.auth_sign_title}</div>
                        <div className="text-[8px] font-medium text-slate-600">Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedTemplateId === 'royal_gold_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    
                    {/* Metallic Accent Glow */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />
                    <div className="w-10 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1 shrink-0" />

                    {/* Company Branding */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">JB</div>
                        <div className="text-xs font-black text-amber-400 uppercase tracking-wider">{cardForm.company_name}</div>
                      </div>
                      <div className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">{cardForm.company_tagline}</div>
                    </div>

                    {/* Photo Box with Metallic Border */}
                    <div className="w-28 h-32 rounded-2xl border-2 border-amber-400/80 mx-auto overflow-hidden bg-slate-950 shadow-xl my-2 relative">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[8.5px] font-black py-0.5 uppercase tracking-tighter">
                        BLOOD GROUP: {cardForm.blood_group}
                      </div>
                    </div>

                    {/* Identity Data */}
                    <div className="space-y-1">
                      <div className="text-sm font-black text-white uppercase leading-tight truncate px-1">{cardForm.name || 'EMPLOYEE NAME'}</div>
                      <div className="text-[10px] font-extrabold text-amber-400 uppercase">{cardForm.designation}</div>
                      
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 mt-1 space-y-0.5 text-[9px] font-mono text-left">
                        <div className="flex justify-between"><span className="text-slate-400">EMP NO:</span><span className="font-black text-white">{cardForm.employee_number}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">LICENSE:</span><span className="font-bold text-slate-200">{cardForm.license_number}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">PHONE:</span><span className="font-bold text-amber-300">{cardForm.contact}</span></div>
                      </div>
                    </div>

                    {/* Bottom QR Section */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[8px] font-mono text-left">
                      <div>
                        <div className="text-slate-400">VALID TILL:</div>
                        <div className="font-bold text-amber-400">{cardForm.expiry_date}</div>
                      </div>
                      <div className="w-11 h-11 bg-white p-0.5 rounded-lg shadow">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK VERTICAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    <div className="w-10 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1 shrink-0" />

                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                      TERMS &amp; SECURITY CONDITIONS
                    </div>

                    <div className="text-[8.5px] text-slate-400 text-left space-y-1.5 my-auto leading-relaxed">
                      <p>• Official Identity Pass of <strong>{cardForm.company_name}</strong>. Must be presented upon demand by security.</p>
                      <p>• Strictly non-transferable. Loss must be reported immediately to management.</p>
                      <p>• Return Address: <span className="text-slate-200">{cardForm.company_address}</span></p>
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-left">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">24x7 Emergency Support Helpline</div>
                      <div className="text-xs font-mono font-black text-amber-400">{cardForm.emergency_contact || cardForm.company_phone}</div>
                    </div>

                    {/* QR Verification & Sign */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="w-12 h-12 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8px] text-slate-400">
                        <div className="font-script text-amber-300 text-xs italic font-bold">Vinod Rathod</div>
                        <div className="font-bold text-slate-300 uppercase mt-0.5">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CYBER NEON TECH VERTICAL TEMPLATE */}
            {selectedTemplateId === 'cyber_neon_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-950 border-2 border-cyan-400/60 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                    <div className="w-10 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1 shrink-0 relative z-10" />

                    <div className="relative z-10 space-y-0.5">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-[9px] font-black uppercase px-2 mb-1">CYBER DIGITAL PASS</Badge>
                      <div className="text-xs font-black text-cyan-400 uppercase tracking-widest">{cardForm.company_name}</div>
                    </div>

                    <div className="w-28 h-32 rounded-2xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] mx-auto overflow-hidden bg-slate-900 my-2 relative z-10">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1">
                      <div className="text-sm font-black text-white uppercase truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                      <div className="text-[10px] font-extrabold text-cyan-300 uppercase">{cardForm.designation}</div>
                      <div className="text-xs font-mono font-black text-amber-400 bg-slate-900 border border-slate-800 py-1 rounded-xl">{cardForm.employee_number}</div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-left text-[8px] font-mono text-slate-400">
                        <div>BLOOD: <span className="text-cyan-400 font-bold">{cardForm.blood_group}</span></div>
                        <div>EXP: <span className="text-white font-bold">{cardForm.expiry_date}</span></div>
                      </div>
                      <div className="w-11 h-11 bg-white p-0.5 rounded-lg shadow">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK VERTICAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-950 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    <div className="w-10 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1 shrink-0" />
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1">DIGITAL CLEARANCE PASS</div>

                    <div className="text-[8.5px] text-slate-400 text-left space-y-1.5 my-auto">
                      <p>• Verified Digital Logistics Credentials for <strong>{cardForm.company_name}</strong>.</p>
                      <p>• Scan QR code on front for real-time online identity verification.</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="w-12 h-12 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8px] text-slate-400">
                        <div className="font-bold text-white uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. HEAVY LOGISTICS RED DRIVER PASS VERTICAL TEMPLATE */}
            {selectedTemplateId === 'fleet_red_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-900 border-2 border-rose-500/70 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    
                    <div className="bg-gradient-to-r from-rose-700 to-red-900 -mx-4 -mt-4 p-3 text-white">
                      <div className="text-xs font-black tracking-widest uppercase">{cardForm.company_name}</div>
                      <div className="text-[8px] font-bold text-rose-200 uppercase mt-0.5">COMMERCIAL FLEET DRIVER LICENSE</div>
                    </div>

                    <div className="w-28 h-32 rounded-2xl border-2 border-rose-500 mx-auto overflow-hidden bg-slate-950 shadow-xl my-2">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-black text-white uppercase truncate">{cardForm.name || 'DRIVER NAME'}</div>
                      <div className="text-[10px] font-extrabold text-rose-400 uppercase">{cardForm.designation}</div>
                      <div className="text-xs font-mono font-black text-white bg-slate-950 border border-slate-800 py-1 rounded-xl">{cardForm.employee_number}</div>
                    </div>

                    <div className="text-left text-[9px] font-mono space-y-0.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div>DL NO: <span className="text-rose-300 font-bold">{cardForm.license_number}</span></div>
                      <div>PHONE: <span className="text-white font-bold">{cardForm.contact}</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-left text-[8px] text-slate-400">
                        <div>24x7 HELPLINE:</div>
                        <div className="text-rose-400 font-black font-mono">{cardForm.emergency_contact}</div>
                      </div>
                      <div className="w-10 h-10 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK VERTICAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-900 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest border-b border-slate-800 pb-1">FLEET SAFETY PROTOCOLS</div>

                    <div className="text-[8.5px] text-slate-400 text-left space-y-1.5 my-auto">
                      <p>• Authorized for interstate heavy commercial cargo vehicle transit.</p>
                      <p>• Return to: <span className="text-slate-200">{cardForm.company_address}</span></p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="w-12 h-12 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8px] text-slate-400">
                        <div className="font-bold text-white uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. CORPORATE PEARL WHITE VERTICAL TEMPLATE */}
            {selectedTemplateId === 'corporate_pearl_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-white border-2 border-slate-300 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans text-center">
                    <div className="w-10 h-2 bg-slate-200 border border-slate-300 rounded-full mx-auto mb-1 shrink-0" />

                    <div className="space-y-0.5 border-b-2 border-blue-600 pb-2">
                      <div className="text-xs font-black text-blue-900 uppercase">{cardForm.company_name}</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase">{cardForm.company_tagline}</div>
                    </div>

                    <div className="w-28 h-32 rounded-2xl border-2 border-blue-600 mx-auto overflow-hidden bg-slate-100 shadow-md my-2">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-10 h-10" /></div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-black text-slate-900 uppercase truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                      <div className="text-[10px] font-bold text-blue-700 uppercase">{cardForm.designation}</div>
                      <div className="text-xs font-mono font-bold text-blue-950 bg-slate-100 py-1 rounded-xl border border-slate-300">{cardForm.employee_number}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[8px] font-mono text-slate-600 text-left">
                      <div>
                        <div>BLOOD: <span className="font-bold text-rose-600">{cardForm.blood_group}</span></div>
                        <div>VALID: <span className="font-bold text-slate-900">{cardForm.expiry_date}</span></div>
                      </div>
                      <div className="w-11 h-11 bg-slate-50 p-0.5 rounded-lg border border-slate-300">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK VERTICAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-white border-2 border-slate-300 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans text-center">
                    <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-slate-200 pb-1">EXECUTIVE PASS &amp; HELPLINE</div>

                    <div className="text-[8.5px] text-slate-600 text-left space-y-1.5 my-auto">
                      <p>• Official staff pass of <strong>{cardForm.company_name}</strong>.</p>
                      <p>• Return to: {cardForm.company_address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="w-12 h-12 bg-slate-50 p-0.5 rounded-lg border border-slate-300">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8px] text-slate-600">
                        <div className="font-bold text-slate-900 uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. HIGH SECURITY CLEARANCE BADGE TEMPLATE */}
            {selectedTemplateId === 'security_badge_v' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-950 border-2 border-emerald-500/70 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    <div className="w-10 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1 shrink-0" />

                    <div className="space-y-0.5">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-[9px] font-black uppercase px-2 mb-1">HIGH SECURITY CLEARANCE</Badge>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">{cardForm.company_name}</div>
                    </div>

                    <div className="w-28 h-32 rounded-2xl border-2 border-emerald-400 mx-auto overflow-hidden bg-slate-900 shadow-xl my-2 relative">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
                      )}
                      <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500/90 text-slate-950 font-black text-[8px] rounded-full flex items-center justify-center">✓</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-black text-white uppercase truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                      <div className="text-[10px] font-extrabold text-emerald-400 uppercase">{cardForm.designation}</div>
                      <div className="text-xs font-mono font-black text-emerald-300 bg-slate-900 border border-slate-800 py-1 rounded-xl">{cardForm.employee_number}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-left text-[8px] font-mono text-slate-400">
                        <div>CLEARANCE: <span className="text-emerald-400 font-bold">LEVEL-1</span></div>
                        <div>VALID: <span className="text-white font-bold">{cardForm.expiry_date}</span></div>
                      </div>
                      <div className="w-11 h-11 bg-white p-0.5 rounded-lg shadow">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK VERTICAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[270px] h-[430px] rounded-3xl bg-slate-950 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-1">SECURITY ACCESS TERMS</div>

                    <div className="text-[8.5px] text-slate-400 text-left space-y-1.5 my-auto">
                      <p>• High-security clearance badge for logistics terminals &amp; warehouses.</p>
                      <p>• Scan QR code on front for live security token validation.</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="w-12 h-12 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right text-[8px] text-slate-400">
                        <div className="font-bold text-white uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. CLASSIC HORIZONTAL WALLET PVC TEMPLATE */}
            {selectedTemplateId === 'classic_horizontal' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT HORIZONTAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-700 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">JB</div>
                        <div>
                          <div className="text-xs font-black text-white uppercase">{cardForm.company_name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{cardForm.company_tagline}</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 text-[9px] font-bold">WALLET PVC PASS</Badge>
                    </div>

                    <div className="flex items-center gap-3.5 my-auto">
                      <div className="w-20 h-24 rounded-xl border border-slate-700 overflow-hidden bg-slate-950 shrink-0">
                        {cardForm.photo_url ? (
                          <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-8 h-8" /></div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-black text-white uppercase truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase">{cardForm.designation}</div>
                        <div className="text-xs font-mono font-bold text-slate-300">{cardForm.employee_number}</div>
                        <div className="text-[9px] text-slate-400 font-mono">PHONE: {cardForm.contact}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 text-[8px] font-mono text-slate-400">
                      <div>VALID TILL: <span className="text-white font-bold">{cardForm.expiry_date}</span></div>
                      <div className="w-8 h-8 bg-white p-0.5 rounded">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK HORIZONTAL */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    <div className="text-center pb-1 border-b border-slate-800">
                      <div className="text-[10px] font-black text-amber-400 uppercase">TERMS &amp; SECURITY</div>
                    </div>

                    <div className="text-[9px] text-slate-400 space-y-1 my-auto">
                      <p>• Official Identity Pass of <strong>{cardForm.company_name}</strong>.</p>
                      <p>• Return to: {cardForm.company_address}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[8px] text-slate-400">
                      <div className="w-9 h-9 bg-white p-0.5 rounded">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo Ltd</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Verification Banner */}
          <Card className="bg-slate-900/60 border-slate-800 rounded-3xl p-4 text-xs text-slate-400 no-print">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
              <QrCode className="w-4 h-4 text-amber-400" /> Dynamic Verification QR Code
            </div>
            <p className="text-[11px] leading-relaxed">
              Every vertical ID card generated includes a high-definition scannable QR code linking to <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">{verificationUrl}</code>. Anyone scanning the card will see live employment verification status.
            </p>
          </Card>

        </div>
      </div>

      {/* BATCH PRINT DIALOG */}
      <Dialog open={isBatchOpen} onOpenChange={setIsBatchOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-400" /> Batch Print Grid (A4 Sheet Layout)
            </DialogTitle>
            <CardDescription className="text-xs text-slate-400">
              Select multiple employees to print vertical ID cards on a single sheet
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Selected {batchSelected.length} of {employees.length} employees</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (batchSelected.length === employees.length) setBatchSelected([]);
                  else setBatchSelected(employees.map(e => e.id));
                }}
                className="h-7 text-[11px] rounded-xl border-slate-700 bg-slate-900"
              >
                {batchSelected.length === employees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
              {employees.map(emp => {
                const isChecked = batchSelected.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      if (isChecked) setBatchSelected(batchSelected.filter(id => id !== emp.id));
                      else setBatchSelected([...batchSelected, emp.id]);
                    }}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-center justify-between ${
                      isChecked ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.employee_number}</div>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'}`}>
                      {isChecked && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBatchOpen(false)} className="rounded-xl text-xs border-slate-700">Cancel</Button>
            <Button onClick={() => { setIsBatchOpen(false); handlePrint(); }} className="rounded-xl text-xs font-bold bg-blue-600 text-white">
              <Printer className="w-4 h-4 mr-1.5" /> Print Batch ({batchSelected.length}) Cards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
