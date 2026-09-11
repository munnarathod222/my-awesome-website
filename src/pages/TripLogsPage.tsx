import React, { useState, useEffect } from 'react';
import { Truck, Plus, CheckCircle, AlertCircle, Filter, ArrowUpRight, FileCheck, Edit, ShieldCheck, X } from 'lucide-react';
import { dbtabeses } from '../db/store';
import { cashbookService } from '../services/cashbookService';
import { TripLog, Truck as TruckType, ClientProfile, Employee } from '../types';

export const TripLogsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripLog[]>(dbtabeses.getTrips());
  const [trucks] = useState<TruckType[]>(dbtabeses.getTrucks());
  const [clients] = useState<ClientProfile[]>(dbtabeses.getClients());
  const [employees] = useState<Employee[]>(dbtabeses.getEmployees());

  const [editTrip, setEditTrip] = useState<TripLog | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [successNotif, setSuccessNotif] = useState('');

  // New trip form state
  const [newTripNumber, setNewTripNumber] = useState(`TRIP-${Math.floor(100 + Math.random() * 900)}`);
  const [newClientName, setNewClientName] = useState('Amazon Logistics India');
  const [newTruckNumber, setNewTruckNumber] = useState('TG12U2637');
  const [newDriverName, setNewDriverName] = useState('Vinod Kumar Rathod');
  const [newOrigin, setNewOrigin] = useState('Hyderabad');
  const [newDestination, setNewDestination] = useState('Warangal');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newDistanceKms, setNewDistanceKms] = useState(150);
  const [newRevenue, setNewRevenue] = useState(7100);
  const [newStatus, setNewStatus] = useState<'Scheduled' | 'In Transit' | 'Delivered' | 'Completed'>('Delivered');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'Pending' | 'Paid' | 'Delayed'>('Pending');

  useEffect(() => {
    const handle = () => setTrips(dbtabeses.getTrips());
    window.addEventListener('jc-store-update', handle);
    return () => window.removeEventListener('jc-store-update', handle);
  }, []);

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTrips = dbtabeses.getTrips();
    
    const createdTrip: TripLog = {
      id: 'trip-' + Date.now(),
      trip_number: newTripNumber,
      truck_id: 'truck-001',
      truck_number: newTruckNumber,
      driver_id: 'emp-001',
      driver_name: newDriverName,
      client_id: 'cli-001',
      client_name: newClientName,
      origin: newOrigin,
      destination: newDestination,
      start_date: newStartDate,
      due_date: newDueDate || newStartDate,
      distance_kms: Number(newDistanceKms),
      revenue: Number(newRevenue),
      fuel_cost: Math.round(Number(newRevenue) * 0.3),
      toll_cost: 550,
      driver_allowance: 1000,
      tyre_depreciation_rate_per_km: 3,
      tyre_depreciation_expense: Number(newDistanceKms) * 3,
      total_expenses: Math.round(Number(newRevenue) * 0.3) + 550 + 1000 + (Number(newDistanceKms) * 3),
      net_profit: Number(newRevenue) - (Math.round(Number(newRevenue) * 0.3) + 550 + 1000 + (Number(newDistanceKms) * 3)),
      status: newStatus,
      clientPaymentStatus: newPaymentStatus,
      requires_pod: true,
      pod_status: newStatus === 'Delivered' || newStatus === 'Completed' ? 'Verified' : 'Pending'
    };

    const updated = [createdTrip, ...currentTrips];
    dbtabeses.setTrips(updated);
    cashbookService.syncTripPaymentIncome(createdTrip);
    
    setAddModal(false);
    setSuccessNotif(`Trip ${newTripNumber} created and saved permanently!`);
    setTimeout(() => setSuccessNotif(''), 3500);

    // Reset Form for next entry
    setNewTripNumber(`TRIP-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTrip) return;
    
    const allTrips = dbtabeses.getTrips();
    const index = allTrips.findIndex(t => t.id === editTrip.id);
    if (index !== -1) {
      allTrips[index] = { ...editTrip };
      dbtabeses.setTrips(allTrips);
      cashbookService.syncTripPaymentIncome(allTrips[index]);
    }
    setEditTrip(null);
    setSuccessNotif(`Trip ${editTrip.trip_number} updated successfully!`);
    setTimeout(() => setSuccessNotif(''), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-orange-400" /> Operational Trip Logs &amp; Scheduler
          </h1>
          <p className="text-sm text-slate-400">Manage fleet dispatch, trip delivery lifecycle, and client payment linkages.</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/30 transition"
        >
          <Plus className="w-4 h-4" /> Create New Trip
        </button>
      </div>

      {successNotif && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl flex items-center gap-2 font-medium text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> {successNotif}
        </div>
      )}

      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <b>Data Security Active:</b> All added trips are saved to persistent store and synced across Analytics &amp; Payment Requests instantly.
          </span>
        </div>
      </div>

      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Trip # &amp; Date</th>
                <th className="p-3.5">Vehicle &amp; Driver</th>
                <th className="p-3.5">Client &amp; Route</th>
                <th className="p-3.5">Distance</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5">Trip Status</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {trips.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <p className="font-bold text-white">{t.trip_number}</p>
                    <p className="text-xs text-slate-400">{t.start_date}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-orange-400">{t.truck_number}</p>
                    <p className="text-xs text-slate-400">{t.driver_name}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-white">{t.client_name}</p>
                    <p className="text-xs text-slate-400">{t.origin} → {t.destination}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{t.distance_kms} KMs</td>
                  <td className="p-3.5 font-bold text-emerald-400">₹{t.revenue.toLocaleString('in-IN')}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${t.status === 'Completed' || t.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (t.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30')}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${t.clientPaymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : (t.clientPaymentStatus === 'Delayed' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400')}`}>
                      {t.clientPaymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setEditTrip(t)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="Edit Trip & Payment Status"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW TRIP MODAL */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-400" /> Create &amp; Log New Fleet Trip
              </h3>
              <button onClick={() => setAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trip Number</label>
                  <input type="text" value={newTripNumber} onChange={e => setNewTripNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name</label>
                  <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Registration #</label>
                  <input type="text" value={newTruckNumber} onChange={e => setNewTruckNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Name</label>
                  <input type="text" value={newDriverName} onChange={e => setNewDriverName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Origin City</label>
                  <input type="text" value={newOrigin} onChange={e => setNewOrigin(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination City</label>
                  <input type="text" value={newDestination} onChange={e => setNewDestination(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dispatch Start Date</label>
                  <input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Due Date</label>
                  <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Distance (KMs)</label>
                  <input type="number" value={newDistanceKms} onChange={e => setNewDistanceKms(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trip Contract Revenue (₹)</label>
                  <input type="number" value={newRevenue} onChange={e => setNewRevenue(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trip Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                    <option value="Delivered">Delivered (Completed Delivery)</option>
                    <option value="Completed">Completed (Verified &amp; Done)</option>
                    <option value="In Transit">In Transit (Upcoming)</option>
                    <option value="Scheduled">Scheduled (Upcoming)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
                  <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value as any)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white">
                    <option value="Pending">Pending Collection</option>
                    <option value="Paid">Paid</option>
                    <option value="Delayed">Delayed / Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30">
                  Save Trip Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TRIP MODAL */}
      {editTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Update Trip &amp; Payment Status <span className="text-orange-400">({editTrip.trip_number})</span></h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Trip Operational Status</label>
                <select
                  value={editTrip.status}
                  onChange={e => setEditTrip({ ...editTrip, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl text-white mb-3"
                >
                  <option value="Scheduled">Scheduled (Upcoming)</option>
                  <option value="In Transit">In Transit (Upcoming)</option>
                  <option value="Delivered">Delivered (Counts towards Dues/Revenue)</option>
                  <option value="Completed">Completed (Counts towards Dues/Revenue)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <label className="block text-sm font-medium text-slate-300 mb-1">Client Payment Status</label>
                <select
                  value={editTrip.clientPaymentStatus}
                  onChange={e => setEditTrip({ ...editTrip, clientPaymentStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditTrip(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};