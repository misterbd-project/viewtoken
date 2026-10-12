import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Database,
  Copy
} from 'lucide-react'
import { useRealtimeToken } from '../hooks/useRealtimeToken'
import { formatIndonesianDateTime } from '../lib/supabase'

export default function AdminPage() {
  const {
    token: currentLiveToken,
    updatedAt: currentLiveUpdatedAt,
    status: connectionStatus,
    refetch
  } = useRealtimeToken()

  // State form
  const [tokenInput, setTokenInput] = useState('')
  const [adminSecret, setAdminSecret] = useState(() => {
    return localStorage.getItem('token_display_admin_secret') || ''
  })
  const [showSecret, setShowSecret] = useState(false)
  const [rememberSecret, setRememberSecret] = useState(true)

  // Status proses penyimpanan
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastSavedInfo, setLastSavedInfo] = useState(null)

  // Inisialisasi awal tokenInput satu kali saat data pertama datang
  const hasLoadedInitialToken = useRef(false)
  useEffect(() => {
    if (currentLiveToken && !hasLoadedInitialToken.current) {
      hasLoadedInitialToken.current = true
      setTokenInput(currentLiveToken)
    }
  }, [currentLiveToken])

  // Simpan secret di localStorage jika opsi remember aktif
  useEffect(() => {
    if (rememberSecret && adminSecret) {
      localStorage.setItem('token_display_admin_secret', adminSecret)
    } else if (!rememberSecret) {
      localStorage.removeItem('token_display_admin_secret')
    }
  }, [adminSecret, rememberSecret])

  // Handler Submit Token
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset notifikasi sebelumnya
    setSuccessMessage('')
    setErrorMessage('')

    const trimmedToken = tokenInput.trim()

    // Validasi 1: Token tidak boleh kosong atau hanya spasi
    if (!trimmedToken) {
      setErrorMessage('Token tidak boleh kosong atau hanya berisi spasi.')
      return
    }

    // Validasi 2: Admin secret wajib diisi
    if (!adminSecret.trim()) {
      setErrorMessage('Kunci Akses Admin (ADMIN_SECRET) wajib diisi untuk menyimpan token.')
      return
    }

    setIsSubmitting(true)

    try {
      // Panggil endpoint server-side /api/token
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret.trim()}`,
          'x-admin-secret': adminSecret.trim()
        },
        body: JSON.stringify({
          token: trimmedToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Gagal menyimpan token (Status: ${response.status})`)
      }

      // Berhasil disimpan
      setSuccessMessage('Token berhasil diperbarui!')
      setLastSavedInfo({
        token: trimmedToken,
        updatedAt: data.data?.updated_at || new Date().toISOString()
      })

      // Sinkronkan ulang state realtime jika perlu
      if (refetch) {
        refetch()
      }

      // Sembunyikan notifikasi sukses otomatis setelah 4 detik
      setTimeout(() => {
        setSuccessMessage('')
      }, 4000)
    } catch (err) {
      console.error('Error saving token:', err)
      setErrorMessage(err.message || 'Terjadi kesalahan jaringan saat menyimpan token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 lg:p-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Tombol Kembali & Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Indikator Status Database */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            <span
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono">
              {connectionStatus === 'connected' ? 'DB Real-Time' : 'DB Menghubungkan'}
            </span>
          </div>
        </div>

        {/* Header Panel Admin */}
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/10 text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Panel Admin
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Input token aktif baru. Token akan langsung disinkronkan ke seluruh layar Client yang terhubung.
          </p>
        </div>

        {/* Notifikasi Sukses */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">{successMessage}</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Perubahan telah dikirim ke database Supabase dan disiarkan ke semua Client.
              </p>
            </div>
          </div>
        )}

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold text-sm">Gagal Menyimpan Token</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Input Token */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Token */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="token-input"
                  className="block text-sm font-bold text-slate-200 uppercase tracking-wide"
                >
                  Masukkan Token <span className="text-rose-400">*</span>
                </label>
                {currentLiveToken && (
                  <button
                    type="button"
                    onClick={() => setTokenInput(currentLiveToken)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Gunakan token saat ini ({currentLiveToken})</span>
                  </button>
                )}
              </div>
              <input
                id="token-input"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Contoh: A-042 atau 1089"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3.5 text-lg font-bold text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                autoComplete="off"
                maxLength={100}
              />
              <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                <span>Dapat berupa teks huruf atau angka</span>
                <span>{tokenInput.length}/100 karakter</span>
              </div>
            </div>

            {/* Input Kunci Akses Admin (Keamanan Serverless) */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-secret-input"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Kunci Akses Admin (ADMIN_SECRET)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                >
                  {showSecret ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Lihat
                    </>
                  )}
                </button>
              </div>

              <input
                id="admin-secret-input"
                type={showSecret ? 'text' : 'password'}
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Masukkan nilai ADMIN_SECRET yang dikonfigurasi di server"
                disabled={isSubmitting}
                className="w-full rounded border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSecret}
                    onChange={(e) => setRememberSecret(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <span>Ingat kunci akses di browser ini</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Diverifikasi langsung oleh Vercel Function
                </span>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-save-token"
                disabled={isSubmitting || !tokenInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Simpan Token</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Informasi Token Terakhir yang Disimpan */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Informasi Token Terakhir</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                Token Aktif di Database
              </span>
              <span className="block font-mono text-xl font-black text-indigo-400 truncate">
                {lastSavedInfo?.token || currentLiveToken || 'Belum ada token'}
              </span>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                Waktu Terakhir Diperbarui
              </span>
              <span className="block text-sm font-semibold text-slate-200">
                {lastSavedInfo?.updatedAt
                  ? formatIndonesianDateTime(lastSavedInfo.updatedAt)
                  : currentLiveUpdatedAt
                  ? formatIndonesianDateTime(currentLiveUpdatedAt)
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Keamanan Bawah */}
      <div className="mx-auto mt-10 w-full max-w-3xl text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <Database className="h-3.5 w-3.5 text-slate-400" />
        <span>
          Penyimpanan token menggunakan atomic upsert Supabase PostgreSQL dengan single-row pattern (ID=1).
        </span>
      </div>
    </div>
  )
}
