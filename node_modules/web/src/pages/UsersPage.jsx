import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, UserPlus, MoreHorizontal, Trash2, Key, AlertCircle, Shield, CheckCircle2, XCircle, ShieldCheck, Clock, Eye, Check, UserCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { usePageData } from '@/hooks/usePageData.js';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ApprovalModal from '@/components/ApprovalModal.jsx';
import RejectionModal from '@/components/RejectionModal.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const UsersPage = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMainTab = searchParams.get('tab') || 'users';

  // State for Users Tab
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'dispatcher' });

  // State for Financial Permissions
  const [permissionsDialog, setPermissionsDialog] = useState({ open: false, user: null });
  const [userPermissions, setUserPermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  // State for Signup Requests Tab
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [requestActiveTab, setRequestActiveTab] = useState('Pending');
  const [requestSortOrder, setRequestSortOrder] = useState('-requested_date');
  const [counts, setCounts] = useState({ Pending: 0, Approved: 0, Rejected: 0 });
  const [approvalModal, setApprovalModal] = useState({ open: false, data: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, data: null });

  // Fetch all users, filter locally for tabs
  const { data: users, loading, error, retry } = usePageData('users', { sort: '-created' });

  const handleMainTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await pb.collection('invitations').create({
        email: inviteData.email,
        role: inviteData.role,
        invited_by: pb.authStore.model.id,
        invitation_token: token,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      }, { $autoCancel: false });

      toast.success(`Invitation sent to ${inviteData.email}`);
      setIsInviteOpen(false);
      setInviteData({ email: '', role: 'dispatcher' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to send invitation');
    }
  };

  const handleDelete = async (id) => {
    try {
      await pb.collection('users').delete(id, { $autoCancel: false });
      toast.success('User deleted successfully');
      retry();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await pb.collection('users').update(user.id, { status: newStatus }, { $autoCancel: false });
      toast.success(`User marked as ${newStatus}`);
      retry();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await pb.collection('users').requestPasswordReset(email, { $autoCancel: false });
      toast.success(`Password reset link sent to ${email}`);
    } catch (err) {
      toast.error('Failed to send reset link');
    }
  };

  const handleOpenPermissions = async (user) => {
    setUserPermissions({});
    setPermissionsDialog({ open: true, user });
    try {
      const overrides = await pb.collection('user_permission_overrides').getFullList({
        filter: `user_id = "${user.id}"`,
        $autoCancel: false
      });
      
      const permissionsMap = {};
      overrides.forEach(o => {
        permissionsMap[o.resource] = o.is_allowed;
      });
      setUserPermissions(permissionsMap);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load permission overrides');
    }
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    const user = permissionsDialog.user;
    try {
      const modules = ['cashbook', 'expenses', 'payment_requests', 'credit_cards', 'payroll', 'emi_calculator'];
      
      const currentOverrides = await pb.collection('user_permission_overrides').getFullList({
        filter: `user_id = "${user.id}"`,
        $autoCancel: false
      });

      const currentOverridesMap = {};
      currentOverrides.forEach(o => {
        currentOverridesMap[o.resource] = o;
      });

      for (const moduleName of modules) {
        const isAllowed = !!userPermissions[moduleName];
        const existingRecord = currentOverridesMap[moduleName];

        if (existingRecord) {
          if (existingRecord.is_allowed !== isAllowed) {
            await pb.collection('user_permission_overrides').update(existingRecord.id, {
              is_allowed: isAllowed,
              granted_by: currentUser.id
            }, { $autoCancel: false });
          }
        } else if (isAllowed) {
          await pb.collection('user_permission_overrides').create({
            user_id: user.id,
            resource: moduleName,
            is_allowed: true,
            granted_by: currentUser.id
          }, { $autoCancel: false });
        }
      }

      toast.success('Financial permissions updated successfully');
      setPermissionsDialog({ open: false, user: null });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save permission overrides');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Signup Requests Fetching
  const fetchCounts = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Pending"', $autoCancel: false }),
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Approved"', $autoCancel: false }),
        pb.collection('signup_requests').getList(1, 1, { filter: 'status="Rejected"', $autoCancel: false })
      ]);
      setCounts({
        Pending: pending.totalItems,
        Approved: approved.totalItems,
        Rejected: rejected.totalItems
      });
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const filters = [`status = "${requestActiveTab}"`];
      if (requestSearchTerm) {
        filters.push(`(email ~ "${requestSearchTerm}" || full_name ~ "${requestSearchTerm}" || company_name ~ "${requestSearchTerm}")`);
      }
      const query = filters.join(' && ');

      const res = await pb.collection('signup_requests').getList(1, 100, {
        filter: query,
        sort: requestSortOrder,
        expand: 'approved_by',
        $autoCancel: false
      });
      
      setRequests(res.items);
      fetchCounts();
    } catch (err) {
      console.error("Failed to fetch signup requests", err);
      if (activeMainTab === 'signup-requests') {
        toast.error("Failed to load requests.");
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchCounts(); // Always fetch counts on mount so badge is accurate
  }, []);

  useEffect(() => {
    if (activeMainTab === 'signup-requests') {
      const timer = setTimeout(() => {
        fetchRequests();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [requestSearchTerm, requestActiveTab, requestSortOrder, activeMainTab]);

  const searchedUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const activeUsers = searchedUsers.filter(u => u.status === 'active' || !u.status);
  const inactiveUsers = searchedUsers.filter(u => u.status === 'inactive');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-normal"><ShieldCheck className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'Rejected': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-normal"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'Pending': return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-normal"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default: return <Badge variant="outline" className="font-normal">{status}</Badge>;
    }
  };

  const renderUserTable = (data, emptyMsg) => (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>User Details</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">{emptyMsg}</TableCell></TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.full_name || user.name || 'Unnamed'}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize bg-secondary/5 text-secondary border-secondary/20">
                    {user.role?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    (!user.status || user.status === 'active') 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }>
                    {user.status || 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {format(new Date(user.created), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 border border-transparent hover:border-border hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleResetPassword(user.email)} className="cursor-pointer">
                        <Key className="w-4 h-4 mr-2" /> Send Reset Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusToggle(user)} className="cursor-pointer">
                        {user.status === 'inactive' ? (
                          <><CheckCircle2 className="w-4 h-4 mr-2 text-success" /> Activate User</>
                        ) : (
                          <><XCircle className="w-4 h-4 mr-2 text-warning" /> Deactivate User</>
                        )}
                      </DropdownMenuItem>
                      {(user.role === 'supervisor' || user.role === 'dispatcher') && (
                        <DropdownMenuItem onClick={() => handleOpenPermissions(user)} className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2 text-primary" /> Financial Permissions
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete User Account</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete <span className="font-semibold text-foreground">{user.email}</span>? This action cannot be undone and will remove their access to the system.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-6">
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDelete(user.id)}>Yes, Delete User</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) return <LoadingSpinner text="Loading user directory..." />;

  if (error) return (
    <div className="p-12 text-center flex flex-col items-center min-h-[50vh] justify-center">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={retry}>Try Again</Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>User Management - Jai Bhavani Cargo</title>
      </Helmet>
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>User Management</h1>
            <p className="text-muted-foreground mt-1">Manage staff access, system roles, and account requests.</p>
          </div>
          
          {activeMainTab === 'users' && (
            <Sheet open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <SheetTrigger asChild>
                <Button className="bg-primary text-primary-foreground shadow-sm gap-2 rounded-xl">
                  <UserPlus className="w-4 h-4" /> Invite New User
                </Button>
              </SheetTrigger>
              <SheetContent className="border-l border-border bg-background">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-2xl font-bold">Send Invitation</SheetTitle>
                  <CardDescription>Invite a new staff member to join the platform.</CardDescription>
                </SheetHeader>
                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="staff@company.com"
                      required 
                      value={inviteData.email} 
                      onChange={e => setInviteData({...inviteData, email: e.target.value})}
                      className="bg-input" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Assign Role</label>
                    <Select value={inviteData.role} onValueChange={v => setInviteData({...inviteData, role: v})}>
                      <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-primary/90 flex gap-3 items-start">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>They will receive an email with a secure link to set their password. The link expires in 7 days.</p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base rounded-xl mt-4">Send Invitation Email</Button>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <Tabs value={activeMainTab} onValueChange={handleMainTabChange} className="w-full">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:shadow-sm">
              User Directory
            </TabsTrigger>
            <TabsTrigger value="signup-requests" className="rounded-lg data-[state=active]:shadow-sm flex items-center gap-2">
              Signup Requests 
              {counts.Pending > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {counts.Pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6 m-0 animate-in fade-in duration-300">
            <Tabs defaultValue="active" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
                  <TabsTrigger value="active" className="rounded-lg">Active Users</TabsTrigger>
                  <TabsTrigger value="inactive" className="rounded-lg">Inactive</TabsTrigger>
                  <TabsTrigger value="roles" className="rounded-lg">Roles & Access</TabsTrigger>
                  <TabsTrigger value="permissions" className="rounded-lg hidden md:flex">Permissions</TabsTrigger>
                </TabsList>
                
                <div className="relative w-full sm:max-w-xs shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9 bg-card border-border shadow-sm rounded-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="active" className="m-0 animate-in fade-in duration-300">
                {renderUserTable(activeUsers, "No active users match your search.")}
              </TabsContent>

              <TabsContent value="inactive" className="m-0 animate-in fade-in duration-300">
                {renderUserTable(inactiveUsers, "No inactive users found.")}
              </TabsContent>

              <TabsContent value="roles" className="m-0 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['admin', 'manager', 'dispatcher'].map(role => {
                    const roleUsers = users.filter(u => u.role === role);
                    return (
                      <Card key={role} className="border-border shadow-sm bg-card">
                        <CardHeader className="pb-3 border-b border-border/50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="capitalize text-lg">{role}</CardTitle>
                            <Badge variant="secondary">{roleUsers.length}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                          {roleUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No users assigned to this role.</p>
                          ) : (
                            <div className="space-y-3">
                              {roleUsers.slice(0, 5).map(u => (
                                <div key={u.id} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                    {u.full_name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{u.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                  </div>
                                </div>
                              ))}
                              {roleUsers.length > 5 && (
                                <p className="text-xs text-center text-muted-foreground pt-2">+ {roleUsers.length - 5} more</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="m-0 animate-in fade-in duration-300">
                <Card className="border-border shadow-sm bg-card">
                  <CardHeader>
                    <CardTitle>Role Permissions Matrix</CardTitle>
                    <CardDescription>Overview of what each role is permitted to do in the system.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Module / Action</TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                            <TableHead className="text-center">Manager</TableHead>
                            <TableHead className="text-center">Dispatcher</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { module: 'Manage Users & Roles', admin: true, mgr: false, disp: false },
                            { module: 'Delete Trip Records', admin: true, mgr: false, disp: false },
                            { module: 'Payroll & Salary', admin: true, mgr: false, disp: false },
                            { module: 'Create/Edit Trips', admin: true, mgr: true, disp: true },
                            { module: 'View Reports', admin: true, mgr: true, disp: false },
                            { module: 'Log Expenses', admin: true, mgr: true, disp: true },
                          ].map((perm, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{perm.module}</TableCell>
                              <TableCell className="text-center">{perm.admin ? <CheckCircle2 className="w-4 h-4 mx-auto text-success" /> : <XCircle className="w-4 h-4 mx-auto text-muted-foreground/30" />}</TableCell>
                              <TableCell className="text-center">{perm.mgr ? <CheckCircle2 className="w-4 h-4 mx-auto text-success" /> : <XCircle className="w-4 h-4 mx-auto text-muted-foreground/30" />}</TableCell>
                              <TableCell className="text-center">{perm.disp ? <CheckCircle2 className="w-4 h-4 mx-auto text-success" /> : <XCircle className="w-4 h-4 mx-auto text-muted-foreground/30" />}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="signup-requests" className="space-y-6 m-0 animate-in fade-in duration-300">
            <Tabs value={requestActiveTab} onValueChange={setRequestActiveTab} className="w-full">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted/50 p-1 rounded-xl mb-6">
                <TabsTrigger value="Pending" className="rounded-lg data-[state=active]:shadow-sm">
                  Pending ({counts.Pending})
                </TabsTrigger>
                <TabsTrigger value="Approved" className="rounded-lg data-[state=active]:shadow-sm">
                  Approved ({counts.Approved})
                </TabsTrigger>
                <TabsTrigger value="Rejected" className="rounded-lg data-[state=active]:shadow-sm">
                  Rejected ({counts.Rejected})
                </TabsTrigger>
              </TabsList>

              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex-1 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search by name, email, or company..." 
                          className="pl-9 bg-background"
                          value={requestSearchTerm}
                          onChange={(e) => setRequestSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Select value={requestSortOrder} onValueChange={setRequestSortOrder}>
                        <SelectTrigger className="w-[180px] bg-background">
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
                      {loadingRequests ? (
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
                              <p className="text-sm">No {requestActiveTab.toLowerCase()} signup requests match your current filters.</p>
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
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="text-muted-foreground"
                                    onClick={() => {
                                      toast.info(
                                        <div className="space-y-1">
                                          <p className="font-semibold">Reason:</p>
                                          <p className="text-sm italic">"{req.reason || 'No reason provided.'}"</p>
                                        </div>, 
                                        { duration: 8000 }
                                      );
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
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
                                    }} className="cursor-pointer">
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
            </Tabs>

            <ApprovalModal 
              isOpen={approvalModal.open} 
              onClose={() => setApprovalModal({ open: false, data: null })} 
              requestData={approvalModal.data}
              currentUser={currentUser}
              onSuccess={() => { fetchRequests(); fetchCounts(); }}
            />
            <RejectionModal 
              isOpen={rejectionModal.open} 
              onClose={() => setRejectionModal({ open: false, data: null })} 
              requestData={rejectionModal.data}
              currentUser={currentUser}
              onSuccess={() => { fetchRequests(); fetchCounts(); }}
            />

            {/* Financial Permissions Dialog */}
            <Dialog open={permissionsDialog.open} onOpenChange={(open) => setPermissionsDialog({ open, user: open ? permissionsDialog.user : null })}>
              <DialogContent className="sm:max-w-md bg-background border-border">
                <DialogHeader>
                  <DialogTitle>Financial Permissions Delegation</DialogTitle>
                  <DialogDescription>
                    Grant specific financial access overrides to <span className="font-semibold text-foreground">{permissionsDialog.user?.full_name || permissionsDialog.user?.email}</span>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-6">
                  {[
                    { id: 'cashbook', label: 'Cashbook', desc: 'Allow read/write access to cash transactions and ledgers.' },
                    { id: 'expenses', label: 'Expenses', desc: 'Allow logging and viewing operational expenses.' },
                    { id: 'payment_requests', label: 'Payment Requests', desc: 'Allow submitting and viewing vendor/staff payment requests.' },
                    { id: 'credit_cards', label: 'Credit Cards', desc: 'Allow managing credit cards and limits.' },
                    { id: 'payroll', label: 'Payroll', desc: 'Allow payroll calculations and disbursements.' },
                    { id: 'emi_calculator', label: 'EMI Calculator', desc: 'Allow accessing loan and EMI calculators.' }
                  ].map((module) => (
                    <div key={module.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
                      <input
                        type="checkbox"
                        id={`perm-${module.id}`}
                        checked={!!userPermissions[module.id]}
                        onChange={(e) => setUserPermissions({ ...userPermissions, [module.id]: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary mt-1 cursor-pointer"
                      />
                      <div className="space-y-1 cursor-pointer select-none" onClick={() => setUserPermissions({ ...userPermissions, [module.id]: !userPermissions[module.id] })}>
                        <label htmlFor={`perm-${module.id}`} className="text-sm font-semibold text-foreground cursor-pointer">
                          {module.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{module.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setPermissionsDialog({ open: false, user: null })}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePermissions} disabled={savingPermissions}>
                    {savingPermissions ? 'Saving...' : 'Save Permissions'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UsersPage;