import React, { useState, useMemo } from 'react';
import { 
  Building2, ShieldCheck, Share2, Copy, Download, MessageSquare, 
  FileText, CheckCircle2, AlertCircle, Truck, ExternalLink, 
  Check, Layers, FileSpreadsheet, Lock, Sparkles, Filter, Archive
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import JSZip from 'jszip';

export default function FinancierFleetDossierModal({ 
  isOpen, 
  onClose, 
  trucks = [], 
  documents = [], 
  companyInfo = {
    company_name: 'JAI BHAVANI CARGO',
    company_gstin: '36DPXPR9171A1Z8',
    company_phone: '+91 7794072244',
    company_email: 'vinod@jaibhavanicargo.com',
    company_website: 'www.jaibhavanicargo.com'
  }
}) {
  const [selectedTruckIds, setSelectedTruckIds] = useState([]);
  const [recipientName, setRecipientName] = useState('HDFC Bank / Vehicle Loan Division');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [dossierTitle, setDossierTitle] = useState('Fleet Asset Portfolio & RC Verification Dossier');
  const [notes, setNotes] = useState('Official fleet compliance dossier containing vehicle registration certificates (RC), specifications, and operational track records for vehicle financing / credit line evaluation.');
  const [includeRC, setIncludeRC] = useState(true);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includePermit, setIncludePermit] = useState(true);
  const [includeFitness, setIncludeFitness] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [filterOwnership, setFilterOwnership] = useState('all');

  // Initialize selected trucks to all trucks on open
  React.useEffect(() => {
    if (isOpen && trucks.length > 0 && selectedTruckIds.length === 0) {
      setSelectedTruckIds(trucks.map(t => t.id));
    }
  }, [isOpen, trucks]);

  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
      if (filterOwnership === 'all') return true;
      return (t.ownership_type || 'Owned').toLowerCase() === filterOwnership.toLowerCase();
    });
  }, [trucks, filterOwnership]);

  const toggleSelectAll = () => {
    if (selectedTruckIds.length === filteredTrucks.length) {
      setSelectedTruckIds([]);
    } else {
      setSelectedTruckIds(filteredTrucks.map(t => t.id));
    }
  };

  const toggleTruck = (id) => {
    setSelectedTruckIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  // Selected trucks with their associated documents
  const selectedFleetWithDocs = useMemo(() => {
    return trucks.filter(t => selectedTruckIds.includes(t.id)).map(truck => {
      const truckDocs = documents.filter(d => d.truck_id === truck.id);
      const rcDoc = truckDocs.find(d => (d.document_type || '').toUpperCase() === 'RC');
      const insDoc = truckDocs.find(d => (d.document_type || '').toUpperCase().includes('INSUR'));
      const fitDoc = truckDocs.find(d => (d.document_type || '').toUpperCase().includes('FITNESS'));
      const permitDoc = truckDocs.find(d => (d.document_type || '').toUpperCase().includes('PERMIT'));

      return {
        ...truck,
        rcDoc,
        insDoc,
        fitDoc,
        permitDoc,
        allDocs: truckDocs
      };
    });
  }, [trucks, selectedTruckIds, documents]);

  const rcCount = useMemo(() => {
    return selectedFleetWithDocs.filter(t => t.rcDoc).length;
  }, [selectedFleetWithDocs]);

  // 1. Generate Cloud Share Link
  const handleGenerateShareLink = async () => {
    if (selectedTruckIds.length === 0) {
      return toast.error('Please select at least 1 truck.');
    }
    setIsGeneratingLink(true);
    try {
      const res = await fetch('/hcgi/api/shared/create-fleet-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truck_ids: selectedTruckIds,
          dossier_title: dossierTitle,
          recipient_name: recipientName,
          notes: notes
        })
      });

      let shareId = '';
      if (res.ok) {
        const data = await res.json();
        shareId = data.id;
      } else {
        // Fallback directly to PocketBase
        const rec = await pb.collection('shared_folders').create({
          truck_id: '',
          employee_id: '',
          folder_type: 'fleet_dossier',
          truck_ids: JSON.stringify(selectedTruckIds),
          recipient_name: recipientName,
          dossier_title: dossierTitle,
          notes: notes
        }, { $autoCancel: false });
        shareId = rec.id;
      }

      const fullUrl = `${window.location.origin}/share/${shareId}`;
      setGeneratedShareUrl(fullUrl);
      await navigator.clipboard.writeText(fullUrl);
      toast.success('🎉 Financier Fleet Dossier link copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate share link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // 2. WhatsApp Financier Package
  const handleShareWhatsApp = async () => {
    let shareUrl = generatedShareUrl;
    if (!shareUrl) {
      try {
        const res = await fetch('/hcgi/api/shared/create-fleet-dossier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            truck_ids: selectedTruckIds,
            dossier_title: dossierTitle,
            recipient_name: recipientName,
            notes: notes
          })
        });
        if (res.ok) {
          const data = await res.json();
          shareUrl = `${window.location.origin}/share/${data.id}`;
          setGeneratedShareUrl(shareUrl);
        }
      } catch (e) {}
    }

    const truckNumbers = selectedFleetWithDocs.map(t => t.truck_number).join(', ');
    const message = `*JAI BHAVANI CARGO — FLEET ASSET & RC DOSSIER*
--------------------------------------------
*Recipient / Financier:* ${recipientName}
*Total Vehicles:* ${selectedFleetWithDocs.length} Trucks
*Verified RCs Attached:* ${rcCount} / ${selectedFleetWithDocs.length}
*GSTIN:* ${companyInfo.company_gstin || '36DPXPR9171A1Z8'}

*Vehicle List:*
${truckNumbers}

*Secure Cloud Dossier & RC Documents Access Link:*
👉 ${shareUrl || `${window.location.origin}/truck-docs`}

_Please click the link above to inspect high-resolution Registration Certificates (RC), fitness validity, permits, and vehicle specifications._

*Regards,*
Jai Bhavani Cargo Ltd
${companyInfo.company_phone || '+91 7794072244'}`;

    const cleanPhone = (recipientPhone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  // 3. Download Complete Fleet Track Record PDF Dossier
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      
      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 28, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.company_name || 'JAI BHAVANI CARGO', 14, 12);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Fleet Asset Portfolio & RC Verification Ledger • GSTIN: ${companyInfo.company_gstin || '36DPXPR9171A1Z8'} • Generated: ${format(new Date(), 'dd MMM yyyy')}`, 14, 20);

      // Meta Summary Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 33, 269, 18, 2, 2, 'F');
      
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`Evaluator / Financier: ${recipientName}`, 18, 41);
      doc.text(`Total Vehicles: ${selectedFleetWithDocs.length}`, 120, 41);
      doc.text(`Active RCs Attached: ${rcCount} of ${selectedFleetWithDocs.length}`, 190, 41);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Asset Type: Heavy Commercial Multi-Axle Container Trucks • Status: Active Fleet Operations`, 18, 47);

      // Fleet Table
      const tableData = selectedFleetWithDocs.map((t, idx) => [
        idx + 1,
        t.truck_number,
        t.truck_name || 'Container Truck',
        t.truck_size || '24 FT',
        t.truck_axle || 'SXL',
        t.tyre_count ? `${t.tyre_count} Tyres` : '6 Tyres',
        t.payload_capacity || '10 Ton',
        t.ownership_type || 'Owned',
        t.rcDoc ? '✓ Attached' : '— Pending',
        t.insDoc ? (t.insDoc.expiry_date ? format(new Date(t.insDoc.expiry_date), 'dd/MM/yyyy') : 'Active') : '—',
        t.fitDoc ? (t.fitDoc.expiry_date ? format(new Date(t.fitDoc.expiry_date), 'dd/MM/yyyy') : 'Active') : '—',
        t.current_fastag_balance ? `Rs. ${Number(t.current_fastag_balance).toLocaleString('en-IN')}` : 'Rs. 0'
      ]);

      doc.autoTable({
        startY: 55,
        head: [['#', 'Truck Number', 'Vehicle Model', 'Size', 'Axle', 'Tyres', 'Payload', 'Ownership', 'RC Status', 'Insurance Exp', 'Fitness Exp', 'FASTag']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2.5, font: 'helvetica' },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          1: { fontStyle: 'bold', textColor: [15, 23, 42] },
          8: { fontStyle: 'bold', textColor: [16, 185, 129] }
        }
      });

      // Footer Stamp
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Official Document of ${companyInfo.company_name} • Strictly for financing evaluation & compliance audit • Page ${i} of ${pageCount}`, 14, 204);
      }

      doc.save(`JBC_Fleet_Asset_Dossier_${selectedFleetWithDocs.length}_Vehicles.pdf`);
      toast.success('Downloaded Fleet Asset PDF Dossier!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 4. Download All RCs as ZIP Bundle
  const handleDownloadAllRCsZIP = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rcFolder = zip.folder("RC_Documents");
      let addedCount = 0;

      for (const t of selectedFleetWithDocs) {
        if (t.rcDoc) {
          const fileName = t.rcDoc.file || (Array.isArray(t.rcDoc.files) ? t.rcDoc.files[0] : t.rcDoc.files);
          if (fileName) {
            try {
              const fileUrl = pb.files.getUrl(t.rcDoc, fileName);
              const response = await fetch(fileUrl);
              if (response.ok) {
                const blob = await response.blob();
                const ext = fileName.split('.').pop() || 'pdf';
                rcFolder.file(`${t.truck_number}_RC.${ext}`, blob);
                addedCount++;
              }
            } catch (fileErr) {
              console.warn(`Could not fetch RC file for ${t.truck_number}:`, fileErr);
            }
          }
        }
      }

      if (addedCount === 0) {
        toast.error('No RC document files found for the selected vehicles.');
        setIsZipping(false);
        return;
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `JBC_Fleet_RC_Bundle_${selectedFleetWithDocs.length}_Vehicles.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`📦 Downloaded ZIP bundle with ${addedCount} vehicle RC documents!`);
    } catch (err) {
      console.error('ZIP error:', err);
      toast.error('Failed to create ZIP bundle');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[92vh] flex flex-col p-0 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground">
                Financier Fleet Dossier &amp; Multi-RC Vault
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Package all 50+ vehicle RCs, specifications, and track records into a single executive dossier for banks, loan evaluators, and financiers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Selected Fleet</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">{selectedTruckIds.length} <span className="text-xs font-normal text-muted-foreground">Trucks</span></p>
            </div>
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">RC Documents</p>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{rcCount} <span className="text-xs font-normal text-muted-foreground">Available</span></p>
            </div>
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Payload Capacity</p>
              <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {selectedFleetWithDocs.length * 10}+ <span className="text-xs font-normal text-muted-foreground">Tons</span>
              </p>
            </div>
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Compliance Status</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                {rcCount === selectedTruckIds.length ? '100% Ready' : `${Math.round((rcCount / (selectedTruckIds.length || 1)) * 100)}% Verified`}
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 border border-border/60 rounded-2xl p-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Financier / Bank / Evaluator Name</Label>
              <Input 
                value={recipientName} 
                onChange={e => setRecipientName(e.target.value)} 
                placeholder="e.g. HDFC Bank, Tata Capital, Shriram Finance"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Financier WhatsApp Number (Optional)</Label>
              <Input 
                value={recipientPhone} 
                onChange={e => setRecipientPhone(e.target.value)} 
                placeholder="e.g. 9876543210"
                className="h-8 text-xs bg-background font-mono"
              />
            </div>
          </div>

          {/* Vehicle Selection Header & Filter */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={toggleSelectAll}
                  className="h-7 px-2.5 text-xs font-semibold rounded-lg"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-primary" />
                  {selectedTruckIds.length === filteredTrucks.length ? 'Deselect All' : `Select All (${filteredTrucks.length})`}
                </Button>
                <span className="text-xs text-muted-foreground">
                  <strong>{selectedTruckIds.length}</strong> of {trucks.length} vehicles selected
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground mr-1">Filter:</span>
                <Button 
                  size="sm" 
                  variant={filterOwnership === 'all' ? 'secondary' : 'ghost'}
                  onClick={() => setFilterOwnership('all')}
                  className="h-6 px-2 text-[11px] rounded"
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={filterOwnership === 'owned' ? 'secondary' : 'ghost'}
                  onClick={() => setFilterOwnership('owned')}
                  className="h-6 px-2 text-[11px] rounded"
                >
                  Owned
                </Button>
                <Button 
                  size="sm" 
                  variant={filterOwnership === 'attached' ? 'secondary' : 'ghost'}
                  onClick={() => setFilterOwnership('attached')}
                  className="h-6 px-2 text-[11px] rounded"
                >
                  Attached
                </Button>
              </div>
            </div>

            {/* Vehicle Grid Checkboxes */}
            <div className="border border-border/70 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto divide-y divide-border/60">
              {filteredTrucks.map(truck => {
                const isSelected = selectedTruckIds.includes(truck.id);
                const truckDocs = documents.filter(d => d.truck_id === truck.id);
                const hasRC = truckDocs.some(d => (d.document_type || '').toUpperCase() === 'RC');

                return (
                  <div 
                    key={truck.id} 
                    onClick={() => toggleTruck(truck.id)}
                    className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => {}} 
                        className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-mono font-bold text-foreground">{truck.truck_number}</span>
                        <span className="text-muted-foreground ml-2 text-[11px]">({truck.truck_size || '24 FT'} • {truck.truck_axle || 'SXL'})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasRC ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[9px] px-1.5 py-0">
                          ✓ RC Attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] px-1.5 py-0">
                          ⚠️ No RC
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {truck.ownership_type || 'Owned'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated Share URL box if active */}
          {generatedShareUrl && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live Financier Cloud Share Link Active:
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => window.open(generatedShareUrl, '_blank')}
                  className="h-6 text-[11px] text-emerald-600 hover:text-emerald-700 p-0"
                >
                  <ExternalLink className="w-3 h-3 mr-1" /> Open Live
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedShareUrl} className="h-8 text-xs font-mono bg-background" />
                <Button 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedShareUrl);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="h-8 text-xs font-semibold rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer Buttons */}
        <DialogFooter className="p-4 bg-muted/30 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Download All RCs ZIP */}
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleDownloadAllRCsZIP}
              disabled={isZipping || selectedTruckIds.length === 0 || rcCount === 0}
              className="h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-muted"
              title="Download all selected vehicle RCs in a single ZIP archive"
            >
              <Archive className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              {isZipping ? 'Bundling...' : `Download RCs ZIP (${rcCount})`}
            </Button>

            {/* 2. Download Track Record PDF */}
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || selectedTruckIds.length === 0}
              className="h-9 text-xs font-bold rounded-xl border-border/80 hover:bg-muted"
              title="Download branded multi-page fleet asset portfolio PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              {isGeneratingPDF ? 'Generating...' : 'Fleet PDF Dossier'}
            </Button>

            {/* 3. Generate Link */}
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleGenerateShareLink}
              disabled={isGeneratingLink || selectedTruckIds.length === 0}
              className="h-9 text-xs font-bold rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              title="Generate a secure cloud link for financiers"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              {isGeneratingLink ? 'Creating...' : 'Copy Cloud Link'}
            </Button>

            {/* 4. WhatsApp Package */}
            <Button 
              size="sm" 
              onClick={handleShareWhatsApp}
              disabled={selectedTruckIds.length === 0}
              className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20 px-3.5"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Send WhatsApp Package
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
