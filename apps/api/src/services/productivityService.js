import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as auditService from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const TASKS_FILE = path.join(DATA_DIR, 'productivity_tasks_ledger.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'productivity_reminders_ledger.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'productivity_notifications_ledger.json');
const WORKFLOWS_FILE = path.join(DATA_DIR, 'productivity_workflows_ledger.json');
const ESCALATIONS_FILE = path.join(DATA_DIR, 'productivity_escalations_ledger.json');

let tasksCache = [];
let remindersCache = [];
let notificationsCache = [];
let workflowsCache = [];
let escalationsCache = [];

function loadAll() {
  try {
    tasksCache = fs.existsSync(TASKS_FILE) ? JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8')) : [];
  } catch (e) { tasksCache = []; }

  try {
    remindersCache = fs.existsSync(REMINDERS_FILE) ? JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8')) : [];
  } catch (e) { remindersCache = []; }

  try {
    notificationsCache = fs.existsSync(NOTIFICATIONS_FILE) ? JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8')) : [];
  } catch (e) { notificationsCache = []; }

  try {
    workflowsCache = fs.existsSync(WORKFLOWS_FILE) ? JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf8')) : [];
  } catch (e) { workflowsCache = []; }

  try {
    escalationsCache = fs.existsSync(ESCALATIONS_FILE) ? JSON.parse(fs.readFileSync(ESCALATIONS_FILE, 'utf8')) : [];
  } catch (e) { escalationsCache = []; }
}

loadAll();

function saveTasks() {
  try { fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksCache, null, 2), 'utf8'); } catch (e) {}
}
function saveReminders() {
  try { fs.writeFileSync(REMINDERS_FILE, JSON.stringify(remindersCache, null, 2), 'utf8'); } catch (e) {}
}
function saveNotifications() {
  try { fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notificationsCache, null, 2), 'utf8'); } catch (e) {}
}
function saveWorkflows() {
  try { fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(workflowsCache, null, 2), 'utf8'); } catch (e) {}
}
function saveEscalations() {
  try { fs.writeFileSync(ESCALATIONS_FILE, JSON.stringify(escalationsCache, null, 2), 'utf8'); } catch (e) {}
}

function generateId(prefix = 'TSK') {
  const d = new Date();
  const year = d.getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

// ── TASK OPERATIONS ──────────────────────────────────────────────────
export function getTasks(filters = {}) {
  loadAll();
  let list = [...tasksCache];
  if (filters.status && filters.status !== 'all') {
    list = list.filter(t => t.status === filters.status);
  }
  if (filters.department && filters.department !== 'all') {
    list = list.filter(t => t.department === filters.department);
  }
  if (filters.priority && filters.priority !== 'all') {
    list = list.filter(t => t.priority === filters.priority);
  }
  if (filters.assigned_to) {
    list = list.filter(t => t.assigned_to_id === filters.assigned_to || t.assigned_to_name === filters.assigned_to);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(t => 
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.related_entity_id || '').toLowerCase().includes(q) ||
      (t.assigned_to_name || '').toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
}

export function createTask(taskData, actor = {}) {
  loadAll();
  const id = taskData.id || generateId('TSK');
  const now = new Date().toISOString();

  const task = {
    id,
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    category: taskData.category || 'General Operations',
    subcategory: taskData.subcategory || '',
    priority: taskData.priority || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL, URGENT
    status: taskData.status || 'NOT_STARTED', // NOT_STARTED, IN_PROGRESS, WAITING_FOR_RESPONSE, PENDING_APPROVAL, BLOCKED, COMPLETED, CANCELLED
    created_by_id: actor.id || taskData.created_by_id || 'usr_operations',
    created_by_name: actor.name || taskData.created_by_name || 'Operations Lead',
    assigned_to_id: taskData.assigned_to_id || actor.id || 'usr_operations',
    assigned_to_name: taskData.assigned_to_name || actor.name || 'Operations Staff',
    accountable_owner_id: taskData.accountable_owner_id || taskData.assigned_to_id || 'usr_operations',
    accountable_owner_name: taskData.accountable_owner_name || taskData.assigned_to_name || 'Operations Lead',
    department: taskData.department || 'Operations', // Fleet, Finance, Compliance, Operations, Admin
    start_date: taskData.start_date || now,
    due_date: taskData.due_date || new Date(Date.now() + 86400000).toISOString(),
    completion_date: null,
    estimated_duration_hours: Number(taskData.estimated_duration_hours) || 1.0,
    actual_duration_hours: 0.0,
    related_entity_type: taskData.related_entity_type || null, // 'TRUCK', 'DRIVER', 'TRIP', 'INVOICE', 'VENDOR', 'EXPENSE'
    related_entity_id: taskData.related_entity_id || null,
    attachments: Array.isArray(taskData.attachments) ? taskData.attachments : [],
    completion_evidence: taskData.completion_evidence || {},
    checklists: (Array.isArray(taskData.checklists) ? taskData.checklists : (Array.isArray(taskData.checklist) ? taskData.checklist : [])).map((item, idx) => ({
      id: item.id || `chk_${Date.now()}_${idx}`,
      text: item.text || item.title || String(item),
      completed: !!item.completed
    })),
    checklist: (Array.isArray(taskData.checklists) ? taskData.checklists : (Array.isArray(taskData.checklist) ? taskData.checklist : [])).map((item, idx) => ({
      id: item.id || `chk_${Date.now()}_${idx}`,
      text: item.text || item.title || String(item),
      completed: !!item.completed
    })),
    parent_task_id: taskData.parent_task_id || null,
    subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
    is_recurring: !!taskData.is_recurring,
    recurrence_rule: taskData.recurrence_rule || null,
    escalation_level: 0,
    created_at: now,
    updated_at: now
  };

  tasksCache.unshift(task);
  saveTasks();

  // Audit event
  try {
    auditService.ingestEvent({
      module: 'LOGISTICS',
      entity_type: 'TASK',
      entity_id: task.id,
      action: 'CREATE',
      outcome: 'SUCCESS',
      severity: task.priority === 'CRITICAL' || task.priority === 'URGENT' ? 'HIGH' : 'INFO',
      details: `Created task "${task.title}" assigned to ${task.assigned_to_name} (Due: ${task.due_date})`,
      new_values: task
    }, { actorId: task.created_by_id, actorRole: actor.role || 'manager' });
  } catch (e) {}

  return task;
}

export function toggleChecklistItem(taskId, itemId, actor = {}) {
  loadAll();
  const task = tasksCache.find(t => t.id === taskId);
  if (!task) return null;
  const items = task.checklists || task.checklist || [];
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.completed = !item.completed;
    task.updated_at = new Date().toISOString();
    task.checklists = items;
    task.checklist = items;
    saveTasks();
  }
  return task;
}

export function addSubtask(taskId, subtaskData, actor = {}) {
  loadAll();
  const parent = tasksCache.find(t => t.id === taskId);
  if (!parent) return null;
  const subtask = createTask({
    ...subtaskData,
    parent_task_id: taskId,
    department: subtaskData.department || parent.department,
    priority: subtaskData.priority || parent.priority
  }, actor);
  parent.subtasks = parent.subtasks || [];
  parent.subtasks.push(subtask.id);
  saveTasks();
  return subtask;
}

export function updateTask(taskId, updates, actor = {}) {
  loadAll();
  const index = tasksCache.findIndex(t => t.id === taskId);
  if (index === -1) return null;

  const prev = { ...tasksCache[index] };
  const updated = {
    ...prev,
    ...updates,
    id: taskId,
    updated_at: new Date().toISOString()
  };

  // Status transitions
  if (updates.status === 'COMPLETED' && prev.status !== 'COMPLETED') {
    updated.completion_date = new Date().toISOString();
  } else if (updates.status && updates.status !== 'COMPLETED') {
    updated.completion_date = null;
  }

  if (updates.checklists) {
    updated.checklist = updates.checklists;
  } else if (updates.checklist) {
    updated.checklists = updates.checklist;
  }

  tasksCache[index] = updated;
  saveTasks();

  // Calculate changed fields
  const changedFields = Object.keys(updates).filter(k => JSON.stringify(prev[k]) !== JSON.stringify(updates[k]));

  try {
    auditService.ingestEvent({
      module: 'LOGISTICS',
      entity_type: 'TASK',
      entity_id: taskId,
      action: updates.status === 'COMPLETED' ? 'APPROVE' : 'UPDATE',
      outcome: 'SUCCESS',
      severity: 'INFO',
      details: `Updated task ${taskId}: changed [${changedFields.join(', ')}]`,
      previous_values: prev,
      new_values: updated,
      changed_fields: changedFields
    }, { actorId: actor.id || 'usr_operations', actorRole: actor.role || 'manager' });
  } catch (e) {}

  return updated;
}

export function deleteTask(taskId, actor = {}) {
  loadAll();
  const index = tasksCache.findIndex(t => t.id === taskId);
  if (index === -1) return false;

  const prev = tasksCache[index];
  tasksCache.splice(index, 1);
  saveTasks();

  try {
    auditService.ingestEvent({
      module: 'LOGISTICS',
      entity_type: 'TASK',
      entity_id: taskId,
      action: 'DELETE',
      outcome: 'SUCCESS',
      severity: 'MEDIUM',
      details: `Deleted task "${prev.title}" (${taskId})`,
      previous_values: prev
    }, { actorId: actor.id || 'usr_operations', actorRole: actor.role || 'manager' });
  } catch (e) {}

  return true;
}

// ── REMINDER OPERATIONS ──────────────────────────────────────────────
export function getReminders(filters = {}) {
  loadAll();
  let list = [...remindersCache];
  if (filters.status && filters.status !== 'all') {
    list = list.filter(r => r.status === filters.status);
  }
  return list.sort((a, b) => new Date(a.trigger_time || 0) - new Date(b.trigger_time || 0));
}

export function createReminder(reminderData, actor = {}) {
  loadAll();
  const id = reminderData.id || generateId('REM');
  const now = new Date().toISOString();

  const reminder = {
    id,
    title: reminderData.title || 'Untitled Reminder',
    notes: reminderData.notes || '',
    trigger_time: reminderData.trigger_time || new Date(Date.now() + 3600000).toISOString(),
    timezone: reminderData.timezone || 'Asia/Kolkata',
    owner_id: actor.id || reminderData.owner_id || 'usr_operations',
    owner_name: actor.name || reminderData.owner_name || 'Operations Lead',
    owner_email: reminderData.owner_email || 'operations@jaibhavanicargo.com',
    recipient_roles: Array.isArray(reminderData.recipient_roles) ? reminderData.recipient_roles : ['operations_manager'],
    recurrence_type: reminderData.recurrence_type || 'NONE', // NONE, DAILY, WEEKLY, MONTHLY, ANNUAL, CUSTOM
    custom_cron: reminderData.custom_cron || null,
    priority: reminderData.priority || 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
    status: 'SCHEDULED', // SCHEDULED, DUE, SNOOZED, COMPLETED, DISMISSED, FAILED
    snooze_count: 0,
    snoozed_until: null,
    linked_task_id: reminderData.linked_task_id || null,
    related_entity_type: reminderData.related_entity_type || null,
    related_entity_id: reminderData.related_entity_id || null,
    delivery_channels: Array.isArray(reminderData.delivery_channels) ? reminderData.delivery_channels : ['IN_APP'],
    created_at: now,
    updated_at: now
  };

  remindersCache.unshift(reminder);
  saveReminders();

  try {
    auditService.ingestEvent({
      module: 'LOGISTICS',
      entity_type: 'REMINDER',
      entity_id: reminder.id,
      action: 'CREATE',
      outcome: 'SUCCESS',
      severity: 'INFO',
      details: `Created reminder "${reminder.title}" for ${reminder.trigger_time}`,
      new_values: reminder
    }, { actorId: reminder.owner_id, actorRole: actor.role || 'manager' });
  } catch (e) {}

  return reminder;
}

export function snoozeReminder(reminderId, minutes = 30) {
  loadAll();
  const item = remindersCache.find(r => r.id === reminderId);
  if (!item) return null;

  const newTime = new Date(Date.now() + minutes * 60000).toISOString();
  item.status = 'SNOOZED';
  item.snooze_count = (item.snooze_count || 0) + 1;
  item.snoozed_until = newTime;
  item.trigger_time = newTime;
  item.updated_at = new Date().toISOString();
  saveReminders();

  return item;
}

export function completeReminder(reminderId) {
  loadAll();
  const item = remindersCache.find(r => r.id === reminderId);
  if (!item) return null;

  item.status = 'COMPLETED';
  item.updated_at = new Date().toISOString();

  // If recurring, generate next occurrence
  if (item.recurrence_type && item.recurrence_type !== 'NONE') {
    const nextDate = new Date(item.trigger_time);
    if (item.recurrence_type === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
    else if (item.recurrence_type === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
    else if (item.recurrence_type === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (item.recurrence_type === 'ANNUAL') nextDate.setFullYear(nextDate.getFullYear() + 1);

    createReminder({
      ...item,
      id: null,
      trigger_time: nextDate.toISOString(),
      status: 'SCHEDULED',
      snooze_count: 0,
      snoozed_until: null
    });
  }

  saveReminders();
  return item;
}

// ── NOTIFICATION OPERATIONS ──────────────────────────────────────────
export function getNotifications(recipientId) {
  loadAll();
  let list = [...notificationsCache];
  if (recipientId && recipientId !== 'all') {
    list = list.filter(n => n.recipient_id === recipientId || n.recipient_id === 'all');
  }
  return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export function acknowledgeNotification(notificationId) {
  loadAll();
  const notif = notificationsCache.find(n => n.id === notificationId);
  if (notif) {
    notif.status = 'ACKNOWLEDGED';
    notif.read_at = new Date().toISOString();
    saveNotifications();
  }
  return notif;
}

// ── WORKFLOW & APPROVAL OPERATIONS ───────────────────────────────────
export function getWorkflows(filters = {}) {
  loadAll();
  let list = [...workflowsCache];
  if (filters.status && filters.status !== 'all') {
    list = list.filter(w => w.status === filters.status);
  }
  return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export function createWorkflow(wfData, actor = {}) {
  loadAll();
  const id = wfData.id || generateId('WF');
  const now = new Date().toISOString();

  const wf = {
    id,
    workflow_type: wfData.workflow_type || 'EXPENSE_RELEASE', // VEHICLE_PURCHASE, EXPENSE_RELEASE, MAINTENANCE_OVER_50K, VENDOR_ONBOARDING, RATE_REVISION
    title: wfData.title || 'Approval Request',
    description: wfData.description || '',
    requester_id: actor.id || wfData.requester_id || 'usr_staff',
    requester_name: actor.name || wfData.requester_name || 'Staff Member',
    department: wfData.department || 'Operations',
    amount: Number(wfData.amount) || 0,
    current_stage: 1,
    total_stages: wfData.total_stages || (Number(wfData.amount) > 100000 ? 2 : 1),
    status: 'PENDING',
    stages_configuration: wfData.stages_configuration || [
      { stage: 1, role: 'manager', label: 'Department Manager Review' },
      { stage: 2, role: 'super_admin', label: 'Executive Board Approval' }
    ],
    approval_history: [],
    rejection_reason: null,
    related_entity_type: wfData.related_entity_type || null,
    related_entity_id: wfData.related_entity_id || null,
    created_at: now,
    updated_at: now
  };

  workflowsCache.unshift(wf);
  saveWorkflows();

  // Create linked task
  createTask({
    title: `[APPROVAL REQUIRED] ${wf.title}`,
    description: `Review approval request: ${wf.description} (Amount: Rs. ${wf.amount})`,
    priority: wf.amount > 50000 ? 'CRITICAL' : 'HIGH',
    status: 'PENDING_APPROVAL',
    department: wf.department,
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    related_entity_type: 'WORKFLOW',
    related_entity_id: wf.id
  }, actor);

  return wf;
}

export function processApproval(workflowId, action, reason = '', actor = {}) {
  loadAll();
  const wf = workflowsCache.find(w => w.id === workflowId);
  if (!wf) return null;

  // Separation of duties enforcement: requester cannot approve their own high-value request
  if (action === 'APPROVE' && wf.requester_id === actor.id && wf.amount > 10000) {
    throw new Error('Separation of duties violation: Requesters cannot approve their own financial requests.');
  }

  const now = new Date().toISOString();

  if (action === 'REJECT') {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Mandatory rejection reason required: Must provide at least 5 characters explaining rejection.');
    }
    wf.status = 'REJECTED';
    wf.rejection_reason = reason;
    wf.approval_history.push({
      stage: wf.current_stage,
      approver_id: actor.id || 'usr_approver',
      approver_name: actor.name || 'Authorised Reviewer',
      action: 'REJECTED',
      reason,
      timestamp: now
    });
  } else if (action === 'APPROVE') {
    wf.approval_history.push({
      stage: wf.current_stage,
      approver_id: actor.id || 'usr_approver',
      approver_name: actor.name || 'Authorised Reviewer',
      action: 'APPROVED',
      notes: reason,
      timestamp: now
    });

    if (wf.current_stage < wf.total_stages) {
      wf.current_stage += 1;
    } else {
      wf.status = 'APPROVED';
    }
  }

  wf.updated_at = now;
  saveWorkflows();

  // Audit event
  try {
    auditService.ingestEvent({
      module: 'FINANCIAL',
      entity_type: 'APPROVAL_WORKFLOW',
      entity_id: wf.id,
      action: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
      outcome: 'SUCCESS',
      severity: wf.amount > 50000 ? 'HIGH' : 'MEDIUM',
      details: `${action} workflow ${wf.id} (Stage ${wf.current_stage}/${wf.total_stages}) by ${actor.name || 'Reviewer'}. Reason: ${reason || 'N/A'}`
    }, { actorId: actor.id || 'usr_operations', actorRole: actor.role || 'manager' });
  } catch (e) {}

  return wf;
}

// ── 14 LIVE COMPUTED DASHBOARD METRICS ────────────────────────────────
export function getProductivitySummary(userId) {
  loadAll();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const next48h = new Date(now.getTime() + 48 * 3600000);

  const myTasks = userId ? tasksCache.filter(t => t.assigned_to_id === userId || t.created_by_id === userId) : tasksCache;
  const activeTasks = myTasks.filter(t => t.status !== 'CANCELLED');

  const myTasksToday = activeTasks.filter(t => (t.due_date || '').startsWith(todayStr));
  const overdueTasks = activeTasks.filter(t => t.status !== 'COMPLETED' && new Date(t.due_date) < now);
  const upcomingReminders = remindersCache.filter(r => r.status === 'SCHEDULED' && new Date(r.trigger_time) <= next48h);
  const highPriority = activeTasks.filter(t => t.status !== 'COMPLETED' && (t.priority === 'HIGH' || t.priority === 'CRITICAL' || t.priority === 'URGENT'));
  const inProgress = activeTasks.filter(t => t.status === 'IN_PROGRESS');
  const awaitingApproval = activeTasks.filter(t => t.status === 'PENDING_APPROVAL');
  const awaitingExternal = activeTasks.filter(t => t.status === 'WAITING_FOR_RESPONSE');
  const completedThisWeek = activeTasks.filter(t => t.status === 'COMPLETED' && t.completion_date && (now - new Date(t.completion_date)) < 7 * 86400000);
  
  const completedTotal = activeTasks.filter(t => t.status === 'COMPLETED').length;
  const completionPercentage = activeTasks.length > 0 ? Math.round((completedTotal / activeTasks.length) * 100) : 100;

  const escalatedTasks = activeTasks.filter(t => t.escalation_level > 0);
  const pendingNotifications = notificationsCache.filter(n => n.status === 'QUEUED' || n.status === 'DELIVERED');

  return {
    success: true,
    metrics: {
      my_tasks_today: myTasksToday.length,
      overdue_tasks: overdueTasks.length,
      upcoming_reminders: upcomingReminders.length,
      high_priority_tasks: highPriority.length,
      tasks_in_progress: inProgress.length,
      tasks_awaiting_approval: awaitingApproval.length,
      tasks_awaiting_external: awaitingExternal.length,
      completed_tasks: completedTotal,
      daily_completion_percentage: completionPercentage,
      weekly_completed_count: completedThisWeek.length,
      total_active_tasks: activeTasks.length,
      escalated_tasks: escalatedTasks.length,
      pending_notifications: pendingNotifications.length,
      total_workflows_pending: workflowsCache.filter(w => w.status === 'PENDING').length
    },
    overdue_list: overdueTasks.slice(0, 5),
    upcoming_reminders_list: upcomingReminders.slice(0, 5),
    pending_approvals_list: workflowsCache.filter(w => w.status === 'PENDING').slice(0, 5),
    recent_activity: tasksCache.slice(0, 8).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      updated_at: t.updated_at,
      assigned_to: t.assigned_to_name
    }))
  };
}

// ── BACKGROUND TICK RUNNER & AUTOMATION ENGINE ────────────────────────
export function runBackgroundSchedulerTick() {
  loadAll();
  const now = new Date();
  let dispatchedCount = 0;

  // 1. Process due reminders
  remindersCache.forEach(rem => {
    if ((rem.status === 'SCHEDULED' || rem.status === 'SNOOZED') && new Date(rem.trigger_time) <= now) {
      rem.status = 'DUE';
      rem.updated_at = now.toISOString();

      // Enqueue notification job
      const notifId = generateId('NOTIF');
      notificationsCache.unshift({
        id: notifId,
        reminder_id: rem.id,
        task_id: rem.linked_task_id,
        recipient_id: rem.owner_id,
        recipient_name: rem.owner_name,
        channel: 'IN_APP',
        payload: {
          title: `🔔 Reminder: ${rem.title}`,
          notes: rem.notes,
          priority: rem.priority,
          trigger_time: rem.trigger_time
        },
        status: 'DELIVERED',
        attempt_count: 1,
        max_attempts: 5,
        last_attempt_at: now.toISOString(),
        failure_reason: null,
        read_at: null,
        created_at: now.toISOString()
      });
      dispatchedCount++;
    }
  });

  // 2. SLA Escalation check for overdue high-priority tasks
  tasksCache.forEach(task => {
    if (task.status !== 'COMPLETED' && task.status !== 'CANCELLED') {
      const due = new Date(task.due_date);
      if (now > due && task.escalation_level === 0) {
        task.escalation_level = 1;
        task.updated_at = now.toISOString();

        // Create escalation record
        escalationsCache.unshift({
          id: generateId('ESC'),
          task_id: task.id,
          breach_type: 'RESOLUTION_BREACH',
          severity: task.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          notified_party: 'operations@jaibhavanicargo.com',
          escalation_timestamp: now.toISOString(),
          resolution_timestamp: null,
          resolution_notes: `Automated SLA escalation: Task ${task.id} breached SLA deadline (${task.due_date})`
        });

        // Push priority alert notification
        notificationsCache.unshift({
          id: generateId('NOTIF'),
          task_id: task.id,
          recipient_id: 'all',
          recipient_name: 'Operations Senior Management',
          channel: 'IN_APP',
          payload: {
            title: `⚠️ SLA ESCALATION: Task Overdue [${task.id}]`,
            notes: `Task "${task.title}" assigned to ${task.assigned_to_name} has breached its deadline. Immediate intervention required.`,
            priority: 'CRITICAL',
            escalation: true
          },
          status: 'DELIVERED',
          created_at: now.toISOString()
        });
      }
    }
  });

  if (dispatchedCount > 0) {
    saveReminders();
    saveNotifications();
    saveTasks();
    saveEscalations();
  }

  return { dispatched_reminders: dispatchedCount, timestamp: now.toISOString() };
}

// ── CLEAR ALL DUMMY PRODUCTIVITY RECORDS ─────────────────────────────
export function clearAll() {
  tasksCache = [];
  remindersCache = [];
  notificationsCache = [];
  workflowsCache = [];
  escalationsCache = [];
  saveTasks();
  saveReminders();
  saveNotifications();
  saveWorkflows();
  saveEscalations();
  return { success: true, message: 'All productivity tasks, reminders, and notifications cleared.' };
}
