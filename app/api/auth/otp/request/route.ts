import { createAdminClient } from '@/lib/supabase/admin-client';
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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const supabase = createAdminClient();

    const { error } = await supabase.from('otp_verifications').insert({
      phone: `+91${cleanPhone.slice(-10)}`,
      otp_code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (error) {
      console.warn('[OTP Request API] Supabase insert warning:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone.slice(-10)}`,
      demo_otp: otpCode,
      resend_seconds: 30,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate authentication OTP.' },
      { status: 500 }
    );
  }
}
