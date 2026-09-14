import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Truck, Calendar, MapPin, Search, ArrowRight, Building, FileCheck } from 'lucide-react';
import { dbtabeses } from '../db/store';
import { LorryReceipt, PodRecord } from '../types';

interface Props {
  token?: string;
  onBackToPortal?: () => void;
}

export const PublicVerifyDocumentPage: React.FC<Props> = ({ token = '', onBackToPortal }) => {
  const company = dbtabeses.getCompanySettings();
  const allLrs: LorryReceipt[] = dbtabeses.getLorryReceipts();
  const allPods: PodRecord[] = dbtabeses.getPodRecords();

  const [searchQuery, setSearchQuery] = useState(token);
  const [activeToken, setActiveToken] = useState(token);

  // Find LR by secure_token or LR number
  const matchedLr = allLrs.find(
    (l) => l.secure_token === activeToken || l.lr_number.toLowerCase() === activeToken.toLowerCase()
  );

  // Linked POD if any
  const matchedPod = matchedLr?.pod_id
    ? allPods.find((p) => p.id === matchedLr.pod_id || p.pod_number === matchedLr.pod_number)
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveToken(searchQuery.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-lg space-y-5">
        {/* Company Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-xl shadow-orange-950/50 mb-1">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            {company.company_name || 'JAI BHAVANI CARGO'}
          </h1>
          <p className="text-xs font-semibold text-orange-400 tracking-wider uppercase">
            Official Document &amp; Shipment Authenticity Verification
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Ghatkesar, Hyderabad &bull; GSTIN: {company.company_gstin}
          </p>
        </div>

        {/* Verification Token Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter LR Number or Verification Token..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Verify
          </button>
        </form>

        {/* Verification Result Card */}
        {matchedLr ? (
          <div className="bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            {/* Authenticity Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="font-extrabold text-sm block">GENUINE CONSIGNMENT</span>
                  <span className="text-[10px] text-slate-400">Authenticated by Jai Bhavani Cargo ERP</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                matchedLr.status === 'Generated' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                matchedLr.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {matchedLr.status}
              </span>
            </div>

            {/* Safe Public Tracking Information */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">LR Number</span>
                  <span className="font-mono font-black text-sm text-orange-400">{matchedLr.lr_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Booking Date</span>
                  <span className="font-semibold text-slate-200">{matchedLr.lr_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vehicle Number</span>
                  <span className="font-mono font-bold text-slate-200">{matchedLr.vehicle_details.vehicle_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vehicle Type</span>
                  <span className="text-slate-300 truncate block">{matchedLr.vehicle_details.vehicle_type}</span>
                </div>
              </div>

              {/* Transit Route */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Origin City</span>
                  <span className="font-bold text-white text-sm">{matchedLr.route_details.origin}</span>
                </div>
                <div className="text-center px-2">
                  <ArrowRight className="w-5 h-5 text-orange-400 mx-auto" />
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">Direct Route</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Destination City</span>
                  <span className="font-bold text-white text-sm">{matchedLr.route_details.destination}</span>
                </div>
              </div>

              {/* Delivery / POD Status */}
              {matchedPod || matchedLr.pod_status === 'Delivered in Full' ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-300 block">Shipment Delivered</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {matchedPod?.delivery_date ? `Delivered on ${matchedPod.delivery_date} at ${matchedPod.delivery_time}` : 'Destination Handover Verified'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    POD Archived
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold text-blue-300 block">Consignment Active / In Transit</span>
                    <span className="text-[10px] text-slate-400">
                      Dispatched under official consignment note &bull; Delivery pending destination confirmation
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-800">
              For commercial queries, contact Jai Bhavani Cargo operations at {company.company_phone} or {company.company_email}.
            </p>
          </div>
        ) : activeToken ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2 text-xs text-slate-400">
            <p className="text-white font-bold text-sm">No Document Found</p>
            <p>The LR number or verification token &quot;{activeToken}&quot; could not be found in our records.</p>
          </div>
        ) : null}

        {/* Back to ERP Portal Link */}
        {onBackToPortal && (
          <div className="text-center pt-2">
            <button
              onClick={onBackToPortal}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline cursor-pointer"
            >
              &larr; Return to Jai Bhavani Cargo ERP Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
