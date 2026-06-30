import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /attendance/employee/:employeeId/summary
 * Get attendance summary for a given month/year
 * Query params: { month, year }
 * Returns: { totalDays, presentDays, absentDays, leaveDays, attendancePercentage, breakdown }
 */
router.get('/employee/:employeeId/summary', async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;

  // STEP 1: Log incoming request parameters
  logger.info('=== ATTENDANCE SUMMARY REQUEST ===');
  logger.info(`Incoming parameters: employeeId=${employeeId}, month=${month}, year=${year}`);
  console.log(`[ATTENDANCE] Request params - employeeId: ${employeeId}, month: ${month}, year: ${year}`);

  // Validate employeeId
  if (!employeeId || employeeId.trim() === '') {
    logger.warn('Invalid employeeId: empty or missing');
    return res.status(400).json({
      error: 'employeeId is required and cannot be empty',
    });
  }

  // Validate month and year
  if (!month || !year) {
    logger.warn('Missing month or year query parameters');
    return res.status(400).json({
      error: 'month and year query parameters are required',
    });
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  logger.info(`Parsed month: ${monthNum}, year: ${yearNum}`);
  console.log(`[ATTENDANCE] Parsed values - month: ${monthNum}, year: ${yearNum}`);

  // Validate month range
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    logger.warn(`Invalid month value: ${monthNum}`);
    return res.status(400).json({
      error: 'month must be a valid number between 1 and 12',
    });
  }

  // Validate year range
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    logger.warn(`Invalid year value: ${yearNum}`);
    return res.status(400).json({
      error: 'year must be a valid number between 2000 and 2100',
    });
  }

  // STEP 2: Verify employee exists
  logger.info(`STEP 2: Fetching employee record for ID: ${employeeId}`);
  let employee = null;
  try {
    employee = await pb.collection('employees').getOne(employeeId);
    logger.info(`✓ Employee found: ${employee.name} (ID: ${employee.id})`);
    console.log(`[ATTENDANCE] Employee lookup SUCCESS - Name: ${employee.name}, ID: ${employee.id}`);
  } catch (error) {
    logger.error(`✗ Employee lookup FAILED for ID ${employeeId}`);
    logger.error(`Error status: ${error.status}, message: ${error.message}`);
    console.log(`[ATTENDANCE] Employee lookup FAILED - Status: ${error.status}, Message: ${error.message}`);
    
    if (error.status === 404) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId,
      });
    }
    
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  // STEP 3: Verify attendance collection exists (graceful degradation)
  logger.info('STEP 3: Verifying attendance collection exists');
  try {
    await pb.collection('attendance_records').getFullList({ limit: 1 });
    logger.info(`✓ Attendance collection verified`);
    console.log(`[ATTENDANCE] Collection verification SUCCESS`);
  } catch (error) {
    logger.warn(`⚠ Attendance collection verification warning: ${error.message}`);
    console.log(`[ATTENDANCE] Collection verification warning - continuing anyway`);
    // Continue execution - don't throw, graceful degradation
  }

  // STEP 4: Build and validate filter
  logger.info('STEP 4: Building PocketBase filter for attendance records');
  
  // Calculate date range for the month
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0);
  const totalDays = endDate.getDate();

  // Format dates for PocketBase filter (ISO format YYYY-MM-DD)
  const startDateISO = startDate.toISOString().split('T')[0];
  const endDateISO = endDate.toISOString().split('T')[0];

  logger.info(`Date range: ${startDateISO} to ${endDateISO}`);
  logger.info(`Total days in month: ${totalDays}`);
  console.log(`[ATTENDANCE] Date range - Start: ${startDateISO}, End: ${endDateISO}, Total days: ${totalDays}`);

  // Build filter using correct field names from schema:
  // - staff_member: relation field to employees collection
  // - date: actual attendance date field
  const filterString = `staff_member = "${employeeId}" && date >= "${startDateISO} 00:00:00" && date <= "${endDateISO} 23:59:59"`;
  
  logger.info(`Primary filter string: ${filterString}`);
  console.log(`[ATTENDANCE] Primary filter being used: ${filterString}`);

  // STEP 5: Execute query with error details
  logger.info('STEP 5: Executing attendance query');
  let attendanceRecords = [];
  try {
    attendanceRecords = await pb.collection('attendance').getFullList({
      filter: filterString,
      sort: 'date',
    });
    
    logger.info(`✓ Query executed successfully. Records found: ${attendanceRecords.length}`);
    console.log(`[ATTENDANCE] Query SUCCESS - Records found: ${attendanceRecords.length}`);
    
    if (attendanceRecords.length > 0) {
      logger.info(`Sample record: ${JSON.stringify(attendanceRecords[0])}`);
      console.log(`[ATTENDANCE] Sample record:`, attendanceRecords[0]);
    }
  } catch (error) {
    logger.error(`✗ Primary filter query FAILED: ${error.message}`);
    console.log(`[ATTENDANCE] Query FAILED - Status: ${error.status}, Message: ${error.message}`);
    throw error;
  }

  // STEP 6: Process results
  logger.info('STEP 6: Processing attendance records');
  const presentDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length + (attendanceRecords.filter(r => r.status?.toLowerCase() === 'half day').length * 0.5);
  const absentDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length + (attendanceRecords.filter(r => r.status?.toLowerCase() === 'half day').length * 0.5);
  const leaveDays = attendanceRecords.filter(r => r.status?.toLowerCase() === 'leave').length;
  const recordedDays = attendanceRecords.length;
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  logger.info(`Calculation breakdown:`);
  logger.info(`  - Total days in month: ${totalDays}`);
  logger.info(`  - Present days: ${presentDays}`);
  logger.info(`  - Absent days: ${absentDays}`);
  logger.info(`  - Leave days: ${leaveDays}`);
  logger.info(`  - Recorded days: ${recordedDays}`);
  logger.info(`  - Unrecorded days: ${totalDays - recordedDays}`);
  logger.info(`  - Attendance percentage: ${attendancePercentage.toFixed(2)}%`);
  
  console.log(`[ATTENDANCE] Calculation results:`);
  console.log(`  Present: ${presentDays}, Absent: ${absentDays}, Leave: ${leaveDays}`);
  console.log(`  Percentage: ${attendancePercentage.toFixed(2)}%`);

  // Build breakdown by status
  const breakdown = {
    present: presentDays,
    absent: absentDays,
    leave: leaveDays,
    unrecorded: totalDays - recordedDays,
  };

  // STEP 7: Return response
  logger.info('STEP 7: Building response object');
  const responseData = {
    success: true,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
    },
    period: {
      month: monthNum,
      year: yearNum,
    },
    totalDays,
    presentDays,
    absentDays,
    leaveDays,
    attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
    breakdown,
    records: attendanceRecords,
  };

  logger.info(`✓ Attendance summary generated successfully for ${employee.name}`);
  console.log(`[ATTENDANCE] Response ready - Employee: ${employee.name}, Percentage: ${attendancePercentage.toFixed(2)}%`);
  console.log(`[ATTENDANCE] === END OF REQUEST ===`);

  res.json(responseData);
});

export default router;