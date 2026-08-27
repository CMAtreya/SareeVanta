import { createClient } from '@/lib/supabase/server';
import { products as mockProducts } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, blouseOption, tailoringExtraINR = 0 } = body;

    const supabase = createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
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
        const image = media.length > 0
          ? media[0].url
          : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

        const formatted = {
          id: p.id,
          slug: p.slug,
          title: p.title,
          priceINR: Math.round(p.base_selling_price_paise / 100),
          originalPriceINR: Math.round(p.base_mrp_paise / 100),
          images: [image],
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
    }

    // Local fallback for dev environment
    const product = mockProducts.find((p) => p.id === productId) || mockProducts[0];
    return NextResponse.json({
      success: true,
      message: `${product.title} added to bag`,
      item: {
        product,
        quantity,
        blouseOption,
        tailoringExtraINR,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
