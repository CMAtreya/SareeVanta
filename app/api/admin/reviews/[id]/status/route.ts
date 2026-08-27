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
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.moderation_status = status;
    if (isFeatured !== undefined) updates.is_featured = Boolean(isFeatured);
    if (rejectionReason !== undefined) updates.rejection_reason = rejectionReason;

    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select('*')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
