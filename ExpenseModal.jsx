import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, Truck, Receipt, Calendar, FileText, Users, AlertCircle, 
  UploadCloud, Clock, Hash, Building2, Landmark, CheckCircle2, ShieldCheck,
  ChevronDown, ChevronUp, AlertTriangle, Sparkles
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import AdvanceIntegrationService from '@/lib/AdvanceIntegrationService.js';
import { recordTollDeduction } from '@/lib/fastagDeductionUtils.js';
import DocumentFilePreview from './DocumentFilePreview.jsx';
import { generateExpenseFileName } from '@/lib/fileNamingUtils.js';
import apiServerClient from '@/lib/apiServerClient.js';

export default function ExpenseModal({ isOpen, onClose, expense, onSuccess, trucks: propTrucks }) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trucks, setTrucks] = useState(propTrucks || []);
  const [creditCards, setCreditCards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  
  // Collapsible section states for clean progressive disclosure
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    payment: true,
    allocation: true
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [formData, setFormData] = useState({
    // Section A: Transaction Details
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    amount: '',
    category: 'Regular',
    subcategory: 'Maintenance',
    description: '',
    status: 'Approved',

    // Section B: Payment Details (All optional)
    payment_method: 'Cash',
    cash_source: 'Office Cash',
    cash_voucher_no: '',
    upi_app: 'PhonePe',
    bank_transfer_type: 'NEFT',
    reference_number: '',
    payment_account: '',
    beneficiary_name: '',
    cheque_date: '',
    issuing_bank: '',
    card_auth_code: '',
    fleet_provider: '',

    // Section C: Business Allocation (All optional)
    truck_id: 'none',
    credit_card_id: 'none',
    employee_id: 'none',
    vendor_name: '',
    bill_number: '',
    emi_principal: '',
    emi_interest: '',
    emi_charges: '',
    user_notes: ''
  });

  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [newReceiptFiles, setNewReceiptFiles] = useState([]);
  const [existingReceiptFiles, setExistingReceiptFiles] = useState([]);
  const [deletedReceiptFiles, setDeletedReceiptFiles] = useState([]);
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const receiptFileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Warm up backend
      fetch('/hcgi/api/health').catch(() => {});

      if (!propTrucks || propTrucks.length === 0) {
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false })
          .then(setTrucks)
          .catch(err => console.error('Failed to fetch trucks:', err));
      }
      
      pb.collection('credit_cards').getFullList({ 
        filter: `user_id = "${currentUser?.id}"`,
        $autoCancel: false 
      })
      .then(setCreditCards)
      .catch(err => console.error('Failed to fetch credit cards:', err));

      pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false })
        .then(setEmployees)
        .catch(err => console.error('Failed to fetch employees:', err));

      // Fetch recent 100 expenses for duplicate reference checking
      pb.collection('expenses').getList(1, 100, { sort: '-date', $autoCancel: false })
        .then(res => setRecentExpenses(res?.items || []))
        .catch(() => {});
    }
  }, [isOpen, propTrucks, currentUser?.id]);

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Parse metadata JSON from notes if present
        let parsedMeta = {};
        let rawUserNotes = expense.notes || '';
        if (expense.notes && expense.notes.includes('<!-- META_JSON:')) {
          try {
            const raw = expense.notes.split('<!-- META_JSON:')[1].split('-->')[0];
            parsedMeta = JSON.parse(raw);
            rawUserNotes = expense.notes.replace(/<!-- META_JSON:[\s\S]*?-->/g, '').replace(/<!-- BILLS_JSON:[\s\S]*?-->/g, '').trim();
          } catch (_) {}
        } else if (expense.notes) {
          rawUserNotes = expense.notes.replace(/<!-- BILLS_JSON:[\s\S]*?-->/g, '').trim();
          const match = expense.notes.match(/(?:UTR|RRN|Ref|Voucher)[:\s]+([A-Za-z0-9_-]+)/i);
          if (match) parsedMeta.reference_number = match[1];
        }

        const dateVal = expense.date ? expense.date.split(/[ T]/)[0] : new Date().toISOString().split('T')[0];
        let timeVal = new Date().toTimeString().slice(0, 5);
        if (expense.date && expense.date.includes('T')) {
          const tPart = expense.date.split('T')[1];
          if (tPart) timeVal = tPart.slice(0, 5);
        }

        setFormData({
          date: dateVal,
          time: timeVal,
          amount: expense.amount !== undefined && expense.amount !== null ? expense.amount : '',
          category: expense.category || 'Regular',
          subcategory: expense.subcategory || 'Maintenance',
          description: expense.description || '',
          status: expense.status || 'Approved',

          payment_method: expense.payment_method || 'Cash',
          cash_source: parsedMeta.cash_source || 'Office Cash',
          cash_voucher_no: parsedMeta.cash_voucher_no || '',
          upi_app: parsedMeta.upi_app || 'PhonePe',
          bank_transfer_type: parsedMeta.bank_transfer_type || 'NEFT',
          reference_number: parsedMeta.reference_number || '',
          payment_account: parsedMeta.payment_account || '',
          beneficiary_name: parsedMeta.beneficiary_name || '',
          cheque_date: parsedMeta.cheque_date || '',
          issuing_bank: parsedMeta.issuing_bank || '',
          card_auth_code: parsedMeta.card_auth_code || '',
          fleet_provider: parsedMeta.fleet_provider || '',

          truck_id: expense.truck_id || 'none',
          credit_card_id: expense.credit_card_id || 'none',
          employee_id: expense.employee_id || 'none',
          vendor_name: parsedMeta.vendor_name || '',
          bill_number: parsedMeta.bill_number || '',
          emi_principal: parsedMeta.emi_principal || '',
          emi_interest: parsedMeta.emi_interest || '',
          emi_charges: parsedMeta.emi_charges || '',
          user_notes: rawUserNotes
        });

        setExistingFiles(expense.documents || []);
        setNewFiles([]);
        setDeletedFiles([]);
        setExistingReceiptFiles(expense.image_urls || []);
        setNewReceiptFiles([]);
        setDeletedReceiptFiles([]);
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          amount: '',
          category: 'Regular',
          subcategory: 'Maintenance',
          description: '',
          status: 'Approved',

          payment_method: 'Cash',
          cash_source: 'Office Cash',
          cash_voucher_no: '',
          upi_app: 'PhonePe',
          bank_transfer_type: 'NEFT',
          reference_number: '',
          payment_account: '',
          beneficiary_name: '',
          cheque_date: '',
          issuing_bank: '',
          card_auth_code: '',
          fleet_provider: '',

          truck_id: 'none',
          credit_card_id: 'none',
          employee_id: 'none',
          vendor_name: '',
          bill_number: '',
          emi_principal: '',
          emi_interest: '',
          emi_charges: '',
          user_notes: ''
        });

        setExistingFiles([]);
        setNewFiles([]);
        setDeletedFiles([]);
        setExistingReceiptFiles([]);
        setNewReceiptFiles([]);
        setDeletedReceiptFiles([]);
      }
    }
  }, [isOpen, expense]);

  // Real-time non-blocking duplicate reference detection
  const duplicateMatch = useMemo(() => {
    const ref = formData.reference_number?.trim();
    if (!ref || ref.length < 4) return null;
    const match = recentExpenses.find(e => {
      if (expense && e.id === expense.id) return false;
      const notes = (e.notes || '').toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const refLower = ref.toLowerCase();
      return notes.includes(refLower) || desc.includes(refLower);
    });
    return match || null;
  }, [formData.reference_number, recentExpenses, expense]);

  const handleGenerateVoucher = () => {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, cash_voucher_no: `VCH-${ym}-${rand}` }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (filesList) => {
    const validFiles = [];
    for (const file of filesList) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      const total = newFiles.length + existingFiles.length - deletedFiles.length + validFiles.length;
      if (total > 10) {
        toast.error("Maximum 10 documents allowed.");
        return;
      }
      setNewFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemoveFile = (fileToRemove, isNew) => {
    if (isNew) {
      setNewFiles(prev => prev.filter(f => f !== fileToRemove));
    } else {
      setDeletedFiles(prev => [...prev, fileToRemove]);
      setExistingFiles(prev => prev.filter(f => f !== fileToRemove));
    }
  };

  const handleReceiptFileSelect = (e) => {
    if (e.target.files) addReceiptFiles(Array.from(e.target.files));
  };

  const addReceiptFiles = (filesList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const validFiles = [];
    for (const file of filesList) {
      if (!validTypes.includes(file.type)) {
        toast.error(`File "${file.name}" is not a supported image format.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      const total = newReceiptFiles.length + existingReceiptFiles.length - deletedReceiptFiles.length + validFiles.length;
      if (total > 10) {
        toast.error("Maximum 10 receipts allowed.");
        return;
      }
      setNewReceiptFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleReceiptDrop = (e) => {
    e.preventDefault();
    setIsDraggingReceipt(false);
    if (e.dataTransfer.files) addReceiptFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemoveReceipt = (fileToRemove, isNew) => {
    if (isNew) {
      setNewReceiptFiles(prev => prev.filter(f => f !== fileToRemove));
    } else {
      setDeletedReceiptFiles(prev => [...prev, fileToRemove]);
      setExistingReceiptFiles(prev => prev.filter(f => f !== fileToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const withTimeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. The server may be warming up — please retry.')), ms))
    ]);

    const slowTimer = setTimeout(() => {
      toast.loading('Saving expense...', { id: 'expense-saving', duration: 90000 });
    }, 4000);

    try {
      if (formData.category === 'Employee' && (!formData.employee_id || formData.employee_id === 'none')) {
        toast.error('Please select an employee for this expense.');
        setIsLoading(false);
        clearTimeout(slowTimer);
        toast.dismiss('expense-saving');
        return;
      }

      // Assemble structured metadata object
      const meta = {
        time: formData.time || undefined,
        payment_status: formData.status || 'Approved',
        reference_number: formData.reference_number?.trim() || undefined,
        cash_source: formData.payment_method === 'Cash' ? formData.cash_source : undefined,
        cash_voucher_no: formData.payment_method === 'Cash' ? formData.cash_voucher_no?.trim() : undefined,
        upi_app: formData.payment_method === 'UPI' ? formData.upi_app : undefined,
        bank_transfer_type: ['Bank Transfer', 'NEFT', 'RTGS', 'IMPS'].includes(formData.payment_method) ? formData.bank_transfer_type : undefined,
        payment_account: formData.payment_account?.trim() || undefined,
        beneficiary_name: formData.beneficiary_name?.trim() || undefined,
        cheque_date: formData.payment_method === 'Cheque' ? formData.cheque_date : undefined,
        issuing_bank: formData.payment_method === 'Cheque' ? formData.issuing_bank?.trim() : undefined,
        card_auth_code: formData.card_auth_code?.trim() || undefined,
        fleet_provider: formData.fleet_provider?.trim() || undefined,
        vendor_name: formData.vendor_name?.trim() || undefined,
        bill_number: formData.bill_number?.trim() || undefined,
        emi_principal: formData.category === 'EMI' && formData.emi_principal ? Number(formData.emi_principal) : undefined,
        emi_interest: formData.category === 'EMI' && formData.emi_interest ? Number(formData.emi_interest) : undefined,
        emi_charges: formData.category === 'EMI' && formData.emi_charges ? Number(formData.emi_charges) : undefined
      };

      const cleanMeta = Object.fromEntries(Object.entries(meta).filter(([_, v]) => v !== undefined && v !== ''));
      let metaTag = '';
      if (Object.keys(cleanMeta).length > 0) {
        metaTag = `<!-- META_JSON:${JSON.stringify(cleanMeta)} -->\n`;
      }

      let baseNotes = (formData.user_notes || '').trim();
      if (expense?.notes && expense.notes.includes('<!-- BILLS_JSON:')) {
        const billsJsonPart = '<!-- BILLS_JSON:' + expense.notes.split('<!-- BILLS_JSON:')[1];
        baseNotes = (baseNotes ? baseNotes + '\n' : '') + billsJsonPart;
      }
      const finalNotes = (metaTag + baseNotes).trim();

      const timeSuffix = formData.time ? `${formData.time}:00.000Z` : '12:00:00.000Z';
      const dateISO = formData.date.includes('T') ? formData.date : `${formData.date}T${timeSuffix}`;

      const payload = {
        amount: Number(formData.amount),
        date: dateISO,
        category: formData.category,
        subcategory: formData.subcategory || '',
        description: formData.description || '',
        payment_method: formData.payment_method,
        status: formData.status || 'Approved',
        truck_id: formData.truck_id === 'none' ? '' : formData.truck_id,
        credit_card_id: formData.credit_card_id === 'none' ? '' : formData.credit_card_id,
        employee_id: formData.employee_id === 'none' ? '' : formData.employee_id,
        notes: finalNotes,
        created_by: currentUser?.id || 'system'
      };

      if (payload.category !== 'Regular' && payload.category !== 'Employee' && payload.category !== 'EMI') {
        payload.subcategory = '';
      }

      const cashCategory = payload.category === 'Regular' && payload.subcategory 
        ? `Regular - ${payload.subcategory}` 
        : payload.category;

      let record = null;
      let saved = false;

      // Step 1: Try backend superuser API if no binary files attached
      if (newFiles.length === 0 && newReceiptFiles.length === 0) {
        try {
          const endpoint = expense ? `/driver/update-expense/${expense.id}` : '/driver/create-expense';
          const apiRes = await withTimeout(apiServerClient.fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }), 90000);

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.success && apiData.record) {
              record = apiData.record;
              saved = true;
            }
          }
        } catch (apiErr) {
          console.warn('Backend expense API note, falling back to PocketBase SDK direct:', apiErr.message);
        }
      }

      // Step 2: PocketBase SDK direct fallback
      if (!saved) {
        const formDataToSend = new FormData();
        formDataToSend.append('date', dateISO);
        formDataToSend.append('amount', String(payload.amount));
        formDataToSend.append('category', payload.category);
        formDataToSend.append('subcategory', payload.subcategory);
        formDataToSend.append('description', payload.description);
        formDataToSend.append('payment_method', payload.payment_method);
        formDataToSend.append('status', payload.status);
        formDataToSend.append('truck_id', payload.truck_id);
        formDataToSend.append('credit_card_id', payload.credit_card_id);
        if (payload.employee_id) formDataToSend.append('employee_id', payload.employee_id);
        if (finalNotes) formDataToSend.append('notes', finalNotes);

        const selectedTruck = trucks.find(t => t.id === payload.truck_id);
        const truckNum = selectedTruck?.truck_number || '';
        const expIdVal = expense?.id || `EX_${Date.now().toString(36).toUpperCase()}`;

        newFiles.forEach((file) => {
          const renamed = generateExpenseFileName(file, payload.category, expIdVal, truckNum);
          formDataToSend.append('documents', renamed);
        });
        newReceiptFiles.forEach((file) => {
          const renamed = generateExpenseFileName(file, `${payload.category}_RECEIPT`, expIdVal, truckNum);
          formDataToSend.append('image_urls', renamed);
        });

        if (expense) {
          deletedFiles.forEach((filename) => formDataToSend.append('documents.' + filename, ''));
          deletedReceiptFiles.forEach((filename) => formDataToSend.append('image_urls.' + filename, ''));
          record = await withTimeout(pb.collection('expenses').update(expense.id, formDataToSend, { $autoCancel: false }), 90000);
        } else {
          if (currentUser?.id) formDataToSend.append('created_by', currentUser.id);
          record = await withTimeout(pb.collection('expenses').create(formDataToSend, { $autoCancel: false }), 90000);
        }
      }

      // Step 3: Synchronize Cashbook entry with reference details
      if (record) {
        try {
          const refDetail = formData.reference_number?.trim() ? ` [Ref: ${formData.reference_number.trim()}]` : '';
          const cashPayload = {
            date: dateISO,
            description: `${payload.description || `Expense (${cashCategory})`}${refDetail}`,
            amount: Number(payload.amount),
            transaction_type: 'Expense',
            category: cashCategory,
            reference_id: record.id,
            reference_type: 'expense',
            status: 'Completed',
            added_by: currentUser?.id || ''
          };

          const cashbookEntries = await pb.collection('cashbook').getFullList({
            filter: `reference_id="${record.id}"`,
            $autoCancel: false
          }).catch(() => []);

          if (cashbookEntries && cashbookEntries.length > 0) {
            await pb.collection('cashbook').update(cashbookEntries[0].id, cashPayload, { $autoCancel: false });
          } else {
            await pb.collection('cashbook').create(cashPayload, { $autoCancel: false });
          }
        } catch (syncErr) {
          console.error('Failed to sync cashbook entry:', syncErr);
        }

        // Auto-link Employee Advance to Payroll
        if (payload.category === 'Employee' && payload.subcategory === 'Employee Advance') {
          const empName = employees.find(e => e.id === payload.employee_id)?.name || 'Employee';
          await AdvanceIntegrationService.createAdvanceFromExpense({
            employee_id: payload.employee_id,
            amount: payload.amount,
            date: dateISO,
            description: payload.description,
            expense_id: record.id
          });
          toast.success(`Advance record automatically created for ${empName}`);
        } else if (
          payload.subcategory === 'Toll / FASTag' ||
          payload.subcategory === 'Toll' ||
          payload.payment_method === 'FASTag' ||
          /toll|fastag/i.test(payload.category || '') ||
          /toll|fastag/i.test(payload.subcategory || '')
        ) {
          // FASTag wallet recharge integration
          try {
            let targetTruck = null;
            if (payload.truck_id && payload.truck_id !== 'none') {
              targetTruck = trucks.find(t => t.id === payload.truck_id || t.truck_number === payload.truck_id);
            }
            if (targetTruck) {
              const currentBal = Number(targetTruck.current_fastag_balance) || 0;
              const newBal = currentBal + Number(payload.amount);
              await pb.collection('trucks').update(targetTruck.id, {
                current_fastag_balance: newBal,
                last_recharge_date: dateISO,
                last_recharge_amount: Number(payload.amount)
              }, { $autoCancel: false });

              await pb.collection('fastag_recharges').create({
                truck_id: targetTruck.id,
                recharge_date: dateISO,
                recharge_amount: Number(payload.amount),
                payment_method: payload.payment_method || 'Cash',
                reference_number: formData.reference_number || '',
                notes: payload.description || 'FASTag Recharge from Expense Manager'
              }, { $autoCancel: false });

              toast.success(`₹${payload.amount.toLocaleString('en-IN')} added to ${targetTruck.truck_number}'s FASTag balance!`);
            } else {
              toast.success('Toll expense recorded successfully');
            }
          } catch (fastagErr) {
            console.error('FASTag balance sync notice:', fastagErr);
            toast.success('Expense recorded successfully');
          }
        } else {
          toast.success('Expense recorded successfully');
        }
      }

      clearTimeout(slowTimer);
      toast.dismiss('expense-saving');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      clearTimeout(slowTimer);
      toast.dismiss('expense-saving');
      console.error('Expense save error:', err);
      const errMsg = err?.data?.message || err?.response?.data?.message || err?.message || 'Unknown error';
      toast.error(`Failed to save expense: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setIsLoading(true);
    try {
      const cashbookEntries = await pb.collection('cashbook').getFullList({
        filter: `reference_id="${expense.id}"`,
        $autoCancel: false
      });
      for (const entry of cashbookEntries) {
        await pb.collection('cashbook').delete(entry.id, { $autoCancel: false });
      }
      await pb.collection('expenses').delete(expense.id, { $autoCancel: false });
      toast.success('Expense deleted successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl h-9 text-xs px-3";
  const selectTriggerClass = "bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-9 text-xs px-3";

  // Dynamic reference labels and placeholders
  const getReferenceConfig = () => {
    switch (formData.payment_method) {
      case 'UPI':
        return {
          label: 'UPI Reference Number / 12-Digit RRN (Optional)',
          placeholder: 'e.g. 428519283741 or PhonePe Txn ID',
          helper: '12-digit transaction RRN found on GPay, PhonePe, or Paytm receipt'
        };
      case 'Bank Transfer':
        return {
          label: 'Bank UTR / Reference Number (Optional)',
          placeholder: 'e.g. HDFC24285192837 or NEFT / RTGS / IMPS UTR',
          helper: 'Unique Transaction Reference number from bank statement'
        };
      case 'Cheque':
        return {
          label: 'Cheque Number (Optional)',
          placeholder: 'e.g. 004521 (6-digit Cheque No)',
          helper: 'Cheque leaf number drawn from issuing bank'
        };
      case 'Cash':
        return {
          label: 'Cash Voucher Number (Optional)',
          placeholder: 'e.g. VCH-202610-001 (Leave blank or auto-generate)',
          helper: 'Internal petty cash or office voucher number'
        };
      case 'Credit Card':
      case 'Card':
        return {
          label: 'Card Transaction Reference / Slip No (Optional)',
          placeholder: 'e.g. AUTH-4821 or POS Slip Number',
          helper: 'Card machine approval code or statement reference'
        };
      case 'FASTag / Fleet Card':
        return {
          label: 'FASTag / Fuel Slip Reference (Optional)',
          placeholder: 'e.g. TOLL-7821 or HPCL Slip Number',
          helper: 'Toll barrier transaction ID or diesel slip number'
        };
      default:
        return {
          label: 'Payment Reference Number (Optional)',
          placeholder: 'Reference / Receipt Number',
          helper: 'Optional payment identifier'
        };
    }
  };

  const refConfig = getReferenceConfig();

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[90vh] rounded-[2rem] p-4 sm:p-6 shadow-2xl bg-card border-border/50 flex flex-col overflow-hidden gap-0">
        
        {/* Modal Header */}
        <DialogHeader className="mb-3 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-2xl text-primary shadow-inner">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span>{expense ? 'Edit Expense Record' : 'Record Business Expense'}</span>
                <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                  Organized into 3 sections. Only basic details are required; all reference & allocation fields are optional.
                </p>
              </div>
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 space-y-4">

            {/* ══════════════════════════════════════════════════════════════════
                SECTION A: TRANSACTION DETAILS (CORE FIELDS)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-4 transition-all">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-border/40"
                onClick={() => toggleSection('details')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-black flex items-center justify-center border border-blue-500/20">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      Expense Details <span className="text-primary text-[10px] lowercase font-normal">(required)</span>
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">Amount, Date, Category & Description</span>
                  {expandedSections.details ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedSections.details && (
                <div className="space-y-4 pt-1">
                  {/* Amount Prominent Box */}
                  <div className="bg-background/80 p-3.5 rounded-2xl border border-primary/20 shadow-inner">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[10px] font-bold text-primary uppercase tracking-wider ml-1">Total Expense Amount</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">Indian Rupees (₹)</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-primary">₹</span>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={formData.amount} 
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                        required 
                        placeholder="0.00"
                        className="bg-card border-border/60 focus-visible:ring-primary/40 rounded-xl h-12 text-2xl font-black pl-9 tabular-nums text-foreground shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Date, Time & Main Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                        required 
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Time <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input 
                        type="time" 
                        value={formData.time} 
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Main Category <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(v) => {
                          const updates = { category: v };
                          if (v === 'Employee') {
                            updates.subcategory = 'Employee Advance';
                          } else if (v === 'Regular') {
                            updates.subcategory = 'Maintenance';
                          } else if (v === 'EMI') {
                            updates.subcategory = 'Vehicle Loan EMI';
                          } else {
                            updates.subcategory = '';
                          }
                          setFormData({ ...formData, ...updates });
                        }}
                      >
                        <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Regular" className="text-xs">Regular Fleet Expense</SelectItem>
                          <SelectItem value="Employee" className="text-xs">Employee / Driver Expense</SelectItem>
                          <SelectItem value="EMI" className="text-xs">Vehicle / Loan EMI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subcategory & Payment Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1">Subcategory</Label>
                      <Select 
                        value={formData.subcategory} 
                        onValueChange={(v) => setFormData({ ...formData, subcategory: v })}
                      >
                        <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {formData.category === 'Regular' ? (
                            <>
                              <SelectItem value="Fuel" className="text-xs">Fuel (Diesel / AdBlue)</SelectItem>
                              <SelectItem value="Toll" className="text-xs">FASTag - Toll Recharge</SelectItem>
                              <SelectItem value="Maintenance" className="text-xs">Vehicle Maintenance & Repairs</SelectItem>
                              <SelectItem value="Miscellaneous" className="text-xs">Miscellaneous</SelectItem>
                              <SelectItem value="Insurance" className="text-xs">Insurance</SelectItem>
                              <SelectItem value="Utilities" className="text-xs">Utilities & Office</SelectItem>
                              <SelectItem value="Other" className="text-xs">All Other Expenses</SelectItem>
                            </>
                          ) : formData.category === 'Employee' ? (
                            <>
                              <SelectItem value="Employee Advance" className="text-xs">Driver / Employee Advance</SelectItem>
                              <SelectItem value="Salary" className="text-xs">Salary Disbursement</SelectItem>
                              <SelectItem value="Reimbursement" className="text-xs">Driver Trip Reimbursement</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Vehicle Loan EMI" className="text-xs">Truck Finance EMI</SelectItem>
                              <SelectItem value="Equipment EMI" className="text-xs">Equipment / Asset EMI</SelectItem>
                              <SelectItem value="Other EMI" className="text-xs">Other Loan Repayment</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1">Payment Status <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Approved" className="text-xs">Completed / Paid</SelectItem>
                          <SelectItem value="Pending" className="text-xs">Pending Clearance</SelectItem>
                          <SelectItem value="Partially Paid" className="text-xs">Partially Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Context Banners for Special Categories */}
                  {formData.category === 'Employee' && formData.subcategory === 'Employee Advance' && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex gap-2 text-amber-400 text-xs animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        <strong>Driver Advance:</strong> Saving this will automatically create a pending advance record in the Driver Payroll module.
                      </p>
                    </div>
                  )}

                  {formData.category === 'Regular' && (formData.subcategory === 'Toll' || formData.subcategory === 'FASTag') && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl flex gap-2 text-blue-400 text-xs animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        <strong>FASTag Recharge:</strong> This will automatically top-up the selected truck's FASTag wallet balance and record a recharge log.
                      </p>
                    </div>
                  )}

                  {/* Description (Required) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Description <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      placeholder="What was this expense for? (e.g., Tyre puncture repair near Pune bypass)" 
                      required 
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>


            {/* ══════════════════════════════════════════════════════════════════
                SECTION B: PAYMENT DETAILS & PROOF (ADAPTIVE & OPTIONAL)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-4 transition-all">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-border/40"
                onClick={() => toggleSection('payment')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/20">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      Payment Details & Proof
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    All fields optional
                  </span>
                  {expandedSections.payment ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedSections.payment && (
                <div className="space-y-4 pt-1">
                  
                  {/* Payment Mode Selector & Sub-Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-muted-foreground" /> Payment Mode
                      </Label>
                      <Select 
                        value={formData.payment_method} 
                        onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                      >
                        <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Cash" className="text-xs">💵 Cash (Office / Yard / Driver Cash)</SelectItem>
                          <SelectItem value="UPI" className="text-xs">📱 UPI (PhonePe / GPay / Paytm / BHIM)</SelectItem>
                          <SelectItem value="Bank Transfer" className="text-xs">🏦 Bank Transfer (NEFT / RTGS / IMPS)</SelectItem>
                          <SelectItem value="Credit Card" className="text-xs">💳 Corporate Credit Card</SelectItem>
                          <SelectItem value="Card" className="text-xs">💳 Debit Card / POS</SelectItem>
                          <SelectItem value="Cheque" className="text-xs">📄 Cheque / Demand Draft</SelectItem>
                          <SelectItem value="FASTag / Fleet Card" className="text-xs">⛽ FASTag / Fleet Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Adaptive Sub-Method Field */}
                    {formData.payment_method === 'Cash' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1 flex items-center justify-between">
                          <span>Cash Source <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></span>
                        </Label>
                        <Select 
                          value={formData.cash_source} 
                          onValueChange={(v) => setFormData({ ...formData, cash_source: v })}
                        >
                          <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Office Cash" className="text-xs">Office Cash Box</SelectItem>
                            <SelectItem value="Yard Cash" className="text-xs">Yard Petty Cash</SelectItem>
                            <SelectItem value="Driver Cash" className="text-xs">Driver Float / In-Transit Cash</SelectItem>
                            <SelectItem value="Other Cash" className="text-xs">Other Cash Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.payment_method === 'UPI' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1">
                          UPI Application <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Select 
                          value={formData.upi_app} 
                          onValueChange={(v) => setFormData({ ...formData, upi_app: v })}
                        >
                          <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="PhonePe" className="text-xs">PhonePe</SelectItem>
                            <SelectItem value="Google Pay" className="text-xs">Google Pay (GPay)</SelectItem>
                            <SelectItem value="Paytm" className="text-xs">Paytm</SelectItem>
                            <SelectItem value="BHIM" className="text-xs">BHIM UPI</SelectItem>
                            <SelectItem value="Bank UPI" className="text-xs">Direct Bank App UPI</SelectItem>
                            <SelectItem value="Other UPI" className="text-xs">Other UPI App</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {['Bank Transfer', 'NEFT', 'RTGS', 'IMPS'].includes(formData.payment_method) && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1">
                          Transfer Method <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Select 
                          value={formData.bank_transfer_type} 
                          onValueChange={(v) => setFormData({ ...formData, bank_transfer_type: v })}
                        >
                          <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="NEFT" className="text-xs">NEFT (National Electronic Fund)</SelectItem>
                            <SelectItem value="RTGS" className="text-xs">RTGS (Real Time Gross Settlement)</SelectItem>
                            <SelectItem value="IMPS" className="text-xs">IMPS (Instant Payment Service)</SelectItem>
                            <SelectItem value="Same-Bank" className="text-xs">Internal / Same-Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.payment_method === 'Credit Card' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1">
                          Linked Credit Card <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Select 
                          value={formData.credit_card_id} 
                          onValueChange={(v) => setFormData({ ...formData, credit_card_id: v })}
                        >
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Select Credit Card" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="none" className="text-xs">None / Generic Card</SelectItem>
                            {creditCards.map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                {c.bank_name} - {c.card_name} (**** {c.card_number_last4})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.payment_method === 'Cheque' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1">
                          Issuing Bank <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input 
                          value={formData.issuing_bank} 
                          onChange={(e) => setFormData({ ...formData, issuing_bank: e.target.value })} 
                          placeholder="e.g. State Bank of India, HDFC" 
                          className={inputClass}
                        />
                      </div>
                    )}

                    {formData.payment_method === 'FASTag / Fleet Card' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1">
                          Wallet / Provider <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input 
                          value={formData.fleet_provider} 
                          onChange={(e) => setFormData({ ...formData, fleet_provider: e.target.value })} 
                          placeholder="e.g. ICICI FASTag / HPCL DriveTrack" 
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic Reference Field with Optional Auto-Voucher */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" /> {refConfig.label}
                      </Label>
                      {formData.payment_method === 'Cash' && (
                        <button
                          type="button"
                          onClick={handleGenerateVoucher}
                          className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Generate Voucher No.
                        </button>
                      )}
                    </div>
                    <Input 
                      value={formData.reference_number} 
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} 
                      placeholder={refConfig.placeholder}
                      className={inputClass}
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">
                      {refConfig.helper}
                    </p>
                  </div>

                  {/* Duplicate Reference Warning Notice (Non-blocking) */}
                  {duplicateMatch && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-300 text-xs animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Possible Duplicate Reference:</span> Reference{' '}
                        <code className="font-mono bg-amber-500/20 px-1 rounded">{formData.reference_number}</code> was previously entered for{' '}
                        <strong>₹{duplicateMatch.amount}</strong> on{' '}
                        {duplicateMatch.date ? duplicateMatch.date.split('T')[0] : 'recent date'} ({duplicateMatch.description || 'Expense'}).
                        <p className="text-[11px] text-amber-200/80 mt-1">
                          You may still save if this is an intentional recurring charge.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Optional Bank Account & Beneficiary Name */}
                  {formData.payment_method !== 'Cash' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-muted-foreground" /> Sending Account / Bank <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input 
                          value={formData.payment_account} 
                          onChange={(e) => setFormData({ ...formData, payment_account: e.target.value })} 
                          placeholder="e.g. HDFC Current A/c •••• 1092" 
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" /> Payee / Beneficiary Name <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input 
                          value={formData.beneficiary_name} 
                          onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })} 
                          placeholder="e.g. Ashok Sharma / Shree Auto Garage" 
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* Document & Receipt Upload Zone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Bills / Documents */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1">Attach Bills / Documents (Optional)</Label>
                      <div 
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileSelect} 
                          multiple 
                          className="hidden" 
                          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                        <UploadCloud className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-medium">Drag & drop docs, or <span className="text-primary hover:underline">browse</span></p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PDF, DOC, DOCX up to 10MB each</p>
                      </div>

                      {(newFiles.length > 0 || existingFiles.length > 0) && (
                        <div className="space-y-1.5 mt-2 max-h-[110px] overflow-y-auto pr-1">
                          {existingFiles.map((file, idx) => (
                            <DocumentFilePreview
                              key={`existing-${idx}`}
                              file={file}
                              docRecord={expense}
                              onDelete={handleRemoveFile}
                              isNew={false}
                            />
                          ))}
                          {newFiles.map((file, idx) => (
                            <DocumentFilePreview
                              key={`new-${idx}`}
                              file={file}
                              onDelete={handleRemoveFile}
                              isNew={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Receipt Snapshots */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1">Attach Receipt / UPI Screenshot (Optional)</Label>
                      <div 
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                          isDraggingReceipt ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingReceipt(true); }}
                        onDragLeave={() => setIsDraggingReceipt(false)}
                        onDrop={handleReceiptDrop}
                        onClick={() => receiptFileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          ref={receiptFileInputRef} 
                          onChange={handleReceiptFileSelect} 
                          multiple 
                          className="hidden" 
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        />
                        <UploadCloud className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-medium">Drag & drop photos, or <span className="text-primary hover:underline">browse</span></p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, JPEG up to 5MB each</p>
                      </div>

                      {(newReceiptFiles.length > 0 || existingReceiptFiles.length > 0) && (
                        <div className="grid grid-cols-4 gap-2 mt-2 max-h-[110px] overflow-y-auto p-1">
                          {existingReceiptFiles.map((file, idx) => {
                            const url = pb.files.getUrl(expense, file);
                            return (
                              <div key={`existing-rec-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border shadow-sm bg-muted/40">
                                <img src={url} alt="receipt" className="object-cover w-full h-full" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReceipt(file, false)}
                                  className="absolute top-1 right-1 bg-black/70 hover:bg-destructive text-white rounded-full p-0.5 text-[8px] w-4 h-4 flex items-center justify-center transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                          {newReceiptFiles.map((file, idx) => {
                            const url = URL.createObjectURL(file);
                            return (
                              <div key={`new-rec-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border shadow-sm bg-muted/40 animate-in fade-in zoom-in duration-200">
                                <img src={url} alt="receipt" className="object-cover w-full h-full" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReceipt(file, true)}
                                  className="absolute top-1 right-1 bg-black/70 hover:bg-destructive text-white rounded-full p-0.5 text-[8px] w-4 h-4 flex items-center justify-center transition-colors"
                                >
                                  ✕
                                </button>
                                <span className="absolute bottom-1 left-1 bg-primary/85 text-primary-foreground text-[8px] px-1 rounded-full font-semibold">New</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>


            {/* ══════════════════════════════════════════════════════════════════
                SECTION C: BUSINESS ALLOCATION (100% OPTIONAL)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-4 transition-all">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-border/40"
                onClick={() => toggleSection('allocation')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-black flex items-center justify-center border border-amber-500/20">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      Business Allocation
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    All fields optional
                  </span>
                  {expandedSections.allocation ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedSections.allocation && (
                <div className="space-y-4 pt-1">
                  
                  {/* Truck & Employee Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Related Truck <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Select 
                        value={formData.truck_id} 
                        onValueChange={(v) => setFormData({ ...formData, truck_id: v })}
                      >
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder="Select Truck (Optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-[220px]">
                          <SelectItem value="none" className="text-xs">None / Not Vehicle Specific</SelectItem>
                          {trucks.map(t => (
                            <SelectItem key={t.id} value={t.id} className="text-xs font-mono font-bold">
                              {t.truck_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" /> Driver / Employee {formData.category === 'Employee' ? <span className="text-destructive">*</span> : <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>}
                      </Label>
                      <Select 
                        value={formData.employee_id} 
                        onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                      >
                        <SelectTrigger className={`${selectTriggerClass} ${formData.category === 'Employee' && formData.employee_id === 'none' ? 'ring-2 ring-destructive/50 border-destructive' : ''}`}>
                          <SelectValue placeholder="Select Employee (Optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-[220px]">
                          <SelectItem value="none" className="text-xs">None / Not Applicable</SelectItem>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id} className="text-xs">
                              {emp.name} {emp.employee_code ? `(${emp.employee_code})` : ''} {emp.position ? `- ${emp.position}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Vendor / Workshop & Bill Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Vendor / Workshop Name <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input 
                        value={formData.vendor_name} 
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} 
                        placeholder="e.g. MRF Tyres, Shree Auto Service, HPCL" 
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Vendor Bill / Invoice No. <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                      </Label>
                      <Input 
                        value={formData.bill_number} 
                        onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })} 
                        placeholder="e.g. INV-2026-904" 
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Loan EMI Principal / Interest Breakdown (Only when category is EMI) */}
                  {formData.category === 'EMI' && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          Loan EMI Segregation <span className="text-[10px] font-normal text-muted-foreground">(Optional)</span>
                        </Label>
                        <span className="text-[10px] text-muted-foreground">Ensures principal repayment is not miscounted as operational cost</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground ml-1">Principal (₹)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={formData.emi_principal}
                            onChange={(e) => setFormData({ ...formData, emi_principal: e.target.value })}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground ml-1">Interest (₹)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={formData.emi_interest}
                            onChange={(e) => setFormData({ ...formData, emi_interest: e.target.value })}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground ml-1">Bank Fees / Charges (₹)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={formData.emi_charges}
                            onChange={(e) => setFormData({ ...formData, emi_charges: e.target.value })}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Internal Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground ml-1">Additional Notes <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input 
                      value={formData.user_notes} 
                      onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })} 
                      placeholder="Any internal audit notes or remarks..." 
                      className={inputClass}
                    />
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Modal Sticky Footer */}
          <DialogFooter className="pt-3 border-t border-border/50 shrink-0 flex flex-col sm:flex-row gap-2 mt-2">
            {expense && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isLoading} 
                className="w-full sm:w-auto sm:mr-auto rounded-xl h-10 px-4 text-xs font-medium"
              >
                Delete Expense
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading} 
              className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-medium bg-muted/30 border-muted-foreground/20 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-auto rounded-xl h-10 px-6 text-xs font-semibold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Saving Record...' : expense ? 'Update Expense' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}