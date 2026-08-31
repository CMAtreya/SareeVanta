import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'admin_orders_list';
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( name, email, phone ),
      order_items (
        *,
        product_variants (
          id,
          sku,
          colors ( name, hex_code ),
          product_variant_media ( url, is_primary, display_order ),
          products (
            id,
            title,
            slug,
            weavings ( name ),
            fabrics ( name ),
            zari_specifications ( name )
          )
        )
      ),
      order_delivery_addresses ( * ),
      shipments ( * )
    `)
    .order('placed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = { orders: orders || [] };
  setCache(cacheKey, payload, 30);
  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { order_id, order_status, payment_status } = body;

  if (!order_id) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
  }

  const updates: any = {};
  if (order_status) {
    updates.order_status = order_status;
    if (order_status === 'PROCESSING') updates.processing_started_at = new Date().toISOString();
  }
  if (payment_status) updates.payment_status = payment_status;

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', order_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('admin_orders_list');
  return NextResponse.json({ success: true, message: 'Order status updated successfully' });
}
