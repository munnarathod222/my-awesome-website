import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronsUpDown, Loader2, UserPlus, Building2, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

const BulkAssignTripsModal = ({ isOpen, onClose, selectedTrips, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failedTrips, setFailedTrips] = useState([]);
  const [showErrorState, setShowErrorState] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      setSelectedClientId('');
      setFailedTrips([]);
      setShowErrorState(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const records = await pb.collection('clients').getFullList({
        sort: 'client_name',
        filter: 'status != "Inactive" && status != "Suspended"',
        $autoCancel: false
      });
      setClients(records);
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Failed to load clients list.');
    } finally {
      setLoadingClients(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Helper for exponential backoff retry
  const updateWithRetry = async (tripId, payload, retries = 3, delay = 1000) => {
    try {
      // (1) Ensure client_id is a string, and (8) Handle response properly
      const result = await pb.collection('trip_logs').update(tripId, payload, { $autoCancel: false });
      return result;
    } catch (err) {
      if (retries > 0) {
        console.warn(`[BulkAssign] Retry ${4 - retries} for trip ${tripId}. Waiting ${delay}ms. Error:`, err.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return updateWithRetry(tripId, payload, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const processAssignments = async (tripsToProcess) => {
    // (2) Add proper validation before updating
    if (!selectedClientId || typeof selectedClientId !== 'string' || selectedClientId.trim() === '') {
      toast.error('Please select a valid client first.');
      return;
    }
    
    if (!tripsToProcess || tripsToProcess.length === 0) {
      toast.error('No trips selected.');
      return;
    }

    setIsAssigning(true);
    setShowErrorState(false);
    setProgress({ current: 0, total: tripsToProcess.length });
    
    const newlyFailed = [];
    let successCount = 0;

    // Process sequentially to track progress and handle individual failures gracefully
    for (const trip of tripsToProcess) {
      try {
        const currentDateStr = format(new Date(), 'dd MMM yyyy HH:mm');
        const assignmentNote = `Assigned to client on ${currentDateStr}.`;
        
        const payload = {
          client_id: String(selectedClientId),
          trip_status: 'Completed',
          notes: trip.notes ? `${trip.notes}\n${assignmentNote}` : assignmentNote
        };

        // (3) Implement retry logic with exponential backoff
        await updateWithRetry(trip.id, payload);
        
        successCount++;
        setProgress(p => ({ ...p, current: p.current + 1 }));
      } catch (err) {
        // (4) Add detailed error logging to console
        console.error(`[BulkAssign] Failed to assign trip ${trip.id} (${trip.route}) after all retries:`, err);
        newlyFailed.push(trip);
      }
    }

    setIsAssigning(false);

    if (newlyFailed.length > 0) {
      setFailedTrips(newlyFailed);
      setShowErrorState(true);
      // (5) Update error messages to be user-friendly
      if (successCount > 0) {
        toast.error(`${successCount} assigned. ${newlyFailed.length} failed. Please retry.`);
      } else {
        toast.error(`Failed to assign all ${newlyFailed.length} trip(s). Please try again.`);
      }
    } else {
      toast.success(`${successCount} trip(s) successfully assigned to client.`);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleAssign = () => processAssignments(selectedTrips);
  
  // (6) Add a 'Retry Now' button in the error state
  const handleRetryFailed = () => processAssignments(failedTrips);

  const displayTrips = showErrorState ? failedTrips : selectedTrips;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isAssigning && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {showErrorState ? <AlertCircle className="w-5 h-5 text-destructive" /> : <UserPlus className="w-5 h-5 text-primary" />}
            {showErrorState ? 'Assignment Incomplete' : 'Assign Trips to Client'}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {showErrorState 
              ? `We encountered issues assigning the following ${failedTrips.length} trip(s). You can retry the failed items.`
              : `You are about to assign ${selectedTrips?.length || 0} trip(s) to a client. This will also update their status to "Completed".`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Trip Summary List */}
          <div className="space-y-2">
            <h4 className={cn("text-sm font-medium", showErrorState ? "text-destructive" : "text-foreground")}>
              {showErrorState ? 'Failed Trips' : 'Selected Trips Summary'}
            </h4>
            <div className={cn(
              "bg-muted/30 border rounded-lg max-h-[160px] overflow-y-auto",
              showErrorState ? "border-destructive/30" : "border-border"
            )}>
              <ul className="divide-y divide-border">
                {displayTrips?.map((trip, idx) => (
                  <li key={trip.id || idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium">{trip.route}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(trip.date), 'dd MMM yyyy')} • {trip.driver_name} ({trip.truck_number})
                      </span>
                    </div>
                    <div className="text-right font-medium text-foreground">
                      ₹{(trip.revenue || 0).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Client Selection (Only show if not in error state, or disable it if we are just retrying) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Selected Client</label>
            <Popover open={openCombobox && !showErrorState && !isAssigning} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between bg-background border-border"
                  disabled={loadingClients || isAssigning || showErrorState}
                >
                  {loadingClients ? (
                    <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading clients...</span>
                  ) : selectedClient ? (
                    <span className="truncate">{selectedClient.client_name}</span>
                  ) : (
                    <span className="text-muted-foreground">Search and select a client...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search client by name or email..." />
                  <CommandList>
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={`${client.client_name} ${client.email}`}
                          onSelect={() => {
                            setSelectedClientId(client.id);
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClientId === client.id ? "opacity-100 text-primary" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium truncate">{client.client_name}</span>
                            <span className="text-xs text-muted-foreground truncate">{client.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Client Details Card */}
            {selectedClient && (
              <div className="mt-3 bg-secondary/20 border border-secondary/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary/50 rounded-full shrink-0">
                    <Building2 className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h5 className="font-medium text-sm text-foreground truncate">{selectedClient.client_name}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                      {selectedClient.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{selectedClient.email}</span>
                        </div>
                      )}
                      {selectedClient.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Phone className="w-3 h-3 shrink-0" /> <span className="truncate">{selectedClient.phone}</span>
                        </div>
                      )}
                      {(selectedClient.city || selectedClient.state) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate sm:col-span-2">
                          <MapPin className="w-3 h-3 shrink-0" /> 
                          <span className="truncate">
                            {[selectedClient.city, selectedClient.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* (7) Improve loading state UI with a progress indicator */}
          {isAssigning && progress.total > 0 && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Assigning trips...</span>
                <span className="font-medium">{progress.current} of {progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            {showErrorState ? 'Cancel' : 'Cancel'}
          </Button>
          
          {showErrorState ? (
            <Button onClick={handleRetryFailed} disabled={isAssigning} variant="default">
              {isAssigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isAssigning ? 'Retrying...' : 'Retry Failed'}
            </Button>
          ) : (
            <Button onClick={handleAssign} disabled={!selectedClientId || isAssigning}>
              {isAssigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {isAssigning ? 'Assigning...' : 'Assign to Client'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAssignTripsModal;