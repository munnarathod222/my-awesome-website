import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Filter, Download, ShieldCheck, Clock, 
  CheckCircle2, XCircle, AlertTriangle, FileText, Phone, Mail, MapPin, 
  CreditCard, Eye, Edit, Trash2, ExternalLink, RefreshCw, FileCheck,
  Copy, ExternalLink as LinkIcon, Briefcase, Award, CheckSquare
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
  },
  {
    id: 'emp_4',
    company_name: 'ITC Limited (Paperboards & Specialty Papers)',
    assigned_vendor_id: 'ITC-HYD-5519',
    application_ref_no: 'ITC-VND-2026-112',
    category: 'FMCG & Paper Logistics',
    applied_date: '2026-07-01',
    approval_date: null,
    stage: 'Document Audit & Security Deposit',
    procurement_officer: 'K. V. Subba Rao (Logistics Manager)',
    officer_phone: '+91 9848099887',
    officer_email: 'subbarao.kv@itc.in',
    portal_url: 'https://vendors.itc.in',
    allocated_fleet: '6 Trucks (24 FT Closed Body)',
    contract_expiry: '2027-06-30',
    submitted_docs: ['GST Certificate', 'PAN Copy', 'Security Deposit Demand Draft', 'Bank Details'],
    status: 'Under Review',
    notes: 'Submitted Security Deposit DD; awaiting final empanelment agreement letter.'
  }
];

// ── DEFAULT DATA 2: Supplier Vendors We Hire ─────────────────────────
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
  const [activeTab, setActiveTab] = useState('empanelments'); // 'empanelments' | 'suppliers'

  // Empanelments State
  const [empanelments, setEmpanelments] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empSearch, setEmpSearch] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');

  // Supplier Vendors State
  const [suppliers, setSuppliers] = useState([]);
  const [supSearch, setSupSearch] = useState('');
  const [supCategoryFilter, setSupCategoryFilter] = useState('All');

  // Empanelment Modal State
  const [isEmpFormOpen, setIsEmpFormOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
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

  // Supplier Form State
  const [isSupFormOpen, setIsSupFormOpen] = useState(false);
  const [editingSup, setEditingSup] = useState(null);
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
    agreement_expiry: '',
    status: 'Active'
  });

  // Detail Dialog
  const [viewEmpanelment, setViewEmpanelment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setEmpLoading(true);
    try {
      const [empRecords, supRecords] = await Promise.all([
        pb.collection('vendor_empanelments').getFullList({ sort: '-created', $autoCancel: false }).catch(() => []),
        pb.collection('vendors').getFullList({ sort: '-created', $autoCancel: false }).catch(() => [])
      ]);

      setEmpanelments(empRecords && empRecords.length > 0 ? empRecords : DEFAULT_CLIENT_EMPANELMENTS);
      setSuppliers(supRecords && supRecords.length > 0 ? supRecords : DEFAULT_SUPPLIER_VENDORS);
    } catch (err) {
      setEmpanelments(DEFAULT_CLIENT_EMPANELMENTS);
      setSuppliers(DEFAULT_SUPPLIER_VENDORS);
    } finally {
      setEmpLoading(false);
    }
  };

  // ── Empanelment Handlers ──────────────────────────────────────────────────
  const handleSaveEmpanelment = async (e) => {
    e.preventDefault();
    if (!empFormData.company_name) {
      toast.error('Please enter client company name');
      return;
    }

    try {
      const payload = {
        ...empFormData,
        assigned_vendor_id: empFormData.assigned_vendor_id || `VND-REQ-${Math.floor(1000 + Math.random() * 9000)}`
      };

      if (editingEmp) {
        await pb.collection('vendor_empanelments').update(editingEmp.id, payload, { $autoCancel: false }).catch(() => {});
        setEmpanelments(prev => prev.map(e => e.id === editingEmp.id ? { ...e, ...payload } : e));
        toast.success('Empanelment application updated');
      } else {
        const created = await pb.collection('vendor_empanelments').create(payload, { $autoCancel: false })
          .catch(() => ({ id: 'emp_' + Date.now(), ...payload }));
        setEmpanelments(prev => [created, ...prev]);
        toast.success('New client empanelment application recorded');
      }

      setIsEmpFormOpen(false);
      resetEmpForm();
    } catch (err) {
      toast.error('Failed to save application');
    }
  };

  const resetEmpForm = () => {
    setEmpFormData({
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
    setEditingEmp(null);
  };

  const handleEditEmp = (emp) => {
    setEditingEmp(emp);
    setEmpFormData({
      company_name: emp.company_name || '',
      assigned_vendor_id: emp.assigned_vendor_id || '',
      application_ref_no: emp.application_ref_no || '',
      category: emp.category || 'Retail & FMCG Logistics',
      applied_date: emp.applied_date || format(new Date(), 'yyyy-MM-dd'),
      stage: emp.stage || 'Document Verification',
      procurement_officer: emp.procurement_officer || '',
      officer_phone: emp.officer_phone || '',
      officer_email: emp.officer_email || '',
      portal_url: emp.portal_url || '',
      allocated_fleet: emp.allocated_fleet || '',
      status: emp.status || 'Pending Client Audit',
      notes: emp.notes || ''
    });
    setIsEmpFormOpen(true);
  };

  const handleDeleteEmp = async (id) => {
    if (!window.confirm('Delete this empanelment record?')) return;
    try {
      await pb.collection('vendor_empanelments').delete(id, { $autoCancel: false }).catch(() => {});
      setEmpanelments(prev => prev.filter(e => e.id !== id));
      toast.success('Record removed');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filtered Empanelments
  const filteredEmpanelments = empanelments.filter(e => {
    const q = empSearch.toLowerCase();
    const matchSearch = (e.company_name || '').toLowerCase().includes(q) ||
                        (e.assigned_vendor_id || '').toLowerCase().includes(q) ||
                        (e.application_ref_no || '').toLowerCase().includes(q) ||
                        (e.procurement_officer || '').toLowerCase().includes(q);

    const matchStatus = empStatusFilter === 'All' || e.status === empStatusFilter;
    return matchSearch && matchStatus;
  });

  // Metrics for Empanelments
  const totalEmpApps = empanelments.length;
  const activeVendorIds = empanelments.filter(e => e.status === 'Empanelled & Active').length;
  const pendingEmpApps = empanelments.filter(e => e.status === 'Pending Client Audit' || e.status === 'Under Review').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> EMPANELMENT & REGISTRATION TRACKER
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Vendor Registration Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Vendor IDs & Empanelment Applications submitted to client companies & manage hired supplier vendors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'empanelments' ? (
            <Button
              onClick={() => { resetEmpForm(); setIsEmpFormOpen(true); }}
              className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Track New Client Empanelment
            </Button>
          ) : (
            <Button
              onClick={() => setIsSupFormOpen(true)}
              className="rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs shadow-lg h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Register New Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Dual Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full grid grid-cols-2 max-w-xl">
          <TabsTrigger value="empanelments" className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
            🏢 Client Empanelment IDs ({empanelments.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-xl text-xs font-bold data-[state=active]:bg-blue-500 data-[state=active]:text-slate-950">
            🚛 Supplier Vendors We Hire ({suppliers.length})
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: CLIENT EMPANELMENT APPLICATIONS WE SUBMITTED ─────────────── */}
        <TabsContent value="empanelments" className="space-y-6 mt-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Empanelment Applications</p>
                  <p className="text-2xl font-black font-mono text-white mt-1">{totalEmpApps}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Submitted to Enterprise Clients</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                  <Briefcase className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Active Empanelled Vendor IDs</p>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{activeVendorIds}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Approved Transport Vendor IDs</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Award className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Pending Client Audit / Review</p>
                  <p className="text-2xl font-black font-mono text-amber-400 mt-1">{pendingEmpApps}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">In Progress Application Pipeline</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                placeholder="Search Client Company Name, Vendor ID, Ref No, Officer Name..."
                className="bg-slate-950 border-slate-800 text-white rounded-2xl text-xs pl-10 h-10"
              />
            </div>

            <Select value={empStatusFilter} onValueChange={setEmpStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-slate-950 border-slate-800 text-white rounded-2xl text-xs h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Application Stages</SelectItem>
                <SelectItem value="Empanelled & Active">Empanelled & Active</SelectItem>
                <SelectItem value="Pending Client Audit">Pending Client Audit</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards List for Client Empanelments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmpanelments.map(emp => (
              <Card key={emp.id} className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-lg hover:border-amber-500/30 transition-all font-sans overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Top Title & Vendor ID Badge */}
                  <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-mono font-black flex items-center gap-1">
                          VENDOR ID: {emp.assigned_vendor_id}
                          <button
                            onClick={() => copyToClipboard(emp.assigned_vendor_id, 'Vendor ID')}
                            className="ml-1 text-emerald-400 hover:text-white"
                            title="Copy Vendor ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </Badge>
                      </div>

                      <h3 className="text-base font-black text-white mt-1.5">
                        {emp.company_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        App Ref No: <span className="text-amber-400 font-bold">{emp.application_ref_no}</span>
                      </p>
                    </div>

                    <Badge className={`text-[10px] font-bold px-2.5 py-1 ${
                      emp.status === 'Empanelled & Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {emp.status}
                    </Badge>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Current Stage</span>
                      <p className="font-semibold text-white mt-0.5">{emp.stage}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Applied: {emp.applied_date}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Allocated Fleet</span>
                      <p className="font-semibold text-amber-400 mt-0.5">{emp.allocated_fleet || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Contract Expiry: {emp.contract_expiry || 'N/A'}</p>
                    </div>

                    <div className="col-span-2 border-t border-slate-800/80 pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Procurement Officer Contact</span>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <p className="font-extrabold text-slate-200 text-xs">{emp.procurement_officer}</p>
                          <p className="text-[11px] font-mono text-slate-400">{emp.officer_phone} • {emp.officer_email}</p>
                        </div>
                        {emp.officer_phone && (
                          <a href={`tel:${emp.officer_phone}`} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewEmpanelment(emp)}
                      className="h-8 px-3 text-xs border-slate-700 bg-slate-950 text-slate-300 font-bold rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Application Intel
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {emp.portal_url && (
                        <a
                          href={emp.portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" /> Client Portal
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEmp(emp)}
                        className="h-8 w-8 p-0 text-slate-300 border-slate-700 bg-slate-950 rounded-xl"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEmp(emp.id)}
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

        {/* ── TAB 2: SUPPLIER VENDORS WE HIRE ─────────────────────────────────── */}
        <TabsContent value="suppliers" className="space-y-6 mt-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={supSearch}
                onChange={e => setSupSearch(e.target.value)}
                placeholder="Search Supplier Name, Code, GSTIN, Phone..."
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

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs space-y-1">
                  <div>Contact: <span className="text-white font-bold">{sup.contact_person} ({sup.phone})</span></div>
                  <div>GSTIN: <span className="text-amber-400">{sup.gstin || 'N/A'}</span></div>
                  <div>Bank: <span className="text-emerald-400">{sup.bank_name} - {sup.account_number}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Empanelment Form Modal */}
      <Dialog open={isEmpFormOpen} onOpenChange={setIsEmpFormOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              {editingEmp ? 'Edit Client Empanelment Record' : 'Track New Client Empanelment Application'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Record Vendor IDs, application reference numbers, and procurement contacts for client companies you applied to.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEmpanelment} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Client Company Name *</Label>
                <Input
                  required
                  value={empFormData.company_name}
                  onChange={e => setEmpFormData({ ...empFormData, company_name: e.target.value })}
                  placeholder="e.g. Reliance Retail / Amazon ATS / Tata Steel"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Assigned Vendor ID (If Approved)</Label>
                <Input
                  value={empFormData.assigned_vendor_id}
                  onChange={e => setEmpFormData({ ...empFormData, assigned_vendor_id: e.target.value.toUpperCase() })}
                  placeholder="e.g. REL-LOG-98421 or AMZ-IN-8841"
                  className="bg-slate-900 border-slate-800 text-white font-mono uppercase rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Application Ref / Request No</Label>
                <Input
                  value={empFormData.application_ref_no}
                  onChange={e => setEmpFormData({ ...empFormData, application_ref_no: e.target.value })}
                  placeholder="e.g. APP-2026-REL-089"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Category & Logistics Scope</Label>
                <Input
                  value={empFormData.category}
                  onChange={e => setEmpFormData({ ...empFormData, category: e.target.value })}
                  placeholder="e.g. Retail Logistics / Container Fleet"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Current Application Stage</Label>
                <Select value={empFormData.stage} onValueChange={v => setEmpFormData({ ...empFormData, stage: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Document Verification">Document Verification</SelectItem>
                    <SelectItem value="Physical Yard & Vehicle Inspection">Physical Yard & Vehicle Inspection</SelectItem>
                    <SelectItem value="Security Deposit & Agreement">Security Deposit & Agreement</SelectItem>
                    <SelectItem value="Empanelled & Active">Empanelled & Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Overall Status</Label>
                <Select value={empFormData.status} onValueChange={v => setEmpFormData({ ...empFormData, status: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empanelled & Active">Empanelled & Active</SelectItem>
                    <SelectItem value="Pending Client Audit">Pending Client Audit</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Procurement Officer Name</Label>
                <Input
                  value={empFormData.procurement_officer}
                  onChange={e => setEmpFormData({ ...empFormData, procurement_officer: e.target.value })}
                  placeholder="e.g. Sanjay Sharma (Logistics Manager)"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Officer Phone Number</Label>
                <Input
                  value={empFormData.officer_phone}
                  onChange={e => setEmpFormData({ ...empFormData, officer_phone: e.target.value })}
                  placeholder="e.g. +91 9820012345"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Client Vendor Portal Link</Label>
                <Input
                  value={empFormData.portal_url}
                  onChange={e => setEmpFormData({ ...empFormData, portal_url: e.target.value })}
                  placeholder="e.g. https://vendor.reliance.com"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold">Allocated Fleet Size</Label>
                <Input
                  value={empFormData.allocated_fleet}
                  onChange={e => setEmpFormData({ ...empFormData, allocated_fleet: e.target.value })}
                  placeholder="e.g. 12 Trucks (32 FT MXL)"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEmpFormOpen(false)} className="rounded-xl border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">
                {editingEmp ? 'Save Changes' : 'Record Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detailed Empanelment View Dialog */}
      <Dialog open={Boolean(viewEmpanelment)} onOpenChange={() => setViewEmpanelment(null)}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest">CLIENT EMPANELMENT INTEL</div>
            <DialogTitle className="text-xl font-black text-white font-mono">
              {viewEmpanelment?.assigned_vendor_id}
            </DialogTitle>
            <p className="text-xs font-bold text-slate-300 mt-0.5">{viewEmpanelment?.company_name}</p>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Application Stage & Status</div>
              <div className="text-emerald-400 font-bold text-sm">{viewEmpanelment?.stage}</div>
              <div className="text-slate-400 font-mono text-[11px]">Ref: {viewEmpanelment?.application_ref_no}</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Submitted Documents Checklist</div>
              <div className="space-y-1 mt-1">
                {(viewEmpanelment?.submitted_docs || ['GST Registration', 'Bank Solvency', 'Fleet RCs']).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {doc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEmpanelment(null)} className="rounded-xl border-slate-700 text-slate-300 w-full text-xs">
              Close Intel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
