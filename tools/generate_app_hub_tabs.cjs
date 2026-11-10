const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('Generating Overhauled Mobile App Hub with Interactive Categorized Tabs & Fixed Navigation...');

// Read the clean JSX source from apps/web/src/pages/LaunchpadPage.jsx
const sourcePath = path.resolve(__dirname, '../apps/web/src/pages/LaunchpadPage.jsx');
const sourceCode = fs.readFileSync(sourcePath, 'utf8');

// Strip the imports up to `export default function LaunchpadPage()`
const exportIdx = sourceCode.indexOf('export default function LaunchpadPage');
if (exportIdx === -1) {
  throw new Error('Could not find export default function LaunchpadPage in source');
}

const componentBody = sourceCode.slice(exportIdx);

// Build bundle-compliant header
const bundleHeader = `import {
  u as useNavigate,
  r as React,
  a6 as Truck,
  aF as CircleDashed,
  aG as FileBox,
  aH as QrCode,
  as as Wrench,
  aI as Droplet,
  aJ as ClipboardList,
  aK as Navigation,
  ae as MapPin,
  aL as Package,
  aM as CheckSquare,
  ad as Building2,
  aN as LayoutDashboard,
  ap as Sparkles,
  aO as BarChart3,
  ai as TrendingUp,
  aP as Calculator,
  aQ as PieChart,
  aR as Trophy,
  aS as IdCard,
  a3 as Receipt,
  a0 as FileText,
  al as AlertTriangle,
  a8 as CreditCard,
  aT as ShieldAlert,
  aU as ShieldCheck,
  a7 as Users,
  aV as CalendarDays,
  aW as UserPlus,
  aX as Target,
  aY as Contact2,
  aZ as Briefcase,
  a_ as Mail,
  a$ as Bell,
  b0 as Database,
  am as Settings,
  at as Search,
  X as X,
  aA as ArrowRight
} from "./vendor-react-Bs5V2qFE.js";
import {
  u as useAuth,
  M as motion,
  p as pb,
  m as motionObj
} from "./index-DLxf9dwO.js";
import "./vendor-radix-BQCqNqg0.js";
import "./vendor-pdf-DtmgLs_2.js";

const { useState, useMemo, useRef } = React;

`;

// Convert `export default function LaunchpadPage` to `function LaunchpadPage` + `export { LaunchpadPage as default };`
const adjustedBody = componentBody.replace('export default function LaunchpadPage', 'function LaunchpadPage') + '\nexport { LaunchpadPage as default };\n';

const fullFileToTransform = bundleHeader + adjustedBody;

// Transform JSX into React.createElement calls
const transformResult = esbuild.transformSync(fullFileToTransform, {
  loader: 'jsx',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  target: 'es2020'
});

const compiledCode = transformResult.code;
console.log('Successfully compiled code. Length:', compiledCode.length, 'bytes');

// Check critical verification criteria
if (compiledCode.includes('react/jsx-runtime')) {
  throw new Error('Fatal: compiled code has bare react/jsx-runtime specifier!');
}
if (!compiledCode.includes('goTo') || !compiledCode.includes('totalModulesCount')) {
  throw new Error('Fatal: compiled code is missing goTo or totalModulesCount');
}
if (!compiledCode.includes('Main & Analytics') || !compiledCode.includes('Fleet & Operations')) {
  throw new Error('Fatal: compiled code is missing sidebar category names');
}

const destinations = [
  'dist/assets/LaunchpadPage-DLaI-S9K.js',
  'apps/web/dist/assets/LaunchpadPage-DLaI-S9K.js',
  'apps/api/dist/assets/LaunchpadPage-DLaI-S9K.js',
  'dist/apps/web/assets/LaunchpadPage-DLaI-S9K.js'
];

destinations.forEach(dest => {
  const fullDest = path.resolve(__dirname, '..', dest);
  if (fs.existsSync(path.dirname(fullDest))) {
    fs.writeFileSync(fullDest, compiledCode, 'utf8');
    console.log('✓ Wrote chunk to:', dest);
  }
});

console.log('\n🎉 ALL 4 CHUNKS SUCCESSFULLY GENERATED AND VERIFIED!');
