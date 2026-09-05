import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  FileText, Download, Eye, ShieldCheck, AlertCircle, 
  Calendar, Clock, User, Truck, File, AlertTriangle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';
import { differenceInDays, format } from 'date-fns';

const DOC_TYPE_COLORS = {
  'License':             { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  'RC':                  { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  'Insurance':           { bg: 'bg-teal-500/10 border-teal-500/20 text-teal-400' },
  'Permit':              { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  'ID Proof':            { bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  'Bank Details':        { bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
  'Medical Certificate': { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
  'Other':               { bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400' }
};

const getDocTypeColor = (type) => DOC_TYPE_COLORS[type] || DOC_TYPE_COLORS['Other'];

function getStatusBadge(expiryDate) {
  if (!expiryDate) return { text: 'No Expiry', cls: 'bg-muted text-muted-foreground border-border/40' };
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0) {
    return { text: 'Expired', cls: 'bg-red-500/10 border-red-500/20 text-red-400' };
  }
  if (days <= 30) {
    return { text: `Expiring Soon (${days}d)`, cls: 'bg-red-500/10 border-red-500/20 text-red-400' };
  }
  if (days <= 60) {
    return { text: `Expiring Soon (${days}d)`, cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  }
  return { text: 'Active', cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
}

export default function SharedFolderPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchSharedData();
  }, [id]);

  const fetchSharedData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch metadata from the Express API bypass route
      const response = await fetch(`/hcgi/api/shared/folder/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shared folder link is invalid or has expired.');
        }
        throw new Error('Failed to load shared folder.');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to retrieve shared documents.');
      }
      setData(result);
    } catch (err) {
      console.error('Error loading shared folder:', err);
      setError(err.message || 'Something went wrong while accessing this folder.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc, filename) => {
    // Construct public PocketBase file download URL
    const fileUrl = pb.files.getUrl(doc, filename);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <LoadingSpinner text="Securing connection and opening folder..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-full text-destructive mb-4 animate-bounce">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-xl font-bold mb-2">Folder Access Error</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {error}
        </p>
        <p className="text-xs text-muted-foreground/60">
          If you believe this is an error, please request a new share link from your logistics manager.
        </p>
      </div>
    );
  }

  // Fleet Dossier Multi-Truck View Mode
  if (data.type === 'fleet_dossier') {
    const { dossier_title, recipient_name, total_trucks, total_documents, fleet = [] } = data;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSize, setSelectedSize] = useState('all');

    const filteredFleet = fleet.filter(t => {
      const matchSearch = !searchTerm || t.truck_number.toLowerCase().includes(searchTerm.toLowerCase()) || (t.truck_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchSize = selectedSize === 'all' || (t.truck_size || '').toLowerCase() === selectedSize.toLowerCase();
      return matchSearch && matchSize;
    });

    const totalRCs = fleet.reduce((acc, t) => acc + (t.documents.filter(d => (d.document_type || '').toUpperCase() === 'RC').length > 0 ? 1 : 0), 0);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-16">
        <Helmet>
          <title>{dossier_title || 'Fleet Asset & RC Verification Portfolio'} - Jai Bhavani Cargo</title>
        </Helmet>

        <div className="w-full bg-slate-900/90 border-b border-slate-800 shadow-xl sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-heading font-extrabold text-white tracking-tight">
                    JAI BHAVANI CARGO
                  </h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Verified Fleet Portfolio
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dossier_title} • Prepared for: <strong className="text-slate-200">{recipient_name || 'Financier'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-800 text-cyan-400 border-cyan-500/30 font-mono text-xs px-3 py-1">
                🚛 {total_trucks} Fleet Vehicles
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs px-3 py-1">
                📄 {totalRCs} RCs Attached
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" /> Commercial Fleet Asset Overview
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                This secure portal provides official compliance records, registration certificates (RCs), fitness certifications, and vehicle specifications for commercial financing, asset audit, and credit line appraisal.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search registration no..."
                className="h-9 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-56 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFleet.map(truck => {
              const rcDoc = truck.documents.find(d => (d.document_type || '').toUpperCase() === 'RC');
              
              return (
                <div key={truck.id} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 shadow-md flex flex-col justify-between space-y-3.5 transition-all">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <span className="font-mono font-extrabold text-base text-cyan-400 tracking-wide">
                          {truck.truck_number}
                        </span>
                        <p className="text-xs text-slate-400 truncate">{truck.truck_name || 'Container Truck'}</p>
                      </div>
                      <Badge variant="outline" className={rcDoc ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"}>
                        {rcDoc ? '✓ RC Verified' : '⚠️ RC Pending'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Size</p>
                        <p className="font-semibold text-slate-200">{truck.truck_size || '24 FT'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Axle</p>
                        <p className="font-semibold text-slate-200">{truck.truck_axle || 'SXL'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Payload</p>
                        <p className="font-semibold text-emerald-400">{truck.payload_capacity || '10 Ton'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Documents ({truck.documents.length})</p>
                    {truck.documents.length === 0 ? (
                      <p className="text-xs italic text-slate-500">No documents attached yet</p>
                    ) : (
                      <div className="space-y-1">
                        {truck.documents.map(doc => {
                          const activeFile = doc.file || (Array.isArray(doc.files) ? doc.files[0] : doc.files);
                          const fileUrl = activeFile ? pb.files.getUrl(doc, activeFile) : '';

                          return (
                            <div key={doc.id} className="flex items-center justify-between p-1.5 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs">
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span className="font-semibold text-slate-200 truncate">{doc.document_type}</span>
                                {doc.expiry_date && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    (Exp: {format(new Date(doc.expiry_date), 'dd/MM/yy')})
                                  </span>
                                )}
                              </div>
                              {fileUrl && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setPreviewDoc(doc)}
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                                    title="View Document"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDownload(doc, activeFile)}
                                    className="h-6 w-6 p-0 text-emerald-400 hover:text-emerald-300"
                                    title="Download Document"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {previewDoc && (
          <DocumentPreviewModal 
            isOpen={!!previewDoc} 
            onClose={() => setPreviewDoc(null)} 
            doc={previewDoc} 
          />
        )}
      </div>
    );
  }

  const { type, details, documents } = data;
  const entityName = type === 'truck' ? details.truck_number : details.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 pb-12">
      <Helmet>
        <title>Shared Documents - {entityName}</title>
      </Helmet>

      <div className="w-full bg-card border-b border-border/40 shadow-sm sticky top-0 z-20 backdrop-blur-md bg-card/90">
        <div className="max-w-md mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              {type === 'truck' ? <Truck className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                {entityName}
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Read-Only Shared Folder
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 font-semibold text-xs border-0 px-2.5 py-1">
            {documents.length} Docs
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-primary text-xs leading-relaxed">
          <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p>
            <strong>Secure Document Repository:</strong> You can view and download documents for <strong>{entityName}</strong>. Editing or deletion is disabled.
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border/40 shadow-sm p-6">
            <File className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-foreground">Folder is Empty</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              No active documents have been uploaded to this folder yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const status = getStatusBadge(doc.expiry_date);
              const typeColor = getDocTypeColor(doc.document_type);
              const hasFiles = doc.files && doc.files.length > 0;

              return (
                <Card key={doc.id} className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${typeColor.bg}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">
                            {doc.document_type || 'Document'}
                          </h3>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate max-w-[150px]">
                            No: {doc.document_number || '—'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${status.cls}`}>
                        {status.text}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/20 text-xs">
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <Calendar className="w-3 h-3" /> Issue Date
                        </div>
                        <p className="font-medium text-foreground mt-0.5">
                          {doc.issue_date ? format(new Date(doc.issue_date), 'dd MMM yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> Expiry Date
                        </div>
                        <p className="font-medium text-foreground mt-0.5">
                          {doc.expiry_date ? format(new Date(doc.expiry_date), 'dd MMM yyyy') : 'No Expiry'}
                        </p>
                      </div>
                    </div>

                    {doc.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/10 p-2.5 rounded-xl border border-border/10 italic">
                        {doc.notes}
                      </p>
                    )}

                    {/* Attached files download actions */}
                    {hasFiles ? (
                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Files</p>
                        <div className="flex flex-col gap-2">
                          {doc.files.map((filename, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted/40 p-2 rounded-xl border border-border/10">
                              <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                                {filename}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="h-8 px-2 text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(doc, filename)}
                                  className="h-8 px-2 text-muted-foreground hover:bg-muted rounded-lg flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/10 italic">
                        <AlertCircle className="w-4 h-4" /> No files attached.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />
      )}
    </div>
  );
}
