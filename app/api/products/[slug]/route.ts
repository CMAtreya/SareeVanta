import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const cacheKey = `pdp_product_${slug}`;
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const supabase = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

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
            colors ( id, name, hex_code ),
            product_variant_media ( url, is_primary, display_order )
          )
        `);

      if (isUuid) {
        query = query.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        const variants = data.product_variants || [];
        const firstVariant = variants[0];
        const variantMedia = firstVariant?.product_variant_media || [];
        const allImages = (variantMedia.length > 0 ? variantMedia : variants.flatMap((v: any) => v.product_variant_media || []))
          .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((m: any) => m.url)
          .filter(Boolean);

        const weaveData: any = Array.isArray(data.weavings) ? data.weavings[0] : data.weavings;
        const fabricData: any = Array.isArray(data.fabrics) ? data.fabrics[0] : data.fabrics;
        const occasionData: any = Array.isArray(data.occasions) ? data.occasions[0] : data.occasions;
        const zariData: any = Array.isArray(data.zari_specifications) ? data.zari_specifications[0] : data.zari_specifications;
        const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

        const variantIds = variants.map((v: any) => v.id).filter(Boolean);

        // Run inventory, reviews, and related products concurrently
        const [invRes, revsRes, relatedRes] = await Promise.all([
          firstVariant?.id
            ? supabase.from('inventory').select('quantity, reserved_quantity').eq('variant_id', firstVariant.id).maybeSingle()
            : Promise.resolve({ data: null }),
          variantIds.length > 0
            ? supabase
                .from('reviews')
                .select(`id, rating, review_text, title, created_at, reviewer_name, review_photos ( storage_path )`)
                .in('variant_id', variantIds)
                .eq('moderation_status', 'APPROVED')
            : Promise.resolve({ data: [] }),
          supabase
            .from('products')
            .select(`
              id, slug, title, base_mrp_paise, base_selling_price_paise,
              weavings ( name ),
              product_variants ( id, product_variant_media ( url ) )
            `)
            .neq('id', data.id)
            .limit(6),
        ]);

        let totalStockCount = 5;
        if (invRes.data) {
          totalStockCount = Math.max(0, invRes.data.quantity - (invRes.data.reserved_quantity || 0));
        }

        let rating = 0;
        let reviewCount = 0;
        let reviewsList: any[] = [];

        const revs = revsRes.data;
        if (revs && revs.length > 0) {
          reviewCount = revs.length;
          rating = Number((revs.reduce((acc, r: any) => acc + (r.rating || 5), 0) / revs.length).toFixed(1));
          reviewsList = revs.map((r: any) => {
            const photoList = r.review_photos?.map((p: any) => p.storage_path) || [];
            return {
              id: r.id,
              author: r.reviewer_name || 'Patron',
              location: 'Verified Buyer',
              rating: r.rating || 5,
              date: new Date(r.created_at).toLocaleDateString(),
              title: r.title || 'Exceptional Pure Silk Saree',
              comment: r.review_text || r.comment || '',
              verified: true,
              photos: photoList,
              photo: photoList[0] || undefined,
            };
          });
        }

        const relatedProducts = (relatedRes.data || []).map((rp: any) => {
          const rpImages = rp.product_variants?.flatMap((v: any) => v.product_variant_media?.map((m: any) => m.url)) || [];
          return {
            id: rp.id,
            slug: rp.slug,
            title: rp.title,
            weave: rp.weavings?.name || 'Mysore Silk',
            priceINR: Math.round((rp.base_selling_price_paise || 2800000) / 100),
            originalPriceINR: Math.round((rp.base_mrp_paise || 3400000) / 100),
            images: rpImages.filter(Boolean),
          };
        });

        const formatted = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          weave: weaveData?.name || 'Mysore Silk',
          fabric: fabricData?.name || 'Pure Mulberry Silk',
          occasion: occasionData?.name || 'Bridal & Muhurtham',
          priceINR: Math.round(data.base_selling_price_paise / 100),
          originalPriceINR: Math.round(data.base_mrp_paise / 100),
          pricePaise: data.base_selling_price_paise,
          mrpPaise: data.base_mrp_paise,
          rating,
          reviewCount,
          reviewsList,
          color: colorData?.name || 'Crimson Red',
          colorHex: colorData?.hex_code || '#8B1E28',
          images: allImages.filter(Boolean),
          zariGrade: zariData?.name || 'Tested Pure Gold Zari',
          dimensions: '5.5m Pure Silk Saree',
          inStock: totalStockCount > 0,
          stockCount: totalStockCount,
          description: data.description || '',
          artisanCluster: 'Mysuru Master Loom Guild',
          silkMarkCertified: true,
          colorVariants: variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            name: v.colors?.name || '',
            hex: v.colors?.hex_code || '#000000',
            images: v.product_variant_media?.map((m: any) => m.url).filter(Boolean) || [],
          })),
        };

        const responsePayload = { product: formatted, relatedProducts, source: 'database' };
        setCache(cacheKey, responsePayload, 60);

        return NextResponse.json(
          responsePayload,
          {
            headers: {
              'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
          }
        );
      }
    } catch (e) {
      console.error('[Product Detail API] Database error:', e);
    }
  }

  return NextResponse.json({ error: 'Saree Creation Not Found' }, { status: 404 });
}
