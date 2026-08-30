import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { INITIAL_COLLECTIONS, SareeCollection } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: dbCollections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && dbCollections && dbCollections.length > 0) {
      const formatted: SareeCollection[] = dbCollections.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        tagline: c.tagline || '',
        description: c.description || '',
        coverImage: c.image_url || c.cover_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
        badge: c.badge || 'Curated Curation',
        collectionType: c.collection_type || 'Curated',
        assignedSkuCount: Number(c.assigned_sku_count || 12),
        isFeaturedOnHomepage: Boolean(c.is_featured),
        status: c.is_active ? 'ACTIVE' : 'DRAFT',
        assignedSkus: Array.isArray(c.assigned_skus) ? c.assigned_skus : [],
      }));
      return NextResponse.json({ collections: formatted });
    }
  } catch (err) {
    console.error('[Collections API] Error querying DB:', err);
  }

  // Fallback to core taxonomy collections
  return NextResponse.json({ collections: INITIAL_COLLECTIONS });
}
