import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Box, Scale, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils.js';

const QuoteCalculationBreakdown = ({ 
  calculations, 
  actualWeight, 
  baseRatePerKg, 
  zoneMultiplier, 
  fuelSurcharge, 
  handlingFees 
}) => {
  const { volumetricWeight, chargeableWeight, usedWeightType, weightCharge, totalPrice } = calculations;

  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Calculation Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weights Section */}
          <div className="space-y-3 p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border pb-2">
              <Scale className="w-4 h-4" /> Weight Comparison
            </div>
            
            <div className={cn(
              "flex justify-between items-center p-2 rounded transition-colors",
              usedWeightType === 'Actual' ? "bg-primary/10 ring-1 ring-primary/20" : ""
            )}>
              <span className="text-sm">Actual Weight</span>
              <span className="font-medium">{Number(actualWeight).toLocaleString()} kg</span>
            </div>
            
            <div className={cn(
              "flex justify-between items-center p-2 rounded transition-colors",
              usedWeightType === 'Volumetric' ? "bg-primary/10 ring-1 ring-primary/20" : ""
            )}>
              <div className="flex flex-col">
                <span className="text-sm">Volumetric Weight</span>
                <span className="text-xs text-muted-foreground">(L × W × H) / 5000</span>
              </div>
              <span className="font-medium">{volumetricWeight.toLocaleString()} kg</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border font-semibold">
              <span>Chargeable Weight</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">{usedWeightType} used</Badge>
                <span className="text-primary">{chargeableWeight.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3 p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border pb-2">
              <Banknote className="w-4 h-4" /> Pricing Breakdown
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span>Freight Charge</span>
                <span className="text-xs text-muted-foreground">
                  {chargeableWeight}kg × ₹{baseRatePerKg} × {zoneMultiplier}x (Zone)
                </span>
              </div>
              <span className="font-medium">₹{weightCharge.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span>Fuel Surcharge</span>
              <span className="font-medium">₹{Number(fuelSurcharge).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>Handling Fees</span>
              <span className="font-medium">₹{Number(handlingFees).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-lg">
              <span>Total Price</span>
              <span className="text-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCalculationBreakdown;