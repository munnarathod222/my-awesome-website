const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname);
const GH_TOKEN = process.env.GH_TOKEN;

if (!GH_TOKEN) {
  console.error('Set GH_TOKEN env var');
  process.exit(1);
}

async function main() {
  try {
    const status = await git.statusMatrix({ fs, dir });
    
    for (const [filepath, head, workdir, stage] of status) {
      if (workdir === 0) {
        await git.remove({ fs, dir, filepath });
        console.log('Removed:', filepath);
      } else if (workdir !== 1 || stage !== 1) {
        await git.add({ fs, dir, filepath });
      }
    }

    const sha = await git.commit({
      fs, dir,
      message: 'fix: show front and back page in document preview modal',
      author: { name: 'Munna Rathod', email: 'munnarathod222@gmail.com' }
    });
    console.log('Committed:', sha);

    console.log('Pushing...');
    const result = await git.push({
      fs, dir, http,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: 'oauth2', password: GH_TOKEN }),
      onProgress: (p) => process.stdout.write(`\r${p.phase} ${p.loaded || ''}/${p.total || ''}   `)
    });
    console.log('\nResult:', JSON.stringify(result?.refs));
    console.log('✅ Deployed!');
  } catch (err) {
    console.error('\nError:', err.message || err);
  }
}

main();
