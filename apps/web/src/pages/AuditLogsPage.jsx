import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Shield, ShieldAlert, ShieldCheck, Search, Filter, Download, FileText, Table as TableIcon, RefreshCw, UserCheck, Clock, Layers, Lock, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { getLocalAuditLogs } from '@/lib/auditLogger.js';
import { downloadFile, generatePDF, generateExcel } from '@/lib/downloadUtils.js';
import { cn } from '@/lib/utils.js';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DELETE: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  STATUS_CHANGE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  PAYMENT_MARKED: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Load local logs first
      const localLogs = getLocalAuditLogs();
      
      // 2. Fetch remote PocketBase audit_logs if available
      let remoteLogs = [];
      try {
        remoteLogs = await pb.collection('audit_logs').getFullList({
          sort: '-created',
          $autoCancel: false
        });
      } catch (e) {}

      // 3. Merge & deduplicate
      const map = new Map();
      localLogs.forEach(l => map.set(l.id || l.timestamp, l));
      remoteLogs.forEach(r => {
        const id = r.id || r.created;
        if (!map.has(id)) {
          map.set(id, {
            id: r.id,
            action: r.action,
            module: r.module,
            record_id: r.record_id,
            details: r.details,
            performed_by_name: r.performed_by_name || 'System User',
            performed_by_email: r.performed_by_email || '',
            performed_by_role: r.performed_by_role || 'Operator',
            timestamp: r.timestamp || r.created
          });
        }
      });

      const combined = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setLogs(combined);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    window.addEventListener('audit_logged', fetchLogs);
    return () => {
      window.removeEventListener('audit_logged', fetchLogs);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchModule = moduleFilter === 'all' || l.module?.toLowerCase() === moduleFilter.toLowerCase();
      const matchAction = actionFilter === 'all' || l.action?.toUpperCase() === actionFilter.toUpperCase();
      const term = search.toLowerCase();
      const matchSearch = !term || (
        (l.performed_by_name || '').toLowerCase().includes(term) ||
        (l.performed_by_email || '').toLowerCase().includes(term) ||
        (l.details || '').toLowerCase().includes(term) ||
        (l.record_id || '').toLowerCase().includes(term) ||
        (l.module || '').toLowerCase().includes(term)
      );
      return matchModule && matchAction && matchSearch;
    });
  }, [logs, search, moduleFilter, actionFilter]);

  const kpis = useMemo(() => {
    const total = logs.length;
    const deletions = logs.filter(l => l.action === 'DELETE' || l.action === 'UPDATE').length;
    const uniqueUsers = new Set(logs.map(l => l.performed_by_email || l.performed_by_name)).size;
    const latestTime = logs[0]?.timestamp ? format(new Date(logs[0].timestamp), 'dd MMM yyyy, hh:mm a') : 'No actions yet';
    return { total, deletions, uniqueUsers, latestTime };
  }, [logs]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const data = filteredLogs.map(l => ({
        'Timestamp': l.timestamp ? format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss') : '',
        'Operator': `${l.performed_by_name} (${l.performed_by_role})`,
        'Action': l.action,
        'Module': l.module,
        'Record ID': l.record_id,
        'Details': l.details
      }));
      const columns = [
        { header: 'Timestamp', key: 'Timestamp' },
        { header: 'Operator', key: 'Operator' },
        { header: 'Action', key: 'Action' },
        { header: 'Module', key: 'Module' },
        { header: 'Record ID', key: 'Record ID' },
        { header: 'Details', key: 'Details' }
      ];
      await generatePDF(data, columns, 'System_Audit_Trail_Report', 'System Audit Trail & Anti-Scam Security Log');
      toast.success('Downloaded Audit Trail PDF');
    } catch (err) {
      toast.error('Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const data = filteredLogs.map(l => ({
        'Timestamp': l.timestamp ? format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss') : '',
        'Operator Name': l.performed_by_name,
        'Operator Email': l.performed_by_email,
        'Role': l.performed_by_role,
        'Action': l.action,
        'Module': l.module,
        'Record ID': l.record_id,
        'Details': l.details
      }));
      await generateExcel(data, 'System_Audit_Trail_Report');
      toast.success('Downloaded Audit Trail Excel');
    } catch (err) {
      toast.error('Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <>
      <Helmet><title>Audit Trail & Security Logs - Jai Bhavani Cargo</title></Helmet>
      <div className="min-h-[calc(100dvh-4rem)] p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-background animate-in fade-in">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>
                System Audit & Anti-Scam Security Logs
              </h1>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Complete tamper-proof audit trail of all entry creations, modifications, payments, and deletions across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchLogs} className="rounded-xl gap-1.5 font-bold">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>

            <Button onClick={handleExportPDF} disabled={isExportingPDF} variant="outline" className="rounded-xl border-border gap-1.5 font-bold">
              <FileText className="w-4 h-4 text-destructive" /> Export PDF
            </Button>

            <Button onClick={handleExportExcel} disabled={isExportingExcel} variant="outline" className="rounded-xl border-border gap-1.5 font-bold">
              <TableIcon className="w-4 h-4 text-emerald-500" /> Export Excel
            </Button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Logged Actions</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-foreground">{kpis.total}</h3>
                </div>
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">🛡️ Tamper-proof audit tracking</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modifications & Edits</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">{kpis.deletions}</h3>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-rose-500 font-bold mt-3">High-risk audit monitor</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Operators</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{kpis.uniqueUsers}</h3>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">User accountability verified</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest Event</p>
                  <h3 className="text-xs font-extrabold mt-2 text-foreground truncate">{kpis.latestTime}</h3>
                </div>
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">Real-time system logging</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Table Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-lg">Audit Trail Activity Logs</CardTitle>
              <CardDescription>Live log of every entry created, edited, paid, or deleted in the system</CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search operator, record ID, details..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>

              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Module" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="Trip Logs">Trip Logs</SelectItem>
                  <SelectItem value="Payment Requests">Payment Requests</SelectItem>
                  <SelectItem value="Cashbook">Cashbook</SelectItem>
                  <SelectItem value="Expenses">Expenses</SelectItem>
                  <SelectItem value="User Management">User Management</SelectItem>
                  <SelectItem value="Employee Database">Employee Database</SelectItem>
                  <SelectItem value="Fleet & Documents">Fleet & Documents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="STATUS_CHANGE">STATUS CHANGE</SelectItem>
                  <SelectItem value="PAYMENT_MARKED">PAYMENT MARKED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Performed By (Who Did It)</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead className="w-[350px]">Change Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                        No audit log entries match your filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(l => (
                      <TableRow key={l.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {l.timestamp ? format(new Date(l.timestamp), 'dd MMM yyyy, hh:mm a') : '-'}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              👤 {l.performed_by_name || 'System Operator'}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              {l.performed_by_email && <span>{l.performed_by_email} • </span>}
                              <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize bg-secondary/5">
                                {l.performed_by_role || 'Staff'}
                              </Badge>
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={cn("font-extrabold text-[10px]", ACTION_COLORS[l.action] || 'bg-muted text-muted-foreground')}>
                            {l.action}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="font-bold text-xs">
                            {l.module}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {l.record_id}
                        </TableCell>

                        <TableCell className="text-xs text-foreground font-medium leading-relaxed">
                          {l.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
