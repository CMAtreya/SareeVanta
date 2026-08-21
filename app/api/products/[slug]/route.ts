import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Related products from the same weave or same occasion
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.weave === product.weave || p.occasion === product.occasion))
    .slice(0, 4);

  return NextResponse.json({
    product,
    relatedProducts,
  });
}
