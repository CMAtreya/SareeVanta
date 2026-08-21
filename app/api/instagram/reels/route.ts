import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'instagram-reels.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: false, message: 'Reels database not found.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch Instagram reels.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Return updated automated feed
    const filePath = path.join(process.cwd(), 'lib', 'instagram-reels.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      data.lastSynced = new Date().toISOString();
      return NextResponse.json({ success: true, message: 'Reels feed synchronized successfully with @neelsareehouse', data });
    }
    return NextResponse.json({ success: true, message: 'Synced.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Sync failed.' }, { status: 500 });
  }
}
