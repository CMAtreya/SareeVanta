import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, blouseOption, tailoringExtraINR = 0 } = body;

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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
