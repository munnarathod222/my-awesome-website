import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Wrench, ShieldAlert, ClipboardList, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';

import AddMaintenanceLogModal from '@/components/AddMaintenanceLogModal.jsx';
import AddMaintenanceReminderModal from '@/components/AddMaintenanceReminderModal.jsx';
import AddPartsInstalledModal from '@/components/AddPartsInstalledModal.jsx';
import AddMaintenanceProblemModal from '@/components/AddMaintenanceProblemModal.jsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function MaintenanceDashboard({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    overdue: 0,
    upcoming: 0,
    completed: 0,
    totalCost: 0
  });
  const [typeData, setTypeData] = useState([]);
  const [costData, setCostData] = useState([]);

  // Modal State
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showAddPartsModal, setShowAddPartsModal] = useState(false);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const schedules = await pb.collection('maintenance_schedules').getFullList({ $autoCancel: false });
      const records = await pb.collection('maintenance_records').getFullList({ $autoCancel: false });

      // Calculate Stats
      const now = new Date();
      let due = 0;
      let overdue = 0;
      let upcoming = 0;
      let completed = 0;

      const typeCountMap = {};

      schedules.forEach(sch => {
        const nextDate = new Date(sch.next_maintenance_date);
        const type = sch.maintenance_type;
        
        typeCountMap[type] = (typeCountMap[type] || 0) + 1;

        if (sch.status === 'Completed') {
          completed++;
        } else if (sch.status === 'Overdue' || (nextDate < now && sch.status !== 'Completed')) {
          overdue++;
        } else if (sch.status === 'Due') {
          due++;
        } else {
          upcoming++;
        }
      });

      const totalCost = records.reduce((sum, rec) => sum + (rec.actual_cost || 0), 0);

      setStats({
        total: schedules.length,
        due,
        overdue,
        upcoming,
        completed,
        totalCost
      });

      // Prepare Type Data for Bar Chart
      const formattedTypeData = Object.keys(typeCountMap).map(key => ({
        name: key,
        count: typeCountMap[key]
      })).sort((a, b) => b.count - a.count).slice(0, 5);
      
      setTypeData(formattedTypeData);

      // Prepare Cost Data for Pie Chart (by type)
      const costMap = {};
      records.forEach(rec => {
        const sch = schedules.find(s => s.id === rec.maintenance_schedule_id);
        if (sch && rec.actual_cost) {
          costMap[sch.maintenance_type] = (costMap[sch.maintenance_type] || 0) + rec.actual_cost;
        }
      });

      const formattedCostData = Object.keys(costMap).map(key => ({
        name: key,
        value: costMap[key]
      })).sort((a, b) => b.value - a.value);

      setCostData(formattedCostData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading dashboard metrics...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        <div className="mr-auto">
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Log operations and track issues</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddLogModal(true)} variant="outline" className="rounded-lg shadow-sm bg-card hover:bg-muted">
            <ClipboardList className="w-4 h-4 mr-2 text-primary" /> Add Log
          </Button>
          <Button onClick={() => setShowAddReminderModal(true)} variant="outline" className="rounded-lg shadow-sm bg-card hover:bg-muted">
            <Bell className="w-4 h-4 mr-2 text-warning" /> Add Reminder
          </Button>
          <Button onClick={() => setShowAddPartsModal(true)} variant="outline" className="rounded-lg shadow-sm bg-card hover:bg-muted">
            <Wrench className="w-4 h-4 mr-2 text-blue-500" /> Add Part
          </Button>
          <Button onClick={() => setShowAddProblemModal(true)} variant="outline" className="rounded-lg shadow-sm bg-card border-destructive/20 hover:bg-destructive/10 text-destructive">
            <AlertTriangle className="w-4 h-4 mr-2" /> Report Problems
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-destructive/30 shadow-sm relative overflow-hidden bg-destructive/5">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-destructive opacity-50" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-destructive">Action Required</p>
            <div className="flex items-end gap-2 mt-2">
              <h3 className="text-4xl font-extrabold text-foreground">{stats.overdue + stats.due}</h3>
              <span className="text-sm text-muted-foreground mb-1">tasks</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.overdue} overdue, {stats.due} due now
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Tasks</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stats.upcoming}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completed</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stats.completed}</h3>
              </div>
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-muted/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spend (YTD)</p>
                <h3 className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                  ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="p-2 bg-accent rounded-lg">
                <Wrench className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tasks by Maintenance Type</CardTitle>
            <CardDescription>Most frequent service requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
            <CardDescription>Spend distribution across service types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {costData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No cost data recorded yet
                </div>
              )}
            </div>
            {/* Custom Legend */}
            {costData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {costData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddMaintenanceLogModal 
        isOpen={showAddLogModal} 
        onClose={() => setShowAddLogModal(false)} 
        onSuccess={fetchDashboardData} 
      />
      <AddMaintenanceReminderModal 
        isOpen={showAddReminderModal} 
        onClose={() => setShowAddReminderModal(false)} 
        onSuccess={fetchDashboardData} 
      />
      <AddPartsInstalledModal 
        isOpen={showAddPartsModal} 
        onClose={() => setShowAddPartsModal(false)} 
        onSuccess={fetchDashboardData} 
      />
      <AddMaintenanceProblemModal 
        isOpen={showAddProblemModal} 
        onClose={() => setShowAddProblemModal(false)} 
        onSuccess={fetchDashboardData} 
      />
    </div>
  );
}