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

  const { type, details, documents } = data;
  const entityName = type === 'truck' ? details.truck_number : details.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 pb-12">
      <Helmet>
        <title>Shared Documents - {entityName}</title>
      </Helmet>

      {/* Top Header Card */}
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
        {/* Helper Note for Mobile Users */}
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
                    {/* Header: Icon + Type + Status */}
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

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/20 text-xs">
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <Calendar className="w-3 h-3" /> Issue Date
                        </div>
                        <p className="font-semibold text-foreground mt-0.5">
                          {doc.issue_date ? format(new Date(doc.issue_date), 'MMM dd, yyyy') : '—'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> Expiry Date
                        </div>
                        <p className="font-semibold text-foreground mt-0.5">
                          {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Notes if present */}
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
