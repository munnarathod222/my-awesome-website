import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as auditService from './apps/api/src/services/auditService.js';
import * as productivityService from './apps/api/src/services/productivityService.js';
import * as orgService from './apps/api/src/services/orgService.js';
import * as employeeBankService from './apps/api/src/services/employeeBankService.js';
import * as routeCorridorService from './apps/api/src/services/routeCorridorService.js';
import * as attributionEngineService from './apps/api/src/services/attributionEngineService.js';
import * as employeeCodeService from './apps/api/src/services/employeeCodeService.js';
import * as driverAuthService from './apps/api/src/services/driverAuthService.js';

// Start persistent background reminder & SLA escalation scheduler (runs every 60s)
setInterval(() => {
  try {
    productivityService.runBackgroundSchedulerTick();
  } catch (err) {
    console.error('[Productivity Scheduler Error]:', err.message);
  }
}, 60000);

// Recover missed reminders on server start
try {
  productivityService.runBackgroundSchedulerTick();
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const [reqPath, queryString] = req.url.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  // Enable CORS headers for API endpoints
  if (reqPath.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Actor-Id, X-Actor-Role');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
  }

  // ── Enterprise Audit & Anti-Fraud Endpoints ─────────────────────
  if (reqPath.startsWith('/api/audit')) {
    const meta = {
      ip: req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'WebClient',
      actorId: req.headers['x-actor-id'],
      actorRole: req.headers['x-actor-role']
    };

    // Ingest event: POST /api/audit/event
    if (reqPath === '/api/audit/event' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const event = auditService.ingestEvent(payload, meta);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, event }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Query events: GET /api/audit/events
    if (reqPath === '/api/audit/events' && req.method === 'GET') {
      const filters = {
        module: queryParams.get('module') || 'all',
        action: queryParams.get('action') || 'all',
        severity: queryParams.get('severity') || 'all',
        search: queryParams.get('search') || ''
      };
      const events = auditService.getEvents(filters);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: events.length, events }));
    }

    // Verify integrity: GET /api/audit/verify
    if (reqPath === '/api/audit/verify' && req.method === 'GET') {
      const verification = auditService.verifyIntegrity();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, verification }));
    }

    // Health metrics: GET /api/audit/health
    if (reqPath === '/api/audit/health' && req.method === 'GET') {
      const health = auditService.getHealthMetrics();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, health }));
    }

    // Alerts: GET /api/audit/alerts
    if (reqPath === '/api/audit/alerts' && req.method === 'GET') {
      const alerts = auditService.getAlerts();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, alerts }));
    }

    // Review alert: POST /api/audit/alerts/review
    if (reqPath === '/api/audit/alerts/review' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { alertId, action, notes, reviewer } = JSON.parse(b);
          const reviewed = auditService.reviewAlert(alertId, action, notes, reviewer);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, alert: reviewed }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Cases: GET /api/audit/cases
    if (reqPath === '/api/audit/cases' && req.method === 'GET') {
      const cases = auditService.getCases();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, cases }));
    }

    // Update case: POST /api/audit/cases
    if (reqPath === '/api/audit/cases' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { caseId, updateData } = JSON.parse(b);
          const updated = auditService.updateCase(caseId, updateData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, case: updated }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Clear/Purge all dummy audit events: POST /api/audit/clear or /api/audit/reset
    if ((reqPath === '/api/audit/clear' || reqPath === '/api/audit/reset') && req.method === 'POST') {
      const result = auditService.clearAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // Seed Authentic Fleet Baseline: POST /api/audit/seed-baseline
    if (reqPath === '/api/audit/seed-baseline' && req.method === 'POST') {
      const result = auditService.seedAuthenticBaseline();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Audit endpoint not found' }));
  }

  // ── Enterprise Productivity & Workflow Endpoints ───────────────
  if (reqPath.startsWith('/api/productivity')) {
    const actor = {
      id: req.headers['x-actor-id'] || 'usr_operations',
      role: req.headers['x-actor-role'] || 'manager',
      name: req.headers['x-actor-name'] || 'Operations Lead'
    };

    // Summary KPIs: GET /api/productivity/summary
    if (reqPath === '/api/productivity/summary' && req.method === 'GET') {
      const summary = productivityService.getProductivitySummary(queryParams.get('userId'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(summary));
    }

    // Tasks list: GET /api/productivity/tasks
    if (reqPath === '/api/productivity/tasks' && req.method === 'GET') {
      const filters = {
        status: queryParams.get('status'),
        department: queryParams.get('department'),
        priority: queryParams.get('priority'),
        search: queryParams.get('search'),
        assigned_to: queryParams.get('assigned_to')
      };
      const tasks = productivityService.getTasks(filters);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: tasks.length, tasks }));
    }

    // Create task: POST /api/productivity/tasks
    if (reqPath === '/api/productivity/tasks' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const task = productivityService.createTask(payload, actor);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, task }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Update task: POST /api/productivity/tasks/update
    if (reqPath === '/api/productivity/tasks/update' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const taskId = body.taskId || body.id;
          const updates = body.updates || body;
          const task = productivityService.updateTask(taskId, updates, actor);
          if (!task) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Task not found' }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, task }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Delete task: POST /api/productivity/tasks/delete
    if (reqPath === '/api/productivity/tasks/delete' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const taskId = body.taskId || body.id;
          const success = productivityService.deleteTask(taskId, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Reminders list: GET /api/productivity/reminders
    if (reqPath === '/api/productivity/reminders' && req.method === 'GET') {
      const reminders = productivityService.getReminders({ status: queryParams.get('status') });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: reminders.length, reminders }));
    }

    // Create reminder: POST /api/productivity/reminders
    if (reqPath === '/api/productivity/reminders' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const reminder = productivityService.createReminder(payload, actor);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, reminder }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Snooze reminder: POST /api/productivity/reminders/snooze
    if (reqPath === '/api/productivity/reminders/snooze' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const reminderId = body.reminderId || body.id;
          const minutes = body.minutes || 30;
          const reminder = productivityService.snoozeReminder(reminderId, minutes);
          if (!reminder) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Reminder not found' }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, reminder }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Complete reminder: POST /api/productivity/reminders/complete
    if (reqPath === '/api/productivity/reminders/complete' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const reminderId = body.reminderId || body.id;
          const reminder = productivityService.completeReminder(reminderId);
          if (!reminder) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Reminder not found' }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, reminder }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Notifications: GET /api/productivity/notifications
    if (reqPath === '/api/productivity/notifications' && req.method === 'GET') {
      const notifications = productivityService.getNotifications(queryParams.get('recipientId'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, notifications }));
    }

    // Acknowledge notification: POST /api/productivity/notifications/ack
    if (reqPath === '/api/productivity/notifications/ack' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const notificationId = body.notificationId || body.id;
          const notif = productivityService.acknowledgeNotification(notificationId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, notification: notif }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Workflows: GET /api/productivity/workflows
    if (reqPath === '/api/productivity/workflows' && req.method === 'GET') {
      const workflows = productivityService.getWorkflows({ status: queryParams.get('status') });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, workflows }));
    }

    // Create workflow: POST /api/productivity/workflows
    if (reqPath === '/api/productivity/workflows' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const workflow = productivityService.createWorkflow(payload, actor);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, workflow }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Process approval/rejection: POST /api/productivity/workflows/review
    if (reqPath === '/api/productivity/workflows/review' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const workflowId = body.workflowId || body.id;
          const action = body.action;
          const reason = body.reason || '';
          const workflow = productivityService.processApproval(workflowId, action, reason, actor);
          if (!workflow) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Workflow not found' }));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, workflow }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Clear all: POST /api/productivity/clear
    if (reqPath === '/api/productivity/clear' && req.method === 'POST') {
      const result = productivityService.clearAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Productivity endpoint not found' }));
  }

  // ── Enterprise User Management, Roles & Organization API Endpoints ─
  if (reqPath.startsWith('/api/org')) {
    const actor = {
      id: req.headers['x-actor-id'] || 'usr_vinod_admin',
      role: req.headers['x-actor-role'] || 'superuser',
      name: req.headers['x-actor-name'] || 'Vinod Kumar Rathod',
      email: req.headers['x-actor-email'] || 'munnarathod222@gmail.com'
    };

    // State: GET /api/org/state
    if (reqPath === '/api/org/state' && req.method === 'GET') {
      const state = orgService.getOrgState();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(JSON.stringify(state));
    }

    // Save User: POST /api/org/user/save
    if (reqPath === '/api/org/user/save' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const result = orgService.saveUser(payload, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Revoke User Access: POST /api/org/user/revoke
    if (reqPath === '/api/org/user/revoke' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { userId, reason } = JSON.parse(b);
          const result = orgService.revokeAccess(userId, reason, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Restore User Access: POST /api/org/user/restore
    if (reqPath === '/api/org/user/restore' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { userId } = JSON.parse(b);
          const result = orgService.restoreAccess(userId, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Delete User: POST /api/org/user/delete
    if (reqPath === '/api/org/user/delete' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { userId } = JSON.parse(b);
          const result = orgService.deleteUser(userId, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Save Role: POST /api/org/role/save
    if (reqPath === '/api/org/role/save' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const result = orgService.saveRole(payload, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Delete Role: POST /api/org/role/delete
    if (reqPath === '/api/org/role/delete' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { roleId } = JSON.parse(b);
          const result = orgService.deleteRole(roleId, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Save Team: POST /api/org/team/save
    if (reqPath === '/api/org/team/save' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const result = orgService.saveTeam(payload, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Delete Team: POST /api/org/team/delete
    if (reqPath === '/api/org/team/delete' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { teamId } = JSON.parse(b);
          const result = orgService.deleteTeam(teamId, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Update Hierarchy: POST /api/org/hierarchy/update
    if (reqPath === '/api/org/hierarchy/update' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { hierarchyChanges } = JSON.parse(b);
          const result = orgService.updateHierarchy(hierarchyChanges, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Org endpoint not found' }));
  }

  // ── Employee Bank Account & Settlement Details Endpoints ───────
  if (reqPath.startsWith('/api/employee/bank-details') || reqPath.startsWith('/api/driver/employee-bank-details')) {
    const actor = {
      id: req.headers['x-actor-id'] || 'usr_admin',
      role: req.headers['x-actor-role'] || 'superuser',
      name: req.headers['x-actor-name'] || 'Vinod Kumar Rathod',
      email: req.headers['x-actor-email'] || 'munnarathod222@gmail.com'
    };

    // Get all bank details: GET /api/employee/bank-details
    if ((reqPath === '/api/employee/bank-details' || reqPath === '/api/driver/employee-bank-details') && req.method === 'GET') {
      const details = employeeBankService.getAllBankDetails();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(JSON.stringify({ success: true, bankDetails: details }));
    }

    // Get bank details for single employee: GET /api/employee/bank-details/:id
    if (req.method === 'GET' && (reqPath.startsWith('/api/employee/bank-details/') || reqPath.startsWith('/api/driver/employee-bank-details/'))) {
      const parts = reqPath.split('/');
      const empId = parts[parts.length - 1];
      const record = employeeBankService.getBankDetails(empId);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(JSON.stringify({ success: true, bankDetails: record }));
    }

    // Save/Update bank details: POST /api/employee/bank-details
    if (req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const body = JSON.parse(b);
          const empId = body.employee_id || body.employeeId || body.id;
          if (!empId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'employee_id is required' }));
          }
          const saved = employeeBankService.saveBankDetails(empId, body, actor);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, record: saved }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // API handler for quotation rates
  if (reqPath === '/api/quotation/rates' || reqPath === '/hcgi/api/quotation/rates') {
    const qRateCandidates = [
      path.join(__dirname, 'quotation_rates.json'),
      path.join(__dirname, 'public/quotation_rates.json'),
      path.join(__dirname, 'dist/quotation_rates.json')
    ];
    if (req.method === 'GET') {
      for (const p of qRateCandidates) {
        if (fs.existsSync(p)) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
          return res.end(fs.readFileSync(p, 'utf8'));
        }
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Rates not found' }));
    }
    if (req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(b);
          parsed.updated_at = new Date().toISOString();
          const str = JSON.stringify(parsed, null, 2);
          qRateCandidates.forEach(p => {
            try {
              fs.mkdirSync(path.dirname(p), { recursive: true });
              fs.writeFileSync(p, str, 'utf8');
            } catch (e) {}
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, rates: parsed }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // ── Route Corridors & Spot Quoting ──────────────────────────────
  if (reqPath.startsWith('/api/corridors') || reqPath.startsWith('/hcgi/api/corridors')) {
    if (req.method === 'GET') {
      try {
        const data = routeCorridorService.getAllCorridors();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: data.length, data }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }
    if (req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const saved = routeCorridorService.saveCorridor(JSON.parse(b));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: saved }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
    if (req.method === 'DELETE') {
      const parts = reqPath.split('/');
      const id = parts[parts.length - 1];
      try {
        const ok = routeCorridorService.deleteCorridor(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, deleted: ok }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }
  }

  // ── Dual-Entity Attribution & Rotation Diagnostic Engine ────────
  if (reqPath.startsWith('/api/attribution') || reqPath.startsWith('/hcgi/api/attribution')) {
    const cleanPath = reqPath.replace('/hcgi', '');
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (cleanPath === '/api/attribution/matrix' && req.method === 'GET') {
      try {
        const matrix = attributionEngineService.getAttributionMatrix();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, ...matrix }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    if (cleanPath === '/api/attribution/drivers' && req.method === 'GET') {
      try {
        const driverId = urlObj.searchParams.get('driverId');
        const data = attributionEngineService.getDriverBaselines(driverId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: Array.isArray(data) ? data.length : 1, data }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    if (cleanPath === '/api/attribution/trucks' && req.method === 'GET') {
      try {
        const truckId = urlObj.searchParams.get('truckId');
        const data = attributionEngineService.getTruckBaselines(truckId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: Array.isArray(data) ? data.length : 1, data }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    if (cleanPath === '/api/attribution/swaps' && req.method === 'GET') {
      try {
        const status = urlObj.searchParams.get('status');
        const data = attributionEngineService.getSwapExperiments(status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: data.length, data }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    if (cleanPath === '/api/attribution/swaps' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const swap = attributionEngineService.initiateSwap(JSON.parse(b));
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: swap }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    if (cleanPath === '/api/attribution/swaps/evaluate' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const { swapId, testMetrics } = JSON.parse(b);
          const evaluated = attributionEngineService.evaluateSwap(swapId, testMetrics);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: evaluated }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    if (cleanPath === '/api/attribution/recommend' && req.method === 'GET') {
      try {
        const truckNumber = urlObj.searchParams.get('truckNumber');
        const driverName = urlObj.searchParams.get('driverName');
        const rec = attributionEngineService.recommendSwap(truckNumber, driverName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, data: rec }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }
  }

  // ── Native Android Mobile Driver Authentication API (Versioned) ──
  if (reqPath.startsWith('/api/mobile/v1/auth') || reqPath.startsWith('/hcgi/api/mobile/v1/auth')) {
    const cleanAuthPath = reqPath.replace('/hcgi', '');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let parsed = {};
      try { if (body) parsed = JSON.parse(body); } catch (_) {}

      try {
        const db = driverAuthService.getDb();

        // 1. POST /api/mobile/v1/auth/login
        if (cleanAuthPath === '/api/mobile/v1/auth/login' && req.method === 'POST') {
          const ip = req.socket.remoteAddress || '127.0.0.1';
          const result = driverAuthService.authenticateLogin(db, {
            employeeCode: parsed.employeeCode,
            password: parsed.password,
            ip
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // 2. POST /api/mobile/v1/auth/refresh
        if (cleanAuthPath === '/api/mobile/v1/auth/refresh' && req.method === 'POST') {
          const result = driverAuthService.refreshSessionToken(db, { refreshToken: parsed.refreshToken });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // Helper: verify bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'UNAUTHORIZED', error: 'Bearer token required' }));
        }
        const token = authHeader.split(' ')[1];
        const verified = driverAuthService.verifyJwt(token);
        if (!verified.valid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'TOKEN_INVALID', error: verified.error }));
        }

        const payload = verified.payload;
        const acc = db.prepare('SELECT id, employee_id, employee_code, password_version, account_status, must_change_password FROM driver_app_accounts WHERE employee_id = ?').get(payload.sub);
        if (!acc || acc.account_status !== 'active') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'ACCOUNT_DISABLED', error: 'Driver account is inactive' }));
        }
        if (acc.password_version !== payload.pver) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'SESSION_REVOKED', error: 'Session revoked. Please log in again.' }));
        }

        // 3. POST /api/mobile/v1/auth/change-password
        if (cleanAuthPath === '/api/mobile/v1/auth/change-password' && req.method === 'POST') {
          const result = driverAuthService.changeDriverPassword(db, {
            employeeId: acc.employee_id,
            currentPassword: parsed.currentPassword,
            newPassword: parsed.newPassword
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // 4. POST /api/mobile/v1/auth/logout
        if (cleanAuthPath === '/api/mobile/v1/auth/logout' && req.method === 'POST') {
          const result = driverAuthService.logoutDriver(db, { employeeId: acc.employee_id });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // If must change password, block any further operations
        if (acc.must_change_password) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'PASSWORD_CHANGE_REQUIRED', error: 'Temporary password detected. You must change your password before continuing.' }));
        }

        // 5. GET /api/mobile/v1/me
        if (cleanAuthPath === '/api/mobile/v1/me' && req.method === 'GET') {
          const profile = driverAuthService.getDriverProfile(db, acc.employee_id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, driver: profile }));
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
      } catch (err) {
        const status = err.status || 400;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ── Office Driver App Access Management Endpoints ─────────────────
  if (reqPath.startsWith('/api/office/driver-access') || reqPath.startsWith('/hcgi/api/office/driver-access')) {
    const cleanOfficePath = reqPath.replace('/hcgi', '');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let parsed = {};
      try { if (body) parsed = JSON.parse(body); } catch (_) {}

      try {
        const db = driverAuthService.getDb();
        const actor = req.headers['x-actor-id'] || 'Office Administrator';

        if (cleanOfficePath === '/api/office/driver-access/create' && req.method === 'POST') {
          const result = driverAuthService.createDriverAccount(db, {
            employeeId: parsed.employeeId,
            temporaryPassword: parsed.temporaryPassword,
            createdBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath === '/api/office/driver-access/reset-password' && req.method === 'POST') {
          const result = driverAuthService.resetDriverPassword(db, {
            employeeId: parsed.employeeId,
            temporaryPassword: parsed.temporaryPassword,
            resetBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath === '/api/office/driver-access/toggle-status' && req.method === 'POST') {
          const result = driverAuthService.setAccountStatus(db, {
            employeeId: parsed.employeeId,
            status: parsed.status,
            updatedBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath.startsWith('/api/office/driver-access/status/') && req.method === 'GET') {
          const empId = cleanOfficePath.split('/status/')[1];
          const status = driverAuthService.getAccountStatus(db, empId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, ...status }));
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }


  let filePath = path.join(DIST, reqPath === '/' ? 'index.html' : reqPath);
  const ext = path.extname(filePath).toLowerCase();

  // If request has an asset file extension but file does not exist, check fallback locations
  if (ext && ext !== '.html') {
    if (!fs.existsSync(filePath)) {
      const candidates = [
        path.join(__dirname, 'public', reqPath),
        path.join(__dirname, 'apps/web/dist', reqPath),
        path.join(__dirname, 'dist/apps/web', reqPath),
        path.join(__dirname, 'apps/api/dist', reqPath)
      ];
      let found = false;
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          filePath = cand;
          found = true;
          break;
        }
      }
      if (!found) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
    }
  } else {
    // For page navigation (HTML or routes without extension), fallback to dist/index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, 'index.html');
    }
  }

  const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
