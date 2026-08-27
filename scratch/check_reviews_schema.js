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

async function checkReviewsSchema() {
  console.log('=== CHECKING REVIEWS TABLE IN SUPABASE ===\n');

  const { data: revs, error } = await supabase.from('reviews').select('*');
  if (error) {
    console.error('Error fetching reviews:', error.message);
  } else {
    console.log(`Found ${revs.length} rows in public.reviews table.`);
    console.log('Sample row:', revs[0] || 'No rows in database');
  }
}

checkReviewsSchema();
