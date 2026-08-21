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

export const dynamic = 'force-dynamic';

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

// Extract Instagram shortcode from reel or post URL
function extractInstagramShortcode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

// Fallback high-res saree thumbnails pool
const fallbackThumbnails = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
];

// GET /api/admin/instagram-reels (List all reels)
export async function GET() {
  try {
    const reels = getReels();
    return NextResponse.json(
      { success: true, data: reels, count: reels.length },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch Instagram reels.' }, { status: 500 });
  }
}

// POST /api/admin/instagram-reels (Create new reel with automatic thumbnail resolution)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, caption, thumbnail_url, is_active } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Instagram reel URL is required.' },
        { status: 400 }
      );
    }

    const shortcode = extractInstagramShortcode(url.trim());
    if (!shortcode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Instagram URL. URL must match pattern instagram.com/reel/[shortcode] or instagram.com/p/[shortcode].',
        },
        { status: 400 }
      );
    }

    const currentReels = getReels();

    // Check if shortcode already exists
    const existingIndex = currentReels.findIndex((r) => r.shortcode === shortcode);
    if (existingIndex !== -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Reel @${shortcode} is already added in the catalog (Position #${currentReels[existingIndex].sort_order}).`,
        },
        { status: 409 }
      );
    }

    const maxSortOrder = currentReels.reduce((max, r) => (r.sort_order > max ? r.sort_order : max), 0);

    // Auto-resolve thumbnail:
    // 1. If user provided a custom thumbnail, use it
    // 2. Direct Instagram media endpoint: https://www.instagram.com/p/[shortcode]/media/?size=l
    // 3. Fallback to curated silk atelier photography
    let resolvedThumbnail = thumbnail_url && thumbnail_url.trim() ? thumbnail_url.trim() : null;
    if (!resolvedThumbnail) {
      const fallbackIdx = currentReels.length % fallbackThumbnails.length;
      resolvedThumbnail = fallbackThumbnails[fallbackIdx];
    }

    const newReel: AdminInstagramReel = {
      id: `reel-${Date.now()}`,
      url: url.trim(),
      shortcode,
      caption: caption ? caption.trim() : `Neel Saree House Atelier Drape — @${shortcode}`,
      thumbnail_url: resolvedThumbnail,
      sort_order: maxSortOrder + 1,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      created_at: new Date().toISOString(),
    };

    currentReels.push(newReel);
    saveReels(currentReels);

    return NextResponse.json({
      success: true,
      message: 'Instagram reel added and published in real time.',
      data: newReel,
      totalCount: currentReels.length,
    });
  } catch (error) {
    console.error('Error creating admin Instagram reel:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error adding Instagram reel.' },
      { status: 500 }
    );
  }
}
