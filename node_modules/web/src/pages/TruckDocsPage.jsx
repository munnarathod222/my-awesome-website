import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FileText, Plus, Search, FilterX, Eye, Edit2, Trash2, Download, AlertCircle, Folder, List, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { differenceInDays, format, isPast } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';

const TruckDocsPage = () => {
  const [searchParams] = useSearchParams();
  const truckIdParam = searchParams.get('truckId');

  const [documents, setDocuments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('folder'); // 'folder' or 'table'
  const [selectedTruckFolder, setSelectedTruckFolder] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all', truck: 'all' });
  const [formData, setFormData] = useState({
    truck_id: '',
    document_type: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
    status: 'Active'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const docTypes = ['RC', 'Insurance', 'Permit', 'License', 'Fitness Certificate', 'Pollution Certificate', 'Other'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, trucksRes] = await Promise.all([
        pb.collection('truck_documents').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false })
      ]);
      setDocuments(docsRes);
      setTrucks(trucksRes);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-select truck folder if truckId parameter is passed
  useEffect(() => {
    if (truckIdParam && trucks.length > 0) {
      const found = trucks.find(t => t.id === truckIdParam);
      if (found) {
        setSelectedTruckFolder(found.id);
        setFilters(p => ({ ...p, truck: found.id }));
        setViewMode('folder');
      }
    }
  }, [truckIdParam, trucks]);

  // Handle sync between filters.truck and selectedTruckFolder
  useEffect(() => {
    if (filters.truck !== 'all') {
      setSelectedTruckFolder(filters.truck);
    } else {
      setSelectedTruckFolder(null);
    }
  }, [filters.truck]);

  const handleSelectFolder = (truckId) => {
    setSelectedTruckFolder(truckId);
    setFilters(p => ({ ...p, truck: truckId }));
  };

  const handleBackToFolders = () => {
    setSelectedTruckFolder(null);
    setFilters(p => ({ ...p, truck: 'all' }));
  };

  const getStatusInfo = (expiryDate) => {
    if (!expiryDate) return { text: 'Unknown', bg: 'bg-muted text-muted-foreground' };
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { text: 'Expired', bg: 'bg-status-expired-light', days, numericStatus: 'Expired' };
    if (days <= 30) return { text: `Expires in ${days}d`, bg: 'bg-status-expired-light', days, numericStatus: 'Expiring Soon' };
    if (days <= 60) return { text: `Expires in ${days}d`, bg: 'bg-status-expiring-soon-light', days, numericStatus: 'Expiring Soon' };
    return { text: `Active (${days}d)`, bg: 'bg-status-active-light', days, numericStatus: 'Active' };
  };

  const handleOpenForm = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        truck_id: doc.truck_id || '',
        document_type: doc.document_type || '',
        document_number: doc.document_number || '',
        issue_date: doc.issue_date ? doc.issue_date.split('T')[0] : '',
        expiry_date: doc.expiry_date ? doc.expiry_date.split('T')[0] : '',
        notes: doc.notes || '',
        status: doc.status || 'Active'
      });
    } else {
      setEditingDoc(null);
      setFormData({
        truck_id: '',
        document_type: '',
        document_number: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
        status: 'Active'
      });
    }
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDoc(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.truck_id || !formData.document_type || !formData.expiry_date) {
      return toast.error('Please fill required fields (Truck, Type, Expiry Date)');
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (key === 'issue_date' || key === 'expiry_date') {
            data.append(key, new Date(formData[key]).toISOString());
          } else {
            data.append(key, formData[key]);
          }
        }
      });
      if (selectedFile) data.append('file', selectedFile);

      if (editingDoc) {
        await pb.collection('truck_documents').update(editingDoc.id, data, { $autoCancel: false });
        toast.success('Document updated successfully');
      } else {
        await pb.collection('truck_documents').create(data, { $autoCancel: false });
        toast.success('Document added successfully');
      }
      handleCloseForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document permanently?')) return;
    try {
      await pb.collection('truck_documents').delete(id, { $autoCancel: false });
      toast.success('Document deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const truckMap = useMemo(() => {
    const map = {};
    trucks.forEach(t => map[t.id] = t.truck_number);
    return map;
  }, [trucks]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const statusInfo = getStatusInfo(doc.expiry_date);
      if (filters.status !== 'all' && statusInfo.numericStatus !== filters.status) return false;
      if (filters.type !== 'all' && doc.document_type !== filters.type) return false;
      if (filters.truck !== 'all' && doc.truck_id !== filters.truck) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const tNum = truckMap[doc.truck_id]?.toLowerCase() || '';
        if (!doc.document_number?.toLowerCase().includes(q) && !tNum.includes(q)) return false;
      }
      return true;
    });
  }, [documents, filters, truckMap]);

  const stats = useMemo(() => {
    let active = 0, soon = 0, expired = 0;
    documents.forEach(doc => {
      const s = getStatusInfo(doc.expiry_date).numericStatus;
      if (s === 'Active') active++;
      else if (s === 'Expiring Soon') soon++;
      else if (s === 'Expired') expired++;
    });
    return { total: documents.length, active, soon, expired };
  }, [documents]);

  const filteredTrucks = useMemo(() => {
    return trucks.filter(truck => {
      if (filters.truck !== 'all' && truck.id !== filters.truck) return false;
      const truckDocs = filteredDocs.filter(d => d.truck_id === truck.id);
      const hasActiveFilters = filters.search || filters.type !== 'all' || filters.status !== 'all';
      if (hasActiveFilters && truckDocs.length === 0) return false;
      return true;
    });
  }, [trucks, filteredDocs, filters]);

  // Folder Card Component (Grid of trucks)
  const FolderCard = ({ truck }) => {
    const truckDocs = documents.filter(d => d.truck_id === truck.id);
    const docCount = truckDocs.length;
    
    let overallStatus = 'empty';
    let badgeColor = 'bg-muted text-muted-foreground';
    let folderColor = 'text-muted-foreground/60';
    
    const statuses = truckDocs.map(d => getStatusInfo(d.expiry_date).numericStatus);
    if (statuses.includes('Expired')) {
      overallStatus = 'expired';
      badgeColor = 'bg-status-expired-light text-destructive border-destructive/20';
      folderColor = 'text-destructive';
    } else if (statuses.includes('Expiring Soon')) {
      overallStatus = 'expiring';
      badgeColor = 'bg-status-expiring-soon-light text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
      folderColor = 'text-yellow-500';
    } else if (docCount > 0) {
      overallStatus = 'active';
      badgeColor = 'bg-status-active-light text-green-500 border-green-500/20';
      folderColor = 'text-green-500';
    }

    return (
      <Card 
        onClick={() => handleSelectFolder(truck.id)}
        className="group cursor-pointer overflow-hidden border border-border/50 hover:border-primary/50 bg-card hover:bg-muted/10 transition-all duration-300 rounded-3xl shadow-sm hover:shadow-md flex flex-col p-6 space-y-4"
      >
        <div className="flex justify-between items-start">
          <div className={`p-4 bg-secondary/80 rounded-2xl border border-border/50 ${folderColor} group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
            <Folder className="w-8 h-8 fill-current" />
          </div>
          {docCount > 0 ? (
            <Badge variant="outline" className={`capitalize font-semibold text-[10px] ${badgeColor}`}>
              {overallStatus === 'expired' ? 'Expired' : overallStatus === 'expiring' ? 'Expiring' : 'Active'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground/60 bg-muted/20">
              Empty
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
            {truck.truck_number}
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{truck.truck_name || 'Generic Truck'}</p>
        </div>

        <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground font-medium">
          <span>{docCount} {docCount === 1 ? 'document' : 'documents'}</span>
          <span className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">Open &rarr;</span>
        </div>
      </Card>
    );
  };

  // Document File Card Component (Sub-view files grid)
  const DocumentFileCard = ({ doc }) => {
    const stat = getStatusInfo(doc.expiry_date);
    const hasFile = !!doc.file;

    return (
      <Card className="overflow-hidden border border-border/50 bg-card rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-5 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-md leading-tight text-foreground truncate">{doc.document_type}</h4>
              <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">{doc.document_number || 'No Doc Number'}</p>
            </div>
          </div>
          <Badge variant="outline" className={`capitalize font-semibold text-[10px] ${stat.bg}`}>
            {stat.text}
          </Badge>
        </div>

        {doc.notes && (
          <p className="text-xs text-muted-foreground bg-secondary/30 border border-border/40 p-3 rounded-2xl leading-relaxed max-h-16 overflow-y-auto whitespace-pre-line">
            {doc.notes}
          </p>
        )}

        <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold block text-muted-foreground/60 mb-0.5">Issue Date</span>
            <span className="font-semibold text-foreground">{doc.issue_date ? format(new Date(doc.issue_date), 'MMM dd, yyyy') : '-'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold block text-muted-foreground/60 mb-0.5">Expiry Date</span>
            <span className="font-semibold text-foreground">{doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : '-'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/40 flex justify-between items-center gap-2 mt-auto">
          <div className="flex gap-1">
            {hasFile && (
              <Button variant="outline" size="sm" className="h-8 rounded-xl px-2 text-primary border-primary/20 hover:bg-primary/5 shadow-none" onClick={() => setPreviewDoc(doc)}>
                <Eye className="w-3.5 h-3.5 mr-1" /> View
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary rounded-lg" onClick={() => handleOpenForm(doc)}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDelete(doc.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full w-full bg-background">
      <Helmet><title>Truck Documents | Dashboard</title></Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Truck Documents</h1>
            <p className="text-muted-foreground mt-1">Manage RC, insurance, permits, and track expiries.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/40">
              <Button
                variant={viewMode === 'folder' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('folder')}
                className="h-8 rounded-lg px-3"
              >
                <Folder className="w-4 h-4 mr-1.5" />
                Folder View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 rounded-lg px-3"
              >
                <List className="w-4 h-4 mr-1.5" />
                Table View
              </Button>
            </div>
            <Button onClick={() => handleOpenForm()} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Document
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-border shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Documents</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Expiring Soon (less than 60 days)</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.soon}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Expired</p>
              <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center mb-6 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search doc # or truck..." 
              value={filters.search}
              onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={filters.truck} onValueChange={(v) => setFilters(p => ({...p, truck: v}))}>
            <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="All Trucks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trucks</SelectItem>
              {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(v) => setFilters(p => ({...p, type: v}))}>
            <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {docTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters(p => ({...p, status: v}))}>
            <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          {(filters.search || filters.truck !== 'all' || filters.type !== 'all' || filters.status !== 'all') && (
            <Button variant="ghost" size="icon" onClick={() => setFilters({search:'', truck:'all', type:'all', status:'all'})}>
              <FilterX className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Selected Folder Header for Folder View */}
        {viewMode === 'folder' && selectedTruckFolder && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl">
            <Button variant="ghost" onClick={handleBackToFolders} className="w-fit hover:bg-secondary rounded-xl pl-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Folders
            </Button>
            <div className="sm:text-right">
              <h2 className="text-xl font-bold text-foreground">
                Folder: {truckMap[selectedTruckFolder] || 'Unknown Truck'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {filteredDocs.length} matching {filteredDocs.length === 1 ? 'document' : 'documents'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="py-12"><LoadingSpinner text="Loading documents..." /></div>
        ) : error ? (
          <div className="py-12 text-center text-destructive">{error}</div>
        ) : viewMode === 'table' ? (
          <Card className="shadow-sm border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Truck</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Doc Number</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No documents found matching filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocs.map(doc => {
                      const stat = getStatusInfo(doc.expiry_date);
                      return (
                        <TableRow key={doc.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{truckMap[doc.truck_id] || doc.truck_id}</TableCell>
                          <TableCell>{doc.document_type}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.document_number || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.issue_date ? format(new Date(doc.issue_date), 'MMM dd, yyyy') : '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={stat.bg}>
                              {stat.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {doc.file && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setPreviewDoc(doc)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(doc)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>
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
          </Card>
        ) : (
          /* Folder Gallery View Mode */
          selectedTruckFolder ? (
            /* Documents inside selected truck folder */
            filteredDocs.length === 0 ? (
              <Card className="shadow-sm border-border p-12 text-center text-muted-foreground rounded-3xl">
                No documents found matching filters in this folder.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map(doc => (
                  <DocumentFileCard key={doc.id} doc={doc} />
                ))}
              </div>
            )
          ) : (
            /* Grid of Truck Folders */
            filteredTrucks.length === 0 ? (
              <Card className="shadow-sm border-border p-12 text-center text-muted-foreground rounded-3xl">
                No truck folders found matching filters.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTrucks.map(truck => (
                  <FolderCard key={truck.id} truck={truck} />
                ))}
              </div>
            )
          )
        )}
      </main>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={(o) => !isSubmitting && !o && handleCloseForm()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDoc ? 'Edit Document' : 'Add New Document'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Truck *</Label>
                <Select value={formData.truck_id} onValueChange={(v) => setFormData(p => ({...p, truck_id: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select Truck" /></SelectTrigger>
                  <SelectContent>
                    {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select value={formData.document_type} onValueChange={(v) => setFormData(p => ({...p, document_type: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Document Number</Label>
              <Input 
                value={formData.document_number} 
                onChange={(e) => setFormData(p => ({...p, document_number: e.target.value}))} 
                placeholder="e.g. MH12AB1234"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  type="date" 
                  value={formData.issue_date} 
                  onChange={(e) => setFormData(p => ({...p, issue_date: e.target.value}))}
                  className="dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input 
                  type="date" 
                  value={formData.expiry_date} 
                  onChange={(e) => setFormData(p => ({...p, expiry_date: e.target.value}))}
                  className="dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload File (PDF/Image)</Label>
              <Input 
                type="file" 
                accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              {editingDoc?.file && !selectedFile && (
                <p className="text-xs text-muted-foreground">Current file: {editingDoc.file}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} 
                rows={2}
                placeholder="Additional details..."
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DocumentPreviewModal 
        isOpen={!!previewDoc} 
        onClose={() => setPreviewDoc(null)} 
        document={previewDoc} 
      />
    </div>
  );
};

export default TruckDocsPage;