import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 'usr_ananya_2021',
      firstName: 'Ananya',
      lastName: 'Rao',
      name: 'Ananya S. Rao',
      email: 'ananya.rao@example.com',
      isEmailVerified: true,
      phone: '9886012345',
      fullPhone: '+91 98860 12345',
      isPhoneVerified: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      memberSince: '2021',
      dob: '1992-11-14',
      anniversary: '2018-02-18',
      gender: 'womens_wear',
      favoriteWeaves: ['Kanchipuram', 'Mysore Silk', 'Banarasi'],
      primaryOccasions: ['Bridal/Wedding', 'Festive', 'Temple & Pooja'],
      blouseFit: 'Custom Tailored',
      skinTone: 'wheatish',
      notifications: {
        whatsapp_dispatch: true,
        whatsapp_video_drops: true,
        email_invoices: true,
        email_newsletters: true,
        sms_promos: false,
      },
      completionPercentage: 88,
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      anniversary,
      gender,
      favoriteWeaves,
      primaryOccasions,
      blouseFit,
      skinTone,
      notifications,
    } = body;

    // Email validation
    if (email && (!email.includes('@') || !email.includes('.'))) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Phone validation
    if (phone && phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { success: false, message: 'Mobile number must contain at least 10 digits.' },
        { status: 400 }
      );
    }

    // Calculate dynamic completion percentage
    let completedFields = 0;
    const totalFields = 8;
    if (firstName && firstName.trim().length > 0) completedFields++;
    if (lastName && lastName.trim().length > 0) completedFields++;
    if (email && email.trim().length > 0) completedFields++;
    if (phone && phone.trim().length > 0) completedFields++;
    if (dob && dob.trim().length > 0) completedFields++;
    if (anniversary && anniversary.trim().length > 0) completedFields++;
    if (favoriteWeaves && favoriteWeaves.length > 0) completedFields++;
    if (primaryOccasions && primaryOccasions.length > 0) completedFields++;

    const completionPercentage = Math.min(100, Math.round((completedFields / totalFields) * 100));

    const updatedProfile = {
      id: 'usr_ananya_2021',
      firstName: (firstName || 'Ananya').trim(),
      lastName: (lastName || 'Rao').trim(),
      name: `${(firstName || 'Ananya').trim()} ${(lastName || 'Rao').trim()}`,
      email: (email || 'ananya.rao@example.com').trim().toLowerCase(),
      isEmailVerified: true,
      phone: phone || '9886012345',
      fullPhone: `+91 ${phone || '9886012345'}`,
      isPhoneVerified: true,
      avatar: body.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      memberSince: '2021',
      dob: dob || '',
      anniversary: anniversary || '',
      gender: gender || 'womens_wear',
      favoriteWeaves: favoriteWeaves || ['Kanchipuram', 'Mysore Silk'],
      primaryOccasions: primaryOccasions || ['Bridal/Wedding', 'Festive'],
      blouseFit: blouseFit || 'Custom Tailored',
      skinTone: skinTone || 'wheatish',
      notifications: notifications || {
        whatsapp_dispatch: true,
        whatsapp_video_drops: true,
        email_invoices: true,
        email_newsletters: true,
        sms_promos: false,
      },
      completionPercentage,
    };

    return NextResponse.json({
      success: true,
      message: 'Your patron profile has been successfully updated.',
      profile: updatedProfile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update patron profile.' },
      { status: 500 }
    );
  }
}
