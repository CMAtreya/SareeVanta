import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

const BANNERS_CACHE_KEY = 'banners_list';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slides: slides || [], cached: false });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
    id,
    slide_id,
    heading,
    tagline,
    badge_text,
    cta_text = 'Explore Collection',
    desktop_image_path,
    mobile_image_path,
    is_active = true,
  } = body;

  if (!heading || !desktop_image_path) {
    return NextResponse.json({ error: 'Heading and desktop image path are required' }, { status: 400 });
  }

  const targetId = id || slide_id;
  const isUuid = targetId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(targetId);

  if (isUuid) {
    const { data: updated, error: updateErr } = await supabase
      .from('hero_slides')
      .update({
        heading,
        tagline: tagline || '',
        badge_text: badge_text || '',
        cta_text,
        desktop_image_path,
        mobile_image_path: mobile_image_path || desktop_image_path,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId)
      .select('*')
      .maybeSingle();

    if (updated) {
      invalidateCache(BANNERS_CACHE_KEY);
      invalidateCache('storefront_hero_banners');
      return NextResponse.json({ success: true, slide: updated });
    }
  }

  const { count } = await supabase.from('hero_slides').select('*', { count: 'exact', head: true });
  const nextOrder = (count || 0) + 1;

  const { data: slide, error } = await supabase
    .from('hero_slides')
    .insert({
      heading,
      tagline: tagline || '',
      badge_text: badge_text || '',
      cta_text,
      desktop_image_path,
      mobile_image_path: mobile_image_path || desktop_image_path,
      is_active,
      display_order: nextOrder,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache(BANNERS_CACHE_KEY);
  invalidateCache('storefront_hero_banners');
  return NextResponse.json({ success: true, slide });
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  if (body.reorder && Array.isArray(body.reorder)) {
    for (const item of body.reorder) {
      const isItemUuid = item.id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(item.id);
      if (isItemUuid && item.display_order !== undefined) {
        await supabase
          .from('hero_slides')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
      }
    }
    invalidateCache(BANNERS_CACHE_KEY);
    invalidateCache('storefront_hero_banners');
    return NextResponse.json({ success: true });
  }

  const { slide_id, is_active, display_order } = body;

  if (!slide_id) {
    return NextResponse.json({ error: 'slide_id or reorder array is required' }, { status: 400 });
  }

  const isSlideUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slide_id);
  if (!isSlideUuid) {
    return NextResponse.json({ success: true });
  }

  const updates: any = {};
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (display_order !== undefined) updates.display_order = display_order;

  const { data: slide, error } = await supabase
    .from('hero_slides')
    .update(updates)
    .eq('id', slide_id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache(BANNERS_CACHE_KEY);
  invalidateCache('storefront_hero_banners');
  return NextResponse.json({ success: true, slide });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const heading = searchParams.get('heading');

  if (!id && !heading) {
    return NextResponse.json({ error: 'id or heading parameter is required' }, { status: 400 });
  }

  const isUuid = id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  let deleteQuery = supabase.from('hero_slides').delete();

  if (isUuid) {
    deleteQuery = deleteQuery.eq('id', id);
  } else if (id && id.toLowerCase() === 'all') {
    deleteQuery = deleteQuery.neq('heading', '__NONE__');
  } else if (heading) {
    deleteQuery = deleteQuery.ilike('heading', `%${heading}%`);
  } else if (id) {
    // If not standard UUID, try matching by heading or title
    deleteQuery = deleteQuery.or(`heading.ilike.%${id}%,tagline.ilike.%${id}%`);
  }

  const { error } = await deleteQuery;

  if (error) {
    console.error('[Admin Banners DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache(BANNERS_CACHE_KEY);
  invalidateCache('storefront_hero_banners');
  return NextResponse.json({ success: true });
}
