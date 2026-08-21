import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AdminInstagramReel {
  id: string;
  url: string;
  shortcode: string;
  caption: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const dbPath = path.join(process.cwd(), 'lib', 'admin-instagram-reels.json');

function getReels(): AdminInstagramReel[] {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.sort((a: AdminInstagramReel, b: AdminInstagramReel) => a.sort_order - b.sort_order);
      }
    }
  } catch (err) {
    console.error('Error reading admin reels database:', err);
  }
  return [];
}

function saveReels(reels: AdminInstagramReel[]) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(reels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving admin reels database:', err);
  }
}

// PATCH /api/admin/instagram-reels/:id (Update reel / Toggle active / Reorder)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params?.id ? decodeURIComponent(params.id) : '';
    const body = await request.json();
    const reels = getReels();

    // Support bulk reorder if id === 'reorder'
    if (rawId === 'reorder' && Array.isArray(body.orderedIds)) {
      const idOrderMap = new Map<string, number>();
      body.orderedIds.forEach((itemId: string, index: number) => {
        idOrderMap.set(itemId, index + 1);
      });

      const updated = reels.map((r) => ({
        ...r,
        sort_order: idOrderMap.has(r.id) ? (idOrderMap.get(r.id) as number) : r.sort_order,
      }));

      saveReels(updated);
      return NextResponse.json({
        success: true,
        message: 'Reels reordered successfully.',
        data: updated.sort((a, b) => a.sort_order - b.sort_order),
      });
    }

    const reelIndex = reels.findIndex((r) => r.id === rawId || r.shortcode === rawId);
    if (reelIndex === -1) {
      return NextResponse.json({ success: false, message: 'Reel record not found.' }, { status: 404 });
    }

    const targetReel = { ...reels[reelIndex] };

    if (body.is_active !== undefined) {
      targetReel.is_active = Boolean(body.is_active);
    }
    if (body.caption !== undefined) {
      targetReel.caption = String(body.caption).trim();
    }
    if (body.thumbnail_url !== undefined) {
      targetReel.thumbnail_url = body.thumbnail_url ? String(body.thumbnail_url).trim() : null;
    }
    if (body.sort_order !== undefined && typeof body.sort_order === 'number') {
      targetReel.sort_order = body.sort_order;
    }

    reels[reelIndex] = targetReel;
    saveReels(reels);

    return NextResponse.json({
      success: true,
      message: 'Reel updated successfully.',
      data: targetReel,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update reel.' }, { status: 500 });
  }
}

// DELETE /api/admin/instagram-reels/:id (Delete reel)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params?.id ? decodeURIComponent(params.id) : '';
    if (!rawId) {
      return NextResponse.json({ success: false, message: 'Reel ID is required.' }, { status: 400 });
    }

    const reels = getReels();
    const initialLength = reels.length;
    const filtered = reels.filter((r) => r.id !== rawId && r.shortcode !== rawId);

    if (filtered.length === initialLength) {
      return NextResponse.json({ success: false, message: 'Reel record not found.' }, { status: 404 });
    }

    // Re-index sort order
    const reindexed = filtered.map((r, idx) => ({ ...r, sort_order: idx + 1 }));
    saveReels(reindexed);

    return NextResponse.json({
      success: true,
      message: 'Instagram reel removed successfully.',
      remainingCount: reindexed.length,
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete reel.' }, { status: 500 });
  }
}
