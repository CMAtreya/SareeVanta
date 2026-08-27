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
