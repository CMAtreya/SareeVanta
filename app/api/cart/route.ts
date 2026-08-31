import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Login required for cart.' }, { status: 401 });
  }

  // Get active cart for customer
  let { data: cart } = await adminSupabase
    .from('carts')
    .select('id')
    .eq('customer_id', user.id)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error: createError } = await adminSupabase
      .from('carts')
      .insert({ customer_id: user.id })
      .select('id')
      .single();

    if (createError || !newCart) {
      return NextResponse.json({ error: 'Failed to initialize cart' }, { status: 500 });
    }
    cart = newCart;
  }

  const { data: items } = await adminSupabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      is_selected,
      product_variants (
        id,
        sku,
        price_paise,
        mrp_paise,
        colors ( name, hex_code ),
        products (
          id,
          title,
          slug,
          base_selling_price_paise,
          base_mrp_paise,
          fabrics ( name ),
          weavings ( name )
        ),
        product_variant_media (
          url,
          display_order,
          is_primary
        )
      )
    `)
    .eq('cart_id', cart.id);

  return NextResponse.json({ cart_id: cart.id, items: items || [] });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Login required for cart.' }, { status: 401 });
  }

  const body = await request.json();
  let targetVariantId = body.variantId || body.variant_id || body.productId;

  if (!targetVariantId) {
    return NextResponse.json({ error: 'variant_id or productId is required' }, { status: 400 });
  }

  // Verify whether targetVariantId is already a valid variant_id
  const { data: directVariant } = await adminSupabase
    .from('product_variants')
    .select('id')
    .eq('id', targetVariantId)
    .maybeSingle();

  if (!directVariant) {
    // If not a direct variant ID, look up the variant by SKU or product ID/slug
    if (body.sku) {
      const { data: skuVar } = await adminSupabase
        .from('product_variants')
        .select('id')
        .eq('sku', body.sku)
        .maybeSingle();
      if (skuVar) {
        targetVariantId = skuVar.id;
      }
    }

    if (!directVariant && !body.sku) {
      const { data: prod } = await adminSupabase
        .from('products')
        .select('id, product_variants(id)')
        .or(`slug.eq.${targetVariantId},id.eq.${targetVariantId}`)
        .maybeSingle();

      if (prod && prod.product_variants && prod.product_variants.length > 0) {
        targetVariantId = prod.product_variants[0].id;
      }
    }
  }

  const quantity = body.quantity || 1;

  // Ensure cart exists
  let { data: cart } = await adminSupabase
    .from('carts')
    .select('id')
    .eq('customer_id', user.id)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error: createError } = await adminSupabase
      .from('carts')
      .insert({ customer_id: user.id })
      .select('id')
      .single();

    if (createError || !newCart) {
      return NextResponse.json({ error: 'Failed to create cart session' }, { status: 500 });
    }
    cart = newCart;
  }

  // Upsert item
  const { data: cartItem, error } = await adminSupabase
    .from('cart_items')
    .upsert({
      cart_id: cart.id,
      variant_id: targetVariantId,
      quantity,
      is_selected: true,
    }, { onConflict: 'cart_id,variant_id' })
    .select('*')
    .single();

  if (error) {
    console.error('[Cart API] Error upserting cart item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, item: cartItem });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get active cart for customer
  const { data: cart } = await adminSupabase
    .from('carts')
    .select('id')
    .eq('customer_id', user.id)
    .maybeSingle();

  if (!cart) {
    return NextResponse.json({ success: true });
  }

  const { searchParams } = new URL(request.url);
  let cartItemId = searchParams.get('id');
  let clearAll = searchParams.get('clearAll') === 'true';
  let variantIds: string[] = [];

  try {
    const body = await request.json();
    if (body.clearAll) clearAll = true;
    if (Array.isArray(body.variantIds)) variantIds = body.variantIds;
    if (Array.isArray(body.items)) {
      variantIds = body.items.map((it: any) => it.variantId || it.variant_id || it.productId).filter(Boolean);
    }
    if (!cartItemId) {
      cartItemId = body.id || body.variantId || body.variant_id || body.productId;
    }
  } catch (e) {}

  if (clearAll) {
    const { error } = await adminSupabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, cleared: true });
  }

  if (variantIds.length > 0) {
    const { error } = await adminSupabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .in('variant_id', variantIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, removedCount: variantIds.length });
  }

  if (cartItemId) {
    const { error } = await adminSupabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .or(`id.eq.${cartItemId},variant_id.eq.${cartItemId}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Item identifier required' }, { status: 400 });
}
