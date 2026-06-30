import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp, X, FileText, CheckCircle2, Download, Trash2, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DeliveryProofUploadPage = () => {
  const [trips, setTrips] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [files, setFiles] = useState([]);
  const [tripId, setTripId] = useState('');
  const [docType, setDocType] = useState('Proof of Delivery');
  const [description, setDescription] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch recent trips for the dropdown
      const tripsData = await pb.collection('trip_logs').getFullList({
        sort: '-date',
        $autoCancel: false
      });
      setTrips(tripsData);

      await fetchHistory();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await pb.collection('delivery_proofs').getFullList({
        sort: '-created',
        expand: 'trip_id',
        $autoCancel: false
      });
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [files]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    let validFiles = newFiles.filter(f => validTypes.includes(f.type) && f.size <= MAX_FILE_SIZE);
    let rejectedCount = newFiles.length - validFiles.length;

    if (rejectedCount > 0) {
      toast.error(`${rejectedCount} file(s) rejected (invalid format or over 10MB)`);
    }

    if (files.length + validFiles.length > MAX_FILES) {
      validFiles = validFiles.slice(0, MAX_FILES - files.length);
      toast.warning(`Maximum ${MAX_FILES} files allowed.`);
    }

    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const toRemove = prev.find(f => f.id === id);
      if (toRemove && toRemove.preview) URL.revokeObjectURL(toRemove.preview);
      return filtered;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tripId) return toast.error('Please select a trip.');
    if (files.length === 0) return toast.error('Please upload at least one file.');
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('trip_id', tripId);
      formData.append('document_type', docType);
      formData.append('reference_number', refNumber);
      formData.append('description', description);
      formData.append('uploaded_by', pb.authStore.model?.name || pb.authStore.model?.email || 'Staff');
      
      files.forEach(f => {
        formData.append('files', f.file);
      });

      await pb.collection('delivery_proofs').create(formData, { $autoCancel: false });
      toast.success('Delivery proof uploaded successfully!');
      
      // Reset form
      setFiles([]);
      setTripId('');
      setDocType('Proof of Delivery');
      setDescription('');
      setRefNumber('');
      
      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload documents.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery proof?')) return;
    try {
      await pb.collection('delivery_proofs').delete(id, { $autoCancel: false });
      toast.success('Record deleted successfully');
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete record. Ensure you have admin permissions.');
    }
  };

  // Filter history
  const filteredHistory = history.filter(record => {
    const matchesSearch = 
      (record.expand?.trip_id?.truck_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.reference_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterDocType === 'all' || record.document_type === filterDocType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Helmet>
        <title>Upload Delivery Proof | Jai Bhavani Cargo</title>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Delivery Proof</h1>
          <p className="text-muted-foreground">Upload and manage proof of delivery documents for completed trips.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Form */}
          <Card className="xl:col-span-1 border-border bg-card shadow-sm h-fit">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-primary" /> New Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>Select Trip *</Label>
                  <Select value={tripId} onValueChange={setTripId} required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Search recent trips..." />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.slice(0, 50).map(trip => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {format(new Date(trip.date), 'dd MMM')} - {trip.truck_number} ({trip.route})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Document Type *</Label>
                  <Select value={docType} onValueChange={setDocType} required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delivery Receipt">Delivery Receipt</SelectItem>
                      <SelectItem value="Proof of Delivery">Proof of Delivery</SelectItem>
                      <SelectItem value="Shipment Invoice">Shipment Invoice</SelectItem>
                      <SelectItem value="Tracking Document">Tracking Document</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Reference Number</Label>
                  <Input 
                    placeholder="Enter Shipment/Tracking No." 
                    value={refNumber}
                    onChange={e => setRefNumber(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Description / Notes</Label>
                  <Textarea 
                    placeholder="Any additional details..." 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-background min-h-[80px]"
                  />
                </div>

                {/* Drag & Drop Area */}
                <div className="space-y-3">
                  <Label>Upload Files * (Max 5 files, 10MB each)</Label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors duration-200
                      ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}
                    `}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-3 pointer-events-none">
                      <FileUp className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">Drag & Drop files here</h3>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOCX</p>
                  </div>
                </div>

                {/* File Previews */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs">Selected Files ({files.length}/{MAX_FILES})</Label>
                    <div className="flex flex-col gap-2">
                      <AnimatePresence>
                        {files.map((f) => (
                          <motion.div 
                            key={f.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative border border-border rounded-lg p-2 flex items-center gap-3 bg-background group"
                          >
                            <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-muted flex items-center justify-center">
                              {f.preview ? (
                                <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-medium truncate">{f.file.name}</p>
                              <p className="text-[10px] text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(f.id)}
                              className="w-6 h-6 rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center shrink-0 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? 'Uploading...' : 'Submit Document'} 
                  {!isUploading && <CheckCircle2 className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="xl:col-span-2 border-border bg-card shadow-sm flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Upload History
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search truck or ref no..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-[200px] h-9"
                  />
                </div>
                <Select value={filterDocType} onValueChange={setFilterDocType}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Delivery Receipt">Delivery Receipt</SelectItem>
                    <SelectItem value="Proof of Delivery">Proof of Delivery</SelectItem>
                    <SelectItem value="Shipment Invoice">Shipment Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Trip</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          Loading history...
                        </TableCell>
                      </TableRow>
                    ) : filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No delivery proofs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {format(new Date(record.created), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {record.expand?.trip_id?.truck_number || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {record.expand?.trip_id?.route || 'No Route'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-1 whitespace-nowrap">
                              {record.document_type}
                            </span>
                            {record.reference_number && (
                              <div className="text-xs text-muted-foreground mt-1 font-mono">
                                Ref: {record.reference_number}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {(record.files || []).map((file, idx) => (
                                <a 
                                  key={idx}
                                  href={pb.files.getUrl(record, file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-secondary hover:underline"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  File {idx + 1}
                                </a>
                              ))}
                              {(!record.files || record.files.length === 0) && (
                                <span className="text-xs text-muted-foreground">No files</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.uploaded_by}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {record.files && record.files.length > 0 && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    title="View First Document"
                                    asChild
                                  >
                                    <a href={pb.files.getUrl(record, record.files[0])} target="_blank" rel="noopener noreferrer">
                                      <Eye className="w-4 h-4" />
                                    </a>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    title="Download First Document"
                                    asChild
                                  >
                                    <a href={pb.files.getUrl(record, record.files[0])} download>
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteRecord(record.id)}
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      </div>
    </>
  );
};

export default DeliveryProofUploadPage;