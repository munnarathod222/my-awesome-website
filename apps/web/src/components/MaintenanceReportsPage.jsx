import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MaintenanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('completions');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'completions') {
        const records = await pb.collection('maintenance_records').getFullList({
          sort: '-completion_date',
          $autoCancel: false
        });
        
        // Fetch schedules to get type
        const schedules = await pb.collection('maintenance_schedules').getFullList({ $autoCancel: false });
        // Fetch trucks to get name
        const trucks = await pb.collection('trucks').getFullList({ $autoCancel: false });
        
        const enriched = records.map(rec => {
          const sch = schedules.find(s => s.id === rec.maintenance_schedule_id);
          const trk = trucks.find(t => t.id === rec.vehicle_id);
          return {
            ...rec,
            maintenance_type: sch ? sch.maintenance_type : 'Unknown',
            truck_number: trk ? trk.truck_number : 'Unknown',
          };
        });

        setData(enriched);
        setSummary({
          total_records: enriched.length,
          total_cost: enriched.reduce((sum, item) => sum + (item.actual_cost || 0), 0)
        });
      } else if (reportType === 'schedules') {
        const schedules = await pb.collection('maintenance_schedules').getFullList({
          sort: 'next_maintenance_date',
          $autoCancel: false
        });
        
        const trucks = await pb.collection('trucks').getFullList({ $autoCancel: false });
        
        const enriched = schedules.map(sch => {
          const trk = trucks.find(t => t.id === sch.vehicle_id);
          return {
            ...sch,
            truck_number: trk ? trk.truck_number : 'Unknown',
          };
        });

        setData(enriched);
        setSummary({
          total_schedules: enriched.length,
          due_count: enriched.filter(e => e.status === 'Due' || e.status === 'Overdue').length
        });
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data.length) return;
    
    let exportData = [];
    if (reportType === 'completions') {
      exportData = data.map(item => ({
        'Date': format(new Date(item.completion_date), 'yyyy-MM-dd'),
        'Vehicle': item.truck_number,
        'Type': item.maintenance_type,
        'Cost ($)': item.actual_cost || 0,
        'Technician': item.technician_id || 'N/A',
        'Status': item.status
      }));
    } else {
      exportData = data.map(item => ({
        'Vehicle': item.truck_number,
        'Type': item.maintenance_type,
        'Next Date': format(new Date(item.next_maintenance_date), 'yyyy-MM-dd'),
        'Status': item.status,
        'Priority': item.priority_level,
        'Est Cost ($)': item.estimated_cost || 0
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Maintenance_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data.length) return;
    
    const doc = new jsPDF();
    doc.text(`Fleet Maintenance Report - ${reportType === 'completions' ? 'Completion History' : 'Active Schedules'}`, 14, 15);
    
    let head = [];
    let body = [];

    if (reportType === 'completions') {
      head = [['Date', 'Vehicle', 'Type', 'Cost', 'Technician']];
      body = data.map(item => [
        format(new Date(item.completion_date), 'yyyy-MM-dd'),
        item.truck_number,
        item.maintenance_type,
        `$${(item.actual_cost || 0).toFixed(2)}`,
        item.technician_id || 'N/A'
      ]);
    } else {
      head = [['Vehicle', 'Type', 'Next Date', 'Status', 'Priority']];
      body = data.map(item => [
        item.truck_number,
        item.maintenance_type,
        format(new Date(item.next_maintenance_date), 'yyyy-MM-dd'),
        item.status,
        item.priority_level
      ]);
    }

    doc.autoTable({
      head: head,
      body: body,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Maintenance_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completions">Completion History</SelectItem>
              <SelectItem value="schedules">Active Schedules</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportToExcel} disabled={loading || !data.length} className="flex-1 sm:flex-none">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF} disabled={loading || !data.length} className="flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2 text-red-500" /> PDF
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{summary.total_records || summary.total_schedules}</p>
            </CardContent>
          </Card>
          {summary.total_cost !== undefined && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">${summary.total_cost.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
          {summary.due_count !== undefined && (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <p className="text-sm text-destructive font-medium">Action Needed</p>
                <p className="text-2xl font-bold text-destructive">{summary.due_count}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="border-border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {reportType === 'completions' ? (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Technician</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Next Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No data found for this report.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    {reportType === 'completions' ? (
                      <>
                        <TableCell>{format(new Date(item.completion_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="font-medium">{item.truck_number}</TableCell>
                        <TableCell>{item.maintenance_type}</TableCell>
                        <TableCell className="tabular-nums font-medium">${(item.actual_cost || 0).toFixed(2)}</TableCell>
                        <TableCell>{item.technician_id || '—'}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{item.truck_number}</TableCell>
                        <TableCell>{item.maintenance_type}</TableCell>
                        <TableCell>{format(new Date(item.next_maintenance_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.priority_level}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}