-- Grant table permissions to authenticated and anon roles for all customer domain tables
-- Fixes PostgreSQL error 42501: permission denied for table customer_addresses / customers / carts / wishlist_items

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wishlist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;

GRANT SELECT ON TABLE public.products TO authenticated, anon;
GRANT SELECT ON TABLE public.product_variants TO authenticated, anon;
GRANT SELECT ON TABLE public.collections TO authenticated, anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
