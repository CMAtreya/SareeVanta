import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import { weaveCategories, fabricFilters, occasionFilters, availableColors, Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

function formatDbProduct(p: any): Product {
  const firstVariant = p.product_variants?.[0];
  const weaveData: any = Array.isArray(p.weavings) ? p.weavings[0] : p.weavings;
  const fabricData: any = Array.isArray(p.fabrics) ? p.fabrics[0] : p.fabrics;
  const occasionData: any = Array.isArray(p.occasions) ? p.occasions[0] : p.occasions;
  const patternData: any = Array.isArray(p.patterns) ? p.patterns[0] : p.patterns;
  const zariData: any = Array.isArray(p.zari_specifications) ? p.zari_specifications[0] : p.zari_specifications;
  
  const allVariantImages = (p.product_variants || [])
    .flatMap((v: any) => (v.product_variant_media || []).map((m: any) => m.url))
    .filter(Boolean);

  const images = allVariantImages;

  const colorData: any = Array.isArray(firstVariant?.colors) ? firstVariant?.colors[0] : firstVariant?.colors;

  const pricePaise = p.base_selling_price_paise || (firstVariant?.price_paise ?? 0);
  const mrpPaise = p.base_mrp_paise || (firstVariant?.mrp_paise ?? pricePaise);
  const priceINR = Math.round(pricePaise / 100);
  const originalPriceINR = Math.round(mrpPaise / 100);

  const weaveName = weaveData?.name || '';
  const fabricName = fabricData?.name || '';
  const occasionName = occasionData?.name || '';
  const zariGrade = zariData?.name || '';

  let parsedMeta: any = {};
  if (p.care_instructions) {
    try {
      parsedMeta = JSON.parse(p.care_instructions);
    } catch (e) {}
  }

  const badgesList: string[] = Array.isArray(parsedMeta.badges) ? parsedMeta.badges : [];
  const occasionsList: string[] = Array.isArray(parsedMeta.occasions)
    ? parsedMeta.occasions
    : (occasionName ? [occasionName] : []);

  const createdAtMs = p.created_at ? new Date(p.created_at).getTime() : 0;
  const isWithin30Days = createdAtMs > 0 && (Date.now() - createdAtMs) < (30 * 24 * 60 * 60 * 1000);

  const isNew = badgesList.includes('New Arrival') || isWithin30Days;
  const isBestseller = badgesList.includes('Best Seller');
  const isBridal =
    badgesList.includes('Bridal Edit') ||
    occasionName.toLowerCase().includes('bridal') ||
    occasionsList.some((o: string) => o.toLowerCase().includes('bridal'));

  // Assemble full colorVariants array
  const rawVariants = Array.isArray(p.product_variants) ? p.product_variants : [];
  const colorVariants = rawVariants.map((v: any, idx: number) => {
    const vColor = Array.isArray(v.colors) ? v.colors[0] : v.colors;
    const vMedia = (v.product_variant_media || []).map((m: any) => m.url).filter(Boolean);
    const invItem = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
    const vStock = invItem
      ? Math.max(0, (invItem.quantity || 0) - (invItem.reserved_quantity || 0))
      : (v.is_active !== false ? 1 : 0);

    return {
      id: v.id,
      sku: v.sku || `${p.slug}-${idx + 1}`,
      name: vColor?.name || '',
      hex: vColor?.hex_code || '',
      stock: vStock,
      images: vMedia,
    };
  });

  const totalStock = colorVariants.reduce((sum: number, cv: any) => sum + (cv.stock || 0), 0);

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    weave: weaveName,
    fabric: fabricName,
    pattern: patternData?.name || '',
    occasion: occasionName || occasionsList[0] || '',
    occasions: occasionsList,
    specialBadges: badgesList,
    priceINR,
    originalPriceINR,
    rating: 0,
    reviewCount: 0,
    color: colorData?.name || (colorVariants[0]?.name || ''),
    colorHex: colorData?.hex_code || (colorVariants[0]?.hex || ''),
    images,
    colorVariants: colorVariants.length > 0 ? colorVariants : undefined,
    zariGrade: zariGrade,
    dimensions: parsedMeta.saree_length && parsedMeta.saree_width 
      ? `${parsedMeta.saree_length} m X ${parsedMeta.saree_width} m` 
      : '5.50 m X 1.14 m',
    sareeLength: parsedMeta.saree_length ? String(parsedMeta.saree_length) : '5.50',
    sareeWidth: parsedMeta.saree_width ? String(parsedMeta.saree_width) : '1.14',
    blouseLength: parsedMeta.blouse_length ? String(parsedMeta.blouse_length) : '0.80',
    blouseWidth: parsedMeta.blouse_width ? String(parsedMeta.blouse_width) : '1.14',
    hasBlousePiece: parsedMeta.has_blouse_piece !== false,
    inStock: totalStock > 0,
    stockCount: totalStock,
    isBridal,
    isNew,
    isBestseller,
    silkMarkCertified: parsedMeta.is_silk_mark_certified !== false,
    description: p.description || '',
    artisanCluster: 'Mysuru Master Loom Guild',
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const weaveParam = searchParams.get('weave') || searchParams.get('category');
  const fabricParam = searchParams.get('fabric');
  const occasionParam = searchParams.get('occasion');
  const patternParam = searchParams.get('pattern');
  const colorParam = searchParams.get('color');
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');
  const silkMark = searchParams.get('silk_mark');
  const sort = searchParams.get('sort') || 'featured';
  const search = searchParams.get('q') || searchParams.get('search');
  const filter = searchParams.get('filter');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '12', 10));

  let catalog: Product[] = [];
  let weavingsData: any[] = [];
  let fabricsData: any[] = [];
  let occasionsData: any[] = [];

  const supabase = createAdminClient();

  try {
    const { data: rawProducts, error: pErr } = await supabase
      .from('products')
      .select(`
        id, title, slug, description, care_instructions, base_mrp_paise, base_selling_price_paise, is_published, created_at,
        weavings(name),
        fabrics(name),
        occasions(name),
        patterns(name),
        zari_specifications(name),
        product_variants(
          id, sku, barcode, price_paise, mrp_paise, is_active,
          colors(id, name, hex_code),
          inventory(quantity, reserved_quantity),
          product_variant_media(url, is_primary, display_order)
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!pErr && rawProducts && rawProducts.length > 0) {
      catalog = rawProducts.map(formatDbProduct);
    } else {
      catalog = [];
    }
  } catch (e) {
    console.error('[Products API] Error fetching from database:', e);
    catalog = [];
  }

  const normalize = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  // Dynamic union of static presets + live database additions + catalog-derived taxonomies
  const allWeaves = Array.from(
    new Set([
      ...weaveCategories.map((w) => w.name),
      ...weavingsData.map((w: any) => w.name).filter(Boolean),
      ...catalog.map((p) => p.weave).filter(Boolean),
    ])
  ).filter((w) => w !== 'Tissue Georgette');

  const allFabrics = Array.from(
    new Set([
      ...fabricFilters,
      ...fabricsData.map((f: any) => f.name).filter(Boolean),
      ...catalog.map((p) => p.fabric).filter(Boolean),
    ])
  );

  const allOccasions = Array.from(
    new Set([
      ...occasionFilters,
      ...occasionsData.map((o: any) => o.name).filter(Boolean),
      ...catalog.flatMap((p) => p.occasions || [p.occasion]).filter(Boolean),
    ])
  );

  // Calculate dynamic facet counts across the full catalog accurately
  const counts = {
    weaves: {} as Record<string, number>,
    fabrics: {} as Record<string, number>,
    occasions: {} as Record<string, number>,
    colors: {} as Record<string, number>,
  };

  allWeaves.forEach((wName) => {
    const nWc = normalize(wName);
    counts.weaves[wName] = catalog.filter((p) => {
      const nPw = normalize(p.weave);
      return nPw === nWc || nPw.includes(nWc) || nWc.includes(nPw);
    }).length;
  });

  allFabrics.forEach((fName) => {
    const nF = normalize(fName);
    counts.fabrics[fName] = catalog.filter((p) => {
      const nPf = normalize(p.fabric);
      return nPf === nF || nPf.includes(nF) || nF.includes(nPf);
    }).length;
  });

  allOccasions.forEach((oName) => {
    const nO = normalize(oName);
    const oTokens = nO.split(' ').filter((t) => t.length > 2);
    counts.occasions[oName] = catalog.filter((p) => {
      const nPo = normalize(p.occasion);
      const allOccs = (p.occasions || []).map(normalize);
      return (
        nPo === nO ||
        allOccs.includes(nO) ||
        oTokens.some((t) => nPo.includes(t) || allOccs.some((ao) => ao.includes(t)))
      );
    }).length;
  });

  availableColors.forEach((c) => {
    const lc = c.matchKey.toLowerCase();
    counts.colors[c.matchKey] = catalog.filter((p) => {
      const pc = (p.color || '').toLowerCase();
      return pc.includes(lc) || lc.includes(pc);
    }).length;
  });

  // Apply Filters
  let filtered = [...catalog];

  // 1. Text search query
  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.weave.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        ((p as any).pattern && (p as any).pattern.toLowerCase().includes(q)) ||
        (p.zariGrade && p.zariGrade.toLowerCase().includes(q)) ||
        p.color.toLowerCase().includes(q)
      );
    });
  }

  // 2. Weave filter
  if (weaveParam) {
    const selected = weaveParam.split(',').map(normalize).filter(Boolean);
    if (selected.length > 0) {
      filtered = filtered.filter((p) => {
        const nPw = normalize(p.weave);
        return selected.some((sw) => nPw === sw || nPw.includes(sw) || sw.includes(nPw));
      });
    }
  }

  // 3. Fabric filter
  if (fabricParam) {
    const selected = fabricParam.split(',').map(normalize).filter(Boolean);
    if (selected.length > 0) {
      filtered = filtered.filter((p) => {
        const nPf = normalize(p.fabric);
        return selected.some((sf) => nPf === sf || nPf.includes(sf) || sf.includes(nPf));
      });
    }
  }

  // 4. Occasion filter
  if (occasionParam) {
    const selected = occasionParam.split(',').map(normalize).filter(Boolean);
    if (selected.length > 0) {
      filtered = filtered.filter((p) => {
        const nPo = normalize(p.occasion);
        const allOccs = (p.occasions || []).map(normalize);
        return selected.some((so) => {
          const tokens = so.split(' ').filter((t) => t.length > 2);
          return (
            nPo === so ||
            allOccs.includes(so) ||
            tokens.some((t) => nPo.includes(t) || allOccs.some((ao) => ao.includes(t)))
          );
        });
      });
    }
  }

  // 5. Pattern filter
  if (patternParam) {
    const selected = patternParam.split(',').map(normalize).filter(Boolean);
    if (selected.length > 0) {
      filtered = filtered.filter((p) => {
        const nPat = normalize((p as any).pattern || '');
        const titleLower = normalize(p.title);
        const descLower = normalize(p.description);
        return selected.some(
          (sp) => nPat === sp || nPat.includes(sp) || titleLower.includes(sp) || descLower.includes(sp)
        );
      });
    }
  }

  // 6. Color filter (supports single or comma-separated)
  if (colorParam) {
    const selected = colorParam.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
    if (selected.length > 0) {
      filtered = filtered.filter((p) => {
        const pc = (p.color || '').toLowerCase();
        return selected.some((sc) => pc.includes(sc) || sc.includes(pc));
      });
    }
  }

  // 7. Price range filter
  if (priceMin) {
    const minVal = parseInt(priceMin, 10);
    if (!isNaN(minVal)) {
      filtered = filtered.filter((p) => p.priceINR >= minVal);
    }
  }
  if (priceMax) {
    const maxVal = parseInt(priceMax, 10);
    if (!isNaN(maxVal)) {
      filtered = filtered.filter((p) => p.priceINR <= maxVal);
    }
  }

  // 8. Silk mark filter
  if (silkMark === 'true') {
    filtered = filtered.filter((p) => p.silkMarkCertified);
  }

  // 9. Special collection filters
  if (filter === 'new') {
    filtered = filtered.filter((p) => p.isNew);
  } else if (filter === 'bridal') {
    filtered = filtered.filter((p) => p.isBridal || p.occasion?.toLowerCase().includes('bridal') || p.title.toLowerCase().includes('bridal'));
  }

  // Sorting
  let sorted = [...filtered];
  if (sort === 'price-low') {
    sorted.sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
  } else if (sort === 'price-high') {
    sorted.sort((a, b) => (b.priceINR || 0) - (a.priceINR || 0));
  } else if (sort === 'popularity') {
    sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  } else if (sort === 'newest') {
    sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  // Pagination
  const total = sorted.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = sorted.slice((page - 1) * limit, page * limit);

  const responsePayload = {
    products: paginated,
    total,
    totalPages,
    page,
    limit,
    counts,
    availableWeaves: allWeaves,
    availableFabrics: allFabrics,
    availableOccasions: allOccasions,
    source: 'database',
  };

  return NextResponse.json(responsePayload, {
    headers: {
      'Cache-Control': 'no-cache, must-revalidate',
    },
  });
}

