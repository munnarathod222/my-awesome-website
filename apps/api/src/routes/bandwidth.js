import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d91t98m7r5hc738tjdag';
const RENDER_API_KEY   = process.env.RENDER_API_KEY || '';

// ── Collections that store files (used to estimate storage) ──────────────────
const FILE_COLLECTIONS = [
  'driver_accident_reports',
  'expenses',
  'employees',
  'trucks',
  'trip_logs',
  'maintenance_logs',
  'fuel_logs',
];

// ── All collections to count records ────────────────────────────────────────
const ALL_COLLECTIONS = [
  'trip_logs', 'expenses', 'employees', 'trucks', 'cashbook',
  'advances', 'payroll', 'maintenance_logs', 'fuel_logs',
  'driver_accident_reports', 'routes', 'clients', 'payment_requests',
  'inventory', 'tyres', 'attendance',
];

// ── Fetch actual Render bandwidth via Render REST API ────────────────────────
async function fetchRenderBandwidth() {
  if (!RENDER_API_KEY) return null;

  try {
    const now     = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Hourly chart: last 48 hours
    const chartStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const [monthRes, chartRes] = await Promise.all([
      fetch(
        `https://api.render.com/v1/metrics/bandwidth?resource=${RENDER_SERVICE_ID}&startTime=${monthStart.toISOString()}&endTime=${now.toISOString()}&resolution=day`,
        { headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: 'application/json' } }
      ),
      fetch(
        `https://api.render.com/v1/metrics/bandwidth?resource=${RENDER_SERVICE_ID}&startTime=${chartStart.toISOString()}&endTime=${now.toISOString()}&resolution=hour`,
        { headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: 'application/json' } }
      ),
    ]);

    if (!monthRes.ok || !chartRes.ok) return null;

    const [monthData, chartData] = await Promise.all([monthRes.json(), chartRes.json()]);

    // monthData shape: { data: [{ timestamp, outbound, inbound }] }
    const monthPoints = monthData?.data || monthData?.points || [];
    const chartPoints = chartData?.data || chartData?.points || [];

    const totalOutboundBytes = monthPoints.reduce((s, p) => s + (p.outbound || p.value || 0), 0);
    const totalInboundBytes  = monthPoints.reduce((s, p) => s + (p.inbound  || 0), 0);

    const hourlyChart = chartPoints.map(p => ({
      time: new Date(p.timestamp || p.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      outbound: Math.round((p.outbound || p.value || 0) / (1024 * 1024) * 100) / 100,  // → MB
      inbound:  Math.round((p.inbound  || 0)            / (1024 * 1024) * 100) / 100,
    }));

    return {
      source: 'render',
      monthlyOutboundGB: Math.round(totalOutboundBytes / (1024 ** 3) * 1000) / 1000,
      monthlyInboundGB:  Math.round(totalInboundBytes  / (1024 ** 3) * 1000) / 1000,
      hourlyChart,
    };
  } catch (err) {
    logger.warn('Render bandwidth API error:', err.message);
    return null;
  }
}

// ── Query PocketBase for real record-level storage & activity stats ──────────
async function fetchPocketBaseStats() {
  try {
    // Authenticate PocketBase admin client
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_SUPERUSER_EMAIL    || 'munnarathod222@gmail.com',
        process.env.PB_SUPERUSER_PASSWORD || 'admin123456'
      );
    }

    // 1. Record counts across all collections
    const countResults = await Promise.allSettled(
      ALL_COLLECTIONS.map(col =>
        pb.collection(col).getList(1, 1, { $autoCancel: false }).then(r => ({ col, count: r.totalItems }))
      )
    );

    const collectionCounts = {};
    let totalRecords = 0;
    for (const r of countResults) {
      if (r.status === 'fulfilled') {
        collectionCounts[r.value.col] = r.value.count;
        totalRecords += r.value.count;
      }
    }

    // 2. Recent activity: records created today vs yesterday vs last 7 days
    const now      = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const activityCollections = ['trip_logs', 'expenses', 'cashbook', 'maintenance_logs'];
    const weeklyActivity      = {};

    for (const col of activityCollections) {
      try {
        const recs = await pb.collection(col).getList(1, 500, {
          filter: `created >= "${weekAgo}"`,
          sort:   '-created',
          $autoCancel: false,
        });
        // Group by day
        const byDay = {};
        for (const rec of recs.items) {
          const day = rec.created.split(' ')[0].split('T')[0];
          byDay[day] = (byDay[day] || 0) + 1;
        }
        weeklyActivity[col] = byDay;
      } catch (_) {/* skip missing collections */}
    }

    // 3. Build a 48-hour activity chart from combined record creation times
    const hourlyMap = {};
    try {
      const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const recentRecs = await pb.collection('cashbook').getList(1, 500, {
        filter: `created >= "${since48h}"`,
        sort:   '-created',
        $autoCancel: false,
      });

      for (const rec of recentRecs.items) {
        const d    = new Date(rec.created);
        const hKey = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        hourlyMap[hKey] = (hourlyMap[hKey] || 0) + 1;
      }
    } catch (_) {/* no cashbook */}

    // 4. Estimate storage from file-bearing collections
    let estimatedFileStorageMB = 0;
    for (const col of FILE_COLLECTIONS) {
      try {
        const sample = await pb.collection(col).getList(1, 50, { $autoCancel: false });
        // Each doc with files: rough avg 200 KB per image
        for (const rec of sample.items) {
          const fileFields = Object.entries(rec).filter(([, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'string' && v[0].includes('.'));
          const fileCount = fileFields.reduce((s, [, v]) => s + v.length, 0);
          estimatedFileStorageMB += fileCount * 0.2; // 200KB avg per file
        }
        // Extrapolate to full collection
        if (collectionCounts[col] && sample.totalItems > 0) {
          estimatedFileStorageMB = estimatedFileStorageMB * (collectionCounts[col] / Math.min(sample.items.length, 50));
        }
      } catch (_) {/* skip */}
    }

    // 5. Estimate monthly bandwidth from record count and avg response size
    // Average API response: ~2KB per record, outbound is served data
    const avgRecordSizeKB  = 2.5;
    const estimatedMonthlyOutboundMB = (totalRecords * avgRecordSizeKB) / 1024;
    const estimatedMonthlyOutboundGB = Math.round(estimatedMonthlyOutboundMB / 1024 * 1000) / 1000;

    // 6. Today vs previous day
    const todayRecs = await Promise.allSettled(
      activityCollections.map(col =>
        pb.collection(col).getList(1, 1, { filter: `created >= "${dayStart}"`, $autoCancel: false }).then(r => r.totalItems)
      )
    );
    const todayCount = todayRecs.filter(r => r.status === 'fulfilled').reduce((s, r) => s + r.value, 0);

    // Build hourly chart from real activity (use cashbook + trip_logs as proxy)
    const hourlyChartData = Object.entries(hourlyMap)
      .map(([time, count]) => ({ time, outbound: count * 0.05, inbound: count * 0.005 })) // rough MB per API call
      .slice(-28);

    return {
      source: 'pocketbase',
      totalRecords,
      collectionCounts,
      estimatedStorageMB: Math.round(estimatedFileStorageMB),
      estimatedMonthlyOutboundGB,
      todayActivityCount: todayCount,
      hourlyChart: hourlyChartData.length >= 3 ? hourlyChartData : null,
      weeklyActivity,
      timestamp: now.toISOString(),
    };
  } catch (err) {
    logger.error('PocketBase stats error:', err.message);
    return null;
  }
}

// ── GET /bandwidth ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [renderData, pbData] = await Promise.all([
      fetchRenderBandwidth(),
      fetchPocketBaseStats(),
    ]);

    const FREE_TIER_GB    = 5.0;
    const monthlyOutbound = renderData?.monthlyOutboundGB ?? pbData?.estimatedMonthlyOutboundGB ?? 0;
    const overageGB       = Math.max(0, monthlyOutbound - FREE_TIER_GB);

    // Use Render chart if available, otherwise PocketBase activity proxy
    const defaultChart = [
      { time: '12am', outbound: 0.1, inbound: 0.01 },
      { time: '6am',  outbound: 0.3, inbound: 0.02 },
      { time: '12pm', outbound: 0.8, inbound: 0.04 },
      { time: '6pm',  outbound: 0.5, inbound: 0.03 },
      { time: 'Now',  outbound: 0.2, inbound: 0.01 },
    ];

    const hourlyChart = renderData?.hourlyChart
      || pbData?.hourlyChart
      || defaultChart;

    res.json({
      success: true,
      source: renderData ? 'render' : 'pocketbase',
      renderApiConfigured: !!RENDER_API_KEY,
      bandwidth: {
        monthlyOutboundGB: monthlyOutbound,
        monthlyInboundGB:  renderData?.monthlyInboundGB ?? 0,
        freeTierLimitGB:   FREE_TIER_GB,
        overageGB,
        percentageUsed:    Math.round((monthlyOutbound / FREE_TIER_GB) * 100),
        hourlyChart,
      },
      storage: {
        estimatedUsedMB: pbData?.estimatedStorageMB ?? 0,
        totalRecords:    pbData?.totalRecords ?? 0,
        collections:     pbData?.collectionCounts ?? {},
        todayActivity:   pbData?.todayActivityCount ?? 0,
      },
      meta: {
        fetchedAt:     new Date().toISOString(),
        serviceId:     RENDER_SERVICE_ID,
        pbConnected:   !!pbData,
      },
    });
  } catch (err) {
    logger.error('Bandwidth route error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
