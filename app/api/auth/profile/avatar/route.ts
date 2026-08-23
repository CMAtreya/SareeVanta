import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    // Simulate CDN upload and return high-resolution avatar URL
    const uploadedUrl = imageBase64 || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

    return NextResponse.json({
      success: true,
      avatarUrl: uploadedUrl,
      message: 'Profile photo uploaded and processed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to upload profile photo.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    avatarUrl: '',
    message: 'Profile photo removed. Displaying monogram badge.',
  });
}
