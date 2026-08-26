-- Migration: 20260826000004_create_claim_verifications.sql
-- Description: Create claim_verifications table for return claim audit and verification logging

CREATE TABLE IF NOT EXISTS public.claim_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID UNIQUE NOT NULL REFERENCES public.return_claims(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('PENDING', 'PASSED', 'FAILED')),
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.claim_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read claim_verifications"
    ON public.claim_verifications
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin write claim_verifications"
    ON public.claim_verifications
    FOR ALL
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
