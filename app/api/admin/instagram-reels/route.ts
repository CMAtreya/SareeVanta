import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

function extractInstagramShortcode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^[A-Za-z0-9_-]{5,35}$/.test(trimmed)) return trimmed;
  
  // Match /(reel|reels|p)/SHORTCODE accurately (avoiding matching username.reels)
  const match = trimmed.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]{5,35})/i);
  if (match) return match[1];

  // Fallback: inspect URL segments from right to left
  const cleanPath = trimmed.split('?')[0].split('#')[0];
  const segments = cleanPath.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (/^[A-Za-z0-9_-]{5,35}$/.test(seg) && seg.toLowerCase() !== 'reel' && seg.toLowerCase() !== 'reels') {
      return seg;
    }
  }
  return null;
}

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

    const formatted = (dbReels || []).map((r: any) => {
      const code = extractInstagramShortcode(r.instagram_url) || r.id;
      let cleanCaption = r.caption || '';
      if (cleanCaption.endsWith('@reel')) {
        cleanCaption = `Mysuru Pure Silk Atelier Drape — Reel #${code.slice(0, 7)}`;
      }

      return {
        id: r.id,
        url: r.instagram_url,
        shortcode: code,
        caption: cleanCaption || 'Royal Heritage Silk Draping Masterclass',
        thumbnail_url: r.thumbnail_storage_path || '',
        sort_order: r.display_order || 0,
        is_active: r.is_active !== false,
        created_at: r.created_at,
      };
    });

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
    const resolvedCaption = caption && caption.trim() 
      ? caption.trim() 
      : `Mysuru Pure Silk Atelier Drape — Reel #${shortcode.slice(0, 7)}`;

    const { data: newReel, error } = await supabase
      .from('instagram_reels')
      .insert({
        instagram_url: url.trim(),
        caption: resolvedCaption,
        thumbnail_storage_path: resolvedThumbnail,
        display_order: 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    invalidateCache('storefront_instagram_reels');

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

export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // 1. Bulk Reorder
    if (body.reorder && Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        if (item.id && item.display_order !== undefined) {
          await supabase
            .from('instagram_reels')
            .update({ display_order: item.display_order })
            .eq('id', item.id);
        }
      }
      invalidateCache('storefront_instagram_reels');
      return NextResponse.json({ success: true, message: 'Reels reordered successfully.' });
    }

    // 2. Single Reel Update / Edit
    const { id, url, caption, thumbnail_url, is_active, display_order } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Reel id is required for update.' }, { status: 400 });
    }

    const updates: any = {};
    if (url !== undefined && typeof url === 'string') updates.instagram_url = url.trim();
    if (caption !== undefined && typeof caption === 'string') updates.caption = caption.trim();
    if (thumbnail_url !== undefined) updates.thumbnail_storage_path = thumbnail_url ? thumbnail_url.trim() : null;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (display_order !== undefined) updates.display_order = Number(display_order);

    const { data: updated, error } = await supabase
      .from('instagram_reels')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    invalidateCache('storefront_instagram_reels');

    return NextResponse.json({
      success: true,
      message: 'Reel updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update reel.' }, { status: 500 });
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

    invalidateCache('storefront_instagram_reels');

    return NextResponse.json({ success: true, message: 'Reel deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
