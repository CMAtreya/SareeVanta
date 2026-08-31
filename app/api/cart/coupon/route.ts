import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartSubtotalINR = 0 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Please enter a valid coupon code.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Query Supabase coupons table with admin client (bypasses RLS read restriction)
    const supabase = createAdminClient();
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
      // Check Expiry Date
      if (dbCoupon.expires_at && new Date(dbCoupon.expires_at) < new Date()) {
        return NextResponse.json(
          { valid: false, message: `Coupon "${cleanCode}" has expired.` },
          { status: 400 }
        );
      }

      // Check Minimum Order Amount
      const minOrderINR = Math.round((dbCoupon.min_order_amount_paise || 0) / 100);
      if (minOrderINR > 0 && cartSubtotalINR > 0 && cartSubtotalINR < minOrderINR) {
        return NextResponse.json(
          {
            valid: false,
            message: `Minimum order amount of ₹${minOrderINR.toLocaleString('en-IN')} required to use coupon "${cleanCode}".`,
          },
          { status: 400 }
        );
      }

      let metaTitle = `Privilege Coupon "${cleanCode}" applied`;
      let maxDiscountCapINR: number | undefined = undefined;

      try {
        if (dbCoupon.description && dbCoupon.description.startsWith('{')) {
          const parsed = JSON.parse(dbCoupon.description);
          metaTitle = parsed.title || metaTitle;
          maxDiscountCapINR = parsed.maxCapINR ? Number(parsed.maxCapINR) : undefined;
        } else if (dbCoupon.description) {
          metaTitle = dbCoupon.description;
        }
      } catch (e) {
        // fallback
      }

      const isFixed = dbCoupon.discount_type === 'FIXED';
      const discountPercent = !isFixed ? Number(dbCoupon.discount_value) : undefined;
      const discountFixedINR = isFixed ? Number(dbCoupon.discount_value) : undefined;

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        title: metaTitle,
        discountPercent,
        discountFixedINR,
        maxDiscountCapINR,
        minOrderValueINR: minOrderINR,
        description: metaTitle,
        message: `Coupon "${cleanCode}" applied successfully!`,
      });
    }

    return NextResponse.json(
      {
        valid: false,
        message: `Code "${cleanCode}" is invalid or inactive.`,
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
