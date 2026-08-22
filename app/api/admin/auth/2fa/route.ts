import { NextResponse } from 'next/server';
import { z } from 'zod';

const twoFactorSchema = z.object({
  tempToken: z.string().min(5, 'Invalid temporary 2FA token session'),
  otp: z.string().regex(/^\d{6}$/, '2FA code must be exactly 6 numerical digits'),
  rememberWorkstation: z.boolean().optional().default(true),
  identifier: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = twoFactorSchema.safeParse(body);

    if (!parseResult.success) {
      const issues = (parseResult.error as any).issues || (parseResult.error as any).errors || [];
      const firstError = issues[0]?.message || 'Invalid 2FA code';
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const { otp, rememberWorkstation, identifier } = parseResult.data;

    // Accept valid 6-digit OTP (demo code '202688' or any valid 6-digit numerical entry)
    if (otp !== '202688' && !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid 2-Factor authentication code.' },
        { status: 401 }
      );
    }

    const maxAgeSeconds = rememberWorkstation ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days vs 1 day
    const sessionPayload = {
      user: identifier || 'Smt. Chandrakala Devi',
      role: 'Master Guild SuperAdmin',
      store: 'Mysuru Sayyaji Rao Flagship',
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + maxAgeSeconds * 1000).toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Entering Admin Console...',
      session: sessionPayload,
    });

    // Set cookie for middleware and server recognition
    response.cookies.set('neel_admin_session', 'authenticated', {
      path: '/',
      maxAge: maxAgeSeconds,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
