import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { enforceFinancialLockdown } from '../middleware/financial-lockdown.js';

const router = express.Router();

router.use(pocketbaseAuth);
router.use(enforceFinancialLockdown('payroll'));

/**
 * POST /payroll
 * Create a new payroll record and sync to cashbook
 */
router.post('/', async (req, res) => {
  const { amount, description, date, userId, status } = req.body;

  if (!amount || !userId) {
    return res.status(400).json({
      error: 'amount and userId are required',
    });
  }

  // Create payroll in PocketBase
  const payroll = await pb.collection('payroll').create({
    amount,
    description: description || '',
    date: date || new Date().toISOString(),
    userId,
    status: status || 'pending',
  });

  // Sync to cashbook
  try {
    const cashbookData = {
      userId,
      payrollId: payroll.id,
      type: 'payroll',
      amount: payroll.amount,
      description: payroll.description,
      date: payroll.date,
      status: payroll.status,
    };

    await pb.collection('cashbook').create(cashbookData);
    logger.info(`Payroll ${payroll.id} created and synced to cashbook`);
  } catch (error) {
    logger.error(`Failed to sync payroll ${payroll.id} to cashbook:`, error);
  }

  res.status(201).json({
    success: true,
    message: 'Payroll created successfully',
    payroll,
  });
});

/**
 * GET /payroll/:userId
 * Get all payroll records for a user
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: 'userId is required',
    });
  }

  const payrollRecords = await pb.collection('payroll').getFullList({
    filter: pb.filter('userId = {:userId}', { userId }),
    sort: '-created',
  });

  res.json({
    success: true,
    payroll: payrollRecords,
  });
});

/**
 * GET /payroll/detail/:payrollId
 * Get a specific payroll record
 */
router.get('/detail/:payrollId', async (req, res) => {
  const { payrollId } = req.params;

  if (!payrollId) {
    return res.status(400).json({
      error: 'payrollId is required',
    });
  }

  const payroll = await pb.collection('payroll').getOne(payrollId);

  if (!payroll) {
    throw new Error(`Payroll with ID ${payrollId} not found`);
  }

  res.json({
    success: true,
    payroll,
  });
});

/**
 * PUT /payroll/:payrollId
 * Update a payroll record and sync to cashbook
 */
router.put('/:payrollId', async (req, res) => {
  const { payrollId } = req.params;
  const { amount, description, date, status } = req.body;

  if (!payrollId) {
    return res.status(400).json({
      error: 'payrollId is required',
    });
  }

  // Get the original payroll to find userId
  const originalPayroll = await pb.collection('payroll').getOne(payrollId);

  if (!originalPayroll) {
    throw new Error(`Payroll with ID ${payrollId} not found`);
  }

  // Update payroll
  const updatedPayroll = await pb.collection('payroll').update(payrollId, {
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
        `payrollId="${payrollId}" && userId="${originalPayroll.userId}"`
      );
    } catch (error) {
      if (!error.message.includes('Failed to find')) {
        throw error;
      }
    }

    const cashbookData = {
      amount: updatedPayroll.amount,
      description: updatedPayroll.description,
      date: updatedPayroll.date,
      status: updatedPayroll.status,
    };

    if (cashbookEntry) {
      await pb.collection('cashbook').update(cashbookEntry.id, cashbookData);
    } else {
      await pb.collection('cashbook').create({
        userId: originalPayroll.userId,
        payrollId,
        type: 'payroll',
        ...cashbookData,
      });
    }
    logger.info(`Payroll ${payrollId} updated and synced to cashbook`);
  } catch (error) {
    logger.error(`Failed to sync payroll ${payrollId} to cashbook:`, error);
  }

  res.json({
    success: true,
    message: 'Payroll updated successfully',
    payroll: updatedPayroll,
  });
});

/**
 * DELETE /payroll/:payrollId
 * Delete a payroll record and remove from cashbook/expenses
 */
router.delete('/:payrollId', async (req, res) => {
  const { payrollId } = req.params;

  if (!payrollId) {
    return res.status(400).json({
      error: 'payrollId is required',
    });
  }

  try {
    // Get the payroll
    const payroll = await pb.collection('payroll').getOne(payrollId, { $autoCancel: false });

    // 1. Delete from cashbook
    try {
      const cashbookEntries = await pb.collection('cashbook').getFullList({
        filter: `reference_id = "${payrollId}" || reference_id = "" && (notes ~ "${payrollId}" || description ~ "${payrollId}")`,
        $autoCancel: false
      });
      for (const entry of cashbookEntries) {
        await pb.collection('cashbook').delete(entry.id, { $autoCancel: false });
        logger.info(`Cashbook entry ${entry.id} deleted for payroll ${payrollId}`);
      }
    } catch (error) {
      logger.error(`Failed to delete cashbook entry for payroll ${payrollId}:`, error);
    }

    // 2. Delete from expenses
    try {
      const expenseEntries = await pb.collection('expenses').getFullList({
        filter: `notes ~ "${payrollId}" || description ~ "${payrollId}"`,
        $autoCancel: false
      });
      for (const entry of expenseEntries) {
        await pb.collection('expenses').delete(entry.id, { $autoCancel: false });
        logger.info(`Expense entry ${entry.id} deleted for payroll ${payrollId}`);
      }
    } catch (error) {
      logger.error(`Failed to delete expense entry for payroll ${payrollId}:`, error);
    }

    // 3. Delete payroll record
    await pb.collection('payroll').delete(payrollId, { $autoCancel: false });
    logger.info(`Payroll ${payrollId} deleted`);

    res.json({
      success: true,
      message: 'Payroll deleted successfully',
    });
  } catch (err) {
    logger.error(`Failed to delete payroll record ${payrollId}:`, err);
    res.status(err.status || 500).json({
      error: err.message || 'Failed to delete payroll record',
    });
  }
});

/**
 * POST /payroll/:payrollId/disburse
 * Mark payroll status as Paid, disburse funds, and sync with Cashbook & Expenses
 */
router.post('/:payrollId/disburse', async (req, res) => {
  const { payrollId } = req.params;
  const { payment_mode, payment_date, remarks, userId } = req.body;

  if (!payrollId) {
    return res.status(400).json({ error: 'payrollId is required' });
  }

  // 1. Fetch the payroll record
  let payroll;
  try {
    payroll = await pb.collection('payroll').getOne(payrollId, { $autoCancel: false });
  } catch (err) {
    return res.status(404).json({ error: `Payroll record with ID ${payrollId} not found` });
  }

  if (payroll.payment_status === 'paid') {
    return res.status(400).json({ error: 'Payroll record is already paid' });
  }

  const addedBy = userId || req.auth?.id || payroll.employee_id_relation || payroll.employee_id || 'admin';
  const payoutAmount = Number(payroll.net_salary || payroll.total_salary) || 0;
  const pDate = payment_date ? new Date(payment_date).toISOString() : new Date().toISOString();

  // 2. Perform the update & sync with rollback logic (database integrity protection)
  let updatedPayroll;
  let createdCashbookId = null;
  let createdExpenseId = null;

  try {
    // A. Update payroll status to Paid
    updatedPayroll = await pb.collection('payroll').update(payrollId, {
      payment_status: 'paid',
      status: 'paid',
      payment_mode: payment_mode || 'bank transfer',
      payment_date: pDate,
      remarks: remarks || 'Disbursed via Hub'
    }, { $autoCancel: false });

    // B. Create Cashbook row
    const cashbookEntry = await pb.collection('cashbook').create({
      date: pDate,
      description: `Salary Payout - ${payroll.employee_name} (${payroll.payroll_month}/${payroll.payroll_year})`,
      amount: payoutAmount,
      transaction_type: 'Expense',
      category: 'Payroll',
      notes: `Payroll ID: ${payrollId}. Mode: ${payment_mode || 'bank transfer'}. Remarks: ${remarks || ''}`,
      added_by: addedBy,
      reference_id: payrollId,
      reference_type: 'payroll',
      status: 'Approved'
    }, { $autoCancel: false });
    createdCashbookId = cashbookEntry.id;

    // C. Create Expenses row
    const expenseEntry = await pb.collection('expenses').create({
      date: pDate,
      category: 'Regular',
      subcategory: 'Salary',
      description: `Salary Payout - ${payroll.employee_name} (${payroll.payroll_month}/${payroll.payroll_year})`,
      amount: payoutAmount,
      status: 'Approved',
      notes: `Payroll ID: ${payrollId}`,
      created_by: addedBy,
      payment_method: payment_mode ? (payment_mode.toLowerCase() === 'bank transfer' ? 'Bank Transfer' : payment_mode.charAt(0).toUpperCase() + payment_mode.slice(1)) : 'Bank Transfer'
    }, { $autoCancel: false });
    createdExpenseId = expenseEntry.id;

    logger.info(`Payroll ${payrollId} disbursed. Cashbook: ${createdCashbookId}, Expense: ${createdExpenseId}`);

    return res.json({
      success: true,
      message: 'Payroll disbursed successfully and synced to Cashbook and Expenses',
      payroll: updatedPayroll
    });

  } catch (syncError) {
    logger.error(`Disbursement failed for payroll ${payrollId}, rolling back.`, syncError);

    // Rollback pocketbase updates/creates
    try {
      if (createdCashbookId) {
        await pb.collection('cashbook').delete(createdCashbookId, { $autoCancel: false });
      }
    } catch (cbRollError) {
      logger.error('Failed to rollback cashbook entry:', cbRollError);
    }

    try {
      if (createdExpenseId) {
        await pb.collection('expenses').delete(createdExpenseId, { $autoCancel: false });
      }
    } catch (expRollError) {
      logger.error('Failed to rollback expense entry:', expRollError);
    }

    try {
      // Rollback payroll status to pending
      await pb.collection('payroll').update(payrollId, {
        payment_status: 'pending',
        status: 'Approved',
        payment_mode: '',
        payment_date: null,
        remarks: ''
      }, { $autoCancel: false });
    } catch (payrollRollError) {
      logger.error('Failed to rollback payroll record status:', payrollRollError);
    }

    return res.status(500).json({
      error: 'Disbursement failed during sync. Rolled back status to Pending.',
      details: syncError.message
    });
  }
});

/**
 * POST /payroll/calculate-salary
 * Calculate salary with attendance and advance deductions
 * Body: { employeeId, month, year }
 * Returns: { baseSalary, attendanceDeduction, advanceDeductions, grossSalary, taxes, netSalary, breakdown }
 */
router.post('/calculate-salary', async (req, res) => {
  const { employeeId, month, year } = req.body;

  if (!employeeId || !month || !year) {
    return res.status(400).json({
      error: 'employeeId, month, and year are required',
    });
  }

  // Validate month and year
  if (month < 1 || month > 12) {
    return res.status(400).json({
      error: 'month must be between 1 and 12',
    });
  }

  if (year < 2000 || year > 2100) {
    return res.status(400).json({
      error: 'year must be between 2000 and 2100',
    });
  }

  try {
    // Fetch employee details
    const employee = await pb.collection('employees').getOne(employeeId);

    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found` });
    }

    const baseSalary = employee.salary_amount || employee.base_salary || 0;

    // Fetch attendance records for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    let attendanceRecords = [];
    try {
      attendanceRecords = await pb.collection('attendance').getFullList({
        filter: `staff_member = "${employeeId}" && date >= "${startDateISO} 00:00:00" && date <= "${endDateISO} 23:59:59"`,
        sort: 'date',
      });
    } catch (err) {
      logger.error(`Failed to fetch attendance records:`, err);
    }

    // Calculate attendance metrics
    const totalDays = endDate.getDate();
    const presentDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'present' || r.status?.toLowerCase() === 'work from home').length + (attendanceRecords.filter(r => r.status?.toLowerCase() === 'half day').length * 0.5);
    const absentDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length + (attendanceRecords.filter(r => r.status?.toLowerCase() === 'half day').length * 0.5);
    const leaveDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'leave').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate attendance deduction (deduct for absent days)
    const dailyRate = baseSalary / totalDays;
    const attendanceDeduction = absentDays * dailyRate;

    // Fetch advances for the employee using employee_id (or fallback to userId)
    let advances = [];
    try {
      advances = await pb.collection('advances').getFullList({
        filter: `employee_id = "${employeeId}"`,
      });
    } catch (err) {
      logger.warn(`Failed to fetch advances using employee_id, trying userId...`);
      try {
        advances = await pb.collection('advances').getFullList({
          filter: `userId = "${employeeId}"`,
        });
      } catch (altErr) {
        logger.error(`Failed to fetch advances using alternative filter:`, altErr);
      }
    }

    // Calculate advance deductions (sum of all pending/unsettled advances)
    const advanceDeductions = advances
      .filter(a => a.status?.toLowerCase() !== 'settled')
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    // Calculate gross salary
    const grossSalary = baseSalary - attendanceDeduction;

    // Calculate taxes (assuming 10% tax rate)
    const taxRate = 0.10;
    const taxes = grossSalary * taxRate;

    // Calculate Net Payout: (Base Salary * (Present Days / Total Working Days)) - Advances Taken
    const netSalary = (baseSalary * (totalDays > 0 ? presentDays / totalDays : 0)) - advanceDeductions;

    // Build breakdown
    const breakdown = {
      baseSalary,
      attendanceMetrics: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      },
      deductions: {
        attendance: parseFloat(attendanceDeduction.toFixed(2)),
        advances: parseFloat(advanceDeductions.toFixed(2)),
        taxes: parseFloat(taxes.toFixed(2)),
      },
    };

    res.json({
      success: true,
      baseSalary: parseFloat(baseSalary.toFixed(2)),
      attendanceDeduction: parseFloat(attendanceDeduction.toFixed(2)),
      advanceDeductions: parseFloat(advanceDeductions.toFixed(2)),
      grossSalary: parseFloat(grossSalary.toFixed(2)),
      taxes: parseFloat(taxes.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2)),
      breakdown,
    });
  } catch (error) {
    logger.error('Error calculating salary:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * GET /payroll/employee/:employeeId/advances
 * Get all advances for an employee with optional filtering
 * Query params: { status, startDate, endDate }
 * Returns: Array of advances with employee details
 */
router.get('/employee/:employeeId/advances', async (req, res) => {
  const { employeeId } = req.params;
  const { status, startDate, endDate } = req.query;

  if (!employeeId) {
    return res.status(400).json({
      error: 'employeeId is required',
    });
  }

  // Build filter
  let filter = `employee_id = "${employeeId}"`;

  if (status) {
    filter += ` && status = "${status}"`;
  }

  if (startDate) {
    filter += ` && created >= "${startDate}"`;
  }

  if (endDate) {
    filter += ` && created <= "${endDate}"`;
  }

  const advances = await pb.collection('advances').getFullList({
    filter,
    sort: '-created',
  });

  // Fetch employee details
  const employee = await pb.collection('employees').getOne(employeeId);

  res.json({
    success: true,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
    },
    advances,
    totalAdvances: advances.length,
    totalAmount: advances.reduce((sum, a) => sum + (a.amount || 0), 0),
  });
});

/**
 * PATCH /payroll/advances/:advanceId/status
 * Update advance status (Pending → Settled)
 * Body: { status, settledDate, notes }
 * Returns: Updated advance record
 */
router.patch('/advances/:advanceId/status', async (req, res) => {
  const { advanceId } = req.params;
  const { status, settledDate, notes } = req.body;

  if (!advanceId) {
    return res.status(400).json({
      error: 'advanceId is required',
    });
  }

  if (!status) {
    return res.status(400).json({
      error: 'status is required',
    });
  }

  // Get the original advance
  const originalAdvance = await pb.collection('advances').getOne(advanceId);

  if (!originalAdvance) {
    throw new Error(`Advance with ID ${advanceId} not found`);
  }

  // Update advance
  const updatedAdvance = await pb.collection('advances').update(advanceId, {
    status,
    ...(settledDate && { settledDate }),
    ...(notes && { notes }),
  });

  logger.info(`Advance ${advanceId} status updated to ${status}`);

  res.json({
    success: true,
    message: 'Advance status updated successfully',
    advance: updatedAdvance,
  });
});

export default router;