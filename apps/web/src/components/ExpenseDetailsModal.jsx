import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, Download, ExternalLink, Calendar, MapPin, Truck, IndianRupee, CreditCard, User } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const ExpenseDetailsModal = ({ isOpen, onClose, expense }) => {
  if (!expense) return null;

  const getFileUrl = (record, filename) => {
    return pb.files.getUrl(record, filename);
  };

  const getFiles = () => {
    if (expense.category === 'Fuel') return expense.photos || [];
    return expense.bill || [];
  };

  const files = getFiles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {expense.category} Details
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (ID: {expense.id.slice(0, 8)})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Top Value Banner */}
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Amount</p>
            <h3 className="text-4xl font-bold text-primary">₹{expense.amount?.toLocaleString()}</h3>
            <div className="flex items-center gap-2 mt-3 text-sm text-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(expense.date), 'dd MMM yyyy')}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 px-2">
            
            {expense.truck_number && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Truck className="w-4 h-4"/> Truck No</p>
                <p className="font-medium">{expense.truck_number}</p>
              </div>
            )}

            {expense.payment_mode && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-4 h-4"/> Payment Mode</p>
                <p className="font-medium">{expense.payment_mode}</p>
              </div>
            )}

            {expense.fuel_station_name && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Fuel Station</p>
                <p className="font-medium">{expense.fuel_station_name}</p>
              </div>
            )}

            {expense.liters && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">Quantity</p>
                <p className="font-medium">{expense.liters} Liters</p>
              </div>
            )}

            {expense.location && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Location</p>
                <p className="font-medium">{expense.location}</p>
              </div>
            )}

            {expense.driver_name && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4"/> Driver Name</p>
                <p className="font-medium">{expense.driver_name}</p>
              </div>
            )}

            {expense.service && (
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">Service Type</p>
                <p className="font-medium">{expense.service}</p>
              </div>
            )}

            {expense.service_provider_name && (
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4"/> Service Provider</p>
                <p className="font-medium">{expense.service_provider_name}</p>
              </div>
            )}

            {expense.expense_description && (
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">Description</p>
                <p className="font-medium">{expense.expense_description}</p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {expense.notes && (
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Notes / Remarks</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{expense.notes}</p>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> 
                Attachments ({files.length})
              </h4>
            </div>
            
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No documents attached.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {files.map((file, idx) => {
                  const url = getFileUrl(expense.rawRecord, file);
                  const isImage = file.match(/\.(jpeg|jpg|gif|png)$/i);
                  
                  return (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden group relative bg-background">
                      {isImage ? (
                        <div className="aspect-video w-full relative">
                          <img src={url} alt="Attachment preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" asChild className="h-8 w-8 rounded-full">
                              <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4"/></a>
                            </Button>
                            <Button size="icon" variant="secondary" asChild className="h-8 w-8 rounded-full">
                              <a href={url} download><Download className="w-4 h-4"/></a>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" title={file}>{file}</p>
                          </div>
                          <Button size="icon" variant="ghost" asChild className="shrink-0 h-8 w-8">
                            <a href={url} download><Download className="w-4 h-4"/></a>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border">
            <p>Created: {format(new Date(expense.created), 'dd MMM yyyy, HH:mm')}</p>
            <p>Updated: {format(new Date(expense.updated), 'dd MMM yyyy, HH:mm')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsModal;