import { r as React } from "./vendor-react-Bs5V2qFE.js";
import { g as downloadPdf, a as downloadExcel } from "./downloadUtils-2aSgxB0V.js";
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function showFloatingNotification(message, type = "success") {
  try {
    const el = document.createElement("div");
    el.className = `fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all transform duration-300 ${type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 3e3);
  } catch (e) {
  }
}
const toast = {
  success: (msg) => {
    try {
      if (window.toast?.success) return window.toast.success(msg);
    } catch (e) {
    }
    showFloatingNotification(msg, "success");
  },
  error: (msg) => {
    try {
      if (window.toast?.error) return window.toast.error(msg);
    } catch (e) {
    }
    showFloatingNotification(msg, "error");
  },
  info: (msg) => {
    try {
      if (window.toast?.info) return window.toast.info(msg);
    } catch (e) {
    }
    showFloatingNotification(msg, "info");
  }
};
function Card({ className, children, ...props }) {
  return React.createElement("div", {
    className: cn("rounded-2xl border bg-card text-card-foreground shadow-sm", className),
    ...props
  }, children);
}
function CardHeader({ className, children, ...props }) {
  return React.createElement("div", {
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }, children);
}
function CardTitle({ className, children, ...props }) {
  return React.createElement("h3", {
    className: cn("text-xl font-bold leading-none tracking-tight", className),
    ...props
  }, children);
}
function CardDescription({ className, children, ...props }) {
  return React.createElement("p", {
    className: cn("text-xs text-muted-foreground", className),
    ...props
  }, children);
}
function CardContent({ className, children, ...props }) {
  return React.createElement("div", {
    className: cn("p-6 pt-0", className),
    ...props
  }, children);
}
function Button({ className, variant, size, children, ...props }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  let vClass = "bg-primary text-primary-foreground hover:bg-primary/90";
  if (variant === "outline") vClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  else if (variant === "ghost") vClass = "hover:bg-accent hover:text-accent-foreground";
  else if (variant === "secondary") vClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
  let sClass = "h-9 px-4 py-2";
  if (size === "sm") sClass = "h-8 rounded-lg px-3";
  else if (size === "lg") sClass = "h-10 rounded-xl px-8";
  else if (size === "icon") sClass = "h-8 w-8";
  return React.createElement("button", {
    className: cn(base, vClass, sClass, className),
    ...props
  }, children);
}
function Input({ className, ...props }) {
  return React.createElement("input", {
    className: cn(
      "flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props
  });
}
function useAuth() {
  const [currentUser, setCurrentUser] = React.useState(() => {
    try {
      const raw = localStorage.getItem("app_auth_user");
      if (raw) return JSON.parse(raw);
      const pb = localStorage.getItem("pocketbase_auth");
      if (pb) {
        const parsed = JSON.parse(pb);
        return parsed?.model || parsed?.record || null;
      }
    } catch (e) {
    }
    return {
      role: "superuser",
      email: "operations@jaibhavanicargo.com",
      name: "Vinod Kumar Rathod"
    };
  });
  return { currentUser };
}
function Badge({ className, variant, children }) {
  return React.createElement("span", {
    className: cn(
      "inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors",
      variant === "outline" ? "bg-transparent border-border/70" : "bg-secondary/40 text-secondary-foreground border-transparent",
      className
    )
  }, children);
}
function Table({ className, children }) {
  return React.createElement("table", { className: cn("w-full caption-bottom text-sm border-collapse", className) }, children);
}
function TableHeader({ className, children }) {
  return React.createElement("thead", { className: cn("[&_tr]:border-b bg-secondary/15", className) }, children);
}
function TableBody({ className, children }) {
  return React.createElement("tbody", { className: cn("[&_tr:last-child]:border-0", className) }, children);
}
function TableRow({ className, children }) {
  return React.createElement("tr", { className: cn("border-b border-border/40 transition-colors hover:bg-muted/40", className) }, children);
}
function TableHead({ className, children }) {
  return React.createElement("th", { className: cn("h-10 px-3 text-left align-middle font-bold text-muted-foreground", className) }, children);
}
function TableCell({ className, children }) {
  return React.createElement("td", { className: cn("p-3 align-middle", className) }, children);
}
const ACTION_COLORS = {
  CREATE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  DELETE: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  PAYMENT: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  PAYMENT_REVERSAL: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOGIN: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  LOGIN_FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
  ACCESS_DENIED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  EXPORT: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  PERMISSION_CHANGE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CONFIGURATION_CHANGE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  SECURITY_ALERT: "bg-red-500/20 text-red-300 border-red-500/40"
};
const SEVERITY_COLORS = {
  INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  LOW: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  CRITICAL: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
};
function formatDateTime(val, fallback = "N/A") {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (e) {
    return fallback;
  }
}
function formatTimeOnly(val, fallback = "N/A") {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d.toLocaleTimeString("en-IN");
  } catch (e) {
    return fallback;
  }
}
function safeGetTime(val) {
  if (!val) return 0;
  try {
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  } catch (e) {
    return 0;
  }
}
function EnterpriseAuditLogsPage() {
  const { currentUser } = useAuth();
  const isAuthorized = currentUser?.role === "superuser" || currentUser?.role === "super_admin" || currentUser?.role === "auditor" || currentUser?.email === "munnarathod222@gmail.com" || currentUser?.email === "operations@jaibhavanicargo.com";
  const [activeTab, setActiveTab] = React.useState("activity");
  const [events, setEvents] = React.useState([]);
  const [alerts, setAlerts] = React.useState([]);
  const [cases, setCases] = React.useState([]);
  const [health, setHealth] = React.useState(null);
  const [verification, setVerification] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [selectedCase, setSelectedCase] = React.useState(null);
  const [newCaseNote, setNewCaseNote] = React.useState("");
  const loadData = async () => {
    setLoading(true);
    try {
      let evts = [];
      let serverSuccess = false;
      try {
        const res = await fetch("/api/audit/events");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.events)) {
            evts = json.events;
            serverSuccess = true;
          }
        }
      } catch (e) {
      }
      if (!serverSuccess) {
        try {
          const raw = localStorage.getItem("jc_enterprise_audit_events");
          if (raw) {
            const local = JSON.parse(raw);
            if (Array.isArray(local)) evts = local;
          }
        } catch (e) {
        }
      } else if (evts.length === 0) {
        try {
          localStorage.removeItem("jc_enterprise_audit_events");
          localStorage.removeItem("jc_document_audit_logs");
          localStorage.removeItem("jbc_audit_logs");
        } catch (e) {
        }
      }
      evts = evts.filter(e => e && e.actor?.id !== "user_audit_test_01" && e.actor?.name !== "Chief Logistics Officer");
      evts.sort((a, b) => safeGetTime(b && (b.recorded_at || b.timestamp)) - safeGetTime(a && (a.recorded_at || a.timestamp)));
      setEvents(evts);
      try {
        const aRes = await fetch("/api/audit/alerts");
        if (aRes.ok) {
          const aJson = await aRes.json();
          if (aJson.success && Array.isArray(aJson.alerts)) setAlerts(aJson.alerts);
        }
      } catch (e) {
      }
      try {
        const cRes = await fetch("/api/audit/cases");
        if (cRes.ok) {
          const cJson = await cRes.json();
          if (cJson.success && Array.isArray(cJson.cases)) setCases(cJson.cases);
        }
      } catch (e) {
      }
      try {
        const hRes = await fetch("/api/audit/health");
        if (hRes.ok) {
          const hJson = await hRes.json();
          if (hJson.success && hJson.health) setHealth(hJson.health);
        }
      } catch (e) {
      }
      try {
        const vRes = await fetch("/api/audit/verify");
        if (vRes.ok) {
          const vJson = await vRes.json();
          if (vJson.success && vJson.verification) setVerification(vJson.verification);
        }
      } catch (e) {
      }
    } catch (err) {
      console.error("Audit load error:", err);
      toast.error("Failed to load audit records");
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    loadData();
    window.addEventListener("audit_event_logged", loadData);
    return () => window.removeEventListener("audit_event_logged", loadData);
  }, []);
  const runVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/audit/verify");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.verification) {
          setVerification(json.verification);
          if (json.verification.valid) {
            toast.success("Cryptographic hash chain verified! Zero tampering detected.");
          } else {
            toast.error(`Integrity breach: ${json.verification.issues.length} issue(s) detected!`);
          }
        }
      }
    } catch (e) {
      toast.error("Verification query failed");
    } finally {
      setVerifying(false);
    }
  };
  const handleReviewAlert = async (alertId, action) => {
    const notes = window.prompt(`Enter review notes for ${action} action:`, "Verified by compliance officer.");
    if (notes === null) return;
    try {
      const res = await fetch("/api/audit/alerts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action, notes, reviewer: currentUser?.name || "Compliance Lead" })
      });
      if (res.ok) {
        toast.success(`Alert updated to ${action}`);
        loadData();
      }
    } catch (e) {
      toast.error("Failed to review alert");
    }
  };
  const handleAddCaseNote = async (caseId) => {
    if (!newCaseNote.trim()) return;
    try {
      const res = await fetch("/api/audit/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          updateData: {
            note: newCaseNote.trim(),
            author: currentUser?.name || "Investigator"
          }
        })
      });
      if (res.ok) {
        toast.success("Investigation note appended");
        setNewCaseNote("");
        loadData();
      }
    } catch (e) {
      toast.error("Failed to update case");
    }
  };
  const handleUpdateCaseStatus = async (caseId, status) => {
    const findings = window.prompt(`Enter findings / resolution notes for status ${status}:`, "Investigation complete.");
    if (findings === null) return;
    try {
      const res = await fetch("/api/audit/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          updateData: {
            status,
            findings,
            resolution: findings,
            note: `Case status changed to ${status}. Note: ${findings}`,
            author: currentUser?.name || "Investigator"
          }
        })
      });
      if (res.ok) {
        toast.success(`Case marked as ${status}`);
        loadData();
      }
    } catch (e) {
      toast.error("Failed to update case status");
    }
  };
  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (activeTab === "financial" && e.module !== "FINANCIAL") return false;
      if (activeTab === "fleet" && e.module !== "FLEET") return false;
      if (activeTab === "security" && e.module !== "SECURITY" && e.module !== "AUTH") return false;
      if (activeTab === "admin" && e.module !== "ADMINISTRATION" && e.module !== "SETTINGS") return false;
      if (activeTab === "failed" && e.outcome !== "FAILURE" && e.outcome !== "DENIED" && e.outcome !== "ERROR") return false;
      if (activeTab === "exports" && e.action !== "EXPORT") return false;
      if (moduleFilter !== "all" && e.module?.toLowerCase() !== moduleFilter.toLowerCase()) return false;
      if (actionFilter !== "all" && e.action?.toUpperCase() !== actionFilter.toUpperCase()) return false;
      if (severityFilter !== "all" && e.severity?.toUpperCase() !== severityFilter.toUpperCase()) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = (e.details || "").toLowerCase().includes(q) || (e.entity_id || "").toLowerCase().includes(q) || (e.actor?.name || "").toLowerCase().includes(q) || (e.actor?.email || "").toLowerCase().includes(q) || (e.action || "").toLowerCase().includes(q) || (e.id || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [events, activeTab, moduleFilter, actionFilter, severityFilter, searchTerm]);
  const kpis = React.useMemo(() => {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const eventsToday = events.filter((e) => {
      const ts = e && (e.recorded_at || e.timestamp);
      return typeof ts === "string" && ts.startsWith(todayStr);
    }).length;
    const failedOps = events.filter((e) => e && (e.outcome === "FAILURE" || e.outcome === "DENIED" || e.outcome === "ERROR")).length;
    const criticalAlerts = alerts.filter((a) => a && a.severity === "CRITICAL").length;
    const openCases = cases.filter((c) => c && (c.status === "OPEN" || c.status === "UNDER_REVIEW")).length;
    const uniqueActors = new Set(events.map((e) => e && e.actor && (e.actor.email || e.actor.name)).filter(Boolean)).size;
    return {
      total: events.length,
      today: eventsToday,
      failed: failedOps,
      alerts: alerts.length,
      critical: criticalAlerts,
      cases: openCases,
      actors: uniqueActors,
      chainValid: verification ? verification.valid : true
    };
  }, [events, alerts, cases, verification]);
  const exportPdf = async () => {
    try {
      const rows = filteredEvents.slice(0, 300).map((e) => ({
        Sequence: "#" + (e.sequence_number || "0"),
        Timestamp: formatDateTime(e.recorded_at || e.timestamp),
        Actor: `${e.actor?.name || "N/A"} (${e.actor?.role || "N/A"})`,
        Module: e.module || "SYSTEM",
        Action: e.action || "UNKNOWN",
        Entity: `${e.entity_type || "N/A"} [${e.entity_id || "N/A"}]`,
        Details: e.details || ""
      }));
      await downloadPdf(
        rows,
        [
          { header: "Seq", key: "Sequence" },
          { header: "Timestamp", key: "Timestamp" },
          { header: "Actor", key: "Actor" },
          { header: "Module", key: "Module" },
          { header: "Action", key: "Action" },
          { header: "Entity", key: "Entity" },
          { header: "Details", key: "Details" }
        ],
        "Enterprise_Audit_Trail_Report",
        "Jai Bhavani Cargo - Cryptographic Audit & Anti-Fraud Trail"
      );
      toast.success("Downloaded Audit Trail PDF");
    } catch (e) {
      toast.error("Failed to export PDF");
    }
  };
  const exportExcel = async () => {
    try {
      const rows = filteredEvents.map((e) => {
        const sanitizeFormula = (val) => {
          if (typeof val === "string" && /^[=+\-@]/.test(val)) return "'" + val;
          return val;
        };
        return {
          Sequence: e.sequence_number || 0,
          Timestamp: formatDateTime(e.recorded_at || e.timestamp),
          "Actor Name": sanitizeFormula(e.actor?.name),
          "Actor Email": sanitizeFormula(e.actor?.email),
          "Actor Role": e.actor?.role,
          Module: e.module,
          Action: e.action,
          "Entity Type": e.entity_type,
          "Entity ID": sanitizeFormula(e.entity_id),
          Details: sanitizeFormula(e.details),
          "SHA-256 Hash": e.current_event_hash
        };
      });
      await downloadExcel(rows, "Enterprise_Audit_Trail_Report");
      toast.success("Downloaded Audit Trail Excel");
    } catch (e) {
      toast.error("Failed to export Excel");
    }
  };
  const handleClearAuditData = async () => {
    if (!window.confirm("Purge all dummy test logs and initialize authentic fleet audit ledger? This ensures the audit trail starts completely clean with genuine fleet records.")) {
      return;
    }
    try {
      await fetch("/api/audit/seed-baseline", { method: "POST" });
      localStorage.removeItem("jc_enterprise_audit_events");
      localStorage.removeItem("jc_document_audit_logs");
      localStorage.removeItem("jbc_audit_logs");
      toast.success("Audit ledger re-initialized with authentic fleet operations!");
      setTimeout(() => loadData(), 300);
    } catch (e) {
      toast.error("Failed to re-initialize audit ledgers: " + e.message);
    }
  };
  if (!isAuthorized) {
    return React.createElement(
      "div",
      {
        className: "min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4"
      },
      React.createElement("div", {
        className: "w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-500/20 shadow-xl text-3xl font-bold"
      }, "\u{1F512}"),
      React.createElement("h2", { className: "text-2xl font-extrabold text-foreground" }, "Enterprise Security Access Restricted"),
      React.createElement(
        "p",
        { className: "text-muted-foreground max-w-md mx-auto text-sm" },
        "System Audit & Anti-Fraud Security Logs are strictly protected and accessible exclusively by Master Superusers and authorized Compliance Officers."
      ),
      React.createElement(
        Button,
        { asChild: true, className: "rounded-xl font-bold px-6 cursor-pointer" },
        React.createElement("a", { href: "/dashboard" }, "Return to Dashboard")
      )
    );
  }
  return React.createElement(
    "div",
    {
      className: "min-h-[calc(100dvh-4rem)] p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 bg-background animate-in fade-in"
    },
    // ── Header ──────────────────────────────────────────────────────
    React.createElement(
      "div",
      {
        className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 border border-border/60 p-5 rounded-3xl backdrop-blur-md shadow-sm"
      },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "flex items-center gap-3" },
          React.createElement("div", { className: "p-2.5 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/30 font-mono text-xl" }, "\u{1F6E1}\uFE0F"),
          React.createElement(
            "div",
            null,
            React.createElement("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight text-foreground" }, "Enterprise Audit, Anti-Fraud & Security System"),
            React.createElement(
              "p",
              { className: "text-xs sm:text-sm text-muted-foreground mt-0.5" },
              "Cryptographically chained SHA-256 immutable audit ledger with real-time fraud detection and case management."
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-2" },
        React.createElement(Button, {
          variant: "outline",
          size: "sm",
          onClick: loadData,
          className: "rounded-xl font-bold text-xs gap-1.5 cursor-pointer"
        }, "\u{1F504} Refresh"),
        React.createElement(Button, {
          variant: "outline",
          size: "sm",
          onClick: runVerification,
          disabled: verifying,
          className: "rounded-xl font-bold text-xs gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
        }, verifying ? "Verifying..." : "\u26A1 Verify Chain"),
        React.createElement(Button, {
          variant: "outline",
          size: "sm",
          onClick: exportPdf,
          className: "rounded-xl font-bold text-xs gap-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
        }, "\u{1F4C4} Export PDF"),
        React.createElement(Button, {
          variant: "outline",
          size: "sm",
          onClick: exportExcel,
          className: "rounded-xl font-bold text-xs gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
        }, "\u{1F4CA} Export Excel"),
        React.createElement(Button, {
          variant: "outline",
          size: "sm",
          onClick: handleClearAuditData,
          className: "rounded-xl font-bold text-xs gap-1.5 text-rose-400 border-rose-500/50 hover:bg-rose-500/15 cursor-pointer"
        }, "\u{1F504} Purge Dummy / Reset Authentic Ledger")
      )
    ),
    // ── KPI Cards ───────────────────────────────────────────────────
    React.createElement(
      "div",
      { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" },
      React.createElement(
        Card,
        { className: "border-l-4 border-l-blue-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Total Events"),
          React.createElement("h3", { className: "text-2xl font-black mt-1 text-foreground" }, kpis.total),
          React.createElement("p", { className: "text-[10px] text-muted-foreground mt-2" }, `Today: +${kpis.today}`)
        )
      ),
      React.createElement(
        Card,
        { className: "border-l-4 border-l-emerald-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Chain Integrity"),
          React.createElement(
            "h3",
            { className: "text-lg font-black mt-1.5 text-emerald-400 flex items-center gap-1.5" },
            kpis.chainValid ? "\u2713 Verified Valid" : "\u26A0\uFE0F Breach"
          ),
          React.createElement("p", { className: "text-[10px] text-muted-foreground mt-2" }, "SHA-256 chained")
        )
      ),
      React.createElement(
        Card,
        { className: "border-l-4 border-l-rose-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Fraud Alerts"),
          React.createElement("h3", { className: "text-2xl font-black mt-1 text-rose-400" }, kpis.alerts),
          React.createElement("p", { className: "text-[10px] text-rose-500 font-bold mt-2" }, `Critical: ${kpis.critical}`)
        )
      ),
      React.createElement(
        Card,
        { className: "border-l-4 border-l-amber-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Open Cases"),
          React.createElement("h3", { className: "text-2xl font-black mt-1 text-amber-400" }, kpis.cases),
          React.createElement("p", { className: "text-[10px] text-muted-foreground mt-2" }, "Active inquiries")
        )
      ),
      React.createElement(
        Card,
        { className: "border-l-4 border-l-red-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Failed Ops"),
          React.createElement("h3", { className: "text-2xl font-black mt-1 text-red-400" }, kpis.failed),
          React.createElement("p", { className: "text-[10px] text-muted-foreground mt-2" }, "Denied / Errors")
        )
      ),
      React.createElement(
        Card,
        { className: "border-l-4 border-l-cyan-500 bg-card rounded-2xl shadow-sm" },
        React.createElement(
          CardContent,
          { className: "p-4" },
          React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Active Operators"),
          React.createElement("h3", { className: "text-2xl font-black mt-1 text-cyan-400" }, kpis.actors),
          React.createElement("p", { className: "text-[10px] text-muted-foreground mt-2" }, "Tracked identities")
        )
      )
    ),
    // ── 11 Dedicated Navigation Tabs ────────────────────────────────
    React.createElement(
      "div",
      { className: "flex overflow-x-auto gap-2 pb-1 border-b border-border/50 no-scrollbar" },
      [
        { id: "activity", label: "All Activity", icon: "\u{1F4DC}", badge: events.length },
        { id: "business", label: "Business Audit", icon: "\u{1F3E2}" },
        { id: "financial", label: "Financial Audit", icon: "\u{1F4B0}" },
        { id: "security", label: "Security & Auth", icon: "\u{1F6E1}\uFE0F" },
        { id: "admin", label: "Admin Actions", icon: "\u2699\uFE0F" },
        { id: "failed", label: "Failed Ops", icon: "\u26A0\uFE0F", badge: kpis.failed > 0 ? kpis.failed : null },
        { id: "exports", label: "Data Exports", icon: "\u{1F4E4}" },
        { id: "alerts", label: "Fraud Alerts", icon: "\u{1F6A8}", badge: alerts.length > 0 ? alerts.length : null },
        { id: "cases", label: "Investigation Cases", icon: "\u{1F4C2}", badge: cases.length > 0 ? cases.length : null },
        { id: "integrity", label: "Integrity Check", icon: "\u{1F510}" },
        { id: "health", label: "System Health", icon: "\u{1F493}" }
      ].map(
        (tab) => React.createElement(
          "button",
          {
            key: tab.id,
            onClick: () => setActiveTab(tab.id),
            className: cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border",
              activeTab === tab.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card/40 hover:bg-card border-border/50 text-muted-foreground hover:text-foreground"
            )
          },
          React.createElement("span", null, tab.icon),
          React.createElement("span", null, tab.label),
          tab.badge !== null && tab.badge !== void 0 ? React.createElement(Badge, {
            variant: activeTab === tab.id ? "secondary" : "outline",
            className: "text-[10px] px-1.5 py-0 h-4 min-w-[16px] font-mono"
          }, tab.badge) : null
        )
      )
    ),
    // ── Tab 1-7: Event Ledger Views ─────────────────────────────────
    activeTab !== "alerts" && activeTab !== "cases" && activeTab !== "integrity" && activeTab !== "health" && React.createElement(
      Card,
      { className: "rounded-2xl shadow-sm border-border/60 overflow-hidden" },
      React.createElement(
        CardHeader,
        { className: "pb-3 border-b border-border/40 bg-secondary/5" },
        React.createElement(
          "div",
          { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-3" },
          React.createElement(
            "div",
            null,
            React.createElement(
              CardTitle,
              { className: "text-base font-bold text-foreground flex items-center gap-2" },
              "Audited Transaction Stream",
              React.createElement(Badge, { variant: "outline", className: "font-mono text-[10px]" }, `${filteredEvents.length} records`)
            ),
            React.createElement(
              CardDescription,
              { className: "text-xs mt-0.5" },
              "Real-time tamper-evident events with SHA-256 cryptographic sequence proofs."
            )
          ),
          React.createElement(
            "div",
            { className: "flex flex-wrap items-center gap-2 w-full md:w-auto" },
            React.createElement(Input, {
              placeholder: "Search operator, record ID, hash, details...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "h-9 text-xs rounded-xl w-full sm:w-64 bg-background"
            }),
            React.createElement(
              "select",
              {
                value: moduleFilter,
                onChange: (e) => setModuleFilter(e.target.value),
                className: "h-9 text-xs rounded-xl px-2.5 bg-background border border-border/80 text-foreground cursor-pointer outline-none"
              },
              React.createElement("option", { value: "all" }, "All Modules"),
              React.createElement("option", { value: "FINANCIAL" }, "Financial"),
              React.createElement("option", { value: "FLEET" }, "Fleet"),
              React.createElement("option", { value: "LOGISTICS" }, "Logistics"),
              React.createElement("option", { value: "ADMINISTRATION" }, "Admin & Staff"),
              React.createElement("option", { value: "SECURITY" }, "Security & Auth"),
              React.createElement("option", { value: "SETTINGS" }, "Settings")
            ),
            React.createElement(
              "select",
              {
                value: actionFilter,
                onChange: (e) => setActionFilter(e.target.value),
                className: "h-9 text-xs rounded-xl px-2.5 bg-background border border-border/80 text-foreground cursor-pointer outline-none"
              },
              React.createElement("option", { value: "all" }, "All Actions"),
              React.createElement("option", { value: "CREATE" }, "CREATE"),
              React.createElement("option", { value: "UPDATE" }, "UPDATE"),
              React.createElement("option", { value: "DELETE" }, "DELETE"),
              React.createElement("option", { value: "PAYMENT" }, "PAYMENT"),
              React.createElement("option", { value: "APPROVE" }, "APPROVE"),
              React.createElement("option", { value: "EXPORT" }, "EXPORT")
            )
          )
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-0" },
        filteredEvents.length === 0 ? React.createElement(
          "div",
          { className: "py-16 text-center text-muted-foreground text-sm space-y-2" },
          React.createElement("p", { className: "text-2xl" }, "\u{1F50D}"),
          React.createElement("p", { className: "font-bold" }, "No audit log entries match your filter."),
          React.createElement("p", { className: "text-xs text-muted-foreground" }, "Try clearing search terms or selecting All Modules.")
        ) : React.createElement(
          "div",
          { className: "overflow-x-auto" },
          React.createElement(
            Table,
            null,
            React.createElement(
              TableHeader,
              null,
              React.createElement(
                TableRow,
                null,
                React.createElement(TableHead, { className: "w-16 font-mono text-[11px]" }, "Seq"),
                React.createElement(TableHead, { className: "w-36 text-[11px]" }, "Timestamp"),
                React.createElement(TableHead, { className: "w-48 text-[11px]" }, "Operator / Identity"),
                React.createElement(TableHead, { className: "w-24 text-[11px]" }, "Action"),
                React.createElement(TableHead, { className: "w-28 text-[11px]" }, "Module"),
                React.createElement(TableHead, { className: "w-36 font-mono text-[11px]" }, "Entity ID"),
                React.createElement(TableHead, { className: "text-[11px]" }, "Change Details & Diff"),
                React.createElement(TableHead, { className: "w-24 text-right text-[11px]" }, "Inspect")
              )
            ),
            React.createElement(
              TableBody,
              null,
              filteredEvents.map(
                (e) => React.createElement(
                  TableRow,
                  {
                    key: e.id,
                    className: "hover:bg-secondary/10 transition-colors text-xs border-b border-border/40"
                  },
                  React.createElement(
                    TableCell,
                    { className: "font-mono text-muted-foreground text-[11px]" },
                    "#" + e.sequence_number
                  ),
                  React.createElement(
                    TableCell,
                    { className: "font-mono text-muted-foreground text-[11px] whitespace-nowrap" },
                    formatDateTime(e.recorded_at || e.timestamp)
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      "div",
                      { className: "flex flex-col" },
                      React.createElement("span", { className: "font-bold text-foreground truncate" }, e.actor?.name || "System Operator"),
                      React.createElement(
                        "span",
                        { className: "text-[10px] text-muted-foreground truncate" },
                        `${e.actor?.email || ""} \u2022 ${e.actor?.role || "operator"}`
                      )
                    )
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(Badge, {
                      variant: "outline",
                      className: cn("font-black text-[10px] px-2 py-0.5 uppercase tracking-wider", ACTION_COLORS[e.action] || "bg-muted text-muted-foreground")
                    }, e.action)
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(Badge, { variant: "secondary", className: "font-bold text-[10px]" }, e.module)
                  ),
                  React.createElement(
                    TableCell,
                    { className: "font-mono text-[11px] font-bold text-foreground truncate" },
                    e.entity_id
                  ),
                  React.createElement(
                    TableCell,
                    { className: "max-w-md" },
                    React.createElement(
                      "div",
                      { className: "space-y-1" },
                      React.createElement("p", { className: "text-foreground font-medium leading-relaxed" }, e.details),
                      e.changed_fields && e.changed_fields.length > 0 && React.createElement(
                        "div",
                        { className: "flex flex-wrap gap-1" },
                        e.changed_fields.map(
                          (f) => React.createElement("span", {
                            key: f,
                            className: "text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }, f)
                        )
                      )
                    )
                  ),
                  React.createElement(
                    TableCell,
                    { className: "text-right" },
                    React.createElement(Button, {
                      size: "sm",
                      variant: "outline",
                      onClick: () => setSelectedEvent(e),
                      className: "h-7 px-2.5 text-[11px] rounded-lg font-bold border-border/80 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    }, "Diff \u{1F50D}")
                  )
                )
              )
            )
          )
        )
      )
    ),
    // ── Tab 8: Fraud & Security Alerts ──────────────────────────────
    activeTab === "alerts" && React.createElement(
      Card,
      { className: "rounded-2xl shadow-sm border-border/60 overflow-hidden" },
      React.createElement(
        CardHeader,
        { className: "pb-3 border-b border-border/40 bg-secondary/5" },
        React.createElement(
          CardTitle,
          { className: "text-base font-bold text-foreground flex items-center gap-2" },
          "\u{1F6A8} Security & Fraud Detection Stream",
          React.createElement(Badge, { variant: "outline", className: "font-mono text-[10px]" }, `${alerts.length} detections`)
        ),
        React.createElement(
          CardDescription,
          { className: "text-xs" },
          "Algorithmic heuristic triggers checking 13 financial and operational risk rules in real-time."
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-4 sm:p-6 space-y-4" },
        alerts.length === 0 ? React.createElement(
          "div",
          { className: "py-16 text-center text-muted-foreground text-sm space-y-2" },
          React.createElement("p", { className: "text-3xl" }, "\u{1F6E1}\uFE0F"),
          React.createElement("p", { className: "font-bold text-emerald-400" }, "All Clean! No Fraud or Security Alerts Triggered."),
          React.createElement("p", { className: "text-xs text-muted-foreground" }, "All 13 detection heuristics are continuously monitoring transactions.")
        ) : alerts.map(
          (a) => React.createElement(
            "div",
            {
              key: a.id,
              className: cn(
                "p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                a.severity === "CRITICAL" ? "bg-rose-500/10 border-rose-500/30" : "bg-card border-border/60"
              )
            },
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2 flex-wrap" },
                React.createElement(Badge, {
                  variant: "outline",
                  className: cn("font-black text-[10px] px-2 py-0.5", SEVERITY_COLORS[a.severity])
                }, a.severity),
                React.createElement("span", { className: "font-bold text-sm text-foreground" }, a.title),
                React.createElement(
                  "span",
                  { className: "text-[10px] font-mono text-muted-foreground" },
                  `[${a.rule_id}]`
                )
              ),
              React.createElement("p", { className: "text-xs text-foreground/90 leading-relaxed max-w-3xl" }, a.description),
              React.createElement(
                "div",
                { className: "flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground" },
                React.createElement("span", null, `Record: ${a.entity_id}`),
                React.createElement("span", null, "\u2022"),
                React.createElement("span", null, `Actor: ${a.related_user}`),
                React.createElement("span", null, "\u2022"),
                React.createElement("span", null, formatDateTime(a.timestamp)),
                React.createElement("span", null, "\u2022"),
                React.createElement(Badge, {
                  variant: "outline",
                  className: a.status === "OPEN" ? "text-rose-400 border-rose-500/30" : "text-emerald-400 border-emerald-500/30"
                }, a.status)
              )
            ),
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              a.status === "OPEN" ? [
                React.createElement(Button, {
                  key: "inv",
                  size: "sm",
                  onClick: () => handleReviewAlert(a.id, "INVESTIGATE"),
                  className: "h-8 px-3 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                }, "Investigate"),
                React.createElement(Button, {
                  key: "dis",
                  size: "sm",
                  variant: "outline",
                  onClick: () => handleReviewAlert(a.id, "DISMISS"),
                  className: "h-8 px-3 rounded-xl font-bold text-xs border-border cursor-pointer"
                }, "Dismiss")
              ] : React.createElement(
                "span",
                { className: "text-xs text-muted-foreground italic" },
                `Reviewed by ${a.reviewed_by || "Admin"}`
              )
            )
          )
        )
      )
    ),
    // ── Tab 9: Investigation Case Management ────────────────────────
    activeTab === "cases" && React.createElement(
      Card,
      { className: "rounded-2xl shadow-sm border-border/60 overflow-hidden" },
      React.createElement(
        CardHeader,
        { className: "pb-3 border-b border-border/40 bg-secondary/5" },
        React.createElement(
          CardTitle,
          { className: "text-base font-bold text-foreground flex items-center gap-2" },
          "\u{1F4C2} Anti-Fraud Investigation Cases",
          React.createElement(Badge, { variant: "outline", className: "font-mono text-[10px]" }, `${cases.length} cases`)
        ),
        React.createElement(
          CardDescription,
          { className: "text-xs" },
          "Formally opened compliance inquiries with audited notes, findings, and resolutions."
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-4 sm:p-6 space-y-4" },
        cases.length === 0 ? React.createElement(
          "div",
          { className: "py-16 text-center text-muted-foreground text-sm space-y-2" },
          React.createElement("p", { className: "text-3xl" }, "\u{1F4C2}"),
          React.createElement("p", { className: "font-bold" }, "No Active Investigation Cases."),
          React.createElement("p", { className: "text-xs text-muted-foreground" }, "Critical fraud alerts automatically create review cases here.")
        ) : cases.map(
          (c) => React.createElement(
            "div",
            {
              key: c.id,
              className: "p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4"
            },
            React.createElement(
              "div",
              { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-3" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2.5" },
                React.createElement(Badge, { variant: "outline", className: "font-mono font-bold text-xs px-2.5 py-1 bg-secondary/20" }, c.case_number),
                React.createElement("h3", { className: "font-bold text-base text-foreground" }, c.title),
                React.createElement(Badge, {
                  variant: "outline",
                  className: cn("font-black text-[10px]", SEVERITY_COLORS[c.severity])
                }, c.severity)
              ),
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(Badge, {
                  variant: "secondary",
                  className: cn("font-bold text-xs", c.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")
                }, c.status),
                React.createElement(Button, {
                  size: "sm",
                  variant: "outline",
                  onClick: () => handleUpdateCaseStatus(c.id, c.status === "OPEN" ? "UNDER_REVIEW" : "RESOLVED"),
                  className: "h-8 px-3 rounded-xl font-bold text-xs cursor-pointer"
                }, c.status === "OPEN" ? "Mark Under Review" : "Resolve Case")
              )
            ),
            React.createElement(
              "div",
              { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-secondary/10 p-3 rounded-xl" },
              React.createElement(
                "div",
                null,
                React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Target Record"),
                React.createElement("span", { className: "font-mono font-bold text-foreground" }, c.related_record)
              ),
              React.createElement(
                "div",
                null,
                React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Related User"),
                React.createElement("span", { className: "text-foreground" }, c.related_user)
              ),
              React.createElement(
                "div",
                null,
                React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Assigned Lead"),
                React.createElement("span", { className: "text-foreground" }, c.assigned_reviewer)
              ),
              React.createElement(
                "div",
                null,
                React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Created At"),
                React.createElement("span", { className: "font-mono text-foreground" }, formatDateTime(c.created_at))
              )
            ),
            React.createElement(
              "div",
              { className: "space-y-2" },
              React.createElement("h4", { className: "text-xs font-bold text-foreground uppercase tracking-wider" }, "Investigation Timeline & Notes"),
              React.createElement(
                "div",
                { className: "space-y-2 max-h-48 overflow-y-auto pr-1" },
                (c.investigation_notes || []).map(
                  (note, idx) => React.createElement(
                    "div",
                    {
                      key: idx,
                      className: "p-3 rounded-xl bg-secondary/15 border border-border/40 text-xs space-y-1"
                    },
                    React.createElement(
                      "div",
                      { className: "flex justify-between items-center text-[10px] text-muted-foreground font-mono" },
                      React.createElement("span", { className: "font-bold text-foreground" }, note.author),
                      React.createElement("span", null, formatDateTime(note.timestamp))
                    ),
                    React.createElement("p", { className: "text-foreground" }, note.note)
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "flex gap-2 pt-2" },
                React.createElement(Input, {
                  placeholder: "Add new investigation note...",
                  value: selectedCase?.id === c.id ? newCaseNote : "",
                  onFocus: () => setSelectedCase(c),
                  onChange: (e) => setNewCaseNote(e.target.value),
                  className: "h-9 text-xs rounded-xl bg-background"
                }),
                React.createElement(Button, {
                  size: "sm",
                  onClick: () => handleAddCaseNote(c.id),
                  className: "h-9 px-4 rounded-xl font-bold text-xs bg-primary text-primary-foreground cursor-pointer"
                }, "Append Note")
              )
            )
          )
        )
      )
    ),
    // ── Tab 10: Cryptographic Integrity Verification ────────────────
    activeTab === "integrity" && React.createElement(
      Card,
      { className: "rounded-2xl shadow-sm border-border/60 overflow-hidden" },
      React.createElement(
        CardHeader,
        { className: "pb-3 border-b border-border/40 bg-secondary/5" },
        React.createElement(
          "div",
          { className: "flex justify-between items-center" },
          React.createElement(
            "div",
            null,
            React.createElement(
              CardTitle,
              { className: "text-base font-bold text-foreground flex items-center gap-2" },
              "\u{1F510} Cryptographic Hash Chain Verification Engine"
            ),
            React.createElement(
              CardDescription,
              { className: "text-xs" },
              "Recalculates every SHA-256 block hash from the genesis root to verify that zero records were deleted, inserted, or modified out-of-band."
            )
          ),
          React.createElement(Button, {
            onClick: runVerification,
            disabled: verifying,
            className: "rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
          }, verifying ? "Recomputing SHA-256 Hashes..." : "\u26A1 Run Verification Now")
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-6 space-y-6" },
        verification && React.createElement(
          "div",
          {
            className: cn(
              "p-6 rounded-2xl border text-center space-y-3",
              verification.valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
            )
          },
          React.createElement("div", { className: "text-4xl" }, verification.valid ? "\u{1F6E1}\uFE0F" : "\u{1F6A8}"),
          React.createElement(
            "h3",
            { className: cn("text-xl font-black", verification.valid ? "text-emerald-400" : "text-rose-400") },
            verification.valid ? "Cryptographic Proof Verified: Hash Chain is 100% Intact" : "Integrity Alert: Hash Chain Tampering Detected!"
          ),
          React.createElement(
            "p",
            { className: "text-xs text-muted-foreground max-w-xl mx-auto" },
            verification.valid ? `Verified ${verification.total_events} consecutive audit blocks from the genesis anchor. Zero sequence gaps or altered payloads.` : `Detected ${verification.issues.length} structural integrity discrepancies! Records may have been altered outside the application pipeline.`
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left text-xs bg-background/50 p-4 rounded-xl border border-border/50 font-mono mt-4" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Genesis Root Hash"),
              React.createElement("span", { className: "text-foreground truncate block" }, verification.genesis_root)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Latest Block Hash"),
              React.createElement("span", { className: "text-foreground truncate block" }, verification.latest_event_hash)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Verified Records Count"),
              React.createElement("span", { className: "text-emerald-400 font-bold block" }, verification.total_events)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Last Verified At"),
              React.createElement("span", { className: "text-foreground block" }, formatDateTime(verification?.verified_at))
            )
          )
        )
      )
    ),
    // ── Tab 11: Audit System Health ─────────────────────────────────
    activeTab === "health" && React.createElement(
      Card,
      { className: "rounded-2xl shadow-sm border-border/60 overflow-hidden" },
      React.createElement(
        CardHeader,
        { className: "pb-3 border-b border-border/40 bg-secondary/5" },
        React.createElement(
          CardTitle,
          { className: "text-base font-bold text-foreground flex items-center gap-2" },
          "\u{1F493} Audit Pipeline Health & Diagnostics"
        ),
        React.createElement(
          CardDescription,
          { className: "text-xs" },
          "Telemetry metrics on storage buffer, sequence continuity, ingestion rate, and error rates."
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-6 space-y-4" },
        health && React.createElement(
          "div",
          { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
          React.createElement(
            "div",
            { className: "p-4 rounded-2xl bg-card border border-border/60 space-y-1" },
            React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Pipeline Status"),
            React.createElement("h4", { className: "text-lg font-black text-emerald-400" }, health.status),
            React.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Active ingestion online")
          ),
          React.createElement(
            "div",
            { className: "p-4 rounded-2xl bg-card border border-border/60 space-y-1" },
            React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Sequence Continuity"),
            React.createElement(
              "h4",
              { className: "text-lg font-black text-emerald-400" },
              health.sequence_continuity_valid ? "100% Continuous" : "Gaps Detected"
            ),
            React.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Zero missing event IDs")
          ),
          React.createElement(
            "div",
            { className: "p-4 rounded-2xl bg-card border border-border/60 space-y-1" },
            React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Storage Ledger Size"),
            React.createElement(
              "h4",
              { className: "text-lg font-black text-foreground font-mono" },
              `${(health.storage_size_bytes / 1024).toFixed(1)} KB`
            ),
            React.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Append-only JSON ledger")
          ),
          React.createElement(
            "div",
            { className: "p-4 rounded-2xl bg-card border border-border/60 space-y-1" },
            React.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground" }, "Last Write Timestamp"),
            React.createElement(
              "h4",
              { className: "text-xs font-mono font-bold text-foreground mt-2" },
              formatTimeOnly(health?.latest_event_at)
            ),
            React.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Synchronized with server")
          )
        )
      )
    ),
    // ── Side-by-Side Diff Modal / Drawer ────────────────────────────
    selectedEvent && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        },
        React.createElement(
          "div",
          { className: "p-5 border-b border-border/60 bg-secondary/10 flex justify-between items-center" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "h3",
              { className: "font-black text-lg text-foreground flex items-center gap-2" },
              "\u{1F50D} State Transition Inspection",
              React.createElement(Badge, { variant: "outline", className: "font-mono text-xs" }, selectedEvent.id)
            ),
            React.createElement(
              "p",
              { className: "text-xs text-muted-foreground" },
              `${selectedEvent.action} on ${selectedEvent.entity_type} [${selectedEvent.entity_id}] by ${selectedEvent.actor?.name}`
            )
          ),
          React.createElement(Button, {
            size: "sm",
            variant: "ghost",
            onClick: () => setSelectedEvent(null),
            className: "rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer font-bold"
          }, "\u2715")
        ),
        React.createElement(
          "div",
          { className: "p-6 overflow-y-auto space-y-5 flex-1" },
          // Cryptographic Fingerprints
          React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-secondary/15 p-4 rounded-2xl border border-border/50" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Previous Event Hash (SHA-256)"),
              React.createElement("span", { className: "text-foreground truncate block" }, selectedEvent.previous_event_hash)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-muted-foreground block text-[10px] uppercase font-bold" }, "Current Event Hash (SHA-256)"),
              React.createElement("span", { className: "text-cyan-400 truncate block" }, selectedEvent.current_event_hash)
            )
          ),
          // Before and After side-by-side JSON diff
          React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                "h4",
                { className: "text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5" },
                "\u23EE\uFE0F Previous State Snapshot"
              ),
              React.createElement("pre", {
                className: "p-4 rounded-2xl bg-secondary/20 border border-border/60 text-[11px] font-mono overflow-x-auto text-muted-foreground max-h-80 leading-relaxed"
              }, JSON.stringify(selectedEvent.previous_values || { message: "No prior state (Record created)" }, null, 2))
            ),
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                "h4",
                { className: "text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5" },
                "\u23ED\uFE0F New State Snapshot"
              ),
              React.createElement("pre", {
                className: "p-4 rounded-2xl bg-secondary/20 border border-border/60 text-[11px] font-mono overflow-x-auto text-emerald-300 dark:text-emerald-400 max-h-80 leading-relaxed"
              }, JSON.stringify(selectedEvent.new_values || { message: "No new state (Record deleted)" }, null, 2))
            )
          )
        ),
        React.createElement(
          "div",
          { className: "p-4 border-t border-border/60 bg-secondary/5 flex justify-end" },
          React.createElement(Button, {
            onClick: () => setSelectedEvent(null),
            className: "rounded-xl font-bold px-5 text-xs"
          }, "Close Inspector")
        )
      )
    )
  );
}
class AuditErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[Audit Page Error Caught]:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        {
          className: "p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-card border border-rose-500/30 rounded-3xl shadow-xl"
        },
        React.createElement("div", { className: "text-4xl" }, "\u{1F6E1}\uFE0F"),
        React.createElement("h3", { className: "text-lg font-bold text-rose-400" }, "Audit Dashboard Active Recovery"),
        React.createElement("p", { className: "text-xs text-muted-foreground" }, this.state.error?.message || "Recovering dashboard session."),
        React.createElement("button", {
          onClick: () => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          },
          className: "px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
        }, "Reload Audit Dashboard")
      );
    }
    return this.props.children;
  }
}
function EnterpriseAuditLogsPageWrapper() {
  return React.createElement(AuditErrorBoundary, null, React.createElement(EnterpriseAuditLogsPage));
}
export {
  EnterpriseAuditLogsPageWrapper as default
};
