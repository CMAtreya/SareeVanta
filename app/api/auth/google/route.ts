import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, avatar, googleId } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google account email address.' },
        { status: 400 }
      );
    }

    const userName = name || email.split('@')[0].replace(/[._]/g, ' ');
    const userPayload = {
      id: `usr_google_${Date.now()}`,
      googleId: googleId || `gid_${Math.random().toString(36).slice(2, 10)}`,
      name: userName,
      email: email.toLowerCase(),
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7A1C30&color=FAF3E4`,
      tier: 'Royal Loom Patron',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      authMethod: 'Google OAuth 2.0',
      welcomeDiscountCode: 'ROYAL10',
      welcomeDiscountPercent: 10,
    };

    const response = NextResponse.json({
      success: true,
      message: `Signed in with Google as ${userName}`,
      user: userPayload,
      token: `nsh_jwt_patron_google_${Date.now()}`,
    });

    // Set patron auth cookie for 30 days
    response.cookies.set('neel_user_session', 'authenticated', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Google OAuth failed' },
      { status: 500 }
    );
  }
}
