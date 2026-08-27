import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      weavings(name),
      fabrics(name),
      occasions(name),
      patterns(name),
      border_stylings(name),
      zari_specifications(name),
      product_variants(*, colors(name, hex_code))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: products || [] });
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
    weaving_id,
    fabric_id,
    occasion_id,
    pattern_id,
    border_styling_id,
    zari_specification_id,
    sku,
    color_id,
  } = body;

  if (!title || !slug || !base_selling_price_inr) {
    return NextResponse.json({ error: 'Title, slug, and selling price are required' }, { status: 400 });
  }

  const baseMrpPaise = Math.round((base_mrp_inr || base_selling_price_inr) * 100);
  const baseSellingPricePaise = Math.round(base_selling_price_inr * 100);

  // 1. Create Product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      title,
      slug,
      description: description || '',
      base_mrp_paise: baseMrpPaise,
      base_selling_price_paise: baseSellingPricePaise,
      weaving_id: weaving_id || null,
      fabric_id: fabric_id || null,
      occasion_id: occasion_id || null,
      pattern_id: pattern_id || null,
      border_styling_id: border_styling_id || null,
      zari_specification_id: zari_specification_id || null,
      is_published: true,
    })
    .select('id')
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  // 2. Create Default Variant & Initial Inventory
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

  if (targetColorId) {
    const { data: variant } = await supabase
      .from('product_variants')
      .insert({
        product_id: product.id,
        color_id: targetColorId,
        sku: targetSku,
        price_paise: baseSellingPricePaise,
        mrp_paise: baseMrpPaise,
      })
      .select('id')
      .single();

    if (variant) {
      await supabase.from('inventory').upsert({
        variant_id: variant.id,
        quantity: body.initial_stock || 10,
        reserved_quantity: 0,
      });
    }
  }

  return NextResponse.json({ success: true, product_id: product.id });
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

  return NextResponse.json({ error: 'id or ids query parameter is required' }, { status: 400 });
}
