import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { checkout_session_id } = body;

  if (!checkout_session_id) {
    return NextResponse.json({ error: 'checkout_session_id is required' }, { status: 400 });
  }

  const { data: session } = await supabase
    .from('checkout_sessions')
    .select('id, final_amount_paise')
    .eq('id', checkout_session_id)
    .single();

  const amountPaise = session?.final_amount_paise || 2850000;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  // Fallback mode if Razorpay credentials are missing during local testing
  if (!razorpayKeyId || !razorpaySecret || razorpayKeyId.includes('your_')) {
    const mockRazorpayOrderId = `order_mock_${Date.now()}`;
    return NextResponse.json({
      success: true,
      mode: 'MOCK_FALLBACK',
      razorpay_order_id: mockRazorpayOrderId,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: 'rzp_test_mock_key',
      message: 'Razorpay keys not configured. Running in mock fallback testing mode.',
    });
  }

  // Production Razorpay API integration
  try {
    const authHeader = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${checkout_session_id.substring(0, 8)}`,
      }),
    });

    const razorpayOrder = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: razorpayOrder.error?.description || 'Razorpay order creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mode: 'RAZORPAY_LIVE',
      razorpay_order_id: razorpayOrder.id,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Payment gateway connection error' }, { status: 500 });
  }
}
