const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchAllFiles(fullPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Find all uppercase JSX components used like <IconName ...
      const jsxTags = [...content.matchAll(/<([A-Z][A-Za-z0-9]+)[\s\/>]/g)].map(m => m[1]);
      const uniqueTags = Array.from(new Set(jsxTags));

      // Filter out standard React primitives or UI components imported from ui/
      const ignoreList = ['Routes', 'Route', 'Navigate', 'Link', 'BrowserRouter', 'Helmet', 'AuthProvider', 'LanguageProvider', 'AppLayout', 'ErrorBoundary', 'Toaster', 'ScrollToTop', 'ProtectedRoute', 'SessionWrapper'];

      uniqueTags.forEach(tag => {
        if (ignoreList.includes(tag)) return;

        // Check if tag is declared or imported in content
        const isImported = content.includes(tag);
        const hasImportDecl = new RegExp(`\\b${tag}\\b`).test(content);
        
        // Check specifically if <Tag is used but Tag is not in import statements or function declarations
        const declRegex = new RegExp(`(import|function|const|let|var|class)\\s+.*\\b${tag}\\b`);
        if (!declRegex.test(content)) {
          console.log(`❌ MISSING DECLARATION/IMPORT FOR <${tag}> IN: ${fullPath}`);
        }
      });
    }
  }
}

searchAllFiles(path.join(__dirname, 'apps', 'web', 'src'));
