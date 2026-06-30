import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Truck, Plus } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function TruckCard({ truck, tyres, onTyreClick, onEmptySlotClick }) {
  const activeTyres = tyres.filter(t => t.status !== 'replaced');
  
  let truckStatus = 'good';
  if (activeTyres.length === 0) {
    truckStatus = 'unknown';
  } else if (activeTyres.some(t => t.status === 'damaged')) {
    truckStatus = 'critical';
  } else if (activeTyres.some(t => t.status === 'worn')) {
    truckStatus = 'warning';
  }

  const isMultiAxle = activeTyres.some(t => 
    t.axle_position?.includes('Axle2') || t.axle_position?.includes('Axle3')
  );
  
  const truckTypeLabel = isMultiAxle ? 'Multi-Axle (8 Tyres)' : 'Single Axle (6 Tyres)';
  const axleType = isMultiAxle ? 'multi_axle' : 'single_axle';

  const getTyreColorClass = (status) => {
    switch (status) {
      case 'active': return 'bg-[hsl(var(--success))] border-black/20 text-success-foreground';
      case 'worn': return 'bg-[hsl(var(--warning))] border-black/20 text-warning-foreground';
      case 'damaged': return 'bg-[hsl(var(--destructive))] border-black/20 text-destructive-foreground';
      case 'replaced': return 'bg-muted-foreground border-black/20 text-muted';
      default: return 'bg-muted-foreground border-black/20 text-muted';
    }
  };

  const StatusBadge = () => {
    if (truckStatus === 'critical') return <Badge variant="destructive" className="shadow-sm">Critical</Badge>;
    if (truckStatus === 'warning') return <Badge className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))/0.9] text-[hsl(var(--warning-foreground))] shadow-sm">Warning</Badge>;
    if (truckStatus === 'good') return <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))/0.9] text-[hsl(var(--success-foreground))] shadow-sm">Optimal</Badge>;
    return <Badge variant="secondary" className="shadow-sm">No Data</Badge>;
  };

  const renderTyreNode = (positionId, positionLabel) => {
    const tyre = activeTyres.find(t => t.axle_position === positionId);
    
    if (tyre) {
      return (
        <div className="relative flex flex-col items-center">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  onClick={(e) => { e.stopPropagation(); onTyreClick(tyre); }}
                  className={cn(
                    "w-6 h-14 rounded-sm border-2 shadow-sm transition-all duration-200 cursor-pointer hover:scale-110 hover:-translate-y-0.5 hover:shadow-md hover:z-20 flex items-center justify-center relative",
                    getTyreColorClass(tyre.status)
                  )}
                >
                  <span className="font-mono text-[10px] font-bold rotate-90">{tyre.tyre_depth_mm}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-1 p-3 font-sans">
                <p className="font-bold text-sm border-b pb-1 mb-1">{tyre.tyre_brand} <span className="font-normal text-muted-foreground ml-1">{tyre.model_no}</span></p>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">S/N:</span>
                  <span className="font-mono">{tyre.serial_number}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">Pos:</span>
                  <span className="font-medium capitalize">{positionId.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">Depth:</span>
                  <span className="font-bold">{tyre.tyre_depth_mm} mm</span>
                </div>
                <div className="flex justify-between gap-4 text-xs capitalize mt-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    "font-bold",
                    tyre.status === 'active' ? "text-[hsl(var(--success))]" : 
                    tyre.status === 'worn' ? "text-[hsl(var(--warning))]" : "text-destructive"
                  )}>{tyre.status}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Click to manage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="absolute -bottom-4 text-[9px] font-bold text-muted-foreground whitespace-nowrap">{positionLabel}</span>
        </div>
      );
    }

    return (
      <div className="relative flex flex-col items-center">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={(e) => { e.stopPropagation(); onEmptySlotClick(truck.id, positionId, axleType); }}
                className="w-6 h-14 rounded-sm border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center transition-all duration-200 cursor-pointer hover:border-primary hover:bg-primary/5 group"
              >
                <Plus className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Click to assign tyre at {positionId.replace(/-/g, ' ')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="absolute -bottom-4 text-[9px] font-bold text-muted-foreground/50 whitespace-nowrap">{positionLabel}</span>
      </div>
    );
  };

  const SingleAxleView = () => (
    <div className="flex flex-col w-full relative max-w-[280px] mx-auto py-2">
      {/* Front Axle */}
      <div className="w-full relative py-6 flex flex-col items-center">
        <span className="absolute top-0 left-2 text-[9px] font-bold text-muted-foreground tracking-wider bg-background px-2 py-0.5 rounded-full border border-border/50">FRONT AXLE</span>
        <div className="w-20 h-16 bg-gradient-to-b from-primary/80 to-primary border border-primary-foreground/20 rounded-t-xl rounded-b-md relative z-10 flex items-center justify-center shadow-md">
          <div className="absolute bottom-2 w-14 h-4 bg-primary-foreground/20 rounded-sm" />
          <div className="absolute -left-10">{renderTyreNode('Front-Left', 'FL')}</div>
          <div className="absolute -right-10">{renderTyreNode('Front-Right', 'FR')}</div>
        </div>
      </div>

      {/* Connector */}
      <div className="w-6 h-10 bg-muted-foreground/40 mx-auto shadow-inner rounded-sm my-0 z-0" />

      {/* Rear Axle */}
      <div className="w-full relative py-8 flex flex-col items-center">
        <span className="absolute top-0 left-2 text-[9px] font-bold text-muted-foreground tracking-wider bg-background px-2 py-0.5 rounded-full border border-border/50">REAR AXLE</span>
        <div className="w-24 h-24 bg-secondary border-2 border-border rounded-md relative z-10 flex items-center justify-center shadow-md">
          <div className="absolute top-1/2 left-[-20%] right-[-20%] h-1.5 bg-zinc-800 -translate-y-1/2 z-0 rounded-full opacity-60" />
          
          {/* Left Duals */}
          <div className="absolute -left-[5.2rem] flex gap-1 items-center top-1/2 -translate-y-1/2 z-10">
            {renderTyreNode('Rear-Left-Outer', 'RLO')}
            {renderTyreNode('Rear-Left-Inner', 'RLI')}
          </div>

          {/* Right Duals */}
          <div className="absolute -right-[5.2rem] flex gap-1 items-center top-1/2 -translate-y-1/2 z-10">
            {renderTyreNode('Rear-Right-Inner', 'RRI')}
            {renderTyreNode('Rear-Right-Outer', 'RRO')}
          </div>
        </div>
      </div>
    </div>
  );

  const MultiAxleView = () => (
    <div className="flex flex-col w-full relative max-w-[280px] mx-auto py-2">
      {/* Front Axle */}
      <div className="w-full relative py-6 flex flex-col items-center">
        <span className="absolute top-0 left-2 text-[9px] font-bold text-muted-foreground tracking-wider bg-background px-2 py-0.5 rounded-full border border-border/50">FRONT AXLE</span>
        <div className="w-20 h-16 bg-gradient-to-b from-primary/80 to-primary border border-primary-foreground/20 rounded-t-xl rounded-b-md relative z-10 flex items-center justify-center shadow-md">
          <div className="absolute bottom-2 w-14 h-4 bg-primary-foreground/20 rounded-sm" />
          <div className="absolute -left-10">{renderTyreNode('Front-Left', 'FL')}</div>
          <div className="absolute -right-10">{renderTyreNode('Front-Right', 'FR')}</div>
        </div>
      </div>

      {/* Connector */}
      <div className="w-6 h-8 bg-muted-foreground/40 mx-auto shadow-inner rounded-sm my-0 z-0" />

      {/* Multi Rear Axles */}
      <div className="w-full relative flex flex-col items-center mt-1">
        <span className="absolute -top-3 left-2 text-[9px] font-bold text-muted-foreground tracking-wider bg-background px-2 py-0.5 rounded-full border border-border/50 z-20">REAR AXLES</span>
        <div className="w-24 flex-1 bg-secondary border-2 border-border rounded-md relative z-10 flex flex-col items-center shadow-md py-6 gap-12">
          {[
            { posL: 'Axle2-Left', posR: 'Axle2-Right', labelL: 'A2L', labelR: 'A2R' },
            { posL: 'Axle3-Left', posR: 'Axle3-Right', labelL: 'A3L', labelR: 'A3R' },
            { posL: 'Rear-Left', posR: 'Rear-Right', labelL: 'RL', labelR: 'RR' }
          ].map((row, idx) => (
            <div key={idx} className="w-full h-0 relative my-auto">
              <div className="absolute top-1/2 left-[-15%] right-[-15%] h-1.5 bg-zinc-800 -translate-y-1/2 z-0 rounded-full opacity-60" />
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10">{renderTyreNode(row.posL, row.labelL)}</div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10">{renderTyreNode(row.posR, row.labelR)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="flex flex-col h-full hover:shadow-elevated transition-all duration-300 border-border/60 bg-card overflow-hidden">
      <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading">{truck.truck_number}</CardTitle>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{truckTypeLabel} • {activeTyres.length} Assigned</p>
            </div>
          </div>
          <StatusBadge />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 py-6 px-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 flex justify-center">
        {axleType === 'single_axle' ? <SingleAxleView /> : <MultiAxleView />}
      </CardContent>
    </Card>
  );
}