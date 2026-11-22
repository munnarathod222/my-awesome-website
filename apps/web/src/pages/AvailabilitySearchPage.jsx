import React, { useState, useEffect } from 'react';
import { 
  Search, Truck, Calendar, MapPin, CheckCircle2, ShieldCheck, 
  ArrowRight, Sparkles, AlertCircle, Clock, DollarSign, Send, FileText,
  TrendingDown, Check, Zap, Lock, RefreshCw
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

  // Flexible Date Matrix state (Module 4)
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [flexibleMatrix, setFlexibleMatrix] = useState([]);
  const [suggestedDateInfo, setSuggestedDateInfo] = useState(null);

  // Booking form state
  const [bookForm, setBookForm] = useState({
    customer_name: currentUser?.full_name || currentUser?.name || '',
    customer_phone: currentUser?.phone_number || '',
    customer_email: currentUser?.email || '',
    cargo_description: 'Industrial Heavy Equipment & FMCG Goods',
    special_requirements: '',
    indicative_freight: 28000
  });

  // Fetch flexible date matrix whenever origin/destination/loadingDatetime changes
  const loadFlexibleMatrix = async (baseDate) => {
    try {
      setMatrixLoading(true);
      const res = await reservationClient.getFlexibleMatrix(
        searchParams.origin,
        searchParams.destination,
        baseDate || searchParams.loadingDatetime.slice(0, 10),
        6
      );
      setFlexibleMatrix(res.matrix || []);
      setSuggestedDateInfo(res);
    } catch (err) {
      console.warn('Matrix error:', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  useEffect(() => {
    loadFlexibleMatrix();
    executeSearch();
  }, []);

  const executeSearch = async (targetDateStr = null) => {
    try {
      setLoading(true);
      const reqDate = targetDateStr || searchParams.loadingDatetime;
      const res = await reservationClient.searchAvailability({
        origin: searchParams.origin,
        destination: searchParams.destination,
        loadingDatetime: reqDate,
        vehicleCategory: searchParams.vehicleCategory,
        cargoWeightTons: parseFloat(searchParams.cargoWeightTons) || 14.0
      });
      setSearchResults(res);
    } catch (err) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.loadingDatetime) {
      toast.warning('Please specify origin, destination, and loading date.');
      return;
    }
    loadFlexibleMatrix(searchParams.loadingDatetime.slice(0, 10));
    executeSearch();
  };

  const handleSelectFlexibleDate = (dayItem) => {
    const newDateTime = `${dayItem.date}T18:00`;
    setSearchParams(prev => ({
      ...prev,
      loadingDatetime: newDateTime
    }));
    setBookForm(prev => ({
      ...prev,
      indicative_freight: dayItem.rate
    }));
    executeSearch(newDateTime);
    toast.info(`Selected ${dayItem.day_label} (Fare: ₹${dayItem.rate.toLocaleString('en-IN')})`);
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
        reservation_type: selectedMatch?.booking_mode === 'Instant Confirmed' ? 'Confirmed' : 'Booking Request',
        status: selectedMatch?.truck_number ? 'Confirmed' : 'Pending',
        match_score: selectedMatch?.match_score || 90,
        match_reasons: selectedMatch?.match_reasons || [],
        created_by: currentUser?.full_name || currentUser?.name || 'Customer'
      });

      const truckAssignedMsg = selectedMatch?.truck_number 
        ? ` Truck ${selectedMatch.truck_number} schedule is now LOCKED as BUSY.` 
        : '';

      toast.success(`Booking Confirmed! Ref: ${res.reservation?.booking_number}.${truckAssignedMsg}`);
      setIsBookModalOpen(false);
      setSelectedMatch(null);
      loadFlexibleMatrix();
      executeSearch();
    } catch (err) {
      toast.error(err.message || 'Booking submission failed');
    }
  };

  const currentDateOnly = searchParams.loadingDatetime.slice(0, 10);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Module 3 & 4: Availability Engine & Flexible Date Booking
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              Dynamic Rate Optimizer & Instant Busy Lock
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Search className="w-7 h-7 text-blue-400" />
            Flexible Date Truck Booking & Availability
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Compare multi-date truck availability, view recommended economic backhaul dates, and instantly lock assigned vehicles as busy.
          </p>
        </div>
      </div>

      {/* ── Search Form Card ────────────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-5 shadow-2xl rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Hub / City
              </label>
              <Input 
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                placeholder="e.g. Hyderabad"
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
                placeholder="e.g. Hubli"
                className="bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Target Loading Date & Time
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
                <option value="24FT Container">24FT Container — 8.5 MT</option>
                <option value="40FT High Cube">40FT High Cube — 28.0 MT</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Payload: <strong className="text-white">14.0 MT (Full Truck Load)</strong></span>
              <span>•</span>
              <span>Lane: <strong className="text-emerald-400">{searchParams.origin} → {searchParams.destination}</strong></span>
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

      {/* ── Module 4: Flexible Date Booking & Economic Suggestion Strip ─ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">
              Flexible Date Matrix (Economic Fare & Availability Suggestion)
            </h2>
          </div>
          {suggestedDateInfo?.savings_amount > 0 && (
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Save up to ₹{suggestedDateInfo.savings_amount.toLocaleString('en-IN')} on backhaul dates!
            </span>
          )}
        </div>

        {/* Multi-Date Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {flexibleMatrix.map((item, idx) => {
            const isSelected = item.date === currentDateOnly;
            const isEconomical = item.is_economical;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectFlexibleDate(item)}
                className={`relative text-left p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                    : isEconomical
                    ? 'bg-emerald-950/40 border-emerald-500/60 hover:border-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Economical Badge */}
                {isEconomical && (
                  <div className="absolute -top-2.5 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    BEST FARE
                  </div>
                )}

                <div>
                  <div className="font-extrabold text-white text-sm">{item.day_label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.available_trucks > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>{item.available_trucks} {item.available_trucks === 1 ? 'Truck' : 'Trucks'} Free</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-black text-white">₹{item.rate.toLocaleString('en-IN')}</span>
                    {item.discount_pct > 0 && (
                      <span className="text-[10px] text-emerald-400 ml-1.5 font-bold">-{item.discount_pct}%</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search Results List ─────────────────────────────────────── */}
      {searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Available Candidate Vehicles for {new Date(searchParams.loadingDatetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Found {searchResults.total_matches} candidate vehicles ({searchResults.available_count} feasible)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.results?.map((match, idx) => {
              const isInstant = match.booking_mode === 'Instant Confirmed';

              return (
                <Card 
                  key={idx} 
                  className="bg-slate-900 border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="font-mono font-black text-white text-base bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {match.truck_number}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-semibold">
                          {match.vehicle_category} • {match.capacity_tons} MT Capacity
                        </div>
                      </div>

                      <Badge className={`text-[10px] font-black ${
                        isInstant 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {match.booking_mode}
                      </Badge>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current/Predicted Hub:</span>
                        <span className="text-white font-bold">{match.predicted_location || 'Hyderabad Hub'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deadhead Distance:</span>
                        <span className="text-emerald-400 font-bold">{match.deadhead_km || 15} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Match Feasibility Score:</span>
                        <span className="text-blue-400 font-black">{match.match_score || 95}%</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      {(match.match_reasons || []).slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimated Freight</span>
                      <span className="text-lg font-black text-white">
                        ₹{parseFloat(bookForm.indicative_freight || 28000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedMatch(match);
                        setIsBookModalOpen(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Reserve & Lock
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Reservation & Lock Schedule ──────────────── */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-white">
              <Lock className="w-5 h-5 text-emerald-400" />
              Confirm Reservation & Lock Truck Schedule
            </DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-medium">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-white text-base">{selectedMatch.truck_number}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Schedule Lock Armed
                  </Badge>
                </div>
                <div className="text-slate-300">
                  Route: <strong className="text-white">{searchParams.origin} → {searchParams.destination}</strong>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Loading: <strong className="text-white">{new Date(searchParams.loadingDatetime).toLocaleString()}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Customer / Shipper Name *</label>
                  <Input
                    required
                    value={bookForm.customer_name}
                    onChange={e => setBookForm({ ...bookForm, customer_name: e.target.value })}
                    placeholder="e.g. Vinod Rathod"
                    className="bg-slate-900 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Contact Phone Number *</label>
                  <Input
                    required
                    value={bookForm.customer_phone}
                    onChange={e => setBookForm({ ...bookForm, customer_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="bg-slate-900 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Customer Email</label>
                  <Input
                    type="email"
                    value={bookForm.customer_email}
                    onChange={e => setBookForm({ ...bookForm, customer_email: e.target.value })}
                    placeholder="operations@company.com"
                    className="bg-slate-900 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Agreed Indicative Freight (₹)</label>
                  <Input
                    type="number"
                    value={bookForm.indicative_freight}
                    onChange={e => setBookForm({ ...bookForm, indicative_freight: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-900 border-slate-800 text-white font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cargo Description</label>
                <Input
                  value={bookForm.cargo_description}
                  onChange={e => setBookForm({ ...bookForm, cargo_description: e.target.value })}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Confirming this reservation will atomically lock <strong>{selectedMatch.truck_number}</strong>'s schedule as <strong>BUSY</strong> in the Fleet Calendar, preventing any conflicting allocations.
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black">
                  Confirm & Lock Schedule
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
