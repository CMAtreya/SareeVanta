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
      product_variants ( sku, products ( title ), product_variant_media ( url ) )
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
    const variantMedia = r.product_variants?.product_variant_media || [];
    const sareeImage = variantMedia[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop';

    return {
      id: r.id,
      customerName: r.customers?.name || r.reviewer_name || 'Patron Buyer',
      email: r.customers?.email || 'patron@sareevanta.com',
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      city: 'Mysuru',
      state: 'Karnataka',
      verifiedBuyer: Boolean(r.verified_buyer ?? true),
      rating: r.rating || 5,
      reviewTitle: r.title || 'Exquisite Handloom Craftsmanship',
      reviewText: r.review_text || r.comment || 'Stunning loom weave quality.',
      sareeTitle: r.product_variants?.products?.title || 'Heirloom Silk Saree',
      sareeImage,
      productImage: sareeImage,
      sku: r.product_variants?.sku || 'NSH-SKU-MYS-01',
      weave: 'Pure Mulberry Silk',
      mediaUrls: (r.review_photos || []).map((p: any) => p.storage_path).filter(Boolean),
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
