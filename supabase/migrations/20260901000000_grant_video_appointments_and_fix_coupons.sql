-- Migration: 20260901000000_grant_video_appointments_and_reviews.sql
-- Description: Grant table privileges on video_appointments and reviews

-- 1. Grant complete table privileges on video_appointments to all API roles
GRANT ALL ON TABLE public.video_appointments TO postgres, service_role, authenticated, anon;

-- 2. Grant table privileges on reviews and review_photos to all API roles
GRANT ALL ON TABLE public.reviews TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.review_photos TO postgres, service_role, authenticated, anon;

-- 3. Grant usage and permissions on any sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;
