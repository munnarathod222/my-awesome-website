import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/driver/assigned-truck-docs
 * 1. Find the logged-in driver's active truck.
 *    - Check 'employees' table for 'assigned_truck'.
 *    - Fallback: check 'trip_logs' table for latest active trip and resolve the truck_id.
 * 2. Fetch the corresponding documents from 'truck_documents'.
 * 3. Expose temporary/proxied download URLs for: RC, Insurance, Permit, Fitness Certificate.
 */
router.get('/assigned-truck-docs', pocketbaseAuth, async (req, res) => {
  const userId = req.pocketbaseUserId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Driver account not identified.'
    });
  }

  try {
    logger.info(`Exposing assigned truck documents for authenticated user: ${userId}`);

    // Step 1: Get the user details to match against employee registry
    let userRecord;
    try {
      userRecord = await pb.collection('users').getOne(userId, { $autoCancel: false });
    } catch (err) {
      logger.error(`Failed to fetch user ${userId}: ${err.message}`);
      return res.status(404).json({ success: false, error: 'User record not found.' });
    }

    let truckId = null;
    let truckNumber = '';

    // Strategy A: Find in employees registry by matching phone or name
    try {
      const employees = await pb.collection('employees').getFullList({
        filter: `contact = "${userRecord.phone_number}" || name = "${userRecord.full_name}"`,
        $autoCancel: false
      });

      if (employees.length > 0) {
        const employee = employees[0];
        if (employee.assigned_truck) {
          truckId = employee.assigned_truck;
          // Fetch the truck number for logging/verification
          try {
            const truck = await pb.collection('trucks').getOne(truckId, { $autoCancel: false });
            truckNumber = truck.truck_number;
            logger.info(`Strategy A Success: Found assigned truck ${truckNumber} (ID: ${truckId}) directly linked to employee.`);
          } catch (e) {
            logger.warn(`Failed to fetch truck details for assigned_truck ID ${truckId}: ${e.message}`);
          }
        }
      }
    } catch (err) {
      logger.warn(`Strategy A (Employee link check) failed: ${err.message}`);
    }

    // Strategy B Fallback: Find from latest active trip logs
    if (!truckId) {
      try {
        const latestTrips = await pb.collection('trip_logs').getList(1, 1, {
          filter: `user_id = "${userId}"`,
          sort: '-date,-created',
          $autoCancel: false
        });

        if (latestTrips.items && latestTrips.items.length > 0) {
          const latestTrip = latestTrips.items[0];
          truckNumber = latestTrip.truck_number;

          if (truckNumber) {
            // Find the truck in the trucks collection matching this truck number
            const trucks = await pb.collection('trucks').getFullList({
              filter: `truck_number = "${truckNumber}"`,
              $autoCancel: false
            });

            if (trucks.length > 0) {
              truckId = trucks[0].id;
              logger.info(`Strategy B Success: Found active truck ${truckNumber} (ID: ${truckId}) from latest trip.`);
            }
          }
        }
      } catch (err) {
        logger.error(`Strategy B (Trip logs lookup) failed: ${err.message}`);
      }
    }

    // Return early if no active truck can be resolved
    if (!truckId) {
      return res.status(200).json({
        success: true,
        message: 'No active truck assignment detected for this driver profile.',
        truck: null,
        documents: []
      });
    }

    // Step 2: Query existing 'truck_documents' for the active truck
    const documents = await pb.collection('truck_documents').getFullList({
      filter: `truck_id = "${truckId}"`,
      $autoCancel: false
    });

    // Step 3: Format and expose binary storage proxy links
    const formattedDocs = documents.map(doc => {
      // PocketBase file endpoints: /hcgi/platform/api/files/{collectionId}/{recordId}/{filename}
      const fileUrl = doc.file 
        ? `/hcgi/platform/api/files/${doc.collectionId || 'truck_documents'}/${doc.id}/${doc.file}`
        : null;

      return {
        id: doc.id,
        document_type: doc.document_type, // RC, Insurance, Permit, Fitness Certificate, etc.
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
    logger.error(`Error fetching driver truck docs: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve vehicle inspection documents.'
    });
  }
});

export default router;
