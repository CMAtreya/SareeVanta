# SAREEVANTA / NEEL SAREE HOUSE

# V1 ADMIN UI CHANGE SPECIFICATION

**Version:** 1.0  
**Status:** FINAL V1 ADMIN UI CHANGE SPECIFICATION  
**Purpose:** Authoritative page-by-page specification for modifying the existing Admin Dashboard frontend  
**Relationship to BFS/DSS:** Companion document — does not replace either

---

# 1. Purpose

This document records the finalized decisions made during the page-by-page review of the existing SAREEVANTA / Neel Saree House Admin Dashboard.

It defines what must be **kept, removed, renamed, modified, added, or simplified**.

The hierarchy is:

```text
BFS
↓
Business / functional requirements

DSS
↓
Database / system design

ADMIN UI CHANGE SPECIFICATION
↓
Exact changes to the existing Admin Dashboard UI
```

The existing frontend is reference material only. Existing UI does not automatically override finalized V1 decisions.

---

# 2. Global Rules

1. Do not retain a feature merely because it exists in the old frontend.
2. Do not build backend functionality solely to support a removed UI feature.
3. Do not over-engineer V1.
4. Frontend actions must respect backend business rules.
5. Historical order facts must not be editable.
6. Immutable identifiers such as SKU and barcode must not become editable inputs.
7. Removed provider/technical concepts must not be presented as SAREEVANTA-owned business states.
8. Use simple operational terminology.

---

# 3. Product Creation / Add Saree

## Remove

- QR generation / QR-oriented controls
- Loom Construction Type
- Loom Tag ID
- Image-roll/media-roll concepts
- 10-second 4K product video
- unnecessary SEO fields
- social-preview fields
- unnecessary technical descriptions
- unnecessary certification reference display
- origin
- GI acquisition/registry workflow

## Keep / Add / Modify

- Product name
- Description
- Weaving
- Fabric
- Occasion
- Zari Specification
- Central Silk Board certification
- Blouse Piece Included
- Saree dimensions
- GST rate
- HSN
- Cost Price
- MRP
- Selling Price
- Stock
- Package dimensions
- Package weight
- Pallu
- Border Styling
- Variant management
- Color variant management
- Blouse dimensions

### SKU

SKU moves to the beginning/early part of the form because it is the primary admin identifier.

Format:

```text
NSH-0001
NSH-0002
NSH-0003
```

SKU is:

- system-generated
- variant-owned
- unique
- immutable
- not manually editable

### Barcode

Barcode is:

- automatically generated
- unique
- immutable
- physically scannable using standard scanners
- internal identification only
- not GS1/business-certified in V1

It must not be presented as QR generation.

### Product / Variant

The page must explicitly support:

```text
Master Product
    ↓
Variants / SKUs
```

The variant owns variant-specific information.

### Pricing

Show:

```text
MRP
Selling Price
Automatically calculated discount
```

Cost Price remains separate and admin-only.

Cost Price must never be exposed to customers.

### Blouse

If `Blouse Included = Yes`:

- Blouse Length is mandatory
- Blouse Width is mandatory

### Media

Keep only:

- Image
- Display Order
- Primary Indicator

No product video requirement.

### Status

Only:

```text
Draft / Unpublished
Published
```

No Archive state.

---

# 4. Catalog / Products

## Remove

- Archive state
- Single Piece Luxury
- certification reference number from listing
- redundant new-SKU terminology
- duplicate product-creation controls
- duplicate inventory functionality

## Keep / Modify

- Product
- Variant
- SKU
- finalized catalog-value filters
- compact stock summary
- direct plus/minus stock controls
- CSV export
- low-stock indication

Low stock:

```text
Available Stock <= 3
```

No configurable reorder point.

Products with historical orders are not hard-deleted.

---

# 5. Inventory Matrix

Both Catalog and Inventory pages remain, but Inventory must be significantly simplified.

## Remove

- Bin Location
- Warehouse Bin
- Vault Location
- Loom Bench
- Reorder Point
- Single Piece Luxury
- Bulk Import
- physical warehouse/bin-location management
- duplicate product creation workflow

## Keep

- Physical Stock
- Reserved Stock
- Available to Sell
- Stock adjustment
- Stock history/audit
- Low-stock indication
- Inventory valuation
- CSV export
- quick stock delta

The matrix must be variant-aware.

Available-to-sell follows:

```text
Physical Stock - Reserved Stock
```

### Product creation

New saree/master product creation belongs primarily in the Catalog/Product Creation workflow, not as a second product-creation system inside Inventory.

---

# 6. Collections & Taxonomy

## Remove

- technical taxonomy descriptions
- Origin
- GI acquisition/registry workflow
- manual GI registry requirement
- scheduled collection state
- enterprise taxonomy-engine complexity
- unnecessary technical-purpose fields

## Keep

Collections remain.

Two collection types:

```text
Rule-Based
Curated
```

A product can belong to multiple collections.

Admin can create new catalog values.

Values used by historical products cannot simply be deleted; they become inactive/unavailable for new products.

Taxonomy remains a simple hierarchical structure.

---

# 7. Orders

## Remove

- Gift tab
- Bridal tab
- VIP Pattern
- Bridal-focused operational filters
- Open WhatsApp shortcut
- revenue/AOV widgets from this page

Revenue/AOV belongs in Dashboard/Analytics.

## Keep

Cancel/Cancelled remains a permanent primary area.

Order-related operational totals remain on the Orders page.

### Search

Use practical operational search supporting identifiers such as:

- Order ID
- SKU
- Customer name
- Customer email
- Customer phone
- Product name
- AWB where applicable

SKU is the primary product identifier.

### Order list

Show:

- Order ID
- Date
- Customer Details
- Saree Items
- relevant Zari information
- Total Amount
- Payment
- Tax
- Shipping
- Payment State
- Fulfillment State

### Fulfillment

Do not use a free-form status dropdown.

Use sequential operational actions such as:

```text
Start Processing
↓
Create Pickup Request
↓
Next valid fulfillment action
```

Only valid next actions should be exposed.

---

# 8. Order Quick View

The old Quick View largely repeated the Orders page.

Simplify it into a useful operational summary.

Any finalized Orders-page changes must be reflected consistently in Quick View.

---

# 9. Shipments

## Remove

- Air Express
- Surface Dispatch Center
- In-Air Transit as a SAREEVANTA-owned state
- WhatsApp alert
- custom courier pickup scheduling engine
- SAREEVANTA-owned daily dispatch manifest workflow

## Keep

- shipment details
- AWB
- courier
- Shiprocket identifiers
- tracking
- normalized shipment state
- relevant operational actions

Do not recreate Shiprocket's logistics system.

Do not create a fake `Shipped` state.

The order becomes shipped only when actual pickup/handover is confirmed according to the finalized Shiprocket integration.

Manifest behavior follows actual Shiprocket capability; do not build a custom manifest engine.

---

# 10. Returns & Exchanges

## Remove

- Incident Reference
- Central Hub
- Silkmark QC
- artificial Pickup Scheduled state unless confirmed as an actual supported Shiprocket state
- In Transit to Hub
- artificial logistics states not owned by SAREEVANTA

## Rename

```text
QC Inspection Pending
```

to:

```text
Verification Pending
```

## Failed return

Use:

```text
Return Failed
```

or:

```text
Claim Closed
```

while retaining an appropriate internal reason such as customer refusal.

## Keep

- customer reason
- claim type
- photos
- optional video
- evidence
- admin verification
- approval/rejection
- refund/replacement outcome

Evidence-based approval may occur first, but refund/replacement completion waits for required physical verification for that claim type.

---

# 11. Instagram Reel / Live Shopping Manager

## Remove

- video upload
- shortcode extraction
- external image URL
- automatic rotation algorithm
- Instagram crawling
- Instagram monitoring
- automated availability-monitoring system
- internal video hosting

## Keep

- Reel/Post URL
- optional caption/label
- optional custom thumbnail upload
- Active / Visible on Homepage
- display order

Admin controls ordering manually:

```text
Move Up
Move Down
```

Unlimited reels may be stored.

Only active reels appear on the homepage.

If an external reel becomes unavailable, admin can deactivate/remove it.

Do not build an Instagram crawler or monitoring engine.

---

# 12. Discounts & Coupons

## Rename

Rename the existing Marketing/Promotional/Discounts engine to:

# Discounts & Coupons

## Remove

- complex marketing engine
- campaign engine
- coupon analytics/tracking
- coupon stacking
- multiple coupons per order
- unnecessary promotional segmentation

## Keep

Discount types:

```text
Fixed Amount
Percentage
```

Maximum:

```text
1 promotional coupon per order
```

---

# 13. Banners & Marquee

## Rename

Rename to:

# Homepage Content

## Remove

- arbitrary destination URL entry
- scheduled slide engine
- artificial hero-slide limit
- catalog-entity creation through hero slides

## Hero slides

Keep:

- Desktop image — mandatory
- Mobile image — mandatory
- Heading
- Tagline
- optional Badge
- CTA text
- Active/inactive
- manual display order

CTA destination references SAREEVANTA entities such as products, collections, or categories.

A hero slide does not create catalog entities.

## Marquee

V1:

```text
One active marquee message
```

---

# 14. Customer Reviews / UGC

## Remove

- View Live Videos
- review videos
- WhatsApp moderation rules
- review reporting

## Review eligibility

Only after the order has been delivered.

## Editing

Controlled customer editing is permitted.

## Photos

- optional
- maximum 2 photos
- no V1 video

Approved review photos appear on the PDP.

## Moderation

One moderation decision covers:

```text
Review + attached photos
```

Basic prohibited-content/spam filtering should reject obvious:

- abusive words
- abusive word patterns
- spam

No AI moderation engine.

## Customer-facing identity

Show only:

```text
Customer Name
```

Do not expose email or phone.

Internal moderation status remains stored.

---

# 15. Customers / CRM

## Rename

Use:

# Customers

Use "Customer" rather than Patron/VIP terminology.

## Remove

- VIP Patrons
- VIP search
- Bridal customer search primitive
- Wedding Month search
- Inactive NRI Patrons
- COD Return Risks
- 360-degree Customer Dossier
- BPM / price-pendant logic
- unnecessary CRM segmentation engine

## Search

One unified search field.

Whatever the admin enters can match:

- name
- email
- phone

## Customer profile

Show appropriate:

- Name
- Email
- Phone
- Orders
- Refunds
- Claims
- Returns
- relevant activity
- relevant address/location information

Wishlist is not required on the customer-management profile.

## Authentication

Admin must not:

- view customer passwords
- set customer passwords
- control Google authentication
- access authentication secrets

## Last active

Use:

```text
Last Order
```

## Export

Keep:

```text
Export Customer CSV
```

Historical accuracy remains mandatory.

---

# 16. Analytics & Reports

Keep the Analytics/Reports page.

It should contain actual analytical information such as:

- sales
- orders
- product performance
- inventory
- customer activity
- returns/claims
- operational performance

Do not duplicate operational controls from Orders, Inventory, Shipments, or Customers.

---

# 17. Primary Dashboard

## Remove

- New Saree SKU button
- redundant product-creation shortcut
- SKU-specific creation terminology

## Keep

Dashboard focuses on:

- orders
- sales
- inventory
- low stock
- claims/returns
- operational alerts
- useful summary metrics

Do not duplicate entire operational pages.

---

# 18. Notifications

A separate full-featured Notifications management page is **not required for V1**.

## Remove

- notification campaign engine
- complex notification rule management
- unnecessary standalone notification-management functionality

## Keep

Useful operational alerts in the dashboard.

Alerts support:

```text
Read
Unread
```

---

# 19. Email Notification Decisions

## Account

Required:

- Account created
- Email OTP authentication where applicable
- Password reset

## Order

Use one combined:

```text
Payment Successful + Order Placed
```

email.

Also:

- Cancellation
- Refund Initiated
- Refund Completed

## Shipping

No unnecessary shipping emails.

Shiprocket may own its supported logistics notifications.

## Claims

Required claim-related notifications remain.

---

# 20. Staff & RBAC

## Remove from reviewed Settings area

- Tax
- Legal
- GST management module
- Logistics & Warehouses
- Payment Gateways
- Webhooks configuration UI
- unrelated non-RBAC settings excluded from V1

## Keep

Staff & RBAC.

Exactly:

```text
1 Super Admin
+
3 Operational Roles
=
4 V1 Roles
```

Permissions are granular.

V1 begins with one provisioned admin, while architecture supports an authorized existing admin provisioning additional staff/admin users later.

---

# 21. Global Terminology Cleanup

| Existing / Old Concept         | Final V1                          |
| ------------------------------ | --------------------------------- |
| Master Handling SKUs           | Products / Variants / SKUs        |
| Patrons                        | Customers                         |
| VIP Patrons                    | Remove                            |
| Bridal Customers               | Remove as manual customer segment |
| Marketing / Promotional Engine | Discounts & Coupons               |
| Banners & Marquee              | Homepage Content                  |
| QC Inspection Pending          | Verification Pending              |
| In Air Transit                 | Remove as internal state          |
| Central Hub                    | Remove                            |
| Silkmark QC                    | Remove                            |
| Air Express                    | Remove                            |
| Surface Dispatch Center        | Remove                            |
| 360° Customer Dossier          | Remove                            |
| Single Piece Luxury            | Remove                            |
| Loom Construction Type         | Remove                            |
| Loom Tag ID                    | Remove                            |
| Origin                         | Remove                            |
| QR Generation                  | Remove                            |
| Product Video                  | Remove                            |
| Shortcode Extraction           | Remove                            |
| External Image URL             | Remove                            |
| Bulk Import                    | Remove                            |
| Bin Location                   | Remove                            |
| Warehouse Bin                  | Remove                            |
| Vault Location                 | Remove                            |
| Loom Bench                     | Remove                            |
| Reorder Point                  | Remove                            |
| Gift Tab                       | Remove                            |
| Bridal Tab                     | Remove                            |
| VIP Pattern                    | Remove                            |
| Open WhatsApp                  | Remove                            |

---

# 22. Frontend-to-Backend Enforcement

The frontend must respect the finalized backend rules.

Examples:

- SKU becomes read-only after generation.
- Barcode cannot be edited.
- Cost Price never appears customer-facing.
- Historical order facts cannot be modified.
- Products with historical orders cannot be hard-deleted.
- Used catalog values become inactive rather than deleted.
- Customer cancellation is unavailable after processing begins.
- Admin cannot create a fake shipped state.
- Required claim evidence cannot be bypassed.
- Administrative stock correction requires a reason and audit information.

---

# 23. Final Admin Navigation

The V1 Admin Dashboard should focus on:

```text
Dashboard
Products / Catalog
Inventory
Collections & Taxonomy
Orders
Shipments
Returns & Claims
Customers
Reviews / UGC
Discounts & Coupons
Homepage Content
Instagram Reels
Analytics & Reports
Staff & RBAC
```

Removed modules/features must not remain merely because they existed in the old frontend.

---

# 24. Implementation Procedure

When modifying the existing Admin Dashboard:

1. Inspect the existing page.
2. Map every existing control to this document.
3. Classify it as KEEP / REMOVE / RENAME / MODIFY / ADD.
4. Do not preserve obsolete functionality merely because it exists.
5. Do not invent backend requirements for removed UI.
6. Do not invent new V1 features.
7. Preserve finalized terminology.
8. Preserve finalized state transitions.
9. Preserve backend restrictions.
10. Keep the interface operationally simple.

---

# 25. Final Page Status

| Page                   | Final V1 Status                                 |
| ---------------------- | ----------------------------------------------- |
| Product Creation       | Keep + significantly modify                     |
| Catalog / Products     | Keep + simplify                                 |
| Inventory Matrix       | Keep + significantly simplify                   |
| Collections & Taxonomy | Keep + simplify                                 |
| Orders                 | Keep + simplify                                 |
| Shipments              | Keep + remove duplicate/provider-owned concepts |
| Returns & Exchanges    | Keep + simplify                                 |
| Instagram Reel Manager | Keep + simplify                                 |
| Discounts & Coupons    | Keep + rename + simplify                        |
| Homepage Content       | Keep + rename + simplify                        |
| Reviews / UGC          | Keep + simplify                                 |
| Customers              | Keep + rename + simplify                        |
| Analytics & Reports    | Keep                                            |
| Primary Dashboard      | Keep + simplify                                 |
| Notifications          | No standalone full V1 management page           |
| Staff & RBAC           | Keep + simplify                                 |

---

# 26. Final Authority

This document captures the page-by-page frontend decisions made during the existing Admin Dashboard review.

It is intended to prevent obsolete UI concepts from returning during implementation.

**BFS = business truth.**

**DSS = database/system technical truth.**

**Admin UI Change Specification = finalized Admin frontend change truth.**

All three documents should be used together during implementation.

**END OF SAREEVANTA V1 ADMIN UI CHANGE SPECIFICATION**
