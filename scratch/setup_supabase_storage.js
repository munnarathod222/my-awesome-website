import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://bwyashgnriarmuhosqov.supabase.co';
const supabaseKey = 'sb_secret_Oay759_VoPC2O_ifxAfcSA_09LkApAM';

async function setup() {
  // 1. Create backups bucket
  console.log('Creating backups bucket...');
  const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'backups',
      name: 'backups',
      public: false
    })
  });
  
  let createData = {};
  try {
    createData = await createRes.json();
  } catch (e) {
    createData = { status: createRes.status, statusText: createRes.statusText };
  }
  console.log('Bucket creation response:', createData);

  // 2. Upload local data.db
  const localDbPath = path.resolve('apps/pocketbase/pb_data/data.db');
  if (!fs.existsSync(localDbPath)) {
    console.error(`❌ Local SQLite file not found at ${localDbPath}`);
    return;
  }

  console.log(`Uploading local database ${localDbPath} to Supabase...`);
  const fileBuffer = fs.readFileSync(localDbPath);
  
  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/backups/data.db`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: fileBuffer
  });
  
  let uploadData = {};
  try {
    uploadData = await uploadRes.json();
  } catch (e) {
    uploadData = { status: uploadRes.status, statusText: uploadRes.statusText };
  }
  console.log('Upload response:', uploadData);
  console.log('🎉 Setup complete!');
}

setup().catch(console.error);
