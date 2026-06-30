import React from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

export default function MaintenanceProblemsPage() {
  const { data, loading, deleteRecord } = useMaintenanceData('maintenance_problems');

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Reported Problems</h1>
          <p className="text-muted-foreground text-sm">Track and resolve vehicle issues.</p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Report Problem
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(prob => (
              <TableRow key={prob.id}>
                <TableCell>{new Date(prob.date_reported).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono">{prob.truck_id}</TableCell>
                <TableCell className="max-w-[200px] truncate">{prob.description}</TableCell>
                <TableCell><StatusBadge status={prob.severity} type="severity" /></TableCell>
                <TableCell><StatusBadge status={prob.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                    if(window.confirm('Delete this problem record?')) deleteRecord(prob.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No problems reported.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}