import { createClient } from '@/lib/supabase/server';
import { products as mockProducts } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weave = searchParams.get('weave');
  const fabric = searchParams.get('fabric');
  const occasion = searchParams.get('occasion');
  const color = searchParams.get('color');
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');
  const sort = searchParams.get('sort') || 'featured';
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
          created_at,
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

      if (priceMin) {
        query = query.gte('base_selling_price_paise', parseInt(priceMin, 10) * 100);
      }

      if (priceMax) {
        query = query.lte('base_selling_price_paise', parseInt(priceMax, 10) * 100);
      }

      if (sort === 'price-low') {
        query = query.order('base_selling_price_paise', { ascending: true });
      } else if (sort === 'price-high') {
        query = query.order('base_selling_price_paise', { ascending: false });
      } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.range((page - 1) * limit, page * limit - 1);

      if (!error && data && data.length > 0) {
        // Transform database rows into JSON response
        let formattedProducts = data.map((p: any) => {
          const firstVariant = p.product_variants?.[0];
          const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
          const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
          const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
          const zariData: any = Array.isArray(p.zari_specifications) ? p.zari_specifications[0] : p.zari_specifications;
          const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

          const variantImages = firstVariant?.product_variant_media?.map((m: any) => m.url) || [];
          const images = variantImages.length > 0
            ? variantImages
            : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'];

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
            images,
            zariGrade: zariData?.name || '',
            description: p.description,
            inStock: true,
          };
        });

        if (weave) formattedProducts = formattedProducts.filter(p => p.weave.toLowerCase().includes(weave.toLowerCase()));
        if (fabric) formattedProducts = formattedProducts.filter(p => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
        if (occasion) formattedProducts = formattedProducts.filter(p => p.occasion.toLowerCase().includes(occasion.toLowerCase()));
        if (color) formattedProducts = formattedProducts.filter(p => p.color.toLowerCase().includes(color.toLowerCase()));

        return NextResponse.json({
          products: formattedProducts,
          total: formattedProducts.length,
          totalPages: Math.ceil(formattedProducts.length / limit) || 1,
          source: 'database',
        });
      }

      // If database query returns empty array in production, return empty database state
      if (!error && data && data.length === 0) {
        return NextResponse.json({
          products: [],
          total: 0,
          totalPages: 1,
          source: 'database',
        });
      }
    } catch (e) {
      console.warn('[Products API] Falling back to static catalog:', e);
    }
  }

  // In production mode, do not render mock data if DB is connected
  if (process.env.NODE_ENV === 'production' && supabaseUrl && !supabaseUrl.includes('placeholder')) {
    return NextResponse.json({
      products: [],
      total: 0,
      totalPages: 1,
      source: 'database',
    });
  }

  // Fallback to static mock products for local dev environment only
  let filtered = [...mockProducts];
  if (weave) filtered = filtered.filter(p => p.weave.toLowerCase().includes(weave.toLowerCase()));
  if (fabric) filtered = filtered.filter(p => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
  if (occasion) filtered = filtered.filter(p => p.occasion.toLowerCase().includes(occasion.toLowerCase()));
  if (color) filtered = filtered.filter(p => p.color.toLowerCase().includes(color.toLowerCase()));
  if (priceMin) filtered = filtered.filter(p => p.priceINR >= parseInt(priceMin, 10));
  if (priceMax) filtered = filtered.filter(p => p.priceINR <= parseInt(priceMax, 10));
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  if (sort === 'price-low') filtered.sort((a, b) => a.priceINR - b.priceINR);
  else if (sort === 'price-high') filtered.sort((a, b) => b.priceINR - a.priceINR);
  else if (sort === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  return NextResponse.json({
    products: filtered,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit) || 1,
    source: 'mock_fallback',
  });
}
