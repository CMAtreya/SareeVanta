import { createClient } from '@/lib/supabase/server';
import { products as mockProducts, weaveCategories } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
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

          const images = firstVariant?.product_variant_media?.map((m: any) => m.url) || [];
          const defaultImage = images.length > 0
            ? images[0]
            : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            weave: weaveData?.name || 'Mysore Silk',
            fabric: fabricData?.name || 'Pure Mulberry Silk',
            priceINR: Math.round((p.base_selling_price_paise || 0) / 100),
            originalPriceINR: Math.round((p.base_mrp_paise || 0) / 100),
            color: colorData?.name || 'Crimson Red',
            images: images.length > 0 ? images : [defaultImage],
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
      console.warn('[Search API] Fallback to mock search:', err);
    }
  }

  // Fallback to static mock products if DB empty or unavailable
  if (!q) {
    return NextResponse.json({
      query: '',
      count: mockProducts.length,
      products: mockProducts,
      suggestions: [
        { type: 'category', text: 'Mysore Silk Sarees', url: '/products?weave=Mysore%20Silk' },
        { type: 'category', text: 'Kanchipuram Bridal', url: '/products?weave=Kanchipuram' },
        { type: 'category', text: 'Banarasi Katan Silk', url: '/products?weave=Banarasi' },
        { type: 'category', text: 'Pure Silk Organza', url: '/products?weave=Organza' },
      ],
      source: 'mock_fallback',
    });
  }

  const lower = q.toLowerCase();
  const matchingProducts = mockProducts.filter((p) => {
    return (
      p.title.toLowerCase().includes(lower) ||
      p.weave.toLowerCase().includes(lower) ||
      p.fabric.toLowerCase().includes(lower) ||
      p.occasion.toLowerCase().includes(lower) ||
      p.color.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
    );
  });

  const suggestions: { type: 'category' | 'product' | 'query'; text: string; url: string }[] = [];

  weaveCategories.forEach((cat) => {
    if (cat.name.toLowerCase().includes(lower)) {
      suggestions.push({
        type: 'category',
        text: `${cat.name} Silk Sarees`,
        url: `/products?weave=${encodeURIComponent(cat.name)}`,
      });
    }
  });

  matchingProducts.slice(0, 5).forEach((p) => {
    suggestions.push({
      type: 'product',
      text: p.title,
      url: `/products/${p.slug}`,
    });
  });

  return NextResponse.json({
    query: q,
    count: matchingProducts.length,
    products: matchingProducts,
    suggestions: suggestions.slice(0, 6),
    source: 'mock_fallback',
  });
}
