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

    const reviewIndex = STORE_REVIEWS.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    if (status !== undefined) {
      STORE_REVIEWS[reviewIndex].status = status;
    }
    if (isFeatured !== undefined) {
      STORE_REVIEWS[reviewIndex].isFeatured = isFeatured;
    }
    if (rejectionReason !== undefined) {
      STORE_REVIEWS[reviewIndex].rejectionReason = rejectionReason;
    }

    return NextResponse.json({
      success: true,
      review: STORE_REVIEWS[reviewIndex],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
