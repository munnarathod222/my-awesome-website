import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function TyreDepthIndicator({ depthMm, className }) {
  // Safe >= 4, Warning 2-3.9, Critical < 2
  const maxDepth = 20; // Assume 20mm is roughly a new commercial tyre depth
  const percentage = Math.min(Math.max((depthMm / maxDepth) * 100, 0), 100);
  
  let status = 'critical';
  let colorClass = 'bg-critical';
  let textClass = 'text-critical';
  let bgClass = 'bg-[hsl(var(--critical)/0.2)]';
  let Icon = AlertCircle;
  let message = "CRITICAL: Replace immediately";

  if (depthMm >= 4) {
    status = 'good';
    colorClass = 'bg-success';
    textClass = 'text-success';
    bgClass = 'bg-[hsl(var(--success)/0.2)]';
    Icon = CheckCircle2;
    message = "Safe depth";
  } else if (depthMm >= 2) {
    status = 'warning';
    colorClass = 'bg-warning';
    textClass = 'text-warning';
    bgClass = 'bg-[hsl(var(--warning)/0.2)]';
    Icon = AlertTriangle;
    message = "WARNING: Near replacement limit";
  }

  return (
    <div className={cn("space-y-3 p-4 rounded-xl border", className)}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current Depth</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-bold tracking-tight", textClass)}>
              {depthMm.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">mm</span>
          </div>
        </div>
        <div className={cn("p-2.5 rounded-full", bgClass, textClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Progress 
          value={percentage} 
          className="h-2" 
          indicatorClassName={colorClass}
        />
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>0mm</span>
          <span className="text-foreground">Min Safe: 4mm</span>
          <span>{maxDepth}mm</span>
        </div>
      </div>

      {status !== 'good' && (
        <div className={cn("mt-3 p-2.5 rounded-lg text-sm font-medium flex items-center gap-2", bgClass, textClass)}>
          <Icon className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}