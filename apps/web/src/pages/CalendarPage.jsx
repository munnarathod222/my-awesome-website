import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, Truck, 
  IndianRupee, Plus, Info, Eye, Clock, AlertTriangle, ShieldCheck, Check, Sparkles, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, 
  addMonths, subMonths, parseISO 
} from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AddReminderModal from '@/components/AddReminderModal.jsx';
import ReminderDetailsModal from '@/components/ReminderDetailsModal.jsx';

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data State
  const [trips, setTrips] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [showTrips, setShowTrips] = useState(true);
  const [showReminders, setShowReminders] = useState(true);
  const [showBills, setShowBills] = useState(true);

  // Modals & Details Panel State
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

  // Month intervals
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const fetchData = async () => {
    setLoading(true);
    try {
      const startIso = monthStart.toISOString().split('T')[0];
      const endIso = monthEnd.toISOString().split('T')[0];

      // 1. Query Trips for the month
      const tripsRes = await pb.collection('trip_logs').getFullList({
        filter: `date >= "${startIso} 00:00:00" && date <= "${endIso} 23:59:59"`,
        sort: 'date',
        $autoCancel: false
      });

      // 2. Query Reminders for the month
      const remindersRes = await pb.collection('reminders').getFullList({
        filter: `reminder_date >= "${startIso} 00:00:00" && reminder_date <= "${endIso} 23:59:59"`,
        expand: 'truck_id',
        $autoCancel: false
      });

      // 3. Query Credit Card bill payment due dates
      let billsList = [];
      try {
        const cardDues = await pb.collection('payment_due_dates').getFullList({
          filter: `due_date >= "${startIso}" && due_date <= "${endIso}"`,
          expand: 'card_id',
          $autoCancel: false
        });
        billsList = cardDues
          .filter(due => (due.full_payment_amount || 0) > 0)
          .map(due => ({
            id: due.id,
            title: `CC Statement Due: ${due.expand?.card_id?.card_name || 'Credit Card'}`,
            amount: due.full_payment_amount || due.minimum_amount_due || 0,
            date: parseISO(due.due_date),
            type: 'Credit Card Dues',
            status: due.status || 'Unpaid',
            cardId: due.card_id
          }));
      } catch (err) {
        console.warn('Could not load card due dates:', err.message);
      }

      setTrips(tripsRes);
      setReminders(remindersRes);
      setBillPayments(billsList);
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
      toast.error('Could not load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Aggregate events for a specific day
  const getDayEvents = (day) => {
    const dayTrips = showTrips 
      ? trips.filter(t => t.date && isSameDay(new Date(t.date.replace(' ', 'T')), day)) 
      : [];

    const dayReminders = showReminders 
      ? reminders.filter(r => r.reminder_date && isSameDay(new Date(r.reminder_date), day)) 
      : [];

    const dayBills = showBills 
      ? billPayments.filter(b => b.date && isSameDay(b.date, day)) 
      : [];

    return { trips: dayTrips, reminders: dayReminders, bills: dayBills };
  };

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsDayDetailOpen(true);
  };

  const handleCompleteReminder = async (id) => {
    try {
      await pb.collection('reminders').update(id, {
        status: 'Completed',
        is_completed: true
      }, { $autoCancel: false });
      toast.success('Reminder marked as completed');
      fetchData();
    } catch (e) {
      toast.error('Failed to complete reminder');
    }
  };

  const selectedDateEvents = getDayEvents(selectedDate);
  const totalEventsToday = selectedDateEvents.trips.length + selectedDateEvents.reminders.length + selectedDateEvents.bills.length;

  return (
    <div className="min-h-screen w-full bg-background/50 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Helmet>
        <title>Compliance & Operations Calendar | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">Scheduling Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Compliance & Operations Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Month-at-a-glance view for dispatches, document renewals, and credit statements.</p>
        </div>

        <Button onClick={() => setIsAddReminderOpen(true)} className="rounded-xl text-xs gap-1.5 shadow-sm self-start md:self-center">
          <Plus className="w-4 h-4" /> Add Reminder
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card/45 backdrop-blur-md border border-border/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="rounded-xl border-border/50">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-foreground min-w-[130px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="rounded-xl border-border/50">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs text-muted-foreground hover:text-foreground rounded-xl">
            Today
          </Button>
        </div>

        {/* Dynamic Display Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Toggle Views:
          </span>
          <Button 
            size="sm" 
            variant={showTrips ? 'default' : 'outline'}
            onClick={() => setShowTrips(!showTrips)}
            className="rounded-xl text-[11px] h-8 gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" /> Trips ({trips.length})
          </Button>
          <Button 
            size="sm" 
            variant={showReminders ? 'default' : 'outline'}
            onClick={() => setShowReminders(!showReminders)}
            className="rounded-xl text-[11px] h-8 gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" /> Reminders ({reminders.length})
          </Button>
          <Button 
            size="sm" 
            variant={showBills ? 'default' : 'outline'}
            onClick={() => setShowBills(!showBills)}
            className="rounded-xl text-[11px] h-8 gap-1.5"
          >
            <IndianRupee className="w-3.5 h-3.5" /> CC Bills ({billPayments.length})
          </Button>
        </div>
      </div>

      {/* Main Grid Calendar Container */}
      <Card className="border-border/40 bg-card overflow-hidden rounded-3xl shadow-xl">
        <CardContent className="p-0">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-border/30 bg-muted/20 text-center font-bold text-xs py-3 text-muted-foreground uppercase tracking-widest">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Blocks */}
          <div className="grid grid-cols-7 bg-border/10 gap-[1px]">
            {loading ? (
              Array.from({ length: 35 }).map((_, idx) => (
                <div key={idx} className="h-28 bg-card/60 p-2 flex flex-col justify-between">
                  <div className="w-6 h-6 rounded-md bg-muted/40 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              days.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dayEvents = getDayEvents(day);
                const totalEvents = dayEvents.trips.length + dayEvents.reminders.length + dayEvents.bills.length;

                return (
                  <div 
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[110px] bg-card p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative hover:bg-muted/10 ${
                      !isCurrentMonth ? 'opacity-40 bg-muted/5' : ''
                    } ${isToday(day) ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                  >
                    {/* Header info (number) */}
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                        isToday(day) ? 'bg-primary text-primary-foreground font-black' : 'text-muted-foreground'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {totalEvents > 0 && (
                        <Badge variant="secondary" className="text-[9px] h-5 px-1.5 font-bold min-w-5 justify-center">
                          {totalEvents}
                        </Badge>
                      )}
                    </div>

                    {/* Desktop view event pills (Hidden on mobile) */}
                    <div className="hidden md:block space-y-1 mt-2 flex-grow overflow-y-hidden max-h-[70px]">
                      {dayEvents.trips.slice(0, 2).map(t => (
                        <div key={t.id} className="text-[9px] truncate px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-medium flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5 shrink-0" />
                          <span>{t.route}</span>
                        </div>
                      ))}
                      {dayEvents.reminders.slice(0, 2).map(r => (
                        <div key={r.id} className="text-[9px] truncate px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10 font-medium flex items-center gap-1">
                          <Bell className="w-2.5 h-2.5 shrink-0" />
                          <span>{r.title}</span>
                        </div>
                      ))}
                      {dayEvents.bills.slice(0, 2).map(b => (
                        <div key={b.id} className="text-[9px] truncate px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-medium flex items-center gap-1">
                          <IndianRupee className="w-2.5 h-2.5 shrink-0" />
                          <span>₹{b.amount.toLocaleString()} CC Dues</span>
                        </div>
                      ))}
                      {totalEvents > 6 && (
                        <div className="text-[8px] text-center text-muted-foreground font-semibold">
                          +{totalEvents - 6} more
                        </div>
                      )}
                    </div>

                    {/* Mobile view dot indicators (Hidden on desktop) */}
                    <div className="flex md:hidden flex-wrap gap-1 justify-center mt-1.5">
                      {dayEvents.trips.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                      {dayEvents.reminders.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {dayEvents.bills.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
        <DialogContent className="rounded-2xl max-w-lg bg-card border border-border">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="font-heading text-lg">
              Events for {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Check dispatches, payments, and compliance items scheduled for today.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[380px] overflow-y-auto">
            {totalEventsToday === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="text-xs font-semibold text-foreground">No events scheduled today.</p>
                <p className="text-[10px] mt-0.5">Click "Add Reminder" to add an alert to this day.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Trips */}
                {selectedDateEvents.trips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Dispatched shipments ({selectedDateEvents.trips.length})
                    </h4>
                    {selectedDateEvents.trips.map(trip => (
                      <div key={trip.id} className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">{trip.route}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Vehicle: {trip.truck_number} · Driver: {trip.driver_name || 'N/A'}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold uppercase">
                          {trip.trip_status || 'Dispatched'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reminders */}
                {selectedDateEvents.reminders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" /> Compliance alerts ({selectedDateEvents.reminders.length})
                    </h4>
                    {selectedDateEvents.reminders.map(rem => (
                      <div key={rem.id} className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-foreground">{rem.title}</p>
                            {rem.status === 'Completed' && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 h-4 text-[8px] font-bold">Completed</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal">{rem.description}</p>
                        </div>
                        
                        {rem.status !== 'Completed' ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setIsDayDetailOpen(false);
                                setSelectedReminder(rem);
                              }}
                              className="h-7 px-2 text-[10px] rounded-lg"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteReminder(rem.id)}
                              className="h-7 px-2 text-[10px] rounded-lg gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            >
                              <Check className="w-3 h-3" /> Resolve
                            </Button>
                          </div>
                        ) : (
                          <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* CC Bills */}
                {selectedDateEvents.bills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5" /> Credit statements due ({selectedDateEvents.bills.length})
                    </h4>
                    {selectedDateEvents.bills.map(bill => (
                      <div key={bill.id} className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">{bill.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Amount Due: <strong className="text-rose-500">₹{bill.amount.toLocaleString()}</strong></p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          bill.status === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/30">
            <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setIsDayDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Reminder Modal */}
      <AddReminderModal 
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        onSuccess={() => {
          setIsAddReminderOpen(false);
          fetchData();
        }}
      />

      {/* Reminder Details Modal */}
      <ReminderDetailsModal
        isOpen={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        reminder={selectedReminder}
        onRefresh={fetchData}
      />
    </div>
  );
}
