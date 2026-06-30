import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import pb from '@/lib/pocketbaseClient.js';

export default function ContactExportModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('All');
  const [fields, setFields] = useState({
    company_name: true,
    contact_type: true,
    phone_number: true,
    email: true,
    gstin: true,
    physical_address: true,
    notes: false,
    created: false
  });

  const handleToggleField = (field) => {
    setFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExport = async () => {
    const selectedFields = Object.keys(fields).filter(k => fields[k]);
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setLoading(true);
    try {
      let filter = '';
      if (exportType !== 'All') {
        filter = `contact_type="${exportType}"`;
      }

      const records = await pb.collection('contacts').getFullList({
        filter,
        sort: '-created',
        $autoCancel: false
      });

      if (records.length === 0) {
        toast.info('No contacts found for the selected criteria');
        setLoading(false);
        return;
      }

      const exportData = records.map(record => {
        const row = {};
        selectedFields.forEach(field => {
          row[field] = record[field] || '';
        });
        return row;
      });

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('url');
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_export_${exportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${records.length} contacts`);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Export Category</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Contacts</SelectItem>
                <SelectItem value="Client">Clients Only</SelectItem>
                <SelectItem value="Driver">Drivers Only</SelectItem>
                <SelectItem value="Vendor">Vendors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Fields to Include</Label>
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-4 rounded-lg border border-border">
              {Object.entries(fields).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`field-${key}`} 
                    checked={value} 
                    onCheckedChange={() => handleToggleField(key)} 
                  />
                  <label 
                    htmlFor={`field-${key}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {key.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Download CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}