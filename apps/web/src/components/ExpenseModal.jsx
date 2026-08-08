import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Truck, Receipt, Calendar, FileText, Users, AlertCircle, UploadCloud } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import AdvanceIntegrationService from '@/lib/AdvanceIntegrationService.js';
import { recordTollDeduction } from '@/lib/fastagDeductionUtils.js';
import DocumentFilePreview from './DocumentFilePreview.jsx';
import apiServerClient from '@/lib/apiServerClient.js';


export default function ExpenseModal({ isOpen, onClose, expense, onSuccess, trucks: propTrucks }) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trucks, setTrucks] = useState(propTrucks || []);
  const [creditCards, setCreditCards] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Regular',
    subcategory: 'Maintenance',
    description: '',
    payment_method: 'Cash',
    status: 'Approved',
    truck_id: 'none',
    credit_card_id: 'none',
    employee_id: 'none'
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
      // Silently wake up the backend server as soon as the modal opens.
      // Render free tier spins down after inactivity — this ping gives it
      // 30-60s to warm up while the user fills the form, so Save is instant.
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
    }
  }, [isOpen, propTrucks, currentUser?.id]);

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setFormData({
          date: expense.date ? expense.date.split(/[ T]/)[0] : new Date().toISOString().split('T')[0],
          amount: expense.amount !== undefined && expense.amount !== null ? expense.amount : '',
          category: expense.category || 'Regular',
          subcategory: expense.subcategory || 'Maintenance',
          description: expense.description || '',
          payment_method: expense.payment_method || 'Cash',
          status: expense.status || 'Approved',
          truck_id: expense.truck_id || 'none',
          credit_card_id: expense.credit_card_id || 'none',
          employee_id: expense.employee_id || 'none'
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
          amount: '',
          category: 'Regular',
          subcategory: 'Maintenance',
          description: '',
          payment_method: 'Cash',
          status: 'Approved',
          truck_id: 'none',
          credit_card_id: 'none',
          employee_id: 'none'
        });
        setExistingFiles([]);
        setNewFiles([]);
        setDeletedFiles([]);
        setExistingReceiptFiles([]);
        setNewReceiptFiles([]);
        setDeletedReceiptFiles([]);
      }
    }
  }, [isOpen]);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (filesList) => {
    const validFiles = [];
    for (const file of filesList) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const totalFilesCount = newFiles.length + existingFiles.length - deletedFiles.length + validFiles.length;
      if (totalFilesCount > 10) {
        toast.error("You can upload a maximum of 10 documents.");
        return;
      }
      setNewFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (fileToRemove, isNew) => {
    if (isNew) {
      setNewFiles((prev) => prev.filter((f) => f !== fileToRemove));
    } else {
      setDeletedFiles((prev) => [...prev, fileToRemove]);
      setExistingFiles((prev) => prev.filter((f) => f !== fileToRemove));
    }
  };

  const handleReceiptFileSelect = (e) => {
    if (e.target.files) {
      addReceiptFiles(Array.from(e.target.files));
    }
  };

  const addReceiptFiles = (filesList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const validFiles = [];

    for (const file of filesList) {
      if (!validTypes.includes(file.type)) {
        toast.error(`File "${file.name}" is not a valid image format. Only JPG, JPEG, and PNG are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const totalCount = newReceiptFiles.length + existingReceiptFiles.length - deletedReceiptFiles.length + validFiles.length;
      if (totalCount > 10) {
        toast.error("You can upload a maximum of 10 receipts.");
        return;
      }
      setNewReceiptFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleReceiptDrop = (e) => {
    e.preventDefault();
    setIsDraggingReceipt(false);
    if (e.dataTransfer.files) {
      addReceiptFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveReceipt = (fileToRemove, isNew) => {
    if (isNew) {
      setNewReceiptFiles((prev) => prev.filter((f) => f !== fileToRemove));
    } else {
      setDeletedReceiptFiles((prev) => [...prev, fileToRemove]);
      setExistingReceiptFiles((prev) => prev.filter((f) => f !== fileToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 90s timeout — Render free tier can take 30-50s on cold start
    const withTimeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. The server may be starting up — please try again in a moment.')), ms))
    ]);

    // Warn user after 5s that server may be waking up
    const slowTimer = setTimeout(() => {
      toast.loading('Server is waking up, please wait...', { id: 'expense-saving', duration: 90000 });
    }, 5000);

    try {
      if (formData.category === 'Employee' && (!formData.employee_id || formData.employee_id === 'none')) {
        toast.error('Please select an employee for this expense.');
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        truck_id: formData.truck_id === 'none' ? '' : formData.truck_id,
        credit_card_id: formData.credit_card_id === 'none' ? '' : formData.credit_card_id,
        employee_id: formData.employee_id === 'none' ? '' : formData.employee_id,
        created_by: currentUser?.id || '',
      };

      if (payload.category !== 'Regular' && payload.category !== 'Employee') {
        payload.subcategory = '';
      }

      const dateISO = payload.date.includes('T') ? payload.date : `${payload.date} 12:00:00.000Z`;
      const cashCategory = payload.category === 'Regular' && payload.subcategory 
        ? `Regular - ${payload.subcategory}` 
        : payload.category;

      let record = null;
      let saved = false;

      // Step 1: Try backend API (superuser) if no binary files attached
      if (newFiles.length === 0 && newReceiptFiles.length === 0) {
        try {
          const endpoint = expense ? `/driver/update-expense/${expense.id}` : '/driver/create-expense';
          const apiRes = await withTimeout(apiServerClient.fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, date: dateISO })
          }), 90000);

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.success && apiData.record) {
              record = apiData.record;
              saved = true;
            }
          }
        } catch (apiErr) {
          console.warn('Backend expense API notice, trying SDK direct:', apiErr.message);
        }
      }

      // Step 2: Fallback to PocketBase SDK directly
      if (!saved) {
        const formDataToSend = new FormData();
        formDataToSend.append('date', dateISO);
        formDataToSend.append('amount', String(payload.amount));
        formDataToSend.append('category', payload.category);
        formDataToSend.append('subcategory', payload.subcategory);
        formDataToSend.append('description', payload.description || '');
        formDataToSend.append('payment_method', payload.payment_method);
        formDataToSend.append('status', payload.status);
        formDataToSend.append('truck_id', payload.truck_id);
        formDataToSend.append('credit_card_id', payload.credit_card_id);
        formDataToSend.append('employee_id', payload.employee_id);

        newFiles.forEach((file) => formDataToSend.append('documents', file));
        newReceiptFiles.forEach((file) => formDataToSend.append('image_urls', file));

        if (expense) {
          deletedFiles.forEach((filename) => formDataToSend.append('documents.' + filename, ''));
          deletedReceiptFiles.forEach((filename) => formDataToSend.append('image_urls.' + filename, ''));
          record = await withTimeout(pb.collection('expenses').update(expense.id, formDataToSend, { $autoCancel: false }), 90000);
        } else {
          if (currentUser?.id) formDataToSend.append('created_by', currentUser.id);
          record = await withTimeout(pb.collection('expenses').create(formDataToSend, { $autoCancel: false }), 90000);
        }
      }

      // Sync matching Cashbook Entry
      if (record) {
        try {
          const cashPayload = {
            date: dateISO,
            description: payload.description || `Expense (${cashCategory})`,
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

        const isTollExpense = payload.subcategory === 'Toll / FASTag' ||
          payload.payment_method === 'FASTag' ||
          /toll|fastag/i.test(payload.category || '') ||
          /toll|fastag/i.test(payload.subcategory || '') ||
          /toll|fastag/i.test(payload.description || '');

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
        } else if (isTollExpense) {
          try {
            let targetTruck = null;
            if (payload.truck_id && payload.truck_id !== 'none') {
              targetTruck = trucks.find(t => t.id === payload.truck_id || t.truck_number === payload.truck_id);
            }

            if (targetTruck) {
              const currentBal = Number(targetTruck.current_fastag_balance) || 0;
              const newBal = currentBal + Number(payload.amount);

              // 1. Update truck FASTag balance (+ amount)
              await pb.collection('trucks').update(targetTruck.id, {
                current_fastag_balance: newBal,
                last_recharge_date: dateISO,
                last_recharge_amount: Number(payload.amount)
              }, { $autoCancel: false });

              // 2. Create fastag_recharges log
              await pb.collection('fastag_recharges').create({
                truck_id: targetTruck.id,
                recharge_date: dateISO,
                recharge_amount: Number(payload.amount),
                payment_method: payload.payment_method || 'Cash',
                reference_number: '',
                notes: payload.description || 'FASTag Recharge from Expense Manager'
              }, { $autoCancel: false });

              toast.success(`₹${payload.amount.toLocaleString('en-IN')} added to ${targetTruck.truck_number}'s FASTag balance!`);
            } else {
              toast.success('Toll expense recorded successfully');
            }
          } catch (fastagErr) {
            console.error('Failed to sync FASTag recharge balance:', fastagErr);
            toast.success('Expense created successfully');
          }
        } else {
          toast.success('Expense created successfully');
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

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] max-w-5xl h-[88vh] max-h-[88vh] rounded-[2rem] p-4 sm:p-6 shadow-2xl bg-card border-border/50 flex flex-col overflow-hidden gap-0">
        <DialogHeader className="mb-3 shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-2xl text-primary">
              <Receipt className="w-5 h-5" />
            </div>
            {expense ? 'Edit Expense' : 'Record Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
            <div className="space-y-4">
              
              <div className="space-y-1 bg-muted/20 p-3 rounded-2xl border border-border/40">
                <Label className="text-[10px] font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Total Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                    required 
                    placeholder="0.00"
                    className="bg-background border-muted-foreground/30 focus-visible:ring-primary/40 rounded-xl h-11 text-xl font-bold pl-8 tabular-nums shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date
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
                  <Label className="text-xs font-medium text-foreground ml-1">Main Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => {
                      const updates = { category: v };
                      if (v === 'Employee') {
                        updates.subcategory = 'Employee Advance';
                      } else if (v === 'Regular') {
                        updates.subcategory = 'Maintenance';
                      } else {
                        updates.subcategory = '';
                      }
                      setFormData({ ...formData, ...updates });
                    }}
                  >
                    <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Regular" className="text-xs">Regular Expense</SelectItem>
                      <SelectItem value="Employee" className="text-xs">Employee Expense</SelectItem>
                      <SelectItem value="EMI" className="text-xs">EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                
              {(formData.category === 'Regular' || formData.category === 'Employee') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1">Subcategory</Label>
                  <Select value={formData.subcategory} onValueChange={(v) => setFormData({ ...formData, subcategory: v })} required>
                    <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {formData.category === 'Regular' ? (
                        <>
                          <SelectItem value="Fuel" className="text-xs">Fuel</SelectItem>
                          <SelectItem value="Toll" className="text-xs">FASTag - Toll</SelectItem>
                          <SelectItem value="Maintenance" className="text-xs">Maintenance</SelectItem>
                          <SelectItem value="Miscellaneous" className="text-xs">Miscellaneous</SelectItem>
                          <SelectItem value="Insurance" className="text-xs">Insurance</SelectItem>
                          <SelectItem value="Utilities" className="text-xs">Utilities</SelectItem>
                          <SelectItem value="Other" className="text-xs">All Other Expenses</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Employee Advance" className="text-xs">Driver / Employee Advance</SelectItem>
                          <SelectItem value="Salary" className="text-xs">Salary</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.category === 'Employee' && formData.subcategory === 'Employee Advance' && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex gap-2 text-warning">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Selecting "Employee Advance" will automatically create a pending advance record for the selected employee in the Payroll system.
                  </p>
                </div>
              )}

              {formData.category === 'Regular' && (formData.subcategory === 'Toll' || formData.subcategory === 'FASTag') && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2 text-emerald-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Selecting "Toll" will automatically <strong>add this amount to the truck's FASTag wallet balance</strong> and log a recharge in FASTag Management.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Description
                </Label>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="What was this expense for?" 
                  required 
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-muted-foreground" /> Payment Mode
                  </Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                      <SelectItem value="Card" className="text-xs">Card</SelectItem>
                      <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                      <SelectItem value="UPI" className="text-xs">UPI</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground" /> Related Truck
                  </Label>
                  <Select value={formData.truck_id} onValueChange={(v) => setFormData({ ...formData, truck_id: v })}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select Truck (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[200px]">
                      <SelectItem value="none" className="text-xs">None / Not Applicable</SelectItem>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">{t.truck_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> Employee {formData.category === 'Employee' && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger className={`${selectTriggerClass} ${formData.category === 'Employee' && formData.employee_id === 'none' ? 'ring-2 ring-destructive/50 border-destructive' : ''}`}>
                      <SelectValue placeholder="Select Employee (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[200px]">
                      <SelectItem value="none" className="text-xs">None / Not Applicable</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id} className="text-xs">
                          {emp.name} {emp.position ? `- ${emp.position}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={`space-y-1.5 transition-all duration-300 ${formData.payment_method === 'Credit Card' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <Label className="text-xs font-medium text-foreground ml-1 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> Linked Credit Card
                  </Label>
                  <Select value={formData.credit_card_id} onValueChange={(v) => setFormData({ ...formData, credit_card_id: v })}>
                    <SelectTrigger className={`${selectTriggerClass} ${formData.payment_method === 'Credit Card' ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}>
                      <SelectValue placeholder="Select Credit Card (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="text-xs">None / Not Applicable</SelectItem>
                      {creditCards.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.bank_name} - {c.card_name} (**** {c.card_number_last4})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Document & Receipt upload section (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document upload zone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1">Attach Bills / Documents (Optional)</Label>
                  
                  <div 
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
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
                    <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-medium">Drag & drop docs, or <span className="text-primary hover:underline">browse</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PDF, DOC, DOCX up to 10MB each</p>
                  </div>

                  {/* File previews */}
                  {(newFiles.length > 0 || existingFiles.length > 0) && (
                    <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto pr-1">
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

                {/* Attach Receipt / Invoice Zone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground ml-1">Attach Receipt / Invoice (Snapshots)</Label>
                  
                  <div 
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                      isDraggingReceipt 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
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
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    />
                    <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-medium">Drag & drop receipts, or <span className="text-primary hover:underline">browse</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, JPEG up to 5MB each</p>
                  </div>

                  {/* Receipt Image thumbnails */}
                  {(newReceiptFiles.length > 0 || existingReceiptFiles.length > 0) && (
                    <div className="grid grid-cols-4 gap-2 mt-2 max-h-[120px] overflow-y-auto p-1">
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
                            <span className="absolute bottom-1 left-1 bg-primary/85 text-primary-foreground text-[8px] px-1 rounded-full font-semibold animate-pulse">New</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

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
              className="w-full sm:w-auto rounded-xl h-10 px-6 text-xs font-semibold shadow-sm"
            >
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}