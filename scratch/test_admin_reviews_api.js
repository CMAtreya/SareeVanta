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

async function testFetch() {
  console.log('=== TESTING SUPABASE REVIEWS FETCH ===\n');

  const { data: revs, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customers ( name, email, phone ),
      product_variants ( sku, products ( title ) )
    `);

  if (error) {
    console.error('Error fetching reviews:', error.message);
  } else {
    console.log(`Fetched ${revs.length} live database reviews from Supabase:`);
    console.log(JSON.stringify(revs, null, 2));
  }
}

testFetch();
