import { useMemo } from 'react';

export const useQuoteCalculator = ({
  actualWeight = 0,
  length = 0,
  width = 0,
  height = 0,
  baseRatePerKg = 0,
  zoneDistanceMultiplier = 1,
  fuelSurcharge = 0,
  handlingFees = 0
}) => {
  return useMemo(() => {
    // 1. Calculate Volumetric Weight
    const volumetricWeight = (Number(length) * Number(width) * Number(height)) / 5000;
    
    // 2. Determine Chargeable Weight (Max of actual or volumetric)
    const chargeableWeight = Math.max(Number(actualWeight), volumetricWeight);
    const usedWeightType = Number(actualWeight) >= volumetricWeight ? 'Actual' : 'Volumetric';

    // 3. Calculate Weight Charge
    const weightCharge = chargeableWeight * Number(baseRatePerKg) * Number(zoneDistanceMultiplier);

    // 4. Calculate Total Price
    const totalPrice = weightCharge + Number(fuelSurcharge) + Number(handlingFees);

    return {
      volumetricWeight: Number(volumetricWeight.toFixed(2)),
      chargeableWeight: Number(chargeableWeight.toFixed(2)),
      usedWeightType,
      weightCharge: Number(weightCharge.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2))
    };
  }, [
    actualWeight,
    length,
    width,
    height,
    baseRatePerKg,
    zoneDistanceMultiplier,
    fuelSurcharge,
    handlingFees
  ]);
};