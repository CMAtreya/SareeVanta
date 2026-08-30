import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: collections, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Admin Collections GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ collections: collections || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
    id,
    title,
    slug,
    tagline,
    description,
    image_url,
    badge,
    collection_type = 'Curated',
    is_active = true,
  } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
  }

  try {
    let resultData = null;

    if (id && !id.startsWith('col-custom-') && !id.startsWith('col-')) {
      // Update existing record
      const { data, error } = await supabase
        .from('collections')
        .update({
          title,
          slug,
          tagline: tagline || '',
          description: description || '',
          image_url: image_url || '',
          badge: badge || '',
          collection_type: collection_type || 'Curated',
          is_active: Boolean(is_active),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      resultData = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('collections')
        .insert({
          title,
          slug,
          tagline: tagline || '',
          description: description || '',
          image_url: image_url || '',
          badge: badge || '',
          collection_type: collection_type || 'Curated',
          is_active: Boolean(is_active),
        })
        .select('*')
        .single();

      if (error) throw error;
      resultData = data;
    }

    invalidateCache('collections');
    invalidateCache('public_collections');

    return NextResponse.json({ success: true, collection: resultData });
  } catch (err: any) {
    console.error('[Admin Collections POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Database operation failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { id, is_active, display_order } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (display_order !== undefined) updates.display_order = Number(display_order);
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[Admin Collections PUT] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('collections');
  invalidateCache('public_collections');

  return NextResponse.json({ success: true, collection: data });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const { error } = await supabase.from('collections').delete().eq('id', id);

  if (error) {
    console.error('[Admin Collections DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('collections');
  invalidateCache('public_collections');

  return NextResponse.json({ success: true });
}
