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

async function migrate() {
  console.log('=== Migrating Demo Themes to Admin User ===');

  // 1. Find Admin user
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('role', 'admin')
    .limit(1);

  if (userError || !users || users.length === 0) {
    console.error('❌ Failed to find admin user in public.profiles table:', userError);
    return;
  }
  const adminId = users[0].id;
  console.log('✅ Found Admin User ID:', adminId);

  // 2. Delete old global demo themes (user_id IS NULL)
  const slugs = Array.from({ length: 9 }, (_, i) => `demo-theme-${i + 1}`);
  
  for (const slug of slugs) {
    const { error: delError } = await supabase
      .from('invitations')
      .delete()
      .eq('data->>slug', slug)
      .is('user_id', null);
      
    if (delError) {
      console.error(`❌ Failed to delete old ${slug}:`, delError);
    } else {
      console.log(`✅ Deleted old global ${slug}`);
    }
  }

  // 3. Upsert new demo themes with admin user_id
  const defaultInvitationData = {
    groom: { nickname: 'Groom', fullName: 'Groom Fullname', parents: 'Bapak & Ibu' },
    bride: { nickname: 'Bride', fullName: 'Bride Fullname', parents: 'Bapak & Ibu' },
    date: '2025-12-31',
    akad: { time: '08:00', venue: 'Masjid Agung', address: 'Jl. Masjid Agung No. 1' },
    resepsi: { time: '11:00', venue: 'Gedung Serbaguna', address: 'Jl. Gedung Serbaguna No. 2' },
    themeId: 1,
    gallery: [],
    videoUrl: '',
    musicUrl: '',
    quotes: { text: 'Dan di antara tanda-tanda kekuasaan-Nya...', source: 'Ar-Rum: 21' },
    loveStory: [],
    liveStream: { platform: 'YouTube', url: '' },
    rekening: [],
    gifts: { physicalAddress: '' },
    fonts: { heading: 'Playfair Display', body: 'Inter' }
  };

  for (let i = 1; i <= 9; i++) {
    const slug = `demo-theme-${i}`;
    const payload = {
      theme_id: i,
      groom_name: 'Groom',
      bride_name: 'Bride',
      user_id: adminId,
      data: {
        ...defaultInvitationData,
        themeId: i,
        slug: slug,
      }
    };

    // Try to update if exists (owned by admin), else insert
    const { data: existing } = await supabase
      .from('invitations')
      .select('id')
      .eq('data->>slug', slug)
      .eq('user_id', adminId)
      .maybeSingle();

    if (existing) {
      const { error: upError } = await supabase
        .from('invitations')
        .update(payload)
        .eq('id', existing.id);
      if (upError) console.error(`❌ Failed to update ${slug}:`, upError);
      else console.log(`✅ Updated ${slug}`);
    } else {
      const { error: inError } = await supabase
        .from('invitations')
        .insert(payload);
      if (inError) console.error(`❌ Failed to insert ${slug}:`, inError);
      else console.log(`✅ Inserted ${slug}`);
    }
  }
  
  console.log('=== Migration Complete ===');
}

migrate();
