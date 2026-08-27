import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, blouseOption, tailoringExtraINR = 0 } = body;

    const supabase = createClient();

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
          product_variant_media ( url )
        )
      `)
      .eq('id', productId)
      .maybeSingle();

    if (p) {
      const media = p.product_variants?.[0]?.product_variant_media || [];
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
    }

    return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
