import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleDashed, Plus, ArrowLeft, RefreshCw, Battery, ShieldAlert, Calendar, Image, FileText, X, Receipt, Download, Eye, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TyreFormModal, { TYRE_SLOTS } from '@/components/TyreFormModal.jsx';
import TyreDiagramView from '@/components/TyreDiagramView.jsx';
import TyreDetailsModal from '@/components/TyreDetailsModal.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';

export default function TyreManagementPage() {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const [allTrucks, setAllTrucks] = useState([]);
  const [truck, setTruck] = useState(null);
  const [tyres, setTyres] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [formModal, setFormModal] = useState({ isOpen: false, tyre: null, initialPosition: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, tyre: null });
  const [previewDoc, setPreviewDoc] = useState(null);

  // Battery state
  const [batteryEditOpen, setBatteryEditOpen] = useState(false);
  const [batteryForm, setBatteryForm] = useState({
    battery_serial_number: '',
    battery_purchase_date: '',
    battery_warranty_details: '',
  });
  const [selectedBatteryFiles, setSelectedBatteryFiles] = useState([]);
  const [existingBatteryFiles, setExistingBatteryFiles] = useState([]);
  const [deletedBatteryFiles, setDeletedBatteryFiles] = useState([]);
  // Battery bill (PDF or image)
  const [batteryBillFile, setBatteryBillFile] = useState(null);
  const [batteryBillPreview, setBatteryBillPreview] = useState(null);
  const [batteryBillIsPdf, setBatteryBillIsPdf] = useState(false);

  // Swap / Rotation state
  const [swapDialog, setSwapDialog] = useState({
    isOpen: false,
    sourcePosition: null,
    targetPosition: null,
    odometerReading: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all trucks for fleet selector dropdown
      const trucksList = await pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }).catch(() => []);
      setAllTrucks(trucksList);

      const targetId = truckId || (trucksList.length > 0 ? trucksList[0].id : null);
      if (!targetId) {
        setTruck(null);
        setTyres([]);
        setRotations([]);
        return;
      }

      // If no truckId in URL but trucks exist, update URL seamlessly
      if (!truckId && targetId) {
        navigate(`/tyres/${targetId}`, { replace: true });
        return;
      }

      const truckRecord = trucksList.find(t => t.id === targetId) || await pb.collection('trucks').getOne(targetId, { $autoCancel: false });
      setTruck(truckRecord);

      // Fetch Completed trip logs for this truck to calculate tyre mileage since installation
      const tripLogs = await pb.collection('trip_logs').getFullList({
        filter: `truck_number = "${truckRecord.truck_number}" && trip_status = "Completed"`,
        $autoCancel: false
      }).catch(() => []);

      const tyreRecords = await pb.collection('tyres').getFullList({
        filter: `truck_id="${targetId}"`,
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      // Recalculate each tyre's running mileage dynamically based on Completed trips from installation date
      const enrichedTyres = tyreRecords.map(tyre => {
        let kmsSinceInstall = 0;
        if (tyre.purchase_date) {
          const installDate = new Date(tyre.purchase_date.split(' ')[0] || tyre.purchase_date);
          kmsSinceInstall = tripLogs
            .filter(t => {
              if (!t.date || !t.kms) return false;
              const tripDate = new Date(t.date.split(' ')[0] || t.date);
              return tripDate >= installDate;
            })
            .reduce((sum, t) => sum + (Number(t.kms) || 0), 0);
        }
        return {
          ...tyre,
          base_lifecycle_kms: tyre.current_lifecycle_kms || 0,
          current_lifecycle_kms: (tyre.current_lifecycle_kms || 0) + kmsSinceInstall
        };
      });
      setTyres(enrichedTyres);

      // Fetch tyre rotation history
      const rotationRecords = await pb.collection('tyre_rotations').getFullList({
        filter: `truck_id="${targetId}"`,
        sort: '-swap_date',
        expand: 'tyre1_id,tyre2_id',
        $autoCancel: false
      }).catch(() => []);
      setRotations(rotationRecords);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load truck and tyre data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [truckId]);

  // Load battery fields on edit open
  useEffect(() => {
    if (truck && batteryEditOpen) {
      setBatteryForm({
        battery_serial_number: truck.battery_serial_number || '',
        battery_purchase_date: truck.battery_purchase_date ? truck.battery_purchase_date.split('T')[0] : '',
        battery_warranty_details: truck.battery_warranty_details || '',
      });
      const batteryImages = truck.battery_image 
        ? (Array.isArray(truck.battery_image) ? truck.battery_image : [truck.battery_image])
        : [];
      setExistingBatteryFiles(batteryImages);
      setSelectedBatteryFiles([]);
      setDeletedBatteryFiles([]);
      // Load existing bill
      if (truck.battery_bill) {
        const url = pb.files.getUrl(truck, truck.battery_bill);
        setBatteryBillPreview(url);
        setBatteryBillIsPdf(truck.battery_bill.toLowerCase().endsWith('.pdf'));
      } else {
        setBatteryBillPreview(null);
        setBatteryBillIsPdf(false);
      }
      setBatteryBillFile(null);
    }
  }, [batteryEditOpen, truck]);

  const handleSlotClick = (posId) => {
    const tyre = tyres.find(t => t.tyre_position === posId);
    if (tyre) {
      setDetailsModal({ isOpen: true, tyre });
    } else {
      setFormModal({ isOpen: true, tyre: null, initialPosition: posId });
    }
  };

  const handleEditTyre = (tyre) => {
    setFormModal({ isOpen: true, tyre, initialPosition: tyre.tyre_position });
  };

  const handleDeleteTyre = async (id) => {
    try {
      await pb.collection('tyres').delete(id, { $autoCancel: false });
      toast.success('Tyre deleted successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete tyre');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, positionId) => {
    e.dataTransfer.setData('text/plain', positionId);
  };

  const handleDrop = (e, targetPositionId) => {
    e.preventDefault();
    const sourcePositionId = e.dataTransfer.getData('text/plain');
    if (!sourcePositionId || sourcePositionId === targetPositionId) return;

    // Check if source slot has a tyre
    const hasTyre = tyres.some(t => t.tyre_position === sourcePositionId);
    if (!hasTyre) return;

    setSwapDialog({
      isOpen: true,
      sourcePosition: sourcePositionId,
      targetPosition: targetPositionId,
      odometerReading: ''
    });
  };

  const handleSwapConfirm = async (e) => {
    e.preventDefault();
    if (!swapDialog.odometerReading) {
      toast.error('Please enter odometer reading');
      return;
    }
    setLoading(true);
    try {
      const { sourcePosition, targetPosition, odometerReading } = swapDialog;
      const tyreA = tyres.find(t => t.tyre_position === sourcePosition);
      const tyreB = tyres.find(t => t.tyre_position === targetPosition);

      if (!tyreA) {
        toast.error('Source tyre not found');
        return;
      }

      // Step 1: Update tyreA to target position
      const slotDefTarget = TYRE_SLOTS.find(s => s.id === targetPosition);
      await pb.collection('tyres').update(tyreA.id, {
        tyre_position: targetPosition,
        axle_position: slotDefTarget ? slotDefTarget.axle : 'single_axle'
      }, { $autoCancel: false });

      // Step 2: Update tyreB to source position (if target slot was not empty)
      if (tyreB) {
        const slotDefSource = TYRE_SLOTS.find(s => s.id === sourcePosition);
        await pb.collection('tyres').update(tyreB.id, {
          tyre_position: sourcePosition,
          axle_position: slotDefSource ? slotDefSource.axle : 'single_axle'
        }, { $autoCancel: false });
      }

      // Step 3: Record rotation in history
      await pb.collection('tyre_rotations').create({
        truck_id: truckId,
        tyre1_id: tyreA.id,
        tyre2_id: tyreB ? tyreB.id : null,
        from_position1: sourcePosition,
        to_position1: targetPosition,
        from_position2: tyreB ? targetPosition : '',
        to_position2: tyreB ? sourcePosition : '',
        swap_odometer_reading: Number(odometerReading),
        swap_date: new Date().toISOString()
      }, { $autoCancel: false });

      toast.success('Tyres swapped successfully');
      setSwapDialog({ isOpen: false, sourcePosition: null, targetPosition: null, odometerReading: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to swap tyres: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatterySave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('battery_serial_number', batteryForm.battery_serial_number);
      data.append('battery_purchase_date', batteryForm.battery_purchase_date);
      data.append('battery_warranty_details', batteryForm.battery_warranty_details);

      // Append new battery files
      selectedBatteryFiles.forEach(file => {
        data.append('battery_image', file);
      });

      // Handle deleted battery files
      if (deletedBatteryFiles.length > 0) {
        deletedBatteryFiles.forEach(filename => {
          data.append(`battery_image.${filename}`, '');
        });
      }

      // Bill file
      if (batteryBillFile) {
        data.append('battery_bill', batteryBillFile);
      } else if (!batteryBillPreview && truck.battery_bill) {
        data.append('battery_bill', '');
      }

      await pb.collection('trucks').update(truckId, data, { $autoCancel: false });
      toast.success('Battery details updated successfully');
      setBatteryEditOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update battery details');
    } finally {
      setLoading(false);
    }
  };

  const handleBatteryBillChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBatteryBillFile(file);
      setBatteryBillIsPdf(file.type === 'application/pdf');
      if (file.type !== 'application/pdf') {
        setBatteryBillPreview(URL.createObjectURL(file));
      } else {
        setBatteryBillPreview('pdf_selected'); // sentinel so we know a PDF is queued
      }
    }
  };

  const handleBatteryImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedBatteryFiles(prev => [...prev, ...files]);
    }
  };

  const TyreSlotCard = ({ slot }) => {
    const tyre = tyres.find(t => t.tyre_position === slot.id);
    const tyreImage = tyre?.tyre_image 
      ? (Array.isArray(tyre.tyre_image) ? tyre.tyre_image[0] : tyre.tyre_image) 
      : null;
    const imageUrl = tyreImage ? pb.files.getUrl(tyre, tyreImage, { thumb: '300x200' }) : null;

    // Calculate wear bar metrics
    const lifecycleKms = tyre?.current_lifecycle_kms || 0;
    const TYRE_LIFECYCLE_THRESHOLD = 80000;
    const usagePercentage = Math.min((lifecycleKms / TYRE_LIFECYCLE_THRESHOLD) * 100, 100);

    // Dynamic Alert Badge Logic
    let statusText = tyre?.status || 'active';
    let badgeStyle = "capitalize shadow-sm";
    
    if (tyre?.status === 'active') {
      if (lifecycleKms >= TYRE_LIFECYCLE_THRESHOLD) {
        statusText = "Replacement Recommended";
        badgeStyle = "capitalize shadow-sm text-destructive border-destructive/30 bg-destructive/5 text-[10px] py-0.5 leading-none";
      } else if (lifecycleKms >= 60000) {
        statusText = "Rotation Due";
        badgeStyle = "capitalize shadow-sm text-yellow-600 dark:text-yellow-500 border-yellow-500/30 bg-yellow-500/5 text-[10px] py-0.5 leading-none";
      } else {
        badgeStyle = "capitalize shadow-sm text-[hsl(var(--success))] border-[hsl(var(--success))/30] bg-[hsl(var(--success))/5] text-[10px] py-0.5 leading-none";
      }
    } else if (tyre?.status === 'damaged') {
      badgeStyle = "capitalize shadow-sm text-destructive border-destructive/30 bg-destructive/5 text-[10px] py-0.5 leading-none";
    } else if (tyre?.status === 'worn') {
      badgeStyle = "capitalize shadow-sm text-warning border-warning/30 bg-warning/5 text-[10px] py-0.5 leading-none";
    }

    return (
      <Card 
        draggable={!!tyre}
        onDragStart={(e) => handleDragStart(e, slot.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, slot.id)}
        className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full rounded-2xl bg-card cursor-grab active:cursor-grabbing"
      >
        {tyre ? (
          <>
            <div 
              className="h-40 w-full bg-secondary/50 relative cursor-pointer group"
              onClick={() => handleSlotClick(slot.id)}
            >
              {imageUrl ? (
                <img src={imageUrl} alt={tyre.tyre_brand} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
                  <span className="text-muted-foreground text-sm font-medium">No Image Provided</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">View Details</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{slot.label}</p>
                  <h4 className="font-semibold text-lg leading-tight text-foreground">{tyre.tyre_brand}</h4>
                  <p className="text-sm text-muted-foreground font-medium">{tyre.model_no}</p>
                </div>
                <Badge variant="outline" className={badgeStyle}>
                  {statusText}
                </Badge>
              </div>

              {/* Visual Wear Bar */}
              <div className="my-3 p-3 bg-secondary/20 rounded-xl border border-border/50">
                <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Wear Usage</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${lifecycleKms >= TYRE_LIFECYCLE_THRESHOLD ? 'bg-destructive' : lifecycleKms >= 60000 ? 'bg-yellow-500' : 'bg-primary'}`} 
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[9px] text-muted-foreground font-medium">
                  <span>Run: {lifecycleKms.toLocaleString()} KM</span>
                  <span>Limit: 80K KM</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{tyre.serial_number}</span>
                <span className="font-bold text-foreground text-lg tracking-tight">{tyre.tyre_depth_mm}<span className="text-xs text-muted-foreground font-normal ml-0.5">mm</span></span>
              </div>
            </div>
          </>
        ) : (
          <div 
            className="h-full min-h-[260px] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/30 transition-colors group"
            onClick={() => handleSlotClick(slot.id)}
          >
            <div className="w-14 h-14 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{slot.label}</p>
            <p className="text-lg font-semibold text-foreground mb-4">Empty Position</p>
            <Button variant="outline" size="sm" className="rounded-xl pointer-events-none">Add Tyre</Button>
          </div>
        )}
      </Card>
    );
  };

  if (loading && !truck) {
    return <div className="p-12 flex justify-center"><LoadingSpinner text="Loading..." /></div>;
  }

  const replaceWarningCount = tyres.filter(t => (t.current_lifecycle_kms || 0) >= 80000 || t.status === 'damaged').length;
  const rotationDueCount = tyres.filter(t => (t.current_lifecycle_kms || 0) >= 60000 && (t.current_lifecycle_kms || 0) < 80000).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/truck-manager')} className="rounded-xl h-9 w-9 text-muted-foreground hover:bg-secondary/50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-heading font-bold flex items-center gap-2.5 tracking-tight">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CircleDashed className="w-5 h-5 text-primary" />
              </div>
              Tyre & Battery Hub
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
            <Badge variant="secondary" className="px-2.5 py-0.5 font-bold text-foreground bg-background border">{truck?.truck_number || 'Select Vehicle'}</Badge>
            {truck?.truck_name && <span className="font-semibold text-foreground">{truck.truck_name}</span>}
            <span className="opacity-40">•</span>
            <span className="text-emerald-500 font-bold">{tyres.length}/7 Positions Active</span>
            {replaceWarningCount > 0 && (
              <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px]">
                <ShieldAlert className="w-3 h-3 mr-1" /> {replaceWarningCount} Replace Warning
              </Badge>
            )}
          </div>
        </div>

        {/* Vehicle Selector Dropdown & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {allTrucks.length > 0 && (
            <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-2xl border border-border/50 flex-1 md:flex-none">
              <Truck className="w-4 h-4 text-primary ml-2 shrink-0" />
              <Select
                value={truck?.id || ''}
                onValueChange={(selectedId) => navigate(`/tyres/${selectedId}`)}
              >
                <SelectTrigger className="w-full md:w-56 bg-background rounded-xl font-bold h-9 border-border/60 text-xs">
                  <SelectValue placeholder="Select Vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {allTrucks.map(t => (
                    <SelectItem key={t.id} value={t.id} className="font-medium text-xs">
                      <span className="font-mono font-bold text-primary mr-2">{t.truck_number}</span>
                      {t.truck_name ? `(${t.truck_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setBatteryEditOpen(true)}
            className="rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 h-9"
          >
            <Battery className="w-3.5 h-3.5" /> Edit Battery
          </Button>

          <Button
            size="sm"
            onClick={() => setFormModal({ isOpen: true, tyre: null, initialPosition: null })}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 h-9"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tyre
          </Button>
        </div>
      </div>

      {/* Main Tabbed Interface for Zero-Scroll Navigation */}
      <Tabs defaultValue="visual" className="w-full space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto bg-card p-1.5 rounded-2xl border border-border/60 gap-1 scrollbar-none">
          <TabsTrigger value="visual" className="rounded-xl text-xs font-bold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CircleDashed className="w-3.5 h-3.5" /> Visual Axle Diagram
          </TabsTrigger>
          <TabsTrigger value="positions" className="rounded-xl text-xs font-bold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Truck className="w-3.5 h-3.5" /> Position Details ({tyres.length}/7)
          </TabsTrigger>
          <TabsTrigger value="battery" className="rounded-xl text-xs font-bold gap-2 py-2 px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Battery className="w-3.5 h-3.5" /> Battery Details {truck?.battery_serial_number ? `(${truck.battery_serial_number})` : ''}
          </TabsTrigger>
          <TabsTrigger value="rotations" className="rounded-xl text-xs font-bold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw className="w-3.5 h-3.5" /> Rotation History ({rotations.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: VISUAL DIAGRAM */}
        <TabsContent value="visual" className="space-y-6 animate-in fade-in duration-300">
          <Card className="p-6 rounded-3xl border-border/60 bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h2 className="text-lg font-heading font-bold tracking-tight">Interactive Axle Layout</h2>
                <p className="text-xs text-muted-foreground">Click any node to view/add details, or drag & drop nodes to swap tyre positions.</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono bg-background">
                {truck?.truck_number}
              </Badge>
            </div>
            <TyreDiagramView 
              tyres={tyres} 
              onSlotClick={handleSlotClick} 
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          </Card>
        </TabsContent>

        {/* TAB 2: POSITION DETAILS (7 TYRE CARDS GRID) */}
        <TabsContent value="positions" className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-heading font-bold tracking-tight">All 7 Tyre Positions</h2>
            <p className="text-xs text-muted-foreground">Detailed wear bars, tread depth, and serial numbers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TYRE_SLOTS.map(slot => (
              <TyreSlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: BATTERY MANAGEMENT */}
        <TabsContent value="battery" className="animate-in fade-in duration-300">
          <Card className="p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                  <Battery className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Battery Specification & Bill</h3>
                  <p className="text-xs text-muted-foreground">Vehicle: {truck?.truck_number || 'N/A'}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setBatteryEditOpen(true)} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold">
                Edit Details
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Serial Number</span>
                    <span className="font-mono text-sm font-bold text-foreground truncate block">{truck?.battery_serial_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Purchase Date</span>
                    <span className="text-sm font-bold text-foreground block">
                      {truck?.battery_purchase_date ? new Date(truck.battery_purchase_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">Warranty & Terms</span>
                  <p className="text-xs text-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/50 min-h-[60px] whitespace-pre-line leading-relaxed font-medium">
                    {truck?.battery_warranty_details || 'No warranty details provided.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Battery Snapshots</span>
                  {truck?.battery_image && (Array.isArray(truck.battery_image) ? truck.battery_image.length > 0 : truck.battery_image) ? (
                    <div className="grid grid-cols-2 gap-2">
                      {(Array.isArray(truck.battery_image) ? truck.battery_image : [truck.battery_image]).map((img, idx) => (
                        <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-border bg-muted/10 relative cursor-pointer group" onClick={() => {
                          setPreviewDoc({ 
                            id: truck.id,
                            collectionId: truck.collectionId || '',
                            collectionName: 'trucks',
                            created: truck.created || new Date().toISOString(),
                            files: Array.isArray(truck.battery_image) ? truck.battery_image : [truck.battery_image], 
                            file: img, 
                            document_type: 'Battery Snapshot', 
                            document_number: truck.battery_serial_number || 'N/A' 
                          });
                        }}>
                          <img src={pb.files.getUrl(truck, img)} alt={`Battery Snapshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-2xl border border-dashed border-border/60 bg-muted/10 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No photos uploaded</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Purchase Invoice / Bill</span>
                  {truck?.battery_bill ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-2xl">
                      <div className="p-2 bg-amber-500/10 rounded-xl shrink-0 text-amber-500">
                        {truck.battery_bill.toLowerCase().endsWith('.pdf') ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Receipt className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{truck.battery_bill}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {truck.battery_bill.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Image'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <a
                          href={pb.files.getUrl(truck, truck.battery_bill)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title="View / Download"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3.5 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                      <Receipt className="w-4 h-4 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">No bill uploaded yet.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: ROTATION & SWAP HISTORY */}
        <TabsContent value="rotations" className="animate-in fade-in duration-300">
          <Card className="p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Tyre Rotation & Swap Logs</h3>
                  <p className="text-xs text-muted-foreground">Historical odometer readings and position changes</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {rotations.length} Logs Saved
              </Badge>
            </div>

            <div className="space-y-3">
              {rotations.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto opacity-30 animate-spin-slow" />
                  <p className="text-sm font-semibold">No rotation history logged yet.</p>
                  <p className="text-xs">Drag and drop tyres on the Visual Axle Diagram to log a swap!</p>
                </div>
              ) : (
                rotations.map((log) => {
                  const tyreA = log.expand?.tyre1_id;
                  const tyreB = log.expand?.tyre2_id;
                  const slotA = TYRE_SLOTS.find(s => s.id === log.to_position1);
                  const slotB = TYRE_SLOTS.find(s => s.id === log.to_position2);

                  return (
                    <div key={log.id} className="p-4 bg-muted/20 border border-border/50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground font-semibold mb-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{new Date(log.swap_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground leading-relaxed text-xs">
                          <strong>{tyreA?.tyre_brand || 'Tyre'}</strong> moved to <strong>{slotA?.label || log.to_position1}</strong>.
                          {tyreB && (
                            <span> Swapped with <strong>{tyreB?.tyre_brand || 'Tyre'}</strong> at <strong>{slotB?.label || log.to_position2}</strong>.</span>
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs bg-background shrink-0 font-bold text-primary">
                        {log.swap_odometer_reading} KM
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Battery Edit Dialog */}
      <Dialog open={batteryEditOpen} onOpenChange={(val) => !val && !loading && setBatteryEditOpen(false)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Edit Battery Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBatterySave} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Battery Serial Number</Label>
              <Input 
                className="rounded-xl" 
                value={batteryForm.battery_serial_number} 
                onChange={e => setBatteryForm({...batteryForm, battery_serial_number: e.target.value})} 
                placeholder="Enter Serial Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input 
                type="date" 
                className="rounded-xl" 
                value={batteryForm.battery_purchase_date} 
                onChange={e => setBatteryForm({...batteryForm, battery_purchase_date: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Warranty Details</Label>
              <Input 
                className="rounded-xl" 
                value={batteryForm.battery_warranty_details} 
                onChange={e => setBatteryForm({...batteryForm, battery_warranty_details: e.target.value})} 
                placeholder="e.g. 24 Months replacement warranty"
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Battery Snapshots</Label>
              <div className="border border-dashed border-border/50 bg-muted/10 rounded-2xl p-4 text-center relative cursor-pointer hover:bg-muted/20 transition-all flex flex-col items-center justify-center">
                <div className="py-2">
                  <Image className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground font-medium">Click to select snapshots</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleBatteryImageChange} 
                />
              </div>

              {/* Existing snapshots list */}
              {existingBatteryFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground">Existing Snapshots:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {existingBatteryFiles.map((file, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-card">
                        <img src={pb.files.getUrl(truck, file)} alt="Battery Snapshot" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/90"
                          onClick={() => {
                            setExistingBatteryFiles(prev => prev.filter(f => f !== file));
                            setDeletedBatteryFiles(prev => [...prev, file]);
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New snapshots list */}
              {selectedBatteryFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground">New Snapshots:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBatteryFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-video rounded-xl overflow-hidden border border-primary/30 bg-primary/5">
                        <img src={URL.createObjectURL(file)} alt="Battery Snapshot Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/90"
                          onClick={() => {
                            setSelectedBatteryFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Battery Bill Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Purchase Bill / Invoice
                <span className="text-[10px] font-normal text-muted-foreground ml-1">(PDF or Image, max 10 MB)</span>
              </Label>
              <div className="border border-border/50 bg-muted/10 rounded-2xl p-4 relative cursor-pointer hover:bg-muted/20 transition-all">
                {batteryBillPreview && batteryBillPreview !== 'pdf_selected' ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={batteryBillPreview} alt="Bill Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        setBatteryBillFile(null);
                        setBatteryBillPreview(null);
                        setBatteryBillIsPdf(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : batteryBillPreview === 'pdf_selected' ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-primary/8 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{batteryBillFile?.name || 'PDF selected'}</span>
                    </div>
                    <button
                      type="button"
                      className="text-destructive hover:bg-destructive/10 rounded-full p-1 shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setBatteryBillFile(null);
                        setBatteryBillPreview(null);
                        setBatteryBillIsPdf(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <Receipt className="w-8 h-8 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground text-center">
                      Click to upload bill<br />
                      <span className="text-[10px]">JPG, PNG, WebP or PDF</span>
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleBatteryBillChange}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setBatteryEditOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={loading} className="rounded-xl shadow-sm">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Odometer Swap Dialog */}
      <Dialog open={swapDialog.isOpen} onOpenChange={(val) => !val && !loading && setSwapDialog({ ...swapDialog, isOpen: false })}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" /> Swap Tyre Position
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSwapConfirm} className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-xs text-foreground space-y-1">
              <p><strong>Source Position:</strong> {TYRE_SLOTS.find(s => s.id === swapDialog.sourcePosition)?.label}</p>
              <p><strong>Target Position:</strong> {TYRE_SLOTS.find(s => s.id === swapDialog.targetPosition)?.label}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Current Odometer Reading (KM) <span className="text-destructive">*</span></Label>
              <Input 
                type="number" 
                required 
                min="0"
                className="rounded-xl" 
                value={swapDialog.odometerReading} 
                onChange={e => setSwapDialog({...swapDialog, odometerReading: e.target.value})} 
                placeholder="Enter current KM reading"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setSwapDialog({ ...swapDialog, isOpen: false })} disabled={loading} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={loading} className="rounded-xl shadow-sm">Confirm Swap</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TyreFormModal 
        isOpen={formModal.isOpen} 
        onClose={() => setFormModal({ isOpen: false, tyre: null, initialPosition: null })} 
        tyre={formModal.tyre}
        truck={truck}
        initialPosition={formModal.initialPosition}
        onSuccess={fetchData}
      />

      <TyreDetailsModal 
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, tyre: null })}
        tyre={detailsModal.tyre}
        onEdit={handleEditTyre}
        onDelete={handleDeleteTyre}
        onSuccess={fetchData}
      />

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        collectionName="trucks"
      />
    </div>
  );
}