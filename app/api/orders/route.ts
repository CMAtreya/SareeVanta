import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: orders, error } = await adminSupabase
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
          product_id,
          sku_snapshot,
          product_name_snapshot,
          color_name_snapshot,
          unit_price_paise,
          quantity,
          line_total_paise,
          product_variants (
            id,
            sku,
            product_variant_media ( url, is_primary, display_order ),
            products (
              id,
              title,
              slug,
              weavings ( name ),
              fabrics ( name )
            )
          )
        ),
        order_delivery_addresses ( recipient_name, city, state, postal_code )
      `)
      .eq('customer_id', user.id)
      .order('placed_at', { ascending: false });

    if (error) {
      console.error('[Orders API] Database query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedOrders = (orders || []).map((o: any) => {
      const isDelivered = o.order_status === 'DELIVERED';
      const isShipped = o.order_status === 'SHIPPED';

      const items = (o.order_items || []).map((item: any) => {
        const pv = item.product_variants;
        const prod = pv?.products;
        const mediaList = Array.isArray(pv?.product_variant_media) ? pv.product_variant_media : [];
        const sorted = [...mediaList].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
        const itemImg = sorted[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
        const weaveName = Array.isArray(prod?.weavings) ? prod.weavings[0]?.name : prod?.weavings?.name || 'Pure Silk';
        const fabricName = Array.isArray(prod?.fabrics) ? prod.fabrics[0]?.name : prod?.fabrics?.name || 'Mulberry Silk';
        const slug = prod?.slug || '';

        return {
          product: {
            id: item.product_id || pv?.id || item.id,
            title: item.product_name_snapshot || prod?.title || 'Handcrafted Silk Saree',
            slug,
            color: item.color_name_snapshot || '',
            weave: weaveName,
            fabric: fabricName,
            priceINR: Math.round((item.unit_price_paise || 0) / 100),
            images: [itemImg],
          },
          quantity: item.quantity || 1,
        };
      });

      return {
        id: o.id,
        order_number: o.order_number || `NSH-${o.id.substring(0, 6)}`,
        orderNumber: o.order_number,
        status: o.order_status,
        status_type: isDelivered ? 'delivered' : isShipped ? 'in_transit' : 'processing',
        payment_method: o.payment_status === 'PAID' ? 'Razorpay UPI' : 'Cash on Delivery',
        paymentStatus: o.payment_status,
        totalINR: Math.round((o.total_paise || 0) / 100),
        item_count: items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
        date: o.placed_at ? new Date(o.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
        placedAt: o.placed_at,
        items,
        shippingAddress: o.order_delivery_addresses?.[0] || null,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (err: any) {
    console.error('[Orders API] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
