import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Trash2, Calculator, Truck, User, Calendar, FileText, CheckCircle2, Clock, Package, Paperclip, Image as ImageIcon, ExternalLink, X, UploadCloud, Droplets, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';

export const STANDARD_MAINTENANCE_PARTS = [
  { name: 'Engine Oil', targetKms: 40000, defaultQty: 15, defaultRate: 380, icon: '🛢️', compKey: 'ENGINE OIL', unit: 'Ltrs' },
  { name: 'Oil Filter', targetKms: 40000, defaultQty: 1, defaultRate: 650, icon: '⚙️', compKey: 'OIL FILTER', unit: 'Pcs' },
  { name: 'Diesel Filter', targetKms: 30000, defaultQty: 1, defaultRate: 1200, icon: '⛽', compKey: 'DIESEL FILTER', unit: 'Pcs' },
  { name: 'Air Filter', targetKms: 30000, defaultQty: 1, defaultRate: 1800, icon: '💨', compKey: 'AIR FILTER', unit: 'Pcs' },
  { name: 'Coolant', targetKms: 60000, defaultQty: 10, defaultRate: 250, icon: '🧪', compKey: 'COOLANT', unit: 'Ltrs' },
  { name: 'Gearbox Oil', targetKms: 80000, defaultQty: 12, defaultRate: 420, icon: '⚙️', compKey: 'GEARBOX OIL', unit: 'Ltrs' },
  { name: 'Differential Oil', targetKms: 80000, defaultQty: 14, defaultRate: 450, icon: '🔩', compKey: 'DIFFERENTIAL OIL', unit: 'Ltrs' },
  { name: 'Power Steering Fluid', targetKms: 60000, defaultQty: 3, defaultRate: 350, icon: '🔄', compKey: 'POWER STEERING FLUID', unit: 'Ltrs' }
];

const SERVICE_TYPES = [
  'Preventive Scheduled Maintenance',
  'Corrective Breakdown Repair',
  'Engine Overhaul & Servicing',
  'Suspension & Steering Repair',
  'Brake Assembly Replacement',
  'Electrical & Battery Service',
  'Tyre Replacement & Alignment',
  'Body Work & Painting',
  'Transmission & Gearbox Repair'
];

const JOB_CARD_STATUSES = [
  { value: 'Created', label: '📥 Created (Inspection)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Work In Progress', label: '🛠️ Work In Progress', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'Parts Pending', label: '📦 Parts Pending', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { value: 'Quality Inspected', label: '✅ Quality Inspected', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  { value: 'Closed', label: '🏁 Closed & Invoiced', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
];

export default function WorkshopJobCardModal({ isOpen, onClose, jobCard, trucks = [], onSaved }) {
  const [saving, setSaving] = useState(false);
  const [billFiles, setBillFiles] = useState([]);
  const [existingBills, setExistingBills] = useState([]);

  const [form, setForm] = useState({
    job_card_number: `JC-${Date.now().toString().slice(-6)}`,
    truck_number: '',
    driver_name: '',
    odometer_reading: '',
    service_type: 'Preventive Scheduled Maintenance',
    assigned_mechanic: '',
    supervisor_name: 'Workshop Manager',
    status: 'Created',
    complaints_list: '',
    notes: '',
    entry_date: new Date().toISOString().slice(0, 10),
    completion_date: '',
  });

  const [items, setItems] = useState([
    { description: 'Engine Oil Change 15L', type: 'part', qty: 15, unit_price: 380, amount: 5700 },
    { description: 'Oil Filter Replacement', type: 'part', qty: 1, unit_price: 650, amount: 650 },
    { description: 'General Service Labour Charge', type: 'labour', qty: 1, unit_price: 800, amount: 800 },
  ]);

  useEffect(() => {
    setBillFiles([]);
    setExistingBills([]);

    if (jobCard) {
      setForm({
        job_card_number: jobCard.job_card_number || `JC-${Date.now().toString().slice(-6)}`,
        truck_number: jobCard.truck_number || '',
        driver_name: jobCard.driver_name || '',
        odometer_reading: jobCard.odometer_reading || '',
        service_type: jobCard.service_type || 'Preventive Scheduled Maintenance',
        assigned_mechanic: jobCard.assigned_mechanic || '',
        supervisor_name: jobCard.supervisor_name || 'Workshop Manager',
        status: jobCard.status || 'Created',
        complaints_list: jobCard.complaints_list || '',
        notes: jobCard.notes || '',
        entry_date: jobCard.entry_date ? new Date(jobCard.entry_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        completion_date: jobCard.completion_date ? new Date(jobCard.completion_date).toISOString().slice(0, 10) : '',
      });
      if (Array.isArray(jobCard.itemized_items) && jobCard.itemized_items.length > 0) {
        setItems(jobCard.itemized_items);
      }

      const loadedBills = [];
      // 1. Check multi-file field 'bills'
      if (Array.isArray(jobCard.bills)) {
        jobCard.bills.forEach(f => {
          if (f) loadedBills.push({ name: f, url: pb.files.getUrl(jobCard, f) });
        });
      } else if (typeof jobCard.bills === 'string' && jobCard.bills.trim()) {
        loadedBills.push({ name: jobCard.bills, url: pb.files.getUrl(jobCard, jobCard.bills) });
      }

      // 2. Check legacy 'bill' field
      if (Array.isArray(jobCard.bill)) {
        jobCard.bill.forEach(f => {
          if (f && !loadedBills.some(ex => ex.name === f)) {
            loadedBills.push({ name: f, url: pb.files.getUrl(jobCard, f) });
          }
        });
      } else if (typeof jobCard.bill === 'string' && jobCard.bill.trim()) {
        if (!loadedBills.some(ex => ex.name === jobCard.bill)) {
          loadedBills.push({ name: jobCard.bill, url: pb.files.getUrl(jobCard, jobCard.bill) });
        }
      }

      // 3. Check bills_json
      if (Array.isArray(jobCard.bills_json)) {
        jobCard.bills_json.forEach(b => {
          if (b && b.url && !loadedBills.some(ex => ex.url === b.url)) {
            loadedBills.push(b);
          }
        });
      }
      setExistingBills(loadedBills);
    } else {
      setForm({
        job_card_number: `JC-${Date.now().toString().slice(-6)}`,
        truck_number: trucks[0]?.truck_number || '',
        driver_name: '',
        odometer_reading: '',
        service_type: 'Preventive Scheduled Maintenance',
        assigned_mechanic: '',
        supervisor_name: 'Workshop Manager',
        status: 'Created',
        complaints_list: '',
        notes: '',
        entry_date: new Date().toISOString().slice(0, 10),
        completion_date: '',
      });
    }
  }, [jobCard, trucks, isOpen]);

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setBillFiles(prev => [...prev, ...selected]);
    toast.success(`Attached ${selected.length} bill document(s)`);
    e.target.value = '';
  };

  const removeNewBillFile = (index) => {
    setBillFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingBill = (index) => {
    setExistingBills(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    setItems(prev => {
      const next = [...prev];
      const target = { ...next[index], [field]: val };
      if (field === 'qty' || field === 'unit_price') {
        const q = Number(field === 'qty' ? val : target.qty) || 0;
        const p = Number(field === 'unit_price' ? val : target.unit_price) || 0;
        target.amount = q * p;
      }
      next[index] = target;
      return next;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { description: '', type: 'part', qty: 1, unit_price: 0, amount: 0 }]);
  };

  const addStandardPart = (stdPart) => {
    const isAlreadyAdded = items.some(it => 
      (it.part_key === stdPart.compKey) || 
      (it.description && it.description.toLowerCase().includes(stdPart.name.toLowerCase()))
    );

    if (isAlreadyAdded) {
      toast.info(`${stdPart.name} is already added in the parts list`);
      return;
    }

    setItems(prev => [
      ...prev,
      {
        description: `${stdPart.name} (${stdPart.defaultQty} ${stdPart.unit})`,
        type: 'part',
        part_key: stdPart.compKey,
        qty: stdPart.defaultQty,
        unit_price: stdPart.defaultRate,
        amount: stdPart.defaultQty * stdPart.defaultRate
      }
    ]);
    toast.success(`Added ${stdPart.name} to Job Card`);
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const partsCost = items.filter(i => i.type === 'part').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const labourCost = items.filter(i => i.type === 'labour').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const grandTotal = partsCost + labourCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.truck_number) {
      toast.error('Please select a truck number');
      return;
    }

    setSaving(true);
    try {
      // Find matching truck
      let matchedTruck = trucks.find(t => t.truck_number === form.truck_number || t.id === form.truck_number);
      if (!matchedTruck) {
        try {
          const list = await pb.collection('trucks').getFullList({
            filter: `truck_number = "${form.truck_number}"`,
            $autoCancel: false
          });
          if (list.length > 0) matchedTruck = list[0];
        } catch (e) {}
      }

      const truckId = matchedTruck?.id || '';
      const entryDateIso = form.entry_date ? new Date(form.entry_date).toISOString() : new Date().toISOString();
      const partsSummary = items.map(i => `${i.description || 'Part'} (x${i.qty || 1}) - ₹${i.amount || 0}`);

      // 1. Sync / Create Service Log (for Maintenance Logs & Service History tab)
      let serviceLogId = jobCard?.service_log_id || '';
      try {
        if (billFile) {
          const sLogData = new FormData();
          sLogData.append('truck_id', truckId);
          sLogData.append('maintenance_date', entryDateIso);
          sLogData.append('odometer_at_service', Number(form.odometer_reading || matchedTruck?.current_odometer || 0));
          sLogData.append('work_description_text', `[Job Card #${form.job_card_number}] ${form.service_type}: ${form.complaints_list || form.notes || 'Workshop Service'}`);
          sLogData.append('parts_replaced_array', JSON.stringify(partsSummary));
          sLogData.append('cost_amount', Number(grandTotal || 0));
          sLogData.append('invoice_file', billFile);

          if (serviceLogId) {
            await pb.collection('service_logs').update(serviceLogId, sLogData, { $autoCancel: false });
          } else if (truckId) {
            const sLog = await pb.collection('service_logs').create(sLogData, { $autoCancel: false });
            serviceLogId = sLog.id;
          }
        } else {
          const serviceLogPayload = {
            truck_id: truckId,
            maintenance_date: entryDateIso,
            odometer_at_service: Number(form.odometer_reading || matchedTruck?.current_odometer || 0),
            work_description_text: `[Job Card #${form.job_card_number}] ${form.service_type}: ${form.complaints_list || form.notes || 'Workshop Service'}`,
            parts_replaced_array: partsSummary,
            cost_amount: Number(grandTotal || 0),
          };

          if (serviceLogId) {
            await pb.collection('service_logs').update(serviceLogId, serviceLogPayload, { $autoCancel: false });
          } else if (truckId) {
            const sLog = await pb.collection('service_logs').create(serviceLogPayload, { $autoCancel: false });
            serviceLogId = sLog.id;
          }
        }
      } catch (sLogErr) {
        console.warn('Service log sync notice:', sLogErr);
      }

      // 2. Sync / Create Maintenance Log (in maintenance_logs collection)
      let maintenanceLogId = jobCard?.maintenance_log_id || '';
      try {
        const maintLogPayload = {
          truck_id: truckId || form.truck_number,
          category: 'Other',
          service_date: entryDateIso,
          cost: Number(grandTotal || 0),
          description: `[Job Card #${form.job_card_number}] ${form.service_type}`,
          vendor_name: form.assigned_mechanic || 'In-House Workshop',
          notes: form.notes || form.complaints_list || ''
        };

        if (maintenanceLogId) {
          await pb.collection('maintenance_logs').update(maintenanceLogId, maintLogPayload, { $autoCancel: false });
        } else {
          const mLog = await pb.collection('maintenance_logs').create(maintLogPayload, { $autoCancel: false });
          maintenanceLogId = mLog.id;
        }
      } catch (mLogErr) {
        console.warn('Maintenance log sync notice:', mLogErr);
      }

      // 3. Sync / Create Maintenance Expense (in expenses_maintenance & expenses collections)
      const currentUserId = pb.authStore.model?.id || 'usr_munna_superadmin';
      let expenseId = jobCard?.expense_id || '';
      try {
        if (grandTotal > 0) {
          const expData = new FormData();
          expData.append('category', 'Regular');
          expData.append('subcategory', 'Maintenance');
          expData.append('truck_id', truckId || form.truck_number);
          expData.append('truck_number', form.truck_number);
          expData.append('amount', Number(grandTotal || 0));
          expData.append('date', entryDateIso);
          expData.append('payment_method', 'Cash');
          expData.append('status', 'Approved');
          expData.append('created_by', currentUserId);
          expData.append('description', `[Job Card #${form.job_card_number}] Workshop Maintenance for ${form.truck_number}`);
          expData.append('notes', `Mechanic: ${form.assigned_mechanic || 'Workshop'}. Parts: ₹${partsCost}, Labour: ₹${labourCost}`);
          expData.append('service_provider_name', form.assigned_mechanic || 'Workshop');

          // Append each bill file to documents / bill
          billFiles.forEach(f => {
            expData.append('documents', f);
            expData.append('bill', f);
          });

          if (expenseId) {
            await pb.collection('expenses').update(expenseId, expData, { $autoCancel: false }).catch(() => {});
            await pb.collection('expenses_maintenance').update(expenseId, expData, { $autoCancel: false }).catch(() => {});
          } else {
            const expGen = await pb.collection('expenses').create(expData, { $autoCancel: false }).catch(() => null);
            expenseId = expGen?.id || '';
          }
        }
      } catch (expErr) {
        console.warn('Expense sync notice:', expErr);
      }

      // 4. Sync / Create Cashbook Entry (in cashbook collection)
      let cashbookId = jobCard?.cashbook_id || '';
      try {
        if (grandTotal > 0) {
          const cashbookPayload = {
            transaction_type: 'Expense',
            category: 'Maintenance',
            amount: Number(grandTotal || 0),
            date: entryDateIso,
            payment_mode: 'Cash',
            description: `[Job Card #${form.job_card_number}] Workshop Maintenance for ${form.truck_number}`,
            notes: `Mechanic: ${form.assigned_mechanic || 'Workshop'}. Parts: ₹${partsCost}, Labour: ₹${labourCost}`,
            reference_type: 'expense',
            reference_id: jobCard?.id || form.job_card_number,
            status: 'Completed',
            added_by: currentUserId
          };

          if (cashbookId) {
            await pb.collection('cashbook').update(cashbookId, cashbookPayload, { $autoCancel: false }).catch(() => {});
          } else {
            const cbRec = await pb.collection('cashbook').create(cashbookPayload, { $autoCancel: false }).catch(() => null);
            cashbookId = cbRec?.id || '';
          }
        }
      } catch (cbErr) {
        console.warn('Cashbook sync notice:', cbErr);
      }

      // 5. Automatically update Vehicle Roster Service Intervals for all serviced components
      try {
        const jobOdo = Number(form.odometer_reading || matchedTruck?.current_odometer || 0);
        if (truckId && jobOdo > 0) {
          const activeIntervals = await pb.collection('service_intervals').getFullList({
            filter: `truck_id = "${truckId}"`,
            $autoCancel: false
          }).catch(() => []);

          const allDescriptions = [
            form.service_type,
            form.complaints_list,
            form.notes,
            ...items.map(i => `${i.description} ${i.part_key || ''}`)
          ].join(' ').toLowerCase();

          for (const stdPart of STANDARD_MAINTENANCE_PARTS) {
            const partName = stdPart.name.toLowerCase();
            const compKey = stdPart.compKey.toLowerCase();
            const isMatch = allDescriptions.includes(partName) || 
                            allDescriptions.includes(compKey) ||
                            items.some(it => (it.part_key === stdPart.compKey) || (it.description && it.description.toLowerCase().includes(partName)));

            if (isMatch) {
              const existing = activeIntervals.find(i => 
                (i.component_name || '').trim().toUpperCase() === stdPart.compKey
              );

              if (existing?.id) {
                await pb.collection('service_intervals').update(existing.id, {
                  last_serviced_odometer: jobOdo
                }, { $autoCancel: false }).catch(() => {});
              } else {
                await pb.collection('service_intervals').create({
                  truck_id: truckId,
                  component_name: stdPart.compKey,
                  target_interval_kms: stdPart.targetKms,
                  last_serviced_odometer: jobOdo
                }, { $autoCancel: false }).catch(() => {});
              }
            }
          }

          // Also check other general custom components (greasing, brakes, etc.)
          for (const interval of activeIntervals) {
            const cName = (interval.component_name || '').toLowerCase();
            const isGreasing = cName.includes('greas') && allDescriptions.includes('greas');
            const isBrake = cName.includes('brake') && allDescriptions.includes('brake');
            if (isGreasing || isBrake) {
              await pb.collection('service_intervals').update(interval.id, {
                last_serviced_odometer: jobOdo
              }, { $autoCancel: false }).catch(() => {});
            }
          }
        }
      } catch (intervalSyncErr) {
        console.warn('Service intervals auto-update notice:', intervalSyncErr);
      }

      // 6. Save Workshop Job Card (FormData handles all fields + multi-bills)
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v ?? ''));
      formData.append('parts_cost', partsCost);
      formData.append('labour_cost', labourCost);
      formData.append('total_cost', grandTotal);
      formData.append('itemized_items', JSON.stringify(items));
      formData.append('service_log_id', serviceLogId);
      formData.append('maintenance_log_id', maintenanceLogId);
      formData.append('expense_id', expenseId);
      formData.append('cashbook_id', cashbookId);
      formData.append('bills_json', JSON.stringify(existingBills));

      // Append all newly attached files to multi-file fields
      billFiles.forEach(f => {
        formData.append('bills', f);
        formData.append('bills+', f);
        formData.append('bill', f);
      });

      const totalBillsCount = billFiles.length + existingBills.length;

      if (jobCard?.id) {
        await pb.collection('workshop_job_cards').update(jobCard.id, formData, { $autoCancel: false });
        toast.success(`Job Card ${form.job_card_number} updated with ${totalBillsCount} bill(s) & synced to Expenses & Cashbook!`);
      } else {
        await pb.collection('workshop_job_cards').create(formData, { $autoCancel: false });
        toast.success(`Job Card ${form.job_card_number} created with ${totalBillsCount} bill(s) & added to Expenses and Cashbook!`);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save Workshop Job Card:', err);
      toast.error('Failed to save Workshop Job Card: ' + (err.message || 'Check database permissions'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {jobCard ? `Edit Workshop Job Card (${form.job_card_number})` : 'Create New Workshop Job Card'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Header Bar: Job Card No & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-2xl border border-border/50">
            <div>
              <Label className="text-xs font-bold text-muted-foreground">Job Card No.</Label>
              <Input 
                value={form.job_card_number} 
                onChange={e => setField('job_card_number', e.target.value)} 
                className="h-9 bg-background font-mono font-bold text-xs rounded-xl" 
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground">Service Date</Label>
              <Input 
                type="date" 
                value={form.entry_date} 
                onChange={e => setField('entry_date', e.target.value)} 
                className="h-9 bg-background text-xs rounded-xl" 
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground">Job Card Status</Label>
              <Select value={form.status} onValueChange={v => setField('status', v)}>
                <SelectTrigger className="h-9 bg-background text-xs rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CARD_STATUSES.map(st => (
                    <SelectItem key={st.value} value={st.value} className="text-xs font-bold">
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vehicle & Staff Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Select Truck *</Label>
              <Select value={form.truck_number} onValueChange={v => setField('truck_number', v)}>
                <SelectTrigger className="h-9 bg-background text-xs rounded-xl font-mono font-bold">
                  <SelectValue placeholder="Truck No" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id || t.truck_number} value={t.truck_number} className="font-mono text-xs font-bold">
                      {t.truck_number} ({t.truck_name || t.truck_size || 'Truck'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Driver Name</Label>
              <Input 
                value={form.driver_name} 
                onChange={e => setField('driver_name', e.target.value)} 
                placeholder="Driver Name" 
                className="h-9 bg-background text-xs rounded-xl" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Odometer (KM)</Label>
              <Input 
                type="number" 
                value={form.odometer_reading} 
                onChange={e => setField('odometer_reading', e.target.value)} 
                placeholder="e.g. 142500" 
                className="h-9 bg-background text-xs font-mono rounded-xl" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-muted-foreground">Assigned Mechanic</Label>
              <Input 
                value={form.assigned_mechanic} 
                onChange={e => setField('assigned_mechanic', e.target.value)} 
                placeholder="Lead Mechanic" 
                className="h-9 bg-background text-xs rounded-xl" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground">Service Category</Label>
            <Select value={form.service_type} onValueChange={v => setField('service_type', v)}>
              <SelectTrigger className="h-9 bg-background text-xs rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(st => (
                  <SelectItem key={st} value={st} className="text-xs font-medium">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reported Complaints */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground">Reported Complaints &amp; Work Description</Label>
            <Textarea 
              value={form.complaints_list} 
              onChange={e => setField('complaints_list', e.target.value)} 
              placeholder="e.g. Engine oil leakage check, brake pad squeaking, clutch plate adjustment..." 
              className="bg-background text-xs rounded-xl min-h-[60px]" 
            />
          </div>

          {/* Itemized Spare Parts & Labour Table */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" /> Itemized Spare Parts &amp; Labour Line Items
              </Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs rounded-xl font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Item
              </Button>
            </div>

            {/* Quick Add Standard Fluids & Filters Toolbar */}
            <div className="bg-muted/10 p-2.5 rounded-xl border border-border/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Quick-Select Standard Fluids &amp; Filters:
                </span>
                <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">1-click resets interval to 0 KM upon invoice</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STANDARD_MAINTENANCE_PARTS.map(sp => {
                  const isAdded = items.some(it => (it.part_key === sp.compKey) || (it.description && it.description.toLowerCase().includes(sp.name.toLowerCase())));
                  return (
                    <button
                      key={sp.compKey}
                      type="button"
                      onClick={() => addStandardPart(sp)}
                      className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer",
                        isAdded 
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 cursor-default" 
                          : "bg-background hover:bg-muted/60 border-border hover:border-primary/50 text-foreground active:scale-95"
                      )}
                      title={`Add ${sp.name} (${sp.defaultQty} ${sp.unit} @ ₹${sp.defaultRate}) - Target: ${sp.targetKms.toLocaleString()} KM`}
                    >
                      <span>{sp.icon}</span>
                      <span>{sp.name}</span>
                      {isAdded ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Plus className="w-2.5 h-2.5 text-muted-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border/40">
                  <Input 
                    value={item.description} 
                    onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                    placeholder="Spare Part / Labour description" 
                    className="flex-1 h-8 text-xs bg-background rounded-lg" 
                  />
                  <Select value={item.type} onValueChange={v => handleItemChange(idx, 'type', v)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs bg-background rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part">Part 📦</SelectItem>
                      <SelectItem value="labour">Labour 🛠️</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    value={item.qty} 
                    onChange={e => handleItemChange(idx, 'qty', e.target.value)} 
                    placeholder="Qty" 
                    className="w-[60px] h-8 text-xs text-center font-mono bg-background rounded-lg" 
                  />
                  <Input 
                    type="number" 
                    value={item.unit_price} 
                    onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                    placeholder="Rate" 
                    className="w-[90px] h-8 text-xs text-right font-mono bg-background rounded-lg" 
                  />
                  <span className="w-[100px] text-right font-mono text-xs font-extrabold text-foreground px-2">
                    ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(idx)} className="h-8 w-8 text-rose-500 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Bill / Invoice Attachment Section */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 rounded-2xl border-2 border-amber-500/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <Label className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    Attach Workshop &amp; Vendor Bills ({existingBills.length + billFiles.length} Attached)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Upload single or multiple invoice photos/PDFs — auto-attaches to Expenses &amp; Cashbook</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/40 text-[10px] font-bold">
                Multi-Bill Sync
              </Badge>
            </div>

            {/* List of Existing & Newly Attached Bills */}
            {(existingBills.length > 0 || billFiles.length > 0) && (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {/* Existing bills from database */}
                {existingBills.map((b, idx) => (
                  <div key={`existing-${idx}`} className="flex items-center justify-between p-2.5 bg-background/90 rounded-xl border border-amber-500/40 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[220px]">
                          {b.name || `Saved Invoice #${idx + 1}`}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Saved on Server
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(b.url, '_blank')}
                          className="h-7 text-[11px] font-bold rounded-lg border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingBill(idx)}
                        className="h-7 w-7 p-0 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                        title="Remove saved bill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Newly selected files */}
                {billFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 bg-background/90 rounded-xl border border-emerald-500/40 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[220px]">
                          {file.name}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Ready to upload ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNewBillFile(idx)}
                      className="h-7 w-7 p-0 text-rose-400 hover:bg-rose-500/20 rounded-lg shrink-0"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone for Selecting / Adding More Bills */}
            <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-xl p-3 text-center bg-background/60 hover:bg-amber-500/5 transition-all relative cursor-pointer group">
              <input 
                type="file" 
                multiple
                accept="image/*,application/pdf" 
                onChange={handleFilesChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <span>
                  {existingBills.length > 0 || billFiles.length > 0 
                    ? '+ Click to attach more bills / invoices (select multiple)' 
                    : 'Click to Browse or Take Photo of Bills / Invoices (Select Multiple JPG, PNG, PDF)'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-2xl border border-border/50 text-xs">
            <div className="space-x-4">
              <span className="text-muted-foreground">Parts: <strong className="text-foreground font-mono">₹{partsCost.toLocaleString('en-IN')}</strong></span>
              <span className="text-muted-foreground">Labour: <strong className="text-foreground font-mono">₹{labourCost.toLocaleString('en-IN')}</strong></span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground mr-2 font-bold uppercase text-[10px]">Grand Total:</span>
              <strong className="text-base font-mono font-black text-primary">₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={saving} className="rounded-xl font-bold">
              {saving ? 'Saving Job Card...' : jobCard ? 'Save Changes' : 'Create Job Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
