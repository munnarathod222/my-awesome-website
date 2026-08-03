import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, Phone, Mail, MapPin, FileText, Star, Truck, Calendar, 
  ExternalLink, Download, CheckCircle2, Clock, AlertTriangle, CreditCard, Camera 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  APPLICATION_STATUSES, updateApplicationStatus, getLicenseFileUrl, 
  getPhotoFileUrl, getPanFileUrl, getStatusConfig 
} from '@/lib/recruitmentClient.js';

export default function DriverApplicationDetailModal({ isOpen, onClose, application, onUpdated }) {
  const [status, setStatus] = useState(application?.status || 'Applied');
  const [notes, setNotes] = useState(application?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!application) return null;

  const licenseUrl = getLicenseFileUrl(application);
  const photoUrl   = getPhotoFileUrl(application);
  const panUrl     = getPanFileUrl(application);
  const statusCfg  = getStatusConfig(application.status);

  const isLicenseImage = licenseUrl && /\.(jpg|jpeg|png|webp)$/i.test(application.license_file || '');
  const isLicensePdf   = licenseUrl && /\.pdf$/i.test(application.license_file || '');

  const isPanImage = panUrl && /\.(jpg|jpeg|png|webp)$/i.test(application.pan_file || application.pan_card_file || '');
  const isPanPdf   = panUrl && /\.pdf$/i.test(application.pan_file || application.pan_card_file || '');

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await updateApplicationStatus(application.id, status, notes);
      toast.success(`Status updated to "${status}"`);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const vehicles = application.vehicle_types ? application.vehicle_types.split(',').map(v => v.trim()).filter(Boolean) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col bg-card border-border shadow-2xl rounded-3xl p-5 sm:p-7 font-sans">
        <DialogHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt="Passport Photo" 
                  className="w-14 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center flex-shrink-0">
                  {application.full_name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-extrabold text-foreground">{application.full_name}</DialogTitle>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> {application.phone}
                  {application.email && <><Mail className="w-3 h-3 ml-2" /> {application.email}</>}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`font-mono text-xs font-bold ${statusCfg.color}`}>
              {statusCfg.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/20 rounded-2xl p-3 border border-border/50 space-y-1.5 text-xs">
              <h3 className="font-extrabold text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Location</h3>
              <p className="text-muted-foreground">{application.city}, {application.state}</p>
              {application.address && <p className="text-muted-foreground text-[11px]">{application.address}</p>}
            </div>

            <div className="bg-muted/20 rounded-2xl p-3 border border-border/50 space-y-1.5 text-xs">
              <h3 className="font-extrabold text-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Applied On</h3>
              <p className="text-muted-foreground font-mono">
                {application.applied_date ? format(new Date(application.applied_date), 'dd MMM yyyy, hh:mm a') : format(new Date(application.created), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>

            <div className="bg-muted/20 rounded-2xl p-3 border border-border/50 space-y-1.5 text-xs">
              <h3 className="font-extrabold text-foreground flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-emerald-400" /> Experience</h3>
              <p className="text-muted-foreground">{application.experience_years || 0} Years driving</p>
              {application.previous_employer && <p className="text-[11px] text-muted-foreground">Prev: {application.previous_employer}</p>}
            </div>
          </div>

          {/* Identity & PAN Card Details */}
          <div className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" /> PAN Card &amp; Identity Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">PAN Card Number</span>
                <strong className="font-mono text-foreground text-sm uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {application.pan_number || 'Not Provided'}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Passport Photo</span>
                {photoUrl ? (
                  <a href={photoUrl} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> View Photo
                  </a>
                ) : <span className="text-muted-foreground">—</span>}
              </div>
            </div>

            {panUrl && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-xs font-bold text-muted-foreground">PAN Card Document</span>
                {isPanImage ? (
                  <img src={panUrl} alt="PAN Card" className="max-h-48 rounded-xl border border-border object-contain bg-white p-1" />
                ) : isPanPdf ? (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <FileText className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground flex-1 truncate">PAN Document (PDF)</span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <a href={panUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View PAN Doc
                    </Button>
                  </a>
                  <a href={panUrl} download>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* License Details */}
          <div className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary" /> Driving License</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div><span className="text-muted-foreground block">License Number</span><strong className="font-mono text-foreground">{application.license_number || '—'}</strong></div>
              <div><span className="text-muted-foreground block">License Class</span><strong className="text-foreground">{application.license_type || '—'}</strong></div>
              <div><span className="text-muted-foreground block">Expiry Date</span><strong className="text-foreground">{application.license_expiry || '—'}</strong></div>
            </div>

            {/* License File Preview */}
            {licenseUrl && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-xs font-bold text-muted-foreground">License Document</span>
                {isLicenseImage ? (
                  <img src={licenseUrl} alt="Driving License" className="max-h-48 rounded-xl border border-border object-contain bg-white p-1" />
                ) : isLicensePdf ? (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <FileText className="w-8 h-8 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{application.license_file}</span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <a href={licenseUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View License
                    </Button>
                  </a>
                  <a href={licenseUrl} download>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Types */}
          {vehicles.length > 0 && (
            <div className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-2">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-400" /> Vehicle Types</h3>
              <div className="flex flex-wrap gap-1.5">
                {vehicles.map(v => (
                  <Badge key={v} variant="secondary" className="text-xs font-bold rounded-lg px-2.5 py-1">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {(application.reference1_name || application.reference2_name) && (
            <div className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-3">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> References</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {application.reference1_name && (
                  <div className="p-3 bg-card rounded-xl border border-border/50 space-y-0.5">
                    <p className="font-extrabold text-foreground">{application.reference1_name}</p>
                    <p className="font-mono text-muted-foreground">{application.reference1_phone}</p>
                    {application.reference1_relation && <p className="text-[11px] text-muted-foreground">{application.reference1_relation}</p>}
                  </div>
                )}
                {application.reference2_name && (
                  <div className="p-3 bg-card rounded-xl border border-border/50 space-y-0.5">
                    <p className="font-extrabold text-foreground">{application.reference2_name}</p>
                    <p className="font-mono text-muted-foreground">{application.reference2_phone}</p>
                    {application.reference2_relation && <p className="text-[11px] text-muted-foreground">{application.reference2_relation}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update & Notes */}
          <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3">
            <h3 className="font-extrabold text-foreground text-sm">Update Application Status &amp; HR Notes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <Label className="text-xs font-bold text-muted-foreground">Application Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 rounded-xl bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value} className="font-bold text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">HR Internal Notes</Label>
                <Textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Notes from candidate interview, document check, background verification..." 
                  className="rounded-xl bg-card text-xs min-h-[70px]" 
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border/40 pt-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            Close
          </Button>
          <Button onClick={handleSaveStatus} disabled={saving} className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
            {saving ? 'Saving...' : 'Save Status & Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
