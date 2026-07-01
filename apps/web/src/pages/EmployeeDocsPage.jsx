import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  FileText, Plus, Search, FilterX, Eye, Edit2, Trash2,
  AlertCircle, LayoutGrid, List, Hash, CalendarDays, Clock,
  Fingerprint, FolderOpen, Folder, ChevronLeft, Truck,
  UserCog, Briefcase, Users, ShieldCheck, ArrowLeft,
  BadgeCheck, File
} from 'lucide-react';
import { Button }       from '@/components/ui/button';
import { Input }        from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge }        from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label }        from '@/components/ui/label';
import { Textarea }     from '@/components/ui/textarea';
import { toast }        from 'sonner';
import { differenceInDays, format } from 'date-fns';
import pb               from '@/lib/pocketbaseClient.js';
import LoadingSpinner   from '@/components/LoadingSpinner.jsx';
import DocumentPreviewModal from '@/components/DocumentPreviewModal.jsx';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const ROLE_TABS = [
  { key: 'all',        label: 'All Staff',   icon: Users,     color: 'text-primary'       },
  { key: 'driver',     label: 'Drivers',     icon: Truck,     color: 'text-blue-400'      },
  { key: 'supervisor', label: 'Supervisors', icon: UserCog,   color: 'text-violet-400'    },
  { key: 'manager',    label: 'Managers',    icon: Briefcase, color: 'text-amber-400'     },
];

const DOC_TYPE_COLORS = {
  'License':             { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25'    },
  'Certification':       { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/25'  },
  'ID Proof':            { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/25'   },
  'Passport':            { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/25'    },
  'Bank Details':        { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
  'Employment Contract': { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/25'  },
  'Medical Certificate': { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/25'    },
  'Insurance':           { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'border-teal-500/25'    },
  'Other':               { bg: 'bg-slate-500/15',   text: 'text-slate-400',   border: 'border-slate-500/25'   },
};
const getDocTypeColor = (type) => DOC_TYPE_COLORS[type] || DOC_TYPE_COLORS['Other'];

const DOC_TYPES = [
  'License','Certification','ID Proof','Passport','Bank Details',
  'Employment Contract','Medical Certificate','Insurance','Other'
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function getStatusInfo(expiryDate) {
  if (!expiryDate) return { text: 'Unknown', badge: 'bg-muted text-muted-foreground border-border/40', numericStatus: 'Unknown' };
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0)   return { text: 'Expired',           badge: 'bg-red-500/15 text-red-400 border-red-500/25',     days, numericStatus: 'Expired' };
  if (days <= 30) return { text: `Exp in ${days}d`,   badge: 'bg-red-500/15 text-red-400 border-red-500/25',     days, numericStatus: 'Expiring Soon' };
  if (days <= 60) return { text: `Exp in ${days}d`,   badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25', days, numericStatus: 'Expiring Soon' };
  return { text: `Active (${days}d)`, badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', days, numericStatus: 'Active' };
}

function folderStatusSummary(docs) {
  if (docs.length === 0) return { label: 'Empty', cls: 'text-muted-foreground' };
  const statuses = docs.map(d => getStatusInfo(d.expiry_date).numericStatus);
  if (statuses.includes('Expired'))       return { label: 'Has Expired',     cls: 'text-red-400' };
  if (statuses.includes('Expiring Soon')) return { label: 'Expiring Soon',   cls: 'text-amber-400' };
  return { label: 'All Active', cls: 'text-emerald-400' };
}

/* ─── Initials Avatar ───────────────────────────────────────────────────────── */
function InitialsAvatar({ name, size = 'md' }) {
  const initials = (name || 'UN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const hue      = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const sz = { sm: 'w-8 h-8 text-[10px]', md: 'w-11 h-11 text-xs', lg: 'w-16 h-16 text-base font-extrabold' }[size] || 'w-11 h-11 text-xs';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold shrink-0 select-none`}
      style={{ background: `hsl(${hue},50%,24%)`, color: `hsl(${hue},80%,78%)`, border: `2px solid hsl(${hue},50%,36%)` }}
    >
      {initials}
    </div>
  );
}

/* ─── Role Icon ─────────────────────────────────────────────────────────────── */
function RoleIcon({ type }) {
  if (type === 'driver')     return <Truck     className="w-3 h-3" />;
  if (type === 'supervisor') return <UserCog   className="w-3 h-3" />;
  if (type === 'manager')    return <Briefcase className="w-3 h-3" />;
  return <Users className="w-3 h-3" />;
}

/* ─── Employee Folder Card ──────────────────────────────────────────────────── */
function EmployeeFolderCard({ employee, docs, onClick }) {
  const docCount = docs.length;
  const summary  = folderStatusSummary(docs);
  const hue      = (employee.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  // Collect unique doc types as small preview chips
  const types = [...new Set(docs.map(d => d.document_type).filter(Boolean))].slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.16] hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ background: 'linear-gradient(145deg, #111a36 0%, #0b1329 100%)' }}
    >
      {/* Top colour tab keyed to employee */}
      <div className="h-0.5" style={{ background: `hsl(${hue},60%,55%)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <InitialsAvatar name={employee.name} size="md" />
            {/* Folder icon overlay */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white/10"
              style={{ background: `hsl(${hue},50%,22%)` }}
            >
              <Folder className="w-2.5 h-2.5" style={{ color: `hsl(${hue},80%,78%)` }} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white/90 truncate leading-tight">{employee.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/[0.07]">
                <RoleIcon type={employee.employee_type} />
                {employee.employee_type || 'Staff'}
              </span>
            </div>
          </div>
          {/* Doc count badge */}
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center border border-white/[0.08]"
            style={{ background: `hsl(${hue},50%,14%)` }}
          >
            <span className="text-lg font-extrabold tabular-nums leading-none" style={{ color: `hsl(${hue},80%,78%)` }}>{docCount}</span>
            <span className="text-[8px] font-semibold text-white/30 uppercase tracking-wide">docs</span>
          </div>
        </div>

        {/* Status summary */}
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold mb-3 ${summary.cls}`}>
          {docCount === 0 ? (
            <><FolderOpen className="w-3.5 h-3.5 opacity-50" /><span className="opacity-60">No documents yet</span></>
          ) : summary.label === 'All Active' ? (
            <><BadgeCheck className="w-3.5 h-3.5" /><span>{summary.label}</span></>
          ) : (
            <><AlertCircle className="w-3.5 h-3.5" /><span>{summary.label}</span></>
          )}
        </div>

        {/* Doc type chips preview */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => {
              const c = getDocTypeColor(t);
              return (
                <span key={t} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                  {t}
                </span>
              );
            })}
            {docs.length > types.length && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/35 border border-white/10">
                +{docs.length - types.length} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 flex items-center justify-between border-t border-white/[0.05]" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-[10px] text-white/30 font-medium">Click to open folder</span>
        <ChevronLeft className="w-3.5 h-3.5 text-white/25 rotate-180 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

/* ─── Document Card (inside folder) ─────────────────────────────────────────── */
function DocCard({ doc, onView, onEdit, onDelete }) {
  const typeColor = getDocTypeColor(doc.document_type);
  const status    = getStatusInfo(doc.expiry_date);
  const hasFile   = doc.file || (doc.files && doc.files.length > 0);

  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.14] hover:-translate-y-0.5 hover:shadow-xl"
      style={{ background: 'linear-gradient(145deg, #111a36 0%, #0b1329 100%)' }}
    >
      {/* Top accent */}
      <div className={`h-0.5 w-full ${typeColor.bg} opacity-90`} />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${typeColor.bg} border ${typeColor.border}`}>
            <FileText className={`w-4 h-4 ${typeColor.text}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-white/90">{doc.document_type || 'Unknown'}</p>
            <p className="text-[10px] text-white/35 font-mono mt-0.5 truncate max-w-[130px]">{doc.document_number || '—'}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.badge}`}>{status.text}</span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.05]" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-px m-4 rounded-xl overflow-hidden border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.025)' }}>
        <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-1 text-white/30 mb-1">
            <CalendarDays className="w-2.5 h-2.5" />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Issue Date</span>
          </div>
          <p className="text-xs font-semibold text-white/75">
            {doc.issue_date ? format(new Date(doc.issue_date), 'MMM dd, yyyy') : '—'}
          </p>
        </div>
        <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <div className="flex items-center gap-1 text-white/30 mb-1">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Expiry Date</span>
          </div>
          <p className="text-xs font-semibold text-white/75">
            {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : '—'}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Action bar */}
      <div className="border-t border-white/[0.05] px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-1 text-white/20">
          <Fingerprint className="w-3 h-3" />
          <span className="text-[9px] font-mono">{doc.id?.substring(0, 8)}…</span>
        </div>
        <div className="flex items-center gap-0.5">
          {hasFile && (
            <button onClick={() => onView(doc)} title="View File" className="p-1.5 rounded-lg text-white/35 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => onEdit(doc)} title="Edit" className="p-1.5 rounded-lg text-white/35 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(doc.id)} title="Delete" className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  Main Page Component                                                         */
/* ════════════════════════════════════════════════════════════════════════════ */
export default function EmployeeDocsPage() {
  const [documents,      setDocuments]      = useState([]);
  const [employees,      setEmployees]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  // Navigation state
  const [roleTab,        setRoleTab]        = useState('all');     // 'all' | 'driver' | 'supervisor' | 'manager'
  const [openEmployee,   setOpenEmployee]   = useState(null);      // employee object when folder is open
  const [viewMode,       setViewMode]       = useState('grid');    // 'grid' | 'list' (inside folder)

  // Filters (inside folder view)
  const [search,         setSearch]         = useState('');
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('all');

  // Form dialog
  const [isFormOpen,     setIsFormOpen]     = useState(false);
  const [editingDoc,     setEditingDoc]     = useState(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [formData,       setFormData]       = useState({
    employee_id: '', document_type: '', document_number: '',
    issue_date: '', expiry_date: '', notes: '', status: 'Active'
  });
  const [selectedFiles,  setSelectedFiles]  = useState([]);
  const [existingFiles,  setExistingFiles]  = useState([]);
  const [deletedFiles,   setDeletedFiles]   = useState([]);
  const [previewDoc,     setPreviewDoc]     = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────────── */
  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [docsRes, empRes] = await Promise.all([
        pb.collection('employee_documents').getList(1, 1000, { sort: '-created', $autoCancel: false }),
        pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false })
      ]);
      setDocuments(docsRes.items || []);
      setEmployees(empRes || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please refresh.');
      toast.error('Failed to connect to the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // If open employee gets deleted / filtered out, close the folder
  useEffect(() => {
    if (openEmployee && !employees.find(e => e.id === openEmployee.id)) setOpenEmployee(null);
  }, [employees]);

  /* ── Derived ──────────────────────────────────────────────────────────────── */
  const docsByEmployee = useMemo(() => {
    const map = {};
    documents.forEach(doc => {
      if (!map[doc.employee_id]) map[doc.employee_id] = [];
      map[doc.employee_id].push(doc);
    });
    return map;
  }, [documents]);

  // Employees filtered by the role tab
  const visibleEmployees = useMemo(() => {
    return employees.filter(e => roleTab === 'all' || e.employee_type === roleTab);
  }, [employees, roleTab]);

  // Stats for KPI bar
  const stats = useMemo(() => {
    let active = 0, soon = 0, expired = 0;
    documents.forEach(doc => {
      const s = getStatusInfo(doc.expiry_date).numericStatus;
      if (s === 'Active')        active++;
      else if (s === 'Expiring Soon') soon++;
      else if (s === 'Expired')  expired++;
    });
    return { total: documents.length, active, soon, expired, employees: employees.length };
  }, [documents, employees]);

  // Docs for the currently open employee folder, filtered
  const folderDocs = useMemo(() => {
    if (!openEmployee) return [];
    return (docsByEmployee[openEmployee.id] || []).filter(doc => {
      if (typeFilter !== 'all'   && doc.document_type !== typeFilter) return false;
      if (statusFilter !== 'all' && getStatusInfo(doc.expiry_date).numericStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!doc.document_number?.toLowerCase().includes(q) && !doc.document_type?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [openEmployee, docsByEmployee, search, typeFilter, statusFilter]);

  /* ── Form handlers ────────────────────────────────────────────────────────── */
  const handleOpenForm = (doc = null, presetEmployee = null) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        employee_id:     doc.employee_id     || '',
        document_type:   doc.document_type   || '',
        document_number: doc.document_number || '',
        issue_date:      doc.issue_date   ? doc.issue_date.split('T')[0]   : '',
        expiry_date:     doc.expiry_date  ? doc.expiry_date.split('T')[0]  : '',
        notes:           doc.notes           || '',
        status:          doc.status          || 'Active'
      });
      setExistingFiles(doc.files || []);
    } else {
      setEditingDoc(null);
      setFormData({
        employee_id:     presetEmployee?.id || '',
        document_type:   '',
        document_number: '',
        issue_date:      '',
        expiry_date:     '',
        notes:           '',
        status:          'Active'
      });
      setExistingFiles([]);
    }
    setSelectedFiles([]);
    setDeletedFiles([]);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDoc(null);
    setSelectedFiles([]);
    setExistingFiles([]);
    setDeletedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.document_type || !formData.expiry_date)
      return toast.error('Please fill required fields (Employee, Type, Expiry Date)');
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (key === 'issue_date' || key === 'expiry_date') data.append(key, new Date(formData[key]).toISOString());
          else data.append(key, formData[key]);
        }
      });
      
      // Append new files
      selectedFiles.forEach(file => {
        data.append('files', file);
      });

      // Handle deleted files
      if (editingDoc && deletedFiles.length > 0) {
        deletedFiles.forEach(filename => {
          data.append(`files.${filename}`, '');
        });
      }

      if (editingDoc) {
        await pb.collection('employee_documents').update(editingDoc.id, data, { $autoCancel: false });
        toast.success('Document updated');
      } else {
        await pb.collection('employee_documents').create(data, { $autoCancel: false });
        toast.success('Document added');
      }
      handleCloseForm(); fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save. Check file size (max 20MB).');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document permanently?')) return;
    try {
      await pb.collection('employee_documents').delete(id, { $autoCancel: false });
      toast.success('Document deleted'); fetchData();
    } catch (err) { toast.error('Failed to delete document'); }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet><title>Employee Documents | Dashboard</title></Helmet>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 space-y-6">

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {openEmployee ? (
              /* Breadcrumb when inside a folder */
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                <button onClick={() => { setOpenEmployee(null); setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
                  className="hover:text-foreground transition-colors flex items-center gap-1 font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" /> Documents
                </button>
                <span>/</span>
                <span className="text-foreground font-semibold">{openEmployee.name}</span>
              </div>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                {openEmployee ? <FolderOpen className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
              </div>
              {openEmployee ? `${openEmployee.name}'s Folder` : 'Employee Documents'}
            </h1>
            <p className="text-muted-foreground mt-1 ml-1">
              {openEmployee
                ? `${(docsByEmployee[openEmployee.id] || []).length} document(s) on record for this employee.`
                : 'Track licenses, ID proofs, and certifications by employee folder.'}
            </p>
          </div>

          <Button
            onClick={() => handleOpenForm(null, openEmployee)}
            className="shadow-sm rounded-xl h-10 px-5 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            {openEmployee ? 'Add Document' : 'Add Document'}
          </Button>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Employees',    val: stats.employees, color: 'border-l-primary',      valClass: 'text-primary'    },
            { label: 'Total Docs',   val: stats.total,     color: 'border-l-border',        valClass: ''               },
            { label: 'Active',       val: stats.active,    color: 'border-l-emerald-500',   valClass: 'text-emerald-500'},
            { label: '< 60 Days',    val: stats.soon,      color: 'border-l-yellow-500',    valClass: 'text-yellow-500' },
            { label: 'Expired',      val: stats.expired,   color: 'border-l-red-500',       valClass: 'text-red-500'   },
          ].map(k => (
            <Card key={k.label} className={`border-l-4 ${k.color} shadow-sm rounded-2xl`}>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">{k.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${k.valClass}`}>{k.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Role Tabs ──────────────────────────────────────────────────────── */}
        {!openEmployee && (
          <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-2xl w-fit shadow-sm">
            {ROLE_TABS.map(tab => {
              const Icon    = tab.icon;
              const count   = tab.key === 'all'
                ? employees.length
                : employees.filter(e => e.employee_type === tab.key).length;
              const isActive = roleTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setRoleTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? '' : tab.color}`} />
                  {tab.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="py-24 flex justify-center"><LoadingSpinner text="Loading documents..." /></div>
        ) : error ? (
          <div className="py-24 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-destructive">{error}</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={fetchData}>Try Again</Button>
          </div>
        ) : !openEmployee ? (
          /* ══ FOLDER INDEX VIEW ══════════════════════════════════════════════ */
          <>
            {visibleEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Users className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-lg font-semibold">No {roleTab !== 'all' ? roleTab + 's' : 'employees'} found</p>
                <p className="text-sm mt-1 opacity-60">Add employees in the Employee Database first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleEmployees.map(emp => (
                  <EmployeeFolderCard
                    key={emp.id}
                    employee={emp}
                    docs={docsByEmployee[emp.id] || []}
                    onClick={() => { setOpenEmployee(emp); setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ══ FOLDER DOCUMENT VIEW ═══════════════════════════════════════════ */
          <>
            {/* Employee identity header card */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl border border-white/[0.08]"
              style={{ background: 'linear-gradient(135deg, #111a36 0%, #0b1329 100%)' }}
            >
              <InitialsAvatar name={openEmployee.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-white/95">{openEmployee.name}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">
                    <RoleIcon type={openEmployee.employee_type} />
                    {openEmployee.employee_type || 'Staff'}
                  </span>
                </div>
                {openEmployee.contact && <p className="text-sm text-white/40">{openEmployee.contact}</p>}
                {openEmployee.joining_date && (
                  <p className="text-xs text-white/30 mt-0.5">Joined {format(new Date(openEmployee.joining_date), 'MMM dd, yyyy')}</p>
                )}
              </div>
              {/* Folder summary stats */}
              <div className="flex gap-3 shrink-0">
                {[
                  { label: 'Total', val: (docsByEmployee[openEmployee.id] || []).length, cls: 'text-white/80' },
                  { label: 'Active', val: (docsByEmployee[openEmployee.id] || []).filter(d => getStatusInfo(d.expiry_date).numericStatus === 'Active').length, cls: 'text-emerald-400' },
                  { label: 'Expired', val: (docsByEmployee[openEmployee.id] || []).filter(d => getStatusInfo(d.expiry_date).numericStatus === 'Expired').length, cls: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="text-center px-3 py-2 rounded-xl bg-white/5 border border-white/[0.06]">
                    <p className={`text-xl font-extrabold tabular-nums ${s.cls}`}>{s.val}</p>
                    <p className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder filters + view toggle */}
            <div className="bg-card border border-border rounded-2xl p-3 flex flex-wrap gap-3 items-center shadow-sm">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search doc # or type..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-background rounded-xl h-9 border-border text-sm"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] bg-background rounded-xl h-9 text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background rounded-xl h-9 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}>
                  <FilterX className="w-4 h-4" />
                </Button>
              )}
              <div className="flex-1" />
              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-xl border border-border/50">
                {folderDocs.length} doc{folderDocs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Document grid / list inside folder */}
            {folderDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FolderOpen className="w-14 h-14 mb-4 opacity-10" />
                <p className="text-lg font-semibold">
                  {(docsByEmployee[openEmployee.id] || []).length === 0 ? 'Folder is empty' : 'No documents match your filters'}
                </p>
                <p className="text-sm mt-1 opacity-60">Click "Add Document" to attach the first record.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folderDocs.map(doc => (
                  <DocCard key={doc.id} doc={doc} onView={handlePreview} onEdit={handleOpenForm} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm border-border overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Doc Number</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {folderDocs.map(doc => {
                        const stat    = getStatusInfo(doc.expiry_date);
                        const tc      = getDocTypeColor(doc.document_type);
                        const hasFile = doc.file || (doc.files?.length > 0);
                        return (
                          <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${tc.bg} ${tc.text} ${tc.border}`}>
                                {doc.document_type}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">{doc.document_number || '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{doc.issue_date  ? format(new Date(doc.issue_date),  'MMM dd, yyyy') : '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : '—'}</TableCell>
                            <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${stat.badge}`}>{stat.text}</span></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {hasFile && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handlePreview(doc)}><Eye className="w-4 h-4" /></Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500" onClick={() => handleOpenForm(doc)}><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* ── Add / Edit Form Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={o => !isSubmitting && !o && handleCloseForm()}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingDoc ? 'Edit Document' : 'Add New Document'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp_sel">Employee *</Label>
                <Select value={formData.employee_id} onValueChange={v => setFormData(p => ({ ...p, employee_id: v }))}>
                  <SelectTrigger id="emp_sel" className="rounded-xl"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc_type_sel">Document Type *</Label>
                <Select value={formData.document_type} onValueChange={v => setFormData(p => ({ ...p, document_type: v }))}>
                  <SelectTrigger id="doc_type_sel" className="rounded-xl"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_num">Document Number</Label>
              <Input id="doc_num" className="rounded-xl" value={formData.document_number} onChange={e => setFormData(p => ({ ...p, document_number: e.target.value }))} placeholder="e.g. MH03 20090057914" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iss_date">Issue Date</Label>
                <Input id="iss_date" type="date" className="rounded-xl dark:[color-scheme:dark]" value={formData.issue_date} onChange={e => setFormData(p => ({ ...p, issue_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp_date">Expiry Date *</Label>
                <Input id="exp_date" type="date" className="rounded-xl dark:[color-scheme:dark]" value={formData.expiry_date} onChange={e => setFormData(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_up">Upload Files (PDF / Images, max 20 MB each)</Label>
              <Input id="file_up" type="file" className="rounded-xl" accept=".pdf,image/jpeg,image/png,image/gif,image/webp" multiple onChange={e => {
                const files = Array.from(e.target.files);
                setSelectedFiles(prev => [...prev, ...files]);
              }} />
              
              {/* Existing files list */}
              {existingFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground">Existing Files:</p>
                  {existingFiles.map((file, idx) => (
                    <div key={`existing-${idx}`} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded-lg border border-border">
                      <span className="truncate max-w-[280px]">{file}</span>
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        setExistingFiles(prev => prev.filter(f => f !== file));
                        setDeletedFiles(prev => [...prev, file]);
                      }}>✕</Button>
                    </div>
                  ))}
                </div>
              )}

              {/* New files list */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground">New Files to Upload:</p>
                  {selectedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between text-xs bg-primary/5 p-2 rounded-lg border border-primary/20">
                      <span className="truncate max-w-[280px]">{file.name}</span>
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}>✕</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes_txt">Notes</Label>
              <Textarea id="notes_txt" className="rounded-xl" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional details..." />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="rounded-xl" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Document'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Preview Modal ─────────────────────────────────────────────────────── */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        collectionName="employee_documents"
      />
    </div>
  );
}