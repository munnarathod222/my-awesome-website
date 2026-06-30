import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Truck, ChevronDown, ChevronUp, RefreshCw, 
  IndianRupee, Percent, BarChart3, Receipt, Settings, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const DrillDownPLMatrix = () => {
  const [activeView, setActiveView] = useState('fleet'); // 'fleet' or 'truck'
  const [trucks, setTrucks] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('all');
  const [plMatrix, setPLMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  // Format currency in Indian Rupees format (INR)
  const formatCurrency = (val) => {
    const absVal = Math.abs(val || 0);
    const formatted = new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(absVal);
    return val < 0 ? `-${formatted}` : formatted;
  };

  // Fetch all trucks for the selector
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const records = await pb.collection('trucks').getFullList({ 
          sort: 'truck_number', 
          $autoCancel: false 
        });
        setTrucks(records);
        if (records.length > 0 && selectedTruckId === 'all') {
          // Default to first truck when switching to truck-by-truck view
          setSelectedTruckId(records[0].id);
        }
      } catch (err) {
        console.error('Failed to load trucks:', err);
      }
    };
    fetchTrucks();
  }, [activeView]);

  // Fetch P&L Matrix data
  const fetchPLData = async () => {
    setLoading(true);
    try {
      const vehicleParam = activeView === 'truck' ? selectedTruckId : 'all';
      const response = await apiServerClient.fetch(`/analytics/pl-matrix?vehicleId=${vehicleParam}`);
      if (!response.ok) throw new Error('API server returned error');
      
      const data = await response.json();
      if (data.success) {
        setPLMatrix(data.matrix);
      } else {
        throw new Error(data.error || 'Failed to fetch matrix');
      }
    } catch (err) {
      console.error('Error fetching P&L Matrix:', err);
      toast.error('Failed to fetch P&L Matrix data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLData();
  }, [activeView, selectedTruckId]);

  // Toggle expanding a row
  const toggleRow = (month) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  // Calculate aggregated stats over the current matrix
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    
    plMatrix.forEach(row => {
      totalRevenue += Number(row.revenue) || 0;
      totalExpenses += Number(row.expenses?.total) || 0;
    });

    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: netProfit,
      margin: margin
    };
  }, [plMatrix]);

  // Get selected truck info
  const selectedTruckName = useMemo(() => {
    if (activeView === 'fleet') return 'All Fleet Operations';
    const truck = trucks.find(t => t.id === selectedTruckId);
    return truck ? `${truck.truck_number} (${truck.truck_name || 'Generic'})` : 'Selected Truck';
  }, [activeView, selectedTruckId, trucks]);

  return (
    <>
      <Helmet>
        <title>Drill-Down P&L Matrix | Jai Bhavani Cargo</title>
      </Helmet>
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              P&L Matrix
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-xl">
              Advanced drill-down Profit & Loss overview grouping operational revenues against core fleet expense cohorts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* View Selector Toggles */}
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-inner shrink-0">
              <button
                onClick={() => {
                  setActiveView('fleet');
                  setExpandedMonths(new Set());
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeView === 'fleet'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fleet Overview
              </button>
              <button
                onClick={() => {
                  setActiveView('truck');
                  setExpandedMonths(new Set());
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeView === 'truck'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Truck-by-Truck Analysis
              </button>
            </div>

            {/* Truck Dropdown Selector */}
            {activeView === 'truck' && (
              <div className="w-[180px]">
                <Select value={selectedTruckId} onValueChange={(val) => {
                  setSelectedTruckId(val);
                  setExpandedMonths(new Set());
                }}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl h-10">
                    <SelectValue placeholder="Select Truck" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    {trucks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.truck_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              size="icon" 
              variant="outline" 
              onClick={fetchPLData} 
              disabled={loading}
              className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white rounded-xl h-10 w-10 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <LoadingSpinner text={`Aggregating P&L Matrix for ${activeView === 'fleet' ? 'Fleet' : 'selected truck'}...`} />
          </div>
        ) : (
          <>
            {/* Summary Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900 border-slate-800/80 shadow-lg backdrop-blur-md rounded-2xl relative overflow-hidden">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-2 tabular-nums text-blue-400">
                        {formatCurrency(stats.revenue)}
                      </h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <IndianRupee className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-4">Calculated from completed shipments</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800/80 shadow-lg backdrop-blur-md rounded-2xl relative overflow-hidden">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                      <h3 className="text-2xl font-bold mt-2 tabular-nums text-slate-300">
                        {formatCurrency(stats.expenses)}
                      </h3>
                    </div>
                    <div className="p-2 bg-slate-500/10 rounded-xl border border-slate-500/20">
                      <Receipt className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-4">Includes fuel, salary, fastag, EMIs & maintenance</div>
                </CardContent>
              </Card>

              <Card className={`bg-slate-900 border-slate-800/80 shadow-lg backdrop-blur-md rounded-2xl relative overflow-hidden ring-1 ${stats.profit >= 0 ? 'ring-emerald-500/10' : 'ring-red-500/10'}`}>
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit</p>
                      <h3 className={`text-2xl font-bold mt-2 tabular-nums ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(stats.profit)}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      stats.profit >= 0 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      {stats.profit >= 0 
                        ? <TrendingUp className="w-5 h-5 text-emerald-400" /> 
                        : <TrendingDown className="w-5 h-5 text-red-400" />
                      }
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-4">
                    {stats.profit >= 0 ? 'Positive net margins' : 'Deficit operation margins'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800/80 shadow-lg backdrop-blur-md rounded-2xl relative overflow-hidden">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit Margin</p>
                      <h3 className={`text-2xl font-bold mt-2 tabular-nums ${stats.margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats.margin.toFixed(1)}%
                      </h3>
                    </div>
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <Percent className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-4">Ratio of net profit to total revenue</div>
                </CardContent>
              </Card>
            </div>

            {/* P&L Matrix Table */}
            <Card className="border-slate-800 bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span>Monthly Breakdown Matrix</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    Analyzing active segments for: <strong className="text-slate-300 font-semibold">{selectedTruckName}</strong>
                  </CardDescription>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-slate-950/60 sticky top-0 border-b border-slate-800">
                    <TableRow className="hover:bg-transparent border-b-slate-800">
                      <TableHead className="font-semibold text-slate-300 w-[50px]"></TableHead>
                      <TableHead className="font-semibold text-slate-300">Month</TableHead>
                      <TableHead className="font-semibold text-slate-300 text-right">Total Revenue</TableHead>
                      <TableHead className="font-semibold text-slate-300 text-right">Total Expenses</TableHead>
                      <TableHead className="font-semibold text-slate-300 text-right">Net Profit</TableHead>
                      <TableHead className="font-semibold text-slate-300 text-right pr-6 w-[180px]">Disclose Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plMatrix.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-base font-semibold">No P&L logs compiled</p>
                            <p className="text-xs mt-1">There are no matching completed trips or expenses recorded in this period.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      plMatrix.map(row => {
                        const isExpanded = expandedMonths.has(row.month);
                        const isProfitPositive = row.netProfit >= 0;
                        
                        // Parse Month label (e.g. "2026-06" -> "June 2026")
                        let displayMonth = row.month;
                        try {
                          const [y, m] = row.month.split('-').map(Number);
                          displayMonth = new Date(y, m - 1, 1).toLocaleString('en-IN', { 
                            month: 'long', 
                            year: 'numeric' 
                          });
                        } catch (e) {}

                        return (
                          <React.Fragment key={row.month}>
                            {/* Main Summary Row */}
                            <TableRow 
                              onClick={() => toggleRow(row.month)}
                              className={`border-b-slate-800/60 cursor-pointer transition-colors duration-200 ${
                                isExpanded ? 'bg-slate-800/30' : 'hover:bg-slate-800/10'
                              }`}
                            >
                              <TableCell className="pl-4">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                                )}
                              </TableCell>
                              <TableCell className="font-bold text-sm text-slate-200">
                                {displayMonth}
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm tabular-nums text-slate-100">
                                {formatCurrency(row.revenue)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-sm tabular-nums text-slate-300">
                                {formatCurrency(row.expenses?.total)}
                              </TableCell>
                              <TableCell className={`text-right font-bold text-sm tabular-nums ${
                                isProfitPositive ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(row.netProfit)}
                              </TableCell>
                              <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRow(row.month)}
                                  className="text-slate-400 hover:text-white hover:bg-slate-800/60 gap-1 text-xs"
                                >
                                  <span>{isExpanded ? 'Hide' : 'Expenses'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </Button>
                              </TableCell>
                            </TableRow>

                            {/* Progressive Disclosure Expandable Row */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <TableRow className="hover:bg-transparent border-b-slate-800/60">
                                  <TableCell colSpan={6} className="p-0">
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                                      className="overflow-hidden bg-slate-950/40 border-l-2 border-blue-500/80 px-6 py-4"
                                    >
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fuel & FASTag</p>
                                          <p className="text-base font-bold mt-2 tabular-nums text-slate-100">
                                            {formatCurrency(row.expenses?.fuelFastag)}
                                          </p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Driver Salary & Adv</p>
                                          <p className="text-base font-bold mt-2 tabular-nums text-slate-100">
                                            {formatCurrency(row.expenses?.salaryAdvance)}
                                          </p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Maintenance</p>
                                          <p className="text-base font-bold mt-2 tabular-nums text-slate-100">
                                            {formatCurrency(row.expenses?.maintenance)}
                                          </p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fixed EMI</p>
                                          <p className="text-base font-bold mt-2 tabular-nums text-slate-100">
                                            {formatCurrency(row.expenses?.fixedEmi)}
                                          </p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 col-span-2 md:col-span-1">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Other Expenses</p>
                                          <p className="text-base font-bold mt-2 tabular-nums text-slate-300">
                                            {formatCurrency(row.expenses?.other)}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default DrillDownPLMatrix;