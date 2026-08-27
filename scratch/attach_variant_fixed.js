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

async function fix() {
  const { data: colors } = await supabase.from('colors').select('id, name');
  console.log('Colors in DB:', colors);

  const { data: prod } = await supabase.from('products').select('id').eq('slug', 'mysore-silk-crepe-royal-navy-gold-border').single();
  if (prod && colors && colors.length > 0) {
    const { data: variant, error } = await supabase.from('product_variants').insert({
      product_id: prod.id,
      sku: 'NSH-SKU-MYS-10',
      price_paise: 3200000,
      mrp_paise: 3800000,
      color_id: colors[0].id,
      is_active: true,
    }).select('id').single();

    console.log('Variant creation:', { variant, error });

    if (variant) {
      await supabase.from('product_variant_media').insert([
        {
          variant_id: variant.id,
          url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
          is_primary: true,
          display_order: 1
        },
        {
          variant_id: variant.id,
          url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
          is_primary: false,
          display_order: 2
        }
      ]);

      await supabase.from('inventory').insert({
        variant_id: variant.id,
        quantity: 10,
        reserved_quantity: 0,
      });

      console.log('10th product variant and media attached successfully.');
    }
  }
}

fix();
