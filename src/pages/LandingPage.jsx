import React from 'react'
import { Sliders, Monitor, ShieldCheck, Zap } from 'lucide-react'
import NavigationCard from '../components/NavigationCard'
import { useRealtimeToken } from '../hooks/useRealtimeToken'

const CURRENT_YEAR = new Date().getFullYear()

export default function LandingPage() {
  const { token, status } = useRealtimeToken()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 lg:p-12 selection:bg-indigo-500 selection:text-white">
      {/* Header Utama */}
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xl shadow-lg shadow-indigo-600/30">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Token Display</h1>
            <p className="text-xs text-slate-400 font-medium">Sistem Informasi Token Real-Time</p>
          </div>
        </div>

        {/* Status Indikator Header */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300">
          <span
            className={`h-2 w-2 rounded-full ${
              status === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : status === 'connecting'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-rose-400'
            }`}
          />
          <span className="font-medium">
            {status === 'connected'
              ? 'Real-Time Aktif'
              : status === 'connecting'
              ? 'Menghubungkan...'
              : 'Offline / Standby'}
          </span>
        </div>
      </header>

      {/* Konten Tengah: Hero & Navigation Cards */}
      <main className="mx-auto w-full max-w-5xl py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-4">
            <Zap className="h-3.5 w-3.5" />
            <span>Sinkronisasi Instan Supabase Realtime</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Pusat Pengelolaan & Tampilan Token
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Perbarui nomor antrean atau kode token dari panel Admin dan saksikan perubahan langsung muncul seketika di seluruh layar Client tanpa reload.
          </p>

          {/* Mini Preview Token Saat Ini */}
          {token && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-2.5 shadow-inner">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Token Aktif:
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-indigo-400">
                {token}
              </span>
            </div>
          )}
        </div>

        {/* Dua Card Navigasi Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card Admin */}
          <NavigationCard
            id="nav-admin"
            icon={Sliders}
            badgeText="Kontrol"
            title="Admin"
            description="Input dan perbarui token aktif. Dilengkapi proteksi serverless secret dan validasi instan."
            buttonText="Buka Admin"
            to="/admin"
            variant="accent"
          />

          {/* Card Client */}
          <NavigationCard
            id="nav-client"
            icon={Monitor}
            badgeText="Tampilan Layar"
            title="Client"
            description="Lihat token terbaru secara real-time dengan tipografi besar berdaya baca tinggi dari jarak jauh."
            buttonText="Buka Client"
            to="/client"
            variant="default"
          />
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="mx-auto w-full max-w-5xl border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Aman dengan Verifikasi Server-Side Vercel Functions</span>
        </div>
        <p>&copy; {CURRENT_YEAR} Token Display. All rights reserved.</p>
      </footer>
    </div>
  )
}
