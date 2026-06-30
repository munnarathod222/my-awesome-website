import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, differenceInDays, isPast, isToday, addDays } from 'date-fns';
import { Clock, CheckCircle2, MoreVertical, Trash2, FileText, CreditCard, ExternalLink, Moon, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const ReminderCard = ({ reminder, onViewDetails, onRefresh, onRecharge }) => {
  const navigate = useNavigate();
  
  const dueDate = new Date(reminder.reminder_date);
  const daysLeft = differenceInDays(dueDate, new Date());
  
  const handleSnooze = async (days) => {
    try {
      const newDate = addDays(new Date(), days);
      await pb.collection('reminders').update(reminder.id, {
        status: 'Snoozed',
        snooze_until_date: newDate.toISOString()
      }, { $autoCancel: false });
      toast.success(`Reminder snoozed for ${days} days`);
      onRefresh();
    } catch (e) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleMarkComplete = async (e) => {
    e.stopPropagation();
    try {
      await pb.collection('reminders').update(reminder.id, {
        status: 'Completed',
        is_completed: true
      }, { $autoCancel: false });
      
      // Auto-settle payment record creation if credit card payment reminder
      if (reminder.reminder_type === 'Credit Card Payment' && reminder.linked_card_id) {
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
      } else {
        toast.success('Reminder marked as completed');
      }
      onRefresh();
    } catch (err) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await pb.collection('reminders').delete(reminder.id, { $autoCancel: false });
      toast.success('Reminder deleted');
      onRefresh();
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  let timeIndicator = '';
  let timeColor = 'text-muted-foreground';
  
  if (reminder.status === 'Completed') {
    timeIndicator = 'Completed';
    timeColor = 'text-emerald-500';
  } else if (reminder.status === 'Snoozed') {
    timeIndicator = `Snoozed until ${format(new Date(reminder.snooze_until_date), 'MMM dd')}`;
    timeColor = 'text-blue-500';
  } else if (isPast(dueDate) && !isToday(dueDate)) {
    timeIndicator = `Overdue by ${Math.abs(daysLeft)} days`;
    timeColor = 'text-destructive font-semibold';
  } else if (isToday(dueDate)) {
    timeIndicator = 'Due Today';
    timeColor = 'text-orange-500 font-semibold';
  } else {
    timeIndicator = `In ${daysLeft} days`;
  }

  // Parse notes JSON if applicable
  let maintDetails = null;
  let fastagDetails = null;

  if (reminder.notes) {
    try {
      if (reminder.reminder_type === 'Kilometric Maintenance') {
        maintDetails = JSON.parse(reminder.notes);
      } else if (reminder.reminder_type === 'FASTag Low-Balance') {
        fastagDetails = JSON.parse(reminder.notes);
      }
    } catch (e) {
      // Ignored if not JSON
    }
  }

  const truckNumber = reminder.expand?.truck_id?.truck_number || '';
  const truckName = reminder.expand?.truck_id?.truck_name || '';

  // Dynamic color-coded left border based on priority/due state
  let borderColorClass = "border-l-slate-700";
  if (reminder.status !== 'Completed') {
    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const isLowBalanceCritical = reminder.reminder_type === 'FASTag Low-Balance' && (fastagDetails?.balance < 1000);
    const isMaintenanceOverdue = reminder.reminder_type === 'Kilometric Maintenance' && (maintDetails?.kms_remaining < 0);

    if (isOverdue || isLowBalanceCritical || isMaintenanceOverdue || reminder.priority === 'High' && daysLeft < 0) {
      borderColorClass = "border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    } else if (daysLeft >= 0 && daysLeft < 7 || reminder.priority === 'High' || reminder.priority === 'Medium') {
      borderColorClass = "border-l-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
    } else {
      borderColorClass = "border-l-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
    }
  } else {
    borderColorClass = "border-l-emerald-500/50";
  }

  // Render category-specific card contents
  const renderCardBody = () => {
    switch (reminder.reminder_type) {
      case 'Truck Doc Expiry':
        return (
          <div className="space-y-3 my-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary/70" />
              Document: <span className="font-bold">{reminder.title.split(' Expiring:')[0]}</span>
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/30">
              <div>
                <p>Expiry Date</p>
                <p className="font-semibold text-foreground mt-0.5">{format(dueDate, 'MMM dd, yyyy')}</p>
              </div>
              <Badge variant={daysLeft <= 30 ? 'destructive' : 'warning'} className="px-2 py-0.5 rounded text-[10px] font-bold border-0">
                {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
              </Badge>
            </div>
            {truckName && (
              <p className="text-[11px] text-muted-foreground truncate">
                Vehicle: <span className="font-medium text-foreground">{truckName}</span>
              </p>
            )}
          </div>
        );

      case 'Kilometric Maintenance':
        if (!maintDetails) return <p className="text-sm text-muted-foreground my-3">{reminder.description}</p>;
        const kmsDriven = maintDetails.liveOdometer - maintDetails.last_serviced_odometer;
        const percent = Math.min(100, Math.max(0, (kmsDriven / maintDetails.target_interval_kms) * 100));
        const isMaintOverdue = maintDetails.kms_remaining < 0;

        return (
          <div className="space-y-3.5 my-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-primary/70" />
              Component: <span className="font-bold">{maintDetails.component_name}</span>
            </p>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Odometer: {maintDetails.liveOdometer.toLocaleString()} KMs</span>
                <span className={isMaintOverdue ? "text-destructive font-bold" : "text-muted-foreground"}>
                  {isMaintOverdue ? `${Math.abs(maintDetails.kms_remaining).toLocaleString()} KMs overdue` : `${maintDetails.kms_remaining.toLocaleString()} KMs left`}
                </span>
              </div>
              <Progress value={percent} className={`h-2 ${isMaintOverdue ? 'bg-destructive/15' : 'bg-primary/10'}`} />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>Last service: {maintDetails.last_serviced_odometer.toLocaleString()} KMs</span>
                <span>Wear: {percent.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        );

      case 'FASTag Low-Balance':
        if (!fastagDetails) return <p className="text-sm text-muted-foreground my-3">{reminder.description}</p>;
        const balance = fastagDetails.balance;
        const projected = fastagDetails.projectedCost;
        const isCritical = balance < 1000;

        return (
          <div className="space-y-3 my-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-destructive' : 'text-amber-500'}`} />
              FASTag balance: <span className={`font-extrabold ${isCritical ? 'text-destructive' : 'text-foreground'}`}>₹{balance.toLocaleString()}</span>
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/30">
              <div>
                <p>Projected 48h Toll</p>
                <p className="font-semibold text-foreground mt-0.5">₹{projected.toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-destructive border-destructive/20 bg-destructive/10">
                Refill Required
              </Badge>
            </div>
          </div>
        );

      default:
        // Fallback for Manual or Credit Card
        return (
          <p className="text-sm text-muted-foreground line-clamp-2 my-4 h-10">
            {reminder.description || "No additional details provided."}
          </p>
        );
    }
  };

  // Render card footer actions
  const renderCardActions = () => {
    if (reminder.status === 'Completed') return null;

    switch (reminder.reminder_type) {
      case 'Truck Doc Expiry':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/truck-docs?truckId=${reminder.truck_id}`);
            }}
          >
            Upload New Document <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        );

      case 'Kilometric Maintenance':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fleet-maintenance?truckId=${reminder.truck_id}`);
            }}
          >
            Open Service Log <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        );

      case 'FASTag Low-Balance':
        return (
          <Button 
            variant="default" 
            size="sm" 
            className="h-7 text-xs font-bold px-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm hover:scale-[1.02] transition-transform duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (onRecharge && reminder.expand?.truck_id) {
                onRecharge(reminder.expand.truck_id);
              } else {
                navigate('/truck-manager');
              }
            }}
          >
            Recharge Wallet via UPI/Card
          </Button>
        );

      default:
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs font-semibold px-2 ml-1 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(reminder);
            }}
          >
            View Details <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        );
    }
  };

  return (
    <Card 
      className={`border-l-4 ${borderColorClass} hover:shadow-md transition-all duration-200 cursor-pointer bg-card group`}
      onClick={() => onViewDetails(reminder)}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 flex-1 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold">
                  {reminder.reminder_type}
                </Badge>
                {reminder.status === 'Completed' && (
                  <Badge variant="secondary" className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border-0">
                    Completed
                  </Badge>
                )}
              </div>
              <h3 className="font-heading font-extrabold text-base leading-snug group-hover:text-primary transition-colors truncate">
                {reminder.title}
              </h3>
            </div>
            
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border border-border">
                  {reminder.status !== 'Completed' && (
                    <>
                      <DropdownMenuItem onClick={handleMarkComplete}>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(1)}>
                        <Moon className="w-4 h-4 mr-2" /> Snooze 1 day
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(3)}>
                        <Moon className="w-4 h-4 mr-2" /> Snooze 3 days
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(7)}>
                        <Moon className="w-4 h-4 mr-2" /> Snooze 1 week
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Body content */}
          {renderCardBody()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
          <div className={`flex items-center text-xs ${timeColor}`}>
            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span className="truncate max-w-[100px]">{timeIndicator}</span>
            <span className="text-muted-foreground ml-1.5 shrink-0">({format(dueDate, 'MMM dd')})</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {reminder.linked_document_id && <FileText className="w-3.5 h-3.5 text-muted-foreground opacity-50" title="Has linked document" />}
            {reminder.linked_card_id && <CreditCard className="w-3.5 h-3.5 text-muted-foreground opacity-50" title="Has linked card" />}
            {renderCardActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;