import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pincode } = body;

    if (!pincode || typeof pincode !== 'string') {
      return NextResponse.json(
        { serviceable: false, message: 'Please provide a valid 6-digit Indian PIN code.' },
        { status: 400 }
      );
    }

    const cleanPin = pincode.trim();

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return NextResponse.json(
        { serviceable: false, message: 'PIN code must be exactly 6 numeric digits (starting with 1-9).' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: pinRecord } = await supabase
      .from('pincodes')
      .select('pincode, city, state, is_serviceable')
      .eq('pincode', cleanPin)
      .maybeSingle();

    if (pinRecord && !pinRecord.is_serviceable) {
      return NextResponse.json(
        {
          serviceable: false,
          message: `Delivery is currently not available to PIN code ${cleanPin}. Please choose an alternative address.`,
        },
        { status: 422 }
      );
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const dateFormatted = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return NextResponse.json({
      serviceable: true,
      pincode: cleanPin,
      city: pinRecord?.city || '',
      state: pinRecord?.state || '',
      estimatedDelivery: dateFormatted,
      courier: 'BlueDart Air Express (Insured Security Transit)',
      tier: 'Tier 1 Priority Metro/Regional Hub',
      message: `✓ Express Air Delivery available by ${dateFormatted}`,
    });
  } catch (error) {
    return NextResponse.json(
      { serviceable: false, message: 'Error checking PIN code serviceability.' },
      { status: 500 }
    );
  }
}
