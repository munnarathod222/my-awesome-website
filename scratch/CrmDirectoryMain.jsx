import React, { useState, useMemo, useEffect } from 'react';

// Helpers
function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    if (typeof val === 'string' && val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [String(val).trim()].filter(Boolean);
  }
}

// Robust Google Maps link extraction from any field or embedded notes string
function extractGoogleMapsUrl(contact) {
  if (!contact) return '';
  const directFields = [
    contact.google_map_link,
    contact.location_url,
    contact.maps_url,
    contact.map_url,
    contact.google_maps_url,
    contact.map_link
  ];
  for (const f of directFields) {
    if (f && typeof f === 'string' && f.trim() && (f.includes('maps') || f.includes('goo.gl'))) {
      const trimmed = f.trim();
      const m = trimmed.match(/https?:\/\/[^\s"'<>\]]+/i);
      if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
      return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }
  }
  if (contact.notes && typeof contact.notes === 'string') {
    const m = contact.notes.match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)\/[^\s"'<>\]]+/i);
    if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
    const locMatch = contact.notes.match(/\[Location:\s*([^\s\]]+)\]/i);
    if (locMatch) {
      const u = locMatch[1].trim();
      return u.startsWith('http') ? u : `https://${u}`;
    }
  }
  if (contact.physical_address && typeof contact.physical_address === 'string' && (contact.physical_address.includes('goo.gl') || contact.physical_address.includes('maps'))) {
    const m = contact.physical_address.match(/https?:\/\/[^\s"'<>\]]+/i);
    if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
  }
  for (const k of Object.keys(contact)) {
    const val = contact[k];
    if (typeof val === 'string' && (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps'))) {
      const m = val.match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)[^\s"'<>\]]+/i);
      if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
    }
  }
  return '';
}

// Clean address by stripping embedded [Location: https://...] tags
function cleanPhysicalAddress(contact) {
  let addr = contact.physical_address || '';
  if (addr.startsWith('http://') || addr.startsWith('https://')) {
    addr = '';
  }
  if (!addr && contact.notes) {
    // If no address, see if notes has plain text address before or after Location:
    const cleanNotes = contact.notes.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '').trim();
    if (cleanNotes && cleanNotes.length < 80 && !cleanNotes.includes('\n')) {
      addr = cleanNotes;
    }
  }
  return addr.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '').trim() || '-';
}

// Exact classification mapping from contact fields to the 8 official Main Groups
function getContactMainGroup(contact) {
  if (!contact) return "1. Fleet Repairs & Services";
  const mgRaw = (contact.main_group || '').trim();
  const mgLower = mgRaw.toLowerCase();

  // If already assigned an exact group number or title
  if (mgLower.startsWith('1') || mgLower.includes('fleet repairs') || mgLower.includes('workshop')) return "1. Fleet Repairs & Services";
  if (mgLower.startsWith('2') || mgLower.includes('corporate') || mgLower.includes('warehouse')) return "2. Corporate & Warehouses";
  if (mgLower.startsWith('3') || mgLower.includes('finance') || mgLower.includes('insurance')) return "3. Finance & Insurance";
  if (mgLower.startsWith('4') || mgLower.includes('tyre') || mgLower.includes('fuel') || mgLower.includes('fastag')) return "4. Tyres, Fuel & FASTag";
  if (mgLower.startsWith('5') || mgLower.includes('transport network') || mgLower.includes('broker') || mgLower.includes('transporter')) return "5. Transport Network";
  if (mgLower.startsWith('6') || mgLower.includes('drivers') || mgLower.includes('driver') || mgLower.includes('staff')) return "6. Drivers & Staff";
  if (mgLower.startsWith('7') || mgLower.includes('parts') || mgLower.includes('spare') || mgLower.includes('accessories')) return "7. Parts & Accessories";
  if (mgLower.startsWith('8') || mgLower.includes('infrastructure') || mgLower.includes('support') || mgLower.includes('rto')) return "8. Infrastructure & Support";

  // Dynamic Inference from category, type, and company name keywords
  const type = ((contact.primary_category || '') + ' ' + (contact.contact_type || '') + ' ' + (contact.company_name || '') + ' ' + (contact.notes || '')).toLowerCase();

  if (type.includes('puncture') || type.includes('puncher') || type.includes('tyre') || type.includes('tire') || type.includes('fuel') || type.includes('diesel') || type.includes('petrol') || type.includes('fastag') || type.includes('hpcl') || type.includes('bpcl') || type.includes('iocl')) {
    return "4. Tyres, Fuel & FASTag";
  }

  if (type.includes('mechanic') || type.includes('garage') || type.includes('electrician') || type.includes('bodywork') || type.includes('welding') || type.includes('hydraulics') || type.includes('spring') || type.includes('towing') || type.includes('crane') || type.includes('washing') || type.includes('service centre') || type.includes('repairs') || type.includes('key maker') || type.includes('plastics')) {
    return "1. Fleet Repairs & Services";
  }

  if (type.includes('spare') || type.includes('parts') || type.includes('accessories') || type.includes('bearing') || type.includes('filter') || type.includes('showroom')) {
    return "7. Parts & Accessories";
  }

  if (type.includes('rto') || type.includes('parking') || type.includes('gps') || type.includes('weighbridge') || type.includes('dhaba') || type.includes('hotel') || type.includes('rest stop')) {
    return "8. Infrastructure & Support";
  }

  if (type.includes('warehouse') || type.includes('client') || type.includes('corporate') || type.includes('shipper') || type.includes('consignor') || type.includes('consignee') || type.includes('factory')) {
    return "2. Corporate & Warehouses";
  }

  if (type.includes('transporter') || type.includes('broker') || type.includes('truck broker') || type.includes('truck owner') || type.includes('fleet owner') || type.includes('lorry supplier')) {
    return "5. Transport Network";
  }

  if (type.includes('finance') || type.includes('bank') || type.includes('loan') || type.includes('insurance') || type.includes('claims') || type.includes('surveyor')) {
    return "3. Finance & Insurance";
  }

  if (type.includes('driver') || type.includes('staff') || type.includes('employee') || type.includes('supervisor') || type.includes('manager') || type.includes('mechanic helper') || type.includes('pilot')) {
    return "6. Drivers & Staff";
  }

  return "1. Fleet Repairs & Services";
}

export function CrmDirectoryMain({ imports, onOpenEdit, onOpenDetail, onOpenExport, onOpenScan, onOpenSos, onOpenApiSend, onOpenMultiShare }) {
  const { e, h, pb, toast, Input, Button, Badge } = imports;

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter Dimensions
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all' or group.title
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [filterPreferredOnly, setFilterPreferredOnly] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkParam, setBulkParam] = useState('');

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('contacts').getFullList({ sort: '-created', $autoCancel: false });
      setContacts(records || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      toast.error('Failed to load contacts directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Compute summary counts per main group using robust classification
  const groupCounts = useMemo(() => {
    const counts = { all: contacts.length };
    MAIN_GROUPS_CONFIG.forEach(g => {
      counts[g.title] = 0;
    });
    contacts.forEach(c => {
      const gTitle = getContactMainGroup(c);
      if (counts[gTitle] !== undefined) {
        counts[gTitle] = (counts[gTitle] || 0) + 1;
      } else {
        // Fallback match by number prefix
        const match = MAIN_GROUPS_CONFIG.find(g => g.title.startsWith(gTitle.substring(0, 2)));
        if (match) {
          counts[match.title] = (counts[match.title] || 0) + 1;
        }
      }
    });
    return counts;
  }, [contacts]);

  // Unique cities & areas for filter
  const cityOptions = useMemo(() => {
    const set = new Set();
    contacts.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return ['all', ...Array.from(set)];
  }, [contacts]);

  // Combinable Filtering Engine (AND across dimensions, OR within multi-selects)
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // 1. Text Search across name, phone, organisation, address, notes, GSTIN
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (contact.company_name || '').toLowerCase().includes(q);
        const matchesOrg = (contact.organisation_name || '').toLowerCase().includes(q);
        const matchesPhone = (contact.phone_number || '').toLowerCase().includes(q);
        const matchesAddr = (contact.physical_address || '').toLowerCase().includes(q);
        const matchesNotes = (contact.notes || '').toLowerCase().includes(q);
        const matchesGstin = (contact.gstin || '').toLowerCase().includes(q);
        const matchesCategory = (contact.primary_category || contact.contact_type || '').toLowerCase().includes(q);
        const matchesBrands = (contact.truck_brands || contact.truck_brand || '').toLowerCase().includes(q);
        
        if (!matchesName && !matchesOrg && !matchesPhone && !matchesAddr && !matchesNotes && !matchesGstin && !matchesCategory && !matchesBrands) {
          return false;
        }
      }

      // 2. Main Group Filter
      if (selectedGroup !== 'all') {
        const assignedGrp = getContactMainGroup(contact);
        if (assignedGrp !== selectedGroup) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory !== 'all') {
        const primary = contact.primary_category || contact.contact_type || '';
        const secondaries = safeParseArray(contact.secondary_categories);
        if (primary !== selectedCategory && !secondaries.includes(selectedCategory)) {
          return false;
        }
      }

      // 4. Truck Brand Filter
      if (selectedBrand !== 'all') {
        const brands = safeParseArray(contact.truck_brands);
        const legacyBrand = contact.truck_brand || '';
        const hasBrand = brands.includes(selectedBrand) || 
                         brands.includes('Universal / All Brands') || 
                         legacyBrand.includes(selectedBrand) ||
                         legacyBrand.toLowerCase().includes('common');
        if (!hasBrand) return false;
      }

      // 5. City Filter
      if (selectedCity !== 'all') {
        if ((contact.city || '') !== selectedCity) return false;
      }

      // 6. Emergency Available Flag
      if (filterEmergencyOnly && !contact.emergency_available) return false;

      // 7. Preferred Vendor Flag
      if (filterPreferredOnly && !contact.is_preferred) return false;

      return true;
    });
  }, [contacts, searchQuery, selectedGroup, selectedCategory, selectedBrand, selectedCity, filterEmergencyOnly, filterPreferredOnly]);

  // Selection toggles
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllFiltered = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  // Bulk operations handler
  const handleExecuteBulk = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    try {
      if (bulkAction === 'assign_brand' && bulkParam) {
        for (const id of selectedIds) {
          const c = contacts.find(x => x.id === id);
          const currentBrands = safeParseArray(c?.truck_brands);
          if (!currentBrands.includes(bulkParam)) {
            const updated = [...currentBrands, bulkParam];
            await pb.collection('contacts').update(id, {
              truck_brands: JSON.stringify(updated),
              truck_brand: updated.join(', ')
            }, { $autoCancel: false });
          }
        }
        toast.success(`Brand "${bulkParam}" assigned to ${selectedIds.length} contacts`);
      } else if (bulkAction === 'set_preferred') {
        for (const id of selectedIds) {
          await pb.collection('contacts').update(id, { is_preferred: 1 }, { $autoCancel: false });
        }
        toast.success(`Marked ${selectedIds.length} contacts as Preferred`);
      } else if (bulkAction === 'set_emergency') {
        for (const id of selectedIds) {
          await pb.collection('contacts').update(id, { emergency_available: 1 }, { $autoCancel: false });
        }
        toast.success(`Enabled 24/7 Emergency for ${selectedIds.length} contacts`);
      }
      setSelectedIds([]);
      setBulkAction('');
      setBulkParam('');
      fetchContacts();
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error('Failed to complete bulk update');
    }
  };

  // Delete Contact
  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Delete contact "${contact.company_name}"? This action cannot be undone.`)) {
      try {
        await pb.collection('contacts').delete(contact.id, { $autoCancel: false });
        toast.success('Contact deleted successfully');
        fetchContacts();
      } catch {
        toast.error('Failed to delete contact');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Summary Cards (8 Main Groups Counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {MAIN_GROUPS_CONFIG.map(g => {
          const isActive = selectedGroup === g.title;
          const count = groupCounts[g.title] || 0;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGroup(isActive ? 'all' : g.title);
                setSelectedCategory('all');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-primary/15 border-primary shadow-sm scale-[1.02]'
                  : 'bg-card/70 border-border/60 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground">{g.code}</span>
                <span className={`text-xs font-black px-1.5 py-0.2 rounded-full ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {count}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {g.title.replace(/^[0-9.]+\s*/, '')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Filter Toolbar */}
      <div className="bg-card/80 border border-border p-3.5 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">🔍</span>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, city, brand, GSTIN, notes..."
              className="pl-8 bg-background text-xs h-9 rounded-xl font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Truck Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-9 rounded-xl bg-background border border-border text-xs px-2.5 font-bold text-foreground focus:outline-none"
            >
              <option value="all">🚛 All Truck Brands</option>
              {TRUCK_BRANDS_MASTER.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* City Hub Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-9 rounded-xl bg-background border border-border text-xs px-2.5 font-bold text-foreground focus:outline-none"
            >
              <option value="all">📍 All Cities</option>
              {cityOptions.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Emergency & Preferred Toggles */}
            <button
              type="button"
              onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterEmergencyOnly
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🚨</span> 24/7 Night
            </button>

            <button
              type="button"
              onClick={() => setFilterPreferredOnly(!filterPreferredOnly)}
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterPreferredOnly
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>⭐</span> Preferred
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table View"
              >
                📋 Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid Card View"
              >
                🗂️ Cards
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (appears when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-primary">
                {selectedIds.length} Contact{selectedIds.length > 1 ? 's' : ''} Selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] underline text-muted-foreground hover:text-foreground ml-1"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="h-8 rounded-lg bg-background border border-border text-xs px-2 font-bold"
              >
                <option value="">Choose Bulk Action...</option>
                <option value="assign_brand">Assign Truck Brand</option>
                <option value="set_preferred">Mark as Preferred Vendor</option>
                <option value="set_emergency">Enable 24/7 Emergency</option>
              </select>

              {bulkAction === 'assign_brand' && (
                <select
                  value={bulkParam}
                  onChange={(e) => setBulkParam(e.target.value)}
                  className="h-8 rounded-lg bg-background border border-border text-xs px-2 font-bold text-amber-300"
                >
                  <option value="">Select Brand...</option>
                  {TRUCK_BRANDS_MASTER.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}

              <Button
                size="sm"
                onClick={handleExecuteBulk}
                className="h-8 text-xs font-bold bg-primary text-primary-foreground"
              >
                Apply Bulk Update
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenMultiShare(contacts.filter(c => selectedIds.includes(c.id)))}
                className="h-8 text-xs font-bold border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1"
              >
                <span>💬</span> WhatsApp Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Counter & Active Filter Pills */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong className="text-foreground">{filteredContacts.length}</strong> of{' '}
            <strong>{contacts.length}</strong> records
          </span>
          {selectedGroup !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold flex items-center gap-1">
              Group: {selectedGroup}
              <button type="button" onClick={() => setSelectedGroup('all')} className="hover:text-foreground">✕</button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold flex items-center gap-1">
              Brand: {selectedBrand}
              <button type="button" onClick={() => setSelectedBrand('all')} className="hover:text-foreground">✕</button>
            </span>
          )}
          {selectedCity !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold flex items-center gap-1">
              City: {selectedCity}
              <button type="button" onClick={() => setSelectedCity('all')} className="hover:text-foreground">✕</button>
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="bg-muted/30 border-b border-border/80">
                <tr>
                  <th className="w-[40px] text-center p-3">
                    <input
                      type="checkbox"
                      checked={filteredContacts.length > 0 && selectedIds.length === filteredContacts.length}
                      onChange={selectAllFiltered}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="text-left min-w-[200px] p-3">Company & Contact</th>
                  <th className="min-w-[130px] p-3 text-left">Category & Group</th>
                  <th className="min-w-[160px] p-3 text-left">Phone & WhatsApp</th>
                  <th className="min-w-[140px] p-3 text-left">Brands & Status</th>
                  <th className="min-w-[190px] p-3 text-left">Location & GPS</th>
                  <th className="text-right w-[140px] p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      Loading Transport CRM directory...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-muted-foreground">
                      <p className="font-bold text-sm">No contacts found matching the active filters.</p>
                      <p className="text-xs mt-1">Try resetting your brand, city or group selection.</p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => {
                    const isSelected = selectedIds.includes(contact.id);
                    const brands = safeParseArray(contact.truck_brands);
                    const phoneList = (contact.phone_number || '').split(/[,;\/\n]+/).map(p => p.trim()).filter(Boolean);
                    const mapsUrl = extractGoogleMapsUrl(contact);
                    const displayAddr = cleanPhysicalAddress(contact);
                    const assignedGroup = getContactMainGroup(contact);

                    return (
                      <tr
                        key={contact.id}
                        className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="text-center p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(contact.id)}
                            className="rounded text-primary focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Company & Person */}
                        <td className="p-3">
                          <div className="font-bold text-sm text-foreground hover:text-primary cursor-pointer" onClick={() => onOpenDetail(contact)}>
                            {contact.company_name}
                          </div>
                          {contact.organisation_name && contact.organisation_name !== contact.company_name && (
                            <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                              <span>🏢</span> {contact.organisation_name}
                            </div>
                          )}
                          {contact.designation && (
                            <div className="text-[11px] text-primary/80 font-medium">
                              {contact.designation}
                            </div>
                          )}
                          {contact.notes && !contact.notes.startsWith('http') && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5 italic">
                              {contact.notes.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '').trim()}
                            </div>
                          )}
                        </td>

                        {/* Category & Group */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-muted text-foreground border border-border block w-fit mb-1">
                            {contact.primary_category || contact.contact_type || 'Unclassified'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium block truncate max-w-[150px]">
                            {assignedGroup}
                          </span>
                        </td>

                        {/* Phone & WA */}
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {phoneList.map((ph, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${ph.replace(/\D/g, '')}`}
                                  className="text-xs font-bold text-foreground hover:text-primary transition-colors font-mono"
                                >
                                  {ph}
                                </a>
                                <a
                                  href={`https://wa.me/${ph.replace(/\D/g, '').startsWith('91') ? ph.replace(/\D/g, '') : '91' + ph.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                  title="WhatsApp"
                                >
                                  WA
                                </a>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Brands & Flags */}
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {brands.map(b => (
                              <span key={b} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {b}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {contact.emergency_available ? (
                              <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded" title="24/7 Breakdown Help">
                                🚨 24/7
                              </span>
                            ) : null}
                            {contact.is_preferred ? (
                              <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 px-1 py-0.2 rounded" title="Preferred Vendor">
                                ⭐ Top
                              </span>
                            ) : null}
                            {contact.roadside_service ? (
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1 py-0.2 rounded" title="Roadside Mobile Service">
                                🛠️ Road
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Location & GPS */}
                        <td className="p-3">
                          <div className="text-xs text-foreground truncate max-w-[210px] font-medium" title={displayAddr}>
                            {displayAddr}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {contact.city && (
                              <span className="text-[10px] text-muted-foreground font-semibold px-1 py-0.2 bg-muted rounded">
                                {contact.city}
                              </span>
                            )}
                            {mapsUrl ? (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors shadow-sm"
                                title="Open Google Maps Navigation"
                              >
                                <span>🗺️</span> View Map
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 italic">No GPS link</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="text-right p-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => onOpenApiSend(contact)}
                              className="h-8 px-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm"
                              title="1-Click Dispatch Contact Card via WhatsApp API"
                            >
                              <span>⚡</span> API
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onOpenDetail(contact)}
                              className="h-8 px-2 text-xs font-bold rounded-lg border-border"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onOpenEdit(contact)}
                              className="h-8 px-2 text-xs font-bold rounded-lg hover:bg-muted"
                              title="Edit Contact"
                            >
                              ✏️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredContacts.map(contact => {
            const isSelected = selectedIds.includes(contact.id);
            const brands = safeParseArray(contact.truck_brands);
            const phoneList = (contact.phone_number || '').split(/[,;\/\n]+/).map(p => p.trim()).filter(Boolean);
            const mapsUrl = extractGoogleMapsUrl(contact);
            const displayAddr = cleanPhysicalAddress(contact);
            const assignedGroup = getContactMainGroup(contact);

            return (
              <div
                key={contact.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-card/80 ${
                  isSelected ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border/80 hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(contact.id)}
                      className="mt-1 rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <h4
                        className="font-bold text-sm text-foreground truncate cursor-pointer hover:text-primary"
                        onClick={() => onOpenDetail(contact)}
                      >
                        {contact.company_name}
                      </h4>
                      {contact.organisation_name && contact.organisation_name !== contact.company_name && (
                        <p className="text-[11px] text-muted-foreground truncate font-medium">
                          {contact.organisation_name}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/80 font-medium">
                        {assignedGroup}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted text-foreground border border-border/80 shrink-0">
                    {contact.primary_category || contact.contact_type}
                  </span>
                </div>

                {/* Brands & Flags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {brands.map(b => (
                    <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {b}
                    </span>
                  ))}
                  {contact.emergency_available ? (
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                      🚨 24/7 Night
                    </span>
                  ) : null}
                  {contact.is_preferred ? (
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                      ⭐ Preferred
                    </span>
                  ) : null}
                </div>

                {/* Phone Numbers */}
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 space-y-1.5 text-xs">
                  {phoneList.map((ph, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <a href={`tel:${ph.replace(/\D/g, '')}`} className="font-mono font-bold text-foreground hover:text-primary flex items-center gap-1">
                        <span>📞</span> {ph}
                      </a>
                      <a
                        href={`https://wa.me/${ph.replace(/\D/g, '').startsWith('91') ? ph.replace(/\D/g, '') : '91' + ph.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </div>

                {/* Location */}
                <div className="text-xs text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="truncate max-w-[180px] font-medium" title={displayAddr}>{displayAddr}</span>
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shrink-0"
                    >
                      <span>🗺️</span> View Map
                    </a>
                  ) : null}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => onOpenApiSend(contact)}
                    className="flex-1 h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                  >
                    <span>⚡</span> 1-Click API
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenDetail(contact)}
                    className="h-8 px-2.5 text-xs font-bold rounded-xl"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenEdit(contact)}
                    className="h-8 px-2 text-xs font-bold rounded-xl"
                  >
                    ✏️
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
