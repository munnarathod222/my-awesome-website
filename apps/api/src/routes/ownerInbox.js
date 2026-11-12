/**
 * ownerInbox.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Owner Inbox - Consolidated Executive Command Center Backend.
 *
 * Unifies:
 *   1. Financial & Operational Approvals (operations_workflows)
 *   2. In-Transit Delays & Vehicle Breakdown Exceptions (trip_logs, operations_tasks, maintenance_problems)
 *   3. Strategic Decisions (Pending high-value quotes, employee exit clearances)
 */

import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { ingestEvent } from '../services/auditService.js';

const router = express.Router();

// GET /api/owner-inbox/feed
router.get('/feed', async (req, res) => {
  try {
    const now = new Date();
    const nowMs = now.getTime();

    // 1. Fetch Pending Workflows (Approvals)
    const pendingWorkflows = await pb.collection('operations_workflows').getFullList({
      filter: 'status = "Pending"',
      sort: '-created',
      $autoCancel: false,
    }).catch(() => []);

    // 2. Fetch Operational Exceptions (Delayed trips > 45m & Breakdowns)
    const inTransitTrips = await pb.collection('trip_logs').getFullList({
      filter: 'trip_status = "In Transit" || trip_status = "Dispatched"',
      sort: '-date',
      $autoCancel: false,
    }).catch(() => []);

    const delayedTrips = inTransitTrips.filter(t => {
      if (!t.delivery_eta) return false;
      const etaMs = new Date(t.delivery_eta).getTime();
      return !isNaN(etaMs) && (nowMs - etaMs) >= (45 * 60 * 1000); // 45m delay grace
    });

    const openBreakdowns = await pb.collection('maintenance_problems').getFullList({
      filter: 'status = "Open"',
      sort: '-created',
      $autoCancel: false,
    }).catch(() => []);

    const escalatedTasks = await pb.collection('operations_tasks').getFullList({
      filter: 'escalation_level != "" && status != "Completed"',
      sort: '-priority',
      $autoCancel: false,
    }).catch(() => []);

    // 3. Fetch Decisions (Pending Quotes & Exit Audits)
    const pendingQuotes = await pb.collection('quotes').getFullList({
      filter: 'status = "Pending" || status = "Draft" || status = "Requested"',
      sort: '-created',
      $autoCancel: false,
    }).catch(() => []);

    // Build unified feed items
    const feed = [];

    // Map Workflows to Approvals
    pendingWorkflows.forEach(wf => {
      const isCritical = Number(wf.amount || 0) > 25000;
      feed.push({
        id: wf.id,
        itemType: 'APPROVAL',
        category: wf.workflow_type || 'Approval Request',
        urgency: isCritical ? 'Critical' : 'High',
        title: wf.title || `Authorize ${wf.workflow_type || 'Expense'}: ₹${Number(wf.amount || 0).toLocaleString('en-IN')}`,
        subtitle: wf.description || `Exceeds authorized staff threshold. Requires sign-off.`,
        amount: Number(wf.amount || 0),
        requesterName: wf.requested_by_name || 'Operations Staff',
        requesterPhone: wf.requested_by_phone || '',
        approverName: wf.approver_name || 'Vinod Kumar Rathod',
        timestamp: wf.created || wf.requested_at || new Date().toISOString(),
        relatedEntityType: wf.related_entity_type || 'expenses',
        relatedEntityId: wf.related_entity_id || '',
        workflowId: wf.id,
        workflowNumber: wf.workflow_number,
        actions: ['APPROVE', 'REJECT', 'WHATSAPP']
      });
    });

    // Map Delayed Trips to Exceptions
    delayedTrips.forEach(trip => {
      const etaMs = new Date(trip.delivery_eta).getTime();
      const delayMinutes = Math.round((nowMs - etaMs) / (60 * 1000));
      const isCritical = delayMinutes >= 180;
      feed.push({
        id: `delay_${trip.id}`,
        itemType: 'EXCEPTION',
        category: 'In-Transit ETA Breach',
        urgency: isCritical ? 'Critical' : 'High',
        title: `${isCritical ? '🔥 CRITICAL DELAY' : '⚡ DELAY ALERT'}: ${trip.route || 'Shipment'} (${trip.truck_number || ''})`,
        subtitle: `Shipment is delayed by ${delayMinutes} mins beyond delivery ETA. Driver: ${trip.driver_name || 'N/A'}.`,
        amount: Number(trip.revenue || 0),
        requesterName: trip.driver_name || 'Assigned Driver',
        requesterPhone: trip.driver_phone || '',
        timestamp: trip.delivery_eta,
        relatedEntityType: 'trip_logs',
        relatedEntityId: trip.id,
        actions: ['CALL_DRIVER', 'WHATSAPP', 'DISMISS']
      });
    });

    // Map Open Breakdowns to Exceptions
    openBreakdowns.forEach(prob => {
      feed.push({
        id: `mnt_${prob.id}`,
        itemType: 'EXCEPTION',
        category: 'Vehicle Breakdown',
        urgency: 'Critical',
        title: `UNRESOLVED BREAKDOWN: Truck ${prob.truck_number || prob.truck_id || 'Fleet'}`,
        subtitle: prob.description || `Mechanical issue open without workshop closure. Assign job card.`,
        amount: Number(prob.estimated_cost || 0),
        requesterName: prob.driver_name || 'Fleet Operator',
        requesterPhone: prob.driver_phone || '',
        timestamp: prob.created || prob.date_reported || new Date().toISOString(),
        relatedEntityType: 'maintenance_problems',
        relatedEntityId: prob.id,
        actions: ['ASSIGN_WORKSHOP', 'WHATSAPP', 'DISMISS']
      });
    });

    // Map Pending Quotes to Decisions
    pendingQuotes.forEach(q => {
      const qAmount = Number(q.total_amount || q.amount || q.rate || 0);
      feed.push({
        id: `quote_${q.id}`,
        itemType: 'DECISION',
        category: 'Customer Quotation',
        urgency: qAmount > 50000 ? 'High' : 'Normal',
        title: `Quotation Review: ${q.customer_name || 'Client'} (₹${qAmount.toLocaleString('en-IN')})`,
        subtitle: `Route: ${q.origin || 'Origin'} -> ${q.destination || 'Destination'}. Vehicle: ${q.truck_size || '32ft Container'}.`,
        amount: qAmount,
        requesterName: q.customer_name || 'Customer Lead',
        requesterPhone: q.contact_number || q.customer_phone || '',
        timestamp: q.created || new Date().toISOString(),
        relatedEntityType: 'quotes',
        relatedEntityId: q.id,
        actions: ['APPROVE_QUOTE', 'CONVERT_TRIP', 'WHATSAPP']
      });
    });

    // Sort: Critical first, then High, then Normal, newest first
    const urgencyOrder = { Critical: 3, High: 2, Normal: 1 };
    feed.sort((a, b) => {
      const uDiff = (urgencyOrder[b.urgency] || 1) - (urgencyOrder[a.urgency] || 1);
      if (uDiff !== 0) return uDiff;
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    const pendingApprovalsAmount = pendingWorkflows.reduce((sum, wf) => sum + Number(wf.amount || 0), 0);

    const summary = {
      totalActionable: feed.length,
      pendingApprovalsCount: pendingWorkflows.length,
      pendingApprovalsAmount,
      activeExceptionsCount: delayedTrips.length + openBreakdowns.length,
      decisionsCount: pendingQuotes.length
    };

    res.json({ success: true, summary, feed });
  } catch (err) {
    logger.error(`[OwnerInbox Error] ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/owner-inbox/action
router.post('/action', async (req, res) => {
  try {
    const { actionType, itemId, workflowId, reason, actor } = req.body;
    const actorName = actor?.name || 'Vinod Kumar Rathod';
    const actorId = actor?.id || 'usr_vinod_admin';

    if (actionType === 'APPROVE_WORKFLOW') {
      const wf = await pb.collection('operations_workflows').getOne(workflowId || itemId, { $autoCancel: false });
      if (wf) {
        await pb.collection('operations_workflows').update(wf.id, {
          status: 'Approved',
          approved_at: new Date().toISOString(),
          decision_notes: reason || 'Approved by Executive Owner'
        }, { $autoCancel: false });

        // Update underlying entity if it was an expense
        if (wf.related_entity_type === 'expenses' && wf.related_entity_id) {
          await pb.collection('expenses').update(wf.related_entity_id, {
            status: 'Approved'
          }, { $autoCancel: false }).catch(() => {});
        }

        // Close associated task in Task Manager
        const tasks = await pb.collection('operations_tasks').getFullList({
          filter: `related_entity_id = "${wf.related_entity_id}" && status != "Completed"`,
          $autoCancel: false
        }).catch(() => []);
        for (const t of tasks) {
          await pb.collection('operations_tasks').update(t.id, {
            status: 'Completed',
            completed_at: new Date().toISOString()
          }, { $autoCancel: false }).catch(() => {});
        }

        ingestEvent({
          action: 'APPROVAL_GRANTED',
          module: 'FINANCE',
          entity_type: wf.related_entity_type || 'WORKFLOW',
          entity_id: wf.related_entity_id || wf.id,
          details: `Workflow ${wf.workflow_number || wf.id} (₹${Number(wf.amount || 0).toLocaleString('en-IN')}) authorized by ${actorName}.`,
          actor: { id: actorId, name: actorName, role: 'superuser' },
          new_values: { status: 'Approved', amount: wf.amount }
        });
      }
      return res.json({ success: true, message: 'Workflow approved & authorized successfully' });
    }

    if (actionType === 'REJECT_WORKFLOW') {
      const wf = await pb.collection('operations_workflows').getOne(workflowId || itemId, { $autoCancel: false });
      if (wf) {
        await pb.collection('operations_workflows').update(wf.id, {
          status: 'Rejected',
          approved_at: new Date().toISOString(),
          decision_notes: reason || 'Declined by Executive Owner'
        }, { $autoCancel: false });

        if (wf.related_entity_type === 'expenses' && wf.related_entity_id) {
          await pb.collection('expenses').update(wf.related_entity_id, {
            status: 'Rejected'
          }, { $autoCancel: false }).catch(() => {});
        }

        ingestEvent({
          action: 'APPROVAL_REJECTED',
          module: 'FINANCE',
          entity_type: wf.related_entity_type || 'WORKFLOW',
          entity_id: wf.related_entity_id || wf.id,
          details: `Workflow ${wf.workflow_number || wf.id} rejected by ${actorName}. Reason: ${reason || 'N/A'}`,
          actor: { id: actorId, name: actorName, role: 'superuser' },
          new_values: { status: 'Rejected', reason }
        });
      }
      return res.json({ success: true, message: 'Workflow rejected' });
    }

    res.status(400).json({ success: false, error: 'Unknown actionType' });
  } catch (err) {
    logger.error(`[OwnerInbox Action Error] ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
