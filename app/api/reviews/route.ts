import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get('variant_id');

  const supabase = createClient();
  let query = supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      verified_buyer,
      created_at,
      customers ( name ),
      review_photos ( storage_path )
    `)
    .eq('moderation_status', 'APPROVED');

  if (variantId) {
    query = query.eq('variant_id', variantId);
  }

  const { data: reviews, error } = await query;

  if (error) {
    return NextResponse.json({ reviews: [] });
  }

  const formattedReviews = (reviews || []).map((r: any) => ({
    id: r.id,
    author: r.customers?.name || 'Verified Buyer',
    rating: r.rating,
    comment: r.review_text,
    verified: r.verified_buyer,
    createdAt: r.created_at,
    photos: r.review_photos?.map((p: any) => p.storage_path) || [],
  }));

  return NextResponse.json({ reviews: formattedReviews });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { order_id, order_item_id, variant_id, rating, review_text, photos = [] } = body;

  if (!order_id || !order_item_id || !variant_id || !rating || !review_text) {
    return NextResponse.json({ error: 'Missing mandatory review fields' }, { status: 400 });
  }

  // Verify delivered order for verified_buyer flag
  const { data: order } = await supabase
    .from('orders')
    .select('order_status')
    .eq('id', order_id)
    .single();

  const isVerifiedBuyer = order?.order_status === 'DELIVERED';

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      customer_id: user.id,
      order_id,
      order_item_id,
      variant_id,
      rating,
      review_text,
      moderation_status: 'PENDING',
      verified_buyer: isVerifiedBuyer,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Max 2 photos per review per DSS specification
  if (photos && Array.isArray(photos)) {
    for (let i = 0; i < Math.min(photos.length, 2); i++) {
      await supabase.from('review_photos').insert({
        review_id: review.id,
        storage_path: photos[i],
        display_order: i + 1,
      });
    }
  }

  return NextResponse.json({ success: true, message: 'Review submitted for moderation' });
}
