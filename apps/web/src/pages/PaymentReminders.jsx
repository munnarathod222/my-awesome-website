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
import { Calendar, AlertTriangle, CheckCircle2, Mail } from 'lucide-react';
import SendMailDialog from '@/components/SendMailDialog.jsx';
import PaymentModal from '@/components/PaymentModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PaymentReminders = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [unpaidFuel, setUnpaidFuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentData, setSelectedPaymentData] = useState(null);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailData, setMailData] = useState({ recipient: '', subject: '', body: '', html: '', label: '' });

  const triggerEmailReminders = () => {
    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const rems = getReminders();
    const rows = rems.map(r => `<tr><td style="padding:7px 0;font-size:12px;color:#1e293b;font-weight:600">${r.card.card_name}</td><td style="padding:7px 0;font-size:12px;color:#64748b">...${r.card.card_number_last4 || ''}</td><td style="padding:7px 0;font-size:12px;color:#6366f1">${r.daysUntil < 0 ? `${Math.abs(r.daysUntil)}d overdue` : r.daysUntil === 0 ? 'TODAY' : `${r.daysUntil} days left`}</td><td style="padding:7px 0;font-weight:700;font-size:12px;color:${r.status==='Overdue'?'#e11d48':r.status==='Due Soon'?'#f59e0b':'#059669'};text-align:right">${fmt(r.outstanding)}</td></tr>`).join('');
    const total = rems.reduce((s, r) => s + r.outstanding, 0);
    const html = `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px"><p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p><h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">Payment Reminders</h2><p style="color:#64748b;font-size:12px;margin:6px 0 0">${rems.length} active reminders</p></div><div style="padding:20px 24px;background:#f8fafc"><div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:16px"><p style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1px;margin:0 0 4px">TOTAL PENDING</p><p style="color:#e11d48;font-size:22px;font-weight:800;margin:0">${fmt(total)}</p></div>${rems.length > 0 ? `<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">CARD</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">LAST4</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">DUE IN</th><th style="text-align:right;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px">AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>` : '<p style="color:#059669;font-weight:700">All payments are up to date!</p>'}</div></div>`;
    setMailData({ recipient: '', subject: 'Payment Reminders – Jai Bhavani Cargo', body: 'Please find the outstanding payment reminders below.', html, label: 'Payment Reminders' });
    setMailOpen(true);
  };
  
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
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Payment Reminders</h1>
              <p className="text-muted-foreground mt-1">Upcoming credit card bills and outstanding balances.</p>
            </div>
            <Button onClick={triggerEmailReminders} variant="outline" className="gap-2 rounded-xl text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
              <Mail className="w-4 h-4" /> Email Reminders
            </Button>
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
      <SendMailDialog
        isOpen={mailOpen}
        onOpenChange={setMailOpen}
        defaultRecipient={mailData.recipient}
        defaultSubject={mailData.subject}
        defaultBody={mailData.body}
        richHtmlContent={mailData.html}
        contextLabel={mailData.label}
      />
    </>
  );
};

export default PaymentReminders;