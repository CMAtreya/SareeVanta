import { createClient } from '@/lib/supabase/server';
import { getProductBySlug as getMockProductBySlug } from '@/lib/products';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const { data, error } = await supabase
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
          weavings ( name ),
          fabrics ( name ),
          occasions ( name ),
          patterns ( name ),
          border_stylings ( name ),
          zari_specifications ( name ),
          product_variants (
            id,
            sku,
            price_paise,
            mrp_paise,
            is_active,
            colors ( id, name, hex_code ),
            product_variant_media ( url, is_primary, display_order )
          )
        `)
        .eq('slug', slug)
        .single();

      if (!error && data) {
        const variants = data.product_variants || [];
        const firstVariant = variants[0];
        const allImages = variants.flatMap((v: any) => v.product_variant_media?.map((m: any) => m.url) || []);

        const weaveData: any = Array.isArray(data.weavings) ? data.weavings[0] : data.weavings;
        const fabricData: any = Array.isArray(data.fabrics) ? data.fabrics[0] : data.fabrics;
        const occasionData: any = Array.isArray(data.occasions) ? data.occasions[0] : data.occasions;
        const zariData: any = Array.isArray(data.zari_specifications) ? data.zari_specifications[0] : data.zari_specifications;
        const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

        const formatted = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          weave: weaveData?.name || '',
          fabric: fabricData?.name || '',
          occasion: occasionData?.name || '',
          priceINR: Math.round(data.base_selling_price_paise / 100),
          originalPriceINR: Math.round(data.base_mrp_paise / 100),
          pricePaise: data.base_selling_price_paise,
          mrpPaise: data.base_mrp_paise,
          rating: 4.9,
          reviewCount: 12,
          color: colorData?.name || '',
          colorHex: colorData?.hex_code || '#000000',
          images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
          zariGrade: zariData?.name || '',
          dimensions: '5.5m Pure Silk Saree',
          inStock: true,
          description: data.description,
          artisanCluster: 'Varanasi Weavers Guild',
          silkMarkCertified: true,
          colorVariants: variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            name: v.colors?.name || '',
            hex: v.colors?.hex_code || '#000000',
            images: v.product_variant_media?.map((m: any) => m.url) || [],
          })),
        };

        return NextResponse.json({ product: formatted, source: 'database' });
      }
    } catch (e) {
      console.warn('[Product Detail API] Fallback to mock product:', e);
    }
  }

  const mockProduct = getMockProductBySlug(slug);
  if (mockProduct) {
    return NextResponse.json({ product: mockProduct, source: 'mock_fallback' });
  }

  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
