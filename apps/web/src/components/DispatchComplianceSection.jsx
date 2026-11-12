import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, Receipt, FileCheck, Clock, Upload, 
  X, Check, AlertCircle, Eye, Calendar, Sparkles, Lock, ShieldCheck, Camera
} from 'lucide-react';
import { compressDocumentImage, formatBytes } from '@/lib/imageCompressor.js';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.js';

export default function DispatchComplianceSection({ formData, setFormData }) {
  const [compressing, setCompressing] = useState({
    lr: false,
    invoice: false,
    eway: false,
    seal: false
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

        {/* 5. Container / Truck Security Seal */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border/40 hover:border-cyan-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-200">5. Container / Truck Security Seal</Label>
                <p className="text-[10px] text-slate-400">Record tamper-evident bolt/wire seal numbers (up to 4)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", 
                formData.is_sealed ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-800 text-slate-400 border-slate-700")}>
                {formData.is_sealed ? "Sealed 🔒" : "Unsealed"}
              </span>
              <Switch
                checked={Boolean(formData.is_sealed)}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    is_sealed: checked,
                    seal_numbers: checked ? (prev.seal_numbers?.length ? prev.seal_numbers : ['']) : [''],
                    seal_number: checked ? prev.seal_number : '',
                    seal_photo_url: checked ? prev.seal_photo_url : ''
                  }));
                }}
              />
            </div>
          </div>

          {formData.is_sealed && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-slate-300 font-medium">
                    Seal Numbers <span className="text-muted-foreground text-[10px]">({(formData.seal_numbers || ['']).length}/4)</span>
                  </Label>
                  {(formData.seal_numbers || ['']).length < 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(formData.seal_numbers) ? formData.seal_numbers : [''];
                        if (current.length < 4) {
                          const updated = [...current, ''];
                          setFormData(prev => ({
                            ...prev,
                            seal_numbers: updated,
                            seal_number: updated.filter(Boolean).join(', ')
                          }));
                        }
                      }}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 hover:bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      + Add Another Seal (Max 4)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(formData.seal_numbers || ['']).map((sealVal, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-cyan-400/80 bg-slate-950 px-1.5 py-1 rounded border border-slate-800 shrink-0">
                        #{idx + 1}
                      </span>
                      <Input
                        type="text"
                        placeholder={idx === 0 ? "e.g., SEAL-984210" : `Seal #${idx + 1} code`}
                        value={sealVal}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          const current = [...(formData.seal_numbers || [''])];
                          current[idx] = val;
                          setFormData(prev => ({
                            ...prev,
                            seal_numbers: current,
                            seal_number: current.filter(Boolean).join(', ')
                          }));
                        }}
                        className="h-8 text-xs font-mono font-bold bg-slate-950 border-slate-700 text-cyan-300 tracking-wider"
                      />
                      {(formData.seal_numbers || ['']).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(formData.seal_numbers || [''])];
                            current.splice(idx, 1);
                            setFormData(prev => ({
                              ...prev,
                              seal_numbers: current,
                              seal_number: current.filter(Boolean).join(', ')
                            }));
                          }}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 shrink-0"
                          title="Remove this seal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lightweight Seal Photo Attachment */}
              <div className="pt-2 border-t border-slate-800/60">
                <Label className="text-[11px] text-slate-400 mb-1.5 block">
                  Seal Verification Photo <span className="text-[10px] text-emerald-400/80">(Auto-compressed to &lt; 40KB)</span>
                </Label>
                {formData.seal_photo_url ? (
                  <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={formData.seal_photo_url} alt="Seal Preview" className="w-10 h-10 rounded object-cover border border-cyan-500/40" />
                      <div className="truncate">
                        <div className="text-xs text-slate-200 truncate font-mono font-bold">
                          {formData.seal_number || 'Seal Photo'}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          Compressed & Verified (&lt; 40 KB)
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, seal_photo_url: '' }))}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-cyan-700/60 hover:border-cyan-400 bg-slate-950/60 hover:bg-cyan-950/20 cursor-pointer text-xs text-cyan-300 transition-all">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{compressing.seal ? 'Compressing (< 40KB)...' : 'Capture / Upload Seal Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCompressing(prev => ({ ...prev, seal: true }));
                        try {
                          const compressed = await compressDocumentImage(file, { maxDimension: 800, quality: 0.65 });
                          const reader = new FileReader();
                          reader.onload = (loadEv) => {
                            setFormData(prev => ({ ...prev, seal_photo_url: loadEv.target.result }));
                            toast.success(`Seal photo attached (${formatBytes(compressed.size || 35000)})`);
                          };
                          reader.readAsDataURL(compressed);
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to compress seal image');
                        } finally {
                          setCompressing(prev => ({ ...prev, seal: false }));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
