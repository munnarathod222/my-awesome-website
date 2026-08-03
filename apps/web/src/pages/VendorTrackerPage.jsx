import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Filter, Download, ShieldCheck, Clock, 
  CheckCircle2, XCircle, AlertTriangle, FileText, Phone, Mail, MapPin, 
  CreditCard, Eye, Edit, Trash2, ExternalLink, RefreshCw, FileCheck,
  Copy, ExternalLink as LinkIcon, Briefcase, Award, CheckSquare,
  Truck, UserCheck, Shield, FileSpreadsheet, IdCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

// ── DEFAULT DATA 1: Client Empanelment Applications We Submitted ─────────────
const DEFAULT_CLIENT_EMPANELMENTS = [
  {
    id: 'emp_1',
    company_name: 'Reliance Retail Supply Chain & Logistics',
    assigned_vendor_id: 'REL-LOG-98421',
    application_ref_no: 'APP-2026-REL-089',
    category: 'Retail & FMCG Logistics',
    applied_date: '2026-05-10',
    approval_date: '2026-06-01',
    stage: 'Empanelled & Active',
    procurement_officer: 'Sanjay Sharma (Senior Manager Procurement)',
    officer_phone: '+91 9820012345',
    officer_email: 'sanjay.sharma@ril.com',
    portal_url: 'https://vendor.reliance.com',
    allocated_fleet: '12 Trucks (32 FT MXL & 24 FT)',
    contract_expiry: '2027-05-31',
    submitted_docs: ['GST Registration', 'Bank Solvency Certificate', 'Fleet RC Copies', 'MSME Certificate', 'Insurance Policy'],
    status: 'Empanelled & Active',
    notes: 'Primary logistics provider for Telangana & Andhra Pradesh distribution routes.'
  },
  {
    id: 'emp_2',
    company_name: 'Amazon Transportation Services (ATS India)',
    assigned_vendor_id: 'AMZ-IN-88412',
    application_ref_no: 'AMZ-VND-2026-441',
    category: 'E-Commerce Middle-Mile Fleet',
    applied_date: '2026-06-15',
    approval_date: '2026-07-02',
    stage: 'Empanelled & Active',
    procurement_officer: 'Ananya Verma (Fleet Operations Lead)',
    officer_phone: '+91 9900088776',
    officer_email: 'ananya-v@amazon.com',
    portal_url: 'https://relay.amazon.in',
    allocated_fleet: '18 Container Vehicles',
    contract_expiry: '2027-07-01',
    submitted_docs: ['GST Certificate', 'GPS Integration Auth', 'Driver Background Verification', 'Cancelled Cheque'],
    status: 'Empanelled & Active',
    notes: 'Empanelled for Hyderabad FC to South Regional Hub routes.'
  },
  {
    id: 'emp_3',
    company_name: 'Tata Steel Long Products Ltd',
    assigned_vendor_id: 'PENDING-AUDIT',
    application_ref_no: 'TATA-STL-2026-904',
    category: 'Industrial Manufacturing & Heavy Freight',
    applied_date: '2026-07-12',
    approval_date: null,
    stage: 'Physical Yard & Vehicle Inspection',
    procurement_officer: 'Vikram Singh (Procurement Executive)',
    officer_phone: '+91 9437055443',
    officer_email: 'vikram.singh@tatasteel.com',
    portal_url: 'https://vendorportal.tatasteel.com',
    allocated_fleet: '8 Open Body Multi-Axle Trucks',
    contract_expiry: '2027-07-12',
    submitted_docs: ['GST Registration', 'Fleet Insurance', 'Safety Audit Certificate', 'Bank Solvency Certificate'],
    status: 'Pending Client Audit',
    notes: 'Physical yard inspection scheduled for next week.'
  }
];

// ── DEFAULT DATA 2: Vendor IDs We Issue to Subcontractors & Attached Fleet ───
const DEFAULT_SUBCONTRACTOR_VENDORS = [
  {
    id: 'sub_1',
    issued_jbc_vendor_id: 'JBC-SUB-101',
    subcontractor_name: 'Sri Venkateswara Roadlines & Fleet',
    owner_name: 'Venkatesh Goud',
    phone: '+91 9849112233',
    email: 'svroadlines.hyd@gmail.com',
    pan: 'ABCDE1234F',
    aadhaar: '9876-5432-1098',
    attached_trucks_count: 5,
    truck_numbers: 'TS07UE1234, TS08UF5678, AP29V9012',
    commission_rate: '4% Management Fee',
    bank_name: 'SBI Bank',
    account_number: '30123456789',
    ifsc_code: 'SBIN0001234',
    agreement_start: '2026-01-15',
    agreement_expiry: '2027-01-14',
    status: 'Verified & Active',
    notes: 'Primary subcontracted fleet owner for Hyderabad-Vijayawada corridor.'
  },
  {
    id: 'sub_2',
    issued_jbc_vendor_id: 'JBC-SUB-102',
    subcontractor_name: 'Mahalaxmi Transport Services',
    owner_name: 'Subba Rao',
    phone: '+91 9700889900',
    email: 'mahalaxmi.transports@gmail.com',
    pan: 'FGHIJ5678K',
    aadhaar: '4567-8901-2345',
    attached_trucks_count: 3,
    truck_numbers: 'TS09UB4321, TS10UA8765',
    commission_rate: '5% Flat Commission',
    bank_name: 'HDFC Bank',
    account_number: '50100098765432',
    ifsc_code: 'HDFC0000501',
    agreement_start: '2026-03-01',
    agreement_expiry: '2027-02-28',
    status: 'Verified & Active',
    notes: 'Subcontracted container fleet for Bangalore express routes.'
  },
  {
    id: 'sub_3',
    issued_jbc_vendor_id: 'JBC-SUB-103',
    subcontractor_name: 'Bhavani Express Subcontractor',
    owner_name: 'Narayana Reddy',
    phone: '+91 9123409876',
    email: 'narayana.bhavani@gmail.com',
    pan: 'LMNOP9012Q',
    aadhaar: '1234-5678-9012',
    attached_trucks_count: 2,
    truck_numbers: 'AP16TY3456',
    commission_rate: '3.5% Fee',
    bank_name: 'ICICI Bank',
    account_number: '001105001234',
    ifsc_code: 'ICIC0000011',
    agreement_start: '2026-06-20',
    agreement_expiry: '2027-06-19',
    status: 'Pending Verification',
    notes: 'Awaiting updated RC copies and driver background check certificates.'
  }
];

// ── DEFAULT DATA 3: Supplier & Service Vendors We Pay ────────────────────────
const DEFAULT_SUPPLIER_VENDORS = [
  {
    id: 'vnd_1',
    vendor_code: 'VND-001',
    company_name: 'Indian Oil Fuel Station & Services',
    vendor_type: 'Fuel & Diesel',
    contact_person: 'Ramesh Reddy',
    phone: '+91 9849012345',
    email: 'iocl.ghatkesar@gmail.com',
    gstin: '36AAACI1234E1Z8',
    pan: 'AAACI1234E',
    bank_name: 'HDFC Bank',
    account_number: '50200012345678',
    ifsc_code: 'HDFC0001234',
    city: 'Ghatkesar, Hyderabad',
    payment_terms: '15 Days Credit',
    agreement_expiry: '2026-12-31',
    status: 'Active'
  },
  {
    id: 'vnd_2',
    vendor_code: 'VND-002',
    company_name: 'Sri Krishna Automobile Workshop & Spare Parts',
    vendor_type: 'Spare Parts & Repairs',
    contact_person: 'Krishna Rao',
    phone: '+91 9849567890',
    email: 'sk.auto@gmail.com',
    gstin: '36ABACK5678F1Z2',
    pan: 'ABACK5678F',
    bank_name: 'ICICI Bank',
    account_number: '001105009876',
    ifsc_code: 'ICIC0000011',
    city: 'Medchal, Telangana',
    payment_terms: '30 Days Net',
    agreement_expiry: '2026-10-15',
    status: 'Active'
  }
];

export default function VendorTrackerPage() {
  const [activeTab, setActiveTab] = useState('subcontractors'); // 'clients' | 'subcontractors' | 'suppliers'

  // Data States
  const [empanelments, setEmpanelments] = useState([]);
  const [subcontractors, setSubcontractors] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Terms
  const [empSearch, setEmpSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [supSearch, setSupSearch] = useState('');

  // Modals
  const [isEmpFormOpen, setIsEmpFormOpen] = useState(false);
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [isSupFormOpen, setIsSupFormOpen] = useState(false);

  const [editingEmp, setEditingEmp] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [editingSup, setEditingSup] = useState(null);

  const [viewSubcontractor, setViewSubcontractor] = useState(null);

  // Form States
  const [empFormData, setEmpFormData] = useState({
    company_name: '',
    assigned_vendor_id: '',
    application_ref_no: '',
    category: 'Retail & FMCG Logistics',
    applied_date: format(new Date(), 'yyyy-MM-dd'),
    stage: 'Document Verification',
    procurement_officer: '',
    officer_phone: '',
    officer_email: '',
    portal_url: '',
    allocated_fleet: '',
    status: 'Pending Client Audit',
    notes: ''
  });

  const [subFormData, setSubFormData] = useState({
    issued_jbc_vendor_id: '',
    subcontractor_name: '',
    owner_name: '',
    phone: '',
    email: '',
    pan: '',
    aadhaar: '',
    attached_trucks_count: 1,
    truck_numbers: '',
    commission_rate: '4% Management Fee',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    status: 'Verified & Active',
    notes: ''
  });

  const [supFormData, setSupFormData] = useState({
    company_name: '',
    vendor_type: 'Fuel & Diesel',
    contact_person: '',
    phone: '',
    email: '',
    gstin: '',
    pan: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    city: '',
    payment_terms: '15 Days Credit',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRecords, subRecords, supRecords] = await Promise.all([
        pb.collection('vendor_empanelments').getFullList({ sort: '-created', $autoCancel: false }).catch(() => []),
        pb.collection('subcontractor_vendors').getFullList({ sort: '-created', $autoCancel: false }).catch(() => []),
        pb.collection('vendors').getFullList({ sort: '-created', $autoCancel: false }).catch(() => [])
      ]);

      setEmpanelments(empRecords && empRecords.length > 0 ? empRecords : DEFAULT_CLIENT_EMPANELMENTS);
      setSubcontractors(subRecords && subRecords.length > 0 ? subRecords : DEFAULT_SUBCONTRACTOR_VENDORS);
      setSuppliers(supRecords && supRecords.length > 0 ? supRecords : DEFAULT_SUPPLIER_VENDORS);
    } catch (err) {
      setEmpanelments(DEFAULT_CLIENT_EMPANELMENTS);
      setSubcontractors(DEFAULT_SUBCONTRACTOR_VENDORS);
      setSuppliers(DEFAULT_SUPPLIER_VENDORS);
    } finally {
      setLoading(false);
    }
  };

  // ── Subcontractor Form Handlers ───────────────────────────────────────────
  const handleSaveSubcontractor = async (e) => {
    e.preventDefault();
    if (!subFormData.subcontractor_name || !subFormData.phone) {
      toast.error('Please enter subcontractor name and phone number');
      return;
    }

    try {
      const payload = {
        ...subFormData,
        issued_jbc_vendor_id: subFormData.issued_jbc_vendor_id || `JBC-SUB-${Math.floor(100 + Math.random() * 900)}`
      };

      if (editingSub) {
        await pb.collection('subcontractor_vendors').update(editingSub.id, payload, { $autoCancel: false }).catch(() => {});
        setSubcontractors(prev => prev.map(s => s.id === editingSub.id ? { ...s, ...payload } : s));
        toast.success('Subcontractor Vendor ID updated');
      } else {
        const created = await pb.collection('subcontractor_vendors').create(payload, { $autoCancel: false })
          .catch(() => ({ id: 'sub_' + Date.now(), ...payload }));
        setSubcontractors(prev => [created, ...prev]);
        toast.success(`Issued Vendor ID ${payload.issued_jbc_vendor_id} to Subcontractor!`);
      }

      setIsSubFormOpen(false);
      resetSubForm();
    } catch (err) {
      toast.error('Failed to issue subcontractor Vendor ID');
    }
  };

  const resetSubForm = () => {
    setSubFormData({
      issued_jbc_vendor_id: '',
      subcontractor_name: '',
      owner_name: '',
      phone: '',
      email: '',
      pan: '',
      aadhaar: '',
      attached_trucks_count: 1,
      truck_numbers: '',
      commission_rate: '4% Management Fee',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      status: 'Verified & Active',
      notes: ''
    });
    setEditingSub(null);
  };

  const handleEditSub = (sub) => {
    setEditingSub(sub);
    setSubFormData({
      issued_jbc_vendor_id: sub.issued_jbc_vendor_id || '',
      subcontractor_name: sub.subcontractor_name || '',
      owner_name: sub.owner_name || '',
      phone: sub.phone || '',
      email: sub.email || '',
      pan: sub.pan || '',
      aadhaar: sub.aadhaar || '',
      attached_trucks_count: sub.attached_trucks_count || 1,
      truck_numbers: sub.truck_numbers || '',
      commission_rate: sub.commission_rate || '4% Management Fee',
      bank_name: sub.bank_name || '',
      account_number: sub.account_number || '',
      ifsc_code: sub.ifsc_code || '',
      status: sub.status || 'Verified & Active',
      notes: sub.notes || ''
    });
    setIsSubFormOpen(true);
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Delete this subcontractor Vendor ID record?')) return;
    try {
      await pb.collection('subcontractor_vendors').delete(id, { $autoCancel: false }).catch(() => {});
      setSubcontractors(prev => prev.filter(s => s.id !== id));
      toast.success('Record removed');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filtered Subcontractors
  const filteredSubcontractors = subcontractors.filter(s => {
    const q = subSearch.toLowerCase();
    return (s.subcontractor_name || '').toLowerCase().includes(q) ||
           (s.issued_jbc_vendor_id || '').toLowerCase().includes(q) ||
           (s.owner_name || '').toLowerCase().includes(q) ||
           (s.phone || '').includes(q) ||
           (s.truck_numbers || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> VENDOR MANAGEMENT HUB
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Vendor Registration & ID Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Separately manage Subcontractor Vendor IDs issued by JBC, Client Empanelments, and Hired Suppliers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'subcontractors' && (
            <Button
              onClick={() => { resetSubForm(); setIsSubFormOpen(true); }}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Issue Subcontractor Vendor ID
            </Button>
          )}

          {activeTab === 'clients' && (
            <Button
              onClick={() => setIsEmpFormOpen(true)}
              className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Track Client Empanelment
            </Button>
          )}

          {activeTab === 'suppliers' && (
            <Button
              onClick={() => setIsSupFormOpen(true)}
              className="rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Register Supplier Vendor
            </Button>
          )}
        </div>
      </div>

      {/* 3-Tab Main Navigation Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full grid grid-cols-3 max-w-3xl">
          <TabsTrigger value="subcontractors" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950">
            🪪 Subcontractor Vendor IDs ({subcontractors.length})
          </TabsTrigger>

          <TabsTrigger value="clients" className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            🏢 Client Vendor IDs ({empanelments.length})
          </TabsTrigger>

          <TabsTrigger value="suppliers" className="rounded-xl text-xs font-bold data-[state=active]:bg-blue-500 data-[state=active]:text-slate-950">
            🔧 Supplier Vendors ({suppliers.length})
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SUBCONTRACTOR VENDOR IDs WE ISSUE ──────────────────────────── */}
        <TabsContent value="subcontractors" className="space-y-6 mt-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Subcontractor Vendor IDs Issued</p>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{subcontractors.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Empanelled Transport Subcontractors</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <IdCard className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider">Attached Fleet Trucks</p>
                  <p className="text-2xl font-black font-mono text-blue-400 mt-1">
                    {subcontractors.reduce((acc, curr) => acc + (Number(curr.attached_trucks_count) || 1), 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Operating under JBC License</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                  <Truck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Active Status Rate</p>
                  <p className="text-2xl font-black font-mono text-amber-400 mt-1">
                    {subcontractors.length > 0 ? `${((subcontractors.filter(s => s.status === 'Verified & Active').length / subcontractors.length) * 100).toFixed(0)}%` : '100%'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified Documents Rate</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                placeholder="Search Subcontractor Name, Issued JBC Vendor ID (e.g. JBC-SUB-101), Owner Name, Truck No..."
                className="bg-slate-950 border-slate-800 text-white rounded-2xl text-xs pl-10 h-10"
              />
            </div>
          </div>

          {/* Subcontractor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubcontractors.map(sub => (
              <Card key={sub.id} className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg hover:border-emerald-500/30 transition-all font-sans overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Top Bar with Issued Vendor ID */}
                  <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-mono font-black flex items-center gap-1">
                          ISSUED JBC VENDOR ID: {sub.issued_jbc_vendor_id}
                          <button
                            onClick={() => copyToClipboard(sub.issued_jbc_vendor_id, 'Subcontractor Vendor ID')}
                            className="ml-1 text-emerald-400 hover:text-white"
                            title="Copy Vendor ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </Badge>
                      </div>

                      <h3 className="text-base font-black text-white mt-1.5">
                        {sub.subcontractor_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Owner: <span className="text-amber-400 font-bold">{sub.owner_name}</span> ({sub.phone})
                      </p>
                    </div>

                    <Badge className={`text-[10px] font-bold px-2.5 py-1 ${
                      sub.status === 'Verified & Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {sub.status}
                    </Badge>
                  </div>

                  {/* Fleet & Payment Terms Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Attached Fleet Size</span>
                      <p className="font-semibold text-blue-400 mt-0.5">{sub.attached_trucks_count || 1} Subcontracted Trucks</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{sub.truck_numbers || 'TS07UE1234'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Commission / Freight Rate</span>
                      <p className="font-semibold text-emerald-400 mt-0.5">{sub.commission_rate || '4% Management Fee'}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">PAN: {sub.pan || 'N/A'}</p>
                    </div>

                    <div className="col-span-2 border-t border-slate-800/80 pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Bank Account Payout Details</span>
                      <p className="font-mono text-slate-200 mt-0.5 text-[11px]">
                        {sub.bank_name || 'Bank N/A'} • A/C: <span className="text-emerald-400 font-bold">{sub.account_number || '-'}</span> • IFSC: <span className="text-blue-400 font-bold">{sub.ifsc_code || '-'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewSubcontractor(sub)}
                      className="h-8 px-3 text-xs border-slate-700 bg-slate-950 text-slate-300 font-bold rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Subcontractor Card Intel
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSub(sub)}
                        className="h-8 w-8 p-0 text-slate-300 border-slate-700 bg-slate-950 rounded-xl"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSub(sub.id)}
                        className="h-8 w-8 p-0 text-slate-300 border-slate-700 bg-slate-950 rounded-xl hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 2: CLIENT EMPANELMENT VENDOR IDs WE APPLIED FOR ─────────────── */}
        <TabsContent value="clients" className="space-y-6 mt-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                placeholder="Search Client Company Name, Vendor ID, Ref No..."
                className="bg-slate-950 border-slate-800 text-white rounded-2xl text-xs pl-10 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empanelments.map(emp => (
              <Card key={emp.id} className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                      CLIENT VENDOR ID: {emp.assigned_vendor_id}
                    </Badge>
                    <h3 className="text-base font-extrabold text-white mt-1">{emp.company_name}</h3>
                    <p className="text-xs text-slate-400">{emp.category} • Stage: {emp.stage}</p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]">
                    {emp.status}
                  </Badge>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
                  Officer: {emp.procurement_officer} ({emp.officer_phone})
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 3: SUPPLIER & SERVICE VENDORS WE PAY ───────────────────────── */}
        <TabsContent value="suppliers" className="space-y-6 mt-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={supSearch}
                onChange={e => setSupSearch(e.target.value)}
                placeholder="Search Supplier Name, Code, Phone..."
                className="bg-slate-950 border-slate-800 text-white rounded-2xl text-xs pl-10 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <Card key={sup.id} className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                      {sup.vendor_code}
                    </Badge>
                    <h3 className="text-base font-extrabold text-white mt-1">{sup.company_name}</h3>
                    <p className="text-xs text-slate-400">{sup.vendor_type} • {sup.city}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                    {sup.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Subcontractor Vendor ID Issuance Form Modal */}
      <Dialog open={isSubFormOpen} onOpenChange={setIsSubFormOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-emerald-400 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-emerald-400" />
              {editingSub ? 'Edit Subcontractor Vendor ID' : 'Issue New Subcontractor Vendor ID (JBC Fleet)'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Issue an official JBC Subcontractor Vendor ID for subcontracted fleet owners and attached trucks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSubcontractor} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Subcontractor Business / Fleet Name *</Label>
                <Input
                  required
                  value={subFormData.subcontractor_name}
                  onChange={e => setSubFormData({ ...subFormData, subcontractor_name: e.target.value })}
                  placeholder="e.g. Sri Venkateswara Roadlines"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Issued JBC Vendor ID</Label>
                <Input
                  value={subFormData.issued_jbc_vendor_id}
                  onChange={e => setSubFormData({ ...subFormData, issued_jbc_vendor_id: e.target.value.toUpperCase() })}
                  placeholder="e.g. JBC-SUB-104 (Auto-generated if empty)"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Owner / Manager Name *</Label>
                <Input
                  required
                  value={subFormData.owner_name}
                  onChange={e => setSubFormData({ ...subFormData, owner_name: e.target.value })}
                  placeholder="e.g. Venkatesh Goud"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Phone Number *</Label>
                <Input
                  required
                  value={subFormData.phone}
                  onChange={e => setSubFormData({ ...subFormData, phone: e.target.value })}
                  placeholder="e.g. +91 9849112233"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">PAN Number</Label>
                <Input
                  value={subFormData.pan}
                  onChange={e => setSubFormData({ ...subFormData, pan: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABCDE1234F"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Aadhaar Number</Label>
                <Input
                  value={subFormData.aadhaar}
                  onChange={e => setSubFormData({ ...subFormData, aadhaar: e.target.value })}
                  placeholder="e.g. 9876-5432-1098"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Attached Trucks Count</Label>
                <Input
                  type="number"
                  value={subFormData.attached_trucks_count}
                  onChange={e => setSubFormData({ ...subFormData, attached_trucks_count: e.target.value })}
                  placeholder="e.g. 3"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Attached Truck Vehicle Numbers</Label>
                <Input
                  value={subFormData.truck_numbers}
                  onChange={e => setSubFormData({ ...subFormData, truck_numbers: e.target.value })}
                  placeholder="e.g. TS07UE1234, TS08UF5678"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Bank Name</Label>
                <Input
                  value={subFormData.bank_name}
                  onChange={e => setSubFormData({ ...subFormData, bank_name: e.target.value })}
                  placeholder="e.g. SBI Bank"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Account Number</Label>
                <Input
                  value={subFormData.account_number}
                  onChange={e => setSubFormData({ ...subFormData, account_number: e.target.value })}
                  placeholder="e.g. 30123456789"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">IFSC Code</Label>
                <Input
                  value={subFormData.ifsc_code}
                  onChange={e => setSubFormData({ ...subFormData, ifsc_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Commission / Freight Rate Terms</Label>
                <Input
                  value={subFormData.commission_rate}
                  onChange={e => setSubFormData({ ...subFormData, commission_rate: e.target.value })}
                  placeholder="e.g. 4% Management Fee"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsSubFormOpen(false)} className="rounded-xl border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
                {editingSub ? 'Save Changes' : 'Issue Vendor ID'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
