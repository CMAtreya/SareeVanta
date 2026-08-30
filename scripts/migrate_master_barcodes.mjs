import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Migration] Missing Supabase URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('[Migration] Starting Master Barcode & Variant Barcode backfill...');

  // 1. Fetch all products with their variants and colors
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      product_variants (
        id,
        sku,
        barcode,
        colors (
          name,
          hex_code
        )
      )
    `);

  if (prodErr) {
    console.error('[Migration] Failed to fetch products:', prodErr);
    return;
  }

  console.log(`[Migration] Found ${products.length} products to process.`);

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const prod = products[pIdx];
    const variants = prod.product_variants || [];
    
    // Find numeric part from SKU or index
    let skuNum = pIdx + 1;
    if (variants.length > 0 && variants[0]?.sku) {
      const match = variants[0].sku.match(/\d+/);
      if (match) {
        skuNum = parseInt(match[0], 10);
      }
    }

    const masterSku = `NSH-SKU-${String(skuNum).padStart(3, '0')}`;
    const masterBarcode = `890${String(100000000 + skuNum)}`;

    console.log(`\n[Product #${pIdx + 1}] "${prod.title}" -> Master SKU: ${masterSku}, Master Barcode: ${masterBarcode}`);

    // Update master_barcode on products table
    const { error: pUpdateErr } = await supabase
      .from('products')
      .update({ master_barcode: masterBarcode })
      .eq('id', prod.id);

    if (pUpdateErr) {
      console.warn(`  [Warning] Could not update products.master_barcode (column may not exist yet or permissions):`, pUpdateErr.message);
    } else {
      console.log(`  ✓ Updated products.master_barcode = ${masterBarcode}`);
    }

    // Update each variant with color-coded SKU and 2-digit indexed barcode
    for (let vIdx = 0; vIdx < variants.length; vIdx++) {
      const v = variants[vIdx];
      const colorObj = Array.isArray(v.colors) ? v.colors[0] : v.colors;
      const colorName = (colorObj?.name || '').trim();
      const cleanColorCode = colorName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || `${vIdx + 1}`;
      
      const variantSku = `${masterSku}-${cleanColorCode}`;
      const variantBarcode = `${masterBarcode}${String(vIdx + 1).padStart(2, '0')}`;

      const { error: vUpdateErr } = await supabase
        .from('product_variants')
        .update({
          sku: variantSku,
          barcode: variantBarcode,
        })
        .eq('id', v.id);

      if (vUpdateErr) {
        console.error(`  ✗ Failed to update variant ${v.id}:`, vUpdateErr.message);
      } else {
        console.log(`  ✓ Variant ${vIdx + 1} (${colorName || 'Default'}): SKU = ${variantSku}, Barcode = ${variantBarcode}`);
      }
    }
  }

  console.log('\n[Migration] Completed successfully!');
}

runMigration().catch(console.error);
