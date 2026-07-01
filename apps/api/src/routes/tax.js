import { Router } from 'express';
import pocketbaseClient from '../utils/pocketbaseClient.js';

const router = Router();

// GET /api/tax/summary
router.get('/summary', async (req, res) => {
  try {
    const pb = pocketbaseClient.getClient();
    
    // Fetch all trips, employees, and expenses to compute tax metrics
    const [trips, employees, expenses] = await Promise.all([
      pb.collection('trip_logs').getFullList({ expand: 'client_id', $autoCancel: false }),
      pb.collection('employees').getFullList({ $autoCancel: false }),
      pb.collection('expenses').getFullList({ $autoCancel: false })
    ]);

    let totalTdsReceivable = 0;
    let totalTdsPayable = 0;
    let totalClientRevenue = 0;
    let totalVendorPayout = 0;

    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.name] = emp;
    });

    trips.forEach(trip => {
      const isAttached = trip.ownership_type === 'Attached';
      const revenue = Number(trip.revenue) || 0;
      totalClientRevenue += revenue;
      totalTdsReceivable += Number(trip.tds_deducted_receivable) || 0;

      if (isAttached) {
        const payout = Number(trip.vendor_payout) || 0;
        totalVendorPayout += payout;

        const driver = employeeMap[trip.driver_name];
        const pan = driver?.pan_card || '';
        const tdsRate = pan ? 0.01 : 0.20; // 1% if PAN exists, 20% penalty if missing
        totalTdsPayable += payout * tdsRate;
      }
    });

    // Sum of all operational expenses (excluding employee advances which are assets)
    const totalExpenses = expenses
      .filter(exp => exp.category !== 'Employee Advance')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    const netPlatformMargin = totalClientRevenue - totalVendorPayout - totalExpenses;

    res.json({
      success: true,
      data: {
        totalTdsReceivable: Number(totalTdsReceivable.toFixed(2)),
        totalTdsPayable: Number(totalTdsPayable.toFixed(2)),
        netPlatformMargin: Number(netPlatformMargin.toFixed(2)),
        totalClientRevenue,
        totalVendorPayout,
        totalExpenses
      }
    });
  } catch (error) {
    console.error('Error generating tax summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tax/export-csv
router.get('/export-csv', async (req, res) => {
  try {
    const pb = pocketbaseClient.getClient();
    
    const [trips, employees] = await Promise.all([
      pb.collection('trip_logs').getFullList({ expand: 'client_id', $autoCancel: false }),
      pb.collection('employees').getFullList({ $autoCancel: false })
    ]);

    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.name] = emp;
    });

    const csvRows = [];
    // CSV Header
    csvRows.push([
      'Trip ID',
      'Date',
      'Client Name',
      'Gross Invoice Amount (INR)',
      'Client TDS Deducted (INR)',
      'Fleet Type',
      'Vendor Name',
      'Vendor PAN',
      'Gross Vendor Payout (INR)',
      'Applied TDS Rate (%)',
      'Vendor TDS Deducted (INR)',
      'Final Net Payout (INR)',
      'GST Classification'
    ].join(','));

    trips.forEach(trip => {
      const isAttached = trip.ownership_type === 'Attached';
      const clientName = trip.expand?.client_id?.client_name || 'N/A';
      const grossInvoice = Number(trip.revenue) || 0;
      const clientTds = Number(trip.tds_deducted_receivable) || 0;
      const fleetType = isAttached ? 'Attached' : 'Owned';
      
      let vendorName = 'N/A';
      let vendorPan = 'N/A';
      let grossPayout = 0;
      let appliedRate = 0;
      let vendorTds = 0;
      let netPayout = 0;

      if (isAttached) {
        vendorName = trip.driver_name || 'N/A';
        const driver = employeeMap[trip.driver_name];
        vendorPan = driver?.pan_card || 'Missing';
        grossPayout = Number(trip.vendor_payout) || 0;
        appliedRate = driver?.pan_card ? 1 : 20;
        vendorTds = grossPayout * (appliedRate / 100);
        netPayout = grossPayout - vendorTds;
      }

      // GST logic: clients like Amazon are usually RCM (5%), others could be Forward Charge (12%)
      const isRcm = clientName.toLowerCase().includes('amazon') || clientName.toLowerCase().includes('flipkart');
      const gstClass = isRcm ? 'Reverse Charge Mechanism (RCM - 5%)' : 'Forward Charge (12%)';

      const row = [
        trip.trip_id || 'N/A',
        trip.date ? trip.date.substring(0, 10) : 'N/A',
        `"${clientName.replace(/"/g, '""')}"`,
        grossInvoice,
        clientTds,
        fleetType,
        `"${vendorName.replace(/"/g, '""')}"`,
        vendorPan,
        grossPayout,
        `${appliedRate}%`,
        vendorTds.toFixed(2),
        netPayout.toFixed(2),
        `"${gstClass}"`
      ];

      csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tax_ledger_export.csv');
    res.status(200).send(csvRows.join('\n'));

  } catch (error) {
    console.error('Error exporting tax ledger:', error);
    res.status(500).send('Failed to generate export file.');
  }
});

export default router;
