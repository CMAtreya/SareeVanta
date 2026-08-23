import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
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
    stylingPreference: 'Royal Heritage Classic',
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
  });
}
