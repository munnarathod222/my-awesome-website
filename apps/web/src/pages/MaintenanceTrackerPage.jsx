import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Bell, Wrench, AlertTriangle, ClipboardList, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';

// Import all four modal components
import AddMaintenanceLogModal from '@/components/AddMaintenanceLogModal.jsx';
import AddMaintenanceReminderModal from '@/components/AddMaintenanceReminderModal.jsx';
import AddPartsInstalledModal from '@/components/AddPartsInstalledModal.jsx';
import AddMaintenanceProblemModal from '@/components/AddMaintenanceProblemModal.jsx';

export default function MaintenanceTrackerPage() {
  // Modal visibility states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Data lists states
  const [logs, setLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [parts, setParts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [editingLog, setEditingLog] = useState(null);

  // Click Handlers
  const handleAddLogClick = () => {
    console.log('Button clicked: Add Log');
    setShowLogModal(true);
  };

  const handleAddReminderClick = () => {
    console.log('Button clicked: Add Reminder');
    setShowReminderModal(true);
  };

  const handleAddPartClick = () => {
    console.log('Button clicked: Add Part');
    setShowPartModal(true);
  };

  const handleReportProblemClick = () => {
    console.log('Button clicked: Report Problem');
    setShowProblemModal(true);
  };

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, remindersRes, partsRes, problemsRes] = await Promise.all([
        pb.collection('maintenance_logs').getFullList({ sort: '-date', $autoCancel: false }).catch(() => []),
        pb.collection('maintenance_reminders').getFullList({ sort: 'reminder_date', $autoCancel: false }).catch(() => []),
        pb.collection('parts_installed').getFullList({ sort: '-installation_date', $autoCancel: false }).catch(() => []),
        pb.collection('maintenance_problems').getFullList({ sort: '-date_reported', $autoCancel: false }).catch(() => [])
      ]);

      setLogs(logsRes);
      setReminders(remindersRes);
      setParts(partsRes);
      setProblems(problemsRes);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to load maintenance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (collection, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await pb.collection(collection).delete(id, { $autoCancel: false });
      toast.success('Record deleted successfully');
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete record');
    }
  };

  // Submit Handlers
  const handleLogSubmit = async (data) => {
    try {
      if (editingLog) {
        await pb.collection('maintenance_logs').update(editingLog.id, {
          ...data,
          date: new Date(data.date).toISOString()
        }, { $autoCancel: false });
        toast.success('Maintenance log updated successfully');
      } else {
        await pb.collection('maintenance_logs').create({
          ...data,
          date: new Date(data.date).toISOString()
        }, { $autoCancel: false });
        toast.success('Maintenance log added successfully');
      }
      setShowLogModal(false);
      setEditingLog(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(editingLog ? 'Failed to update maintenance log' : 'Failed to add maintenance log');
    }
  };

  const handleReminderSubmit = async (data) => {
    try {
      await pb.collection('maintenance_reminders').create({
        ...data,
        reminder_date: new Date(data.reminder_date).toISOString()
      }, { $autoCancel: false });
      toast.success('Reminder added successfully');
      setShowReminderModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add reminder');
    }
  };

  const handlePartSubmit = async (data) => {
    try {
      let payload;
      if (data instanceof FormData) {
        payload = data;
        if (payload.has('installation_date')) {
          payload.set('installation_date', new Date(payload.get('installation_date')).toISOString());
        }
        if (payload.has('warranty_expiration_date') && payload.get('warranty_expiration_date')) {
          payload.set('warranty_expiration_date', new Date(payload.get('warranty_expiration_date')).toISOString());
        }
      } else {
        payload = {
          ...data,
          installation_date: new Date(data.installation_date).toISOString(),
          warranty_expiration_date: data.warranty_expiration_date ? new Date(data.warranty_expiration_date).toISOString() : ''
        };
      }
      await pb.collection('parts_installed').create(payload, { $autoCancel: false });
      toast.success('Part installation recorded successfully');
      setShowPartModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to record part');
    }
  };

  const handleProblemSubmit = async (data) => {
    try {
      let payload;
      if (data instanceof FormData) {
        payload = data;
        if (payload.has('date_reported')) {
          payload.set('date_reported', new Date(payload.get('date_reported')).toISOString());
        }
      } else {
        payload = {
          ...data,
          date_reported: new Date(data.date_reported).toISOString()
        };
      }
      await pb.collection('maintenance_problems').create(payload, { $autoCancel: false });
      toast.success('Problem reported successfully');
      setShowProblemModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to report problem');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return format(new Date(isoString), 'MMM dd, yyyy');
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <Helmet>
        <title>Maintenance Tracker | Fleet Management</title>
      </Helmet>

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
            Maintenance Tracker
          </h1>
          <p className="text-muted-foreground mt-2">Manage logs, reminders, parts, and issues in one place.</p>
        </div>
        
        {/* RAW HTML BUTTONS FOR GUARANTEED CLICKS */}
        <div className="flex flex-wrap items-center gap-3 relative z-50">
          <button 
            type="button" 
            onClick={handleAddLogClick} 
            className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          >
            <ClipboardList className="w-4 h-4 mr-2" /> Add Log
          </button>
          
          <button 
            type="button" 
            onClick={handleAddReminderClick} 
            className="flex items-center px-4 py-2.5 bg-warning text-warning-foreground font-semibold rounded-lg shadow-md hover:bg-warning/90 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          >
            <Bell className="w-4 h-4 mr-2" /> Add Reminder
          </button>
          
          <button 
            type="button" 
            onClick={handleAddPartClick} 
            className="flex items-center px-4 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-md hover:bg-secondary/90 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          >
            <Wrench className="w-4 h-4 mr-2" /> Add Part
          </button>
          
          <button 
            type="button" 
            onClick={handleReportProblemClick} 
            className="flex items-center px-4 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg shadow-md hover:bg-destructive/90 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Report Problem
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">Loading maintenance data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          
          {/* Maintenance Logs Section */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" /> Maintenance Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                 <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Mileage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No logs found</TableCell></TableRow>
                  ) : (
                    logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.date)}</TableCell>
                        <TableCell className="font-medium">{log.truck_id}</TableCell>
                        <TableCell>{log.category}</TableCell>
                        <TableCell>{log.technician_name}</TableCell>
                        <TableCell className="text-right">{log.mileage?.toLocaleString()} km</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingLog(log); setShowLogModal(true); }} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit Log">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete('maintenance_logs', log.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete Log">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Maintenance Reminders Section */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-warning" /> Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reminder Date</TableHead>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Maintenance Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No reminders found</TableCell></TableRow>
                  ) : (
                    reminders.map(rem => (
                      <TableRow key={rem.id}>
                        <TableCell>{formatDate(rem.reminder_date)}</TableCell>
                        <TableCell className="font-medium">{rem.truck_id}</TableCell>
                        <TableCell>{rem.maintenance_type}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            rem.status === 'Completed' ? 'bg-success/10 text-success' :
                            rem.status === 'Overdue' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }`}>
                            {rem.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Parts Installed Section */}
          <Card className="rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Parts Installed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Install Date</TableHead>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Warranty Expiry</TableHead>
                    <TableHead>Images</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No parts found</TableCell></TableRow>
                  ) : (
                    parts.map(part => (
                      <TableRow key={part.id}>
                        <TableCell>{formatDate(part.installation_date)}</TableCell>
                        <TableCell className="font-medium">{part.truck_id}</TableCell>
                        <TableCell>{part.part_name}</TableCell>
                        <TableCell>{part.part_number || <span className="text-muted-foreground italic text-xs">N/A</span>}</TableCell>
                        <TableCell>{part.serial_number}</TableCell>
                        <TableCell>{formatDate(part.warranty_expiration_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {part.image_urls?.map((img, idx) => {
                              const url = pb.files.getUrl(part, img);
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => setActiveLightboxImage(url)}
                                  className="w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm"
                                  title="View Image"
                                >
                                  <img src={url} alt="part" className="w-full h-full object-cover" />
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Maintenance Problems Section */}
          <Card className="rounded-2xl shadow-sm overflow-hidden border-destructive/20">
            <CardHeader className="border-b bg-destructive/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" /> Reported Problems
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Reported</TableHead>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Images</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No problems reported</TableCell></TableRow>
                  ) : (
                    problems.map(prob => (
                      <TableRow key={prob.id}>
                        <TableCell>{formatDate(prob.date_reported)}</TableCell>
                        <TableCell className="font-medium">{prob.truck_id}</TableCell>
                        <TableCell>{prob.category}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            prob.severity === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                            prob.severity === 'High' ? 'bg-destructive/20 text-destructive' :
                            prob.severity === 'Medium' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {prob.severity}
                          </span>
                        </TableCell>
                        <TableCell>{prob.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {prob.image_urls?.map((img, idx) => {
                              const url = pb.files.getUrl(prob, img);
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => setActiveLightboxImage(url)}
                                  className="w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm"
                                  title="View Defect/Damage Image"
                                >
                                  <img src={url} alt="defect" className="w-full h-full object-cover" />
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
        </div>
      )}

      {/* Render Modals at the root level of the component */}
      {showLogModal && (
        <AddMaintenanceLogModal 
          isOpen={showLogModal} 
          onClose={() => { setShowLogModal(false); setEditingLog(null); }} 
          onSubmit={handleLogSubmit} 
          log={editingLog} 
        />
      )}
      <AddMaintenanceReminderModal 
        isOpen={showReminderModal} 
        onClose={() => setShowReminderModal(false)} 
        onSubmit={handleReminderSubmit} 
      />
      <AddPartsInstalledModal 
        isOpen={showPartModal} 
        onClose={() => setShowPartModal(false)} 
        onSubmit={handlePartSubmit} 
      />
      <AddMaintenanceProblemModal 
        isOpen={showProblemModal} 
        onClose={() => setShowProblemModal(false)} 
        onSubmit={handleProblemSubmit} 
      />
      
      {activeLightboxImage && (
        <Dialog open={!!activeLightboxImage} onOpenChange={() => setActiveLightboxImage(null)}>
          <DialogContent className="max-w-3xl border-none bg-black/90 p-0 overflow-hidden flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
              <img src={activeLightboxImage} alt="high-res" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setActiveLightboxImage(null)} 
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 text-sm w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}