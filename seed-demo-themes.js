/**
 * seed-demo-themes.js
 * Script untuk upsert semua row demo-theme-1 s/d demo-theme-9 ke Supabase.
 * Dijalankan sekali. Aman dijalankan berulang (upsert on conflict).
 */
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

const DEFAULT_THEMES = [
  { id: 1, name: 'Classic Elegance', emoji: '🌿', layout: 'watercolor-floral', colors: ['#134e4a', '#d4a96a', '#faf7f2'], category: 'Special' },
  { id: 2, name: 'Rose Garden', emoji: '🌹', layout: 'watercolor-floral', colors: ['#881337', '#fda4af', '#fff1f2'], category: 'Special' },
  { id: 3, name: 'Midnight Gold', emoji: '✨', layout: 'dark-luxury', colors: ['#1c1917', '#d4a96a', '#faf7f2'], category: 'Luxury' },
  { id: 4, name: 'Ivory Dream', emoji: '🕊️', layout: 'modern-minimalist', colors: ['#4b5563', '#d4b896', '#fdfaf6'], category: 'Special' },
  { id: 5, name: 'Lavender Bliss', emoji: '💜', layout: 'playful-illustrative', colors: ['#4c1d95', '#c4b5fd', '#f5f3ff'], category: 'Motion' },
  { id: 6, name: 'Tropical Breeze', emoji: '🌺', layout: 'traditional-adat', colors: ['#064e3b', '#6ee7b7', '#f0fdf4'], category: 'Adat' },
  { id: 7, name: 'Autumn Florals', emoji: '🍃', layout: 'special-001', colors: ['#6b705c', '#d4a373', '#fefae0'], category: 'Special' },
  { id: 8, name: 'Aestetic Grey', emoji: '🩶', layout: 'special-002', colors: ['#4b5563', '#9ca3af', '#f3f4f6'], category: 'Special' },
  { id: 9, name: 'Elegant Person', emoji: '🌸', layout: 'special-003', colors: ['#6b705c', '#d4a373', '#fefae0'], category: 'Special' },
];

const defaultInvitationData = {
  slug: '',
  themeId: 1,
  theme: 'classic',
  groom: { name: '', nickname: '', photo: null, instagram: '', father: '', mother: '' },
  bride: { name: '', nickname: '', photo: null, instagram: '', father: '', mother: '' },
  events: [],
  loveStory: [],
  quote: '',
  countdownEnabled: false,
  music: true,
  dresscode: { color: '', name: '', notes: '' },
  accounts: [],
  meta: { title: '', desc: '', photo: null, coverPhoto: null, footerPhoto: null, coverStyle: 'circle' },
  rsvps: [],
  guests: [],
  customColors: null,
};

async function main() {
  console.log('=== Seeding Demo Theme Rows ===\n');

  for (const theme of DEFAULT_THEMES) {
    const slug = `demo-theme-${theme.id}`;
    const demoData = {
      ...defaultInvitationData,
      slug,
      themeId: theme.id,
    };

    const payload = {
      theme_id: theme.id,
      groom_name: 'Groom',
      bride_name: 'Bride',
      // user_id = null → row publik, tidak milik user manapun
      user_id: null,
      data: demoData,
    };

    // Cek dulu apakah row sudah ada
    const { data: existing } = await supabase
      .from('invitations')
      .select('id, data')
      .eq('data->>slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`✅ [SKIP]   demo-theme-${theme.id} sudah ada (ID: ${existing.id})`);
      continue;
    }

    // Insert row baru
    const { data: newRow, error } = await supabase
      .from('invitations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(`❌ [ERROR]  demo-theme-${theme.id}: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`🆕 [INSERT] demo-theme-${theme.id} berhasil dibuat (ID: ${newRow.id})`);
    }
  }

  console.log('\n=== Selesai ===');

  // Verifikasi final
  const { data: allDemo } = await supabase
    .from('invitations')
    .select('id, theme_id, data->>slug')
    .like('data->>slug', 'demo-theme-%')
    .order('theme_id', { ascending: true });

  console.log(`\nTotal demo rows di DB: ${allDemo?.length ?? 0}`);
  allDemo?.forEach(r => console.log(`  • ID: ${r.id}, slug: ${r.slug}`));
}

main();
