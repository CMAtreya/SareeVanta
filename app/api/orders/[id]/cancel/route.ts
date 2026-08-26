import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: orderId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { reason = 'Customer requested cancellation' } = body;

  // 1. Fetch order details
  const { data: order } = await supabase
    .from('orders')
    .select('id, customer_id, order_status')
    .eq('id', orderId)
    .single();

  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
  }

  // 2. Validate cancellation window (cannot cancel if already SHIPPED or DELIVERED)
  if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.order_status)) {
    return NextResponse.json({
      error: `Order cannot be cancelled in status ${order.order_status}`,
    }, { status: 400 });
  }

  // 3. Update Order Status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      order_status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 4. Return items to stock inventory
  const { data: items } = await supabase
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId);

  if (items) {
    for (const item of items) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('variant_id', item.variant_id)
        .single();

      if (inv) {
        await supabase
          .from('inventory')
          .update({ quantity: inv.quantity + item.quantity })
          .eq('variant_id', item.variant_id);
      }
    }
  }

  return NextResponse.json({ success: true, message: 'Order cancelled successfully and stock restored' });
}
