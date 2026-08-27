import { createClient } from '@/lib/supabase/server';
import { products as mockProducts } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (customer) {
      const { data: items, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          variant_id,
          product_variants (
            id,
            products (
              id,
              title,
              slug,
              description,
              base_selling_price_paise,
              base_mrp_paise,
              weavings ( name ),
              fabrics ( name ),
              product_variants (
                product_variant_media ( url )
              )
            )
          )
        `)
        .eq('customer_id', customer.id);

      if (!error && items && items.length > 0) {
        const formatted = items.map((w: any) => {
          const prod = w.product_variants?.products || {};
          const weaveData: any = Array.isArray(prod.weavings) ? prod.weavings[0] : prod.weavings;
          const fabricData: any = Array.isArray(prod.fabrics) ? prod.fabrics[0] : prod.fabrics;
          const media = prod.product_variants?.[0]?.product_variant_media || [];

          return {
            id: prod.id || w.id,
            slug: prod.slug || '',
            title: prod.title || 'Saved Saree',
            weave: weaveData?.name || 'Pure Mulberry Silk',
            fabric: fabricData?.name || 'Silk',
            priceINR: Math.round((prod.base_selling_price_paise || 2850000) / 100),
            originalPriceINR: Math.round((prod.base_mrp_paise || 3200000) / 100),
            images: media.map((m: any) => m.url).length > 0
              ? media.map((m: any) => m.url)
              : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'],
            inStock: true,
          };
        });

        return NextResponse.json({ items: formatted, count: formatted.length, source: 'database' });
      }
    }
  }

  // Fallback for guest users
  const defaultSaved = [mockProducts[0], mockProducts[2]];
  return NextResponse.json({
    items: defaultSaved,
    count: defaultSaved.length,
    source: 'guest_fallback',
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();
  const { variant_id, product_id } = body;

  if (!user) {
    return NextResponse.json({ success: true, message: 'Saved to local browser state' });
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!customer) {
    return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
  }

  // Find variant ID if product ID passed
  let targetVariantId = variant_id;
  if (!targetVariantId && product_id) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', product_id)
      .limit(1)
      .single();
    if (variant) targetVariantId = variant.id;
  }

  if (!targetVariantId) {
    return NextResponse.json({ error: 'variant_id or product_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('wishlist_items')
    .upsert({
      customer_id: customer.id,
      variant_id: targetVariantId,
    }, { onConflict: 'customer_id,variant_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Saved to DB wishlist' });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const variant_id = searchParams.get('variant_id');

  if (!user || !variant_id) {
    return NextResponse.json({ success: true });
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (customer) {
    await supabase
      .from('wishlist_items')
      .delete()
      .eq('customer_id', customer.id)
      .eq('variant_id', variant_id);
  }

  return NextResponse.json({ success: true });
}
