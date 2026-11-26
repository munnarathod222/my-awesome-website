import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, Trash2, Edit2, Eye, Download, Users, Building, User, Store, ShieldCheck, MapPin, Mail, Phone, Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import CreateClientUserModal from '@/components/CreateClientUserModal.jsx';
import { formatMapUrl, openMapLocation } from '@/lib/locationUtils.js';

export default function ClientsListPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', billingType: 'all' });
  const [sort, setSort] = useState('-created');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [pagination, setPagination] = useState({ page: 1, perPage: 25, total: 0 });
  const [portalModalClient, setPortalModalClient] = useState(null);
  const [podAddressModalClient, setPodAddressModalClient] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const filterConditions = [];
      if (searchTerm) {
        filterConditions.push(`(client_name ~ "${searchTerm}" || email ~ "${searchTerm}" || phone ~ "${searchTerm}")`);
      }
      if (filters.type !== 'all') {
        filterConditions.push(`client_type = "${filters.type}"`);
      }
      if (filters.status !== 'all') {
        filterConditions.push(`status = "${filters.status}"`);
      }
      if (filters.billingType !== 'all') {
        filterConditions.push(`billing_type = "${filters.billingType}"`);
      }

      const queryFilter = filterConditions.join(' && ');

      const res = await pb.collection('clients').getList(pagination.page, pagination.perPage, {
        filter: queryFilter,
        sort: sort,
        $autoCancel: false
      });

      setClients(res.items);
      setPagination(prev => ({ ...prev, total: res.totalItems }));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to fetch clients", err);
      toast.error('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchClients();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, sort, pagination.page, pagination.perPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await pb.collection('clients').delete(id, { $autoCancel: false });
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error('Failed to delete client');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} clients?`)) return;
    try {
      for (const id of selectedIds) {
        await pb.collection('clients').delete(id, { $autoCancel: false });
      }
      toast.success(`${selectedIds.size} clients deleted`);
      fetchClients();
    } catch (err) {
      toast.error('Some deletions failed. Please refresh.');
      fetchClients();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-normal">Active</Badge>;
      case 'Inactive': return <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-normal">Inactive</Badge>;
      case 'Suspended': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-normal">Suspended</Badge>;
      default: return <Badge variant="outline" className="font-normal">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Company': return <Building className="w-4 h-4 text-muted-foreground" />;
      case 'Individual': return <User className="w-4 h-4 text-muted-foreground" />;
      case 'Retailer': return <Store className="w-4 h-4 text-muted-foreground" />;
      default: return <Building className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <Helmet>
        <title>Clients Directory | Logistics Management</title>
      </Helmet>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Clients Directory</h1>
            <p className="text-muted-foreground mt-1">Manage all your client accounts and details.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/bulk-upload"><Download className="w-4 h-4 mr-2" /> Import</Link>
            </Button>
            <Button className="bg-client-primary text-client-primary-foreground hover:bg-client-primary/90" asChild>
              <Link to="/clients/new"><Plus className="w-4 h-4 mr-2" /> Add Client</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border shadow-sm mb-6 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex-1 flex gap-4 flex-wrap md:flex-nowrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search clients..." 
                    className="pl-9 w-full bg-background"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                  />
                </div>
                <Select value={filters.type} onValueChange={(val) => { setFilters(f => ({ ...f, type: val })); setPagination(p => ({ ...p, page: 1 })); }}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Client Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                    <SelectItem value="Retailer">Retailer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.billingType} onValueChange={(val) => { setFilters(f => ({ ...f, billingType: val })); setPagination(p => ({ ...p, page: 1 })); }}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Billing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Billing</SelectItem>
                    <SelectItem value="Spot">Spot</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(val) => { setFilters(f => ({ ...f, status: val })); setPagination(p => ({ ...p, page: 1 })); }}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 min-w-[150px]">
                <Select value={sort} onValueChange={(val) => { setSort(val); setPagination(p => ({ ...p, page: 1 })); }}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created">Newest First</SelectItem>
                    <SelectItem value="created">Oldest First</SelectItem>
                    <SelectItem value="client_name">Name (A-Z)</SelectItem>
                    <SelectItem value="-client_name">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedIds.size > 0 && (
              <div className="mt-4 p-2 bg-muted/50 rounded-lg flex items-center justify-between border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-sm font-medium ml-2">{selectedIds.size} client(s) selected</span>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card overflow-hidden">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={clients.length > 0 && selectedIds.size === clients.length} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Client Profile</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type & Industry</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-base font-medium text-foreground">No clients found</p>
                        <p className="text-sm mb-4">Try adjusting your filters or add a new client.</p>
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setFilters({ type: 'all', status: 'all', billingType: 'all' }); }}>Clear Filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map(client => (
                    <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(client.id)} onCheckedChange={() => toggleSelect(client.id)} aria-label={`Select ${client.client_name}`} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-client-primary/10 flex items-center justify-center text-client-primary font-semibold shrink-0">
                            {client.client_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{client.client_name}</p>
                            {client.company_name && <p className="text-xs text-muted-foreground mt-0.5">{client.company_name}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{client.email}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 mb-1 text-sm">
                          {getTypeIcon(client.client_type)}
                          <span className="font-medium text-foreground">{client.client_type || 'Unknown'}</span>
                        </div>
                        {client.industry && <p className="text-xs text-muted-foreground ml-6">{client.industry}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {client.billing_type || 'Spot'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(client.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:bg-amber-500/10"
                            title="Manage POD Courier Addresses"
                            onClick={() => setPodAddressModalClient(client)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {(client.google_maps_url || client.google_map_link || client.location_url || client.address) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                              title="Open Location on Google Maps"
                              onClick={() => {
                                const target = client.google_maps_url || client.google_map_link || client.location_url || [client.address, client.city, client.state].filter(Boolean).join(', ');
                                openMapLocation(target);
                              }}
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:bg-amber-500/10"
                            title="Manage POD Courier Addresses"
                            onClick={() => setPodAddressModalClient(client)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {(client.google_maps_url || client.google_map_link || client.location_url || client.address) && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    const target = client.google_maps_url || client.google_map_link || client.location_url || [client.address, client.city, client.state].filter(Boolean).join(', ');
                                    openMapLocation(target);
                                  }} 
                                  className="cursor-pointer text-rose-600 dark:text-rose-400 font-medium"
                                >
                                  <MapPin className="h-4 w-4 mr-2 text-rose-500" /> Open Location
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setPodAddressModalClient(client)} className="cursor-pointer text-amber-600 dark:text-amber-400 font-semibold">
                                <Mail className="h-4 w-4 mr-2 text-amber-500" /> POD Courier Addresses
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPortalModalClient(client)} className="cursor-pointer text-primary font-semibold">
                                <ShieldCheck className="h-4 w-4 mr-2 text-primary" /> Setup Portal Login
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to={`/client/${client.id}`}><Eye className="h-4 w-4 mr-2" /> View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to={`/clients/${client.id}/edit`}><Edit2 className="h-4 w-4 mr-2" /> Edit Client</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-destructive cursor-pointer focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View (Hidden on desktop) */}
          <div className="block md:hidden divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Users className="w-8 h-8 opacity-30 mx-auto mb-2" />
                No clients found.
              </div>
            ) : (
              clients.map(client => (
                <div key={client.id} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-1">
                        <Checkbox checked={selectedIds.has(client.id)} onCheckedChange={() => toggleSelect(client.id)} aria-label={`Select ${client.client_name}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">{client.client_name}</h4>
                        {client.company_name && <p className="text-xs text-muted-foreground mt-0.5 truncate">{client.company_name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getStatusBadge(client.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground border border-border/20 rounded-md">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPodAddressModalClient(client)} className="cursor-pointer text-amber-600 dark:text-amber-400 font-semibold">
                            <Mail className="h-4 w-4 mr-2 text-amber-500" /> POD Addresses
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to={`/client/${client.id}`}><Eye className="h-4 w-4 mr-2" /> View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to={`/clients/${client.id}/edit`}><Edit2 className="h-4 w-4 mr-2" /> Edit Client</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-destructive cursor-pointer focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-border/20">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold tracking-wider">Type</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getTypeIcon(client.client_type)}
                        <span className="font-medium text-foreground">{client.client_type || 'Unknown'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-semibold tracking-wider">Billing</span>
                      <span className="font-medium text-foreground block mt-0.5">{client.billing_type || 'Spot'}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    {client.email && (
                      <div>
                        <span className="text-muted-foreground text-[9px] uppercase font-semibold tracking-wider mr-1.5 font-mono">Email:</span>
                        <span className="text-foreground font-medium">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <span className="text-muted-foreground text-[9px] uppercase font-semibold tracking-wider mr-1.5 font-mono">Phone:</span>
                        <span className="text-foreground font-medium">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {pagination.total > pagination.perPage && (
            <div className="p-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} entries
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.page * pagination.perPage >= pagination.total}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {portalModalClient && (
        <CreateClientUserModal
          isOpen={!!portalModalClient}
          onClose={() => setPortalModalClient(null)}
          client={portalModalClient}
          onSuccess={fetchClients}
        />
      )}

      {podAddressModalClient && (
        <ClientPodAddressesModal
          isOpen={!!podAddressModalClient}
          onClose={() => setPodAddressModalClient(null)}
          client={podAddressModalClient}
        />
      )}
    </div>
  );
}

function ClientPodAddressesModal({ isOpen, onClose, client }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const clientDisplayName = client?.company_name || client?.client_name || '';

  const emptyForm = () => ({
    title: '',
    company_name: clientDisplayName,
    attention_to: 'Billing & POD Clearance Desk',
    contact_person: client?.contact_person || '',
    phone: client?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: addresses.length === 0
  });

  const [form, setForm] = useState(emptyForm);

  const loadAddresses = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const safeName = clientDisplayName.replace(/"/g, '\\"');
      const filter = safeName
        ? `client_id = "${client.id}" || company_name = "${safeName}" || client_name = "${safeName}"`
        : `client_id = "${client.id}"`;
      const res = await pb.collection('courier_addresses').getFullList({
        filter,
        sort: '-is_default',
        $autoCancel: false
      });
      setAddresses(res);
    } catch (err) {
      console.error('Failed to load POD addresses:', err);
      toast.error('Failed to load POD courier addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && client) {
      setShowForm(false);
      setEditingId(null);
      loadAddresses();
    }
  }, [isOpen, client?.id]);

  const openAddForm = (prefillFromClient = false) => {
    setEditingId(null);
    if (prefillFromClient && client) {
      setForm({
        title: `${clientDisplayName} - Main Office`,
        company_name: clientDisplayName,
        attention_to: client.contact_person ? `${client.contact_person} (Billing Desk)` : 'Billing & POD Clearance Desk',
        contact_person: client.contact_person || '',
        phone: client.phone || '',
        address_line1: client.address || '',
        address_line2: client.gst_number ? `GSTIN: ${client.gst_number}` : '',
        city: client.city || '',
        state: client.state || '',
        pincode: client.postal_code || client.pincode || '',
        is_default: addresses.length === 0
      });
    } else {
      setForm({
        title: '',
        company_name: clientDisplayName,
        attention_to: 'Billing & POD Clearance Desk',
        contact_person: client?.contact_person || '',
        phone: client?.phone || '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: addresses.length === 0
      });
    }
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setEditingId(addr.id);
    setForm({
      title: addr.title || '',
      company_name: addr.company_name || clientDisplayName,
      attention_to: addr.attention_to || '',
      contact_person: addr.contact_person || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      is_default: Boolean(addr.is_default)
    });
    setShowForm(true);
  };

  const clearOtherDefaults = async (excludeId = null) => {
    const others = addresses.filter(a => a.is_default && a.id !== excludeId);
    for (const o of others) {
      await pb.collection('courier_addresses').update(o.id, { is_default: false }, { $autoCancel: false }).catch(() => {});
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.address_line1.trim()) {
      toast.error('Address Line 1 is required');
      return;
    }
    if (!form.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Mobile / Phone number is required');
      return;
    }
    setSaving(true);
    try {
      if (form.is_default) {
        await clearOtherDefaults(editingId);
      }
      const payload = {
        title: form.title.trim() || `${form.company_name.trim() || clientDisplayName} (${form.city.trim()})`,
        company_name: form.company_name.trim() || clientDisplayName,
        attention_to: form.attention_to.trim(),
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        email: client?.email || '',
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        category: 'Client POD Desk',
        client_id: client.id,
        client_name: client.client_name || clientDisplayName,
        is_default: Boolean(form.is_default)
      };

      if (editingId) {
        await pb.collection('courier_addresses').update(editingId, payload, { $autoCancel: false });
        toast.success('POD courier address updated');
      } else {
        await pb.collection('courier_addresses').create(payload, { $autoCancel: false });
        toast.success('POD courier address added');
      }
      setShowForm(false);
      setEditingId(null);
      await loadAddresses();
    } catch (err) {
      console.error('Failed to save POD address:', err);
      toast.error('Failed to save POD courier address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await clearOtherDefaults(addr.id);
      await pb.collection('courier_addresses').update(addr.id, { is_default: true }, { $autoCancel: false });
      toast.success(`"${addr.title || addr.city}" set as default POD address`);
      await loadAddresses();
    } catch (err) {
      console.error('Failed to set default:', err);
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddr = async (addr) => {
    if (!window.confirm(`Delete POD address "${addr.title || addr.address_line1}"?`)) return;
    try {
      await pb.collection('courier_addresses').delete(addr.id, { $autoCancel: false });
      toast.success('POD address deleted');
      await loadAddresses();
    } catch (err) {
      console.error('Failed to delete POD address:', err);
      toast.error('Failed to delete POD address');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Mail className="w-5 h-5 text-amber-500" />
            POD Courier Addresses — {clientDisplayName}
          </DialogTitle>
          <DialogDescription>
            Add multiple POD delivery addresses for this client. Mark any one as default for quick selection during dispatch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!showForm && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {addresses.length} saved POD {addresses.length === 1 ? 'address' : 'addresses'}
              </span>
              <div className="flex gap-2">
                {client?.address && (
                  <Button type="button" variant="outline" size="sm" onClick={() => openAddForm(true)}>
                    <Building className="w-3.5 h-3.5 mr-1.5" /> Copy from Client Profile
                  </Button>
                )}
                <Button type="button" size="sm" onClick={() => openAddForm(false)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add POD Address
                </Button>
              </div>
            </div>
          )}

          {showForm ? (
            <form onSubmit={handleSave} className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h4 className="font-bold text-sm">{editingId ? 'Edit POD Courier Address' : 'New POD Courier Address'}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Address Label / Branch Name</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Bangalore Billing Desk"
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company / Recipient Name *</Label>
                  <Input
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="Company Name"
                    className="bg-background h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Attention / Desk</Label>
                  <Input
                    value={form.attention_to}
                    onChange={(e) => setForm({ ...form, attention_to: e.target.value })}
                    placeholder="e.g. Billing Desk"
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Person</Label>
                  <Input
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    placeholder="Contact Name"
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mobile / Phone Number *</Label>
                  <Input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9538874625"
                    className="bg-background h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Address Line 1 *</Label>
                <Input
                  required
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="Door No, Street, Building, Area"
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Address Line 2 / Landmark (Optional)</Label>
                <Input
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  placeholder="Landmark, Floor, Sector"
                  className="bg-background h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State"
                    className="bg-background h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode</Label>
                  <Input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="e.g. 560002"
                    className="bg-background h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="rounded border-border"
                />
                <span>Make this the default POD courier address for {clientDisplayName}</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                </Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground space-y-2">
              <MapPin className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium text-foreground">No POD courier addresses added yet</p>
              <p className="text-xs">Add one or copy from the client&apos;s main profile address.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    addr.is_default
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-border bg-background/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{addr.title || addr.company_name}</span>
                        {addr.is_default && (
                          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                            <Star className="w-3 h-3 mr-1 fill-amber-500" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground/90">
                        {addr.company_name}
                        {addr.attention_to ? ` • Attn: ${addr.attention_to}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[addr.address_line1, addr.address_line2].filter(Boolean).join(', ')}
                        {(addr.city || addr.state || addr.pincode) ? ` — ${[addr.city, addr.state].filter(Boolean).join(', ')}${addr.pincode ? ' - ' + addr.pincode : ''}` : ''}
                      </p>
                      <div className="flex items-center gap-3 text-xs pt-0.5">
                        {addr.contact_person && (
                          <span className="text-muted-foreground">Contact: <strong className="text-foreground">{addr.contact_person}</strong></span>
                        )}
                        {addr.phone && (
                          <span className="font-mono font-semibold text-emerald-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {addr.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.is_default && (
                        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px]" onClick={() => handleSetDefault(addr)}>
                          Set Default
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditForm(addr)} title="Edit Address">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteAddr(addr)} title="Delete Address">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}