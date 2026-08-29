import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'admin_inventory_matrix';
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const supabase = createAdminClient();

  // 1. Fetch existing inventory records with all variant and product metadata
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product_variants (
        id,
        sku,
        price_paise,
        mrp_paise,
        colors ( name, hex_code ),
        product_variant_media ( url, is_primary, display_order ),
        products (
          id,
          title,
          slug,
          weavings ( name ),
          fabrics ( name ),
          occasions ( name ),
          zari_specifications ( name )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Admin Inventory GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = { inventory: inventory || [] };
  setCache(cacheKey, payload, 30);
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { variant_id, product_id, sku, change_quantity, quantity_delta, new_quantity } = body;

  let targetVariantId = variant_id;
  if (!targetVariantId && sku) {
    const { data: v } = await supabase.from('product_variants').select('id').eq('sku', sku).maybeSingle();
    targetVariantId = v?.id;
  }
  if (!targetVariantId && product_id) {
    const { data: v } = await supabase.from('product_variants').select('id').eq('product_id', product_id).maybeSingle();
    targetVariantId = v?.id;
  }

  if (targetVariantId) {
    let finalQty = 0;
    if (new_quantity !== undefined) {
      finalQty = Math.max(0, Number(new_quantity));
    } else {
      const delta = change_quantity ?? quantity_delta ?? 0;
      const { data: currentInv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('variant_id', targetVariantId)
        .maybeSingle();
      finalQty = Math.max(0, (currentInv?.quantity || 0) + delta);
    }

    await supabase
      .from('inventory')
      .upsert({
        variant_id: targetVariantId,
        quantity: finalQty,
        updated_at: new Date().toISOString(),
      });

    invalidateCache('admin_inventory_matrix');
    invalidateCache('storefront_products_');
    invalidateCache('pdp_product_');

    return NextResponse.json({ success: true, new_quantity: finalQty });
  }

  invalidateCache('admin_inventory_matrix');
  return NextResponse.json({ success: true, message: 'Stock update processed' });
}
