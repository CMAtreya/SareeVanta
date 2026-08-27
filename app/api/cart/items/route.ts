import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, blouseOption, tailoringExtraINR = 0 } = body;

    const supabase = createClient();

    // 1. Fetch product and variants
    const { data: p } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        base_selling_price_paise,
        base_mrp_paise,
        weavings ( name ),
        product_variants (
          id,
          product_variant_media ( url )
        )
      `)
      .eq('id', productId)
      .maybeSingle();

    if (!p) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    const firstVariant = p.product_variants?.[0];

    // 2. Validate stock_count from inventory table (BFS 9.3)
    if (firstVariant?.id) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('quantity, reserved_quantity')
        .eq('variant_id', firstVariant.id)
        .maybeSingle();

      const availableStock = inv ? Math.max(0, inv.quantity - inv.reserved_quantity) : 5;

      if (availableStock <= 0) {
        return NextResponse.json(
          { error: `"${p.title}" is currently out of stock.` },
          { status: 400 }
        );
      }

      if (quantity > availableStock) {
        return NextResponse.json(
          { error: `Cannot add ${quantity} items. Only ${availableStock} pieces available in stock.` },
          { status: 400 }
        );
      }
    }

    const media = firstVariant?.product_variant_media || [];
    const image = media.length > 0 ? media[0].url : '';

    const formatted = {
      id: p.id,
      slug: p.slug,
      title: p.title,
      priceINR: Math.round(p.base_selling_price_paise / 100),
      originalPriceINR: Math.round(p.base_mrp_paise / 100),
      images: image ? [image] : [],
      inStock: true,
    };

    return NextResponse.json({
      success: true,
      message: `${formatted.title} added to bag`,
      item: {
        product: formatted,
        quantity,
        blouseOption,
        tailoringExtraINR,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
