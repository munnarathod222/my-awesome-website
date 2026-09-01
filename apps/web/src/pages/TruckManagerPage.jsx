import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Plus, Edit, Trash2, Settings, Image as ImageIcon, ChevronLeft, ChevronRight, 
  X, User, MoreVertical, Wrench, Share2, Landmark, Wallet, Calculator, Download, Camera, Eye, Maximize2
} from 'lucide-react';
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
import ShareFolderDialog from '@/components/ShareFolderDialog.jsx';
import FASTagRechargeModal from '@/components/FASTagRechargeModal.jsx';

export const parseImageList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch(e) {}
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const clean = trimmed.slice(1, -1);
      return clean.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

export default function TruckManagerPage() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loanProfiles, setLoanProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, truck: null });
  const [galleryConfig, setGalleryConfig] = useState({ isOpen: false, truck: null, activeIndex: 0 });
  const navigate = useNavigate();
  const [shareConfig, setShareConfig] = useState({ isOpen: false, truckId: null, employeeId: null, entityName: '' });
  const [fastagConfig, setFastagConfig] = useState({ isOpen: false, truck: null });

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (!galleryConfig.isOpen || !galleryConfig.truck) return;

    const handleKeyDown = (e) => {
      const imgs = parseImageList(galleryConfig.truck?.body_images);
      if (imgs.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setGalleryConfig(prev => ({
          ...prev,
          activeIndex: (prev.activeIndex - 1 + imgs.length) % imgs.length
        }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setGalleryConfig(prev => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % imgs.length
        }));
      } else if (e.key === 'Escape') {
        setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryConfig.isOpen, galleryConfig.truck]);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const [trucksRes, driversRes, loanProfilesRes] = await Promise.all([
        pb.collection('trucks').getFullList({
          sort: '-created',
          expand: 'manager_id',
          $autoCancel: false
        }),
        pb.collection('employees').getFullList({
          filter: 'employee_type="driver"',
          $autoCancel: false
        }),
        pb.collection('loan_profiles').getFullList({
          $autoCancel: false
        })
      ]);
      setTrucks(trucksRes);
      setDrivers(driversRes);
      setLoanProfiles(loanProfilesRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet data');
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

  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'grid'

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            Truck Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your fleet vehicles and configurations in space-saving compact tiles.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-muted/60 p-1 rounded-xl flex items-center border border-border/40">
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${viewMode === 'compact' ? 'shadow-xs text-primary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('compact')}
            >
              ☰ Compact List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${viewMode === 'grid' ? 'shadow-xs text-primary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('grid')}
            >
              🔲 Grid Tiles
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/vehicle-tco')} className="h-8 rounded-xl border-primary/20 text-primary text-xs hover:bg-primary/5">
            <Calculator className="w-3.5 h-3.5 mr-1.5" /> TCO Signal
          </Button>
          <Button size="sm" onClick={() => setModalConfig({ isOpen: true, truck: null })} className="h-8 rounded-xl text-xs shadow-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Truck
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-xs p-12 flex justify-center"><LoadingSpinner text="Loading trucks..." /></div>
      ) : trucks.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-xs p-12 text-center text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No trucks found. Add your first truck to get started.</p>
        </div>
      ) : viewMode === 'compact' ? (
        /* ULTRA-COMPACT LIST ROW TILES (Height ~72px) */
        <div className="space-y-2.5">
          {trucks.map(truck => {
            const bodyImgs = parseImageList(truck.body_images);
            const hasImages = bodyImgs.length > 0;
            const primaryImage = hasImages ? pb.files.getUrl(truck, bodyImgs[0], { thumb: '100x100' }) : null;
            const assignedDriver = drivers.find(d => d.assigned_truck === truck.id);
            const availableDrivers = drivers.filter(d => !d.assigned_truck);

            return (
              <div 
                key={truck.id} 
                className="group bg-card border border-border/60 hover:border-primary/40 rounded-xl p-2.5 sm:px-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Left: 52x52 Photo Thumbnail + Registration & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Photo Thumbnail */}
                  <div 
                    className="w-12 h-12 rounded-lg bg-muted relative overflow-hidden shrink-0 border border-border/50 cursor-pointer group/img"
                    onClick={() => hasImages && setGalleryConfig({ isOpen: true, truck, activeIndex: 0 })}
                  >
                    {hasImages ? (
                      <img src={primaryImage} alt={truck.truck_number} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <Truck className="w-5 h-5" />
                      </div>
                    )}
                    {bodyImgs.length > 1 && (
                      <span className="absolute top-0.5 right-0.5 bg-black/80 text-white text-[8px] font-bold px-1 rounded font-mono flex items-center gap-0.5 shadow-xs">
                        📸 {bodyImgs.length}
                      </span>
                    )}
                    <span className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-background ${truck.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                  </div>

                  {/* Vehicle Details & Specs Pills */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {truck.truck_number}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground truncate max-w-[140px]">
                        {truck.truck_name || 'Unnamed'}
                      </span>
                      <Badge className={truck.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[9px] px-1.5 py-0'}>
                        {truck.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <Badge variant="outline" className="px-1.5 py-0 rounded text-[10px] font-medium border-border/70">
                        {truck.truck_size}
                      </Badge>
                      <Badge variant="secondary" className="px-1.5 py-0 rounded text-[10px] font-medium">
                        Axle: {truck.truck_axle}
                      </Badge>
                      <Badge variant="outline" className="px-1.5 py-0 rounded text-[10px] font-medium border-border/70">
                        {truck.tyre_count} Tyres
                      </Badge>
                      {truck.payload_capacity && (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          🏋️ {truck.payload_capacity}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 px-1.5 py-0 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        FASTag: ₹{(truck.current_fastag_balance || 0).toLocaleString('en-IN')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Center: Driver Pill */}
                <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/30 shrink-0">
                  <User className="w-3.5 h-3.5 text-primary opacity-70" />
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {assignedDriver ? assignedDriver.name : <span className="italic text-muted-foreground/60 text-[11px]">Unassigned</span>}
                  </span>
                </div>

                {/* Right: Quick Action Buttons & Menu */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-[11px] font-medium rounded-lg border-border/60 hover:bg-muted"
                    onClick={() => navigate(`/tyres/${truck.id}`)}
                    title="Tyres"
                  >
                    <Settings className="w-3 h-3 mr-1 text-primary" /> Tyres
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-[11px] font-medium rounded-lg border-border/60 hover:bg-muted"
                    onClick={() => navigate(`/fleet-maintenance?truckId=${truck.id}`)}
                    title="Maintenance"
                  >
                    <Wrench className="w-3 h-3 mr-1 text-amber-500" /> Maintenance
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-[11px] font-medium rounded-lg border-border/60 hover:bg-muted"
                    onClick={() => setShareConfig({ isOpen: true, truckId: truck.id, employeeId: null, entityName: `Truck ${truck.truck_number}` })}
                    title="Share Documents"
                  >
                    <Share2 className="w-3 h-3 text-blue-500" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 px-2 text-[11px] font-bold rounded-lg text-primary hover:bg-primary/10"
                    onClick={() => setFastagConfig({ isOpen: true, truck })}
                    title="FASTag Recharge"
                  >
                    <Wallet className="w-3 h-3 mr-1" /> FASTag
                  </Button>

                  {/* Dropdown Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-muted">
                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-card border border-border">
                      <DropdownMenuLabel>Vehicle Options</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setModalConfig({ isOpen: true, truck })}>
                        <Edit className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive font-medium" onSelect={() => handleDelete(truck.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Truck
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {assignedDriver ? (
                        <DropdownMenuItem className="text-destructive font-medium" onSelect={() => handleUnlink(assignedDriver)}>
                          Unlink {assignedDriver.name}
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuLabel>Assign Driver</DropdownMenuLabel>
                      {availableDrivers.length === 0 ? (
                        <DropdownMenuItem disabled className="text-muted-foreground italic text-xs">No unassigned drivers</DropdownMenuItem>
                      ) : (
                        availableDrivers.map(d => (
                          <DropdownMenuItem key={d.id} onSelect={() => handleSwap(truck.id, d.id, assignedDriver)}>
                            {d.name}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ULTRA-COMPACT 4-COLUMN MINI TILES */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {trucks.map(truck => {
            const bodyImgs = parseImageList(truck.body_images);
            const hasImages = bodyImgs.length > 0;
            const primaryImage = hasImages ? pb.files.getUrl(truck, bodyImgs[0], { thumb: '200x120' }) : null;
            const assignedDriver = drivers.find(d => d.assigned_truck === truck.id);

            return (
              <div key={truck.id} className="group bg-card border border-border/60 hover:border-primary/40 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-2.5">
                {/* Top Strip: Thumbnail + Reg + Status */}
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-10 h-10 rounded-lg bg-muted relative overflow-hidden shrink-0 border border-border/50 cursor-pointer"
                    onClick={() => hasImages && setGalleryConfig({ isOpen: true, truck, activeIndex: 0 })}
                  >
                    {hasImages ? (
                      <img src={primaryImage} alt={truck.truck_number} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <Truck className="w-4 h-4" />
                      </div>
                    )}
                    {bodyImgs.length > 1 && (
                      <span className="absolute top-0.5 right-0.5 bg-black/80 text-white text-[7.5px] font-bold px-1 rounded font-mono flex items-center gap-0.5 shadow-xs">
                        📸 {bodyImgs.length}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-xs text-foreground truncate">{truck.truck_number}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{truck.truck_name || 'Unnamed'}</p>
                  </div>

                  <Badge className={truck.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 text-[9px] px-1 py-0' : 'bg-zinc-500/10 text-zinc-500 text-[9px] px-1 py-0'}>
                    {truck.status === 'active' ? 'Active' : 'Off'}
                  </Badge>
                </div>

                {/* Specs badges */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <Badge variant="outline" className="px-1.5 py-0 rounded text-[9px] font-medium">Size: {truck.truck_size}</Badge>
                  <Badge variant="secondary" className="px-1.5 py-0 rounded text-[9px] font-medium">Axle: {truck.truck_axle}</Badge>
                  <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 px-1.5 py-0 rounded text-[9px] font-bold text-blue-600">
                    ₹{(truck.current_fastag_balance || 0).toLocaleString('en-IN')}
                  </Badge>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[100px]">
                    👤 {assignedDriver ? assignedDriver.name : 'Unassigned'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-6 h-6 rounded hover:bg-muted text-primary" onClick={() => navigate(`/tyres/${truck.id}`)} title="Tyres">
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 rounded hover:bg-muted text-amber-500" onClick={() => navigate(`/fleet-maintenance?truckId=${truck.id}`)} title="Maintenance">
                      <Wrench className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 rounded hover:bg-muted text-muted-foreground" onClick={() => setModalConfig({ isOpen: true, truck })} title="Edit">
                      <Edit className="w-3 h-3" />
                    </Button>
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

      {/* ── Interactive Multi-Photo Gallery Modal ────────────────────── */}
      {galleryConfig.isOpen && galleryConfig.truck && (
        <Dialog 
          open={galleryConfig.isOpen} 
          onOpenChange={(val) => !val && setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 })}
        >
          <DialogContent className="max-w-4xl w-[95vw] p-0 bg-slate-950/95 border border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl">
            {(() => {
              const galleryImgs = parseImageList(galleryConfig.truck?.body_images);
              const activeIndex = Math.min(Math.max(0, galleryConfig.activeIndex || 0), Math.max(0, galleryImgs.length - 1));
              const activeImg = galleryImgs[activeIndex] || galleryImgs[0];
              const activeImgUrl = activeImg ? pb.files.getUrl(galleryConfig.truck, activeImg) : null;

              return (
                <>
                  {/* Top Bar: Truck Info + Photo Counter Badge + Actions */}
                  <div className="p-4 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-extrabold text-base sm:text-lg text-white tracking-tight">
                            {galleryConfig.truck.truck_name || 'Commercial Truck'}
                          </h3>
                          <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs font-bold px-2">
                            {galleryConfig.truck.truck_number}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {galleryConfig.truck.truck_size || '32 FT'} • {galleryConfig.truck.truck_axle || 'SXL'} • {galleryImgs.length} Total {galleryImgs.length === 1 ? 'Photo' : 'Photos'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Photo Counter Pill */}
                      {galleryImgs.length > 0 && (
                        <Badge variant="outline" className="bg-slate-800/90 text-slate-200 border-slate-700 text-xs px-2.5 py-1 font-mono">
                          📸 {activeIndex + 1} / {galleryImgs.length}
                        </Badge>
                      )}

                      {/* Download Current Image */}
                      {activeImgUrl && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Download high-resolution image"
                          asChild
                        >
                          <a href={activeImgUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}

                      {/* Manage / Add More Photos */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 text-xs rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 flex items-center gap-1.5"
                        onClick={() => {
                          const trk = galleryConfig.truck;
                          setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 });
                          setModalConfig({ isOpen: true, truck: trk });
                        }}
                        title="Upload more photos"
                      >
                        <Camera className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">Manage Photos</span>
                      </Button>

                      {/* Close */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => setGalleryConfig({ isOpen: false, truck: null, activeIndex: 0 })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Main Large Image Stage */}
                  <div className="relative flex-1 flex items-center justify-center min-h-[380px] max-h-[62vh] p-4 bg-black/80 overflow-hidden select-none">
                    {/* Previous Button */}
                    {galleryImgs.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute left-4 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-xl transition-all hover:scale-110 active:scale-95"
                        onClick={() => setGalleryConfig(prev => ({
                          ...prev,
                          activeIndex: (activeIndex - 1 + galleryImgs.length) % galleryImgs.length
                        }))}
                        title="Previous Photo (Left Arrow)"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                    )}

                    {/* Active Image */}
                    {activeImgUrl ? (
                      <img 
                        src={activeImgUrl} 
                        alt={`${galleryConfig.truck.truck_number} Photo ${activeIndex + 1}`} 
                        className="max-w-full max-h-[58vh] object-contain rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 py-16">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
                        <p className="text-sm">No photos uploaded for this truck.</p>
                      </div>
                    )}

                    {/* Next Button */}
                    {galleryImgs.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-4 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-xl transition-all hover:scale-110 active:scale-95"
                        onClick={() => setGalleryConfig(prev => ({
                          ...prev,
                          activeIndex: (activeIndex + 1) % galleryImgs.length
                        }))}
                        title="Next Photo (Right Arrow)"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                  </div>

                  {/* Bottom Thumbnail Strip */}
                  {galleryImgs.length > 1 && (
                    <div className="p-3 px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-2.5 overflow-x-auto">
                      {galleryImgs.map((imgName, idx) => {
                        const thumbUrl = pb.files.getUrl(galleryConfig.truck, imgName, { thumb: '120x90' });
                        const isSelected = activeIndex === idx;
                        return (
                          <button 
                            key={idx}
                            className={`relative w-16 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                              isSelected 
                                ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-md shadow-primary/20 opacity-100' 
                                : 'border-slate-700/60 opacity-50 hover:opacity-100 hover:border-slate-500'
                            }`}
                            onClick={() => setGalleryConfig(prev => ({ ...prev, activeIndex: idx }))}
                            title={`View Photo ${idx + 1}`}
                          >
                            <img 
                              src={thumbUrl} 
                              alt={`Thumb ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono text-white px-1 rounded-tl">
                              #{idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {shareConfig.isOpen && (
        <ShareFolderDialog
          isOpen={shareConfig.isOpen}
          onClose={() => setShareConfig({ isOpen: false, truckId: null, employeeId: null, entityName: '' })}
          truckId={shareConfig.truckId}
          employeeId={shareConfig.employeeId}
          entityName={shareConfig.entityName}
        />
      )}

      {fastagConfig.isOpen && (
        <FASTagRechargeModal
          isOpen={fastagConfig.isOpen}
          onClose={() => setFastagConfig({ isOpen: false, truck: null })}
          truck={fastagConfig.truck}
          onSuccess={fetchTrucks}
        />
      )}
    </div>
  );
}