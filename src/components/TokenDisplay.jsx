import React from 'react'
import { formatIndonesianDateTime } from '../lib/supabase'
import { Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react'

export default function TokenDisplay({
  token,
  updatedAt,
  status,
  error,
  onReconnect
}) {
  // Konfigurasi visual status koneksi
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Wifi className="h-3.5 w-3.5" />
            <span>TERHUBUNG REAL-TIME</span>
          </div>
        )
      case 'connecting':
        return (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
            </span>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>MENGHUBUNGKAN...</span>
          </div>
        )
      case 'disconnected':
      case 'unconfigured':
      default:
        return (
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <WifiOff className="h-3.5 w-3.5" />
            <span>KONEKSI TERPUTUS</span>
          </div>
        )
    }
  }

  const hasToken = Boolean(token && String(token).trim().length > 0)

  return (
    <div className="flex w-full flex-col items-center justify-center text-center">
      {/* Status Koneksi */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-3">
        {getStatusBadge()}
        {status === 'disconnected' && onReconnect && (
          <button
            onClick={onReconnect}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <RefreshCw className="h-3 w-3" />
            Hubungkan Ulang
          </button>
        )}
      </div>

      {/* Label Judul Kecil */}
      <div className="mb-3">
        <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-slate-400 uppercase">
          TOKEN SAAT INI
        </span>
      </div>

      {/* Area Tampilan Token Utama (Sangat Luas, Font Ekstra Besar, Responsif, Bebas Overflow) */}
      <div
        className="w-full max-w-7xl px-4 py-8 sm:py-12 flex items-center justify-center"
        style={{ minHeight: '38vh' }}
      >
        {hasToken ? (
          <div
            key={token}
            className="font-black tracking-tight text-white select-all transition-all duration-300 scale-100 opacity-100"
            style={{
              fontSize: 'clamp(3rem, 14vw, 11rem)',
              lineHeight: 1.05,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              textShadow: '0 0 40px rgba(99, 102, 241, 0.25)'
            }}
          >
            {token}
          </div>
        ) : (
          <div
            className="font-bold tracking-widest text-slate-500 animate-pulse select-none"
            style={{
              fontSize: 'clamp(1.75rem, 6vw, 4.5rem)',
              lineHeight: 1.2
            }}
          >
            MENUNGGU TOKEN
          </div>
        )}
      </div>

      {/* Waktu Pembaruan Terakhir */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-400">
        <Clock className="h-4 w-4 text-slate-500" />
        <span>Terakhir Diperbarui:</span>
        <span className="font-semibold text-slate-200">
          {updatedAt ? formatIndonesianDateTime(updatedAt) : 'Belum pernah diperbarui'}
        </span>
      </div>

      {/* Banner Notifikasi Error jika ada */}
      {error && (
        <div className="mt-6 max-w-lg rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      )}
    </div>
  )
}
