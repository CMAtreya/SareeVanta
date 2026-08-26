import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const payload = await request.json();
    const eventKey = payload.awb || payload.order_id || `sr_evt_${Date.now()}`;
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

    // Verify webhook header secret if configured
    const requestSecret = request.headers.get('x-shiprocket-token') || request.headers.get('x-api-key');
    if (webhookSecret && requestSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook secret token' }, { status: 401 });
    }

    // 1. Store event for idempotency
    const { error: insertError } = await supabase
      .from('integration_webhook_events')
      .insert({
        provider: 'SHIPROCKET',
        event_key: eventKey,
        event_type: payload.current_status || 'TRACKING_UPDATE',
        payload: payload,
        processing_status: 'PROCESSED',
        processed_at: new Date().toISOString(),
      });

    if (insertError && insertError.code === '23505') {
      // Duplicate event - return 200 idempotent OK
      return NextResponse.json({ success: true, message: 'Idempotent duplicate event received' });
    }

    // 2. Map provider status to internal shipment status
    const currentStatus = payload.current_status?.toUpperCase() || '';
    let normalizedStatus = 'IN_TRANSIT';

    if (currentStatus.includes('DELIVERED')) normalizedStatus = 'DELIVERED';
    else if (currentStatus.includes('OUT FOR DELIVERY')) normalizedStatus = 'OUT_FOR_DELIVERY';
    else if (currentStatus.includes('PICKED UP')) normalizedStatus = 'IN_TRANSIT';
    else if (currentStatus.includes('CANCEL')) normalizedStatus = 'FAILED';
    else if (currentStatus.includes('RTO')) normalizedStatus = 'RETURN_TO_ORIGIN';

    // 3. Update shipment record if AWB or order_id matches
    if (payload.awb) {
      const { data: shipment } = await supabase
        .from('shipments')
        .select('id, order_id')
        .eq('awb', payload.awb)
        .single();

      if (shipment) {
        await supabase
          .from('shipments')
          .update({
            shipment_status: normalizedStatus,
            provider_status: currentStatus,
            delivered_at: normalizedStatus === 'DELIVERED' ? new Date().toISOString() : undefined,
          })
          .eq('id', shipment.id);

        // Store tracking event history
        await supabase.from('shipment_tracking_events').insert({
          shipment_id: shipment.id,
          provider_event_id: eventKey,
          provider_status: currentStatus,
          normalized_status: normalizedStatus,
          location_text: payload.current_location || '',
          remarks: payload.scans?.[0]?.instructions || '',
          raw_payload: payload,
        });

        // Sync order status if delivered
        if (normalizedStatus === 'DELIVERED') {
          await supabase
            .from('orders')
            .update({ order_status: 'DELIVERED' })
            .eq('id', shipment.order_id);
        }
      }
    }

    return NextResponse.json({ success: true, status: normalizedStatus });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Webhook processing error' }, { status: 500 });
  }
}
