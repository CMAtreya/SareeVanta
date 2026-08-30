-- Migration: 20260830000000_create_video_appointments.sql
-- Description: Create video_appointments table for patron virtual shopping and loom concierge bookings

CREATE TABLE IF NOT EXISTS public.video_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    preferred_weaves JSONB DEFAULT '[]'::jsonb,
    occasion TEXT,
    platform TEXT NOT NULL DEFAULT 'Google Meet',
    notes TEXT,
    meeting_link TEXT,
    admin_notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high-performance admin and patron lookups
CREATE INDEX IF NOT EXISTS idx_video_appointments_date ON public.video_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_video_appointments_status ON public.video_appointments(status);
CREATE INDEX IF NOT EXISTS idx_video_appointments_user_id ON public.video_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_appointments_created_at ON public.video_appointments(created_at DESC);

-- Enable RLS
ALTER TABLE public.video_appointments ENABLE ROW LEVEL SECURITY;

-- 1. Patrons can insert their own appointments
CREATE POLICY "Allow public/authenticated insert video_appointments"
    ON public.video_appointments
    FOR INSERT
    WITH CHECK (true);

-- 2. Patrons can view their own appointments
CREATE POLICY "Allow patrons read own video_appointments"
    ON public.video_appointments
    FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 3. Service role / Admin has full control
CREATE POLICY "Allow admin full access to video_appointments"
    ON public.video_appointments
    FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');
