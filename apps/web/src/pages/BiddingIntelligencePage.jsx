import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Calculator, PlusCircle, LayoutDashboard, Kanban,
  History, FileSpreadsheet, MapPin, Building2, Truck, DollarSign,
  BarChart3, Settings, ShieldCheck, AlertTriangle, ArrowRight,
  Share2, RefreshCw, Download, Upload, CheckCircle2, XCircle,
  HelpCircle, ChevronRight, Fuel, Clock, Target, Award,
  Sparkles, FileText, Calendar, Filter, Search, Phone, ExternalLink,
  ChevronDown, Layers, Zap, Info, Eye, Check, X, Edit3, Trash2, ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCompanyProfile } from '@/lib/companyProfile.js';
import {
  calculateBidRecommendation,
  calculateBidDecisionScore
} from '@/lib/biddingEngine.js';
import {
  calculateTripCost,
  calculateSensitivityMatrix,
  DEFAULT_DIESEL_PRICE,
  DEFAULT_VEHICLE_COST_PROFILES,
  getVehicleCostProfile
} from '@/lib/tripCostEngine.js';
import {
  loadBids,
  saveBid,
  deleteBid,
  loadContracts,
  saveContract,
  loadBiddingSettings,
  saveBiddingSettings,
  getBiddingCsvTemplate,
  parseAndValidateBiddingCsv,
  exportBidsToCsv,
  subscribeBids,
  unsubscribeBids
} from '@/lib/biddingIntelligenceStorage.js';
import BiddingSpreadsheetGrid from '@/components/BiddingSpreadsheetGrid.jsx';
import BiddingAnalyticsDashboard from '@/components/BiddingAnalyticsDashboard.jsx';
import AddBidModal from '@/components/AddBidModal.jsx';

// Common Corridors for instant 1-click select
const POPULAR_CORRIDORS = [
  { origin: 'Hyderabad', dest: 'Bengaluru', distance: 590, toll: 1880 },
  { origin: 'Hyderabad', dest: 'Chennai', distance: 630, toll: 1950 },
  { origin: 'Hyderabad', dest: 'Mumbai', distance: 710, toll: 2400 },
  { origin: 'Hyderabad', dest: 'Pune', distance: 560, toll: 1750 },
  { origin: 'Bengaluru', dest: 'Hyderabad', distance: 590, toll: 1880 },
  { origin: 'Bengaluru', dest: 'Chennai', distance: 350, toll: 1100 },
  { origin: 'Secunderabad', dest: 'Visakhapatnam', distance: 620, toll: 1900 },
  { origin: 'Hyderabad', dest: 'Vijayawada', distance: 275, toll: 850 }
];

const TRUCK_TYPES = ['20FT SXL', '24FT SXL', '32FT SXL', '32FT MXL', '14FT', '17FT'];

const PIPELINE_STAGES = [
  { key: 'Opportunity', label: 'New Opportunity', color: 'border-slate-700 bg-slate-900/60 text-slate-300' },
  { key: 'Evaluating', label: 'Evaluating', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
  { key: 'Bid Prepared', label: 'Bid Prepared', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  { key: 'Bid Submitted', label: 'Bid Submitted', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { key: 'Negotiation', label: 'Negotiation', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { key: 'Won', label: 'Won (Active Contract)', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { key: 'Lost', label: 'Lost', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' }
];

export default function BiddingIntelligencePage() {
  const { currentUser } = useAuth();
  const company = useCompanyProfile() || {};

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState('grid'); // grid, dashboard, calculator, new-bid, pipeline, history, contracts, routes, parties, trucks, profitability, analytics, reports, settings

  // Spreadsheet Grid States (Exact match to reference spreadsheet)
  const [activeClientTab, setActiveClientTab] = useState('Delhivery');
  const [activeTypeTab, setActiveTypeTab] = useState('Contract'); // 'Contract' | 'Spot'
  const [isAddBidModalOpen, setIsAddBidModalOpen] = useState(false);

  // Core Data States
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [trucksList, setTrucksList] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [settings, setSettings] = useState(loadBiddingSettings());
  const [loading, setLoading] = useState(true);

  // Spreadsheet Row Update Handler
  const handleUpdateBid = async (updatedBid) => {
    try {
      const saved = await saveBid(updatedBid);
      setBids(prev => prev.map(b => (b.id === updatedBid.id || (saved && b.id === saved.id)) ? saved : b));
    } catch (err) {
      toast.error('Failed to update bid');
    }
  };

  // Add Bid Handler
  const handleAddBid = async (newBid) => {
    try {
      const saved = await saveBid(newBid);
      setBids(prev => {
        const filtered = prev.filter(b => b.id !== saved.id && b.id !== newBid.id);
        return [saved, ...filtered];
      });
    } catch (err) {
      toast.error('Failed to save new bid');
    }
  };

  // Delete Bid Handler
  const handleDeleteBid = async (id) => {
    try {
      await deleteBid(id);
      setBids(prev => prev.filter(b => b.id !== id));
      toast.success('Bid deleted');
    } catch (err) {
      toast.error('Failed to delete bid');
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await deleteBid(id);
      }
      setBids(prev => prev.filter(b => !ids.includes(b.id)));
      toast.success(`${ids.length} bids deleted`);
    } catch (err) {
      toast.error('Failed to delete selected bids');
    }
  };

  // Bulk Status Update Handler
  const handleBulkUpdateStatus = async (ids, newStatus) => {
    try {
      for (const id of ids) {
        const target = bids.find(b => b.id === id);
        if (target) {
          await saveBid({ ...target, status: newStatus });
        }
      }
      setBids(prev => prev.map(b => ids.includes(b.id) ? { ...b, status: newStatus } : b));
      toast.success(`${ids.length} bids marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Quick Quote / Calculator Form State
  const [quoteForm, setQuoteForm] = useState({
    bidType: 'Spot', // 'Spot' (One Load) or 'Contract' (Dedicated / Monthly)
    monthlyTrips: 15,
    dedicatedTrucks: 1,
    contractMonths: 12,
    counterparty: 'Delhivery',
    role: 'Broker',
    underlyingClient: 'Amazon',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    distanceKm: 590,
    truckType: '20FT SXL',
    payloadTons: 6,
    manualToll: '',
    returnLoadAvailable: false,
    returnFreight: 12000,
    quotedAmount: 0
  });

  // New Bid Wizard Form State
  const [newBidForm, setNewBidForm] = useState({
    counterparty: '',
    role: 'Broker',
    underlyingClient: '',
    contractRef: '',
    source: 'Delhivery',
    origin: 'Hyderabad',
    destination: 'Bengaluru',
    distanceKm: 590,
    pickupLocation: '',
    deliveryLocation: '',
    truckType: '20FT SXL',
    assignedTruck: '',
    payloadTons: 6,
    bodyType: 'Container Closed',
    vehiclesRequired: 1,
    loadType: 'E-Commerce Parcel',
    commodity: 'General Cargo',
    tripsCount: 1,
    frequency: 'Contract',
    bidOpeningDate: new Date().toISOString().split('T')[0],
    bidClosingDate: '',
    submissionDate: '',
    quotedAmount: '',
    rateType: 'Per trip',
    gstApplicable: true,
    tollIncluded: true,
    loadingIncluded: false,
    unloadingIncluded: false,
    returnLoadAvailable: false,
    returnFreight: 0,
    status: 'Opportunity',
    notes: ''
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'Spot', 'Contract'

  // Lost Bid Feedback & Competitive Intelligence Modal State
  const [lostBidModal, setLostBidModal] = useState({
    isOpen: false,
    bid: null,
    actualWinningRate: '',
    lostReason: 'Price too high / Competitor undercut',
    competitorName: '',
    feedbackNotes: ''
  });
  const [filterResult, setFilterResult] = useState('ALL');

  // Load all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [loadedBids, loadedContracts] = await Promise.all([
        loadBids(),
        loadContracts()
      ]);
      setBids(loadedBids);
      setContracts(loadedContracts);

      // Load supporting records
      try {
        const trk = await pb.collection('trucks').getFullList({ $autoCancel: false });
        setTrucksList(trk);
      } catch (e) {}

      try {
        const rts = await pb.collection('routes').getFullList({ $autoCancel: false });
        setRoutesList(rts);
      } catch (e) {}

      try {
        const cls = await pb.collection('clients').getFullList({ $autoCancel: false });
        setClientsList(cls);
      } catch (e) {}

    } catch (err) {
      console.error('Failed to load bidding intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time synchronization across all devices & browser tabs
    const unsubscribe = subscribeBids(async () => {
      try {
        const updated = await loadBids();
        setBids(updated);
      } catch (err) {
        console.warn('Realtime update fetch error:', err);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      else unsubscribeBids();
    };
  }, []);

  // Sync quick corridor selection
  const handleSelectCorridor = (corr) => {
    setQuoteForm(prev => ({
      ...prev,
      origin: corr.origin,
      destination: corr.dest,
      distanceKm: corr.distance,
      manualToll: corr.toll
    }));
  };

  // Instant Quote Calculation Memo
  const tripCostCalculation = useMemo(() => {
    return calculateTripCost({
      distanceKm: quoteForm.distanceKm,
      truckType: quoteForm.truckType,
      dieselPrice: settings.currentDieselPrice,
      manualToll: quoteForm.manualToll ? Number(quoteForm.manualToll) : null,
      returnLoadAvailable: quoteForm.returnLoadAvailable,
      returnLoadFreight: quoteForm.returnFreight
    });
  }, [quoteForm, settings]);

  const quoteRecommendation = useMemo(() => {
    return calculateBidRecommendation({
      historicalBids: bids,
      bidType: quoteForm.bidType,
      monthlyTrips: quoteForm.bidType === 'Contract' ? Number(quoteForm.monthlyTrips || 15) : 1,
      dedicatedTrucks: Number(quoteForm.dedicatedTrucks || 1),
      contractMonths: Number(quoteForm.contractMonths || 12),
      counterparty: quoteForm.counterparty,
      counterpartyRole: quoteForm.role,
      underlyingClient: quoteForm.underlyingClient,
      origin: quoteForm.origin,
      destination: quoteForm.destination,
      truckType: quoteForm.truckType,
      payloadTons: Number(quoteForm.payloadTons || 6),
      distanceKm: Number(quoteForm.distanceKm || 0),
      minProfitableBid: tripCostCalculation.minProfitableBid,
      tripCost: tripCostCalculation.totalCost
    });
  }, [bids, quoteForm, tripCostCalculation]);

  const decisionScore = useMemo(() => {
    const effectiveQuote = quoteForm.quotedAmount > 0 ? quoteForm.quotedAmount : quoteRecommendation.recommended;
    return calculateBidDecisionScore({
      quotedRate: effectiveQuote,
      recommendedRate: quoteRecommendation.recommended,
      tripCost: tripCostCalculation.totalCost,
      returnLoadAvailable: quoteForm.returnLoadAvailable,
      confidence: quoteRecommendation.confidence
    });
  }, [quoteForm, quoteRecommendation, tripCostCalculation]);

  // Sensitivity Analysis
  const sensitivityAnalysis = useMemo(() => {
    const effectiveQuote = quoteForm.quotedAmount > 0 ? quoteForm.quotedAmount : quoteRecommendation.recommended;
    return calculateSensitivityMatrix({
      distanceKm: quoteForm.distanceKm,
      truckType: quoteForm.truckType,
      dieselPrice: settings.currentDieselPrice,
      quotedRate: effectiveQuote
    });
  }, [quoteForm, quoteRecommendation, settings]);

  // Filtered Bids
  const filteredBids = useMemo(() => {
    return bids.filter(b => {
      const matchSearch = searchTerm === '' || 
        `${b.counterparty} ${b.underlying_client} ${b.origin} ${b.destination} ${b.truck_type} ${b.notes}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === 'ALL' || b.role === filterRole;
      const matchResult = filterResult === 'ALL' || b.result === filterResult || b.status === filterResult;
      
      const isContract = b.bid_type === 'Contract' || Number(b.trips_count) > 1 || Number(b.monthly_trips) > 1;
      const matchType = filterType === 'ALL' || (filterType === 'Contract' ? isContract : !isContract);

      return matchSearch && matchRole && matchResult && matchType;
    });
  }, [bids, searchTerm, filterRole, filterResult, filterType]);

  // Dashboard Aggregates
  const dashboardStats = useMemo(() => {
    const total = bids.length;
    const won = bids.filter(b => b.result === 'Won' || b.status === 'Won').length;
    const lost = bids.filter(b => b.result === 'Lost' || b.status === 'Lost').length;
    const pending = bids.filter(b => b.status === 'Opportunity' || b.status === 'Bid Submitted' || b.status === 'Evaluating' || b.status === 'Negotiation').length;
    const winRate = total > 0 ? Math.round((won / Math.max(1, won + lost)) * 100) : 0;

    let totalRevenue = 0;
    bids.forEach(b => {
      if (b.result === 'Won' || b.status === 'Won') {
        const rate = Number(b.quoted_amount || 0);
        const trips = Number(b.trips_count || 1);
        totalRevenue += (rate * trips);
      }
    });

    return { total, won, lost, pending, winRate, totalRevenue };
  }, [bids]);

  // 1-Click Save Quick Quote as Opportunity
  const handleSaveQuickQuote = async (targetStatus = 'Opportunity') => {
    try {
      const rate = quoteForm.quotedAmount > 0 ? quoteForm.quotedAmount : quoteRecommendation.recommended;
      const newBid = {
        counterparty: quoteForm.counterparty || 'Commercial Client',
        role: quoteForm.role,
        underlying_client: quoteForm.underlyingClient,
        origin: quoteForm.origin,
        destination: quoteForm.destination,
        distance_km: quoteForm.distanceKm,
        truck_type: quoteForm.truckType,
        payload_tons: quoteForm.payloadTons,
        quoted_amount: rate,
        actual_winning_rate: targetStatus === 'Won' ? rate : 0,
        status: targetStatus,
        result: targetStatus === 'Won' ? 'Won' : targetStatus === 'Lost' ? 'Lost' : 'Pending',
        bid_date: new Date().toISOString().split('T')[0],
        notes: `Instant Quote via Bidding Intelligence (Estimated Trip Cost: ₹${tripCostCalculation.totalCost})`
      };

      const saved = await saveBid(newBid);

      // If Won, auto convert to contract
      if (targetStatus === 'Won') {
        await saveContract({
          contract_ref: `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
          counterparty: saved.counterparty,
          role: saved.role,
          underlying_client: saved.underlying_client,
          origin: saved.origin,
          destination: saved.destination,
          truck_type: saved.truck_type,
          rate: saved.quoted_amount,
          monthly_trips: 15,
          contract_start: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
        toast.success('🎉 Bid saved as WON & Active Contract created automatically!');
      } else {
        toast.success(`Bid saved to pipeline as "${targetStatus}"`);
      }

      fetchData();
    } catch (e) {
      toast.error('Failed to save bid: ' + e.message);
    }
  };

  // 1-Click Status Transition in Pipeline
  const handleUpdateBidStatus = async (bid, newStatus) => {
    if (newStatus === 'Lost') {
      setLostBidModal({
        isOpen: true,
        bid,
        actualWinningRate: bid.actual_winning_rate || '',
        lostReason: bid.lost_reason || 'Price too high / Competitor undercut',
        competitorName: bid.competitor_name || '',
        feedbackNotes: bid.notes || ''
      });
      return;
    }

    try {
      const updated = {
        ...bid,
        status: newStatus,
        result: newStatus === 'Won' ? 'Won' : bid.result
      };

      if (newStatus === 'Won' && (!bid.actual_winning_rate || bid.actual_winning_rate <= 0)) {
        updated.actual_winning_rate = bid.quoted_amount;
      }

      await saveBid(updated);

      if (newStatus === 'Won') {
        await saveContract({
          bid_id: bid.id,
          contract_ref: `CTR-${bid.id.slice(-4).toUpperCase()}`,
          counterparty: bid.counterparty,
          role: bid.role,
          underlying_client: bid.underlying_client,
          origin: bid.origin,
          destination: bid.destination,
          truck_type: bid.truck_type,
          rate: bid.quoted_amount,
          monthly_trips: bid.trips_count || 12,
          contract_start: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
        toast.success('🎉 Bid Won! Automatically converted to Active Contract');
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }

      fetchData();
    } catch (e) {
      toast.error('Could not update status');
    }
  };

  // Save Lost Bid Rate Intelligence
  const handleSaveLostBidIntelligence = async () => {
    if (!lostBidModal.bid) return;
    try {
      const winRate = Number(lostBidModal.actualWinningRate) || 0;
      const updated = {
        ...lostBidModal.bid,
        status: 'Lost',
        result: 'Lost',
        actual_winning_rate: winRate,
        lost_reason: lostBidModal.lostReason,
        competitor_name: lostBidModal.competitorName,
        notes: lostBidModal.feedbackNotes || lostBidModal.bid.notes
      };

      await saveBid(updated);
      toast.success(
        winRate > 0
          ? `🎯 Recorded competitor winning rate: ₹${winRate.toLocaleString('en-IN')}. Next time you quote for this corridor, AI will use this ceiling rate!`
          : 'Opportunity marked as Lost.'
      );
      setLostBidModal({ isOpen: false, bid: null, actualWinningRate: '', lostReason: '', competitorName: '', feedbackNotes: '' });
      fetchData();
    } catch (e) {
      toast.error('Failed to update lost bid intelligence: ' + e.message);
    }
  };

  // 1-Click Share Quote via WhatsApp
  const handleShareQuoteWhatsApp = () => {
    const rate = quoteForm.quotedAmount > 0 ? quoteForm.quotedAmount : quoteRecommendation.recommended;
    const compName = company.company_name || 'Jai Bhavani Cargo';
    const text = `🚛 *${compName.toUpperCase()} - COMMERCIAL RATE QUOTATION*

📍 *Route:* ${quoteForm.origin} ➔ ${quoteForm.destination} (~${quoteForm.distanceKm} KM)
🚚 *Vehicle Type:* ${quoteForm.truckType} (Payload: ${quoteForm.payloadTons}T)
🏢 *Client / Broker:* ${quoteForm.counterparty} ${quoteForm.underlyingClient ? `(For: ${quoteForm.underlyingClient})` : ''}

💰 *Quoted Rate:* ₹${rate.toLocaleString('en-IN')} (All-inclusive linehaul)
⏱️ *Transit SLA:* Express Container Linehaul
🛡️ *Assurance:* 100% GPS Live Tracked Fleet, Verified Drivers & Instant PODs

Thank you for partnering with *${compName}*!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // CSV Import Trigger
  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvString = event.target?.result;
      if (typeof csvString !== 'string') return;

      const { valid, invalid, errors } = parseAndValidateBiddingCsv(csvString);
      if (errors.length > 0) {
        toast.error(errors.join('. '));
        return;
      }

      if (valid.length === 0) {
        toast.error('No valid records found in CSV');
        return;
      }

      setLoading(true);
      try {
        for (const item of valid) {
          await saveBid(item);
        }
        toast.success(`✅ Successfully imported ${valid.length} historical bids!`);
        if (invalid.length > 0) {
          toast.warning(`Skipped ${invalid.length} invalid rows.`);
        }
        fetchData();
      } catch (err) {
        toast.error('Failed to import CSV records');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      <Helmet>
        <title>Bidding Intelligence & Contract Tracking | {company.company_name || 'Jai Bhavani Cargo'}</title>
      </Helmet>

      {/* Main Header Strip */}
      <div className="bg-slate-900 border-b border-slate-800 pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono font-bold">
                  BIDDING INTELLIGENCE SYSTEM
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-xs font-mono font-bold">
                  JAI BHAVANI CARGO
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" /> Bidding Intelligence &amp; Contract Tracking
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Smart 30-second rate quoting, automated trip cost profitability, visual pipeline tracking, and won contract lifecycle management.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setLostBidModal({
                  isOpen: true,
                  bid: {
                    id: '',
                    origin: quoteForm.origin || 'Hyderabad',
                    destination: quoteForm.destination || 'Bengaluru',
                    distance_km: quoteForm.distanceKm || 590,
                    truck_type: quoteForm.truckType || '20FT SXL',
                    payload_tons: quoteForm.payloadTons || 6,
                    counterparty: quoteForm.counterparty || '',
                    role: quoteForm.role || 'Broker',
                    quoted_amount: 21500,
                  },
                  actualWinningRate: '',
                  lostReason: 'Price too high / Competitor undercut',
                  competitorName: '',
                  feedbackNotes: ''
                })}
                className="h-10 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-rose-950"
              >
                <PlusCircle className="w-4 h-4" /> ➕ Enter Lost / Past Bid
              </Button>
              <Button
                onClick={() => setActiveTab('calculator')}
                className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-emerald-950"
              >
                <Calculator className="w-4 h-4" /> 30-Sec Quote
              </Button>
              <Button
                onClick={() => setIsAddBidModalOpen(true)}
                variant="outline"
                className="h-10 rounded-xl border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" /> New Bid Entry
              </Button>
              <Button
                onClick={fetchData}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Top Quick Navigation Bar (Horizontal Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-800/80">
            {[
              { id: 'grid', label: 'Spreadsheet Grid', icon: FileSpreadsheet, badge: 'Live Excel' },
              { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, badge: 'Insights' },
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'calculator', label: 'Quote Calculator', icon: Calculator, badge: 'Smart' },
              { id: 'new-bid', label: 'New Bid Form', icon: PlusCircle },
              { id: 'pipeline', label: 'Bid Pipeline', icon: Kanban, badge: `${dashboardStats.pending}` },
              { id: 'history', label: 'Bid History', icon: History, count: `${dashboardStats.total}` },
              { id: 'contracts', label: 'Contracts', icon: ShieldCheck, count: `${contracts.length}` },
              { id: 'routes', label: 'Route Intel', icon: MapPin },
              { id: 'parties', label: 'Clients & Brokers', icon: Building2 },
              { id: 'trucks', label: 'Trucks', icon: Truck },
              { id: 'profitability', label: 'Profit Engine', icon: DollarSign },
              { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
              { id: 'settings', label: 'Cost Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span className="text-[10px] text-slate-400 font-mono opacity-80">({tab.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 0. SPREADSHEET GRID TAB (Exact Google Sheet View matching reference) */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            <BiddingSpreadsheetGrid
              bids={bids}
              clients={clientsList}
              activeClientTab={activeClientTab}
              activeTypeTab={activeTypeTab}
              onSelectClientTab={setActiveClientTab}
              onSelectTypeTab={setActiveTypeTab}
              onUpdateBid={handleUpdateBid}
              onAddBid={handleAddBid}
              onDeleteBid={handleDeleteBid}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onRefresh={fetchData}
            />
          </div>
        )}

        {/* 0.5. ADVANCED ANALYTICS DASHBOARD TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-400" /> Bidding Analytics &amp; Competitive Intelligence
                </h2>
                <p className="text-xs text-slate-400">
                  Analyze win rates, lost bid price variance, truck type conversion, and client performance.
                </p>
              </div>
            </div>
            <BiddingAnalyticsDashboard 
              bids={bids}
              activeClientFilter={activeClientTab}
              activeTypeFilter={activeTypeTab}
            />
          </div>
        )}

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="rounded-2xl border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Win Rate</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400 font-mono">{dashboardStats.winRate}%</span>
                  <span className="text-[10px] text-slate-400">({dashboardStats.won} of {dashboardStats.won + dashboardStats.lost} closed)</span>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Active Pipeline</span>
                  <Kanban className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-400 font-mono">{dashboardStats.pending}</span>
                  <span className="text-[10px] text-slate-400">Opportunities</span>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Won Contract Value</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400 font-mono">₹{(dashboardStats.totalRevenue / 100000).toFixed(1)}L</span>
                  <span className="text-[10px] text-slate-400">Total Volume</span>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Active Contracts</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-400 font-mono">{contracts.length}</span>
                  <span className="text-[10px] text-slate-400">Tracked</span>
                </div>
              </Card>
            </div>

            {/* Quick 30-Sec Quote Workbench Box */}
            <Card className="rounded-3xl border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                    ⚡ 30-SECOND QUOTE RECOMMENDATION
                  </Badge>
                  <h2 className="text-lg sm:text-xl font-black text-white">Instant Quote &amp; Profitability Check</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveQuickQuote('Bid Submitted')}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save to Pipeline
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShareQuoteWhatsApp}
                    className="rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold text-xs h-9 gap-1 shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Spot vs Contract Mode Switcher */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 font-mono">Bidding Type:</span>
                  <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuoteForm(prev => ({ ...prev, bidType: 'Spot' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        quoteForm.bidType === 'Spot'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚚 Spot / Single Load
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteForm(prev => ({ ...prev, bidType: 'Contract' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        quoteForm.bidType === 'Contract'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📑 Dedicated Contract RFP
                    </button>
                  </div>
                </div>

                {quoteForm.bidType === 'Contract' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-mono text-slate-400">Monthly Trips:</label>
                      <Input
                        type="number"
                        value={quoteForm.monthlyTrips}
                        onChange={e => setQuoteForm(prev => ({ ...prev, monthlyTrips: Number(e.target.value) }))}
                        className="w-16 bg-slate-900 border-slate-700 text-white text-xs h-8 rounded-lg font-mono text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-mono text-slate-400">Trucks:</label>
                      <Input
                        type="number"
                        value={quoteForm.dedicatedTrucks}
                        onChange={e => setQuoteForm(prev => ({ ...prev, dedicatedTrucks: Number(e.target.value) }))}
                        className="w-14 bg-slate-900 border-slate-700 text-white text-xs h-8 rounded-lg font-mono text-center"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Select Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Origin</label>
                  <Input
                    value={quoteForm.origin}
                    onChange={e => setQuoteForm(prev => ({ ...prev, origin: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Destination</label>
                  <Input
                    value={quoteForm.destination}
                    onChange={e => setQuoteForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Truck Model</label>
                  <Select value={quoteForm.truckType} onValueChange={v => setQuoteForm(prev => ({ ...prev, truckType: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      {TRUCK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Counterparty (Broker/Client)</label>
                  <Input
                    value={quoteForm.counterparty}
                    onChange={e => setQuoteForm(prev => ({ ...prev, counterparty: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Quick Corridors Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-3">
                <span className="text-[10px] text-slate-500 font-mono">Popular Corridors:</span>
                {POPULAR_CORRIDORS.slice(0, 4).map(c => (
                  <button
                    key={`${c.origin}-${c.dest}`}
                    onClick={() => handleSelectCorridor(c)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                  >
                    {c.origin} ➔ {c.dest} ({c.distance}km)
                  </button>
                ))}
              </div>

              {/* Contract Monthly Projections Banner */}
              {quoteForm.bidType === 'Contract' && (
                <div className="mt-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-purple-300 font-bold border-b border-purple-500/20 pb-2">
                    <span>📑 Monthly Contract Volume Projections ({quoteRecommendation.monthlyTrips} Trips / Month)</span>
                    <span className="text-white">{quoteRecommendation.totalMonthlyKm.toLocaleString('en-IN')} Total KM/mo</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                    <div>Monthly Revenue: <strong className="text-white font-bold block text-sm">₹{quoteRecommendation.monthlyRevenue.toLocaleString('en-IN')}</strong></div>
                    <div>Monthly Cost: <strong className="text-slate-400 font-bold block text-sm">₹{(tripCostCalculation.totalCost * quoteRecommendation.monthlyTrips).toLocaleString('en-IN')}</strong></div>
                    <div>Monthly Net Profit: <strong className="text-emerald-400 font-bold block text-sm">₹{quoteRecommendation.monthlyProfit.toLocaleString('en-IN')}</strong></div>
                    <div>Annual Contract Value: <strong className="text-purple-300 font-bold block text-sm">₹{(quoteRecommendation.annualValue / 100000).toFixed(2)} Lakhs</strong></div>
                  </div>
                </div>
              )}

              {/* 3-Tier Strategies Result Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      🔥 Aggressive Bid
                    </span>
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[9px]">High Win %</Badge>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    ₹{quoteRecommendation.aggressive.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Est. Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.aggressive - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong> ({(((quoteRecommendation.aggressive - tripCostCalculation.totalCost) / Math.max(1, quoteRecommendation.aggressive)) * 100).toFixed(1)}%)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/40 space-y-1 relative overflow-hidden shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      ⚖️ Recommended (Balanced)
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-[9px]">Best Value</Badge>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ₹{quoteRecommendation.balanced.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Est. Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.balanced - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong> ({(((quoteRecommendation.balanced - tripCostCalculation.totalCost) / Math.max(1, quoteRecommendation.balanced)) * 100).toFixed(1)}%)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      💰 Profit-Max Bid
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[9px]">High Margin</Badge>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    ₹{quoteRecommendation.profitMax.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Est. Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.profitMax - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong> ({(((quoteRecommendation.profitMax - tripCostCalculation.totalCost) / Math.max(1, quoteRecommendation.profitMax)) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              {/* Lost Bid Competitive Intelligence Alert Banner */}
              {quoteRecommendation.lostBidIntelligence?.hasLostData && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <span>🎯 Competitive Intelligence: Previous Bid Lost at ₹{quoteRecommendation.lostBidIntelligence.competitorCeilingRate?.toLocaleString('en-IN')}</span>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px]">Ceiling Rate Active</Badge>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      {quoteRecommendation.lostBidIntelligence.mostRecentLostInfo?.lost_reason && (
                        <span>Reason: <strong className="text-white">{quoteRecommendation.lostBidIntelligence.mostRecentLostInfo.lost_reason}</strong> • </span>
                      )}
                      AI has automatically adjusted the 🔥 <strong>Aggressive Bid</strong> (₹{quoteRecommendation.aggressive.toLocaleString('en-IN')}) to undercut the competitor while safeguarding operating profit.
                    </p>
                  </div>
                </div>
              )}

              {/* Decision & Cost Summary Bar */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Trip Cost: <strong className="text-white">₹{tripCostCalculation.totalCost.toLocaleString('en-IN')}</strong></span>
                  <span>Cost/KM: <strong className="text-white">₹{tripCostCalculation.costPerKm}</strong></span>
                  <span>Min Profitable: <strong className="text-amber-400">₹{tripCostCalculation.minProfitableBid.toLocaleString('en-IN')}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Bid Decision:</span>
                  <Badge className={`font-bold px-2 py-0.5 border ${decisionScore.badgeColor}`}>
                    {decisionScore.verdict} ({decisionScore.score}/100)
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Recent Bids & Active Pipeline Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-white text-sm flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-emerald-400" /> Active Bids in Pipeline
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('pipeline')} className="text-xs text-emerald-400 h-8">
                    View Board <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                {bids.filter(b => b.status !== 'Won' && b.status !== 'Lost').slice(0, 4).map(b => (
                  <div key={b.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-xs">{b.origin} ➔ {b.destination}</p>
                      <p className="text-[10px] text-slate-400">{b.counterparty} ({b.role}) • {b.truck_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400 text-xs">₹{Number(b.quoted_amount).toLocaleString('en-IN')}</p>
                      <Badge className="text-[9px] bg-amber-500/10 text-amber-300 border-amber-500/30">{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Active Contracts
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('contracts')} className="text-xs text-purple-400 h-8">
                    All Contracts <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                {contracts.slice(0, 4).map(c => (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-xs">{c.origin} ➔ {c.destination}</p>
                      <p className="text-[10px] text-slate-400">{c.counterparty} • {c.truck_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-purple-400 text-xs">₹{Number(c.rate).toLocaleString('en-IN')}/trip</p>
                      <span className="text-[9px] text-emerald-400 font-bold block">{c.monthly_trips || 12} trips/mo</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* 2. QUOTE CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-400" /> Advanced Quote Recommendation Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluates historical winning benchmarks, exact/similar corridors, vehicle operating costs, and diesel price elasticity.
                </p>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Counterparty</label>
                  <Input
                    value={quoteForm.counterparty}
                    onChange={e => setQuoteForm(prev => ({ ...prev, counterparty: e.target.value }))}
                    placeholder="e.g. Delhivery, Flipkart"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Counterparty Role</label>
                  <Select value={quoteForm.role} onValueChange={v => setQuoteForm(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      <SelectItem value="Client">Direct Client</SelectItem>
                      <SelectItem value="Broker">Freight Broker</SelectItem>
                      <SelectItem value="Aggregator">Transport Aggregator</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Underlying / End Client (Optional)</label>
                  <Input
                    value={quoteForm.underlyingClient}
                    onChange={e => setQuoteForm(prev => ({ ...prev, underlyingClient: e.target.value }))}
                    placeholder="e.g. Amazon, Reliance"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Origin City</label>
                  <Input
                    value={quoteForm.origin}
                    onChange={e => setQuoteForm(prev => ({ ...prev, origin: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Destination City</label>
                  <Input
                    value={quoteForm.destination}
                    onChange={e => setQuoteForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Distance (KM)</label>
                  <Input
                    type="number"
                    value={quoteForm.distanceKm}
                    onChange={e => setQuoteForm(prev => ({ ...prev, distanceKm: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Vehicle Type</label>
                  <Select value={quoteForm.truckType} onValueChange={v => setQuoteForm(prev => ({ ...prev, truckType: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      {TRUCK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 3-Tier Strategies Result */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-rose-400 text-sm">🔥 Aggressive Bid</span>
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]">Win Prob ~85%</Badge>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    ₹{quoteRecommendation.aggressive.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Net Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.aggressive - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-emerald-950/30 border-2 border-emerald-500 space-y-2 shadow-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-emerald-300 text-sm">⚖️ Balanced (Recommended)</span>
                    <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px]">Optimal</Badge>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    ₹{quoteRecommendation.balanced.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Net Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.balanced - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-amber-300 text-sm">💰 Profit-Max Bid</span>
                    <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">High Margin</Badge>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    ₹{quoteRecommendation.profitMax.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Net Profit: <strong className="text-emerald-400">₹{(quoteRecommendation.profitMax - tripCostCalculation.totalCost).toLocaleString('en-IN')}</strong>
                  </p>
                </div>
              </div>

              {/* Rationale & Explainability Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" /> Recommendation Explanations &amp; Intelligence
                  </span>
                  <Badge className={`text-[10px] font-bold ${quoteRecommendation.confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : quoteRecommendation.confidence === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                    Confidence: {quoteRecommendation.confidence}
                  </Badge>
                </div>
                <ul className="space-y-1 text-xs text-slate-400">
                  {quoteRecommendation.explanations.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => handleSaveQuickQuote('Opportunity')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-5 gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Save as Future Bid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSaveQuickQuote('Bid Submitted')}
                  className="rounded-xl border-slate-700 bg-slate-950 text-white font-bold text-xs h-11 px-5 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark Bid Submitted
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareQuoteWhatsApp}
                  className="rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold text-xs h-11 px-5 gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share WhatsApp Quote
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 3. NEW BID FORM TAB */}
        {activeTab === 'new-bid' && (
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" /> Create New Bidding Opportunity
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fast, mobile-friendly bid logger with automatic mileage, toll, and cost estimations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Counterparty *</label>
                  <Input
                    value={newBidForm.counterparty}
                    onChange={e => setNewBidForm(prev => ({ ...prev, counterparty: e.target.value }))}
                    placeholder="Company name (e.g. Delhivery, Amazon)"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Role in this Bid *</label>
                  <Select value={newBidForm.role} onValueChange={v => setNewBidForm(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      <SelectItem value="Broker">Broker</SelectItem>
                      <SelectItem value="Client">Direct Client</SelectItem>
                      <SelectItem value="Aggregator">Transport Aggregator</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Underlying Client (Optional)</label>
                  <Input
                    value={newBidForm.underlyingClient}
                    onChange={e => setNewBidForm(prev => ({ ...prev, underlyingClient: e.target.value }))}
                    placeholder="e.g. Amazon, Flipkart"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Origin *</label>
                  <Input
                    value={newBidForm.origin}
                    onChange={e => setNewBidForm(prev => ({ ...prev, origin: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Destination *</label>
                  <Input
                    value={newBidForm.destination}
                    onChange={e => setNewBidForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Distance (KM) *</label>
                  <Input
                    type="number"
                    value={newBidForm.distanceKm}
                    onChange={e => setNewBidForm(prev => ({ ...prev, distanceKm: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Vehicle Type *</label>
                  <Select value={newBidForm.truckType} onValueChange={v => setNewBidForm(prev => ({ ...prev, truckType: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      {TRUCK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Quoted Rate (₹) *</label>
                  <Input
                    type="number"
                    value={newBidForm.quotedAmount}
                    onChange={e => setNewBidForm(prev => ({ ...prev, quotedAmount: e.target.value }))}
                    placeholder="Enter your proposed rate"
                    className="bg-slate-950 border-slate-800 text-emerald-400 font-bold font-mono text-sm rounded-xl h-11"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Initial Status</label>
                  <Select value={newBidForm.status} onValueChange={v => setNewBidForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                      <SelectItem value="Opportunity">Opportunity</SelectItem>
                      <SelectItem value="Evaluating">Evaluating</SelectItem>
                      <SelectItem value="Bid Prepared">Bid Prepared</SelectItem>
                      <SelectItem value="Bid Submitted">Bid Submitted</SelectItem>
                      <SelectItem value="Won">Won (Active Contract)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Notes / Terms</label>
                <Input
                  value={newBidForm.notes}
                  onChange={e => setNewBidForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special SLA conditions, payment terms, or remarks"
                  className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={async () => {
                    if (!newBidForm.counterparty || !newBidForm.origin || !newBidForm.destination) {
                      toast.error('Please enter Counterparty, Origin, and Destination');
                      return;
                    }
                    try {
                      await saveBid({
                        ...newBidForm,
                        quoted_amount: Number(newBidForm.quotedAmount || 0),
                        actual_winning_rate: newBidForm.status === 'Won' ? Number(newBidForm.quotedAmount || 0) : 0
                      });
                      toast.success('Bid successfully created!');
                      setActiveTab('pipeline');
                      fetchData();
                    } catch (e) {
                      toast.error('Failed to create bid');
                    }
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-6 shadow-lg shadow-emerald-950"
                >
                  Save Opportunity
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('pipeline')}
                  className="rounded-xl text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 4. BID PIPELINE KANBAN TAB */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Kanban className="w-5 h-5 text-emerald-400" /> Bidding Lifecycle Kanban Board
                </h2>
                <p className="text-xs text-slate-400">Drag or click actions to move opportunities across the full lifecycle.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab('new-bid')}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Opportunity
              </Button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map(stage => {
                const stageBids = bids.filter(b => b.status === stage.key || (stage.key === 'Won' && b.result === 'Won') || (stage.key === 'Lost' && b.result === 'Lost'));

                return (
                  <div key={stage.key} className="min-w-[240px] rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-3 flex flex-col">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-200">{stage.label}</span>
                      <Badge className="text-[10px] font-mono bg-slate-800 text-slate-300">{stageBids.length}</Badge>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {stageBids.map(b => (
                        <div key={b.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 shadow hover:border-slate-700 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-black text-white">{b.origin} ➔ {b.destination}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">₹{Number(b.quoted_amount).toLocaleString('en-IN')}</span>
                          </div>

                          <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                            <p><strong className="text-slate-300">{b.counterparty}</strong> ({b.role})</p>
                            {b.underlying_client && <p className="text-purple-300">Client: {b.underlying_client}</p>}
                            <p>{b.truck_type} • {b.distance_km} KM</p>
                          </div>

                          {/* Lost Bid Intelligence Badge & Actions */}
                          {(stage.key === 'Lost' || b.result === 'Lost') && (
                            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[10px] font-mono space-y-1">
                              {Number(b.actual_winning_rate) > 0 ? (
                                <>
                                  <div className="flex justify-between items-center text-rose-300">
                                    <span>Won at: <strong>₹{Number(b.actual_winning_rate).toLocaleString('en-IN')}</strong></span>
                                    <span className="text-[9px] text-slate-400">(-₹{(Number(b.quoted_amount) - Number(b.actual_winning_rate)).toLocaleString('en-IN')})</span>
                                  </div>
                                  {b.lost_reason && (
                                    <p className="text-[9px] text-slate-400 truncate">Reason: {b.lost_reason}</p>
                                  )}
                                  <button
                                    onClick={() => setLostBidModal({
                                      isOpen: true,
                                      bid: b,
                                      actualWinningRate: b.actual_winning_rate || '',
                                      lostReason: b.lost_reason || 'Price too high / Competitor undercut',
                                      competitorName: b.competitor_name || '',
                                      feedbackNotes: b.notes || ''
                                    })}
                                    className="w-full mt-1 text-[9px] py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center font-bold"
                                  >
                                    ✏️ Edit Lost Intel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setLostBidModal({
                                    isOpen: true,
                                    bid: b,
                                    actualWinningRate: '',
                                    lostReason: 'Price too high / Competitor undercut',
                                    competitorName: '',
                                    feedbackNotes: ''
                                  })}
                                  className="w-full text-[9px] py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-center font-bold flex items-center justify-center gap-1"
                                >
                                  💡 Enter Lost Amount
                                </button>
                              )}
                            </div>
                          )}

                          {/* Quick 1-Click Status Advance */}
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60 justify-end">
                            {stage.key !== 'Won' && (
                              <button
                                onClick={() => handleUpdateBidStatus(b, 'Won')}
                                className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold"
                                title="Mark as WON"
                              >
                                Won 🏆
                              </button>
                            )}
                            {stage.key !== 'Lost' && (
                              <button
                                onClick={() => handleUpdateBidStatus(b, 'Lost')}
                                className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold"
                                title="Mark as LOST"
                              >
                                Lost ✖
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {stageBids.length === 0 && (
                        <div className="text-center py-8 text-slate-600 text-xs italic">
                          No bids in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. BID HISTORY & DATABASE TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" /> Historical Bidding Database
                  </h2>
                  <p className="text-xs text-slate-400">Searchable repository of all entered and imported commercial bids.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download Sample CSV Template */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const template = getBiddingCsvTemplate();
                      const blob = new Blob([template], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'jbc_bids_import_template.csv';
                      a.click();
                    }}
                    className="rounded-xl border-slate-700 bg-slate-950 text-slate-300 font-bold text-xs h-9 gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV Template
                  </Button>

                  {/* CSV Import Upload Button */}
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
                    <div className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 shadow">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import CSV
                    </div>
                  </label>

                  {/* Export CSV */}
                  <Button
                    size="sm"
                    onClick={() => exportBidsToCsv(bids)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder="Search by client, origin, destination, truck..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs pl-9 rounded-xl h-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px] bg-slate-950 border-slate-800 text-white text-xs rounded-xl h-10">
                    <SelectValue placeholder="Bid Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                    <SelectItem value="ALL">All Types (Spot &amp; Contract)</SelectItem>
                    <SelectItem value="Spot">🚚 Spot (One Load)</SelectItem>
                    <SelectItem value="Contract">📑 Contract RFP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[130px] bg-slate-950 border-slate-800 text-white text-xs rounded-xl h-10">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Aggregator">Aggregator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger className="w-[130px] bg-slate-950 border-slate-800 text-white text-xs rounded-xl h-10">
                    <SelectValue placeholder="Outcome" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                    <SelectItem value="ALL">All Outcomes</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Opportunity">Opportunity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Route &amp; Distance</th>
                      <th className="p-3">Type &amp; Volume</th>
                      <th className="p-3">Counterparty &amp; Role</th>
                      <th className="p-3">Truck &amp; Load</th>
                      <th className="p-3">Our Quote</th>
                      <th className="p-3">Winning Rate</th>
                      <th className="p-3">Result</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredBids.map(b => {
                      const isContract = b.bid_type === 'Contract' || Number(b.trips_count) > 1 || Number(b.monthly_trips) > 1;
                      const trips = Number(b.trips_count || b.monthly_trips || 1);
                      const totalKm = Number(b.distance_km || 0) * trips;

                      return (
                        <tr key={b.id} className="hover:bg-slate-900/40">
                          <td className="p-3">{b.bid_date || b.created?.split('T')[0]}</td>
                          <td className="p-3 font-bold text-white">
                            <span>{b.origin} ➔ {b.destination}</span>
                            <span className="text-[10px] text-slate-400 block">{b.distance_km} KM</span>
                          </td>
                          <td className="p-3">
                            {isContract ? (
                              <div>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[9px]">
                                  📑 Contract
                                </Badge>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{trips} Trips/mo • {totalKm.toLocaleString('en-IN')} KM</span>
                              </div>
                            ) : (
                              <div>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[9px]">
                                  🚚 Spot Load
                                </Badge>
                                <span className="text-[10px] text-slate-400 block mt-0.5">1 Trip</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-white font-bold">{b.counterparty}</span>
                            <span className="text-[10px] text-slate-500 block">({b.role}){b.underlying_client ? ` • For: ${b.underlying_client}` : ''}</span>
                          </td>
                          <td className="p-3">{b.truck_type} ({b.payload_tons || 6}T)</td>
                          <td className="p-3 font-bold text-emerald-400 font-mono">
                            ₹{Number(b.quoted_amount).toLocaleString('en-IN')}
                            {isContract && trips > 1 && (
                              <span className="text-[9px] text-slate-500 block">₹{(Number(b.quoted_amount) * trips).toLocaleString('en-IN')}/mo</span>
                            )}
                          </td>
                          <td className="p-3">
                            {Number(b.actual_winning_rate) > 0 ? (
                              <span className="text-amber-300 font-bold">₹{Number(b.actual_winning_rate).toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge className={`text-[10px] ${b.result === 'Won' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : b.result === 'Lost' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'}`}>
                              {b.result || b.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBid(b.id).then(fetchData)}
                              className="text-rose-400 hover:text-rose-300 h-7 w-7 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBids.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">
                          No historical bids found matching filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 6. CONTRACT TRACKER TAB */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" /> Active Contract Tracking &amp; Lifecycle
                </h2>
                <p className="text-xs text-slate-400">Monitors active contracts converted from won bids, monthly commitments, and renewal dates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contracts.map(c => (
                  <div key={c.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                          {c.contract_ref || 'CONTRACT'}
                        </Badge>
                        <h3 className="text-base font-black text-white mt-1">{c.origin} ➔ {c.destination}</h3>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                        {c.status || 'Active'}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-slate-400 border-t border-slate-800 pt-2">
                      <p>Party: <strong className="text-slate-200">{c.counterparty}</strong> ({c.role})</p>
                      <p>Truck: <strong className="text-slate-200">{c.truck_type}</strong></p>
                      <p>Rate: <strong className="text-emerald-400 font-bold">₹{Number(c.rate).toLocaleString('en-IN')}</strong> / trip</p>
                      <p>Monthly Volume: <strong className="text-white">{c.monthly_trips || 15} Trips</strong> (₹{((Number(c.rate || 0) * Number(c.monthly_trips || 15)) / 100000).toFixed(2)}L/mo)</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Started: {c.contract_start || 'Recent'}</span>
                      <span className="text-emerald-400 font-bold">Active SLA 98%</span>
                    </div>
                  </div>
                ))}
                {contracts.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-500 text-xs">
                    No active contracts yet. When you mark a bid as "Won", it will automatically convert here.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 7. ROUTE INTELLIGENCE TAB */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" /> Route &amp; Freight Corridor Intelligence
                </h2>
                <p className="text-xs text-slate-400">Historical performance, average ₹/KM, and top vehicles across all operational corridors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POPULAR_CORRIDORS.map(corr => {
                  const corrBids = bids.filter(b => 
                    b.origin?.toLowerCase().includes(corr.origin.toLowerCase()) && 
                    b.destination?.toLowerCase().includes(corr.dest.toLowerCase())
                  );
                  const wonBids = corrBids.filter(b => b.result === 'Won' || b.status === 'Won');
                  const winRate = corrBids.length > 0 ? Math.round((wonBids.length / corrBids.length) * 100) : 75;
                  const avgWonRate = wonBids.length > 0 
                    ? Math.round(wonBids.reduce((a, b) => a + Number(b.actual_winning_rate || b.quoted_amount), 0) / wonBids.length)
                    : (corr.distance * 36);

                  const ratePerKm = (avgWonRate / corr.distance).toFixed(2);

                  return (
                    <div key={`${corr.origin}-${corr.dest}`} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-white text-base">{corr.origin} ➔ {corr.dest}</h3>
                          <p className="text-xs text-slate-400 font-mono">{corr.distance} KM • Est. Toll ₹{corr.toll}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]">
                          {winRate}% Win Rate
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Avg Winning Rate</span>
                          <strong className="text-emerald-400">₹{avgWonRate.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Rate / KM</span>
                          <strong className="text-blue-400">₹{ratePerKm}/km</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Best Vehicle</span>
                          <strong className="text-white">20FT / 32FT</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Trend</span>
                          <strong className="text-emerald-400">📈 Stable/High</strong>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          handleSelectCorridor(corr);
                          setActiveTab('calculator');
                        }}
                        className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-9"
                      >
                        Calculate Quote for this Route
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* 8. CLIENTS & BROKERS ANALYTICS TAB */}
        {activeTab === 'parties' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" /> Clients &amp; Freight Brokers Analytics
                </h2>
                <p className="text-xs text-slate-400">Separate analytics for Direct Clients vs Freight Brokers vs Aggregators.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Delhivery', role: 'Freight Broker / Partner', totalBids: 18, won: 14, winRate: 78, avgRate: 21200, topRoute: 'Hyderabad ➔ Bengaluru' },
                  { name: 'Flipkart Logistics', role: 'Direct Enterprise Client', totalBids: 12, won: 9, winRate: 75, avgRate: 28500, topRoute: 'Hyderabad ➔ Chennai' },
                  { name: 'Rivigo / Aggregators', role: 'Transport Aggregator', totalBids: 8, won: 6, winRate: 75, avgRate: 20800, topRoute: 'Bengaluru ➔ Hyderabad' },
                ].map(p => (
                  <div key={p.name} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-white text-base">{p.name}</h3>
                        <Badge className="bg-slate-800 text-slate-300 text-[10px] font-mono mt-0.5">{p.role}</Badge>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                        {p.winRate}% Won
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <p>Total Opportunities: <strong className="text-white">{p.totalBids}</strong> ({p.won} Won)</p>
                      <p>Avg Winning Quote: <strong className="text-emerald-400">₹{p.avgRate.toLocaleString('en-IN')}</strong></p>
                      <p>Primary Corridor: <strong className="text-blue-300">{p.topRoute}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 9. TRUCKS INTELLIGENCE TAB */}
        {activeTab === 'trucks' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" /> Fleet Vehicle Profiles &amp; Deployment Optimizer
                </h2>
                <p className="text-xs text-slate-400">Vehicle-specific loaded/empty mileage specs, cost per KM profiles, and best corridor deployment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(DEFAULT_VEHICLE_COST_PROFILES).filter(([k]) => k !== 'DEFAULT').map(([type, prof]) => (
                  <div key={type} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                        {type}
                      </Badge>
                      <h3 className="font-black text-white text-base mt-1">Payload: {prof.defaultPayloadTons}T</h3>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <p>Loaded Mileage: <strong className="text-emerald-400">{prof.loadedMileage} KM/L</strong></p>
                      <p>Empty Mileage: <strong className="text-blue-400">{prof.emptyMileage} KM/L</strong></p>
                      <p>Maintenance: <strong className="text-white">₹{prof.maintenancePerKm}/KM</strong></p>
                      <p>Tyres: <strong className="text-white">₹{prof.tyrePerKm}/KM</strong></p>
                      <p>Driver Allowance: <strong className="text-white">₹{prof.driverCostPerDay}/day</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 10. PROFITABILITY ENGINE TAB */}
        {activeTab === 'profitability' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-5">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Deep Trip Cost &amp; Sensitivity Analysis
                </h2>
                <p className="text-xs text-slate-400">Evaluate cost breakdowns and stress-test margins against diesel price &amp; mileage shifts.</p>
              </div>

              {/* Cost Per KM Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Fuel Cost</span>
                  <strong className="text-base text-blue-400">₹{tripCostCalculation.fuelCost.toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">₹{(tripCostCalculation.fuelCost / tripCostCalculation.totalTripKm).toFixed(2)}/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Toll &amp; FASTag</span>
                  <strong className="text-base text-amber-400">₹{tripCostCalculation.tollCost.toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">₹{(tripCostCalculation.tollCost / tripCostCalculation.totalTripKm).toFixed(2)}/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Driver Allowance</span>
                  <strong className="text-base text-emerald-400">₹{tripCostCalculation.driverCost.toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">₹{(tripCostCalculation.driverCost / tripCostCalculation.totalTripKm).toFixed(2)}/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Maintenance &amp; Tyres</span>
                  <strong className="text-base text-purple-400">₹{(tripCostCalculation.maintenanceCost + tripCostCalculation.tyreCost).toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">₹{((tripCostCalculation.maintenanceCost + tripCostCalculation.tyreCost) / tripCostCalculation.totalTripKm).toFixed(2)}/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Fixed Allocation</span>
                  <strong className="text-base text-rose-400">₹{tripCostCalculation.fixedCostAllocation.toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">₹{(tripCostCalculation.fixedCostAllocation / tripCostCalculation.totalTripKm).toFixed(2)}/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center font-mono bg-emerald-950/20">
                  <span className="text-[10px] text-emerald-300 block font-bold">Total Cost / KM</span>
                  <strong className="text-base text-emerald-400">₹{tripCostCalculation.costPerKm}</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">₹{tripCostCalculation.totalCost.toLocaleString('en-IN')} Total</span>
                </div>
              </div>

              {/* Fuel Price Sensitivity Table */}
              <div className="space-y-2 pt-3">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  <Fuel className="w-4 h-4 text-blue-400" /> Diesel Price Sensitivity Matrix (at Quote: ₹{quoteRecommendation.balanced.toLocaleString('en-IN')})
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Diesel Price (₹/L)</th>
                        <th className="p-3">Fuel Cost</th>
                        <th className="p-3">Total Trip Cost</th>
                        <th className="p-3">Estimated Net Profit</th>
                        <th className="p-3">Profit Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {sensitivityAnalysis.fuelSensitivity.map(row => (
                        <tr key={row.dieselPrice} className={row.delta === 0 ? 'bg-emerald-950/20 font-bold text-emerald-300' : ''}>
                          <td className="p-3">₹{row.dieselPrice} {row.delta !== 0 ? `(${row.delta > 0 ? '+' : ''}₹${row.delta})` : ' (Current)'}</td>
                          <td className="p-3">₹{row.fuelCost.toLocaleString('en-IN')}</td>
                          <td className="p-3">₹{row.totalCost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-emerald-400">₹{row.profit.toLocaleString('en-IN')}</td>
                          <td className="p-3">{row.margin}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 11. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Bidding &amp; Commercial Intelligence Reports
                </h2>
                <p className="text-xs text-slate-400">Download formatted reports for internal performance review and client audits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm">Monthly Bidding Summary</h3>
                  <p className="text-xs text-slate-400">Consolidated report of all opportunities, win rate, and total contract volume.</p>
                  <Button
                    onClick={() => exportBidsToCsv(bids)}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export CSV / Excel
                  </Button>
                </div>

                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm">Contract Lifecycle Ledger</h3>
                  <p className="text-xs text-slate-400">Active contracts, monthly commitments, revenue and expiration schedule.</p>
                  <Button
                    onClick={() => exportBidsToCsv(bids.filter(b => b.result === 'Won'))}
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-10 gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export Contracts CSV
                  </Button>
                </div>

                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm">Corridor Profitability Analysis</h3>
                  <p className="text-xs text-slate-400">Route-by-route margin breakdown, rate per KM, and diesel sensitivity.</p>
                  <Button
                    onClick={() => exportBidsToCsv(bids)}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export Corridor Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 12. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" /> Bidding Cost &amp; Profit Settings
                </h2>
                <p className="text-xs text-slate-400">Configure global diesel prices, baseline driver wages, and target margin thresholds.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Current Diesel Price (₹/L)</label>
                  <Input
                    type="number"
                    step="0.05"
                    value={settings.currentDieselPrice}
                    onChange={e => setSettings(prev => ({ ...prev, currentDieselPrice: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Min Acceptable Margin (%)</label>
                  <Input
                    type="number"
                    value={settings.minAcceptableMarginPct}
                    onChange={e => setSettings(prev => ({ ...prev, minAcceptableMarginPct: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Min Profit per Trip (₹)</label>
                  <Input
                    type="number"
                    value={settings.minAcceptableProfitTrip}
                    onChange={e => setSettings(prev => ({ ...prev, minAcceptableProfitTrip: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-11 font-mono"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  saveBiddingSettings(settings);
                  toast.success('Bidding cost settings updated successfully!');
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-6 shadow"
              >
                Save Settings
              </Button>
            </Card>
          </div>
        )}

      </div>

      {/* Lost Bid Competitive Intelligence Modal */}
      {lostBidModal.isOpen && lostBidModal.bid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-mono">
                  COMPETITIVE INTELLIGENCE
                </Badge>
                <h3 className="text-lg font-black text-white mt-1">
                  How Much Did We Lose This Bid For?
                </h3>
                <p className="text-xs text-slate-400">
                  Recording the actual winning rate feeds the AI engine to optimize future quotes on this corridor.
                </p>
              </div>
              <button
                onClick={() => setLostBidModal({ isOpen: false, bid: null, actualWinningRate: '', lostReason: '', competitorName: '', feedbackNotes: '' })}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Opportunity Summary / Direct Inputs */}
            {lostBidModal.bid.id ? (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Route: <strong className="text-white">{lostBidModal.bid.origin} ➔ {lostBidModal.bid.destination}</strong></span>
                  <Badge className="bg-slate-800 text-slate-300 text-[10px]">{lostBidModal.bid.bid_type || (Number(lostBidModal.bid.trips_count) > 1 ? 'Contract' : 'Spot')}</Badge>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Vehicle: <strong className="text-white">{lostBidModal.bid.truck_type}</strong></span>
                  <span>Our Quote: <strong className="text-emerald-400">₹{Number(lostBidModal.bid.quoted_amount).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                {/* Spot vs Contract Toggle */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 font-mono">Opportunity Type:</span>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, bid_type: 'Spot', trips_count: 1 } }))}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        (lostBidModal.bid.bid_type || 'Spot') === 'Spot'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚚 Spot (1 Load)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, bid_type: 'Contract', trips_count: 15 } }))}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        lostBidModal.bid.bid_type === 'Contract'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📑 Monthly Contract
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Origin City</label>
                    <Input
                      value={lostBidModal.bid.origin}
                      onChange={e => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, origin: e.target.value } }))}
                      className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Destination City</label>
                    <Input
                      value={lostBidModal.bid.destination}
                      onChange={e => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, destination: e.target.value } }))}
                      className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Distance (KM)</label>
                    <Input
                      type="number"
                      value={lostBidModal.bid.distance_km}
                      onChange={e => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, distance_km: Number(e.target.value) } }))}
                      className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs h-9 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Truck Model</label>
                    <Select
                      value={lostBidModal.bid.truck_type}
                      onValueChange={v => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, truck_type: v } }))}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                        {TRUCK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Our Quote (₹)</label>
                    <Input
                      type="number"
                      value={lostBidModal.bid.quoted_amount}
                      onChange={e => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, quoted_amount: Number(e.target.value) } }))}
                      className="bg-slate-900 border-slate-700 text-emerald-400 font-mono font-bold rounded-xl text-xs h-9"
                    />
                  </div>
                </div>

                {lostBidModal.bid.bid_type === 'Contract' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Monthly Trips</label>
                      <Input
                        type="number"
                        value={lostBidModal.bid.trips_count || 15}
                        onChange={e => setLostBidModal(prev => ({ ...prev, bid: { ...prev.bid, trips_count: Number(e.target.value) } }))}
                        className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs h-9 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Total Monthly KMs</label>
                      <div className="h-9 px-3 flex items-center bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 font-bold">
                        {(Number(lostBidModal.bid.distance_km || 0) * Number(lostBidModal.bid.trips_count || 15)).toLocaleString('en-IN')} KM
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Winning / Competitor Rate (₹) <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 33500"
                  value={lostBidModal.actualWinningRate}
                  onChange={e => setLostBidModal(prev => ({ ...prev, actualWinningRate: e.target.value }))}
                  className="bg-slate-950 border-rose-500/50 text-white rounded-xl text-sm font-mono h-11"
                  autoFocus
                />
                {lostBidModal.actualWinningRate > 0 && lostBidModal.bid.quoted_amount > 0 && (
                  <p className="text-[11px] font-mono mt-1 text-slate-400">
                    Difference vs Our Quote: <strong className="text-rose-400">-₹{(Number(lostBidModal.bid.quoted_amount) - Number(lostBidModal.actualWinningRate)).toLocaleString('en-IN')}</strong> ({(((Number(lostBidModal.actualWinningRate) - Number(lostBidModal.bid.quoted_amount)) / Number(lostBidModal.bid.quoted_amount)) * 100).toFixed(1)}%)
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Primary Reason for Loss
                </label>
                <Select
                  value={lostBidModal.lostReason}
                  onValueChange={v => setLostBidModal(prev => ({ ...prev, lostReason: v }))}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                    <SelectItem value="Price too high / Competitor undercut">Price too high / Competitor undercut</SelectItem>
                    <SelectItem value="Vehicle / Capacity unavailable">Vehicle / Capacity unavailable</SelectItem>
                    <SelectItem value="Transit time / SLA not matching">Transit time / SLA not matching</SelectItem>
                    <SelectItem value="Broker margin / existing transporter preference">Broker margin / existing transporter preference</SelectItem>
                    <SelectItem value="Payment terms mismatch">Payment terms mismatch</SelectItem>
                    <SelectItem value="Other / Client cancelled trip">Other / Client cancelled trip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Winning Competitor / Transporter (Optional)
                </label>
                <Input
                  placeholder="e.g. VRL Logistics, Local Broker, etc."
                  value={lostBidModal.competitorName}
                  onChange={e => setLostBidModal(prev => ({ ...prev, competitorName: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Broker / Client Feedback &amp; Notes (Optional)
                </label>
                <Input
                  placeholder="e.g. Broker said need rate below 34k for next monthly batch"
                  value={lostBidModal.feedbackNotes}
                  onChange={e => setLostBidModal(prev => ({ ...prev, feedbackNotes: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                onClick={handleSaveLostBidIntelligence}
                className="text-slate-400 hover:text-white text-xs rounded-xl h-10"
              >
                Skip Rate &amp; Mark Lost
              </Button>
              <Button
                onClick={handleSaveLostBidIntelligence}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl h-10 px-5 gap-1.5 shadow-lg shadow-rose-950"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Rate &amp; Train AI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bid Modal Form */}
      <AddBidModal
        isOpen={isAddBidModalOpen}
        onClose={() => setIsAddBidModalOpen(false)}
        onAddBid={handleAddBid}
        clients={clientsList}
        defaultClient={activeClientTab}
        defaultType={activeTypeTab}
      />

    </div>
  );
}
