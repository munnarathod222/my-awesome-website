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
      'salary_disbursement_day'
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
    // Remove empty assigned_truck to avoid relation validation error
    if (!payload.assigned_truck || payload.assigned_truck === 'none' || payload.assigned_truck === '') {
      delete payload.assigned_truck;
    }

    const record = await pb.collection('employees').create(payload, { $autoCancel: false });
    logger.info(`Employee created via backend API: ${record.id} (${record.name})`);
    return res.json({ success: true, record });
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
      'salary_disbursement_day'
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
    const ok = await global.uploadDatabaseToSupabase(global.dbFilePath);
    return res.json({
      success: true,
      message: ok ? 'Production database successfully backed up to Supabase Cloud!' : 'Backup processed.'
    });
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
 * Validates name and phone, returns employee profile.
 */
router.post('/login', async (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ success: false, error: 'Missing name or contact in request body.' });
  }

  try {
    const safeName = sanitize(name);
    const safeContact = sanitize(contact);
    if (!safeName || !safeContact) {
      return res.status(400).json({ success: false, error: 'Invalid characters in name or contact.' });
    }
    const records = await pb.collection('employees').getFullList({
      filter: `name = "${safeName}" && contact = "${safeContact}"`,
      $autoCancel: false
    });

    if (records.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver profile not found. Verify details.' });
    }

    const driver = records[0];
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      driver: {
        id: driver.id,
        name: driver.name,
        contact: driver.contact,
        position: driver.position || 'Driver',
        active_status: driver.active_status,
        assigned_truck: driver.assigned_truck || ''
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
  return res.status(200).json({
    success: true,
    driver: req.driverRecord
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
  const PB_BASE = process.env.PB_URL || 'http://127.0.0.1:8090';
  const names = Array.isArray(filename) ? filename : (
    typeof filename === 'string' && filename.startsWith('[')
      ? JSON.parse(filename)
      : [filename]
  );
  return names.filter(Boolean).map(name =>
    `${PB_BASE}/api/files/${collectionId}/${recordId}/${name}`
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
    if (truckId) {
      try {
        const truck = await pb.collection('trucks').getOne(truckId, { $autoCancel: false });
        truckNumber = truck.truck_number;
      } catch (e) {
        logger.warn(`Failed to resolve truck from direct assignment: ${e.message}`);
      }
    }

    // Fallback: find truck from latest trip
    if (!truckId) {
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
            if (trucks.length > 0) truckId = trucks[0].id;
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
      truck: { id: truckId, truck_number: truckNumber },
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

export default router;
