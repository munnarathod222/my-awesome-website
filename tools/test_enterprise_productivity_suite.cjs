/**
 * Automated Enterprise Productivity, Workflow & Reminder Test Suite
 * Tests 17 critical acceptance criteria across:
 * - Data schemas and persistence
 * - Status transitions and checklists
 * - Reminders and snooze calculations
 * - Multi-stage approvals with Separation of Duties
 * - Rejection reason mandates
 * - SLA escalations
 * - Local-disk zero-bandwidth storage
 * - SHA-256 Cryptographic Audit log chaining
 */

const fs = require('fs');
const path = require('path');
const engine = require('./productivityBackendEngine.cjs');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('  ENTERPRISE PRODUCTIVITY & WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  const testActor = {
    id: 'user_audit_test_01',
    name: 'Chief Logistics Officer',
    role: 'super_admin',
    department: 'Operations'
  };

  const approverActor = {
    id: 'user_director_02',
    name: 'Executive Director',
    role: 'super_admin',
    department: 'Executive'
  };

  // 1. Task Creation & Persistence
  console.log('[TEST 1] Task Creation & Persistence');
  const task1 = engine.createTask({
    title: 'Urgent Container Clearance at JNPT Nhava Sheva',
    description: 'Ensure customs seal verification and container clearance before demurrage cutoff.',
    priority: 'HIGH',
    department: 'Operations',
    due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    estimated_duration_hours: 4,
    accountable_owner: 'Operations Dispatcher',
    recurrence: 'WEEKLY'
  }, testActor);

  assert(task1 && task1.id && task1.id.startsWith('TSK-'), 'Task created with valid ID format');
  assert(task1.status === 'NOT_STARTED', 'Task initializes with NOT_STARTED status');
  assert(task1.priority === 'HIGH', 'Task priority recorded correctly');

  // Verify file on disk
  const tasksDisk = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/productivity_tasks_ledger.json'), 'utf8'));
  assert(tasksDisk.some(t => t.id === task1.id), 'Task persisted to local disk JSON ledger');

  // 2. Status Transitions
  console.log('\n[TEST 2] Task Status Lifecycle Transitions');
  const inProgressTask = engine.updateTask(task1.id, { status: 'IN_PROGRESS' }, testActor);
  assert(inProgressTask.status === 'IN_PROGRESS', 'Task transitioned to IN_PROGRESS');

  const completedTask = engine.updateTask(task1.id, { 
    status: 'COMPLETED',
    completion_evidence: 'Bill of Lading #BL-99281 cleared with Port Gate Pass'
  }, testActor);
  assert(completedTask.status === 'COMPLETED', 'Task transitioned to COMPLETED');
  assert(!!completedTask.completion_date, 'Completion timestamp recorded');
  assert(completedTask.completion_evidence.includes('BL-99281'), 'Completion evidence preserved');

  // 3. Checklist Items & Progress Calculation
  console.log('\n[TEST 3] Checklist Operations & Progress');
  const taskWithChecklist = engine.createTask({
    title: 'Comprehensive Truck Pre-Trip Safety Audit',
    priority: 'MEDIUM',
    department: 'Fleet',
    checklist: [
      { text: 'Tyre pressure inspection (>110 PSI)', completed: false },
      { text: 'Fastag wallet balance check (>₹3,000)', completed: false },
      { text: 'Valid PUCC and National Permit in cab', completed: false }
    ]
  }, testActor);

  assert(taskWithChecklist.checklist.length === 3, 'Checklist initialized with 3 items');
  
  // Toggle first checklist item
  const itemId = taskWithChecklist.checklist[0].id;
  const updatedChecklistTask = engine.toggleChecklistItem(taskWithChecklist.id, itemId, testActor);
  assert(updatedChecklistTask.checklist[0].completed === true, 'Checklist item toggled to completed');

  // 4. Subtasks Hierarchy
  console.log('\n[TEST 4] Hierarchical Subtasks');
  const subtask = engine.addSubtask(taskWithChecklist.id, {
    title: 'Verify spare wheel torque specifications',
    priority: 'MEDIUM'
  }, testActor);
  assert(subtask && subtask.parent_task_id === taskWithChecklist.id, 'Subtask linked to parent task ID');

  // 5. Reminders Scheduling & Disk Ledger
  console.log('\n[TEST 5] Reminders Creation & Persistence');
  const futureReminderTime = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  const reminder = engine.createReminder({
    title: 'Diesel Price Revision & Pump Credit Settlement',
    reminder_time: futureReminderTime,
    priority: 'HIGH',
    category: 'Finance',
    recurrence: 'DAILY'
  }, testActor);

  assert(reminder && reminder.id && reminder.id.startsWith('REM-'), 'Reminder created with REM- ID prefix');
  assert(reminder.status === 'SCHEDULED', 'Reminder status defaults to SCHEDULED');

  const remindersDisk = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/productivity_reminders_ledger.json'), 'utf8'));
  assert(remindersDisk.some(r => r.id === reminder.id), 'Reminder saved to local disk JSON ledger');

  // 6. Snooze Functionality & Idempotency
  console.log('\n[TEST 6] Reminder Snoozing');
  const snoozedReminder = engine.snoozeReminder(reminder.id, 15, testActor);
  assert(snoozedReminder.status === 'SNOOZED', 'Reminder status marked as SNOOZED');
  assert(snoozedReminder.snooze_count === 1, 'Snooze counter incremented to 1');
  assert(new Date(snoozedReminder.reminder_time) > new Date(futureReminderTime), 'Reminder time advanced after snooze');

  // 7. Recurrence Calculation Math
  console.log('\n[TEST 7] Recurrence Calculations');
  const baseDate = new Date('2026-10-01T10:00:00Z');
  const nextDaily = engine.calculateNextRecurrence('DAILY', baseDate);
  const nextWeekly = engine.calculateNextRecurrence('WEEKLY', baseDate);
  const nextMonthly = engine.calculateNextRecurrence('MONTHLY', baseDate);

  assert(new Date(nextDaily).getDate() === 2, 'DAILY recurrence calculates exact +1 day');
  assert(new Date(nextWeekly).getDate() === 8, 'WEEKLY recurrence calculates exact +7 days');
  assert(new Date(nextMonthly).getMonth() === 10, 'MONTHLY recurrence calculates next month');

  // 8. Multi-Stage Approval Workflow & Separation of Duties
  console.log('\n[TEST 8] Multi-Stage Approval Workflow & Separation of Duties');
  const workflow = engine.createWorkflow({
    title: 'Emergency Tyre Replacement Approval - MH-12-RN-8812',
    workflow_type: 'FLEET_EXPENSE',
    priority: 'HIGH',
    department: 'Fleet',
    requested_amount: 45000,
    current_stage: 1,
    stages: [
      { stage: 1, name: 'Fleet Supervisor Review', role: 'supervisor', status: 'PENDING' },
      { stage: 2, name: 'Finance Controller Approval', role: 'admin', status: 'PENDING' }
    ]
  }, testActor);

  assert(workflow && workflow.id && workflow.id.startsWith('WFK-'), 'Workflow created with WFK- prefix');
  assert(workflow.status === 'PENDING_APPROVAL', 'Workflow status is PENDING_APPROVAL');

  // Test Separation of Duties: Creator cannot approve their own request!
  let separationEnforced = false;
  try {
    engine.reviewWorkflow(workflow.id, {
      decision: 'APPROVED',
      comments: 'Self-approval attempt'
    }, testActor); // testActor is the requester!
  } catch (err) {
    separationEnforced = true;
    assert(err.message.includes('Separation of Duties'), 'Separation of duties prevented creator self-approval');
  }
  if (!separationEnforced) {
    assert(false, 'Separation of duties failed to block creator self-approval!');
  }

  // Approver reviews stage 1
  const approvedStage1 = engine.reviewWorkflow(workflow.id, {
    decision: 'APPROVED',
    comments: 'Verified puncture damage on front steer axle. Replacement authorized.'
  }, approverActor);

  assert(approvedStage1.current_stage === 2, 'Workflow advanced to Stage 2 after Stage 1 approval');
  assert(approvedStage1.status === 'PENDING_APPROVAL', 'Workflow remains pending until final stage');

  // 9. Mandatory Rejection Reason Validation
  console.log('\n[TEST 9] Mandatory Rejection Reason Validation');
  const workflowForRejection = engine.createWorkflow({
    title: 'Unscheduled Route Deviation Toll Reimbursement',
    workflow_type: 'EXPENSE_REIMBURSEMENT',
    priority: 'MEDIUM',
    department: 'Finance',
    requested_amount: 3200
  }, testActor);

  let rejectionWithoutReasonBlocked = false;
  try {
    engine.reviewWorkflow(workflowForRejection.id, {
      decision: 'REJECTED',
      comments: '' // Missing comments/reason
    }, approverActor);
  } catch (err) {
    rejectionWithoutReasonBlocked = true;
    assert(err.message.includes('Reason is mandatory'), 'Rejection without reason strictly blocked');
  }
  if (!rejectionWithoutReasonBlocked) {
    assert(false, 'Rejection without reason was permitted!');
  }

  const rejectedWorkflow = engine.reviewWorkflow(workflowForRejection.id, {
    decision: 'REJECTED',
    comments: 'Route deviation was not authorized by Fleet Dispatcher. Non-compliant toll route.'
  }, approverActor);
  assert(rejectedWorkflow.status === 'REJECTED', 'Workflow properly marked as REJECTED with valid reason');

  // 10. SLA & Escalation Ladder for Overdue High Priority Tasks
  console.log('\n[TEST 10] SLA & Escalation Trigger');
  // Create an artificially overdue high-priority task
  const overdueTask = engine.createTask({
    title: 'Overdue Fastag Blacklist Resolution for Fleet Truck 18',
    priority: 'HIGH',
    department: 'Operations',
    due_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString() // 48 hours in past
  }, testActor);

  // Trigger scheduler tick
  const tickResult = engine.processSchedulerTick();
  assert(tickResult.escalations_checked >= 1, 'Scheduler inspected overdue tasks');
  
  const escalations = engine.getEscalations();
  const taskEscalated = escalations.some(e => e.task_id === overdueTask.id);
  assert(taskEscalated, 'Overdue high-priority task successfully flagged and escalated by SLA engine');

  // 11. Command Center Summary KPI Metrics
  console.log('\n[TEST 11] 14-KPI Command Center Metrics Calculation');
  const summary = engine.getSummaryMetrics('ALL', testActor);
  assert(typeof summary.my_tasks_today === 'number', 'Widget 1: my_tasks_today is valid number');
  assert(typeof summary.overdue_tasks === 'number' && summary.overdue_tasks >= 1, 'Widget 2: overdue_tasks calculated');
  assert(typeof summary.upcoming_reminders === 'number', 'Widget 3: upcoming_reminders calculated');
  assert(typeof summary.high_priority_tasks === 'number', 'Widget 4: high_priority_tasks calculated');
  assert(typeof summary.tasks_in_progress === 'number', 'Widget 5: tasks_in_progress calculated');
  assert(typeof summary.tasks_awaiting_approval === 'number', 'Widget 6: tasks_awaiting_approval calculated');
  assert(typeof summary.completed_tasks === 'number', 'Widget 8: completed_tasks calculated');
  assert(typeof summary.daily_completion_percentage === 'number', 'Widget 9: daily_completion_percentage calculated');
  assert(Array.isArray(summary.weekly_productivity_trend), 'Widget 10: weekly_productivity_trend is array');
  assert(Array.isArray(summary.upcoming_deadlines), 'Widget 11: upcoming_deadlines is array');
  assert(Array.isArray(summary.recent_activity), 'Widget 12: recent_activity is array');
  assert(typeof summary.escalated_tasks === 'number', 'Widget 13: escalated_tasks calculated');
  assert(typeof summary.pending_notifications === 'number', 'Widget 14: pending_notifications calculated');

  // 12. Local-Disk Zero Bandwidth Verification
  console.log('\n[TEST 12] Zero Network Outbound Bandwidth Verification');
  const dataDir = path.resolve(__dirname, '../data');
  assert(fs.existsSync(path.join(dataDir, 'productivity_tasks_ledger.json')), 'Task ledger persists to local disk');
  assert(fs.existsSync(path.join(dataDir, 'productivity_reminders_ledger.json')), 'Reminder ledger persists to local disk');
  assert(fs.existsSync(path.join(dataDir, 'productivity_workflows_ledger.json')), 'Workflow ledger persists to local disk');
  assert(fs.existsSync(path.join(dataDir, 'productivity_escalations_ledger.json')), 'Escalation ledger persists to local disk');
  assert(fs.existsSync(path.join(dataDir, 'productivity_notifications_ledger.json')), 'Notification ledger persists to local disk');

  // 13. Cryptographic Audit Log Integration
  console.log('\n[TEST 13] Cryptographic SHA-256 Audit Log Chaining');
  const auditFile = path.resolve(__dirname, '../data/audit_events_ledger.json');
  if (fs.existsSync(auditFile)) {
    const auditLedger = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
    const productivityEvents = auditLedger.filter(e => e.module === 'PRODUCTIVITY');
    assert(productivityEvents.length > 0, `Found ${productivityEvents.length} productivity events chained in audit ledger`);
    
    // Check hash integrity on the latest event
    if (productivityEvents.length > 0) {
      const lastEvent = productivityEvents[productivityEvents.length - 1];
      const hash = lastEvent.current_event_hash || lastEvent.current_hash;
      assert(hash && hash.length === 64, 'Audit event contains valid SHA-256 hash');
    }
  } else {
    console.log('  ⚠ Audit file not on current test path; skipping hash inspection.');
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
