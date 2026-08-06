-- Add the "Velour Olive" theme (id 21) to the shared themes table.
-- Themes are DB-authoritative (20260718_themes_to_db.sql), so a new bespoke
-- theme must be inserted here to appear in the catalog for everyone.
-- Idempotent: safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (21, 'Velour Olive', 'LUX-007', '🎭', '/themes/Luxury/theme-4/bg-hero-poster.jpg', 'velour-olive',
   '["#14150F","#D9BC7A","#F4EFE6"]',
   'Tema Luxury "panggung pelaminan": latar video kain velvet olive yang diam saat konten di-scroll, cover tersibak dua kain velvet, navigasi scroll-snap fullscreen dengan rail titik, ornamen emas & kelopak berjatuhan',
   'Luxury', 'video')
on conflict (id) do nothing;
