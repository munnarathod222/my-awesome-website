import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Building2, Users, TrendingUp, CreditCard, ShieldCheck, ShieldAlert, 
  Search, Filter, Plus, Download, Eye, Zap, AlertTriangle, MessageSquare, 
  Sparkles, CheckCircle2, Phone, Mail, ArrowRight, RefreshCw, BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

import { getCrmCustomers } from '@/lib/transportCrmClient.js';
import TransportCrmCustomerDetailModal from '@/components/TransportCrmCustomerDetailModal.jsx';
import TransportCrmNewCustomerModal from '@/components/TransportCrmNewCustomerModal.jsx';

export default function TransportCrmPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCrmCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to load CRM customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (industryFilter !== 'all' && c.industry !== industryFilter) return false;
      if (riskFilter !== 'all' && c.risk_level !== riskFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.company_name?.toLowerCase().includes(q) ||
          c.customer_code?.toLowerCase().includes(q) ||
          c.gstin?.toLowerCase().includes(q) ||
          c.primary_contact?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [customers, searchTerm, industryFilter, riskFilter, statusFilter]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    const totalCust = customers.length;
    const activeCust = customers.filter(c => c.status === 'Active').length;
    const totalRev = customers.reduce((acc, c) => acc + (c.total_revenue || 0), 0);
    const totalOut = customers.reduce((acc, c) => acc + (c.outstanding_amount || 0), 0);
    const highRiskCount = customers.filter(c => c.risk_level === 'High Risk').length;
    const avgSatisfaction = customers.length ? Math.round(customers.reduce((acc, c) => acc + (c.satisfaction_score || 95), 0) / customers.length) : 96;

    return { totalCust, activeCust, totalRev, totalOut, highRiskCount, avgSatisfaction };
  }, [customers]);

  const handleExportExcel = () => {
    const headers = ['Company Name', 'Customer Code', 'Industry', 'GSTIN', 'City', 'Primary Contact', 'Phone', 'Credit Limit', 'Outstanding', 'Risk Level', 'Status'];
    const rows = filteredCustomers.map(c => [
      `"${c.company_name}"`,
      `"${c.customer_code}"`,
      `"${c.industry}"`,
      `"${c.gstin}"`,
      `"${c.city}"`,
      `"${c.primary_contact}"`,
      `"${c.phone}"`,
      c.credit_limit,
      c.outstanding_amount,
      `"${c.risk_level}"`,
      `"${c.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transport_CRM_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transport CRM Customer directory exported to Excel CSV!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 font-sans"
    >
      <Helmet>
        <title>Enterprise Transport CRM | Freight Logistics Dashboard</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-2xl text-primary">
              <Building2 className="w-7 h-7" />
            </div>
            Enterprise Transport CRM
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            360° Logistics Customer Management • Rate Contracts • Credit Limits • Shipment History & Complaints SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="rounded-xl text-xs font-bold shadow-sm">
            <Download className="w-4 h-4 mr-1.5" /> Export Excel
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)} className="rounded-xl shadow-md font-bold text-xs bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> Onboard Customer
          </Button>
        </div>
      </div>

      {/* Enterprise Logistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Total Accounts</div>
          <div className="text-2xl font-black font-mono text-foreground">{metrics.totalCust}</div>
          <div className="text-[10px] text-emerald-400 font-bold">{metrics.activeCust} Active Accounts</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Lifetime Revenue</div>
          <div className="text-2xl font-black font-mono text-emerald-400">₹ {(metrics.totalRev / 10000000).toFixed(2)} Cr</div>
          <div className="text-[10px] text-muted-foreground font-semibold">Freight Business</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Outstanding Freight</div>
          <div className="text-2xl font-black font-mono text-rose-400">₹ {(metrics.totalOut / 100000).toFixed(1)} L</div>
          <div className="text-[10px] text-rose-400 font-bold">{metrics.highRiskCount} High Risk Accounts</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Avg Payment Days</div>
          <div className="text-2xl font-black font-mono text-amber-400">26 Days</div>
          <div className="text-[10px] text-muted-foreground">30-Day Credit Limit</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Active Trips</div>
          <div className="text-2xl font-black font-mono text-primary">45 Trips</div>
          <div className="text-[10px] text-emerald-400 font-bold">In Transit</div>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-card p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground uppercase">Satisfaction %</div>
          <div className="text-2xl font-black font-mono text-emerald-400">{metrics.avgSatisfaction}%</div>
          <div className="text-[10px] text-muted-foreground">SLA Score</div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="rounded-2xl border border-border/60 bg-card p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Company, GSTIN, Code, City..."
              className="pl-9 rounded-xl h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-36 h-9 text-xs rounded-xl"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Chemicals & Polymers">Chemicals</SelectItem>
                <SelectItem value="Metals & Mining">Metals</SelectItem>
                <SelectItem value="FMCG & Cold Chain Storage">FMCG & Cold Chain</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-36 h-9 text-xs rounded-xl"><SelectValue placeholder="Credit Risk" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Excellent">🟢 Excellent Credit</SelectItem>
                <SelectItem value="Average">🟡 Average Credit</SelectItem>
                <SelectItem value="High Risk">🔴 High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Hold">Hold Account</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Customer Directory Table */}
      <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold py-3.5 pl-5">Company & Code</TableHead>
              <TableHead className="text-xs font-bold">Industry & Location</TableHead>
              <TableHead className="text-xs font-bold">Contact Person</TableHead>
              <TableHead className="text-xs font-bold text-center">Credit Score</TableHead>
              <TableHead className="text-xs font-bold text-center">Avg Payment</TableHead>
              <TableHead className="text-xs font-bold text-right">Credit Limit</TableHead>
              <TableHead className="text-xs font-bold text-right">Outstanding</TableHead>
              <TableHead className="text-xs font-bold text-center">Credit Risk</TableHead>
              <TableHead className="text-xs font-bold text-center">Status</TableHead>
              <TableHead className="text-xs font-bold text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                  Loading Transport CRM Accounts...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                  No matching transport customer accounts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map(c => {
                const riskBadge = c.risk_level === 'Excellent' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : c.risk_level === 'Average' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <TableRow key={c.id} className="hover:bg-muted/20 text-xs">
                    <TableCell className="pl-5 py-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-xs flex-shrink-0">
                          {c.company_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-foreground">{c.company_name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{c.customer_code} • GST: {c.gstin}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-foreground">{c.industry}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.city}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">{c.primary_contact}</div>
                      <a href={`tel:${c.phone}`} className="text-[10px] text-primary font-mono font-bold hover:underline">{c.phone}</a>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono text-[10px] font-black ${c.score_color || 'bg-emerald-500/10 text-emerald-400'}`}>
                        {c.credit_score || 750} ({c.credit_tier || 'AAA'})
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold text-foreground">
                      {c.avg_payment_days || 24} Days
                    </TableCell>

                    <TableCell className="text-right font-mono font-semibold">
                      ₹ {(c.credit_limit || 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-rose-400">
                      ₹ {(c.outstanding_amount || 0).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono text-[10px] font-bold ${riskBadge}`}>
                        {c.risk_level === 'Excellent' ? '🟢 Excellent' : c.risk_level === 'Average' ? '🟡 Average' : '🔴 High Risk'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className={c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}>
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-5">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsDetailOpen(true);
                        }}
                        className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> 360° Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Customer 360° Detail Modal */}
      <TransportCrmCustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={selectedCustomer}
        onQuickBook={(cust) => {
          setIsDetailOpen(false);
          toast.success(`Opening 1-Click Trip Dispatcher for ${cust.company_name}`);
        }}
      />

      {/* New Customer Registration Modal */}
      <TransportCrmNewCustomerModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSaved={fetchCustomers}
      />
    </motion.div>
  );
}
