import { createAdminClient } from '@/lib/supabase/admin-client';
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

    const replyData = {
      author: author || 'Sri Chinmaya (Managing Director)',
      text: text.trim(),
      repliedAt: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update({ merchant_reply: replyData })
      .eq('id', reviewId)
      .select('*')
      .maybeSingle();

    if (!error && updatedReview) {
      return NextResponse.json({
        success: true,
        review: updatedReview,
      });
    }

    const reviewIndex = STORE_REVIEWS.findIndex((r) => r.id === reviewId);
    if (reviewIndex !== -1) {
      STORE_REVIEWS[reviewIndex].merchantReply = replyData;
      return NextResponse.json({
        success: true,
        review: STORE_REVIEWS[reviewIndex],
      });
    }

    return NextResponse.json({ success: true, message: 'Reply saved.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
