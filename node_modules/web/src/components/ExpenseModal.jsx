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
import DocumentFilePreview from './DocumentFilePreview.jsx';


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
    if (expense) {
      setFormData({
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        amount: expense.amount || '',
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
  }, [expense, isOpen]);

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
    
    try {
      if (formData.category === 'Employee Advance' && (!formData.employee_id || formData.employee_id === 'none')) {
        toast.error('Please select an employee for this advance.');
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        truck_id: formData.truck_id === 'none' ? '' : formData.truck_id,
        credit_card_id: formData.credit_card_id === 'none' ? '' : formData.credit_card_id,
        employee_id: formData.employee_id === 'none' ? '' : formData.employee_id,
      };

      if (payload.category !== 'Regular') {
        payload.subcategory = '';
      }

      const dateISO = payload.date.includes('T') ? payload.date : `${payload.date} 12:00:00.000Z`;
      const cashCategory = payload.category === 'Regular' && payload.subcategory 
        ? `Regular - ${payload.subcategory}` 
        : payload.category;

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

      newFiles.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      newReceiptFiles.forEach((file) => {
        formDataToSend.append('image_urls', file);
      });

      let record;

      if (expense) {
        deletedFiles.forEach((filename) => {
          formDataToSend.append('documents.' + filename, '');
        });

        deletedReceiptFiles.forEach((filename) => {
          formDataToSend.append('image_urls.' + filename, '');
        });
        
        record = await pb.collection('expenses').update(expense.id, formDataToSend, { $autoCancel: false });
        
        const cashbookEntries = await pb.collection('cashbook').getFullList({
          filter: `reference_id="${expense.id}"`,
          $autoCancel: false
        });
        
        for (const entry of cashbookEntries) {
          await pb.collection('cashbook').update(entry.id, {
            date: dateISO,
            description: payload.description || 'Expense',
            amount: payload.amount,
            category: cashCategory,
            employee_id: payload.employee_id
          }, { $autoCancel: false });
        }
        
        toast.success('Expense updated successfully');
      } else {
        formDataToSend.append('created_by', currentUser.id);
        
        record = await pb.collection('expenses').create(formDataToSend, { $autoCancel: false });
        
        await pb.collection('cashbook').create({
          date: dateISO,
          description: payload.description || 'Expense',
          amount: payload.amount,
          transaction_type: 'Expense',
          category: cashCategory,
          added_by: currentUser.id,
          reference_id: record.id,
          reference_type: 'expense',
          status: 'Completed',
          employee_id: payload.employee_id
        }, { $autoCancel: false });

        if (payload.category === 'Employee Advance') {
          const empName = employees.find(e => e.id === payload.employee_id)?.name || 'Employee';
          await AdvanceIntegrationService.createAdvanceFromExpense({
            employee_id: payload.employee_id,
            amount: payload.amount,
            date: dateISO,
            description: payload.description,
            expense_id: record.id
          });
          toast.success(`Advance record automatically created for ${empName}`);
        } else {
          toast.success('Expense created successfully');
        }
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Expense save error:', err);
      toast.error('Failed to save expense. Please check your inputs.');
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

  const inputClass = "bg-muted/40 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl h-12 text-base px-4";
  const selectTriggerClass = "bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-12 text-base px-4";

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] rounded-[2rem] p-6 sm:p-10 shadow-2xl bg-card border-border/50 flex flex-col overflow-hidden gap-0">
        <DialogHeader className="mb-6 shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
              <Receipt className="w-6 h-6" />
            </div>
            {expense ? 'Edit Expense' : 'Record Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto -mx-6 sm:-mx-10 px-6 sm:px-10 pb-4">
            <div className="space-y-6">
              
              <div className="space-y-2.5 bg-muted/20 p-5 rounded-2xl border border-border/40">
                <Label className="text-sm font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Total Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                    required 
                    placeholder="0.00"
                    className="bg-background border-muted-foreground/30 focus-visible:ring-primary/40 rounded-xl h-16 text-3xl font-bold pl-10 tabular-nums shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Date
                  </Label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    required 
                    className={inputClass}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Main Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Regular">Regular Expense</SelectItem>
                      <SelectItem value="Employee Advance">Employee Advance</SelectItem>
                      <SelectItem value="EMI">EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                
              {formData.category === 'Regular' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Subcategory</Label>
                  <Select value={formData.subcategory} onValueChange={(v) => setFormData({ ...formData, subcategory: v })} required>
                    <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Maintenance">Maintenance / Repair</SelectItem>
                      <SelectItem value="Fuel">Fuel</SelectItem>
                      <SelectItem value="Toll">Toll</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.category === 'Employee Advance' && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex gap-3 text-warning">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Selecting "Employee Advance" will automatically create a pending advance record for the selected employee in the Payroll system.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Description
                </Label>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="What was this expense for?" 
                  required 
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-muted-foreground" /> Payment Mode
                  </Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" /> Related Truck
                  </Label>
                  <Select value={formData.truck_id} onValueChange={(v) => setFormData({ ...formData, truck_id: v })}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select Truck (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[250px]">
                      <SelectItem value="none">None / Not Applicable</SelectItem>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" /> Employee {formData.category === 'Employee Advance' && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger className={`${selectTriggerClass} ${formData.category === 'Employee Advance' && formData.employee_id === 'none' ? 'ring-2 ring-destructive/50 border-destructive' : ''}`}>
                      <SelectValue placeholder="Select Employee (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[250px]">
                      <SelectItem value="none">None / Not Applicable</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} {emp.position ? `- ${emp.position}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={`space-y-2 transition-all duration-300 ${formData.payment_method === 'Credit Card' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <Label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" /> Linked Credit Card
                  </Label>
                  <Select value={formData.credit_card_id} onValueChange={(v) => setFormData({ ...formData, credit_card_id: v })}>
                    <SelectTrigger className={`${selectTriggerClass} ${formData.payment_method === 'Credit Card' ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}>
                      <SelectValue placeholder="Select Credit Card (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">None / Not Applicable</SelectItem>
                      {creditCards.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.bank_name} - {c.card_name} (**** {c.card_number_last4})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Document upload section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">Attach Bills / Documents (Optional)</Label>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
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
                  <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Drag & drop files here, or <span className="text-primary hover:underline">browse</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, PDF, DOC, DOCX up to 10MB each (max 10 files)</p>
                </div>

                {/* File previews */}
                {(newFiles.length > 0 || existingFiles.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">Attach Receipt / Invoice (Snapshots)</Label>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
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
                  <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Drag & drop receipts here, or <span className="text-primary hover:underline">browse</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG up to 5MB each (max 10 files)</p>
                </div>

                {/* Receipt Image thumbnails */}
                {(newReceiptFiles.length > 0 || existingReceiptFiles.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                    {existingReceiptFiles.map((file, idx) => {
                      const url = pb.files.getUrl(expense, file);
                      return (
                        <div key={`existing-rec-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-muted/40">
                          <img src={url} alt="receipt" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReceipt(file, false)}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-destructive text-white rounded-full p-1 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    {newReceiptFiles.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={`new-rec-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-muted/40 animate-in fade-in zoom-in duration-200">
                          <img src={url} alt="receipt" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReceipt(file, true)}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-destructive text-white rounded-full p-1 transition-colors"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1.5 left-1.5 bg-primary/85 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-semibold animate-pulse">New</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/50 shrink-0 flex flex-col sm:flex-row gap-3 mt-4">
            {expense && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isLoading} 
                className="w-full sm:w-auto sm:mr-auto rounded-xl h-12 px-6 font-medium"
              >
                Delete Expense
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading} 
              className="w-full sm:w-auto rounded-xl h-12 px-6 font-medium bg-muted/30 border-muted-foreground/20 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-auto rounded-xl h-12 px-8 font-semibold shadow-sm"
            >
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}