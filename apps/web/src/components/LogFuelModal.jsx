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
import { Loader2, AlertCircle, Truck, CreditCard, Fuel, Wallet } from 'lucide-react';
import TruckSelectionModal from '@/components/TruckSelectionModal.jsx';
import FuelStationModal from '@/components/FuelStationModal.jsx';
import { fetchFuelStations, addFuelStationCredit } from '@/lib/fuelStationUtils.js';

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

const LogFuelModal = ({ isOpen, onClose, onSuccess, savedCards = [], editLog = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trucksLoading, setTrucksLoading] = useState(false);
  const [trucksError, setTrucksError] = useState(null);
  const [trucks, setTrucks] = useState([]);
  
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

  useEffect(() => {
    if (isOpen) {
      fetchTrucks();
      loadFuelStations();
      if (editLog) {
        let rawDate = editLog.date;
        if (rawDate && rawDate.includes('T')) rawDate = rawDate.split('T')[0];
        if (rawDate && rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];

        const cost = (editLog.total_cost || editLog.fuel_cost || '').toString();
        setFormData({
          id: editLog.id,
          date: rawDate || format(new Date(), 'yyyy-MM-dd'),
          vehicle_id: editLog.truck_number || editLog.vehicle_name || '',
          kms: (editLog.distance || editLog.distance_driven || '').toString(),
          liters: (editLog.liters || '').toString(),
          fuel_cost: cost,
          notes: editLog.notes || '',
          payment_method: editLog.payment_method || 'Cash',
          fuel_station_id: editLog.fuel_station_id || 'none'
        });
        setCard1Amount(cost);
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
      setSelectedCardId(savedCards.length > 0 ? savedCards[0].id : 'new');
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
    }
  }, [isOpen, savedCards, editLog]);

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
      const records = await pb.collection('trucks').getList(1, 500, {
        sort: 'truck_number',
        $autoCancel: false
      });
      setTrucks(records.items || []);
    } catch (e) {
      console.error('Failed to fetch trucks:', e);
      setTrucksError('Failed to load trucks. You may not have access permissions.');
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
    
    if (!formData.vehicle_id) return toast.error('Vehicle is required');
    if (!formData.kms || parseFloat(formData.kms) <= 0) return toast.error('Valid Distance Driven (KMs) is required');
    if (!formData.liters || parseFloat(formData.liters) <= 0) return toast.error('Valid Liters is required');
    if (!formData.fuel_cost || parseFloat(formData.fuel_cost) <= 0) return toast.error('Valid Fuel Cost is required');

    if (!validatePaymentDetails()) {
      return toast.error('Please correct the payment details errors.');
    }

    const selectedTruck = trucks.find(t => t.truck_number === formData.vehicle_id);
    if (!selectedTruck || !selectedTruck.id) {
      return toast.error('Invalid truck selected. Could not find corresponding truck ID.');
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

      // Construct tracker payload carefully mapping to `fuel_tracker` schema
      const trackerPayload = {
        date: refillDate,
        truck_id: selectedTruck.id, // Relation uses ID, not truck_number
        truck_number: vehicleName,
        distance_driven: distanceDriven,
        liters: liters,
        total_cost: fuelCost,
        payment_method: formData.payment_method, // 'Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'
        notes: finalNotes
      };

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
        const existingExpenses = await pb.collection('expenses').getList(1, 1, {
          filter: `fuel_tracker_id = "${tracker.id}"`,
          $autoCancel: false
        });
        if (existingExpenses.items && existingExpenses.items.length > 0) {
          await pb.collection('expenses').update(existingExpenses.items[0].id, expensePayload, { $autoCancel: false });
        } else if (!formData.id) {
          await pb.collection('expenses').create(expensePayload, { $autoCancel: false });
        }
      } catch (e) {
        console.log('Linked expense update/creation note:', e?.message);
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
                      {savedCards.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.card_name} (****{c.card_number_last4}) - {c.bank_name}
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
                      {savedCards.filter(c => c.id !== selectedCardId).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.card_name} (****{c.card_number_last4}) - {c.bank_name}
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