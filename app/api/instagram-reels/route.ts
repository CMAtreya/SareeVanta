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

export const revalidate = 300; // Cache for 5 minutes (300 seconds)

export async function GET() {
  try {
    let reels: AdminInstagramReel[] = [];

    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      // Filter ONLY is_active = true and order by sort_order ASC
      reels = parsed
        .filter((item: AdminInstagramReel) => item.is_active)
        .sort((a: AdminInstagramReel, b: AdminInstagramReel) => a.sort_order - b.sort_order);
    }

    return NextResponse.json(
      {
        success: true,
        data: reels,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/instagram-reels:', error);
    return NextResponse.json(
      { success: false, data: [] },
      { status: 500 }
    );
  }
}
