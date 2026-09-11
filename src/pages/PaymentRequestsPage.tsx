import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Download, CheckCircle, Clock, AlertTriangle, Search, Filter, 
  ShieldCheck, Calendar, Edit2, X, TrendingUp, Users, ArrowRight, 
  FileText, Send, CheckSquare, Square, Share2, Eye, RefreshCw, Layers, 
  Truck, ArrowUpRight, AlertCircle, DollarSign
} from 'lucide-react';
import { dbtabeses } from '../db/store';
import { cashbookService } from '../services/cashbookService';
import { TripLog, ClientProfile } from '../types';

export const PaymentRequestsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripLog[]>(dbtabeses.getTrips());
  const [clients] = useState<ClientProfile[]>(dbtabeses.getClients());
  const [activeSubTab, setActiveSubTab] = useState('active-requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  // Selection for bulk Mark Due Date
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDueDateModal, setBulkDueDateModal] = useState(false);
  const [bulkDueDateInput, setBulkDueDateInput] = useState('2026-10-07');

  // Create Request Modal State
  const [createModal, setCreateModal] = useState(false);
  const [reqTripNumber, setReqTripNumber] = useState(`TRIP-${Math.floor(200 + Math.random() * 800)}`);
  const [reqClient, setReqClient] = useState('Amazon Logistics India');
  const [reqAmount, setReqAmount] = useState(7100);
  const [reqDueDate, setReqDueDate] = useState('2026-10-07');
  const [reqStatus, setReqStatus] = useState<'Delivered' | 'Completed' | 'Scheduled'>('Delivered');

  // Quick Invoice / Reminder View Modal
  const [selectedTripDetails, setSelectedTripDetails] = useState<TripLog | null>(null);

  useEffect(() => {
    cashbookService.syncAllPaidTrips();
    const handleUpdate = () => setTrips(dbtabeses.getTrips());
    window.addEventListener('jc-store-update', handleUpdate);
    return () => window.removeEventListener('jc-store-update', handleUpdate);
  }, []);

  const TODAY_DATE = '2026-09-02';

  // 🛡️ STRICT RULE: ONLY trips that are completed & delivered are Booked Revenue.
  // Upcoming / scheduled / in-transit trips CANNOT be booked as revenue and CANNOT be due
  // because uncompleted work can cancel anytime!
  const isDeliveredTrip = (t: TripLog) => {
    const status = (t.status || '').trim().toLowerCase();
    return status === 'delivered' || status === 'completed';
  };

  // 1. Delivered / Completed Trips (Realized work only)
  const deliveredTrips = useMemo(() => trips.filter(isDeliveredTrip), [trips]);

  // 2. Upcoming Trips (Pipeline only - Scheduled / In Transit / Future)
  const upcomingTrips = useMemo(() => trips.filter(t => !isDeliveredTrip(t)), [trips]);

  // 3. Outstanding Dues: Strictly delivered trips pending payment
  const outstandingTrips = useMemo(() => 
    deliveredTrips.filter(t => t.clientPaymentStatus === 'Pending' || t.clientPaymentStatus === 'Delayed' || t.clientPaymentStatus === 'Partially Paid'),
    [deliveredTrips]
  );
  const totalDuesOutstanding = useMemo(() => 
    outstandingTrips.reduce((sum, t) => sum + (t.revenue || 0), 0),
    [outstandingTrips]
  );

  // 4. Paid Delivered Trips
  const paidTrips = useMemo(() => 
    deliveredTrips.filter(t => t.clientPaymentStatus === 'Paid'),
    [deliveredTrips]
  );
  const totalRevenueCollected = useMemo(() => 
    paidTrips.reduce((sum, t) => sum + (t.revenue || 0), 0),
    [paidTrips]
  );

  // 5. Total Booked Revenue = 100% completed & delivered trips only
  const totalBookedRevenue = totalDuesOutstanding + totalRevenueCollected;
  const collectionRate = totalBookedRevenue > 0 ? Math.round((totalRevenueCollected / totalBookedRevenue) * 100) : 100;

  // 6. Overdue risk (Delivered trips marked Delayed)
  const overdueTrips = useMemo(() => 
    deliveredTrips.filter(t => t.clientPaymentStatus === 'Delayed'),
    [deliveredTrips]
  );
  const overdueRiskAmount = useMemo(() => 
    overdueTrips.reduce((sum, t) => sum + (t.revenue || 0), 0),
    [overdueTrips]
  );

  // 7. Upcoming Pipeline Total (Strictly excluded from Dues and Booked Revenue)
  const upcomingProjectedTotal = useMemo(() => 
    upcomingTrips.reduce((sum, t) => sum + (t.revenue || 0), 0),
    [upcomingTrips]
  );

  // Update single trip payment due date
  const handleUpdateDueDate = (tripId: string, newDate: string) => {
    if (!newDate) return;
    const allTrips = dbtabeses.getTrips();
    const index = allTrips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      allTrips[index].due_date = newDate;
      dbtabeses.setTrips(allTrips);
      setActionSuccess(`Due date updated to ${newDate} for ${allTrips[index].trip_number}!`);
      setTimeout(() => setActionSuccess(''), 3500);
    }
  };

  // Bulk update due date for selected trips
  const handleBulkUpdateDueDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !bulkDueDateInput) return;

    const allTrips = dbtabeses.getTrips();
    allTrips.forEach(t => {
      if (selectedIds.includes(t.id)) {
        t.due_date = bulkDueDateInput;
      }
    });

    dbtabeses.setTrips(allTrips);
    setBulkDueDateModal(false);
    setSelectedIds([]);
    setActionSuccess(`Payment due date updated to ${bulkDueDateInput} for ${selectedIds.length} request(s)!`);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Mark payment as paid
  const handleMarkPaid = (tripId: string) => {
    const allTrips = dbtabeses.getTrips();
    const index = allTrips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      allTrips[index].clientPaymentStatus = 'Paid';
      allTrips[index].status = 'Completed';
      dbtabeses.setTrips(allTrips);
      cashbookService.syncTripPaymentIncome(allTrips[index]);
      setActionSuccess(`Payment for trip ${allTrips[index].trip_number} (₹${allTrips[index].revenue.toLocaleString('en-IN')}) marked as Paid and added to Cashbook!`);
      setTimeout(() => setActionSuccess(''), 3500);
    }
  };

  // Bulk mark payment as paid
  const handleBulkMarkPaid = () => {
    if (selectedIds.length === 0) return;
    const allTrips = dbtabeses.getTrips();
    let count = 0;
    let totalRevenue = 0;
    allTrips.forEach(t => {
      if (selectedIds.includes(t.id)) {
        t.clientPaymentStatus = 'Paid';
        t.status = 'Completed';
        totalRevenue += (t.revenue || 0);
        cashbookService.syncTripPaymentIncome(t);
        count++;
      }
    });
    dbtabeses.setTrips(allTrips);
    setSelectedIds([]);
    setActionSuccess(`Successfully marked ${count} trip payment(s) as Paid (Total ₹${totalRevenue.toLocaleString('en-IN')}) and added to Cashbook!`);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Mark upcoming trip as delivered (Instantly converts pipeline into booked revenue & due!)
  const handleMarkDelivered = (tripId: string) => {
    const allTrips = dbtabeses.getTrips();
    const index = allTrips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      allTrips[index].status = 'Delivered';
      allTrips[index].clientPaymentStatus = 'Pending';
      allTrips[index].pod_status = 'Verified';
      dbtabeses.setTrips(allTrips);
      setActionSuccess(`Trip ${allTrips[index].trip_number} marked as Delivered! Revenue of ₹${allTrips[index].revenue.toLocaleString('en-IN')} is now Booked & Due.`);
      setTimeout(() => setActionSuccess(''), 4500);
    }
  };

  // Toggle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedTrips.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle single selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Create Payment Request Handler
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTrips = dbtabeses.getTrips();
    const newEntry: TripLog = {
      id: 'trip-' + Date.now(),
      trip_number: reqTripNumber,
      truck_id: 'truck-001',
      truck_number: 'TG12U2637',
      driver_id: 'emp-001',
      driver_name: 'Vinod Kumar Rathod',
      client_id: 'cli-001',
      client_name: reqClient,
      origin: 'Hyderabad',
      destination: 'Warangal',
      start_date: TODAY_DATE,
      due_date: reqDueDate,
      distance_kms: 150,
      revenue: Number(reqAmount),
      fuel_cost: Math.round(Number(reqAmount) * 0.3),
      toll_cost: 550,
      driver_allowance: 1000,
      tyre_depreciation_rate_per_km: 3,
      tyre_depreciation_expense: 450,
      total_expenses: Math.round(Number(reqAmount) * 0.3) + 2000,
      net_profit: Number(reqAmount) - (Math.round(Number(reqAmount) * 0.3) + 2000),
      status: reqStatus,
      clientPaymentStatus: 'Pending',
      requires_pod: true,
      pod_status: reqStatus === 'Scheduled' ? 'Pending' : 'Verified'
    };

    dbtabeses.setTrips([newEntry, ...currentTrips]);
    setCreateModal(false);
    setActionSuccess(`Payment Request / Trip ${reqTripNumber} created successfully (${reqStatus === 'Scheduled' ? 'Pipeline' : 'Booked Due'})!`);
    setTimeout(() => setActionSuccess(''), 3500);
    setReqTripNumber(`TRIP-${Math.floor(200 + Math.random() * 800)}`);
  };

  // Filter requests for main table (Delivered Trips only)
  const displayedTrips = useMemo(() => {
    return deliveredTrips.filter(t => {
      const matchesSearch = t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.trip_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.origin && t.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (t.destination && t.destination.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || t.clientPaymentStatus.toUpperCase() === statusFilter.toUpperCase();
      const matchesClient = clientFilter === 'ALL' || t.client_name === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [deliveredTrips, searchQuery, statusFilter, clientFilter]);

  const uniqueClients = useMemo(() => Array.from(new Set(trips.map(t => t.client_name).filter(Boolean))), [trips]);

  // Aging Buckets Data (0-15D, 16-30D, 31-60D, 60D+) strictly for delivered unpaid trips
  const agingData = useMemo(() => {
    const b0_15 = { count: 0, amount: 0, trips: [] as TripLog[] };
    const b16_30 = { count: 0, amount: 0, trips: [] as TripLog[] };
    const b31_60 = { count: 0, amount: 0, trips: [] as TripLog[] };
    const b60_plus = { count: 0, amount: 0, trips: [] as TripLog[] };

    outstandingTrips.forEach(t => {
      const tripDate = t.due_date ? new Date(t.due_date).getTime() : new Date(t.start_date).getTime();
      const now = new Date(TODAY_DATE).getTime();
      const daysOverdue = Math.max(0, Math.floor((now - tripDate) / (1000 * 60 * 60 * 24)));
      const amt = t.revenue || 0;

      if (daysOverdue <= 15) {
        b0_15.count++;
        b0_15.amount += amt;
        b0_15.trips.push(t);
      } else if (daysOverdue <= 30) {
        b16_30.count++;
        b16_30.amount += amt;
        b16_30.trips.push(t);
      } else if (daysOverdue <= 60) {
        b31_60.count++;
        b31_60.amount += amt;
        b31_60.trips.push(t);
      } else {
        b60_plus.count++;
        b60_plus.amount += amt;
        b60_plus.trips.push(t);
      }
    });

    return { b0_15, b16_30, b31_60, b60_plus };
  }, [outstandingTrips]);

  // Client Ledger Breakdown strictly on delivered trips
  const clientLedgers = useMemo(() => {
    const map: Record<string, {
      clientName: string;
      totalBooked: number;
      totalPaid: number;
      outstandingDues: number;
      overdueCount: number;
      upcomingPipeline: number;
      trips: TripLog[];
    }> = {};

    trips.forEach(t => {
      const cName = t.client_name || 'Unknown Client';
      if (!map[cName]) {
        map[cName] = {
          clientName: cName,
          totalBooked: 0,
          totalPaid: 0,
          outstandingDues: 0,
          overdueCount: 0,
          upcomingPipeline: 0,
          trips: []
        };
      }

      map[cName].trips.push(t);

      if (isDeliveredTrip(t)) {
        map[cName].totalBooked += (t.revenue || 0);
        if (t.clientPaymentStatus === 'Paid') {
          map[cName].totalPaid += (t.revenue || 0);
        } else {
          map[cName].outstandingDues += (t.revenue || 0);
          if (t.clientPaymentStatus === 'Delayed') {
            map[cName].overdueCount++;
          }
        }
      } else {
        map[cName].upcomingPipeline += (t.revenue || 0);
      }
    });

    return Object.values(map);
  }, [trips]);

  // Client Credit Control Data
  const creditControlData = useMemo(() => {
    return clientLedgers.map(cl => {
      const creditLimit = 500000; // Default ₹5,00,000 credit limit per enterprise client
      const outstanding = cl.outstandingDues;
      const remaining = Math.max(0, creditLimit - outstanding);
      const utilization = Math.min(100, Math.round((outstanding / creditLimit) * 100));
      const status = utilization >= 100 ? 'Exceeded' : utilization >= 80 ? 'Warning' : 'Normal';
      return {
        ...cl,
        creditLimit,
        remaining,
        utilization,
        status
      };
    });
  }, [clientLedgers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Payment Requests &amp; Collections
            </h1>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-extrabold uppercase rounded-full border border-blue-500/30">
              Enterprise v2.5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Strict Accounting: Only completed &amp; delivered trips count toward booked revenue and dues. Upcoming trips are tracked as pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
          >
            <Plus className="w-4.5 h-4.5" /> Create Payment Request
          </button>
          <button 
            onClick={() => {
              const csv = "Trip Number,Client,Route,Revenue,Status,Payment Status\n" + 
                deliveredTrips.map(t => `"${t.trip_number}","${t.client_name}","${t.origin} -> ${t.destination}",${t.revenue},"${t.status}","${t.clientPaymentStatus}"`).join("\n");
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Delivered_Dues_Report_${Date.now()}.csv`;
              a.click();
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-600 text-emerald-300 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Executive KPI Summary Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL DUES OUTSTANDING */}
        <div className="p-5 bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl relative overflow-hidden shadow-lg shadow-amber-950/20 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400">TOTAL DUES OUTSTANDING</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              ₹{totalDuesOutstanding.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-300 font-medium">
                <b className="text-amber-400">{outstandingTrips.length}</b> Delivered invoices pending
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                Delivered Only
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: BOOKED REVENUE (DELIVERED ONLY) */}
        <div className="p-5 bg-slate-900/90 border-2 border-blue-500/40 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-950/20 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-400">BOOKED REVENUE (DELIVERED)</span>
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              ₹{totalBookedRevenue.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-300 font-medium">
                <b className="text-blue-400">{deliveredTrips.length}</b> Completed trips
              </span>
              <span className="text-emerald-400 font-bold">100% Realized</span>
            </div>
          </div>
        </div>

        {/* CARD 3: TOTAL REVENUE COLLECTED */}
        <div className="p-5 bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl relative overflow-hidden shadow-lg shadow-emerald-950/20 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">TOTAL REVENUE COLLECTED</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-emerald-400 tracking-tight">
              ₹{totalRevenueCollected.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-300 font-medium">
                <b className="text-emerald-400">{collectionRate}%</b> collection rate
              </span>
              <span className="text-slate-400 font-semibold">{paidTrips.length} settled</span>
            </div>
          </div>
        </div>

        {/* CARD 4: UPCOMING TRIPS PIPELINE (EXCLUDED FROM DUES) */}
        <div 
          onClick={() => setActiveSubTab('upcoming-trips')}
          className="p-5 bg-slate-900/90 border-2 border-purple-500/40 rounded-2xl relative overflow-hidden shadow-lg shadow-purple-950/20 cursor-pointer hover:border-purple-400 hover:bg-slate-900 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-purple-400">UPCOMING PIPELINE (UNREALIZED)</span>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black text-purple-300 tracking-tight">
              ₹{upcomingProjectedTotal.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-300 font-medium">
                <b className="text-purple-400">{upcomingTrips.length}</b> Scheduled / In Transit
              </span>
              <span className="text-purple-400 font-bold flex items-center gap-0.5">View &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-3 text-sm font-semibold overflow-x-auto pb-1">
        {[
          { id: 'active-requests', label: `Active Requests (${deliveredTrips.length})` },
          { id: 'upcoming-trips', label: `Upcoming Pipeline (${upcomingTrips.length})` },
          { id: 'credit-control', label: 'Credit Control' },
          { id: 'aging-workspace', label: 'Aging Workspace' },
          { id: 'client-ledgers', label: 'Client Ledgers' },
          { id: 'analytics', label: 'Analytics Hub' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-3 whitespace-nowrap transition relative px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 ${
              activeSubTab === tab.id 
                ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ACTIVE REQUESTS (DELIVERED TRIPS ONLY) */}
      {activeSubTab === 'active-requests' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Delivered Trip Payment Requests
                <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-mono border border-emerald-500/30">
                  {displayedTrips.length} Records
                </span>
              </h3>
              <p className="text-xs text-slate-400">Strictly displaying delivered trips with completed work. Upcoming trips are excluded from this queue.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search client, trip code, or route..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Payment Status</option>
                <option value="PENDING">Pending</option>
                <option value="DELAYED">Delayed / Overdue</option>
                <option value="PAID">Paid</option>
              </select>

              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Clients ({uniqueClients.length})</option>
                {uniqueClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkMarkPaid}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Paid ({selectedIds.length})
                </button>
              )}

              <button
                onClick={() => {
                  if (selectedIds.length === 0) {
                    setSelectedIds(displayedTrips.map(t => t.id));
                  }
                  setBulkDueDateModal(true);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Set Due Date {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === displayedTrips.length}
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">TRIP DATE</th>
                  <th className="p-3.5">CLIENT &amp; TRIP</th>
                  <th className="p-3.5">ROUTE &amp; VEHICLE</th>
                  <th className="p-3.5">AMOUNT (₹)</th>
                  <th className="p-3.5">PAYMENT DUE DATE</th>
                  <th className="p-3.5">DELIVERY STATUS</th>
                  <th className="p-3.5">PAYMENT STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedTrips.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No payment requests match the selected filters.
                    </td>
                  </tr>
                ) : (
                  displayedTrips.map(dt => (
                    <tr key={dt.id} className={`hover:bg-slate-800/40 transition ${selectedIds.includes(dt.id) ? 'bg-slate-800/50' : ''}`}>
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(dt.id)}
                          onChange={() => handleToggleSelect(dt.id)}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                        {dt.start_date}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-white">{dt.client_name}</p>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          {dt.trip_number}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        <p className="text-white font-medium">{dt.origin} &rarr; {dt.destination}</p>
                        <p className="text-slate-400 font-mono">{dt.truck_number} ({dt.driver_name})</p>
                      </td>
                      <td className="p-3.5 font-extrabold text-blue-400 whitespace-nowrap">
                        ₹{dt.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <input
                          type="date"
                          value={dt.due_date || '2026-10-07'}
                          onChange={(e) => handleUpdateDueDate(dt.id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono focus:border-amber-400 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Delivered
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-xs font-extrabold tracking-wider rounded-md uppercase ${
                          dt.clientPaymentStatus === 'Paid' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : dt.clientPaymentStatus === 'Delayed' 
                            ? 'bg-red-950 text-red-400 border border-red-800' 
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {dt.clientPaymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {dt.clientPaymentStatus !== 'Paid' && (
                            <button
                              onClick={() => handleMarkPaid(dt.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition"
                              title="Mark Payment as Received"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Paid
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedTripDetails(dt)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition" 
                            title="View Invoice Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UPCOMING TRIPS PIPELINE (UNREALIZED WORK) */}
      {activeSubTab === 'upcoming-trips' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="p-4 bg-purple-950/40 border-2 border-purple-800/60 rounded-2xl flex items-start gap-3.5">
            <AlertCircle className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                Upcoming Trips Pipeline (Excluded from Booked Revenue &amp; Outstanding Dues)
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-full border border-purple-500/40">
                  {upcomingTrips.length} Trips • ₹{upcomingProjectedTotal.toLocaleString('en-IN')}
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                These trips are scheduled or in transit. Because trips can cancel anytime before completion, they are tracked as projected pipeline revenue and are strictly <b>excluded</b> from Total Dues Outstanding and Total Booked Revenue until delivery is completed. Once a driver completes delivery, click <b>Mark Delivered</b> below to book the revenue.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">SCHEDULED DATE</th>
                  <th className="p-3.5">CLIENT &amp; TRIP</th>
                  <th className="p-3.5">ROUTE &amp; VEHICLE</th>
                  <th className="p-3.5">PROJECTED REVENUE</th>
                  <th className="p-3.5">EXPECTED DUE DATE</th>
                  <th className="p-3.5">TRIP STATUS</th>
                  <th className="p-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {upcomingTrips.map(ut => (
                  <tr key={ut.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-semibold text-slate-200">{ut.start_date}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{ut.client_name}</p>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                        {ut.trip_number}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-slate-400">
                      <p className="text-white font-medium">{ut.origin} &rarr; {ut.destination}</p>
                      <p className="text-slate-400 font-mono">{ut.truck_number} ({ut.driver_name})</p>
                    </td>
                    <td className="p-3.5 font-bold text-purple-400">₹{ut.revenue.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <input
                        type="date"
                        value={ut.due_date || '2026-10-07'}
                        onChange={(e) => handleUpdateDueDate(ut.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-purple-300 font-mono focus:border-purple-400 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        ut.status === 'In Transit' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {ut.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleMarkDelivered(ut.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition ml-auto"
                        title="Confirm delivery and move to Booked Dues"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CREDIT CONTROL WORKSPACE */}
      {activeSubTab === 'credit-control' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Enterprise Credit Control
            </h3>
            <p className="text-xs text-slate-400">Real-time credit limits and risk exposure calculated strictly on completed deliveries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditControlData.map(cc => (
              <div key={cc.clientName} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{cc.clientName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Limit: ₹{cc.creditLimit.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                    cc.status === 'Exceeded' 
                      ? 'bg-red-950 text-red-400 border border-red-800' 
                      : cc.status === 'Warning' 
                      ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {cc.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Outstanding:</span>
                    <span className="text-amber-400 font-bold">₹{cc.outstandingDues.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cc.utilization >= 100 ? 'bg-red-500' : cc.utilization >= 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${cc.utilization}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Remaining: ₹{cc.remaining.toLocaleString('en-IN')}</span>
                    <span>{cc.utilization}% Used</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AGING WORKSPACE */}
      {activeSubTab === 'aging-workspace' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Accounts Receivable Aging Analysis
            </h3>
            <p className="text-xs text-slate-400">Aging buckets computed exclusively on delivered trips awaiting collection.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border-l-4 border-l-emerald-500 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">0 - 15 DAYS (CURRENT)</span>
              <h4 className="text-2xl font-black text-white mt-1">₹{agingData.b0_15.amount.toLocaleString('en-IN')}</h4>
              <p className="text-xs text-emerald-400 mt-2 font-medium">{agingData.b0_15.count} delivered invoices</p>
            </div>

            <div className="p-4 bg-slate-950 border-l-4 border-l-blue-500 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">16 - 30 DAYS (DUE SOON)</span>
              <h4 className="text-2xl font-black text-white mt-1">₹{agingData.b16_30.amount.toLocaleString('en-IN')}</h4>
              <p className="text-xs text-blue-400 mt-2 font-medium">{agingData.b16_30.count} delivered invoices</p>
            </div>

            <div className="p-4 bg-slate-950 border-l-4 border-l-amber-500 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">31 - 60 DAYS (OVERDUE)</span>
              <h4 className="text-2xl font-black text-amber-400 mt-1">₹{agingData.b31_60.amount.toLocaleString('en-IN')}</h4>
              <p className="text-xs text-amber-400 mt-2 font-medium">{agingData.b31_60.count} delivered invoices</p>
            </div>

            <div className="p-4 bg-slate-950 border-l-4 border-l-red-500 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">60+ DAYS (CRITICAL)</span>
              <h4 className="text-2xl font-black text-red-400 mt-1">₹{agingData.b60_plus.amount.toLocaleString('en-IN')}</h4>
              <p className="text-xs text-red-400 mt-2 font-medium">{agingData.b60_plus.count} critical invoices</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CLIENT LEDGERS */}
      {activeSubTab === 'client-ledgers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" /> Client Financial Ledgers
            </h3>
            <p className="text-xs text-slate-400">Total Booked vs Paid vs Outstanding dues itemized per enterprise client.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">CLIENT NAME</th>
                  <th className="p-3.5">TOTAL BOOKED (DELIVERED)</th>
                  <th className="p-3.5">TOTAL COLLECTED</th>
                  <th className="p-3.5">OUTSTANDING DUES</th>
                  <th className="p-3.5">UPCOMING PIPELINE</th>
                  <th className="p-3.5">DELIVERED TRIPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clientLedgers.map(cl => (
                  <tr key={cl.clientName} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white">{cl.clientName}</td>
                    <td className="p-3.5 font-bold text-blue-400">₹{cl.totalBooked.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-bold text-emerald-400">₹{cl.totalPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-bold text-amber-400">₹{cl.outstandingDues.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-mono text-xs text-purple-400">₹{cl.upcomingPipeline.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-xs text-slate-300">{cl.trips.filter(isDeliveredTrip).length} Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ANALYTICS HUB */}
      {activeSubTab === 'analytics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Revenue &amp; Receivables Analytics
            </h3>
            <p className="text-xs text-slate-400">Visual comparison between Booked Realized Revenue and Upcoming Pipeline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">COLLECTION PERFORMANCE</span>
              <h3 className="text-3xl font-black text-emerald-400">{collectionRate}%</h3>
              <p className="text-xs text-slate-400">
                ₹{totalRevenueCollected.toLocaleString('en-IN')} collected out of ₹{totalBookedRevenue.toLocaleString('en-IN')} booked.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">PIPELINE RATIO</span>
              <h3 className="text-3xl font-black text-purple-400">
                {Math.round((upcomingProjectedTotal / (totalBookedRevenue + upcomingProjectedTotal || 1)) * 100)}%
              </h3>
              <p className="text-xs text-slate-400">
                ₹{upcomingProjectedTotal.toLocaleString('en-IN')} upcoming pipeline awaiting trip completion.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">AVERAGE DSO</span>
              <h3 className="text-3xl font-black text-blue-400">14 Days</h3>
              <p className="text-xs text-slate-400">Days sales outstanding for heavy vehicle cargo fleet.</p>
            </div>
          </div>
        </div>
      )}

      {/* BULK MARK DUE DATE MODAL */}
      {bulkDueDateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Mark Payment Due Date
              </h3>
              <button onClick={() => setBulkDueDateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkUpdateDueDate} className="space-y-4 text-sm">
              <p className="text-xs text-slate-400">
                Updating payment due date for <b>{selectedIds.length}</b> selected delivered request(s).
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Payment Due Date</label>
                <input
                  type="date"
                  value={bulkDueDateInput}
                  onChange={e => setBulkDueDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setBulkDueDateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30">
                  Save Due Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PAYMENT REQUEST MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Create Payment Request
              </h3>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trip / Reference Number</label>
                <input type="text" value={reqTripNumber} onChange={e => setReqTripNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Company Name</label>
                <input type="text" value={reqClient} onChange={e => setReqClient(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Amount (₹)</label>
                  <input type="number" value={reqAmount} onChange={e => setReqAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Due Date</label>
                  <input type="date" value={reqDueDate} onChange={e => setReqDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Status (Strict Accounting)</label>
                <select value={reqStatus} onChange={e => setReqStatus(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium">
                  <option value="Delivered">Delivered (Realized Work • Counts as Booked Revenue &amp; Due)</option>
                  <option value="Completed">Completed (Realized Work • Counts as Booked Revenue &amp; Due)</option>
                  <option value="Scheduled">Scheduled (Upcoming Pipeline • Excluded from Dues)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30">
                  Save Payment Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIP DETAILS & INVOICE PREVIEW MODAL */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Invoice Receipt: {selectedTripDetails.trip_number}
                </h3>
                <span className="text-xs text-slate-400">Date: {selectedTripDetails.start_date}</span>
              </div>
              <button onClick={() => setSelectedTripDetails(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Client:</span>
                <span className="font-bold text-white">{selectedTripDetails.client_name}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Route:</span>
                <span className="font-bold text-white">{selectedTripDetails.origin} &rarr; {selectedTripDetails.destination}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-mono text-white">{selectedTripDetails.truck_number} ({selectedTripDetails.driver_name})</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Freight Revenue:</span>
                <span className="font-mono font-bold text-emerald-400 text-lg">₹{selectedTripDetails.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold uppercase text-amber-400">{selectedTripDetails.clientPaymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setSelectedTripDetails(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
