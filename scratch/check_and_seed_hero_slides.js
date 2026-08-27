const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedHeroSlides() {
  console.log('=== CHECKING & SEEDING HERO SLIDES TABLE ===\n');

  const { data: slides, error } = await supabase.from('hero_slides').select('*');
  console.log('Existing Hero Slides in DB:', { count: slides?.length, error });

  if (!slides || slides.length === 0) {
    console.log('Seeding authentic hero slides into hero_slides table...');
    const defaultSlides = [
      {
        heading: 'Handcrafted Heritage Drapes of Royal Mysuru',
        tagline: 'Pure mulberry silk woven with authentic tested 24K pure gold zari from our master handlooms.',
        badge_text: 'ROYAL HERITAGE ATELIER',
        cta_text: 'Explore Royal Looms',
        desktop_image_path: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
        mobile_image_path: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
        display_order: 1,
        is_active: true
      },
      {
        heading: 'Bridal Kanjivaram Korvai Weaves',
        tagline: 'Timeless temple border traditions handwoven with unyielding devotion by third-generation master weavers.',
        badge_text: 'BRIDAL MASTERPIECES',
        cta_text: 'View Bridal Collection',
        desktop_image_path: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85',
        mobile_image_path: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
        display_order: 2,
        is_active: true
      },
      {
        heading: 'Banarasi Brocade & Tanchoi Splendor',
        tagline: 'Intricate floral jaal and antique gold zari hand-loomed over months of artisanal perfection.',
        badge_text: 'VARANASI ATELIER',
        cta_text: 'Discover Banarasi',
        desktop_image_path: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=85',
        mobile_image_path: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
        display_order: 3,
        is_active: true
      }
    ];

    const { data: inserted, error: insertErr } = await supabase.from('hero_slides').insert(defaultSlides).select('*');
    console.log('Inserted Slides Result:', { count: inserted?.length, error: insertErr });
  }
}

seedHeroSlides();
