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

export let STORE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-8901',
    orderId: 'NSH-2026-8941',
    customerName: 'Smt. Radhika Reddy',
    customerEmail: 'radhika.reddy@gmail.com',
    customerPhone: '+91 99890 98765',
    isVerifiedBuyer: true,
    productSlug: 'bridal-kanchipuram-korvai-gold-brocade',
    sareeTitle: 'Bridal Kanchipuram Korvai Gold Brocade',
    sareeSku: 'NSH-SKU-KAN-04',
    sareeWeave: 'Kanchipuram Raw Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    rating: 5,
    headline: 'Exquisite Korvai weave for my daughter’s Muhurtham!',
    comment: 'The pure 3G gold zari work has a sublime luminescence that indoor studio photos cannot even capture fully. The drape fell perfectly with zero stiffness. Received so many compliments during the ceremony. The Silk Mark certification card in the luxury velvet box was genuine.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    ],
    sentiment: 'POSITIVE',
    status: 'PENDING',
    isFeatured: true,
    createdAt: '22 Aug 2026, 03:40 PM',
  },
  {
    id: 'rev-8902',
    orderId: 'NSH-2026-8820',
    customerName: 'Ananya Deshpande',
    customerEmail: 'ananya.deshpande@tata.com',
    customerPhone: '+91 98450 67890',
    isVerifiedBuyer: true,
    productSlug: 'royal-wodeyar-crimson-crepe-silk',
    sareeTitle: 'Royal Wodeyar Crimson Crepe Silk',
    sareeSku: 'NSH-SKU-MYS-01',
    sareeWeave: 'Mysore Silk Crepe',
    sareeThumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    rating: 5,
    headline: 'Pure 100% Mulberry silk crepe perfection',
    comment: 'The grain of the crepe is buttery soft. The zari border has authentic Mysore Palace motifs. BlueDart express delivery reached Bangalore within 24 hours of dispatch.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    ],
    sentiment: 'POSITIVE',
    status: 'APPROVED',
    isFeatured: true,
    merchantReply: {
      author: 'Sri Chinmaya (Managing Director)',
      text: 'Namaskara Ananya ji, thank you for your gracious words. The Wodeyar collection is woven on our original Mysuru heritage looms. We hope this heirloom brings you joy for decades!',
      repliedAt: '21 Aug 2026, 11:15 AM',
    },
    createdAt: '21 Aug 2026, 09:30 AM',
  },
  {
    id: 'rev-8903',
    orderId: 'NSH-2026-8710',
    customerName: 'Pooja Singhania',
    customerEmail: 'pooja.singhania@delhicorp.in',
    isVerifiedBuyer: true,
    productSlug: 'varanasi-kadwa-katan-meenakari-boota',
    sareeTitle: 'Varanasi Kadwa Katan Meenakari Boota',
    sareeSku: 'NSH-SKU-BAN-03',
    sareeWeave: 'Banarasi Pure Katan',
    sareeThumbnail: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    rating: 4,
    headline: 'Master weaver craft is evident, slight courier delay',
    comment: 'The kadwa floating weft is immaculate and clean at the back. Saree quality is 10/10. Delhi delivery took 4 days due to rainfall, but packing was watertight.',
    mediaUrls: [],
    sentiment: 'POSITIVE',
    status: 'APPROVED',
    isFeatured: false,
    createdAt: '20 Aug 2026, 06:15 PM',
  },
  {
    id: 'rev-8904',
    orderId: 'NSH-2026-8604',
    customerName: 'Kavitha Sundaram',
    customerEmail: 'kavitha.sundaram@gmail.com',
    isVerifiedBuyer: true,
    productSlug: 'yeola-paithani-royal-peacock-asawali',
    sareeTitle: 'Yeola Paithani Royal Peacock Asawali',
    sareeSku: 'NSH-SKU-PAI-02',
    sareeWeave: 'Paithani Pure Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    rating: 5,
    headline: 'The tapestry woven peacock pallu is a masterwork!',
    comment: 'The Asawali vine borders and the multi-colored silk parrot motifs on the pallu are mesmerizing. Truly one of the finest Paithani handlooms in my collection.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    ],
    sentiment: 'POSITIVE',
    status: 'PENDING',
    isFeatured: false,
    createdAt: '20 Aug 2026, 01:20 PM',
  },
  {
    id: 'rev-8905',
    orderId: 'NSH-2026-8490',
    customerName: 'Shalini Verma',
    customerEmail: 'shalini.verma@yahoo.com',
    isVerifiedBuyer: false,
    productSlug: 'champagne-tissue-georgette-floral-zari',
    sareeTitle: 'Champagne Tissue Georgette Floral Zari',
    sareeSku: 'NSH-SKU-TIS-08',
    sareeWeave: 'Tissue Georgette',
    sareeThumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    rating: 2,
    headline: 'Check out cheap sarees on discountsarees24.xyz',
    comment: 'Visit our discount wholesale link for 90% cheaper powerloom copies: http://discountsarees24.xyz/deals',
    mediaUrls: [],
    sentiment: 'NEGATIVE',
    status: 'FLAGGED',
    isFeatured: false,
    createdAt: '19 Aug 2026, 04:10 PM',
  },
  {
    id: 'rev-8906',
    orderId: 'NSH-2026-8320',
    customerName: 'Meera Deshmukh',
    customerEmail: 'meera.deshmukh@outlook.com',
    isVerifiedBuyer: true,
    productSlug: 'patan-double-ikkat-royal-elephant-votive',
    sareeTitle: 'Patan Double Ikkat Royal Elephant Votive',
    sareeSku: 'NSH-SKU-PAT-01',
    sareeWeave: 'Patola Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    rating: 3,
    headline: 'Color tone difference under daylight',
    comment: 'The saree is authentic Patola, but the crimson red appears slightly more rust-toned under natural sunlight compared to indoor photos.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    ],
    sentiment: 'NEUTRAL',
    status: 'APPROVED',
    isFeatured: false,
    createdAt: '18 Aug 2026, 10:45 AM',
  },
];
