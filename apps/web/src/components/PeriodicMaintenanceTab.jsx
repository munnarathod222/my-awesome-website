import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, Wind, CheckCircle2, AlertTriangle, Clock, RefreshCw, 
  Search, Filter, Plus, Wrench, ShieldCheck, Sparkles, User, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { getPeriodicLogs, getTruckPeriodicStatus, logCompletedPeriodicTask } from '@/lib/periodicMaintenanceUtils.js';

export default function PeriodicMaintenanceTab({ trucks = [], onRefresh }) {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'GREASING' | 'AIR_FILTER'

  // Completion Modal State
  const [activeModal, setActiveModal] = useState({ isOpen: false, truck: null, taskType: 'greasing' });
  const [completionForm, setCompletionForm] = useState({ technicianName: 'Fleet Mechanic', cost: '0', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadData = () => {
    const fetchedLogs = getPeriodicLogs();
    setLogs(fetchedLogs);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Compute status for each truck
  const truckStatuses = useMemo(() => {
    return trucks.map(truck => getTruckPeriodicStatus(truck, logs));
  }, [trucks, logs]);

  // Aggregates
  const stats = useMemo(() => {
    if (truckStatuses.length === 0) return { greasingPct: 100, airFilterPct: 100, overdueCount: 0 };
    
    const greasedCount = truckStatuses.filter(s => s.greasingStatus === 'UP_TO_DATE').length;
    const filterCleanCount = truckStatuses.filter(s => s.airFilterStatus === 'UP_TO_DATE').length;
    const overdueCount = truckStatuses.filter(s => s.greasingStatus === 'OVERDUE' || s.airFilterStatus === 'OVERDUE').length;

    return {
      greasingPct: Math.round((greasedCount / truckStatuses.length) * 100),
      airFilterPct: Math.round((filterCleanCount / truckStatuses.length) * 100),
      overdueCount
    };
  }, [truckStatuses]);

  // Filtered Table List
  const filteredStatuses = useMemo(() => {
    return truckStatuses.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.truckNumber.toLowerCase().includes(q) || s.truckName.toLowerCase().includes(q);
      const matchesTask = taskFilter === 'ALL' || 
        (taskFilter === 'GREASING' && (s.greasingStatus === 'OVERDUE' || s.greasingStatus === 'DUE_SOON')) ||
        (taskFilter === 'AIR_FILTER' && (s.airFilterStatus === 'OVERDUE' || s.airFilterStatus === 'DUE_SOON'));
      return matchesSearch && matchesTask;
    });
  }, [truckStatuses, searchQuery, taskFilter]);

  const handleOpenModal = (truck, taskType) => {
    setActiveModal({ isOpen: true, truck, taskType });
    setCompletionForm({
      technicianName: 'Fleet Mechanic',
      cost: taskType === 'greasing' ? '250' : '50',
      notes: taskType === 'greasing' ? 'Chassis points, kingpins, and hub nipples greased' : 'Air filter element blown out with compressed air'
    });
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!activeModal.truck) return;

    setIsSubmitting(true);
    try {
      await logCompletedPeriodicTask({
        truckId: activeModal.truck.truckId,
        truckNumber: activeModal.truck.truckNumber,
        taskType: activeModal.taskType,
        technicianName: completionForm.technicianName,
        cost: Number(completionForm.cost) || 0,
        notes: completionForm.notes
      });

      toast.success(`Marked ${activeModal.taskType === 'greasing' ? 'Greasing' : 'Air Filter Cleaning'} completed for ${activeModal.truck.truckNumber}!`);
      reloadData();
      if (onRefresh) onRefresh();
      setActiveModal({ isOpen: false, truck: null, taskType: 'greasing' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to log task completion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Compliance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Greasing Compliance</CardTitle>
            <Droplets className="w-4 h-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-blue-500">
              {stats.greasingPct}% <span className="text-xs text-muted-foreground font-normal">Up-to-date</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Chassis, kingpins & hub greasing (every 30 days)</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-teal-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bi-Weekly Air Filter Clean</CardTitle>
            <Wind className="w-4 h-4 text-cyan-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-cyan-500">
              {stats.airFilterPct}% <span className="text-xs text-muted-foreground font-normal">Up-to-date</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Blow-out cleaning (twice monthly / every 15 days)</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-amber-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue Services</CardTitle>
            <AlertTriangle className="w-4 h-4 text-rose-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-rose-500">
              {stats.overdueCount} <span className="text-xs text-muted-foreground font-normal">Vehicles</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Requires immediate greasing or air filter blow-out</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table View */}
      <Card className="bg-card/60 border border-border/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-4 border-b border-border/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Scheduled Greasing & Air Filter Cleaner Tracker
            </CardTitle>
            <CardDescription className="text-xs">
              Automated 30-day greasing cycles & 15-day bi-weekly air filter blow-out schedules per truck
            </CardDescription>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search truck number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-9 rounded-xl text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b-border/40">
                <TableHead className="font-semibold text-muted-foreground pl-6 py-4">Vehicle</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4">Monthly Greasing (30 Days)</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4">Bi-Weekly Air Filter Clean (15 Days)</TableHead>
                <TableHead className="font-semibold text-muted-foreground py-4 text-right pr-6">Quick Service Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                    No vehicles found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStatuses.map(s => (
                  <TableRow key={s.truckId} className="hover:bg-muted/20 border-b-border/30 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="font-bold text-base text-foreground">{s.truckNumber}</div>
                      <div className="text-xs text-muted-foreground">{s.truckName}</div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`font-bold px-2.5 py-0.5 text-xs rounded-md border ${s.greasingBadgeClass}`}>
                          {s.greasingText}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Next Due: <span className="font-mono font-medium">{s.nextGreasingDue}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`font-bold px-2.5 py-0.5 text-xs rounded-md border ${s.airFilterBadgeClass}`}>
                          {s.airFilterText}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Next Due: <span className="font-mono font-medium">{s.nextAirFilterDue}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenModal(s, 'greasing')}
                          className="h-8 px-2.5 text-xs rounded-xl border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Droplets className="w-3.5 h-3.5 mr-1" /> Mark Greased
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenModal(s, 'air_filter_clean')}
                          className="h-8 px-2.5 text-xs rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Wind className="w-3.5 h-3.5 mr-1" /> Blow Air Filter
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Completion Dialog */}
      <Dialog open={activeModal.isOpen} onOpenChange={(open) => !open && setActiveModal({ isOpen: false, truck: null, taskType: 'greasing' })}>
        <DialogContent className="sm:max-w-[460px] bg-card text-card-foreground border-border shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold font-heading text-lg">
              {activeModal.taskType === 'greasing' ? <Droplets className="w-5 h-5 text-blue-500" /> : <Wind className="w-5 h-5 text-cyan-500" />}
              Mark {activeModal.taskType === 'greasing' ? 'Greasing' : 'Air Filter Cleaning'} Complete — {activeModal.truck?.truckNumber}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConfirmCompletion} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Technician / Driver Name</Label>
              <Input 
                value={completionForm.technicianName}
                onChange={(e) => setCompletionForm(p => ({ ...p, technicianName: e.target.value }))}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Cost Incurred (₹)</Label>
              <Input 
                type="number"
                min="0"
                value={completionForm.cost}
                onChange={(e) => setCompletionForm(p => ({ ...p, cost: e.target.value }))}
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Work Notes / Observation</Label>
              <Input 
                value={completionForm.notes}
                onChange={(e) => setCompletionForm(p => ({ ...p, notes: e.target.value }))}
                className="bg-background"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" type="button" onClick={() => setActiveModal({ isOpen: false, truck: null, taskType: 'greasing' })} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-sm">
                {isSubmitting ? 'Saving...' : 'Confirm & Reset Next Due Date'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
