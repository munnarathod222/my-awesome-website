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
      const assignmentStartKms = historicalTrips.reduce((sum, trip) => sum + (trip.kms || 0), 0);

      // Query 2: completed trips since purchase date
      const lifecycleTrips = await pb.collection('trip_logs').getFullList({
        filter: `truck_number = "${truck.truck_number}" && trip_status = "Completed" && date >= "${purchaseDate}"`,
        $autoCancel: false
      });
      const currentLifecycleKms = lifecycleTrips.reduce((sum, trip) => sum + (trip.kms || 0), 0);

      // Save updated tyre
      await pb.collection('tyres').update(tyre.id, {
        assignment_start_kms: assignmentStartKms,
        current_lifecycle_kms: currentLifecycleKms
      }, { $autoCancel: false });

      toast.success('Mileage recalculated successfully!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to recalculate mileage: ' + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!tyre) return null;

  const slotDef = TYRE_SLOTS.find(s => s.id === tyre.tyre_position);
  const positionLabel = slotDef ? slotDef.label : tyre.tyre_position?.replace(/-/g, ' ') || 'Unknown Position';

  const imageUrl = activeImage ? pb.files.getURL(tyre, activeImage) : null;

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
            {imageUrl ? (
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-zoom-in block relative group">
                <img src={imageUrl} alt={tyre.tyre_brand} className="w-full h-full object-cover animate-in fade-in duration-300" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-200">
                  <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" /> View Full Image
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
                      <img src={pb.files.getURL(tyre, img, { thumb: '50x50' })} alt={`Tyre Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="md:w-[55%] flex flex-col bg-card">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="mb-6">
                <p className="text-sm font-bold text-primary tracking-wider uppercase mb-1">{positionLabel}</p>
                <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground leading-tight">
                  {tyre.tyre_brand}
                </h2>
                <p className="text-lg text-muted-foreground font-medium mt-1">{tyre.model_no}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/20 p-5 rounded-2xl border border-border/50 flex justify-between items-center shadow-inner">
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tread Depth</p>
                     <p className="text-3xl font-bold font-heading mt-1">{tyre.tyre_depth_mm}<span className="text-base text-muted-foreground ml-1">mm</span></p>
                   </div>
                   <div className="h-12 w-12 rounded-full border-4 flex items-center justify-center" style={{ borderColor: tyre.tyre_depth_mm > 4 ? 'hsl(var(--success))' : tyre.tyre_depth_mm > 2 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>
                      <div className="h-8 w-8 rounded-full" style={{ backgroundColor: tyre.tyre_depth_mm > 4 ? 'hsl(var(--success))' : tyre.tyre_depth_mm > 2 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }} />
                   </div>
                </div>

                <div className="bg-secondary/20 p-5 rounded-2xl border border-border/50 flex flex-col justify-center shadow-inner">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tyre Wear</p>
                    <span className="text-xs font-semibold text-foreground">{usagePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${lifecycleKms >= 80000 ? 'bg-destructive' : lifecycleKms >= 60000 ? 'bg-yellow-500' : 'bg-primary'}`} 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">{lifecycleKms.toLocaleString()} / 80,000 KM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6">
                <DetailRow label="Serial Number" value={<span className="font-mono text-sm">{tyre.serial_number}</span>} />
                <DetailRow 
                  label="Purchase Date" 
                  value={
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {tyre.purchase_date ? format(new Date(tyre.purchase_date), 'MMM dd, yyyy') : '-'}
                    </div>
                  } 
                />
                <DetailRow label="Fitment Odometer" value={tyre.assignment_start_kms !== undefined ? `${tyre.assignment_start_kms.toLocaleString()} KM` : '-'} />
                <DetailRow label="Lifecycle Mileage" value={`${lifecycleKms.toLocaleString()} KM`} />
                <DetailRow label="System ID" value={<span className="text-xs text-muted-foreground">{tyre.id}</span>} />
                <DetailRow label="Added On" value={tyre.created ? format(new Date(tyre.created), 'MMM dd, yyyy') : '-'} />
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                onClick={handleDelete}
                disabled={isDeleting || isRecalculating}
              >
                <Trash2 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Delete Record</span>
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                onClick={handleRecalculate}
                disabled={isRecalculating || isDeleting}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
                Recalculate Mileage
              </Button>

              <Button 
                className="rounded-xl shadow-sm md:flex-1 max-w-[180px]"
                onClick={() => { onClose(); onEdit(tyre); }}
                disabled={isRecalculating || isDeleting}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}