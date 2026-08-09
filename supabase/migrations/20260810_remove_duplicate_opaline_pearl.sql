-- Remove the duplicate "Opaline Pearl" row that made the theme appear twice
-- in the landing catalog.
--
-- How it got there: 20260802_add_opaline_pearl_theme.sql was edited in the
-- working tree so its INSERT targeted id 30 instead of 20, then re-run. The
-- migration is idempotent only on its primary key, so a changed id inserts a
-- second row rather than updating the first — the table ended up with both.
--
-- Id 20 is the canonical one and must be the survivor:
--   * src/data/defaultData.js seeds Opaline Pearl as id 20
--   * the demo invitation is seeded at slug `demo-theme-20`
-- That is exactly why the duplicate rendered empty: /invite/demo?theme=30
-- resolves to `demo-theme-30`, which does not exist.
--
-- Verified before writing this: no row in `invitations` references theme_id
-- 30, so nothing points at the row being removed. The extra predicates below
-- keep that true at run time — if a real invitation somehow adopted id 30 in
-- the meantime, this deletes nothing instead of orphaning it.
delete from themes t
where t.id = 30
  and t.layout = 'opaline-pearl'
  and exists (select 1 from themes k where k.id = 20 and k.layout = 'opaline-pearl')
  and not exists (select 1 from invitations i where i.theme_id = 30);
