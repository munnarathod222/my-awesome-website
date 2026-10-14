const fs = require('fs');
const babel = require('@babel/parser');

// 1. Read pre-compiled base elements
const header = fs.readFileSync('scratch/clean_header.js', 'utf8');
const helpers = fs.readFileSync('scratch/helpers_clean.js', 'utf8');
const actionDropdown = fs.readFileSync('scratch/Ta_component.js', 'utf8');
const exportModal = fs.readFileSync('scratch/Aa_component.js', 'utf8');
const visitingCardModal = fs.readFileSync('scratch/Oa_clean.js', 'utf8');
const apiSendModal = fs.readFileSync('scratch/Fa_clean.js', 'utf8');
const breakdownHub = fs.readFileSync('scratch/existing_breakdown_hub.js', 'utf8');

// 2. Read CRM Category configuration
const crmCategoriesConfig = fs.readFileSync('scratch/crm_categories_config.js', 'utf8')
  .replace(/export\s+const\s+/g, 'const ');

// 3. Common helper functions & hooks destructuring
const runtimeSetup = `
const { useState, useEffect, useMemo, useRef, useCallback } = h;
const { jsx, jsxs, Fragment } = e;

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
      const m = trimmed.match(/https?:\\/\\/[^\\s"'<>\\]]+/i);
      if (m) return m[0].replace(/[\\]\\)\\}>.,;'"\\\\]+$/, '').trim();
      return trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
    }
  }
  if (contact.notes && typeof contact.notes === 'string') {
    const m = contact.notes.match(/https?:\\/\\/(?:maps\\.app\\.goo\\.gl|goo\\.gl\\/maps|www\\.google\\.com\\/maps|maps\\.google\\.com)\\/[^\\s"'<>\\]]+/i);
    if (m) return m[0].replace(/[\\]\\)\\}>.,;'"\\\\]+$/, '').trim();
    const locMatch = contact.notes.match(/\\[Location:\\s*([^\\s\\]]+)\\]/i);
    if (locMatch) {
      const u = locMatch[1].trim();
      return u.startsWith('http') ? u : 'https://' + u;
    }
  }
  if (contact.physical_address && typeof contact.physical_address === 'string' && (contact.physical_address.includes('goo.gl') || contact.physical_address.includes('maps'))) {
    const m = contact.physical_address.match(/https?:\\/\\/[^\\s"'<>\\]]+/i);
    if (m) return m[0].replace(/[\\]\\)\\}>.,;'"\\\\]+$/, '').trim();
  }
  for (const k of Object.keys(contact)) {
    const val = contact[k];
    if (typeof val === 'string' && (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps'))) {
      const m = val.match(/https?:\\/\\/(?:maps\\.app\\.goo\\.gl|goo\\.gl\\/maps)[^\\s"'<>\\]]+/i);
      if (m) return m[0].replace(/[\\]\\)\\}>.,;'"\\\\]+$/, '').trim();
    }
  }
  return '';
}

function cleanPhysicalAddress(contact) {
  let addr = contact.physical_address || '';
  if (addr.startsWith('http://') || addr.startsWith('https://')) {
    addr = '';
  }
  if (!addr && contact.notes) {
    const cleanNotes = contact.notes.replace(/\\[?Location:\\s*https?:\\/\\/[^\\]\\s\\n]+\\]?/gi, '').trim();
    if (cleanNotes && cleanNotes.length < 80 && !cleanNotes.includes('\\n')) {
      addr = cleanNotes;
    }
  }
  return addr.replace(/\\[?Location:\\s*https?:\\/\\/[^\\]\\s\\n]+\\]?/gi, '').trim() || '-';
}

function getContactMainGroup(contact) {
  if (!contact) return "1. Fleet Repairs & Services";
  const mgRaw = (contact.main_group || '').trim();
  const mgLower = mgRaw.toLowerCase();

  if (mgLower.startsWith('1') || mgLower.includes('fleet repairs') || mgLower.includes('workshop')) return "1. Fleet Repairs & Services";
  if (mgLower.startsWith('2') || mgLower.includes('corporate') || mgLower.includes('warehouse')) return "2. Corporate & Warehouses";
  if (mgLower.startsWith('3') || mgLower.includes('finance') || mgLower.includes('insurance')) return "3. Finance & Insurance";
  if (mgLower.startsWith('4') || mgLower.includes('tyre') || mgLower.includes('fuel') || mgLower.includes('fastag')) return "4. Tyres, Fuel & FASTag";
  if (mgLower.startsWith('5') || mgLower.includes('transport network') || mgLower.includes('broker') || mgLower.includes('transporter')) return "5. Transport Network";
  if (mgLower.startsWith('6') || mgLower.includes('drivers') || mgLower.includes('driver') || mgLower.includes('staff')) return "6. Drivers & Staff";
  if (mgLower.startsWith('7') || mgLower.includes('parts') || mgLower.includes('spare') || mgLower.includes('accessories')) return "7. Parts & Accessories";
  if (mgLower.startsWith('8') || mgLower.includes('infrastructure') || mgLower.includes('support') || mgLower.includes('rto')) return "8. Infrastructure & Support";

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
`;

// 4. Classic-transpiled components
const editModalCode = fs.readFileSync('scratch/CrmEditContactModal.classic.js', 'utf8')
  .replace(/import\s+[^;]+;/g, '')
  .replace(/export\s+function\s+CrmEditContactModal/g, 'function ka');

const detailDrawerCode = fs.readFileSync('scratch/CrmContactDetailDrawer.classic.js', 'utf8')
  .replace(/import\s+[^;]+;/g, '')
  .replace(/function safeParseArray\([\s\S]*?\n\}/g, '')
  .replace(/function extractGoogleMapsUrl\([\s\S]*?\n\}/g, '')
  .replace(/function cleanPhysicalAddress\([\s\S]*?\n\}/g, '')
  .replace(/export\s+function\s+CrmContactDetailDrawer/g, 'function Sa');

const directoryMainCode = fs.readFileSync('scratch/CrmDirectoryMain.classic.js', 'utf8')
  .replace(/import\s+[^;]+;/g, '')
  .replace(/function safeParseArray\([\s\S]*?\n\}/g, '')
  .replace(/function extractGoogleMapsUrl\([\s\S]*?\n\}/g, '')
  .replace(/function cleanPhysicalAddress\([\s\S]*?\n\}/g, '')
  .replace(/function getContactMainGroup\([\s\S]*?\n\}/g, '')
  .replace(/export\s+function\s+CrmDirectoryMain/g, 'function CrmDirectoryMain');

// 5. Va component using pure h.createElement
const vaComponent = `
function Va() {
  const [currentView, setCurrentView] = h.useState("contacts");
  const [isSosOpen, setIsSosOpen] = h.useState(false);
  
  // Modals state
  const [isEditOpen, setIsEditOpen] = h.useState(false);
  const [isDetailOpen, setIsDetailOpen] = h.useState(false);
  const [isExportOpen, setIsExportOpen] = h.useState(false);
  const [isScanOpen, setIsScanOpen] = h.useState(false);
  const [isApiSendOpen, setIsApiSendOpen] = h.useState(false);
  const [isMultiShareOpen, setIsMultiShareOpen] = h.useState(false);

  const [activeContact, setActiveContact] = h.useState(null);
  const [selectedContactsForShare, setSelectedContactsForShare] = h.useState([]);
  const [contactsList, setContactsList] = h.useState([]);
  const { currentUser } = We();

  const refreshContacts = async () => {
    try {
      const records = await W.collection("contacts").getFullList({ sort: "-created", $autoCancel: false });
      setContactsList(records || []);
    } catch (err) {
      console.error("Failed to refresh contacts:", err);
    }
  };

  h.useEffect(() => {
    refreshContacts();
  }, []);

  const handleOpenEdit = (contact) => {
    setActiveContact(contact || null);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (contact) => {
    setActiveContact(contact);
    setIsDetailOpen(true);
  };

  const handleOpenApiSend = (contact) => {
    setActiveContact(contact);
    setIsApiSendOpen(true);
  };

  const handleOpenMultiShare = (contacts) => {
    setSelectedContactsForShare(contacts);
    setIsMultiShareOpen(true);
  };

  // Bundled UI and Library imports object to pass down to CRM sub-components
  const importsBundle = {
    e, h, W, pb: W, S, toast: S, We, currentUser,
    Table: va, TableHeader: Ca, TableBody: Na, TableHead: ce, TableRow: X, TableCell: q,
    Dialog: le, DialogContent: oe, DialogHeader: he, DialogTitle: pe, DialogFooter: ue,
    Button: P, Input: k, Textarea: ke, Label: g, Badge: ne,
    Select: Y, SelectTrigger: K, SelectValue: J, SelectContent: Z, SelectItem: n,
    DropdownMenu: ha, DropdownMenuTrigger: pa, DropdownMenuContent: ua, DropdownMenuItem: G, DropdownMenuSeparator: Fe,
    Loader2: me, Phone: ae, Mail: Ne, MapPin: se, Wrench: _e, Copy: we, Share2: fe,
    Building: ee, Check: ea, Send: Ee, Users: de, Disc: je, Truck: Ce, Package: la, Landmark: Me
  };

  return h.createElement("div", {
    className: "max-w-7xl mx-auto p-2.5 sm:p-6 pb-24 sm:pb-8 space-y-3 sm:space-y-6 animate-in fade-in duration-300 overflow-x-hidden min-w-0 font-sans"
  },
    h.createElement(oa, null, h.createElement("title", null, "Transport CRM & Fleet Directory | Jai Bhavani Cargo")),
    
    /* Top Header & Navigation */
    h.createElement("div", {
      className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4"
    },
      h.createElement("div", null,
        h.createElement("div", { className: "flex items-center gap-2 mb-1" },
          h.createElement(ia, { className: "w-8 h-8 text-primary" }),
          h.createElement("h1", { className: "text-xl sm:text-3xl font-extrabold tracking-tight text-foreground" }, "Transport CRM & Fleet Directory"),
          h.createElement("span", { className: "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" }, "8 Groups")
        ),
        h.createElement("p", { className: "text-muted-foreground text-xs sm:text-sm" },
          "Centralized multi-brand directory covering fleet repairs, workshops, brokers, FASTag, diesel partners & corporate shippers."
        )
      ),

      h.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" },
        h.createElement(P, {
          variant: "outline",
          onClick: () => setIsSosOpen(true),
          className: "rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-black text-xs gap-1.5 shadow-sm animate-pulse"
        }, h.createElement("span", null, "🚨"), " NEED HELP (SOS)"),

        h.createElement("div", { className: "flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-bold" },
          h.createElement("button", {
            type: "button",
            onClick: () => setCurrentView("contacts"),
            className: "px-3 py-1.5 rounded-lg transition-all " + (currentView === "contacts" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
          }, "📇 CRM Directory"),
          h.createElement("button", {
            type: "button",
            onClick: () => setCurrentView("regional_breakdown"),
            className: "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 " + (currentView === "regional_breakdown" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
          }, "🗺️ Regional Hub", h.createElement("span", { className: "px-1.5 py-0.2 rounded-full text-[10px] font-black bg-primary/20 text-primary" }, "3 Hubs"))
        ),

        h.createElement(P, {
          variant: "outline",
          onClick: () => setIsScanOpen(true),
          className: "rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold text-xs gap-1.5 shadow-sm"
        }, h.createElement(De, { className: "w-4 h-4" }), " Scan Visiting Card"),

        h.createElement(P, {
          variant: "outline",
          onClick: () => setIsExportOpen(true),
          className: "rounded-xl text-xs font-bold gap-1.5"
        }, h.createElement(Be, { className: "w-4 h-4" }), " Export CSV"),

        h.createElement(P, {
          onClick: () => handleOpenEdit(null),
          className: "rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground shrink-0 order-first sm:order-last"
        }, h.createElement(ca, { className: "w-4 h-4" }), " Add CRM Contact")
      )
    ),

    /* Main Directory Content */
    currentView === "regional_breakdown"
      ? h.createElement(RegionalNetworkHubView, {
          contacts: contactsList,
          onRefreshContacts: refreshContacts,
          onOpenSos: () => setIsSosOpen(true)
        })
      : h.createElement(CrmDirectoryMain, {
          imports: importsBundle,
          onOpenEdit: handleOpenEdit,
          onOpenDetail: handleOpenDetail,
          onOpenExport: () => setIsExportOpen(true),
          onOpenScan: () => setIsScanOpen(true),
          onOpenSos: () => setIsSosOpen(true),
          onOpenApiSend: handleOpenApiSend,
          onOpenMultiShare: handleOpenMultiShare
        }),

    /* Modals */
    h.createElement(ka, {
      isOpen: isEditOpen,
      onClose: () => setIsEditOpen(false),
      contact: activeContact,
      onSuccess: () => {
        setIsEditOpen(false);
        refreshContacts();
      },
      imports: importsBundle
    }),

    h.createElement(Sa, {
      isOpen: isDetailOpen,
      onClose: () => setIsDetailOpen(false),
      contact: activeContact,
      onEdit: (c) => {
        setIsDetailOpen(false);
        handleOpenEdit(c);
      },
      imports: importsBundle
    }),

    h.createElement(Aa, { isOpen: isExportOpen, onClose: () => setIsExportOpen(false), contacts: contactsList }),
    h.createElement(Oa, { isOpen: isScanOpen, onClose: () => setIsScanOpen(false), onSuccess: () => { setIsScanOpen(false); refreshContacts(); } }),
    h.createElement(Fa, { isOpen: isApiSendOpen, onClose: () => setIsApiSendOpen(false), contact: activeContact }),
    h.createElement(wa, { isOpen: isMultiShareOpen, onClose: () => setIsMultiShareOpen(false), contacts: selectedContactsForShare }),

    h.createElement(EmergencySosModal, {
      isOpen: isSosOpen,
      onClose: () => setIsSosOpen(false),
      regions: [{ id: "reg_hyd", name: "HYDERABAD" }, { id: "reg_kurnool", name: "KURNOOL" }, { id: "reg_atp", name: "ANANTAPUR" }]
    }),

    h.createElement("button", {
      type: "button",
      onClick: () => handleOpenEdit(null),
      className: "fixed bottom-20 right-4 z-40 md:hidden flex items-center justify-center gap-1.5 px-4 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-full shadow-2xl border-2 border-background active:scale-95 transition-transform"
    }, h.createElement(ca, { className: "w-4 h-4" }), " Add Contact")
  );
}
`;

// Assemble final full bundle
const fullBundle = [
  header,
  crmCategoriesConfig,
  runtimeSetup,
  editModalCode,
  helpers,
  detailDrawerCode,
  actionDropdown,
  exportModal,
  visitingCardModal,
  apiSendModal,
  directoryMainCode,
  vaComponent,
  breakdownHub,
  'export{MAIN_GROUPS_CONFIG as CATEGORY_FILTERS,MAIN_GROUPS_CONFIG as MAIN_GROUPS,Va as default};'
].join('\n\n');

// Validate syntax
try {
  babel.parse(fullBundle, { sourceType: 'module', plugins: ['jsx'] });
  console.log('🎉🎉🎉 CLASSIC REACT BUNDLE VALIDATED 100%! ZERO SYNTAX ERRORS!');

  const targets = [
    'scratch/ContactsPage.redesigned.js',
    'dist/assets/ContactsPage-BGG1WU_b.js',
    'dist/apps/web/assets/ContactsPage-BGG1WU_b.js',
    'apps/web/dist/assets/ContactsPage-BGG1WU_b.js',
    'apps/api/dist/assets/ContactsPage-BGG1WU_b.js'
  ];

  targets.forEach(t => {
    fs.writeFileSync(t, fullBundle, 'utf8');
    console.log('Saved', t, fullBundle.length, 'bytes');
  });
} catch (err) {
  console.error('Validation error:', err.message);
  process.exit(1);
}
