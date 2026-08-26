-- SAREEVANTA / NEEL SAREE HOUSE V1 Database Migration
-- Target: Supabase PostgreSQL
-- Specification Source: SAREEVANTA_V1_DSS_Detailed_System_Database_Specification.md

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CUSTOMER DOMAIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'EMAIL' CHECK (auth_provider IN ('EMAIL', 'GOOGLE', 'OTP')),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deletion_requested_at TIMESTAMPTZ,
    deletion_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

-- Trigger to sync auth.users into public.customers on signup
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, email, name, auth_provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'EMAIL')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users if available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    label TEXT,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_customer_addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

-- ============================================================================
-- 3. CONTROLLED CATALOG TAXONOMY ATTRIBUTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weavings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.border_stylings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.zari_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    hex_code TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. PRODUCTS & VARIANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    care_instructions TEXT,
    base_mrp_paise BIGINT NOT NULL CHECK (base_mrp_paise >= 0),
    base_selling_price_paise BIGINT NOT NULL CHECK (base_selling_price_paise >= 0),
    is_published BOOLEAN NOT NULL DEFAULT true,
    category_id UUID REFERENCES public.categories(id),
    weaving_id UUID REFERENCES public.weavings(id),
    fabric_id UUID REFERENCES public.fabrics(id),
    occasion_id UUID REFERENCES public.occasions(id),
    pattern_id UUID REFERENCES public.patterns(id),
    border_styling_id UUID REFERENCES public.border_stylings(id),
    zari_specification_id UUID REFERENCES public.zari_specifications(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES public.colors(id),
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
    mrp_paise BIGINT NOT NULL CHECK (mrp_paise >= price_paise),
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

CREATE TABLE IF NOT EXISTS public.product_variant_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. COLLECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    badge TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_rule_based BOOLEAN NOT NULL DEFAULT false,
    rule_conditions JSONB,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_products (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, product_id)
);

-- ============================================================================
-- 6. INVENTORY & RESERVATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory (
    variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_stock_boundary CHECK (quantity >= reserved_quantity)
);

CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_quantity INT NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID,
    actor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    source_type TEXT NOT NULL CHECK (source_type IN ('CUSTOMER_CHECKOUT', 'MANUAL_ORDER')),
    source_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONVERTED', 'RELEASED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    converted_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atomic Inventory Reservation Stored Procedure
CREATE OR REPLACE FUNCTION public.fn_reserve_inventory_atomic(
    p_variant_id UUID,
    p_quantity INT,
    p_source_type TEXT,
    p_source_id UUID,
    p_expiry_minutes INT DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
    v_curr_qty INT;
    v_curr_reserved INT;
    v_reservation_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Reservation quantity must be greater than zero.';
    END IF;

    -- Lock inventory row for update
    SELECT quantity, reserved_quantity INTO v_curr_qty, v_curr_reserved
    FROM public.inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant inventory record not found for variant ID %', p_variant_id;
    END IF;

    -- Check availability (physical - reserved)
    IF (v_curr_qty - v_curr_reserved) < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock available. Required: %, Available: %', p_quantity, (v_curr_qty - v_curr_reserved);
    END IF;

    v_expires_at := now() + (p_expiry_minutes || ' minutes')::INTERVAL;

    -- Increment reserved stock
    UPDATE public.inventory
    SET reserved_quantity = reserved_quantity + p_quantity,
        updated_at = now()
    WHERE variant_id = p_variant_id;

    -- Insert reservation record
    INSERT INTO public.inventory_reservations (
        variant_id, quantity, source_type, source_id, status, expires_at
    ) VALUES (
        p_variant_id, p_quantity, p_source_type, p_source_id, 'ACTIVE', v_expires_at
    ) RETURNING id INTO v_reservation_id;

    RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Release Expired Reservations Helper Procedure
CREATE OR REPLACE FUNCTION public.fn_release_expired_reservations()
RETURNS INT AS $$
DECLARE
    r RECORD;
    v_released_count INT := 0;
BEGIN
    FOR r IN 
        SELECT id, variant_id, quantity 
        FROM public.inventory_reservations 
        WHERE status = 'ACTIVE' AND expires_at < now()
        FOR UPDATE
    LOOP
        UPDATE public.inventory_reservations
        SET status = 'EXPIRED',
            released_at = now()
        WHERE id = r.id;

        UPDATE public.inventory
        SET reserved_quantity = GREATEST(0, reserved_quantity - r.quantity),
            updated_at = now()
        WHERE variant_id = r.variant_id;

        v_released_count := v_released_count + 1;
    END LOOP;

    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CARTS & WISHLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (customer_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID UNIQUE NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    is_selected BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cart_id, variant_id)
);

-- ============================================================================
-- 8. CHECKOUT & ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'FAILED')),
    selected_address_id UUID REFERENCES public.customer_addresses(id),
    coupon_code TEXT,
    total_mrp_paise BIGINT NOT NULL DEFAULT 0,
    total_discount_paise BIGINT NOT NULL DEFAULT 0,
    shipping_fee_paise BIGINT NOT NULL DEFAULT 0,
    final_amount_paise BIGINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checkout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_id UUID NOT NULL REFERENCES public.checkout_sessions(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('FIXED', 'PERCENTAGE')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount_paise BIGINT NOT NULL DEFAULT 0,
    max_discount_paise BIGINT,
    usage_limit INT,
    times_used INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    order_status TEXT NOT NULL DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
    discount_paise BIGINT NOT NULL DEFAULT 0,
    tax_paise BIGINT NOT NULL DEFAULT 0,
    shipping_fee_paise BIGINT NOT NULL DEFAULT 0,
    total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
    coupon_id UUID REFERENCES public.coupons(id),
    placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_started_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancellation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    sku_snapshot TEXT NOT NULL,
    product_name_snapshot TEXT NOT NULL,
    variant_name_snapshot TEXT,
    color_name_snapshot TEXT,
    pattern_name_snapshot TEXT,
    unit_price_paise BIGINT NOT NULL,
    discount_paise BIGINT NOT NULL DEFAULT 0,
    tax_paise BIGINT NOT NULL DEFAULT 0,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'RAZORPAY',
    provider_payment_id TEXT UNIQUE,
    provider_order_id TEXT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    method TEXT,
    upi_reference TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_coupon_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id),
    discount_amount_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. SHIPMENTS & LOGISTICS (SHIPROCKET)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    awb TEXT UNIQUE,
    courier_id TEXT,
    courier_name TEXT,
    shipment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (shipment_status IN ('PENDING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURN_TO_ORIGIN')),
    provider_status TEXT,
    estimated_delivery_at TIMESTAMPTZ,
    pickup_requested_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    provider_event_id TEXT,
    provider_status TEXT NOT NULL,
    normalized_status TEXT,
    event_time TIMESTAMPTZ DEFAULT now(),
    location_text TEXT,
    remarks TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_key TEXT NOT NULL,
    event_type TEXT,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processing_status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'FAILED')),
    error_message TEXT,
    UNIQUE (provider, event_key)
);

-- ============================================================================
-- 10. RETURNS, REVIEWS & MARKETING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.return_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number TEXT UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    claim_type TEXT NOT NULL CHECK (claim_type IN ('WRONG_PRODUCT', 'DAMAGED_PRODUCT', 'MISSING_ITEM', 'SIGNIFICANTLY_DIFFERENT', 'OTHER')),
    reason_code TEXT NOT NULL,
    reason_text TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'CLOSED')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verification_completed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.claim_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.return_claims(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('PHOTO', 'VIDEO')),
    storage_path TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    moderation_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    verified_buyer BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.review_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    desktop_image_path TEXT NOT NULL,
    mobile_image_path TEXT NOT NULL,
    badge_text TEXT,
    heading TEXT NOT NULL,
    tagline TEXT,
    cta_text TEXT NOT NULL DEFAULT 'Explore Collection',
    destination_type TEXT NOT NULL DEFAULT 'CATEGORY',
    destination_id UUID,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marquee_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instagram_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_url TEXT NOT NULL,
    caption TEXT,
    thumbnail_storage_path TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. STAFF, RBAC & AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_staff_id UUID REFERENCES public.staff_users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_claims ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalog
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_published = true);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = true);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active collections" ON public.collections FOR SELECT USING (is_active = true);

-- Customer self-service RLS policies
CREATE POLICY "Customer read own profile" ON public.customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customer read own addresses" ON public.customer_addresses FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Customer manage own cart" ON public.carts FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Customer manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Customer read own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

-- Service role bypasses RLS automatically when using service role key

-- ============================================================================
-- 13. SEED DATA (ROLES & ATTRIBUTES)
-- ============================================================================

INSERT INTO public.roles (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Super Admin', 'Full administrative authority across all modules'),
    ('22222222-2222-2222-2222-222222222222', 'Catalog & Operations Manager', 'Manages catalog, products, collections, and stock'),
    ('33333333-3333-3333-3333-333333333333', 'Fulfillment Specialist', 'Manages order processing, shipments, and returns'),
    ('44444444-4444-4444-4444-444444444444', 'Customer Support Representative', 'Handles customer reviews, claims, and inquiries')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.colors (name, hex_code, display_order) VALUES
    ('Crimson Red', '#8B1E28', 1),
    ('Peacock Teal', '#005F73', 2),
    ('Champagne Gold', '#D4AF37', 3),
    ('Royal Blue', '#1A365D', 4),
    ('Emerald Green', '#0F5132', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.weavings (name, code) VALUES
    ('Mysore Silk', 'MYS'),
    ('Banarasi Kadwa', 'BAN_KAD'),
    ('Kanchipuram Korvai', 'KAN_KOR'),
    ('Paithani Asawali', 'PAI_ASA'),
    ('Tissue Georgette', 'TIS_GEO')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.fabrics (name, code) VALUES
    ('Pure Mulberry Silk', 'MUL_SILK'),
    ('Pure Katan Silk', 'KAT_SILK'),
    ('Organza Silk', 'ORG_SILK'),
    ('Chanderi Silk', 'CHA_SILK')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.occasions (name, code) VALUES
    ('Bridal & Muhurtham', 'BRIDAL'),
    ('Festive & Diwali', 'FESTIVE'),
    ('Cocktail & Reception', 'RECEPTION'),
    ('Royal Heritage', 'HERITAGE')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.patterns (name, code) VALUES
    ('Jacquard Zari Butta', 'JAC_BUTTA'),
    ('Meenakari Floral', 'MEENA_FLORAL'),
    ('Temple Border', 'TEMPLE_BORDER'),
    ('Peacock Motif', 'PEACOCK_MOTIF')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.border_stylings (name, code) VALUES
    ('Contrast Zari Border', 'CONTRAST_ZARI'),
    ('Self Zari Border', 'SELF_ZARI'),
    ('Kaddi Border', 'KADDI_BORDER')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.zari_specifications (name, code) VALUES
    ('Tested Pure Gold & Silver Ribbon', 'PURE_ZARI'),
    ('Tested Half-Fine Metallic Zari', 'METALLIC_ZARI'),
    ('3G Pure Gold Zari', '3G_GOLD_ZARI')
ON CONFLICT (name) DO NOTHING;

-- Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public) VALUES
    ('product-media', 'product-media', true),
    ('homepage-media', 'homepage-media', true),
    ('review-media', 'review-media', true),
    ('reel-thumbnails', 'reel-thumbnails', true),
    ('claim-evidence', 'claim-evidence', false)
ON CONFLICT (id) DO NOTHING;
