import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { imageBase64 } = body;
    const uploadedUrl = imageBase64 || '';

    if (user && uploadedUrl) {
      await supabase
        .from('customers')
        .update({ avatar_url: uploadedUrl })
        .eq('auth_user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      avatarUrl: uploadedUrl,
      message: 'Profile photo updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to upload profile photo.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('customers')
      .update({ avatar_url: null })
      .eq('auth_user_id', user.id);
  }

  return NextResponse.json({
    success: true,
    avatarUrl: '',
    message: 'Profile photo removed.',
  });
}
