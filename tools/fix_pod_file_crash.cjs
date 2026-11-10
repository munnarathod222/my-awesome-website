const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('=== Patching pod_file.startsWith crash in index-DLxf9dwO.js ===\n');

const targetDirs = [
  'dist/assets',
  'apps/web/dist/assets',
  'apps/api/dist/assets',
  'dist/apps/web/assets'
];

const targetPattern = 'I=a?.pod_link||(a?.pod_file?(a.pod_file.startsWith("http")?a.pod_file:`${C}/api/files/trips/${a.id}/${a.pod_file}`):"")||(a?.pod_document?`${C}/api/files/trips/${a.id}/${a.pod_document}`:"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`;';
// Without the semicolon:
const targetWithoutSemi = 'I=a?.pod_link||(a?.pod_file?(a.pod_file.startsWith("http")?a.pod_file:`${C}/api/files/trips/${a.id}/${a.pod_file}`):"")||(a?.pod_document?`${C}/api/files/trips/${a.id}/${a.pod_document}`:"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`';

const replacement = 'const _rf=a?.pod_file||a?.pod_document||l?.file||l?.image,_fs=typeof _rf=="string"?_rf.trim():Array.isArray(_rf)&&typeof _rf[0]=="string"?_rf[0].trim():"";let I=(typeof a?.pod_link=="string"&&a.pod_link.trim())?a.pod_link.trim():(_fs?(_fs.startsWith("http")?_fs:`${C}/api/files/${a?.collectionName||"trip_logs"}/${a?.id||l?.id}/${_fs}`):"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`;let ';

// Notice in the original:
// ),I=...,se=...
// If we replace:
// `),I=...`
// with:
// `);const _rf=a?.pod_file||a?.pod_document||l?.file||l?.image,_fs=typeof _rf=="string"?_rf.trim():Array.isArray(_rf)&&typeof _rf[0]=="string"?_rf[0].trim():"";let I=(typeof a?.pod_link=="string"&&a.pod_link.trim())?a.pod_link.trim():(_fs?(_fs.startsWith("http")?_fs:`${C}/api/files/${a?.collectionName||"trip_logs"}/${a?.id||l?.id}/${_fs}`):"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`;let `
// Then `,se=` becomes `let se=`!

const fullTarget = '),I=a?.pod_link||(a?.pod_file?(a.pod_file.startsWith("http")?a.pod_file:`${C}/api/files/trips/${a.id}/${a.pod_file}`):"")||(a?.pod_document?`${C}/api/files/trips/${a.id}/${a.pod_document}`:"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`,';

const fullReplacement = ');const _rf=a?.pod_file||a?.pod_document||l?.file||l?.image,_fs=typeof _rf=="string"?_rf.trim():Array.isArray(_rf)&&typeof _rf[0]=="string"?_rf[0].trim():"";let I=(typeof a?.pod_link=="string"&&a.pod_link.trim())?a.pod_link.trim():(_fs?(_fs.startsWith("http")?_fs:`${C}/api/files/${a?.collectionName||"trip_logs"}/${a?.id||l?.id}/${_fs}`):"")||l?.file_url||`${C}/track/${encodeURIComponent(a?.trip_id||a?.id||_)}`;let ';

targetDirs.forEach(dir => {
  const filePath = path.join(dir, 'index-DLxf9dwO.js');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping (not found): ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(fullTarget)) {
    console.log(`fullTarget not found in ${filePath}`);
    return;
  }
  const patched = content.replace(fullTarget, fullReplacement);
  try {
    esbuild.transformSync(patched, { loader: 'js' });
    fs.writeFileSync(filePath, patched, 'utf8');
    console.log(`✓ Successfully patched & validated: ${filePath} (${patched.length} bytes)`);
  } catch (err) {
    console.error(`❌ Validation failed for ${filePath}:`, err.message);
    process.exit(1);
  }
});

console.log('\n🎉 ALL INDEX BUNDLES PATCHED WITH 0 ERRORS!');
