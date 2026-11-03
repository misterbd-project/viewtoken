import React, { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

export default function RealtimeClock({ className = '' }) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    // Sinkronisasi update setiap detik
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format jam, menit, detik dua digit
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')

  // Format hari dan tanggal bahasa Indonesia
  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)
  const fullDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(time)

  // Ambil singkatan zona waktu lokal (misal: WIB, WITA, WIT, atau GMT offset)
  const timeZone = new Intl.DateTimeFormat('id-ID', {
    timeZoneName: 'short'
  }).formatToParts(time).find(part => part.type === 'timeZoneName')?.value || 'WIB'

  // Persentase detik untuk animasi progress bar halus
  const secondProgress = (time.getSeconds() / 59) * 100

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70 px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md shadow-lg shadow-indigo-950/20 transition-all ${className}`}
      title="Jam Realtime Monitor"
    >
      {/* Background Glow Halus */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-indigo-500/10 blur-xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        {/* Kolom Hari & Tanggal */}
        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-right border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-1.5 sm:pb-0 sm:pr-4">
          <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 sm:gap-0 leading-tight">
            <span className="font-semibold text-slate-200 capitalize">{dayName},</span>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{fullDate}</span>
          </div>
        </div>

        {/* Kolom Display Jam Realtime & Animasi Detik */}
        <div className="flex items-center gap-2">
          {/* Ikon Clock dengan efek detak / radar live */}
          <div className="relative flex items-center justify-center">
            <Clock className="h-4 w-4 text-indigo-400 animate-[spin_60s_linear_infinite]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>

          {/* Jam : Menit : Detik */}
          <div className="flex items-center font-mono font-bold tracking-tight text-white select-none">
            {/* Jam */}
            <span className="text-base sm:text-lg tabular-nums text-slate-100">{hours}</span>

            {/* Titik dua berkedip (blinking colon animation) */}
            <span className="mx-0.5 text-base sm:text-lg text-indigo-400 animate-pulse font-extrabold">:</span>

            {/* Menit */}
            <span className="text-base sm:text-lg tabular-nums text-slate-100">{minutes}</span>

            {/* Titik dua kedua berkedip */}
            <span className="mx-0.5 text-base sm:text-lg text-indigo-400 animate-pulse font-extrabold">:</span>

            {/* Badge Detik yang menyala dan berubah dinamis */}
            <div
              key={seconds}
              className="ml-1 inline-flex items-center justify-center rounded-md border border-indigo-500/40 bg-indigo-500/10 px-1.5 py-0.5 text-xs sm:text-sm font-black text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all animate-[pulse_1s_ease-in-out_infinite]"
            >
              <span className="tabular-nums">{seconds}</span>
            </div>

            {/* Zona Waktu */}
            <span className="ml-2 text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider">
              {timeZone}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Kemajuan Detik Mini (0 - 59 Detik) di bagian paling bawah */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-800/40">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          style={{ width: `${secondProgress}%` }}
        />
      </div>
    </div>
  )
}
