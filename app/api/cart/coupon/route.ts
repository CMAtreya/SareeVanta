import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Please enter a valid coupon code.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Query Supabase coupons table exclusively
    const supabase = createClient();
    const { data: dbCoupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[Coupon API] Error querying database:', error);
      return NextResponse.json(
        { valid: false, message: 'Failed to validate coupon with database.' },
        { status: 500 }
      );
    }

    if (dbCoupon) {
      const isFixed = dbCoupon.discount_type === 'FIXED';
      const discountPercent = !isFixed ? Number(dbCoupon.discount_value) : undefined;
      const discountFixedINR = isFixed ? Number(dbCoupon.discount_value) : undefined;
      const description = dbCoupon.description || `Privilege Coupon "${cleanCode}" applied`;

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent,
        discountFixedINR,
        description,
        message: `Coupon "${cleanCode}" applied successfully!`,
      });
    }

    return NextResponse.json(
      {
        valid: false,
        message: `Code "${cleanCode}" is invalid or expired.`,
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: 'An error occurred while validating coupon.' },
      { status: 500 }
    );
  }
}
