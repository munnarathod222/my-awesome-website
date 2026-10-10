import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import * as auditService from './apps/api/src/services/auditService.js';
import * as productivityService from './apps/api/src/services/productivityService.js';
import * as orgService from './apps/api/src/services/orgService.js';
import * as employeeBankService from './apps/api/src/services/employeeBankService.js';
import * as routeCorridorService from './apps/api/src/services/routeCorridorService.js';
import * as attributionEngineService from './apps/api/src/services/attributionEngineService.js';
import * as employeeCodeService from './apps/api/src/services/employeeCodeService.js';
import * as driverAuthService from './apps/api/src/services/driverAuthService.js';
import * as truckAnalyticsService from './apps/api/src/services/truckAnalyticsService.js';
import pb from './apps/api/src/utils/pocketbaseClient.js';
import { createMobileDriverData, MobileDataError, pageNumber } from './apps/api/src/services/mobileDriverData.js';
import { downloadMobileDocument } from './apps/api/src/services/mobileDocumentDownload.js';

const mobileDriverData = createMobileDriverData(pb);

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

  // ── Enterprise Log-Driven Truck Manager Analytics API ───────────
  if (reqPath.startsWith('/api/truck-manager')) {
    const cleanPath = reqPath.replace('/hcgi', '');
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // GET /api/truck-manager/analytics
    if (cleanPath === '/api/truck-manager/analytics' && req.method === 'GET') {
      try {
        const period = urlObj.searchParams.get('period') || 'all';
        const truckId = urlObj.searchParams.get('truckId') || null;
        const analytics = truckAnalyticsService.calculateFleetAnalytics({ period, truckId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(analytics));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    // POST /api/truck-manager/classify-idle
    if (cleanPath === '/api/truck-manager/classify-idle' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const payload = JSON.parse(b);
          const result = truckAnalyticsService.classifyIdleInterval(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // ── Native Android Mobile Driver Authentication API (Versioned) ──
  if (reqPath.startsWith('/api/mobile/v1') || reqPath.startsWith('/hcgi/api/mobile/v1')) {
    const cleanAuthPath = reqPath.replace('/hcgi', '');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let parsed = {};
      try { if (body) parsed = JSON.parse(body); } catch (_) {}

      try {
        // 1. POST /api/mobile/v1/auth/login or /api/mobile/v1/login
        if ((cleanAuthPath === '/api/mobile/v1/auth/login' || cleanAuthPath === '/api/mobile/v1/login') && req.method === 'POST') {
          const ip = req.socket.remoteAddress || '127.0.0.1';
          const result = driverAuthService.authenticateLogin(null, {
            employeeCode: parsed.employeeCode,
            password: parsed.password,
            ip
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // 2. POST /api/mobile/v1/auth/refresh or /api/mobile/v1/refresh
        if ((cleanAuthPath === '/api/mobile/v1/auth/refresh' || cleanAuthPath === '/api/mobile/v1/refresh') && req.method === 'POST') {
          const result = driverAuthService.refreshSessionToken(null, { refreshToken: parsed.refreshToken });
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
        let verified;
        try {
          verified = driverAuthService.verifyJwt(token);
        } catch (cfgErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'CONFIG_ERROR', error: 'Server authentication configuration error' }));
        }
        if (!verified.valid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'TOKEN_INVALID', error: verified.error }));
        }

        const payload = verified.payload;
        if (payload.type !== 'access') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'TOKEN_TYPE_INVALID', error: 'Invalid token type: Protected routes require an access token' }));
        }
        const acc = driverAuthService.findAccountByEmployeeId(payload.sub);
        if (!acc || acc.account_status !== 'active') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'ACCOUNT_DISABLED', error: 'Driver account is inactive' }));
        }
        if (acc.password_version !== payload.pver) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'SESSION_REVOKED', error: 'Session revoked. Please log in again.' }));
        }

        // 3. POST /api/mobile/v1/auth/change-password or /api/mobile/v1/change-password
        if ((cleanAuthPath === '/api/mobile/v1/auth/change-password' || cleanAuthPath === '/api/mobile/v1/change-password') && req.method === 'POST') {
          const result = driverAuthService.changeDriverPassword(null, {
            employeeId: acc.employee_id,
            currentPassword: parsed.currentPassword,
            newPassword: parsed.newPassword
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // 4. POST /api/mobile/v1/auth/logout or /api/mobile/v1/logout
        if ((cleanAuthPath === '/api/mobile/v1/auth/logout' || cleanAuthPath === '/api/mobile/v1/logout') && req.method === 'POST') {
          const result = driverAuthService.logoutDriver(null, { employeeId: acc.employee_id });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        // If must change password, block any further operations
        if (acc.must_change_password) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, code: 'PASSWORD_CHANGE_REQUIRED', error: 'Temporary password detected. You must change your password before continuing.' }));
        }

        // 5. GET /api/mobile/v1/me or /api/mobile/v1/auth/me
        if ((cleanAuthPath === '/api/mobile/v1/me' || cleanAuthPath === '/api/mobile/v1/auth/me') && req.method === 'GET') {
          const profile = driverAuthService.getDriverProfile(null, acc.employee_id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, driver: profile }));
        }

        // 6. GET /api/mobile/v1/data/capabilities
        if (cleanAuthPath === '/api/mobile/v1/data/capabilities' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
          return res.end(JSON.stringify({
            success: true,
            apiVersion: 1,
            mode: 'read-only',
            sections: ['trips', 'expenses', 'attendance', 'my-documents', 'truck-documents', 'truck', 'performance'],
            tripActions: false,
            expenseSubmission: false,
            attendanceCheckIn: false,
            pushNotifications: false
          }));
        }

        // 7. GET /api/mobile/v1/data/truck
        if (cleanAuthPath === '/api/mobile/v1/data/truck' && req.method === 'GET') {
          const truck = await mobileDriverData.truck(acc.employee_id);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
          return res.end(JSON.stringify({ success: true, truck }));
        }

        // 8. GET /api/mobile/v1/data/performance
        if (cleanAuthPath === '/api/mobile/v1/data/performance' && req.method === 'GET') {
          const perf = await mobileDriverData.performance(acc.employee_id, acc.employee_code);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
          return res.end(JSON.stringify({ success: true, performance: perf }));
        }

        // 9. File downloads: GET /api/mobile/v1/data/:section/:id/files/:index
        const fileMatch = cleanAuthPath.match(/^\/api\/mobile\/v1\/data\/([^\/]+)\/([^\/]+)\/files\/(\d+)$/);
        if (fileMatch && req.method === 'GET') {
          const [, section, recId, index] = fileMatch;
          const { row, name } = await mobileDriverData.file(section, recId, index, acc.employee_id);
          const { bytes, type } = await downloadMobileDocument(row, name);
          res.writeHead(200, {
            'Content-Type': type,
            'X-Content-Type-Options': 'nosniff',
            'Content-Disposition': 'attachment',
            'Cache-Control': 'private, no-store'
          });
          return res.end(bytes);
        }

        // 10. List sections: GET /api/mobile/v1/data/:section
        const sectionMatch = cleanAuthPath.match(/^\/api\/mobile\/v1\/data\/([^\/\?]+)/);
        if (sectionMatch && req.method === 'GET') {
          const section = sectionMatch[1];
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const page = pageNumber(urlObj.searchParams.get('page') || undefined);
          const listRes = await mobileDriverData.list(section, acc.employee_id, page, acc.employee_code);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
          return res.end(JSON.stringify({ success: true, ...listRes }));
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
      } catch (err) {
        const known = err instanceof MobileDataError;
        const status = known ? err.status : (err.status || 500);
        res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' });
        return res.end(JSON.stringify({
          success: false,
          code: known ? err.code : (err.code || (status === 429 ? 'ACCOUNT_LOCKED' : (status === 403 ? 'ACCOUNT_DISABLED' : 'ERROR'))),
          error: known ? err.message : (err.message || 'Website data is temporarily unavailable. Please retry.')
        }));
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
        const actor = req.headers['x-actor-id'] || 'Office Administrator';

        if (cleanOfficePath === '/api/office/driver-access/create' && req.method === 'POST') {
          const result = driverAuthService.createDriverAccount(null, {
            employeeId: parsed.employeeId,
            temporaryPassword: parsed.temporaryPassword,
            createdBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath === '/api/office/driver-access/reset-password' && req.method === 'POST') {
          const result = driverAuthService.resetDriverPassword(null, {
            employeeId: parsed.employeeId,
            temporaryPassword: parsed.temporaryPassword,
            resetBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath === '/api/office/driver-access/toggle-status' && req.method === 'POST') {
          const result = driverAuthService.setAccountStatus(null, {
            employeeId: parsed.employeeId,
            status: parsed.status,
            updatedBy: actor
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        }

        if (cleanOfficePath.startsWith('/api/office/driver-access/status/') && req.method === 'GET') {
          const empId = cleanOfficePath.split('/status/')[1];
          const status = driverAuthService.getAccountStatus(null, empId);
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

  // ── Office Trips Driver Code Reconciliation Endpoints ─────────────
  if (reqPath.startsWith('/api/office/trips') || reqPath.startsWith('/hcgi/api/office/trips')) {
    const cleanTripsPath = reqPath.replace('/hcgi', '');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let parsed = {};
      try { if (body) parsed = JSON.parse(body); } catch (_) {}

      try {
        const actor = req.headers['x-actor-id'] || 'Office Administrator';

        // 1. POST /api/office/trips/assign-driver-code
        if (cleanTripsPath === '/api/office/trips/assign-driver-code' && req.method === 'POST') {
          const tripIds = parsed.tripIds || parsed.trip_ids;
          const employeeCode = parsed.employeeCode || parsed.driver_code || parsed.driver_employee_code;
          const employeeId = parsed.employeeId || parsed.driver_employee_id || parsed.driverEmployeeId;
          const user = parsed.user || parsed.assigned_by;
          if (!Array.isArray(tripIds) || tripIds.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'tripIds must be a non-empty array of trip IDs.' }));
          }

          const assignment = employeeCodeService.resolveDriverAssignment({
            driverCode: employeeCode,
            driverEmployeeId: employeeId
          });

          let empName = '';
          try {
            const emp = await pb.collection('employees').getOne(assignment.driver_employee_id, { $autoCancel: false });
            empName = emp.name || '';
          } catch (_) {}

          const results = [];
          for (const tid of tripIds) {
            const trip = await pb.collection('trip_logs').getOne(tid, { $autoCancel: false });
            const oldCode = trip.driver_employee_code || null;
            const oldId = trip.driver_employee_id || null;
            const oldDriverName = trip.driver_name || null;

            await pb.collection('trip_logs').update(trip.id, {
              driver_employee_id: assignment.driver_employee_id,
              driver_employee_code: assignment.driver_employee_code,
              driver_name: empName || trip.driver_name
            }, { $autoCancel: false });

            // Record in audit service
            try {
              auditService.recordAuditEvent({
                event_type: 'TRIP_DRIVER_ASSIGNMENT',
                category: 'OPERATIONS',
                actor: user || actor,
                action: 'ASSIGN_DRIVER_CODE',
                target_id: trip.trip_id || trip.id,
                details: {
                  trip_id: trip.trip_id || trip.id,
                  record_id: trip.id,
                  old_driver_code: oldCode,
                  new_driver_code: assignment.driver_employee_code,
                  old_driver_employee_id: oldId,
                  new_driver_employee_id: assignment.driver_employee_id,
                  driver_name: empName,
                  previous_driver_name: oldDriverName
                },
                metadata: {
                  timestamp: new Date().toISOString()
                }
              });
            } catch (_) {}

            results.push({
              id: trip.id,
              trip_id: trip.trip_id,
              old_driver_code: oldCode,
              new_driver_code: assignment.driver_employee_code
            });
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: `Successfully assigned permanent code ${assignment.driver_employee_code} to ${results.length} trip(s).`,
            employeeCode: assignment.driver_employee_code,
            employeeId: assignment.driver_employee_id,
            driver_name: empName,
            updatedTrips: results
          }));
        }

        // 2. GET /api/office/trips/unassigned-driver-code
        if (cleanTripsPath === '/api/office/trips/unassigned-driver-code' && req.method === 'GET') {
          const list = await pb.collection('trip_logs').getFullList({
            filter: 'driver_employee_code = "" || driver_employee_code = null',
            sort: '-date,-created',
            $autoCancel: false
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            totalUnassigned: list.length,
            trips: list.map(t => ({
              id: t.id,
              trip_id: t.trip_id,
              date: t.date,
              route: t.route,
              truck_number: t.truck_number,
              driver_name: t.driver_name,
              revenue: t.revenue,
              trip_status: t.trip_status
            }))
          }));
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
      } catch (err) {
        res.writeHead(err.status || 400, { 'Content-Type': 'application/json' });
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

  const fileExt = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[fileExt] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    // Determine optimal Cache-Control policy
    let cacheControl = 'public, max-age=86400, stale-while-revalidate=3600';
    if (fileExt === '.html' || filePath.endsWith('index.html')) {
      cacheControl = 'public, max-age=0, must-revalidate';
    } else if (filePath.includes('/assets/docs/') || filePath.includes('\\assets\\docs\\')) {
      cacheControl = 'public, max-age=2592000, stale-while-revalidate=86400';
    } else if (/\.(js|css|woff2?|ttf|eot)$/i.test(filePath)) {
      cacheControl = 'public, max-age=31536000, immutable';
    } else if (/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(filePath)) {
      cacheControl = 'public, max-age=2592000, stale-while-revalidate=86400';
    }

    const etag = `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, {
        'ETag': etag,
        'Cache-Control': cacheControl,
        'Last-Modified': stats.mtime.toUTCString()
      });
      return res.end();
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': cacheControl,
        'ETag': etag,
        'Last-Modified': stats.mtime.toUTCString()
      });
      return res.end();
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }

      const acceptEncoding = req.headers['accept-encoding'] || '';
      const isCompressible = /\.(html|js|css|json|svg|txt)$/i.test(filePath) && content.length > 1024;

      if (isCompressible && acceptEncoding.includes('gzip')) {
        zlib.gzip(content, (gzipErr, compressed) => {
          if (gzipErr) {
            res.writeHead(200, {
              'Content-Type': contentType,
              'Content-Length': content.length,
              'Cache-Control': cacheControl,
              'ETag': etag,
              'Last-Modified': stats.mtime.toUTCString()
            });
            return res.end(content);
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip',
            'Content-Length': compressed.length,
            'Cache-Control': cacheControl,
            'ETag': etag,
            'Last-Modified': stats.mtime.toUTCString(),
            'Vary': 'Accept-Encoding'
          });
          res.end(compressed);
        });
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': content.length,
          'Cache-Control': cacheControl,
          'ETag': etag,
          'Last-Modified': stats.mtime.toUTCString()
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
