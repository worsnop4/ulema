-- Tarif komisi per akun.
--
-- Sebelum ini tarif komisi adalah satu angka global 20% yang hidup di
-- api/midtrans/notification.js. Vendor pernikahan membawa penjualan berulang
-- dan butuh tarif jauh lebih besar daripada pengguna biasa yang sesekali
-- membagikan tautannya, jadi tarifnya dipindah ke baris profil.
--
-- NULL berarti "pakai default". Dengan begitu seluruh pengguna yang sudah ada
-- tidak berubah sama sekali dan tidak ada backfill yang perlu dijalankan.

alter table public.profiles
  add column if not exists commission_rate numeric(4,3);

comment on column public.profiles.commission_rate is
  'Tarif komisi referral akun ini sebagai pecahan (0.400 = 40%). NULL = pakai default 20% di kode. Diisi hanya untuk akun vendor.';

-- Pagar salah ketik. Menulis 40 alih-alih 0.40 berarti membayar komisi 4000%
-- dari nilai transaksi. Batas ini membuat kesalahan itu gagal saat ditulis,
-- bukan ketahuan setelah uangnya keluar.
alter table public.profiles
  drop constraint if exists profiles_commission_rate_range;
alter table public.profiles
  add constraint profiles_commission_rate_range
  check (commission_rate is null or (commission_rate >= 0 and commission_rate <= 1));

-- commission_rate menentukan uang, jadi ia tidak boleh bisa ditulis dari
-- browser. Tidak ada satu pun layar klien yang perlu mengubahnya: akun vendor
-- dibuat admin, dan tarifnya ditetapkan admin.
--
-- auth.uid() bernilai NULL saat perintah dijalankan dari SQL editor atau
-- dengan service role, dan justru lewat jalur itulah kamu menetapkan tarif
-- vendor -- jadi jalur itu dibiarkan lewat. Yang dijaga adalah permintaan
-- dari browser yang sudah login: ia wajib admin.
create or replace function public.guard_commission_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.commission_rate is distinct from old.commission_rate
     and auth.uid() is not null
     and not exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'admin'
     )
  then
    raise exception 'commission_rate hanya boleh diubah oleh admin';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_commission_rate on public.profiles;
create trigger trg_guard_commission_rate
  before update on public.profiles
  for each row execute function public.guard_commission_rate();
