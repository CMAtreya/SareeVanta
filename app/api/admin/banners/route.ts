import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slides: slides || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
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
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slide });
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  if (body.reorder && Array.isArray(body.reorder)) {
    for (const item of body.reorder) {
      if (item.id && item.display_order !== undefined) {
        await supabase
          .from('hero_slides')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
      }
    }
    return NextResponse.json({ success: true });
  }

  const { slide_id, is_active, display_order } = body;

  if (!slide_id) {
    return NextResponse.json({ error: 'slide_id or reorder array is required' }, { status: 400 });
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

  return NextResponse.json({ success: true, slide });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const { error } = await supabase.from('hero_slides').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
