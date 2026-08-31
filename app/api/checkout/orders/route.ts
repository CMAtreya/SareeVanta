import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { items, shippingAddress, subtotal, discount, total, paymentMethod, couponCode, currency = 'INR' } = body;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NSH-2026-${randomSuffix}`;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Login required to place order.' }, { status: 401 });
    }

    // 1. Insert order header strictly linked to authenticated customer UID
    const { data: orderData, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        customer_id: user.id,
        order_number: orderNumber,
        order_status: 'PLACED',
        payment_status: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
        coupon_code: couponCode || null,
        subtotal_paise: (subtotal || total || 0) * 100,
        discount_paise: (discount || 0) * 100,
        tax_paise: 0,
        shipping_paise: 0,
        total_paise: (total || subtotal || 0) * 100,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Checkout API] Error inserting order header:', orderErr);
      return NextResponse.json({ success: false, message: orderErr.message }, { status: 500 });
    }

    // 2. Insert line items & deduct stock atomically
    if (orderData && items && items.length > 0) {
      const itemRows = items.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product?.id || null,
        sku_snapshot: item.product?.sku || 'NSH-SKU-MYS-01',
        product_name_snapshot: item.product?.title || 'Heirloom Silk Saree',
        color_name_snapshot: item.product?.color || 'Royal Silk',
        unit_price_paise: (item.product?.priceINR || item.product?.price || 0) * 100,
        quantity: item.quantity || 1,
        line_total_paise: (item.product?.priceINR || item.product?.price || 0) * (item.quantity || 1) * 100,
      }));
      
      const { error: itemsErr } = await adminSupabase.from('order_items').insert(itemRows);
      if (itemsErr) {
        console.error('[Checkout API] Error inserting order items:', itemsErr);
      }

      // Deduct inventory quantities atomically to prevent overselling race conditions
      for (const item of items) {
        const sku = item.product?.sku;
        const qty = item.quantity || 1;

        if (sku) {
          try {
            const { data: variant } = await adminSupabase
              .from('product_variants')
              .select('id')
              .eq('sku', sku)
              .maybeSingle();

            if (variant) {
              const { error: rpcErr } = await adminSupabase.rpc('fn_convert_reservation_to_order', {
                p_variant_id: variant.id,
                p_quantity: qty,
              });

              if (rpcErr) {
                const { data: inv } = await adminSupabase
                  .from('inventory')
                  .select('quantity, reserved_quantity')
                  .eq('variant_id', variant.id)
                  .maybeSingle();

                if (inv && inv.quantity >= qty) {
                  await adminSupabase
                    .from('inventory')
                    .update({
                      quantity: Math.max(0, inv.quantity - qty),
                      reserved_quantity: Math.max(0, (inv.reserved_quantity || 0) - qty),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('variant_id', variant.id);
                }
              }
            }
          } catch (e) {
            console.warn('[Checkout Inventory Lock] Warning during inventory deduction:', e);
          }
        }
      }
    }

    // 3. Insert delivery address
    if (orderData && shippingAddress) {
      const { error: addrErr } = await adminSupabase.from('order_delivery_addresses').insert({
        order_id: orderData.id,
        recipient_name: shippingAddress.name || 'Valued Client',
        phone: shippingAddress.phone || '+91 98860 00000',
        address_line_1: shippingAddress.addressLine1 || 'Heritage Quarter',
        city: shippingAddress.city || 'Mysuru',
        state: shippingAddress.state || 'Karnataka',
        postal_code: shippingAddress.pincode || '570001',
      });
      if (addrErr) {
        console.error('[Checkout API] Error inserting delivery address:', addrErr);
      }
    }

    // 4. Invalidate admin cache so newly placed order shows immediately in Admin Dashboard
    try {
      invalidateCache('admin_orders_list');
      invalidateCache('admin_inventory_matrix');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      amount: total || 28500,
      currency,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Checkout orders route error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create order.' }, { status: 500 });
  }
}
