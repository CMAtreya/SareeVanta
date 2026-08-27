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

async function check() {
  const { data: prods } = await supabase.from('products').select('id, title, slug, product_variants(id, product_variant_media(*))');
  console.log('PRODUCTS IN SUPABASE DB WITH VARIANT MEDIA:');
  prods.forEach((p) => {
    console.log(`\nProduct: ${p.title} (${p.slug})`);
    p.product_variants?.forEach((v, vIdx) => {
      console.log(`  Variant ${vIdx + 1} (${v.id}): ${v.product_variant_media?.length || 0} media items`);
      v.product_variant_media?.forEach((m) => {
        console.log(`    - URL: ${m.url}`);
      });
    });
  });
}

check();
