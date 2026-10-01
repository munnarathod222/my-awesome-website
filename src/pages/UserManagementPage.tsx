import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Building2, Shield, Plus, 
  Search, RefreshCw, Edit, Trash2, Crown, Phone, Mail, 
  Lock, Unlock, Slash, Check, X, GitFork, User
} from 'lucide-react';

interface OrgUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role_id: string;
  role_name: string;
  role_slug: string;
  team_id: string;
  team_name: string;
  manager_id?: string | null;
  manager_name?: string;
  hierarchy_level?: number;
  status: 'ACTIVE' | 'REVOKED' | 'INACTIVE';
  designation?: string;
  avatar_color?: string;
  revocation_reason?: string;
}

interface OrgRole {
  id: string;
  name: string;
  slug: string;
  tier: number;
  tier_name: string;
  description: string;
  is_system?: boolean;
  permissions?: Record<string, string[]>;
}

interface OrgTeam {
  id: string;
  name: string;
  code: string;
  lead_id?: string;
  lead_name?: string;
  description?: string;
  cost_center?: string;
  color?: string;
  is_system?: boolean;
}

export const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'hierarchy' | 'roles' | 'teams'>('directory');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [teams, setTeams] = useState<OrgTeam[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrgState = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/org/state');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setRoles(data.roles || []);
          setTeams(data.teams || []);
        }
      }
    } catch (e) {
      console.warn('Failed to load org state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgState();
  }, []);

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const revokedCount = users.filter(u => u.status === 'REVOKED').length;

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTeam = filterTeam === 'ALL' || u.team_id === filterTeam;
      const matchesRole = filterRole === 'ALL' || u.role_id === filterRole || u.role_slug === filterRole;
      const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
      return matchesSearch && matchesTeam && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterTeam, filterRole, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white">Enterprise Organization &amp; Access Control</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">MNC Suite</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">Master workforce directory, department divisions, role-based access control, and hierarchy tree.</p>
          </div>
        </div>
        <button
          onClick={fetchOrgState}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white transition flex items-center gap-1.5 self-start lg:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync State</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Headcount</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{totalUsers}</div>
          <p className="text-[10px] text-slate-500 mt-1">Verified Personnel</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{activeCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Operational Credentials</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Access Revoked</span>
            <Slash className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">{revokedCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Security Quarantined</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Divisions</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300">{teams.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Cost Center Teams</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'directory' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Workforce Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'hierarchy' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Hierarchy Tree</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'roles' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Roles &amp; Permissions ({roles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'teams' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({teams.length})</span>
        </button>
      </div>

      {/* Directory Table */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={filterTeam}
                onChange={e => setFilterTeam(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="ALL">All Departments</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Personnel</th>
                  <th className="p-4">Division</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Reporting Manager</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-4 text-slate-300">{user.team_name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {user.role_name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{user.manager_name || 'Executive Board'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;