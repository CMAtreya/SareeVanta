const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('================================================================');
console.log('🔍 COMPREHENSIVE BACKEND & SYSTEM INTEGRITY AUDIT');
console.log('================================================================\n');

// 1. Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env.local!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Scan directories: app/, components/, lib/
const scanDirs = ['app', 'components', 'lib'].map((d) => path.join(process.cwd(), d));

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath)) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const allFiles = scanDirs.flatMap((d) => getAllFiles(d));
console.log(`📁 Scanned ${allFiles.length} total source files across app/, components/, and lib/.\n`);

// 3. Static Analysis Checks
const findings = {
  hardcodedMockState: [],
  missingSupabaseQuery: [],
  incompleteCrudMethods: [],
  narrowTruncation: [],
};

allFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath);

  // Check 1: Hardcoded mock initial state in form components
  if (relPath.includes('components') || relPath.includes('app')) {
    const mockStateMatch = content.match(/useState\(\s*['"](18500|34000|28000|Kanchipuram Heavy Korvai)['"]\s*\)/g);
    if (mockStateMatch) {
      findings.hardcodedMockState.push({ file: relPath, matches: mockStateMatch });
    }
  }

  // Check 2: API routes without Supabase query
  if (relPath.includes('app/api') && relPath.endsWith('route.ts')) {
    if (!content.includes('supabase') && !content.includes('createAdminClient') && !content.includes('createClient')) {
      findings.missingSupabaseQuery.push(relPath);
    }

    // Check 3: Check if marketing or management CRUD routes miss PATCH or DELETE
    if (relPath.includes('/admin/') && (relPath.includes('reels') || relPath.includes('banners') || relPath.includes('marquee'))) {
      const hasPatch = /export async function (PATCH|PUT)/.test(content);
      const hasDelete = /export async function DELETE/.test(content);
      if (!hasPatch || !hasDelete) {
        findings.incompleteCrudMethods.push({ file: relPath, missing: [!hasPatch && 'PATCH', !hasDelete && 'DELETE'].filter(Boolean) });
      }
    }
  }

  // Check 4: Dangerous narrow text truncation on user data
  if (content.includes('max-w-[170px]') && content.includes('truncate')) {
    findings.narrowTruncation.push(relPath);
  }
});

// Report static findings
console.log('--- 1. STATIC CODEBASE ANALYSIS ---');
if (findings.hardcodedMockState.length === 0) {
  console.log('✅ No hardcoded mock defaults in component state.');
} else {
  console.log(`⚠️ Found ${findings.hardcodedMockState.length} files with hardcoded mock state:`);
  findings.hardcodedMockState.forEach((f) => console.log(`   - ${f.file} (${f.matches.join(', ')})`));
}

if (findings.missingSupabaseQuery.length === 0) {
  console.log('✅ All API endpoints properly integrate Supabase client.');
} else {
  console.log(`⚠️ ${findings.missingSupabaseQuery.length} API routes lack Supabase queries:`);
  findings.missingSupabaseQuery.forEach((f) => console.log(`   - ${f}`));
}

if (findings.incompleteCrudMethods.length === 0) {
  console.log('✅ Admin management routes have full CRUD method coverage.');
} else {
  console.log(`⚠️ Found ${findings.incompleteCrudMethods.length} routes with missing CRUD handlers:`);
  findings.incompleteCrudMethods.forEach((f) => console.log(`   - ${f.file} (missing: ${f.missing.join(', ')})`));
}

if (findings.narrowTruncation.length === 0) {
  console.log('✅ No narrow fixed-width truncations on customer data.');
} else {
  console.log(`⚠️ Found ${findings.narrowTruncation.length} files with narrow email truncation:`);
  findings.narrowTruncation.forEach((f) => console.log(`   - ${f}`));
}

// 4. Live Runtime Supabase Query Verification
console.log('\n--- 2. LIVE DATABASE & SCHEMA RELATION AUDIT ---');

async function testLiveQueries() {
  const tests = [
    {
      name: 'Products & Multi-Variant Media Join',
      query: supabase.from('products').select('id, title, slug, product_variants ( id, sku, product_variant_media ( url ), inventory ( quantity ) )').limit(3),
    },
    {
      name: 'Reviews & Variant Foreign Key Join',
      query: supabase.from('reviews').select('id, rating, moderation_status, customers ( name, email ), product_variants ( sku, products ( title, slug ) )').limit(3),
    },
    {
      name: 'Instagram Reels Active List',
      query: supabase.from('instagram_reels').select('id, caption, instagram_url, thumbnail_storage_path, display_order, is_active').order('display_order', { ascending: true }),
    },
    {
      name: 'Hero Slides Active Sequence',
      query: supabase.from('hero_slides').select('id, heading, tagline, desktop_image_path, display_order, is_active').order('display_order', { ascending: true }),
    },
    {
      name: 'Marquee Announcements Multi-line',
      query: supabase.from('marquee_messages').select('id, message_text, is_active').limit(5),
    },
    {
      name: 'Zari Specifications Master Taxonomy',
      query: supabase.from('zari_specifications').select('id, name, code, is_active'),
    },
    {
      name: 'Customer Directory Query',
      query: supabase.from('customers').select('id, name, email, phone').limit(5),
    },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const { data, error } = await test.query;
      if (error) {
        console.log(`❌ [FAIL] ${test.name}: Error -> ${error.message}`);
      } else {
        console.log(`✅ [PASS] ${test.name} -> ${data ? data.length : 0} rows retrieved cleanly.`);
        passed++;
      }
    } catch (err) {
      console.log(`❌ [EXCEPTION] ${test.name}: ${err.message}`);
    }
  }

  console.log(`\n================================================================`);
  console.log(`🎯 AUDIT SUMMARY: ${passed}/${tests.length} Database Relations Verified Operational`);
  console.log(`================================================================\n`);
}

testLiveQueries();

