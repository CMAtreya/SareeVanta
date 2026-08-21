import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  const savedProducts = [products[0], products[2], products[4]];

  return NextResponse.json({
    items: savedProducts,
    count: savedProducts.length,
  });
}
