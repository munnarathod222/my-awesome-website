export const CONTAINER_CONFIG = [
  {
    type: '24FT',
    name: '24 Feet Container',
    baseRatePerKg: 4.5,
    maxWeightCapacity: 9000,
    maxVolumeCapacity: 35,
    description: 'Standard 24ft container suitable for regular cargo.'
  },
  {
    type: '24FTSXL',
    name: '24 Feet SXL Container',
    baseRatePerKg: 5.0,
    maxWeightCapacity: 14000,
    maxVolumeCapacity: 38,
    description: 'Single Axle 24ft container for heavier loads.'
  },
  {
    type: '32FT',
    name: '32 Feet Container',
    baseRatePerKg: 5.5,
    maxWeightCapacity: 14000,
    maxVolumeCapacity: 50,
    description: 'Standard 32ft container for large volume cargo.'
  },
  {
    type: '32FTSXL',
    name: '32 Feet SXL Container',
    baseRatePerKg: 6.0,
    maxWeightCapacity: 21000,
    maxVolumeCapacity: 55,
    description: 'Multi Axle 32ft container for maximum capacity.'
  }
];

export const ZONE_CONFIG = [
  { zone: 'Zone A (Local - up to 100km)', multiplier: 1.0 },
  { zone: 'Zone B (Regional - 101 to 500km)', multiplier: 1.2 },
  { zone: 'Zone C (National - 501 to 1500km)', multiplier: 1.5 },
  { zone: 'Zone D (Long Haul - over 1500km)', multiplier: 1.8 }
];

export const FUEL_SURCHARGE_DEFAULT = 1500;
export const HANDLING_FEES_DEFAULT = 500;