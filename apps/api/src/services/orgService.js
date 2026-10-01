import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as auditService from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const TEAMS_FILE = path.join(DATA_DIR, 'org_teams_ledger.json');
const ROLES_FILE = path.join(DATA_DIR, 'org_roles_ledger.json');
const USERS_FILE = path.join(DATA_DIR, 'org_users_ledger.json');

const DEFAULT_TEAMS = [
  {
    id: "team_accounts",
    name: "Accounts & Financial Controller Division",
    code: "FIN",
    icon: "Wallet",
    color: "emerald",
    lead_id: "usr_fin_lead",
    lead_name: "Sunil Sharma",
    description: "Ledger maintenance, cashbook disbursements, FASTag, diesel reconciliation, GST filing, and client invoicing.",
    cost_center: "CC-FIN-101",
    is_system: true,
    created_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "team_operations",
    name: "Logistics & Freight Operations Division",
    code: "OPS",
    icon: "Truck",
    color: "blue",
    lead_id: "usr_ops_lead",
    lead_name: "Rajesh Varma",
    description: "Freight dispatch, consignment scheduling, route optimization, POD digitization, and carrier bidding.",
    cost_center: "CC-OPS-202",
    is_system: true,
    created_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "team_fleet",
    name: "Fleet Engineering & Maintenance Division",
    code: "FLT",
    icon: "Wrench",
    color: "amber",
    lead_id: "usr_fleet_lead",
    lead_name: "Mohammed Qureshi",
    description: "Heavy commercial vehicle fitness, workshop job cards, tyre tread rotation, and breakdown roadside assistance.",
    cost_center: "CC-FLT-303",
    is_system: true,
    created_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "team_compliance",
    name: "Executive Legal, Audit & Regulatory Division",
    code: "CMP",
    icon: "ShieldCheck",
    color: "purple",
    lead_id: "usr_vinod_admin",
    lead_name: "Vinod Kumar Rathod",
    description: "Corporate vault governance, National Goods Permits, RTO road taxes, insurance policies, and enterprise security.",
    cost_center: "CC-EXEC-001",
    is_system: true,
    created_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "team_support",
    name: "Enterprise Client Relations & CRM Division",
    code: "CRM",
    icon: "Headphones",
    color: "cyan",
    lead_id: "usr_crm_lead",
    lead_name: "Kavita Reddy",
    description: "B2B client portal assistance, demurrage dispute arbitration, SLA tracking, and rate quotation desk.",
    cost_center: "CC-CRM-404",
    is_system: true,
    created_at: "2026-01-01T00:00:00.000Z"
  }
];

const DEFAULT_ROLES = [
  {
    id: "role_superuser",
    name: "Superuser / Managing Director",
    slug: "superuser",
    tier: 1,
    tier_name: "Tier 1 — Executive Board",
    badge_color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    description: "Unrestricted master authority across all corporate systems, financial reserves, user management, and audit logs.",
    is_system: true,
    permissions: {
      fleet: ["view", "create", "edit", "delete", "approve"],
      logistics: ["view", "create", "edit", "delete", "dispatch", "rate_override"],
      finance: ["view", "create", "edit", "delete", "approve_payout", "export_reports"],
      maintenance: ["view", "create", "edit", "close_job"],
      documents: ["view", "upload", "verify", "delete"],
      users: ["view", "manage_members", "grant_roles", "revoke_access", "manage_hierarchy"],
      audit: ["view_logs", "review_alerts", "purge_system"]
    }
  },
  {
    id: "role_financial_controller",
    name: "Chief Financial Controller",
    slug: "financial_controller",
    tier: 2,
    tier_name: "Tier 2 — Department Head",
    badge_color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Full authorization over cashbook disbursements, vendor payments, GST invoicing, bank reconciliation, and driver advances.",
    is_system: true,
    permissions: {
      fleet: ["view"],
      logistics: ["view"],
      finance: ["view", "create", "edit", "approve_payout", "export_reports"],
      maintenance: ["view"],
      documents: ["view", "upload"],
      users: ["view"],
      audit: ["view_logs"]
    }
  },
  {
    id: "role_operations_lead",
    name: "Operations Logistics Director",
    slug: "operations_lead",
    tier: 2,
    tier_name: "Tier 2 — Department Head",
    badge_color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Complete command over fleet dispatch, multi-drop route allocations, driver scheduling, and freight rate negotiation.",
    is_system: true,
    permissions: {
      fleet: ["view", "edit"],
      logistics: ["view", "create", "edit", "dispatch", "rate_override"],
      finance: ["view"],
      maintenance: ["view"],
      documents: ["view", "upload", "verify"],
      users: ["view"],
      audit: ["view_logs"]
    }
  },
  {
    id: "role_fleet_engineer",
    name: "Fleet Workshop Engineer",
    slug: "fleet_engineer",
    tier: 3,
    tier_name: "Tier 3 — Operational Specialist",
    badge_color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description: "Manages commercial vehicle maintenance job cards, tyre tread depth logs, spare parts replenishment, and fitness certification.",
    is_system: true,
    permissions: {
      fleet: ["view", "create", "edit"],
      logistics: ["view"],
      finance: ["view"],
      maintenance: ["view", "create", "edit", "close_job"],
      documents: ["view", "upload"],
      users: ["view"],
      audit: ["view_logs"]
    }
  },
  {
    id: "role_driver_lead",
    name: "Commercial Fleet Captain",
    slug: "driver_lead",
    tier: 4,
    tier_name: "Tier 4 — Field Operator",
    badge_color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    description: "Mobile app navigation, en-route toll verification, physical POD capture, and daily vehicle pre-trip checklists.",
    is_system: true,
    permissions: {
      fleet: ["view"],
      logistics: ["view"],
      finance: ["view"],
      maintenance: ["view"],
      documents: ["view", "upload"],
      users: [],
      audit: []
    }
  }
];

const DEFAULT_USERS = [
  {
    id: "usr_vinod_admin",
    name: "Vinod Kumar Rathod",
    email: "munnarathod222@gmail.com",
    phone: "+91 98765 43210",
    role_id: "role_superuser",
    role_name: "Superuser / Managing Director",
    role_slug: "superuser",
    team_id: "team_compliance",
    team_name: "Executive Legal, Audit & Regulatory Division",
    manager_id: null,
    manager_name: "Executive Board",
    hierarchy_level: 1,
    status: "ACTIVE",
    designation: "Managing Director & CEO",
    avatar_color: "purple",
    created_at: "2026-01-01T00:00:00.000Z",
    last_login: new Date().toISOString()
  },
  {
    id: "usr_fin_lead",
    name: "Sunil Sharma",
    email: "accounts@jaibhavanicargo.com",
    phone: "+91 98490 11223",
    role_id: "role_financial_controller",
    role_name: "Chief Financial Controller",
    role_slug: "financial_controller",
    team_id: "team_accounts",
    team_name: "Accounts & Financial Controller Division",
    manager_id: "usr_vinod_admin",
    manager_name: "Vinod Kumar Rathod",
    hierarchy_level: 2,
    status: "ACTIVE",
    designation: "Head of Finance & Accounts",
    avatar_color: "emerald",
    created_at: "2026-02-15T00:00:00.000Z",
    last_login: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "usr_ops_lead",
    name: "Rajesh Varma",
    email: "dispatch@jaibhavanicargo.com",
    phone: "+91 97000 88991",
    role_id: "role_operations_lead",
    role_name: "Operations Logistics Director",
    role_slug: "operations_lead",
    team_id: "team_operations",
    team_name: "Logistics & Freight Operations Division",
    manager_id: "usr_vinod_admin",
    manager_name: "Vinod Kumar Rathod",
    hierarchy_level: 2,
    status: "ACTIVE",
    designation: "Chief Dispatch Officer",
    avatar_color: "blue",
    created_at: "2026-02-20T00:00:00.000Z",
    last_login: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "usr_fleet_lead",
    name: "Mohammed Qureshi",
    email: "workshop@jaibhavanicargo.com",
    phone: "+91 94401 55667",
    role_id: "role_fleet_engineer",
    role_name: "Fleet Workshop Engineer",
    role_slug: "fleet_engineer",
    team_id: "team_fleet",
    team_name: "Fleet Engineering & Maintenance Division",
    manager_id: "usr_ops_lead",
    manager_name: "Rajesh Varma",
    hierarchy_level: 3,
    status: "ACTIVE",
    designation: "Workshop Lead Superintendent",
    avatar_color: "amber",
    created_at: "2026-03-01T00:00:00.000Z",
    last_login: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "usr_dayanand_driver",
    name: "Dayanand Surwase",
    email: "dayanand@jaibhavanicargo.com",
    phone: "+91 96180 77441",
    role_id: "role_driver_lead",
    role_name: "Commercial Fleet Captain",
    role_slug: "driver_lead",
    team_id: "team_operations",
    team_name: "Logistics & Freight Operations Division",
    manager_id: "usr_ops_lead",
    manager_name: "Rajesh Varma",
    hierarchy_level: 4,
    status: "ACTIVE",
    designation: "Heavy Haul Fleet Captain (TG12U2637)",
    avatar_color: "cyan",
    created_at: "2026-03-10T00:00:00.000Z",
    last_login: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

let teamsCache = null;
let rolesCache = null;
let usersCache = null;

function loadStores() {
  try {
    if (fs.existsSync(TEAMS_FILE)) {
      teamsCache = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8'));
    } else {
      teamsCache = [...DEFAULT_TEAMS];
      saveTeams();
    }
  } catch (e) {
    teamsCache = [...DEFAULT_TEAMS];
  }

  try {
    if (fs.existsSync(ROLES_FILE)) {
      rolesCache = JSON.parse(fs.readFileSync(ROLES_FILE, 'utf8'));
    } else {
      rolesCache = [...DEFAULT_ROLES];
      saveRoles();
    }
  } catch (e) {
    rolesCache = [...DEFAULT_ROLES];
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      usersCache = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } else {
      usersCache = [...DEFAULT_USERS];
      saveUsers();
    }
  } catch (e) {
    usersCache = [...DEFAULT_USERS];
  }
}

function saveTeams() {
  try { fs.writeFileSync(TEAMS_FILE, JSON.stringify(teamsCache, null, 2), 'utf8'); } catch (e) {}
}
function saveRoles() {
  try { fs.writeFileSync(ROLES_FILE, JSON.stringify(rolesCache, null, 2), 'utf8'); } catch (e) {}
}
function saveUsers() {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(usersCache, null, 2), 'utf8'); } catch (e) {}
}

loadStores();

export function getOrgState() {
  loadStores();
  return {
    success: true,
    teams: teamsCache,
    roles: rolesCache,
    users: usersCache
  };
}

export function saveUser(userData, actor) {
  loadStores();
  const userId = userData.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const existingIdx = usersCache.findIndex(u => u.id === userId);

  let hierarchyLevel = 3;
  if (!userData.manager_id || userData.manager_id === 'root') {
    hierarchyLevel = 1;
  } else {
    const mgr = usersCache.find(u => u.id === userData.manager_id);
    hierarchyLevel = mgr ? (mgr.hierarchy_level || 1) + 1 : 2;
  }

  const manager = userData.manager_id ? usersCache.find(u => u.id === userData.manager_id) : null;
  const team = teamsCache.find(t => t.id === userData.team_id);
  const role = rolesCache.find(r => r.id === userData.role_id || r.slug === userData.role_slug);

  const updatedRecord = {
    id: userId,
    name: (userData.name || '').trim(),
    email: (userData.email || '').trim().toLowerCase(),
    phone: userData.phone || '',
    role_id: role ? role.id : (userData.role_id || 'role_operations_lead'),
    role_name: role ? role.name : (userData.role_name || 'Operations Lead'),
    role_slug: role ? role.slug : 'operations_lead',
    team_id: team ? team.id : (userData.team_id || 'team_operations'),
    team_name: team ? team.name : 'Logistics & Freight Operations Division',
    manager_id: userData.manager_id || null,
    manager_name: manager ? manager.name : (hierarchyLevel === 1 ? 'Executive Board' : 'Unassigned'),
    hierarchy_level: hierarchyLevel,
    status: userData.status || 'ACTIVE',
    designation: userData.designation || (role ? role.name : 'Team Member'),
    avatar_color: userData.avatar_color || (team ? team.color : 'blue'),
    created_at: existingIdx !== -1 ? usersCache[existingIdx].created_at : new Date().toISOString(),
    last_login: existingIdx !== -1 ? usersCache[existingIdx].last_login : null,
    custom_permissions: userData.custom_permissions || null
  };

  if (existingIdx !== -1) {
    const prev = usersCache[existingIdx];
    usersCache[existingIdx] = updatedRecord;
    saveUsers();

    auditService.ingestEvent({
      module: 'AUTH',
      entity_type: 'USER',
      entity_id: userId,
      action: 'UPDATE',
      severity: 'MEDIUM',
      details: `Superuser updated profile and hierarchy for ${updatedRecord.name} (${updatedRecord.email})`,
      actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
      previous_values: prev,
      new_values: updatedRecord
    });
  } else {
    usersCache.push(updatedRecord);
    saveUsers();

    auditService.ingestEvent({
      module: 'AUTH',
      entity_type: 'USER',
      entity_id: userId,
      action: 'CREATE',
      severity: 'INFO',
      details: `New workforce member onboarded: ${updatedRecord.name} (${updatedRecord.role_name}) in ${updatedRecord.team_name}`,
      actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
      new_values: updatedRecord
    });
  }

  return { success: true, user: updatedRecord, users: usersCache };
}

export function revokeAccess(userId, reason, actor) {
  loadStores();
  const user = usersCache.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  if (user.role_slug === 'superuser') throw new Error('Cannot revoke access for primary Superuser');

  user.status = 'REVOKED';
  user.revocation_reason = reason || 'Administrative access revocation by Superuser';
  user.revoked_at = new Date().toISOString();
  user.revoked_by = actor?.name || 'Vinod Kumar Rathod';
  saveUsers();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'USER',
    entity_id: userId,
    action: 'REVOKE_ACCESS',
    severity: 'CRITICAL',
    details: `🚨 ACCESS REVOKED: All permissions and sessions terminated for ${user.name} (${user.email}). Reason: ${user.revocation_reason}`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
    new_values: { status: 'REVOKED', revoked_at: user.revoked_at, reason: user.revocation_reason }
  });

  return { success: true, user, users: usersCache };
}

export function restoreAccess(userId, actor) {
  loadStores();
  const user = usersCache.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  user.status = 'ACTIVE';
  delete user.revocation_reason;
  delete user.revoked_at;
  delete user.revoked_by;
  saveUsers();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'USER',
    entity_id: userId,
    action: 'RESTORE_ACCESS',
    severity: 'HIGH',
    details: `Access privileges restored for workforce account ${user.name} (${user.email}) by Superuser`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
    new_values: { status: 'ACTIVE' }
  });

  return { success: true, user, users: usersCache };
}

export function deleteUser(userId, actor) {
  loadStores();
  const idx = usersCache.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  const user = usersCache[idx];
  if (user.role_slug === 'superuser') throw new Error('Cannot delete primary Superuser account');

  // Reassign direct reports to superuser
  usersCache.forEach(u => {
    if (u.manager_id === userId) {
      u.manager_id = 'usr_vinod_admin';
      u.manager_name = 'Vinod Kumar Rathod';
    }
  });

  usersCache.splice(idx, 1);
  saveUsers();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'USER',
    entity_id: userId,
    action: 'DELETE',
    severity: 'HIGH',
    details: `User record deleted from organization: ${user.name} (${user.email}). Direct reports reassigned to Superuser.`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' }
  });

  return { success: true, users: usersCache };
}

export function saveRole(roleData, actor) {
  loadStores();
  const roleId = roleData.id || `role_custom_${Date.now()}`;
  const existingIdx = rolesCache.findIndex(r => r.id === roleId || r.slug === roleData.slug);

  const newRole = {
    id: roleId,
    name: (roleData.name || '').trim(),
    slug: (roleData.slug || roleData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim(),
    tier: Number(roleData.tier || 3),
    tier_name: roleData.tier_name || `Tier ${roleData.tier || 3} — Operational Specialist`,
    badge_color: roleData.badge_color || 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: roleData.description || 'Custom organizational role',
    is_system: existingIdx !== -1 ? !!rolesCache[existingIdx].is_system : false,
    permissions: roleData.permissions || {
      fleet: ["view"],
      logistics: ["view"],
      finance: ["view"],
      maintenance: ["view"],
      documents: ["view"],
      users: [],
      audit: []
    },
    created_at: existingIdx !== -1 ? rolesCache[existingIdx].created_at : new Date().toISOString()
  };

  if (existingIdx !== -1) {
    rolesCache[existingIdx] = newRole;
  } else {
    rolesCache.push(newRole);
  }
  saveRoles();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'ROLE',
    entity_id: newRole.id,
    action: existingIdx !== -1 ? 'UPDATE' : 'CREATE',
    severity: 'MEDIUM',
    details: `Superuser ${existingIdx !== -1 ? 'updated' : 'created'} custom role: "${newRole.name}" (${newRole.slug})`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
    new_values: newRole
  });

  return { success: true, role: newRole, roles: rolesCache };
}

export function deleteRole(roleId, actor) {
  loadStores();
  const idx = rolesCache.findIndex(r => r.id === roleId);
  if (idx === -1) throw new Error('Role not found');
  const role = rolesCache[idx];
  if (role.is_system) throw new Error('Cannot delete protected system role');

  rolesCache.splice(idx, 1);
  saveRoles();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'ROLE',
    entity_id: roleId,
    action: 'DELETE',
    severity: 'MEDIUM',
    details: `Superuser deleted custom role: "${role.name}" (${role.slug})`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' }
  });

  return { success: true, roles: rolesCache };
}

export function saveTeam(teamData, actor) {
  loadStores();
  const teamId = teamData.id || `team_custom_${Date.now()}`;
  const existingIdx = teamsCache.findIndex(t => t.id === teamId);

  const newTeam = {
    id: teamId,
    name: (teamData.name || '').trim(),
    code: (teamData.code || 'TEAM').toUpperCase(),
    icon: teamData.icon || 'Users',
    color: teamData.color || 'blue',
    lead_id: teamData.lead_id || null,
    lead_name: teamData.lead_name || 'Unassigned',
    description: teamData.description || 'Organizational operational division',
    cost_center: teamData.cost_center || `CC-${(teamData.code || 'OPS').toUpperCase()}-001`,
    is_system: existingIdx !== -1 ? !!teamsCache[existingIdx].is_system : false,
    created_at: existingIdx !== -1 ? teamsCache[existingIdx].created_at : new Date().toISOString()
  };

  if (existingIdx !== -1) {
    teamsCache[existingIdx] = newTeam;
  } else {
    teamsCache.push(newTeam);
  }
  saveTeams();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'TEAM',
    entity_id: newTeam.id,
    action: existingIdx !== -1 ? 'UPDATE' : 'CREATE',
    severity: 'INFO',
    details: `Superuser ${existingIdx !== -1 ? 'updated' : 'created'} team group: "${newTeam.name}" (${newTeam.code})`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' },
    new_values: newTeam
  });

  return { success: true, team: newTeam, teams: teamsCache };
}

export function deleteTeam(teamId, actor) {
  loadStores();
  const idx = teamsCache.findIndex(t => t.id === teamId);
  if (idx === -1) throw new Error('Team not found');
  const team = teamsCache[idx];
  if (team.is_system) throw new Error('Cannot delete protected core team group');

  // Reassign users in this team to operations
  usersCache.forEach(u => {
    if (u.team_id === teamId) {
      u.team_id = 'team_operations';
      u.team_name = 'Logistics & Freight Operations Division';
    }
  });
  saveUsers();

  teamsCache.splice(idx, 1);
  saveTeams();

  auditService.ingestEvent({
    module: 'AUTH',
    entity_type: 'TEAM',
    entity_id: teamId,
    action: 'DELETE',
    severity: 'MEDIUM',
    details: `Superuser deleted team group: "${team.name}" (${team.code}). Members reassigned to Logistics & Freight Operations Division.`,
    actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' }
  });

  return { success: true, teams: teamsCache };
}

export function updateHierarchy(hierarchyChanges, actor) {
  loadStores();
  // hierarchyChanges: array of { user_id, manager_id }
  if (Array.isArray(hierarchyChanges)) {
    hierarchyChanges.forEach(ch => {
      const u = usersCache.find(x => x.id === ch.user_id);
      if (u) {
        u.manager_id = ch.manager_id;
        const mgr = usersCache.find(x => x.id === ch.manager_id);
        u.manager_name = mgr ? mgr.name : 'Executive Board';
        u.hierarchy_level = mgr ? (mgr.hierarchy_level || 1) + 1 : 1;
      }
    });
    saveUsers();

    auditService.ingestEvent({
      module: 'AUTH',
      entity_type: 'ORGANIZATION',
      entity_id: 'HIERARCHY',
      action: 'UPDATE',
      severity: 'HIGH',
      details: `Superuser restructured enterprise reporting hierarchy across ${hierarchyChanges.length} reporting lines`,
      actor: actor || { id: 'usr_vinod_admin', name: 'Vinod Kumar Rathod', email: 'munnarathod222@gmail.com', role: 'superuser' }
    });
  }

  return { success: true, users: usersCache };
}
