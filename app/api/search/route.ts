import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({
      query: '',
      count: 0,
      products: [],
      suggestions: [],
      source: 'empty',
    });
  }

  const cacheKey = `search_query_${q.toLowerCase()}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  const supabase = createAdminClient();
  let matchingProducts: Product[] = [];
  let source = 'database';

  try {
    const { data: dbProducts, error } = await supabase
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
        patterns ( name ),
        border_stylings ( name ),
        zari_specifications ( name ),
        product_variants (
          id,
          sku,
          price_paise,
          mrp_paise,
          is_active,
          colors ( name, hex_code ),
          product_variant_media ( url, is_primary, display_order )
        )
      `)
      .eq('is_published', true)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(12);

    if (!error && dbProducts && dbProducts.length > 0) {
      matchingProducts = dbProducts.map((p: any) => {
        const firstVariant = p.product_variants?.[0];
        const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
        const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
        const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
        const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

        const variantMedia = firstVariant?.product_variant_media || [];
        const sortedImages = (variantMedia.length > 0 ? variantMedia : p.product_variants?.flatMap((v: any) => v.product_variant_media || []) || [])
          .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((m: any) => m.url)
          .filter(Boolean);

        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          weave: weaveData?.name || '',
          fabric: fabricData?.name || '',
          occasion: occasionData?.name || '',
          rating: 0,
          reviewCount: 0,
          priceINR: Math.round((p.base_selling_price_paise || 2800000) / 100),
          originalPriceINR: Math.round((p.base_mrp_paise || 3400000) / 100),
          color: colorData?.name || '',
          colorHex: colorData?.hex_code || '#8B1E28',
          images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
          zariGrade: 'Tested Pure Gold Zari',
          dimensions: '5.5m Pure Silk Saree',
          inStock: true,
          silkMarkCertified: true,
          artisanCluster: 'Mysuru Master Guild',
          description: p.description || '',
        };
      });
    }
  } catch (err) {
    console.error('[Search API] Error querying database:', err);
  }

  const lowerQ = q.toLowerCase();

  // Build smart autocomplete suggestions
  const suggestions: { type: string; text: string; url: string }[] = [];

  const knownWeaves = ['Mysore Silk', 'Kanchipuram', 'Banarasi', 'Paithani', 'Tissue Georgette', 'Ikkat'];
  knownWeaves.forEach((w) => {
    if (w.toLowerCase().includes(lowerQ) && !suggestions.some((s) => s.text === w)) {
      suggestions.push({ type: 'Weave Tradition', text: w, url: `/products?weave=${encodeURIComponent(w)}` });
    }
  });

  const knownFabrics = ['Pure Mulberry Silk', 'Soft Silk', 'Raw Silk', 'Crepe Silk', 'Georgette', 'Tissue Silk', 'Tussar Silk', 'Organza'];
  knownFabrics.forEach((f) => {
    if (f.toLowerCase().includes(lowerQ) && !suggestions.some((s) => s.text === f)) {
      suggestions.push({ type: 'Fabric Texture', text: f, url: `/products?fabric=${encodeURIComponent(f)}` });
    }
  });

  const knownColors = ['Crimson Red', 'Peacock Teal', 'Kanchipuram Gold', 'Rani Pink', 'Bottle Green', 'Midnight Blue', 'Mustard Yellow', 'Deep Violet', 'Ivory White'];
  knownColors.forEach((c) => {
    if (c.toLowerCase().includes(lowerQ) && !suggestions.some((s) => s.text === c)) {
      suggestions.push({ type: 'Royal Hue', text: c, url: `/products?color=${encodeURIComponent(c)}` });
    }
  });

  const knownPatterns = ['Kasuti Diamonds', 'Peacock Mayil & Yanai', 'Temple Korvai Border', 'Floral Kadwa Meenakari', 'Asawali Floral Vines', 'Ashrafi Bootas'];
  knownPatterns.forEach((pt) => {
    if (pt.toLowerCase().includes(lowerQ) && !suggestions.some((s) => s.text === pt)) {
      suggestions.push({ type: 'Heritage Pattern', text: pt, url: `/products?pattern=${encodeURIComponent(pt)}` });
    }
  });

  matchingProducts.slice(0, 4).forEach((p: any) => {
    if (!suggestions.some((s) => s.text === p.title)) {
      suggestions.push({ type: 'Handloom Saree', text: p.title, url: `/products/${p.slug}` });
    }
  });

  const responsePayload = {
    query: q,
    count: matchingProducts.length,
    products: matchingProducts,
    suggestions: suggestions.slice(0, 6),
    source,
  };

  setCache(cacheKey, responsePayload, 60);

  return NextResponse.json(responsePayload, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

