export interface AvailableColor {
  name: string;
  hex: string;
  matchKey: string;
}

export const availableColors: AvailableColor[] = [
  { name: 'Crimson Red', hex: '#8B1E28', matchKey: 'crimson' },
  { name: 'Pure Gold', hex: '#D4AF37', matchKey: 'gold' },
  { name: 'Emerald Green', hex: '#1B4D3E', matchKey: 'emerald' },
  { name: 'Royal Violet', hex: '#4A154B', matchKey: 'violet' },
  { name: 'Powder Blue', hex: '#B0E0E6', matchKey: 'blue' },
  { name: 'Rani Pink', hex: '#C2185B', matchKey: 'pink' },
  { name: 'Ruby Red', hex: '#9B111E', matchKey: 'ruby' },
  { name: 'Peacock Teal', hex: '#005F73', matchKey: 'teal' },
  { name: 'Sandalwood Beige', hex: '#C2B280', matchKey: 'sandalwood' },
];

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
  photos?: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  weave: string;
  fabric: string;
  pattern?: string;
  occasion: string;
  occasions?: string[];
  priceINR: number;
  originalPriceINR?: number;
  rating: number;
  reviewCount: number;
  color: string;
  colorHex: string;
  images: string[];
  zariGrade: string;
  blousePiece?: string;
  dimensions: string;
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isBridal?: boolean;
  isBestseller?: boolean;
  specialBadges?: string[];
  description: string;
  artisanCluster: string;
  silkMarkCertified: boolean;
  colorVariants?: ColorVariant[];
  reviewsList?: Review[];
}

export const products: Product[] = [];

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
    id: 'mysore-silk',
    name: 'Mysore Silk',
    desc: 'Royal Crepe & Liquid Luster',
    count: '48 Designs',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    desc: 'Heavy Bridal Korvai & 24K Zari',
    count: '64 Designs',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=300&q=80',
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
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'patola',
    name: 'Patola',
    desc: 'Geometric Double Ikkat Heritage',
    count: '16 Designs',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
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
  {
    id: 'organza',
    name: 'Organza',
    desc: 'Gossamer Sheer & Silver Scallops',
    count: '24 Designs',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'chanderi',
    name: 'Chanderi',
    desc: 'Featherlight Sheer Gossamer Weave',
    count: '20 Designs',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'tissue-georgette',
    name: 'Tissue Georgette',
    desc: 'Luminous Metallic Sheen & Flowing Drape',
    count: '15 Designs',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    ],
  },
];

export const weaveCategories = sixCategoriesWithThumbnails;

export const fabricFilters = [
  'Pure Mulberry Silk',
  'Tissue Georgette',
  'Soft Silk',
  'Raw Silk',
  'Crepe Silk',
  'Georgette',
  'Tissue Silk',
  'Tussar Silk',
  'Organza',
  'Pure Katan Silk',
  'Chanderi Silk',
];

export const zariFilters = [
  'Pure 24K Tested Zari',
  'Tested Gold Zari',
  'Silver Tested Zari',
  'Pure Zari Thread Interlock',
  'Antique Gold Zari',
  'Copper Zari Weave',
  'No Zari / Resham Threadwork',
];

export const patternFilters = [
  'Kasuti Diamonds',
  'Peacock Mayil & Yanai',
  'Temple Korvai Border',
  'Floral Kadwa Meenakari',
  'Asawali Floral Vines',
  'Ashrafi Bootas',
  'Jacquard Zari Butta',
  'Temple Border',
];

export const occasionFilters = [
  'Bridal & Muhurtham',
  'Festive & Puja',
  'Reception & Cocktail',
  'Daily Classic',
  'Temple Visits',
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function getProducts(): Product[] {
  return products;
}

