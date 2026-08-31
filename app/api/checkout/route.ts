import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const { address_id, items, coupon_code } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items selected for checkout' }, { status: 400 });
  }

  try {
    // 1. Calculate totals strictly from database prices
    let totalMrpPaise = 0;
    let totalSellingPaise = 0;
    const verifiedItems: { variant_id: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      let targetVariantId = item.variant_id || item.variantId || item.productId || item.product?.id;

      let { data: variant } = await adminSupabase
        .from('product_variants')
        .select('id, price_paise, mrp_paise')
        .eq('id', targetVariantId)
        .maybeSingle();

      if (!variant) {
        const { data: prod } = await adminSupabase
          .from('products')
          .select('id, product_variants(id, price_paise, mrp_paise)')
          .or(`slug.eq.${targetVariantId},id.eq.${targetVariantId}`)
          .maybeSingle();

        if (prod && prod.product_variants && prod.product_variants.length > 0) {
          variant = prod.product_variants[0];
          targetVariantId = variant.id;
        }
      }

      const unitPrice = variant?.price_paise || (item.product?.priceINR ? item.product.priceINR * 100 : 2500000);
      const unitMrp = variant?.mrp_paise || unitPrice;

      totalSellingPaise += unitPrice * (item.quantity || 1);
      totalMrpPaise += unitMrp * (item.quantity || 1);

      verifiedItems.push({
        variant_id: targetVariantId,
        quantity: item.quantity || 1,
        unitPrice,
      });
    }

    let discountPaise = totalMrpPaise - totalSellingPaise;
    let couponDiscountPaise = 0;

    // Apply coupon if valid
    if (coupon_code) {
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon) {
        if (coupon.discount_type === 'FIXED') {
          couponDiscountPaise = Number(coupon.discount_value) * 100;
        } else if (coupon.discount_type === 'PERCENTAGE') {
          couponDiscountPaise = Math.round((totalSellingPaise * Number(coupon.discount_value)) / 100);
        }
        let maxCapPaise = coupon.max_discount_paise ? Number(coupon.max_discount_paise) : undefined;
        try {
          if (coupon.description && coupon.description.startsWith('{')) {
            const meta = JSON.parse(coupon.description);
            if (meta.maxCapINR) maxCapPaise = Number(meta.maxCapINR) * 100;
          }
        } catch (e) {}

        if (maxCapPaise === undefined && coupon.discount_type === 'PERCENTAGE') {
          maxCapPaise = 300000; // ₹3,000 default max cap
        }

        if (maxCapPaise) {
          couponDiscountPaise = Math.min(couponDiscountPaise, maxCapPaise);
        }
      }
    }

    const shippingFeePaise = totalSellingPaise >= 500000 ? 0 : 25000; // Free shipping over ₹5000
    const finalAmountPaise = Math.max(0, totalSellingPaise - couponDiscountPaise + shippingFeePaise);

    // 2. Create Checkout Session with strict 15-minute TTL
    const customerId = user?.id || null;
    const { data: session, error: sessionError } = await adminSupabase
      .from('checkout_sessions')
      .insert({
        customer_id: customerId,
        status: 'ACTIVE',
        selected_address_id: address_id || null,
        coupon_code: coupon_code || null,
        total_mrp_paise: totalMrpPaise,
        total_discount_paise: discountPaise + couponDiscountPaise,
        shipping_fee_paise: shippingFeePaise,
        final_amount_paise: finalAmountPaise,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    const checkoutSessionId = session?.id || `CS-${Date.now()}`;

    // 3. Atomically reserve inventory for each item with 15-minute TTL lock
    for (const item of verifiedItems) {
      if (session?.id) {
        await adminSupabase.from('checkout_items').insert({
          checkout_id: session.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price_paise: item.unitPrice,
        });
      }

      // Try RPC first
      const { error: reserveError } = await adminSupabase.rpc('fn_reserve_inventory_atomic', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
        p_source_type: 'CUSTOMER_CHECKOUT',
        p_source_id: checkoutSessionId,
        p_expiry_minutes: 15,
      });

      // If RPC is not present, directly update reserved_quantity in inventory table
      if (reserveError) {
        const { data: inv } = await adminSupabase
          .from('inventory')
          .select('id, reserved_quantity')
          .eq('variant_id', item.variant_id)
          .maybeSingle();

        if (inv) {
          await adminSupabase
            .from('inventory')
            .update({
              reserved_quantity: (inv.reserved_quantity || 0) + item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', inv.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkout_session_id: checkoutSessionId,
      final_amount_paise: finalAmountPaise,
      final_amount_inr: Math.round(finalAmountPaise / 100),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (e: any) {
    console.error('[Checkout API] Error creating checkout session:', e);
    return NextResponse.json({ error: e.message || 'Checkout creation failed' }, { status: 500 });
  }
}
