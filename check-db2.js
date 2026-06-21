import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k === 'VITE_SUPABASE_URL') supabaseUrl = v?.trim();
  if (k === 'VITE_SUPABASE_ANON_KEY') supabaseKey = v?.trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('=== Checking all demo theme rows ===');
  const { data, error } = await supabase.from('invitations').select('*');
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log('Total rows in invitations table:', data.length);
  data.forEach(row => {
    const slug = row.data?.slug || '(no slug)';
    console.log(`\nRow ID: ${row.id}`);
    console.log(`  slug field: ${slug}`);
    console.log(`  theme_id: ${row.theme_id}`);
    console.log(`  user_id: ${row.user_id}`);
    console.log(`  groom_nickname: ${row.data?.groom?.nickname}`);
    console.log(`  bride_nickname: ${row.data?.bride?.nickname}`);
  });

  // Also check if service_role allows UPDATE
  console.log('\n=== Testing UPDATE to demo-theme-3 row ===');
  const { data: demoRow } = await supabase.from('invitations').select('*').like('data->>slug', 'demo-theme-%').single();
  if (demoRow) {
    console.log(`Found demo row ID: ${demoRow.id}`);
    const testData = { ...demoRow.data, testField: 'test_' + Date.now() };
    const { error: updateErr } = await supabase.from('invitations').update({ data: testData }).eq('id', demoRow.id);
    if (updateErr) {
      console.error('UPDATE FAILED:', updateErr);
    } else {
      console.log('UPDATE SUCCESS - verify testField was saved');
      // Read it back
      const { data: verifyRow } = await supabase.from('invitations').select('data').eq('id', demoRow.id).single();
      console.log('testField after update:', verifyRow?.data?.testField);
    }
  } else {
    console.log('No demo row found');
  }
}

main();
