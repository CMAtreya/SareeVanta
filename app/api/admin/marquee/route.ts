import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

const MARQUEE_CACHE_KEY = 'marquee_active_lines';

export const dynamic = 'force-dynamic';

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

  let bgColor = '#7A1C30';
  let textColor = '#FEF3C7';
  let isActive = true;

  const rawRows = messages || [];
  const textLines: string[] = [];

  for (const row of rawRows) {
    if (typeof row.message_text === 'string' && row.message_text.startsWith('__CONFIG__:')) {
      try {
        const configJson = JSON.parse(row.message_text.replace('__CONFIG__:', ''));
        if (configJson.bg_color) bgColor = configJson.bg_color;
        if (configJson.text_color) textColor = configJson.text_color;
        if (configJson.is_active !== undefined) isActive = Boolean(configJson.is_active);
      } catch (e) {}
    } else if (row.message_text && row.message_text.trim()) {
      textLines.push(row.message_text.trim());
    }
  }

  const defaultLines = [
    '✨ FESTIVE MUHURTHAM SEASON: Flat 10% Off with Code MYSORE10',
    '✈️ Free BlueDart Express Air Shipping on all Domestic Orders Above ₹5,000',
    '🏷️ Silk Mark Certified 100% Pure Handloom Silks Direct from Master Weavers',
  ];

  const activeLines = textLines.length > 0 ? textLines : defaultLines;

  const result = {
    messages: rawRows,
    activeLines,
    bgColor,
    textColor,
    isActive,
    activeMarquee: {
      message_text: activeLines[0] || defaultLines[0],
      is_active: isActive,
    },
  };

  setCache(MARQUEE_CACHE_KEY, result, 10);

  return NextResponse.json(
    { ...result, cached: false },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { message_text, message_lines, bg_color = '#7A1C30', text_color = '#FEF3C7', is_active = true } = body;

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

  // Insert all new announcement lines as active + metadata row
  const insertRows = linesToSave.map((text: string) => ({
    message_text: text,
    is_active: Boolean(is_active),
  }));

  // Append config metadata row
  insertRows.push({
    message_text: `__CONFIG__:${JSON.stringify({ bg_color, text_color, is_active: Boolean(is_active) })}`,
    is_active: true,
  });

  const { data: inserted, error } = await supabase
    .from('marquee_messages')
    .insert(insertRows)
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache(MARQUEE_CACHE_KEY);
  return NextResponse.json({
    success: true,
    messages: inserted,
    activeLines: linesToSave,
    bgColor: bg_color,
    textColor: text_color,
    isActive: Boolean(is_active),
  });
}
