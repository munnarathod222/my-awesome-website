const fs = require('fs');
const path = require('path');

const vehicleRates = {
  "32ftsxl": {
    adhoc_base_rate_under_100: 10000,
    adhoc_rate_100_200: 60,
    adhoc_rate_200_300: 54,
    adhoc_rate_300_400: 50,
    adhoc_rate_above_400: 48,
    contract_base_rate_under_100: 8500,
    contract_rate_100_200: 52,
    contract_rate_200_300: 46,
    contract_rate_300_400: 42,
    contract_rate_above_400: 40
  },
  "32ft_single_axle": {
    adhoc_base_rate_under_100: 10000,
    adhoc_rate_100_200: 60,
    adhoc_rate_200_300: 54,
    adhoc_rate_300_400: 50,
    adhoc_rate_above_400: 48,
    contract_base_rate_under_100: 8500,
    contract_rate_100_200: 52,
    contract_rate_200_300: 46,
    contract_rate_300_400: 42,
    contract_rate_above_400: 40
  },
  "32ft_multi_axle": {
    adhoc_base_rate_under_100: 12000,
    adhoc_rate_100_200: 70,
    adhoc_rate_200_300: 64,
    adhoc_rate_300_400: 58,
    adhoc_rate_above_400: 56,
    contract_base_rate_under_100: 10500,
    contract_rate_100_200: 60,
    contract_rate_200_300: 54,
    contract_rate_300_400: 50,
    contract_rate_above_400: 48
  },
  "24ftsxl": {
    adhoc_base_rate_under_100: 8500,
    adhoc_rate_100_200: 55,
    adhoc_rate_200_300: 50,
    adhoc_rate_300_400: 48,
    adhoc_rate_above_400: 46,
    contract_base_rate_under_100: 7200,
    contract_rate_100_200: 47,
    contract_rate_200_300: 42,
    contract_rate_300_400: 40,
    contract_rate_above_400: 38
  },
  "22ftsxl": {
    adhoc_base_rate_under_100: 8000,
    adhoc_rate_100_200: 52,
    adhoc_rate_200_300: 48,
    adhoc_rate_300_400: 45,
    adhoc_rate_above_400: 44,
    contract_base_rate_under_100: 6800,
    contract_rate_100_200: 44,
    contract_rate_200_300: 40,
    contract_rate_300_400: 38,
    contract_rate_above_400: 36
  },
  "20ftsxl": {
    adhoc_base_rate_under_100: 7500,
    adhoc_rate_100_200: 50,
    adhoc_rate_200_300: 46,
    adhoc_rate_300_400: 43,
    adhoc_rate_above_400: 42,
    contract_base_rate_under_100: 6200,
    contract_rate_100_200: 42,
    contract_rate_200_300: 38,
    contract_rate_300_400: 36,
    contract_rate_above_400: 34
  },
  "17ft": {
    adhoc_base_rate_under_100: 6000,
    adhoc_rate_100_200: 44,
    adhoc_rate_200_300: 40,
    adhoc_rate_300_400: 38,
    adhoc_rate_above_400: 36,
    contract_base_rate_under_100: 5000,
    contract_rate_100_200: 37,
    contract_rate_200_300: 33,
    contract_rate_300_400: 31,
    contract_rate_above_400: 29
  },
  "14ft": {
    adhoc_base_rate_under_100: 5000,
    adhoc_rate_100_200: 40,
    adhoc_rate_200_300: 36,
    adhoc_rate_300_400: 34,
    adhoc_rate_above_400: 32,
    contract_base_rate_under_100: 4200,
    contract_rate_100_200: 33,
    contract_rate_200_300: 30,
    contract_rate_300_400: 28,
    contract_rate_above_400: 26
  },
  "other": {
    adhoc_base_rate_under_100: 10000,
    adhoc_rate_100_200: 58,
    adhoc_rate_200_300: 52,
    adhoc_rate_300_400: 48,
    adhoc_rate_above_400: 46,
    contract_base_rate_under_100: 8500,
    contract_rate_100_200: 49,
    contract_rate_200_300: 44,
    contract_rate_300_400: 40,
    contract_rate_above_400: 38
  }
};

const paths = [
  'quotation_rates.json',
  'public/quotation_rates.json',
  'dist/quotation_rates.json',
  'apps/web/dist/quotation_rates.json',
  'apps/api/dist/quotation_rates.json',
  'dist/apps/web/quotation_rates.json'
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    data.updated_at = new Date().toISOString();
    
    // Update vehicles
    if (Array.isArray(data.vehicles)) {
      data.vehicles = data.vehicles.map(v => {
        const customRates = vehicleRates[v.id] || {
          adhoc_base_rate_under_100: v.base_rate_under_100 || 10000,
          adhoc_rate_100_200: v.rate_100_200 || 60,
          adhoc_rate_200_300: v.rate_200_300 || 54,
          adhoc_rate_300_400: v.rate_300_400 || 50,
          adhoc_rate_above_400: v.rate_above_400 || 48,
          contract_base_rate_under_100: Math.round((v.base_rate_under_100 || 10000) * 0.85),
          contract_rate_100_200: Math.round((v.rate_100_200 || 60) * 0.88),
          contract_rate_200_300: Math.round((v.rate_200_300 || 54) * 0.88),
          contract_rate_300_400: Math.round((v.rate_300_400 || 50) * 0.88),
          contract_rate_above_400: Math.round((v.rate_above_400 || 48) * 0.88)
        };

        return {
          ...v,
          // Standard / Adhoc rates
          base_rate_under_100: customRates.adhoc_base_rate_under_100,
          rate_100_200: customRates.adhoc_rate_100_200,
          rate_200_300: customRates.adhoc_rate_200_300,
          rate_300_400: customRates.adhoc_rate_300_400,
          rate_above_400: customRates.adhoc_rate_above_400,

          // Explicit Adhoc & Contract fields
          adhoc_base_rate_under_100: customRates.adhoc_base_rate_under_100,
          adhoc_rate_100_200: customRates.adhoc_rate_100_200,
          adhoc_rate_200_300: customRates.adhoc_rate_200_300,
          adhoc_rate_300_400: customRates.adhoc_rate_300_400,
          adhoc_rate_above_400: customRates.adhoc_rate_above_400,

          contract_base_rate_under_100: customRates.contract_base_rate_under_100,
          contract_rate_100_200: customRates.contract_rate_100_200,
          contract_rate_200_300: customRates.contract_rate_200_300,
          contract_rate_300_400: customRates.contract_rate_300_400,
          contract_rate_above_400: customRates.contract_rate_above_400
        };
      });
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated adhoc & contract rates in ${p}`);
  }
});
