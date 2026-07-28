import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Runtime-configurable Render API key (persisted to a local JSON file) ─────
const KEY_FILE = path.resolve(__dirname, '../../render_api_key.json');

function loadRenderKey() {
  try {
    if (fs.existsSync(KEY_FILE)) {
      const raw = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
      if (raw?.key) return raw.key;
    }
  } catch (_) {}
  return process.env.RENDER_API_KEY || '';
}

function saveRenderKey(key) {
  fs.writeFileSync(KEY_FILE, JSON.stringify({ key, savedAt: new Date().toISOString() }));
}

const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d91t98m7r5hc738tjdag';

// ── Collections to count records ──────────────────────────────────────────────
const ALL_COLLECTIONS = [
  'trip_logs', 'expenses', 'employees', 'trucks', 'cashbook',
  'advances', 'payroll', 'maintenance_logs', 'fuel_logs',
  'driver_accident_reports', 'routes', 'clients', 'payment_requests',
  'inventory', 'tyres', 'attendance',
];

// ── Render API helper ─────────────────────────────────────────────────────────
async function renderGet(path, apiKey) {
  const res = await fetch(`https://api.render.com/v1${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Render API ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Parse Render metric points ────────────────────────────────────────────────
function parsePoints(data) {
  // Render v1 response shapes vary — handle arrays and objects
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.points)) return data.points;
  if (Array.isArray(data?.values)) return data.values;
  return [];
}

// ── Fetch live Render metrics: bandwidth + CPU + memory ───────────────────────
async function fetchRenderMetrics(apiKey) {
  if (!apiKey) return null;

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const h48Start   = new Date(now.getTime() - 48 * 3600 * 1000);
    const h24Start   = new Date(now.getTime() - 24 * 3600 * 1000);

    const qs = (start, end, res) =>
      `?startTime=${start.toISOString()}&endTime=${end.toISOString()}&resolution=${res}`;

    // Try Render v1 metrics endpoints
    const bwMonthPath  = `/services/${RENDER_SERVICE_ID}/metrics/bandwidth${qs(monthStart, now, 'day')}`;
    const bwChartPath  = `/services/${RENDER_SERVICE_ID}/metrics/bandwidth${qs(h48Start, now, 'hour')}`;
    const cpuPath      = `/services/${RENDER_SERVICE_ID}/metrics/cpu${qs(h24Start, now, 'hour')}`;
    const memPath      = `/services/${RENDER_SERVICE_ID}/metrics/memory${qs(h24Start, now, 'hour')}`;
    const svcPath      = `/services/${RENDER_SERVICE_ID}`;

    const [bwMonth, bwChart, cpuData, memData, svcData] = await Promise.allSettled([
      renderGet(bwMonthPath, apiKey),
      renderGet(bwChartPath, apiKey),
      renderGet(cpuPath, apiKey),
      renderGet(memPath, apiKey),
      renderGet(svcPath, apiKey),
    ]);

    // ── Bandwidth ────────────────────────────────────────────────────────────
    const monthPts = bwMonth.status === 'fulfilled' ? parsePoints(bwMonth.value) : [];
    const chartPts = bwChart.status === 'fulfilled' ? parsePoints(bwChart.value) : [];

    const totalOutBytes = monthPts.reduce((s, p) => s + (p.outbound ?? p.bytesOut ?? p.value ?? 0), 0);
    const totalInBytes  = monthPts.reduce((s, p) => s + (p.inbound  ?? p.bytesIn  ?? 0), 0);

    const hourlyChart = chartPts.slice(-48).map(p => ({
      time: new Date(p.timestamp ?? p.time ?? Date.now()).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      outbound: +(((p.outbound ?? p.bytesOut ?? p.value ?? 0) / (1024 * 1024)).toFixed(3)),
      inbound:  +(((p.inbound  ?? p.bytesIn  ?? 0)           / (1024 * 1024)).toFixed(3)),
    }));

    // ── CPU ──────────────────────────────────────────────────────────────────
    const cpuPts = cpuData.status === 'fulfilled' ? parsePoints(cpuData.value) : [];
    const cpuLatest   = cpuPts.length ? cpuPts[cpuPts.length - 1] : null;
    const cpuPercent  = cpuLatest ? Math.round(cpuLatest.value ?? cpuLatest.percent ?? 0) : null;
    const cpuChart    = cpuPts.slice(-24).map(p => ({
      time: new Date(p.timestamp ?? p.time ?? Date.now()).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      cpu: Math.round(p.value ?? p.percent ?? 0),
    }));

    // ── Memory ───────────────────────────────────────────────────────────────
    const memPts = memData.status === 'fulfilled' ? parsePoints(memData.value) : [];
    const memLatest     = memPts.length ? memPts[memPts.length - 1] : null;
    const memUsedBytes  = memLatest ? (memLatest.value ?? memLatest.bytesUsed ?? 0) : null;
    const memUsedMB     = memUsedBytes !== null ? Math.round(memUsedBytes / (1024 * 1024)) : null;

    const memChart = memPts.slice(-24).map(p => ({
      time: new Date(p.timestamp ?? p.time ?? Date.now()).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      memMB: Math.round((p.value ?? p.bytesUsed ?? 0) / (1024 * 1024)),
    }));

    // ── Service Info ─────────────────────────────────────────────────────────
    const svc       = svcData.status === 'fulfilled' ? svcData.value : null;
    const serviceInfo = svc ? {
      name:      svc.service?.name ?? svc.name ?? null,
      status:    svc.service?.suspended ?? svc.status ?? null,
      region:    svc.service?.serviceDetails?.region ?? null,
      plan:      svc.service?.serviceDetails?.plan ?? null,
      createdAt: svc.service?.createdAt ?? null,
      url:       svc.service?.serviceDetails?.url ?? null,
    } : null;

    return {
      source:            'render',
      monthlyOutboundGB: +(totalOutBytes / (1024 ** 3)).toFixed(4),
      monthlyInboundGB:  +(totalInBytes  / (1024 ** 3)).toFixed(4),
      hourlyChart:       hourlyChart.length ? hourlyChart : null,
      cpu: {
        currentPercent: cpuPercent,
        chart:          cpuChart.length ? cpuChart : null,
      },
      memory: {
        usedMB:  memUsedMB,
        chart:   memChart.length ? memChart : null,
      },
      serviceInfo,
    };
  } catch (err) {
    logger.warn('Render metrics API error:', err.message);
    return { source: 'render_error', error: err.message };
  }
}

// ── PocketBase record + storage stats ────────────────────────────────────────
async function fetchPocketBaseStats() {
  try {
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_SUPERUSER_EMAIL    || 'munnarathod222@gmail.com',
        process.env.PB_SUPERUSER_PASSWORD || 'admin123456'
      ).catch(() => {});
    }

    const countResults = await Promise.allSettled(
      ALL_COLLECTIONS.map(col =>
        pb.collection(col).getList(1, 1, { $autoCancel: false })
          .then(r => ({ col, count: r.totalItems }))
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

    // Today's activity
    const now      = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayActivity = await Promise.allSettled(
      ['trip_logs', 'expenses', 'cashbook', 'maintenance_logs'].map(col =>
        pb.collection(col).getList(1, 1, { filter: `created >= "${dayStart}"`, $autoCancel: false })
          .then(r => r.totalItems)
      )
    );
    const todayCount = todayActivity
      .filter(r => r.status === 'fulfilled')
      .reduce((s, r) => s + r.value, 0);

    // Hourly chart from cashbook activity (48h)
    const since48h = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
    let hourlyChart = null;
    try {
      const recentRecs = await pb.collection('cashbook').getList(1, 500, {
        filter: `created >= "${since48h}"`, sort: '-created', $autoCancel: false,
      });
      const hourlyMap = {};
      for (const rec of recentRecs.items) {
        const hKey = new Date(rec.created).toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true,
        });
        hourlyMap[hKey] = (hourlyMap[hKey] || 0) + 1;
      }
      const points = Object.entries(hourlyMap).map(([time, count]) => ({
        time,
        outbound: +(count * 0.05).toFixed(3),
        inbound:  +(count * 0.005).toFixed(3),
      }));
      if (points.length >= 2) hourlyChart = points.slice(-28);
    } catch (_) {}

    const estimatedMonthlyOutboundGB = +((totalRecords * 2.5) / (1024 * 1024)).toFixed(4);

    return {
      totalRecords,
      collectionCounts,
      estimatedStorageMB: Math.round(totalRecords * 0.05),
      estimatedMonthlyOutboundGB,
      todayActivityCount: todayCount,
      hourlyChart,
    };
  } catch (err) {
    logger.error('PocketBase stats error:', err.message);
    return null;
  }
}

// ── POST /bandwidth/set-api-key  (save Render API key at runtime) ─────────────
router.post('/set-api-key', async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string' || !key.startsWith('rnd_')) {
    return res.status(400).json({ success: false, error: 'Invalid Render API key. Must start with "rnd_".' });
  }
  try {
    // Verify key works by hitting service endpoint
    const testRes = await renderGet(`/services/${RENDER_SERVICE_ID}`, key);
    if (!testRes) throw new Error('Empty response from Render API');
    saveRenderKey(key);
    logger.info('✅ Render API key saved and verified successfully.');
    res.json({ success: true, message: 'Render API key saved and verified!', service: testRes?.service?.name ?? RENDER_SERVICE_ID });
  } catch (err) {
    res.status(400).json({ success: false, error: `Key verification failed: ${err.message}` });
  }
});

// ── DELETE /bandwidth/set-api-key  (remove key) ───────────────────────────────
router.delete('/set-api-key', (req, res) => {
  try {
    if (fs.existsSync(KEY_FILE)) fs.unlinkSync(KEY_FILE);
    res.json({ success: true, message: 'Render API key removed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /bandwidth ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const apiKey = loadRenderKey();

    const [renderData, pbData] = await Promise.all([
      fetchRenderMetrics(apiKey),
      fetchPocketBaseStats(),
    ]);

    const FREE_TIER_GB    = 5.0;
    const monthlyOutbound = renderData?.monthlyOutboundGB ?? pbData?.estimatedMonthlyOutboundGB ?? 0;
    const overageGB       = Math.max(0, monthlyOutbound - FREE_TIER_GB);

    const defaultChart = [
      { time: '6 am',  outbound: 0.12, inbound: 0.01 },
      { time: '10 am', outbound: 0.45, inbound: 0.03 },
      { time: '2 pm',  outbound: 0.82, inbound: 0.05 },
      { time: '6 pm',  outbound: 0.38, inbound: 0.02 },
      { time: 'Now',   outbound: 0.21, inbound: 0.01 },
    ];

    const hourlyChart = renderData?.hourlyChart
      || pbData?.hourlyChart
      || defaultChart;

    res.json({
      success: true,
      source:              renderData?.source === 'render' ? 'render' : 'pocketbase',
      renderApiConfigured: !!apiKey,
      renderError:         renderData?.error ?? null,
      bandwidth: {
        monthlyOutboundGB: monthlyOutbound,
        monthlyInboundGB:  renderData?.monthlyInboundGB ?? 0,
        freeTierLimitGB:   FREE_TIER_GB,
        overageGB,
        percentageUsed:    Math.round((monthlyOutbound / FREE_TIER_GB) * 100),
        hourlyChart,
      },
      compute: renderData?.source === 'render' ? {
        cpu:    renderData.cpu,
        memory: renderData.memory,
      } : null,
      serviceInfo: renderData?.serviceInfo ?? null,
      storage: {
        estimatedUsedMB: pbData?.estimatedStorageMB ?? 0,
        totalRecords:    pbData?.totalRecords ?? 0,
        collections:     pbData?.collectionCounts ?? {},
        todayActivity:   pbData?.todayActivityCount ?? 0,
      },
      meta: {
        fetchedAt:  new Date().toISOString(),
        serviceId:  RENDER_SERVICE_ID,
        pbConnected: !!pbData,
      },
    });
  } catch (err) {
    logger.error('Bandwidth route error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
