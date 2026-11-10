import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Phone, MapPin, ShieldCheck, Zap, Search, MessageSquare, AlertCircle, CheckCircle2, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverStandbyRegistryModal({
  isOpen,
  onClose,
  employees = [],
  activeTrips = [],
  onSelectDriverForEmergency
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'standby' | 'on_trip' | 'off_duty'
  const [driverStatuses, setDriverStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('jbc_driver_standby_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const activeDriverMap = useMemo(() => {
    const map = new Set();
    activeTrips.forEach(t => {
      if (t.trip_status !== 'Delivered' && t.trip_status !== 'Completed' && t.trip_status !== 'Cancelled') {
        if (t.driver_name) map.add(t.driver_name.trim().toLowerCase());
      }
    });
    return map;
  }, [activeTrips]);

  const handleToggleStatus = (driverId, newStatus) => {
    const updated = { ...driverStatuses, [driverId]: newStatus };
    setDriverStatuses(updated);
    try {
      localStorage.setItem('jbc_driver_standby_statuses', JSON.stringify(updated));
    } catch (e) {}
    toast.success(`Driver standby status updated to ${newStatus}`);
  };

  const processedDrivers = useMemo(() => {
    return employees.map(emp => {
      const isOnTrip = activeDriverMap.has((emp.name || '').trim().toLowerCase());
      const customStatus = driverStatuses[emp.id] || (isOnTrip ? 'on_trip' : 'standby');
      const baseHub = emp.city || emp.location || emp.base_hub || 'Hyderabad Depot';
      const licenseNo = emp.license_number || emp.dl_number || emp.driver_license || 'DL-HMV-VERIFIED';
      const phone = emp.phone || emp.mobile || '';

      return {
        ...emp,
        isOnTrip,
        status: customStatus,
        baseHub,
        licenseNo,
        phone
      };
    });
  }, [employees, activeDriverMap, driverStatuses]);

  const filteredDrivers = useMemo(() => {
    return processedDrivers.filter(d => {
      const matchesSearch = !searchQuery || 
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.phone || '').includes(searchQuery) ||
        (d.baseHub || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedDrivers, searchQuery, statusFilter]);

  const standbyCount = processedDrivers.filter(d => d.status === 'standby').length;
  const onTripCount = processedDrivers.filter(d => d.status === 'on_trip').length;
  const offDutyCount = processedDrivers.filter(d => d.status === 'off_duty').length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="shrink-0 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Standby Driver Replacement Network
            </DialogTitle>
            <div className="flex items-center gap-1.5 text-xs">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold">
                🟢 {standbyCount} Standby Available
              </Badge>
              <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 font-bold">
                🔵 {onTripCount} In Transit
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Live pool of verified standby highway drivers stationed across transport hubs ready for instant emergency dispatch.
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 py-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search driver by name, phone, or hub location..."
              className="bg-slate-900 border-slate-800 text-xs pl-9 rounded-xl text-white w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-800 text-xs rounded-xl font-bold text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="all">All Drivers ({processedDrivers.length})</SelectItem>
              <SelectItem value="standby">🟢 Standby Available ({standbyCount})</SelectItem>
              <SelectItem value="on_trip">🔵 On Active Trip ({onTripCount})</SelectItem>
              <SelectItem value="off_duty">🟡 Off Duty / Rest ({offDutyCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Drivers Grid */}
        <div className="space-y-2.5 py-2 overflow-y-auto flex-1 pr-1 scrollbar-none text-xs">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p>No standby drivers match your filter query.</p>
            </div>
          ) : (
            filteredDrivers.map(driver => {
              const isAvailable = driver.status === 'standby';
              return (
                <div
                  key={driver.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    isAvailable
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-900 opacity-80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{driver.name}</span>
                      {driver.status === 'standby' && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                          🟢 Standby Ready
                        </Badge>
                      )}
                      {driver.status === 'on_trip' && (
                        <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[10px] font-bold">
                          🔵 On Active Trip
                        </Badge>
                      )}
                      {driver.status === 'off_duty' && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                          🟡 Mandatory Rest
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" /> Base Hub: <strong className="text-slate-300">{driver.baseHub}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> {driver.licenseNo}
                      </span>
                      {driver.phone && (
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Phone className="w-3 h-3 text-sky-400" /> {driver.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Control */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Select
                      value={driver.status}
                      onValueChange={val => handleToggleStatus(driver.id, val)}
                    >
                      <SelectTrigger className="h-8 text-[11px] font-bold bg-slate-950 border-slate-800 w-32 rounded-xl text-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <SelectItem value="standby">🟢 Standby</SelectItem>
                        <SelectItem value="on_trip">🔵 On Trip</SelectItem>
                        <SelectItem value="off_duty">🟡 Off Duty</SelectItem>
                      </SelectContent>
                    </Select>

                    {driver.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/91${driver.phone.replace(/[^0-9]/g, '').slice(-10)}`, '_blank')}
                        className="h-8 w-8 p-0 rounded-xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {onSelectDriverForEmergency && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectDriverForEmergency(driver);
                          onClose();
                        }}
                        className="h-8 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" /> Dispatch
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-800 shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs border-slate-800 text-slate-300">
            Close Registry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
