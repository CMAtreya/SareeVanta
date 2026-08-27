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

async function seedReviews() {
  console.log('=== SEEDING REAL REVIEWS INTO SUPABASE DATABASE ===\n');

  let { data: cust } = await supabase.from('customers').select('id').limit(1).maybeSingle();
  if (!cust) {
    const { data: newCust, error: custErr } = await supabase.from('customers').insert({ name: 'Dr. Radhika Reddy', email: 'radhika.reddy@gmail.com', phone: '+91 98860 11223' }).select('id').single();
    if (custErr) console.error('Cust err:', custErr.message);
    cust = newCust;
  }

  let { data: order } = await supabase.from('orders').select('id').limit(1).maybeSingle();
  if (!order && cust) {
    const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
      customer_id: cust.id,
      order_number: 'NSH-2026-8810',
      subtotal_paise: 2800000,
      total_paise: 2800000,
      order_status: 'DELIVERED',
      payment_status: 'PAID'
    }).select('id').single();
    if (orderErr) console.error('Order err:', orderErr.message);
    order = newOrder;
  }

  let { data: vars } = await supabase.from('product_variants').select('id, product_id, sku').limit(2);
  if (!vars || vars.length === 0) {
    console.error('No variants found.');
    return;
  }

  const v1 = vars[0];
  const v2 = vars[1] || vars[0];

  let { data: item1 } = await supabase.from('order_items').select('id').eq('order_id', order.id).limit(1).maybeSingle();
  if (!item1) {
    const { data: newItem, error: itemErr } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: v1.product_id,
      variant_id: v1.id,
      quantity: 1,
      unit_price_paise: 2800000,
      line_total_paise: 2800000,
      sku_snapshot: v1.sku || 'NSH-SKU-MYS-01',
      product_name_snapshot: 'Heirloom Mysore Silk Saree',
    }).select('id').single();
    if (itemErr) console.error('Item err:', itemErr.message);
    item1 = newItem;
  }

  const sampleReviews = [
    {
      customer_id: cust.id,
      order_id: order.id,
      order_item_id: item1.id,
      variant_id: v1.id,
      rating: 5,
      review_text: 'Exquisite Korvai weave for my daughter’s Muhurtham! The pure 3G gold zari work has a sublime luminescence that indoor studio photos cannot even capture fully.',
      moderation_status: 'PENDING',
      created_at: new Date().toISOString(),
    },
    {
      customer_id: cust.id,
      order_id: order.id,
      order_item_id: item1.id,
      variant_id: v2.id,
      rating: 5,
      review_text: 'The tapestry woven peacock pallu is a masterwork! The Asawali vine borders and the multi-colored silk parrot motifs on the pallu are mesmerizing.',
      moderation_status: 'APPROVED',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const { data: inserted, error } = await supabase.from('reviews').insert(sampleReviews).select();
  if (error) {
    console.error('Error inserting reviews:', error.message);
  } else {
    console.log(`✓ Successfully inserted ${inserted.length} real database reviews into Supabase!`);
  }
}

seedReviews();
