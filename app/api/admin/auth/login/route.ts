import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Email or Employee ID must be at least 3 characters')
    .refine((val) => val.includes('@') || val.toUpperCase().startsWith('NSH-') || val.length >= 3, {
      message: 'Enter a valid staff email (e.g. admin@neelsareehouse.com) or Employee ID (e.g. NSH-EMP-001)',
    }),
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

    // Check credentials (allows authorized admin, employee ID, or @neelsareehouse.com staff emails)
    const isValidUser =
      cleanId === 'admin' ||
      cleanId === 'admin@neelsareehouse.com' ||
      cleanId === 'nsh-emp-001' ||
      cleanId.endsWith('@neelsareehouse.com');

    if (!isValidUser || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    // Prepare 2FA token
    const tempToken = `2fa_temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const maskedPhone = '+91 ••••• ••482';
    const maskedEmail = identifier.includes('@')
      ? identifier.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '•••')
      : 'ad•••@neelsareehouse.com';

    return NextResponse.json({
      success: true,
      requires2FA: true,
      method: 'TOTP_AND_SMS',
      tempToken,
      maskedDestination: `${maskedPhone} & ${maskedEmail}`,
      demoOtp: '202688',
      rememberWorkstation,
      user: {
        id: 'EMP-MYS-001',
        name: 'Smt. Chandrakala Devi',
        role: 'Master Guild SuperAdmin',
        identifier: cleanId,
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
