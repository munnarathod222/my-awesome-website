/**
 * Standard Commercial Fleet Inventory Catalog
 * Essential spare parts, consumables, fluids, and safety gear for transport fleet operations.
 */

export const STANDARD_FLEET_CATALOG = [
  {
    item_name: '15W-40 CI-4+ Heavy Duty Diesel Engine Oil (20L Bucket)',
    category: 'Oils & Fluids',
    unit: 'liters',
    current_stock: 40,
    reorder_level: 20,
    unit_cost: 340, // ₹6,800 per 20L
    supplier_name: 'Castrol / Gulf Commercial Lubricants',
    description: 'High-performance diesel engine oil for heavy transport trucks. 15W-40 API CI-4 Plus specification.'
  },
  {
    item_name: 'AdBlue DEF Urea Solution (20L Canister)',
    category: 'Ad Blue',
    unit: 'liters',
    current_stock: 80,
    reorder_level: 40,
    unit_cost: 55, // ₹1,100 per 20L
    supplier_name: 'Tata / Cummins AdBlue Depot',
    description: 'Standard ISO 22241 Diesel Exhaust Fluid (AUS 32) for BS-VI SCR emission compliance.'
  },
  {
    item_name: 'Primary Diesel Fuel Filter Element (Spin-On)',
    category: 'Filters & Service',
    unit: 'pieces',
    current_stock: 6,
    reorder_level: 3,
    unit_cost: 850,
    supplier_name: 'Fleetguard Filters India',
    description: 'High-efficiency fuel water separator and primary diesel filter element.'
  },
  {
    item_name: 'Engine Lube Oil Filter Cartridge',
    category: 'Filters & Service',
    unit: 'pieces',
    current_stock: 6,
    reorder_level: 3,
    unit_cost: 720,
    supplier_name: 'Fleetguard Filters India',
    description: 'Full-flow lubrication oil filter for heavy diesel engines.'
  },
  {
    item_name: 'Heavy Duty Air Cleaner Filter (Primary + Secondary Set)',
    category: 'Filters & Service',
    unit: 'sets',
    current_stock: 3,
    reorder_level: 2,
    unit_cost: 2400,
    supplier_name: 'Donaldson / Fleetguard',
    description: 'Heavy duty dry-type dual stage engine intake air filter assembly.'
  },
  {
    item_name: 'Tubeless Radial Commercial Tyre 295/80 R22.5',
    category: 'Tyres & Wheels',
    unit: 'pieces',
    current_stock: 4,
    reorder_level: 2,
    unit_cost: 24500,
    supplier_name: 'MRF / Apollo Tyres Commercial Hub',
    description: 'All-wheel position highway radial tubeless tyre 295/80 R22.5 152/148M.'
  },
  {
    item_name: 'Heavy Duty Wheel Flap & Tube Kit 10.00 R20',
    category: 'Tyres & Wheels',
    unit: 'sets',
    current_stock: 4,
    reorder_level: 2,
    unit_cost: 2800,
    supplier_name: 'JK Tyre Commercial Distribution',
    description: 'Heavy duty heat-resistant butyl inner tube and rim flap for 10.00-20 commercial wheels.'
  },
  {
    item_name: 'Heavy Duty Brake Liners / Brake Shoe Set (Front & Rear)',
    category: 'Brakes & Suspension',
    unit: 'sets',
    current_stock: 4,
    reorder_level: 2,
    unit_cost: 3200,
    supplier_name: 'Rane Brake Lining Ltd',
    description: 'Asbestos-free premium friction commercial vehicle brake lining set with rivets.'
  },
  {
    item_name: 'Type 24/30 Spring Brake Air Actuator Chamber',
    category: 'Brakes & Suspension',
    unit: 'pieces',
    current_stock: 2,
    reorder_level: 1,
    unit_cost: 2950,
    supplier_name: 'WABCO / Knorr-Bremse India',
    description: 'Double diaphragm tandem spring brake actuator for rear axle pneumatic braking.'
  },
  {
    item_name: '12V 150Ah Heavy Commercial Vehicle Battery',
    category: 'Electrical & Battery',
    unit: 'pieces',
    current_stock: 2,
    reorder_level: 1,
    unit_cost: 14200,
    supplier_name: 'Amaron Hi-Way / Exide Commercial',
    description: 'Heavy duty zero-maintenance commercial battery with 36-month warranty.'
  },
  {
    item_name: '24V H4 Halogen Headlight Bulbs & Relay Kit',
    category: 'Electrical & Battery',
    unit: 'sets',
    current_stock: 6,
    reorder_level: 2,
    unit_cost: 650,
    supplier_name: 'Philips / Osram Commercial Auto',
    description: '24V 75/70W heavy duty halogen bulbs with vibration-resistant filament.'
  },
  {
    item_name: 'Heavy Duty 50mm Cargo Lashing Ratchet Belt (9m / 5 Ton)',
    category: 'Safety & Cargo Gear',
    unit: 'pieces',
    current_stock: 8,
    reorder_level: 4,
    unit_cost: 950,
    supplier_name: 'SafeCargo Hardware Hub',
    description: 'High-tenacity polyester cargo strap with forged double J-hooks and zinc ratchet handle.'
  },
  {
    item_name: 'Heavy Duty Waterproof Tirpal / Tarpaulin (24ft x 18ft)',
    category: 'Safety & Cargo Gear',
    unit: 'pieces',
    current_stock: 3,
    reorder_level: 1,
    unit_cost: 4500,
    supplier_name: 'National Tarpaulins & Tent Works',
    description: 'Heavy duty multi-layer UV treated waterproof HDPE tarpaulin with brass eyelets.'
  },
  {
    item_name: 'Chassis & Wheel Bearing EP2 High-Temp Grease (5kg)',
    category: 'Oils & Fluids',
    unit: 'kg',
    current_stock: 15,
    reorder_level: 5,
    unit_cost: 370, // ₹1,850 per 5kg
    supplier_name: 'Castrol / Servo Automotive Grease',
    description: 'Lithium complex extreme-pressure grease for wheel hub bearings and suspension pins.'
  },
  {
    item_name: 'Commercial Windshield Wiper Blade Set (24-inch)',
    category: 'Accessories',
    unit: 'pairs',
    current_stock: 4,
    reorder_level: 2,
    unit_cost: 550,
    supplier_name: 'Bosch Automotive India',
    description: 'All-weather graphite coated rubber wiper blade pair with heavy duty steel frame.'
  }
];

export const INVENTORY_CATEGORIES = [
  { value: 'Truck Parts', label: 'Truck Parts', color: 'bg-blue-500/10 text-blue-600 border-blue-500/25', icon: 'Wrench' },
  { value: 'Oils & Fluids', label: 'Oils & Fluids', color: 'bg-amber-500/10 text-amber-600 border-amber-500/25', icon: 'Droplets' },
  { value: 'Ad Blue', label: 'Ad Blue (DEF)', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/25', icon: 'Fuel' },
  { value: 'Tyres & Wheels', label: 'Tyres & Wheels', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25', icon: 'Disc' },
  { value: 'Filters & Service', label: 'Filters & Service', color: 'bg-purple-500/10 text-purple-600 border-purple-500/25', icon: 'Filter' },
  { value: 'Brakes & Suspension', label: 'Brakes & Suspension', color: 'bg-rose-500/10 text-rose-600 border-rose-500/25', icon: 'ShieldAlert' },
  { value: 'Electrical & Battery', label: 'Electrical & Battery', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/25', icon: 'Zap' },
  { value: 'Safety & Cargo Gear', label: 'Safety & Cargo Gear', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/25', icon: 'ShieldCheck' },
  { value: 'Accessories', label: 'Accessories', color: 'bg-slate-500/10 text-slate-600 border-slate-500/25', icon: 'Box' }
];

export const INVENTORY_UNITS = [
  'pieces',
  'liters',
  'kg',
  'sets',
  'barrels',
  'boxes',
  'meters',
  'pairs',
  'gallons'
];
