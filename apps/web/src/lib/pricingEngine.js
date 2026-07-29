import pb from '@/lib/pocketbaseClient.js';

// Default Configurable Freight Pricing Rules
export const DEFAULT_PRICING_RULES = {
  minFreight: 2500,               // Minimum freight charge in INR
  loadingCharge: 1200,            // Base loading & unloading charge
  fuelSurchargePct: 5,            // 5% fuel surcharge
  nightCharge: 800,               // Night transit charge
  urgentSurchargePct: 10,         // 10% urgent delivery surcharge
  tollPerKm: 2.2,                 // Toll estimation per KM
  vehicleRates: {
    '32ft_mxl': { name: '32ft MXL Container (14 Ton)', ratePerKm: 48 },
    '32ft_sxl': { name: '32ft SXL Container (7 Ton)', ratePerKm: 38 },
    '24ft_open': { name: '24ft Open Body Truck (10 Ton)', ratePerKm: 42 },
    '14ft_eicher': { name: '14ft Eicher City (4 Ton)', ratePerKm: 28 },
    '40ft_trailer': { name: '40ft Flatbed Trailer (25 Ton)', ratePerKm: 68 },
  }
};

/**
 * Fetch current pricing rules from PocketBase app_settings or return defaults
 */
export async function getFreightPricingRules() {
  try {
    const res = await pb.collection('app_settings').getList(1, 1, { filter: 'key = "freight_pricing_rules"', $autoCancel: false });
    if (res.items?.length > 0 && res.items[0].value) {
      return { ...DEFAULT_PRICING_RULES, ...JSON.parse(res.items[0].value) };
    }
  } catch (err) {
    console.warn('Using default freight pricing rules');
  }
  const cached = localStorage.getItem('FREIGHT_PRICING_RULES');
  if (cached) {
    try { return { ...DEFAULT_PRICING_RULES, ...JSON.parse(cached) }; } catch (e) {}
  }
  return DEFAULT_PRICING_RULES;
}

/**
 * Save updated pricing rules to PocketBase app_settings & localStorage
 */
export async function saveFreightPricingRules(newRules) {
  const jsonStr = JSON.stringify(newRules);
  localStorage.setItem('FREIGHT_PRICING_RULES', jsonStr);
  try {
    const existing = await pb.collection('app_settings').getList(1, 1, { filter: 'key = "freight_pricing_rules"', $autoCancel: false });
    if (existing.items?.length > 0) {
      await pb.collection('app_settings').update(existing.items[0].id, { value: jsonStr });
    } else {
      await pb.collection('app_settings').create({ key: 'freight_pricing_rules', value: jsonStr });
    }
  } catch (err) {
    console.warn('Saved pricing rules to localStorage fallback');
  }
}

/**
 * Calculate dynamic freight quotation based on distance, truck type, weight, and rules
 */
export function calculateDynamicFreight({ distanceKm, vehicleTypeId, weightTons = 0, isUrgent = false, isNightTransit = false, rules = DEFAULT_PRICING_RULES }) {
  const vRule = rules.vehicleRates?.[vehicleTypeId] || rules.vehicleRates?.['32ft_mxl'] || { ratePerKm: 48 };
  const ratePerKm = vRule.ratePerKm || 48;

  const rawBaseFreight = Math.max(rules.minFreight || 2500, Math.round(distanceKm * ratePerKm));
  const tollCharge = Math.round(distanceKm * (rules.tollPerKm || 2.2));
  const loadingCharge = rules.loadingCharge || 1200;
  
  const fuelSurcharge = Math.round(rawBaseFreight * ((rules.fuelSurchargePct || 5) / 100));
  const nightCharge = isNightTransit ? (rules.nightCharge || 800) : 0;
  const urgentCharge = isUrgent ? Math.round(rawBaseFreight * ((rules.urgentSurchargePct || 10) / 100)) : 0;

  const subtotal = rawBaseFreight + tollCharge + loadingCharge + fuelSurcharge + nightCharge + urgentCharge;
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gstAmount;

  return {
    distanceKm,
    ratePerKm,
    baseFreight: rawBaseFreight,
    tollCharge,
    loadingCharge,
    fuelSurcharge,
    nightCharge,
    urgentCharge,
    subtotal,
    gstAmount,
    grandTotal
  };
}
