-- Alur penarikan komisi: status, riwayat, dan penutupan celah saldo.
--
-- Sebelum ini ReferralPage menyisipkan baris ke withdrawals lalu menjalankan
-- "update profiles set wallet_balance = 0" LANGSUNG DARI BROWSER, dan tidak
-- pernah membaca balik tabel withdrawals. Akibatnya dua hal:
--
--   1. Vendor menekan tarik, saldonya jadi Rp0, dan tidak ada jejak apa pun
--      bahwa ia pernah meminta. Antara permintaan dan transfer manual admin,
--      layarnya menunjukkan nol dan nihil.
--   2. Kalau policy RLS profiles mengizinkan pemilik menulis barisnya sendiri
--      tanpa membatasi kolom, pengguna bisa menulis wallet_balance ke angka
--      berapa pun lalu menariknya.
--
-- Keduanya ditutup di sini: seluruh transisi saldo pindah ke satu RPC
-- security definer yang atomik, dan kolom saldo dijaga trigger.

-- ── 1. Status penarikan ────────────────────────────────────────────────────
-- Baris yang sudah ada (kalau ada) akan jatuh ke 'pending'. Kalau kamu sudah
-- pernah mentransfer sebuah penarikan sebelum migrasi ini, tandai manual:
--   update withdrawals set status = 'paid', processed_at = now() where id = ...;
alter table public.withdrawals
  add column if not exists status text not null default 'pending';
alter table public.withdrawals
  add column if not exists processed_at timestamptz;
alter table public.withdrawals
  add column if not exists admin_note text;

alter table public.withdrawals
  drop constraint if exists withdrawals_status_check;
alter table public.withdrawals
  add constraint withdrawals_status_check
  check (status in ('pending', 'processing', 'paid', 'rejected'));

create index if not exists withdrawals_user_created_idx
  on public.withdrawals (user_id, created_at desc);

-- ── 2. RLS: pemilik membaca miliknya, admin membaca & mengubah semua ───────
-- Butir terbuka nomor 5 di CLAUDE.md: withdrawals belum punya policy admin,
-- jadi layar persetujuan admin tidak akan membaca apa pun.
alter table public.withdrawals enable row level security;

-- Tabel ini dibuat manual di luar repo, jadi policy lamanya tidak diketahui.
-- Kalau masih ada policy INSERT untuk klien, pengguna bisa menyisipkan
-- permintaan penarikan bernilai berapa pun TANPA saldonya terpotong -- dan
-- permintaan itu akan muncul di antrean admin seolah sah. Semua policy
-- INSERT/ALL dicabut; satu-satunya jalan masuk adalah RPC di bawah.
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'withdrawals' and cmd in ('INSERT', 'ALL')
  loop
    execute format('drop policy %I on public.withdrawals', r.policyname);
  end loop;
end $$;

drop policy if exists "Users read own withdrawals" on public.withdrawals;
create policy "Users read own withdrawals" on public.withdrawals
  for select using (user_id = auth.uid());

drop policy if exists "Admins read all withdrawals" on public.withdrawals;
create policy "Admins read all withdrawals" on public.withdrawals
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Admins update withdrawals" on public.withdrawals;
create policy "Admins update withdrawals" on public.withdrawals
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Tidak ada policy INSERT untuk klien: penarikan hanya lahir lewat RPC di
-- bawah, supaya saldo dan barisnya tidak pernah bisa berbeda.

-- ── 3. Penarikan atomik ────────────────────────────────────────────────────
-- Saldo dipotong saat permintaan dibuat, bukan saat admin mentransfer. Itu
-- disengaja: tanpa pemotongan, vendor bisa menekan tarik dua kali untuk saldo
-- yang sama. Uangnya tidak hilang -- ia pindah menjadi baris 'pending' yang
-- sekarang benar-benar terlihat oleh vendor.
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
  v_row     public.withdrawals;
begin
  if auth.uid() is null then
    raise exception 'Harus login untuk menarik komisi';
  end if;

  -- Cerminan REFERRAL_MIN_WITHDRAWAL di src/config/constants.js. Validasi di
  -- klien bukan validasi -- angkanya harus dipagari di sisi server juga.
  if p_amount < 50000 then
    raise exception 'Minimal penarikan adalah Rp50.000';
  end if;

  -- Kunci baris profil sampai transaksi selesai, supaya dua permintaan yang
  -- datang bersamaan tidak bisa menarik saldo yang sama dua kali.
  select wallet_balance into v_balance
  from public.profiles where id = auth.uid()
  for update;

  if coalesce(v_balance, 0) < p_amount then
    raise exception 'Saldo tidak mencukupi';
  end if;

  -- Beri tahu trigger penjaga bahwa penulisan saldo ini sah. Flag-nya lokal
  -- ke transaksi, jadi ia hilang sendiri begitu transaksi selesai.
  perform set_config('app.wallet_write', 'on', true);

  update public.profiles
    set wallet_balance = wallet_balance - p_amount
    where id = auth.uid();

  insert into public.withdrawals
    (user_id, amount, payment_method, account_number, account_name, status)
  values
    (auth.uid(), p_amount, p_method, p_account_number, p_account_name, 'pending')
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.request_withdrawal(numeric, text, text, text) from public, anon;
grant execute on function public.request_withdrawal(numeric, text, text, text) to authenticated;

-- ── 4. Penjaga kolom saldo ─────────────────────────────────────────────────
-- Setelah RPC di atas ada, tidak satu pun layar klien yang perlu menulis
-- wallet_balance. Yang boleh lewat cuma tiga: webhook pembayaran (service
-- role, auth.uid() NULL), admin yang melepas komisi dari AdminTransactions,
-- dan RPC di atas lewat flag transaksinya sendiri.
create or replace function public.guard_wallet_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.wallet_balance is distinct from old.wallet_balance
     and auth.uid() is not null
     and coalesce(current_setting('app.wallet_write', true), '') <> 'on'
     and not exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'admin'
     )
  then
    raise exception 'wallet_balance tidak boleh diubah langsung dari klien';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_wallet_balance on public.profiles;
create trigger trg_guard_wallet_balance
  before update on public.profiles
  for each row execute function public.guard_wallet_balance();
