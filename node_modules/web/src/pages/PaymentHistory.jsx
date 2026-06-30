import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Download, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentHistory = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    cardId: 'All',
    method: 'All'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsData, recordsData] = await Promise.all([
        pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          $autoCancel: false
        }),
        pb.collection('payment_records').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-payment_date',
          $autoCancel: false
        })
      ]);
      setCards(cardsData);
      setHistory(recordsData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getCardName = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    return card ? `${card.card_name} (..${card.card_number_last4})` : 'Unknown Card';
  };

  const filteredHistory = history.filter(h => {
    const matchCard = filters.cardId === 'All' || h.card_id === filters.cardId;
    const matchMethod = filters.method === 'All' || h.payment_method === filters.method;
    return matchCard && matchMethod;
  });

  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    
    const headers = ['Date', 'Card', 'Amount Paid', 'Method', 'Ref Number'];
    const rows = filteredHistory.map(h => [
      format(new Date(h.payment_date), 'yyyy-MM-dd'),
      getCardName(h.card_id).replace(/,/g, ''),
      h.amount_paid,
      h.payment_method,
      h.reference_number || 'N/A'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment_history_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Payment History - Jai Bhavani Fuel</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Payment History</h1>
              <p className="text-muted-foreground mt-1">Past settlements and bank transfers.</p>
            </div>
            <Button variant="outline" onClick={exportCSV} disabled={filteredHistory.length === 0} className="gap-2 rounded-xl">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>

          <div className="flex gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
            <Select value={filters.cardId} onValueChange={(val) => setFilters({ ...filters, cardId: val })}>
              <SelectTrigger className="w-[200px] bg-input text-foreground">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Cards</SelectItem>
                {cards.map(c => <SelectItem key={c.id} value={c.id}>{c.card_name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.method} onValueChange={(val) => setFilters({ ...filters, method: val })}>
              <SelectTrigger className="w-[180px] bg-input text-foreground">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Methods</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="shadow-sm border-border rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Card Name</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading history...</TableCell></TableRow>
                    ) : filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                          <p className="text-muted-foreground">No payment records found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map(record => (
                        <TableRow key={record.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(record.payment_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>{getCardName(record.card_id)}</TableCell>
                          <TableCell className="text-right font-semibold text-status-paid">
                            + ₹{record.amount_paid?.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </TableCell>
                          <TableCell>{record.payment_method}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">{record.reference_number || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PaymentHistory;