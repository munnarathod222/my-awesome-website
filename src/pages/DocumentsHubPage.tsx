import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  FileCheck,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Share2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  Building,
  RotateCcw,
  ShieldCheck,
  Camera,
  History,
  TrendingUp,
  X
} from 'lucide-react';
import { dbtabeses } from '../db/store';
import { LorryReceipt, PodRecord, TripLog, ClientProfile, Truck as TruckType } from '../types';
import { LorryReceiptViewModal } from '../components/documents/LorryReceiptViewModal';
import { LorryReceiptFormModal } from '../components/documents/LorryReceiptFormModal';
import { PodViewModal } from '../components/documents/PodViewModal';
import { DriverPodCaptureModal } from '../components/documents/DriverPodCaptureModal';
import { DocumentAuditModal } from '../components/documents/DocumentAuditModal';

export const DocumentsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lr' | 'pod'>('lr');

  const [lrs, setLrs] = useState<LorryReceipt[]>(dbtabeses.getLorryReceipts());
  const [pods, setPods] = useState<PodRecord[]>(dbtabeses.getPodRecords());
  const [clients] = useState<ClientProfile[]>(dbtabeses.getClients());
  const [trucks] = useState<TruckType[]>(dbtabeses.getTrucks());

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedLrStatus, setSelectedLrStatus] = useState('All');
  const [selectedPodStatus, setSelectedPodStatus] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modals state
  const [viewingLr, setViewingLr] = useState<LorryReceipt | null>(null);
  const [editingLr, setEditingLr] = useState<LorryReceipt | null>(null);
  const [isCreatingLr, setIsCreatingLr] = useState(false);

  const [viewingPod, setViewingPod] = useState<PodRecord | null>(null);
  const [isCapturingPod, setIsCapturingPod] = useState(false);
  const [podTargetLr, setPodTargetLr] = useState<LorryReceipt | null>(null);

  const [auditTarget, setAuditTarget] = useState<{ id: string; number: string; type: 'LR' | 'POD' } | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const reloadData = () => {
    setLrs(dbtabeses.getLorryReceipts());
    setPods(dbtabeses.getPodRecords());
  };

  useEffect(() => {
    window.addEventListener('jc-store-update', reloadData);
    return () => window.removeEventListener('jc-store-update', reloadData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics
  const totalLrs = lrs.length;
  const generatedLrs = lrs.filter(l => l.status === 'Generated').length;
  const totalPods = pods.length;
  const fullDeliveredPods = pods.filter(p => p.delivery_status === 'Delivered in Full').length;
  const pendingPodsCount = lrs.filter(l => l.status === 'Generated' && !l.pod_id).length;

  // Filtered LRs
  const filteredLrs = useMemo(() => {
    return lrs.filter((lr) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          lr.lr_number.toLowerCase().includes(q) ||
          lr.trip_number.toLowerCase().includes(q) ||
          (lr.eway_bill_number || '').toLowerCase().includes(q) ||
          (lr.invoice_number || '').toLowerCase().includes(q) ||
          lr.client_name.toLowerCase().includes(q) ||
          lr.consignor.name.toLowerCase().includes(q) ||
          lr.consignee.name.toLowerCase().includes(q) ||
          lr.vehicle_details.vehicle_number.toLowerCase().includes(q) ||
          lr.vehicle_details.driver_name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Client filter
      if (selectedClient !== 'All' && lr.client_name !== selectedClient) {
        return false;
      }

      // Vehicle filter
      if (selectedVehicle !== 'All' && lr.vehicle_details.vehicle_number !== selectedVehicle) {
        return false;
      }

      // Status filter
      if (selectedLrStatus !== 'All' && lr.status !== selectedLrStatus) {
        return false;
      }

      // Date range filter
      if (startDateFilter && lr.lr_date < startDateFilter) return false;
      if (endDateFilter && lr.lr_date > endDateFilter) return false;

      return true;
    });
  }, [lrs, searchQuery, selectedClient, selectedVehicle, selectedLrStatus, startDateFilter, endDateFilter]);

  // Filtered PODs
  const filteredPods = useMemo(() => {
    return pods.filter((pod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          pod.pod_number.toLowerCase().includes(q) ||
          pod.lr_number.toLowerCase().includes(q) ||
          pod.trip_number.toLowerCase().includes(q) ||
          pod.client_name.toLowerCase().includes(q) ||
          pod.consignee_name.toLowerCase().includes(q) ||
          pod.receiver_name.toLowerCase().includes(q) ||
          pod.vehicle_number.toLowerCase().includes(q) ||
          pod.driver_name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedClient !== 'All' && pod.client_name !== selectedClient) return false;
      if (selectedVehicle !== 'All' && pod.vehicle_number !== selectedVehicle) return false;
      if (selectedPodStatus !== 'All' && pod.delivery_status !== selectedPodStatus) return false;
      if (startDateFilter && pod.delivery_date < startDateFilter) return false;
      if (endDateFilter && pod.delivery_date > endDateFilter) return false;

      return true;
    });
  }, [pods, searchQuery, selectedClient, selectedVehicle, selectedPodStatus, startDateFilter, endDateFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClient('All');
    setSelectedVehicle('All');
    setSelectedLrStatus('All');
    setSelectedPodStatus('All');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 bg-emerald-950 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-orange-400" /> Documents &bull; LR &amp; POD Manager
          </h1>
          <p className="text-sm text-slate-400">
            Jai Bhavani Cargo &bull; Official A4 Lorry Receipts, Proof of Delivery (POD) &amp; Consignment Tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPodTargetLr(null);
              setIsCapturingPod(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Capture POD</span>
          </button>

          <button
            onClick={() => {
              setEditingLr(null);
              setIsCreatingLr(true);
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-950/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate LR</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Lorry Receipts</span>
            <FileText className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">{totalLrs}</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-0.5 block">{generatedLrs} Official Active LRs</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending PODs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1.5 font-mono">{pendingPodsCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting Destination Sign</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Archived PODs</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1.5 font-mono">{totalPods}</p>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">{fullDeliveredPods} Delivered in Full</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Engine</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>QR Scanner Ready</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Encrypted Public Tokens</span>
        </div>
      </div>

      {/* Main Tabs & Filters Card */}
      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            onClick={() => setActiveTab('lr')}
            className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'lr'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lorry Receipts / Consignment Notes ({filteredLrs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pod')}
            className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'pod'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Proof of Delivery (POD) Archive ({filteredPods.length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search number, trip, client, truck..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            >
              <option value="All">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.company_name}>
                  {c.company_name}
                </option>
              ))}
            </select>

            {/* Vehicle Filter */}
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
            >
              <option value="All">All Vehicles</option>
              {trucks.map((trk) => (
                <option key={trk.id} value={trk.truck_number}>
                  {trk.truck_number} ({trk.model})
                </option>
              ))}
            </select>

            {/* Status Filter based on active tab */}
            {activeTab === 'lr' ? (
              <select
                value={selectedLrStatus}
                onChange={(e) => setSelectedLrStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="All">All LR Statuses</option>
                <option value="Generated">Generated (Active)</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            ) : (
              <select
                value={selectedPodStatus}
                onChange={(e) => setSelectedPodStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="All">All Delivery Statuses</option>
                <option value="Delivered in Full">Delivered in Full</option>
                <option value="Partial Delivery">Partial Delivery</option>
                <option value="Short Delivery">Short Delivery</option>
                <option value="Damaged">Damaged</option>
                <option value="Delivery Refused">Delivery Refused</option>
              </select>
            )}
          </div>

          {/* Date Range & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-semibold">Date Range:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
              <span>to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>

        {/* TAB 1: LORRY RECEIPTS TABLE */}
        {activeTab === 'lr' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">LR # &amp; Date</th>
                  <th className="p-3.5">Trip &amp; Client</th>
                  <th className="p-3.5">Consignor ➔ Consignee</th>
                  <th className="p-3.5">Vehicle &amp; Driver</th>
                  <th className="p-3.5">Freight &amp; Terms</th>
                  <th className="p-3.5">LR Status</th>
                  <th className="p-3.5">POD Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLrs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No Lorry Receipts found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLrs.map((lr) => (
                    <tr key={lr.id} className="hover:bg-slate-800/40 transition">
                      {/* LR # & Date */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-white block text-sm">{lr.lr_number}</span>
                        <span className="text-[10px] text-slate-400">{lr.lr_date}</span>
                        {lr.eway_bill_number && (
                          <span className="text-[9px] font-mono text-slate-500 block">E-Way: {lr.eway_bill_number}</span>
                        )}
                      </td>

                      {/* Trip & Client */}
                      <td className="p-3.5">
                        <span className="font-semibold text-orange-400 block">{lr.trip_number}</span>
                        <span className="text-slate-300 text-[11px]">{lr.client_name}</span>
                      </td>

                      {/* Consignor -> Consignee */}
                      <td className="p-3.5 max-w-[200px]">
                        <span className="font-medium text-slate-200 truncate block">{lr.consignor.name}</span>
                        <span className="text-[10px] text-slate-400 truncate block">➔ {lr.consignee.name}</span>
                        <span className="text-[9px] text-slate-500 block font-mono">
                          {lr.route_details.origin} to {lr.route_details.destination}
                        </span>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-white block">{lr.vehicle_details.vehicle_number}</span>
                        <span className="text-[11px] text-slate-400">{lr.vehicle_details.driver_name}</span>
                      </td>

                      {/* Freight */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-400 block">
                          ₹{Number(lr.freight_details.total_freight || 0).toLocaleString('in-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">{lr.freight_details.payment_basis}</span>
                      </td>

                      {/* LR Status */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          lr.status === 'Generated' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          lr.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {lr.status}
                        </span>
                      </td>

                      {/* POD Status */}
                      <td className="p-3.5">
                        {lr.pod_id ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {lr.pod_status || 'Archived'}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setPodTargetLr(lr);
                              setIsCapturingPod(true);
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" /> Capture POD
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingLr(lr)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                            title="Preview / Print A4 Lorry Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {lr.status !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                setEditingLr(lr);
                                setIsCreatingLr(true);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                              title="Edit Lorry Receipt"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setAuditTarget({ id: lr.id, number: lr.lr_number, type: 'LR' })}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition"
                            title="Audit History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PROOF OF DELIVERY (POD) TABLE */}
        {activeTab === 'pod' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">POD # &amp; Delivery Date</th>
                  <th className="p-3.5">LR # &amp; Trip</th>
                  <th className="p-3.5">Client &amp; Consignee</th>
                  <th className="p-3.5">Vehicle &amp; Driver</th>
                  <th className="p-3.5">Delivery Status</th>
                  <th className="p-3.5">Receiver Particulars</th>
                  <th className="p-3.5">Attachments</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPods.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No Proof of Delivery (POD) records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPods.map((pod) => (
                    <tr key={pod.id} className="hover:bg-slate-800/40 transition">
                      {/* POD # & Date */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-white block text-sm text-emerald-400">
                          {pod.pod_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {pod.delivery_date} at {pod.delivery_time}
                        </span>
                      </td>

                      {/* LR # & Trip */}
                      <td className="p-3.5">
                        <span className="font-mono font-semibold text-slate-200 block">{pod.lr_number}</span>
                        <span className="text-[10px] text-orange-400 font-bold">{pod.trip_number}</span>
                      </td>

                      {/* Client & Consignee */}
                      <td className="p-3.5 max-w-[200px]">
                        <span className="font-bold text-white truncate block">{pod.client_name}</span>
                        <span className="text-[10px] text-slate-400 truncate block">➔ {pod.consignee_name}</span>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-200 block">{pod.vehicle_number}</span>
                        <span className="text-[10px] text-slate-400">{pod.driver_name}</span>
                      </td>

                      {/* Delivery Status */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          pod.delivery_status === 'Delivered in Full'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {pod.delivery_status}
                        </span>
                      </td>

                      {/* Receiver Particulars */}
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{pod.receiver_name}</span>
                        <span className="text-[10px] text-slate-400">{pod.receiver_designation}</span>
                        {pod.receiver_signature_url && (
                          <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">● Touch Signed</span>
                        )}
                      </td>

                      {/* Attachments */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">
                          {(pod.attachments || []).length} Document(s)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingPod(pod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                            title="View / Print Official POD"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setAuditTarget({ id: pod.id, number: pod.pod_number, type: 'POD' })}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition"
                            title="Audit Trail"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: LR Preview Modal */}
      {viewingLr && (
        <LorryReceiptViewModal
          lr={viewingLr}
          isOpen={!!viewingLr}
          onClose={() => setViewingLr(null)}
          onEdit={(targetLr) => {
            setViewingLr(null);
            setEditingLr(targetLr);
            setIsCreatingLr(true);
          }}
          onGeneratePod={(targetLr) => {
            setViewingLr(null);
            setPodTargetLr(targetLr);
            setIsCapturingPod(true);
          }}
          onViewAudit={(targetLr) => {
            setAuditTarget({ id: targetLr.id, number: targetLr.lr_number, type: 'LR' });
          }}
          onStatusChange={(updated) => {
            setViewingLr(updated);
            reloadData();
            showToast(`LR ${updated.lr_number} status updated to ${updated.status}`);
          }}
        />
      )}

      {/* MODAL 2: LR Form (Create / Edit) Modal */}
      {isCreatingLr && (
        <LorryReceiptFormModal
          isOpen={isCreatingLr}
          onClose={() => {
            setIsCreatingLr(false);
            setEditingLr(null);
          }}
          existingLr={editingLr}
          onSuccess={(savedLr) => {
            reloadData();
            showToast(`Lorry Receipt ${savedLr.lr_number} saved successfully!`);
          }}
        />
      )}

      {/* MODAL 3: POD View Modal */}
      {viewingPod && (
        <PodViewModal
          pod={viewingPod}
          isOpen={!!viewingPod}
          onClose={() => setViewingPod(null)}
          onViewAudit={(targetPod) => {
            setAuditTarget({ id: targetPod.id, number: targetPod.pod_number, type: 'POD' });
          }}
        />
      )}

      {/* MODAL 4: Driver POD Capture Modal */}
      {isCapturingPod && (
        <DriverPodCaptureModal
          isOpen={isCapturingPod}
          onClose={() => {
            setIsCapturingPod(false);
            setPodTargetLr(null);
          }}
          lr={podTargetLr}
          onSuccess={(newPod) => {
            reloadData();
            showToast(`Proof of Delivery ${newPod.pod_number} created & verified!`);
          }}
        />
      )}

      {/* MODAL 5: Document Audit Modal */}
      {auditTarget && (
        <DocumentAuditModal
          isOpen={!!auditTarget}
          onClose={() => setAuditTarget(null)}
          documentId={auditTarget.id}
          documentNumber={auditTarget.number}
          documentType={auditTarget.type}
        />
      )}
    </div>
  );
};
