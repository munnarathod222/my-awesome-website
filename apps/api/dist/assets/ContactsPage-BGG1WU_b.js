import{r as h,j as e,ak as me,ad as ee,a0 as qe,ao as ae,a_ as Ne,ae as se,as as _e,aq as we,bU as fe,cc as He,aE as ze,cD as Ye,a2 as Ke,a1 as Be,ax as De,av as Je,dg as Ze,aU as Qe,b2 as Xe,cx as ea,ap as Ee,al as ye,a7 as de,dM as je,dN as aa,by as sa,dO as Te,cH as ve,cV as ta,bD as ra,dP as na,au as Le,a6 as Ce,cU as la,de as Me,dy as $e,bs as oa,aY as ia,ag as ca,cf as da,at as ma,aM as Ae,dQ as Oe}from"./vendor-react-Bs5V2qFE.js";import{u as We,D as le,a as oe,b as he,c as pe,L as g,S as Y,e as K,g as J,h as Z,i as n,I as k,T as ke,j as ue,B as P,p as W,t as S,w as ne,a3 as ha,a4 as pa,a5 as ua,a8 as G,a7 as Fe,aj as xa,af as ga,d as ba,C as fa,o as ya,O as ja,y as va,z as Ca,A as ce,E as X,F as Na,G as q}from"./index-DLxf9dwO.js";import{f as ge,o as Ie}from"./locationUtils-CJF9iFYv.js";import{B as _a}from"./BusinessCardExtractor-DcUocfvj.js";import{T as wa}from"./TransportCrmWhatsAppShareModal-BPe-K7FN.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";

// Master Architecture for Jai Bhavani Cargo Transport CRM & Fleet Service Directory

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

const MAIN_GROUPS_CONFIG = [
  {
    id: "fleet_repairs",
    title: "1. Fleet Repairs & Services",
    iconKey: "wrench",
    description: "Workshops, mobile repair vans, towing, electricals, bodybuilding and specialized mechanics",
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
    title: "2. Corporate & Warehouses",
    iconKey: "building",
    description: "Industrial clients, shippers, key account logistics, 3PLs and warehouse distribution points",
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
    title: "3. Finance & Insurance",
    iconKey: "bank",
    description: "Commercial vehicle lenders, DSA agents, insurance brokers, surveyors and trade finance",
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
    title: "4. Tyres, Fuel & FASTag",
    iconKey: "disc",
    description: "Tyre dealers, puncture shops, highway fuel stations and toll FASTag providers",
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
    title: "5. Transport Network",
    iconKey: "truck",
    description: "Freight brokers, attached fleet owners, market load transporters and commission agents",
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
    title: "6. Drivers & Staff",
    iconKey: "users",
    description: "Company drivers, fleet supervisors, route dispatchers, yard managers and operations staff",
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
    title: "7. Parts & Accessories",
    iconKey: "package",
    description: "OEM and aftermarket truck spares, lubricants, chassis dealers and fabricators",
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
    title: "8. Infrastructure & Support",
    iconKey: "landmark",
    description: "Secure truck yards, RTO compliance agents, GPS telematics and legal authorities",
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



const { useState, useEffect, useMemo, useRef, useCallback } = h;

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







function ka({ isOpen, onClose, contact, onSuccess, imports }) {
  const { e, h, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast, pb, currentUser, Loader2 } = imports;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [companyName, setCompanyName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [designation, setDesignation] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [area, setArea] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [mainGroup, setMainGroup] = useState("Fleet Repairs & Services");
  const [primaryCategory, setPrimaryCategory] = useState("Mechanic");
  const [secondaryCategories, setSecondaryCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [truckBrands, setTruckBrands] = useState(["Universal / All Brands"]);
  const [customBrand, setCustomBrand] = useState("");
  const [workshopType, setWorkshopType] = useState("independent");
  const [serviceSpecialisations, setServiceSpecialisations] = useState([]);
  const [customSpecialisation, setCustomSpecialisation] = useState("");
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [roadsideService, setRoadsideService] = useState(false);
  const [isPreferred, setIsPreferred] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("verified");
  const [workingHours, setWorkingHours] = useState("8:00 AM - 9:00 PM");
  const [internalNotes, setInternalNotes] = useState("");
  useEffect(() => {
    if (!isOpen) return;
    if (contact) {
      setCompanyName(contact.company_name || "");
      setOrganisationName(contact.organisation_name || "");
      const phoneList = (contact.phone_number || "").split(/[,;\/\n]+/).map((p) => p.trim()).filter(Boolean);
      setPrimaryPhone(phoneList[0] || "");
      setAlternatePhone(contact.alternate_phone || phoneList[1] || "");
      setWhatsappPhone(contact.whatsapp_number || "");
      setEmail(contact.email || "");
      setGstin(contact.gstin || "");
      setDesignation(contact.designation || "");
      setPhysicalAddress(contact.physical_address || "");
      setCity(contact.city || "Hyderabad");
      setArea(contact.area || "");
      setGoogleMapsUrl(contact.google_maps_url || contact.google_map_link || "");
      setMainGroup(contact.main_group || "Fleet Repairs & Services");
      setPrimaryCategory(contact.primary_category || contact.contact_type || "Mechanic");
      setSecondaryCategories(safeParseArray(contact.secondary_categories));
      setSubcategories(safeParseArray(contact.subcategories));
      const brands = safeParseArray(contact.truck_brands);
      setTruckBrands(brands.length > 0 ? brands : contact.truck_brand ? [contact.truck_brand] : ["Universal / All Brands"]);
      setWorkshopType(contact.workshop_type || "independent");
      setServiceSpecialisations(safeParseArray(contact.service_specialisations));
      setEmergencyAvailable(Boolean(contact.emergency_available));
      setRoadsideService(Boolean(contact.roadside_service));
      setIsPreferred(Boolean(contact.is_preferred));
      setVerificationStatus(contact.verification_status || "verified");
      setWorkingHours(contact.working_hours || "8:00 AM - 9:00 PM");
      const cleanNotes = (contact.notes || "").replace(/\[Location:\s*https?:\/\/[^\]]+\]/gi, "").replace(/\[Finance:\s*[^\]]+\]/gi, "").trim();
      setInternalNotes(cleanNotes);
    } else {
      setCompanyName("");
      setOrganisationName("");
      setPrimaryPhone("");
      setAlternatePhone("");
      setWhatsappPhone("");
      setEmail("");
      setGstin("");
      setDesignation("");
      setPhysicalAddress("");
      setCity("Hyderabad");
      setArea("");
      setGoogleMapsUrl("");
      setMainGroup("Fleet Repairs & Services");
      setPrimaryCategory("Mechanic");
      setSecondaryCategories([]);
      setSubcategories(["Engine Overhaul & Head Gasket", "General Mechanical Repair"]);
      setTruckBrands(["Universal / All Brands"]);
      setWorkshopType("independent");
      setServiceSpecialisations(["Engine Diagnostic & Overhaul"]);
      setEmergencyAvailable(true);
      setRoadsideService(true);
      setIsPreferred(false);
      setVerificationStatus("verified");
      setWorkingHours("8:00 AM - 9:00 PM");
      setInternalNotes("");
    }
  }, [isOpen, contact]);
  const currentGroupObj = MAIN_GROUPS_CONFIG.find((g) => g.title === mainGroup) || MAIN_GROUPS_CONFIG[0];
  const availableCategories = currentGroupObj.categories || [];
  const currentCategoryObj = availableCategories.find((c) => c.name === primaryCategory) || availableCategories[0];
  const availableSubcategories = currentCategoryObj?.subcategories || [];
  const availableSpecialisations = currentCategoryObj?.specialisations || [];
  const toggleBrand = (brand) => {
    if (brand === "Universal / All Brands") {
      setTruckBrands(["Universal / All Brands"]);
      return;
    }
    let updated = truckBrands.filter((b) => b !== "Universal / All Brands");
    if (updated.includes(brand)) {
      updated = updated.filter((b) => b !== brand);
      if (updated.length === 0) updated = ["Universal / All Brands"];
    } else {
      updated.push(brand);
    }
    setTruckBrands(updated);
  };
  const toggleSubcategory = (sub) => {
    if (subcategories.includes(sub)) {
      setSubcategories(subcategories.filter((s) => s !== sub));
    } else {
      setSubcategories([...subcategories, sub]);
    }
  };
  const toggleSpecialisation = (spec) => {
    if (serviceSpecialisations.includes(spec)) {
      setServiceSpecialisations(serviceSpecialisations.filter((s) => s !== spec));
    } else {
      setServiceSpecialisations([...serviceSpecialisations, spec]);
    }
  };
  const handleSubmit = async (e2) => {
    e2.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company / Contact Name is required");
      return;
    }
    if (!primaryPhone.trim()) {
      toast.error("Primary phone number is required");
      return;
    }
    if (!physicalAddress.trim()) {
      toast.error("Physical address or area location is required");
      return;
    }
    setSaving(true);
    try {
      const allPhones = [primaryPhone, alternatePhone].map((p) => p.trim()).filter(Boolean).join(", ");
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
        google_maps_url: googleMapsUrl.trim(),
        google_map_link: googleMapsUrl.trim(),
        location_url: googleMapsUrl.trim(),
        // Category Architecture
        main_group: mainGroup,
        primary_category: primaryCategory,
        contact_type: primaryCategory,
        // preserves backward compatibility for existing views
        secondary_categories: JSON.stringify(secondaryCategories),
        subcategories: JSON.stringify(subcategories),
        // Multi-Brand Support
        truck_brands: JSON.stringify(truckBrands),
        truck_brand: truckBrands.join(", "),
        // preserves backward compatibility for older cards
        workshop_type: workshopType,
        // Service Intelligence
        service_specialisations: JSON.stringify(serviceSpecialisations),
        emergency_available: emergencyAvailable ? 1 : 0,
        roadside_service: roadsideService ? 1 : 0,
        is_preferred: isPreferred ? 1 : 0,
        verification_status: verificationStatus,
        working_hours: workingHours.trim(),
        notes: internalNotes.trim(),
        created_by: currentUser?.id || ""
      };
      if (contact && contact.id) {
        await pb.collection("contacts").update(contact.id, payload, { $autoCancel: false });
        toast.success(`Contact "${companyName}" updated successfully!`);
      } else {
        await pb.collection("contacts").create(payload, { $autoCancel: false });
        toast.success(`Contact "${companyName}" created successfully!`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save contact:", err);
      toast.error(err.message || "Failed to save contact record");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ h.createElement(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose() }, /* @__PURE__ */ h.createElement(DialogContent, { className: "w-[96vw] max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-4 sm:p-6 rounded-2xl shadow-2xl" }, /* @__PURE__ */ h.createElement(DialogHeader, { className: "border-b border-slate-800 pb-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ h.createElement(DialogTitle, { className: "text-xl font-black text-white flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-primary text-2xl" }, "\u{1F4C7}"), contact ? `Edit CRM Contact: ${contact.company_name}` : "New Transport CRM & Service Contact"), /* @__PURE__ */ h.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold" }, "Production CRM v2.0")), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveTab("general"),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "general" ? "bg-primary text-primary-foreground shadow-md" : "bg-slate-800/60 text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F464}"),
    " Standard & Location"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveTab("category"),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "category" ? "bg-primary text-primary-foreground shadow-md" : "bg-slate-800/60 text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4C2}"),
    " Group & Subcategories"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveTab("service"),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "service" ? "bg-primary text-primary-foreground shadow-md" : "bg-slate-800/60 text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F527}"),
    " Multi-Brand & Intelligence"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveTab("corporate"),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "corporate" ? "bg-primary text-primary-foreground shadow-md" : "bg-slate-800/60 text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F3E2}"),
    " Corporate & Settings"
  ))), /* @__PURE__ */ h.createElement("form", { onSubmit: handleSubmit, className: "space-y-4 py-3" }, activeTab === "general" && /* @__PURE__ */ h.createElement("div", { className: "space-y-4 animate-in fade-in duration-150" }, /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Company / Shop / Contact Name *"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: companyName,
      onChange: (e2) => setCompanyName(e2.target.value),
      placeholder: "e.g. Sri Rama Auto Electricals / Royal Transport",
      className: "bg-slate-950 border-slate-800 text-white font-bold text-sm",
      required: true
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Designation / Role in Transport"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: designation,
      onChange: (e2) => setDesignation(e2.target.value),
      placeholder: "e.g. Master Mechanic / Logistics Head / Owner",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  ))), /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-emerald-400 flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE}"), " Phone Numbers & WhatsApp Lines"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-slate-400" }, "Preserves multiple numbers without comma clobbering")), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, "Primary Mobile *"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: primaryPhone,
      onChange: (e2) => setPrimaryPhone(e2.target.value),
      placeholder: "e.g. 9849735080",
      className: "bg-slate-900 border-slate-800 text-emerald-400 font-mono font-bold text-xs",
      required: true
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, "Alternate / Office"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: alternatePhone,
      onChange: (e2) => setAlternatePhone(e2.target.value),
      placeholder: "e.g. 9000250452",
      className: "bg-slate-900 border-slate-800 text-slate-300 font-mono text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, "WhatsApp Dedicated"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: whatsappPhone,
      onChange: (e2) => setWhatsappPhone(e2.target.value),
      placeholder: "e.g. 9849735080",
      className: "bg-slate-900 border-slate-800 text-teal-400 font-mono text-xs"
    }
  )))), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ h.createElement("div", { className: "sm:col-span-2 space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Physical Address / Workshop Location *"), /* @__PURE__ */ h.createElement(
    Textarea,
    {
      value: physicalAddress,
      onChange: (e2) => setPhysicalAddress(e2.target.value),
      placeholder: "Shop No, Landmark, Highway KM marker, Auto Nagar...",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs min-h-[60px]",
      required: true
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "City Hub"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: city,
      onChange: (e2) => setCity(e2.target.value),
      placeholder: "e.g. Hyderabad / Bhiwandi / Bengaluru",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Area / Transport Cluster"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: area,
      onChange: (e2) => setArea(e2.target.value),
      placeholder: "e.g. Ghatkesar / Autonagar / Peddamberpet",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  )))), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-rose-400 flex items-center gap-1" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F5FA}\uFE0F"), " Google Maps GPS Navigation Link"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: googleMapsUrl,
      onChange: (e2) => setGoogleMapsUrl(e2.target.value),
      placeholder: "https://maps.app.goo.gl/... (Enables 1-click driver GPS routing)",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono"
    }
  ))), activeTab === "category" && /* @__PURE__ */ h.createElement("div", { className: "space-y-4 animate-in fade-in duration-150" }, /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Main Group (8 Master Groups) *"), /* @__PURE__ */ h.createElement(
    "select",
    {
      value: mainGroup,
      onChange: (e2) => {
        const newGroup = e2.target.value;
        setMainGroup(newGroup);
        const gObj = MAIN_GROUPS_CONFIG.find((g) => g.title === newGroup);
        if (gObj && gObj.categories.length > 0) {
          setPrimaryCategory(gObj.categories[0].name);
          setSubcategories(gObj.categories[0].subcategories.slice(0, 2));
        }
      },
      className: "w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
    },
    MAIN_GROUPS_CONFIG.map((g) => /* @__PURE__ */ h.createElement("option", { key: g.id, value: g.title }, g.code, " \u2014 ", g.title))
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Primary Category *"), /* @__PURE__ */ h.createElement(
    "select",
    {
      value: primaryCategory,
      onChange: (e2) => {
        const newCat = e2.target.value;
        setPrimaryCategory(newCat);
        const cObj = availableCategories.find((c) => c.name === newCat);
        if (cObj) {
          setSubcategories(cObj.subcategories.slice(0, 2));
        }
      },
      className: "w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
    },
    availableCategories.map((c) => /* @__PURE__ */ h.createElement("option", { key: c.id, value: c.name }, c.name))
  ))), /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Subcategories (Multi-Select Supported)"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-primary font-bold" }, subcategories.length, " Selected")), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, availableSubcategories.map((sub) => {
    const isSelected = subcategories.includes(sub);
    return /* @__PURE__ */ h.createElement(
      "button",
      {
        key: sub,
        type: "button",
        onClick: () => toggleSubcategory(sub),
        className: `text-xs px-2.5 py-1 rounded-lg border transition-all ${isSelected ? "bg-primary/20 border-primary text-primary font-bold shadow-sm" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`
      },
      isSelected ? "\u2713 " : "+ ",
      " ",
      sub
    );
  })), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-800/80" }, /* @__PURE__ */ h.createElement(
    Input,
    {
      value: customSubcategory,
      onChange: (e2) => setCustomSubcategory(e2.target.value),
      placeholder: "Add custom subcategory tag...",
      className: "bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
    }
  ), /* @__PURE__ */ h.createElement(
    Button,
    {
      type: "button",
      size: "sm",
      variant: "outline",
      className: "h-8 text-xs border-slate-700",
      onClick: () => {
        if (customSubcategory.trim() && !subcategories.includes(customSubcategory.trim())) {
          setSubcategories([...subcategories, customSubcategory.trim()]);
          setCustomSubcategory("");
        }
      }
    },
    "Add Subcategory"
  )))), activeTab === "service" && /* @__PURE__ */ h.createElement("div", { className: "space-y-4 animate-in fade-in duration-150" }, /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-amber-400 flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F69B}"), " Centrally Managed Truck Brands (Multi-Select)"), /* @__PURE__ */ h.createElement("p", { className: "text-[10px] text-slate-400" }, "Select all manufacturer brands this workshop or technician supports")), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, "Centre Type:"), /* @__PURE__ */ h.createElement(
    "select",
    {
      value: workshopType,
      onChange: (e2) => setWorkshopType(e2.target.value),
      className: "h-7 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-bold px-2"
    },
    /* @__PURE__ */ h.createElement("option", { value: "independent" }, "Independent Workshop"),
    /* @__PURE__ */ h.createElement("option", { value: "authorised" }, "Authorised OEM Centre"),
    /* @__PURE__ */ h.createElement("option", { value: "roadside" }, "Roadside Mobile Van")
  ))), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, TRUCK_BRANDS_MASTER.map((brand) => {
    const isSelected = truckBrands.includes(brand);
    return /* @__PURE__ */ h.createElement(
      "button",
      {
        key: brand,
        type: "button",
        onClick: () => toggleBrand(brand),
        className: `text-xs px-2.5 py-1 rounded-lg border transition-all ${isSelected ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`
      },
      isSelected ? "\u2713 " : "+ ",
      " ",
      brand
    );
  })), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-800/80" }, /* @__PURE__ */ h.createElement(
    Input,
    {
      value: customBrand,
      onChange: (e2) => setCustomBrand(e2.target.value),
      placeholder: "Add custom truck brand (e.g. Scania, Force)...",
      className: "bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
    }
  ), /* @__PURE__ */ h.createElement(
    Button,
    {
      type: "button",
      size: "sm",
      variant: "outline",
      className: "h-8 text-xs border-slate-700",
      onClick: () => {
        if (customBrand.trim() && !truckBrands.includes(customBrand.trim())) {
          setTruckBrands([...truckBrands.filter((b) => b !== "Universal / All Brands"), customBrand.trim()]);
          setCustomBrand("");
        }
      }
    },
    "Add Brand"
  ))), /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Service Specialisations (Repair Expertise)"), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, availableSpecialisations.map((spec) => {
    const isSelected = serviceSpecialisations.includes(spec);
    return /* @__PURE__ */ h.createElement(
      "button",
      {
        key: spec,
        type: "button",
        onClick: () => toggleSpecialisation(spec),
        className: `text-xs px-2.5 py-1 rounded-lg border transition-all ${isSelected ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-sm" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`
      },
      isSelected ? "\u2713 " : "+ ",
      " ",
      spec
    );
  })), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-800/80" }, /* @__PURE__ */ h.createElement(
    Input,
    {
      value: customSpecialisation,
      onChange: (e2) => setCustomSpecialisation(e2.target.value),
      placeholder: "Add custom specialisation...",
      className: "bg-slate-900 border-slate-800 text-xs h-8 text-slate-200 flex-1"
    }
  ), /* @__PURE__ */ h.createElement(
    Button,
    {
      type: "button",
      size: "sm",
      variant: "outline",
      className: "h-8 text-xs border-slate-700",
      onClick: () => {
        if (customSpecialisation.trim() && !serviceSpecialisations.includes(customSpecialisation.trim())) {
          setServiceSpecialisations([...serviceSpecialisations, customSpecialisation.trim()]);
          setCustomSpecialisation("");
        }
      }
    },
    "Add Specialisation"
  ))), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ h.createElement("label", { className: "flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950" }, /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "checkbox",
      checked: emergencyAvailable,
      onChange: (e2) => setEmergencyAvailable(e2.target.checked),
      className: "rounded text-primary focus:ring-0"
    }
  ), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold text-slate-200 block" }, "\u{1F6A8} 24/7 Emergency"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-slate-400" }, "Available for night breakdown"))), /* @__PURE__ */ h.createElement("label", { className: "flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950" }, /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "checkbox",
      checked: roadsideService,
      onChange: (e2) => setRoadsideService(e2.target.checked),
      className: "rounded text-primary focus:ring-0"
    }
  ), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold text-slate-200 block" }, "\u{1F6E0}\uFE0F Roadside / On-site"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-slate-400" }, "Dispatches mechanic to truck"))), /* @__PURE__ */ h.createElement("label", { className: "flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-950" }, /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "checkbox",
      checked: isPreferred,
      onChange: (e2) => setIsPreferred(e2.target.checked),
      className: "rounded text-primary focus:ring-0"
    }
  ), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold text-amber-300 block" }, "\u2B50 Preferred Vendor"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-slate-400" }, "High priority dispatch status"))))), activeTab === "corporate" && /* @__PURE__ */ h.createElement("div", { className: "space-y-4 animate-in fade-in duration-150" }, /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Parent Corporate / Organisation"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: organisationName,
      onChange: (e2) => setOrganisationName(e2.target.value),
      placeholder: "e.g. Tata Steel / Flipkart / Reliance Hub",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "GSTIN Tax Registration"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: gstin,
      onChange: (e2) => setGstin(e2.target.value.toUpperCase()),
      placeholder: "15-character GSTIN (Optional)",
      maxLength: 15,
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono uppercase"
    }
  ))), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Email Address"), /* @__PURE__ */ h.createElement(
    Input,
    {
      type: "email",
      value: email,
      onChange: (e2) => setEmail(e2.target.value),
      placeholder: "contact@company.com",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Working Hours"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: workingHours,
      onChange: (e2) => setWorkingHours(e2.target.value),
      placeholder: "e.g. 24 Hours / 9:00 AM - 8:00 PM",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Verification Status"), /* @__PURE__ */ h.createElement(
    "select",
    {
      value: verificationStatus,
      onChange: (e2) => setVerificationStatus(e2.target.value),
      className: "w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 font-semibold focus:outline-none"
    },
    /* @__PURE__ */ h.createElement("option", { value: "verified" }, "Verified Contact"),
    /* @__PURE__ */ h.createElement("option", { value: "pending" }, "Verification Pending"),
    /* @__PURE__ */ h.createElement("option", { value: "unverified" }, "Unverified / Raw Contact")
  ))), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement(Label, { className: "text-xs font-bold text-slate-300" }, "Internal Fleet Notes & Past History"), /* @__PURE__ */ h.createElement(
    Textarea,
    {
      value: internalNotes,
      onChange: (e2) => setInternalNotes(e2.target.value),
      placeholder: "Rates negotiated, reliable for night repairs, past experience with Hyderabad fleet...",
      className: "bg-slate-950 border-slate-800 text-slate-200 text-xs min-h-[70px]"
    }
  ))), /* @__PURE__ */ h.createElement(DialogFooter, { className: "pt-3 border-t border-slate-800 flex items-center justify-between gap-3" }, /* @__PURE__ */ h.createElement("div", { className: "text-[11px] text-slate-400" }, "* Required fields: Company Name, Primary Phone, Physical Address"), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement(Button, { type: "button", variant: "outline", onClick: onClose, disabled: saving, className: "border-slate-700 text-slate-300 text-xs" }, "Cancel"), /* @__PURE__ */ h.createElement(Button, { type: "submit", disabled: saving, className: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md" }, saving && /* @__PURE__ */ h.createElement(Loader2, { className: "w-4 h-4 animate-spin mr-1" }), contact ? "Update CRM Contact" : "Save CRM Contact"))))));
}


function te(r){if(!r)return"";const p=[r.company_name,r.physical_address,r.warehouse_name,r.designation].filter(Boolean).join(", "),t=[r.google_maps_url,r.google_map_link,r.maps_url,r.location_url,r.map_url,r.google_map,r.maps_link,r.location,r.link,r.url];for(const b of t)if(b&&typeof b=="string"&&b.trim()){const u=ge(b,p);if(u)return u}for(const b of Object.keys(r)){const u=r[b];if(typeof u=="string"&&u.trim()&&(u.includes("maps")||u.includes("goo.gl"))){const C=u.match(/(https?:\/\/[^\s\]\)>"']+|maps\.app\.goo\.gl[^\s\]\)>"']+|goo\.gl\/maps[^\s\]\)>"']+|google\.com\/maps[^\s\]\)>"']+|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\/[^\s\]\)>"']+)/i);if(C){const j=C[1].replace(/[\]\)\}>\s.,;'"]+$/,"").trim();return ge(j,p)}}}return p?ge("",p):""}function Re(r){if(!r)return"";let p=te(r);if(!p&&(r.physical_address||r.company_name)){const u=[r.company_name,r.physical_address].filter(Boolean).join(", ");p=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u)}`}const t=r.notes?r.notes.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi,"").replace(/Location:\s*https?:\/\/[^\s\n]+/gi,"").trim():"";return[`📍 *${r.company_name||"Contact Info"}* (${r.contact_type||"Contact"})`,"",r.phone_number?`📞 *Phone:* ${r.phone_number}`:null,r.email?`✉️ *Email:* ${r.email}`:null,r.gstin?`📄 *GSTIN:* ${r.gstin}`:null,r.truck_brand?`🔧 *Brands Serviced:* ${r.truck_brand}`:null,"",r.physical_address&&!r.physical_address.startsWith("http")?`🏢 *Address:* ${r.physical_address}`:null,p?`🗺️ *Location:* ${p}`:null,"",t&&!t.startsWith("http")?`📝 *Notes:* ${t}`:null,"","Shared via Jai Bhavani Cargo"].filter(u=>u!==null).join(`
`)}async function Ue(r){if(!r)return;const p=Re(r);if(navigator.share)try{await navigator.share({title:r.company_name||"Contact Info",text:p});return}catch(b){if(b.name!=="AbortError")console.warn("Web Share API failed, falling back to WhatsApp:",b);else return}const t=encodeURIComponent(p);window.open(`https://wa.me/?text=${t}`,"_blank")}async function Ve(r){if(!r)return;const p=Re(r);try{await navigator.clipboard.writeText(p),S.success("Contact details copied to clipboard!")}catch(t){console.error("Failed to copy contact details:",t),S.error("Failed to copy contact details.")}}



function Sa({ isOpen, onClose, contact, onEdit, imports }) {
  const { e, h, Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge, Phone, Mail, MapPin, Wrench, Building, Copy, Share2, Check, ExternalLink, ShieldCheck, Star } = imports;
  if (!contact) return null;
  const brands = safeParseArray(contact.truck_brands);
  const subcats = safeParseArray(contact.subcategories);
  const specs = safeParseArray(contact.service_specialisations);
  const phoneNumbers = (contact.phone_number || "").split(/[,;\/\n]+/).map((p) => p.trim()).filter(Boolean);
  const mapsUrl = contact.google_maps_url || contact.google_map_link || contact.location_url || "";
  const copyDetails = async () => {
    const summary = [
      `\u{1F4CD} *${contact.company_name}* (${contact.main_group || contact.contact_type || "Transport Directory"})`,
      contact.organisation_name && contact.organisation_name !== contact.company_name ? `\u{1F3E2} Organisation: ${contact.organisation_name}` : null,
      contact.designation ? `\u{1F464} Designation: ${contact.designation}` : null,
      phoneNumbers.length > 0 ? `\u{1F4DE} Phone(s): ${phoneNumbers.join(", ")}` : null,
      contact.email ? `\u2709\uFE0F Email: ${contact.email}` : null,
      contact.gstin ? `\u{1F4C4} GSTIN: ${contact.gstin}` : null,
      brands.length > 0 ? `\u{1F69B} Supported Brands: ${brands.join(", ")}` : null,
      subcats.length > 0 ? `\u{1F4C2} Services: ${subcats.join(", ")}` : null,
      contact.physical_address ? `\u{1F3E2} Address: ${contact.physical_address}` : null,
      mapsUrl ? `\u{1F5FA}\uFE0F Maps: ${mapsUrl}` : null,
      contact.notes ? `\u{1F4DD} Notes: ${contact.notes}` : null,
      `
Shared via Jai Bhavani Cargo Fleet CRM`
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      imports.toast.success("Full Contact Dossier copied to clipboard!");
    } catch {
      imports.toast.error("Failed to copy contact details");
    }
  };
  const shareWhatsApp = () => {
    const summary = [
      `\u{1F4C7} *${contact.company_name}*`,
      contact.main_group ? `\u{1F4C2} Group: ${contact.main_group}` : null,
      contact.primary_category ? `\u{1F527} Role: ${contact.primary_category}` : null,
      phoneNumbers.length > 0 ? `\u{1F4DE} Call: ${phoneNumbers[0]}` : null,
      contact.physical_address ? `\u{1F4CD} Address: ${contact.physical_address}` : null,
      mapsUrl ? `\u{1F5FA}\uFE0F Google Maps: ${mapsUrl}` : null,
      `_Jai Bhavani Cargo CRM_`
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, "_blank");
  };
  return /* @__PURE__ */ h.createElement(Dialog, { open: isOpen, onOpenChange: onClose }, /* @__PURE__ */ h.createElement(DialogContent, { className: "w-[96vw] max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl" }, /* @__PURE__ */ h.createElement(DialogHeader, { className: "border-b border-slate-800 pb-4" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 flex-wrap mb-2" }, /* @__PURE__ */ h.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30" }, contact.main_group || "Fleet Services"), /* @__PURE__ */ h.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700" }, contact.primary_category || contact.contact_type), contact.is_preferred ? /* @__PURE__ */ h.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1" }, "\u2B50 Preferred") : null, contact.emergency_available ? /* @__PURE__ */ h.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1" }, "\u{1F6A8} 24/7 Night Service") : null), /* @__PURE__ */ h.createElement(DialogTitle, { className: "text-2xl font-black text-white tracking-tight" }, contact.company_name), contact.organisation_name && contact.organisation_name !== contact.company_name && /* @__PURE__ */ h.createElement("p", { className: "text-xs text-slate-400 mt-1 flex items-center gap-1 font-semibold" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F3E2}"), " Entity: ", contact.organisation_name)), contact.verification_status === "verified" && /* @__PURE__ */ h.createElement("span", { className: "px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0" }, "\u2713 Verified"))), /* @__PURE__ */ h.createElement("div", { className: "space-y-5 py-3" }, /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 block" }, "Direct Contact Lines"), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" }, phoneNumbers.map((ph, idx) => /* @__PURE__ */ h.createElement("div", { key: idx, className: "flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 gap-2" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 min-w-0" }, /* @__PURE__ */ h.createElement("span", { className: "text-emerald-400 text-sm" }, "\u{1F4DE}"), /* @__PURE__ */ h.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ h.createElement("span", { className: "font-mono font-bold text-sm text-white block truncate" }, ph), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-slate-400 block" }, idx === 0 ? "Primary Number" : `Alternate #${idx + 1}`))), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5 shrink-0" }, /* @__PURE__ */ h.createElement(
    "a",
    {
      href: `tel:${ph.replace(/\D/g, "")}`,
      className: "px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
    },
    "Call"
  ), /* @__PURE__ */ h.createElement(
    "a",
    {
      href: `https://wa.me/${ph.replace(/\D/g, "").startsWith("91") ? ph.replace(/\D/g, "") : "91" + ph.replace(/\D/g, "")}`,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
    },
    "WhatsApp"
  )))))), brands.length > 0 && /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-amber-400 block" }, "\u{1F69B} Supported Truck Brands & Workshop Type"), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, brands.map((b) => /* @__PURE__ */ h.createElement("span", { key: b, className: "px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30" }, b)), contact.workshop_type && /* @__PURE__ */ h.createElement("span", { className: "px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 capitalize" }, contact.workshop_type, " Centre"))), (subcats.length > 0 || specs.length > 0) && /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, subcats.length > 0 && /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 block" }, "\u{1F4C2} Subcategories & Capabilities"), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-1.5 pt-1" }, subcats.map((s) => /* @__PURE__ */ h.createElement("span", { key: s, className: "px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800" }, "\u2022 ", s)))), specs.length > 0 && /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400 block" }, "\u{1F527} Repair Specialisations"), /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-1.5 pt-1" }, specs.map((s) => /* @__PURE__ */ h.createElement("span", { key: s, className: "px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" }, "\u2713 ", s))))), /* @__PURE__ */ h.createElement("div", { className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-rose-400 block" }, "\u{1F4CD} Workshop Address & Regional Hub"), /* @__PURE__ */ h.createElement("p", { className: "text-xs text-slate-200 leading-relaxed" }, contact.physical_address || "No physical address provided."), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-3 pt-1 text-xs text-slate-400" }, contact.city && /* @__PURE__ */ h.createElement("span", null, /* @__PURE__ */ h.createElement("strong", null, "City:"), " ", contact.city), contact.area && /* @__PURE__ */ h.createElement("span", null, /* @__PURE__ */ h.createElement("strong", null, "Area:"), " ", contact.area), contact.working_hours && /* @__PURE__ */ h.createElement("span", null, /* @__PURE__ */ h.createElement("strong", null, "Hours:"), " ", contact.working_hours)), mapsUrl && /* @__PURE__ */ h.createElement(
    "a",
    {
      href: mapsUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F5FA}\uFE0F"),
    " Open Google Maps GPS Navigation"
  )), (contact.gstin || contact.email || contact.designation) && /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs" }, contact.gstin && /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-slate-400 font-bold block" }, "GSTIN"), /* @__PURE__ */ h.createElement("span", { className: "font-mono text-white font-semibold" }, contact.gstin)), contact.email && /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-slate-400 font-bold block" }, "Email"), /* @__PURE__ */ h.createElement("a", { href: `mailto:${contact.email}`, className: "text-primary hover:underline truncate block" }, contact.email)), contact.designation && /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-slate-400 font-bold block" }, "Designation"), /* @__PURE__ */ h.createElement("span", { className: "text-slate-200 font-medium" }, contact.designation))), contact.notes && /* @__PURE__ */ h.createElement("div", { className: "p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block" }, "Internal Fleet Notes"), /* @__PURE__ */ h.createElement("p", { className: "text-xs text-slate-300 italic whitespace-pre-wrap" }, '"', contact.notes, '"'))), /* @__PURE__ */ h.createElement("div", { className: "pt-4 border-t border-slate-800 flex items-center justify-between gap-2" }, /* @__PURE__ */ h.createElement(Button, { variant: "outline", onClick: copyDetails, className: "border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold gap-1.5" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4CB}"), " Copy Dossier"), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement(Button, { onClick: shareWhatsApp, className: "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4AC}"), " WhatsApp"), /* @__PURE__ */ h.createElement(Button, { onClick: () => {
    onClose();
    onEdit(contact);
  }, className: "bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5" }, /* @__PURE__ */ h.createElement("span", null, "\u270F\uFE0F"), " Edit Record")))));
}


function Ta({contact:r,onView:p,onEdit:t,onDelete:b,onSendApi:u}){const C=()=>{Ve(r)},j=()=>{Ue(r)},N=y=>{y?.preventDefault(),y?.stopPropagation();const x=te(r);x?Ie(x):S.error("No Google Maps link available for this contact")},c=te(r);return e.jsxs(ha,{children:[e.jsx(pa,{asChild:!0,children:e.jsxs(P,{variant:"ghost",className:"h-8 w-8 p-0",children:[e.jsx("span",{className:"sr-only",children:"Open menu"}),e.jsx(He,{className:"h-4 w-4"})]})}),e.jsxs(ua,{align:"end",className:"w-52 bg-card border-border shadow-xl z-50",children:[u&&e.jsxs(G,{onClick:()=>u(r),className:"cursor-pointer font-bold text-emerald-500 bg-emerald-500/10",children:[e.jsx(fe,{className:"mr-2 h-4 w-4 text-emerald-500"})," 1-Click Send via API"]}),e.jsxs(G,{onClick:()=>p(r),className:"cursor-pointer",children:[e.jsx(ze,{className:"mr-2 h-4 w-4 text-primary"})," View Card"]}),e.jsxs(G,{onClick:()=>window.location.href=`tel:${r.phone_number}`,className:"cursor-pointer",children:[e.jsx(ae,{className:"mr-2 h-4 w-4 text-emerald-500"})," Call ",r.phone_number?`(${r.phone_number})`:""]}),!!c&&e.jsxs(G,{onClick:N,className:"cursor-pointer text-rose-600 dark:text-rose-400 font-semibold",children:[e.jsx(se,{className:"mr-2 h-4 w-4 text-rose-500"})," Open Maps Navigation"]}),r.email&&e.jsxs(G,{onClick:()=>window.open(`mailto:${r.email}`),className:"cursor-pointer",children:[e.jsx(Ne,{className:"mr-2 h-4 w-4 text-blue-400"})," Email"]}),e.jsx(Fe,{}),e.jsxs(G,{onClick:j,className:"cursor-pointer font-bold text-primary",children:[e.jsx(fe,{className:"mr-2 h-4 w-4 text-primary"})," Share Contact & Map"]}),e.jsxs(G,{onClick:C,className:"cursor-pointer",children:[e.jsx(we,{className:"mr-2 h-4 w-4"})," Copy Details"]}),e.jsx(Fe,{}),e.jsxs(G,{onClick:()=>t(r),className:"cursor-pointer",children:[e.jsx(Ye,{className:"mr-2 h-4 w-4"})," Edit"]}),e.jsxs(G,{onClick:()=>b(r),className:"text-destructive focus:text-destructive cursor-pointer",children:[e.jsx(Ke,{className:"mr-2 h-4 w-4"})," Delete"]})]})]})}

function Aa({isOpen:r,onClose:p}){const[t,b]=h.useState(!1),[u,C]=h.useState("All"),[j,N]=h.useState({company_name:!0,contact_type:!0,phone_number:!0,email:!0,gstin:!0,physical_address:!0,notes:!1,created:!1}),c=x=>{N(s=>({...s,[x]:!s[x]}))},y=async()=>{const x=Object.keys(j).filter(s=>j[s]);if(x.length===0){S.error("Please select at least one field to export");return}b(!0);try{let s="";u!=="All"&&(s=`contact_type="${u}"`);const d=await W.collection("contacts").getFullList({filter:s,sort:"-created",$autoCancel:!1});if(d.length===0){S.info("No contacts found for the selected criteria"),b(!1);return}const I=d.map(v=>{const w={};return x.forEach(B=>{w[B]=v[B]||""}),w}),i=ga.unparse(I),m=new Blob([i],{type:"text/csv;charset=utf-8;"}),M=document.createElement("url"),O=URL.createObjectURL(m),L=document.createElement("a");L.href=O,L.download=`contacts_export_${u.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(L),L.click(),document.body.removeChild(L),URL.revokeObjectURL(O),S.success(`Successfully exported ${d.length} contacts`),p()}catch(s){console.error("Export failed:",s),S.error("Failed to export contacts")}finally{b(!1)}};return e.jsx(le,{open:r,onOpenChange:x=>!x&&p(),children:e.jsxs(oe,{className:"sm:max-w-[400px] bg-card text-card-foreground",children:[e.jsx(he,{children:e.jsx(pe,{children:"Export Contacts"})}),e.jsxs("div",{className:"space-y-6 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{children:"Export Category"}),e.jsxs(Y,{value:u,onValueChange:C,children:[e.jsx(K,{className:"bg-background",children:e.jsx(J,{placeholder:"Select category"})}),e.jsxs(Z,{children:[e.jsx(n,{value:"All",children:"All Contacts"}),e.jsx(n,{value:"Client",children:"Clients Only"}),e.jsx(n,{value:"Driver",children:"Drivers Only"}),e.jsx(n,{value:"Vendor",children:"Vendors Only"})]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(g,{children:"Fields to Include"}),e.jsx("div",{className:"grid grid-cols-2 gap-3 bg-muted/20 p-4 rounded-lg border border-border",children:Object.entries(j).map(([x,s])=>e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(xa,{id:`field-${x}`,checked:s,onCheckedChange:()=>c(x)}),e.jsx("label",{htmlFor:`field-${x}`,className:"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize",children:x.replace("_"," ")})]},x))})]})]}),e.jsxs(ue,{children:[e.jsx(P,{variant:"outline",onClick:p,disabled:t,children:"Cancel"}),e.jsxs(P,{onClick:y,disabled:t,children:[t?e.jsx(me,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(Be,{className:"w-4 h-4 mr-2"}),"Download CSV"]})]})]})})}

const Pe=["Client","Corporate","Vendor","Driver","Employee","Mechanic","Electrician","Puncture Shop","Showroom","Spare Parts","Bodywork / Welding","Crane / Tow Truck","Hydraulics","Plastics","Washing Centre","RTO Agent","Banking","Loan Agent","Warehouse","Other"];function Oa({isOpen:r,onClose:p,onSuccess:t}){const{currentUser:b}=We(),[u,C]=h.useState("upload"),[j,N]=h.useState(!1),[c,y]=h.useState({company_name:"",contact_person:"",designation:"",contact_type:"Client",phone_number:"",alternate_phone:"",email:"",website:"",gstin:"",physical_address:"",notes:"",card_file:null,preview_url:""}),x=(i,m,M)=>{y({company_name:i.company_name||i.contact_person||"",contact_person:i.contact_person||"",designation:i.designation||"",contact_type:Pe.includes(i.contact_type)?i.contact_type:"Client",phone_number:i.phone_number||"",alternate_phone:i.alternate_phone||"",email:i.email||"",website:i.website||"",gstin:i.gstin||"",physical_address:i.physical_address||"",notes:i.notes||"",card_file:m,preview_url:M||""}),C("form"),S.success("Visiting card extracted accurately! Please review & save.")},s=i=>{S.error(i),C("upload")},d=()=>{C("upload"),y({company_name:"",contact_person:"",designation:"",contact_type:"Client",phone_number:"",alternate_phone:"",email:"",website:"",gstin:"",physical_address:"",notes:"",card_file:null,preview_url:""})},I=async i=>{if(i.preventDefault(),!c.company_name.trim()&&!c.contact_person.trim()){S.error("Company Name or Contact Person is required");return}N(!0);try{let m="";if(c.card_file)try{const O=new FormData;O.append("file",c.card_file),O.append("truck_id","VISITING_CARD"),O.append("document_type","Other"),O.append("document_name",`Visiting Card - ${c.company_name||c.contact_person}`),O.append("notes",`Visiting card image for ${c.company_name}`);const L=await W.collection("truck_documents").create(O,{$autoCancel:!1});m=W.files.getURL(L,L.file)}catch(O){console.warn("Card image upload warning:",O)}const M={contact_type:c.contact_type,company_name:c.company_name.trim(),contact_person:c.contact_person.trim(),designation:c.designation.trim(),phone_number:c.phone_number.trim(),alternate_phone:c.alternate_phone.trim(),email:c.email.trim(),website:c.website.trim(),gstin:c.gstin.trim(),physical_address:c.physical_address.trim(),notes:c.notes.trim(),card_image_url:m||c.preview_url||"",created_by:b?.id||""};await W.collection("contacts").create(M,{$autoCancel:!1}),S.success(`Contact "${M.company_name||M.contact_person}" saved from Visiting Card!`),t&&t(),d(),p()}catch(m){console.error("Save failed:",m),S.error(m.message||"Failed to save contact")}finally{N(!1)}};return e.jsx(le,{open:r,onOpenChange:i=>{!i&&!j&&(d(),p())},children:e.jsxs(oe,{className:"max-w-2xl bg-card border-border shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto font-sans",children:[e.jsx(he,{className:"pb-3 border-b border-border/40",children:e.jsxs(pe,{className:"text-xl font-extrabold flex items-center gap-2",children:[e.jsx(De,{className:"w-5 h-5 text-primary"}),u==="upload"?"Scan Visiting / Business Card":"Extracted Contact Details"]})}),u==="upload"?e.jsx("div",{className:"py-4",children:e.jsx(_a,{onExtractionComplete:x,onError:s})}):e.jsxs("form",{onSubmit:I,className:"space-y-4 pt-3",children:[c.preview_url&&e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50",children:[e.jsx("div",{className:"w-24 h-16 rounded-lg overflow-hidden border border-border bg-black/40 flex-shrink-0",children:e.jsx("img",{src:c.preview_url,alt:"Card preview",className:"w-full h-full object-cover"})}),e.jsxs("div",{children:[e.jsx(ne,{variant:"outline",className:"text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold mb-1",children:"✨ AI Extraction Verified"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Review and edit any field before saving into your Contacts database."})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(ee,{className:"w-3.5 h-3.5 text-primary"})," Company / Firm Name *"]}),e.jsx(k,{value:c.company_name,onChange:i=>y(m=>({...m,company_name:i.target.value})),placeholder:"e.g. Jai Bhavani Logistics Pvt Ltd",className:"bg-background font-bold text-sm",required:!0})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"font-semibold text-xs text-foreground",children:"Contact Category"}),e.jsxs(Y,{value:c.contact_type,onValueChange:i=>y(m=>({...m,contact_type:i})),children:[e.jsx(K,{className:"bg-background font-semibold text-xs",children:e.jsx(J,{})}),e.jsx(Z,{children:Pe.map(i=>e.jsx(n,{value:i,children:i},i))})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(Je,{className:"w-3.5 h-3.5 text-primary"})," Contact Person Name"]}),e.jsx(k,{value:c.contact_person,onChange:i=>y(m=>({...m,contact_person:i.target.value})),placeholder:"e.g. Rajesh Sharma",className:"bg-background"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"font-semibold text-xs text-foreground",children:"Designation / Title"}),e.jsx(k,{value:c.designation,onChange:i=>y(m=>({...m,designation:i.target.value})),placeholder:"e.g. Managing Director / Partner",className:"bg-background"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-emerald-400"})," Primary Mobile / Phone *"]}),e.jsx(k,{value:c.phone_number,onChange:i=>y(m=>({...m,phone_number:i.target.value})),placeholder:"+91 98765 43210",className:"bg-background font-mono font-bold",required:!0})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-blue-400"})," Alternate / WhatsApp No."]}),e.jsx(k,{value:c.alternate_phone,onChange:i=>y(m=>({...m,alternate_phone:i.target.value})),placeholder:"Secondary mobile or WhatsApp...",className:"bg-background font-mono"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(Ne,{className:"w-3.5 h-3.5 text-amber-400"})," Email Address"]}),e.jsx(k,{value:c.email,onChange:i=>y(m=>({...m,email:i.target.value})),placeholder:"info@company.com",className:"bg-background text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(Ze,{className:"w-3.5 h-3.5 text-cyan-400"})," Website URL"]}),e.jsx(k,{value:c.website,onChange:i=>y(m=>({...m,website:i.target.value})),placeholder:"www.company.com",className:"bg-background text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(Qe,{className:"w-3.5 h-3.5 text-purple-400"})," GSTIN No."]}),e.jsx(k,{value:c.gstin,onChange:i=>y(m=>({...m,gstin:i.target.value})),placeholder:"36AAAAA0000A1Z5",className:"bg-background font-mono text-xs uppercase"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"font-semibold text-xs text-foreground flex items-center gap-1",children:[e.jsx(se,{className:"w-3.5 h-3.5 text-rose-400"})," Office / Factory Address"]}),e.jsx(k,{value:c.physical_address,onChange:i=>y(m=>({...m,physical_address:i.target.value})),placeholder:"Street address, landmark, city, state, pincode...",className:"bg-background text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"font-semibold text-xs text-foreground",children:"Notes & Extra Card Information"}),e.jsx(ke,{value:c.notes,onChange:i=>y(m=>({...m,notes:i.target.value})),placeholder:"Services offered, branch locations, bank details listed on card...",className:"bg-background min-h-[60px] text-xs"})]}),e.jsxs(ue,{className:"pt-3 border-t border-border/40 gap-2",children:[e.jsxs(P,{type:"button",variant:"outline",onClick:d,className:"rounded-xl text-xs",children:[e.jsx(Xe,{className:"w-3.5 h-3.5 mr-1"})," Rescan Card"]}),e.jsxs(P,{type:"submit",disabled:j,className:"rounded-xl shadow-md font-bold text-xs",children:[j?e.jsx(me,{className:"w-4 h-4 animate-spin mr-1.5"}):e.jsx(ea,{className:"w-4 h-4 mr-1.5"}),"Save to Contacts"]})]})]})]})})}

function Fa({isOpen:r,onClose:p,contact:t}){const[b,u]=h.useState("custom"),[C,j]=h.useState(""),[N,c]=h.useState(""),[y,x]=h.useState(""),[s,d]=h.useState(!1),[I,i]=h.useState([]);if(h.useEffect(()=>{r&&((async()=>{try{const w=await W.collection("users").getFullList({sort:"name",$autoCancel:!1});w&&w.length>0?i(w):i([{id:"u1",name:"Duty Dispatcher",phone:"7794072244"},{id:"u2",name:"Fleet Supervisor",phone:"9848012345"},{id:"u3",name:"Nagpur Yard Manager",phone:"9848054321"}])}catch{i([{id:"u1",name:"Duty Dispatcher",phone:"7794072244"},{id:"u2",name:"Fleet Supervisor",phone:"9848012345"}])}})(),x(""),j(""),c(""))},[r,t]),!t)return null;const m=te(t),M=()=>{const v=t.company_name||"Emergency Contact",w=t.phone_number||"",B=t.contact_type||"Directory Contact",o=t.physical_address||"",a=t.truck_brand?`
🔧 *Brands:* ${t.truck_brand}`:"",_=y?`

📝 *Dispatch Note:* ${y}`:"";return`📇 *JAI BHAVANI CARGO - CONTACT CARD*

🏢 *${v}*
📂 *Category:* ${B}
📞 *Phone:* ${w}${a}
📍 *Address:* ${o||"Available on request"}${m?`
🗺️ *Google Maps:* ${m}`:""}${_}

_Sent via Jai Bhavani Cargo Dispatch Desk_`},O=async()=>{d(!0);const v=M();let w=C.replace(/\D/g,"");w.length===10&&(w=`91${w}`);try{const B={contact:t,recipientPhone:w,recipientName:N||"Staff Member",customNote:y,channel:"whatsapp"};let o=!1,a="";try{const _=await window.fetch("/hcgi/api/driver/send-contact-api",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(B)}),f=await _.json().catch(()=>({}));_.ok&&f.success&&(o=!0,a=f.directWhatsappUrl)}catch{}if(!o)try{const _=await window.fetch("/api/driver/send-contact-api",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(B)}),f=await _.json().catch(()=>({}));_.ok&&f.success&&(o=!0,a=f.directWhatsappUrl)}catch{}a||(a=w?`https://api.whatsapp.com/send?phone=${w}&text=${encodeURIComponent(v)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(v)}`),window.open(a,"_blank"),S.success(`Contact card for "${t.company_name}" sent via WhatsApp API!`),p()}catch(B){console.error(B),S.error("Failed to send contact via API")}finally{d(!1)}},L=()=>{navigator.clipboard.writeText(M()),S.success("Contact card copied to clipboard!")};return e.jsx(le,{open:r,onOpenChange:p,children:e.jsxs(oe,{className:"sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl",children:[e.jsxs(he,{className:"pb-3 border-b border-slate-800",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(pe,{className:"text-lg font-bold text-white flex items-center gap-2",children:[e.jsx(Ee,{className:"w-5 h-5 text-emerald-400"}),"1-Click Send Contact via API"]}),e.jsx(ne,{variant:"outline",className:"text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold",children:"API Instant"})]}),e.jsx(ba,{className:"text-xs text-slate-400 mt-1",children:"Dispatch contact details, phone number & Google Maps location directly to drivers or fleet managers with 1 click."})]}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold text-sm text-white",children:t.company_name}),e.jsx(ne,{variant:"outline",className:"text-[11px] font-semibold bg-primary/10 text-primary border-primary/30",children:t.contact_type})]}),e.jsxs("div",{className:"text-xs text-slate-300 flex items-center gap-2",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-emerald-400"}),e.jsx("span",{className:"font-mono font-bold text-emerald-400",children:t.phone_number||"N/A"})]}),t.physical_address&&e.jsxs("div",{className:"text-xs text-slate-400 truncate flex items-center gap-1.5",children:[e.jsx(se,{className:"w-3.5 h-3.5 text-rose-400 shrink-0"}),e.jsx("span",{className:"truncate",children:t.physical_address})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-bold text-slate-300",children:"Select Recipient Staff / Driver"}),e.jsxs(Y,{value:b,onValueChange:v=>{if(u(v),v!=="custom"){const w=I.find(B=>B.id===v);w&&(j(w.phone||""),c(w.name||""))}else j(""),c("")},children:[e.jsx(K,{className:"bg-slate-950 border-slate-800 text-xs text-slate-200",children:e.jsx(J,{placeholder:"Choose recipient"})}),e.jsxs(Z,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(n,{value:"custom",children:"✏️ Enter Custom Phone Number"}),I.map(v=>e.jsxs(n,{value:v.id,children:["👤 ",v.name," ",v.phone?`(${v.phone})`:""]},v.id))]})]})]}),b==="custom"&&e.jsxs("div",{className:"space-y-1.5 animate-in fade-in duration-200",children:[e.jsx(g,{className:"text-xs font-bold text-slate-300",children:"Recipient WhatsApp Phone Number *"}),e.jsx(k,{value:C,onChange:v=>j(v.target.value),placeholder:"e.g. 9848012345 (10-digit mobile number)",className:"bg-slate-950 border-slate-800 text-xs font-mono font-bold text-emerald-400"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs font-bold text-slate-300",children:"Optional Dispatch Note (Added to message)"}),e.jsx(ke,{value:y,onChange:v=>x(v.target.value),placeholder:"e.g. Truck MH12-AB-1234 breakdown, reach this mechanic immediately...",className:"bg-slate-950 border-slate-800 text-xs min-h-[60px] text-slate-200"})]})]}),e.jsxs(ue,{className:"pt-2 border-t border-slate-800 flex items-center justify-between gap-2",children:[e.jsxs(P,{type:"button",variant:"outline",size:"sm",onClick:L,className:"border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs",children:[e.jsx(we,{className:"w-3.5 h-3.5 mr-1"})," Copy Card"]}),e.jsxs(P,{type:"button",onClick:O,disabled:s,className:"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-emerald-900/30",children:[s?e.jsx(me,{className:"w-4 h-4 mr-1 animate-spin"}):e.jsx(ye,{className:"w-4 h-4 mr-1"}),"1-Click Send via API"]})]})]})})}



function CrmDirectoryMain({ imports, onOpenEdit, onOpenDetail, onOpenExport, onOpenScan, onOpenSos, onOpenApiSend, onOpenMultiShare }) {
  const { e, h, pb, toast, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Input, Button, Badge } = imports;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [filterPreferredOnly, setFilterPreferredOnly] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkParam, setBulkParam] = useState("");
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const records = await pb.collection("contacts").getFullList({ sort: "-created", $autoCancel: false });
      setContacts(records || []);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      toast.error("Failed to load contacts directory");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, []);
  const groupCounts = useMemo(() => {
    const counts = { all: contacts.length };
    MAIN_GROUPS_CONFIG.forEach((g) => {
      const cleanTitle = g.title.replace(/^[0-9.]+\s*/, "").toLowerCase();
      counts[g.title] = contacts.filter((c) => {
        const mg = (c.main_group || "").toLowerCase();
        return mg === g.title.toLowerCase() || mg === cleanTitle || mg.includes(cleanTitle) || cleanTitle.includes(mg);
      }).length;
    });
    return counts;
  }, [contacts]);
  const cityOptions = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    contacts.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return ["all", ...Array.from(set)];
  }, [contacts]);
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (contact.company_name || "").toLowerCase().includes(q);
        const matchesOrg = (contact.organisation_name || "").toLowerCase().includes(q);
        const matchesPhone = (contact.phone_number || "").toLowerCase().includes(q);
        const matchesAddr = (contact.physical_address || "").toLowerCase().includes(q);
        const matchesNotes = (contact.notes || "").toLowerCase().includes(q);
        const matchesGstin = (contact.gstin || "").toLowerCase().includes(q);
        const matchesCategory = (contact.primary_category || contact.contact_type || "").toLowerCase().includes(q);
        const matchesBrands = (contact.truck_brands || contact.truck_brand || "").toLowerCase().includes(q);
        if (!matchesName && !matchesOrg && !matchesPhone && !matchesAddr && !matchesNotes && !matchesGstin && !matchesCategory && !matchesBrands) {
          return false;
        }
      }
      if (selectedGroup !== "all") {
        const cleanSel = selectedGroup.replace(/^[0-9.]+\s*/, "").toLowerCase();
        const mg = (contact.main_group || "").toLowerCase();
        const matchesGrp = mg === selectedGroup.toLowerCase() || mg === cleanSel || mg.includes(cleanSel) || cleanSel.includes(mg);
        if (!matchesGrp) return false;
      }
      if (selectedCategory !== "all") {
        const primary = contact.primary_category || contact.contact_type || "";
        const secondaries = safeParseArray(contact.secondary_categories);
        if (primary !== selectedCategory && !secondaries.includes(selectedCategory)) {
          return false;
        }
      }
      if (selectedBrand !== "all") {
        const brands = safeParseArray(contact.truck_brands);
        const legacyBrand = contact.truck_brand || "";
        const hasBrand = brands.includes(selectedBrand) || brands.includes("Universal / All Brands") || legacyBrand.includes(selectedBrand) || legacyBrand.toLowerCase().includes("common");
        if (!hasBrand) return false;
      }
      if (selectedCity !== "all") {
        if ((contact.city || "") !== selectedCity) return false;
      }
      if (filterEmergencyOnly && !contact.emergency_available) return false;
      if (filterPreferredOnly && !contact.is_preferred) return false;
      return true;
    });
  }, [contacts, searchQuery, selectedGroup, selectedCategory, selectedBrand, selectedCity, filterEmergencyOnly, filterPreferredOnly]);
  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  };
  const handleExecuteBulk = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one contact for bulk action");
      return;
    }
    if (!bulkAction) {
      toast.error("Choose a bulk action first");
      return;
    }
    try {
      if (bulkAction === "assign_brand" && bulkParam) {
        for (const id of selectedIds) {
          const c = contacts.find((x) => x.id === id);
          if (c) {
            const currentBrands = safeParseArray(c.truck_brands);
            const updated = Array.from(/* @__PURE__ */ new Set([...currentBrands, bulkParam]));
            await pb.collection("contacts").update(id, {
              truck_brands: JSON.stringify(updated),
              truck_brand: updated.join(", ")
            }, { $autoCancel: false });
          }
        }
        toast.success(`Brand "${bulkParam}" assigned to ${selectedIds.length} contacts!`);
      } else if (bulkAction === "set_preferred") {
        for (const id of selectedIds) {
          await pb.collection("contacts").update(id, { is_preferred: 1 }, { $autoCancel: false });
        }
        toast.success(`Marked ${selectedIds.length} contacts as Preferred Vendor!`);
      } else if (bulkAction === "set_emergency") {
        for (const id of selectedIds) {
          await pb.collection("contacts").update(id, { emergency_available: 1 }, { $autoCancel: false });
        }
        toast.success(`Marked ${selectedIds.length} contacts for 24/7 Emergency support!`);
      }
      setSelectedIds([]);
      setBulkAction("");
      setBulkParam("");
      fetchContacts();
    } catch (err) {
      console.error("Bulk update error:", err);
      toast.error("Bulk action failed");
    }
  };
  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Delete contact "${contact.company_name}"? This action cannot be undone.`)) {
      try {
        await pb.collection("contacts").delete(contact.id, { $autoCancel: false });
        toast.success("Contact deleted successfully");
        fetchContacts();
      } catch {
        toast.error("Failed to delete contact");
      }
    }
  };
  return /* @__PURE__ */ h.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2" }, MAIN_GROUPS_CONFIG.map((g) => {
    const isActive = selectedGroup === g.title;
    const count = groupCounts[g.title] || 0;
    return /* @__PURE__ */ h.createElement(
      "button",
      {
        key: g.id,
        type: "button",
        onClick: () => {
          setSelectedGroup(isActive ? "all" : g.title);
          setSelectedCategory("all");
        },
        className: `p-2.5 rounded-xl border text-left transition-all ${isActive ? "bg-primary/15 border-primary shadow-sm scale-[1.02]" : "bg-card/70 border-border/60 hover:bg-muted/40"}`
      },
      /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-black uppercase text-muted-foreground" }, g.code), /* @__PURE__ */ h.createElement("span", { className: `text-xs font-black px-1.5 py-0.2 rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}` }, count)),
      /* @__PURE__ */ h.createElement("p", { className: "text-xs font-bold text-foreground truncate leading-tight" }, g.title.replace(/^[0-9.]+\s*/, ""))
    );
  })), /* @__PURE__ */ h.createElement("div", { className: "bg-card/80 border border-border p-3.5 rounded-2xl shadow-sm space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between" }, /* @__PURE__ */ h.createElement("div", { className: "relative flex-1 max-w-lg" }, /* @__PURE__ */ h.createElement("span", { className: "absolute left-3 top-2.5 text-muted-foreground text-xs" }, "\u{1F50D}"), /* @__PURE__ */ h.createElement(
    Input,
    {
      value: searchQuery,
      onChange: (e2) => setSearchQuery(e2.target.value),
      placeholder: "Search by name, phone, city, brand, GSTIN, notes...",
      className: "pl-8 bg-background text-xs h-9 rounded-xl font-medium"
    }
  ), searchQuery && /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setSearchQuery(""),
      className: "absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
    },
    "\u2715"
  )), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 flex-wrap text-xs" }, /* @__PURE__ */ h.createElement(
    "select",
    {
      value: selectedBrand,
      onChange: (e2) => setSelectedBrand(e2.target.value),
      className: "h-9 rounded-xl bg-background border border-border text-xs px-2.5 font-bold text-foreground focus:outline-none"
    },
    /* @__PURE__ */ h.createElement("option", { value: "all" }, "\u{1F69B} All Truck Brands"),
    TRUCK_BRANDS_MASTER.map((b) => /* @__PURE__ */ h.createElement("option", { key: b, value: b }, b))
  ), /* @__PURE__ */ h.createElement(
    "select",
    {
      value: selectedCity,
      onChange: (e2) => setSelectedCity(e2.target.value),
      className: "h-9 rounded-xl bg-background border border-border text-xs px-2.5 font-bold text-foreground focus:outline-none"
    },
    /* @__PURE__ */ h.createElement("option", { value: "all" }, "\u{1F4CD} All Cities"),
    cityOptions.filter((c) => c !== "all").map((c) => /* @__PURE__ */ h.createElement("option", { key: c, value: c }, c))
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setFilterEmergencyOnly(!filterEmergencyOnly),
      className: `h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${filterEmergencyOnly ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm" : "bg-background border-border text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F6A8}"),
    " 24/7 Night"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setFilterPreferredOnly(!filterPreferredOnly),
      className: `h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${filterPreferredOnly ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm" : "bg-background border-border text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ h.createElement("span", null, "\u2B50"),
    " Preferred"
  ), /* @__PURE__ */ h.createElement("div", { className: "flex items-center bg-muted/60 p-1 rounded-xl border border-border" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setViewMode("table"),
      className: `p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
      title: "Table View"
    },
    "\u{1F4CB} Table"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setViewMode("grid"),
      className: `p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
      title: "Grid Card View"
    },
    "\u{1F5C2}\uFE0F Cards"
  )))), selectedIds.length > 0 && /* @__PURE__ */ h.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", { className: "font-extrabold text-primary" }, selectedIds.length, " Contact", selectedIds.length > 1 ? "s" : "", " Selected"), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => setSelectedIds([]),
      className: "text-[11px] underline text-muted-foreground hover:text-foreground ml-1"
    },
    "Clear"
  )), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ h.createElement(
    "select",
    {
      value: bulkAction,
      onChange: (e2) => setBulkAction(e2.target.value),
      className: "h-8 rounded-lg bg-background border border-border text-xs px-2 font-bold"
    },
    /* @__PURE__ */ h.createElement("option", { value: "" }, "Choose Bulk Action..."),
    /* @__PURE__ */ h.createElement("option", { value: "assign_brand" }, "Assign Truck Brand"),
    /* @__PURE__ */ h.createElement("option", { value: "set_preferred" }, "Mark as Preferred Vendor"),
    /* @__PURE__ */ h.createElement("option", { value: "set_emergency" }, "Enable 24/7 Emergency")
  ), bulkAction === "assign_brand" && /* @__PURE__ */ h.createElement(
    "select",
    {
      value: bulkParam,
      onChange: (e2) => setBulkParam(e2.target.value),
      className: "h-8 rounded-lg bg-background border border-border text-xs px-2 font-bold text-amber-300"
    },
    /* @__PURE__ */ h.createElement("option", { value: "" }, "Select Brand..."),
    TRUCK_BRANDS_MASTER.map((b) => /* @__PURE__ */ h.createElement("option", { key: b, value: b }, b))
  ), /* @__PURE__ */ h.createElement(
    Button,
    {
      size: "sm",
      onClick: handleExecuteBulk,
      className: "h-8 text-xs font-bold bg-primary text-primary-foreground"
    },
    "Apply Bulk Update"
  ), /* @__PURE__ */ h.createElement(
    Button,
    {
      size: "sm",
      variant: "outline",
      onClick: () => onOpenMultiShare(contacts.filter((c) => selectedIds.includes(c.id))),
      className: "h-8 text-xs font-bold border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4AC}"),
    " WhatsApp Selected"
  )))), /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between text-xs text-muted-foreground px-1" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ h.createElement("span", null, "Showing ", /* @__PURE__ */ h.createElement("strong", { className: "text-foreground" }, filteredContacts.length), " of", " ", /* @__PURE__ */ h.createElement("strong", null, contacts.length), " records"), selectedGroup !== "all" && /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold flex items-center gap-1" }, "Group: ", selectedGroup, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: () => setSelectedGroup("all"), className: "hover:text-foreground" }, "\u2715")), selectedBrand !== "all" && /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold flex items-center gap-1" }, "Brand: ", selectedBrand, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: () => setSelectedBrand("all"), className: "hover:text-foreground" }, "\u2715")), selectedCity !== "all" && /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold flex items-center gap-1" }, "City: ", selectedCity, /* @__PURE__ */ h.createElement("button", { type: "button", onClick: () => setSelectedCity("all"), className: "hover:text-foreground" }, "\u2715")))), viewMode === "table" ? /* @__PURE__ */ h.createElement("div", { className: "rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm" }, /* @__PURE__ */ h.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ h.createElement("table", { className: "w-full caption-bottom text-sm border-collapse" }, /* @__PURE__ */ h.createElement("thead", { className: "bg-muted/30 border-b border-border/80" }, /* @__PURE__ */ h.createElement("tr", null, /* @__PURE__ */ h.createElement("th", { className: "w-[40px] text-center" }, /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "checkbox",
      checked: selectedIds.length === filteredContacts.length && filteredContacts.length > 0,
      onChange: toggleSelectAll,
      className: "rounded text-primary focus:ring-0 cursor-pointer"
    }
  )), /* @__PURE__ */ h.createElement("th", { className: "min-w-[200px]" }, "Contact & Organisation"), /* @__PURE__ */ h.createElement("th", { className: "min-w-[150px]" }, "Main Group & Category"), /* @__PURE__ */ h.createElement("th", { className: "min-w-[140px]" }, "Phone & WhatsApp"), /* @__PURE__ */ h.createElement("th", { className: "min-w-[140px]" }, "Brands & Capability"), /* @__PURE__ */ h.createElement("th", { className: "min-w-[180px]" }, "Location & GPS"), /* @__PURE__ */ h.createElement("th", { className: "text-right w-[140px]" }, "Actions"))), /* @__PURE__ */ h.createElement("tbody", { className: "divide-y divide-border/40" }, loading ? /* @__PURE__ */ h.createElement("tr", null, /* @__PURE__ */ h.createElement("td", { colSpan: 7, className: "text-center py-12 text-muted-foreground text-sm" }, "Loading Transport CRM directory...")) : filteredContacts.length === 0 ? /* @__PURE__ */ h.createElement("tr", null, /* @__PURE__ */ h.createElement("td", { colSpan: 7, className: "text-center py-16 text-muted-foreground" }, /* @__PURE__ */ h.createElement("p", { className: "font-bold text-sm" }, "No contacts found matching the active filters."), /* @__PURE__ */ h.createElement("p", { className: "text-xs mt-1" }, "Try resetting your brand, city or category selection."))) : filteredContacts.map((contact) => {
    const isSelected = selectedIds.includes(contact.id);
    const brands = safeParseArray(contact.truck_brands);
    const phoneList = (contact.phone_number || "").split(/[,;\/\n]+/).map((p) => p.trim()).filter(Boolean);
    const mapsUrl = contact.google_maps_url || contact.google_map_link || "";
    return /* @__PURE__ */ h.createElement(
      "tr",
      {
        key: contact.id,
        className: `hover:bg-muted/40 transition-colors ${isSelected ? "bg-primary/5" : ""}`
      },
      /* @__PURE__ */ h.createElement("td", { className: "text-center" }, /* @__PURE__ */ h.createElement(
        "input",
        {
          type: "checkbox",
          checked: isSelected,
          onChange: () => toggleSelect(contact.id),
          className: "rounded text-primary focus:ring-0 cursor-pointer"
        }
      )),
      /* @__PURE__ */ h.createElement("td", null, /* @__PURE__ */ h.createElement("div", { className: "font-bold text-sm text-foreground hover:text-primary cursor-pointer", onClick: () => onOpenDetail(contact) }, contact.company_name), contact.organisation_name && contact.organisation_name !== contact.company_name && /* @__PURE__ */ h.createElement("div", { className: "text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F3E2}"), " ", contact.organisation_name), contact.designation && /* @__PURE__ */ h.createElement("div", { className: "text-[11px] text-primary/80 font-medium" }, contact.designation), contact.notes && !contact.notes.startsWith("http") && /* @__PURE__ */ h.createElement("div", { className: "text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5 italic" }, contact.notes)),
      /* @__PURE__ */ h.createElement("td", null, /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-md text-[11px] font-bold bg-muted text-foreground border border-border block w-fit mb-1" }, contact.primary_category || contact.contact_type || "Unclassified"), /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-muted-foreground block truncate max-w-[140px]" }, contact.main_group || "General")),
      /* @__PURE__ */ h.createElement("td", null, /* @__PURE__ */ h.createElement("div", { className: "flex flex-col gap-1" }, phoneList.map((ph, idx) => /* @__PURE__ */ h.createElement("div", { key: idx, className: "flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement(
        "a",
        {
          href: `tel:${ph.replace(/\D/g, "")}`,
          className: "text-xs font-bold text-foreground hover:text-primary transition-colors font-mono"
        },
        ph
      ), /* @__PURE__ */ h.createElement(
        "a",
        {
          href: `https://wa.me/${ph.replace(/\D/g, "").startsWith("91") ? ph.replace(/\D/g, "") : "91" + ph.replace(/\D/g, "")}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "px-1 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25",
          title: "WhatsApp"
        },
        "WA"
      ))))),
      /* @__PURE__ */ h.createElement("td", null, /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-1" }, brands.map((b) => /* @__PURE__ */ h.createElement("span", { key: b, className: "text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30" }, b))), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5 mt-1" }, contact.emergency_available ? /* @__PURE__ */ h.createElement("span", { className: "text-[9px] font-black text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded", title: "24/7 Breakdown Help" }, "\u{1F6A8} 24/7") : null, contact.is_preferred ? /* @__PURE__ */ h.createElement("span", { className: "text-[9px] font-black text-amber-300 bg-amber-500/10 px-1 py-0.2 rounded", title: "Preferred Vendor" }, "\u2B50 Top") : null, contact.roadside_service ? /* @__PURE__ */ h.createElement("span", { className: "text-[9px] font-bold text-slate-400 bg-slate-800 px-1 py-0.2 rounded", title: "Roadside Mobile Service" }, "\u{1F6E0}\uFE0F Road") : null)),
      /* @__PURE__ */ h.createElement("td", null, /* @__PURE__ */ h.createElement("div", { className: "text-xs text-foreground truncate max-w-[200px]" }, contact.physical_address || "-"), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 mt-0.5" }, contact.city && /* @__PURE__ */ h.createElement("span", { className: "text-[10px] text-muted-foreground font-semibold" }, contact.city), mapsUrl && /* @__PURE__ */ h.createElement(
        "a",
        {
          href: mapsUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
        },
        /* @__PURE__ */ h.createElement("span", null, "\u{1F5FA}\uFE0F"),
        " Maps"
      ))),
      /* @__PURE__ */ h.createElement("td", { className: "text-right" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ h.createElement(
        Button,
        {
          size: "sm",
          onClick: () => onOpenApiSend(contact),
          className: "h-8 px-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm",
          title: "1-Click Dispatch Contact Card via WhatsApp API"
        },
        /* @__PURE__ */ h.createElement("span", null, "\u26A1"),
        " API"
      ), /* @__PURE__ */ h.createElement(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: () => onOpenDetail(contact),
          className: "h-8 px-2 text-xs font-bold rounded-lg border-border"
        },
        "View"
      ), /* @__PURE__ */ h.createElement(
        Button,
        {
          size: "sm",
          variant: "ghost",
          onClick: () => onOpenEdit(contact),
          className: "h-8 px-2 text-xs font-bold rounded-lg hover:bg-muted",
          title: "Edit Contact"
        },
        "\u270F\uFE0F"
      )))
    );
  }))))) : (
    /* GRID CARD VIEW */
    /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" }, filteredContacts.map((contact) => {
      const isSelected = selectedIds.includes(contact.id);
      const brands = safeParseArray(contact.truck_brands);
      const phoneList = (contact.phone_number || "").split(/[,;\/\n]+/).map((p) => p.trim()).filter(Boolean);
      const mapsUrl = contact.google_maps_url || contact.google_map_link || "";
      return /* @__PURE__ */ h.createElement(
        "div",
        {
          key: contact.id,
          className: `p-4 rounded-2xl border transition-all space-y-3 bg-card/80 ${isSelected ? "border-primary ring-1 ring-primary shadow-md" : "border-border/80 hover:border-border"}`
        },
        /* @__PURE__ */ h.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-start gap-2.5 min-w-0" }, /* @__PURE__ */ h.createElement(
          "input",
          {
            type: "checkbox",
            checked: isSelected,
            onChange: () => toggleSelect(contact.id),
            className: "mt-1 rounded text-primary focus:ring-0 cursor-pointer"
          }
        ), /* @__PURE__ */ h.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ h.createElement(
          "h4",
          {
            className: "font-bold text-sm text-foreground truncate cursor-pointer hover:text-primary",
            onClick: () => onOpenDetail(contact)
          },
          contact.company_name
        ), contact.organisation_name && contact.organisation_name !== contact.company_name && /* @__PURE__ */ h.createElement("p", { className: "text-[11px] text-muted-foreground truncate font-medium" }, contact.organisation_name))), /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted text-foreground border border-border/80 shrink-0" }, contact.primary_category || contact.contact_type)),
        /* @__PURE__ */ h.createElement("div", { className: "flex flex-wrap gap-1.5 pt-1" }, brands.map((b) => /* @__PURE__ */ h.createElement("span", { key: b, className: "text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30" }, b)), contact.emergency_available ? /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md" }, "\u{1F6A8} 24/7 Night") : null, contact.is_preferred ? /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md" }, "\u2B50 Preferred") : null),
        /* @__PURE__ */ h.createElement("div", { className: "p-2.5 rounded-xl bg-muted/30 border border-border/40 space-y-1.5 text-xs" }, phoneList.map((ph, idx) => /* @__PURE__ */ h.createElement("div", { key: idx, className: "flex items-center justify-between" }, /* @__PURE__ */ h.createElement("a", { href: `tel:${ph.replace(/\D/g, "")}`, className: "font-mono font-bold text-foreground hover:text-primary flex items-center gap-1" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE}"), " ", ph), /* @__PURE__ */ h.createElement(
          "a",
          {
            href: `https://wa.me/${ph.replace(/\D/g, "").startsWith("91") ? ph.replace(/\D/g, "") : "91" + ph.replace(/\D/g, "")}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          },
          "WhatsApp"
        )))),
        /* @__PURE__ */ h.createElement("div", { className: "text-xs text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40" }, /* @__PURE__ */ h.createElement("span", { className: "truncate max-w-[180px]" }, contact.physical_address || "Address on file"), mapsUrl && /* @__PURE__ */ h.createElement("a", { href: mapsUrl, target: "_blank", rel: "noopener noreferrer", className: "font-bold text-rose-400 hover:underline shrink-0" }, "\u{1F5FA}\uFE0F Map")),
        /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5 pt-1" }, /* @__PURE__ */ h.createElement(
          Button,
          {
            size: "sm",
            onClick: () => onOpenApiSend(contact),
            className: "flex-1 h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
          },
          /* @__PURE__ */ h.createElement("span", null, "\u26A1"),
          " Send API"
        ), /* @__PURE__ */ h.createElement(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => onOpenDetail(contact),
            className: "h-8 px-3 text-xs font-bold rounded-xl border-border"
          },
          "View"
        ), /* @__PURE__ */ h.createElement(
          Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => onOpenEdit(contact),
            className: "h-8 px-2 text-xs font-bold rounded-xl hover:bg-muted"
          },
          "\u270F\uFE0F"
        ))
      );
    }))
  ));
}



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


function RegionalNetworkHubView({ contacts, onRefreshContacts, onOpenSos }) {
  const [regions, setRegions] = h.useState([]);
  const [loading, setLoading] = h.useState(true);
  const [selectedRegionId, setSelectedRegionId] = h.useState("reg_hyd");
  const [assigningCategory, setAssigningCategory] = h.useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = h.useState(false);
  const [contactSearch, setContactSearch] = h.useState("");
  const fetchBreakdownNetwork = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/driver/breakdown-network");
      const data = await res.json();
      if (data.success && Array.isArray(data.regions)) {
        setRegions(data.regions);
        if (data.regions.length > 0 && !selectedRegionId) {
          setSelectedRegionId(data.regions[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load breakdown network:", err);
    } finally {
      setLoading(false);
    }
  };
  h.useEffect(() => {
    fetchBreakdownNetwork();
  }, []);
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || regions[0] || null;
  const handleAssignContact = async (contact) => {
    if (!assigningCategory || !selectedRegion) return;
    try {
      const payload = {
        regionId: selectedRegion.id,
        category: assigningCategory.categoryKey,
        isPrimary: assigningCategory.isPrimary,
        contact: contact ? {
          id: contact.id,
          company_name: contact.company_name || contact.name,
          contact_name: contact.contact_name || contact.company_name,
          phone_number: contact.phone_number || contact.phone,
          contact_type: contact.contact_type,
          physical_address: contact.physical_address || contact.address,
          google_maps_url: contact.google_maps_url || contact.location_url,
          truck_brand: contact.truck_brand
        } : null
      };
      const res = await fetch("/api/driver/breakdown-network/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        S.success(contact ? "Contact assigned to " + selectedRegion.name + "!" : "Contact unassigned");
        setIsAssignModalOpen(false);
        setAssigningCategory(null);
        fetchBreakdownNetwork();
      } else {
        S.error(data.error || "Failed to update assignment");
      }
    } catch (e) {
      S.error("Error saving assignment");
    }
  };
  const handleQuickCall = (phone) => {
    if (!phone) {
      S.error("No phone number registered");
      return;
    }
    window.open("tel:" + phone, "_self");
  };
  const handleWhatsApp = (phone, name, regionName, categoryName) => {
    if (!phone) {
      S.error("No phone number registered");
      return;
    }
    const cleanPhone = phone.replace(/\\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const msg = "Namaste " + (name || "Partner") + ", Greetings from Jai Bhavani Cargo. Regarding transport operations / emergency support in " + regionName + " (" + (categoryName || "Assigned Partner") + "). Are you available for assistance?";
    window.open("https://api.whatsapp.com/send?phone=" + formattedPhone + "&text=" + encodeURIComponent(msg), "_blank");
  };
  const categoryConfigs = [
    { key: "mechanic", label: "Mechanic", icon: "\u{1F527}", color: "text-rose-400 bg-rose-500/10 border-rose-500/30", types: ["Mechanic", "Workshop"] },
    { key: "tyre_shop", label: "Tyre shop", icon: "\u{1F6DE}", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", types: ["Tyre Shop", "Puncher Shop", "Puncture Shop"] },
    { key: "towing", label: "Towing", icon: "\u{1F3D7}\uFE0F", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", types: ["Crane / Tow Truck", "Towing"] },
    { key: "electrical", label: "Electrical", icon: "\u26A1", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", types: ["Electrician", "Auto Electrician"] }
  ];
  return /* @__PURE__ */ h.createElement("div", { className: "space-y-5 animate-in fade-in duration-300" }, /* @__PURE__ */ h.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-xl" }, "\u{1F5FA}\uFE0F"), /* @__PURE__ */ h.createElement("h2", { className: "text-base sm:text-lg font-bold text-white" }, "Regional Network Hub & Breakdown Emergency System"), /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary border border-primary/40 uppercase" }, "Feature 86")), /* @__PURE__ */ h.createElement("p", { className: "text-xs text-slate-400 mt-1" }, "1-Click find assigned contact persons & emergency breakdown vendors across key highway regions & corridors.")), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: onOpenSos,
      className: "w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 border border-rose-500/40 animate-pulse transition-all"
    },
    /* @__PURE__ */ h.createElement("span", { className: "text-base" }, "\u{1F6A8}"),
    " NEED HELP (SOS)"
  )), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin" }, regions.map((r) => {
    const isSelected = selectedRegion && selectedRegion.id === r.id;
    const isFullyCovered = r.coverage_score === 100;
    return /* @__PURE__ */ h.createElement(
      "button",
      {
        key: r.id,
        type: "button",
        onClick: () => setSelectedRegionId(r.id),
        className: "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border " + (isSelected ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]" : "bg-card text-foreground hover:bg-muted border-border/70")
      },
      /* @__PURE__ */ h.createElement("span", { className: "font-mono" }, r.name),
      /* @__PURE__ */ h.createElement("span", { className: "px-1.5 py-0.2 rounded-full text-[10px] font-black " + (isFullyCovered ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300") }, isFullyCovered ? "\u2713 100%" : r.coverage_score + "%")
    );
  })), selectedRegion && /* @__PURE__ */ h.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ h.createElement("div", { className: "p-4 sm:p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-md space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/60 pb-3" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("span", { className: "text-[11px] font-bold text-primary uppercase tracking-wider" }, "\u{1F4CD} ", selectedRegion.name, " REGIONAL HUB \u2022 ", selectedRegion.highway_corridor), /* @__PURE__ */ h.createElement("h3", { className: "text-base sm:text-lg font-black text-foreground mt-0.5" }, "Primary Area Contact Person")), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-bold border " + (selectedRegion.coverage_score === 100 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, selectedRegion.coverage_score === 100 ? "\u2713 Full Emergency Coverage" : "\u26A0\uFE0F Incomplete Coverage (" + selectedRegion.coverage_score + "%)"))), /* @__PURE__ */ h.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-3.5 rounded-xl border border-border/50" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ h.createElement("div", { className: "w-11 h-11 rounded-xl bg-primary/20 text-primary font-black flex items-center justify-center text-lg border border-primary/30 shrink-0" }, "\u{1F464}"), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "font-extrabold text-foreground text-sm flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", null, selectedRegion.primary_contact?.name || "Unassigned"), /* @__PURE__ */ h.createElement("span", { className: "text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold" }, selectedRegion.primary_contact?.role || "Station In-Charge")), /* @__PURE__ */ h.createElement("div", { className: "text-xs text-primary font-mono font-bold mt-0.5 flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE} ", selectedRegion.primary_contact?.phone || "No phone registered"), selectedRegion.primary_contact?.notes && /* @__PURE__ */ h.createElement("span", { className: "text-muted-foreground text-[11px] font-normal truncate max-w-[280px]" }, "\u2022 ", selectedRegion.primary_contact.notes)))), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2 w-full md:w-auto justify-end" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickCall(selectedRegion.primary_contact?.phone),
      className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE}"),
    " Call"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleWhatsApp(selectedRegion.primary_contact?.phone, selectedRegion.primary_contact?.name, selectedRegion.name, "Primary Station Coordinator"),
      className: "px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 shadow-sm"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4AC}"),
    " WhatsApp"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setAssigningCategory({ regionId: selectedRegion.id, categoryKey: null, isPrimary: true });
        setIsAssignModalOpen(true);
      },
      className: "px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border/70"
    },
    "Change"
  )))), /* @__PURE__ */ h.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ h.createElement("h4", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F527}"), " Emergency Breakdown Network & Assigned Vendors"), /* @__PURE__ */ h.createElement("span", { className: "text-[11px] text-muted-foreground" }, "Linked directly with Contacts Directory")), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" }, categoryConfigs.map((cat) => {
    const assignedVendor = selectedRegion.categories && selectedRegion.categories[cat.key];
    const isCovered = !!(assignedVendor && assignedVendor.phone_number);
    return /* @__PURE__ */ h.createElement(
      "div",
      {
        key: cat.key,
        className: "p-4 rounded-xl border transition-all " + (isCovered ? "bg-card border-border/70 shadow-sm" : "bg-card/50 border-dashed border-amber-500/40 hover:border-amber-500/70")
      },
      /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-start gap-2" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ h.createElement("span", { className: "text-lg p-1.5 rounded-lg bg-muted/60" }, cat.icon), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement("span", { className: "font-extrabold text-xs text-foreground uppercase tracking-wide" }, cat.label), isCovered ? /* @__PURE__ */ h.createElement("span", { className: "text-xs font-black text-emerald-400" }, "\u2713") : /* @__PURE__ */ h.createElement("span", { className: "text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300" }, "Missing")), /* @__PURE__ */ h.createElement("div", { className: "text-[11px] text-muted-foreground mt-0.5" }, isCovered ? assignedVendor.company_name || assignedVendor.contact_name : "No vendor assigned in this corridor"))), isCovered ? /* @__PURE__ */ h.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }, "Active \u2713") : /* @__PURE__ */ h.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            setAssigningCategory({ regionId: selectedRegion.id, categoryKey: cat.key, isPrimary: false, types: cat.types });
            setIsAssignModalOpen(true);
          },
          className: "px-2.5 py-1 text-[11px] font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        },
        "+ Assign Contact"
      )),
      isCovered && /* @__PURE__ */ h.createElement("div", { className: "mt-3 pt-3 border-t border-border/50 space-y-2 text-xs" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between text-slate-300" }, /* @__PURE__ */ h.createElement("span", { className: "font-mono font-bold text-emerald-400" }, "\u{1F4DE} ", assignedVendor.phone_number), assignedVendor.contact_name && assignedVendor.contact_name !== assignedVendor.company_name && /* @__PURE__ */ h.createElement("span", { className: "text-muted-foreground text-[11px]" }, "\u{1F464} ", assignedVendor.contact_name)), assignedVendor.physical_address && /* @__PURE__ */ h.createElement("div", { className: "text-[11px] text-muted-foreground truncate flex items-center gap-1" }, /* @__PURE__ */ h.createElement("span", null, "\u{1F4CD}"), " ", /* @__PURE__ */ h.createElement("span", { className: "truncate" }, assignedVendor.physical_address)), /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between pt-1" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ h.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleQuickCall(assignedVendor.phone_number),
          className: "px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
        },
        /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE}"),
        " Call"
      ), /* @__PURE__ */ h.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleWhatsApp(assignedVendor.phone_number, assignedVendor.contact_name || assignedVendor.company_name, selectedRegion.name, cat.label),
          className: "px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30"
        },
        /* @__PURE__ */ h.createElement("span", null, "\u{1F4AC}"),
        " WhatsApp"
      ), assignedVendor.google_maps_url && /* @__PURE__ */ h.createElement(
        "button",
        {
          type: "button",
          onClick: () => window.open(assignedVendor.google_maps_url, "_blank"),
          className: "px-2 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] py-1 font-semibold",
          title: "Open Google Maps Location"
        },
        "\u{1F5FA}\uFE0F"
      )), /* @__PURE__ */ h.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            setAssigningCategory({ regionId: selectedRegion.id, categoryKey: cat.key, isPrimary: false, types: cat.types });
            setIsAssignModalOpen(true);
          },
          className: "text-[11px] text-muted-foreground hover:text-foreground underline"
        },
        "Reassign"
      )))
    );
  })))), isAssignModalOpen && /* @__PURE__ */ h.createElement("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto" }, /* @__PURE__ */ h.createElement("div", { className: "bg-card border border-border/80 rounded-2xl max-w-xl w-full p-4 sm:p-5 shadow-2xl space-y-4 my-auto max-h-[85vh] overflow-y-auto" }, /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-center border-b border-border/60 pb-3" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("h3", { className: "text-base font-black text-foreground" }, "Assign Contact to ", selectedRegion?.name), /* @__PURE__ */ h.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, "Category: ", /* @__PURE__ */ h.createElement("strong", { className: "text-primary uppercase" }, assigningCategory?.isPrimary ? "Primary Area Contact" : assigningCategory?.categoryKey))), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setIsAssignModalOpen(false);
        setAssigningCategory(null);
      },
      className: "w-7 h-7 rounded-full bg-muted text-muted-foreground hover:text-foreground text-xs font-bold"
    },
    "\u2715"
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search by vendor name, phone, or area...",
      value: contactSearch,
      onChange: (e) => setContactSearch(e.target.value),
      className: "w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "max-h-[340px] overflow-y-auto divide-y divide-border/40 border border-border/60 rounded-xl" }, contacts.filter((c) => {
    const s = contactSearch.toLowerCase();
    const matchesSearch = !s || (c.company_name || "").toLowerCase().includes(s) || (c.phone_number || "").includes(s) || (c.physical_address || "").toLowerCase().includes(s);
    if (!matchesSearch) return false;
    if (assigningCategory?.types && assigningCategory.types.length > 0 && !contactSearch) {
      const cType = (c.contact_type || "").toLowerCase();
      return assigningCategory.types.some((t) => t.toLowerCase() === cType);
    }
    return true;
  }).map((c) => /* @__PURE__ */ h.createElement("div", { key: c.id, className: "p-3 hover:bg-muted/30 flex items-center justify-between gap-3 text-xs" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "font-bold text-foreground" }, c.company_name), /* @__PURE__ */ h.createElement("div", { className: "text-primary font-mono text-[11px]" }, c.phone_number || "No phone"), /* @__PURE__ */ h.createElement("div", { className: "text-muted-foreground text-[11px] truncate max-w-[280px]" }, c.contact_type, " \u2022 ", c.physical_address || "No address")), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleAssignContact(c),
      className: "px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm shrink-0"
    },
    "Assign"
  )))), /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-center pt-2" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleAssignContact(null),
      className: "text-xs text-rose-400 hover:underline"
    },
    "Clear / Remove Current"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setIsAssignModalOpen(false);
        setAssigningCategory(null);
      },
      className: "px-4 py-1.5 rounded-lg bg-muted text-foreground text-xs font-bold"
    },
    "Close"
  )))));
}
function EmergencySosModal({ isOpen, onClose, regions }) {
  const [selectedRegionName, setSelectedRegionName] = h.useState("HYDERABAD");
  const [selectedCategory, setSelectedCategory] = h.useState("mechanic");
  const [truckNumber, setTruckNumber] = h.useState("");
  const [locationLandmark, setLocationLandmark] = h.useState("");
  const [issueNote, setIssueNote] = h.useState("");
  const [isSending, setIsSending] = h.useState(false);
  if (!isOpen) return null;
  const currentRegion = (regions || []).find((r) => (r.name || "").toUpperCase() === selectedRegionName.toUpperCase()) || regions[0] || null;
  const assignedVendor = currentRegion && currentRegion.categories ? currentRegion.categories[selectedCategory] : null;
  const handleDispatchSos = async () => {
    if (!assignedVendor || !assignedVendor.phone_number) {
      S.error("No emergency vendor assigned for " + selectedCategory + " in " + selectedRegionName + "! Please assign one or call station manager.");
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        regionName: selectedRegionName,
        category: selectedCategory,
        vehicleNumber: truckNumber || "Truck en route",
        locationDetails: locationLandmark || selectedRegionName + " Corridor",
        issueDescription: issueNote || "Emergency " + selectedCategory + " breakdown",
        vendorPhone: assignedVendor.phone_number,
        vendorName: assignedVendor.company_name || assignedVendor.contact_name
      };
      const res = await fetch("/api/driver/breakdown-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.directWhatsappUrl) {
        window.open(data.directWhatsappUrl, "_blank");
        S.success("Emergency SOS dispatched via WhatsApp API!");
        onClose();
      } else {
        S.error("Failed to generate SOS dispatch");
      }
    } catch (e) {
      S.error("Network error sending SOS");
    } finally {
      setIsSending(false);
    }
  };
  return /* @__PURE__ */ h.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ h.createElement("div", { className: "bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto text-slate-100 max-h-[92vh] overflow-y-auto" }, /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-start border-b border-slate-800 pb-3" }, /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ h.createElement("span", { className: "text-3xl p-1 bg-rose-500/20 rounded-xl border border-rose-500/40 animate-pulse" }, "\u{1F6A8}"), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("h3", { className: "text-lg font-black text-white" }, "Emergency Breakdown SOS Dispatch"), /* @__PURE__ */ h.createElement("p", { className: "text-xs text-rose-300" }, "Fast 1-Click highway rescue coordination for drivers & dispatchers"))), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
    },
    "\u2715"
  )), /* @__PURE__ */ h.createElement("div", { className: "space-y-4 text-xs" }, /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement("label", { className: "font-bold text-slate-300 uppercase tracking-wider text-[11px]" }, "1. Where is the Truck Stranded? (Select Region)"), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-3 gap-2" }, (regions || []).map((r) => /* @__PURE__ */ h.createElement(
    "button",
    {
      key: r.id,
      type: "button",
      onClick: () => setSelectedRegionName(r.name),
      className: "py-2 px-2.5 rounded-xl font-bold text-xs border transition-all text-center " + (selectedRegionName.toUpperCase() === r.name.toUpperCase() ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50 scale-[1.02]" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700")
    },
    r.name
  )))), /* @__PURE__ */ h.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ h.createElement("label", { className: "font-bold text-slate-300 uppercase tracking-wider text-[11px]" }, "2. What is the Emergency Breakdown Need?"), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2" }, [
    { key: "mechanic", label: "Mechanic", icon: "\u{1F527}" },
    { key: "tyre_shop", label: "Tyre Burst", icon: "\u{1F6DE}" },
    { key: "towing", label: "Crane / Tow", icon: "\u{1F3D7}\uFE0F" },
    { key: "electrical", label: "Electrical", icon: "\u26A1" }
  ].map((cat) => /* @__PURE__ */ h.createElement(
    "button",
    {
      key: cat.key,
      type: "button",
      onClick: () => setSelectedCategory(cat.key),
      className: "py-2.5 px-2 rounded-xl font-bold text-xs border transition-all flex flex-col items-center gap-1 text-center " + (selectedCategory === cat.key ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md scale-[1.02]" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700")
    },
    /* @__PURE__ */ h.createElement("span", { className: "text-base" }, cat.icon),
    /* @__PURE__ */ h.createElement("span", null, cat.label)
  )))), /* @__PURE__ */ h.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("label", { className: "block text-slate-400 font-semibold mb-1" }, "Truck Vehicle Number"), /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "text",
      placeholder: "e.g. AP02-TE-1234 or MH12-AB-5678",
      value: truckNumber,
      onChange: (e) => setTruckNumber(e.target.value.toUpperCase()),
      className: "w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("label", { className: "block text-slate-400 font-semibold mb-1" }, "Exact Landmark / Milepost / GPS"), /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "text",
      placeholder: "e.g. Near Toll Plaza, NH44 KM 182",
      value: locationLandmark,
      onChange: (e) => setLocationLandmark(e.target.value),
      className: "w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
    }
  )), /* @__PURE__ */ h.createElement("div", { className: "sm:col-span-2" }, /* @__PURE__ */ h.createElement("label", { className: "block text-slate-400 font-semibold mb-1" }, "Breakdown Problem Description"), /* @__PURE__ */ h.createElement(
    "input",
    {
      type: "text",
      placeholder: "e.g. Front right tyre burst with rim damage / Clutch wire snapped",
      value: issueNote,
      onChange: (e) => setIssueNote(e.target.value),
      className: "w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
    }
  ))), /* @__PURE__ */ h.createElement("div", { className: "p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2" }, /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ h.createElement("span", { className: "text-slate-400 font-semibold text-[11px] uppercase tracking-wider" }, "Assigned Emergency Rescue Partner"), /* @__PURE__ */ h.createElement("span", { className: "text-[11px] text-amber-400 font-bold" }, selectedRegionName, " \u2022 ", selectedCategory.toUpperCase())), assignedVendor && assignedVendor.phone_number ? /* @__PURE__ */ h.createElement("div", { className: "flex items-center justify-between gap-3 pt-1" }, /* @__PURE__ */ h.createElement("div", null, /* @__PURE__ */ h.createElement("div", { className: "font-extrabold text-white text-sm" }, assignedVendor.company_name || assignedVendor.contact_name), /* @__PURE__ */ h.createElement("div", { className: "text-emerald-400 font-mono font-bold text-xs mt-0.5" }, "\u{1F4DE} ", assignedVendor.phone_number), /* @__PURE__ */ h.createElement("div", { className: "text-slate-400 text-[11px] truncate max-w-[260px]" }, "\u{1F4CD} ", assignedVendor.physical_address || "On-site highway dispatch")), /* @__PURE__ */ h.createElement("div", { className: "flex items-center gap-1.5 shrink-0" }, /* @__PURE__ */ h.createElement(
    "a",
    {
      href: "tel:" + assignedVendor.phone_number,
      className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4DE}"),
    " Call Now"
  ))) : /* @__PURE__ */ h.createElement("div", { className: "py-3 text-center text-amber-400 font-medium text-xs bg-amber-500/10 rounded-lg border border-amber-500/20" }, "\u26A0\uFE0F No specific ", selectedCategory, " is assigned yet for ", selectedRegionName, ".", /* @__PURE__ */ h.createElement("br", null), /* @__PURE__ */ h.createElement("span", { className: "text-slate-300 text-[11px]" }, "You can call the primary area station coordinator: ", currentRegion?.primary_contact?.name || "Local In-charge", " (", currentRegion?.primary_contact?.phone || "N/A", ")"))), /* @__PURE__ */ h.createElement("div", { className: "flex justify-between items-center border-t border-slate-800 pt-3" }, /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
    },
    "Cancel"
  ), /* @__PURE__ */ h.createElement(
    "button",
    {
      type: "button",
      onClick: handleDispatchSos,
      disabled: isSending || !assignedVendor || !assignedVendor.phone_number,
      className: "px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
    },
    /* @__PURE__ */ h.createElement("span", null, "\u{1F4AC}"),
    " 1-Click WhatsApp SOS API"
  )))));
}



export{MAIN_GROUPS_CONFIG as CATEGORY_FILTERS,MAIN_GROUPS_CONFIG as MAIN_GROUPS,Va as default};