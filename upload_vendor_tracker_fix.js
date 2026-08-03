const https = require('https');
const fs = require('fs');
const path = require('path');

const GH_TOKEN = process.env.GH_TOKEN;
const OWNER = 'munnarathod222';
const REPO = 'my-awesome-website';
const BRANCH = 'main';

function ghRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'JBC-Deploy/1.0',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getFileSha(repoPath) {
  const res = await ghRequest('GET', `/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${BRANCH}`);
  if (res.status === 200) return res.data.sha;
  return null;
}

async function uploadFile(repoPath, localPath, message) {
  const localContent = fs.readFileSync(path.join(__dirname, localPath));
  const encoded = localContent.toString('base64');
  const sha = await getFileSha(repoPath);
  const body = { message, content: encoded, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await ghRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${repoPath}`, body);
  if (res.status === 200 || res.status === 201) {
    console.log(`✅ ${repoPath} — commit: ${res.data.commit?.sha?.substring(0, 8)}`);
  } else {
    console.error(`❌ ${repoPath} — ${res.status}: ${res.data?.message}`);
  }
}

async function main() {
  console.log('Uploading Vendor Tracker & Client Empanelment Edit/Add Fixes...');
  await uploadFile(
    'apps/web/src/pages/VendorTrackerPage.jsx',
    'apps/web/src/pages/VendorTrackerPage.jsx',
    'fix: enable track client empanelment form modal and add edit/delete actions for client vendor IDs'
  );

  console.log('\nUploading dist files...');
  await uploadFile('dist/apps/web/index.html', 'dist/apps/web/index.html', 'chore: update dist index.html for vendor tracker fix');
  console.log('Uploading JS bundle (5.0MB)...');
  await uploadFile('dist/apps/web/assets/index-DTJz_ZHG.js', 'dist/apps/web/assets/index-DTJz_ZHG.js', 'chore: update dist JS bundle');
  console.log('Uploading CSS bundle...');
  await uploadFile('dist/apps/web/assets/index-D-u3L8ld.css', 'dist/apps/web/assets/index-D-u3L8ld.css', 'chore: update dist CSS bundle');

  console.log('\n✅ Vendor Registration Hub fixes uploaded!');
}

main().catch(console.error);
