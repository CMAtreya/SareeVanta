import { NextResponse } from 'next/server';
import { STORE_REVIEWS } from '@/lib/reviews';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { author, text } = body;
    const reviewId = params.id;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Reply text cannot be empty' }, { status: 400 });
    }

    const reviewIndex = STORE_REVIEWS.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    STORE_REVIEWS[reviewIndex].merchantReply = {
      author: author || 'Sri Chinmaya (Managing Director)',
      text: text.trim(),
      repliedAt: 'Just now',
    };

    return NextResponse.json({
      success: true,
      review: STORE_REVIEWS[reviewIndex],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
