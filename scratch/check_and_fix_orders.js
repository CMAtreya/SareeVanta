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

async function checkFix() {
  const { data: variants } = await supabase.from('product_variants').select('id, product_id, product_variant_media(id)');
  console.log('Variants count:', variants.length);
  for (const v of variants) {
    if (!v.product_variant_media || v.product_variant_media.length === 0) {
      console.log('Adding media to variant:', v.id);
      const { error } = await supabase.from('product_variant_media').insert([
        {
          variant_id: v.id,
          url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
          is_primary: true,
          display_order: 1
        },
        {
          variant_id: v.id,
          url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
          is_primary: false,
          display_order: 2
        }
      ]);
      console.log('Media insert error:', error);
    }
  }

  // Check orders table columns
  const { data: ordCheck, error: ordErr } = await supabase.from('orders').insert({
    order_number: `ORD-TEST-${Date.now().toString().slice(-6)}`,
    subtotal_paise: 2800000,
    total_amount_paise: 2940000,
    order_status: 'DELIVERED',
    payment_status: 'PAID'
  }).select('*');

  console.log('Orders insert test:', { ordCheck, ordErr });
}

checkFix();
