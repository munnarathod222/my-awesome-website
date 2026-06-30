import React from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

export default function PartsInstalledPage() {
  const { data, loading, deleteRecord } = useMaintenanceData('parts_installed');

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Parts Installed</h1>
          <p className="text-muted-foreground text-sm">Track parts and their warranties.</p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Part No.</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Installed</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(part => (
              <TableRow key={part.id}>
                <TableCell className="font-medium">{part.part_name}</TableCell>
                <TableCell className="font-mono">{part.truck_id}</TableCell>
                <TableCell className="font-mono text-xs">{part.part_number || <span className="text-muted-foreground italic text-xs">N/A</span>}</TableCell>
                <TableCell className="font-mono text-xs">{part.serial_number}</TableCell>
                <TableCell>{new Date(part.installation_date).toLocaleDateString()}</TableCell>
                <TableCell><StatusBadge status={part.warranty_expiration_date} type="warranty" /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                    if(window.confirm('Delete this part record?')) deleteRecord(part.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No parts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}