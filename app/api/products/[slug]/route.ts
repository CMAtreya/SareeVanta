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
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  const supabase = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

      // 1. Fetch Master Product Record with all nested relations in a single fast indexed query
      let productQuery = supabase
        .from('products')
        .select(`
          *,
          weavings(name),
          fabrics(name),
          zari_specifications(name),
          patterns(name),
          occasions(name),
          product_variants(
            id, sku, barcode, price_paise, mrp_paise, is_active,
            colors(id, name, hex_code),
            inventory(quantity, reserved_quantity),
            product_variant_media(url, is_primary, display_order)
          )
        `);

      if (isUuid) {
        productQuery = productQuery.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        productQuery = productQuery.eq('slug', slug);
      }

      const { data: prod, error: prodErr } = await productQuery.maybeSingle();

      if (prod && !prodErr) {
        const prodId = prod.id;

        const rawVariants = Array.isArray(prod.product_variants) ? prod.product_variants : [];
        const variantIds = rawVariants.map((v: any) => v.id);

        // Concurrently fetch reviews and related products with their own media
        const [reviewsRes, relatedRes] = await Promise.all([
          variantIds.length > 0
            ? supabase.from('reviews').select('id, rating, review_text, title, created_at, reviewer_name, review_photos ( storage_path )').in('variant_id', variantIds).eq('moderation_status', 'APPROVED')
            : Promise.resolve({ data: [] }),
          supabase.from('products').select(`
            id, slug, title, base_mrp_paise, base_selling_price_paise,
            weavings(name),
            fabrics(name),
            product_variants(
              id,
              colors(name, hex_code),
              product_variant_media(url, is_primary, display_order)
            )
          `).neq('id', prodId).limit(6),
        ]);

        // Assemble media per variant & all gallery images
        const allImagesList: string[] = [];
        const colorVariants = rawVariants.map((v: any, idx: number) => {
          const col = Array.isArray(v.colors) ? v.colors[0] : v.colors;
          const invItem = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
          const vStock = invItem ? Math.max(0, (invItem.quantity || 0) - (invItem.reserved_quantity || 0)) : 0;
          
          const rawMedia = Array.isArray(v.product_variant_media) ? v.product_variant_media : [];
          const sortedMedia = [...rawMedia].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
          const vImages = sortedMedia.map((m: any) => m.url).filter((u: any) => typeof u === 'string' && u.trim().length > 5);

          vImages.forEach((u: string) => {
            if (!allImagesList.includes(u)) allImagesList.push(u);
          });

          return {
            id: v.id,
            sku: v.sku || '',
            name: col?.name || '',
            hex: col?.hex_code || '',
            stock: vStock,
            images: vImages,
          };
        });

        // Fallback to top-level product images if variants have no media
        if (allImagesList.length === 0) {
          allImagesList.push('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80');
        }

        // Reviews Assembly
        const revs = reviewsRes.data || [];
        const reviewCount = revs.length;
        const rating = reviewCount > 0
          ? Number((revs.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1))
          : 0;

        const reviewsList = revs.map((r: any) => {
          const photoList = r.review_photos?.map((p: any) => p.storage_path) || [];
          return {
            id: r.id,
            author: r.reviewer_name || 'Patron',
            location: 'Verified Buyer',
            rating: r.rating || 5,
            date: new Date(r.created_at).toLocaleDateString(),
            title: r.title || 'Product Review',
            comment: r.review_text || '',
            verified: true,
            photos: photoList,
            photo: photoList[0] || undefined,
          };
        });

        const totalStock = colorVariants.reduce((sum: number, v: any) => sum + v.stock, 0);
        const parsedMeta = typeof prod.metadata === 'object' && prod.metadata !== null ? prod.metadata : {};

        const weaveName = Array.isArray(prod.weavings) ? prod.weavings[0]?.name : prod.weavings?.name || '';
        const fabricName = Array.isArray(prod.fabrics) ? prod.fabrics[0]?.name : prod.fabrics?.name || '';
        const occasionName = Array.isArray(prod.occasions) ? prod.occasions[0]?.name : prod.occasions?.name || (parsedMeta.occasions?.[0]) || '';
        const patternName = Array.isArray(prod.patterns) ? prod.patterns[0]?.name : prod.patterns?.name || '';
        const zariGrade = Array.isArray(prod.zari_specifications) ? prod.zari_specifications[0]?.name : prod.zari_specifications?.name || '';

        // Related Products Assembly with each product's own distinct media & color
        const relatedProducts = (relatedRes.data || []).map((rp: any) => {
          const rpWeave = Array.isArray(rp.weavings) ? rp.weavings[0]?.name : rp.weavings?.name || 'Silk';
          const rpFabric = Array.isArray(rp.fabrics) ? rp.fabrics[0]?.name : rp.fabrics?.name || 'Pure Silk';
          const variants = rp.product_variants || [];
          const rpMedia = variants
            .flatMap((v: any) => (v.product_variant_media || []).map((m: any) => m.url))
            .filter((u: any) => typeof u === 'string' && u.trim().length > 5);

          const firstColor = Array.isArray(variants[0]?.colors) ? variants[0]?.colors[0] : variants[0]?.colors;
          const rpColorVariants = variants.map((v: any) => {
            const c = Array.isArray(v.colors) ? v.colors[0] : v.colors;
            return {
              id: v.id,
              name: c?.name || '',
              hex: c?.hex_code || '#8B1E28',
            };
          }).filter((cv: any) => cv.name);

          return {
            id: rp.id,
            slug: rp.slug,
            title: rp.title,
            weave: rpWeave,
            fabric: rpFabric,
            priceINR: Math.round((rp.base_selling_price_paise || 0) / 100),
            originalPriceINR: Math.round((rp.base_mrp_paise || 0) / 100),
            images: rpMedia,
            color: firstColor?.name || '',
            colorHex: firstColor?.hex_code || '#8B1E28',
            colorVariants: rpColorVariants,
          };
        });

        const formatted = {
          id: prod.id,
          slug: prod.slug,
          title: prod.title,
          weave: weaveName,
          fabric: fabricName,
          occasion: occasionName,
          pattern: patternName,
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
          zariGrade: zariGrade,
          dimensions: `${parsedMeta.saree_length || '5.50'}m Saree (${parsedMeta.saree_width || '1.14'}m width)`,
          blouseDimensions: `${parsedMeta.blouse_length || '0.80'}m Blouse Piece`,
          sareeLength: parsedMeta.saree_length ? String(parsedMeta.saree_length) : '5.50',
          sareeWidth: parsedMeta.saree_width ? String(parsedMeta.saree_width) : '1.14',
          blouseLength: parsedMeta.blouse_length ? String(parsedMeta.blouse_length) : '0.80',
          blouseWidth: parsedMeta.blouse_width ? String(parsedMeta.blouse_width) : '1.14',
          hasBlousePiece: parsedMeta.has_blouse_piece !== false,
          packageWeight: `${parsedMeta.package_weight || '680'}g`,
          packageDimensions: parsedMeta.package_dimensions || '38 x 28 x 4 cm',
          inStock: totalStock > 0,
          stockCount: totalStock,
          description: prod.description || `Handcrafted with meticulous precision by master weavers, this ${weaveName} saree exemplifies generational handloom mastery. Woven from 100% certified ${fabricName} with authentic ${zariGrade} embellishments, creating a luminous drape that transitions seamlessly across auspicious celebrations and weddings.`,
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
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
