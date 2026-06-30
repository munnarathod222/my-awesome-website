import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, RotateCcw, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const ImportHistorySection = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [undoingId, setUndoingId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('bulk_upload_history').getList(1, 10, {
        sort: '-upload_date',
        expand: 'user_id',
        $autoCancel: false
      });
      setHistory(records.items);
    } catch (error) {
      console.error('Error fetching import history:', error);
      toast.error('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleUndo = async (record) => {
    if (!window.confirm('Are you sure you want to undo this import? This will delete all trips and expenses created during this upload.')) {
      return;
    }

    setUndoingId(record.id);
    try {
      let detailsObj = {};
      try {
        detailsObj = JSON.parse(record.error_details || '{}');
      } catch (e) {
        detailsObj = {};
      }

      const createdRecords = detailsObj.created_records || [];
      
      if (createdRecords.length === 0) {
        toast.warning('No records found to undo for this import.');
      } else {
        // Delete records in reverse order
        for (const item of createdRecords) {
          try {
            await pb.collection(item.collection).delete(item.id, { $autoCancel: false });
          } catch (e) {
            console.error(`Failed to delete ${item.collection} ${item.id}`, e);
          }
        }
      }

      // Finally delete the history record
      await pb.collection('bulk_upload_history').delete(record.id, { $autoCancel: false });
      
      toast.success('Upload successfully undone.');
      fetchHistory();
    } catch (error) {
      console.error('Error undoing import:', error);
      toast.error('Failed to undo import. Some records may still exist.');
    } finally {
      setUndoingId(null);
    }
  };

  const viewDetails = (record) => {
    let parsed = { errors: [], created_records: [] };
    if (record.error_details) {
      try {
        parsed = JSON.parse(record.error_details);
      } catch (e) {
        console.error('Error parsing details', e);
      }
    }
    setSelectedDetails({ ...record, parsed });
    setIsDetailsOpen(true);
  };

  return (
    <Card className="bg-card border-border shadow-sm mt-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recent Import History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Date & Time</TableHead>
                <TableHead>Total Rows</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">Loading history...</TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No bulk imports found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(item.upload_date), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell>{item.total_rows}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {item.successful_imports}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.failed_rows > 0 ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          {item.failed_rows}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{item.expand?.user_id?.name || item.expand?.user_id?.email || 'Unknown'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => viewDetails(item)} title="View Details">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                          onClick={() => handleUndo(item)}
                          disabled={undoingId === item.id}
                          title="Undo Import"
                        >
                          <RotateCcw className={`w-4 h-4 mr-1 ${undoingId === item.id ? 'animate-spin' : ''}`} /> 
                          {undoingId === item.id ? 'Undoing' : 'Undo'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
          </DialogHeader>
          {selectedDetails && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedDetails.upload_date), 'dd MMM yyyy, HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {selectedDetails.failed_rows > 0 ? 'Completed with errors' : 'Fully Successful'}
                  </p>
                </div>
              </div>

              {selectedDetails.parsed?.errors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Validation Errors ({selectedDetails.parsed.errors.length})
                  </h4>
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
                      {selectedDetails.parsed.errors.map((err, idx) => (
                        <li key={idx}>Row {err.row}: {err.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedDetails.parsed?.created_records?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Created Records ({selectedDetails.parsed.created_records.length})</h4>
                  <p className="text-sm text-muted-foreground">
                    Includes trip logs and associated expense records.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ImportHistorySection;