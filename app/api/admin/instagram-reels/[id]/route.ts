import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/instagram-reels/:id (Update reel / Toggle active / Reorder)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const rawId = params?.id ? decodeURIComponent(params.id) : '';
    const body = await request.json();

    // 1. Support bulk reordering when id === 'reorder'
    if (rawId === 'reorder' && Array.isArray(body.orderedIds)) {
      for (let index = 0; index < body.orderedIds.length; index++) {
        const reelId = body.orderedIds[index];
        await supabase
          .from('instagram_reels')
          .update({ display_order: index + 1 })
          .eq('id', reelId);
      }

      return NextResponse.json({
        success: true,
        message: 'Reels reordered successfully in Supabase.',
      });
    }

    if (!rawId) {
      return NextResponse.json({ success: false, message: 'Reel ID is required.' }, { status: 400 });
    }

    // 2. Single item field updates
    const updatePayload: Record<string, any> = {};
    if (body.is_active !== undefined) updatePayload.is_active = Boolean(body.is_active);
    if (body.caption !== undefined) updatePayload.caption = String(body.caption).trim();
    if (body.thumbnail_url !== undefined) updatePayload.thumbnail_storage_path = String(body.thumbnail_url).trim();
    if (body.sort_order !== undefined && typeof body.sort_order === 'number') {
      updatePayload.display_order = body.sort_order;
    }

    const { data: updatedReel, error } = await supabase
      .from('instagram_reels')
      .update(updatePayload)
      .eq('id', rawId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reel updated successfully in Supabase.',
      data: updatedReel,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update reel.' }, { status: 500 });
  }
}

// DELETE /api/admin/instagram-reels/:id (Delete reel from Supabase)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const rawId = params?.id ? decodeURIComponent(params.id) : '';

    if (!rawId) {
      return NextResponse.json({ success: false, message: 'Reel ID is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('instagram_reels')
      .delete()
      .eq('id', rawId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram reel removed successfully from Supabase.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete reel.' }, { status: 500 });
  }
}
