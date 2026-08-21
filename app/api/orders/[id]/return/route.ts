import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderNumber = params.id;
    const body = await request.json();
    const { orderItem, reason, details, refund_method } = body;

    const rmaId = `RMA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 2);
    const formattedPickup = pickupDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return NextResponse.json({
      success: true,
      rma_id: rmaId,
      order_number: orderNumber,
      orderItem: orderItem || 'item-default',
      reason,
      refund_method: refund_method || 'original_payment',
      pickup_courier: 'BlueDart Reverse Logistics',
      pickup_estimated: formattedPickup,
      status: 'pickup_scheduled',
      message: `Return request ${rmaId} registered successfully. BlueDart pickup scheduled for ${formattedPickup}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process return request.' },
      { status: 500 }
    );
  }
}
