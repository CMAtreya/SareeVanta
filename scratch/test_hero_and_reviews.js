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

async function testHeroAndReviews() {
  console.log('=== VERIFYING DYNAMIC HERO BANNERS & REVIEW PHOTO CAPABILITIES ===\n');

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

  // 1. Check Hero Slides in DB
  const { data: slides, error: slideErr } = await supabase.from('hero_slides').select('*').eq('is_active', true);
  assert(!slideErr && Array.isArray(slides) && slides.length >= 2, `Active Hero Banners in Supabase: ${slides?.length || 0} slides`);

  // 2. Check Review Photo DSS Cap Logic
  const reviewApiCode = fs.readFileSync(path.join(process.cwd(), 'app/api/reviews/route.ts'), 'utf8');
  assert(reviewApiCode.includes('Math.min(photos.length, 2)'), 'API enforces Max 2 Photos limit on review insertion per DSS');

  const pdpCode = fs.readFileSync(path.join(process.cwd(), 'app/products/[slug]/page.tsx'), 'utf8');
  assert(pdpCode.includes('newReviewPhotos.length < 2') && pdpCode.includes('handleReviewPhotoUpload'), 'PDP Review Modal allows photo uploads capped at max 2 images');
  assert(pdpCode.includes('handleRemoveReviewPhoto'), 'PDP Review Modal provides photo removal capability');

  console.log(`\n=== AUDIT SUMMARY ===`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
}

testHeroAndReviews();
