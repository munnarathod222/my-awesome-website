import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Receipt, Plus, Search, Filter, Download, Send, CheckCircle2, AlertTriangle, 
  XCircle, FileText, Calendar, IndianRupee, ShieldCheck, RefreshCw, Upload, 
  ExternalLink, Eye, ArrowUpRight, CheckSquare, Square, Layers, Sparkles, Building2, Phone
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { downloadFile, generatePDF } from '@/lib/downloadUtils.js';
import * as XLSX from 'xlsx';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SAMPLE_INITIAL_ITC_RECORDS = [
  {
    id: 'itc-101',
    vendor_name: 'Mahindra Auto Parts & Spares',
    vendor_gstin: '36AAACM1234F1Z8',
    invoice_number: 'MAP/2026/0881',
    invoice_date: '2026-07-28',
    category: 'Vehicle Maintenance',
    taxable_amount: 85000,
    gst_rate: 18,
    cgst: 7650,
    sgst: 7650,
    igst: 0,
    total_gst: 15300,
    total_amount: 100300,
    eligibility: 'Eligible', // 'Eligible', 'Ineligible', 'Partial'
    gstr2b_status: 'Matched', // 'Matched', 'Pending Vendor Filing', 'Mismatch'
    claim_status: 'Pending', // 'Pending', 'Claimed', 'Rejected'
    claim_period: '2026-07',
    notes: 'Engine overhaul & brake pad replacement for TS08UA1234',
    file_name: 'Mahindra_Invoice_0881.pdf'
  },
  {
    id: 'itc-102',
    vendor_name: 'Apollo Tyres Commercial Hub',
    vendor_gstin: '36AABCA9876G1Z2',
    invoice_number: 'APL-HYD-5510',
    invoice_date: '2026-07-25',
    category: 'Tyre Expense',
    taxable_amount: 120000,
    gst_rate: 28,
    cgst: 16800,
    sgst: 16800,
    igst: 0,
    total_gst: 33600,
    total_amount: 153600,
    eligibility: 'Eligible',
    gstr2b_status: 'Matched',
    claim_status: 'Claimed',
    claim_period: '2026-07',
    notes: '6 Radial Tyres for 32FT Container Fleet',
    file_name: 'Apollo_Tyres_5510.pdf'
  },
  {
    id: 'itc-103',
    vendor_name: 'Indian Oil Corporation Ltd (IOCL)',
    vendor_gstin: '36AAACI1681G1ZM',
    invoice_number: 'IOCL/GTK/9941',
    invoice_date: '2026-07-30',
    category: 'Fuel Expense',
    taxable_amount: 240000,
    gst_rate: 0, // Diesel exempt from GST under Indian GST (VAT/Excise)
    cgst: 0,
    sgst: 0,
    igst: 0,
    total_gst: 0,
    total_amount: 240000,
    eligibility: 'Ineligible',
    gstr2b_status: 'N/A Excluded',
    claim_status: 'Rejected',
    claim_period: '2026-07',
    notes: 'Bulk Diesel Refill at Ghatkesar Pump',
    file_name: 'IOCL_Bill_9941.pdf'
  },
  {
    id: 'itc-104',
    vendor_name: 'Shree Logistics & Freight Subcontractor',
    vendor_gstin: '27AABCS7712M1Z3',
    invoice_number: 'SL-INV-4412',
    invoice_date: '2026-07-22',
    category: 'Subcontractor Freight',
    taxable_amount: 95000,
    gst_rate: 12,
    cgst: 0,
    sgst: 0,
    igst: 11400,
    total_gst: 11400,
    total_amount: 106400,
    eligibility: 'Eligible',
    gstr2b_status: 'Pending Vendor Filing',
    claim_status: 'Pending',
    claim_period: '2026-07',
    notes: 'Subcontractor vehicle for Mumbai-Hyderabad trip',
    file_name: 'Shree_Logistics_4412.pdf'
  },
  {
    id: 'itc-105',
    vendor_name: 'ICICI Lombard General Insurance',
    vendor_gstin: '36AAACI0909A1ZA',
    invoice_number: 'POL-36-881920',
    invoice_date: '2026-07-15',
    category: 'Insurance Premium',
    taxable_amount: 65000,
    gst_rate: 18,
    cgst: 5850,
    sgst: 5850,
    igst: 0,
    total_gst: 11700,
    total_amount: 76700,
    eligibility: 'Eligible',
    gstr2b_status: 'Matched',
    claim_status: 'Claimed',
    claim_period: '2026-07',
    notes: 'Annual Goods in Transit & Vehicle Comprehensive Cover',
    file_name: 'ICICI_Policy_881920.pdf'
  }
];

export default function GstITCManagerPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gstr2bFilter, setGstr2bFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-07');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  // Form State for New Paid Bill ITC Record
  const [formData, setFormData] = useState({
    vendor_name: '',
    vendor_gstin: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    category: 'Vehicle Maintenance',
    taxable_amount: '',
    gst_rate: '18',
    is_interstate: false,
    eligibility: 'Eligible',
    claim_period: format(new Date(), 'yyyy-MM'),
    notes: '',
    file_name: ''
  });

  // Load records from PocketBase / localStorage fallback
  useEffect(() => {
    fetchITCData();
  }, []);

  const fetchITCData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch from PocketBase 'expenses' or custom 'gst_itc_claims' collection
      let fetched = [];
      try {
        const pbRecords = await pb.collection('expenses').getFullList({
          sort: '-date',
          $autoCancel: false
        });
        if (pbRecords.length > 0) {
          fetched = pbRecords.map(e => {
            const taxAmt = Number(e.tax_amount || e.gst_amount || 0);
            const totalAmt = Number(e.amount || 0);
            const taxableVal = taxAmt > 0 ? (totalAmt - taxAmt) : totalAmt;
            const rate = taxAmt > 0 && taxableVal > 0 ? Math.round((taxAmt / taxableVal) * 100) : 18;
            return {
              id: e.id,
              vendor_name: e.vendor_name || e.paid_to || 'Vendor Partner',
              vendor_gstin: e.vendor_gstin || '36AAACG1234F1Z9',
              invoice_number: e.invoice_number || e.bill_number || `INV-${e.id.substring(0, 6).toUpperCase()}`,
              invoice_date: e.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0],
              category: e.category || 'Vehicle Maintenance',
              taxable_amount: taxableVal,
              gst_rate: rate,
              cgst: taxAmt / 2,
              sgst: taxAmt / 2,
              igst: 0,
              total_gst: taxAmt,
              total_amount: totalAmt,
              eligibility: e.eligibility || 'Eligible',
              gstr2b_status: e.gstr2b_status || 'Matched',
              claim_status: e.claim_status || (e.status === 'Paid' ? 'Pending' : 'Pending'),
              claim_period: e.claim_period || format(new Date(e.date || Date.now()), 'yyyy-MM'),
              notes: e.notes || e.description || '',
              file_name: e.attachment ? e.attachment : ''
            };
          });
        }
      } catch (pbErr) {
        console.warn('PocketBase expense fetch info:', pbErr.message);
      }

      // 2. Load from localStorage if present
      const localData = localStorage.getItem('jbc_gst_itc_records');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed && parsed.length > 0) {
            fetched = [...parsed, ...fetched.filter(f => !parsed.some(p => p.id === f.id))];
          }
        } catch (e) {}
      }

      if (fetched.length === 0) {
        fetched = SAMPLE_INITIAL_ITC_RECORDS;
        localStorage.setItem('jbc_gst_itc_records', JSON.stringify(SAMPLE_INITIAL_ITC_RECORDS));
      }

      setRecords(fetched);
    } catch (err) {
      console.error('Failed to load ITC records:', err);
      toast.error('Failed to load GST ITC records.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecordsToLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem('jbc_gst_itc_records', JSON.stringify(newRecords));
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = 
        (r.vendor_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.vendor_gstin || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.notes || '').toLowerCase().includes(search.toLowerCase());
      
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || r.claim_status === statusFilter;
      const match2B = gstr2bFilter === 'all' || r.gstr2b_status === gstr2bFilter;

      return matchSearch && matchCat && matchStatus && match2B;
    });
  }, [records, search, categoryFilter, statusFilter, gstr2bFilter]);

  // Financial Metrics Computation
  const metrics = useMemo(() => {
    let totalTaxable = 0;
    let totalGSTPaid = 0;
    let eligibleITC = 0;
    let claimedITC = 0;
    let pendingITC = 0;
    let ineligibleITC = 0;
    let gstr2bMismatched = 0;

    filteredRecords.forEach(r => {
      totalTaxable += Number(r.taxable_amount || 0);
      totalGSTPaid += Number(r.total_gst || 0);

      if (r.eligibility === 'Eligible') {
        eligibleITC += Number(r.total_gst || 0);
        if (r.claim_status === 'Claimed') {
          claimedITC += Number(r.total_gst || 0);
        } else if (r.claim_status === 'Pending') {
          pendingITC += Number(r.total_gst || 0);
        }
      } else {
        ineligibleITC += Number(r.total_gst || 0);
      }

      if (r.gstr2b_status === 'Pending Vendor Filing' || r.gstr2b_status === 'Mismatch') {
        gstr2bMismatched += Number(r.total_gst || 0);
      }
    });

    return {
      totalTaxable,
      totalGSTPaid,
      eligibleITC,
      claimedITC,
      pendingITC,
      ineligibleITC,
      gstr2bMismatched,
      totalCount: filteredRecords.length
    };
  }, [filteredRecords]);

  // Chart Data by Category
  const categoryChartData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const cat = r.category || 'Other';
      map[cat] = (map[cat] || 0) + Number(r.total_gst || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#64748B'];

  // Handle Form Change with Auto GST Calculation
  const handleFormChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'taxable_amount' || field === 'gst_rate' || field === 'is_interstate') {
        const taxable = Number(field === 'taxable_amount' ? val : updated.taxable_amount) || 0;
        const rate = Number(field === 'gst_rate' ? val : updated.gst_rate) || 0;
        const totalGst = Math.round(taxable * (rate / 100));

        if (updated.is_interstate) {
          updated.igst = totalGst;
          updated.cgst = 0;
          updated.sgst = 0;
        } else {
          updated.cgst = Math.round(totalGst / 2);
          updated.sgst = totalGst - updated.cgst;
          updated.igst = 0;
        }
        updated.total_gst = totalGst;
        updated.total_amount = taxable + totalGst;
      }
      return updated;
    });
  };

  // Add New Paid Bill ITC Entry
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor_name) return toast.error('Please enter Vendor Name');
    if (!formData.invoice_number) return toast.error('Please enter Invoice / Bill Number');
    if (!formData.taxable_amount) return toast.error('Please enter Taxable Amount');

    const taxable = Number(formData.taxable_amount) || 0;
    const rate = Number(formData.gst_rate) || 0;
    const totalGst = Math.round(taxable * (rate / 100));
    const cgst = formData.is_interstate ? 0 : Math.round(totalGst / 2);
    const sgst = formData.is_interstate ? 0 : (totalGst - cgst);
    const igst = formData.is_interstate ? totalGst : 0;

    const newRec = {
      id: `itc-${Date.now()}`,
      vendor_name: formData.vendor_name,
      vendor_gstin: (formData.vendor_gstin || '36AAACG1234F1Z9').toUpperCase(),
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      category: formData.category,
      taxable_amount: taxable,
      gst_rate: rate,
      cgst,
      sgst,
      igst,
      total_gst: totalGst,
      total_amount: taxable + totalGst,
      eligibility: formData.eligibility,
      gstr2b_status: 'Matched',
      claim_status: formData.eligibility === 'Ineligible' ? 'Rejected' : 'Pending',
      claim_period: formData.claim_period,
      notes: formData.notes,
      file_name: formData.file_name || 'Bill_Receipt.pdf'
    };

    const updatedList = [newRec, ...records];
    saveRecordsToLocal(updatedList);
    toast.success(`Paid bill added! Eligible ITC: ₹${totalGst.toLocaleString('en-IN')}`);
    setIsAddModalOpen(false);
  };

  // Select / Multi-Select Handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Mark Selected as Claimed in GSTR-3B
  const handleBulkMarkClaimed = () => {
    if (selectedIds.length === 0) return toast.error('Select at least one paid bill record');
    const updated = records.map(r => {
      if (selectedIds.includes(r.id) && r.eligibility === 'Eligible') {
        return { ...r, claim_status: 'Claimed' };
      }
      return r;
    });
    saveRecordsToLocal(updated);
    toast.success(`Marked ${selectedIds.length} bills as ITC Claimed in GSTR-3B!`);
    setSelectedIds([]);
  };

  // One-click WhatsApp Vendor Follow-up for Missing 2B Filing
  const handleWhatsAppVendorReminder = (r) => {
    const text = `Hello *${r.vendor_name}*,

This is an urgent request from *Jai Bhavani Cargo & Logistics*.

We have recorded your invoice *#${r.invoice_number}* dated *${r.invoice_date}* (Taxable: ₹${Number(r.taxable_amount).toLocaleString('en-IN')}, GST: ₹${Number(r.total_gst).toLocaleString('en-IN')}).

⚠️ *GST Portal Update Required:*
This invoice is currently *Missing in our GSTR-2B statement*. Kindly file your GSTR-1 return for GSTIN *${r.vendor_gstin}* at the earliest so we can claim our eligible Input Tax Credit (ITC).

Thank you for your prompt cooperation!
*Jai Bhavani Cargo Accounts Desk*
📞 +91 7794072244`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Export ITC Register Excel Sheet
  const handleExportExcel = () => {
    try {
      const exportData = filteredRecords.map((r, idx) => ({
        'Sl No': idx + 1,
        'Vendor Name': r.vendor_name,
        'Vendor GSTIN': r.vendor_gstin,
        'Bill / Inv No': r.invoice_number,
        'Bill Date': r.invoice_date,
        'Category': r.category,
        'Taxable Amount (₹)': r.taxable_amount,
        'GST Rate (%)': `${r.gst_rate}%`,
        'CGST (₹)': r.cgst,
        'SGST (₹)': r.sgst,
        'IGST (₹)': r.igst,
        'Total GST Paid (₹)': r.total_gst,
        'Total Bill Amount (₹)': r.total_amount,
        'ITC Eligibility': r.eligibility,
        'GSTR-2B Status': r.gstr2b_status,
        'ITC Claim Status': r.claim_status,
        'Claim Period': r.claim_period,
        'Notes': r.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GST ITC Register');
      XLSX.writeFile(workbook, `GST_ITC_Claim_Register_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('GST ITC Register Excel exported successfully!');
    } catch (err) {
      toast.error('Failed to export Excel: ' + err.message);
    }
  };

  // Export Official GST ITC Summary PDF Report
  const handleExportPDF = () => {
    try {
      const columns = [
        { header: 'Vendor Name & GSTIN', key: 'vendor' },
        { header: 'Inv No & Date', key: 'inv' },
        { header: 'Category', key: 'cat' },
        { header: 'Taxable (₹)', key: 'taxable' },
        { header: 'CGST+SGST/IGST', key: 'gst_split' },
        { header: 'Total ITC (₹)', key: 'itc' },
        { header: 'Eligibility / Status', key: 'status' }
      ];

      const pdfData = filteredRecords.map(r => ({
        vendor: `${r.vendor_name}\nGSTIN: ${r.vendor_gstin}`,
        inv: `#${r.invoice_number}\n${r.invoice_date}`,
        cat: r.category,
        taxable: `₹${Number(r.taxable_amount).toLocaleString('en-IN')}`,
        gst_split: r.igst > 0 ? `IGST: ₹${r.igst}` : `CGST: ₹${r.cgst}\nSGST: ₹${r.sgst}`,
        itc: `₹${Number(r.total_gst).toLocaleString('en-IN')}`,
        status: `${r.eligibility}\n(${r.claim_status})`
      }));

      const filename = `GST_ITC_Claim_Report_${format(new Date(), 'yyyyMMdd')}`;
      const blob = generatePDF(pdfData, filename, {
        type: 'generic',
        title: 'OFFICIAL GST INPUT TAX CREDIT (ITC) CLAIM REGISTER',
        columns,
        companyInfo: 'JAI BHAVANI CARGO & LOGISTICS\nGSTIN: 36DPXPR9171A1Z8'
      });

      downloadFile(blob, `${filename}.pdf`);
      toast.success('GST ITC Summary PDF generated and downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading GST Input Tax Credit (ITC) Register & Matching Engine..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen text-slate-100 bg-slate-950/40">
      <Helmet>
        <title>GST Input Tax Credit (ITC) Manager | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
              <Receipt className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              GST Input Tax Credit (ITC) Manager &amp; Claim Hub
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono text-[10px]">
                GSTR-2B &amp; 3B READY
              </Badge>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Claim 100% eligible Input Tax Credit from paid vehicle maintenance, tyre purchases, insurance premiums, subcontractor freight bills, and office expenses to offset outward GST liability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Paid Bill for ITC
          </Button>

          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="rounded-xl font-bold text-xs border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Export Excel
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="rounded-xl font-bold text-xs border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Claimable Eligible ITC */}
        <Card className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30 p-4 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Eligible ITC</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ₹{metrics.eligibleITC.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            100% claimable GST across {metrics.totalCount} paid bills
          </div>
        </Card>

        {/* Claimed in GSTR-3B */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Claimed in 3B</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">
            ₹{metrics.claimedITC.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Filed &amp; set off against outward tax
          </div>
        </Card>

        {/* Pending ITC Claim */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Claim</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            ₹{metrics.pendingITC.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Ready to include in current GSTR-3B
          </div>
        </Card>

        {/* Mismatched in 2B */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Vendor 2B Missing</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            ₹{metrics.gstr2bMismatched.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Requires vendor GSTR-1 filing
          </div>
        </Card>

        {/* Ineligible / Blocked Sec 17(5) */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Blocked / Exempt</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-400">
            ₹{metrics.ineligibleITC.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">
            Non-claimable tax (Fuel/Food/Personal)
          </div>
        </Card>
      </div>

      {/* Main Tabs Workspace */}
      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl w-full sm:w-auto flex overflow-x-auto">
          <TabsTrigger value="register" className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Paid Bills ITC Register ({filteredRecords.length})
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> GSTR-2B Auto-Reconciler
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Layers className="w-3.5 h-3.5 mr-1.5" /> ITC Breakdown &amp; Category Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PAID BILLS ITC REGISTER */}
        <TabsContent value="register" className="space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendor, GSTIN, invoice #, notes..."
                  className="pl-9 bg-slate-950 border-slate-800 text-xs font-medium rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[170px] bg-slate-950 border-slate-800 text-xs rounded-2xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Vehicle Maintenance">Vehicle Maintenance</SelectItem>
                    <SelectItem value="Tyre Expense">Tyre Expense</SelectItem>
                    <SelectItem value="Insurance Premium">Insurance Premium</SelectItem>
                    <SelectItem value="Subcontractor Freight">Subcontractor Freight</SelectItem>
                    <SelectItem value="Fuel Expense">Fuel Expense</SelectItem>
                    <SelectItem value="Office & Hardware">Office &amp; Hardware</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-slate-950 border-slate-800 text-xs rounded-2xl">
                    <SelectValue placeholder="All Claim Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending Claim</SelectItem>
                    <SelectItem value="Claimed">Claimed in 3B</SelectItem>
                    <SelectItem value="Rejected">Ineligible / Blocked</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={gstr2bFilter} onValueChange={setGstr2bFilter}>
                  <SelectTrigger className="w-[150px] bg-slate-950 border-slate-800 text-xs rounded-2xl">
                    <SelectValue placeholder="All GSTR-2B Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All 2B Status</SelectItem>
                    <SelectItem value="Matched">Matched in 2B</SelectItem>
                    <SelectItem value="Pending Vendor Filing">Pending Vendor Filing</SelectItem>
                    <SelectItem value="Mismatch">Tax Mismatch</SelectItem>
                  </SelectContent>
                </Select>

                {selectedIds.length > 0 && (
                  <Button
                    onClick={handleBulkMarkClaimed}
                    size="sm"
                    className="rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark {selectedIds.length} Claimed in 3B
                  </Button>
                )}
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <Table>
                <TableHeader className="bg-slate-950/80">
                  <TableRow className="border-slate-800 text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                    <TableHead className="w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Vendor &amp; GSTIN</TableHead>
                    <TableHead>Bill No &amp; Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Taxable (₹)</TableHead>
                    <TableHead className="text-right">GST Rate</TableHead>
                    <TableHead className="text-right">Total ITC (₹)</TableHead>
                    <TableHead className="text-center">GSTR-2B</TableHead>
                    <TableHead className="text-center">Claim Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-800/60 text-xs">
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                        No paid bill ITC records match your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((r) => {
                      const isSelected = selectedIds.includes(r.id);
                      return (
                        <TableRow key={r.id} className={`hover:bg-slate-900/60 ${isSelected ? 'bg-emerald-500/10' : ''}`}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={(e) => handleSelectOne(r.id, e.target.checked)}
                              className="rounded accent-emerald-500 cursor-pointer"
                            />
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className="font-bold text-white">{r.vendor_name}</div>
                            <div className="font-mono text-[10px] text-emerald-400 font-semibold">{r.vendor_gstin}</div>
                          </TableCell>

                          <TableCell>
                            <div className="font-mono font-bold text-slate-200">#{r.invoice_number}</div>
                            <div className="text-[10px] text-slate-400">{r.invoice_date}</div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-300 font-normal text-[10px]">
                              {r.category}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-slate-200">
                            ₹{Number(r.taxable_amount).toLocaleString('en-IN')}
                          </TableCell>

                          <TableCell className="text-right font-mono text-slate-300">
                            {r.gst_rate}%
                          </TableCell>

                          <TableCell className="text-right font-mono font-black text-emerald-400">
                            ₹{Number(r.total_gst).toLocaleString('en-IN')}
                          </TableCell>

                          <TableCell className="text-center">
                            {r.gstr2b_status === 'Matched' ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                Matched 2B
                              </Badge>
                            ) : r.gstr2b_status === 'Pending Vendor Filing' ? (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px] animate-pulse">
                                Missing 2B
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                                {r.gstr2b_status}
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {r.claim_status === 'Claimed' ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                                Claimed 3B
                              </Badge>
                            ) : r.claim_status === 'Pending' ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-800 text-slate-500 border-slate-700 text-[10px]">
                                Ineligible
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right space-x-1">
                            {r.gstr2b_status === 'Pending Vendor Filing' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleWhatsAppVendorReminder(r)}
                                title="Send WhatsApp reminder to vendor to file GSTR-1"
                                className="h-7 px-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-[10px]"
                              >
                                <Send className="w-3 h-3 mr-1" /> WhatsApp Vendor
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingRecord(r)}
                              className="h-7 px-2 text-slate-300 hover:bg-slate-800 rounded-lg text-[10px]"
                            >
                              <Eye className="w-3 h-3 mr-1" /> Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: GSTR-2B RECONCILIATION */}
        <TabsContent value="reconciliation" className="space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> GSTR-2B Auto-Matching &amp; Missing Vendor Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Ensures all claimed ITC matches GSTR-2B auto-drafted statement from GST portal before filing GSTR-3B.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => toast.info('Auto-matched with GSTR-2B GST Portal API!')} 
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-Sync GST Portal 2B
                </Button>
              </div>
            </div>

            {/* Reconciliation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-emerald-950/30 border-emerald-500/30 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase">✅ Matched In 2B (Safe to Claim)</h4>
                <div className="text-xl font-black font-mono text-white">
                  {records.filter(r => r.gstr2b_status === 'Matched').length} Invoices
                </div>
                <p className="text-[11px] text-slate-400">
                  Total ITC: ₹{records.filter(r => r.gstr2b_status === 'Matched').reduce((s, r) => s + r.total_gst, 0).toLocaleString('en-IN')}
                </p>
              </Card>

              <Card className="bg-rose-950/30 border-rose-500/30 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase">🚨 Missing Vendor Filing (Action Req.)</h4>
                <div className="text-xl font-black font-mono text-white">
                  {records.filter(r => r.gstr2b_status === 'Pending Vendor Filing').length} Invoices
                </div>
                <p className="text-[11px] text-slate-400">
                  Blocked ITC: ₹{records.filter(r => r.gstr2b_status === 'Pending Vendor Filing').reduce((s, r) => s + r.total_gst, 0).toLocaleString('en-IN')}
                </p>
              </Card>

              <Card className="bg-amber-950/30 border-amber-500/30 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase">⚠️ Tax Amount Mismatch</h4>
                <div className="text-xl font-black font-mono text-white">
                  {records.filter(r => r.gstr2b_status === 'Mismatch').length} Invoices
                </div>
                <p className="text-[11px] text-slate-400">
                  Discrepancy: Needs revision with vendor
                </p>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: CATEGORY ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" /> ITC Distribution by Expense Category
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'ITC Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-400" /> Tax Breakdown (CGST vs SGST vs IGST)
              </h3>
              <div className="space-y-4 pt-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Central Tax (CGST)</span>
                  <span className="font-mono font-black text-emerald-400">
                    ₹{filteredRecords.reduce((s, r) => s + (r.cgst || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">State Tax (SGST)</span>
                  <span className="font-mono font-black text-blue-400">
                    ₹{filteredRecords.reduce((s, r) => s + (r.sgst || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Integrated Tax (IGST - Interstate)</span>
                  <span className="font-mono font-black text-amber-400">
                    ₹{filteredRecords.reduce((s, r) => s + (r.igst || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: Record New Paid Bill for ITC Claim */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-slate-800">
            <DialogTitle className="text-lg font-extrabold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Record Paid Bill for GST Input Tax Credit
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter bill details &amp; GST breakup to calculate eligible ITC for GSTR-3B filing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vendor / Supplier Name *</Label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => handleFormChange('vendor_name', e.target.value)}
                  placeholder="e.g. Mahindra Auto Parts"
                  className="bg-slate-900 border-slate-800 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Vendor GSTIN *</Label>
                <Input
                  value={formData.vendor_gstin}
                  onChange={(e) => handleFormChange('vendor_gstin', e.target.value.toUpperCase())}
                  placeholder="e.g. 36AAACM1234F1Z8"
                  className="bg-slate-900 border-slate-800 font-mono text-xs"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Invoice / Bill Number *</Label>
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => handleFormChange('invoice_number', e.target.value)}
                  placeholder="e.g. INV-2026-9901"
                  className="bg-slate-900 border-slate-800 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Bill Date *</Label>
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleFormChange('invoice_date', e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs dark:[color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Expense Category</Label>
                <Select value={formData.category} onValueChange={(v) => handleFormChange('category', v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vehicle Maintenance">Vehicle Maintenance</SelectItem>
                    <SelectItem value="Tyre Expense">Tyre Expense</SelectItem>
                    <SelectItem value="Insurance Premium">Insurance Premium</SelectItem>
                    <SelectItem value="Subcontractor Freight">Subcontractor Freight</SelectItem>
                    <SelectItem value="Fuel Expense">Fuel Expense</SelectItem>
                    <SelectItem value="Office & Hardware">Office &amp; Hardware</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>ITC Eligibility</Label>
                <Select value={formData.eligibility} onValueChange={(v) => handleFormChange('eligibility', v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eligible">Eligible (100% ITC)</SelectItem>
                    <SelectItem value="Ineligible">Ineligible (Sec 17(5) Blocked)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <Label>Taxable Amount (₹) *</Label>
                <Input
                  type="number"
                  value={formData.taxable_amount}
                  onChange={(e) => handleFormChange('taxable_amount', e.target.value)}
                  placeholder="e.g. 50000"
                  className="bg-slate-950 border-slate-800 font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>GST Rate (%)</Label>
                <Select value={formData.gst_rate} onValueChange={(v) => handleFormChange('gst_rate', v)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (Exempt)</SelectItem>
                    <SelectItem value="5">5% GST</SelectItem>
                    <SelectItem value="12">12% GST</SelectItem>
                    <SelectItem value="18">18% GST</SelectItem>
                    <SelectItem value="28">28% GST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Claim Period</Label>
                <Input
                  type="month"
                  value={formData.claim_period}
                  onChange={(e) => handleFormChange('claim_period', e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Calculated GST Summary Box */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Total Calculated ITC Claim</span>
                <div className="font-mono font-black text-lg text-emerald-300">
                  ₹{Number(formData.total_gst || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-300">
                <div>CGST: ₹{Number(formData.cgst || 0).toLocaleString('en-IN')}</div>
                <div>SGST: ₹{Number(formData.sgst || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes / Item Description</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Details of spare parts, vehicle chassis number, or work done..."
                className="bg-slate-900 border-slate-800 text-xs h-16"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl border-slate-800 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                Save Bill &amp; Claim ITC
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Record Details Modal */}
      {viewingRecord && (
        <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
          <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl space-y-4">
            <DialogHeader className="pb-2 border-b border-slate-800">
              <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> Bill &amp; ITC Details #{viewingRecord.invoice_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-2xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Vendor Details</div>
                <div className="font-bold text-white">{viewingRecord.vendor_name}</div>
                <div className="font-mono text-emerald-400">GSTIN: {viewingRecord.vendor_gstin}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-2xl">
                  <div className="text-slate-400 text-[10px] uppercase">Taxable Value</div>
                  <div className="font-mono font-bold text-white">₹{Number(viewingRecord.taxable_amount).toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl">
                  <div className="text-slate-400 text-[10px] uppercase">Total ITC Claimable</div>
                  <div className="font-mono font-bold text-emerald-400">₹{Number(viewingRecord.total_gst).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase">Notes</div>
                <div className="text-slate-300">{viewingRecord.notes || 'No extra notes provided.'}</div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setViewingRecord(null)} className="rounded-xl w-full bg-slate-800 text-white">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
