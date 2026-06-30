import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, ShieldCheck, XCircle, Clock, Eye, MoreHorizontal, UserCheck, Check, Send, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ApprovalModal from '@/components/ApprovalModal.jsx';
import RejectionModal from '@/components/RejectionModal.jsx';
import InvitationModal from '@/components/InvitationModal.jsx';

export default function AdminSignupRequestsPage() {
  const { currentUser } = useAuth();
  
  // Tab control
  const [mainTab, setMainTab] = useState('requests'); // 'requests' or 'invitations'

  // Signup Requests State
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsTab, setRequestsTab] = useState('Pending');
  const [requestsSort, setRequestsSort] = useState('-requested_date');
  const [requestsCounts, setRequestsCounts] = useState({ Pending: 0, Approved: 0, Rejected: 0 });

  // Invitations State
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [invitationsSearch, setInvitationsSearch] = useState('');
  const [invitationsStatus, setInvitationsStatus] = useState('all');
  
  // Modal states
  const [approvalModal, setApprovalModal] = useState({ open: false, data: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, data: null });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // ---------- SIGNUP REQUESTS LOGIC ----------
  const fetchRequestsCounts = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Pending"', $autoCancel: false }),
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Approved"', $autoCancel: false }),
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Rejected"', $autoCancel: false })
      ]);
      setRequestsCounts({
        Pending: pending.totalItems,
        Approved: approved.totalItems,
        Rejected: rejected.totalItems
      });
    } catch (err) {
      console.error("Failed to fetch requests counts", err);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const filters = [`status = "${requestsTab}"`];
      if (requestsSearch) {
        filters.push(`(email ~ "${requestsSearch}" || full_name ~ "${requestsSearch}" || company_name ~ "${requestsSearch}")`);
      }
      const query = filters.join(' && ');

      const res = await pb.collection('signup_requests').getList(1, 100, {
        filter: query,
        sort: requestsSort,
        expand: 'approved_by',
        $autoCancel: false
      });
      
      setRequests(res.items);
      fetchRequestsCounts();
    } catch (err) {
      console.error("Failed to fetch signup requests", err);
      toast.error("Failed to load requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'requests') {
      const timer = setTimeout(() => {
        fetchRequests();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [requestsSearch, requestsTab, requestsSort, mainTab]);

  // ---------- INVITATIONS LOGIC ----------
  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      let filterQuery = [];
      if (invitationsStatus !== 'all') {
        filterQuery.push(`status = "${invitationsStatus}"`);
      }
      if (invitationsSearch) {
        filterQuery.push(`(email ~ "${invitationsSearch}" || invited_by_name ~ "${invitationsSearch}")`);
      }

      const res = await pb.collection('invitations').getList(1, 100, {
        filter: filterQuery.length > 0 ? filterQuery.join(' && ') : '',
        sort: '-created',
        $autoCancel: false
      });

      setInvitations(res.items);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      toast.error("Failed to load invitations.");
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'invitations') {
      const timer = setTimeout(() => {
        fetchInvitations();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [invitationsSearch, invitationsStatus, mainTab]);

  const handleResendInvitation = async (invitation) => {
    try {
      const response = await apiServerClient.fetch('/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitation.email,
          role: invitation.role,
          invited_by_name: currentUser?.full_name || currentUser?.name || 'Admin'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend');
      
      toast.success('Invitation resent successfully');
      fetchInvitations();
    } catch (err) {
      toast.error(err.message || 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (id) => {
    try {
      await pb.collection('invitations').update(id, { status: 'cancelled' }, { $autoCancel: false });
      toast.success('Invitation cancelled');
      fetchInvitations();
    } catch (err) {
      toast.error('Failed to cancel invitation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': 
      case 'accepted': 
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-normal"><ShieldCheck className="w-3 h-3 mr-1" /> {status}</Badge>;
      case 'rejected': 
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-normal"><XCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      case 'pending': 
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-normal"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-normal"><X className="w-3 h-3 mr-1" /> Expired</Badge>;
      default: 
        return <Badge variant="outline" className="font-normal capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Access Management | Admin Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>Access Management</h1>
          <p className="text-muted-foreground mt-1">Review signup requests and send out invitations.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Invite New User
        </Button>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-6 h-12 p-1 bg-muted/50 rounded-xl w-full sm:w-auto inline-flex">
          <TabsTrigger value="requests" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Signup Requests
          </TabsTrigger>
          <TabsTrigger value="invitations" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Sent Invitations
          </TabsTrigger>
        </TabsList>

        {/* --- SIGNUP REQUESTS TAB --- */}
        <TabsContent value="requests" className="space-y-6 m-0">
          <div className="grid w-full sm:w-auto grid-cols-3 bg-muted/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setRequestsTab('Pending')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${requestsTab === 'Pending' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pending ({requestsCounts.Pending})
            </button>
            <button
              onClick={() => setRequestsTab('Approved')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${requestsTab === 'Approved' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Approved ({requestsCounts.Approved})
            </button>
            <button
              onClick={() => setRequestsTab('Rejected')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${requestsTab === 'Rejected' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Rejected ({requestsCounts.Rejected})
            </button>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search requests..." 
                      className="pl-9 bg-background text-foreground"
                      value={requestsSearch}
                      onChange={(e) => setRequestsSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={requestsSort} onValueChange={setRequestsSort}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-requested_date">Newest First</SelectItem>
                      <SelectItem value="requested_date">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <UserCheck className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-base font-medium text-foreground">No requests found</p>
                          <p className="text-sm">No {requestsTab.toLowerCase()} signup requests match your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map(req => (
                      <TableRow key={req.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="font-medium text-foreground">{req.full_name}</div>
                          <div className="text-xs text-muted-foreground">{req.email}</div>
                          {req.phone && <div className="text-xs text-muted-foreground">{req.phone}</div>}
                        </TableCell>
                        <TableCell className="text-foreground">{req.company_name || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(req.requested_date), 'MMM dd, yyyy')}
                          <div className="text-xs">{format(new Date(req.requested_date), 'HH:mm')}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(req.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-success/50 text-success hover:bg-success/10 hover:text-success"
                                onClick={() => setApprovalModal({ open: true, data: req })}
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setRejectionModal({ open: true, data: req })}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  toast.info(
                                    <div className="space-y-1">
                                      <p className="font-semibold">Reason:</p>
                                      <p className="text-sm italic">"{req.reason || 'No reason provided.'}"</p>
                                      {req.notes && (
                                        <>
                                          <p className="font-semibold mt-2">Admin Notes:</p>
                                          <p className="text-sm">"{req.notes}"</p>
                                        </>
                                      )}
                                    </div>, 
                                    { duration: 8000 }
                                  );
                                }}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* --- INVITATIONS TAB --- */}
        <TabsContent value="invitations" className="space-y-6 m-0">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search invitations..." 
                      className="pl-9 bg-background text-foreground"
                      value={invitationsSearch}
                      onChange={(e) => setInvitationsSearch(e.target.value)}
                    />
                  </div>
                  <Select value={invitationsStatus} onValueChange={setInvitationsStatus}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Invited Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent On</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Send className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-base font-medium text-foreground">No invitations found</p>
                          <p className="text-sm">No invitations match your current filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map(inv => (
                      <TableRow key={inv.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="font-medium text-foreground">{inv.email}</div>
                          <div className="text-xs text-muted-foreground">by {inv.invited_by_name || 'System'}</div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize font-medium text-muted-foreground">{inv.role}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(inv.created), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(inv.expires_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(inv.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuLabel>Invitation Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                disabled={inv.status === 'accepted'}
                                onClick={() => handleResendInvitation(inv)}
                              >
                                <Send className="h-4 w-4 mr-2" /> Resend
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                disabled={inv.status !== 'pending'}
                                onClick={() => handleCancelInvitation(inv.id)}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Cancel
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ApprovalModal 
        isOpen={approvalModal.open} 
        onClose={() => setApprovalModal({ open: false, data: null })} 
        requestData={approvalModal.data}
        currentUser={currentUser}
        onSuccess={fetchRequests}
      />
      <RejectionModal 
        isOpen={rejectionModal.open} 
        onClose={() => setRejectionModal({ open: false, data: null })} 
        requestData={rejectionModal.data}
        currentUser={currentUser}
        onSuccess={fetchRequests}
      />
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchInvitations}
      />

    </div>
  );
}