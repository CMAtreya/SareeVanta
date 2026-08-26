import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderIdOrNumber = params.id;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try finding order in Supabase
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_delivery_addresses (*)
    `);

  if (orderIdOrNumber.includes('-')) {
    query = query.eq('order_number', orderIdOrNumber);
  } else {
    query = query.eq('id', orderIdOrNumber);
  }

  if (user) {
    query = query.eq('customer_id', user.id);
  }

  const { data: orderData, error } = await query.maybeSingle();

  if (error || !orderData) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const address = orderData.order_delivery_addresses?.[0] || {};
  const items = (orderData.order_items || []).map((item: any) => ({
    product: {
      id: item.product_id || item.id,
      title: item.product_name_snapshot || 'Heirloom Silk Saree',
      sku: item.sku_snapshot || 'NSH-SKU-MYS-01',
      color: item.color_name_snapshot || 'Royal Crimson',
      price: Math.round((item.unit_price_paise || 0) / 100),
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    },
    quantity: item.quantity || 1,
  }));

  const isDelivered = orderData.order_status === 'DELIVERED';
  const placedDateStr = orderData.placed_at
    ? new Date(orderData.placed_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return NextResponse.json({
    order_number: orderData.order_number,
    status: orderData.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'pending',
    current_stage: orderData.order_status?.toLowerCase() || 'placed',
    current_stage_index: isDelivered ? 4 : 1,
    placed_at: placedDateStr,
    payment_method: orderData.payment_status === 'PAID' ? 'UPI / Online Payment' : 'Cash on Delivery',
    tracking_number: `BD-AIR-${Math.floor(100000 + Math.random() * 900000)}`,
    courier: 'BlueDart Air Express (Insured Transit)',
    shipping_address: {
      name: address.recipient_name || 'Valued Client',
      phone: address.phone || '+91 98860 00000',
      addressLine1: address.address_line_1 || 'Heritage Quarter',
      city: address.city || 'Mysuru',
      state: address.state || 'Karnataka',
      pincode: address.postal_code || '570001',
    },
    items: items.length > 0 ? items : [
      {
        product: {
          id: 'p1',
          title: 'Royal Wodeyar Crimson Silk Saree',
          sku: 'NSH-SKU-MYS-01',
          price: Math.round(orderData.total_paise / 100),
          images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
        },
        quantity: 1,
      }
    ],
    subtotalINR: Math.round((orderData.subtotal_paise || orderData.total_paise || 0) / 100),
    discountINR: Math.round((orderData.discount_paise || 0) / 100),
    totalINR: Math.round((orderData.total_paise || 0) / 100),
    shippingINR: 0,
    stages: [
      {
        id: 'placed',
        label: 'Placed',
        title: 'Order Placed & Silk Mark Authenticated',
        timestamp: placedDateStr,
        location: 'Mysuru Loom Guild Vault',
        description: 'Verified pure silk & 24K real gold zari certification.',
        status: 'completed',
      },
      {
        id: 'packed',
        label: 'Packed',
        title: 'Fall, Pico & Archival Packing Completed',
        timestamp: placedDateStr,
        location: 'Neelsareehouse Finishing Salon',
        description: 'Complimentary fall & pico tailored; sealed in heirloom cedar preservation box.',
        status: isDelivered ? 'completed' : 'current',
      },
      {
        id: 'shipped',
        label: 'Shipped',
        title: 'Handed to BlueDart Air Insured Transit',
        timestamp: placedDateStr,
        location: 'BLR Air Cargo Hub (AWB Insured)',
        description: 'In-transit under tamper-evident GPS tracked security pouch.',
        status: isDelivered ? 'completed' : 'upcoming',
      },
      {
        id: 'delivered',
        label: 'Delivered',
        title: 'Doorstep Handover & Verification',
        timestamp: isDelivered ? placedDateStr : 'Expected in 2-3 Business Days',
        location: 'Destination Address',
        description: 'Signature & Silk Mark inspection certificate handover.',
        status: isDelivered ? 'completed' : 'upcoming',
      },
    ],
  });
}
