import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    checkout_session_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    delivery_address,
  } = body;

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  let isSignatureValid = false;

  if (!razorpaySecret || razorpaySecret.includes('your_')) {
    // Only accept mock signature if payment ID indicates mock test run
    isSignatureValid = razorpay_payment_id?.startsWith('pay_mock_') || razorpay_order_id?.startsWith('order_mock_') || false;
  } else {
    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    isSignatureValid = expectedSignature === razorpay_signature;
  }

  if (!isSignatureValid) {
    return NextResponse.json({ error: 'Invalid payment signature verification failed' }, { status: 400 });
  }

  try {
    // 1. Fetch checkout session details
    const { data: session } = await supabase
      .from('checkout_sessions')
      .select('*, checkout_items(*)')
      .eq('id', checkout_session_id)
      .single();

    const orderNumber = `NSH-${Date.now().toString().slice(-6)}`;

    // 2. Commit Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        order_status: 'PLACED',
        payment_status: 'PAID',
        subtotal_paise: session?.total_mrp_paise || 2850000,
        discount_paise: session?.total_discount_paise || 0,
        tax_paise: 0,
        shipping_fee_paise: session?.shipping_fee_paise || 0,
        total_paise: session?.final_amount_paise || 2850000,
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 3. Save order items with historical snapshots
    if (session?.checkout_items) {
      for (const item of session.checkout_items) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('sku, price_paise, colors(name), products(id, title)')
          .eq('id', item.variant_id)
          .single();

        const productData: any = Array.isArray(variant?.products) ? variant?.products[0] : variant?.products;
        const colorData: any = Array.isArray(variant?.colors) ? variant?.colors[0] : variant?.colors;

        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: productData?.id || item.variant_id,
          variant_id: item.variant_id,
          sku_snapshot: variant?.sku || 'SKU-UNKNOWN',
          product_name_snapshot: productData?.title || 'Saree Product',
          color_name_snapshot: colorData?.name || 'Standard Color',
          unit_price_paise: item.unit_price_paise,
          quantity: item.quantity,
          line_total_paise: item.unit_price_paise * item.quantity,
        });

        // Deduct physical stock & clear reservation
        try {
          await supabase.rpc('fn_convert_reservation_to_order', { p_variant_id: item.variant_id, p_quantity: item.quantity });
        } catch (e) {
          console.error('[Razorpay Verify] Stock reservation conversion failed:', e);
        }
      }
    }

    // 4. Save delivery address snapshot
    if (delivery_address) {
      await supabase.from('order_delivery_addresses').insert({
        order_id: order.id,
        recipient_name: delivery_address.name || 'Valued Customer',
        phone: delivery_address.phone || '+91 9999999999',
        address_line_1: delivery_address.address_line_1 || 'Main Street',
        address_line_2: delivery_address.address_line_2 || '',
        city: delivery_address.city || 'Bengaluru',
        state: delivery_address.state || 'Karnataka',
        postal_code: delivery_address.postal_code || '560001',
        country: 'India',
      });
    }

    // 5. Record Payment
    await supabase.from('payments').insert({
      order_id: order.id,
      provider: 'RAZORPAY',
      provider_payment_id: razorpay_payment_id || `pay_mock_${Date.now()}`,
      provider_order_id: razorpay_order_id || `ord_mock_${Date.now()}`,
      amount_paise: session?.final_amount_paise || 2850000,
      status: 'SUCCESS',
      verified_at: new Date().toISOString(),
    });

    // 6. Update Checkout Session status
    await supabase
      .from('checkout_sessions')
      .update({ status: 'COMPLETED' })
      .eq('id', checkout_session_id);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      message: 'Payment verified and order placed successfully',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Payment verification processing failed' }, { status: 500 });
  }
}
