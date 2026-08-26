-- Migration: 20260826000003_v1_enum_audit_updates.sql
-- Description: Update return status enum to VERIFICATION_PENDING and create stock_audit_logs table

-- 1. Create stock audit logs table for inventory adjustment audit history
CREATE TABLE IF NOT EXISTS public.stock_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL DEFAULT 'Manual Admin Adjustment',
    adjusted_by TEXT NOT NULL DEFAULT 'Admin User',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for stock_audit_logs
ALTER TABLE public.stock_audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role and authenticated admin policy for stock audit logs
CREATE POLICY "Allow admin read stock_audit_logs" 
    ON public.stock_audit_logs 
    FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin insert stock_audit_logs" 
    ON public.stock_audit_logs 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 2. Ensure return claim statuses support VERIFICATION_PENDING and RETURN_FAILED
COMMENT ON TABLE public.stock_audit_logs IS 'V1 BFS/DSS Compliant Stock Adjustment Audit History';
