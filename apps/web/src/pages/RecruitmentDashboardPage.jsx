import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, UserX, Clock, Search, Filter, Eye,
  Phone, Download, RefreshCw, UserPlus, Truck, ExternalLink,
  CheckCircle2, AlertTriangle, Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getApplications, APPLICATION_STATUSES, getStatusConfig, deleteApplication } from '@/lib/recruitmentClient.js';
import DriverApplicationDetailModal from '@/components/DriverApplicationDetailModal.jsx';

export default function RecruitmentDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.full_name?.toLowerCase().includes(q) ||
          a.phone?.includes(q) ||
          a.city?.toLowerCase().includes(q) ||
          a.license_number?.toLowerCase().includes(q) ||
          a.vehicle_types?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, statusFilter, search]);

  const metrics = useMemo(() => ({
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }), [applications]);

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'State', 'License No', 'License Class', 'Experience (Yrs)', 'Vehicle Types', 'Status', 'Applied Date'];
    const rows = filtered.map(a => [
      `"${a.full_name}"`, `"${a.phone}"`, `"${a.email || ''}"`,
      `"${a.city}"`, `"${a.state}"`, `"${a.license_number}"`,
      `"${a.license_type}"`, a.experience_years || 0,
      `"${a.vehicle_types || ''}"`, `"${a.status}"`,
      `"${a.applied_date ? format(new Date(a.applied_date), 'dd/MM/yyyy') : ''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `Driver_Applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Applications exported to CSV!');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete application from ${name}?`)) return;
    try {
      await deleteApplication(id);
      toast.success('Application deleted');
      fetchApplications();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const kpiCards = [
    { label: 'Total Applications', value: metrics.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'New Applied', value: metrics.applied, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Shortlisted', value: metrics.shortlisted, icon: Star, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Interview Stage', value: metrics.interview, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Selected / Hired', value: metrics.selected, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Rejected', value: metrics.rejected, icon: UserX, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 font-sans"
    >
      <Helmet>
        <title>Driver Recruitment Dashboard | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-2xl text-primary"><Truck className="w-7 h-7" /></div>
            Driver Recruitment Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage driver job applications, license verification, and hiring status</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/apply/driver" target="_blank" rel="noreferrer">
            <Button variant="outline" className="rounded-xl text-xs font-bold shadow-sm">
              <ExternalLink className="w-4 h-4 mr-1.5" /> View Apply Page
            </Button>
          </a>
          <Button variant="outline" onClick={handleExport} className="rounded-xl text-xs font-bold shadow-sm">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button onClick={fetchApplications} variant="outline" className="rounded-xl text-xs font-bold">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="rounded-2xl border-border/60 bg-card p-4 shadow-sm space-y-1">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
            <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>

      {/* Public Apply Link Banner */}
      <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Public Driver Application Form
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Share this link with candidates — no login required</p>
          <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-lg mt-1 inline-block">
            {window.location.origin}/apply/driver
          </code>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/apply/driver`);
            toast.success('Link copied!');
          }} className="rounded-xl text-xs font-bold">
            Copy Link
          </Button>
          <a href="/apply/driver" target="_blank" rel="noreferrer">
            <Button size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Form
            </Button>
          </a>
        </div>
      </Card>

      {/* Search & Filter */}
      <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, city, license, vehicle type..."
              className="pl-9 rounded-xl h-9 text-xs w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-9 text-xs rounded-xl">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {APPLICATION_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-md">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold py-3.5 pl-5">Candidate</TableHead>
              <TableHead className="text-xs font-bold">Location</TableHead>
              <TableHead className="text-xs font-bold">License</TableHead>
              <TableHead className="text-xs font-bold">Experience</TableHead>
              <TableHead className="text-xs font-bold">Vehicle Types</TableHead>
              <TableHead className="text-xs font-bold">Applied On</TableHead>
              <TableHead className="text-xs font-bold text-center">Status</TableHead>
              <TableHead className="text-xs font-bold text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">Loading applications...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Truck className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-semibold">No applications yet</p>
                    <p className="text-xs">Share the public apply link with candidates to get started</p>
                    <a href="/apply/driver" target="_blank" rel="noreferrer">
                      <Button size="sm" className="rounded-xl text-xs font-bold mt-1 bg-primary text-primary-foreground">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Apply Form
                      </Button>
                    </a>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(app => {
                const cfg = getStatusConfig(app.status);
                const vehicles = app.vehicle_types ? app.vehicle_types.split(',').slice(0, 2).map(v => v.trim()) : [];
                return (
                  <TableRow key={app.id} className="hover:bg-muted/20 text-xs">
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center flex-shrink-0">
                          {app.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-foreground">{app.full_name}</div>
                          <a href={`tel:${app.phone}`} className="text-[10px] text-primary font-mono font-bold hover:underline">{app.phone}</a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.city}, {app.state}</TableCell>
                    <TableCell>
                      <div className="font-mono font-bold text-foreground text-[11px]">{app.license_number || '—'}</div>
                      <div className="text-[10px] text-muted-foreground">{app.license_type}</div>
                    </TableCell>
                    <TableCell className="font-mono text-foreground">{app.experience_years || 0} yrs</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vehicles.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] font-bold text-primary border-primary/30 py-0">{v}</Badge>
                        ))}
                        {app.vehicle_types?.split(',').length > 2 && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">+{app.vehicle_types.split(',').length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground text-[10px]">
                      {app.applied_date ? format(new Date(app.applied_date), 'dd MMM yy') : format(new Date(app.created), 'dd MMM yy')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`font-mono text-[10px] font-bold ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button
                        size="sm"
                        onClick={() => { setSelected(app); setIsDetailOpen(true); }}
                        className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <DriverApplicationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        application={selected}
        onUpdated={fetchApplications}
      />
    </motion.div>
  );
}
