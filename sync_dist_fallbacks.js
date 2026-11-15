const fs = require('fs');
const path = require('path');

console.log('--- sync_dist_fallbacks.js: Protecting and syncing modern unified production bundle ---');

// 1. Sync from fresh apps/web/dist build if present
const webDist = path.resolve(__dirname, 'apps/web/dist');
const targets = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, 'dist/apps/web'),
  path.resolve(__dirname, 'apps/api/dist'),
  path.resolve(__dirname, 'apps/web/dist')
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(webDist) && fs.existsSync(path.join(webDist, 'index.html'))) {
  for (const t of targets) {
    if (t !== webDist) {
      copyDirRecursive(webDist, t);
    }
  }
  console.log('✓ Successfully synced fresh apps/web/dist assets across all distribution directories.');
}

const primaryIndexHtml = path.resolve(__dirname, 'dist/index.html');
const primaryBundle = path.resolve(__dirname, 'dist/assets/index-DLxf9dwO.js');
const primaryIndexHashed = path.resolve(__dirname, 'dist/assets/index-B9k2Lm7P.js');
const primaryTripLogsHashed = path.resolve(__dirname, 'dist/assets/TripLogsPage-B9k2Lm7P.js');
const primaryProfilePage = path.resolve(__dirname, 'dist/assets/ProfilePage-f6cQzKX5.js');
const primaryTripLogsPage = path.resolve(__dirname, 'dist/assets/TripLogsPage-B1zVaUO1.js');
const primaryMaintenancePage = path.resolve(__dirname, 'dist/assets/MaintenancePage-FpBhnDc2.js');
const primaryMaintenancePageHashed = path.resolve(__dirname, 'dist/assets/MaintenancePage-B9k2Lm7P.js');
const primaryTruckManagerPage = path.resolve(__dirname, 'dist/assets/TruckManagerPage-B6Tv7tbO.js');
const primaryTyreManagementPage = path.resolve(__dirname, 'dist/assets/TyreManagementPage-Boonzp_q.js');
const primaryPodManagementPage = path.resolve(__dirname, 'dist/assets/PODManagementPage-RbmOVLGd.js');
const primaryLorryReceiptsPage = path.resolve(__dirname, 'dist/assets/LorryReceiptsPage-DLxf9dwO.js');
const primaryClientPortalPage = path.resolve(__dirname, 'dist/assets/ClientPortalPage-DuEOcerk.js');
const primaryVendorTrackerPage = path.resolve(__dirname, 'dist/assets/VendorTrackerPage-CVOInZPv.js');

if (!fs.existsSync(primaryIndexHtml) || !fs.existsSync(primaryBundle)) {
  console.error('Critical: Primary modern assets missing!');
  process.exit(1);
}

const htmlContent = fs.readFileSync(primaryIndexHtml, 'utf8');
const bundleBuffer = fs.readFileSync(primaryBundle);
const profilePageBuffer = fs.existsSync(primaryProfilePage) ? fs.readFileSync(primaryProfilePage) : null;
const tripLogsPageBuffer = fs.existsSync(primaryTripLogsPage) ? fs.readFileSync(primaryTripLogsPage) : null;
const maintenancePageBuffer = fs.existsSync(primaryMaintenancePage) ? fs.readFileSync(primaryMaintenancePage) : null;
const truckManagerPageBuffer = fs.existsSync(primaryTruckManagerPage) ? fs.readFileSync(primaryTruckManagerPage) : null;
const tyreManagementPageBuffer = fs.existsSync(primaryTyreManagementPage) ? fs.readFileSync(primaryTyreManagementPage) : null;
const podManagementPageBuffer = fs.existsSync(primaryPodManagementPage) ? fs.readFileSync(primaryPodManagementPage) : null;
const lorryReceiptsPageBuffer = fs.existsSync(primaryLorryReceiptsPage) ? fs.readFileSync(primaryLorryReceiptsPage) : null;
const clientPortalPageBuffer = fs.existsSync(primaryClientPortalPage) ? fs.readFileSync(primaryClientPortalPage) : null;
const vendorTrackerPageBuffer = fs.existsSync(primaryVendorTrackerPage) ? fs.readFileSync(primaryVendorTrackerPage) : null;

console.log(`Modern index.html size: ${htmlContent.length} bytes`);
console.log(`Modern index-DLxf9dwO.js bundle size: ${bundleBuffer.length} bytes`);
if (profilePageBuffer) console.log(`Modern ProfilePage-f6cQzKX5.js size: ${profilePageBuffer.length} bytes`);
if (tripLogsPageBuffer) console.log(`Modern TripLogsPage-B1zVaUO1.js size: ${tripLogsPageBuffer.length} bytes`);
if (maintenancePageBuffer) console.log(`Modern MaintenancePage-FpBhnDc2.js size: ${maintenancePageBuffer.length} bytes`);
if (truckManagerPageBuffer) console.log(`Modern TruckManagerPage-B6Tv7tbO.js size: ${truckManagerPageBuffer.length} bytes`);
if (tyreManagementPageBuffer) console.log(`Modern TyreManagementPage-Boonzp_q.js size: ${tyreManagementPageBuffer.length} bytes`);
if (podManagementPageBuffer) console.log(`Modern PODManagementPage-RbmOVLGd.js size: ${podManagementPageBuffer.length} bytes`);
if (lorryReceiptsPageBuffer) console.log(`Modern LorryReceiptsPage-DLxf9dwO.js size: ${lorryReceiptsPageBuffer.length} bytes`);
if (clientPortalPageBuffer) console.log(`Modern ClientPortalPage-DuEOcerk.js size: ${clientPortalPageBuffer.length} bytes`);

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.mkdirSync(path.join(target, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(target, 'index.html'), htmlContent, 'utf8');
    fs.writeFileSync(path.join(target, 'assets', 'index-DLxf9dwO.js'), bundleBuffer);
    fs.writeFileSync(path.join(target, 'assets', 'index-B9k2Lm7P.js'), bundleBuffer);
    if (fs.existsSync(primaryTripLogsHashed)) {
      fs.copyFileSync(primaryTripLogsHashed, path.join(target, 'assets', 'TripLogsPage-B9k2Lm7P.js'));
    }
    if (profilePageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'ProfilePage-f6cQzKX5.js'), profilePageBuffer);
    }
    if (tripLogsPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'TripLogsPage-B1zVaUO1.js'), tripLogsPageBuffer);
    }
    if (vendorTrackerPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'VendorTrackerPage-CVOInZPv.js'), vendorTrackerPageBuffer);
    }
    if (maintenancePageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'MaintenancePage-FpBhnDc2.js'), maintenancePageBuffer);
    }
    if (fs.existsSync(primaryMaintenancePageHashed)) {
      fs.copyFileSync(primaryMaintenancePageHashed, path.join(target, 'assets', 'MaintenancePage-B9k2Lm7P.js'));
    }
    if (truckManagerPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'TruckManagerPage-B6Tv7tbO.js'), truckManagerPageBuffer);
    }
    if (tyreManagementPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'TyreManagementPage-Boonzp_q.js'), tyreManagementPageBuffer);
    }
    if (podManagementPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'PODManagementPage-RbmOVLGd.js'), podManagementPageBuffer);
    }
    if (lorryReceiptsPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'LorryReceiptsPage-DLxf9dwO.js'), lorryReceiptsPageBuffer);
    }
    if (clientPortalPageBuffer) {
      fs.writeFileSync(path.join(target, 'assets', 'ClientPortalPage-DuEOcerk.js'), clientPortalPageBuffer);
    }
    console.log(`✓ Synced modern index.html, index-DLxf9dwO.js, index-B9k2Lm7P.js, MaintenancePage-B9k2Lm7P.js, ProfilePage, TripLogsPage, MaintenancePage, TruckManagerPage, TyreManagementPage, PODManagementPage, and ClientPortalPage to: ${target}`);
  }
}

console.log('✅ Modern website assets successfully protected and synced across all targets.');
