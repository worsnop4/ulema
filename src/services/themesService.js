import { supabase } from '../lib/supabase'

// Theme presets live in Supabase (source of truth) so admin edits/deletions
// reach every visitor, not just the browser that made them. The app keeps a
// localStorage cache for instant/synchronous reads; these helpers sync it.
// Components fall back to DEFAULT_THEMES if the table isn't reachable yet
// (e.g. before the migration runs).

// DB row (snake_case) → app theme shape (camelCase). Omits empty optionals so
// the object matches DEFAULT_THEMES entries.
function toApp(r) {
  const t = {
    id: r.id,
    name: r.name,
    emoji: r.emoji || '',
    thumbnail: r.thumbnail || '',
    layout: r.layout,
    colors: Array.isArray(r.colors) ? r.colors : [],
    desc: r.description || '',
    category: r.category || 'Special',
    visible: r.visible !== false,
  }
  if (r.code) t.code = r.code
  if (r.theme_type) t.themeType = r.theme_type
  return t
}

// App theme shape → DB row.
function toRow(t) {
  return {
    id: t.id,
    name: t.name,
    code: t.code || null,
    emoji: t.emoji || '',
    thumbnail: t.thumbnail || '',
    layout: t.layout,
    colors: t.colors || [],
    description: t.desc || '',
    category: t.category || 'Special',
    theme_type: t.themeType || null,
    visible: t.visible !== false,
  }
}

/** Read the full preset list (public-readable). Ordered by id so the built-in
 *  themes (1..16) come first, then admin-added ones. */
export async function fetchThemesDB() {
  const { data, error } = await supabase.from('themes').select('*').order('id', { ascending: true })
  if (error) return { data: null, error }
  return { data: (data || []).map(toApp), error: null }
}

/** Insert or update a single theme (admin only, enforced by RLS). */
export async function upsertThemeDB(theme) {
  const { error } = await supabase.from('themes').upsert(toRow(theme), { onConflict: 'id' })
  return { error }
}

/** Delete a theme for everyone (admin only, enforced by RLS). */
export async function deleteThemeDB(id) {
  const { error } = await supabase.from('themes').delete().eq('id', id)
  return { error }
}
