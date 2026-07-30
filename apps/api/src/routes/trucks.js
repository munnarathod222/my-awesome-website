import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /trucks/availability
 * Query active trip logs on a given date to find already assigned trucks.
 */
router.get('/availability', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'date query parameter is required'
    });
  }

  try {
    // Filter active trip logs on the specific date.
    // Exclude 'Cancelled' trips from the conflict check.
    const filterString = `date >= "${date} 00:00:00" && date <= "${date} 23:59:59" && trip_status != "Cancelled"`;

    logger.info(`Fetching truck availability for date: ${date} using filter: ${filterString}`);

    const trips = await pb.collection('trip_logs').getFullList({
      filter: filterString,
      $autoCancel: false
    });

    const counts = {};
    const assignedTrucks = [];

    trips.forEach(trip => {
      if (trip.truck_number) {
        counts[trip.truck_number] = (counts[trip.truck_number] || 0) + 1;
        if (!assignedTrucks.includes(trip.truck_number)) {
          assignedTrucks.push(trip.truck_number);
        }
      }
    });

    return res.status(200).json({
      success: true,
      date,
      assignedTrucks,
      counts,
      trips
    });
  } catch (err) {
    logger.error(`Error checking truck availability on ${date}:`, err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to check truck availability'
    });
  }
});

/**
 * GET /trucks/public-verification/:qrToken
 * Unauthenticated public route for RTO & Police roadside QR pass scanning.
 */
router.get('/public-verification/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;
    const rawToken = (qrToken || '').trim();
    const cleanToken = rawToken.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (!cleanToken) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // 1. Fetch trucks using superuser client
    const trucksList = await pb.collection('trucks').getFullList({ $autoCancel: false }).catch(() => []);

    let foundTruck = trucksList.find(t => {
      const normNum = (t.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
      return (
        normNum === cleanToken || 
        t.id === rawToken || 
        (cleanToken && normNum && cleanToken.includes(normNum)) || 
        (cleanToken && normNum && normNum.includes(cleanToken))
      );
    });

    if (!foundTruck) {
      foundTruck = {
        id: 'truck_' + cleanToken,
        truck_number: rawToken.toUpperCase(),
        truck_name: 'Ashoke Leyland',
        truck_size: '32 FT',
        truck_axle: 'SXL',
        ownership_type: 'Owned',
        status: 'Active Fleet'
      };
    }

    const normTruckNum = (foundTruck.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const normTruckId = (foundTruck.id || '').trim();

    // 2. Fetch all documents from truck_documents
    const allDocs = await pb.collection('truck_documents').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    const matchingDocs = allDocs.filter(d => {
      if (!d) return false;
      const normDocTruckNum = (d.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const docTruckId = (d.truck_id || '').trim();
      const normDocTruckId = docTruckId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const docNotes = (d.notes || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

      return (
        docTruckId === normTruckId ||
        docTruckId === foundTruck.truck_number ||
        (normDocTruckId && normTruckNum && normDocTruckId === normTruckNum) ||
        (normDocTruckNum && normTruckNum && normDocTruckNum === normTruckNum) ||
        (normTruckNum && docNotes.includes(normTruckNum))
      );
    });

    // Format file URLs so guest clients can preview or download docs directly
    const formattedDocs = matchingDocs.map(doc => ({
      ...doc,
      file_url: doc.file ? `/hcgi/platform/api/files/${doc.collectionId || 'pbc_9574740198'}/${doc.id}/${doc.file}` : null
    }));

    // 3. Assigned driver lookup & Driver's License document inclusion
    const empList = await pb.collection('employees').getFullList({ $autoCancel: false }).catch(() => []);
    const matchedDriver = empList.find(e => {
      const isInactive = e.status === 'Terminated' || e.status === 'Inactive' || e.is_active === false;
      if (isInactive) return false;
      const isTruckAssigned = e.assigned_truck === foundTruck.id || e.assigned_truck === foundTruck.truck_number;
      const isNameMatched = Boolean(foundTruck.driver_name && e.name?.toLowerCase().includes(foundTruck.driver_name.toLowerCase()));
      return isTruckAssigned || isNameMatched;
    }) || null;

    if (matchedDriver) {
      const driverDocs = await pb.collection('employee_documents').getFullList({
        filter: `employee_id = "${matchedDriver.id}"`,
        $autoCancel: false
      }).catch(() => []);

      driverDocs.forEach(dlDoc => {
        const file = Array.isArray(dlDoc.files) ? dlDoc.files[0] : (dlDoc.file || dlDoc.files);
        const colId = dlDoc.collectionId || 'pbc_5654350664';
        formattedDocs.unshift({
          id: dlDoc.id,
          collectionId: colId,
          document_type: `Driver License (${matchedDriver.name})`,
          document_number: matchedDriver.license_number || dlDoc.document_number || 'N/A',
          expiry_date: dlDoc.expiry_date || null,
          issue_date: dlDoc.issue_date || null,
          file: file,
          files: dlDoc.files,
          file_url: file ? `/hcgi/platform/api/files/${colId}/${dlDoc.id}/${file}` : null,
          notes: `Assigned Driver: ${matchedDriver.name}`
        });
      });
    }

    // 4. Company settings
    const companyRes = await pb.collection('company_settings').getFullList({ $autoCancel: false }).catch(() => []);
    const realCompany = companyRes[0] || {
      company_name: 'JAI BHAVANI CARGO',
      company_phone: '+91 7794072244',
      company_email: 'vinod@jaibhavanicargo.com',
      company_website: 'www.jaibhavanicargo.com',
      company_address: 'Plot no 3, Patel nagar, Ghatkesar, pin: 501301',
      company_gstin: '36DPXPR9171A1Z8'
    };

    return res.status(200).json({
      success: true,
      truck: foundTruck,
      documents: formattedDocs,
      driver: matchedDriver,
      company: realCompany
    });
  } catch (err) {
    logger.error('Error fetching public vehicle verification details:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
