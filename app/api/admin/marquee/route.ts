import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

const MARQUEE_CACHE_KEY = 'marquee_active_lines';

export async function GET() {
  const cached = getCache<any>(MARQUEE_CACHE_KEY);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const supabase = createAdminClient();

  const { data: messages, error } = await supabase
    .from('marquee_messages')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const defaultLines = [
    '✨ FESTIVE MUHURTHAM SEASON: Flat 10% Off with Code MYSORE10',
    '✈️ Free BlueDart Express Air Shipping on all Domestic Orders Above ₹5,000',
    '🏷️ Silk Mark Certified 100% Pure Handloom Silks Direct from Master Weavers',
  ];

  const activeLines = (messages && messages.length > 0)
    ? messages.map((m: any) => m.message_text).filter(Boolean)
    : defaultLines;

  const result = {
    messages: messages || [],
    activeLines,
    activeMarquee: {
      message_text: activeLines[0] || defaultLines[0],
      is_active: true,
    },
  };

  setCache(MARQUEE_CACHE_KEY, result, 60);

  return NextResponse.json({ ...result, cached: false });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { message_text, message_lines, is_active = true } = body;

  const linesToSave: string[] = Array.isArray(message_lines) && message_lines.length > 0
    ? message_lines.map((l: string) => l.trim()).filter(Boolean)
    : message_text
    ? [message_text.trim()]
    : [];

  if (linesToSave.length === 0) {
    return NextResponse.json({ error: 'At least one announcement line is required' }, { status: 400 });
  }

  // Deactivate old messages
  await supabase
    .from('marquee_messages')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert all new announcement lines as active
  const insertRows = linesToSave.map((text: string) => ({
    message_text: text,
    is_active: Boolean(is_active),
  }));

  const { data: inserted, error } = await supabase
    .from('marquee_messages')
    .insert(insertRows)
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache(MARQUEE_CACHE_KEY);
  return NextResponse.json({ success: true, messages: inserted, activeLines: linesToSave });
}
