import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertTriangle, FileBox } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import DocumentModal from './DocumentModal.jsx';

const formatDateSafe = (dateVal, formatStr = 'dd MMM yyyy') => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return format(d, formatStr);
  } catch (e) {
    console.error('Failed to format date:', dateVal, e);
    return '-';
  }
};
import DocumentFilePreview from './DocumentFilePreview.jsx';

const EmployeeDocumentsSection = ({ employee }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    if (employee) {
      fetchDocuments();
    }
  }, [employee]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('employee_documents').getFullList({
        filter: `employee_id="${employee.id}"`,
        sort: '-updated',
        $autoCancel: false
      });
      setDocuments(records);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employee documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document and all its files?')) {
      try {
        await pb.collection('employee_documents').delete(id, { $autoCancel: false });
        toast.success('Document deleted');
        fetchDocuments();
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>;
      case 'Expiring Soon': return <Badge className="bg-alert/10 text-alert border-alert/20 hover:bg-alert/20">Expiring Soon</Badge>;
      case 'Expired': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Summary logic
  const totalDocs = documents.length;
  const expiredDocs = documents.filter(d => d.status === 'Expired').length;
  const expiringSoonDocs = documents.filter(d => d.status === 'Expiring Soon').length;
  const hasAlerts = expiredDocs > 0 || expiringSoonDocs > 0;

  if (!employee) return null;

  return (
    <div className="mt-8 space-y-6">
      {hasAlerts && (
        <Alert variant={expiredDocs > 0 ? "destructive" : "default"} className={expiredDocs > 0 ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-alert/10 border-alert/20 text-alert"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            {expiredDocs > 0 && <span>{expiredDocs} document(s) expired. </span>}
            {expiringSoonDocs > 0 && <span>{expiringSoonDocs} document(s) expiring within 30 days.</span>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileBox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
              <h3 className="text-2xl font-bold">{totalDocs}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expired</p>
              <h3 className="text-2xl font-bold">{expiredDocs}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-alert/10 flex items-center justify-center text-alert">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
              <h3 className="text-2xl font-bold">{expiringSoonDocs}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Documents for {employee.name}</CardTitle>
            <CardDescription>Manage IDs, contracts, and certifications.</CardDescription>
          </div>
          <Button onClick={openAddModal} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading documents...</TableCell></TableRow>
                ) : documents.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No documents found. Click 'Add Document' to begin.</TableCell></TableRow>
                ) : (
                  documents.map(doc => (
                    <React.Fragment key={doc.id}>
                      <TableRow className="group cursor-pointer hover:bg-muted/30" onClick={() => toggleRow(doc.id)}>
                        <TableCell>
                          {doc.files && doc.files.length > 0 ? (
                            expandedRows.includes(doc.id) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : null}
                        </TableCell>
                        <TableCell className="font-medium">{doc.document_type}</TableCell>
                        <TableCell>{doc.document_name || '-'}</TableCell>
                        <TableCell>{formatDateSafe(doc.issue_date)}</TableCell>
                        <TableCell>{formatDateSafe(doc.expiry_date)}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{doc.files?.length || 0} file(s)</TableCell>
                        <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(doc)} title="Edit">
                              <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} title="Delete">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {expandedRows.includes(doc.id) && doc.files && doc.files.length > 0 && (
                        <TableRow className="bg-muted/10 border-t-0 hover:bg-muted/10">
                          <TableCell colSpan={8} className="p-0 border-b">
                            <div className="p-4 px-6 space-y-2 shadow-inner">
                              {doc.files.map((file, idx) => (
                                <DocumentFilePreview 
                                  key={idx} 
                                  file={file} 
                                  docRecord={doc} 
                                  isNew={false} 
                                  onDelete={(fileToDelete) => {
                                    // Normally you wouldn't delete directly from preview here, better to direct them to Edit modal.
                                    toast('To delete files, please click Edit.');
                                  }} 
                                />
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DocumentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={editingDoc}
        employeeId={employee.id}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};

export default EmployeeDocumentsSection;