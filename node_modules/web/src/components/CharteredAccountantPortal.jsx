import React, { useState, useEffect, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, FileText, CheckCircle2, AlertCircle, Calendar, 
  TrendingUp, Wallet, Percent, Download, Loader2, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const CharteredAccountantPortal = ({ startDate, endDate }) => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [gstRate, setGstrRate] = useState('12'); // 12% default Outward GST rate for transport services
  const [itcRate, setItcRate] = useState('18'); // 18% default Input Tax Credit rate (maintenance, parts, etc.)
  
  // Checklist State persisted in localStorage
  const [complianceMonth, setComplianceMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [checklist, setChecklist] = useState({
    gstr1: { status: 'Pending', date: '' },
    gstr3b: { status: 'Pending', date: '' },
    tds26q: { status: 'Pending', date: '' },
    itr6: { status: 'Pending', date: '' }
  });

  // Load persisted compliance checklist on month change
  useEffect(() => {
    const key = `ca_compliance_${complianceMonth}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
      } catch (e) {
        setChecklist({
          gstr1: { status: 'Pending', date: '' },
          gstr3b: { status: 'Pending', date: '' },
          tds26q: { status: 'Pending', date: '' },
          itr6: { status: 'Pending', date: '' }
        });
      }
    } else {
      setChecklist({
        gstr1: { status: 'Pending', date: '' },
        gstr3b: { status: 'Pending', date: '' },
        tds26q: { status: 'Pending', date: '' },
        itr6: { status: 'Pending', date: '' }
      });
    }
  }, [complianceMonth]);

  // Save compliance checklist to localStorage
  const updateChecklist = (field, key, value) => {
    setChecklist(prev => {
      const updated = {
        ...prev,
        [field]: {
          ...prev[field],
          [key]: value
        }
      };
      localStorage.setItem(`ca_compliance_${complianceMonth}`, JSON.stringify(updated));
      return updated;
    });
    toast.success('Compliance checklist updated');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let filterStr = '';
      if (startDate && endDate) {
        filterStr = `date >= "${startDate} 00:00:00" && date <= "${endDate} 23:59:59"`;
      }

      const [tripsRes, expensesRes, clientsRes] = await Promise.all([
        pb.collection('trip_logs').getFullList({
          filter: filterStr || undefined,
          $autoCancel: false
        }),
        pb.collection('expenses').getFullList({
          filter: filterStr || undefined,
          $autoCancel: false
        }),
        pb.collection('clients').getFullList({
          $autoCancel: false
        })
      ]);

      setTrips(tripsRes);
      setExpenses(expensesRes);
      setClients(clientsRes);
    } catch (error) {
      console.error('Error fetching CA data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const grossRevenue = trips.reduce((sum, t) => sum + (Number(t.revenue) || 0), 0);
    const tdsDeducted = trips.reduce((sum, t) => sum + (Number(t.tds_deducted_receivable) || 0), 0);
    const netRevenue = grossRevenue - tdsDeducted;
    
    // Core Expenses
    let maintenanceCost = 0;
    let otherExp = 0;
    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      const cat = (e.category || '').toLowerCase();
      const sub = (e.subcategory || '').toLowerCase();
      
      if (cat === 'maintenance' || sub === 'maintenance') {
        maintenanceCost += amt;
      } else {
        otherExp += amt;
      }
    });
    const totalExpenses = maintenanceCost + otherExp;
    const profitBeforeTax = netRevenue - totalExpenses;

    // GST Computations
    const outwardGst = grossRevenue * (Number(gstRate) / 100);
    const inputTaxCredit = maintenanceCost * (Number(itcRate) / 100); // GST claiming is majorly on maintenance parts & garage bills
    const netGstPayable = outwardGst - inputTaxCredit;

    // 3PL Brokerage & Ledger Calculations
    let accountsReceivable = 0;
    let accountsPayable = 0;
    let fleetProfit = 0;
    let brokerageProfit = 0;

    trips.forEach(t => {
      const rev = Number(t.revenue) || 0;
      const isPaid = t.client_payment_status === 'received';
      const isAttached = t.ownership_type === 'Attached';

      if (!isPaid) {
        accountsReceivable += rev;
        if (isAttached) {
          accountsPayable += Number(t.vendor_payout) || 0;
        }
      }

      if (isAttached) {
        brokerageProfit += Number(t.brokerage_margin) || 0;
      } else {
        fleetProfit += rev;
      }
    });

    const netFleetRevenue = fleetProfit - tdsDeducted;
    const fleetProfitNet = netFleetRevenue - totalExpenses;
    const retainedEarnings = fleetProfitNet + brokerageProfit;

    // TDS grouping by client
    const clientTds = {};
    trips.forEach(t => {
      const cId = t.client_id;
      if (!cId) return;
      const amount = Number(t.revenue) || 0;
      const tds = Number(t.tds_deducted_receivable) || 0;
      
      if (!clientTds[cId]) {
        const clientObj = clients.find(c => c.id === cId);
        clientTds[cId] = {
          clientName: clientObj?.client_name || 'Unknown Client',
          gstin: clientObj?.gst_number || 'N/A',
          pan: clientObj?.pan_number || 'N/A',
          volume: 0,
          tdsHeld: 0
        };
      }
      clientTds[cId].volume += amount;
      clientTds[cId].tdsHeld += tds;
    });

    return {
      grossRevenue,
      tdsDeducted,
      netRevenue,
      totalExpenses,
      profitBeforeTax,
      outwardGst,
      inputTaxCredit,
      netGstPayable,
      accountsReceivable,
      accountsPayable,
      fleetProfitNet,
      brokerageProfit,
      retainedEarnings,
      tdsLedger: Object.values(clientTds).sort((a, b) => b.tdsHeld - a.tdsHeld)
    };
  }, [trips, expenses, clients, gstRate, itcRate]);

  // Export full compliance data package as CSV
  const handleExportCAPack = () => {
    try {
      const headers = ['Type', 'Identifier/Client/Category', 'Tax ID (GST/PAN)', 'Gross Amount (₹)', 'TDS Deducted (₹)', 'Estimated GST Liability (₹)'];
      const rows = [];

      // 1. Overview Totals
      rows.push(['OVERVIEW', 'Gross Booking Revenue', '', metrics.grossRevenue, metrics.tdsDeducted, metrics.outwardGst]);
      rows.push(['OVERVIEW', 'Total Expenses', '', metrics.totalExpenses, 0, -metrics.inputTaxCredit]);
      rows.push(['OVERVIEW', 'Net Profit Before Taxes', '', metrics.profitBeforeTax, 0, 0]);
      rows.push(['OVERVIEW', 'Net GST Payable/ITC Refund', '', '', '', metrics.netGstPayable]);
      rows.push([]); // spacer

      // 2. Client TDS Ledger
      rows.push(['CLIENT LEDGER', 'Client Name', 'GSTIN / PAN', 'Gross Volume Processed (₹)', 'TDS Held Back (₹)', '']);
      metrics.tdsLedger.forEach(c => {
        rows.push([
          'CLIENT', 
          c.clientName, 
          `${c.gstin} / ${c.pan}`, 
          c.volume, 
          c.tdsHeld,
          ''
        ]);
      });
      rows.push([]); // spacer

      // 3. Raw Expense details
      rows.push(['EXPENSE DETAIL', 'Category', 'Description', 'Amount (₹)', 'Date', 'GST Claimable (₹)']);
      expenses.forEach(e => {
        const isMaint = (e.category || '').toLowerCase() === 'maintenance' || (e.subcategory || '').toLowerCase() === 'maintenance';
        const gstClaim = isMaint ? e.amount * (Number(itcRate) / 100) : 0;
        rows.push([
          'EXPENSE',
          e.category || 'Other',
          e.description || '',
          e.amount || 0,
          e.date ? e.date.substring(0, 10) : '',
          gstClaim
        ]);
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CA_Compliance_Pack_${complianceMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CA Compliance Package exported successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export CSV package');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(val || 0));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-slate-400">Loading tax compliance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <Scale className="w-5 h-5 text-blue-500" />
            Chartered Accountant Tax Auditing Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile outward GST liabilities, input tax credits, and client TDS holdings with compliance checklists.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCAPack}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 h-10 text-xs font-semibold shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Audit Pack for CA
          </Button>
          <Button 
            variant="outline"
            onClick={fetchData}
            className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white rounded-xl h-10 w-10 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Booking Volume</p>
            <h3 className="text-2xl font-extrabold mt-3 tabular-nums text-slate-200">{formatCurrency(metrics.grossRevenue)}</h3>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Total TDS Deductions:</span>
              <span className="font-semibold text-red-400">{formatCurrency(metrics.tdsDeducted)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GST Tax Position</p>
            <h3 className={`text-2xl font-extrabold mt-3 tabular-nums ${metrics.netGstPayable >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(metrics.netGstPayable)} {metrics.netGstPayable >= 0 ? 'Payable' : 'Credit'}
            </h3>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Outward GST ({gstRate}%): {formatCurrency(metrics.outwardGst)}</span>
              <span>ITC Credit ({itcRate}%): {formatCurrency(metrics.inputTaxCredit)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profit Net of Deductions</p>
            <h3 className={`text-2xl font-extrabold mt-3 tabular-nums ${metrics.profitBeforeTax >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.profitBeforeTax)}
            </h3>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Net Settled Revenue: {formatCurrency(metrics.netRevenue)}</span>
              <span>Total Expenses: {formatCurrency(metrics.totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3PL Ledger & Retained Earnings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accounts Receivable (AR)</p>
            <h3 className="text-2xl font-extrabold mt-3 text-blue-400 tabular-nums">{formatCurrency(metrics.accountsReceivable)}</h3>
            <p className="text-[11px] text-slate-400 mt-2">Outstanding client invoicing balance</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accounts Payable (AP)</p>
            <h3 className="text-2xl font-extrabold mt-3 text-amber-500 tabular-nums">{formatCurrency(metrics.accountsPayable)}</h3>
            <p className="text-[11px] text-slate-400 mt-2">Owed to attached vehicle vendors</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Retained Earnings / Retained Profit</p>
            <h3 className={`text-2xl font-extrabold mt-3 tabular-nums ${metrics.retainedEarnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.retainedEarnings)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">
              Fleet Profit: {formatCurrency(metrics.fleetProfitNet)} | Brokerage: {formatCurrency(metrics.brokerageProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GST and ITC Settings Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimate Outward GST Rate (On Booking Revenue)</label>
          <Select value={gstRate} onValueChange={setGstrRate}>
            <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="5">5% (Transport service without ITC / RCM)</SelectItem>
              <SelectItem value="12">12% (Forward Charge with full ITC - Default)</SelectItem>
              <SelectItem value="18">18% (Rental / Luxury Operations)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimate Input GST Credit (ITC on Maintenance & Bills)</label>
          <Select value={itcRate} onValueChange={setItcRate}>
            <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="12">12% (Contract Maintenance Services)</SelectItem>
              <SelectItem value="18">18% (Automotive Parts & Garage Invoices - Default)</SelectItem>
              <SelectItem value="28">28% (Lubricants & Select Spares)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TDS Reconciliation Ledger */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-800 mb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            TDS Claims Ledger (Form 26AS Reconciliation)
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Cross-reference client deductions against your Form 26AS dashboard to claim withholding credit refunds during ITR filing.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/60 border-b border-slate-800">
              <TableRow className="border-b-slate-800">
                <TableHead className="text-slate-300 font-semibold">Client Name</TableHead>
                <TableHead className="text-slate-300 font-semibold">Tax ID (GSTIN / PAN)</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right">Gross Booking volume</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right pr-6">TDS Held Back (Credit)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.tdsLedger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                    No client TDS records compiled. Ensure client setup has Applies TDS toggled active.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.tdsLedger.map((c, i) => (
                  <TableRow key={i} className="border-b-slate-800/40 hover:bg-slate-800/10">
                    <TableCell className="font-bold text-slate-200">{c.clientName}</TableCell>
                    <TableCell className="space-y-0.5">
                      <div className="text-xs">GST: <span className="font-mono font-medium text-slate-300">{c.gstin}</span></div>
                      <div className="text-xs">PAN: <span className="font-mono font-medium text-slate-300">{c.pan}</span></div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-slate-200">{formatCurrency(c.volume)}</TableCell>
                    <TableCell className="text-right font-extrabold tabular-nums text-red-400 pr-6">{formatCurrency(c.tdsHeld)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Compliance Calendar & Checklist */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-800 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Tax Compliance Calendar & Return Checklist
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Track deadlines and record completion dates for GST and TDS return filings.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Audited Month:</span>
            <Input 
              type="month" 
              value={complianceMonth} 
              onChange={e => setComplianceMonth(e.target.value)} 
              className="bg-slate-950 border-slate-800 text-slate-200 h-9 w-[150px] text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/60 border-b border-slate-800">
                <TableRow className="border-b-slate-800">
                  <TableHead className="text-slate-300 font-semibold">Form Code</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Compliance Return Description</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Standard Deadline</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Filing Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold pr-6">Completion Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                {/* GSTR-1 */}
                <TableRow className="border-b-slate-800/40 hover:bg-slate-800/10">
                  <TableCell className="font-bold text-slate-200">GSTR-1</TableCell>
                  <TableCell className="text-xs text-slate-300">Outward Supplies Return (Sales invoices summary to claim client ITC)</TableCell>
                  <TableCell className="text-xs">11th of subsequent month</TableCell>
                  <TableCell>
                    <Select 
                      value={checklist.gstr1.status} 
                      onValueChange={v => updateChecklist('gstr1', 'status', v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Input 
                      type="date" 
                      value={checklist.gstr1.date} 
                      onChange={e => updateChecklist('gstr1', 'date', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"
                    />
                  </TableCell>
                </TableRow>

                {/* GSTR-3B */}
                <TableRow className="border-b-slate-800/40 hover:bg-slate-800/10">
                  <TableCell className="font-bold text-slate-200">GSTR-3B</TableCell>
                  <TableCell className="text-xs text-slate-300">Monthly Self-Declared Summary Return (GST Payment settlement)</TableCell>
                  <TableCell className="text-xs">20th of subsequent month</TableCell>
                  <TableCell>
                    <Select 
                      value={checklist.gstr3b.status} 
                      onValueChange={v => updateChecklist('gstr3b', 'status', v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Input 
                      type="date" 
                      value={checklist.gstr3b.date} 
                      onChange={e => updateChecklist('gstr3b', 'date', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"
                    />
                  </TableCell>
                </TableRow>

                {/* Form 26Q */}
                <TableRow className="border-b-slate-800/40 hover:bg-slate-800/10">
                  <TableCell className="font-bold text-slate-200">Form 26Q</TableCell>
                  <TableCell className="text-xs text-slate-300">Quarterly TDS Return (Deductions on payments other than salaries)</TableCell>
                  <TableCell className="text-xs">31st of subsequent month after quarter</TableCell>
                  <TableCell>
                    <Select 
                      value={checklist.tds26q.status} 
                      onValueChange={v => updateChecklist('tds26q', 'status', v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Input 
                      type="date" 
                      value={checklist.tds26q.date} 
                      onChange={e => updateChecklist('tds26q', 'date', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"
                    />
                  </TableCell>
                </TableRow>

                {/* ITR-6 */}
                <TableRow className="border-b-slate-800/40 hover:bg-slate-800/10">
                  <TableCell className="font-bold text-slate-200">ITR-6</TableCell>
                  <TableCell className="text-xs text-slate-300">Annual Income Tax Return (Corporate financial filing for refunds)</TableCell>
                  <TableCell className="text-xs">31st October of subsequent fiscal year</TableCell>
                  <TableCell>
                    <Select 
                      value={checklist.itr6.status} 
                      onValueChange={v => updateChecklist('itr6', 'status', v)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Input 
                      type="date" 
                      value={checklist.itr6.date} 
                      onChange={e => updateChecklist('itr6', 'date', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs w-[140px] h-8 text-slate-200"
                    />
                  </TableCell>
                </TableRow>
                
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default CharteredAccountantPortal;
