import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const validCoupons: Record<string, { discountPercent?: number; discountFixedINR?: number; description: string }> = {
  ROYAL10: {
    discountPercent: 10,
    description: '10% Royal Heritage Patron Discount',
  },
  MYSORE2021: {
    discountFixedINR: 2500,
    description: '₹2,500 Mysore Loom Jubilee Discount',
  },
  FESTIVE15: {
    discountPercent: 15,
    description: '15% Festive Celebration Discount',
  },
  BRIDAL20: {
    discountPercent: 20,
    description: '20% Grand Trousseau Bridal Discount',
  },
};

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

    // 1. Query Supabase coupons table
    const supabase = createClient();
    const { data: dbCoupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle();

    if (dbCoupon) {
      const isFixed = dbCoupon.discount_type === 'FIXED';
      const discountPercent = !isFixed ? Number(dbCoupon.discount_value) : undefined;
      const discountFixedINR = isFixed ? Number(dbCoupon.discount_value) : undefined;
      const description = `Privilege Coupon "${cleanCode}" applied`;

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent,
        discountFixedINR,
        description,
        message: `Coupon "${cleanCode}" applied successfully!`,
      });
    }

    // 2. Fallback to validCoupons static dictionary
    const matched = validCoupons[cleanCode];
    if (matched) {
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent: matched.discountPercent,
        discountFixedINR: matched.discountFixedINR,
        description: matched.description,
        message: `Coupon "${cleanCode}" applied: ${matched.description}!`,
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
