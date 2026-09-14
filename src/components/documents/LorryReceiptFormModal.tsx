import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Save, FileText, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { LorryReceipt, TripLog, ClientProfile, Truck, Employee, GoodsItem, FreightDetails } from '../../types';
import { dbtabeses } from '../../db/store';
import { documentSequenceService, generateSecureToken } from '../../services/documentSequenceService';
import { auditLogService } from '../../services/auditLogService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingLr?: LorryReceipt | null;
  fromTrip?: TripLog | null;
  onSuccess: (lr: LorryReceipt) => void;
}

export const LorryReceiptFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingLr,
  fromTrip,
  onSuccess
}) => {
  const company = dbtabeses.getCompanySettings();
  const trips: TripLog[] = dbtabeses.getTrips();
  const clients: ClientProfile[] = dbtabeses.getClients();
  const trucks: Truck[] = dbtabeses.getTrucks();
  const employees: Employee[] = dbtabeses.getEmployees();

  const [activeSection, setActiveSection] = useState<'info' | 'parties' | 'vehicle' | 'goods' | 'freight' | 'terms'>('info');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [lrNumber, setLrNumber] = useState('');
  const [lrDate, setLrDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [ewayBill, setEwayBill] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [customerRef, setCustomerRef] = useState('');

  // Parties
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [consignorName, setConsignorName] = useState('');
  const [consignorAddress, setConsignorAddress] = useState('');
  const [consignorGstin, setConsignorGstin] = useState('');
  const [consignorPhone, setConsignorPhone] = useState('');

  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeAddress, setConsigneeAddress] = useState('');
  const [consigneeGstin, setConsigneeGstin] = useState('');
  const [consigneePhone, setConsigneePhone] = useState('');

  // Vehicle & Driver
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Goods Vehicle (32FT)');
  const [vehicleCapacityTons, setVehicleCapacityTons] = useState(14.5);
  const [vehicleModel, setVehicleModel] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // Route
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [expectedDeliveryDateTime, setExpectedDeliveryDateTime] = useState('');

  // Goods Table
  const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([
    {
      id: 'g-1',
      package_count: 100,
      package_type: 'Carton Boxes',
      description: 'General Transport Cargo',
      actual_weight_kg: 2500,
      charged_weight_kg: 2500,
      quantity: 100,
      remarks: 'Goods sound condition'
    }
  ]);

  // Freight Details
  const [freightAmount, setFreightAmount] = useState<number>(0);
  const [loadingCharges, setLoadingCharges] = useState<number>(0);
  const [unloadingCharges, setUnloadingCharges] = useState<number>(0);
  const [detentionCharges, setDetentionCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [taxType, setTaxType] = useState<'CGST_SGST' | 'IGST' | 'EXEMPT'>('CGST_SGST');
  const [paymentBasis, setPaymentBasis] = useState<'To Be Billed' | 'Paid' | 'To Pay'>('To Be Billed');
  const [paymentTerms, setPaymentTerms] = useState('14 Days Net Credit');

  // Terms
  const [declarationTerms, setDeclarationTerms] = useState(company.lr_default_terms || '');

  // Initialize or Prepopulate
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');

    if (existingLr) {
      // Edit existing LR
      setLrNumber(existingLr.lr_number);
      setLrDate(existingLr.lr_date);
      setBookingDate(existingLr.booking_date);
      setSelectedTripId(existingLr.trip_id);
      setEwayBill(existingLr.eway_bill_number || '');
      setInvoiceNo(existingLr.invoice_number || '');
      setCustomerRef(existingLr.customer_ref_number || '');
      setClientId(existingLr.client_id || '');
      setClientName(existingLr.client_name);

      setConsignorName(existingLr.consignor.name);
      setConsignorAddress(existingLr.consignor.address);
      setConsignorGstin(existingLr.consignor.gstin || '');
      setConsignorPhone(existingLr.consignor.phone);

      setConsigneeName(existingLr.consignee.name);
      setConsigneeAddress(existingLr.consignee.delivery_address);
      setConsigneeGstin(existingLr.consignee.gstin || '');
      setConsigneePhone(existingLr.consignee.phone);

      setVehicleNumber(existingLr.vehicle_details.vehicle_number);
      setVehicleType(existingLr.vehicle_details.vehicle_type);
      setVehicleCapacityTons(existingLr.vehicle_details.vehicle_capacity_tons || 14.5);
      setVehicleModel(existingLr.vehicle_details.vehicle_model || '');
      setDriverName(existingLr.vehicle_details.driver_name);
      setDriverPhone(existingLr.vehicle_details.driver_phone);

      setOrigin(existingLr.route_details.origin);
      setDestination(existingLr.route_details.destination);
      setPickupLocation(existingLr.route_details.pickup_location);
      setDeliveryLocation(existingLr.route_details.delivery_location);
      setPickupDateTime(existingLr.route_details.pickup_date_time || '');
      setExpectedDeliveryDateTime(existingLr.route_details.expected_delivery_date_time || '');

      setGoodsItems(existingLr.goods_items.length > 0 ? existingLr.goods_items : [
        {
          id: 'g-1',
          package_count: 10,
          package_type: 'Cartons',
          description: 'General Goods',
          actual_weight_kg: 500,
          charged_weight_kg: 500,
          quantity: 10,
          remarks: ''
        }
      ]);

      const fd = existingLr.freight_details;
      setFreightAmount(fd.freight_amount || 0);
      setLoadingCharges(fd.loading_charges || 0);
      setUnloadingCharges(fd.unloading_charges || 0);
      setDetentionCharges(fd.detention_charges || 0);
      setOtherCharges(fd.other_charges || 0);
      setDiscount(fd.discount || 0);
      setPaymentBasis(fd.payment_basis || 'To Be Billed');
      setPaymentTerms(fd.payment_terms || '14 Days Net Credit');
      setTaxType(fd.igst > 0 ? 'IGST' : (fd.cgst > 0 ? 'CGST_SGST' : 'EXEMPT'));
      setDeclarationTerms(existingLr.declaration_terms || company.lr_default_terms);
    } else {
      // New LR - generate fresh number
      const freshNumber = documentSequenceService.getNextLRNumber();
      setLrNumber(freshNumber);
      setLrDate(new Date().toISOString().split('T')[0]);
      setBookingDate(new Date().toISOString().split('T')[0]);
      setDeclarationTerms(company.lr_default_terms || '');

      const trip = fromTrip || (trips.length > 0 ? trips[0] : null);
      if (trip) {
        populateFromTrip(trip);
      }
    }
  }, [isOpen, existingLr, fromTrip]);

  const populateFromTrip = (t: TripLog) => {
    setSelectedTripId(t.id);
    setClientId(t.client_id || '');
    setClientName(t.client_name || '');
    setVehicleNumber(t.truck_number || '');
    setDriverName(t.driver_name || '');
    setOrigin(t.origin || 'Hyderabad');
    setDestination(t.destination || '');
    setPickupLocation(`${t.origin} Main Depot`);
    setDeliveryLocation(`${t.destination} Delivery Hub`);
    setFreightAmount(t.revenue || 0);
    setInvoiceNo(t.invoice_number || `INV-${t.trip_number}`);
    setCustomerRef(t.trip_number);

    // Look up matching truck
    const matchedTruck = trucks.find(trk => trk.truck_number === t.truck_number);
    if (matchedTruck) {
      setVehicleModel(matchedTruck.model || '');
    }

    // Look up matching driver phone
    const matchedDriver = employees.find(e => e.id === t.driver_id || e.full_name === t.driver_name);
    if (matchedDriver) {
      setDriverPhone(matchedDriver.phone || '+91 98765 43210');
    } else {
      setDriverPhone('+91 98765 43210');
    }

    // Look up client details for consignor/consignee defaults
    const matchedClient = clients.find(c => c.id === t.client_id || c.company_name === t.client_name);
    if (matchedClient) {
      setConsignorName(matchedClient.company_name);
      setConsignorAddress(`${t.origin} Central Logistics Facility`);
      setConsignorGstin(matchedClient.gst_number || '');
      setConsignorPhone(matchedClient.phone || '');

      setConsigneeName(`${matchedClient.company_name} - ${t.destination} Hub`);
      setConsigneeAddress(`${t.destination} Industrial Zone / Delivery Center`);
      setConsigneeGstin(matchedClient.gst_number || '');
      setConsigneePhone(matchedClient.phone || '');
    } else {
      setConsignorName(t.client_name || 'Consignor Company Ltd');
      setConsignorAddress(`${t.origin} Warehouse`);
      setConsignorPhone('+91 98111 22334');

      setConsigneeName(`${t.client_name || 'Client'} - ${t.destination} Depot`);
      setConsigneeAddress(`${t.destination} Hub`);
      setConsigneePhone('+91 98222 33445');
    }
  };

  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(tripId);
    const selected = trips.find(t => t.id === tripId);
    if (selected) {
      populateFromTrip(selected);
    }
  };

  // Goods item handlers
  const handleAddGoodsItem = () => {
    setGoodsItems([
      ...goodsItems,
      {
        id: 'g-' + Date.now(),
        package_count: 10,
        package_type: 'Cartons',
        description: 'Commercial Consignment',
        actual_weight_kg: 200,
        charged_weight_kg: 200,
        quantity: 10,
        remarks: ''
      }
    ]);
  };

  const handleRemoveGoodsItem = (id: string) => {
    if (goodsItems.length === 1) return;
    setGoodsItems(goodsItems.filter(g => g.id !== id));
  };

  const handleUpdateGoodsItem = (id: string, field: keyof GoodsItem, value: any) => {
    setGoodsItems(goodsItems.map(g => (g.id === id ? { ...g, [field]: value } : g)));
  };

  // Live Freight Calculations
  const taxableAmount = Math.max(
    0,
    Number(freightAmount || 0) +
    Number(loadingCharges || 0) +
    Number(unloadingCharges || 0) +
    Number(detentionCharges || 0) +
    Number(otherCharges || 0) -
    Number(discount || 0)
  );

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === 'CGST_SGST') {
    cgst = Math.round(taxableAmount * 0.025 * 100) / 100; // 2.5% CGST
    sgst = Math.round(taxableAmount * 0.025 * 100) / 100; // 2.5% SGST
  } else if (taxType === 'IGST') {
    igst = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% IGST
  }

  const totalFreight = taxableAmount + cgst + sgst + igst;

  const handleSave = (targetStatus: 'Draft' | 'Generated') => {
    setErrorMessage('');

    // Validations
    if (!lrNumber.trim()) {
      setErrorMessage('LR Number is required.');
      return;
    }

    if (documentSequenceService.isLRNumberDuplicate(lrNumber, existingLr?.id)) {
      setErrorMessage(`LR Number "${lrNumber}" is already in use by another record. Please use a unique number.`);
      return;
    }

    if (!consignorName.trim()) {
      setErrorMessage('Consignor Name is required.');
      setActiveSection('parties');
      return;
    }

    if (!consigneeName.trim()) {
      setErrorMessage('Consignee Name is required.');
      setActiveSection('parties');
      return;
    }

    if (!vehicleNumber.trim()) {
      setErrorMessage('Vehicle Number is required.');
      setActiveSection('vehicle');
      return;
    }

    if (!driverName.trim()) {
      setErrorMessage('Driver Name is required.');
      setActiveSection('vehicle');
      return;
    }

    if (!origin.trim() || !destination.trim()) {
      setErrorMessage('Route Origin and Destination are required.');
      setActiveSection('info');
      return;
    }

    const calculatedFreight: FreightDetails = {
      freight_amount: Number(freightAmount || 0),
      loading_charges: Number(loadingCharges || 0),
      unloading_charges: Number(unloadingCharges || 0),
      detention_charges: Number(detentionCharges || 0),
      other_charges: Number(otherCharges || 0),
      discount: Number(discount || 0),
      taxable_amount: taxableAmount,
      cgst,
      sgst,
      igst,
      total_freight: totalFreight,
      payment_basis: paymentBasis,
      payment_terms: paymentTerms
    };

    const targetTrip = trips.find(t => t.id === selectedTripId) || fromTrip;
    const tripNum = targetTrip ? targetTrip.trip_number : (customerRef || 'UNASSIGNED');

    const newLrRecord: LorryReceipt = {
      id: existingLr?.id || 'lr-' + Date.now(),
      lr_number: lrNumber.trim().toUpperCase(),
      lr_date: lrDate,
      booking_date: bookingDate,
      eway_bill_number: ewayBill.trim(),
      invoice_number: invoiceNo.trim(),
      customer_ref_number: customerRef.trim(),
      trip_id: selectedTripId || (targetTrip?.id || ''),
      trip_number: tripNum,
      client_id: clientId,
      client_name: clientName || consignorName,
      consignor: {
        name: consignorName.trim(),
        address: consignorAddress.trim(),
        gstin: consignorGstin.trim().toUpperCase(),
        phone: consignorPhone.trim()
      },
      consignee: {
        name: consigneeName.trim(),
        delivery_address: consigneeAddress.trim(),
        gstin: consigneeGstin.trim().toUpperCase(),
        phone: consigneePhone.trim()
      },
      vehicle_details: {
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_type: vehicleType,
        vehicle_capacity_tons: Number(vehicleCapacityTons || 14),
        vehicle_model: vehicleModel,
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim()
      },
      route_details: {
        origin: origin.trim(),
        destination: destination.trim(),
        pickup_location: pickupLocation.trim() || origin.trim(),
        delivery_location: deliveryLocation.trim() || destination.trim(),
        pickup_date_time: pickupDateTime,
        expected_delivery_date_time: expectedDeliveryDateTime
      },
      goods_items: goodsItems,
      freight_details: calculatedFreight,
      declaration_terms: declarationTerms,
      status: targetStatus,
      secure_token: existingLr?.secure_token || generateSecureToken(),
      pod_id: existingLr?.pod_id,
      pod_number: existingLr?.pod_number,
      pod_status: existingLr?.pod_status || 'Pending',
      created_by: existingLr?.created_by || 'Operations Lead',
      created_at: existingLr?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update store
    const allLrs = dbtabeses.getLorryReceipts();
    const existingIdx = allLrs.findIndex(l => l.id === newLrRecord.id);

    if (existingIdx !== -1) {
      allLrs[existingIdx] = newLrRecord;
      auditLogService.logAction({
        document_type: 'LR',
        document_id: newLrRecord.id,
        document_number: newLrRecord.lr_number,
        action: 'Edited',
        details: `Updated Lorry Receipt details (${targetStatus})`
      });
    } else {
      allLrs.unshift(newLrRecord);
      auditLogService.logAction({
        document_type: 'LR',
        document_id: newLrRecord.id,
        document_number: newLrRecord.lr_number,
        action: targetStatus === 'Draft' ? 'Created' : 'Generated',
        details: `${targetStatus === 'Draft' ? 'Saved draft' : 'Generated new'} Lorry Receipt for ${tripNum}`
      });
    }

    dbtabeses.setLorryReceipts(allLrs);
    onSuccess(newLrRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {existingLr ? 'Edit Lorry Receipt' : 'Generate Lorry Receipt (LR)'}
                <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
                  {lrNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Jai Bhavani Cargo &bull; Official Consignment Note Generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/80 border-b border-red-800 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'info', label: '1. Identification & Trip' },
            { id: 'parties', label: '2. Consignor & Consignee' },
            { id: 'vehicle', label: '3. Vehicle & Route' },
            { id: 'goods', label: '4. Goods Breakdown' },
            { id: 'freight', label: '5. Freight & GST' },
            { id: 'terms', label: '6. Terms & Declaration' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2.5 whitespace-nowrap border-b-2 transition ${
                activeSection === tab.id
                  ? 'border-orange-500 text-orange-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1">
          {/* SECTION 1: Identification & Trip */}
          {activeSection === 'info' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <p className="font-bold text-white text-xs uppercase tracking-wider text-orange-400">Link to Fleet Trip</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Select Existing Trip (Auto-Populates)</label>
                    <select
                      value={selectedTripId}
                      onChange={e => handleTripSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    >
                      <option value="">-- Manual / Custom Trip Entry --</option>
                      {trips.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.trip_number} - {t.truck_number} ({t.origin} ➔ {t.destination}) - {t.client_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Trip Reference Number</label>
                    <input
                      type="text"
                      value={customerRef}
                      onChange={e => setCustomerRef(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      placeholder="e.g. TRIP-101"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">LR Number (Auto)</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={e => setLrNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-orange-500/40 rounded-xl text-orange-300 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Format: JBC/26-27/000001</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">LR Date</label>
                  <input
                    type="date"
                    value={lrDate}
                    onChange={e => setLrDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Booking Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">E-Way Bill Number</label>
                  <input
                    type="text"
                    value={ewayBill}
                    onChange={e => setEwayBill(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
                    placeholder="e.g. EWB-361099238120"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Client Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    placeholder="e.g. INV-2026-0801"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Consignor & Consignee */}
          {activeSection === 'parties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Consignor */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-orange-400 uppercase tracking-wider">Consignor (Booking From)</span>
                  <span className="text-[10px] text-slate-500">Shipper Details</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Consignor Name *</label>
                  <input
                    type="text"
                    value={consignorName}
                    onChange={e => setConsignorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    placeholder="e.g. Amazon Fulfillment Center (HYD1)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Complete Address</label>
                  <textarea
                    rows={2}
                    value={consignorAddress}
                    onChange={e => setConsignorAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="Pickup address with PIN"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Consignor GSTIN</label>
                    <input
                      type="text"
                      value={consignorGstin}
                      onChange={e => setConsignorGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
                      placeholder="36AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={consignorPhone}
                      onChange={e => setConsignorPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      placeholder="+91 98111 22334"
                    />
                  </div>
                </div>
              </div>

              {/* Consignee */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-orange-400 uppercase tracking-wider">Consignee (Deliver To)</span>
                  <span className="text-[10px] text-slate-500">Receiver Details</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Consignee Name *</label>
                  <input
                    type="text"
                    value={consigneeName}
                    onChange={e => setConsigneeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    placeholder="e.g. Amazon Delivery Station (WAR1)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={consigneeAddress}
                    onChange={e => setConsigneeAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="Destination delivery location with PIN"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Consignee GSTIN</label>
                    <input
                      type="text"
                      value={consigneeGstin}
                      onChange={e => setConsigneeGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
                      placeholder="36AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={consigneePhone}
                      onChange={e => setConsigneePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      placeholder="+91 98490 88776"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Vehicle & Route */}
          {activeSection === 'vehicle' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <p className="font-bold text-orange-400 uppercase tracking-wider text-xs">Vehicle &amp; Driver Allocation</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Vehicle Number *</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      placeholder="e.g. TG12U2637"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Vehicle Type</label>
                    <input
                      type="text"
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. 32FT Container / HCV"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Vehicle Capacity (Tons)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={vehicleCapacityTons}
                      onChange={e => setVehicleCapacityTons(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Vehicle Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Tata Signa 48023"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Driver Name *</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Vinod Kumar Rathod"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Driver Mobile *</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <p className="font-bold text-orange-400 uppercase tracking-wider text-xs">Transit Route &amp; Timings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Origin City *</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Hyderabad"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Destination City *</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Warangal"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Pickup Location</label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Shamshabad FC Hub"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Delivery Location</label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={e => setDeliveryLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Auto Nagar Station"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Pickup Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={pickupDateTime}
                      onChange={e => setPickupDateTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Expected Delivery Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={expectedDeliveryDateTime}
                      onChange={e => setExpectedDeliveryDateTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Goods Breakdown */}
          {activeSection === 'goods' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-orange-400 uppercase tracking-wider text-xs">Articles &amp; Goods Table</p>
                <button
                  type="button"
                  onClick={handleAddGoodsItem}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Article Line</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {goodsItems.map((item, index) => (
                  <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Article #{index + 1}</span>
                      {goodsItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGoodsItem(item.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Package Count</label>
                        <input
                          type="number"
                          value={item.package_count}
                          onChange={e => handleUpdateGoodsItem(item.id, 'package_count', parseInt(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Package Type</label>
                        <input
                          type="text"
                          value={item.package_type}
                          onChange={e => handleUpdateGoodsItem(item.id, 'package_type', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. Boxes / Bags"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Actual Wt (Kg)</label>
                        <input
                          type="number"
                          value={item.actual_weight_kg}
                          onChange={e => handleUpdateGoodsItem(item.id, 'actual_weight_kg', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Charged Wt (Kg)</label>
                        <input
                          type="number"
                          value={item.charged_weight_kg}
                          onChange={e => handleUpdateGoodsItem(item.id, 'charged_weight_kg', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Description of Goods</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleUpdateGoodsItem(item.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. FMCG Retail Inventory"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Remarks / Handling Notes</label>
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={e => handleUpdateGoodsItem(item.id, 'remarks', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          placeholder="e.g. Handle with care, shrink wrapped"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Freight & GST */}
          {activeSection === 'freight' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Basic Freight (₹) *</label>
                  <input
                    type="number"
                    value={freightAmount}
                    onChange={e => setFreightAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Loading Charges (₹)</label>
                  <input
                    type="number"
                    value={loadingCharges}
                    onChange={e => setLoadingCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unloading Charges (₹)</label>
                  <input
                    type="number"
                    value={unloadingCharges}
                    onChange={e => setUnloadingCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Detention / Halting (₹)</label>
                  <input
                    type="number"
                    value={detentionCharges}
                    onChange={e => setDetentionCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Other Charges (₹)</label>
                  <input
                    type="number"
                    value={otherCharges}
                    onChange={e => setOtherCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Discount / Rebate (₹)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">GST Mode</label>
                  <select
                    value={taxType}
                    onChange={e => setTaxType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="CGST_SGST">Intra-State: CGST (2.5%) + SGST (2.5%)</option>
                    <option value="IGST">Inter-State: IGST (5.0%)</option>
                    <option value="EXEMPT">Exempt / RCM (Reverse Charge)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Basis</label>
                  <select
                    value={paymentBasis}
                    onChange={e => setPaymentBasis(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="To Be Billed">To Be Billed (Credit Contract)</option>
                    <option value="Paid">Paid (Cash / Advance Collected)</option>
                    <option value="To Pay">To Pay (Collect at Destination)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    placeholder="e.g. 14 Days Net Credit"
                  />
                </div>
              </div>

              {/* Total Calculation Display Card */}
              <div className="p-4 bg-slate-950 border-2 border-orange-500/30 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Net Taxable Amount:</span>
                  <span className="font-mono font-bold">₹{taxableAmount.toFixed(2)}</span>
                </div>
                {taxType === 'CGST_SGST' && (
                  <>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>CGST (2.5%):</span>
                      <span className="font-mono">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>SGST (2.5%):</span>
                      <span className="font-mono">₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {taxType === 'IGST' && (
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>IGST (5.0%):</span>
                    <span className="font-mono">₹{igst.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-orange-400 border-t border-slate-800 pt-2">
                  <span>TOTAL FREIGHT AMOUNT:</span>
                  <span className="font-mono text-base">₹{totalFreight.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Terms & Declaration */}
          {activeSection === 'terms' && (
            <div className="space-y-3">
              <p className="font-bold text-orange-400 uppercase tracking-wider text-xs">Standard Road Transport Conditions</p>
              <textarea
                rows={8}
                value={declarationTerms}
                onChange={e => setDeclarationTerms(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed font-mono"
              />
              <p className="text-[11px] text-slate-500">
                These conditions are printed on the physical A4 Lorry Receipt consignor &amp; consignee copies.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave('Generated')}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-950/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Generate Official LR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
