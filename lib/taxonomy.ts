export interface SareeCollection {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  badge: string;
  collectionType: 'Rule-Based' | 'Curated';
  assignedSkuCount: number;
  isFeaturedOnHomepage: boolean;
  status: 'ACTIVE' | 'DRAFT';
  assignedSkus: string[];
}

export type TaxonomyCategory = 'WEAVE' | 'FABRIC' | 'ZARI' | 'OCCASION';

export interface TaxonomyTerm {
  id: string;
  category: TaxonomyCategory;
  name: string;
  code: string;
  description: string;
  productCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export const INITIAL_COLLECTIONS: SareeCollection[] = [
  {
    id: 'col-1',
    title: 'The Royal Wodeyar Heritage',
    slug: 'wodeyar-heritage',
    tagline: 'Pure Mysore Crepe Silks hand-woven with tested 24K pure gold zari',
    description: 'Inspired by the royal heritage of the Mysuru court, featuring pure mulberry crepe drape.',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    badge: 'Royal Heritage',
    collectionType: 'Curated',
    assignedSkuCount: 14,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    assignedSkus: ['NSH-0001', 'NSH-0004'],
  },
  {
    id: 'col-2',
    title: 'Banarasi Kadwa Masterpieces',
    slug: 'banarasi-kadwa-katan',
    tagline: 'Heirloom Kadwa floating weft pure Katan silks with Meenakari bootas',
    description: 'Handwoven in Varanasi weaver alleys, featuring pure gold and silver zari artistry.',
    coverImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200&auto=format&fit=crop',
    badge: 'Banarasi Weaves',
    collectionType: 'Rule-Based',
    assignedSkuCount: 18,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    assignedSkus: ['NSH-0003', 'NSH-0005'],
  },
  {
    id: 'col-3',
    title: 'Bridal Kanchipuram Korvai',
    slug: 'bridal-kanchipuram-korvai',
    tagline: 'Interlocked warp and weft double-shuttle temple borders for bridal trousseau',
    description: 'Heavy 3-ply mulberry silk paired with authentic pure gold zari borders.',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    badge: 'Bridal Trousseau',
    collectionType: 'Curated',
    assignedSkuCount: 22,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    assignedSkus: ['NSH-0002', 'NSH-0008'],
  },
  {
    id: 'col-4',
    title: 'Yeola Paithani Asawali',
    slug: 'yeola-paithani-tapestry',
    tagline: 'Oblong parrot and peacock motifs hand-interlocked into solid gold zari pallus',
    description: 'Classic Paithani weaves with manual silk-weft tapestry techniques.',
    coverImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
    badge: 'Paithani Weaves',
    collectionType: 'Rule-Based',
    assignedSkuCount: 8,
    isFeaturedOnHomepage: false,
    status: 'ACTIVE',
    assignedSkus: ['NSH-0006'],
  },
];

export const INITIAL_TAXONOMY_TERMS: TaxonomyTerm[] = [
  {
    id: 'tax-1',
    category: 'WEAVE',
    name: 'Mysore Silk',
    code: 'WV-MYS',
    description: 'Traditional mulberry silk weave from Mysuru looms.',
    productCount: 42,
    status: 'ACTIVE',
  },
  {
    id: 'tax-2',
    category: 'WEAVE',
    name: 'Kanchipuram',
    code: 'WV-KAN',
    description: 'Heavy mulberry silk with Korvai temple borders.',
    productCount: 68,
    status: 'ACTIVE',
  },
  {
    id: 'tax-3',
    category: 'WEAVE',
    name: 'Banarasi Katan',
    code: 'WV-BAN',
    description: 'Fine Katan silk with Kadwa zari bootas.',
    productCount: 35,
    status: 'ACTIVE',
  },
  {
    id: 'tax-4',
    category: 'FABRIC',
    name: '100% Pure Mulberry Silk',
    code: 'FB-MUL',
    description: 'High-density grade A mulberry silk thread.',
    productCount: 120,
    status: 'ACTIVE',
  },
  {
    id: 'tax-5',
    category: 'ZARI',
    name: 'Pure 24K Tested Zari',
    code: 'ZR-24K',
    description: 'Silver thread electroplated with pure 24K gold.',
    productCount: 85,
    status: 'ACTIVE',
  },
];
