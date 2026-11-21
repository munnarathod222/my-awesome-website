import React, { useState } from 'react';
import { 
  Search, Truck, Calendar, MapPin, CheckCircle2, ShieldCheck, 
  ArrowRight, Sparkles, AlertCircle, Clock, DollarSign, Send, FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reservationClient } from '@/lib/reservationClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function AvailabilitySearchPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e) {
    try {
      currentUser = JSON.parse(localStorage.getItem('app_auth_user'));
    } catch (err) {}
  }
  const [searchParams, setSearchParams] = useState({
    origin: 'Hyderabad',
    destination: 'Hubli',
    loadingDatetime: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    vehicleCategory: '32FT SXL',
    cargoWeightTons: '14.0',
    specialRequirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking form state
  const [bookForm, setBookForm] = useState({
    customer_name: currentUser?.full_name || currentUser?.name || '',
    customer_phone: currentUser?.phone_number || '',
    customer_email: currentUser?.email || '',
    cargo_description: 'Industrial Equipment & FMCG Goods',
    special_requirements: '',
    indicative_freight: 28000
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.loadingDatetime) {
      toast.warning('Please specify origin, destination, and loading date.');
      return;
    }

    try {
      setLoading(true);
      const res = await reservationClient.searchAvailability({
        origin: searchParams.origin,
        destination: searchParams.destination,
        loadingDatetime: searchParams.loadingDatetime,
        vehicleCategory: searchParams.vehicleCategory,
        cargoWeightTons: parseFloat(searchParams.cargoWeightTons) || 14.0
      });
      setSearchResults(res);
      toast.success(`Found ${res.total_matches} candidate vehicles (${res.available_count} feasible).`);
    } catch (err) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookForm.customer_name || !bookForm.customer_phone) {
      toast.warning('Customer name and phone number are required.');
      return;
    }

    try {
      const res = await reservationClient.createReservation({
        ...bookForm,
        truck_number: selectedMatch?.truck_number || '',
        truck_id: selectedMatch?.truck_id || '',
        vehicle_category: selectedMatch?.vehicle_category || searchParams.vehicleCategory,
        origin: searchParams.origin,
        destination: searchParams.destination,
        loading_datetime: searchParams.loadingDatetime,
        cargo_weight_tons: parseFloat(searchParams.cargoWeightTons) || 14.0,
        reservation_type: selectedMatch?.booking_mode === 'Instant Confirmed' ? 'Confirmed' : 'Provisional',
        status: selectedMatch?.booking_mode === 'Instant Confirmed' ? 'Confirmed' : 'Pending',
        match_score: selectedMatch?.match_score || 90,
        match_reasons: selectedMatch?.match_reasons || [],
        created_by: currentUser?.full_name || currentUser?.name || 'Customer'
      });

      toast.success(`Booking Confirmed! Unique Reference: ${res.reservation?.booking_number}`);
      setIsBookModalOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      toast.error(err.message || 'Booking submission failed');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Module 3 & 5: Search & Intelligent Availability Matcher
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            10-Point Operational Feasibility Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
          <Search className="w-7 h-7 text-blue-400" />
          Customer Truck Booking & Availability Search
        </h1>
        <p className="text-sm text-slate-400">
          Search future truck availability, evaluate deadhead distances, review match scores, and lock reservations.
        </p>
      </div>

      {/* ── Search Form Card ────────────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-5 shadow-2xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Hub / City
              </label>
              <Input 
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                placeholder="e.g. Hyderabad (Patancheru)"
                className="bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Destination Drop Point
              </label>
              <Input 
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                placeholder="e.g. Hubli / Belgaum"
                className="bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Required Loading Date & Time
              </label>
              <Input 
                type="datetime-local"
                value={searchParams.loadingDatetime}
                onChange={(e) => setSearchParams({ ...searchParams, loadingDatetime: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> Vehicle Category
              </label>
              <select
                value={searchParams.vehicleCategory}
                onChange={(e) => setSearchParams({ ...searchParams, vehicleCategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 text-white font-semibold text-xs h-10"
              >
                <option value="32FT SXL">32FT Single Axle (SXL) — 14.5 MT</option>
                <option value="32FT MXL">32FT Multi-Axle (MXL) — 18.5 MT</option>
                <option value="20FT Container">20FT Container — 9.0 MT</option>
                <option value="24FT Container">24FT Container — 11.0 MT</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Payload: <strong className="text-white">14.0 Metric Tons (FTL)</strong></span>
              <span>•</span>
              <span>Buffer SLA: <strong className="text-emerald-400">4 Hours Turnaround</strong></span>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-blue-500/20"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Evaluating Fleet Availabilities...' : 'Find Matching Trucks'}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Search Results List ─────────────────────────────────────── */}
      {searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Available Truck Matches ({searchResults.total_matches} Evaluated)
            </h2>
            <span className="text-xs text-slate-400">
              Ranked by Feasibility & Deadhead Proximity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.results.map((match, idx) => (
              <Card 
                key={match.truck_id || match.truck_number || idx}
                className={`p-5 border transition-all ${
                  match.is_feasible 
                    ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50' 
                    : 'bg-slate-950/60 border-slate-850 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">{match.truck_number}</span>
                      <Badge className="bg-slate-800 text-slate-300 text-[10px] border-slate-700">
                        {match.vehicle_category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Capacity: <strong className="text-white">{match.capacity_tons} MT</strong> | Deadhead: <strong className="text-emerald-400">~{match.deadhead_km} km</strong>
                    </p>
                  </div>

                  {/* Match Score Gauge */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block text-[10px] font-semibold">Match Score</span>
                    <span className={`text-xl font-black ${match.match_score >= 80 ? 'text-emerald-400' : match.match_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {match.match_score}%
                    </span>
                  </div>
                </div>

                {/* Match Reasons Pill Box */}
                <div className="my-3.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  {match.match_reasons?.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                  {match.disqualifications?.map((disq, i) => (
                    <div key={i} className="flex items-center gap-2 text-rose-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{disq}</span>
                    </div>
                  ))}
                </div>

                {/* Card Footer with Booking Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <Badge className={match.booking_mode === 'Instant Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                    {match.booking_mode}
                  </Badge>

                  <Button
                    size="sm"
                    disabled={!match.is_feasible}
                    onClick={() => {
                      setSelectedMatch(match);
                      setIsBookModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Select & Reserve →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Booking Confirmation Modal ──────────────────────────────── */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Confirm Truck Reservation ({selectedMatch?.truck_number})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConfirmBooking} className="space-y-3.5 py-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-[11px]">Selected Corridor</p>
                <p className="font-extrabold text-white text-sm">{searchParams.origin} → {searchParams.destination}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[11px]">Indicative Freight</p>
                <p className="font-extrabold text-emerald-400 text-sm">₹{bookForm.indicative_freight.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Customer / Company Name</label>
                <Input 
                  value={bookForm.customer_name}
                  onChange={(e) => setBookForm({ ...bookForm, customer_name: e.target.value })}
                  placeholder="e.g. Acme Logistics Pvt Ltd"
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Contact Phone Number</label>
                <Input 
                  value={bookForm.customer_phone}
                  onChange={(e) => setBookForm({ ...bookForm, customer_phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Cargo Description</label>
              <Input 
                value={bookForm.cargo_description}
                onChange={(e) => setBookForm({ ...bookForm, cargo_description: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-300 text-[11px]">
              🔒 <strong>Server-Side Concurrency Lock Active:</strong> Truck schedule will be immediately reserved upon confirmation.
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBookModalOpen(false)} className="border-slate-800">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Confirm & Lock Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
