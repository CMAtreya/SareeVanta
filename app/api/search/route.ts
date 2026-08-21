import { NextResponse } from 'next/server';
import { products, weaveCategories } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({
      query: '',
      count: products.length,
      products,
      suggestions: [
        { type: 'category', text: 'Mysore Silk Sarees', url: '/products?weave=Mysore%20Silk' },
        { type: 'category', text: 'Kanchipuram Bridal', url: '/products?weave=Kanchipuram' },
        { type: 'category', text: 'Banarasi Katan Silk', url: '/products?weave=Banarasi' },
        { type: 'category', text: 'Pure Silk Organza', url: '/products?weave=Organza' },
      ],
    });
  }

  const lower = q.toLowerCase();

  // Filter products
  const matchingProducts = products.filter((p) => {
    return (
      p.title.toLowerCase().includes(lower) ||
      p.weave.toLowerCase().includes(lower) ||
      p.fabric.toLowerCase().includes(lower) ||
      p.occasion.toLowerCase().includes(lower) ||
      p.color.toLowerCase().includes(lower) ||
      p.zariGrade.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.artisanCluster.toLowerCase().includes(lower)
    );
  });

  // Build autocomplete suggestions
  const suggestions: { type: 'category' | 'product' | 'query'; text: string; url: string }[] = [];

  // Match weave categories
  weaveCategories.forEach((cat) => {
    if (cat.name.toLowerCase().includes(lower)) {
      suggestions.push({
        type: 'category',
        text: `${cat.name} Silk Sarees`,
        url: `/products?weave=${encodeURIComponent(cat.name)}`,
      });
    }
  });

  // Match products
  matchingProducts.slice(0, 5).forEach((p) => {
    suggestions.push({
      type: 'product',
      text: p.title,
      url: `/products/${p.slug}`,
    });
  });

  // Common phrase suggestion if none
  if (suggestions.length === 0) {
    const popular = [
      { text: 'Mysore Crepe Silk', url: '/products?weave=Mysore%20Silk' },
      { text: 'Kanchipuram Heavy Korvai', url: '/products?weave=Kanchipuram' },
      { text: 'Banarasi Antique Kadwa', url: '/products?weave=Banarasi' },
      { text: 'Pure Silk Organza', url: '/products?weave=Organza' },
    ];
    popular.forEach((pop) => suggestions.push({ type: 'category', text: pop.text, url: pop.url }));
  }

  return NextResponse.json({
    query: q,
    count: matchingProducts.length,
    products: matchingProducts,
    suggestions: suggestions.slice(0, 6),
  });
}
