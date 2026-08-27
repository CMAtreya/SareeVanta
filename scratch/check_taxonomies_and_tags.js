const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
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
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('=== CHECKING TAXONOMY & TAG TABLES IN SUPABASE ===\n');

  const tables = [
    'weavings',
    'fabrics',
    'occasions',
    'patterns',
    'border_stylings',
    'zari_specifications',
    'colors',
    'tags',
    'product_tags',
    'products',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.log(`Table '${table}': ERROR -> ${error.message}`);
      } else {
        console.log(`Table '${table}': ${data?.length || 0} rows`);
        if (data && data.length > 0) {
          console.log(` Sample rows:`, JSON.stringify(data.slice(0, 3)));
        }
      }
    } catch (err) {
      console.log(`Table '${table}': Exception -> ${err.message}`);
    }
    console.log('--------------------------------------------------');
  }
}

checkTables();
