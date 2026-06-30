import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import FuelPaymentModal from '@/components/FuelPaymentModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const FuelPaymentTracker = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    cardId: 'All',
    status: 'All',
    sortBy: '-date'
  });

  useEffect(() => {
    fetchData();
  }, [filters.sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsData, paymentsData] = await Promise.all([
        pb.collection('credit_cards').getFullList({ 
          filter: `user_id = "${currentUser.id}"`,
          $autoCancel: false 
        }),
        pb.collection('fuel_payments').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: filters.sortBy,
          $autoCancel: false
        })
      ]);
      setCards(cardsData);
      setPayments(paymentsData);
    } catch (error) {
      toast.error('Failed to load tracker data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment log?')) {
      try {
        await pb.collection('fuel_payments').delete(id, { $autoCancel: false });
        toast.success('Payment log deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete payment');
      }
    }
  };

  const getCardName = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    return card ? `${card.card_name} (..${card.card_number_last4})` : 'Unknown Card';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-status-paid/10 text-status-paid border-status-paid/20 hover:bg-status-paid/20">Paid</Badge>;
      case 'Pending': return <Badge className="bg-status-soon/10 text-status-soon border-status-soon/20 hover:bg-status-soon/20">Pending</Badge>;
      case 'Failed': return <Badge className="bg-status-overdue/10 text-status-overdue border-status-overdue/20 hover:bg-status-overdue/20">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchSearch = p.notes?.toLowerCase().includes(filters.search.toLowerCase()) || 
                        getCardName(p.card_id).toLowerCase().includes(filters.search.toLowerCase());
    const matchCard = filters.cardId === 'All' || p.card_id === filters.cardId;
    const matchStatus = filters.status === 'All' || p.payment_status === filters.status;
    return matchSearch && matchCard && matchStatus;
  });

  const totalFuelAmount = filteredPayments.reduce((sum, p) => sum + (p.fuel_amount || 0), 0);
  const totalSurcharge = filteredPayments.reduce((sum, p) => sum + (p.surcharge_amount || 0), 0);
  const totalGrand = totalFuelAmount + totalSurcharge;

  return (
    <>
      <Helmet>
        <title>Fuel Tracker - Jai Bhavani Fuel</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Fuel Tracker</h1>
              <p className="text-muted-foreground mt-1">Log and manage your credit card fuel expenses.</p>
            </div>
            <Button onClick={() => { setEditingPayment(null); setIsModalOpen(true); }} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Payment
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes or cards..."
                className="pl-9 bg-input text-foreground"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <Select value={filters.cardId} onValueChange={(val) => setFilters({ ...filters, cardId: val })}>
              <SelectTrigger className="w-[200px] bg-input text-foreground">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Cards</SelectItem>
                {cards.map(c => <SelectItem key={c.id} value={c.id}>{c.card_name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
              <SelectTrigger className="w-[140px] bg-input text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(val) => setFilters({ ...filters, sortBy: val })}>
              <SelectTrigger className="w-[150px] bg-input text-foreground">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-date">Date (Newest)</SelectItem>
                <SelectItem value="date">Date (Oldest)</SelectItem>
                <SelectItem value="-fuel_amount">Amount (High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Card Used</TableHead>
                      <TableHead className="text-right">Fuel Amount</TableHead>
                      <TableHead className="text-right">Surcharge</TableHead>
                      <TableHead className="text-right">Total Bill</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Loading transactions...</TableCell></TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No transactions found.</TableCell></TableRow>
                    ) : (
                      filteredPayments.map(payment => {
                        const fuelAmt = payment.fuel_amount || 0;
                        const surAmt = payment.surcharge_amount || 0;
                        return (
                          <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium whitespace-nowrap">
                              {payment.date ? format(new Date(payment.date), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell>{getCardName(payment.card_id)}</TableCell>
                            <TableCell className="text-right">₹{fuelAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              ₹{surAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                              {payment.surcharge_percentage > 0 && <span className="text-xs ml-1 block">({payment.surcharge_percentage}%)</span>}
                            </TableCell>
                            <TableCell className="text-right font-semibold">₹{(fuelAmt + surAmt).toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(payment.payment_status)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={payment.notes}>{payment.notes || '-'}</TableCell>
                            <TableCell className="text-right pr-4">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(payment); setIsModalOpen(true); }} className="hover:bg-primary/10 hover:text-primary">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)} className="hover:bg-destructive/10 hover:text-destructive text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {!loading && filteredPayments.length > 0 && (
              <div className="bg-muted p-4 border-t border-border flex justify-end gap-8 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Fuel:</span>
                  <span className="ml-2 font-semibold">₹{totalFuelAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Surcharge:</span>
                  <span className="ml-2 font-semibold">₹{totalSurcharge.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Grand Total:</span>
                  <span className="ml-2 font-bold text-foreground text-base">₹{totalGrand.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <FuelPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingPayment}
        cards={cards}
        onSuccess={fetchData}
      />
    </>
  );
};

export default FuelPaymentTracker;