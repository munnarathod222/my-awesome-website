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
    className: cn("flex flex-col space-y-1.5 p-5", className),
    ...props
  }, children);
}
function CardTitle({ className, children, ...props }) {
  return React.createElement("h3", {
    className: cn("text-lg font-bold leading-none tracking-tight text-foreground", className),
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
    className: cn("p-5 pt-0", className),
    ...props
  }, children);
}
function Button({ className, variant, size, children, ...props }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  let vClass = "bg-primary text-primary-foreground hover:bg-primary/90";
  if (variant === "outline") vClass = "border border-border bg-background hover:bg-secondary/40 text-foreground";
  else if (variant === "ghost") vClass = "hover:bg-secondary/30 text-muted-foreground hover:text-foreground";
  else if (variant === "secondary") vClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
  let sClass = "h-9 px-4 py-2";
  if (size === "sm") sClass = "h-8 rounded-lg px-3 text-[11px]";
  else if (size === "lg") sClass = "h-10 rounded-xl px-6 text-sm";
  else if (size === "icon") sClass = "h-8 w-8 p-0";
  return React.createElement("button", {
    className: cn(base, vClass, sClass, className),
    ...props
  }, children);
}
function Input({ className, ...props }) {
  return React.createElement("input", {
    className: cn(
      "flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props
  });
}
function Badge({ className, variant, children }) {
  return React.createElement("span", {
    className: cn(
      "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider",
      variant === "outline" ? "bg-transparent border-border" : "bg-secondary/30 text-secondary-foreground border-transparent",
      className
    )
  }, children);
}
function formatDateTime(val, fallback = "N/A") {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return fallback;
  }
}
function formatDateOnly(val, fallback = "N/A") {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return fallback;
  }
}
const PRIORITY_COLORS = {
  LOW: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  MEDIUM: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  HIGH: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CRITICAL: "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse",
  URGENT: "bg-red-500/25 text-red-300 border-red-500/50 animate-pulse"
};
const STATUS_COLORS = {
  NOT_STARTED: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  WAITING_FOR_RESPONSE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PENDING_APPROVAL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  BLOCKED: "bg-red-500/20 text-red-400 border-red-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-muted text-muted-foreground border-border"
};
function useSafeAuth() {
  const [user] = React.useState(() => {
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
      id: "usr_operations",
      name: "Vinod Kumar Rathod",
      email: "operations@jaibhavanicargo.com",
      role: "super_admin"
    };
  });
  return { currentUser: user };
}
function EnterpriseProductivityDashboard() {
  const { currentUser } = useSafeAuth();
  const [activeTab, setActiveTab] = React.useState("tasks");
  const [viewMode, setViewMode] = React.useState("list");
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [reminders, setReminders] = React.useState([]);
  const [workflows, setWorkflows] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [showReminderModal, setShowReminderModal] = React.useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [newChecklistText, setNewChecklistText] = React.useState("");
  const [taskForm, setTaskForm] = React.useState({
    title: "",
    description: "",
    department: "Operations",
    priority: "MEDIUM",
    due_date: new Date(Date.now() + 864e5).toISOString().slice(0, 16),
    assigned_to_name: "Vinod Kumar Rathod",
    related_entity_type: "",
    related_entity_id: ""
  });
  const [reminderForm, setReminderForm] = React.useState({
    title: "",
    notes: "",
    trigger_time: new Date(Date.now() + 36e5).toISOString().slice(0, 16),
    priority: "MEDIUM",
    recurrence_type: "NONE"
  });
  const [workflowForm, setWorkflowForm] = React.useState({
    title: "",
    description: "",
    workflow_type: "EXPENSE_RELEASE",
    department: "Finance",
    amount: ""
  });
  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, taskRes, remRes, wfRes, notifRes] = await Promise.all([
        fetch("/api/productivity/summary"),
        fetch("/api/productivity/tasks"),
        fetch("/api/productivity/reminders"),
        fetch("/api/productivity/workflows"),
        fetch("/api/productivity/notifications")
      ]);
      if (sumRes.ok) {
        const s = await sumRes.json();
        if (s.success) setSummary(s);
      }
      if (taskRes.ok) {
        const t = await taskRes.json();
        if (t.success && Array.isArray(t.tasks)) setTasks(t.tasks);
      }
      if (remRes.ok) {
        const r = await remRes.json();
        if (r.success && Array.isArray(r.reminders)) setReminders(r.reminders);
      }
      if (wfRes.ok) {
        const w = await wfRes.json();
        if (w.success && Array.isArray(w.workflows)) setWorkflows(w.workflows);
      }
      if (notifRes.ok) {
        const n = await notifRes.json();
        if (n.success && Array.isArray(n.notifications)) setNotifications(n.notifications);
      }
    } catch (e) {
      console.error("[Productivity Load Error]:", e);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    loadData();
  }, []);
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error("Please enter a task title");
    try {
      const res = await fetch("/api/productivity/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({
          ...taskForm,
          due_date: new Date(taskForm.due_date).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task created successfully");
        setShowTaskModal(false);
        setTaskForm({
          title: "",
          description: "",
          department: "Operations",
          priority: "MEDIUM",
          due_date: new Date(Date.now() + 864e5).toISOString().slice(0, 16),
          assigned_to_name: currentUser.name,
          related_entity_type: "",
          related_entity_id: ""
        });
        loadData();
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch (err) {
      toast.error("Network error creating task");
    }
  };
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!reminderForm.title.trim()) return toast.error("Please enter a reminder title");
    try {
      const res = await fetch("/api/productivity/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({
          ...reminderForm,
          trigger_time: new Date(reminderForm.trigger_time).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reminder scheduled successfully");
        setShowReminderModal(false);
        setReminderForm({
          title: "",
          notes: "",
          trigger_time: new Date(Date.now() + 36e5).toISOString().slice(0, 16),
          priority: "MEDIUM",
          recurrence_type: "NONE"
        });
        loadData();
      } else {
        toast.error(data.error || "Failed to schedule reminder");
      }
    } catch (err) {
      toast.error("Network error scheduling reminder");
    }
  };
  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!workflowForm.title.trim()) return toast.error("Please enter a request title");
    try {
      const res = await fetch("/api/productivity/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify(workflowForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Approval request submitted");
        setShowWorkflowModal(false);
        setWorkflowForm({ title: "", description: "", workflow_type: "EXPENSE_RELEASE", department: "Finance", amount: "" });
        loadData();
      } else {
        toast.error(data.error || "Failed to submit workflow");
      }
    } catch (err) {
      toast.error("Network error submitting request");
    }
  };
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch("/api/productivity/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({ taskId, updates: { status: newStatus } })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Task updated to ${newStatus}`);
        loadData();
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(data.task);
        }
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  const handleAddChecklist = async () => {
    if (!newChecklistText.trim() || !selectedTask) return;
    const newItem = {
      id: "chk_" + Date.now(),
      text: newChecklistText.trim(),
      completed: false
    };
    const updatedChecklists = [...selectedTask.checklists || [], newItem];
    try {
      const res = await fetch("/api/productivity/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({ taskId: selectedTask.id, updates: { checklists: updatedChecklists } })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTask(data.task);
        setNewChecklistText("");
        loadData();
      }
    } catch (err) {
    }
  };
  const handleToggleChecklist = async (itemId) => {
    if (!selectedTask) return;
    const updatedChecklists = (selectedTask.checklists || []).map(
      (c) => c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    try {
      const res = await fetch("/api/productivity/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({ taskId: selectedTask.id, updates: { checklists: updatedChecklists } })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTask(data.task);
        loadData();
      }
    } catch (err) {
    }
  };
  const handleCompleteReminder = async (reminderId) => {
    try {
      const res = await fetch("/api/productivity/reminders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reminder marked completed");
        loadData();
      }
    } catch (err) {
      toast.error("Failed to complete reminder");
    }
  };
  const handleSnoozeReminder = async (reminderId, minutes) => {
    try {
      const res = await fetch("/api/productivity/reminders/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId, minutes })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Snoozed for ${minutes} minutes`);
        loadData();
      }
    } catch (err) {
      toast.error("Failed to snooze reminder");
    }
  };
  const handleWorkflowReview = async (workflowId, action, reason = "") => {
    try {
      const res = await fetch("/api/productivity/workflows/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-name": currentUser.name, "x-actor-id": currentUser.id },
        body: JSON.stringify({ workflowId, action, reason })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Request ${action === "APPROVE" ? "Approved" : "Rejected"}`);
        setShowRejectModal(null);
        setRejectionReason("");
        loadData();
      } else {
        toast.error(data.error || "Action rejected");
      }
    } catch (err) {
      toast.error("Error processing workflow action");
    }
  };
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (deptFilter !== "all" && t.department !== deptFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.related_entity_id || "").toLowerCase().includes(q) || (t.assigned_to_name || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, deptFilter, priorityFilter, searchTerm]);
  const metrics = summary?.metrics || {
    my_tasks_today: 0,
    overdue_tasks: 0,
    upcoming_reminders: 0,
    high_priority_tasks: 0,
    tasks_in_progress: 0,
    tasks_awaiting_approval: 0,
    completed_tasks: 0,
    daily_completion_percentage: 0,
    escalated_tasks: 0,
    pending_notifications: 0
  };
  return React.createElement(
    "div",
    {
      className: "min-h-[calc(100dvh-4rem)] p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 bg-background text-foreground"
    },
    // ── Command Center Header ─────────────────────────────────────────
    React.createElement(
      "div",
      {
        className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/70 p-5 rounded-3xl backdrop-blur-md shadow-sm"
      },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "flex items-center gap-3" },
          React.createElement("div", { className: "p-2.5 bg-primary/15 text-primary rounded-2xl border border-primary/30 text-xl font-bold" }, "\u26A1"),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h1",
              { className: "text-2xl sm:text-3xl font-black tracking-tight text-foreground" },
              "Productivity & Workflow Command Center"
            ),
            React.createElement(
              "p",
              { className: "text-xs text-muted-foreground mt-0.5" },
              "Enterprise task lifecycle, persistent background reminders, SLA escalation & multi-stage approvals."
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-2" },
        React.createElement(Button, {
          size: "sm",
          onClick: () => setShowTaskModal(true),
          className: "rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-md"
        }, "+ Quick Task"),
        React.createElement(Button, {
          size: "sm",
          variant: "outline",
          onClick: () => setShowReminderModal(true),
          className: "rounded-xl font-bold text-xs border-border"
        }, "+ Scheduled Reminder"),
        React.createElement(Button, {
          size: "sm",
          variant: "outline",
          onClick: () => setShowWorkflowModal(true),
          className: "rounded-xl font-bold text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        }, "+ Request Approval"),
        React.createElement(Button, {
          size: "icon",
          variant: "outline",
          onClick: loadData,
          className: "rounded-xl"
        }, "\u{1F504}")
      )
    ),
    // ── 14 Live KPI Widgets Grid ─────────────────────────────────────
    React.createElement(
      "div",
      { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" },
      // 1. My Tasks Today
      React.createElement(
        Card,
        { className: "border-l-4 border-l-blue-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground" }, "My Tasks Today"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-foreground" }, metrics.my_tasks_today),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, "Active today")
      ),
      // 2. Overdue Tasks
      React.createElement(
        Card,
        { className: "border-l-4 border-l-rose-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-rose-400" }, "Overdue Tasks"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-rose-400" }, metrics.overdue_tasks),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, "Immediate action needed")
      ),
      // 3. Upcoming Reminders
      React.createElement(
        Card,
        { className: "border-l-4 border-l-amber-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-amber-400" }, "Upcoming Reminders"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-foreground" }, metrics.upcoming_reminders),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, "Next 48 hours")
      ),
      // 4. In Progress
      React.createElement(
        Card,
        { className: "border-l-4 border-l-cyan-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground" }, "In Progress"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-foreground" }, metrics.tasks_in_progress),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, "Under active execution")
      ),
      // 5. Awaiting Approval
      React.createElement(
        Card,
        { className: "border-l-4 border-l-purple-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-purple-400" }, "Pending Approvals"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-foreground" }, metrics.tasks_awaiting_approval),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, "Requires sign-off")
      ),
      // 6. Completion Meter
      React.createElement(
        Card,
        { className: "border-l-4 border-l-emerald-500 bg-card p-4 rounded-2xl" },
        React.createElement("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-emerald-400" }, "Daily Completion"),
        React.createElement("h3", { className: "text-2xl font-black mt-1 text-emerald-400" }, `${metrics.daily_completion_percentage}%`),
        React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, `${metrics.completed_tasks} completed`)
      )
    ),
    // ── Navigation Tabs Bar ──────────────────────────────────────────
    React.createElement(
      "div",
      { className: "flex flex-wrap items-center justify-between border-b border-border/70 pb-3 gap-2" },
      React.createElement(
        "div",
        { className: "flex items-center gap-1.5" },
        [
          { id: "tasks", label: "\u{1F4CB} Task Management" },
          { id: "reminders", label: "\u{1F514} Reminders & Scheduler" },
          { id: "workflows", label: "\u2696\uFE0F Approvals & Workflows" },
          { id: "notifications", label: "\u{1F4EB} Notifications" }
        ].map(
          (tab) => React.createElement(Button, {
            key: tab.id,
            size: "sm",
            variant: activeTab === tab.id ? "default" : "ghost",
            onClick: () => setActiveTab(tab.id),
            className: cn("rounded-xl text-xs font-bold", activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground")
          }, tab.label)
        )
      ),
      activeTab === "tasks" && React.createElement(
        "div",
        { className: "flex items-center gap-1 bg-secondary/20 p-1 rounded-xl border border-border/50" },
        React.createElement(Button, {
          size: "sm",
          variant: viewMode === "list" ? "secondary" : "ghost",
          onClick: () => setViewMode("list"),
          className: "h-7 px-2.5 text-[11px] rounded-lg"
        }, "\u2630 List"),
        React.createElement(Button, {
          size: "sm",
          variant: viewMode === "kanban" ? "secondary" : "ghost",
          onClick: () => setViewMode("kanban"),
          className: "h-7 px-2.5 text-[11px] rounded-lg"
        }, "\u25A6 Kanban")
      )
    ),
    // ── TAB 1: Task Management ───────────────────────────────────────
    activeTab === "tasks" && React.createElement(
      "div",
      { className: "space-y-4" },
      // Search and Filter Bar
      React.createElement(
        "div",
        { className: "grid grid-cols-1 sm:grid-cols-4 gap-2 bg-card p-3 rounded-2xl border border-border/60" },
        React.createElement(Input, {
          placeholder: "Search tasks, records, assignees...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "h-9"
        }),
        React.createElement(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
          },
          React.createElement("option", { value: "all" }, "All Statuses"),
          React.createElement("option", { value: "NOT_STARTED" }, "Not Started"),
          React.createElement("option", { value: "IN_PROGRESS" }, "In Progress"),
          React.createElement("option", { value: "PENDING_APPROVAL" }, "Pending Approval"),
          React.createElement("option", { value: "COMPLETED" }, "Completed")
        ),
        React.createElement(
          "select",
          {
            value: deptFilter,
            onChange: (e) => setDeptFilter(e.target.value),
            className: "h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
          },
          React.createElement("option", { value: "all" }, "All Departments"),
          React.createElement("option", { value: "Operations" }, "Operations"),
          React.createElement("option", { value: "Fleet" }, "Fleet Maintenance"),
          React.createElement("option", { value: "Finance" }, "Finance & Billing"),
          React.createElement("option", { value: "Compliance" }, "Compliance & Docs")
        ),
        React.createElement(
          "select",
          {
            value: priorityFilter,
            onChange: (e) => setPriorityFilter(e.target.value),
            className: "h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
          },
          React.createElement("option", { value: "all" }, "All Priorities"),
          React.createElement("option", { value: "LOW" }, "Low"),
          React.createElement("option", { value: "MEDIUM" }, "Medium"),
          React.createElement("option", { value: "HIGH" }, "High"),
          React.createElement("option", { value: "CRITICAL" }, "Critical")
        )
      ),
      // List View
      viewMode === "list" && React.createElement(
        "div",
        { className: "space-y-2" },
        filteredTasks.length === 0 ? React.createElement(
          "div",
          { className: "py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border/50" },
          React.createElement("p", { className: "text-2xl" }, "\u{1F4DD}"),
          React.createElement("p", { className: "font-bold mt-1 text-foreground" }, "No tasks found."),
          React.createElement("p", { className: "text-xs text-muted-foreground" }, 'Create a new task with "+ Quick Task".')
        ) : filteredTasks.map(
          (t) => React.createElement(
            "div",
            {
              key: t.id,
              className: "p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm"
            },
            React.createElement(
              "div",
              { className: "space-y-1.5 flex-1" },
              React.createElement(
                "div",
                { className: "flex flex-wrap items-center gap-2" },
                React.createElement(Badge, { className: PRIORITY_COLORS[t.priority] }, t.priority),
                React.createElement(Badge, { className: STATUS_COLORS[t.status] }, t.status.replace(/_/g, " ")),
                React.createElement("span", { className: "font-mono text-[11px] text-muted-foreground" }, t.id),
                t.department && React.createElement("span", { className: "text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary/30" }, t.department)
              ),
              React.createElement("h4", {
                onClick: () => setSelectedTask(t),
                className: "text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
              }, t.title),
              React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-1" }, t.description),
              React.createElement(
                "div",
                { className: "flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground" },
                React.createElement("span", null, `\u{1F464} ${t.assigned_to_name}`),
                React.createElement("span", null, `\u{1F4C5} Due: ${formatDateTime(t.due_date)}`),
                t.related_entity_id && React.createElement("span", { className: "font-mono text-primary font-bold" }, `\u{1F517} ${t.related_entity_id}`),
                t.checklists && t.checklists.length > 0 && React.createElement(
                  "span",
                  { className: "text-emerald-400 font-bold" },
                  `\u2713 ${t.checklists.filter((c) => c.completed).length}/${t.checklists.length} Checklist`
                )
              )
            ),
            React.createElement(
              "div",
              { className: "flex items-center gap-1.5 shrink-0" },
              t.status !== "COMPLETED" && React.createElement(Button, {
                size: "sm",
                onClick: () => handleStatusChange(t.id, "COMPLETED"),
                className: "h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              }, "\u2713 Complete"),
              t.status === "COMPLETED" && React.createElement(Button, {
                size: "sm",
                variant: "outline",
                onClick: () => handleStatusChange(t.id, "IN_PROGRESS"),
                className: "h-8 px-3 rounded-xl text-xs font-bold"
              }, "Reopen"),
              React.createElement(Button, {
                size: "sm",
                variant: "outline",
                onClick: () => setSelectedTask(t),
                className: "h-8 px-3 rounded-xl text-xs font-bold"
              }, "Details \u{1F50D}")
            )
          )
        )
      ),
      // Kanban Board View
      viewMode === "kanban" && React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
        ["NOT_STARTED", "IN_PROGRESS", "PENDING_APPROVAL", "COMPLETED"].map((colStatus) => {
          const colTasks = filteredTasks.filter((t) => t.status === colStatus);
          return React.createElement(
            "div",
            {
              key: colStatus,
              className: "bg-card/50 border border-border/60 rounded-2xl p-4 flex flex-col min-h-[450px]"
            },
            React.createElement(
              "div",
              { className: "flex justify-between items-center pb-3 border-b border-border/50 mb-3" },
              React.createElement(
                "h4",
                { className: "text-xs font-black uppercase tracking-wider text-foreground" },
                colStatus.replace(/_/g, " ")
              ),
              React.createElement(Badge, { variant: "outline", className: "font-mono" }, colTasks.length)
            ),
            React.createElement(
              "div",
              { className: "space-y-3 flex-1 overflow-y-auto" },
              colTasks.map(
                (t) => React.createElement(
                  "div",
                  {
                    key: t.id,
                    onClick: () => setSelectedTask(t),
                    className: "p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer shadow-sm space-y-2"
                  },
                  React.createElement(
                    "div",
                    { className: "flex justify-between items-center" },
                    React.createElement(Badge, { className: PRIORITY_COLORS[t.priority] }, t.priority),
                    React.createElement("span", { className: "font-mono text-[10px] text-muted-foreground" }, t.id)
                  ),
                  React.createElement("h5", { className: "text-xs font-bold text-foreground leading-snug" }, t.title),
                  React.createElement(
                    "div",
                    { className: "text-[10px] text-muted-foreground flex justify-between" },
                    React.createElement("span", null, t.assigned_to_name),
                    React.createElement("span", null, formatDateOnly(t.due_date))
                  )
                )
              )
            )
          );
        })
      )
    ),
    // ── TAB 2: Reminders & Background Scheduler ─────────────────────
    activeTab === "reminders" && React.createElement(
      "div",
      { className: "space-y-4" },
      React.createElement(
        Card,
        { className: "rounded-2xl border-border/60" },
        React.createElement(
          CardHeader,
          { className: "border-b border-border/40" },
          React.createElement(CardTitle, null, "\u{1F514} Enterprise Background Reminder Queue"),
          React.createElement(
            CardDescription,
            null,
            "All reminders are tracked on the persistent server scheduler (ticks independently of active browser sessions)."
          )
        ),
        React.createElement(
          CardContent,
          { className: "p-5 space-y-3" },
          reminders.length === 0 ? React.createElement(
            "div",
            { className: "py-12 text-center text-muted-foreground" },
            React.createElement("p", { className: "text-2xl" }, "\u23F0"),
            React.createElement("p", { className: "font-bold mt-1 text-foreground" }, "No active reminders."),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Add reminders for vehicle inspections, tax due dates, or invoices.")
          ) : reminders.map(
            (r) => React.createElement(
              "div",
              {
                key: r.id,
                className: "p-4 rounded-2xl bg-card border border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              },
              React.createElement(
                "div",
                { className: "space-y-1" },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2" },
                  React.createElement(Badge, { className: PRIORITY_COLORS[r.priority] }, r.priority),
                  React.createElement("span", { className: "font-bold text-sm text-foreground" }, r.title),
                  r.recurrence_type !== "NONE" && React.createElement(Badge, { variant: "outline", className: "text-primary" }, `\u{1F501} ${r.recurrence_type}`)
                ),
                React.createElement("p", { className: "text-xs text-muted-foreground" }, r.notes || "No description notes provided."),
                React.createElement(
                  "div",
                  { className: "flex gap-3 text-[11px] text-muted-foreground font-mono" },
                  React.createElement("span", null, `Trigger: ${formatDateTime(r.trigger_time)}`),
                  React.createElement("span", null, `Owner: ${r.owner_name}`),
                  r.snooze_count > 0 && React.createElement("span", { className: "text-amber-400" }, `Snoozed ${r.snooze_count}x`)
                )
              ),
              React.createElement(
                "div",
                { className: "flex items-center gap-2 shrink-0" },
                r.status !== "COMPLETED" && React.createElement(Button, {
                  size: "sm",
                  onClick: () => handleCompleteReminder(r.id),
                  className: "h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                }, "\u2713 Dismiss"),
                r.status !== "COMPLETED" && React.createElement(Button, {
                  size: "sm",
                  variant: "outline",
                  onClick: () => handleSnoozeReminder(r.id, 60),
                  className: "h-8 px-3 rounded-xl text-xs"
                }, "Snooze 1h")
              )
            )
          )
        )
      )
    ),
    // ── TAB 3: Multi-Stage Approval Workflows ────────────────────────
    activeTab === "workflows" && React.createElement(
      "div",
      { className: "space-y-4" },
      React.createElement(
        Card,
        { className: "rounded-2xl border-border/60" },
        React.createElement(
          CardHeader,
          { className: "border-b border-border/40" },
          React.createElement(CardTitle, null, "\u2696\uFE0F Multi-Stage Governance & Financial Approvals"),
          React.createElement(
            CardDescription,
            null,
            "Mandatory separation of duties: requesters cannot approve their own high-value expenditures."
          )
        ),
        React.createElement(
          CardContent,
          { className: "p-5 space-y-4" },
          workflows.length === 0 ? React.createElement(
            "div",
            { className: "py-12 text-center text-muted-foreground" },
            React.createElement("p", { className: "text-2xl" }, "\u{1F4C2}"),
            React.createElement("p", { className: "font-bold mt-1 text-foreground" }, "No active approval requests."),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, 'Click "+ Request Approval" to initiate review.')
          ) : workflows.map(
            (wf) => React.createElement(
              "div",
              {
                key: wf.id,
                className: "p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3"
              },
              React.createElement(
                "div",
                { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2 flex-wrap" },
                  React.createElement(Badge, { variant: "outline", className: "font-mono" }, wf.id),
                  React.createElement("h4", { className: "font-bold text-base text-foreground" }, wf.title),
                  React.createElement(Badge, {
                    className: wf.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : wf.status === "REJECTED" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                  }, wf.status)
                ),
                wf.amount > 0 && React.createElement(
                  "span",
                  { className: "text-base font-black text-emerald-400 font-mono" },
                  `Rs. ${Number(wf.amount).toLocaleString("en-IN")}`
                )
              ),
              React.createElement("p", { className: "text-xs text-muted-foreground leading-relaxed" }, wf.description),
              React.createElement(
                "div",
                { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-secondary/15 p-3 rounded-xl font-mono text-muted-foreground" },
                React.createElement(
                  "div",
                  null,
                  React.createElement("span", { className: "text-[10px] block uppercase font-bold text-muted-foreground" }, "Requester"),
                  React.createElement("span", { className: "text-foreground" }, wf.requester_name)
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement("span", { className: "text-[10px] block uppercase font-bold text-muted-foreground" }, "Department"),
                  React.createElement("span", { className: "text-foreground" }, wf.department)
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement("span", { className: "text-[10px] block uppercase font-bold text-muted-foreground" }, "Stage"),
                  React.createElement("span", { className: "text-foreground font-bold" }, `${wf.current_stage} / ${wf.total_stages}`)
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement("span", { className: "text-[10px] block uppercase font-bold text-muted-foreground" }, "Requested At"),
                  React.createElement("span", { className: "text-foreground" }, formatDateOnly(wf.created_at))
                )
              ),
              wf.status === "PENDING" && React.createElement(
                "div",
                { className: "flex justify-end gap-2 pt-2" },
                React.createElement(Button, {
                  size: "sm",
                  onClick: () => handleWorkflowReview(wf.id, "APPROVE"),
                  className: "h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                }, "\u2713 Approve Request"),
                React.createElement(Button, {
                  size: "sm",
                  variant: "outline",
                  onClick: () => setShowRejectModal(wf.id),
                  className: "h-8 px-4 rounded-xl text-rose-400 border-rose-500/30 hover:bg-rose-500/10 font-bold text-xs"
                }, "\u2715 Reject")
              )
            )
          )
        )
      )
    ),
    // ── TAB 4: Notifications ─────────────────────────────────────────
    activeTab === "notifications" && React.createElement(
      "div",
      { className: "space-y-4" },
      React.createElement(
        Card,
        { className: "rounded-2xl border-border/60" },
        React.createElement(
          CardHeader,
          { className: "border-b border-border/40" },
          React.createElement(CardTitle, null, "\u{1F4EB} Real-Time Operational Notifications"),
          React.createElement(
            CardDescription,
            null,
            "In-app reminders, SLA breach escalations, and automated vehicle document alerts."
          )
        ),
        React.createElement(
          CardContent,
          { className: "p-5 space-y-3" },
          notifications.length === 0 ? React.createElement(
            "div",
            { className: "py-12 text-center text-muted-foreground" },
            React.createElement("p", { className: "text-2xl" }, "\u2709\uFE0F"),
            React.createElement("p", { className: "font-bold mt-1 text-foreground" }, "Inbox clean. No unread notifications.")
          ) : notifications.map(
            (n) => React.createElement(
              "div",
              {
                key: n.id,
                className: "p-3.5 rounded-2xl bg-card border border-border/60 flex justify-between items-center gap-3"
              },
              React.createElement(
                "div",
                { className: "space-y-0.5" },
                React.createElement("h5", { className: "font-bold text-xs text-foreground" }, n.payload?.title || "Notification"),
                React.createElement("p", { className: "text-xs text-muted-foreground" }, n.payload?.notes || ""),
                React.createElement("span", { className: "text-[10px] text-muted-foreground font-mono" }, formatDateTime(n.created_at))
              ),
              n.status !== "ACKNOWLEDGED" && React.createElement(Button, {
                size: "sm",
                variant: "outline",
                onClick: async () => {
                  await fetch("/api/productivity/notifications/ack", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notificationId: n.id })
                  });
                  loadData();
                },
                className: "h-7 px-2.5 text-[10px] rounded-lg"
              }, "Mark Read")
            )
          )
        )
      )
    ),
    // ── TASK DETAIL & CHECKLIST DRAWER MODAL ─────────────────────────
    selectedTask && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        },
        React.createElement(
          "div",
          { className: "p-5 border-b border-border bg-secondary/10 flex justify-between items-center" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement(Badge, { className: PRIORITY_COLORS[selectedTask.priority] }, selectedTask.priority),
              React.createElement("span", { className: "font-mono text-xs text-muted-foreground" }, selectedTask.id)
            ),
            React.createElement("h3", { className: "font-black text-lg text-foreground mt-1" }, selectedTask.title)
          ),
          React.createElement(Button, {
            size: "sm",
            variant: "ghost",
            onClick: () => setSelectedTask(null),
            className: "rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          }, "\u2715")
        ),
        React.createElement(
          "div",
          { className: "p-6 overflow-y-auto space-y-4 flex-1" },
          React.createElement(
            "div",
            null,
            React.createElement("h4", { className: "text-xs font-bold text-muted-foreground uppercase" }, "Description"),
            React.createElement("p", { className: "text-xs text-foreground mt-1 leading-relaxed" }, selectedTask.description || "No description provided.")
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-3 text-xs bg-secondary/15 p-3 rounded-2xl border border-border/50 font-mono" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase block font-bold" }, "Assigned To"),
              React.createElement("span", { className: "text-foreground" }, selectedTask.assigned_to_name)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase block font-bold" }, "Due Date"),
              React.createElement("span", { className: "text-foreground" }, formatDateTime(selectedTask.due_date))
            )
          ),
          // Checklists section
          React.createElement(
            "div",
            { className: "space-y-2 pt-2 border-t border-border/50" },
            React.createElement("h4", { className: "text-xs font-bold text-foreground uppercase tracking-wider" }, "Checklist & Subtasks"),
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              (selectedTask.checklists || []).map(
                (chk) => React.createElement(
                  "div",
                  {
                    key: chk.id,
                    onClick: () => handleToggleChecklist(chk.id),
                    className: "flex items-center gap-2 p-2 rounded-xl bg-background border border-border/60 cursor-pointer hover:bg-secondary/20 transition-colors"
                  },
                  React.createElement("input", {
                    type: "checkbox",
                    checked: !!chk.completed,
                    readOnly: true,
                    className: "rounded accent-primary cursor-pointer"
                  }),
                  React.createElement("span", {
                    className: cn("text-xs text-foreground flex-1", chk.completed && "line-through text-muted-foreground")
                  }, chk.text)
                )
              )
            ),
            React.createElement(
              "div",
              { className: "flex gap-2 pt-1" },
              React.createElement(Input, {
                placeholder: "Add new checklist item...",
                value: newChecklistText,
                onChange: (e) => setNewChecklistText(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && handleAddChecklist(),
                className: "h-8 text-xs"
              }),
              React.createElement(Button, {
                size: "sm",
                onClick: handleAddChecklist,
                className: "h-8 px-3"
              }, "Add")
            )
          )
        ),
        React.createElement(
          "div",
          { className: "p-4 border-t border-border bg-secondary/5 flex justify-end gap-2" },
          React.createElement(Button, {
            size: "sm",
            onClick: () => setSelectedTask(null),
            className: "rounded-xl font-bold px-4"
          }, "Close")
        )
      )
    ),
    // ── MODAL: Create Quick Task ─────────────────────────────────────
    showTaskModal && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
        },
        React.createElement("h3", { className: "text-lg font-black text-foreground" }, "Create Operational Task"),
        React.createElement(
          "form",
          { onSubmit: handleCreateTask, className: "space-y-3" },
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Task Title *"),
            React.createElement(Input, {
              required: true,
              placeholder: "e.g. Verify Tyre Pressure on Truck MH-04-GP-1234",
              value: taskForm.title,
              onChange: (e) => setTaskForm({ ...taskForm, title: e.target.value })
            })
          ),
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Description"),
            React.createElement("textarea", {
              rows: 2,
              placeholder: "Operational context, checklist points, instructions...",
              value: taskForm.description,
              onChange: (e) => setTaskForm({ ...taskForm, description: e.target.value }),
              className: "w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            })
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-3" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Department"),
              React.createElement(
                "select",
                {
                  value: taskForm.department,
                  onChange: (e) => setTaskForm({ ...taskForm, department: e.target.value }),
                  className: "w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground"
                },
                React.createElement("option", { value: "Operations" }, "Operations"),
                React.createElement("option", { value: "Fleet" }, "Fleet Maintenance"),
                React.createElement("option", { value: "Finance" }, "Finance & Billing"),
                React.createElement("option", { value: "Compliance" }, "Compliance & Docs")
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Priority"),
              React.createElement(
                "select",
                {
                  value: taskForm.priority,
                  onChange: (e) => setTaskForm({ ...taskForm, priority: e.target.value }),
                  className: "w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground"
                },
                React.createElement("option", { value: "LOW" }, "Low"),
                React.createElement("option", { value: "MEDIUM" }, "Medium"),
                React.createElement("option", { value: "HIGH" }, "High"),
                React.createElement("option", { value: "CRITICAL" }, "Critical")
              )
            )
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-3" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Due Date & Time *"),
              React.createElement(Input, {
                type: "datetime-local",
                required: true,
                value: taskForm.due_date,
                onChange: (e) => setTaskForm({ ...taskForm, due_date: e.target.value })
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Linked Record (Truck/LR)"),
              React.createElement(Input, {
                placeholder: "e.g. MH-04-GP-1234 or LR-2026-001",
                value: taskForm.related_entity_id,
                onChange: (e) => setTaskForm({ ...taskForm, related_entity_id: e.target.value })
              })
            )
          ),
          React.createElement(
            "div",
            { className: "flex justify-end gap-2 pt-3" },
            React.createElement(Button, {
              type: "button",
              variant: "outline",
              onClick: () => setShowTaskModal(false)
            }, "Cancel"),
            React.createElement(Button, {
              type: "submit",
              className: "bg-primary text-primary-foreground font-bold"
            }, "Create Task")
          )
        )
      )
    ),
    // ── MODAL: Create Scheduled Reminder ─────────────────────────────
    showReminderModal && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
        },
        React.createElement("h3", { className: "text-lg font-black text-foreground" }, "Schedule Background Reminder"),
        React.createElement(
          "form",
          { onSubmit: handleCreateReminder, className: "space-y-3" },
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Reminder Title *"),
            React.createElement(Input, {
              required: true,
              placeholder: "e.g. Renew Truck Insurance MH-12-RN-5678",
              value: reminderForm.title,
              onChange: (e) => setReminderForm({ ...reminderForm, title: e.target.value })
            })
          ),
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Trigger Date & Time *"),
            React.createElement(Input, {
              type: "datetime-local",
              required: true,
              value: reminderForm.trigger_time,
              onChange: (e) => setReminderForm({ ...reminderForm, trigger_time: e.target.value })
            })
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-3" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Priority"),
              React.createElement(
                "select",
                {
                  value: reminderForm.priority,
                  onChange: (e) => setReminderForm({ ...reminderForm, priority: e.target.value }),
                  className: "w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground"
                },
                React.createElement("option", { value: "LOW" }, "Low"),
                React.createElement("option", { value: "MEDIUM" }, "Medium"),
                React.createElement("option", { value: "HIGH" }, "High"),
                React.createElement("option", { value: "CRITICAL" }, "Critical")
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Recurrence Schedule"),
              React.createElement(
                "select",
                {
                  value: reminderForm.recurrence_type,
                  onChange: (e) => setReminderForm({ ...reminderForm, recurrence_type: e.target.value }),
                  className: "w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground"
                },
                React.createElement("option", { value: "NONE" }, "One-Time"),
                React.createElement("option", { value: "DAILY" }, "Daily Recurring"),
                React.createElement("option", { value: "WEEKLY" }, "Weekly Recurring"),
                React.createElement("option", { value: "MONTHLY" }, "Monthly Recurring")
              )
            )
          ),
          React.createElement(
            "div",
            { className: "flex justify-end gap-2 pt-3" },
            React.createElement(Button, {
              type: "button",
              variant: "outline",
              onClick: () => setShowReminderModal(false)
            }, "Cancel"),
            React.createElement(Button, {
              type: "submit",
              className: "bg-primary text-primary-foreground font-bold"
            }, "Schedule Reminder")
          )
        )
      )
    ),
    // ── MODAL: Request Approval Workflow ─────────────────────────────
    showWorkflowModal && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
        },
        React.createElement("h3", { className: "text-lg font-black text-foreground" }, "Initiate Approval Request"),
        React.createElement(
          "form",
          { onSubmit: handleCreateWorkflow, className: "space-y-3" },
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Request Title *"),
            React.createElement(Input, {
              required: true,
              placeholder: "e.g. Major Engine Overhaul Approval",
              value: workflowForm.title,
              onChange: (e) => setWorkflowForm({ ...workflowForm, title: e.target.value })
            })
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-3" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Workflow Type"),
              React.createElement(
                "select",
                {
                  value: workflowForm.workflow_type,
                  onChange: (e) => setWorkflowForm({ ...workflowForm, workflow_type: e.target.value }),
                  className: "w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground"
                },
                React.createElement("option", { value: "EXPENSE_RELEASE" }, "Expense Release"),
                React.createElement("option", { value: "MAINTENANCE_OVER_50K" }, "Maintenance > Rs. 50,000"),
                React.createElement("option", { value: "VEHICLE_PURCHASE" }, "Vehicle Purchase"),
                React.createElement("option", { value: "VENDOR_ONBOARDING" }, "Vendor Onboarding")
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Expenditure Amount (INR)"),
              React.createElement(Input, {
                type: "number",
                placeholder: "e.g. 75000",
                value: workflowForm.amount,
                onChange: (e) => setWorkflowForm({ ...workflowForm, amount: e.target.value })
              })
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "text-[11px] font-bold text-muted-foreground uppercase" }, "Justification & Details"),
            React.createElement("textarea", {
              rows: 2,
              placeholder: "Operational necessity, quotation details, vendor references...",
              value: workflowForm.description,
              onChange: (e) => setWorkflowForm({ ...workflowForm, description: e.target.value }),
              className: "w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            })
          ),
          React.createElement(
            "div",
            { className: "flex justify-end gap-2 pt-3" },
            React.createElement(Button, {
              type: "button",
              variant: "outline",
              onClick: () => setShowWorkflowModal(false)
            }, "Cancel"),
            React.createElement(Button, {
              type: "submit",
              className: "bg-primary text-primary-foreground font-bold"
            }, "Submit Request")
          )
        )
      )
    ),
    // ── MODAL: Mandatory Rejection Reason ─────────────────────────────
    showRejectModal && React.createElement(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      },
      React.createElement(
        "div",
        {
          className: "bg-card border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
        },
        React.createElement("h3", { className: "text-base font-black text-rose-400" }, "Mandatory Rejection Explanation"),
        React.createElement(
          "p",
          { className: "text-xs text-muted-foreground" },
          "Compliance requires a documented reason for rejecting this workflow request."
        ),
        React.createElement("textarea", {
          rows: 3,
          required: true,
          placeholder: "Provide specific reason (e.g. budget limit exceeded, alternative vendor preferred)...",
          value: rejectionReason,
          onChange: (e) => setRejectionReason(e.target.value),
          className: "w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
        }),
        React.createElement(
          "div",
          { className: "flex justify-end gap-2 pt-2" },
          React.createElement(Button, {
            variant: "outline",
            onClick: () => {
              setShowRejectModal(null);
              setRejectionReason("");
            }
          }, "Cancel"),
          React.createElement(Button, {
            disabled: rejectionReason.trim().length < 5,
            onClick: () => handleWorkflowReview(showRejectModal, "REJECT", rejectionReason),
            className: "bg-rose-600 hover:bg-rose-500 text-white font-bold"
          }, "Confirm Rejection")
        )
      )
    )
  );
}
class ProductivityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[Productivity Error Caught]:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        {
          className: "p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-card border border-rose-500/30 rounded-3xl shadow-xl"
        },
        React.createElement("div", { className: "text-4xl" }, "\u{1F6E1}\uFE0F"),
        React.createElement("h3", { className: "text-lg font-bold text-rose-400" }, "Productivity Recovery Mode"),
        React.createElement("p", { className: "text-xs text-muted-foreground" }, this.state.error?.message || "A transient UI rendering issue occurred."),
        React.createElement("button", {
          onClick: () => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          },
          className: "px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
        }, "Reload Productivity Center")
      );
    }
    return this.props.children;
  }
}
function EnterpriseProductivityPageWrapper() {
  return React.createElement(ProductivityErrorBoundary, null, React.createElement(EnterpriseProductivityDashboard));
}
export {
  EnterpriseProductivityPageWrapper as default
};
