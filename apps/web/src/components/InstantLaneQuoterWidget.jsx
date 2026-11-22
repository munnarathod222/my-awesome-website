import React, { useState } from 'react';
import { 
  Search, ArrowRight, Copy, Share2, Sparkles, Check, IndianRupee, 
  Clock, Truck, ExternalLink, Settings, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { laneRateClient, formatRateBadge } from '@/lib/laneRateClient.js';

export default function InstantLaneQuoterWidget({ lanes = [], onOpenManageLanes }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLane, setSelectedLane] = useState(null);
  const [copied, setCopied] = useState(false);

  // Quick suggestions: first 5 active lanes
  const popularLanes = lanes.slice(0, 5);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) {
      setSelectedLane(null);
      return;
    }
    const match = laneRateClient.findQuote(val);
    setSelectedLane(match);
  };

  const selectLaneDirect = (lane) => {
    setSelectedLane(lane);
    setSearchTerm(`${lane.origin} to ${lane.destination}`);
  };

  const handleCopyQuote = (lane) => {
    if (!lane) return;
    const text = laneRateClient.generateWhatsAppQuote(lane);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Quote for ${lane.origin} ➔ ${lane.destination} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = (lane) => {
    if (!lane) return;
    const text = laneRateClient.generateWhatsAppQuote(lane);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl space-y-3 font-sans">
      {/* ── Top Bar with Title & Manage Button ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
            ₹
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-wide font-mono flex items-center gap-2">
              INSTANT LANE QUOTER & SPOT RATES
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                General Lanes (26–29k)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Instant quote lookup for on-call customers with pre-formatted WhatsApp quote generator.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenManageLanes}
          className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-8 rounded-xl shrink-0"
        >
          <Settings className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          Manage Corridor Rates
        </Button>
      </div>

      {/* ── Quick Search & Popular Lane Chips ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Type destination e.g. 'Hubli', 'Pune', 'Bangalore' to quote instantly..."
            className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl font-mono"
          />
        </div>

        {/* Popular Lane Quick Click Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {popularLanes.map(lane => {
            const isSelected = selectedLane?.id === lane.id;
            const badge = formatRateBadge(lane.min_rate, lane.max_rate);
            return (
              <button
                key={lane.id}
                type="button"
                onClick={() => selectLaneDirect(lane)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{lane.origin.slice(0, 3)} ➔ {lane.destination.slice(0, 3)}</span>
                <span className="text-amber-400 font-black">₹{badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Match Quote Card ──────────────────────────────────────────── */}
      {selectedLane && (
        <div className="bg-slate-950 border border-amber-500/30 p-3 sm:p-4 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <span className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>{selectedLane.origin}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">{selectedLane.destination}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs">
                SPOT RATE: ₹{formatRateBadge(selectedLane.min_rate, selectedLane.max_rate)} (₹{(selectedLane.min_rate || 0).toLocaleString('en-IN')} - ₹{(selectedLane.max_rate || 0).toLocaleString('en-IN')})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                {selectedLane.vehicle_type}
              </span>
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {selectedLane.transit_hours}
              </span>
              {selectedLane.notes && (
                <span className="text-slate-400 text-[11px] border-l border-slate-800 pl-2">
                  {selectedLane.notes}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleCopyQuote(selectedLane)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-9 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy WhatsApp Quote'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenWhatsApp(selectedLane)}
              title="Open WhatsApp with Quote"
              className="border-slate-800 bg-slate-900 text-emerald-400 hover:text-white hover:bg-emerald-600 text-xs h-9 rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
