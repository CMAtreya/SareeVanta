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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkMediaSizes() {
  const { data: media } = await supabase.from('product_variant_media').select('id, variant_id, url');
  if (media) {
    console.log(`Checking ${media.length} media records...`);
    media.forEach((m) => {
      if (m.url && m.url.startsWith('data:')) {
        console.log(`[BASE64 DETECTED] Media ID ${m.id} length: ${m.url.length} chars (~${Math.round(m.url.length / 1024)} KB)`);
      } else {
        console.log(`[CLEAN URL] Media ID ${m.id} length: ${m.url?.length || 0} chars`);
      }
    });
  }
}

checkMediaSizes().catch(console.error);
