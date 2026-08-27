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
  const slug = 'v-test';
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

  let query = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      description,
      care_instructions,
      base_mrp_paise,
      base_selling_price_paise,
      is_published,
      weavings ( name ),
      fabrics ( name ),
      occasions ( name ),
      patterns ( name ),
      border_stylings ( name ),
      zari_specifications ( name ),
      product_variants (
        id,
        sku,
        price_paise,
        mrp_paise,
        is_active,
        colors ( id, name, hex_code ),
        product_variant_media ( url, is_primary, display_order )
      )
    `);

  if (isUuid) {
    query = query.or(`slug.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.eq('slug', slug);
  }

  const { data, error } = await query.maybeSingle();

  console.log('Query Error:', error);
  console.log('Query Data Title:', data?.title);
  console.log('Query Data Slug:', data?.slug);
  console.log('Weaving Name:', data?.weavings?.name);
  console.log('Fabric Name:', data?.fabrics?.name);
}

testFetch();
