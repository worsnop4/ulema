-- ═══════════════════════════════════════════════════════════════════
--  THEMES PRESETS → SUPABASE  ("Tahap 2")
--  Theme presets (name/desc/colors/thumbnail/layout/category/pricing tier)
--  used to live only in each browser's localStorage, so admin edits &
--  deletions never reached other visitors. Move them to a shared table:
--   * public (anon) can READ  → landing catalog + editor theme picker,
--   * only admins can INSERT/UPDATE/DELETE (same rule as pricing/vouchers).
--  The app keeps localStorage as a fast fallback cache; this table is the
--  source of truth once it's reachable.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists themes (
  id          bigint primary key,          -- app-level theme id (1..16, then Date.now())
  name        text not null,
  code        text,
  emoji       text default '',
  thumbnail   text default '',
  layout      text not null,
  colors      jsonb not null default '[]'::jsonb,
  description text default '',
  category    text not null default 'Special',
  theme_type  text,
  created_at  timestamptz default now()
);

alter table themes enable row level security;

drop policy if exists "Public can read themes" on themes;
create policy "Public can read themes" on themes for select using (true);

drop policy if exists "Admins manage themes" on themes;
create policy "Admins manage themes" on themes for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Seed from the app's DEFAULT_THEMES. Idempotent: re-running keeps any
--    admin edits (ON CONFLICT DO NOTHING). Delete a row here to remove a
--    default permanently for everyone.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (1,  'Classic Elegance',         null,      '🌿', '/images/themes/watercolor.png',   'watercolor-floral',    '["#134e4a","#d4a96a","#faf7f2"]', 'Tema teal elegan dengan sentuhan emas',                                                        'Special', null),
  (2,  'Rose Garden',              null,      '🌹', '/images/themes/watercolor.png',   'watercolor-floral',    '["#881337","#fda4af","#fff1f2"]', 'Tema mawar merah muda yang romantis',                                                          'Special', null),
  (3,  'Midnight Gold',            null,      '✨', '/images/themes/darkluxury.png',   'dark-luxury',          '["#1c1917","#d4a96a","#faf7f2"]', 'Tema gelap mewah dengan aksen emas',                                                           'Luxury',  null),
  (4,  'Ivory Dream',              null,      '🕊️', '/images/themes/minimalist.png',   'modern-minimalist',    '["#4b5563","#d4b896","#fdfaf6"]', 'Tema bersih minimalis dengan krem hangat',                                                     'Special', null),
  (5,  'Lavender Bliss',           null,      '💜', '/images/themes/playful.png',      'playful-illustrative', '["#4c1d95","#c4b5fd","#f5f3ff"]', 'Tema ungu lembut yang menawan',                                                                'Motion',  null),
  (6,  'Tropical Breeze',          null,      '🌺', '/images/themes/adat.png',         'traditional-adat',     '["#064e3b","#6ee7b7","#f0fdf4"]', 'Tema hijau tropis segar',                                                                      'Adat',    null),
  (7,  'Autumn Florals',           'SPL-001', '🍃', '/images/themes/autumn.png',       'special-001',          '["#6b705c","#d4a373","#fefae0"]', 'Tema estetik elegan dengan ornamen daun lembut',                                               'Special', null),
  (8,  'Aestetic Grey',            'SPL-002', '🩶', '/images/themes/autumn.png',       'special-002',          '["#4b5563","#9ca3af","#f3f4f6"]', 'Tema estetik abu-abu minimalis elegan',                                                        'Special', null),
  (9,  'Elegant Person',           'SPL-003', '🌸', '/images/themes/autumn.png',       'special-003',          '["#6b705c","#d4a373","#fefae0"]', 'Tema elegan dengan bingkai foto khusus',                                                       'Special', null),
  (10, 'Cinematic Luxury (Photo)', 'LUX-001', '🎞️', '/images/themes/darkluxury.png',   'cinematic-luxury',     '["#0c0c0c","#ddc497","#ffffff"]', 'Tema cinematic mewah dengan background foto',                                                  'Luxury',  'photo'),
  (11, 'Cinematic Luxury (Video)', 'LUX-002', '🎥', '/images/themes/darkluxury.png',   'cinematic-luxury',     '["#0c0c0c","#ddc497","#ffffff"]', 'Tema cinematic mewah dengan background video animasi',                                          'Luxury',  'video'),
  (12, 'Minang Elegant',           'ADT-001', '👑', '/images/themes/adat.png',         'minang-elegant',       '["#1a0f0a","#c0872a","#8b1a1a"]', 'Tema adat Minangkabau premium dengan nuansa gelap elegan',                                     'Adat',    null),
  (13, 'Bordeaux Luxe',            'LUX-003', '🍷', '/images/themes/darkluxury.png',   'bordeaux-luxe',        '["#4b0f28","#c9a24b","#faf3ea"]', 'Tema luxury wine-burgundy dengan aksen emas & video background sinematik',                      'Luxury',  'video'),
  (14, 'Cinematic Shadow',         'LUX-004', '🌳', '/images/themes/darkluxury.png',   'cinematic-shadow',     '["#1a1a1a","#c9a96e","#f5f0e8"]', 'Tema luxury dark elegant dengan video background, siluet shadow tree, dan tipografi serif besar', 'Luxury', 'video'),
  (15, 'Botanical Ivory',          'SPL-004', '🌿', '/themes/Special/theme-10/bg2.jpg', 'botanical-ivory',      '["#3d4a3a","#c9a24b","#faf7f2"]', 'Tema ivory-sage lembut dengan aksen emas, tipografi serif elegan, dan ornamen garis minimalis','Special', null),
  (16, 'Aurum Noir',               'LUX-005', '🖤', '',                                'aurum-noir',           '["#0a0807","#d4a96a","#f4ede2"]', 'Tema cinematic dark luxury hitam & emas: cover sinematik, Ken Burns, partikel emas, countdown flip, dan tipografi Cormorant elegan', 'Luxury', 'photo')
on conflict (id) do nothing;
