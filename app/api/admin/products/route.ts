import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  const supabase = createAdminClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      weavings(name),
      fabrics(name),
      occasions(name),
      patterns(name),
      border_stylings(name),
      zari_specifications(name),
      product_variants(*, colors(name, hex_code), inventory(*), product_variant_media(*))
    `);

  if (id) {
    query = query.eq('id', id);
  } else if (slug) {
    query = query.eq('slug', slug);
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if ((id || slug) && products && products.length > 0) {
    return NextResponse.json({ success: true, product: products[0], products: products });
  }

  return NextResponse.json({ success: true, products: products || [] });
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const {
    title,
    slug,
    description,
    base_mrp_inr,
    base_selling_price_inr,
    weave,
    fabric,
    zari,
    occasion,
    pattern,
    weaving_id,
    fabric_id,
    occasion_id,
    pattern_id,
    border_styling_id,
    zari_specification_id,
    sku,
    color_id,
    initial_stock,
    images = [],
  } = body;

  if (!title || !slug || !base_selling_price_inr) {
    return NextResponse.json({ error: 'Title, slug, and selling price are required' }, { status: 400 });
  }

  // Resolve named taxonomy IDs if not explicitly passed
  const getOrInsertId = async (table: string, val?: string) => {
    if (!val || !val.trim()) return null;
    const clean = val.trim();
    const { data: existing } = await supabase.from(table).select('id').ilike('name', clean).maybeSingle();
    if (existing?.id) return existing.id;
    const { data: created } = await supabase.from(table).insert({ name: clean }).select('id').maybeSingle();
    return created?.id || null;
  };

  const finalWeavingId = weaving_id || (await getOrInsertId('weavings', weave));
  const finalFabricId = fabric_id || (await getOrInsertId('fabrics', fabric));
  const finalOccasionId = occasion_id || (await getOrInsertId('occasions', occasion));
  const finalZariId = zari_specification_id || (await getOrInsertId('zari_specifications', zari));
  const finalPatternId = pattern_id || (await getOrInsertId('patterns', pattern));

  const baseMrpPaise = Math.round((base_mrp_inr || base_selling_price_inr) * 100);
  const baseSellingPricePaise = Math.round(base_selling_price_inr * 100);

  // Check if product already exists by slug
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  let productId = existingProduct?.id;

  if (productId) {
    // Update existing product
    await supabase
      .from('products')
      .update({
        title,
        description: description || '',
        base_mrp_paise: baseMrpPaise,
        base_selling_price_paise: baseSellingPricePaise,
        weaving_id: finalWeavingId,
        fabric_id: finalFabricId,
        occasion_id: finalOccasionId,
        zari_specification_id: finalZariId,
        pattern_id: finalPatternId,
        is_published: true,
      })
      .eq('id', productId);
  } else {
    // Insert new product
    const { data: newProd, error: productError } = await supabase
      .from('products')
      .insert({
        title,
        slug,
        description: description || '',
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

  // 2. Create or Update Variant & Inventory
  const targetSku = sku || `NSH-SKU-${slug.substring(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  let targetColorId = color_id;
  if (!targetColorId) {
    const { data: firstColor } = await supabase.from('colors').select('id').limit(1).maybeSingle();
    if (firstColor) {
      targetColorId = firstColor.id;
    } else {
      const { data: newColor } = await supabase.from('colors').insert({ name: 'Heritage Gold', hex_code: '#D4AF37' }).select('id').single();
      targetColorId = newColor?.id;
    }
  }

  if (targetColorId && productId) {
    // Check existing variant by product_id or sku
    const { data: existingVariant } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle();

    let variantId = existingVariant?.id;

    if (variantId) {
      await supabase
        .from('product_variants')
        .update({
          sku: targetSku,
          price_paise: baseSellingPricePaise,
          mrp_paise: baseMrpPaise,
        })
        .eq('id', variantId);
    } else {
      const { data: newVar } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          color_id: targetColorId,
          sku: targetSku,
          price_paise: baseSellingPricePaise,
          mrp_paise: baseMrpPaise,
        })
        .select('id')
        .single();
      variantId = newVar?.id;
    }

    if (variantId) {
      // Upsert Inventory
      await supabase.from('inventory').upsert({
        variant_id: variantId,
        quantity: Number(initial_stock) || 10,
        reserved_quantity: 0,
      });

      // Update Media Photos: Delete old, insert new
      if (Array.isArray(images) && images.length > 0) {
        const validImages = images.filter(Boolean);
        if (validImages.length > 0) {
          await supabase.from('product_variant_media').delete().eq('variant_id', variantId);
          const mediaInserts = validImages.map((url: string, index: number) => ({
            variant_id: variantId,
            url,
            is_primary: index === 0,
            display_order: index,
          }));
          await supabase.from('product_variant_media').insert(mediaInserts);
        }
      }
    }
  }

  return NextResponse.json({ success: true, product_id: productId });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ids = searchParams.get('ids');

  if (ids) {
    const idList = ids.split(',').filter(Boolean);
    const { error } = await supabase.from('products').delete().in('id', idList);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deletedCount: idList.length });
  }

  if (id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Missing product ID parameter' }, { status: 400 });
}
