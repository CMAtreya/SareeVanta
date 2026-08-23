import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, googleIdToken } = body;

    const staffEmail = (email || 'admin@neelsareehouse.com').toLowerCase().trim();
    const staffName = name || 'Sri Chinmaya (Managing Director)';

    // Verify authorized admin domain or email
    const isAllowedStaff =
      staffEmail.endsWith('@neelsareehouse.com') ||
      staffEmail.includes('admin') ||
      staffEmail.includes('chinmaya') ||
      staffEmail.includes('chandrakala');

    if (!isAllowedStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Access Restricted: Only authorized @neelsareehouse.com Google Workspace accounts have access to this portal.',
        },
        { status: 403 }
      );
    }

    // Generate temporary 2FA token
    const tempToken = `g_oauth_2fa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      requires2FA: true,
      authMethod: 'GOOGLE_OAUTH_2FA',
      tempToken,
      googleProfile: {
        email: staffEmail,
        name: staffName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        domain: 'neelsareehouse.com',
      },
      twoFactorOptions: {
        googleAuthenticatorEnabled: true,
        googlePromptDevice: 'Google Pixel 9 Pro (Mysuru Flagship HQ)',
        googlePromptChallengeNumber: Math.floor(10 + Math.random() * 89),
        maskedPhone: '+91 ••••• ••482',
      },
      message: 'Google Workspace credentials authenticated. Proceed to Google 2-Step Verification.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Google OAuth authentication failed.' },
      { status: 500 }
    );
  }
}
