import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import pb from '@/lib/pocketbaseClient';

export default function TyreDiagramView({ tyres, onSlotClick, onDragStart, onDrop }) {
  const getTyre = (pos) => tyres.find(t => t.tyre_position === pos);

  const TyreNode = ({ pos, label }) => {
    const tyre = getTyre(pos);
    const hasImage = tyre?.tyre_image;
    // Check if tyre_image is array or string
    const tyreImage = tyre?.tyre_image 
      ? (Array.isArray(tyre.tyre_image) ? tyre.tyre_image[0] : tyre.tyre_image) 
      : null;
    const imageUrl = tyreImage ? pb.files.getURL(tyre, tyreImage, { thumb: '100x100' }) : null;

    let bgClass = "bg-card border-border hover:border-primary";
    if (tyre) {
      const currentKms = tyre.current_lifecycle_kms || 0;
      if (tyre.status === 'damaged' || (tyre.status === 'active' && currentKms >= 80000)) {
        bgClass = "bg-destructive/10 border-destructive hover:border-destructive/80";
      } else if (tyre.status === 'worn' || (tyre.status === 'active' && currentKms >= 60000)) {
        bgClass = "bg-warning/10 border-warning hover:border-warning/80";
      }
    }

    return (
      <div 
        onClick={() => onSlotClick(pos)}
        draggable={!!tyre}
        onDragStart={(e) => onDragStart && onDragStart(e, pos)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop && onDrop(e, pos)}
        className={cn(
          "w-16 h-28 sm:w-20 sm:h-32 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative shadow-md select-none",
          tyre ? bgClass : "bg-muted/30 border-dashed border-border hover:bg-secondary"
        )}
      >
        {tyre ? (
          <>
            {imageUrl ? (
              <img src={imageUrl} alt={tyre.tyre_brand} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex flex-col items-center justify-center p-2 text-center">
                 <span className="text-xs font-bold text-foreground rotate-[-90deg] whitespace-nowrap tracking-widest">{tyre.tyre_depth_mm} mm</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-[10px] sm:text-xs font-bold text-center px-1 leading-tight">{label}</span>
              <span className="text-white/80 text-[10px] mt-1">View</span>
            </div>
          </>
        ) : (
          <>
            <Plus className="w-6 h-6 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-2 font-medium text-center leading-tight px-1">{label}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center p-8 bg-card rounded-3xl border border-border shadow-sm overflow-x-auto">
      <div className="relative flex flex-col items-center w-full max-w-md">
        {/* Chassis Frame */}
        <div className="absolute top-10 bottom-28 w-6 sm:w-8 bg-muted-foreground/10 rounded-full z-0 shadow-inner" />
        
        {/* CAB */}
        <div className="w-32 sm:w-40 h-24 sm:h-28 bg-secondary/80 rounded-t-[3rem] rounded-b-xl border border-border/50 flex flex-col items-center justify-center z-10 shadow-sm relative">
           <div className="w-20 sm:w-24 h-8 sm:h-10 bg-background/50 rounded-t-xl absolute top-3 shadow-inner" />
           <span className="font-heading font-bold text-muted-foreground text-sm mt-8 sm:mt-10 tracking-widest">CAB</span>
        </div>

        {/* Front Axle */}
        <div className="relative flex items-center justify-center w-[240px] sm:w-[280px] mt-12 sm:mt-16 z-10">
          <div className="absolute h-3 sm:h-4 bg-foreground/10 w-full z-0 rounded-full shadow-inner" />
          <div className="flex justify-between w-full z-10">
            <TyreNode pos="front_left" label="Front Left" />
            <TyreNode pos="front_right" label="Front Right" />
          </div>
        </div>

        {/* Rear Axles */}
        <div className="relative flex items-center justify-center w-[340px] sm:w-[420px] mt-24 sm:mt-28 z-10">
          <div className="absolute h-3 sm:h-4 bg-foreground/10 w-full z-0 rounded-full shadow-inner" />
          <div className="flex justify-between w-full z-10">
            <div className="flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-background/50 backdrop-blur rounded-2xl border border-border/50 shadow-sm">
              <TyreNode pos="rear_left_1" label="Rear L Outer" />
              <TyreNode pos="rear_left_2" label="Rear L Inner" />
            </div>
            <div className="flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-background/50 backdrop-blur rounded-2xl border border-border/50 shadow-sm">
              <TyreNode pos="rear_right_1" label="Rear R Inner" />
              <TyreNode pos="rear_right_2" label="Rear R Outer" />
            </div>
          </div>
        </div>

        {/* Stepney */}
        <div className="mt-16 sm:mt-20 z-10">
          <div className="p-2 sm:p-3 bg-background/50 backdrop-blur rounded-2xl border border-border/50 shadow-sm inline-block">
             <TyreNode pos="stepney" label="Stepney/Spare" />
          </div>
        </div>
      </div>
    </div>
  );
}