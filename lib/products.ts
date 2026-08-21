export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  photo?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  weave: string;
  fabric: string;
  occasion: string;
  priceINR: number;
  originalPriceINR?: number;
  rating: number;
  reviewCount: number;
  color: string;
  colorHex: string;
  images: string[];
  zariGrade: string;
  blousePiece: string;
  dimensions: string;
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isBridal?: boolean;
  isBestseller?: boolean;
  description: string;
  artisanCluster: string;
  silkMarkCertified: boolean;
  colorVariants?: ColorVariant[];
  reviewsList?: Review[];
}

export const products: Product[] = [
  {
    id: 'mysore-royal-crimson',
    slug: 'mysore-royal-wodeyar-crimson-crepe-silk',
    title: 'Royal Wodeyar Crimson Crepe Silk Saree',
    weave: 'Mysore Silk',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Bridal & Muhurtham',
    priceINR: 28500,
    originalPriceINR: 32000,
    rating: 4.9,
    reviewCount: 42,
    color: 'Crimson Red',
    colorHex: '#8B1E28',
    stockCount: 2,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    ],
    colorVariants: [
      {
        name: 'Crimson Red',
        hex: '#8B1E28',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        name: 'Peacock Teal',
        hex: '#005F73',
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        name: 'Champagne Gold',
        hex: '#D4AF37',
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
        ],
      },
    ],
    zariGrade: 'Tested Pure Gold & Silver Ribbon',
    blousePiece: 'Included (0.8m Unstitched Running Crepe)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    isBestseller: true,
    isBridal: true,
    description:
      'Handcrafted under the legacy of Mysuru royal looms. Woven with 100% natural Karnataka Mulberry Silk and twisted crepe yarn, featuring authentic Mysore royal insignia borders.',
    artisanCluster: 'Devaraja Loom Guild, Mysuru',
    silkMarkCertified: true,
    reviewsList: [
      {
        id: 'rev-1',
        author: 'Ananya S. Deshmukh',
        location: 'Bengaluru',
        rating: 5,
        date: '14 Feb 2026',
        title: 'Breathtaking drape & royal luster',
        comment:
          'Draped this for my sister’s wedding reception. The Mysore crepe silk feels almost weightless yet holds structural pleats flawlessly. The 24K tested zari gleams with vintage elegance under ambient lights.',
        verified: true,
        photo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'rev-2',
        author: 'Priya Narayanan',
        location: 'Mysuru',
        rating: 5,
        date: '28 Jan 2026',
        title: 'Authentic heirloom quality with Silk Mark',
        comment:
          'Scanned the Silk Mark code and confirmed the 100% pure Mulberry protein filaments. The complimentary fall and pico finish was top-notch. Arrived in a wooden cedar box.',
        verified: true,
      },
      {
        id: 'rev-3',
        author: 'Dr. Madhuri Rao',
        location: 'Hyderabad',
        rating: 4.8,
        date: '10 Jan 2026',
        title: 'Pure understated royalty',
        comment:
          'Exceeded all expectations. The color is deep auspicious crimson without being garish. Tailoring was done to exact blouse measurements.',
        verified: true,
      },
    ],
  },
  {
    id: 'kanchi-muhurtham-gold',
    slug: 'kanchipuram-heavy-korvai-bridal-silk-saree',
    title: 'Kanchipuram Heavy Korvai Bridal Silk Saree',
    weave: 'Kanchipuram',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Bridal & Muhurtham',
    priceINR: 64000,
    originalPriceINR: 72000,
    rating: 5.0,
    reviewCount: 58,
    color: 'Vermilion Red & Gold',
    colorHex: '#9E2A2B',
    stockCount: 3,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    ],
    colorVariants: [
      {
        name: 'Vermilion Red & Gold',
        hex: '#9E2A2B',
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        name: 'Rani Pink & Gold',
        hex: '#C2185B',
        images: [
          'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        ],
      },
    ],
    zariGrade: '57% Silver / 0.6% 24K Pure Gold',
    blousePiece: 'Included (0.8m Contrast Brocade Blouse)',
    dimensions: '6.2m Comprehensive Bridal Length',
    inStock: true,
    isBridal: true,
    isBestseller: true,
    description:
      'A true generational heirloom crafted with the traditional three-shuttle Korvai interlocking technique. Adorned with Mayil (peacock) and Yanai (elephant) pure zari motifs.',
    artisanCluster: 'Kanchi Master Guild, Tamil Nadu',
    silkMarkCertified: true,
    reviewsList: [
      {
        id: 'rev-k1',
        author: 'Sowmya Ramakrishnan',
        location: 'Chennai',
        rating: 5,
        date: '02 Feb 2026',
        title: 'Masterpiece for my Muhurtham ceremony',
        comment:
          'The Korvai interlock between the vermilion body and the solid gold pallu is pure poetry. Heavy, regal, and authentic three-shuttle handloom craft.',
        verified: true,
        photo: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'banarasi-kadwa-emerald',
    slug: 'banarasi-pure-katan-silk-shikargah-saree',
    title: 'Banarasi Pure Katan Silk Shikargah Saree',
    weave: 'Banarasi',
    fabric: 'Raw Silk',
    occasion: 'Reception & Cocktail',
    priceINR: 46000,
    originalPriceINR: 52000,
    rating: 4.8,
    reviewCount: 31,
    color: 'Emerald Green',
    colorHex: '#1B4D3E',
    stockCount: 1,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    ],
    colorVariants: [
      {
        name: 'Emerald Green',
        hex: '#1B4D3E',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
        ],
      },
    ],
    zariGrade: 'Fine Antique Kadwa Micro-Zari',
    blousePiece: 'Included (0.8m Brocade Blouse)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    isNew: true,
    description:
      'Hand-woven using the meticulous Kadwa technique where each floral motif is individually engraved without reverse floats for maximum comfort.',
    artisanCluster: 'Mubarakpur Looms, Varanasi',
    silkMarkCertified: true,
  },
  {
    id: 'mysore-champagne-gold',
    slug: 'mysuru-champagne-gold-tissue-georgette',
    title: 'Mysuru Champagne Gold Tissue Georgette',
    weave: 'Mysore Silk',
    fabric: 'Georgette',
    occasion: 'Festive & Puja',
    priceINR: 36000,
    rating: 4.9,
    reviewCount: 27,
    color: 'Champagne Gold',
    colorHex: '#D4AF37',
    stockCount: 4,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Full Warp Real Zari Ribbon',
    blousePiece: 'Included (0.9m Contrast Brocade)',
    dimensions: '5.5m Saree + 0.9m Blouse',
    inStock: true,
    isBestseller: true,
    description:
      'Combines the fluid drape of royal georgette with pure zari weft threads for a luminous shine under ambient evening lighting.',
    artisanCluster: 'Nanjangud Loom Heritage, Mysuru',
    silkMarkCertified: true,
  },
  {
    id: 'paithani-tilli-shot-purple',
    slug: 'yeola-paithani-pure-silk-asawali-pallu-saree',
    title: 'Yeola Paithani Pure Silk Asawali Pallu Saree',
    weave: 'Paithani',
    fabric: 'Soft Silk',
    occasion: 'Festive & Puja',
    priceINR: 52000,
    originalPriceINR: 58000,
    rating: 4.9,
    reviewCount: 36,
    color: 'Royal Violet & Crimson',
    colorHex: '#4A154B',
    stockCount: 2,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Tested Pure Gold Tapestry Weft',
    blousePiece: 'Included (0.8m Contrast Blouse)',
    dimensions: '6.0m Traditional Drape',
    inStock: true,
    isNew: true,
    description:
      'Features the iconic tapestry-woven Asawali floral vines and vibrant peacocks on the grand pallu, woven entirely by hand without punchcards.',
    artisanCluster: 'Yeola Weavers, Maharashtra',
    silkMarkCertified: true,
  },
  {
    id: 'organza-flora-powder-blue',
    slug: 'pure-silk-organza-hand-painted-kalamkari-saree',
    title: 'Pure Silk Organza Hand-Painted Kalamkari Saree',
    weave: 'Organza',
    fabric: 'Organza',
    occasion: 'Festive & Puja',
    priceINR: 24500,
    originalPriceINR: 28000,
    rating: 4.9,
    reviewCount: 24,
    color: 'Powder Blue & Silver',
    colorHex: '#B0E0E6',
    stockCount: 3,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Scalloped Silver Zari Border',
    blousePiece: 'Included (0.8m Raw Silk Blouse)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    isNew: true,
    description:
      'Ultra-sheer gossamer silk organza enriched with botanical motifs, hand-painted by master artisans and bordered with delicate scalloped silver thread embroidery.',
    artisanCluster: 'Varanasi Master Sheers Guild',
    silkMarkCertified: true,
  },
  {
    id: 'ikkat-patola-royal-ruby',
    slug: 'double-ikkat-patan-patola-silk-saree',
    title: 'Double Ikkat Patan Patola Silk Saree',
    weave: 'Ikkat',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Festive & Puja',
    priceINR: 78000,
    originalPriceINR: 88000,
    rating: 5.0,
    reviewCount: 19,
    color: 'Ruby Red & Mustard',
    colorHex: '#9B111E',
    stockCount: 1,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Tested Pure Gold Border Inlay',
    blousePiece: 'Included (0.8m Unstitched Silk)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    isBridal: true,
    description:
      'The pinnacle of Indian resist-dyeing mathematical precision. Both warp and weft threads are tied and dyed before weaving to create symmetrical heirloom geometric motifs.',
    artisanCluster: 'Patan Master Weavers Guild, Gujarat',
    silkMarkCertified: true,
  },
  {
    id: 'kanchi-rani-pink-gold',
    slug: 'kanchipuram-rani-pink-and-temple-zari-brocade',
    title: 'Kanchipuram Rani Pink & Temple Zari Brocade',
    weave: 'Kanchipuram',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Bridal & Muhurtham',
    priceINR: 58000,
    originalPriceINR: 65000,
    rating: 5.0,
    reviewCount: 47,
    color: 'Rani Pink & Gold',
    colorHex: '#C2185B',
    stockCount: 2,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: '57% Silver / 24K Gold Plated',
    blousePiece: 'Included (0.8m Contrast Brocade)',
    dimensions: '6.2m Bridal Length',
    inStock: true,
    isBridal: true,
    isBestseller: true,
    description:
      'Vibrant auspicious Rani Pink body adorned with micro-rudraksha motifs and massive 14-inch temple korvai borders.',
    artisanCluster: 'Kanchi Master Guild, Tamil Nadu',
    silkMarkCertified: true,
  },
  {
    id: 'mysore-peacock-teal',
    slug: 'mysuru-heritage-royal-peacock-teal-crepe',
    title: 'Mysuru Heritage Royal Peacock Teal Crepe',
    weave: 'Mysore Silk',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Daily Classic',
    priceINR: 31000,
    rating: 4.8,
    reviewCount: 22,
    color: 'Peacock Teal',
    colorHex: '#005F73',
    stockCount: 5,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Tested Pure Gold Ribbon',
    blousePiece: 'Included (0.8m Running Crepe)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    description:
      'Signature Mysuru royal crepe woven with Kasuti diamond motifs along the pallu and contrasting rich gold zari borders.',
    artisanCluster: 'Mysore Silk Guild, Karnataka',
    silkMarkCertified: true,
  },
  {
    id: 'chanderi-dust-gold',
    slug: 'chanderi-wild-tussar-and-gold-boota-saree',
    title: 'Chanderi Wild Tussar & Gold Boota Saree',
    weave: 'Chanderi',
    fabric: 'Tussar Silk',
    occasion: 'Daily Classic',
    priceINR: 19500,
    originalPriceINR: 22000,
    rating: 4.7,
    reviewCount: 19,
    color: 'Sandalwood Beige',
    colorHex: '#C2B280',
    stockCount: 4,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    ],
    zariGrade: 'Fine Gold Wire Extra-Weft',
    blousePiece: 'Included (0.8m Blouse Piece)',
    dimensions: '5.5m Saree + 0.8m Blouse',
    inStock: true,
    description:
      'A gossamer blend of wild raw Tussar and spun mulberry silk with delicate circular gold ashrafi bootas scattered across the body.',
    artisanCluster: 'Pranpur Heritage Village, Chanderi',
    silkMarkCertified: true,
  },
];

export interface CategoryWithThumbnails {
  id: string;
  name: string;
  desc: string;
  count: string;
  image: string;
  thumbnails: string[];
}

export const sixCategoriesWithThumbnails: CategoryWithThumbnails[] = [
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    desc: 'Heavy Bridal Korvai & 24K Zari',
    count: '64 Designs',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'banarasi',
    name: 'Banarasi',
    desc: 'Mughal Floral Jaal & Kadwa Weave',
    count: '36 Designs',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'mysore-silk',
    name: 'Mysore Silk',
    desc: 'Royal Crepe & Liquid Luster',
    count: '48 Designs',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'organza',
    name: 'Organza',
    desc: 'Gossamer Sheer & Silver Scallops',
    count: '24 Designs',
    image: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'paithani',
    name: 'Paithani',
    desc: 'Shot Tones & Tapestry Peacocks',
    count: '22 Designs',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'ikkat',
    name: 'Ikkat',
    desc: 'Mathematical Double Patola',
    count: '18 Designs',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
    ],
  },
];

export const weaveCategories = sixCategoriesWithThumbnails;

export const fabricFilters = [
  'Pure Mulberry Silk',
  'Soft Silk',
  'Raw Silk',
  'Crepe Silk',
  'Georgette',
  'Tissue Silk',
  'Tussar Silk',
  'Organza',
];

export const occasionFilters = [
  'Bridal & Muhurtham',
  'Festive & Puja',
  'Reception & Cocktail',
  'Daily Classic',
  'Temple Visits',
];
