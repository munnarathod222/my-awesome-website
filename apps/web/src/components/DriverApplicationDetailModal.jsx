import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, Phone, Mail, MapPin, FileText, Star, Truck, Calendar, 
  ExternalLink, Download, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { APPLICATION_STATUSES, updateApplicationStatus, getLicenseFileUrl, getStatusConfig } from '@/lib/recruitmentClient.js';

export default function DriverApplicationDetailModal({ isOpen, onClose, application, onUpdated }) {
  const [status, setStatus] = useState(application?.status || 'Applied');
  const [notes, setNotes] = useState(application?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!application) return null;

  const licenseUrl = getLicenseFileUrl(application);
  const statusCfg = getStatusConfig(application.status);
  const isImage = licenseUrl && /\.(jpg|jpeg|png|webp)$/i.test(application.license_file || '');
  const isPdf   = licenseUrl && /\.pdf$/i.test(application.license_file || '');

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
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center flex-shrink-0">
                {application.full_name?.slice(0, 2).toUpperCase()}
              </div>
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
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground">License Document</span>
                {isImage ? (
                  <img src={licenseUrl} alt="Driving License" className="max-h-48 rounded-xl border border-border object-contain bg-white p-1" />
                ) : isPdf ? (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <FileText className="w-8 h-8 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{application.license_file}</span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <a href={licenseUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
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
            <div className="space-y-2">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Can Drive</h3>
              <div className="flex flex-wrap gap-1.5">
                {vehicles.map(v => (
                  <Badge key={v} variant="outline" className="text-[11px] font-bold text-primary border-primary/30">{v}</Badge>
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
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">{application.reference1_name}</p>
                    <a href={`tel:${application.reference1_phone}`} className="text-primary font-mono hover:underline">{application.reference1_phone}</a>
                    <p className="text-muted-foreground">{application.reference1_relation}</p>
                  </div>
                )}
                {application.reference2_name && (
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">{application.reference2_name}</p>
                    <a href={`tel:${application.reference2_phone}`} className="text-primary font-mono hover:underline">{application.reference2_phone}</a>
                    <p className="text-muted-foreground">{application.reference2_relation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-3">
            <h3 className="font-extrabold text-foreground text-sm">Update Application Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-xl h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">HR Notes (Optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Interview notes, remarks..." className="rounded-xl text-xs resize-none" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">Close</Button>
          <div className="flex gap-2">
            <a href={`tel:${application.phone}`}>
              <Button variant="outline" className="rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <Phone className="w-3.5 h-3.5 mr-1" /> Call Candidate
              </Button>
            </a>
            <Button onClick={handleSaveStatus} disabled={saving} className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
              {saving ? 'Saving...' : '✓ Save Status'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
