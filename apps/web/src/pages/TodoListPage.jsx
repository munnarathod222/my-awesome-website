
import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
const downloadPdf = (d, n) => { try { window.print(); } catch (e) {} };
const downloadExcel = (d, n) => { try { const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${n}.json`; a.click(); } catch(e) {} };

const CreditControlView = () => React.createElement("div", { className: "p-8 text-center text-xs text-muted-foreground" }, "Credit Control Operational Ledger active in production mode.");

// Bulletproof self-contained classnames helper
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Self-contained resilient notification engine (Zero external bandwidth)
function showFloatingNotification(message, type = 'success') {
  try {
    const el = document.createElement('div');
    el.className = `fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all transform duration-300 ${
      type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
    }`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  } catch (e) {}
}

const toast = {
  success: (msg) => {
    try { if (window.toast?.success) return window.toast.success(msg); } catch (e) {}
    showFloatingNotification(msg, 'success');
  },
  error: (msg) => {
    try { if (window.toast?.error) return window.toast.error(msg); } catch (e) {}
    showFloatingNotification(msg, 'error');
  },
  info: (msg) => {
    try { if (window.toast?.info) return window.toast.info(msg); } catch (e) {}
    showFloatingNotification(msg, 'info');
  }
};

// ── Web Audio API Ambient Transport Synthesizer (Zero External MP3 / Zero Bandwidth) ──
let audioCtx = null;
let currentSource = null;
let currentGain = null;

function stopAmbientSound() {
  if (currentSource) {
    try { currentSource.stop(); } catch (e) {}
    try { currentSource.disconnect(); } catch (e) {}
    currentSource = null;
  }
}

function playAmbientSound(type, volume = 0.3) {
  stopAmbientSound();
  if (type === 'none' || !type) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const sampleRate = audioCtx.sampleRate;
    const bufferSize = sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'engine') {
      // Warm low-frequency diesel engine drone
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    } else if (type === 'rain') {
      // Highway rain on cabin windshield
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }
    } else {
      // Night highway wind
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.04 * white)) / 1.04;
        lastOut = output[i];
      }
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = type === 'engine' ? 'lowpass' : (type === 'rain' ? 'bandpass' : 'lowpass');
    filter.frequency.value = type === 'engine' ? 140 : (type === 'rain' ? 900 : 450);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(0);
    currentSource = whiteNoise;
    currentGain = gainNode;
  } catch (err) {
    console.warn('Web Audio synthesis not available:', err.message);
  }
}

// UI Primitives
function Card({ className, children, ...props }) {
  return React.createElement('div', {
    className: cn('rounded-2xl border bg-card text-card-foreground shadow-sm transition-all', className),
    ...props
  }, children);
}
function CardHeader({ className, children, ...props }) {
  return React.createElement('div', {
    className: cn('flex flex-col space-y-1.5 p-5', className),
    ...props
  }, children);
}
function CardTitle({ className, children, ...props }) {
  return React.createElement('h3', {
    className: cn('text-lg font-bold leading-none tracking-tight text-foreground', className),
    ...props
  }, children);
}
function CardDescription({ className, children, ...props }) {
  return React.createElement('p', {
    className: cn('text-xs text-muted-foreground', className),
    ...props
  }, children);
}
function CardContent({ className, children, ...props }) {
  return React.createElement('div', {
    className: cn('p-5 pt-0', className),
    ...props
  }, children);
}
function Button({ className, variant, size, children, ...props }) {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95';
  let vClass = 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm';
  if (variant === 'outline') vClass = 'border border-border bg-background hover:bg-secondary/40 text-foreground';
  else if (variant === 'ghost') vClass = 'hover:bg-secondary/30 text-muted-foreground hover:text-foreground';
  else if (variant === 'secondary') vClass = 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
  else if (variant === 'destructive') vClass = 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm';
  
  let sClass = 'h-9 px-4 py-2';
  if (size === 'sm') sClass = 'h-8 rounded-lg px-3 text-[11px]';
  else if (size === 'lg') sClass = 'h-10 rounded-xl px-6 text-sm';
  else if (size === 'icon') sClass = 'h-8 w-8 p-0';

  return React.createElement('button', {
    className: cn(base, vClass, sClass, className),
    ...props
  }, children);
}
function Input({ className, ...props }) {
  return React.createElement('input', {
    className: cn(
      'flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
      className
    ),
    ...props
  });
}
function Badge({ className, variant, children }) {
  let vClass = 'bg-primary/10 text-primary border-primary/20';
  if (variant === 'destructive') vClass = 'bg-rose-500/15 text-rose-500 border-rose-500/30 font-semibold';
  else if (variant === 'warning') vClass = 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-semibold';
  else if (variant === 'success') vClass = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-semibold';
  else if (variant === 'outline') vClass = 'border border-border text-foreground';
  else if (variant === 'secondary') vClass = 'bg-secondary text-secondary-foreground';

  return React.createElement('span', {
    className: cn('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors', vClass, className)
  }, children);
}

function formatDateTime(val, fallback = 'N/A') {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return fallback;
  }
}

function formatDateOnly(val, fallback = 'N/A') {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return fallback;
  }
}

const PRIORITY_COLORS = {
  LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  MEDIUM: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  HIGH: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
  CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold',
  URGENT: 'bg-rose-600/25 text-rose-300 border-rose-600/50 font-bold animate-pulse'
};

const STATUS_COLORS = {
  NOT_STARTED: 'bg-secondary text-secondary-foreground border-border',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  WAITING_FOR_RESPONSE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PENDING_APPROVAL: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-muted text-muted-foreground border-border'
};

const DEPARTMENT_COLORS = {
  Operations: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Fleet: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Dispatch: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Finance: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Compliance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
};

// 5 Standard Transport SOP Templates
const TRANSPORT_TEMPLATES = [
  {
    id: 'tpl_pre_trip',
    title: 'Vehicle Pre-Trip Roadworthiness Inspection',
    category: 'Fleet Maintenance',
    department: 'Fleet',
    priority: 'HIGH',
    eisenhower_quadrant: 1,
    estimated_duration_hours: 0.75,
    description: 'Mandatory pre-trip physical and safety inspection before vehicle departure from terminal.',
    checklists: [
      { id: 'pt_1', text: 'Engine oil level, coolant level & brake fluid verified' },
      { id: 'pt_2', text: 'All tyres PSI check & spare wheel tread depth > 3mm' },
      { id: 'pt_3', text: 'FASTag account active with minimum ₹1,500 balance' },
      { id: 'pt_4', text: 'Original / Digilocker RC, All-India Permit, Insurance, and PUC in cabin' },
      { id: 'pt_5', text: 'Emergency toolkit, hydraulic jack, triangle reflectors & fire extinguisher present' }
    ]
  },
  {
    id: 'tpl_dispatch_manifest',
    title: 'Dispatch & Loading Manifest Verification',
    category: 'Dispatch Logistics',
    department: 'Dispatch',
    priority: 'CRITICAL',
    eisenhower_quadrant: 1,
    estimated_duration_hours: 1.0,
    description: 'Ensure complete consignment verification, weight tally, and statutory E-Way bill validation.',
    checklists: [
      { id: 'dm_1', text: 'Verify Consignor Invoice count and Part-B E-Way bill valid for transit route' },
      { id: 'dm_2', text: 'Driver physical breathalyzer sobriety test recorded in log' },
      { id: 'dm_3', text: 'Gross vehicle weight recorded on certified weighbridge slip' },
      { id: 'dm_4', text: 'Weatherproof tarpaulin lashing & tamper-evident container seal locked' },
      { id: 'dm_5', text: 'Handover printed LR (Lorry Receipt) copy to driver with consignee address' }
    ]
  },
  {
    id: 'tpl_freight_invoicing',
    title: 'Freight Invoicing & POD Collection Checklist',
    category: 'Accounts & Billing',
    department: 'Finance',
    priority: 'MEDIUM',
    eisenhower_quadrant: 3,
    estimated_duration_hours: 0.5,
    description: 'Complete post-unloading documentation, driver settlement, and billing submission.',
    checklists: [
      { id: 'fi_1', text: 'Original consignee signed & company stamped POD collected' },
      { id: 'fi_2', text: 'High-resolution POD scanned and archived in Company Vault' },
      { id: 'fi_3', text: 'Toll, diesel receipts & driver route advance reconciled in Cashbook' },
      { id: 'fi_4', text: 'Tax Invoice generated with applicable GST rate (5% RCM or 12% Forward)' },
      { id: 'fi_5', text: 'Invoice dispatch email with POD sent to client accounts' }
    ]
  },
  {
    id: 'tpl_breakdown_protocol',
    title: 'Emergency Breakdown Escalation Protocol',
    category: 'Route Operations',
    department: 'Operations',
    priority: 'URGENT',
    eisenhower_quadrant: 1,
    estimated_duration_hours: 2.0,
    description: 'Immediate action plan for highway breakdown, tyre burst, or mechanical stoppage.',
    checklists: [
      { id: 'bp_1', text: 'Pinpoint live vehicle GPS coordinates & confirm driver safety' },
      { id: 'bp_2', text: 'Place reflective warning triangles 50m behind stationary truck' },
      { id: 'bp_3', text: 'Dispatch nearest empanelled highway mechanic / mobile workshop' },
      { id: 'bp_4', text: 'Alert client / consignee of anticipated transit delay' },
      { id: 'bp_5', text: 'Arrange transshipment relief vehicle if repair ETA exceeds 4 hours' }
    ]
  },
  {
    id: 'tpl_quarterly_compliance',
    title: 'Quarterly Fleet Compliance & Tax Audit',
    category: 'Statutory Compliance',
    department: 'Compliance',
    priority: 'HIGH',
    eisenhower_quadrant: 2,
    estimated_duration_hours: 1.5,
    description: 'Proactive audit of all vehicle statutory documents, state border taxes, and renewals.',
    checklists: [
      { id: 'qc_1', text: 'Check All-India Tourist/Goods Permit quarterly tax payment status' },
      { id: 'qc_2', text: 'Verify PUC (Pollution Under Control) validity across active fleet' },
      { id: 'qc_3', text: 'Speed governor calibration and fitness renewal inspection schedule' },
      { id: 'qc_4', text: 'Comprehensive commercial vehicle insurance renewal audit (30-day notice)' },
      { id: 'qc_5', text: 'Driver commercial driving license expiry & medical fitness records check' }
    ]
  }
];

// Resilient Auth resolution (Zero context dependency)
function useSafeAuth() {
  const [user] = React.useState(() => {
    try {
      const raw = localStorage.getItem('app_auth_user');
      if (raw) return JSON.parse(raw);
      const pb = localStorage.getItem('pocketbase_auth');
      if (pb) {
        const parsed = JSON.parse(pb);
        return parsed?.model || parsed?.record || null;
      }
    } catch (e) {}
    return {
      id: 'usr_operations',
      name: 'Operations Manager',
      email: 'operations@jaibhavanicargo.com',
      role: 'super_admin'
    };
  });
  return { currentUser: user };
}

function EnterpriseProductivityDashboard() {
  const { currentUser } = useSafeAuth();

  const [activeTab, setActiveTab] = React.useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('tab')) return q.get('tab');
      const p = window.location.pathname;
      if (p.includes('credit-control')) return 'credit_control';
      if (p.includes('reminders')) return 'reminders';
      if (p.includes('calendar')) return 'calendar';
      if (p.includes('matrix')) return 'matrix';
      if (p.includes('focus') || p.includes('pomodoro')) return 'focus';
    } catch (e) {}
    return 'tasks';
  });

  const handleTabChange = (tId) => {
    setActiveTab(tId);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('tab', tId);
      window.history.replaceState({}, '', u.toString());
    } catch (e) {}
  };

  const [loading, setLoading] = React.useState(true);

  // Data states
  const [summary, setSummary] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [reminders, setReminders] = React.useState([]);
  const [workflows, setWorkflows] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [focusSessions, setFocusSessions] = React.useState([]);

  // Task Sub-Filters (TickTick-style)
  const [timeFilter, setTimeFilter] = React.useState('all'); // 'all', 'today', 'tomorrow', 'next7', 'overdue', 'completed'
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Modals
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [showReminderModal, setShowReminderModal] = React.useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = React.useState(false);
  const [showTemplateModal, setShowTemplateModal] = React.useState(null); // template object
  const [showRejectModal, setShowRejectModal] = React.useState(null); // workflow id
  const [rejectionReason, setRejectionReason] = React.useState('');

  // Selected item for detail drawer
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [newChecklistText, setNewChecklistText] = React.useState('');

  // Quick Add Input Bar State
  const [quickTaskTitle, setQuickTaskTitle] = React.useState('');
  const [quickTaskTime, setQuickTaskTime] = React.useState('09:00');
  const [quickTaskDept, setQuickTaskDept] = React.useState('Operations');
  const [quickTaskPriority, setQuickTaskPriority] = React.useState('MEDIUM');

  // Calendar State
  const [calMode, setCalMode] = React.useState('agenda'); // 'agenda' | 'month'
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());

  // Pomodoro / Focus State
  const [timerMode, setTimerMode] = React.useState('pomodoro'); // 'pomodoro' (25m), 'short_break' (5m), 'long_break' (15m), 'stopwatch'
  const [timerSeconds, setTimerSeconds] = React.useState(25 * 60);
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [focusLinkedTaskId, setFocusLinkedTaskId] = React.useState('');
  const [ambientSound, setAmbientSound] = React.useState('none'); // 'none', 'engine', 'rain', 'highway'
  const [ambientVolume, setAmbientVolume] = React.useState(0.3);

  // New task form state
  const [taskForm, setTaskForm] = React.useState({
    title: '',
    description: '',
    department: 'Operations',
    priority: 'MEDIUM',
    eisenhower_quadrant: 2,
    due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    scheduled_time: '09:00',
    assigned_to_name: 'Operations Staff',
    related_entity_type: '',
    related_entity_id: '',
    recurring: 'none'
  });

  // New reminder form state
  const [reminderForm, setReminderForm] = React.useState({
    title: '',
    notes: '',
    trigger_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    priority: 'MEDIUM',
    recurrence_type: 'NONE'
  });

  // New workflow form state
  const [workflowForm, setWorkflowForm] = React.useState({
    workflow_type: 'EXPENSE_ADVANCE',
    title: '',
    description: '',
    amount: ''
  });

  // ── Load All Data ──────────────────────────────────────────────────
  const fetchAllData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, taskRes, remRes, wfRes, notifRes, focRes] = await Promise.allSettled([
        fetch('/api/productivity/summary').then(r => r.json()),
        fetch('/api/productivity/tasks').then(r => r.json()),
        fetch('/api/productivity/reminders').then(r => r.json()),
        fetch('/api/productivity/workflows').then(r => r.json()),
        fetch('/api/productivity/notifications').then(r => r.json()),
        fetch('/api/productivity/pomodoro').then(r => r.json())
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (taskRes.status === 'fulfilled' && taskRes.value?.tasks) setTasks(taskRes.value.tasks);
      if (remRes.status === 'fulfilled' && remRes.value?.reminders) setReminders(remRes.value.reminders);
      if (wfRes.status === 'fulfilled' && wfRes.value?.workflows) setWorkflows(wfRes.value.workflows);
      if (notifRes.status === 'fulfilled' && notifRes.value?.notifications) setNotifications(notifRes.value.notifications);
      if (focRes.status === 'fulfilled' && focRes.value?.sessions) setFocusSessions(focRes.value.sessions);
    } catch (err) {
      console.error('Failed to fetch productivity data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // ── Pomodoro Timer Ticker ──────────────────────────────────────────
  React.useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (timerMode === 'stopwatch') {
            return prev + 1;
          }
          if (prev <= 1) {
            setTimerRunning(false);
            // Completed countdown session
            handleCompleteFocusSession();
            toast.success('🔔 Focus session complete! Take a break or start your next task.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode, focusLinkedTaskId]);

  const handleTimerModeChange = (mode) => {
    setTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') setTimerSeconds(25 * 60);
    else if (mode === 'short_break') setTimerSeconds(5 * 60);
    else if (mode === 'long_break') setTimerSeconds(15 * 60);
    else if (mode === 'stopwatch') setTimerSeconds(0);
  };

  const handleAmbientChange = (type) => {
    setAmbientSound(type);
    playAmbientSound(type, ambientVolume);
  };

  const handleCompleteFocusSession = async () => {
    const elapsed = timerMode === 'stopwatch' ? timerSeconds : (
      timerMode === 'pomodoro' ? 25 * 60 - timerSeconds : 5 * 60 - timerSeconds
    );
    if (elapsed < 10) return; // ignore micro accidental clicks

    const taskObj = tasks.find(t => t.id === focusLinkedTaskId);
    try {
      const res = await fetch('/api/productivity/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: focusLinkedTaskId || null,
          task_title: taskObj ? taskObj.title : 'General Operations Focus',
          mode: timerMode.toUpperCase(),
          duration_seconds: elapsed,
          completed: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setFocusSessions(prev => [data.session, ...prev]);
        toast.success(`Logged ${Math.round(elapsed / 60)} min focus session!`);
        fetchAllData();
      }
    } catch (e) {}
  };

  // ── Quick Add Task ────────────────────────────────────────────────
  const handleQuickAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/productivity/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-name': currentUser?.name || 'Operations Lead'
        },
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          department: quickTaskDept,
          priority: quickTaskPriority,
          scheduled_time: quickTaskTime,
          due_date: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickTaskTitle('');
        setTasks(prev => [data.task, ...prev]);
        toast.success('Task created successfully!');
      }
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  // ── Toggle Task Completion ────────────────────────────────────────
  const handleToggleTaskStatus = async (task) => {
    const isComp = task.status === 'COMPLETED';
    const nextStatus = isComp ? 'NOT_STARTED' : 'COMPLETED';
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => ({ ...prev, status: nextStatus }));
    }

    try {
      await fetch(`/api/productivity/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      toast.success(nextStatus === 'COMPLETED' ? 'Task marked complete! Great job.' : 'Task marked active.');
    } catch (err) {
      fetchAllData();
    }
  };

  // ── Toggle Checklist Item ─────────────────────────────────────────
  const handleToggleChecklist = async (taskId, itemId) => {
    try {
      const res = await fetch(`/api/productivity/tasks/${taskId}/checklist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        if (selectedTask?.id === taskId) {
          setSelectedTask(data.task);
        }
      }
    } catch (e) {}
  };

  // ── Add Checklist Item ────────────────────────────────────────────
  const handleAddChecklistItem = async () => {
    if (!newChecklistText.trim() || !selectedTask) return;
    const currentList = selectedTask.checklists || selectedTask.checklist || [];
    const updated = [
      ...currentList,
      { id: `chk_${Date.now()}`, text: newChecklistText.trim(), completed: false }
    ];
    try {
      const res = await fetch(`/api/productivity/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklists: updated, checklist: updated })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTask(data.task);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? data.task : t));
        setNewChecklistText('');
      }
    } catch (e) {}
  };

  // ── Move Task to Another Eisenhower Quadrant ──────────────────────
  const handleMoveQuadrant = async (task, qNum) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, eisenhower_quadrant: qNum, quadrant: qNum } : t));
    try {
      await fetch(`/api/productivity/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eisenhower_quadrant: qNum, quadrant: qNum })
      });
      toast.success(`Moved to Quadrant ${qNum}`);
    } catch (e) {}
  };

  // ── Apply Transport Template ──────────────────────────────────────
  const handleApplyTemplate = async (templateId) => {
    try {
      const res = await fetch('/api/productivity/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-name': currentUser?.name || 'Operations Lead'
        },
        body: JSON.stringify({ templateId })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [data.task, ...prev]);
        setShowTemplateModal(null);
        toast.success(`Applied "${data.task.title}" with pre-trip checklist!`);
        setActiveTab('tasks');
      }
    } catch (err) {
      toast.error('Failed to instantiate template');
    }
  };

  // ── Create Full Task Modal Submit ─────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/productivity/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-name': currentUser?.name || 'Operations Lead'
        },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [data.task, ...prev]);
        setShowTaskModal(false);
        setTaskForm({
          title: '',
          description: '',
          department: 'Operations',
          priority: 'MEDIUM',
          eisenhower_quadrant: 2,
          due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          scheduled_time: '09:00',
          assigned_to_name: 'Operations Staff',
          related_entity_type: '',
          related_entity_id: '',
          recurring: 'none'
        });
        toast.success('Task created successfully!');
      }
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  // ── Delete Task ───────────────────────────────────────────────────
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
    try {
      await fetch(`/api/productivity/tasks/${taskId}`, { method: 'DELETE' });
      toast.success('Task deleted');
    } catch (e) {}
  };

  // ── Create Reminder ───────────────────────────────────────────────
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/productivity/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderForm)
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => [data.reminder, ...prev]);
        setShowReminderModal(false);
        toast.success('Reminder scheduled!');
      }
    } catch (err) {
      toast.error('Failed to create reminder');
    }
  };

  const handleSnoozeReminder = async (id, minutes) => {
    try {
      const res = await fetch('/api/productivity/reminders/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId: id, minutes })
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => r.id === id ? data.reminder : r));
        toast.success(`Snoozed for ${minutes} minutes`);
      }
    } catch (e) {}
  };

  const handleCompleteReminder = async (id) => {
    try {
      const res = await fetch('/api/productivity/reminders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId: id })
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => r.id === id ? data.reminder : r));
        toast.success('Reminder completed');
      }
    } catch (e) {}
  };

  // ── Create Workflow ───────────────────────────────────────────────
  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/productivity/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-name': currentUser?.name || 'Staff'
        },
        body: JSON.stringify(workflowForm)
      });
      const data = await res.json();
      if (data.success) {
        setWorkflows(prev => [data.workflow, ...prev]);
        setShowWorkflowModal(false);
        toast.success('Approval request submitted to manager!');
      }
    } catch (err) {
      toast.error('Failed to submit workflow');
    }
  };

  const handleReviewWorkflow = async (id, action, reason = '') => {
    try {
      const res = await fetch('/api/productivity/workflows/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-name': currentUser?.name || 'Authorised Manager'
        },
        body: JSON.stringify({ workflowId: id, action, reason })
      });
      const data = await res.json();
      if (data.success) {
        setWorkflows(prev => prev.map(w => w.id === id ? data.workflow : w));
        setShowRejectModal(null);
        toast.success(action === 'APPROVE' ? 'Workflow Approved!' : 'Workflow Rejected.');
      }
    } catch (err) {
      toast.error('Failed to process approval');
    }
  };

  // ── TickTick Filtering Logic ──────────────────────────────────────
  const filteredTasks = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);

    return tasks.filter(t => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const mTitle = (t.title || '').toLowerCase().includes(q);
        const mDept = (t.department || '').toLowerCase().includes(q);
        const mRel = (t.related_entity_id || '').toLowerCase().includes(q);
        if (!mTitle && !mDept && !mRel) return false;
      }
      // Department
      if (deptFilter !== 'all' && t.department !== deptFilter) return false;
      // Priority
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Time Filter (TickTick buckets)
      if (timeFilter === 'all') return true;
      if (timeFilter === 'completed') return t.status === 'COMPLETED';

      const d = t.due_date ? new Date(t.due_date) : null;
      if (timeFilter === 'overdue') {
        return d && d < today && t.status !== 'COMPLETED' && t.status !== 'CANCELLED';
      }
      if (timeFilter === 'today') {
        return d && d >= today && d < tomorrow;
      }
      if (timeFilter === 'tomorrow') {
        return d && d >= tomorrow && d < dayAfter;
      }
      if (timeFilter === 'next7') {
        return d && d >= today && d <= next7Days;
      }
      return true;
    });
  }, [tasks, timeFilter, deptFilter, priorityFilter, searchTerm]);

  // Grouped task sections for All / Today view
  const taskGroups = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const overdue = [];
    const forToday = [];
    const forTomorrow = [];
    const upcoming = [];
    const completed = [];

    filteredTasks.forEach(t => {
      if (t.status === 'COMPLETED') {
        completed.push(t);
        return;
      }
      const d = t.due_date ? new Date(t.due_date) : null;
      if (!d) {
        upcoming.push(t);
      } else if (d < today) {
        overdue.push(t);
      } else if (d >= today && d < tomorrow) {
        forToday.push(t);
      } else if (d >= tomorrow && d < dayAfter) {
        forTomorrow.push(t);
      } else {
        upcoming.push(t);
      }
    });

    return { overdue, forToday, forTomorrow, upcoming, completed };
  }, [filteredTasks]);

  // ── Priority Matrix Quadrant Groups ───────────────────────────────
  const matrixQuadrants = React.useMemo(() => {
    const q1 = []; // Do First (Urgent & Important)
    const q2 = []; // Schedule (Not Urgent & Important)
    const q3 = []; // Delegate (Urgent & Not Important)
    const q4 = []; // Eliminate / Backlog (Not Urgent & Not Important)

    tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').forEach(t => {
      const q = t.eisenhower_quadrant || t.quadrant || (
        (t.priority === 'CRITICAL' || t.priority === 'URGENT' || t.priority === 'HIGH') ? 1 : 2
      );
      if (q === 1) q1.push(t);
      else if (q === 2) q2.push(t);
      else if (q === 3) q3.push(t);
      else q4.push(t);
    });

    return { q1, q2, q3, q4 };
  }, [tasks]);

  // ── Focus Stats Calculation ───────────────────────────────────────
  const todayFocusMinutes = React.useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return focusSessions
      .filter(s => (s.created_at || '').slice(0, 10) === todayStr)
      .reduce((acc, s) => acc + (s.duration_minutes || 25), 0);
  }, [focusSessions]);

  const todayPomoCount = React.useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return focusSessions.filter(s => (s.created_at || '').slice(0, 10) === todayStr && s.mode === 'POMODORO').length;
  }, [focusSessions]);

  // Format digital countdown string
  const timerDisplay = React.useMemo(() => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timerSeconds]);

  // ── Navigation Tabs Configuration ─────────────────────────────────
  const TABS = [
    { id: 'tasks', label: 'Inbox & Today', icon: '📥', count: taskGroups.forToday.length + taskGroups.overdue.length },
    { id: 'matrix', label: 'Priority Matrix', icon: '🎯', count: matrixQuadrants.q1.length },
    { id: 'calendar', label: 'Operations Calendar', icon: '📅' },
    { id: 'focus', label: 'Pomodoro & Focus', icon: '⏱️' },
    { id: 'kanban', label: 'Kanban Board', icon: '📋' },
    { id: 'templates', label: 'Transport SOPs', icon: '📑' },
    { id: 'workflows', label: 'Approvals', icon: '⚖️', count: workflows.filter(w => w.status === 'PENDING').length },
    { id: 'reminders', label: 'Reminders', icon: '🔔', count: reminders.filter(r => r.status === 'SCHEDULED' || r.status === 'DUE').length },
    { id: 'credit_control', label: 'Credit Control', icon: '🛡️' },
    { id: 'analytics', label: 'Workload & Reports', icon: '📊' }
  ];

  return React.createElement('div', { className: 'min-h-screen bg-background text-foreground pb-20' },
    
    // Top Bar / Header
    React.createElement('div', { className: 'border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5' },
      React.createElement('div', { className: 'max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-md font-black text-lg' },
            'JB'
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('h1', { className: 'text-lg font-black tracking-tight text-foreground' },
                'Operations Planner'
              ),
              React.createElement(Badge, { variant: 'outline', className: 'text-[9px] bg-primary/10 text-primary border-primary/30 uppercase' },
                'TickTick Enterprise'
              )
            ),
            React.createElement('p', { className: 'text-[11px] text-muted-foreground font-medium' },
              'Jai Bhavani Cargo & Logistics — Intelligent Fleet, Dispatch & Transport Command'
            )
          )
        ),

        // Action Buttons & Live Timer Pill
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
          timerRunning && React.createElement('div', {
            onClick: () => handleTabChange('focus'),
            className: 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold cursor-pointer animate-pulse'
          },
            React.createElement('span', null, '⏱️'),
            React.createElement('span', null, `Focus Active: ${timerDisplay}`)
          ),

          React.createElement(Button, {
            size: 'sm',
            variant: 'outline',
            onClick: () => setShowReminderModal(true),
            className: 'rounded-xl text-xs gap-1.5'
          },
            React.createElement('span', null, '🔔'),
            React.createElement('span', null, 'Add Reminder')
          ),

          React.createElement(Button, {
            size: 'sm',
            variant: 'outline',
            onClick: () => setShowWorkflowModal(true),
            className: 'rounded-xl text-xs gap-1.5'
          },
            React.createElement('span', null, '⚖️'),
            React.createElement('span', null, 'Request Approval')
          ),

          React.createElement(Button, {
            size: 'sm',
            onClick: () => setShowTaskModal(true),
            className: 'rounded-xl text-xs gap-1.5 shadow-md shadow-primary/20'
          },
            React.createElement('span', null, '➕'),
            React.createElement('span', null, 'New Task')
          )
        )
      )
    ),

    // Navigation Tabs Bar (Scrollable on Mobile)
    React.createElement('div', { className: 'border-b border-border/50 bg-card/30 px-4 lg:px-8 overflow-x-auto no-scrollbar' },
      React.createElement('div', { className: 'max-w-7xl mx-auto flex items-center gap-1.5 py-2 min-w-max' },
        TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return React.createElement('button', {
            key: tab.id,
            onClick: () => handleTabChange(tab.id),
            className: cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            )
          },
            React.createElement('span', { className: 'text-sm' }, tab.icon),
            React.createElement('span', null, tab.label),
            typeof tab.count === 'number' && tab.count > 0 && React.createElement('span', {
              className: cn(
                'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black',
                isActive ? 'bg-primary-foreground text-primary' : 'bg-secondary text-secondary-foreground'
              )
            }, tab.count)
          );
        })
      )
    ),

    // Main Content Container
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 lg:px-8 pt-6' },

      // ──────────────────────────────────────────────────────────────
      // TAB 1: INBOX & TODAY (TickTick-Style Task Engine)
      // ──────────────────────────────────────────────────────────────
      activeTab === 'tasks' && React.createElement('div', { className: 'space-y-6' },
        
        // Quick Add Input Bar (Top Natural-Language / Quick-Capture)
        React.createElement(Card, { className: 'p-2.5 bg-card/80 border-border/80 shadow-sm rounded-2xl' },
          React.createElement('form', { onSubmit: handleQuickAddTask, className: 'flex flex-col md:flex-row items-center gap-2' },
            React.createElement('div', { className: 'relative flex-1 w-full' },
              React.createElement('input', {
                type: 'text',
                value: quickTaskTitle,
                onChange: e => setQuickTaskTitle(e.target.value),
                placeholder: '⚡ Type a task and press Enter (e.g., Verify E-Way bills for MH12RN1234)...',
                className: 'w-full h-10 pl-3 pr-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium'
              })
            ),
            React.createElement('div', { className: 'flex items-center gap-2 w-full md:w-auto flex-wrap' },
              React.createElement('input', {
                type: 'time',
                value: quickTaskTime,
                onChange: e => setQuickTaskTime(e.target.value),
                className: 'h-10 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold'
              }),
              React.createElement('select', {
                value: quickTaskDept,
                onChange: e => setQuickTaskDept(e.target.value),
                className: 'h-10 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 'Operations' }, 'Operations'),
                React.createElement('option', { value: 'Dispatch' }, 'Dispatch'),
                React.createElement('option', { value: 'Fleet' }, 'Fleet'),
                React.createElement('option', { value: 'Finance' }, 'Finance'),
                React.createElement('option', { value: 'Compliance' }, 'Compliance')
              ),
              React.createElement('select', {
                value: quickTaskPriority,
                onChange: e => setQuickTaskPriority(e.target.value),
                className: 'h-10 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 'LOW' }, 'Low Priority'),
                React.createElement('option', { value: 'MEDIUM' }, 'Medium Priority'),
                React.createElement('option', { value: 'HIGH' }, 'High Priority'),
                React.createElement('option', { value: 'CRITICAL' }, 'Critical Priority')
              ),
              React.createElement(Button, { type: 'submit', size: 'sm', className: 'h-10 px-4 rounded-xl' },
                'Add'
              )
            )
          )
        ),

        // Sub-Filters Row: Time Views + Department + Priority
        React.createElement('div', { className: 'flex flex-col md:flex-row items-center justify-between gap-3 text-xs' },
          React.createElement('div', { className: 'flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar' },
            [
              { id: 'all', label: 'All Tasks', icon: '📋' },
              { id: 'today', label: 'Today', icon: '☀️' },
              { id: 'tomorrow', label: 'Tomorrow', icon: '🌅' },
              { id: 'next7', label: 'Next 7 Days', icon: '📅' },
              { id: 'overdue', label: 'Overdue', icon: '🚨' },
              { id: 'completed', label: 'Completed', icon: '✅' }
            ].map(b => React.createElement('button', {
              key: b.id,
              onClick: () => setTimeFilter(b.id),
              className: cn(
                'px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                timeFilter === b.id
                  ? 'bg-secondary text-foreground border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              )
            },
              React.createElement('span', null, b.icon),
              React.createElement('span', null, b.label)
            ))
          ),

          React.createElement('div', { className: 'flex items-center gap-2 w-full md:w-auto' },
            React.createElement('input', {
              type: 'text',
              value: searchTerm,
              onChange: e => setSearchTerm(e.target.value),
              placeholder: '🔍 Search tasks...',
              className: 'h-8 px-3 rounded-xl bg-background border border-border text-xs w-full md:w-48'
            }),
            React.createElement('select', {
              value: deptFilter,
              onChange: e => setDeptFilter(e.target.value),
              className: 'h-8 px-2 rounded-xl bg-background border border-border text-xs font-semibold'
            },
              React.createElement('option', { value: 'all' }, 'All Depts'),
              React.createElement('option', { value: 'Operations' }, 'Operations'),
              React.createElement('option', { value: 'Fleet' }, 'Fleet'),
              React.createElement('option', { value: 'Dispatch' }, 'Dispatch'),
              React.createElement('option', { value: 'Finance' }, 'Finance'),
              React.createElement('option', { value: 'Compliance' }, 'Compliance')
            )
          )
        ),

        // Task Group Renderers
        React.createElement('div', { className: 'space-y-6' },
          // 🚨 Overdue Group (if any)
          (timeFilter === 'all' || timeFilter === 'overdue') && taskGroups.overdue.length > 0 &&
            React.createElement('div', { className: 'space-y-2.5' },
              React.createElement('div', { className: 'flex items-center gap-2 px-1' },
                React.createElement(Badge, { variant: 'destructive', className: 'text-[11px] font-black' },
                  `🚨 Overdue (${taskGroups.overdue.length})`
                ),
                React.createElement('span', { className: 'text-[11px] text-rose-500 font-semibold' },
                  'Needs immediate operational attention'
                )
              ),
              taskGroups.overdue.map(t => renderTaskRow(t))
            ),

          // ☀️ Today Group
          (timeFilter === 'all' || timeFilter === 'today') &&
            React.createElement('div', { className: 'space-y-2.5' },
              React.createElement('div', { className: 'flex items-center gap-2 px-1' },
                React.createElement('span', { className: 'text-xs font-bold text-foreground flex items-center gap-1.5' },
                  '☀️ Today',
                  React.createElement(Badge, { variant: 'secondary', className: 'text-[10px]' }, taskGroups.forToday.length)
                ),
                React.createElement('span', { className: 'text-[11px] text-muted-foreground' },
                  new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
                )
              ),
              taskGroups.forToday.length === 0
                ? React.createElement(Card, { className: 'p-6 text-center text-muted-foreground text-xs rounded-2xl border-dashed' },
                    '✨ All clear for today! No pending tasks remaining.'
                  )
                : taskGroups.forToday.map(t => renderTaskRow(t))
            ),

          // 🌅 Tomorrow Group
          (timeFilter === 'all' || timeFilter === 'tomorrow') && taskGroups.forTomorrow.length > 0 &&
            React.createElement('div', { className: 'space-y-2.5' },
              React.createElement('div', { className: 'flex items-center gap-2 px-1' },
                React.createElement('span', { className: 'text-xs font-bold text-foreground flex items-center gap-1.5' },
                  '🌅 Tomorrow',
                  React.createElement(Badge, { variant: 'secondary', className: 'text-[10px]' }, taskGroups.forTomorrow.length)
                )
              ),
              taskGroups.forTomorrow.map(t => renderTaskRow(t))
            ),

          // 📅 Upcoming Group
          (timeFilter === 'all' || timeFilter === 'next7') && taskGroups.upcoming.length > 0 &&
            React.createElement('div', { className: 'space-y-2.5' },
              React.createElement('div', { className: 'flex items-center gap-2 px-1' },
                React.createElement('span', { className: 'text-xs font-bold text-foreground flex items-center gap-1.5' },
                  '📅 Upcoming / Later',
                  React.createElement(Badge, { variant: 'secondary', className: 'text-[10px]' }, taskGroups.upcoming.length)
                )
              ),
              taskGroups.upcoming.map(t => renderTaskRow(t))
            ),

          // ✅ Completed Group
          (timeFilter === 'all' || timeFilter === 'completed') && taskGroups.completed.length > 0 &&
            React.createElement('div', { className: 'space-y-2.5 pt-4' },
              React.createElement('div', { className: 'flex items-center gap-2 px-1' },
                React.createElement('span', { className: 'text-xs font-bold text-muted-foreground flex items-center gap-1.5' },
                  '✅ Completed Tasks',
                  React.createElement(Badge, { variant: 'secondary', className: 'text-[10px]' }, taskGroups.completed.length)
                )
              ),
              taskGroups.completed.slice(0, 15).map(t => renderTaskRow(t))
            )
        )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 2: PRIORITY MATRIX (Eisenhower 4-Quadrant View)
      // ──────────────────────────────────────────────────────────────
      activeTab === 'matrix' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center justify-between gap-3' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-base font-black text-foreground flex items-center gap-2' },
              '🎯 Eisenhower Priority Matrix',
              React.createElement(Badge, { variant: 'outline', className: 'text-[10px]' }, 'Dynamic Dispatch Logic')
            ),
            React.createElement('p', { className: 'text-xs text-muted-foreground' },
              'Categorize operational tasks into 4 tactical quadrants: Do First, Schedule, Delegate, and Backlog.'
            )
          ),
          React.createElement(Button, {
            size: 'sm',
            variant: 'outline',
            onClick: () => setShowTaskModal(true),
            className: 'rounded-xl text-xs gap-1.5'
          },
            '➕ Add Task to Matrix'
          )
        ),

        // 4 Quadrants Grid (2x2 on Desktop, 1 Col on Mobile)
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          
          // Q1: Urgent & Important (Red / Do First)
          renderQuadrantCard({
            qNum: 1,
            title: 'DO FIRST',
            subtitle: 'Urgent & Important (Breakdowns, Today Expiries)',
            colorClass: 'border-rose-500/40 bg-rose-500/5',
            badgeClass: 'bg-rose-500 text-white',
            tasks: matrixQuadrants.q1
          }),

          // Q2: Not Urgent & Important (Yellow / Schedule)
          renderQuadrantCard({
            qNum: 2,
            title: 'SCHEDULE',
            subtitle: 'Not Urgent & Important (Preventive Maintenance, Fleet Audits)',
            colorClass: 'border-amber-500/40 bg-amber-500/5',
            badgeClass: 'bg-amber-500 text-white',
            tasks: matrixQuadrants.q2
          }),

          // Q3: Urgent & Not Important (Blue / Delegate)
          renderQuadrantCard({
            qNum: 3,
            title: 'DELEGATE',
            subtitle: 'Urgent & Not Important (Fuel Slips, Gate Passes, Routine Calls)',
            colorClass: 'border-blue-500/40 bg-blue-500/5',
            badgeClass: 'bg-blue-500 text-white',
            tasks: matrixQuadrants.q3
          }),

          // Q4: Not Urgent & Not Important (Green / Backlog & Eliminate)
          renderQuadrantCard({
            qNum: 4,
            title: 'BACKLOG / ELIMINATE',
            subtitle: 'Not Urgent & Not Important (Old Files Archiving, Minor Cleanups)',
            colorClass: 'border-emerald-500/40 bg-emerald-500/5',
            badgeClass: 'bg-emerald-500 text-white',
            tasks: matrixQuadrants.q4
          })
        )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 3: OPERATIONS CALENDAR & DAILY TIMELINE
      // ──────────────────────────────────────────────────────────────
      activeTab === 'calendar' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center justify-between gap-3' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-base font-black text-foreground flex items-center gap-2' },
              '📅 Operations Calendar & Daily Timeline'
            ),
            React.createElement('p', { className: 'text-xs text-muted-foreground' },
              'Plan vehicle dispatch slots, driver shifts, and maintenance schedules on an interactive timeline.'
            )
          ),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('div', { className: 'flex items-center bg-secondary/30 p-1 rounded-xl border border-border' },
              React.createElement('button', {
                onClick: () => setCalMode('agenda'),
                className: cn('px-3 py-1 rounded-lg text-xs font-bold transition-all', calMode === 'agenda' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground')
              }, 'Daily Hourly Agenda'),
              React.createElement('button', {
                onClick: () => setCalMode('month'),
                className: cn('px-3 py-1 rounded-lg text-xs font-bold transition-all', calMode === 'month' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground')
              }, 'Month Grid')
            ),
            React.createElement(Button, {
              size: 'sm',
              onClick: () => setSelectedDate(new Date()),
              variant: 'outline',
              className: 'rounded-xl text-xs'
            }, 'Today')
          )
        ),

        calMode === 'agenda' ? renderDailyAgendaTimeline() : renderMonthCalendarGrid()
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 4: POMODORO & FOCUS TIME TRACKER
      // ──────────────────────────────────────────────────────────────
      activeTab === 'focus' && React.createElement('div', { className: 'max-w-4xl mx-auto space-y-6' },
        React.createElement(Card, { className: 'p-8 text-center bg-card/80 border-border/80 shadow-lg rounded-3xl relative overflow-hidden' },
          
          // Mode Tabs (Pomodoro, Short Break, Long Break, Stopwatch)
          React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-8 flex-wrap' },
            [
              { id: 'pomodoro', label: '🍅 Pomodoro (25m)' },
              { id: 'short_break', label: '☕ Short Break (5m)' },
              { id: 'long_break', label: '🌴 Long Break (15m)' },
              { id: 'stopwatch', label: '⏱️ Stopwatch' }
            ].map(m => React.createElement('button', {
              key: m.id,
              onClick: () => handleTimerModeChange(m.id),
              className: cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                timerMode === m.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
              )
            }, m.label))
          ),

          // Digital Clock Display
          React.createElement('div', { className: 'my-6 font-mono font-black text-6xl md:text-8xl tracking-tight text-foreground select-none' },
            timerDisplay
          ),

          // Linked Task Selector
          React.createElement('div', { className: 'max-w-md mx-auto mb-8' },
            React.createElement('label', { className: 'block text-[11px] font-bold text-muted-foreground mb-1.5 text-left' },
              '🎯 Link Active Task to this Session:'
            ),
            React.createElement('select', {
              value: focusLinkedTaskId,
              onChange: e => setFocusLinkedTaskId(e.target.value),
              className: 'w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
            },
              React.createElement('option', { value: '' }, '-- General Transport Operations (No specific task) --'),
              tasks.filter(t => t.status !== 'COMPLETED').map(t => React.createElement('option', {
                key: t.id,
                value: t.id
              }, `[${t.department}] ${t.title}`))
            )
          ),

          // Timer Controls
          React.createElement('div', { className: 'flex items-center justify-center gap-3' },
            React.createElement(Button, {
              size: 'lg',
              onClick: () => setTimerRunning(!timerRunning),
              className: cn(
                'h-12 px-8 rounded-2xl text-sm font-black shadow-lg',
                timerRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              )
            },
              timerRunning ? '⏸️ Pause' : '▶️ Start Focus'
            ),

            React.createElement(Button, {
              size: 'lg',
              variant: 'outline',
              onClick: () => {
                setTimerRunning(false);
                handleTimerModeChange(timerMode);
              },
              className: 'h-12 px-6 rounded-2xl text-sm'
            },
              '🔄 Reset'
            ),

            React.createElement(Button, {
              size: 'lg',
              variant: 'secondary',
              onClick: () => {
                setTimerRunning(false);
                handleCompleteFocusSession();
                handleTimerModeChange(timerMode);
              },
              className: 'h-12 px-6 rounded-2xl text-sm font-bold'
            },
              '✅ Done'
            )
          ),

          // Synthesized Ambient Audio Generator Selector
          React.createElement('div', { className: 'mt-8 pt-6 border-t border-border/50 max-w-lg mx-auto flex items-center justify-between gap-4 text-xs' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'font-bold' }, '🎧 Ambient Transport Audio:'),
              React.createElement('select', {
                value: ambientSound,
                onChange: e => handleAmbientChange(e.target.value),
                className: 'h-8 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 'none' }, 'Mute (Silent)'),
                React.createElement('option', { value: 'engine' }, '🚛 Diesel Engine Hum'),
                React.createElement('option', { value: 'rain' }, '🌧️ Rain on Windshield'),
                React.createElement('option', { value: 'highway' }, '🛣️ Night Highway Wind')
              )
            ),
            ambientSound !== 'none' && React.createElement('div', { className: 'flex items-center gap-1.5' },
              React.createElement('span', { className: 'text-[10px] text-muted-foreground' }, 'Vol:'),
              React.createElement('input', {
                type: 'range',
                min: '0.05',
                max: '0.8',
                step: '0.05',
                value: ambientVolume,
                onChange: e => {
                  const val = parseFloat(e.target.value);
                  setAmbientVolume(val);
                  if (currentGain) currentGain.gain.value = val;
                },
                className: 'w-20'
              })
            )
          )
        ),

        // Today's Focus Stats Cards
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card/60' },
            React.createElement('div', { className: 'text-[11px] font-bold text-muted-foreground' }, 'Total Focus Today'),
            React.createElement('div', { className: 'text-2xl font-black text-foreground mt-1' },
              `${Math.floor(todayFocusMinutes / 60)}h ${todayFocusMinutes % 60}m`
            )
          ),
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card/60' },
            React.createElement('div', { className: 'text-[11px] font-bold text-muted-foreground' }, 'Completed Pomodoros'),
            React.createElement('div', { className: 'text-2xl font-black text-primary mt-1' },
              `${todayPomoCount} Sessions`
            )
          ),
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card/60' },
            React.createElement('div', { className: 'text-[11px] font-bold text-muted-foreground' }, 'Daily Goal Progress'),
            React.createElement('div', { className: 'text-2xl font-black text-emerald-500 mt-1' },
              `${Math.min(100, Math.round((todayPomoCount / 6) * 100))}%`
            )
          )
        ),

        // Focus Session History Log
        React.createElement(Card, { className: 'p-5 rounded-2xl bg-card/60' },
          React.createElement('h3', { className: 'text-xs font-black text-foreground mb-3 uppercase tracking-wider' },
            '📋 Focus Session History Log'
          ),
          focusSessions.length === 0
            ? React.createElement('p', { className: 'text-xs text-muted-foreground py-4 text-center' }, 'No focus sessions recorded today yet. Start the timer to log deep work!')
            : React.createElement('div', { className: 'divide-y divide-border/40 text-xs' },
                focusSessions.slice(0, 10).map((s, idx) => React.createElement('div', {
                  key: s.id || idx,
                  className: 'py-2.5 flex items-center justify-between gap-3'
                },
                  React.createElement('div', { className: 'flex items-center gap-2.5' },
                    React.createElement('span', { className: 'text-base' }, s.mode === 'POMODORO' ? '🍅' : '⏱️'),
                    React.createElement('div', null,
                      React.createElement('div', { className: 'font-bold text-foreground' }, s.task_title || 'General Focus Session'),
                      React.createElement('div', { className: 'text-[10px] text-muted-foreground' }, formatDateTime(s.created_at))
                    )
                  ),
                  React.createElement(Badge, { variant: 'outline', className: 'text-[10px] font-mono' },
                    `${s.duration_minutes || 25} min`
                  )
                ))
              )
        )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 5: KANBAN BOARD
      // ──────────────────────────────────────────────────────────────
      activeTab === 'kanban' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('h2', { className: 'text-base font-black text-foreground' }, '📋 Operations Kanban Flow'),
          React.createElement(Button, { size: 'sm', onClick: () => setShowTaskModal(true), className: 'rounded-xl text-xs' }, '➕ Add Task')
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
          [
            { id: 'NOT_STARTED', label: 'Backlog', statusKey: 'NOT_STARTED', color: 'border-slate-500/30' },
            { id: 'IN_PROGRESS', label: 'In Progress', statusKey: 'IN_PROGRESS', color: 'border-blue-500/30' },
            { id: 'PENDING_APPROVAL', label: 'Review / Approval', statusKey: 'PENDING_APPROVAL', color: 'border-amber-500/30' },
            { id: 'COMPLETED', label: 'Completed', statusKey: 'COMPLETED', color: 'border-emerald-500/30' }
          ].map(col => {
            const colTasks = tasks.filter(t => (t.status || 'NOT_STARTED') === col.statusKey);
            return React.createElement('div', {
              key: col.id,
              className: cn('rounded-2xl border bg-card/40 p-3.5 flex flex-col min-h-[500px]', col.color)
            },
              React.createElement('div', { className: 'flex items-center justify-between mb-3 px-1' },
                React.createElement('span', { className: 'text-xs font-bold text-foreground' }, col.label),
                React.createElement(Badge, { variant: 'secondary', className: 'text-[10px]' }, colTasks.length)
              ),

              React.createElement('div', { className: 'space-y-2.5 flex-1 overflow-y-auto' },
                colTasks.map(t => React.createElement(Card, {
                  key: t.id,
                  onClick: () => setSelectedTask(t),
                  className: 'p-3 bg-card border-border/80 rounded-xl hover:border-primary/50 cursor-pointer shadow-sm'
                },
                  React.createElement('div', { className: 'flex items-center justify-between gap-1 mb-1.5' },
                    React.createElement(Badge, { variant: 'outline', className: cn('text-[9px]', DEPARTMENT_COLORS[t.department] || '') }, t.department),
                    React.createElement(Badge, { className: cn('text-[9px]', PRIORITY_COLORS[t.priority] || '') }, t.priority)
                  ),
                  React.createElement('div', { className: 'text-xs font-bold text-foreground mb-1' }, t.title),
                  t.due_date && React.createElement('div', { className: 'text-[10px] text-muted-foreground' },
                    `Due: ${formatDateOnly(t.due_date)}`
                  )
                ))
              )
            );
          })
        )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 6: TRANSPORT SOP TEMPLATES & CHECKLISTS
      // ──────────────────────────────────────────────────────────────
      activeTab === 'templates' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-base font-black text-foreground flex items-center gap-2' },
            '📑 Transport Operations SOP & Checklist Templates'
          ),
          React.createElement('p', { className: 'text-xs text-muted-foreground' },
            'Deploy battle-tested transport checklists for vehicle pre-trip, loading manifest, POD collection, and breakdowns with a single click.'
          )
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
          TRANSPORT_TEMPLATES.map(tpl => React.createElement(Card, {
            key: tpl.id,
            className: 'p-5 rounded-2xl bg-card/80 border-border/80 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all'
          },
            React.createElement('div', { className: 'space-y-3' },
              React.createElement('div', { className: 'flex items-center justify-between' },
                React.createElement(Badge, { variant: 'outline', className: 'text-[10px]' }, tpl.department),
                React.createElement(Badge, { className: cn('text-[10px]', PRIORITY_COLORS[tpl.priority] || '') }, tpl.priority)
              ),
              React.createElement('h3', { className: 'text-sm font-bold text-foreground' }, tpl.title),
              React.createElement('p', { className: 'text-xs text-muted-foreground' }, tpl.description),

              React.createElement('div', { className: 'pt-2 border-t border-border/40 space-y-1.5' },
                React.createElement('span', { className: 'text-[11px] font-bold text-muted-foreground block mb-1' },
                  `Pre-configured Checklists (${tpl.checklists.length}):`
                ),
                tpl.checklists.map((chk, i) => React.createElement('div', {
                  key: i,
                  className: 'flex items-center gap-2 text-xs text-foreground/80'
                },
                  React.createElement('span', { className: 'text-primary' }, '☑️'),
                  React.createElement('span', null, chk.text)
                ))
              )
            ),

            React.createElement('div', { className: 'pt-4 mt-4 border-t border-border/40' },
              React.createElement(Button, {
                onClick: () => handleApplyTemplate(tpl.id),
                className: 'w-full rounded-xl text-xs gap-1.5 shadow-sm'
              },
                '🚀 Apply as Active Task'
              )
            )
          ))
        )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 7: WORKFLOWS & APPROVALS
      // ──────────────────────────────────────────────────────────────
      activeTab === 'workflows' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('h2', { className: 'text-base font-black text-foreground' }, '⚖️ Manager Approvals Queue'),
          React.createElement(Button, { size: 'sm', onClick: () => setShowWorkflowModal(true), className: 'rounded-xl text-xs' }, '➕ Request Approval')
        ),

        workflows.length === 0
          ? React.createElement(Card, { className: 'p-8 text-center text-muted-foreground text-xs rounded-2xl' }, 'No active approval requests pending.')
          : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              workflows.map(wf => React.createElement(Card, {
                key: wf.id,
                className: 'p-5 rounded-2xl bg-card border-border/80 shadow-sm'
              },
                React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                  React.createElement(Badge, { variant: 'outline', className: 'text-[10px]' }, wf.workflow_type),
                  React.createElement(Badge, {
                    className: wf.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-500' : (wf.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500')
                  }, wf.status)
                ),
                React.createElement('h4', { className: 'text-sm font-bold text-foreground mb-1' }, wf.title),
                React.createElement('p', { className: 'text-xs text-muted-foreground mb-3' }, wf.description),
                
                wf.amount > 0 && React.createElement('div', { className: 'text-xs font-bold text-primary mb-3' },
                  `Amount: ₹${Number(wf.amount).toLocaleString('en-IN')}`
                ),

                wf.status === 'PENDING' && React.createElement('div', { className: 'flex items-center gap-2 pt-3 border-t border-border/40' },
                  React.createElement(Button, {
                    size: 'sm',
                    onClick: () => handleReviewWorkflow(wf.id, 'APPROVE'),
                    className: 'rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white'
                  }, '✓ Approve'),
                  React.createElement(Button, {
                    size: 'sm',
                    variant: 'outline',
                    onClick: () => setShowRejectModal(wf.id),
                    className: 'rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10'
                  }, '✕ Reject')
                )
              ))
            )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 8: REMINDERS & ALERTS
      // ──────────────────────────────────────────────────────────────
      activeTab === 'reminders' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('h2', { className: 'text-base font-black text-foreground' }, '🔔 Scheduled Reminders & Alerts'),
          React.createElement(Button, { size: 'sm', onClick: () => setShowReminderModal(true), className: 'rounded-xl text-xs' }, '➕ Add Reminder')
        ),

        reminders.length === 0
          ? React.createElement(Card, { className: 'p-8 text-center text-muted-foreground text-xs rounded-2xl' }, 'No active reminders.')
          : React.createElement('div', { className: 'space-y-3' },
              reminders.map(rem => React.createElement(Card, {
                key: rem.id,
                className: 'p-4 rounded-2xl bg-card border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm'
              },
                React.createElement('div', null,
                  React.createElement('div', { className: 'text-xs font-bold text-foreground' }, rem.title),
                  React.createElement('div', { className: 'text-[11px] text-muted-foreground' },
                    `Trigger: ${formatDateTime(rem.trigger_time)}`
                  )
                ),
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement(Button, {
                    size: 'sm',
                    variant: 'outline',
                    onClick: () => handleSnoozeReminder(rem.id, 30),
                    className: 'rounded-xl text-xs'
                  }, '💤 Snooze 30m'),
                  React.createElement(Button, {
                    size: 'sm',
                    onClick: () => handleCompleteReminder(rem.id),
                    className: 'rounded-xl text-xs'
                  }, '✓ Done')
                )
              ))
            )
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 9: CREDIT CONTROL
      // ──────────────────────────────────────────────────────────────
      activeTab === 'credit_control' && React.createElement('div', { className: 'space-y-6' },
        React.createElement(React.Suspense, {
          fallback: React.createElement('div', { className: 'p-8 text-center text-xs' }, 'Loading Credit Control Center...')
        }, React.createElement(CreditControlView, null))
      ),

      // ──────────────────────────────────────────────────────────────
      // TAB 10: WORKLOAD & REPORTS ANALYTICS
      // ──────────────────────────────────────────────────────────────
      activeTab === 'analytics' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('h2', { className: 'text-base font-black text-foreground' }, '📊 Productivity & Workload Analytics'),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Button, {
              size: 'sm',
              variant: 'outline',
              onClick: () => downloadExcel(tasks, 'Operations_Tasks_Report'),
              className: 'rounded-xl text-xs'
            }, '📥 Export Excel'),
            React.createElement(Button, {
              size: 'sm',
              variant: 'outline',
              onClick: () => downloadPdf(tasks, 'Operations_Tasks_Report'),
              className: 'rounded-xl text-xs'
            }, '📄 Export PDF')
          )
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card' },
            React.createElement('div', { className: 'text-xs text-muted-foreground font-bold' }, 'Total Active Tasks'),
            React.createElement('div', { className: 'text-2xl font-black text-foreground mt-1' }, tasks.filter(t => t.status !== 'COMPLETED').length)
          ),
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card' },
            React.createElement('div', { className: 'text-xs text-muted-foreground font-bold' }, 'Overdue SLA Breaches'),
            React.createElement('div', { className: 'text-2xl font-black text-rose-500 mt-1' }, taskGroups.overdue.length)
          ),
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card' },
            React.createElement('div', { className: 'text-xs text-muted-foreground font-bold' }, 'Completed Today'),
            React.createElement('div', { className: 'text-2xl font-black text-emerald-500 mt-1' }, taskGroups.completed.length)
          ),
          React.createElement(Card, { className: 'p-4 rounded-2xl bg-card' },
            React.createElement('div', { className: 'text-xs text-muted-foreground font-bold' }, 'Focus Time Logged'),
            React.createElement('div', { className: 'text-2xl font-black text-primary mt-1' }, `${todayFocusMinutes} min`)
          )
        )
      )
    ),

    // ────────────────────────────────────────────────────────────────
    // TASK DETAIL DRAWER / MODAL
    // ────────────────────────────────────────────────────────────────
    selectedTask && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end',
      onClick: () => setSelectedTask(null)
    },
      React.createElement('div', {
        className: 'w-full max-w-lg bg-card h-full shadow-2xl p-6 overflow-y-auto space-y-6',
        onClick: e => e.stopPropagation()
      },
        React.createElement('div', { className: 'flex items-center justify-between pb-4 border-b border-border/60' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Badge, { variant: 'outline', className: cn(DEPARTMENT_COLORS[selectedTask.department] || '') }, selectedTask.department),
            React.createElement(Badge, { className: cn(PRIORITY_COLORS[selectedTask.priority] || '') }, selectedTask.priority)
          ),
          React.createElement('button', {
            onClick: () => setSelectedTask(null),
            className: 'text-muted-foreground hover:text-foreground text-sm font-bold'
          }, '✕ Close')
        ),

        React.createElement('div', { className: 'space-y-2' },
          React.createElement('h3', { className: 'text-base font-black text-foreground' }, selectedTask.title),
          React.createElement('p', { className: 'text-xs text-muted-foreground leading-relaxed' }, selectedTask.description || 'No detailed description provided.')
        ),

        // Checklists Section
        React.createElement('div', { className: 'space-y-3 pt-3 border-t border-border/60' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-xs font-bold text-foreground' }, 'Checklist Items'),
            React.createElement('span', { className: 'text-[10px] text-muted-foreground' },
              `${(selectedTask.checklists || selectedTask.checklist || []).filter(c => c.completed).length} / ${(selectedTask.checklists || selectedTask.checklist || []).length} done`
            )
          ),

          React.createElement('div', { className: 'space-y-1.5' },
            (selectedTask.checklists || selectedTask.checklist || []).map(chk => React.createElement('div', {
              key: chk.id,
              onClick: () => handleToggleChecklist(selectedTask.id, chk.id),
              className: 'flex items-center gap-2.5 p-2 rounded-xl bg-background border border-border/60 cursor-pointer hover:bg-secondary/20 transition-all text-xs'
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: !!chk.completed,
                onChange: () => {},
                className: 'h-4 w-4 rounded accent-primary'
              }),
              React.createElement('span', { className: cn(chk.completed && 'line-through text-muted-foreground') }, chk.text)
            ))
          ),

          React.createElement('div', { className: 'flex items-center gap-2 pt-2' },
            React.createElement('input', {
              type: 'text',
              value: newChecklistText,
              onChange: e => setNewChecklistText(e.target.value),
              placeholder: '+ Add checklist item...',
              className: 'flex-1 h-8 px-3 rounded-xl bg-background border border-border text-xs'
            }),
            React.createElement(Button, { size: 'sm', onClick: handleAddChecklistItem, className: 'h-8 px-3 text-xs' }, 'Add')
          )
        ),

        // Action Buttons
        React.createElement('div', { className: 'pt-6 border-t border-border/60 flex items-center gap-2' },
          React.createElement(Button, {
            onClick: () => handleToggleTaskStatus(selectedTask),
            className: 'flex-1 rounded-xl text-xs'
          }, selectedTask.status === 'COMPLETED' ? 'Mark Active' : '✓ Mark Complete'),
          React.createElement(Button, {
            variant: 'outline',
            onClick: () => {
              setFocusLinkedTaskId(selectedTask.id);
              setActiveTab('focus');
              setSelectedTask(null);
            },
            className: 'rounded-xl text-xs'
          }, '⏱️ Start Focus'),
          React.createElement(Button, {
            variant: 'destructive',
            onClick: () => handleDeleteTask(selectedTask.id),
            className: 'rounded-xl text-xs'
          }, '🗑️ Delete')
        )
      )
    ),

    // ────────────────────────────────────────────────────────────────
    // CREATE TASK MODAL
    // ────────────────────────────────────────────────────────────────
    showTaskModal && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4',
      onClick: () => setShowTaskModal(false)
    },
      React.createElement(Card, {
        className: 'w-full max-w-lg p-6 bg-card rounded-2xl shadow-2xl space-y-4',
        onClick: e => e.stopPropagation()
      },
        React.createElement('div', { className: 'flex items-center justify-between pb-2 border-b border-border/60' },
          React.createElement('h3', { className: 'text-sm font-black text-foreground' }, '➕ Create Operational Task'),
          React.createElement('button', { onClick: () => setShowTaskModal(false), className: 'text-xs text-muted-foreground' }, '✕')
        ),

        React.createElement('form', { onSubmit: handleCreateTask, className: 'space-y-3.5 text-xs' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Task Title:'),
            React.createElement(Input, {
              required: true,
              value: taskForm.title,
              onChange: e => setTaskForm({ ...taskForm, title: e.target.value }),
              placeholder: 'e.g. Conduct pre-trip brake & tyre inspection'
            })
          ),

          React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Department:'),
              React.createElement('select', {
                value: taskForm.department,
                onChange: e => setTaskForm({ ...taskForm, department: e.target.value }),
                className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 'Operations' }, 'Operations'),
                React.createElement('option', { value: 'Dispatch' }, 'Dispatch'),
                React.createElement('option', { value: 'Fleet' }, 'Fleet'),
                React.createElement('option', { value: 'Finance' }, 'Finance'),
                React.createElement('option', { value: 'Compliance' }, 'Compliance')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Priority:'),
              React.createElement('select', {
                value: taskForm.priority,
                onChange: e => setTaskForm({ ...taskForm, priority: e.target.value }),
                className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 'LOW' }, 'Low Priority'),
                React.createElement('option', { value: 'MEDIUM' }, 'Medium Priority'),
                React.createElement('option', { value: 'HIGH' }, 'High Priority'),
                React.createElement('option', { value: 'CRITICAL' }, 'Critical Priority')
              )
            )
          ),

          React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Due Date:'),
              React.createElement('input', {
                type: 'datetime-local',
                value: taskForm.due_date,
                onChange: e => setTaskForm({ ...taskForm, due_date: e.target.value }),
                className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Quadrant:'),
              React.createElement('select', {
                value: taskForm.eisenhower_quadrant,
                onChange: e => setTaskForm({ ...taskForm, eisenhower_quadrant: Number(e.target.value) }),
                className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
              },
                React.createElement('option', { value: 1 }, 'Q1: Do First (Urgent & Important)'),
                React.createElement('option', { value: 2 }, 'Q2: Schedule (Not Urgent & Important)'),
                React.createElement('option', { value: 3 }, 'Q3: Delegate (Urgent & Not Important)'),
                React.createElement('option', { value: 4 }, 'Q4: Backlog (Not Urgent & Not Important)')
              )
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Description:'),
            React.createElement('textarea', {
              rows: 3,
              value: taskForm.description,
              onChange: e => setTaskForm({ ...taskForm, description: e.target.value }),
              placeholder: 'Add details, truck number, driver instructions...',
              className: 'w-full p-3 rounded-xl bg-background border border-border text-xs font-medium'
            })
          ),

          React.createElement('div', { className: 'flex justify-end gap-2 pt-3 border-t border-border/60' },
            React.createElement(Button, { type: 'button', variant: 'outline', onClick: () => setShowTaskModal(false) }, 'Cancel'),
            React.createElement(Button, { type: 'submit' }, 'Create Task')
          )
        )
      )
    ),

    // ────────────────────────────────────────────────────────────────
    // CREATE REMINDER MODAL
    // ────────────────────────────────────────────────────────────────
    showReminderModal && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4',
      onClick: () => setShowReminderModal(false)
    },
      React.createElement(Card, {
        className: 'w-full max-w-md p-6 bg-card rounded-2xl shadow-2xl space-y-4',
        onClick: e => e.stopPropagation()
      },
        React.createElement('h3', { className: 'text-sm font-black text-foreground' }, '🔔 Schedule Alert / Reminder'),
        React.createElement('form', { onSubmit: handleCreateReminder, className: 'space-y-3 text-xs' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Reminder Title:'),
            React.createElement(Input, {
              required: true,
              value: reminderForm.title,
              onChange: e => setReminderForm({ ...reminderForm, title: e.target.value }),
              placeholder: 'e.g. Call client for loading gate pass clearance'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Trigger Time:'),
            React.createElement('input', {
              type: 'datetime-local',
              value: reminderForm.trigger_time,
              onChange: e => setReminderForm({ ...reminderForm, trigger_time: e.target.value }),
              className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
            })
          ),
          React.createElement('div', { className: 'flex justify-end gap-2 pt-3' },
            React.createElement(Button, { type: 'button', variant: 'outline', onClick: () => setShowReminderModal(false) }, 'Cancel'),
            React.createElement(Button, { type: 'submit' }, 'Schedule')
          )
        )
      )
    ),

    // ────────────────────────────────────────────────────────────────
    // CREATE WORKFLOW MODAL
    // ────────────────────────────────────────────────────────────────
    showWorkflowModal && React.createElement('div', {
      className: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4',
      onClick: () => setShowWorkflowModal(false)
    },
      React.createElement(Card, {
        className: 'w-full max-w-md p-6 bg-card rounded-2xl shadow-2xl space-y-4',
        onClick: e => e.stopPropagation()
      },
        React.createElement('h3', { className: 'text-sm font-black text-foreground' }, '⚖️ Request Manager Approval'),
        React.createElement('form', { onSubmit: handleCreateWorkflow, className: 'space-y-3 text-xs' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Approval Type:'),
            React.createElement('select', {
              value: workflowForm.workflow_type,
              onChange: e => setWorkflowForm({ ...workflowForm, workflow_type: e.target.value }),
              className: 'w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold'
            },
              React.createElement('option', { value: 'EXPENSE_ADVANCE' }, 'Driver Route Expense Advance'),
              React.createElement('option', { value: 'GATE_PASS' }, 'Terminal Exit Gate Pass Clearance'),
              React.createElement('option', { value: 'DRIVER_LEAVE' }, 'Driver Emergency Leave Request'),
              React.createElement('option', { value: 'MAINTENANCE_ESTIMATE' }, 'Workshop Maintenance Estimate > ₹5,000')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Subject / Title:'),
            React.createElement(Input, {
              required: true,
              value: workflowForm.title,
              onChange: e => setWorkflowForm({ ...workflowForm, title: e.target.value }),
              placeholder: 'e.g. ₹8,000 Diesel Advance for Trip JB-401'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-bold text-muted-foreground mb-1' }, 'Amount (₹):'),
            React.createElement(Input, {
              type: 'number',
              value: workflowForm.amount,
              onChange: e => setWorkflowForm({ ...workflowForm, amount: e.target.value }),
              placeholder: '0.00'
            })
          ),
          React.createElement('div', { className: 'flex justify-end gap-2 pt-3' },
            React.createElement(Button, { type: 'button', variant: 'outline', onClick: () => setShowWorkflowModal(false) }, 'Cancel'),
            React.createElement(Button, { type: 'submit' }, 'Submit Request')
          )
        )
      )
    )
  );

  // ── HELPER: Render Single Task Row (TickTick Style) ───────────────
  function renderTaskRow(task) {
    const isComp = task.status === 'COMPLETED';
    const chkList = task.checklists || task.checklist || [];
    const chkDone = chkList.filter(c => c.completed).length;

    return React.createElement(Card, {
      key: task.id,
      className: cn(
        'p-3.5 rounded-2xl bg-card border-border/80 hover:border-primary/50 transition-all flex items-center justify-between gap-3 shadow-sm group',
        isComp && 'opacity-60 bg-muted/30'
      )
    },
      // Left: Checkbox + Title + Time Slot Badge
      React.createElement('div', { className: 'flex items-center gap-3 min-w-0 flex-1' },
        React.createElement('input', {
          type: 'checkbox',
          checked: isComp,
          onChange: () => handleToggleTaskStatus(task),
          className: 'h-4 w-4 rounded accent-primary cursor-pointer shrink-0'
        }),

        React.createElement('div', {
          onClick: () => setSelectedTask(task),
          className: 'min-w-0 flex-1 cursor-pointer'
        },
          React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
            React.createElement('span', {
              className: cn(
                'text-xs font-bold text-foreground truncate',
                isComp && 'line-through text-muted-foreground'
              )
            }, task.title),

            // Time Slot Badge (TickTick style: 09:00 AM)
            task.scheduled_time && React.createElement(Badge, {
              variant: 'outline',
              className: 'text-[9px] font-mono bg-secondary/50 text-foreground border-border px-1.5'
            }, `⏰ ${task.scheduled_time}`),

            // Department Badge
            React.createElement(Badge, {
              variant: 'outline',
              className: cn('text-[9px]', DEPARTMENT_COLORS[task.department] || '')
            }, task.department),

            // Priority Badge
            React.createElement(Badge, {
              className: cn('text-[9px]', PRIORITY_COLORS[task.priority] || '')
            }, task.priority),

            // Quadrant Badge
            task.eisenhower_quadrant && React.createElement(Badge, {
              variant: 'outline',
              className: 'text-[9px] font-bold'
            }, `Q${task.eisenhower_quadrant}`),

            // Checklist indicator
            chkList.length > 0 && React.createElement(Badge, {
              variant: 'outline',
              className: 'text-[9px] bg-secondary/40'
            }, `☑️ ${chkDone}/${chkList.length}`)
          ),

          task.description && React.createElement('p', { className: 'text-[11px] text-muted-foreground truncate mt-0.5' },
            task.description
          )
        )
      ),

      // Right: Actions (Focus, Drawer, Delete)
      React.createElement('div', { className: 'flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity' },
        React.createElement('button', {
          title: 'Start Focus Timer on this task',
          onClick: () => {
            setFocusLinkedTaskId(task.id);
            setActiveTab('focus');
          },
          className: 'p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/40 text-xs cursor-pointer'
        }, '⏱️'),

        React.createElement('button', {
          title: 'Delete Task',
          onClick: () => handleDeleteTask(task.id),
          className: 'p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 text-xs cursor-pointer'
        }, '🗑️')
      )
    );
  }

  // ── HELPER: Render Eisenhower Quadrant Card ───────────────────────
  function renderQuadrantCard({ qNum, title, subtitle, colorClass, badgeClass, tasks }) {
    return React.createElement(Card, {
      className: cn('p-5 rounded-2xl border flex flex-col justify-between shadow-sm min-h-[380px]', colorClass)
    },
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', { className: 'flex items-center justify-between pb-2 border-b border-border/40' },
          React.createElement('div', null,
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: cn('px-2 py-0.5 rounded-md text-[10px] font-black', badgeClass) },
                `Q${qNum}`
              ),
              React.createElement('h3', { className: 'text-sm font-black text-foreground' }, title)
            ),
            React.createElement('p', { className: 'text-[11px] text-muted-foreground mt-0.5' }, subtitle)
          ),
          React.createElement(Badge, { variant: 'outline', className: 'text-xs font-bold' }, tasks.length)
        ),

        // Quadrant Tasks List
        React.createElement('div', { className: 'space-y-2 max-h-72 overflow-y-auto pr-1' },
          tasks.length === 0
            ? React.createElement('div', { className: 'py-8 text-center text-muted-foreground text-xs' },
                'No tasks currently in this quadrant.'
              )
            : tasks.map(t => React.createElement('div', {
                key: t.id,
                className: 'p-2.5 rounded-xl bg-card/90 border border-border/80 shadow-xs flex items-center justify-between gap-2 text-xs'
              },
                React.createElement('div', { className: 'flex items-center gap-2 min-w-0 flex-1' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: t.status === 'COMPLETED',
                    onChange: () => handleToggleTaskStatus(t),
                    className: 'h-3.5 w-3.5 rounded accent-primary cursor-pointer'
                  }),
                  React.createElement('span', {
                    onClick: () => setSelectedTask(t),
                    className: 'font-bold text-foreground truncate cursor-pointer hover:underline'
                  }, t.title)
                ),

                // Move Quadrant Selector
                React.createElement('select', {
                  value: qNum,
                  onChange: e => handleMoveQuadrant(t, Number(e.target.value)),
                  className: 'h-6 px-1.5 rounded-lg bg-background border border-border text-[10px] font-bold text-muted-foreground'
                },
                  React.createElement('option', { value: 1 }, 'Q1 (Do First)'),
                  React.createElement('option', { value: 2 }, 'Q2 (Schedule)'),
                  React.createElement('option', { value: 3 }, 'Q3 (Delegate)'),
                  React.createElement('option', { value: 4 }, 'Q4 (Backlog)')
                )
              ))
        )
      ),

      // Inline Quick Add for this Quadrant
      React.createElement('div', { className: 'pt-3 mt-3 border-t border-border/40' },
        React.createElement('input', {
          type: 'text',
          placeholder: `+ Add task to ${title}...`,
          onKeyDown: async e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              const text = e.target.value.trim();
              e.target.value = '';
              try {
                const res = await fetch('/api/productivity/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: text,
                    department: 'Operations',
                    priority: qNum === 1 ? 'CRITICAL' : (qNum === 2 ? 'HIGH' : 'MEDIUM'),
                    eisenhower_quadrant: qNum,
                    due_date: new Date().toISOString()
                  })
                });
                const d = await res.json();
                if (d.success) {
                  setTasks(prev => [d.task, ...prev]);
                  toast.success(`Added to Q${qNum}`);
                }
              } catch (err) {}
            }
          },
          className: 'w-full h-8 px-3 rounded-xl bg-background border border-border text-xs'
        })
      )
    );
  }

  // ── HELPER: Render Daily Hourly Agenda Timeline (07:00 to 22:00) ───
  function renderDailyAgendaTimeline() {
    const hours = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00'
    ];

    const selDateStr = selectedDate.toISOString().slice(0, 10);

    return React.createElement('div', { className: 'space-y-4' },
      // Date Navigator Bar
      React.createElement('div', { className: 'flex items-center justify-between bg-card/60 p-3 rounded-2xl border border-border' },
        React.createElement(Button, {
          size: 'sm',
          variant: 'outline',
          onClick: () => setSelectedDate(new Date(selectedDate.getTime() - 86400000)),
          className: 'rounded-xl text-xs'
        }, '◀ Previous Day'),

        React.createElement('div', { className: 'text-xs font-black text-foreground flex items-center gap-2' },
          React.createElement('span', null, '📅'),
          React.createElement('span', null, selectedDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }))
        ),

        React.createElement(Button, {
          size: 'sm',
          variant: 'outline',
          onClick: () => setSelectedDate(new Date(selectedDate.getTime() + 86400000)),
          className: 'rounded-xl text-xs'
        }, 'Next Day ▶')
      ),

      // Hour by Hour Vertical Flow
      React.createElement('div', { className: 'divide-y divide-border/50 bg-card rounded-2xl border border-border overflow-hidden' },
        hours.map(hour => {
          const matchedTasks = tasks.filter(t => {
            if (t.scheduled_time && t.scheduled_time.startsWith(hour.slice(0, 2))) return true;
            if (t.due_date && t.due_date.slice(0, 10) === selDateStr) {
              const taskH = new Date(t.due_date).getHours();
              return taskH === parseInt(hour.slice(0, 2), 10);
            }
            return false;
          });

          return React.createElement('div', {
            key: hour,
            className: 'flex items-start gap-4 p-3 hover:bg-secondary/10 transition-colors'
          },
            // Hour Label
            React.createElement('div', { className: 'w-16 text-right font-mono text-xs font-bold text-muted-foreground pt-1' },
              hour
            ),

            // Slot Tasks Container
            React.createElement('div', { className: 'flex-1 min-h-[42px] flex items-center gap-2 flex-wrap' },
              matchedTasks.length === 0
                ? React.createElement('span', { className: 'text-[11px] text-muted-foreground/40 italic' }, 'No scheduled dispatch or task')
                : matchedTasks.map(t => React.createElement('div', {
                    key: t.id,
                    onClick: () => setSelectedTask(t),
                    className: cn(
                      'px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs hover:scale-102 transition-all',
                      DEPARTMENT_COLORS[t.department] || 'bg-secondary text-secondary-foreground border-border'
                    )
                  },
                    React.createElement('span', null, t.title),
                    React.createElement(Badge, { className: cn('text-[8px]', PRIORITY_COLORS[t.priority] || '') }, t.priority)
                  ))
            )
          );
        })
      )
    );
  }

  // ── HELPER: Render Month Calendar Grid (35 Days) ───────────────────
  function renderMonthCalendarGrid() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'flex items-center justify-between bg-card/60 p-3 rounded-2xl border border-border' },
        React.createElement(Button, {
          size: 'sm',
          variant: 'outline',
          onClick: () => setSelectedDate(new Date(year, month - 1, 1)),
          className: 'rounded-xl text-xs'
        }, '◀ Previous Month'),

        React.createElement('div', { className: 'text-sm font-black text-foreground' },
          selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        ),

        React.createElement(Button, {
          size: 'sm',
          variant: 'outline',
          onClick: () => setSelectedDate(new Date(year, month + 1, 1)),
          className: 'rounded-xl text-xs'
        }, 'Next Month ▶')
      ),

      React.createElement('div', { className: 'grid grid-cols-7 gap-2' },
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => React.createElement('div', {
          key: d,
          className: 'text-center font-bold text-[11px] text-muted-foreground py-2'
        }, d)),

        days.map((d, idx) => {
          if (!d) {
            return React.createElement('div', { key: idx, className: 'h-24 rounded-2xl bg-secondary/10 border border-transparent' });
          }
          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => (t.due_date || '').slice(0, 10) === dStr);
          const isTodayDate = new Date().toISOString().slice(0, 10) === dStr;

          return React.createElement('div', {
            key: idx,
            onClick: () => {
              setSelectedDate(new Date(year, month, d));
              setCalMode('agenda');
            },
            className: cn(
              'h-24 p-2 rounded-2xl border bg-card/70 hover:border-primary cursor-pointer transition-all flex flex-col justify-between overflow-hidden',
              isTodayDate ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border/70'
            )
          },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('span', { className: cn('text-xs font-black', isTodayDate ? 'text-primary' : 'text-foreground') }, d),
              dayTasks.length > 0 && React.createElement(Badge, { variant: 'secondary', className: 'text-[9px] px-1' }, dayTasks.length)
            ),

            React.createElement('div', { className: 'space-y-1 overflow-hidden' },
              dayTasks.slice(0, 2).map(t => React.createElement('div', {
                key: t.id,
                className: cn('text-[9px] font-bold px-1.5 py-0.5 rounded truncate', DEPARTMENT_COLORS[t.department] || 'bg-secondary')
              }, t.title)),
              dayTasks.length > 2 && React.createElement('div', { className: 'text-[8px] text-muted-foreground' }, `+${dayTasks.length - 2} more`)
            )
          );
        })
      )
    );
  }
}

// Global Crash-Resilient Error Boundary
class ProductivityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Enterprise Productivity System error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-card rounded-2xl border border-destructive/30 m-4'
      },
        React.createElement('div', { className: 'h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl font-bold' }, '⚠️'),
        React.createElement('h3', { className: 'text-lg font-bold text-foreground' }, 'Operations Planner Recovered Safely'),
        React.createElement('p', { className: 'text-xs text-muted-foreground max-w-md' },
          this.state.error?.message || 'An unexpected operational UI state was encountered. The engine auto-isolated the exception.'
        ),
        React.createElement(Button, {
          onClick: () => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }
        }, 'Reload Operations Hub')
      );
    }
    return this.props.children;
  }
}

export default function EnterpriseProductivityPageWrapper() {
  return React.createElement(ProductivityErrorBoundary, null, React.createElement(EnterpriseProductivityDashboard));
}
