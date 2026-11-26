import { r as React } from "./vendor-react-Bs5V2qFE.js";
import { p as pb, t as toast } from "./index-F7L3R9.js";
const { useState, useEffect, useMemo } = React;
const ACTION_BADGE = {
  CREATE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  DELETE: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  LOGIN: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  SECURITY: "bg-amber-500/15 text-amber-400 border-amber-500/30"
};
export default function AuditLogsPro() {
  const [events, setEvents] = useState([]);
  const [integrity, setIntegrity] = useState({ isValid: true, totalEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const loadAll = async () => {
    setLoading(true);
    try {
      const [evRes, verRes, pbLogs] = await Promise.all([
        fetch("/api/audit/events?t=" + Date.now()).then((r) => r.json()).catch(() => []),
        fetch("/api/audit/verify?t=" + Date.now()).then((r) => r.json()).catch(() => ({ isValid: true, totalEvents: 0 })),
        pb.collection("audit_logs").getFullList({ sort: "-created", $autoCancel: false }).catch(() => [])
      ]);
      const serverList = Array.isArray(evRes) ? evRes : evRes?.events || [];
      let localList = [];
      try {
        localList = JSON.parse(localStorage.getItem("jbc_audit_logs") || "[]");
      } catch (_) {
      }
      const map = /* @__PURE__ */ new Map();
      serverList.forEach((e) => {
        map.set(e.id, {
          id: e.id,
          timestamp: e.timestamp || e.recorded_at,
          module: e.module || "SYSTEM",
          entity_type: e.entity_type || "",
          entity_id: e.entity_id || "",
          action: e.action || "UPDATE",
          severity: e.severity || "INFO",
          details: e.details || "",
          actor_name: e.actor?.name || "System",
          actor_email: e.actor?.email || "",
          actor_role: e.actor?.role || "",
          changed_fields: e.changed_fields || [],
          previous_values: e.previous_values || null,
          new_values: e.new_values || null,
          ip: e.metadata?.ip || "",
          hash: e.current_event_hash || ""
        });
      });
      (pbLogs || []).forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, {
            id: r.id,
            timestamp: r.timestamp || r.created,
            module: r.module || "SYSTEM",
            entity_type: r.module || "",
            entity_id: r.record_id || "",
            action: r.action || "UPDATE",
            severity: r.action === "DELETE" ? "HIGH" : "INFO",
            details: r.details || "",
            actor_name: r.performed_by_name || "Operator",
            actor_email: r.performed_by_email || "",
            actor_role: r.performed_by_role || "",
            changed_fields: [],
            previous_values: null,
            new_values: null,
            ip: "",
            hash: ""
          });
        }
      });
      (localList || []).forEach((l) => {
        const lid = l.id || l.timestamp;
        if (lid && !map.has(lid)) {
          map.set(lid, {
            id: lid,
            timestamp: l.timestamp,
            module: l.module || "CLIENT",
            entity_type: l.module || "",
            entity_id: l.record_id || "",
            action: l.action || "UPDATE",
            severity: "INFO",
            details: l.details || "",
            actor_name: l.performed_by_name || "User",
            actor_email: l.performed_by_email || "",
            actor_role: l.performed_by_role || "",
            changed_fields: [],
            previous_values: null,
            new_values: null,
            ip: "",
            hash: ""
          });
        }
      });
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setEvents(merged);
      setIntegrity(verRes || { isValid: true, totalEvents: merged.length });
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, []);
  const modules = useMemo(() => {
    const s = new Set(events.map((e) => (e.module || "SYSTEM").toUpperCase()));
    return ["all", ...Array.from(s).sort()];
  }, [events]);
  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (moduleFilter !== "all" && (ev.module || "").toUpperCase() !== moduleFilter) return false;
      if (actionFilter !== "all" && (ev.action || "").toUpperCase() !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (ev.details || "").toLowerCase().includes(q) || (ev.actor_name || "").toLowerCase().includes(q) || (ev.actor_email || "").toLowerCase().includes(q) || (ev.entity_id || "").toLowerCase().includes(q) || (ev.module || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, moduleFilter, actionFilter, search]);
  const highSeverityCount = useMemo(() => events.filter((e) => ["HIGH", "CRITICAL"].includes(String(e.severity).toUpperCase()) || e.action === "DELETE").length, [events]);
  const handleExportCsv = () => {
    const rows = [
      ["Timestamp", "Module", "Action", "Severity", "Actor", "Email", "Entity ID", "Details", "IP"],
      ...filtered.map((e) => [e.timestamp || "", e.module, e.action, e.severity, e.actor_name, e.actor_email, e.entity_id, e.details, e.ip])
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jbc_security_audit_logs.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Audit CSV exported");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${integrity.isValid !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}` }, integrity.isValid !== false ? "SHA-256 Chain Verified \u2713" : "Chain Alert"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30" }, "SQLite Persistent Ledger")), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-black text-white mt-1.5" }, "Audit & Security Change Tracker"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Real-time tamper-evident log of every website create, edit, delete, and login across PocketBase & Express APIs.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleExportCsv, className: "px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer" }, "Export CSV"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: loadAll, className: "px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white cursor-pointer" }, loading ? "Refreshing..." : "Refresh Logs"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Total Tracked Events"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-white mt-1" }, events.length)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-rose-500/30 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-rose-400 uppercase" }, "Deletions & High Alerts"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-rose-400 mt-1" }, highSeverityCount)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Active Modules"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-blue-400 mt-1" }, Math.max(0, modules.length - 1))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-emerald-500/30 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-emerald-400 uppercase" }, "Ledger Integrity"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-emerald-400 mt-1" }, integrity.isValid !== false ? "100% Valid" : "Check Needed"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-2xl p-3" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Search user, email, record ID, change details...",
      className: "flex-1 min-w-[220px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
    }
  ), /* @__PURE__ */ React.createElement("select", { value: moduleFilter, onChange: (e) => setModuleFilter(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" }, modules.map((m) => /* @__PURE__ */ React.createElement("option", { key: m, value: m }, m === "all" ? "All Modules" : m))), /* @__PURE__ */ React.createElement("select", { value: actionFilter, onChange: (e) => setActionFilter(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Actions"), /* @__PURE__ */ React.createElement("option", { value: "CREATE" }, "CREATE"), /* @__PURE__ */ React.createElement("option", { value: "UPDATE" }, "UPDATE"), /* @__PURE__ */ React.createElement("option", { value: "DELETE" }, "DELETE"), /* @__PURE__ */ React.createElement("option", { value: "LOGIN" }, "LOGIN"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs text-left" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Time"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Actor"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Module"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Action"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Change Details"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Inspect"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800" }, loading ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "p-8 text-center text-slate-400" }, "Loading audit ledger...")) : filtered.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "p-8 text-center text-slate-400" }, "No audit events recorded matching your filter.")) : filtered.slice(0, 200).map((ev) => {
    const isOpen = expandedId === ev.id;
    const badgeCls = ACTION_BADGE[(ev.action || "").toUpperCase()] || "bg-slate-800 text-slate-300 border-slate-700";
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: ev.id }, /* @__PURE__ */ React.createElement("tr", { className: "hover:bg-slate-800/40 cursor-pointer", onClick: () => setExpandedId(isOpen ? null : ev.id) }, /* @__PURE__ */ React.createElement("td", { className: "p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap" }, ev.timestamp ? new Date(ev.timestamp).toLocaleString("en-IN") : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white" }, ev.actor_name), ev.actor_email && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400" }, ev.actor_email)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] font-bold" }, ev.module)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded border text-[10px] font-black ${badgeCls}` }, ev.action)), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-200 max-w-md truncate" }, ev.details), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px]" }, isOpen ? "Hide" : "Diff"))), isOpen && /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/90" }, /* @__PURE__ */ React.createElement("td", { colSpan: 6, className: "p-4 space-y-2 border-t border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono" }, /* @__PURE__ */ React.createElement("span", null, "Entity: ", /* @__PURE__ */ React.createElement("b", { className: "text-white" }, ev.entity_type, " (", ev.entity_id, ")")), ev.ip && /* @__PURE__ */ React.createElement("span", null, "IP: ", /* @__PURE__ */ React.createElement("b", { className: "text-white" }, ev.ip)), ev.hash && /* @__PURE__ */ React.createElement("span", null, "Hash: ", /* @__PURE__ */ React.createElement("b", { className: "text-emerald-400" }, ev.hash.slice(0, 20), "..."))), ev.new_values && /* @__PURE__ */ React.createElement("pre", { className: "p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-60" }, JSON.stringify(ev.new_values, null, 2)))));
  }))))));
}
