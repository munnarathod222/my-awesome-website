import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as auditService from './apps/api/src/services/auditService.js';
import * as productivityService from './apps/api/src/services/productivityService.js';

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
          const { taskId, updates } = JSON.parse(b);
          const task = productivityService.updateTask(taskId, updates, actor);
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
          const { taskId } = JSON.parse(b);
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
          const { reminderId, minutes } = JSON.parse(b);
          const reminder = productivityService.snoozeReminder(reminderId, minutes);
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
          const { reminderId } = JSON.parse(b);
          const reminder = productivityService.completeReminder(reminderId);
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
          const { notificationId } = JSON.parse(b);
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
          const { workflowId, action, reason } = JSON.parse(b);
          const workflow = productivityService.processApproval(workflowId, action, reason, actor);
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
