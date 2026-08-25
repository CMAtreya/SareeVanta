export interface SareeCollection {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  badge: string;
  assignedSkuCount: number;
  isFeaturedOnHomepage: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  validDateRange?: string;
  assignedSkus: string[];
}

export type TaxonomyCategory = 'WEAVE' | 'FABRIC' | 'ZARI' | 'LOOM' | 'MOTIF';

export interface TaxonomyTerm {
  id: string;
  category: TaxonomyCategory;
  name: string;
  code: string;
  originState?: string;
  isGiTagged?: boolean;
  silkMarkCertified?: boolean;
  description: string;
  productCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export const INITIAL_COLLECTIONS: SareeCollection[] = [
  {
    id: 'col-1',
    title: 'The Royal Wodeyar Muhurtham 2026',
    slug: 'wodeyar-heritage-muhurtham-2026',
    tagline: 'Pure Mysore Crepe Silks hand-woven with tested 24K pure gold zari bullion',
    description: 'Commissioned under the royal patronage of the Mysuru court, featuring pure mulberry crepe drape and grand palace temple borders.',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    badge: 'Royal Heritage',
    assignedSkuCount: 14,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    validDateRange: '15 Aug 2026 - 31 Dec 2026',
    assignedSkus: ['NSH-SKU-MYS-01', 'NSH-SKU-MYS-04', 'NSH-SKU-MYS-07'],
  },
  {
    id: 'col-2',
    title: 'Varanasi Kashi Ghat Kadwa Masterpieces',
    slug: 'kashi-ghat-kadwa-katan',
    tagline: 'Heirloom Kadwa floating weft pure Katan silks with Meenakari bootas',
    description: 'Handwoven in the sacred weaver alleys of Varanasi, each saree requires over 45 days of intense shuttle labor.',
    coverImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200&auto=format&fit=crop',
    badge: 'GI Certified',
    assignedSkuCount: 18,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    validDateRange: 'All Season',
    assignedSkus: ['NSH-SKU-BAN-03', 'NSH-SKU-BAN-05'],
  },
  {
    id: 'col-3',
    title: 'Bridal Kanchipuram Korvai Grandeur',
    slug: 'bridal-kanchipuram-korvai-grandeur',
    tagline: 'Interlocked warp and weft double-shuttle temple borders for south Indian weddings',
    description: 'Heavy 3-ply mulberry silk paired with authentic 3G pure gold zari borders woven by master weaver cooperative clusters.',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop',
    badge: 'Bridal Trousseau',
    assignedSkuCount: 22,
    isFeaturedOnHomepage: true,
    status: 'ACTIVE',
    validDateRange: 'Muhurtham Season 2026',
    assignedSkus: ['NSH-SKU-KAN-04', 'NSH-SKU-KAN-08'],
  },
  {
    id: 'col-4',
    title: 'Yeola Paithani Asawali Tapestry Vault',
    slug: 'yeola-paithani-tapestry',
    tagline: 'Oblong parrot and peacock motifs hand-interlocked into solid gold zari pallus',
    description: 'The pride of Maharashtra royal courts, woven without modern jacquards using manual silk-weft tapestry techniques.',
    coverImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
    badge: 'Limited Single-Piece',
    assignedSkuCount: 8,
    isFeaturedOnHomepage: false,
    status: 'ACTIVE',
    validDateRange: 'Festive 2026',
    assignedSkus: ['NSH-SKU-PAI-02'],
  },
  {
    id: 'col-5',
    title: 'Champagne Tissue Georgette & Organza Soirée',
    slug: 'tissue-georgette-soirée',
    tagline: 'Featherlight metallic tissue weaves designed for modern sangeet and cocktail evenings',
    description: 'Intricate floral French lace zari buttas floating over sheer metallic silk chiffon.',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    badge: 'Contemporary Luxe',
    assignedSkuCount: 12,
    isFeaturedOnHomepage: false,
    status: 'DRAFT',
    validDateRange: '1 Oct 2026 - 15 Nov 2026',
    assignedSkus: ['NSH-SKU-TIS-08'],
  },
];

export const INITIAL_TAXONOMY_TERMS: TaxonomyTerm[] = [
  // WEAVES
  {
    id: 'tax-w-1',
    category: 'WEAVE',
    name: 'Kanchipuram Korvai',
    code: 'WEAVE_KAN_KORVAI',
    originState: 'Tamil Nadu',
    isGiTagged: true,
    silkMarkCertified: true,
    description: 'Contrast interlocking warp technique where body and border are woven separately with three shuttles.',
    productCount: 42,
    status: 'ACTIVE',
  },
  {
    id: 'tax-w-2',
    category: 'WEAVE',
    name: 'Mysore Silk Crepe',
    code: 'WEAVE_MYS_CREPE',
    originState: 'Karnataka',
    isGiTagged: true,
    silkMarkCertified: true,
    description: '100% Pure Mulberry spun crepe silk known for high twist count and lustrous buttery drape.',
    productCount: 38,
    status: 'ACTIVE',
  },
  {
    id: 'tax-w-3',
    category: 'WEAVE',
    name: 'Banarasi Kadwa Katan',
    code: 'WEAVE_BAN_KADWA',
    originState: 'Uttar Pradesh',
    isGiTagged: true,
    silkMarkCertified: true,
    description: 'Individual hand-engraved motifs woven without loose floating threads at the back.',
    productCount: 29,
    status: 'ACTIVE',
  },
  {
    id: 'tax-w-4',
    category: 'WEAVE',
    name: 'Yeola Paithani',
    code: 'WEAVE_PAI_YEOLA',
    originState: 'Maharashtra',
    isGiTagged: true,
    silkMarkCertified: true,
    description: 'Tapestry weave technique featuring royal peacock, parrot and Asawali vine motifs.',
    productCount: 16,
    status: 'ACTIVE',
  },
  {
    id: 'tax-w-5',
    category: 'WEAVE',
    name: 'Patan Double Ikkat Patola',
    code: 'WEAVE_PAT_PATOLA',
    originState: 'Gujarat',
    isGiTagged: true,
    silkMarkCertified: true,
    description: 'Resist-dyed warp and weft silk where identical colors align precisely on both sides.',
    productCount: 9,
    status: 'ACTIVE',
  },

  // FABRICS
  {
    id: 'tax-f-1',
    category: 'FABRIC',
    name: '100% Pure Mulberry Silk',
    code: 'FAB_MULBERRY_SILK',
    description: 'Grade 4A+ natural protein fiber harvested from bombyx mori silkworms in Karnataka.',
    productCount: 84,
    status: 'ACTIVE',
  },
  {
    id: 'tax-f-2',
    category: 'FABRIC',
    name: 'Pure Katan Silk',
    code: 'FAB_KATAN_SILK',
    description: 'Pure untwisted silk yarn woven in tight plain warp configurations.',
    productCount: 32,
    status: 'ACTIVE',
  },
  {
    id: 'tax-f-3',
    category: 'FABRIC',
    name: 'Metallic Tissue Silk',
    code: 'FAB_TISSUE_SILK',
    description: 'Warp of fine silk interwoven with dense metallic zari weft yarns.',
    productCount: 18,
    status: 'ACTIVE',
  },
  {
    id: 'tax-f-4',
    category: 'FABRIC',
    name: 'Pure Chanderi Silk Cotton',
    code: 'FAB_CHANDERI_SILK',
    description: 'Fine 300-count cotton blended with pure degummed raw silk.',
    productCount: 14,
    status: 'ACTIVE',
  },

  // ZARI
  {
    id: 'tax-z-1',
    category: 'ZARI',
    name: 'Pure Gold Zari (3G / 24K Bullion)',
    code: 'ZARI_PURE_GOLD_3G',
    description: 'Certified 57% Silver wire core electroplated with authentic 24-Karat pure gold.',
    productCount: 46,
    status: 'ACTIVE',
  },
  {
    id: 'tax-z-2',
    category: 'ZARI',
    name: 'Tested Half-Fine Zari',
    code: 'ZARI_TESTED_HALF_FINE',
    description: 'Copper/Silver alloy core coated with high-luster metallic gilding.',
    productCount: 52,
    status: 'ACTIVE',
  },
  {
    id: 'tax-z-3',
    category: 'ZARI',
    name: 'Antique Vintage Copper Zari',
    code: 'ZARI_ANTIQUE_COPPER',
    description: 'Matte burnished copper-toned zari for understated regal aesthetics.',
    productCount: 22,
    status: 'ACTIVE',
  },

  // LOOMS
  {
    id: 'tax-l-1',
    category: 'LOOM',
    name: 'Traditional Handloom (Pit Loom)',
    code: 'LOOM_PIT_HANDLOOM',
    description: 'Subterranean pedal handloom creating optimum warp tension for authentic thick silks.',
    productCount: 94,
    status: 'ACTIVE',
  },
  {
    id: 'tax-l-2',
    category: 'LOOM',
    name: 'Adai Jacquard Handloom',
    code: 'LOOM_ADAI_JACQUARD',
    description: 'Manual thread harness attachment used for complex non-repeating border jaals.',
    productCount: 38,
    status: 'ACTIVE',
  },

  // MOTIFS
  {
    id: 'tax-m-1',
    category: 'MOTIF',
    name: 'Temple Gopuram Border',
    code: 'MOTIF_TEMPLE_GOPURAM',
    description: 'Triangular interlocking temple spire borders inspired by Brihadeeswarar architecture.',
    productCount: 48,
    status: 'ACTIVE',
  },
  {
    id: 'tax-m-2',
    category: 'MOTIF',
    name: 'Mayil (Royal Peacock)',
    code: 'MOTIF_MAYIL_PEACOCK',
    description: 'Emblem of grace, pride, and divine royalty embossed in gold zari buttas.',
    productCount: 56,
    status: 'ACTIVE',
  },
  {
    id: 'tax-m-3',
    category: 'MOTIF',
    name: 'Asawali (Flowering Vine)',
    code: 'MOTIF_ASAWALI_VINE',
    description: 'Classic Maratha court flowering urns and cascading vine creepers.',
    productCount: 19,
    status: 'ACTIVE',
  },
];
