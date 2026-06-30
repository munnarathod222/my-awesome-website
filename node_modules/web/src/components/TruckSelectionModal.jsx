import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const TruckSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('vehicles').getFullList({
        sort: 'vehicle_name',
        $autoCancel: false
      });
      setVehicles(records);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles.');
      toast.error('Failed to load vehicles from Truck Manager.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const term = searchTerm.toLowerCase();
    return vehicles.filter(v => 
      (v.vehicle_name && v.vehicle_name.toLowerCase().includes(term)) ||
      (v.registration_number && v.registration_number.toLowerCase().includes(term))
    );
  }, [vehicles, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">Select Truck from Manager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Truck Name</TableHead>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-destructive">
                        <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-80" />
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No trucks found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{vehicle.vehicle_name}</TableCell>
                        <TableCell className="font-mono text-sm">{vehicle.registration_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            vehicle.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
                            vehicle.status === 'Maintenance' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-muted text-muted-foreground'
                          }>
                            {vehicle.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              onSelect(vehicle);
                              onClose();
                            }}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TruckSelectionModal;