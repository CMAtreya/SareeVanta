# SAREEVANTA / NEEL SAREE HOUSE
# V1 Detailed System & Database Specification (DSS)

**Version:** 1.0  
**Status:** FINAL V1 DSS  
**Project:** SAREEVANTA / Neel Saree House  
**Database:** Supabase PostgreSQL  
**Backend:** Node.js + TypeScript  
**Storage:** Supabase Storage  
**Source of Truth:** Final V1 Master Decision Registry + Final BFS  
**Reference Standard:** Existing QR Dining DSS structure and level of technical detail  
**Purpose:** Implementation-prescriptive database/system contract for Antigravity

---

# Document Control

## 1. Purpose

This DSS translates the finalized SAREEVANTA V1 BFS into the concrete database and system design required for implementation.

It defines:

- database architecture
- tables
- columns
- data types
- primary keys
- foreign keys
- cardinality
- constraints
- indexes
- lifecycle/state storage
- historical snapshots
- inventory/reservation persistence
- payment persistence
- shipment/Shiprocket persistence
- return/claim/refund/replacement persistence
- review/moderation persistence
- catalog/taxonomy/collection persistence
- homepage/reel/coupon persistence
- customer/staff/RBAC persistence
- audit history
- storage references
- RLS/security boundaries
- transaction/concurrency requirements
- seed/reference data
- implementation rules required to preserve the BFS

This is **not** a step-by-step coding guide and is not an API route specification.

---

# 2. Technical Foundation

## 2.1 Database

Use **Supabase PostgreSQL**.

All relational entities shall use PostgreSQL tables with enforced referential integrity.

## 2.2 Backend

Use **Node.js + TypeScript**.

The backend may use Supabase's database access facilities and server-side Supabase clients as appropriate.

## 2.3 Internal IDs

All major persistent entities use UUID primary keys.

Internal UUIDs must not be used as customer-facing business identifiers.

## 2.4 Business Identifiers

Human-readable identifiers are separate from UUID primary keys.

Examples:

- SKU
- Order Number
- Shipment Number
- Return/Claim Number
- Coupon Code
- Barcode

## 2.5 Timestamps

Major persistent entities use:

- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

Lifecycle-specific timestamps are added only where the event is meaningful.

Examples:

- `paid_at`
- `processing_started_at`
- `cancelled_at`
- `picked_up_at`
- `delivered_at`

## 2.6 Money

All persisted monetary amounts use integer **paise**.

Example:

`129950` = ₹1,299.50.

Column names shall explicitly identify the unit, e.g.:

- `selling_price_paise`
- `mrp_paise`
- `cost_price_paise`
- `shipping_fee_paise`

Application formatting converts stored paise into rupee display values.

Never use floating-point columns for financial amounts.

## 2.7 Quantity

Inventory quantities use integer numeric values.

Saree inventory is piece-based.

---

# 3. Global Database Rules

## 3.1 Primary Keys

Every major entity has a UUID primary key.

## 3.2 Foreign Keys

Every relationship is represented by an explicit foreign key.

Orphaned relational records are not permitted unless a relationship is deliberately nullable.

## 3.3 Nullability

`NOT NULL` is used for required business data.

Nullable fields are permitted only when the BFS defines the information as optional or when lifecycle timing makes the value legitimately unavailable.

## 3.4 Historical Accuracy

Historical commercial data must not change when current master records change.

Orders must retain the required historical snapshot values.

## 3.5 Destructive Deletion

Historical entities must not be hard-deleted.

Catalog/configuration values that are no longer valid for new products should be marked inactive/retired.

## 3.6 RLS

**Row Level Security shall be enabled on all application tables in V1.**

Detailed policies are implementation/security work and shall be added after the schema is established.

RLS must not be treated as the only authorization mechanism; backend RBAC remains mandatory.

## 3.7 Naming

Use:

- lowercase `snake_case`
- singular conceptual table names or a consistent plural convention across the schema
- UUID columns named `id`
- foreign keys named `<entity>_id`
- timestamp columns ending `_at`
- boolean columns beginning with `is_` where appropriate

---

# 4. ENTITY RELATIONSHIP OVERVIEW

```text
Customer
 ├── Customer Addresses
 ├── Wishlist Items
 ├── Cart
 ├── Checkout Sessions
 ├── Orders
 ├── Reviews
 └── Return Claims

Parent Product
 ├── Taxonomy / Category
 ├── Collection Membership
 ├── Product Attributes
 └── Product Variants
       ├── SKU
       ├── Barcode
       ├── Color
       ├── Pattern
       ├── Media
       ├── Inventory
       ├── Package Dimensions
       └── Reservations

Order
 ├── Customer
 ├── Address Snapshot
 ├── Order Items
 ├── Payment
 ├── Coupon Application
 ├── Shipment
 └── Return Claims

Shipment
 ├── Order
 ├── Shiprocket identifiers
 ├── Courier
 └── Tracking Events

Return Claim
 ├── Order
 ├── Order Item
 ├── Evidence
 ├── Verification
 ├── Admin Decision
 ├── Refund
 └── Replacement Fulfillment

Review
 ├── Customer
 ├── Order
 ├── Order Item / Product Variant
 ├── Photos
 └── Moderation

Staff
 ├── Role
 └── Permissions

Homepage
 ├── Hero Slides
 └── Marquee

Reels
 └── External Instagram URL
```

---

# 5. CUSTOMER DOMAIN

## 5.1 `customers`

Purpose: customer identity and account-level data.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `email` | citext | NO | UNIQUE |
| `phone` | text | YES | UNIQUE where present |
| `password_hash` | text | YES | Never exposed |
| `auth_provider` | text | NO | CHECK |
| `name` | text | NO | |
| `is_active` | boolean | NO | DEFAULT true |
| `deletion_requested_at` | timestamptz | YES | |
| `deletion_reason` | text | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

`auth_provider` supports the finalized authentication model, including email/password and Google.

Passwords are represented only by secure hashes where applicable. Google-authenticated users do not require a locally stored password.

## 5.2 `customer_addresses`

One customer can have many addresses.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `customer_id` | uuid | NO | FK customers |
| `label` | text | YES | |
| `recipient_name` | text | NO | |
| `phone` | text | NO | |
| `address_line_1` | text | NO | |
| `address_line_2` | text | YES | |
| `city` | text | NO | |
| `state` | text | NO | |
| `postal_code` | text | NO | Indian PIN validation |
| `country` | text | NO | V1 default India |
| `is_default` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Relationship:

`customers 1:N customer_addresses`

## 5.3 Wishlist

`wishlist_items`

One customer may save many variants.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `customer_id` | uuid | NO | FK |
| `variant_id` | uuid | NO | FK |
| `created_at` | timestamptz | NO | |

Unique:

`(customer_id, variant_id)`

Login is required for wishlist use.

---

# 6. CATALOG DOMAIN

## 6.1 `products`

Represents the master/parent product.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `name` | text | NO | |
| `description` | text | YES | |
| `weaving_value_id` | uuid | YES | FK controlled value |
| `fabric_value_id` | uuid | YES | FK controlled value |
| `blouse_included` | boolean | NO | |
| `saree_length` | numeric | YES | |
| `saree_width` | numeric | YES | |
| `zari_specification_value_id` | uuid | YES | FK |
| `certification_value_id` | uuid | YES | Central Silk Board certification reference/value as locked |
| `hsn_code_id` | uuid | YES | FK basic selectable HSN |
| `gst_rate` | numeric | NO | |
| `status` | text | NO | DRAFT / PUBLISHED / UNPUBLISHED |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

No archive state.

No origin field.

No loom construction type.

No loom tag ID.

## 6.2 `product_variants`

Every purchasable saree variant belongs to exactly one parent product.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `product_id` | uuid | NO | FK products |
| `sku` | text | NO | UNIQUE, immutable |
| `barcode` | text | NO | UNIQUE, immutable |
| `color_id` | uuid | NO | FK |
| `pattern_id` | uuid | NO | FK |
| `border_styling_id` | uuid | NO | FK |
| `selling_price_paise` | bigint | NO | >= 0 |
| `mrp_paise` | bigint | NO | >= 0 |
| `cost_price_paise` | bigint | NO | >= 0, admin/internal |
| `package_weight_grams` | integer | NO | > 0 |
| `package_length_cm` | numeric | NO | > 0 |
| `package_width_cm` | numeric | NO | > 0 |
| `package_height_cm` | numeric | NO | > 0 |
| `blouse_length_cm` | numeric | YES | Required if blouse included |
| `blouse_width_cm` | numeric | YES | Required if blouse included |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Constraint:

`selling_price_paise <= mrp_paise`

where business rules permit.

SKU is the leading admin identifier.

### SKU Format

The V1 SKU format is:

```text
NSH-0001
NSH-0002
NSH-0003
...
```

The numeric sequence is four-digit zero-padded and unique.

The SKU belongs to the variant, not the parent product.

The SKU is generated by the system and cannot be edited manually after creation.

## 6.3 Barcode

Barcode is generated automatically from the SKU/variant identity.

Requirements:

- unique
- immutable
- not manually editable
- internally owned by SAREEVANTA
- physically scannable by standard barcode scanners
- not required to be GS1/business-certified in V1

The exact barcode symbology may be selected during implementation, provided it satisfies standard scanner compatibility and the uniqueness/immutability requirements.

---

# 7. CONTROLLED CATALOG VALUES

## 7.1 General Pattern

Controlled catalog values are stored as managed reference records rather than repeated arbitrary strings.

Examples:

- weaving
- fabric
- occasion
- pattern
- border styling
- Zari specification
- certification values
- HSN values

Each controlled value supports:

- stable ID
- display name
- active/inactive state
- timestamps

Retiring a value makes it unavailable to new products while preserving existing references.

## 7.2 Cardinality

### Weaving

One product → one weaving value.

### Fabric

One product → one fabric value.

### Occasion

Product → many occasions.

Use a junction table.

### Pattern

One variant → one pattern.

### Border styling

One variant → one predefined border styling value.

### Zari specification

One product → one selected Zari specification value where applicable.

---

# 8. COLOR DOMAIN

## 8.1 `colors`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `name` | text | NO | UNIQUE within active catalog |
| `representative_hex` | char(7) | NO | `#RRGGBB` |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Admin color creation uses a swatch-oriented UI.

No AI color similarity.

No external color API.

No duplicate categorical color names.

CSS/hex generation/selection is sufficient for V1.

---

# 9. PRODUCT MEDIA

## 9.1 `product_variant_media`

Media belongs to the variant because color/variant presentation is variant-aware.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `variant_id` | uuid | NO | FK |
| `storage_path` | text | NO | Supabase Storage |
| `display_order` | integer | NO | >= 1 |
| `is_primary` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

V1 product media:

- 1–3 images per variant
- no 4K product video requirement
- no image-roll abstraction

Constraint:

Only one `is_primary = true` media record per variant.

---

# 10. COLLECTIONS & TAXONOMY

## 10.1 `collections`

Supports both rule-based and curated collections.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `name` | text | NO | |
| `type` | text | NO | RULE_BASED / CURATED |
| `description` | text | YES | |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

## 10.2 `collection_products`

Curated membership.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `collection_id` | uuid | NO | FK |
| `product_id` | uuid | NO | FK |
| `display_order` | integer | YES | |
| `created_at` | timestamptz | NO | |

PK:

`(collection_id, product_id)`

A product may belong to many collections.

## 10.3 Rule-based collections

Rule definitions are stored only to the extent required to evaluate the finalized V1 collection logic.

Do not implement a generic enterprise rules engine.

## 10.4 Taxonomy

Use a simple hierarchical category structure.

`categories`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `parent_id` | uuid | YES | self-FK |
| `name` | text | NO | |
| `slug` | text | NO | UNIQUE |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

A product/category relationship may be represented by:

`product_categories`

PK:

`(product_id, category_id)`

---

# 11. INVENTORY DOMAIN

## 11.1 `inventory`

One inventory record per product variant.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `variant_id` | uuid | NO | PK/FK |
| `physical_stock` | integer | NO | >= 0 |
| `reserved_stock` | integer | NO | >= 0 |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Available-to-sell is derived:

```text
available_to_sell = physical_stock - reserved_stock
```

Do not store a redundant available-to-sell value unless implementation evidence later requires materialization.

Low stock:

```text
available_to_sell <= 3
```

No configurable reorder point.

No bin location.

No warehouse location.

No physical stock-location engine.

## 11.2 `inventory_movements`

Immutable inventory history.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `variant_id` | uuid | NO | FK |
| `movement_type` | text | NO | controlled |
| `quantity_delta` | integer | NO | non-zero |
| `physical_stock_before` | integer | NO | |
| `physical_stock_after` | integer | NO | |
| `reserved_stock_before` | integer | NO | |
| `reserved_stock_after` | integer | NO | |
| `reason` | text | YES | |
| `reference_type` | text | YES | |
| `reference_id` | uuid | YES | |
| `actor_staff_id` | uuid | YES | FK |
| `created_at` | timestamptz | NO | |

Direct administrative stock editing is permitted only as an administrative correction and requires reason plus before/after quantity and actor/timestamp.

---

# 12. RESERVATION DOMAIN

## 12.1 `inventory_reservations`

Temporary reservations are first-class persistence records.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `variant_id` | uuid | NO | FK |
| `quantity` | integer | NO | > 0 |
| `source_type` | text | NO | CUSTOMER_CHECKOUT / MANUAL_ORDER |
| `source_id` | uuid | NO | |
| `status` | text | NO | ACTIVE / CONVERTED / RELEASED / EXPIRED |
| `expires_at` | timestamptz | NO | |
| `converted_at` | timestamptz | YES | |
| `released_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |

Customer checkout reservation:

**30 minutes**

Manual admin order reservation:

**35 minutes**

Reservations must be created/released atomically with inventory updates.

Expired reservations must not remain counted as active stock reservations.

---

# 13. CART

## 13.1 `carts`

One active cart per authenticated customer.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `customer_id` | uuid | NO | UNIQUE |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

## 13.2 `cart_items`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `cart_id` | uuid | NO | FK |
| `variant_id` | uuid | NO | FK |
| `quantity` | integer | NO | > 0 |
| `is_selected` | boolean | NO | DEFAULT true |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Unique:

`(cart_id, variant_id)`

Unselected unavailable items remain in cart and are marked unavailable/out-of-stock in application presentation.

After successful checkout/payment, cart selection state is reset according to the finalized customer workflow.

---

# 14. CHECKOUT

## 14.1 `checkout_sessions`

A checkout session represents a customer checkout attempt.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `customer_id` | uuid | NO | FK |
| `status` | text | NO | ACTIVE / COMPLETED / EXPIRED / FAILED |
| `expires_at` | timestamptz | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Checkout stages:

1. Delivery Address
2. Review
3. Payment Method
4. Confirmation

The backend must revalidate the complete checkout state at payment/order creation.

## 14.2 `checkout_items`

Stores the variants and quantities participating in that checkout session.

Reservation records reference the checkout session.

---

# 15. ORDERS

## 15.1 `orders`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `order_number` | text | NO | UNIQUE |
| `customer_id` | uuid | NO | FK |
| `order_status` | text | NO | controlled |
| `payment_status` | text | NO | controlled |
| `subtotal_paise` | bigint | NO | |
| `discount_paise` | bigint | NO | |
| `tax_paise` | bigint | NO | |
| `shipping_fee_paise` | bigint | NO | |
| `total_paise` | bigint | NO | |
| `coupon_id` | uuid | YES | FK |
| `shipping_buffer_paise` | bigint | NO | |
| `placed_at` | timestamptz | NO | |
| `processing_started_at` | timestamptz | YES | |
| `cancelled_at` | timestamptz | YES | |
| `cancellation_reason` | text | YES | |
| `cancellation_notes` | text | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Order is the commercial source record.

Core historical facts are not rewritten after placement.

## 15.2 `order_items`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `order_id` | uuid | NO | FK |
| `product_id` | uuid | NO | FK |
| `variant_id` | uuid | NO | FK |
| `sku_snapshot` | text | NO | |
| `product_name_snapshot` | text | NO | |
| `variant_name_snapshot` | text | YES | |
| `color_name_snapshot` | text | YES | |
| `pattern_name_snapshot` | text | YES | |
| `unit_price_paise` | bigint | NO | |
| `discount_paise` | bigint | NO | |
| `tax_paise` | bigint | NO | |
| `quantity` | integer | NO | > 0 |
| `line_total_paise` | bigint | NO | |
| `created_at` | timestamptz | NO | |

No SKU lookup-only model is sufficient for historical orders; SKU is explicitly snapshotted.

## 15.3 Order address snapshot

`order_delivery_addresses`

One order has exactly one historical delivery-address snapshot.

The snapshot must preserve the address used for the order regardless of later customer address edits.

---

# 16. PAYMENTS

## 16.1 `payments`

One order may have multiple payment attempts, but only one successful payment should establish the successful payment state for the order.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `order_id` | uuid | NO | FK |
| `provider` | text | NO | RAZORPAY |
| `provider_payment_id` | text | YES | UNIQUE where present |
| `provider_order_id` | text | YES | |
| `amount_paise` | bigint | NO | |
| `status` | text | NO | CREATED / PENDING / SUCCESS / FAILED / REFUNDED / PARTIALLY_REFUNDED if needed internally |
| `method` | text | YES | |
| `upi_reference` | text | YES | optional |
| `verified_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Razorpay implementation details are integration-stage work.

Payment confirmation must be backend-verified.

---

# 17. COUPONS

## 17.1 `coupons`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `code` | text | NO | UNIQUE |
| `discount_type` | text | NO | FIXED / PERCENTAGE |
| `discount_value` | bigint/numeric | NO | |
| `is_active` | boolean | NO | |
| `valid_from` | timestamptz | YES | |
| `valid_until` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

V1 permits maximum one promotional coupon per order.

No coupon stacking.

## 17.2 `order_coupon_applications`

Stores the coupon actually applied to an order.

This preserves historical discount interpretation.

---

# 18. SHIPMENTS

## 18.1 `shipments`

One order has at most one V1 shipment/parcel.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `order_id` | uuid | NO | UNIQUE FK |
| `shiprocket_order_id` | text | YES | |
| `shiprocket_shipment_id` | text | YES | |
| `awb` | text | YES | UNIQUE where present |
| `courier_id` | text | YES | |
| `courier_name` | text | YES | |
| `shipment_status` | text | NO | normalized business state |
| `provider_status` | text | YES | latest provider status |
| `estimated_delivery_at` | timestamptz | YES | |
| `pickup_requested_at` | timestamptz | YES | |
| `picked_up_at` | timestamptz | YES | |
| `delivered_at` | timestamptz | YES | |
| `cancelled_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

No fake shipped state.

Order becomes shipped only when actual pickup/handover is confirmed according to the integration flow.

## 18.2 `shipment_tracking_events`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `shipment_id` | uuid | NO | FK |
| `provider_event_id` | text | YES | idempotency |
| `provider_status` | text | NO | |
| `normalized_status` | text | YES | |
| `event_time` | timestamptz | YES | |
| `location_text` | text | YES | |
| `remarks` | text | YES | |
| `raw_payload` | jsonb | YES | integration troubleshooting |
| `created_at` | timestamptz | NO | |

Provider events must be idempotently processed.

No guaranteed GPS coordinate requirement.

---

# 19. SHIPROCKET WEBHOOKS

## 19.1 `integration_webhook_events`

Stores enough information to detect and safely handle duplicate webhook deliveries.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `provider` | text | NO | |
| `event_key` | text | NO | UNIQUE per provider |
| `event_type` | text | YES | |
| `payload` | jsonb | NO | |
| `received_at` | timestamptz | NO | |
| `processed_at` | timestamptz | YES | |
| `processing_status` | text | NO | RECEIVED / PROCESSED / FAILED |
| `error_message` | text | YES | |

Shiprocket webhook security uses the configured secret/header mechanism.

Do not expose credentials to the frontend.

---

# 20. RETURNS / CLAIMS

## 20.1 `return_claims`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `claim_number` | text | NO | UNIQUE |
| `order_id` | uuid | NO | FK |
| `order_item_id` | uuid | NO | FK |
| `customer_id` | uuid | NO | FK |
| `claim_type` | text | NO | |
| `reason_code` | text | NO | |
| `reason_text` | text | YES | |
| `status` | text | NO | |
| `submitted_at` | timestamptz | NO | |
| `verification_completed_at` | timestamptz | YES | |
| `approved_at` | timestamptz | YES | |
| `rejected_at` | timestamptz | YES | |
| `closed_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

V1 claim reasons include:

- Wrong product/color
- Damaged product
- Missing item
- Product significantly different from description
- Other

## 20.2 `claim_evidence`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `claim_id` | uuid | NO | FK |
| `media_type` | text | NO | PHOTO / VIDEO |
| `storage_path` | text | NO | Supabase Storage |
| `display_order` | integer | NO | |
| `created_at` | timestamptz | NO | |

V1:

- minimum 1 photo
- maximum 3 photos
- maximum 1 optional video

Photos are mandatory for wrong-product/color and damaged-product claims.

---

# 21. CLAIM VERIFICATION

## 21.1 `claim_verifications`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `claim_id` | uuid | NO | UNIQUE FK |
| `verification_status` | text | NO | PENDING / PASSED / FAILED |
| `admin_staff_id` | uuid | YES | FK |
| `notes` | text | YES | |
| `verified_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Evidence-based claim approval can occur before physical verification, but refund/replacement completion must wait for required physical verification.

---

# 22. REFUNDS

## 22.1 `refunds`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `order_id` | uuid | NO | FK |
| `claim_id` | uuid | YES | FK |
| `payment_id` | uuid | NO | FK |
| `amount_paise` | bigint | NO | > 0 |
| `status` | text | NO | PENDING / INITIATED / COMPLETED / FAILED |
| `provider_refund_id` | text | YES | |
| `reason` | text | YES | |
| `initiated_at` | timestamptz | YES | |
| `completed_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Refund returns to original payment method through Razorpay where supported.

V1 has no separate admin partial-refund tool.

Processing fees are non-refundable where the finalized policy applies.

---

# 23. REPLACEMENTS

## 23.1 `replacement_fulfillments`

A replacement remains connected to the original order.

It is not created as an unrelated customer order.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `claim_id` | uuid | NO | FK |
| `original_order_id` | uuid | NO | FK |
| `replacement_variant_id` | uuid | NO | FK |
| `quantity` | integer | NO | |
| `status` | text | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Replacement inventory is controlled through the same inventory system.

---

# 24. REVIEWS

## 24.1 `reviews`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `customer_id` | uuid | NO | FK |
| `order_id` | uuid | NO | FK |
| `order_item_id` | uuid | NO | FK |
| `variant_id` | uuid | NO | FK |
| `rating` | smallint | NO | CHECK 1–5 |
| `review_text` | text | NO | |
| `moderation_status` | text | NO | |
| `verified_buyer` | boolean | NO | derived/validated |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Review eligibility requires delivered order.

## 24.2 `review_photos`

Maximum two per review.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `review_id` | uuid | NO | FK |
| `storage_path` | text | NO | Supabase Storage |
| `display_order` | integer | NO | |
| `created_at` | timestamptz | NO | |

One moderation decision applies to the review and attached photos.

---

# 25. HOMEPAGE CONTENT

## 25.1 `hero_slides`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `desktop_image_path` | text | NO | Storage |
| `mobile_image_path` | text | NO | Storage |
| `badge_text` | text | YES | |
| `heading` | text | NO | |
| `tagline` | text | YES | |
| `cta_text` | text | NO | |
| `destination_type` | text | NO | |
| `destination_id` | uuid | NO | entity reference |
| `display_order` | integer | NO | |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

No arbitrary destination URL.

No hard maximum hero count.

## 25.2 `marquee_messages`

V1 permits only one active marquee message.

---

# 26. INSTAGRAM REELS

## 26.1 `reels`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `instagram_url` | text | NO | |
| `caption` | text | YES | |
| `thumbnail_storage_path` | text | YES | |
| `display_order` | integer | NO | |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

No video storage.

No shortcode.

No crawler.

No monitoring.

Unlimited stored records subject to normal system limits.

---

# 27. STAFF / RBAC

## 27.1 `staff_users`

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `email` | citext | NO | UNIQUE |
| `name` | text | NO | |
| `role_id` | uuid | NO | FK |
| `is_active` | boolean | NO | |
| `created_at` | timestamptz | NO | |
| `updated_at` | timestamptz | NO | |

Exactly four V1 roles.

## 27.2 `roles`

Seed values:

1. Super Admin
2. Operational Role 1
3. Operational Role 2
4. Operational Role 3

Exact operational role names/permission matrix are defined by implementation/admin requirements without increasing the role count.

## 27.3 `permissions`

Permissions are atomic capabilities.

## 27.4 `role_permissions`

Many-to-many:

`roles N:M permissions`

PK:

`(role_id, permission_id)`

Staff users receive permissions through their role.

---

# 28. AUDIT HISTORY

## 28.1 `audit_logs`

Generic business/admin audit history.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| `id` | uuid | NO | PK |
| `actor_staff_id` | uuid | YES | FK |
| `action` | text | NO | |
| `entity_type` | text | NO | |
| `entity_id` | uuid | NO | |
| `reason` | text | YES | |
| `metadata` | jsonb | YES | |
| `created_at` | timestamptz | NO | |

Use dedicated domain history tables where the history itself is a business entity, such as inventory movements and shipment tracking.

Do not replace domain history with a generic audit table.

---

# 29. TECHNICAL LOGS

Technical logs are separate from business audit history.

They may be handled by the backend/runtime logging system rather than being treated as a business table.

Do not store:

- passwords
- OTP secrets
- payment credentials
- Shiprocket credentials
- unnecessary personal secrets

in business audit records.

---

# 30. NOTIFICATIONS

No separate full Notifications management page is required in V1.

Operational alerts may be persisted in a lightweight notification/alert structure where the admin dashboard requires read/unread state.

The system should support:

- unread
- read
- created timestamp
- relevant entity reference

No notification campaign engine.

---

# 31. STORAGE

Supabase Storage is used for:

- product images
- homepage hero images
- review photos
- claim evidence
- optional reel thumbnails

Recommended logical buckets:

```text
product-media
homepage-media
review-media
claim-evidence
reel-thumbnails
```

Public vs private access is determined by the content type.

Claim evidence and other sensitive material must not be unrestricted public assets.

Database rows store storage paths, not binary file contents.

---

# 32. DATABASE INDEXING

Required indexes include, at minimum:

### Customers

- email
- phone

### Products

- status
- name
- relevant catalog foreign keys

### Variants

- SKU
- barcode
- product_id
- color_id
- pattern_id

### Inventory

- variant_id

### Reservations

- variant_id
- status
- expires_at
- source_id

### Orders

- order_number
- customer_id
- order_status
- payment_status
- placed_at

### Shipments

- order_id
- AWB
- Shiprocket identifiers
- shipment status

### Tracking

- shipment_id
- provider event key

### Claims

- claim number
- order_id
- customer_id
- status

### Reviews

- product/variant
- customer
- moderation status

### Staff

- email
- role_id
- active state

Indexes should be added where actual query patterns require them; do not create indexes on every column.

---

# 33. TRANSACTIONS & CONCURRENCY

## 33.1 Inventory Reservation

The following must be atomic:

1. verify available stock
2. increment reserved stock
3. create reservation

Concurrent reservations must not oversell.

## 33.2 Reservation Release

Release must be idempotent.

A reservation cannot be released twice in a way that subtracts the reserved quantity twice.

## 33.3 Payment → Order

Payment confirmation and order commitment must preserve inventory consistency.

## 33.4 Cancellation

Cancellation and stock release must be consistent.

## 33.5 Manual Order

SKU entry + reservation must be concurrency-safe.

## 33.6 Return-to-Stock

Admin-confirmed return-to-stock must create the inventory movement and update stock consistently.

---

# 34. IDEMPOTENCY

Idempotency is required for external events and retryable business operations.

Especially:

- Shiprocket webhooks
- payment callbacks
- refund updates
- shipment updates
- reservation release
- stock release

A duplicate event must not create duplicate business actions.

---

# 35. STATE STORAGE

Do not create one universal status column for all domains.

Separate state dimensions where necessary:

- order status
- payment status
- shipment status
- claim status
- refund status
- review moderation status
- product publication status
- reservation status

Statuses shall use controlled values with database/application validation.

Where a small fixed set is stable, PostgreSQL enums are acceptable.

Where admin-managed values or future evolution is expected, controlled reference values are preferable.

---

# 36. RLS SECURITY MODEL

RLS is enabled on all application tables.

Policies will later be defined around:

### Customer access

A customer may access only their own:

- addresses
- cart
- wishlist
- checkout
- orders
- reviews
- claims
- relevant evidence

### Admin access

Staff access is determined by backend RBAC and corresponding RLS/service-layer enforcement.

### Public access

Public catalog/content reads may expose only explicitly public records.

Never expose:

- cost price
- private claim evidence
- internal moderation data
- technical logs
- credentials
- private staff data

---

# 37. HISTORICAL SNAPSHOT RULES

Snapshots are required when current master data changing would otherwise change the historical commercial meaning.

Minimum order snapshots include:

## Customer snapshot

- customer name
- relevant contact identity used at order time

## Address snapshot

- recipient name
- phone
- complete delivery address

## Order item snapshot

- product name
- SKU
- relevant variant identity
- color
- pattern
- unit price
- discount
- tax
- quantity
- line total

Do not snapshot every product table column.

---

# 38. DERIVED DATA

Derived values should be calculated rather than duplicated when consistency matters.

Examples:

```text
available_to_sell =
physical_stock - reserved_stock
```

Customer metrics such as:

- order count
- total spend
- last order date

may be derived from orders or materialized only if performance later requires it.

Inventory valuation can be calculated from stock and internal cost price.

Do not build a separate CRM fact store merely to display dashboard metrics.

---

# 39. ANALYTICS

Analytics should primarily derive from transactional data.

V1 does not require a separate data warehouse.

The schema must support reporting for:

- orders
- sales
- inventory
- customer activity
- product performance
- returns
- claims
- shipment outcomes

Analytics queries must not mutate commercial records.

---

# 40. ADMIN SEARCH

Admin search should prioritize real operational identifiers.

For order/product workflows, SKU is the primary product identifier.

Order search may support:

- order number
- SKU
- customer name
- email
- phone
- AWB
- product name

Search fields are not separate database entities.

---

# 41. DATA RETENTION / DELETION

Customer account deletion must respect historical commercial records.

Deleting a customer account must not destroy required historical order integrity.

Where legally/operationally necessary, customer personal information may be anonymized/deactivated according to the final privacy policy while preserving required transaction history.

Products with historical orders are unpublished/inactivated, not hard-deleted.

Catalog values referenced historically are retired, not hard-deleted.

---

# 42. REFERENCE / SEED DATA

V1 requires seed/reference values for controlled domains such as:

- product status
- order status
- payment status
- shipment normalized status
- claim types/reasons
- review moderation status
- reservation status
- roles
- permissions
- discount types
- collection types
- relevant catalog values where explicitly predefined

Admin-created catalog values remain dynamically manageable.

---

# 43. V1 EXCLUSIONS FROM DATABASE DESIGN

Do not create unnecessary first-class database machinery for:

- guest checkout
- COD
- multi-warehouse management
- bin locations
- complex taxonomy engines
- GI acquisition
- origin metadata
- loom tag IDs
- loom construction type
- bulk import
- review video
- Instagram crawling
- Instagram monitoring
- coupon stacking
- complex marketing campaigns
- notification campaigns
- custom courier engine
- custom pickup scheduler
- custom manifest system
- live courier GPS
- enterprise CRM 360
- VIP customer engine
- unnecessary AI systems

The absence of a UI feature must not be compensated for by silently creating its backend engine.

---

# 44. IMPLEMENTATION PRESCRIPTION

Antigravity implementation shall treat this DSS as the database/system contract.

The implementation must:

1. Create the schema according to the entity definitions.
2. Enforce primary and foreign keys.
3. Enforce uniqueness where specified.
4. Enforce required checks.
5. Create indexes required by actual query patterns.
6. Enable RLS on all application tables.
7. Add policies after the schema is stable.
8. Preserve historical snapshots.
9. Make inventory operations transactional.
10. Make webhook/event handling idempotent.
11. Keep provider-specific data inside provider integration boundaries.
12. Keep sensitive fields out of customer-facing responses.
13. Preserve business audit history separately from technical logs.
14. Avoid introducing entities/features not defined in BFS/DSS.

---

# 45. DSS → IMPLEMENTATION BOUNDARY

The DSS determines:

- logical database structure
- physical database schema
- relationships
- constraints
- indexes
- persistence rules
- storage boundaries
- RLS boundary
- historical snapshot rules
- transaction requirements
- integration persistence

The developer remains free to choose ordinary implementation details that do not alter the specified business/data behavior.

Any implementation choice that would change a locked business rule must return to the BFS/decision registry for clarification.

---

# 46. FINAL V1 DATABASE PRINCIPLES

1. Supabase PostgreSQL is the authoritative database.
2. UUIDs are internal primary keys.
3. Business identifiers are separate.
4. SKU is `NSH-0001`, `NSH-0002`, etc.
5. SKU is variant-owned and immutable.
6. Barcode is unique, immutable and scanner-compatible.
7. Parent product owns common product data.
8. Variant owns purchasable variant-specific data.
9. Color is a controlled reference value.
10. Controlled catalog values can be retired.
11. Occasion is many-to-many.
12. Inventory is variant-level.
13. Available-to-sell is derived from physical minus reserved.
14. Reservations are persisted and time-bound.
15. Customer checkout reservation = 30 minutes.
16. Manual-order reservation = 35 minutes.
17. One order = one V1 shipment.
18. Orders preserve historical commercial facts.
19. Shipments are separate from orders.
20. Shiprocket identifiers remain separate.
21. Shipment webhook handling is idempotent.
22. Refunds are separate financial records.
23. Claims and evidence are separate records.
24. Replacement fulfillment remains linked to the original order.
25. Reviews are tied to delivered purchases.
26. Review photos are limited to two.
27. Claim evidence supports the finalized photo/video limits.
28. Supabase Storage holds media.
29. RLS is enabled on every application table.
30. RBAC has exactly four V1 roles.
31. Audit history and technical logs are separate.
32. Derived data should not be redundantly persisted without reason.
33. No unnecessary enterprise machinery is introduced.
34. DSS implements the BFS; it does not invent new business requirements.

---

# Appendix A — Cardinality Summary

| Relationship | Cardinality |
|---|---|
| Customer → Addresses | 1:N |
| Customer → Wishlist Items | 1:N |
| Customer → Orders | 1:N |
| Customer → Reviews | 1:N |
| Customer → Claims | 1:N |
| Product → Variants | 1:N |
| Product ↔ Collections | N:M |
| Product ↔ Categories | N:M |
| Product → Variants | 1:N |
| Variant → Media | 1:N |
| Variant → Inventory | 1:1 |
| Variant → Reservations | 1:N over time |
| Cart → Cart Items | 1:N |
| Customer → Cart | 1:1 active cart |
| Checkout → Checkout Items | 1:N |
| Order → Order Items | 1:N |
| Order → Payment Attempts | 1:N |
| Order → Delivery Snapshot | 1:1 |
| Order → Shipment | 1:0..1 |
| Shipment → Tracking Events | 1:N |
| Order Item → Claims | 1:N |
| Claim → Evidence | 1:N |
| Claim → Verification | 1:1 |
| Claim → Refund | 1:0..N |
| Claim → Replacement | 1:0..1+ |
| Review → Photos | 1:0..2 |
| Role ↔ Permission | N:M |
| Staff → Role | N:1 |
| Hero Slide → Catalog Destination | N:1 by destination type |
| Collection → Curated Products | N:M |

---

# Appendix B — V1 State Summary

## Product

```text
DRAFT
PUBLISHED
UNPUBLISHED
```

## Reservation

```text
ACTIVE
CONVERTED
RELEASED
EXPIRED
```

## Order

```text
PLACED
PROCESSING
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

## Payment

```text
CREATED
PENDING
SUCCESS
FAILED
REFUNDED
```

## Shipment

Normalized internal state derived from actual provider events.

No fake shipment state.

## Claim

```text
SUBMITTED
VERIFICATION_PENDING
APPROVED
REJECTED
REFUND_PENDING
REPLACEMENT_PROCESSING
COMPLETED
CLAIM_CLOSED
RETURN_FAILED
```

## Review

```text
PENDING
APPROVED
HIDDEN
REJECTED
```

---

# Appendix C — Source Precedence

The DSS is derived in this order:

1. Final SAREEVANTA V1 Master Decision & Specification Registry.
2. Final SAREEVANTA V1 BFS.
3. Finalized Shiprocket research.
4. Existing QR Dining DSS as the structural/detail reference.

If the old frontend, QR Dining implementation, or generic e-commerce convention conflicts with a finalized SAREEVANTA decision:

**SAREEVANTA's finalized decision wins.**

If a provider capability is not verified:

**Do not assume it. Mark it as an integration verification dependency.**

---

# FINAL STATUS

**SAREEVANTA V1 DSS — FINAL IMPLEMENTATION SPECIFICATION**

This document is the technical database/system contract derived from the finalized BFS.

The next step after DSS approval is implementation by Antigravity.

**End of SAREEVANTA V1 DSS.**
