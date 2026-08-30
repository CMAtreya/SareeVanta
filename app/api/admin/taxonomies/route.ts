import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

const DEFAULT_TAXONOMIES = {
  weaves: [
    'Mysore Silk',
    'Kanchipuram',
    'Banarasi',
    'Paithani',
    'Patola',
    'Ikkat',
    'Organza',
    'Chanderi',
  ],
  fabrics: [
    'Pure Mulberry Silk',
    'Tissue Georgette',
    'Soft Silk',
    'Raw Silk',
    'Crepe Silk',
    'Georgette',
    'Tissue Silk',
    'Tussar Silk',
    'Organza',
    'Pure Katan Silk',
    'Chanderi Silk',
  ],
  zari: [
    'Pure 24K Tested Zari',
    'Tested Gold Zari',
    'Silver Tested Zari',
    'Pure Zari Thread Interlock',
    'Antique Gold Zari',
    'Copper Zari Weave',
    'No Zari / Resham Threadwork',
  ],
  patterns: [
    'Kasuti Diamonds',
    'Peacock Mayil & Yanai',
    'Temple Korvai Border',
    'Floral Kadwa Meenakari',
    'Asawali Floral Vines',
    'Ashrafi Bootas',
    'Jacquard Zari Butta',
    'Temple Border',
  ],
  occasions: [
    'Bridal & Muhurtham',
    'Festive & Puja',
    'Reception & Cocktail',
    'Daily Classic',
    'Temple Visits',
  ],
};

export async function GET() {
  const supabase = createAdminClient();

  try {
    const [
      { data: weavingsData },
      { data: fabricsData },
      { data: zariData },
      { data: patternsData },
      { data: occasionsData },
    ] = await Promise.all([
      supabase.from('weavings').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('fabrics').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('zari_specifications').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('patterns').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('occasions').select('name').eq('is_active', true).order('created_at', { ascending: true }),
    ]);

    // Merge database names with default names ensuring no duplicates and preserving order
    const mergeNames = (dbList: any[] | null, defaults: string[]) => {
      const set = new Set<string>(defaults);
      (dbList || []).forEach((row) => {
        if (row.name && row.name.trim()) set.add(row.name.trim());
      });
      return Array.from(set);
    };

    return NextResponse.json({
      weaves: mergeNames(weavingsData, DEFAULT_TAXONOMIES.weaves),
      fabrics: mergeNames(fabricsData, DEFAULT_TAXONOMIES.fabrics),
      zari: mergeNames(zariData, DEFAULT_TAXONOMIES.zari),
      patterns: mergeNames(patternsData, DEFAULT_TAXONOMIES.patterns),
      occasions: mergeNames(occasionsData, DEFAULT_TAXONOMIES.occasions),
    }, {
      headers: { 'Cache-Control': 'no-cache, must-revalidate' }
    });
  } catch (error: any) {
    console.error('[Taxonomies API] GET Error:', error);
    return NextResponse.json(DEFAULT_TAXONOMIES);
  }
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();
    const { type, name } = body;

    if (!type || !name || !name.trim()) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanCode = cleanName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '').slice(0, 20) || 'CUSTOM';

    let table = '';
    if (type === 'weave') table = 'weavings';
    else if (type === 'fabric') table = 'fabrics';
    else if (type === 'zari') table = 'zari_specifications';
    else if (type === 'pattern') table = 'patterns';
    else if (type === 'occasion') table = 'occasions';
    else {
      return NextResponse.json({ error: `Invalid taxonomy type: ${type}` }, { status: 400 });
    }

    // Check if already exists (case-insensitive)
    const { data: existing } = await supabase
      .from(table)
      .select('id, name')
      .ilike('name', cleanName)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ success: true, item: existing, existed: true });
    }

    // Insert new taxonomy record
    const { data: inserted, error: insertError } = await supabase
      .from(table)
      .insert({
        name: cleanName,
        code: cleanCode,
        is_active: true,
      })
      .select('id, name, code')
      .single();

    if (insertError) {
      console.error(`[Taxonomies API] Error inserting into ${table}:`, insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: inserted, existed: false });
  } catch (error: any) {
    console.error('[Taxonomies API] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
