import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Admin Coupons GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: coupons || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const {
    code,
    title,
    discount_type,
    discount_value,
    max_discount_cap_inr = 3000,
    min_order_amount_inr = 0,
    max_usage_limit = 500,
    starts_at,
    expires_at,
    is_active = true,
  } = body;

  if (!code || !discount_type || discount_value === undefined) {
    return NextResponse.json(
      { error: 'Code, discount_type, and discount_value are mandatory.' },
      { status: 400 }
    );
  }

  try {
    const cleanCode = code.trim().toUpperCase();
    const isFixed = discount_type === 'FIXED' || discount_type === 'FIXED_AMOUNT';
    const finalType = isFixed ? 'FIXED' : 'PERCENTAGE';
    const descriptionText = JSON.stringify({
      title: title || `Privilege Promo ${cleanCode}`,
      maxCapINR: Number(max_discount_cap_inr) || 0,
    });

    const { data: coupon, error } = await supabase
      .from('coupons')
      .upsert({
        code: cleanCode,
        discount_type: finalType,
        discount_value: Number(discount_value),
        min_order_amount_paise: Math.round((Number(min_order_amount_inr) || 0) * 100),
        max_redemptions: Number(max_usage_limit) || 500,
        starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
        expires_at: expires_at ? new Date(expires_at).toISOString() : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        description: descriptionText,
        is_active: Boolean(is_active),
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Admin Coupons POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateCache('coupons');
    invalidateCache('public_coupons');

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error('[Admin Coupons POST] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to save coupon' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { coupon_id, is_active } = body;

  if (!coupon_id) {
    return NextResponse.json({ error: 'coupon_id is required' }, { status: 400 });
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .update({ is_active: Boolean(is_active) })
    .eq('id', coupon_id)
    .select('*')
    .single();

  if (error) {
    console.error('[Admin Coupons PATCH] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('coupons');
  invalidateCache('public_coupons');

  return NextResponse.json({ success: true, coupon });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Admin Coupons DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('coupons');
  invalidateCache('public_coupons');

  return NextResponse.json({ success: true });
}
