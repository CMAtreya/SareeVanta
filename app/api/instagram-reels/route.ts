import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'storefront_instagram_reels';
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  try {
    const supabase = createAdminClient();
    const { data: dbReels, error } = await supabase
      .from('instagram_reels')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && dbReels && dbReels.length > 0) {
      const formatted = dbReels.map((r: any) => ({
        id: r.id,
        url: r.instagram_url,
        caption: r.caption || '',
        thumbnail_url: r.thumbnail_storage_path || '',
        sort_order: r.display_order || 0,
        is_active: r.is_active,
        created_at: r.created_at,
      }));

      const payload = { success: true, data: formatted, timestamp: Date.now() };
      setCache(cacheKey, payload, 60);

      return NextResponse.json(payload, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error in GET /api/instagram-reels:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
