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

async function seedData() {
  console.log('=== SEEDING 10TH MASTERPIECE PRODUCT & ORDERS ===\n');

  // 1. Check existing products
  const { data: prods } = await supabase.from('products').select('id, title, slug');
  console.log(`Current products in DB: ${prods?.length || 0}`);

  if (prods && prods.length < 10) {
    const { data: weave } = await supabase.from('weavings').select('id').eq('name', 'Mysore Silk').maybeSingle();
    const { data: fabric } = await supabase.from('fabrics').select('id').eq('name', 'Crepe Silk').maybeSingle();
    const { data: occasion } = await supabase.from('occasions').select('id').eq('name', 'Festive & Celebration').maybeSingle();
    const { data: zari } = await supabase.from('zari_specifications').select('id').eq('name', 'Tested Gold Zari').maybeSingle();
    const { data: color } = await supabase.from('colors').select('id').maybeSingle();

    const { data: newProd, error: pErr } = await supabase.from('products').insert({
      title: 'Mysore Silk Crepe Royal Navy Gold Border Saree',
      slug: 'mysore-silk-crepe-royal-navy-gold-border',
      description: 'Handwoven in Karnataka with pure Mysore crepe silk and royal gold zari selvedge borders.',
      base_mrp_paise: 3800000,
      base_selling_price_paise: 3200000,
      weaving_id: weave?.id,
      fabric_id: fabric?.id,
      occasion_id: occasion?.id,
      zari_specification_id: zari?.id,
      is_published: true,
    }).select('id').single();

    if (newProd) {
      const { data: variant } = await supabase.from('product_variants').insert({
        product_id: newProd.id,
        sku: 'NSH-MYS-NVY-010',
        price_paise: 3200000,
        mrp_paise: 3800000,
        color_id: color?.id,
        is_active: true,
      }).select('id').single();

      if (variant) {
        await supabase.from('product_variant_media').insert([
          {
            variant_id: variant.id,
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
            is_primary: true,
            display_order: 1,
          },
          {
            variant_id: variant.id,
            url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
            is_primary: false,
            display_order: 2,
          }
        ]);

        await supabase.from('inventory').insert({
          variant_id: variant.id,
          quantity: 12,
          reserved_quantity: 0,
        });
      }
    }
  }

  // 2. Seed sample orders if none exist
  const { data: orders } = await supabase.from('orders').select('id');
  if (!orders || orders.length === 0) {
    const { data: customer } = await supabase.from('customers').select('id').maybeSingle();
    const { data: variant } = await supabase.from('product_variants').select('id, price_paise').maybeSingle();

    if (customer && variant) {
      const { data: order } = await supabase.from('orders').insert({
        customer_id: customer.id,
        order_number: `ORD-NSH-${Date.now().toString().slice(-6)}`,
        subtotal_paise: variant.price_paise,
        discount_paise: 0,
        tax_paise: Math.round(variant.price_paise * 0.05),
        total_amount_paise: variant.price_paise + Math.round(variant.price_paise * 0.05),
        order_status: 'DELIVERED',
        payment_status: 'PAID',
        shipping_address: {
          full_name: 'Radhika Sundaram',
          address_line1: '142 Temple View Avenue, Sayyaji Rao Road',
          city: 'Mysuru',
          state: 'Karnataka',
          postal_code: '570001',
          country: 'India',
          phone: '9886012345'
        }
      }).select('id').single();

      if (order) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          variant_id: variant.id,
          quantity: 1,
          unit_price_paise: variant.price_paise,
          total_price_paise: variant.price_paise,
        });
      }
      console.log('Sample delivered order seeded successfully.');
    }
  }

  console.log('Seed completed.');
}

seedData();
