import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'usr_ananya_2021',
    name: 'Ananya S. Rao',
    email: 'ananya.rao@example.com',
    phone: '+91 98860 12345',
    phone_verified: true,
    tier: 'Royal Loom Patron',
    member_since: 'October 2021',
    notifications: {
      whatsapp_dispatch: true,
      email_invoices: true,
      festive_early_access: true,
      sms_delivery_otp: true,
    },
  });
}
