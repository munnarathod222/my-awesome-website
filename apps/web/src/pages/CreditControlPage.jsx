import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Building2, Search, Filter, 
  IndianRupee, Edit3, Lock, Unlock, ArrowUpRight, ShieldCheck, RefreshCw, Plus, FileText,
  MessageSquare
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import PaymentRequestWhatsAppModal from '@/components/PaymentRequestWhatsAppModal.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { calculateClientMetrics } from '@/lib/clientPaymentUtils.js';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { cn } from '@/lib/utils.js';

export default function CreditControlPage() {
  const [clients, setClients] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all'); // all | warning | exceeded | safe

  // Edit Limit & WhatsApp Modal State
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditLimitOpen, setIsEditLimitOpen] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [whatsAppModalClient, setWhatsAppModalClient] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, tripsRes] = await Promise.all([
        pb.collection('clients').getFullList({ sort: 'client_name', $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ sort: '-date', $autoCancel: false })
      ]);
      setClients(clientsRes);
      setTrips(tripsRes);
    } catch (err) {
      console.error('Failed to fetch credit control data:', err);
      toast.error('Failed to load credit control metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics for all clients
  const clientMetrics = useMemo(() => {
    return clients.map(client => {
      const metrics = calculateClientMetrics(client.id, trips, client.billing_type || 'Spot', client);
      const creditLimit = Number(client.credit_limit || 500000);
      const currentOutstanding = metrics.outstandingBalance || 0;
      const creditRemaining = creditLimit - currentOutstanding;
      const isExceeded = currentOutstanding >= creditLimit;
      const isWarning = !isExceeded && creditRemaining <= (creditLimit * 0.2); // <= 20% remaining
      const isApprovalRequired = isExceeded;

      return {
        ...client,
        metrics,
        creditLimit,
        currentOutstanding,
        creditRemaining,
        isExceeded,
        isWarning,
        isApprovalRequired
      };
    });
  }, [clients, trips]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clientMetrics.filter(c => {
      const matchesSearch = (c.client_name || c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.phone || '').includes(searchTerm);
      if (!matchesSearch) return false;

      if (filterRisk === 'exceeded') return c.isExceeded;
      if (filterRisk === 'warning') return c.isWarning;
      if (filterRisk === 'safe') return !c.isExceeded && !c.isWarning;
      return true;
    });
  }, [clientMetrics, searchTerm, filterRisk]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalLimit = 0;
    let totalOutstanding = 0;
    let exceededCount = 0;
    let warningCount = 0;

    clientMetrics.forEach(c => {
      totalLimit += c.creditLimit;
      totalOutstanding += c.currentOutstanding;
      if (c.isExceeded) exceededCount++;
      else if (c.isWarning) warningCount++;
    });

    return {
      totalClients: clientMetrics.length,
      totalLimit,
      totalOutstanding,
      totalRemaining: Math.max(0, totalLimit - totalOutstanding),
      exceededCount,
      warningCount
    };
  }, [clientMetrics]);

  const handleOpenEditLimit = (client) => {
    setSelectedClient(client);
    setNewLimit(client.creditLimit.toString());
    setIsEditLimitOpen(true);
  };

  const handleSaveCreditLimit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !selectedClient.id) {
      toast.error('No valid client selected');
      return;
    }

    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      toast.error('Please enter a valid non-negative credit limit');
      return;
    }

    setIsSaving(true);
    try {
      let updated = false;

      // 1. Try numeric credit_limit update
      try {
        await pb.collection('clients').update(selectedClient.id, {
          credit_limit: limitNum
        }, { $autoCancel: false });
        updated = true;
      } catch (err1) {
        console.warn('Numeric credit_limit update failed, trying string fallback:', err1);
        // 2. Try string credit_limit fallback
        try {
          await pb.collection('clients').update(selectedClient.id, {
            credit_limit: String(limitNum)
          }, { $autoCancel: false });
          updated = true;
        } catch (err2) {
          console.warn('String credit_limit update failed, checking if record exists:', err2);
          // 3. Try with core client payload
          const corePayload = {
            client_name: selectedClient.client_name || selectedClient.company_name || 'Client',
            company_name: selectedClient.company_name || selectedClient.client_name || '',
            email: selectedClient.email || '',
            phone: selectedClient.phone || '',
            credit_limit: limitNum,
            billing_type: selectedClient.billing_type || 'Spot',
            status: selectedClient.status || 'Active'
          };
          await pb.collection('clients').update(selectedClient.id, corePayload, { $autoCancel: false });
          updated = true;
        }
      }

      if (updated) {
        toast.success(`Credit limit updated to ${formatCurrency(limitNum)} for ${selectedClient.client_name || selectedClient.company_name}`);
        setIsEditLimitOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update credit limit:', err);
      const errObj = err.response?.data || err.data;
      if (errObj) {
        const fieldMsgs = Object.entries(errObj)
          .map(([k, v]) => `${k}: ${v.message || v.code || JSON.stringify(v)}`)
          .join(', ');
        toast.error(`Validation Error (${fieldMsgs})`);
      } else {
        toast.error(err.message || 'Failed to update credit limit');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Helmet>
        <title>Credit Control & Customer Exposure | JBC Portal</title>
      </Helmet>

      <Header title="Credit Control" subtitle="Monitor customer credit limits, outstanding exposure, and booking approval holds" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Credit Sanctioned</p>
                <h3 className="text-2xl font-black text-foreground mt-1 font-mono">{formatCurrency(stats.totalLimit)}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stats.totalClients} Total Active Customers</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <IndianRupee className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Outstanding</p>
                <h3 className="text-2xl font-black text-amber-500 mt-1 font-mono">{formatCurrency(stats.totalOutstanding)}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Across all client bookings</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <FileText className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Credit Limit Exceeded</p>
                <h3 className="text-2xl font-black text-rose-500 mt-1 font-mono">{stats.exceededCount} Customers</h3>
                <p className="text-[11px] text-rose-400 font-medium mt-0.5">🚫 Booking Approval Required</p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Near Limit Warning</p>
                <h3 className="text-2xl font-black text-amber-500 mt-1 font-mono">{stats.warningCount} Customers</h3>
                <p className="text-[11px] text-amber-400 font-medium mt-0.5">⚠️ &lt; 20% Credit Remaining</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customer by name, contact, or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-background border-border/40"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="h-10 w-[180px] rounded-xl bg-background border-border/40 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  <SelectValue placeholder="Filter Risk Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="exceeded">🚫 Limit Exceeded ({stats.exceededCount})</SelectItem>
                  <SelectItem value="warning">⚠️ Low Remaining ({stats.warningCount})</SelectItem>
                  <SelectItem value="safe">🟢 Healthy Credit</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={fetchData}
                className="h-10 rounded-xl border-border/40 gap-1.5 text-xs font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Customer Credit Control Table */}
        <Card className="border border-border/50 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Customer Credit Exposure Ledger</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time outstanding tracking against sanctioned credit limits
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 rounded-lg">
                {filteredClients.length} Customers Displayed
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Calculating credit exposures...</p>
              </div>
            ) : (
              <>
                {/* Desktop View Table (Hidden on mobile) */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground">Customer</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground">Credit Limit</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground">Current Outstanding</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground">Credit Remaining</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground w-48">Utilization</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground">Booking Status</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredClients.map(c => {
                        const outstanding = c.currentOutstanding || 0;
                        const limit = c.creditLimit || 0;
                        const remaining = limit - outstanding;
                        const isRemainingNegative = remaining < 0;
                        const utilizationPct = limit > 0 ? (outstanding / limit) * 100 : 0;
                        
                        return (
                          <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                            {/* Customer Info */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-[#d2b48c]/25 flex items-center justify-center font-bold text-xs text-[#d2b48c]">
                                  {(c.client_name || c.company_name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-foreground">{c.client_name || c.company_name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">{c.email || 'No email contact'}</p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Credit Limit */}
                            <TableCell className="font-mono font-bold text-sm text-foreground">
                              {formatCurrency(c.creditLimit)}
                            </TableCell>

                            {/* Current Outstanding */}
                            <TableCell className="font-mono font-bold text-sm text-amber-500">
                              {formatCurrency(c.currentOutstanding)}
                            </TableCell>

                            {/* Credit Remaining */}
                            <TableCell>
                              <div className="font-mono font-bold text-sm">
                                {formatCurrency(remaining)}
                              </div>
                              {isRemainingNegative ? (
                                <p className="text-[10px] text-rose-500 font-medium">Over limit</p>
                              ) : (
                                <p className="text-[10px] text-emerald-500 font-medium">Safe</p>
                              )}
                            </TableCell>

                            {/* Utilization Bar */}
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>Usage</span>
                                  <span className={isRemainingNegative ? "text-rose-500 font-bold" : ""}>{utilizationPct.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      isRemainingNegative ? "bg-rose-500" : utilizationPct > 85 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>

                            {/* Booking Status / Approval */}
                            <TableCell>
                              {c.isApprovalRequired ? (
                                <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-bold uppercase tracking-wider">
                                  Approval Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[10px] font-bold uppercase tracking-wider">
                                  Auto Approved
                                </Badge>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {(c.currentOutstanding || 0) > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setWhatsAppModalClient(c)}
                                    className="rounded-xl h-8 text-xs font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                                    title="Send WhatsApp Payment Request"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Request
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedClient(c);
                                    setNewLimit(c.creditLimit || 0);
                                    setIsEditLimitOpen(true);
                                  }}
                                  className="rounded-xl h-8 text-xs font-semibold"
                                >
                                  Update Limit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View (Shown on screens < md) */}
                <div className="block md:hidden divide-y divide-border/40">
                  {filteredClients.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                      No customers found matching filters.
                    </div>
                  ) : (
                    filteredClients.map(c => {
                      const outstanding = c.currentOutstanding || 0;
                      const limit = c.creditLimit || 0;
                      const remaining = limit - outstanding;
                      const isRemainingNegative = remaining < 0;
                      const utilizationPct = limit > 0 ? (outstanding / limit) * 100 : 0;
                      
                      return (
                        <div key={c.id} className="p-4 space-y-3 relative text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-sm text-foreground">
                              {c.client_name || c.company_name}
                            </span>
                            {c.isApprovalRequired ? (
                              <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] font-bold uppercase tracking-wider">Approval Required</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[9px] font-bold uppercase tracking-wider">Auto Approved</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-b border-white/5 py-2">
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Credit Limit</span>
                              <span className="font-mono font-bold text-foreground">{formatCurrency(c.creditLimit)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground block">Outstanding</span>
                              <span className="font-mono font-bold text-amber-500">{formatCurrency(c.currentOutstanding)}</span>
                            </div>
                          </div>
                          {/* Utilization Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Utilization</span>
                              <span className={isRemainingNegative ? "text-rose-500 font-bold" : ""}>{utilizationPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full", isRemainingNegative ? "bg-rose-500" : utilizationPct > 85 ? "bg-amber-500" : "bg-emerald-500")}
                                style={{ width: `${Math.min(100, utilizationPct)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setSelectedClient(c); setNewLimit(c.creditLimit || 0); setIsEditLimitOpen(true); }}
                              className="h-8 rounded-lg text-xs font-semibold"
                            >
                              Update Limit
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Credit Limit Modal */}
      <Dialog open={isEditLimitOpen} onOpenChange={setIsEditLimitOpen}>
        <DialogContent className="rounded-3xl max-w-md bg-card border border-border p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="font-heading text-lg font-black text-foreground flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" /> Edit Credit Limit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set maximum credit limit for {selectedClient?.client_name || selectedClient?.company_name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCreditLimit} className="py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Sanctioned Credit Limit (₹)</Label>
              <Input
                type="number"
                min="0"
                step="10000"
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
                className="h-10 rounded-xl bg-background border-border/40 font-mono text-base font-bold"
                required
              />
              <p className="text-[11px] text-muted-foreground">Current Outstanding: {formatCurrency(selectedClient?.currentOutstanding || 0)}</p>
            </div>

            <DialogFooter className="pt-2 border-t border-border/30 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl flex-1 font-bold"
                onClick={() => setIsEditLimitOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl flex-1 font-bold bg-primary text-primary-foreground gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save Limit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PaymentRequestWhatsAppModal
        isOpen={!!whatsAppModalClient}
        onClose={() => setWhatsAppModalClient(null)}
        paymentRequest={{
          amount: whatsAppModalClient?.currentOutstanding || 0,
          due_date: new Date().toISOString()
        }}
        client={whatsAppModalClient}
        onSuccess={fetchData}
      />
    </div>
  );
}
