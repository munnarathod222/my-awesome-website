import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { ExternalLink, Receipt, AlertCircle, CreditCard } from 'lucide-react';

const ViewExpenseModal = ({ isOpen, onClose, expenseId }) => {
  const [expense, setExpense] = useState(null);
  const [creditCard, setCreditCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && expenseId) {
      fetchExpenseDetails();
    } else {
      setExpense(null);
      setCreditCard(null);
    }
  }, [isOpen, expenseId]);

  const fetchExpenseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('expenses').getOne(expenseId, { $autoCancel: false });
      setExpense(record);
      
      // Check for linked credit card
      if (record.credit_card_id) {
        try {
          const cardData = await pb.collection('credit_cards').getOne(record.credit_card_id, { $autoCancel: false });
          setCreditCard(cardData);
        } catch (cardErr) {
          console.error('Error fetching linked credit card:', cardErr);
          setCreditCard(null);
        }
      } else {
        setCreditCard(null);
      }
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Linked expense record could not be found or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="w-5 h-5 text-primary" />
            Expense Details
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/30 rounded-xl border border-border">
              <AlertCircle className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">{error}</p>
            </div>
          ) : expense ? (
            <div className="bg-muted/20 border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground">₹{expense.amount?.toLocaleString()}</p>
                </div>
                <Badge variant={expense.status === 'Approved' ? 'default' : 'secondary'}>
                  {expense.status}
                </Badge>
              </div>
              
              <dl className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium text-foreground mt-1">{format(new Date(expense.date), 'MMMM dd, yyyy')}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground mt-1">{expense.category}</dd>
                </div>
                
                {expense.category === 'Fuel' && expense.liters && (
                  <div>
                    <dt className="text-muted-foreground">Volume (Liters)</dt>
                    <dd className="font-medium text-foreground mt-1">{expense.liters} L</dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-muted-foreground">Payment Method</dt>
                  <dd className="font-medium text-foreground mt-1">{expense.payment_method || '-'}</dd>
                </div>
                
                <div className="col-span-2 bg-background/50 p-3 rounded-lg border border-border">
                  <dt className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-4 h-4" /> Linked Credit Card
                  </dt>
                  <dd className="font-medium text-foreground mt-1">
                    {creditCard 
                      ? `${creditCard.card_name} - ${creditCard.card_number_last4}` 
                      : <span className="text-muted-foreground/80 font-normal">No credit card linked (Cash/Other)</span>
                    }
                  </dd>
                </div>
                
                {expense.truck_id && (
                  <div>
                    <dt className="text-muted-foreground">Truck ID</dt>
                    <dd className="font-medium text-foreground mt-1">{expense.truck_id}</dd>
                  </div>
                )}
                
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="font-medium text-foreground mt-1 break-words bg-background p-3 rounded-lg border border-border mt-1">
                    {expense.description || <span className="text-muted-foreground/60 italic">No description</span>}
                  </dd>
                </div>
              </dl>

              {/* Document attachments preview in View mode */}
              {expense.documents && expense.documents.length > 0 && (
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attached Documents ({expense.documents.length})</p>
                  <div className="grid grid-cols-1 gap-2">
                    {expense.documents.map((doc, idx) => {
                      const fileUrl = pb.files.getUrl(expense, doc);
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 border border-border rounded-lg bg-background hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="flex-shrink-0 w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                              {isImage ? (
                                <img src={fileUrl} alt={doc} className="w-full h-full object-cover" />
                              ) : (
                                <Receipt className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-xs font-medium truncate text-foreground flex-1" title={doc}>
                              {doc}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-3 h-8 text-primary" asChild>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                            </a>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {expense && (
            <Button variant="secondary" onClick={() => window.location.href='/expenses'} className="gap-2">
              <ExternalLink className="w-4 h-4" /> Go to Full Ledger
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExpenseModal;