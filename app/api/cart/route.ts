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
  let targetVariantId = body.variant_id || body.productId;

  if (!targetVariantId) {
    return NextResponse.json({ error: 'variant_id or productId is required' }, { status: 400 });
  }

  // Verify whether targetVariantId is a variant_id or a product_id/slug
  const { data: directVariant } = await adminSupabase
    .from('product_variants')
    .select('id')
    .eq('id', targetVariantId)
    .maybeSingle();

  if (!directVariant) {
    const { data: prod } = await adminSupabase
      .from('products')
      .select('id, product_variants(id)')
      .or(`slug.eq.${targetVariantId},id.eq.${targetVariantId}`)
      .maybeSingle();

    if (prod && prod.product_variants && prod.product_variants.length > 0) {
      targetVariantId = prod.product_variants[0].id;
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let cartItemId = searchParams.get('id');

  if (!cartItemId) {
    try {
      const body = await request.json();
      cartItemId = body.id || body.productId || body.variant_id;
    } catch (e) {}
  }

  if (!cartItemId) {
    return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 });
  }

  // Get active cart for customer
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('customer_id', user.id)
    .single();

  if (!cart) {
    return NextResponse.json({ success: true });
  }

  // Delete item scoped to user's cart
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)
    .or(`id.eq.${cartItemId},variant_id.eq.${cartItemId}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
