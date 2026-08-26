import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: reels, error } = await supabase
    .from('instagram_reels')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reels: reels || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { instagram_url, caption, display_order = 0, is_active = true } = body;

  if (!instagram_url) {
    return NextResponse.json({ error: 'instagram_url is required' }, { status: 400 });
  }

  const { data: reel, error } = await supabase
    .from('instagram_reels')
    .insert({
      instagram_url,
      caption,
      display_order,
      is_active,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, reel });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase.from('instagram_reels').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
