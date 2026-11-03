import React, { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

export default function RealtimeClock({ className = '' }) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format jam, menit, detik dua digit
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')

  // Format hari dan tanggal lengkap bahasa Indonesia
  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)
  const fullDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(time)

  // Ambil zona waktu lokal (WIB/WITA/WIT)
  const timeZone = new Intl.DateTimeFormat('id-ID', {
    timeZoneName: 'short'
  }).formatToParts(time).find(part => part.type === 'timeZoneName')?.value || 'WIB'

  // Persentase detik untuk animasi progress bar halus
  const secondProgress = (time.getSeconds() / 59) * 100

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/80 px-6 py-4 sm:px-10 sm:py-6 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 transition-all ${className}`}
    >
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-indigo-500/15 blur-2xl" />

      {/* Baris Atas: Hari & Tanggal Lengkap */}
      <div className="relative z-10 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold text-slate-300">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
        <span className="capitalize text-slate-100">{dayName},</span>
        <span className="text-slate-300 font-medium">{fullDate}</span>
      </div>

      {/* Baris Utama: Jam Digital Ukuran Besar dengan Animasi */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
        {/* Ikon Jam dengan Indikator Real-Time Active */}
        <div className="relative flex items-center justify-center mr-1 sm:mr-2">
          <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400 animate-[spin_60s_linear_infinite]" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        </div>

        {/* Display Angka Jam:Menit Ekstra Besar */}
        <div className="flex items-center font-mono font-black tracking-tight text-white select-none">
          {/* Jam */}
          <span
            className="text-4xl sm:text-6xl md:text-7xl tabular-nums text-slate-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
          >
            {hours}
          </span>

          {/* Titik Dua Berkedip Halus */}
          <span className="mx-1 sm:mx-2 text-3xl sm:text-5xl md:text-6xl text-indigo-400 animate-pulse font-extrabold select-none">
            :
          </span>

          {/* Menit */}
          <span
            className="text-4xl sm:text-6xl md:text-7xl tabular-nums text-slate-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
          >
            {minutes}
          </span>

          {/* Titik Dua Kedua */}
          <span className="mx-1 sm:mx-2 text-3xl sm:text-5xl md:text-6xl text-indigo-400 animate-pulse font-extrabold select-none">
            :
          </span>

          {/* Badge Detik Besar dengan Animasi Berdenyut Glow */}
          <div
            key={seconds}
            className="inline-flex items-center justify-center rounded-xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 to-indigo-900/40 px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] animate-[pulse_1s_ease-in-out_infinite]"
          >
            <span className="text-3xl sm:text-5xl md:text-6xl font-black tabular-nums text-indigo-200">
              {seconds}
            </span>
          </div>

          {/* Zona Waktu */}
          <span className="ml-2 sm:ml-3 rounded-md border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs sm:text-sm font-bold tracking-wider text-slate-300">
            {timeZone}
          </span>
        </div>
      </div>

      {/* Bar Kemajuan Detik (0 - 59 Detik) di bagian bawah */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-800/60">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          style={{ width: `${secondProgress}%` }}
        />
      </div>
    </div>
  )
}
