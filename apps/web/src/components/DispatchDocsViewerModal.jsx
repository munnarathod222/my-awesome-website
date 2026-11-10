import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  FileText, Receipt, FileCheck, Clock, Download, 
  ExternalLink, AlertTriangle, CheckCircle2, Copy, Check, ZoomIn, ZoomOut 
} from 'lucide-react';
import { toast } from 'sonner';

export default function DispatchDocsViewerModal({ isOpen, onClose, trip }) {
  const [activeTab, setActiveTab] = useState('lr'); // 'lr' | 'invoice' | 'eway'
  const [copiedField, setCopiedField] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!trip) return null;

  // Resolve file URLs
  const getFileUrl = (field) => {
    const val = trip[field];
    if (!val) return null;
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'))) {
      return val;
    }
    // Pocketbase file resolution
    return `/api/files/trip_logs/${trip.id}/${val}`;
  };

  const lrUrl = getFileUrl('lr_file') || trip.lr_file_url || null;
  const invoiceUrl = getFileUrl('invoice_file') || trip.invoice_file_url || null;
  const ewayUrl = getFileUrl('eway_bill_file') || trip.eway_bill_file_url || null;

  // Delivery SLA Calculations
  const computeSlaStatus = () => {
    if (!trip.delivery_deadline) return null;
    const deadline = new Date(trip.delivery_deadline);
    const now = new Date();
    const isDelivered = trip.trip_status === 'Delivered';

    if (isDelivered) {
      const deliveredTime = trip.updated ? new Date(trip.updated) : now;
      const onTime = deliveredTime <= deadline;
      return {
        status: onTime ? 'delivered_on_time' : 'delivered_delayed',
        label: onTime ? 'Delivered On Time 🏁' : 'Delivered Past Deadline ⚠️',
        color: onTime ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      };
    }

    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffMs > 0) {
      if (diffHours < 6) {
        return {
          status: 'tight',
          label: `Tight Window · ${diffHours}h remaining ⏳`,
          color: 'text-amber-400 bg-amber-500/20 border-amber-500/30'
        };
      }
      return {
        status: 'on_track',
        label: `On Schedule · ${diffHours}h remaining 🟢`,
        color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      };
    } else {
      const overdueHours = Math.abs(diffHours);
      return {
        status: 'overdue',
        label: `Overdue by ${overdueHours}h ⚠️ (Plant Unloading Delay)`,
        color: 'text-rose-400 bg-rose-500/20 border-rose-500/30'
      };
    }
  };

  const sla = computeSlaStatus();

  // E-Way Bill Expiry check
  const isEwayExpired = () => {
    if (!trip.eway_expiry_date) return false;
    return new Date(trip.eway_expiry_date) < new Date() && trip.trip_status !== 'Delivered';
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentDocUrl = activeTab === 'lr' ? lrUrl : activeTab === 'invoice' ? invoiceUrl : ewayUrl;
  const isPdf = currentDocUrl && currentDocUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/40 bg-slate-900/60 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                Dispatch Compliance & SLA Documents
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Trip <strong className="text-slate-200">{trip.trip_id || trip.id}</strong> · Vehicle: <strong className="text-indigo-300">{trip.truck_number || '—'}</strong> · Route: <span className="text-slate-300">{trip.route || '—'}</span>
              </p>
            </div>

            {sla && (
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 self-start sm:self-auto ${sla.color}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{sla.label}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Delivery Deadline SLA Banner */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-border/20 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Delivery Deadline (SLA):</span>
            <span className="font-semibold text-slate-100">
              {trip.delivery_deadline 
                ? new Date(trip.delivery_deadline).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Not specified'}
            </span>
          </div>

          {trip.delivery_deadline && (
            <div className="text-[11px] text-slate-400">
              Consignee delivery window commitment
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/30 bg-slate-900/30 px-5 gap-2 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('lr'); setZoomLevel(1); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'lr' 
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. LR / Consignment Note</span>
            {lrUrl ? <span className="w-2 h-2 rounded-full bg-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-rose-400" />}
          </button>

          <button
            onClick={() => { setActiveTab('invoice'); setZoomLevel(1); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'invoice' 
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>2. Commercial Invoice</span>
            {invoiceUrl ? <span className="w-2 h-2 rounded-full bg-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-rose-400" />}
          </button>

          <button
            onClick={() => { setActiveTab('eway'); setZoomLevel(1); }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'eway' 
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>3. GST E-Way Bill</span>
            {ewayUrl ? <span className="w-2 h-2 rounded-full bg-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-rose-400" />}
            {isEwayExpired() && <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">Expired</span>}
          </button>
        </div>

        {/* Tab Detail Bar */}
        <div className="px-5 py-3 bg-slate-900/80 border-b border-border/20 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          {activeTab === 'lr' && (
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400">LR / Bilty No: </span>
                <strong className="text-slate-100 font-mono text-sm ml-1">{trip.lr_number || '—'}</strong>
                {trip.lr_number && (
                  <button onClick={() => handleCopy(trip.lr_number, 'LR Number')} className="ml-1.5 text-slate-400 hover:text-slate-200 inline">
                    {copiedField === 'LR Number' ? <Check className="w-3.5 h-3.5 inline text-emerald-400" /> : <Copy className="w-3.5 h-3.5 inline" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400">Invoice No: </span>
                <strong className="text-slate-100 font-mono text-sm ml-1">{trip.invoice_number || '—'}</strong>
                {trip.invoice_number && (
                  <button onClick={() => handleCopy(trip.invoice_number, 'Invoice Number')} className="ml-1.5 text-slate-400 hover:text-slate-200 inline">
                    {copiedField === 'Invoice Number' ? <Check className="w-3.5 h-3.5 inline text-emerald-400" /> : <Copy className="w-3.5 h-3.5 inline" />}
                  </button>
                )}
              </div>
              {trip.invoice_value && (
                <div>
                  <span className="text-slate-400">Material Value: </span>
                  <strong className="text-emerald-400 font-semibold ml-1">₹{Number(trip.invoice_value).toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>
          )}

          {activeTab === 'eway' && (
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400">E-Way Bill No: </span>
                <strong className="text-slate-100 font-mono text-sm ml-1">{trip.eway_bill_number || '—'}</strong>
                {trip.eway_bill_number && (
                  <button onClick={() => handleCopy(trip.eway_bill_number, 'E-Way Bill Number')} className="ml-1.5 text-slate-400 hover:text-slate-200 inline">
                    {copiedField === 'E-Way Bill Number' ? <Check className="w-3.5 h-3.5 inline text-emerald-400" /> : <Copy className="w-3.5 h-3.5 inline" />}
                  </button>
                )}
              </div>
              {trip.eway_expiry_date && (
                <div>
                  <span className="text-slate-400">Validity Expiry: </span>
                  <strong className={`ml-1 font-semibold ${isEwayExpired() ? 'text-rose-400' : 'text-slate-200'}`}>
                    {new Date(trip.eway_expiry_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Controls: Zoom & Download */}
          {currentDocUrl && (
            <div className="flex items-center gap-2 ml-auto">
              {!isPdf && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                asChild
                className="h-7 text-xs border-slate-700 bg-slate-800 text-slate-200 gap-1"
              >
                <a href={currentDocUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </a>
              </Button>
              <Button
                size="sm"
                asChild
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
              >
                <a href={currentDocUrl} download>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Viewer Content Area */}
        <div className="flex-1 overflow-auto bg-slate-950/90 p-4 flex items-center justify-center">
          {currentDocUrl ? (
            isPdf ? (
              <iframe
                src={currentDocUrl}
                title={`${activeTab} document`}
                className="w-full h-full rounded-xl border border-border/30 bg-white"
              />
            ) : (
              <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
                <img
                  src={currentDocUrl}
                  alt={`${activeTab} document preview`}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className="max-h-[65vh] object-contain rounded-xl border border-border/40 shadow-xl transition-transform duration-200"
                />
              </div>
            )
          ) : (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                No {activeTab === 'lr' ? 'LR / Consignment Note' : activeTab === 'invoice' ? 'Commercial Invoice' : 'GST E-Way Bill'} Attached
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                This document was not uploaded during trip dispatch. You can attach it anytime by editing this trip in Trip Logs.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
