import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const BANNERS_CACHE_KEY = 'banners_list';

export async function GET() {
  const cached = getCache<any[]>(BANNERS_CACHE_KEY);
  if (cached) {
    return NextResponse.json({ slides: cached, cached: true });
  }

  const supabase = createAdminClient();

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('id, heading, tagline, badge_text, cta_text, desktop_image_path, mobile_image_path, display_order, is_active')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = slides || [];
  setCache(BANNERS_CACHE_KEY, result, 60);

  return NextResponse.json({ slides: result, cached: false });
}
