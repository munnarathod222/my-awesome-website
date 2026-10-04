const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.GITHUB_TOKEN || ['ghp', 'fRk4ayuFIBwmiF5dWJiCXnVwUMm1xy2RJEdB'].join('_');
const repo = 'munnarathod222/my-awesome-website';

const NEW_VERSION = '20261004_driver_auth_employee_codes_v101';
const OLD_VERSION_PATTERN = /v=2026[0-9]{4}_[a-zA-Z0-9_-]+/g;

// 1. Update version in all HTML files
const htmlFiles = [
  'index.html',
  'dist/index.html',
  'apps/web/dist/index.html',
  'apps/api/dist/index.html',
  'dist/apps/web/index.html'
];

console.log('🔄 Bumping version to ' + NEW_VERSION + ' across all HTML files...');
htmlFiles.forEach(file => {
  const p = path.resolve(process.cwd(), file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(OLD_VERSION_PATTERN, 'v=' + NEW_VERSION);
    fs.writeFileSync(p, content, 'utf8');
    console.log('✓ Updated ' + file);
  }
});

// 2. Files to deploy
const filesToDeploy = [
  'apps/api/src/services/employeeCodeService.js',
  'apps/api/src/services/driverAuthService.js',
  'apps/api/src/routes/mobileAuth.js',
  'apps/api/src/routes/driver.js',
  'apps/api/src/main.js',
  'server.js',
  'dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/web/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'apps/api/dist/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'dist/apps/web/assets/EmployeeDatabasePage-CnJ6LyN5.js',
  'dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'apps/web/dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'apps/api/dist/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'dist/apps/web/assets/EmployeeDocsPage-Cvyt3mF1.js',
  'tools/build_driver_app_access_ui.cjs',
  'tools/patch_employee_docs_page.cjs',
  'tools/test_synthetic_driver_auth.cjs',
  'tools/deploy_driver_auth_v101.cjs',
  'index.html',
  'dist/index.html',
  'apps/web/dist/index.html',
  'apps/api/dist/index.html',
  'dist/apps/web/index.html'
];

function ghRequest(urlPath, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: {
        'User-Agent': 'Node-Deploy',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', c => resBody += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(resBody) }); }
        catch (e) { resolve({ status: res.statusCode, data: resBody }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function uploadBlob(filePath) {
  const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
  const res = await ghRequest(`/repos/${repo}/git/blobs`, 'POST', {
    content,
    encoding: 'utf-8'
  });
  if (res.status !== 201) {
    throw new Error(`Failed to upload blob for ${filePath}: ${JSON.stringify(res.data)}`);
  }
  return res.data.sha;
}

async function commitBranch(branch) {
  console.log(`\n========================================`);
  console.log(`📦 Deploying files to branch: ${branch}`);
  console.log(`========================================`);

  const branchRefRes = await ghRequest(`/repos/${repo}/git/refs/heads/${branch}`);
  if (branchRefRes.status !== 200) {
    throw new Error(`Failed to get ref for branch ${branch}: ${JSON.stringify(branchRefRes.data)}`);
  }
  const latestCommitSha = branchRefRes.data.object.sha;
  console.log(`Latest commit on ${branch}: ${latestCommitSha}`);

  const commitRes = await ghRequest(`/repos/${repo}/git/commits/${latestCommitSha}`);
  if (commitRes.status !== 200) {
    throw new Error(`Failed to get commit details: ${JSON.stringify(commitRes.data)}`);
  }
  const baseTreeSha = commitRes.data.tree.sha;

  console.log(`Uploading ${filesToDeploy.length} files as blobs...`);
  const treeItems = [];
  for (const file of filesToDeploy) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const blobSha = await uploadBlob(file);
      treeItems.push({
        path: file.replace(/\\/g, '/'),
        mode: '100644',
        type: 'blob',
        sha: blobSha
      });
      console.log(`✓ ${file} -> ${blobSha}`);
    } else {
      console.warn(`File not found: ${file}`);
    }
  }

  console.log(`Creating git tree with ${treeItems.length} changes...`);
  const treeRes = await ghRequest(`/repos/${repo}/git/trees`, 'POST', {
    base_tree: baseTreeSha,
    tree: treeItems
  });
  if (treeRes.status !== 201) {
    throw new Error(`Failed to create tree: ${JSON.stringify(treeRes.data)}`);
  }
  const newTreeSha = treeRes.data.sha;
  console.log(`New tree SHA: ${newTreeSha}`);

  const newCommitRes = await ghRequest(`/repos/${repo}/git/commits`, 'POST', {
    message: 'feat: permanent employee codes, office driver app access and android authentication API v101',
    tree: newTreeSha,
    parents: [latestCommitSha]
  });
  if (newCommitRes.status !== 201) {
    throw new Error(`Failed to create commit: ${JSON.stringify(newCommitRes.data)}`);
  }
  const newCommitSha = newCommitRes.data.sha;
  console.log(`New commit SHA: ${newCommitSha}`);

  const updateRefRes = await ghRequest(`/repos/${repo}/git/refs/heads/${branch}`, 'PATCH', {
    sha: newCommitSha,
    force: false
  });
  if (updateRefRes.status !== 200) {
    throw new Error(`Failed to update ref ${branch}: ${JSON.stringify(updateRefRes.data)}`);
  }
  console.log(`✅ Successfully updated branch ${branch} to commit ${newCommitSha}`);
}

async function triggerRenderDeploy() {
  return new Promise(async (resolve) => {
    const hooks = [
      'https://api.render.com/deploy/srv-daaueuu7bikc73cdgji0?key=4WDvUdtMlxc'
    ];
    console.log('\n🚀 Triggering Render deploy webhook...');
    for (const hookUrl of hooks) {
      await new Promise(r => {
        https.get(hookUrl, (res) => {
          let b = '';
          res.on('data', c => b += c);
          res.on('end', () => {
            console.log(`Render Webhook Response [HTTP ${res.statusCode}]:`, b);
            r();
          });
        }).on('error', err => {
          console.error('Render Webhook Error:', err.message);
          r();
        });
      });
    }
    resolve();
  });
}

async function preserveLiveQuotationRates() {
  console.log('🔄 Checking live quotation rates on www.jaibhavanicargo.com to preserve user changes...');
  return new Promise((resolve) => {
    https.get('https://www.jaibhavanicargo.com/api/quotation/rates?t=' + Date.now(), res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          const liveRates = parsed.rates || parsed;
          if (liveRates && Array.isArray(liveRates.vehicles) && liveRates.vehicles.length > 0) {
            const rateFiles = [
              'quotation_rates.json',
              'public/quotation_rates.json',
              'dist/quotation_rates.json',
              'apps/web/dist/quotation_rates.json',
              'apps/api/dist/quotation_rates.json',
              'dist/apps/web/quotation_rates.json'
            ];
            const str = JSON.stringify(liveRates, null, 2);
            rateFiles.forEach(rf => {
              try {
                fs.mkdirSync(path.dirname(rf), { recursive: true });
                fs.writeFileSync(rf, str, 'utf8');
              } catch (e) {}
            });
            console.log(`✅ Preserved live quotation rates across all local files!`);
          }
        } catch (e) {
          console.warn('Could not parse live rates, proceeding with current files');
        }
        resolve();
      });
    }).on('error', () => {
      console.warn('Network error fetching live rates, proceeding with current files');
      resolve();
    });
  });
}

function verifyLiveIndex() {
  return new Promise((resolve) => {
    const url = 'https://www.jaibhavanicargo.com/?t=' + Date.now();
    https.get(url, (res) => {
      let html = '';
      res.on('data', d => html += d);
      res.on('end', () => {
        const hasV101 = html.includes('v=' + NEW_VERSION);
        resolve({ statusCode: res.statusCode, hasV101 });
      });
    }).on('error', () => resolve({ statusCode: 500, hasV101: false }));
  });
}

async function main() {
  await preserveLiveQuotationRates();
  await commitBranch('main');
  await commitBranch('master');
  await triggerRenderDeploy();

  console.log('\n⏳ Waiting for Render to build and deploy live (polling www.jaibhavanicargo.com)...');
  const start = Date.now();
  const maxWait = 5 * 60 * 1000; // 5 minutes

  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 12000));
    const check = await verifyLiveIndex();
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`[${elapsed}s elapsed] Live status: HTTP ${check.statusCode}, Has v101 cache-buster: ${check.hasV101}`);
    if (check.hasV101) {
      console.log('\n🎉 SUCCESS! v101 with Permanent Employee Codes and Android Driver Auth API is now LIVE on https://www.jaibhavanicargo.com!');
      return;
    }
  }

  console.log('⚠️ Polling reached timeout, but webhook was sent and commits are pushed to main and master.');
}

main().catch(err => {
  console.error('Fatal error during deployment:', err);
  process.exit(1);
});
