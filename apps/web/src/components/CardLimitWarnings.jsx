import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

export default function CardLimitWarnings({ card, availableCredit = 0 }) {
  if (!card) return null;

  const waiverLimit = card.monthly_waiver_limit || 20000;
  const waiverUsed = card.current_month_waiver_used || 0;
  const waiverRemaining = Math.max(0, waiverLimit - waiverUsed);
  const waiverPercent = Math.min(100, (waiverUsed / waiverLimit) * 100);

  let status = 'ACTIVE';
  let statusColor = 'bg-success/10 text-success border-success/20';
  let Icon = CheckCircle2;

  if (waiverPercent >= 100 || availableCredit <= 0) {
    status = 'STOP - CAP HIT';
    statusColor = 'bg-destructive/10 text-destructive border-destructive/20';
    Icon = ShieldAlert;
  } else if (waiverPercent >= 80 || availableCredit < 5000) {
    status = 'IN PROGRESS';
    statusColor = 'bg-warning/10 text-warning border-warning/20';
    Icon = AlertTriangle;
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Card Status</h4>
        <Badge variant="outline" className={`gap-1.5 ${statusColor}`}>
          <Icon className="w-3.5 h-3.5" /> {status}
        </Badge>
      </div>

      {status === 'STOP - CAP HIT' && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Capacity Reached</AlertTitle>
          <AlertDescription>
            This card has reached its monthly waiver limit or credit capacity. Please select an alternative card for optimal savings.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Waiver Usage</span>
          <span className="font-medium">{waiverPercent.toFixed(0)}%</span>
        </div>
        <Progress value={waiverPercent} className={`h-2 ${waiverPercent >= 100 ? '[&>div]:bg-destructive' : waiverPercent >= 80 ? '[&>div]:bg-warning' : '[&>div]:bg-primary'}`} />
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>Used: ₹{waiverUsed.toLocaleString('en-IN')}</span>
          <span>Remaining: ₹{waiverRemaining.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm bg-muted/30 p-3 rounded-lg border border-border">
        <span className="text-muted-foreground">Available Credit Capacity</span>
        <span className={`font-semibold ${availableCredit < 5000 ? 'text-warning' : 'text-foreground'}`}>
          ₹{availableCredit.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}