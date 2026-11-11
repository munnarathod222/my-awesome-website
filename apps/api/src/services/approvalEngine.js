/**
 * approvalEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Approval Workflow Builder with Per-Employee Custom Limits.
 *
 * Rules:
 *   - Each employee has customizable limits in employees.approval_limits (JSON):
 *       { max_expense_approval, max_repair_approval, can_approve_rate_changes, designated_approver_id, designated_approver_name }
 *   - Super Admins have unlimited authority (auto-approved).
 *   - If amount <= employee's limit: Status = 'Approved' (Instant).
 *   - If amount > employee's limit:
 *       1. Sets status = 'Pending Approval'.
 *       2. Creates operations_workflows item.
 *       3. Dispatches high-priority task in Task Manager (operations_tasks).
 */

import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

export async function evaluateApproval({
  type, // 'expense' | 'repair' | 'rate_change'
  amount = 0,
  employeeId = '',
  employeeName = '',
  description = '',
  entityId = '',
  truckId = '',
  user = null
}) {
  try {
    const numAmount = Number(amount) || 0;

    // Super admin override: always auto-approved
    if (user && (user.role === 'super_admin' || user.id === 'usr_munna_superadmin')) {
      return {
        requiresApproval: false,
        status: 'Approved',
        reason: 'Super Admin auto-authorized'
      };
    }

    // Default baseline limits if not customized
    let employeeLimits = {
      max_expense_approval: 2000,
      max_repair_approval: 5000,
      can_approve_rate_changes: false,
      designated_approver_id: 'usr_munna_superadmin',
      designated_approver_name: 'Vinod kumar Rathod'
    };

    // If an employeeId is provided, look up their custom approval_limits
    if (employeeId && employeeId !== 'none') {
      try {
        const emp = await pb.collection('employees').getOne(employeeId, { $autoCancel: false }).catch(() => null);
        if (emp && emp.approval_limits) {
          try {
            const parsed = typeof emp.approval_limits === 'string' ? JSON.parse(emp.approval_limits) : emp.approval_limits;
            employeeLimits = { ...employeeLimits, ...parsed };
          } catch (_) {}
        }
        if (emp && !employeeName) {
          employeeName = emp.name || '';
        }
      } catch (e) {
        logger.warn(`[ApprovalEngine] Notice fetching employee ${employeeId}: ${e.message}`);
      }
    }

    let isExceeded = false;
    let limitValue = 0;

    if (type === 'expense') {
      limitValue = Number(employeeLimits.max_expense_approval) || 2000;
      isExceeded = numAmount > limitValue;
    } else if (type === 'repair') {
      limitValue = Number(employeeLimits.max_repair_approval) || 5000;
      isExceeded = numAmount > limitValue;
    } else if (type === 'rate_change') {
      isExceeded = !employeeLimits.can_approve_rate_changes;
    }

    if (!isExceeded) {
      return {
        requiresApproval: false,
        status: 'Approved',
        reason: `Within employee authorized limit (₹${limitValue.toLocaleString('en-IN')})`
      };
    }

    // Threshold exceeded: create workflow and task in Task Manager
    const approverId = employeeLimits.designated_approver_id || 'usr_munna_superadmin';
    const approverName = employeeLimits.designated_approver_name || 'Vinod kumar Rathod';
    const workflowNumber = `WF-${Date.now().toString(36).toUpperCase()}`;

    // 1. Create operations_workflows record
    let workflowRecord = null;
    try {
      workflowRecord = await pb.collection('operations_workflows').create({
        workflow_number: workflowNumber,
        workflow_type: type === 'expense' ? 'Expense Approval' : (type === 'repair' ? 'Repair Approval' : 'Rate Change Approval'),
        title: `${type.toUpperCase()}: ₹${numAmount.toLocaleString('en-IN')} by ${employeeName || 'Staff'}`,
        description: description || `Submission exceeds authorized threshold of ₹${limitValue.toLocaleString('en-IN')}. Requires authorization.`,
        amount: numAmount,
        status: 'Pending',
        requested_by_id: employeeId || (user ? user.id : ''),
        requested_by_name: employeeName || (user ? user.name : 'Operations Staff'),
        approver_id: approverId,
        approver_name: approverName,
        related_entity_type: type === 'expense' ? 'expenses' : (type === 'repair' ? 'maintenance_problems' : 'trip_logs'),
        related_entity_id: entityId,
      }, { $autoCancel: false });
    } catch (wfErr) {
      logger.warn(`[ApprovalEngine] Notice creating workflow record: ${wfErr.message}`);
    }

    // 2. Create high-priority task in Task Manager
    try {
      const taskNumber = `APR-${Date.now().toString(36).toUpperCase()}`;
      await pb.collection('operations_tasks').create({
        task_number: taskNumber,
        title: `Authorize ${type.toUpperCase()}: ₹${numAmount.toLocaleString('en-IN')} (${employeeName || 'Staff'})`,
        description: `Approval required for ${type} of ₹${numAmount.toLocaleString('en-IN')} submitted by ${employeeName || 'Staff'}. Exceeds staff threshold of ₹${limitValue.toLocaleString('en-IN')}. ${description}`,
        category: type === 'expense' ? 'Billing & Accounts' : (type === 'repair' ? 'Maintenance & Workshop' : 'Dispatch & Trips'),
        department: type === 'repair' ? 'Maintenance' : 'Accounts',
        priority: numAmount > 20000 ? 'Critical' : 'High',
        status: 'Pending',
        assigned_to_id: approverId,
        assigned_to_name: approverName,
        accountable_owner_id: approverId,
        accountable_owner_name: approverName,
        related_entity_type: type === 'expense' ? 'expenses' : (type === 'repair' ? 'maintenance_problems' : 'trip_logs'),
        related_entity_id: entityId,
      }, { $autoCancel: false });
      logger.info(`[ApprovalEngine] Created approval task ${taskNumber} assigned to ${approverName} for ₹${numAmount}`);
    } catch (taskErr) {
      logger.warn(`[ApprovalEngine] Notice creating approval task: ${taskErr.message}`);
    }

    return {
      requiresApproval: true,
      status: 'Pending Approval',
      workflowNumber,
      approverName,
      limitValue
    };
  } catch (err) {
    logger.error(`[ApprovalEngine Error] ${err.message}`);
    return {
      requiresApproval: false,
      status: 'Approved',
      reason: 'Failsafe baseline authorization'
    };
  }
}
