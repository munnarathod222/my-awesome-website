/**
 * Munsiyana & Enterprise Contract Deductions Engine
 * Specifically models Delhivery Supply Partner Terms (orion.delhivery.com)
 * and configurable client-level deduction policies across the transport platform.
 */

export const MUNSIYANA_PRESETS = {
  DELHIVERY_CORPORATE: {
    id: 'DELHIVERY_CORPORATE',
    label: 'Delhivery Corporate (Regular)',
    description: 'Corporate client standard freight slabs: ₹300 (<25k), ₹500 (25k-50k), ₹650 (50k+)',
    slabs: [
      { min: 0, max: 24999, amount: 300, label: 'Less than ₹24,999' },
      { min: 25000, max: 49999, amount: 500, label: '₹25,000 to ₹49,999' },
      { min: 50000, max: null, amount: 650, label: '₹50,000 and above' }
    ]
  },
  DELHIVERY_AGRI: {
    id: 'DELHIVERY_AGRI',
    label: 'Delhivery Agri & Commodity',
    description: 'Agri and bulk commodity slabs: ₹250 (<25k), ₹350 (25k-50k), ₹500 (50k+)',
    slabs: [
      { min: 0, max: 24999, amount: 250, label: 'Less than ₹24,999' },
      { min: 25000, max: 49999, amount: 350, label: '₹25,000 to ₹49,999' },
      { min: 50000, max: null, amount: 500, label: '₹50,000 and above' }
    ]
  }
};

/**
 * Calculates Munsiyana deduction for a given trip based on client contract terms.
 *
 * @param {number|string} freightAmount - Gross trip freight value / revenue
 * @param {Object} client - Client master record
 * @returns {{ amount: number, rule: string, slab: Object|null, enabled: boolean }}
 */
export function calculateMunsiyana(freightAmount, client) {
  const freight = Number(freightAmount) || 0;
  if (!client || !client.munsiyana_enabled) {
    return {
      amount: 0,
      rule: 'None (Munsiyana not enabled for client)',
      slab: null,
      enabled: false
    };
  }

  if (freight <= 0) {
    return {
      amount: 0,
      rule: 'Freight amount is 0',
      slab: null,
      enabled: true
    };
  }

  const type = (client.munsiyana_type || 'slabs_corporate').toLowerCase();

  // Percentage deduction
  if (type === 'percentage') {
    const rate = Number(client.munsiyana_rate) || 0;
    const amount = Math.round((freight * rate) / 100);
    return {
      amount,
      rule: `${rate}% of Freight`,
      slab: null,
      enabled: true
    };
  }

  // Flat fee per trip
  if (type === 'flat') {
    const amount = Number(client.munsiyana_rate) || 0;
    return {
      amount,
      rule: `Flat ₹${amount.toLocaleString('en-IN')} per trip`,
      slab: null,
      enabled: true
    };
  }

  // Slabs evaluation (Corporate, Agri, or Custom)
  let slabs = null;
  if (type === 'slabs_agri' || type === 'agri') {
    slabs = MUNSIYANA_PRESETS.DELHIVERY_AGRI.slabs;
  } else if (type === 'slabs_corporate' || type === 'corporate' || type === 'slabs') {
    // Check if client has custom slabs JSON, otherwise fallback to Corporate Regular
    if (client.munsiyana_slabs) {
      try {
        const parsed = typeof client.munsiyana_slabs === 'string' 
          ? JSON.parse(client.munsiyana_slabs) 
          : client.munsiyana_slabs;
        if (Array.isArray(parsed) && parsed.length > 0) {
          slabs = parsed;
        }
      } catch (e) {
        slabs = MUNSIYANA_PRESETS.DELHIVERY_CORPORATE.slabs;
      }
    }
    if (!slabs) {
      slabs = MUNSIYANA_PRESETS.DELHIVERY_CORPORATE.slabs;
    }
  } else {
    slabs = MUNSIYANA_PRESETS.DELHIVERY_CORPORATE.slabs;
  }

  // Match freight in slabs
  for (const slab of slabs) {
    const min = Number(slab.min !== undefined ? slab.min : slab.min_freight) || 0;
    const maxVal = slab.max !== undefined ? slab.max : slab.max_freight;
    const max = maxVal !== null && maxVal !== undefined && maxVal !== '' ? Number(maxVal) : Infinity;

    if (freight >= min && freight <= max) {
      const deductionAmount = Number(slab.amount) || 0;
      const label = slab.label || (max === Infinity ? `₹${min.toLocaleString('en-IN')}+` : `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`);
      return {
        amount: deductionAmount,
        rule: `Slab: ${label} → ₹${deductionAmount.toLocaleString('en-IN')}`,
        slab,
        enabled: true
      };
    }
  }

  return {
    amount: 0,
    rule: 'No matching slab found',
    slab: null,
    enabled: true
  };
}

/**
 * Calculates POD Damage Deduction liability sharing between Supply Partner and Delhivery.
 * Based on Delhivery contract:
 * - < ₹5,000: 100% debited to Partner
 * - ₹5,000 to ₹15,000: Up to ₹5,000 debited to Partner, remainder split 50/50
 *
 * @param {number|string} damageClaimAmount - Total estimated damage value on POD
 * @returns {{ damageAmount: number, partnerLiability: number, clientAbsorbed: number, ruleText: string }}
 */
export function calculateDamageLiability(damageClaimAmount) {
  const claim = Math.max(0, Number(damageClaimAmount) || 0);
  if (claim === 0) {
    return {
      damageAmount: 0,
      partnerLiability: 0,
      clientAbsorbed: 0,
      ruleText: 'No damage reported'
    };
  }

  if (claim < 5000) {
    return {
      damageAmount: claim,
      partnerLiability: claim,
      clientAbsorbed: 0,
      ruleText: '100% Partner Debit (< ₹5,000)'
    };
  }

  if (claim <= 15000) {
    const remainder = claim - 5000;
    const split50 = Math.round(remainder / 2);
    const partnerDebit = 5000 + split50;
    const clientAbsorbed = remainder - split50;
    return {
      damageAmount: claim,
      partnerLiability: partnerDebit,
      clientAbsorbed: clientAbsorbed,
      ruleText: `₹5,000 + 50% remainder (₹${partnerDebit.toLocaleString('en-IN')} debited to Partner)`
    };
  }

  // Above ₹15,000
  const tier2Split = 5000; // 50% of the (15000 - 5000) tier
  const excess = claim - 15000;
  const partnerDebit = 5000 + tier2Split + excess;
  return {
    damageAmount: claim,
    partnerLiability: partnerDebit,
    clientAbsorbed: 5000,
    ruleText: `₹10,000 + excess debited to Partner (Damage > ₹15,000)`
  };
}
