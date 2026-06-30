import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Edit, Trash2, Settings, Image as ImageIcon, ChevronLeft, ChevronRight, X, User, MoreVertical, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent 
} from '@/components/ui/dropdown-menu';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import TruckFormModal from '@/components/TruckFormModal.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

export default function TruckManagerPage() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, truck: null });
  const [galleryConfig, setGalleryConfig] = useState({ isOpen: false, truck: null, activeIndex: 0 });
  const navigate = useNavigate();

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const [trucksRes, driversRes] = await Promise.all([
        pb.collection('trucks').getFullList({
          sort: '-created',
          $autoCancel: false
        }),
        pb.collection('employees').getFullList({
          filter: 'employee_type="driver"',
          $autoCancel: false
        })
      ]);
      setTrucks(trucksRes);
      setDrivers(driversRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trucks and drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this truck? This will also delete all associated tyres.')) {
      try {
        await pb.collection('trucks').delete(id, { $autoCancel: false });
        toast.success('Truck deleted successfully');
        fetchTrucks();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete truck');
      }
    }
  };

  const handleUnlink = async (driver) => {
    if (!driver) return;
    if (window.confirm(`Are you sure you want to unlink driver ${driver.name}?`)) {
      try {
        setLoading(true);
        await pb.collection('employees').update(driver.id, { assigned_truck: '' }, { $autoCancel: false });
        toast.success(`Unlinked driver ${driver.name} successfully`);
        await fetchTrucks();
      } catch (err) {
        console.error(err);
        toast.error('Failed to unlink driver');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwap = async (truckId, newDriverId, currentDriver) => {
    try {
      setLoading(true);
      if (currentDriver) {
        await pb.collection('employees').update(currentDriver.id, { assigned_truck: '' }, { $autoCancel: false });
      }
      await pb.collection('employees').update(newDriverId, { assigned_truck: truckId }, { $autoCancel: false });
      toast.success('Driver assigned successfully');
      await fetchTrucks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            Truck Manager
          </h1>
          <p className="text-muted-foreground mt-1">Manage your fleet vehicles and their configurations.</p>
        </div>
        <Button onClick={() => setModalConfig({ isOpen: true, truck: null })} className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add New Truck
        </Button>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 flex justify-center"><LoadingSpinner text="Loading trucks..." /></div>
      ) : trucks.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 text-center text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No trucks found. Add your first truck to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map(truck => {
            const hasImages = truck.body_images && truck.body_images.length > 0;
            const primaryImage = hasImages ? pb.files.getUrl(truck, truck.body_images[0]) : null;
            const assignedDriver = drivers.find(d => d.assigned_truck === truck.id);
            const availableDrivers = drivers.filter(d => !d.assigned_truck);

            return (
              <div key={truck.id} className="group bg-card border border-border/60 hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                {/* Card Header Image */}
                <div 
                  className="h-60 w-full relative bg-muted overflow-hidden cursor-pointer"
                  onClick={() => hasImages && setGalleryConfig({ isOpen: true, truck, activeIndex: 0 })}
                >
                  {hasImages ? (
                    <img 
                      src={primaryImage} 
                      alt={truck.truck_name || 'Truck body'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative">
                      <Truck className="w-16 h-16 text-primary/20 mb-2" />
                      <span className="text-xs text-muted-foreground">No reference images</span>
                    </div>
                  )}
                  
                  {/* Status Badge overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className={
                      truck.status === 'active' 
                        ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white font-medium border-0 px-2.5 py-1' 
                        : 'bg-zinc-500/90 hover:bg-zinc-600 text-white font-medium border-0 px-2.5 py-1'
                    }>
                      {truck.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Image count indicator overlay */}
                  {hasImages && truck.body_images.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{truck.body_images.length} Photos</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Truck Header: Icon + Nickname */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Truck className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                        {truck.truck_name || 'Unnamed Truck'}
                      </h3>
                    </div>

                    {/* Driver Link Section */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 mb-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Driver Photo/Avatar Placeholder */}
                        {assignedDriver && assignedDriver.photo ? (
                          <img 
                            src={pb.files.getUrl(assignedDriver, assignedDriver.photo)} 
                            alt={assignedDriver.name} 
                            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {assignedDriver ? (
                              assignedDriver.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            ) : (
                              <User className="w-4 h-4 opacity-40" />
                            )}
                          </div>
                        )}
                        
                        <div className="overflow-hidden">
                          {/* Truck Registration Number */}
                          <p className="text-sm font-bold text-foreground tracking-wider font-mono truncate">
                            {truck.truck_number}
                          </p>
                          {/* Driver Name directly below */}
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {assignedDriver ? assignedDriver.name : <span className="italic text-muted-foreground/60">Unassigned</span>}
                          </p>
                        </div>
                      </div>

                      {/* Action Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-muted shrink-0">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
                          {assignedDriver ? (
                            <>
                              <DropdownMenuLabel>Current Driver</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
                                onSelect={() => handleUnlink(assignedDriver)}
                              >
                                Unlink {assignedDriver.name}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Swap Driver</DropdownMenuLabel>
                            </>
                          ) : (
                            <DropdownMenuLabel>Assign Driver</DropdownMenuLabel>
                          )}

                          {availableDrivers.length === 0 ? (
                            <DropdownMenuItem disabled className="text-muted-foreground italic text-xs">
                              No unassigned drivers
                            </DropdownMenuItem>
                          ) : (
                            availableDrivers.map(d => (
                              <DropdownMenuItem 
                                key={d.id} 
                                onSelect={() => handleSwap(truck.id, d.id, assignedDriver)}
                              >
                                {d.name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Specs badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="border-border bg-background px-2.5 py-0.5 rounded-lg text-xs font-medium">
                        Size: {truck.truck_size}
                      </Badge>
                      <Badge variant="secondary" className="px-2.5 py-0.5 rounded-lg text-xs font-medium">
                        Axle: {truck.truck_axle}
                      </Badge>
                      <Badge variant="outline" className="border-border bg-background px-2.5 py-0.5 rounded-lg text-xs font-medium">
                        {truck.tyre_count} Tyres
                      </Badge>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-border bg-background hover:bg-muted text-xs font-medium flex items-center gap-1"
                        onClick={() => navigate(`/tyre-manager/${truck.id}`)}
                        title="Manage truck tyres"
                      >
                        <Settings className="w-3 h-3" /> Tyres
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-border bg-background hover:bg-muted text-xs font-medium flex items-center gap-1"
                        onClick={() => navigate(`/fleet-maintenance?truckId=${truck.id}`)}
                        title="Manage fleet maintenance"
                      >
                        <Wrench className="w-3 h-3 text-primary" /> Maintenance
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg hover:bg-muted" 
                        onClick={() => setModalConfig({ isOpen: true, truck })}
                        title="Edit vehicle details"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" 
                        onClick={() => handleDelete(truck.id)}
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TruckFormModal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig({ isOpen: false, truck: null })} 
        truck={modalConfig.truck}
        onSuccess={fetchTrucks}
      />

      {/* Image Gallery Modal */}
      {galleryConfig.isOpen && galleryConfig.truck && (
        <Dialog 
          open={galleryConfig.isOpen} 
          onOpenChange={(val) => !val && setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 })}
        >
          <DialogContent className="sm:max-w-[700px] p-0 bg-black/95 border-0 text-white rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-4 flex items-center justify-between border-b border-white/10 z-10 bg-black/40 backdrop-blur-md">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {galleryConfig.truck.truck_name || 'Truck Images'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{galleryConfig.truck.truck_number}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={() => setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Main display */}
            <div className="relative flex-1 flex items-center justify-center min-h-[400px] max-h-[550px] p-4 bg-zinc-950">
              {galleryConfig.truck.body_images.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/85 text-white border-0"
                  onClick={() => setGalleryConfig(prev => ({
                    ...prev,
                    activeIndex: (prev.activeIndex - 1 + prev.truck.body_images.length) % prev.truck.body_images.length
                  }))}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              <img 
                src={pb.files.getUrl(galleryConfig.truck, galleryConfig.truck.body_images[galleryConfig.activeIndex])} 
                alt={`Truck body ${galleryConfig.activeIndex + 1}`} 
                className="max-w-full max-h-[480px] object-contain rounded-lg shadow-lg"
              />

              {galleryConfig.truck.body_images.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/85 text-white border-0"
                  onClick={() => setGalleryConfig(prev => ({
                    ...prev,
                    activeIndex: (prev.activeIndex + 1) % prev.truck.body_images.length
                  }))}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {galleryConfig.truck.body_images.length > 1 && (
              <div className="p-4 bg-black/60 border-t border-white/10 flex justify-center gap-2 overflow-x-auto">
                {galleryConfig.truck.body_images.map((imgName, idx) => (
                  <button 
                    key={idx}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      galleryConfig.activeIndex === idx ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setGalleryConfig(prev => ({ ...prev, activeIndex: idx }))}
                  >
                    <img 
                      src={pb.files.getUrl(galleryConfig.truck, imgName)} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}