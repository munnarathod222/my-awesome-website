import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Pencil, UploadCloud, AlertCircle, Truck, Loader2, CheckSquare, PlusCircle, Trash2, UserPlus, Search, Route as RouteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import TripEditModal from '@/components/TripEditModal.jsx';
import BulkUploadTripsModal from '@/components/BulkUploadTripsModal.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import AddTripModal from '@/components/AddTripModal.jsx';
import AddRecurringTripModal from '@/components/AddRecurringTripModal.jsx';
import PaymentRequestModal from '@/components/PaymentRequestModal.jsx';
import BulkAssignTripsModal from '@/components/BulkAssignTripsModal.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/analyticsUtils.js';
import { TRIP_STATUS_OPTIONS, getTripStatusLabel, getTripStatusColor } from '@/lib/tripStatusUtils.js';
import { motion } from 'framer-motion';

const TripLogsPage = () => {
  const { currentUser } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  // Status Change Modals
  const [statusChangeTrip, setStatusChangeTrip] = useState(null);
  const [newTripStatus, setNewTripStatus] = useState('');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [paymentRequestTrip, setPaymentRequestTrip] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [tripStatusFilter, setTripStatusFilter] = useState('all');

  // Bulk Selection & Action State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState('');
  const [bulkTripStatus, setBulkTripStatus] = useState('');
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  
  const [deleteDialogData, setDeleteDialogData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [assignDialogData, setAssignDialogData] = useState(null);

  const fetchData = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [employeesData, trucksData, logsData] = await Promise.all([
        pb.collection('employees').getFullList({ filter: 'employee_type = "driver"', $autoCancel: false }),
        pb.collection('trucks').getFullList({ $autoCancel: false }),
        pb.collection('trip_logs').getFullList({ sort: '-date', expand: 'client_id', $autoCancel: false })
      ]);
      
      setEmployees(employeesData);
      setTrucks(trucksData);
      setTripLogs(logsData);
    } catch (err) {
      console.error('[TripLogsPage] Error fetching data:', err);
      setError('Failed to load trip logs data. Please check your connection and try again.');
      toast.error('Failed to load data.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (tripId) => {
    setSelectedTripId(tripId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTripId(null);
  };

  const handleBadgeClick = (trip) => {
    setStatusChangeTrip(trip);
    setNewTripStatus(trip.trip_status || 'Upcoming');
  };

  const saveStatusChange = async () => {
    if (!statusChangeTrip) return;
    
    if (statusChangeTrip.trip_status === newTripStatus) {
      setStatusChangeTrip(null);
      return;
    }

    if (newTripStatus === 'Delivered') {
      setStatusChangeTrip(null);
      setPaymentRequestTrip(statusChangeTrip);
      return;
    }

    setIsStatusUpdating(true);
    try {
      await pb.collection('trip_logs').update(statusChangeTrip.id, {
        trip_status: newTripStatus
      }, { $autoCancel: false });
      
      try {
        const relatedTx = await pb.collection('cashbook_transactions').getFullList({
          filter: `source_record_id = "${statusChangeTrip.id}"`,
          $autoCancel: false
        });
        
        for (const tx of relatedTx) {
          const cleanDesc = tx.description.replace(/ \(Trip Status: .*?\)/, '');
          await pb.collection('cashbook_transactions').update(tx.id, {
            description: `${cleanDesc} (Trip Status: ${newTripStatus})`
          }, { $autoCancel: false });
        }
      } catch (txErr) {
        console.warn('Failed to sync with cashbook transactions (non-critical):', txErr);
      }

      toast.success('Trip status updated');
      fetchData();
    } catch (err) {
      console.error('Update err:', err);
      toast.error('Failed to update status');
    } finally {
      setIsStatusUpdating(false);
      setStatusChangeTrip(null);
    }
  };

  const filteredLogs = tripLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (log.trip_id && log.trip_id.toLowerCase().includes(query)) ||
      (log.driver_name && log.driver_name.toLowerCase().includes(query)) ||
      (log.route && log.route.toLowerCase().includes(query)) ||
      (log.truck_number && log.truck_number.toLowerCase().includes(query));

    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'blank' ? !log.client_payment_status : log.client_payment_status === paymentFilter);
    const matchesStatus = tripStatusFilter === 'all' || log.trip_status === tripStatusFilter;
    
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLogs.map(log => log.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if ((!bulkPaymentStatus && !bulkTripStatus) || selectedIds.length === 0) return;
    
    setIsUpdatingBulk(true);
    try {
      const updates = {};
      if (bulkPaymentStatus) updates.client_payment_status = bulkPaymentStatus === 'blank' ? '' : bulkPaymentStatus;
      if (bulkTripStatus) updates.trip_status = bulkTripStatus;

      const updatePromises = selectedIds.map(id => 
        pb.collection('trip_logs').update(id, updates, { $autoCancel: false })
      );
      
      await Promise.all(updatePromises);
      
      toast.success(`${selectedIds.length} trip(s) updated successfully`);
      setSelectedIds([]);
      setBulkPaymentStatus('');
      setBulkTripStatus('');
      fetchData();
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error('Failed to update some trip logs. Please try again.');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteDialogData || deleteDialogData.length === 0) return;
    
    setIsDeleting(true);
    try {
      const deletePromises = deleteDialogData.map(trip => 
        pb.collection('trip_logs').delete(trip.id, { $autoCancel: false })
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`${deleteDialogData.length} trip(s) deleted successfully`);
      
      const deletedIds = deleteDialogData.map(t => t.id);
      setSelectedIds(prev => prev.filter(id => !deletedIds.includes(id)));
      
      setDeleteDialogData(null);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(`Failed to delete trips: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateTripField = async (tripId, fieldName, value) => {
    try {
      await pb.collection('trip_logs').update(tripId, { [fieldName]: value }, { $autoCancel: false });
      toast.success(`Updated ${fieldName === 'truck_number' ? 'truck' : 'driver'} successfully`);
      fetchData();
    } catch (err) {
      console.error(`Failed to update ${fieldName}:`, err);
      toast.error(`Failed to update ${fieldName}`);
    }
  };

  if (dataLoading) {


    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingSpinner text="Loading trip logs and fleet data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Data Load Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchData} className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Trip Logs - Jai Bhavani Cargo</title>
      </Helmet>
      <div className="h-full w-full bg-background flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-5 shrink-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground">Trip Logs</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">Manage fleet shipments, driver assignments, and monitor payment progress.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setIsBulkModalOpen(true)} variant="outline" className="bg-card shadow-sm rounded-xl hover:border-primary/50">
                <UploadCloud className="w-4 h-4 mr-2" /> Bulk Upload
              </Button>
              <Button onClick={() => setIsRecurringModalOpen(true)} variant="outline" className="bg-card shadow-sm rounded-xl hover:border-primary/50">
                <RouteIcon className="w-4 h-4 mr-2" /> Add Recurring Trips
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm rounded-xl">
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Trip
              </Button>
            </div>
          </div>

          <Card className="shadow-soft border-border/50 bg-card rounded-2xl flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-5 border-b border-border/40 bg-secondary/10 shrink-0">
              <div>
                <CardTitle className="font-heading text-xl">Recent Shipments</CardTitle>
                <CardDescription>Comprehensive list of all fleet operations.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 min-w-[200px] xl:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by Trip ID, route..." 
                    className="pl-9 h-10 bg-background rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={tripStatusFilter} onValueChange={setTripStatusFilter}>
                  <SelectTrigger className="w-[150px] h-10 bg-background rounded-xl">
                    <SelectValue placeholder="Trip Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trips</SelectItem>
                    {TRIP_STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[150px] h-10 bg-background rounded-xl">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Paid</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="blank">Unset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              
              {selectedIds.length > 0 && (
                <div className="bg-primary/5 border-b border-primary/10 px-6 py-4 flex flex-wrap items-center gap-4 shrink-0">
                  <Badge variant="secondary" className="bg-background border-border text-foreground font-semibold px-3 py-1 text-sm shadow-sm rounded-lg">
                    <CheckSquare className="w-4 h-4 mr-2 text-primary" />
                    {selectedIds.length} selected
                  </Badge>
                  <div className="h-6 w-px bg-border hidden sm:block"></div>
                  
                  <Select value={bulkTripStatus} onValueChange={setBulkTripStatus}>
                    <SelectTrigger className="w-[160px] h-9 bg-background focus:ring-primary text-sm rounded-lg">
                      <SelectValue placeholder="Set Status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIP_STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={bulkPaymentStatus} onValueChange={setBulkPaymentStatus}>
                    <SelectTrigger className="w-[160px] h-9 bg-background focus:ring-primary text-sm rounded-lg">
                      <SelectValue placeholder="Set Payment..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Mark Pending</SelectItem>
                      <SelectItem value="received">Mark Paid</SelectItem>
                      <SelectItem value="delayed">Mark Delayed</SelectItem>
                      <SelectItem value="blank">Clear Status</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    size="sm" 
                    className="rounded-lg shadow-sm"
                    onClick={handleBulkUpdate} 
                    disabled={(!bulkPaymentStatus && !bulkTripStatus) || isUpdatingBulk}
                  >
                    {isUpdatingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Apply Updates'}
                  </Button>
                  
                  <div className="ml-auto flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-background rounded-lg hover:border-primary/50"
                      onClick={() => setAssignDialogData(filteredLogs.filter(l => selectedIds.includes(l.id)))}
                      disabled={isUpdatingBulk || isDeleting}
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Assign Client
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="rounded-lg shadow-sm"
                      onClick={() => setDeleteDialogData(filteredLogs.filter(l => selectedIds.includes(l.id)))}
                      disabled={isUpdatingBulk || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2 hidden sm:inline" /> Delete Selected
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setSelectedIds([])}
                      className="text-muted-foreground hover:bg-secondary rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto flex-1 h-full">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                    <TableRow className="hover:bg-transparent border-b-border/50">
                      <TableHead className="w-[50px] pl-6">
                        <Checkbox 
                          checked={filteredLogs.length > 0 && selectedIds.length === filteredLogs.length}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Trip ID</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Client Details</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Driver & Asset</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Route Info</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Revenue</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Advances</TableHead>
                      <TableHead className="text-center font-semibold text-muted-foreground">Trip State</TableHead>
                      <TableHead className="text-center font-semibold text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-right pr-6 font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-20 text-muted-foreground">
                          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-lg font-medium text-foreground">No shipments found</p>
                          <p className="text-sm mt-1 mb-4">Try adjusting your filters or add a new log.</p>
                          {tripLogs.length === 0 && (
                            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl shadow-sm">
                              Create First Trip
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map(log => {
                        const isSelected = selectedIds.includes(log.id);
                        return (
                          <TableRow 
                            key={log.id} 
                            className={cn(
                              "transition-all duration-200 border-b-border/40 group",
                              isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                            )}
                          >
                            <TableCell className="pl-6">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleSelectRow(log.id)}
                                aria-label={`Select row ${log.id}`}
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-mono font-bold text-sm text-primary">
                              {log.trip_id || '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-medium text-sm text-foreground">
                              {format(new Date(log.date), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                              {log.expand?.client_id ? (
                                <span className="font-semibold text-sm text-foreground">{log.expand.client_id.client_name}</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-col gap-1 min-w-[140px]">
                                <Select
                                  value={log.truck_number || ''}
                                  onValueChange={async (newTruck) => {
                                    if (!newTruck || newTruck === log.truck_number) return;
                                    const conflicting = tripLogs.find(otherLog => 
                                      otherLog.id !== log.id &&
                                      otherLog.truck_number === newTruck &&
                                      otherLog.trip_status !== 'Cancelled' &&
                                      otherLog.date.split(' ')[0] === log.date.split(' ')[0]
                                    );
                                    if (conflicting) {
                                      const proceed = window.confirm(`Warning: Truck ${newTruck} is already assigned to ${conflicting.trip_id || 'another trip'} on this date. Assign anyway?`);
                                      if (!proceed) return;
                                    }
                                    await updateTripField(log.id, 'truck_number', newTruck);
                                  }}
                                >
                                  <SelectTrigger className="h-7 border-none bg-transparent hover:bg-muted/80 px-2 py-0.5 font-bold text-sm text-foreground focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 w-full justify-start gap-1 rounded-md transition-colors">
                                    <SelectValue placeholder="Select Truck" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trucks.map(t => {
                                      const isConflicted = tripLogs.some(otherLog => 
                                        otherLog.id !== log.id &&
                                        otherLog.truck_number === t.truck_number &&
                                        otherLog.trip_status !== 'Cancelled' &&
                                        otherLog.date.split(' ')[0] === log.date.split(' ')[0]
                                      );
                                      return (
                                        <SelectItem key={t.id} value={t.truck_number}>
                                          <span>{t.truck_number} {isConflicted ? '(Booked today)' : ''}</span>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={log.driver_name || ''}
                                  onValueChange={async (newDriver) => {
                                    if (!newDriver || newDriver === log.driver_name) return;
                                    await updateTripField(log.id, 'driver_name', newDriver);
                                  }}
                                >
                                  <SelectTrigger className="h-6 border-none bg-transparent hover:bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground font-medium focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 w-full justify-start gap-1 rounded-md transition-colors -mt-1">
                                    <SelectValue placeholder="Select Driver" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employees.map(e => (
                                      <SelectItem key={e.id} value={e.name}>
                                        {e.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-sm font-medium" title={log.route}>{log.route}</TableCell>
                            <TableCell className="text-right text-sm font-bold text-foreground">
                              {formatCurrency(log.revenue)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded" title="Received from Client">
                                  +{log.advance_received_from_client > 0 ? formatCurrency(log.advance_received_from_client) : '0'}
                                </span>
                                <span className="text-xs font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded" title="Paid to Driver">
                                  -{log.advance_paid_to_driver > 0 ? formatCurrency(log.advance_paid_to_driver) : '0'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <button 
                                onClick={() => handleBadgeClick(log)}
                                className={cn(
                                  "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm border",
                                  getTripStatusColor(log.trip_status)
                                )}
                              >
                                {getTripStatusLabel(log.trip_status)}
                              </button>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border shadow-sm",
                                log.client_payment_status === 'received' ? 'bg-success/15 text-success border-success/30' :
                                log.client_payment_status === 'delayed' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                                log.client_payment_status === 'pending' ? 'bg-warning/15 text-warning border-warning/30' :
                                'bg-muted text-muted-foreground border-border/50'
                              )}>
                                {log.client_payment_status === 'received' ? 'Paid' : (log.client_payment_status || 'UNSET')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => handleEditClick(log.id)}
                                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 bg-background"
                                  title="Edit trip"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => setDeleteDialogData([log])}
                                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:border-destructive/50 bg-background"
                                  title="Delete trip"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BulkAssignTripsModal 
        isOpen={!!assignDialogData}
        onClose={() => setAssignDialogData(null)}
        selectedTrips={assignDialogData}
        onSuccess={() => {
          setAssignDialogData(null);
          setSelectedIds([]);
          fetchData();
        }}
      />

      <Dialog 
        open={!!deleteDialogData} 
        onOpenChange={(open) => !open && !isDeleting && setDeleteDialogData(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-heading text-xl">
              <div className="p-2 bg-destructive/10 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-3 text-base text-foreground font-medium">
              {deleteDialogData?.length === 1 
                ? "Are you sure you want to delete this trip record? This action cannot be undone."
                : `Are you sure you want to delete ${deleteDialogData?.length} trip records? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialogData?.length === 1 && (
            <div className="bg-secondary/30 p-5 rounded-xl text-sm space-y-3 border border-border/50 mt-2 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date:</span> 
                <span className="font-bold text-foreground bg-background px-2 py-1 rounded-md border border-border/50">{format(new Date(deleteDialogData[0].date), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Driver:</span> 
                <span className="font-medium text-foreground">{deleteDialogData[0].driver_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Truck:</span> 
                <span className="font-bold text-foreground">{deleteDialogData[0].truck_number}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogData(null)} 
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeDelete} 
              disabled={isDeleting}
              className="rounded-xl shadow-sm"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusChangeTrip} onOpenChange={(open) => !open && setStatusChangeTrip(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Update Trip Status</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-5">
            <p className="text-sm text-muted-foreground">
              Select a new status for trip <span className="font-bold text-foreground">{statusChangeTrip?.route}</span> 
              ({format(new Date(statusChangeTrip?.date || new Date()), 'dd MMM')})
            </p>
            <Select value={newTripStatus} onValueChange={setNewTripStatus}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIP_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status} className="font-medium">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newTripStatus === 'Delivered' && statusChangeTrip?.trip_status !== 'Delivered' && (
              <p className="text-xs font-medium text-primary bg-primary/10 p-3 rounded-xl border border-primary/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                You'll be prompted to generate a payment request next.
              </p>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setStatusChangeTrip(null)} disabled={isStatusUpdating} className="rounded-xl">Cancel</Button>
            <Button onClick={saveStatusChange} disabled={isStatusUpdating} className="rounded-xl shadow-sm">
              {isStatusUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddTripModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />

      <AddRecurringTripModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSuccess={fetchData}
      />

      {isEditModalOpen && (
        <TripEditModal 
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          tripId={selectedTripId}
          onSuccess={fetchData}
          employees={employees}
          trucks={trucks}
        />
      )}
      
      <BulkUploadTripsModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchData}
      />

      <PaymentRequestModal 
        isOpen={!!paymentRequestTrip}
        onClose={() => setPaymentRequestTrip(null)}
        trip={paymentRequestTrip}
        onSuccess={fetchData}
      />
    </>
  );
};

export default TripLogsPage;