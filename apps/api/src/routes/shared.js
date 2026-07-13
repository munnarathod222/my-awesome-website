import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

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

    // 2. Query documents based on association
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
          make: truck.make,
          model: truck.model,
          truck_type: truck.truck_type
        },
        documents: docs.map(d => ({
          id: d.id,
          document_type: d.document_type,
          document_number: d.document_number,
          issue_date: d.issue_date,
          expiry_date: d.expiry_date,
          notes: d.notes,
          files: d.files || [],
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
          files: d.files || [],
          collectionId: d.collectionId,
          collectionName: d.collectionName
        }))
      });
    } else {
      return res.status(400).json({ success: false, error: 'Shared folder is not associated with any truck or employee.' });
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
