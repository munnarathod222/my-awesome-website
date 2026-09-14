import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, CheckCircle, AlertTriangle, PenTool, Trash2, MapPin, Eye, FileText } from 'lucide-react';
import { LorryReceipt, PodRecord, PodAttachment, TripLog } from '../../types';
import { dbtabeses } from '../../db/store';
import { documentSequenceService } from '../../services/documentSequenceService';
import { auditLogService } from '../../services/auditLogService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lr?: LorryReceipt | null;
  trip?: TripLog | null;
  onSuccess: (pod: PodRecord) => void;
}

export const DriverPodCaptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lr,
  trip,
  onSuccess
}) => {
  const company = dbtabeses.getCompanySettings();

  // Selected or Derived LR / Trip
  const [selectedLr, setSelectedLr] = useState<LorryReceipt | null>(lr || null);
  const [podNumber, setPodNumber] = useState('');

  // Delivery Status
  const [deliveryStatus, setDeliveryStatus] = useState<
    'Delivered in Full' | 'Partial Delivery' | 'Short Delivery' | 'Damaged' | 'Delivery Refused' | 'Other Exception'
  >('Delivered in Full');

  // Exception Details
  const [shortageQty, setShortageQty] = useState<number>(0);
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [damageDescription, setDamageDescription] = useState('');
  const [missingPackages, setMissingPackages] = useState('');
  const [remarks, setRemarks] = useState('');

  // Receiver Acknowledgement
  const [receiverName, setReceiverName] = useState('');
  const [receiverDesignation, setReceiverDesignation] = useState('Receiving Incharge');
  const [receiverCompany, setReceiverCompany] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [goodsReceivedConfirmed, setGoodsReceivedConfirmed] = useState(false);

  // Delivery Timings
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );

  // Geolocation
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Detecting location...');

  // Attachments
  const [attachments, setAttachments] = useState<PodAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Error Feedback
  const [validationError, setValidationError] = useState('');

  // Initialize
  useEffect(() => {
    if (!isOpen) return;
    setValidationError('');

    // Prepopulate LR if given, or find matching LR for trip
    let targetLr = lr;
    if (!targetLr && trip) {
      const allLrs = dbtabeses.getLorryReceipts();
      targetLr = allLrs.find(l => l.trip_id === trip.id || l.trip_number === trip.trip_number) || null;
    }
    setSelectedLr(targetLr || null);

    // Generate automatic POD number
    const freshPodNumber = documentSequenceService.getNextPODNumber();
    setPodNumber(freshPodNumber);

    // Defaults from LR
    if (targetLr) {
      setReceiverCompany(targetLr.consignee.name || '');
      setReceiverPhone(targetLr.consignee.phone || '');
    } else if (trip) {
      setReceiverCompany(trip.client_name || '');
    }

    // Geolocation capture
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          setGpsStatus('GPS Location Verified');
        },
        (err) => {
          console.warn('Geolocation access declined or unavailable:', err);
          setGpsStatus('GPS not enabled (Handled safely)');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setGpsStatus('GPS not supported');
    }

    // Clear signature canvas after modal mounts
    setTimeout(() => {
      clearSignature();
    }, 100);
  }, [isOpen, lr, trip]);

  // Canvas Touch & Mouse handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // dark ink

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Compress and handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // If image, compress via Canvas
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1200;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
            }

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            const newAtt: PodAttachment = {
              id: 'att-' + Date.now() + '-' + i,
              name: file.name,
              file_type: 'image/jpeg',
              file_size: Math.round(compressedDataUrl.length * 0.75),
              data_url: compressedDataUrl,
              uploaded_at: new Date().toISOString()
            };
            setAttachments((prev) => [...prev, newAtt]);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // PDF or doc file
        const reader = new FileReader();
        reader.onload = (event) => {
          const newAtt: PodAttachment = {
            id: 'att-' + Date.now() + '-' + i,
            name: file.name,
            file_type: file.type || 'application/pdf',
            file_size: file.size,
            data_url: (event.target?.result as string) || '',
            uploaded_at: new Date().toISOString()
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsDataURL(file);
      }
    }
    setUploading(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // Submit POD
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Rule: Exception status requires remarks!
    const isException = deliveryStatus !== 'Delivered in Full';
    if (isException && (!remarks.trim() && !damageDescription.trim() && !missingPackages.trim())) {
      setValidationError('For non-full delivery or damage exceptions, "Exception / Remarks" is strictly mandatory.');
      return;
    }

    if (!receiverName.trim()) {
      setValidationError('Receiver Name is required.');
      return;
    }

    if (!goodsReceivedConfirmed) {
      setValidationError('You must verify and check the "Goods received" acknowledgement box.');
      return;
    }

    // Get Signature data URL
    let signatureUrl = '';
    if (hasSignature && canvasRef.current) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    }

    // Target LR details
    const targetLr = selectedLr;
    const lrNum = targetLr ? targetLr.lr_number : 'NO-LR-REF';
    const tripNum = targetLr ? targetLr.trip_number : (trip ? trip.trip_number : 'TRIP-REF');
    const vehNum = targetLr ? targetLr.vehicle_details.vehicle_number : (trip ? trip.truck_number : 'TG12U2637');
    const drvName = targetLr ? targetLr.vehicle_details.driver_name : (trip ? trip.driver_name : 'Driver');
    const clName = targetLr ? targetLr.client_name : (trip ? trip.client_name : 'Client');

    const totalPackages = targetLr
      ? (targetLr.goods_items || []).reduce((s, g) => s + (Number(g.package_count) || 0), 0)
      : 100;

    const totalWeight = targetLr
      ? (targetLr.goods_items || []).reduce((s, g) => s + (Number(g.actual_weight_kg) || 0), 0)
      : 2500;

    const goodsDesc = targetLr
      ? (targetLr.goods_items || []).map(g => g.description).join('; ')
      : 'General Goods Consignment';

    const newPod: PodRecord = {
      id: 'pod-' + Date.now(),
      pod_number: podNumber.trim().toUpperCase(),
      lr_id: targetLr?.id || '',
      lr_number: lrNum,
      lr_date: targetLr?.lr_date || deliveryDate,
      trip_id: targetLr?.trip_id || (trip?.id || ''),
      trip_number: tripNum,
      vehicle_number: vehNum,
      driver_name: drvName,
      eway_bill_number: targetLr?.eway_bill_number,
      client_name: clName,
      consignor_name: targetLr?.consignor.name || 'Consignor Facility',
      consignor_address: targetLr?.consignor.address || 'Hyderabad',
      consignor_gstin: targetLr?.consignor.gstin,
      consignee_name: targetLr?.consignee.name || receiverCompany,
      consignee_delivery_address: targetLr?.consignee.delivery_address || 'Destination Hub',
      consignee_gstin: targetLr?.consignee.gstin,
      description_of_goods: goodsDesc,
      number_of_packages: totalPackages,
      quantity: totalPackages,
      weight_kg: totalWeight,
      origin: targetLr?.route_details.origin || 'Hyderabad',
      destination: targetLr?.route_details.destination || 'Warangal',
      delivery_status: deliveryStatus,
      exception_details: isException
        ? {
            shortage_qty: Number(shortageQty || 0),
            damaged_qty: Number(damagedQty || 0),
            damage_description: damageDescription.trim(),
            missing_package_details: missingPackages.trim(),
            remarks: remarks.trim()
          }
        : undefined,
      receiver_name: receiverName.trim(),
      receiver_designation: receiverDesignation.trim(),
      receiver_company_name: receiverCompany.trim(),
      receiver_phone: receiverPhone.trim(),
      goods_received_confirmed: true,
      receiver_signature_url: signatureUrl,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_gps_coordinates: gpsLocation || undefined,
      attachments: attachments,
      status: 'Captured',
      created_by: `${drvName} (Driver)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Save POD to store
    const pods = dbtabeses.getPodRecords();
    pods.unshift(newPod);
    dbtabeses.setPodRecords(pods);

    // 2. Link with LR and update LR status
    if (targetLr) {
      const lrs = dbtabeses.getLorryReceipts();
      const lrIdx = lrs.findIndex(l => l.id === targetLr.id);
      if (lrIdx !== -1) {
        lrs[lrIdx] = {
          ...lrs[lrIdx],
          pod_id: newPod.id,
          pod_number: newPod.pod_number,
          pod_status: deliveryStatus,
          updated_at: new Date().toISOString()
        };
        dbtabeses.setLorryReceipts(lrs);
      }
    }

    // 3. Update Trip status to Delivered / Completed
    const allTrips = dbtabeses.getTrips();
    const targetTripId = targetLr?.trip_id || trip?.id;
    const tripIdx = allTrips.findIndex(t => t.id === targetTripId || t.trip_number === tripNum);
    if (tripIdx !== -1) {
      allTrips[tripIdx] = {
        ...allTrips[tripIdx],
        status: 'Delivered',
        requires_pod: true,
        pod_status: 'Verified',
        pod_file_url: attachments.length > 0 ? attachments[0].data_url : undefined
      };
      dbtabeses.setTrips(allTrips);
    }

    // 4. Log Audit Trail
    auditLogService.logAction({
      document_type: 'POD',
      document_id: newPod.id,
      document_number: newPod.pod_number,
      action: 'Submitted',
      user_name: drvName,
      user_role: 'Driver',
      details: `Captured & generated POD for Trip ${tripNum} (${deliveryStatus})`
    });

    onSuccess(newPod);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Capture Proof of Delivery (POD)</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {podNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Driver Portal &bull; Destination Delivery Confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-red-950/90 border-b border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1">
          {/* Linked LR / Trip Summary Card */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Consignment Reference</span>
              <p className="font-bold text-white">
                {selectedLr ? `LR: ${selectedLr.lr_number}` : 'Stand-alone Delivery'} &bull;{' '}
                <span className="text-orange-400">{selectedLr?.trip_number || trip?.trip_number || 'Trip'}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Client: {selectedLr?.client_name || trip?.client_name} &bull; Vehicle:{' '}
                {selectedLr?.vehicle_details.vehicle_number || trip?.truck_number}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {gpsStatus}
              </span>
            </div>
          </div>

          {/* Delivery Status Picker */}
          <div className="space-y-1.5">
            <label className="block font-bold text-white uppercase tracking-wider text-[11px]">
              Delivery Status *
            </label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-950 border-2 border-slate-700 rounded-xl text-white font-bold text-sm"
            >
              <option value="Delivered in Full">✅ Delivered in Full (100% Sound Condition)</option>
              <option value="Partial Delivery">⚠️ Partial Delivery (Part Consignment Delivered)</option>
              <option value="Short Delivery">⚠️ Short Delivery (Missing Cartons / Count Shortage)</option>
              <option value="Damaged">❌ Damaged Cargo / Broken Packages</option>
              <option value="Delivery Refused">🚫 Delivery Refused by Consignee</option>
              <option value="Other Exception">⚠️ Other Delivery Exception</option>
            </select>
          </div>

          {/* Exception Details (Required if not 'Delivered in Full') */}
          {deliveryStatus !== 'Delivered in Full' && (
            <div className="p-3.5 bg-amber-950/30 border-2 border-amber-600/40 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Exception &amp; Shortage Reporting (Mandatory)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Shortage Quantity (Units)</label>
                  <input
                    type="number"
                    value={shortageQty}
                    onChange={(e) => setShortageQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-amber-600/40 rounded-lg text-white font-mono"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Damaged Quantity (Units)</label>
                  <input
                    type="number"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-amber-600/40 rounded-lg text-white font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Damage Description / Exception Details *</label>
                <textarea
                  rows={2}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-amber-600/40 rounded-lg text-white text-xs"
                  placeholder="Detail the nature of damage, shortage reason, or consignee refusal rationale..."
                  required
                />
              </div>
            </div>
          )}

          {/* Receiver Information */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">
              Receiver Acknowledgement
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Receiver Full Name *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  placeholder="e.g. Sanjeeva Reddy"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Designation / Role</label>
                <input
                  type="text"
                  value={receiverDesignation}
                  onChange={(e) => setReceiverDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g. Warehouse Incharge / Guard"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Receiver Company Name</label>
                <input
                  type="text"
                  value={receiverCompany}
                  onChange={(e) => setReceiverCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g. Amazon Hub Warangal"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Receiver Mobile Number</label>
                <input
                  type="text"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  placeholder="+91 98490 88776"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Delivery Handover Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Delivery Time</label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-orange-400" />
                <span>Receiver Digital Touch Signature</span>
              </span>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded-lg transition"
              >
                Clear Pad
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Ask the receiver to sign below using finger or stylus.</p>

            <div className="border-2 border-dashed border-slate-700 rounded-xl bg-white overflow-hidden shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{hasSignature ? '✅ Signature captured' : 'Touch/drag inside box to sign'}</span>
              <span>Signed by: {receiverName || 'Receiver'}</span>
            </div>
          </div>

          {/* Document & Photo Upload */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Signed Document / Photo Proof</span>
              </span>
              <span className="text-[10px] text-slate-500">JPG, PNG, PDF</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl text-center cursor-pointer transition">
                <Upload className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-200 block">Take Photo or Browse File</span>
                <span className="text-[10px] text-slate-400">Automatic compression active</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Attachments List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {attachments.map((att) => (
                  <div key={att.id} className="relative p-2 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 group">
                    {att.file_type.startsWith('image/') ? (
                      <img src={att.data_url} alt={att.name} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-800" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-orange-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white truncate">{att.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{(att.file_size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Remarks */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">General Delivery Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              placeholder="e.g. Unloaded at Dock 4, goods inspected & accepted by consignee staff"
            />
          </div>

          {/* Mandatory "Goods Received" Confirmation Checkbox */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="goods-received-check"
              checked={goodsReceivedConfirmed}
              onChange={(e) => setGoodsReceivedConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-950 cursor-pointer"
              required
            />
            <label htmlFor="goods-received-check" className="text-xs text-slate-300 cursor-pointer font-medium">
              <span className="font-bold text-white block">Goods Received &amp; Handover Verified</span>
              I confirm that the shipment articles and package count described herein have been physically presented and acknowledged by the consignee receiving representative.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Delivery &amp; Generate POD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
