import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  Plus, Search, Download, Users, Building2, Truck, AlertCircle,
  Camera, Contact2, Wrench, ShoppingBag, Landmark, ChevronDown,
  Network, UserCog, Phone, MapPin, Zap, Disc, Banknote, HandCoins, CreditCard,
  MessageSquare, CheckSquare, Square
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
import TransportCrmWhatsAppShareModal from '@/components/TransportCrmWhatsAppShareModal.jsx';
import { getPastedMapUrl }  from '@/lib/contactUtils.js';
import { openMapLocation }  from '@/lib/locationUtils.js';

/* ─── Contact type taxonomy ─────────────────────────────────────────────────── */
export const MAIN_GROUPS = [
  { key: 'All',         label: 'All Contacts',                  icon: Users,     types: null   },
  { key: 'TruckOwner',  label: 'Truck Owners & Transporters',   icon: Truck,     types: ['Truck Owner', 'Transporter'] },
  { key: 'Client',      label: 'Corporate Clients',             icon: Building2, types: ['Client', 'Corporate'] },
  { key: 'Warehouse',   label: 'Warehouse Contacts',            icon: Landmark,  types: ['Warehouse'] },
  { key: 'Employee',    label: 'Drivers & Employees',           icon: Users,     types: ['Driver', 'Employee', 'Supervisor', 'Manager'] },
  { key: 'Maintenance', label: 'Maintenance Network',           icon: Wrench,    types: ['Mechanic', 'Showroom', 'Spare Parts', 'Electrician', 'Puncture Shop', 'Bodywork / Welding', 'Crane / Tow Truck', 'Hydraulics', 'Plastics', 'Washing Centre', 'RTO Agent'] },
  { key: 'Finance',     label: 'Finance & Banking',             icon: Banknote,  types: ['Banking', 'Loan Agent'] },
  { key: 'Other',       label: 'Other Contacts & Vendors',      icon: UserCog,   types: ['Other', 'Vendor'] },
];

export const TRUCK_OWNER_SUBS = [
  { key: 'all_truck',  label: 'All Owners & Transporters', icon: Truck,     types: ['Truck Owner', 'Transporter'] },
  { key: 'Truck Owner',label: 'Truck Owners',              icon: Truck,     types: ['Truck Owner'] },
  { key: 'Transporter',label: 'Transporters / Agencies',   icon: Building2, types: ['Transporter'] },
];

export const FINANCE_SUBS = [
  { key: 'all_fin',    label: 'All Banking & Loans', icon: Banknote,   types: ['Banking', 'Loan Agent'] },
  { key: 'Banking',    label: 'Bank Managers',      icon: CreditCard, types: ['Banking'] },
  { key: 'Loan Agent', label: 'Loan Agents / DSAs', icon: HandCoins,  types: ['Loan Agent'] },
];

export const MAINTENANCE_SUBS = [
  { key: 'all_maint',          label: 'All Maintenance Network', icon: Network,    types: ['Mechanic', 'Showroom', 'Spare Parts', 'Electrician', 'Puncture Shop', 'Bodywork / Welding', 'Crane / Tow Truck', 'Hydraulics', 'Plastics', 'Washing Centre', 'RTO Agent', 'Other'] },
  { key: 'Mechanic',           label: 'Mechanics',               icon: Wrench,     types: ['Mechanic'] },
  { key: 'Electrician',        label: 'Electricians',            icon: Zap,        types: ['Electrician'] },
  { key: 'Puncture Shop',      label: 'Puncture Shops',        icon: Disc,       types: ['Puncture Shop'] },
  { key: 'Showroom',           label: 'Showrooms & Services',    icon: Landmark,   types: ['Showroom'] },
  { key: 'Spare Parts',        label: 'Spare Parts Shops',       icon: ShoppingBag,types: ['Spare Parts'] },
  { key: 'Bodywork / Welding', label: 'Bodywork & Welding',      icon: Wrench,     types: ['Bodywork / Welding'] },
  { key: 'Crane / Tow Truck',  label: 'Crane & Towing',          icon: Truck,      types: ['Crane / Tow Truck'] },
  { key: 'Hydraulics',         label: 'Hydraulics & Plastics',   icon: Zap,        types: ['Hydraulics', 'Plastics'] },
  { key: 'Washing Centre',     label: 'Washing Centres',         icon: Network,    types: ['Washing Centre'] },
  { key: 'RTO Agent',          label: 'RTO Agents',              icon: Landmark,   types: ['RTO Agent'] },
];

const TYPE_BADGE = {
  'Truck Owner':        'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold',
  'Transporter':        'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-bold',
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

function Pill({ active, onClick, icon: Icon, label, count, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap
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

export default function ContactsPage() {
  const [contacts,          setContacts]         = useState([]);
  const [loading,           setLoading]          = useState(true);
  const [error,             setError]            = useState(null);

  // Multi-Select Checkboxes State
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  const [searchTerm,        setSearchTerm]       = useState('');
  const [activeGroup,       setActiveGroup]      = useState('All');
  const [truckSub,          setTruckSub]         = useState('all_truck');
  const [maintSub,          setMaintSub]         = useState('all_maint');
  const [warehouseSub,      setWarehouseSub]     = useState('all_wh');
  const [financeSub,        setFinanceSub]       = useState('all_fin');

  const [isFormOpen,        setIsFormOpen]       = useState(false);
  const [isDetailsOpen,     setIsDetailsOpen]    = useState(false);
  const [isExportOpen,      setIsExportOpen]     = useState(false);
  const [isAiModalOpen,     setIsAiModalOpen]    = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedContact,   setSelectedContact]  = useState(null);

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

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete ${contact.company_name}?`)) return;
    try {
      await pb.collection('contacts').delete(contact.id, { $autoCancel: false });
      toast.success('Contact deleted');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const activeTypesAllowed = useMemo(() => {
    if (activeGroup === 'All') return null;
    if (activeGroup === 'TruckOwner') {
      const sub = TRUCK_OWNER_SUBS.find(s => s.key === truckSub);
      return sub?.types ?? TRUCK_OWNER_SUBS[0].types;
    }
    if (activeGroup === 'Maintenance') {
      const sub = MAINTENANCE_SUBS.find(s => s.key === maintSub);
      return sub?.types ?? MAINTENANCE_SUBS[0].types;
    }
    if (activeGroup === 'Finance') {
      const sub = FINANCE_SUBS.find(s => s.key === financeSub);
      return sub?.types ?? FINANCE_SUBS[0].types;
    }
    return MAIN_GROUPS.find(g => g.key === activeGroup)?.types ?? null;
  }, [activeGroup, truckSub, maintSub, financeSub]);

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
          c.designation?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contacts, activeGroup, activeTypesAllowed, warehouseSub, financeSub, searchTerm]);

  // Selected Contacts List object for WhatsApp Broadcast
  const selectedContactsList = useMemo(() => {
    return contacts.filter(c => selectedContactIds.includes(c.id)).map(c => ({
      id: c.id,
      company_name: c.company_name || 'Contact',
      primary_contact: c.designation ? `${c.company_name} (${c.designation})` : c.company_name,
      phone: c.phone_number || '',
      email: c.email || '',
      outstanding_amount: Number(c.outstanding_amount || 0),
      credit_limit: Number(c.credit_limit || 0)
    }));
  }, [contacts, selectedContactIds]);

  const toggleSelectContact = (id) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllContacts = () => {
    if (selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

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
    TRUCK_OWNER_SUBS.forEach(s => {
      counts[s.key] = contacts.filter(c => s.types.includes(c.contact_type)).length;
    });
    MAINTENANCE_SUBS.forEach(s => {
      counts[s.key] = contacts.filter(c => s.types.includes(c.contact_type)).length;
    });
    FINANCE_SUBS.forEach(s => {
      counts[s.key] = contacts.filter(c => s.types.includes(c.contact_type)).length;
    });
    return counts;
  }, [contacts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 relative pb-24 font-sans"
    >
      <Helmet><title>Contacts Directory | Dashboard</title></Helmet>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Contact2 className="w-7 h-7 text-primary" />
            </div>
            Contacts Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Organized directory for Truck Owners, Transporters, Corporate Clients, Drivers, Maintenance Network, Bank Agents &amp; Warehouses.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedContactIds.length > 0 && (
            <Button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp ({selectedContactIds.length})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsAiModalOpen(true)}
            className="rounded-xl border-border/80 shadow-sm text-xs font-bold"
          >
            <Camera className="w-4 h-4 mr-1.5 text-primary" />
            Scan Visiting Card
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsExportOpen(true)}
            className="rounded-xl border-border/80 shadow-sm text-xs font-bold"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </Button>

          <Button
            onClick={() => { setSelectedContact(null); setIsFormOpen(true); }}
            className="rounded-xl shadow-md font-bold text-xs bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            + Add Contact
          </Button>
        </div>
      </div>

      {/* Filter Tabs Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur rounded-3xl shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MAIN_GROUPS.map(g => (
                <Pill
                  key={g.key}
                  active={activeGroup === g.key}
                  onClick={() => { setActiveGroup(g.key); setSelectedContactIds([]); }}
                  icon={g.icon}
                  label={g.label}
                  count={groupCounts[g.key]}
                />
              ))}
            </div>

            <div className="relative shrink-0 w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search name, phone, GSTIN..."
                className="pl-9 bg-background/80 rounded-xl h-10 text-xs"
              />
            </div>
          </div>

          {/* Sub-Group Navigation Tabs */}
          {activeGroup === 'TruckOwner' && (
            <div className="flex gap-2 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none">
              {TRUCK_OWNER_SUBS.map(sub => (
                <Pill
                  key={sub.key}
                  active={truckSub === sub.key}
                  onClick={() => setTruckSub(sub.key)}
                  icon={sub.icon}
                  label={sub.label}
                  count={groupCounts[sub.key]}
                  accent="text-amber-400"
                />
              ))}
            </div>
          )}

          {activeGroup === 'Maintenance' && (
            <div className="flex gap-2 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none">
              {MAINTENANCE_SUBS.map(sub => (
                <Pill
                  key={sub.key}
                  active={maintSub === sub.key}
                  onClick={() => setMaintSub(sub.key)}
                  icon={sub.icon}
                  label={sub.label}
                  count={groupCounts[sub.key]}
                  accent="text-amber-400"
                />
              ))}
            </div>
          )}

          {activeGroup === 'Finance' && (
            <div className="flex gap-2 overflow-x-auto pt-3 border-t border-border/40 scrollbar-none">
              {FINANCE_SUBS.map(sub => (
                <Pill
                  key={sub.key}
                  active={financeSub === sub.key}
                  onClick={() => setFinanceSub(sub.key)}
                  icon={sub.icon}
                  label={sub.label}
                  count={groupCounts[sub.key]}
                  accent="text-emerald-400"
                />
              ))}
            </div>
          )}
        </CardHeader>

        {/* Desktop Table View */}
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b-border/50">
                  <TableHead className="w-10 text-center py-4 pl-4">
                    <input 
                      type="checkbox"
                      checked={filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length}
                      onChange={toggleSelectAllContacts}
                      className="rounded border-slate-700 accent-primary cursor-pointer w-4 h-4"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4">Name / Company</TableHead>
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
                      <TableCell colSpan={7} className="p-4"><Skeleton className="h-6 w-full rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                      <Users className="w-8 h-8 opacity-40 mx-auto mb-2" />
                      <p className="text-sm font-medium">No contacts found in this category.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map(contact => {
                    const isSelected = selectedContactIds.includes(contact.id);
                    return (
                      <TableRow key={contact.id} className={`hover:bg-muted/30 transition-colors border-b-border/40 ${isSelected ? 'bg-primary/10' : ''}`}>
                        <TableCell className="text-center pl-4 py-4">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectContact(contact.id)}
                            className="rounded border-slate-700 accent-primary cursor-pointer w-4 h-4"
                          />
                        </TableCell>

                        <TableCell className="py-4">
                          <p className="font-bold text-sm text-foreground">{contact.company_name}</p>
                          {contact.physical_address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                              {contact.physical_address}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-4">
                          <p className="text-sm font-semibold text-foreground">{contact.phone_number}</p>
                          {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
                        </TableCell>

                        <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                          {contact.gstin || '—'}
                        </TableCell>

                        <TableCell className="py-4">
                          {getTypeBadge(contact.contact_type)}
                          {contact.designation && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {contact.designation}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-4 text-xs text-muted-foreground">
                          {contact.created ? format(new Date(contact.created), 'dd MMM yyyy') : '—'}
                        </TableCell>

                        <TableCell className="text-right pr-6 py-4">
                          <ContactActionsMenu
                            contact={contact}
                            onView={() => { setSelectedContact(contact); setIsDetailsOpen(true); }}
                            onEdit={() => { setSelectedContact(contact); setIsFormOpen(true); }}
                            onDelete={() => handleDelete(contact)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-border/40">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <p className="text-xs font-medium">No contacts found in this category.</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <div key={contact.id} className={`p-4 flex items-start justify-between gap-3 ${isSelected ? 'bg-primary/10' : ''}`}>
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="rounded border-slate-700 accent-primary cursor-pointer w-4 h-4 mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{contact.company_name}</span>
                          {getTypeBadge(contact.contact_type)}
                        </div>
                        <p className="text-xs font-semibold text-primary">{contact.phone_number}</p>
                        {contact.physical_address && (
                          <p className="text-[11px] text-muted-foreground">{contact.physical_address}</p>
                        )}
                      </div>
                    </div>
                    <ContactActionsMenu
                      contact={contact}
                      onView={() => { setSelectedContact(contact); setIsDetailsOpen(true); }}
                      onEdit={() => { setSelectedContact(contact); setIsFormOpen(true); }}
                      onDelete={() => handleDelete(contact)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
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
        contacts={filteredContacts}
      />

      <BusinessCardUploadModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={fetchContacts}
      />

      <TransportCrmWhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        selectedContacts={selectedContactsList}
      />
    </motion.div>
  );
}