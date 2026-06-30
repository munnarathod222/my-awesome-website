import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, FileText, Copy, Share2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactDetailsModal({ isOpen, onClose, contact }) {
  if (!contact) return null;

  const handleCopy = () => {
    const text = `${contact.company_name}\nPhone: ${contact.phone_number}\nGSTIN: ${contact.gstin}\nAddress: ${contact.physical_address}`;
    navigator.clipboard.writeText(text);
    toast.success('Contact details copied to clipboard');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${contact.company_name} Contact Info`,
        text: `Contact: ${contact.company_name}\nPhone: ${contact.phone_number}\nGSTIN: ${contact.gstin}`,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Client': return 'bg-primary/10 text-primary border-primary/20';
      case 'Driver': return 'bg-success/10 text-success border-success/20';
      case 'Vendor': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> GSTIN: <span className="font-mono">{contact.gstin}</span>
              </p>
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
                    {contact.phone_number}
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
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Physical Address</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {contact.physical_address}
                  </p>
                </div>
              </div>

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
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" className="flex-1 bg-background" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}