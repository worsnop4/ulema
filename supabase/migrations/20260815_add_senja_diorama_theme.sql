-- Senja Diorama — the first theme in the Motion category.
--
-- Until now `pricing` carried a Motion row at Rp 140.000 while `themes` held
-- zero Motion rows, so the category was visible and priced with nothing in it
-- to buy. This is what fills it.
--
-- Seeded only now, at the end of the build, rather than alongside the first
-- part. A half-finished theme in this table is immediately selectable by a
-- paying customer — the catalog reads straight from here.
--
-- `do update` rather than `do nothing`, following 20260808: a `do nothing`
-- insert silently no-ops when the id is already taken and the theme then never
-- appears, which has already cost one debugging round. Safe to re-run.
--
-- Id 22 is the next free id (the table currently holds 7–21). It must match
-- DEFAULT_THEMES in src/data/defaultData.js — a mismatch between the two is
-- exactly what produced the duplicate Opaline Pearl row on 2026-08-10.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (22, 'Senja Diorama', 'MOT-001', '🌄', '/themes/Motion/theme-1/thumb.jpg', 'senja-diorama',
   '["#1A1526","#E8A87C","#D9A441"]',
   'Tema Motion panggung berlapis: langit senja, siluet bukit, barisan pohon, dan dedaunan depan bergerak dengan laju berbeda saat undangan digulir sehingga terbentuk kedalaman sungguhan. Seluruh geraknya dari transform CSS tanpa video sama sekali, jadi tetap ringan di ponsel.',
   'Motion', 'photo', true)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  emoji = excluded.emoji,
  thumbnail = excluded.thumbnail,
  layout = excluded.layout,
  colors = excluded.colors,
  description = excluded.description,
  category = excluded.category,
  theme_type = excluded.theme_type,
  visible = excluded.visible;
