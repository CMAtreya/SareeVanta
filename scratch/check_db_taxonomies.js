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

async function checkTaxonomies() {
  console.log('=== CHECKING ALL TAXONOMY TABLES IN SUPABASE ===\n');

  const { data: weavings } = await supabase.from('weavings').select('*');
  console.log('WEAVINGS IN DB:', weavings);

  const { data: fabrics } = await supabase.from('fabrics').select('*');
  console.log('\nFABRICS IN DB:', fabrics);

  const { data: occasions } = await supabase.from('occasions').select('*');
  console.log('\nOCCASIONS IN DB:', occasions);

  const { data: motifs } = await supabase.from('motifs').select('*');
  console.log('\nMOTIFS IN DB:', motifs);

  const { data: zari } = await supabase.from('zari_specifications').select('*');
  console.log('\nZARI SPECIFICATIONS IN DB:', zari);
}

checkTaxonomies();
