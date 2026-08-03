const fs = require('fs');

const file = 'apps/web/src/pages/GstITCManagerPage.jsx';
const content = fs.readFileSync(file, 'utf8');

const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
const importedLucideIcons = lucideMatch 
  ? lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean)
  : [];

const jsxMatches = [...content.matchAll(/<([A-Z][A-Za-z0-9]+)[\s\/>]/g)].map(m => m[1]);
const uniqueTags = Array.from(new Set(jsxMatches));

const missing = [];
uniqueTags.forEach(tag => {
  const isDeclared = new RegExp(`(import|function|const|let|var|class)\\s+.*\\b${tag}\\b`).test(content);
  if (!isDeclared) {
    missing.push(tag);
  }
});

console.log('MISSING IN GstITCManagerPage.jsx:', missing);
