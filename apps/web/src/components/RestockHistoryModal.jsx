import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const RestockHistoryModal = ({ isOpen, onClose, item }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchHistory();
    }
  }, [isOpen, item]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('restock_history').getFullList({
        filter: `inventory_item_id = "${item.id}"`,
        sort: '-date_received',
        $autoCancel: false
      });
      setHistory(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Restock History: {item?.item_name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Qty Added</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No restock history found.</TableCell></TableRow>
              ) : (
                history.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date_received), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{record.supplier_name}</TableCell>
                    <TableCell className="text-right font-medium">{record.quantity_added}</TableCell>
                    <TableCell className="text-right">₹{record.cost_per_unit?.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">₹{record.total_cost?.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestockHistoryModal;