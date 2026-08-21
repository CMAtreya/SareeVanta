import { NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const weaveParam = searchParams.get('weave');
  const fabricParam = searchParams.get('fabric');
  const occasionParam = searchParams.get('occasion');
  const colorParam = searchParams.get('color');
  const priceMinParam = searchParams.get('price_min');
  const priceMaxParam = searchParams.get('price_max');
  const silkMarkParam = searchParams.get('silk_mark');
  const filterParam = searchParams.get('filter');
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '8', 10);

  const selectedWeaves = weaveParam ? weaveParam.split(',').map((w) => w.trim()) : [];
  const selectedFabrics = fabricParam ? fabricParam.split(',').map((f) => f.trim()) : [];
  const selectedOccasions = occasionParam ? occasionParam.split(',').map((o) => o.trim()) : [];
  const selectedColors = colorParam ? colorParam.split(',').map((c) => c.trim().toLowerCase()) : [];
  const priceMin = priceMinParam ? parseInt(priceMinParam, 10) : 0;
  const priceMax = priceMaxParam ? parseInt(priceMaxParam, 10) : 200000;
  const silkMarkOnly = silkMarkParam === 'true';

  // Compute total counts per attribute across full inventory
  const counts = {
    weaves: {} as Record<string, number>,
    fabrics: {} as Record<string, number>,
    occasions: {} as Record<string, number>,
    colors: {} as Record<string, number>,
  };

  products.forEach((p) => {
    counts.weaves[p.weave] = (counts.weaves[p.weave] || 0) + 1;
    counts.fabrics[p.fabric] = (counts.fabrics[p.fabric] || 0) + 1;
    counts.occasions[p.occasion] = (counts.occasions[p.occasion] || 0) + 1;
    const colorKey = p.color.split(' ')[0];
    counts.colors[colorKey] = (counts.colors[colorKey] || 0) + 1;
  });

  // Filter products
  let filtered = products.filter((p) => {
    if (selectedWeaves.length > 0 && !selectedWeaves.some((w) => p.weave.toLowerCase() === w.toLowerCase())) {
      return false;
    }
    if (selectedFabrics.length > 0 && !selectedFabrics.some((f) => p.fabric.toLowerCase() === f.toLowerCase())) {
      return false;
    }
    if (selectedOccasions.length > 0 && !selectedOccasions.some((o) => p.occasion.toLowerCase() === o.toLowerCase())) {
      return false;
    }
    if (selectedColors.length > 0 && !selectedColors.some((c) => p.color.toLowerCase().includes(c))) {
      return false;
    }
    if (p.priceINR < priceMin || p.priceINR > priceMax) {
      return false;
    }
    if (silkMarkOnly && !p.silkMarkCertified) {
      return false;
    }
    if (filterParam === 'new' && !p.isNew) {
      return false;
    }
    if (filterParam === 'bridal' && !p.isBridal) {
      return false;
    }
    if (filterParam === 'bestseller' && !p.isBestseller) {
      return false;
    }
    return true;
  });

  // Sort products
  if (sortParam === 'price-low') {
    filtered.sort((a, b) => a.priceINR - b.priceINR);
  } else if (sortParam === 'price-high') {
    filtered.sort((a, b) => b.priceINR - a.priceINR);
  } else if (sortParam === 'newest') {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else if (sortParam === 'popularity') {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    // featured: bestsellers first
    filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limitParam));
  const validPage = Math.min(Math.max(1, pageParam), totalPages);
  const startIndex = (validPage - 1) * limitParam;
  const paginatedProducts = filtered.slice(startIndex, startIndex + limitParam);

  return NextResponse.json({
    products: paginatedProducts,
    total,
    page: validPage,
    totalPages,
    limit: limitParam,
    counts,
  });
}
