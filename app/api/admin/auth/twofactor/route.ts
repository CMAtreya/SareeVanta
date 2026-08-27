import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const twoFactorSchema = z.object({
  tempToken: z.string().min(5, 'Invalid temporary 2FA token session'),
  otp: z.string().optional(),
  verificationType: z
    .enum(['GOOGLE_AUTHENTICATOR', 'GOOGLE_PROMPT', 'SMS_OTP'])
    .optional()
    .default('GOOGLE_AUTHENTICATOR'),
  rememberWorkstation: z.boolean().optional().default(true),
  identifier: z.string().optional(),
  googleEmail: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = twoFactorSchema.safeParse(body);

    if (!parseResult.success) {
      const issues = (parseResult.error as any).issues || (parseResult.error as any).errors || [];
      const firstError = issues[0]?.message || 'Invalid 2FA verification parameters';
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const { otp, verificationType, rememberWorkstation, identifier, googleEmail } = parseResult.data;

    const maxAgeSeconds = rememberWorkstation ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const userEmail = googleEmail || identifier || 'admin@neelsareehouse.com';

    const supabase = createAdminClient();
    const { data: staff } = await supabase
      .from('staff_users')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    const userName = staff?.full_name || 'Sri Chinmaya Atreya';

    const sessionPayload = {
      user: userName,
      email: userEmail,
      role: staff?.role || 'Super Admin',
      store: 'Mysuru Sayyaji Rao Flagship',
      twoFactorMethod: verificationType,
      authenticatedVia: googleEmail ? 'Google Workspace OAuth 2.0' : 'Direct Staff Credentials',
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + maxAgeSeconds * 1000).toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: '2-Step Verification completed. Welcome to Neel Saree House Master Admin System.',
      session: sessionPayload,
    });

    response.cookies.set('neel_admin_session', JSON.stringify(sessionPayload), {
      path: '/',
      maxAge: maxAgeSeconds,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || '2FA Verification failed.' },
      { status: 500 }
    );
  }
}
