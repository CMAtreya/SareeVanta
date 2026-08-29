import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'storefront_hero_banners';
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  const supabase = createAdminClient();

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('id, heading, tagline, badge_text, cta_text, desktop_image_path, mobile_image_path, display_order, is_active')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = { slides: slides || [], cached: false };
  setCache(cacheKey, payload, 60);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
