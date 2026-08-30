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

      // 1. Fetch Master Product Record
      let productQuery = supabase
        .from('products')
        .select('*');

      if (isUuid) {
        productQuery = productQuery.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        productQuery = productQuery.eq('slug', slug);
      }

      const { data: prod, error: prodErr } = await productQuery.maybeSingle();

      if (prod && !prodErr) {
        const prodId = prod.id;

        // 2. Concurrently fetch all relational taxonomies, variants, inventory, media, reviews, and related items
        const [
          weavingsRes,
          fabricsRes,
          zarisRes,
          patternsRes,
          occasionsRes,
          variantsRes,
          allColorsRes,
          relatedRes,
        ] = await Promise.all([
          prod.weaving_id ? supabase.from('weavings').select('id, name').eq('id', prod.weaving_id).maybeSingle() : Promise.resolve({ data: null }),
          prod.fabric_id ? supabase.from('fabrics').select('id, name').eq('id', prod.fabric_id).maybeSingle() : Promise.resolve({ data: null }),
          prod.zari_specification_id ? supabase.from('zari_specifications').select('id, name').eq('id', prod.zari_specification_id).maybeSingle() : Promise.resolve({ data: null }),
          prod.pattern_id ? supabase.from('patterns').select('id, name').eq('id', prod.pattern_id).maybeSingle() : Promise.resolve({ data: null }),
          prod.occasion_id ? supabase.from('occasions').select('id, name').eq('id', prod.occasion_id).maybeSingle() : Promise.resolve({ data: null }),
          supabase.from('product_variants').select('id, sku, barcode, price_paise, mrp_paise, color_id').eq('product_id', prodId),
          supabase.from('colors').select('id, name, hex_code'),
          supabase.from('products').select('id, slug, title, base_mrp_paise, base_selling_price_paise, weaving_id').neq('id', prodId).limit(6),
        ]);

        const rawVariants = variantsRes.data || [];
        const variantIds = rawVariants.map((v) => v.id);

        // Fetch Inventory & Media for all variants
        const [invRes, mediaRes, reviewsRes] = await Promise.all([
          variantIds.length > 0
            ? supabase.from('inventory').select('variant_id, quantity, reserved_quantity').in('variant_id', variantIds)
            : Promise.resolve({ data: [] }),
          variantIds.length > 0
            ? supabase.from('product_variant_media').select('variant_id, url, is_primary, display_order').in('variant_id', variantIds)
            : Promise.resolve({ data: [] }),
          variantIds.length > 0
            ? supabase.from('reviews').select('id, rating, review_text, title, created_at, reviewer_name, review_photos ( storage_path )').in('variant_id', variantIds).eq('moderation_status', 'APPROVED')
            : Promise.resolve({ data: [] }),
        ]);

        // Map lookup dictionaries
        const colorsMap = new Map((allColorsRes.data || []).map((c) => [c.id, c]));
        const invMap = new Map((invRes.data || []).map((i) => [i.variant_id, i]));
        
        const mediaMap = new Map<string, string[]>();
        (mediaRes.data || []).forEach((m) => {
          if (!mediaMap.has(m.variant_id)) mediaMap.set(m.variant_id, []);
          if (m.url && typeof m.url === 'string' && m.url.trim().length > 5) {
            mediaMap.get(m.variant_id)!.push(m.url.trim());
          }
        });

        // Assemble All Gallery Images across variants
        const allImagesList: string[] = [];
        mediaMap.forEach((urls) => {
          urls.forEach((u) => {
            if (!allImagesList.includes(u)) allImagesList.push(u);
          });
        });

        if (allImagesList.length === 0) {
          allImagesList.push('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop');
        }

        // Assemble Color Variants
        const colorVariants = rawVariants.map((v, idx) => {
          const col = colorsMap.get(v.color_id);
          const vImages = mediaMap.get(v.id) || [];
          const invItem = invMap.get(v.id);
          const vStock = invItem ? Math.max(0, (invItem.quantity || 0) - (invItem.reserved_quantity || 0)) : 10;

          return {
            id: v.id,
            sku: v.sku || `${prod.slug}-${idx + 1}`,
            name: col?.name || 'Royal Silk',
            hex: col?.hex_code || '#8B1E28',
            stock: vStock,
            images: vImages.length > 0 ? vImages : allImagesList,
          };
        });

        // Parse Care Instructions Metadata
        let parsedMeta: any = {};
        if (prod.care_instructions) {
          try {
            parsedMeta = JSON.parse(prod.care_instructions);
          } catch (e) {}
        }

        // Calculate Stock
        const totalStock = colorVariants.reduce((sum, cv) => sum + cv.stock, 0);

        // Reviews Assembly
        const revs = reviewsRes.data || [];
        const reviewCount = revs.length;
        const rating = reviewCount > 0
          ? Number((revs.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1))
          : 5.0;

        const reviewsList = revs.map((r: any) => {
          const photoList = r.review_photos?.map((p: any) => p.storage_path) || [];
          return {
            id: r.id,
            author: r.reviewer_name || 'Patron',
            location: 'Verified Buyer',
            rating: r.rating || 5,
            date: new Date(r.created_at).toLocaleDateString(),
            title: r.title || 'Exceptional Pure Silk Saree',
            comment: r.review_text || '',
            verified: true,
            photos: photoList,
            photo: photoList[0] || undefined,
          };
        });

        // Related Products Assembly
        const relatedWeavingsMap = new Map((weavingsRes.data ? [weavingsRes.data] : []).map((w: any) => [w.id, w.name]));
        const relatedProducts = (relatedRes.data || []).map((rp: any) => ({
          id: rp.id,
          slug: rp.slug,
          title: rp.title,
          weave: relatedWeavingsMap.get(rp.weaving_id) || 'Mysore Silk',
          priceINR: Math.round((rp.base_selling_price_paise || 2800000) / 100),
          originalPriceINR: Math.round((rp.base_mrp_paise || 3400000) / 100),
          images: allImagesList,
        }));

        const formatted = {
          id: prod.id,
          slug: prod.slug,
          title: prod.title,
          weave: weavingsRes.data?.name || 'Mysore Silk Crepe',
          fabric: fabricsRes.data?.name || '100% Pure Mulberry Silk',
          occasion: occasionsRes.data?.name || (parsedMeta.occasions?.[0]) || 'Bridal & Muhurtham',
          pattern: patternsRes.data?.name || 'Kasuti Diamonds',
          priceINR: Math.round((prod.base_selling_price_paise || 2800000) / 100),
          originalPriceINR: Math.round((prod.base_mrp_paise || 3400000) / 100),
          pricePaise: prod.base_selling_price_paise,
          mrpPaise: prod.base_mrp_paise,
          rating,
          reviewCount,
          reviewsList,
          color: colorVariants[0]?.name || 'Royal Silk',
          colorHex: colorVariants[0]?.hex || '#8B1E28',
          images: allImagesList,
          zariGrade: zarisRes.data?.name || 'Pure 24K Tested Zari',
          dimensions: `${parsedMeta.saree_length || '5.50'}m Saree (${parsedMeta.saree_width || '1.14'}m width)`,
          blouseDimensions: `${parsedMeta.blouse_length || '0.80'}m Blouse Piece`,
          packageWeight: `${parsedMeta.package_weight || '680'}g`,
          packageDimensions: parsedMeta.package_dimensions || '38 x 28 x 4 cm',
          inStock: totalStock > 0,
          stockCount: totalStock,
          description: prod.description || `Handcrafted with meticulous precision by master weavers, this ${weavingsRes.data?.name || 'Heritage'} saree exemplifies generational handloom mastery. Woven from 100% certified ${fabricsRes.data?.name || 'Pure Silk'} with authentic ${zarisRes.data?.name || 'Pure Tested Zari'} embellishments, creating a luminous drape that transitions seamlessly across auspicious celebrations and weddings.`,
          artisanCluster: 'Mysuru Master Loom Guild',
          silkMarkCertified: true,
          colorVariants,
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
      console.error('[Product Detail API] Fast query error:', e);
    }
  }

  return NextResponse.json({ error: 'Saree Creation Not Found' }, { status: 404 });
}
