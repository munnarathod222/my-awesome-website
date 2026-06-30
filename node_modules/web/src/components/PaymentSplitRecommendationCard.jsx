import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, CalendarClock, SplitSquareHorizontal, IndianRupee, Info } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function PaymentSplitRecommendationCard({ 
  originalAmount, 
  splits, 
  surchargeWithout, 
  surchargeWith, 
  savings, 
  isFullyWaived,
  onPlanComplete
}) {
  const { currentUser } = useAuth();
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlanPayments = async () => {
    setIsPlanning(true);
    try {
      const today = new Date();
      
      const promises = splits.map((amount, index) => {
        // Schedule them a day apart or all today, let's say all today for simplicity, but user can edit later
        const date = new Date(today);
        date.setDate(date.getDate() + index);
        
        return pb.collection('planned_surcharge_payments').create({
          user_id: currentUser.id,
          payment_date: date.toISOString(),
          expected_surcharge_amount: amount,
          payment_method: 'Card',
          status: 'pending',
          notes: `Split payment ${index + 1} of ${splits.length} for ₹${originalAmount.toLocaleString('en-IN')} bill.`
        }, { $autoCancel: false });
      });

      await Promise.all(promises);
      toast.success(`${splits.length} planned payments created successfully!`);
      if (onPlanComplete) onPlanComplete();
    } catch (error) {
      console.error("Error planning splits:", error);
      toast.error("Failed to add payments to planner.");
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <Card className={`border-2 shadow-md relative overflow-hidden ${savings > 0 ? 'border-success/40 bg-success/5' : 'border-border'}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <SplitSquareHorizontal className="w-32 h-32" />
      </div>
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-2 text-xl">
          {savings > 0 ? (
            <><CheckCircle2 className="w-5 h-5 text-success" /> Optimal Split Strategy Found</>
          ) : (
            <><Info className="w-5 h-5 text-muted-foreground" /> Split Recommendation</>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-border rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Bill Amount</p>
            <p className="text-2xl font-bold">₹{originalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-background border border-border rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Splits</p>
            <p className="text-2xl font-bold text-primary">{splits.length} Payments</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Payment Schedule</h4>
          <div className="flex flex-wrap gap-2">
            {splits.map((amt, idx) => (
              <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm bg-background border-primary/20 text-foreground">
                <span className="text-muted-foreground mr-2">#{idx + 1}</span> ₹{amt.toLocaleString('en-IN')}
              </Badge>
            ))}
          </div>
          {isFullyWaived && (
            <p className="text-sm text-success flex items-center mt-2 font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> All split payments are eligible for 100% waiver!
            </p>
          )}
        </div>

        <Separator className="bg-border/50" />

        <div className="bg-background p-5 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Surcharge (If Not Split)</span>
            <span className="font-semibold text-destructive">₹{surchargeWithout.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Surcharge (With Split)</span>
            <span className="font-semibold">₹{surchargeWith.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <span className="font-bold text-foreground text-lg">Total Savings</span>
            <span className={`text-2xl font-bold ${savings > 0 ? 'text-success' : 'text-muted-foreground'}`}>
              ₹{savings.toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 relative z-10">
        <Button 
          onClick={handlePlanPayments} 
          disabled={isPlanning} 
          className="w-full text-base h-12 shadow-md gap-2"
        >
          <CalendarClock className="w-5 h-5" />
          Plan These Payments Now
        </Button>
      </CardFooter>
    </Card>
  );
}