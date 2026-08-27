const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function scanDirectory(dir, filterFn) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') return;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(filePath, filterFn));
    } else {
      if (filterFn(filePath)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

console.log('================================================================');
console.log('=== COMPREHENSIVE FORENSIC CODEBASE & ARCHITECTURE AUDIT ===');
console.log('================================================================\n');

// 1. Audit API Routes for Supabase vs Mock Data
const apiFiles = scanDirectory(path.join(rootDir, 'app', 'api'), (p) => p.endsWith('route.ts') || p.endsWith('route.js'));

console.log(`[1] API ROUTES ANALYSIS (${apiFiles.length} Endpoints Found):`);
let pureDbRoutes = 0;
let mockFallbackRoutes = 0;
let staticOnlyRoutes = 0;

apiFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);
  const usesSupabase = content.includes('supabase') || content.includes('createAdminClient') || content.includes('createClient');
  const hasMockOrFallback = content.includes('MOCK_') || content.includes('fallback') || content.includes('sample') || content.includes('placeholder');
  
  if (usesSupabase && !hasMockOrFallback) {
    pureDbRoutes++;
    console.log(`  🟢 Pure DB: ${relPath}`);
  } else if (usesSupabase && hasMockOrFallback) {
    mockFallbackRoutes++;
    console.log(`  🟡 DB + Static Fallback: ${relPath}`);
  } else {
    staticOnlyRoutes++;
    console.log(`  🔴 Static/Mock Only: ${relPath}`);
  }
});

console.log(`\nAPI Summary: ${pureDbRoutes} Pure DB | ${mockFallbackRoutes} DB + Fallback | ${staticOnlyRoutes} Static/Mock\n`);

// 2. Audit Client Components & Pages for Hardcoded Static Data
const frontendFiles = scanDirectory(rootDir, (p) => 
  (p.includes('\\app\\') || p.includes('\\components\\')) && 
  (p.endsWith('.tsx') || p.endsWith('.ts')) &&
  !p.includes('\\app\\api\\')
);

console.log(`[2] FRONTEND COMPONENTS & PAGES AUDIT (${frontendFiles.length} Files):`);
const mockVariables = [];

frontendFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);
  const matches = content.match(/const\s+(MOCK_[A-Z0-9_]+|DEFAULT_[A-Z0-9_]+|SAMPLE_[A-Z0-9_]+)\s*=/g);
  if (matches) {
    mockVariables.push({ file: relPath, matches });
    console.log(`  ⚠️ Mock Data Constant Found in: ${relPath}`);
    matches.forEach(m => console.log(`      -> ${m}`));
  }
});

console.log(`\nMock Data Constants Total: ${mockVariables.length} files affected.\n`);
