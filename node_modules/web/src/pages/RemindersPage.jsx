import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Bell, Plus, AlertCircle, RefreshCw, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

import { useSmartReminders } from '@/hooks/useSmartReminders.js';
import AddReminderModal from '@/components/AddReminderModal.jsx';
import ReminderDetailsModal from '@/components/ReminderDetailsModal.jsx';
import ReminderCard from '@/components/ReminderCard.jsx';
import FASTagRechargeModal from '@/components/FASTagRechargeModal.jsx';

const RemindersPage = () => {
  const { currentUser } = useAuth();
  const { checkAndCreateReminders, isChecking } = useSmartReminders(currentUser);
  
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [rechargeTruck, setRechargeTruck] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'Active',
    type: 'all',
    priority: 'all'
  });

  const fetchReminders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('reminders').getFullList({
        filter: `created_by = "${currentUser.id}"`,
        sort: 'reminder_date',
        expand: 'truck_id',
        $autoCancel: false
      });
      setReminders(records);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      setError('Could not load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const triggerSmartSync = useCallback(async () => {
    try {
      const { newRemindersCreated } = await checkAndCreateReminders();
      if (newRemindersCreated > 0) {
        toast.success(`Auto-generated ${newRemindersCreated} new smart reminder(s)`);
        fetchReminders(false);
      }
    } catch (e) {
      console.error("Sync error", e);
    }
  }, [checkAndCreateReminders, fetchReminders]);

  useEffect(() => {
    const init = async () => {
      await fetchReminders(true);
      await triggerSmartSync();
    };
    if (currentUser) init();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      triggerSmartSync();
      fetchReminders(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser, fetchReminders, triggerSmartSync]);

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.type !== 'all' && r.reminder_type !== filters.type) return false;
      if (filters.priority !== 'all' && r.priority !== filters.priority) return false;
      return true;
    });
  }, [reminders, filters]);

  const clearFilters = () => {
    setFilters({ status: 'Active', type: 'all', priority: 'all' });
  };

  return (
    <div className="h-full w-full bg-background">
      <Helmet>
        <title>Reminders | Dashboard</title>
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="w-8 h-8 text-primary" /> Reminders
            </h1>
            <p className="text-muted-foreground mt-1">Smart tracking for upcoming payments, expiries, and tasks.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => triggerSmartSync()} disabled={isChecking} title="Sync Smart Reminders">
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Reminder
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center mb-6 shadow-sm">
          <Tabs value={filters.status} onValueChange={(v) => setFilters(prev => ({...prev, status: v}))} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 w-full sm:w-auto">
              <TabsTrigger value="Active" className="flex-1 sm:flex-none">Active</TabsTrigger>
              <TabsTrigger value="Snoozed" className="flex-1 sm:flex-none">Snoozed</TabsTrigger>
              <TabsTrigger value="Completed" className="flex-1 sm:flex-none">Completed</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 sm:flex-none hidden sm:inline-flex">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-8 w-px bg-border hidden sm:block mx-2" />

          <Select value={filters.type} onValueChange={(v) => setFilters(prev => ({...prev, type: v}))}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Truck Doc Expiry">Truck Doc Expiry</SelectItem>
              <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
              <SelectItem value="Kilometric Maintenance">Kilometric Maintenance</SelectItem>
              <SelectItem value="FASTag Low-Balance">FASTag Low-Balance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(v) => setFilters(prev => ({...prev, priority: v}))}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          {(filters.type !== 'all' || filters.priority !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <FilterX className="w-4 h-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner text="Loading reminders..." />
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-card rounded-xl border border-border">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold mb-2">Failed to load reminders</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchReminders(true)}>Try Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {filteredReminders.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-card/50 rounded-2xl border border-dashed border-border">
                <Bell className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No reminders found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                  You're all caught up! New reminders will appear here automatically when documents or payments approach their due dates.
                </p>
                {filters.status !== 'all' && (
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                )}
              </div>
            ) : (
              filteredReminders.map(reminder => (
                <ReminderCard 
                  key={reminder.id} 
                  reminder={reminder} 
                  onViewDetails={setSelectedReminder}
                  onRefresh={() => fetchReminders(false)}
                  onRecharge={(truck) => setRechargeTruck(truck)}
                />
              ))
            )}
          </div>
        )}

      </main>

      <AddReminderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchReminders(false);
        }}
      />

      <ReminderDetailsModal
        isOpen={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        reminder={selectedReminder}
        onRefresh={() => fetchReminders(false)}
      />

      {rechargeTruck && (
        <FASTagRechargeModal
          isOpen={!!rechargeTruck}
          onClose={() => setRechargeTruck(null)}
          truck={rechargeTruck}
          onSuccess={() => {
            setRechargeTruck(null);
            fetchReminders(false);
          }}
        />
      )}
    </div>
  );
};

export default RemindersPage;