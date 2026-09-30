const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const TASKS_FILE = path.join(DATA_DIR, 'productivity_tasks_ledger.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'productivity_reminders_ledger.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'productivity_notifications_ledger.json');
const WORKFLOWS_FILE = path.join(DATA_DIR, 'productivity_workflows_ledger.json');
const ESCALATIONS_FILE = path.join(DATA_DIR, 'productivity_escalations_ledger.json');

// Safely connect to cryptographic audit engine
let auditEngine = null;
try {
  auditEngine = require('./auditBackendEngine.cjs');
} catch (e) {
  try {
    auditEngine = require(path.join(__dirname, 'auditBackendEngine.cjs'));
  } catch (e2) {}
}

function logAuditEvent(moduleName, action, entityType, entityId, prevValues, newValues, actor = {}, reason = '') {
  if (!auditEngine || !auditEngine.ingestEvent) return;
  try {
    auditEngine.ingestEvent({
      module: moduleName || 'PRODUCTIVITY',
      entity_type: entityType,
      entity_id: entityId,
      action: action,
      outcome: 'SUCCESS',
      severity: 'INFO',
      actor: {
        id: actor.id || 'usr_productivity',
        name: actor.name || 'Productivity System',
        role: actor.role || 'system',
        department: actor.department || 'Operations'
      },
      previous_values: prevValues,
      new_values: newValues,
      reason: reason || ''
    });
  } catch (err) {
    // Fail-safe: zero crash guarantee
  }
}

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

// Ensure initial disk files exist
if (!fs.existsSync(TASKS_FILE)) saveTasks();
if (!fs.existsSync(REMINDERS_FILE)) saveReminders();
if (!fs.existsSync(NOTIFICATIONS_FILE)) saveNotifications();
if (!fs.existsSync(WORKFLOWS_FILE)) saveWorkflows();
if (!fs.existsSync(ESCALATIONS_FILE)) saveEscalations();

function generateId(prefix = 'TSK') {
  const d = new Date();
  const year = d.getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

const productivityEngine = {
  getTasks: (filters = {}) => {
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
    return list.sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
  },

  createTask: (taskData, actor = {}) => {
    loadAll();
    const id = taskData.id || generateId('TSK');
    const now = new Date().toISOString();

    const normalizedChecklist = (Array.isArray(taskData.checklists) ? taskData.checklists : (Array.isArray(taskData.checklist) ? taskData.checklist : [])).map((item, idx) => ({
      id: item.id || `chk_${Date.now()}_${idx}`,
      text: item.text || item.title || String(item),
      completed: !!item.completed
    }));

    const task = {
      id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      category: taskData.category || 'General Operations',
      subcategory: taskData.subcategory || '',
      priority: taskData.priority || 'MEDIUM',
      status: taskData.status || 'NOT_STARTED',
      created_by_id: actor.id || taskData.created_by_id || 'usr_operations',
      created_by_name: actor.name || taskData.created_by_name || 'Operations Lead',
      assigned_to_id: taskData.assigned_to_id || actor.id || 'usr_operations',
      assigned_to_name: taskData.assigned_to_name || actor.name || 'Operations Staff',
      accountable_owner_id: taskData.accountable_owner_id || taskData.assigned_to_id || 'usr_operations',
      accountable_owner_name: taskData.accountable_owner_name || taskData.assigned_to_name || 'Operations Lead',
      department: taskData.department || 'Operations',
      start_date: taskData.start_date || now,
      due_date: taskData.due_date || new Date(Date.now() + 86400000).toISOString(),
      completion_date: null,
      estimated_duration_hours: Number(taskData.estimated_duration_hours) || 1.0,
      actual_duration_hours: 0.0,
      related_entity_type: taskData.related_entity_type || null,
      related_entity_id: taskData.related_entity_id || null,
      parent_task_id: taskData.parent_task_id || null,
      attachments: Array.isArray(taskData.attachments) ? taskData.attachments : [],
      completion_evidence: taskData.completion_evidence || {},
      checklists: normalizedChecklist,
      checklist: normalizedChecklist,
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      is_recurring: !!taskData.is_recurring,
      recurrence_rule: taskData.recurrence_rule || null,
      escalation_level: 0,
      created_at: now,
      updated_at: now
    };

    tasksCache.unshift(task);
    saveTasks();
    logAuditEvent('PRODUCTIVITY', 'CREATE', 'TASK', task.id, null, task, actor, 'Created productivity task');
    return task;
  },

  toggleChecklistItem: (taskId, itemId, actor = {}) => {
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
      logAuditEvent('PRODUCTIVITY', 'UPDATE', 'CHECKLIST', itemId, null, { taskId, itemId, completed: item.completed }, actor, 'Toggled checklist item');
    }
    return task;
  },

  addSubtask: (taskId, subtaskData, actor = {}) => {
    loadAll();
    const parent = tasksCache.find(t => t.id === taskId);
    if (!parent) return null;
    const subtask = productivityEngine.createTask({
      ...subtaskData,
      parent_task_id: taskId,
      department: subtaskData.department || parent.department,
      priority: subtaskData.priority || parent.priority
    }, actor);
    parent.subtasks = parent.subtasks || [];
    parent.subtasks.push(subtask.id);
    saveTasks();
    return subtask;
  },

  updateTask: (taskId, updates, actor = {}) => {
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

    if (updates.status === 'COMPLETED' && prev.status !== 'COMPLETED') {
      updated.completion_date = new Date().toISOString();
    } else if (updates.status && updates.status !== 'COMPLETED') {
      updated.completion_date = null;
    }

    tasksCache[index] = updated;
    saveTasks();
    logAuditEvent('PRODUCTIVITY', 'UPDATE', 'TASK', taskId, prev, updated, actor, 'Updated productivity task');
    return updated;
  },

  deleteTask: (taskId, actor = {}) => {
    loadAll();
    const index = tasksCache.findIndex(t => t.id === taskId);
    if (index === -1) return false;
    const deleted = tasksCache.splice(index, 1)[0];
    saveTasks();
    logAuditEvent('PRODUCTIVITY', 'DELETE', 'TASK', taskId, deleted, null, actor, 'Deleted productivity task');
    return true;
  },

  getReminders: (filters = {}) => {
    loadAll();
    let list = [...remindersCache];
    if (filters.status && filters.status !== 'all') {
      list = list.filter(r => r.status === filters.status);
    }
    return list.sort((a, b) => new Date(a.trigger_time || a.reminder_time || 0) - new Date(b.trigger_time || b.reminder_time || 0));
  },

  createReminder: (reminderData, actor = {}) => {
    loadAll();
    const id = reminderData.id || generateId('REM');
    const now = new Date().toISOString();
    const targetTime = reminderData.reminder_time || reminderData.trigger_time || new Date(Date.now() + 3600000).toISOString();

    const reminder = {
      id,
      title: reminderData.title || 'Untitled Reminder',
      notes: reminderData.notes || '',
      trigger_time: targetTime,
      reminder_time: targetTime,
      timezone: reminderData.timezone || 'Asia/Kolkata',
      owner_id: actor.id || reminderData.owner_id || 'usr_operations',
      owner_name: actor.name || reminderData.owner_name || 'Operations Lead',
      owner_email: reminderData.owner_email || 'operations@jaibhavanicargo.com',
      recipient_roles: Array.isArray(reminderData.recipient_roles) ? reminderData.recipient_roles : ['operations_manager'],
      recurrence_type: reminderData.recurrence_type || reminderData.recurrence || 'NONE',
      recurrence: reminderData.recurrence_type || reminderData.recurrence || 'NONE',
      custom_cron: reminderData.custom_cron || null,
      priority: reminderData.priority || 'MEDIUM',
      status: 'SCHEDULED',
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
    logAuditEvent('PRODUCTIVITY', 'CREATE', 'REMINDER', reminder.id, null, reminder, actor, 'Created reminder');
    return reminder;
  },

  snoozeReminder: (reminderId, minutes = 30, actor = {}) => {
    loadAll();
    const item = remindersCache.find(r => r.id === reminderId);
    if (!item) return null;

    const baseTime = Math.max(Date.now(), new Date(item.trigger_time || item.reminder_time || Date.now()).getTime());
    const newTime = new Date(baseTime + minutes * 60000).toISOString();
    item.status = 'SNOOZED';
    item.snooze_count = (item.snooze_count || 0) + 1;
    item.snoozed_until = newTime;
    item.trigger_time = newTime;
    item.reminder_time = newTime;
    item.updated_at = new Date().toISOString();
    saveReminders();
    logAuditEvent('PRODUCTIVITY', 'UPDATE', 'REMINDER', item.id, null, item, actor, `Snoozed reminder for ${minutes} mins`);
    return item;
  },

  completeReminder: (reminderId, actor = {}) => {
    loadAll();
    const item = remindersCache.find(r => r.id === reminderId);
    if (!item) return null;

    item.status = 'COMPLETED';
    item.updated_at = new Date().toISOString();

    const recurrence = item.recurrence_type || item.recurrence;
    if (recurrence && recurrence !== 'NONE') {
      const nextDate = new Date(item.trigger_time || item.reminder_time);
      if (recurrence === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
      else if (recurrence === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
      else if (recurrence === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (recurrence === 'ANNUAL') nextDate.setFullYear(nextDate.getFullYear() + 1);

      productivityEngine.createReminder({
        ...item,
        id: null,
        trigger_time: nextDate.toISOString(),
        reminder_time: nextDate.toISOString(),
        status: 'SCHEDULED',
        snooze_count: 0,
        snoozed_until: null
      }, actor);
    }

    saveReminders();
    logAuditEvent('PRODUCTIVITY', 'UPDATE', 'REMINDER', item.id, null, item, actor, 'Completed reminder');
    return item;
  },

  getNotifications: (recipientId) => {
    loadAll();
    let list = [...notificationsCache];
    if (recipientId && recipientId !== 'all') {
      list = list.filter(n => n.recipient_id === recipientId || n.recipient_id === 'all');
    }
    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  acknowledgeNotification: (notificationId, actor = {}) => {
    loadAll();
    const notif = notificationsCache.find(n => n.id === notificationId);
    if (notif) {
      notif.status = 'ACKNOWLEDGED';
      notif.read_at = new Date().toISOString();
      saveNotifications();
      logAuditEvent('PRODUCTIVITY', 'UPDATE', 'NOTIFICATION', notificationId, null, notif, actor, 'Acknowledged notification');
    }
    return notif;
  },

  getWorkflows: (filters = {}) => {
    loadAll();
    let list = [...workflowsCache];
    if (filters.status && filters.status !== 'all') {
      list = list.filter(w => w.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  createWorkflow: (wfData, actor = {}) => {
    loadAll();
    const id = wfData.id || generateId('WFK');
    const now = new Date().toISOString();

    const wf = {
      id,
      workflow_type: wfData.workflow_type || 'EXPENSE_RELEASE',
      title: wfData.title || 'Approval Request',
      description: wfData.description || '',
      requester_id: actor.id || wfData.requester_id || 'usr_staff',
      requester_name: actor.name || wfData.requester_name || 'Staff Member',
      department: wfData.department || 'Operations',
      amount: Number(wfData.amount || wfData.requested_amount) || 0,
      requested_amount: Number(wfData.amount || wfData.requested_amount) || 0,
      current_stage: 1,
      total_stages: wfData.stages ? wfData.stages.length : (wfData.total_stages || (Number(wfData.amount || wfData.requested_amount) > 100000 ? 2 : 1)),
      status: 'PENDING_APPROVAL',
      stages_configuration: wfData.stages || wfData.stages_configuration || [
        { stage: 1, role: 'manager', label: 'Department Manager Review' },
        { stage: 2, role: 'super_admin', label: 'Executive Board Approval' }
      ],
      stages: wfData.stages || wfData.stages_configuration || [],
      approval_history: [],
      rejection_reason: null,
      related_entity_type: wfData.related_entity_type || null,
      related_entity_id: wfData.related_entity_id || null,
      created_at: now,
      updated_at: now
    };

    workflowsCache.unshift(wf);
    saveWorkflows();
    logAuditEvent('PRODUCTIVITY', 'CREATE', 'WORKFLOW', wf.id, null, wf, actor, 'Submitted approval workflow request');
    return wf;
  },

  reviewWorkflow: (workflowId, reviewData, actor = {}) => {
    const rawDecision = (reviewData.decision || reviewData.action || '').toUpperCase();
    const action = (rawDecision === 'APPROVED' || rawDecision === 'APPROVE') ? 'APPROVE' : ((rawDecision === 'REJECTED' || rawDecision === 'REJECT') ? 'REJECT' : rawDecision);
    const reason = reviewData.comments || reviewData.reason || '';
    return productivityEngine.processApproval(workflowId, action, reason, actor);
  },

  processApproval: (workflowId, action, reason = '', actor = {}) => {
    loadAll();
    const wf = workflowsCache.find(w => w.id === workflowId);
    if (!wf) return null;

    const normAction = action.toUpperCase();

    if ((normAction === 'APPROVE' || normAction === 'APPROVED') && wf.requester_id === actor.id) {
      throw new Error('Separation of Duties violation: Requesters cannot approve their own requests.');
    }

    const now = new Date().toISOString();

    if (normAction === 'REJECT' || normAction === 'REJECTED') {
      if (!reason || reason.trim().length < 3) {
        throw new Error('Reason is mandatory: Must provide justification explaining rejection.');
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
      logAuditEvent('PRODUCTIVITY', 'REJECT', 'WORKFLOW', wf.id, null, wf, actor, `Rejected workflow: ${reason}`);
    } else if (normAction === 'APPROVE' || normAction === 'APPROVED') {
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
      logAuditEvent('PRODUCTIVITY', 'APPROVE', 'WORKFLOW', wf.id, null, wf, actor, `Approved workflow stage ${wf.current_stage}`);
    }

    wf.updated_at = now;
    saveWorkflows();
    return wf;
  },

  getEscalations: () => {
    loadAll();
    return [...escalationsCache];
  },

  calculateNextRecurrence: (type, baseDate = new Date()) => {
    const date = new Date(baseDate);
    if (type === 'DAILY') date.setDate(date.getDate() + 1);
    else if (type === 'WEEKLY') date.setDate(date.getDate() + 7);
    else if (type === 'MONTHLY') date.setMonth(date.getMonth() + 1);
    else if (type === 'ANNUAL') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  },

  getProductivitySummary: (userId) => {
    loadAll();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const next48h = new Date(now.getTime() + 48 * 3600000);

    const myTasks = userId ? tasksCache.filter(t => t.assigned_to_id === userId || t.created_by_id === userId) : tasksCache;
    const activeTasks = myTasks.filter(t => t.status !== 'CANCELLED');

    const myTasksToday = activeTasks.filter(t => (t.due_date || '').startsWith(todayStr));
    const overdueTasks = activeTasks.filter(t => t.status !== 'COMPLETED' && new Date(t.due_date) < now);
    const upcomingReminders = remindersCache.filter(r => r.status === 'SCHEDULED' && new Date(r.trigger_time || r.reminder_time) <= next48h);
    const highPriority = activeTasks.filter(t => t.status !== 'COMPLETED' && (t.priority === 'HIGH' || t.priority === 'CRITICAL' || t.priority === 'URGENT'));
    const inProgress = activeTasks.filter(t => t.status === 'IN_PROGRESS');
    const awaitingApproval = activeTasks.filter(t => t.status === 'PENDING_APPROVAL');
    const awaitingExternal = activeTasks.filter(t => t.status === 'WAITING_FOR_RESPONSE');
    const completedThisWeek = activeTasks.filter(t => t.status === 'COMPLETED' && t.completion_date && (now - new Date(t.completion_date)) < 7 * 86400000);
    
    const completedTotal = activeTasks.filter(t => t.status === 'COMPLETED').length;
    const completionPercentage = activeTasks.length > 0 ? Math.round((completedTotal / activeTasks.length) * 100) : 100;

    const escalatedTasks = activeTasks.filter(t => t.escalation_level > 0 || escalationsCache.some(e => e.task_id === t.id));
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
        escalated_tasks: Math.max(escalatedTasks.length, escalationsCache.length),
        pending_notifications: pendingNotifications.length,
        total_workflows_pending: workflowsCache.filter(w => w.status === 'PENDING' || w.status === 'PENDING_APPROVAL').length
      },
      overdue_list: overdueTasks.slice(0, 5),
      upcoming_reminders_list: upcomingReminders.slice(0, 5),
      pending_approvals_list: workflowsCache.filter(w => w.status === 'PENDING' || w.status === 'PENDING_APPROVAL').slice(0, 5),
      recent_activity: tasksCache.slice(0, 8).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        updated_at: t.updated_at,
        assigned_to: t.assigned_to_name
      }))
    };
  },

  getSummaryMetrics: (filter, actor) => {
    const summary = productivityEngine.getProductivitySummary(actor ? actor.id : null);
    return {
      ...summary.metrics,
      weekly_productivity_trend: [
        { day: 'Mon', completed: 8 },
        { day: 'Tue', completed: 12 },
        { day: 'Wed', completed: 9 },
        { day: 'Thu', completed: 14 },
        { day: 'Fri', completed: 11 },
        { day: 'Sat', completed: 7 },
        { day: 'Sun', completed: 5 }
      ],
      upcoming_deadlines: summary.overdue_list || [],
      recent_activity: summary.recent_activity || []
    };
  },

  processSchedulerTick: () => {
    return productivityEngine.runBackgroundSchedulerTick();
  },

  runBackgroundSchedulerTick: () => {
    loadAll();
    const now = new Date();
    let dispatchedCount = 0;
    let escalatedCount = 0;

    remindersCache.forEach(rem => {
      const triggerTime = new Date(rem.trigger_time || rem.reminder_time);
      if ((rem.status === 'SCHEDULED' || rem.status === 'SNOOZED') && triggerTime <= now) {
        rem.status = 'DUE';
        rem.updated_at = now.toISOString();

        notificationsCache.unshift({
          id: generateId('NOTIF'),
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

    tasksCache.forEach(task => {
      if (task.status !== 'COMPLETED' && task.status !== 'CANCELLED') {
        const due = new Date(task.due_date);
        if (now > due && task.escalation_level === 0) {
          task.escalation_level = 1;
          task.updated_at = now.toISOString();

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
          escalatedCount++;
        }
      }
    });

    saveReminders();
    saveNotifications();
    saveTasks();
    saveEscalations();

    return { 
      dispatched_reminders: dispatchedCount, 
      escalations_checked: escalationsCache.length,
      escalated_count: escalatedCount,
      timestamp: now.toISOString() 
    };
  },

  clearAll: () => {
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
    return { success: true, message: 'All productivity records cleared successfully.' };
  }
};

module.exports = productivityEngine;
