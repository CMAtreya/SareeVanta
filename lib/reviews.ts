export interface CustomerReview {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isVerifiedBuyer: boolean;
  productSlug: string;
  sareeTitle: string;
  sareeSku: string;
  sareeWeave: string;
  sareeThumbnail: string;
  rating: number;
  headline: string;
  comment: string;
  mediaUrls: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  isFeatured: boolean;
  rejectionReason?: string;
  merchantReply?: {
    author: string;
    text: string;
    repliedAt: string;
  };
  createdAt: string;
}

export let STORE_REVIEWS: CustomerReview[] = [];
