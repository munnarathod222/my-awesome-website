import React, { useState, useEffect } from 'react';

// Truck Brands Master List
const TRUCK_BRANDS_MASTER = [
  "Ashok Leyland",
  "Tata Motors",
  "BharatBenz",
  "Eicher",
  "Mahindra",
  "Volvo",
  "Isuzu",
  "SML Isuzu",
  "MAN",
  "Universal / All Brands"
];

// 8 Main Groups Architecture
const MAIN_GROUPS_CONFIG = [
  {
    id: "fleet_repairs",
    title: "Fleet Repairs & Services",
    code: "G1",
    badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
    categories: [
      {
        id: "mechanic",
        name: "Mechanic / Workshop",
        subcategories: [
          "Engine Overhaul & Head Gasket",
          "Transmission / Gearbox & Clutch",
          "Brake Systems & Air Lines",
          "Differential & Crown Wheel",
          "General Mechanical Repair"
        ],
        specialisations: [
          "Engine Diagnostic & Overhaul",
          "Clutch Plate & Pressure Plate",
          "Brake Booster & Drums",
          "Differential Crown Pinion",
          "Propeller Shaft & Universal Joint"
        ]
      },
      {
        id: "electrician",
        name: "Auto Electrician",
        subcategories: [
          "Starter Motor & Alternator",
          "Wiring Harness Repair",
          "Battery Sales & Charging",
          "Lighting & Beacon Systems",
          "ECU / Sensor Diagnostics"
        ],
        specialisations: [
          "24V Heavy Alternator Overhaul",
          "Self Starter Bendix Drive",
          "Chassis Wiring Rewiring",
          "Battery Jump Start"
        ]
      },
      {
        id: "bodywork_welding",
        name: "Bodywork & Welding",
        subcategories: [
          "Cabin Tinkering & Painting",
          "Chassis Straightening & Reinforcement",
          "Container / Trailer Body Repair",
          "Arc, Gas & Argon Welding"
        ],
        specialisations: [
          "Trailer Flooring Sheet",
          "Cabin Denting & Repaint",
          "Cross Member Welding"
        ]
      },
      {
        id: "hydraulics_steering",
        name: "Hydraulics & Steering",
        subcategories: [
          "Power Steering Pump & Box",
          "Turbocharger Repair",
          "Air Brake Valve & Compressors",
          "Hydraulic Tipper Jack / Hoses"
        ],
        specialisations: [
          "Rane / ZF Steering Box",
          "Turbo Core Balancing",
          "Unloader Valve & Foot Valve"
        ]
      },
      {
        id: "spring_suspension",
        name: "Springs & Suspension",
        subcategories: [
          "Leaf Spring Retensioning & Recambering",
          "Bogie Suspension Bushing",
          "Shock Absorber Replacement"
        ],
        specialisations: [
          "Heavy Kamaani Patti Replacement",
          "Bell Crank Pin & Bush",
          "Main Leaf Spring Replacement"
        ]
      },
      {
        id: "crane_towing",
        name: "Crane & Recovery Towing",
        subcategories: [
          "Heavy Duty Underlift Towing",
          "Hydraulic Highway Crane (20T - 50T)",
          "Off-road / Ditch Recovery"
        ],
        specialisations: [
          "Accident Inverted Truck Recovery",
          "Highway Breakdown Towing to Yard"
        ]
      },
      {
        id: "key_maker",
        name: "Key Maker / Locksmith",
        subcategories: [
          "Cabin Door & Ignition Lock",
          "Computerized Chip Key Cutting",
          "Emergency Lockout Service"
        ],
        specialisations: [
          "Ignition Switch Lock Barrel",
          "Container Padlock Cutting / Duplicate"
        ]
      },
      {
        id: "washing_greasing",
        name: "Washing & Greasing",
        subcategories: [
          "Commercial Truck Water Wash",
          "Under-chassis High Pressure Wash",
          "Chassis Greasing & Lubrication"
        ],
        specialisations: [
          "Air Pressure Grease Gun Service",
          "Cabin Interior Vacuum & Wash"
        ]
      }
    ]
  },
  {
    id: "corporate_warehouses",
    title: "Corporate & Warehouses",
    code: "G2",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    categories: [
      {
        id: "corporate_client",
        name: "Corporate Client / Consignor",
        subcategories: [
          "Industrial Shipper / Manufacturer",
          "Key Account Logistics Client",
          "FMCG / Retail Distribution Account",
          "Steel, Cement & Raw Material Shipper"
        ],
        specialisations: [
          "Dedicated Contract Fleet",
          "Ad-hoc Spot Vehicle Hiring",
          "Monthly Billing Account"
        ]
      },
      {
        id: "warehouse_hub",
        name: "Warehouse & Mother Hub",
        subcategories: [
          "Regional Distribution Centre (RDC)",
          "Mother Hub / Fulfilment Centre",
          "Cold Storage / Temperature Controlled Hub",
          "Container Freight Station (CFS)"
        ],
        specialisations: [
          "Loading / Unloading Bay Coordination",
          "Cross-docking & Transshipment",
          "Gate Inward / Security Dispatch"
        ]
      }
    ]
  },
  {
    id: "finance_insurance",
    title: "Finance & Insurance",
    code: "G3",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    categories: [
      {
        id: "banking_vehicle_loan",
        name: "Banking & Vehicle Loans",
        subcategories: [
          "Commercial Vehicle (CV) Financier",
          "Direct Selling Agent (DSA)",
          "Working Capital / CC / OD Bank Desk",
          "Used Truck Refinance"
        ],
        specialisations: [
          "Chassis Loan Disbursement",
          "NOC & Hypothecation Removal",
          "Fleet Refinancing"
        ]
      },
      {
        id: "insurance_surveyor",
        name: "Insurance & Claims",
        subcategories: [
          "Commercial Vehicle Insurance Broker",
          "Accident Claims Surveyor",
          "Transit / Marine Cargo Insurance"
        ],
        specialisations: [
          "Cashless Workshop Tie-up",
          "Spot Survey Coordination",
          "Total Loss / Salvage Settlement"
        ]
      }
    ]
  },
  {
    id: "tyres_fuel_fastag",
    title: "Tyres, Fuel & FASTag",
    code: "G4",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    categories: [
      {
        id: "puncture_shop",
        name: "Puncture & Tube Repair",
        subcategories: [
          "Tubeless Radial Truck Puncture",
          "Tube & Flap Hot Vulcanizing",
          "Air Inflation & Nitrogen Station",
          "Highway Mobile Puncture Assistance"
        ],
        specialisations: [
          "Side Cut Radial Patching",
          "Heavy Valve Pin & O-Ring Replacement"
        ]
      },
      {
        id: "tyre_dealership",
        name: "Tyre Dealer & Retreading",
        subcategories: [
          "New Fleet Tyres (Apollo, MRF, JK, CEAT)",
          "Cold Process Tyre Retreading / Resoling",
          "Wheel Alignment & Balancing",
          "Scrap Tyre Disposal & Buyback"
        ],
        specialisations: [
          "295/90 R20 & 295/80 R22.5 Supply",
          "Retread Warranty Support"
        ]
      },
      {
        id: "fuel_station",
        name: "Fuel Station / Diesel Partner",
        subcategories: [
          "Highway Fuel Retail Outlet (IOCL, BPCL, HPCL)",
          "Fleet Fuel Card Partner Pump",
          "DEF / AdBlue Bulk Dispenser"
        ],
        specialisations: [
          "Credit Diesel Billing for Fleet",
          "Clean DEF Dispensing"
        ]
      },
      {
        id: "fastag_toll",
        name: "FASTag Services",
        subcategories: [
          "Commercial Vehicle FASTag Issuance",
          "Fleet Wallet Top-up & Recharge",
          "Blacklisted Tag Resolution & KYC"
        ],
        specialisations: [
          "Same-day Tag Barcode Activation",
          "NPCI / IHMCL Dispute Support"
        ]
      }
    ]
  },
  {
    id: "transport_network",
    title: "Transport Network",
    code: "G5",
    badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    categories: [
      {
        id: "truck_broker",
        name: "Freight Broker / Commission Agent",
        subcategories: [
          "Highway Freight Booking Broker",
          "Return Load Provider",
          "Container Load Broker"
        ],
        specialisations: [
          "Hyderabad - Bhiwandi Route Specialist",
          "Hyderabad - Bangalore Route Specialist",
          "Full Truck Load (FTL) Placement"
        ]
      },
      {
        id: "attached_transporter",
        name: "Truck Owner & Transporter",
        subcategories: [
          "Market Attached Vehicle Owner",
          "Subcontractor Fleet Transporter",
          "Specialized Container Transporter"
        ],
        specialisations: [
          "32ft Multi-axle Container",
          "20ft / 24ft Open Body Trucks",
          "Trailer 40ft High Bed"
        ]
      }
    ]
  },
  {
    id: "drivers_staff",
    title: "Drivers & Staff",
    code: "G6",
    badgeColor: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    categories: [
      {
        id: "commercial_driver",
        name: "Heavy Commercial Driver",
        subcategories: [
          "Long-haul Heavy Vehicle Driver",
          "Container Truck Driver",
          "Spare / Relief Driver",
          "Local Shuttle / Shunting Driver"
        ],
        specialisations: [
          "Valid HMV / Heavy Commercial License",
          "Hazardous / Liquid Cargo Endorsement",
          "GPS Smartphone Proficient"
        ]
      },
      {
        id: "operations_staff",
        name: "Field Operations & Supervisor",
        subcategories: [
          "Fleet Route Supervisor",
          "Yard & Parking Manager",
          "POD & Document Collection Executive",
          "Dispatch Coordinator"
        ],
        specialisations: [
          "Night Shift Dispatch Supervision",
          "Driver Cash Advance & Toll Handover"
        ]
      }
    ]
  },
  {
    id: "parts_accessories",
    title: "Parts & Accessories",
    code: "G7",
    badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    categories: [
      {
        id: "spare_parts_shop",
        name: "Commercial Spare Parts Shop",
        subcategories: [
          "Engine & Gearbox Spares",
          "Air Brake Valves & Pipes",
          "Electrical Lights, Horns & Sensors",
          "Engine Oil & Coolant Distributors"
        ],
        specialisations: [
          "OEM Genuine Spares Supply",
          "Castrol / Gulf 15W40 CI-4 Diesel Engine Oil",
          "Fast Moving Filters (Air/Oil/Fuel)"
        ]
      },
      {
        id: "truck_showroom",
        name: "Truck Showroom & Sales Executive",
        subcategories: [
          "Authorized Commercial Vehicle Dealership",
          "Showroom Fleet Sales Key Account Manager",
          "New Chassis Quota & Delivery Coordinator"
        ],
        specialisations: [
          "Ashok Leyland 4220 / 4825 Heavy Chassis",
          "Tata Signa / Prima Fleet Order",
          "BharatBenz Heavy Commercial Dealership"
        ]
      },
      {
        id: "truck_resale",
        name: "Used Truck Resale & Exchange",
        subcategories: [
          "Pre-owned Fleet Valuation & Purchase",
          "Vehicle Exchange Broker",
          "Scrap Commercial Vehicle Buyer"
        ],
        specialisations: [
          "RTO NOC & Hypothecation Clearance",
          "Condition Inspection & Fair Valuation"
        ]
      }
    ]
  },
  {
    id: "infrastructure_support",
    title: "Infrastructure & Support",
    code: "G8",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    categories: [
      {
        id: "truck_parking_yard",
        name: "Truck Parking & Highway Yard",
        subcategories: [
          "Highway Gated Truck Parking Yard",
          "Overnight Driver Rest Area & Canteen",
          "Fleet Depot & Holding Yard"
        ],
        specialisations: [
          "24/7 Security & CCTV Monitored",
          "Driver Restrooms & Water Facilities"
        ]
      },
      {
        id: "rto_compliance",
        name: "RTO & Legal Compliance Agent",
        subcategories: [
          "Vehicle Fitness (FC) Renewal Liaison",
          "National Permit (NP) & State Taxes",
          "Ownership Transfer & NOC Clearances",
          "Road Tax & Green Tax Payments"
        ],
        specialisations: [
          "Telangana / Uppal / Medchal RTO Clearance",
          "Maharashtra / Bhiwandi Permit Endorsement",
          "Karnataka Border Entry Tax Clearances"
        ]
      },
      {
        id: "gps_telematics",
        name: "GPS Telematics & AIS-140",
        subcategories: [
          "AIS-140 Certified GPS Tracker Vendor",
          "Fuel Level Ultrasonic Sensor Installer",
          "Dashcam / Fatigue Sensor Systems"
        ],
        specialisations: [
          "Emergency Panic Button Wiring",
          "Fleet Calibration & API Integration"
        ]
      }
    ]
  }
];

const CORPORATE_DESIGNATIONS = [
  "Procurement Manager",
  "Logistics Manager",
  "Transport Manager",
  "Supply Chain Head",
  "Warehouse Manager",
  "Warehouse Supervisor",
  "Dispatch Executive",
  "Accounts Payable",
  "Vendor Onboarding Manager",
  "Key Account Manager",
  "Operations Executive",
  "Director / Partner"
];

// Helper to safe parse JSON arrays
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

// -------------------------------------------------------------------------
// REDESIGNED EDIT/ADD CONTACT MODAL (ka)
// -------------------------------------------------------------------------
export function CrmEditContactModal({ isOpen, onClose, contact, onSuccess, imports }) {
  const { e, h, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast, pb, currentUser, Loader2 } = imports;

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'category' | 'service' | 'corporate'
  
  // Basic Info
  const [companyName, setCompanyName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [designation, setDesignation] = useState('');
  
  // Location
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Category Architecture
  const [mainGroup, setMainGroup] = useState('Fleet Repairs & Services');
  const [primaryCategory, setPrimaryCategory] = useState('Mechanic');
  const [secondaryCategories, setSecondaryCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [customSubcategory, setCustomSubcategory] = useState('');

  // Multi-brand Support
  const [truckBrands, setTruckBrands] = useState(['Universal / All Brands']);
  const [customBrand, setCustomBrand] = useState('');
  const [workshopType, setWorkshopType] = useState('independent'); // 'independent' | 'authorised' | 'roadside'

  // Service Intelligence
  const [serviceSpecialisations, setServiceSpecialisations] = useState([]);
  const [customSpecialisation, setCustomSpecialisation] = useState('');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [roadsideService, setRoadsideService] = useState(false);
  const [isPreferred, setIsPreferred] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('verified'); // 'verified' | 'unverified' | 'pending'
  const [workingHours, setWorkingHours] = useState('8:00 AM - 9:00 PM');
  const [internalNotes, setInternalNotes] = useState('');

  // Load contact data
  useEffect(() => {
    if (!isOpen) return;

    if (contact) {
      setCompanyName(contact.company_name || '');
      setOrganisationName(contact.organisation_name || '');
      
      // Phone parsing
      const phoneList = (contact.phone_number || '').split(/[,;\/\n]+/).map(p => p.trim()).filter(Boolean);
      setPrimaryPhone(phoneList[0] || '');
      setAlternatePhone(contact.alternate_phone || phoneList[1] || '');
      setWhatsappPhone(contact.whatsapp_number || '');

      setEmail(contact.email || '');
      setGstin(contact.gstin || '');
      setDesignation(contact.designation || '');
      setPhysicalAddress(contact.physical_address || '');
      setCity(contact.city || 'Hyderabad');
      setArea(contact.area || '');
      
      // Auto-extract Google Maps URL from all database fields or embedded notes
      const initialMapUrl = extractGoogleMapsUrl(contact);
      setGoogleMapsUrl(initialMapUrl);

      // Categories
      setMainGroup(contact.main_group || 'Fleet Repairs & Services');
      setPrimaryCategory(contact.primary_category || contact.contact_type || 'Mechanic');
      setSecondaryCategories(safeParseArray(contact.secondary_categories));
      setSubcategories(safeParseArray(contact.subcategories));

      // Brands & Intelligence
      const brands = safeParseArray(contact.truck_brands);
      setTruckBrands(brands.length > 0 ? brands : (contact.truck_brand ? [contact.truck_brand] : ['Universal / All Brands']));
      setWorkshopType(contact.workshop_type || 'independent');
      setServiceSpecialisations(safeParseArray(contact.service_specialisations));
      setEmergencyAvailable(Boolean(contact.emergency_available));
      setRoadsideService(Boolean(contact.roadside_service));
      setIsPreferred(Boolean(contact.is_preferred));
      setVerificationStatus(contact.verification_status || 'verified');
      setWorkingHours(contact.working_hours || '8:00 AM - 9:00 PM');
      
      // Clean notes - strip out Location & Finance tags so user gets a clean text area
      const cleanNotes = (contact.notes || '')
        .replace(/<!--\s*MAPS_URL:[^>]*-->/gi, '')
        .replace(/\[Location:\s*[^\]]+\]/gi, '')
        .replace(/\[Finance:\s*[^\]]+\]/gi, '')
        .trim();
      setInternalNotes(cleanNotes);
    } else {
      // Reset for new contact
      setCompanyName('');
      setOrganisationName('');
      setPrimaryPhone('');
      setAlternatePhone('');
      setWhatsappPhone('');
      setEmail('');
      setGstin('');
      setDesignation('');
      setPhysicalAddress('');
      setCity('Hyderabad');
      setArea('');
      setGoogleMapsUrl('');
      setMainGroup('Fleet Repairs & Services');
      setPrimaryCategory('Mechanic');
      setSecondaryCategories([]);
      setSubcategories(['Engine Overhaul & Head Gasket', 'General Mechanical Repair']);
      setTruckBrands(['Universal / All Brands']);
      setWorkshopType('independent');
      setServiceSpecialisations(['Engine Diagnostic & Overhaul']);
      setEmergencyAvailable(true);
      setRoadsideService(true);
      setIsPreferred(false);
      setVerificationStatus('verified');
      setWorkingHours('8:00 AM - 9:00 PM');
      setInternalNotes('');
    }
  }, [isOpen, contact]);

  // Current main group object
  const currentGroupObj = MAIN_GROUPS_CONFIG.find(g => g.title === mainGroup) || MAIN_GROUPS_CONFIG[0];
  const availableCategories = currentGroupObj.categories || [];
  const currentCategoryObj = availableCategories.find(c => c.name === primaryCategory) || availableCategories[0];
  const availableSubcategories = currentCategoryObj?.subcategories || [];
  const availableSpecialisations = currentCategoryObj?.specialisations || [];

  // Toggle brand
  const toggleBrand = (brand) => {
    if (brand === 'Universal / All Brands') {
      setTruckBrands(['Universal / All Brands']);
      return;
    }
    let updated = truckBrands.filter(b => b !== 'Universal / All Brands');
    if (updated.includes(brand)) {
      updated = updated.filter(b => b !== brand);
      if (updated.length === 0) updated = ['Universal / All Brands'];
    } else {
      updated.push(brand);
    }
    setTruckBrands(updated);
  };

  // Toggle subcategory
  const toggleSubcategory = (sub) => {
    if (subcategories.includes(sub)) {
      setSubcategories(subcategories.filter(s => s !== sub));
    } else {
      setSubcategories([...subcategories, sub]);
    }
  };

  // Toggle specialisation
  const toggleSpecialisation = (spec) => {
    if (serviceSpecialisations.includes(spec)) {
      setServiceSpecialisations(serviceSpecialisations.filter(s => s !== spec));
    } else {
      setServiceSpecialisations([...serviceSpecialisations, spec]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error('Company / Contact Name is required');
      return;
    }
    if (!primaryPhone.trim()) {
      toast.error('Primary phone number is required');
      return;
    }
    if (!physicalAddress.trim()) {
      toast.error('Physical address or area location is required');
      return;
    }

    setSaving(true);
    try {
      // Assemble full phone number string
      const allPhones = [primaryPhone, alternatePhone].map(p => p.trim()).filter(Boolean).join(', ');

      // Normalize Google Maps link
      let mapUrl = googleMapsUrl.trim();
      if (mapUrl && !/^https?:\/\//i.test(mapUrl)) {
        if (mapUrl.includes('goo.gl') || mapUrl.includes('google.com') || mapUrl.includes('maps')) {
          mapUrl = 'https://' + mapUrl;
        }
      }

      // Format notes to include [Location: ...] for 100% backward & cross-module compatibility
      let finalNotes = internalNotes.trim();
      if (mapUrl) {
        finalNotes = finalNotes
          .replace(/<!--\s*MAPS_URL:[^>]*-->/gi, '')
          .replace(/\[Location:\s*[^\]]+\]/gi, '')
          .trim();
        finalNotes = finalNotes ? `${finalNotes}\n[Location: ${mapUrl}]` : `[Location: ${mapUrl}]`;
      }

      // Build structured record preserving backward compatibility
      const payload = {
        company_name: companyName.trim(),
        organisation_name: organisationName.trim() || companyName.trim(),
        phone_number: allPhones,
        alternate_phone: alternatePhone.trim(),
        whatsapp_number: whatsappPhone.trim() || primaryPhone.trim(),
        email: email.trim(),
        gstin: gstin.trim().toUpperCase(),
        designation: designation.trim(),
        physical_address: physicalAddress.trim(),
        city: city.trim(),
        area: area.trim(),
        google_map_link: mapUrl,
        location_url: mapUrl,
        maps_url: mapUrl,
        map_url: mapUrl,
        google_maps_url: mapUrl,
        
        // Category Architecture
        main_group: mainGroup,
        primary_category: primaryCategory,
        contact_type: primaryCategory, // preserves backward compatibility for existing views
        secondary_categories: JSON.stringify(secondaryCategories),
        subcategories: JSON.stringify(subcategories),
        
        // Multi-Brand Support
        truck_brands: JSON.stringify(truckBrands),
        truck_brand: truckBrands.join(', '), // preserves backward compatibility for older cards
        workshop_type: workshopType,
        
        // Service Intelligence
        service_specialisations: JSON.stringify(serviceSpecialisations),
        emergency_available: emergencyAvailable ? 1 : 0,
        roadside_service: roadsideService ? 1 : 0,
        is_preferred: isPreferred ? 1 : 0,
        verification_status: verificationStatus,
        working_hours: workingHours.trim(),
        notes: finalNotes,
        created_by: currentUser?.id || ''
      };

      if (contact && contact.id) {
        await pb.collection('contacts').update(contact.id, payload, { $autoCancel: false });
        toast.success(`Contact "${companyName}" updated successfully!`);
      } else {
        await pb.collection('contacts').create(payload, { $autoCancel: false });
        toast.success(`Contact "${companyName}" created successfully!`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save contact:', err);
      toast.error(err.message || 'Failed to save contact record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-primary text-2xl">📇</span>
              {contact ? `Edit CRM Contact: ${contact.company_name}` : 'New Transport CRM & Service Contact'}
            </DialogTitle>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
              Production CRM v2.0
            </span>
          </div>
          {/* Step Tabs Navigation */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'general' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <span>👤</span> Standard & Location
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'category' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <span>📂</span> Group & Subcategories
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'service' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <span>🔧</span> Multi-Brand & Intelligence
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('corporate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'corporate' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <span>🏢</span> Corporate & Settings
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* TAB 1: GENERAL & LOCATION */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Company / Shop / Contact Name *</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Sri Rama Auto Electricals / Royal Transport"
                    className="bg-slate-950 border-slate-800 text-white font-bold text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Designation / Role in Transport</Label>
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Master Mechanic / Logistics Head / Owner"
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Phone Numbers Trio */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>📞</span> Phone Numbers & WhatsApp Lines
                  </Label>
                  <span className="text-[10px] text-slate-400">Preserves multiple numbers without comma clobbering</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Primary Mobile *</span>
                    <Input
                      value={primaryPhone}
                      onChange={(e) => setPrimaryPhone(e.target.value)}
                      placeholder="e.g. 9849735080"
                      className="bg-slate-900 border-slate-800 text-emerald-400 font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Alternate / Office</span>
                    <Input
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      placeholder="e.g. 9000250452"
                      className="bg-slate-900 border-slate-800 text-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">WhatsApp Dedicated</span>
                    <Input
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="e.g. 9849735080"
                      className="bg-slate-900 border-slate-800 text-teal-400 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Physical Address / Workshop Location *</Label>
                  <Textarea
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    placeholder="Shop No, Landmark, Highway KM marker, Auto Nagar..."
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs min-h-[60px]"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">City Hub</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad / Bhiwandi / Bengaluru"
                      className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">Area / Transport Cluster</Label>
                    <Input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Ghatkesar / Autonagar / Peddamberpet"
                      className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <span>🗺️</span> Google Maps GPS Navigation Link
                  </Label>
                  {googleMapsUrl.trim() && (
                    <a
                      href={googleMapsUrl.trim().startsWith('http') ? googleMapsUrl.trim() : `https://${googleMapsUrl.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                    >
                      <span>↗</span> Test Link
                    </a>
                  )}
                </div>
                <Input
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... (Enables 1-click driver GPS routing)"
                  className="bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY & SUBCATEGORIES */}
          {activeTab === 'category' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Main Group (8 Master Groups) *</Label>
                  <select
                    value={mainGroup}
                    onChange={(e) => {
                      const newGroup = e.target.value;
                      setMainGroup(newGroup);
                      const gObj = MAIN_GROUPS_CONFIG.find(g => g.title === newGroup);
                      if (gObj && gObj.categories.length > 0) {
                        setPrimaryCategory(gObj.categories[0].name);
                        setSubcategories(gObj.categories[0].subcategories.slice(0, 2));
                      }
                    }}
                    className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {MAIN_GROUPS_CONFIG.map(g => (
                      <option key={g.id} value={g.title}>{g.code} — {g.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Primary Category *</Label>
                  <select
                    value={primaryCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setPrimaryCategory(newCat);
                      const cObj = availableCategories.find(c => c.name === newCat);
                      if (cObj) {
                        setSubcategories(cObj.subcategories.slice(0, 2));
                      }
                    }}
                    className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategories Multi-Select Badges */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-300">
                    Subcategories (Multi-Select Supported)
                  </Label>
                  <span className="text-[10px] text-primary font-bold">
                    {subcategories.length} Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableSubcategories.map(sub => {
                    const isSelected = subcategories.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubcategory(sub)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {sub}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Subcategory entry */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Input
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    placeholder="Add custom subcategory tag..."
                    className="bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-slate-700"
                    onClick={() => {
                      if (customSubcategory.trim() && !subcategories.includes(customSubcategory.trim())) {
                        setSubcategories([...subcategories, customSubcategory.trim()]);
                        setCustomSubcategory('');
                      }
                    }}
                  >
                    Add Subcategory
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-BRAND & SERVICE INTELLIGENCE */}
          {activeTab === 'service' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Multi-Brand Support Master Table */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🚛</span> Centrally Managed Truck Brands (Multi-Select)
                    </Label>
                    <p className="text-[10px] text-slate-400">
                      Select all manufacturer brands this workshop or technician supports
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Centre Type:</span>
                    <select
                      value={workshopType}
                      onChange={(e) => setWorkshopType(e.target.value)}
                      className="h-7 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-bold px-2"
                    >
                      <option value="independent">Independent Workshop</option>
                      <option value="authorised">Authorised OEM Centre</option>
                      <option value="roadside">Roadside Mobile Van</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {TRUCK_BRANDS_MASTER.map(brand => {
                    const isSelected = truckBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {brand}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Brand Entry */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Input
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Add custom truck brand (e.g. Scania, Force)..."
                    className="bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-slate-700"
                    onClick={() => {
                      if (customBrand.trim() && !truckBrands.includes(customBrand.trim())) {
                        setTruckBrands([...truckBrands.filter(b => b !== 'Universal / All Brands'), customBrand.trim()]);
                        setCustomBrand('');
                      }
                    }}
                  >
                    Add Brand
                  </Button>
                </div>
              </div>

              {/* Service Specialisations */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <Label className="text-xs font-bold text-slate-300">
                  Service Specialisations (Repair Expertise)
                </Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableSpecialisations.map(spec => {
                    const isSelected = serviceSpecialisations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialisation(spec)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {spec}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Input
                    value={customSpecialisation}
                    onChange={(e) => setCustomSpecialisation(e.target.value)}
                    placeholder="Add custom specialisation..."
                    className="bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-slate-700"
                    onClick={() => {
                      if (customSpecialisation.trim() && !serviceSpecialisations.includes(customSpecialisation.trim())) {
                        setServiceSpecialisations([...serviceSpecialisations, customSpecialisation.trim()]);
                        setCustomSpecialisation('');
                      }
                    }}
                  >
                    Add Specialisation
                  </Button>
                </div>
              </div>

              {/* Operating Capabilities Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={emergencyAvailable}
                    onChange={(e) => setEmergencyAvailable(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">🚨 24/7 Emergency</span>
                    <span className="text-[10px] text-slate-400">Available for night breakdown</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={roadsideService}
                    onChange={(e) => setRoadsideService(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">🛠️ Roadside / On-site</span>
                    <span className="text-[10px] text-slate-400">Dispatches mechanic to truck</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={isPreferred}
                    onChange={(e) => setIsPreferred(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">⭐ Preferred Vendor</span>
                    <span className="text-[10px] text-slate-400">High priority dispatch status</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: CORPORATE & SETTINGS */}
          {activeTab === 'corporate' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Parent Corporate / Organisation</Label>
                  <Input
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    placeholder="e.g. Tata Steel / Flipkart / Reliance Hub"
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">GSTIN Tax Registration</Label>
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="15-character GSTIN (Optional)"
                    maxLength={15}
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Working Hours</Label>
                  <Input
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="e.g. 24 Hours / 9:00 AM - 8:00 PM"
                    className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Verification Status</Label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none"
                  >
                    <option value="verified">Verified Contact</option>
                    <option value="pending">Verification Pending</option>
                    <option value="unverified">Unverified / Raw Contact</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Internal Fleet Notes & Past History</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Rates negotiated, reliable for night repairs, past experience with Hyderabad fleet..."
                  className="bg-slate-950 border-slate-800 text-slate-200 text-xs min-h-[70px]"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              * Required fields: Company Name, Primary Phone, Physical Address
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="border-slate-700 text-slate-300 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {contact ? 'Update CRM Contact' : 'Save CRM Contact'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
