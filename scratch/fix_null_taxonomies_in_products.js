const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductTaxonomies() {
  console.log('=== LINKING ALL NULL PRODUCT TAXONOMIES IN SUPABASE ===\n');

  // Get taxonomy IDs
  const { data: weavings } = await supabase.from('weavings').select('*');
  const { data: fabrics } = await supabase.from('fabrics').select('*');
  const { data: occasions } = await supabase.from('occasions').select('*');
  const { data: zariSpecs } = await supabase.from('zari_specifications').select('*');

  const defaultWeaveId = weavings?.[0]?.id;
  const defaultFabricId = fabrics?.[0]?.id;
  const defaultOccasionId = occasions?.[0]?.id;
  const defaultZariId = zariSpecs?.[0]?.id;

  const { data: products } = await supabase.from('products').select('*');

  for (const p of products || []) {
    let weaveId = defaultWeaveId;
    let fabricId = defaultFabricId;
    let occasionId = defaultOccasionId;
    let zariId = defaultZariId;

    const lowerTitle = (p.title || '').toLowerCase();

    if (lowerTitle.includes('kanchipuram')) {
      const w = weavings?.find((x) => x.name.toLowerCase().includes('kanchipuram'));
      if (w) weaveId = w.id;
    } else if (lowerTitle.includes('banarasi') || lowerTitle.includes('varanasi')) {
      const w = weavings?.find((x) => x.name.toLowerCase().includes('banarasi'));
      if (w) weaveId = w.id;
    }

    if (lowerTitle.includes('katan')) {
      const f = fabrics?.find((x) => x.name.toLowerCase().includes('katan'));
      if (f) fabricId = f.id;
    } else if (lowerTitle.includes('organza')) {
      const f = fabrics?.find((x) => x.name.toLowerCase().includes('organza'));
      if (f) fabricId = f.id;
    }

    const { error } = await supabase
      .from('products')
      .update({
        weaving_id: p.weaving_id || weaveId,
        fabric_id: p.fabric_id || fabricId,
        occasion_id: p.occasion_id || occasionId,
        zari_specification_id: p.zari_specification_id || zariId,
      })
      .eq('id', p.id);

    if (error) {
      console.error(`Failed to update ${p.title}:`, error.message);
    } else {
      console.log(`✓ Fixed taxonomies for: ${p.title}`);
    }
  }

  console.log('\n=== DONE FIXING PRODUCT TAXONOMIES ===');
}

fixProductTaxonomies();
