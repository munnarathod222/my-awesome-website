import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = Router();
function Router() {
  return express.Router();
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication & Driver Resolution Middleware
// ─────────────────────────────────────────────────────────────────────────────
const resolveDriver = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let userId = null;
  let driverPhone = req.headers['x-driver-phone'];
  let driverId = req.headers['x-driver-id'];

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
          const employees = await pb.collection('employees').getFullList({
            filter: `contact = "${userRecord.phone_number}" || name = "${userRecord.full_name}"`,
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
    const records = await pb.collection('employees').getFullList({
      filter: `name = "${name.trim()}" && contact = "${contact.trim()}"`,
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
        activeTrip = {
          id: trip.id,
          trip_id: trip.trip_id,
          date: trip.date.substringBefore ? trip.date.substringBefore(" ") : trip.date.split(" ")[0],
          route: trip.route,
          truck_number: trip.truck_number,
          kms: trip.kms,
          status: trip.trip_status
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

    return res.status(200).json({
      success: true,
      trips: trips.items
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

export default router;
