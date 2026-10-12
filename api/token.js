import { createClient } from '@supabase/supabase-js'

/**
 * Logika handler untuk Vercel Serverless Function & Vite dev middleware
 * Menangani penyimpanan token aktif secara aman di server menggunakan SUPABASE_SERVICE_ROLE_KEY
 * dan memverifikasi ADMIN_SECRET.
 */
export async function handleTokenRequest(req, res) {
  // Tangani CORS jika dipanggil lintas origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminSecret = process.env.ADMIN_SECRET

  // 1. GET: Ambil token aktif saat ini (bisa diakses publik atau untuk verifikasi)
  if (req.method === 'GET') {
    if (!supabaseUrl) {
      return res.status(500).json({ error: 'Supabase URL belum dikonfigurasi pada server.' })
    }

    const keyToUse = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    if (!keyToUse) {
      return res.status(500).json({ error: 'Supabase Key belum dikonfigurasi pada server.' })
    }

    try {
      const supabase = createClient(supabaseUrl, keyToUse)
      const { data, error } = await supabase
        .from('active_token')
        .select('id, token, updated_at')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        return res.status(500).json({ error: 'Gagal mengambil token dari database: ' + error.message })
      }

      return res.status(200).json({
        token: data?.token || null,
        updated_at: data?.updated_at || null
      })
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error: ' + err.message })
    }
  }

  // 2. POST: Update token baru oleh Admin
  if (req.method === 'POST') {
    // Verifikasi konfigurasi server
    if (!adminSecret) {
      return res.status(500).json({
        error: 'ADMIN_SECRET belum dikonfigurasi di Environment Variables server. Hubungi pengelola sistem.'
      })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: 'SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.'
      })
    }

    // Ambil secret dari header (Authorization: Bearer <secret> ATAU x-admin-secret: <secret>)
    const authHeader = req.headers['authorization'] || ''
    const customHeader = req.headers['x-admin-secret'] || ''
    let providedSecret = ''

    if (authHeader.startsWith('Bearer ')) {
      providedSecret = authHeader.slice(7).trim()
    } else if (customHeader) {
      providedSecret = customHeader.trim()
    }

    // Validasi Secret Admin
    if (!providedSecret || providedSecret !== adminSecret) {
      return res.status(401).json({
        error: 'Akses ditolak: Kunci Admin (ADMIN_SECRET) tidak valid atau belum diisi.'
      })
    }

    // Ambil dan validasi payload token
    const body = req.body || {}
    const rawToken = body.token

    if (rawToken === undefined || rawToken === null) {
      return res.status(400).json({
        error: 'Field token wajib diisi.'
      })
    }

    const token = String(rawToken).trim()

    if (token.length === 0) {
      return res.status(400).json({
        error: 'Token tidak boleh kosong atau hanya berisi spasi.'
      })
    }

    // Batasan panjang token untuk keamanan dan integritas tampilan
    const MAX_TOKEN_LENGTH = 100
    if (token.length > MAX_TOKEN_LENGTH) {
      return res.status(400).json({
        error: `Panjang token melebihi batas maksimal (${MAX_TOKEN_LENGTH} karakter).`
      })
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })

      const now = new Date().toISOString()

      // Operasi upsert record id=1 pada tabel active_token
      const { data, error } = await supabase
        .from('active_token')
        .upsert(
          {
            id: 1,
            token: token,
            updated_at: now
          },
          { onConflict: 'id' }
        )
        .select('id, token, updated_at')
        .single()

      if (error) {
        return res.status(500).json({
          error: 'Gagal memperbarui token di database: ' + error.message
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Token berhasil diperbarui',
        data: {
          token: data.token,
          updated_at: data.updated_at
        }
      })
    } catch (err) {
      console.error('Database update error:', err)
      return res.status(500).json({
        error: 'Terjadi kesalahan sistem saat memperbarui token.'
      })
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}

// Handler standar Vercel Serverless Function
export default async function handler(req, res) {
  return handleTokenRequest(req, res)
}
