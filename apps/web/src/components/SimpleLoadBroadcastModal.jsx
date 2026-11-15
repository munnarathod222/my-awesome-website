import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Send, MessageSquare, Copy, Check, CheckCircle2, Truck, 
  MapPin, Calendar, Clock, User, Phone, Search, Users, 
  ExternalLink, Sparkles, Building2, ChevronRight, Plus,
  Share2, ArrowRight, Zap, CheckSquare, Square
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { sendWhatsAppNotification, getWhatsAppApiStatus } from '@/lib/whatsappClient.js';

// Pre-configured default sub-transporters: empty by default (no dummy data)
const DEFAULT_TRANSPORTERS = [];

const QUICK_TRUCK_TYPES = [
  '32FT MXL',
  '32FT SXL',
  '32FT HQ',
  '24FT Container',
  '24FT Open',
  '22FT Container',
  '20FT Container',
  '19FT Container',
  '17FT Canter',
  '14FT Canter',
  'Taurus (10W)',
  '12 Wheeler (25 MT)',
  '14 Wheeler (30 MT)',
  '16 Wheeler (35 MT)',
  'Trailer 40FT HQ',
  'Trailer 40FT Flatbed',
  'Tata Ace / Pickup',
  'Part Load (LTL)'
];

const QUICK_WEIGHTS = [
  '1 MT',
  '2 MT',
  '2.5 MT',
  '3.5 MT',
  '5 MT',
  '7 MT',
  '9 MT',
  '12 MT',
  '15 MT',
  '16 MT',
  '18 MT',
  '20 MT',
  '22 MT',
  '25 MT',
  '28 MT',
  '30 MT',
  '35 MT',
  '40 MT',
  'Part Load',
  'Full Truck Load (FTL)'
];
const QUICK_PICKUPS = [
  'Hyderabad - KD Supply Chain (P&G DC), Kothur - 509228',
  'Hyderabad - Tukkuguda Hub',
  'Hyderabad - Patancheru Industrial Area',
  'Warangal Industrial Area',
  'Bhiwandi Logistics Park',
  'Chennai DC'
];
const QUICK_DROPS = [
  'Bangalore',
  'Hyderabad',
  'Vijayawada',
  'Bhiwandi / Mumbai',
  'Chennai',
  'Pune',
  'Kolkata'
];
const QUICK_CLIENTS = ['P&G', 'Delhivery', 'Reliance Retail', 'Amazon', 'Flipkart', 'General Market'];

export default function SimpleLoadBroadcastModal({ isOpen, onClose, initialData = null }) {
  // Form State
  const [pickup, setPickup] = useState('Hyderabad - KD Supply Chain (P&G DC), Kothur - 509228');
  const [drop, setDrop] = useState('Bangalore');
  const [truckType, setTruckType] = useState('32FT MXL');
  const [weight, setWeight] = useState('18 MT');
  const [client, setClient] = useState('P&G');
  const [reportingTime, setReportingTime] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}, 12:00 PM`;
  });
  const [offerRate, setOfferRate] = useState('Best Quote / Market Rate');

  // Sub-Transporters list & selection: load real subcontractors and user-saved brokers
  const [transporters, setTransporters] = useState(() => {
    try {
      const saved = localStorage.getItem('jbc_custom_brokers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom manual phone input
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  // Multi-send queue index
  const [queueIndex, setQueueIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [apiSending, setApiSending] = useState(false);
  const [apiStatus, setApiStatus] = useState({ configured: false });

  // Initialize data if opened from a trip row
  useEffect(() => {
    if (initialData) {
      if (initialData.origin || initialData.pickup) setPickup(initialData.origin || initialData.pickup);
      if (initialData.destination || initialData.drop) setDrop(initialData.destination || initialData.drop);
      if (initialData.truck_type || initialData.vehicle_type) setTruckType(initialData.truck_type || initialData.vehicle_type);
      if (initialData.client_name) setClient(initialData.client_name);
      if (initialData.date || initialData.reporting_date) {
        setReportingTime(`${initialData.date || initialData.reporting_date}, 12:00 PM`);
      }
    }
  }, [initialData]);

  // Load registered sub-transporters from PocketBase
  useEffect(() => {
    if (!isOpen) return;
    
    // Check WhatsApp API status
    getWhatsAppApiStatus().then(st => setApiStatus(st)).catch(() => {});

    // Fetch live subcontractor vendors
    pb.collection('subcontractor_vendors').getFullList({ sort: '-created', $autoCancel: false })
      .then(records => {
        if (records && records.length > 0) {
          const mapped = records.map(r => ({
            id: r.id,
            name: r.subcontractor_name || r.company_name || 'Subcontractor',
            owner: r.owner_name || '',
            phone: (r.phone || '').replace(/[^0-9]/g, '').slice(-10),
            city: r.city || r.routes_operated || '',
            trucks: r.truck_numbers || `${r.attached_trucks_count || 1} Attached Trucks`
          })).filter(r => r.phone && r.phone.length === 10);

          let savedCustom = [];
          try {
            const s = localStorage.getItem('jbc_custom_brokers');
            if (s) savedCustom = JSON.parse(s);
          } catch {}

          const map = new Map();
          [...mapped, ...savedCustom].forEach(item => {
            if (item.phone && !map.has(item.phone)) map.set(item.phone, item);
          });
          const all = Array.from(map.values());
          setTransporters(all);
          if (all.length > 0) {
            setSelectedIds(prev => prev.length > 0 ? prev : all.slice(0, 3).map(a => a.id));
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Reset queue when selection changes
  useEffect(() => {
    setQueueIndex(0);
  }, [selectedIds]);

  // Filtered transporters
  const filteredTransporters = useMemo(() => {
    if (!searchQuery.trim()) return transporters;
    const q = searchQuery.toLowerCase();
    return transporters.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.owner.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.city.toLowerCase().includes(q)
    );
  }, [transporters, searchQuery]);

  // Selected transporter objects
  const selectedTransporters = useMemo(() => {
    return transporters.filter(t => selectedIds.includes(t.id));
  }, [transporters, selectedIds]);

  // Add custom contact
  const handleAddCustomContact = () => {
    const clean = customPhone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    const newContact = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || `Transporter (${clean.slice(-4)})`,
      owner: customName.trim() || 'Broker',
      phone: clean.slice(-10),
      city: 'Direct Contact',
      trucks: 'Market Vehicle'
    };
    setTransporters(prev => {
      const updated = [newContact, ...prev.filter(p => p.phone !== newContact.phone)];
      try {
        localStorage.setItem('jbc_custom_brokers', JSON.stringify(updated.filter(u => String(u.id).startsWith('custom_'))));
      } catch {}
      return updated;
    });
    setSelectedIds(prev => [newContact.id, ...prev]);
    setCustomName('');
    setCustomPhone('');
    toast.success(`Added ${newContact.name} to recipient list`);
  };

  // Toggle selection
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransporters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransporters.map(t => t.id));
    }
  };

  // Format message for a specific transporter
  const generateBroadcastMessage = (transporterName = '') => {
    const greeting = transporterName ? `Hi ${transporterName.toUpperCase()},` : 'Hi TRANSPORTER / BROKER,';
    
    return `${greeting}

A new load has been created based on your account settings.

📍 Pickup: ${pickup}
📦 Drop: ${drop}
🚚 Vehicle: ${truckType}
📦 Tonnage: ${weight}
👤 Client: ${client}
🕒 Reporting: ${reportingTime}
💰 Rate: ${offerRate}

Please check the load details and contact us immediately to confirm vehicle placement:
📞 Vinod Rathod (Jai Bhavani Cargo): +91 7794072244

Jai Bhavani Cargo Logistics Operations Desk`;
  };

  // Format phone for WhatsApp
  const formatPhoneForWa = (phone) => {
    const digits = String(phone || '').replace(/[^0-9]/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  // Single Direct Send
  const handleSendSingleWhatsApp = (transporter) => {
    const phone = formatPhoneForWa(transporter.phone);
    if (!phone) {
      toast.error(`Invalid phone number for ${transporter.name}`);
      return;
    }
    const text = encodeURIComponent(generateBroadcastMessage(transporter.name));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Queue Send (1-by-1 fast cycle)
  const handleSendNextInQueue = () => {
    if (selectedTransporters.length === 0) {
      toast.error('Please select at least one sub-transporter');
      return;
    }
    const current = selectedTransporters[queueIndex % selectedTransporters.length];
    handleSendSingleWhatsApp(current);
    
    const nextIdx = (queueIndex + 1) % selectedTransporters.length;
    setQueueIndex(nextIdx);
    
    if (queueIndex + 1 >= selectedTransporters.length) {
      toast.success(`Completed WhatsApp queue for all ${selectedTransporters.length} contacts!`);
    } else {
      toast.info(`Opened WhatsApp for ${current.name}. Ready for next (${nextIdx + 1} of ${selectedTransporters.length})`);
    }
  };

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    const sampleMsg = generateBroadcastMessage('TRANSPORTER');
    navigator.clipboard.writeText(sampleMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success('Copied Delhivery-style load alert to clipboard!');
  };

  // Copy Message + All Phone Numbers
  const handleCopyAll = () => {
    const phones = selectedTransporters.map(t => t.phone).join(', ');
    const sampleMsg = generateBroadcastMessage('TRANSPORTER');
    const combined = `=== JBC LOAD BROADCAST ===\nRECIPIENTS: ${phones}\n\n${sampleMsg}`;
    navigator.clipboard.writeText(combined);
    toast.success(`Copied load alert and ${selectedTransporters.length} phone numbers!`);
  };

  // Automated API Broadcast
  const handleSendApiBroadcast = async () => {
    if (selectedTransporters.length === 0) {
      toast.error('Please select at least one sub-transporter');
      return;
    }
    setApiSending(true);
    let successCount = 0;

    for (const t of selectedTransporters) {
      try {
        const phone = formatPhoneForWa(t.phone);
        const res = await sendWhatsAppNotification({
          phone: phone,
          userName: t.name,
          campaignName: 'driver_dispatch',
          params: [
            t.name,
            pickup,
            drop,
            truckType,
            weight,
            client,
            reportingTime
          ]
        });
        if (res && res.success !== false) {
          successCount++;
        }
      } catch (e) {
        console.error('Error dispatching to', t.name, e);
      }
    }

    setApiSending(false);
    toast.success(`Dispatched WhatsApp load alert to ${successCount} of ${selectedTransporters.length} sub-transporters!`);
  };

  const previewMessage = useMemo(() => {
    const sampleName = selectedTransporters[0]?.name || 'SHARMA TRANSPORT';
    return generateBroadcastMessage(sampleName);
  }, [pickup, drop, truckType, weight, client, reportingTime, offerRate, selectedTransporters]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card border-border/80 shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                  Broadcast Load to Sub-Transporters
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    Delhivery Style
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Quickly send professional WhatsApp load alerts to sub-transporters & market brokers.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyMessage}
                className="h-8 text-xs font-bold gap-1 rounded-xl border-border hover:bg-muted"
                title="Copy formatted text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* LEFT COLUMN: 6 SIMPLE INPUT FIELDS (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-muted/20 border border-border/50 rounded-2xl p-3.5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1. Load Specifications
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">Fill in 30 seconds</span>
              </div>

              {/* FROM & TO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> From (Pickup)
                  </Label>
                  <Input 
                    value={pickup} 
                    onChange={e => setPickup(e.target.value)}
                    placeholder="e.g. Hyderabad - P&G DC, Kothur"
                    className="h-9 text-xs bg-background border-border/70 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['P&G DC Kothur', 'Tukkuguda Hub', 'Warangal'].map(p => (
                      <button 
                        key={p} 
                        type="button" 
                        onClick={() => setPickup(p)} 
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary text-secondary-foreground font-medium transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> To (Drop)
                  </Label>
                  <Input 
                    value={drop} 
                    onChange={e => setDrop(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="h-9 text-xs bg-background border-border/70 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['Bangalore', 'Vijayawada', 'Bhiwandi', 'Chennai'].map(d => (
                      <button 
                        key={d} 
                        type="button" 
                        onClick={() => setDrop(d)} 
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary text-secondary-foreground font-medium transition-all"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TRUCK TYPE INPUT & EXTENDED PILLS */}
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-primary" /> Vehicle Type:
                  </Label>
                  <span className="text-[11px] font-mono text-primary font-black bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {truckType || 'Not specified'}
                  </span>
                </div>
                <Input 
                  value={truckType}
                  onChange={e => setTruckType(e.target.value)}
                  placeholder="Select pill below or type custom vehicle type..."
                  className="h-8 text-xs bg-background border-border/70 rounded-xl font-medium"
                />
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-0.5">
                  {QUICK_TRUCK_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTruckType(t)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                        truckType === t 
                          ? 'bg-primary text-primary-foreground shadow-sm scale-105' 
                          : 'bg-background border border-border/70 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* TONNAGE / WEIGHT INPUT & EXTENDED PILLS */}
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>📦</span> Weight / Tonnage (Custom & Presets):
                  </Label>
                  <span className="text-[11px] font-mono text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {weight || 'Not specified'}
                  </span>
                </div>
                <Input 
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="Type custom weight (e.g. 18 MT, 12.5 MT, 3500 KGS, Part Load...)"
                  className="h-8 text-xs bg-background border-border/70 rounded-xl font-medium"
                />
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-0.5">
                  {QUICK_WEIGHTS.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeight(w)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                        weight === w 
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-sm scale-105' 
                          : 'bg-background border border-border/70 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLIENT & REPORTING TIME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" /> Client Name
                  </Label>
                  <Input 
                    value={client} 
                    onChange={e => setClient(e.target.value)}
                    placeholder="e.g. P&G / Delhivery"
                    className="h-9 text-xs bg-background border-border/70 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['P&G', 'Delhivery', 'Reliance'].map(c => (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => setClient(c)} 
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary text-secondary-foreground font-medium transition-all"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Reporting Date & Time
                  </Label>
                  <Input 
                    value={reportingTime} 
                    onChange={e => setReportingTime(e.target.value)}
                    placeholder="e.g. 2026-11-15, 12:00 PM"
                    className="h-9 text-xs bg-background border-border/70 rounded-xl font-mono"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['Today, 12:00 PM', 'Today, 04:00 PM', 'Tomorrow, 09:00 AM'].map(rt => (
                      <button 
                        key={rt} 
                        type="button" 
                        onClick={() => setReportingTime(rt)} 
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary text-secondary-foreground font-medium transition-all"
                      >
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RATE / REMARKS */}
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <Label className="text-xs font-bold text-foreground">
                  Offer Freight Rate / Terms (Optional)
                </Label>
                <Input 
                  value={offerRate} 
                  onChange={e => setOfferRate(e.target.value)}
                  placeholder="e.g. Best Quote / Negotiable / ₹42,000 Advance 80%"
                  className="h-9 text-xs bg-background border-border/70 rounded-xl"
                />
              </div>
            </div>

            {/* LIVE WHATSAPP PREVIEW CARD */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0b141a] p-3.5 shadow-inner space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Message Preview (Delhivery Style)
                </span>
                <span className="text-[10px] text-slate-400">Exact layout delivered</span>
              </div>
              <pre className="text-[11px] sm:text-xs text-slate-100 font-sans whitespace-pre-wrap leading-relaxed select-all">
                {previewMessage}
              </pre>
            </div>
          </div>

          {/* RIGHT COLUMN: RECIPIENT SELECTION & DISPATCH CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> 2. Select Sub-Transporters
                </span>
                <Badge variant="secondary" className="text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20">
                  {selectedTransporters.length} selected
                </Badge>
              </div>

              {/* SEARCH & SELECT ALL */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search transporter, city, phone..."
                    className="h-8 pl-8 text-xs bg-background border-border/70 rounded-xl"
                  />
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={handleSelectAll}
                  className="h-8 text-[11px] font-bold rounded-xl border-border shrink-0"
                >
                  {selectedIds.length === filteredTransporters.length ? 'Clear All' : 'Select All'}
                </Button>
              </div>

              {/* ADD CUSTOM PHONE QUICK INPUT */}
              <div className="flex items-center gap-1.5 bg-muted/30 p-2 rounded-xl border border-border/50">
                <Input 
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Broker Name (Opt)"
                  className="h-7 text-[11px] bg-background border-border/60 rounded-lg flex-1"
                />
                <Input 
                  value={customPhone}
                  onChange={e => setCustomPhone(e.target.value)}
                  placeholder="10-digit Phone"
                  className="h-7 text-[11px] bg-background border-border/60 rounded-lg w-28 font-mono"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddCustomContact}
                  className="h-7 px-2 text-[11px] font-bold rounded-lg shrink-0"
                  title="Add to current load alert list"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* TRANSPORTER LIST */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredTransporters.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-1.5">
                    <Users className="w-6 h-6 mx-auto text-muted-foreground/60" />
                    <p className="text-xs font-bold text-foreground">No Sub-Transporters Found</p>
                    <p className="text-[11px] text-muted-foreground">
                      Add brokers above using Name & 10-digit Phone, or register them in the Vendor Tracker.
                    </p>
                  </div>
                ) : (
                  filteredTransporters.map(t => {
                    const isChecked = selectedIds.includes(t.id);
                    return (
                      <div 
                        key={t.id}
                        onClick={() => handleToggleSelect(t.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isChecked 
                            ? 'bg-primary/5 border-primary/40 shadow-sm' 
                            : 'bg-card border-border/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <button type="button" className="text-primary shrink-0 focus:outline-none">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {t.owner && `${t.owner} • `}{t.city && `${t.city} • `}
                              <span className="font-mono text-primary font-medium">{t.phone}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendSingleWhatsApp(t);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 transition-transform active:scale-95"
                          title={`Direct send to ${t.name} on WhatsApp`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* DISPATCH ACTION BUTTONS */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              {/* PRIMARY 1-CLICK DISPATCH BUTTON */}
              {selectedTransporters.length === 1 ? (
                <Button 
                  onClick={() => handleSendSingleWhatsApp(selectedTransporters[0])}
                  className="w-full h-11 text-xs sm:text-sm font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send WhatsApp to {selectedTransporters[0].name.slice(0, 20)}...
                </Button>
              ) : (
                <div className="space-y-1.5">
                  <Button 
                    onClick={handleSendNextInQueue}
                    disabled={selectedTransporters.length === 0}
                    className="w-full h-11 text-xs sm:text-sm font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Open Next WhatsApp ({queueIndex + 1} of {selectedTransporters.length})
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Cycles through your {selectedTransporters.length} selected contacts with 1 click each!
                  </p>
                </div>
              )}

              {/* SECONDARY ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyAll}
                  className="h-9 text-xs font-bold rounded-xl border-border hover:bg-muted gap-1.5"
                  title="Copy message text and phone numbers for WhatsApp Groups"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text & Phones
                </Button>

                {apiStatus?.configured ? (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleSendApiBroadcast}
                    disabled={apiSending || selectedTransporters.length === 0}
                    className="h-9 text-xs font-bold rounded-xl border-primary/40 text-primary hover:bg-primary/10 gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {apiSending ? 'Broadcasting...' : 'Send via API'}
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyMessage}
                    className="h-9 text-xs font-bold rounded-xl border-border hover:bg-muted gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Copy Clean Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
