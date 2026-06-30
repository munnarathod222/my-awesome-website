import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FileText, Trash2, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BillsList = ({ refreshTrigger }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    console.log('[BillsList] Starting fetch for expenses with attachments...');
    
    try {
      if (!pb) {
        throw new Error('PocketBase client not initialized');
      }

      // We fetch recent expenses and filter locally to ensure compatibility with array fields
      const records = await pb.collection('expenses').getList(1, 200, {
        sort: '-date',
        $autoCancel: false
      });
      
      console.log('[BillsList] Successfully fetched expenses:', records.items.length);

      // Filter for those with 'documents' or 'bill' file attachments
      const withAttachments = records.items.filter(r => 
        (r.documents && r.documents.length > 0) || 
        (r.bill && r.bill.length > 0)
      );

      console.log('[BillsList] Filtered expenses with attachments:', withAttachments.length);
      setBills(withAttachments);

    } catch (err) {
      console.error('[BillsList] Error fetching bills/attachments:', err);
      setError(err.message || 'Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record and its attachment?')) return;
    
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast.success('Expense record deleted successfully');
      fetchBills();
    } catch (err) {
      console.error('[BillsList] Error deleting expense:', err);
      toast.error('Failed to delete record');
    }
  };

  const handleViewFile = (record) => {
    // Check for documents array first, fallback to bill array if it exists
    const fileArray = record.documents?.length > 0 ? record.documents : record.bill;
    
    if (!fileArray || fileArray.length === 0) {
      toast.info('No file attached to this record');
      return;
    }
    
    // Open the first attached document
    const url = pb.files.getUrl(record, fileArray[0]);
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className="p-8 text-center border border-border rounded-xl bg-card">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3 opacity-80" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchBills} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : bills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-10 h-10 mb-3 opacity-20" />
                  <p>No bills or receipts uploaded yet.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <TableRow key={bill.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(bill.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {bill.category || 'Other'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-muted-foreground">
                  {bill.description || bill.notes || '-'}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ₹{bill.amount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewFile(bill)}
                      className="h-8"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      View Bill
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(bill.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BillsList;