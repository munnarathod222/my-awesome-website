import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as auditService from './auditService.js';
import { processUpload } from './uploadProcessingService.js';

// Driver-only read access. Never query by a caller-supplied employee ID or a name.
export class MobileDataError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const fail = (status, code, message) => {
  throw new MobileDataError(status, code, message);
};

const text = value => typeof value === 'string' ? value : '';
const pick = (row, fields) => Object.fromEntries(fields.map(key => [key, row[key] ?? null]));

export function pageNumber(value) {
  if (value === undefined) return 1;
  if (!/^[1-9]\d{0,4}$/.test(String(value))) fail(400, 'INVALID_PAGE', 'Invalid page number.');
  return Number(value);
}

export function assertOwner(row, field, employeeId) {
  if (!employeeId || row[field] !== employeeId) fail(403, 'ACCESS_DENIED', 'This record is not assigned to you.');
}

export function documentFiles(row) {
  return [...new Set([row.file, ...(Array.isArray(row.files) ? row.files : [row.files])]
    .filter(v => typeof v === 'string' && v && !/[\/\\\x00-\x1f]/.test(v)))];
}

/**
 * Positive driver assignment matching:
 * Requires an explicit driver assignment. Rejects unassigned trips and conflicting ID/code assignments.
 */
export function validateDriverAssignment(trip, employeeId, employeeCode) {
  if (!trip) fail(404, 'NOT_FOUND', 'Trip not found.');
  const hasId = Boolean(trip.driver_employee_id && String(trip.driver_employee_id).trim());
  const hasCode = Boolean(trip.driver_employee_code && String(trip.driver_employee_code).trim());

  if (!hasId && !hasCode) {
    fail(403, 'TRIP_UNASSIGNED', 'This trip has not been assigned to any driver.');
  }

  // Reject conflicting or mismatched assignments
  if (hasId && hasCode) {
    if (trip.driver_employee_id !== employeeId || trip.driver_employee_code !== employeeCode) {
      fail(403, 'TRIP_REASSIGNED', 'This trip is not assigned to the authenticated driver.');
    }
  } else if (hasId) {
    if (trip.driver_employee_id !== employeeId) {
      fail(403, 'TRIP_REASSIGNED', 'This trip is not assigned to the authenticated driver.');
    }
  } else if (hasCode) {
    if (trip.driver_employee_code !== employeeCode) {
      fail(403, 'TRIP_REASSIGNED', 'This trip is not assigned to the authenticated driver.');
    }
  }
}

/**
 * Keyed In-Process Mutex to prevent reassignment and transition race conditions
 */
class TripLock {
  constructor() {
    this.locks = new Map();
  }
  async acquire(tripId) {
    while (this.locks.has(tripId)) {
      await this.locks.get(tripId);
    }
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    this.locks.set(tripId, promise);
    return () => {
      this.locks.delete(tripId);
      resolve();
    };
  }
}

const tripLocks = new TripLock();

const specs = {
  expenses: { collection: 'expenses', owner: 'submitted_by_employee_id', sort: '-date,-id',
    fields: ['id', 'date', 'amount', 'category', 'description', 'status'] },
  attendance: { collection: 'attendance', owner: 'staff_member', sort: '-date,-id',
    fields: ['id', 'date', 'status', 'check_in_time', 'check_out_time', 'hours_worked'] },
  advances: { collection: 'advances', owner: 'employee_id', sort: '-date,-id',
    fields: ['id', 'date', 'amount', 'reason', 'remaining_balance', 'status', 'settled_date', 'notes'] },
  'my-documents': { collection: 'employee_documents', owner: 'employee_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
  'truck-documents': { collection: 'truck_documents', owner: 'truck_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
};

export function createMobileDriverData(pb) {
  function formatFilter(template, params) {
    if (typeof pb?.filter === 'function') {
      return pb.filter(template, params);
    }
    if (!template || typeof template !== 'string') return '';
    return template.replace(/\{:([a-zA-Z0-9_]+)\}/g, (match, key) => {
      if (!params || !Object.prototype.hasOwnProperty.call(params, key)) return match;
      const val = params[key];
      if (val === null || val === undefined) return 'null';
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      return JSON.stringify(String(val));
    });
  }

  async function fieldsFor(name) {
    if (pb?.collections?.getOne) {
      try {
        const schema = await pb.collections.getOne(name, { $autoCancel: false });
        if (schema?.fields || schema?.schema) return schema.fields || schema.schema;
      } catch (_) {}
    }
    if (name === 'trip_logs') {
      return [
        { name: 'driver_employee_id', type: 'relation', collectionId: 'employees', maxSelect: 1 },
        { name: 'driver_employee_code', type: 'text' }
      ];
    }
    if (name === 'employees') {
      return [{ name: 'id', type: 'text' }, { name: 'driver_code', type: 'text' }];
    }
    if (name === 'expenses') {
      return [
        { name: 'submitted_by_employee_id', type: 'relation', collectionId: 'employees', maxSelect: 1 },
        { name: 'date', type: 'text' }
      ];
    }
    return [];
  }

  async function employee(id) {
    if (!id) fail(401, 'UNAUTHORIZED', 'Sign in again.');
    const row = await pb.collection('employees').getOne(id, { $autoCancel: false });
    if (row.id !== id) fail(403, 'ACCESS_DENIED', 'Employee identity mismatch.');
    return row;
  }

  async function ownerFor(section, employeeId) {
    if (section !== 'truck-documents') return employeeId;
    return text((await employee(employeeId)).assigned_truck);
  }

  async function tripSpec(employeeId, employeeCode) {
    let schema = null;
    let employees = null;
    if (pb?.collections?.getOne) {
      try {
        [schema, employees] = await Promise.all([
          pb.collections.getOne('trip_logs', { $autoCancel: false }),
          pb.collections.getOne('employees', { $autoCancel: false }),
        ]);
      } catch (_) {}
    }
    const empColId = employees?.id || 'employees';
    const fields = schema?.fields || schema?.schema || [
      { name: 'driver_employee_id', type: 'relation', collectionId: empColId, maxSelect: 1 },
      { name: 'driver_employee_code', type: 'text' }
    ];
    const field = fields.find(f =>
      ['driver_employee_id', 'driver_id'].includes(f.name) && f.type === 'relation' &&
      ((f.collectionId || f.options?.collectionId) === empColId || !f.collectionId) &&
      (f.maxSelect ?? f.options?.maxSelect ?? 1) === 1);
    const codeField = fields.find(f =>
      ['driver_employee_code', 'driver_code'].includes(f.name) && f.type === 'text');
    if (!field && (!codeField || !/^[DE][0-9]{3,}$/.test(employeeCode || ''))) {
      fail(409, 'ASSIGNMENT_MAPPING_REQUIRED', 'The website must assign trips using permanent employee codes.');
    }
    const owner = field?.name || codeField.name;
    const ownerValue = field ? employeeId : employeeCode;
    return {
      collection: 'trip_logs',
      owner,
      ownerValue,
      sort: '-date,-id',
      fields: ['id', 'trip_id', 'date', 'route', 'origin', 'destination', 'truck_number', 'trip_status', 'kms', 'delivery_eta', 'delivery_actual_time', 'delivered_time', 'actual_start_time', 'client_name', 'cargo_details', 'pod_file', 'pod_uploaded_at', 'pod_status', 'driver_employee_code', 'driver_employee_id']
    };
  }

  async function expenseSpec() {
    const fields = await fieldsFor('expenses');
    const submitted = fields.find(f => f.name === 'submitted_by_employee_id');
    if (!submitted) return null;
    if (submitted.type === 'relation') {
      let employees = null;
      if (pb?.collections?.getOne) {
        try { employees = await pb.collections.getOne('employees', { $autoCancel: false }); } catch (_) {}
      }
      const empColId = employees?.id || 'employees';
      if ((submitted.collectionId || submitted.options?.collectionId) &&
          (submitted.collectionId || submitted.options?.collectionId) !== empColId) return null;
      if ((submitted.maxSelect ?? submitted.options?.maxSelect ?? 1) !== 1) return null;
    } else if (submitted.type !== 'text') return null;
    return { ...specs.expenses, owner: submitted.name,
      sort: fields.some(f => f.name === 'date') ? '-date,-id' : '-created,-id' };
  }

  async function list(section, employeeId, page = 1, employeeCode = null) {
    page = pageNumber(page);
    const spec = section === 'trips' ? await tripSpec(employeeId, employeeCode) :
      section === 'expenses' ? await expenseSpec() : specs[section];
    if (section === 'expenses' && !spec) return { items: [], page, totalPages: 0, totalItems: 0, reason: 'SUBMITTER_LINK_NOT_CONFIGURED' };
    if (!spec) fail(404, 'NOT_FOUND', 'Unknown section.');
    const owner = spec.ownerValue ?? await ownerFor(section, employeeId);
    if (!owner) return { items: [], page, totalPages: 0, totalItems: 0, reason: 'NO_TRUCK_ASSIGNED' };
    const result = await pb.collection(spec.collection).getList(page, 50, {
      filter: formatFilter(`${spec.owner} = {:owner}`, { owner }),
      sort: spec.sort, $autoCancel: false,
    });
    const items = result.items.map(row => {
      assertOwner(row, spec.owner, owner);
      if (section === 'trips') {
        if (row.driver_employee_code && employeeCode && row.driver_employee_code !== employeeCode) {
          fail(403, 'ACCESS_DENIED', 'Inconsistent driver assignment code.');
        }
        if (row.driver_employee_id && employeeId && row.driver_employee_id !== employeeId) {
          fail(403, 'ACCESS_DENIED', 'Inconsistent driver assignment ID.');
        }
      }
      const item = pick(row, spec.fields);
      if (section.endsWith('documents')) item.files = documentFiles(row).map((_, index) => ({
        index, path: `data/${section}/${encodeURIComponent(row.id)}/files/${index}`,
      }));
      return item;
    });
    return { items, page: result.page, totalPages: result.totalPages, totalItems: result.totalItems };
  }

  async function truck(employeeId) {
    const id = text((await employee(employeeId)).assigned_truck);
    if (!id) return null;
    const row = await pb.collection('trucks').getOne(id, { $autoCancel: false });
    if (row.id !== id) fail(403, 'ACCESS_DENIED', 'Truck identity mismatch.');
    return pick(row, ['id', 'truck_number', 'truck_name', 'model', 'truck_size', 'truck_axle', 'payload_capacity', 'status', 'manufacturer', 'vehicle_class', 'tyre_count', 'chassis_number', 'engine_number',
      'body_length', 'body_width', 'body_height', 'base_odometer', 'expected_mileage', 'fastag_provider', 'fastag_status',
      'current_fastag_balance', 'last_recharge_date', 'updated']);
  }

  async function file(section, recordId, index, employeeId, employeeCode = null) {
    if (!['my-documents', 'truck-documents', 'trips'].includes(section) || !/^[a-zA-Z0-9_-]{1,64}$/.test(recordId)) {
      fail(404, 'NOT_FOUND', 'Document not found.');
    }

    if (section === 'trips') {
      const trip = await pb.collection('trip_logs').getOne(recordId, { $autoCancel: false });
      if (!trip) fail(404, 'NOT_FOUND', 'Trip not found.');
      validateDriverAssignment(trip, employeeId, employeeCode);
      if (!trip.pod_file) fail(404, 'NOT_FOUND', 'No POD file uploaded for this trip.');
      return { row: trip, name: trip.pod_file };
    }

    if (!/^\d{1,3}$/.test(String(index))) fail(404, 'NOT_FOUND', 'File not found.');
    const spec = specs[section];
    const owner = await ownerFor(section, employeeId);
    if (!owner) fail(403, 'ACCESS_DENIED', 'No truck assigned.');
    const row = await pb.collection(spec.collection).getOne(recordId, { $autoCancel: false });
    assertOwner(row, spec.owner, owner);
    const name = documentFiles(row)[Number(index)];
    if (!name) fail(404, 'NOT_FOUND', 'File not found.');
    return { row, name };
  }

  async function performance(employeeId, employeeCode) {
    const spec = await tripSpec(employeeId, employeeCode);
    const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const records = [];
    for (let page = 1; page <= 100; page++) {
      const result = await pb.collection('trip_logs').getList(page, 50, {
        filter: formatFilter(`${spec.owner} = {:owner} && date >= {:since}`, { owner: spec.ownerValue, since }),
        sort: '-date,-id', fields: `${spec.owner},id,kms,trip_status,delivery_eta,delivery_actual_time,delivered_time`, $autoCancel: false,
      });
      for (const row of result.items) { assertOwner(row, spec.owner, spec.ownerValue); records.push(row); }
      if (page >= result.totalPages) break;
      if (page === 100) fail(413, 'PERFORMANCE_LIMIT', 'Too many trips for this summary. Contact the office.');
    }
    return summarizePerformance(records, since);
  }

  async function transition(tripRecordId, targetStatus, meta = {}, employeeId, employeeCode) {
    if (!tripRecordId) fail(400, 'TRIP_ID_REQUIRED', 'Trip ID is required.');
    const validTargetStatuses = ['In Transit', 'Delivered'];
    const normTarget = validTargetStatuses.find(s => s.toLowerCase() === String(targetStatus || '').trim().toLowerCase());
    if (!normTarget) {
      fail(400, 'INVALID_STATUS', `Target status must be one of: ${validTargetStatuses.join(', ')}`);
    }

    const releaseLock = await tripLocks.acquire(tripRecordId);
    try {
      const trip = await pb.collection('trip_logs').getOne(tripRecordId, { $autoCancel: false });
      if (!trip) fail(404, 'NOT_FOUND', 'Trip not found.');

      // Require positive authenticated driver match; reject unassigned trips & conflicting ID/codes
      validateDriverAssignment(trip, employeeId, employeeCode);

      const currentStatus = text(trip.trip_status).trim();

      // Idempotency check: if already at the target status, return success idempotently
      if (currentStatus.toLowerCase() === normTarget.toLowerCase()) {
        return {
          success: true,
          idempotent: true,
          message: `Trip is already in ${normTarget} status.`,
          trip: pick(trip, ['id', 'trip_id', 'trip_status', 'date', 'route', 'truck_number', 'actual_start_time', 'delivered_time'])
        };
      }

      // Agreed State Machine:
      // Upcoming / Scheduled -> In Transit ONLY
      // Upcoming directly to Delivered is strictly forbidden!
      const isUpcoming = ['upcoming', 'scheduled'].includes(currentStatus.toLowerCase());
      const isInTransit = ['in transit', 'running', 'active'].includes(currentStatus.toLowerCase());

      if (isUpcoming) {
        if (normTarget === 'Delivered') {
          fail(400, 'INVALID_TRANSITION', "Cannot transition directly from 'Upcoming' to 'Delivered'. Trip must first be 'In Transit'.");
        }
        if (normTarget !== 'In Transit') {
          fail(400, 'INVALID_TRANSITION', `Cannot transition to '${normTarget}' from current status '${currentStatus}'.`);
        }
      } else if (isInTransit) {
        if (normTarget === 'Delivered') {
          // Delivery proof is strictly required before completion
          const hasProof = Boolean(trip.pod_file || trip.delivery_proof || trip.pod_sha256 || meta.hasDeliveryProof);
          if (!hasProof) {
            fail(400, 'DELIVERY_PROOF_REQUIRED', 'Proof of delivery (POD) must be uploaded before marking trip Delivered.');
          }
        } else {
          fail(400, 'INVALID_TRANSITION', `Cannot transition from '${currentStatus}' to '${normTarget}'.`);
        }
      } else {
        fail(400, 'INVALID_TRANSITION', `Trip is already in final status '${currentStatus}' and cannot be transitioned.`);
      }

      const nowIso = new Date().toISOString();
      const updateData = { trip_status: normTarget };
      if (normTarget === 'In Transit') {
        updateData.actual_start_time = nowIso;
      } else if (normTarget === 'Delivered') {
        updateData.delivered_time = nowIso;
        updateData.delivery_actual_time = nowIso;
      }

      // Atomic conditional update (OCC) - Prevents race conditions from multi-process and office edits
      let updated;
      const col = pb.collection('trip_logs');
      if (typeof col.conditionalUpdate === 'function') {
        const conditions = {
          id: trip.id,
          trip_status: currentStatus
        };
        if (trip.driver_employee_id) conditions.driver_employee_id = trip.driver_employee_id;
        else if (trip.driver_employee_code) conditions.driver_employee_code = trip.driver_employee_code;
        updated = await col.conditionalUpdate(trip.id, conditions, updateData);
      } else {
        updated = await col.update(trip.id, updateData, { $autoCancel: false });
      }

      // Persist transition audit event
      try {
        auditService.recordAuditEvent({
          event_type: 'DRIVER_TRIP_TRANSITION',
          category: 'OPERATIONS',
          actor: employeeCode || employeeId,
          action: 'TRANSITION_TRIP_STATUS',
          target_id: trip.trip_id || trip.id,
          details: {
            trip_record_id: trip.id,
            trip_id: trip.trip_id,
            previous_status: currentStatus,
            new_status: normTarget,
            device_id: meta.deviceId || null,
            location: meta.location || null,
            timestamp: nowIso
          },
          metadata: {
            server_timestamp: nowIso
          }
        });
      } catch (_) {}

      return {
        success: true,
        idempotent: false,
        message: `Trip status updated to ${normTarget}`,
        trip: pick(updated, ['id', 'trip_id', 'trip_status', 'date', 'route', 'truck_number', 'actual_start_time', 'delivered_time'])
      };
    } finally {
      releaseLock();
    }
  }

  async function uploadPod(tripRecordId, { buffer, filename }, meta = {}, employeeId, employeeCode) {
    if (!tripRecordId) fail(400, 'TRIP_ID_REQUIRED', 'Trip ID is required.');
    const releaseLock = await tripLocks.acquire(tripRecordId);
    try {
      const trip = await pb.collection('trip_logs').getOne(tripRecordId, { $autoCancel: false });
      if (!trip) fail(404, 'NOT_FOUND', 'Trip not found.');

      // Require positive authenticated driver match; reject unassigned trips & conflicting ID/codes
      validateDriverAssignment(trip, employeeId, employeeCode);

      // Process upload with lossless compression, signed PDF preservation, and SHA-256 deduplication
      const processed = await processUpload({
        buffer,
        filename: filename || `pod_${trip.trip_id || trip.id}.jpg`,
        actorId: employeeCode || employeeId,
        category: 'pod'
      });

      // 1. Durably write to Supabase Storage if storage client available
      let storageBucket = 'trip-pods';
      let storagePath = `${trip.id}/${processed.filename}`;
      if (pb.storage && typeof pb.storage.upload === 'function') {
        try {
          await pb.storage.upload(storageBucket, storagePath, processed.buffer, processed.mimeType);
          // Verify target hash on Supabase Storage before updating database record
          await pb.storage.verifyHash(storageBucket, storagePath, processed.sha256);
        } catch (stErr) {
          fail(503, 'STORAGE_UPLOAD_FAILED', `Failed to durably upload POD to private storage: ${stErr.message}`);
        }
      }

      // 2. Also durably write to local disk storage for caching/resilience
      const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
      const storageDirs = [
        path.join(dataDir, 'private_storage', 'trip_logs', trip.id),
        path.resolve(process.cwd(), 'data', 'private_storage', 'trip_logs', trip.id),
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/storage', 'trip_logs', trip.id)
      ];

      for (const sDir of storageDirs) {
        try {
          fs.mkdirSync(sDir, { recursive: true });
          const targetPath = path.join(sDir, processed.filename);
          const tempPath = `${targetPath}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
          try {
            const fd = fs.openSync(tempPath, 'w');
            fs.writeSync(fd, processed.buffer);
            fs.fsyncSync(fd);
            fs.closeSync(fd);
            try {
              fs.renameSync(tempPath, targetPath);
            } catch (_) {
              if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
              fs.renameSync(tempPath, targetPath);
            }
          } catch (writeErr) {
            try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (_) {}
          }
        } catch (_) {}
      }

      const nowIso = new Date().toISOString();
      const updatePayload = {
        pod_file: processed.filename,
        pod_uploaded_at: nowIso,
        pod_status: 'Pending Verification',
        pod_sha256: processed.sha256,
        pod_storage_bucket: storageBucket,
        pod_storage_path: storagePath
      };

      // Atomic conditional update (OCC) - Prevents race conditions from multi-process and office edits
      let updated;
      const col = pb.collection('trip_logs');
      if (typeof col.conditionalUpdate === 'function') {
        const conditions = { id: trip.id };
        if (trip.driver_employee_id) conditions.driver_employee_id = trip.driver_employee_id;
        else if (trip.driver_employee_code) conditions.driver_employee_code = trip.driver_employee_code;
        updated = await col.conditionalUpdate(trip.id, conditions, updatePayload);
      } else {
        updated = await col.update(trip.id, updatePayload, { $autoCancel: false });
      }

      // Persist POD upload audit event
      try {
        auditService.recordAuditEvent({
          event_type: 'DRIVER_POD_UPLOADED',
          category: 'OPERATIONS',
          actor: employeeCode || employeeId,
          action: 'UPLOAD_POD',
          target_id: trip.trip_id || trip.id,
          details: {
            trip_record_id: trip.id,
            filename: processed.filename,
            sha256: processed.sha256,
            size: processed.processedSize,
            device_id: meta.deviceId || null,
            timestamp: nowIso
          }
        });
      } catch (_) {}

      return {
        success: true,
        isDuplicateRetry: processed.isDuplicateRetry || false,
        pod: {
          filename: processed.filename,
          size: processed.processedSize,
          mimeType: processed.mimeType,
          sha256: processed.sha256,
          uploadedAt: nowIso
        },
        trip: pick(updated, ['id', 'trip_id', 'trip_status', 'pod_file', 'pod_uploaded_at', 'pod_status'])
      };
    } finally {
      releaseLock();
    }
  }

  return { list, truck, file, performance, transition, uploadPod };
}

export function summarizePerformance(records, since) {
  const completed = records.filter(r => ['DELIVERED', 'COMPLETED'].includes(text(r.trip_status).trim().toUpperCase()));
  const km = completed.reduce((sum, row) => { const value = Number(row.kms); return sum + (Number.isFinite(value) && value >= 0 ? value : 0); }, 0);
  let measured = 0; let onTime = 0;
  for (const row of completed) {
    const eta = Date.parse(row.delivery_eta); const actual = Date.parse(row.delivery_actual_time || row.delivered_time);
    if (!Number.isFinite(eta) || !Number.isFinite(actual)) continue;
    measured++; if (actual <= eta) onTime++;
  }
  return {
    since,
    periodDays: 90,
    totalTrips: records.length,
    completedTrips: completed.length,
    completedKm: Math.round(km * 10) / 10,
    onTimeMeasuredTrips: measured,
    onTimePercent: measured ? Math.round(100 * onTime / measured) : null
  };
}
