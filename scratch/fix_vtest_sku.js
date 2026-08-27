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

async function fixVtestSku() {
  console.log('=== FIXING V-TEST SKU IN SUPABASE ===\n');

  const { data: p } = await supabase.from('products').select('id, title').eq('slug', 'v-test').maybeSingle();
  if (p) {
    const { data: varData } = await supabase.from('product_variants').select('id, sku').eq('product_id', p.id);
    console.log('Existing variants for V-TEST:', varData);

    if (varData && varData.length > 0) {
      const newSku = 'NSH-SKU-MYS-09';
      const { error } = await supabase.from('product_variants').update({ sku: newSku }).eq('id', varData[0].id);
      if (error) {
        console.error('Error updating SKU:', error.message);
      } else {
        console.log(`✓ Updated V-TEST variant SKU to: ${newSku}`);
      }
    }
  }
}

fixVtestSku();
