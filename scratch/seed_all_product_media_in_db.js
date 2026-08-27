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

const PRODUCT_PHOTOS = {
  'mysore-royal-wodeyar-crimson-crepe-silk': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
  ],
  'kanchipuram-korvai-gold-brocade-bridal': [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  ],
  'varanasi-kadwa-katan-meenakari-boota': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
  ],
  'yeola-paithani-royal-peacock-asawali': [
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  ],
  'champagne-tissue-georgette-floral-zari': [
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
  ],
  'patan-double-ikkat-royal-elephant-votive': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  ],
  'kanchipuram-heavy-korvai-bridal-silk-saree': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
  ],
};

async function seedProductMedia() {
  console.log('=== SEEDING PRODUCT VARIANT MEDIA INTO SUPABASE DATABASE ===\n');

  const { data: products } = await supabase.from('products').select('id, slug, title, product_variants(id)');

  if (!products) {
    console.error('No products found');
    return;
  }

  for (const prod of products) {
    const photos = PRODUCT_PHOTOS[prod.slug] || [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    ];

    const variants = prod.product_variants || [];
    for (const variant of variants) {
      // Clear old media for this variant
      await supabase.from('product_variant_media').delete().eq('variant_id', variant.id);

      // Insert fresh media rows
      const inserts = photos.map((url, idx) => ({
        variant_id: variant.id,
        url,
        is_primary: idx === 0,
        display_order: idx,
      }));

      const { error } = await supabase.from('product_variant_media').insert(inserts);
      if (error) {
        console.error(`Error inserting media for ${prod.title} (variant ${variant.id}):`, error.message);
      } else {
        console.log(`✓ Inserted ${inserts.length} media photos for "${prod.title}"`);
      }
    }
  }

  console.log('\n=== PRODUCT VARIANT MEDIA SEED COMPLETE ===');
}

seedProductMedia();
