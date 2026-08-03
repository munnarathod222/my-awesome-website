import PocketBase from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';

const PB_HOST = process.env.PB_URL || 'https://www.jaibhavanicargo.com/hcgi/platform';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
const SUPERUSER_PASS = process.env.PB_SUPERUSER_PASSWORD || 'cargo123456';

const backupPath = path.resolve('../../backups/full_system_backup_2026-07-25T12-10-06-796Z/ALL_DATA_MASTER.json');

async function restoreLive() {
  console.log(`\n======================================================`);
  console.log(`🌐 RESTORING ALL DATA TO POCKETBASE HOST: ${PB_HOST}`);
  console.log(`======================================================\n`);

  const pb = new PocketBase(PB_HOST);
  pb.autoCancellation(false);

  try {
    // Authenticate as superuser
    await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
    console.log('🔑 Authenticated as superuser on live server successfully.\n');
  } catch (err) {
    console.log('⚠️ Could not authenticate with superusers endpoint, trying normal users collection...');
    try {
      await pb.collection('users').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS);
      console.log('🔑 Authenticated as user successfully.\n');
    } catch (e2) {
      console.error('❌ Could not authenticate as superuser or user on live host:', e2.message);
      return;
    }
  }

  const masterData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  let totalPushed = 0;

  for (const [colName, records] of Object.entries(masterData)) {
    if (!Array.isArray(records) || records.length === 0 || colName.startsWith('_')) continue;

    let colPushed = 0;
    for (const record of records) {
      try {
        // Remove system metadata that PB auto-generates if updating/creating
        const payload = { ...record };
        delete payload.collectionId;
        delete payload.collectionName;

        // Try update first, or create if doesn't exist
        try {
          await pb.collection(colName).update(record.id, payload, { $autoCancel: false });
          colPushed++;
        } catch (updateErr) {
          await pb.collection(colName).create(payload, { $autoCancel: false });
          colPushed++;
        }
      } catch (err) {
        // Ignore duplicate or schema constraint errors silently
      }
    }
    console.log(`  ✅ Collection '${colName.padEnd(25)}': ${colPushed}/${records.length} records pushed`);
    totalPushed += colPushed;
  }

  console.log(`\n======================================================`);
  console.log(`🎉 LIVE RESTORE COMPLETED! Total records synced: ${totalPushed}`);
  console.log(`======================================================\n`);
}

restoreLive().catch(err => console.error('Live restore error:', err));
