import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /shared/create-fleet-dossier
 * Creates a multi-truck fleet dossier share link for financiers/banks
 */
router.post('/create-fleet-dossier', async (req, res) => {
  try {
    const { truck_ids = [], dossier_title = 'Fleet Asset & RC Dossier', recipient_name = 'Financier', notes = '' } = req.body;
    
    logger.info(`[SharedFolderAPI] Creating fleet dossier for ${truck_ids.length} trucks`);

    const record = await pb.collection('shared_folders').create({
      truck_id: '',
      employee_id: '',
      folder_type: 'fleet_dossier',
      truck_ids: JSON.stringify(truck_ids),
      recipient_name,
      notes,
      dossier_title
    }, { $autoCancel: false });

    return res.status(200).json({
      success: true,
      id: record.id,
      share_url: `/share/${record.id}`
    });
  } catch (err) {
    logger.error('[SharedFolderAPI] Error creating fleet dossier:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /shared/folder/:id
 * Retrieve details and document file list for a shared folder link (read-only)
 */
router.get('/folder/:id', async (req, res) => {
  const { id } = req.params;

  try {
    logger.info(`[SharedFolderAPI] Loading shared folder metadata for ID: ${id}`);
    
    // 1. Fetch the shared folder link record using the admin client
    let sharedFolder;
    try {
      sharedFolder = await pb.collection('shared_folders').getOne(id, { $autoCancel: false });
    } catch (fetchErr) {
      logger.warn(`[SharedFolderAPI] Shared folder link ${id} not found: ${fetchErr.message}`);
      return res.status(404).json({ success: false, error: 'Shared folder link not found or expired.' });
    }

    if (!sharedFolder) {
      return res.status(404).json({ success: false, error: 'Shared folder link not found.' });
    }

    // Check if this is a Multi-Truck Fleet Dossier for Financiers
    const isFleetDossier = sharedFolder.folder_type === 'fleet_dossier' || 
      sharedFolder.truck_id === 'all' || 
      sharedFolder.truck_id === 'fleet' ||
      (sharedFolder.notes && sharedFolder.notes.includes('fleet_dossier')) ||
      (sharedFolder.truck_ids && sharedFolder.truck_ids !== '[]');

    if (isFleetDossier) {
      let targetTruckIds = [];
      try {
        if (sharedFolder.truck_ids) {
          targetTruckIds = typeof sharedFolder.truck_ids === 'string' ? JSON.parse(sharedFolder.truck_ids) : sharedFolder.truck_ids;
        }
      } catch (e) {}

      // Fetch fleet trucks
      let allTrucks = await pb.collection('trucks').getFullList({
        sort: 'truck_number',
        $autoCancel: false
      });

      if (Array.isArray(targetTruckIds) && targetTruckIds.length > 0) {
        allTrucks = allTrucks.filter(t => targetTruckIds.includes(t.id));
      }

      // Fetch all documents for these trucks
      const allDocs = await pb.collection('truck_documents').getFullList({
        sort: '-created',
        $autoCancel: false
      });

      // Group documents by truck
      const fleetData = allTrucks.map(truck => {
        const truckDocs = allDocs.filter(d => d.truck_id === truck.id).map(d => ({
          id: d.id,
          document_type: d.document_type,
          document_number: d.document_number,
          issue_date: d.issue_date,
          expiry_date: d.expiry_date,
          notes: d.notes,
          file: d.file || '',
          files: d.files ? (Array.isArray(d.files) ? d.files : [d.files]) : (d.file ? [d.file] : []),
          collectionId: d.collectionId,
          collectionName: d.collectionName
        }));

        return {
          id: truck.id,
          truck_number: truck.truck_number,
          truck_name: truck.truck_name || '',
          truck_size: truck.truck_size || '',
          truck_axle: truck.truck_axle || '',
          tyre_count: truck.tyre_count || 6,
          payload_capacity: truck.payload_capacity || '',
          status: truck.status || 'active',
          ownership_type: truck.ownership_type || 'Owned',
          base_odometer: truck.base_odometer || 0,
          current_fastag_balance: truck.current_fastag_balance || 0,
          assigned_driver_name: truck.assigned_driver_name || truck.driver_name || '',
          documents: truckDocs
        };
      });

      return res.status(200).json({
        success: true,
        type: 'fleet_dossier',
        dossier_title: sharedFolder.dossier_title || 'Fleet Asset & RC Verification Dossier',
        recipient_name: sharedFolder.recipient_name || 'Financier / Loan Evaluator',
        notes: sharedFolder.notes || '',
        total_trucks: fleetData.length,
        total_documents: fleetData.reduce((acc, t) => acc + t.documents.length, 0),
        fleet: fleetData
      });
    }

    // 2. Query single truck documents
    if (sharedFolder.truck_id) {
      logger.info(`[SharedFolderAPI] Resolving truck documents for truck ID: ${sharedFolder.truck_id}`);
      
      const truck = await pb.collection('trucks').getOne(sharedFolder.truck_id, { $autoCancel: false });
      const docs = await pb.collection('truck_documents').getFullList({
        filter: `truck_id = "${sharedFolder.truck_id}"`,
        sort: '-created',
        $autoCancel: false
      });

      return res.status(200).json({
        success: true,
        type: 'truck',
        details: {
          id: truck.id,
          truck_number: truck.truck_number,
          truck_name: truck.truck_name || '',
          truck_size: truck.truck_size || '',
          truck_axle: truck.truck_axle || '',
          payload_capacity: truck.payload_capacity || '',
          ownership_type: truck.ownership_type || 'Owned'
        },
        documents: docs.map(d => ({
          id: d.id,
          document_type: d.document_type,
          document_number: d.document_number,
          issue_date: d.issue_date,
          expiry_date: d.expiry_date,
          notes: d.notes,
          file: d.file || '',
          files: d.file ? (Array.isArray(d.file) ? d.file : [d.file]) : (d.files || []),
          collectionId: d.collectionId,
          collectionName: d.collectionName
        }))
      });
    } else if (sharedFolder.employee_id) {
      logger.info(`[SharedFolderAPI] Resolving employee documents for employee ID: ${sharedFolder.employee_id}`);
      
      const employee = await pb.collection('employees').getOne(sharedFolder.employee_id, { $autoCancel: false });
      const docs = await pb.collection('employee_documents').getFullList({
        filter: `employee_id = "${sharedFolder.employee_id}"`,
        sort: '-created',
        $autoCancel: false
      });

      return res.status(200).json({
        success: true,
        type: 'employee',
        details: {
          id: employee.id,
          name: employee.name,
          employee_type: employee.employee_type,
          position: employee.position,
          phone: employee.phone
        },
        documents: docs.map(d => ({
          id: d.id,
          document_type: d.document_type,
          document_number: d.document_number,
          issue_date: d.issue_date,
          expiry_date: d.expiry_date,
          notes: d.notes,
          file: d.file || '',
          files: d.files ? (Array.isArray(d.files) ? d.files : [d.files]) : (d.file ? [d.file] : []),
          collectionId: d.collectionId,
          collectionName: d.collectionName
        }))
      });
    } else {
      return res.status(400).json({ success: false, error: 'Shared folder is not associated with any fleet, truck, or employee.' });
    }

  } catch (err) {
    logger.error(`[SharedFolderAPI] Error loading shared folder ${id}:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to load shared folder details'
    });
  }
});

export default router;
