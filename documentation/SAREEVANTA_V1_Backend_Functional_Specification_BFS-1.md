# SAREEVANTA / NEEL SAREE HOUSE

# Backend Functional Specification (BFS)

**Version:** 1.0  
**Status:** V1 Functional Specification — Generated from Finalized Product Decisions  
**Specification Type:** Backend Functional Specification  
**Project:** Saree E-Commerce Platform  
**Primary Business:** Neel Saree House / SAREEVANTA  
**Source of Truth:** Final V1 Master Decision & Specification Registry + finalized project decisions  
**Next Document:** Database / Data & System Specification (DSS)  
**Implementation Code:** Not defined in this document

---

# Document Control

## 1. Purpose of This Document

This document defines the complete **functional behavior of the V1 backend** for the SAREEVANTA / Neel Saree House e-commerce system.

It is intended to become the backend development team's functional source of truth before database schema, API contracts, implementation code, frontend field mapping, and deployment details are finalized.

The BFS defines:

- System scope
- Actors
- Backend modules
- Functional responsibilities
- Core entities at a functional level
- Business rules
- Customer workflows
- Admin workflows
- Product/catalog behavior
- Inventory behavior
- Cart behavior
- Checkout behavior
- Payment behavior at the functional boundary
- Order lifecycle
- Shipment lifecycle
- Shiprocket integration behavior
- Return/exchange behavior
- Review behavior
- Customer-management behavior
- Marketing/content behavior
- Coupon behavior
- Dashboard/analytics behavior
- Staff and RBAC behavior
- Notifications/alerts
- Validation rules
- Historical-data rules
- Audit requirements
- Reconciliation requirements
- Failure/recovery behavior
- V1 exclusions
- Future/research dependencies
- Cross-module rules
- Functional acceptance criteria

This document intentionally does **not** define:

- SQL
- Table columns
- Exact database data types
- Migration scripts
- Exact API route paths
- Framework-specific implementation code
- Exact frontend component structure
- Pixel-level UI
- Exact customer/admin field visibility matrix
- Exact payment-gateway SDK implementation

Those are downstream DSS/implementation concerns.

---

# Chapter 1 — Product Overview

## 1.1 Product Purpose

SAREEVANTA is a focused saree e-commerce platform designed to allow customers to:

1. Discover sarees.
2. Search and filter the catalog.
3. Understand products through meaningful catalog information.
4. Select a specific purchasable color/variant.
5. Add products to cart.
6. Save variants to wishlist.
7. Checkout using a saved/new delivery address.
8. Pay online.
9. Receive an order confirmation.
10. Track shipment progress.
11. Cancel where cancellation rules permit.
12. Submit post-delivery reviews.
13. Submit eligible return/claim requests.
14. Manage their account and order history.

The administration side allows the business to:

1. Manage products and variants.
2. Manage SKU, barcode, stock, catalog attributes and product metadata.
3. Manage collections and taxonomy.
4. Manage orders.
5. Manage shipments through Shiprocket integration.
6. Manage returns, claims, refunds and replacements.
7. Manage customers.
8. Moderate reviews.
9. Manage coupons and discounts.
10. Manage homepage content.
11. Manage Instagram reel embeds.
12. View analytics.
13. Receive operational alerts.
14. Manage staff access through RBAC.

---

# 1.2 V1 Product Philosophy

The backend shall follow these principles:

1. **No overengineering.**
2. **No assumptions where a business decision has not been made.**
3. **No reintroduction of rejected mockup functionality.**
4. **No unnecessary enterprise features.**
5. **Backend is the final authority for business-critical state.**
6. **Historical commercial information must remain historically accurate.**
7. **External providers should be used where they already provide the required capability.**
8. **Automation should be used only when the system has reliable authoritative data.**
9. **Admin workflows should be operationally simple.**
10. **The architecture should remain extensible without forcing V1 to implement future functionality.**

---

# 1.3 V1 Operating Model

V1 is:

- A single-business saree e-commerce deployment.
- India domestic shipping.
- One fixed Shiprocket pickup location.
- Prepaid-only.
- One customer order is intended to become one physical parcel/shipment.
- Customer does not select courier.
- Shiprocket is the logistics integration.
- Razorpay is the intended payment gateway direction.
- Customer account is required for cart/wishlist/purchase actions.
- Email/password + email OTP authentication and Google authentication are the finalized customer authentication direction.
- Four admin access roles exist:
  - One Super Admin
  - Three Operational Roles

---

# 1.4 Functional Scope

V1 includes:

### Customer

- Authentication
- Account management
- Address management
- Catalog browsing
- Search
- Autocomplete
- Synonym handling
- Spelling handling
- Filters
- Product detail
- Variant selection
- Cart
- Cart item selection for checkout
- Wishlist
- Recently viewed
- Checkout
- Address selection
- PIN validation/serviceability
- Review page
- Payment
- Order confirmation
- Order history
- Cancellation
- Shipment tracking
- Returns/claims
- Reviews
- Customer account deletion

### Admin

- Dashboard
- Product/catalog management
- Variant/SKU management
- Inventory
- Collections
- Taxonomy/catalog values
- Orders
- Shipments
- Returns/exchanges
- Customers
- Reviews/UGC
- Instagram reels
- Discounts/coupons
- Homepage content
- Analytics/reports
- Notifications/alerts
- Staff/RBAC

---

# 1.5 Explicit V1 Exclusions

The following are not V1 requirements:

- COD
- International shipping
- Multi-warehouse
- Multi-pickup-location logic
- Customer courier selection
- Live courier GPS coordinates
- Custom courier scoring algorithm
- Custom logistics engine
- Custom pickup scheduling engine
- Custom manifest engine before Shiprocket verification
- Instagram crawling
- Instagram monitoring
- Instagram video uploads
- Instagram shortcode extraction
- Review videos
- More than two review photos
- Full CRM 360-degree dossier
- VIP Patron model
- Wedding month as customer search primitive
- Complex BPM/price-pendant logic
- Multiple coupons on one order
- Coupon redemption analytics engine
- Complex campaign engine
- Bulk catalog import
- Bulk inventory import
- Warehouse bin management
- Bin locations
- Loom bench
- Loom construction type
- Loom tag ID
- HSN search engine in V1
- Origin metadata
- Manual GI certification acquisition workflow
- Artificial hard limits on hero/reel count
- Scheduled collection states
- Complex notification-management platform
- Enterprise governance configuration on Staff/RBAC page

---

# Chapter 2 — Backend Design Principles

## 2.1 Business Logic Separation

Business rules shall be separated conceptually from API routing.

An API endpoint is not itself the business rule.

The same business rule must apply regardless of whether the operation is triggered by:

- Customer storefront
- Admin dashboard
- Webhook
- Scheduled/internal operation
- Manual order workflow

---

## 2.2 Module Responsibility

Each backend module should have one primary business responsibility.

Recommended functional modules:

1. Authentication
2. Customer
3. Address
4. Catalog
5. Taxonomy
6. Collections
7. Search
8. Wishlist
9. Recently Viewed
10. Cart
11. Checkout
12. Inventory
13. Pricing
14. Payment
15. Orders
16. Shipments
17. Shiprocket Integration
18. Returns/Claims
19. Refunds
20. Reviews
21. Customers/Admin CRM
22. Coupons
23. Homepage Content
24. Instagram Reels
25. Analytics
26. Notifications/Alerts
27. Staff/RBAC
28. Audit
29. Reconciliation

---

## 2.3 Internal Identifiers

Persistent entities shall use stable internal identifiers.

Internal IDs are not customer-facing identifiers.

Customer-facing business identifiers may include:

- Order number
- SKU
- AWB
- Product name
- Coupon code

The internal identifier remains the authoritative relationship key.

---

## 2.4 SKU as Administrative Identifier

SKU is especially important on the admin side.

For V1:

- Every purchasable variant has a SKU.
- SKU is generated/managed as part of product/variant creation.
- SKU is not the primary customer-facing product identifier.
- SKU is an important admin operational identifier.
- Manual orders can be created by entering SKU.
- Inventory operations can reference SKU.
- Barcode generation is tied to SKU.

SKU shall be stable once generated unless a later explicit product decision changes this rule.

---

## 2.5 Historical Accuracy

Historical commercial records must remain accurate.

Changes to current master data must not rewrite the historical meaning of:

- Order
- Order item
- Price paid
- Product identity
- Variant identity
- SKU information
- Address used for delivery
- Customer identity as relevant to the order
- Shipment relationship
- Return/claim record

Where required, the system shall store transaction-time snapshots while retaining normalized references to the master records.

---

## 2.6 Soft Retirement

Important catalog values and products should be unpublished/inactive rather than hard deleted when historical records depend on them.

For example:

A catalog value can become unavailable for new products while remaining valid for historical products.

A product with historical orders must not be hard deleted.

---

## 2.7 Backend Authority

The backend is the final authority for:

- Stock
- Reservation
- Price
- Order creation
- Payment state
- Order state
- Cancellation eligibility
- Refund state
- Claim state
- Shipment state
- Permissions
- Historical records

Frontend state is informational and cannot override backend validation.

---

# Chapter 3 — Actors

## 3.1 Customer

A registered customer can:

- Browse
- Search
- Filter
- View products
- Add to cart
- Wishlist
- Checkout
- Pay
- View orders
- Cancel within permitted window
- Track
- Submit eligible reviews
- Submit eligible claims
- Manage account information

Authentication is required for:

- Add to cart
- Wishlist
- Checkout/order placement
- Other protected account actions

---

## 3.2 Super Admin

The Super Admin has full V1 administrative access.

The Super Admin can:

- Manage staff
- Manage permissions/roles
- Manage catalog
- Manage inventory
- Manage orders
- Manage shipments
- Manage returns
- Manage customers
- Manage reviews
- Manage coupons
- Manage homepage content
- Manage reels
- View analytics
- Access operational alerts

---

## 3.3 Operational Role 1

Operational role 1 is one of the three controlled operational roles.

The role's exact permission matrix is defined in the DSS/permission matrix.

---

## 3.4 Operational Role 2

Operational role 2 is one of the three controlled operational roles.

The role's exact permission matrix is defined in the DSS/permission matrix.

---

## 3.5 Operational Role 3

Operational role 3 is one of the three controlled operational roles.

The role's exact permission matrix is defined in the DSS/permission matrix.

---

## 3.6 Shiprocket

Shiprocket is an external logistics provider.

It is authoritative for the logistics events it reports, including shipment tracking events and courier-side state.

---

## 3.7 Razorpay

Razorpay is the intended payment gateway.

The exact gateway implementation is intentionally deferred to the payment integration phase.

---

# Chapter 4 — Authentication & Account Management

## 4.1 Customer Authentication

Final V1 authentication direction:

- Email/password authentication
- Email OTP authentication where applicable
- Google authentication

The backend shall rely on the selected authentication provider/mechanism for credential verification.

The application shall not store plaintext passwords.

---

## 4.2 Login Requirement

A customer may browse without authentication.

Login is required for:

- Add to cart
- Wishlist
- Checkout
- Order placement
- Review submission
- Claim submission
- Account-protected actions

If an unauthenticated customer attempts a protected action:

1. Preserve the relevant intended context where safe.
2. Send the customer to authentication.
3. After successful authentication, return them to the intended workflow.

---

## 4.3 Customer Account

A customer account stores:

- Identity
- Email
- Phone when available
- Authentication relationship
- Addresses
- Orders
- Reviews
- Claims
- Wishlist
- Other account-level data required by V1

Customer password is never visible to admins.

Admins do not receive customer passwords.

---

## 4.4 Phone Number During Checkout

The customer phone number is required for shipping/order fulfillment.

If the account already has a phone number:

- Pre-fill it.
- Allow the customer to use/change the ordering phone number where the finalized checkout workflow permits.
- The chosen ordering phone number becomes part of the order/shipment data.

If no phone number exists in the account:

- Collect it before payment/order creation.

The exact UI placement belongs to DSS.

---

## 4.5 Customer Cancellation OTP

Customer cancellation requires additional authentication/verification.

The finalized direction is:

- Customer cancellation triggers an OTP to the customer's email.
- Cancellation proceeds only after successful verification.

The exact OTP lifecycle belongs to the authentication/payment implementation layer.

---

## 4.6 Account Deletion

Customer account deletion is supported.

Deletion requires:

- Confirmation
- Reason for deletion

Historical orders and legally/operationally required records must not be destroyed merely because the account is deleted.

The account's active access may be disabled/anonymized according to the final data-retention policy.

---

# Chapter 5 — Product & Catalog Model

## 5.1 Parent Product

A Parent Product represents the common commercial/design identity of a saree.

Parent-level information includes:

- Product name
- Product description where supplied
- Weave
- Fabric
- Occasion(s)
- Pattern
- Saree dimensions
- Blouse dimensions when applicable
- Wash care
- Zari specification
- Certification information where finalized
- Parent-level merchandising attributes
- Collections/taxonomy relationships

---

## 5.2 Product Variants

A parent product can have multiple purchasable variants.

Variants are particularly important for color.

A variant can have:

- Variant ID
- SKU
- Color
- Representative swatch color
- Pallu color
- Variant images
- Stock
- Barcode
- Variant-specific package information where applicable

One parent product's variants share the common product foundations such as:

- Weave
- Fabric
- Occasion

Color-related information is variant-specific.

---

## 5.3 Product Information

Finalized core product information includes:

- Weave
- Fabric
- Saree dimension
- Blouse dimension
- Color
- Pallu color
- Zari specification
- Wash care
- Occasion
- Pattern
- Product description
- Certification information where applicable

Loom construction type is removed.

Loom tag ID is removed.

Origin is removed.

---

## 5.4 Saree Dimension

Default standard dimension:

**5.5 m × 1.14 m**

The admin UI uses:

- Length field
- `×`
- Width field

Default values:

- Length = 5.5
- Width = 1.14

The admin can change the value if the actual product requires it.

The dimension is common to the parent product unless a later decision makes it variant-specific.

---

## 5.5 Blouse Dimension

Blouse dimensions are parent-product information.

If:

> Blouse Included = Yes

then blouse dimensions are mandatory.

The dimensions use:

- Length
- Width

with appropriate units defined in DSS.

---

## 5.6 Wash Care

Wash care is a predefined selection.

The system should not depend on arbitrary free-text values for the primary wash-care field.

Examples discussed include:

- Gentle hand wash
- Iron
- Dry clean

The exact V1 option list is to be finalized as a controlled catalog enumeration during DSS.

Only one primary wash-care value is required for V1.

---

## 5.7 Zari

Zari is included in V1.

Zari information is retained as product/catalog information.

The system should not create a separate oversized Zari management subsystem.

---

## 5.8 Border Styling

Border styling is a predefined selectable catalog value.

V1:

- One selected border-styling value per product.
- No arbitrary technical loom-construction model.

---

## 5.9 Pattern

Pattern is a catalog value.

V1 supports:

- Existing predefined pattern list.
- Admin ability to create new pattern values.
- A product can have only one primary pattern.

Pattern values should not be hard deleted when historical products depend on them.

---

## 5.10 Weave

Weave is a single catalog value per product.

---

## 5.11 Fabric

Fabric is a single catalog value per product.

---

## 5.12 Occasion

Occasion supports multiple values per product.

Examples can include:

- Wedding
- Festive
- Party
- Traditional
- Daily/other approved catalog values

The exact controlled values are defined through catalog administration.

---

## 5.13 Product Description

Product description is optional at product creation.

If a description is not supplied:

- The description section should not be displayed to the customer.

No mandatory AI-generated description engine is required.

The system may support derived descriptions in the future, but V1 does not depend on AI.

---

## 5.14 Certification

Central Silk Board certification is retained as a V1 product/catalog concept as decided during frontend review.

The exact certification reference/data structure must remain simple.

Do not create a large certification management engine.

---

## 5.15 HSN

HSN is retained and stored.

V1 provides:

- Selectable HSN value.
- Basic HSN management.

A sophisticated HSN search engine is a future capability.

The future enhancement must be documented but not implemented as V1 scope.

---

## 5.16 GST

GST rate is stored.

The exact controlled rate list and validation are defined in DSS.

---

## 5.17 Cost Price

Internal cost price is stored for each applicable product/variant.

Rules:

- Cost price is internal.
- Never expose it to customers.
- Never expose it through customer-facing APIs.
- It may be used for inventory valuation and analytics.
- Historical commercial reporting may use it where required.

---

## 5.18 Selling Price and MRP

Admin pricing order:

1. MRP
2. Selling price
3. Automatically calculated discount

Internal cost price remains separate.

The only frontend ordering change finalized from the original page is:

> MRP comes before Selling Price.

---

## 5.19 Barcode

Barcode is generated from the SKU relationship.

V1 supports the agreed barcode approach without requiring the admin to manually invent arbitrary barcode identifiers.

The barcode must not be freely changed once generated unless a later controlled administrative correction rule is explicitly introduced.

---

## 5.20 Product Media

Variant media:

- Minimum one image.
- Maximum three images.
- Display order is maintained.
- One primary indicator is maintained.

No mandatory 10-second 4K product video.

No unnecessary image-roll metadata.

---

# Chapter 6 — Product Creation & Publication

## 6.1 Product Creation

Admin creates a parent product first.

The product creation workflow collects common parent information.

Variant creation is a distinct but connected step.

The current frontend page was missing variant creation; the backend must explicitly support variant creation even if the frontend is redesigned.

---

## 6.2 SKU Generation

SKU generation is part of the product/variant creation workflow.

SKU is critical on the admin side.

SKU must be unique.

SKU is used by:

- Inventory
- Manual orders
- Barcode generation
- Admin search
- Operational identification

---

## 6.3 Variant Creation

A product may have multiple color variants.

Each variant must have:

- Unique SKU
- Color
- Representative swatch
- Pallu color
- Media
- Stock
- Barcode
- Required variant-level operational information

---

## 6.4 Color Management

Color management uses predefined categorical color values.

Rules:

- Duplicate categorical color values should not exist.
- Existing color values can be selected.
- Admin can create new values.
- A basic duplicate-name check is required.
- No AI color detection.
- No color-similarity engine.
- No external color API is required.

---

## 6.5 Representative Swatch

The representative color swatch should be generated/assisted from the color name using a simple deterministic mechanism where practical.

CSS-based color mapping is preferred over introducing a separate color API.

The admin can use the resulting swatch representation.

The system should not require a cognitively heavy color-management UI.

---

## 6.6 Product Drafting

Products can be:

- Draft/Unpublished
- Published

There is no archive state in V1.

---

## 6.7 Publishing

A product becomes customer-visible only when:

- Required product information is valid.
- At least one purchasable variant exists.
- Variant requirements are satisfied.
- Required images exist.
- Required pricing information exists.
- Required stock/availability information is valid.
- Other publication validations pass.

If a product is incomplete:

- It remains draft/unpublished.
- It must not be exposed as purchasable.

---

## 6.8 Unpublishing

Admin can unpublish a product.

Unpublishing:

- Removes it from normal customer catalog discovery.
- Does not delete historical orders.
- Does not delete inventory history.
- Does not delete the product record.

---

# Chapter 7 — Catalog Discovery, Search & Merchandising

## 7.1 Search Philosophy

Customer search should maximize meaningful searchability using traditional programming rather than AI.

The system should understand more than exact character matching.

Search should use available structured product/catalog information and customer-friendly textual information.

---

## 7.2 Search Inputs

Search should consider relevant customer-meaningful catalog information, such as:

- Product name
- Product description when available
- Weave
- Fabric
- Occasion
- Pattern
- Color
- Pallu color
- Zari-related searchable information
- Collection/category terms
- Other approved catalog values

SKU is not a customer search requirement.

---

## 7.3 Natural Customer Phrases Without AI

V1 should support useful customer phrasing using traditional programming techniques.

Examples of capabilities:

- Synonyms
- Alias terms
- Normalized forms
- Spelling correction/handling
- Token normalization
- Phrase mapping
- Controlled catalog vocabulary
- Partial matching where useful

This does not require an AI/LLM search engine.

---

## 7.4 Autocomplete

Autocomplete is required.

Autocomplete can use:

- Product names
- Catalog values
- Popular/relevant query terms
- Collections
- Categories
- Search history signals where available and useful

Autocomplete should not become a separate AI system.

---

## 7.5 Search Suggestions

Search suggestions are required.

They should help customers discover:

- Related terms
- Corrected spellings
- Synonyms
- Relevant catalog categories/attributes

---

## 7.6 No-Result Search

If no direct results are found:

- Show a clear no-result state.
- Offer relevant browse/filter paths.
- Allow the customer to continue browsing.
- Avoid a dead-end screen.

Search plus filters remains the primary discovery model.

---

## 7.7 Filters

Filters should be based on real catalog values.

Relevant filters can include:

- Weave
- Fabric
- Occasion
- Color
- Pattern
- Price range
- Collection/category
- Availability
- New Arrival
- Bestseller
- Featured
- Discount/offer where appropriate

The exact filter set is defined in DSS from the actual catalog values.

---

## 7.8 Primary Catalog Page Merchandising

The main all-products catalog page should feel intentionally mixed.

The first 6–12 products should not repeatedly show:

- Same visual type
- Same fabric
- Same weave
- Same occasion
- Same price band

The system should intentionally introduce variety.

Price should also be accessible:

- Avoid an opening sequence that is entirely high-priced.
- Avoid an opening sequence that is entirely low-priced.
- Include attractive discounted products where appropriate.
- Include newer products.
- Include bestsellers.
- Maintain catalog variety.

This is the functional requirement behind the "psychologically enchanting" browsing experience.

---

## 7.9 Merchandising Priority

For equal suitability, the ordering priority is:

1. Featured/boost
2. Admin priority
3. New Arrival
4. Bestseller
5. Discount attractiveness
6. Price accessibility
7. Product variety/diversity

The final algorithm must mix these factors rather than sorting the catalog by a single metric.

---

## 7.10 Featured

V1 uses a simple:

> Featured = Yes/No

concept.

Featured products receive merchandising boost.

---

## 7.11 Admin Boost

Admin can assign the agreed boost/priority behavior.

The system uses the boost as an input into the merchandising ordering logic.

It should not become a complex manual merchandising rule engine.

---

## 7.12 New Arrival

New Arrival is automatically active for:

> 30 days from first publication

Admin can manually override/add the tag.

The system must retain the relevant publication timestamp to calculate the automatic period.

---

## 7.13 Bestseller

Bestseller is automatically determined using the finalized rolling sales-based rule.

The exact rolling window and thresholds are defined in DSS/configuration according to the locked recommendation.

Admin can also manually control the bestseller designation where the finalized workflow allows.

---

## 7.14 Controlled Rotation

The primary catalog merchandising system uses controlled rotation rather than changing product order on every page refresh.

Rotation occurs on a defined timeline.

The finalized direction is approximately every two days.

When rotation occurs:

- Previous leading products move down.
- New products move up.
- The ordering changes deliberately rather than randomly every refresh.

The exact scheduling mechanism belongs to DSS/implementation.

---

## 7.15 Customer Recommendations

Product-page "You May Also Like" is required.

V1 uses a rule-based recommendation approach.

Possible matching signals include:

- Same weave
- Same fabric
- Similar occasion
- Similar color
- Similar price range
- Similar tags/pattern

No AI recommendation engine is required.

No hybrid ML recommendation engine is required.

The recommendation output should avoid repeatedly showing the exact same product/variant being viewed.

---

## 7.16 Recently Viewed

Recently Viewed is required only as:

> **Local/device-level V1 functionality**

No server-side persistent recently-viewed database is required.

This is deliberately kept local to avoid unnecessary database usage.

---

# Chapter 8 — Wishlist

## 8.1 Authentication

Wishlist requires customer login.

Guests cannot add items to wishlist.

---

## 8.2 Variant-Level Wishlist

Wishlist is associated with the selected purchasable variant.

However, the current finalized simplification is to treat wishlist as a product-level customer concept where appropriate without creating unnecessary duplicated variant records.

The exact DSS representation must preserve the customer's selected variant where the business behavior requires it.

---

## 8.3 Wishlist Persistence

Persistent guest wishlist is not required in V1.

Only authenticated customer wishlist data is stored.

---

## 8.4 Wishlist Actions

Customer can:

- Add
- Remove
- View wishlist

Wishlist must reflect current product availability.

An unpublished product should not be newly discoverable but historical wishlist references should be handled gracefully.

---

# Chapter 9 — Cart

## 9.1 Authentication

Adding to cart requires login.

This is a finalized V1 change.

A guest can browse but cannot add products to cart.

---

## 9.2 Cart Item Identity

Cart items reference a purchasable variant/SKU.

The cart must not rely on product name text to identify the item.

---

## 9.3 Cart Quantity

Quantity must not exceed current available purchasable stock.

If stock is 2:

- Maximum cart quantity = 2.
- Increment control should disable at 2.
- Backend must reject a request attempting quantity 3.

---

## 9.4 Cart Selection

V1 supports selecting which cart items will be purchased.

This allows the customer to:

- Keep items in cart.
- Select only some items.
- Checkout selected items.
- Leave unselected items in the cart.

---

## 9.5 Unselected Items

Unselected cart items do not interfere with the current purchase.

If an unselected item becomes unavailable:

- It remains in the cart.
- It is marked out of stock.
- It does not block checkout of selected items.

---

## 9.6 Selected Items

Selected items must pass all checkout validations.

If selected stock is insufficient:

- Checkout cannot proceed.
- The customer is informed.
- The selected cart quantity must be corrected.

---

## 9.7 Cart Price

Cart displays current price information.

At checkout, backend revalidates the price again.

---

## 9.8 Cart Persistence

Cart selection state should reset appropriately after successful checkout.

Items successfully purchased are removed.

Unselected items remain.

---

# Chapter 10 — Inventory

## 10.1 Inventory Model

Inventory is variant/SKU-aware.

Stock is managed against the purchasable variant/SKU.

---

## 10.2 Stock Quantities

V1 maintains:

- Physical stock
- Reserved stock
- Available-to-sell stock

Conceptually:

```text
Available to Sell =
Physical Stock - Reserved Stock
```

The exact treatment of adjustments and finalized quantities is defined in DSS.

---

## 10.3 Stock Reservation

Stock reservation is temporary.

It is not a permanent stock deduction.

Customer checkout reservation begins:

1. Customer selects cart items.
2. Customer selects/validates delivery address.
3. Before payment method selection/payment attempt, the system creates the temporary reservation.

This reservation protects stock during the active checkout session.

---

## 10.4 Reservation Timeout

Customer checkout reservation timeout:

> **10–20 minutes; V1 operational target is 15 minutes.**

The exact implementation should use the finalized 15-minute target unless a payment integration decision later requires a different timeout.

---

## 10.5 Checkout Session Timeout

The checkout session itself can remain active for up to:

> **30 minutes**

At checkout timeout:

- Revalidate everything.
- Release expired reservation if applicable.
- Require the customer to repair/restart the affected checkout state where necessary.

---

## 10.6 Successful Purchase

After successful payment/order confirmation:

- Temporary reservation becomes committed stock consumption.
- Reservation is released as a temporary hold.
- Physical/committed inventory is updated according to the finalized stock model.

The exact atomic database transaction belongs in DSS.

---

## 10.7 Failed Checkout

If validation fails before payment:

- No payment attempt should be started.
- Reservation should not be created if the failure occurs before the reservation checkpoint.
- If a reservation already exists and checkout subsequently fails, release it according to the reservation lifecycle.

---

## 10.8 Stock Adjustment

Admin can adjust stock.

Direct editing is allowed only as an administrative correction.

A direct stock correction requires:

- Reason
- Quantity before
- Quantity after
- Admin identity
- Timestamp

All stock adjustments must be auditable.

---

## 10.9 Stock Adjustment Delta

Normal stock adjustment should be represented as a delta:

- Increase
- Decrease

The system must retain an audit record.

---

## 10.10 Low Stock

Low stock threshold is fixed:

> **Available stock ≤ 3 per product/variant**

No separate configurable reorder-point system is required.

---

## 10.11 Out of Stock

V1 uses:

> **Out of Stock**

No separate "Unavailable" state is required for normal inventory display.

A product that should not be customer-visible can instead be unpublished.

---

## 10.12 Manual Orders and Inventory

Manual admin orders also reserve stock.

Manual order reservation duration:

> **35 minutes**

The SKU entered by the admin identifies the product/variant.

When the SKU is entered:

- Product data is fetched.
- Availability is checked.
- Reservation can begin according to the manual-order workflow.
- The same inventory authority is used as customer checkout.

---

## 10.13 Inventory Return-to-Stock

When an item is legitimately returned to inventory:

- Admin explicitly records a return-to-stock adjustment.
- Inventory audit trail is maintained.

---

## 10.14 Inventory Valuation

Inventory valuation is required.

Internal cost price can be used to calculate inventory valuation.

Customer-facing systems must never expose internal cost price.

---

## 10.15 Inventory Matrix

Both Catalog and Inventory pages remain in V1.

The Inventory page is simplified significantly.

The Inventory Matrix should be:

- Variant-aware
- SKU-aware
- Stock-focused
- Operational

Remove:

- Bin location
- Warehouse bin
- Vault location
- Loom bench
- Single-piece luxury terminology
- Reorder point

---

## 10.16 Inventory CSV Export

CSV export is retained for V1.

Bulk import is explicitly removed.

---

# Chapter 11 — Checkout

## 11.1 Checkout Entry

Checkout begins from selected cart items.

Only selected cart items are part of the active checkout.

---

## 11.2 Checkout Stages

Finalized V1 checkout stages:

### Stage 1 — Delivery Address

### Stage 2 — Review

### Stage 3 — Payment Method

### Stage 4 — Confirmation

The customer must not modify order content during the Review stage.

To change items:

> Customer must return to Cart.

---

## 11.3 Delivery Address

The customer can:

- Select an existing saved address.
- Add a new address.

Address editing in the checkout itself is intentionally minimized.

The selected address becomes part of the active checkout and later order snapshot.

---

## 11.4 Address Snapshot

Once an order is created, later customer address-book changes must not alter the historical order.

The order stores the selected/confirmed delivery information required for the transaction.

---

## 11.5 First Address Default

The customer's first address is treated as the default address.

No elaborate address-priority management system is required.

Addresses can still be selected from the address list.

---

## 11.6 PIN Validation

PIN code must be validated.

If invalid:

- Immediately show an error.
- Indicate that the PIN is invalid/nonexistent.
- Do not proceed as if the destination is serviceable.

---

## 11.7 Serviceability

Serviceability must be checked using the Shiprocket integration.

Inputs include:

- Fixed pickup PIN
- Delivery PIN
- Shipment weight
- Dimensions
- Prepaid mode
- Other required shipment information

If serviceability fails:

- Customer cannot proceed to payment.
- The system clearly explains that delivery is unavailable for the entered PIN.

---

## 11.8 Shipping Cost

The shipping fee is calculated before payment.

The finalized customer-facing model uses the applicable Shiprocket shipping fee.

A 24% shipping buffer is locked for V1 according to the previously finalized commercial calculation.

The exact application formula must be specified in DSS and implemented consistently.

---

## 11.9 Review Stage

Review displays:

- Selected products/variants
- Quantities
- Product prices
- Discount
- Shipping fee
- Taxes as applicable
- Final payable amount
- Delivery address
- Customer phone for shipping/order
- Coupon if applied

The Review stage is read-only.

No item modification occurs here.

---

## 11.10 Price Revalidation

Before the internal order is created:

- Product must still be published.
- Selected variant must still be purchasable.
- Price must be revalidated.
- Stock must be revalidated.
- Coupon must be revalidated.
- Address must remain valid.
- Shipping/serviceability must be revalidated as necessary.

---

## 11.11 Payment Gate

If any critical validation fails before payment:

> **No payment attempt begins.**

This is mandatory.

---

## 11.12 Payment

Razorpay is the intended payment gateway.

The exact Razorpay architecture is intentionally deferred until payment integration work.

However:

- Payment state is backend-owned.
- Gateway confirmation is authoritative for payment success/failure.
- Frontend UI is not authoritative for payment completion.

---

## 11.13 Payment Success

After successful gateway confirmation:

- Backend reconciles payment.
- Order is completed/confirmed.
- Reserved inventory is committed.
- Confirmation data becomes available.

---

## 11.14 Payment Failure

If payment fails:

- Order must not be treated as paid.
- Customer remains able to retry where the checkout state is valid.
- Reservation behavior follows the defined reservation timeout.

---

## 11.15 Browser Closure After Payment

If the browser closes after payment:

The backend must still be capable of determining:

- Payment outcome
- Order outcome
- Inventory outcome

The customer should be able to return to the order/checkout state and see the correct result.

---

## 11.16 Payment Reconciliation

If payment succeeds but internal order completion fails:

1. Backend must detect/reconcile the inconsistency.
2. Backend should repair the order state automatically where possible.
3. If automatic repair cannot complete:
   - Raise an admin alert.
   - Preserve the payment record.
   - Provide a manual reconciliation path.
4. Do not silently lose a successful payment.

---

## 11.17 Duplicate Payment/Order Prevention

Double-clicking Pay must not create duplicate orders.

The backend must use idempotency/transaction controls so that:

- One intended checkout produces at most one confirmed order.
- Repeated payment callbacks do not create duplicate orders.
- Repeated client requests do not create duplicate commercial transactions.

---

# Chapter 12 — Order Creation & Order Model

## 12.1 Order Creation Authority

The backend is the only authority capable of confirming the commercial order.

An order becomes confirmed only after:

- Required validations pass.
- Payment is confirmed according to the payment integration.
- Inventory is successfully committed/reserved according to the transaction flow.

---

## 12.2 Order Number

Each order has:

- Internal unique identifier.
- Human-readable order number.

The human-readable order number is used by customers/admins.

Internal UUID/identifier is never exposed as the primary customer order reference.

---

## 12.3 Order Item

An order contains one or more order items.

Each order item references the purchased variant/SKU.

Historical item information is retained so that later product changes do not rewrite the order.

---

## 12.4 Order One-Parcel Rule

V1:

> One order must always be one parcel/shipment.

Admin cannot split the order into multiple shipments in V1.

---

## 12.5 Order State

Customer-facing order status is:

1. Placed
2. Processing
3. Shipped
4. Out for Delivery
5. Delivered

Additional exception/cancellation states may exist internally where necessary.

Do not expose every Shiprocket internal status as a customer-facing order status.

---

## 12.6 Processing

The order does not automatically become "processing" merely because the payment succeeded if the finalized admin workflow requires an explicit action.

The finalized direction is:

- New order appears to admin.
- Admin clicks **Start Processing**.
- Admin physically prepares/packs the order.

---

## 12.7 Packed

"Packed" is not a separate customer-visible order status.

Packing is an internal/admin activity inside Processing.

---

## 12.8 Shipped

The business order becomes Shipped only when the parcel is actually handed over/picked up by the courier according to the Shiprocket tracking event.

Do not mark an order as shipped merely because:

- AWB exists
- Label was generated
- Pickup was requested
- Manifest was generated

The actual pickup/handover signal is required.

---

## 12.9 Order Cancellation — Customer

Customer cancellation is allowed before admin processing begins.

Once the admin starts processing:

> Customer cancellation is no longer allowed.

Customer cancellation requires email OTP verification.

---

## 12.10 Order Cancellation — Admin

Admin can cancel an order according to the allowed lifecycle.

Admin cancellation requires:

- Predefined cancellation reason
- Optional additional text

Admin cancellation is not permitted after courier pickup/handover where the logistics provider's state no longer allows normal cancellation.

---

## 12.11 Cancellation Reason

V1 provides predefined reasons plus optional text.

Reason examples can include:

- Customer requested cancellation
- Product unavailable
- Payment issue
- Duplicate order
- Address/serviceability issue
- Administrative error
- Other

Exact final values are defined in DSS.

---

## 12.12 Payment Refund on Cancellation

Refunds are sent to the original payment method through Razorpay where supported.

The exact Razorpay refund implementation is deferred to payment integration.

---

# Chapter 13 — Manual Admin Orders

## 13.1 Purpose

Admin can create an order on behalf of a customer.

A customer login account is not required for the manual-order customer.

---

## 13.2 Customer Identification

Admin can:

- Select an existing customer.
- Enter customer phone number.
- Use phone number to identify an existing customer where matched.
- Enter a manual customer where no account exists.

If the phone number belongs to an existing account:

- Existing customer information can be associated.
- The order should appear in that customer's account order history when the relationship is established.

---

## 13.3 Manual Order Product Entry

Admin primarily enters:

> SKU

The system then fetches:

- Product
- Variant
- Price
- Relevant product information
- Stock
- SKU

Customer name/product name can also be used as search alternatives where useful.

---

## 13.4 Manual Order Stock Reservation

When the SKU is added:

- Stock availability is checked.
- Temporary reservation is created.
- Reservation duration is **35 minutes**.

---

## 13.5 Manual Order Delivery

Admin can enter a delivery address.

A simple:

> At Shop

checkbox is supported for appropriate store/shop collection orders.

---

## 13.6 Manual Payment

Manual order payment details can support applicable payment methods.

For UPI:

- Transaction/reference ID is optional.

The exact payment-method matrix is defined in DSS.

---

## 13.7 Manual Order Completion

Manual orders follow the same fundamental inventory, order, historical, refund, and audit rules as storefront orders unless explicitly identified as an internal operational exception.

---

# Chapter 14 — Shipment & Shiprocket Integration

## 14.1 Integration Responsibility

Shiprocket owns courier/logistics capabilities.

SAREEVANTA owns:

- Customer order
- Product data
- Inventory
- Payment relationship
- Business order state
- Customer-facing presentation
- Internal operational records

Shiprocket owns the logistics-side state it reports.

---

## 14.2 Shiprocket Entity Distinction

Do not conflate:

- SAREEVANTA Order
- Shiprocket Order
- Shipment
- Courier
- AWB

The relationship is:

```text
SAREEVANTA Order
       ↓
Shiprocket Order
       ↓
Shipment
       ↓
Courier
       ↓
AWB
```

---

## 14.3 Pickup Location

V1 has exactly one fixed pickup location.

No multi-warehouse/multi-pickup-location engine is required.

---

## 14.4 Shipping Flow

Functional flow:

```text
Confirmed Order
      ↓
Processing
      ↓
Admin packs saree
      ↓
Create Shiprocket shipment
      ↓
Courier/serviceability handling
      ↓
AWB assignment
      ↓
Label generation
      ↓
Pickup request
      ↓
Manifest where Shiprocket requires/supports it
      ↓
Courier pickup
      ↓
Picked Up
      ↓
In Transit
      ↓
Out for Delivery
      ↓
Delivered
```

---

## 14.5 Package Information

Package data includes:

- Weight
- Length
- Width
- Height

Product-level package values may provide defaults.

Final packed parcel values may be confirmed/overridden as operationally required.

---

## 14.6 Courier Selection

Customer does not select courier.

Selection priority:

1. Serviceability
2. Cost

Prefer Shiprocket's own recommendation/selection capabilities.

Do not create a custom courier-performance scoring algorithm in V1.

---

## 14.7 Shipping Rate

Shipping rate should be obtained through Shiprocket serviceability/rate functionality using:

- Pickup PIN
- Delivery PIN
- Weight
- Dimensions
- Prepaid mode
- Relevant shipment/order value

The customer-facing shipping fee uses the applicable Shiprocket fee under the locked V1 pricing rule.

---

## 14.8 Shipping Buffer

V1 shipping buffer:

> **24%**

The buffer is locked.

The exact formula and whether it is applied to a base rate or a specific calculated component must be represented explicitly in DSS so that implementation cannot interpret it differently.

---

## 14.9 AWB

AWB is the shipment's waybill/tracking identifier.

AWB does not mean air shipping.

AWB is associated with the shipment.

AWB generation alone does not mean the parcel has been physically picked up.

---

## 14.10 Label

Shiprocket can generate the shipping label.

The business/admin:

- Packs the saree.
- Receives/generates the label.
- Attaches the label to the parcel.

Shiprocket does not physically pack the saree.

---

## 14.11 Pickup

Pickup request is not the same as physical pickup.

The business order becomes Shipped only after actual courier pickup/handover is confirmed through the supported logistics event.

---

## 14.12 Manifest

Shiprocket provides manifest capabilities.

However, the exact V1 operational use of manifest remains a documented integration-research item.

Do not build an independent SAREEVANTA manifest system.

Before final implementation, verify:

- Whether manifest is required for the chosen flow.
- When it is generated.
- Whether it is generated manually or through API.
- What it means operationally.
- Which Shiprocket events correspond to it.

---

## 14.13 Shipment Status Storage

The backend should not store every Shiprocket status merely because Shiprocket exposes many statuses.

It should store:

- Current business-relevant shipment state
- Required Shiprocket raw/reference status information
- Tracking history required for customer/admin visibility
- External identifiers
- Event timestamps

The exact status mapping is defined in DSS.

---

## 14.14 Tracking

Tracking supports:

- Pulling tracking data when required.
- Receiving tracking webhooks.

The customer sees a simplified timeline.

The customer-facing timeline should be based on actual Shiprocket data.

---

## 14.15 Webhooks

Shiprocket tracking webhooks are required.

Webhook handling must be:

- Authenticated/verified according to provider mechanism.
- Idempotent.
- Safe to retry.
- Logged at the integration/audit level.
- Mapped to the correct shipment.
- Mapped to the correct business order.
- Resistant to duplicate business actions.

---

## 14.16 Idempotency

If the same Shiprocket event is received twice:

> It must not trigger duplicate business actions.

Examples:

- Do not decrement stock twice.
- Do not create two shipment records.
- Do not send duplicate refund operations.
- Do not create duplicate order-state transitions.
- Do not duplicate tracking history entries where the same event identity is known.

---

## 14.17 Tracking Failure

If a webhook fails:

- Preserve the shipment's last known valid state.
- Record the integration failure.
- Allow retry/reconciliation.
- Do not silently corrupt the order state.

---

## 14.18 Shiprocket API Credentials

Shiprocket credentials/tokens are sensitive.

They must:

- Never be exposed to the browser.
- Never be hardcoded into frontend code.
- Never be committed to public repositories.
- Be stored in secure server-side configuration.

---

## 14.19 Shiprocket Cancellation

Shiprocket cancellation capability should be used according to its documented cancellation rules.

Order cancellation and shipment/AWB cancellation are distinct operations.

The system must not assume that creating an AWB automatically means cancellation is impossible.

---

## 14.20 RTO

RTO remains relevant.

RTO is:

> Return To Origin

It is a logistics outcome, not a normal customer-initiated product return.

---

## 14.21 NDR

NDR remains relevant.

The system should support the necessary Shiprocket NDR information/actions where required.

Do not build a separate NDR logistics platform.

---

# Chapter 15 — Returns, Claims, Refunds & Replacements

## 15.1 Claim Model

V1 supports customer return/claim functionality according to the finalized policy.

Claims are associated with:

- Original order
- Specific order item
- Customer
- Claim reason
- Evidence
- Verification
- Admin decision
- Refund/replacement outcome

---

## 15.2 Claim Eligibility

Claim eligibility is based on the finalized customer policy.

Customer claims must respect:

> **48 hours from delivery**

as the V1 claim window.

---

## 15.3 Claim Types

V1 supports at least the following meaningful claim categories:

- Wrong product
- Wrong color
- Damaged product
- Missing item
- Product significantly different from description
- Other approved reason

The final controlled list is defined in DSS.

---

## 15.4 Evidence

Photos are mandatory for:

- Wrong product/color claims
- Damaged product claims

Video is optional.

V1 evidence limits:

- Minimum 1 photo
- Maximum 3 photos
- Optional 1 video

---

## 15.5 Claim Review

Admin can view:

- Customer reason
- Claim type
- Order
- Product/SKU
- Submitted photos
- Optional video
- Other submitted evidence

---

## 15.6 Evidence-Based Approval

For V1:

> Evidence-based approval can occur before physical verification where appropriate.

However:

> Refund or replacement completion occurs only after whatever physical verification is required for that claim type has been completed and approved by the admin.

---

## 15.7 Verification

Use:

> Verification Pending

rather than "QC Inspection Pending".

Verification requirements depend on claim type.

---

## 15.8 Admin Decision

Admin can:

- Approve
- Reject
- Request/perform required verification
- Continue refund flow
- Continue replacement flow

Rejection requires a reason.

---

## 15.9 Customer Refusal / Failed Return

If the customer refuses a return or the return process fails:

- Record the underlying reason.
- Use a clear business-facing status such as Return Failed / Claim Closed.
- Preserve the fact that the customer rejected/refused where applicable.

---

## 15.10 Refund

Refunds are returned to the original payment method through the payment gateway where supported.

The exact Razorpay refund mechanism is deferred to payment integration.

---

## 15.11 Processing Fee

The business may retain the non-refundable processing fee according to the finalized customer-facing policy.

The refund calculation must clearly separate:

- Refundable customer amount
- Non-refundable processing fee

The exact amount/percentage is defined in the customer policy and DSS.

---

## 15.12 Business Fault

When the issue is caused by the business:

- Return is allowed.
- Replacement/refund exception handling is supported.
- Shipping/refund responsibility follows the finalized policy.

For business-fault returns, the system must not treat the customer as responsible merely because the logistics operation incurred a cost.

---

## 15.13 Replacement

Replacement uses:

- Same original order relationship
- Separate replacement fulfillment record

Do not create a completely unrelated customer order.

---

## 15.14 Replacement Inventory

Replacement inventory must be reserved/allocated according to the same inventory authority.

If replacement inventory is unavailable:

- Admin must follow the approved fallback path.
- Do not silently oversell.

---

## 15.15 Refund Pending

If a claim is approved but refund completion is blocked:

- Claim remains **Refund Pending**.
- Admin is alerted.
- Payment/reconciliation records remain intact.

---

## 15.16 Partial Refund

No separate partial-refund tool is required in V1.

---

# Chapter 16 — Customer Reviews

## 16.1 Eligibility

Only a customer who purchased the relevant item through the website can review it.

The order must be delivered before review eligibility is activated.

---

## 16.2 Review Level

Reviews are associated with the parent product/design level for customer-facing aggregation.

The underlying purchase relationship still identifies the actual purchased variant/order item.

---

## 16.3 Review Data

A review contains:

- Customer name
- Star rating
- Review headline
- Written review
- Optional photos

Customer email and phone are not publicly displayed.

---

## 16.4 Rating

Rating scale:

> 1 to 5 stars

---

## 16.5 One Review

One review per purchased item/variant relationship is allowed according to the finalized rule.

The backend must prevent duplicate review submissions for the same eligible purchase.

---

## 16.6 Review Photos

V1:

- Photos optional.
- Maximum 2 photos.

No review video.

---

## 16.7 Review Editing

Controlled editing is allowed.

Editing should preserve moderation integrity.

The exact edit/re-moderation behavior is defined in DSS.

---

## 16.8 Review Deletion

Customers can delete their own review according to the finalized policy.

The backend should preserve sufficient internal history where required for audit/moderation integrity.

---

## 16.9 Review Moderation

Reviews can be:

- Pending
- Approved
- Hidden/Rejected
- Moderated as applicable

Approved reviews can become visible on the product page.

---

## 16.10 Prohibited Content Checks

Basic automated checks should be applied for:

- Abusive words
- Abusive patterns
- Obvious spam
- Irrelevant prohibited patterns where detectable

This is traditional/basic filtering.

No AI moderation engine is required.

---

## 16.11 Moderation Unit

The review and its attached photos share one moderation decision.

---

## 16.12 Admin Moderation

Admin is the final moderation authority.

Admin can hide/remove a review according to permissions.

Moderated reviews should preferably be represented as hidden/moderated rather than destructively deleted.

---

## 16.13 Review Notifications

No separate V1 review notification system is required.

---

# Chapter 17 — Customer Management

## 17.1 Customer Page

A dedicated customer-management page exists.

It focuses on:

- Customer identity
- Contact information
- Orders
- Spend/order metrics
- Location
- Relevant derived occasion information
- Customer activity represented primarily through order history

---

## 17.2 Search

Customer search is a single unified search.

Whatever the admin types can be matched against appropriate customer identifiers, including:

- Name
- Email
- Phone

The interface should not require the admin to choose a separate search primitive first.

---

## 17.3 Customer Data Visibility

Admin can view necessary customer information for operational purposes.

Wishlist is not required on the admin customer profile.

---

## 17.4 Customer Credential Security

Admin must never see:

- Customer password
- Authentication secret
- OTP secret

Admin cannot arbitrarily modify customer password.

Customer authentication remains an authentication-system concern.

---

## 17.5 Customer Profile Editing

Admin should not be given unrestricted ability to alter fundamental authentication identity information merely because it is convenient.

Customer-owned identity fields remain controlled by the customer/authentication system.

Administrative corrections must follow the defined permission/audit rules.

---

## 17.6 Customer Location

Location information can be derived from the customer's address information.

Do not create unnecessary location-intelligence systems.

---

## 17.7 Last Order

Use:

> Last Order

as the meaningful activity indicator.

---

## 17.8 Export

Customer CSV export is required.

---

# Chapter 18 — Collections & Taxonomy

## 18.1 Purpose

Collections and taxonomy are both retained because they solve different problems.

### Taxonomy

Structural classification/navigation.

### Collections

Merchandising/curation.

---

## 18.2 Collections

V1 supports:

- Rule-based collections
- Curated collections

A product can belong to multiple collections.

---

## 18.3 Curated Collections

Admin can curate products in a collection.

No scheduled collection state is required.

---

## 18.4 Rule-Based Collections

Rule-based collections derive membership from catalog properties.

Examples:

- Occasion
- Fabric
- Weave
- Price range
- Pattern
- Other structured catalog values

The exact rule builder should remain simple.

---

## 18.5 Catalog Values

Admins can create new catalog values where appropriate.

Values can be deactivated.

Hard deletion is avoided when historical products use the value.

---

## 18.6 Taxonomy Technical Descriptions

No technical taxonomy description fields are required in V1.

---

## 18.7 Advanced Taxonomy

Do not build:

- Enterprise taxonomy engines
- Arbitrary hierarchical metadata systems
- AI taxonomy classification

unless the business later explicitly requires them.

---

# Chapter 19 — Discounts & Coupons

## 19.1 Page

Page name:

> Discounts & Coupons

---

## 19.2 Discount Types

V1 supports:

- Fixed amount
- Percentage

---

## 19.3 Coupon Application

A coupon can apply according to its configured eligibility rules.

The backend is responsible for validating:

- Active state
- Validity
- Customer eligibility where configured
- Minimum/maximum order conditions where configured
- Applicable products/collections where configured
- Discount calculation

---

## 19.4 Coupon Stacking

Maximum:

> **One promotional coupon per order**

A second coupon must be rejected.

---

## 19.5 Coupon Tracking

No separate coupon-tracking analytics system is required in V1.

The system must still retain the coupon actually applied to an order for historical accuracy.

---

# Chapter 20 — Homepage Content

## 20.1 Page Name

> Homepage Content

---

## 20.2 Hero Slides

Admin can create hero slides.

No artificial hard maximum count.

Only active slides appear.

Admin controls ordering.

---

## 20.3 Scheduling

No scheduled publishing engine is required.

Admin manually activates/deactivates slides.

---

## 20.4 Hero Images

Desktop image:

- Mandatory

Mobile image:

- Mandatory

---

## 20.5 Hero CTA

CTA destination references an existing SAREEVANTA entity.

Examples:

- Collection
- Category
- Product
- Other approved storefront entity

Arbitrary destination URLs are not the primary V1 model.

---

## 20.6 Hero Entity Integrity

Hero content cannot create:

- Product
- Collection
- Category
- Taxonomy value

It only references existing entities.

---

## 20.7 Badge

Badge is optional text.

---

## 20.8 Marquee

V1:

> One active marquee message at a time.

No complex marquee rotation engine.

---

## 20.9 Homepage Catalog Content

Admin can select relevant catalog entities and control ordering.

The content remains connected to actual catalog entities.

---

# Chapter 21 — Instagram Reels

## 21.1 Purpose

The Reels Manager stores external Instagram content references.

---

## 21.2 Reel Record

Required:

- Instagram Reel/Post URL

Optional:

- Caption/label
- Custom thumbnail upload

---

## 21.3 Video Storage

No video upload.

The external Instagram content is embedded/referenced.

---

## 21.4 Thumbnail

Custom thumbnail:

- Optional
- Uploaded file only

No external image URL.

---

## 21.5 Reel Ordering

Admin can:

- Move up
- Move down
- Activate
- Deactivate
- Remove

No automatic rotation algorithm.

---

## 21.6 Reel Count

No artificial hard maximum.

Only active reels appear on the homepage.

---

## 21.7 External Failure

If the external reel becomes unavailable:

- Admin can deactivate it.
- Admin can remove it.

If preview cannot be displayed, do not pretend it is available.

No Instagram crawling/monitoring system is required.

---

# Chapter 22 — Dashboard

## 22.1 Purpose

Dashboard is the first admin page.

It provides a high-level operational view.

---

## 22.2 Dashboard Information

It can show:

- Net sales
- Total orders
- Average order value
- Return/RTO rate
- Operational alerts
- Low-stock products
- Orders needing action
- Return/claim items needing action
- Useful sales/order velocity
- Useful category/weave performance

---

## 22.3 New Product Shortcut

Remove:

> New Saree SKU

from the dashboard.

Product creation belongs in Catalog.

---

## 22.4 Dashboard Authority

Dashboard metrics must be derived from actual business data.

No fabricated real-time analytics.

---

# Chapter 23 — Analytics & Reports

## 23.1 Purpose

Analytics provides aggregated business intelligence.

---

## 23.2 Metrics

Relevant V1 analytics include:

- Revenue
- AOV
- Gross/net sales as defined
- Orders
- Conversion where reliable
- Product performance
- Category performance
- Collection performance
- Weave/fabric performance
- Returns/RTO
- Other supported business metrics

---

## 23.3 Data Integrity

Analytics must be based on real transactional data.

Do not introduce metrics whose required source data does not exist.

---

# Chapter 24 — Notifications & Operational Alerts

## 24.1 V1

No separate full Notifications page.

Use a compact admin notification/alert panel.

---

## 24.2 Alerts

Useful alerts can include:

- High-value order
- Low stock
- Failed reconciliation
- Failed integration event
- Claim requiring attention
- Refund pending
- Shipment exception
- Other actionable business events

---

## 24.3 Technical vs Business Alerts

Customers/admins should not be exposed to raw technical errors.

Admin-facing alerts should be useful operational messages.

Technical logs remain separate.

---

# Chapter 25 — Staff & RBAC

## 25.1 Role Count

Exactly four V1 roles:

1. Super Admin
2. Operational Role 1
3. Operational Role 2
4. Operational Role 3

---

## 25.2 Permission Model

Permission is based on:

> Resource + Action

Examples:

```text
catalog.view
catalog.create
catalog.edit

inventory.view
inventory.adjust

orders.view
orders.cancel
orders.process

returns.view
returns.approve

reviews.view
reviews.moderate

staff.view
staff.invite
staff.update_role
staff.disable
```

The final complete permission matrix belongs in DSS.

---

## 25.3 Super Admin

Super Admin has full access.

---

## 25.4 Operational Roles

Operational roles have restricted permissions.

Each role should only be able to perform the functions required for its operational responsibility.

---

## 25.5 Staff Invitation

Existing authorized admin can provision/invite staff.

V1 begins with one provisioned Super Admin.

The architecture allows existing authorized admin users to provision additional staff later.

---

## 25.6 Privilege Escalation

A staff member cannot:

- Grant themselves higher permissions.
- Assign a role they are not authorized to assign.
- Modify their own authority to exceed their current permission.
- Disable the last Super Admin.

---

## 25.7 Staff Security

Staff uses the same core authentication direction as the customer system but with stricter administrative access controls.

Normal secure session handling is preferred.

No custom session timeout system is required in V1.

---

## 25.8 RBAC Enforcement

Permissions must be enforced:

- In frontend visibility.
- In backend authorization.

Hiding a button is not sufficient.

The backend must reject unauthorized operations.

---

# Chapter 26 — Order History & Historical Records

## 26.1 Order History

Customers retain historical orders.

Orders remain accessible after:

- Shipment
- Delivery
- Cancellation
- Return/claim
- Replacement
- Refund

subject to legal/retention rules.

---

## 26.2 Admin Historical Orders

Admins can view historical orders.

Historical core facts cannot be rewritten.

---

## 26.3 Historical Product Information

If current product data changes:

Historical order item information remains unchanged.

---

## 26.4 Historical Address

The address used for the order remains unchanged in the historical order snapshot.

Later address-book edits do not modify the order.

---

## 26.5 Historical Price

The price charged at order time remains unchanged in the historical order.

---

## 26.6 Historical Customer Relationship

The order remains associated with the customer relationship that existed when the transaction occurred.

---

# Chapter 27 — Audit Trail

## 27.1 Purpose

The audit system records important administrative and system actions.

---

## 27.2 Required Audit Events

Examples:

- Product creation
- Product publication
- Product unpublication
- Price correction
- Stock adjustment
- Manual order creation
- Order cancellation
- Refund approval
- Refund completion
- Claim approval/rejection
- Review moderation
- Coupon creation/activation
- Homepage content changes
- Staff invitation
- Role change
- Staff disablement
- Important integration reconciliation
- Other sensitive administrative actions

---

## 27.3 Stock Audit

Every stock correction must record:

- Quantity before
- Quantity after
- Reason
- Admin
- Timestamp

---

## 27.4 Audit Immutability

Audit records should not be casually editable/deletable.

They exist to explain how the system reached a business state.

---

# Chapter 28 — Payment Functional Boundary

## 28.1 V1 Payment Mode

Prepaid only.

No COD.

---

## 28.2 Razorpay

Razorpay is the intended gateway.

The exact payment implementation is intentionally deferred until payment integration work.

This BFS still requires:

- Payment status
- Gateway reference
- Successful payment handling
- Failed payment handling
- Duplicate payment prevention
- Reconciliation
- Refund relationship

---

## 28.3 Payment Authority

Payment success/failure is determined by the payment gateway and backend verification.

Frontend payment-success UI is never sufficient to mark an order paid.

---

## 28.4 Payment Reconciliation

Payment and order state must be repairable if an external gateway confirms payment but the internal order update fails.

---

# Chapter 29 — Email & Notification Behavior

## 29.1 Account Emails

V1 email communications include:

- Account created
- Email OTP authentication where applicable
- Password reset

---

## 29.2 Order Email

The preferred order communication is one combined message for:

> Payment successful + Order placed

No excessive order-email fragmentation.

---

## 29.3 Cancellation

Customer cancellation communications are required according to the finalized cancellation/refund flow.

---

## 29.4 Refund

Refund initiated and refund completed communications are required.

---

## 29.5 Shipping

No email is required for every shipping state.

Shipping status is primarily visible on the website.

If Shiprocket provides a useful near-delivery estimate and a delivery-proximity email becomes valuable, it may be considered later, but it is not a mandatory V1 notification.

---

## 29.6 Shiprocket Notifications

Where Shiprocket already provides supported logistics notifications, use Shiprocket's supported notification mechanism rather than recreating every logistics notification.

---

## 29.7 Claims

Claim-related communications are required according to the finalized claim workflow.

---

# Chapter 30 — Validation Framework

## 30.1 General Rule

Every critical business operation must validate backend state before committing.

---

## 30.2 Product Validation

Before publication:

- Required catalog values valid
- Variant exists
- SKU unique
- Images satisfy count
- Pricing valid
- Stock valid
- Required dimensions valid
- Required certification fields valid where applicable
- Product state valid

---

## 30.3 Cart Validation

Before checkout:

- Variant exists
- Variant is published/purchasable
- Quantity valid
- Stock valid
- Price valid

---

## 30.4 Checkout Validation

Before payment:

- Customer authenticated
- Address valid
- PIN valid
- Serviceability valid
- Product published
- Variant purchasable
- Stock valid
- Coupon valid
- Price valid
- Shipping valid
- Reservation valid where applicable

---

## 30.5 Order Validation

Before confirmation:

- Payment confirmed
- Inventory transaction successful
- Order is not already confirmed
- Idempotency conditions satisfied

---

## 30.6 Shipment Validation

Before Shiprocket operation:

- Order eligible
- Shipment not already created when duplication is prohibited
- Required package data exists
- Pickup location exists
- Delivery address valid
- External credentials available
- Shiprocket state supports requested operation

---

## 30.7 Return Validation

Before claim creation:

- Customer owns/is associated with order
- Order item belongs to customer order
- Order delivered
- Within 48-hour claim window
- Claim type valid
- Evidence requirements satisfied

---

## 30.8 Review Validation

Before review creation:

- Customer authenticated
- Customer purchased item
- Order delivered
- Review not already submitted for the eligible purchase
- Rating valid
- Text valid
- Photo count ≤ 2
- Content filtering passed

---

# Chapter 31 — Failure & Recovery

## 31.1 General

A failed external operation must not leave the internal system in a falsely successful state.

---

## 31.2 Payment Failure

Payment failure:

- Does not create a paid order.
- Does not commit stock permanently.
- Keeps retry possible where the checkout remains valid.

---

## 31.3 Payment Success / Internal Failure

If gateway success occurs but internal order completion fails:

- Reconciliation process is triggered.
- Payment remains recorded.
- Order is repaired if possible.
- Admin alert is generated if manual intervention is required.

---

## 31.4 Shiprocket Failure

If shipment creation fails:

- Order remains in its correct internal state.
- Shipment is not marked successfully created.
- Admin receives an operational alert.
- Retry/reconciliation can occur.

---

## 31.5 Webhook Failure

If webhook processing fails:

- Event should be retryable.
- Duplicate events must remain safe.
- Last valid shipment state is preserved.
- Admin can see operational alert if the failure becomes actionable.

---

## 31.6 Inventory Failure

If stock transaction fails:

- Order creation/payment workflow must not silently continue.
- The backend must preserve consistency.
- Customer receives a meaningful error.
- Admin can investigate if required.

---

# Chapter 32 — Reconciliation

## 32.1 Purpose

Reconciliation exists wherever an external system and internal business state can temporarily disagree.

---

## 32.2 Payment Reconciliation

Compare:

- Gateway payment state
- Internal payment state
- Internal order state

---

## 32.3 Shiprocket Reconciliation

Compare:

- Internal shipment state
- Shiprocket shipment state
- AWB
- Courier
- Tracking state

---

## 32.4 Reconciliation Authority

External provider is authoritative for provider-owned state.

SAREEVANTA is authoritative for SAREEVANTA business state.

Neither system should overwrite the other's unrelated domain.

---

# Chapter 33 — Customer-Facing Search & Catalog Experience Rules

## 33.1 No Customer SKU Dependency

SKU is not required for normal customer discovery.

---

## 33.2 Semantic-Like Search Without AI

Use:

- Synonyms
- Spelling normalization
- Catalog aliases
- Structured attribute matching
- Search tokenization
- Text normalization

No AI is required.

---

## 33.3 Browse + Search + Filters

Customer discovery should always allow:

- Search
- Browse
- Filters

A failed search should not trap the customer.

---

## 33.4 Merchandising Variety

The catalog ordering system must avoid monotony.

It should mix:

- Weaves
- Fabrics
- Occasions
- Colors
- Price bands
- New arrivals
- Bestsellers
- Discounts
- Featured products

The system should not simply sort by one field.

---

# Chapter 34 — Backend State Machines

## 34.1 Product

```text
DRAFT/UNPUBLISHED
        │
        ▼
   PUBLISHED
        │
        ▼
UNPUBLISHED
```

No archive state.

---

## 34.2 Order

```text
Placed
  ↓
Processing
  ↓
Shipped
  ↓
Out for Delivery
  ↓
Delivered
```

Cancellation can occur only at permitted points.

---

## 34.3 Shipment

Shiprocket provides a richer external lifecycle.

SAREEVANTA should map only the required business states.

Relevant logistics events include:

```text
AWB Assigned
Label Generated
Pickup Requested/Booked
Picked Up
In Transit
Out for Delivery
Delivered
```

Exception paths can include:

```text
Pickup Error
Pickup Exception
Delayed
Undelivered
NDR
RTO
Lost
Damaged
Misrouted
Cancelled
```

Do not expose every provider status as a separate SAREEVANTA customer order state.

---

## 34.4 Claim

Conceptual:

```text
Claim Submitted
      ↓
Verification Pending
      ↓
Approved / Rejected
      ↓
Physical Verification where required
      ↓
Refund Pending / Replacement Processing
      ↓
Completed / Closed
```

---

## 34.5 Review

```text
Pending
  ↓
Approved / Hidden
```

Moderation state may include internal rejection/flagging states.

---

# Chapter 35 — Security

## 35.1 Customer Data

Customer data must be protected.

---

## 35.2 Passwords

Passwords are never stored in plaintext.

---

## 35.3 Admin Credentials

Admin credentials are never exposed to frontend code beyond the secure authentication flow.

---

## 35.4 Shiprocket Credentials

Shiprocket credentials remain server-side.

---

## 35.5 Payment Credentials

Razorpay secret credentials remain server-side.

---

## 35.6 Authorization

Every protected backend operation verifies authorization.

Frontend-only access hiding is insufficient.

---

## 35.7 Sensitive Information

Customer:

- Password
- Authentication secrets
- Private contact details where not required

must not be exposed to unauthorized users.

---

# Chapter 36 — Data Retention & Deletion

## 36.1 Orders

Historical orders are retained.

---

## 36.2 Products

Products with historical orders are not hard deleted.

They are unpublished.

---

## 36.3 Catalog Values

Catalog values used historically are retired/inactivated rather than destructively deleted.

---

## 36.4 Reviews

Moderation/deletion should preserve enough internal information for integrity and audit where required.

---

## 36.5 Customers

Account deletion must not automatically destroy legally/operationally required transaction records.

---

# Chapter 37 — Admin Product Management Requirements

## 37.1 Catalog Page

The Catalog page is the primary place for:

- Create product
- Edit product
- Manage variants
- Manage pricing
- Manage media
- Publish/unpublish

---

## 37.2 Inventory Page

The Inventory page is the primary place for:

- View stock
- Adjust stock
- View reserved stock
- View available stock
- View SKU
- Export CSV

---

## 37.3 Create New Saree

Create product should be available from the Catalog page.

Do not duplicate product creation in Inventory.

---

## 37.4 Inventory Matrix

Keep Inventory Matrix as an operational view, but simplify it significantly.

---

# Chapter 38 — Orders Admin Functional Rules

## 38.1 Orders Page

The Orders page is the operational order center.

It includes:

- Search
- Filters
- Order list
- Customer details
- Saree items
- Zari specifications
- Total amount
- Payment state
- Fulfillment state
- Shipment/AWB information
- Relevant actions

---

## 38.2 Permanent Cancel Tab

Cancelled orders remain accessible through a permanent Cancelled tab.

---

## 38.3 Removed Tabs

Remove:

- Gift
- Bridal
- VIP Patron
- Bridal Trousseau

---

## 38.4 Order Source

Order source is retained.

Possible source categories can include:

- Customer storefront
- Manual admin order

The exact enumeration is defined in DSS.

---

# Chapter 39 — Customer Order Confirmation

## 39.1 Confirmation Page

After successful payment/order creation, show:

- Order confirmed
- Order reference/order number
- Estimated delivery information if available
- Amount paid
- Order summary
- Delivery address

Optional actions:

- Track order
- Continue shopping

---

## 39.2 Confirmation Authority

Confirmation page must be based on backend-confirmed state.

The frontend must never display a confirmed order solely because a payment UI returned success.

---

# Chapter 40 — Product Recommendations

## 40.1 Product Page

The product page includes:

> You May Also Like

---

## 40.2 Recommendation Rules

Use rule-based matching.

Primary signals:

1. Same weave/fabric
2. Similar occasion
3. Similar color
4. Similar price
5. Similar tags/pattern

The exact weighting is an implementation/DSS concern.

---

## 40.3 No AI

No AI/ML recommendation engine is required.

---

# Chapter 41 — Catalog Merchandising Algorithm

## 41.1 Objective

The objective is not simply:

> "Sort products."

The objective is:

> Create a varied, attractive and commercially sensible product discovery sequence.

---

## 41.2 Inputs

The algorithm can consider:

- Featured
- Admin boost
- New Arrival
- Bestseller
- Discount attractiveness
- Price accessibility
- Product diversity
- Weave diversity
- Fabric diversity
- Occasion diversity
- Color diversity
- Recent exposure/rotation history

---

## 41.3 Diversity Constraint

The system should penalize repeated consecutive similarity.

Examples:

- Do not show the same weave repeatedly.
- Do not show the same fabric repeatedly.
- Do not show the same occasion repeatedly.
- Do not show the same price band repeatedly.

---

## 41.4 Rotation

Rotation is time-based.

It does not change every refresh.

The agreed approximate rotation interval is two days.

---

# Chapter 42 — Low-Stock & Operational Alerts

## 42.1 Low Stock Rule

Alert when:

> Available stock ≤ 3

---

## 42.2 No Reorder Point

No configurable reorder-point system exists in V1.

---

## 42.3 Operational Alert

Admin receives useful alerts for:

- Low stock
- Refund pending
- Claim requiring action
- Payment reconciliation failure
- Shipment integration failure
- Other high-value operational exceptions

---

# Chapter 43 — CSV Export

## 43.1 Customer Export

Customer CSV export is supported.

---

## 43.2 Inventory Export

Inventory CSV export is supported.

---

## 43.3 Bulk Import

Bulk import is explicitly removed from V1.

---

# Chapter 44 — API Functional Responsibilities

The exact endpoint paths belong in DSS/API implementation, but the backend must provide functional operations for:

## Authentication

- Register/account creation
- Login
- OTP
- Google authentication
- Password reset
- Logout/session handling

## Customer

- Get profile
- Update permitted profile data
- Address CRUD
- Order history
- Wishlist
- Account deletion

## Catalog

- Product listing
- Search
- Suggestions
- Filters
- Product detail
- Variant detail
- Collections
- Taxonomy

## Cart

- Get cart
- Add item
- Remove item
- Update quantity
- Select/deselect item

## Checkout

- Initiate
- Address selection
- Serviceability
- Shipping rate
- Review
- Reservation
- Payment initiation boundary
- Final validation

## Orders

- Create
- Get
- List
- Cancel where permitted
- Order history

## Payments

- Create payment attempt
- Verify/reconcile
- Record gateway state
- Refund boundary

## Inventory

- Get
- Reserve
- Release
- Commit
- Adjust
- Audit

## Shipments

- Create
- Assign/AWB
- Label
- Pickup
- Tracking
- Webhook
- Cancellation
- NDR/RTO integration

## Returns

- Create claim
- Upload evidence
- Review
- Approve/reject
- Verify
- Refund/replacement

## Reviews

- Create
- Edit
- Delete
- Moderate
- Publish/hide

## Admin

- Dashboard
- Customers
- Orders
- Products
- Inventory
- Collections
- Content
- Coupons
- Analytics
- Staff/RBAC
- Alerts

---

# Chapter 45 — Realtime Functional Requirements

Realtime behavior is required where immediate operational awareness matters.

Examples:

- New order notification to admin
- Order processing state update
- Shipment status update where useful
- Claim status update where useful
- Refund pending alert
- Low stock alert where appropriate

The exact realtime technology is intentionally not fixed by this BFS unless already selected by the implementation project.

---

# Chapter 46 — Logging

## 46.1 Technical Logs

Technical logs are separate from business/admin audit history.

Technical logs can contain:

- Request failures
- Integration errors
- Exceptions
- Webhook failures
- Reconciliation errors
- Performance/diagnostic data

---

## 46.2 Business Audit

Business audit contains:

- Who changed what
- Before/after values where appropriate
- Reason
- Timestamp

---

## 46.3 Sensitive Data

Passwords, OTP secrets and equivalent authentication secrets must never be logged.

---

# Chapter 47 — Customer-Facing Policy Dependencies

The backend must support customer-facing policies covering:

- Shipping
- Cancellation
- Refund
- Returns/claims
- Reviews
- Account deletion
- Privacy/data retention
- Terms where applicable

These policies are built from the finalized backend rules.

Policy wording itself is not part of BFS implementation.

---

# Chapter 48 — Future Items Explicitly Deferred

The following are future/research items and must not be treated as V1 requirements:

1. Advanced HSN search engine.
2. GI metadata acquisition/automation.
3. Advanced customer segmentation.
4. CRM lifecycle automation.
5. Advanced marketing automation.
6. Instagram monitoring/crawling.
7. Scheduled homepage campaigns.
8. Advanced coupon analytics.
9. Advanced AI search.
10. AI recommendation engine.
11. Advanced AI moderation.
12. Multi-warehouse.
13. Multi-pickup location.
14. COD.
15. International shipping.
16. Advanced shipment manifest ownership.
17. Detailed Shiprocket sandbox behavior.
18. Exact Shiprocket webhook retry semantics.
19. Advanced wallet monitoring if provider API does not expose it cleanly.
20. Advanced payment-gateway architecture beyond the finalized functional boundary.

---

# Chapter 49 — Shiprocket Integration Research Dependencies

The following must be verified against the current Shiprocket documentation/account during implementation:

- Exact current request/response schemas.
- Manifest requirement and lifecycle.
- Manifest generation/printing behavior.
- Pickup/handover semantics.
- Webhook retry behavior.
- Exact webhook payloads.
- Shipment-state mapping.
- Wallet balance availability.
- POD availability.
- Freight reconciliation.
- Exact courier recommendation behavior.
- Account-specific API limits.
- Sandbox/testing capabilities.

The Shiprocket research context confirms:

- Serviceability API exists.
- Multiple courier/rate results can be returned.
- AWB assignment is separate.
- Pickup request is separate from physical pickup.
- Label generation is supported.
- Manifest APIs exist.
- Tracking APIs exist.
- Tracking webhooks exist.
- NDR APIs exist.
- RTO remains relevant.
- Shiprocket credentials are sensitive.
- 429 rate limiting exists.
- Full courier-lifecycle sandbox was not conclusively established.

The BFS shall not invent unsupported provider behavior.

---

# Chapter 50 — V1 Scope Freeze

The following is the final functional freeze:

## Customer

- Authentication required for cart/wishlist/purchase.
- Product discovery.
- Search + autocomplete + synonyms + spelling handling.
- Browse + filters.
- Mixed catalog merchandising.
- Variant selection.
- Cart selection.
- Variant wishlist.
- Local recently viewed.
- Checkout with four stages.
- PIN validation/serviceability.
- Prepaid payment.
- Order confirmation.
- Order history.
- Cancellation before processing.
- Cancellation OTP.
- Shipment tracking.
- Claims within 48 hours of delivery.
- Reviews after delivery.
- Account deletion.

## Admin

- Product/catalog management.
- Variant/SKU management.
- Inventory.
- Collections/taxonomy.
- Orders.
- Shipments.
- Returns/claims.
- Customers.
- Reviews.
- Coupons.
- Homepage content.
- Instagram reels.
- Analytics.
- Dashboard.
- Notifications/alerts.
- Staff/RBAC.

## Logistics

- India only.
- One pickup location.
- One order → one parcel.
- Shiprocket.
- Serviceability first.
- Cost second.
- 24% shipping buffer.
- Customer does not select courier.
- Actual pickup required before Shipped.

## Inventory

- Physical
- Reserved
- Available
- 15-minute target customer reservation
- 35-minute manual-order reservation
- 30-minute checkout timeout
- Low stock ≤ 3
- No reorder point
- No bulk import
- CSV export

## Reviews

- Delivered order only.
- 1–5 stars.
- Headline + text.
- Maximum 2 photos.
- No video.
- Basic abuse/spam filter.
- Admin moderation.
- Verified buyer.

## RBAC

- 1 Super Admin.
- 3 Operational Roles.
- Permission-based authorization.

---

# Chapter 51 — Functional Acceptance Principles

A feature is considered functionally complete only when:

1. The backend enforces its business rule.
2. Invalid states are rejected.
3. Historical records remain accurate.
4. Authorization is enforced.
5. External integrations are reconciled where necessary.
6. Duplicate operations are prevented.
7. Failure states are recoverable.
8. Audit requirements are satisfied.
9. Customer-facing state reflects backend truth.
10. The implementation does not silently reintroduce an excluded feature.

---

# Chapter 52 — DSS Boundary

The next document, DSS, shall translate this BFS into detailed technical/data specifications.

DSS shall define:

- Entities
- Tables
- Fields
- Field types
- Nullability
- Defaults
- Enums
- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Relationships
- Historical snapshots
- Customer-visible fields
- Admin-visible fields
- Internal-only fields
- API request/response contracts
- Validation details
- State transition matrices
- RBAC permission matrix
- Webhook payload handling
- Idempotency keys
- Reconciliation structures
- Audit structures
- File/media storage references
- Search indexes/normalized search data
- Inventory reservation records
- Payment records
- Refund records
- Shipment records
- Return/claim records

The DSS must not invent functionality that is not supported by this BFS.

---

# Chapter 53 — Final Implementation Governance

Before implementation of any feature:

1. Identify the BFS section.
2. Identify the business rule.
3. Identify the affected entities.
4. Identify the API operation.
5. Identify authorization.
6. Identify validation.
7. Identify historical impact.
8. Identify audit requirements.
9. Identify integration dependency.
10. Implement only the defined behavior.

If a developer encounters an ambiguity:

> Do not assume.

Ask for clarification before expanding scope.

If a frontend mockup contains a feature not represented in this BFS:

> The BFS takes precedence unless the specification is formally revised.

If an apparently useful feature is not in this BFS:

> Do not add it merely because it seems standard for e-commerce.

---

# Appendix A — Core Business Flow

```text
CUSTOMER
   │
   ├── Browse
   │
   ├── Search
   │
   ├── Filter
   │
   ├── Product
   │      └── Select Variant
   │
   ├── Login
   │
   ├── Add to Cart
   │
   ├── Wishlist
   │
   └── Checkout
          │
          ├── Delivery Address
          │
          ├── PIN Validation
          │
          ├── Shiprocket Serviceability
          │
          ├── Shipping Calculation
          │
          ├── Temporary Stock Reservation
          │
          ├── Review
          │
          ├── Payment
          │
          └── Backend Confirmation
                  │
                  ▼
                ORDER
                  │
                  ▼
              PROCESSING
                  │
                  ▼
          SHIPROCKET SHIPMENT
                  │
                  ├── AWB
                  ├── Label
                  ├── Pickup
                  └── Tracking
                         │
                         ▼
                      DELIVERED
                         │
              ┌──────────┴──────────┐
              │                     │
            REVIEW                CLAIM
```

---

# Appendix B — Admin Operational Flow

```text
ADMIN LOGIN
    │
    ▼
DASHBOARD
    │
    ├── Catalog
    │     ├── Product
    │     └── Variants/SKU
    │
    ├── Inventory
    │     ├── Stock
    │     ├── Reservation
    │     └── Adjustments
    │
    ├── Orders
    │     ├── New
    │     ├── Start Processing
    │     ├── Cancel
    │     └── Shipment
    │
    ├── Shipments
    │     └── Shiprocket
    │
    ├── Returns
    │     ├── Claim
    │     ├── Verification
    │     └── Refund/Replacement
    │
    ├── Customers
    │
    ├── Reviews
    │
    ├── Discounts & Coupons
    │
    ├── Homepage Content
    │
    ├── Instagram Reels
    │
    ├── Analytics
    │
    └── Staff & RBAC
```

---

# Appendix C — Core Data Relationship

```text
CUSTOMER
 ├── Addresses
 ├── Cart
 ├── Wishlist
 ├── Orders
 ├── Reviews
 └── Claims

PARENT PRODUCT
 ├── Taxonomy
 ├── Collections
 └── VARIANTS
       ├── SKU
       ├── Color
       ├── Swatch
       ├── Pallu Color
       ├── Images
       ├── Barcode
       └── Inventory

ORDER
 ├── Customer
 ├── Address Snapshot
 ├── Order Items
 ├── Payment
 ├── Coupon
 └── Shipment

SHIPMENT
 ├── Shiprocket Order
 ├── Shipment ID
 ├── Courier
 ├── AWB
 └── Tracking Events

CLAIM
 ├── Order
 ├── Order Item
 ├── Evidence
 ├── Verification
 ├── Decision
 ├── Refund
 └── Replacement

REVIEW
 ├── Customer
 ├── Order Item
 ├── Review Content
 ├── Photos
 └── Moderation

CONTENT
 ├── Homepage Hero
 ├── Marquee
 └── Instagram Reel

MERCHANDISING
 ├── Collections
 ├── Taxonomy
 ├── Featured
 ├── Bestseller
 └── New Arrival

ADMIN
 ├── Staff
 ├── Roles
 ├── Permissions
 └── Audit
```

---

# Appendix D — Non-Negotiable V1 Rules

1. No guest checkout.
2. Login required to add to cart.
3. Login required for wishlist.
4. No COD.
5. India domestic shipping only.
6. One pickup location.
7. One order = one parcel.
8. Customer does not choose courier.
9. Serviceability first, cost second.
10. 24% shipping buffer.
11. Backend is final authority.
12. Payment gateway determines payment success/failure.
13. Duplicate payment/order creation must be prevented.
14. Successful payment/internal failure must be reconcilable.
15. Customer cancellation requires OTP.
16. Customer cancellation stops after Start Processing.
17. Shipped only after actual courier pickup/handover.
18. No fake shipped state.
19. No customer-visible Packed status.
20. Claim window = 48 hours from delivery.
21. Claim photos mandatory for wrong/damaged claims.
22. Claim evidence = 1–3 photos + optional 1 video.
23. Review only after delivery.
24. Review photos max 2.
25. No review videos.
26. Basic abuse/spam filtering.
27. One promotional coupon maximum per order.
28. New Arrival = 30 days from first publication, with admin override.
29. Low stock = available ≤ 3.
30. No reorder point.
31. Customer reservation target = 15 minutes.
32. Checkout timeout = 30 minutes.
33. Manual order reservation = 35 minutes.
34. No bulk import.
35. CSV export retained.
36. No bin/warehouse location management.
37. No archive state for products.
38. Historical products/orders cannot be hard deleted.
39. Product variants are SKU-based.
40. Barcode is generated from SKU.
41. Cost price is internal only.
42. MRP precedes selling price in admin pricing UI.
43. Weave = one value.
44. Fabric = one value.
45. Occasion = multiple values.
46. Pattern = one value.
47. Border styling = one predefined selectable value.
48. Zari is retained.
49. Loom construction type removed.
50. Loom tag ID removed.
51. HSN retained as selectable basic V1 functionality.
52. Advanced HSN search is future.
53. Origin removed.
54. GI acquisition workflow not required in V1.
55. Product description optional.
56. Product media = 1–3 images per variant.
57. No 4K product video requirement.
58. Homepage hero has no artificial hard count.
59. Hero desktop + mobile images mandatory.
60. One active marquee message.
61. Hero CTA references existing catalog entities.
62. Reels use external URLs.
63. No Instagram crawling.
64. No Instagram monitoring.
65. Unlimited stored reels; only active shown.
66. Admin manually orders reels.
67. Exactly four RBAC roles.
68. One Super Admin + three Operational Roles.
69. Backend enforces RBAC.
70. Technical logs separate from business audit.
71. Never expose passwords/OTP secrets.
72. Never expose Shiprocket credentials to frontend.
73. Never expose internal cost price to customers.
74. Do not add features merely because they are common in large e-commerce platforms.
75. When uncertain, stop and clarify instead of assuming.

---

# Appendix E — Source and Precedence Rules

The BFS was derived using:

1. The finalized SAREEVANTA V1 Master Decision & Specification Registry.
2. The finalized project decisions made during the customer/admin page-by-page review.
3. The finalized Shiprocket research context.

Where Shiprocket behavior is not established:

> **Do not assume. Mark the item as an integration verification dependency.**

---

# Final Status

## BFS STATUS

**V1 FUNCTIONAL SCOPE DEFINED**

This document is the functional foundation for the next stage.

The next document is the:

> **DSS — Detailed System / Database Specification**

The DSS shall translate this BFS into exact data structures, fields, visibility, relationships, validations, APIs, permissions, state machines, and integration contracts.

---

# 23. BACKEND ARCHITECTURE & PROJECT STRUCTURE

## 23.1 Purpose

This section defines the minimum backend architectural structure required to implement the functional requirements in this BFS.

It is intentionally limited to the structure and boundaries needed for V1. It does not prescribe unnecessary abstractions, microservices, event buses, or infrastructure complexity.

The implementation should remain a modular backend application with clear separation between:

- API/request handling
- authentication and authorization
- business/domain logic
- database access
- validation
- external integrations
- shared utilities
- types
- realtime behavior
- technical logging
- documentation

The architecture must support the functional rules already defined in this BFS and must not introduce new business behavior merely for architectural completeness.

---

## 23.2 High-Level Project Structure

The backend should follow a structure broadly equivalent to:

```text
backend/
├── app/
│   ├── auth/
│   ├── customer/
│   ├── catalog/
│   ├── inventory/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── shipments/
│   ├── returns/
│   ├── reviews/
│   ├── coupons/
│   ├── homepage/
│   ├── reels/
│   ├── customers/
│   ├── analytics/
│   ├── staff/
│   └── admin/
│
├── db/
│   ├── migrations/
│   ├── queries/
│   └── repositories/
│
├── lib/
│   ├── shiprocket/
│   ├── razorpay/
│   ├── storage/
│   └── shared/
│
├── validations/
├── utils/
├── constants/
├── realtime/
├── types/
├── public/
└── documentation/
```

The exact framework-specific naming may differ during implementation, but the logical separation must remain.

---

## 23.3 Module Boundaries

### `app/`

Contains the application's feature-level backend modules and request-facing behavior.

Each major business area should have a clear module boundary.

Examples:

- `catalog` — products, variants, attributes, collections and taxonomy references
- `inventory` — stock, reservations, adjustments and inventory history
- `cart` — customer cart and selection state
- `checkout` — checkout stages and validation
- `orders` — order creation, lifecycle and historical order facts
- `payments` — payment state and reconciliation
- `shipments` — shipment state and Shiprocket-facing business integration
- `returns` — cancellation, return, refund and replacement workflows
- `reviews` — customer reviews and moderation
- `customers` — customer management
- `staff` — staff accounts and RBAC
- `homepage` — homepage content such as hero slides, marquee and related content
- `reels` — external reel management
- `coupons` — V1 promotional coupon behavior
- `analytics` — operational and reporting calculations
- `admin` — admin-specific orchestration and dashboard behavior

A feature module may contain its own handlers/services/schema definitions as appropriate, but business rules must not be duplicated across unrelated modules.

---

## 23.4 `db/`

Database access must be separated from request/UI concerns.

`db/` is responsible for:

- migrations
- database queries
- repositories/data-access functions
- transaction boundaries where required
- persistence of business and audit records

The database is the authoritative persistence layer for business state.

The frontend must never be treated as an authority for:

- inventory quantity
- reservation validity
- payment confirmation
- order state
- cancellation eligibility
- refund state
- shipment state
- claim state
- RBAC permissions

---

## 23.5 `lib/`

`lib/` contains shared external or infrastructure integrations that should not be scattered throughout feature modules.

### Shiprocket

The Shiprocket integration must be isolated behind a dedicated integration boundary.

It is responsible for:

- authentication/token handling required by the integration
- serviceability/rate interaction
- shipment creation
- pickup-related interaction
- tracking interaction
- webhook handling support
- cancellation interaction where supported
- provider response normalization

The rest of the application should consume normalized application-level results rather than directly depending on Shiprocket response structures wherever practical.

### Razorpay

Razorpay integration is also isolated.

The detailed V1 payment-gateway implementation is intentionally deferred to the payment-integration stage, as already decided.

This BFS defines the business requirement that payment confirmation must be authoritative and verified by the backend; the exact Razorpay implementation details belong to the integration implementation/DSS stage.

---

## 23.6 `validations/`

Centralized validation rules should be used for request and input validation.

Validation must distinguish between:

1. syntactic/input validity
2. authorization
3. business-rule validity

Passing input validation must never be interpreted as permission to perform a business operation.

Examples of business rules that must remain server-side include:

- stock cannot be reserved beyond available stock
- customer cancellation is blocked after processing begins
- checkout reservations expire according to the locked rules
- one order is one parcel in V1
- one promotional coupon maximum per order
- historical order facts cannot be modified
- claims require the defined evidence
- role permissions must be enforced by the backend

---

## 23.7 `constants/`

Shared fixed V1 values and enumerations should have one authoritative definition.

Examples include:

- customer-visible order statuses
- internal order lifecycle values
- claim types
- review moderation states
- product publication states
- reservation durations
- low-stock threshold
- shipment/business-state mappings
- V1 buffer values
- supported content states

Values that were deliberately locked as configurable or future functionality must not be incorrectly hardcoded.

---

## 23.8 `types/`

Shared application types should define the contracts used between modules where appropriate.

Types should represent business concepts such as:

- Customer
- Product
- Product Variant
- Cart
- Reservation
- Order
- Order Item
- Payment
- Shipment
- Return/Claim
- Refund
- Review
- Coupon
- Collection
- Staff User
- Role
- Permission
- Audit Event

Types must not expose internal-only information through customer-facing API contracts.

For example, internal product cost price must never be returned in customer-facing responses.

---

## 23.9 `realtime/`

Realtime behavior should be implemented only where it provides clear V1 operational value.

Examples include:

- inventory availability changes where practical
- admin operational alerts
- relevant dashboard updates

Realtime behavior is supplemental. The backend database remains authoritative.

The system must not depend on realtime delivery for correctness.

If a realtime update is missed, refreshing or re-fetching authoritative backend state must restore the correct view.

---

## 23.10 `utils/`

`utils/` should contain genuinely shared, stateless helpers.

Examples:

- formatting
- safe normalization
- date/time helpers
- identifier helpers
- small calculation helpers
- non-domain-specific transformations

Business rules must not be hidden inside generic utility functions.

---

## 23.11 `public/`

Contains only genuinely public/static backend-served assets where required.

Private customer/admin evidence, internal documents, and sensitive media must not be exposed through unrestricted public paths.

---

## 23.12 `documentation/`

Contains implementation-facing documentation that is useful to the development team.

Examples:

- API notes
- integration notes
- webhook notes
- architecture notes
- operational instructions

The BFS itself remains the functional source of truth; implementation notes must not silently override locked functional requirements.

---

# 24. CORE ARCHITECTURAL RULES

## 24.1 Backend Is the Final Authority

All security-sensitive and business-critical decisions are made by the backend.

Frontend state is informational and interactive only.

The backend must independently verify:

- authenticated identity
- authorization
- product availability
- stock
- reservation ownership and expiry
- prices used for checkout
- coupon validity
- payment status
- cancellation eligibility
- refund eligibility
- shipment state
- claim state
- administrative permissions

---

## 24.2 No Trust in Client-Supplied Business State

The frontend may submit identifiers and user intent, but the backend must not blindly accept:

- available stock
- final price
- discount amount
- payment success
- order status
- shipment status
- refund amount
- claim approval
- staff permission

The backend recalculates or verifies values where required.

---

## 24.3 Transactional Inventory Operations

Inventory-affecting operations must be protected against race conditions.

This applies particularly to:

- temporary checkout reservation
- reservation release
- successful order commitment
- cancellation release
- manual-order reservation
- stock adjustment
- return-to-stock adjustment

A request that attempts to exceed available stock must fail safely and must not create an inconsistent inventory state.

---

## 24.4 Historical Accuracy

Once an order is placed, core historical order facts must be preserved.

Product/catalog changes must not retroactively rewrite the historical meaning of an existing order.

Where historical snapshots are required, the implementation must preserve the relevant values necessary to accurately represent what the customer purchased.

This does not require copying every current product field into every order table.

The implementation should preserve the minimum required historical facts without unnecessary duplication.

---

## 24.5 Idempotency

Operations that may be delivered more than once must be safe to process repeatedly.

This is particularly important for:

- Shiprocket webhooks
- payment callbacks/events
- retryable external integration requests
- refund state updates
- shipment status updates

If the same external event is received twice, it must not:

- create duplicate shipments
- create duplicate refunds
- release stock twice
- create duplicate business actions
- alter the order incorrectly

---

## 24.6 External Provider State

External provider states must not automatically become the entire application's domain model.

Shiprocket status information should be mapped into the application's required shipment/business states.

Where the provider exposes more detail than V1 needs, the system should retain only what is operationally useful and required for audit/tracking.

No fake customer-facing shipment state should be created merely to imitate provider terminology.

---

## 24.7 Authentication and Authorization

Authentication establishes identity.

Authorization establishes what that identity may do.

The backend must enforce RBAC independently of the frontend.

V1 uses:

- one provisioned Super Admin
- three operational roles
- permission-based access

The architecture must allow additional staff accounts to be provisioned by an authorized existing admin later without requiring a structural rewrite.

Customer authentication uses the finalized V1 methods:

- email/password with email OTP
- Google authentication

Admin authentication uses the same fundamental identity methods with stricter access controls appropriate to administrative access.

---

## 24.8 Sensitive Information

Sensitive information must remain server-side.

Examples:

- payment credentials/secrets
- Shiprocket credentials/tokens
- Razorpay secrets
- internal cost price
- private evidence/media
- authentication secrets
- technical credentials

Passwords must never be visible to administrators.

---

## 24.9 Audit History vs Technical Logs

Two different concepts must remain separate.

### Business/Admin Audit History

Used for meaningful administrative actions such as:

- stock adjustments
- product changes
- coupon changes
- claim decisions
- refunds
- cancellation decisions
- permission changes
- other important administrative operations

Audit records should retain relevant actor, timestamp, action and reason/context where applicable.

### Technical Logs

Used for:

- exceptions
- integration failures
- unexpected system errors
- debugging/diagnostics

Technical logs must not replace business audit history.

---

## 24.10 Error Handling

Customer-facing responses should be understandable and actionable.

Administrative screens should receive useful operational errors rather than raw stack traces or technical exceptions.

Detailed technical diagnostics belong in technical logs.

Errors from external providers should be normalized into appropriate application-level outcomes.

---

## 24.11 No Unnecessary Distributed Architecture

V1 should remain a straightforward modular backend.

Do not introduce:

- microservices
- unnecessary message brokers
- distributed event buses
- separate services for every module
- custom scheduling infrastructure where a simple scheduled job is sufficient
- AI services where a deterministic rule is sufficient

Architecture should solve the actual V1 requirements rather than anticipate hypothetical scale.

---

## 24.12 Integration Boundaries

Shiprocket and Razorpay must remain replaceable integration boundaries.

Core business logic should not become tightly coupled to provider-specific response formats.

Provider-specific implementation belongs inside the relevant integration boundary.

---

## 24.13 Customer/Admin Data Separation

Customer-facing API responses and admin-facing API responses must be intentionally designed.

A field existing in the database does not mean it is automatically exposed to either side.

Examples:

- internal cost price — admin/internal only
- customer contact information — controlled access
- claim evidence — customer and authorized admin only
- technical logs — internal only
- moderation information — admin/internal
- payment secrets — never exposed

The exact field-level visibility matrix will be finalized in DSS/API contracts.

---

## 24.14 No Frontend-Driven Security

Hiding a button or route in the frontend is not an authorization mechanism.

Every protected operation must be checked on the backend.

This applies especially to:

- staff permissions
- inventory operations
- refunds
- cancellations
- product publication
- coupon management
- customer management
- claims
- reviews
- homepage content
- administrative configuration

---

## 24.15 V1 Scope Discipline

The implementation must follow the locked V1 scope.

Items explicitly removed from the existing admin UI or deferred to future versions must not be rebuilt merely because they appeared in an earlier frontend mockup.

Likewise, future capabilities must remain documented as future capabilities rather than being partially implemented without a defined requirement.

---

# 25. ARCHITECTURAL BOUNDARY WITH DSS

The BFS defines:

- what the system does
- business rules
- workflows
- validation requirements
- state transitions
- permissions at a functional level
- integration responsibilities
- failure behavior

The DSS will define:

- database schema
- tables
- columns
- relationships
- indexes
- constraints
- enum/storage strategy
- API contracts
- request/response structures
- field visibility
- authentication/session persistence
- webhook persistence
- audit storage
- transaction boundaries at the data layer
- storage/media structure
- implementation-level details

The DSS must be derived from this BFS.

The DSS must not introduce new business requirements without returning to the BFS/decision registry for clarification.

---

# 26. IMPLEMENTATION PRINCIPLE

The implementation target is:

> **The simplest architecture that reliably enforces every locked V1 business rule.**

Where two designs satisfy the same requirements, prefer the simpler design.

Do not add abstraction merely because it is technically possible.

Do not duplicate data merely for convenience unless the duplication is required for historical accuracy, performance, or a clearly defined integration need.

Do not build future-version functionality into V1 unless it is explicitly marked as required.

The architecture must remain understandable to the developers who will maintain the system.

---

# 27. FINAL ARCHITECTURAL FREEZE

The following architectural principles are considered mandatory for V1:

1. Backend is the final authority.
2. Frontend is never trusted for business-critical state.
3. Inventory operations are concurrency-safe and transactional where required.
4. External webhook/event processing is idempotent.
5. Historical order facts are preserved.
6. Shiprocket and Razorpay are isolated behind integration boundaries.
7. Authentication and RBAC are enforced server-side.
8. Customer-facing and admin-facing data contracts are intentionally separated.
9. Business audit history is separate from technical logs.
10. Sensitive information is never exposed unnecessarily.
11. Realtime is supplemental, never authoritative.
12. V1 remains a modular backend rather than an unnecessarily distributed system.
13. Removed/deferred functionality is not reintroduced from old frontend screens.
14. DSS is derived from this BFS rather than independently inventing business behavior.
15. Simplicity is preferred whenever it satisfies the requirements.

This completes the backend functional and architectural specification for V1. The next document is the Detailed System Specification (DSS), which must translate these requirements into the concrete data, API, storage, and implementation contracts without expanding the agreed V1 scope.

---

**End of Backend Functional Specification — V1**
