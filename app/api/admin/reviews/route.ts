import { NextResponse } from 'next/server';
import { STORE_REVIEWS } from '@/lib/reviews';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let list = STORE_REVIEWS;
  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  }

  return NextResponse.json({
    success: true,
    reviews: list,
    stats: {
      averageRating: 4.85,
      totalPublished: STORE_REVIEWS.filter((r) => r.status === 'APPROVED').length,
      pendingCount: STORE_REVIEWS.filter((r) => r.status === 'PENDING').length,
      verifiedBuyerPercent: 94.2,
      ugcMediaCount: STORE_REVIEWS.reduce((acc, r) => acc + r.mediaUrls.length, 0),
      starBreakdown: {
        5: 82,
        4: 12,
        3: 4,
        2: 1,
        1: 1,
      },
    },
  });
}
