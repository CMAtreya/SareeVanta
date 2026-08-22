'use client';

import React from 'react';
import ProductEditorForm from '@/components/admin/ProductEditorForm';

export default function EditProductWorkstationPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProductEditorForm mode="edit" productId={params.id} />;
}
