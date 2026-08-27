import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: messages, error } = await supabase
    .from('marquee_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { message_text, is_active = true } = body;

  if (!message_text) {
    return NextResponse.json({ error: 'message_text is required' }, { status: 400 });
  }

  const { data: message, error } = await supabase
    .from('marquee_messages')
    .insert({
      message_text,
      is_active: Boolean(is_active),
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message });
}
