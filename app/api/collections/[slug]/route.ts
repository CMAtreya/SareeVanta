import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { INITIAL_COLLECTIONS, SareeCollection } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const supabase = createAdminClient();
    const { data: dbCollection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && dbCollection) {
      const formatted: SareeCollection = {
        id: dbCollection.id,
        title: dbCollection.title,
        slug: dbCollection.slug,
        tagline: dbCollection.tagline || '',
        description: dbCollection.description || '',
        coverImage: dbCollection.image_url || dbCollection.cover_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
        badge: dbCollection.badge || 'Curated Curation',
        collectionType: dbCollection.collection_type || 'Curated',
        assignedSkuCount: Number(dbCollection.assigned_sku_count || 12),
        isFeaturedOnHomepage: Boolean(dbCollection.is_featured),
        status: dbCollection.is_active ? 'ACTIVE' : 'DRAFT',
        assignedSkus: Array.isArray(dbCollection.assigned_skus) ? dbCollection.assigned_skus : [],
      };
      return NextResponse.json({ collection: formatted });
    }
  } catch (err) {
    console.error('[Collection Detail API] Error querying DB:', err);
  }

  // Fallback to core taxonomy collections
  const localMatch = INITIAL_COLLECTIONS.find((c) => c.slug === slug);
  if (localMatch) {
    return NextResponse.json({ collection: localMatch });
  }

  return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
}
