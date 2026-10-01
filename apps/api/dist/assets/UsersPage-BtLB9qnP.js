import { r as React } from "./vendor-react-Bs5V2qFE.js";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function showToast(message, type = "success") {
  try {
    const el = document.createElement("div");
    el.className = `fixed bottom-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all transform duration-300 flex items-center gap-2 ${type === "error" ? "bg-rose-600 text-white" : type === "warning" ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"}`;
    el.innerHTML = `<span>${type === "error" ? "\u26A0\uFE0F" : type === "warning" ? "\u{1F514}" : "\u2705"}</span> <span>${message}</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 350);
    }, 3500);
  } catch (e) {
  }
}
function IconUser({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }));
}
function IconUsers({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }));
}
function IconShield({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }));
}
function IconHierarchy({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" }), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "2", width: "6", height: "4", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "16", y: "18", width: "6", height: "4", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "16", y: "2", width: "6", height: "4", rx: "1" }));
}
function IconDepartment({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }));
}
function IconLock({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }));
}
function IconUnlock({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" }));
}
function IconSlash({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "4.93", y1: "4.93", x2: "19.07", y2: "19.07" }));
}
function IconPlus({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4v16m8-8H4" }));
}
function IconSearch({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }));
}
function IconCheck({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }));
}
function IconX({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }));
}
function IconRefresh({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }));
}
function IconEdit({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }));
}
function IconTrash({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }));
}
function IconCrown({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 16l3-8 4 5 4-5 3 8H5z" }));
}
function IconPhone({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }));
}
function IconMail({ className = "w-4 h-4" }) {
  return /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }));
}
const COLOR_MAP = {
  rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
};
const MODULE_NAMES = {
  fleet: { name: "Fleet & Vehicles", icon: "\u{1F69B}" },
  logistics: { name: "Logistics & Consignments", icon: "\u{1F4E6}" },
  finance: { name: "Finance & Cashbook", icon: "\u{1F4B0}" },
  maintenance: { name: "Workshop & Jobcards", icon: "\u{1F527}" },
  documents: { name: "Compliance & Permits", icon: "\u{1F4C4}" },
  users: { name: "User Management & Access", icon: "\u{1F465}" },
  audit: { name: "Security Audit & Anti-Fraud", icon: "\u{1F512}" }
};
const ALL_PERMS = ["view", "create", "edit", "delete", "approve", "export"];
function EnterpriseUserManagementPage() {
  const [activeTab, setActiveTab] = React.useState("directory");
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [teams, setTeams] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTeam, setFilterTeam] = React.useState("ALL");
  const [filterRole, setFilterRole] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [revokeModalOpen, setRevokeModalOpen] = React.useState(false);
  const [revokingUser, setRevokingUser] = React.useState(null);
  const [revocationReason, setRevocationReason] = React.useState("");
  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState(null);
  const [teamModalOpen, setTeamModalOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState(null);
  const [reassignModalOpen, setReassignModalOpen] = React.useState(false);
  const [reassignTargetUser, setReassignTargetUser] = React.useState(null);
  const [selectedNewManagerId, setSelectedNewManagerId] = React.useState("");
  const [permissionsModalOpen, setPermissionsModalOpen] = React.useState(false);
  const [inspectingRole, setInspectingRole] = React.useState(null);
  const fetchOrgState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/org/state");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setRoles(data.roles || []);
          setTeams(data.teams || []);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API org fetch failed, falling back to local storage:", err);
    }
    setLoading(false);
  };
  React.useEffect(() => {
    fetchOrgState();
  }, []);
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const revokedCount = users.filter((u) => u.status === "REVOKED").length;
  const teamsCount = teams.length;
  const rolesCount = roles.length;
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = !searchQuery || u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()) || u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = filterTeam === "ALL" || u.team_id === filterTeam;
      const matchesRole = filterRole === "ALL" || u.role_id === filterRole || u.role_slug === filterRole;
      const matchesStatus = filterStatus === "ALL" || u.status === filterStatus;
      return matchesSearch && matchesTeam && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterTeam, filterRole, filterStatus]);
  const handleSaveUser = async (userData) => {
    try {
      const res = await fetch("/api/org/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        showToast(editingUser ? "Workforce profile updated successfully" : "New employee onboarded successfully");
        setUserModalOpen(false);
        setEditingUser(null);
      } else {
        showToast(data.error || "Failed to save user", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleRevokeAccess = async () => {
    if (!revokingUser) return;
    if (!revocationReason.trim()) {
      showToast("Please provide an official justification for revocation", "warning");
      return;
    }
    try {
      const res = await fetch("/api/org/user/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: revokingUser.id, reason: revocationReason.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        showToast(`Access privileges revoked for ${revokingUser.name}`, "warning");
        setRevokeModalOpen(false);
        setRevokingUser(null);
        setRevocationReason("");
      } else {
        showToast(data.error || "Failed to revoke access", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleRestoreAccess = async (user) => {
    try {
      const res = await fetch("/api/org/user/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        showToast(`Access privileges restored for ${user.name}`);
      } else {
        showToast(data.error || "Failed to restore access", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleDeleteUser = async (user) => {
    if (user.role_slug === "superuser") {
      showToast("Primary Superuser account is permanent and cannot be deleted", "error");
      return;
    }
    if (!confirm(`Are you sure you want to delete employee record ${user.name}? This will reassign direct reports to Superuser.`)) {
      return;
    }
    try {
      const res = await fetch("/api/org/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        showToast(`Employee ${user.name} removed from organization`);
      } else {
        showToast(data.error || "Failed to delete user", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleSaveRole = async (roleData) => {
    try {
      const res = await fetch("/api/org/role/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData)
      });
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
        showToast(editingRole ? "Custom role updated successfully" : "New organizational role created");
        setRoleModalOpen(false);
        setEditingRole(null);
      } else {
        showToast(data.error || "Failed to save role", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleDeleteRole = async (role) => {
    if (role.is_system) {
      showToast("Protected system roles cannot be deleted", "error");
      return;
    }
    if (!confirm(`Delete role "${role.name}"? Staff currently on this role will need reassignment.`)) return;
    try {
      const res = await fetch("/api/org/role/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: role.id })
      });
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
        showToast(`Role "${role.name}" deleted`);
      } else {
        showToast(data.error || "Failed to delete role", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleSaveTeam = async (teamData) => {
    try {
      const res = await fetch("/api/org/team/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData)
      });
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
        showToast(editingTeam ? "Team group updated" : "New team group created");
        setTeamModalOpen(false);
        setEditingTeam(null);
      } else {
        showToast(data.error || "Failed to save team", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleDeleteTeam = async (team) => {
    if (team.is_system) {
      showToast("Core organizational divisions cannot be deleted", "error");
      return;
    }
    if (!confirm(`Delete team "${team.name}"? Members will be automatically transferred to Freight Operations.`)) return;
    try {
      const res = await fetch("/api/org/team/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
        fetchOrgState();
        showToast(`Team "${team.name}" deleted`);
      } else {
        showToast(data.error || "Failed to delete team", "error");
      }
    } catch (e) {
      showToast("Error communicating with server", "error");
    }
  };
  const handleReassignManager = async () => {
    if (!reassignTargetUser || !selectedNewManagerId) return;
    try {
      const res = await fetch("/api/org/hierarchy/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hierarchyChanges: [
            { user_id: reassignTargetUser.id, manager_id: selectedNewManagerId }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        showToast(`Reporting manager updated for ${reassignTargetUser.name}`);
        setReassignModalOpen(false);
        setReassignTargetUser(null);
      } else {
        showToast(data.error || "Failed to update hierarchy", "error");
      }
    } catch (e) {
      showToast("Error updating hierarchy", "error");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-inner" }, /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-7 h-7" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl md:text-3xl font-black tracking-tight text-white font-heading" }, "Enterprise Organization & Access Control"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30" }, "MNC Suite")), /* @__PURE__ */ React.createElement("p", { className: "text-xs md:text-sm text-slate-400 mt-0.5" }, "Master workforce directory, department divisions, role-based access control (RBAC), and enterprise reporting hierarchy.")))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => fetchOrgState(),
      className: "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm",
      title: "Refresh Organization State"
    },
    /* @__PURE__ */ React.createElement(IconRefresh, { className: cn("w-3.5 h-3.5", loading && "animate-spin") }),
    /* @__PURE__ */ React.createElement("span", null, "Sync")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingTeam(null);
        setTeamModalOpen(true);
      },
      className: "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
    },
    /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-3.5 h-3.5 text-blue-400" }),
    /* @__PURE__ */ React.createElement("span", null, "+ New Division")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingRole(null);
        setRoleModalOpen(true);
      },
      className: "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
    },
    /* @__PURE__ */ React.createElement(IconShield, { className: "w-3.5 h-3.5 text-amber-400" }),
    /* @__PURE__ */ React.createElement("span", null, "+ Create Role")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingUser(null);
        setUserModalOpen(true);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
    },
    /* @__PURE__ */ React.createElement(IconPlus, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Onboard Employee")
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Headcount"), /* @__PURE__ */ React.createElement("span", { className: "p-1.5 rounded-lg bg-blue-500/10 text-blue-400" }, /* @__PURE__ */ React.createElement(IconUsers, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-2xl font-black text-white" }, totalUsers), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Verified Corporate Workforce")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Active Staff"), /* @__PURE__ */ React.createElement("span", { className: "p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400" }, /* @__PURE__ */ React.createElement(IconCheck, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-2xl font-black text-emerald-400" }, activeCount), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Full operational credentials")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Access Revoked"), /* @__PURE__ */ React.createElement("span", { className: "p-1.5 rounded-lg bg-rose-500/10 text-rose-400" }, /* @__PURE__ */ React.createElement(IconSlash, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-2xl font-black text-rose-400" }, revokedCount), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Security quarantined accounts")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Divisions"), /* @__PURE__ */ React.createElement("span", { className: "p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400" }, /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-2xl font-black text-indigo-300" }, teamsCount), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Structured Cost Centers")), /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Active Roles"), /* @__PURE__ */ React.createElement("span", { className: "p-1.5 rounded-lg bg-amber-500/10 text-amber-400" }, /* @__PURE__ */ React.createElement(IconShield, { className: "w-4 h-4" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-2xl font-black text-amber-300" }, rolesCount), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Standard & Custom Roles"))), /* @__PURE__ */ React.createElement("div", { className: "flex border-b border-slate-800 space-x-1 overflow-x-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("directory"),
      className: cn(
        "px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer",
        activeTab === "directory" ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )
    },
    /* @__PURE__ */ React.createElement(IconUsers, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Workforce Directory (", users.length, ")")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("hierarchy"),
      className: cn(
        "px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer",
        activeTab === "hierarchy" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )
    },
    /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Organization Tree & Hierarchy")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("roles"),
      className: cn(
        "px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer",
        activeTab === "roles" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )
    },
    /* @__PURE__ */ React.createElement(IconShield, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Roles & Permissions Matrix (", roles.length, ")")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("teams"),
      className: cn(
        "px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer",
        activeTab === "teams" ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
      )
    },
    /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Department & Team Divisions (", teams.length, ")")
  )), activeTab === "directory" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full md:w-80" }, /* @__PURE__ */ React.createElement(IconSearch, { className: "w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search staff by name, email, designation...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 w-full md:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: filterTeam,
      onChange: (e) => setFilterTeam(e.target.value),
      className: "px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Departments"),
    teams.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.name))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: filterRole,
      onChange: (e) => setFilterRole(e.target.value),
      className: "px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Roles"),
    roles.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.id, value: r.id }, r.name))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: filterStatus,
      onChange: (e) => setFilterStatus(e.target.value),
      className: "px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Statuses"),
    /* @__PURE__ */ React.createElement("option", { value: "ACTIVE" }, "Active Privileges"),
    /* @__PURE__ */ React.createElement("option", { value: "REVOKED" }, "Revoked / Locked")
  ), (searchQuery || filterTeam !== "ALL" || filterRole !== "ALL" || filterStatus !== "ALL") && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSearchQuery("");
        setFilterTeam("ALL");
        setFilterRole("ALL");
        setFilterStatus("ALL");
      },
      className: "px-2.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
    },
    "Clear Filters"
  ))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-4" }, "Personnel & Contact"), /* @__PURE__ */ React.createElement("th", { className: "p-4" }, "Assigned Department"), /* @__PURE__ */ React.createElement("th", { className: "p-4" }, "Role & Privilege Tier"), /* @__PURE__ */ React.createElement("th", { className: "p-4" }, "Reporting Line"), /* @__PURE__ */ React.createElement("th", { className: "p-4" }, "Access Status"), /* @__PURE__ */ React.createElement("th", { className: "p-4 text-right" }, "Superuser Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60" }, filteredUsers.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "text-center py-12 text-slate-500" }, "No workforce members match your search filters.")) : filteredUsers.map((user) => {
    const isSuper = user.role_slug === "superuser";
    const isRevoked = user.status === "REVOKED";
    return /* @__PURE__ */ React.createElement("tr", { key: user.id, className: "hover:bg-slate-850/40 transition" }, /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: cn(
      "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm uppercase shrink-0 border shadow-sm",
      isSuper ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-800 text-slate-200 border-slate-700"
    ) }, user.name ? user.name.charAt(0) : "U"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 font-bold text-white text-sm" }, /* @__PURE__ */ React.createElement("span", null, user.name), isSuper && /* @__PURE__ */ React.createElement("span", { title: "Executive Superuser" }, /* @__PURE__ */ React.createElement(IconCrown, { className: "w-3.5 h-3.5 text-rose-400 fill-rose-400/20 inline" }))), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 font-medium" }, user.designation || "Staff"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-0.5 text-[11px] text-slate-500" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(IconMail, { className: "w-3 h-3" }), " ", user.email), user.phone && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(IconPhone, { className: "w-3 h-3" }), " ", user.phone))))), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700" }, /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-3 h-3 text-blue-400" }), /* @__PURE__ */ React.createElement("span", null, user.team_name))), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border",
      isSuper ? COLOR_MAP.rose : COLOR_MAP.blue
    ) }, /* @__PURE__ */ React.createElement(IconShield, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, user.role_name)), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-1" }, "Hierarchy Level ", user.hierarchy_level || 3))), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-slate-300 font-medium text-xs" }, user.manager_name || "Executive Board"), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500" }, "Direct Manager")))), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, isRevoked ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30" }, /* @__PURE__ */ React.createElement(IconLock, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "REVOKED")), user.revocation_reason && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-rose-300/80 mt-1 max-w-xs truncate", title: user.revocation_reason }, user.revocation_reason)) : /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" }, /* @__PURE__ */ React.createElement(IconUnlock, { className: "w-3 h-3" }), /* @__PURE__ */ React.createElement("span", null, "ACTIVE"))), /* @__PURE__ */ React.createElement("td", { className: "p-4 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingUser(user);
          setUserModalOpen(true);
        },
        className: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer",
        title: "Edit Profile & Role"
      },
      /* @__PURE__ */ React.createElement(IconEdit, { className: "w-3.5 h-3.5" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setReassignTargetUser(user);
          setSelectedNewManagerId(user.manager_id || "usr_vinod_admin");
          setReassignModalOpen(true);
        },
        className: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer",
        title: "Reassign Reporting Manager"
      },
      /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-3.5 h-3.5" })
    ), !isSuper && /* @__PURE__ */ React.createElement(React.Fragment, null, isRevoked ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleRestoreAccess(user),
        className: "px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer",
        title: "Restore Access"
      },
      /* @__PURE__ */ React.createElement(IconUnlock, { className: "w-3.5 h-3.5" }),
      /* @__PURE__ */ React.createElement("span", null, "Restore")
    ) : /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setRevokingUser(user);
          setRevocationReason("");
          setRevokeModalOpen(true);
        },
        className: "px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer",
        title: "Revoke Access Instantly"
      },
      /* @__PURE__ */ React.createElement(IconSlash, { className: "w-3.5 h-3.5" }),
      /* @__PURE__ */ React.createElement("span", null, "Revoke")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteUser(user),
        className: "p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer",
        title: "Delete Record"
      },
      /* @__PURE__ */ React.createElement(IconTrash, { className: "w-3.5 h-3.5" })
    )))));
  })))))), activeTab === "hierarchy" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-white flex items-center gap-2" }, /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-5 h-5 text-indigo-400" }), /* @__PURE__ */ React.createElement("span", null, "Enterprise Reporting Tree (Levels 1 to 4)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Visual corporate chain of command. Superusers can reassign reporting lines for any staff member in 1 click.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (users.length > 0) {
          setReassignTargetUser(users[1] || users[0]);
          setSelectedNewManagerId("usr_vinod_admin");
          setReassignModalOpen(true);
        }
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
    },
    /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Reassign Direct Line")
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-8" }, [1, 2, 3, 4].map((lvl) => {
    const levelUsers = users.filter((u) => (u.hierarchy_level || 1) === lvl);
    if (levelUsers.length === 0) return null;
    const levelTitles = {
      1: "Level 1: Executive Board & Managing Directorate",
      2: "Level 2: Department Heads & Functional Controllers",
      3: "Level 3: Operational Superintendents & Supervisors",
      4: "Level 4: Field Staff & Fleet Captains"
    };
    return /* @__PURE__ */ React.createElement("div", { key: lvl, className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 border-b border-slate-800 pb-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-indigo-500" }), /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-black uppercase tracking-wider text-slate-300" }, levelTitles[lvl] || `Tier Level ${lvl}`, " (", levelUsers.length, ")")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, levelUsers.map((user) => {
      const isSuper = user.role_slug === "superuser";
      const directReports = users.filter((u) => u.manager_id === user.id);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: user.id,
          className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg relative group"
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase shrink-0 border",
          isSuper ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-800 text-slate-200 border-slate-700"
        ) }, user.name ? user.name.charAt(0) : "U"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "font-bold text-white text-sm flex items-center gap-1.5" }, user.name, isSuper && /* @__PURE__ */ React.createElement(IconCrown, { className: "w-3.5 h-3.5 text-rose-400" })), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-indigo-400 font-semibold" }, user.designation), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, user.email))), /* @__PURE__ */ React.createElement("span", { className: cn(
          "px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0",
          user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        ) }, user.status)),
        /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-400 text-[11px]" }, /* @__PURE__ */ React.createElement("span", null, "Reports to: "), /* @__PURE__ */ React.createElement("strong", { className: "text-slate-200" }, user.manager_name || "Board of Directors")), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20" }, directReports.length, " Direct Report", directReports.length === 1 ? "" : "s")),
        /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-end gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              setReassignTargetUser(user);
              setSelectedNewManagerId(user.manager_id || "usr_vinod_admin");
              setReassignModalOpen(true);
            },
            className: "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          },
          /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-3 h-3 text-indigo-400" }),
          /* @__PURE__ */ React.createElement("span", null, "Reassign")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              setEditingUser(user);
              setUserModalOpen(true);
            },
            className: "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          },
          /* @__PURE__ */ React.createElement(IconEdit, { className: "w-3 h-3 text-blue-400" }),
          /* @__PURE__ */ React.createElement("span", null, "Edit")
        ))
      );
    })));
  }))), activeTab === "roles" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-white flex items-center gap-2" }, /* @__PURE__ */ React.createElement(IconShield, { className: "w-5 h-5 text-amber-400" }), /* @__PURE__ */ React.createElement("span", null, "Enterprise Roles & Granular Permissions (RBAC)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Configure custom system roles and granular module authorizations (Fleet, Logistics, Finance, Workshop, Legal, Users, Audit).")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingRole(null);
        setRoleModalOpen(true);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
    },
    /* @__PURE__ */ React.createElement(IconPlus, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "+ Create Custom Role")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, roles.map((role) => {
    const membersCount = users.filter((u) => u.role_id === role.id || u.role_slug === role.slug).length;
    return /* @__PURE__ */ React.createElement("div", { key: role.id, className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-white text-base" }, role.name), role.is_system && /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700" }, "System Protected")), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-amber-400/90 font-medium mt-0.5" }, role.tier_name)), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700" }, membersCount, " ", membersCount === 1 ? "user" : "users")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3 line-clamp-2" }, role.description), /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-3 border-t border-slate-800/80 space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-500" }, "Module Authorizations"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, Object.entries(role.permissions || {}).map(([mod, perms]) => {
      if (!Array.isArray(perms) || perms.length === 0) return null;
      const modInfo = MODULE_NAMES[mod] || { name: mod, icon: "\u26A1" };
      const hasFull = perms.includes("*") || perms.length >= 5;
      return /* @__PURE__ */ React.createElement(
        "span",
        {
          key: mod,
          className: cn(
            "px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1",
            hasFull ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-300 border-slate-700"
          ),
          title: `${modInfo.name}: ${perms.join(", ")}`
        },
        /* @__PURE__ */ React.createElement("span", null, modInfo.icon),
        /* @__PURE__ */ React.createElement("span", null, modInfo.name),
        /* @__PURE__ */ React.createElement("span", { className: "opacity-70 text-[9px]" }, "(", perms.length, ")")
      );
    })))), /* @__PURE__ */ React.createElement("div", { className: "mt-5 pt-3 border-t border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setInspectingRole(role);
          setPermissionsModalOpen(true);
        },
        className: "text-xs text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
      },
      "View Matrix \u2192"
    ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingRole(role);
          setRoleModalOpen(true);
        },
        className: "px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
      },
      "Edit"
    ), !role.is_system && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteRole(role),
        className: "p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer",
        title: "Delete Role"
      },
      /* @__PURE__ */ React.createElement(IconTrash, { className: "w-3.5 h-3.5" })
    ))));
  }))), activeTab === "teams" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-white flex items-center gap-2" }, /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-5 h-5 text-emerald-400" }), /* @__PURE__ */ React.createElement("span", null, "Enterprise Department & Team Divisions")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Organize company personnel into operational divisions, financial cost centers, and specialized functional teams.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingTeam(null);
        setTeamModalOpen(true);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
    },
    /* @__PURE__ */ React.createElement(IconPlus, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "+ Create Team Division")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, teams.map((team) => {
    const teamMembers = users.filter((u) => u.team_id === team.id);
    return /* @__PURE__ */ React.createElement("div", { key: team.id, className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: cn(
      "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase shrink-0 border",
      COLOR_MAP[team.color] || COLOR_MAP.blue
    ) }, team.code || "DIV"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-white text-base leading-snug" }, team.name)), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 font-mono mt-0.5" }, "Cost Center: ", /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400" }, team.cost_center || "CC-GEN-000")))), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 shrink-0" }, teamMembers.length, " ", teamMembers.length === 1 ? "member" : "members")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-3" }, team.description), /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-3 border-t border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1" }, "Division Lead / Head"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs font-semibold text-slate-200" }, /* @__PURE__ */ React.createElement(IconUser, { className: "w-3.5 h-3.5 text-blue-400" }), /* @__PURE__ */ React.createElement("span", null, team.lead_name || "Unassigned"))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-3 border-t border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" }, "Assigned Personnel"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 max-h-36 overflow-y-auto pr-1" }, teamMembers.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-600 italic" }, "No staff assigned yet") : teamMembers.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800/60" }, /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-300" }, m.name), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500" }, m.designation || m.role_name)))))), /* @__PURE__ */ React.createElement("div", { className: "mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingTeam(team);
          setTeamModalOpen(true);
        },
        className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
      },
      "Edit Division"
    ), !team.is_system && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteTeam(team),
        className: "p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer",
        title: "Delete Division"
      },
      /* @__PURE__ */ React.createElement(IconTrash, { className: "w-3.5 h-3.5" })
    )));
  }))), userModalOpen && /* @__PURE__ */ React.createElement(
    UserFormModal,
    {
      user: editingUser,
      roles,
      teams,
      allUsers: users,
      onClose: () => {
        setUserModalOpen(false);
        setEditingUser(null);
      },
      onSave: handleSaveUser
    }
  ), revokeModalOpen && revokingUser && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-rose-400" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl" }, /* @__PURE__ */ React.createElement(IconSlash, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Emergency Access Revocation"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-rose-400/80" }, "Immediate security killswitch & session termination"))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-400" }, "Target Personnel:"), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white text-sm" }, revokingUser.name), /* @__PURE__ */ React.createElement("div", { className: "text-slate-400" }, revokingUser.email, " \u2022 ", revokingUser.role_name)), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-slate-400" }, "Official Revocation Justification (Required for Audit Trail) *"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: 3,
      placeholder: "e.g. Employee offboarding, pending compliance audit, security quarantine...",
      value: revocationReason,
      onChange: (e) => setRevocationReason(e.target.value),
      className: "w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300" }, "\u26A0\uFE0F ", /* @__PURE__ */ React.createElement("strong", null, "Warning:"), " Revoking access will immediately invalidate all active sessions and block portal entry. The event will be indelibly recorded in the Enterprise Audit Ledger."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setRevokeModalOpen(false);
        setRevokingUser(null);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleRevokeAccess,
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/30"
    },
    "Execute Revocation Now"
  )))), roleModalOpen && /* @__PURE__ */ React.createElement(
    RoleFormModal,
    {
      role: editingRole,
      onClose: () => {
        setRoleModalOpen(false);
        setEditingRole(null);
      },
      onSave: handleSaveRole
    }
  ), teamModalOpen && /* @__PURE__ */ React.createElement(
    TeamFormModal,
    {
      team: editingTeam,
      allUsers: users,
      onClose: () => {
        setTeamModalOpen(false);
        setEditingTeam(null);
      },
      onSave: handleSaveTeam
    }
  ), reassignModalOpen && reassignTargetUser && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-indigo-400" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl" }, /* @__PURE__ */ React.createElement(IconHierarchy, { className: "w-6 h-6" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Reassign Reporting Manager"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-indigo-400/80" }, "Corporate hierarchy & organizational chart update"))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-400" }, "Target Personnel:"), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white text-sm" }, reassignTargetUser.name), /* @__PURE__ */ React.createElement("div", { className: "text-slate-400" }, "Current Manager: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-200 font-semibold" }, reassignTargetUser.manager_name || "Board of Directors"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-slate-400" }, "Select New Direct Reporting Manager *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedNewManagerId,
      onChange: (e) => setSelectedNewManagerId(e.target.value),
      className: "w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
    },
    users.filter((u) => u.id !== reassignTargetUser.id).map((u) => /* @__PURE__ */ React.createElement("option", { key: u.id, value: u.id }, u.name, " \u2014 ", u.designation, " (Level ", u.hierarchy_level || 1, ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setReassignModalOpen(false);
        setReassignTargetUser(null);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleReassignManager,
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/30"
    },
    "Save Reporting Line"
  )))), permissionsModalOpen && inspectingRole && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400" }, /* @__PURE__ */ React.createElement(IconShield, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, inspectingRole.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-amber-400/80" }, inspectingRole.tier_name))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setPermissionsModalOpen(false);
        setInspectingRole(null);
      },
      className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
    },
    /* @__PURE__ */ React.createElement(IconX, { className: "w-5 h-5" })
  )), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, inspectingRole.description), /* @__PURE__ */ React.createElement("div", { className: "border border-slate-800 rounded-xl overflow-hidden" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-950 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Enterprise Module"), ALL_PERMS.map((p) => /* @__PURE__ */ React.createElement("th", { key: p, className: "p-3 text-center uppercase" }, p)))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60" }, Object.entries(MODULE_NAMES).map(([modKey, modInfo]) => {
    const rolePerms = inspectingRole.permissions?.[modKey] || [];
    const isAll = rolePerms.includes("*");
    return /* @__PURE__ */ React.createElement("tr", { key: modKey, className: "hover:bg-slate-850/40" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 font-semibold text-slate-200 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, modInfo.icon), /* @__PURE__ */ React.createElement("span", null, modInfo.name)), ALL_PERMS.map((p) => {
      const has = isAll || rolePerms.includes(p);
      return /* @__PURE__ */ React.createElement("td", { key: p, className: "p-3 text-center" }, has ? /* @__PURE__ */ React.createElement("span", { className: "inline-block p-1 rounded-md bg-emerald-500/10 text-emerald-400" }, /* @__PURE__ */ React.createElement(IconCheck, { className: "w-3.5 h-3.5" })) : /* @__PURE__ */ React.createElement("span", { className: "inline-block p-1 text-slate-700" }, /* @__PURE__ */ React.createElement(IconX, { className: "w-3.5 h-3.5" })));
    }));
  })))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setPermissionsModalOpen(false);
        setInspectingRole(null);
      },
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
    },
    "Close"
  )))));
}
function UserFormModal({ user, roles, teams, allUsers, onClose, onSave }) {
  const [formData, setFormData] = React.useState({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    designation: user?.designation || "",
    role_id: user?.role_id || (roles[0]?.id || "role_operations_lead"),
    team_id: user?.team_id || (teams[0]?.id || "team_operations"),
    manager_id: user?.manager_id || "usr_vinod_admin",
    status: user?.status || "ACTIVE"
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Name and Email are required", "warning");
      return;
    }
    const role = roles.find((r) => r.id === formData.role_id);
    const team = teams.find((t) => t.id === formData.team_id);
    const manager = allUsers.find((u) => u.id === formData.manager_id);
    onSave({
      ...formData,
      role_name: role ? role.name : "Operations Lead",
      role_slug: role ? role.slug : "operations_lead",
      team_name: team ? team.name : "Logistics & Freight Operations Division",
      manager_name: manager ? manager.name : "Executive Board"
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400" }, /* @__PURE__ */ React.createElement(IconUser, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, user ? "Edit Workforce Profile" : "Onboard New Employee"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Enterprise credentials, division assignment & reporting hierarchy"))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white" }, /* @__PURE__ */ React.createElement(IconX, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: formData.name,
      onChange: (e) => setFormData({ ...formData, name: e.target.value }),
      placeholder: "e.g. Ramesh Kumar",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Email Address (Login ID) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      required: true,
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
      placeholder: "ramesh@jaibhavanicargo.com",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Mobile Phone"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formData.phone,
      onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
      placeholder: "+91 98765 43210",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Official Designation"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formData.designation,
      onChange: (e) => setFormData({ ...formData, designation: e.target.value }),
      placeholder: "e.g. Senior Dispatch Controller",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Department Division *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: formData.team_id,
      onChange: (e) => setFormData({ ...formData, team_id: e.target.value }),
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    },
    teams.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.name, " (", t.code, ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Privilege Role *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: formData.role_id,
      onChange: (e) => setFormData({ ...formData, role_id: e.target.value }),
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    },
    roles.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.id, value: r.id }, r.name, " (", r.tier_name, ")"))
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Direct Reporting Manager *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: formData.manager_id,
      onChange: (e) => setFormData({ ...formData, manager_id: e.target.value }),
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
    },
    allUsers.filter((u) => u.id !== formData.id).map((u) => /* @__PURE__ */ React.createElement("option", { key: u.id, value: u.id }, u.name, " \u2014 ", u.designation, " (Level ", u.hierarchy_level || 1, ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-4 border-t border-slate-800" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-600/30"
    },
    user ? "Save Profile Changes" : "Confirm Onboarding"
  )))));
}
function RoleFormModal({ role, onClose, onSave }) {
  const [name, setName] = React.useState(role?.name || "");
  const [tier, setTier] = React.useState(role?.tier || 3);
  const [description, setDescription] = React.useState(role?.description || "");
  const [permissions, setPermissions] = React.useState(
    role?.permissions || {
      fleet: ["view"],
      logistics: ["view"],
      finance: ["view"],
      maintenance: ["view"],
      documents: ["view"],
      users: [],
      audit: []
    }
  );
  const togglePermission = (moduleKey, perm) => {
    setPermissions((prev) => {
      const current = prev[moduleKey] || [];
      const updated = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      return { ...prev, [moduleKey]: updated };
    });
  };
  const handleSelectAllModule = (moduleKey) => {
    setPermissions((prev) => {
      const current = prev[moduleKey] || [];
      const updated = current.length === ALL_PERMS.length ? [] : [...ALL_PERMS];
      return { ...prev, [moduleKey]: updated };
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Role Name is required", "warning");
      return;
    }
    const slug = role?.slug || name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    onSave({
      id: role?.id,
      name: name.trim(),
      slug,
      tier: Number(tier),
      tier_name: `Tier ${tier} \u2014 ${tier === 1 ? "Executive Board" : tier === 2 ? "Division Head" : tier === 3 ? "Operational Lead" : "Field Staff"}`,
      description: description.trim() || "Custom organizational role",
      permissions
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400" }, /* @__PURE__ */ React.createElement(IconShield, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, role ? "Edit Custom Role" : "Create Custom Organizational Role"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Granular module-by-module permission configuration"))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white" }, /* @__PURE__ */ React.createElement(IconX, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Role Title *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: name,
      onChange: (e) => setName(e.target.value),
      placeholder: "e.g. Regional Fleet Controller",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Hierarchy Tier *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: tier,
      onChange: (e) => setTier(Number(e.target.value)),
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: 1 }, "Tier 1 \u2014 Executive Board & Directorate"),
    /* @__PURE__ */ React.createElement("option", { value: 2 }, "Tier 2 \u2014 Department Division Head"),
    /* @__PURE__ */ React.createElement("option", { value: 3 }, "Tier 3 \u2014 Operational Lead / Controller"),
    /* @__PURE__ */ React.createElement("option", { value: 4 }, "Tier 4 \u2014 Field Staff & Driver Captain")
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Role Description & Scope"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: description,
      onChange: (e) => setDescription(e.target.value),
      placeholder: "Responsibilities and access scope of this role...",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 pt-2 border-t border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-300" }, "Module Permission Checklists (Granular Access)"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500" }, "Toggle actions granted to this role")), /* @__PURE__ */ React.createElement("div", { className: "border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60" }, Object.entries(MODULE_NAMES).map(([modKey, modInfo]) => {
    const currentPerms = permissions[modKey] || [];
    const allSelected = currentPerms.length === ALL_PERMS.length;
    return /* @__PURE__ */ React.createElement("div", { key: modKey, className: "p-3 bg-slate-950/40 hover:bg-slate-950/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, modInfo.icon), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-xs text-white" }, modInfo.name), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => handleSelectAllModule(modKey),
        className: "text-[10px] text-amber-400 hover:underline font-bold ml-1 cursor-pointer"
      },
      allSelected ? "Deselect All" : "Select All"
    )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, ALL_PERMS.map((p) => {
      const checked = currentPerms.includes(p);
      return /* @__PURE__ */ React.createElement("label", { key: p, className: "flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked,
          onChange: () => togglePermission(modKey, p),
          className: "rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "capitalize text-[11px]" }, p));
    })));
  }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-4 border-t border-slate-800" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-lg shadow-amber-600/30"
    },
    role ? "Save Role Changes" : "Create Role"
  )))));
}
function TeamFormModal({ team, allUsers, onClose, onSave }) {
  const [name, setName] = React.useState(team?.name || "");
  const [code, setCode] = React.useState(team?.code || "");
  const [costCenter, setCostCenter] = React.useState(team?.cost_center || "");
  const [leadId, setLeadId] = React.useState(team?.lead_id || (allUsers[0]?.id || ""));
  const [description, setDescription] = React.useState(team?.description || "");
  const [color, setColor] = React.useState(team?.color || "blue");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Division Name is required", "warning");
      return;
    }
    const lead = allUsers.find((u) => u.id === leadId);
    onSave({
      id: team?.id,
      name: name.trim(),
      code: (code || name.substring(0, 3)).toUpperCase(),
      cost_center: costCenter.trim() || "CC-GEN-001",
      lead_id: leadId,
      lead_name: lead ? lead.name : "Unassigned",
      description: description.trim() || "Corporate operational division",
      color
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400" }, /* @__PURE__ */ React.createElement(IconDepartment, { className: "w-5 h-5" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, team ? "Edit Team Division" : "Create Department / Team Division"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Operational group, cost center & division lead assignment"))), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white" }, /* @__PURE__ */ React.createElement(IconX, { className: "w-5 h-5" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Division Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: name,
      onChange: (e) => setName(e.target.value),
      placeholder: "e.g. Central Dispatch & Highway Telematics Division",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Division Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: code,
      onChange: (e) => setCode(e.target.value.toUpperCase()),
      placeholder: "e.g. DSP, FIN, OPS",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Cost Center Code"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: costCenter,
      onChange: (e) => setCostCenter(e.target.value),
      placeholder: "CC-DSP-404",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Division Lead / Head *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: leadId,
      onChange: (e) => setLeadId(e.target.value),
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
    },
    allUsers.map((u) => /* @__PURE__ */ React.createElement("option", { key: u.id, value: u.id }, u.name, " \u2014 ", u.designation))
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Division Operational Scope"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: 2,
      value: description,
      onChange: (e) => setDescription(e.target.value),
      placeholder: "Describe tasks, mandate and responsibilities of this team...",
      className: "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Color Theme Badge"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, ["blue", "emerald", "amber", "purple", "rose", "cyan"].map((c) => /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      key: c,
      onClick: () => setColor(c),
      className: cn(
        "w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition",
        COLOR_MAP[c],
        color === c ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
      )
    },
    color === c && /* @__PURE__ */ React.createElement(IconCheck, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-4 border-t border-slate-800" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/30"
    },
    team ? "Save Division Changes" : "Create Division"
  )))));
}
class OrgErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Enterprise Organization Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center text-center" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 mb-4" }, /* @__PURE__ */ React.createElement(IconSlash, { className: "w-8 h-8" })), /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold mb-2" }, "Organization View Encountered an Error"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 max-w-md mb-4" }, this.state.error?.message || "Unexpected runtime error"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            this.setState({ hasError: false });
            window.location.reload();
          },
          className: "px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer"
        },
        "Reload Module"
      ));
    }
    return this.props.children;
  }
}
function EnterpriseUserManagementPageWrapper() {
  return React.createElement(OrgErrorBoundary, null, React.createElement(EnterpriseUserManagementPage));
}
export {
  EnterpriseUserManagementPage,
  EnterpriseUserManagementPageWrapper as default
};
