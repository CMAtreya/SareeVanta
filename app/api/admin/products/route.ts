import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache, invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');
  const action = searchParams.get('action');

  const supabase = createAdminClient();

  if (action === 'next_sku') {
    const { data: variants } = await supabase.from('product_variants').select('sku, barcode');
    let maxSeq = 0;
    (variants || []).forEach((v: any) => {
      const match = (v.sku || '').match(/NSH-SKU-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    const nextNum = maxSeq + 1;
    const nextSeqStr = String(nextNum).padStart(3, '0');
    return NextResponse.json({
      nextSeq: nextNum,
      nextSku: `NSH-SKU-${nextSeqStr}`,
      nextBarcode: `890${String(100000000 + nextNum)}`,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  if (id || slug) {
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
        weavings(name),
        fabrics(name),
        occasions(name),
        patterns(name),
        border_stylings(name),
        zari_specifications(name),
        product_variants(id, sku, barcode, price_paise, mrp_paise, is_active, colors(name, hex_code), inventory(quantity, reserved_quantity), product_variant_media(url, is_primary))
      `);

    if (id) {
      query = query.eq('id', id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const singleProduct = products && products.length > 0 ? products[0] : null;
    return NextResponse.json({ success: true, product: singleProduct, products: products || [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // Fast Parallel Query for Master Catalog Grid (Sub-100ms Execution)
  try {
    const [
      { data: products, error: pErr },
      { data: variants, error: vErr },
      { data: weavings, error: wErr },
      { data: fabrics, error: fErr },
      { data: zari, error: zErr },
      { data: inventory, error: iErr },
      { data: media, error: mErr },
    ] = await Promise.all([
      supabase.from('products').select('id, title, slug, is_published, base_mrp_paise, base_selling_price_paise, weaving_id, fabric_id, zari_specification_id, created_at').order('created_at', { ascending: false }),
      supabase.from('product_variants').select('id, product_id, sku, barcode, price_paise, mrp_paise, is_active'),
      supabase.from('weavings').select('id, name'),
      supabase.from('fabrics').select('id, name'),
      supabase.from('zari_specifications').select('id, name'),
      supabase.from('inventory').select('variant_id, quantity, reserved_quantity'),
      supabase.from('product_variant_media').select('variant_id, url, is_primary').order('display_order', { ascending: true }),
    ]);

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    const weaveMap = Object.fromEntries((weavings || []).map((w) => [w.id, w.name]));
    const fabricMap = Object.fromEntries((fabrics || []).map((f) => [f.id, f.name]));
    const zariMap = Object.fromEntries((zari || []).map((z) => [z.id, z.name]));
    const invMap = Object.fromEntries((inventory || []).map((i) => [i.variant_id, i]));

    const mediaMap: Record<string, any[]> = {};
    (media || []).forEach((m) => {
      if (!mediaMap[m.variant_id]) mediaMap[m.variant_id] = [];
      mediaMap[m.variant_id].push(m);
    });

    const variantMap: Record<string, any[]> = {};
    (variants || []).forEach((v) => {
      if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
      variantMap[v.product_id].push({
        ...v,
        inventory: invMap[v.id] ? [invMap[v.id]] : [],
        product_variant_media: mediaMap[v.id] || [],
      });
    });

    const assembledProducts = (products || []).map((p) => ({
      ...p,
      weavings: p.weaving_id && weaveMap[p.weaving_id] ? { name: weaveMap[p.weaving_id] } : null,
      fabrics: p.fabric_id && fabricMap[p.fabric_id] ? { name: fabricMap[p.fabric_id] } : null,
      zari_specifications: p.zari_specification_id && zariMap[p.zari_specification_id] ? { name: zariMap[p.zari_specification_id] } : null,
      product_variants: variantMap[p.id] || [],
    }));

    return NextResponse.json({ success: true, products: assembledProducts }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[Admin Products GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch catalog' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
    id,
    product_id,
    title,
    slug,
    description,
    base_mrp_inr,
    base_selling_price_inr,
    weave,
    fabric,
    zari,
    occasion,
    occasions = [],
    badges = [],
    pattern,
    weaving_id,
    fabric_id,
    occasion_id,
    pattern_id,
    border_styling_id,
    zari_specification_id,
    sku,
    barcode,
    color_id,
    color_name,
    color_hex,
    initial_stock,
    images = [],
    // Physical Specs & Dimensions
    has_blouse_piece,
    blouse_length,
    blouse_width,
    saree_length,
    saree_width,
    package_weight,
    package_dimensions,
    is_silk_mark_certified,
    hsn_code,
    gst_rate,
    cost_price,
  } = body;

  if (!title || !base_selling_price_inr) {
    return NextResponse.json({ error: 'Title and selling price are required' }, { status: 400 });
  }

  const effectiveSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // Robust taxonomy resolver with code generation and prioritized exact match
  const getOrInsertId = async (table: string, val?: string) => {
    if (!val || !val.trim()) return null;
    const clean = val.trim();

    // 1. Try exact match first
    const { data: exact } = await supabase
      .from(table)
      .select('id')
      .ilike('name', clean)
      .limit(1)
      .maybeSingle();

    if (exact?.id) return exact.id;

    // 2. Try partial match
    const { data: partial } = await supabase
      .from(table)
      .select('id')
      .or(`name.ilike.%${clean}%,code.ilike.%${clean}%`)
      .limit(1)
      .maybeSingle();

    if (partial?.id) return partial.id;

    // 3. Generate code and insert new entry
    const code = clean.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '').slice(0, 20);
    const { data: created } = await supabase
      .from(table)
      .insert({ name: clean, code: code || 'TAXONOMY', is_active: true })
      .select('id')
      .maybeSingle();

    return created?.id || null;
  };

  const finalWeavingId = weaving_id || (await getOrInsertId('weavings', weave));
  const finalFabricId = fabric_id || (await getOrInsertId('fabrics', fabric));
  const primaryOccasionName = (occasions && occasions.length > 0) ? occasions[0] : occasion;
  const finalOccasionId = occasion_id || (await getOrInsertId('occasions', primaryOccasionName));
  const finalZariId = zari_specification_id || (await getOrInsertId('zari_specifications', zari));
  const finalPatternId = pattern_id || (await getOrInsertId('patterns', pattern));

  const baseMrpPaise = Math.round((base_mrp_inr || base_selling_price_inr) * 100);
  const baseSellingPricePaise = Math.round(base_selling_price_inr * 100);

  // Metadata bundle stored in care_instructions
  const metadataPayload = JSON.stringify({
    occasions: Array.isArray(occasions) && occasions.length > 0 ? occasions : (occasion ? [occasion] : []),
    badges: Array.isArray(badges) ? badges : [],
    has_blouse_piece: has_blouse_piece !== undefined ? Boolean(has_blouse_piece) : true,
    blouse_length: blouse_length || '0.80m',
    blouse_width: blouse_width || '1.14m',
    saree_length: saree_length || '5.5m',
    saree_width: saree_width || '1.14m',
    package_weight: package_weight || '680g',
    package_dimensions: package_dimensions || '38 x 28 x 4 cm',
    is_silk_mark_certified: is_silk_mark_certified !== undefined ? Boolean(is_silk_mark_certified) : true,
    hsn_code: hsn_code || '5007',
    gst_rate: gst_rate || '18',
    cost_price: cost_price || '',
    saved_at: new Date().toISOString(),
  });

  const targetProductId = id || product_id;
  let productId = targetProductId;

  if (targetProductId) {
    // Check if product exists by ID
    const { data: existingById } = await supabase
      .from('products')
      .select('id')
      .eq('id', targetProductId)
      .maybeSingle();

    if (existingById?.id) {
      await supabase
        .from('products')
        .update({
          title,
          slug: effectiveSlug,
          description: description || '',
          care_instructions: metadataPayload,
          base_mrp_paise: baseMrpPaise,
          base_selling_price_paise: baseSellingPricePaise,
          weaving_id: finalWeavingId,
          fabric_id: finalFabricId,
          occasion_id: finalOccasionId,
          zari_specification_id: finalZariId,
          pattern_id: finalPatternId,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetProductId);
      productId = targetProductId;
    }
  }

  if (!productId) {
    // Check if product already exists by slug
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', effectiveSlug)
      .maybeSingle();

    if (existingProduct?.id) {
      await supabase
        .from('products')
        .update({
          title,
          description: description || '',
          care_instructions: metadataPayload,
          base_mrp_paise: baseMrpPaise,
          base_selling_price_paise: baseSellingPricePaise,
          weaving_id: finalWeavingId,
          fabric_id: finalFabricId,
          occasion_id: finalOccasionId,
          zari_specification_id: finalZariId,
          pattern_id: finalPatternId,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProduct.id);
      productId = existingProduct.id;
    } else {
      // Insert new product
      const { data: newProd, error: productError } = await supabase
        .from('products')
        .insert({
          title,
          slug: effectiveSlug,
          description: description || '',
          care_instructions: metadataPayload,
          base_mrp_paise: baseMrpPaise,
          base_selling_price_paise: baseSellingPricePaise,
          weaving_id: finalWeavingId,
          fabric_id: finalFabricId,
          occasion_id: finalOccasionId,
          zari_specification_id: finalZariId,
          pattern_id: finalPatternId,
          border_styling_id: border_styling_id || null,
          is_published: true,
        })
        .select('id')
        .single();

      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 });
      }
      productId = newProd.id;
    }
  }

  // 2. Manage Product Variants & Media Photos (BFS §6.3 & DSS §4 Compliant)
  const targetSku = sku || `NSH-SKU-${effectiveSlug.substring(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const rawNumMatch = (targetSku || '').match(/\d+/);
  const skuNum = rawNumMatch ? parseInt(rawNumMatch[0], 10) : 1;
  const targetBarcode = barcode || `890${String(100000000 + skuNum)}`;

  // Determine list of variants to save
  const rawVariantsList: any[] = Array.isArray(body.color_variants) && body.color_variants.length > 0
    ? body.color_variants
    : [
        {
          id: undefined,
          name: color_name || 'Royal Crimson',
          hex: color_hex || '#8B1E28',
          sku: targetSku,
          barcode: targetBarcode,
          stock: Number(initial_stock) || 1,
          images: Array.isArray(images) ? images : [],
        },
      ];

  if (productId) {
    const savedVariantIds: string[] = [];

    for (let idx = 0; idx < rawVariantsList.length; idx++) {
      const v = rawVariantsList[idx];
      const vName = (v.name || 'Royal Crimson').trim();
      const vHex = (v.hex || '#8B1E28').trim();
      const vSku = v.sku || `${targetSku}-${vName.slice(0, 3).toUpperCase()}`;
      const vBarcode = v.barcode || `890${String(100000000 + skuNum + idx)}`;
      const vStock = typeof v.stock === 'number' ? Math.max(0, v.stock) : Number(initial_stock) || 1;

      // 2a. Resolve color_id (Insert custom color dynamically if needed)
      let colId = v.color_id;
      if (!colId) {
        const { data: exColor } = await supabase.from('colors').select('id').ilike('name', vName).maybeSingle();
        if (exColor?.id) {
          colId = exColor.id;
        } else {
          const { data: newCol } = await supabase.from('colors').insert({ name: vName, hex_code: vHex }).select('id').single();
          colId = newCol?.id;
        }
      }

      // 2b. Upsert product_variant
      let currentVarId = v.id;
      if (currentVarId && !currentVarId.startsWith('var-')) {
        const { data: updatedVar } = await supabase
          .from('product_variants')
          .update({
            color_id: colId,
            sku: vSku,
            barcode: vBarcode,
            price_paise: baseSellingPricePaise,
            mrp_paise: baseMrpPaise,
            is_active: true,
          })
          .eq('id', currentVarId)
          .select('id')
          .maybeSingle();
        if (updatedVar?.id) {
          savedVariantIds.push(updatedVar.id);
          currentVarId = updatedVar.id;
        }
      } else {
        // Check if variant with this SKU already exists for this product
        const { data: exVarBySku } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', productId)
          .eq('sku', vSku)
          .maybeSingle();

        if (exVarBySku?.id) {
          await supabase
            .from('product_variants')
            .update({
              color_id: colId,
              barcode: vBarcode,
              price_paise: baseSellingPricePaise,
              mrp_paise: baseMrpPaise,
              is_active: true,
            })
            .eq('id', exVarBySku.id);
          currentVarId = exVarBySku.id;
          savedVariantIds.push(exVarBySku.id);
        } else {
          const { data: newVar } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              color_id: colId,
              sku: vSku,
              barcode: vBarcode,
              price_paise: baseSellingPricePaise,
              mrp_paise: baseMrpPaise,
              is_active: true,
            })
            .select('id')
            .single();
          if (newVar?.id) {
            currentVarId = newVar.id;
            savedVariantIds.push(newVar.id);
          }
        }
      }

      // 2c. Upsert Inventory & Media
      if (currentVarId) {
        await supabase.from('inventory').upsert({
          variant_id: currentVarId,
          quantity: vStock,
          reserved_quantity: 0,
        });

        const vImages = Array.isArray(v.images)
          ? v.images.filter((img: any) => typeof img === 'string' && img.trim().length > 5)
          : [];

        if (vImages.length > 0) {
          await supabase.from('product_variant_media').delete().eq('variant_id', currentVarId);
          const mediaInserts = vImages.map((url: string, mIdx: number) => ({
            variant_id: currentVarId,
            url: url.trim(),
            is_primary: mIdx === 0,
            display_order: mIdx,
          }));
          await supabase.from('product_variant_media').insert(mediaInserts);
        }
      }
    }

    // 2d. Clean up removed variants
    if (savedVariantIds.length > 0) {
      const { data: allExisting } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId);
      const toDelete = (allExisting || []).filter((ex) => !savedVariantIds.includes(ex.id)).map((ex) => ex.id);
      if (toDelete.length > 0) {
        await supabase.from('product_variant_media').delete().in('variant_id', toDelete);
        await supabase.from('inventory').delete().in('variant_id', toDelete);
        await supabase.from('product_variants').delete().in('id', toDelete);
      }
    }
  }

  invalidateCache('admin_products_');
  invalidateCache('storefront_products_');
  invalidateCache('full_catalog_snapshot');
  invalidateCache('product_');
  invalidateCache('pdp_product_');

  return NextResponse.json({ success: true, product_id: productId });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ids = searchParams.get('ids');

  const idList = ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : id ? [id.trim()] : [];

  if (idList.length === 0) {
    return NextResponse.json({ error: 'Missing product ID parameter' }, { status: 400 });
  }

  try {
    // 1. Get all variant IDs for these products
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id')
      .in('product_id', idList);

    const variantIds = variants?.map((v) => v.id) || [];

    if (variantIds.length > 0) {
      // A. Delete review photos & reviews for these variants
      const { data: revs } = await supabase
        .from('reviews')
        .select('id')
        .in('variant_id', variantIds);
      const revIds = revs?.map((r) => r.id) || [];
      if (revIds.length > 0) {
        await supabase.from('review_photos').delete().in('review_id', revIds);
        await supabase.from('reviews').delete().in('id', revIds);
      }

      // B. Delete wishlist_items, cart_items, order_items
      await supabase.from('wishlist_items').delete().in('variant_id', variantIds);
      await supabase.from('cart_items').delete().in('variant_id', variantIds);
      await supabase.from('order_items').delete().in('variant_id', variantIds);

      // C. Delete inventory records for variants
      await supabase.from('inventory').delete().in('variant_id', variantIds);

      // D. Delete media records for variants
      await supabase.from('product_variant_media').delete().in('variant_id', variantIds);

      // E. Delete variants
      await supabase.from('product_variants').delete().in('id', variantIds);
    }

    // 2. Delete collection items
    try {
      await supabase.from('collection_items').delete().in('product_id', idList);
    } catch (e) {}

    // 3. Delete products permanently
    const { error: prodDeleteError } = await supabase
      .from('products')
      .delete()
      .in('id', idList);

    if (prodDeleteError) {
      console.error('[Admin Products DELETE] Error deleting products:', prodDeleteError);
      return NextResponse.json({ error: prodDeleteError.message }, { status: 500 });
    }

    invalidateCache('admin_products_');
    invalidateCache('storefront_products_');
    invalidateCache('full_catalog_snapshot');
    invalidateCache('product_');
    invalidateCache('pdp_product_');

    return NextResponse.json({ success: true, deletedCount: idList.length });
  } catch (err: any) {
    console.error('[Admin Products DELETE] Exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete products' }, { status: 500 });
  }
}
