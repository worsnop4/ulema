import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const k = line.slice(0, idx).trim();
  const v = line.slice(idx + 1).trim();
  if (k === 'VITE_SUPABASE_URL') supabaseUrl = v;
  if (k === 'VITE_SUPABASE_ANON_KEY') supabaseKey = v;
});
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  const { data, error } = await supabase.from('profiles').select('phone').limit(1);
  console.log("Data:", data, "Error:", error);
}
check();
