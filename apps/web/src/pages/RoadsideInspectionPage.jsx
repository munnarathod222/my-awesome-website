import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, ArrowLeft, RefreshCw, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function RoadsideInspectionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ truck: null, documents: [] });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      if (!pb.authStore.token || !pb.authStore.model) {
        toast.error("Please log in to access driver portal.");
        setLoading(false);
        return;
      }

      // Construct the custom base64 token required by Express API pocketbaseAuth middleware
      const tokenData = {
        token: pb.authStore.token,
        record: pb.authStore.model
      };
      const base64Token = btoa(JSON.stringify(tokenData));

      const res = await fetch('/api/driver/assigned-truck-docs', {
        headers: {
          'Authorization': `Bearer ${base64Token}`
        }
      });

      const result = await res.json();
      if (result.success) {
        setData({
          truck: result.truck,
          documents: result.documents || []
        });
      } else {
        toast.error(result.error || "Failed to load vehicle documents.");
      }
    } catch (err) {
      console.error("Error fetching driver documents:", err);
      toast.error("Network error retrieving vehicle documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getDocByType = (type) => {
    return data.documents.find(d => d.document_type === type);
  };

  const handleOpenDoc = (doc) => {
    if (!doc || !doc.file_url) {
      toast.error("This document file is not uploaded.");
      return;
    }
    setZoomLevel(1);
    setSelectedDoc(doc);
  };

  const criticalDocs = [
    { type: 'RC', label: 'Registration Certificate (RC)', description: 'Form 23 - Registration details' },
    { type: 'Insurance', label: 'Insurance Certificate', description: 'Third-party/Comprehensive cover' },
    { type: 'Permit', label: 'National Permit', description: 'Form 48 - Authorization to transit states' },
    { type: 'Fitness Certificate', label: 'Fitness Certificate', description: 'Form 38 - Roadworthiness audit' }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col relative font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-300">
      
      {/* High-visibility top header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-amber-500/20 px-4 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white font-heading">
              Roadside Inspection Mode
            </h1>
            <p className="text-[10px] text-amber-500/80 font-mono uppercase tracking-widest font-semibold">
              RTO Checkpoint Ready
            </p>
          </div>
        </div>
        <button 
          onClick={fetchDocuments}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 active:scale-95 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        
        {/* Active Truck Header */}
        {data.truck ? (
          <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
                  Currently Assigned Vehicle
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white font-heading">
                  {data.truck.truck_number}
                </h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold animate-pulse">
                ONLINE LINK
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-semibold text-white">No Active Vehicle Detected</h3>
            <p className="text-xs text-slate-400 mt-1">
              You are currently not registered on any live trip assignment.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-900 flex items-start gap-3">
          <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any block below to open the official document PDF/image. Show the full-screen view to highway checkpoint authorities.
          </p>
        </div>

        {/* 4 Critical Highway Files */}
        <div className="flex flex-col gap-4">
          {criticalDocs.map((item, idx) => {
            const doc = getDocByType(item.type);
            const isUploaded = !!(doc && doc.file_url);
            const isExpired = doc?.status === 'Expired';
            const isExpiring = doc?.status === 'Expiring Soon';

            return (
              <button
                key={idx}
                onClick={() => handleOpenDoc(doc)}
                disabled={!isUploaded || loading}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex items-center justify-between ${
                  !isUploaded 
                    ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed' 
                    : isExpired
                      ? 'bg-red-950/10 border-red-500/30 hover:border-red-500/60 active:scale-[0.98]'
                      : isExpiring
                        ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/60 active:scale-[0.98]'
                        : 'bg-slate-950 border-slate-800 hover:border-amber-500/40 active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                }`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      !isUploaded 
                        ? 'bg-slate-800 text-slate-400' 
                        : isExpired
                          ? 'bg-red-500/20 text-red-400'
                          : isExpiring
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {item.type}
                    </span>
                    {isUploaded && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        No. {doc.document_number}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5 font-heading">
                    {item.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                  
                  {isUploaded && (
                    <div className="mt-3 flex items-center gap-2 text-[10px]">
                      <span className="text-slate-500">Expiry:</span>
                      <span className={`font-mono font-bold ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-400'}`}>
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {!isUploaded ? (
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                      Missing
                    </span>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-amber-500/30 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                      <Eye className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </main>

      {/* Instantly filling mobile device frame document stream viewer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          
          {/* Top Viewer Controls */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedDoc.document_type}
              </span>
              <span className="text-xs text-slate-300 font-semibold truncate max-w-[180px]">
                {selectedDoc.document_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 active:scale-95 transition-all text-xs font-bold"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 active:scale-95 transition-all text-xs font-bold"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-600 active:scale-95 transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="flex-1 bg-neutral-900 overflow-auto flex items-center justify-center p-2 relative">
            {selectedDoc.file_url.endsWith('.pdf') ? (
              <iframe
                src={`${selectedDoc.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-none rounded-lg"
                title={selectedDoc.document_name}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
              />
            ) : (
              <img
                src={selectedDoc.file_url}
                alt={selectedDoc.document_name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
              />
            )}
          </div>
          
          {/* Bottom RTO Inspector Close Banner */}
          <button 
            onClick={() => setSelectedDoc(null)}
            className="bg-amber-500 text-black py-4 text-center font-bold uppercase tracking-wider text-sm active:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Tap to Go Back to Documents List
          </button>
        </div>
      )}

    </div>
  );
}
