import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CalendarClock, CheckCircle2, MoreHorizontal, Pencil, Trash2, CalendarRange, SplitSquareHorizontal, ShieldAlert, ShieldCheck, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';
import PlannedPaymentModal from './PlannedPaymentModal.jsx';
import PaymentSplitterCalculator from './PaymentSplitterCalculator.jsx';

const parseNotes = (str) => {
  if (!str) return { type: 'payment', card_id: '', notes: '', pair_id: '' };
  try {
    const p = JSON.parse(str);
    if (p && p.type) return p;
  } catch(e) {}
  return { type: 'payment', card_id: '', notes: str, pair_id: '' };
};

export default function PlannedPaymentsList() {
  const { currentUser } = useAuth();
  const [groupedPayments, setGroupedPayments] = useState([]);
  const [cardsMap, setCardsMap] = useState({});
  const [defaultMaxLimit, setDefaultMaxLimit] = useState(5000);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const [splitAmount, setSplitAmount] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const [records, cards] = await Promise.all([
        pb.collection('planned_surcharge_payments').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-payment_date',
          $autoCancel: false
        }),
        pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          $autoCancel: false
        })
      ]);
      
      const cMap = {};
      let highestLimit = 5000;
      cards.forEach(c => {
        cMap[c.id] = c;
        if (c.max_waiver_per_transaction > highestLimit) highestLimit = c.max_waiver_per_transaction;
      });
      setCardsMap(cMap);
      setDefaultMaxLimit(highestLimit);

      // Group by Date 
      const groupsByDate = {};
      records.forEach(r => {
        const dateKey = r.payment_date.split('T')[0];
        if (!groupsByDate[dateKey]) {
          groupsByDate[dateKey] = {
            date: r.payment_date,
            dateKey: dateKey,
            items: []
          };
        }
        
        const meta = parseNotes(r.notes);
        groupsByDate[dateKey].items.push({ ...r, meta });
      });

      // Pair payments and waivers using pair_id within each date
      const finalGroups = Object.values(groupsByDate).map(group => {
        const pairsMap = {};
        group.items.forEach(item => {
          const pid = item.meta.pair_id || item.id;
          if (!pairsMap[pid]) {
            pairsMap[pid] = { id: pid, payment: null, waiver: null, status: 'pending', card_id: item.meta.card_id };
          }
          
          if (item.meta.type === 'waiver') {
            pairsMap[pid].waiver = item;
            if (item.status === 'completed') pairsMap[pid].status = 'completed';
          } else {
            pairsMap[pid].payment = item;
            pairsMap[pid].status = item.status;
          }
        });
        
        return {
          ...group,
          pairs: Object.values(pairsMap)
        };
      });
      
      setGroupedPayments(finalGroups.sort((a,b) => new Date(b.date) - new Date(a.date)));
      
    } catch (err) {
      console.error("Failed to load planned payments", err);
      toast.error("Could not load planned payments");
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleMarkCompleted = async (pair) => {
    try {
      const promises = [];
      if (pair.payment) promises.push(pb.collection('planned_surcharge_payments').update(pair.payment.id, { status: 'completed' }, { $autoCancel: false }));
      if (pair.waiver) promises.push(pb.collection('planned_surcharge_payments').update(pair.waiver.id, { status: 'completed' }, { $autoCancel: false }));
      await Promise.all(promises);
      toast.success('Pair marked as completed');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (pair) => {
    if (!window.confirm("Are you sure you want to delete this scheduled payment and its linked waiver?")) return;
    try {
      const promises = [];
      if (pair.payment) promises.push(pb.collection('planned_surcharge_payments').delete(pair.payment.id, { $autoCancel: false }));
      if (pair.waiver) promises.push(pb.collection('planned_surcharge_payments').delete(pair.waiver.id, { $autoCancel: false }));
      await Promise.all(promises);
      toast.success('Deleted successfully');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to delete records');
    }
  };

  // Filter and compute group totals dynamically based on visible pairs
  const filteredGroups = groupedPayments.map(g => {
    const filteredPairs = g.pairs.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter.toLowerCase()) return false;
      return true;
    });
    
    const totalPayment = filteredPairs.reduce((acc, p) => acc + (p.payment ? p.payment.expected_surcharge_amount : 0), 0);
    const totalWaiver = filteredPairs.reduce((acc, p) => acc + (p.waiver ? p.waiver.expected_surcharge_amount : 0), 0);
    
    return { ...g, pairs: filteredPairs, totalPayment, totalWaiver };
  }).filter(g => g.pairs.length > 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <CalendarRange className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold leading-tight text-foreground">Payment Planner</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Schedule payments and auto-sync surcharge waivers.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background rounded-xl">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="w-full sm:w-auto shadow-sm rounded-xl">
            Plan Payment
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30 hidden sm:table-header-group">
            <TableRow>
              <TableHead className="w-[180px]">Group Item</TableHead>
              <TableHead>Linked Card</TableHead>
              <TableHead className="text-right">Amounts</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right flex flex-col items-end gap-2 py-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-base">No planned payments match your criteria.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map(group => (
                <React.Fragment key={group.dateKey}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b-2 border-border/50">
                    <TableCell colSpan={6} className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold px-3 py-1.5 text-sm rounded-lg shadow-sm">
                            {format(new Date(group.date), 'MMM dd, yyyy')}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm font-semibold">
                            <span className="text-foreground flex items-center gap-1.5">
                              <SplitSquareHorizontal className="w-4 h-4 text-muted-foreground"/> 
                              Consolidated Total: ₹{group.totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            {group.totalWaiver > 0 && (
                              <span className="text-primary flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" /> 
                                Waivers: ₹{group.totalWaiver.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-background border-border shadow-sm">
                          {group.pairs.length} {group.pairs.length === 1 ? 'Transaction' : 'Transactions'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {group.pairs.map((p, idx) => {
                    const cardLimit = p.card_id && cardsMap[p.card_id] ? cardsMap[p.card_id].max_waiver_per_transaction : defaultMaxLimit;
                    const paymentAmount = p.payment ? p.payment.expected_surcharge_amount : 0;
                    const isEligible = paymentAmount <= cardLimit;
                    const card = cardsMap[p.card_id];
                    
                    return (
                      <TableRow key={p.id} className={`${idx === group.pairs.length - 1 ? 'border-b-4 border-border/20' : ''} transition-colors hover:bg-muted/20`}>
                        <TableCell className="font-medium text-foreground whitespace-nowrap pl-6">
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                             <span className="text-sm text-muted-foreground">Transaction {idx + 1}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                          {card ? (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{card.bank_name}</span>
                              <span className="text-xs text-muted-foreground">..{card.card_number_last4}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unlinked / Legacy</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="flex flex-col items-end gap-1.5">
                            {p.payment ? (
                              <span className="font-bold tabular-nums text-foreground">
                                ₹{p.payment.expected_surcharge_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Waiver Only</span>
                            )}
                            
                            {p.waiver && (
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium px-2 py-0.5 whitespace-nowrap">
                                <ShieldCheck className="w-3 h-3 mr-1.5" />
                                Waiver: ₹{p.waiver.expected_surcharge_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.payment ? (
                            isEligible ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Eligible
                              </Badge>
                            ) : (
                              <div className="flex flex-col gap-2 items-start">
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 font-medium">
                                  <ShieldAlert className="w-3 h-3" /> Exceeds {cardLimit}
                                </Badge>
                                {p.status !== 'completed' && (
                                  <Button variant="ghost" size="sm" onClick={() => setSplitAmount(paymentAmount.toString())} className="h-6 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20">
                                    <SplitSquareHorizontal className="w-3 h-3 mr-1" /> Re-Split
                                  </Button>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.status === 'completed' ? (
                            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 gap-1.5 px-2 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1.5 px-2 font-medium">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              {p.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleMarkCompleted(p)} className="cursor-pointer">
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> Mark Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => { setEditingRecord(p.payment || p.waiver); setIsModalOpen(true); }} className="cursor-pointer">
                                <Pencil className="w-4 h-4 mr-2" /> Edit Pair
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(p)} className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Pair
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PlannedPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayments}
        editRecord={editingRecord}
      />

      <Dialog open={!!splitAmount} onOpenChange={(open) => !open && setSplitAmount(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border rounded-2xl">
          <PaymentSplitterCalculator 
            initialAmount={splitAmount || ''} 
            onSuccess={() => {
              setSplitAmount(null);
              fetchPayments();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}