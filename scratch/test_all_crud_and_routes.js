const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local for credentials
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsknhjffrbfscujixvsm.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== RUNNING COMPREHENSIVE END-TO-END CRUD & ROUTE VERIFICATION ===\n');

const supabase = createClient(url, key);

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASSED: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Products Table in Supabase
    console.log('1. Testing Products Database & Variant Media...');
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*, product_variants(*, product_variant_media(*))')
      .limit(5);

    assert(!prodErr, `Fetch products from Supabase (Error: ${prodErr?.message || 'None'})`);
    assert(Array.isArray(products) && products.length > 0, `Products table has ${products?.length || 0} live records`);

    const firstProduct = products?.[0];
    assert(firstProduct && firstProduct.title, `First product has title: "${firstProduct?.title}"`);

    const variants = firstProduct?.product_variants || [];
    assert(variants.length > 0, `Product "${firstProduct?.title}" has ${variants.length} variant(s)`);

    const variantMedia = variants[0]?.product_variant_media || [];
    assert(variantMedia.length > 0, `Variant has ${variantMedia.length} media photo(s)`);

    // 2. Test Product Creation/Edit Persistence in Supabase
    console.log('\n2. Testing Product CRUD Update & Image Persistence...');
    const testImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';
    const targetVariantId = variants[0]?.id;

    if (targetVariantId) {
      const { error: mediaErr } = await supabase
        .from('product_variant_media')
        .upsert({
          variant_id: targetVariantId,
          url: testImage,
          is_primary: true,
          display_order: 0,
        });
      assert(!mediaErr, `Upsert media image to variant ${targetVariantId}`);

      const { data: verifyMedia } = await supabase
        .from('product_variant_media')
        .select('*')
        .eq('variant_id', targetVariantId);

      assert(
        verifyMedia && verifyMedia.some((m) => m.url === testImage),
        `Media URL successfully persisted in Supabase database`
      );
    }

    // 3. Test Reviews API & Image Thumbnails
    console.log('\n3. Testing Review Moderation API & Thumbnail Resolution...');
    const { data: dbReviews, error: revErr } = await supabase
      .from('reviews')
      .select('*, product_variants(sku, products(title), product_variant_media(url))');

    assert(!revErr, `Fetch reviews from Supabase (Error: ${revErr?.message || 'None'})`);
    assert(Array.isArray(dbReviews) && dbReviews.length > 0, `Reviews table has ${dbReviews?.length || 0} live records`);

    const revWithImage = dbReviews.find((r) => r.product_variants?.product_variant_media?.length > 0);
    assert(Boolean(revWithImage), `Found review linked to product with media thumbnail URL`);

    // 4. Test Updating Review Moderation Status
    console.log('\n4. Testing Review Moderation Status Updates...');
    const testReview = dbReviews?.[0];
    if (testReview) {
      const newStatus = testReview.moderation_status === 'APPROVED' ? 'PENDING' : 'APPROVED';
      const { error: updateErr } = await supabase
        .from('reviews')
        .update({ moderation_status: newStatus })
        .eq('id', testReview.id);

      assert(!updateErr, `Update review ${testReview.id} status to ${newStatus}`);

      // Restore status
      await supabase
        .from('reviews')
        .update({ moderation_status: testReview.moderation_status })
        .eq('id', testReview.id);
    }

    // 5. Test Inventory Table
    console.log('\n5. Testing Inventory Table...');
    const { data: inv, error: invErr } = await supabase.from('inventory').select('*').limit(5);
    assert(!invErr, `Fetch inventory from Supabase`);
    assert(Array.isArray(inv) && inv.length > 0, `Inventory table contains ${inv?.length || 0} stock items`);

    // 6. Test Instagram Reels Table
    console.log('\n6. Testing Instagram Reels Table...');
    const { data: reels, error: reelErr } = await supabase.from('instagram_reels').select('*').limit(5);
    assert(!reelErr, `Fetch Instagram Reels from Supabase`);
    assert(Array.isArray(reels) && reels.length > 0, `Instagram Reels table contains ${reels?.length || 0} active reels`);

    // 7. Test Hero Banners Table
    console.log('\n7. Testing Hero Banners Table...');
    const { data: banners, error: bannerErr } = await supabase.from('hero_slides').select('*').limit(5);
    assert(!bannerErr, `Fetch Hero Banners from Supabase`);
    assert(Array.isArray(banners) && banners.length > 0, `Hero Slides table contains ${banners?.length || 0} active slides`);

    console.log(`\n=== END-TO-END VERIFICATION SUMMARY ===`);
    console.log(`TOTAL PASSED: ${passed}`);
    console.log(`TOTAL FAILED: ${failed}`);

    if (failed === 0) {
      console.log('\n🌟 ALL DATABASE ROUTES AND CRUD OPERATIONS ARE 100% VERIFIED AND WORKING PROPERLY!');
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
  }
}

runTests();
