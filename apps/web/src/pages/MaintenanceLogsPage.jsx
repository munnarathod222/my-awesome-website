import React, { useState } from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MaintenanceLogsPage() {
  const { data, loading, deleteRecord } = useMaintenanceData('maintenance_logs');

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Maintenance Logs</h1>
          <p className="text-muted-foreground text-sm">Record of all completed maintenance work.</p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Log
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(log => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono">{log.truck_id}</TableCell>
                <TableCell>{log.category}</TableCell>
                <TableCell>{log.mileage?.toLocaleString()} km</TableCell>
                <TableCell>{log.technician_name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                    if(window.confirm('Delete this log?')) deleteRecord(log.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No logs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}