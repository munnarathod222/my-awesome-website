import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, Trash2, Edit2, Eye, Download, Users, Building, User, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

export default function ClientsListPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', billingType: 'all' });
  const [sort, setSort] = useState('-created');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [pagination, setPagination] = useState({ page: 1, perPage: 25, total: 0 });

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
          <div className="overflow-x-auto">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
    </div>
  );
}