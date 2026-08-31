import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import pb from '@/lib/pocketbaseClient';

const parseImageList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
    if (raw.trim().startsWith('[')) return [];
    return [raw];
  }
  return [];
};

export default function TyreDiagramView({ tyres, onSlotClick, onDragStart, onDrop }) {
  const getTyre = (pos) => tyres.find(t => t.tyre_position === pos);

  const TyreNode = ({ pos, label }) => {
    const tyre = getTyre(pos);
    const tyreImages = parseImageList(tyre?.tyre_image);
    const tyreImage = tyreImages.length > 0 ? tyreImages[0] : null;
    const imageUrl = tyreImage ? pb.files.getUrl(tyre, tyreImage, { thumb: '100x100' }) : null;

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
          "w-12 h-18 sm:w-16 sm:h-22 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative shadow-sm select-none",
          tyre ? bgClass : "bg-muted/30 border-dashed border-border/80 hover:bg-secondary"
        )}
      >
        {tyre ? (
          <>
            {imageUrl ? (
              <img src={imageUrl} alt={tyre.tyre_brand} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/60 flex flex-col items-center justify-center p-1 text-center">
                 <span className="text-[10px] font-bold text-foreground rotate-[-90deg] whitespace-nowrap tracking-wider">{tyre.tyre_depth_mm} mm</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[1px]">
              <span className="text-white text-[9px] font-bold text-center px-0.5 leading-tight">{label}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <Plus className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="text-[8px] sm:text-[9px] text-muted-foreground font-semibold mt-1 leading-none">{label.split(' ')[0]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center p-3 sm:p-5 bg-card/60 rounded-3xl border border-border/60 shadow-sm overflow-x-auto">
      <div className="relative flex flex-col items-center w-full max-w-sm">
        {/* Chassis Frame */}
        <div className="absolute top-6 bottom-16 w-5 bg-muted-foreground/10 rounded-full z-0 shadow-inner" />
        
        {/* CAB */}
        <div className="w-24 sm:w-32 h-12 sm:h-14 bg-secondary/80 rounded-t-[2rem] rounded-b-lg border border-border/50 flex flex-col items-center justify-center z-10 shadow-sm relative">
           <div className="w-14 sm:w-20 h-5 sm:h-6 bg-background/50 rounded-t-lg absolute top-1.5 shadow-inner" />
           <span className="font-heading font-bold text-muted-foreground text-[11px] mt-4 tracking-widest">CAB</span>
        </div>

        {/* Front Axle */}
        <div className="relative flex items-center justify-center w-[200px] sm:w-[240px] mt-5 sm:mt-6 z-10">
          <div className="absolute h-2.5 bg-foreground/10 w-full z-0 rounded-full shadow-inner" />
          <div className="flex justify-between w-full z-10">
            <TyreNode pos="front_left" label="Front Left" />
            <TyreNode pos="front_right" label="Front Right" />
          </div>
        </div>

        {/* Rear Axles */}
        <div className="relative flex items-center justify-center w-[290px] sm:w-[340px] mt-6 sm:mt-8 z-10">
          <div className="absolute h-2.5 bg-foreground/10 w-full z-0 rounded-full shadow-inner" />
          <div className="flex justify-between w-full z-10">
            <div className="flex gap-1 sm:gap-1.5 p-1 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs">
              <TyreNode pos="rear_left_1" label="Rear L Outer" />
              <TyreNode pos="rear_left_2" label="Rear L Inner" />
            </div>
            <div className="flex gap-1 sm:gap-1.5 p-1 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs">
              <TyreNode pos="rear_right_1" label="Rear R Inner" />
              <TyreNode pos="rear_right_2" label="Rear R Outer" />
            </div>
          </div>
        </div>

        {/* Stepney */}
        <div className="mt-5 sm:mt-6 z-10">
          <div className="p-1 sm:p-1.5 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs inline-block">
             <TyreNode pos="stepney" label="Stepney/Spare" />
          </div>
        </div>
      </div>
    </div>
  );
}