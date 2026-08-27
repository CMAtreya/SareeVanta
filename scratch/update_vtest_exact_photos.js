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

async function updateVtest() {
  console.log('=== SYNCING EXACT V-TEST MEDIA IN SUPABASE ===\n');

  const { data: p } = await supabase.from('products').select('id').eq('slug', 'v-test').maybeSingle();
  if (p) {
    const { data: vars } = await supabase.from('product_variants').select('id').eq('product_id', p.id);
    if (vars && vars.length > 0) {
      const variantId = vars[0].id;
      // Delete old media
      await supabase.from('product_variant_media').delete().eq('variant_id', variantId);

      // Insert 2 distinct high-res Mysore silk saree photos
      const media = [
        {
          variant_id: variantId,
          url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
          is_primary: true,
          display_order: 0,
        },
        {
          variant_id: variantId,
          url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
          is_primary: false,
          display_order: 1,
        },
      ];

      const { error } = await supabase.from('product_variant_media').insert(media);
      if (!error) {
        console.log('✓ Attached 2 distinct photos to V-TEST in database!');
      } else {
        console.error('Error inserting media:', error.message);
      }
    }
  }
}

updateVtest();
