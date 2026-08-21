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

// Extract Instagram shortcode from reel or post URL
function extractInstagramShortcode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

// GET /api/admin/instagram-reels (List all reels)
export async function GET() {
  try {
    const reels = getReels();
    return NextResponse.json({ success: true, data: reels });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch Instagram reels.' }, { status: 500 });
  }
}

// POST /api/admin/instagram-reels (Create new reel)
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
    const maxSortOrder = currentReels.reduce((max, r) => (r.sort_order > max ? r.sort_order : max), 0);

    const newReel: AdminInstagramReel = {
      id: `reel-${Date.now()}`,
      url: url.trim(),
      shortcode,
      caption: caption ? caption.trim() : '',
      thumbnail_url: thumbnail_url && thumbnail_url.trim() ? thumbnail_url.trim() : null,
      sort_order: maxSortOrder + 1,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      created_at: new Date().toISOString(),
    };

    currentReels.push(newReel);
    saveReels(currentReels);

    return NextResponse.json({
      success: true,
      message: 'Instagram reel added successfully.',
      data: newReel,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create Instagram reel record.' },
      { status: 500 }
    );
  }
}
