import { createClient } from '@/lib/supabase/server';
import { products as mockProducts } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weave = searchParams.get('weave');
  const fabric = searchParams.get('fabric');
  const occasion = searchParams.get('occasion');
  const color = searchParams.get('color');
  const search = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // If Supabase is connected, query Supabase DB
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          slug,
          description,
          care_instructions,
          base_mrp_paise,
          base_selling_price_paise,
          is_published,
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
            product_variant_media ( url, is_primary )
          )
        `)
        .eq('is_published', true);

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query.range((page - 1) * limit, page * limit - 1);

      if (!error && data && data.length > 0) {
        // Transform database rows into JSON response
        const formattedProducts = data.map((p: any) => {
          const firstVariant = p.product_variants?.[0];
          const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
          const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
          const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
          const zariData: any = Array.isArray(p.zari_specifications) ? p.zari_specifications[0] : p.zari_specifications;
          const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            weave: weaveData?.name || '',
            fabric: fabricData?.name || '',
            occasion: occasionData?.name || '',
            priceINR: Math.round(p.base_selling_price_paise / 100),
            originalPriceINR: Math.round(p.base_mrp_paise / 100),
            pricePaise: p.base_selling_price_paise,
            mrpPaise: p.base_mrp_paise,
            color: colorData?.name || '',
            colorHex: colorData?.hex_code || '#000000',
            images: firstVariant?.product_variant_media?.map((m: any) => m.url) || [],
            zariGrade: zariData?.name || '',
            description: p.description,
            inStock: true,
          };
        });

        return NextResponse.json({ products: formattedProducts, source: 'database' });
      }
    } catch (e) {
      console.warn('[Products API] Falling back to static catalog:', e);
    }
  }

  // Fallback to static mock products if DB isn't populated yet
  let filtered = [...mockProducts];
  if (weave) filtered = filtered.filter(p => p.weave.toLowerCase().includes(weave.toLowerCase()));
  if (fabric) filtered = filtered.filter(p => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
  if (occasion) filtered = filtered.filter(p => p.occasion.toLowerCase().includes(occasion.toLowerCase()));
  if (color) filtered = filtered.filter(p => p.color.toLowerCase().includes(color.toLowerCase()));
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return NextResponse.json({ products: filtered, source: 'mock_fallback' });
}
