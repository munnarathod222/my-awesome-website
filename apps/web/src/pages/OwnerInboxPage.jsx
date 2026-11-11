import React, { useState, useEffect, useCallback, useMemo } from 'react';

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

// Inline SVG Icon components (Zero external icon dependencies)
const Icons = {
  Inbox: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12" }),
    React.createElement("path", { d: "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" })
  ),
  CheckCircle2: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
    React.createElement("path", { d: "m9 12 2 2 4-4" })
  ),
  XCircle: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
    React.createElement("path", { d: "m15 9-6 6" }),
    React.createElement("path", { d: "m9 9 6 6" })
  ),
  AlertTriangle: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
    React.createElement("line", { x1: 12, y1: 9, x2: 12, y2: 13 }),
    React.createElement("line", { x1: 12, y1: 17, x2: 12.01, y2: 17 })
  ),
  Clock: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
    React.createElement("polyline", { points: "12 6 12 12 16 14" })
  ),
  DollarSign: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("line", { x1: 12, y1: 2, x2: 12, y2: 22 }),
    React.createElement("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })
  ),
  Truck: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("rect", { width: 16, height: 13, x: 1, y: 3, rx: 2 }),
    React.createElement("polygon", { points: "16 8 20 8 23 11 23 16 16 16 16 8" }),
    React.createElement("circle", { cx: 5.5, cy: 18.5, r: 2.5 }),
    React.createElement("circle", { cx: 18.5, cy: 18.5, r: 2.5 })
  ),
  RefreshCw: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
    React.createElement("path", { d: "M21 3v5h-5" }),
    React.createElement("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
    React.createElement("path", { d: "M8 16H3v5" })
  ),
  MessageSquare: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
  ),
  ArrowUpRight: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "M7 7h10v10" }),
    React.createElement("path", { d: "M7 17 17 7" })
  ),
  CheckCheck: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "M18 6 7 17l-5-5" }),
    React.createElement("path", { d: "m22 10-7.5 7.5L13 16" })
  ),
  Sparkles: (props) => React.createElement("svg", { ...props, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" })
  )
};

export default function OwnerInboxPage() {
  const [feed, setFeed] = useState({ approvals: [], exceptions: [], decisions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingActionId, setProcessingActionId] = useState(null);
  const [rejectDialogItem, setRejectDialogItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const navigate = (url) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const fetchFeed = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch('/api/owner-inbox/feed');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setFeed({
        approvals: Array.isArray(data.approvals) ? data.approvals : [],
        exceptions: Array.isArray(data.exceptions) ? data.exceptions : [],
        decisions: Array.isArray(data.decisions) ? data.decisions : []
      });
    } catch (err) {
      console.error('Error fetching Owner Inbox feed:', err);
      if (!isSilent) showToast('Failed to sync live Owner Inbox items', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(() => fetchFeed(true), 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const handleExecuteAction = async (item, actionType, reason = '') => {
    setProcessingActionId(item.id);
    try {
      const payload = {
        action: actionType,
        itemId: item.id,
        category: item.categoryGroup,
        reason: reason
      };

      const response = await fetch('/api/owner-inbox/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const result = await response.json();

      showToast(result.message || 'Action executed successfully', 'success');

      if (actionType === 'REJECT_WORKFLOW') {
        setRejectDialogItem(null);
        setRejectReason('');
      }

      fetchFeed(true);
    } catch (err) {
      console.error('Failed to execute inbox action:', err);
      showToast(err.message || 'Failed to execute decision', 'error');
    } finally {
      setProcessingActionId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalApprovalsCount = feed.approvals.length;
    const totalApprovalsValue = feed.approvals.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExceptionsCount = feed.exceptions.length;
    const totalDecisionsCount = feed.decisions.length;
    const totalDecisionsValue = feed.decisions.reduce((sum, item) => sum + (Number(item.amount || item.total_amount) || 0), 0);
    return {
      totalApprovalsCount,
      totalApprovalsValue,
      totalExceptionsCount,
      totalDecisionsCount,
      totalDecisionsValue,
      allCount: totalApprovalsCount + totalExceptionsCount + totalDecisionsCount
    };
  }, [feed]);

  // Combined list
  const combinedItems = useMemo(() => {
    const items = [];
    feed.approvals.forEach(a => items.push({ ...a, categoryGroup: 'approval', sortDate: a.created || a.date || '' }));
    feed.exceptions.forEach(e => items.push({ ...e, categoryGroup: 'exception', sortDate: e.date || e.created || '' }));
    feed.decisions.forEach(d => items.push({ ...d, categoryGroup: 'decision', sortDate: d.created || d.date || '' }));

    return items
      .filter(item => {
        if (activeTab === 'approvals' && item.categoryGroup !== 'approval') return false;
        if (activeTab === 'exceptions' && item.categoryGroup !== 'exception') return false;
        if (activeTab === 'decisions' && item.categoryGroup !== 'decision') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchStr = `${item.title || ''} ${item.truck_number || ''} ${item.driver_name || ''} ${item.route || ''} ${item.customer_name || ''} ${item.rule_name || ''}`.toLowerCase();
          return matchStr.includes(q);
        }
        return true;
      })
      .sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || ''));
  }, [feed, activeTab, searchQuery]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 border",
          toastMessage.type === 'error' ? "bg-rose-950/90 text-rose-200 border-rose-800" :
          toastMessage.type === 'success' ? "bg-emerald-950/90 text-emerald-200 border-emerald-800" :
          "bg-slate-900/90 text-slate-100 border-slate-700"
        )}>
          <Icons.Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Icons.Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Owner Inbox & Decision Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Unified executive command feed for disbursements, fleet delay exceptions, and high-value approvals.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchFeed(false)}
            disabled={loading || refreshing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white flex items-center gap-2 active:scale-95 transition-all"
          >
            <Icons.RefreshCw className={cn("w-3.5 h-3.5", (loading || refreshing) && "animate-spin")} />
            {refreshing ? "Refreshing..." : "Refresh Feed"}
          </button>
        </div>
      </div>

      {/* Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Pending Approvals */}
        <div className="p-5 rounded-3xl bg-card border border-amber-500/30 shadow-soft space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Icons.DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{metrics.totalApprovalsCount}</div>
          <p className="text-xs text-amber-400 font-bold">₹{metrics.totalApprovalsValue.toLocaleString('en-IN')} pending disbursement</p>
        </div>

        {/* Metric 2: Fleet Exceptions */}
        <div className="p-5 rounded-3xl bg-card border border-rose-500/30 shadow-soft space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fleet Exceptions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Icons.AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{metrics.totalExceptionsCount}</div>
          <p className="text-xs text-rose-400 font-bold">Delays (&gt;45m) & Breakdowns</p>
        </div>

        {/* Metric 3: Strategic Decisions */}
        <div className="p-5 rounded-3xl bg-card border border-cyan-500/30 shadow-soft space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Icons.Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{metrics.totalDecisionsCount}</div>
          <p className="text-xs text-cyan-400 font-bold">₹{metrics.totalDecisionsValue.toLocaleString('en-IN')} pipeline</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          {[
            { id: 'all', label: `All Items (${metrics.allCount})` },
            { id: 'approvals', label: `Approvals (${metrics.totalApprovalsCount})` },
            { id: 'exceptions', label: `Exceptions (${metrics.totalExceptionsCount})` },
            { id: 'decisions', label: `Quotes (${metrics.totalDecisionsCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search item, truck, driver, route..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50 w-full sm:w-64"
        />
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground space-y-3">
          <Icons.RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
          <p className="text-xs font-bold uppercase tracking-wider">Syncing Executive Command Feed...</p>
        </div>
      ) : combinedItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center text-2xl">✨</div>
          <h3 className="text-base font-bold text-foreground">All Clear! Zero Pending Items</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">No approvals, delays, or quotes require your immediate decision right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {combinedItems.map(item => {
            // APPROVAL CARD
            if (item.categoryGroup === 'approval') {
              const isProcessing = processingActionId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-3xl bg-card border border-amber-500/30 hover:border-amber-500/60 shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        FINANCIAL APPROVAL
                      </span>
                      {item.rule_name && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300">{item.rule_name}</span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground">{item.title || item.rule_name || 'Approval Request'}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Requested Amount: <strong className="text-amber-400 text-base">₹{Number(item.amount || 0).toLocaleString('en-IN')}</strong>
                      {item.requester_name ? ` • Requester: ${item.requester_name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleExecuteAction(item, 'APPROVE_WORKFLOW')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      <Icons.CheckCircle2 className="w-4 h-4" />
                      Approve & Disburse
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => { setRejectDialogItem(item); setRejectReason(''); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      <Icons.XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            }

            // EXCEPTION CARD
            if (item.categoryGroup === 'exception') {
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-3xl bg-card border border-rose-500/30 hover:border-rose-500/60 shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {item.type || "FLEET EXCEPTION"}
                      </span>
                      {item.truck_number && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300">{item.truck_number}</span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground">{item.title || `${item.route || 'Shipment'} Delay Notice`}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Driver: {item.driver_name || 'Assigned Driver'}{item.driver_phone ? ` (${item.driver_phone})` : ''} • Route: {item.route || 'Highway Corridor'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                    {item.driver_phone && (
                      <a
                        href={`https://wa.me/91${String(item.driver_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Jai Bhavani Cargo Operational Alert: Status check on truck ${item.truck_number || ''} regarding delay.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                      >
                        <Icons.MessageSquare className="w-4 h-4" />
                        WhatsApp Driver
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            // DECISION / QUOTE CARD
            if (item.categoryGroup === 'decision') {
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-3xl bg-card border border-cyan-500/30 hover:border-cyan-500/60 shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        CUSTOMER QUOTATION
                      </span>
                      {item.quote_number && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300">{item.quote_number}</span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground">{item.customer_name || 'Corporate Shipper'} — {item.origin || ''} ➔ {item.destination || ''}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Estimated Freight: <strong className="text-cyan-400">₹{Number(item.amount || item.total_amount || 0).toLocaleString('en-IN')}</strong>
                      {item.kms ? ` (${item.kms} KMs)` : ''} • Status: {item.status || 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                    <button
                      type="button"
                      onClick={() => navigate(`/quotes-manager?quoteNumber=${item.quote_number || ''}`)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      Open Quote & Convert
                      <Icons.ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectDialogItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Icons.XCircle className="w-5 h-5" />
                Reject Approval Request
              </div>
              <button
                type="button"
                onClick={() => setRejectDialogItem(null)}
                className="text-slate-400 hover:text-white text-lg font-black"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Please enter the operational reason for rejecting this disbursement. The requester and driver will be notified.
            </p>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-500 uppercase font-black tracking-wider block">Item Details:</span>
              <p className="text-slate-200 font-bold mt-1">
                {rejectDialogItem?.title || rejectDialogItem?.rule_name} (₹{rejectDialogItem?.amount})
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Reason for Rejection *</label>
              <textarea
                rows={3}
                placeholder="e.g. Rate exceeds sanctioned depot rates, duplicate fuel bill, requires inspection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500/50"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectDialogItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || processingActionId === rejectDialogItem?.id}
                onClick={() => handleExecuteAction(rejectDialogItem, 'REJECT_WORKFLOW', rejectReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
