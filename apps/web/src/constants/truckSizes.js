/**
 * Standardized Truck Size / Vehicle Type Configuration for Jai Bhavani Cargo
 * Client Form -> Backend/API -> Supabase/SQLite -> Admin Quotes -> Quote Details
 */

export const TRUCK_SIZE_OPTIONS = [
  {
    id: '14ft',
    value: '14 FT',
    name: '14 FT Closed Container / Open Body',
    short: '14 FT',
    capacity: '3 - 4.5 MT',
    maxMT: 4.5,
    dimensions: '14ft × 6ft × 6.5ft',
    volume: '~15.5 CBM',
    ratePerKm: 32,
    baseCharge: 1500,
    description: 'Suitable for intra-city and express consignments (3 to 4.5 Tons).'
  },
  {
    id: '17ft',
    value: '17 FT',
    name: '17 FT Closed Container / Open Body',
    short: '17 FT',
    capacity: '4 - 5.5 MT',
    maxMT: 5.5,
    dimensions: '17ft × 6.5ft × 7ft',
    volume: '~21.8 CBM',
    ratePerKm: 36,
    baseCharge: 1800,
    description: 'Commercial cargo vehicle for regional light cargo (4 to 5.5 Tons).'
  },
  {
    id: '20ftsxl',
    value: '20 FT SXL',
    name: '20 FT SXL Single Axle Container',
    short: '20 FT SXL',
    capacity: '6 - 8.5 MT',
    maxMT: 8.5,
    dimensions: '20ft × 8ft × 8ft',
    volume: '~36.2 CBM',
    ratePerKm: 42,
    baseCharge: 2000,
    description: 'Single-axle 20ft container for industrial freight (6 to 8.5 Tons).'
  },
  {
    id: '22ftsxl',
    value: '22 FT SXL',
    name: '22 FT SXL Single Axle Container',
    short: '22 FT SXL',
    capacity: '7 - 9.5 MT',
    maxMT: 9.5,
    dimensions: '22ft × 8ft × 8ft',
    volume: '~39.8 CBM',
    ratePerKm: 44,
    baseCharge: 2000,
    description: 'Single-axle 22ft container for volumetric goods (7 to 9.5 Tons).'
  },
  {
    id: '24ftsxl',
    value: '24 FT SXL',
    name: '24 FT SXL Single Axle Container',
    short: '24 FT SXL',
    capacity: '7 - 10 MT',
    maxMT: 10,
    dimensions: '24ft × 8ft × 8.5ft',
    volume: '~46.1 CBM',
    ratePerKm: 46,
    baseCharge: 2000,
    description: 'Single-axle 24ft container for heavy industrial loads (7 to 10 Tons).'
  },
  {
    id: '32ftsxl',
    value: '32 FT SXL',
    name: '32 FT SXL Single Axle Container',
    short: '32 FT SXL',
    capacity: '6 - 9 MT',
    maxMT: 9,
    dimensions: '32ft × 8ft × 8.5ft',
    volume: '~61.5 CBM',
    ratePerKm: 48,
    baseCharge: 2000,
    description: 'Flagship 32ft SXL high-cube container for corporate logistics (6 to 9 Tons).'
  },
  {
    id: '32ft_single_axle',
    value: '32 FT Single Axle',
    name: '32 FT Single Axle High Cube',
    short: '32 FT Single Axle',
    capacity: '7 - 9 MT',
    maxMT: 9,
    dimensions: '32ft × 8ft × 8.5ft',
    volume: '~61.5 CBM',
    ratePerKm: 48,
    baseCharge: 2000,
    description: 'Single-axle high volume 32ft freight container (7 to 9 Tons).'
  },
  {
    id: '32ft_multi_axle',
    value: '32 FT Multi Axle',
    name: '32 FT Multi Axle Container (MXL)',
    short: '32 FT Multi Axle',
    capacity: '14 - 18 MT',
    maxMT: 18,
    dimensions: '32ft × 8ft × 8.5ft',
    volume: '~61.5 CBM',
    ratePerKm: 56,
    baseCharge: 3000,
    description: 'Multi-axle heavy container for maximum tonnage transport (14 to 18 Tons).'
  },
  {
    id: 'other',
    value: 'Other / Not Sure',
    name: 'Other / Not Sure (Custom Vehicle Requirement)',
    short: 'Other / Not Sure',
    capacity: 'Custom Capacity',
    maxMT: 25,
    dimensions: 'As per requirement',
    volume: 'Custom Volume',
    ratePerKm: 46,
    baseCharge: 2000,
    description: 'Custom vehicle specification or expert vehicle placement assistance.'
  }
];

export const TRUCK_SIZE_FILTER_OPTIONS = [
  'All',
  '14 FT',
  '17 FT',
  '20 FT SXL',
  '22 FT SXL',
  '24 FT SXL',
  '32 FT SXL',
  '32 FT Single Axle',
  '32 FT Multi Axle',
  'Other / Not Sure'
];

export function getTruckSizeSpec(val) {
  if (!val) return TRUCK_SIZE_OPTIONS.find(o => o.value === '32 FT SXL');
  const clean = String(val).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = TRUCK_SIZE_OPTIONS.find(opt => {
    const optValClean = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const optIdClean = opt.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const optNameClean = opt.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return optValClean === clean || optIdClean === clean || optNameClean === clean || clean.includes(optValClean);
  });
  return found || TRUCK_SIZE_OPTIONS.find(o => o.value === '32 FT SXL');
}
