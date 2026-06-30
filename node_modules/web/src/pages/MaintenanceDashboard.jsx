import React from 'react';
import { useMaintenanceData } from '@/hooks/useMaintenanceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Bell, AlertTriangle, Wrench } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

export default function MaintenanceDashboard() {
  const { data: logs, loading: logsLoading } = useMaintenanceData('maintenance_logs');
  const { data: reminders, loading: remLoading } = useMaintenanceData('maintenance_reminders');
  const { data: problems, loading: probLoading } = useMaintenanceData('maintenance_problems');
  const { data: parts, loading: partsLoading } = useMaintenanceData('parts_installed');

  const loading = logsLoading || remLoading || probLoading || partsLoading;

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

  const pendingReminders = reminders.filter(r => r.status === 'Pending' || r.status === 'Overdue');
  const activeProblems = problems.filter(p => p.status === 'Open' || p.status === 'In Progress');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Maintenance Overview</h1>
        <p className="text-muted-foreground mt-1">Quick snapshot of your fleet's maintenance status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reminders</CardTitle>
            <Bell className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingReminders.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Problems</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProblems.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parts Tracked</CardTitle>
            <Wrench className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">{log.category}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-mono">{log.truck_id}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No recent logs.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Active Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProblems.slice(0, 5).map(prob => (
                <div key={prob.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{prob.description}</p>
                    <p className="text-xs text-muted-foreground">{prob.category}</p>
                  </div>
                  <StatusBadge status={prob.severity} type="severity" />
                </div>
              ))}
              {activeProblems.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active problems.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}