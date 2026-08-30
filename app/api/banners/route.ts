import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('id, heading, tagline, badge_text, cta_text, desktop_image_path, mobile_image_path, display_order, is_active')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slides: slides || [] }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
