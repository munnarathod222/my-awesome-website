import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, XCircle, Building2, Truck, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

export default function CustomerVehicleEligibilityModal({ isOpen, onClose, truck, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [eligibilityMap, setEligibilityMap] = useState({});

  useEffect(() => {
    if (isOpen && truck) {
      loadData();
    }
  }, [isOpen, truck]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all clients
      const clientsList = await pb.collection('clients').getFullList({
        sort: 'client_name',
        $autoCancel: false
      }).catch(() => []);

      setClients(clientsList);

      // 2. Fetch existing eligibility records for this truck
      let records = [];
      try {
        const apiRes = await apiServerClient.fetch(`/api/trucks/eligibility?truck_id=${truck.id}`);
        if (apiRes.ok) {
          const json = await apiRes.json();
          if (json.success && json.data) {
            records = json.data;
          }
        }
      } catch (e) {
        records = await pb.collection('customer_vehicle_eligibility').getFullList({
          filter: `truck_id = "${truck.id}" || truck_number = "${truck.truck_number}"`,
          $autoCancel: false
        }).catch(() => []);
      }

      const map = {};
      clientsList.forEach(clt => {
        const found = records.find(r => r.client_id === clt.id || (r.customer_name && r.customer_name.toLowerCase() === (clt.client_name || '').toLowerCase()));
        if (found) {
          map[clt.id] = {
            id: found.id,
            eligibility_status: found.eligibility_status || 'Approved',
            customer_vehicle_code: found.customer_vehicle_code || '',
            gps_integrated: found.gps_integrated === 1 || found.gps_integrated === true,
            valid_until: found.valid_until || '',
            remarks: found.remarks || ''
          };
        } else {
          // Default: Not Registered if not specifically empaneled
          map[clt.id] = {
            id: null,
            eligibility_status: truck.ownership_type === 'Owned' ? 'Approved' : 'Pending Approval',
            customer_vehicle_code: '',
            gps_integrated: true,
            valid_until: '',
            remarks: ''
          };
        }
      });

      setEligibilityMap(map);
    } catch (err) {
      console.error('Failed to load eligibility data:', err);
      toast.error('Could not load customer authorization records');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (clientId, newStatus) => {
    setEligibilityMap(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        eligibility_status: newStatus
      }
    }));
  };

  const handleFieldChange = (clientId, field, value) => {
    setEligibilityMap(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!truck) return;
    setSaving(true);
    try {
      const promises = clients.map(async (clt) => {
        const item = eligibilityMap[clt.id];
        if (!item) return;

        const payload = {
          id: item.id || undefined,
          truck_id: truck.id,
          truck_number: truck.truck_number,
          client_id: clt.id,
          customer_name: clt.client_name || clt.company_name,
          eligibility_status: item.eligibility_status,
          customer_vehicle_code: item.customer_vehicle_code || '',
          gps_integrated: item.gps_integrated ? 1 : 0,
          valid_until: item.valid_until || '',
          remarks: item.remarks || ''
        };

        try {
          await apiServerClient.fetch('/api/trucks/eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (apiErr) {
          if (item.id) {
            await pb.collection('customer_vehicle_eligibility').update(item.id, payload, { $autoCancel: false });
          } else {
            await pb.collection('customer_vehicle_eligibility').create(payload, { $autoCancel: false });
          }
        }
      });

      await Promise.all(promises);
      toast.success(`Customer eligibility saved for ${truck.truck_number}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save eligibility:', err);
      toast.error('Error saving customer authorization matrix');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved</Badge>;
      case 'Pending Approval':
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1"><Clock className="w-3 h-3 text-amber-400" /> Pending Approval</Badge>;
      case 'Under Inspection':
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1"><ShieldCheck className="w-3 h-3 text-blue-400" /> Under Inspection</Badge>;
      case 'Rejected':
        return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 gap-1"><XCircle className="w-3 h-3 text-rose-400" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground border-border">Not Registered</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-950 text-white border-slate-800 p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-mono tracking-tight flex items-center gap-2">
                  <span>{truck?.truck_number}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-sans border-slate-700">
                    {truck?.ownership_type === 'Attached' ? 'Market Attached' : truck?.ownership_type === 'AttachedFamily' ? 'Family Attached' : 'Company Owned'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Customer-Wise Vehicle Eligibility Matrix & Empanelment Permissions
                </DialogDescription>
              </div>
            </div>
            {truck?.subcontractor_name && (
              <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                Vendor: {truck.subcontractor_name}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Loading customer empanelment matrix...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No clients registered in the system yet.
          </div>
        ) : (
          <div className="space-y-4 py-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400">⚡ Production Rule:</strong> Even if a truck has valid RTO documents, it will only be selectable for dispatch if its status for the selected customer is <span className="text-emerald-400 font-bold">Approved</span>.
            </div>

            <div className="space-y-3">
              {clients.map(clt => {
                const conf = eligibilityMap[clt.id] || { eligibility_status: 'Approved' };
                const isApproved = conf.eligibility_status === 'Approved';

                return (
                  <div 
                    key={clt.id}
                    className={`p-3.5 rounded-xl border transition-all ${isApproved ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-slate-900/20 border-slate-800/60'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs uppercase font-mono">
                          {(clt.client_name || 'C').substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{clt.client_name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({clt.company_name || clt.client_type || 'Corporate'})</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {clt.city ? `${clt.city}, ` : ''}{clt.state || 'India'} • GST: {clt.gst_number || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {getStatusBadge(conf.eligibility_status)}
                        <Select
                          value={conf.eligibility_status}
                          onValueChange={(val) => handleStatusChange(clt.id, val)}
                        >
                          <SelectTrigger className="h-8 w-36 bg-slate-900 border-slate-700 text-xs text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                            <SelectItem value="Approved" className="text-emerald-400 font-semibold">Approved</SelectItem>
                            <SelectItem value="Pending Approval" className="text-amber-400">Pending Approval</SelectItem>
                            <SelectItem value="Under Inspection" className="text-blue-400">Under Inspection</SelectItem>
                            <SelectItem value="Rejected" className="text-rose-400">Rejected</SelectItem>
                            <SelectItem value="Not Registered" className="text-slate-400">Not Registered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Expandable fields when active */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                      <div>
                        <Label className="text-[10px] text-slate-400 uppercase">Customer Vehicle Code / Carrier Asset ID</Label>
                        <Input
                          placeholder="e.g. AMZ-TRK-9812"
                          value={conf.customer_vehicle_code || ''}
                          onChange={(e) => handleFieldChange(clt.id, 'customer_vehicle_code', e.target.value.toUpperCase())}
                          className="h-7 text-xs bg-slate-950 border-slate-800 mt-1 font-mono uppercase"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400 uppercase">Empanelment Valid Upto</Label>
                        <Input
                          type="date"
                          value={conf.valid_until || ''}
                          onChange={(e) => handleFieldChange(clt.id, 'valid_until', e.target.value)}
                          className="h-7 text-xs bg-slate-950 border-slate-800 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400 uppercase">Audit Remarks / Dock Clearance</Label>
                        <Input
                          placeholder="Passed safety inspection"
                          value={conf.remarks || ''}
                          onChange={(e) => handleFieldChange(clt.id, 'remarks', e.target.value)}
                          className="h-7 text-xs bg-slate-950 border-slate-800 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-slate-800 gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={saving || loading} className="bg-primary text-white font-bold gap-1.5 shadow-md">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Empanelment Matrix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
