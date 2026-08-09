-- Close an open write hole on `musics`.
--
-- The live policy was "Enable all access for all users" FOR ALL — so any
-- anonymous visitor could INSERT, UPDATE or DELETE rows, not just read them.
-- Anyone could wipe the music list every invitation picks from. Note this hole
-- is independent of the leaked service_role key: the policy permits it, so
-- rotating keys alone does not close it.
--
-- Reads stay public (the track list is not secret, and the editor's music
-- picker fetches it), writes become admin-only. Mirrors the shape already used
-- for `themes` (20260718) and `pricing` (20260714).
alter table musics enable row level security;

drop policy if exists "Enable all access for all users" on musics;

drop policy if exists "Public can read musics" on musics;
create policy "Public can read musics" on musics for select using (true);

drop policy if exists "Admins manage musics" on musics;
create policy "Admins manage musics" on musics for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
