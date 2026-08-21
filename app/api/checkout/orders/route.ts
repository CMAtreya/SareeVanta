import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, subtotal, discount, total, currency = 'INR' } = body;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NSH-2026-${randomSuffix}`;

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      amount: total || 28500,
      currency,
      status: 'pending',
      shippingAddress,
      itemsCount: items?.length || 1,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create order.' }, { status: 500 });
  }
}
