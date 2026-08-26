'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings/staff');
  }, [router]);

  return (
    <div className="p-12 text-center font-sans text-xs text-stone-500">
      Redirecting to Staff & RBAC Settings...
    </div>
  );
}
