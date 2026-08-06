import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, FileText, MoreHorizontal, Calculator, Receipt, Mail } from 'lucide-react';
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

const statusColors = {
  'Draft': 'bg-muted text-muted-foreground',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Accepted': 'bg-success/20 text-success border-success/30',
  'Rejected': 'bg-destructive/20 text-destructive border-destructive/30'
};

const QuotesManagerPage = () => {
  const { currentUser } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const [activeMainTab, setActiveMainTab] = useState('quotes');
  const [quoteToConvert, setQuoteToConvert] = useState(null);

  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const triggerEmailQuote = (quote) => {
    const formattedDate = format(new Date(quote.created), 'dd MMM yyyy');
    const formattedPrice = quote.total_price?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    
    let routeHtml = '';
    if (quote.source && quote.destination) {
      routeHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 11px;">
          <strong>Transit Route Details:</strong>
          <table style="width: 100%; margin-top: 5px; font-size: 11px;">
            <tr>
              <td style="width: 40%; color: #64748b;">Pickup Origin:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.source}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Drop Destination:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.destination}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Container / Truck Type:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.container_type || 'General Cargo'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Chargeable Weight:</td>
              <td style="color: #0f172a; font-weight: bold;">${quote.chargeable_weight?.toLocaleString()} kg</td>
            </tr>
          </table>
        </div>
      `;
    }

    const htmlContent = `
      <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #ffffff; max-width: 550px; font-family: sans-serif;">
        <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
          <h2 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800; text-transform: uppercase; tracking-wider: 1px;">JAI BHAVANI CARGO</h2>
          <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">Heavy Fleet Logistics & Container Transit</p>
        </div>
        
        <table style="width: 100%; font-size: 11px; margin-bottom: 12px; color: #475569;">
          <tr>
            <td style="vertical-align: top; width: 55%;">
              <strong>Quote Prepared For:</strong>
              <div style="color: #0f172a; font-weight: bold; margin-top: 2px;">${quote.customer_name}</div>
              ${quote.customer_email ? `<div>${quote.customer_email}</div>` : ''}
            </td>
            <td style="vertical-align: top; text-align: right; width: 45%;">
              <div><strong>Quote Reference #:</strong> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">${quote.quote_number}</span></div>
              <div><strong>Issued Date:</strong> ${formattedDate}</div>
              <div><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">${quote.status || 'Active'}</span></div>
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
          This quote is valid for 15 days from the date of issue. Jai Bhavani Cargo.
        </div>
      </div>
    `;

    setMailData({
      recipient: quote.customer_email || '',
      subject: `Jai Bhavani Cargo - Quote Estimate ${quote.quote_number}`,
      body: `Dear Partner,\n\nPlease find attached the freight quote estimate #${quote.quote_number} for container transit from ${quote.source || 'origin'} to ${quote.destination || 'destination'}.\n\nTotal Estimated Price: ${formattedPrice}\n\nKindly review and let us know if you approve this quote.\n\nRegards,\nVinod Kumar Rathod\nJai Bhavani Cargo Ltd`,
      html: htmlContent,
      label: `Quote #${quote.quote_number}`
    });
    setMailOpen(true);
  };

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('quotes').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setQuotes(records);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'quotes') {
      fetchQuotes();
    }
  }, [activeMainTab]);

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
    const matchesSearch = 
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleQuoteUpdate = (updatedQuote) => {
    if (!updatedQuote) {
      fetchQuotes();
    } else {
      setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Estimates & Invoicing</h1>
          <p className="text-muted-foreground">Manage your freight quotes and generate professional invoices.</p>
        </div>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="quotes" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <Calculator className="w-4 h-4" /> Quotes
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1 sm:px-8 flex items-center gap-2 data-[state=active]:bg-background">
            <Receipt className="w-4 h-4" /> Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6 m-0 outline-none">
          <div className="flex justify-end">
             <Button onClick={handleCreateNew} className="shadow-sm rounded-xl">
               <Plus className="w-4 h-4 mr-2" /> Create New Quote
             </Button>
          </div>

          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> All Quotes
                </CardTitle>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search quote # or customer..."
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
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-[120px]">Quote #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Container</TableHead>
                      <TableHead className="text-right">Chargeable Wt.</TableHead>
                      <TableHead className="text-right">Total Price</TableHead>
                      <TableHead className="text-center w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="text-right w-[80px]">Actions</TableHead>
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
                          No quotes found. Create a new quote to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map(quote => (
                        <TableRow key={quote.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-semibold text-primary">
                            {quote.quote_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{quote.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{quote.destination}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {quote.container_type}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {quote.chargeable_weight?.toLocaleString()} kg
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            ₹{quote.total_price?.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 border-transparent", statusColors[quote.status] || statusColors['Draft'])}>
                              {quote.status || 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(quote.created), 'MMM dd')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(quote)}>
                                  View Details
                                </DropdownMenuItem>
                                {quote.status !== 'Accepted' && (
                                  <DropdownMenuItem onClick={() => handleEdit(quote)}>
                                    Edit Quote
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => triggerEmailQuote(quote)}>
                                  Email Quote
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                                  Convert to Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View (Hidden on desktop) */}
              <div className="block md:hidden divide-y divide-border/40">
                {loading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">Loading quotes...</div>
                ) : filteredQuotes.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No quotes found. Create a new quote to get started.
                  </div>
                ) : (
                  filteredQuotes.map(quote => (
                    <div key={quote.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-primary">{quote.quote_number}</span>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 border-transparent", statusColors[quote.status] || statusColors['Draft'])}>
                          {quote.status || 'Draft'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm text-foreground">{quote.customer_name}</p>
                        {quote.destination && (
                          <p className="text-xs text-muted-foreground mt-0.5">{quote.destination}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Container</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate">{quote.container_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Charge Wt.</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate">{quote.chargeable_weight?.toLocaleString()} kg</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Price</p>
                          <p className="font-extrabold text-foreground mt-0.5 truncate">₹{quote.total_price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <span className="text-[10px] text-muted-foreground">{format(new Date(quote.created), 'MMM dd, yyyy')}</span>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleView(quote)}
                            className="h-7 text-[11px] font-bold rounded-lg border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                          >
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              {quote.status !== 'Accepted' && (
                                <DropdownMenuItem onClick={() => handleEdit(quote)} className="text-xs font-semibold rounded-lg">
                                  Edit Quote
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => triggerEmailQuote(quote)} className="text-xs font-semibold rounded-lg">
                                Email Quote
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)} className="text-xs font-semibold rounded-lg">
                                Convert to Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
          <InvoiceMakerPage 
            quoteToConvert={quoteToConvert} 
            onConverted={() => setQuoteToConvert(null)} 
          />
        </TabsContent>

      </Tabs>

      <QuoteFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        quote={selectedQuote}
        onSuccess={fetchQuotes}
      />

      <QuoteDetailsView 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        quote={selectedQuote}
        onUpdate={handleQuoteUpdate}
        onEdit={(q) => { setIsDetailsOpen(false); handleEdit(q); }}
        onConvertToInvoice={handleConvertToInvoice}
      />

      <SendMailDialog
        isOpen={mailOpen}
        onOpenChange={setMailOpen}
        defaultRecipient={mailData.recipient}
        defaultSubject={mailData.subject}
        defaultBody={mailData.body}
        richHtmlContent={mailData.html}
        contextLabel={mailData.label}
      />
    </div>
  );
};

export default QuotesManagerPage;