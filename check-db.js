import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('invitations').select('*').like('data->>slug', 'demo-theme-%');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Demo themes found:", data.length);
    data.forEach(row => {
      console.log(`- ID: ${row.id}, Theme ID: ${row.theme_id}, Slug: ${row.data.slug}`);
      console.log(`  Groom: ${row.data.groom?.nickname}, Bride: ${row.data.bride?.nickname}`);
    });
  }
}

main();
