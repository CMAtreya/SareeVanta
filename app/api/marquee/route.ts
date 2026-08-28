import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createAdminClient();

  const { data: messages, error } = await supabase
    .from('marquee_messages')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let bgColor = '#0F172A';
  let textColor = '#FDE047';
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

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
