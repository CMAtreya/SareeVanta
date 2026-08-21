import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_number, method = 'upi' } = body;

    const paymentId = `pay_nsh_${Date.now()}`;
    const redirectUrl = `/checkout/confirmation?order_number=${encodeURIComponent(
      order_number || 'NSH-2026-8942'
    )}`;

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      order_number,
      method,
      redirect_url: redirectUrl,
      gateway: method === 'upi' ? 'UPI Instant Collect' : 'Razorpay Secure 256-bit',
      status: 'initiated',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to initialize payment gateway.' },
      { status: 500 }
    );
  }
}
