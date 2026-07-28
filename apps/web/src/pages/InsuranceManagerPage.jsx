import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  ShieldAlert, DollarSign, Clock, CheckCircle2, XCircle, 
  RefreshCw, Plus, Search, Filter, Image as ImageIcon, 
  ExternalLink, Pencil, Trash2, Printer, ChevronRight, FileText, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import LogInsuranceClaimModal from '@/components/LogInsuranceClaimModal.jsx';
import ViewClaimImagesModal from '@/components/ViewClaimImagesModal.jsx';

export default function InsuranceManagerPage() {
  const [claims, setClaims] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [claimToEdit, setClaimToEdit] = useState(null);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [selectedClaimForImages, setSelectedClaimForImages] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, trucksRes] = await Promise.all([
        pb.collection('insurance_claims').getFullList({ sort: '-created', $autoCancel: false }).catch(() => []),
        pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }).catch(() => [])
      ]);

      setClaims(claimsRes || []);
      setTrucks(trucksRes || []);
    } catch (err) {
      console.error('Failed to load insurance claims:', err);
      toast.error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregated Summary Statistics
  const stats = useMemo(() => {
    const totalCount = claims.length;
    const totalClaimed = claims.reduce((sum, c) => sum + (Number(c.claimed_amount) || 0), 0);
    const totalApproved = claims.reduce((sum, c) => sum + (Number(c.approved_amount) || 0), 0);
    const totalReceived = claims.reduce((sum, c) => sum + (Number(c.amount_received) || 0), 0);

    const pendingClaims = claims.filter(c => c.status === 'Pending');
    const pendingCount = pendingClaims.length;
    const pendingAmount = pendingClaims.reduce((sum, c) => sum + (Number(c.claimed_amount) || 0), 0);

    const approvedClaims = claims.filter(c => c.status === 'Approved');
    const approvedCount = approvedClaims.length;
    const approvedAmount = approvedClaims.reduce((sum, c) => sum + (Number(c.approved_amount) || 0), 0);

    const settledClaims = claims.filter(c => c.status === 'Settled');
    const settledCount = settledClaims.length;

    const rejectedClaims = claims.filter(c => c.status === 'Rejected');
    const rejectedCount = rejectedClaims.length;
    const rejectedAmount = rejectedClaims.reduce((sum, c) => sum + (Number(c.claimed_amount) || 0), 0);

    return {
      totalCount,
      totalClaimed,
      totalApproved,
      totalReceived,
      pendingCount,
      pendingAmount,
      approvedCount,
      approvedAmount,
      settledCount,
      rejectedCount,
      rejectedAmount
    };
  }, [claims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (c.truck_number || '').toLowerCase().includes(q) ||
        (c.claim_number || '').toLowerCase().includes(q) ||
        (c.insurance_company || '').toLowerCase().includes(q) ||
        (c.driver_name || '').toLowerCase().includes(q) ||
        (c.claim_type || '').toLowerCase().includes(q);

      const matchesTruck = selectedTruck === 'ALL' || c.truck_number === selectedTruck;

      let matchesTab = true;
      if (activeTab === 'PENDING') matchesTab = c.status === 'Pending';
      if (activeTab === 'APPROVED') matchesTab = c.status === 'Approved';
      if (activeTab === 'SETTLED') matchesTab = c.status === 'Settled';
      if (activeTab === 'REJECTED') matchesTab = c.status === 'Rejected';

      return matchesSearch && matchesTruck && matchesTab;
    });
  }, [claims, searchQuery, selectedTruck, activeTab]);

  const handleDeleteClaim = async (claimId, claimNumber) => {
    if (!window.confirm(`Are you sure you want to delete claim "${claimNumber}"?`)) return;

    try {
      await pb.collection('insurance_claims').delete(claimId);
      toast.success(`Claim "${claimNumber}" deleted successfully.`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete claim:', err);
      toast.error('Failed to delete claim');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold px-2.5 py-0.5">🟡 Pending Review</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold px-2.5 py-0.5">🔵 Approved</Badge>;
      case 'Settled':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold px-2.5 py-0.5">🟢 Amount Received</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold px-2.5 py-0.5">🔴 Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const parseImages = (jsonStr) => {
    try {
      return typeof jsonStr === 'string' ? JSON.parse(jsonStr || '[]') : (jsonStr || []);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans print:p-0 print:max-w-none">
      <Helmet>
        <title>Insurance Claims & Settlement Manager | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5" style={{letterSpacing: '-0.02em'}}>
            <ShieldAlert className="w-8 h-8 text-primary" /> Insurance Claims Manager
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
              📸 With Accident Photos & Evidence
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track vehicle accident claims, pending surveyor approvals, settled bank payouts, & evidence photo galleries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl border-border/80 text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm" className="rounded-xl border-border/80">
            <Printer className="w-3.5 h-3.5 mr-2" /> Print Summary
          </Button>
          <Button 
            onClick={() => {
              setClaimToEdit(null);
              setIsLogModalOpen(true);
            }} 
            className="rounded-xl shadow-md font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Log Insurance Claim
          </Button>
        </div>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 print:grid-cols-5">
        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Claims Logged</CardTitle>
            <ShieldAlert className="w-4 h-4 text-blue-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div>
                <div className="text-2xl font-extrabold font-mono text-foreground">
                  ₹{stats.totalClaimed.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stats.totalCount} Total Claims Submitted</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-yellow-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Claims</CardTitle>
            <Clock className="w-4 h-4 text-amber-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div>
                <div className="text-2xl font-extrabold font-mono text-amber-400">
                  ₹{stats.pendingAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stats.pendingCount} Claims Awaiting Approval</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved Claims</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div>
                <div className="text-2xl font-extrabold font-mono text-cyan-400">
                  ₹{stats.approvedAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stats.approvedCount} Claims Approved by Insurer</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Received (Settled)</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400">
                  ₹{stats.totalReceived.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stats.settledCount} Claims Settled in Bank</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden p-1 shadow-sm border-border/60 bg-card/45 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-pink-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rejected Claims</CardTitle>
            <XCircle className="w-4 h-4 text-rose-400 opacity-80" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div>
                <div className="text-2xl font-extrabold font-mono text-rose-400">
                  ₹{stats.rejectedAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stats.rejectedCount} Claims Rejected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 p-4 rounded-2xl border border-border/50 backdrop-blur-md print:hidden">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search claim no, truck, insurer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background rounded-xl h-10"
              />
            </div>

            <Select value={selectedTruck} onValueChange={setSelectedTruck}>
              <SelectTrigger className="w-[180px] bg-background h-10 rounded-xl">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vehicles ({claims.length})</SelectItem>
                {trucks.map(t => (
                  <SelectItem key={t.id || t.truck_number} value={t.truck_number}>
                    {t.truck_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Switch */}
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table List
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/40 p-1 rounded-xl border border-border/50 grid grid-cols-2 sm:grid-cols-5 w-full">
            <TabsTrigger value="ALL" className="rounded-lg text-xs font-bold">
              All Claims ({claims.length})
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="rounded-lg text-xs font-bold text-amber-400">
              🟡 Pending ({stats.pendingCount})
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="rounded-lg text-xs font-bold text-blue-400">
              🔵 Approved ({stats.approvedCount})
            </TabsTrigger>
            <TabsTrigger value="SETTLED" className="rounded-lg text-xs font-bold text-emerald-400">
              🟢 Amount Received ({stats.settledCount})
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="rounded-lg text-xs font-bold text-rose-400">
              🔴 Rejected ({stats.rejectedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid Card View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))
            ) : filteredClaims.length === 0 ? (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-card/40 rounded-2xl border border-border/50 space-y-3">
                <ShieldAlert className="w-12 h-12 opacity-30 mx-auto" />
                <p className="text-base font-semibold">No insurance claims found matching criteria.</p>
                <Button 
                  onClick={() => {
                    setClaimToEdit(null);
                    setIsLogModalOpen(true);
                  }}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log First Claim
                </Button>
              </div>
            ) : (
              filteredClaims.map(claim => {
                const images = parseImages(claim.images_json);
                return (
                  <Card key={claim.id} className="relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-all shadow-md group">
                    <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-lg text-foreground font-mono">{claim.truck_number}</span>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mt-1">
                          {claim.claim_number} • {claim.insurance_company}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setClaimToEdit(claim);
                            setIsLogModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                          title="Edit Claim"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClaim(claim.id, claim.claim_number)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete Claim"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      {/* Image Preview Carousel / Thumbnails */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-primary" /> Photos & Documents ({images.length})
                          </span>
                          {images.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedClaimForImages(claim);
                                setIsImageGalleryOpen(true);
                              }}
                              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                            >
                              View All ({images.length}) <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {images.slice(0, 3).map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={() => {
                                  setSelectedClaimForImages(claim);
                                  setIsImageGalleryOpen(true);
                                }}
                                className="relative aspect-video rounded-xl overflow-hidden border border-border/60 bg-black/40 group/img"
                              >
                                <img src={imgUrl} alt={`Evidence ${imgIdx + 1}`} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setClaimToEdit(claim);
                              setIsLogModalOpen(true);
                            }}
                            className="p-3 bg-muted/20 rounded-xl border border-dashed border-border/60 text-center cursor-pointer hover:border-primary/40 transition-colors"
                          >
                            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 opacity-50" /> Click to add accident photos
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Claim Category & Details */}
                      <div className="text-xs space-y-1 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-semibold text-foreground">{claim.claim_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Incident Date:</span>
                          <span className="font-mono font-semibold text-foreground">{claim.incident_date}</span>
                        </div>
                        {claim.driver_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver:</span>
                            <span className="font-semibold text-foreground">{claim.driver_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Financial Payout Breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 bg-muted/30 rounded-xl">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Claimed</div>
                          <div className="font-mono font-bold text-xs text-foreground mt-0.5">
                            ₹{Number(claim.claimed_amount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <div className="text-[10px] text-blue-400 uppercase tracking-wider">Approved</div>
                          <div className="font-mono font-bold text-xs text-blue-400 mt-0.5">
                            ₹{Number(claim.approved_amount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Received</div>
                          <div className="font-mono font-extrabold text-xs text-emerald-400 mt-0.5">
                            ₹{Number(claim.amount_received || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <Card className="bg-card/60 border border-border/50 overflow-hidden backdrop-blur-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b-border/40">
                    <TableHead className="font-semibold text-muted-foreground pl-6 py-4">Vehicle & Claim No</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4">Photos</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4">Category & Insurer</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4">Incident Date</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Claimed (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Approved (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Amount Received (₹)</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right">Status</TableHead>
                    <TableHead className="font-semibold text-muted-foreground py-4 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                        No claims found matching criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map(claim => {
                      const images = parseImages(claim.images_json);
                      return (
                        <TableRow key={claim.id} className="hover:bg-muted/20 transition-colors border-b-border/30">
                          <TableCell className="pl-6 py-4">
                            <div className="font-bold text-base font-mono text-foreground">{claim.truck_number}</div>
                            <div className="text-xs text-muted-foreground font-mono">{claim.claim_number}</div>
                          </TableCell>

                          <TableCell className="py-4">
                            {images.length > 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedClaimForImages(claim);
                                  setIsImageGalleryOpen(true);
                                }}
                                className="relative w-12 h-9 rounded-lg overflow-hidden border border-border/60 bg-black/40 group"
                              >
                                <img src={images[0]} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No photos</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4 text-xs">
                            <div className="font-semibold text-foreground">{claim.claim_type}</div>
                            <div className="text-muted-foreground">{claim.insurance_company}</div>
                          </TableCell>

                          <TableCell className="py-4 font-mono text-xs text-foreground">
                            {claim.incident_date}
                          </TableCell>

                          <TableCell className="py-4 text-right font-mono font-bold text-sm text-foreground">
                            ₹{Number(claim.claimed_amount || 0).toLocaleString('en-IN')}
                          </TableCell>

                          <TableCell className="py-4 text-right font-mono font-bold text-sm text-blue-400">
                            ₹{Number(claim.approved_amount || 0).toLocaleString('en-IN')}
                          </TableCell>

                          <TableCell className="py-4 text-right font-mono font-extrabold text-sm text-emerald-400">
                            ₹{Number(claim.amount_received || 0).toLocaleString('en-IN')}
                          </TableCell>

                          <TableCell className="py-4 text-right">
                            {getStatusBadge(claim.status)}
                          </TableCell>

                          <TableCell className="py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setClaimToEdit(claim);
                                  setIsLogModalOpen(true);
                                }}
                                className="h-8 px-2 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Log / Edit Claim Modal */}
      <LogInsuranceClaimModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        claimToEdit={claimToEdit}
        trucks={trucks}
        onSuccess={fetchData}
      />

      {/* View Claim Images & Evidence Lightbox Modal */}
      <ViewClaimImagesModal
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
        claim={selectedClaimForImages}
      />
    </div>
  );
}
