const fs = require('fs');
const path = require('path');

console.log('--- sync_dist_fallbacks.js: Protecting and syncing modern unified production bundle ---');

const primaryIndexHtml = path.resolve(__dirname, 'dist/index.html');
const primaryBundle = path.resolve(__dirname, 'dist/assets/index-DLxf9dwO.js');
const primaryProfilePage = path.resolve(__dirname, 'dist/assets/ProfilePage-f6cQzKX5.js');
const primaryTripLogsPage = path.resolve(__dirname, 'dist/assets/TripLogsPage-B1zVaUO1.js');
const primaryMaintenancePage = path.resolve(__dirname, 'dist/assets/MaintenancePage-FpBhnDc2.js');
const primaryTruckManagerPage = path.resolve(__dirname, 'dist/assets/TruckManagerPage-B6Tv7tbO.js');
const primaryTyreManagementPage = path.resolve(__dirname, 'dist/assets/TyreManagementPage-Boonzp_q.js');

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

console.log(`Modern index.html size: ${htmlContent.length} bytes`);
console.log(`Modern index-DLxf9dwO.js bundle size: ${bundleBuffer.length} bytes`);
if (profilePageBuffer) console.log(`Modern ProfilePage-f6cQzKX5.js size: ${profilePageBuffer.length} bytes`);
if (tripLogsPageBuffer) console.log(`Modern TripLogsPage-B1zVaUO1.js size: ${tripLogsPageBuffer.length} bytes`);
if (maintenancePageBuffer) console.log(`Modern MaintenancePage-FpBhnDc2.js size: ${maintenancePageBuffer.length} bytes`);
if (truckManagerPageBuffer) console.log(`Modern TruckManagerPage-B6Tv7tbO.js size: ${truckManagerPageBuffer.length} bytes`);
if (tyreManagementPageBuffer) console.log(`Modern TyreManagementPage-Boonzp_q.js size: ${tyreManagementPageBuffer.length} bytes`);

const targetDirs = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, 'dist/apps/web'),
  path.resolve(__dirname, 'apps/api/dist'),
  path.resolve(__dirname, 'apps/web/dist')
];

for (const t of targetDirs) {
  if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  fs.writeFileSync(path.join(t, 'index.html'), htmlContent, 'utf8');

  const assetsDir = path.join(t, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'index-DLxf9dwO.js'), bundleBuffer);
  if (profilePageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'ProfilePage-f6cQzKX5.js'), profilePageBuffer);
  }
  if (tripLogsPageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'TripLogsPage-B1zVaUO1.js'), tripLogsPageBuffer);
  }
  if (maintenancePageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'MaintenancePage-FpBhnDc2.js'), maintenancePageBuffer);
  }
  if (truckManagerPageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'TruckManagerPage-B6Tv7tbO.js'), truckManagerPageBuffer);
  }
  if (tyreManagementPageBuffer) {
    fs.writeFileSync(path.join(assetsDir, 'TyreManagementPage-Boonzp_q.js'), tyreManagementPageBuffer);
  }
  console.log(`✓ Synced modern index.html, index-DLxf9dwO.js, ProfilePage, TripLogsPage, MaintenancePage, TruckManagerPage, and TyreManagementPage to: ${t}`);
}

console.log('✅ Modern website assets successfully protected and synced across all targets.');
