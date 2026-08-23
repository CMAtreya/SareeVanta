import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid mobile number.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Mobile number must contain at least 10 digits.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone.slice(-10)}`,
      demo_otp: '123456',
      resend_seconds: 30,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate authentication OTP.' },
      { status: 500 }
    );
  }
}
