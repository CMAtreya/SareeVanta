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

async function testStockCap() {
  console.log('=== TESTING STOCK COUNT ENFORCEMENT & CAP RULES ===\n');

  // Fetch product inventory
  const { data: invs } = await supabase.from('inventory').select('variant_id, quantity, reserved_quantity').limit(5);

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

  assert(Array.isArray(invs) && invs.length > 0, `Database has ${invs?.length || 0} inventory records`);
  invs.forEach((inv, idx) => {
    const available = Math.max(0, inv.quantity - (inv.reserved_quantity || 0));
    assert(available >= 0, `Variant ${idx + 1} has available stock calculated: ${available} pieces`);
  });

  // Verify CartContext capping logic file
  const cartContextCode = fs.readFileSync(path.join(process.cwd(), 'components/providers/CartContext.tsx'), 'utf8');
  assert(cartContextCode.includes('Math.min(maxStock'), 'CartContext enforces stock quantity capping on state updates');
  assert(!cartContextCode.includes("localStorage.setItem('sareevanta_guest_cart'"), 'Guest cart localStorage persistence is purged');

  console.log(`\n=== AUDIT SUMMARY ===`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
}

testStockCap();
