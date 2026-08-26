import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: coupons || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { code, discount_type, discount_value, min_order_amount_inr = 0, is_active = true } = body;

  if (!code || !discount_type || !discount_value) {
    return NextResponse.json({ error: 'Code, discount_type, and discount_value are required' }, { status: 400 });
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount_paise: Math.round(min_order_amount_inr * 100),
      is_active,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, coupon });
}
