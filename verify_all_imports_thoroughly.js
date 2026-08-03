const fs = require('fs');
const path = require('path');

function checkFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract lucide-react imports if any
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  const importedLucideIcons = lucideMatch 
    ? lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Find icons used as object properties like icon: IconName
  const iconPropertyMatches = [...content.matchAll(/icon:\s*([A-Z][A-Za-z0-9]+)/g)].map(m => m[1]);
  
  // Find icons used in JSX like <IconName
  const jsxMatches = [...content.matchAll(/<([A-Z][A-Za-z0-9]+)[\s\/>]/g)].map(m => m[1]);

  const allUsedIcons = Array.from(new Set([...iconPropertyMatches, ...jsxMatches]));

  const missing = [];
  allUsedIcons.forEach(icon => {
    // Exclude standard React / internal components
    if (['Link', 'Route', 'Routes', 'Navigate', 'BrowserRouter', 'Helmet', 'AppLayout', 'ErrorBoundary', 'Toaster', 'ScrollToTop', 'ProtectedRoute', 'SessionWrapper', 'AuthProvider', 'LanguageProvider'].includes(icon)) return;
    
    // Check if defined in file or imported
    const isDeclared = new RegExp(`(import|function|const|let|var|class)\\s+.*\\b${icon}\\b`).test(content);
    if (!isDeclared) {
      missing.push(icon);
    }
  });

  if (missing.length > 0) {
    console.log(`❌ FILE: ${filePath}`);
    console.log(`   MISSING SYMBOLS: ${missing.join(', ')}\n`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      checkFileImports(fullPath);
    }
  }
}

scanDir(path.join(__dirname, 'apps', 'web', 'src'));
