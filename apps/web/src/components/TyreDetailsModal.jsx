import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, X, ImageOff, CheckCircle2, ShieldAlert, Settings2, Calendar, Maximize2, RefreshCw } from 'lucide-react';
import { TYRE_SLOTS } from './TyreFormModal.jsx';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TyreDetailsModal({ isOpen, onClose, tyre, onEdit, onDelete, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  React.useEffect(() => {
    if (tyre && isOpen) {
      if (tyre.tyre_image) {
        if (Array.isArray(tyre.tyre_image) && tyre.tyre_image.length > 0) {
          setActiveImage(tyre.tyre_image[0]);
        } else if (typeof tyre.tyre_image === 'string') {
          setActiveImage(tyre.tyre_image);
        } else {
          setActiveImage(null);
        }
      } else {
        setActiveImage(null);
      }
    }
  }, [tyre, isOpen]);

  const handleRecalculate = async () => {
    if (!tyre) return;
    setIsRecalculating(true);
    try {
      const truck = await pb.collection('trucks').getOne(tyre.truck_id, { $autoCancel: false });
      if (!truck) {
        throw new Error("Associated truck not found.");
      }

      const purchaseDate = tyre.purchase_date ? tyre.purchase_date.split('T')[0] : tyre.created.split(' ')[0];

      // Query 1: completed trips before purchase date (for start odometer)
      const historicalTrips = await pb.collection('trip_logs').getFullList({
        filter: `truck_number = "${truck.truck_number}" && trip_status = "Completed" && date < "${purchaseDate}"`,
        $autoCancel: false
      });
      const assignmentStartKms = historicalTrips.reduce((acc, t) => acc + (t.kms || 0), 0);

      // Query 2: completed trips after purchase date (actual tyre mileage)
      const activeTrips = await pb.collection('trip_logs').getFullList({
        filter: `truck_number = "${truck.truck_number}" && trip_status = "Completed" && date >= "${purchaseDate}"`,
        $autoCancel: false
      });
      const calculatedCurrentKms = activeTrips.reduce((acc, t) => acc + (t.kms || 0), 0);

      await pb.collection('tyres').update(tyre.id, {
        assignment_start_kms: assignmentStartKms,
        current_lifecycle_kms: tyre.base_lifecycle_kms !== undefined ? tyre.base_lifecycle_kms : calculatedCurrentKms
      }, { $autoCancel: false });

      toast.success("Mileage recalculated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to recalculate mileage: " + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!tyre) return null;

  const slotDef = TYRE_SLOTS.find(s => s.id === tyre.tyre_position);
  const positionLabel = slotDef ? slotDef.label : tyre.tyre_position?.replace(/-/g, ' ') || 'Unknown Position';

  // Fast high-quality preview (800x600 maintains retina sharpness while reducing payload from ~5MB to ~45KB)
  const previewUrl = activeImage ? pb.files.getUrl(tyre, activeImage, { thumb: '800x600' }) : null;
  const originalUrl = activeImage ? pb.files.getUrl(tyre, activeImage) : null;

  let statusColor = "text-muted-foreground bg-muted border-black/10";
  let StatusIcon = CheckCircle2;
  let statusText = tyre.status;
  
  const lifecycleKms = tyre.current_lifecycle_kms || 0;
  const TYRE_LIFECYCLE_THRESHOLD = 80000;
  const usagePercentage = Math.min((lifecycleKms / TYRE_LIFECYCLE_THRESHOLD) * 100, 100);

  if (tyre.status === 'active') {
    if (lifecycleKms >= TYRE_LIFECYCLE_THRESHOLD) {
      statusText = "Replacement Recommended";
      statusColor = "text-destructive bg-destructive/10 border-destructive/20";
      StatusIcon = ShieldAlert;
    } else if (lifecycleKms >= 60000) {
      statusText = "Rotation Due";
      statusColor = "text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      StatusIcon = Settings2;
    } else {
      statusColor = "text-[hsl(var(--success))] bg-[hsl(var(--success))/0.15] border-[hsl(var(--success))/0.2]";
      StatusIcon = CheckCircle2;
    }
  } else if (tyre.status === 'worn') {
    statusColor = "text-[hsl(var(--warning))] bg-[hsl(var(--warning))/0.15] border-[hsl(var(--warning))/0.2]";
    StatusIcon = Settings2;
  } else if (tyre.status === 'damaged') {
    statusColor = "text-destructive bg-destructive/10 border-destructive/20";
    StatusIcon = ShieldAlert;
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this tyre record?')) {
      setIsDeleting(true);
      await onDelete(tyre.id);
      setIsDeleting(false);
      onClose();
    }
  };

  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col py-3 border-b border-border/50 last:border-0">
      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground mt-0.5">{value || '-'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-3xl border-border/50 shadow-elevated">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 z-50 bg-background/50 backdrop-blur hover:bg-background rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          {/* Image Panel */}
          <div className="md:w-[45%] relative bg-secondary flex flex-col justify-center min-h-[250px] md:min-h-[400px]">
            {previewUrl ? (
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-zoom-in block relative group">
                <img 
                  src={previewUrl} 
                  alt={tyre.tyre_brand} 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover animate-in fade-in duration-300" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-200">
                  <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" /> View Full Original Image
                  </span>
                </div>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/60 p-8">
                <ImageOff className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">No photo uploaded</p>
              </div>
            )}
            <div className="absolute top-4 left-4 z-10">
               <Badge className={`px-3 py-1.5 text-xs shadow-md border flex items-center gap-1.5 capitalize backdrop-blur-md ${statusColor}`}>
                 <StatusIcon className="w-3.5 h-3.5" /> {statusText}
               </Badge>
            </div>
            {Array.isArray(tyre.tyre_image) && tyre.tyre_image.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-20">
                <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-full overflow-x-auto">
                  {tyre.tyre_image.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImage === img ? 'border-primary scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                    >
                      <img 
                        src={pb.files.getUrl(tyre, img, { thumb: '100x100' })} 
                        alt={`Tyre Thumbnail ${idx + 1}`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="md:w-[55%] flex flex-col bg-card overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{positionLabel}</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">{tyre.tyre_brand}</h2>
              <p className="text-sm text-muted-foreground">{tyre.model_no ? `Model: ${tyre.model_no}` : 'No model specified'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Lifecycle Progress */}
              <div className="bg-secondary/40 p-4 rounded-2xl border border-border/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tyre Lifespan</span>
                  <span className="text-sm font-bold text-foreground">
                    {lifecycleKms.toLocaleString()} / {TYRE_LIFECYCLE_THRESHOLD.toLocaleString()} km
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      usagePercentage >= 100 ? 'bg-destructive' : usagePercentage >= 75 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-x-4">
                <DetailRow label="Serial Number" value={tyre.serial_number} />
                <DetailRow label="Current Depth" value={tyre.tyre_depth_mm ? `${tyre.tyre_depth_mm} mm` : '-'} />
                <DetailRow 
                  label="Purchase Date" 
                  value={tyre.purchase_date ? format(new Date(tyre.purchase_date), 'dd MMM yyyy') : '-'} 
                />
                <DetailRow label="Axle Type" value={tyre.axle_position ? tyre.axle_position.replace(/-/g, ' ') : '-'} />
                <DetailRow label="Base Lifespan KMS" value={tyre.base_lifecycle_kms ? `${tyre.base_lifecycle_kms.toLocaleString()} km` : '-'} />
                <DetailRow label="Starting Truck KMS" value={tyre.assignment_start_kms ? `${tyre.assignment_start_kms.toLocaleString()} km` : '-'} />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-secondary/20 border-t border-border/50 flex items-center justify-between gap-3">
              <Button 
                variant="destructive" 
                size="sm" 
                className="rounded-xl flex items-center gap-1.5"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" /> Delete Tyre
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl flex items-center gap-1.5"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                >
                  <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} /> Recalculate KMS
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl flex items-center gap-1.5"
                  onClick={() => {
                    onClose();
                    onEdit(tyre);
                  }}
                >
                  <Pencil className="w-4 h-4" /> Edit Tyre
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
