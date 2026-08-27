import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, password } = body;

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
    const supabase = createClient();

    // Register with Supabase Auth or insert to customers table
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password || 'SareeVanta@2026',
      options: {
        data: {
          full_name: name.trim(),
          phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '',
        },
      },
    });

    const authUserId = authData?.user?.id || null;

    const { data: customer, error: custError } = await supabase
      .from('customers')
      .insert({
        auth_user_id: authUserId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();

    if (custError) {
      console.warn('[Signup API] Customer DB insert notice:', custError.message);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: customer?.id || authUserId || `nsh_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : '',
      },
      message: 'Heirloom account created successfully! Welcome to Neel Saree House Privilege Club.',
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
      { success: false, message: error?.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
