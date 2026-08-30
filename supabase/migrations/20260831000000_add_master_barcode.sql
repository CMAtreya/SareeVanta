-- Migration: Add master_barcode column to products table
-- Compliant with BFS §2.4 & DSS §6.3

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS master_barcode TEXT;

-- Create index for high-speed POS / master barcode lookups
CREATE INDEX IF NOT EXISTS idx_products_master_barcode ON public.products(master_barcode);
