import React, { useState } from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import AddMaintenanceProblemModal from '@/components/AddMaintenanceProblemModal.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function MaintenanceProblemsPage() {
  const { data, loading, deleteRecord, fetchData } = useMaintenanceData('maintenance_problems');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleStatus = async (prob) => {
    try {
      const nextStatus = prob.status === 'Resolved' ? 'Open' : 'Resolved';
      await pb.collection('maintenance_problems').update(prob.id, {
        status: nextStatus,
        date_solved: nextStatus === 'Resolved' ? new Date().toISOString() : null
      }, { $autoCancel: false });
      toast.success(nextStatus === 'Resolved' ? 'Problem marked as resolved' : 'Problem reopened');
      if (fetchData) fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateProblem = async (formData) => {
    try {
      await pb.collection('maintenance_problems').create(formData, { $autoCancel: false });
      toast.success('Problem reported successfully');
      setIsModalOpen(false);
      if (fetchData) fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to report problem');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Workshop Issues & Problems</h1>
          <p className="text-muted-foreground text-sm">Track vehicle defects and resolve them item-by-item at the workshop.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Report Problem
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(prob => {
              const isResolved = prob.status === 'Resolved';
              return (
                <TableRow key={prob.id} className={isResolved ? "opacity-70 bg-muted/10" : ""}>
                  <TableCell>{prob.date_reported ? new Date(prob.date_reported).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="font-mono font-bold">{prob.truck_id}</TableCell>
                  <TableCell><span className="text-xs text-muted-foreground font-medium">{prob.category}</span></TableCell>
                  <TableCell className={`max-w-[250px] truncate ${isResolved ? "line-through text-muted-foreground" : "font-medium"}`}>
                    {prob.description}
                  </TableCell>
                  <TableCell><StatusBadge status={prob.severity} type="severity" /></TableCell>
                  <TableCell><StatusBadge status={prob.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant={isResolved ? "outline" : "default"}
                        className={`h-7 px-2.5 text-[11px] rounded-lg font-bold gap-1 ${
                          isResolved 
                            ? "border-muted-foreground/30 text-muted-foreground hover:bg-muted" 
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        }`}
                        onClick={() => handleToggleStatus(prob)}
                      >
                        {isResolved ? (
                          <><RotateCcw className="w-3 h-3" /> Reopen</>
                        ) : (
                          <><CheckCircle2 className="w-3 h-3" /> Resolve</>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-7 h-7" 
                        onClick={() => {
                          if (window.confirm('Delete this problem record?')) deleteRecord(prob.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No problems reported.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddMaintenanceProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProblem}
      />
    </div>
  );
}