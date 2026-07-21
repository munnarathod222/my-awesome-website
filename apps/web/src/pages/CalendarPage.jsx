import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, Truck, 
  IndianRupee, Plus, Info, Eye, Clock, AlertTriangle, ShieldCheck, Check, Sparkles, Filter,
  ListFilter, LayoutGrid, Search, CalendarDays, ArrowRight, Building2, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, 
  addMonths, subMonths, parseISO, setMonth, setYear 
} from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AddReminderModal from '@/components/AddReminderModal.jsx';
import ReminderDetailsModal from '@/components/ReminderDetailsModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data State
  const [trips, setTrips] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // View & Filter State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrips, setShowTrips] = useState(true);
  const [showReminders, setShowReminders] = useState(true);
  const [showBills, setShowBills] = useState(true);

  // Modals & Details State
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
      }).catch(() => []);

      // 2. Query Reminders for the month
      const remindersRes = await pb.collection('reminders').getFullList({
        filter: `reminder_date >= "${startIso} 00:00:00" && reminder_date <= "${endIso} 23:59:59"`,
        expand: 'truck_id',
        $autoCancel: false
      }).catch(() => []);

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
    const q = searchQuery.toLowerCase().trim();

    const dayTrips = showTrips 
      ? trips.filter(t => {
          if (!t.date || !isSameDay(new Date(t.date.replace(' ', 'T')), day)) return false;
          if (!q) return true;
          return (t.route || '').toLowerCase().includes(q) || 
                 (t.truck_number || '').toLowerCase().includes(q) || 
                 (t.driver_name || '').toLowerCase().includes(q);
        })
      : [];

    const dayReminders = showReminders 
      ? reminders.filter(r => {
          if (!r.reminder_date || !isSameDay(new Date(r.reminder_date), day)) return false;
          if (!q) return true;
          return (r.title || '').toLowerCase().includes(q) || 
                 (r.description || '').toLowerCase().includes(q);
        })
      : [];

    const dayBills = showBills 
      ? billPayments.filter(b => {
          if (!b.date || !isSameDay(b.date, day)) return false;
          if (!q) return true;
          return (b.title || '').toLowerCase().includes(q);
        })
      : [];

    return { trips: dayTrips, reminders: dayReminders, bills: dayBills };
  };

  // Month Agenda List calculation
  const monthAgendaItems = useMemo(() => {
    const items = [];
    const q = searchQuery.toLowerCase().trim();

    if (showTrips) {
      trips.forEach(t => {
        if (!t.date) return;
        const d = new Date(t.date.replace(' ', 'T'));
        if (q && !(t.route || '').toLowerCase().includes(q) && !(t.truck_number || '').toLowerCase().includes(q) && !(t.driver_name || '').toLowerCase().includes(q)) return;
        items.push({ id: t.id, date: d, type: 'trip', title: t.route || 'Dispatched Shipment', sub: `Truck: ${t.truck_number || 'N/A'} · Driver: ${t.driver_name || 'N/A'}`, status: t.trip_status || 'Dispatched', raw: t });
      });
    }

    if (showReminders) {
      reminders.forEach(r => {
        if (!r.reminder_date) return;
        const d = new Date(r.reminder_date);
        if (q && !(r.title || '').toLowerCase().includes(q) && !(r.description || '').toLowerCase().includes(q)) return;
        items.push({ id: r.id, date: d, type: 'reminder', title: r.title, sub: r.description, status: r.status || 'Pending', raw: r });
      });
    }

    if (showBills) {
      billPayments.forEach(b => {
        if (!b.date) return;
        if (q && !(b.title || '').toLowerCase().includes(q)) return;
        items.push({ id: b.id, date: b.date, type: 'bill', title: b.title, sub: `Amount Due: ₹${b.amount?.toLocaleString()}`, status: b.status || 'Unpaid', raw: b });
      });
    }

    return items.sort((a, b) => a.date - b.date);
  }, [trips, reminders, billPayments, showTrips, showReminders, showBills, searchQuery]);

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleMonthChange = (monthIdxStr) => {
    setCurrentDate(setMonth(currentDate, parseInt(monthIdxStr, 10)));
  };

  const handleYearChange = (yearStr) => {
    setCurrentDate(setYear(currentDate, parseInt(yearStr, 10)));
  };

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

  const totalMonthDues = useMemo(() => billPayments.reduce((sum, b) => sum + (b.amount || 0), 0), [billPayments]);
  const pendingRemindersCount = useMemo(() => reminders.filter(r => r.status !== 'Completed').length, [reminders]);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearsList = [2025, 2026, 2027, 2028];

  return (
    <div className="min-h-screen w-full bg-background/50 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <Helmet>
        <title>Compliance & Operations Calendar | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">Operations & Compliance Scheduling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading">
            Calendar & Fleet Agenda
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track daily trip dispatches, vehicle fitness & insurance renewals, and financial due dates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <Button 
            onClick={() => setIsAddReminderOpen(true)} 
            className="rounded-xl text-xs gap-1.5 shadow-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" /> Add Reminder
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-emerald-500/25 bg-emerald-500/5 p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Scheduled Dispatches</span>
              <div className="text-2xl font-black text-foreground mt-0.5">{trips.length} Trips</div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-amber-500/25 bg-amber-500/5 p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Compliance Reminders</span>
              <div className="text-2xl font-black text-foreground mt-0.5">{pendingRemindersCount} Pending</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-indigo-500/25 bg-indigo-500/5 p-4 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">Financial Due Dates</span>
              <div className="text-2xl font-black text-foreground mt-0.5">₹{totalMonthDues.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card border border-border/40 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Navigation & Direct Month Jump */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-36 h-9 rounded-xl text-xs font-bold bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthsList.map((m, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24 h-9 rounded-xl text-xs font-bold bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearsList.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToday} 
              className={`rounded-xl text-xs h-9 px-3 font-bold ${isToday(currentDate) ? 'border-primary text-primary' : ''}`}
            >
              Today
            </Button>
          </div>

          {/* View Switcher (Grid vs Agenda) & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 md:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search events, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background border-border/40"
              />
            </div>

            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'agenda' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> Agenda List
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
          <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Show:
          </span>
          <Button 
            size="sm" 
            variant={showTrips ? 'default' : 'outline'}
            onClick={() => setShowTrips(!showTrips)}
            className={`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${showTrips ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            <Truck className="w-3 h-3" /> Trips ({trips.length})
          </Button>
          <Button 
            size="sm" 
            variant={showReminders ? 'default' : 'outline'}
            onClick={() => setShowReminders(!showReminders)}
            className={`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${showReminders ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
          >
            <Bell className="w-3 h-3" /> Reminders ({reminders.length})
          </Button>
          <Button 
            size="sm" 
            variant={showBills ? 'default' : 'outline'}
            onClick={() => setShowBills(!showBills)}
            className={`rounded-xl text-xs h-7 px-3 gap-1.5 font-bold ${showBills ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
          >
            <IndianRupee className="w-3 h-3" /> CC Dues ({billPayments.length})
          </Button>
        </div>
      </div>

      {/* Main View Area (Grid or Agenda) */}
      {viewMode === 'grid' ? (
        <Card className="border-border/40 bg-card overflow-hidden rounded-3xl shadow-lg">
          <CardContent className="p-0">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-border/30 bg-muted/30 text-center font-extrabold text-[11px] py-2.5 text-muted-foreground uppercase tracking-widest">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid Blocks */}
            <div className="grid grid-cols-7 bg-border/20 gap-[1px]">
              {loading ? (
                Array.from({ length: 35 }).map((_, idx) => (
                  <div key={idx} className="min-h-[90px] sm:min-h-[110px] bg-card p-2 flex flex-col justify-between">
                    <div className="w-6 h-6 rounded-md bg-muted/40 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
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
                      className={`min-h-[85px] sm:min-h-[115px] bg-card p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer relative hover:bg-primary/5 group ${
                        !isCurrentMonth ? 'opacity-35 bg-muted/5' : ''
                      } ${isToday(day) ? 'bg-primary/10 ring-2 ring-primary/40 z-10' : ''}`}
                    >
                      {/* Header info (number) */}
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg ${
                          isToday(day) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/80'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {totalEvents > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold min-w-5 justify-center bg-primary/20 text-primary border-primary/30">
                            {totalEvents}
                          </Badge>
                        )}
                      </div>

                      {/* Desktop view event pills (Hidden on mobile) */}
                      <div className="hidden md:block space-y-1 mt-1.5 flex-grow overflow-y-hidden max-h-[75px]">
                        {dayEvents.trips.slice(0, 2).map(t => (
                          <div key={t.id} className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                            <Truck className="w-3 h-3 shrink-0 text-emerald-400" />
                            <span className="truncate">{t.route}</span>
                          </div>
                        ))}
                        {dayEvents.reminders.slice(0, 2).map(r => (
                          <div key={r.id} className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                            <Bell className="w-3 h-3 shrink-0 text-amber-400" />
                            <span className="truncate">{r.title}</span>
                          </div>
                        ))}
                        {dayEvents.bills.slice(0, 2).map(b => (
                          <div key={b.id} className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold flex items-center gap-1">
                            <IndianRupee className="w-3 h-3 shrink-0 text-indigo-400" />
                            <span className="truncate">₹{b.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {totalEvents > 4 && (
                          <div className="text-[9px] text-center text-muted-foreground font-extrabold">
                            +{totalEvents - 4} more
                          </div>
                        )}
                      </div>

                      {/* Mobile view event badges */}
                      <div className="flex md:hidden flex-wrap gap-1 justify-center mt-1">
                        {dayEvents.trips.length > 0 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5" /> {dayEvents.trips.length}
                          </span>
                        )}
                        {dayEvents.reminders.length > 0 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black flex items-center gap-0.5">
                            <Bell className="w-2.5 h-2.5" /> {dayEvents.reminders.length}
                          </span>
                        )}
                        {dayEvents.bills.length > 0 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-black flex items-center gap-0.5">
                            <IndianRupee className="w-2.5 h-2.5" /> {dayEvents.bills.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Agenda List View */
        <Card className="border-border/40 bg-card rounded-3xl p-4 sm:p-6 shadow-lg">
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Month Schedule Agenda ({monthAgendaItems.length} Events)
            </h3>
            
            {monthAgendaItems.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-base font-bold text-foreground">No matching events found in agenda.</p>
                <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthAgendaItems.map(item => (
                  <div 
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleDayClick(item.date)}
                    className="p-3 sm:p-4 rounded-2xl border border-border/40 bg-background/80 hover:bg-muted/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="min-w-16 text-center py-1 px-2.5 rounded-xl bg-card border border-border/50 shrink-0">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">{format(item.date, 'MMM')}</div>
                        <div className="text-lg font-black text-foreground">{format(item.date, 'dd')}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                            item.type === 'trip' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : item.type === 'reminder'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {item.type === 'trip' ? 'Trip Dispatch' : item.type === 'reminder' ? 'Compliance Alert' : 'Credit Card Due'}
                          </span>
                          <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{item.sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase">
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs rounded-xl gap-1 text-primary">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Day Details Modal */}
      <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
        <DialogContent className="rounded-3xl max-w-lg bg-card border border-border p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-heading text-xl font-extrabold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {totalEventsToday} total operations & compliance events logged for this date.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-4 max-h-[420px] overflow-y-auto">
            {totalEventsToday === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-sm font-bold text-foreground">No events scheduled on this day.</p>
                <p className="text-xs mt-1">Click "Add Reminder" to log an alert for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Trips */}
                {selectedDateEvents.trips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> Dispatched Shipments ({selectedDateEvents.trips.length})
                    </h4>
                    {selectedDateEvents.trips.map(trip => (
                      <div key={trip.id} className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">{trip.route}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Vehicle: <strong className="text-foreground">{trip.truck_number}</strong> · Driver: <strong className="text-foreground">{trip.driver_name || 'N/A'}</strong>
                          </p>
                          {trip.client_name && (
                            <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> Client: {trip.client_name}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase self-start sm:self-center">
                          {trip.trip_status || 'Dispatched'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reminders */}
                {selectedDateEvents.reminders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                      <Bell className="w-4 h-4" /> Compliance & Renewal Alerts ({selectedDateEvents.reminders.length})
                    </h4>
                    {selectedDateEvents.reminders.map(rem => (
                      <div key={rem.id} className="p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-foreground">{rem.title}</p>
                            {rem.status === 'Completed' && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 h-4 text-[9px] font-extrabold">Completed</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-normal">{rem.description}</p>
                        </div>
                        
                        {rem.status !== 'Completed' ? (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setIsDayDetailOpen(false);
                                setSelectedReminder(rem);
                              }}
                              className="h-8 px-2.5 text-xs rounded-xl"
                            >
                              <Info className="w-3.5 h-3.5" /> Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteReminder(rem.id)}
                              className="h-8 px-3 text-xs rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              <Check className="w-3.5 h-3.5" /> Resolve
                            </Button>
                          </div>
                        ) : (
                          <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-xl shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* CC Bills */}
                {selectedDateEvents.bills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4" /> Credit Card Due Dates ({selectedDateEvents.bills.length})
                    </h4>
                    {selectedDateEvents.bills.map(bill => (
                      <div key={bill.id} className="p-3.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">{bill.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Amount Due: <strong className="text-rose-400 font-mono">₹{bill.amount.toLocaleString()}</strong>
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border ${
                          bill.status === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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

          <DialogFooter className="pt-3 border-t border-border/30 flex justify-between items-center flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={() => {
                setIsDayDetailOpen(false);
                setIsAddReminderOpen(true);
              }}
              className="rounded-xl text-xs gap-1 font-bold bg-primary text-primary-foreground"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reminder
            </Button>
            <Button variant="ghost" className="rounded-xl text-xs font-bold" onClick={() => setIsDayDetailOpen(false)}>
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
