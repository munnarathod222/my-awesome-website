import React, { useState, useMemo, useRef } from 'react';
import { 
  AlertTriangle, ShieldCheck, Plus, Calendar, DollarSign, User, Truck, 
  FileText, Camera, ChevronRight, X, Edit, Trash2, Search, Filter, 
  ExternalLink, Download, ArrowLeft, Eye, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function TruckAccidentsView({
  trucks = [],
  drivers = [],
  accidents = [],
  filterTruckId = 'all',
  setFilterTruckId,
  onRefreshAccidents,
  onBackToFleet
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [liabilityFilter, setLiabilityFilter] = useState('all'); // 'all', 'driver_fined', 'company_expense'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccident, setEditingAccident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTruckId, setFormTruckId] = useState('');
  const [formDriverId, setFormDriverId] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCost, setFormCost] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFined, setFormFined] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Fullscreen Photo Viewer State
  const [photoViewer, setPhotoViewer] = useState({ isOpen: false, record: null, activeIndex: 0 });

  // Keyboard navigation for photo viewer
  React.useEffect(() => {
    if (!photoViewer.isOpen || !photoViewer.record) return;
    const handleKeyDown = (e) => {
      const imgs = Array.isArray(photoViewer.record?.image_urls) ? photoViewer.record.image_urls : [];
      if (imgs.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setPhotoViewer(prev => ({ ...prev, activeIndex: (prev.activeIndex + 1) % imgs.length }));
      } else if (e.key === 'ArrowLeft') {
        setPhotoViewer(prev => ({ ...prev, activeIndex: (prev.activeIndex - 1 + imgs.length) % imgs.length }));
      } else if (e.key === 'Escape') {
        setPhotoViewer({ isOpen: false, record: null, activeIndex: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoViewer]);

  // Open modal for new accident
  const openNewAccidentModal = (preselectedTruckId = null) => {
    const truckIdToUse = preselectedTruckId || (filterTruckId !== 'all' ? filterTruckId : (trucks[0]?.id || ''));
    const matchedTruck = trucks.find(t => t.id === truckIdToUse);
    const assignedDriver = drivers.find(d => d.assigned_truck === truckIdToUse);

    setEditingAccident(null);
    setFormTruckId(truckIdToUse);
    setFormDriverId(assignedDriver ? assignedDriver.id : '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCost('');
    setFormDesc('');
    setFormFined(false);
    setNewPhotos([]);
    setPhotoPreviews([]);
    setIsModalOpen(true);
  };

  // Open modal for editing existing accident
  const openEditAccidentModal = (accident) => {
    setEditingAccident(accident);
    setFormTruckId(accident.truck_id || '');
    setFormDriverId(accident.employee_id || '');
    setFormDate(accident.accident_date ? accident.accident_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormCost(accident.damage_cost || '');
    setFormDesc(accident.description || '');
    setFormFined(accident.fined_to_employee === true || accident.fined_to_employee === 'true');
    setNewPhotos([]);
    setPhotoPreviews([]);
    setIsModalOpen(true);
  };

  // Handle Photo selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewPhotos(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Accident Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTruckId) {
      toast.error('Please select a truck');
      return;
    }

    try {
      setIsSubmitting(true);
      const costNum = Number(formCost) || 0;
      const isoDate = new Date(formDate).toISOString();
      const selectedTruck = trucks.find(t => t.id === formTruckId);
      const selectedDriver = drivers.find(d => d.id === formDriverId);

      const formData = new FormData();
      formData.append('truck_id', formTruckId);
      formData.append('employee_id', formDriverId || '');
      formData.append('accident_date', isoDate);
      formData.append('damage_cost', costNum);
      formData.append('description', formDesc.trim());
      formData.append('fined_to_employee', formFined ? 'true' : 'false');

      // Append images
      newPhotos.forEach(file => {
        formData.append('image_urls', file);
      });

      if (editingAccident) {
        await pb.collection('driver_accident_reports').update(editingAccident.id, formData, { $autoCancel: false });
        toast.success(`Accident report for ${selectedTruck?.truck_number || 'Truck'} updated successfully`);
      } else {
        await pb.collection('driver_accident_reports').create(formData, { $autoCancel: false });
        
        // If fined to driver, also log to cashbook/expenses/advances if available
        if (formFined && formDriverId) {
          try {
            const desc = `Accident Fine: ${formDesc.slice(0, 40) || 'Vehicle damage'} (${selectedTruck?.truck_number || ''})`;
            const exp = await pb.collection('expenses').create({
              category: 'Employee',
              subcategory: 'Employee Advance',
              amount: costNum,
              date: isoDate,
              description: desc,
              employee_id: formDriverId,
              truck_id: formTruckId,
              status: 'Approved',
              payment_method: 'Cash'
            }, { $autoCancel: false }).catch(() => null);

            await pb.collection('advances').create({
              employee_id: formDriverId,
              amount: costNum,
              date: isoDate,
              advance_date: isoDate,
              reason: desc,
              status: 'Pending',
              expense_id: exp?.id || undefined
            }, { $autoCancel: false }).catch(() => null);

            await pb.collection('cashbook').create({
              date: isoDate,
              description: desc,
              amount: costNum,
              transaction_type: 'Expense',
              category: 'Employee - Employee Advance',
              reference_id: exp?.id || '',
              reference_type: 'expense',
              status: 'Completed'
            }, { $autoCancel: false }).catch(() => null);
          } catch(err) {
            console.warn('Syncing fine to cashbook notice:', err);
          }
        }

        toast.success(`Accident report logged for ${selectedTruck?.truck_number || 'Truck'}!`);
      }

      setIsModalOpen(false);
      if (onRefreshAccidents) await onRefreshAccidents();
    } catch(err) {
      console.error(err);
      toast.error(`Failed to save accident report: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Accident Report
  const handleDeleteAccident = async (accidentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this accident report?')) return;
    try {
      await pb.collection('driver_accident_reports').delete(accidentId, { $autoCancel: false });
      toast.success('Accident record deleted successfully');
      if (onRefreshAccidents) await onRefreshAccidents();
    } catch(err) {
      console.error(err);
      toast.error('Failed to delete accident record');
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown Date';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filtered accidents
  const filteredAccidents = useMemo(() => {
    return accidents.filter(ac => {
      // Truck filter
      if (filterTruckId !== 'all') {
        const matchesId = ac.truck_id === filterTruckId;
        const truckObj = trucks.find(t => t.id === filterTruckId);
        const matchesNumber = truckObj && ac.truck_id === truckObj.truck_number;
        if (!matchesId && !matchesNumber) return false;
      }

      // Liability filter
      const isFined = ac.fined_to_employee === true || ac.fined_to_employee === 'true';
      if (liabilityFilter === 'driver_fined' && !isFined) return false;
      if (liabilityFilter === 'company_expense' && isFined) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const trk = trucks.find(t => t.id === ac.truck_id || t.truck_number === ac.truck_id);
        const drv = drivers.find(d => d.id === ac.employee_id);
        const trkNo = (trk?.truck_number || ac.expand?.truck_id?.truck_number || ac.truck_id || '').toLowerCase();
        const trkName = (trk?.truck_name || ac.expand?.truck_id?.truck_name || '').toLowerCase();
        const drvName = (drv?.name || ac.expand?.employee_id?.name || '').toLowerCase();
        const desc = (ac.description || '').toLowerCase();
        const date = (ac.accident_date || '').toLowerCase();
        return trkNo.includes(q) || trkName.includes(q) || drvName.includes(q) || desc.includes(q) || date.includes(q);
      }

      return true;
    });
  }, [accidents, filterTruckId, liabilityFilter, searchQuery, trucks, drivers]);

  // Overall & Filtered KPIs
  const kpis = useMemo(() => {
    const list = filteredAccidents;
    const totalCount = list.length;
    const totalDamage = list.reduce((sum, a) => sum + (Number(a.damage_cost) || 0), 0);
    const driverFinedList = list.filter(a => a.fined_to_employee === true || a.fined_to_employee === 'true');
    const driverFinedCount = driverFinedList.length;
    const driverFinedTotal = driverFinedList.reduce((sum, a) => sum + (Number(a.damage_cost) || 0), 0);
    const companyExpenseList = list.filter(a => !(a.fined_to_employee === true || a.fined_to_employee === 'true'));
    const companyExpenseCount = companyExpenseList.length;
    const companyExpenseTotal = companyExpenseList.reduce((sum, a) => sum + (Number(a.damage_cost) || 0), 0);

    // Fleet-wide stats
    const affectedTruckIds = new Set(accidents.map(a => a.truck_id));
    const affectedTruckCount = trucks.filter(t => affectedTruckIds.has(t.id) || affectedTruckIds.has(t.truck_number)).length;
    const cleanTruckCount = Math.max(0, trucks.length - affectedTruckCount);

    return {
      totalCount,
      totalDamage,
      driverFinedCount,
      driverFinedTotal,
      companyExpenseCount,
      companyExpenseTotal,
      affectedTruckCount,
      cleanTruckCount
    };
  }, [filteredAccidents, accidents, trucks]);

  const selectedTruckObj = trucks.find(t => t.id === filterTruckId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Strip */}
      <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                Truck Accident & Damage History
                {selectedTruckObj && (
                  <Badge variant="outline" className="text-xs font-mono font-bold border-rose-500/30 text-rose-500 bg-rose-500/5">
                    {selectedTruckObj.truck_number}
                  </Badge>
                )}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete collision logs, repair damage costs, driver accountability, and scene photos mapped directly to each vehicle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToFleet && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBackToFleet} 
                className="h-9 rounded-xl border-border text-xs font-bold hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Fleet
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => openNewAccidentModal(filterTruckId !== 'all' ? filterTruckId : null)}
              className="h-9 rounded-xl text-xs font-bold shadow-xs bg-rose-600 hover:bg-rose-500 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Log Accident Report
            </Button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-border/50">
          {/* Truck Switcher */}
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Filter by Vehicle:
            </label>
            <select
              value={filterTruckId}
              onChange={(e) => setFilterTruckId ? setFilterTruckId(e.target.value) : null}
              className="w-full bg-background border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">🚛 All Fleet Trucks ({accidents.length} total incidents)</option>
              {trucks.map(trk => {
                const trkAccCount = accidents.filter(a => a.truck_id === trk.id || a.truck_id === trk.truck_number).length;
                return (
                  <option key={trk.id} value={trk.id}>
                    {trk.truck_number} - {trk.truck_name || 'Fleet'} ({trkAccCount} {trkAccCount === 1 ? 'incident' : 'incidents'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Liability Filter */}
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Financial Liability:
            </label>
            <select
              value={liabilityFilter}
              onChange={(e) => setLiabilityFilter(e.target.value)}
              className="w-full bg-background border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">⚖️ All Liabilities ({accidents.length})</option>
              <option value="driver_fined">👤 Driver Fined / Deducted</option>
              <option value="company_expense">🏢 Company Misc Expense</option>
            </select>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Search Incident Details:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search truck #, driver name, collision notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {filterTruckId === 'all' ? 'Fleet Incidents' : 'Vehicle Incidents'}
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {kpis.totalCount} <span className="text-xs text-muted-foreground font-normal">records</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {filterTruckId === 'all' 
                  ? `${kpis.affectedTruckCount} trucks affected, ${kpis.cleanTruckCount} accident-free` 
                  : `Logged for ${selectedTruckObj?.truck_number || 'selected truck'}`}
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Repair & Damage</p>
              <p className="text-2xl font-black font-mono text-rose-500 mt-1">
                ₹{kpis.totalDamage.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cumulative collision impact cost</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fined to Driver</p>
              <p className="text-2xl font-black font-mono text-amber-500 mt-1">
                ₹{kpis.driverFinedTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {kpis.driverFinedCount} incidents debited as salary fine
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
              <User className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Company Borne</p>
              <p className="text-2xl font-black font-mono text-blue-500 mt-1">
                ₹{kpis.companyExpenseTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {kpis.companyExpenseCount} incidents logged as misc expense
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accidents List */}
      {filteredAccidents.length === 0 ? (
        <div className="bg-card border border-border/70 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {filterTruckId !== 'all' 
              ? `Zero Accidents Logged for ${selectedTruckObj?.truck_number || 'This Vehicle'}` 
              : 'No Accident Records Found'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? 'No accident reports matched your search criteria. Try modifying your search keywords.' 
              : 'This vehicle maintains a clean safety profile with zero reported road collisions or body damage incidents.'}
          </p>
          <div className="pt-2">
            <Button 
              size="sm" 
              onClick={() => openNewAccidentModal(filterTruckId !== 'all' ? filterTruckId : null)}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Log First Incident for This Truck
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAccidents.map((ac) => {
            const trk = trucks.find(t => t.id === ac.truck_id || t.truck_number === ac.truck_id);
            const drv = drivers.find(d => d.id === ac.employee_id);
            const isFined = ac.fined_to_employee === true || ac.fined_to_employee === 'true';
            const photos = Array.isArray(ac.image_urls) ? ac.image_urls.filter(Boolean) : (ac.image_urls ? [ac.image_urls] : []);

            return (
              <div 
                key={ac.id} 
                className="bg-card border border-border/70 hover:border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-3.5"
              >
                {/* Header Row: Vehicle, Date, Damage Cost, Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Truck Badge */}
                    <div 
                      onClick={() => setFilterTruckId && setFilterTruckId(trk?.id || ac.truck_id)}
                      className="cursor-pointer flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1 rounded-xl font-mono font-extrabold text-sm transition-colors"
                      title="Filter exclusively for this truck"
                    >
                      <Truck className="w-4 h-4" />
                      {trk?.truck_number || ac.expand?.truck_id?.truck_number || ac.truck_id || 'Unknown Truck'}
                    </div>

                    {trk?.truck_name && (
                      <span className="text-xs text-muted-foreground font-semibold">
                        {trk.truck_name}
                      </span>
                    )}

                    {/* Accident Date */}
                    <Badge variant="outline" className="border-border/70 text-xs px-2 py-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {formatDate(ac.accident_date)}
                    </Badge>

                    {/* Liability Badge */}
                    {isFined ? (
                      <Badge className="bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                        ⚖️ Fined to Driver
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold">
                        🏢 Company Borne Expense
                      </Badge>
                    )}
                  </div>

                  {/* Damage Cost & Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-right mr-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Damage Cost
                      </span>
                      <span className="text-base font-black font-mono text-rose-500">
                        ₹{(Number(ac.damage_cost) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditAccidentModal(ac)}
                      className="h-8 px-2.5 rounded-xl border-border text-xs font-semibold hover:bg-muted"
                      title="Edit accident report"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteAccident(ac.id)}
                      className="h-8 w-8 p-0 rounded-xl text-destructive hover:bg-destructive/10"
                      title="Delete accident report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Details Grid: Driver Info, Description, Photos */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Driver Involved Box */}
                  <div className="md:col-span-3 bg-muted/40 p-3 rounded-xl border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                      <User className="w-3 h-3 text-primary" /> Driver in Charge:
                    </span>
                    <p className="font-bold text-foreground text-sm">
                      {drv?.name || ac.expand?.employee_id?.name || 'Driver Unassigned / External'}
                    </p>
                    {drv?.contact && (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        📞 {drv.contact}
                      </p>
                    )}
                    {drv?.license_number && (
                      <p className="text-[10px] text-muted-foreground font-mono">
                        DL: {drv.license_number}
                      </p>
                    )}
                  </div>

                  {/* Description Box */}
                  <div className="md:col-span-6 bg-muted/40 p-3 rounded-xl border border-border/50 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-500" /> Incident Description & Circumstances:
                      </span>
                      <p className="text-foreground leading-relaxed mt-1">
                        {ac.description || 'No detailed damage description entered for this record.'}
                      </p>
                    </div>
                    {isFined && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                        * ₹{(Number(ac.damage_cost) || 0).toLocaleString('en-IN')} marked for payroll deduction / driver liability.
                      </p>
                    )}
                  </div>

                  {/* Photos Box */}
                  <div className="md:col-span-3 bg-muted/40 p-3 rounded-xl border border-border/50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                      <Camera className="w-3 h-3 text-cyan-500" /> Evidence Photos ({photos.length}):
                    </span>
                    {photos.length === 0 ? (
                      <div className="h-14 flex items-center justify-center text-muted-foreground/60 text-[11px] italic">
                        No photos attached
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {photos.map((img, idx) => {
                          const imgUrl = pb.files.getUrl(ac, img, { thumb: '100x100' });
                          return (
                            <div 
                              key={idx}
                              onClick={() => setPhotoViewer({ isOpen: true, record: ac, activeIndex: idx })}
                              className="w-12 h-12 rounded-lg bg-black/20 border border-border/60 overflow-hidden cursor-pointer hover:border-primary transition-all relative group"
                              title="Click to view full photo"
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Accident photo ${idx + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = pb.files.getUrl(ac, img);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log / Edit Accident Modal Dialog */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl w-[95vw] bg-card border border-border text-foreground p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {editingAccident ? 'Edit Accident Report' : 'Log Vehicle Accident & Damage'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Truck Selection */}
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Vehicle Involved: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTruckId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      setFormTruckId(tId);
                      const assigned = drivers.find(d => d.assigned_truck === tId);
                      if (assigned && !formDriverId) {
                        setFormDriverId(assigned.id);
                      }
                    }}
                    required
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-foreground font-semibold focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="">-- Select Truck --</option>
                    {trucks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.truck_number} - {t.truck_name || 'Fleet'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Driver in Charge:
                  </label>
                  <select
                    value={formDriverId}
                    onChange={(e) => setFormDriverId(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-foreground font-semibold focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="">-- Driver Unassigned / External --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.contact ? `(${d.contact})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Accident Date */}
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Accident Date: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-foreground focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                {/* Damage Cost */}
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Repair / Damage Cost (₹): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 25000"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-foreground font-mono focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Accident Circumstances & Damage Description:
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail collision point, third party damage, location, mechanical impact, FIR/insurance remarks..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl p-3 text-foreground placeholder-muted-foreground focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Liability Toggle */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="fined_to_employee"
                  checked={formFined}
                  onChange={(e) => setFormFined(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-amber-500 cursor-pointer"
                />
                <label htmlFor="fined_to_employee" className="text-xs text-foreground cursor-pointer select-none space-y-0.5">
                  <span className="font-bold block text-amber-500">Fine / Charge damage to driver</span>
                  <span className="text-[11px] text-muted-foreground block">
                    When checked, this cost will be logged against driver advances / salary deduction. When unchecked, it is logged under Company Miscellaneous Expenses.
                  </span>
                </label>
              </div>

              {/* Photo Uploads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground font-semibold">
                    Attach Incident Photos:
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" /> Add Photos
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(i)}
                          className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-black text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  {isSubmitting ? 'Saving Incident...' : editingAccident ? 'Update Accident Report' : 'Save Accident Report'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Fullscreen Photo Viewer Modal */}
      {photoViewer.isOpen && photoViewer.record && (
        <Dialog open={photoViewer.isOpen} onOpenChange={() => setPhotoViewer({ isOpen: false, record: null, activeIndex: 0 })}>
          <DialogContent className="max-w-3xl w-[95vw] h-[90vh] bg-slate-950/95 border border-slate-800 text-white p-4 rounded-3xl overflow-hidden flex flex-col gap-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Accident Evidence Photo</span>
                {Array.isArray(photoViewer.record.image_urls) && (
                  <Badge variant="outline" className="text-xs font-mono border-slate-700 text-slate-300">
                    {photoViewer.activeIndex + 1} / {photoViewer.record.image_urls.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {Array.isArray(photoViewer.record.image_urls) && photoViewer.record.image_urls[photoViewer.activeIndex] && (
                  <a
                    href={pb.files.getUrl(photoViewer.record, photoViewer.record.image_urls[photoViewer.activeIndex])}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Fullscreen
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPhotoViewer({ isOpen: false, record: null, activeIndex: 0 })}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center bg-black/80 rounded-2xl overflow-hidden select-none">
              {Array.isArray(photoViewer.record.image_urls) && photoViewer.record.image_urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPhotoViewer(prev => ({
                    ...prev,
                    activeIndex: (prev.activeIndex - 1 + prev.record.image_urls.length) % prev.record.image_urls.length
                  }))}
                  className="absolute left-3 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 flex items-center justify-center text-xl font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {Array.isArray(photoViewer.record.image_urls) && photoViewer.record.image_urls[photoViewer.activeIndex] && (
                <img
                  src={pb.files.getUrl(photoViewer.record, photoViewer.record.image_urls[photoViewer.activeIndex])}
                  alt="Accident Full"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              )}

              {Array.isArray(photoViewer.record.image_urls) && photoViewer.record.image_urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPhotoViewer(prev => ({
                    ...prev,
                    activeIndex: (prev.activeIndex + 1) % prev.record.image_urls.length
                  }))}
                  className="absolute right-3 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 flex items-center justify-center text-xl font-bold"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
