import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  const mockOrders = [
    {
      order_number: 'NSH-2026-8942',
      date: '20 Aug 2026',
      status: 'Out for Delivery',
      status_type: 'in_transit',
      payment_method: 'UPI Instant Verified',
      totalINR: 84870,
      item_count: 2,
      can_return: false,
      items: [
        {
          product: products[0],
          quantity: 1,
          blouseOption: 'Unstitched Standard (Free)',
        },
        {
          product: products[1],
          quantity: 1,
          blouseOption: 'Custom Tailored Bespoke (+₹1,800)',
        },
      ],
    },
    {
      order_number: 'NSH-2026-7419',
      date: '12 Aug 2026',
      status: 'Delivered',
      status_type: 'delivered',
      delivered_date: '15 Aug 2026',
      payment_method: 'Credit Card (HDFC Visa)',
      totalINR: 42000,
      item_count: 1,
      can_return: true, // within 7-day window
      items: [
        {
          product: products[2],
          quantity: 1,
          blouseOption: 'Unstitched Standard (Free)',
        },
      ],
    },
    {
      order_number: 'NSH-2026-6102',
      date: '18 Jul 2026',
      status: 'Delivered',
      status_type: 'delivered',
      delivered_date: '21 Jul 2026',
      payment_method: 'Netbanking (ICICI)',
      totalINR: 31500,
      item_count: 1,
      can_return: false, // past 7 days
      items: [
        {
          product: products[3],
          quantity: 1,
          blouseOption: 'Unstitched Standard (Free)',
        },
      ],
    },
  ];

  return NextResponse.json({
    orders: mockOrders,
    count: mockOrders.length,
  });
}
