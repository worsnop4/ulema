-- Penarikan komisi: saldo terpotong saat admin mentransfer, bukan saat diminta.
--
-- Sebelumnya saldo langsung dipotong begitu vendor menekan "tarik". Dari sisi
-- vendor itu terasa seperti uangnya hilang sebelum apa pun terjadi, dan kalau
-- permintaannya ditolak saldonya harus dikembalikan -- satu langkah lagi yang
-- bisa gagal diam-diam. Sekarang saldonya utuh sampai admin benar-benar
-- mentransfer dan mengunggah buktinya.
--
-- Konsekuensinya harus ditangani: kalau saldo tidak dipotong saat diminta,
-- vendor bisa mengirim sepuluh permintaan atas saldo yang sama. Karena itu
-- yang dipagari bukan lagi saldo, melainkan "saldo dikurangi yang sedang
-- diproses".

-- ── 1. Rekening tujuan, disimpan di profil ─────────────────────────────────
-- Supaya admin tidak perlu menanyakannya tiap kali, dan vendor tidak perlu
-- mengetiknya ulang tiap penarikan.
alter table public.profiles add column if not exists bank_name           text;
alter table public.profiles add column if not exists bank_account_number text;
alter table public.profiles add column if not exists bank_account_name   text;

comment on column public.profiles.bank_account_name is
  'Nama pemilik rekening. Bisa berbeda dari profiles.name, dan yang dipakai bank adalah yang ini.';

-- ── 2. Bukti transfer ──────────────────────────────────────────────────────
-- Menyimpan lintasan berkas, bukan URL publik: bucketnya memang tidak publik.
alter table public.withdrawals add column if not exists proof_path text;

comment on column public.withdrawals.proof_path is
  'Lintasan di bucket withdrawal-proofs, bukan URL. Dibuka lewat signed URL karena buktinya memuat nominal dan nomor rekening.';

-- Bukti transfer memuat nominal dan nomor rekening. Bucket ini sengaja tidak
-- publik -- nama berkas yang sulit ditebak bukan pengaman untuk dokumen
-- keuangan. Yang boleh membaca hanya adminnya dan vendor pemilik penarikan.
insert into storage.buckets (id, name, public)
values ('withdrawal-proofs', 'withdrawal-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Admin manages withdrawal proofs" on storage.objects;
create policy "Admin manages withdrawal proofs" on storage.objects
  for all to authenticated using (
    bucket_id = 'withdrawal-proofs'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    bucket_id = 'withdrawal-proofs'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Vendor hanya membaca, dan hanya dari foldernya sendiri.
drop policy if exists "Owner reads own withdrawal proof" on storage.objects;
create policy "Owner reads own withdrawal proof" on storage.objects
  for select to authenticated using (
    bucket_id = 'withdrawal-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 3. Meminta penarikan: mencatat, tidak memotong ─────────────────────────
create or replace function public.request_withdrawal(
  p_amount         numeric,
  p_method         text,
  p_account_number text,
  p_account_name   text
)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_pending numeric;
  v_row     public.withdrawals;
begin
  if auth.uid() is null then
    raise exception 'Harus login untuk menarik komisi';
  end if;

  if coalesce(btrim(p_account_number), '') = '' or coalesce(btrim(p_account_name), '') = '' then
    raise exception 'Nomor rekening dan nama pemilik rekening harus diisi';
  end if;

  -- Cerminan REFERRAL_MIN_WITHDRAWAL di src/config/constants.js. Validasi di
  -- klien bukan validasi -- angkanya harus dipagari di sisi server juga.
  if p_amount < 50000 then
    raise exception 'Minimal penarikan adalah Rp50.000';
  end if;

  -- Kunci baris profil sampai transaksi selesai. Saldonya memang tidak diubah
  -- di sini, tapi kuncinya tetap perlu: ia yang membuat dua permintaan
  -- bersamaan mengantre, sehingga keduanya tidak bisa lolos pemeriksaan
  -- "sisa yang bisa ditarik" atas saldo yang sama.
  select wallet_balance into v_balance
  from public.profiles where id = auth.uid()
  for update;

  -- Yang sedang diproses ikut dihitung. Tanpa ini vendor bisa mengirim
  -- sepuluh permintaan atas satu saldo dan admin membayar sepuluh kali.
  select coalesce(sum(amount), 0) into v_pending
  from public.withdrawals
  where user_id = auth.uid() and status not in ('paid', 'rejected');

  if coalesce(v_balance, 0) - v_pending < p_amount then
    raise exception 'Saldo yang bisa ditarik tidak mencukupi. Tersedia Rp%, sedang diproses Rp%.',
      trunc(coalesce(v_balance, 0) - v_pending), trunc(v_pending);
  end if;

  insert into public.withdrawals
    (user_id, amount, payment_method, account_number, account_name, status)
  values
    (auth.uid(), p_amount, p_method, btrim(p_account_number), btrim(p_account_name), 'pending')
  returning * into v_row;

  return v_row;
end;
$$;

-- ── 4. Admin menyelesaikan: di sinilah saldo terpotong ─────────────────────
create or replace function public.settle_withdrawal(
  p_id         uuid,
  p_proof_path text,
  p_note       text default null
)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     public.withdrawals;
  v_balance numeric;
begin
  if auth.uid() is not null
     and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  then
    raise exception 'Hanya admin yang boleh menyelesaikan penarikan.';
  end if;

  if coalesce(btrim(p_proof_path), '') = '' then
    raise exception 'Bukti transfer wajib diunggah.';
  end if;

  -- Kunci barisnya dulu. Dua admin yang menekan tombol bersamaan akan
  -- mengantre, dan yang kedua menemukan statusnya sudah 'paid' -- tanpa ini
  -- saldo vendor bisa terpotong dua kali untuk satu transfer.
  select * into v_row from public.withdrawals where id = p_id for update;
  if v_row.id is null then
    raise exception 'Permintaan penarikan tidak ditemukan.';
  end if;
  if v_row.status = 'paid' then
    raise exception 'Penarikan ini sudah ditandai lunas.';
  end if;
  if v_row.status = 'rejected' then
    raise exception 'Penarikan ini sudah ditolak.';
  end if;

  select wallet_balance into v_balance
  from public.profiles where id = v_row.user_id
  for update;

  if coalesce(v_balance, 0) < v_row.amount then
    raise exception 'Saldo vendor tidak mencukupi (Rp%), penarikan Rp%.',
      trunc(coalesce(v_balance, 0)), trunc(v_row.amount);
  end if;

  -- Beri tahu trigger penjaga bahwa penulisan saldo ini sah. Flag-nya lokal
  -- ke transaksi, jadi ia hilang sendiri begitu transaksi selesai.
  perform set_config('app.wallet_write', 'on', true);

  update public.profiles
     set wallet_balance = wallet_balance - v_row.amount
   where id = v_row.user_id;

  update public.withdrawals
     set status = 'paid',
         proof_path = btrim(p_proof_path),
         admin_note = coalesce(nullif(btrim(p_note), ''), admin_note),
         processed_at = now()
   where id = p_id
  returning * into v_row;

  return v_row;
end;
$$;

-- ── 5. Admin menolak: tidak ada yang perlu dikembalikan ────────────────────
-- Justru inilah untungnya memotong belakangan: penolakan tidak menyentuh
-- saldo sama sekali, jadi tidak ada langkah pengembalian yang bisa gagal.
create or replace function public.reject_withdrawal(
  p_id   uuid,
  p_note text default null
)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.withdrawals;
begin
  if auth.uid() is not null
     and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  then
    raise exception 'Hanya admin yang boleh menolak penarikan.';
  end if;

  select * into v_row from public.withdrawals where id = p_id for update;
  if v_row.id is null then
    raise exception 'Permintaan penarikan tidak ditemukan.';
  end if;
  if v_row.status = 'paid' then
    raise exception 'Penarikan ini sudah lunas dan tidak bisa ditolak.';
  end if;

  update public.withdrawals
     set status = 'rejected',
         admin_note = coalesce(nullif(btrim(p_note), ''), admin_note),
         processed_at = now()
   where id = p_id
  returning * into v_row;

  return v_row;
end;
$$;

-- ── 6. Riwayat referral dengan nama depan pembeli ──────────────────────────
-- RLS profiles hanya mengizinkan seseorang membaca barisnya sendiri, jadi
-- sambungan langsung dari klien selalu pulang kosong dan layar menulis
-- "User Baru - N/A" selamanya. Fungsi ini membuka secukupnya: nama depan
-- saja. Email dan nama lengkap pembeli tetap tidak terjangkau vendor.
create or replace function public.get_referral_history()
returns table (
  commission_amount numeric,
  status            text,
  created_at        timestamptz,
  buyer_name        text
)
language sql
security definer
set search_path = public
as $$
  select h.commission_amount,
         h.status,
         h.created_at,
         nullif(split_part(btrim(coalesce(p.name, '')), ' ', 1), '')
  from public.referral_history h
  left join public.profiles p on p.id = h.referred_user_id
  where h.referrer_id = auth.uid()
  order by h.created_at desc;
$$;

revoke all on function public.settle_withdrawal(uuid, text, text) from public, anon;
revoke all on function public.reject_withdrawal(uuid, text)        from public, anon;
revoke all on function public.get_referral_history()               from public, anon;
grant execute on function public.settle_withdrawal(uuid, text, text) to authenticated;
grant execute on function public.reject_withdrawal(uuid, text)       to authenticated;
grant execute on function public.get_referral_history()              to authenticated;
