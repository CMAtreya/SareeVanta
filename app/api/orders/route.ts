import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_status,
      payment_status,
      total_paise,
      placed_at,
      order_items (
        id,
        sku_snapshot,
        product_name_snapshot,
        color_name_snapshot,
        unit_price_paise,
        quantity,
        line_total_paise
      ),
      order_delivery_addresses ( recipient_name, city, state, postal_code )
    `)
    .eq('customer_id', user.id)
    .order('placed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedOrders = (orders || []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.order_status,
    paymentStatus: o.payment_status,
    totalINR: Math.round(o.total_paise / 100),
    placedAt: o.placed_at,
    items: o.order_items || [],
    shippingAddress: o.order_delivery_addresses?.[0] || null,
  }));

  return NextResponse.json({ orders: formattedOrders });
}
