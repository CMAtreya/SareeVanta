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
          line_total_paise
        ),
        order_delivery_addresses ( recipient_name, city, state, postal_code )
      `)
      .eq('customer_id', user.id)
      .order('placed_at', { ascending: false });

    if (error) {
      console.error('[Orders API] Database query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Collect product IDs to enrich with real product media if available
    const productIds = Array.from(
      new Set(
        (orders || [])
          .flatMap((o: any) => (o.order_items || []).map((it: any) => it.product_id))
          .filter(Boolean)
      )
    );

    let productMap = new Map<string, any>();
    if (productIds.length > 0) {
      const { data: prods } = await adminSupabase
        .from('products')
        .select(`
          id, slug,
          weavings ( name ),
          fabrics ( name ),
          product_variants (
            product_variant_media ( url, is_primary, display_order )
          )
        `)
        .in('id', productIds);

      (prods || []).forEach((p: any) => {
        const variants = p.product_variants || [];
        const media = variants.flatMap((v: any) => v.product_variant_media || []);
        const sorted = media.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
        const images = sorted.map((m: any) => m.url).filter((u: any) => typeof u === 'string' && u.trim().length > 5);
        productMap.set(p.id, {
          slug: p.slug,
          weave: Array.isArray(p.weavings) ? p.weavings[0]?.name : p.weavings?.name,
          fabric: Array.isArray(p.fabrics) ? p.fabrics[0]?.name : p.fabrics?.name,
          images,
        });
      });
    }

    const formattedOrders = (orders || []).map((o: any) => {
      const isDelivered = o.order_status === 'DELIVERED';
      const isShipped = o.order_status === 'SHIPPED';

      const items = (o.order_items || []).map((item: any) => {
        const enriched = item.product_id ? productMap.get(item.product_id) : null;
        const realImages = enriched?.images || [];
        const weaveName = enriched?.weave || 'Handloom Silk';
        const fabricName = enriched?.fabric || 'Pure Silk';
        const slug = enriched?.slug || '';

        return {
          product: {
            id: item.product_id || item.id,
            title: item.product_name_snapshot || 'Handcrafted Silk Saree',
            slug,
            color: item.color_name_snapshot || '',
            weave: weaveName,
            fabric: fabricName,
            priceINR: Math.round((item.unit_price_paise || 0) / 100),
            images: realImages,
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
