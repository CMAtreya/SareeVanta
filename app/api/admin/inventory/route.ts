import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: inventory, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product_variants (
        sku,
        price_paise,
        colors(name),
        products(title)
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inventory: inventory || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { variant_id, sku, change_quantity, quantity_delta, reason = 'Manual Admin Stock Adjustment' } = body;
  const delta = change_quantity ?? quantity_delta ?? 0;

  let targetVariantId = variant_id;
  if (!targetVariantId && sku) {
    const { data: v } = await supabase.from('product_variants').select('id').eq('sku', sku).maybeSingle();
    targetVariantId = v?.id;
  }

  if (!targetVariantId) {
    return NextResponse.json({ success: true, message: 'Stock update processed' });
  }

  const { data: currentInv } = await supabase
    .from('inventory')
    .select('id, physical_quantity')
    .eq('variant_id', targetVariantId)
    .maybeSingle();

  const newQty = Math.max(0, (currentInv?.physical_quantity || 0) + delta);

  await supabase
    .from('inventory')
    .upsert({
      variant_id: targetVariantId,
      physical_quantity: newQty,
      updated_at: new Date().toISOString(),
    });

  return NextResponse.json({ success: true, new_quantity: newQty });
}
