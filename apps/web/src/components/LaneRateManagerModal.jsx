import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Trash2, ArrowRight, IndianRupee, MapPin, 
  Truck, Clock, Check, Copy, Share2, Sparkles, RefreshCw, X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  laneRateClient, parseRateInput, formatRateBadge, formatRateDisplay 
} from '@/lib/laneRateClient.js';

export default function LaneRateManagerModal({ isOpen, onClose, onLanesUpdated }) {
  const [lanes, setLanes] = useState([]);
  const [editingLane, setEditingLane] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('');
  const [minRateInput, setMinRateInput] = useState('');
  const [maxRateInput, setMaxRateInput] = useState('');
  const [vehicleType, setVehicleType] = useState('32FT Container (SXL/MXL)');
  const [transitHours, setTransitHours] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');

  const loadLanes = () => {
    const list = laneRateClient.getLanes();
    setLanes(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadLanes();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingLane(null);
    setOrigin('Hyderabad');
    setDestination('');
    setMinRateInput('');
    setMaxRateInput('');
    setVehicleType('32FT Container (SXL/MXL)');
    setTransitHours('');
    setDistanceKm('');
    setNotes('');
    setIsFormOpen(false);
  };

  const startEdit = (lane) => {
    setEditingLane(lane);
    setOrigin(lane.origin || 'Hyderabad');
    setDestination(lane.destination || '');
    setMinRateInput(lane.min_rate ? String(lane.min_rate >= 1000 ? lane.min_rate / 1000 : lane.min_rate) : '');
    setMaxRateInput(lane.max_rate ? String(lane.max_rate >= 1000 ? lane.max_rate / 1000 : lane.max_rate) : '');
    setVehicleType(lane.vehicle_type || '32FT Container (SXL/MXL)');
    setTransitHours(lane.transit_hours || '');
    setDistanceKm(lane.distance_km ? String(lane.distance_km) : '');
    setNotes(lane.notes || '');
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      toast.error('Please specify both Origin and Destination');
      return;
    }

    const minParsed = parseRateInput(minRateInput);
    const maxParsed = parseRateInput(maxRateInput || minRateInput);

    if (minParsed <= 0) {
      toast.error('Please specify a valid minimum price (e.g., 26 for 26K or 26000)');
      return;
    }

    const laneData = {
      id: editingLane?.id,
      origin: origin.trim(),
      destination: destination.trim(),
      min_rate: minParsed,
      max_rate: Math.max(minParsed, maxParsed),
      vehicle_type: vehicleType,
      transit_hours: transitHours.trim() || '16 - 24 Hrs',
      distance_km: parseFloat(distanceKm) || 0,
      notes: notes.trim()
    };

    const res = laneRateClient.saveLane(laneData);
    setLanes(res.allLanes);
    onLanesUpdated?.(res.allLanes);
    toast.success(`Lane ${laneData.origin} ➔ ${laneData.destination} saved! Rate: ₹${minParsed.toLocaleString('en-IN')} - ₹${Math.max(minParsed, maxParsed).toLocaleString('en-IN')}`);
    resetForm();
  };

  const handleDelete = (id, label) => {
    if (!window.confirm(`Are you sure you want to delete the lane ${label}?`)) return;
    const res = laneRateClient.deleteLane(id);
    setLanes(res.allLanes);
    onLanesUpdated?.(res.allLanes);
    toast.info(`Lane ${label} deleted`);
  };

  const handleCopyQuote = (lane) => {
    const text = laneRateClient.generateWhatsAppQuote(lane);
    navigator.clipboard.writeText(text);
    toast.success(`Quote for ${lane.origin} ➔ ${lane.destination} copied to clipboard!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2.5 font-mono">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold border border-amber-500/30">
                  ₹
                </span>
                General Lane Spot Rates & Quick Quote Matrix
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Configure your typical corridor pricing (e.g. Hyderabad to Hubli: 26–29k) to quote customers instantly over call or WhatsApp.
              </DialogDescription>
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (isFormOpen) {
                  resetForm();
                } else {
                  resetForm();
                  setIsFormOpen(true);
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 shrink-0"
            >
              {isFormOpen ? <X className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              {isFormOpen ? 'Close Form' : 'Add New Lane'}
            </Button>
          </div>
        </DialogHeader>

        {/* ── Add / Edit Lane Form ────────────────────────────────────────── */}
        {isFormOpen && (
          <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4 my-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                {editingLane ? `Edit Lane: ${editingLane.origin} ➔ ${editingLane.destination}` : 'Configure New General Lane'}
              </span>
              <span className="text-[11px] text-slate-400">
                Tip: Enter <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-400 font-mono">26</code> for ₹26,000 or <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-400 font-mono">29</code> for ₹29,000
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400">Origin City *</label>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  required
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Destination City *</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Hubli"
                  required
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                  <span>Min Price (k or ₹) *</span>
                  {minRateInput && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      = ₹{parseRateInput(minRateInput).toLocaleString('en-IN')}
                    </span>
                  )}
                </label>
                <Input
                  value={minRateInput}
                  onChange={(e) => setMinRateInput(e.target.value)}
                  placeholder="e.g. 26 or 26000"
                  required
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-amber-300 font-mono font-black"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                  <span>Max Price (k or ₹) *</span>
                  {maxRateInput && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      = ₹{parseRateInput(maxRateInput).toLocaleString('en-IN')}
                    </span>
                  )}
                </label>
                <Input
                  value={maxRateInput}
                  onChange={(e) => setMaxRateInput(e.target.value)}
                  placeholder="e.g. 29 or 29000"
                  required
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-amber-300 font-mono font-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400">Vehicle Category</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
                >
                  <option value="32FT Container (SXL/MXL)">32FT Container (SXL / MXL)</option>
                  <option value="32FT MXL Container (18.5T)">32FT MXL Container (18.5 MT)</option>
                  <option value="32FT SXL Container (14.5T)">32FT SXL Container (14.5 MT)</option>
                  <option value="24FT Container (8.5T)">24FT Container (8.5 MT)</option>
                  <option value="Open 10-Tyre (20T)">Open 10-Tyre Body (20 MT)</option>
                  <option value="Any FTL Container">Any FTL Dedicated Truck</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Transit Duration</label>
                <Input
                  value={transitHours}
                  onChange={(e) => setTransitHours(e.target.value)}
                  placeholder="e.g. 18 - 22 Hrs"
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Highway Distance (KM)</label>
                <Input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g. 580"
                  className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400">Dispatcher & Toll Remarks (Optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. NH50 via Raichur; Toll: ₹1,850; High return load availability from Hubli"
                className="bg-slate-950 border-slate-800 text-xs h-9 mt-1 rounded-xl text-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={resetForm} className="text-xs text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl">
                {editingLane ? 'Update Lane Rate' : 'Save Lane to Matrix'}
              </Button>
            </div>
          </form>
        )}

        {/* ── Registered Lanes Table ────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>REGISTERED GENERAL LANES ({lanes.length})</span>
            <span>SPOT RATE RANGE (Colloquial & INR)</span>
          </div>

          <div className="border border-slate-800/90 rounded-2xl overflow-hidden shadow-inner bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 text-[11px] font-bold border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">LANE CORRIDOR</th>
                    <th className="py-2.5 px-3">VEHICLE TYPE</th>
                    <th className="py-2.5 px-3">SPOT PRICE RANGE</th>
                    <th className="py-2.5 px-3">TRANSIT</th>
                    <th className="py-2.5 px-3">NOTES / TOLL</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {lanes.map((lane) => {
                    const badge = formatRateBadge(lane.min_rate, lane.max_rate);
                    return (
                      <tr key={lane.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-black text-white text-sm">
                            <span className="text-slate-300">{lane.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300">{lane.destination}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {lane.vehicle_type}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs font-mono">
                              ₹{badge}
                            </span>
                            <div className="text-[10px] text-slate-400 font-sans">
                              ₹{(lane.min_rate || 0).toLocaleString('en-IN')} - ₹{(lane.max_rate || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-medium">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{lane.transit_hours || '18-24 Hrs'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={lane.notes}>
                          {lane.notes || '—'}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyQuote(lane)}
                              title="Copy WhatsApp Quote"
                              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg text-xs"
                            >
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Quote
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(lane)}
                              title="Edit Lane"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(lane.id, `${lane.origin} ➔ ${lane.destination}`)}
                              title="Delete Lane"
                              className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-800 flex flex-row items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all lanes to standard factory corridors?')) {
                const defs = laneRateClient.resetDefaults();
                setLanes(defs);
                onLanesUpdated?.(defs);
                toast.success('Reset to standard corridor defaults');
              }
            }}
            className="border-slate-800 text-slate-400 hover:text-white text-xs rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
