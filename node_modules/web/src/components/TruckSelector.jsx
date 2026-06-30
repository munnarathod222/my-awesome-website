import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, Mail, AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function TruckSelector({ selectedTruckId, onTruckSelect }) {
  const [trucks, setTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrucks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const records = await pb.collection('trucks').getFullList({
          sort: 'truck_number',
          $autoCancel: false,
        });
        setTrucks(records);
      } catch (err) {
        console.error('Error fetching trucks:', err);
        setError('Failed to load trucks.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const selectedTruck = trucks.find(t => t.id === selectedTruckId || t.truck_number === selectedTruckId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex justify-between">
          <span>Truck ID <span className="text-destructive">*</span></span>
          {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
        </Label>
        
        {error ? (
          <div className="flex items-center gap-2 p-2.5 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : (
          <Select 
            value={selectedTruckId} 
            onValueChange={onTruckSelect} 
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoading ? "Loading trucks..." : "Select a truck"} />
            </SelectTrigger>
            <SelectContent>
              {trucks.length === 0 && !isLoading ? (
                <div className="p-2 text-sm text-muted-foreground text-center">No trucks found</div>
              ) : (
                trucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.truck_number}>
                    {truck.truck_number} {truck.manager_name ? `(Manager: ${truck.manager_name})` : '(Manager: Unassigned)'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedTruck && (
        <Card className="bg-muted/40 border-border/50 shadow-none overflow-hidden rounded-xl">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Manager Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="font-medium">{selectedTruck.manager_name || 'Not assigned'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedTruck.manager_phone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="font-medium truncate max-w-[120px]" title={selectedTruck.manager_email || 'N/A'}>
                    {selectedTruck.manager_email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}