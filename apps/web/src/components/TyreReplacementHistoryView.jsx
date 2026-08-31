import React, { useState, useMemo } from 'react';
import { 
  History, ShieldAlert, Award, Calendar, Truck, 
  MapPin, Eye, Image, FileText, Download, Filter, Search, ArrowRight, ExternalLink, Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TYRE_SLOTS } from './TyreFormModal.jsx';

export default function TyreReplacementHistoryView({
  replacedTyres = [],
  activeTyres = [],
  truck = null,
  onViewTyreDetails
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  // Filter replaced tyres
  const filteredHistory = useMemo(() => {
    return replacedTyres.filter(t => {
      const matchSearch = !searchTerm || (
        (t.tyre_brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.model_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchReason = reasonFilter === 'all' || (t.notes || '').includes(reasonFilter);

      return matchSearch && matchReason;
    });
  }, [replacedTyres, searchTerm, reasonFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalReplaced = replacedTyres.length;
    let totalKms = 0;
    let tornCount = 0;
    let wornCount = 0;

    replacedTyres.forEach(t => {
      totalKms += Number(t.current_lifecycle_kms || 0);
      const notes = (t.notes || '').toLowerCase();
      if (notes.includes('torn') || notes.includes('burst')) tornCount++;
      else if (notes.includes('worn')) wornCount++;
    });

    const avgLifespan = totalReplaced > 0 ? Math.round(totalKms / totalReplaced) : 0;
    const tornPct = totalReplaced > 0 ? Math.round((tornCount / totalReplaced) * 100) : 0;

    return {
      totalReplaced,
      avgLifespan,
      tornCount,
      tornPct
    };
  }, [replacedTyres]);

  return (
    <div className="space-y-6">
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tyres Changed</p>
                <h3 className="text-3xl font-black text-rose-400 mt-1 tabular-nums">
                  {stats.totalReplaced}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  On {truck ? truck.truck_number : 'Fleet'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Torn / Burst Incidents</p>
                <h3 className="text-3xl font-black text-amber-400 mt-1 tabular-nums">
                  {stats.tornCount} ({stats.tornPct}%)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Premature highway tyre damage
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <History className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Tyre Lifespan</p>
                <h3 className="text-3xl font-black text-purple-400 mt-1 tabular-nums">
                  {stats.avgLifespan > 0 ? `${stats.avgLifespan.toLocaleString('en-IN')} KM` : 'N/A'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kilometers before retirement
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Wheel Positions</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">
                  {activeTyres.length} Mounted
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Running on vehicle axles
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text"
              placeholder="Search serial no, brand, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl"
            />
          </div>

          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="h-9 w-44 text-xs bg-slate-950 border-slate-800 text-slate-300 rounded-xl">
              <SelectValue placeholder="All Reasons" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="all">All Replacement Reasons</SelectItem>
              <SelectItem value="Torn">Torn / Burst</SelectItem>
              <SelectItem value="Worn">Tread Worn Out</SelectItem>
              <SelectItem value="Sidewall">Sidewall Cut</SelectItem>
              <SelectItem value="Puncture">Puncture / Bead Damage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{filteredHistory.length}</strong> archived replacement records
        </span>
      </div>

      {/* Replaced Tyres Historical Cards / Table */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-800 p-12 text-center text-slate-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-bold text-slate-300">No Replaced Tyres Recorded</p>
            <p className="text-xs text-slate-400 mt-1">
              When a tyre gets damaged or torn and replaced, its old photos, specs, and lifespan are archived here.
            </p>
          </Card>
        ) : (
          filteredHistory.map((tyre) => {
            const hasImages = tyre.tyre_image && (Array.isArray(tyre.tyre_image) ? tyre.tyre_image.length > 0 : typeof tyre.tyre_image === 'string');
            const images = Array.isArray(tyre.tyre_image) ? tyre.tyre_image : (tyre.tyre_image ? [tyre.tyre_image] : []);
            
            return (
              <div 
                key={tyre.id} 
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-mono font-bold px-2.5 py-1">
                      REPLACED
                    </Badge>
                    <div>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        {tyre.tyre_brand} {tyre.model_no || ''} 
                        <span className="text-cyan-400 font-mono text-xs">({tyre.serial_number || 'No Serial'})</span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Archived: {tyre.updated ? tyre.updated.split(' ')[0] : (tyre.created ? tyre.created.split(' ')[0] : 'N/A')}</span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Lifespan Run</span>
                    <strong className="text-purple-400 font-bold">{(tyre.current_lifecycle_kms || 0).toLocaleString('en-IN')} KM</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Installed On</span>
                    <strong className="text-slate-300">{tyre.purchase_date ? tyre.purchase_date.split('T')[0] : 'N/A'}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 sm:col-span-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Replacement Reason &amp; Notes</span>
                    <strong className="text-amber-300 font-sans block truncate" title={tyre.notes}>
                      {tyre.notes || 'Replaced due to wear/damage'}
                    </strong>
                  </div>
                </div>

                {/* Damage & Archival Photos */}
                {images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Image className="w-3 h-3 text-cyan-400" /> Damage &amp; Old Tyre Photos ({images.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {images.map((img, idx) => {
                        const fileUrl = pb.files.getUrl(tyre, img);
                        return (
                          <div 
                            key={idx}
                            onClick={() => setPreviewImage(fileUrl)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700/80 cursor-pointer hover:border-cyan-500 shrink-0 group relative transition-all"
                          >
                            <img src={fileUrl} alt="Old Tyre Photo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-800">
            <img src={previewImage} alt="Enlarged Tyre" className="w-full h-full object-contain max-h-[80vh]" />
            <button 
              type="button" 
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-slate-900/80 text-white rounded-full p-2 hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
