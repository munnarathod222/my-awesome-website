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
  Building2, QrCode, CreditCard, ChevronRight, Copy, Check, FileText
} from 'lucide-react';

const SAMPLE_EMPLOYEES = [
  {
    id: 'emp-101',
    employee_number: 'JBC-DRV-401',
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
    employee_number: 'JBC-STF-102',
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
    employee_number: 'JBC-DRV-408',
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

export default function IdCardGeneratorPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern_gold'); // 'modern_gold' | 'fleet_navy' | 'corporate_white' | 'security_vertical'
  const [cardSide, setCardSide] = useState('both'); // 'front' | 'back' | 'both'
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Editable Card Override Fields
  const [cardForm, setCardForm] = useState({
    company_name: 'JAI BHAVANI CARGO',
    company_tagline: 'Logistics & Heavy Transport Fleet',
    company_phone: '+91 7794072244',
    company_email: 'support@jaibhavanicargo.com',
    company_address: 'H.No 3-5-141/A, Transport Hub, Hyderabad, TG - 500001',
    name: '',
    employee_number: '',
    designation: '',
    contact: '',
    emergency_contact: '',
    blood_group: 'O+',
    license_number: '',
    issue_date: '2024-01-01',
    expiry_date: '2029-12-31',
    photo_url: '',
    auth_sign_title: 'Authorized Signatory',
  });

  const cardRef = useRef(null);

  // Load employees from PocketBase + localStorage
  const fetchEmployees = async () => {
    setLoading(true);
    try {
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

      const list = Array.from(mergedMap.values());
      setEmployees(list);

      if (list.length > 0) {
        selectEmployeeForCard(list[0]);
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
      company_address: emp.address || 'H.No 3-5-141/A, Transport Hub, Hyderabad, TG - 500001',
      name: emp.name || '',
      employee_number: emp.employee_number || 'JBC-001',
      designation: emp.designation || (emp.employee_type === 'driver' ? 'Senior Heavy Fleet Driver' : 'Logistics Staff'),
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
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}&color=000000&bgcolor=ffffff`;
  };

  const verificationUrl = `${window.location.origin}/verify-employee/${cardForm.employee_number || 'JBC-EMP'}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <Helmet>
        <title>Employee &amp; Driver ID Card Generator | Jai Bhavani Cargo</title>
        <meta name="description" content="Generate high-resolution printable ID cards for drivers and employees with scannable QR verification code." />
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
              Employee &amp; Driver ID Card Generator
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                QR Scannable
              </Badge>
            </h1>
            <p className="text-xs text-slate-400">Design, customize, &amp; print high-security PVC ID cards for fleet drivers &amp; company staff</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCustomizing(!isCustomizing)} variant="outline" className="rounded-xl text-xs font-bold border-slate-700 bg-slate-900 hover:bg-slate-800">
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
            {isCustomizing ? 'Hide Card Editor' : 'Customize Card Fields'}
          </Button>
          <Button onClick={handlePrint} className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
            <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Directory & Selection */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Select Employee
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
              <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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

          {/* Template Selection Controls */}
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> Select ID Card Template
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'modern_gold', name: 'Modern Dark Gold', badge: 'Premium' },
                { id: 'fleet_navy', name: 'Logistics Fleet Navy', badge: 'Official' },
                { id: 'corporate_white', name: 'Corporate Clean White', badge: 'Standard' },
                { id: 'security_vertical', name: 'Security Pass Vertical', badge: 'Badge' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-2.5 rounded-2xl text-left border transition-all text-xs font-bold ${
                    selectedTemplate === t.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">{t.badge}</div>
                  <div className="font-extrabold text-white mt-0.5">{t.name}</div>
                </button>
              ))}
            </div>

            {/* Side Selection */}
            <div className="pt-2">
              <Label className="text-[11px] font-bold text-slate-400 mb-1.5 block">Card View Format</Label>
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
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Card Preview Studio & Customizer */}
        <div className="lg:col-span-8 space-y-6">

          {/* Optional Form Customizer */}
          {isCustomizing && (
            <Card className="bg-slate-900 border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 no-print">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Customize Live Card Data
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
            
            {/* TEMPLATE 1: MODERN DARK GOLD (CR80 Standard PVC 3.375" x 2.125") */}
            {selectedTemplate === 'modern_gold' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT SIDE */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    
                    {/* Metallic Accent Lines */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-500/20 via-blue-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

                    {/* Top Bar */}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                          JB
                        </div>
                        <div>
                          <div className="text-xs font-black tracking-wider text-amber-400 uppercase leading-none">{cardForm.company_name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{cardForm.company_tagline}</div>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-black uppercase px-2 py-0.5">
                        {cardForm.employee_number?.includes('DRV') ? 'FLEET DRIVER' : 'STAFF PASS'}
                      </Badge>
                    </div>

                    {/* Middle Section: Photo & Details */}
                    <div className="flex items-center gap-3.5 relative z-10 my-1">
                      {/* Photo Box */}
                      <div className="w-20 h-24 rounded-xl border-2 border-amber-400/60 overflow-hidden bg-slate-950 shrink-0 shadow-lg relative">
                        {cardForm.photo_url ? (
                          <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-slate-950 text-[8px] font-black text-center py-0.5 uppercase tracking-tighter">
                          {cardForm.blood_group}
                        </div>
                      </div>

                      {/* Text Data */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-black text-white uppercase tracking-tight leading-tight truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                        <div className="text-[10px] font-extrabold text-amber-400 leading-none">{cardForm.designation}</div>
                        
                        <div className="pt-1.5 space-y-0.5 text-[9.5px]">
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-400 font-bold">ID NO:</span>
                            <span className="font-mono font-black text-white">{cardForm.employee_number}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-400 font-bold">LICENSE:</span>
                            <span className="font-mono font-bold text-slate-200">{cardForm.license_number}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-400 font-bold">PHONE:</span>
                            <span className="font-mono font-bold text-amber-300">{cardForm.contact}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar: QR Code & Dates */}
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 relative z-10">
                      <div className="text-[8px] text-slate-400 font-mono space-y-0.5">
                        <div>ISSUE: <span className="text-white font-bold">{cardForm.issue_date}</span></div>
                        <div>VALID TILL: <span className="text-amber-400 font-bold">{cardForm.expiry_date}</span></div>
                      </div>

                      {/* QR Code */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white p-0.5 rounded-lg shadow-sm">
                          <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK SIDE */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    
                    <div className="text-center pb-1 border-b border-slate-800">
                      <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">TERMS &amp; SECURITY CONDITIONS</div>
                    </div>

                    <div className="space-y-1.5 text-[9px] text-slate-400 leading-relaxed my-auto">
                      <p>• This ID Card is official property of <strong>{cardForm.company_name}</strong>. Must be carried during duty hours.</p>
                      <p>• Unauthorized use or duplication is strictly illegal under Indian Motor Vehicles &amp; Fleet Regulations.</p>
                      <p>• If found lost, please return to: <span className="text-slate-200">{cardForm.company_address}</span></p>
                    </div>

                    {/* Helpline & Verification */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase">24x7 Emergency Helpline</div>
                        <div className="text-xs font-mono font-black text-amber-400">{cardForm.emergency_contact || cardForm.company_phone}</div>
                      </div>
                      <div className="w-9 h-9 bg-white p-0.5 rounded-lg">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Signature Block */}
                    <div className="flex items-end justify-between pt-1 border-t border-slate-800 text-[8px] text-slate-400">
                      <div>www.jaibhavanicargo.com</div>
                      <div className="text-right">
                        <div className="font-script text-amber-300 font-bold italic text-xs leading-none">Vinod Rathod</div>
                        <div className="text-[7.5px] uppercase font-bold text-slate-400 mt-0.5">{cardForm.auth_sign_title}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 2: FLEET NAVY (OFFICIAL LOGISTICS STYLE) */}
            {selectedTemplate === 'fleet_navy' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT SIDE */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-slate-900 border-2 border-blue-600/60 p-0 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    
                    {/* Header Bar */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-3 flex items-center justify-between text-white shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white text-blue-900 font-black text-xs flex items-center justify-center">
                          JBC
                        </div>
                        <div>
                          <div className="text-xs font-black tracking-wider uppercase leading-none">{cardForm.company_name}</div>
                          <div className="text-[8.5px] text-blue-200 font-bold uppercase tracking-wider mt-0.5">Heavy Logistics Transport</div>
                        </div>
                      </div>
                      <Badge className="bg-amber-400 text-slate-950 font-black text-[9px] px-2">
                        {cardForm.employee_number?.includes('DRV') ? 'FLEET DRIVER' : 'STAFF'}
                      </Badge>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 flex items-center gap-3.5 my-auto">
                      <div className="w-20 h-24 rounded-xl border-2 border-blue-500 overflow-hidden bg-slate-950 shrink-0 shadow-md">
                        {cardForm.photo_url ? (
                          <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-8 h-8" /></div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-black text-white uppercase leading-tight truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                        <div className="text-[10px] font-extrabold text-blue-400 leading-none">{cardForm.designation}</div>

                        <div className="pt-1.5 space-y-0.5 text-[9px] font-mono">
                          <div>ID NO: <span className="text-amber-400 font-bold">{cardForm.employee_number}</span></div>
                          <div>DL NO: <span className="text-white font-bold">{cardForm.license_number}</span></div>
                          <div>PHONE: <span className="text-slate-300 font-bold">{cardForm.contact}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Ribbon */}
                    <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-t border-blue-900/60 text-[8px] text-slate-400">
                      <div>EMERGENCY: <span className="text-rose-400 font-bold">{cardForm.emergency_contact}</span></div>
                      <div className="w-8 h-8 bg-white p-0.5 rounded">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK SIDE */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-slate-900 border-2 border-blue-900/50 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
                    <div className="text-center pb-1 border-b border-blue-800/40">
                      <div className="text-[10px] font-black text-blue-400 uppercase">FLEET DRIVER IDENTITY &amp; PASS</div>
                    </div>

                    <div className="text-[9px] text-slate-300 space-y-1 my-auto">
                      <p>• Issued by Jai Bhavani Cargo Fleet Administration.</p>
                      <p>• Address: <span className="text-white">{cardForm.company_address}</span></p>
                      <p>• Helpline: <span className="text-amber-400 font-bold">{cardForm.company_phone}</span></p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="w-10 h-10 bg-white p-0.5 rounded-lg">
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

            {/* TEMPLATE 3: CORPORATE CLEAN WHITE */}
            {selectedTemplate === 'corporate_white' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT SIDE */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-white border-2 border-slate-300 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans">
                    
                    <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
                      <div>
                        <div className="text-sm font-black text-blue-900 uppercase tracking-tight">{cardForm.company_name}</div>
                        <div className="text-[8.5px] text-slate-500 font-bold uppercase">{cardForm.company_tagline}</div>
                      </div>
                      <Badge className="bg-blue-600 text-white font-bold text-[9px] px-2">OFFICIAL</Badge>
                    </div>

                    <div className="flex items-center gap-3.5 my-auto">
                      <div className="w-20 h-24 rounded-xl border border-slate-400 overflow-hidden bg-slate-100 shrink-0 shadow">
                        {cardForm.photo_url ? (
                          <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-8 h-8" /></div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-black text-slate-900 uppercase leading-tight truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                        <div className="text-[10px] font-bold text-blue-700">{cardForm.designation}</div>

                        <div className="pt-1.5 space-y-0.5 text-[9px] font-mono text-slate-700">
                          <div>EMP CODE: <span className="font-bold text-slate-900">{cardForm.employee_number}</span></div>
                          <div>BLOOD GRP: <span className="font-bold text-rose-600">{cardForm.blood_group}</span></div>
                          <div>PHONE: <span className="font-bold text-slate-900">{cardForm.contact}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-[8px] text-slate-600 font-mono">
                      <div>VALID TILL: <span className="font-bold text-slate-900">{cardForm.expiry_date}</span></div>
                      <div className="w-8 h-8 bg-slate-100 p-0.5 rounded border border-slate-300">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}

                {/* BACK SIDE */}
                {(cardSide === 'both' || cardSide === 'back') && (
                  <div className="w-[380px] h-[240px] rounded-2xl bg-white border-2 border-slate-300 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-900 font-sans">
                    <div className="text-center pb-1 border-b border-slate-200">
                      <div className="text-[10px] font-black text-blue-900 uppercase">COMPANY RETURN &amp; HELPLINE</div>
                    </div>

                    <div className="text-[9px] text-slate-600 space-y-1 my-auto">
                      <p>If lost, please return to: <strong>{cardForm.company_address}</strong></p>
                      <p>Phone: <strong>{cardForm.company_phone}</strong> | Email: <strong>{cardForm.company_email}</strong></p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[8px] text-slate-600">
                      <div className="w-9 h-9 bg-slate-100 p-0.5 rounded border border-slate-300">
                        <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 uppercase">{cardForm.auth_sign_title}</div>
                        <div>Jai Bhavani Cargo</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 4: SECURITY PASS VERTICAL LANYARD FORMAT */}
            {selectedTemplate === 'security_vertical' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                
                {/* FRONT VERTICAL */}
                {(cardSide === 'both' || cardSide === 'front') && (
                  <div className="w-[240px] h-[380px] rounded-2xl bg-slate-950 border-2 border-amber-500/50 p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-100 font-sans text-center">
                    
                    {/* Top Hole Punch Clip Marker */}
                    <div className="w-8 h-2 bg-slate-800 border border-slate-700 rounded-full mx-auto mb-1" />

                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-amber-400 uppercase tracking-widest">{cardForm.company_name}</div>
                      <div className="text-[8px] text-slate-400 font-bold uppercase">{cardForm.company_tagline}</div>
                    </div>

                    {/* Photo */}
                    <div className="w-24 h-28 rounded-2xl border-2 border-amber-400 mx-auto overflow-hidden bg-slate-900 shadow-xl my-2">
                      {cardForm.photo_url ? (
                        <img src={cardForm.photo_url} alt={cardForm.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="text-sm font-black text-white uppercase truncate">{cardForm.name || 'EMPLOYEE NAME'}</div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase mt-0.5">{cardForm.designation}</div>
                      <div className="text-[10px] font-mono text-slate-300 font-extrabold mt-1">{cardForm.employee_number}</div>
                    </div>

                    {/* QR Code */}
                    <div className="w-14 h-14 bg-white p-1 rounded-xl mx-auto my-1 shadow">
                      <img src={generateQrUrl(verificationUrl)} alt="QR Code" className="w-full h-full object-contain" />
                    </div>

                    <div className="text-[8px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                      VALID: <span className="text-white font-bold">{cardForm.expiry_date}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Quick Action Guide */}
          <Card className="bg-slate-900/60 border-slate-800 rounded-3xl p-4 text-xs text-slate-400 no-print">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
              <QrCode className="w-4 h-4 text-amber-400" /> Scannable Verification Link
            </div>
            <p className="text-[11px] leading-relaxed">
              Every generated ID card features an official scannable QR code linking directly to <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">{verificationUrl}</code>. Security officers and clients can scan the code to instantly verify active employee &amp; driver credentials on their phone.
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}
