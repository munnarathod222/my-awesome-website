import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { FileEdit, ShieldCheck, ShieldAlert, IndianRupee, BookOpen, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

export default function SurchargeManagement({ data, loading, onRefresh }) {
  const [filters, setFilters] = useState({
    cardName: 'All',
    waiverStatus: 'All',
    dateFrom: '',
    dateTo: ''
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [waivedAmount, setWaivedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setWaivedAmount(tx.waived_amount ? tx.waived_amount.toString() : '');
    setEditModalOpen(true);
  };

  const handleSaveWaiver = async () => {
    if (!editingTx) return;
    setIsSubmitting(true);
    try {
      const amount = parseFloat(waivedAmount) || 0;
      await pb.collection('fuel_payments').update(editingTx.id, {
        waived_amount: amount
      }, { $autoCancel: false });
      
      toast.success('Waiver status updated successfully');
      setEditModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update waiver status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCards = [...new Set(data?.transactions?.map(t => t.cardName) || [])];

  const filteredTx = (data?.transactions || []).filter(tx => {
    if (filters.cardName !== 'All' && tx.cardName !== filters.cardName) return false;
    
    if (filters.waiverStatus === 'Waived') {
      if (!tx.waived_amount || tx.waived_amount <= 0) return false;
    } else if (filters.waiverStatus === 'Not Waived') {
      if (tx.waived_amount > 0) return false;
    }

    if (filters.dateFrom && new Date(tx.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(tx.date) > new Date(filters.dateTo)) return false;

    return true;
  });

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Documentation Guide */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <BookOpen className="w-5 h-5" /> Smart Payment Splitting Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Maximize your surcharge waivers by splitting large transactions. Follow these steps to optimize your payments:
              </p>
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex gap-3"><span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span> Go to the Dashboard and click the <strong>Payment Splitter</strong> tab.</li>
                <li className="flex gap-3"><span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span> Enter your total bill amount (e.g., ₹20,000) and select the credit card.</li>
                <li className="flex gap-3"><span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span> The system automatically divides the bill to keep every transaction under your card's waiver limit (e.g., 4 payments of ₹5,000).</li>
                <li className="flex gap-3"><span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span> Click <strong>Plan These Payments Now</strong> to add them directly to your Payment Planner.</li>
              </ol>
              <div className="bg-background p-3 rounded-lg border border-border/50 text-sm flex gap-2">
                <Lightbulb className="w-5 h-5 text-warning shrink-0" />
                <span>Example: A ₹20,000 transaction with a 1.2% surcharge generates ₹240 in fees. By splitting into four ₹5,000 payments, the entire ₹240 is waived.</span>
              </div>
            </div>
            <div>
              <img 
                src="https://horizons-cdn.hostinger.com/a5cd4a3c-f3b1-4400-ad75-7c0dd4da7b73/c44d7b036a7bb0a77a37f02a1a74c980.png" 
                alt="Payment Splitting Tracker Example" 
                className="w-full rounded-xl border border-border shadow-sm object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Credit Card</Label>
          <Select value={filters.cardName} onValueChange={v => setFilters({...filters, cardName: v})}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="All Cards" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Cards</SelectItem>
              {uniqueCards.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Waiver Status</Label>
          <Select value={filters.waiverStatus} onValueChange={v => setFilters({...filters, waiverStatus: v})}>
            <SelectTrigger className="bg-background"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Waived">Fully/Partially Waived</SelectItem>
              <SelectItem value="Not Waived">Not Waived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Date Range</Label>
          <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 focus-within:ring-1 focus-within:ring-ring">
            <Input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="h-9 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm bg-transparent" />
            <span className="text-muted-foreground">-</span>
            <Input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="h-9 w-[130px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm bg-transparent" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Card Name</TableHead>
              <TableHead className="text-right">Transaction Amt</TableHead>
              <TableHead className="text-right">Surcharge Incurred</TableHead>
              <TableHead>Waiver Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTx.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No surcharge transactions found matching filters.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTx.map((tx) => {
                const isWaived = tx.waived_amount > 0;
                const isFullyWaived = tx.waived_amount >= tx.surcharge_amount;
                
                return (
                  <TableRow key={tx.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>{tx.cardName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ₹{tx.fuel_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-destructive">
                      ₹{tx.surcharge_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {isWaived ? (
                        <Badge variant="outline" className={`gap-1 ${isFullyWaived ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                          <ShieldCheck className="w-3 h-3" />
                          {isFullyWaived ? 'Fully Waived' : `₹${tx.waived_amount} Waived`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/5 text-destructive/80 border-destructive/20 gap-1">
                          <ShieldAlert className="w-3 h-3" /> Not Waived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(tx)} className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                        <FileEdit className="w-4 h-4 mr-1.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Waiver Status</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center text-sm border border-border">
              <span className="text-muted-foreground">Original Surcharge</span>
              <span className="font-semibold text-destructive">₹{editingTx?.surcharge_amount?.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <Label>Amount Waived / Refunded (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  value={waivedAmount}
                  onChange={(e) => setWaivedAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enter the exact amount refunded by the bank to offset this surcharge.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSaveWaiver} disabled={isSubmitting}>Save Waiver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}