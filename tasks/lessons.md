# Lessons Learned & Prevention Rules

1. **PDP Image Containment vs Cover**:
   - **Mistake**: Using `object-cover` with fixed `aspect-[3/4]` or fixed container heights cut off the top/bottom of saree photos on PDP.
   - **Correction**: Use `object-contain` or natural aspect ratio scaling with `max-h-[650px] w-full flex items-center justify-center` so the entire saree image is visible from top to bottom without cropping.

2. **Multiple Variant Images Preservation**:
   - **Mistake**: `GET /api/products/[slug]` or `GET /api/admin/products` returned only the 1st image or did not preserve all uploaded variant images in `galleryImages`.
   - **Correction**: Always query and return ALL `product_variant_media` rows ordered by `display_order` ASC for all variants of a product. In PDP (`app/products/[slug]/page.tsx`), aggregate media across all variants into `galleryImages` so every uploaded image (Image 1, Image 2, Image 3) appears in the thumbnail strip!

3. **No Static Mock Fallbacks on Admin & Customer Pages**:
   - **Mistake**: Hardcoded mock arrays initialized in admin pages (e.g. `/admin/customerreviews`) or fallback objects returned from API endpoints instead of querying Supabase directly.
   - **Correction**: Connect every admin management page directly to Supabase REST/API endpoints. If database table is empty, render a clean, branded empty state banner—never display hardcoded fake mock records!

4. **Product Edit Form & Review Thumbnail Image Preservation**:
   - **Mistake**: `ProductEditorForm` checked static `products.find` first in edit mode, loading static Unsplash mock images and overwriting user uploaded photos upon save. In `GET /api/admin/reviews`, `product_variant_media` was not selected, causing review product thumbnails to render broken.
   - **Correction**: In form edit components, bypass static mock arrays completely and always fetch live product details, SKUs, and media from `/api/admin/products`. In review APIs, select `product_variant_media` and map `sareeImage` / `productImage` so thumbnails render clearly!

5. **Foreign Key & Schema Cache Verification**:
   - **Mistake**: Assuming direct table relationships (e.g. joining `products` directly on `reviews`), causing PostgREST schema cache errors and silently returning empty arrays.
   - **Correction**: Always verify foreign keys in PostgreSQL before writing nested queries (e.g. `reviews` -> `product_variants` -> `products`). Test the query against live data before finalizing.

6. **Zero Mock Defaults in Form State & Mandatory Skeleton Loaders**:
   - **Mistake**: Initializing component `useState` with mock dummy numbers (`18500`, `28000`) and omitting loading states during async edit fetching, which caused a 2-second flash of wrong data.
   - **Correction**: Initialize form inputs cleanly with empty strings/blank defaults. In edit mode, initialize `isLoading = true` and render a full skeleton loader until the real database record is loaded.

7. **Complete API Method Coverage (GET, POST, PATCH, DELETE)**:
   - **Mistake**: Providing only `POST` and `DELETE` on management endpoints, leaving `PATCH` unimplemented and causing edit/reorder requests to fail with 405.
   - **Correction**: Every management route must support all required CRUD methods (`GET`, `POST`, `PATCH`, `DELETE`) with proper request body validation and error handling.

8. **No Arbitrary Fixed-Width Truncation on User Data**:
   - **Mistake**: Using `truncate max-w-[170px]` on email and user detail fields, causing long real-world email addresses (`podarvishwasgowda@gmail.com`) to be cut off.
   - **Correction**: Never hardcode tight max-widths that truncate essential user data. Use responsive flex layouts, `break-all`, and `select-all` so full text is always visible and accessible.

