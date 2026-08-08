import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';

const PB_HOST = process.env.PB_URL || 'https://www.jaibhavanicargo.com/hcgi/platform';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || 'operations@jaibhavanicargo.com';
const SUPERUSER_PASS = process.env.PB_SUPERUSER_PASSWORD || 'Munnarathod@25';

async function runBackup() {
  console.log(`\n======================================================`);
  console.log(`📦 STARTING COMPLETE SYSTEM BACKUP FROM POCKETBASE`);
  console.log(`🌐 Endpoint: ${PB_HOST}`);
  console.log(`======================================================\n`);

  const pb = new PocketBase(PB_HOST);
  pb.autoCancellation(false);

  try {
    await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    console.log('🔑 Authenticated as superuser successfully.\n');
  } catch (err) {
    console.error('❌ Failed to authenticate as superuser:', err.message);
    return;
  }

  // Fetch all collections in the PocketBase schema
  const collections = await pb.collections.getFullList({ sort: 'name' });
  console.log(`📋 Found ${collections.length} database collections to export.\n`);

  // Create timestamped backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(process.cwd(), `backups/full_system_backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const fullExportData = {};
  const reportSummary = {
    timestamp: new Date().toISOString(),
    host: PB_HOST,
    totalCollections: collections.length,
    totalRecords: 0,
    collections: {}
  };

  let exportedColsCount = 0;

  for (const col of collections) {
    const colName = col.name;
    try {
      const records = await pb.collection(colName).getFullList({ $autoCancel: false });
      
      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');

      fullExportData[colName] = records;
      reportSummary.totalRecords += records.length;
      reportSummary.collections[colName] = records.length;
      exportedColsCount += 1;

      console.log(`  ✅ [${exportedColsCount}/${collections.length}] ${colName.padEnd(30, ' ')} : ${records.length} records`);
    } catch (colErr) {
      console.log(`  ⚠️ [${exportedColsCount + 1}/${collections.length}] ${colName.padEnd(30, ' ')} : Error - ${colErr.message}`);
    }
  }

  // Save master JSON file
  const masterPath = path.join(backupDir, 'ALL_DATA_MASTER.json');
  fs.writeFileSync(masterPath, JSON.stringify(fullExportData, null, 2), 'utf8');

  // Save summary JSON file
  const summaryPath = path.join(backupDir, 'SUMMARY.json');
  fs.writeFileSync(summaryPath, JSON.stringify(reportSummary, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`🎉 FULL SYSTEM BACKUP COMPLETED SUCCESSFULLY!`);
  console.log(`📂 Location : ${backupDir}`);
  console.log(`📊 Summary  : ${reportSummary.totalRecords} total records across ${exportedColsCount} collections`);
  console.log(`======================================================\n`);

  return { backupDir, reportSummary };
}

runBackup().catch(err => console.error('\n❌ Backup Script Error:', err));
