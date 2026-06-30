import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, Tag, Info, AlignLeft, CreditCard, FileText, CheckCircle2, Trash2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

import PaymentRecordModal from '@/components/PaymentRecordModal.jsx';

const ReminderDetailsModal = ({ isOpen, onClose, reminder, onRefresh }) => {
  const navigate = useNavigate();
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linkedDoc, setLinkedDoc] = useState(null);
  const [linkedTruck, setLinkedTruck] = useState(null);
  const [linkedCard, setLinkedCard] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && reminder) {
      fetchLinkedData();
    } else {
      setLinkedDoc(null);
      setLinkedTruck(null);
      setLinkedCard(null);
    }
  }, [isOpen, reminder]);

  const fetchLinkedData = async () => {
    setLoadingLinks(true);
    try {
      if (reminder.linked_document_id) {
        const doc = await pb.collection('truck_documents').getOne(reminder.linked_document_id, { $autoCancel: false });
        setLinkedDoc(doc);
        if (doc.truck_id) {
          try {
            const truck = await pb.collection('trucks').getOne(doc.truck_id, { $autoCancel: false });
            setLinkedTruck(truck);
          } catch (tErr) {
            console.error('Failed to fetch truck details for doc:', tErr);
          }
        }
      }
      if (reminder.linked_card_id) {
        const card = await pb.collection('credit_cards').getOne(reminder.linked_card_id, { $autoCancel: false });
        setLinkedCard(card);
      }
    } catch (e) {
      console.error('Failed to fetch linked data:', e);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await pb.collection('reminders').delete(reminder.id, { $autoCancel: false });
      toast.success('Reminder deleted');
      onRefresh();
      onClose();
    } catch (e) {
      toast.error('Failed to delete reminder');
    }
  };

  const handleMarkComplete = async () => {
    try {
      await pb.collection('reminders').update(reminder.id, { 
        status: 'Completed',
        is_completed: true 
      }, { $autoCancel: false });

      // Record a matching transaction in payment_records if this is a credit card alert with a linked card
      if (reminder.linked_card_id) {
        try {
          const dueDateRecord = await pb.collection('payment_due_dates').getFirstListItem(
            `card_id="${reminder.linked_card_id}"`,
            { $autoCancel: false }
          );
          
          if (dueDateRecord && dueDateRecord.full_payment_amount > 0) {
            await pb.collection('payment_records').create({
              card_id: reminder.linked_card_id,
              amount_paid: dueDateRecord.full_payment_amount,
              payment_date: new Date().toISOString(),
              payment_method: 'Bank Transfer',
              reference_number: 'Auto-settled via Reminder',
              user_id: reminder.user_id || pb.authStore.model?.id || ''
            }, { $autoCancel: false });
            
            toast.success(`Automatically recorded statement payment of ₹${dueDateRecord.full_payment_amount.toLocaleString('en-IN')}`);
          }
        } catch (cardErr) {
          console.log('No payment due date record found to auto-settle:', cardErr.message);
        }
      }

      toast.success('Reminder marked as completed');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  if (!reminder) return null;

  const truckNumber = reminder.expand?.truck_id?.truck_number || linkedTruck?.truck_number || '';
  const truckName = reminder.expand?.truck_id?.truck_name || linkedTruck?.truck_name || '';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{reminder.title}</DialogTitle>
            <DialogDescription>
              Details and actions for this reminder.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className={`
                ${reminder.priority === 'High' ? 'bg-priority-high-light text-red-500' : ''}
                ${reminder.priority === 'Medium' ? 'bg-priority-medium-light text-amber-500' : ''}
                ${reminder.priority === 'Low' ? 'bg-priority-low-light text-blue-500' : ''}
              `}>
                {reminder.priority} Priority
              </Badge>
              <Badge variant="secondary">{reminder.reminder_type}</Badge>
              <Badge variant={reminder.status === 'Completed' ? 'default' : 'outline'}>{reminder.status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-border">
              <div>
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Due Date</span>
                <span className="font-medium">{format(new Date(reminder.reminder_date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1"><Info className="w-3.5 h-3.5" /> Snoozed Until</span>
                <span className="font-medium">{reminder.snooze_until_date ? format(new Date(reminder.snooze_until_date), 'MMM dd, yyyy') : 'Not snoozed'}</span>
              </div>
            </div>

            {/* Expanded Truck Details to eliminate raw IDs */}
            {truckNumber && (
              <div className="grid grid-cols-2 gap-4 text-sm bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1"><Truck className="w-3.5 h-3.5 text-primary" /> Linked Truck</span>
                  <span className="font-bold text-foreground font-mono">{truckNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1"><Tag className="w-3.5 h-3.5 text-primary" /> Vehicle Nickname</span>
                  <span className="font-medium text-foreground">{truckName || 'Unnamed Vehicle'}</span>
                </div>
              </div>
            )}

            {reminder.description && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground"><AlignLeft className="w-4 h-4" /> Description</span>
                <p className="text-sm text-foreground bg-background p-3 rounded-lg border border-border">{reminder.description}</p>
              </div>
            )}

            {reminder.notes && !reminder.notes.startsWith('{') && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground"><Tag className="w-4 h-4" /> Notes</span>
                <p className="text-sm text-foreground bg-background p-3 rounded-lg border border-border whitespace-pre-wrap">{reminder.notes}</p>
              </div>
            )}

            {/* Linked Data Section */}
            {(reminder.linked_document_id || reminder.linked_card_id) && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-3">Linked Assets</h4>
                
                {loadingLinks ? (
                  <Skeleton className="h-16 w-full rounded-lg" />
                ) : (
                  <div className="space-y-3">
                    {linkedDoc && (
                      <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 text-primary rounded-md"><FileText className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-medium">{linkedDoc.document_type} - {truckNumber || linkedDoc.truck_id}</p>
                            <p className="text-xs text-muted-foreground">Expires: {format(new Date(linkedDoc.expiry_date), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleNavigate(`/truck-docs?truckId=${linkedDoc.truck_id}`)}>View Documents</Button>
                      </div>
                    )}
                    
                    {linkedCard && (
                      <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 text-primary rounded-md"><CreditCard className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-medium">{linkedCard.card_name}</p>
                            <p className="text-xs text-muted-foreground">Ending in {linkedCard.card_number_last4}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleNavigate('/credit-cards')}>View Card</Button>
                          <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>Record Payment</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full pt-2">
            <div className="flex gap-2">
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Close</Button>
              {reminder.status !== 'Completed' && (
                <Button type="button" onClick={handleMarkComplete} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mark Complete
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embedded Payment Record Modal for quick action */}
      {isPaymentModalOpen && linkedCard && (
        <PaymentRecordModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          card={linkedCard} 
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            handleMarkComplete(); // Automatically mark complete after payment
          }} 
        />
      )}
    </>
  );
};

export default ReminderDetailsModal;