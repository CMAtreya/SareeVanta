import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderNumber = params.id;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 1);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return NextResponse.json({
    order_number: orderNumber,
    status: 'paid',
    current_stage: 'out_for_delivery', // 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered'
    current_stage_index: 3, // 0 to 4
    payment_method: 'UPI Instant Verified (GPay)',
    payment_id: `pay_nsh_${Date.now()}`,
    tracking_number: `BD-AIR-78294-${orderNumber.slice(-4) || '8942'}`,
    courier: 'BlueDart Air Express (Insured Security Transit)',
    estimated_delivery: formattedDelivery,
    shipping_address: {
      name: 'Ananya S. Rao',
      phone: '+91 98860 12345',
      addressLine1: '42, Royal Palms Residency, Sayyaji Rao Road',
      addressLine2: 'Near Mysore Palace North Gate',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '570001',
    },
    items: [
      {
        product: products[0],
        quantity: 1,
      },
      {
        product: products[1],
        quantity: 1,
      },
    ],
    subtotalINR: 94300,
    discountINR: 9430,
    totalINR: 84870,
    shippingINR: 0,
    placed_at: '20 Aug 2026, 10:45 AM',
    stages: [
      {
        id: 'placed',
        label: 'Placed',
        title: 'Order Placed & Silk Mark Authenticated',
        timestamp: '20 Aug 2026, 10:45 AM',
        location: 'Mysuru Loom Guild Vault',
        description: 'Verified 100% pure silk and 24K real gold zari certification with Central Silk Board registry.',
        status: 'completed',
      },
      {
        id: 'packed',
        label: 'Packed',
        title: 'Fall, Pico & Archival Muslin Packing Completed',
        timestamp: '20 Aug 2026, 03:20 PM',
        location: 'Neelsareehouse Finishing Salon',
        description: 'Complimentary fall & pico tailored; sealed in heirloom cedar preservation box with moisture absorbers.',
        status: 'completed',
      },
      {
        id: 'shipped',
        label: 'Shipped',
        title: 'Dispatched via Insured Air Courier',
        timestamp: '21 Aug 2026, 08:30 AM',
        location: 'BlueDart Air Cargo Hub, Bengaluru',
        description: 'Package in transit under GPS-monitored high-security diplomatic pouch.',
        status: 'completed',
      },
      {
        id: 'out_for_delivery',
        label: 'Out for Delivery',
        title: 'Out for Delivery to Your Doorstep',
        timestamp: 'Today, 09:15 AM',
        location: 'Local Mysuru Courier Station',
        description: 'Courier executive assigned (K. Ramesh, +91 94480 56789). Secure OTP delivery required.',
        status: 'current',
      },
      {
        id: 'delivered',
        label: 'Delivered',
        title: 'Heirloom Delivered & Patron Handover',
        timestamp: 'Expected today by 06:00 PM',
        location: 'Destination Address',
        description: 'Signature & Silk Mark inspection certificate handover.',
        status: 'upcoming',
      },
    ],
  });
}
