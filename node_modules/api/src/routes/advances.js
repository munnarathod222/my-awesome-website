import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { enforceFinancialLockdown } from '../middleware/financial-lockdown.js';

const router = express.Router();

router.use(pocketbaseAuth);
router.use(enforceFinancialLockdown('advances'));

/**
 * POST /advances
 * Create a new advance and sync to cashbook and payroll
 */
router.post('/', async (req, res) => {
  const employeeId = req.body.employee_id || req.body.userId;
  const { amount, description, date, status } = req.body;

  if (!amount || !employeeId) {
    return res.status(400).json({
      error: 'amount and employee_id are required',
    });
  }

  // Create advance in PocketBase
  const advance = await pb.collection('advances').create({
    amount,
    description: description || '',
    date: date || new Date().toISOString(),
    employee_id: employeeId,
    status: status || 'pending',
    remaining_balance: amount,
  });

  // Sync to cashbook
  try {
    const cashbookData = {
      userId: employeeId,
      advanceId: advance.id,
      type: 'advance',
      amount: advance.amount,
      description: advance.description,
      date: advance.date,
      status: advance.status,
    };

    await pb.collection('cashbook').create(cashbookData);
    logger.info(`Advance ${advance.id} created and synced to cashbook`);
  } catch (error) {
    logger.error(`Failed to sync advance ${advance.id} to cashbook:`, error);
  }

  // Sync to payroll
  try {
    await syncAdvanceToPayroll({ advanceId: advance.id, employeeId: employeeId });
    logger.info(`Advance ${advance.id} synced to payroll`);
  } catch (error) {
    logger.error(`Failed to sync advance ${advance.id} to payroll:`, error);
  }

  res.status(201).json({
    success: true,
    message: 'Advance created successfully',
    advance,
  });
});

/**
 * GET /advances/:userId
 * Get all advances for a user
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: 'userId is required',
    });
  }

  const advances = await pb.collection('advances').getFullList({
    filter: pb.filter('employee_id = {:userId}', { userId }),
    sort: '-created',
  });

  res.json({
    success: true,
    advances,
  });
});

/**
 * GET /advances/with-employee-details
 * Get advances with employee details using expand
 * Query params: employee_id (filter by employee), status (filter by status)
 * Returns: {id, employee_id, employee_name, amount, date, status, remaining_balance, notes, created}
 */
router.get('/with-employee-details/list', async (req, res) => {
  const employeeId = req.query.employee_id || req.query.userId;
  const { status } = req.query;

  // Build filter
  let filter = '';
  if (employeeId) {
    filter = `employee_id = "${employeeId}"`;
  }
  if (status) {
    if (filter) {
      filter += ` && status = "${status}"`;
    } else {
      filter = `status = "${status}"`;
    }
  }

  const advances = await pb.collection('advances').getFullList({
    ...(filter && { filter }),
    sort: '-created',
  });

  // Fetch employee details for each advance
  const advancesWithEmployeeDetails = await Promise.all(
    advances.map(async (advance) => {
      let employeeName = 'Unknown';
      const empId = advance.employee_id;
      try {
        if (empId) {
          const employee = await pb.collection('employees').getOne(empId);
          employeeName = employee.name || 'Unknown';
        }
      } catch (error) {
        logger.warn(`Failed to fetch employee ${empId}:`, error.message);
      }

      return {
        id: advance.id,
        employee_id: empId,
        employee_name: employeeName,
        amount: advance.amount,
        date: advance.date,
        status: advance.status,
        remaining_balance: advance.remaining_balance ?? advance.amount,
        reason: advance.reason || '',
        expense_id: advance.expense_id || '',
        settled_date: advance.settled_date || '',
        notes: advance.notes || '',
        created: advance.created,
        updated: advance.updated,
      };
    })
  );

  res.json({
    success: true,
    advances: advancesWithEmployeeDetails,
    total: advancesWithEmployeeDetails.length,
  });
});

/**
 * GET /advances/detail/:advanceId
 * Get a specific advance
 */
router.get('/detail/:advanceId', async (req, res) => {
  const { advanceId } = req.params;

  if (!advanceId) {
    return res.status(400).json({
      error: 'advanceId is required',
    });
  }

  const advance = await pb.collection('advances').getOne(advanceId);

  if (!advance) {
    throw new Error(`Advance with ID ${advanceId} not found`);
  }

  res.json({
    success: true,
    advance,
  });
});

/**
 * PUT /advances/:advanceId
 * Update an advance and sync to cashbook and payroll
 */
router.put('/:advanceId', async (req, res) => {
  const { advanceId } = req.params;
  const { amount, description, date, status } = req.body;

  if (!advanceId) {
    return res.status(400).json({
      error: 'advanceId is required',
    });
  }

  // Get the original advance to find userId
  const originalAdvance = await pb.collection('advances').getOne(advanceId);

  if (!originalAdvance) {
    throw new Error(`Advance with ID ${advanceId} not found`);
  }

  // Update advance
  const updatedAdvance = await pb.collection('advances').update(advanceId, {
    ...(amount !== undefined && { amount }),
    ...(description !== undefined && { description }),
    ...(date !== undefined && { date }),
    ...(status !== undefined && { status }),
  });

  // Sync to cashbook
  try {
    let cashbookEntry = null;
    try {
      cashbookEntry = await pb.collection('cashbook').getFirstListItem(
        `advanceId="${advanceId}" && userId="${originalAdvance.employee_id}"`
      );
    } catch (error) {
      if (!error.message.includes('Failed to find')) {
        throw error;
      }
    }

    const cashbookData = {
      amount: updatedAdvance.amount,
      description: updatedAdvance.description,
      date: updatedAdvance.date,
      status: updatedAdvance.status,
    };

    if (cashbookEntry) {
      await pb.collection('cashbook').update(cashbookEntry.id, cashbookData);
    } else {
      await pb.collection('cashbook').create({
        userId: originalAdvance.employee_id,
        advanceId,
        type: 'advance',
        ...cashbookData,
      });
    }
    logger.info(`Advance ${advanceId} updated and synced to cashbook`);
  } catch (error) {
    logger.error(`Failed to sync advance ${advanceId} to cashbook:`, error);
  }

  // Sync to payroll
  try {
    await syncAdvanceToPayroll({ advanceId, employeeId: originalAdvance.employee_id });
    logger.info(`Advance ${advanceId} synced to payroll`);
  } catch (error) {
    logger.error(`Failed to sync advance ${advanceId} to payroll:`, error);
  }

  res.json({
    success: true,
    message: 'Advance updated successfully',
    advance: updatedAdvance,
  });
});

/**
 * DELETE /advances/:advanceId
 * Delete an advance and remove from cashbook
 */
router.delete('/:advanceId', async (req, res) => {
  const { advanceId } = req.params;

  if (!advanceId) {
    return res.status(400).json({
      error: 'advanceId is required',
    });
  }

  // Get the advance to find userId
  const advance = await pb.collection('advances').getOne(advanceId);

  if (!advance) {
    throw new Error(`Advance with ID ${advanceId} not found`);
  }

  // Delete from cashbook
  try {
    const cashbookEntry = await pb.collection('cashbook').getFirstListItem(
      `advanceId="${advanceId}" && userId="${advance.employee_id}"`
    );
    await pb.collection('cashbook').delete(cashbookEntry.id);
    logger.info(`Cashbook entry deleted for advance ${advanceId}`);
  } catch (error) {
    if (!error.message.includes('Failed to find')) {
      logger.error(`Failed to delete cashbook entry for advance ${advanceId}:`, error);
    }
  }

  // Delete advance
  await pb.collection('advances').delete(advanceId);
  logger.info(`Advance ${advanceId} deleted`);

  res.json({
    success: true,
    message: 'Advance deleted successfully',
  });
});

/**
 * POST /advances/sync-advances
 * Sync advances to payroll
 * Body: { employee_id, advance_id }
 * Logic: (1) Fetch advance record, (2) Find all payroll records for employee,
 * (3) Update payroll.advance_deductions array with new advance,
 * (4) Recalculate net_salary = gross_salary - sum(advance_deductions amounts),
 * (5) Update payroll record
 */
router.post('/sync-advances', async (req, res) => {
  const { employee_id, advance_id } = req.body;

  if (!employee_id || !advance_id) {
    return res.status(400).json({
      error: 'employee_id and advance_id are required',
    });
  }

  // Fetch advance record
  const advance = await pb.collection('advances').getOne(advance_id);

  if (!advance) {
    throw new Error(`Advance with ID ${advance_id} not found`);
  }

  if (advance.employee_id !== employee_id) {
    throw new Error(`Advance ${advance_id} does not belong to employee ${employee_id}`);
  }

  // Find all payroll records for employee
  const payrollRecords = await pb.collection('payroll').getFullList({
    filter: pb.filter('employee_id = {:employeeId}', { employeeId: employee_id }),
  });

  if (payrollRecords.length === 0) {
    logger.warn(`No payroll records found for employee ${employee_id}`);
    return res.status(404).json({
      error: 'No payroll records found for this employee',
    });
  }

  // Update each payroll record
  const updatedPayrolls = await Promise.all(
    payrollRecords.map(async (payroll) => {
      // Get current advance_deductions array
      const currentDeductions = payroll.advance_deductions || [];

      // Check if advance already exists in deductions
      const advanceExists = currentDeductions.some(d => d.id === advance_id);

      if (!advanceExists) {
        // Add new advance to deductions
        currentDeductions.push({
          id: advance_id,
          amount: advance.amount,
          date: advance.date,
          status: advance.status,
        });
      } else {
        // Update existing advance in deductions
        const index = currentDeductions.findIndex(d => d.id === advance_id);
        currentDeductions[index] = {
          id: advance_id,
          amount: advance.amount,
          date: advance.date,
          status: advance.status,
        };
      }

      // Calculate total advance deductions
      const totalAdvanceDeductions = currentDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);

      // Recalculate net_salary
      const grossSalary = payroll.gross_salary || 0;
      const taxes = payroll.taxes || 0;
      const netSalary = grossSalary - taxes - totalAdvanceDeductions;

      // Update payroll record
      const updatedPayroll = await pb.collection('payroll').update(payroll.id, {
        advance_deductions: currentDeductions,
        total_advance_deductions: totalAdvanceDeductions,
        net_salary: netSalary,
      });

      logger.info(`Payroll ${payroll.id} synced with advance ${advance_id}`);

      return updatedPayroll;
    })
  );

  res.json({
    success: true,
    message: 'Advances synced to payroll successfully',
    synced_payroll_records: updatedPayrolls.length,
    payroll_records: updatedPayrolls,
  });
});

/**
 * POST /advances/validate-sync
 * Validate data consistency for an advance
 * Body: { advance_id }
 * Check: (1) Advance exists, (2) Cashbook entry exists, (3) Advance in payroll.advance_deductions
 * Returns: { is_synced: boolean, discrepancies: [] }
 */
router.post('/validate-sync', async (req, res) => {
  const { advance_id } = req.body;

  // Validate input
  if (!advance_id) {
    return res.status(400).json({
      error: 'advance_id is required in request body',
    });
  }

  if (typeof advance_id !== 'string' || advance_id.trim() === '') {
    return res.status(400).json({
      error: 'advance_id must be a non-empty string',
    });
  }

  const discrepancies = [];
  let isSynced = true;
  let advance = null;

  // Check 1: Advance exists in advances collection
  logger.info(`[validate-sync] Checking if advance ${advance_id} exists`);
  try {
    advance = await pb.collection('advances').getOne(advance_id);
    logger.info(`[validate-sync] Advance found: ${advance_id}`);
  } catch (error) {
    logger.error(`[validate-sync] Advance lookup failed for ${advance_id}:`, error.message);
    if (error.status === 404) {
      discrepancies.push('Advance record not found in advances collection');
      isSynced = false;
    } else {
      throw new Error(`Failed to fetch advance ${advance_id}: ${error.message}`);
    }
  }

  // If advance doesn't exist, return early
  if (!advance) {
    logger.warn(`[validate-sync] Advance ${advance_id} does not exist`);
    return res.json({
      success: true,
      advance_id,
      is_synced: false,
      discrepancies,
    });
  }

  const employeeId = advance.employee_id;
  logger.info(`[validate-sync] Advance belongs to employee: ${employeeId}`);

  // Check 2: Corresponding cashbook entry exists
  logger.info(`[validate-sync] Checking cashbook entry for advance ${advance_id}`);
  try {
    const cashbookFilter = `reference_id = "${advance_id}" && reference_type = "advance"`;
    logger.info(`[validate-sync] Using cashbook filter: ${cashbookFilter}`);
    
    const cashbookEntries = await pb.collection('cashbook').getFullList({
      filter: cashbookFilter,
      limit: 1,
    });

    if (cashbookEntries.length === 0) {
      logger.warn(`[validate-sync] No cashbook entry found for advance ${advance_id}`);
      discrepancies.push('Cashbook entry not found for this advance');
      isSynced = false;
    } else {
      logger.info(`[validate-sync] Cashbook entry found for advance ${advance_id}`);
    }
  } catch (error) {
    logger.error(`[validate-sync] Cashbook query failed:`, error.message);
    discrepancies.push(`Failed to check cashbook: ${error.message}`);
    isSynced = false;
  }

  // Check 3: Advance is in payroll.advance_deductions for that employee
  logger.info(`[validate-sync] Checking payroll records for employee ${employeeId}`);
  try {
    const payrollFilter = `employee_id = "${employeeId}"`;
    logger.info(`[validate-sync] Using payroll filter: ${payrollFilter}`);
    
    const payrollRecords = await pb.collection('payroll').getFullList({
      filter: payrollFilter,
    });

    logger.info(`[validate-sync] Found ${payrollRecords.length} payroll records for employee ${employeeId}`);

    if (payrollRecords.length === 0) {
      logger.warn(`[validate-sync] No payroll records found for employee ${employeeId}`);
      discrepancies.push('No payroll records found for this employee');
      isSynced = false;
    } else {
      // Check if advance is in any payroll record's advance_deductions
      const advanceInPayroll = payrollRecords.some((payroll) => {
        const deductions = payroll.advance_deductions || [];
        return deductions.some(d => d.id === advance_id);
      });

      if (!advanceInPayroll) {
        logger.warn(`[validate-sync] Advance ${advance_id} not found in payroll advance_deductions`);
        discrepancies.push('Advance not found in payroll advance_deductions');
        isSynced = false;
      } else {
        logger.info(`[validate-sync] Advance ${advance_id} found in payroll advance_deductions`);
      }
    }
  } catch (error) {
    logger.error(`[validate-sync] Payroll query failed:`, error.message);
    discrepancies.push(`Failed to check payroll records: ${error.message}`);
    isSynced = false;
  }

  logger.info(`[validate-sync] Validation complete for advance ${advance_id}. Is synced: ${isSynced}`);

  res.json({
    success: true,
    advance_id,
    employee_id: employeeId,
    is_synced: isSynced,
    discrepancies,
  });
});

/**
 * Internal helper function to sync advance to payroll
 */
async function syncAdvanceToPayroll({ advanceId, employeeId }) {
  const advance = await pb.collection('advances').getOne(advanceId);

  const payrollRecords = await pb.collection('payroll').getFullList({
    filter: pb.filter('employee_id = {:employeeId}', { employeeId }),
  });

  if (payrollRecords.length === 0) {
    logger.warn(`No payroll records found for employee ${employeeId}`);
    return;
  }

  await Promise.all(
    payrollRecords.map(async (payroll) => {
      const currentDeductions = payroll.advance_deductions || [];
      const advanceExists = currentDeductions.some(d => d.id === advanceId);

      if (!advanceExists) {
        currentDeductions.push({
          id: advanceId,
          amount: advance.amount,
          date: advance.date,
          status: advance.status,
        });
      } else {
        const index = currentDeductions.findIndex(d => d.id === advanceId);
        currentDeductions[index] = {
          id: advanceId,
          amount: advance.amount,
          date: advance.date,
          status: advance.status,
        };
      }

      const totalAdvanceDeductions = currentDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
      const grossSalary = payroll.gross_salary || 0;
      const taxes = payroll.taxes || 0;
      const netSalary = grossSalary - taxes - totalAdvanceDeductions;

      await pb.collection('payroll').update(payroll.id, {
        advance_deductions: currentDeductions,
        total_advance_deductions: totalAdvanceDeductions,
        net_salary: netSalary,
      });
    })
  );
}

export default router;