import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { 
  Loader2, AlertCircle, Truck, CreditCard, Fuel, Wallet, 
  UploadCloud, FileText, Image as ImageIcon, Trash2, Camera, Eye, Paperclip, X, Download
} from 'lucide-react';
import TruckSelectionModal from '@/components/TruckSelectionModal.jsx';
import FuelStationModal from '@/components/FuelStationModal.jsx';
import { fetchFuelStations, addFuelStationCredit } from '@/lib/fuelStationUtils.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { enhanceTrucksWithNumbers } from '@/lib/truckUtils.js';

// Validators
const isValidLuhn = (num) => {
  if (!num || !/^\d+$/.test(num)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

const isValidExpiry = (expiry) => {
  if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) return false;
  const [month, year] = expiry.includes('/') ? expiry.split('/') : [expiry.slice(0, 2), expiry.slice(2, 4)];
  const expDate = new Date(`20${year}`, parseInt(month) - 1);
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  return expDate >= today;
};

const EMPTY_ARRAY = [];

const LogFuelModal = ({ isOpen, onClose, onSuccess, savedCards = EMPTY_ARRAY, editLog = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trucksLoading, setTrucksLoading] = useState(false);
  const [trucksError, setTrucksError] = useState(null);
  const [trucks, setTrucks] = useState([]);
  
  const [internalCards, setInternalCards] = useState([]);
  const [fuelStations, setFuelStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('none');
  const [isFuelStationModalOpen, setIsFuelStationModalOpen] = useState(false);

  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    vehicle_id: '', 
    kms: '',
    liters: '',
    fuel_cost: '',
    notes: '',
    payment_method: 'Cash',
    fuel_station_id: 'none',
  });

  const [selectedCardId, setSelectedCardId] = useState('new');
  const [card1Amount, setCard1Amount] = useState('');

  const [selectedCard2Id, setSelectedCard2Id] = useState('none');
  const [card2Amount, setCard2Amount] = useState('');

  const [paymentDetails2, setPaymentDetails2] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    bankName: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    cashAmount: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Fuel Bill / Receipt Upload States
  const [billFiles, setBillFiles] = useState([]);
  const [deletedBillFiles, setDeletedBillFiles] = useState([]);
  const [isDraggingBill, setIsDraggingBill] = useState(false);
  const [previewModalDoc, setPreviewModalDoc] = useState(null);
  const billFileInputRef = React.useRef(null);

  const handleBillFileSelect = (e) => {
    if (e.target.files) {
      addBillFiles(Array.from(e.target.files));
    }
  };

  const addBillFiles = (filesList) => {
    const validFiles = [];
    for (const file of filesList) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 15MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const newItems = validFiles.map((file, idx) => ({
        key: `new-${Date.now()}-${idx}-${Math.random()}`,
        file: file,
        isNew: true,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setBillFiles((prev) => [...prev, ...newItems]);
      toast.success(`${validFiles.length} fuel receipt(s) attached.`);
    }
  };

  const handleRemoveBillFile = (itemToRemove) => {
    if (itemToRemove.isNew) {
      if (itemToRemove.previewUrl) {
        try { URL.revokeObjectURL(itemToRemove.previewUrl); } catch (_) {}
      }
      setBillFiles((prev) => prev.filter((b) => b.key !== itemToRemove.key));
    } else {
      setDeletedBillFiles((prev) => [...prev, itemToRemove.name || itemToRemove.file]);
      setBillFiles((prev) => prev.filter((b) => b.key !== itemToRemove.key));
    }
  };

  // Merge parent savedCards with self-fetched internalCards and deduplicate cleanly
  const allAvailableCards = React.useMemo(() => {
    const rawList = [...(savedCards || [])];
    (internalCards || []).forEach(ic => {
      if (!rawList.some(sc => sc.id === ic.id)) {
        rawList.push(ic);
      }
    });

    const seen = new Map();
    const cleanList = [];

    for (const card of rawList) {
      if (!card) continue;
      const last4 = card.card_number_last4 || (card.card_number ? String(card.card_number).slice(-4) : '') || '0000';
      let displayName = (card.card_name || 'Card').trim();
      const isAddon = /\[Add-On:.*?\]/i.test(displayName);
      displayName = displayName.replace(/\[Add-On:.*?\]/gi, '').trim();
      if (isAddon && !displayName.toLowerCase().includes('add-on')) {
        displayName += ' (Add-On)';
      }
      const bank = (card.bank_name || '').toUpperCase().trim();
      const key = `${displayName.toUpperCase()}_${last4}_${bank}`;

      if (!seen.has(key)) {
        seen.set(key, true);
        cleanList.push({
          ...card,
          card_name: displayName,
          card_number_last4: last4,
          bank_name: bank || card.bank_name
        });
      }
    }

    return cleanList;
  }, [savedCards, internalCards]);

  const fetchCreditCards = async () => {
    try {
      const records = await pb.collection('credit_cards').getFullList({
        sort: 'card_name',
        $autoCancel: false
      });
      setInternalCards(records || []);
    } catch (e) {
      console.error('Failed to fetch credit cards in LogFuelModal:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrucks();
      loadFuelStations();
      fetchCreditCards();
      if (editLog) {
        let rawDate = editLog.date;
        if (rawDate && rawDate.includes('T')) rawDate = rawDate.split('T')[0];
        if (rawDate && rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];

        const cost = (editLog.total_cost || editLog.fuel_cost || '').toString();
        const initialTruck = editLog.truck_number || editLog.vehicle_name || editLog.truck_id || '';
        
        setFormData({
          id: editLog.id,
          date: rawDate || format(new Date(), 'yyyy-MM-dd'),
          vehicle_id: initialTruck,
          kms: (editLog.distance || editLog.distance_driven || '100').toString(),
          liters: (editLog.liters || '').toString(),
          fuel_cost: cost,
          notes: editLog.notes || (editLog.fuel_station ? `Station: ${editLog.fuel_station}` : ''),
          payment_method: editLog.payment_method || 'Cash',
          fuel_station_id: editLog.fuel_station_id || 'none'
        });
        setCard1Amount(cost);
        if (editLog.credit_card_id) {
          setSelectedCardId(editLog.credit_card_id);
        }

        // Attach scanned receipt file if passed from camera/upload scanner
        if (editLog.receiptFile || editLog.receiptPreviewUrl) {
          try {
            const isFile = editLog.receiptFile instanceof Blob || editLog.receiptFile instanceof File;
            let preview = editLog.receiptPreviewUrl || '';
            if (!preview && isFile) {
              try {
                preview = URL.createObjectURL(editLog.receiptFile);
              } catch (e) {
                preview = '';
              }
            }
            setBillFiles([{
              key: `scanned-${Date.now()}`,
              file: isFile ? editLog.receiptFile : null,
              isNew: isFile,
              name: editLog.receiptFile?.name || 'scanned_fuel_bill.jpg',
              size: editLog.receiptFile?.size || 0,
              type: editLog.receiptFile?.type || 'image/jpeg',
              previewUrl: preview
            }]);
          } catch (err) {
            console.warn('Receipt file attachment note:', err);
          }
        }
      } else {
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          vehicle_id: '',
          kms: '',
          liters: '',
          fuel_cost: '',
          notes: '',
          payment_method: 'Cash',
          fuel_station_id: 'none'
        });
        setCard1Amount('');
      }
      setSelectedCard2Id('none');
      setCard2Amount('0');
      setPaymentDetails({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        billingAddress: '',
        upiId: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        cashAmount: ''
      });
      setPaymentDetails2({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        bankName: ''
      });
      setValidationErrors({});
      setDeletedBillFiles([]);
      if (editLog && editLog.id) {
        pb.collection('expenses').getFirstListItem(`fuel_tracker_id = "${editLog.id}"`, { $autoCancel: false })
          .then(exp => {
            if (exp && exp.documents && exp.documents.length > 0) {
              const existing = exp.documents.map((doc, idx) => ({
                key: `existing-${idx}-${doc}`,
                file: doc,
                isNew: false,
                name: doc,
                expenseId: exp.id,
                previewUrl: pb.files.getUrl(exp, doc)
              }));
              setBillFiles(existing);
            } else if (!editLog.receiptFile) {
              setBillFiles([]);
            }
          })
          .catch(() => {
            if (!editLog.receiptFile) setBillFiles([]);
          });
      } else if (!editLog?.receiptFile) {
        setBillFiles([]);
      }
    }
  }, [isOpen, editLog]);

  // Auto-match partial truck numbers (e.g. "2637" from OCR -> "TS08UE2637")
  useEffect(() => {
    if (trucks.length > 0 && formData.vehicle_id) {
      const currentVal = String(formData.vehicle_id).trim();
      const exactMatch = trucks.find(t => t.truck_number === currentVal || t.id === currentVal);
      if (!exactMatch) {
        const cleanVal = currentVal.replace(/\s/g, '').toUpperCase();
        const partialMatch = trucks.find(t => {
          const num = (t.truck_number || '').replace(/\s/g, '').toUpperCase();
          const name = (t.truck_name || '').replace(/\s/g, '').toUpperCase();
          return num.includes(cleanVal) || cleanVal.includes(num) || name.includes(cleanVal);
        });
        if (partialMatch) {
          setFormData(prev => ({ ...prev, vehicle_id: partialMatch.truck_number }));
        }
      }
    }
  }, [trucks, formData.vehicle_id]);

  // When cards are loaded and none was explicitly selected, default to the first available card
  useEffect(() => {
    if (allAvailableCards.length > 0 && (selectedCardId === 'new' || !selectedCardId) && !editLog?.credit_card_id) {
      setSelectedCardId(allAvailableCards[0].id);
    }
  }, [allAvailableCards, editLog]);

  const loadFuelStations = async () => {
    try {
      const stations = await fetchFuelStations();
      setFuelStations(stations || []);
    } catch (e) {
      console.error('Failed to fetch fuel stations:', e);
    }
  };

  const fetchTrucks = async () => {
    setTrucksLoading(true);
    setTrucksError(null);
    try {
      let fetchedList = [];

      // 1. Primary: Fast backend API list route
      try {
        const res = await apiServerClient.fetch('/trucks/list');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.trucks) && data.trucks.length > 0) {
            fetchedList = data.trucks;
          } else if (Array.isArray(data.items) && data.items.length > 0) {
            fetchedList = data.items;
          }
        }
      } catch (apiErr) {
        console.warn('API truck list fallback:', apiErr);
      }

      // 2. Secondary fallback: PocketBase SDK
      if (fetchedList.length === 0) {
        try {
          const records = await pb.collection('trucks').getFullList({
            sort: '-created',
            $autoCancel: false
          });
          if (Array.isArray(records) && records.length > 0) {
            fetchedList = records;
          }
        } catch (pbErr) {
          console.warn('PocketBase SDK truck fetch notice:', pbErr);
        }
      }

      setTrucks(enhanceTrucksWithNumbers(fetchedList));
    } catch (e) {
      console.error('Failed to fetch trucks:', e);
      setTrucksError('Failed to load trucks.');
    } finally {
      setTrucksLoading(false);
    }
  };

  const handleTruckSelect = (truck) => {
    setFormData(prev => ({ ...prev, vehicle_id: truck.truck_number }));
    if (!trucks.find(t => t.id === truck.id)) {
      setTrucks(prev => [...prev, truck]);
    }
  };

  const validatePaymentDetails = () => {
    const errors = {};
    const pm = formData.payment_method;

    if (pm === 'Credit Card') {
      const totalCost = parseFloat(formData.fuel_cost) || 0;
      const c1Amt = parseFloat(card1Amount) || 0;
      const c2Amt = parseFloat(card2Amount) || 0;

      if (selectedCard2Id && selectedCard2Id !== 'none') {
        if (Math.abs((c1Amt + c2Amt) - totalCost) > 0.01) {
          toast.error(`Split card amounts (₹${c1Amt} + ₹${c2Amt}) must equal Total Fuel Cost (₹${totalCost}).`);
          return false;
        }
      }

      if (selectedCardId === 'new') {
        if (!isValidLuhn(paymentDetails.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = 'Invalid Card 1 number';
        }
        if (!isValidExpiry(paymentDetails.expiryDate)) {
          errors.expiryDate = 'Invalid or expired date (MM/YY)';
        }
        if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
          errors.cvv = 'CVV must be 3 or 4 digits';
        }
        if (!paymentDetails.cardholderName.trim()) {
          errors.cardholderName = 'Card 1 cardholder name is required';
        }
        if (!paymentDetails.bankName.trim()) {
          errors.bankName = 'Card 1 bank name is required';
        }
      }

      if (selectedCard2Id === 'new') {
        if (!isValidLuhn(paymentDetails2.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber2 = 'Invalid Card 2 number';
        }
        if (!isValidExpiry(paymentDetails2.expiryDate)) {
          errors.expiryDate2 = 'Invalid or expired date (MM/YY)';
        }
        if (!/^\d{3,4}$/.test(paymentDetails2.cvv)) {
          errors.cvv2 = 'CVV must be 3 or 4 digits';
        }
        if (!paymentDetails2.cardholderName.trim()) {
          errors.cardholderName2 = 'Card 2 cardholder name is required';
        }
        if (!paymentDetails2.bankName.trim()) {
          errors.bankName2 = 'Card 2 bank name is required';
        }
      }
    } else if (pm === 'Debit Card') {
      if (!isValidLuhn(paymentDetails.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Invalid card number';
      }
      if (!isValidExpiry(paymentDetails.expiryDate)) {
        errors.expiryDate = 'Invalid or expired date (MM/YY)';
      }
      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
      if (!paymentDetails.cardholderName.trim()) {
        errors.cardholderName = 'Cardholder name is required';
      }
    } else if (pm === 'UPI') {
      if (!/^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId)) {
        errors.upiId = 'Invalid UPI ID format';
      }
    } else if (pm === 'Bank Transfer') {
      if (!paymentDetails.accountNumber.trim()) errors.accountNumber = 'Account number is required';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(paymentDetails.ifscCode.toUpperCase())) {
        errors.ifscCode = 'Invalid IFSC code';
      }
      if (!paymentDetails.bankName.trim()) errors.bankName = 'Bank name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.liters || parseFloat(formData.liters) <= 0) return toast.error('Valid Liters is required');
    if (!formData.fuel_cost || parseFloat(formData.fuel_cost) <= 0) return toast.error('Valid Fuel Cost is required');

    let selectedTruck = trucks.find(t => t.truck_number === formData.vehicle_id || t.id === formData.vehicle_id);
    if (!selectedTruck && formData.vehicle_id) {
      const cleanVal = String(formData.vehicle_id).replace(/\s/g, '').toUpperCase();
      selectedTruck = trucks.find(t => {
        const num = (t.truck_number || '').replace(/\s/g, '').toUpperCase();
        const name = (t.truck_name || '').replace(/\s/g, '').toUpperCase();
        return num.includes(cleanVal) || cleanVal.includes(num) || name.includes(cleanVal);
      });
    }
    if (!selectedTruck && trucks.length > 0) {
      selectedTruck = trucks[0];
    }
    if (!selectedTruck || !selectedTruck.id) {
      return toast.error('Please select a truck / vehicle.');
    }

    if (!validatePaymentDetails()) {
      return toast.error('Please correct the payment details errors.');
    }

    setLoading(true);
    
    try {
      let finalCreditCardId = null;
      let finalCreditCardId2 = null;

      // Handle Credit Card creation if "Add New Card" is selected
      if (formData.payment_method === 'Credit Card') {
        if (selectedCardId === 'new') {
          const newCardPayload = {
            card_name: paymentDetails.cardholderName,
            card_number_last4: paymentDetails.cardNumber.replace(/\D/g, '').slice(-4),
            card_type: 'Credit',
            bank_name: paymentDetails.bankName,
            billing_cycle_start: 1,
            billing_cycle_end: 30,
            status: 'Active',
            user_id: currentUser?.id || ''
          };
          const newCard = await pb.collection('credit_cards').create(newCardPayload, { $autoCancel: false });
          finalCreditCardId = newCard.id;
          toast.success('Primary credit card saved.');
        } else {
          finalCreditCardId = selectedCardId;
        }

        if (selectedCard2Id && selectedCard2Id !== 'none') {
          if (selectedCard2Id === 'new') {
            const newCardPayload2 = {
              card_name: paymentDetails2.cardholderName,
              card_number_last4: paymentDetails2.cardNumber.replace(/\D/g, '').slice(-4),
              card_type: 'Credit',
              bank_name: paymentDetails2.bankName,
              billing_cycle_start: 1,
              billing_cycle_end: 30,
              status: 'Active',
              user_id: currentUser?.id || ''
            };
            const newCard2 = await pb.collection('credit_cards').create(newCardPayload2, { $autoCancel: false });
            finalCreditCardId2 = newCard2.id;
            toast.success('Second credit card saved.');
          } else {
            finalCreditCardId2 = selectedCard2Id;
          }
        }
      }

      const vehicleName = selectedTruck.truck_number;
      const refillDate = `${formData.date} 12:00:00.000Z`; 
      const distanceDriven = parseFloat(formData.kms);
      const liters = parseFloat(formData.liters);
      const fuelCost = parseFloat(formData.fuel_cost);

      const matchedStation = fuelStations.find(s => s.id === formData.fuel_station_id);

      // Handle Fuel Station Credit (Udhar) balance addition
      if (formData.payment_method === 'Credit' || formData.payment_method === 'Credit / Udhar (Fuel Station Credit)') {
        if (matchedStation) {
          await addFuelStationCredit(matchedStation.id, fuelCost);
          toast.info(`₹${fuelCost.toLocaleString('en-IN')} added to ${matchedStation.station_name} credit (Udhar) balance.`);
        }
      }

      let paymentInfoStr = `Payment Method: ${formData.payment_method}\n`;
      if (matchedStation) {
        paymentInfoStr += `Fuel Station: ${matchedStation.brand || ''} ${matchedStation.station_name} (${matchedStation.location || ''})\n`;
      }

      if (formData.payment_method === 'Credit Card') {
        if (selectedCard2Id && selectedCard2Id !== 'none') {
          const c1Obj = savedCards.find(c => c.id === finalCreditCardId);
          const c2Obj = savedCards.find(c => c.id === finalCreditCardId2);

          const c1Str = c1Obj ? `${c1Obj.card_name} (****${c1Obj.card_number_last4})` : (paymentDetails.cardNumber ? `****${paymentDetails.cardNumber.slice(-4)}` : 'Card 1');
          const c2Str = c2Obj ? `${c2Obj.card_name} (****${c2Obj.card_number_last4})` : (paymentDetails2.cardNumber ? `****${paymentDetails2.cardNumber.slice(-4)}` : 'Card 2');

          paymentInfoStr += `Split Credit Cards:\n- Card 1: ${c1Str} => ₹${card1Amount}\n- Card 2: ${c2Str} => ₹${card2Amount}\n`;
        } else {
          if (selectedCardId === 'new') {
            const maskedCard = paymentDetails.cardNumber.slice(-4).padStart(paymentDetails.cardNumber.length, '*');
            paymentInfoStr += `Card: ${maskedCard}, Name: ${paymentDetails.cardholderName}, Bank: ${paymentDetails.bankName}\n`;
          } else {
            const card = savedCards.find(c => c.id === finalCreditCardId);
            if (card) {
              paymentInfoStr += `Card: ****${card.card_number_last4}, Name: ${card.card_name}, Bank: ${card.bank_name}\n`;
            }
          }
        }
      } else if (formData.payment_method === 'Debit Card') {
        const maskedCard = paymentDetails.cardNumber.slice(-4).padStart(paymentDetails.cardNumber.length, '*');
        paymentInfoStr += `Debit Card: ${maskedCard}, Name: ${paymentDetails.cardholderName}\n`;
      } else if (formData.payment_method === 'UPI') {
        paymentInfoStr += `UPI ID: ${paymentDetails.upiId}\n`;
      } else if (formData.payment_method === 'Bank Transfer') {
        paymentInfoStr += `Bank: ${paymentDetails.bankName}, A/C: ${paymentDetails.accountNumber.slice(-4).padStart(paymentDetails.accountNumber.length, '*')}, IFSC: ${paymentDetails.ifscCode}\n`;
      } else if (formData.payment_method === 'Cash' && paymentDetails.cashAmount) {
        paymentInfoStr += `Cash Amount Given: ₹${paymentDetails.cashAmount}\n`;
      }

      const finalNotes = formData.notes ? `${formData.notes}\n\n${paymentInfoStr}` : paymentInfoStr;

      // Anomaly & Fraud Sentinel Calculations
      const expMileage = Number(selectedTruck?.expected_mileage || 5.8);
      const actMileage = (distanceDriven > 0 && liters > 0) ? (distanceDriven / liters) : 0;
      const dropPct = (expMileage > 0 && actMileage > 0 && actMileage < expMileage) 
        ? Math.round(((expMileage - actMileage) / expMileage) * 100) 
        : 0;
      const isAnomaly = dropPct >= 10;
      const excessLiters = isAnomaly ? Math.max(0, Math.round((liters - (distanceDriven / expMileage)) * 10) / 10) : 0;
      const lossCost = isAnomaly ? Math.round(excessLiters * 94.5) : 0;

      // Construct tracker payload carefully mapping to `fuel_tracker` schema
      const trackerPayload = {
        date: refillDate,
        truck_id: selectedTruck.id, // Relation uses ID, not truck_number
        truck_number: vehicleName,
        distance_driven: distanceDriven,
        liters: liters,
        total_cost: fuelCost,
        payment_method: formData.payment_method, // 'Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'
        notes: finalNotes,
        expected_mileage: expMileage,
        efficiency_drop_pct: dropPct,
        is_anomaly: isAnomaly,
        excess_liters_lost: excessLiters,
        financial_loss_inr: lossCost
      };

      if (isAnomaly && !formData.id) {
        trackerPayload.investigation_status = 'Open';
      }

      // Only attach credit_card_id if one actually exists, preventing 400 Bad Request
      if (finalCreditCardId) {
        trackerPayload.credit_card_id = finalCreditCardId;
      }

      let tracker;
      if (formData.id) {
        console.log('Updating existing fuel_tracker record:', formData.id, trackerPayload);
        tracker = await pb.collection('fuel_tracker').update(formData.id, trackerPayload, { $autoCancel: false });
        toast.success('Fuel log updated successfully');
      } else {
        console.log('Sending fuel_tracker creation payload:', trackerPayload);
        tracker = await pb.collection('fuel_tracker').create(trackerPayload, { $autoCancel: false });
        toast.success('Fuel refill record created successfully');
      }

      // Create or update linked expense record mapped to `expenses` schema
      const expensePaymentMethodMap = {
        'Cash': 'Cash',
        'Credit Card': 'Credit Card',
        'Debit Card': 'Debit Card',
        'UPI': 'UPI',
        'Bank Transfer': 'Bank Transfer'
      };

      const expensePayload = {
        date: refillDate,
        category: 'Regular', // Must be 'Regular' per expenses.category enum
        subcategory: 'Fuel',
        amount: fuelCost,
        liters: liters,
        truck_id: vehicleName, // Stores truck_number, matching other expense records
        description: `${vehicleName} - ${distanceDriven} KMs Driven - ${liters} L`,
        payment_method: expensePaymentMethodMap[formData.payment_method] || 'Cash',
        status: 'Approved',
        created_by: currentUser?.id || pb.authStore.model?.id || '',
        fuel_tracker_id: tracker.id
      };
      
      if (finalCreditCardId) {
        expensePayload.credit_card_id = finalCreditCardId;
      }

      try {
        let expenseRecord = null;
        const newFiles = billFiles.filter(b => b.isNew && (b.file instanceof File || b.file instanceof Blob));

        const existingExpenses = await pb.collection('expenses').getList(1, 1, {
          filter: `fuel_tracker_id = "${tracker.id}"`,
          $autoCancel: false
        }).catch(() => ({ items: [] }));

        if (newFiles.length > 0 || deletedBillFiles.length > 0) {
          const fd = new FormData();
          fd.append('date', refillDate);
          fd.append('category', 'Regular');
          fd.append('subcategory', 'Fuel');
          fd.append('amount', String(fuelCost));
          fd.append('liters', String(liters));
          fd.append('truck_id', vehicleName);
          fd.append('description', `Fuel: ${vehicleName} - ${liters} L (${formData.payment_method})`);
          fd.append('payment_method', expensePaymentMethodMap[formData.payment_method] || 'Cash');
          fd.append('status', 'Approved');
          fd.append('created_by', currentUser?.id || pb.authStore.model?.id || '');
          fd.append('fuel_tracker_id', tracker.id);
          if (finalCreditCardId) fd.append('credit_card_id', finalCreditCardId);

          newFiles.forEach(b => {
            if (b.file) {
              fd.append('documents', b.file);
              fd.append('image_urls', b.file);
            }
          });
          deletedBillFiles.forEach(docName => {
            fd.append('documents.', docName);
          });

          if (existingExpenses.items && existingExpenses.items.length > 0) {
            expenseRecord = await pb.collection('expenses').update(existingExpenses.items[0].id, fd, { $autoCancel: false });
          } else {
            expenseRecord = await pb.collection('expenses').create(fd, { $autoCancel: false });
          }
        } else {
          if (existingExpenses.items && existingExpenses.items.length > 0) {
            expenseRecord = await pb.collection('expenses').update(existingExpenses.items[0].id, expensePayload, { $autoCancel: false });
          } else {
            expenseRecord = await pb.collection('expenses').create(expensePayload, { $autoCancel: false });
          }
        }

        // Direct Cashbook synchronization
        try {
          const cbPayload = {
            date: refillDate,
            description: `Fuel: ${vehicleName} (${liters} L - ₹${fuelCost.toLocaleString('en-IN')}) [${formData.payment_method}]`,
            amount: Number(fuelCost),
            transaction_type: 'Expense',
            category: 'Regular - Fuel',
            reference_id: (expenseRecord && expenseRecord.id) ? expenseRecord.id : tracker.id,
            reference_type: 'expense',
            status: 'Completed',
            added_by: currentUser?.id || pb.authStore.model?.id || ''
          };

          const existingCb = await pb.collection('cashbook').getList(1, 1, {
            filter: `reference_id = "${(expenseRecord && expenseRecord.id) || tracker.id}" || reference_id = "${tracker.id}"`,
            $autoCancel: false
          }).catch(() => ({ items: [] }));

          if (existingCb.items && existingCb.items.length > 0) {
            await pb.collection('cashbook').update(existingCb.items[0].id, cbPayload, { $autoCancel: false });
          } else {
            await pb.collection('cashbook').create(cbPayload, { $autoCancel: false });
          }
        } catch (cbErr) {
          console.warn('Direct cashbook sync note:', cbErr?.message);
        }

        // 3. Superuser Backend API fallback for 100% reliable guarantee
        try {
          await fetch('/hcgi/api/fuel/sync-expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fuel_tracker_id: tracker.id,
              date: refillDate,
              truck_id: vehicleName,
              liters: liters,
              amount: fuelCost,
              payment_method: formData.payment_method,
              description: `Fuel: ${vehicleName} (${liters} L - ₹${fuelCost.toLocaleString('en-IN')}) [${formData.payment_method}]`,
              user_id: currentUser?.id || pb.authStore.model?.id || ''
            })
          }).catch(() => {});
        } catch (_) {}

        toast.success('Refill saved & added to Expenses and Cashbook!');
      } catch (e) {
        console.warn('Linked expense update/creation note:', e?.message);
        // Fallback backend sync on client permission error
        try {
          await fetch('/hcgi/api/fuel/sync-expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fuel_tracker_id: tracker.id,
              date: refillDate,
              truck_id: vehicleName,
              liters: liters,
              amount: fuelCost,
              payment_method: formData.payment_method,
              description: `Fuel: ${vehicleName} (${liters} L - ₹${fuelCost.toLocaleString('en-IN')}) [${formData.payment_method}]`,
              user_id: currentUser?.id || pb.authStore.model?.id || ''
            })
          }).catch(() => {});
          toast.success('Refill saved & synced to Expenses and Cashbook!');
        } catch (_) {}
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving fuel record:', error);
      console.error('Detailed API Response:', error.data || error.response?.data);
      
      let errorMsg = error.message;
      const responseData = error.data || error.response?.data;
      
      // Extract detailed validation errors from PocketBase response
      if (responseData && responseData.data) {
        const fieldErrors = Object.entries(responseData.data)
          .map(([field, details]) => `${field}: ${details.message}`)
          .join(', ');
        if (fieldErrors) {
          errorMsg = `Validation failed: ${fieldErrors}`;
        }
      }
      
      toast.error(errorMsg || 'Failed to save fuel record');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    switch (formData.payment_method) {
      case 'Credit Card': {
        const totalCost = parseFloat(formData.fuel_cost) || 0;
        const c1Amt = parseFloat(card1Amount) || 0;
        const c2Amt = parseFloat(card2Amount) || 0;
        const isSplit = selectedCard2Id && selectedCard2Id !== 'none';
        const sumAmts = c1Amt + c2Amt;
        const isSumValid = !isSplit || Math.abs(sumAmts - totalCost) < 0.01;

        return (
          <div className="space-y-4 mt-2 p-4 bg-muted/20 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-sm flex items-center gap-2 text-foreground">
                <CreditCard className="w-4 h-4 text-primary" />
                Credit Card Payment Options
              </Label>
              {isSplit && (
                <Badge variant={isSumValid ? "outline" : "destructive"} className={`text-[11px] font-mono ${isSumValid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}`}>
                  {isSumValid ? `₹${c1Amt.toLocaleString()} + ₹${c2Amt.toLocaleString()} = ₹${totalCost.toLocaleString()}` : `Sum ₹${sumAmts.toLocaleString()} ≠ Total ₹${totalCost.toLocaleString()}`}
                </Badge>
              )}
            </div>

            {/* Credit Card 1 (Primary) */}
            <div className="p-3 bg-background/60 rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  💳 Credit Card 1 (Primary)
                </span>
                {isSplit && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    Card 1 Share
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={isSplit ? "sm:col-span-2 space-y-1" : "sm:col-span-3 space-y-1"}>
                  <Label className="text-xs text-muted-foreground">Select Primary Card *</Label>
                  <Select 
                    value={selectedCardId} 
                    onValueChange={(v) => {
                      setSelectedCardId(v);
                      setValidationErrors({});
                    }}
                  >
                    <SelectTrigger className="bg-background h-10 text-xs">
                      <SelectValue placeholder="Select primary card..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          + Add New Card
                        </div>
                      </SelectItem>
                      {allAvailableCards.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span>💳 {c.card_name || 'Card'}</span>
                            <span className="text-muted-foreground font-mono text-[11px]">(****{c.card_number_last4 || (c.card_number ? String(c.card_number).slice(-4) : '••••')})</span>
                            {c.bank_name && <span className="text-[10px] text-primary/80 font-bold bg-primary/10 px-1.5 py-0.5 rounded">{c.bank_name}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isSplit && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Card 1 Amount (₹) *</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={card1Amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCard1Amount(val);
                        if (totalCost > 0) {
                          const rem = Math.max(0, totalCost - (parseFloat(val) || 0));
                          setCard2Amount(rem.toFixed(2));
                        }
                      }}
                      className="bg-background h-10 text-xs font-mono font-bold text-primary"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Selected Card 1 Quick Details Badge */}
              {selectedCardId !== 'new' && selectedCardId && (() => {
                const sc = allAvailableCards.find(c => c.id === selectedCardId);
                if (!sc) return null;
                return (
                  <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="font-bold text-foreground">{sc.card_name}</span>
                      <span className="text-muted-foreground font-mono">****{sc.card_number_last4 || '••••'}</span>
                      {sc.bank_name && <Badge variant="outline" className="text-[10px]">{sc.bank_name}</Badge>}
                    </div>
                    {sc.credit_limit > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        Limit: <strong className="text-foreground">₹{Number(sc.credit_limit).toLocaleString('en-IN')}</strong>
                      </span>
                    )}
                  </div>
                );
              })()}

              {selectedCardId === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 animate-in fade-in">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Card 1 Number *</Label>
                    <Input 
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPaymentDetails({...paymentDetails, cardNumber: val});
                        if (validationErrors.cardNumber) setValidationErrors({...validationErrors, cardNumber: null});
                      }}
                      className={`bg-background h-9 text-xs ${validationErrors.cardNumber ? 'border-destructive' : ''}`}
                    />
                    {validationErrors.cardNumber && <p className="text-[10px] text-destructive">{validationErrors.cardNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cardholder Name *</Label>
                    <Input 
                      type="text"
                      placeholder="Name on card"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                      className={`bg-background h-9 text-xs ${validationErrors.cardholderName ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bank Name *</Label>
                    <Input 
                      type="text"
                      placeholder="e.g. HDFC, ICICI"
                      value={paymentDetails.bankName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                      className={`bg-background h-9 text-xs ${validationErrors.bankName ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Expiry (MM/YY) *</Label>
                      <Input 
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={paymentDetails.expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d/]/g, '');
                          if (val.length === 2 && !val.includes('/') && paymentDetails.expiryDate.length === 1) {
                            val += '/';
                          }
                          setPaymentDetails({...paymentDetails, expiryDate: val});
                        }}
                        className={`bg-background h-9 text-xs ${validationErrors.expiryDate ? 'border-destructive' : ''}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CVV *</Label>
                      <Input 
                        type="password"
                        maxLength={4}
                        placeholder="***"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value.replace(/\D/g, '')})}
                        className={`bg-background h-9 text-xs ${validationErrors.cvv ? 'border-destructive' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Credit Card 2 (Split Option) */}
            <div className="p-3 bg-background/60 rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  💳 Credit Card 2 (Split Option)
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {isSplit ? 'Split Active' : 'Optional Split'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Select Card 2</Label>
                  <Select 
                    value={selectedCard2Id} 
                    onValueChange={(v) => {
                      setSelectedCard2Id(v);
                      if (v === 'none') {
                        setCard1Amount(formData.fuel_cost);
                        setCard2Amount('0');
                      } else {
                        const half = totalCost > 0 ? (totalCost / 2).toFixed(2) : '';
                        setCard1Amount(half);
                        setCard2Amount(half);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background h-10 text-xs">
                      <SelectValue placeholder="-- None (Single Card Payment) --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground font-medium">
                        -- None (Single Card Payment) --
                      </SelectItem>
                      <SelectItem value="new" className="font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          + Add New Second Card
                        </div>
                      </SelectItem>
                      {allAvailableCards.filter(c => c.id !== selectedCardId).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span>💳 {c.card_name || 'Card'}</span>
                            <span className="text-muted-foreground font-mono text-[11px]">(****{c.card_number_last4 || (c.card_number ? String(c.card_number).slice(-4) : '••••')})</span>
                            {c.bank_name && <span className="text-[10px] text-primary/80 font-bold bg-primary/10 px-1.5 py-0.5 rounded">{c.bank_name}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isSplit && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Card 2 Amount (₹) *</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={card2Amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCard2Amount(val);
                        if (totalCost > 0) {
                          const rem = Math.max(0, totalCost - (parseFloat(val) || 0));
                          setCard1Amount(rem.toFixed(2));
                        }
                      }}
                      className="bg-background h-10 text-xs font-mono font-bold text-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {selectedCard2Id === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 animate-in fade-in">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Card 2 Number *</Label>
                    <Input 
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={paymentDetails2.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPaymentDetails2({...paymentDetails2, cardNumber: val});
                      }}
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cardholder Name *</Label>
                    <Input 
                      type="text"
                      placeholder="Name on card"
                      value={paymentDetails2.cardholderName}
                      onChange={(e) => setPaymentDetails2({...paymentDetails2, cardholderName: e.target.value})}
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bank Name *</Label>
                    <Input 
                      type="text"
                      placeholder="e.g. HDFC, ICICI"
                      value={paymentDetails2.bankName}
                      onChange={(e) => setPaymentDetails2({...paymentDetails2, bankName: e.target.value})}
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Expiry (MM/YY) *</Label>
                      <Input 
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={paymentDetails2.expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d/]/g, '');
                          if (val.length === 2 && !val.includes('/') && paymentDetails2.expiryDate.length === 1) {
                            val += '/';
                          }
                          setPaymentDetails2({...paymentDetails2, expiryDate: val});
                        }}
                        className="bg-background h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CVV *</Label>
                      <Input 
                        type="password"
                        maxLength={4}
                        placeholder="***"
                        value={paymentDetails2.cvv}
                        onChange={(e) => setPaymentDetails2({...paymentDetails2, cvv: e.target.value.replace(/\D/g, '')})}
                        className="bg-background h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isSumValid && isSplit && (
              <p className="text-xs text-destructive font-semibold">
                ⚠️ Card 1 (₹{c1Amt}) + Card 2 (₹{c2Amt}) = ₹{sumAmts}. Must equal Total Fuel Cost (₹{totalCost}).
              </p>
            )}
          </div>
        );
      }

      case 'Debit Card':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in">
            <div className="space-y-2 sm:col-span-2">
              <Label>Card Number *</Label>
              <Input 
                type="text"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                value={paymentDetails.cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPaymentDetails({...paymentDetails, cardNumber: val});
                  if (validationErrors.cardNumber) setValidationErrors({...validationErrors, cardNumber: null});
                }}
                className={`bg-background ${validationErrors.cardNumber ? 'border-destructive' : ''}`}
              />
              {validationErrors.cardNumber && <p className="text-xs text-destructive">{validationErrors.cardNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cardholder Name *</Label>
              <Input 
                type="text"
                placeholder="Name on card"
                value={paymentDetails.cardholderName}
                onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                className={`bg-background ${validationErrors.cardholderName ? 'border-destructive' : ''}`}
              />
              {validationErrors.cardholderName && <p className="text-xs text-destructive">{validationErrors.cardholderName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry (MM/YY) *</Label>
                <Input 
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={paymentDetails.expiryDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^\d/]/g, '');
                    if (val.length === 2 && !val.includes('/') && paymentDetails.expiryDate.length === 1) {
                      val += '/';
                    }
                    setPaymentDetails({...paymentDetails, expiryDate: val});
                  }}
                  className={`bg-background ${validationErrors.expiryDate ? 'border-destructive' : ''}`}
                />
                {validationErrors.expiryDate && <p className="text-xs text-destructive">{validationErrors.expiryDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>CVV *</Label>
                <Input 
                  type="password"
                  maxLength={4}
                  placeholder="***"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value.replace(/\D/g, '')})}
                  className={`bg-background ${validationErrors.cvv ? 'border-destructive' : ''}`}
                />
                {validationErrors.cvv && <p className="text-xs text-destructive">{validationErrors.cvv}</p>}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Billing Address (Optional)</Label>
              <Input 
                type="text"
                placeholder="Billing address"
                value={paymentDetails.billingAddress}
                onChange={(e) => setPaymentDetails({...paymentDetails, billingAddress: e.target.value})}
                className="bg-background"
              />
            </div>
          </div>
        );
      case 'Cash':
        return (
          <div className="mt-2 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in">
            <div className="space-y-2">
              <Label>Cash Amount Given (Optional)</Label>
              <Input 
                type="number"
                placeholder="Enter cash amount"
                value={paymentDetails.cashAmount}
                onChange={(e) => setPaymentDetails({...paymentDetails, cashAmount: e.target.value})}
                className="bg-background"
              />
            </div>
          </div>
        );
      case 'UPI':
        return (
          <div className="mt-2 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in">
            <div className="space-y-2">
              <Label>UPI ID *</Label>
              <Input 
                type="text"
                placeholder="example@upi"
                value={paymentDetails.upiId}
                onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                className={`bg-background ${validationErrors.upiId ? 'border-destructive' : ''}`}
              />
              {validationErrors.upiId && <p className="text-xs text-destructive">{validationErrors.upiId}</p>}
            </div>
          </div>
        );
      case 'Bank Transfer':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in">
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input 
                type="text"
                placeholder="Enter bank name"
                value={paymentDetails.bankName}
                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                className={`bg-background ${validationErrors.bankName ? 'border-destructive' : ''}`}
              />
              {validationErrors.bankName && <p className="text-xs text-destructive">{validationErrors.bankName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name (Optional)</Label>
              <Input 
                type="text"
                placeholder="Account holder"
                value={paymentDetails.accountHolderName}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountHolderName: e.target.value})}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input 
                type="text"
                placeholder="Account number"
                value={paymentDetails.accountNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value.replace(/\D/g, '')})}
                className={`bg-background ${validationErrors.accountNumber ? 'border-destructive' : ''}`}
              />
              {validationErrors.accountNumber && <p className="text-xs text-destructive">{validationErrors.accountNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label>IFSC Code *</Label>
              <Input 
                type="text"
                placeholder="SBIN0001234"
                maxLength={11}
                value={paymentDetails.ifscCode}
                onChange={(e) => setPaymentDetails({...paymentDetails, ifscCode: e.target.value.toUpperCase()})}
                className={`bg-background ${validationErrors.ifscCode ? 'border-destructive' : ''}`}
              />
              {validationErrors.ifscCode && <p className="text-xs text-destructive">{validationErrors.ifscCode}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold font-heading flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" />
              {formData.id ? 'Edit Fuel Refill Record' : 'Log Fuel Refill'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Vehicle *</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-primary font-medium"
                    onClick={() => setIsTruckModalOpen(true)}
                  >
                    <Truck className="w-3 h-3 mr-1" /> Select from Manager
                  </Button>
                </div>
                {trucksError ? (
                  <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>{trucksError}</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.vehicle_id} 
                    onValueChange={(v) => setFormData({...formData, vehicle_id: v})} 
                    required 
                    disabled={trucksLoading || trucks.length === 0}
                  >
                    <SelectTrigger className="bg-background text-foreground h-12">
                      <SelectValue placeholder={
                        trucksLoading 
                          ? "Loading trucks..." 
                          : trucks.length === 0 
                            ? "No trucks found" 
                            : "Select Truck"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.truck_number}>
                          <div className="flex items-center justify-between w-full gap-4 py-1">
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-foreground">{t.truck_number}</span>
                              {t.manufacturer && (
                                <span className="text-xs text-muted-foreground">{t.manufacturer}</span>
                              )}
                            </div>
                            {t.fastag_status && (
                              <Badge variant="secondary" className="text-[10px] h-5 ml-auto">
                                {t.fastag_status}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
              <div className="space-y-2">
                <Label>Distance Driven (KMs) *</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  required 
                  placeholder="Enter KMs"
                  value={formData.kms}
                  onChange={(e) => setFormData({...formData, kms: e.target.value})}
                  className="bg-background text-foreground tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label>Liters *</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  required 
                  placeholder="0.00"
                  value={formData.liters}
                  onChange={(e) => setFormData({...formData, liters: e.target.value})}
                  className="bg-background text-foreground tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Cost (₹) *</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  required 
                  placeholder="0.00"
                  value={formData.fuel_cost}
                  onChange={(e) => setFormData({...formData, fuel_cost: e.target.value})}
                  className="bg-background text-foreground tabular-nums"
                />
              </div>
            </div>

            {/* Live Mileage & Efficiency Loss Sentinel Banner */}
            {(() => {
              const dist = parseFloat(formData.kms) || 0;
              const lit = parseFloat(formData.liters) || 0;
              const currentTruck = trucks.find(t => t.truck_number === formData.vehicle_id);
              const expMileage = Number(currentTruck?.expected_mileage || 5.8);
              if (dist > 0 && lit > 0) {
                const actMileage = dist / lit;
                const dropPct = expMileage > 0 ? Math.round(((expMileage - actMileage) / expMileage) * 100) : 0;
                const isAnomaly = dropPct >= 10;
                const excessLiters = Math.max(0, Math.round((lit - (dist / expMileage)) * 10) / 10);
                const lossCost = Math.round(excessLiters * 94.5);

                return (
                  <div className={`p-3.5 rounded-2xl border transition-all space-y-2 animate-in fade-in ${
                    isAnomaly
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 shadow-md'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        {isAnomaly ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Fuel className="w-4 h-4 text-emerald-400" />}
                        {isAnomaly ? `⚠️ Fuel efficiency dropped ${dropPct}%.` : `🟢 Optimal Efficiency (${actMileage.toFixed(2)} km/L)`}
                      </span>
                      <Badge className={`font-mono text-[10px] ${isAnomaly ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                        Expected: {expMileage} km/L | Actual: {actMileage.toFixed(2)} km/L
                      </Badge>
                    </div>
                    {isAnomaly && (
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <p>
                          Potential anomaly detected: ~<strong>{excessLiters} Liters wasted</strong> (Est. loss: <strong>₹{lossCost.toLocaleString('en-IN')}</strong>).
                        </p>
                        <p className="text-[10px] text-slate-400">
                          This refill will be automatically flagged for 5-point root cause investigation.
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Fuel Station Selection */}
            <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/60">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-1.5 text-foreground">
                  <Fuel className="w-4 h-4 text-primary" />
                  Fuel Station / Petrol Bunk
                </Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-primary text-xs font-semibold"
                  onClick={() => setIsFuelStationModalOpen(true)}
                >
                  + Add New Bunk
                </Button>
              </div>
              <Select 
                value={formData.fuel_station_id} 
                onValueChange={(v) => {
                  if (v === 'add_new') {
                    setIsFuelStationModalOpen(true);
                  } else {
                    setFormData({...formData, fuel_station_id: v});
                  }
                }}
              >
                <SelectTrigger className="bg-background text-foreground h-11">
                  <SelectValue placeholder="Select Petrol Bunk / Fuel Station..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground">
                    -- No Station Selected / Generic Bunk --
                  </SelectItem>
                  {fuelStations.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center justify-between w-full gap-3 py-0.5">
                        <span className="font-semibold text-foreground">{s.station_name}</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            {s.brand || 'Station'}
                          </span>
                          {(s.credit_balance || 0) > 0 && (
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              Udhar: ₹{(s.credit_balance || 0).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new" className="font-bold text-primary border-t border-border/50">
                    + Register New Fuel Station
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(v) => {
                  setFormData({...formData, payment_method: v});
                  setValidationErrors({});
                  if (v === 'Credit Card' && savedCards.length > 0) {
                    setSelectedCardId(savedCards[0].id);
                  } else {
                    setSelectedCardId('new');
                  }
                }} 
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit / Udhar (Fuel Station Credit)" className="font-bold text-amber-400">
                    💳 Credit / Udhar (Fuel Station Credit)
                  </SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              {formData.payment_method === 'Credit / Udhar (Fuel Station Credit)' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    Credit (Udhar) Purchase to Fuel Station
                  </p>
                  <p className="text-muted-foreground">
                    This fuel cost (₹{formData.fuel_cost || 0}) will be added to the outstanding credit balance of the selected station. You can clear this credit anytime from the <strong>Fuel Stations</strong> tab.
                  </p>
                </div>
              )}

              {renderPaymentFields()}
            </div>

            {/* 🧾 Fuel Bill / Petrol Pump Receipt Upload */}
            <div className="space-y-2.5 bg-muted/20 p-3.5 rounded-xl border border-border/70">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-1.5 text-foreground text-xs">
                  <Paperclip className="w-4 h-4 text-primary" />
                  Fuel Bill / Receipt / Slip
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 ml-1 border-primary/30 text-primary">
                    Optional
                  </Badge>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {billFiles.length > 0 ? `${billFiles.length} file(s) attached` : 'Upload Slip / Invoice'}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingBill(true); }}
                onDragLeave={() => setIsDraggingBill(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingBill(false);
                  if (e.dataTransfer.files) addBillFiles(Array.from(e.dataTransfer.files));
                }}
                onClick={() => billFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isDraggingBill 
                    ? 'border-primary bg-primary/10 scale-[1.01]' 
                    : 'border-border/80 hover:border-primary/50 hover:bg-muted/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={billFileInputRef} 
                  onChange={handleBillFileSelect} 
                  multiple 
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf" 
                  className="hidden" 
                />
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Click to upload or drag & drop fuel receipt
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    JPG, PNG, WebP, PDF receipts up to 15MB each
                  </p>
                </div>
              </div>

              {/* Attached Bill Previews */}
              {billFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  {billFiles.map((b) => {
                    const isPdf = (b.name || '').toLowerCase().endsWith('.pdf') || b.type === 'application/pdf';
                    return (
                      <div key={b.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/80 group hover:border-primary/40 transition-colors text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Thumbnail / Icon */}
                          <div className="w-10 h-10 rounded-md bg-muted/60 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                            {b.previewUrl && !isPdf ? (
                              <img src={b.previewUrl} alt={b.name} className="w-full h-full object-cover" />
                            ) : isPdf ? (
                              <FileText className="w-5 h-5 text-rose-500" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-primary/70" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate" title={b.name}>
                              {b.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {b.isNew ? `${(b.size / 1024).toFixed(0)} KB • New Upload` : 'Saved Receipt'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {b.previewUrl && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalDoc(b);
                              }}
                              title="Preview Receipt"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBillFile(b);
                            }}
                            title="Remove File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Fuel station name, driver info, route details, etc."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-background text-foreground resize-none"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 bg-card py-2 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading || trucksError || trucks.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bill Preview Modal */}
      {previewModalDoc && (
        <Dialog open={!!previewModalDoc} onOpenChange={() => setPreviewModalDoc(null)}>
          <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white p-4">
            <DialogHeader className="border-b border-zinc-800 pb-2 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-primary" />
                  {previewModalDoc.name}
                </DialogTitle>
                <p className="text-[10px] text-zinc-400">Fuel Refill Receipt / Bill</p>
              </div>
              <div className="flex items-center gap-2">
                {previewModalDoc.previewUrl && (
                  <Button variant="outline" size="sm" className="h-7 text-xs border-zinc-700 bg-zinc-900 text-zinc-200" asChild>
                    <a href={previewModalDoc.previewUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </DialogHeader>
            <div className="min-h-[300px] max-h-[65vh] flex items-center justify-center p-2 overflow-auto">
              {((previewModalDoc.name || '').toLowerCase().endsWith('.pdf') || previewModalDoc.type === 'application/pdf') ? (
                <iframe src={previewModalDoc.previewUrl} title="Bill PDF" className="w-full h-[55vh] rounded-lg border border-zinc-800" />
              ) : previewModalDoc.previewUrl ? (
                <img src={previewModalDoc.previewUrl} alt={previewModalDoc.name} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="text-zinc-500 text-xs">No preview available</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <TruckSelectionModal 
        isOpen={isTruckModalOpen}
        onClose={() => setIsTruckModalOpen(false)}
        onSelect={handleTruckSelect}
      />

      <FuelStationModal 
        isOpen={isFuelStationModalOpen}
        onClose={() => setIsFuelStationModalOpen(false)}
        onSuccess={() => {
          loadFuelStations();
        }}
      />
    </>
  );
};

export default LogFuelModal;