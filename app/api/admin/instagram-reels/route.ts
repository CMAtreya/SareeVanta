import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function extractInstagramShortcode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

const fallbackThumbnails = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: dbReels, error } = await supabase
      .from('instagram_reels')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const formatted = (dbReels || []).map((r: any) => ({
      id: r.id,
      url: r.instagram_url,
      shortcode: extractInstagramShortcode(r.instagram_url) || r.id,
      caption: r.caption || '',
      thumbnail_url: r.thumbnail_storage_path || fallbackThumbnails[0],
      sort_order: r.display_order || 0,
      is_active: r.is_active !== false,
      created_at: r.created_at,
    }));

    return NextResponse.json(
      { success: true, data: formatted, count: formatted.length },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch Instagram reels.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { url, caption, thumbnail_url, is_active } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Instagram reel URL is required.' },
        { status: 400 }
      );
    }

    const shortcode = extractInstagramShortcode(url.trim());
    if (!shortcode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Instagram URL. Must match pattern instagram.com/reel/[shortcode] or instagram.com/p/[shortcode].',
        },
        { status: 400 }
      );
    }

    const autoInstagramFrame = `https://instagram.com/p/${shortcode}/media/?size=l`;
    const resolvedThumbnail = thumbnail_url && thumbnail_url.trim() ? thumbnail_url.trim() : autoInstagramFrame;

    const { data: newReel, error } = await supabase
      .from('instagram_reels')
      .insert({
        instagram_url: url.trim(),
        caption: caption ? caption.trim() : `Neel Saree House Atelier Drape — @${shortcode}`,
        thumbnail_storage_path: resolvedThumbnail,
        display_order: 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram reel added and published in real time.',
      data: {
        id: newReel.id,
        url: newReel.instagram_url,
        shortcode,
        caption: newReel.caption,
        thumbnail_url: newReel.thumbnail_storage_path,
        sort_order: newReel.display_order,
        is_active: newReel.is_active,
        created_at: newReel.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error adding Instagram reel.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'id parameter is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('instagram_reels').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reel deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
