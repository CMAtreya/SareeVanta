const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log('=== CHECKING BANNERS AND REVIEWS TABLE SCHEMA ===\n');

  // Check banners
  const { data: banners, error: bannerErr } = await supabase.from('banners').select('*').limit(5);
  console.log('Banners Query Result:', { count: banners?.length, error: bannerErr });
  if (banners && banners.length > 0) {
    console.log('Sample Banner:', banners[0]);
  }

  // Check reviews
  const { data: reviews, error: reviewErr } = await supabase.from('reviews').select('*').limit(5);
  console.log('\nReviews Query Result:', { count: reviews?.length, error: reviewErr });
  if (reviews && reviews.length > 0) {
    console.log('Sample Review:', reviews[0]);
  }
}

checkSchema();
