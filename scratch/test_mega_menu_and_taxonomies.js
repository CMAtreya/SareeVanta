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

const MEGA_MENU_WEAVES = ['Kanchipuram', 'Banarasi', 'Mysore Silk', 'Organza', 'Paithani', 'Ikkat'];
const MEGA_MENU_FABRICS = ['Pure Mulberry Silk', 'Soft Silk', 'Raw Silk', 'Crepe Silk', 'Georgette', 'Tissue Silk', 'Tussar Silk', 'Organza'];
const MEGA_MENU_OCCASIONS = ['Bridal & Muhurtham', 'Festive & Puja', 'Reception & Cocktail', 'Daily Classic', 'Temple Visits'];

async function testMegaMenuTaxonomies() {
  console.log('=== VERIFYING EVERY SINGLE MEGA-MENU CATEGORY LINK AGAINST SUPABASE DATABASE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASSED: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${msg}`);
      failed++;
    }
  }

  // 1. Check Weaves
  console.log('1. Testing "Shop by Weave" Categories...');
  for (const w of MEGA_MENU_WEAVES) {
    const { data: prods } = await supabase
      .from('products')
      .select('title, weavings!inner(name), product_variants(product_variant_media(url))')
      .ilike('weavings.name', `%${w}%`);
    assert(Array.isArray(prods) && prods.length > 0, `Weave "${w}" returns ${prods?.length || 0} active sarees in database`);
  }

  // 2. Check Fabrics
  console.log('\n2. Testing "Shop by Fabric" Categories...');
  for (const f of MEGA_MENU_FABRICS) {
    const { data: prods } = await supabase
      .from('products')
      .select('title, fabrics!inner(name), product_variants(product_variant_media(url))')
      .ilike('fabrics.name', `%${f}%`);
    assert(Array.isArray(prods) && prods.length > 0, `Fabric "${f}" returns ${prods?.length || 0} active sarees in database`);
  }

  // 3. Check Occasions
  console.log('\n3. Testing "Shop by Occasion" Categories...');
  for (const o of MEGA_MENU_OCCASIONS) {
    const { data: prods } = await supabase
      .from('products')
      .select('title, occasions!inner(name), product_variants(product_variant_media(url))')
      .ilike('occasions.name', `%${o.split('&')[0].trim()}%`);
    assert(Array.isArray(prods) && prods.length > 0, `Occasion "${o}" returns ${prods?.length || 0} active sarees in database`);
  }

  console.log(`\n=== MEGA-MENU TAXONOMY AUDIT SUMMARY ===`);
  console.log(`TOTAL CATEGORIES TESTED: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL MEGA-MENU LINKS ARE 100% CONNECTED TO SUPABASE AND RETURNING VALID SAREES!');
  }
}

testMegaMenuTaxonomies();
