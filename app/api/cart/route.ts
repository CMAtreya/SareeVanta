import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  // Return demo cart items shape
  const items = [
    {
      product: products[0],
      quantity: 1,
      blouseOption: 'Unstitched Standard (Free)',
      tailoringExtraINR: 0,
    },
    {
      product: products[1],
      quantity: 1,
      blouseOption: 'Custom Tailored Bespoke (+₹1,800)',
      tailoringExtraINR: 1800,
    },
  ];

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.priceINR + item.tailoringExtraINR) * item.quantity,
    0
  );

  return NextResponse.json({
    items,
    count: items.length,
    subtotalINR: subtotal,
    shippingINR: 0,
    currency: 'INR',
    estimatedDelivery: '2-4 business days via Insured Express Air Courier',
  });
}
