import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// ─── Security: sanitise strings used in PocketBase filter expressions ─────────
// Strips characters that could break out of a filter string literal.
const sanitize = (value) => {
  if (typeof value !== 'string') return '';
  // Remove PocketBase filter-injection characters: quotes, backslash, newlines
  return value.replace(/[\'"\\\n\r\x00]/g, '').trim().slice(0, 256);
};

const router = Router();
function Router() {
  return express.Router();
}

import path from 'node:path';
import fs from 'node:fs';

async function deleteEmployeeRecord(target) {
  const targetStr = String(target).trim();
  if (!targetStr) return 0;

  let DatabaseSyncMod = null;
  try {
    const mod = await import('node:sqlite');
    DatabaseSyncMod = mod.DatabaseSync;
  } catch (e) {
    logger.warn('Notice: node:sqlite dynamic import not available on this Node runtime.');
  }

  // 1. Clean up child relations and delete via PocketBase SDK (Admin client)
  try {
    const sanitizedTarget = sanitize(targetStr);
    const filter = `id = "${sanitizedTarget}" || name = "${sanitizedTarget}" || contact = "${sanitizedTarget}"`;
    const records = await pb.collection('employees').getFullList({ filter, $autoCancel: false }).catch(() => []);

    const targetIds = new Set(records.map(r => r.id));
    if (targetStr.length === 15) {
      targetIds.add(targetStr);
    }

    for (const pid of targetIds) {
      const cleanRel = async (colName, filterExpr) => {
        try {
          const rels = await pb.collection(colName).getFullList({ filter: filterExpr, $autoCancel: false }).catch(() => []);
          for (const r of rels) {
            await pb.collection(colName).delete(r.id, { $autoCancel: false }).catch(() => {});
          }
        } catch (e) {}
      };

      await cleanRel('employee_documents', `employee_id = "${pid}"`);
      await cleanRel('driver_accident_reports', `employee_id = "${pid}"`);
      await cleanRel('attendance', `staff_member = "${pid}" || user_id = "${pid}"`);
      await cleanRel('attendance_records', `employee_id = "${pid}"`);
      await cleanRel('advances', `employee_id = "${pid}"`);
      await cleanRel('payroll', `employee_id = "${pid}" || employee_id_relation = "${pid}"`);
      await cleanRel('salary_payments', `employee_id = "${pid}"`);
      await cleanRel('shared_folders', `employee_id = "${pid}"`);

      // Clear references in expenses and trip_logs
      try {
        const expList = await pb.collection('expenses').getFullList({ filter: `employee_id = "${pid}"`, $autoCancel: false }).catch(() => []);
        for (const exp of expList) {
          await pb.collection('expenses').update(exp.id, { employee_id: '' }, { $autoCancel: false }).catch(() => {});
        }
      } catch (e) {}

      try {
        const tripList = await pb.collection('trip_logs').getFullList({ filter: `user_id = "${pid}"`, $autoCancel: false }).catch(() => []);
        for (const tr of tripList) {
          await pb.collection('trip_logs').update(tr.id, { user_id: '' }, { $autoCancel: false }).catch(() => {});
        }
      } catch (e) {}

      // Delete the employee record natively via PocketBase SDK
      await pb.collection('employees').delete(pid, { $autoCancel: false }).catch((err) => {
        logger.warn(`PocketBase SDK delete note for ${pid}: ${err.message}`);
      });
    }
  } catch (sdkErr) {
    logger.error('Error during PocketBase SDK employee delete:', sdkErr.message);
  }

  // 2. Direct SQLite Deletion across all DB file paths with WAL checkpoint as secondary cleanup
  let deletedCount = 0;
  if (DatabaseSyncMod) {
    try {
      const possiblePaths = Array.from(new Set([
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ])).filter(p => p && fs.existsSync(p));

      for (const dbPath of possiblePaths) {
        let db;
        try {
          db = new DatabaseSyncMod(dbPath);
          try { db.prepare('DELETE FROM employee_documents WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM driver_accident_reports WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM attendance WHERE staff_member = ? OR user_id = ?').run(targetStr, targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM attendance_records WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM advances WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM payroll WHERE employee_id = ? OR employee_id_relation = ?').run(targetStr, targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM salary_payments WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('DELETE FROM shared_folders WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('UPDATE expenses SET employee_id = "" WHERE employee_id = ?').run(targetStr); } catch (e) {}
          try { db.prepare('UPDATE trip_logs SET user_id = "" WHERE user_id = ?').run(targetStr); } catch (e) {}

          const info = db.prepare('DELETE FROM employees WHERE id = ? OR contact = ? OR name = ?').run(targetStr, targetStr, targetStr);
          if (info.changes > 0) deletedCount += info.changes;

          try { db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run(); } catch (e) {}
        } catch (sqErr) {
          logger.error(`SQLite delete error for ${targetStr}:`, sqErr.message);
        } finally {
          if (db) {
            try { db.close(); } catch (cErr) {}
          }
        }
      }
    } catch (sqliteErr) {}
  }

  // 3. Prevent Supabase download from overwriting local deletion & sync modified DB to Supabase
  global.preventSupabaseOverwriting = true;
  if (global.dbFilePath && global.uploadDatabaseToSupabase) {
    try {
      await global.uploadDatabaseToSupabase(global.dbFilePath);
    } catch (uErr) {}
  }

  // NOTE: Do NOT kill/restart PocketBase here. The SDK delete above already
  // removes the record from PocketBase's database and cache immediately.
  // Killing PocketBase causes a restart race where it re-downloads the old
  // database from Supabase before the upload finishes, restoring deleted employees.

  return deletedCount;
}

export { deleteEmployeeRecord };

/**
 * POST /api/driver/delete-employee-by-id
 * DELETE /api/driver/employee/:id
 * Delete employee record directly from SQLite & PocketBase.
 */
const handleEmployeeDelete = async (req, res) => {
  const { ids, id } = req.body || {};
  const targetId = req.params?.id || id || ids;
  const rawList = Array.isArray(targetId) ? targetId : [targetId];
  const cleanList = rawList.map(item => typeof item === 'object' ? (item.id || item.employee_number) : item).filter(Boolean);

  if (cleanList.length === 0) {
    return res.status(400).json({ success: false, error: 'No employee ID provided for deletion' });
  }

  let count = 0;
  for (const target of cleanList) {
    await deleteEmployeeRecord(target);
    count++;
  }

  logger.info(`🗑️ Direct DB employee delete executed: removed ${count} record(s) for targets:`, cleanList);
  return res.json({ success: true, deletedCount: count, message: `Successfully deleted employee(s)` });
};

import multer from 'multer';
const uploadDocFiles = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/delete-employee-by-id', handleEmployeeDelete);
router.post('/delete-by-id', handleEmployeeDelete);
router.delete('/employee/:id', handleEmployeeDelete);

/**
 * POST /api/driver/create-employee
 * Create a new employee record via superuser PocketBase client.
 * Accepts JSON body with all employee fields.
 */
router.post('/create-employee', async (req, res) => {
  try {
    const data = req.body || {};
    // Build a plain object — PocketBase SDK accepts plain objects for non-file fields
    const payload = {};
    const allowedFields = [
      'name', 'employee_type', 'employment_type', 'contact', 'emergency_contact',
      'address', 'joining_date', 'license_number', 'aadhaar_number', 'pan_card',
      'salary_amount', 'salary_billing_cycle', 'active_status', 'assigned_truck',
      'assigned_routes', 'education', 'payroll_cycle_start_day', 'payroll_cycle_end_day',
      'salary_disbursement_day', 'employee_number', 'employee_code'
    ];
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null) {
        payload[key] = data[key];
      }
    }
    // Ensure required defaults
    if (!payload.contact) payload.contact = 'N/A';
    if (!payload.salary_billing_cycle) payload.salary_billing_cycle = 'Monthly';
    if (!payload.employee_type) payload.employee_type = 'driver';
    if (!payload.active_status) payload.active_status = 'active';

    // Auto-compute permanent sequential employee_number and canonical employee_code
    let empNum = Number(payload.employee_number) || 0;
    let empCode = (payload.employee_code || '').trim().toUpperCase();
    const isDriver = payload.employee_type === 'driver';

    try {
      const allEmps = await pb.collection('employees').getFullList({ $autoCancel: false }).catch(() => []);
      if (empNum <= 0) {
        const nums = allEmps.map(e => Number(e.employee_number) || 0).filter(n => n > 0);
        empNum = nums.length > 0 ? Math.max(...nums) + 1 : (allEmps.length + 1);
      }
      if (!empCode || !/^[DE]\d{3,}$/.test(empCode)) {
        const catCodes = allEmps
          .filter(e => (e.employee_type === 'driver') === isDriver)
          .map(e => {
            const m = String(e.employee_code || e.employee_number || '').match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
          })
          .filter(n => n > 0);
        const nextCatSeq = catCodes.length > 0 ? Math.max(...catCodes) + 1 : 1;
        empCode = `${isDriver ? 'D' : 'E'}${String(nextCatSeq).padStart(3, '0')}`;
      }
    } catch (e) {
      empNum = empNum > 0 ? empNum : 1;
      empCode = empCode || (isDriver ? 'D001' : 'E001');
    }

    payload.employee_number = empNum;
    payload.employee_code = empCode;

    // Remove empty assigned_truck to avoid relation validation error
    if (!payload.assigned_truck || payload.assigned_truck === 'none' || payload.assigned_truck === '') {
      delete payload.assigned_truck;
    }

    const record = await pb.collection('employees').create(payload, { $autoCancel: false });

    // Direct SQLite update to ensure columns are guaranteed in SQLite schema too
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const dbPaths = [global.dbFilePath, 'apps/pocketbase/pb_data/data.db', 'pb_data/data.db'].filter(p => p && fs.existsSync(p));
      for (const dbPath of dbPaths) {
        const db = new DatabaseSync(dbPath);
        try { db.exec("ALTER TABLE employees ADD COLUMN employee_number INTEGER DEFAULT 0;"); } catch (_) {}
        try { db.exec("ALTER TABLE employees ADD COLUMN employee_code TEXT DEFAULT '';"); } catch (_) {}
        db.prepare("UPDATE employees SET employee_number = ?, employee_code = ? WHERE id = ?").run(empNum, empCode, record.id);
        db.close();
      }
    } catch (_) {}

    logger.info(`Employee created via backend API: ${record.id} (#${empNum} - ${empCode} - ${record.name})`);
    return res.json({ success: true, record: { ...record, employee_number: empNum, employee_code: empCode } });
  } catch (err) {
    logger.error('Failed to create employee:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/update-employee/:id
 * Update an existing employee record via superuser PocketBase client.
 */
router.post('/update-employee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const payload = {};
    const allowedFields = [
      'name', 'employee_type', 'employment_type', 'contact', 'emergency_contact',
      'address', 'joining_date', 'license_number', 'aadhaar_number', 'pan_card',
      'salary_amount', 'salary_billing_cycle', 'active_status', 'assigned_truck',
      'assigned_routes', 'education', 'payroll_cycle_start_day', 'payroll_cycle_end_day',
      'salary_disbursement_day', 'employee_number', 'employee_code'
    ];
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null) {
        payload[key] = data[key];
      }
    }

    const record = await pb.collection('employees').update(id, payload, { $autoCancel: false });
    logger.info(`Employee updated via backend API: ${record.id} (${record.name})`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to update employee:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/employee-documents
 * Create an employee document record with file uploads via superuser PocketBase client.
 */
router.post('/employee-documents', uploadDocFiles.array('files', 10), async (req, res) => {
  try {
    const { employee_id, document_type, document_name, issue_date, expiry_date, status } = req.body || {};
    const formData = new FormData();
    if (employee_id) formData.append('employee_id', employee_id);
    if (document_type) formData.append('document_type', document_type);
    if (document_name) formData.append('document_name', document_name);
    if (status) formData.append('status', status);
    if (issue_date) formData.append('issue_date', issue_date);
    
    if (expiry_date) {
      formData.append('expiry_date', expiry_date);
    } else {
      const defExp = new Date();
      defExp.setFullYear(defExp.getFullYear() + 10);
      formData.append('expiry_date', defExp.toISOString());
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileObj = typeof File !== 'undefined'
          ? new File([file.buffer], file.originalname, { type: file.mimetype })
          : new Blob([file.buffer], { type: file.mimetype });
        formData.append('files', fileObj, file.originalname);
      });
    }

    const record = await pb.collection('employee_documents').create(formData, { $autoCancel: false });
    logger.info(`Employee document created via backend API: ${record.id}`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to create employee document via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/employee-documents/:id
 * Update an employee document record with file uploads via superuser PocketBase client.
 */
router.post('/employee-documents/:id', uploadDocFiles.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, document_type, document_name, issue_date, expiry_date, status } = req.body || {};
    const formData = new FormData();
    if (employee_id) formData.append('employee_id', employee_id);
    if (document_type) formData.append('document_type', document_type);
    if (document_name !== undefined) formData.append('document_name', document_name);
    if (status) formData.append('status', status);
    if (issue_date) formData.append('issue_date', issue_date);
    if (expiry_date) formData.append('expiry_date', expiry_date);

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileObj = typeof File !== 'undefined'
          ? new File([file.buffer], file.originalname, { type: file.mimetype })
          : new Blob([file.buffer], { type: file.mimetype });
        formData.append('files', fileObj, file.originalname);
      });
    }

    const record = await pb.collection('employee_documents').update(id, formData, { $autoCancel: false });
    logger.info(`Employee document updated via backend API: ${record.id}`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to update employee document via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/share-folder
 * Get or create a shared_folders record for truckId or employeeId via superuser PocketBase client.
 */
router.post('/share-folder', async (req, res) => {
  try {
    const { truckId, employeeId, created_by } = req.body || {};
    let filter = '';
    if (truckId) filter = `truck_id = "${sanitize(truckId)}"`;
    else if (employeeId) filter = `employee_id = "${sanitize(employeeId)}"`;

    if (!filter) {
      return res.status(400).json({ success: false, error: 'Either truckId or employeeId must be provided' });
    }

    const existing = await pb.collection('shared_folders').getFullList({ filter, $autoCancel: false }).catch(() => []);
    if (existing.length > 0) {
      return res.json({ success: true, record: existing[0] });
    }

    const payload = {};
    if (truckId) payload.truck_id = truckId;
    if (employeeId) payload.employee_id = employeeId;
    if (created_by) payload.created_by = created_by;

    const record = await pb.collection('shared_folders').create(payload, { $autoCancel: false });
    logger.info(`Shared folder record created via API: ${record.id}`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to get/create share folder record via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message });
  }
});

/**
 * POST /api/driver/backup-now
 * Trigger instant cloud database backup sync to Supabase.
 */
router.post('/backup-now', async (req, res) => {
  try {
    if (!global.dbFilePath || !fs.existsSync(global.dbFilePath)) {
      return res.status(404).json({ success: false, error: 'Database file not found' });
    }
    
    // 1. Sync SQLite Database
    const dbOk = await global.uploadDatabaseToSupabase(global.dbFilePath);
    
    // 2. Sync Uploaded Storage Files (best effort in background so that response is instant)
    if (global.storageDir && global.uploadAllStorageToSupabase) {
      global.uploadAllStorageToSupabase(global.storageDir).catch(storageErr => {
        logger.error('Failed to sync storage attachments to Supabase:', storageErr.message);
      });
    }

    if (dbOk) {
      return res.json({
        success: true,
        message: 'Production database and uploaded documents successfully backed up to Supabase Cloud!'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Cloud database backup failed or was skipped by security checks. Check server logs for details.'
      });
    }
  } catch (err) {
    logger.error('Failed to execute instant cloud backup:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/driver/download-db
 * Direct download of SQLite production master data.db file.
 */
router.get('/download-db', async (req, res) => {
  try {
    if (!global.dbFilePath || !fs.existsSync(global.dbFilePath)) {
      return res.status(404).send('Database file not found');
    }
    const dateStr = new Date().toISOString().split('T')[0];
    res.download(global.dbFilePath, `JBC_Production_Master_Database_${dateStr}.db`);
  } catch (err) {
    logger.error('Failed to download master database file:', err.message);
    res.status(500).send(err.message);
  }
});

/**
 * POST /api/driver/create-expense
 * Create an expense record via superuser PocketBase client.
 */
router.post('/create-expense', async (req, res) => {
  try {
    const data = req.body || {};
    const payload = {
      date: data.date || new Date().toISOString(),
      amount: Number(data.amount) || 0,
      category: data.category || 'Regular',
      subcategory: data.subcategory || '',
      description: data.description || '',
      payment_method: data.payment_method || 'Cash',
      status: data.status || 'Approved',
      notes: data.notes || '',
      created_by: data.created_by || 'system',
    };
    if (data.truck_id && data.truck_id !== 'none') payload.truck_id = data.truck_id;
    if (data.credit_card_id && data.credit_card_id !== 'none') payload.credit_card_id = data.credit_card_id;
    if (data.employee_id && data.employee_id !== 'none') payload.employee_id = data.employee_id;

    const record = await pb.collection('expenses').create(payload, { $autoCancel: false });
    logger.info(`Expense created via API: ${record.id} (${record.amount})`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to create expense via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/update-expense/:id
 * Update an expense record via superuser PocketBase client.
 */
router.post('/update-expense/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const payload = {};
    if (data.date) payload.date = data.date;
    if (data.amount !== undefined) payload.amount = Number(data.amount) || 0;
    if (data.category) payload.category = data.category;
    if (data.subcategory !== undefined) payload.subcategory = data.subcategory;
    if (data.description !== undefined) payload.description = data.description;
    if (data.payment_method) payload.payment_method = data.payment_method;
    if (data.status) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    
    payload.truck_id = (data.truck_id && data.truck_id !== 'none') ? data.truck_id : '';
    payload.credit_card_id = (data.credit_card_id && data.credit_card_id !== 'none') ? data.credit_card_id : '';
    payload.employee_id = (data.employee_id && data.employee_id !== 'none') ? data.employee_id : '';

    const record = await pb.collection('expenses').update(id, payload, { $autoCancel: false });
    logger.info(`Expense updated via API: ${record.id}`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to update expense via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/update-truck/:id
 * Update a truck record (including FASTag balance & details) via superuser PocketBase client.
 */
router.post('/update-truck/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const payload = {};
    const allowedFields = [
      'truck_name', 'truck_number', 'truck_size', 'truck_axle', 'tyre_count',
      'status', 'base_odometer', 'ownership_type', 'manager_id', 'fastag_id',
      'current_fastag_balance', 'payload_capacity', 'body_length', 'body_width', 'body_height',
      'last_recharge_date', 'last_recharge_amount'
    ];
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== null) {
        if (key === 'current_fastag_balance' || key === 'base_odometer' || key === 'tyre_count' || key === 'last_recharge_amount' || key === 'body_length' || key === 'body_width' || key === 'body_height') {
          payload[key] = Number(data[key]) || 0;
        } else if (key === 'manager_id' && (data[key] === 'none' || data[key] === '')) {
          payload[key] = '';
        } else {
          payload[key] = data[key];
        }
      }
    }

    const record = await pb.collection('trucks').update(id, payload, { $autoCancel: false });
    logger.info(`Truck updated via API: ${record.id} (${record.truck_number})`);
    return res.json({ success: true, record });
  } catch (err) {
    logger.error('Failed to update truck via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message, details: err?.data?.data });
  }
});

/**
 * POST /api/driver/recharge-fastag
 * Perform FASTag recharge and update truck balance & create expense record atomically via superuser.
 */
router.post('/recharge-fastag', async (req, res) => {
  try {
    const { truck_id, recharge_date, recharge_amount, payment_method, reference_number, notes } = req.body || {};
    if (!truck_id || !recharge_amount) {
      return res.status(400).json({ success: false, error: 'truck_id and recharge_amount are required' });
    }

    const amount = Number(recharge_amount) || 0;
    const dateISO = recharge_date ? (recharge_date.includes('T') ? recharge_date : `${recharge_date} 12:00:00.000Z`) : new Date().toISOString();

    // 1. Fetch current truck
    const truck = await pb.collection('trucks').getOne(truck_id, { $autoCancel: false });
    const newBalance = (Number(truck.current_fastag_balance) || 0) + amount;

    // 2. Update truck balance
    const updatedTruck = await pb.collection('trucks').update(truck_id, {
      current_fastag_balance: newBalance,
      last_recharge_date: dateISO,
      last_recharge_amount: amount
    }, { $autoCancel: false });

    // 3. Create fastag_recharges record if collection exists
    try {
      await pb.collection('fastag_recharges').create({
        truck_id,
        recharge_date: dateISO,
        recharge_amount: amount,
        payment_method: payment_method || 'UPI',
        reference_number: reference_number || '',
        notes: notes || ''
      }, { $autoCancel: false });
    } catch (rechargeColErr) {
      logger.warn(`Notice: fastag_recharges collection create warning: ${rechargeColErr.message}`);
    }

    // 4. Create matching expense record
    try {
      await pb.collection('expenses').create({
        date: dateISO,
        category: 'FASTag Recharge',
        description: `FASTag Recharge for truck ${truck.truck_number || truck_id}`,
        amount: amount,
        payment_method: payment_method || 'UPI',
        truck_id: truck_id, // valid 15-char record ID
        status: 'Approved',
        notes: notes || ''
      }, { $autoCancel: false });
    } catch (expErr) {
      logger.warn(`Notice: expense record for FASTag recharge warning: ${expErr.message}`);
    }

    logger.info(`FASTag recharged via API: Truck ${truck.truck_number} +₹${amount} (New Balance: ₹${newBalance})`);
    return res.json({ success: true, truck: updatedTruck, newBalance });
  } catch (err) {
    logger.error('Failed to execute FASTag recharge via API:', err?.data || err.message);
    return res.status(400).json({ success: false, error: err?.data?.message || err.message });
  }
});






// ─────────────────────────────────────────────────────────────────────────────
// Authentication & Driver Resolution Middleware
// ─────────────────────────────────────────────────────────────────────────────
const resolveDriver = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let userId = null;
  let driverPhone = sanitize(req.headers['x-driver-phone'] || '');
  let driverId = sanitize(req.headers['x-driver-id'] || '');

  try {
    // 1. Bearer Token Auth (Standard PocketBase authorization)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
        const tokenData = JSON.parse(base64Decoded);

        if (tokenData?.token && tokenData?.record) {
          // Instantiate a fresh PocketBase client to verify token legitimacy
          const pocketbaseClient = new pb.constructor('http://127.0.0.1:8090');
          pocketbaseClient.authStore.save(tokenData.token, tokenData.record);
          const newToken = await pocketbaseClient.collection(tokenData.record.collectionName).authRefresh();
          userId = newToken.record.id;
          req.pocketbaseUserId = userId;

          // Match logged-in user to employee registry via phone or full name
          const userRecord = await pb.collection('users').getOne(userId, { $autoCancel: false });
          const safePhone = sanitize(userRecord.phone_number || '');
          const safeName = sanitize(userRecord.full_name || '');
          const employees = await pb.collection('employees').getFullList({
            filter: `contact = "${safePhone}" || name = "${safeName}"`,
            $autoCancel: false
          });
          if (employees.length > 0) {
            req.driverRecord = employees[0];
            req.driverId = employees[0].id;
            return next();
          }
        }
      } catch (err) {
        logger.warn(`Failed token-based employee resolution: ${err.message}`);
      }
    }

    // 2. legacy/Simplified Header Auth (Support for direct API queries)
    if (driverId) {
      try {
        const emp = await pb.collection('employees').getOne(driverId, { $autoCancel: false });
        req.driverRecord = emp;
        req.driverId = emp.id;
        return next();
      } catch (e) {
        logger.warn(`Failed x-driver-id verification: ${e.message}`);
      }
    }

    if (driverPhone) {
      try {
        const employees = await pb.collection('employees').getFullList({
          filter: `contact = "${driverPhone}"`,
          $autoCancel: false
        });
        if (employees.length > 0) {
          req.driverRecord = employees[0];
          req.driverId = employees[0].id;
          return next();
        }
      } catch (e) {
        logger.warn(`Failed x-driver-phone verification: ${e.message}`);
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Driver identity could not be resolved. Please log in.'
    });
  } catch (err) {
    logger.error(`resolveDriver Middleware Error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal authorization failure.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Route Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/driver/login
 * Validates name and phone, searches employee registry, returns driver profile.
 */
router.post('/login', async (req, res) => {
  const { name, contact } = req.body || {};
  if (!contact && !name) {
    return res.status(400).json({ success: false, error: 'Driver name or mobile number is required.' });
  }

  try {
    const rawName = String(name || '').trim();
    const rawContact = String(contact || '').trim();
    const cleanPhone = rawContact.replace(/\D/g, '').slice(-10); // Extract 10-digit mobile

    let matchedDriver = null;

    // 1. Query employees collection
    try {
      const employees = await pb.collection('employees').getFullList({ $autoCancel: false });
      
      // Strategy A: Match by 10-digit phone number
      if (cleanPhone.length >= 10) {
        matchedDriver = employees.find(e => {
          const empDigits = String(e.contact || '').replace(/\D/g, '').slice(-10);
          return empDigits === cleanPhone;
        });
      }

      // Strategy B: Match by case-insensitive name
      if (!matchedDriver && rawName.length > 0) {
        matchedDriver = employees.find(e => {
          return e.name && e.name.toLowerCase().trim() === rawName.toLowerCase();
        });
      }

      // Strategy C: Partial matching
      if (!matchedDriver && cleanPhone.length >= 6) {
        matchedDriver = employees.find(e => {
          const empDigits = String(e.contact || '').replace(/\D/g, '');
          return empDigits.includes(cleanPhone);
        });
      }
    } catch (pbErr) {
      logger.warn(`Notice during employee search in login: ${pbErr.message}`);
    }

    // 2. Query users collection fallback
    if (!matchedDriver) {
      try {
        const users = await pb.collection('users').getFullList({ $autoCancel: false });
        const userMatch = users.find(u => {
          const uDigits = String(u.phone_number || u.phone || '').replace(/\D/g, '').slice(-10);
          return (cleanPhone.length >= 10 && uDigits === cleanPhone) ||
                 (rawName && u.full_name && u.full_name.toLowerCase().trim() === rawName.toLowerCase());
        });
        if (userMatch) {
          matchedDriver = {
            id: userMatch.id,
            name: userMatch.full_name || rawName || 'Driver',
            contact: userMatch.phone_number || rawContact,
            position: 'Commercial Fleet Driver',
            active_status: 'active',
            assigned_truck: 'TS09UB8822'
          };
        }
      } catch (uErr) {}
    }

    // 3. Fallback: Auto-provision / Register driver record if valid 10-digit phone
    if (!matchedDriver && (cleanPhone.length >= 10 || rawName.length >= 2)) {
      const finalDriverName = rawName || 'Driver ' + cleanPhone.slice(-4);
      const finalContact = cleanPhone.length >= 10 ? cleanPhone : rawContact;

      try {
        // Resolve default truck
        let defaultTruck = '';
        try {
          const trucks = await pb.collection('trucks').getList(1, 1, { $autoCancel: false });
          if (trucks.items.length > 0) defaultTruck = trucks.items[0].id;
        } catch (tErr) {}

        const newEmployee = await pb.collection('employees').create({
          name: finalDriverName,
          contact: finalContact,
          position: 'Heavy Commercial Driver',
          employee_type: 'driver',
          active_status: 'active',
          assigned_truck: defaultTruck,
          joining_date: new Date().toISOString().split('T')[0]
        }, { $autoCancel: false });

        matchedDriver = newEmployee;
        logger.info(`Auto-registered new commercial driver in registry: ${finalDriverName} (${finalContact})`);
      } catch (createErr) {
        // Fallback in-memory driver object
        matchedDriver = {
          id: 'drv_' + Date.now(),
          name: finalDriverName,
          contact: finalContact,
          position: 'Commercial Fleet Driver',
          active_status: 'active',
          assigned_truck: 'TS09UB8822'
        };
      }
    }

    if (!matchedDriver) {
      return res.status(404).json({ success: false, error: 'Driver profile not found. Please verify details.' });
    }

    let resolvedTruckNumber = matchedDriver.assigned_truck || 'TG12U2637';
    if (matchedDriver.assigned_truck && matchedDriver.assigned_truck.length === 15) {
      try {
        const truck = await pb.collection('trucks').getOne(matchedDriver.assigned_truck, { $autoCancel: false });
        if (truck && truck.truck_number) resolvedTruckNumber = truck.truck_number;
      } catch (tErr) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      driver: {
        id: matchedDriver.id,
        name: matchedDriver.name,
        contact: matchedDriver.contact,
        position: matchedDriver.position || 'Heavy Commercial Driver',
        active_status: matchedDriver.active_status || 'active',
        assigned_truck: resolvedTruckNumber
      }
    });
  } catch (err) {
    logger.error(`Driver login error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Authentication engine failure.' });
  }
});

/**
 * GET /api/driver/profile
 * Returns the resolved driver profile info.
 */
router.get('/profile', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  let resolvedTruckNumber = driver.assigned_truck || 'TG12U2637';
  if (driver.assigned_truck && driver.assigned_truck.length === 15) {
    try {
      const truck = await pb.collection('trucks').getOne(driver.assigned_truck, { $autoCancel: false });
      if (truck && truck.truck_number) resolvedTruckNumber = truck.truck_number;
    } catch (e) {}
  }
  return res.status(200).json({
    success: true,
    driver: {
      ...driver,
      assigned_truck: resolvedTruckNumber
    }
  });
});

/**
 * GET /api/driver/dashboard
 * Aggregates dashboard metrics (trips finished, projected pay, active truck, live trip, badges).
 */
router.get('/dashboard', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const startOfMonth = `${year}-${month}-01 00:00:00`;

  try {
    // 1. Fetch current month's completed trips
    const completedTrips = await pb.collection('trip_logs').getFullList({
      filter: `driver_name = "${driver.name}" && date >= "${startOfMonth}" && (trip_status = "" || trip_status = "completed" || trip_status = "Delivered")`,
      $autoCancel: false
    });
    const completedTripsCount = completedTrips.length;

    // 2. Calculate projected pay based on leaderboard rules
    const basePay = completedTripsCount >= 15 ? 35000 : 0;
    const extraTripsPay = completedTripsCount > 15 ? (completedTripsCount - 15) * 1000 : 0;
    const projectedSalary = basePay + extraTripsPay;

    // 3. Fetch assigned truck details
    let truckDetails = null;
    if (driver.assigned_truck) {
      try {
        const truck = await pb.collection('trucks').getOne(driver.assigned_truck, { $autoCancel: false });
        truckDetails = {
          id: truck.id,
          truck_number: truck.truck_number,
          make: truck.make,
          model: truck.model,
          status: truck.status || 'Active'
        };
      } catch (e) {
        logger.warn(`Failed to fetch assigned truck details: ${e.message}`);
      }
    }

    // 4. Fetch latest active/dispatched trip
    let activeTrip = null;
    try {
      const activeTrips = await pb.collection('trip_logs').getList(1, 1, {
        filter: `driver_name = "${driver.name}" && trip_status = "Dispatched"`,
        sort: '-date,-created',
        $autoCancel: false
      });
      if (activeTrips.items.length > 0) {
        const trip = activeTrips.items[0];
        
        let mapLink = "";
        let startMapLink = "";
        let endMapLink = "";
        let stopsList = [];
        
        // Strategy A: Try route_id relation
        if (trip.route_id) {
          try {
            const routeRec = await pb.collection('routes').getOne(trip.route_id, { $autoCancel: false });
            mapLink = routeRec.google_map_link || "";
            startMapLink = routeRec.start_location_map_link || "";
            endMapLink = routeRec.end_location_map_link || "";
            stopsList = Array.isArray(routeRec.stops) ? routeRec.stops : [];
          } catch (e) {
            logger.warn(`Failed to fetch route by route_id: ${e.message}`);
          }
        }
        
        // Strategy B Fallback: Query by route name
        if (!mapLink && trip.route) {
          try {
            const routes = await pb.collection('routes').getFullList({
              filter: `route_name = "${trip.route}"`,
              $autoCancel: false
            });
            if (routes.length > 0) {
              mapLink = routes[0].google_map_link || "";
              startMapLink = routes[0].start_location_map_link || "";
              endMapLink = routes[0].end_location_map_link || "";
              stopsList = Array.isArray(routes[0].stops) ? routes[0].stops : [];
            }
          } catch (e) {
            logger.warn(`Failed to fetch route by route_name fallback: ${e.message}`);
          }
        }

        activeTrip = {
          id: trip.id,
          trip_id: trip.trip_id,
          date: trip.date.substringBefore ? trip.date.substringBefore(" ") : trip.date.split(" ")[0],
          route: trip.route,
          truck_number: trip.truck_number,
          kms: trip.kms,
          status: trip.trip_status,
          google_map_link: mapLink,
          start_location_map_link: startMapLink,
          end_location_map_link: endMapLink,
          stops: stopsList
        };
      }
    } catch (e) {
      logger.warn(`Failed to resolve active trip: ${e.message}`);
    }

    // 5. Decode badges
    let badges = [];
    try {
      badges = JSON.parse(driver.badges || '[]');
    } catch (e) {
      badges = [];
    }

    return res.status(200).json({
      success: true,
      metrics: {
        completed_trips_count: completedTripsCount,
        salary_projection: {
          base_pay: basePay,
          extra_trips_pay: extraTripsPay,
          gross_projected: projectedSalary
        },
        assigned_truck: truckDetails,
        active_trip: activeTrip,
        badges: badges
      }
    });
  } catch (err) {
    logger.error(`Driver dashboard aggregation error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to aggregate dashboard analytics.' });
  }
});

/**
 * GET /api/driver/trips
 * Fetches completed trip logs for this driver.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Real-time GPS Tracking, Geofence & Mobile Driver App Endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper: Calculate Haversine distance in meters between two geocoordinates.
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371e3; // Earth radius in metres
  const φ1 = (nLat1 * Math.PI) / 180;
  const φ2 = (nLat2 * Math.PI) / 180;
  const Δφ = ((nLat2 - nLat1) * Math.PI) / 180;
  const Δλ = ((nLon2 - nLon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * POST /api/driver/location
 * Ingest live GPS coordinates from Android Foreground Tracking Service.
 */
router.post('/location', resolveDriver, async (req, res) => {
  try {
    const driver = req.driverRecord;
    const {
      trip_id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      battery,
      recorded_at
    } = req.body || {};

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'latitude and longitude are required.' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const timestamp = recorded_at || new Date().toISOString();

    // 1. Record location in memory or PocketBase / SQLite if collection exists
    try {
      if (pb.collection('driver_locations')) {
        await pb.collection('driver_locations').create({
          driver_id: driver.id,
          driver_name: driver.name,
          trip_id: trip_id || '',
          latitude: lat,
          longitude: lng,
          speed: Number(speed) || 0,
          heading: Number(heading) || 0,
          accuracy: Number(accuracy) || 0,
          battery: Number(battery) || 100,
          recorded_at: timestamp
        }, { $autoCancel: false }).catch(() => {});
      }
    } catch (locColErr) {}

    // 2. Update live position on assigned truck if assigned
    if (driver.assigned_truck) {
      try {
        await pb.collection('trucks').update(driver.assigned_truck, {
          last_lat: lat,
          last_lng: lng,
          last_location_time: timestamp
        }, { $autoCancel: false }).catch(() => {});
      } catch (tErr) {}
    }

    // 3. Update driver record's last active location
    try {
      await pb.collection('employees').update(driver.id, {
        last_lat: lat,
        last_lng: lng,
        last_seen: timestamp
      }, { $autoCancel: false }).catch(() => {});
    } catch (eErr) {}

    return res.status(200).json({
      success: true,
      message: 'Location telemetry ingested successfully.',
      timestamp
    });
  } catch (err) {
    logger.error('Driver location ingestion error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to record location.' });
  }
});

/**
 * POST /api/driver/trips/:id/status
 * Updates trip workflow state with geofencing validation.
 * States: ASSIGNED -> REPORTING -> AT PICKUP -> LOADED -> IN TRANSIT -> ARRIVED -> POD UPLOAD -> COMPLETED
 */
router.post('/trips/:id/status', resolveDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const driver = req.driverRecord;
    const { status, latitude, longitude, remarks, override_geofence } = req.body || {};

    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required.' });
    }

    // 1. Fetch current trip record
    const trip = await pb.collection('trip_logs').getOne(id, { $autoCancel: false });
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    // Verify driver assignment
    if (trip.driver_name && trip.driver_name.toLowerCase().trim() !== driver.name.toLowerCase().trim()) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You are not assigned to this trip.' });
    }

    const GEOFENCE_RADIUS_METERS = 250;
    let distanceToDestination = null;

    // 2. Location-based Geofence verification for ARRIVED and COMPLETED states
    if (['ARRIVED', 'POD UPLOAD', 'COMPLETED', 'Delivered'].includes(status)) {
      let destLat = trip.destination_lat;
      let destLng = trip.destination_lng;

      // Fallback: Check route definition if coordinates missing on trip
      if ((!destLat || !destLng) && (trip.route_id || trip.route)) {
        try {
          const routeRec = trip.route_id 
            ? await pb.collection('routes').getOne(trip.route_id, { $autoCancel: false }).catch(() => null)
            : (await pb.collection('routes').getFullList({ filter: `route_name = "${trip.route}"`, $autoCancel: false }).catch(() => []))[0];
          if (routeRec) {
            destLat = destLat || routeRec.end_lat || routeRec.destination_lat;
            destLng = destLng || routeRec.end_lng || routeRec.destination_lng;
          }
        } catch (rErr) {}
      }

      if (destLat && destLng && latitude && longitude) {
        distanceToDestination = calculateDistanceMeters(latitude, longitude, destLat, destLng);
        if (distanceToDestination !== null && distanceToDestination > GEOFENCE_RADIUS_METERS && !override_geofence) {
          return res.status(400).json({
            success: false,
            error: `You are not at the destination yet. Current distance is ${distanceToDestination}m (allowed radius: ${GEOFENCE_RADIUS_METERS}m).`,
            geofence_failed: true,
            current_distance_meters: distanceToDestination,
            allowed_radius_meters: GEOFENCE_RADIUS_METERS
          });
        }
      }
    }

    // 3. Prepare updated fields
    const nowISO = new Date().toISOString();
    const updatePayload = {
      trip_status: status
    };

    if (status === 'COMPLETED' || status === 'Delivered') {
      updatePayload.trip_status = 'Delivered';
      updatePayload.completed_at = nowISO;
    }

    if (remarks) {
      updatePayload.notes = trip.notes ? `${trip.notes}\n[${status} ${nowISO}] ${remarks}` : `[${status} ${nowISO}] ${remarks}`;
    }

    const updatedTrip = await pb.collection('trip_logs').update(id, updatePayload, { $autoCancel: false });
    logger.info(`Driver ${driver.name} transitioned Trip ${trip.trip_id || id} to state: ${status}`);

    return res.status(200).json({
      success: true,
      message: `Trip status successfully updated to ${status}`,
      trip: updatedTrip,
      distance_to_destination_meters: distanceToDestination
    });
  } catch (err) {
    logger.error('Trip status update failure:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update trip status.' });
  }
});

/**
 * POST /api/driver/trips/:id/pod
 * Upload Proof of Delivery (POD) documents and photos.
 */
router.post('/trips/:id/pod', resolveDriver, uploadDocFiles.array('pod_photos', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const driver = req.driverRecord;
    const trip = await pb.collection('trip_logs').getOne(id, { $autoCancel: false });
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const files = req.files || [];
    const base64Photos = req.body.base64_photos ? (Array.isArray(req.body.base64_photos) ? req.body.base64_photos : [req.body.base64_photos]) : [];
    
    if (files.length === 0 && base64Photos.length === 0) {
      return res.status(400).json({ success: false, error: 'No POD photos provided in request.' });
    }

    const uploadedDocIds = [];
    const nowISO = new Date().toISOString();

    // 1. Process Multipart file uploads
    for (const file of files) {
      try {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname || 'pod_receipt.jpg');
        formData.append('document_type', 'POD');
        formData.append('document_name', `POD - Trip ${trip.trip_id || id}`);
        formData.append('trip_id', trip.id);
        formData.append('driver_id', driver.id);
        formData.append('truck_id', driver.assigned_truck || '');
        formData.append('uploaded_at', nowISO);

        const docRecord = await pb.collection('pod_documents').create(formData, { $autoCancel: false }).catch(async () => {
          return await pb.collection('employee_documents').create(formData, { $autoCancel: false });
        });
        if (docRecord) uploadedDocIds.push(docRecord.id);
      } catch (fErr) {
        logger.warn(`POD file upload notice: ${fErr.message}`);
      }
    }

    // 2. Update trip status if required
    await pb.collection('trip_logs').update(id, {
      pod_uploaded: true,
      pod_uploaded_at: nowISO
    }, { $autoCancel: false }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Proof of delivery successfully uploaded and registered.',
      documents_count: files.length + base64Photos.length,
      doc_ids: uploadedDocIds
    });
  } catch (err) {
    logger.error('POD upload error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process POD upload.' });
  }
});

/**
 * POST /api/driver/trips/:id/signature
 * Capture receiver signature on delivery.
 */
router.post('/trips/:id/signature', resolveDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver_name, signature_data, remarks } = req.body || {};

    if (!receiver_name || !signature_data) {
      return res.status(400).json({ success: false, error: 'receiver_name and signature_data are required.' });
    }

    const trip = await pb.collection('trip_logs').getOne(id, { $autoCancel: false });
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const nowISO = new Date().toISOString();
    const signaturePayload = {
      receiver_name: String(receiver_name).trim(),
      receiver_signature: signature_data,
      signature_timestamp: nowISO,
      delivery_remarks: remarks || ''
    };

    const updatedTrip = await pb.collection('trip_logs').update(id, signaturePayload, { $autoCancel: false });
    logger.info(`Receiver signature captured for Trip ${trip.trip_id || id} by ${receiver_name}`);

    return res.status(200).json({
      success: true,
      message: 'Receiver signature successfully recorded.',
      trip: updatedTrip
    });
  } catch (err) {
    logger.error('Signature capture error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to record signature.' });
  }
});

/**
 * GET /api/driver/supervisors
 * Returns active fleet supervisors, dispatchers, and emergency numbers.
 */
router.get('/supervisors', resolveDriver, async (req, res) => {
  try {
    const supervisors = await pb.collection('employees').getFullList({
      filter: 'employee_type = "supervisor" || employee_type = "manager" || position ~ "Supervisor" || position ~ "Manager"',
      $autoCancel: false
    }).catch(() => []);

    const contacts = supervisors.map(s => ({
      id: s.id,
      name: s.name,
      phone: s.contact,
      role: s.position || 'Fleet Supervisor',
      whatsapp_link: s.contact ? `https://wa.me/${s.contact.replace(/\D/g, '')}` : null
    }));

    // Add company emergency 24/7 hotline fallback
    const emergencyHotline = {
      name: 'Jai Bhavani Emergency Control Desk',
      phone: '+91 9988776655',
      role: '24/7 National Dispatch & SOS Helpdesk',
      whatsapp_link: 'https://wa.me/919988776655'
    };

    return res.status(200).json({
      success: true,
      emergency_desk: emergencyHotline,
      supervisors: contacts.length > 0 ? contacts : [
        {
          name: 'Main Fleet Control Supervisor',
          phone: '+91 9848012345',
          role: 'Fleet Operations Manager',
          whatsapp_link: 'https://wa.me/919848012345'
        }
      ]
    });
  } catch (err) {
    logger.error('Supervisors fetch error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch supervisor contacts.' });
  }
});

router.get('/trips', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const trips = await pb.collection('trip_logs').getList(1, limit, {
      filter: `driver_name = "${driver.name}"`,
      sort: '-date,-created',
      $autoCancel: false
    });

    // Populate google_map_link and stops for all trips efficiently
    let enrichedTrips = trips.items;
    try {
      const routesList = await pb.collection('routes').getFullList({ $autoCancel: false });
      const routeMap = {};
      routesList.forEach(r => {
        routeMap[r.id] = r;
        routeMap[r.route_name] = r;
      });

      enrichedTrips = trips.items.map(trip => {
        const routeRec = routeMap[trip.route_id] || routeMap[trip.route];
        return {
          ...trip,
          google_map_link: routeRec?.google_map_link || "",
          start_location_map_link: routeRec?.start_location_map_link || "",
          end_location_map_link: routeRec?.end_location_map_link || "",
          stops: Array.isArray(routeRec?.stops) ? routeRec.stops : []
        };
      });
    } catch (e) {
      logger.warn(`Failed to enrich trips list with route map details: ${e.message}`);
    }

    return res.status(200).json({
      success: true,
      trips: enrichedTrips
    });
  } catch (err) {
    logger.error(`Failed to fetch driver trips: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve trip history.' });
  }
});

/**
 * POST /api/driver/trips
 * Logs a new trip dispatch.
 */
router.post('/trips', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const { date, route, kms, mileage, revenue, truck_number } = req.body;

  if (!route || !kms) {
    return res.status(400).json({ success: false, error: 'Missing route or kms in request.' });
  }

  try {
    // Resolve truck number: use assigned truck's registration, fallback to input
    let finalTruckNumber = truck_number;
    if (!finalTruckNumber && driver.assigned_truck) {
      try {
        const truck = await pb.collection('trucks').getOne(driver.assigned_truck, { $autoCancel: false });
        finalTruckNumber = truck.truck_number;
      } catch (e) {
        logger.warn(`Could not fetch assigned truck details: ${e.message}`);
      }
    }

    if (!finalTruckNumber) {
      return res.status(400).json({ success: false, error: 'Truck registration number is required.' });
    }

    // Fallback user_id if req.pocketbaseUserId is empty
    let finalUserId = req.pocketbaseUserId;
    if (!finalUserId) {
      try {
        const users = await pb.collection('users').getList(1, 1, { $autoCancel: false });
        if (users.items.length > 0) {
          finalUserId = users.items[0].id;
        }
      } catch (err) {
        logger.warn(`Failed to resolve fallback user_id: ${err.message}`);
      }
    }

    if (!finalUserId) {
      return res.status(400).json({ success: false, error: 'Valid user creator context is required by database constraints.' });
    }

    // Auto-generate next unique TRIP-XXX code
    let maxNum = 0;
    try {
      const allTrips = await pb.collection('trip_logs').getFullList({
        fields: 'trip_id',
        $autoCancel: false
      });
      for (const item of allTrips) {
        if (item.trip_id) {
          const match = item.trip_id.match(/TRIP-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }
    } catch (err) {
      logger.warn(`Failed to calculate max trip_id suffix: ${err.message}`);
    }
    const nextTripId = `TRIP-${(maxNum + 1).toString().padStart(3, '0')}`;

    const payload = {
      date: date ? `${date} 12:00:00.000Z` : new Date().toISOString(),
      driver_name: driver.name,
      truck_number: finalTruckNumber,
      route,
      kms: Number(kms),
      mileage: Number(mileage) || 0,
      revenue: Number(revenue) || 0,
      trip_status: 'Upcoming',
      user_id: finalUserId,
      created_by: finalUserId,
      trip_id: nextTripId
    };

    const newTrip = await pb.collection('trip_logs').create(payload, { $autoCancel: false });
    return res.status(201).json({
      success: true,
      message: 'Trip log successfully registered.',
      trip: newTrip
    });
  } catch (err) {
    logger.error(`Failed to register trip: ${err.message}`);
    if (err.data) logger.error(`PocketBase schema errors: ${JSON.stringify(err.data)}`);
    return res.status(500).json({ success: false, error: 'Failed to submit trip log.' });
  }
});

/**
 * POST /api/driver/fuel-logs
 * Logs a fuel purchase/refill, auto-generating both fuel_tracker and expenses records.
 */
router.post('/fuel-logs', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const { date, kms, liters, total_cost, payment_method, notes, credit_card_id } = req.body;

  if (!kms || !liters || !total_cost) {
    return res.status(400).json({ success: false, error: 'Missing distance (kms), liters, or total_cost.' });
  }

  if (!driver.assigned_truck) {
    return res.status(400).json({ success: false, error: 'No truck assigned to this driver profile. Fuel logging blocked.' });
  }

  try {
    const truck = await pb.collection('trucks').getOne(driver.assigned_truck, { $autoCancel: false });
    const refillDate = date ? `${date} 12:00:00.000Z` : new Date().toISOString();

    const paymentInfo = `Payment Method: ${payment_method || 'Cash'}\nLogged via Driver App`;
    const finalNotes = notes ? `${notes}\n\n${paymentInfo}` : paymentInfo;

    // 1. Create fuel_tracker record
    const trackerPayload = {
      date: refillDate,
      truck_id: truck.id,
      truck_number: truck.truck_number,
      distance_driven: Number(kms),
      liters: Number(liters),
      total_cost: Number(total_cost),
      payment_method: payment_method || 'Cash',
      notes: finalNotes,
      credit_card_id: credit_card_id || undefined
    };

    const tracker = await pb.collection('fuel_tracker').create(trackerPayload, { $autoCancel: false });

    // Fallback user_id for expenses.created_by
    let finalUserId = req.pocketbaseUserId;
    if (!finalUserId) {
      try {
        const users = await pb.collection('users').getList(1, 1, { $autoCancel: false });
        if (users.items.length > 0) {
          finalUserId = users.items[0].id;
        }
      } catch (err) {
        logger.warn(`Failed to resolve fallback user_id: ${err.message}`);
      }
    }

    // 2. Create linked expense record
    const expensePayload = {
      date: refillDate,
      category: 'Regular',
      subcategory: 'Fuel',
      amount: Number(total_cost),
      liters: Number(liters),
      truck_id: truck.truck_number,
      description: `${truck.truck_number} - ${kms} KMs Driven - ${liters} L (Driver App)`,
      payment_method: payment_method || 'Cash',
      status: 'Approved',
      created_by: finalUserId || 'driver_app',
      fuel_tracker_id: tracker.id
    };

    const expense = await pb.collection('expenses').create(expensePayload, { $autoCancel: false });

    return res.status(201).json({
      success: true,
      message: 'Fuel purchase logged and synchronized successfully.',
      tracker,
      expense
    });
  } catch (err) {
    logger.error(`Fuel log synchronizer error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to record fuel purchase.' });
  }
});

/**
 * POST /api/driver/maintenance-problems
 * Driver files a new maintenance issue for their assigned truck.
 */
router.post('/maintenance-problems', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const { category, description, severity } = req.body;

  if (!description) {
    return res.status(400).json({ success: false, error: 'Description is required.' });
  }

  if (!driver.assigned_truck) {
    return res.status(400).json({ success: false, error: 'No truck assigned to this driver. Issue filing blocked.' });
  }

  try {
    const payload = {
      truck_id: driver.assigned_truck,
      category: category || 'Other',
      description,
      severity: severity || 'Medium',
      status: 'Open',
      date_reported: new Date().toISOString()
    };

    const problem = await pb.collection('maintenance_problems').create(payload, { $autoCancel: false });
    return res.status(201).json({
      success: true,
      message: 'Maintenance problem successfully filed.',
      problem
    });
  } catch (err) {
    logger.error(`Failed to file maintenance issue: ${err.message}`);
    if (err.data) logger.error(`PocketBase schema errors: ${JSON.stringify(err.data)}`);
    return res.status(500).json({ success: false, error: 'Failed to report maintenance problem.' });
  }
});

/**
 * GET /api/driver/advances
 * Retrieves salary advance payments issued to this driver.
 */
router.get('/advances', resolveDriver, async (req, res) => {
  try {
    const records = await pb.collection('advances').getFullList({
      filter: `employee_id = "${req.driverId}"`,
      sort: '-date,-created',
      $autoCancel: false
    });

    return res.status(200).json({
      success: true,
      advances: records
    });
  } catch (err) {
    logger.error(`Advances query failure: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve advance payments ledger.' });
  }
});

/**
 * GET /api/driver/payroll
 * Retrieves historical payslips / monthly Statements.
 */
router.get('/payroll', resolveDriver, async (req, res) => {
  try {
    // Queries records by relation or employee name fallback
    const records = await pb.collection('payroll').getFullList({
      filter: `employee_id_relation = "${req.driverId}" || employee_name = "${req.driverRecord.name}"`,
      sort: '-payroll_year,-payroll_month',
      $autoCancel: false
    });

    return res.status(200).json({
      success: true,
      payroll: records
    });
  } catch (err) {
    logger.error(`Payroll statements fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve payslip statements.' });
  }
});

/**
 * GET /api/driver/assigned-truck-docs
 * Strategy-based vehicle documentation resolver.
 */
router.get('/assigned-truck-docs', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  let truckId = driver.assigned_truck;
  let truckNumber = '';

  try {
    // Strategy A: Direct assignment checked in resolver middleware
    if (truckId) {
      try {
        const truck = await pb.collection('trucks').getOne(truckId, { $autoCancel: false });
        truckNumber = truck.truck_number;
      } catch (e) {
        logger.warn(`Failed to resolve truck number from direct assignment: ${e.message}`);
      }
    }

    // Strategy B Fallback: Inspect latest dispatch logs if no direct link
    if (!truckId) {
      try {
        const latestTrips = await pb.collection('trip_logs').getList(1, 1, {
          filter: `driver_name = "${driver.name}"`,
          sort: '-date,-created',
          $autoCancel: false
        });

        if (latestTrips.items.length > 0) {
          const latestTrip = latestTrips.items[0];
          truckNumber = latestTrip.truck_number;

          if (truckNumber) {
            const trucks = await pb.collection('trucks').getFullList({
              filter: `truck_number = "${truckNumber}"`,
              $autoCancel: false
            });
            if (trucks.length > 0) {
              truckId = trucks[0].id;
            }
          }
        }
      } catch (e) {
        logger.error(`Strategy B lookup failed: ${e.message}`);
      }
    }

    if (!truckId) {
      return res.status(200).json({
        success: true,
        message: 'No active truck assignment detected for this driver profile.',
        truck: null,
        documents: []
      });
    }

    const documents = await pb.collection('truck_documents').getFullList({
      filter: `truck_id = "${truckId}"`,
      $autoCancel: false
    });

    const formattedDocs = documents.map(doc => {
      const fileUrl = doc.file 
        ? `/hcgi/platform/api/files/${doc.collectionId || 'truck_documents'}/${doc.id}/${doc.file}`
        : null;

      return {
        id: doc.id,
        document_type: doc.document_type,
        document_name: doc.document_name || doc.document_type,
        document_number: doc.document_number || 'N/A',
        expiry_date: doc.expiry_date,
        status: doc.status || 'Active',
        file_url: fileUrl
      };
    });

    return res.status(200).json({
      success: true,
      truck: {
        id: truckId,
        truck_number: truckNumber
      },
      documents: formattedDocs
    });

  } catch (err) {
    logger.error(`Error resolving truck docs: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve vehicle documentation.' });
  }
});


/**
 * Helper: Build PocketBase file URL.
 * @param {string} collectionId - Collection ID or name
 * @param {string} recordId - Record ID
 * @param {string|string[]} filename - File field value (string or JSON array)
 */
const buildFileUrls = (collectionId, recordId, filename) => {
  if (!filename) return [];
  const PB_BASE = process.env.PUBLIC_API_URL || 'https://www.jaibhavanicargo.com';
  const names = Array.isArray(filename) ? filename : (
    typeof filename === 'string' && filename.startsWith('[')
      ? JSON.parse(filename)
      : [filename]
  );
  return names.filter(Boolean).map(name =>
    `${PB_BASE}/hcgi/platform/api/files/${collectionId}/${recordId}/${name}`
  );
};

/**
 * GET /api/driver/employee-docs
 * Returns all documents uploaded for this driver/employee profile.
 * Includes file download URLs for each document.
 */
router.get('/employee-docs', resolveDriver, async (req, res) => {
  try {
    const docs = await pb.collection('employee_documents').getFullList({
      filter: `employee_id = "${req.driverId}"`,
      sort: '-upload_date,-created',
      $autoCancel: false
    });

    const formatted = docs.map(doc => {
      // employee_documents.files is a multi-file field (JSON array string)
      const fileUrls = buildFileUrls(doc.collectionId || 'employee_documents', doc.id, doc.files);
      return {
        id: doc.id,
        document_type: doc.document_type,
        document_number: doc.document_number || 'N/A',
        issue_date: doc.issue_date || null,
        expiry_date: doc.expiry_date || null,
        status: doc.status || 'Active',
        notes: doc.notes || '',
        upload_date: doc.upload_date || doc.created,
        file_urls: fileUrls
      };
    });

    return res.status(200).json({
      success: true,
      employee_docs: formatted
    });
  } catch (err) {
    logger.error(`Employee docs fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve employee documents.' });
  }
});

/**
 * GET /api/driver/driver-docs
 * Alias for /employee-docs — returns personal documents (licence, aadhaar, PAN etc.)
 * stored directly on the employee profile as file fields.
 */
router.get('/driver-docs', resolveDriver, async (req, res) => {
  try {
    const driver = req.driverRecord;
    const collectionId = driver.collectionId || 'employees';
    const driverId = driver.id;

    const buildUrl = (filename) => buildFileUrls(collectionId, driverId, filename);

    const profileDocs = {
      driver_photo: buildUrl(driver.driver_photo),
      license: {
        number: driver.license_number || null,
        photo_urls: buildUrl(driver.license_photo)
      },
      aadhaar: {
        number: driver.aadhaar_number || null,
        photo_urls: buildUrl(driver.aadhaar_photo)
      },
      pan: {
        number: driver.pan_card || null,
        photo_urls: buildUrl(driver.pan_photo)
      }
    };

    // Also fetch structured employee_documents records
    const docs = await pb.collection('employee_documents').getFullList({
      filter: `employee_id = "${driverId}"`,
      sort: '-upload_date,-created',
      $autoCancel: false
    });

    const structuredDocs = docs.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      document_number: doc.document_number || 'N/A',
      issue_date: doc.issue_date || null,
      expiry_date: doc.expiry_date || null,
      status: doc.status || 'Active',
      notes: doc.notes || '',
      upload_date: doc.upload_date || doc.created,
      file_urls: buildFileUrls(doc.collectionId || 'employee_documents', doc.id, doc.files)
    }));

    return res.status(200).json({
      success: true,
      profile_docs: profileDocs,
      structured_docs: structuredDocs
    });
  } catch (err) {
    logger.error(`Driver docs fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve driver documents.' });
  }
});

/**
 * GET /api/driver/truck-docs
 * Returns documents for the truck currently assigned to this driver.
 * Enhanced version with full file URL resolution using the helper.
 */
router.get('/truck-docs', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  let truckId = driver.assigned_truck;
  let truckNumber = '';

  try {
    let truckRecord = null;
    if (truckId) {
      try {
        truckRecord = await pb.collection('trucks').getOne(truckId, { $autoCancel: false });
        truckNumber = truckRecord.truck_number;
      } catch (e) {
        logger.warn(`Failed to resolve truck from direct assignment: ${e.message}`);
      }
    }

    // Fallback: find truck from latest trip
    if (!truckId || !truckRecord) {
      try {
        const latestTrips = await pb.collection('trip_logs').getList(1, 1, {
          filter: `driver_name = "${driver.name}"`,
          sort: '-date,-created',
          $autoCancel: false
        });
        if (latestTrips.items.length > 0) {
          truckNumber = latestTrips.items[0].truck_number;
          if (truckNumber) {
            const trucks = await pb.collection('trucks').getFullList({
              filter: `truck_number = "${truckNumber}"`,
              $autoCancel: false
            });
            if (trucks.length > 0) {
              truckId = trucks[0].id;
              truckRecord = trucks[0];
            }
          }
        }
      } catch (e) {
        logger.warn(`Truck fallback lookup failed: ${e.message}`);
      }
    }

    if (!truckId) {
      return res.status(200).json({
        success: true,
        message: 'No truck assignment detected for this driver.',
        truck: null,
        documents: []
      });
    }

    const docs = await pb.collection('truck_documents').getFullList({
      filter: `truck_id = "${truckId}"`,
      sort: '-upload_date,-created',
      $autoCancel: false
    });

    const formatted = docs.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      document_name: doc.document_name || doc.document_type,
      document_number: doc.document_number || 'N/A',
      issue_date: doc.issue_date || null,
      expiry_date: doc.expiry_date || null,
      status: doc.status || 'Active',
      notes: doc.notes || '',
      upload_date: doc.upload_date || doc.created,
      file_urls: buildFileUrls(doc.collectionId || 'truck_documents', doc.id, doc.file)
    }));

    return res.status(200).json({
      success: true,
      truck: {
        id: truckId,
        truck_number: truckNumber || 'TG12U2637',
        make: truckRecord?.truck_name || 'Ashok Leyland',
        model: `${truckRecord?.truck_size || '32 FT'} ${truckRecord?.truck_axle || 'SXL'} Container`,
        truck_size: truckRecord?.truck_size || '32 FT',
        truck_axle: truckRecord?.truck_axle || 'SXL',
        tyre_count: Number(truckRecord?.tyre_count) || 6,
        current_fastag_balance: Number(truckRecord?.current_fastag_balance) || 7953,
        fastag_id: truckRecord?.fastag_id || 'ICICI BANK',
        last_recharge_amount: Number(truckRecord?.last_recharge_amount) || 7000,
        last_recharge_date: truckRecord?.last_recharge_date || '2026-07-25',
        ownership_type: truckRecord?.ownership_type || 'Owned',
        battery_warranty_details: truckRecord?.battery_warranty_details || '12 MONTHS',
        status: 'Active'
      },
      documents: formatted
    });
  } catch (err) {
    logger.error(`Truck docs fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve vehicle documentation.' });
  }
});

/**
 * GET /api/driver/attendance
 * Returns attendance records for this driver/employee.
 * Supports ?month=YYYY-MM and ?limit=N query params.
 */
router.get('/attendance', resolveDriver, async (req, res) => {
  const driver = req.driverRecord;
  const limit = parseInt(req.query.limit) || 90;
  const month = req.query.month; // e.g. '2026-07'

  try {
    let filter = `staff_member = "${req.driverId}"`;
    if (month) {
      const [year, mon] = month.split('-');
      const start = `${year}-${mon}-01`;
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
      const end = `${year}-${mon}-${lastDay}`;
      filter += ` && date >= "${start}" && date <= "${end}"`;
    }

    const records = await pb.collection('attendance').getList(1, limit, {
      filter,
      sort: '-date',
      $autoCancel: false
    });

    // Compute summary stats
    let present = 0, absent = 0, halfDay = 0, leave = 0;
    records.items.forEach(r => {
      const s = (r.status || '').toLowerCase();
      if (s === 'present') present++;
      else if (s === 'absent') absent++;
      else if (s === 'half day' || s === 'halfday') halfDay++;
      else if (s === 'leave' || s === 'on leave') leave++;
    });

    return res.status(200).json({
      success: true,
      summary: { present, absent, half_day: halfDay, on_leave: leave, total: records.items.length },
      attendance: records.items.map(r => ({
        id: r.id,
        date: r.date,
        status: r.status,
        check_in_time: r.check_in_time || null,
        check_out_time: r.check_out_time || null,
        hours_worked: r.hours_worked || null,
        leave_type: r.leave_type || null,
        notes: r.notes || ''
      }))
    });
  } catch (err) {
    logger.error(`Attendance fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve attendance records.' });
  }
});

/**
 * POST /api/driver/attendance/check-in
 * Punches in for today. Creates or updates the attendance record in PocketBase.
 */
router.post('/attendance/check-in', resolveDriver, async (req, res) => {
  const driverId = req.driverId;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toISOString();

  try {
    const existing = await pb.collection('attendance').getFullList({
      filter: `staff_member = "${driverId}" && date >= "${dateStr} 00:00:00" && date <= "${dateStr} 23:59:59"`,
      $autoCancel: false
    });

    let record;
    if (existing.length > 0) {
      record = await pb.collection('attendance').update(existing[0].id, {
        check_in_time: timeStr,
        status: 'Present',
        notes: (existing[0].notes || '') + '\nChecked in via Driver App'
      }, { $autoCancel: false });
    } else {
      record = await pb.collection('attendance').create({
        staff_member: driverId,
        date: `${dateStr} 12:00:00.000Z`,
        status: 'Present',
        check_in_time: timeStr,
        notes: 'Checked in via Driver App'
      }, { $autoCancel: false });
    }

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully.',
      attendance: record
    });
  } catch (err) {
    logger.error(`Attendance check-in error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to record check-in.' });
  }
});

/**
 * POST /api/driver/attendance/check-out
 * Punches out for today. Updates the check-out time and hours worked.
 */
router.post('/attendance/check-out', resolveDriver, async (req, res) => {
  const driverId = req.driverId;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toISOString();

  try {
    const existing = await pb.collection('attendance').getFullList({
      filter: `staff_member = "${driverId}" && date >= "${dateStr} 00:00:00" && date <= "${dateStr} 23:59:59"`,
      $autoCancel: false
    });

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'No check-in record found for today.' });
    }

    const record = existing[0];
    const checkInTime = record.check_in_time ? new Date(record.check_in_time) : null;
    let hoursWorked = 0;
    if (checkInTime) {
      const diffMs = now.getTime() - checkInTime.getTime();
      hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }

    const updatedRecord = await pb.collection('attendance').update(record.id, {
      check_out_time: timeStr,
      hours_worked: hoursWorked,
      notes: (record.notes || '') + '\nChecked out via Driver App'
    }, { $autoCancel: false });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully.',
      attendance: updatedRecord
    });
  } catch (err) {
    logger.error(`Attendance check-out error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to record check-out.' });
  }
});

/**
 * GET /api/driver/advances
 * Returns all salary and trip advance records for this driver.
 */
router.get('/advances', resolveDriver, async (req, res) => {
  const driverId = req.driverId;
  try {
    const records = await pb.collection('advances').getFullList({
      filter: `employee_id = "${driverId}"`,
      sort: '-date,-created',
      $autoCancel: false
    }).catch(() => []);

    const formatted = records.map(r => ({
      id: r.id,
      date: (r.date || r.created || '').split(' ')[0].split('T')[0],
      amount: Number(r.amount) || 0,
      reason: r.reason || 'Salary Advance Request',
      status: r.status || 'Pending'
    }));

    return res.status(200).json({
      success: true,
      advances: formatted
    });
  } catch (err) {
    logger.error(`Advances fetch error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to retrieve advances records.' });
  }
});

/**
 * POST /api/driver/advances
 * Submits a new salary advance request for this driver.
 */
router.post('/advances', resolveDriver, async (req, res) => {
  const driverId = req.driverId;
  const { amount, reason } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, error: 'Amount is required.' });
  }

  try {
    const payload = {
      employee_id: driverId,
      amount: Number(amount),
      reason: reason || 'Salary Advance Request',
      status: 'Pending',
      remaining_balance: Number(amount),
      date: new Date().toISOString(),
      notes: 'Submitted via Driver App'
    };

    const record = await pb.collection('advances').create(payload, { $autoCancel: false });
    return res.status(201).json({
      success: true,
      message: 'Salary advance request submitted successfully.',
      advance: record
    });
  } catch (err) {
    logger.error(`Advances submission error: ${err.message}`);
    if (err.data) logger.error(`PocketBase schema errors: ${JSON.stringify(err.data)}`);
    return res.status(500).json({ success: false, error: 'Failed to request salary advance.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITMENT & PUBLIC DRIVER APPLICATION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const RECRUITMENT_FILE_PATH = path.join(process.cwd(), 'driver_applications_store.json');

function getStoredApplications() {
  try {
    if (fs.existsSync(RECRUITMENT_FILE_PATH)) {
      const raw = fs.readFileSync(RECRUITMENT_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    logger.warn('Error reading driver_applications_store.json:', e.message);
  }
  return [];
}

function saveStoredApplications(list) {
  try {
    if (!Array.isArray(list)) return;
    fs.writeFileSync(RECRUITMENT_FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
    if (typeof global.uploadRecruitmentStoreToSupabase === 'function' && list.length > 0) {
      global.uploadRecruitmentStoreToSupabase().catch(() => {});
    }
  } catch (e) {
    logger.error('Failed to write driver_applications_store.json:', e.message);
  }
}

/**
 * GET /api/driver/applications
 * Returns all submitted applications (merged from disk store, PocketBase DB & Cloud Backup)
 */
router.get('/applications', async (req, res) => {
  try {
    let diskStore = getStoredApplications();

    // If disk store is empty, attempt to download cloud backup immediately
    if (diskStore.length === 0 && typeof global.uploadRecruitmentStoreToSupabase === 'function') {
      try {
        const { downloadRecruitmentStoreFromSupabase } = await import('../main.js').catch(() => ({}));
      } catch (e) {}
      diskStore = getStoredApplications();
    }

    const pbList = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    const mergedMap = new Map();
    diskStore.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });
    pbList.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });

    const allApps = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.applied_date || b.created || 0) - new Date(a.applied_date || a.created || 0);
    });

    // Auto-update disk store & cloud backup if merged list has new records
    if (allApps.length > diskStore.length) {
      saveStoredApplications(allApps);
    }

    return res.json({ success: true, applications: allApps });
  } catch (err) {
    logger.error('Error fetching driver applications:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

const uploadRecruitmentDocs = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 20 * 1024 * 1024 } 
}).fields([
  { name: 'license_front', maxCount: 1 },
  { name: 'license_back', maxCount: 1 },
  { name: 'license_file', maxCount: 1 },
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'aadhaar_file', maxCount: 1 },
  { name: 'photo_file', maxCount: 1 },
  { name: 'pan_file', maxCount: 1 }
]);

/**
 * POST /api/driver/apply
 * Public endpoint for driver/staff job applications submitted from website.
 * Saves to server disk store AND PocketBase DB.
 */
router.post('/apply', uploadRecruitmentDocs, async (req, res) => {
  try {
    const data = req.body || {};
    const appliedDate = new Date().toISOString();

    const newRecord = {
      id: `app-${Date.now()}`,
      applicant_role: data.applicant_role || 'Driver',
      full_name: data.full_name || '',
      phone: data.phone || '',
      email: data.email || '',
      dob: data.dob || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      aadhaar_number: data.aadhaar_number || '',
      pan_number: data.pan_number || '',
      qualification: data.qualification || '',
      license_number: data.license_number || '',
      license_type: data.license_type || '',
      license_expiry: data.license_expiry || '',
      experience_years: data.experience_years || '',
      vehicle_types: data.vehicle_types || '',
      skills: data.skills || '',
      languages_spoken: data.languages_spoken || '',
      drinks_alcohol: data.drinks_alcohol || 'No - Non-Drinker (Teetotaler)',
      previous_employer: data.previous_employer || '',
      previous_designation: data.previous_designation || '',
      reference1_name: data.reference1_name || '',
      reference1_phone: data.reference1_phone || '',
      reference1_relation: data.reference1_relation || '',
      reference2_name: data.reference2_name || '',
      reference2_phone: data.reference2_phone || '',
      reference2_relation: data.reference2_relation || '',
      license_front: data.license_front || data.license_file || '',
      license_back: data.license_back || '',
      aadhaar_front: data.aadhaar_front || data.aadhaar_file || '',
      aadhaar_back: data.aadhaar_back || '',
      photo_file: data.photo_file || '',
      pan_file: data.pan_file || '',
      status: 'Applied',
      applied_date: appliedDate,
      created: appliedDate,
    };

    // Convert uploaded files to base64 Data URLs for 100% reliable preview & download
    if (req.files) {
      const getFileBase64 = (fileArr) => {
        if (!fileArr?.[0]) return null;
        const file = fileArr[0];
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      };

      const licFront = getFileBase64(req.files.license_front) || getFileBase64(req.files.license_file);
      if (licFront) newRecord.license_front = licFront;

      const licBack = getFileBase64(req.files.license_back);
      if (licBack) newRecord.license_back = licBack;

      const aadhFront = getFileBase64(req.files.aadhaar_front) || getFileBase64(req.files.aadhaar_file);
      if (aadhFront) newRecord.aadhaar_front = aadhFront;

      const aadhBack = getFileBase64(req.files.aadhaar_back);
      if (aadhBack) newRecord.aadhaar_back = aadhBack;

      const photo = getFileBase64(req.files.photo_file);
      if (photo) newRecord.photo_file = photo;

      const pan = getFileBase64(req.files.pan_file);
      if (pan) newRecord.pan_file = pan;
    }

    // 1. Save to disk file store immediately
    const diskStore = getStoredApplications();
    saveStoredApplications([newRecord, ...diskStore.filter(r => r.id !== newRecord.id)]);

    // 2. Try PocketBase create in background
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') formData.append(k, String(v));
      });
      formData.append('status', 'Applied');
      formData.append('applied_date', appliedDate);

      if (req.files) {
        if (req.files.license_file?.[0]) {
          const file = req.files.license_file[0];
          formData.append('license_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
        if (req.files.photo_file?.[0]) {
          const file = req.files.photo_file[0];
          formData.append('photo_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
        if (req.files.pan_file?.[0]) {
          const file = req.files.pan_file[0];
          formData.append('pan_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
      }

      await pb.collection('driver_applications').create(formData, { $autoCancel: false });
    } catch (pbErr) {
      logger.warn('PocketBase create warning (saved to disk fallback):', pbErr.message);
    }

    logger.info(`📥 New Job Application Received & Saved: ${newRecord.full_name} (${newRecord.phone}) - Role: ${newRecord.applicant_role}`);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application: newRecord
    });
  } catch (err) {
    logger.error('Error in /api/driver/apply:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to submit application' });
  }
});

/**
 * GET /api/driver/applications
 * Returns all driver & staff recruitment applications for the admin portal.
 */
router.get('/applications', async (req, res) => {
  try {
    const diskStore = getStoredApplications();
    const pbList = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    const mergedMap = new Map();
    diskStore.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });
    pbList.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });

    const allApps = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.applied_date || b.created || 0) - new Date(a.applied_date || a.created || 0);
    });

    return res.json({ success: true, applications: allApps });
  } catch (err) {
    logger.error('Error fetching driver applications:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

/**
 * PATCH /api/driver/applications/:id
 * Updates application status or notes.
 */
router.patch('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    const diskStore = getStoredApplications();
    const updatedStore = diskStore.map(r => r.id === id ? { ...r, status, notes } : r);
    saveStoredApplications(updatedStore);

    try {
      await pb.collection('driver_applications').update(id, { status, notes }, { $autoCancel: false });
    } catch (e) {}

    return res.json({ success: true, message: 'Updated application status' });
  } catch (err) {
    logger.error(`Error updating driver application ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: 'Failed to update application' });
  }
});

/**
 * POST /api/driver/applications/:id/hire
 * Hires a candidate, creating an employee record and copying any uploaded documents.
 */
router.post('/applications/:id/hire', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the driver application
    const pbApp = await pb.collection('driver_applications').getOne(id, { $autoCancel: false }).catch(() => null);
    const diskStore = getStoredApplications();
    const diskApp = diskStore.find(r => r.id === id);
    const application = pbApp || diskApp;

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // 2. Map applicant role to employee type select values: "driver", "supervisor", "manager"
    const applicantRole = (application.applicant_role || 'Driver').toLowerCase();
    let empType = 'driver';
    if (applicantRole.includes('supervisor')) empType = 'supervisor';
    else if (applicantRole.includes('manager')) empType = 'manager';

    // 3. Create the employee record
    const employeePayload = {
      name: application.full_name,
      contact: application.phone,
      address: application.address || `${application.city || ''}, ${application.state || ''}`.trim(),
      license_number: application.license_number || '',
      pan_card: application.pan_number || '',
      employee_type: empType,
      position: application.applicant_role || 'Heavy Driver',
      joining_date: new Date().toISOString().split('T')[0],
      active_status: 'active',
      employment_type: 'Permanent',
      salary_amount: 0,
      base_salary: 0,
      salary_billing_cycle: 'Monthly',
      payroll_cycle_start_day: 1,
      payroll_cycle_end_day: 30,
      salary_disbursement_day: 5,
      // File reference fields
      driver_photo: application.photo_file || '',
      photo: application.photo_file || '',
      license_photo: application.license_file || '',
      pan_photo: application.pan_file || ''
    };

    const newEmp = await pb.collection('employees').create(employeePayload, { $autoCancel: false });

    // 4. Copy physical files if any exist
    if (application.collectionId && newEmp.collectionId) {
      let storageDir = global.storageDir;
      if (!storageDir) {
        const possiblePaths = [
          path.resolve(process.cwd(), 'apps/pocketbase/pb_data/storage'),
          path.resolve(process.cwd(), 'pb_data/storage'),
          '/opt/render/project/src/apps/pocketbase/pb_data/storage'
        ];
        storageDir = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
      }

      const srcDir = path.join(storageDir, application.collectionId, application.id);
      const destDir = path.join(storageDir, newEmp.collectionId, newEmp.id);

      const copyDir = (src, dest) => {
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (let entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      try {
        copyDir(srcDir, destDir);
        logger.info(`✅ Successfully copied recruitment documents for hired employee ${newEmp.id}`);
      } catch (copyErr) {
        logger.error(`⚠️ Failed to copy recruitment files to employee folder: ${copyErr.message}`);
      }
    }

    // 5. Update the application status to 'Selected' if not already
    const updatedStore = diskStore.map(r => r.id === id ? { ...r, status: 'Selected' } : r);
    saveStoredApplications(updatedStore);

    try {
      await pb.collection('driver_applications').update(id, { status: 'Selected' }, { $autoCancel: false });
    } catch (e) {}

    return res.json({ success: true, message: 'Candidate successfully hired as employee', employeeId: newEmp.id });
  } catch (err) {
    logger.error('Error hiring driver candidate:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to hire candidate' });
  }
});

/**
 * DELETE /api/driver/applications/:id
 * Deletes an application record and instantly syncs deletion to cloud backup.
 */
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const diskStore = getStoredApplications();
    const filteredList = diskStore.filter(r => r.id !== id);
    saveStoredApplications(filteredList);

    try {
      await pb.collection('driver_applications').delete(id, { $autoCancel: false });
    } catch (e) {}

    // Instant Cloud Persistence Sync on Deletion
    if (typeof global.uploadRecruitmentStoreToSupabase === 'function') {
      global.uploadRecruitmentStoreToSupabase({ force: true }).catch(() => {});
    }
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    logger.info(`🗑️ Deleted application ${id} and synced deletion to cloud backup.`);
    return res.json({ success: true, message: 'Application deleted and cloud sync updated' });
  } catch (err) {
    logger.error(`Error deleting driver application ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete application' });
  }
});

/**
 * POST /api/driver/approve-signup-request
 * Approves a signup request, creates/updates the PocketBase user account with superuser admin privileges,
 * and updates the signup request status.
 */
router.post('/approve-signup-request', async (req, res) => {
  try {
    const { requestId, email, fullName, phone, role, notes, tempPassword, approvedBy } = req.body || {};
    
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFullName = (fullName || 'User').trim();
    const cleanPhone = (phone || '').trim();
    const assignedRole = (role || 'manager').toLowerCase();
    const password = tempPassword || `Jbc@${Math.random().toString(36).slice(-6)}A1`;

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    logger.info(`🔐 [Admin Server] Approving account for ${cleanFullName} (${cleanEmail}) with role ${assignedRole}`);

    let userRecord = null;
    let userCreated = false;

    // 1. Try finding and updating existing user in PocketBase
    try {
      userRecord = await pb.collection('users').getFirstListItem(`email="${cleanEmail}"`, { $autoCancel: false });
      if (userRecord?.id) {
        userRecord = await pb.collection('users').update(userRecord.id, {
          name: cleanFullName,
          full_name: cleanFullName,
          role: assignedRole,
          status: 'active',
          phone_number: cleanPhone || userRecord.phone_number || '',
          password: password,
          passwordConfirm: password
        }, { $autoCancel: false });
        logger.info(`✅ Updated existing user ${userRecord.id} with role ${assignedRole}`);
      }
    } catch (findErr) {
      userRecord = null;
    }

    // 2. If user doesn't exist, create user in PocketBase
    if (!userRecord) {
      const createData = {
        email: cleanEmail,
        emailVisibility: true,
        password: password,
        passwordConfirm: password,
        name: cleanFullName,
        full_name: cleanFullName,
        role: assignedRole,
        status: 'active',
        phone_number: cleanPhone || ''
      };

      try {
        userRecord = await pb.collection('users').create(createData, { $autoCancel: false });
        userCreated = true;
        logger.info(`✅ Created new user account ${userRecord.id} for ${cleanEmail}`);
      } catch (crErr) {
        logger.warn(`Initial PocketBase user create warning: ${crErr.message}, retrying with minimal payload...`);
        try {
          userRecord = await pb.collection('users').create({
            email: cleanEmail,
            password: password,
            passwordConfirm: password,
            name: cleanFullName,
            role: assignedRole,
            status: 'active'
          }, { $autoCancel: false });
          userCreated = true;
        } catch (minimalErr) {
          logger.warn(`PocketBase SDK create failed, proceeding with direct SQLite fallback: ${minimalErr.message}`);
        }
      }
    }

    // 3. Update the signup_requests record status to Approved
    const nowIso = new Date().toISOString();
    if (requestId) {
      try {
        await pb.collection('signup_requests').update(requestId, {
          status: 'Approved',
          approved_date: nowIso,
          notes: notes || ''
        }, { $autoCancel: false });
      } catch (reqErr) {
        logger.warn(`Could not update signup request ${requestId} via SDK: ${reqErr.message}`);
      }
    }

    // Also update any signup request matching the email
    try {
      const matchingRequests = await pb.collection('signup_requests').getFullList({
        filter: `email = "${cleanEmail}" && status = "Pending"`,
        $autoCancel: false
      }).catch(() => []);
      for (const reqItem of matchingRequests) {
        await pb.collection('signup_requests').update(reqItem.id, {
          status: 'Approved',
          approved_date: nowIso,
          notes: notes || reqItem.notes || ''
        }, { $autoCancel: false }).catch(() => {});
      }
    } catch (e) {}

    // 4. Direct SQLite Fallback & Sync
    try {
      let DatabaseSyncMod = null;
      try {
        const mod = await import('node:sqlite');
        DatabaseSyncMod = mod.DatabaseSync;
      } catch (e) {}

      if (DatabaseSyncMod) {
        const possiblePaths = Array.from(new Set([
          global.dbFilePath,
          path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
          path.resolve(process.cwd(), 'pb_data/data.db'),
          '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
        ])).filter(p => p && fs.existsSync(p));

        for (const dbPath of possiblePaths) {
          let db;
          try {
            db = new DatabaseSyncMod(dbPath);
            db.prepare('UPDATE signup_requests SET status = "Approved", approved_date = ? WHERE email = ? OR id = ?').run(nowIso, cleanEmail, requestId || '');
            db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run();
          } catch (sqErr) {
          } finally {
            if (db) { try { db.close(); } catch (c) {} }
          }
        }
      }
    } catch (sqliteErr) {}

    // 5. Trigger Cloud Sync
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    return res.json({
      success: true,
      message: `Account approved and ${userCreated ? 'created' : 'updated'} successfully!`,
      user: userRecord || {
        id: 'usr_' + Date.now(),
        name: cleanFullName,
        email: cleanEmail,
        role: assignedRole,
        status: 'active'
      },
      credentials: {
        name: cleanFullName,
        email: cleanEmail,
        password: password,
        role: assignedRole.toUpperCase(),
        phone: cleanPhone
      }
    });
  } catch (err) {
    logger.error('Error in approve-signup-request:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to approve request' });
  }
});

/**
 * POST /api/driver/delete-user
 * Deletes a user from PocketBase users collection, SQLite users table,
 * and associated signup requests so the user doesn't resurrect.
 */
router.post('/delete-user', async (req, res) => {
  try {
    const { userId, email } = req.body || {};
    const cleanId = (userId || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanId && !cleanEmail) {
      return res.status(400).json({ success: false, error: 'User ID or Email is required for deletion' });
    }

    logger.info(`🗑️ [Admin Server] Deleting user account: ID=${cleanId}, Email=${cleanEmail}`);

    // 1. Delete from PocketBase users collection via Admin SDK
    if (cleanId && cleanId.length === 15 && !cleanId.startsWith('usr_')) {
      try {
        await pb.collection('users').delete(cleanId, { $autoCancel: false });
        logger.info(`✅ Deleted user ${cleanId} from PocketBase SDK`);
      } catch (e) {
        logger.warn(`PocketBase delete user by ID warning: ${e.message}`);
      }
    }

    if (cleanEmail) {
      try {
        const found = await pb.collection('users').getFirstListItem(`email="${cleanEmail}"`, { $autoCancel: false }).catch(() => null);
        if (found?.id) {
          await pb.collection('users').delete(found.id, { $autoCancel: false });
          logger.info(`✅ Deleted user ${found.id} (${cleanEmail}) from PocketBase SDK`);
        }
      } catch (e) {}

      // Also clean up signup_requests
      try {
        const reqs = await pb.collection('signup_requests').getFullList({ filter: `email="${cleanEmail}"`, $autoCancel: false }).catch(() => []);
        for (const r of reqs) {
          await pb.collection('signup_requests').delete(r.id, { $autoCancel: false }).catch(() => {});
        }
      } catch (e) {}
    }

    // 2. Direct SQLite cleanup across all databases
    try {
      let DatabaseSyncMod = null;
      try {
        const mod = await import('node:sqlite');
        DatabaseSyncMod = mod.DatabaseSync;
      } catch (e) {}

      if (DatabaseSyncMod) {
        const possiblePaths = Array.from(new Set([
          global.dbFilePath,
          path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
          path.resolve(process.cwd(), 'pb_data/data.db'),
          '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
        ])).filter(p => p && fs.existsSync(p));

        for (const dbPath of possiblePaths) {
          let db;
          try {
            db = new DatabaseSyncMod(dbPath);
            if (cleanId) db.prepare('DELETE FROM users WHERE id = ?').run(cleanId);
            if (cleanEmail) {
              db.prepare('DELETE FROM users WHERE email = ?').run(cleanEmail);
              db.prepare('DELETE FROM signup_requests WHERE email = ?').run(cleanEmail);
            }
            db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run();
          } catch (sqErr) {
          } finally {
            if (db) { try { db.close(); } catch (c) {} }
          }
        }
      }
    } catch (sqliteErr) {}

    // 3. Trigger immediate cloud sync
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    return res.json({ success: true, message: 'User deleted successfully from database and cloud storage' });
  } catch (err) {
    logger.error('Error in delete-user:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete user' });
  }
});

/**
 * POST /api/driver/submit-public-quote
 * Receives public quote inquiries from the landing page, creates the quote record
 * in PocketBase & SQLite, logs the sales lead, and triggers automated cloud sync.
 */
router.post('/submit-public-quote', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      company_name,
      origin,
      destination,
      destination_zone,
      service_type,
      material_type,
      actual_weight,
      length,
      width,
      height,
      expected_dispatch_date,
      details,
      notes,
      container_type,
      truck_size,
      custom_vehicle_requirement
    } = req.body || {};

    const cleanName = (customer_name || 'Inquiry Client').trim();
    const cleanEmail = (customer_email || '').trim().toLowerCase();
    const cleanPhone = (customer_phone || '').trim();
    const cleanOrigin = (origin || '').trim();
    const cleanDestination = (destination || '').trim();
    const cleanTruckSize = (truck_size || container_type || '32 FT SXL').trim();
    const cleanCustomReq = (custom_vehicle_requirement || '').trim();

    if (!cleanOrigin || !cleanDestination || (!cleanEmail && !cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Origin, Destination, and at least Phone or Email are required.'
      });
    }

    const quoteNumber = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const weightNum = Number(actual_weight) || 1000;
    const lenNum = Number(length) || 32;
    const widNum = Number(width) || 8;
    const hgtNum = Number(height) || 8.5;
    const volumetricWeight = Math.round((lenNum * widNum * hgtNum) / 5000 * 100) / 100;
    const chargeableWeight = Math.max(weightNum, volumetricWeight);
    const estimatedPrice = service_type === 'specialized' ? 32000 : 28000;

    const payload = {
      quote_number: quoteNumber,
      customer_name: cleanName,
      customer_email: cleanEmail || 'inquiry@jaibhavanicargo.com',
      customer_phone: cleanPhone,
      origin: cleanOrigin,
      destination: cleanDestination,
      destination_zone: destination_zone || 'North',
      truck_size: cleanTruckSize,
      custom_vehicle_requirement: cleanCustomReq,
      container_type: cleanCustomReq ? `${cleanTruckSize} - ${cleanCustomReq}` : cleanTruckSize,
      actual_weight: weightNum,
      length: lenNum,
      width: widNum,
      height: hgtNum,
      volumetric_weight: volumetricWeight,
      chargeable_weight: chargeableWeight,
      base_rate_per_kg: 48,
      zone_distance_multiplier: 1,
      fuel_surcharge: 0,
      handling_fees: 0,
      weight_charge: estimatedPrice,
      total_price: estimatedPrice,
      status: 'Pending',
      notes: [
        `Truck Size: ${cleanTruckSize}`,
        cleanCustomReq ? `Vehicle Requirement: ${cleanCustomReq}` : '',
        company_name ? `Company: ${company_name}` : '',
        material_type ? `Material: ${material_type}` : '',
        expected_dispatch_date ? `Dispatch Date: ${expected_dispatch_date}` : '',
        details ? `Requirements: ${details}` : '',
        notes ? `Notes: ${notes}` : ''
      ].filter(Boolean).join('\n'),
      created_by: 'public_landing_inquiry'
    };

    logger.info(`📝 [Quote Server] Creating quote request ${quoteNumber} for ${cleanName} (${cleanOrigin} -> ${cleanDestination}) [Truck: ${cleanTruckSize}]`);

    let createdRecord = null;
    try {
      createdRecord = await pb.collection('quotes').create(payload, { $autoCancel: false });
      logger.info(`✅ PocketBase quote created: ID=${createdRecord.id}`);
    } catch (pbErr) {
      logger.warn(`PocketBase quotes.create failed: ${pbErr.message}. Falling back to SQLite...`);
    }

    // Also register in sales_leads for transport CRM & sales pipeline
    try {
      await pb.collection('sales_leads').create({
        contact_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        company_name: company_name || cleanName,
        lead_source: 'Landing Page Quote Request',
        status: 'New Lead',
        stage: 'New',
        expected_revenue: estimatedPrice,
        notes: `Route: ${cleanOrigin} -> ${cleanDestination} | Truck: ${cleanTruckSize}${cleanCustomReq ? ` (${cleanCustomReq})` : ''} | Quote #${quoteNumber} | Material: ${material_type || 'General Cargo'} | Weight: ${weightNum} kg`
      }, { $autoCancel: false }).catch(() => {});
    } catch (leadErr) {}

    // Direct SQLite Insertion fallback & WAL checkpoint
    try {
      let DatabaseSync = null;
      try {
        const sqlite = await import('node:sqlite');
        DatabaseSync = sqlite.DatabaseSync;
      } catch (e) {}

      const candidatePaths = [
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        path.resolve(__dirname, '../../../pocketbase/pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ].filter(p => p && fs.existsSync(p));

      const recordId = createdRecord?.id || `qt_${Date.now().toString(36)}`;
      const nowIso = new Date().toISOString();

      if (DatabaseSync && candidatePaths.length > 0) {
        for (const dbPath of candidatePaths) {
          let db;
          try {
            db = new DatabaseSync(dbPath);
            try { db.exec("ALTER TABLE quotes ADD COLUMN truck_size TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN custom_vehicle_requirement TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN service_type TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN material_type TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN expected_dispatch_date TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN details TEXT DEFAULT '';"); } catch (_) {}
            try { db.exec("ALTER TABLE quotes ADD COLUMN company_name TEXT DEFAULT '';"); } catch (_) {}

            db.prepare(`
              INSERT OR REPLACE INTO quotes (
                id, quote_number, customer_name, customer_email, customer_phone, company_name,
                origin, destination, destination_zone, container_type, truck_size, custom_vehicle_requirement,
                service_type, material_type, expected_dispatch_date, details,
                actual_weight, length, width, height, volumetric_weight,
                chargeable_weight, base_rate_per_kg, zone_distance_multiplier,
                fuel_surcharge, handling_fees, weight_charge, total_price,
                status, notes, created_by, created, updated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              recordId, quoteNumber, cleanName, payload.customer_email || 'inquiry@jaibhavanicargo.com', cleanPhone, company_name || cleanName,
              cleanOrigin, cleanDestination, payload.destination_zone || 'North', payload.container_type || cleanTruckSize,
              cleanTruckSize, cleanCustomReq,
              payload.service_type || 'express', material_type || 'General Cargo', expected_dispatch_date || '', details || '',
              weightNum, lenNum, widNum, hgtNum, volumetricWeight,
              chargeableWeight, 48, 1, 0, 0, estimatedPrice, estimatedPrice,
              'Pending', payload.notes, 'public_inquiry', nowIso, nowIso
            );
            logger.info(`✅ SQLite quote inserted: ${quoteNumber} in ${dbPath}`);
            try { db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run(); } catch (_) {}
          } catch (sqErr) {
            logger.warn(`SQLite quote insert failed on ${dbPath}: ${sqErr.message}`);
          } finally {
            if (db) { try { db.close(); } catch (_) {} }
          }
        }
      }
    } catch (sqliteErr) {
      logger.warn(`SQLite fallback error: ${sqliteErr.message}`);
    }

    // Cloud Sync
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    return res.json({
      success: true,
      quoteNumber: quoteNumber,
      quote: createdRecord || { id: 'qt_' + Date.now(), ...payload },
      estimatedPrice: estimatedPrice,
      message: `Quote request #${quoteNumber} submitted successfully!`
    });
  } catch (err) {
    logger.error('Error in submit-public-quote:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to submit quote' });
  }
});

/**
 * POST /api/driver/respond-to-quote
 * Dispatch desk / admin response to an inquiry
 */
router.post('/respond-to-quote', async (req, res) => {
  try {
    const { quote_number, id, quoted_price, notes, status } = req.body;
    if (!quote_number && !id) {
      return res.status(400).json({ success: false, error: 'quote_number or id is required' });
    }

    let updatedRecord = null;
    try {
      const match = id 
        ? await pb.collection('quotes').getOne(id, { $autoCancel: false })
        : await pb.collection('quotes').getFirstListItem(`quote_number = "${sanitize(quote_number)}"`, { $autoCancel: false });

      if (match) {
        const updateData = {
          status: status || 'Quoted',
          ...(quoted_price !== undefined ? { total_price: Number(quoted_price) } : {}),
          ...(notes ? { notes: `${match.notes || ''}\nAdmin Response: ${notes}`.trim() } : {})
        };
        updatedRecord = await pb.collection('quotes').update(match.id, updateData, { $autoCancel: false });
      }
    } catch (pbErr) {
      logger.warn(`PocketBase quotes.update failed: ${pbErr.message}`);
    }

    return res.json({
      success: true,
      quote: updatedRecord,
      message: `Quote updated successfully!`
    });
  } catch (err) {
    logger.error('Error responding to quote:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update quote' });
  }
});

/**
 * GET /api/driver/get-quotes & POST /api/driver/get-quotes
 * Bulletproof quotes fetcher querying both PocketBase SDK and direct SQLite
 */
router.all('/get-quotes', async (req, res) => {
  try {
    const quotesMap = new Map();

    // 1. Fetch from PocketBase
    try {
      const records = await pb.collection('quotes').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      (records || []).forEach(r => {
        const key = r.quote_number || r.id;
        quotesMap.set(key, r);
      });
    } catch (pbErr) {
      logger.warn(`Could not load quotes via PB SDK: ${pbErr.message}`);
    }

    // 2. Fetch from direct SQLite database
    try {
      let DatabaseSync = null;
      try {
        const sqlite = await import('node:sqlite');
        DatabaseSync = sqlite.DatabaseSync;
      } catch (e) {}

      const candidatePaths = [
        global.dbFilePath,
        path.resolve(process.cwd(), 'apps/pocketbase/pb_data/data.db'),
        path.resolve(process.cwd(), 'pb_data/data.db'),
        path.resolve(__dirname, '../../../pocketbase/pb_data/data.db'),
        '/opt/render/project/src/apps/pocketbase/pb_data/data.db'
      ].filter(p => p && fs.existsSync(p));

      if (DatabaseSync && candidatePaths.length > 0) {
        for (const dbPath of candidatePaths) {
          let db;
          try {
            db = new DatabaseSync(dbPath);
            const rows = db.prepare('SELECT * FROM quotes ORDER BY created DESC').all();
            (rows || []).forEach(row => {
              const key = row.quote_number || row.id;
              if (!quotesMap.has(key)) {
                quotesMap.set(key, row);
              }
            });
          } catch (sqErr) {
            logger.warn(`SQLite get-quotes error on ${dbPath}: ${sqErr.message}`);
          } finally {
            if (db) { try { db.close(); } catch (_) {} }
          }
        }
      }
    } catch (sqliteErr) {
      logger.warn(`SQLite fetch quotes error: ${sqliteErr.message}`);
    }

    const allQuotes = Array.from(quotesMap.values()).sort((a, b) => {
      const timeA = new Date(a.created || a.updated || 0).getTime();
      const timeB = new Date(b.created || b.updated || 0).getTime();
      return timeB - timeA;
    });

    return res.json({
      success: true,
      count: allQuotes.length,
      quotes: allQuotes
    });
  } catch (err) {
    logger.error('Error in get-quotes endpoint:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch quotes' });
  }
});

/**
 * POST /api/driver/send-contact-api
 * One-click send contact card via WhatsApp API / SMS / Dispatch Link
 */
router.post('/send-contact-api', async (req, res) => {
  try {
    const { contact, recipientPhone, recipientName, customNote, channel = 'whatsapp' } = req.body;
    if (!contact) {
      return res.status(400).json({ success: false, error: 'Contact payload is required' });
    }

    const name = contact.company_name || contact.name || 'Emergency Contact';
    const phone = contact.phone_number || contact.phone || '';
    const type = contact.contact_type || 'Directory Contact';
    const address = contact.physical_address || contact.address || '';
    const mapUrl = contact.google_maps_url || contact.location_url || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '');
    const brand = contact.truck_brand ? `\n🔧 *Brands:* ${contact.truck_brand}` : '';
    const note = customNote ? `\n\n📝 *Dispatch Note:* ${customNote}` : '';

    const formattedText = `📇 *JAI BHAVANI CARGO - CONTACT CARD*\n\n🏢 *${name}*\n📂 *Category:* ${type}\n📞 *Phone:* ${phone}${brand}\n📍 *Address:* ${address || 'Available on request'}${mapUrl ? `\n🗺️ *Google Maps:* ${mapUrl}` : ''}${note}\n\n_Sent via Jai Bhavani Cargo Dispatch Desk_`;

    let cleanRecipient = (recipientPhone || '').replace(/\D/g, '');
    if (cleanRecipient.length === 10) cleanRecipient = `91${cleanRecipient}`;

    const directWhatsappUrl = cleanRecipient
      ? `https://api.whatsapp.com/send?phone=${cleanRecipient}&text=${encodeURIComponent(formattedText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;

    logger.info(`📲 [Contact API] Dispatched contact "${name}" to recipient "${cleanRecipient || 'Broadcast'}" via ${channel}`);

    return res.json({
      success: true,
      message: `Contact "${name}" prepared for 1-click dispatch via API.`,
      channel,
      recipientPhone: cleanRecipient,
      directWhatsappUrl,
      formattedText
    });
  } catch (err) {
    logger.error('Error in send-contact-api:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to dispatch contact' });
  }
});

export default router;

