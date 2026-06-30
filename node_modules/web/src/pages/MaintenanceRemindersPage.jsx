import React from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

export default function MaintenanceRemindersPage() {
  const { data, loading, deleteRecord, updateRecord } = useMaintenanceData('maintenance_reminders');

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Reminders</h1>
          <p className="text-muted-foreground text-sm">Upcoming and overdue maintenance tasks.</p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Reminder
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(rem => (
              <TableRow key={rem.id}>
                <TableCell>{new Date(rem.reminder_date).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono">{rem.truck_id}</TableCell>
                <TableCell>{rem.maintenance_type}</TableCell>
                <TableCell><StatusBadge status={rem.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {rem.status !== 'Completed' && (
                      <Button variant="ghost" size="icon" className="text-success hover:bg-success/10" onClick={() => updateRecord(rem.id, { status: 'Completed' })}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                      if(window.confirm('Delete this reminder?')) deleteRecord(rem.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No reminders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}