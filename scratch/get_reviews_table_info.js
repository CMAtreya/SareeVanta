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

async function inspectColumns() {
  console.log('=== INSPECTING PUBLIC.REVIEWS COLUMNS ===\n');

  const { data, error } = await supabase.from('reviews').insert([{ rating: 5 }]).select();
  if (error) {
    console.log('Error output (shows column names):', error.message);
  } else {
    console.log('Inserted dummy row keys:', Object.keys(data[0]));
    await supabase.from('reviews').delete().eq('id', data[0].id);
  }
}

inspectColumns();
