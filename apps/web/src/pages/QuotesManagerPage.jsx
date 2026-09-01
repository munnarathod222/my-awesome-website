import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Plus, Search, FileText, MoreHorizontal, Calculator, Receipt, Mail, MessageSquare, Sparkles, CheckCircle2, Clock, PhoneCall, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

import QuoteFormModal from '@/components/QuoteFormModal.jsx';
import QuoteDetailsView from '@/components/QuoteDetailsView.jsx';
import InvoiceMakerPage from '@/pages/InvoiceMakerPage.jsx';
import SendMailDialog from '@/components/SendMailDialog.jsx';
import WhatsAppShareModal from '@/components/WhatsAppShareModal.jsx';
import { generateCorporateContractPdf } from '@/lib/contractPdfGenerator.js';
import { TRUCK_SIZE_FILTER_OPTIONS } from '@/constants/truckSizes.js';

const statusColors = {
  'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Draft': 'bg-muted text-muted-foreground border-border',
  'Quoted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Accepted': 'bg-success/20 text-success border-success/30',
  'Negotiating': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Rejected': 'bg-destructive/20 text-destructive border-destructive/30'
};

const QuotesManagerPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [truckSizeFilter, setTruckSizeFilter] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const [activeMainTab, setActiveMainTab] = useState('quotes');
  const [quoteToConvert, setQuoteToConvert] = useState(null);

  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedQuoteForWhatsApp, setSelectedQuoteForWhatsApp] = useState(null);

  const handleOpenWhatsApp = (quote) => {
    setSelectedQuoteForWhatsApp(quote);
    setWhatsAppModalOpen(true);
  };

  const triggerEmailQuote = (quote) => {
    const formattedDate = quote.created ? format(new Date(quote.created), 'dd MMM yyyy') : 'Today';
    const formattedPrice = Number(quote.total_price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    
    let routeHtml = '';
    if (quote.origin && quote.destination) {
      routeHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 11px;">
          <strong>Transit Route Details:</strong>
          <table style="width: 100%; margin-top: 5px; font-size: 11px;">
            <tr>
              <td style="width: 40%; color: #64748b;">Pickup Origin:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.origin}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Drop Destination:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.destination}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Truck Size / Vehicle:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.truck_size || quote.container_type || '32 FT SXL'}</td>
            </tr>
            ${quote.custom_vehicle_requirement ? `
            <tr>
              <td style="color: #d97706; font-weight: bold;">Vehicle Requirement:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.custom_vehicle_requirement}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #64748b;">Chargeable Weight:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.chargeable_weight?.toLocaleString() || quote.actual_weight || 1000} kg</td>
            </tr>
          </table>
        </div>
      `;
    }

    const htmlContent = `
      <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #ffffff; max-width: 550px; font-family: sans-serif;">
        <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
          <h2 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">JAI BHAVANI CARGO</h2>
          <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">Heavy Fleet Logistics & Container Transit</p>
        </div>
        
        <table style="width: 100%; font-size: 11px; margin-bottom: 12px; color: #475569;">
          <tr>
            <td style="vertical-align: top; width: 55%;">
              <strong>Quote Prepared For:</strong>
              <div style="color: #0f172a; font-weight: bold; margin-top: 2px;">${quote.customer_name}</div>
              ${quote.customer_email ? `<div>${quote.customer_email}</div>` : ''}
              ${quote.customer_phone ? `<div>Phone: ${quote.customer_phone}</div>` : ''}
            </td>
            <td style="vertical-align: top; text-align: right; width: 45%;">
              <div><strong>Quote Reference #:</strong> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">${quote.quote_number}</span></div>
              <div><strong>Issued Date:</strong> ${formattedDate}</div>
              <div><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">${quote.status || 'Quoted'}</span></div>
            </td>
          </tr>
        </table>

        ${routeHtml}

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; border-top: 2px solid #e2e8f0;">
          <tr style="font-weight: bold;">
            <td style="padding: 10px 8px; text-align: left; color: #475569;">Estimated Freight Value Charge:</td>
            <td style="padding: 10px 8px; text-align: right; color: #2563eb; font-size: 14px;">${formattedPrice}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          This quote is valid for 15 days from the date of issue. Jai Bhavani Cargo (Phone: 7794072244).
        </div>
      </div>
    `;

    setMailData({
      recipient: quote.customer_email || '',
      subject: `Jai Bhavani Cargo - Freight Quote Estimate ${quote.quote_number}`,
      body: `Dear ${quote.customer_name},\n\nPlease find attached the freight quote estimate #${quote.quote_number} for container transit from ${quote.origin || 'origin'} to ${quote.destination || 'destination'}.\n\nTotal Quoted Freight Amount: ${formattedPrice}\n\nKindly reply to confirm this vehicle booking.\n\nRegards,\nVinod Kumar Rathod\nJai Bhavani Cargo Ltd\nPhone: 7794072244`,
      html: htmlContent,
      label: `Quote #${quote.quote_number}`
    });
    setMailOpen(true);
  };

  const fetchQuotes = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(prev => (quotes.length === 0 ? true : prev));

    try {
      const quotesMap = new Map();

      // 1. Fetch from server API endpoint (super-user + SQLite)
      try {
        const endpoints = ['/hcgi/api/driver/get-quotes', '/api/driver/get-quotes'];
        for (const ep of endpoints) {
          try {
            const res = await window.fetch(ep);
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.quotes)) {
                data.quotes.forEach(q => {
                  const key = q.quote_number || q.id;
                  quotesMap.set(key, q);
                });
                break;
              }
            }
          } catch (e) {}
        }
      } catch (apiErr) {}

      // 2. Fetch from PocketBase SDK
      try {
        const remoteRecords = await pb.collection('quotes').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        (remoteRecords || []).forEach(q => {
          const key = q.quote_number || q.id;
          if (!quotesMap.has(key) || !quotesMap.get(key).customer_name) {
            quotesMap.set(key, q);
          }
        });
      } catch (e) {
        console.warn('PocketBase fetch quotes warning:', e);
      }

      // 3. Local Storage Sync
      try {
        const localQuotes = JSON.parse(localStorage.getItem('jbc_public_quotes') || '[]');
        (localQuotes || []).forEach(q => {
          const key = q.quote_number || q.id;
          if (!quotesMap.has(key)) {
            quotesMap.set(key, q);
          }
        });
      } catch (e) {}

      const combined = Array.from(quotesMap.values()).sort((a, b) => {
        const timeA = new Date(a.created || a.updated || 0).getTime();
        const timeB = new Date(b.created || b.updated || 0).getTime();
        return timeB - timeA;
      });

      setQuotes(combined);

      // Check if URL search param targets a specific quote to open
      const targetNum = searchParams.get('quoteNumber') || searchParams.get('quoteId');
      if (targetNum) {
        const match = combined.find(q => q.quote_number === targetNum || q.id === targetNum);
        if (match) {
          setSelectedQuote(match);
          setIsDetailsOpen(true);
        }
      }

      if (isManual) {
        toast.success(`Quotes refreshed! (${combined.length} total)`);
      }
    } catch (error) {
      console.error(error);
      if (isManual) toast.error('Failed to refresh quotes');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'quotes') {
      fetchQuotes();
    }

    const handleNewQuote = () => {
      fetchQuotes();
    };

    window.addEventListener('jbc_new_quote_submitted', handleNewQuote);
    window.addEventListener('storage', handleNewQuote);

    // PocketBase realtime subscription
    pb.collection('quotes').subscribe('*', (e) => {
      fetchQuotes();
    }).catch(() => {});

    // Multi-tab BroadcastChannel listener
    let bc;
    if (typeof window.BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('jbc_quotes_channel');
        bc.onmessage = () => {
          fetchQuotes();
        };
      } catch (e) {}
    }

    // Live polling every 8 seconds
    const interval = setInterval(() => {
      if (activeMainTab === 'quotes') {
        fetchQuotes();
      }
    }, 8000);

    return () => {
      window.removeEventListener('jbc_new_quote_submitted', handleNewQuote);
      window.removeEventListener('storage', handleNewQuote);
      try { pb.collection('quotes').unsubscribe('*'); } catch (e) {}
      if (bc) { bc.close(); }
      clearInterval(interval);
    };
  }, [activeMainTab, searchParams]);

  const handleCreateNew = () => {
    setSelectedQuote(null);
    setIsFormOpen(true);
  };

  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setIsFormOpen(true);
  };

  const handleView = (quote) => {
    setSelectedQuote(quote);
    setIsDetailsOpen(true);
  };

  const handleConvertToInvoice = (quote) => {
    setQuoteToConvert(quote);
    setActiveMainTab('invoices');
  };

  const filteredQuotes = quotes.filter(q => {
    const qNum = (q.quote_number || '').toLowerCase();
    const cName = (q.customer_name || '').toLowerCase();
    const orig = (q.origin || '').toLowerCase();
    const dest = (q.destination || '').toLowerCase();
    const truck = (q.truck_size || q.container_type || '').toLowerCase();
    const req = (q.custom_vehicle_requirement || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = qNum.includes(query) || cName.includes(query) || orig.includes(query) || dest.includes(query) || truck.includes(query) || req.includes(query);
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        if (q.status !== 'Pending' && q.status !== 'Draft' && q.status) return false;
      } else if (q.status !== statusFilter) {
        return false;
      }
    }

    // Truck Size filter
    if (truckSizeFilter !== 'All') {
      const filterLower = truckSizeFilter.toLowerCase();
      if (filterLower === 'other / not sure') {
        const isOther = truck.includes('other') || truck.includes('not sure') || Boolean(q.custom_vehicle_requirement);
        if (!isOther) return false;
      } else {
        const normQ = truck.replace(/[^a-z0-9]/g, '');
        const normF = filterLower.replace(/[^a-z0-9]/g, '');
        if (!normQ.includes(normF)) return false;
      }
    }

    return true;
  });

  const counts = React.useMemo(() => {
    const total = quotes.length;
    const pending = quotes.filter(q => q.status === 'Pending' || q.status === 'Draft' || !q.status).length;
    const quoted = quotes.filter(q => q.status === 'Quoted' || q.status === 'Sent').length;
    const accepted = quotes.filter(q => q.status === 'Accepted').length;
    return { total, pending, quoted, accepted };
  }, [quotes]);

  const handleQuoteUpdate = (updatedQuote) => {
    if (!updatedQuote) {
      fetchQuotes();
    } else {
      setQuotes(prev => prev.map(q => (q.id === updatedQuote.id || q.quote_number === updatedQuote.quote_number) ? updatedQuote : q));
      setSelectedQuote(updatedQuote);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Quotes & Invoices | Dashboard</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" /> Quotes & Invoicing Hub
          </h1>
          <p className="text-muted-foreground">Manage landing page inquiries, dispatch rate negotiations, and generate B2B invoices.</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase">Total Inquiries</p>
              <p className="text-2xl font-black mt-0.5">{counts.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400 font-bold uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending Inquiries
              </p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{counts.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400 font-bold uppercase">Quoted / Sent</p>
              <p className="text-2xl font-black text-blue-400 mt-0.5">{counts.quoted}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase">Accepted Orders</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{counts.accepted}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="quotes" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <Calculator className="w-4 h-4" /> Quotes {counts.pending > 0 && <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">{counts.pending}</span>}
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <Receipt className="w-4 h-4" /> Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6 m-0 outline-none">
          <div className="flex justify-end items-center gap-3">
             <Button
               variant="outline"
               onClick={() => fetchQuotes(true)}
               disabled={isRefreshing}
               className="rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 font-semibold gap-1.5"
             >
               <RefreshCw className={cn("w-4 h-4 text-primary", isRefreshing && "animate-spin")} />
               Refresh
             </Button>
             <Button 
               variant="outline"
               onClick={() => {
                 try {
                   const buffer = generateCorporateContractPdf({ clientName: 'Valued Corporate Partner' });
                   const blob = new Blob([buffer], { type: 'application/pdf' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `B2B_Transport_Contract_LOI.pdf`;
                   document.body.appendChild(a);
                   a.click();
                   document.body.removeChild(a);
                   window.URL.revokeObjectURL(url);
                   toast.success('B2B Transport Contract & Rate LOI exported!');
                 } catch (e) {
                   toast.error('Failed to export contract PDF');
                 }
               }}
               className="rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-semibold gap-2"
             >
               <Download className="w-4 h-4" /> B2B Contract LOI (PDF)
             </Button>
             <Button onClick={handleCreateNew} className="shadow-sm rounded-xl">
               <Plus className="w-4 h-4 mr-2" /> Create Custom Quote
             </Button>
          </div>

          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Quotes & Landing Inquiries
                </CardTitle>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-60 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search quote #, customer, route, truck..."
                      className="pl-9 bg-background"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending (Inquiries)</SelectItem>
                      <SelectItem value="Quoted">Quoted</SelectItem>
                      <SelectItem value="Negotiating">Negotiating</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={truckSizeFilter} onValueChange={setTruckSizeFilter}>
                    <SelectTrigger className="w-[160px] bg-background">
                      <SelectValue placeholder="Truck Size" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {TRUCK_SIZE_FILTER_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt === 'All' ? 'All Truck Sizes' : opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-[130px]">Quote #</TableHead>
                      <TableHead>Customer & Route</TableHead>
                      <TableHead>Truck Size / Cargo</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Quoted Price</TableHead>
                      <TableHead className="text-center w-[130px]">Status</TableHead>
                      <TableHead className="w-[110px]">Date</TableHead>
                      <TableHead className="text-right w-[180px]">Quick Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">Loading quotes...</TableCell>
                      </TableRow>
                    ) : filteredQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          No quotes found matching your filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map(quote => (
                        <TableRow key={quote.id || quote.quote_number} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-semibold text-primary font-mono text-xs">
                            {quote.quote_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-foreground">{quote.customer_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span>{quote.origin}</span>
                              <span>➡️</span>
                              <span>{quote.destination}</span>
                            </div>
                            {quote.customer_phone && (
                              <div className="text-[11px] text-slate-400 mt-0.5">📞 {quote.customer_phone}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-bold text-slate-200">
                              {quote.truck_size || quote.container_type || '32 FT SXL'}
                            </div>
                            {quote.custom_vehicle_requirement ? (
                              <div className="text-amber-400 font-medium text-[11px] truncate max-w-[170px]" title={quote.custom_vehicle_requirement}>
                                Req: {quote.custom_vehicle_requirement}
                              </div>
                            ) : quote.material_type ? (
                              <div className="text-muted-foreground text-[11px] truncate max-w-[150px]">{quote.material_type}</div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {quote.actual_weight ? `${Number(quote.actual_weight).toLocaleString()} kg` : '1,000 kg'}
                          </TableCell>
                          <TableCell className="text-right font-extrabold tabular-nums text-emerald-400">
                            ₹{Number(quote.total_price || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn("text-xs font-bold px-2.5 py-0.5 border", statusColors[quote.status] || statusColors['Pending'])}>
                              {quote.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {quote.created ? format(new Date(quote.created), 'MMM dd') : 'Recent'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleView(quote)}
                                className="h-8 px-2.5 rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs gap-1 shadow-sm"
                              >
                                Respond
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenWhatsApp(quote)}
                                className="h-8 px-2 rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold text-xs gap-1 shadow-sm"
                                title="Send WhatsApp Quote"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(quote)} className="font-bold text-primary">
                                    Respond & Negotiate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenWhatsApp(quote)} className="text-emerald-400 font-bold">
                                    <MessageSquare className="w-4 h-4 mr-2 text-emerald-400" />
                                    Share WhatsApp API
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => triggerEmailQuote(quote)}>
                                    <Mail className="w-4 h-4 mr-2" /> Email Quote
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(quote)}>
                                    Edit Quote Form
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                                    Convert to Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-border/40">
                {loading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">Loading quotes...</div>
                ) : filteredQuotes.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No quotes found.
                  </div>
                ) : (
                  filteredQuotes.map(quote => (
                    <div key={quote.id || quote.quote_number} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-primary font-mono">{quote.quote_number}</span>
                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border", statusColors[quote.status] || statusColors['Pending'])}>
                          {quote.status || 'Pending'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm text-foreground">{quote.customer_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{quote.origin} ➡️ {quote.destination}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Truck Size</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate">{quote.truck_size || quote.container_type || '32 FT SXL'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Weight</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate">{quote.actual_weight || 1000} kg</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Quoted</p>
                          <p className="font-extrabold text-emerald-400 mt-0.5 truncate">₹{Number(quote.total_price || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {quote.custom_vehicle_requirement && (
                        <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md text-amber-300">
                          <span className="font-bold">Req: </span>{quote.custom_vehicle_requirement}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <span className="text-[10px] text-muted-foreground">{quote.created ? format(new Date(quote.created), 'MMM dd, yyyy') : 'Recent'}</span>
                        
                        <div className="flex items-center gap-1.5">
                          <Button 
                            size="sm" 
                            onClick={() => handleView(quote)}
                            className="h-7 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90"
                          >
                            Respond
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenWhatsApp(quote)}
                            className="h-7 px-2 text-[11px] font-bold rounded-lg border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="m-0 outline-none">
          <InvoiceMakerPage initialQuote={quoteToConvert} />
        </TabsContent>
      </Tabs>

      {/* Modals & Dialogs */}
      <QuoteFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        quote={selectedQuote}
        onSuccess={handleQuoteUpdate}
      />

      <QuoteDetailsView 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        quote={selectedQuote}
        onUpdate={handleQuoteUpdate}
        onEdit={handleEdit}
        onConvertToInvoice={handleConvertToInvoice}
        onTriggerEmail={triggerEmailQuote}
      />

      <SendMailDialog
        isOpen={mailOpen}
        onClose={() => setMailOpen(false)}
        initialRecipient={mailData.recipient}
        initialSubject={mailData.subject}
        initialBody={mailData.body}
        initialHtml={mailData.html}
        documentLabel={mailData.label}
      />

      <WhatsAppShareModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        quote={selectedQuoteForWhatsApp}
        defaultTemplate="quote"
        overridePhone={selectedQuoteForWhatsApp?.customer_phone || selectedQuoteForWhatsApp?.phone || ''}
      />
    </div>
  );
};

export default QuotesManagerPage;