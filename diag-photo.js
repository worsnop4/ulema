/**
 * Diagnostic script: test full photo save flow
 * 1. Test Storage bucket upload
 * 2. Test invitations table update with photo URL
 * 3. Verify data was saved correctly
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

async function main() {
  console.log('=== STEP 1: Test Supabase Storage Upload ===');
  
  // Create a tiny test image (1x1 pixel red PNG)
  const tinyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const fileName = `test_photo_${Date.now()}.png`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('invitation-media')
    .upload(fileName, tinyPng, {
      contentType: 'image/png',
      upsert: false
    });
    
  if (uploadError) {
    console.error('❌ Storage upload GAGAL:', uploadError.message);
    console.error('   Code:', uploadError.statusCode || uploadError.code);
    if (uploadError.message?.includes('Bucket not found')) {
      console.error('   → Bucket "invitation-media" TIDAK ADA di Supabase!');
    }
  } else {
    console.log('✅ Storage upload berhasil:', uploadData.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('invitation-media')
      .getPublicUrl(fileName);
    console.log('   Public URL:', publicUrl);
    
    // Step 2: Test update invitations table with photo URL
    console.log('\n=== STEP 2: Test Update invitations row dengan photo URL ===');
    
    const { data: demoRow } = await supabase
      .from('invitations')
      .select('id, data')
      .eq('data->>slug', 'demo-theme-1')
      .maybeSingle();
      
    if (!demoRow) {
      console.error('❌ Row demo-theme-1 tidak ditemukan!');
      return;
    }
    
    console.log(`Ditemukan row ID: ${demoRow.id}`);
    
    const testUpdateData = {
      ...demoRow.data,
      meta: {
        ...(demoRow.data?.meta || {}),
        coverPhoto: publicUrl,
        testTimestamp: Date.now()
      }
    };
    
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        theme_id: 1,
        groom_name: 'TestGroom',
        bride_name: 'TestBride',
        data: testUpdateData,
        user_id: null
      })
      .eq('id', demoRow.id);
      
    if (updateError) {
      console.error('❌ Update invitations GAGAL:', updateError.message);
      console.error('   Code:', updateError.code);
    } else {
      console.log('✅ Update invitations berhasil!');
      
      // Step 3: Verify
      console.log('\n=== STEP 3: Verifikasi data tersimpan ===');
      const { data: verifyRow } = await supabase
        .from('invitations')
        .select('data')
        .eq('id', demoRow.id)
        .single();
        
      const savedPhoto = verifyRow?.data?.meta?.coverPhoto;
      if (savedPhoto === publicUrl) {
        console.log('✅ VERIFIKASI OK: photo URL tersimpan dengan benar');
        console.log('   Saved URL:', savedPhoto);
      } else {
        console.error('❌ VERIFIKASI GAGAL: photo URL tidak tersimpan');
        console.log('   Expected:', publicUrl);
        console.log('   Got:', savedPhoto);
      }
      
      // Clean up: reset the test data
      await supabase.from('invitations').update({
        data: demoRow.data,
        groom_name: 'Groom',
        bride_name: 'Bride'
      }).eq('id', demoRow.id);
      console.log('\n(Data test sudah di-reset)');
    }
    
    // Clean up storage
    await supabase.storage.from('invitation-media').remove([fileName]);
    console.log('(File test di Storage sudah dihapus)');
  }
  
  console.log('\n=== STEP 4: Cek struktur invitations row saat ini ===');
  const { data: currentRows } = await supabase
    .from('invitations')
    .select('id, theme_id, data->>slug, data->meta')
    .like('data->>slug', 'demo-theme-%')
    .order('theme_id');
    
  currentRows?.forEach(row => {
    const meta = row['data->meta'] ? JSON.parse(row['data->meta']) : {};
    console.log(`\ndemo-theme-${row.theme_id}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  meta.coverPhoto: ${meta.coverPhoto || '(kosong)'}`);
    console.log(`  meta.photo: ${meta.photo || '(kosong)'}`);
  });
}

main().catch(console.error);
