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

async function inspect() {
  const { data: prods } = await supabase.from('products').select('id, title, product_variants(id, sku, product_variant_media(url))');
  for (const p of prods) {
    const vars = p.product_variants || [];
    console.log(`Product: "${p.title}" -> ${vars.length} variants`);
    vars.forEach((v) => {
      console.log(`   Variant ${v.sku || v.id}: ${v.product_variant_media?.length || 0} media files`);
    });
  }
}

inspect();
