import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackThumbnails = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
];

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
        thumbnail_url: r.thumbnail_storage_path || fallbackThumbnails[0],
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
