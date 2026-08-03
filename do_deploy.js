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

async function updateFile(repoPath, localPath, message) {
  // Get current file SHA from GitHub
  const getRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${BRANCH}`);
  if (getRes.status !== 200) {
    console.error(`Failed to get ${repoPath}:`, getRes.status, getRes.data?.message);
    return;
  }
  const currentSha = getRes.data.sha;
  console.log(`Got SHA for ${repoPath}: ${currentSha.substring(0, 8)}`);

  // Read local file and base64 encode
  const localContent = fs.readFileSync(path.join(__dirname, localPath), 'utf8');
  const encoded = Buffer.from(localContent).toString('base64');

  // Update file
  const putRes = await ghRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${repoPath}`, {
    message,
    content: encoded,
    sha: currentSha,
    branch: BRANCH
  });

  if (putRes.status === 200 || putRes.status === 201) {
    console.log(`✅ Updated ${repoPath} — commit: ${putRes.data.commit?.sha?.substring(0, 8)}`);
  } else {
    console.error(`❌ Failed to update ${repoPath}:`, putRes.status, JSON.stringify(putRes.data));
  }
}

async function main() {
  console.log('Updating files via GitHub API...\n');

  await updateFile(
    'apps/web/src/components/DocumentPreviewModal.jsx',
    'apps/web/src/components/DocumentPreviewModal.jsx',
    'fix: show both front and back page in document preview modal'
  );

  await updateFile(
    'apps/web/src/pages/TruckDocsPage.jsx',
    'apps/web/src/pages/TruckDocsPage.jsx',
    'fix: check all file fields (file, files, back_file) in truck docs'
  );

  console.log('\nDone! Render will auto-deploy from these commits.');
}

main().catch(console.error);
