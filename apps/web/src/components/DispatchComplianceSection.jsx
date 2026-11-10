import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  FileText, Receipt, FileCheck, Clock, Upload, 
  X, Check, AlertCircle, Eye, Calendar, Sparkles 
} from 'lucide-react';
import { compressDocumentImage, formatBytes } from '@/lib/imageCompressor.js';
import { toast } from 'sonner';

export default function DispatchComplianceSection({ formData, setFormData }) {
  const [compressing, setCompressing] = useState({
    lr: false,
    invoice: false,
    eway: false
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }

    setCompressing(prev => ({ ...prev, [type]: true }));
    try {
      // Auto-compress image captures
      let finalFile = file;
      let originalSize = file.size;
      let compressedSize = file.size;

      if (file.type.startsWith('image/')) {
        finalFile = await compressDocumentImage(file, { maxDimension: 2048, quality: 0.82 });
        compressedSize = finalFile.size || file.size;
      }

      // Read as Data URL for robust storage & preview
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target.result;
        
        if (type === 'lr') {
          setFormData(prev => ({
            ...prev,
            lr_file: finalFile,
            lr_file_url: dataUrl,
            lr_file_name: file.name,
            lr_file_meta: { originalSize, compressedSize }
          }));
          toast.success(`LR attached (${formatBytes(compressedSize)})`);
        } else if (type === 'invoice') {
          setFormData(prev => ({
            ...prev,
            invoice_file: finalFile,
            invoice_file_url: dataUrl,
            invoice_file_name: file.name,
            invoice_file_meta: { originalSize, compressedSize }
          }));
          toast.success(`Invoice attached (${formatBytes(compressedSize)})`);
        } else if (type === 'eway') {
          setFormData(prev => ({
            ...prev,
            eway_bill_file: finalFile,
            eway_bill_file_url: dataUrl,
            eway_bill_file_name: file.name,
            eway_bill_file_meta: { originalSize, compressedSize }
          }));
          toast.success(`E-Way Bill attached (${formatBytes(compressedSize)})`);
        }
      };
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error('File compression/upload error:', err);
      toast.error('Failed to process document. Please try again.');
    } finally {
      setCompressing(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeFile = (type) => {
    if (type === 'lr') {
      setFormData(prev => ({ ...prev, lr_file: null, lr_file_url: '', lr_file_name: '', lr_file_meta: null }));
    } else if (type === 'invoice') {
      setFormData(prev => ({ ...prev, invoice_file: null, invoice_file_url: '', invoice_file_name: '', invoice_file_meta: null }));
    } else if (type === 'eway') {
      setFormData(prev => ({ ...prev, eway_bill_file: null, eway_bill_file_url: '', eway_bill_file_name: '', eway_bill_file_meta: null }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Dispatch Compliance & Delivery SLA Tracker
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Statutory & SLA
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Attach mandatory transit documentation (auto-compressed) and set delivery SLA deadline
            </p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. LR / Consignment Note */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <Label className="text-xs font-semibold text-slate-200">1. Attach LR / Consignment Note</Label>
            </div>
            {formData.lr_file_url ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Attached ✓
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">Optional</span>
            )}
          </div>

          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">LR / Bilty Number</Label>
            <Input
              value={formData.lr_number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lr_number: e.target.value }))}
              placeholder="e.g. JBC-2026-1049"
              className="h-8 text-xs bg-slate-950 border-slate-700"
            />
          </div>

          {/* Upload Button or Thumbnail */}
          {formData.lr_file_url ? (
            <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {formData.lr_file_url.startsWith('data:image') ? (
                  <img src={formData.lr_file_url} alt="LR Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                ) : (
                  <FileText className="w-8 h-8 text-emerald-400 p-1 bg-slate-800 rounded" />
                )}
                <div className="truncate">
                  <div className="text-xs text-slate-200 truncate font-medium">{formData.lr_file_name || 'LR Document'}</div>
                  {formData.lr_file_meta && (
                    <div className="text-[10px] text-emerald-400">
                      {formatBytes(formData.lr_file_meta.compressedSize)} (Compressed)
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => removeFile('lr')} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-indigo-950/20 cursor-pointer text-xs text-slate-300 transition-all">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>{compressing.lr ? 'Compressing...' : 'Upload LR (Auto-Compress)'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'lr')} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* 2. Attach Commercial Invoice */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <Label className="text-xs font-semibold text-slate-200">2. Attach Commercial Invoice</Label>
            </div>
            {formData.invoice_file_url ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Attached ✓
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">Optional</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-slate-400 mb-1 block">Invoice Number</Label>
              <Input
                value={formData.invoice_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                placeholder="e.g. INV-98234"
                className="h-8 text-xs bg-slate-950 border-slate-700"
              />
            </div>
            <div>
              <Label className="text-[11px] text-slate-400 mb-1 block">Material Value (₹)</Label>
              <Input
                type="number"
                value={formData.invoice_value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_value: e.target.value }))}
                placeholder="e.g. 850000"
                className="h-8 text-xs bg-slate-950 border-slate-700"
              />
            </div>
          </div>

          {/* Upload Button or Thumbnail */}
          {formData.invoice_file_url ? (
            <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {formData.invoice_file_url.startsWith('data:image') ? (
                  <img src={formData.invoice_file_url} alt="Invoice Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                ) : (
                  <Receipt className="w-8 h-8 text-emerald-400 p-1 bg-slate-800 rounded" />
                )}
                <div className="truncate">
                  <div className="text-xs text-slate-200 truncate font-medium">{formData.invoice_file_name || 'Invoice Document'}</div>
                  {formData.invoice_file_meta && (
                    <div className="text-[10px] text-emerald-400">
                      {formatBytes(formData.invoice_file_meta.compressedSize)} (Compressed)
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => removeFile('invoice')} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-emerald-950/20 cursor-pointer text-xs text-slate-300 transition-all">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{compressing.invoice ? 'Compressing...' : 'Upload Invoice (Auto-Compress)'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'invoice')} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* 3. Attach GST E-Way Bill */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              <Label className="text-xs font-semibold text-slate-200">3. Attach GST E-Way Bill</Label>
            </div>
            {formData.eway_bill_file_url ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Attached ✓
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">Statutory</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-slate-400 mb-1 block">12-Digit E-Way Bill No.</Label>
              <Input
                value={formData.eway_bill_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, eway_bill_number: e.target.value }))}
                placeholder="e.g. 1412 8904 2314"
                maxLength={16}
                className="h-8 text-xs bg-slate-950 border-slate-700 font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-slate-400 mb-1 block">Validity Expiry Date</Label>
              <Input
                type="datetime-local"
                value={formData.eway_expiry_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, eway_expiry_date: e.target.value }))}
                className="h-8 text-xs bg-slate-950 border-slate-700"
              />
            </div>
          </div>

          {/* Upload Button or Thumbnail */}
          {formData.eway_bill_file_url ? (
            <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {formData.eway_bill_file_url.startsWith('data:image') ? (
                  <img src={formData.eway_bill_file_url} alt="E-Way Bill Preview" className="w-8 h-8 rounded object-cover border border-slate-700" />
                ) : (
                  <FileCheck className="w-8 h-8 text-sky-400 p-1 bg-slate-800 rounded" />
                )}
                <div className="truncate">
                  <div className="text-xs text-slate-200 truncate font-medium">{formData.eway_bill_file_name || 'E-Way Bill'}</div>
                  {formData.eway_bill_file_meta && (
                    <div className="text-[10px] text-emerald-400">
                      {formatBytes(formData.eway_bill_file_meta.compressedSize)} (Compressed)
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => removeFile('eway')} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-700 hover:border-sky-500/50 bg-slate-950/40 hover:bg-sky-950/20 cursor-pointer text-xs text-slate-300 transition-all">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>{compressing.eway ? 'Compressing...' : 'Upload E-Way Bill (Auto-Compress)'}</span>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'eway')} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* 4. Record Delivery Deadline (SLA Tracker) */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-indigo-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <Label className="text-xs font-semibold text-slate-200">4. Record Delivery Deadline (SLA)</Label>
            </div>
            {formData.delivery_deadline ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                SLA Active ⏱️
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">Target SLA</span>
            )}
          </div>

          <div>
            <Label className="text-[11px] text-slate-400 mb-1 block">Expected Delivery Date & Time</Label>
            <Input
              type="datetime-local"
              value={formData.delivery_deadline || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
              className="h-8 text-xs bg-slate-950 border-slate-700 font-medium text-slate-200"
            />
          </div>

          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Enables live SLA countdown timer on the Trip Logs table and auto-calculates client detention claims if plant unloading is delayed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
