import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Plus, Pencil, Trash2, Download, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TruckDocumentModal from './TruckDocumentModal.jsx';

const TruckDocumentsSection = ({ truck }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  useEffect(() => {
    if (truck) {
      fetchDocuments();
    }
  }, [truck]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('truck_documents').getFullList({
        filter: `truck_id="${truck.id}"`,
        sort: 'expiry_date',
        $autoCancel: false
      });
      setDocuments(records);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await pb.collection('truck_documents').delete(id, { $autoCancel: false });
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>;
      case 'Expiring Soon': return <Badge className="bg-alert/10 text-alert border-alert/20 hover:bg-alert/20">Expiring Soon</Badge>;
      case 'Expired': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasAlerts = documents.some(d => d.status === 'Expired' || d.status === 'Expiring Soon');

  if (!truck) return null;

  return (
    <div className="mt-8">
      {hasAlerts && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            One or more documents for {truck.truck_number} are expired or expiring soon.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Documents for {truck.truck_number}</CardTitle>
          <Button onClick={openAddModal} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading documents...</TableCell></TableRow>
                ) : documents.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No documents found for this truck.</TableCell></TableRow>
                ) : (
                  documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.document_type}</TableCell>
                      <TableCell>{doc.document_name || '-'}</TableCell>
                      <TableCell>{doc.expiry_date ? format(new Date(doc.expiry_date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.file && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={pb.files.getUrl(doc, doc.file)} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(doc)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
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
      </Card>

      <TruckDocumentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={editingDoc}
        truckId={truck.id}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};

export default TruckDocumentsSection;