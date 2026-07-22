import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';
import get from 'simple-get';
import { PassThrough } from 'stream';

const dir = path.resolve(process.cwd(), '.');

const customHttp = {
  async request({ url, method, headers, body, onProgress }) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        method: method || 'GET',
        url,
        headers: headers || {},
      };
      if (body) {
        const chunks = [];
        body.on('data', chunk => chunks.push(chunk));
        body.on('end', () => {
          options.body = Buffer.concat(chunks);
          makeRequest();
        });
        body.on('error', reject);
      } else {
        makeRequest();
      }
      function makeRequest() {
        get.concat(options, (err, res, data) => {
          if (err) return reject(err);
          const passThrough = new PassThrough();
          passThrough.end(data);
          resolve({
            url: res.url || url,
            method,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body: passThrough,
            headers: res.headers,
          });
        });
      }
    });
  }
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || (() => {
  try { return fs.readFileSync(path.join(process.env.APPDATA || '', '../Roaming/github_token.txt'), 'utf8').trim(); } catch { return ''; }
})();

async function getToken() {
  if (GITHUB_TOKEN) return GITHUB_TOKEN;
  try {
    const netrcPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.netrc');
    const content = fs.readFileSync(netrcPath, 'utf8');
    const match = content.match(/machine github\.com\s+login\s+\S+\s+password\s+(\S+)/);
    if (match) return match[1];
  } catch {}
  try {
    const confPath = path.join(process.env.APPDATA || process.env.HOME || '', '.config/gh/hosts.yml');
    const content = fs.readFileSync(confPath, 'utf8');
    const match = content.match(/oauth_token:\s*(\S+)/);
    if (match) return match[1];
  } catch {}
  return '';
}

async function main() {
  const token = await getToken();
  if (!token) { console.error('No GitHub token found'); process.exit(1); }

  const author = { name: 'Jai Bhavani Cargo', email: 'admin@jaibhavanicargo.com' };

  console.log('Staging all changes...');
  await git.add({ fs, dir, filepath: '.' });

  const status = await git.statusMatrix({ fs, dir });
  const changed = status.filter(([, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1));
  console.log(`Changed files: ${changed.length}`);
  if (changed.length === 0) { console.log('Nothing to commit.'); return; }

  const sha = await git.commit({ fs, dir, message: 'feat: upgrade Analytics Hub — 8 rich KPI cards with sparklines, driver leaderboard, route intelligence, business insights panel, upgraded shipments tab', author });
  console.log('Committed:', sha);

  console.log('Pushing to GitHub...');
  await git.push({
    fs, http: customHttp, dir,
    remote: 'origin', ref: 'main',
    onAuth: () => ({ username: token, password: token }),
    force: false,
  });
  console.log('Push successful!');
}

main().catch(e => { console.error(e); process.exit(1); });
