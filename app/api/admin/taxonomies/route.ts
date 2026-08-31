import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();

  try {
    const [
      { data: weavingsData },
      { data: fabricsData },
      { data: zariData },
      { data: patternsData },
      { data: occasionsData },
      { data: variantsData },
      { data: productsData },
    ] = await Promise.all([
      supabase.from('weavings').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('fabrics').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('zari_specifications').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('patterns').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('occasions').select('name').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('product_variants').select('sku, barcode'),
      supabase.from('products').select('care_instructions'),
    ]);

    // Extract exact list from database rows without frontend hardcoded merging
    const extractNames = (list: any[] | null) => {
      const set = new Set<string>();
      (list || []).forEach((row) => {
        if (row.name && row.name.trim()) set.add(row.name.trim());
      });
      return Array.from(set);
    };

    // Aggregate all distinct occasions and custom marketing badges across entire database
    const occasionSet = new Set<string>([
      'Bridal & Muhurtham',
      'Festive & Puja',
      'Reception & Cocktail',
      'Daily Classic',
      'Temple Visits',
    ]);
    (occasionsData || []).forEach((row) => {
      if (row.name && row.name.trim()) occasionSet.add(row.name.trim());
    });

    const badgeSet = new Set<string>([
      'New Arrival',
      'Best Seller',
      'Bridal Edit',
      'Limited Edition',
    ]);

    (productsData || []).forEach((p) => {
      if (p.care_instructions) {
        try {
          const parsed = typeof p.care_instructions === 'string' ? JSON.parse(p.care_instructions) : p.care_instructions;
          if (Array.isArray(parsed.occasions)) {
            parsed.occasions.forEach((occ: string) => {
              if (occ && typeof occ === 'string' && occ.trim()) occasionSet.add(occ.trim());
            });
          }
          if (Array.isArray(parsed.badges)) {
            parsed.badges.forEach((bdg: string) => {
              if (bdg && typeof bdg === 'string' && bdg.trim()) badgeSet.add(bdg.trim());
            });
          }
        } catch (e) {}
      }
    });

    // Calculate highest sequential SKU index directly from database records
    let maxSeq = 0;
    (variantsData || []).forEach((v: any) => {
      const match = (v.sku || '').match(/NSH-SKU-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });

    const nextNum = maxSeq + 1;
    const nextSeqStr = String(nextNum).padStart(3, '0');
    const nextSku = `NSH-SKU-${nextSeqStr}`;
    const nextBarcode = `890${String(100000000 + nextNum)}`;

    return NextResponse.json({
      weaves: extractNames(weavingsData),
      fabrics: extractNames(fabricsData),
      zari: extractNames(zariData),
      patterns: extractNames(patternsData),
      occasions: Array.from(occasionSet),
      badges: Array.from(badgeSet),
      nextSku,
      nextBarcode,
      nextSeq: nextNum,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Taxonomies API] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
