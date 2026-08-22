/**
 * ==========================================
 * THEMES & LAYOUTS
 * ==========================================
 */
export const THEMES = {
  WATERCOLOR_FLORAL: 'watercolor-floral',
  DARK_LUXURY: 'dark-luxury',
  MODERN_MINIMALIST: 'modern-minimalist',
  PLAYFUL_ILLUSTRATIVE: 'playful-illustrative',
  TRADITIONAL_ADAT: 'traditional-adat',
  SPECIAL_001: 'special-001',
  SPECIAL_002: 'special-002',
  SPECIAL_003: 'special-003',
  CINEMATIC_LUXURY: 'cinematic-luxury',
  MINANG_ELEGANT: 'minang-elegant',
  BORDEAUX_LUXE: 'bordeaux-luxe',
  CINEMATIC_SHADOW: 'cinematic-shadow',
  BOTANICAL_IVORY: 'botanical-ivory',
  AURUM_NOIR: 'aurum-noir',
  MORNING_MIST: 'morning-mist-luxe',
  ASHEN_BLOOM: 'ashen-bloom',
  BLANC_LUMIERE: 'blanc-lumiere',
  OPALINE_PEARL: 'opaline-pearl',
  VELOUR_OLIVE: 'velour-olive',
  BLUSH_PAVILION: 'blush-pavilion',
  GILDED_PALACE: 'gilded-palace',
  ROSE_SANCTUARY: 'rose-sanctuary',
  MEMORIES: 'memories',
}

export const THEME_CATEGORIES = {
  SPECIAL: 'special',
  ADAT: 'adat',
  LUXURY: 'luxury',
  MOTION_3D: '3d_motion'
}

export const THEME_CATEGORY_MAP = {
  [THEMES.WATERCOLOR_FLORAL]: THEME_CATEGORIES.SPECIAL,
  [THEMES.DARK_LUXURY]: THEME_CATEGORIES.LUXURY,
  [THEMES.MODERN_MINIMALIST]: THEME_CATEGORIES.SPECIAL,
  [THEMES.PLAYFUL_ILLUSTRATIVE]: THEME_CATEGORIES.MOTION_3D,
  [THEMES.TRADITIONAL_ADAT]: THEME_CATEGORIES.ADAT,
  [THEMES.SPECIAL_001]: THEME_CATEGORIES.SPECIAL,
  [THEMES.SPECIAL_002]: THEME_CATEGORIES.SPECIAL,
  [THEMES.SPECIAL_003]: THEME_CATEGORIES.SPECIAL,
  [THEMES.CINEMATIC_LUXURY]: THEME_CATEGORIES.LUXURY,
  [THEMES.MINANG_ELEGANT]: THEME_CATEGORIES.ADAT,
  [THEMES.BORDEAUX_LUXE]: THEME_CATEGORIES.LUXURY,
  [THEMES.CINEMATIC_SHADOW]: THEME_CATEGORIES.LUXURY,
  [THEMES.BOTANICAL_IVORY]: THEME_CATEGORIES.SPECIAL,
  [THEMES.AURUM_NOIR]: THEME_CATEGORIES.LUXURY,
  [THEMES.MORNING_MIST]: THEME_CATEGORIES.LUXURY,
  [THEMES.ASHEN_BLOOM]: THEME_CATEGORIES.SPECIAL,
  [THEMES.BLANC_LUMIERE]: THEME_CATEGORIES.SPECIAL,
  [THEMES.OPALINE_PEARL]: THEME_CATEGORIES.SPECIAL,
  [THEMES.VELOUR_OLIVE]: THEME_CATEGORIES.LUXURY,
  [THEMES.BLUSH_PAVILION]: THEME_CATEGORIES.MOTION_3D,
  [THEMES.GILDED_PALACE]: THEME_CATEGORIES.MOTION_3D,
  [THEMES.ROSE_SANCTUARY]: THEME_CATEGORIES.MOTION_3D,
  [THEMES.MEMORIES]: THEME_CATEGORIES.MOTION_3D,
}

/**
 * ==========================================
 * USER ROLES & PACKAGES
 * ==========================================
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

export const PACKAGE_TYPES = {
  NONE: 'none',
  FREE: 'free',
  PREMIUM: 'premium',
  EXCLUSIVE: 'exclusive'
}

/**
 * ==========================================
 * SYNC & EVENTS
 * ==========================================
 */
export const SYNC_EVENTS = {
  DATA_SYNC: 'INVITATION_DATA_SYNC',
  SAVING: 'INVITATION_SAVING',
  SAVED: 'INVITATION_SAVED',
  SAVE_ERROR: 'INVITATION_SAVE_ERROR',
  ADMIN_DEMO_CHANGED: 'admin-demo-changed',
  BROADCAST_CHANNEL: 'inviter_sync'
}

/**
 * ==========================================
 * STORAGE KEYS
 * ==========================================
 */
export const STORAGE_KEYS = {
  ADMIN_DEMO_MODE: 'inviter_admin_demo_mode',
  THEMES: 'inviter_themes',
  DELETED_THEMES: 'inviter_deleted_themes',
  PRICING: 'inviter_pricing',
  VOUCHERS: 'inviter_vouchers',
  TRANSACTIONS: 'inviter_transactions',
  ILLUSTRATIONS: 'inviter_illustrations'
}

/**
 * ==========================================
 * TRANSACTION STATUS
 * ==========================================
 */
export const TX_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
}

/**
 * ==========================================
 * PACKAGES & REFERRAL
 * ==========================================
 */
export const PACKAGE_NAMES = ['Special', 'Adat', 'Motion', 'Luxury']

// How many months a package stays active after payment is verified.
// Kept in one place so the duration rule isn't scattered/hardcoded.
export const PACKAGE_DURATION_MONTHS = 12

// Admin WhatsApp, used for manual transfers, withdrawals, and every
// "hubungi kami" link on the landing page.
//
// wa.me needs the number in international form with no leading +, spaces or
// dashes, so 0851-5760-0697 is stored as 62851…: the leading 0 is the domestic
// trunk prefix and is replaced by the country code, never kept alongside it.
//
// This constant already existed, but only ReferralPage imported it — the
// landing page had the old number typed out in seven separate files, which is
// why changing it used to mean hunting through the whole tree. Everything
// points here now; the next change is this one line.
export const ADMIN_WHATSAPP = '6285157600697'

// Same number formatted for reading. Kept beside the dialling form so the two
// cannot drift apart.
export const ADMIN_WHATSAPP_DISPLAY = '+62 851-5760-0697'

// Build a wa.me link, optionally with a prefilled message.
export const waLink = (text) =>
  `https://wa.me/${ADMIN_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}`

// Referral system config
export const REFERRAL_DISCOUNT_AMOUNT = 10000   // Rp discount for the buyer
export const REFERRAL_COMMISSION_RATE = 0.20     // 20% commission for referrer
export const REFERRAL_MIN_WITHDRAWAL  = 50000    // Minimum balance to withdraw
