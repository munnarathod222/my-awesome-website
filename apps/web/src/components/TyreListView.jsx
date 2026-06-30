import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TyreListView({ tyres, trucks, onEdit, onDelete, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [truckFilter, setTruckFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTyres = useMemo(() => {
    return tyres.filter(tyre => {
      const matchesSearch = tyre.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tyre.tyre_brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTruck = truckFilter === 'all' || tyre.truck_id === truckFilter;
      const matchesStatus = statusFilter === 'all' || tyre.status === statusFilter;
      
      return matchesSearch && matchesTruck && matchesStatus;
    });
  }, [tyres, searchTerm, truckFilter, statusFilter]);

  const getDepthBadge = (depth) => {
    if (depth >= 4) return <Badge variant="outline" className="bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] border-[hsl(var(--success))]">{depth} mm</Badge>;
    if (depth >= 2) return <Badge variant="outline" className="bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning))]">{depth} mm</Badge>;
    return <Badge variant="outline" className="bg-[hsl(var(--critical)/0.15)] text-[hsl(var(--critical))] border-[hsl(var(--critical))] flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {depth} mm</Badge>;
  };

  const getStatusBadge = (status) => {
    const map = {
      'active': 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]',
      'worn': 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]',
      'replaced': 'bg-muted text-muted-foreground',
      'damaged': 'bg-[hsl(var(--critical)/0.15)] text-[hsl(var(--critical))]'
    };
    return <Badge variant="outline" className={`capitalize ${map[status] || 'bg-muted'}`}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search serial no, brand..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={truckFilter} onValueChange={setTruckFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Trucks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trucks</SelectItem>
              {trucks.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="worn">Worn</SelectItem>
              <SelectItem value="replaced">Replaced</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Tyre
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Brand & Model</TableHead>
              <TableHead>Assigned Truck</TableHead>
              <TableHead>Axle Position</TableHead>
              <TableHead>Depth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTyres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No tyres found matching filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTyres.map(tyre => (
                <TableRow key={tyre.id}>
                  <TableCell className="font-medium">{tyre.serial_number}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{tyre.tyre_brand}</span>
                      <span className="text-xs text-muted-foreground">{tyre.model_no}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tyre.expand?.truck_id?.truck_number || <span className="text-muted-foreground italic">Unassigned</span>}
                  </TableCell>
                  <TableCell className="capitalize">{tyre.axle_position.replace('_', ' ')}</TableCell>
                  <TableCell>{getDepthBadge(tyre.tyre_depth_mm)}</TableCell>
                  <TableCell>{getStatusBadge(tyre.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tyre)}>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if(window.confirm('Are you sure you want to delete this tyre record?')) {
                        onDelete(tyre.id);
                      }
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}