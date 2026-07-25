import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  Plus, Search, Download, Users, Building2, Truck, AlertCircle,
  Camera, Contact2, Wrench, ShoppingBag, Landmark, ChevronDown,
  Network, UserCog, Phone, MapPin, Zap, Disc, Banknote, HandCoins, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge }     from '@/components/ui/badge';
import { Skeleton }  from '@/components/ui/skeleton';
import { format }    from 'date-fns';
import { toast }     from 'sonner';
import pb            from '@/lib/pocketbaseClient.js';
import { motion, AnimatePresence } from 'framer-motion';

import ContactFormModal     from '@/components/ContactFormModal.jsx';
import ContactDetailsModal  from '@/components/ContactDetailsModal.jsx';
import ContactActionsMenu   from '@/components/ContactActionsMenu.jsx';
import ContactExportModal   from '@/components/ContactExportModal.jsx';
import BusinessCardUploadModal from '@/components/BusinessCardUploadModal.jsx';
import { getPastedMapUrl }  from '@/lib/contactUtils.js';
import { openMapLocation }  from '@/lib/locationUtils.js';

/* ─── Contact type taxonomy ─────────────────────────────────────────────────── */
// Primary groups  →  which contact_type values they include
export const MAIN_GROUPS = [
  { key: 'All',         label: 'All Contacts',        icon: Users,    types: null   },
  { key: 'Client',      label: 'Corporate Clients',   icon: Building2,types: ['Client','Corporate'] },
  { key: 'Warehouse',   label: 'Warehouse Contacts',  icon: Landmark, types: ['Warehouse'] },
  { key: 'Employee',    label: 'Drivers & Employees', icon: Truck,    types: ['Driver','Employee','Supervisor','Manager'] },
  { key: 'Maintenance', label: 'Maintenance Network', icon: Wrench,   types: ['Mechanic','Showroom','Spare Parts','Electrician','Puncture Shop','Bodywork / Welding','Crane / Tow Truck','Hydraulics','Plastics','Washing Centre','RTO Agent'] },
  { key: 'Finance',     label: 'Finance & Banking',   icon: Banknote, types: ['Banking','Loan Agent'] },
  { key: 'Other',       label: 'Other Contacts',      icon: UserCog,  types: ['Other','Vendor'] },
];

// Sub-filters for Finance & Banking group
export const FINANCE_SUBS = [
  { key: 'all_fin',    label: 'All Banking & Loans', icon: Banknote,  types: ['Banking','Loan Agent'] },
  { key: 'Banking',    label: 'Bank Employees',     icon: CreditCard,types: ['Banking'] },
  { key: 'Loan Agent', label: 'Loan Agents',        icon: HandCoins, types: ['Loan Agent'] },
];

// Sub-filters only visible when "Maintenance Network" is active
export const MAINTENANCE_SUBS = [
  { key: 'all_maint',          label: 'All',                 icon: Network,    types: ['Mechanic','Showroom','Spare Parts','Electrician','Puncture Shop','Bodywork / Welding','Crane / Tow Truck','Hydraulics','Plastics','Washing Centre','RTO Agent','Other'] },
  { key: 'Mechanic',           label: 'Mechanics',           icon: Wrench,     types: ['Mechanic'] },
  { key: 'Electrician',        label: 'Electricians',        icon: Zap,        types: ['Electrician'] },
  { key: 'Puncture Shop',      label: 'Puncture Shops',    icon: Disc,       types: ['Puncture Shop'] },
  { key: 'Showroom',           label: 'Showrooms / Centres', icon: Landmark,   types: ['Showroom'] },
  { key: 'Spare Parts',        label: 'Spare Parts Shops',   icon: ShoppingBag,types: ['Spare Parts'] },
  { key: 'Bodywork / Welding', label: 'Bodywork & Welding',  icon: Wrench,     types: ['Bodywork / Welding'] },
  { key: 'Crane / Tow Truck',  label: 'Crane & Towing',      icon: Truck,      types: ['Crane / Tow Truck'] },
  { key: 'Hydraulics',         label: 'Hydraulics & Plastics', icon: Zap,      types: ['Hydraulics','Plastics'] },
  { key: 'Washing Centre',     label: 'Washing Centres',     icon: Network,    types: ['Washing Centre'] },
  { key: 'RTO Agent',          label: 'RTO Agents',          icon: Landmark,   types: ['RTO Agent'] },
  { key: 'Other',              label: 'Other Services',      icon: UserCog,    types: ['Other'] },
];

/* ─── Badge colour map ───────────────────────────────────────────────────────── */
const TYPE_BADGE = {
  'Client':             'bg-primary/10 text-primary border-primary/25',
  'Corporate':          'bg-primary/10 text-primary border-primary/25',
  'Warehouse':          'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'Driver':             'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
  'Employee':           'bg-teal-500/10 text-teal-400 border-teal-500/25',
  'Mechanic':           'bg-amber-500/10 text-amber-500 border-amber-500/25',
  'Electrician':        'bg-yellow-500/10 text-yellow-500 border-yellow-500/25',
  'Puncture Shop':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  'Showroom':           'bg-violet-500/10 text-violet-400 border-violet-500/25',
  'Spare Parts':        'bg-orange-500/10 text-orange-400 border-orange-500/25',
  'Bodywork / Welding': 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  'Crane / Tow Truck':  'bg-blue-500/10 text-blue-400 border-blue-500/25',
  'Hydraulics':         'bg-purple-500/10 text-purple-400 border-purple-500/25',
  'Plastics':           'bg-pink-500/10 text-pink-400 border-pink-500/25',
  'Washing Centre':     'bg-sky-500/10 text-sky-400 border-sky-500/25',
  'RTO Agent':          'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  'Vendor':             'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  'Banking':            'bg-green-500/10 text-green-400 border-green-500/25',
  'Loan Agent':         'bg-lime-500/10 text-lime-400 border-lime-500/25',
  'Other':              'bg-slate-500/10 text-slate-300 border-slate-500/25',
};
const getTypeBadge = (type) => (
  <Badge variant="outline" className={`rounded-lg font-bold shadow-sm ${TYPE_BADGE[type] || 'border-border/50'}`}>
    {type || 'Unknown'}
  </Badge>
);

/* ─── Pill button component ──────────────────────────────────────────────────── */
function Pill({ active, onClick, icon: Icon, label, count, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap
        ${active
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 bg-background border border-border/50'
        }`}
    >
      <Icon className={`w-3.5 h-3.5 ${active ? '' : accent || 'text-muted-foreground'}`} />
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function ContactsPage() {
  const [contacts,          setContacts]         = useState([]);
  const [loading,           setLoading]          = useState(true);
  const [error,             setError]            = useState(null);

  const [searchTerm,        setSearchTerm]       = useState('');
  const [activeGroup,       setActiveGroup]      = useState('All');      // main tab key
  const [maintSub,          setMaintSub]         = useState('all_maint');// sub-pill key
  const [warehouseSub,      setWarehouseSub]     = useState('all_wh');   // warehouse sub-pill key
  const [financeSub,        setFinanceSub]       = useState('all_fin');  // finance sub-pill key

  const [isFormOpen,        setIsFormOpen]       = useState(false);
  const [isDetailsOpen,     setIsDetailsOpen]    = useState(false);
  const [isExportOpen,      setIsExportOpen]     = useState(false);
  const [isAiModalOpen,     setIsAiModalOpen]    = useState(false);
  const [selectedContact,   setSelectedContact]  = useState(null);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('contacts').getFullList({ sort: '-created', $autoCancel: false });
      setContacts(records);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    pb.collection('contacts').subscribe('*', fetchContacts);
    return () => pb.collection('contacts').unsubscribe('*');
  }, []);

  /* ── Delete ────────────────────────────────────────────────────────────── */
  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete ${contact.company_name}?`)) return;
    try {
      await pb.collection('contacts').delete(contact.id, { $autoCancel: false });
      toast.success('Contact deleted');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  /* ── Unique Warehouse List ─────────────────────────────────────────────── */
  const warehouseList = useMemo(() => {
    const list = contacts
      .filter(c => c.contact_type === 'Warehouse' || Boolean(c.warehouse_name))
      .map(c => c.warehouse_name)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [contacts]);

  /* ── Filtering logic ───────────────────────────────────────────────────── */
  const activeTypesAllowed = useMemo(() => {
    if (activeGroup === 'All') return null; // null = no type filter
    if (activeGroup === 'Maintenance') {
      const sub = MAINTENANCE_SUBS.find(s => s.key === maintSub);
      return sub?.types ?? MAINTENANCE_SUBS[0].types;
    }
    if (activeGroup === 'Finance') {
      const sub = FINANCE_SUBS.find(s => s.key === financeSub);
      return sub?.types ?? FINANCE_SUBS[0].types;
    }
    return MAIN_GROUPS.find(g => g.key === activeGroup)?.types ?? null;
  }, [activeGroup, maintSub, financeSub]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (activeGroup === 'Warehouse') {
        const isWh = c.contact_type === 'Warehouse' || Boolean(c.warehouse_name);
        if (!isWh) return false;
        if (warehouseSub !== 'all_wh' && c.warehouse_name !== warehouseSub) return false;
      } else if (activeTypesAllowed && !activeTypesAllowed.includes(c.contact_type)) {
        return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.company_name?.toLowerCase().includes(q) ||
          c.phone_number?.toLowerCase().includes(q) ||
          c.gstin?.toLowerCase().includes(q) ||
          c.physical_address?.toLowerCase().includes(q) ||
          c.warehouse_name?.toLowerCase().includes(q) ||
          c.designation?.toLowerCase().includes(q) ||
          c.bank_name?.toLowerCase().includes(q) ||
          c.ifsc_code?.toLowerCase().includes(q) ||
          c.loan_type?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contacts, activeGroup, activeTypesAllowed, warehouseSub, financeSub, searchTerm]);

  // Counts per group for badges
  const groupCounts = useMemo(() => {
    const counts = {};
    MAIN_GROUPS.forEach(g => {
      if (g.key === 'All') {
        counts[g.key] = contacts.length;
      } else if (g.key === 'Warehouse') {
        counts[g.key] = contacts.filter(c => c.contact_type === 'Warehouse' || Boolean(c.warehouse_name)).length;
      } else {
        counts[g.key] = contacts.filter(c => g.types.includes(c.contact_type)).length;
      }
    });
    MAINTENANCE_SUBS.forEach(s => {
      counts[s.key] = contacts.filter(c => s.types.includes(c.contact_type)).length;
    });
    FINANCE_SUBS.forEach(s => {
      counts[s.key] = contacts.filter(c => s.types.includes(c.contact_type)).length;
    });
    return counts;
  }, [contacts]);

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6"
    >
      <Helmet><title>Contacts Directory | Dashboard</title></Helmet>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Contact2 className="w-7 h-7 text-primary" />
            </div>
            Contacts Directory
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-balance">
            Manage your network of clients, employees, and maintenance vendors in separated groups.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <Button variant="outline" onClick={() => setIsExportOpen(true)} className="bg-card shadow-sm rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="secondary" onClick={() => setIsAiModalOpen(true)} className="shadow-sm rounded-xl">
            <Camera className="w-4 h-4 mr-2" /> AI Scan
          </Button>
          <Button onClick={() => { setSelectedContact(null); setIsFormOpen(true); }} className="shadow-sm rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      {/* ── KPI Bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      val: contacts.length,                                                          cls: '' },
          { label: 'Clients',    val: contacts.filter(c => c.contact_type === 'Client').length,                 cls: 'text-primary' },
          { label: 'Employees',  val: contacts.filter(c => ['Driver','Employee'].includes(c.contact_type)).length, cls: 'text-emerald-500' },
          { label: 'Maintenance',val: contacts.filter(c => ['Mechanic','Showroom','Spare Parts','Electrician','Puncture Shop'].includes(c.contact_type)).length, cls: 'text-amber-500' },
        ].map(k => (
          <Card key={k.label} className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-extrabold tabular-nums ${k.cls}`}>{k.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Card ────────────────────────────────────────────────────── */}
      <Card className="shadow-soft border-border/50 bg-card rounded-3xl overflow-hidden">

        {/* ── Tab + Search header ───────────────────────────────────────── */}
        <CardHeader className="p-5 sm:p-6 border-b border-border/40 bg-secondary/10 space-y-3">

          {/* Primary tab row */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {MAIN_GROUPS.map(g => (
                <Pill
                  key={g.key}
                  active={activeGroup === g.key}
                  onClick={() => { setActiveGroup(g.key); if (g.key !== 'Maintenance') setMaintSub('all_maint'); if (g.key !== 'Finance') setFinanceSub('all_fin'); }}
                  icon={g.icon}
                  label={g.label}
                  count={groupCounts[g.key]}
                  accent={g.key === 'Maintenance' ? 'text-amber-400' : g.key === 'Finance' ? 'text-green-400' : g.key === 'Employee' ? 'text-emerald-400' : g.key === 'Client' ? 'text-primary' : undefined}
                />
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, GSTIN..."
                className="pl-10 bg-background h-11 rounded-xl shadow-sm border-border/50 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Secondary sub-pill row — shows when Maintenance or Warehouse is active */}
          <AnimatePresence>
            {activeGroup === 'Maintenance' && (
              <motion.div
                key="maint-subs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1 pl-1 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest self-center mr-1">Filter:</span>
                  {MAINTENANCE_SUBS.map(s => (
                    <Pill
                      key={s.key}
                      active={maintSub === s.key}
                      onClick={() => setMaintSub(s.key)}
                      icon={s.icon}
                      label={s.label}
                      count={groupCounts[s.key]}
                      accent="text-amber-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeGroup === 'Warehouse' && (
              <motion.div
                key="wh-subs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1 pl-1 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest self-center mr-1">Select Warehouse:</span>
                  <Pill
                    key="all_wh"
                    active={warehouseSub === 'all_wh'}
                    onClick={() => setWarehouseSub('all_wh')}
                    icon={Landmark}
                    label="All Warehouses"
                    count={groupCounts['Warehouse']}
                    accent="text-amber-400"
                  />
                  {warehouseList.map(whName => {
                    const count = contacts.filter(c => (c.contact_type === 'Warehouse' || c.warehouse_name) && c.warehouse_name === whName).length;
                    return (
                      <Pill
                        key={whName}
                        active={warehouseSub === whName}
                        onClick={() => setWarehouseSub(whName)}
                        icon={Building2}
                        label={whName}
                        count={count}
                        accent="text-amber-400"
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeGroup === 'Finance' && (
              <motion.div
                key="fin-subs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1 pl-1 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest self-center mr-1">Filter:</span>
                  {FINANCE_SUBS.map(s => (
                    <Pill
                      key={s.key}
                      active={financeSub === s.key}
                      onClick={() => setFinanceSub(s.key)}
                      icon={s.icon}
                      label={s.label}
                      count={groupCounts[s.key]}
                      accent="text-green-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <CardContent className="p-0">
          {error ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-lg font-medium text-foreground">{error}</p>
              <Button variant="outline" onClick={fetchContacts} className="mt-6 rounded-xl shadow-sm">Retry Connection</Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-b-border/50">
                      <TableHead className="font-semibold text-muted-foreground pl-6 py-4">Name / Company</TableHead>
                      <TableHead className="font-semibold text-muted-foreground py-4">Contact Info</TableHead>
                      <TableHead className="font-semibold text-muted-foreground py-4">Tax ID (GSTIN)</TableHead>
                      <TableHead className="font-semibold text-muted-foreground py-4">Role Type</TableHead>
                      <TableHead className="font-semibold text-muted-foreground py-4">Date Added</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground pr-6 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b-border/30">
                          <TableCell className="pl-6 py-4"><Skeleton className="h-5 w-40 mb-2" /><Skeleton className="h-4 w-56" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-7 w-20 rounded-lg" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right pr-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-lg font-medium text-foreground">No contacts found.</p>
                          <p className="text-sm mt-1">Adjust your search or add a new entry.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContacts.map(contact => {
                        const mapsUrl = getPastedMapUrl(contact);
                        return (
                          <TableRow key={contact.id} className="hover:bg-muted/30 transition-colors border-b-border-border/40">
                            <TableCell className="pl-6 py-4">
                              <p className="font-bold text-sm text-foreground">{contact.company_name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <p className="text-xs text-muted-foreground truncate max-w-[200px] font-medium" title={contact.physical_address}>
                                  {contact.physical_address}
                                </p>
                                {mapsUrl && (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openMapLocation(mapsUrl);
                                    }} 
                                    className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-colors shrink-0 p-1 hover:bg-rose-500/10 rounded-md active:scale-95 cursor-pointer"
                                    title="Open Google Maps GPS Navigation"
                                  >
                                    <MapPin className="w-3.5 h-3.5 fill-rose-500/10" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="text-sm font-semibold text-foreground">{contact.phone_number}</p>
                              {contact.email && <p className="text-xs text-muted-foreground mt-1 font-medium">{contact.email}</p>}
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-mono text-sm font-medium bg-secondary/40 px-2 py-1 rounded-md border border-border/50">
                                {contact.gstin || 'N/A'}
                              </span>
                            </TableCell>
                             <TableCell className="py-4">
                              <div className="flex flex-col gap-1 items-start">
                                {getTypeBadge(contact.contact_type)}
                                {contact.warehouse_name && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                    <Building2 className="w-3 h-3" />
                                    {contact.warehouse_name}
                                  </span>
                                )}
                                {contact.designation && (
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    {contact.designation}
                                  </span>
                                )}
                                {contact.contact_type === 'Mechanic' && contact.truck_brand && (
                                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
                                    {contact.truck_brand}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-muted-foreground py-4">
                              {format(new Date(contact.created), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right pr-6 py-4">
                              <ContactActionsMenu
                                contact={contact}
                                onView={(c) => { setSelectedContact(c); setIsDetailsOpen(true); }}
                                onEdit={(c) => { setSelectedContact(c); setIsFormOpen(true); }}
                                onDelete={handleDelete}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View (Hidden on desktop) */}
              <div className="block md:hidden divide-y divide-border/30">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-3">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))
                ) : filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Users className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    No contacts found.
                  </div>
                ) : (
                  filteredContacts.map(contact => {
                    const mobileMapsUrl = getPastedMapUrl(contact);
                    return (
                      <div key={contact.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-base text-foreground truncate">{contact.company_name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-muted-foreground truncate">{contact.physical_address || 'No Address'}</p>
                              {mobileMapsUrl && (
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMapLocation(mobileMapsUrl);
                                  }} 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 rounded-md border border-rose-500/20 shrink-0 transition-all cursor-pointer"
                                  title="Open Google Maps GPS Navigation"
                                >
                                  <MapPin className="w-3.5 h-3.5 fill-rose-500/10 shrink-0" />
                                  <span>Map</span>
                                </button>
                              )}
                            </div>
                          </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="text-right flex flex-col items-end">
                            {getTypeBadge(contact.contact_type)}
                            {contact.contact_type === 'Mechanic' && contact.truck_brand && (
                              <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-wide">
                                {contact.truck_brand}
                              </span>
                            )}
                          </div>
                          <ContactActionsMenu
                            contact={contact}
                            onView={(c) => { setSelectedContact(c); setIsDetailsOpen(true); }}
                            onEdit={(c) => { setSelectedContact(c); setIsFormOpen(true); }}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-border/20">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold tracking-wider">Phone</span>
                          {contact.phone_number ? (
                            <a 
                              href={`tel:${contact.phone_number}`} 
                              className="font-bold text-primary hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              {contact.phone_number}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold tracking-wider">GSTIN</span>
                          <span className="font-mono text-foreground mt-0.5 block">{contact.gstin || '—'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-1">
                        {contact.email ? (
                          <div className="text-xs truncate min-w-0 flex-1">
                            <span className="text-muted-foreground text-[9px] uppercase font-semibold tracking-wider mr-1.5">Email:</span>
                            <span className="text-foreground font-medium truncate">{contact.email}</span>
                          </div>
                        ) : (
                          <div className="flex-1" />
                        )}
                        
                        {contact.phone_number && (
                          <div className="flex items-center gap-2 mt-1 sm:mt-0 shrink-0">
                            <a 
                              href={`tel:${contact.phone_number}`}
                              className="h-8 px-3 rounded-lg border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center gap-1 text-xs font-semibold"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                            
                            <a 
                              href={`https://wa.me/${contact.phone_number.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="h-8 px-3 rounded-lg border border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-500 flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.416 1.46 5.561-.002 10.093-4.53 10.097-10.093.002-2.697-1.047-5.234-2.952-7.14C17.29 1.475 14.757.429 12.058.429c-5.56 0-10.093 4.528-10.097 10.091-.001 1.83.499 3.626 1.447 5.205L2.35 21.575l6.297-1.652z" />
                              </svg>
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contact={selectedContact}
        onSuccess={fetchContacts}
      />
      <ContactDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        contact={selectedContact}
      />
      <ContactExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
      <BusinessCardUploadModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={fetchContacts}
      />
    </motion.div>
  );
}