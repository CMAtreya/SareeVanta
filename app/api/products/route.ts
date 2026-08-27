import { createAdminClient } from '@/lib/supabase/admin-client';
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

  const supabase = createAdminClient();

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
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.range((page - 1) * limit, page * limit - 1);

    if (!error && data && data.length > 0) {
      let formattedProducts = data.map((p: any) => {
        const firstVariant = p.product_variants?.[0];
        const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
        const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
        const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
        const zariData: any = Array.isArray(p.zari_specifications) ? p.zari_specifications[0] : p.zari_specifications;
        const allVariantImages = (p.product_variants || [])
          .flatMap((v: any) => (v.product_variant_media || []).map((m: any) => m.url))
          .filter(Boolean);

        const images = allVariantImages.length > 0
          ? allVariantImages
          : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'];

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
          images,
          zariGrade: zariData?.name || '',
          description: p.description || '',
          inStock: true,
        };
      });

      // Calculate dynamic filter counts across whole published catalog
      const counts = {
        weaves: {} as Record<string, number>,
        fabrics: {} as Record<string, number>,
        occasions: {} as Record<string, number>,
        colors: {} as Record<string, number>,
      };

      formattedProducts.forEach((p: any) => {
        if (p.weave) counts.weaves[p.weave] = (counts.weaves[p.weave] || 0) + 1;
        if (p.fabric) counts.fabrics[p.fabric] = (counts.fabrics[p.fabric] || 0) + 1;
        if (p.occasion) counts.occasions[p.occasion] = (counts.occasions[p.occasion] || 0) + 1;
        if (p.color) counts.colors[p.color] = (counts.colors[p.color] || 0) + 1;
      });

      if (weave) {
        formattedProducts = formattedProducts.filter(p =>
          p.weave.toLowerCase().includes(weave.toLowerCase()) || weave.toLowerCase().includes(p.weave.toLowerCase())
        );
      }
      if (fabric) {
        formattedProducts = formattedProducts.filter(p =>
          p.fabric.toLowerCase().includes(fabric.toLowerCase()) || fabric.toLowerCase().includes(p.fabric.toLowerCase())
        );
      }
      if (occasion) {
        formattedProducts = formattedProducts.filter(p =>
          p.occasion.toLowerCase().includes(occasion.toLowerCase()) || occasion.toLowerCase().includes(p.occasion.toLowerCase())
        );
      }
      if (color) formattedProducts = formattedProducts.filter(p => p.color.toLowerCase().includes(color.toLowerCase()));

      return NextResponse.json({
        products: formattedProducts,
        total: formattedProducts.length,
        totalPages: Math.ceil(formattedProducts.length / limit) || 1,
        counts,
        source: 'database',
      });
    }
  } catch (e) {
    console.error('[Products API] Error fetching from database:', e);
  }

  return NextResponse.json({
    products: [],
    total: 0,
    totalPages: 1,
    source: 'database',
  });
}
