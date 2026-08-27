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

  const latest = messages?.[0] || null;

  return NextResponse.json({
    messages: messages || [],
    activeMarquee: latest || {
      message_text: '✨ FESTIVE MUHURTHAM SEASON: Flat 10% Off with Code MYSORE10 • Free BlueDart Air Shipping On All Domestic Orders • Silk Mark Certified 100% Pure Handlooms',
      is_active: true,
    },
  });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { message_text, is_active = true } = body;

  if (!message_text) {
    return NextResponse.json({ error: 'message_text is required' }, { status: 400 });
  }

  // Deactivate old messages to keep a single active master announcement
  await supabase
    .from('marquee_messages')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: message, error } = await supabase
    .from('marquee_messages')
    .insert({
      message_text: message_text.trim(),
      is_active: Boolean(is_active),
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message });
}
