import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('xyzcompany') &&
  supabaseUrl.startsWith('https://')
)

// Inisialisasi client Supabase publik (menggunakan Anon Key)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

/**
 * Format tanggal dan waktu ke standar lokal Indonesia (WIB/WITA/WIT)
 * Contoh: "12 Okt 2026, 10:15:30 WIB"
 */
export function formatIndonesianDateTime(isoString) {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '-'

    // Gunakan format standar lokal Indonesia
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    }).format(date)
  } catch {
    return isoString
  }
}
