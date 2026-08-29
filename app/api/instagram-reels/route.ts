import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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

      return NextResponse.json(
        { success: true, data: formatted, timestamp: Date.now() },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error in GET /api/instagram-reels:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
