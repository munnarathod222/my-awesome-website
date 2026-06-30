import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, FileText, MoreHorizontal, Calculator, Receipt } from 'lucide-react';
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
              <div className="overflow-x-auto">
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
    </div>
  );
};

export default QuotesManagerPage;