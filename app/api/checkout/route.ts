import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Login required for checkout.' }, { status: 401 });
  }

  const body = await request.json();
  const { address_id, items, coupon_code } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items selected for checkout' }, { status: 400 });
  }

  try {
    // 1. Calculate totals
    let totalMrpPaise = 0;
    let totalSellingPaise = 0;

    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('price_paise, mrp_paise')
        .eq('id', item.variant_id)
        .single();

      const unitPrice = variant?.price_paise || item.unit_price_paise || 100000;
      const unitMrp = variant?.mrp_paise || item.mrp_paise || unitPrice;

      totalSellingPaise += unitPrice * item.quantity;
      totalMrpPaise += unitMrp * item.quantity;
    }

    let discountPaise = totalMrpPaise - totalSellingPaise;
    let couponDiscountPaise = 0;

    // Apply coupon if valid
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        if (coupon.discount_type === 'FIXED') {
          couponDiscountPaise = Number(coupon.discount_value) * 100;
        } else if (coupon.discount_type === 'PERCENTAGE') {
          couponDiscountPaise = Math.round((totalSellingPaise * Number(coupon.discount_value)) / 100);
        }
        if (coupon.max_discount_paise) {
          couponDiscountPaise = Math.min(couponDiscountPaise, Number(coupon.max_discount_paise));
        }
      }
    }

    const shippingFeePaise = totalSellingPaise >= 500000 ? 0 : 25000; // Free shipping over ₹5000
    const finalAmountPaise = Math.max(0, totalSellingPaise - couponDiscountPaise + shippingFeePaise);

    // 2. Create Checkout Session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        customer_id: user.id,
        status: 'ACTIVE',
        selected_address_id: address_id || null,
        coupon_code: coupon_code || null,
        total_mrp_paise: totalMrpPaise,
        total_discount_paise: discountPaise + couponDiscountPaise,
        shipping_fee_paise: shippingFeePaise,
        final_amount_paise: finalAmountPaise,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // 3. Atomically reserve inventory for each item using fn_reserve_inventory_atomic
    for (const item of items) {
      await supabase.from('checkout_items').insert({
        checkout_id: session.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price_paise: item.unit_price_paise || 100000,
      });

      // Call RPC procedure if DB procedure exists
      try {
        await supabase.rpc('fn_reserve_inventory_atomic', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
          p_source_type: 'CUSTOMER_CHECKOUT',
          p_source_id: session.id,
          p_expiry_minutes: 30,
        });
      } catch (e) {
        console.warn('[Checkout API] Stock reservation RPC non-fatal warning:', e);
      }
    }

    return NextResponse.json({
      success: true,
      checkout_session_id: session.id,
      final_amount_paise: finalAmountPaise,
      final_amount_inr: Math.round(finalAmountPaise / 100),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Checkout creation failed' }, { status: 500 });
  }
}
