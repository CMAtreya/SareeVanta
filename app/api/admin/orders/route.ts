import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( name, email, phone ),
      order_items ( * ),
      order_delivery_addresses ( * ),
      shipments ( * )
    `)
    .order('placed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders || [] });
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

  return NextResponse.json({ success: true, message: 'Order status updated successfully' });
}
