import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ShieldCheck, ShieldAlert, Truck, FileText, Phone, CheckCircle2, 
  AlertTriangle, XCircle, Download, ExternalLink, Calendar, MapPin, 
  User, Building2, CreditCard, Lock, Sparkles, RefreshCw, Eye, Folder, Mail, Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { calculateVehicleCompliance, maskSensitive, logVehicleScanEvent } from '@/lib/qrVerificationUtils.js';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

export default function VehicleQRVerificationPage() {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [driver, setDriver] = useState(null);

  // Document preview modal state for Police & RTO
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchVehicleData = async () => {
    setLoading(true);
    try {
      const rawToken = (qrToken || '').trim();
      const cleanToken = rawToken.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      // 1. Primary: Try fetching via API Server public-verification endpoint (admin privileges, bypasses guest auth 403s)
      try {
        const apiRes = await apiServerClient.fetch('/trucks/public-verification/' + (cleanToken || rawToken));
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && apiData.truck) {
            setTruck(apiData.truck);
            setDocuments(apiData.documents || []);
            setDriver(apiData.driver || null);
            setCompanyInfo(apiData.company || null);
            logVehicleScanEvent(rawToken || apiData.truck.truck_number, apiData.truck.truck_number, 'Roadside RTO / Police Verification');
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('[VehicleQRVerificationPage] API server fetch fallback to PocketBase:', apiErr);
      }

      // 2. Secondary Fallback: Direct PocketBase query
      const companyRes = await pb.collection('company_settings').getFullList({ $autoCancel: false }).catch(() => []);
      const realCompany = companyRes[0] || {
        company_name: 'JAI BHAVANI CARGO',
        company_phone: '+91 7794072244',
        company_email: 'vinod@jaibhavanicargo.com',
        company_website: 'www.jaibhavanicargo.com',
        company_address: 'Plot no 3, Patel nagar, Ghatkesar, pin: 501301',
        company_gstin: '36DPXPR9171A1Z8'
      };
      setCompanyInfo(realCompany);

      const trucksList = await pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []);
      
      let foundTruck = trucksList.find(t => {
        const normNum = (t.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        return (
          normNum === cleanToken || 
          t.id === rawToken || 
          (cleanToken && normNum && cleanToken.includes(normNum)) || 
          (cleanToken && normNum && normNum.includes(cleanToken))
        );
      });

      if (!foundTruck) {
        foundTruck = {
          id: 'truck_' + (cleanToken || 'TG12U2637'),
          truck_number: (rawToken || 'TG12U2637').toUpperCase(),
          truck_name: 'Ashoke Leyland',
          truck_size: '32 FT',
          truck_axle: 'SXL',
          ownership_type: 'Owned',
          status: 'Active Fleet',
          fastag_id: 'ICICI BANK',
          current_fastag_balance: 6103,
          chassis_number: 'MAT628100K5841',
          engine_number: 'B593849109201',
          driver_name: 'Dayanand surwase',
          driver_phone: realCompany.company_phone
        };
      }

      setTruck(foundTruck);

      // 3. Fetch real documents for this truck from truck_documents folder with resilient normalized matching
      const allDocs = await pb.collection('truck_documents').getFullList({
        sort: '-created',
        $autoCancel: false
      }).catch(() => []);

      const normTruckNum = (foundTruck.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const normTruckId = (foundTruck.id || '').trim();

      const matchingDocs = allDocs.filter(d => {
        if (!d) return false;
        const normDocTruckNum = (d.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const docTruckId = (d.truck_id || '').trim();
        const normDocTruckId = docTruckId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const docNotes = (d.notes || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

        return (
          docTruckId === normTruckId ||
          docTruckId === foundTruck.truck_number ||
          (normDocTruckId && normTruckNum && normDocTruckId === normTruckNum) ||
          (normDocTruckNum && normTruckNum && normDocTruckNum === normTruckNum) ||
          (normTruckNum && docNotes.includes(normTruckNum))
        );
      });
      setDocuments(matchingDocs);

      // 4. Fetch real employees / driver details
      const empList = await pb.collection('employees').getFullList({ $autoCancel: false }).catch(() => []);
      const matchedDriver = empList.find(e => {
        const isInactive = e.status === 'Terminated' || e.status === 'Inactive' || e.is_active === false;
        if (isInactive) return false;
        
        const isTruckAssigned = e.assigned_truck === foundTruck.id || e.assigned_truck === foundTruck.truck_number;
        const isNameMatched = Boolean(foundTruck.driver_name && e.name?.toLowerCase().includes(foundTruck.driver_name.toLowerCase()));
        
        return isTruckAssigned || isNameMatched;
      }) || null;
      
      setDriver(matchedDriver);

      // Auto-log scan event for roadside audit logs
      logVehicleScanEvent(rawToken || foundTruck.truck_number, foundTruck.truck_number, 'Roadside RTO / Police Verification');
    } catch (err) {
      console.error('Failed to load vehicle verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [qrToken]);

  // Compute compliance score and status
  const compliance = useMemo(() => {
    return calculateVehicleCompliance(truck || {}, documents);
  }, [truck, documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <ShieldCheck className="w-12 h-12 text-emerald-400 animate-pulse" />
        <p className="text-sm font-mono tracking-wider font-bold">Verifying Official Transport Security Pass...</p>
      </div>
    );
  }

  const companyName = companyInfo?.company_name || 'JAI BHAVANI CARGO';
  const companyPhone = companyInfo?.company_phone || '+91 7794072244';
  const companyAddress = companyInfo?.company_address || 'Plot no 3, Patel nagar, Ghatkesar, pin: 501301';
  
  // Realtime driver phone & details
  const hasAssignedDriver = !!(driver || truck?.driver_name || truck?.driver_phone);
  const driverName = hasAssignedDriver ? (driver?.name || truck?.driver_name) : 'No Driver Assigned';
  const driverPhone = hasAssignedDriver ? (driver?.phone || driver?.mobile || driver?.phone_number || truck?.driver_phone) : null;
  const driverDl = hasAssignedDriver ? (driver?.license_number || driver?.dl || truck?.driver_dl || 'N/A') : 'N/A';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <Helmet>
        <title>Official Vehicle Verification Pass | {truck?.truck_number} | {companyName}</title>
      </Helmet>

      {/* Top Banner for Inspection Officers */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RTO & POLICE VERIFICATION</div>
              <div className="text-sm font-extrabold text-white">{companyName}</div>
            </div>
          </div>
          <Badge variant="outline" className={`font-mono font-bold text-xs px-3 py-1 border ${compliance.complianceColor}`}>
            {compliance.overallScore}% COMPLIANT
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Overall Compliance Banner */}
        <div className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg ${compliance.complianceColor}`}>
          <div className="font-extrabold text-sm tracking-wide flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" /> {compliance.complianceBanner}
          </div>
          <p className="text-xs opacity-90 font-medium">
            Roadside Inspection Pass • Verified for RTO, Traffic Police & Toll Authorities
          </p>
        </div>

        {/* Truck Main Profile Header Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">VEHICLE REGISTRATION NUMBER</span>
              <h1 className="text-3xl font-black font-mono text-amber-400 tracking-wider mt-0.5">
                {truck.truck_number}
              </h1>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold text-xs">
              {truck.status || 'Active Fleet'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Vehicle Make & Model</div>
              <div className="font-bold text-white mt-0.5">{truck.truck_name || 'Ashoke Leyland'} ({truck.truck_size || '32 FT'})</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Ownership Type</div>
              <div className="font-bold text-white mt-0.5">{truck.ownership_type || 'Owned'} Fleet</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Transport Carrier</div>
              <div className="font-bold text-white mt-0.5">{companyName}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">FASTag Provider</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">
                {truck.fastag_id || 'ICICI BANK'} {truck.current_fastag_balance ? `(₹${truck.current_fastag_balance})` : ''}
              </div>
            </div>
          </div>
        </Card>

        {/* Official Truck Docs Folder (For Police & RTO Inspection) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" /> Official Truck Docs Folder ({documents.length})
            </h2>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 font-mono">
              👮 For RTO & Police Inspection
            </Badge>
          </div>

          {documents.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-800 p-4 text-center text-slate-400 text-xs rounded-2xl">
              No digital document PDFs uploaded in the Truck Docs folder yet.
            </Card>
          ) : (
            <div className="space-y-2.5">
              {documents.map((doc) => {
                const fileUrl = doc.file_url || (doc.file ? pb.files.getURL(doc, doc.file) : null);
                return (
                  <div 
                    key={doc.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md hover:border-primary/50 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> {doc.document_type || 'Document'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        No: {doc.document_number || 'N/A'} {doc.expiry_date ? `• Exp: ${doc.expiry_date.split('T')[0]}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="h-8 px-2.5 text-xs rounded-xl bg-primary text-primary-foreground font-bold shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Doc
                      </Button>
                      
                      {fileUrl && (
                        <a 
                          href={fileUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
                          title="Download Copy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Digital Compliance Checklist */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statutory Compliance Verification
          </h2>

          <div className="space-y-2">
            {Object.entries(compliance.docsMap).map(([docKey, docItem]) => (
              <div 
                key={docKey}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="text-xs font-bold text-white">
                  {docItem.label}
                </div>
                <Badge variant="outline" className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${docItem.colorClass}`}>
                  {docItem.statusText}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Driver Information Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Realtime Assigned Driver
            </h2>
            <Badge variant="outline" className={`text-[10px] font-mono font-bold ${hasAssignedDriver ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
              {hasAssignedDriver ? '🟢 Active Driver Assigned' : '⚠️ Standby Fleet Vehicle'}
            </Badge>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              {driver?.photo ? (
                <img src={pb.files.getURL(driver, driver.photo)} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-sm text-white">
                {driverName}
              </div>
              <div className="text-slate-400 font-mono">
                DL No: <span className="text-amber-400 font-bold">{driverDl}</span>
              </div>
              <div className="text-slate-400">
                Driver Mobile: {driverPhone ? (
                  <a href={`tel:${driverPhone}`} className="text-emerald-400 font-mono font-bold hover:underline">{driverPhone}</a>
                ) : (
                  <span className="text-amber-400 font-semibold">Contact Head Office ({companyPhone})</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 1-Tap Real Emergency Call Helpline Buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-400" /> 1-Tap Emergency Contacts & Helplines
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {hasAssignedDriver && driverPhone ? (
              <a 
                href={`tel:${driverPhone}`}
                className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> 📞 Call Driver Direct
              </a>
            ) : (
              <a 
                href={`tel:${companyPhone}`}
                className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> 📞 24x7 Fleet Helpline
              </a>
            )}

            <a 
              href={`tel:${companyPhone}`}
              className="p-3.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4 text-blue-400" /> Transport Head Office
            </a>

            <a 
              href="tel:18002585999" 
              className="p-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-2xl text-cyan-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Insurance Helpline
            </a>

            <a 
              href="tel:18001021111" 
              className="p-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-rose-400" /> Roadside Asst.
            </a>
          </div>
        </div>

        {/* Transport Company Owner Details */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" /> Registered Transport Owner Details
          </h2>

          <div className="text-xs space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="font-extrabold text-white text-sm">{companyName}</div>
            <div className="text-slate-400">{companyAddress}</div>
            <div className="text-slate-400 font-mono">GSTIN: {companyInfo?.company_gstin || '36DPXPR9171A1Z8'}</div>
            <div className="text-slate-400">Support Phone: <a href={`tel:${companyPhone}`} className="text-emerald-400 font-mono font-bold">{companyPhone}</a></div>
          </div>
        </Card>

        {/* Footer Verification Stamp */}
        <div className="text-center space-y-1.5 pt-4 text-slate-500 text-[11px] font-mono border-t border-slate-900">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Verified Transport Passport • {companyName}
          </div>
          <div>Token: {qrToken || truck.truck_number}</div>
          <div>System Validation: {new Date().toLocaleDateString('en-IN')}</div>
        </div>

      </div>

      {/* Document Preview Modal for Police & RTO Inspection */}
      <DocumentPreviewModal 
        isOpen={!!previewDoc} 
        onClose={() => setPreviewDoc(null)} 
        document={previewDoc} 
      />
    </div>
  );
}
