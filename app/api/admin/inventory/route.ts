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
  const { variant_id, change_quantity, reason = 'Manual Admin Stock Adjustment' } = body;

  if (!variant_id || change_quantity === undefined) {
    return NextResponse.json({ error: 'variant_id and change_quantity are required' }, { status: 400 });
  }

  // Fetch current stock
  const { data: currentInv } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('variant_id', variant_id)
    .single();

  const newQty = Math.max(0, (currentInv?.quantity || 0) + change_quantity);

  // Update inventory
  const { error: updateError } = await supabase
    .from('inventory')
    .upsert({
      variant_id,
      quantity: newQty,
      reserved_quantity: 0,
    });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Record audit inventory log
  await supabase.from('inventory_logs').insert({
    variant_id,
    change_quantity,
    reason,
  });

  return NextResponse.json({ success: true, new_quantity: newQty });
}
