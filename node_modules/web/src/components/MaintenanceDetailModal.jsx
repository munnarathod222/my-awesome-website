import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Clock, DollarSign, User, AlertTriangle, File, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function MaintenanceDetailModal({ isOpen, onClose, scheduleId }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (isOpen && scheduleId) {
      fetchData();
    }
  }, [isOpen, scheduleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const scheduleData = await pb.collection('maintenance_schedules').getOne(scheduleId, { $autoCancel: false });
      setSchedule(scheduleData);

      const recordsData = await pb.collection('maintenance_records').getFullList({
        filter: `maintenance_schedule_id="${scheduleId}"`,
        sort: '-completion_date',
        $autoCancel: false
      });
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching maintenance details:', error);
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Scheduled: "bg-blue-100 text-blue-800",
      Due: "bg-warning/20 text-warning",
      Overdue: "bg-destructive/10 text-destructive border-destructive/20",
      Completed: "bg-success/20 text-success border-success/20"
    };
    return <Badge variant="outline" className={`${variants[status]} border-transparent`}>{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        ) : schedule ? (
          <>
            <DialogHeader className="p-6 border-b border-border bg-muted/20">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    {schedule.maintenance_type}
                    {getStatusBadge(schedule.status)}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Priority: {schedule.priority_level}
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {/* Schedule Overview */}
                <section>
                  <h3 className="text-lg font-semibold tracking-tight mb-4">Schedule Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/40 p-3 rounded-lg flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Date</p>
                        <p className="font-medium text-foreground">{format(new Date(schedule.next_maintenance_date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="bg-muted/40 p-3 rounded-lg flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interval</p>
                        <p className="font-medium text-foreground">
                          {schedule.maintenance_interval_km ? `${schedule.maintenance_interval_km} km` : ''}
                          {schedule.maintenance_interval_km && schedule.maintenance_interval_months ? ' / ' : ''}
                          {schedule.maintenance_interval_months ? `${schedule.maintenance_interval_months} mo` : ''}
                          {!schedule.maintenance_interval_km && !schedule.maintenance_interval_months ? 'N/A' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/40 p-3 rounded-lg flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Cost</p>
                        <p className="font-medium text-foreground">{schedule.estimated_cost ? `$${schedule.estimated_cost.toFixed(2)}` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-muted/40 p-3 rounded-lg flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Technician</p>
                        <p className="font-medium text-foreground">{schedule.assigned_technician || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                  {schedule.notes && (
                    <div className="mt-4 bg-muted/20 p-4 rounded-lg border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-foreground">{schedule.notes}</p>
                    </div>
                  )}
                </section>

                <Separator />

                {/* History Timeline */}
                <section>
                  <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Completion History
                  </h3>
                  
                  {records.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border">
                      <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No completion records found for this schedule.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {records.map((record, index) => (
                        <div key={record.id} className="relative pl-6 pb-6 last:pb-0">
                          {/* Timeline Line */}
                          {index !== records.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border"></div>
                          )}
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-success"></div>
                          </div>
                          
                          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-foreground">Completed on {format(new Date(record.completion_date), 'MMM dd, yyyy')}</p>
                                <p className="text-sm text-muted-foreground">by {record.technician_id || 'Unknown Technician'}</p>
                              </div>
                              {record.actual_cost && (
                                <Badge variant="secondary" className="font-semibold text-sm">
                                  ${record.actual_cost.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            
                            {record.completion_notes && (
                              <p className="text-sm text-foreground/80 mt-2 bg-muted/40 p-2 rounded-md">
                                {record.completion_notes}
                              </p>
                            )}

                            {record.attachments && record.attachments.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {record.attachments.map((file, i) => (
                                  <a
                                    key={i}
                                    href={pb.files.getURL(record, file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1.5 rounded-md transition-colors border border-border/50"
                                  >
                                    <File className="w-3 h-3 text-primary" />
                                    Attachment {i + 1}
                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-50" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground">Schedule not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}