import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  const { data: claims, error } = await supabase
    .from('return_claims')
    .select(`
      *,
      customers(name, email, phone),
      orders(order_number),
      order_items(sku_snapshot, product_name_snapshot, color_name_snapshot),
      claim_evidence(*)
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claims: claims || [] });
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { claim_id, status, notes } = body;

  if (!claim_id || !status) {
    return NextResponse.json({ error: 'claim_id and status are required' }, { status: 400 });
  }

  const updates: any = { status };
  if (status === 'APPROVED') updates.approved_at = new Date().toISOString();
  if (status === 'REJECTED') updates.rejected_at = new Date().toISOString();
  if (status === 'CLOSED') updates.closed_at = new Date().toISOString();

  const { error } = await supabase
    .from('return_claims')
    .update(updates)
    .eq('id', claim_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create verification record
  await supabase.from('claim_verifications').upsert({
    claim_id,
    verification_status: status === 'APPROVED' ? 'PASSED' : status === 'REJECTED' ? 'FAILED' : 'PENDING',
    notes,
    verified_at: new Date().toISOString(),
  }, { onConflict: 'claim_id' });

  return NextResponse.json({ success: true, message: `Claim status updated to ${status}` });
}
