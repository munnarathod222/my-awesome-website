import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Truck, 
  ShieldAlert, 
  RefreshCw, 
  MessageSquare, 
  ArrowUpRight, 
  Filter, 
  CheckCheck, 
  Sparkles,
  PhoneCall,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function OwnerInboxPage() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState({
    approvals: [],
    exceptions: [],
    decisions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Dialog state (e.g. rejection note)
  const [rejectDialogItem, setRejectDialogItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingActionId, setProcessingActionId] = useState(null);

  const fetchFeed = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/owner-inbox/feed');
      const data = await res.json();
      if (data.success) {
        setFeed({
          approvals: data.approvals || [],
          exceptions: data.exceptions || [],
          decisions: data.decisions || []
        });
      } else {
        throw new Error(data.error || 'Failed to fetch Owner Inbox feed');
      }
    } catch (err) {
      console.error('Owner inbox fetch error:', err);
      if (!isSilent) toast.error('Failed to load owner inbox items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Polling every 30s
  useEffect(() => {
    fetchFeed();
    const interval = setInterval(() => {
      fetchFeed(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  // Handle Approve / Reject action
  const handleExecuteAction = async (item, actionType, notes = '') => {
    setProcessingActionId(item.id);
    try {
      const payload = {
        action: actionType, // 'APPROVE_WORKFLOW', 'REJECT_WORKFLOW', 'RESOLVE_EXCEPTION'
        itemId: item.id,
        itemType: item.type, // 'workflow', 'trip_delay', 'breakdown', 'quote'
        notes: notes
      };

      const res = await fetch('/api/owner-inbox/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server failed to execute inbox action');
      }

      toast.success(data.message || `Action ${actionType} recorded successfully!`);
      if (rejectDialogItem) {
        setRejectDialogItem(null);
        setRejectReason('');
      }
      fetchFeed(true);
    } catch (err) {
      console.error('Action error:', err);
      toast.error(err.message || 'Failed to process inbox action.');
    } finally {
      setProcessingActionId(null);
    }
  };

  // WhatsApp quick contact
  const handleOpenWhatsApp = (phone, text) => {
    if (!phone) {
      toast.error('No contact phone registered for this item.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const target = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const url = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Metric Ribbon Calculations
  const totalApprovalsCount = feed.approvals.length;
  const totalApprovalsValue = feed.approvals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExceptionsCount = feed.exceptions.length;
  const totalDecisionsCount = feed.decisions.length;
  const totalInboxItems = totalApprovalsCount + totalExceptionsCount + totalDecisionsCount;

  // Combine and filter items based on tab and search
  const allItems = [
    ...feed.approvals.map(a => ({ ...a, categoryGroup: 'approval' })),
    ...feed.exceptions.map(e => ({ ...e, categoryGroup: 'exception' })),
    ...feed.decisions.map(d => ({ ...d, categoryGroup: 'decision' }))
  ];

  const filteredItems = allItems.filter(item => {
    // Tab filter
    if (activeTab === 'approvals' && item.categoryGroup !== 'approval') return false;
    if (activeTab === 'exceptions' && item.categoryGroup !== 'exception') return false;
    if (activeTab === 'decisions' && item.categoryGroup !== 'decision') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (item.title || item.rule_name || item.route || item.customer_name || '').toLowerCase();
      const desc = (item.description || item.reason || item.notes || '').toLowerCase();
      const truck = (item.truck_number || '').toLowerCase();
      const driver = (item.driver_name || item.requester_name || '').toLowerCase();
      return title.includes(q) || desc.includes(q) || truck.includes(q) || driver.includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Helmet>
        <title>Owner Inbox & Executive Command Center | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-xs">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
                Owner Inbox
                {totalInboxItems > 0 && (
                  <Badge className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs animate-pulse">
                    {totalInboxItems} PENDING
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Consolidated executive feed for financial approvals, operational exceptions, and high-value decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFeed(false)}
            disabled={refreshing}
            className="rounded-xl border-border/60 hover:bg-muted/30 font-medium text-xs gap-1.5 h-10 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Executive Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Pending Approvals */}
        <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-amber-950/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Pending Approvals
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {totalApprovalsCount}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  (₹{totalApprovalsValue.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Operational Exceptions */}
        <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-rose-950/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Fleet Exceptions
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {totalExceptionsCount}
                </span>
                <span className="text-xs font-semibold text-rose-400">
                  Delays & Breakdowns
                </span>
              </div>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Strategic Decisions */}
        <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-cyan-950/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Pending Quotations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {totalDecisionsCount}
                </span>
                <span className="text-xs font-semibold text-cyan-400">
                  Ready to Convert
                </span>
              </div>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
              <Truck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-muted/60 p-1 rounded-2xl grid grid-cols-4 sm:flex gap-1">
            <TabsTrigger value="all" className="rounded-xl font-bold text-xs">
              All ({totalInboxItems})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-xl font-bold text-xs">
              Approvals ({totalApprovalsCount})
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="rounded-xl font-bold text-xs">
              Exceptions ({totalExceptionsCount})
            </TabsTrigger>
            <TabsTrigger value="decisions" className="rounded-xl font-bold text-xs">
              Quotes ({totalDecisionsCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Input 
            placeholder="Search truck, driver, route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-background border-border rounded-xl text-xs pl-3"
          />
        </div>
      </div>

      {/* Main Feed Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-muted-foreground text-sm font-medium">Scanning live approvals & fleet exceptions...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border border-border/50 rounded-3xl p-12 text-center bg-card shadow-soft">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
            <CheckCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-extrabold text-foreground mt-4">All Clear! No Pending Items</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
            Every approval rule has been resolved, fleet shipments are running on schedule, and all high-value decisions are up to date.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const isProcessing = processingActionId === item.id;

            // RENDER CARD: APPROVAL WORKFLOW
            if (item.categoryGroup === 'approval') {
              return (
                <Card 
                  key={item.id} 
                  className="border border-amber-500/30 rounded-3xl overflow-hidden shadow-soft bg-card hover:border-amber-500/50 transition-all"
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold text-xs uppercase">
                          APPROVAL REQUIRED
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.rule_name || item.category || 'Expense Approval'}
                        </Badge>
                        {item.truck_number && (
                          <Badge variant="secondary" className="text-xs font-bold gap-1">
                            <Truck className="w-3 h-3 text-cyan-400" /> {item.truck_number}
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                        {item.title || item.reason || 'Financial Disbursement Sign-Off'}
                      </h4>

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Requested by <strong className="text-foreground">{item.requester_name || item.driver_name || 'Fleet Operator'}</strong> 
                        {item.route ? ` for Route: ${item.route}` : ''}
                        {item.notes ? ` — "${item.notes}"` : ''}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.created || item.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.threshold && (
                          <span>Rule Threshold: ₹{Number(item.threshold).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Requested Amount</span>
                        <span className="text-2xl font-black font-mono text-amber-400">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleExecuteAction(item, 'APPROVE_WORKFLOW', 'Approved via Owner Inbox')}
                          className="h-10 px-5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 flex-1 sm:flex-none"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => {
                            setRejectDialogItem(item);
                            setRejectReason('');
                          }}
                          className="h-10 px-4 rounded-xl font-bold border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 gap-1.5 flex-1 sm:flex-none"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>

                        {item.requester_phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenWhatsApp(item.requester_phone, `Hello, regarding your request of ₹${item.amount} for ${item.truck_number || 'Fleet'}: `)}
                            className="h-10 w-10 p-0 rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }

            // RENDER CARD: OPERATIONAL EXCEPTION (DELAY / BREAKDOWN)
            if (item.categoryGroup === 'exception') {
              const isBreakdown = item.type === 'breakdown';
              return (
                <Card 
                  key={item.id} 
                  className={`border ${isBreakdown ? 'border-rose-500/40' : 'border-amber-500/40'} rounded-3xl overflow-hidden shadow-soft bg-card`}
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${isBreakdown ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} font-bold text-xs uppercase`}>
                          {isBreakdown ? 'VEHICLE BREAKDOWN' : 'TRANSIT DELAY > 45 MIN'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-bold gap-1">
                          <Truck className="w-3 h-3 text-cyan-400" /> {item.truck_number}
                        </Badge>
                        {item.delay_minutes && (
                          <Badge variant="outline" className="text-xs text-rose-400 border-rose-500/30 font-bold">
                            Delayed by {item.delay_minutes} mins
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-foreground">
                        {item.route ? `Shipment Route: ${item.route}` : item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Assigned Driver: <strong className="text-foreground">{item.driver_name || 'Driver'}</strong> ({item.driver_phone || 'No direct phone'})
                        {item.location ? ` • Current Loc: ${item.location}` : ''}
                      </p>

                      {item.delay_reason && (
                        <p className="text-xs text-amber-400/90 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                          Reported Cause: {item.delay_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                      {item.driver_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenWhatsApp(item.driver_phone, `Urgent: Jai Bhavani Cargo Fleet HQ checking on status of truck ${item.truck_number} on ${item.route || 'active trip'}. Please update location.`)}
                          className="h-10 px-4 rounded-xl font-bold border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" /> WhatsApp Driver
                        </Button>
                      )}

                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleExecuteAction(item, 'RESOLVE_EXCEPTION', 'Acknowledged and escalated to roadside ops')}
                        className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                      >
                        <CheckCheck className="w-4 h-4" /> Acknowledge
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            // RENDER CARD: STRATEGIC DECISION / QUOTE
            if (item.categoryGroup === 'decision') {
              return (
                <Card 
                  key={item.id} 
                  className="border border-cyan-500/30 rounded-3xl overflow-hidden shadow-soft bg-card hover:border-cyan-500/50 transition-all"
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-bold text-xs uppercase">
                          CUSTOMER QUOTATION
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.quote_number || 'QUOTE'}
                        </Badge>
                        {item.truck_size && (
                          <Badge variant="secondary" className="text-xs font-bold">
                            {item.truck_size}
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-foreground">
                        {item.customer_name || 'Corporate Shipper'} — {item.origin} ➔ {item.destination}
                      </h4>

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Estimated Freight: <strong className="text-cyan-400">₹{Number(item.amount || item.total_amount || 0).toLocaleString('en-IN')}</strong>
                        {item.kms ? ` (${item.kms} KMs)` : ''} • Status: {item.status || 'Pending'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/quotes-manager?quoteNumber=${item.quote_number || ''}`)}
                        className="h-10 px-5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs gap-1.5"
                      >
                        Open Quote & Convert <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* REJECTION REASON DIALOG */}
      <Dialog open={!!rejectDialogItem} onOpenChange={(open) => !open && setRejectDialogItem(null)}>
        <DialogContent className="rounded-3xl border border-border bg-card p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" /> Reject Approval Request
            </DialogTitle>
            <DialogDescription>
              Please enter the operational reason for rejecting this disbursement. The requester and driver will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-xs text-muted-foreground uppercase font-bold">Item Details:</span>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {rejectDialogItem?.title || rejectDialogItem?.rule_name} (₹{rejectDialogItem?.amount})
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason for Rejection *</Label>
              <Textarea 
                placeholder="e.g. Rate exceeds sanctioned depot rates, duplicate fuel bill, requires inspection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="bg-background border-border rounded-xl text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectDialogItem(null)}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              disabled={!rejectReason.trim() || processingActionId === rejectDialogItem?.id}
              onClick={() => handleExecuteAction(rejectDialogItem, 'REJECT_WORKFLOW', rejectReason)}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
