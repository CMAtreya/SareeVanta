import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const brandCookie = cookieStore.get('admin_active_brand')?.value;
  const brand = brandCookie === 'sareevanta' ? 'sareevanta' : 'neelsareehouse';

  return NextResponse.json({
    success: true,
    brand,
    brandName: brand === 'sareevanta' ? 'SareeVanta' : 'Neel Saree House',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brand = body.brand === 'sareevanta' ? 'sareevanta' : 'neelsareehouse';

    const cookieStore = cookies();
    cookieStore.set('admin_active_brand', brand, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year persistence
      sameSite: 'lax',
      httpOnly: false,
    });

    try {
      const supabase = createAdminClient();
      await supabase
        .from('store_settings')
        .upsert({ key: 'active_brand', value: brand, updated_at: new Date().toISOString() });
    } catch (e) {
      // Non-blocking if table not present
    }

    return NextResponse.json({
      success: true,
      brand,
      brandName: brand === 'sareevanta' ? 'SareeVanta' : 'Neel Saree House',
      message: `Active brand updated to ${brand === 'sareevanta' ? 'SareeVanta' : 'Neel Saree House'}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update brand setting' },
      { status: 500 }
    );
  }
}
