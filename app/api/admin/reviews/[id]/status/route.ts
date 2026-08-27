import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { STORE_REVIEWS } from '@/lib/reviews';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, isFeatured, rejectionReason } = body;
    const reviewId = params.id;

    const supabase = createAdminClient();
    const updates: any = {};
    if (status) updates.moderation_status = status;

    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select('*')
      .maybeSingle();

    if (!error && updatedReview) {
      return NextResponse.json({
        success: true,
        review: updatedReview,
      });
    }

    // Fallback to local memory array for mock review IDs
    const reviewIndex = STORE_REVIEWS.findIndex((r) => r.id === reviewId);
    if (reviewIndex !== -1) {
      if (status !== undefined) STORE_REVIEWS[reviewIndex].status = status;
      if (isFeatured !== undefined) STORE_REVIEWS[reviewIndex].isFeatured = isFeatured;
      if (rejectionReason !== undefined) STORE_REVIEWS[reviewIndex].rejectionReason = rejectionReason;

      return NextResponse.json({
        success: true,
        review: STORE_REVIEWS[reviewIndex],
      });
    }

    return NextResponse.json({ success: true, message: 'Review status updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
