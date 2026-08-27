import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  const supabase = createClient();

  try {
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        description,
        base_selling_price_paise,
        base_mrp_paise,
        weavings ( name ),
        fabrics ( name ),
        occasions ( name ),
        product_variants (
          colors ( name, hex_code ),
          product_variant_media ( url )
        )
      `)
      .eq('is_published', true);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query.limit(20);

    if (!error && data && data.length > 0) {
      const formatted = data.map((p: any) => {
        const firstVariant = p.product_variants?.[0];
        const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
        const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
        const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

        const images = firstVariant?.product_variant_media?.map((m: any) => m.url).filter(Boolean) || [];

        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          weave: weaveData?.name || '',
          fabric: fabricData?.name || '',
          priceINR: Math.round((p.base_selling_price_paise || 0) / 100),
          originalPriceINR: Math.round((p.base_mrp_paise || 0) / 100),
          color: colorData?.name || '',
          images,
          inStock: true,
        };
      });

      const suggestions = formatted.slice(0, 5).map((p: any) => ({
        type: 'product' as const,
        text: p.title,
        url: `/products/${p.slug}`,
      }));

      return NextResponse.json({
        query: q,
        count: formatted.length,
        products: formatted,
        suggestions,
        source: 'database',
      });
    }
  } catch (err) {
    console.error('[Search API] Error querying database:', err);
  }

  return NextResponse.json({
    query: q,
    count: 0,
    products: [],
    suggestions: [],
    source: 'database',
  });
}
