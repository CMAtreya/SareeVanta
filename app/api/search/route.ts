import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

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

  const supabase = createAdminClient();

  try {
    const { data: allProducts, error } = await supabase
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
        product_variants (
          colors ( name, hex_code ),
          product_variant_media ( url, is_primary, display_order )
        )
      `)
      .eq('is_published', true);

    if (!error && allProducts && allProducts.length > 0) {
      const lowerQ = q.toLowerCase();

      // Format all products
      const formatted = allProducts.map((p: any) => {
        const firstVariant = p.product_variants?.[0];
        const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
        const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
        const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
        const patternData: any = Array.isArray(p.patterns) ? p.patterns[0] : p.patterns;
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
          pattern: patternData?.name || '',
          priceINR: Math.round((p.base_selling_price_paise || 0) / 100),
          originalPriceINR: Math.round((p.base_mrp_paise || 0) / 100),
          color: colorData?.name || '',
          images: sortedImages,
          inStock: true,
        };
      });

      // Filter matching products
      const matchingProducts = formatted.filter((p: any) =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.description?.toLowerCase().includes(lowerQ) ||
        p.weave.toLowerCase().includes(lowerQ) ||
        p.fabric.toLowerCase().includes(lowerQ) ||
        p.occasion.toLowerCase().includes(lowerQ) ||
        p.pattern.toLowerCase().includes(lowerQ) ||
        p.color.toLowerCase().includes(lowerQ)
      );

      // Build smart autocomplete suggestions
      const suggestions: { type: string; text: string; url: string }[] = [];

      // Check taxonomy hits
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
          suggestions.push({ type: 'Heritage Pattern', text: pt, url: `/products?search=${encodeURIComponent(pt)}` });
        }
      });

      // Add product title suggestions
      matchingProducts.slice(0, 4).forEach((p: any) => {
        if (!suggestions.some((s) => s.text === p.title)) {
          suggestions.push({ type: 'Handloom Saree', text: p.title, url: `/products/${p.slug}` });
        }
      });

      return NextResponse.json({
        query: q,
        count: matchingProducts.length,
        products: matchingProducts,
        suggestions: suggestions.slice(0, 6),
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
