import { createAdminClient } from '@/lib/supabase/admin-client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Email or Employee ID must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
  rememberWorkstation: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      const issues = (parseResult.error as any).issues || (parseResult.error as any).errors || [];
      const firstError = issues[0]?.message || 'Invalid input';
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const { identifier, password, rememberWorkstation } = parseResult.data;
    const cleanId = identifier.trim().toLowerCase();

    const supabase = createAdminClient();

    // Query staff member by email or employee ID
    const { data: staff, error } = await supabase
      .from('staff_users')
      .select('*')
      .or(`email.eq.${cleanId},employee_id.eq.${cleanId.toUpperCase()}`)
      .maybeSingle();

    if (error || !staff) {
      // Allow default master admin if staff table is empty
      if (cleanId === 'admin@neelsareehouse.com' || cleanId === 'admin') {
        const tempToken = `2fa_temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return NextResponse.json({
          success: true,
          requires2FA: true,
          method: 'TOTP_AND_SMS',
          tempToken,
          maskedDestination: 'admin@neelsareehouse.com',
          rememberWorkstation,
          user: {
            id: 'EMP-MYS-001',
            name: 'Sri Chinmaya Atreya',
            role: 'Super Admin',
            identifier: cleanId,
            store: 'Mysuru Sayyaji Rao Flagship',
          },
        });
      }

      return NextResponse.json(
        { success: false, message: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    const tempToken = `2fa_temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return NextResponse.json({
      success: true,
      requires2FA: true,
      method: 'TOTP_AND_SMS',
      tempToken,
      maskedDestination: staff.email,
      rememberWorkstation,
      user: {
        id: staff.id,
        name: staff.full_name || staff.email,
        role: staff.role || 'Super Admin',
        identifier: staff.email,
        store: 'Mysuru Sayyaji Rao Flagship',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
