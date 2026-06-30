import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format, differenceInDays, setDate, isPast, isToday, addMonths } from 'date-fns';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentReminders = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [unpaidFuel, setUnpaidFuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentData, setSelectedPaymentData] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsData, unpaidData] = await Promise.all([
        pb.collection('credit_cards').getFullList({ 
          filter: `user_id = "${currentUser.id}" && status = "Active"`,
          $autoCancel: false 
        }),
        pb.collection('fuel_payments').getFullList({
          filter: `user_id = "${currentUser.id}" && payment_status = "Pending"`,
          $autoCancel: false
        })
      ]);
      setCards(cardsData);
      setUnpaidFuel(unpaidData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  // Group unpaid fuel payments by card
  const getCardOutstanding = (cardId) => {
    return unpaidFuel
      .filter(p => p.card_id === cardId)
      .reduce((sum, p) => sum + (p.fuel_amount || 0) + (p.surcharge_amount || 0), 0);
  };

  // Calculate next due date based on billing cycle end
  const calculateNextDueDate = (billingEndDay) => {
    const today = new Date();
    // Assuming payment is due 15-20 days after billing cycle ends (simplifying to endDay + 20)
    let nextDue = setDate(today, billingEndDay);
    
    // If cycle ended this month already, the due date is likely next month
    if (isPast(nextDue) && !isToday(nextDue)) {
       nextDue = addMonths(nextDue, 1);
    }
    
    // Add grace period to billing end to get due date (example: +20 days)
    const dueDate = new Date(nextDue);
    dueDate.setDate(dueDate.getDate() + 20);
    
    return dueDate;
  };

  const getReminders = () => {
    return cards.map(card => {
      const outstanding = getCardOutstanding(card.id);
      if (outstanding === 0) return null; // Only show if there's money owed

      const dueDate = calculateNextDueDate(card.billing_cycle_end);
      const daysUntil = differenceInDays(dueDate, new Date());
      
      let status = 'On Time';
      if (daysUntil < 0) status = 'Overdue';
      else if (daysUntil <= 7) status = 'Due Soon';

      return {
        card,
        outstanding,
        dueDate,
        daysUntil,
        status
      };
    }).filter(Boolean).sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const reminders = getReminders();
  const totalDue = reminders.reduce((sum, r) => sum + r.outstanding, 0);
  const overdueCount = reminders.filter(r => r.status === 'Overdue').length;

  const handlePayNow = (cardId, amount) => {
    setSelectedPaymentData({ cardId, amount });
    setPaymentModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'On Time': return <Badge className="bg-status-paid/10 text-status-paid border-status-paid/20">On Time</Badge>;
      case 'Due Soon': return <Badge className="bg-status-soon/10 text-status-soon border-status-soon/20">Due Soon</Badge>;
      case 'Overdue': return <Badge className="bg-status-overdue/10 text-status-overdue border-status-overdue/20">Overdue</Badge>;
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Reminders - Jai Bhavani Fuel</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Payment Reminders</h1>
            <p className="text-muted-foreground mt-1">Upcoming credit card bills and outstanding balances.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <h3 className="text-2xl font-bold">₹{totalDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-status-overdue/10 flex items-center justify-center text-status-overdue">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Payments</p>
                  <h3 className="text-2xl font-bold">{overdueCount}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-status-paid/10 flex items-center justify-center text-status-paid">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cards Up to Date</p>
                  <h3 className="text-2xl font-bold">{cards.length - reminders.length}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>Action Required</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Card Name</TableHead>
                      <TableHead>Est. Due Date</TableHead>
                      <TableHead>Time Left</TableHead>
                      <TableHead className="text-right">Amount Due</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Calculating reminders...</TableCell></TableRow>
                    ) : reminders.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">All payments are up to date. Excellent work!</TableCell></TableRow>
                    ) : (
                      reminders.map((reminder, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {reminder.card.card_name}
                            <span className="block text-xs text-muted-foreground">..{reminder.card.card_number_last4}</span>
                          </TableCell>
                          <TableCell>{format(reminder.dueDate, 'dd MMM yyyy')}</TableCell>
                          <TableCell>
                            {reminder.daysUntil < 0 ? `${Math.abs(reminder.daysUntil)} days ago` : 
                             reminder.daysUntil === 0 ? 'Today' : `${reminder.daysUntil} days`}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{reminder.outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(reminder.status)}</TableCell>
                          <TableCell className="text-right pr-4">
                            <Button size="sm" onClick={() => handlePayNow(reminder.card.id, reminder.outstanding)}>
                              Record Payment
                            </Button>
                          </TableCell>
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

      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        cards={cards}
        defaultCardId={selectedPaymentData?.cardId}
        defaultAmount={selectedPaymentData?.amount}
        onSuccess={fetchData}
      />
    </>
  );
};

export default PaymentReminders;