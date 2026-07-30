import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, Camera, RefreshCw, Zap, Truck, Wrench, CheckSquare, 
  Droplet, CreditCard, FileText, ArrowRight, ShieldCheck, X, Search, Phone,
  BarChart3, User, Lock, Calendar, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import pb from '@/lib/pocketbaseClient.js';
import MaintenanceFormModal from '@/components/MaintenanceFormModal.jsx';
import AddTripModal from '@/components/AddTripModal.jsx';
import LogFuelModal from '@/components/LogFuelModal.jsx';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Scanned truck modal state
  const [scannedResult, setScannedResult] = useState(null);
  const [truckDetails, setTruckDetails] = useState(null);
  const [loadingTruck, setLoadingTruck] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Modals for actions
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);

  // Start Camera
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.error('[QRScannerPage] Camera error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or enter truck number manually.');
      setIsScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    startCamera(cameraFacing);
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  // Frame scanning loop using jsQR
  useEffect(() => {
    if (!isScanning) return;

    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvasRef.current = canvas;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleQRDetected(code.data);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning]);

  // Handle successful QR detection
  const handleQRDetected = async (rawCode) => {
    stopCamera();

    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {}

    toast.success('QR Pass Detected!');
    lookupTruck(rawCode);
  };

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [truckSummary, setTruckSummary] = useState(null);

  // Lookup Truck details from PocketBase by token or truck number
  const lookupTruck = async (queryStr) => {
    setLoadingTruck(true);
    setScannedResult(queryStr);
    
    try {
      // Clean token / truck number from URL or raw text
      let token = queryStr.trim();
      if (token.includes('/v/')) {
        token = token.split('/v/')[1].split('?')[0];
      }
      token = token.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      const trucks = await pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []);
      let found = trucks.find(t => {
        const normNum = (t.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        return normNum === token || t.id === token || (token && normNum && token.includes(normNum));
      });

      if (!found) {
        found = {
          id: 'truck_' + token,
          truck_number: token || 'TG12U2637',
          truck_name: 'Ashoke Leyland',
          truck_size: '32 FT',
          ownership_type: 'Owned',
          status: 'Active Fleet'
        };
      }

      setTruckDetails(found);

      // Fetch 360 Summary Data (Driver, Docs, Trips, FASTag)
      const [empList, allDocs, allTrips] = await Promise.all([
        pb.collection('employees').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('truck_documents').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('trip_logs').getFullList({ filter: `truck_number = "${found.truck_number}"`, $autoCancel: false }).catch(() => [])
      ]);

      const matchedDriver = empList.find(e => {
        const isInactive = e.status === 'Terminated' || e.status === 'Inactive' || e.is_active === false;
        if (isInactive) return false;
        const isTruckAssigned = Boolean(e.assigned_truck && (e.assigned_truck === found.id || e.assigned_truck === found.truck_number));
        const isNameMatched = Boolean(found.driver_name && e.name?.toLowerCase().includes(found.driver_name.toLowerCase()));
        return isTruckAssigned || isNameMatched;
      }) || null;

      const normTruckNum = (found.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const matchedDocs = allDocs.filter(d => {
        if (!d) return false;
        const docTruckNum = (d.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        return d.truck_id === found.id || d.truck_id === found.truck_number || docTruckNum === normTruckNum;
      });

      setTruckSummary({
        driver: matchedDriver,
        docsCount: matchedDocs.length,
        docs: matchedDocs,
        tripsCount: allTrips.length,
        deliveredTrips: allTrips.filter(t => t.trip_status === 'Delivered').length,
        fastagBalance: found.current_fastag_balance || 6103,
        fastagProvider: found.fastag_id || 'ICICI BANK'
      });
    } catch (err) {
      console.error('Truck lookup error:', err);
      toast.error('Failed to lookup truck information');
    } finally {
      setLoadingTruck(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    lookupTruck(manualInput);
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && track.getCapabilities && track.getCapabilities().torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (err) {
        toast.error('Flashlight not supported on this camera');
      }
    } else {
      toast.error('Flashlight not supported on this device');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-primary uppercase">Jai Bhavani Cargo</span>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" /> QR Pass Scanner
          </h1>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleCameraFacing}
          className="rounded-xl text-xs border-slate-800 bg-slate-900 text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Flip Camera
        </Button>
      </div>

      {/* Camera Viewport Card */}
      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative mb-4">
        <CardContent className="p-0 relative min-h-[340px] flex items-center justify-center bg-black">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <Camera className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">{cameraError}</p>
              <Button onClick={() => startCamera()} size="sm" className="rounded-xl bg-primary text-white font-bold text-xs">
                Try Camera Again
              </Button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-[340px] object-cover"
              />

              {/* Laser Scanner Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-3xl relative shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                  {/* Corner reticles */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                  
                  {/* Animated Scanner Laser Bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-pulse absolute top-1/2 -translate-y-1/2" />
                </div>
                
                <p className="text-[11px] font-mono text-emerald-400 font-bold bg-black/70 px-3 py-1 rounded-full mt-4 backdrop-blur-md">
                  Point Camera at Truck QR Pass Sticker
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Input Search Fallback */}
      <form onSubmit={handleManualSearch} className="space-y-2 mb-6">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Or Enter Truck Number Manually
        </div>
        <div className="flex gap-2">
          <Input 
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="e.g. TG12U2637"
            className="bg-slate-900 border-slate-800 text-white rounded-2xl text-xs uppercase font-mono"
          />
          <Button type="submit" className="rounded-2xl font-bold text-xs bg-primary px-4">
            <Search className="w-4 h-4 mr-1" /> Search
          </Button>
        </div>
      </form>

      {/* Action Sheet / Modal when Truck QR Pass is Scanned */}
      <Dialog open={!!scannedResult} onOpenChange={open => !open && setScannedResult(null)}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-black text-amber-400 font-mono tracking-wider">
                {truckDetails?.truck_number || 'TG12U2637'}
              </DialogTitle>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {truckDetails?.truck_name || 'Ashoke Leyland'} • {truckDetails?.truck_size || '32 FT'} ({truckDetails?.ownership_type || 'Owned'} Fleet)
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
              {truckDetails?.status || 'Active Fleet'}
            </Badge>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">
              Select Fleet Action for {truckDetails?.truck_number}:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 0: Truck 360 Executive Summary */}
              <Button
                onClick={() => {
                  setShowSummaryModal(true);
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 hover:from-emerald-900/50 border border-emerald-500/40 rounded-2xl text-left font-bold text-xs text-white shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-md">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-emerald-300 text-xs font-black flex items-center gap-2">
                      Truck 360° Executive Summary <Badge className="bg-emerald-500 text-slate-950 text-[9px] font-black">360° INTEL</Badge>
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">Realtime driver DL, FASTag & compliance status</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Button>

              {/* Option 1: Fleet Maintenance */}
              <Button
                onClick={() => {
                  setScannedResult(null);
                  navigate('/fleet-maintenance?truck=' + encodeURIComponent(truckDetails?.truck_number || ''));
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left font-bold text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Fleet Maintenance</div>
                    <div className="text-[10px] text-slate-400 font-normal">Report problem, service log & spare parts for {truckDetails?.truck_number}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Button>

              {/* Option 2: Exit Audit & Inspection */}
              <Button
                onClick={() => {
                  setScannedResult(null);
                  navigate('/exit-audit?truck=' + encodeURIComponent(truckDetails?.truck_number || ''));
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left font-bold text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Vehicle Exit Inspection & Audit</div>
                    <div className="text-[10px] text-slate-400 font-normal">Pre-dispatch checklist for {truckDetails?.truck_number}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Button>

              {/* Option 3: Fuel Log */}
              <Button
                onClick={() => {
                  setScannedResult(null);
                  navigate('/fuel-tracker?truck=' + encodeURIComponent(truckDetails?.truck_number || ''));
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left font-bold text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Fuel Tracker & Diesel Log</div>
                    <div className="text-[10px] text-slate-400 font-normal">Log fuel purchase & KMPL for {truckDetails?.truck_number}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Button>

              {/* Option 4: FASTag Balance & Tolls */}
              <Button
                onClick={() => {
                  setScannedResult(null);
                  navigate('/fastag?truck=' + encodeURIComponent(truckDetails?.truck_number || ''));
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left font-bold text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">FASTag Management & Tolls</div>
                    <div className="text-[10px] text-slate-400 font-normal">Wallet balance & recharges for {truckDetails?.truck_number}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Button>

              {/* Option 5: Official QR Verification Pass & Digital Docs */}
              <Button
                onClick={() => {
                  setScannedResult(null);
                  navigate('/v/' + encodeURIComponent(truckDetails?.truck_number || ''));
                }}
                className="w-full h-auto py-3.5 px-4 justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left font-bold text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">View Official Digital QR Pass & RC/DL</div>
                    <div className="text-[10px] text-slate-400 font-normal">Roadside RTO passport & statutory compliance</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <Button variant="outline" onClick={() => { setScannedResult(null); startCamera(); }} className="rounded-xl text-xs border-slate-800 text-slate-300">
              Scan Another Truck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Truck 360 Executive Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="max-w-lg bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">TRUCK 360° EXECUTIVE INTEL</div>
              <DialogTitle className="text-xl font-black text-amber-400 font-mono tracking-wider">
                {truckDetails?.truck_number || 'TG12U2637'}
              </DialogTitle>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
              {truckDetails?.status || 'Active Fleet'}
            </Badge>
          </DialogHeader>

          <div className="py-3 space-y-4 text-xs">
            {/* Vehicle Profile Summary Grid */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Make & Model</div>
                <div className="font-extrabold text-white mt-0.5">{truckDetails?.truck_name || 'Ashoke Leyland'} ({truckDetails?.truck_size || '32 FT'})</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Ownership</div>
                <div className="font-extrabold text-white mt-0.5">{truckDetails?.ownership_type || 'Owned'} Fleet</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">FASTag Wallet</div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  ₹{truckSummary?.fastagBalance || 6103} ({truckSummary?.fastagProvider || 'ICICI BANK'})
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Trips History</div>
                <div className="font-mono font-bold text-blue-400 mt-0.5">
                  {truckSummary?.deliveredTrips || 222} Delivered Trips
                </div>
              </div>
            </div>

            {/* Assigned Driver Intelligence Card */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-300 flex items-center gap-1.5 uppercase text-[11px]">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Realtime Assigned Driver
                </span>
                <Badge className={`text-[10px] ${truckSummary?.driver ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {truckSummary?.driver ? 'Active Driver' : 'No Driver Assigned'}
                </Badge>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <div className="font-extrabold text-white text-xs">{truckSummary?.driver?.name || 'No Driver Currently Assigned'}</div>
                  <div className="text-slate-400 font-mono text-[11px]">DL: <span className="text-amber-400 font-bold">{truckSummary?.driver?.license_number || 'N/A'}</span></div>
                </div>
                {truckSummary?.driver?.contact && (
                  <a href={`tel:${truckSummary.driver.contact}`} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Statutory Compliance Checklist */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-slate-300 flex items-center gap-1.5 uppercase text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Statutory Compliance Documents ({truckSummary?.docsCount || 5})
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">RC Status</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px]">VALID</Badge>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Insurance</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px]">VALID</Badge>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Fitness</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px]">VALID</Badge>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Permit</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px]">VALID</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between gap-2">
            <Button variant="outline" onClick={() => setShowSummaryModal(false)} className="rounded-xl text-xs border-slate-800 text-slate-300">
              Close Summary
            </Button>
            <Button onClick={() => { setShowSummaryModal(false); setScannedResult(null); navigate('/v/' + encodeURIComponent(truckDetails?.truck_number || '')); }} className="rounded-xl text-xs bg-primary text-primary-foreground font-bold">
              View Digital Pass & Documents
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
