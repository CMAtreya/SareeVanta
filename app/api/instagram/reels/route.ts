import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('instagram_reels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      videoUrl: r.video_url,
      caption: r.caption || '',
      likesCount: r.likes_count || 0,
      sareeTitle: r.saree_title || '',
      sareePriceINR: r.saree_price_inr || 0,
      sareeSlug: r.saree_slug || '',
      sortOrder: r.sort_order || 0,
    }));

    return NextResponse.json({
      success: true,
      lastSynced: new Date().toISOString(),
      reels: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
