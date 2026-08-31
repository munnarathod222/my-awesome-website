import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Target, Building2, Phone, Mail, MapPin, Calendar, DollarSign, 
  CheckCircle2, Clock, AlertTriangle, Plus, Search, Filter, RefreshCw, 
  FileText, ShieldCheck, Share2, Copy, Trash2, Edit3, ChevronRight, 
  BadgeCheck, ArrowUpRight, TrendingUp, Layers, LayoutGrid, List, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PIPELINE_STAGES = [
  { id: 'New Prospect', label: 'New Prospect', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'Discussion', label: 'Discussion', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  { id: 'Quote Submitted', label: 'Quote Submitted', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { id: 'Vendor Registration', label: 'Vendor Registration', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'Contract Negotiation', label: 'Contract Negotiation', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
  { id: 'Won - Active', label: 'Won - Active', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { id: 'Lost', label: 'Lost', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
];

const VENDOR_STATUSES = [
  { id: 'Not Started', label: 'Not Started', badge: 'bg-slate-800 text-slate-400' },
  { id: 'Docs Submitted', label: 'Docs Submitted', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'Under Review', label: 'Under Review', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'Vendor Code Approved', label: 'Code Approved ✓', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'Rejected', label: 'Rejected', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
];

const LEAD_TYPES = [
  'Corporate Freight',
  'Warehouse & Distribution',
  'Spot Load',
  'Contract Dedicated Fleet',
  'Other'
];

export default function SalesLeadsPage() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [activeKanbanStage, setActiveKanbanStage] = useState('Vendor Registration');

  // Lead Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    city_state: '',
    lead_type: 'Corporate Freight',
    pipeline_stage: 'New Prospect',
    vendor_reg_status: 'Not Started',
    vendor_code: '',
    contract_value: '',
    contract_start_date: '',
    contract_expiry_date: '',
    credit_terms_days: '30',
    fuel_escalation_clause: true,
    assigned_owner: '',
    notes: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let salesLeads = [];
      try {
        salesLeads = await pb.collection('sales_leads').getFullList({
          sort: '-created',
          $autoCancel: false
        });
      } catch (err) {}

      // Seamlessly incorporate all quote inquiries into the sales pipeline
      let quotesRecords = [];
      try {
        quotesRecords = await pb.collection('quotes').getFullList({
          sort: '-created',
          $autoCancel: false
        });
      } catch (err) {}

      let localQuotes = [];
      try {
        localQuotes = JSON.parse(localStorage.getItem('jbc_public_quotes') || '[]');
      } catch (err) {}

      const allQuotes = [...quotesRecords, ...localQuotes];
      const leadMap = new Map();

      // 1. Direct Sales Leads
      (salesLeads || []).forEach(lead => {
        const key = (lead.company_name || lead.contact_person || lead.id || '').toLowerCase();
        if (key) leadMap.set(key, lead);
      });

      // 2. Synthesize quote leads into the pipeline (Quote Submitted stage)
      (allQuotes || []).forEach(q => {
        const key = (q.customer_name || q.quote_number || q.id || '').toLowerCase();
        if (!leadMap.has(key)) {
          let mappedStage = 'Quote Submitted';
          if (q.status === 'Accepted') mappedStage = 'Won - Active';
          else if (q.status === 'Rejected') mappedStage = 'Lost';
          else if (q.status === 'Negotiating') mappedStage = 'Contract Negotiation';
          else if (q.status === 'Pending' || q.status === 'Draft' || !q.status) mappedStage = 'Quote Submitted';

          leadMap.set(key, {
            id: q.id || `lead_qt_${q.quote_number}`,
            quote_id: q.id,
            quote_number: q.quote_number,
            company_name: q.customer_name || 'Direct Freight Shipper',
            contact_person: q.customer_name || 'Freight Requester',
            phone: q.customer_phone || '',
            email: q.customer_email || '',
            city_state: `${q.origin || ''} ➡️ ${q.destination || ''}`,
            lead_type: 'Spot Load',
            pipeline_stage: mappedStage,
            vendor_reg_status: 'Not Started',
            vendor_code: q.quote_number,
            contract_value: q.total_price || 28000,
            notes: `Quote #${q.quote_number} | Route: ${q.origin} ➡️ ${q.destination} | Vehicle: ${q.container_type || '32ft SXL'} | Material: ${q.material_type || 'General Cargo'}${q.notes ? `\n${q.notes}` : ''}`,
            created: q.created || new Date().toISOString()
          });
        }
      });

      const combined = Array.from(leadMap.values()).sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
      setLeads(combined);
    } catch (err) {
      console.error('Failed to fetch sales leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const handleQuoteEvent = () => {
      fetchLeads();
    };

    window.addEventListener('jbc_new_quote_submitted', handleQuoteEvent);
    window.addEventListener('storage', handleQuoteEvent);

    return () => {
      window.removeEventListener('jbc_new_quote_submitted', handleQuoteEvent);
      window.removeEventListener('storage', handleQuoteEvent);
    };
  }, []);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !searchQuery || 
        lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.vendor_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city_state?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStage = stageFilter === 'all' || lead.pipeline_stage === stageFilter;
      const matchVendor = vendorFilter === 'all' || lead.vendor_reg_status === vendorFilter;

      return matchSearch && matchStage && matchVendor;
    });
  }, [leads, searchQuery, stageFilter, vendorFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const activePipeline = leads.filter(l => l.pipeline_stage !== 'Won - Active' && l.pipeline_stage !== 'Lost');
    const totalValue = activePipeline.reduce((sum, l) => sum + (l.contract_value || 0), 0);
    const vendorRegCount = leads.filter(l => l.pipeline_stage === 'Vendor Registration' || l.vendor_reg_status === 'Under Review' || l.vendor_reg_status === 'Docs Submitted').length;
    const wonCount = leads.filter(l => l.pipeline_stage === 'Won - Active').length;
    return { total, activePipelineCount: activePipeline.length, totalValue, vendorRegCount, wonCount };
  }, [leads]);

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        company_name: lead.company_name || '',
        contact_person: lead.contact_person || '',
        phone: lead.phone || '',
        email: lead.email || '',
        city_state: lead.city_state || '',
        lead_type: lead.lead_type || 'Corporate Freight',
        pipeline_stage: lead.pipeline_stage || 'New Prospect',
        vendor_reg_status: lead.vendor_reg_status || 'Not Started',
        vendor_code: lead.vendor_code || '',
        contract_value: lead.contract_value || '',
        contract_start_date: lead.contract_start_date ? lead.contract_start_date.split('T')[0] : '',
        contract_expiry_date: lead.contract_expiry_date ? lead.contract_expiry_date.split('T')[0] : '',
        credit_terms_days: lead.credit_terms_days || '30',
        fuel_escalation_clause: lead.fuel_escalation_clause !== false,
        assigned_owner: lead.assigned_owner || currentUser?.name || '',
        notes: lead.notes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        city_state: '',
        lead_type: 'Corporate Freight',
        pipeline_stage: 'New Prospect',
        vendor_reg_status: 'Not Started',
        vendor_code: '',
        contract_value: '',
        contract_start_date: '',
        contract_expiry_date: '',
        credit_terms_days: '30',
        fuel_escalation_clause: true,
        assigned_owner: currentUser?.name || currentUser?.email || '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return toast.error('Company Name is required');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        contract_value: formData.contract_value ? Number(formData.contract_value) : 0,
        credit_terms_days: formData.credit_terms_days ? Number(formData.credit_terms_days) : 30,
        contract_start_date: formData.contract_start_date ? new Date(formData.contract_start_date).toISOString() : null,
        contract_expiry_date: formData.contract_expiry_date ? new Date(formData.contract_expiry_date).toISOString() : null,
      };

      if (editingLead) {
        await pb.collection('sales_leads').update(editingLead.id, payload, { $autoCancel: false });
        toast.success(`Updated lead for "${formData.company_name}"`);
      } else {
        await pb.collection('sales_leads').create(payload, { $autoCancel: false });
        toast.success(`Created new sales lead for "${formData.company_name}"`);
      }

      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Error saving lead:', err);
      toast.error('Failed to save sales lead details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete lead "${companyName}"?`)) return;
    try {
      await pb.collection('sales_leads').delete(leadId, { $autoCancel: false });
      toast.success('Lead deleted');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const handleQuickUpdateStage = async (lead, newStage) => {
    try {
      await pb.collection('sales_leads').update(lead.id, { pipeline_stage: newStage }, { $autoCancel: false });
      toast.success(`Moved ${lead.company_name} to ${newStage}`);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, pipeline_stage: newStage } : l));
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 font-sans pb-20">
      <Helmet>
        <title>Sales Leads & Vendorship Registration | Jai Bhavani Cargo</title>
        <meta name="description" content="Corporate sales leads, vendorship empanelment tracking, and annual freight rate contracts." />
      </Helmet>

      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur p-6 rounded-2xl border border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Sales &amp; Vendorship Leads
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20 font-mono">
                  Corporate Empanelment Pipeline
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage client prospects, vendor code onboarding, and annual freight rate contract renewals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchLeads} className="h-10 rounded-xl border-border">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={() => handleOpenModal()} className="h-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Add Sales Lead
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Pipeline Leads', value: stats.activePipelineCount, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Pipeline Est. Value', value: `₹${(stats.totalValue / 100000).toFixed(2)} Lakhs`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Vendorship Reg. Active', value: stats.vendorRegCount, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Active Contracts (Won)', value: stats.wonCount, icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(item => (
          <Card key={item.label} className={`border backdrop-blur-sm rounded-2xl ${item.bg}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.label}</p>
                <p className="font-black text-foreground text-lg sm:text-xl mt-0.5">{item.value}</p>
              </div>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/40 p-4 rounded-xl border border-border/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search lead by company, contact, vendor code, or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 h-10 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="w-40">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="bg-background/80 h-10 text-xs rounded-xl">
                <SelectValue placeholder="Pipeline Stage..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {PIPELINE_STAGES.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="bg-background/80 h-10 text-xs rounded-xl">
                <SelectValue placeholder="Vendor Reg. Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendor Statuses</SelectItem>
                {VENDOR_STATUSES.map(v => (
                  <SelectItem key={v.id} value={v.id} className="text-xs">{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Kanban Board or List View */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="bg-card/40 border-dashed border-2 border-border/80 p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <Target className="w-12 h-12 text-primary mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No Sales Leads Found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery || stageFilter !== 'all' ? 'No leads match your current search filters.' : 'Add your first corporate prospect or vendorship registration lead.'}
              </p>
            </div>
            <Button size="sm" onClick={() => handleOpenModal()} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add First Sales Lead
            </Button>
          </div>
        </Card>
      ) : viewMode === 'kanban' ? (
        <div className="space-y-4">
          {/* Mobile Stage Tabs Selector (for small screens) */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
            {PIPELINE_STAGES.map(s => {
              const count = filteredLeads.filter(l => l.pipeline_stage === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveKanbanStage(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                    activeKanbanStage === s.id 
                      ? `${s.color} border-primary` 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {s.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Desktop Multi-column Kanban Grid & Mobile Single-Column Active Stage View */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.pipeline_stage === stage.id);
              const isMobileActive = activeKanbanStage === stage.id;

              return (
                <div 
                  key={stage.id}
                  className={`space-y-3 ${isMobileActive ? 'block' : 'hidden md:block'}`}
                >
                  <div className={`p-3 rounded-xl border ${stage.color} flex items-center justify-between`}>
                    <span className="font-extrabold text-xs tracking-wider uppercase truncate">{stage.label}</span>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-background/50">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {stageLeads.map(lead => {
                      const vendorBadge = VENDOR_STATUSES.find(v => v.id === lead.vendor_reg_status);
                      const isExpiringSoon = lead.contract_expiry_date && 
                        differenceInDays(parseISO(lead.contract_expiry_date), new Date()) <= 30 &&
                        differenceInDays(parseISO(lead.contract_expiry_date), new Date()) >= 0;

                      return (
                        <Card key={lead.id} className="bg-card/70 border-border/80 hover:border-primary/50 transition-all rounded-2xl p-4 space-y-3 shadow-md">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-sm text-foreground leading-tight">{lead.company_name}</h4>
                              {lead.city_state && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" /> {lead.city_state}
                                </p>
                              )}
                            </div>

                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleOpenModal(lead)}>
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          {/* Contact Person & Phone */}
                          {(lead.contact_person || lead.phone) && (
                            <div className="text-xs space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-border/40">
                              {lead.contact_person && (
                                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-primary" /> {lead.contact_person}
                                </p>
                              )}
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 font-mono text-[11px]">
                                  <Phone className="w-3 h-3 text-emerald-400" /> {lead.phone}
                                </a>
                              )}
                            </div>
                          )}

                          {/* Vendor Reg & Contract Info */}
                          <div className="space-y-1.5 text-[11px]">
                            {lead.vendor_reg_status && lead.vendor_reg_status !== 'Not Started' && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Vendor Reg:</span>
                                <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 border ${vendorBadge?.badge}`}>
                                  {vendorBadge?.label}
                                </Badge>
                              </div>
                            )}

                            {lead.vendor_code && (
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-muted-foreground">Vendor Code:</span>
                                <span className="font-bold text-amber-400">{lead.vendor_code}</span>
                              </div>
                            )}

                            {lead.contract_value > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Annual Contract:</span>
                                <span className="font-extrabold text-primary font-mono">₹{lead.contract_value.toLocaleString()}</span>
                              </div>
                            )}

                            {isExpiringSoon && (
                              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> Renewal due within 30 days
                              </div>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                            <Select 
                              value={lead.pipeline_stage} 
                              onValueChange={(val) => handleQuickUpdateStage(lead, val)}
                            >
                              <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/40 rounded-lg w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PIPELINE_STAGES.map(st => (
                                  <SelectItem key={st.id} value={st.id} className="text-xs">{st.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </Card>
                      );
                    })}

                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border/40 rounded-xl">
                        No leads in stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table List View */
        <Card className="border border-border/80 overflow-hidden rounded-2xl bg-card/60 backdrop-blur">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Company / Lead</TableHead>
                  <TableHead className="font-bold">Contact &amp; Location</TableHead>
                  <TableHead className="font-bold">Stage</TableHead>
                  <TableHead className="font-bold">Vendor Status</TableHead>
                  <TableHead className="font-bold text-right">Contract Value</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => {
                  const stageObj = PIPELINE_STAGES.find(s => s.id === lead.pipeline_stage);
                  const vendorBadge = VENDOR_STATUSES.find(v => v.id === lead.vendor_reg_status);

                  return (
                    <TableRow key={lead.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div>
                          <p className="font-bold text-foreground text-sm">{lead.company_name}</p>
                          <span className="text-[10px] text-muted-foreground">{lead.lead_type || 'Corporate Freight'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground">{lead.contact_person || '—'}</p>
                          <p className="text-muted-foreground font-mono text-[11px]">{lead.phone || lead.email || lead.city_state || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold border ${stageObj?.color}`}>
                          {lead.pipeline_stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className={`text-[10px] font-bold border ${vendorBadge?.badge}`}>
                            {vendorBadge?.label}
                          </Badge>
                          {lead.vendor_code && (
                            <span className="text-[10px] text-amber-400 font-mono block mt-0.5 font-bold">
                              Code: {lead.vendor_code}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        {lead.contract_value ? `₹${lead.contract_value.toLocaleString()}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(lead)} className="h-8 text-xs">
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(lead.id, lead.company_name)} className="h-8 text-xs text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* ── Add / Edit Sales Lead Modal ──────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[92vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {editingLead ? `Edit Lead: ${editingLead.company_name}` : 'Add New Corporate Sales Lead'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLead} className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Company / Corporate Client Name *</Label>
                <Input 
                  placeholder="e.g. Reliance Retail Logistics, Tata Steel Supply Chain"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  className="bg-background h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input 
                  placeholder="e.g. Rajesh Kumar (Logistics Head)"
                  value={formData.contact_person}
                  onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input 
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Email</Label>
                <Input 
                  type="email"
                  placeholder="e.g. logistics@client.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">City &amp; State</Label>
                <Input 
                  placeholder="e.g. Hyderabad, Telangana"
                  value={formData.city_state}
                  onChange={e => setFormData({ ...formData, city_state: e.target.value })}
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pipeline Stage *</Label>
                <Select value={formData.pipeline_stage} onValueChange={v => setFormData({ ...formData, pipeline_stage: v })}>
                  <SelectTrigger className="bg-background h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead / Contract Type</Label>
                <Select value={formData.lead_type} onValueChange={v => setFormData({ ...formData, lead_type: v })}>
                  <SelectTrigger className="bg-background h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_TYPES.map(t => (
                      <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendorship Registration Section */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Corporate Vendorship Registration Tracking
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendorship Onboarding Status</Label>
                  <Select value={formData.vendor_reg_status} onValueChange={v => setFormData({ ...formData, vendor_reg_status: v })}>
                    <SelectTrigger className="bg-background h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_STATUSES.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-xs">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Assigned Vendor Code (If Approved)</Label>
                  <Input 
                    placeholder="e.g. VEND-8890"
                    value={formData.vendor_code}
                    onChange={e => setFormData({ ...formData, vendor_code: e.target.value })}
                    className="bg-background h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contract & Financial Terms Section */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Annual Freight Contract &amp; Payment Terms
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Est. Annual Value (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 5000000"
                    value={formData.contract_value}
                    onChange={e => setFormData({ ...formData, contract_value: e.target.value })}
                    className="bg-background h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Contract Start Date</Label>
                  <Input 
                    type="date"
                    value={formData.contract_start_date}
                    onChange={e => setFormData({ ...formData, contract_start_date: e.target.value })}
                    className="bg-background h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Contract Expiry Date</Label>
                  <Input 
                    type="date"
                    value={formData.contract_expiry_date}
                    onChange={e => setFormData({ ...formData, contract_expiry_date: e.target.value })}
                    className="bg-background h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Credit Payment Terms (Days)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 30"
                    value={formData.credit_terms_days}
                    onChange={e => setFormData({ ...formData, credit_terms_days: e.target.value })}
                    className="bg-background h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.fuel_escalation_clause}
                      onChange={e => setFormData({ ...formData, fuel_escalation_clause: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500"
                    />
                    Include Diesel Price Fuel Escalation Clause
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes &amp; Deal Highlights</Label>
              <Textarea 
                placeholder="e.g. Requires 10 dedicated 32ft MXL containers daily on Hyderabad - Mumbai route."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background text-xs resize-none"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                {submitting ? 'Saving...' : editingLead ? 'Update Lead' : 'Save Sales Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
