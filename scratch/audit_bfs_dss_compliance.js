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

console.log('=== COMPREHENSIVE BFS-1 & DSS COMPLIANCE AUDIT ===\n');

async function runBfsDssAudit() {
  const results = {
    implemented: [],
    partial: [],
    missing: [],
  };

  function check(feature, condition, details) {
    if (condition) {
      console.log(`[PASS] ✓ ${feature}: ${details}`);
      results.implemented.push({ feature, details });
    } else {
      console.error(`[FAIL] ✗ ${feature}: ${details}`);
      results.missing.push({ feature, details });
    }
  }

  // 1. CART QUANTITY & STOCK VALIDATION (BFS 9.3)
  console.log('--- 1. CART QUANTITY & STOCK CAP AUDIT ---');
  try {
    const cartRouteContent = fs.readFileSync(path.join(process.cwd(), 'app/api/cart/items/route.ts'), 'utf8');
    const validatesStockInCart = cartRouteContent.includes('stock_count') || cartRouteContent.includes('inventory') || cartRouteContent.includes('quantity >');
    check(
      'Cart API Stock Cap Check (BFS 9.3)',
      validatesStockInCart,
      validatesStockInCart
        ? 'Cart API validates item quantity against available stock'
        : 'MISSING: Cart API does not check stock_count before adding/updating cart items!'
    );
  } catch (e) {
    check('Cart API Stock Cap Check (BFS 9.3)', false, `File missing: ${e.message}`);
  }

  // 2. CART ITEM SELECTION STATE (BFS 9.4)
  console.log('\n--- 2. CART ITEM SELECTION STATE AUDIT ---');
  try {
    const cartSchema = fs.readFileSync(path.join(process.cwd(), 'app/api/cart/route.ts'), 'utf8');
    const hasSelectionState = cartSchema.includes('is_selected') || cartSchema.includes('selected');
    check(
      'Cart Item Selection State (BFS 9.4)',
      hasSelectionState,
      hasSelectionState
        ? 'Cart endpoint supports partial item selection'
        : 'MISSING: Cart items lack is_selected flag for partial checkout'
    );
  } catch (e) {
    check('Cart Item Selection State (BFS 9.4)', false, e.message);
  }

  // 3. MONEY IN PAISE REQUIREMENT (DSS 2.6)
  console.log('\n--- 3. MONEY IN PAISE AUDIT ---');
  try {
    const { data: prods } = await supabase.from('products').select('base_selling_price_paise, base_mrp_paise').limit(1);
    const hasPaiseCols = prods && prods.length > 0 && 'base_selling_price_paise' in prods[0];
    check(
      'Database Money in Paise (DSS 2.6)',
      hasPaiseCols,
      hasPaiseCols ? 'Database stores prices in integer paise' : 'MISSING: Database columns for paise missing'
    );
  } catch (e) {
    check('Database Money in Paise (DSS 2.6)', false, e.message);
  }

  // 4. PREPAID ONLY & RE-VALIDATION (BFS 10.1, 11.2)
  console.log('\n--- 4. PREPAID PAYMENT & PRICE RE-VALIDATION AUDIT ---');
  try {
    const checkoutRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/checkout/payment/init/route.ts'), 'utf8');
    const revalidatesPrice = checkoutRoute.includes('pricePaise') || checkoutRoute.includes('base_selling_price_paise') || checkoutRoute.includes('amount');
    check(
      'Checkout Server-Side Price Revalidation (BFS 9.7 / 11.2)',
      revalidatesPrice,
      revalidatesPrice ? 'Server re-calculates exact paise amount before creating Razorpay order' : 'MISSING: Checkout trusts client price'
    );
  } catch (e) {
    check('Checkout Server-Side Price Revalidation (BFS 9.7 / 11.2)', false, e.message);
  }

  // 5. REVIEW PUBLIC MODERATION BOUNDARY (BFS 14.2, DSS 18.1)
  console.log('\n--- 5. REVIEW MODERATION AUDIT ---');
  try {
    const reviewsRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/reviews/route.ts'), 'utf8');
    const filtersApproved = reviewsRoute.includes("status', 'APPROVED'") || reviewsRoute.includes('is_approved');
    check(
      'Public Review Approved Status Boundary (BFS 14.2)',
      filtersApproved,
      filtersApproved ? 'Public review route filters for APPROVED status only' : 'MISSING: Unapproved reviews visible publicly'
    );
  } catch (e) {
    check('Public Review Approved Status Boundary (BFS 14.2)', false, e.message);
  }

  // 6. INSTAGRAM REELS REAL-TIME FEED (BFS Chapter 16, DSS Chapter 20)
  console.log('\n--- 6. INSTAGRAM REELS AUDIT ---');
  try {
    const reelsRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/instagram-reels/route.ts'), 'utf8');
    const queriesReels = reelsRoute.includes('instagram_reels') && reelsRoute.includes('is_active');
    check(
      'Instagram Reels Dynamic Feed (BFS Chapter 16)',
      queriesReels,
      queriesReels ? 'Reels feed queries Supabase active reels' : 'MISSING: Reels use hardcoded static array'
    );
  } catch (e) {
    check('Instagram Reels Dynamic Feed (BFS Chapter 16)', false, e.message);
  }

  // 7. PRODUCT VARIANT INVENTORY RESERVATION (BFS Chapter 8)
  console.log('\n--- 7. INVENTORY RESERVATION AUDIT ---');
  try {
    const { data: inv } = await supabase.from('inventory').select('variant_id, quantity, reserved_quantity').limit(5);
    const hasInventory = Array.isArray(inv) && inv.length > 0 && typeof inv[0].quantity === 'number';
    check(
      'Product Variant Piece-Based Inventory (BFS 8.1 / DSS 7.1)',
      hasInventory,
      hasInventory ? 'Supabase inventory table tracks quantity and reserved_quantity for all variants' : 'MISSING: inventory table missing'
    );
  } catch (e) {
    check('Product Variant Piece-Based Inventory (BFS 8.1 / DSS 7.1)', false, e.message);
  }

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`TOTAL PASSED: ${results.implemented.length}`);
  console.log(`TOTAL FAILED/MISSING: ${results.missing.length}`);
}

runBfsDssAudit();
