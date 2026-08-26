import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { order_id, order_item_id, claim_type, reason_code, reason_text, photos = [] } = body;

  if (!order_id || !order_item_id || !claim_type || !reason_code) {
    return NextResponse.json({ error: 'Missing mandatory return claim parameters' }, { status: 400 });
  }

  // Mandatory 1-3 photos requirement for wrong/damaged product claims
  if (['WRONG_PRODUCT', 'DAMAGED_PRODUCT'].includes(claim_type) && photos.length === 0) {
    return NextResponse.json({ error: 'At least 1 photo is required for wrong or damaged product claims' }, { status: 400 });
  }

  const claimNumber = `CLM-${Date.now().toString().slice(-6)}`;

  const { data: claim, error } = await supabase
    .from('return_claims')
    .insert({
      claim_number: claimNumber,
      order_id,
      order_item_id,
      customer_id: user.id,
      claim_type,
      reason_code,
      reason_text,
      status: 'SUBMITTED',
    })
    .select('id, claim_number')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert evidence photos into claim_evidence table
  if (photos && Array.isArray(photos)) {
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      await supabase.from('claim_evidence').insert({
        claim_id: claim.id,
        media_type: 'PHOTO',
        storage_path: photos[i],
        display_order: i + 1,
      });
    }
  }

  // Update order status to RETURN_REQUESTED
  await supabase
    .from('orders')
    .update({ order_status: 'RETURN_REQUESTED' })
    .eq('id', order_id);

  return NextResponse.json({
    success: true,
    claim_id: claim.id,
    claim_number: claim.claim_number,
    message: 'Return claim submitted successfully',
  });
}
