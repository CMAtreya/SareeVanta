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

async function checkMedia() {
  console.log('=== CHECKING V-TEST MEDIA IN SUPABASE ===\n');

  const { data: p } = await supabase.from('products').select('id, title, slug').eq('slug', 'v-test').maybeSingle();
  console.log('Product:', p);

  if (p) {
    const { data: vars } = await supabase.from('product_variants').select('id, sku').eq('product_id', p.id);
    console.log('Variants:', vars);

    for (const v of vars || []) {
      const { data: media } = await supabase.from('product_variant_media').select('*').eq('variant_id', v.id);
      console.log(`Media for variant ${v.sku}:`, media);
    }
  }
}

checkMedia();
