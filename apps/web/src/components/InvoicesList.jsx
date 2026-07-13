import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Receipt, Plus, Download, FileText, Table as TableIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import InvoiceDetailsView from './InvoiceDetailsView.jsx';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';

const statusColors = {
  'Draft': 'bg-muted text-muted-foreground',
  'Sent': 'bg-blue-100 text-blue-800 border-blue-200',
  'Paid': 'bg-success/20 text-success border-success/30',
  'Overdue': 'bg-destructive/20 text-destructive border-destructive/30'
};

const InvoicesList = ({ onCreateNew, onEditInvoice }) => {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('invoices').getList(1, 50, {
        filter: `created_by = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setInvoices(records.items);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentUser.id]);

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to permanently delete this invoice?')) return;
    try {
      await pb.collection('invoices').delete(invoiceId, { $autoCancel: false });
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const prepareExportData = () => {
    return filteredInvoices.map(inv => ({
      'Invoice #': inv.invoice_number,
      'Customer': inv.customer_name,
      'Date': format(new Date(inv.invoice_date), 'yyyy-MM-dd'),
      'Due Date': format(new Date(inv.due_date), 'yyyy-MM-dd'),
      'Status': inv.status,
      'Total Amount (₹)': inv.total_amount
    }));
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const data = prepareExportData();
      const columns = [
        { header: 'Invoice #', key: 'Invoice #' },
        { header: 'Customer', key: 'Customer' },
        { header: 'Date', key: 'Date' },
        { header: 'Due Date', key: 'Due Date' },
        { header: 'Status', key: 'Status' },
        { header: 'Total Amount (₹)', key: 'Total Amount (₹)' }
      ];
      
      const totalAmount = data.reduce((sum, row) => sum + Number(row['Total Amount (₹)'] || 0), 0);
      const totals = {
        'Invoice #': 'TOTAL',
        'Customer': '',
        'Date': '',
        'Due Date': '',
        'Status': '',
        'Total Amount (₹)': totalAmount
      };

      const blob = generatePDF(data, 'Invoices_List', {
        title: 'Invoices Report',
        columns,
        totals
      });
      
      downloadFile(blob, `Invoices_List_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const data = prepareExportData();
      const totalAmount = data.reduce((sum, row) => sum + Number(row['Total Amount (₹)'] || 0), 0);
      
      data.push({
        'Invoice #': 'TOTAL',
        'Customer': '',
        'Date': '',
        'Due Date': '',
        'Status': '',
        'Total Amount (₹)': totalAmount
      });

      const blob = generateExcel(data, 'Invoices_List', 'Invoices');
      downloadFile(blob, `Invoices_List_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoice # or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExportingPDF || isExportingExcel}>
                {isExportingPDF || isExportingExcel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExportingPDF}>
                <FileText className="w-4 h-4 mr-2 text-destructive" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} disabled={isExportingExcel}>
                <TableIcon className="w-4 h-4 mr-2 text-success" /> Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[140px]">Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading invoices...</TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      No invoices found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map(inv => (
                    <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-primary">{inv.invoice_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{inv.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{inv.customer_email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{format(new Date(inv.invoice_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(inv.due_date), 'MMM dd, yyyy')}
                        {new Date(inv.due_date) < new Date() && inv.status !== 'Paid' && (
                          <span className="ml-2 text-xs text-destructive font-medium">(Overdue)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary tabular-nums">
                        ₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 border-transparent", statusColors[inv.status] || statusColors['Draft'])}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditInvoice?.(inv)}>
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(inv); setDetailsOpen(true); }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(inv.id)}>
                              Delete
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
              <div className="text-center py-8 text-sm text-muted-foreground">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No invoices found. Create one to get started.
              </div>
            ) : (
              filteredInvoices.map(inv => (
                <div key={inv.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-primary">{inv.invoice_number}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 border-transparent", statusColors[inv.status] || statusColors['Draft'])}>
                      {inv.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-bold text-sm text-foreground">{inv.customer_name}</p>
                    {inv.customer_email && (
                      <p className="text-xs text-muted-foreground mt-0.5">{inv.customer_email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Invoice Date</p>
                      <p className="font-semibold text-foreground mt-0.5">{format(new Date(inv.invoice_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Due Date</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {format(new Date(inv.due_date), 'MMM dd, yyyy')}
                        {new Date(inv.due_date) < new Date() && inv.status !== 'Paid' && (
                          <span className="ml-1 text-[10px] text-destructive font-bold block">(Overdue)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium block">Total Amount</span>
                      <span className="font-extrabold text-sm text-primary">₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setSelectedInvoice(inv); setDetailsOpen(true); }}
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
                          <DropdownMenuItem className="text-xs font-semibold rounded-lg" onClick={() => onEditInvoice?.(inv)}>
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive text-xs font-semibold rounded-lg" onClick={() => handleDelete(inv.id)}>
                            Delete
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

      <InvoiceDetailsView 
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        invoice={selectedInvoice}
        onUpdate={(updatedInv) => {
          setInvoices(prev => prev.map(i => i.id === updatedInv.id ? updatedInv : i));
          setSelectedInvoice(updatedInv);
        }}
      />
    </div>
  );
};

export default InvoicesList;