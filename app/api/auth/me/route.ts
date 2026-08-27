import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch registered customer record from Supabase public.customers
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  const meta = user.user_metadata || {};
  const fullName = customer?.name || meta.full_name || meta.name || 'Patron';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Valued';
  const lastName = nameParts.slice(1).join(' ') || 'Patron';

  return NextResponse.json({
    id: user.id,
    firstName,
    lastName,
    name: fullName,
    email: user.email || customer?.email || '',
    isEmailVerified: Boolean(user.email_confirmed_at),
    phone: customer?.phone || meta.phone || user.phone || '',
    fullPhone: `+91 ${customer?.phone || meta.phone || '9886012345'}`,
    isPhoneVerified: Boolean(user.phone_confirmed_at),
    avatar: meta.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    memberSince: user.created_at ? new Date(user.created_at).getFullYear().toString() : '2026',
    dob: meta.dob || '',
    anniversary: meta.anniversary || '',
    gender: meta.gender || 'womens_wear',
    completionPercentage: 90,
  });
}
