import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (error || !customer) {
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Valued Patron',
          email: user.email || '',
          phone: user.phone || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name || 'Valued Patron',
        email: customer.email || user.email,
        phone: customer.phone || '',
        avatarUrl: customer.avatar_url || '',
        created_at: customer.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, avatarUrl } = body;

    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatarUrl) updates.avatar_url = avatarUrl;

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select('*')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCustomer,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
