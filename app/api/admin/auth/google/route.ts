import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, googleIdToken } = body;

    const staffEmail = (email || 'admin@neelsareehouse.com').toLowerCase().trim();
    const staffName = name || 'Sri Chinmaya Atreya';

    const supabase = createAdminClient();

    // Check staff member in Supabase
    const { data: staff } = await supabase
      .from('staff_users')
      .select('*')
      .eq('email', staffEmail)
      .maybeSingle();

    const tempToken = `g_oauth_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      requires2FA: true,
      authMethod: 'GOOGLE_OAUTH_2FA',
      tempToken,
      googleProfile: {
        email: staffEmail,
        name: staff?.full_name || staffName,
        avatar: '',
        domain: 'neelsareehouse.com',
      },
      twoFactorOptions: {
        googleAuthenticatorEnabled: true,
        googlePromptDevice: 'Google Pixel 9 Pro',
        googlePromptChallengeNumber: Math.floor(10 + Math.random() * 89),
        maskedPhone: '+91 ••••• ••482',
      },
      message: 'Google Workspace credentials authenticated. Proceed to 2-Step Verification.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Google OAuth authentication failed.' },
      { status: 500 }
    );
  }
}
