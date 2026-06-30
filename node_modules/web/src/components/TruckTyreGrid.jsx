import React from 'react';
import { Edit, Trash2, ShieldAlert, CheckCircle2, Settings2, Disc, ArrowDownUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TyreDepthIndicator from './TyreDepthIndicator.jsx';

const TyreCard = ({ tyre, onEdit, onDelete }) => {
  let statusColor = "bg-muted text-muted-foreground border-border";
  let StatusIcon = Disc;
  
  if (tyre.status === 'active') {
    statusColor = "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] border-[hsl(var(--success))/0.2]";
    StatusIcon = CheckCircle2;
  } else if (tyre.status === 'worn') {
    statusColor = "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning))/0.2]";
    StatusIcon = Settings2;
  } else if (tyre.status === 'damaged') {
    statusColor = "bg-destructive/10 text-destructive border-destructive/20";
    StatusIcon = ShieldAlert;
  } else if (tyre.status === 'replaced') {
    statusColor = "bg-secondary text-secondary-foreground border-border";
    StatusIcon = ArrowDownUp;
  }

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 bg-secondary/30 border-b border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Position</span>
            <span className="font-semibold text-sm capitalize">{tyre.tyre_position?.replace(/-/g, ' ') || 'Unassigned'}</span>
          </div>
          <Badge variant="outline" className={cn("px-2.5 py-0.5 flex items-center gap-1.5 capitalize shadow-sm text-xs", statusColor)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {tyre.status}
          </Badge>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg leading-tight">{tyre.tyre_brand}</h3>
            <p className="text-muted-foreground text-sm font-medium">{tyre.model_no}</p>
          </div>
          
          <div className="flex items-center justify-between py-3 border-y border-border/50 border-dashed">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Serial No.</span>
              <span className="font-mono text-sm font-medium mt-0.5">{tyre.serial_number}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Depth</span>
              <span className="font-bold text-base mt-0.5">{tyre.tyre_depth_mm} <span className="text-xs font-normal text-muted-foreground">mm</span></span>
            </div>
          </div>
          
          <div className="pt-1">
             <TyreDepthIndicator depthMm={Number(tyre.tyre_depth_mm)} className="shadow-none border-transparent bg-secondary/50 rounded-xl" />
          </div>
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" className="rounded-xl shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => onEdit(tyre)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" className="rounded-xl shadow-sm" onClick={() => onDelete(tyre.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TruckTyreGrid({ tyres, onEdit, onDelete }) {
  if (!tyres || tyres.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-border/50 min-h-[300px]">
        <Disc className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-heading font-bold">No Tyres Found</h3>
        <p className="text-muted-foreground text-sm mt-1">There are no tyres assigned to this view.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {tyres.map(tyre => (
        <TyreCard key={tyre.id} tyre={tyre} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}