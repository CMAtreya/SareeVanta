import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, newsletter } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide your full legal name.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const newUserId = `nsh_patron_${Date.now()}`;
    const user = {
      id: newUserId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: `+91 ${cleanPhone.slice(-10)}`,
      city: city || 'Mysuru',
      tier: 'Privilege Guild Member',
      welcomeDiscountCode: 'ROYAL10',
      welcomeDiscountPercent: 10,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      newsletterSubscribed: !!newsletter,
    };

    const response = NextResponse.json({
      success: true,
      user,
      token: `nsh_auth_token_${Date.now()}`,
      message: 'Heirloom account created successfully! Welcome to Neel Saree House Privilege Club.',
    });

    // Set auth cookie
    response.cookies.set('neel_user_session', 'authenticated', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
