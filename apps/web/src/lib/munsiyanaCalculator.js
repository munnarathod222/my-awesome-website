/**
 * Munsiyana Calculation Utility
 * Standard contract slabs from Indian Logistics/Supply Partner Contracts (e.g. Delhivery)
 */

export const MUNSIYANA_SLABS = {
  Corporate: [
    { maxFreight: 24999.99, fee: 300, label: '< ₹25,000' },
    { maxFreight: 49999.99, fee: 500, label: '₹25,000 to ₹49,999' },
    { maxFreight: Infinity, fee: 650, label: '₹50,000 and above' },
  ],
  Agri_Commodity: [
    { maxFreight: 24999.99, fee: 250, label: '< ₹25,000' },
    { maxFreight: 49999.99, fee: 350, label: '₹25,000 to ₹49,999' },
    { maxFreight: Infinity, fee: 500, label: '₹50,000 and above' },
  ]
};

/**
 * Computes Munsiyana fee given a client profile and freight amount
 * @param {Object} client - The client record
 * @param {number} freightAmount - Gross freight value
 * @returns {number} The calculated Munsiyana deduction fee
 */
export function calculateMunsiyana(client, freightAmount) {
  if (!client || !client.munsiyana_applicable) {
    return 0;
  }

  const freight = Number(freightAmount) || 0;
  if (freight <= 0) return 0;

  const ruleType = client.munsiyana_type || 'slab';

  // Flat amount
  if (ruleType === 'flat') {
    return Number(client.munsiyana_flat_amount) || 0;
  }

  // Percentage mode
  if (ruleType === 'percentage') {
    const pct = Number(client.munsiyana_flat_amount) || 0;
    return Math.round((freight * pct) / 100);
  }

  // Slab mode (Corporate vs Agri_Commodity)
  const category = client.munsiyana_category === 'Agri_Commodity' ? 'Agri_Commodity' : 'Corporate';
  const slabs = MUNSIYANA_SLABS[category];

  for (const tier of slabs) {
    if (freight <= tier.maxFreight) {
      return tier.fee;
    }
  }

  return category === 'Agri_Commodity' ? 500 : 650;
}
