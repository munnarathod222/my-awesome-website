import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, MapPin, Smartphone, Clock, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function VehicleScanAnalyticsModal({ isOpen, onClose, truck }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!truck) return;
    setLoading(true);
    try {
      const records = await pb.collection('vehicle_scan_logs').getFullList({
        filter: `truck_number = "${truck.truck_number}"`,
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);
      setLogs(records || []);
    } catch (e) {
      console.error('Failed to fetch scan logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && truck) {
      fetchLogs();
    }
  }, [isOpen, truck]);

  if (!truck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border shadow-2xl rounded-2xl p-6 font-sans">
        <DialogHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Vehicle QR Scan Audit History
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live scan logs for {truck.truck_number} — Officers, Traffic Police, & Roadside Inspections
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="rounded-xl text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-border/50">
            <div className="text-xs font-semibold text-foreground">
              Total Scans Recorded: <span className="font-extrabold text-primary font-mono text-sm ml-1">{logs.length}</span>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Active Protection
            </Badge>
          </div>

          <div className="border border-border/60 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-border/40">
                  <TableHead className="font-semibold text-muted-foreground text-xs py-3 pl-4">Scan Date & Time</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-xs py-3">Device / OS</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-xs py-3">Inspection Purpose</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-xs py-3 pr-4 text-right">GPS Coordinates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="py-3 pr-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs">
                      No QR scan logs recorded yet for this vehicle.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map(log => (
                    <TableRow key={log.id} className="hover:bg-muted/20 text-xs font-mono">
                      <TableCell className="pl-4 py-3 font-semibold text-foreground">
                        {new Date(log.created).toLocaleString()}
                      </TableCell>

                      <TableCell className="py-3 text-muted-foreground flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-primary opacity-80" />
                        {log.device_type || 'Mobile Web'}
                      </TableCell>

                      <TableCell className="py-3 text-foreground font-sans">
                        {log.purpose || 'Roadside Inspection'}
                      </TableCell>

                      <TableCell className="py-3 pr-4 text-right">
                        {log.location_lat && log.location_lng ? (
                          <a
                            href={`https://maps.google.com/?q=${log.location_lat},${log.location_lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center justify-end gap-1"
                          >
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {log.location_lat.toFixed(4)}, {log.location_lng.toFixed(4)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[11px] font-sans">Location Not Shared</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/40">
          <Button onClick={onClose} variant="outline" className="rounded-xl text-xs">
            Close Audit Logs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
