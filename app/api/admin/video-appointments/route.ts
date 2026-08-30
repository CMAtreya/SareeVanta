import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: appointments, error } = await supabase
    .from('video_appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Admin Video Appointments GET] Error/Not found:', error.message);
    // Return empty list if no appointments exist yet (Strict zero-fallback mandate)
    return NextResponse.json({ appointments: [] });
  }

  return NextResponse.json({ appointments: appointments || [] });
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { id, status, meeting_link, admin_notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (status) updates.status = status;
  if (meeting_link !== undefined) updates.meeting_link = meeting_link;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  const { data: appointment, error } = await supabase
    .from('video_appointments')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[Admin Video Appointments PATCH] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('admin_video_appointments');

  return NextResponse.json({ success: true, appointment });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('video_appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Admin Video Appointments DELETE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache('admin_video_appointments');

  return NextResponse.json({ success: true });
}
