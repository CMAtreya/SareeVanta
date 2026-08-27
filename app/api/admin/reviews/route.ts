import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { STORE_REVIEWS } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');

  const supabase = createAdminClient();
  let query = supabase
    .from('reviews')
    .select(`
      *,
      customers ( name, email, phone ),
      review_photos ( storage_path ),
      products ( title, slug, weavings(name), product_variants ( sku, product_variant_media ( url ) ) )
    `)
    .order('created_at', { ascending: false });

  if (statusParam && statusParam !== 'ALL') {
    query = query.eq('moderation_status', statusParam);
  }

  const { data: dbReviews, error } = await query;

  if (error) {
    console.error('[Admin Reviews API] Supabase error:', error.message);
    return NextResponse.json({ success: false, reviews: [], error: error.message });
  }

  const list = dbReviews || [];
  const formatted = list.map((r: any) => {
    const productData = r.products;
    const firstVariant = productData?.product_variants?.[0];
    const variantMedia = firstVariant?.product_variant_media || [];
    const sareeImage = variantMedia[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop';
    const headline = r.title || (r.rating >= 4 ? 'Exceptional Pure Silk Quality' : 'Authentic Handloom Drape');
    const comment = r.review_text || r.comment || 'Luster and drape comfort is truly extraordinary.';

    return {
      id: r.id,
      orderId: r.order_id ? r.order_id.slice(-6).toUpperCase() : 'NSH-ORD',
      customerName: r.customers?.name || r.reviewer_name || 'Customer Buyer',
      customerEmail: r.customers?.email || 'customer@neelsareehouse.com',
      email: r.customers?.email || 'customer@neelsareehouse.com',
      customerPhone: r.customers?.phone || '',
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      city: 'Mysuru',
      state: 'Karnataka',
      isVerifiedBuyer: Boolean(r.verified_buyer ?? true),
      verifiedBuyer: Boolean(r.verified_buyer ?? true),
      rating: r.rating || 5,
      headline,
      reviewTitle: headline,
      comment,
      reviewText: comment,
      productSlug: productData?.slug || 'saree',
      sareeTitle: productData?.title || 'Heirloom Silk Saree',
      sareeSku: firstVariant?.sku || 'NSH-SKU-MYS-01',
      sku: firstVariant?.sku || 'NSH-SKU-MYS-01',
      sareeWeave: productData?.weavings?.name || 'Pure Mulberry Silk',
      weave: productData?.weavings?.name || 'Pure Mulberry Silk',
      sareeThumbnail: sareeImage,
      sareeImage,
      productImage: sareeImage,
      mediaUrls: (r.review_photos || []).map((p: any) => p.storage_path).filter(Boolean),
      sentiment: r.rating >= 4 ? 'POSITIVE' : r.rating === 3 ? 'NEUTRAL' : 'NEGATIVE',
      createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      createdDate: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      status: r.moderation_status || 'PENDING',
      upvoteCount: 0,
      isFeatured: Boolean(r.is_featured),
    };
  });

  const totalPublished = formatted.filter((r: any) => r.status === 'APPROVED').length;
  const pendingCount = formatted.filter((r: any) => r.status === 'PENDING').length;
  const totalRatingSum = formatted.reduce((acc: number, r: any) => acc + r.rating, 0);
  const averageRating = formatted.length > 0 ? Number((totalRatingSum / formatted.length).toFixed(2)) : 0;

  return NextResponse.json({
    success: true,
    reviews: formatted,
    stats: {
      averageRating,
      totalPublished,
      pendingCount,
      verifiedBuyerPercent: formatted.length > 0 ? 100 : 0,
      ugcMediaCount: formatted.reduce((acc: number, r: any) => acc + (r.mediaUrls?.length || 0), 0),
      starBreakdown: {
        5: formatted.filter((r: any) => r.rating === 5).length,
        4: formatted.filter((r: any) => r.rating === 4).length,
        3: formatted.filter((r: any) => r.rating === 3).length,
        2: formatted.filter((r: any) => r.rating === 2).length,
        1: formatted.filter((r: any) => r.rating === 1).length,
      },
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json({ error: 'reviewId and status required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('reviews')
      .update({ moderation_status: status })
      .eq('id', reviewId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reviewId, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
