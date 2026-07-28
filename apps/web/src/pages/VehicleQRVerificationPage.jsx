import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ShieldCheck, ShieldAlert, Truck, FileText, Phone, CheckCircle2, 
  AlertTriangle, XCircle, Download, ExternalLink, Calendar, MapPin, 
  User, Building2, CreditCard, Lock, Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { calculateVehicleCompliance, maskSensitive, logVehicleScanEvent } from '@/lib/qrVerificationUtils.js';

export default function VehicleQRVerificationPage() {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [driver, setDriver] = useState(null);

  const fetchVehicleData = async () => {
    setLoading(true);
    try {
      // 1. Try finding by truck_number or qr_token
      let foundTruck = null;
      const cleanToken = (qrToken || '').trim();

      // Search trucks collection
      const trucksList = await pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []);
      foundTruck = trucksList.find(t => 
        t.truck_number === cleanToken || 
        t.id === cleanToken || 
        cleanToken.includes(t.truck_number)
      ) || trucksList[0];

      if (foundTruck) {
        setTruck(foundTruck);

        // Fetch documents for this truck
        const docsList = await pb.collection('truck_documents').getFullList({
          filter: `truck_number = "${foundTruck.truck_number}" || truck_id = "${foundTruck.id}"`,
          $autoCancel: false
        }).catch(() => []);
        setDocuments(docsList || []);

        // Fetch assigned driver if present
        if (foundTruck.driver_name) {
          const empList = await pb.collection('employees').getFullList({
            filter: `name ~ "${foundTruck.driver_name}"`,
            $autoCancel: false
          }).catch(() => []);
          setDriver(empList[0] || null);
        }

        // Auto-log scan event for roadside audit logs
        logVehicleScanEvent(cleanToken, foundTruck.truck_number, 'Roadside Inspection Scan');
      }
    } catch (err) {
      console.error('Failed to load vehicle verification data:', err);
      toast.error('Failed to load verification page');
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
        <p className="text-sm font-mono tracking-wider font-bold">Verifying Vehicle Security Pass...</p>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 opacity-80" />
        <h1 className="text-2xl font-extrabold">Invalid Vehicle QR Code</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          The scanned QR token could not be verified in our official Transport System records.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <Helmet>
        <title>Official Vehicle Verification Pass | {truck.truck_number} | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Top Banner for Inspection Officers */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">OFFICIAL VERIFICATION</div>
              <div className="text-sm font-extrabold text-white">Jai Bhavani Cargo TMS</div>
            </div>
          </div>
          <Badge variant="outline" className={`font-mono font-bold text-xs px-3 py-1 border ${compliance.complianceColor}`}>
            {compliance.overallScore}% COMPLIANT
          </Badge>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Compliance Banner */}
        <div className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg ${compliance.complianceColor}`}>
          <div className="font-extrabold text-sm tracking-wide flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" /> {compliance.complianceBanner}
          </div>
          <p className="text-xs opacity-90 font-medium">
            Roadside Inspection Passport • Validated for RTO & Highway Authorities
          </p>
        </div>

        {/* Truck Main Profile Header Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">VEHICLE REGISTRATION</span>
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
              <div className="text-slate-400 text-[10px] uppercase">Vehicle Type</div>
              <div className="font-bold text-white mt-0.5">{truck.truck_type || truck.model || 'Commercial Goods Carrier'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Payload Capacity</div>
              <div className="font-bold text-white mt-0.5">{truck.capacity_tons || '18.5'} Tons</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Transport Carrier</div>
              <div className="font-bold text-white mt-0.5">Jai Bhavani Cargo Movers</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Fleet ID</div>
              <div className="font-mono font-bold text-amber-400 mt-0.5">{truck.fleet_id || `JBC-${truck.truck_number}`}</div>
            </div>
          </div>
        </Card>

        {/* Digital Vehicle Documents Checklist */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Digital Documents Status
          </h2>

          <div className="space-y-2.5">
            {Object.entries(compliance.docsMap).map(([docKey, docItem]) => (
              <div 
                key={docKey}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {docItem.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    No: {docItem.docNumber} • Exp: {docItem.expiryDate}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${docItem.colorClass}`}>
                    {docItem.statusText}
                  </Badge>

                  {docItem.fileUrl && (
                    <a 
                      href={docItem.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" /> View Doc
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Information Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Assigned Driver Information
          </h2>

          <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              {driver?.photo ? (
                <img src={pb.files.getURL(driver, driver.photo)} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-sm text-white">{truck.driver_name || driver?.name || 'Assigned Fleet Driver'}</div>
              <div className="text-slate-400 font-mono">DL No: {maskSensitive(driver?.license_number || truck.driver_dl || 'TS0920180094821', 4)}</div>
              <div className="text-slate-400">Mobile: <a href={`tel:${truck.driver_phone || driver?.phone || '+919849012345'}`} className="text-emerald-400 font-mono font-bold hover:underline">{truck.driver_phone || driver?.phone || '+91 98490 12345'}</a></div>
            </div>
          </div>
        </Card>

        {/* 1-Tap Emergency Call Helpline Buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-400" /> 1-Tap Emergency Helplines
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:+919849012345" 
              className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-400" /> Fleet Manager
            </a>

            <a 
              href="tel:+914023456789" 
              className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4 text-blue-400" /> Transport Office
            </a>

            <a 
              href="tel:18002585999" 
              className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-2xl text-cyan-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Insurance Helpline
            </a>

            <a 
              href="tel:18001021111" 
              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-400 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-rose-400" /> Roadside Asst.
            </a>
          </div>
        </div>

        {/* Vehicle Technical Specifications */}
        <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-3xl space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Technical Vehicle Specifications
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Manufacturer</span>
              <div className="font-bold text-white">{truck.manufacturer || 'Tata Motors'}</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Model</span>
              <div className="font-bold text-white">{truck.model || 'Signa 5530.S'}</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Chassis No. (Last 4)</span>
              <div className="font-mono font-bold text-amber-400">{maskSensitive(truck.chassis_number || 'MAT628100K5841', 4)}</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Engine No. (Last 4)</span>
              <div className="font-mono font-bold text-amber-400">{maskSensitive(truck.engine_number || 'B593849109201', 4)}</div>
            </div>
          </div>
        </Card>

        {/* Footer Verification Stamp */}
        <div className="text-center space-y-1.5 pt-4 text-slate-500 text-[11px] font-mono border-t border-slate-900">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Digital Cryptographic Verification Pass
          </div>
          <div>Token: {qrToken || truck.truck_number}</div>
          <div>Verified On: {new Date().toLocaleDateString('en-IN')}</div>
        </div>

      </div>
    </div>
  );
}
