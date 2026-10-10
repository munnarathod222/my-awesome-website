import React, { useState } from 'react';
import { RefreshCw, Plus, Route as RouteIcon, CheckCircle } from 'lucide-react';
import { dbtabeses } from '../db/store';
import { Route as RouteType, Truck, ClientProfile, Employee } from '../types';

export const RecurringTripsPage: React.FC = () => {
  const [routes] = useState<RouteType[]>(dbtabeses.getRoutes());
  const [trucks] = useState<Truck[]>(dbtabeses.getTrucks());
  const [clients] = useState<ClientProfile[]>(dbtabeses.getClients());
  const [employees] = useState<Employee[]>(dbtabeses.getEmployees());

  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || 'rt-001');
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const trips = dbtabeses.getTrips();
    
    const newTrip: any = {
      id: 'trp-' + Date.now(),
      trip_number: 'TRP-2026-' + Math.floor(1000 + Math.random() * 9000),
      truck_id: trucks[0]?.id || 'truck-001',
      truck_number: trucks[0]?.truck_number || 'TG12U2637',
      driver_id: employees[0]?.id || 'emp-001',
      driver_employee_id: employees[0]?.id || 'emp-001',
      driver_employee_code: (employees[0] as any)?.employee_code || 'D001',
      driver_name: employees[0]?.full_name || 'Vinod Kumar Rathod',
      client_id: clients[0]?.id || 'clt-001',
      client_name: clients[0]?.company_name || 'Mahindra Logistics Ltd',
      route_id: currentRoute?.id,
      route_name: currentRoute?.name,
      origin: currentRoute?.origin || 'Hyderabad',
      destination: currentRoute?.destination || 'Warangal',
      start_date: new Date().toISOString().split('T')[0],
      distance_kms: currentRoute?.distance_kms || 150,
      revenue: currentRoute?.standard_revenue || 7029,
      fuel_cost: 2300,
      toll_cost: 550,
      driver_allowance: 1000,
      tyre_depreciation_rate_per_km: 3,
      tyre_depreciation_expense: 450,
      totalExpenses: 4300,
      netProfit: 2729,
      status: 'In Transit',
      clientPaymentStatus: 'Pending',
      requires_pod: true,
      pod_status: 'Pending'
    };
    
    trips.unshift(newTrip);
    dbtabeses.setTrips(trips);
    setGeneratedSuccess(true);
    setTimeout(() => setGeneratedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <RefreshCw className="w-7 h-7 text-orange-400" /> Batch Recurring Trips Generator
          </h1>
          <p className="text-sm text-slate-400">Pre-filled saved routes (HYD-WAR-01) with standard distances, revenues &amp; alternating daily legs</p>
        </div>
      </div>

      {generatedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Batch recurring trip logged successfully!
        </div>
      )}

      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <RouteIcon className="w-5 h-5 text-orange-400" /> Generate Route Schedule Leg
        </h3>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Select Saved Route Code</label>
            <select
              value={selectedRouteId}
              onChange={e => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl text-white font-bold"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.route_code} - {r.name} ({r.distance_kms} KMs)</option>
              ))}
            </select>
          </div>

          {currentRoute && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Standard Leg Distance:</span> <b className="text-white">{currentRoute.distance_kms} KMs</b></div>
              <div className="flex justify-between"><span className="text-slate-400">Contract Standard Revenue:</span> <b className="text-emerald-400">₹{currentRoute.standard_revenue.toLocaleString('in-IN')}</b></div>
              <div className="flex justify-between"><span className="text-slate-400">Estimated Fuel Volume:</span> <b className="text-orange-400">{currentRoute.fuel_estimate_liters} Liters</b></div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
          >
            <Plus className="w-5 h-5" /> Dispatch Recurring Trip Leg Now
          </button>
        </form>
      </div>
    </div>
  );
};