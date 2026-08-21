import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 6-digit OTP code.' },
        { status: 400 }
      );
    }

    // Check OTP (accept demo '123456' or any 6-digit code for testing)
    return NextResponse.json({
      success: true,
      token: `nsh_jwt_patron_${Date.now()}`,
      user: {
        id: 'usr_ananya_2021',
        name: 'Ananya S. Rao',
        phone: phone || '+91 98860 12345',
        email: 'ananya.rao@example.com',
        tier: 'Royal Loom Patron',
        member_since: 'October 2021',
      },
      message: 'Authentication successful. Welcome back to Neelsareehouse.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'OTP verification failed.' },
      { status: 500 }
    );
  }
}
