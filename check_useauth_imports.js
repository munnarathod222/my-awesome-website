const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'apps/web/src'));
const missingAuth = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('useAuth(') && !content.includes('import') && !content.includes('useAuth')) {
    missingAuth.push(f);
  } else if (content.includes('useAuth(') && !content.includes('useAuth') ) {
    missingAuth.push(f);
  } else if (content.includes('useAuth(')) {
    // check if imported
    const hasImport = content.includes("import { useAuth }") || content.includes("import {useAuth}") || content.includes("import { useAuth,") || content.includes(", useAuth }") || content.includes(", useAuth,");
    if (!hasImport) {
      missingAuth.push(f);
    }
  }
});

console.log('Files missing useAuth import:', missingAuth);
