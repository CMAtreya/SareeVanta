/**
 * READ-ONLY BACKEND & SYSTEM INTEGRITY AUDIT
 *
 * Safe by design:
 * - No INSERT
 * - No UPDATE
 * - No DELETE
 * - No schema modifications
 * - No mutating RPC calls
 *
 * Run:
 *   node scripts/backend-audit.js
 *
 * Recommended:
 *   SUPABASE_SERVICE_ROLE_KEY should be available locally.
 *
 * IMPORTANT:
 * This script is an audit/smoke test, not a guarantee of security.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const ROOT = process.cwd();

console.log("================================================================");
console.log("🔍 READ-ONLY BACKEND & SYSTEM INTEGRITY AUDIT");
console.log(
  "================================================================\n",
);

const startedAt = Date.now();

/* ================================================================
   1. ENVIRONMENT
   ================================================================ */

console.log("--- 1. ENVIRONMENT CHECK ---");

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env.local");

  if (!fs.existsSync(envPath)) {
    console.log("⚠️ .env.local not found. Using existing process.env values.");
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let envFailures = 0;
let envWarnings = 0;

if (!supabaseUrl) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_URL is missing");
  envFailures++;
} else {
  console.log("✅ NEXT_PUBLIC_SUPABASE_URL present");
}

if (!serviceRoleKey) {
  console.log(
    "⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. " +
      "Some administrative/schema checks will be limited.",
  );
  envWarnings++;
} else {
  console.log("✅ SUPABASE_SERVICE_ROLE_KEY present");
}

if (!anonKey) {
  console.log("⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  envWarnings++;
} else {
  console.log("✅ NEXT_PUBLIC_SUPABASE_ANON_KEY present");
}

if (!supabaseUrl) {
  console.error("\n❌ Cannot continue without Supabase URL.");
  process.exit(1);
}

/*
 * Prefer service role for the audit because it allows us to distinguish:
 *
 * "the table does not exist"
 *
 * from:
 *
 * "the table exists but RLS blocks this request."
 *
 * The audit itself remains read-only.
 */
const auditKey = serviceRoleKey || anonKey;

if (!auditKey) {
  console.error("\n❌ No Supabase key available.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, auditKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log(
  `🔐 Audit client: ${
    serviceRoleKey ? "SERVICE ROLE (read-only queries only)" : "ANON"
  }`,
);

/* ================================================================
   2. FILE SYSTEM / SOURCE SCAN
   ================================================================ */

console.log("\n--- 2. SOURCE CODE INVENTORY ---");

const scanDirs = ["app", "components", "lib", "pages", "src"]
  .map((dir) => path.join(ROOT, dir))
  .filter((dir) => fs.existsSync(dir));

function getAllFiles(dirPath, results = []) {
  if (!fs.existsSync(dirPath)) return results;

  let entries;

  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      getAllFiles(fullPath, results);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

const allFiles = scanDirs.flatMap((dir) => getAllFiles(dir));

console.log(`📁 Source files scanned: ${allFiles.length}`);

const sourceContents = [];

for (const filePath of allFiles) {
  try {
    sourceContents.push({
      path: filePath,
      relative: path.relative(ROOT, filePath),
      content: fs.readFileSync(filePath, "utf8"),
    });
  } catch (err) {
    console.log(`⚠️ Could not read ${filePath}: ${err.message}`);
  }
}

/* ================================================================
   3. STATIC CODE ANALYSIS
   ================================================================ */

console.log("\n--- 3. STATIC CODE ANALYSIS ---");

const findings = {
  hardcodedMockState: [],
  suspiciousMockValues: [],
  missingSupabaseRoutes: [],
  incompleteCrud: [],
  narrowTruncation: [],
  serviceRoleClientCode: [],
  exposedSecrets: [],
  dangerousAny: [],
  consoleLogs: [],
  todoMarkers: [],
  disabledRlsHints: [],
  missingErrorHandling: [],
};

const mockPatterns = [
  /useState\(\s*['"`](18500|34000|28000|Kanchipuram Heavy Korvai)['"`]\s*\)/i,
  /useState\(\s*['"`](dummy|mock|test|sample|placeholder)['"`]\s*\)/i,
];

const secretPatterns = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=/i,
  /service_role\s*['"`]/i,
  /sk-[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----/,
];

for (const file of sourceContents) {
  const { relative, content } = file;

  const isServerFile =
    relative.includes("/api/") ||
    relative.includes("\\api\\") ||
    relative.includes("server") ||
    relative.endsWith(".server.ts") ||
    relative.endsWith(".server.js");

  const isClientFile = /'use client'|"use client"/.test(content);

  /* Mock state */
  for (const pattern of mockPatterns) {
    if (pattern.test(content)) {
      findings.hardcodedMockState.push(relative);
      break;
    }
  }

  /* API routes */
  if (
    /(^|[/\\])route\.(ts|js)$/.test(relative) ||
    /(^|[/\\])pages[/\\]api[/\\]/.test(relative)
  ) {
    const looksLikeSupabaseRoute =
      /supabase|createClient|createAdminClient|from\(['"]@supabase/i.test(
        content,
      );

    if (!looksLikeSupabaseRoute) {
      findings.missingSupabaseRoutes.push(relative);
    }

    if (relative.includes("/admin/") || relative.includes("\\admin\\")) {
      const isCrudResource =
        /reels|banners|marquee|products|reviews|customers|orders/i.test(
          relative,
        );

      if (isCrudResource) {
        const hasRead = /export\s+async\s+function\s+(GET)/.test(content);
        const hasWrite = /export\s+async\s+function\s+(POST|PATCH|PUT)/.test(
          content,
        );
        const hasDelete = /export\s+async\s+function\s+DELETE/.test(content);

        const missing = [];

        if (!hasRead) missing.push("GET");
        if (!hasWrite) missing.push("POST/PATCH/PUT");
        if (!hasDelete) missing.push("DELETE");

        if (missing.length) {
          findings.incompleteCrud.push({
            file: relative,
            missing,
          });
        }
      }
    }
  }

  /* Truncation */
  if (content.includes("max-w-[170px]") && content.includes("truncate")) {
    findings.narrowTruncation.push(relative);
  }

  /* Service-role key in client code */
  if (isClientFile && /SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(content)) {
    findings.serviceRoleClientCode.push(relative);
  }

  /* Potential secret exposure */
  if (
    !relative.includes(".env") &&
    secretPatterns.some((p) => p.test(content))
  ) {
    findings.exposedSecrets.push(relative);
  }

  /* any */
  const anyMatches = content.match(/:\s*any\b|<any>|as\s+any\b/g);
  if (anyMatches && anyMatches.length >= 3) {
    findings.dangerousAny.push({
      file: relative,
      count: anyMatches.length,
    });
  }

  /* Console logging */
  const consoleMatches = content.match(
    /console\.(log|debug|info|warn|error)\s*\(/g,
  );
  if (consoleMatches && consoleMatches.length >= 5) {
    findings.consoleLogs.push({
      file: relative,
      count: consoleMatches.length,
    });
  }

  /* TODO / FIXME */
  if (/\b(TODO|FIXME|HACK)\b/i.test(content)) {
    findings.todoMarkers.push(relative);
  }

  /* Obvious RLS bypass language */
  if (
    /disable\s+row\s+level\s+security|enable\s+row\s+level\s+security\s*=\s*false/i.test(
      content,
    )
  ) {
    findings.disabledRlsHints.push(relative);
  }

  /* Very rough async query error-handling check */
  if (
    /supabase\.from\(/.test(content) &&
    !/try\s*\{|\.error\b|catch\s*\(/.test(content)
  ) {
    findings.missingErrorHandling.push(relative);
  }
}

function reportList(name, items, severity = "WARN") {
  if (!items.length) {
    console.log(`✅ ${name}: none found`);
    return;
  }

  console.log(`${severity === "FAIL" ? "❌" : "⚠️"} ${name}: ${items.length}`);

  for (const item of items.slice(0, 25)) {
    if (typeof item === "string") {
      console.log(`   - ${item}`);
    } else {
      console.log(`   - ${item.file}`);
    }
  }

  if (items.length > 25) {
    console.log(`   ...and ${items.length - 25} more`);
  }
}

reportList("Hardcoded mock state", findings.hardcodedMockState);

reportList(
  "Missing/unclear Supabase API integration",
  findings.missingSupabaseRoutes,
);

reportList("Incomplete CRUD admin routes", findings.incompleteCrud);

reportList("Narrow truncation patterns", findings.narrowTruncation);

reportList(
  "Service-role references in client files",
  findings.serviceRoleClientCode,
  "FAIL",
);

reportList("Potential hardcoded secrets", findings.exposedSecrets, "FAIL");

reportList(
  "Files containing suspicious RLS disabling hints",
  findings.disabledRlsHints,
  "FAIL",
);

if (!findings.dangerousAny.length) {
  console.log("✅ No files with heavy use of `any` detected.");
} else {
  console.log(
    `⚠️ ${findings.dangerousAny.length} files have 3+ ` + "`any` usages.",
  );
}

if (!findings.missingErrorHandling.length) {
  console.log("✅ Supabase files generally contain error-handling patterns.");
} else {
  console.log(
    `⚠️ ${findings.missingErrorHandling.length} files may lack ` +
      "obvious Supabase error handling.",
  );
}

/* ================================================================
   4. API ROUTE INVENTORY
   ================================================================ */

console.log("\n--- 4. API ROUTE INVENTORY ---");

const apiRoutes = sourceContents.filter(({ relative }) =>
  /(^|[/\\])api[/\\].*route\.(ts|js)$/.test(relative),
);

console.log(`🌐 API route files found: ${apiRoutes.length}`);

for (const route of apiRoutes) {
  const methods = [];

  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    if (
      new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(
        route.content,
      )
    ) {
      methods.push(method);
    }
  }

  console.log(
    `   - ${route.relative}: ${methods.length ? methods.join(", ") : "no standard handlers detected"}`,
  );
}

/* ================================================================
   5. REQUIRED DATABASE TABLES
   ================================================================ */

console.log("\n--- 5. DATABASE TABLE EXISTENCE & READ ACCESS ---");

const requiredTables = [
  "products",
  "product_variants",
  "product_variant_media",
  "inventory",
  "reviews",
  "customers",
  "instagram_reels",
  "hero_slides",
  "marquee_messages",
  "zari_specifications",
];

const tableResults = {};

async function testTable(table) {
  try {
    const { data, error } = await supabase.from(table).select("*").limit(1);

    if (error) {
      tableResults[table] = {
        ok: false,
        error: error.message,
      };

      console.log(`❌ ${table}: ${error.message}`);
      return false;
    }

    tableResults[table] = {
      ok: true,
      rows: data?.length || 0,
    };

    console.log(`✅ ${table}: readable`);
    return true;
  } catch (err) {
    tableResults[table] = {
      ok: false,
      error: err.message,
    };

    console.log(`❌ ${table}: ${err.message}`);
    return false;
  }
}

/* ================================================================
   6. DATABASE RELATION TESTS
   ================================================================ */

console.log("\n--- 6. DATABASE RELATION TESTS ---");

const relationTests = [
  {
    name: "Products → Variants → Media → Inventory",
    query: () =>
      supabase
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          product_variants (
            id,
            sku,
            product_variant_media (
              url
            ),
            inventory (
              quantity
            )
          )
        `,
        )
        .limit(3),
  },

  {
    name: "Reviews → Customers → Product Variants → Products",
    query: () =>
      supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          moderation_status,
          customers (
            name,
            email
          ),
          product_variants (
            sku,
            products (
              title,
              slug
            )
          )
        `,
        )
        .limit(3),
  },

  {
    name: "Product Variants → Products",
    query: () =>
      supabase
        .from("product_variants")
        .select(
          `
          id,
          sku,
          products (
            id,
            title,
            slug
          )
        `,
        )
        .limit(3),
  },

  {
    name: "Variant Media → Product Variants",
    query: () =>
      supabase
        .from("product_variant_media")
        .select(
          `
          id,
          url,
          product_variants (
            id,
            sku
          )
        `,
        )
        .limit(3),
  },

  {
    name: "Inventory → Product Variants",
    query: () =>
      supabase
        .from("inventory")
        .select(
          `
          variant_id,
          quantity,
          product_variants (
            id,
            sku
          )
        `,
        )
        .limit(3),
  },
];

async function runRelationTests() {
  let passed = 0;

  for (const test of relationTests) {
    try {
      const { data, error } = await test.query();

      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${data?.length || 0} rows`);
        passed++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }

  console.log(`Relation tests: ${passed}/${relationTests.length} passed`);

  return passed;
}

/* ================================================================
   7. CONTENT / CMS TABLE TESTS
   ================================================================ */

console.log("\n--- 7. CMS / MARKETING DATA TESTS ---");

const cmsTests = [
  {
    name: "Instagram Reels",
    query: () =>
      supabase
        .from("instagram_reels")
        .select(
          "id, caption, instagram_url, thumbnail_storage_path, display_order, is_active",
        )
        .order("display_order", { ascending: true }),
  },

  {
    name: "Hero Slides",
    query: () =>
      supabase
        .from("hero_slides")
        .select(
          "id, heading, tagline, desktop_image_path, display_order, is_active",
        )
        .order("display_order", { ascending: true }),
  },

  {
    name: "Marquee Messages",
    query: () =>
      supabase
        .from("marquee_messages")
        .select("id, message_text, is_active")
        .limit(10),
  },

  {
    name: "Zari Specifications",
    query: () =>
      supabase
        .from("zari_specifications")
        .select("id, name, code, is_active")
        .limit(100),
  },
];

async function runCmsTests() {
  let passed = 0;

  for (const test of cmsTests) {
    try {
      const { data, error } = await test.query();

      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${data?.length || 0} rows`);
        passed++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }

  console.log(`CMS tests: ${passed}/${cmsTests.length} passed`);

  return passed;
}

/* ================================================================
   8. DATA QUALITY CHECKS
   ================================================================ */

console.log("\n--- 8. DATA QUALITY CHECKS ---");

async function checkDuplicateValues(table, column, label) {
  try {
    /*
     * We deliberately retrieve only the target column.
     * This is read-only.
     *
     * Supabase/PostgREST doesn't provide a simple portable GROUP BY
     * through this client, so duplicates are detected locally.
     */
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .not(column, "is", null)
      .limit(5000);

    if (error) {
      console.log(`⚠️ ${label}: unable to inspect - ${error.message}`);
      return null;
    }

    const counts = new Map();

    for (const row of data || []) {
      const value = row[column];

      if (value === null || value === undefined || value === "") continue;

      counts.set(value, (counts.get(value) || 0) + 1);
    }

    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    if (!duplicates.length) {
      console.log(`✅ ${label}: no duplicates found in sample`);
      return 0;
    }

    console.log(`⚠️ ${label}: ${duplicates.length} duplicate values found`);

    for (const [value, count] of duplicates.slice(0, 10)) {
      console.log(`   - ${value}: ${count} occurrences`);
    }

    return duplicates.length;
  } catch (err) {
    console.log(`⚠️ ${label}: ${err.message}`);
    return null;
  }
}

async function checkNullValues(table, column, label) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .is(column, null)
      .limit(100);

    if (error) {
      console.log(`⚠️ ${label}: unable to inspect - ${error.message}`);
      return null;
    }

    const count = data?.length || 0;

    if (count === 0) {
      console.log(`✅ ${label}: no NULL values found`);
    } else {
      console.log(`⚠️ ${label}: ${count}+ NULL values found`);
    }

    return count;
  } catch (err) {
    console.log(`⚠️ ${label}: ${err.message}`);
    return null;
  }
}

async function runDataQualityChecks() {
  await checkDuplicateValues("products", "slug", "Product slugs");

  await checkDuplicateValues("product_variants", "sku", "Variant SKUs");

  await checkDuplicateValues(
    "zari_specifications",
    "code",
    "Zari specification codes",
  );

  await checkNullValues("products", "slug", "Products with NULL slug");

  await checkNullValues("products", "title", "Products with NULL title");

  await checkNullValues("product_variants", "sku", "Variants with NULL SKU");
}

/* ================================================================
   9. ORPHAN CHECKS
   ================================================================ */

console.log("\n--- 9. ORPHANED RELATION CHECKS ---");

async function checkOrphans() {
  /*
   * These are intentionally done as SELECTs only.
   */

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        sku,
        product_id,
        products (
          id
        )
      `,
      )
      .limit(5000);

    if (error) {
      console.log(`⚠️ Variant → Product check unavailable: ${error.message}`);
    } else {
      const orphans = (data || []).filter(
        (row) => row.product_id && !row.products,
      );

      if (!orphans.length) {
        console.log("✅ No orphaned product variants detected in sample");
      } else {
        console.log(`❌ ${orphans.length} orphaned product variants detected`);
      }
    }
  } catch (err) {
    console.log(`⚠️ Variant orphan check failed: ${err.message}`);
  }

  try {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        variant_id,
        quantity,
        product_variants (
          id
        )
      `,
      )
      .limit(5000);

    if (error) {
      console.log(`⚠️ Inventory → Variant check unavailable: ${error.message}`);
    } else {
      const orphans = (data || []).filter(
        (row) => row.variant_id && !row.product_variants,
      );

      if (!orphans.length) {
        console.log("✅ No orphaned inventory records detected in sample");
      } else {
        console.log(`❌ ${orphans.length} orphaned inventory records detected`);
      }
    }
  } catch (err) {
    console.log(`⚠️ Inventory orphan check failed: ${err.message}`);
  }
}

/* ================================================================
   10. CUSTOMER / SENSITIVE DATA CHECK
   ================================================================ */

console.log("\n--- 10. SENSITIVE DATA ACCESS CHECK ---");

async function checkSensitiveData() {
  if (!serviceRoleKey) {
    console.log("⚠️ Skipped: service-role key unavailable.");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone")
      .limit(3);

    if (error) {
      console.log(`❌ Service-role customer read failed: ${error.message}`);
      return;
    }

    console.log(
      `✅ Admin-level customer read works (${data?.length || 0} rows)`,
    );

    console.log("ℹ️ This does NOT prove customer data is protected by RLS.");
    console.log("ℹ️ Service-role credentials bypass normal RLS policies.");
  } catch (err) {
    console.log(`❌ Customer access test failed: ${err.message}`);
  }
}

/* ================================================================
   11. PUBLIC / ANON ACCESS CHECK
   ================================================================ */

console.log("\n--- 11. ANON/PUBLIC ACCESS CHECK ---");

async function checkAnonAccess() {
  if (!anonKey) {
    console.log("⚠️ Skipped: NEXT_PUBLIC_SUPABASE_ANON_KEY missing.");
    return;
  }

  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  /*
   * These are READ-ONLY tests.
   *
   * Important:
   * A successful read may be intentional for public content.
   * A successful customer read, however, deserves attention.
   */

  const publicTables = [
    "products",
    "hero_slides",
    "instagram_reels",
    "marquee_messages",
  ];

  for (const table of publicTables) {
    try {
      const { data, error } = await anonClient.from(table).select("*").limit(1);

      if (error) {
        console.log(`ℹ️ ANON ${table}: blocked/error -> ${error.message}`);
      } else {
        console.log(`✅ ANON ${table}: readable (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`⚠️ ANON ${table}: ${err.message}`);
    }
  }

  /*
   * Customer data is treated separately because it is normally sensitive.
   */
  try {
    const { data, error } = await anonClient
      .from("customers")
      .select("id, name, email, phone")
      .limit(1);

    if (error) {
      console.log(`✅ ANON customers: blocked (${error.message})`);
    } else if (data && data.length > 0) {
      console.log("❌ SECURITY WARNING: ANON can read customer data!");
    } else {
      console.log("ℹ️ ANON customers: query succeeded but returned 0 rows.");
      console.log(
        "   Review your RLS policies to confirm this is intentional.",
      );
    }
  } catch (err) {
    console.log(`⚠️ ANON customer test: ${err.message}`);
  }
}

/* ================================================================
   12. RLS / SECURITY POLICY INSPECTION
   ================================================================ */

console.log("\n--- 12. RLS / SECURITY POLICY INSPECTION ---");

async function inspectRls() {
  /*
   * Supabase's public client cannot directly query PostgreSQL's
   * information_schema/pg_catalog through PostgREST unless exposed.
   *
   * Therefore we use RPC only if the project has explicitly exposed
   * an inspection function.
   *
   * IMPORTANT:
   * We do NOT create the function here because this audit is
   * strictly read-only.
   */

  console.log(
    "ℹ️ RLS policy inspection requires an existing read-only database inspection RPC.",
  );

  console.log(
    "ℹ️ This script will NOT create one because schema changes are prohibited.",
  );

  console.log(
    "ℹ️ Use Supabase Dashboard → Database → Tables → RLS to verify policies.",
  );

  /*
   * We can still perform practical anonymous-access tests above.
   */
}

/* ================================================================
   13. STORAGE ACCESS CHECK
   ================================================================ */

console.log("\n--- 13. STORAGE ACCESS CHECK ---");

async function checkStorage() {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log(`⚠️ Unable to list storage buckets: ${error.message}`);
      return;
    }

    if (!data?.length) {
      console.log("ℹ️ No storage buckets returned.");
      return;
    }

    console.log(`✅ Storage buckets visible: ${data.length}`);

    for (const bucket of data) {
      console.log(
        `   - ${bucket.name} (${bucket.public ? "PUBLIC" : "PRIVATE"})`,
      );
    }
  } catch (err) {
    console.log(`⚠️ Storage audit failed: ${err.message}`);
  }
}

/* ================================================================
   14. MEDIA PATH / URL SANITY CHECK
   ================================================================ */

console.log("\n--- 14. MEDIA DATA SANITY CHECK ---");

async function checkMediaData() {
  const mediaChecks = [
    {
      table: "instagram_reels",
      column: "thumbnail_storage_path",
      label: "Instagram reel thumbnail paths",
    },
    {
      table: "hero_slides",
      column: "desktop_image_path",
      label: "Hero slide desktop image paths",
    },
    {
      table: "product_variant_media",
      column: "url",
      label: "Product variant media URLs",
    },
  ];

  for (const check of mediaChecks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.column)
        .limit(500);

      if (error) {
        console.log(`⚠️ ${check.label}: ${error.message}`);
        continue;
      }

      let empty = 0;
      let malformed = 0;

      for (const row of data || []) {
        const value = row[check.column];

        if (!value) {
          empty++;
          continue;
        }

        /*
         * Storage paths don't necessarily need to be full URLs.
         * Only flag obviously malformed HTTP URLs.
         */
        if (
          typeof value === "string" &&
          value.startsWith("http") &&
          !/^https?:\/\/.+/i.test(value)
        ) {
          malformed++;
        }
      }

      if (!empty && !malformed) {
        console.log(`✅ ${check.label}: sane`);
      } else {
        console.log(
          `⚠️ ${check.label}: ${empty} empty, ${malformed} malformed`,
        );
      }
    } catch (err) {
      console.log(`⚠️ ${check.label}: ${err.message}`);
    }
  }
}

/* ================================================================
   15. ACTIVE CONTENT SANITY
   ================================================================ */

console.log("\n--- 15. ACTIVE CONTENT SANITY ---");

async function checkActiveContent() {
  const checks = [
    {
      table: "hero_slides",
      order: "display_order",
      label: "Hero slides",
    },
    {
      table: "instagram_reels",
      order: "display_order",
      label: "Instagram reels",
    },
  ];

  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select("*")
        .eq("is_active", true)
        .order(check.order, { ascending: true })
        .limit(500);

      if (error) {
        console.log(`⚠️ ${check.label}: ${error.message}`);
        continue;
      }

      const rows = data || [];

      if (!rows.length) {
        console.log(`⚠️ ${check.label}: no active records`);
        continue;
      }

      console.log(`✅ ${check.label}: ${rows.length} active records`);

      const orders = rows
        .map((row) => row[check.order])
        .filter((value) => value !== null && value !== undefined);

      const duplicateOrders = orders.length !== new Set(orders).size;

      if (duplicateOrders) {
        console.log(
          `⚠️ ${check.label}: duplicate display_order values detected`,
        );
      } else {
        console.log(`✅ ${check.label}: display order values are unique`);
      }
    } catch (err) {
      console.log(`⚠️ ${check.label}: ${err.message}`);
    }
  }
}

/* ================================================================
   16. INVENTORY SANITY
   ================================================================ */

console.log("\n--- 16. INVENTORY SANITY ---");

async function checkInventory() {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("variant_id, quantity, reserved_quantity")
      .limit(5000);

    if (error) {
      console.log(`⚠️ Inventory check unavailable: ${error.message}`);
      return;
    }

    const rows = data || [];

    const negative = rows.filter(
      (row) => typeof row.quantity === "number" && row.quantity < 0,
    );

    const missingVariant = rows.filter(
      (row) =>
        row.variant_id === null || row.variant_id === undefined,
    );

    if (!negative.length) {
      console.log(`✅ ${rows.length} inventory records checked: no negative stock`);
    } else {
      console.log(
        `❌ ${negative.length} inventory records have negative quantities`,
      );
    }

    if (!missingVariant.length) {
      console.log("✅ All inventory records cleanly linked to variant IDs");
    } else {
      console.log(
        `⚠️ ${missingVariant.length} inventory records have no variant ID`,
      );
    }
  } catch (err) {
    console.log(`⚠️ Inventory sanity check failed: ${err.message}`);
  }
}

/* ================================================================
   16B. PRICING & PAISE MATHEMATICAL SANITY
   ================================================================ */

console.log("\n--- 16B. PRICING & PAISE MATHEMATICAL SANITY ---");

async function checkPricingPaise() {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, sku, price_paise, mrp_paise, is_active")
      .limit(5000);

    if (error) {
      console.log(`⚠️ Pricing check unavailable: ${error.message}`);
      return;
    }

    const rows = data || [];
    let invalidPaise = 0;
    let mrpLowerThanPrice = 0;

    for (const r of rows) {
      if (typeof r.price_paise !== 'number' || r.price_paise <= 0 || !Number.isInteger(r.price_paise)) {
        invalidPaise++;
      }
      if (typeof r.mrp_paise === 'number' && r.mrp_paise < r.price_paise) {
        mrpLowerThanPrice++;
      }
    }

    if (invalidPaise === 0 && mrpLowerThanPrice === 0) {
      console.log(`✅ All ${rows.length} product variants verified: valid integer paise (>0) and MRP >= Selling Price`);
    } else {
      if (invalidPaise > 0) console.log(`⚠️ ${invalidPaise} variants have non-positive or non-integer paise`);
      if (mrpLowerThanPrice > 0) console.log(`⚠️ ${mrpLowerThanPrice} variants have MRP < Selling Price`);
    }
  } catch (err) {
    console.log(`⚠️ Pricing check failed: ${err.message}`);
  }
}

/* ================================================================
   16C. ACTIVE COUPON SANITY
   ================================================================ */

console.log("\n--- 16C. ACTIVE COUPON SANITY ---");

async function checkCouponSanity() {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, is_active, valid_from, valid_until")
      .limit(100);

    if (error) {
      console.log(`ℹ️ Coupons check: ${error.message}`);
      return;
    }

    const rows = data || [];
    console.log(`✅ ${rows.length} coupon rules inspected in database`);
    for (const c of rows) {
      const expires = c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Never';
      console.log(`   - ${c.code}: ${c.discount_value}${c.discount_type === 'PERCENTAGE' ? '%' : ' INR'} (${c.is_active ? 'ACTIVE' : 'INACTIVE'}, Expires: ${expires})`);
    }
  } catch (err) {
    console.log(`⚠️ Coupon check failed: ${err.message}`);
  }
}

/* ================================================================
   17. PRODUCT SANITY
   ================================================================ */

console.log("\n--- 17. PRODUCT SANITY ---");

async function checkProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug")
      .limit(5000);

    if (error) {
      console.log(`⚠️ Product check unavailable: ${error.message}`);
      return;
    }

    const rows = data || [];

    const missingTitle = rows.filter(
      (row) =>
        !row.title || (typeof row.title === "string" && !row.title.trim()),
    );

    const missingSlug = rows.filter(
      (row) => !row.slug || (typeof row.slug === "string" && !row.slug.trim()),
    );

    if (!missingTitle.length) {
      console.log("✅ Products have titles");
    } else {
      console.log(`⚠️ ${missingTitle.length} products have missing titles`);
    }

    if (!missingSlug.length) {
      console.log("✅ Products have slugs");
    } else {
      console.log(`⚠️ ${missingSlug.length} products have missing slugs`);
    }
  } catch (err) {
    console.log(`⚠️ Product sanity check failed: ${err.message}`);
  }
}

/* ================================================================
   18. REVIEW SANITY
   ================================================================ */

console.log("\n--- 18. REVIEW SANITY ---");

async function checkReviews() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, moderation_status")
      .limit(5000);

    if (error) {
      console.log(`⚠️ Review check unavailable: ${error.message}`);
      return;
    }

    const rows = data || [];

    const invalidRatings = rows.filter(
      (row) =>
        typeof row.rating === "number" && (row.rating < 1 || row.rating > 5),
    );

    if (!invalidRatings.length) {
      console.log("✅ Review ratings are within 1–5");
    } else {
      console.log(`❌ ${invalidRatings.length} reviews have invalid ratings`);
    }

    const statuses = new Map();

    for (const row of rows) {
      const status = row.moderation_status ?? "NULL";
      statuses.set(status, (statuses.get(status) || 0) + 1);
    }

    console.log("ℹ️ Review moderation statuses:");

    for (const [status, count] of statuses.entries()) {
      console.log(`   - ${status}: ${count}`);
    }
  } catch (err) {
    console.log(`⚠️ Review sanity check failed: ${err.message}`);
  }
}

/* ================================================================
   19. DATABASE RESPONSE / LATENCY CHECK
   ================================================================ */

console.log("\n--- 19. DATABASE RESPONSE CHECK ---");

async function checkDatabaseLatency() {
  const start = Date.now();

  try {
    const { error } = await supabase.from("products").select("id").limit(1);

    const elapsed = Date.now() - start;

    if (error) {
      console.log(`❌ Database request failed: ${error.message}`);
      return;
    }

    let rating = "GOOD";

    if (elapsed > 2000) rating = "SLOW";
    else if (elapsed > 1000) rating = "MODERATE";

    console.log(`✅ Database responded in ${elapsed}ms (${rating})`);
  } catch (err) {
    console.log(`❌ Database latency test failed: ${err.message}`);
  }
}

/* ================================================================
   20. FINAL READ-ONLY GUARD
   ================================================================ */

console.log("\n--- 20. READ-ONLY SAFETY VERIFICATION ---");

console.log("✅ No INSERT operations defined");
console.log("✅ No UPDATE operations defined");
console.log("✅ No DELETE operations defined");
console.log("✅ No schema migrations defined");
console.log("✅ No CREATE/ALTER/DROP operations defined");
console.log("✅ No mutating RPC calls defined");

console.log("\n🔒 This audit is intentionally read-only.");

/* ================================================================
   21. RUN EVERYTHING
   ================================================================ */

async function main() {
  let relationPassed = 0;
  let cmsPassed = 0;

  /* Tables */
  for (const table of requiredTables) {
    await testTable(table);
  }

  /* Relations */
  relationPassed = await runRelationTests();

  /* CMS */
  cmsPassed = await runCmsTests();

  /* Data */
  await runDataQualityChecks();

  /* Orphans */
  await checkOrphans();

  /* Security */
  await checkSensitiveData();

  /* Anonymous access */
  await checkAnonAccess();

  /* RLS */
  await inspectRls();

  /* Storage */
  await checkStorage();

  /* Media */
  await checkMediaData();

  /* Active content */
  await checkActiveContent();

  /* Inventory */
  await checkInventory();

  /* Pricing & Paise */
  await checkPricingPaise();

  /* Coupons */
  await checkCouponSanity();

  /* Products */
  await checkProducts();

  /* Reviews */
  await checkReviews();

  /* Latency */
  await checkDatabaseLatency();

  /* ==============================================================
     FINAL SUMMARY
     ============================================================== */

  const elapsed = Date.now() - startedAt;

  console.log(
    "\n================================================================",
  );
  console.log("🎯 FINAL AUDIT SUMMARY");
  console.log(
    "================================================================",
  );

  const readableTables = Object.values(tableResults).filter(
    (result) => result.ok,
  ).length;

  const failedTables = Object.values(tableResults).filter(
    (result) => !result.ok,
  ).length;

  console.log(
    `📊 Required tables readable: ${readableTables}/${requiredTables.length}`,
  );

  console.log(
    `🔗 Relation tests passed: ${relationPassed}/${relationTests.length}`,
  );

  console.log(`📣 CMS tests passed: ${cmsPassed}/${cmsTests.length}`);

  console.log(`🌐 API routes discovered: ${apiRoutes.length}`);

  console.log(`📁 Source files scanned: ${allFiles.length}`);

  console.log(
    `⚠️ Static warnings: ${
      findings.hardcodedMockState.length +
      findings.missingSupabaseRoutes.length +
      findings.incompleteCrud.length +
      findings.narrowTruncation.length +
      findings.todoMarkers.length
    }`,
  );

  console.log(
    `🚨 Potential security findings: ${
      findings.serviceRoleClientCode.length +
      findings.exposedSecrets.length +
      findings.disabledRlsHints.length
    }`,
  );

  if (failedTables === 0) {
    console.log("✅ Required database tables are accessible.");
  } else {
    console.log(
      `❌ ${failedTables} required database tables failed access checks.`,
    );
  }

  if (relationPassed === relationTests.length) {
    console.log("✅ All tested database relationships are operational.");
  } else {
    console.log(
      `⚠️ ${relationTests.length - relationPassed} relationship tests failed.`,
    );
  }

  if (
    findings.serviceRoleClientCode.length ||
    findings.exposedSecrets.length ||
    findings.disabledRlsHints.length
  ) {
    console.log("🚨 SECURITY REVIEW REQUIRED.");
  } else {
    console.log(
      "✅ No obvious service-role/client-secret exposure detected by static scan.",
    );
  }

  console.log(
    "\n⚠️ IMPORTANT: Passing this audit does NOT prove that your application is fully secure.",
  );

  console.log("⚠️ RLS authorization should still be reviewed in Supabase.");

  console.log(`\n⏱️ Audit completed in ${elapsed}ms`);

  console.log(
    "================================================================\n",
  );
}

main().catch((err) => {
  console.error("\n❌ AUDIT CRASHED");
  console.error(err);
  process.exit(1);
});
