import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, FileText, Copy, Share2, Building2, Wrench } from 'lucide-react';
import { shareContact, copyContactDetails, getPastedMapUrl } from '@/lib/contactUtils.js';

export default function ContactDetailsModal({ isOpen, onClose, contact }) {
  if (!contact) return null;

  const handleCopy = () => {
    copyContactDetails(contact);
  };

  const handleShare = () => {
    shareContact(contact);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Client': return 'bg-primary/10 text-primary border-primary/20';
      case 'Driver': return 'bg-success/10 text-success border-success/20';
      case 'Vendor': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const mapsUrl = getPastedMapUrl(contact);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="business-card">
          <div className="business-card-header relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Building2 className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <Badge variant="outline" className={`mb-3 ${getTypeColor(contact.contact_type)}`}>
                {contact.contact_type}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{contact.company_name}</h2>
              {contact.gstin && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> GSTIN: <span className="font-mono">{contact.gstin}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="business-card-body">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</p>
                  <a href={`tel:${contact.phone_number}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {contact.phone_number || 'N/A'}
                  </a>
                </div>
              </div>

              {contact.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <a href={`mailto:${contact.email}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Physical Address</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {contact.physical_address || 'No address specified'}
                  </p>
                  {mapsUrl && (
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      Open Google Maps GPS Navigation
                    </a>
                  )}
                </div>
              </div>

              {contact.truck_brand && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Truck Brands Serviced</p>
                    <p className="text-sm text-foreground font-semibold">
                      {contact.truck_brand}
                    </p>
                  </div>
                </div>
              )}

              {contact.notes && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-foreground/80 italic">"{contact.notes}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/10 p-4 border-t border-border/50 flex gap-2">
            <Button variant="outline" className="flex-1 bg-background" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" /> Copy Details
            </Button>
            <Button className="flex-1 shadow-sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share Contact & Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}