import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google account email address.' },
        { status: 400 }
      );
    }

    const userName = name || email.split('@')[0].replace(/[._]/g, ' ');
    const cleanEmail = email.toLowerCase().trim();

    const supabase = createClient();
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    let customerRecord = customer;
    if (!customerRecord) {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          name: userName,
          email: cleanEmail,
          avatar_url: avatar || '',
          created_at: new Date().toISOString(),
        })
        .select('*')
        .maybeSingle();
      customerRecord = newCust;
    }

    const userPayload = {
      id: customerRecord?.id || `usr_${Date.now()}`,
      name: customerRecord?.name || userName,
      email: cleanEmail,
      avatar: customerRecord?.avatar_url || avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7A1C30&color=FAF3E4`,
      tier: 'Royal Loom Patron',
      authMethod: 'Google OAuth 2.0',
    };

    const response = NextResponse.json({
      success: true,
      message: `Signed in with Google as ${userName}`,
      user: userPayload,
      token: `nsh_jwt_patron_google_${Date.now()}`,
    });

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
