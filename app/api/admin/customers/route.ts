import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Query registered customers from Supabase
    const { data: customersData, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB customers to CustomerRecord interface
    const mappedCustomers = (customersData || []).map((c: any) => {
      const nameParts = (c.name || 'Customer').split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
        : nameParts[0].slice(0, 2).toUpperCase();

      return {
        id: c.id,
        name: c.name || 'Registered Customer',
        avatarBg: 'from-amber-400 to-amber-600',
        initials: initials,
        phone: c.phone || 'Phone not provided',
        email: c.email || '',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        totalOrders: 0,
        totalSpend: 0,
        lastActive: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
        preferredWeaves: ['Handloom Silks'],
      };
    });

    return NextResponse.json({ customers: mappedCustomers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
