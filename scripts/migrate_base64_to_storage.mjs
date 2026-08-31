import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrateBase64Images() {
  console.log('[Image Migration] Scanning for base64 images in product_variant_media...');

  const { data: mediaList, error } = await supabase
    .from('product_variant_media')
    .select('id, variant_id, url');

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  const bucketName = 'products';
  // Ensure bucket exists
  try {
    await supabase.storage.createBucket(bucketName, { public: true });
  } catch (e) {}

  let convertedCount = 0;

  for (const m of mediaList) {
    if (m.url && m.url.startsWith('data:image/')) {
      try {
        const matches = m.url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) continue;

        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = contentType.split('/')[1] || 'jpg';
        const filePath = `variants/migrated_${m.id}_${Date.now()}.${ext}`;

        console.log(`Uploading media ID ${m.id} (${Math.round(buffer.length / 1024)} KB) to Supabase storage...`);

        const { error: upErr } = await supabase.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType,
            upsert: true,
          });

        if (upErr) {
          console.error(`Upload error for ${m.id}:`, upErr.message);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const cleanUrl = publicUrlData.publicUrl;

        await supabase
          .from('product_variant_media')
          .update({ url: cleanUrl })
          .eq('id', m.id);

        console.log(`  ✓ Updated media ${m.id} to clean Supabase URL: ${cleanUrl}`);
        convertedCount++;
      } catch (err) {
        console.error(`Error processing ${m.id}:`, err);
      }
    }
  }

  console.log(`\n[Image Migration] Finished! Converted ${convertedCount} base64 images to Supabase Storage public URLs.`);
}

migrateBase64Images().catch(console.error);
