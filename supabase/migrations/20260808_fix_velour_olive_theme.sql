-- Corrective fix: 20260807_add_velour_olive_theme.sql used
-- `on conflict (id) do nothing`, so if id 21 was still occupied by the
-- (now-removed) "Tema Draft" scaffold row — visible=false — the insert
-- silently no-op'd and Velour Olive never actually landed in the table.
-- This uses `do update` instead, so it forces id 21 to be Velour Olive
-- (visible=true) no matter what was there before. Safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (21, 'Velour Olive', 'LUX-007', '🎭', '/themes/Luxury/theme-4/bg-hero-poster.jpg', 'velour-olive',
   '["#14150F","#D9BC7A","#F4EFE6"]',
   'Tema Luxury "panggung pelaminan": latar video kain velvet olive yang diam saat konten di-scroll, cover tersibak dua kain velvet, navigasi scroll-snap fullscreen dengan rail titik, ornamen emas & kelopak berjatuhan',
   'Luxury', 'video', true)
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
