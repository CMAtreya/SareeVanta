const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVtest() {
  console.log('=== CHECKING V-TEST IN DATABASE ===\n');

  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .or('slug.eq.v-test,title.ilike.%v-test%,id.eq.v-test');

  console.log('QueryResult error:', error);
  console.log('QueryResult data:', JSON.stringify(data, null, 2));

  console.log('\n=== ALL PRODUCTS IN DB (id, slug, title) ===');
  const { data: allP } = await supabase.from('products').select('id, slug, title');
  console.log(JSON.stringify(allP, null, 2));
}

checkVtest();
