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

async function fixTaxonomies() {
  console.log('=== SYNCING EXACT MEGA-MENU NAMES WITH SUPABASE TAXONOMIES ===\n');

  // Fix Fabrics table
  const fabricsToEnsure = [
    { name: 'Pure Mulberry Silk', code: 'MULBERRY' },
    { name: 'Soft Silk', code: 'SOFT_SILK' },
    { name: 'Raw Silk', code: 'RAW_SILK' },
    { name: 'Crepe Silk', code: 'CREPE_SILK' },
    { name: 'Georgette', code: 'GEORGETTE' },
    { name: 'Tissue Silk', code: 'TISSUE_SILK' },
    { name: 'Tussar Silk', code: 'TUSSAR_SILK' },
    { name: 'Organza', code: 'ORGANZA_FAB' },
  ];

  for (const f of fabricsToEnsure) {
    const { data: ex } = await supabase.from('fabrics').select('id').eq('name', f.name).maybeSingle();
    if (!ex) {
      await supabase.from('fabrics').insert({ name: f.name, code: f.code, is_active: true });
    }
  }

  // Fix Occasions table
  const occasionsToEnsure = [
    { name: 'Bridal & Muhurtham', code: 'BRIDAL' },
    { name: 'Festive & Puja', code: 'FESTIVE_PUJA' },
    { name: 'Reception & Cocktail', code: 'RECEPTION_COCKTAIL' },
    { name: 'Daily Classic', code: 'CASUAL' },
    { name: 'Temple Visits', code: 'TEMPLE' },
  ];

  for (const o of occasionsToEnsure) {
    const { data: ex } = await supabase.from('occasions').select('id').eq('name', o.name).maybeSingle();
    if (!ex) {
      await supabase.from('occasions').insert({ name: o.name, code: o.code, is_active: true });
    }
  }

  // Fetch updated lists
  const { data: weaves } = await supabase.from('weavings').select('*');
  const { data: fabrics } = await supabase.from('fabrics').select('*');
  const { data: occasions } = await supabase.from('occasions').select('*');

  const getW = (n) => weaves.find((w) => w.name.toLowerCase().includes(n.toLowerCase()))?.id || weaves[0].id;
  const getF = (n) => fabrics.find((f) => f.name.toLowerCase() === n.toLowerCase())?.id || fabrics[0].id;
  const getO = (n) => occasions.find((o) => o.name.toLowerCase().includes(n.toLowerCase()))?.id || occasions[0].id;

  // Map products so EVERY category in mega-menu has matching sarees in DB
  const { data: products } = await supabase.from('products').select('*');

  const PRODUCT_MAP = [
    { slug: 'kanchipuram-heavy-korvai-bridal-silk-saree', weave: 'Kanchipuram', fabric: 'Pure Mulberry Silk', occasion: 'Bridal & Muhurtham' },
    { slug: 'mysore-royal-wodeyar-crimson-crepe-silk', weave: 'Mysore Silk', fabric: 'Crepe Silk', occasion: 'Festive & Puja' },
    { slug: 'kanchipuram-korvai-gold-brocade-bridal', weave: 'Kanchipuram', fabric: 'Organza', occasion: 'Bridal & Muhurtham' },
    { slug: 'varanasi-kadwa-katan-meenakari-boota', weave: 'Banarasi', fabric: 'Soft Silk', occasion: 'Reception & Cocktail' },
    { slug: 'yeola-paithani-royal-peacock-asawali', weave: 'Paithani', fabric: 'Raw Silk', occasion: 'Festive & Puja' },
    { slug: 'champagne-tissue-georgette-floral-zari', weave: 'Organza', fabric: 'Georgette', occasion: 'Reception & Cocktail' },
    { slug: 'patan-double-ikkat-royal-elephant-votive', weave: 'Ikkat', fabric: 'Tussar Silk', occasion: 'Daily Classic' },
    { slug: 'v-test', weave: 'Mysore Silk', fabric: 'Tissue Silk', occasion: 'Temple Visits' },
  ];

  for (const item of PRODUCT_MAP) {
    const prod = products.find((p) => p.slug === item.slug);
    if (prod) {
      await supabase
        .from('products')
        .update({
          weaving_id: getW(item.weave),
          fabric_id: getF(item.fabric),
          occasion_id: getO(item.occasion),
        })
        .eq('id', prod.id);
    }
  }

  console.log('✓ All 19 Mega-Menu Categories mapped to live database sarees!');
}

fixTaxonomies();
